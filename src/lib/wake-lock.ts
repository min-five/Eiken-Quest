/* ============================================================
   Screen Wake Lock & Keep-Awake Helper (iOS Safari / PWA Standalone supported)
   Combines native Screen Wake Lock API with invisible silent loop video fallback
   for 100% reliable sleep prevention across mobile devices and home screen PWAs.
   ============================================================ */

type WakeLockSentinelLike = {
  released: boolean;
  release(): Promise<void>;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
};

class WakeLockController {
  private sentinel: WakeLockSentinelLike | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private isRequested = false;
  private listeners = new Set<(active: boolean) => void>();
  private interactionBound = false;

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", async () => {
        if (this.isRequested && document.visibilityState === "visible") {
          await this.acquire();
        }
      });
      this.bindInteraction();
    }
  }

  private bindInteraction() {
    if (this.interactionBound || typeof window === "undefined") return;
    this.interactionBound = true;

    const onUserInteraction = async () => {
      if (this.isRequested && !this.isActive()) {
        await this.acquire();
      }
    };

    window.addEventListener("pointerdown", onUserInteraction, { passive: true });
    window.addEventListener("touchstart", onUserInteraction, { passive: true });
    window.addEventListener("click", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction, { passive: true });
  }

  public isSupported(): boolean {
    return (
      (typeof navigator !== "undefined" && "wakeLock" in navigator) ||
      typeof document !== "undefined"
    );
  }

  public isActive(): boolean {
    const hasSentinel = this.sentinel !== null && !this.sentinel.released;
    const isVideoPlaying = !!(this.videoEl && !this.videoEl.paused && !this.videoEl.ended);
    return hasSentinel || isVideoPlaying;
  }

  public subscribe(fn: (active: boolean) => void): () => void {
    this.listeners.add(fn);
    fn(this.isActive());
    return () => this.listeners.delete(fn);
  }

  private notify() {
    const active = this.isActive();
    this.listeners.forEach((fn) => {
      try {
        fn(active);
      } catch (e) {
        console.warn("[WakeLock] listener error", e);
      }
    });
  }

  public async enable(): Promise<boolean> {
    this.isRequested = true;
    return await this.acquire();
  }

  public async disable(): Promise<void> {
    this.isRequested = false;
    await this.release();
  }

  public async setEnabled(enabled: boolean): Promise<boolean> {
    if (enabled) {
      return await this.enable();
    } else {
      await this.disable();
      return false;
    }
  }

  private initVideoElement(): HTMLVideoElement {
    if (this.videoEl) return this.videoEl;

    const v = document.createElement("video");
    v.setAttribute("title", "EikenQuest KeepAwake");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("muted", "");
    v.setAttribute("loop", "");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
    v.style.cssText =
      "position:fixed;width:1px;height:1px;opacity:0.001;pointer-events:none;left:-9999px;top:-9999px;z-index:-999;";
    v.src = "/silent-keep-awake.mp4";

    // Fallback data URI if network file fails to load
    v.onerror = () => {
      v.src =
        "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr9tZGF0AAACoAYF//+///AAAAMmF2Y0MBZAAK/+EAGWdkAAqs2V+WXAWyAAADAAIAAAMAYB4kSywBAAZo6+PLIsAAAAAYc3R0cwAAAAAAAAABAAAAAQAAAgAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAACtwAAAAEAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTQuNjMuMTA0";
    };

    document.body.appendChild(v);
    this.videoEl = v;
    return v;
  }

  private async acquire(): Promise<boolean> {
    if (!this.isRequested) return false;

    let nativeSuccess = false;

    // 1. Try native Screen Wake Lock API
    if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
      try {
        if (!this.sentinel || this.sentinel.released) {
          const lock = await (navigator as any).wakeLock.request("screen");
          this.sentinel = lock;
          lock.addEventListener("release", () => {
            this.sentinel = null;
            // If released unexpectedly and still requested, fallback to video
            if (this.isRequested) {
              this.startVideoFallback();
            }
            this.notify();
          });
          nativeSuccess = true;
        } else {
          nativeSuccess = true;
        }
      } catch (err: any) {
        // Expected when user hasn't interacted or in certain iOS PWA modes
        nativeSuccess = false;
      }
    }

    // 2. Also start silent video loop fallback (vital for iOS PWA Standalone WebClip)
    const videoSuccess = await this.startVideoFallback();

    this.notify();
    return nativeSuccess || videoSuccess;
  }

  private async startVideoFallback(): Promise<boolean> {
    if (typeof document === "undefined") return false;
    try {
      const v = this.initVideoElement();
      if (v.paused) {
        const playPromise = v.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  private async release(): Promise<void> {
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (err) {
        console.warn("[WakeLock] Release error:", err);
      }
      this.sentinel = null;
    }

    if (this.videoEl) {
      try {
        this.videoEl.pause();
        this.videoEl.currentTime = 0;
      } catch {
        // ignore
      }
    }

    this.notify();
  }
}

export const WakeLockManager = new WakeLockController();

