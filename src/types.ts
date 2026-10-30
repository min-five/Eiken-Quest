/* ============================================================
   Shared domain types
   ============================================================ */

export type GradeId = "5" | "4" | "3" | "pre2" | "2" | "pre1" | "1";
export type GradeFilter = GradeId | "all";

export type ThemePref = "light" | "dark" | "system";
export type AccentId = "indigo" | "teal" | "rose" | "violet" | "amber" | "blue";
export type FontSize = "small" | "normal" | "large";
export type MotionPref = "full" | "reduce";
export type ClockFontId =
  | "orbitron"
  | "tech"
  | "rounded"
  | "serif"
  | "hand"
  | "pixel"
  | "manrope";

export type ClockBgId =
  | "default"
  | "aurora"
  | "starry"
  | "sunset"
  | "cyber"
  | "cafe"
  | "oled"
  | "mint";

export type ClockStyleId = "digital" | "analog" | "flip";

export type ClockMotionId = "smooth" | "tick" | "pulse" | "float";

export type ClockWidgetId = "none" | "timer" | "stopwatch" | "pomodoro";

export type QuizType = "vocab" | "grammar" | "reading" | "listening" | "mock" | "mixed";

/* ---------------- Content ---------------- */

export interface GradeInfo {
  id: GradeId;
  name: string;
  full: string;
  cefr: string;
  color: string;
  stage: string;
  target: string;
  desc: string;
  pass: string;
  words: string;
  time: string;
}

export interface VocabSeed {
  w: string;
  m: string;
  p: string;
  e: string;
  ej: string;
}

export interface VocabWord extends VocabSeed {
  grade: GradeId;
}

export interface GrammarSection {
  h: string;
  b: string;
}

export interface GrammarExample {
  en: string;
  ja: string;
}

export interface QuizItem {
  q: string;
  choices: string[];
  a: number;
  exp: string;
}

export interface GrammarTopicBase {
  id: string;
  grade: GradeId;
  genre: string;
  title: string;
  summary: string;
  sections: GrammarSection[];
  examples: GrammarExample[];
  tip: string;
  quiz: QuizItem[];
}

export interface GrammarTopic extends GrammarTopicBase {
  genreName: string;
  genreColor: string;
}

export interface GrammarGenre {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
}

export interface ReadingPassage {
  id: string;
  grade: GradeId;
  title: string;
  level: string;
  text: string[];
  questions: QuizItem[];
}

export interface InterviewQA {
  q: string;
  model: string;
  hint: string;
}

export interface InterviewOpinion {
  topic: string;
  points: string[];
  sample: string;
}

export interface SpeechTopic {
  topic: string;
  points: string[];
}

export interface InterviewSet {
  grade: GradeId;
  hasReading: boolean;
  intro: string;
  passage?: { title: string; text: string } | null;
  qa: InterviewQA[];
  opinion?: InterviewOpinion | null;
  speechTopics?: SpeechTopic[];
  tips: string[];
}

export interface ExamInfo {
  first: string;
  second: string;
  pass: string;
  writing: string;
}

/* ---------------- Quiz ---------------- */

export interface QuizQuestion {
  /** Authored HTML (already escaped at build time). */
  question: string;
  rawQuestion?: string;
  choices: string[];
  /** Index of the correct choice. */
  a: number;
  /** Authored HTML explanation. */
  exp: string;
  word?: string;
  grade?: GradeId;
  kind: "vocab" | "grammar" | "reading" | "listening";
  speakWord?: string;
  topicId?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  pct: number;
  xp: number;
  wrongAnswers: { q: string; a: string; yours: string }[];
  type: QuizType;
}

export interface QuizConfig {
  title: string;
  subtitle?: string;
  questions: QuizQuestion[];
  grade: GradeFilter;
  type: QuizType;
  xpPerQuestion?: number;
  completionBonus?: number;
  contextHTML?: string;
  backLabel?: string;
  timeLimit?: number;
  onExit?: () => void;
  onComplete?: (result: QuizResult) => void;
}

/* ---------------- Persisted state ---------------- */

export interface PomodoroSettings {
  focus: number;
  break: number;
  long: number;
  cycles: number;
  auto: boolean;
}

export interface Settings {
  theme: ThemePref;
  accent: AccentId;
  fontSize: FontSize;
  motion: MotionPref;
  sound: boolean;
  dailyGoal: number;
  clockFont: ClockFontId;
  clock24h: boolean;
  clockSeconds: boolean;
  clockBg?: ClockBgId;
  clockStyle?: ClockStyleId;
  clockMotion?: ClockMotionId;
  clockParticles?: boolean;
  clockWidget?: ClockWidgetId;
  timerSound: boolean;
  autoNext: boolean;
  showFurigana: boolean;
  pomo: PomodoroSettings;
  syncKey?: string;
  autoSync?: boolean;
  lastSyncedAt?: string;
  deviceName?: string;
  keepAwake?: boolean;
  ecoMode?: boolean;
}

export interface Profile {
  name: string;
  grade: GradeFilter;
}

export interface TodayStats {
  date: string | null;
  xp: number;
  answered: number;
  correct: number;
  goalHit?: boolean;
}

export interface WordProgress {
  lv: number;
  seen: number;
  correct: number;
  wrong: number;
  due: number;
  fav: boolean;
  last: number;
}

export interface GrammarDone {
  done: boolean;
  ts: number;
  best: number;
  total: number;
}

export interface QuizRecord {
  ts: number;
  date: string;
  type: QuizType;
  grade: GradeFilter;
  title: string;
  score: number;
  total: number;
  xp: number;
  duration: number;
  maxCombo: number;
}

export interface InterviewRecord {
  attempts: number;
  scores: number[];
  best: number;
  ts?: number;
  notes?: string;
}

export interface PomodoroLogEntry {
  ts: number;
  min: number;
}

export interface PomodoroProgress {
  completed: number;
  focusMin: number;
  log: PomodoroLogEntry[];
}

export interface WritingEntry {
  id: string;
  grade: GradeId;
  title: string;
  topic: string;
  minWords: number;
  maxWords: number;
  modelAnswer: string;
  translation: string;
  tips: string[];
  usefulPhrases: { category: string; phrases: string[] }[];
}

export interface WritingSave {
  id: string;
  text: string;
  wordsCount: number;
  updatedAt: number;
}

export interface DictationItem {
  id: string;
  grade: GradeId;
  en: string;
  ja: string;
  hint?: string;
  category?: string;
}

export interface AppState {
  version: number;
  profile: Profile;
  settings: Settings;
  xp: number;
  streak: number;
  bestStreak: number;
  lastStudy: string | null;
  today: TodayStats;
  words: Record<string, WordProgress>;
  grammarDone: Record<string, GrammarDone>;
  grammarRead: Record<string, number>;
  quizHistory: QuizRecord[];
  log: Record<string, number>;
  pomodoro: PomodoroProgress;
  interview: Record<string, InterviewRecord>;
  writingSaves: Record<string, WritingSave>;
  dictationDone: Record<string, number>;
  badges: string[];
  goalDays: number;
  createdAt: number;
  lastModified?: number;
}

/* ---------------- Store helpers ---------------- */

export interface LevelInfo {
  level: number;
  current: number;
  need: number;
  pct: number;
  title: string;
  rankJp: string;
  totalXp: number;
}

export interface Rank {
  min: number;
  name: string;
  jp: string;
}

export interface BadgeDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  test: (state: AppState) => boolean;
}

export interface Badge extends Omit<BadgeDef, "test"> {
  earned: boolean;
}

/* ---------------- UI ---------------- */

export type ToastType = "success" | "error" | "info" | "xp";

export interface ToastOptions {
  type?: ToastType;
  icon?: string;
  duration?: number;
}

export interface ToastItem {
  id: number;
  message: string;
  type?: ToastType;
  icon?: string;
  duration: number;
}
