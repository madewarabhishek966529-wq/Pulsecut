import test from "node:test";
import assert from "node:assert/strict";

// Re-create the pure timeline operations logic for testing
function recalcDuration(timeline) {
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

function findClip(timeline, clipId) {
  for (const track of timeline.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { clip, track };
  }
  return null;
}

function splitClipAtTime(timeline, clipId, splitTime) {
  const found = findClip(timeline, clipId);
  if (!found) return timeline;

  const { clip, track } = found;
  if (splitTime <= clip.start + 0.05 || splitTime >= clip.end - 0.05) {
    return timeline;
  }

  const offset = splitTime - clip.start;
  const firstHalf = { ...clip, end: splitTime };
  const secondHalf = {
    ...clip,
    id: clip.id + "-split",
    start: splitTime,
    end: clip.end,
    sourceIn: clip.sourceIn + offset,
    effects: clip.effects ? [...clip.effects] : [],
  };

  const newTracks = timeline.tracks.map((t) => {
    if (t.id !== track.id) return t;
    const newClips = [];
    for (const c of t.clips) {
      if (c.id === clipId) {
        newClips.push(firstHalf, secondHalf);
      } else {
        newClips.push(c);
      }
    }
    return { ...t, clips: newClips };
  });

  return { ...timeline, tracks: newTracks };
}

function deleteClipById(timeline, clipId) {
  const newTracks = timeline.tracks.map((t) => ({
    ...t,
    clips: t.clips.filter((c) => c.id !== clipId),
  }));

  const newTimeline = { ...timeline, tracks: newTracks };
  return {
    ...newTimeline,
    project: {
      ...newTimeline.project,
      duration: recalcDuration(newTimeline),
    },
  };
}

test("recalcDuration correctly finds the latest clip end time", () => {
  const timeline = {
    tracks: [
      {
        clips: [
          { id: "c1", start: 0, end: 4.5 },
          { id: "c2", start: 4.5, end: 9.2 },
        ],
      },
      {
        clips: [{ id: "c3", start: 2, end: 12.0 }],
      },
    ],
  };
  assert.equal(recalcDuration(timeline), 12.0);
});

test("splitClipAtTime splits a clip cleanly into two with correct offsets", () => {
  const initial = {
    tracks: [
      {
        id: "t1",
        clips: [
          {
            id: "clip-1",
            start: 0,
            end: 10,
            sourceIn: 2,
            effects: [],
          },
        ],
      },
    ],
  };

  const result = splitClipAtTime(initial, "clip-1", 4.0);
  assert.equal(result.tracks[0].clips.length, 2);

  const [first, second] = result.tracks[0].clips;
  assert.equal(first.start, 0);
  assert.equal(first.end, 4.0);
  assert.equal(first.sourceIn, 2);

  assert.equal(second.start, 4.0);
  assert.equal(second.end, 10);
  assert.equal(second.sourceIn, 6.0); // 2 + (4 - 0)
});

test("splitClipAtTime does not split if split point is at or outside clip bounds", () => {
  const initial = {
    tracks: [
      {
        id: "t1",
        clips: [{ id: "clip-1", start: 2, end: 5, sourceIn: 0 }],
      },
    ],
  };

  const beforeStart = splitClipAtTime(initial, "clip-1", 1.0);
  assert.equal(beforeStart.tracks[0].clips.length, 1);

  const afterEnd = splitClipAtTime(initial, "clip-1", 6.0);
  assert.equal(afterEnd.tracks[0].clips.length, 1);
});

test("deleteClipById removes the clip and recalculates project duration", () => {
  const initial = {
    project: { duration: 15 },
    tracks: [
      {
        id: "t1",
        clips: [
          { id: "c1", start: 0, end: 5 },
          { id: "c2", start: 5, end: 15 },
        ],
      },
    ],
  };

  const result = deleteClipById(initial, "c2");
  assert.equal(result.tracks[0].clips.length, 1);
  assert.equal(result.tracks[0].clips[0].id, "c1");
  assert.equal(result.project.duration, 5);
});
