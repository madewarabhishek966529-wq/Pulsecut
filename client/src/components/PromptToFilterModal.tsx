import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useTimelineStore } from "@/store/timelineStore";
import { newId } from "@/lib/id";
import type { EffectInstance } from "@/types/timeline";

interface PromptToFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filterName: string) => void;
}

const exampleChips = [
  "Warm Amber Glow with Scanlines",
  "Cyberpunk Neon with Chromatic Split",
  "Vintage 1980s VHS Grain",
  "Dreamy Prism Bloom",
  "High Contrast Acid Glitch",
];

export function PromptToFilterModal({ isOpen, onClose, onApply }: PromptToFilterModalProps) {
  const [prompt, setPrompt] = useState("Warm amber glow with chromatic pulse");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedFilter, setGeneratedFilter] = useState<{
    name: string;
    description: string;
    fragmentShader: string;
    uniformDefs?: Record<string, { type: string; default: number; min?: number; max?: number }>;
  } | null>(null);

  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const timeline = useTimelineStore((s) => s.timeline);
  const setTimeline = useTimelineStore((s) => s.setTimeline);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await api<{
        ok: boolean;
        filter: {
          name: string;
          description: string;
          fragmentShader: string;
          uniformDefs?: Record<string, { type: string; default: number; min?: number; max?: number }>;
        };
      }>("/ai/filter", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      if (res.ok && res.filter) {
        setGeneratedFilter(res.filter);
      } else {
        setErrorMsg("Failed to generate shader. Please check server status.");
      }
    } catch (err) {
      setErrorMsg((err as Error).message || "AI filter generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToClip = () => {
    if (!generatedFilter) return;

    if (!selectedClipId) {
      // Find first video clip if none selected
      const firstClip = timeline.tracks.find((t) => t.type === "video")?.clips[0];
      if (!firstClip) {
        setErrorMsg("Please add a video clip to the timeline first.");
        return;
      }
      applyFilterToClipId(firstClip.id);
    } else {
      applyFilterToClipId(selectedClipId);
    }

    if (onApply) onApply(generatedFilter.name);
    onClose();
  };

  const applyFilterToClipId = (clipId: string) => {
    if (!generatedFilter) return;

    const newEffect: EffectInstance = {
      id: newId("fx"),
      effectId: generatedFilter.name,
      params: generatedFilter.uniformDefs
        ? Object.fromEntries(
            Object.entries(generatedFilter.uniformDefs).map(([k, v]) => [k, v.default])
          )
        : { uIntensity: 0.8 },
      bindings: [],
      keyframes: [],
    };

    const newTracks = timeline.tracks.map((t) => ({
      ...t,
      clips: t.clips.map((c) =>
        c.id === clipId ? { ...c, effects: [...c.effects, newEffect] } : c
      ),
    }));

    setTimeline({
      ...timeline,
      tracks: newTracks,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-[720px] rounded-[14px] glass border border-[#262936] bg-[#121318]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#262936]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E05A2B] to-[#D97706] flex items-center justify-center shadow-[0_0_12px_rgba(224,90,43,0.45)]">
                <span className="material-symbols-outlined text-[18px] text-[#0B0C10] font-bold">auto_awesome</span>
              </div>
              <div>
                <h3 className="font-semibold text-[16px] text-[#F4EFEA]">Prompt-to-Filter AI</h3>
                <p className="text-[12px] text-[#9396A5]">Synthesize custom GLSL GPU shaders using Gemini</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Prompt Section */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[#9396A5]">Shader Description</label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your desired shader effect..."
                  className="w-full rounded-[6px] bg-[#1A1C24] border border-[#262936] p-3 text-[14px] text-[#F4EFEA] placeholder-[#9396A5]/50 focus:outline-none focus:border-[#E05A2B] transition-colors resize-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute right-2.5 bottom-3.5 btn-primary px-3.5 py-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0B0C10] shadow-[0_0_12px_rgba(224,90,43,0.35)] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">sparkles</span>
                  {isGenerating ? "Synthesizing..." : "Generate"}
                </button>
              </div>
            </div>

            {/* Example prompt chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#9396A5]">Try:</span>
              {exampleChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setPrompt(chip)}
                  className="px-2.5 py-1 rounded-[6px] bg-[#1A1C24] hover:bg-[#262936] border border-[#262936] hover:border-[#E05A2B]/50 text-[11px] text-[#9396A5] hover:text-[#F4EFEA] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="p-3 rounded-[6px] bg-[#F87171]/15 border border-[#F87171]/40 flex items-center gap-2 text-[12px] text-[#F87171]">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Shader Result Display */}
            {generatedFilter && (
              <div className="space-y-3 bg-[#1A1C24] p-4 rounded-[10px] border border-[#262936]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#34D399]">check_circle</span>
                    <h4 className="text-[14px] font-semibold text-[#F4EFEA]">{generatedFilter.name}</h4>
                  </div>
                  <span className="font-mono text-[10px] text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded">
                    GLSL Validated
                  </span>
                </div>
                <p className="text-[12px] text-[#9396A5]">{generatedFilter.description}</p>
                <div className="p-2.5 rounded-[6px] bg-[#0B0C10] border border-[#262936] font-mono text-[10px] text-[#9396A5] max-h-32 overflow-y-auto">
                  <pre>{generatedFilter.fragmentShader}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-[#262936] bg-[#0B0C10]/60 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-[6px] border border-[#262936] hover:bg-[#1A1C24] text-[13px] text-[#9396A5] hover:text-[#F4EFEA] transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2.5">
              <button
                disabled={!generatedFilter}
                onClick={handleApplyToClip}
                className="btn-primary px-5 py-1.5 text-[13px] text-[#0B0C10] font-semibold shadow-[0_0_16px_rgba(224,90,43,0.4)] disabled:opacity-40"
              >
                Apply to clip
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
