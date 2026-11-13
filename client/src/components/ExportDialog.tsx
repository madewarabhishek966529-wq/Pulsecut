import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [resolution, setResolution] = useState("1080p");
  const [fps, setFps] = useState("60");
  const [quality, setQuality] = useState("Balanced");
  const [status, setStatus] = useState<"idle" | "rendering" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const handleStartExport = () => {
    setStatus("rendering");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("done");
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
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
                {/* Project Thumbnail & Meta */}
                <div className="flex items-center gap-4 p-3 rounded-[10px] bg-[#1A1C24] border border-[#262936]">
                  <div className="relative w-28 aspect-video rounded-[6px] overflow-hidden bg-black shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80"
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 font-mono text-[9px] text-[#E05A2B]">
                      00:12:00
                    </span>
                  </div>
                  <div className="truncate">
                    <h4 className="text-[14px] font-semibold text-[#F4EFEA] truncate">Cyber_Beat_Drop_v2.mp4</h4>
                    <p className="text-[12px] text-[#9396A5]">9:16 Vertical Reel • 3 Tracks</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[#E05A2B]/15 text-[#E05A2B] font-mono text-[10px]">
                      H.264 / AAC
                    </span>
                  </div>
                </div>

                {/* Settings Grid */}
                <div className="space-y-4">
                  {/* Resolution */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[#9396A5]">Resolution</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["720p", "1080p", "4K"].map((res) => {
                        const is4K = res === "4K";
                        const isSelected = resolution === res && !is4K;
                        return (
                          <button
                            key={res}
                            disabled={is4K}
                            onClick={() => !is4K && setResolution(res)}
                            className={`px-3 py-2 rounded-[6px] text-[13px] font-medium border flex items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? "bg-[#E05A2B]/15 border-[#E05A2B] text-[#E05A2B]"
                                : is4K
                                ? "bg-[#1A1C24]/40 border-[#262936] text-[#9396A5]/40 cursor-not-allowed"
                                : "bg-[#1A1C24] border-[#262936] text-[#F4EFEA] hover:bg-[#262936]"
                            }`}
                          >
                            <span>{res}</span>
                            {is4K && (
                              <span className="px-1 py-0.2 rounded bg-[#262936] text-[9px] text-[#9396A5] uppercase font-mono">
                                Soon
                              </span>
                            )}
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

                {/* Estimate info bar */}
                <div className="flex items-center justify-between p-3 rounded-[6px] bg-[#1A1C24] border border-[#262936] font-mono text-[12px]">
                  <span className="text-[#9396A5]">Estimated File Size:</span>
                  <span className="text-[#E05A2B] font-semibold">~42.8 MB (Render time: ~14s)</span>
                </div>
              </>
            )}

            {/* Progress State */}
            {status === "rendering" && (
              <div className="py-8 space-y-5 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#E05A2B]/10 flex items-center justify-center border border-[#E05A2B]/30 animate-pulse">
                  <span className="material-symbols-outlined text-[32px] text-[#E05A2B]">memory</span>
                </div>
                <div>
                  <h4 className="text-[16px] font-semibold text-[#F4EFEA]">Rendering Frames on GPU</h4>
                  <p className="text-[12px] text-[#9396A5] font-mono mt-1">
                    Frame {Math.round((progress / 100) * 360)} of 360 ({progress}%)
                  </p>
                </div>

                {/* Progress Bar with Warm Coral-Amber gradient */}
                <div className="w-full h-2 rounded-full bg-[#1A1C24] overflow-hidden p-0.5 border border-[#262936]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E05A2B] to-[#D97706] transition-all duration-300 shadow-[0_0_12px_rgba(224,90,43,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 rounded-[6px] border border-[#262936] hover:bg-[#1A1C24] text-[12px] text-[#9396A5] hover:text-[#F4EFEA]"
                >
                  Cancel Export
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
                  <h4 className="text-[18px] font-bold text-[#F4EFEA]">Export Complete!</h4>
                  <p className="text-[12px] text-[#9396A5] font-mono mt-1">Cyber_Beat_Drop_v2.mp4 • 43.1 MB</p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button className="btn-primary px-6 py-2 text-[13px] text-[#0B0C10] font-semibold flex items-center gap-2 shadow-[0_0_16px_rgba(224,90,43,0.4)]">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Download Video
                  </button>
                  <button className="px-4 py-2 rounded-[6px] border border-[#262936] bg-[#1A1C24] hover:bg-[#262936] text-[13px] text-[#F4EFEA] flex items-center gap-2 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">link</span>
                    Copy Link
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
                onClick={handleStartExport}
                className="btn-primary px-6 py-1.5 text-[13px] text-[#0B0C10] font-semibold shadow-[0_0_16px_rgba(224,90,43,0.4)] flex items-center gap-1.5"
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
