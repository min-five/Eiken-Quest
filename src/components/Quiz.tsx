import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizConfig } from "../types";
import { Store } from "../lib/store";
import { confirmDialog } from "./ConfirmProvider";
import { confetti, sfx, speak, stopSpeak, toast } from "../lib/ui";
import { Icon } from "./Icon";

interface QuizProps {
  config: QuizConfig;
  onClose: () => void;
}

interface WrongAnswer {
  q: string;
  a: string;
  yours: string;
}

interface ResultData {
  pct: number;
  score: number;
  total: number;
  xp: number;
  duration: number;
  maxCombo: number;
  wrong: WrongAnswer[];
}

const LETTERS = ["A", "B", "C", "D", "E"];

function stripHTML(str: string): string {
  return String(str)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&");
}

export function Quiz({ config, onClose }: QuizProps) {
  const total = config.questions.length;
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [remaining, setRemaining] = useState(config.timeLimit || 0);
  const [wrong, setWrong] = useState<WrongAnswer[]>([]);
  const [runId, setRunId] = useState(0);

  const finishedRef = useRef(false);
  const startedAt = useRef(Date.now());
  const nextRef = useRef<HTMLButtonElement>(null);

  const current = config.questions[index];

  const exit = useCallback(() => {
    stopSpeak();
    config.onExit?.();
    onClose();
  }, [config, onClose]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);

    const duration = Math.round((Date.now() - startedAt.current) / 1000);
    const pct = total ? Math.round((score / total) * 100) : 0;
    const comboBonus = Math.max(0, maxCombo - 2) * 2;
    const perfect = score === total ? 10 : 0;
    const xpPerQuestion = config.xpPerQuestion ?? 10;
    const completionBonus = config.completionBonus ?? 20;
    const xpGained = score * xpPerQuestion + completionBonus + comboBonus + perfect;

    Store.addXp(xpGained);
    Store.recordQuiz({
      type: config.type,
      grade: config.grade,
      title: config.title,
      score,
      total,
      xp: xpGained,
      duration,
      maxCombo,
    });

    const newBadges = Store.checkBadges();
    newBadges.forEach((badge, i) => {
      window.setTimeout(
        () => toast(`バッジ獲得！ ${badge.icon} ${badge.name}`, { type: "success", duration: 4200 }),
        500 + i * 700,
      );
    });

    if (pct >= 70) {
      window.setTimeout(() => {
        sfx("complete");
        confetti({ count: pct === 100 ? 180 : 120 });
      }, 250);
    } else {
      sfx("complete");
    }

    setResult({ pct, score, total, xp: xpGained, duration, maxCombo, wrong });

    config.onComplete?.({ score, total, pct, xp: xpGained, wrongAnswers: wrong, type: config.type });
  }, [config, maxCombo, score, total, wrong]);

  /* Timer */
  useEffect(() => {
    if (finished || !config.timeLimit) return;
    const id = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [finished, config.timeLimit, runId]);

  useEffect(() => {
    if (config.timeLimit && remaining <= 0 && !finishedRef.current) {
      toast("時間切れです", "info");
      finish();
    }
  }, [remaining, config.timeLimit, finish]);

  /* Body class + speech cleanup */
  useEffect(() => {
    document.body.classList.add("is-quizzing");
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      document.body.classList.remove("is-quizzing");
      stopSpeak();
    };
  }, []);

  /* Auto-play the vocabulary audio */
  useEffect(() => {
    const word = config.questions[index]?.speakWord;
    if (!word) return;
    const timer = window.setTimeout(() => speak(word, { rate: 0.85 }), 250);
    return () => window.clearTimeout(timer);
  }, [index, config.questions]);

  useEffect(() => {
    if (chosen !== null) nextRef.current?.focus({ preventScroll: true });
  }, [chosen]);

  const choose = useCallback(
    (choice: number) => {
      if (finishedRef.current) return;
      const q = config.questions[index];
      if (!q || chosen !== null) return;

      const isCorrect = choice === q.a;
      setChosen(choice);
      setAnswered((n) => n + 1);

      if (isCorrect) {
        setScore((n) => n + 1);
        setCombo((n) => {
          const next = n + 1;
          setMaxCombo((max) => Math.max(max, next));
          return next;
        });
        sfx("correct");
        if (q.word) Store.recordWord(q.word, true);
      } else {
        setCombo(0);
        sfx("wrong");
        if (q.word) Store.recordWord(q.word, false);
        setWrong((list) => [
          ...list,
          {
            q: q.rawQuestion || stripHTML(q.question),
            a: q.choices[q.a],
            yours: q.choices[choice],
          },
        ]);
      }
    },
    [chosen, config.questions, index],
  );

  const next = useCallback(() => {
    if (finishedRef.current || chosen === null) return;
    if (index >= total - 1) finish();
    else {
      setIndex((i) => i + 1);
      setChosen(null);
    }
  }, [chosen, finish, index, total]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finishedRef.current) return;
      const q = config.questions[index];
      if (!q) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.choices.length) {
        if (chosen === null) {
          e.preventDefault();
          choose(n - 1);
        }
      } else if (e.key === "Enter") {
        if (chosen !== null) {
          e.preventDefault();
          next();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [choose, chosen, config.questions, index, next]);

  const quit = useCallback(() => {
    if (finishedRef.current) return;
    if (answered === 0) {
      exit();
      return;
    }
    void confirmDialog({
      title: "クイズを終了しますか？",
      message: "ここまでの結果は保存されません。",
      confirmLabel: "終了する",
      cancelLabel: "続ける",
      danger: true,
    }).then((ok) => {
      if (ok) exit();
    });
  }, [answered, exit]);

  const retry = useCallback(() => {
    finishedRef.current = false;
    setFinished(false);
    setResult(null);
    setIndex(0);
    setChosen(null);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setAnswered(0);
    setWrong([]);
    setRemaining(config.timeLimit || 0);
    startedAt.current = Date.now();
    setRunId((n) => n + 1);
  }, [config.timeLimit]);

  if (result) {
    const emoji = result.pct === 100 ? "🏆" : result.pct >= 80 ? "🎉" : result.pct >= 60 ? "💪" : "🌱";
    const message =
      result.pct === 100
        ? "パーフェクト！完璧です。"
        : result.pct >= 80
          ? "素晴らしい！合格圏内です。"
          : result.pct >= 60
            ? "あと一歩。復習で伸びます。"
            : "ここからが伸びどころ。もう一度挑戦しよう。";
    const timeLabel =
      result.duration >= 60
        ? `${Math.floor(result.duration / 60)}:${String(result.duration % 60).padStart(2, "0")}`
        : `${result.duration}秒`;

    return (
      <div className="result page">
        <div className="result__badge">{emoji}</div>
        <h2>{result.pct}% 正解</h2>
        <p className="result__sub">{message}</p>
        <div className="result__stats">
          <div className="result__stat">
            <b>
              {result.score}/{result.total}
            </b>
            <span>正解数</span>
          </div>
          <div className="result__stat">
            <b>+{result.xp}</b>
            <span>獲得XP</span>
          </div>
          <div className="result__stat">
            <b>{timeLabel}</b>
            <span>タイム</span>
          </div>
        </div>
        <div className="result__actions">
          <button className="btn btn--primary" type="button" data-retry onClick={retry}>
            <Icon name="reset" size={17} />
            もう一度
          </button>
          <button className="btn btn--outline" type="button" data-back onClick={exit}>
            {config.backLabel || "戻る"}
          </button>
        </div>
        {result.maxCombo >= 3 ? (
          <p className="small muted" style={{ marginTop: 14 }}>
            最大 {result.maxCombo} 連続正解！
          </p>
        ) : null}
        {result.wrong.length > 0 && (
          <div className="result__review">
            <div className="section-head" style={{ marginBottom: 6 }}>
              <h2 style={{ fontSize: ".95rem" }}>間違えた問題</h2>
              <span className="pill">{result.wrong.length}</span>
            </div>
            {result.wrong.map((item, i) => (
              <div className="review-item" key={`${item.q}-${i}`}>
                <b>{item.q}</b>
                <span className="ans">
                  <i className="review-tag">正解</i>
                  {item.a}
                </span>
                <span className="yours">
                  <i className="review-tag">あなた</i>
                  <s>{item.yours}</s>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!current) return null;

  const pct = Math.round(((index + (chosen !== null ? 1 : 0)) / total) * 100);
  const timerLabel = `${Math.floor(Math.max(0, remaining) / 60)}:${String(Math.max(0, remaining) % 60).padStart(2, "0")}`;
  const prompt = current.kind === "vocab" ? "単語" : current.kind === "grammar" ? "文法" : current.kind === "reading" ? "読解" : "問題";
  const isCorrect = chosen === current.a;

  return (
    <div className="quiz">
      <div className="quiz__top">
        <button className="quiz__close" type="button" data-quit aria-label="クイズを終了" onClick={quit}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="quiz__progress">
          <div className="quiz__meta">
            <span>{config.title}</span>
            <span>
              {index + 1} / {total}
              {config.timeLimit ? <span className="quiz__timer"> {timerLabel}</span> : null}
            </span>
          </div>
          <div className="progress">
            <span className="progress__bar" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {combo >= 2 ? <span className="quiz__combo">🔥 {combo}連続</span> : null}
      </div>

      <div className="quiz__body">
        {config.contextHTML ? (
          <details className="quiz__context">
            <summary>本文を読む</summary>
            <div dangerouslySetInnerHTML={{ __html: config.contextHTML }} />
          </details>
        ) : null}

        {current.speakWord ? (
          <button
            className="speak-btn"
            type="button"
            style={{ marginBottom: 14 }}
            onClick={() => speak(current.speakWord || "", { rate: 0.85 })}
          >
            <Icon name="volume" size={16} /> 音声を再生
          </button>
        ) : null}

        <div className="quiz__prompt">{prompt}</div>
        <div className="quiz__question" dangerouslySetInnerHTML={{ __html: current.question }} />
        <div className="choices" role="group" aria-label="選択肢">
          {current.choices.map((choice, i) => {
            let className = "choice";
            if (chosen !== null) {
              if (i === current.a) className += " is-correct";
              else if (i === chosen) className += " is-wrong";
              else className += " is-dim";
            }
            return (
              <button
                key={choice}
                className={className}
                type="button"
                data-choice={i}
                disabled={chosen !== null}
                onClick={() => choose(i)}
              >
                <span className="choice__key">{LETTERS[i]}</span>
                <span className="choice__text">{choice}</span>
                <span className="choice__mark">{chosen === null ? "" : i === current.a ? "✓" : i === chosen ? "✕" : ""}</span>
              </button>
            );
          })}
        </div>

        {chosen !== null ? (
          <div
            className={`quiz__feedback ${isCorrect ? "is-correct" : "is-wrong"}`}
          >
            <div className="quiz__feedback-head">
              <span className="ic">{isCorrect ? "✓" : "✕"}</span>
              {isCorrect ? (
                <>
                  正解！
                  {combo >= 3 ? <span className="pill pill--warn">{combo}連続ボーナス</span> : null}
                </>
              ) : (
                <>惜しい！ 正解は「{current.choices[current.a]}」</>
              )}
            </div>
            <p dangerouslySetInnerHTML={{ __html: current.exp }} />
          </div>
        ) : null}
      </div>

      <div className="quiz__footer">
        <span className="quiz__hint">
          キーボード <span className="kbd">1</span>〜<span className="kbd">4</span> で選択、<span className="kbd">Enter</span> で次へ
        </span>
        <button ref={nextRef} className="btn btn--primary" type="button" data-next disabled={chosen === null} onClick={next}>
          次へ <Icon name="arrow" size={17} />
        </button>
      </div>
    </div>
  );
}
