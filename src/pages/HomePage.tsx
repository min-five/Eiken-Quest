import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useStore } from "../lib/useStore";
import { Store, todayKey } from "../lib/store";
import { useApp } from "../lib/app-context";
import { gradeLabel, greeting } from "../lib/format";
import { poolForGrade, pickVocab, buildVocabQuestions } from "../lib/quiz-data";
import { EQ_GRAMMAR } from "../data/grammar";
import { EQ_GRADE_MAP } from "../data/vocabulary";
import { sfx, speak, toast } from "../lib/ui";
import { Icon } from "../components/Icon";
import { Progress, Ring } from "../components/Bits";
import { useIsNarrow } from "../lib/useMedia";

interface QuickDef {
  key: "vocab" | "grammar" | "exam" | "interview";
  icon: string;
  color: string;
  title: string;
  desc: string;
  sub: string;
  tag: string;
  meta: string;
}

export function HomePage() {
  const state = useStore();
  const api = useApp();
  const narrow = useIsNarrow(860);
  const [known, setKnown] = useState(false);

  const gradeId = state.profile.grade;
  const level = Store.levelFromXp(state.xp);
  const dailyXp = Store.todayXp();
  const goal = state.settings.dailyGoal || 50;
  const goalPct = Math.min(100, Math.round((dailyXp / goal) * 100));
  const words = Store.wordStats();
  const doneTopics = Object.keys(state.grammarDone).length;
  const studiedToday = state.lastStudy === todayKey();
  const week = Store.lastNDays(7);
  const maxWeek = Math.max(20, ...week.map((d) => d.xp));
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const today = todayKey();

  const pool = poolForGrade(gradeId);
  const dayIndex = Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
  const wotd = pool.length ? pool[dayIndex % pool.length] : null;

  const recentTopics = Object.keys(state.grammarRead)
    .map((id) => ({ id, ts: state.grammarRead[id], topic: EQ_GRAMMAR.find((t) => t.id === id) }))
    .filter((x): x is { id: string; ts: number; topic: (typeof EQ_GRAMMAR)[number] } => !!x.topic)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 3);

  const nextTopic = EQ_GRAMMAR.find((t) => (gradeId === "all" || t.grade === gradeId) && !state.grammarDone[t.id]);

  const hour = new Date().getHours();
  const timeWord = hour < 11 ? "朝" : hour < 18 ? "昼" : "夜";
  const isSpeakingTest = gradeId === "5" || gradeId === "4";

  useEffect(() => {
    setKnown(false);
  }, [wotd?.w]);

  const startVocabQuiz = () => {
    sfx("click");
    const list = pickVocab(gradeId, 10);
    api.startQuiz({
      title: `${gradeLabel(gradeId)} 単語クイズ`,
      questions: buildVocabQuestions(list, "mix", gradeId === "all" ? undefined : gradeId),
      grade: gradeId,
      type: "vocab",
      backLabel: "ホームに戻る",
    });
  };

  const quickCards: QuickDef[] = [
    {
      key: "vocab",
      icon: "Aa",
      color: "#6366f1",
      title: "単語クイズ",
      desc: "10問・約3分",
      sub: "間隔反復で記憶に定着",
      tag: "単語",
      meta: "10問",
    },
    {
      key: "grammar",
      icon: "✎",
      color: "#14b8a6",
      title: "文法レッスン",
      desc: "ジャンル別に学ぶ",
      sub: "解説 → 例文 → ミニクイズ",
      tag: "文法",
      meta: `${doneTopics}完了`,
    },
    {
      key: "exam",
      icon: "✎",
      color: "#f59e0b",
      title: "1次試験対策",
      desc: "単語・文法・読解・聴解",
      sub: "本番形式のミニ模試も",
      tag: "1次",
      meta: "4モード",
    },
    {
      key: "interview",
      icon: "🎤",
      color: "#ec4899",
      title: isSpeakingTest ? "スピーキングテスト" : "2次試験（面接）",
      desc: isSpeakingTest ? "音読 → パッセージQ&A" : "音読 → Q&A → 意見",
      sub: "本番の流れをシミュレーション",
      tag: isSpeakingTest ? "録音型" : "面接",
      meta: isSpeakingTest ? "5・4級対応" : "全級対応",
    },
  ];

  const onQuick = (key: QuickDef["key"]) => {
    sfx("click");
    if (key === "vocab") startVocabQuiz();
    else if (key === "grammar") window.location.hash = "#/grammar";
    else if (key === "exam") window.location.hash = "#/exam";
    else window.location.hash = "#/interview";
  };

  const handleKnown = () => {
    if (!wotd) return;
    Store.recordWord(wotd.w, true);
    Store.addXp(5);
    Store.checkBadges();
    sfx("correct");
    toast("覚えました！ +5 XP", "xp");
    setKnown(true);
  };

  const splitStyle = { gridTemplateColumns: narrow ? "1fr" : "1.15fr .85fr" } as CSSProperties;

  return (
    <div className="page">
      <section className="hero anim-up">
        <div className="hero__inner">
          <div className="hero__main">
            <div className="hero__greeting">
              ✦ {greeting()}、{state.profile.name}さん
            </div>
            <h1>
              {timeWord}の{gradeId === "all" ? "英語" : ` ${labelOf(gradeId)}`}を、
              <br className="pc-only" />
              <span className="hl">{studiedToday ? "もう一歩" : "今日から"}伸ばそう。</span>
            </h1>
            <p className="hero__sub">
              {gradeId === "all" ? "5級から1級まで、あなたのペースで。" : descOf(gradeId)} 1次試験・
              {isSpeakingTest ? "スピーキングテスト" : "2次試験"}・単語・文法を、ひとつの場所で。
            </p>
            <div className="hero__actions">
              <button className="btn btn--primary btn--lg" type="button" onClick={startVocabQuiz}>
                <Icon name="play" size={18} />
                今日の10問をはじめる
              </button>
              <a className="btn btn--outline btn--lg" href="#/exam">
                <Icon name="exam" size={18} />
                試験対策へ
              </a>
            </div>
          </div>
          <div className="hero__panel">
            <Ring pct={level.pct} value={`Lv.${level.level}`} label="NEXT" />
            <div className="hero__panel-info">
              <span className="hero__panel-k">{level.title}</span>
              <span className="hero__panel-v">{state.xp.toLocaleString()} XP</span>
              <span className="hero__panel-s">次のレベルまで {level.need - level.current} XP</span>
              <span className="hero__fire">🔥 {state.streak || 0}日連続学習中</span>
            </div>
          </div>
        </div>
      </section>

      <section className="anim-up delay-1" style={{ marginBottom: 24 }}>
        <div className="section-head">
          <div>
            <h2>今日のメニュー</h2>
            <div className="section-head__sub">5分から始められる4つの入口</div>
          </div>
          <button
            className="link"
            type="button"
            style={{
              background: "none",
              border: 0,
              fontFamily: "inherit",
              fontSize: ".8rem",
              fontWeight: 800,
              color: "var(--accent)",
              cursor: "pointer",
            }}
            onClick={() => api.openGradePicker()}
          >
            級を変更
          </button>
        </div>
        <div className="grid grid--4">
          {quickCards.map((card) => (
            <button
              key={card.key}
              className="quick-card"
              type="button"
              style={{ "--qc": card.color } as CSSProperties}
              onClick={() => onQuick(card.key)}
            >
              <span className="quick-card__icon" aria-hidden="true">
                {card.icon}
              </span>
              <span className="quick-card__title">{card.title}</span>
              <span className="quick-card__desc">{card.desc}</span>
              <span className="quick-card__meta">
                <span>{card.sub}</span>
                <b>{card.meta}</b>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid" style={{ ...splitStyle, marginBottom: 24 }} id="homeMid">
        <section className="card card--pad anim-up delay-2">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="target" size={18} /> 今日の目標
              </div>
              <div className="card__sub">
                {studiedToday ? "今日はもう学習済み。あと少し伸ばしましょう。" : "まずは1問から。連続記録を守りましょう。"}
              </div>
            </div>
            <Ring pct={goalPct} value={`${goalPct}%`} label="TODAY" />
          </div>
          <div className="goal-card">
            <div className="goal-card__main">
              <div className="goal-card__title">
                {goalPct >= 100 ? "🎉 目標達成！" : `あと ${Math.max(0, goal - dailyXp)} XP`}
              </div>
              <div className="goal-card__nums">
                <b>{dailyXp}</b> / {goal} XP
              </div>
              <Progress pct={goalPct} />
            </div>
          </div>
          <div className="row row--between" style={{ marginTop: 18, gap: 8 }}>
            <MiniStat icon="🔥" tone="warn" value={state.streak || 0} label="連続日数" />
            <MiniStat icon="Aa" tone="teal" value={words.seen} label="学習した単語" />
            <MiniStat icon="✓" tone="pink" value={doneTopics} label="文法テーマ" />
          </div>
        </section>

        <section className="card card--pad anim-up delay-3">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="chart" size={18} /> 今週の学習
              </div>
              <div className="card__sub">合計 {Store.weeklyXp()} XP</div>
            </div>
          </div>
          <div className="week-chart">
            {week.map((d) => {
              const height = Math.max(4, Math.round((d.xp / maxWeek) * 100));
              const dt = new Date(`${d.date}T00:00:00`);
              const isToday = d.date === today;
              return (
                <div className="week-chart__col" key={d.date} title={`${d.date}：${d.xp} XP`}>
                  <span className="week-chart__val">{d.xp ? d.xp : ""}</span>
                  <div
                    className={`week-chart__bar ${isToday ? "is-today" : ""}`}
                    style={{ height: `${height}%` }}
                    data-zero={d.xp ? 0 : 1}
                  />
                  <span className={`week-chart__day ${isToday ? "is-today" : ""}`}>{weekdays[dt.getDay()]}</span>
                </div>
              );
            })}
          </div>
          <div className="callout callout--teal" style={{ marginTop: 16, fontSize: ".78rem" }}>
            <span className="callout__icon">💡</span>
            <span>
              {Store.weeklyXp() >= 100
                ? "いいペースです。この調子で続けましょう。"
                : "まずは1日10分。短い時間の積み重ねが合格につながります。"}
            </span>
          </div>
        </section>
      </div>

      <div className="grid" style={{ ...splitStyle, marginBottom: 24 }} id="homeBottom">
        {wotd ? (
          <section className="card card--pad anim-up delay-4">
            <div className="card__head">
              <div>
                <div className="card__title">
                  <Icon name="star" size={18} /> 今日の単語
                </div>
                <div className="card__sub">{gradeLabel(wotd.grade)} の1語</div>
              </div>
              <button className="speak-btn" type="button" onClick={() => speak(wotd.w)}>
                <Icon name="volume" size={15} /> 発音
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.25 }}>{wotd.w}</div>
                <div className="pill" style={{ marginTop: 4 }}>
                  {wotd.p}
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 10 }}>{wotd.m}</div>
                <div className="vocab-detail__ex" style={{ marginTop: 12, marginBottom: 0 }}>
                  <div className="en">{wotd.e}</div>
                  <div className="ja">{wotd.ej}</div>
                </div>
              </div>
              <div className="stack--sm" style={{ display: "flex", flexDirection: "column", gap: 8, flex: "none" }}>
                <button className="btn btn--soft btn--sm" type="button" disabled={known} onClick={handleKnown}>
                  <Icon name="check" size={15} /> {known ? "覚えた！" : "覚えた"}
                </button>
                <a className="btn btn--outline btn--sm" href="#/vocab">
                  単語帳へ
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section className="card card--pad anim-up delay-5">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="sparkle" size={18} /> 次にやること
              </div>
              <div className="card__sub">あなたの進捗から提案</div>
            </div>
          </div>
          <div className="recommend-list">
            {recentTopics.length > 0 ? (
              recentTopics.map((r) => (
                <a className="recommend-item" href={`#/grammar/${r.topic.id}`} key={r.id}>
                  <span className="recommend-item__icon">✎</span>
                  <span className="recommend-item__body">
                    <span className="recommend-item__title">{r.topic.title}</span>
                    <span className="recommend-item__sub">{r.topic.genreName} · 続きから</span>
                  </span>
                  <span className="recommend-item__go">→</span>
                </a>
              ))
            ) : (
              <div className="empty" style={{ padding: "16px 8px" }}>
                <div className="empty__icon">🌱</div>
                <p style={{ fontSize: ".8rem", marginBottom: 0 }}>
                  まだ学習履歴がありません。
                  <br />
                  下のボタンから始めましょう。
                </p>
              </div>
            )}
            {nextTopic ? (
              <a className="recommend-item" href={`#/grammar/${nextTopic.id}`}>
                <span
                  className="recommend-item__icon"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Icon name="arrow" size={15} />
                </span>
                <span className="recommend-item__body">
                  <span className="recommend-item__title">{nextTopic.title}</span>
                  <span className="recommend-item__sub">おすすめの次のレッスン</span>
                </span>
                <span className="recommend-item__go">→</span>
              </a>
            ) : null}
            <a className="recommend-item" href="#/clock">
              <span className="recommend-item__icon">◷</span>
              <span className="recommend-item__body">
                <span className="recommend-item__title">ポモドーロで集中する</span>
                <span className="recommend-item__sub">25分勉強 + 5分休憩</span>
              </span>
              <span className="recommend-item__go">→</span>
            </a>
          </div>
        </section>
      </div>

      <div className="callout anim-up delay-6" style={{ marginBottom: 8 }}>
        <span className="callout__icon">🎯</span>
        <span>
          <b>合格への近道は、毎日少しずつ。</b> 1問でも解けば連続記録が伸びます。今日の目標は {goal} XP。まずは10問クイズから始めてみましょう。
        </span>
      </div>
    </div>
  );
}

function labelOf(grade: string): string {
  if (grade === "all") return "英語";
  return EQ_GRADE_MAP[grade as keyof typeof EQ_GRADE_MAP]?.name ?? grade;
}

function descOf(grade: string): string {
  if (grade === "all") return "";
  return EQ_GRADE_MAP[grade as keyof typeof EQ_GRADE_MAP]?.desc ?? "";
}

function MiniStat({ icon, tone, value, label }: { icon: string; tone: string; value: number; label: string }) {
  return (
    <div className="stat" style={{ flex: 1, padding: "12px 14px", border: 0, background: "var(--surface-2)" }}>
      <span className={`stat__icon stat__icon--${tone}`} style={{ width: 34, height: 34, fontSize: ".95rem" }}>
        {icon}
      </span>
      <div>
        <div className="stat__value" style={{ fontSize: "1.1rem" }}>
          {value}
        </div>
        <div className="stat__label">{label}</div>
      </div>
    </div>
  );
}
