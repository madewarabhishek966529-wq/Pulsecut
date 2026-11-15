import { useState } from "react";
import { useTimelineStore } from "@/store/timelineStore";
import { emptyTimeline } from "@/types/timeline";

interface DashboardViewProps {
  onOpenEditor: () => void;
  onOpenPromptFilter: () => void;
}

export function DashboardView({ onOpenEditor, onOpenPromptFilter }: DashboardViewProps) {
  const [activeNav, setActiveNav] = useState("projects");
  const [search, setSearch] = useState("");
  const [filterPrompt, setFilterPrompt] = useState("");

  const projectTitle = useTimelineStore((s) => s.projectTitle);
  const timeline = useTimelineStore((s) => s.timeline);
  const setTimeline = useTimelineStore((s) => s.setTimeline);
  const setProjectTitle = useTimelineStore((s) => s.setProjectTitle);

  // Derive current in-memory project item
  const currentProject = {
    id: "current",
    title: projectTitle || "Untitled Project",
    updated: "Active Project",
    duration: `${Math.max(timeline.project.duration, 0).toFixed(1)}s`,
    ratio: `${timeline.project.width}:${timeline.project.height}`,
    clipsCount: timeline.tracks.reduce((acc, t) => acc + t.clips.length, 0),
    assetsCount: timeline.assets.length,
  };

  const handleCreateNewProject = () => {
    setTimeline(emptyTimeline());
    setProjectTitle("New Project");
    onOpenEditor();
  };

  return (
    <div className="flex-1 w-full h-full flex bg-[#0B0C10] overflow-hidden select-none">
      {/* 72px Left Rail */}
      <aside className="w-[72px] h-full bg-[#121318] border-r border-[#262936] flex flex-col items-center justify-between py-4 shrink-0 z-20">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo */}
          <div
            onClick={onOpenEditor}
            title="Pulsecut Editor"
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E05A2B] to-[#D97706] flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(224,90,43,0.45)] hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-[22px] text-[#0B0C10] font-bold">bolt</span>
          </div>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {[
              { id: "projects", icon: "folder", label: "Projects" },
              { id: "templates", icon: "dashboard", label: "Templates" },
              { id: "effects", icon: "auto_awesome", label: "My Effects" },
              { id: "settings", icon: "settings", label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                title={item.label}
                className={`w-12 h-12 rounded-[10px] flex flex-col items-center justify-center transition-all ${
                  activeNav === item.id
                    ? "bg-[#E05A2B]/15 text-[#E05A2B] shadow-[0_0_12px_rgba(224,90,43,0.25)]"
                    : "text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[9px] font-medium mt-0.5">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E05A2B] to-[#D97706] p-[1.5px] cursor-pointer">
          <div className="w-full h-full rounded-full bg-[#1A1C24] flex items-center justify-center text-[#E05A2B]">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-8 space-y-6">
        {/* Header Greeting & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-[#F4EFEA]">Your Projects</h1>
            <p className="text-[13px] text-[#9396A5]">Create, edit, and bind music-reactive shaders</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined text-[18px] text-[#9396A5] absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="bg-[#121318] border border-[#262936] rounded-[6px] pl-9 pr-3 py-1.5 text-[13px] text-[#F4EFEA] placeholder-[#9396A5]/50 focus:outline-none focus:border-[#E05A2B] w-52 transition-colors"
              />
            </div>

            {/* New Project Button */}
            <button
              onClick={handleCreateNewProject}
              className="btn-primary px-5 py-1.5 text-[13px] text-[#0B0C10] font-semibold flex items-center gap-2 shadow-[0_0_16px_rgba(224,90,43,0.4)]"
            >
              <span className="material-symbols-outlined text-[18px] font-bold">add</span>
              New Project
            </button>
          </div>
        </div>

        {/* Hero Strip: Prompt-to-Filter Card */}
        <div className="p-6 rounded-[14px] glass border border-[#E05A2B]/35 bg-gradient-to-r from-[#121318] via-[#241a15] to-[#121318] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(224,90,43,0.15)] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#E05A2B]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 max-w-lg z-10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#E05A2B]/20 text-[#E05A2B] font-mono text-[10px] font-semibold uppercase">
                AI Shader Synthesis
              </span>
              <h3 className="text-[17px] font-bold text-[#F4EFEA]">Prompt-to-Filter AI</h3>
            </div>
            <p className="text-[13px] text-[#9396A5] leading-relaxed">
              Generate custom GLSL GPU filters using natural language, auto-bind to the bassline, and export directly.
            </p>
          </div>

          <div className="w-full md:w-auto flex-1 max-w-md flex items-center gap-2 z-10">
            <input
              type="text"
              value={filterPrompt}
              onChange={(e) => setFilterPrompt(e.target.value)}
              placeholder="Describe a filter... e.g. amber glow with chromatic pulse"
              className="flex-1 bg-[#121318] border border-[#262936] rounded-[8px] px-3.5 py-2 text-[13px] text-[#F4EFEA] placeholder-[#9396A5]/50 focus:outline-none focus:border-[#E05A2B] transition-colors"
            />
            <button
              onClick={onOpenPromptFilter}
              className="btn-primary px-4 py-2 text-[13px] font-semibold text-[#0B0C10] whitespace-nowrap flex items-center gap-1.5 shadow-[0_0_14px_rgba(224,90,43,0.35)]"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">sparkles</span>
              Open AI
            </button>
          </div>
        </div>

        {/* Real Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* Current Workspace Project Card */}
          <div
            onClick={onOpenEditor}
            className="group rounded-[10px] bg-[#121318] border border-[#262936] hover:border-[#E05A2B] overflow-hidden cursor-pointer transition-all hover:shadow-[0_12px_24px_rgba(224,90,43,0.2)] flex flex-col"
          >
            {/* Project Preview Tile */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1A1C24] flex flex-col items-center justify-center p-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0B0C10] border border-[#262936] flex items-center justify-center group-hover:border-[#E05A2B] group-hover:scale-105 transition-all">
                <span className="material-symbols-outlined text-[32px] text-[#E05A2B]">video_file</span>
              </div>
              <span className="mt-3 font-mono text-[11px] text-[#9396A5]">
                {currentProject.ratio}
              </span>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 font-mono text-[10px] text-[#E05A2B]">
                {currentProject.duration}
              </span>

              {/* Hover overlay with action icons */}
              <div className="absolute inset-0 bg-[#0B0C10]/75 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity backdrop-blur-xs">
                <button
                  title="Open Project"
                  className="w-10 h-10 rounded-full bg-[#E05A2B] text-[#0B0C10] flex items-center justify-center font-bold shadow-[0_0_12px_#E05A2B] hover:scale-110 transition-transform"
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                </button>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-3.5 space-y-1.5">
              <h4 className="text-[14px] font-semibold text-[#F4EFEA] truncate group-hover:text-[#E05A2B] transition-colors">
                {currentProject.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-[#9396A5]">
                <span>{currentProject.updated}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#1A1C24] text-[#D97706] font-mono text-[10px]">
                  {currentProject.clipsCount} clips
                </span>
              </div>
            </div>
          </div>

          {/* New Project Action Card */}
          <div
            onClick={handleCreateNewProject}
            className="rounded-[10px] bg-[#121318]/50 border border-dashed border-[#262936] hover:border-[#E05A2B] p-6 space-y-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-[#1A1C24] group-hover:bg-[#E05A2B]/15 text-[#9396A5] group-hover:text-[#E05A2B] flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[24px]">add</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#F4EFEA] group-hover:text-[#E05A2B] transition-colors">
                Create Project
              </p>
              <p className="text-[11px] text-[#9396A5]">Start a fresh timeline</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
