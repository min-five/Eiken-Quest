import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { ClockBgId, ClockFontId, ClockMotionId, ClockStyleId, ClockWidgetId, PomodoroSettings } from "../types";
import { clockFontFamily } from "../lib/fonts";
import { useStore } from "../lib/useStore";
import { Store } from "../lib/store";
import { fmtDate, fmtDuration, fmtMsParts, plainMs } from "../lib/format";
import { confetti, sfx, speak, stopSpeak, toast } from "../lib/ui";
import { confirmDialog } from "../components/ConfirmProvider";
import { Icon } from "../components/Icon";

type Tab = "clock" | "stopwatch" | "timer" | "pomodoro";
type PomoMode = "focus" | "break" | "long";

interface Lap {
  n: number;
  total: number;
  split: number;
}

const FONTS: { id: ClockFontId; name: string; note: string }[] = [
  { id: "orbitron", name: "Orbitron", note: "デジタル" },
  { id: "tech", name: "Share Tech", note: "モノスペース" },
  { id: "rounded", name: "丸ゴシック", note: "やわらか" },
  { id: "serif", name: "明朝", note: "上品" },
  { id: "hand", name: "手書き", note: "あたたかい" },
  { id: "pixel", name: "ドット", note: "レトロ" },
  { id: "manrope", name: "Manrope", note: "モダン" },
];

const CLOCK_BGS: { id: ClockBgId; name: string; preview: string; desc: string }[] = [
  { id: "default", name: "デフォルト", preview: "linear-gradient(135deg, #6366f1, #14b8a6)", desc: "標準テーマ" },
  { id: "aurora", name: "オーロラ", preview: "linear-gradient(135deg, #10b981, #06b6d4, #6366f1)", desc: "流れる光" },
  { id: "starry", name: "星空コズミック", preview: "linear-gradient(135deg, #090a14, #4f46e5, #030409)", desc: "静寂の宇宙" },
  { id: "sunset", name: "夕暮れ", preview: "linear-gradient(135deg, #e11d48, #d97706, #1b0a24)", desc: "温かな黄昏" },
  { id: "cyber", name: "サイバーネオン", preview: "linear-gradient(135deg, #00f5ff, #ec4899, #05050e)", desc: "発光グリッド" },
  { id: "cafe", name: "カフェウッド", preview: "linear-gradient(135deg, #f59e0b, #78350f, #1c1511)", desc: "落ち着く木目" },
  { id: "oled", name: "OLEDブラック", preview: "linear-gradient(135deg, #1e293b, #000000)", desc: "究極の漆黒" },
  { id: "mint", name: "ミントスカイ", preview: "linear-gradient(135deg, #34d399, #0ea5e9, #061e19)", desc: "爽やかな緑" },
];

const CLOCK_STYLES: { id: ClockStyleId; name: string; icon: string }[] = [
  { id: "digital", name: "デジタル", icon: "🔢" },
  { id: "analog", name: "アナログ", icon: "⏱" },
  { id: "flip", name: "フリップ", icon: "🏷" },
];

const CLOCK_MOTIONS: { id: ClockMotionId; name: string; desc: string }[] = [
  { id: "smooth", name: "スムーズ", desc: "滑らかな連続動作" },
  { id: "tick", name: "ステップ", desc: "カチッと1秒動作" },
  { id: "pulse", name: "パルス", desc: "優しく呼吸する光" },
  { id: "float", name: "フロート", desc: "ふわふわ浮遊" },
];

const CLOCK_WIDGETS: { id: ClockWidgetId; name: string; icon: string; desc: string }[] = [
  { id: "none", name: "なし", icon: "✖", desc: "時計のみ" },
  { id: "timer", name: "タイマー", icon: "⏳", desc: "残り時間と操作" },
  { id: "stopwatch", name: "ストップウォッチ", icon: "⏱", desc: "経過時間と操作" },
  { id: "pomodoro", name: "ポモドーロ", icon: "🍅", desc: "集中・休憩サイクル" },
];

const TIMER_PAGE_TITLE = "EikenQuest — 時計・集中タイマー";
const REPEAT_OPTIONS = [1, 2, 3, 5, 10, 0];
const TIMER_PRESETS = [1, 3, 5, 10, 15, 25, 45, 60];
const TABS: { id: Tab; label: string }[] = [
  { id: "clock", label: "◷ 時計" },
  { id: "stopwatch", label: "⏱ ストップウォッチ" },
  { id: "timer", label: "⏳ タイマー" },
  { id: "pomodoro", label: "🍅 ポモドーロ" },
];

/* ---------------- Module-level session state ---------------- */

const ui = { tab: "clock" as Tab };

const sw = { running: false, elapsed: 0, startedAt: 0, laps: [] as Lap[] };

const tm = {
  running: false,
  total: 25 * 60,
  remaining: 25 * 60,
  endAt: 0,
  done: 0,
  target: 1,
  finished: false,
  allDone: false,
  note: null as string | null,
  nextTimeout: 0,
};

const pomo = {
  running: false,
  total: 0,
  remaining: 0,
  endAt: 0,
  completed: 0,
  mode: "focus" as PomoMode,
  initialized: false,
};

function pomoSettings(): PomodoroSettings {
  const p = Store.state.settings.pomo || { focus: 25, break: 5, long: 15, cycles: 4, auto: true };
  return {
    focus: p.focus || 25,
    break: p.break || 5,
    long: p.long || 15,
    cycles: p.cycles || 4,
    auto: p.auto !== false,
  };
}

function pomoDuration(mode: PomoMode, c: PomodoroSettings): number {
  return (mode === "focus" ? c.focus : mode === "long" ? c.long : c.break) * 60;
}

function swElapsedNow(): number {
  return sw.elapsed + (sw.running ? performance.now() - sw.startedAt : 0);
}

function pauseStopwatch(): void {
  if (sw.running) {
    sw.elapsed = swElapsedNow();
    sw.running = false;
  }
}

function pauseTimer(): void {
  if (tm.running && tm.endAt) tm.remaining = Math.max(0, (tm.endAt - Date.now()) / 1000);
  tm.running = false;
  if (tm.nextTimeout) {
    window.clearTimeout(tm.nextTimeout);
    tm.nextTimeout = 0;
  }
}

function pausePomodoro(): void {
  if (pomo.running && pomo.endAt) pomo.remaining = Math.max(0, (pomo.endAt - Date.now()) / 1000);
  pomo.running = false;
}

/* ---------------- Clock Faces ---------------- */

function DigitalClockFace({ clock24h, clockSeconds }: { clock24h: boolean; clockSeconds: boolean }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  let h: number | string = now.getHours();
  let ampm = "";
  if (clock24h) {
    h = String(h).padStart(2, "0");
  } else {
    ampm = Number(h) < 12 ? "AM" : "PM";
    h = Number(h) % 12 || 12;
  }
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return (
    <>
      <div className="digital-clock" id="digitalClock" aria-live="off">
        <span>{h}</span>
        <span className="colon">:</span>
        <span>{mm}</span>
        {clockSeconds ? (
          <>
            <span className="colon">:</span>
            <span className="sec">{ss}</span>
          </>
        ) : null}
        {ampm ? <span className="ampm">{ampm}</span> : null}
      </div>
      <div className="clock-date" id="clockDate">
        {fmtDate(now)}
      </div>
    </>
  );
}

function AnalogClockFace({
  motion,
  clockSeconds,
}: {
  motion: ClockMotionId;
  clockSeconds: boolean;
}) {
  const [now, setNow] = useState(() => new Date());
  const rafRef = useRef(0);

  useEffect(() => {
    if (motion === "smooth") {
      let active = true;
      const update = () => {
        if (!active) return;
        setNow(new Date());
        rafRef.current = window.requestAnimationFrame(update);
      };
      rafRef.current = window.requestAnimationFrame(update);
      return () => {
        active = false;
        window.cancelAnimationFrame(rafRef.current);
      };
    } else {
      const id = window.setInterval(() => setNow(new Date()), 250);
      return () => window.clearInterval(id);
    }
  }, [motion]);

  const sec = now.getSeconds();
  const ms = now.getMilliseconds();
  const min = now.getMinutes();
  const hr = now.getHours() % 12;

  const secDeg = motion === "smooth" ? (sec + ms / 1000) * 6 : sec * 6;
  const minDeg = (min + sec / 60) * 6;
  const hrDeg = (hr + min / 60 + sec / 3600) * 30;

  return (
    <div className="analog-clock-wrap">
      <div className="analog-clock">
        <div className="analog-clock__face">
          <span className="analog-clock__num" style={{ top: "14%", left: "50%" }}>12</span>
          <span className="analog-clock__num" style={{ top: "50%", left: "86%" }}>3</span>
          <span className="analog-clock__num" style={{ top: "86%", left: "50%" }}>6</span>
          <span className="analog-clock__num" style={{ top: "50%", left: "14%" }}>9</span>

          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`analog-clock__mark ${i % 3 === 0 ? "analog-clock__mark--major" : ""}`}
              style={{ transform: `rotate(${i * 30}deg) translateY(-100%)` }}
            />
          ))}

          <div
            className="analog-clock__hand analog-clock__hand--hour"
            style={{ transform: `rotate(${hrDeg}deg)` }}
          />
          <div
            className="analog-clock__hand analog-clock__hand--minute"
            style={{ transform: `rotate(${minDeg}deg)` }}
          />
          {clockSeconds ? (
            <div
              className={`analog-clock__hand analog-clock__hand--second ${motion === "tick" ? "is-tick" : ""}`}
              style={{ transform: `rotate(${secDeg}deg)` }}
            />
          ) : null}
          <div className="analog-clock__pivot" />
        </div>
      </div>
      <div className="clock-date" id="clockDate" style={{ marginTop: 18 }}>
        {fmtDate(now)}
      </div>
    </div>
  );
}

function FlipClockFace({
  clock24h,
  clockSeconds,
}: {
  clock24h: boolean;
  clockSeconds: boolean;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  let h = now.getHours();
  let ampm = "";
  if (clock24h) {
    h = Number(String(h).padStart(2, "0"));
  } else {
    ampm = h < 12 ? "AM" : "PM";
    h = h % 12 || 12;
  }
  const hStr = String(h).padStart(2, "0");
  const mStr = String(now.getMinutes()).padStart(2, "0");
  const sStr = String(now.getSeconds()).padStart(2, "0");

  return (
    <>
      <div className="flip-clock" id="flipClock" aria-live="off">
        <div className="flip-group">
          <div className="flip-cards">
            <span className="flip-card">{hStr[0]}</span>
            <span className="flip-card">{hStr[1]}</span>
          </div>
          <span className="flip-group__label">{ampm ? `${ampm} 時間` : "時間"}</span>
        </div>
        <span className="flip-colon">:</span>
        <div className="flip-group">
          <div className="flip-cards">
            <span className="flip-card">{mStr[0]}</span>
            <span className="flip-card">{mStr[1]}</span>
          </div>
          <span className="flip-group__label">分</span>
        </div>
        {clockSeconds ? (
          <>
            <span className="flip-colon">:</span>
            <div className="flip-group">
              <div className="flip-cards">
                <span className="flip-card" style={{ color: "var(--clock-accent, var(--accent))" }}>{sStr[0]}</span>
                <span className="flip-card" style={{ color: "var(--clock-accent, var(--accent))" }}>{sStr[1]}</span>
              </div>
              <span className="flip-group__label">秒</span>
            </div>
          </>
        ) : null}
      </div>
      <div className="clock-date" id="clockDate" style={{ marginTop: 18 }}>
        {fmtDate(now)}
      </div>
    </>
  );
}

function ClockParticlesCanvas({ bg }: { bg: ClockBgId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = canvas.offsetWidth || 300);
    let height = (canvas.height = canvas.offsetHeight || 300);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    const count = bg === "starry" ? 50 : bg === "cyber" ? 30 : bg === "aurora" ? 35 : 22;
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * (bg === "cyber" ? 0.7 : 0.3),
      speedY: bg === "aurora" ? -(Math.random() * 0.4 + 0.1) : (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.03;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (bg === "aurora") {
          ctx.fillStyle = `rgba(45, 212, 191, ${currentOpacity})`;
        } else if (bg === "cyber") {
          ctx.fillStyle = `rgba(0, 245, 255, ${currentOpacity})`;
        } else if (bg === "sunset") {
          ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        }
        ctx.fill();
      });

      animId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(animId);
    };
  }, [bg]);

  return <canvas ref={canvasRef} className="clock-particles-canvas" aria-hidden="true" />;
}

function ClockDisplay({
  style,
  motion,
  clock24h,
  clockSeconds,
}: {
  style: ClockStyleId;
  motion: ClockMotionId;
  clock24h: boolean;
  clockSeconds: boolean;
}) {
  switch (style) {
    case "analog":
      return <AnalogClockFace motion={motion} clockSeconds={clockSeconds} />;
    case "flip":
      return <FlipClockFace clock24h={clock24h} clockSeconds={clockSeconds} />;
    case "digital":
    default:
      return <DigitalClockFace clock24h={clock24h} clockSeconds={clockSeconds} />;
  }
}

/* ---------------- Stopwatch ---------------- */

function StopwatchDisplay({ running }: { running: boolean }) {
  const [ms, setMs] = useState(() => swElapsedNow());

  useEffect(() => {
    if (!running) {
      setMs(swElapsedNow());
      return;
    }
    let raf = 0;
    const paint = () => {
      setMs(swElapsedNow());
      raf = window.requestAnimationFrame(paint);
    };
    paint();
    return () => window.cancelAnimationFrame(raf);
  }, [running]);

  const { base, centis } = fmtMsParts(ms);
  return (
    <div className="sw-display" id="swDisplay">
      {base}
      <span className="ms">.{centis}</span>
    </div>
  );
}

/* ---------------- Page ---------------- */

export function ClockPage() {
  const state = useStore();
  const settings = state.settings;
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const [tab, setTabState] = useState<Tab>(ui.tab);
  const [swOn, setSwOn] = useState(sw.running);
  const [tmOn, setTmOn] = useState(tm.running);
  const [pomoOn, setPomoOn] = useState(pomo.running);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const isNativeFsRef = useRef(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const clockBg = settings.clockBg || "default";
  const clockStyle = settings.clockStyle || "digital";
  const clockMotion = settings.clockMotion || "smooth";
  const clockParticles = settings.clockParticles !== false;
  const clockWidget = settings.clockWidget || "none";
  const fontClass = `clock-font--${settings.clockFont || "orbitron"}`;
  const bgClass = `clock-bg--${clockBg}`;
  const motionClass = `clock-motion--${clockMotion}`;

  const hasSavedTimer = tm.total > 0 && tm.remaining > 0 && (tm.remaining < tm.total || tm.done > 0);

  /* Timer inputs mirror the legacy inputs, restoring a paused session. */
  const [parts, setParts] = useState(() => {
    const total = hasSavedTimer ? Math.round(tm.total) : 25 * 60;
    return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
  });
  const [repeat, setRepeat] = useState<number>(() => (hasSavedTimer ? tm.target : 1));
  const [restored, setRestored] = useState(hasSavedTimer);
  const [preset, setPreset] = useState<number | null>(() => (hasSavedTimer ? null : 25));
  const [allDone, setAllDone] = useState(tm.allDone);

  /* Entering the timer tab restores a paused session, as the legacy render did. */
  useEffect(() => {
    if (tab !== "timer") return;
    setRestored(tm.total > 0 && tm.remaining > 0 && (tm.remaining < tm.total || tm.done > 0));
  }, [tab]);

  /* Pomodoro settings inputs */
  const [pc, setPc] = useState<PomodoroSettings>(pomoSettings);

  const partsSeconds = () => {
    const h = Math.max(0, Math.min(23, Number(parts.h) || 0));
    const m = Math.max(0, Math.min(59, Number(parts.m) || 0));
    const s = Math.max(0, Math.min(59, Number(parts.s) || 0));
    return h * 3600 + m * 60 + s;
  };

  const setInputs = (total: number) => {
    setParts({
      h: Math.floor(total / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
    });
  };

  /* ---------------- Stopwatch actions ---------------- */

  const toggleStopwatch = () => {
    if (sw.running) {
      sw.elapsed = swElapsedNow();
      sw.running = false;
      sfx("click");
    } else {
      sw.startedAt = performance.now();
      sw.running = true;
      sfx("click");
    }
    setSwOn(sw.running);
    bump();
  };

  const addLap = () => {
    if (!sw.running) return;
    const total = swElapsedNow();
    const prev = sw.laps.length ? sw.laps[sw.laps.length - 1].total : 0;
    sw.laps.push({ n: sw.laps.length + 1, total, split: total - prev });
    sfx("tick");
    bump();
  };

  const resetStopwatch = () => {
    sw.running = false;
    sw.elapsed = 0;
    sw.laps = [];
    setSwOn(false);
    sfx("click");
    bump();
  };

  /* ---------------- Timer actions ---------------- */

  const finishTimer = useCallback(() => {
    tm.running = false;
    tm.remaining = 0;
    tm.done += 1;
    tm.finished = true;
    tm.note = null;
    setTmOn(false);

    sfx("alarm");
    const minutes = Math.round(tm.total / 60);
    if (tm.total >= 60) {
      const xp = Math.min(50, Math.max(2, minutes));
      Store.recordFocus(minutes, "focus", false);
      Store.addXp(xp);
      Store.checkBadges();
      toast(`タイマー完了！ ${minutes}分の集中 +${xp} XP`, { type: "xp", duration: 4200 });
    } else {
      toast("タイマー完了！", "success");
    }
    if (tm.total >= 60) confetti({ count: 50 });

    const target = tm.target;
    const auto = Store.state.settings.autoNext !== false;
    if (target === 0 || tm.done < target) {
      tm.note = `${target === 0 ? "∞" : target} セット中 · ${tm.done} 完了`;
      if (auto) {
        tm.nextTimeout = window.setTimeout(() => {
          tm.nextTimeout = 0;
          tm.remaining = tm.total;
          tm.endAt = Date.now() + tm.total * 1000;
          tm.running = true;
          tm.finished = false;
          tm.note = null;
          setTmOn(true);
          sfx("click");
          bump();
        }, 2200);
      }
    } else {
      tm.note = `全 ${tm.done} セット完了`;
      tm.allDone = true;
      setAllDone(true);
      window.setTimeout(() => {
        tm.allDone = false;
        tm.finished = false;
        setAllDone(false);
        tm.done = 0;
        tm.note = null;
        bump();
      }, 2600);
    }
    bump();
  }, []);

  const timerTick = useCallback(() => {
    const msLeft = tm.endAt - Date.now();
    tm.remaining = Math.max(0, msLeft / 1000);
    if (msLeft <= 0) {
      finishTimer();
      return;
    }
    bump();
  }, [finishTimer]);

  const startTimer = () => {
    setRestored(false);
    if (tm.remaining <= 0) {
      const sec = partsSeconds();
      if (!sec) {
        toast("時間を設定してください", "error");
        return;
      }
      tm.total = sec;
      tm.remaining = sec;
      tm.done = 0;
      tm.target = repeat;
    }
    if (tm.remaining <= 0) return;
    tm.endAt = Date.now() + tm.remaining * 1000;
    tm.running = true;
    tm.finished = false;
    tm.note = null;
    setTmOn(true);
    sfx("click");
    bump();
  };

  const pauseTimerNow = () => {
    setRestored(false);
    pauseTimer();
    tm.note = null;
    setTmOn(false);
    sfx("click");
    bump();
  };

  const resetTimer = () => {
    setRestored(false);
    if (tm.nextTimeout) {
      window.clearTimeout(tm.nextTimeout);
      tm.nextTimeout = 0;
    }
    tm.running = false;
    tm.done = 0;
    tm.remaining = partsSeconds();
    tm.total = tm.remaining;
    tm.finished = false;
    tm.allDone = false;
    tm.note = null;
    setAllDone(false);
    setTmOn(false);
    sfx("click");
    bump();
  };

  const plusMinute = () => {
    setRestored(false);
    if (tm.running) {
      tm.endAt += 60000;
      tm.total += 60;
      sfx("click");
      toast("+1分", "info", 1200);
      bump();
    } else {
      const total = partsSeconds() + 60;
      setInputs(total);
      tm.total = total;
      tm.remaining = total;
      tm.finished = false;
      bump();
    }
  };

  const updatePart = (key: "h" | "m" | "s", raw: string) => {
    if (tm.running) return;
    setRestored(false);
    const next = { ...parts, [key]: Number(raw) || 0 };
    setParts(next);
    const sec =
      Math.max(0, Math.min(23, next.h)) * 3600 +
      Math.max(0, Math.min(59, next.m)) * 60 +
      Math.max(0, Math.min(59, next.s));
    tm.total = sec;
    tm.remaining = sec;
    tm.finished = false;
    tm.note = null;
    setPreset(null);
    bump();
  };

  const applyPreset = (min: number) => {
    if (tm.running) {
      toast("計測中は変更できません。停止してから設定してください。", "info");
      return;
    }
    setRestored(false);
    setInputs(min * 60);
    tm.total = min * 60;
    tm.remaining = tm.total;
    tm.done = 0;
    tm.finished = false;
    tm.note = null;
    setPreset(min);
    sfx("click");
    bump();
  };

  /* ---------------- Pomodoro actions ---------------- */

  const commitPomoCfg = (next: PomodoroSettings) => {
    setPc(next);
    Store.setSetting("pomo", next);
    if (!pomo.running) {
      pomo.total = pomoDuration(pomo.mode, next);
      pomo.remaining = pomo.total;
    }
    bump();
  };

  const startPomodoro = useCallback(() => {
    const c = pomoSettings();
    if (!pomo.running) {
      if (!pomo.remaining || pomo.remaining <= 0) {
        pomo.total = pomoDuration(pomo.mode, c);
        pomo.remaining = pomo.total;
      }
      pomo.endAt = Date.now() + pomo.remaining * 1000;
      pomo.running = true;
    }
    sfx("click");
    setPomoOn(true);
    bump();
  }, []);

  const setPomoMode = useCallback(
    (mode: PomoMode, keepRunning: boolean) => {
      const c = pomoSettings();
      pomo.mode = mode;
      pomo.total = pomoDuration(mode, c);
      pomo.remaining = pomo.total;
      pomo.endAt = Date.now() + pomo.total * 1000;
      pomo.running = false;
      setPomoOn(false);
      if (keepRunning) startPomodoro();
      bump();
    },
    [startPomodoro],
  );

  const finishPomodoro = useCallback(() => {
    pomo.running = false;
    setPomoOn(false);
    const c = pomoSettings();
    if (pomo.mode === "focus") {
      pomo.completed += 1;
      Store.recordFocus(c.focus, "focus", true);
      const xp = Math.min(40, Math.max(5, Math.round(c.focus / 5) * 2));
      Store.addXp(xp);
      Store.checkBadges();
      sfx("alarm");
      confetti({ count: 70 });
      toast(`集中セッション完了！ +${xp} XP`, { type: "xp", duration: 4200 });
      const nextMode: PomoMode = pomo.completed % c.cycles === 0 ? "long" : "break";
      setPomoMode(nextMode, c.auto);
    } else {
      sfx("alarm");
      toast("休憩終了。次のセッションを始めましょう。", "success");
      setPomoMode("focus", c.auto);
    }
    bump();
  }, [setPomoMode]);

  const pomoTick = useCallback(() => {
    const rem = Math.max(0, (pomo.endAt - Date.now()) / 1000);
    if (rem <= 0) {
      finishPomodoro();
      return;
    }
    pomo.remaining = rem;
    bump();
  }, [finishPomodoro]);

  const pausePomodoroNow = () => {
    pausePomodoro();
    setPomoOn(false);
    sfx("click");
    bump();
  };

  const skipPomodoro = () => {
    pausePomodoro();
    const c = pomoSettings();
    if (pomo.mode === "focus") {
      setPomoMode(pomo.completed % c.cycles === c.cycles - 1 ? "long" : "break", false);
    } else {
      setPomoMode("focus", false);
    }
    sfx("click");
  };

  const resetPomodoro = () => {
    pausePomodoro();
    setPomoOn(false);
    pomo.completed = 0;
    pomo.mode = "focus";
    const c = pomoSettings();
    pomo.total = c.focus * 60;
    pomo.remaining = pomo.total;
    sfx("click");
    bump();
  };

  /* ---------------- Effects ---------------- */

  /* Timer interval */
  useEffect(() => {
    if (!tmOn) return;
    const id = window.setInterval(timerTick, 200);
    return () => window.clearInterval(id);
  }, [tmOn, timerTick]);

  /* Pomodoro interval */
  useEffect(() => {
    if (!pomoOn) return;
    const id = window.setInterval(pomoTick, 200);
    return () => window.clearInterval(id);
  }, [pomoOn, pomoTick]);

  /* Timer tab title */
  useEffect(() => {
    if (!tmOn) return;
    const id = window.setInterval(() => {
      const sec = Math.max(0, Math.ceil((tm.endAt - Date.now()) / 1000));
      document.title = `⏳ ${fmtDuration(sec)} — EikenQuest`;
    }, 1000);
    return () => {
      window.clearInterval(id);
      document.title = TIMER_PAGE_TITLE;
    };
  }, [tmOn]);

  /* Pomodoro tab title */
  useEffect(() => {
    if (!pomoOn) return;
    const id = window.setInterval(() => {
      const rem = Math.max(0, Math.ceil((pomo.endAt - Date.now()) / 1000));
      document.title = `${pomo.mode === "focus" ? "🍅" : "☕"} ${fmtDuration(rem)} — EikenQuest`;
    }, 1000);
    return () => {
      window.clearInterval(id);
      document.title = TIMER_PAGE_TITLE;
    };
  }, [pomoOn]);

  /* Pause everything when leaving the page, as the legacy cleanup did. */
  useEffect(() => {
    return () => {
      pauseStopwatch();
      pauseTimer();
      pausePomodoro();
      stopSpeak();
      document.title = TIMER_PAGE_TITLE;
    };
  }, []);

  /* Keyboard shortcuts for the active tool */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("input, textarea, select")) return;
      if (tab === "stopwatch") {
        if (e.code === "Space") {
          e.preventDefault();
          toggleStopwatch();
        } else if (e.key === "l" || e.key === "L") {
          e.preventDefault();
          addLap();
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          resetStopwatch();
        }
      } else if (tab === "timer") {
        if (e.code === "Space") {
          e.preventDefault();
          if (tm.running) pauseTimerNow();
          else startTimer();
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          resetTimer();
        }
      } else if (tab === "pomodoro") {
        if (e.code === "Space") {
          e.preventDefault();
          if (pomo.running) pausePomodoroNow();
          else startPomodoro();
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          resetPomodoro();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  /* ---------------- Tab switching ---------------- */

  const switchTab = async (next: Tab) => {
    if (next === tab) return;
    if (tm.running) {
      const ok = await confirmDialog({
        title: "確認",
        message: "タイマーを一時停止して移動しますか？",
      });
      if (!ok) return;
    }
    if (pomo.running) {
      const ok = await confirmDialog({
        title: "確認",
        message: "ポモドーロを一時停止して移動しますか？",
      });
      if (!ok) return;
    }
    if (isFullscreen) void exitFullscreen();
    pauseStopwatch();
    pauseTimer();
    pausePomodoro();
    setSwOn(false);
    setTmOn(false);
    setPomoOn(false);
    ui.tab = next;
    setTabState(next);
    sfx("click");
    bump();
  };

  /* ---------------- Clock actions ---------------- */

  const enterFullscreen = async () => {
    const stage = stageRef.current;
    if (!stage) return;

    // モバイル端末（タッチデバイスまたは画面幅が狭い環境）判定
    const isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;

    // PC環境の場合、ブラウザのネイティブ Fullscreen API を試す
    if (!isMobile) {
      const req =
        stage.requestFullscreen ||
        (stage as any).webkitRequestFullscreen ||
        (stage as any).mozRequestFullScreen ||
        (stage as any).msRequestFullscreen;

      if (req) {
        try {
          const p = req.call(stage);
          if (p && typeof p.then === "function") {
            await p;
          }
          isNativeFsRef.current = true;
          setIsFullscreen(true);
          return;
        } catch (err) {
          console.info("Native fullscreen failed or rejected, falling back to CSS fullscreen:", err);
        }
      }
    }

    // スマホ環境、またはネイティブ全画面が非対応/拒否された場合はCSS擬似全画面
    isNativeFsRef.current = false;
    setIsFullscreen(true);
  };

  const exitFullscreen = async () => {
    setIsFullscreen(false);
    const doc = document as any;
    const hasNative = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
    if (hasNative || isNativeFsRef.current) {
      isNativeFsRef.current = false;
      try {
        const exit =
          doc.exitFullscreen ||
          doc.webkitExitFullscreen ||
          doc.mozCancelFullScreen ||
          doc.msExitFullscreen;
        if (exit) {
          await exit.call(doc);
        }
      } catch (err) {
        console.warn("Failed to exit native fullscreen", err);
      }
    }
  };

  const toggleFullscreen = () => {
    const doc = document as any;
    const hasNative = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
    if (isFullscreen || hasNative || isNativeFsRef.current) {
      void exitFullscreen();
    } else {
      void enterFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      const hasNative = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      if (!hasNative && isNativeFsRef.current) {
        isNativeFsRef.current = false;
        setIsFullscreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        void exitFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add("has-clock-fullscreen");
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.classList.remove("has-clock-fullscreen");
      };
    }
  }, [isFullscreen]);

  const speakTime = () => {
    const now = new Date();
    speak(`The time is ${now.getHours()} ${now.getMinutes() ? `oh ${now.getMinutes()}` : ""}`, { rate: 0.85 });
  };

  /* ---------------- Render ---------------- */

  const clockSub = `${settings.clock24h ? "24時間表示" : "12時間表示"} · ${
    settings.clockSeconds ? "秒を表示" : "分まで表示"
  }`;

  const timerDisplay = fmtDuration(Math.max(0, Math.ceil(tm.remaining)), tm.total >= 3600);
  const timerPct = tm.total > 0 ? Math.max(0, Math.min(100, (Math.max(0, Math.ceil(tm.remaining)) / tm.total) * 100)) : 0;

  let timerLabel = "残り時間";
  if (tm.running) timerLabel = "集中中";
  else if (tm.finished) timerLabel = "完了！";
  else if (restored && tm.remaining > 0 && tm.remaining < tm.total) timerLabel = "一時停止中";

  const targetLabel = tm.target === 0 ? "∞" : String(tm.target);
  const timerSub =
    tm.note ??
    (tm.allDone
      ? `全 ${tm.done} セット完了`
      : `セット ${Math.min(tm.done + (tm.running ? 1 : 0), tm.target || 99)} / ${targetLabel}`);

  const timerStartLabel = tm.allDone
    ? "完了"
    : tm.running
      ? "一時停止"
      : tm.remaining > 0 && tm.remaining < tm.total
        ? "再開"
        : "スタート";

  const bestSplit = sw.laps.length > 1 ? Math.min(...sw.laps.map((l) => l.split)) : null;
  const worstSplit = sw.laps.length > 1 ? Math.max(...sw.laps.map((l) => l.split)) : null;

  /* Pomodoro view data */
  if (!pomo.initialized) {
    pomo.completed = 0;
    pomo.mode = "focus";
    pomo.initialized = true;
  }
  if (!pomo.mode) pomo.mode = "focus";
  const hasSavedPomodoro = pomo.total > 0 && pomo.remaining > 0 && pomo.remaining < pomo.total;
  if (!pomo.running && !hasSavedPomodoro) {
    pomo.total = pomoDuration(pomo.mode, pc);
    pomo.remaining = pomo.total;
  }

  const pomoRemaining = pomo.running ? Math.max(0, (pomo.endAt - Date.now()) / 1000) : pomo.remaining;
  const pomoPct = pomo.total ? Math.max(0, Math.min(100, (pomoRemaining / pomo.total) * 100)) : 0;
  const modeInfo: Record<PomoMode, { label: string; title: string; color: string }> = {
    focus: { label: "FOCUS", title: "集中タイム", color: "var(--accent)" },
    break: { label: "BREAK", title: "小休憩", color: "var(--accent-2)" },
    long: { label: "LONG BREAK", title: "長休憩", color: "var(--success)" },
  };
  const modeNow = modeInfo[pomo.mode];
  const cycleNo = (pomo.completed % pc.cycles) + 1;
  const doneInCycle = pomo.completed % pc.cycles;
  const pomoBarStroke =
    pomo.mode === "focus" ? "url(#pomoGrad)" : pomo.mode === "long" ? "var(--success)" : "var(--accent-2)";

  const todayLogs = (Store.state.pomodoro.log || []).filter((l) => Store.todayKey(l.ts) === Store.todayKey());
  const todayMin = todayLogs.reduce((a, b) => a + b.min, 0);

  const renderFullscreenOverlay = () => {
    if (!isFullscreen) return null;
    return (
      <>
        <button
          id="exitFullscreenBtn"
          className="clock-fullscreen-exit-btn"
          type="button"
          onClick={() => void exitFullscreen()}
          aria-label="全画面表示を終了"
          title="全画面表示を終了 (Esc / F)"
        >
          <Icon name="x" size={18} />
          <span>全画面を終了</span>
        </button>

        <button
          className="clock-fullscreen-quick-btn"
          type="button"
          onClick={() => setQuickOpen((q) => !q)}
          aria-label="背景や動き方を変更"
          title="背景や動き方を変更"
        >
          <span>🎨</span>
          <span>カスタマイズ</span>
        </button>

        {quickOpen && (
          <div className="clock-quick-menu">
            <div className="row row--between" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: ".9rem" }}>カスタマイズ</div>
              <button
                className="icon-btn icon-btn--sm"
                type="button"
                onClick={() => setQuickOpen(false)}
                aria-label="閉じる"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            {tab === "clock" && (
              <>
                <div style={{ fontSize: ".76rem", fontWeight: 700, marginBottom: 6 }}>スタイル</div>
                <div className="row" style={{ gap: 6, marginBottom: 12 }}>
                  {CLOCK_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`font-option ${clockStyle === st.id ? "is-active" : ""}`}
                      style={{ flex: 1, padding: "6px 8px", fontSize: ".75rem" }}
                      onClick={() => {
                        Store.setSetting("clockStyle", st.id);
                        sfx("click");
                      }}
                    >
                      <span>{st.icon} {st.name}</span>
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: ".76rem", fontWeight: 700, marginBottom: 6 }}>連動ウィジェット</div>
                <div className="row row--wrap" style={{ gap: 6, marginBottom: 12 }}>
                  {CLOCK_WIDGETS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className={`font-option ${clockWidget === w.id ? "is-active" : ""}`}
                      style={{ flex: "1 1 45%", padding: "6px 6px", fontSize: ".72rem" }}
                      onClick={() => {
                        Store.setSetting("clockWidget", w.id);
                        sfx("click");
                      }}
                    >
                      <span>{w.icon} {w.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ fontSize: ".76rem", fontWeight: 700, marginBottom: 6 }}>背景テーマ</div>
            <div className="clock-custom-grid" style={{ marginBottom: 12 }}>
              {CLOCK_BGS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`clock-custom-btn ${clockBg === b.id ? "is-active" : ""}`}
                  onClick={() => {
                    Store.setSetting("clockBg", b.id);
                    sfx("click");
                  }}
                >
                  <span className="clock-custom-btn__preview" style={{ background: b.preview }} />
                  <span>{b.name}</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: ".76rem", fontWeight: 700, marginBottom: 6 }}>動き方</div>
            <div className="row" style={{ gap: 6, marginBottom: 12 }}>
              {CLOCK_MOTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`font-option ${clockMotion === m.id ? "is-active" : ""}`}
                  style={{ flex: 1, padding: "6px 6px", fontSize: ".72rem" }}
                  onClick={() => {
                    Store.setSetting("clockMotion", m.id);
                    sfx("click");
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <label className="switch" style={{ fontSize: ".78rem" }}>
              <input
                type="checkbox"
                checked={clockParticles}
                onChange={(e) => Store.setSetting("clockParticles", e.target.checked)}
              />
              <span className="switch__track" />
              <span className="switch__text">パーティクル演出</span>
            </label>

            <label className="switch" style={{ fontSize: ".78rem", marginTop: 8 }}>
              <input
                type="checkbox"
                checked={settings.keepAwake !== false}
                onChange={(e) => Store.setSetting("keepAwake", e.target.checked)}
              />
              <span className="switch__track" />
              <span className="switch__text">☀️ 画面スリープ防止（常時点灯）</span>
            </label>
          </div>
        )}
      </>
    );
  };

  const renderClockLinkedWidget = () => {
    if (clockWidget === "none") return null;

    if (clockWidget === "timer") {
      return (
        <div className="clock-widget-box" role="region" aria-label="連動タイマー">
          <div className="clock-widget-box__header">
            <span>⏳ タイマー ({timerLabel})</span>
            <button
              type="button"
              className="link-btn"
              style={{ fontSize: ".72rem", color: "var(--accent)" }}
              onClick={() => void switchTab("timer")}
            >
              詳細へ →
            </button>
          </div>
          <div className="clock-widget-box__time">{timerDisplay}</div>
          <div className="clock-widget-box__actions">
            <button
              type="button"
              className="clock-widget-btn clock-widget-btn--primary"
              onClick={() => {
                if (tm.running) pauseTimerNow();
                else startTimer();
              }}
            >
              <Icon name={tm.running ? "pause" : "play"} size={14} />
              {tm.running ? "一時停止" : "スタート"}
            </button>
            <button
              type="button"
              className="clock-widget-btn"
              disabled={tm.running}
              onClick={plusMinute}
            >
              +1分
            </button>
            <button
              type="button"
              className="clock-widget-btn"
              onClick={resetTimer}
            >
              <Icon name="reset" size={14} />
              リセット
            </button>
          </div>
        </div>
      );
    }

    if (clockWidget === "stopwatch") {
      const swParts = fmtMsParts(swElapsedNow());
      return (
        <div className="clock-widget-box" role="region" aria-label="連動ストップウォッチ">
          <div className="clock-widget-box__header">
            <span>⏱ ストップウォッチ</span>
            <button
              type="button"
              className="link-btn"
              style={{ fontSize: ".72rem", color: "var(--accent)" }}
              onClick={() => void switchTab("stopwatch")}
            >
              詳細へ →
            </button>
          </div>
          <div className="clock-widget-box__time">
            {swParts.base}.<small style={{ fontSize: "0.6em", opacity: 0.8 }}>{swParts.centis}</small>
          </div>
          <div className="clock-widget-box__actions">
            <button
              type="button"
              className="clock-widget-btn clock-widget-btn--primary"
              onClick={toggleStopwatch}
            >
              <Icon name={sw.running ? "pause" : "play"} size={14} />
              {sw.running ? "一時停止" : sw.elapsed > 0 ? "再開" : "スタート"}
            </button>
            <button
              type="button"
              className="clock-widget-btn"
              onClick={resetStopwatch}
            >
              <Icon name="reset" size={14} />
              リセット
            </button>
          </div>
        </div>
      );
    }

    if (clockWidget === "pomodoro") {
      return (
        <div className="clock-widget-box" role="region" aria-label="連動ポモドーロ">
          <div className="clock-widget-box__header">
            <span>{pomo.mode === "focus" ? "🍅" : "☕"} {modeNow.title}</span>
            <button
              type="button"
              className="link-btn"
              style={{ fontSize: ".72rem", color: "var(--accent)" }}
              onClick={() => void switchTab("pomodoro")}
            >
              詳細へ →
            </button>
          </div>
          <div className="clock-widget-box__time">
            {fmtDuration(Math.ceil(pomoRemaining), pomo.total >= 3600)}
          </div>
          <div className="row" style={{ gap: 4, margin: "2px 0 6px" }}>
            {Array.from({ length: pc.cycles }).map((_, i) => (
              <span
                key={i}
                className={`pomo-dot${i < doneInCycle ? " is-done" : pomo.mode === "focus" && i === doneInCycle ? " is-now" : ""}`}
                style={{ width: 8, height: 8 }}
              />
            ))}
          </div>
          <div className="clock-widget-box__actions">
            <button
              type="button"
              className="clock-widget-btn clock-widget-btn--primary"
              onClick={() => {
                if (pomo.running) pausePomodoroNow();
                else startPomodoro();
              }}
            >
              <Icon name={pomo.running ? "pause" : "play"} size={14} />
              {pomo.running ? "一時停止" : "スタート"}
            </button>
            <button
              type="button"
              className="clock-widget-btn"
              onClick={skipPomodoro}
            >
              <Icon name="skip" size={14} />
              スキップ
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`page clock-page ${fontClass}`}>
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow">Focus Tools</div>
            <h1>時計・集中タイマー</h1>
            <p>
              シンプルなデジタル時計、ストップウォッチ、繰り返しタイマー、ポモドーロ。勉強のリズムを整える道具がそろっています。
            </p>
          </div>
          <a className="btn btn--outline btn--sm" href="#/settings">
            <Icon name="settings" size={16} />
            設定
          </a>
        </div>
      </div>

      <div className="segmented clock-tabs" role="tablist" aria-label="ツールを選択">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-tab={item.id}
            className={tab === item.id ? "is-active" : ""}
            onClick={() => void switchTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="clockContent">
        {tab === "clock" ? (
          <>
            <div
              className={`clock-stage ${fontClass} ${bgClass} ${motionClass} ${isFullscreen ? "is-fullscreen" : ""}`}
              id="clockStage"
              ref={stageRef}
            >
              {clockParticles && clockBg !== "default" && clockBg !== "oled" ? (
                <ClockParticlesCanvas bg={clockBg} />
              ) : null}

              {renderFullscreenOverlay()}

              <div className="clock-stage-inner">
                <ClockDisplay
                  style={clockStyle}
                  motion={clockMotion}
                  clock24h={settings.clock24h}
                  clockSeconds={settings.clockSeconds}
                />
                <div className="clock-sub">{clockSub}</div>
                {renderClockLinkedWidget()}
              </div>
            </div>

            <div className="clock-controls">
              <button
                id="fullscreenBtn"
                className="big-btn big-btn--primary"
                type="button"
                data-fullscreen
                onClick={toggleFullscreen}
              >
                <Icon name={isFullscreen ? "x" : "eye"} size={18} />
                {isFullscreen ? "全画面を終了" : "全画面表示"}
              </button>
              <button className="big-btn big-btn--soft" type="button" data-clock-speak onClick={speakTime}>
                <Icon name="volume" size={18} />
                時刻を読み上げ
              </button>
            </div>

            <div className="clock-settings">
              {/* Style Selector */}
              <div className="card card--pad" style={{ marginBottom: 16 }}>
                <div className="card__head">
                  <div>
                    <div className="card__title">
                      <Icon name="clock" size={18} /> 時計のスタイル
                    </div>
                    <div className="card__sub">デジタル・アナログ・フリップから選択</div>
                  </div>
                </div>
                <div className="row row--wrap" style={{ gap: 8 }}>
                  {CLOCK_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`font-option ${clockStyle === st.id ? "is-active" : ""}`}
                      style={{ flex: "1 1 90px", padding: "10px 14px", fontSize: ".88rem" }}
                      onClick={() => {
                        Store.setSetting("clockStyle", st.id);
                        sfx("click");
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{st.icon}</span>
                      <span>{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Linked Widget Selector */}
              <div className="card card--pad" style={{ marginBottom: 16 }}>
                <div className="card__head">
                  <div>
                    <div className="card__title">
                      <Icon name="timer" size={18} /> 連動ウィジェット表示
                    </div>
                    <div className="card__sub">時計と一緒にタイマー・ストップウォッチ・ポモドーロを表示</div>
                  </div>
                </div>
                <div className="row row--wrap" style={{ gap: 8 }}>
                  {CLOCK_WIDGETS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className={`font-option ${clockWidget === w.id ? "is-active" : ""}`}
                      style={{ flex: "1 1 120px", padding: "10px 14px", fontSize: ".88rem" }}
                      onClick={() => {
                        Store.setSetting("clockWidget", w.id);
                        sfx("click");
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{w.icon}</span>
                      <span>{w.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Theme Selector */}
              <div className="card card--pad" style={{ marginBottom: 16 }}>
                <div className="card__head">
                  <div>
                    <div className="card__title">
                      <span>🎨</span> 背景テーマ
                    </div>
                    <div className="card__sub">集中しやすいお好みの背景を選べます（全画面でも連動）</div>
                  </div>
                </div>
                <div className="clock-custom-grid">
                  {CLOCK_BGS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`clock-custom-btn ${clockBg === b.id ? "is-active" : ""}`}
                      onClick={() => {
                        Store.setSetting("clockBg", b.id);
                        sfx("click");
                      }}
                    >
                      <span className="clock-custom-btn__preview" style={{ background: b.preview }} />
                      <span>{b.name}</span>
                      <small style={{ fontSize: ".62rem", color: "var(--muted)" }}>{b.desc}</small>
                    </button>
                  ))}
                </div>
              </div>

              {/* Movement / Animation Selector */}
              <div className="card card--pad" style={{ marginBottom: 16 }}>
                <div className="card__head">
                  <div>
                    <div className="card__title">
                      <Icon name="sparkle" size={18} /> 動き方・アニメーション
                    </div>
                    <div className="card__sub">針や数字の動作・リラックスエフェクト</div>
                  </div>
                </div>
                <div className="row row--wrap" style={{ gap: 8 }}>
                  {CLOCK_MOTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`font-option ${clockMotion === m.id ? "is-active" : ""}`}
                      style={{ flex: "1 1 120px", padding: "10px 14px", textAlign: "left" }}
                      onClick={() => {
                        Store.setSetting("clockMotion", m.id);
                        sfx("click");
                      }}
                    >
                      <span style={{ fontWeight: 800 }}>{m.name}</span>
                      <small>{m.desc}</small>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font & Switches */}
              <div className="card card--pad">
                <div className="card__head">
                  <div>
                    <div className="card__title">
                      <Icon name="pen" size={18} /> 数字フォント・詳細表示
                    </div>
                    <div className="card__sub">お好みの数字デザインと表示形式</div>
                  </div>
                  <a className="btn btn--ghost btn--sm" href="#/settings">
                    その他の設定
                  </a>
                </div>
                <div className="font-options">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`font-option ${settings.clockFont === f.id ? "is-active" : ""}`}
                      data-font={f.id}
                      onClick={() => {
                        Store.setSetting("clockFont", f.id);
                        sfx("click");
                      }}
                    >
                      <span style={{ fontSize: "1.05rem", fontFamily: clockFontFamily(f.id) }}>12:34</span>
                      <small>{f.note}</small>
                    </button>
                  ))}
                </div>
                <div className="divider" style={{ margin: "18px 0" }} />
                <div className="row row--between row--wrap" style={{ gap: 14 }}>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="clock24"
                      checked={settings.clock24h}
                      onChange={(e) => Store.setSetting("clock24h", e.target.checked)}
                    />
                    <span className="switch__track" />
                    <span className="switch__text">24時間表示</span>
                  </label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="clockSec"
                      checked={settings.clockSeconds}
                      onChange={(e) => Store.setSetting("clockSeconds", e.target.checked)}
                    />
                    <span className="switch__track" />
                    <span className="switch__text">秒を表示</span>
                  </label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="clockPart"
                      checked={clockParticles}
                      onChange={(e) => Store.setSetting("clockParticles", e.target.checked)}
                    />
                    <span className="switch__track" />
                    <span className="switch__text">パーティクル演出</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="callout" style={{ marginTop: 16 }}>
              <span className="callout__icon">🌙</span>
              <span>
                時計のスタイル、背景、動き方は自動で保存されます。全画面表示時も左上の「🎨 カスタマイズ」からいつでも変更できます。
              </span>
            </div>
          </>
        ) : null}

        {tab === "stopwatch" ? (
          <>
            <div
              className={`clock-stage ${fontClass} ${bgClass} ${motionClass} ${isFullscreen ? "is-fullscreen" : ""}`}
              id="swStage"
              ref={stageRef}
            >
              {clockParticles && clockBg !== "default" && clockBg !== "oled" ? (
                <ClockParticlesCanvas bg={clockBg} />
              ) : null}
              {renderFullscreenOverlay()}
              <StopwatchDisplay running={swOn} />
              <div className="clock-sub" style={{ marginTop: 10 }}>
                ストップウォッチ · ラップ計測対応
              </div>
              <div className="clock-controls">
                <button className="big-btn big-btn--primary" id="swStart" type="button" data-sw-start onClick={toggleStopwatch}>
                  <Icon name={sw.running ? "pause" : "play"} size={18} />
                  {sw.running ? "一時停止" : sw.elapsed > 0 ? "再開" : "スタート"}
                </button>
                <button
                  className="big-btn big-btn--soft"
                  id="swLap"
                  type="button"
                  data-sw-lap
                  disabled={!sw.running}
                  onClick={addLap}
                >
                  <Icon name="plus" size={18} />
                  ラップ
                </button>
                <button className="big-btn big-btn--soft" id="swReset" type="button" data-sw-reset onClick={resetStopwatch}>
                  <Icon name="reset" size={18} />
                  リセット
                </button>
                <button
                  className="big-btn big-btn--soft"
                  id="swFullscreenBtn"
                  type="button"
                  data-fullscreen
                  onClick={toggleFullscreen}
                >
                  <Icon name={isFullscreen ? "x" : "eye"} size={18} />
                  {isFullscreen ? "全画面を終了" : "全画面"}
                </button>
              </div>
              <p className="tiny muted" style={{ marginTop: 14 }}>
                キーボード：<span className="kbd">Space</span> 開始/停止 · <span className="kbd">L</span> ラップ ·{" "}
                <span className="kbd">R</span> リセット · <span className="kbd">F</span> 全画面
              </p>
            </div>
            <div className="card card--pad" style={{ marginTop: 18 }}>
              <div className="row row--between" style={{ marginBottom: 10 }}>
                <div className="card__title">
                  <Icon name="clock" size={18} /> ラップタイム
                </div>
                <span className="pill" id="swLapCount">
                  {sw.laps.length} ラップ
                </span>
              </div>
              <div id="swLaps" className="lap-list">
                {sw.laps.length === 0 ? (
                  <p className="tiny muted" style={{ margin: "8px 0" }}>
                    まだラップがありません。計測中に「ラップ」を押してください。
                  </p>
                ) : (
                  sw.laps
                    .slice()
                    .reverse()
                    .map((lap) => {
                      const isBest = bestSplit !== null && lap.split === bestSplit;
                      const isWorst = worstSplit !== null && lap.split === worstSplit;
                      return (
                        <div key={lap.n} className={`lap-row ${isBest ? "is-best" : isWorst ? "is-worst" : ""}`}>
                          <span className="n">
                            Lap {lap.n}
                            {isBest ? " · BEST" : ""}
                          </span>
                          <span className="d">+{plainMs(lap.split)}</span>
                          <span className="t">{plainMs(lap.total)}</span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </>
        ) : null}

        {tab === "timer" ? (
          <>
            <div
              className={`clock-stage ${fontClass} ${bgClass} ${motionClass} ${isFullscreen ? "is-fullscreen" : ""}`}
              id="timerStage"
              ref={stageRef}
            >
              {clockParticles && clockBg !== "default" && clockBg !== "oled" ? (
                <ClockParticlesCanvas bg={clockBg} />
              ) : null}
              {renderFullscreenOverlay()}
              {!isFullscreen && (
                <>
                  <div className="timer-inputs" id="timerInputs">
                    <label className="ti">
                      <input
                        type="number"
                        id="tH"
                        min={0}
                        max={23}
                        value={parts.h}
                        inputMode="numeric"
                        disabled={tm.running}
                        style={{ opacity: tm.running ? 0.55 : 1 }}
                        onChange={(e) => updatePart("h", e.target.value)}
                      />
                      <span>時間</span>
                    </label>
                    <span className="colon">:</span>
                    <label className="ti">
                      <input
                        type="number"
                        id="tM"
                        min={0}
                        max={59}
                        value={parts.m}
                        inputMode="numeric"
                        disabled={tm.running}
                        style={{ opacity: tm.running ? 0.55 : 1 }}
                        onChange={(e) => updatePart("m", e.target.value)}
                      />
                      <span>分</span>
                    </label>
                    <span className="colon">:</span>
                    <label className="ti">
                      <input
                        type="number"
                        id="tS"
                        min={0}
                        max={59}
                        value={parts.s}
                        inputMode="numeric"
                        disabled={tm.running}
                        style={{ opacity: tm.running ? 0.55 : 1 }}
                        onChange={(e) => updatePart("s", e.target.value)}
                      />
                      <span>秒</span>
                    </label>
                  </div>
                  <div className="presets">
                    {TIMER_PRESETS.map((min) => (
                      <button
                        key={min}
                        type="button"
                        className={`preset ${preset === min ? "is-active" : ""}`}
                        data-min={min}
                        onClick={() => applyPreset(min)}
                      >
                        {min}分
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="timer-ring">
                <svg viewBox="0 0 200 200" aria-hidden="true">
                  <defs>
                    <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" />
                      <stop offset="100%" stopColor="var(--accent-2)" />
                    </linearGradient>
                  </defs>
                  <circle className="track" cx="100" cy="100" r="88" />
                  <circle
                    className="bar"
                    id="tBar"
                    cx="100"
                    cy="100"
                    r="88"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={String(100 - timerPct)}
                  />
                </svg>
                <div className="timer-ring__center">
                  <div className="timer-ring__label" id="tLabel">
                    {timerLabel}
                  </div>
                  <div className="timer-display" id="tDisplay">
                    {timerDisplay}
                  </div>
                  <div className="timer-ring__sub" id="tSub">
                    {timerSub}
                  </div>
                </div>
              </div>
              <div className="clock-controls">
                <button
                  className="big-btn big-btn--primary"
                  id="tStart"
                  type="button"
                  disabled={allDone}
                  onClick={() => {
                    if (tm.running) pauseTimerNow();
                    else startTimer();
                  }}
                >
                  <Icon name={allDone ? "check" : tm.running ? "pause" : "play"} size={18} />
                  {timerStartLabel}
                </button>
                <button
                  className="big-btn big-btn--soft"
                  id="tPlus"
                  type="button"
                  disabled={tm.running}
                  onClick={plusMinute}
                >
                  +1分
                </button>
                <button className="big-btn big-btn--soft" id="tReset" type="button" onClick={resetTimer}>
                  <Icon name="reset" size={18} />
                  リセット
                </button>
                <button
                  className="big-btn big-btn--soft"
                  id="timerFullscreenBtn"
                  type="button"
                  data-fullscreen
                  onClick={toggleFullscreen}
                >
                  <Icon name={isFullscreen ? "x" : "eye"} size={18} />
                  {isFullscreen ? "全画面を終了" : "全画面"}
                </button>
              </div>
            </div>

            <div className="card card--pad" style={{ marginTop: 18 }}>
              <div className="card__head">
                <div>
                  <div className="card__title">
                    <Icon name="repeat" size={18} /> 繰り返し設定
                  </div>
                  <div className="card__sub">
                    同じ時間を連続で計測します。休憩を挟みたい場合はポモドーロがおすすめ。
                  </div>
                </div>
              </div>
              <div className="row row--between row--wrap" style={{ gap: 14 }}>
                <label className="field" style={{ flex: 1, minWidth: 160 }}>
                  <span className="label">繰り返し回数</span>
                  <select
                    className="select"
                    id="tRepeat"
                    value={repeat}
                    disabled={tm.running}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setRepeat(value);
                      tm.target = value;
                      if (!tm.running) tm.done = 0;
                      tm.note = null;
                      bump();
                    }}
                  >
                    {REPEAT_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? "∞ エンドレス" : `${n} セット`}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="switch" style={{ marginTop: 18 }}>
                  <input
                    type="checkbox"
                    id="tAuto"
                    checked={settings.autoNext !== false}
                    onChange={(e) => Store.setSetting("autoNext", e.target.checked)}
                  />
                  <span className="switch__track" />
                  <span className="switch__text">自動で次を開始</span>
                </label>
              </div>
              <div className="callout callout--teal" style={{ marginTop: 14 }}>
                <span className="callout__icon">🔥</span>
                <span>タイマー完了時にXPを獲得。1分以上の集中で学習記録に反映されます。</span>
              </div>
            </div>
          </>
        ) : null}

        {tab === "pomodoro" ? (
          <>
            <div
              className={`clock-stage ${fontClass} ${bgClass} ${motionClass} ${isFullscreen ? "is-fullscreen" : ""}`}
              id="pomoStage"
              ref={stageRef}
            >
              {clockParticles && clockBg !== "default" && clockBg !== "oled" ? (
                <ClockParticlesCanvas bg={clockBg} />
              ) : null}
              {renderFullscreenOverlay()}
              <div className={`pomo-mode ${pomo.mode !== "focus" ? "is-break" : ""}`} id="pomoMode">
                {pomo.mode === "focus" ? "🍅 " : pomo.mode === "long" ? "🌿 " : "☕ "}
                {modeNow.label}
              </div>
              <div className="timer-ring">
                <svg viewBox="0 0 200 200" aria-hidden="true">
                  <defs>
                    <linearGradient id="pomoGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" />
                      <stop offset="100%" stopColor="var(--accent-2)" />
                    </linearGradient>
                  </defs>
                  <circle className="track" cx="100" cy="100" r="88" />
                  <circle
                    className="bar"
                    id="pBar"
                    cx="100"
                    cy="100"
                    r="88"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={String(100 - pomoPct)}
                    style={{ stroke: pomoBarStroke }}
                  />
                </svg>
                <div className="timer-ring__center">
                  <div className="timer-ring__label" id="pLabel">
                    {modeNow.title}
                  </div>
                  <div className="timer-display" id="pDisplay">
                    {fmtDuration(Math.ceil(pomoRemaining), pomo.total >= 3600)}
                  </div>
                  <div className="timer-ring__sub" id="pSub">
                    {pomo.mode === "focus"
                      ? `セット ${cycleNo} / ${pc.cycles} · ${pc.focus}分`
                      : `${modeNow.title} · ${pomo.mode === "long" ? pc.long : pc.break}分`}
                  </div>
                </div>
              </div>
              <div className="pomo-dots" id="pDots">
                {Array.from({ length: pc.cycles }).map((_, i) => (
                  <span
                    key={i}
                    className={`pomo-dot${i < doneInCycle ? " is-done" : pomo.mode === "focus" && i === doneInCycle ? " is-now" : ""}`}
                  />
                ))}
              </div>
              <div className="clock-controls">
                <button
                  className="big-btn big-btn--primary"
                  id="pStart"
                  type="button"
                  onClick={() => {
                    if (pomo.running) pausePomodoroNow();
                    else startPomodoro();
                  }}
                >
                  <Icon name={pomo.running ? "pause" : "play"} size={18} />
                  {pomo.running ? "一時停止" : pomo.remaining < pomo.total ? "再開" : "スタート"}
                </button>
                <button className="big-btn big-btn--soft" id="pSkip" type="button" onClick={skipPomodoro}>
                  <Icon name="skip" size={17} />
                  スキップ
                </button>
                <button className="big-btn big-btn--soft" id="pReset" type="button" onClick={resetPomodoro}>
                  <Icon name="reset" size={18} />
                  リセット
                </button>
                <button
                  className="big-btn big-btn--soft"
                  id="pomoFullscreenBtn"
                  type="button"
                  data-fullscreen
                  onClick={toggleFullscreen}
                >
                  <Icon name={isFullscreen ? "x" : "eye"} size={18} />
                  {isFullscreen ? "全画面を終了" : "全画面"}
                </button>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "1.2fr .8fr", marginTop: 18 } as CSSProperties} id="pomoBottom">
              <div className="card card--pad">
                <div className="card__head">
                  <div>
                    <div className="card__title">
                      <Icon name="settings" size={18} /> ポモドーロ設定
                    </div>
                    <div className="card__sub">
                      25分集中 + 5分休憩が基本。自分に合うリズムに調整できます。
                    </div>
                  </div>
                </div>
                <div className="pomo-settings">
                  <label className="field">
                    <span className="label">集中（分）</span>
                    <input
                      className="input"
                      type="number"
                      id="pFocus"
                      min={1}
                      max={120}
                      value={pc.focus}
                      onChange={(e) => {
                        const focus = Math.max(1, Math.min(120, Number(e.target.value) || 25));
                        const next = { ...pc, focus };
                        commitPomoCfg(next);
                      }}
                    />
                  </label>
                  <label className="field">
                    <span className="label">休憩（分）</span>
                    <input
                      className="input"
                      type="number"
                      id="pBreak"
                      min={1}
                      max={60}
                      value={pc.break}
                      onChange={(e) => {
                        const brk = Math.max(1, Math.min(60, Number(e.target.value) || 5));
                        const next = { ...pc, break: brk };
                        commitPomoCfg(next);
                      }}
                    />
                  </label>
                  <label className="field">
                    <span className="label">長休憩（分）</span>
                    <input
                      className="input"
                      type="number"
                      id="pLong"
                      min={1}
                      max={60}
                      value={pc.long}
                      onChange={(e) => {
                        const long = Math.max(1, Math.min(60, Number(e.target.value) || 15));
                        const next = { ...pc, long };
                        commitPomoCfg(next);
                      }}
                    />
                  </label>
                  <label className="field">
                    <span className="label">何セットで長休憩</span>
                    <input
                      className="input"
                      type="number"
                      id="pCycles"
                      min={2}
                      max={10}
                      value={pc.cycles}
                      onChange={(e) => {
                        const cycles = Math.max(2, Math.min(10, Number(e.target.value) || 4));
                        const next = { ...pc, cycles };
                        commitPomoCfg(next);
                      }}
                    />
                  </label>
                </div>
                <label className="switch" style={{ marginTop: 14 }}>
                  <input
                    type="checkbox"
                    id="pAuto"
                    checked={pc.auto}
                    onChange={(e) => {
                      const next = { ...pc, auto: e.target.checked };
                      commitPomoCfg(next);
                    }}
                  />
                  <span className="switch__track" />
                  <span className="switch__text">自動で次のセッションへ</span>
                </label>
                <button
                  className="btn btn--soft btn--sm"
                  type="button"
                  data-pomo-preset="25"
                  style={{ marginTop: 14 }}
                  onClick={() => {
                    commitPomoCfg({ focus: 25, break: 5, long: 15, cycles: 4, auto: pc.auto });
                    toast("25分集中 + 5分休憩に設定しました", "success", 2000);
                  }}
                >
                  25 / 5 に戻す
                </button>
              </div>
              <div className="card card--pad">
                <div className="card__title" style={{ marginBottom: 12 }}>
                  <Icon name="chart" size={18} /> 今日の集中
                </div>
                <div className="row row--between" style={{ padding: "8px 0", borderBottom: "1px dashed var(--border)" }}>
                  <span className="small muted">集中時間</span>
                  <b style={{ fontSize: "1.2rem" }}>{todayMin} 分</b>
                </div>
                <div className="row row--between" style={{ padding: "8px 0", borderBottom: "1px dashed var(--border)" }}>
                  <span className="small muted">完了セッション</span>
                  <b style={{ fontSize: "1.2rem" }}>{todayLogs.length} 回</b>
                </div>
                <div className="row row--between" style={{ padding: "8px 0" }}>
                  <span className="small muted">累計セッション</span>
                  <b>{Store.state.pomodoro.completed || 0} 回</b>
                </div>
                <div className="callout callout--teal" style={{ marginTop: 12, fontSize: ".78rem" }}>
                  <span className="callout__icon">🍅</span>
                  <span>集中セッション完了ごとにXPを獲得。休憩も立派な学習の一部です。</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="callout" style={{ marginTop: 22 }}>
        <span className="callout__icon">🧘</span>
        <span>
          <b>集中のコツ：</b>
          スマートフォンを伏せて、タイマーが鳴るまで1つのことだけに取り組みましょう。休憩では立ち上がって体を動かすのがおすすめです。
        </span>
      </div>
    </div>
  );
}
