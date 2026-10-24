/* ============================================================
   Clock font stacks (mirrors the CSS font classes)
   ============================================================ */
import type { ClockFontId } from "../types";

const FONT_STACKS: Record<ClockFontId, string> = {
  orbitron: "'Orbitron', monospace",
  tech: "'Share Tech Mono', monospace",
  rounded: "'Zen Kaku Gothic New', sans-serif",
  serif: "'Shippori Mincho', serif",
  hand: "'Yomogi', cursive",
  pixel: "'DotGothic16', sans-serif",
  manrope: "'Manrope', sans-serif",
};

export function clockFontFamily(id: ClockFontId | string): string {
  return FONT_STACKS[id as ClockFontId] || FONT_STACKS.orbitron;
}
