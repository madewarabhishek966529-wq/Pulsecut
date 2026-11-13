# Screen 3: Prompt-to-Filter modal (the hero feature)

Design a modal (720px wide, 14px radius, glass panel) titled "Generate a filter".

Contents:
- Large textarea with placeholder "Describe your filter... e.g. glitchy cyberpunk with red-blue split and scanlines".
- Row of example prompt chips (Melting VHS, Neon glow pulse, Film burn, Dream blur).
- A Generate button (gradient) with a sparkle icon.
- Result area split in two: left, a live preview of a video frame with the filter applied and a compare slider (before/after); right, auto-generated sliders (Intensity, Speed, Color shift, Scanlines) each with a mono value and an optional "Bind to audio" icon button.
- A small status line states: "Compiling shader... Fixed 1 error automatically" (show a success check).
- Footer: Regenerate, Save to My Effects, and primary Apply to clip.
- Show a loading state variant: shimmer on the preview and skeleton sliders.
