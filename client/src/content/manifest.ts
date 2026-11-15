import { z } from "zod";

export const ContentUniformSchema = z.object({
  name: z.string(),
  type: z.enum(["float", "vec2", "vec3", "color"]),
  label: z.string(),
  default: z.union([z.number(), z.array(z.number())]),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  audioBinding: z.enum(["bass", "mid", "high", "beat"]).optional(),
});

export const EffectDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["glitch", "retro", "glow", "artistic", "color", "distortion"]),
  fragmentShader: z.string(),
  uniforms: z.array(ContentUniformSchema),
  defaults: z.record(z.union([z.number(), z.array(z.number())])),
  tags: z.array(z.string()),
});

export const TransitionDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  fragmentShader: z.string(),
  defaultDuration: z.number().default(0.5),
  tags: z.array(z.string()),
});

export const TextPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  style: z.object({
    fontSize: z.number(),
    color: z.string(),
    fontFamily: z.string(),
    fontWeight: z.string(),
    textTransform: z.string().optional(),
    backgroundColor: z.string().optional(),
    border: z.string().optional(),
    padding: z.string().optional(),
    shadow: z.string().optional(),
  }),
});

export const CaptionStyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  fontFamily: z.string(),
  fontSize: z.number(),
  fillColor: z.string(),
  strokeColor: z.string(),
  strokeThickness: z.number(),
  highlightColor: z.string().optional(),
  animation: z.enum(["none", "bounce", "fade", "pop"]).default("none"),
});

export const StickerSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  svg: z.string(),
  viewBox: z.string().default("0 0 24 24"),
});

export const TemplateRecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  targetDuration: z.number(),
  recommendedAspect: z.string(),
  tracksCount: z.number(),
  ops: z.array(z.record(z.unknown())),
});

export const ContentManifestSchema = z.object({
  version: z.string(),
  updatedAt: z.string(),
  counts: z.object({
    effects: z.number(),
    transitions: z.number(),
    textPresets: z.number(),
    captionStyles: z.number(),
    stickers: z.number(),
    templates: z.number(),
  }),
});

export type EffectDefinition = z.infer<typeof EffectDefinitionSchema>;
export type TransitionDefinition = z.infer<typeof TransitionDefinitionSchema>;
export type TextPreset = z.infer<typeof TextPresetSchema>;
export type CaptionStyle = z.infer<typeof CaptionStyleSchema>;
export type Sticker = z.infer<typeof StickerSchema>;
export type TemplateRecipe = z.infer<typeof TemplateRecipeSchema>;
export type ContentManifest = z.infer<typeof ContentManifestSchema>;
