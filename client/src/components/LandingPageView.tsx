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
          <span>Pulsecut • Warm Precision Pro Edition</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl leading-tight">
          Edit at the{" "}
          <span className="bg-gradient-to-r from-[#E05A2B] via-[#F9A888] to-[#D97706] bg-clip-text text-transparent">
            speed of the beat.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#9396A5] max-w-2xl leading-relaxed">
          AI-made filters, music-reactive GPU shaders, and real-time editing by chat. In a refined warm precision dark palette.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onStartEditing}
            className="btn-primary px-7 py-3 text-[14px] font-bold text-[#0B0C10] flex items-center gap-2 shadow-[0_0_24px_rgba(224,90,43,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Start Editing
          </button>
          <button
            onClick={onStartEditing}
            className="px-6 py-3 rounded-[10px] bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B] text-[14px] font-semibold text-[#F4EFEA] transition-colors"
          >
            Watch Demo
          </button>
        </div>

        {/* Product Editor Mockup Preview */}
        <div className="w-full pt-10 relative">
          <div className="relative rounded-[14px] border border-[#262936] bg-[#121318] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] group">
            <img
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1400&auto=format&fit=crop&q=80"
              alt="Pulsecut Editor Preview"
              className="w-full aspect-[16/9] object-cover opacity-85 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-4 rounded-[10px] bg-[#121318]/90 backdrop-blur-md border border-[#262936]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#E05A2B] animate-pulse" />
                <span className="font-mono text-[12px] text-[#E05A2B]">WARM PRECISION GPU SHADER PIPELINE ACTIVE</span>
              </div>
              <span className="font-mono text-[12px] text-[#9396A5]">128 BPM • 60 FPS</span>
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
              Write what you want in plain words. The server synthesizes custom GLSL fragment shaders compiled in real-time.
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
              <span className="material-symbols-outlined text-[24px]">chat</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#F4EFEA] group-hover:text-[#34D399] transition-colors">
              Edit by Chat
            </h3>
            <p className="text-[13px] text-[#9396A5] leading-relaxed">
              Direct the editor like a human assistant: "Cut on every beat drop", "Add warm precision glow", or "Speed up the intro".
            </p>
          </div>
        </div>
      </section>

      {/* How it Works: 3 Steps */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-[#262936]">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-bold text-[#F4EFEA]">How it Works</h2>
          <p className="text-[14px] text-[#9396A5]">From raw footage to viral edit in three simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Upload Footage",
              desc: "Drag your video clips and soundtrack onto the timeline canvas.",
            },
            {
              step: "02",
              title: "Describe & Bind",
              desc: "Type a prompt for visual filters and sync effects to transient beat peaks.",
            },
            {
              step: "03",
              title: "Export in 1080p",
              desc: "Render high-performance MP4 video with full hardware GPU acceleration.",
            },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-[10px] bg-[#1A1C24]/50 border border-[#262936] space-y-2">
              <span className="font-mono text-[28px] font-bold text-[#E05A2B]">{item.step}</span>
              <h4 className="text-[16px] font-semibold text-[#F4EFEA]">{item.title}</h4>
              <p className="text-[13px] text-[#9396A5] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Band */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <div className="p-10 rounded-[14px] bg-gradient-to-r from-[#121318] via-[#241a15] to-[#121318] border border-[#E05A2B]/40 shadow-[0_0_30px_rgba(224,90,43,0.2)] space-y-5">
          <h2 className="text-3xl font-bold text-[#F4EFEA]">Ready to edit at the speed of sound?</h2>
          <p className="text-[14px] text-[#9396A5] max-w-lg mx-auto">
            Experience next-generation AI video editing right now in your modern browser.
          </p>
          <button
            onClick={onStartEditing}
            className="btn-primary px-8 py-3 text-[14px] font-bold text-[#0B0C10] shadow-[0_0_20px_rgba(224,90,43,0.5)]"
          >
            Open Pulsecut Editor
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#262936] py-8 text-center text-[12px] text-[#9396A5]">
        <p>© 2026 Pulsecut. All rights reserved. Edit at the speed of the beat.</p>
      </footer>
    </div>
  );
}
