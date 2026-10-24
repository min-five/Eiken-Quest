/* ============================================================
   Hash router
   ============================================================ */
import { useEffect, useState } from "react";

export const ROUTES = {
  home: { page: "home", title: "ホーム" },
  vocab: { page: "vocab", title: "単語帳" },
  grammar: { page: "grammar", title: "英文法" },
  exam: { page: "exam", title: "1次試験対策" },
  interview: { page: "interview", title: "2次試験（面接）" },
  clock: { page: "clock", title: "時計・集中タイマー" },
  progress: { page: "progress", title: "学習記録" },
  settings: { page: "settings", title: "設定" },
} as const;

export type RouteName = keyof typeof ROUTES;

export interface Route {
  name: RouteName;
  params: string[];
}

export function isRouteName(name: string): name is RouteName {
  return Object.prototype.hasOwnProperty.call(ROUTES, name);
}

export function parseHash(): Route {
  let raw = window.location.hash || "";
  if (raw.charAt(0) === "#") raw = raw.slice(1);
  if (raw.charAt(0) === "/") raw = raw.slice(1);
  if (!raw) return { name: "home", params: [] };
  const parts = raw
    .split("/")
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    });
  const first = parts.shift() || "home";
  return { name: isRouteName(first) ? first : "home", params: parts };
}

export function navigate(hash: string): void {
  const target = hash.startsWith("#") ? hash : `#${hash}`;
  if (window.location.hash !== target) window.location.hash = target;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash());
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function titleFor(name: RouteName): string {
  return `EikenQuest — ${ROUTES[name]?.title ?? "英検学習"}`;
}
