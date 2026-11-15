import type { Timeline, Clip, Track } from "@/types/timeline";
import { newId } from "./id";

const MIN_CLIP_DURATION = 0.05; // 50ms minimum duration to prevent 0-length clips

/**
 * Calculates the overall duration of the project based on the latest ending clip.
 */
export function recalcDuration(timeline: Timeline): number {
  let maxEnd = 0;
  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (clip.end > maxEnd) {
        maxEnd = clip.end;
      }
    }
  }
  return maxEnd;
}

/**
 * Finds a clip and its enclosing track by clip ID.
 */
export function findClip(
  timeline: Timeline,
  clipId: string
): { clip: Clip; track: Track } | null {
  for (const track of timeline.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { clip, track };
  }
  return null;
}

/**
 * Splits a clip into two at the specified timeline time.
 * Maintains sourceIn offset parity for video/audio clips.
 */
export function splitClipAtTime(
  timeline: Timeline,
  clipId: string,
  splitTime: number
): Timeline {
  const found = findClip(timeline, clipId);
  if (!found) return timeline;

  const { clip, track } = found;

  // Split point must fall strictly inside the clip with minimum boundary margin
  if (
    splitTime <= clip.start + MIN_CLIP_DURATION ||
    splitTime >= clip.end - MIN_CLIP_DURATION
  ) {
    return timeline;
  }

  const offset = splitTime - clip.start;

  // First half keeps the original ID, ends at splitTime
  const firstHalf: Clip = {
    ...clip,
    end: splitTime,
  };

  // Second half gets a new ID, starts at splitTime, with adjusted sourceIn
  const secondHalf: Clip = {
    ...clip,
    id: newId("clip"),
    start: splitTime,
    end: clip.end,
    sourceIn: clip.sourceIn + offset,
    // Deep clone effects for independence
    effects: clip.effects.map((e) => ({ ...e, id: newId("fx") })),
  };

  const newTracks = timeline.tracks.map((t) => {
    if (t.id !== track.id) return t;

    const newClips: Clip[] = [];
    for (const c of t.clips) {
      if (c.id === clipId) {
        newClips.push(firstHalf, secondHalf);
      } else {
        newClips.push(c);
      }
    }
    return { ...t, clips: newClips };
  });

  return {
    ...timeline,
    tracks: newTracks,
  };
}

/**
 * Deletes a clip from whichever track it belongs to.
 */
export function deleteClipById(timeline: Timeline, clipId: string): Timeline {
  const newTracks = timeline.tracks.map((t) => ({
    ...t,
    clips: t.clips.filter((c) => c.id !== clipId),
  }));

  const newTimeline: Timeline = {
    ...timeline,
    tracks: newTracks,
  };

  return {
    ...newTimeline,
    project: {
      ...newTimeline.project,
      duration: recalcDuration(newTimeline),
    },
  };
}

/**
 * Updates a clip's properties (transform, timing, text, effects) immutably.
 */
export function updateClip(
  timeline: Timeline,
  clipId: string,
  patch: Partial<Clip>
): Timeline {
  const newTracks = timeline.tracks.map((t) => ({
    ...t,
    clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...patch } : c)),
  }));

  const newTimeline: Timeline = {
    ...timeline,
    tracks: newTracks,
  };

  return {
    ...newTimeline,
    project: {
      ...newTimeline.project,
      duration: recalcDuration(newTimeline),
    },
  };
}
