import { useState } from "react";

interface LeftPanelProps {
  onOpenAiFilter: () => void;
  onSelectEffect?: (name: string) => void;
}

const effectCategories = ["All", "Glitch", "Retro", "Glow", "Transitions", "AI"];

const mockEffects = [
  {
    name: "RGB Glitch Split",
    tag: "Glitch",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80",
    beatSync: true,
  },
  {
    name: "VHS Tape 1994",
    tag: "Retro",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80",
    beatSync: false,
  },
  {
    name: "Warm Precision Glow",
    tag: "Glow",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
    beatSync: true,
  },
  {
    name: "Bass Zoom Shock",
    tag: "Transitions",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80",
    beatSync: true,
  },
  {
    name: "Dreamy Film Burn",
    tag: "Retro",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
    beatSync: false,
  },
  {
    name: "Amber Flare",
    tag: "Glow",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80",
    beatSync: false,
  },
];

export function LeftPanel({ onOpenAiFilter, onSelectEffect }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<"media" | "effects" | "text" | "audio">("effects");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEffects = mockEffects.filter((effect) => {
    const matchesCategory = selectedCategory === "All" || effect.tag === selectedCategory;
    const matchesSearch = effect.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <aside className="w-80 h-full bg-[#121318] border-r border-[#262936] flex flex-col shrink-0 select-none z-20">
      {/* Panel Tabs */}
      <div className="flex items-center border-b border-[#262936] bg-[#0B0C10]/60 px-2 pt-1 gap-1">
        {[
          { id: "media", label: "Media", icon: "perm_media" },
          { id: "effects", label: "Effects", icon: "auto_awesome" },
          { id: "text", label: "Text", icon: "title" },
          { id: "audio", label: "Audio", icon: "graphic_eq" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-t-[6px] flex items-center justify-center gap-1.5 text-[12px] font-medium transition-all ${
                isActive
                  ? "bg-[#121318] text-[#E05A2B] border-t-2 border-[#E05A2B] font-semibold"
                  : "text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Effects Tab Content */}
      {activeTab === "effects" && (
        <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-y-auto">
          {/* Highlighted AI Generate Card with Warm Precision Gradient */}
          <div
            onClick={onOpenAiFilter}
            className="p-3 rounded-[10px] bg-gradient-to-br from-[#1A1C24] to-[#261c18] border border-[#E05A2B]/40 hover:border-[#E05A2B] cursor-pointer group shadow-[0_0_15px_rgba(224,90,43,0.15)] hover:shadow-[0_0_20px_rgba(224,90,43,0.3)] transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#E05A2B] to-[#D97706] flex items-center justify-center shadow-[0_0_8px_rgba(224,90,43,0.5)]">
                  <span className="material-symbols-outlined text-[14px] text-[#0B0C10] font-bold">sparkles</span>
                </div>
                <span className="text-[13px] font-semibold text-[#F4EFEA] group-hover:text-[#E05A2B] transition-colors">
                  Generate with AI
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#E05A2B]/20 text-[#E05A2B] font-mono text-[9px] uppercase font-semibold">
                New
              </span>
            </div>
            <p className="text-[11px] text-[#9396A5] leading-relaxed">
              Describe any filter in plain English. Get an instant, custom GLSL GPU shader.
            </p>
          </div>

          {/* Search field */}
          <div className="relative">
            <span className="material-symbols-outlined text-[16px] text-[#9396A5] absolute left-2.5 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shader filters..."
              className="w-full bg-[#1A1C24] border border-[#262936] rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#F4EFEA] placeholder-[#9396A5]/50 focus:outline-none focus:border-[#E05A2B] transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {effectCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-[6px] text-[11px] whitespace-nowrap border transition-all ${
                  selectedCategory === cat
                    ? "bg-[#E05A2B]/20 border-[#E05A2B] text-[#E05A2B] font-semibold shadow-[0_0_8px_rgba(224,90,43,0.2)]"
                    : "bg-[#1A1C24] border-[#262936] text-[#9396A5] hover:text-[#F4EFEA]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 2-Column Effect Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {filteredEffects.map((effect) => (
              <div
                key={effect.name}
                onClick={() => onSelectEffect && onSelectEffect(effect.name)}
                className="group relative rounded-[10px] overflow-hidden bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B] cursor-pointer transition-all hover:shadow-[0_0_14px_rgba(224,90,43,0.25)] flex flex-col"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={effect.image}
                    alt={effect.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {effect.beatSync && (
                    <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-[#0B0C10]/80 border border-[#E05A2B]/50 flex items-center gap-0.5 text-[#E05A2B] font-mono text-[9px]">
                      <span className="material-symbols-outlined text-[10px] animate-pulse">graphic_eq</span>
                      Beat
                    </span>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 px-1 py-0.5 rounded bg-black/60 font-mono text-[9px] text-[#9396A5]">
                    {effect.tag}
                  </span>
                </div>
                <div className="p-2">
                  <h5 className="text-[11px] font-semibold text-[#F4EFEA] truncate group-hover:text-[#E05A2B] transition-colors">
                    {effect.name}
                  </h5>
                  <span className="text-[10px] text-[#9396A5]">Drag to clip</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Tab Content */}
      {activeTab === "media" && (
        <div className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto">
          {/* Upload Drop Zone */}
          <div className="p-4 rounded-[10px] bg-[#1A1C24] border border-dashed border-[#262936] hover:border-[#E05A2B] flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
            <span className="material-symbols-outlined text-[24px] text-[#E05A2B] mb-1 group-hover:scale-110 transition-transform">
              cloud_upload
            </span>
            <span className="text-[12px] font-semibold text-[#F4EFEA]">Upload Video or Audio</span>
            <span className="text-[10px] text-[#9396A5] mt-0.5">MP4, MOV, WAV, MP3</span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-medium text-[#9396A5]">Project Assets</span>
            <div className="space-y-1.5">
              {[
                { name: "Cyber_City_4K.mov", time: "00:14", size: "1.4 GB" },
                { name: "Synth_Car_Chase.mp4", time: "01:02", size: "3.2 GB" },
                { name: "Hyperpop_Bass_Drop.wav", time: "02:44", size: "48 kHz" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-[6px] bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B]/50 cursor-grab active:cursor-grabbing transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-[16px] text-[#E05A2B]">movie</span>
                    <div className="truncate">
                      <p className="text-[11px] text-[#F4EFEA] font-medium truncate">{item.name}</p>
                      <span className="text-[9px] text-[#9396A5] font-mono">{item.size}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#9396A5]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Tab Content */}
      {activeTab === "text" && (
        <div className="flex-1 p-3 space-y-3">
          <span className="text-[12px] font-medium text-[#9396A5]">Preset Titles & Captions</span>
          <div className="space-y-2">
            {["Warm Precision Title", "Subtitles Auto-Beat", "Glitch Overlay Caption"].map((txt) => (
              <div
                key={txt}
                className="p-3 rounded-[6px] bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B] cursor-pointer text-[12px] font-semibold text-[#F4EFEA] flex items-center justify-between"
              >
                <span>{txt}</span>
                <span className="material-symbols-outlined text-[16px] text-[#9396A5]">add</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Tab Content */}
      {activeTab === "audio" && (
        <div className="flex-1 p-3 space-y-3">
          <span className="text-[12px] font-medium text-[#9396A5]">Soundtracks & Beat Markers</span>
          <div className="p-3 rounded-[6px] bg-[#1A1C24] border border-[#262936] flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#F4EFEA]">128 BPM Warm Precision Drop</p>
              <span className="text-[10px] text-[#34D399] font-mono">14 Beat markers detected</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#34D399]">check_circle</span>
          </div>
        </div>
      )}
    </aside>
  );
}
