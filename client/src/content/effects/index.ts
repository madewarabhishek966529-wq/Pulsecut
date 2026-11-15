import type { EffectDefinition } from "../manifest.ts";

export const BUILTIN_EFFECTS: EffectDefinition[] = [
  // 1. CRT Monitor
  {
    id: "fx-crt",
    name: "CRT Monitor",
    category: "retro",
    tags: ["retro", "crt", "tv", "scanlines"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uScanlines;
      uniform float uCurvature;

      void main() {
        vec2 uv = vTextureCoord;
        vec2 centered = uv - 0.5;
        uv = uv + centered * (dot(centered, centered) * uCurvature * 0.2);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          return;
        }
        vec4 col = texture2D(uSampler, uv);
        float scan = sin(uv.y * 600.0) * (uScanlines * 0.15);
        col.rgb -= scan;
        gl_FragColor = col;
      }
    `,
    uniforms: [
      { name: "uScanlines", type: "float", label: "Scanline Intensity", default: 0.7, min: 0, max: 1 },
      { name: "uCurvature", type: "float", label: "Barrel Curvature", default: 0.3, min: 0, max: 1 },
    ],
    defaults: { uScanlines: 0.7, uCurvature: 0.3 },
  },

  // 2. VHS Tape
  {
    id: "fx-vhs",
    name: "VHS Tape 1994",
    category: "retro",
    tags: ["vhs", "analog", "tape", "retro"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uNoise;
      uniform float uTapeBleed;

      void main() {
        vec2 uv = vTextureCoord;
        float bleed = uTapeBleed * 0.01;
        float r = texture2D(uSampler, vec2(uv.x + bleed, uv.y)).r;
        float g = texture2D(uSampler, uv).g;
        float b = texture2D(uSampler, vec2(uv.x - bleed, uv.y)).b;
        vec3 col = vec3(r, g, b);
        float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * (uNoise * 0.15);
        col += noise;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: [
      { name: "uNoise", type: "float", label: "Tape Static", default: 0.5, min: 0, max: 1 },
      { name: "uTapeBleed", type: "float", label: "Color Bleed", default: 0.6, min: 0, max: 1 },
    ],
    defaults: { uNoise: 0.5, uTapeBleed: 0.6 },
  },

  // 3. Chromatic Aberration
  {
    id: "fx-chromatic",
    name: "Chromatic Aberration",
    category: "distortion",
    tags: ["rgb", "split", "prism", "optical"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uOffset;
      uniform float uBass;

      void main() {
        vec2 dir = vTextureCoord - 0.5;
        float dist = length(dir);
        float shift = (uOffset * 0.03 + uBass * 0.02) * dist;
        float r = texture2D(uSampler, vTextureCoord + dir * shift).r;
        float g = texture2D(uSampler, vTextureCoord).g;
        float b = texture2D(uSampler, vTextureCoord - dir * shift).b;
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `,
    uniforms: [
      { name: "uOffset", type: "float", label: "Aberration Spread", default: 0.6, min: 0, max: 1 },
      { name: "uBass", type: "float", label: "Bass Reactivity", default: 0.0, min: 0, max: 1, audioBinding: "bass" },
    ],
    defaults: { uOffset: 0.6, uBass: 0.0 },
  },

  // 4. Film Grain
  {
    id: "fx-grain",
    name: "35mm Film Grain",
    category: "retro",
    tags: ["film", "grain", "cinema", "texture"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uAmount;
      uniform float uGrainSize;

      void main() {
        vec4 col = texture2D(uSampler, vTextureCoord);
        vec2 grainUV = vTextureCoord * (1000.0 / max(0.1, uGrainSize));
        float grain = (fract(sin(dot(grainUV, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * (uAmount * 0.25);
        col.rgb += grain;
        gl_FragColor = col;
      }
    `,
    uniforms: [
      { name: "uAmount", type: "float", label: "Grain Density", default: 0.45, min: 0, max: 1 },
      { name: "uGrainSize", type: "float", label: "Grain Size", default: 1.0, min: 0.5, max: 2.5 },
    ],
    defaults: { uAmount: 0.45, uGrainSize: 1.0 },
  },

  // 5. Bloom & Glow
  {
    id: "fx-bloom",
    name: "Amber Bloom Glow",
    category: "glow",
    tags: ["bloom", "glow", "neon", "warm"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uThreshold;
      uniform float uIntensity;
      uniform float uBass;

      void main() {
        vec4 col = texture2D(uSampler, vTextureCoord);
        float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
        float glowFactor = max(0.0, lum - uThreshold) * (uIntensity + uBass * 0.8);
        col.rgb += vec3(glowFactor * 1.2, glowFactor * 0.8, glowFactor * 0.4);
        gl_FragColor = col;
      }
    `,
    uniforms: [
      { name: "uThreshold", type: "float", label: "Luminance Cutoff", default: 0.6, min: 0, max: 1 },
      { name: "uIntensity", type: "float", label: "Bloom Strength", default: 0.75, min: 0, max: 2 },
      { name: "uBass", type: "float", label: "Bass Reactivity", default: 0.0, min: 0, max: 1, audioBinding: "bass" },
    ],
    defaults: { uThreshold: 0.6, uIntensity: 0.75, uBass: 0.0 },
  },

  // 6. RGB Glitch
  {
    id: "fx-glitch",
    name: "Cyber Glitch Split",
    category: "glitch",
    tags: ["glitch", "cyber", "tear", "beat"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uIntensity;
      uniform float uFrequency;

      void main() {
        vec2 uv = vTextureCoord;
        float slice = floor(uv.y * (10.0 + uFrequency * 30.0));
        float rand = fract(sin(slice) * 43758.5453);
        float offset = (rand - 0.5) * (uIntensity * 0.05);
        float r = texture2D(uSampler, vec2(uv.x + offset, uv.y)).r;
        float g = texture2D(uSampler, uv).g;
        float b = texture2D(uSampler, vec2(uv.x - offset, uv.y)).b;
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `,
    uniforms: [
      { name: "uIntensity", type: "float", label: "Tear Amount", default: 0.8, min: 0, max: 1 },
      { name: "uFrequency", type: "float", label: "Slice Frequency", default: 0.5, min: 0, max: 1 },
    ],
    defaults: { uIntensity: 0.8, uFrequency: 0.5 },
  },

  // 7. Edge Detect
  {
    id: "fx-edge",
    name: "Cyber Edge Matrix",
    category: "artistic",
    tags: ["edge", "cyber", "outline", "artistic"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uThreshold;
      uniform float uThickness;

      void main() {
        float d = uThickness * 0.002;
        vec4 c = texture2D(uSampler, vTextureCoord);
        vec4 l = texture2D(uSampler, vTextureCoord - vec2(d, 0.0));
        vec4 r = texture2D(uSampler, vTextureCoord + vec2(d, 0.0));
        vec4 u = texture2D(uSampler, vTextureCoord - vec2(0.0, d));
        vec4 b = texture2D(uSampler, vTextureCoord + vec2(0.0, d));
        vec4 edge = abs(l - r) + abs(u - b);
        float intensity = length(edge.rgb) > uThreshold ? 1.0 : 0.0;
        gl_FragColor = vec4(vec3(intensity) * vec3(0.88, 0.35, 0.17), 1.0);
      }
    `,
    uniforms: [
      { name: "uThreshold", type: "float", label: "Sensitivity", default: 0.25, min: 0.05, max: 0.8 },
      { name: "uThickness", type: "float", label: "Line Weight", default: 1.0, min: 0.5, max: 3.0 },
    ],
    defaults: { uThreshold: 0.25, uThickness: 1.0 },
  },

  // 8. Halftone Dots
  {
    id: "fx-halftone",
    name: "Halftone Comic",
    category: "artistic",
    tags: ["halftone", "dots", "comic", "print"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uDotSize;
      uniform float uContrast;

      void main() {
        vec2 grid = fract(vTextureCoord * (300.0 / max(1.0, uDotSize))) - 0.5;
        vec4 col = texture2D(uSampler, vTextureCoord);
        float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
        float radius = (1.0 - lum) * 0.5;
        float dotShape = step(radius, length(grid));
        vec3 finalCol = mix(vec3(0.05), col.rgb * uContrast, dotShape);
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `,
    uniforms: [
      { name: "uDotSize", type: "float", label: "Dot Scale", default: 1.2, min: 0.5, max: 3.0 },
      { name: "uContrast", type: "float", label: "Contrast", default: 1.1, min: 0.5, max: 2.0 },
    ],
    defaults: { uDotSize: 1.2, uContrast: 1.1 },
  },

  // 9. Pixelate
  {
    id: "fx-pixelate",
    name: "8-Bit Pixelate",
    category: "distortion",
    tags: ["pixel", "8bit", "mosaic", "retro"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uPixelSize;

      void main() {
        float size = max(2.0, uPixelSize * 32.0);
        vec2 p = floor(vTextureCoord * (1080.0 / size)) / (1080.0 / size);
        gl_FragColor = texture2D(uSampler, p);
      }
    `,
    uniforms: [
      { name: "uPixelSize", type: "float", label: "Block Size", default: 0.5, min: 0.1, max: 1.0 },
    ],
    defaults: { uPixelSize: 0.5 },
  },

  // 10. Invert
  {
    id: "fx-invert",
    name: "Negative Invert",
    category: "color",
    tags: ["invert", "negative", "xray", "color"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uMix;

      void main() {
        vec4 col = texture2D(uSampler, vTextureCoord);
        vec3 inv = vec3(1.0) - col.rgb;
        gl_FragColor = vec4(mix(col.rgb, inv, uMix), col.a);
      }
    `,
    uniforms: [
      { name: "uMix", type: "float", label: "Inversion Blend", default: 1.0, min: 0, max: 1 },
    ],
    defaults: { uMix: 1.0 },
  },

  // 11. Vignette
  {
    id: "fx-vignette",
    name: "Cinematic Vignette",
    category: "glow",
    tags: ["vignette", "shadow", "focus", "cinematic"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uRadius;
      uniform float uSoftness;

      void main() {
        vec4 col = texture2D(uSampler, vTextureCoord);
        vec2 d = vTextureCoord - 0.5;
        float dist = length(d);
        float vig = smoothstep(uRadius, uRadius - uSoftness, dist);
        col.rgb *= vig;
        gl_FragColor = col;
      }
    `,
    uniforms: [
      { name: "uRadius", type: "float", label: "Vignette Radius", default: 0.75, min: 0.2, max: 1.2 },
      { name: "uSoftness", type: "float", label: "Edge Falloff", default: 0.45, min: 0.1, max: 0.8 },
    ],
    defaults: { uRadius: 0.75, uSoftness: 0.45 },
  },

  // 12. Duo-Tone
  {
    id: "fx-duotone",
    name: "Warm Duo-Tone",
    category: "color",
    tags: ["duotone", "tint", "gradient", "warm"],
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform float uIntensity;

      void main() {
        vec4 col = texture2D(uSampler, vTextureCoord);
        float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
        vec3 darkTone = vec3(0.07, 0.07, 0.09); // #121318 dark slate
        vec3 warmTone = vec3(0.88, 0.35, 0.17); // #E05A2B warm coral
        vec3 graded = mix(darkTone, warmTone, lum);
        gl_FragColor = vec4(mix(col.rgb, graded, uIntensity), col.a);
      }
    `,
    uniforms: [
      { name: "uIntensity", type: "float", label: "DuoTone Blend", default: 0.85, min: 0, max: 1 },
    ],
    defaults: { uIntensity: 0.85 },
  },
];
