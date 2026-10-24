import type { CSSProperties, ReactNode } from "react";
import type { QuizRecord, QuizType } from "../types";
import { EQ_GRAMMAR } from "../data/grammar";
import { DICTATION_ITEMS } from "../data/dictation";
import { WRITING_TOPICS } from "../data/writing";
import { useStore } from "../lib/useStore";
import { Store } from "../lib/store";
import { fmtShortDate } from "../lib/format";
import { Icon } from "../components/Icon";
import { GradeBadge, Progress, Ring } from "../components/Bits";

interface TypeMeta {
  label: string;
  icon: string;
  color: string;
  bg: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  vocab: { label: "単語", icon: "Aa", color: "#6366f1", bg: "#eef2ff" },
  grammar: { label: "文法", icon: "✎", color: "#0d9488", bg: "#ccfbf1" },
  reading: { label: "読解", icon: "📖", color: "#d97706", bg: "#fef3c7" },
  listening: { label: "聴解", icon: "🎧", color: "#db2777", bg: "#fdf2f8" },
  mock: { label: "模試", icon: "⏱", color: "#7c3aed", bg: "#f5f0ff" },
  mixed: { label: "総合", icon: "◎", color: "#0284c7", bg: "#eff6ff" },
};

function metaFor(type: string): TypeMeta {
  return (
    TYPE_META[type] || {
      label: type || "学習",
      icon: "✎",
      color: "var(--accent)",
      bg: "var(--accent-soft)",
    }
  );
}

function accuracy(type: QuizType): { pct: number; count: number; score: number; total: number } {
  const list = Store.state.quizHistory.filter((h) => h.type === type && (h.total || 0) > 0);
  if (!list.length) return { pct: 0, count: 0, score: 0, total: 0 };
  const total = list.reduce((a, h) => a + (h.total || 0), 0);
  const score = list.reduce((a, h) => a + (h.score || 0), 0);
  return { pct: total ? Math.round((score / total) * 100) : 0, count: list.length, score, total };
}

function Heatmap() {
  const days = Store.lastNDays(28);
  const goal = Store.state.settings.dailyGoal || 50;
  const max = Math.max(goal, ...days.map((d) => d.xp), 1);
  const columns: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

  return (
    <>
      <div className="heatmap" role="img" aria-label="直近28日の学習量">
        {columns.map((col, ci) => (
          <div className="heatmap__col" key={ci}>
            {col.map((d) => {
              const level =
                d.xp <= 0 ? 0 : d.xp >= max ? 4 : d.xp >= max * 0.66 ? 3 : d.xp >= max * 0.33 ? 2 : 1;
              const label = `${fmtShortDate(d.date)}：${d.xp} XP`;
              return (
                <span
                  className="heatmap__cell"
                  key={d.date}
                  data-l={level}
                  title={label}
                  aria-label={label}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="heatmap__legend">
        <span>少</span>
        <i data-l="0" style={{ background: "var(--surface-3)" }} />
        <i style={{ background: "color-mix(in srgb, var(--accent) 22%, var(--surface-3))" }} />
        <i style={{ background: "color-mix(in srgb, var(--accent) 45%, var(--surface-3))" }} />
        <i style={{ background: "color-mix(in srgb, var(--accent) 70%, var(--surface-3))" }} />
        <i style={{ background: "var(--accent)" }} />
        <span>多</span>
      </div>
    </>
  );
}

function WeekChart() {
  const week = Store.lastNDays(7);
  const max = Math.max(20, ...week.map((d) => d.xp));
  const todayK = Store.todayKey();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="week-chart">
      {week.map((d) => {
        const h = Math.max(4, Math.round((d.xp / max) * 100));
        const dt = new Date(`${d.date}T00:00:00`);
        const today = d.date === todayK;
        return (
          <div className="week-chart__col" title={`${d.date}：${d.xp} XP`} key={d.date}>
            <span className="week-chart__val">{d.xp ? d.xp : ""}</span>
            <div
              className={`week-chart__bar ${today ? "is-today" : ""}`}
              style={{ height: `${h}%` }}
              data-zero={d.xp ? 0 : 1}
            />
            <span className={`week-chart__day ${today ? "is-today" : ""}`}>{weekdays[dt.getDay()]}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: string;
  tone: string;
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="stat">
      <span className={`stat__icon stat__icon--${tone}`}>{icon}</span>
      <div>
        <div className="stat__value">{value}</div>
        <div className="stat__label">{label}</div>
        {sub ? <div className="tiny muted">{sub}</div> : null}
      </div>
    </div>
  );
}

function SkillRow({ label, detail, pct }: { label: string; detail: string; pct: number }) {
  return (
    <div className="skill-row">
      <div className="skill-row__head">
        <span>{label}</span>
        <span>{detail}</span>
      </div>
      <Progress pct={pct} />
    </div>
  );
}

function HistoryRow({ item }: { item: QuizRecord }) {
  const meta = metaFor(item.type);
  const total = item.total || 0;
  const pct = total ? Math.round(((item.score || 0) / total) * 100) : 0;
  const d = new Date(item.ts || Date.now());
  const when = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="history-row">
      <span
        className="history-row__icon"
        style={{ background: meta.bg, color: meta.color } as CSSProperties}
      >
        {meta.icon}
      </span>
      <div className="history-row__body">
        <div className="history-row__title">{item.title || meta.label}</div>
        <div className="tiny muted">
          {when} · {meta.label} · {total}問{item.xp ? ` · +${item.xp} XP` : ""}
        </div>
      </div>
      <div className="history-row__score">
        <b>
          {item.score || 0}/{total}
        </b>
        <span className={`pill ${pct >= 70 ? "pill--success" : pct < 50 ? "pill--danger" : ""}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

export function ProgressPage() {
  const s = useStore();

  const lvl = Store.levelFromXp(s.xp || 0);
  const words = Store.wordStats();
  const grammarDone = Object.keys(s.grammarDone || {}).length;
  const grammarTotal = EQ_GRAMMAR.length;
  const grammarPct = grammarTotal ? Math.round((grammarDone / grammarTotal) * 100) : 0;
  const todayXp = Store.todayXp();
  const goal = s.settings.dailyGoal || 50;
  const goalPct = Math.min(100, Math.round((todayXp / goal) * 100));
  const badges = Store.badgeList();
  const earned = badges.filter((b) => b.earned).length;
  const history = (s.quizHistory || []).slice(0, 12);
  const focus = s.pomodoro || { completed: 0, focusMin: 0, log: [] };
  const todayFocus = (focus.log || [])
    .filter((l) => Store.todayKey(l.ts) === Store.todayKey())
    .reduce((a, b) => a + (b.min || 0), 0);
  const interviewEntries = Object.keys(s.interview || {}).filter(
    (g) => s.interview[g] && s.interview[g].attempts,
  );
  const vocabAcc = accuracy("vocab");
  const readAcc = accuracy("reading");
  const listenAcc = accuracy("listening");
  const mockAcc = accuracy("mock");
  const dictationDoneCount = Object.keys(s.dictationDone || {}).length;
  const dictationTotal = DICTATION_ITEMS.length;
  const dictationPct = dictationTotal ? Math.round((dictationDoneCount / dictationTotal) * 100) : 0;
  const writingCount = Object.keys(s.writingSaves || {}).length;
  const writingTotal = WRITING_TOPICS.length;
  const writingPct = writingTotal ? Math.min(100, Math.round((writingCount / writingTotal) * 100)) : 0;
  const masteryPct = words.seen ? Math.round((words.mastered / words.seen) * 100) : 0;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow">Progress</div>
            <h1>学習記録</h1>
            <p>毎日の積み上げを、見える形に。XP・連続記録・単語の定着・バッジをまとめて確認できます。</p>
          </div>
          <div className="row row--wrap">
            <a className="btn btn--outline btn--sm" href="#/exam">
              1次試験へ
            </a>
            <a className="btn btn--primary btn--sm" href="#/vocab">
              <Icon name="play" size={15} />
              単語を復習
            </a>
          </div>
        </div>
      </div>

      <section className="progress-hero">
        <Ring pct={lvl.pct} value={`Lv.${lvl.level}`} label="LEVEL" />
        <div className="progress-hero__body">
          <div className="progress-hero__rank">
            {lvl.title} · {lvl.rankJp}
          </div>
          <div className="progress-hero__title">{s.profile.name || "学習者"}さんの現在地</div>
          <div className="progress-hero__meta">
            {(s.xp || 0).toLocaleString()} XP · 次のレベルまで {Math.max(0, lvl.need - lvl.current)} XP
          </div>
          <Progress pct={lvl.pct} />
          <div className="row row--wrap" style={{ marginTop: 14, gap: 8 }}>
            <span className="pill">🔥 {s.streak || 0}日連続</span>
            <span className="pill pill--success">
              今日 {todayXp} / {goal} XP
            </span>
            <span className="pill pill--accent">
              {earned} / {badges.length} バッジ
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid--4 grid--tight" style={{ marginBottom: 22 }}>
        <StatCard
          icon="⚡"
          tone="warn"
          label="総XP"
          value={(s.xp || 0).toLocaleString()}
          sub={`最高 ${s.bestStreak || 0}日連続`}
        />
        <StatCard icon="🔥" tone="warn" label="連続学習" value={`${s.streak || 0}日`} sub={`今日 ${todayXp} XP`} />
        <StatCard icon="📚" tone="teal" label="学習した単語" value={words.seen} sub={`${words.mastered}語を習得`} />
        <StatCard icon="✓" tone="pink" label="完了した文法" value={grammarDone} sub={`${grammarTotal}テーマ中`} />
      </div>

      <div className="grid progress-cols" style={{ marginBottom: 22 }}>
        <section className="card card--pad">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="calendar" size={18} /> 直近28日
              </div>
              <div className="card__sub">色が濃いほど、その日に獲得したXPが多い日です</div>
            </div>
            <span className="pill pill--accent">今日 {goalPct}%</span>
          </div>
          <Heatmap />
          <div className="callout callout--teal" style={{ marginTop: 12, fontSize: ".78rem" }}>
            <span className="callout__icon">💡</span>
            <span>
              {(s.streak || 0) >= 3
                ? "連続記録が伸びています。今日も1問だけでも続けましょう。"
                : "まずは毎日1問。小さな習慣が、合格への最短ルートです。"}
            </span>
          </div>
        </section>
        <section className="card card--pad">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="chart" size={18} /> 今週の学習
              </div>
              <div className="card__sub">合計 {Store.weeklyXp()} XP</div>
            </div>
          </div>
          <WeekChart />
          <div className="progress-hero__meta" style={{ marginTop: 14 }}>
            1日の目標：{goal} XP · 今日の達成度 {goalPct}%
          </div>
        </section>
      </div>

      <div className="grid progress-cols" style={{ marginBottom: 22 }}>
        <section className="card card--pad">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="target" size={18} /> 分野別の定着度
              </div>
              <div className="card__sub">クイズの正答率と学習済みの割合から算出</div>
            </div>
          </div>
          <SkillRow label="単語の習得率" detail={`${words.mastered} / ${words.seen}語`} pct={masteryPct} />
          <SkillRow
            label="文法テーマの完了"
            detail={`${grammarDone} / ${grammarTotal}テーマ`}
            pct={grammarPct}
          />
          <SkillRow
            label="ディクテーション特訓"
            detail={`${dictationDoneCount} / ${dictationTotal}問クリア`}
            pct={dictationPct}
          />
          <SkillRow
            label="英作文・要約作成"
            detail={`${writingCount} / ${writingTotal}題保存`}
            pct={writingPct}
          />
          <SkillRow
            label="単語クイズの正答率"
            detail={vocabAcc.count ? `${vocabAcc.count}回 · ${vocabAcc.score}/${vocabAcc.total}` : "まだ記録なし"}
            pct={vocabAcc.pct}
          />
          <SkillRow
            label="読解の正答率"
            detail={readAcc.count ? `${readAcc.count}回 · ${readAcc.score}/${readAcc.total}` : "まだ記録なし"}
            pct={readAcc.pct}
          />
          <SkillRow
            label="リスニングの正答率"
            detail={listenAcc.count ? `${listenAcc.count}回 · ${listenAcc.score}/${listenAcc.total}` : "まだ記録なし"}
            pct={listenAcc.pct}
          />
          <SkillRow
            label="ミニ模試の正答率"
            detail={mockAcc.count ? `${mockAcc.count}回 · ${mockAcc.score}/${mockAcc.total}` : "まだ記録なし"}
            pct={mockAcc.pct}
          />
        </section>

        <section className="card card--pad">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="timer" size={18} /> 集中タイム
              </div>
              <div className="card__sub">ポモドーロとタイマーの記録</div>
            </div>
            <a className="link" href="#/clock" style={{ fontSize: ".78rem" }}>
              時計へ
            </a>
          </div>
          <div className="mini-stats" style={{ marginBottom: 16 }}>
            <div className="stat" style={{ padding: "12px 14px", border: 0, background: "var(--surface-2)" }}>
              <div>
                <div className="stat__value" style={{ fontSize: "1.15rem" }}>
                  {todayFocus}
                </div>
                <div className="stat__label">今日の集中（分）</div>
              </div>
            </div>
            <div className="stat" style={{ padding: "12px 14px", border: 0, background: "var(--surface-2)" }}>
              <div>
                <div className="stat__value" style={{ fontSize: "1.15rem" }}>
                  {focus.completed || 0}
                </div>
                <div className="stat__label">完了セッション</div>
              </div>
            </div>
            <div className="stat" style={{ padding: "12px 14px", border: 0, background: "var(--surface-2)" }}>
              <div>
                <div className="stat__value" style={{ fontSize: "1.15rem" }}>
                  {focus.focusMin || 0}
                </div>
                <div className="stat__label">累計集中（分）</div>
              </div>
            </div>
          </div>
          <div className="divider" style={{ marginBottom: 14 }} />
          <div className="row row--between" style={{ marginBottom: 10 }}>
            <div className="card__title" style={{ fontSize: ".9rem" }}>
              <Icon name="mic" size={17} /> 面接練習
            </div>
            <span className="pill">
              {interviewEntries.length ? `${interviewEntries.length}級で記録` : "未挑戦"}
            </span>
          </div>
          {interviewEntries.length ? (
            interviewEntries.map((g) => {
              const rec = s.interview[g];
              return (
                <div
                  className="row row--between"
                  key={g}
                  style={{ padding: "8px 0", borderBottom: "1px dashed var(--border)", gap: 8 }}
                >
                  <GradeBadge id={g} />
                  <span className="tiny muted" style={{ flex: 1 }}>
                    {rec.attempts}回 · ベスト {rec.best || 0}/100
                  </span>
                  <a className="btn btn--ghost btn--sm" href="#/interview">
                    練習
                  </a>
                </div>
              );
            })
          ) : (
            <div className="empty" style={{ padding: "8px 0" }}>
              <p className="tiny muted" style={{ margin: "0 0 10px" }}>
                面接シミュレーションで、話す力も記録しましょう。
              </p>
              <a className="btn btn--soft btn--sm" href="#/interview">
                面接練習を始める
              </a>
            </div>
          )}
        </section>
      </div>

      <section className="card card--pad" style={{ marginBottom: 22 }}>
        <div className="card__head">
          <div>
            <div className="card__title">
              <Icon name="trophy" size={18} /> バッジ
            </div>
            <div className="card__sub">
              {earned} / {badges.length} 個を獲得。学習を続けるほど増えていきます。
            </div>
          </div>
          <span className={`pill ${earned === badges.length ? "pill--success" : "pill--accent"}`}>
            {Math.round((earned / badges.length) * 100)}%
          </span>
        </div>
        <div className="badge-grid">
          {badges.map((b) => (
            <div className={`badge-card ${b.earned ? "is-earned" : ""}`} key={b.id}>
              <div className="badge-card__icon">{b.icon}</div>
              <div className="badge-card__name">{b.name}</div>
              <div className="badge-card__desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card card--pad" style={{ marginBottom: 18 }}>
        <div className="card__head">
          <div>
            <div className="card__title">
              <Icon name="note" size={18} /> 最近のクイズ
            </div>
            <div className="card__sub">直近12件 · スコアと獲得XP</div>
          </div>
          <a className="link" href="#/exam" style={{ fontSize: ".78rem" }}>
            もっと挑戦する
          </a>
        </div>
        {history.length ? (
          history.map((h, i) => <HistoryRow item={h} key={`${h.ts}-${i}`} />)
        ) : (
          <div className="empty">
            <div className="empty__icon">🌱</div>
            <h3>まだ記録がありません</h3>
            <p>単語クイズか文法レッスンから始めると、ここに履歴が残ります。</p>
            <a className="btn btn--primary" href="#/vocab">
              最初のクイズへ
            </a>
          </div>
        )}
      </section>

      <div className="callout">
        <span className="callout__icon">🎯</span>
        <span>
          <b>記録は裏切りません。</b> 今日の {goal} XP まであと {Math.max(0, goal - todayXp)} XP。10問の単語クイズなら約3分で達成できます。
        </span>
      </div>
    </div>
  );
}
