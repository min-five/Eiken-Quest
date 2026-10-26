/* ============================================================
   EikenQuest — Cloud Sync Engine (Supabase Real-time / Auto-sync)
   ============================================================ */
import type { AppState, WordProgress, GrammarDone, QuizRecord, WritingSave, PomodoroLogEntry } from "../types";
import { Store } from "./store";

const SUPABASE_URL = "https://zrsqmkokbnrhfdovdofr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc3Fta29rYm5yaGZkb3Zkb2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NDI4OTIsImV4cCI6MjA5MDMxODg5Mn0.oJTqR2an9HTj2-Shde6z5_mKr73HySuqYck2H-hT3ow";

export type SyncStateStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export interface SyncInfo {
  status: SyncStateStatus;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  syncKey: string | null;
  deviceName: string;
}

// Simple subscriber pattern for sync status updates
const listeners = new Set<(info: SyncInfo) => void>();

function detectDeviceName(): string {
  if (typeof navigator === "undefined") return "端末";
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows PC";
  return "マイ端末";
}

let currentStatus: SyncStateStatus = "idle";
let lastSyncedAt: string | null = null;
let lastError: string | null = null;
let debounceTimer: any = null;
let pollTimer: any = null;
let isSyncing = false;

function emit(): void {
  const info = getSyncInfo();
  listeners.forEach((fn) => {
    try {
      fn(info);
    } catch (e) {
      console.warn("[CloudSync] listener error", e);
    }
  });
}

export function subscribeSync(listener: (info: SyncInfo) => void): () => void {
  listeners.add(listener);
  listener(getSyncInfo());
  return () => {
    listeners.delete(listener);
  };
}

export function getSyncInfo(): SyncInfo {
  const key = Store.state.settings.syncKey || null;
  const savedLast = Store.state.settings.lastSyncedAt || lastSyncedAt;
  return {
    status: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : currentStatus,
    lastSyncedAt: savedLast,
    errorMessage: lastError,
    syncKey: key,
    deviceName: Store.state.settings.deviceName || detectDeviceName(),
  };
}

/** Generate a human-friendly pairing code like "EQ-8492" or "EQ-B73K" */
export function generatePairingKey(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (0,1,I,O)
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EQ-${code}`;
}

/** Sanitize key */
export function cleanKey(key: string): string {
  return key.trim().toUpperCase();
}

/* ---------------- Supabase REST API ---------------- */

async function fetchRemote(syncKey: string): Promise<{ data: AppState; updatedAt: string } | null> {
  const key = cleanKey(syncKey);
  if (!key) return null;

  const url = `${SUPABASE_URL}/rest/v1/eikenquest_sync?sync_key=eq.${encodeURIComponent(key)}&select=*`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`クラウドからの取得に失敗しました (${res.status})`);
  }

  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return null; // not found yet
  }

  return {
    data: rows[0].data as AppState,
    updatedAt: rows[0].updated_at as string,
  };
}

async function pushRemote(syncKey: string, state: AppState): Promise<string> {
  const key = cleanKey(syncKey);
  if (!key) throw new Error("同期キーが未設定です");

  const url = `${SUPABASE_URL}/rest/v1/eikenquest_sync`;
  const body = {
    sync_key: key,
    data: state,
    client_name: state.settings.deviceName || detectDeviceName(),
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`クラウド保存エラー: ${res.status} ${errText}`);
  }

  const result = await res.json();
  const updatedIso = (Array.isArray(result) && result[0]?.updated_at) || new Date().toISOString();
  return updatedIso;
}

/* ---------------- Intelligent State Merging ---------------- */

export function mergeState(local: AppState, remote: AppState): AppState {
  if (!remote || !remote.profile) return local;

  // 1. XP, Streak, Goal Days
  const xp = Math.max(local.xp || 0, remote.xp || 0);
  const streak = Math.max(local.streak || 0, remote.streak || 0);
  const bestStreak = Math.max(local.bestStreak || 0, remote.bestStreak || 0);
  const goalDays = Math.max(local.goalDays || 0, remote.goalDays || 0);

  // 2. Vocabulary words merge (keep higher progress / later study)
  const words: Record<string, WordProgress> = { ...(local.words || {}) };
  if (remote.words) {
    Object.entries(remote.words).forEach(([w, rWord]) => {
      const lWord = words[w];
      if (!lWord) {
        words[w] = rWord;
      } else {
        words[w] = {
          lv: Math.max(lWord.lv || 0, rWord.lv || 0),
          seen: Math.max(lWord.seen || 0, rWord.seen || 0),
          correct: Math.max(lWord.correct || 0, rWord.correct || 0),
          wrong: Math.max(lWord.wrong || 0, rWord.wrong || 0),
          due: Math.max(lWord.due || 0, rWord.due || 0),
          fav: !!(lWord.fav || rWord.fav),
          last: Math.max(lWord.last || 0, rWord.last || 0),
        };
      }
    });
  }

  // 3. Grammar Done & Read
  const grammarDone: Record<string, GrammarDone> = { ...(local.grammarDone || {}) };
  if (remote.grammarDone) {
    Object.entries(remote.grammarDone).forEach(([gid, rDone]) => {
      const lDone = grammarDone[gid];
      if (!lDone) {
        grammarDone[gid] = rDone;
      } else {
        grammarDone[gid] = {
          done: lDone.done || rDone.done,
          ts: Math.max(lDone.ts || 0, rDone.ts || 0),
          best: Math.max(lDone.best || 0, rDone.best || 0),
          total: Math.max(lDone.total || 0, rDone.total || 0),
        };
      }
    });
  }

  const grammarRead: Record<string, number> = { ...(local.grammarRead || {}) };
  if (remote.grammarRead) {
    Object.entries(remote.grammarRead).forEach(([gid, rTs]) => {
      grammarRead[gid] = Math.max(grammarRead[gid] || 0, rTs);
    });
  }

  // 4. Badges (Union)
  const badgeSet = new Set<string>([...(local.badges || []), ...(remote.badges || [])]);
  const badges = Array.from(badgeSet);

  // 5. Quiz History (Union by unique timestamp + type, keep recent 100)
  const quizMap = new Map<string, QuizRecord>();
  (local.quizHistory || []).forEach((q) => {
    quizMap.set(`${q.ts}_${q.type}_${q.score}`, q);
  });
  (remote.quizHistory || []).forEach((q) => {
    quizMap.set(`${q.ts}_${q.type}_${q.score}`, q);
  });
  const quizHistory = Array.from(quizMap.values())
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 100);

  // 6. Pomodoro
  const pomoLogMap = new Map<number, PomodoroLogEntry>();
  ((local.pomodoro && local.pomodoro.log) || []).forEach((item) => pomoLogMap.set(item.ts, item));
  ((remote.pomodoro && remote.pomodoro.log) || []).forEach((item) => pomoLogMap.set(item.ts, item));
  const mergedPomoLog = Array.from(pomoLogMap.values())
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 150);

  const pomodoro = {
    completed: Math.max(local.pomodoro?.completed || 0, remote.pomodoro?.completed || 0),
    focusMin: Math.max(local.pomodoro?.focusMin || 0, remote.pomodoro?.focusMin || 0),
    log: mergedPomoLog,
  };

  // 7. Writing saves
  const writingSaves: Record<string, WritingSave> = { ...(local.writingSaves || {}) };
  if (remote.writingSaves) {
    Object.entries(remote.writingSaves).forEach(([id, rSave]) => {
      const lSave = writingSaves[id];
      if (!lSave || (rSave.updatedAt || 0) > (lSave.updatedAt || 0)) {
        writingSaves[id] = rSave;
      }
    });
  }

  // 8. Dictation done
  const dictationDone: Record<string, number> = { ...(local.dictationDone || {}) };
  if (remote.dictationDone) {
    Object.entries(remote.dictationDone).forEach(([id, rTs]) => {
      dictationDone[id] = Math.max(dictationDone[id] || 0, rTs);
    });
  }

  // 9. Interview
  const interview = { ...(local.interview || {}), ...(remote.interview || {}) };

  // 10. Today Stats
  const todayDate = Store.todayKey();
  let today = local.today;
  if (remote.today && remote.today.date === todayDate) {
    if (!today || today.date !== todayDate) {
      today = remote.today;
    } else {
      today = {
        date: todayDate,
        xp: Math.max(today.xp || 0, remote.today.xp || 0),
        answered: Math.max(today.answered || 0, remote.today.answered || 0),
        correct: Math.max(today.correct || 0, remote.today.correct || 0),
        goalHit: today.goalHit || remote.today.goalHit,
      };
    }
  }

  // Settings: preserve local device-specific settings, keep syncKey intact
  const settings = {
    ...remote.settings,
    ...local.settings,
    syncKey: local.settings.syncKey || remote.settings.syncKey,
    autoSync: local.settings.autoSync ?? remote.settings.autoSync ?? true,
  };

  return {
    version: Math.max(local.version || 1, remote.version || 1),
    profile: {
      name: local.profile.name || remote.profile.name || "学習者",
      grade: local.profile.grade || remote.profile.grade || "3",
    },
    settings,
    xp,
    streak,
    bestStreak,
    lastStudy: (local.lastStudy && local.lastStudy > (remote.lastStudy || "")) ? local.lastStudy : (remote.lastStudy || local.lastStudy),
    today,
    words,
    grammarDone,
    grammarRead,
    quizHistory,
    log: { ...(remote.log || {}), ...(local.log || {}) },
    pomodoro,
    interview,
    writingSaves,
    dictationDone,
    badges,
    goalDays,
    createdAt: Math.min(local.createdAt || Date.now(), remote.createdAt || Date.now()),
    lastModified: Date.now(),
  };
}

/* ---------------- High-level Sync Controller ---------------- */

export const CloudSync = {
  getSyncInfo,
  subscribe: subscribeSync,
  generatePairingKey,
  cleanKey,

  /** Set the sync key and trigger initial bidirectional synchronization */
  async setSyncKey(newKey: string, deviceName?: string): Promise<{ success: boolean; message: string }> {
    const key = cleanKey(newKey);
    if (!key) {
      Store.setSetting("syncKey", undefined);
      currentStatus = "idle";
      lastError = null;
      emit();
      return { success: true, message: "同期設定を解除しました" };
    }

    Store.setSetting("syncKey", key);
    if (deviceName) Store.setSetting("deviceName", deviceName);
    Store.setSetting("autoSync", true);

    return await this.syncNow();
  },

  /** Disconnect cloud sync */
  disconnect(): void {
    Store.setSetting("syncKey", undefined);
    currentStatus = "idle";
    lastError = null;
    emit();
  },

  /** Execute full 2-way sync right now */
  async syncNow(): Promise<{ success: boolean; message: string }> {
    const key = Store.state.settings.syncKey;
    if (!key) {
      return { success: false, message: "同期キーが設定されていません" };
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      currentStatus = "offline";
      emit();
      return { success: false, message: "オフラインのため同期できません" };
    }

    if (isSyncing) {
      return { success: true, message: "同期中です..." };
    }

    isSyncing = true;
    currentStatus = "syncing";
    lastError = null;
    emit();

    try {
      // 1. Fetch remote record
      const remote = await fetchRemote(key);

      let merged = Store.state;
      if (remote && remote.data) {
        // Merge remote with local
        merged = mergeState(Store.state, remote.data);
        Store.importDirect(merged);
      }

      // 2. Push merged state back to cloud
      const updatedIso = await pushRemote(key, merged);

      currentStatus = "synced";
      lastSyncedAt = updatedIso;
      Store.setSetting("lastSyncedAt", updatedIso);
      emit();

      return { success: true, message: "クラウド同期が完了しました！" };
    } catch (err: any) {
      console.error("[CloudSync] sync error:", err);
      currentStatus = "error";
      lastError = err?.message || "同期中にエラーが発生しました";
      emit();
      return { success: false, message: lastError || "同期エラー" };
    } finally {
      isSyncing = false;
    }
  },

  /** Debounced background push when local state changes */
  schedulePush(): void {
    const key = Store.state.settings.syncKey;
    const auto = Store.state.settings.autoSync !== false;
    if (!key || !auto) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      this.syncNow().catch((e) => console.warn("[CloudSync] scheduled push error", e));
    }, 2000); // 2s debounce
  },

  /** Pull from cloud if remote has been updated by another device */
  async checkAndPull(): Promise<void> {
    const key = Store.state.settings.syncKey;
    const auto = Store.state.settings.autoSync !== false;
    if (!key || !auto || isSyncing) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    try {
      const remote = await fetchRemote(key);
      if (!remote || !remote.data) return;

      const remoteTime = new Date(remote.updatedAt).getTime();
      const localTime = Store.state.settings.lastSyncedAt
        ? new Date(Store.state.settings.lastSyncedAt).getTime()
        : 0;

      // If remote is newer by more than 1 second, pull and merge
      if (remoteTime > localTime + 1000) {
        console.log("[CloudSync] Remote updates detected, merging...");
        const merged = mergeState(Store.state, remote.data);
        Store.importDirect(merged);
        lastSyncedAt = remote.updatedAt;
        Store.setSetting("lastSyncedAt", remote.updatedAt);
        currentStatus = "synced";
        emit();
      }
    } catch (err) {
      console.warn("[CloudSync] checkAndPull error", err);
    }
  },

  /** Initialize automatic lifecycle listeners */
  init(): void {
    if (typeof window === "undefined") return;

    // 1. Check URL parameters for one-click setup (?sync=EQ-XXXX)
    try {
      const url = new URL(window.location.href);
      const syncParam = url.searchParams.get("sync");
      if (syncParam && syncParam.length >= 3) {
        const clean = cleanKey(syncParam);
        console.log("[CloudSync] Auto-configuring syncKey from URL param:", clean);
        Store.setSetting("syncKey", clean);
        Store.setSetting("autoSync", true);
        // Clean URL to prevent re-triggering
        url.searchParams.delete("sync");
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      // ignore
    }

    // 2. Perform initial sync on startup
    if (Store.state.settings.syncKey) {
      setTimeout(() => {
        this.syncNow();
      }, 800);
    }

    // 3. Tab visibility change (e.g. user opens Safari after studying on PC)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.checkAndPull();
      }
    });

    // 4. Online / Offline events
    window.addEventListener("online", () => {
      currentStatus = "idle";
      emit();
      this.syncNow();
    });
    window.addEventListener("offline", () => {
      currentStatus = "offline";
      emit();
    });

    // 5. Periodic polling (every 45 seconds when page is active)
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      if (document.visibilityState === "visible") {
        this.checkAndPull();
      }
    }, 45000);
  },
};

// Auto-wire save hook
Store.setOnSaveHook(() => {
  CloudSync.schedulePush();
});

