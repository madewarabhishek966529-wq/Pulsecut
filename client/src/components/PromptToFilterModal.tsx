import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PromptToFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filterName: string) => void;
}

const exampleChips = [
  "Warm Precision Vintage",
  "Amber glow pulse",
  "Film burn",
  "Dream blur",
  "Cyber glitch split",
];

export function PromptToFilterModal({ isOpen, onClose, onApply }: PromptToFilterModalProps) {
  const [prompt, setPrompt] = useState("Warm precision cinematic look with amber glow and scanlines");
  const [isGenerating, setIsGenerating] = useState(false);
  const [intensity, setIntensity] = useState(85);
  const [speed, setSpeed] = useState(1.2);
  const [colorShift, setColorShift] = useState(25);
  const [scanlines, setScanlines] = useState(50);
  const [compareSplit, setCompareSplit] = useState(50);
  const [boundToBass, setBoundToBass] = useState(true);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
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
                <h3 className="font-semibold text-[16px] text-[#F4EFEA]">Generate a filter</h3>
                <p className="text-[12px] text-[#9396A5]">AI-powered GPU shader synthesized from text</p>
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
              <label className="text-[12px] font-medium text-[#9396A5]">Filter Description</label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your filter... e.g. warm amber sunset with gentle grain and chromatic split"
                  className="w-full rounded-[6px] bg-[#1A1C24] border border-[#262936] p-3 text-[14px] text-[#F4EFEA] placeholder-[#9396A5]/50 focus:outline-none focus:border-[#E05A2B] transition-colors resize-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
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

            {/* Result Area (Split Preview & Sliders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Left: Preview with Compare Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#9396A5]">Shader Preview</span>
                  <span className="font-mono text-[10px] text-[#E05A2B] bg-[#E05A2B]/10 px-1.5 py-0.5 rounded">
                    60 FPS • WebGL2
                  </span>
                </div>
                <div className="relative aspect-video rounded-[10px] overflow-hidden border border-[#262936] bg-black select-none group">
                  {/* Before Frame (Left) */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80')`,
                      filter: "none",
                    }}
                  />
                  {/* After Frame (Right side with warm filter) */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80')`,
                      clipPath: `polygon(${compareSplit}% 0, 100% 0, 100% 100%, ${compareSplit}% 100%)`,
                      filter: `sepia(0.3) saturate(${1 + intensity / 70}) hue-rotate(${colorShift}deg) contrast(${1 + intensity / 120})`,
                    }}
                  />

                  {/* Scanline overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"
                    style={{ opacity: scanlines / 100 }}
                  />

                  {/* Split compare line in warm coral */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#E05A2B] shadow-[0_0_8px_#E05A2B]"
                    style={{ left: `${compareSplit}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-5 h-5 rounded-full bg-[#121318] border border-[#E05A2B] flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-[12px] text-[#E05A2B]">drag_indicator</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={compareSplit}
                    onChange={(e) => setCompareSplit(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
                  />

                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 font-mono text-[9px] text-[#9396A5]">ORIGINAL</span>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-[#E05A2B]/20 font-mono text-[9px] text-[#E05A2B]">WARM FILTERED</span>
                </div>
              </div>

              {/* Right: Auto-generated Sliders */}
              <div className="space-y-3.5 bg-[#1A1C24]/60 p-3.5 rounded-[10px] border border-[#262936]">
                <div className="flex items-center justify-between pb-1 border-b border-[#262936]">
                  <span className="text-[12px] font-medium text-[#F4EFEA]">Exposed Uniforms</span>
                  <span className="font-mono text-[10px] text-[#9396A5]">4 variables</span>
                </div>

                {/* Slider 1: Intensity */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9396A5]">u_intensity</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-[#E05A2B]">{intensity}%</span>
                      <button
                        onClick={() => setBoundToBass(!boundToBass)}
                        title="Bind to audio bass"
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          boundToBass ? "bg-[#E05A2B]/20 text-[#E05A2B]" : "text-[#9396A5] hover:text-[#F4EFEA]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">graphic_eq</span>
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 2: Speed */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9396A5]">u_speed</span>
                    <span className="font-mono text-[11px] text-[#D97706]">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-[#D97706] h-1 bg-[#262936] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 3: Color Shift */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9396A5]">u_warmth_shift</span>
                    <span className="font-mono text-[11px] text-[#E05A2B]">{colorShift}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={colorShift}
                    onChange={(e) => setColorShift(Number(e.target.value))}
                    className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 4: Scanlines */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9396A5]">u_scanlines</span>
                    <span className="font-mono text-[11px] text-[#34D399]">{scanlines}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scanlines}
                    onChange={(e) => setScanlines(Number(e.target.value))}
                    className="w-full accent-[#34D399] h-1 bg-[#262936] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Status Line */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#1A1C24] border border-[#262936]">
              <span className="material-symbols-outlined text-[16px] text-[#34D399]">check_circle</span>
              <span className="text-[12px] text-[#9396A5]">
                Compiling GLSL shader... <strong className="text-[#34D399] font-medium">Fixed 1 error automatically</strong> in isolated context.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-[#262936] bg-[#0B0C10]/60 flex items-center justify-between">
            <button
              onClick={handleGenerate}
              className="px-3.5 py-1.5 rounded-[6px] border border-[#262936] hover:bg-[#1A1C24] text-[13px] text-[#9396A5] hover:text-[#F4EFEA] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Regenerate
            </button>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-[6px] border border-[#262936] hover:bg-[#1A1C24] text-[13px] text-[#F4EFEA] transition-colors"
              >
                Save to My Effects
              </button>
              <button
                onClick={() => {
                  if (onApply) onApply(prompt);
                  onClose();
                }}
                className="btn-primary px-5 py-1.5 text-[13px] text-[#0B0C10] font-semibold shadow-[0_0_16px_rgba(224,90,43,0.4)]"
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
