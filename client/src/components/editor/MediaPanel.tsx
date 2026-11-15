import { useRef, useState } from "react";
import { importMediaFile } from "@/lib/mediaImport";
import { useTimelineStore } from "@/store/timelineStore";
import { newId } from "@/lib/id";
import type { Clip } from "@/types/timeline";

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
  const [filterType, setFilterType] = useState<"all" | "video" | "image" | "audio">("all");
  const [search, setSearch] = useState("");

  const assets = useTimelineStore((s) => s.timeline.assets);
  const timeline = useTimelineStore((s) => s.timeline);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const addAsset = useTimelineStore((s) => s.addAsset);
  const removeAsset = useTimelineStore((s) => s.removeAsset);
  const setTimeline = useTimelineStore((s) => s.setTimeline);
  const selectClip = useTimelineStore((s) => s.selectClip);

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    setIsImporting(true);
    try {
      const asset = await importMediaFile(file);
      addAsset(asset);
    } catch (err) {
      console.error("Import error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to import media file."
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

  // Click on asset in media library to place on timeline at currentTime
  const handleAddAssetToTimeline = (asset: (typeof assets)[0]) => {
    const clipDuration = asset.duration || 5.0;
    const isAudio = asset.type === "audio";
    const targetTrackType = isAudio ? "audio" : "video";

    let trackIndex = timeline.tracks.findIndex((t) => t.type === targetTrackType);
    let newTracks = [...timeline.tracks];

    const newClip: Clip = {
      id: newId("clip"),
      assetId: asset.id,
      start: currentTime,
      end: currentTime + clipDuration,
      sourceIn: 0,
      fadeIn: 0,
      fadeOut: 0,
      volume: 1,
      transform: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
      },
      effects: [],
    };

    if (trackIndex >= 0) {
      newTracks[trackIndex] = {
        ...newTracks[trackIndex],
        clips: [...newTracks[trackIndex].clips, newClip],
      };
    } else {
      newTracks.push({
        id: `t-${targetTrackType}`,
        type: targetTrackType,
        locked: false,
        muted: false,
        clips: [newClip],
      });
    }

    const maxEnd = Math.max(
      timeline.project.duration,
      newClip.end
    );

    setTimeline({
      ...timeline,
      tracks: newTracks,
      project: {
        ...timeline.project,
        duration: maxEnd,
      },
    });

    selectClip(newClip.id);
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesFilter = filterType === "all" || asset.type === filterType;
    const assetName = "name" in asset ? (asset as any).name : asset.id;
    const matchesSearch = assetName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-y-auto select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*,audio/*"
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
          {isImporting ? "Processing media..." : "Import Media File"}
        </span>
        <span className="text-[10px] text-[#9396A5] mt-0.5">
          Video (MP4, WebM), Images (PNG, JPG), Audio (MP3, WAV)
        </span>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <span className="material-symbols-outlined text-[15px] text-[#9396A5] absolute left-2.5 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media..."
            className="w-full bg-[#1A1C24] border border-[#262936] rounded-[6px] pl-8 pr-2.5 py-1 text-[11px] text-[#F4EFEA] placeholder-[#9396A5]/50 focus:outline-none focus:border-[#E05A2B] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          {(["all", "video", "image", "audio"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-1 py-1 rounded-[4px] text-[10px] font-medium capitalize transition-colors ${
                filterType === t
                  ? "bg-[#E05A2B]/20 text-[#E05A2B] font-semibold"
                  : "bg-[#1A1C24] text-[#9396A5] hover:text-[#F4EFEA]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Project Assets Section */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0 pt-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-[#9396A5]">
          <span>Project Media</span>
          <span>{filteredAssets.length}</span>
        </div>

        {/* Empty Assets List State */}
        {filteredAssets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#9396A5] border border-dashed border-[#262936]/60 rounded-[8px]">
            <span className="material-symbols-outlined text-3xl mb-1.5 text-[#9396A5]/60">
              perm_media
            </span>
            <span className="text-xs font-medium text-[#F4EFEA]">No media found</span>
            <span className="text-[10px] text-[#9396A5] mt-0.5">
              Import files or clear search filters
            </span>
          </div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto pr-0.5">
            {filteredAssets.map((asset) => {
              const uAsset = asset as typeof asset & { name?: string };
              const isVideo = asset.type === "video";
              const isImage = asset.type === "image";

              const icon = isVideo ? "movie" : isImage ? "image" : "graphic_eq";
              const iconColor = isVideo ? "#E05A2B" : isImage ? "#D97706" : "#34D399";

              return (
                <div
                  key={asset.id}
                  onClick={() => handleAddAssetToTimeline(asset)}
                  title="Click to add to timeline at playhead"
                  className="flex items-center justify-between p-2 rounded-[6px] bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B]/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span
                      className="material-symbols-outlined text-[18px] shrink-0"
                      style={{ color: iconColor }}
                    >
                      {icon}
                    </span>
                    <div className="truncate">
                      <p className="text-[11px] text-[#F4EFEA] font-medium truncate group-hover:text-[#E05A2B] transition-colors">
                        {uAsset.name || asset.id}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-[#9396A5] font-mono">
                        {asset.width && asset.height && (
                          <span>
                            {asset.width}x{asset.height}
                          </span>
                        )}
                        {asset.duration !== undefined && (
                          <span>{formatDuration(asset.duration)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[16px] text-[#9396A5] group-hover:text-[#E05A2B] opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Place on timeline"
                    >
                      add_circle
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAsset(asset.id);
                      }}
                      title="Remove asset"
                      className="w-6 h-6 rounded flex items-center justify-center text-[#9396A5] hover:text-[#F87171] hover:bg-[#262936] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
