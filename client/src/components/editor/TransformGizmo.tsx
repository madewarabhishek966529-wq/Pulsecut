import { useState, useEffect, useRef } from "react";
import type { Clip } from "@/types/timeline";

interface TransformGizmoProps {
  clip: Clip;
  projectWidth: number;
  projectHeight: number;
  stageRect: { width: number; height: number; left: number; top: number };
  onTransformChange: (patch: Partial<Clip["transform"]>) => void;
  onTransformCommit: (patch: Partial<Clip["transform"]>) => void;
}

export function TransformGizmo({
  clip,
  projectWidth,
  projectHeight,
  stageRect,
  onTransformChange,
  onTransformCommit,
}: TransformGizmoProps) {
  const transform = clip.transform || {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
  };

  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [showSnapX, setShowSnapX] = useState(false);
  const [showSnapY, setShowSnapY] = useState(false);

  // Gesture initial state ref for single undo step on gesture end
  const gestureStartRef = useRef<{
    startX: number;
    startY: number;
    origTransform: Clip["transform"];
  } | null>(null);

  // Scaling factor from project space (e.g. 1080x1920) to stage screen pixels
  const scaleFactor = Math.min(
    stageRect.width / projectWidth,
    stageRect.height / projectHeight
  );

  // Visual dimensions on screen
  const boxWidth = projectWidth * scaleFactor * transform.scale;
  const boxHeight = projectHeight * scaleFactor * transform.scale;

  // Center position of the box relative to stage center
  const centerX = stageRect.width / 2 + transform.x * scaleFactor;
  const centerY = stageRect.height / 2 + transform.y * scaleFactor;

  // Arrow key nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        const next = {
          x: transform.x + dx,
          y: transform.y + dy,
        };
        onTransformCommit(next);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [transform, onTransformCommit]);

  const handlePointerDown = (e: React.PointerEvent, handleType: string) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setIsDragging(true);
    setActiveHandle(handleType);

    gestureStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origTransform: { ...transform },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !gestureStartRef.current) return;

    const { startX, startY, origTransform } = gestureStartRef.current;
    const deltaX = (e.clientX - startX) / scaleFactor;
    const deltaY = (e.clientY - startY) / scaleFactor;

    if (activeHandle === "move") {
      let targetX = origTransform.x + deltaX;
      let targetY = origTransform.y + deltaY;

      // Snapping to center with 6px threshold
      const snapThreshold = 6 / scaleFactor;
      if (Math.abs(targetX) < snapThreshold) {
        targetX = 0;
        setShowSnapX(true);
      } else {
        setShowSnapX(false);
      }

      if (Math.abs(targetY) < snapThreshold) {
        targetY = 0;
        setShowSnapY(true);
      } else {
        setShowSnapY(false);
      }

      onTransformChange({ x: Math.round(targetX), y: Math.round(targetY) });
    } else if (activeHandle === "rotate") {
      // Angle relative to center of box
      const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
      if (rect) {
        const boxScreenX = rect.left + rect.width / 2;
        const boxScreenY = rect.top + rect.height / 2;
        const rad = Math.atan2(e.clientY - boxScreenY, e.clientX - boxScreenX);
        const deg = (rad * 180) / Math.PI + 90; // Top handle is 0 deg
        onTransformChange({ rotation: Math.round(deg % 360) });
      }
    } else if (activeHandle?.startsWith("scale")) {
      // Scale based on diagonal drag distance
      const dist = (deltaX + deltaY) / 200;
      const newScale = Math.max(0.1, Math.min(4.0, origTransform.scale + dist));
      onTransformChange({ scale: Number(newScale.toFixed(3)) });
    }
  };

  const handlePointerUp = () => {
    if (isDragging && gestureStartRef.current) {
      setIsDragging(false);
      setActiveHandle(null);
      setShowSnapX(false);
      setShowSnapY(false);
      onTransformCommit(transform);
      gestureStartRef.current = null;
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ width: stageRect.width, height: stageRect.height }}
    >
      {/* Center Snapping Guidelines */}
      {showSnapX && (
        <div
          className="absolute top-0 bottom-0 w-px bg-[#E05A2B] shadow-[0_0_8px_#E05A2B] z-40 pointer-events-none"
          style={{ left: stageRect.width / 2 }}
        />
      )}
      {showSnapY && (
        <div
          className="absolute left-0 right-0 h-px bg-[#E05A2B] shadow-[0_0_8px_#E05A2B] z-40 pointer-events-none"
          style={{ top: stageRect.height / 2 }}
        />
      )}

      {/* Main Gizmo Bounding Box */}
      <div
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: boxWidth,
          height: boxHeight,
          left: centerX - boxWidth / 2,
          top: centerY - boxHeight / 2,
          transform: `rotate(${transform.rotation}deg)`,
          opacity: transform.opacity,
        }}
        className="absolute pointer-events-auto border-2 border-[#E05A2B] cursor-move shadow-[0_0_15px_rgba(224,90,43,0.3)] transition-[border-color]"
        onPointerDown={(e) => handlePointerDown(e, "move")}
      >
        {/* Rotation Handle (Top Stick) */}
        <div
          onPointerDown={(e) => handlePointerDown(e, "rotate")}
          className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#121318] border-2 border-[#E05A2B] cursor-grab active:cursor-grabbing hover:scale-125 transition-transform flex items-center justify-center shadow-md"
          title="Drag to rotate"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#E05A2B]" />
        </div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#E05A2B] pointer-events-none" />

        {/* 4 Corner Scale Handles */}
        <div
          onPointerDown={(e) => handlePointerDown(e, "scale-tl")}
          className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#E05A2B] rounded-xs cursor-nwse-resize shadow-md"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, "scale-tr")}
          className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#E05A2B] rounded-xs cursor-nesw-resize shadow-md"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, "scale-bl")}
          className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#E05A2B] rounded-xs cursor-nesw-resize shadow-md"
        />
        <div
          onPointerDown={(e) => handlePointerDown(e, "scale-br")}
          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#E05A2B] rounded-xs cursor-nwse-resize shadow-md"
        />
      </div>
    </div>
  );
}
