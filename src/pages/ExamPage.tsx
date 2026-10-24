import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { ExamInfo, GradeFilter, QuizConfig, ReadingPassage } from "../types";
import { EQ_EXAM_INFO, EQ_READING, EQ_READING_BY_GRADE } from "../data/exam";
import { EQ_GRAMMAR } from "../data/grammar";
import { useStore } from "../lib/useStore";
import { useApp } from "../lib/app-context";
import { useRoute } from "../lib/router";
import { useIsNarrow } from "../lib/useMedia";
import { buildGrammarQuestions, buildReadingQuestions, buildVocabQuestion, buildVocabQuestions, pickVocab } from "../lib/quiz-data";
import { esc, gradeOf, shuffle } from "../lib/format";
import { sfx, speak, toast } from "../lib/ui";
import { Icon } from "../components/Icon";
import { GradeBadge } from "../components/Bits";

type ExamMode = "hub" | "reading" | "listening";

const examUi: { mode: ExamMode } = { mode: "hub" };

/** Called by the app shell whenever the user leaves the exam page. */
export function resetExamUi(): void {
  examUi.mode = "hub";
}

function gradeName(g: GradeFilter): string {
  if (g === "all") return "すべての級";
  const info = gradeOf(g);
  return info ? info.full : g;
}

function modeCard(
  icon: string,
  color: string,
  title: string,
  desc: string,
  meta1: string,
  meta2: string,
  mode: Exclude<ExamMode, "hub"> | "vocab" | "grammar" | "mock",
  onPick: (mode: Exclude<ExamMode, "hub"> | "vocab" | "grammar" | "mock") => void,
) {
  return (
    <button
      key={mode}
      className="mode-card"
      type="button"
      data-mode={mode}
      style={{ "--mc": color } as CSSProperties}
      onClick={() => onPick(mode)}
    >
      <span className="mode-card__icon">{icon}</span>
      <span>
        <span className="mode-card__title">{title}</span>
        <span className="mode-card__desc">{desc}</span>
        <span className="mode-card__meta">
          <span className="tag">{meta1}</span>
          <span className="tag">{meta2}</span>
        </span>
      </span>
    </button>
  );
}

function TipRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
      <span
        style={{
          flex: "none",
          width: 28,
          height: 28,
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          background: "var(--surface-2)",
          fontSize: ".85rem",
        }}
      >
        {icon}
      </span>
      <div>
        <div style={{ fontSize: ".82rem", fontWeight: 800 }}>{title}</div>
        <div className="tiny muted" style={{ lineHeight: 1.55 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function readingContext(passage: ReadingPassage): string {
  return (
    '<div class="reading-passage"><div class="title">' +
    esc(passage.title) +
    "</div>" +
    passage.text.map((p) => `<p>${esc(p)}</p>`).join("") +
    "</div>"
  );
}

export function ExamPage() {
  const state = useStore();
  const api = useApp();
  const route = useRoute();
  const narrow = useIsNarrow(760);
  const [mode, setModeState] = useState<ExamMode>(examUi.mode);

  const setMode = (next: ExamMode) => {
    examUi.mode = next;
    setModeState(next);
  };

  /* Keep the reading mode when the page is opened through #/exam/reading. */
  useEffect(() => {
    if (route.params[0] === "reading") {
      examUi.mode = "reading";
      setModeState("reading");
    }
  }, [route.params]);

  const g = state.profile.grade;
  const info = g === "all" ? null : gradeOf(g);
  const examInfo: ExamInfo | null = g === "all" ? null : EQ_EXAM_INFO[g] || null;
  const isSpeakingTest = g === "5" || g === "4";

  const startVocab = () => {
    const list = pickVocab(g, 10);
    api.startQuiz({
      title: `${gradeName(g)} 単語クイズ`,
      questions: buildVocabQuestions(list, "mix", g === "all" ? undefined : g),
      grade: g,
      type: "vocab",
      backLabel: "1次試験対策に戻る",
    });
  };

  const startGrammar = () => {
    const pool = shuffle(EQ_GRAMMAR.filter((t) => g === "all" || t.grade === g));
    let questions = pool
      .slice(0, 4)
      .flatMap((t) => buildGrammarQuestions(t));
    questions = shuffle(questions).slice(0, 10);
    if (!questions.length) {
      toast("文法問題がありません", "error");
      return;
    }
    api.startQuiz({
      title: `${gradeName(g)} 文法クイズ`,
      questions,
      grade: g,
      type: "grammar",
      xpPerQuestion: 12,
      backLabel: "1次試験対策に戻る",
    });
  };

  const startMock = () => {
    const passages = g === "all" ? EQ_READING : EQ_READING_BY_GRADE[g] || [];
    const passage = passages.length ? passages[Math.floor(Math.random() * passages.length)] : null;
    const vocabQ = buildVocabQuestions(pickVocab(g, 8), "mix", g === "all" ? undefined : g);
    const pool = EQ_GRAMMAR.filter((t) => g === "all" || t.grade === g);
    let grammarQ = shuffle(pool)
      .slice(0, 3)
      .flatMap((t) => buildGrammarQuestions(t));
    grammarQ = shuffle(grammarQ).slice(0, 4);
    const readingQ = passage ? buildReadingQuestions(passage).slice(0, 3) : [];
    const all = shuffle(vocabQ.concat(grammarQ, readingQ));
    if (!all.length) {
      toast("問題がありません", "error");
      return;
    }
    const config: QuizConfig = {
      title: `${gradeName(g)} ミニ模試`,
      questions: all,
      grade: g,
      type: "mock",
      timeLimit: 600,
      xpPerQuestion: 15,
      completionBonus: 40,
      backLabel: "1次試験対策に戻る",
      contextHTML: passage ? readingContext(passage) : "",
    };
    api.startQuiz(config);
  };

  const onModeCard = (next: Exclude<ExamMode, "hub"> | "vocab" | "grammar" | "mock") => {
    sfx("click");
    if (next === "reading" || next === "listening") setMode(next);
    else if (next === "vocab") startVocab();
    else if (next === "grammar") startGrammar();
    else if (next === "mock") startMock();
  };

  if (mode === "reading") {
    return <ReadingView g={g} onBack={() => setMode("hub")} />;
  }
  if (mode === "listening") {
    return <ListeningView g={g} onBack={() => setMode("hub")} />;
  }

  const hist = state.quizHistory.slice(0, 5);
  const topics = EQ_GRAMMAR.filter((t) => g === "all" || t.grade === g);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow">1st Stage</div>
            <h1>1次試験対策</h1>
            <p>単語・文法・読解・リスニングを、本番の形式で。級を選ぶだけで、いまのレベルに合った問題が出ます。</p>
          </div>
          <a href="#/interview" className="btn btn--outline">
            🎤 {isSpeakingTest ? "スピーキングテストへ" : "2次試験（面接）へ"}
          </a>
        </div>
      </div>

      <div className="exam-hero">
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="row row--wrap" style={{ marginBottom: 8 }}>
            <GradeBadge id={g} />
            <span className="pill">{info ? info.cefr : "A1–C2"}</span>
            <span className="pill pill--accent">{g === "all" ? "全レベル" : info ? info.stage : ""}</span>
          </div>
          <h2 style={{ marginBottom: 6 }}>{gradeName(g)} の対策</h2>
          <p className="muted" style={{ fontSize: ".86rem", maxWidth: 540, marginBottom: 10 }}>
            {info ? info.desc : "5級から1級までの全レベルから、ランダムに出題します。"}
          </p>
          <div className="row row--wrap" style={{ gap: 8 }}>
            <span className="pill">{examInfo ? examInfo.first : "級ごとの試験時間"}</span>
            <span className="pill">合格目安 {examInfo ? examInfo.pass : "約60〜75%"}</span>
            <span className="pill">{examInfo ? examInfo.writing : "英作文あり"}</span>
          </div>
        </div>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn--soft" type="button" data-change-grade onClick={() => api.openGradePicker()}>
            <Icon name="settings" size={16} />
            級を変更
          </button>
          {g !== "all" ? (
            <a className="btn btn--outline" href="#/grammar">
              文法を学ぶ
            </a>
          ) : null}
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>練習モード</h2>
          <div className="section-head__sub">{topics.length} の文法テーマに対応</div>
        </div>
      </div>

      <div className="mode-grid" style={{ marginBottom: 26 }}>
        {modeCard("Aa", "#6366f1", "単語クイズ", "4択でテンポよく。SRSが苦手な単語を優先出題。", "10問", "約3分", "vocab", onModeCard)}
        {modeCard("✎", "#14b8a6", "文法クイズ", "時制・関係詞・仮定法など、級に合わせてランダム出題。", "10問", "約5分", "grammar", onModeCard)}
        {modeCard("📖", "#f59e0b", "読解演習", "本番レベルの長文 + 内容理解問題。まずは全文を読みましょう。", "4問", "約8分", "reading", onModeCard)}
        {modeCard("🎧", "#ec4899", "リスニング", "単語の発音を聞いて意味を選ぶ。音声は何度でも再生OK。", "10問", "約4分", "listening", onModeCard)}
        {modeCard("⏱️", "#8b5cf6", "ミニ模試", "単語・文法・読解の混合。制限時間10分で本番の感覚を。", "15問", "10分", "mock", onModeCard)}
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", marginBottom: 24 }}
        id="examBottom"
      >
        <section className="card card--pad">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="chart" size={18} /> 最近の結果
              </div>
              <div className="card__sub">学習記録に自動で保存されます</div>
            </div>
            <a className="link" href="#/progress" style={{ fontSize: ".78rem" }}>
              すべて見る
            </a>
          </div>
          {hist.length ? (
            hist.map((h, i) => (
              <div
                key={`${h.ts}-${i}`}
                className="row row--between"
                style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 10 }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: ".84rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {h.title || h.type}
                  </div>
                  <div className="tiny muted">
                    {new Date(h.ts).toLocaleDateString("ja-JP")} · {h.total || 0}問
                  </div>
                </div>
                <span className={`pill ${h.score / (h.total || 1) >= 0.7 ? "pill--success" : ""}`}>
                  {h.score} / {h.total}
                </span>
              </div>
            ))
          ) : (
            <div className="empty" style={{ padding: 20 }}>
              <div className="empty__icon">📝</div>
              <p style={{ fontSize: ".82rem", margin: 0 }}>
                まだクイズの記録がありません。最初の1問を解いてみましょう。
              </p>
            </div>
          )}
        </section>
        <section className="card card--pad">
          <div className="card__head">
            <div>
              <div className="card__title">
                <Icon name="info" size={18} /> 傾向と対策
              </div>
              <div className="card__sub">{gradeName(g)} のポイント</div>
            </div>
          </div>
          <div className="stack--sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TipRow
              icon="📚"
              title="語彙が勝負"
              desc={`${info ? info.words : "約300〜15,000語"}が目安。毎日の単語クイズで積み上げを。`}
            />
            <TipRow
              icon="⏱️"
              title="時間配分"
              desc={`${examInfo ? examInfo.first : "級ごとに異なる"}。読解は1問あたり2〜3分を意識。`}
            />
            <TipRow
              icon="🎯"
              title="合格ライン"
              desc={`${info ? info.pass : "約60〜75%"}。苦手分野を1つずつ潰しましょう。`}
            />
            <TipRow icon="🔁" title="復習が命" desc="間違えた問題は「学習記録」から確認。翌日にもう一度。" />
          </div>
        </section>
      </div>

      <div className="callout">
        <span className="callout__icon">📝</span>
        <span>
          <b>英作文について：</b>
          3級以上ではライティングも出題されます。「結論 → 理由2つ → まとめ」の型を、まずは短い文で練習しましょう。ライティング練習は今後のアップデートで追加予定です。
        </span>
      </div>
    </div>
  );
}

function ReadingView({ g, onBack }: { g: GradeFilter; onBack: () => void }) {
  const api = useApp();
  const passages = g === "all" ? EQ_READING : EQ_READING_BY_GRADE[g] || [];
  const p = passages[0] || EQ_READING_BY_GRADE["3"]?.[0];

  if (!p) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__icon">📖</div>
          <h3>読解問題がありません</h3>
          <button className="btn btn--primary" type="button" onClick={onBack}>
            1次試験対策に戻る
          </button>
        </div>
      </div>
    );
  }

  const startReading = () => {
    api.startQuiz({
      title: p.title,
      questions: buildReadingQuestions(p),
      grade: g === "all" ? p.grade : g,
      type: "reading",
      xpPerQuestion: 15,
      completionBonus: 30,
      backLabel: "読解演習に戻る",
      contextHTML: readingContext(p),
    });
  };

  return (
    <div className="page reading-wrap">
      <button className="btn btn--ghost btn--sm" type="button" data-back style={{ marginBottom: 12 }} onClick={onBack}>
        <Icon name="left" size={16} />
        1次試験対策に戻る
      </button>
      <div className="page-head">
        <div className="eyebrow">Reading</div>
        <h1>読解演習</h1>
        <p>{gradeName(g)} レベルの長文です。まず本文を読み、内容理解の問題に挑戦しましょう。</p>
      </div>
      <div className="card card--pad" style={{ marginBottom: 14 }}>
        <div className="reading-passage" style={{ border: 0, padding: "4px 0", margin: 0 }}>
          <div className="row row--between row--wrap" style={{ marginBottom: 12 }}>
            <div>
              <div className="title" style={{ margin: 0 }}>
                {p.title}
              </div>
              <div className="tiny muted">
                {p.level} · {p.questions.length} 問 · {p.text.join(" ").split(/\s+/).length} 語
              </div>
            </div>
            <button className="speak-btn" type="button" data-read onClick={() => speak(p.text.join(" "), { rate: 0.88 })}>
              <Icon name="volume" size={15} /> 本文を聞く
            </button>
          </div>
          {p.text.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
      <div className="row row--between row--wrap" style={{ marginBottom: 22 }}>
        <div className="exam-note">
          <Icon name="info" size={15} /> 分からない単語は前後の文脈から推測しましょう。
        </div>
        <button className="btn btn--primary btn--lg" type="button" data-start-reading onClick={startReading}>
          <Icon name="play" size={17} />
          内容理解の問題へ（{p.questions.length}問）
        </button>
      </div>
      <section className="card card--pad" style={{ marginBottom: 16 }}>
        <div className="card__head">
          <div>
            <div className="card__title">
              <Icon name="headphones" size={18} /> 読解のコツ
            </div>
          </div>
        </div>
        <div className="stack--sm" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="callout callout--teal" style={{ padding: "10px 12px" }}>
            <span>① 設問を先に読むと、探すべき情報が明確になります。</span>
          </div>
          <div className="callout" style={{ padding: "10px 12px" }}>
            <span>② 段落ごとに「何の話か」を一言でメモしましょう。</span>
          </div>
          <div className="callout" style={{ padding: "10px 12px" }}>
            <span>③ 選択肢は本文の言い換え。本文にない単語だけの選択肢は疑いましょう。</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ListeningView({ g, onBack }: { g: GradeFilter; onBack: () => void }) {
  const api = useApp();

  const startListening = () => {
    const list = pickVocab(g, 10);
    const questions = list.map((item) => buildVocabQuestion(item, g === "all" ? "all" : g, "listen"));
    api.startQuiz({
      title: `リスニング ${gradeName(g)}`,
      questions,
      grade: g,
      type: "listening",
      xpPerQuestion: 12,
      backLabel: "リスニングに戻る",
    });
  };

  return (
    <div className="page" style={{ maxWidth: 720, margin: "0 auto" }}>
      <button className="btn btn--ghost btn--sm" type="button" data-back style={{ marginBottom: 12 }} onClick={onBack}>
        <Icon name="left" size={16} />
        1次試験対策に戻る
      </button>
      <div className="page-head">
        <div className="eyebrow">Listening</div>
        <h1>リスニング練習</h1>
        <p>英単語の音声を聞いて、正しい意味を選ぶ練習です。音声は何度でも再生できます。</p>
      </div>
      <div className="clock-stage" style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: "3.4rem", marginBottom: 8 }}>🎧</div>
        <h2 style={{ marginBottom: 6 }}>{gradeName(g)} の単語</h2>
        <p className="muted" style={{ fontSize: ".86rem", maxWidth: 420, margin: "0 auto 18px" }}>
          音声はブラウザの読み上げ機能を使います。音量に注意して、集中できる環境で始めましょう。
        </p>
        <div className="row" style={{ justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn--primary btn--lg" type="button" data-start-listening onClick={startListening}>
            <Icon name="headphones" size={18} />
            10問スタート
          </button>
          <button
            className="btn btn--outline"
            type="button"
            data-test-audio
            onClick={() => speak("Hello. Let's practice English together.", { rate: 0.9 })}
          >
            <Icon name="volume" size={16} />
            音声テスト
          </button>
        </div>
        <p className="tiny muted" style={{ marginTop: 14 }}>
          ※ 音声が出ない場合は、端末の音量やブラウザの設定をご確認ください。
        </p>
      </div>
      <div className="card card--pad">
        <div className="card__title" style={{ marginBottom: 10 }}>
          <Icon name="info" size={18} /> 効果的な使い方
        </div>
        <div className="stack--sm" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="callout" style={{ padding: "10px 12px" }}>
            <span>① まずは音だけを聞いて、意味を想像します。</span>
          </div>
          <div className="callout" style={{ padding: "10px 12px" }}>
            <span>② 選択後に出る例文も、音読してみましょう。</span>
          </div>
          <div className="callout" style={{ padding: "10px 12px" }}>
            <span>③ 正解率が80%を超えたら、上の級に挑戦。</span>
          </div>
        </div>
      </div>
    </div>
  );
}
