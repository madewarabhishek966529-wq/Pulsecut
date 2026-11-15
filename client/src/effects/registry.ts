import type { EffectDef } from "@/types/effects";

const effects = new Map<string, EffectDef>();

export const registerEffect = (def: EffectDef) => effects.set(def.id, def);
export const getEffect = (id: string) => effects.get(id);
export const listEffects = () => Array.from(effects.values());

// 1. RGB Glitch Split
registerEffect({
  id: "rgb-glitch",
  name: "RGB Glitch Split",
  kind: "filter",
  fragment: `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uIntensity;
    uniform float uBass;

    void main() {
      float shift = (uIntensity * 0.02) + (uBass * 0.03);
      float r = texture2D(uSampler, vec2(vTextureCoord.x + shift, vTextureCoord.y)).r;
      float g = texture2D(uSampler, vTextureCoord).g;
      float b = texture2D(uSampler, vec2(vTextureCoord.x - shift, vTextureCoord.y)).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
  uniforms: [
    { name: "uIntensity", type: "float", label: "Glitch Intensity", min: 0, max: 1, step: 0.05 },
    { name: "uBass", type: "float", label: "Bass Reactivity", min: 0, max: 1, step: 0.05 },
  ],
  defaults: { uIntensity: 0.8, uBass: 0.0 },
});

// 2. VHS Tape 1994
registerEffect({
  id: "vhs-tape",
  name: "VHS Tape 1994",
  kind: "filter",
  fragment: `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uIntensity;
    uniform float uGrain;

    void main() {
      vec4 col = texture2D(uSampler, vTextureCoord);
      float scanline = sin(vTextureCoord.y * 800.0) * 0.08 * uIntensity;
      col.rgb -= scanline;
      col.rgb = mix(col.rgb, vec3(col.r * 1.1, col.g * 0.95, col.b * 0.8), uIntensity * 0.5);
      gl_FragColor = col;
    }
  `,
  uniforms: [
    { name: "uIntensity", type: "float", label: "Tape Wear", min: 0, max: 1, step: 0.05 },
    { name: "uGrain", type: "float", label: "Scanlines", min: 0, max: 1, step: 0.05 },
  ],
  defaults: { uIntensity: 0.6, uGrain: 0.5 },
});

// 3. Warm Precision Glow
registerEffect({
  id: "warm-glow",
  name: "Warm Precision Glow",
  kind: "filter",
  fragment: `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uWarmth;
    uniform float uBloom;

    void main() {
      vec4 col = texture2D(uSampler, vTextureCoord);
      vec3 warmTint = vec3(1.15, 0.95, 0.8);
      col.rgb = mix(col.rgb, col.rgb * warmTint, uWarmth);
      col.rgb += col.rgb * uBloom * 0.3;
      gl_FragColor = col;
    }
  `,
  uniforms: [
    { name: "uWarmth", type: "float", label: "Warmth", min: 0, max: 1, step: 0.05 },
    { name: "uBloom", type: "float", label: "Bloom", min: 0, max: 1, step: 0.05 },
  ],
  defaults: { uWarmth: 0.75, uBloom: 0.5 },
});

// 4. Bass Zoom Shock
registerEffect({
  id: "zoom-shock",
  name: "Bass Zoom Shock",
  kind: "filter",
  fragment: `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uShock;
    uniform float uBass;

    void main() {
      vec2 center = vec2(0.5, 0.5);
      float scale = 1.0 - (uShock * 0.1 * uBass);
      vec2 uv = (vTextureCoord - center) * scale + center;
      gl_FragColor = texture2D(uSampler, uv);
    }
  `,
  uniforms: [
    { name: "uShock", type: "float", label: "Zoom Scale", min: 0, max: 1, step: 0.05 },
    { name: "uBass", type: "float", label: "Bass Reactivity", min: 0, max: 1, step: 0.05 },
  ],
  defaults: { uShock: 0.8, uBass: 0.5 },
});
