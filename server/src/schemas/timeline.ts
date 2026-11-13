import { z } from "zod";

// Keep in sync with client/src/types/timeline.ts
export const TimelineSchema = z.object({
  version: z.literal(1),
  project: z.object({
    fps: z.number(),
    width: z.number(),
    height: z.number(),
    duration: z.number(),
  }),
  assets: z.array(z.record(z.unknown())),
  tracks: z.array(z.record(z.unknown())),
});
