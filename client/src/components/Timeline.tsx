import { useState, useEffect } from "react";
import { useTimelineStore } from "@/store/timelineStore";

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 30);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

export function Timeline() {
  const [zoom, setZoom] = useState(50);
  const timeline = useTimelineStore((s) => s.timeline);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);
  const selectClip = useTimelineStore((s) => s.selectClip);
  const splitClip = useTimelineStore((s) => s.splitClip);
  const deleteClip = useTimelineStore((s) => s.deleteClip);

  const duration = Math.max(timeline.project.duration, 1);
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  const handleSplit = () => {
    let targetId = selectedClipId;
    if (!targetId) {
      // Find video or audio clip currently intersecting the playhead
      for (const track of timeline.tracks) {
        const found = track.clips.find(
          (c) => currentTime >= c.start && currentTime <= c.end
        );
        if (found) {
          targetId = found.id;
          break;
        }
      }
    }
    if (targetId) {
      splitClip(targetId, currentTime);
    }
  };

  const handleDelete = () => {
    if (selectedClipId) {
      deleteClip(selectedClipId);
    }
  };

  // Keyboard shortcuts (S = split, Delete/Backspace = delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleSplit();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedClipId) {
          e.preventDefault();
          handleDelete();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedClipId, currentTime, timeline]);

  // Generate dynamic ruler ticks based on project duration
  const rulerTicksCount = 7;
  const tickTimes = Array.from({ length: rulerTicksCount }, (_, i) =>
    (i / (rulerTicksCount - 1)) * duration
  );

  return (
    <section className="h-64 w-full bg-[#121318] border-t border-[#262936] flex flex-col shrink-0 select-none relative z-20">
      {/* Timeline Toolbar Header */}
      <div className="h-9 px-4 bg-[#0B0C10]/70 border-b border-[#262936] flex items-center justify-between text-[11px] text-[#9396A5]">
        {/* Track Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSplit}
            title="Split clip at playhead (S)"
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1A1C24] hover:text-[#F4EFEA] transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-[#E05A2B]">content_cut</span>
            <span>Split (S)</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={!selectedClipId}
            title="Delete selected clip (Del)"
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              selectedClipId
                ? "hover:bg-[#1A1C24] hover:text-[#F87171] text-[#9396A5]"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">delete</span>
            <span>Delete</span>
          </button>
          <div className="h-3.5 w-px bg-[#262936]" />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1C24] text-[#9396A5] font-mono text-[10px]">
            <span>Duration: {duration.toFixed(2)}s</span>
          </div>
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
          const clickPercent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          setCurrentTime(clickPercent * duration);
        }}
        className="h-6 bg-[#0B0C10] border-b border-[#262936] relative font-mono text-[9px] text-[#9396A5] flex items-center px-2 overflow-hidden cursor-pointer"
      >
        {tickTimes.map((tick, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: `${(i / (rulerTicksCount - 1)) * 90 + 5}%` }}
          >
            <span>{formatTimecode(tick).slice(3)}</span>
            <div className="h-1.5 w-px bg-[#262936] mt-0.5" />
          </div>
        ))}
      </div>

      {/* Tracks Container */}
      <div
        onClick={() => selectClip(null)}
        className="flex-1 overflow-x-auto overflow-y-hidden p-2 space-y-2 relative bg-[#0B0C10]/40"
      >
        {/* Playhead Overlay */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none transition-[left] duration-75"
          style={{ left: `${playheadPercent}%` }}
        >
          {/* Top Triangle Handle */}
          <div className="relative -left-2 -top-1 w-4 h-3 bg-[#E05A2B] [clip-path:polygon(0_0,100%_0,50%_100%)] shadow-[0_0_12px_#E05A2B]" />
          {/* Warm Coral line */}
          <div className="w-[2px] h-full bg-[#E05A2B] shadow-[0_0_8px_#E05A2B]" />
          {/* Floating Timecode Chip */}
          <div className="absolute top-2 -left-8 px-1.5 py-0.5 rounded bg-[#0B0C10] border border-[#E05A2B] font-mono text-[9px] text-[#E05A2B] whitespace-nowrap shadow-md">
            {formatTimecode(currentTime)}
          </div>
        </div>

        {/* Dynamic Tracks from Timeline Store */}
        {timeline.tracks.map((track) => {
          const isVideo = track.type === "video";
          const isText = track.type === "text";

          const trackColor = isVideo
            ? "#E05A2B"
            : isText
            ? "#F59E0B"
            : "#34D399";

          const trackIcon = isVideo
            ? "videocam"
            : isText
            ? "title"
            : "graphic_eq";

          const trackLabel = isVideo ? "V1" : isText ? "T1" : "A1";

          return (
            <div
              key={track.id}
              className={`rounded-[8px] bg-[#1A1C24]/60 border border-[#262936] flex items-center px-2 relative group ${
                isVideo ? "h-14" : isText ? "h-10" : "h-12"
              }`}
            >
              <div
                className="w-16 shrink-0 flex items-center gap-1.5 text-[11px] font-semibold"
                style={{ color: trackColor }}
              >
                <span className="material-symbols-outlined text-[14px]">{trackIcon}</span>
                <span>{trackLabel}</span>
              </div>

              <div className="flex-1 h-full flex items-center relative overflow-hidden py-1">
                {track.clips.length === 0 ? (
                  <div className="w-full text-center text-[10px] text-[#9396A5]/50 italic">
                    Empty track • Import or drag media to place here
                  </div>
                ) : (
                  track.clips.map((clip) => {
                    const isSelected = selectedClipId === clip.id;
                    const leftPct = (clip.start / duration) * 100;
                    const widthPct = Math.max(2, ((clip.end - clip.start) / duration) * 100);

                    // Find associated asset name if present
                    const asset = timeline.assets.find((a) => a.id === clip.assetId);
                    const clipName =
                      asset && "name" in asset
                        ? (asset as any).name
                        : clip.text || `${track.type} clip`;

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectClip(clip.id);
                        }}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        className={`absolute h-[85%] rounded-[8px] flex items-center justify-between px-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-2 shadow-[0_0_12px_rgba(224,90,43,0.35)]"
                            : "border opacity-85 hover:opacity-100"
                        }`}
                        // Styled dynamically based on track type
                      >
                        <div
                          className="absolute inset-0 rounded-[7px] pointer-events-none"
                          style={{
                            backgroundColor: `${trackColor}25`,
                            borderColor: trackColor,
                            borderWidth: isSelected ? "2px" : "1px",
                          }}
                        />

                        <div className="flex items-center gap-1.5 truncate z-10">
                          <span
                            className="material-symbols-outlined text-[12px]"
                            style={{ color: trackColor }}
                          >
                            {trackIcon}
                          </span>
                          <span className="text-[11px] font-medium text-[#F4EFEA] truncate">
                            {clipName}
                          </span>
                          {clip.effects.length > 0 && (
                            <span className="px-1 rounded bg-[#D97706]/30 border border-[#D97706]/50 text-[8px] text-[#D97706] font-mono">
                              {clip.effects.length} FX
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
