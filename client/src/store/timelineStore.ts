import { create } from "zustand";
import { emptyTimeline, type Timeline, type Clip, type Asset } from "@/types/timeline";
import { newId } from "@/lib/id";
import { revokeAsset } from "@/lib/mediaImport";
import {
  splitClipAtTime,
  deleteClipById,
  updateClip,
  recalcDuration,
} from "@/lib/timelineOps";

export type UIAsset = Asset & { name?: string; objectUrl?: string };

interface TimelineState {
  timeline: Timeline;
  currentTime: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  projectTitle: string;

  // History
  past: Timeline[];
  future: Timeline[];

  // Actions
  setTimeline: (t: Timeline) => void;
  setCurrentTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
  selectClip: (clipId: string | null) => void;
  setProjectTitle: (title: string) => void;
  setProjectAspect: (width: number, height: number) => void;

  // Clip Operations
  splitClip: (clipId: string, time: number) => void;
  deleteClip: (clipId: string) => void;
  updateClipTransform: (
    clipId: string,
    transformPatch: Partial<Clip["transform"]>
  ) => void;
  updateClipProps: (clipId: string, patch: Partial<Clip>) => void;
  removeEffectFromClip: (clipId: string, effectInstanceId: string) => void;

  // Asset Operations
  addAsset: (asset: UIAsset) => void;
  removeAsset: (assetId: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useTimelineStore = create<TimelineState>((set, get) => ({
  timeline: emptyTimeline(),
  currentTime: 0,
  isPlaying: false,
  selectedClipId: null,
  projectTitle: "Untitled Project",
  past: [],
  future: [],

  setTimeline: (timeline) => set({ timeline }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  selectClip: (selectedClipId) => set({ selectedClipId }),
  setProjectTitle: (projectTitle) => set({ projectTitle }),

  setProjectAspect: (width, height) =>
    set((state) => {
      const nextTimeline: Timeline = {
        ...state.timeline,
        project: {
          ...state.timeline.project,
          width,
          height,
        },
      };
      return {
        timeline: nextTimeline,
        past: [...state.past, state.timeline].slice(-MAX_HISTORY),
        future: [],
      };
    }),

  splitClip: (clipId, time) =>
    set((state) => {
      const next = splitClipAtTime(state.timeline, clipId, time);
      if (next === state.timeline) return state;
      return {
        timeline: next,
        past: [...state.past, state.timeline].slice(-MAX_HISTORY),
        future: [],
      };
    }),

  deleteClip: (clipId) =>
    set((state) => {
      const next = deleteClipById(state.timeline, clipId);
      return {
        timeline: next,
        selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
        past: [...state.past, state.timeline].slice(-MAX_HISTORY),
        future: [],
      };
    }),

  updateClipTransform: (clipId, transformPatch) =>
    set((state) => {
      const target = state.timeline.tracks
        .flatMap((t) => t.clips)
        .find((c) => c.id === clipId);
      if (!target) return state;

      const updatedClip = {
        ...target,
        transform: {
          ...target.transform,
          ...transformPatch,
        },
      };

      const next = updateClip(state.timeline, clipId, updatedClip);
      return { timeline: next };
    }),

  updateClipProps: (clipId, patch) =>
    set((state) => {
      const next = updateClip(state.timeline, clipId, patch);
      return {
        timeline: next,
        past: [...state.past, state.timeline].slice(-MAX_HISTORY),
        future: [],
      };
    }),

  removeEffectFromClip: (clipId, effectInstanceId) =>
    set((state) => {
      const target = state.timeline.tracks
        .flatMap((t) => t.clips)
        .find((c) => c.id === clipId);
      if (!target) return state;

      const updatedClip = {
        ...target,
        effects: target.effects.filter((e) => e.id !== effectInstanceId),
      };

      const next = updateClip(state.timeline, clipId, updatedClip);
      return {
        timeline: next,
        past: [...state.past, state.timeline].slice(-MAX_HISTORY),
        future: [],
      };
    }),

  addAsset: (asset) =>
    set((state) => {
      const isFirstAsset = state.timeline.assets.length === 0;
      const newAssets = [...state.timeline.assets, asset];

      let newProject = { ...state.timeline.project };
      let newTracks = [...state.timeline.tracks];
      let newSelectedClipId = state.selectedClipId;

      if (isFirstAsset) {
        const assetDuration = asset.duration || 0;
        newProject = {
          ...newProject,
          width: asset.width || newProject.width,
          height: asset.height || newProject.height,
          duration: assetDuration,
        };

        const videoTrackIndex = newTracks.findIndex((t) => t.type === "video");
        const initialClip: Clip = {
          id: newId("clip"),
          assetId: asset.id,
          start: 0,
          end: assetDuration,
          sourceIn: 0,
          fadeIn: 0,
          fadeOut: 0,
          volume: 1,
          transform: {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
          },
          effects: [],
        };

        newSelectedClipId = initialClip.id;

        if (videoTrackIndex >= 0) {
          newTracks[videoTrackIndex] = {
            ...newTracks[videoTrackIndex],
            clips: [initialClip],
          };
        } else {
          newTracks.push({
            id: "t-video",
            type: "video",
            locked: false,
            muted: false,
            clips: [initialClip],
          });
        }
      }

      const nextTimeline: Timeline = {
        ...state.timeline,
        project: newProject,
        assets: newAssets,
        tracks: newTracks,
      };

      return {
        timeline: nextTimeline,
        currentTime: isFirstAsset ? 0 : state.currentTime,
        selectedClipId: newSelectedClipId,
        past: [...state.past, state.timeline].slice(-MAX_HISTORY),
        future: [],
      };
    }),

  removeAsset: (assetId) =>
    set((state) => {
      const targetAsset = state.timeline.assets.find((a) => a.id === assetId);
      if (targetAsset) {
        revokeAsset(targetAsset);
      }

      const newAssets = state.timeline.assets.filter((a) => a.id !== assetId);
      const newTracks = state.timeline.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.assetId !== assetId),
      }));

      const nextTimeline: Timeline = {
        ...state.timeline,
        assets: newAssets,
        tracks: newTracks,
        project: {
          ...state.timeline.project,
          duration: recalcDuration({ ...state.timeline, tracks: newTracks }),
        },
      };

      return {
        timeline: nextTimeline,
        selectedClipId: null,
        past: [...state.past, state.timeline].slice(-MAX_HISTORY),
        future: [],
      };
    }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        timeline: previous,
        past: newPast,
        future: [state.timeline, ...state.future].slice(0, MAX_HISTORY),
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        timeline: next,
        past: [...state.past, state.timeline].slice(-MAX_HISTORY),
        future: newFuture,
      };
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
