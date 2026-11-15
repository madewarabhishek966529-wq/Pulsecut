interface LandingPageViewProps {
  onStartEditing: () => void;
}

export function LandingPageView({ onStartEditing }: LandingPageViewProps) {
  return (
    <div className="flex-1 w-full bg-[#0B0C10] text-[#F4EFEA] overflow-y-auto select-none">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 max-w-6xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* Glowing Background Blob */}
        <div className="absolute top-1/4 w-[600px] h-[350px] bg-gradient-to-r from-[#E05A2B]/20 via-[#D97706]/20 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1C24] border border-[#262936] text-[12px] text-[#E05A2B] font-mono shadow-[0_0_12px_rgba(224,90,43,0.3)]">
          <span className="material-symbols-outlined text-[14px] animate-pulse">bolt</span>
          <span>Pulsecut • Warm Precision Edition</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl leading-tight">
          Edit at the{" "}
          <span className="bg-gradient-to-r from-[#E05A2B] via-[#F9A888] to-[#D97706] bg-clip-text text-transparent">
            speed of the beat.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#9396A5] max-w-2xl leading-relaxed">
          AI-generated GLSL GPU shaders, Web Audio beat reactivity, and browser-first video composition.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onStartEditing}
            className="btn-primary px-7 py-3 text-[14px] font-bold text-[#0B0C10] flex items-center gap-2 shadow-[0_0_24px_rgba(224,90,43,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Start Editing
          </button>
        </div>

        {/* Product Editor Mockup Preview Frame */}
        <div className="w-full pt-10 relative">
          <div className="relative rounded-[14px] border border-[#262936] bg-[#121318] p-6 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col gap-4">
            {/* Mock Editor Top Header */}
            <div className="flex items-center justify-between border-b border-[#262936] pb-3 text-[12px] text-[#9396A5]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E05A2B]" />
                <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                <span className="w-3 h-3 rounded-full bg-[#34D399]" />
                <span className="ml-2 font-mono text-[#F4EFEA]">pulsecut-editor-stage</span>
              </div>
              <span className="font-mono text-[#E05A2B]">PixiJS v8 • WebGL</span>
            </div>

            {/* Mock Viewport */}
            <div className="aspect-[16/9] w-full rounded-[10px] bg-[#0B0C10] border border-[#262936] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#E05A2B]/10 via-transparent to-[#D97706]/10" />
              <span className="material-symbols-outlined text-[48px] text-[#E05A2B] animate-pulse">
                auto_awesome
              </span>
              <p className="font-mono text-[13px] text-[#F4EFEA] mt-2">
                GPU Hardware Accelerated Composition
              </p>
              <span className="font-mono text-[11px] text-[#9396A5]">
                Contain-Fit Multi-Track Real-time Scrubbing
              </span>
            </div>

            {/* Bottom Status strip */}
            <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#0B0C10] border border-[#262936] font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                <span className="text-[#34D399]">GPU SHADER PIPELINE ONLINE</span>
              </div>
              <span className="text-[#9396A5]">Web Audio FFT • 60 FPS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-[#262936]">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-bold text-[#F4EFEA]">Engineered for Modern Creators</h2>
          <p className="text-[14px] text-[#9396A5]">Pro grade video editing driven by WebGL & Web Audio API</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-[14px] bg-[#121318] border border-[#262936] hover:border-[#E05A2B] space-y-3 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-[#E05A2B]/15 flex items-center justify-center text-[#E05A2B]">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#F4EFEA] group-hover:text-[#E05A2B] transition-colors">
              Prompt-to-Filter
            </h3>
            <p className="text-[13px] text-[#9396A5] leading-relaxed">
              Write what you want in plain words. Gemini synthesizes custom GLSL fragment shaders compiled in real-time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-[14px] bg-[#121318] border border-[#262936] hover:border-[#D97706] space-y-3 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-[#D97706]/15 flex items-center justify-center text-[#D97706]">
              <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#F4EFEA] group-hover:text-[#D97706] transition-colors">
              Beat-Reactive Effects
            </h3>
            <p className="text-[13px] text-[#9396A5] leading-relaxed">
              Automatic FFT audio spectrum analysis binds parameters (uBass, uBeat, uMid) directly to your filter intensity.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-[14px] bg-[#121318] border border-[#262936] hover:border-[#34D399] space-y-3 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-[#34D399]/15 flex items-center justify-center text-[#34D399]">
              <span className="material-symbols-outlined text-[24px]">bolt</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#F4EFEA] group-hover:text-[#34D399] transition-colors">
              Browser-Native Performance
            </h3>
            <p className="text-[13px] text-[#9396A5] leading-relaxed">
              Powered by PixiJS v8 and WebGL/WebGPU. No installs, zero subscriptions, complete creative control.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
