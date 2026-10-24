/* ============================================================
   Toasts, sound effects, speech & confetti
   ============================================================ */
import type { ToastItem, ToastOptions, ToastType } from "../types";
import { Store } from "./store";

/* ---------------- Toasts ---------------- */

type ToastListener = (item: ToastItem) => void;
const toastListeners = new Set<ToastListener>();
let toastSeq = 0;

export function toast(
  message: string,
  opts?: ToastOptions | ToastType | string,
  duration?: number,
): void {
  const o: ToastOptions = typeof opts === "string" ? { type: opts as ToastType } : opts || {};
  const icons: Record<string, string> = { success: "✓", error: "!", info: "i", xp: "⚡" };
  const item: ToastItem = {
    id: (toastSeq += 1),
    message,
    type: o.type,
    icon: o.icon || (o.type ? icons[o.type] : "✓"),
    duration: duration || o.duration || 3200,
  };
  toastListeners.forEach((fn) => fn(item));
}

export function subscribeToasts(fn: ToastListener): () => void {
  toastListeners.add(fn);
  return () => {
    toastListeners.delete(fn);
  };
}

/* ---------------- Sound ---------------- */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function tone(freq: number, dur: number, type?: OscillatorType, gain?: number, delay?: number): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + (delay || 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain || 0.05, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function soundEnabled(): boolean {
  return Store.state.settings.sound !== false;
}

export type SfxName = "correct" | "wrong" | "complete" | "click" | "tick" | "alarm" | "xp" | "success";

export function sfx(name: SfxName): void {
  if (!soundEnabled()) return;
  if (name === "alarm" && Store.state.settings.timerSound === false) return;
  try {
    switch (name) {
      case "correct":
        tone(784, 0.12, "sine", 0.055);
        tone(1046, 0.16, "sine", 0.05, 0.09);
        break;
      case "wrong":
        tone(196, 0.22, "sawtooth", 0.035);
        tone(147, 0.26, "sawtooth", 0.03, 0.08);
        break;
      case "complete":
        [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, "triangle", 0.055, i * 0.1));
        break;
      case "click":
        tone(660, 0.045, "sine", 0.025);
        break;
      case "tick":
        tone(1000, 0.02, "square", 0.012);
        break;
      case "alarm":
        [0, 0.34, 0.68].forEach((d) => {
          tone(880, 0.22, "sine", 0.09, d);
          tone(1174, 0.18, "sine", 0.06, d + 0.08);
        });
        break;
      case "xp":
        tone(880, 0.1, "triangle", 0.04);
        tone(1318, 0.2, "triangle", 0.04, 0.08);
        break;
      case "success":
      default:
        tone(600, 0.06, "sine", 0.03);
    }
  } catch {
    /* audio is optional */
  }
}

/* ---------------- Speech ---------------- */

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): void {
  if (!window.speechSynthesis) return;
  voicesCache = window.speechSynthesis.getVoices() || [];
}

if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onend?: () => void;
}

export function speak(text: string, opts?: SpeakOptions): void {
  if (!window.speechSynthesis) {
    toast("このブラウザは音声読み上げに対応していません。", "info");
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    const o = opts || {};
    u.lang = o.lang || "en-US";
    u.rate = o.rate || 0.92;
    u.pitch = o.pitch || 1;
    if (!voicesCache.length) loadVoices();
    const voices = voicesCache;
    let v: SpeechSynthesisVoice | undefined;
    if (o.lang && o.lang.indexOf("ja") === 0) {
      v = voices.find((x) => /ja[-_]JP/i.test(x.lang));
    } else {
      v =
        voices.find((x) => /en[-_]US/i.test(x.lang) && /Samantha|Google|Microsoft|Natural|Zira|Aria/i.test(x.name)) ||
        voices.find((x) => /en[-_]US/i.test(x.lang)) ||
        voices.find((x) => /^en/i.test(x.lang));
    }
    if (v) u.voice = v;
    if (o.onend) u.onend = o.onend;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn(e);
  }
}

export function stopSpeak(): void {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

/* ---------------- Confetti ---------------- */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
}

let confettiRaf = 0;

export function confetti(opts?: { count?: number }): void {
  const o = opts || {};
  const canvas = document.getElementById("confetti") as HTMLCanvasElement | null;
  if (!canvas) return;
  if (Store.state.settings.motion === "reduce") return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvas.classList.add("is-on");

  const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#3b82f6", "#22c55e", "#f43f5e"];
  const count = o.count || 140;
  const parts: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    parts.push({
      x: w / 2 + (Math.random() - 0.5) * w * 0.5,
      y: h * 0.38 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 12 - 3,
      g: 0.28 + Math.random() * 0.16,
      w: 5 + Math.random() * 7,
      h: 4 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  const start = performance.now();
  if (confettiRaf) cancelAnimationFrame(confettiRaf);

  function frame(now: number): void {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, w, h);
    parts.forEach((p) => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.995;
      p.rot += p.vr;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = Math.max(0, 1 - elapsed / 2600);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    });
    if (elapsed < 2600) {
      confettiRaf = requestAnimationFrame(frame);
    } else {
      ctx!.clearRect(0, 0, w, h);
      canvas!.classList.remove("is-on");
      confettiRaf = 0;
    }
  }
  confettiRaf = requestAnimationFrame(frame);
}

export function scrollTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
