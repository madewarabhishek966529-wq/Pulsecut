import { PreviewCanvas } from "./editor/PreviewCanvas";
import { Transport } from "./editor/Transport";
import { useTimelineStore } from "@/store/timelineStore";

export function PreviewStage() {
  const project = useTimelineStore((s) => s.timeline.project);
  const isPlaying = useTimelineStore((s) => s.isPlaying);

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#0B0C10] relative select-none overflow-hidden">
      {/* Stage Header Info */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#262936]/70 text-[11px] font-mono text-[#9396A5] shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#F4EFEA]">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying
                  ? "bg-[#E05A2B] animate-pulse"
                  : "bg-[#9396A5]"
              }`}
            />
            Viewport: {project.width} x {project.height}
          </span>
          <span className="text-[#9396A5]">Scale: Contain Fit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#34D399]">PixiJS v8 • WebGL</span>
        </div>
      </div>

      {/* Center Video Canvas Viewport */}
      <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden bg-[radial-gradient(#1A1C24_1px,transparent_1px)] bg-[size:16px_16px]">
        {/* Ambient Backlight Glow */}
        <div className="absolute w-[450px] h-[650px] bg-gradient-to-r from-[#E05A2B]/10 via-[#D97706]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Viewport Frame */}
        <div className="relative w-full h-full max-w-full max-h-full rounded-[10px] overflow-hidden border border-[#262936] bg-black shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-center">
          <PreviewCanvas />
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <Transport />
    </main>
  );
}
