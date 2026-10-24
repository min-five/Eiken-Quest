/* ============================================================
   Dictation Page — リスニング・ディクテーション＆語順並べ替えトレーニング
   ============================================================ */
import { useEffect, useMemo, useState } from "react";
import type { GradeId } from "../types";
import { DICTATION_ITEMS } from "../data/dictation";
import { useStore } from "../lib/useStore";
import { Store } from "../lib/store";
import { confetti, sfx, speak, toast } from "../lib/ui";
import { Icon } from "../components/Icon";

const DICTATION_GRADES: { id: GradeId; label: string }[] = [
  { id: "5", label: "5級" },
  { id: "4", label: "4級" },
  { id: "3", label: "3級" },
  { id: "pre2", label: "準2級" },
  { id: "2", label: "2級" },
  { id: "pre1", label: "準1級" },
  { id: "1", label: "1級" },
];

function normalize(str: string): string {
  return str
    .replace(/[.,?!'"]/g, "")
    .trim()
    .toLowerCase();
}

function tokenize(sentence: string): string[] {
  return sentence
    .replace(/[.,?!]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function DictationPage() {
  const state = useStore();
  const profileGrade = state.profile.grade;

  const defaultGrade: GradeId =
    profileGrade === "all" ? "3" : profileGrade;

  const [activeGrade, setActiveGrade] = useState<GradeId>(defaultGrade);
  const itemsForGrade = useMemo(
    () => DICTATION_ITEMS.filter((item) => item.grade === activeGrade),
    [activeGrade]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = itemsForGrade[currentIndex] || itemsForGrade[0] || DICTATION_ITEMS[0];

  const [mode, setMode] = useState<"tile" | "typing">("tile");
  const [speed, setSpeed] = useState<number>(1.0);
  const [playCount, setPlayCount] = useState(0);
  const [showJa, setShowJa] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Tile Mode State
  const originalTokens = useMemo(() => tokenize(currentItem.en), [currentItem]);
  const [shuffledTokens, setShuffledTokens] = useState<{ id: number; word: string }[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<{ id: number; word: string }[]>([]);

  // Typing Mode State
  const [typedText, setTypedText] = useState("");

  // Result state
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Initialize tokens when current item changes
  useEffect(() => {
    const tokensWithId = originalTokens.map((w, idx) => ({ id: idx, word: w }));
    setShuffledTokens(shuffle(tokensWithId));
    setSelectedTokens([]);
    setTypedText("");
    setChecked(false);
    setIsCorrect(false);
    setShowJa(false);
    setShowHint(false);
    setPlayCount(0);
  }, [currentItem, originalTokens]);

  const playAudio = () => {
    speak(currentItem.en, { rate: speed });
    setPlayCount((n) => n + 1);
  };

  const handleTileClick = (token: { id: number; word: string }) => {
    if (checked) return;
    setShuffledTokens((prev) => prev.filter((t) => t.id !== token.id));
    setSelectedTokens((prev) => [...prev, token]);
    sfx("click");
  };

  const handleRemoveTile = (token: { id: number; word: string }) => {
    if (checked) return;
    setSelectedTokens((prev) => prev.filter((t) => t.id !== token.id));
    setShuffledTokens((prev) => [...prev, token]);
    sfx("click");
  };

  const checkAnswer = () => {
    let userSentence = "";
    if (mode === "tile") {
      userSentence = selectedTokens.map((t) => t.word).join(" ");
    } else {
      userSentence = typedText.trim();
    }

    const normUser = normalize(userSentence);
    const normTarget = normalize(currentItem.en);

    const correct = normUser === normTarget;
    setIsCorrect(correct);
    setChecked(true);

    if (correct) {
      sfx("correct");
      confetti();
      Store.markDictationDone(currentItem.id);
      Store.addXp(15);
      Store.checkBadges();
      toast("正解です！パーフェクト！ +15 XP", "xp");
    } else {
      sfx("wrong");
      toast("おしい！もう一度音声を聞いて確認しましょう", "info");
    }
  };

  const handleNext = () => {
    if (currentIndex < itemsForGrade.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      setCurrentIndex(0);
    }
    sfx("click");
  };

  const completedCount = itemsForGrade.filter((item) => state.dictationDone?.[item.id]).length;

  return (
    <div className="page dictation-page">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow">Listening Studio</div>
            <h1>ディクテーション特訓</h1>
            <p>
              音声を聞き取り、正確な英文を組み立てる集中リスニング。耳を鍛えて単語の語順感覚と聞き分け力を一気に高めます。
            </p>
          </div>
          <div className="chip">
            <span className="chip__icon">🎧</span>
            <span>達成: {completedCount} / {itemsForGrade.length}問</span>
          </div>
        </div>
      </div>

      {/* Grade tabs */}
      <div className="segmented segmented--grades" style={{ marginBottom: 18 }} role="tablist">
        {DICTATION_GRADES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={activeGrade === g.id ? "is-active" : ""}
            onClick={() => {
              setActiveGrade(g.id);
              setCurrentIndex(0);
              sfx("click");
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Question Progress & Mode */}
      <div className="row row--between row--wrap" style={{ gap: 10, marginBottom: 14 }}>
        <div className="row" style={{ gap: 8 }}>
          <span className="pill" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            第 {currentIndex + 1} / {itemsForGrade.length} 問
          </span>
          {currentItem.category && <span className="pill">{currentItem.category}</span>}
          {state.dictationDone?.[currentItem.id] && (
            <span className="pill" style={{ background: "color-mix(in srgb, var(--success) 14%, transparent)", color: "var(--success)" }}>
              ✓ クリア済み
            </span>
          )}
        </div>

        <div className="segmented" style={{ width: "auto" }}>
          <button
            type="button"
            className={mode === "tile" ? "is-active" : ""}
            onClick={() => {
              setMode("tile");
              sfx("click");
            }}
          >
            並べ替え
          </button>
          <button
            type="button"
            className={mode === "typing" ? "is-active" : ""}
            onClick={() => {
              setMode("typing");
              sfx("click");
            }}
          >
            タイピング
          </button>
        </div>
      </div>

      {/* Main Player Card */}
      <div className="card card--pad" style={{ marginBottom: 18, textAlign: "center", padding: "28px 20px" }}>
        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            className="big-btn big-btn--primary"
            style={{ minWidth: 200, padding: "16px 28px", fontSize: "1.05rem" }}
            onClick={playAudio}
          >
            <Icon name="volume" size={24} />
            音声を聞く {playCount > 0 ? `(${playCount}回)` : ""}
          </button>
        </div>

        {/* Speed Controls */}
        <div className="row" style={{ justifyContent: "center", gap: 10, marginBottom: 16 }}>
          {[0.8, 1.0, 1.2].map((s) => (
            <button
              key={s}
              type="button"
              className={`pill ${speed === s ? "is-active" : ""}`}
              style={{
                cursor: "pointer",
                background: speed === s ? "var(--accent)" : "var(--surface-2)",
                color: speed === s ? "#fff" : "var(--text)",
                border: "1px solid var(--border)",
              }}
              onClick={() => {
                setSpeed(s);
                sfx("click");
              }}
            >
              {s === 0.8 ? "ゆっくり (0.8x)" : s === 1.0 ? "標準 (1.0x)" : "高速 (1.2x)"}
            </button>
          ))}
        </div>

        {/* Japanese Translation or Hint */}
        <div className="row" style={{ justifyContent: "center", gap: 12, marginBottom: 16 }}>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setShowJa(!showJa)}
          >
            <Icon name="eye" size={15} />
            {showJa ? "日本語訳を隠す" : "日本語訳を見る"}
          </button>
          {currentItem.hint && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setShowHint(!showHint)}
            >
              <Icon name="info" size={15} />
              {showHint ? "ヒントを隠す" : "ヒントを見る"}
            </button>
          )}
        </div>

        {showJa && (
          <div style={{ padding: "10px 16px", background: "var(--surface-2)", borderRadius: 10, display: "inline-block", fontSize: ".95rem", fontWeight: 700, marginBottom: 12 }}>
            🇯🇵 {currentItem.ja}
          </div>
        )}

        {showHint && currentItem.hint && (
          <div style={{ padding: "8px 14px", background: "var(--surface-3)", borderRadius: 8, display: "inline-block", fontSize: ".84rem", color: "var(--muted)", marginBottom: 12 }}>
            💡 {currentItem.hint}
          </div>
        )}

        <div className="divider" style={{ margin: "16px 0" }} />

        {/* Answer Construction Area */}
        {mode === "tile" ? (
          <div>
            {/* Answer Slot */}
            <div
              style={{
                minHeight: 64,
                padding: "14px",
                borderRadius: 12,
                border: "2px dashed var(--border-strong)",
                background: "var(--surface)",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              {selectedTokens.length === 0 ? (
                <span className="small muted">下の単語チップをタップして順番に並べてください</span>
              ) : (
                selectedTokens.map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    className="font-option is-active"
                    style={{ fontSize: "1.05rem", padding: "8px 14px", cursor: "pointer" }}
                    onClick={() => handleRemoveTile(token)}
                    title="タップで外す"
                  >
                    {token.word}
                  </button>
                ))
              )}
            </div>

            {/* Shuffled Bank */}
            <div className="row row--wrap" style={{ justifyContent: "center", gap: 8, minHeight: 48, marginBottom: 20 }}>
              {shuffledTokens.map((token) => (
                <button
                  key={token.id}
                  type="button"
                  className="font-option"
                  style={{ fontSize: "1.05rem", padding: "8px 14px", cursor: "pointer" }}
                  onClick={() => handleTileClick(token)}
                >
                  {token.word}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 640, margin: "0 auto 20px" }}>
            <textarea
              className="input"
              rows={3}
              style={{ fontSize: "1.1rem", width: "100%", padding: "14px" }}
              placeholder="聞き取った英文をタイピングしてください..."
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
            />
          </div>
        )}

        {/* Result presentation */}
        {checked && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: isCorrect ? "color-mix(in srgb, var(--success) 12%, var(--surface))" : "color-mix(in srgb, var(--danger) 10%, var(--surface))",
              border: `1.5px solid ${isCorrect ? "var(--success)" : "var(--danger)"}`,
              marginBottom: 20,
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isCorrect ? "var(--success)" : "var(--danger)", marginBottom: 6 }}>
              {isCorrect ? "🎉 正解！ Perfect!" : "❌ おしい！ 正解はこちら:"}
            </div>
            <div style={{ fontSize: "1.08rem", fontWeight: 700, lineHeight: 1.5, marginBottom: 4 }}>
              {currentItem.en}
            </div>
            <div style={{ fontSize: ".9rem", color: "var(--muted)" }}>
              {currentItem.ja}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="row" style={{ justifyContent: "center", gap: 12 }}>
          {!checked ? (
            <button
              type="button"
              className="btn btn--primary btn--lg"
              disabled={mode === "tile" ? selectedTokens.length === 0 : !typedText.trim()}
              onClick={checkAnswer}
            >
              <Icon name="check" size={20} />
              答え合わせをする
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={handleNext}
            >
              次の問題へ ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
