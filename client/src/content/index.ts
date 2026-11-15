import { BUILTIN_EFFECTS } from "./effects/index.ts";
import { BUILTIN_TRANSITIONS } from "./transitions/index.ts";
import { BUILTIN_TEXT_PRESETS } from "./textPresets/index.ts";
import { BUILTIN_CAPTION_STYLES } from "./captionStyles/index.ts";
import { BUILTIN_STICKERS } from "./stickers/index.ts";
import { BUILTIN_TEMPLATES } from "./templates/index.ts";
import type { ContentManifest } from "./manifest.ts";

export const CONTENT_MANIFEST: ContentManifest = {
  version: "1.0.0",
  updatedAt: "2026-11-15T23:59:00Z",
  counts: {
    effects: BUILTIN_EFFECTS.length,
    transitions: BUILTIN_TRANSITIONS.length,
    textPresets: BUILTIN_TEXT_PRESETS.length,
    captionStyles: BUILTIN_CAPTION_STYLES.length,
    stickers: BUILTIN_STICKERS.length,
    templates: BUILTIN_TEMPLATES.length,
  },
};

export {
  BUILTIN_EFFECTS,
  BUILTIN_TRANSITIONS,
  BUILTIN_TEXT_PRESETS,
  BUILTIN_CAPTION_STYLES,
  BUILTIN_STICKERS,
  BUILTIN_TEMPLATES,
};
