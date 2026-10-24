/* ============================================================
   Formatting helpers
   ============================================================ */
import type { GradeFilter, GradeId } from "../types";
import { EQ_GRADE_MAP } from "../data/vocabulary";

export function esc(str: string | number | null | undefined): string {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function gradeOf(id: string): (typeof EQ_GRADE_MAP)[GradeId] | null {
  return EQ_GRADE_MAP[id as GradeId] ?? null;
}

export function gradeLabel(grade: GradeFilter): string {
  if (grade === "all") return "すべての級";
  const info = gradeOf(grade);
  return info ? info.full : grade;
}

export function fmtDate(d?: number | Date | string): string {
  const t = d ? new Date(d) : new Date();
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${t.getFullYear()}年${t.getMonth() + 1}月${t.getDate()}日（${days[t.getDay()]}）`;
}

export function fmtShortDate(key: string): string {
  const parts = String(key).split("-");
  if (parts.length !== 3) return key;
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "こんばんは";
  if (h < 11) return "おはようございます";
  if (h < 18) return "こんにちは";
  return "こんばんは";
}

export function fmtDuration(totalSec: number, forceHours?: boolean): string {
  const sec = Math.max(0, Math.floor(Number(totalSec) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0 || forceHours) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function fmtMsParts(ms: number): { base: string; centis: string } {
  const total = Math.max(0, Math.floor(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  const base = `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return { base, centis: String(cs).padStart(2, "0") };
}

export function plainMs(ms: number): string {
  const { base, centis } = fmtMsParts(ms);
  return `${base}.${centis}`;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number): (...args: A) => void {
  let timer = 0;
  return (...args: A) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
