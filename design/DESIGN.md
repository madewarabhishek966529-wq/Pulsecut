# Pulsecut: Design System

## Brand
Name: Pulsecut. Tagline: "Edit at the speed of the beat."
Feel: pro tool at night. Dark, precise, alive with a subtle rhythm. Never cluttered.

## Color
| Token | Hex | Use |
|---|---|---|
| bg | #07070B | app background |
| panel | #0F0F16 | panels, cards |
| panel-2 | #151520 | raised, hover |
| border | #22222E | 1px dividers |
| text | #E8E8F0 | primary text |
| muted | #8A8AA0 | secondary text |
| pulse | #22D3EE | primary accent (cyan) |
| pulse-2 | #8B5CF6 | secondary accent (violet) |
| success | #34D399 | done states |
| danger | #F87171 | errors, delete |
| Track colors | video #22D3EE, audio #34D399, text #F59E0B, effect #8B5CF6 | timeline clips |

Gradient: `linear-gradient(135deg, #22D3EE, #8B5CF6)` for hero text, primary buttons, playhead glow.

## Type
Inter for UI, JetBrains Mono for timecodes and values.
Scale: 11 / 12 / 14 / 16 / 20 / 28 / 44. Weights 400, 500, 600, 700.

## Spacing and shape
8px grid. Radius: 6 (inputs), 10 (cards), 14 (modals). Panels: 1px border, subtle inner glow, no heavy shadows.
Glass: `background: rgba(15,15,22,.7); backdrop-filter: blur(16px);`

## Motion
| Token | Value |
|---|---|
| fast | 120ms, ease-out (hover, press) |
| base | 220ms, cubic-bezier(.2,.8,.2,1) (panels, fades) |
| slow | 420ms, spring (modals, page transitions) |

Rules: animate only `transform` and `opacity`. The brand signature is the **pulse**: a soft cyan glow that breathes on the playhead, the active effect, and the primary button when idle (scale 1 to 1.02, 1.2s loop). Respect `prefers-reduced-motion`.

## Components
- **Buttons**: primary (gradient fill), secondary (panel-2 + border), ghost (text only), icon (32px square).
- **Slider**: 4px track, cyan fill, 14px thumb with glow, mono value readout on the right.
- **Clip block**: 10px radius, track color at 25% fill with 1px solid border, label top-left, trim handles on hover.
- **Playhead**: 2px cyan line, glowing triangle on top, timecode chip.
- **Effect card**: 96px thumbnail with live shader preview on hover, name, tag chips.
- **Skeletons**: shimmer gradient, same shape as final content.
- **Empty states**: one line icon, one sentence, one action.

## Layouts
- **Editor** (desktop, min 1280px): top bar 48px; left panel 320px (tabs: Media, Effects, Text, Audio); center preview; right inspector 300px; bottom timeline 280px, resizable.
- **Dashboard**: left rail 72px, project grid (cards 4:5 thumbnails).
- Mobile: dashboard + simple viewer only for v1. Editing is desktop-first.

## Key interactions
- Hover a clip: show trim handles and a quick toolbar (split, delete, effects).
- Scrub the timeline: preview updates live; playhead glows.
- Drag an effect from the panel onto a clip: clip outline pulses, effect chip appears.
- Prompt-to-Filter: type, a shimmer builds the preview, sliders animate in one by one.
- Beat-bound sliders show a small waveform icon and a live pulsing value.
