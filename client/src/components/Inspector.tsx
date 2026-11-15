import { useTimelineStore } from "@/store/timelineStore";

export function Inspector() {
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const timeline = useTimelineStore((s) => s.timeline);
  const updateClipTransform = useTimelineStore((s) => s.updateClipTransform);

  // Locate the selected clip
  let selectedClip = null;
  let trackType = "";
  for (const track of timeline.tracks) {
    const c = track.clips.find((clip) => clip.id === selectedClipId);
    if (c) {
      selectedClip = c;
      trackType = track.type;
      break;
    }
  }

  const transform = selectedClip?.transform || {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
  };

  const handleResetTransform = () => {
    if (!selectedClipId) return;
    updateClipTransform(selectedClipId, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
    });
  };

  return (
    <aside className="w-[300px] h-full bg-[#121318] border-l border-[#262936] flex flex-col shrink-0 select-none z-20 overflow-y-auto">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[#262936] bg-[#0B0C10]/60 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#E05A2B]">tune</span>
          <span className="text-[13px] font-semibold text-[#F4EFEA]">Clip Inspector</span>
        </div>
        {selectedClip ? (
          <span className="font-mono text-[10px] text-[#E05A2B] bg-[#E05A2B]/10 px-1.5 py-0.5 rounded uppercase">
            {trackType} clip
          </span>
        ) : (
          <span className="font-mono text-[10px] text-[#9396A5]">Idle</span>
        )}
      </div>

      <div className="p-3.5 space-y-4">
        {!selectedClip ? (
          <div className="py-12 px-4 text-center space-y-2">
            <span className="material-symbols-outlined text-[32px] text-[#9396A5]/40 block">
              ads_click
            </span>
            <p className="text-[12px] text-[#9396A5] leading-relaxed">
              No clip selected. Click any clip on the timeline to adjust transform and properties.
            </p>
          </div>
        ) : (
          <>
            {/* Clip Timing Info */}
            <div className="p-2.5 rounded-[8px] bg-[#1A1C24] border border-[#262936] text-[11px] font-mono text-[#9396A5] space-y-1">
              <div className="flex justify-between">
                <span>Start:</span>
                <span className="text-[#F4EFEA]">{selectedClip.start.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span>End:</span>
                <span className="text-[#F4EFEA]">{selectedClip.end.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-[#E05A2B]">
                  {(selectedClip.end - selectedClip.start).toFixed(2)}s
                </span>
              </div>
            </div>

            {/* Transform Section */}
            <div className="space-y-3 bg-[#1A1C24] p-3 rounded-[10px] border border-[#262936]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#F4EFEA] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#E05A2B]">transform</span>
                  Transform
                </span>
                <button
                  onClick={handleResetTransform}
                  className="text-[10px] font-mono text-[#9396A5] hover:text-[#E05A2B] transition-colors"
                >
                  RESET
                </button>
              </div>

              {/* Position X / Y */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[6px] bg-[#121318] border border-[#262936]">
                  <span className="text-[10px] font-mono text-[#9396A5]">X</span>
                  <input
                    type="number"
                    value={Math.round(transform.x)}
                    onChange={(e) =>
                      selectedClipId &&
                      updateClipTransform(selectedClipId, { x: Number(e.target.value) })
                    }
                    className="w-14 bg-transparent text-right font-mono text-[11px] text-[#F4EFEA] focus:outline-none"
                  />
                  <span className="text-[10px] font-mono text-[#9396A5]">px</span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[6px] bg-[#121318] border border-[#262936]">
                  <span className="text-[10px] font-mono text-[#9396A5]">Y</span>
                  <input
                    type="number"
                    value={Math.round(transform.y)}
                    onChange={(e) =>
                      selectedClipId &&
                      updateClipTransform(selectedClipId, { y: Number(e.target.value) })
                    }
                    className="w-14 bg-transparent text-right font-mono text-[11px] text-[#F4EFEA] focus:outline-none"
                  />
                  <span className="text-[10px] font-mono text-[#9396A5]">px</span>
                </div>
              </div>

              {/* Scale Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#9396A5]">Scale</span>
                  <span className="font-mono text-[#E05A2B]">
                    {Math.round(transform.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={Math.round(transform.scale * 100)}
                  onChange={(e) =>
                    selectedClipId &&
                    updateClipTransform(selectedClipId, {
                      scale: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#9396A5]">Rotation</span>
                  <span className="font-mono text-[#F4EFEA]">
                    {Math.round(transform.rotation)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={Math.round(transform.rotation)}
                  onChange={(e) =>
                    selectedClipId &&
                    updateClipTransform(selectedClipId, {
                      rotation: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#9396A5]">Opacity</span>
                  <span className="font-mono text-[#F4EFEA]">
                    {Math.round(transform.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(transform.opacity * 100)}
                  onChange={(e) =>
                    selectedClipId &&
                    updateClipTransform(selectedClipId, {
                      opacity: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-[#E05A2B] h-1 bg-[#262936] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Effects Stack Section */}
            <div className="space-y-3 bg-[#1A1C24] p-3 rounded-[10px] border border-[#262936]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#F4EFEA] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#D97706]">auto_awesome</span>
                  Applied Effects ({selectedClip.effects.length})
                </span>
              </div>

              {selectedClip.effects.length === 0 ? (
                <div className="py-3 text-center text-[11px] text-[#9396A5]">
                  No shaders applied yet. Select an effect from the Effects library to attach to this clip.
                </div>
              ) : (
                selectedClip.effects.map((effect) => (
                  <div
                    key={effect.id}
                    className="p-2.5 rounded-[6px] bg-[#121318] border border-[#262936] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#F4EFEA]">
                        {effect.effectId}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
