import type { TransitionDefinition } from "../manifest.ts";

export const BUILTIN_TRANSITIONS: TransitionDefinition[] = [
  // 1. Crossfade
  {
    id: "tr-crossfade",
    name: "Dissolve Crossfade",
    tags: ["dissolve", "fade", "smooth"],
    defaultDuration: 0.5,
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uProgress;

      void main() {
        vec4 fromCol = texture2D(uFrom, vTextureCoord);
        vec4 toCol = texture2D(uTo, vTextureCoord);
        gl_FragColor = mix(fromCol, toCol, uProgress);
      }
    `,
  },

  // 2. Wipe Left
  {
    id: "tr-wipe-left",
    name: "Linear Wipe Left",
    tags: ["wipe", "slide", "linear"],
    defaultDuration: 0.5,
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uProgress;

      void main() {
        float edge = vTextureCoord.x;
        vec4 fromCol = texture2D(uFrom, vTextureCoord);
        vec4 toCol = texture2D(uTo, vTextureCoord);
        gl_FragColor = edge < uProgress ? toCol : fromCol;
      }
    `,
  },

  // 3. Wipe Right
  {
    id: "tr-wipe-right",
    name: "Linear Wipe Right",
    tags: ["wipe", "slide", "linear"],
    defaultDuration: 0.5,
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uProgress;

      void main() {
        float edge = 1.0 - vTextureCoord.x;
        vec4 fromCol = texture2D(uFrom, vTextureCoord);
        vec4 toCol = texture2D(uTo, vTextureCoord);
        gl_FragColor = edge < uProgress ? toCol : fromCol;
      }
    `,
  },

  // 4. Dip to Black
  {
    id: "tr-dip-black",
    name: "Dip to Black",
    tags: ["fade", "black", "dramatic"],
    defaultDuration: 0.6,
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uProgress;

      void main() {
        if (uProgress < 0.5) {
          vec4 col = texture2D(uFrom, vTextureCoord);
          gl_FragColor = mix(col, vec4(0.0, 0.0, 0.0, 1.0), uProgress * 2.0);
        } else {
          vec4 col = texture2D(uTo, vTextureCoord);
          gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), col, (uProgress - 0.5) * 2.0);
        }
      }
    `,
  },

  // 5. Dip to White
  {
    id: "tr-dip-white",
    name: "Flash Dip to White",
    tags: ["flash", "white", "impact"],
    defaultDuration: 0.4,
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uProgress;

      void main() {
        if (uProgress < 0.5) {
          vec4 col = texture2D(uFrom, vTextureCoord);
          gl_FragColor = mix(col, vec4(1.0, 1.0, 1.0, 1.0), uProgress * 2.0);
        } else {
          vec4 col = texture2D(uTo, vTextureCoord);
          gl_FragColor = mix(vec4(1.0, 1.0, 1.0, 1.0), col, (uProgress - 0.5) * 2.0);
        }
      }
    `,
  },

  // 6. Zoom Through
  {
    id: "tr-zoom-through",
    name: "Zoom Through Shock",
    tags: ["zoom", "shock", "punch"],
    defaultDuration: 0.5,
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uProgress;

      void main() {
        vec2 center = vec2(0.5, 0.5);
        if (uProgress < 0.5) {
          float scale = 1.0 + (uProgress * 2.0) * 0.5;
          vec2 uv = (vTextureCoord - center) / scale + center;
          gl_FragColor = mix(texture2D(uFrom, uv), vec4(0.0, 0.0, 0.0, 1.0), uProgress * 0.5);
        } else {
          float scale = 0.5 + ((uProgress - 0.5) * 2.0) * 0.5;
          vec2 uv = (vTextureCoord - center) / scale + center;
          gl_FragColor = texture2D(uTo, uv);
        }
      }
    `,
  },

  // 7. Glitch Cut
  {
    id: "tr-glitch-cut",
    name: "Glitch Slice Cut",
    tags: ["glitch", "digital", "beat", "tear"],
    defaultDuration: 0.4,
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uProgress;

      void main() {
        float slice = floor(vTextureCoord.y * 20.0);
        float rand = fract(sin(slice) * 43758.5453);
        float shift = (rand - 0.5) * sin(uProgress * 3.14159) * 0.1;
        vec2 uv = vec2(vTextureCoord.x + shift, vTextureCoord.y);
        vec4 fromCol = texture2D(uFrom, uv);
        vec4 toCol = texture2D(uTo, uv);
        gl_FragColor = mix(fromCol, toCol, step(rand, uProgress));
      }
    `,
  },

  // 8. Directional Push
  {
    id: "tr-directional-blur",
    name: "Directional Push Blur",
    tags: ["push", "blur", "kinetic"],
    defaultDuration: 0.5,
    fragmentShader: `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uProgress;

      void main() {
        vec2 uvFrom = vTextureCoord + vec2(uProgress, 0.0);
        vec2 uvTo = vTextureCoord - vec2(1.0 - uProgress, 0.0);
        vec4 colFrom = texture2D(uFrom, uvFrom);
        vec4 colTo = texture2D(uTo, uvTo);
        gl_FragColor = vTextureCoord.x < (1.0 - uProgress) ? colFrom : colTo;
      }
    `,
  },
];
