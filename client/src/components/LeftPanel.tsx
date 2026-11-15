import { useState } from "react";
import { MediaPanel } from "./editor/MediaPanel";
import { useTimelineStore } from "@/store/timelineStore";
import { newId } from "@/lib/id";
import type { EffectInstance } from "@/types/timeline";

interface LeftPanelProps {
  onOpenAiFilter: () => void;
  onSelectEffect?: (name: string) => void;
}

const effectCategories = ["All", "Glitch", "Retro", "Glow", "Transitions"];

interface BuiltInEffect {
  name: string;
  tag: string;
  icon: string;
  color: string;
  beatSync: boolean;
  defaultUniforms: Record<string, number>;
}

const builtInEffects: BuiltInEffect[] = [
  {
    name: "RGB Glitch Split",
    tag: "Glitch",
    icon: "auto_fix_high",
    color: "#E05A2B",
    beatSync: true,
    defaultUniforms: { uIntensity: 0.8 },
  },
  {
    name: "VHS Tape 1994",
    tag: "Retro",
    icon: "videocam",
    color: "#D97706",
    beatSync: false,
    defaultUniforms: { uIntensity: 0.6, uGrain: 0.4 },
  },
  {
    name: "Warm Precision Glow",
    tag: "Glow",
    icon: "flare",
    color: "#F59E0B",
    beatSync: true,
    defaultUniforms: { uWarmth: 0.75, uBloom: 0.5 },
  },
  {
    name: "Bass Zoom Shock",
    tag: "Transitions",
    icon: "filter_drama",
    color: "#34D399",
    beatSync: true,
    defaultUniforms: { uShock: 1.0 },
  },
  {
    name: "Dreamy Film Burn",
    tag: "Retro",
    icon: "whatshot",
    color: "#EF4444",
    beatSync: false,
    defaultUniforms: { uBurn: 0.5 },
  },
  {
    name: "Amber Flare",
    tag: "Glow",
    icon: "lightbulb",
    color: "#F97316",
    beatSync: false,
    defaultUniforms: { uFlare: 0.8 },
  },
];

export function LeftPanel({ onOpenAiFilter, onSelectEffect }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<"media" | "effects" | "text" | "audio">("media");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const timeline = useTimelineStore((s) => s.timeline);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const setTimeline = useTimelineStore((s) => s.setTimeline);

  const filteredEffects = builtInEffects.filter((effect) => {
    const matchesCategory = selectedCategory === "All" || effect.tag === selectedCategory;
    const matchesSearch = effect.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyEffect = (effect: BuiltInEffect) => {
    if (onSelectEffect) onSelectEffect(effect.name);

    let targetId = selectedClipId;
    if (!targetId) {
      const firstClip = timeline.tracks.find((t) => t.type === "video")?.clips[0];
      if (!firstClip) return;
      targetId = firstClip.id;
    }

    const newEffect: EffectInstance = {
      id: newId("fx"),
      effectId: effect.name,
      params: effect.defaultUniforms,
      bindings: effect.beatSync
        ? [{ param: "uIntensity", source: "bass", gain: 1.2 }]
        : [],
      keyframes: [],
    };

    const newTracks = timeline.tracks.map((t) => ({
      ...t,
      clips: t.clips.map((c) =>
        c.id === targetId ? { ...c, effects: [...c.effects, newEffect] } : c
      ),
    }));

    setTimeline({
      ...timeline,
      tracks: newTracks,
    });
  };

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
          {/* AI Generate Action Card */}
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
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-[#9396A5] leading-relaxed">
              Synthesize a custom GLSL GPU fragment shader using natural language.
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
              placeholder="Search effects..."
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

          {/* Effect Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {filteredEffects.map((effect) => (
              <div
                key={effect.name}
                onClick={() => handleApplyEffect(effect)}
                className="group relative rounded-[10px] overflow-hidden bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B] cursor-pointer transition-all hover:shadow-[0_0_14px_rgba(224,90,43,0.25)] flex flex-col p-2.5 space-y-2"
              >
                <div
                  className="aspect-video w-full rounded-[6px] flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: `${effect.color}15`, borderColor: `${effect.color}40`, borderWidth: 1 }}
                >
                  <span
                    className="material-symbols-outlined text-[28px] transition-transform group-hover:scale-110"
                    style={{ color: effect.color }}
                  >
                    {effect.icon}
                  </span>
                  {effect.beatSync && (
                    <span className="absolute top-1.5 right-1.5 px-1 py-0.2 rounded bg-[#0B0C10]/80 border border-[#E05A2B]/50 flex items-center gap-0.5 text-[#E05A2B] font-mono text-[8px]">
                      <span className="material-symbols-outlined text-[9px] animate-pulse">graphic_eq</span>
                      Beat
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="text-[11px] font-semibold text-[#F4EFEA] truncate group-hover:text-[#E05A2B] transition-colors">
                    {effect.name}
                  </h5>
                  <span className="text-[10px] text-[#9396A5]">{effect.tag} • Click to add</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Tab Content */}
      {activeTab === "media" && <MediaPanel />}

      {/* Text Tab Content */}
      {activeTab === "text" && (
        <div className="flex-1 p-3 space-y-3">
          <span className="text-[12px] font-medium text-[#9396A5]">Text & Title Presets</span>
          <div className="space-y-2">
            {[
              { title: "Standard Headline", desc: "Clean centered title" },
              { title: "Lower Third", desc: "Speaker identifier label" },
              { title: "Neon Cyber Title", desc: "Amber precision title" },
            ].map((item) => (
              <div
                key={item.title}
                className="p-3 rounded-[6px] bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B] cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div>
                  <p className="text-[12px] font-semibold text-[#F4EFEA] group-hover:text-[#E05A2B]">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-[#9396A5]">{item.desc}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#9396A5] group-hover:text-[#E05A2B]">
                  add
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Tab Content */}
      {activeTab === "audio" && (
        <div className="flex-1 p-3 space-y-3">
          <span className="text-[12px] font-medium text-[#9396A5]">Audio & Beat Tracking</span>
          <div className="p-3 rounded-[6px] bg-[#1A1C24] border border-[#262936] flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#F4EFEA]">Web Audio API Engine</p>
              <span className="text-[10px] text-[#34D399] font-mono">Real-time FFT Analyser</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#34D399]">check_circle</span>
          </div>
        </div>
      )}
    </aside>
  );
}
