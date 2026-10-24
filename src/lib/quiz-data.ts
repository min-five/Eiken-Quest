/* ============================================================
   Quiz question builders
   ============================================================ */
import type { GrammarTopic, GradeFilter, QuizQuestion, ReadingPassage, VocabWord } from "../types";
import { EQ_ALL_VOCAB } from "../data/vocabulary";
import { Store } from "./store";
import { esc, sample, shuffle } from "./format";

export type VocabDirection = "mix" | "en-ja" | "ja-en" | "listen";

export function poolForGrade(grade: GradeFilter): VocabWord[] {
  if (grade === "all" || !grade) return EQ_ALL_VOCAB.slice();
  return EQ_ALL_VOCAB.filter((word) => word.grade === grade);
}

function meaningPool(grade: GradeFilter): { w: string; m: string }[] {
  return poolForGrade(grade)
    .map((v) => ({ w: v.w, m: v.m }))
    .filter((v) => v.m);
}

export function pickVocab(grade: GradeFilter, count: number): VocabWord[] {
  const pool = poolForGrade(grade);
  if (!pool.length) return [];
  const now = Date.now();
  const enriched = pool.map((v) => {
    const ws = Store.state.words[v.w];
    let priority = 2;
    if (!ws || !ws.seen) priority = 1;
    else if (ws.due && ws.due <= now && ws.lv < 5) priority = 0;
    else if (ws.lv >= 5) priority = 3;
    return { v, priority, seen: ws ? ws.seen : 0, due: ws ? ws.due || 0 : 0 };
  });
  enriched.sort((a, b) => a.priority - b.priority || a.due - b.due || a.seen - b.seen || Math.random() - 0.5);
  const picked: VocabWord[] = [];
  const buckets: VocabWord[][] = [[], [], [], []];
  enriched.forEach((e) => buckets[e.priority].push(e.v));
  let guard = 0;
  while (picked.length < count && guard < 500) {
    guard += 1;
    let added = false;
    for (const bucket of [0, 1, 2, 3]) {
      if (buckets[bucket].length && picked.length < count) {
        const index = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * Math.min(buckets[bucket].length, 5));
        picked.push(buckets[bucket].splice(index, 1)[0]);
        added = true;
      }
    }
    if (!added) break;
  }
  return shuffle(picked).slice(0, count);
}

export function buildVocabQuestion(item: VocabWord, grade: GradeFilter, direction: VocabDirection): QuizQuestion {
  const pool = meaningPool(grade);
  const dir = direction === "mix" ? (Math.random() < 0.7 ? "en-ja" : "ja-en") : direction;
  let choices: string[];
  let answer: number;
  let question: string;
  let speakWord = "";

  if (dir === "listen") {
    const distractors = sample(
      pool.filter((p) => p.w !== item.w),
      3,
    ).map((p) => p.m);
    choices = shuffle([item.m, ...distractors]);
    answer = choices.indexOf(item.m);
    question = "🔊 音声を聞いて、意味を選びましょう";
    speakWord = item.w;
  } else if (dir === "ja-en") {
    const distractors = sample(
      pool.filter((p) => p.w !== item.w),
      3,
    ).map((p) => p.w);
    choices = shuffle([item.w, ...distractors]);
    answer = choices.indexOf(item.w);
    question = `「${esc(item.m)}」を表す英単語は？`;
  } else {
    const distractors = sample(
      pool.filter((p) => p.w !== item.w),
      3,
    ).map((p) => p.m);
    choices = shuffle([item.m, ...distractors]);
    answer = choices.indexOf(item.m);
    question = `<span class="en">${esc(item.w)}</span> の意味は？`;
  }

  return {
    question,
    choices,
    a: answer,
    exp: `<b>${esc(item.w)}</b> — ${esc(item.m)}<br>${esc(item.e)}<br><span class="muted">${esc(item.ej)}</span>`,
    word: item.w,
    grade: item.grade,
    kind: "vocab",
    speakWord,
  };
}

export function buildVocabQuestions(
  list: VocabWord[],
  direction: VocabDirection = "mix",
  grade?: GradeFilter,
): QuizQuestion[] {
  return list.map((item) => buildVocabQuestion(item, grade || item.grade, direction));
}

export function buildGrammarQuestions(topic: GrammarTopic): QuizQuestion[] {
  return topic.quiz.map((item) => ({
    question: esc(item.q).replace(/___/g, '<span class="blank">?</span>'),
    rawQuestion: item.q,
    choices: item.choices,
    a: item.a,
    exp: item.exp,
    kind: "grammar",
    topicId: topic.id,
  }));
}

export function buildReadingQuestions(passage: ReadingPassage): QuizQuestion[] {
  return passage.questions.map((item) => ({
    question: esc(item.q),
    choices: item.choices,
    a: item.a,
    exp: item.exp,
    kind: "reading",
  }));
}
