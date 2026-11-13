import { useState } from "react";

export function Timeline() {
  const [zoom, setZoom] = useState(50);
  const [playheadPos, setPlayheadPos] = useState(35); // in %

  return (
    <section className="h-64 w-full bg-[#121318] border-t border-[#262936] flex flex-col shrink-0 select-none relative z-20">
      {/* Timeline Toolbar Header */}
      <div className="h-9 px-4 bg-[#0B0C10]/70 border-b border-[#262936] flex items-center justify-between text-[11px] text-[#9396A5]">
        {/* Track Tools */}
        <div className="flex items-center gap-2">
          <button
            title="Split clip at playhead (S)"
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1A1C24] hover:text-[#F4EFEA] transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-[#E05A2B]">content_cut</span>
            <span>Split (S)</span>
          </button>
          <button
            title="Delete selected clip (Del)"
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1A1C24] hover:text-[#F87171] transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">delete</span>
            <span>Delete</span>
          </button>
          <div className="h-3.5 w-px bg-[#262936]" />
          <button
            title="Snap to beat grid"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#E05A2B]/10 text-[#E05A2B] font-mono"
          >
            <span className="material-symbols-outlined text-[14px]">magnet</span>
            <span>Snap: Beat (1/4)</span>
          </button>
        </div>

        {/* Timeline Zoom Slider */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">zoom_out</span>
          <input
            type="range"
            min="10"
            max="100"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24 accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
          />
          <span className="material-symbols-outlined text-[14px]">zoom_in</span>
        </div>
      </div>

      {/* Time Ruler */}
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          setPlayheadPos(pos);
        }}
        className="h-6 bg-[#0B0C10] border-b border-[#262936] relative font-mono text-[9px] text-[#9396A5] flex items-center px-2 overflow-hidden cursor-pointer"
      >
        {["00:00", "00:02", "00:04", "00:06", "00:08", "00:10", "00:12"].map((tick, i) => (
          <div
            key={tick}
            className="absolute flex flex-col items-center"
            style={{ left: `${(i / 6) * 90 + 5}%` }}
          >
            <span>{tick}</span>
            <div className="h-1.5 w-px bg-[#262936] mt-0.5" />
          </div>
        ))}
      </div>

      {/* Tracks Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-2 space-y-2 relative bg-[#0B0C10]/40">
        {/* Playhead Overlay */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none"
          style={{ left: `${playheadPos}%` }}
        >
          {/* Glowing Top Triangle Handle */}
          <div className="relative -left-2 -top-1 w-4 h-3 bg-[#E05A2B] [clip-path:polygon(0_0,100%_0,50%_100%)] shadow-[0_0_12px_#E05A2B]" />
          {/* Warm Coral 2px line */}
          <div className="w-[2px] h-full bg-[#E05A2B] shadow-[0_0_8px_#E05A2B]" />
          {/* Floating Timecode Chip */}
          <div className="absolute top-2 -left-8 px-1.5 py-0.5 rounded bg-[#0B0C10] border border-[#E05A2B] font-mono text-[9px] text-[#E05A2B] whitespace-nowrap shadow-md">
            00:04:12
          </div>
        </div>

        {/* Track 1: Video Track */}
        <div className="h-14 rounded-[8px] bg-[#1A1C24]/60 border border-[#262936] flex items-center px-2 relative group">
          <div className="w-16 shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-[#E05A2B]">
            <span className="material-symbols-outlined text-[14px]">videocam</span>
            <span>V1</span>
          </div>

          <div className="flex-1 h-full flex items-center gap-1 relative overflow-hidden py-1">
            {/* Clip 1 (Selected) with Warm Precision glow */}
            <div className="h-full w-[40%] rounded-[10px] bg-[#E05A2B]/25 border-2 border-[#E05A2B] flex items-center justify-between px-2 relative shadow-[0_0_12px_rgba(224,90,43,0.35)]">
              {/* Left Trim Handle */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#E05A2B] rounded-l-[8px] cursor-ew-resize flex items-center justify-center opacity-80 group-hover:opacity-100">
                <div className="w-0.5 h-4 bg-[#0B0C10] rounded-full" />
              </div>

              <div className="flex items-center gap-1.5 pl-1.5 truncate">
                <span className="material-symbols-outlined text-[13px] text-[#E05A2B]">movie</span>
                <span className="text-[11px] font-semibold text-[#F4EFEA] truncate">Cyber_City_4K.mov</span>
                <span className="px-1 rounded bg-[#D97706]/30 border border-[#D97706]/50 text-[9px] text-[#D97706] font-mono">
                  Glitch FX
                </span>
              </div>

              {/* Right Trim Handle */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#E05A2B] rounded-r-[8px] cursor-ew-resize flex items-center justify-center opacity-80 group-hover:opacity-100">
                <div className="w-0.5 h-4 bg-[#0B0C10] rounded-full" />
              </div>
            </div>

            {/* Clip 2 */}
            <div className="h-full w-[35%] rounded-[10px] bg-[#E05A2B]/15 border border-[#E05A2B]/50 flex items-center px-2 truncate">
              <span className="text-[11px] text-[#F4EFEA] truncate">Synth_Car_Chase.mp4</span>
            </div>

            {/* Clip 3 */}
            <div className="h-full w-[20%] rounded-[10px] bg-[#E05A2B]/15 border border-[#E05A2B]/50 flex items-center px-2 truncate">
              <span className="text-[11px] text-[#F4EFEA] truncate">Cyborg_Portrait.mov</span>
            </div>
          </div>
        </div>

        {/* Track 2: Text Track */}
        <div className="h-10 rounded-[8px] bg-[#1A1C24]/60 border border-[#262936] flex items-center px-2 relative">
          <div className="w-16 shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-[#F59E0B]">
            <span className="material-symbols-outlined text-[14px]">title</span>
            <span>T1</span>
          </div>

          <div className="flex-1 h-full flex items-center relative py-1">
            <div className="h-full w-[30%] ml-[20%] rounded-[8px] bg-[#F59E0B]/25 border border-[#F59E0B] flex items-center px-2.5 gap-1.5">
              <span className="text-[10px] font-bold text-[#F59E0B] truncate">NEON BEAT DROP</span>
            </div>
          </div>
        </div>

        {/* Track 3: Audio Track with Waveform */}
        <div className="h-12 rounded-[8px] bg-[#1A1C24]/60 border border-[#262936] flex items-center px-2 relative">
          <div className="w-16 shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-[#34D399]">
            <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
            <span>A1</span>
          </div>

          <div className="flex-1 h-full flex items-center relative py-1">
            <div className="h-full w-full rounded-[8px] bg-[#34D399]/20 border border-[#34D399]/60 flex items-center px-2 relative overflow-hidden">
              {/* SVG Audio Waveform */}
              <svg className="w-full h-8 text-[#34D399]" preserveAspectRatio="none" viewBox="0 0 400 30">
                <path
                  d="M0 15 Q 10 2, 20 15 T 40 15 T 60 28 T 80 2 T 100 25 T 120 5 T 140 22 T 160 15 T 180 28 T 200 15 T 220 2 T 240 26 T 260 8 T 280 22 T 300 15 T 320 2 T 340 28 T 360 15 T 380 5 T 400 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>

              {/* Beat Drop Marker Pins in warm coral */}
              {[25, 45, 70, 85].map((pos) => (
                <div
                  key={pos}
                  className="absolute top-1 bottom-1 w-px bg-[#E05A2B] flex flex-col items-center"
                  style={{ left: `${pos}%` }}
                >
                  <span className="material-symbols-outlined text-[10px] text-[#E05A2B]">arrow_drop_down</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
