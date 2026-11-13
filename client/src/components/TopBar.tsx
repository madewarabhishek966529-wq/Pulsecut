import { useState } from "react";

interface TopBarProps {
  onOpenExport: () => void;
  onOpenAiFilter: () => void;
  activeView: "editor" | "dashboard" | "landing";
  onChangeView: (view: "editor" | "dashboard" | "landing") => void;
}

export function TopBar({ onOpenExport, onOpenAiFilter, activeView, onChangeView }: TopBarProps) {
  const [projectTitle, setProjectTitle] = useState("Cyber_Beat_Drop_v2");
  const [aspectRatio, setAspectRatio] = useState("9:16");

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
              <span>Saved</span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Undo/Redo & Aspect Ratio */}
      {activeView === "editor" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 text-[#9396A5]">
            <button
              title="Undo (Ctrl+Z)"
              className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1A1C24] hover:text-[#F4EFEA] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">undo</span>
            </button>
            <button
              title="Redo (Ctrl+Y)"
              className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1A1C24] hover:text-[#F4EFEA] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">redo</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#1A1C24] px-2 py-1 rounded-[6px] border border-[#262936]">
            <span className="material-symbols-outlined text-[14px] text-[#9396A5]">crop</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-transparent text-[12px] font-mono text-[#F4EFEA] focus:outline-none cursor-pointer"
            >
              <option value="9:16" className="bg-[#121318]">9:16 (Reel/TikTok)</option>
              <option value="16:9" className="bg-[#121318]">16:9 (Landscape)</option>
              <option value="1:1" className="bg-[#121318]">1:1 (Square)</option>
            </select>
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
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

        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E05A2B] to-[#D97706] p-[1.5px] cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
