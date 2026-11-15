import { z } from "zod";

export const TransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  scale: z.number().default(1),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
});

export const BindingSchema = z.object({
  param: z.string(),
  source: z.enum(["bass", "mid", "high", "beat"]),
  gain: z.number().default(1),
});

export const KeyframeSchema = z.object({
  time: z.number(),
  param: z.string(),
  value: z.number(),
});

export const EffectInstanceSchema = z.object({
  id: z.string(),
  effectId: z.string(),
  params: z.record(z.union([z.number(), z.array(z.number())])).default({}),
  bindings: z.array(BindingSchema).default([]),
  keyframes: z.array(KeyframeSchema).default([]),
});

export const ClipSchema = z.object({
  id: z.string(),
  assetId: z.string().optional(),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  sourceIn: z.number().nonnegative().default(0),
  text: z.string().optional(),
  fadeIn: z.number().nonnegative().default(0),
  fadeOut: z.number().nonnegative().default(0),
  volume: z.number().min(0).max(2).default(1),
  transform: TransformSchema.default({}),
  effects: z.array(EffectInstanceSchema).default([]),
});

export const TrackSchema = z.object({
  id: z.string(),
  type: z.enum(["video", "audio", "text"]),
  locked: z.boolean().default(false),
  muted: z.boolean().default(false),
  clips: z.array(ClipSchema).default([]),
});

export const AssetSchema = z.object({
  id: z.string(),
  type: z.enum(["video", "audio", "image"]),
  url: z.string(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const TimelineSchema = z.object({
  version: z.literal(1),
  project: z.object({
    fps: z.number().default(30),
    width: z.number().default(1080),
    height: z.number().default(1920),
    duration: z.number().default(0),
  }),
  assets: z.array(AssetSchema).default([]),
  tracks: z.array(TrackSchema).default([]),
});

export type Timeline = z.infer<typeof TimelineSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type Clip = z.infer<typeof ClipSchema>;
export type EffectInstance = z.infer<typeof EffectInstanceSchema>;
export type Asset = z.infer<typeof AssetSchema>;

export const emptyTimeline = (): Timeline => ({
  version: 1,
  project: { fps: 30, width: 1080, height: 1920, duration: 0 },
  assets: [],
  tracks: [
    { id: "t-video", type: "video", locked: false, muted: false, clips: [] },
    { id: "t-text", type: "text", locked: false, muted: false, clips: [] },
    { id: "t-audio", type: "audio", locked: false, muted: false, clips: [] },
  ],
});
