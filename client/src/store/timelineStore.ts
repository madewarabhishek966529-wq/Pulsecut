import { create } from "zustand";
import { emptyTimeline, type Timeline } from "@/types/timeline";

interface TimelineState {
  timeline: Timeline;
  currentTime: number;
  isPlaying: boolean;
  setTimeline: (t: Timeline) => void;
  setCurrentTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
}

// TODO (T2): add clip operations and undo/redo history.
export const useTimelineStore = create<TimelineState>((set) => ({
  timeline: emptyTimeline(),
  currentTime: 0,
  isPlaying: false,
  setTimeline: (timeline) => set({ timeline }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setPlaying: (isPlaying) => set({ isPlaying }),
}));
