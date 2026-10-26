import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { GradeFilter, QuizConfig } from "./types";
import { EQ_GRADES, EQ_GRADE_MAP } from "./data/vocabulary";
import { useStore } from "./lib/useStore";
import { Store } from "./lib/store";
import { ROUTES, titleFor, useRoute } from "./lib/router";
import type { RouteName } from "./lib/router";
import { sfx, toast } from "./lib/ui";
import { APP_VERSION } from "./lib/constants";
import { AppContext } from "./lib/app-context";
import type { AppApi } from "./lib/app-context";
import { CloudSync, getSyncInfo, type SyncInfo } from "./lib/cloud-sync";
import { Icon } from "./components/Icon";
import { Modal } from "./components/Modal";
import { ToastHost } from "./components/ToastHost";
import { ConfirmProvider } from "./components/ConfirmProvider";
import { Quiz } from "./components/Quiz";
import { HomePage } from "./pages/HomePage";
import { VocabPage } from "./pages/VocabPage";
import { GrammarPage } from "./pages/GrammarPage";
import { ExamPage, resetExamUi } from "./pages/ExamPage";
import { InterviewPage } from "./pages/InterviewPage";
import { WritingPage } from "./pages/WritingPage";
import { DictationPage } from "./pages/DictationPage";
import { ClockPage } from "./pages/ClockPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";

const NAV_ITEMS: { name: RouteName; href: string; icon: string; label: string; group: "learn" | "exam" | "tool" }[] = [
  { name: "home", href: "#/", icon: "◎", label: "ホーム", group: "learn" },
  { name: "vocab", href: "#/vocab", icon: "Aa", label: "単語帳", group: "learn" },
  { name: "grammar", href: "#/grammar", icon: "✎", label: "英文法", group: "learn" },
  { name: "dictation", href: "#/dictation", icon: "🎧", label: "ディクテーション", group: "learn" },
  { name: "exam", href: "#/exam", icon: "📋", label: "1次試験", group: "exam" },
  { name: "writing", href: "#/writing", icon: "✍", label: "英作文（ライティング）", group: "exam" },
  { name: "interview", href: "#/interview", icon: "🎤", label: "2次試験（面接）", group: "exam" },
  { name: "clock", href: "#/clock", icon: "◷", label: "時計・集中タイマー", group: "tool" },
  { name: "progress", href: "#/progress", icon: "▲", label: "学習記録", group: "tool" },
  { name: "settings", href: "#/settings", icon: "⚙", label: "設定", group: "tool" },
];

const TIPS = [
  "1日5分でも続ければ、合格に近づきます。",
  "間違えた問題は、翌日にもう一度。",
  "音読は、英語のリズムを体に入れる近道です。",
  "完璧より、毎日。まずは1問から。",
  "ポモドーロで25分集中、5分休憩。",
];

function pageFor(name: RouteName, params: string[]): ReactNode {
  switch (name) {
    case "home":
      return <HomePage />;
    case "vocab":
      return <VocabPage />;
    case "grammar":
      return <GrammarPage params={params} />;
    case "dictation":
      return <DictationPage />;
    case "exam":
      return <ExamPage />;
    case "writing":
      return <WritingPage />;
    case "interview":
      return <InterviewPage />;
    case "clock":
      return <ClockPage />;
    case "progress":
      return <ProgressPage />;
    case "settings":
      return <SettingsPage />;
    default:
      return <HomePage />;
  }
}

function GradePicker({ current, onClose }: { current: GradeFilter; onClose: () => void }) {
  const pick = (id: GradeFilter) => {
    const changed = id !== Store.state.profile.grade;
    Store.setGrade(id);
    onClose();
    if (changed) {
      const info = id === "all" ? null : EQ_GRADE_MAP[id];
      toast(`学習する級を「${id === "all" ? "すべての級" : info ? info.full : id}」に変更しました`, "success");
      sfx("complete");
    }
  };

  return (
    <Modal title="学習する級を選ぶ" wide onClose={onClose}>
      <p className="small muted" style={{ lineHeight: 1.75, margin: "0 0 16px" }}>
        学習する級を選んでください。単語・文法・1次試験の出題レベルが切り替わります。2次試験は級ごとに内容が変わります。
      </p>
      <div className="grade-picker">
        <GradeOption id="all" active={current === "all"} onPick={pick} />
        {EQ_GRADES.map((g) => (
          <GradeOption key={g.id} id={g.id} active={current === g.id} onPick={pick} />
        ))}
      </div>
      <p className="tiny muted" style={{ margin: "16px 0 0", lineHeight: 1.65 }}>
        ※ 級を変えても、これまでの学習記録はそのまま残ります。
      </p>
    </Modal>
  );
}

function GradeOption({
  id,
  active,
  onPick,
}: {
  id: GradeFilter;
  active: boolean;
  onPick: (id: GradeFilter) => void;
}) {
  const isAll = id === "all";
  const g = isAll ? null : EQ_GRADE_MAP[id];
  const color = isAll ? "#4f46e5" : g?.color ?? "#4f46e5";
  const name = isAll ? "すべて" : g?.name ?? id;
  const full = isAll ? "すべての級" : g?.full ?? id;
  const cefr = isAll ? "ALL" : g?.cefr ?? "—";
  const desc = isAll ? "5級から1級まで、全レベルからランダムに出題します。実力試しに。" : g?.desc ?? "";
  const meta = isAll ? "単語・文法・読解を横断" : `${g?.words ?? ""} · ${g?.stage ?? ""}`;

  return (
    <button
      type="button"
      className={`grade-option ${active ? "is-active" : ""}`}
      style={{ "--g": color } as CSSProperties}
      aria-pressed={active}
      onClick={() => onPick(id)}
    >
      <span className="grade-option__top">
        <span className="grade-option__badge">{name}</span>
        <span className="grade-option__cefr">{cefr}</span>
        {active ? <span className="grade-option__check">✓</span> : null}
      </span>
      <span className="grade-option__full">{full}</span>
      <span className="grade-option__desc">{desc}</span>
      <span className="grade-option__meta">{meta}</span>
    </button>
  );
}

export default function App() {
  const state = useStore();
  const route = useRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gradePickerOpen, setGradePickerOpen] = useState(false);
  const [quiz, setQuiz] = useState<QuizConfig | null>(null);
  const [syncInfo, setSyncInfo] = useState<SyncInfo>(getSyncInfo());

  useEffect(() => {
    CloudSync.init();
    return CloudSync.subscribe((info) => {
      setSyncInfo(info);
    });
  }, []);

  const drawerRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const gradeId = state.profile.grade;
  const info = gradeId === "all" ? null : EQ_GRADE_MAP[gradeId];
  const label = gradeId === "all" ? "すべて" : info ? info.name : gradeId;
  const fullLabel = gradeId === "all" ? "すべての級" : info ? info.full : gradeId;

  const api = useMemo<AppApi>(
    () => ({
      startQuiz: (config) => {
        setGradePickerOpen(false);
        setDrawerOpen(false);
        setQuiz(config);
      },
      closeQuiz: () => setQuiz(null),
      openGradePicker: () => setGradePickerOpen(true),
    }),
    [],
  );

  /* Initial hash + document title */
  useEffect(() => {
    if (!window.location.hash) {
      try {
        window.history.replaceState(null, "", "#/");
      } catch {
        window.location.hash = "#/";
      }
    }
  }, []);

  const routeKey = `${route.name}/${route.params.join("/")}`;

  useEffect(() => {
    document.title = titleFor(route.name);
    window.scrollTo({ top: 0, behavior: "auto" });
    if (route.name !== "exam") resetExamUi();
  }, [route.name, route.params]);

  /* Close drawer whenever the route changes */
  useEffect(() => {
    setDrawerOpen(false);
  }, [routeKey]);

  /* Drawer: overflow lock, Escape, focus trap, resize */
  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>("a[href], button:not([disabled])")?.focus();
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        menuBtnRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const items = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onResize = () => {
      if (window.innerWidth > 860) setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [drawerOpen]);

  /* Keep the daily rollover fresh if the app stays open past midnight */
  useEffect(() => {
    const id = window.setInterval(() => {
      const before = Store.state.today.date;
      Store.rollToday();
      if (Store.state.today.date !== before) Store.save();
    }, 60000);
    return () => window.clearInterval(id);
  }, []);

  const closeDrawer = (restoreFocus = true) => {
    setDrawerOpen(false);
    if (restoreFocus) menuBtnRef.current?.focus();
  };

  const tip =
    (state.streak || 0) >= 7
      ? `🔥 ${state.streak}日連続学習中。この習慣を大切に。`
      : TIPS[new Date().getDate() % TIPS.length];

  return (
    <ConfirmProvider>
      <AppContext.Provider value={api}>
        <a className="skip-link" href="#view">
          本文へスキップ
        </a>

        <div className="app" id="app">
          <header className="topbar" id="topbar">
            <div className="topbar__left">
              <button
                ref={menuBtnRef}
                className="icon-btn menu-btn"
                id="menuBtn"
                type="button"
                aria-label="メニューを開く"
                aria-expanded={drawerOpen}
                aria-controls="drawer"
                onClick={() => setDrawerOpen((open) => !open)}
              >
                <span className="hamburger" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </button>
              <a className="brand" href="#/" aria-label="EikenQuest ホーム">
                <span className="brand__mark" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M24 3.5 42 13v22L24 44.5 6 35V13L24 3.5Z" stroke="url(#bg1)" strokeWidth="2.6" />
                    <path d="M15 19h18M15 25h12M15 31h15" stroke="url(#bg2)" strokeWidth="2.6" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="bg1" x1="6" y1="4" x2="42" y2="44">
                        <stop stopColor="#6366f1" />
                        <stop offset="1" stopColor="#14b8a6" />
                      </linearGradient>
                      <linearGradient id="bg2" x1="15" y1="19" x2="33" y2="31">
                        <stop stopColor="#818cf8" />
                        <stop offset="1" stopColor="#2dd4bf" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span className="brand__text">
                  Eiken<span>Quest</span>
                </span>
              </a>
            </div>

            <div className="topbar__right">
              <button
                className="grade-chip"
                id="gradeChip"
                type="button"
                aria-label={`${fullLabel}を学習中。クリックして級を変更`}
                title={`${fullLabel}を学習中`}
                onClick={() => setGradePickerOpen(true)}
              >
                <span
                  className="grade-chip__dot"
                  id="gradeDot"
                  style={{ background: info ? info.color : "linear-gradient(135deg,#6366f1,#14b8a6)" }}
                />
                <span id="gradeChipLabel">{label}</span>
                <Icon name="down" size={14} />
              </button>
              <div className="chip streak-chip" id="topStreak" title="連続学習日数">
                <span className="chip__icon">🔥</span>
                <span id="topStreakVal">{state.streak || 0}</span>
              </div>
              <div className="chip xp-chip" id="topXp" title="総XP">
                <span className="chip__icon">⚡</span>
                <span id="topXpVal">{Number(state.xp || 0).toLocaleString()}</span>
                <span className="chip__unit">XP</span>
              </div>
              <a
                className="icon-btn sync-indicator-btn"
                href="#/settings"
                title={
                  syncInfo.syncKey
                    ? syncInfo.status === "syncing"
                      ? "クラウド同期中..."
                      : `クラウド自動同期中（キー: ${syncInfo.syncKey}）`
                    : "クラウド自動同期（クリックして設定）"
                }
                aria-label="クラウド自動同期"
                id="topSync"
              >
                <Icon name="cloud" size={19} className={syncInfo.status === "syncing" ? "pulse" : ""} />
                {syncInfo.syncKey && (
                  <span
                    className={`sync-indicator-dot ${
                      syncInfo.status === "syncing"
                        ? "is-syncing"
                        : syncInfo.status === "error"
                        ? "is-error"
                        : "is-synced"
                    }`}
                  />
                )}
              </a>
              <a className="icon-btn" href="#/settings" aria-label="設定" id="topSettings">
                <Icon name="settings" size={20} />
              </a>
            </div>
          </header>

          <div className="scrim" id="scrim" hidden={!drawerOpen} onClick={() => closeDrawer(false)} />

          <aside
            ref={drawerRef}
            className={`drawer ${drawerOpen ? "is-open" : ""}`}
            id="drawer"
            aria-label="サイト内メニュー"
            aria-hidden={!drawerOpen}
          >
            <div className="drawer__head">
              <div className="drawer__hello" id="drawerHello">
                {`${state.profile.name || "学習者"}さん、こんにちは`}
              </div>
              <button className="icon-btn drawer__close" id="drawerClose" type="button" aria-label="メニューを閉じる" onClick={() => closeDrawer()}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <a
              className="drawer__grade"
              href="#/settings"
              id="drawerGrade"
              title={`${fullLabel}を変更`}
              aria-label={`学習する級を変更。現在は${fullLabel}`}
              onClick={(e) => {
                e.preventDefault();
                closeDrawer(false);
                setGradePickerOpen(true);
              }}
            >
              <div>
                <div className="drawer__grade-label">学習中の級</div>
                <div className="drawer__grade-value">
                  <span id="drawerGradeName">{label}</span>{" "}
                  <span id="drawerGradeCefr">{gradeId === "all" ? "ALL" : info?.cefr ?? "—"}</span>
                </div>
              </div>
              <span className="drawer__grade-chevron" aria-hidden="true">
                ›
              </span>
            </a>

            <nav className="drawer__nav">
              <div className="drawer__section-label">学ぶ</div>
              {NAV_ITEMS.filter((item) => item.group === "learn").map((item) => (
                <DrawerLink key={item.name} item={item} active={route.name === item.name} onNavigate={() => closeDrawer(false)} />
              ))}
              <div className="drawer__section-label">試験対策</div>
              {NAV_ITEMS.filter((item) => item.group === "exam").map((item) => (
                <DrawerLink key={item.name} item={item} active={route.name === item.name} onNavigate={() => closeDrawer(false)} />
              ))}
              <div className="drawer__section-label">ツール</div>
              {NAV_ITEMS.filter((item) => item.group === "tool").map((item) => (
                <DrawerLink key={item.name} item={item} active={route.name === item.name} onNavigate={() => closeDrawer(false)} />
              ))}
            </nav>

            <div className="drawer__foot">
              <div className="drawer__tip" id="drawerTip">
                {tip}
              </div>
              <a
                className="drawer__sync-status"
                href="#/settings"
                onClick={() => closeDrawer(false)}
                title="クラウド同期設定"
              >
                <span
                  className={`sync-indicator-dot ${
                    syncInfo.syncKey ? (syncInfo.status === "syncing" ? "is-syncing" : "is-synced") : "is-off"
                  }`}
                />
                <span className="tiny">
                  {syncInfo.syncKey ? `クラウド同期: ${syncInfo.syncKey}` : "☁️ クラウド自動同期を設定"}
                </span>
              </a>
              <div className="drawer__ver">EikenQuest v{APP_VERSION}</div>
            </div>
          </aside>

          <main className="view" id="view" tabIndex={-1}>
            {quiz ? <Quiz config={quiz} onClose={api.closeQuiz} /> : pageFor(route.name, route.params)}
          </main>

          <nav className="tabbar" aria-label="クイックナビ">
            <a href="#/" data-nav="home" className={route.name === "home" ? "is-active" : ""}>
              <span>◎</span>
              <small>ホーム</small>
            </a>
            <a href="#/vocab" data-nav="vocab" className={route.name === "vocab" ? "is-active" : ""}>
              <span>Aa</span>
              <small>単語</small>
            </a>
            <a href="#/grammar" data-nav="grammar" className={route.name === "grammar" ? "is-active" : ""}>
              <span>✎</span>
              <small>文法</small>
            </a>
            <a href="#/clock" data-nav="clock" className={route.name === "clock" ? "is-active" : ""}>
              <span>◷</span>
              <small>時計</small>
            </a>
            <a href="#/progress" data-nav="progress" className={route.name === "progress" ? "is-active" : ""}>
              <span>▲</span>
              <small>記録</small>
            </a>
          </nav>
        </div>

        {gradePickerOpen ? <GradePicker current={gradeId} onClose={() => setGradePickerOpen(false)} /> : null}
        <ToastHost />
        <canvas id="confetti" className="confetti-canvas" aria-hidden="true" />
      </AppContext.Provider>
    </ConfirmProvider>
  );
}

function DrawerLink({
  item,
  active,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <a
      className={`drawer__link ${active ? "is-active" : ""}`}
      href={item.href}
      data-nav={item.name}
      onClick={onNavigate}
    >
      <span className="drawer__icon">{item.icon}</span>
      {item.label}
    </a>
  );
}

export { ROUTES };
