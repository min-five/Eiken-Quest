/* ============================================================
   Writing Page — 英検ライティング（英作文・要約）アシスタント
   ============================================================ */
import { useMemo, useState } from "react";
import type { GradeId, WritingEntry } from "../types";
import { WRITING_TOPICS } from "../data/writing";
import { useStore } from "../lib/useStore";
import { Store } from "../lib/store";
import { confetti, sfx, speak, toast } from "../lib/ui";
import { Icon } from "../components/Icon";

const WRITING_GRADES: { id: GradeId; label: string }[] = [
  { id: "3", label: "3級" },
  { id: "pre2", label: "準2級" },
  { id: "2", label: "2級" },
  { id: "pre1", label: "準1級" },
  { id: "1", label: "1級" },
];

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function WritingPage() {
  const state = useStore();
  const profileGrade = state.profile.grade;

  const defaultGrade: GradeId =
    profileGrade === "1" || profileGrade === "pre1" || profileGrade === "2" || profileGrade === "pre2" || profileGrade === "3"
      ? profileGrade
      : "2";

  const [activeGrade, setActiveGrade] = useState<GradeId>(defaultGrade);
  const topicsForGrade = useMemo(
    () => WRITING_TOPICS.filter((t) => t.grade === activeGrade),
    [activeGrade]
  );

  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => topicsForGrade[0]?.id || "w2-1");
  const topic = WRITING_TOPICS.find((t) => t.id === selectedTopicId) || topicsForGrade[0] || WRITING_TOPICS[0];

  const savedRecord = state.writingSaves?.[topic.id];
  const [essayText, setEssayText] = useState<string>(() => savedRecord?.text || "");
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Self check items
  const [checks, setChecks] = useState<Record<string, boolean>>({
    opinion: false,
    reasons: false,
    words: false,
    grammar: false,
  });

  const wordCount = countWords(essayText);
  const minWords = topic.minWords;
  const maxWords = topic.maxWords;
  const isLengthOk = wordCount >= minWords && wordCount <= maxWords;

  const handleSelectTopic = (nextTopic: WritingEntry) => {
    setSelectedTopicId(nextTopic.id);
    const existing = state.writingSaves?.[nextTopic.id];
    setEssayText(existing?.text || "");
    setShowModelAnswer(false);
    setChecks({ opinion: false, reasons: false, words: false, grammar: false });
    sfx("click");
  };

  const insertPhrase = (phrase: string) => {
    setEssayText((prev) => {
      const trimmed = prev.trimEnd();
      const next = trimmed ? `${trimmed} ${phrase}` : phrase;
      return next;
    });
    sfx("click");
    toast(`「${phrase}」を挿入しました`, "info");
  };

  const handleSave = () => {
    if (!essayText.trim()) {
      toast("エッセイを入力してください", "error");
      return;
    }
    Store.saveWriting(topic.id, essayText, wordCount);
    Store.addXp(25);
    Store.checkBadges();
    sfx("complete");
    confetti();
    toast(`エッセイを保存しました！ +25 XP`, "xp");
  };

  const toggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    sfx("click");
  };

  return (
    <div className="page writing-page">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow">Writing Studio</div>
            <h1>英検ライティング（英作文）対策</h1>
            <p>
              合否を決定づける英作文・論述対策。頻出テンプレート、リアルタイム語数カウント、使える接続詞パレットで高得点エッセイをマスターしましょう。
            </p>
          </div>
          {savedRecord && (
            <div className="chip">
              <span className="chip__icon">✓</span>
              <span>保存済み ({savedRecord.wordsCount}語)</span>
            </div>
          )}
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="segmented segmented--grades" style={{ marginBottom: 18 }} role="tablist">
        {WRITING_GRADES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={activeGrade === g.id ? "is-active" : ""}
            onClick={() => {
              setActiveGrade(g.id);
              const nextTopics = WRITING_TOPICS.filter((t) => t.grade === g.id);
              if (nextTopics[0]) handleSelectTopic(nextTopics[0]);
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Topic selection list */}
      <div className="row row--wrap" style={{ gap: 10, marginBottom: 20 }}>
        {topicsForGrade.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`btn ${selectedTopicId === t.id ? "btn--primary" : "btn--outline"} btn--sm`}
            onClick={() => handleSelectTopic(t)}
          >
            {state.writingSaves?.[t.id] ? "✓ " : ""}
            {t.title}
          </button>
        ))}
      </div>

      <div className="grid grid--2 grid--tight" style={{ alignItems: "start", gap: 20 }}>
        {/* Left Column: Prompt, Editor & Helper */}
        <div className="stack" style={{ gap: 18 }}>
          {/* Prompt Card */}
          <div className="card card--pad">
            <div className="card__head" style={{ marginBottom: 10 }}>
              <div>
                <span className="pill" style={{ background: "var(--accent-soft)", color: "var(--accent)", marginBottom: 6 }}>
                  {activeGrade}級 自由英作文
                </span>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "4px 0" }}>{topic.title}</h2>
              </div>
              <span className="tiny muted">目安: {minWords}〜{maxWords}語</span>
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "var(--surface-2)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.6,
                border: "1px solid var(--border)",
              }}
            >
              Q. {topic.topic}
            </div>

            <div className="row row--between" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setShowTips(!showTips)}
              >
                <Icon name="info" size={16} />
                {showTips ? "書き方のコツを閉じる" : "書き方のコツを見る"}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => speak(topic.topic)}
              >
                <Icon name="volume" size={16} />
                お題を読み上げ
              </button>
            </div>

            {showTips && (
              <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--surface-3)", borderRadius: 10, fontSize: ".85rem", lineHeight: 1.7 }}>
                <div style={{ fontWeight: 800, marginBottom: 4, color: "var(--accent)" }}>💡 このお題の攻略ポイント</div>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {topic.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Editor Card */}
          <div className="card card--pad">
            <div className="row row--between" style={{ marginBottom: 10 }}>
              <div className="card__title">
                <Icon name="pen" size={18} /> エッセイ作成
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span
                  style={{
                    fontSize: ".9rem",
                    fontWeight: 800,
                    color: isLengthOk ? "var(--success)" : wordCount > maxWords ? "var(--danger)" : "var(--muted)",
                  }}
                >
                  {wordCount} / {minWords}〜{maxWords} words
                </span>
                {isLengthOk && <span style={{ color: "var(--success)", fontWeight: 800 }}>✓ 適正語数</span>}
              </div>
            </div>

            {/* Word count progress bar */}
            <div style={{ width: "100%", height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, (wordCount / maxWords) * 100)}%`,
                  background: isLengthOk ? "var(--success)" : wordCount > maxWords ? "var(--danger)" : "var(--accent)",
                  transition: "all .2s ease",
                }}
              />
            </div>

            <textarea
              className="input"
              rows={9}
              style={{
                width: "100%",
                lineHeight: 1.6,
                fontSize: "1.02rem",
                fontFamily: "var(--font-sans)",
                padding: "14px 16px",
                resize: "vertical",
              }}
              placeholder={`Write your essay here... (e.g. I think that ${topic.topic.replace(/^(Do you think|Which do you like|Can the)/i, "").trim()})`}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
            />

            <div className="row row--between" style={{ marginTop: 14, flexWrap: "wrap", gap: 10 }}>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setEssayText("")}
              >
                <Icon name="trash" size={15} /> クリア
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSave}
              >
                <Icon name="check" size={17} />
                エッセイを保存する (+25 XP)
              </button>
            </div>
          </div>

          {/* Useful phrases palette */}
          <div className="card card--pad">
            <div className="card__title" style={{ marginBottom: 10 }}>
              <Icon name="sparkle" size={17} /> すぐに使える表現パレット（タップで挿入）
            </div>
            <div className="stack" style={{ gap: 12 }}>
              {topic.usefulPhrases.map((group, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: ".76rem", fontWeight: 800, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" }}>
                    {group.category}
                  </div>
                  <div className="row row--wrap" style={{ gap: 6 }}>
                    {group.phrases.map((phrase, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        className="font-option"
                        style={{ padding: "6px 11px", fontSize: ".82rem" }}
                        onClick={() => insertPhrase(phrase)}
                        title="エディタの末尾に挿入"
                      >
                        + {phrase}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Model Answer & Checklist */}
        <div className="stack" style={{ gap: 18 }}>
          {/* Checklist Card */}
          <div className="card card--pad">
            <div className="card__title" style={{ marginBottom: 12 }}>
              <Icon name="target" size={18} /> 自己添削チェックリスト
            </div>
            <div className="stack stack--sm">
              <label className="row" style={{ cursor: "pointer", fontSize: ".9rem" }}>
                <input
                  type="checkbox"
                  checked={checks.opinion}
                  onChange={() => toggleCheck("opinion")}
                  style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
                />
                <span>冒頭で自分の立場・意見（Yes/No、賛成/反対）を明確に述べたか？</span>
              </label>

              <label className="row" style={{ cursor: "pointer", fontSize: ".9rem" }}>
                <input
                  type="checkbox"
                  checked={checks.reasons}
                  onChange={() => toggleCheck("reasons")}
                  style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
                />
                <span>理由を2つ（または3つ）、それぞれ具体例とともに書けたか？</span>
              </label>

              <label className="row" style={{ cursor: "pointer", fontSize: ".9rem" }}>
                <input
                  type="checkbox"
                  checked={checks.words}
                  onChange={() => toggleCheck("words")}
                  style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
                />
                <span>指定語数（{minWords}〜{maxWords}語）の範囲内に収まっているか？</span>
              </label>

              <label className="row" style={{ cursor: "pointer", fontSize: ".9rem" }}>
                <input
                  type="checkbox"
                  checked={checks.grammar}
                  onChange={() => toggleCheck("grammar")}
                  style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
                />
                <span>三単現の -s や過去形、スペルの単純な間違いはないか？</span>
              </label>
            </div>
          </div>

          {/* Model Answer Card */}
          <div className="card card--pad" style={{ background: showModelAnswer ? "var(--surface)" : "var(--surface-2)" }}>
            <div className="row row--between" style={{ marginBottom: 12 }}>
              <div className="card__title">
                <Icon name="star" size={18} /> 満点模範解答
              </div>
              <button
                type="button"
                className={`btn ${showModelAnswer ? "btn--soft" : "btn--outline"} btn--sm`}
                onClick={() => {
                  setShowModelAnswer(!showModelAnswer);
                  sfx("click");
                }}
              >
                {showModelAnswer ? "模範解答を隠す" : "模範解答を見る"}
              </button>
            </div>

            {showModelAnswer ? (
              <div className="stack" style={{ gap: 14 }}>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    background: "var(--surface-2)",
                    fontSize: ".96rem",
                    lineHeight: 1.7,
                    fontFamily: "var(--font-sans)",
                    color: "var(--text)",
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, var(--border))",
                  }}
                >
                  {topic.modelAnswer}
                </div>

                <div className="row row--between">
                  <span className="tiny muted">語数: {countWords(topic.modelAnswer)} words</span>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => speak(topic.modelAnswer)}
                  >
                    <Icon name="volume" size={16} /> 模範音声を聴く
                  </button>
                </div>

                <div style={{ padding: "12px 14px", background: "var(--surface-3)", borderRadius: 10, fontSize: ".88rem", lineHeight: 1.65 }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>【日本語訳】</div>
                  <div>{topic.translation}</div>
                </div>
              </div>
            ) : (
              <p className="small muted" style={{ margin: "8px 0" }}>
                まずは自力でエッセイを書いてみましょう。書き終わったら「模範解答を見る」を押して、使える言い回しや論理構成を比較・吸収しましょう！
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
