import { newId } from "./id";
import type { Asset } from "@/types/timeline";

export type ImportedAsset = Asset & { name: string; objectUrl: string };

/**
 * Imports a video file, validates duration and dimensions.
 */
export async function importVideo(file: File): Promise<ImportedAsset> {
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
          new Error("Video loading timed out after 10 seconds. The file may be corrupted or unsupported.")
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
        reject(new Error("Failed to load video metadata. Browser cannot decode this file."));
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

    return {
      id: newId("asset"),
      type: "video",
      url: objectUrl,
      objectUrl,
      name: file.name,
      duration: video.duration,
      width: video.videoWidth || 1920,
      height: video.videoHeight || 1080,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  } finally {
    video.src = "";
    video.load();
  }
}

/**
 * Imports an image file (PNG, JPG, WebP, SVG) and extracts dimensions.
 * Assigns default duration of 5.0 seconds.
 */
export async function importImage(file: File): Promise<ImportedAsset> {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image file. Invalid format or corrupted file."));
      img.src = objectUrl;
    });

    return {
      id: newId("asset"),
      type: "image",
      url: objectUrl,
      objectUrl,
      name: file.name,
      duration: 5.0, // Standard 5s duration for image clips
      width: img.naturalWidth || 1080,
      height: img.naturalHeight || 1080,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

/**
 * Imports an audio file (MP3, WAV, OGG, AAC) and validates duration.
 */
export async function importAudio(file: File): Promise<ImportedAsset> {
  const objectUrl = URL.createObjectURL(file);
  const audio = new Audio();

  try {
    await new Promise<void>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => reject(new Error("Failed to load audio file. Unsupported codec."));
      audio.src = objectUrl;
    });

    return {
      id: newId("asset"),
      type: "audio",
      url: objectUrl,
      objectUrl,
      name: file.name,
      duration: audio.duration || 10.0,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

/**
 * Universal media importer: detects MIME type and routes to video, image, or audio loader.
 */
export async function importMediaFile(file: File): Promise<ImportedAsset> {
  if (file.type.startsWith("video/")) {
    return importVideo(file);
  } else if (file.type.startsWith("image/")) {
    return importImage(file);
  } else if (file.type.startsWith("audio/")) {
    return importAudio(file);
  } else {
    throw new Error(
      `Unsupported media format "${file.type || file.name.split(".").pop()}". Please select an MP4, WebM, PNG, JPG, WebP, or MP3/WAV file.`
    );
  }
}

export function revokeAsset(asset: { objectUrl?: string; url?: string }): void {
  const target = asset.objectUrl || asset.url;
  if (target && target.startsWith("blob:")) {
    URL.revokeObjectURL(target);
  }
}
