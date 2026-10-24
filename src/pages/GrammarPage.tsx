import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { GradeFilter, GrammarTopic } from "../types";
import { EQ_GENRES, EQ_GRAMMAR } from "../data/grammar";
import { EQ_GRADES } from "../data/vocabulary";
import { useStore } from "../lib/useStore";
import { Store } from "../lib/store";
import { useApp } from "../lib/app-context";
import { buildGrammarQuestions } from "../lib/quiz-data";
import { gradeOf } from "../lib/format";
import { sfx, speak, toast } from "../lib/ui";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { GradeBadge, Progress } from "../components/Bits";

const ui = {
  grade: null as GradeFilter | null,
  q: "",
  lastProfileGrade: null as GradeFilter | null,
};

function topicsFor(grade: GradeFilter): GrammarTopic[] {
  return EQ_GRAMMAR.filter((t) => grade === "all" || t.grade === grade);
}

function TopicRow({
  topic,
  no,
  showDone = false,
  showGenre = true,
}: {
  topic: GrammarTopic;
  no: ReactNode;
  showDone?: boolean;
  showGenre?: boolean;
}) {
  const done = !!Store.state.grammarDone[topic.id];
  return (
    <a className={`topic-row ${done ? "is-done" : ""}`} href={`#/grammar/${topic.id}`}>
      <span className="topic-row__no">{no}</span>
      <span className="topic-row__body">
        <span className="topic-row__title">{topic.title}</span>
        <span className="topic-row__sub">
          {showGenre ? `${topic.genreName} · ` : ""}
          {topic.summary}
        </span>
      </span>
      <GradeBadge id={topic.grade} />
      {showDone && done ? <span className="pill pill--success">完了</span> : null}
      <span className="topic-row__go">
        <Icon name="right" size={17} />
      </span>
    </a>
  );
}

function GradeTabs({ grade, onPick }: { grade: GradeFilter; onPick: (id: GradeFilter) => void }) {
  return (
    <div className="segmented segmented--grades" style={{ marginBottom: 20 }} role="tablist" aria-label="級で絞り込む">
      <button type="button" data-grade="all" className={grade === "all" ? "is-active" : ""} onClick={() => onPick("all")}>
        すべて
      </button>
      {EQ_GRADES.map((g) => (
        <button
          key={g.id}
          type="button"
          data-grade={g.id}
          className={grade === g.id ? "is-active" : ""}
          onClick={() => onPick(g.id)}
        >
          {g.name}
        </button>
      ))}
    </div>
  );
}

function TopicIndex({
  grade,
  q,
  onGrade,
  onSearch,
  doneCount,
}: {
  grade: GradeFilter;
  q: string;
  onGrade: (id: GradeFilter) => void;
  onSearch: (value: string) => void;
  doneCount: number;
}) {
  const topics = topicsFor(grade);
  const genreCounts: Record<string, number> = {};
  topics.forEach((t) => {
    genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 1;
  });
  const genres = EQ_GENRES.filter((g) => grade === "all" || genreCounts[g.id]);
  const query = q.trim().toLowerCase();
  const list = topics.filter(
    (t) =>
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.summary.toLowerCase().includes(query) ||
      t.genreName.toLowerCase().includes(query),
  );
  const gradeInfo = gradeOf(grade);

  return (
    <>
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow">Grammar</div>
            <h1>英文法</h1>
            <p>ジャンルを選び、その中のテーマを学ぶ。解説 → 例文 → 3問クイズの流れで、確実に身につきます。</p>
          </div>
          <div className="row">
            <span className="pill pill--accent">
              {doneCount} / {EQ_GRAMMAR.length} テーマ完了
            </span>
          </div>
        </div>
      </div>

      <GradeTabs grade={grade} onPick={onGrade} />

      <div className="section-head">
        <div>
          <h2>
            <Icon name="grid" size={18} /> ジャンルから選ぶ
          </h2>
          <div className="section-head__sub">
            {grade === "all" ? "全レベル" : `${gradeInfo ? gradeInfo.full : grade} の文法`} · {genres.length} ジャンル
          </div>
        </div>
      </div>

      <div className="genre-grid" style={{ marginBottom: 32 }}>
        {genres.length ? (
          genres.map((g) => {
            const cnt = genreCounts[g.id] || 0;
            const gDone = topics.filter((t) => t.genre === g.id && Store.state.grammarDone[t.id]).length;
            return (
              <a
                className="genre-card"
                key={g.id}
                href={`#/grammar/${g.id}`}
                style={{ "--gc": g.color } as CSSProperties}
              >
                <span className="genre-card__icon">
                  <Icon name={g.icon as IconName} size={22} />
                </span>
                <span className="genre-card__name">{g.name}</span>
                <span className="genre-card__desc">{g.desc}</span>
                <span className="genre-card__foot">
                  <span className="genre-card__count">
                    {gDone} / {cnt} 完了
                  </span>
                  <span className="genre-card__arrow">
                    <Icon name="arrow" size={16} />
                  </span>
                </span>
              </a>
            );
          })
        ) : (
          <div className="empty" style={{ gridColumn: "1/-1" }}>
            <div className="empty__icon">📭</div>
            <h3>この級のジャンルはまだありません</h3>
            <p>「すべて」を選んで他のレベルも見てみましょう。</p>
          </div>
        )}
      </div>

      <div className="section-head">
        <div>
          <h2>
            <Icon name="book" size={18} /> テーマから選ぶ
          </h2>
          <div className="section-head__sub">{list.length} 件のレッスン</div>
        </div>
        <div className="search-input" style={{ maxWidth: 260, width: "100%" }}>
          <Icon name="search" size={17} />
          <input
            className="input"
            id="grammarSearch"
            type="search"
            placeholder="テーマを検索"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="topic-list" id="topicList">
        {list.length ? (
          list.map((t) => {
            const done = !!Store.state.grammarDone[t.id];
            const read = !!Store.state.grammarRead[t.id];
            return (
              <TopicRow
                key={t.id}
                topic={t}
                showDone
                no={done ? "✓" : read ? "…" : <Icon name="pen" size={15} />}
              />
            );
          })
        ) : (
          <div className="empty">
            <div className="empty__icon">🔍</div>
            <h3>見つかりませんでした</h3>
            <p>キーワードを変えてみてください。</p>
          </div>
        )}
      </div>

      <div className="callout" style={{ marginTop: 26 }}>
        <span className="callout__icon">🧭</span>
        <span>
          <b>使い方：</b>
          まずは現在の級のジャンルから1つ選びましょう。レッスンを読んだら3問クイズへ。間違えた問題は解説つきで復習できます。
        </span>
      </div>
    </>
  );
}

function GenreView({
  genreId,
  grade,
  onGrade,
  onShowAll,
}: {
  genreId: string;
  grade: GradeFilter;
  onGrade: (id: GradeFilter) => void;
  onShowAll: () => void;
}) {
  const genre = EQ_GENRES.find((g) => g.id === genreId);
  if (!genre) return null;
  const topics = EQ_GRAMMAR.filter((t) => t.genre === genreId);
  const filtered = topics.filter((t) => grade === "all" || t.grade === grade);

  return (
    <>
      <a href="#/grammar" className="btn btn--ghost btn--sm" style={{ marginBottom: 14 }}>
        <Icon name="left" size={16} />
        ジャンル一覧
      </a>
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow" style={{ color: genre.color }}>
              Grammar Genre
            </div>
            <h1>{genre.name}</h1>
            <p>
              {genre.desc}。全{topics.length}テーマ。
            </p>
          </div>
          <span
            className="genre-card__icon"
            style={{ margin: 0, width: 58, height: 58, "--gc": genre.color } as CSSProperties}
          >
            <Icon name={genre.icon as IconName} size={26} />
          </span>
        </div>
      </div>

      <GradeTabs grade={grade} onPick={onGrade} />

      {filtered.length ? (
        <div className="topic-list">
          {filtered.map((t, i) => {
            const done = !!Store.state.grammarDone[t.id];
            const read = !!Store.state.grammarRead[t.id];
            return (
              <TopicRow
                key={t.id}
                topic={t}
                showGenre={false}
                no={done ? "✓" : read ? "…" : String(i + 1).padStart(2, "0")}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <div className="empty__icon">🎯</div>
          <h3>この級にはまだテーマがありません</h3>
          <p>「すべて」を選ぶと、他の級のテーマも学べます。</p>
          <button className="btn btn--primary" type="button" data-show-all onClick={onShowAll}>
            すべて表示
          </button>
        </div>
      )}

      <div className="callout callout--teal" style={{ marginTop: 24 }}>
        <span className="callout__icon">📘</span>
        <span>
          各レッスンは約3〜5分。読み終えたら3問のミニクイズで理解を確認しましょう。完了したテーマは学習記録に反映されます。
        </span>
      </div>
    </>
  );
}

function LessonView({ topic }: { topic: GrammarTopic }) {
  const api = useApp();
  useStore();
  const done = Store.state.grammarDone[topic.id];
  const idx = EQ_GRAMMAR.findIndex((t) => t.id === topic.id);
  const prev = idx > 0 ? EQ_GRAMMAR[idx - 1] : null;
  const next = idx >= 0 && idx < EQ_GRAMMAR.length - 1 ? EQ_GRAMMAR[idx + 1] : null;
  const sameGenre = EQ_GRAMMAR.filter((t) => t.genre === topic.genre);
  const pos = sameGenre.findIndex((t) => t.id === topic.id) + 1;
  const genreDone = sameGenre.filter((t) => Store.state.grammarDone[t.id]).length;
  const genrePct = sameGenre.length ? Math.round((genreDone / sameGenre.length) * 100) : 0;

  useEffect(() => {
    Store.markGrammarRead(topic.id);
  }, [topic.id]);

  const startQuiz = () => {
    api.startQuiz({
      title: `${topic.title} · 確認クイズ`,
      questions: buildGrammarQuestions(topic),
      grade: topic.grade,
      type: "grammar",
      xpPerQuestion: 12,
      completionBonus: 24,
      backLabel: "レッスンに戻る",
      onComplete: ({ score, total, pct }) => {
        if (score >= 2) {
          Store.markGrammarDone(topic.id, score, total);
          const badges = Store.checkBadges();
          if (pct === 100) toast("満点！テーマを完了しました 🎉", "success");
          else toast("テーマを完了しました", "success");
          if (badges.length) badges.forEach((b) => toast(`バッジ獲得！ ${b.icon} ${b.name}`, "success"));
          sfx("complete");
        } else {
          toast("あと1問。解説を読んで、もう一度挑戦しましょう。", "info");
        }
      },
    });
  };

  const scrollTo = (key: string) => {
    const target = key === "ex" ? document.getElementById("sec-ex") : document.getElementById(`sec-${key}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page lesson">
      <div className="lesson__main">
        <div className="row row--wrap" style={{ marginBottom: 14 }}>
          <a href={`#/grammar/${topic.genre}`} className="btn btn--ghost btn--sm">
            <Icon name="left" size={15} />
            {topic.genreName}
          </a>
          <span className="small muted">
            {pos} / {sameGenre.length} · {topic.genreName}
          </span>
          <span className="spacer" />
          <GradeBadge id={topic.grade} />
          {done ? <span className="pill pill--success">✓ 完了</span> : null}
        </div>

        <h1>{topic.title}</h1>
        <p className="lesson__lead">{topic.summary}</p>

        {topic.sections.map((sec, i) => (
          <section className="lesson-section" id={`sec-${i}`} key={`${sec.h}-${i}`}>
            <h2>
              <span className="num">{i + 1}</span>
              {sec.h}
            </h2>
            <p dangerouslySetInnerHTML={{ __html: sec.b }} />
          </section>
        ))}

        {topic.examples && topic.examples.length ? (
          <section className="lesson-section" id="sec-ex">
            <h2>
              <span className="num">{topic.sections.length + 1}</span>例文で確認
            </h2>
            <div className="example-list">
              {topic.examples.map((ex, i) => (
                <div className="example" key={i}>
                  <div className="example__body">
                    <div className="example__en" dangerouslySetInnerHTML={{ __html: ex.en }} />
                    <div className="example__ja">{ex.ja}</div>
                  </div>
                  <button
                    className="example__speak"
                    type="button"
                    aria-label="例文を聞く"
                    onClick={() => speak(ex.en.replace(/<[^>]+>/g, ""), { rate: 0.9 })}
                  >
                    <Icon name="volume" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {topic.tip ? (
          <div className="callout" style={{ margin: "18px 0" }}>
            <span className="callout__icon">💡</span>
            <span>
              <b>ヒント：</b>
              {topic.tip}
            </span>
          </div>
        ) : null}

        <section
          className="card card--pad"
          style={{
            marginTop: 22,
            background: "linear-gradient(145deg,var(--accent-soft),var(--surface))",
            borderColor: "color-mix(in srgb,var(--accent) 20%,var(--border))",
          }}
        >
          <div className="row row--between row--wrap">
            <div>
              <div className="card__title">
                <Icon name="target" size={18} /> 理解度チェック
              </div>
              <div className="card__sub">3問のミニクイズで、今日の理解を確認しましょう。</div>
            </div>
            <button className="btn btn--primary" type="button" data-topic-quiz onClick={startQuiz}>
              <Icon name="play" size={16} />
              {done ? "もう一度挑戦" : "3問クイズへ"}
            </button>
          </div>
          {done ? (
            <p className="small muted" style={{ marginTop: 10 }}>
              前回のベスト：{done.best || 0} / {done.total || 3}
            </p>
          ) : null}
        </section>

        <div className="lesson__nav">
          {prev ? (
            <a className="btn btn--outline btn--sm" href={`#/grammar/${prev.id}`}>
              <Icon name="left" size={15} />
              {prev.title}
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a className="btn btn--outline btn--sm" href={`#/grammar/${next.id}`}>
              {next.title}
              <Icon name="right" size={15} />
            </a>
          ) : (
            <span />
          )}
        </div>
      </div>

      <aside className="lesson__aside">
        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div className="small" style={{ fontWeight: 800, marginBottom: 10 }}>
            このレッスンの目次
          </div>
          <div className="lesson__toc">
            {topic.sections.map((sec, i) => (
              <a
                key={`${sec.h}-toc-${i}`}
                href={`#/grammar/${topic.id}`}
                data-toc={i}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(String(i));
                }}
              >
                <span className="dot" />
                {sec.h}
              </a>
            ))}
            <a
              href={`#/grammar/${topic.id}`}
              data-toc="ex"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("ex");
              }}
            >
              <span className="dot" />
              例文で確認
            </a>
          </div>
        </div>
        <div className="card card--pad" style={{ marginBottom: 14 }}>
          <div className="small" style={{ fontWeight: 800, marginBottom: 8 }}>
            {topic.genreName} の進捗
          </div>
          <Progress pct={genrePct} />
          <div className="tiny muted" style={{ marginTop: 6 }}>
            {genreDone} / {sameGenre.length} テーマ完了
          </div>
          <a
            href={`#/grammar/${topic.genre}`}
            className="btn btn--outline btn--sm btn--block"
            style={{ marginTop: 12 }}
          >
            ジャンル一覧へ
          </a>
        </div>
        <div className="card card--pad">
          <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>
            学習のコツ
          </div>
          <p className="tiny muted" style={{ lineHeight: 1.7, margin: 0 }}>
            {topic.tip}
          </p>
        </div>
      </aside>
    </div>
  );
}

export function GrammarPage({ params }: { params: string[] }) {
  const state = useStore();
  const profileGrade = state.profile.grade;

  const [grade, setGrade] = useState<GradeFilter>(() => {
    if (ui.grade === null) ui.grade = profileGrade;
    return ui.grade;
  });
  const [q, setQ] = useState(ui.q);

  useEffect(() => {
    if (ui.lastProfileGrade !== null && profileGrade !== ui.lastProfileGrade) {
      ui.grade = profileGrade;
      setGrade(profileGrade);
    }
    ui.lastProfileGrade = profileGrade;
  }, [profileGrade]);

  const chooseGrade = (id: GradeFilter) => {
    ui.grade = id;
    setGrade(id);
    Store.setGrade(id);
    sfx("click");
  };

  const updateSearch = (value: string) => {
    ui.q = value;
    setQ(value);
  };

  const id = params[0];
  const topic = id ? EQ_GRAMMAR.find((t) => t.id === id) : undefined;
  const genre = id ? EQ_GENRES.find((g) => g.id === id) : undefined;

  if (topic) return <LessonView key={topic.id} topic={topic} />;

  return (
    <div className="page">
      {genre ? (
        <GenreView
          genreId={genre.id}
          grade={grade}
          onGrade={chooseGrade}
          onShowAll={() => {
            ui.grade = "all";
            setGrade("all");
          }}
        />
      ) : (
        <TopicIndex
          grade={grade}
          q={q}
          onGrade={chooseGrade}
          onSearch={updateSearch}
          doneCount={Object.keys(state.grammarDone).length}
        />
      )}
    </div>
  );
}
