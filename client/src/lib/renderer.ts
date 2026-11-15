import {
  Application,
  Container,
  Graphics,
  Sprite,
  Texture,
  VideoSource,
} from "pixi.js";
import type { Asset, Timeline } from "@/types/timeline";

export class PulsecutRenderer {
  private app: Application | null = null;
  private container: HTMLElement | null = null;
  private projectFrame: Container | null = null;
  private bgGraphics: Graphics | null = null;
  private assetMedia = new Map<
    string,
    {
      video: HTMLVideoElement;
      source: VideoSource;
      texture: Texture;
      sprite: Sprite;
    }
  >();
  private imageMedia = new Map<
    string,
    {
      image: HTMLImageElement;
      texture: Texture;
      sprite: Sprite;
    }
  >();
  private projectWidth = 1080;
  private projectHeight = 1920;
  private isDestroyed = false;
  private initPromise: Promise<void> | null = null;
  private activeVideoElement: HTMLVideoElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  async init(container: HTMLElement): Promise<void> {
    if (this.app) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.isDestroyed = false;
    this.container = container;

    this.initPromise = (async () => {
      const app = new Application();
      await app.init({
        resizeTo: container,
        background: "#0B0C10",
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      // StrictMode guard: if destroyed while awaiting app.init
      if (this.isDestroyed) {
        app.destroy(true, { children: true, texture: true });
        return;
      }

      this.app = app;
      container.innerHTML = "";
      container.appendChild(app.canvas);

      this.projectFrame = new Container();
      this.bgGraphics = new Graphics();
      this.projectFrame.addChild(this.bgGraphics);
      this.app.stage.addChild(this.projectFrame);

      this.updateProjectLayout();

      // Listen to resize on container
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.isDestroyed && this.app) {
          this.app.resize();
          this.updateProjectLayout();
        }
      });
      this.resizeObserver.observe(container);
    })();

    return this.initPromise;
  }

  setProject(width: number, height: number): void {
    this.projectWidth = width || 1080;
    this.projectHeight = height || 1920;
    this.updateProjectLayout();
  }

  setAssets(assets: Asset[]): void {
    const currentAssetIds = new Set(assets.map((a) => a.id));

    // Remove deleted assets
    for (const [id, media] of this.assetMedia.entries()) {
      if (!currentAssetIds.has(id)) {
        media.video.pause();
        media.video.src = "";
        media.video.load();
        if (this.projectFrame && media.sprite.parent === this.projectFrame) {
          this.projectFrame.removeChild(media.sprite);
        }
        media.texture.destroy(true);
        this.assetMedia.delete(id);
      }
    }

    for (const [id, media] of this.imageMedia.entries()) {
      if (!currentAssetIds.has(id)) {
        if (this.projectFrame && media.sprite.parent === this.projectFrame) {
          this.projectFrame.removeChild(media.sprite);
        }
        media.texture.destroy(true);
        this.imageMedia.delete(id);
      }
    }

    // Add newly imported video & image assets
    for (const asset of assets) {
      if (asset.type === "video" && !this.assetMedia.has(asset.id)) {
        const video = document.createElement("video");
        video.src = asset.url;
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.autoplay = false;

        const source = new VideoSource({
          resource: video,
          autoPlay: false,
        });

        const texture = new Texture({ source });
        const sprite = new Sprite(texture);
        sprite.visible = false;

        video.addEventListener("seeked", () => {
          source.update();
        });

        if (this.projectFrame) {
          this.projectFrame.addChild(sprite);
        }

        this.assetMedia.set(asset.id, { video, source, texture, sprite });
      } else if (asset.type === "image" && !this.imageMedia.has(asset.id)) {
        const image = new Image();
        image.src = asset.url;
        const texture = Texture.from(image);
        const sprite = new Sprite(texture);
        sprite.visible = false;

        if (this.projectFrame) {
          this.projectFrame.addChild(sprite);
        }

        this.imageMedia.set(asset.id, { image, texture, sprite });
      }
    }
  }

  render(timeline: Timeline, time: number): void {
    if (!this.app || !this.projectFrame || this.isDestroyed) {
      return;
    }

    if (
      timeline.project.width !== this.projectWidth ||
      timeline.project.height !== this.projectHeight
    ) {
      this.setProject(timeline.project.width, timeline.project.height);
    }

    this.setAssets(timeline.assets);

    const fps = timeline.project.fps || 30;

    // Find active video / image clip
    const videoTrack = timeline.tracks.find((t) => t.type === "video");
    const activeClip = videoTrack?.clips.find(
      (c) => time >= c.start && time < c.end
    );

    // Hide all sprites initially
    for (const media of this.assetMedia.values()) {
      media.sprite.visible = false;
    }
    for (const media of this.imageMedia.values()) {
      media.sprite.visible = false;
    }

    if (activeClip && activeClip.assetId) {
      const videoMedia = this.assetMedia.get(activeClip.assetId);
      const imageMedia = this.imageMedia.get(activeClip.assetId);

      const clipDuration = activeClip.end - activeClip.start;
      const localTime = time - activeClip.start;
      let fadeAlpha = 1;
      if (activeClip.fadeIn && activeClip.fadeIn > 0 && localTime < activeClip.fadeIn) {
        fadeAlpha *= Math.max(0, localTime / activeClip.fadeIn);
      }
      if (
        activeClip.fadeOut &&
        activeClip.fadeOut > 0 &&
        localTime > clipDuration - activeClip.fadeOut
      ) {
        fadeAlpha *= Math.max(0, (clipDuration - localTime) / activeClip.fadeOut);
      }

      const t = activeClip.transform || {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
      };

      if (videoMedia) {
        this.activeVideoElement = videoMedia.video;
        const sourceTime = activeClip.sourceIn + (time - activeClip.start);

        if (videoMedia.video.paused) {
          const diff = Math.abs(videoMedia.video.currentTime - sourceTime);
          if (diff > 1 / (2 * fps)) {
            videoMedia.video.currentTime = sourceTime;
          }
        }

        const vw = videoMedia.video.videoWidth || this.projectWidth;
        const vh = videoMedia.video.videoHeight || this.projectHeight;

        const scale = Math.min(this.projectWidth / vw, this.projectHeight / vh);
        videoMedia.sprite.width = vw * scale;
        videoMedia.sprite.height = vh * scale;

        videoMedia.sprite.x = (this.projectWidth - videoMedia.sprite.width) / 2 + (t.x || 0);
        videoMedia.sprite.y = (this.projectHeight - videoMedia.sprite.height) / 2 + (t.y || 0);
        videoMedia.sprite.scale.x *= t.scale ?? 1;
        videoMedia.sprite.scale.y *= t.scale ?? 1;
        videoMedia.sprite.rotation = ((t.rotation || 0) * Math.PI) / 180;
        videoMedia.sprite.alpha = (t.opacity ?? 1) * fadeAlpha;
        videoMedia.sprite.visible = true;

        if (videoMedia.video.paused) {
          videoMedia.source.update();
        }
      } else if (imageMedia) {
        this.activeVideoElement = null;
        const iw = imageMedia.image.naturalWidth || this.projectWidth;
        const ih = imageMedia.image.naturalHeight || this.projectHeight;

        const scale = Math.min(this.projectWidth / iw, this.projectHeight / ih);
        imageMedia.sprite.width = iw * scale;
        imageMedia.sprite.height = ih * scale;

        imageMedia.sprite.x = (this.projectWidth - imageMedia.sprite.width) / 2 + (t.x || 0);
        imageMedia.sprite.y = (this.projectHeight - imageMedia.sprite.height) / 2 + (t.y || 0);
        imageMedia.sprite.scale.x *= t.scale ?? 1;
        imageMedia.sprite.scale.y *= t.scale ?? 1;
        imageMedia.sprite.rotation = ((t.rotation || 0) * Math.PI) / 180;
        imageMedia.sprite.alpha = (t.opacity ?? 1) * fadeAlpha;
        imageMedia.sprite.visible = true;
      } else {
        this.activeVideoElement = null;
      }
    } else {
      this.activeVideoElement = null;
    }

    this.app.render();
  }

  private updateProjectLayout(): void {
    if (!this.app || !this.projectFrame || !this.bgGraphics) return;

    const canvasWidth = this.app.screen.width;
    const canvasHeight = this.app.screen.height;

    // Margin padding
    const padding = 16;
    const availableW = Math.max(10, canvasWidth - padding * 2);
    const availableH = Math.max(10, canvasHeight - padding * 2);

    const scale = Math.min(
      availableW / this.projectWidth,
      availableH / this.projectHeight
    );

    this.projectFrame.scale.set(scale);
    this.projectFrame.position.set(
      (canvasWidth - this.projectWidth * scale) / 2,
      (canvasHeight - this.projectHeight * scale) / 2
    );

    // Draw project frame background (black canvas inside project boundary)
    this.bgGraphics.clear();
    this.bgGraphics.rect(0, 0, this.projectWidth, this.projectHeight);
    this.bgGraphics.fill({ color: 0x000000 });
  }

  // T1-only playback helpers
  // TODO(T5): replaced by PlaybackController
  async play(): Promise<void> {
    if (this.activeVideoElement && this.activeVideoElement.paused) {
      try {
        await this.activeVideoElement.play();
      } catch (err) {
        console.warn("Autoplay / play blocked:", err);
        throw err;
      }
    }
  }

  pause(): void {
    if (this.activeVideoElement && !this.activeVideoElement.paused) {
      this.activeVideoElement.pause();
    }
  }

  seek(time: number): void {
    if (this.activeVideoElement) {
      this.activeVideoElement.currentTime = time;
    }
  }

  getActiveVideoElement(): HTMLVideoElement | null {
    return this.activeVideoElement;
  }

  destroy(): void {
    this.isDestroyed = true;
    this.initPromise = null;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    for (const media of this.assetMedia.values()) {
      media.video.pause();
      media.video.src = "";
      media.video.load();
      media.texture.destroy(true);
    }
    this.assetMedia.clear();
    this.activeVideoElement = null;

    if (this.app) {
      try {
        this.app.destroy(true, { children: true, texture: true });
      } catch {
        // App already destroyed
      }
      this.app = null;
    }

    if (this.container) {
      this.container.innerHTML = "";
      this.container = null;
    }
    this.projectFrame = null;
    this.bgGraphics = null;
  }
}
