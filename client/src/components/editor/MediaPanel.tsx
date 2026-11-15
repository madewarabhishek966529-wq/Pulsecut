import { useRef, useState } from "react";
import { importVideo } from "@/lib/mediaImport";
import { useTimelineStore } from "@/store/timelineStore";

function formatDuration(sec?: number): string {
  if (!sec || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function MediaPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const assets = useTimelineStore((s) => s.timeline.assets);
  const addAsset = useTimelineStore((s) => s.addAsset);
  const removeAsset = useTimelineStore((s) => s.removeAsset);

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    setIsImporting(true);
    try {
      const asset = await importVideo(file);
      addAsset(asset);
    } catch (err) {
      console.error("Import error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to import video file."
      );
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleLoadSample = async () => {
    setErrorMessage(null);
    setIsImporting(true);
    try {
      const res = await fetch("/samples/test-video-a.mp4");
      if (!res.ok) {
        throw new Error(`Sample media not found (${res.status} ${res.statusText})`);
      }
      const blob = await res.blob();
      const sampleFile = new File([blob], "test-video-a.mp4", {
        type: "video/mp4",
      });
      await handleProcessFile(sampleFile);
    } catch (err) {
      console.error("Failed to load sample video:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load sample video."
      );
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-y-auto select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="p-2.5 rounded-[8px] bg-[#F87171]/15 border border-[#F87171]/40 text-[#F87171] text-xs flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
            warning
          </span>
          <div className="flex-1 text-[11px] leading-relaxed">
            <span className="font-semibold block mb-0.5">Import Error</span>
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#9396A5] hover:text-[#F4EFEA] text-[14px]"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 rounded-[10px] border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
          isDragging
            ? "border-[#E05A2B] bg-[#E05A2B]/10 scale-[0.99]"
            : "border-[#262936] bg-[#1A1C24] hover:border-[#E05A2B]/60"
        }`}
      >
        <span className="material-symbols-outlined text-[28px] text-[#E05A2B] mb-1 group-hover:scale-110 transition-transform">
          cloud_upload
        </span>
        <span className="text-[12px] font-semibold text-[#F4EFEA]">
          {isImporting ? "Processing video..." : "Import Media File"}
        </span>
        <span className="text-[10px] text-[#9396A5] mt-0.5">
          Drag & drop MP4, WebM or click to browse
        </span>
      </div>

      {/* Dev-only Quick Load Button */}
      <button
        onClick={handleLoadSample}
        disabled={isImporting}
        className="w-full py-1.5 px-3 rounded-[6px] bg-[#1A1C24] hover:bg-[#262936] border border-[#262936] text-[11px] font-medium text-[#E05A2B] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[15px]">movie</span>
        <span>Load Sample Video (Dev)</span>
      </button>

      {/* Project Assets Section */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0 pt-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-[#9396A5]">
          <span>Project Assets</span>
          <span>{assets.length}</span>
        </div>

        {/* Empty Assets List State */}
        {assets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#9396A5] border border-dashed border-[#262936]/60 rounded-[8px]">
            <span className="material-symbols-outlined text-3xl mb-1.5 text-[#9396A5]/60">
              video_file
            </span>
            <span className="text-xs font-medium text-[#F4EFEA]">No media yet</span>
            <span className="text-[10px] text-[#9396A5] mt-0.5">
              Import a video to start editing
            </span>
          </div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto pr-0.5">
            {assets.map((asset) => {
              const uAsset = asset as typeof asset & { name?: string };
              return (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-2 rounded-[6px] bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B]/40 transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-[#E05A2B] shrink-0">
                      movie
                    </span>
                    <div className="truncate">
                      <p className="text-[11px] text-[#F4EFEA] font-medium truncate">
                        {uAsset.name || asset.id}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-[#9396A5] font-mono">
                        {asset.width && asset.height && (
                          <span>
                            {asset.width}x{asset.height}
                          </span>
                        )}
                        <span>{formatDuration(asset.duration)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAsset(asset.id);
                    }}
                    title="Remove asset"
                    className="w-6 h-6 rounded flex items-center justify-center text-[#9396A5] hover:text-[#F87171] hover:bg-[#262936] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      delete
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

