# T15: Parameter Bindings UI — Audio-Reactive Slider Modulation

Read `docs/phase4/00-MASTER.md` and `docs/phase4/T14-audio-analysis.md` first. This task is ONLY T15.

## Goal
Enable users to bind any effect parameter (e.g. glitch intensity, zoom factor, vignette, chromatic aberration) directly to live audio frequency bands (`bass`, `mid`, `high`, or `beat`). When the music hits a bass drop or beat, the bound parameter pulses in sync.

---

## Scope
- **IN**: Binding popover UI in `client/src/components/Inspector.tsx`, timeline store actions (`setBinding`, `removeBinding`), live parameter modulation in the renderer shader pass, animated ghost thumb on sliders showing live reactive values.
- **OUT**: Audio FFT feature extraction (already in T14), Gemini prompt generation (T12).

---

## Dependencies
- None. Builds on the existing timeline store and `AudioFeatures` stream from T14.

---

## Requirements

### 1. Timeline Store Actions: `store/timelineStore.ts`
Implement actions for parameter binding:
```ts
addBinding(clipId: string, effectId: string, binding: Binding): void;
removeBinding(clipId: string, effectId: string, param: string): void;
```
Updates `clip.effects[index].bindings` immutably. An undoable transaction.

### 2. Inspector Binding Control: `components/Inspector.tsx`
Enhance each parameter slider row:
- Beside each slider label, add an audio link button with icon `graphic_eq`.
- Active State:
  - If bound, button glows orange (`#E05A2B`) with a subtle pulse indicator showing the source (`BASS`, `BEAT`, `MID`, `HIGH`).
- Clicking opens a popover:
  - **Source Selector**: Tabs or pills for `None`, `Bass`, `Mid`, `High`, `Beat`.
  - **Gain Multiplier Slider**: Range `-2.0` to `+2.0`, step `0.1`, default `1.0`. Negative gain inverts the effect (parameter ducks on beat).
  - **Live Preview Dot**: Bounces in real-time in the popover matching the live energy of the selected source.

### 3. Runtime Modulation in Renderer: `lib/renderer.ts`
During each frame render:
```ts
function computeBoundParam(
  baseValue: number,
  binding: Binding | undefined,
  audio: AudioFeatures,
  min: number,
  max: number
): number {
  if (!binding) return baseValue;

  const audioVal = audio[binding.source] || 0;
  const range = max - min;
  const modulated = baseValue + (audioVal * binding.gain * range);

  return Math.min(max, Math.max(min, modulated));
}
```
Pass the modulated parameters to the active shader uniforms.

### 4. Visual Feedback on Slider:
- While playing with an active binding, the slider track displays a glowing "ghost" indicator that jumps and vibrates along with the music, giving creators instant visual verification of beat response.

---

## Edge Cases to Handle
- Multiple parameters bound to the same audio source: all parameters modulate independently without conflict.
- Removing an effect or clip: cleans up all associated bindings cleanly.
- Export / render consistency: offline rendering (Phase 5) must pre-compute audio feature curves at exact timestamps so exported videos have identical beat reactivity.

---

## Acceptance Checklist
- [ ] Binding a filter's slider to "Beat" causes the visual effect to spike precisely on kick drum hits in `samples/test-beat.wav`.
- [ ] Gain multiplier adjusts the amplitude of the reaction; negative gain ducks the parameter.
- [ ] Inspector shows clear visual indicator when a parameter is audio-bound.
- [ ] Undoing (Ctrl+Z) restores previous binding state.
- [ ] Zero frame rate drops during audio-reactive playback at 60fps.

