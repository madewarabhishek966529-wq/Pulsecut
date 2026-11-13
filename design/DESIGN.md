# Pulsecut: Design System (Warm Precision Pro)

## Brand
Name: Pulsecut. Tagline: "Edit at the speed of the beat."
Feel: pro tool at night. Warm Precision Pro palette — rich obsidian dark, vibrant warm coral-orange and amber accents, creamy off-white typography, alive with a subtle rhythm. Never cluttered.

## Color (Warm Precision Pro Palette)
| Token | Hex | Use |
|---|---|---|
| bg / Neutral | #0B0C10 | app background (deep obsidian) |
| panel | #121318 | panels, cards |
| panel-2 | #1A1C24 | raised cards, hover states |
| border | #262936 | 1px dividers & outlines |
| text / Tertiary | #F4EFEA | primary text (warm creamy off-white) |
| muted | #9396A5 | secondary text & subtle icons |
| pulse / Primary | #E05A2B | primary accent (warm coral orange) |
| pulse-2 / Secondary | #D97706 | secondary accent (amber / ochre) |
| pulse-light | #F9A888 | pill highlights & subtle tints |
| success | #34D399 | done states |
| danger | #F87171 | errors, delete |
| Track colors | video #E05A2B, audio #34D399, text #F59E0B, effect #D97706 | timeline clips |

Gradient: `linear-gradient(135deg, #E05A2B, #D97706)` for hero text, primary buttons, playhead glow, active highlights.

## Type
Inter for Headline and Body UI, JetBrains Mono for Labels, timecodes, and numerical values.
Scale: 11 / 12 / 14 / 16 / 20 / 28 / 44. Weights: 400, 500, 600, 700.

## Spacing and shape
8px grid. Radius: 6 (inputs), 10 (cards), 14 (modals). Panels: 1px border (#262936), subtle inner glow, no heavy shadows.
Glass: `background: rgba(18, 19, 24, 0.75); backdrop-filter: blur(16px);`

## Motion
| Token | Value |
|---|---|
| fast | 120ms, ease-out (hover, press) |
| base | 220ms, cubic-bezier(.2,.8,.2,1) (panels, fades) |
| slow | 420ms, spring (modals, page transitions) |

Rules: animate only `transform` and `opacity`. The brand signature is the **pulse**: a soft warm orange-coral glow that breathes on the playhead, the active effect, and the primary button when idle (scale 1 to 1.02, 1.2s loop). Respect `prefers-reduced-motion`.

## Components
- **Buttons**: primary (gradient fill `#E05A2B` to `#D97706`), secondary (panel-2 + border), ghost (text only), icon (32px square).
- **Slider**: 4px track, warm coral fill `#E05A2B`, 14px thumb with glow, mono value readout on the right.
- **Clip block**: 10px radius, track color at 25% fill with 1px solid border, label top-left, trim handles on hover.
- **Playhead**: 2px warm coral line, glowing triangle on top, timecode chip.
- **Effect card**: 96px thumbnail with live shader preview on hover, name, tag chips.
- **Skeletons**: shimmer gradient, same shape as final content.
- **Empty states**: one line icon, one sentence, one action.

## Layouts
- **Editor** (desktop, min 1280px): top bar 48px; left panel 320px (tabs: Media, Effects, Text, Audio); center preview; right inspector 300px; bottom timeline 280px, resizable.
- **Dashboard**: left rail 72px, project grid (cards 4:5 thumbnails).
- Mobile: dashboard + simple viewer only for v1. Editing is desktop-first.
