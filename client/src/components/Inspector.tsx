import { useState } from "react";

export function Inspector() {
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);

  // Effect sliders
  const [glitchIntensity, setGlitchIntensity] = useState(85);
  const [vhsGrain, setVhsGrain] = useState(40);
  const [isGlitchBoundToBass, setIsGlitchBoundToBass] = useState(true);

  return (
    <aside className="w-[300px] h-full bg-[#121318] border-l border-[#262936] flex flex-col shrink-0 select-none z-20 overflow-y-auto">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[#262936] bg-[#0B0C10]/60 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#E05A2B]">tune</span>
          <span className="text-[13px] font-semibold text-[#F4EFEA]">Clip Inspector</span>
        </div>
        <span className="font-mono text-[10px] text-[#E05A2B] bg-[#E05A2B]/10 px-1.5 py-0.5 rounded">
          Video Clip #1
        </span>
      </div>

      <div className="p-3.5 space-y-4">
        {/* Transform Section */}
        <div className="space-y-3 bg-[#1A1C24] p-3 rounded-[10px] border border-[#262936]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#F4EFEA] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#E05A2B]">transform</span>
              Transform
            </span>
            <span className="text-[10px] font-mono text-[#9396A5]">RESET</span>
          </div>

          {/* Position X / Y */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[6px] bg-[#121318] border border-[#262936]">
              <span className="text-[10px] font-mono text-[#9396A5]">X</span>
              <input
                type="number"
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                className="w-14 bg-transparent text-right font-mono text-[11px] text-[#F4EFEA] focus:outline-none"
              />
              <span className="text-[10px] font-mono text-[#9396A5]">px</span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[6px] bg-[#121318] border border-[#262936]">
              <span className="text-[10px] font-mono text-[#9396A5]">Y</span>
              <input
                type="number"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="w-14 bg-transparent text-right font-mono text-[11px] text-[#F4EFEA] focus:outline-none"
              />
              <span className="text-[10px] font-mono text-[#9396A5]">px</span>
            </div>
          </div>

          {/* Scale Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#9396A5]">Scale</span>
              <span className="font-mono text-[#E05A2B]">{scale}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
            />
          </div>

          {/* Rotation & Opacity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#9396A5]">Rotation</span>
              <span className="font-mono text-[#F4EFEA]">{rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#9396A5]">Opacity</span>
              <span className="font-mono text-[#F4EFEA]">{opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Effects Stack Section */}
        <div className="space-y-3 bg-[#1A1C24] p-3 rounded-[10px] border border-[#262936]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#F4EFEA] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#D97706]">auto_awesome</span>
              Applied Effects (2)
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#E05A2B] cursor-pointer" title="Add Effect">
              add_circle
            </span>
          </div>

          {/* Effect 1: RGB Glitch Split */}
          <div className="p-2.5 rounded-[6px] bg-[#121318] border border-[#262936] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E05A2B]" />
                <span className="text-[11px] font-semibold text-[#F4EFEA]">RGB Glitch Split</span>
              </div>
              {/* Beat Binding Badge */}
              <button
                onClick={() => setIsGlitchBoundToBass(!isGlitchBoundToBass)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  isGlitchBoundToBass
                    ? "bg-[#E05A2B]/20 border-[#E05A2B] text-[#E05A2B] shadow-[0_0_8px_rgba(224,90,43,0.3)]"
                    : "bg-[#1A1C24] border-[#262936] text-[#9396A5]"
                }`}
              >
                <span className="material-symbols-outlined text-[11px] animate-pulse">graphic_eq</span>
                <span>Bass</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#9396A5]">Intensity (Modulated by Bass)</span>
                <span className="font-mono text-[#E05A2B] font-bold">{glitchIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={glitchIntensity}
                onChange={(e) => setGlitchIntensity(Number(e.target.value))}
                className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Effect 2: VHS Retro */}
          <div className="p-2.5 rounded-[6px] bg-[#121318] border border-[#262936] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                <span className="text-[11px] font-semibold text-[#F4EFEA]">Warm VHS Filter</span>
              </div>
              <span className="text-[10px] font-mono text-[#9396A5]">Static</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#9396A5]">Tape Grain</span>
                <span className="font-mono text-[#D97706] font-medium">{vhsGrain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={vhsGrain}
                onChange={(e) => setVhsGrain(Number(e.target.value))}
                className="w-full accent-[#D97706] h-1 bg-[#262936] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Audio Reactivity Monitor */}
        <div className="p-3 rounded-[10px] bg-[#1A1C24] border border-[#262936] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#F4EFEA] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#34D399]">equalizer</span>
              Audio Frequency Bands
            </span>
            <span className="font-mono text-[9px] text-[#34D399]">ACTIVE</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
            <div className="p-1 rounded bg-[#121318] border border-[#262936]">
              <span className="text-[#E05A2B] font-bold block">88%</span>
              <span className="text-[8px] text-[#9396A5]">uBass</span>
            </div>
            <div className="p-1 rounded bg-[#121318] border border-[#262936]">
              <span className="text-[#D97706] font-bold block">45%</span>
              <span className="text-[8px] text-[#9396A5]">uMid</span>
            </div>
            <div className="p-1 rounded bg-[#121318] border border-[#262936]">
              <span className="text-[#34D399] font-bold block">62%</span>
              <span className="text-[8px] text-[#9396A5]">uHigh</span>
            </div>
            <div className="p-1 rounded bg-[#121318] border border-[#262936]">
              <span className="text-[#F59E0B] font-bold block">1.0</span>
              <span className="text-[8px] text-[#9396A5]">uBeat</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
