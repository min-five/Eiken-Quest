/* ============================================================
   EikenQuest — typed persistent store
   ============================================================ */
import type {
  AppState,
  Badge,
  BadgeDef,
  GrammarDone,
  GradeFilter,
  InterviewRecord,
  LevelInfo,
  QuizRecord,
  Rank,
  Settings,
  WordProgress,
} from "../types";

const STORAGE_KEY = "eikenquest.state.v1";

const DEFAULT_STATE: AppState = {
  version: 1,
  profile: {
    name: "学習者",
    grade: "3",
  },
  settings: {
    theme: "system", // light | dark | system
    accent: "indigo",
    fontSize: "normal", // small | normal | large
    motion: "full", // full | reduce
    sound: true,
    dailyGoal: 50,
    clockFont: "orbitron",
    clock24h: true,
    clockSeconds: true,
    clockBg: "default",
    clockStyle: "digital",
    clockMotion: "smooth",
    clockParticles: true,
    clockWidget: "none",
    timerSound: true,
    autoNext: true,
    showFurigana: true,
    pomo: { focus: 25, break: 5, long: 15, cycles: 4, auto: true },
  },
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastStudy: null,
  today: { date: null, xp: 0, answered: 0, correct: 0 },
  words: {},
  grammarDone: {},
  grammarRead: {},
  quizHistory: [],
  log: {},
  pomodoro: { completed: 0, focusMin: 0, log: [] },
  interview: {},
  writingSaves: {},
  dictationDone: {},
  badges: [],
  goalDays: 0,
  createdAt: Date.now(),
};

/* ---------------- State plumbing ---------------- */

export function todayKey(ts?: number): string {
  const t = ts ? new Date(ts) : new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const day = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateKeyOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return todayKey(d.getTime());
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function clone<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => clone(item)) as unknown as T;
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    Object.keys(value).forEach((key) => {
      out[key] = clone(value[key]);
    });
    return out as T;
  }
  return value;
}

// Always copy nested values so DEFAULT_STATE is never mutated and reset() starts clean.
function deepMerge(base: unknown, patch: unknown): any {
  const out: any = Array.isArray(base) ? base.map((v) => clone(v)) : isPlainObject(base) ? clone(base) : {};
  if (!isPlainObject(patch)) return patch === undefined ? out : clone(patch);
  Object.keys(patch).forEach((key) => {
    const pv = patch[key];
    if (isPlainObject(pv) && isPlainObject(out[key])) out[key] = deepMerge(out[key], pv);
    else out[key] = clone(pv);
  });
  return out;
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepMerge({}, DEFAULT_STATE) as AppState;
    const parsed: unknown = JSON.parse(raw);
    const merged = deepMerge(DEFAULT_STATE, parsed) as AppState;
    if (!merged.profile || !merged.settings) return deepMerge({}, DEFAULT_STATE) as AppState;
    return merged;
  } catch (err) {
    console.warn("[EikenQuest] state load failed, starting fresh.", err);
    return deepMerge({}, DEFAULT_STATE) as AppState;
  }
}

let state: AppState = load();

let revision = 0;
const listeners = new Set<() => void>();

function emit(): void {
  revision += 1;
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.warn(err);
    }
  });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRevision(): number {
  return revision;
}

let onSaveHook: (() => void) | null = null;

export function setOnSaveHook(fn: (() => void) | null): void {
  onSaveHook = fn;
}

function save(): void {
  try {
    state.lastModified = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("[EikenQuest] save failed", err);
  }
  emit();
  if (onSaveHook) {
    try {
      onSaveHook();
    } catch (err) {
      console.warn("[EikenQuest] onSaveHook error", err);
    }
  }
}

function rollToday(): AppState["today"] {
  const key = todayKey();
  if (!state.today || state.today.date !== key) {
    state.today = { date: key, xp: 0, answered: 0, correct: 0, goalHit: false };
  }
  return state.today;
}

/* ---------------- Theme ---------------- */

function resolvedTheme(): "light" | "dark" {
  const pref = state.settings.theme;
  if (pref === "system") {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref === "dark" ? "dark" : "light";
}

function applyTheme(): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme());
  root.setAttribute("data-accent", state.settings.accent || "indigo");
  root.setAttribute("data-fontsize", state.settings.fontSize || "normal");
  root.setAttribute("data-motion", state.settings.motion || "full");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolvedTheme() === "dark" ? "#080b14" : "#4f46e5");
}

if (typeof window !== "undefined" && window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (): void => {
    if (state.settings.theme === "system") applyTheme();
  };
  if (mq.addEventListener) mq.addEventListener("change", handler);
  else if (mq.addListener) mq.addListener(handler);
}

/* ---------------- XP / level ---------------- */

const RANKS: Rank[] = [
  { min: 1, name: "ビギナー", jp: "はじめの一歩" },
  { min: 3, name: "チャレンジャー", jp: "挑戦者" },
  { min: 6, name: "ランナー", jp: "走り出す人" },
  { min: 10, name: "ストライカー", jp: "突破する人" },
  { min: 15, name: "マスター", jp: "英語の達人" },
  { min: 22, name: "レジェンド", jp: "伝説の学習者" },
  { min: 30, name: "グランドマスター", jp: "英検の賢者" },
];

function rankFor(level: number): Rank {
  let rank = RANKS[0];
  RANKS.forEach((item) => {
    if (level >= item.min) rank = item;
  });
  return rank;
}

function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let acc = 0;
  while (level < 99) {
    const need = 100 + (level - 1) * 40;
    if (xp < acc + need) break;
    acc += need;
    level += 1;
  }
  const need = 100 + (level - 1) * 40;
  const current = Math.max(0, xp - acc);
  const rank = rankFor(level);
  return {
    level,
    current,
    need,
    pct: Math.min(100, Math.round((current / need) * 100)),
    title: rank.name,
    rankJp: rank.jp,
    totalXp: xp,
  };
}

function touchStreak(now?: number): boolean {
  const today = todayKey(now);
  if (state.lastStudy === today) return false;
  const yesterday = dateKeyOffset(-1);
  if (state.lastStudy === yesterday) state.streak = (state.streak || 0) + 1;
  else state.streak = 1;
  state.lastStudy = today;
  if (state.streak > (state.bestStreak || 0)) state.bestStreak = state.streak;
  return true;
}

interface XpOptions {
  answered?: number;
  correct?: number;
}

function addXp(amount: number, opts?: XpOptions): void {
  const n = Math.max(0, Math.round(Number(amount) || 0));
  if (!n) return;
  const t = rollToday();
  state.xp = (state.xp || 0) + n;
  t.xp += n;
  state.log[todayKey()] = (state.log[todayKey()] || 0) + n;
  if (t.xp >= (state.settings.dailyGoal || 50) && !t.goalHit) {
    t.goalHit = true;
    state.goalDays = (state.goalDays || 0) + 1;
  }
  touchStreak();
  if (opts?.answered) t.answered += opts.answered;
  if (opts?.correct) t.correct += opts.correct;
  save();
}

/* ---------------- Word SRS ---------------- */

const SRS_INTERVALS = [0, 10 * 60 * 1000, 24 * 3600 * 1000, 3 * 24 * 3600 * 1000, 7 * 24 * 3600 * 1000, 21 * 24 * 3600 * 1000];

function wordState(word: string): WordProgress {
  if (!state.words[word]) {
    state.words[word] = { lv: 0, seen: 0, correct: 0, wrong: 0, due: 0, fav: false, last: 0 };
  }
  return state.words[word];
}

function recordWord(word: string, correct: boolean, silent?: boolean): void {
  const w = wordState(word);
  w.seen += 1;
  w.last = Date.now();
  if (correct) {
    w.correct += 1;
    w.lv = Math.min(5, w.lv + 1);
    w.due = Date.now() + SRS_INTERVALS[w.lv];
  } else {
    w.wrong += 1;
    w.lv = Math.max(0, w.lv - 1);
    w.due = Date.now() + 5 * 60 * 1000;
  }
  if (!silent) save();
}

function toggleFav(word: string): boolean {
  const w = wordState(word);
  w.fav = !w.fav;
  save();
  return w.fav;
}

function wordStats(): { seen: number; learning: number; mastered: number; fav: number; total: number } {
  const vals = Object.values(state.words);
  return {
    seen: vals.filter((w) => w.seen > 0).length,
    learning: vals.filter((w) => w.seen > 0 && w.lv < 5).length,
    mastered: vals.filter((w) => w.lv >= 5).length,
    fav: vals.filter((w) => w.fav).length,
    total: vals.length,
  };
}

/* ---------------- Grammar ---------------- */

function markGrammarRead(id: string): void {
  if (!state.grammarRead[id]) {
    state.grammarRead[id] = Date.now();
    save();
  }
}

function markGrammarDone(id: string, score: number, total: number): void {
  const prev = state.grammarDone[id];
  state.grammarDone[id] = {
    done: true,
    ts: Date.now(),
    best: Math.max(prev && prev.best ? prev.best : 0, score || 0),
    total: total || 3,
  } satisfies GrammarDone;
  state.grammarRead[id] = state.grammarRead[id] || Date.now();
  save();
}

/* ---------------- Quiz history ---------------- */

type QuizRecordInput = Omit<QuizRecord, "ts" | "date"> & { grade: GradeFilter };

function recordQuiz(entry: QuizRecordInput): void {
  const t = rollToday();
  t.answered += entry.total || 0;
  t.correct += entry.score || 0;
  state.quizHistory.unshift({ ts: Date.now(), date: todayKey(), ...entry });
  state.quizHistory = state.quizHistory.slice(0, 80);
  state.log[todayKey()] = state.log[todayKey()] || 0;
  save();
}

/* ---------------- Pomodoro / focus ---------------- */

function recordFocus(minutes: number, mode: string, countPomodoro?: boolean): void {
  if (mode === "break") return;
  if (countPomodoro !== false) {
    state.pomodoro.completed = (state.pomodoro.completed || 0) + 1;
  }
  state.pomodoro.focusMin = (state.pomodoro.focusMin || 0) + Math.round(minutes);
  state.pomodoro.log.unshift({ ts: Date.now(), min: Math.round(minutes) });
  state.pomodoro.log = state.pomodoro.log.slice(0, 60);
  save();
}

/* ---------------- Interview ---------------- */

function recordInterview(grade: string, score: number, notes?: string): void {
  const rec: InterviewRecord = state.interview[grade] || { attempts: 0, scores: [], best: 0 };
  rec.attempts += 1;
  rec.scores.unshift(score);
  rec.scores = rec.scores.slice(0, 12);
  rec.best = Math.max(rec.best || 0, score);
  rec.ts = Date.now();
  if (typeof notes === "string") rec.notes = notes;
  state.interview[grade] = rec;
  save();
}

/* ---------------- Analytics helpers ---------------- */

interface DayXp {
  date: string;
  xp: number;
}

function lastNDays(n: number): DayXp[] {
  const out: DayXp[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const key = dateKeyOffset(-i);
    out.push({ date: key, xp: state.log[key] || 0 });
  }
  return out;
}

function weeklyXp(): number {
  return lastNDays(7).reduce((sum, day) => sum + day.xp, 0);
}

/* ---------------- Writing & Dictation ---------------- */

function saveWriting(id: string, text: string, wordsCount: number): void {
  if (!state.writingSaves) state.writingSaves = {};
  state.writingSaves[id] = { id, text, wordsCount, updatedAt: Date.now() };
  save();
}

function markDictationDone(id: string): void {
  if (!state.dictationDone) state.dictationDone = {};
  state.dictationDone[id] = Date.now();
  save();
}

/* ---------------- Badge engine ---------------- */

const BADGE_DEFS: BadgeDef[] = [
  { id: "first", icon: "🌱", name: "はじめの一歩", desc: "はじめて学習する", test: (s) => s.xp > 0 },
  { id: "streak3", icon: "🔥", name: "3日連続", desc: "3日間連続で学習", test: (s) => s.streak >= 3 },
  { id: "streak7", icon: "⚡", name: "1週間連続", desc: "7日間連続で学習", test: (s) => s.streak >= 7 },
  { id: "streak14", icon: "👑", name: "2週間連続", desc: "14日間連続で学習", test: (s) => s.streak >= 14 },
  { id: "streak30", icon: "🏆", name: "30日連続", desc: "30日間連続で学習", test: (s) => s.streak >= 30 },
  { id: "words50", icon: "📚", name: "単語50", desc: "50語を学習", test: () => wordStats().seen >= 50 },
  { id: "words100", icon: "📖", name: "単語100", desc: "100語を学習", test: () => wordStats().seen >= 100 },
  { id: "words300", icon: "💎", name: "語彙の達人", desc: "300語を学習", test: () => wordStats().seen >= 300 },
  { id: "mastered50", icon: "🧠", name: "記憶の達人", desc: "50語を習得", test: () => wordStats().mastered >= 50 },
  { id: "weak_master", icon: "🛡️", name: "弱点バスター", desc: "苦手な単語を克服する", test: (s) => Object.values(s.words).some((w) => w.wrong > 0 && w.lv >= 4) },
  { id: "grammar10", icon: "✎", name: "文法マニア", desc: "文法10テーマを完了", test: (s) => Object.keys(s.grammarDone).length >= 10 },
  { id: "quiz10", icon: "🎯", name: "クイズ中毒", desc: "クイズを10回完了", test: (s) => s.quizHistory.length >= 10 },
  { id: "perfect", icon: "💯", name: "パーフェクト", desc: "クイズで全問正解", test: (s) => s.quizHistory.some((q) => q.total > 0 && q.score === q.total) },
  { id: "speed_combo", icon: "⚡", name: "疾風迅雷", desc: "クイズでコンボ8を達成", test: (s) => s.quizHistory.some((q) => (q.maxCombo || 0) >= 8) },
  { id: "writing1", icon: "✍️", name: "表現者への道", desc: "英作文を1篇作成・保存", test: (s) => Object.keys(s.writingSaves || {}).length >= 1 },
  { id: "writing5", icon: "📜", name: "エッセイスト", desc: "英作文を5篇作成", test: (s) => Object.keys(s.writingSaves || {}).length >= 5 },
  { id: "dictation1", icon: "🎧", name: "リスニング開眼", desc: "ディクテーションを1問クリア", test: (s) => Object.keys(s.dictationDone || {}).length >= 1 },
  { id: "dictation10", icon: "👂", name: "絶対音感", desc: "ディクテーションを10問クリア", test: (s) => Object.keys(s.dictationDone || {}).length >= 10 },
  { id: "focus5", icon: "⏳", name: "集中の芽", desc: "ポモドーロ5回完了", test: (s) => s.pomodoro.completed >= 5 },
  { id: "focus25", icon: "🧘", name: "集中の達人", desc: "ポモドーロ25回完了", test: (s) => s.pomodoro.completed >= 25 },
  { id: "interview", icon: "🎤", name: "面接デビュー", desc: "面接練習を1回完了", test: (s) => Object.keys(s.interview).length > 0 },
  { id: "level5", icon: "⭐", name: "レベル5", desc: "レベル5に到達", test: (s) => levelFromXp(s.xp).level >= 5 },
  { id: "level10", icon: "🌟", name: "レベル10", desc: "レベル10に到達", test: (s) => levelFromXp(s.xp).level >= 10 },
  { id: "goal7", icon: "🎖️", name: "目標達成7回", desc: "1日の目標を7回達成", test: () => state.goalDays >= 7 },
];

state.goalDays = state.goalDays || 0;

function checkBadges(): BadgeDef[] {
  const earned = new Set(state.badges || []);
  const newly: BadgeDef[] = [];
  BADGE_DEFS.forEach((badge) => {
    if (!earned.has(badge.id)) {
      let ok = false;
      try {
        ok = badge.test(state);
      } catch {
        ok = false;
      }
      if (ok) {
        earned.add(badge.id);
        newly.push(badge);
      }
    }
  });
  if (newly.length) {
    state.badges = Array.from(earned);
    save();
  }
  return newly;
}

function badgeList(): Badge[] {
  const earned = new Set(state.badges || []);
  return BADGE_DEFS.map(({ test: _test, ...badge }) => ({ ...badge, earned: earned.has(badge.id) }));
}

/* ---------------- Public API ---------------- */

export const Store = {
  get state(): AppState {
    return state;
  },
  todayKey,
  dateKeyOffset,
  resolvedTheme,
  applyTheme,
  save,
  subscribe,
  levelFromXp,
  rankFor,
  addXp,
  touchStreak,
  recordWord,
  wordState,
  wordStats,
  toggleFav,
  markGrammarRead,
  markGrammarDone,
  recordQuiz,
  recordFocus,
  recordInterview,
  saveWriting,
  markDictationDone,
  lastNDays,
  weeklyXp,
  checkBadges,
  badgeList,
  rollToday,
  setGrade(grade: GradeFilter): void {
    state.profile.grade = grade;
    save();
  },
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    state.settings[key] = value;
    if (key === "theme" || key === "accent" || key === "fontSize" || key === "motion") applyTheme();
    save();
  },
  setProfile(patch: Partial<AppState["profile"]>): void {
    Object.assign(state.profile, patch);
    save();
  },
  todayXp(): number {
    return rollToday().xp;
  },
  reset(keepSettings?: boolean): void {
    const settings = clone(keepSettings ? state.settings : DEFAULT_STATE.settings);
    state = clone(DEFAULT_STATE);
    state.settings = settings;
    state.createdAt = Date.now();
    save();
    applyTheme();
  },
  exportJSON(): string {
    return JSON.stringify({ app: "EikenQuest", exportedAt: new Date().toISOString(), state }, null, 2);
  },
  importJSON(text: string): void {
    const parsed = JSON.parse(text) as { state?: unknown } | unknown;
    const incoming = parsed && typeof parsed === "object" && "state" in parsed ? parsed.state : parsed;
    if (!incoming || typeof incoming !== "object" || !("profile" in incoming)) {
      throw new Error("形式が正しくありません");
    }
    state = deepMerge(DEFAULT_STATE, incoming) as AppState;
    save();
    applyTheme();
  },
  importDirect(incoming: AppState): void {
    if (!incoming || typeof incoming !== "object" || !("profile" in incoming)) return;
    state = incoming;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("[EikenQuest] importDirect save error", err);
    }
    emit();
    applyTheme();
  },
  setOnSaveHook,
};

applyTheme();
rollToday();

export { DEFAULT_STATE, STORAGE_KEY };
