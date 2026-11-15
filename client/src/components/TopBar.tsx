import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTimelineStore } from "@/store/timelineStore";

interface TopBarProps {
  onOpenExport: () => void;
  onOpenAiFilter: () => void;
  activeView: "editor" | "dashboard" | "landing";
  onChangeView: (view: "editor" | "dashboard" | "landing") => void;
}

export function TopBar({ onOpenExport, onOpenAiFilter, activeView, onChangeView }: TopBarProps) {
  const projectTitle = useTimelineStore((s) => s.projectTitle);
  const setProjectTitle = useTimelineStore((s) => s.setProjectTitle);
  const setProjectAspect = useTimelineStore((s) => s.setProjectAspect);
  const undo = useTimelineStore((s) => s.undo);
  const redo = useTimelineStore((s) => s.redo);
  const canUndo = useTimelineStore((s) => s.canUndo());
  const canRedo = useTimelineStore((s) => s.canRedo());

  const project = useTimelineStore((s) => s.timeline.project);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  // Determine aspect ratio key from current width and height
  const getAspectKey = () => {
    if (project.width === 1080 && project.height === 1920) return "9:16";
    if (project.width === 1920 && project.height === 1080) return "16:9";
    if (project.width === 1080 && project.height === 1080) return "1:1";
    if (project.width === 1080 && project.height === 1350) return "4:5";
    return `${project.width}:${project.height}`;
  };

  const handleAspectChange = (val: string) => {
    switch (val) {
      case "9:16":
        setProjectAspect(1080, 1920);
        break;
      case "16:9":
        setProjectAspect(1920, 1080);
        break;
      case "1:1":
        setProjectAspect(1080, 1080);
        break;
      case "4:5":
        setProjectAspect(1080, 1350);
        break;
    }
  };

  useEffect(() => {
    api<{ ok: boolean }>("/health")
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  // Global Undo / Redo keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return (
    <header className="h-12 w-full bg-[#121318]/90 backdrop-blur-xl border-b border-[#262936] px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => onChangeView("landing")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#E05A2B] to-[#D97706] flex items-center justify-center shadow-[0_0_10px_rgba(224,90,43,0.5)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[15px] text-[#0B0C10] font-bold">bolt</span>
          </div>
          <span className="font-bold text-[15px] tracking-tight bg-gradient-to-r from-[#E05A2B] via-[#F9A888] to-[#D97706] bg-clip-text text-transparent">
            PULSECUT
          </span>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-[#1A1C24] p-0.5 rounded-[6px] border border-[#262936]">
          <button
            onClick={() => onChangeView("editor")}
            className={`px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${
              activeView === "editor"
                ? "bg-[#E05A2B]/20 text-[#E05A2B] font-semibold"
                : "text-[#9396A5] hover:text-[#F4EFEA]"
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => onChangeView("dashboard")}
            className={`px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${
              activeView === "dashboard"
                ? "bg-[#E05A2B]/20 text-[#E05A2B] font-semibold"
                : "text-[#9396A5] hover:text-[#F4EFEA]"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onChangeView("landing")}
            className={`px-3 py-1 rounded-[4px] text-[12px] font-medium transition-all ${
              activeView === "landing"
                ? "bg-[#E05A2B]/20 text-[#E05A2B] font-semibold"
                : "text-[#9396A5] hover:text-[#F4EFEA]"
            }`}
          >
            Landing
          </button>
        </nav>

        {activeView === "editor" && (
          <div className="hidden lg:flex items-center gap-2">
            <div className="h-4 w-px bg-[#262936]" />
            {/* Editable Project Title */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#1A1C24] border border-[#262936] focus-within:border-[#E05A2B] transition-colors">
              <span className="material-symbols-outlined text-[15px] text-[#E05A2B]">movie</span>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-transparent text-[12px] font-mono text-[#F4EFEA] focus:outline-none w-40"
              />
            </div>
            {/* Sync chip */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1C24] text-[#9396A5] font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>Ready</span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Undo/Redo & Aspect Ratio */}
      {activeView === "editor" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 text-[#9396A5]">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                canUndo
                  ? "hover:bg-[#1A1C24] hover:text-[#F4EFEA]"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">undo</span>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                canRedo
                  ? "hover:bg-[#1A1C24] hover:text-[#F4EFEA]"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">redo</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#1A1C24] px-2 py-1 rounded-[6px] border border-[#262936]">
            <span className="material-symbols-outlined text-[14px] text-[#9396A5]">crop</span>
            <select
              value={getAspectKey()}
              onChange={(e) => handleAspectChange(e.target.value)}
              className="bg-transparent text-[12px] font-mono text-[#F4EFEA] focus:outline-none cursor-pointer"
            >
              <option value="9:16" className="bg-[#121318]">9:16 (Reel/TikTok)</option>
              <option value="16:9" className="bg-[#121318]">16:9 (Landscape)</option>
              <option value="1:1" className="bg-[#121318]">1:1 (Square)</option>
              <option value="4:5" className="bg-[#121318]">4:5 (Portrait)</option>
            </select>
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Health status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1A1C24] text-[10px] font-mono border border-[#262936]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              apiStatus === "online"
                ? "bg-[#34D399]"
                : apiStatus === "checking"
                ? "bg-[#D97706] animate-pulse"
                : "bg-[#9396A5]"
            }`}
          />
          <span className="text-[#9396A5]">API: {apiStatus}</span>
        </div>

        <button
          onClick={onOpenAiFilter}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#1A1C24] hover:bg-[#262936] border border-[#262936] text-[12px] text-[#E05A2B] hover:shadow-[0_0_12px_rgba(224,90,43,0.3)] transition-all"
        >
          <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
          <span>Prompt Filter</span>
        </button>

        <button
          onClick={onOpenExport}
          className="btn-primary px-4 py-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0B0C10] shadow-[0_0_14px_rgba(224,90,43,0.4)]"
        >
          <span className="material-symbols-outlined text-[16px] font-bold">bolt</span>
          <span>Export</span>
        </button>

        {/* User Avatar SVG */}
        <div
          title="Account"
          className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E05A2B] to-[#D97706] p-[1.5px] cursor-pointer flex items-center justify-center text-[#0B0C10]"
        >
          <div className="w-full h-full rounded-full bg-[#1A1C24] flex items-center justify-center text-[#E05A2B]">
            <span className="material-symbols-outlined text-[16px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
