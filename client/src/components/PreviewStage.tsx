import { useState } from "react";

export function PreviewStage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState("00:04:12");
  const [totalTime] = useState("00:12:00");
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#0B0C10] relative select-none overflow-hidden">
      {/* Stage Header Info */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#262936]/70 text-[11px] font-mono text-[#9396A5] shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#F4EFEA]">
            <span className="w-2 h-2 rounded-full bg-[#E05A2B] animate-pulse" />
            Viewport: 1080 x 1920 (9:16)
          </span>
          <span className="text-[#9396A5]">Scale: Fit (48%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#34D399]">ACEScg • WebGL 60fps</span>
        </div>
      </div>

      {/* Center Video Canvas (Dark obsidian stage with subtle grid) */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(#1A1C24_1px,transparent_1px)] bg-[size:16px_16px]">
        {/* Ambient Backlight Glow (Warm Precision Glow) */}
        <div className="absolute w-[450px] h-[650px] bg-gradient-to-r from-[#E05A2B]/15 via-[#D97706]/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* 9:16 Phone Frame Mockup / Video Canvas */}
        <div className="relative h-full max-h-[580px] aspect-[9/16] rounded-[14px] overflow-hidden border border-[#262936] bg-black shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex items-center justify-center group">
          {/* Still Footage */}
          <img
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80"
            alt="Video Preview"
            className="w-full h-full object-cover"
          />

          {/* Active AI Beat-bound Effect Overlay Simulation */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#D97706]/20 via-transparent to-[#E05A2B]/15 mix-blend-screen" />

          {/* Timecode floating HUD chip */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#0B0C10]/85 backdrop-blur-md border border-[#262936] font-mono text-[10px] text-[#E05A2B] flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F87171] animate-ping" />
            <span>LIVE PREVIEW</span>
          </div>

          <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#0B0C10]/85 backdrop-blur-md border border-[#262936] font-mono text-[10px] text-[#D97706] flex items-center gap-1 shadow-md">
            <span className="material-symbols-outlined text-[12px]">graphic_eq</span>
            <span>BEAT: 128 BPM</span>
          </div>

          {/* Safe Area Guides overlay (faint) */}
          <div className="absolute inset-6 border border-white/10 pointer-events-none rounded-[6px]" />
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="h-12 bg-[#121318] border-t border-[#262936] px-4 flex items-center justify-between shrink-0">
        {/* Left Playback Tools */}
        <div className="flex items-center gap-1.5">
          <button
            title="Step back 1 frame (Left Arrow)"
            className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">skip_previous</span>
          </button>

          {/* Master Play Button with Pulse Glow */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title="Play / Pause (Space)"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E05A2B] to-[#D97706] flex items-center justify-center text-[#0B0C10] shadow-[0_0_16px_rgba(224,90,43,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px] font-bold">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          <button
            title="Step forward 1 frame (Right Arrow)"
            className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
          </button>

          <button
            title="Loop Playback"
            className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#E05A2B] bg-[#E05A2B]/10 transition-colors ml-1"
          >
            <span className="material-symbols-outlined text-[16px]">repeat</span>
          </button>
        </div>

        {/* Center Mono Timecode */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[14px] font-bold text-[#E05A2B] tracking-tight">{currentTime}</span>
          <span className="text-[12px] text-[#9396A5]">/</span>
          <span className="text-[12px] text-[#9396A5]">{totalTime}</span>
        </div>

        {/* Right Controls: Volume, Meter, Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Stereo VU dB Meter */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#9396A5]">volume_up</span>
            <div className="flex flex-col gap-0.5">
              <div className="w-16 h-1 bg-[#1A1C24] rounded-full overflow-hidden flex">
                <div className="w-[75%] bg-gradient-to-r from-[#E05A2B] to-[#D97706]" />
                <div className="w-[10%] bg-[#F87171]" />
              </div>
              <div className="w-16 h-1 bg-[#1A1C24] rounded-full overflow-hidden flex">
                <div className="w-[68%] bg-gradient-to-r from-[#E05A2B] to-[#D97706]" />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-14 accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
          </button>
        </div>
      </div>
    </main>
  );
}
