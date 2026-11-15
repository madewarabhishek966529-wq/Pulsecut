import { useEffect, useRef, useState } from "react";
import { PulsecutRenderer } from "@/lib/renderer";
import { useTimelineStore } from "@/store/timelineStore";
import { TransformGizmo } from "./TransformGizmo";

export function PreviewCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<PulsecutRenderer | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [stageRect, setStageRect] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const timeline = useTimelineStore((s) => s.timeline);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);
  const setPlaying = useTimelineStore((s) => s.setPlaying);
  const updateClipTransform = useTimelineStore((s) => s.updateClipTransform);

  const duration = timeline.project.duration;
  const hasAssets = timeline.assets.length > 0;

  // Track selected clip if active at currentTime
  const selectedClip = timeline.tracks
    .flatMap((t) => t.clips)
    .find((c) => c.id === selectedClipId && currentTime >= c.start && currentTime <= c.end);

  // Initialize Renderer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new PulsecutRenderer();
    rendererRef.current = renderer;
    setIsInitializing(true);
    setInitError(null);

    let isMounted = true;

    renderer
      .init(container)
      .then(() => {
        if (isMounted) {
          setIsInitializing(false);
          const state = useTimelineStore.getState();
          renderer.render(state.timeline, state.currentTime);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Renderer init failed:", err);
          setInitError(
            err instanceof Error ? err.message : "Failed to initialize WebGL canvas"
          );
          setIsInitializing(false);
        }
      });

    const updateRect = () => {
      if (container) {
        const r = container.getBoundingClientRect();
        setStageRect({ width: r.width, height: r.height, left: r.left, top: r.top });
      }
    };
    updateRect();
    const ro = new ResizeObserver(updateRect);
    ro.observe(container);

    return () => {
      isMounted = false;
      ro.disconnect();
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  // Sync isPlaying state to renderer video element
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || isInitializing || initError) return;

    if (isPlaying) {
      renderer.play().catch((err) => {
        console.warn("Playback error:", err);
        setPlaying(false);
      });
    } else {
      renderer.pause();
    }
  }, [isPlaying, isInitializing, initError, setPlaying]);

  // Render on timeline or currentTime changes
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || isInitializing || initError) return;

    renderer.render(timeline, currentTime);
  }, [timeline, currentTime, isInitializing, initError]);

  // Playback clock loop
  useEffect(() => {
    if (!isPlaying || isInitializing || initError) return;

    let rafId: number;
    let lastTick = performance.now();

    const tick = (now: number) => {
      if (now - lastTick >= 33) {
        lastTick = now;
        const renderer = rendererRef.current;
        const video = renderer?.getActiveVideoElement();

        if (video) {
          const videoTrack = timeline.tracks.find((t) => t.type === "video");
          const activeClip = videoTrack?.clips.find(
            (c) => c.assetId && timeline.assets.some((a) => a.id === c.assetId)
          );

          const clipStart = activeClip ? activeClip.start : 0;
          const sourceIn = activeClip ? activeClip.sourceIn : 0;
          const computedTime = clipStart + (video.currentTime - sourceIn);

          if (duration > 0 && computedTime >= duration) {
            setCurrentTime(duration);
            setPlaying(false);
            renderer?.pause();
            return;
          } else {
            setCurrentTime(computedTime);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isPlaying, isInitializing, initError, duration, timeline, setCurrentTime, setPlaying]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0B0C10]">
      {/* Pixi Canvas Mounting Container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden select-none relative"
      >
        {/* On-Canvas Direct Manipulation Gizmo */}
        {selectedClip && stageRect.width > 0 && (
          <TransformGizmo
            clip={selectedClip}
            projectWidth={timeline.project.width}
            projectHeight={timeline.project.height}
            stageRect={stageRect}
            onTransformChange={(patch) => updateClipTransform(selectedClip.id, patch)}
            onTransformCommit={(patch) => updateClipTransform(selectedClip.id, patch)}
          />
        )}
      </div>

      {/* Loading Skeleton */}
      {isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0C10]/90 z-10 space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-[#E05A2B]/20 border-t-[#E05A2B] animate-spin" />
          <span className="font-mono text-xs text-[#9396A5]">
            Initializing PixiJS Stage...
          </span>
        </div>
      )}

      {/* WebGL / Init Error UI */}
      {initError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0C10]/95 z-20 p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-[#F87171] mb-2">
            videocam_off
          </span>
          <p className="font-semibold text-sm text-[#F4EFEA]">Canvas Engine Error</p>
          <p className="text-xs text-[#9396A5] mt-1 max-w-sm">{initError}</p>
        </div>
      )}

      {/* Empty State Overlay */}
      {!isInitializing && !initError && !hasAssets && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0C10]/80 z-10 pointer-events-none p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1A1C24] border border-[#262936] flex items-center justify-center text-[#E05A2B] mb-3 shadow-[0_0_20px_rgba(224,90,43,0.15)]">
            <span className="material-symbols-outlined text-3xl">movie_filter</span>
          </div>
          <h4 className="text-sm font-semibold text-[#F4EFEA]">No Media Loaded</h4>
          <p className="text-xs text-[#9396A5] mt-1 max-w-xs">
            Import a video or image from the Left Panel to begin.
          </p>
        </div>
      )}
    </div>
  );
}
