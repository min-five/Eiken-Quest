/* ============================================================
   Screen Wake Lock API helper
   Reference: https://developer.mozilla.org/ja/docs/Web/API/Screen_Wake_Lock_API
   ============================================================ */

type WakeLockSentinelLike = {
  released: boolean;
  release(): Promise<void>;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
};

class WakeLockController {
  private sentinel: WakeLockSentinelLike | null = null;
  private isRequested = false;
  private listeners = new Set<(active: boolean) => void>();

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", async () => {
        if (this.isRequested && document.visibilityState === "visible") {
          await this.acquire();
        }
      });
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== "undefined" && "wakeLock" in navigator;
  }

  public isActive(): boolean {
    return this.sentinel !== null && !this.sentinel.released;
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

  private async acquire(): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (this.sentinel && !this.sentinel.released) return true;

    try {
      const lock = await (navigator as any).wakeLock.request("screen");
      this.sentinel = lock;
      lock.addEventListener("release", () => {
        this.sentinel = null;
        this.notify();
      });
      this.notify();
      return true;
    } catch (err: any) {
      // Browsers may reject if battery is very low or document is not visible
      console.warn("[WakeLock] Request failed:", err?.message || err);
      this.sentinel = null;
      this.notify();
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
      this.notify();
    }
  }
}

export const WakeLockManager = new WakeLockController();
