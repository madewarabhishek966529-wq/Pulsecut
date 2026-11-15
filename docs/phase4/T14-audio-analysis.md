# T14: Audio Analysis (Web Audio FFT) — uBass, uMid, uHigh, uBeat

Read `docs/phase4/00-MASTER.md` first. This task is ONLY T14.

## Goal
Extract real-time spectral audio features from playing media using Web Audio API's `AnalyserNode`. Calculate normalized frequency band energies (`uBass`, `uMid`, `uHigh`) and a transient beat impulse (`uBeat`), and stream them directly into the renderer pipeline on every frame tick so shaders react live to the music.

---

## Scope
- **IN**: Web Audio analyzer in `client/src/lib/audioAnalysis.ts`, frequency bin band aggregators, dynamic threshold beat onset detection algorithm with decay, uniform updates in `PulsecutRenderer`, HUD live audio meter display in `PreviewStage.tsx`.
- **OUT**: UI parameter bindings (T15), shader parameter mapping (T15).

---

## Dependencies
- None. Native Web Audio API (`AudioContext`, `AnalyserNode`, `getByteFrequencyData`).

---

## Requirements

### 1. `client/src/lib/audioAnalysis.ts`: `AudioAnalyzer`
Implement the analyzer module:
```ts
export interface AudioFeatures {
  bass: number; // 0.0 - 1.0 (20Hz - 250Hz)
  mid: number;  // 0.0 - 1.0 (250Hz - 4kHz)
  high: number; // 0.0 - 1.0 (4kHz - 16kHz)
  beat: number; // 0.0 - 1.0 (transient peak with decay)
}

export class AudioAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array | null = null;
  private energyHistory: number[] = [];
  private currentBeat = 0;

  init(sourceNode: AudioNode, context: AudioContext): void;
  getFeatures(): AudioFeatures;
  reset(): void;
  destroy(): void;
}
```

### 2. Frequency Band Extraction Math
Given `fftSize = 1024`, frequency resolution per bin is `binWidth = sampleRate / 1024` (approx 43.06Hz at 44.1kHz):
- **Bass (20 - 250 Hz)**:
  `startBin = Math.floor(20 / binWidth)` (~1)
  `endBin = Math.ceil(250 / binWidth)` (~6)
  Compute average RMS normalized to `[0.0, 1.0]`.
- **Mid (250 - 4000 Hz)**:
  `startBin = Math.floor(250 / binWidth)` (~6)
  `endBin = Math.ceil(4000 / binWidth)` (~93)
- **High (4000 - 16000 Hz)**:
  `startBin = Math.floor(4000 / binWidth)` (~93)
  `endBin = Math.ceil(16000 / binWidth)` (~372)

### 3. Dynamic Threshold Beat Detection Algorithm
- On each frame tick, compute instantaneous bass energy `E_instant`.
- Maintain a rolling history buffer of the last 43 energy frames (~0.7s of audio).
- Compute local average energy `E_avg` and variance `V`.
- Dynamic sensitivity threshold: `C = (-0.0025714 * V) + 1.45`.
- **Onset Trigger**:
  If `E_instant > C * E_avg` and cooldown time (> 200ms) has passed:
  Set `currentBeat = 1.0`.
- **Decay**:
  On each tick, decay beat value exponentially: `currentBeat *= 0.90`. When `currentBeat < 0.02`, reset to `0.0`.

### 4. Feed Uniforms to Renderer: `lib/renderer.ts`
- Add method `setAudioUniforms(features: AudioFeatures): void` to `PulsecutRenderer`.
- In the active shader pass, bind standard uniforms:
  `uniform float uBass;`
  `uniform float uMid;`
  `uniform float uHigh;`
  `uniform float uBeat;`

### 5. Preview HUD Meter
- Update `PreviewStage.tsx` HUD:
  - Display live bass/mid/high mini-bars in the VU meter area.
  - Make the BEAT HUD chip pulse bright orange (`#E05A2B`) on beat triggers.

---

## Edge Cases to Handle
- Audio paused or muted: `getFeatures()` returns all zeros cleanly, no NaN or division by zero.
- Video with no audio track: analyzer gracefully skips audio connection.
- Browser autoplay policy: resume `AudioContext` on user interaction (Play button or canvas click).

---

## Acceptance Checklist
- [ ] Playing `samples/test-beat.wav` produces clear, rhythmic `uBeat` spikes corresponding to the 0.5s kick drums.
- [ ] Visual HUD in `PreviewStage` pulses in sync with the audio track.
- [ ] `PulsecutRenderer` receives audio uniforms every frame during playback.
- [ ] When audio pauses, all frequency bands return to 0.0.
- [ ] Zero memory leaks: `AudioContext` and nodes close cleanly on unmount.

