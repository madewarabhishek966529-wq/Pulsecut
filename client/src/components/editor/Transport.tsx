import { useEffect } from "react";
import { useTimelineStore } from "@/store/timelineStore";

function formatTimecode(seconds: number, fps = 30): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
}

export function Transport() {
  const timeline = useTimelineStore((s) => s.timeline);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);
  const setPlaying = useTimelineStore((s) => s.setPlaying);

  const duration = timeline.project.duration;
  const fps = timeline.project.fps || 30;
  const hasAssets = timeline.assets.length > 0;

  // Spacebar hotkey to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (hasAssets && duration > 0) {
          // If at the end and press space, restart from beginning
          if (currentTime >= duration) {
            setCurrentTime(0);
            setPlaying(true);
          } else {
            setPlaying(!isPlaying);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, hasAssets, duration, currentTime, setCurrentTime, setPlaying]);

  const togglePlay = () => {
    if (!hasAssets || duration <= 0) return;
    if (currentTime >= duration) {
      setCurrentTime(0);
      setPlaying(true);
    } else {
      setPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
  };

  const stepFrame = (framesDelta: number) => {
    if (duration <= 0) return;
    const frameDuration = 1 / fps;
    const newTime = Math.min(
      duration,
      Math.max(0, currentTime + framesDelta * frameDuration)
    );
    setCurrentTime(newTime);
  };

  return (
    <div className="h-14 bg-[#121318] border-t border-[#262936] px-4 flex flex-col justify-center gap-1.5 shrink-0 select-none">
      {/* Seek Scrub Bar */}
      <div className="w-full flex items-center gap-2 group">
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 1}
          step={1 / fps}
          value={currentTime}
          disabled={!hasAssets || duration === 0}
          onChange={handleSeek}
          aria-label="Timeline seek scrubber"
          className="w-full h-1.5 bg-[#1A1C24] hover:bg-[#262936] rounded-lg appearance-none cursor-pointer accent-[#E05A2B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {/* Control Tools Bar */}
      <div className="flex items-center justify-between">
        {/* Left: Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => stepFrame(-1)}
            disabled={!hasAssets}
            title="Step back 1 frame (Left Arrow)"
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              skip_previous
            </span>
          </button>

          <button
            onClick={togglePlay}
            disabled={!hasAssets}
            title="Play / Pause (Space)"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[#0B0C10] shadow-[0_0_12px_rgba(224,90,43,0.4)] transition-all ${
              hasAssets
                ? "bg-gradient-to-tr from-[#E05A2B] to-[#D97706] hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-[#262936] text-[#9396A5] cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined text-[19px] font-bold">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          <button
            onClick={() => stepFrame(1)}
            disabled={!hasAssets}
            title="Step forward 1 frame (Right Arrow)"
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              skip_next
            </span>
          </button>
        </div>

        {/* Center: Timecode readout */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="font-bold text-[#E05A2B]">
            {formatTimecode(currentTime, fps)}
          </span>
          <span className="text-[#9396A5]">/</span>
          <span className="text-[#9396A5]">{formatTimecode(duration, fps)}</span>
        </div>

        {/* Right: Info chips */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#9396A5] bg-[#1A1C24] px-2 py-0.5 rounded border border-[#262936]">
            {fps} FPS
          </span>
          {timeline.project.width > 0 && (
            <span className="text-[10px] font-mono text-[#9396A5] bg-[#1A1C24] px-2 py-0.5 rounded border border-[#262936]">
              {timeline.project.width}x{timeline.project.height}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

