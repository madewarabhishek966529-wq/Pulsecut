import { newId } from "./id";
import type { Asset } from "@/types/timeline";

export type ImportedVideoAsset = Asset & { name: string; objectUrl: string };

export async function importVideo(file: File): Promise<ImportedVideoAsset> {
  if (!file.type.startsWith("video/")) {
    throw new Error(
      `Unsupported file type "${file.type || "unknown"}". Please select a valid video file (MP4, WebM, etc.).`
    );
  }

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;

  try {
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            "Video loading timed out after 10 seconds. The file may be corrupted or unsupported."
          )
        );
      }, 10000);

      const onLoadedMetadata = () => {
        cleanup();
        if (!video.duration || isNaN(video.duration) || video.duration <= 0) {
          reject(new Error("Video file has an invalid or zero duration."));
          return;
        }
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(
          new Error("Failed to load video metadata. Browser cannot decode this file.")
        );
      };

      function cleanup() {
        clearTimeout(timeoutId);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);
      }

      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("error", onError);
      video.src = objectUrl;
    });

    const duration = video.duration;
    const width = video.videoWidth || 1920;
    const height = video.videoHeight || 1080;

    return {
      id: newId("asset"),
      type: "video",
      url: objectUrl,
      objectUrl,
      name: file.name,
      duration,
      width,
      height,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  } finally {
    video.src = "";
    video.load();
  }
}

export function revokeAsset(asset: { objectUrl?: string; url?: string }): void {
  const target = asset.objectUrl || asset.url;
  if (target && target.startsWith("blob:")) {
    URL.revokeObjectURL(target);
  }
}

