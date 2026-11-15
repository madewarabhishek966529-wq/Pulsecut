import { create } from "zustand";
import { emptyTimeline, type Timeline, type Clip, type Asset } from "@/types/timeline";
import { newId } from "@/lib/id";
import { revokeAsset } from "@/lib/mediaImport";

export type UIAsset = Asset & { name?: string; objectUrl?: string };

interface TimelineState {
  timeline: Timeline;
  currentTime: number;
  isPlaying: boolean;
  setTimeline: (t: Timeline) => void;
  setCurrentTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
  addAsset: (asset: UIAsset) => void;
  removeAsset: (assetId: string) => void;
}

// TODO (T2): add full clip operations and undo/redo history.
export const useTimelineStore = create<TimelineState>((set) => ({
  timeline: emptyTimeline(),
  currentTime: 0,
  isPlaying: false,
  setTimeline: (timeline) => set({ timeline }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setPlaying: (isPlaying) => set({ isPlaying }),

  addAsset: (asset) =>
    set((state) => {
      const isFirstAsset = state.timeline.assets.length === 0;
      const newAssets = [...state.timeline.assets, asset];

      let newProject = { ...state.timeline.project };
      let newTracks = [...state.timeline.tracks];

      if (isFirstAsset) {
        const assetDuration = asset.duration || 0;
        newProject = {
          ...newProject,
          width: asset.width || newProject.width,
          height: asset.height || newProject.height,
          duration: assetDuration,
        };

        // Auto-create ONE clip on the video track covering the asset (T1 only)
        const videoTrackIndex = newTracks.findIndex((t) => t.type === "video");
        const initialClip: Clip = {
          id: newId("clip"),
          assetId: asset.id,
          start: 0,
          end: assetDuration,
          sourceIn: 0,
          transform: {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
          },
          effects: [],
        };

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

      return {
        timeline: {
          ...state.timeline,
          project: newProject,
          assets: newAssets,
          tracks: newTracks,
        },
        currentTime: isFirstAsset ? 0 : state.currentTime,
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

      const isNowEmpty = newAssets.length === 0;
      const newProject = isNowEmpty
        ? { ...state.timeline.project, duration: 0 }
        : state.timeline.project;

      return {
        timeline: {
          ...state.timeline,
          project: newProject,
          assets: newAssets,
          tracks: newTracks,
        },
        currentTime: isNowEmpty ? 0 : state.currentTime,
        isPlaying: isNowEmpty ? false : state.isPlaying,
      };
    }),
}));
