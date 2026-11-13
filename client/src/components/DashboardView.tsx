import { useState } from "react";

interface DashboardViewProps {
  onOpenEditor: () => void;
  onOpenPromptFilter: () => void;
}

const mockProjects = [
  {
    id: 1,
    title: "Cyber_Beat_Drop_v2",
    updated: "Edited 2h ago",
    duration: "00:12:00",
    ratio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    effects: ["Glitch", "Bass-Sync"],
  },
  {
    id: 2,
    title: "Synthwave_Night_Drive",
    updated: "Edited 5h ago",
    duration: "00:24:30",
    ratio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    effects: ["Warm Glow", "VHS"],
  },
  {
    id: 3,
    title: "Tokyo_Hyperlapse_Remix",
    updated: "Edited yesterday",
    duration: "00:08:15",
    ratio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
    effects: ["Amber Flare"],
  },
  {
    id: 4,
    title: "Club_Bass_Drop_Teaser",
    updated: "Edited 3 days ago",
    duration: "00:15:00",
    ratio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    effects: ["Zoom Shock"],
  },
];

export function DashboardView({ onOpenEditor, onOpenPromptFilter }: DashboardViewProps) {
  const [activeNav, setActiveNav] = useState("projects");
  const [search, setSearch] = useState("");
  const [filterPrompt, setFilterPrompt] = useState("");

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

          {/* Navigation Icons matching the Warm Precision pill styling */}
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

        {/* User avatar at bottom */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E05A2B] to-[#D97706] p-[1.5px] cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User avatar"
            className="w-full h-full rounded-full object-cover"
          />
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

            {/* Sort Dropdown */}
            <select className="bg-[#121318] border border-[#262936] rounded-[6px] px-3 py-1.5 text-[13px] text-[#9396A5] focus:outline-none cursor-pointer">
              <option value="recent">Recently edited</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Duration</option>
            </select>

            {/* New Project Button */}
            <button
              onClick={onOpenEditor}
              className="btn-primary px-5 py-1.5 text-[13px] text-[#0B0C10] font-semibold flex items-center gap-2 shadow-[0_0_16px_rgba(224,90,43,0.4)]"
            >
              <span className="material-symbols-outlined text-[18px] font-bold">add</span>
              New Project
            </button>
          </div>
        </div>

        {/* Hero Strip: "Try Prompt-to-Filter" Card */}
        <div className="p-6 rounded-[14px] glass border border-[#E05A2B]/35 bg-gradient-to-r from-[#121318] via-[#241a15] to-[#121318] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(224,90,43,0.15)] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#E05A2B]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 max-w-lg z-10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#E05A2B]/20 text-[#E05A2B] font-mono text-[10px] font-semibold uppercase">
                Hero Feature
              </span>
              <h3 className="text-[17px] font-bold text-[#F4EFEA]">Try Prompt-to-Filter AI</h3>
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
              placeholder="Describe a filter... e.g. melting neon amber VHS"
              className="flex-1 bg-[#121318] border border-[#262936] rounded-[8px] px-3.5 py-2 text-[13px] text-[#F4EFEA] placeholder-[#9396A5]/50 focus:outline-none focus:border-[#E05A2B] transition-colors"
            />
            <button
              onClick={onOpenPromptFilter}
              className="btn-primary px-4 py-2 text-[13px] font-semibold text-[#0B0C10] whitespace-nowrap flex items-center gap-1.5 shadow-[0_0_14px_rgba(224,90,43,0.35)]"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">sparkles</span>
              Generate
            </button>
          </div>
        </div>

        {/* 4-Column Project Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              onClick={onOpenEditor}
              className="group rounded-[10px] bg-[#121318] border border-[#262936] hover:border-[#E05A2B] overflow-hidden cursor-pointer transition-all hover:shadow-[0_12px_24px_rgba(224,90,43,0.2)] flex flex-col"
            >
              {/* 4:5 Aspect Ratio Thumbnail */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 font-mono text-[10px] text-[#E05A2B]">
                  {project.duration}
                </span>

                {/* Hover overlay with action icons */}
                <div className="absolute inset-0 bg-[#0B0C10]/75 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity backdrop-blur-xs">
                  <button
                    title="Open Project"
                    className="w-10 h-10 rounded-full bg-[#E05A2B] text-[#0B0C10] flex items-center justify-center font-bold shadow-[0_0_12px_#E05A2B] hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  </button>
                  <button
                    title="Duplicate"
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-full bg-[#1A1C24] border border-[#262936] text-[#F4EFEA] flex items-center justify-center hover:bg-[#262936]"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                  <button
                    title="Delete"
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-full bg-[#1A1C24] border border-[#262936] text-[#F87171] flex items-center justify-center hover:bg-[#F87171]/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3.5 space-y-1.5">
                <h4 className="text-[14px] font-semibold text-[#F4EFEA] truncate group-hover:text-[#E05A2B] transition-colors">
                  {project.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-[#9396A5]">
                  <span>{project.updated}</span>
                  <div className="flex items-center gap-1">
                    {project.effects.map((ef) => (
                      <span key={ef} className="px-1 py-0.2 rounded bg-[#1A1C24] text-[#D97706] font-mono text-[9px]">
                        {ef}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Skeleton loading card variant */}
          <div className="rounded-[10px] bg-[#121318] border border-[#262936] p-3 space-y-3 flex flex-col justify-between">
            <div className="skeleton aspect-[4/5] w-full rounded-[6px]" />
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
