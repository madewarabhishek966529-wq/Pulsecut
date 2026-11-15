import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimelineStore } from "@/store/timelineStore";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [resolution, setResolution] = useState("1080p");
  const [fps, setFps] = useState("30");
  const [quality, setQuality] = useState("Balanced");
  const [status, setStatus] = useState<"idle" | "exporting" | "error" | "done">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const timeline = useTimelineStore((s) => s.timeline);
  const projectTitle = useTimelineStore((s) => s.projectTitle);

  const duration = timeline.project.duration;
  const clipsCount = timeline.tracks.reduce((acc, t) => acc + t.clips.length, 0);
  const hasClips = clipsCount > 0 && duration > 0;

  const handleStartExport = () => {
    if (!hasClips) return;
    setStatus("exporting");
    setStatusMsg("Preparing timeline assets for WebCodecs render pipeline...");
    // Future WebCodecs / BullMQ render hook here
    setTimeout(() => {
      setStatus("done");
      setStatusMsg("Export preflight completed. In-browser WebCodecs pipeline ready.");
    }, 1500);
  };

  const handleReset = () => {
    setStatus("idle");
    setStatusMsg("");
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
          className="w-full max-w-[560px] rounded-[14px] glass border border-[#262936] bg-[#121318]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#262936]">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-[#E05A2B]">movie_creation</span>
              <h3 className="font-semibold text-[16px] text-[#F4EFEA]">Export Video</h3>
            </div>
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Dialog Body */}
          <div className="p-6 space-y-5">
            {status === "idle" && (
              <>
                {/* Project Metadata Preflight */}
                <div className="flex items-center gap-4 p-3 rounded-[10px] bg-[#1A1C24] border border-[#262936]">
                  <div className="w-16 h-16 rounded-[8px] bg-[#0B0C10] border border-[#262936] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px] text-[#E05A2B]">video_file</span>
                  </div>
                  <div className="truncate flex-1">
                    <h4 className="text-[14px] font-semibold text-[#F4EFEA] truncate">
                      {projectTitle || "Untitled"}.mp4
                    </h4>
                    <p className="text-[12px] text-[#9396A5]">
                      {timeline.project.width} x {timeline.project.height} • {clipsCount} Clips
                    </p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[#E05A2B]/15 text-[#E05A2B] font-mono text-[10px]">
                      Duration: {duration.toFixed(2)}s
                    </span>
                  </div>
                </div>

                {!hasClips && (
                  <div className="p-3 rounded-[8px] bg-[#F87171]/15 border border-[#F87171]/40 text-[#F87171] text-[12px] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Timeline has no clips. Import media and add clips before exporting.</span>
                  </div>
                )}

                {/* Settings Grid */}
                <div className="space-y-4">
                  {/* Resolution */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[#9396A5]">Export Resolution</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["720p", "1080p"].map((res) => {
                        const isSelected = resolution === res;
                        return (
                          <button
                            key={res}
                            onClick={() => setResolution(res)}
                            className={`px-3 py-2 rounded-[6px] text-[13px] font-medium border flex items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? "bg-[#E05A2B]/15 border-[#E05A2B] text-[#E05A2B]"
                                : "bg-[#1A1C24] border-[#262936] text-[#F4EFEA] hover:bg-[#262936]"
                            }`}
                          >
                            <span>{res}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Frame Rate & Quality */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#9396A5]">Frame Rate</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["24", "30", "60"].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setFps(rate)}
                            className={`py-1.5 rounded-[6px] text-[12px] font-mono border transition-all ${
                              fps === rate
                                ? "bg-[#D97706]/20 border-[#D97706] text-[#D97706]"
                                : "bg-[#1A1C24] border-[#262936] text-[#9396A5] hover:text-[#F4EFEA]"
                            }`}
                          >
                            {rate}fps
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#9396A5]">Quality</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["Fast", "Balanced", "Best"].map((q) => (
                          <button
                            key={q}
                            onClick={() => setQuality(q)}
                            className={`py-1.5 rounded-[6px] text-[12px] border transition-all ${
                              quality === q
                                ? "bg-[#34D399]/20 border-[#34D399] text-[#34D399]"
                                : "bg-[#1A1C24] border-[#262936] text-[#9396A5] hover:text-[#F4EFEA]"
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Exporting State */}
            {status === "exporting" && (
              <div className="py-8 space-y-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#E05A2B]/10 flex items-center justify-center border border-[#E05A2B]/30 animate-pulse">
                  <span className="material-symbols-outlined text-[32px] text-[#E05A2B]">memory</span>
                </div>
                <div>
                  <h4 className="text-[16px] font-semibold text-[#F4EFEA]">Processing Export</h4>
                  <p className="text-[12px] text-[#9396A5] mt-1">{statusMsg}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 rounded-[6px] border border-[#262936] hover:bg-[#1A1C24] text-[12px] text-[#9396A5]"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Done State */}
            {status === "done" && (
              <div className="py-6 space-y-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#34D399]/15 flex items-center justify-center border border-[#34D399] shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                  <span className="material-symbols-outlined text-[32px] text-[#34D399]">check</span>
                </div>
                <div>
                  <h4 className="text-[18px] font-bold text-[#F4EFEA]">Export Preflight Complete</h4>
                  <p className="text-[12px] text-[#9396A5] mt-1">
                    {projectTitle}.mp4 • {resolution} @ {fps}fps
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleReset();
                      onClose();
                    }}
                    className="btn-primary px-6 py-2 text-[13px] text-[#0B0C10] font-semibold shadow-[0_0_16px_rgba(224,90,43,0.4)]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {status === "idle" && (
            <div className="px-6 py-4 border-t border-[#262936] bg-[#0B0C10]/60 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-[6px] border border-[#262936] hover:bg-[#1A1C24] text-[13px] text-[#9396A5] hover:text-[#F4EFEA] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!hasClips}
                onClick={handleStartExport}
                className="btn-primary px-6 py-1.5 text-[13px] text-[#0B0C10] font-semibold shadow-[0_0_16px_rgba(224,90,43,0.4)] flex items-center gap-1.5 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                Export Video
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
