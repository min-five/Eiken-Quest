import { useEffect, useState } from "react";
import type { GradeFilter, GradeId, InterviewSet } from "../types";
import { EQ_EXAM_INFO, EQ_INTERVIEW } from "../data/exam";
import { EQ_GRADES } from "../data/vocabulary";
import { useStore } from "../lib/useStore";
import { Store } from "../lib/store";
import { gradeOf } from "../lib/format";
import { confetti, sfx, speak, toast } from "../lib/ui";
import { confirmDialog } from "../components/ConfirmProvider";
import { Icon } from "../components/Icon";
import { GradeBadge, Stars } from "../components/Bits";

type StepKey = "intro" | "read" | "qa" | "opinion" | "speech" | "wrap";

interface IvUi {
  mode: "hub" | "sim";
  grade: GradeId | null;
  step: number;
  qaIndex: number;
  revealed: boolean;
  rating: number;
  notes: string;
  speechPick: number;
  lastProfileGrade: GradeFilter | null;
}

const ivUi: IvUi = {
  mode: "hub",
  grade: null,
  step: 0,
  qaIndex: 0,
  revealed: false,
  rating: 0,
  notes: "",
  speechPick: 0,
  lastProfileGrade: null,
};

const STEP_LABELS: Record<StepKey, string> = {
  intro: "あいさつ",
  read: "音読",
  qa: "Q&A",
  opinion: "意見",
  speech: "スピーチ",
  wrap: "振り返り",
};

function stepsFor(d: InterviewSet): StepKey[] {
  const steps: StepKey[] = ["intro"];
  if (d.hasReading) steps.push("read");
  steps.push("qa");
  if (d.opinion) steps.push("opinion");
  if (d.speechTopics) steps.push("speech");
  steps.push("wrap");
  return steps;
}

function fmt(sec: number): string {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function stepDesc(step: StepKey, d: InterviewSet): string {
  const recorded = d.grade === "5" || d.grade === "4";
  if (step === "intro") return recorded ? "テスト開始 → マイクの確認" : "入室 → あいさつ → 名前と級の確認";
  if (step === "read") return recorded ? "短いパッセージを音読" : "20秒の黙読 → 音読（約45秒）";
  if (step === "qa") return `${d.qa.length}つの質問に答える`;
  if (step === "opinion") return "自分の意見 + 理由を2つ";
  if (step === "speech") return "5つのテーマから1つ選び、2分スピーチ";
  return "";
}

interface Countdown {
  slot: "count" | "readcount";
  left: number;
  total: number;
  doneMsg: string;
  tone: "info" | "success";
}

export function InterviewPage() {
  const state = useStore();
  const profileGrade = state.profile.grade;

  const [ui, setUi] = useState<IvUi>(() => {
    if (!ivUi.grade) ivUi.grade = (profileGrade !== "all" ? profileGrade : "3") as GradeId;
    return { ...ivUi };
  });
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [readStarted, setReadStarted] = useState(false);

  const commit = (patch: Partial<IvUi>) => {
    Object.assign(ivUi, patch);
    setUi({ ...ivUi });
  };

  /* Reset the flow when the profile grade changes elsewhere. */
  useEffect(() => {
    if (ivUi.lastProfileGrade !== null && profileGrade !== ivUi.lastProfileGrade) {
      Object.assign(ivUi, {
        grade: profileGrade === "all" ? null : (profileGrade as GradeId),
        mode: "hub",
        step: 0,
        qaIndex: 0,
        revealed: false,
        rating: 0,
        notes: "",
        speechPick: 0,
      });
      setUi({ ...ivUi });
      setCountdown(null);
      setReadStarted(false);
    }
    ivUi.lastProfileGrade = profileGrade;
  }, [profileGrade]);

  /* Countdown ticker. */
  useEffect(() => {
    if (!countdown || countdown.left <= 0) return;
    const id = window.setInterval(() => {
      setCountdown((current) =>
        current ? { ...current, left: Math.max(0, current.left - 1) } : current,
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [countdown]);

  /* Countdown completion. */
  useEffect(() => {
    if (!countdown || countdown.left > 0) return;
    sfx("alarm");
    toast(countdown.doneMsg, countdown.tone);
    setCountdown(null);
  }, [countdown]);

  const grade: GradeId = ui.grade ?? "3";
  const d: InterviewSet = EQ_INTERVIEW[grade] || EQ_INTERVIEW["3"];
  const st = stepsFor(d);
  const isSpeakingTest = grade === "5" || grade === "4";
  const examInfo = EQ_EXAM_INFO[grade] || null;

  const startCountdown = (seconds: number, slot: Countdown["slot"], doneMsg: string, tone: Countdown["tone"]) => {
    setCountdown({ slot, left: seconds, total: seconds, doneMsg, tone });
  };

  const resetPlayback = () => {
    setCountdown(null);
    setReadStarted(false);
  };

  const nextStep = () => {
    const target = Math.min(st.length - 1, ui.step + 1);
    resetPlayback();
    commit({
      step: target,
      revealed: false,
      qaIndex: st[target] === "qa" ? 0 : ui.qaIndex,
    });
  };

  const prevStep = () => {
    resetPlayback();
    commit({ step: Math.max(0, ui.step - 1), revealed: false });
  };

  const startSim = () => {
    resetPlayback();
    commit({ mode: "sim", step: 0, qaIndex: 0, revealed: false });
  };

  const startQaOnly = () => {
    resetPlayback();
    commit({ mode: "sim", step: Math.max(0, st.indexOf("qa")), qaIndex: 0, revealed: false });
  };

  const finish = () => {
    if (!ui.rating) {
      toast("星をタップして自己評価を選んでください", "error");
      return;
    }
    const score = ui.rating * 20;
    const xp = 30 + ui.rating * 4;
    Store.recordInterview(grade, score, ui.notes);
    Store.addXp(xp);
    const badges = Store.checkBadges();
    if (ui.rating >= 4) {
      confetti({ count: 130 });
      sfx("complete");
    } else {
      sfx("success");
    }
    badges.forEach((b) => toast(`バッジ獲得！ ${b.icon} ${b.name}`, "success"));
    sfx("xp");
    toast(`結果を保存しました +${xp} XP`, "xp");
    resetPlayback();
    commit({ mode: "hub", rating: 0, notes: "", step: 0, qaIndex: 0, revealed: false });
  };

  const exitSim = () => {
    void confirmDialog({
      title: "シミュレーションを中断しますか？",
      message: "ここまでの内容は保存されません。",
      confirmLabel: "中断する",
      cancelLabel: "続ける",
      danger: true,
    }).then((ok) => {
      if (!ok) return;
      resetPlayback();
      commit({ mode: "hub" });
    });
  };

  /* ---------------- Hub ---------------- */
  if (ui.mode === "hub") {
    const attempts = state.interview[grade];

    return (
      <div className="page">
        <div className="page-head">
          <div className="page-head-row">
            <div>
              <div className="eyebrow">{isSpeakingTest ? "Speaking Test" : "2nd Stage"}</div>
              <h1>{isSpeakingTest ? "スピーキングテスト" : "2次試験（面接）"}</h1>
              <p>
                {isSpeakingTest
                  ? "音読とQ&Aを、本番と同じ流れで。5級・4級の録音型スピーキングテストに慣れておきましょう。"
                  : "本番と同じ流れを、何度でも。音読・Q&A・意見問題を、自分のペースで練習できます。"}
              </p>
            </div>
            <a className="btn btn--outline" href="#/exam">
              ✎ 1次試験対策へ
            </a>
          </div>
        </div>

        <div className="segmented segmented--grades" style={{ marginBottom: 20 }}>
          {EQ_GRADES.map((g) => (
            <button
              key={g.id}
              type="button"
              data-iv-grade={g.id}
              className={grade === g.id ? "is-active" : ""}
              onClick={() => {
                resetPlayback();
                commit({ grade: g.id, rating: 0, notes: "", qaIndex: 0, revealed: false, mode: "hub" });
                sfx("click");
              }}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="exam-hero" style={{ marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="row row--wrap" style={{ marginBottom: 8 }}>
              <GradeBadge id={grade} />
              <span className="pill">{examInfo ? examInfo.second : "面接"}</span>
              <span className="pill pill--accent">
                {d.hasReading ? "音読あり" : d.speechTopics ? "スピーチ" : "Q&A中心"}
              </span>
            </div>
            <h2 style={{ marginBottom: 6 }}>
              {gradeOf(grade) ? gradeOf(grade)?.full : grade}
              {isSpeakingTest ? " のスピーキング練習" : " の面接練習"}
            </h2>
            <p className="muted" style={{ fontSize: ".86rem", maxWidth: 560 }}>
              {d.intro}
            </p>
            <div className="row row--wrap" style={{ gap: 8, marginTop: 10 }}>
              <span className="pill">本番 {st.length - 2} パート</span>
              <span className="pill">練習 {isSpeakingTest ? "約5分" : "約10〜15分"}</span>
              {attempts ? <span className="pill pill--success">前回 {attempts.attempts} 回練習</span> : null}
            </div>
          </div>
          <div className="stack--sm" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn--primary btn--lg" type="button" data-start-sim onClick={startSim}>
              <Icon name="play" size={17} />
              {isSpeakingTest ? "スピーキングをシミュレーション" : "面接をシミュレーション"}
            </button>
            <button className="btn btn--outline" type="button" data-qa-only onClick={startQaOnly}>
              Q&Aだけ練習
            </button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1.05fr .95fr", marginBottom: 24 }} id="ivMid">
          <section className="card card--pad">
            <div className="card__head">
              <div>
                <div className="card__title">
                  <Icon name="grid" size={18} />
                  {isSpeakingTest ? " スピーキングテストの流れ" : " 面接の流れ"}
                </div>
                <div className="card__sub">{gradeOf(grade) ? gradeOf(grade)?.full : grade} の実際の流れ</div>
              </div>
            </div>
            <div className="topic-list">
              {st
                .filter((s) => s !== "wrap")
                .map((s, i) => (
                  <div className="topic-row" style={{ cursor: "default" }} key={s}>
                    <span className="topic-row__no">{i + 1}</span>
                    <span className="topic-row__body">
                      <span className="topic-row__title">
                        {s === "intro" && isSpeakingTest ? "準備" : STEP_LABELS[s]}
                      </span>
                      <span className="topic-row__sub">{stepDesc(s, d)}</span>
                    </span>
                  </div>
                ))}
            </div>
          </section>
          <section className="card card--pad">
            <div className="card__head">
              <div>
                <div className="card__title">
                  <Icon name="trophy" size={18} /> 評価のポイント
                </div>
              </div>
            </div>
            <div className="stack--sm" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {(d.tips || []).map((t, i) => (
                <div className="callout" style={{ padding: "10px 12px" }} key={i}>
                  <span className="callout__icon">✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            {attempts ? (
              <>
                <div className="divider" style={{ margin: "14px 0" }} />
                <div className="row row--between">
                  <span className="small muted">最高スコア</span>
                  <span className="pill pill--success">{attempts.best || 0} / 100</span>
                </div>
              </>
            ) : null}
          </section>
        </div>

        <section className="card card--pad" style={{ marginBottom: 24 }}>
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="mic" size={18} /> 質問と模範解答
              </div>
              <div className="card__sub">タップして模範解答を確認。音声でも聞けます。</div>
            </div>
            <button className="btn btn--soft btn--sm" type="button" data-qa-only onClick={startQaOnly}>
              Q&A練習を始める
            </button>
          </div>
          {d.qa.map((qa, i) => (
            <details className="q-card" style={{ padding: 16, marginBottom: 8 }} key={i}>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: ".9rem",
                  listStyle: "none",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span
                  className="qno"
                  style={{
                    flex: "none",
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: "var(--accent)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: ".7rem",
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </span>
                <span>{qa.q}</span>
              </summary>
              <div className="model-answer" style={{ marginTop: 12 }}>
                <span className="label">Model answer</span>
                {qa.model}
                <div className="row" style={{ marginTop: 8, gap: 8 }}>
                  <button
                    className="btn btn--soft btn--sm"
                    type="button"
                    data-speak-qa={i}
                    onClick={() => speak(`${qa.q} ... ${qa.model}`, { rate: 0.85 })}
                  >
                    <Icon name="volume" size={14} /> 聞く
                  </button>
                  <span className="tiny muted">{qa.hint}</span>
                </div>
              </div>
            </details>
          ))}
        </section>

        <div className="callout">
          <span className="callout__icon">🎤</span>
          <span>
            <b>面接は「沈黙しないこと」が最大のコツ。</b> 分からないときも "Let me think for a moment."
            と言えば、考える時間が作れます。
          </span>
        </div>
      </div>
    );
  }

  /* ---------------- Simulation ---------------- */
  const key = st[ui.step] || "wrap";
  const prog = Math.round((ui.step / Math.max(1, st.length - 1)) * 100);
  const recorded = grade === "5" || grade === "4";
  const countValue = countdown && countdown.slot === "count" ? countdown.left : null;
  const readValue = countdown && countdown.slot === "readcount" ? countdown.left : null;

  let body: React.ReactNode = null;

  if (key === "intro") {
    body = (
      <div className="card card--pad" style={{ textAlign: "center", padding: "clamp(28px,5vw,48px)" }}>
        <div style={{ fontSize: "3.2rem", marginBottom: 10 }}>🎤</div>
        <h2 style={{ marginBottom: 8 }}>{recorded ? "スピーキングテスト練習" : "面接シミュレーション"}</h2>
        <p className="muted" style={{ maxWidth: 480, margin: "0 auto 20px", fontSize: ".9rem" }}>
          本番と同じ順番で進みます。声に出して答えるつもりで、リラックスして始めましょう。
        </p>
        <div className="callout" style={{ textAlign: "left", maxWidth: 520, margin: "0 auto 22px" }}>
          <span className="callout__icon">💡</span>
          <span>
            {recorded ? (
              "録音型のテストです。マイクに向かって、ゆっくり・はっきり話しましょう。音読は「区切り」を意識すると伝わりやすくなります。"
            ) : (
              <>
                入室したら <b>"Hello."</b> とあいさつ。名前を聞かれたら <b>"My name is ... ."</b>{" "}
                と答えましょう。面接官は笑顔で対応してくれます。
              </>
            )}
          </span>
        </div>
        <button className="btn btn--primary btn--lg" type="button" data-next onClick={nextStep}>
          シミュレーション開始 <Icon name="arrow" size={17} />
        </button>
      </div>
    );
  } else if (key === "read" && d.passage) {
    body = (
      <div className="card card--pad">
        <div className="row row--between row--wrap" style={{ marginBottom: 14 }}>
          <div>
            <div className="eyebrow">Reading</div>
            <h2 style={{ margin: "2px 0" }}>音読</h2>
            <div className="small muted">{recorded ? "音読の練習（タイマー45秒）" : "まず20秒黙読 → 音読（45秒）"}</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="timer-mini">
              <Icon name="clock" size={14} /> <span data-count>{fmt(countValue ?? 20)}</span>
            </span>
            <button
              className="btn btn--soft btn--sm"
              type="button"
              data-read-aloud
              onClick={() => speak(d.passage ? d.passage.text : "", { rate: 0.9 })}
            >
              <Icon name="volume" size={15} />
              お手本
            </button>
          </div>
        </div>
        <div className={`reading-box ${readStarted ? "" : "is-blurred"}`} id="readBox">
          {d.passage.text}
        </div>
        <div className="row row--between row--wrap" style={{ marginTop: 18 }}>
          <button
            className="btn btn--outline"
            type="button"
            data-prep="20"
            disabled={!!countdown || readStarted}
            onClick={() => startCountdown(20, "count", "準備時間終了。音読を始めましょう。", "info")}
          >
            <Icon name="timer" size={15} />
            20秒の黙読を開始
          </button>
          <button
            className="btn btn--primary"
            type="button"
            data-start-read
            disabled={readStarted}
            onClick={() => {
              setReadStarted(true);
              startCountdown(45, "readcount", "音読タイム終了。Q&Aへ進みましょう。", "info");
            }}
          >
            <Icon name="volume" size={16} />
            音読を開始（45秒）
          </button>
        </div>
        <div className="row row--between" style={{ marginTop: 8 }}>
          <span className="tiny muted">
            音読タイマー：<span data-readcount>{fmt(readValue ?? 45)}</span>
          </span>
          <button className="btn btn--ghost btn--sm" type="button" data-next onClick={nextStep}>
            Q&Aへ <Icon name="right" size={15} />
          </button>
        </div>
      </div>
    );
  } else if (key === "qa") {
    const qa = d.qa[ui.qaIndex];
    if (qa) {
      const progress = ((ui.qaIndex + 1) / d.qa.length) * 100;
      body = (
        <div className="card card--pad">
          <div className="row row--between" style={{ marginBottom: 16 }}>
            <span className="eyebrow">
              Question {ui.qaIndex + 1} / {d.qa.length}
            </span>
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              data-qa-speak
              onClick={() => speak(qa.q, { rate: 0.85 })}
            >
              <Icon name="volume" size={15} />
              質問を聞く
            </button>
          </div>
          <div className="q-card" style={{ marginBottom: 16 }}>
            <div className="q-card__q">
              <span className="qno">Q</span>
              <span>{qa.q}</span>
            </div>
            <div className="tiny muted">{qa.hint}</div>
          </div>
          <div className="progress progress--sm" style={{ marginBottom: 16 }}>
            <span className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
          {ui.revealed ? (
            <div className="model-answer">
              <span className="label">Model answer</span>
              {qa.model}
              <div className="row" style={{ marginTop: 8 }}>
                <button
                  className="btn btn--soft btn--sm"
                  type="button"
                  data-qa-speak
                  onClick={() => speak(qa.model, { rate: 0.85 })}
                >
                  <Icon name="volume" size={14} /> 聞く
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn--outline btn--block"
              type="button"
              data-model-toggle
              onClick={() => commit({ revealed: !ui.revealed })}
            >
              <Icon name="eye" size={16} />
              模範解答を見る
            </button>
          )}
          <div className="row row--between" style={{ marginTop: 20, gap: 8 }}>
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              data-qa-prev
              disabled={ui.qaIndex === 0}
              onClick={() => {
                if (ui.qaIndex > 0) commit({ qaIndex: ui.qaIndex - 1, revealed: false });
              }}
            >
              <Icon name="left" size={15} />
              前の質問
            </button>
            <button
              className="btn btn--primary"
              type="button"
              data-qa-next
              onClick={() => {
                if (ui.qaIndex < d.qa.length - 1) {
                  commit({ qaIndex: ui.qaIndex + 1, revealed: false });
                } else {
                  nextStep();
                }
              }}
            >
              {ui.qaIndex === d.qa.length - 1 ? "次へ" : "次の質問"} <Icon name="right" size={16} />
            </button>
          </div>
        </div>
      );
    }
  } else if (key === "opinion" && d.opinion) {
    body = (
      <div className="card card--pad">
        <div className="row row--between row--wrap" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow">Opinion</div>
            <h2 style={{ margin: "2px 0" }}>意見問題</h2>
            <div className="small muted">準備60秒 → スピーキング120秒</div>
          </div>
          <span className="timer-mini">
            <Icon name="clock" size={14} /> <span data-count>{fmt(countValue ?? 60)}</span>
          </span>
        </div>
        <div className="q-card">
          <div className="q-card__q">
            <span className="qno">Q</span>
            <span>{d.opinion.topic}</span>
          </div>
          <div className="row row--wrap" style={{ gap: 8 }}>
            <button
              className="btn btn--soft btn--sm"
              type="button"
              data-prep-opinion
              disabled={!!countdown}
              onClick={() => startCountdown(60, "count", "準備時間終了。話し始めましょう。", "info")}
            >
              <Icon name="timer" size={15} />
              60秒準備
            </button>
            <button
              className="btn btn--soft btn--sm"
              type="button"
              data-opinion-timer
              disabled={!!countdown}
              onClick={() => startCountdown(120, "count", "時間終了。模範解答と比べてみましょう。", "success")}
            >
              <Icon name="mic" size={15} />
              120秒スピーチ
            </button>
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              data-speak-opinion
              onClick={() => speak(d.opinion ? d.opinion.topic : "", { rate: 0.85 })}
            >
              <Icon name="volume" size={15} />
              質問を聞く
            </button>
          </div>
        </div>
        <div style={{ margin: "16px 0" }}>
          <div className="label" style={{ marginBottom: 8 }}>
            使えそうなポイント
          </div>
          <div className="row row--wrap" style={{ gap: 8 }}>
            {d.opinion.points.map((p, i) => (
              <span className="pill pill--accent" key={i}>
                {p}
              </span>
            ))}
          </div>
        </div>
        {ui.revealed ? (
          <div className="model-answer">
            <span className="label">Sample answer</span>
            {d.opinion.sample}
          </div>
        ) : (
          <button
            className="btn btn--outline btn--block"
            type="button"
            data-model-toggle
            onClick={() => commit({ revealed: !ui.revealed })}
          >
            <Icon name="eye" size={16} />
            模範解答を見る
          </button>
        )}
        <div className="row row--between" style={{ marginTop: 20 }}>
          <button className="btn btn--ghost btn--sm" type="button" data-prev onClick={prevStep}>
            <Icon name="left" size={15} />
            戻る
          </button>
          <button className="btn btn--primary" type="button" data-next onClick={nextStep}>
            振り返りへ <Icon name="right" size={16} />
          </button>
        </div>
      </div>
    );
  } else if (key === "speech" && d.speechTopics && d.speechTopics.length) {
    const topics = d.speechTopics;
    const pick = topics[ui.speechPick] || topics[0];
    body = (
      <div className="card card--pad">
        <div className="row row--between row--wrap" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow">Speech</div>
            <h2 style={{ margin: "2px 0" }}>2分間スピーチ</h2>
            <div className="small muted">5つのテーマから1つ選び、構成を組み立てましょう。</div>
          </div>
          <span className="timer-mini">
            <Icon name="clock" size={14} /> <span data-count>{fmt(countValue ?? 120)}</span>
          </span>
        </div>
        <div className="mode-grid" style={{ marginBottom: 16 }}>
          {topics.map((t, i) => (
            <button
              key={i}
              className="mode-card"
              type="button"
              data-speech-pick={i}
              style={{
                "--mc": i === ui.speechPick ? "var(--accent)" : "var(--muted)",
                borderColor: i === ui.speechPick ? "var(--accent)" : "var(--border)",
              } as React.CSSProperties}
              onClick={() => commit({ speechPick: i, revealed: false })}
            >
              <span className="mode-card__icon" style={{ fontSize: ".9rem", fontWeight: 800 }}>
                {i + 1}
              </span>
              <span>
                <span className="mode-card__title" style={{ fontSize: ".88rem" }}>
                  {t.topic}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="q-card">
          <div className="q-card__q">
            <span className="qno">T</span>
            <span>{pick.topic}</span>
          </div>
          <div className="row row--wrap" style={{ gap: 8 }}>
            {pick.points.map((p, i) => (
              <span className="pill" key={i}>
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="row row--between row--wrap" style={{ marginTop: 16 }}>
          <button
            className="btn btn--soft"
            type="button"
            data-speech-timer
            disabled={!!countdown}
            onClick={() => startCountdown(120, "count", "スピーチ時間終了。おつかれさまでした。", "success")}
          >
            <Icon name="mic" size={16} />
            2分計測スタート
          </button>
          <button className="btn btn--primary" type="button" data-next onClick={nextStep}>
            振り返りへ <Icon name="right" size={16} />
          </button>
        </div>
        <div className="callout" style={{ marginTop: 16 }}>
          <span className="callout__icon">🧭</span>
          <span>
            <b>構成：</b>
            結論 → 理由①（具体例）→ 理由②（具体例）→ 反論への配慮 → 結論。1級では「なぜそう言えるか」を深掘りしましょう。
          </span>
        </div>
      </div>
    );
  } else if (key === "wrap") {
    const attempts = state.interview[grade];
    body = (
      <div className="card card--pad">
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: "2.6rem", marginBottom: 6 }}>🎉</div>
          <h2 style={{ marginBottom: 4 }}>おつかれさまでした</h2>
          <p className="muted" style={{ fontSize: ".88rem" }}>
            今日の出来を振り返って、次の練習につなげましょう。
          </p>
        </div>
        <div className="self-eval">
          <div className="self-eval__row">
            <div>
              <div className="self-eval__label">今日の出来は？</div>
              <div className="tiny muted">1〜5で自己評価</div>
            </div>
            <Stars rating={ui.rating} max={5} onChange={(value) => commit({ rating: value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="ivNotes">
              気づいたこと・次回の目標
            </label>
            <textarea
              className="textarea"
              id="ivNotes"
              placeholder="例：Q&Aで沈黙してしまった。次はまず Yes / No で答える。"
              value={ui.notes}
              onChange={(e) => commit({ notes: e.target.value })}
            />
          </div>
        </div>
        <div className="row row--between row--wrap" style={{ marginTop: 20, gap: 10 }}>
          <button className="btn btn--outline" type="button" data-prev onClick={prevStep}>
            戻る
          </button>
          <button className="btn btn--primary btn--lg" type="button" data-finish-iv onClick={finish}>
            <Icon name="check" size={17} />
            結果を保存する
          </button>
        </div>
        {attempts ? (
          <p className="tiny muted center" style={{ marginTop: 12 }}>
            これまでの練習回数：{attempts.attempts} 回 · ベスト {attempts.best || 0} / 100
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <div className="row row--between" style={{ marginBottom: 14 }}>
        <button className="btn btn--ghost btn--sm" type="button" data-exit onClick={exitSim}>
          <Icon name="x" size={15} />
          中断する
        </button>
        <span className="small muted">
          {gradeOf(grade) ? gradeOf(grade)?.full : grade}
          {isSpeakingTest ? " · スピーキング練習" : " · 面接シミュレーション"}
        </span>
      </div>
      <div className="progress" style={{ marginBottom: 18 }}>
        <span className="progress__bar" style={{ width: `${prog}%` }} />
      </div>
      <div className="stepper">
        {st.map((s, i) => (
          <span key={s}>
            <span className={`stepper__item ${i === ui.step ? "is-active" : i < ui.step ? "is-done" : ""}`}>
              {i < ui.step ? "✓ " : ""}
              {s === "intro" && isSpeakingTest ? "準備" : STEP_LABELS[s]}
            </span>
            {i < st.length - 1 ? <span className="stepper__sep">›</span> : null}
          </span>
        ))}
      </div>
      {body}
    </div>
  );
}
