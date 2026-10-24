import { useEffect, useState } from "react";
import type { GradeFilter, VocabWord } from "../types";
import { EQ_ALL_VOCAB, EQ_GRADES, EQ_VOCAB_BY_WORD } from "../data/vocabulary";
import { useStore } from "../lib/useStore";
import { Store } from "../lib/store";
import { useApp } from "../lib/app-context";
import { buildVocabQuestions } from "../lib/quiz-data";
import { esc, gradeOf, sample } from "../lib/format";
import { sfx, speak, toast } from "../lib/ui";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";

type StatusFilter = "all" | "new" | "learning" | "due" | "mastered" | "fav";

interface StatusInfo {
  key: "new" | "learning" | "due" | "mastered";
  label: string;
  cls: string;
}

const ui = {
  grade: null as GradeFilter | null,
  q: "",
  status: "all" as StatusFilter,
  limit: 48,
  lastProfileGrade: null as GradeFilter | null,
};

function statusOf(word: string): StatusInfo {
  const ws = Store.state.words[word];
  if (!ws || !ws.seen) return { key: "new", label: "未学習", cls: "" };
  if (ws.lv >= 5) return { key: "mastered", label: "習得済み", cls: "vcard__status--mastered" };
  if (ws.due && ws.due <= Date.now()) return { key: "due", label: "復習どき", cls: "vcard__status--learning" };
  return { key: "learning", label: "学習中", cls: "vcard__status--learning" };
}

function countDue(): number {
  const now = Date.now();
  return Object.values(Store.state.words).filter((w) => w.seen > 0 && w.lv < 5 && w.due <= now).length;
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="stat">
      <span className={`stat__icon stat__icon--${tone}`}>{icon}</span>
      <div>
        <div className="stat__value">{value}</div>
        <div className="stat__label">{label}</div>
      </div>
    </div>
  );
}

function VocabDetail({ item, onClose }: { item: VocabWord; onClose: () => void }) {
  useStore();
  const ws = Store.state.words[item.w] || {};
  const st = statusOf(item.w);
  const lv = ws.lv || 0;
  const grade = gradeOf(item.grade);

  const toggleFav = () => {
    Store.toggleFav(item.w);
    toast(ws.fav ? "お気に入りから外しました" : "お気に入りに追加しました", "success");
    onClose();
  };

  const know = () => {
    Store.recordWord(item.w, true);
    Store.addXp(5);
    Store.checkBadges();
    sfx("correct");
    toast("覚えました！ +5 XP", "xp");
    onClose();
  };

  return (
    <Modal
      title="単語の詳細"
      onClose={onClose}
      actions={[
        {
          label: ws.fav ? "♥ お気に入り解除" : "♡ お気に入り",
          kind: "outline",
          onClick: toggleFav,
        },
        { label: "覚えた (+5XP)", kind: "primary", onClick: know },
      ]}
    >
      <div className="vocab-detail">
        <div className="row row--between" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="vocab-detail__word">{item.w}</div>
            <div className="vocab-detail__pos">
              {item.p} · {grade ? grade.full : item.grade}
            </div>
          </div>
          <button className="btn btn--soft btn--sm" type="button" onClick={() => speak(item.w)}>
            <Icon name="volume" size={15} /> 発音
          </button>
        </div>
        <div className="vocab-detail__meaning">{item.m}</div>
        <div className="vocab-detail__ex">
          <div className="en">{item.e}</div>
          <div className="row row--between" style={{ marginTop: 6 }}>
            <span className="ja">{item.ej}</span>
            <button
              className="example__speak"
              type="button"
              aria-label="例文を聞く"
              onClick={() => speak(item.e, { rate: 0.9 })}
            >
              <Icon name="volume" size={15} />
            </button>
          </div>
        </div>
        <div className="row row--between" style={{ margin: "18px 0 6px" }}>
          <span className="label">習熟度</span>
          <span className="pill">{st.label}</span>
        </div>
        <div className="row" style={{ gap: 4 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: i <= lv ? "var(--success)" : "var(--surface-3)",
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function VocabPage() {
  const state = useStore();
  const api = useApp();
  const profileGrade = state.profile.grade;

  const [grade, setGrade] = useState<GradeFilter>(() => {
    if (ui.grade === null) {
      ui.grade = profileGrade;
      ui.limit = 48;
    }
    return ui.grade;
  });
  const [q, setQ] = useState(ui.q);
  const [status, setStatus] = useState<StatusFilter>(ui.status);
  const [limit, setLimit] = useState(ui.limit);
  const [detail, setDetail] = useState<VocabWord | null>(null);

  /* Reset the filter when the profile grade changes elsewhere. */
  useEffect(() => {
    if (ui.lastProfileGrade !== null && profileGrade !== ui.lastProfileGrade) {
      ui.grade = profileGrade;
      ui.q = "";
      ui.status = "all";
      ui.limit = 48;
      setGrade(profileGrade);
      setQ("");
      setStatus("all");
      setLimit(48);
      setDetail(null);
    }
    ui.lastProfileGrade = profileGrade;
  }, [profileGrade]);

  const stats = Store.wordStats();
  const pool = grade === "all" ? EQ_ALL_VOCAB : EQ_ALL_VOCAB.filter((v) => v.grade === grade);
  const query = q.trim().toLowerCase();
  let filtered = pool;
  if (query) {
    filtered = filtered.filter(
      (v) => v.w.toLowerCase().includes(query) || v.m.includes(query) || v.e.toLowerCase().includes(query),
    );
  }
  if (status !== "all") {
    filtered = filtered.filter((v) => {
      const st = statusOf(v.w);
      if (status === "fav") return Store.state.words[v.w] && Store.state.words[v.w].fav;
      if (status === "due") return st.key === "due";
      return st.key === status;
    });
  }

  const show = filtered.slice(0, limit);

  const chooseGrade = (next: GradeFilter) => {
    ui.grade = next;
    ui.limit = 48;
    setGrade(next);
    setLimit(48);
    setDetail(null);
    sfx("click");
  };

  const updateSearch = (value: string) => {
    ui.q = value;
    ui.limit = 48;
    setQ(value);
    setLimit(48);
  };

  const updateStatus = (value: StatusFilter) => {
    ui.status = value;
    ui.limit = 48;
    setStatus(value);
    setLimit(48);
  };

  const more = () => {
    ui.limit += 48;
    setLimit((n) => n + 48);
  };

  const resetFilters = () => {
    updateSearch("");
    ui.status = "all";
    setStatus("all");
    sfx("click");
  };

  const toggleFav = (word: string) => {
    const on = Store.toggleFav(word);
    if (on) sfx("click");
  };

  const startQuiz = () => {
    if (!filtered.length) {
      toast("クイズにする単語がありません", "error");
      return;
    }
    let picked = filtered.filter((v) => {
      const ws = Store.state.words[v.w];
      return !ws || !ws.seen || (ws.due && ws.due <= Date.now());
    });
    if (picked.length < 4) picked = filtered;
    picked = sample(picked, 10);
    api.startQuiz({
      title: `単語クイズ（${picked.length}問）`,
      questions: buildVocabQuestions(picked, "mix", grade === "all" ? undefined : grade),
      grade,
      type: "vocab",
      backLabel: "単語帳に戻る",
    });
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow">Vocabulary</div>
            <h1>単語帳</h1>
            <p>級ごとの重要単語を、意味・例文・発音と一緒に。間隔反復（SRS）で、忘れる前に復習できます。</p>
          </div>
          <button className="btn btn--primary" type="button" data-quiz onClick={startQuiz}>
            <Icon name="play" size={17} />
            単語クイズを始める
          </button>
        </div>
      </div>

      <div className="grid grid--4 grid--tight" style={{ marginBottom: 20 }}>
        <StatCard icon="📚" label="学習した単語" value={stats.seen} tone="accent" />
        <StatCard icon="🧠" label="習得済み" value={stats.mastered} tone="teal" />
        <StatCard icon="⏰" label="復習どき" value={countDue()} tone="warn" />
        <StatCard icon="♡" label="お気に入り" value={stats.fav} tone="pink" />
      </div>

      <div className="card card--pad" style={{ padding: 16, marginBottom: 18 }}>
        <div className="segmented segmented--grades" style={{ marginBottom: 12 }} role="tablist" aria-label="級で絞り込む">
          <button
            type="button"
            data-grade="all"
            className={grade === "all" ? "is-active" : ""}
            onClick={() => chooseGrade("all")}
          >
            すべて
          </button>
          {EQ_GRADES.map((g) => (
            <button
              key={g.id}
              type="button"
              data-grade={g.id}
              className={grade === g.id ? "is-active" : ""}
              onClick={() => chooseGrade(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <div className="search-input" style={{ flex: 1 }}>
            <Icon name="search" size={18} />
            <input
              className="input"
              id="vocabSearch"
              type="search"
              placeholder="単語・意味・例文で検索"
              value={q}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </div>
          <select
            className="select"
            id="statusFilter"
            style={{ width: "auto", minWidth: 130 }}
            aria-label="状態で絞り込む"
            value={status}
            onChange={(e) => updateStatus(e.target.value as StatusFilter)}
          >
            <option value="all">すべての状態</option>
            <option value="new">未学習</option>
            <option value="learning">学習中</option>
            <option value="due">復習どき</option>
            <option value="mastered">習得済み</option>
            <option value="fav">お気に入り</option>
          </select>
          <button className="btn btn--outline btn--sm" type="button" data-reset-filter onClick={resetFilters}>
            <Icon name="reset" size={15} />
            リセット
          </button>
        </div>
        <div className="row row--between">
          <span className="toolbar__count" id="vocabCount">
            {filtered.length} 語が見つかりました
          </span>
          <span className="tiny muted">カードをタップで詳細 · 単語を10問で復習</span>
        </div>
      </div>

      <div className="vocab-grid" id="vocabGrid">
        {show.length === 0 ? (
          <div className="empty" style={{ gridColumn: "1/-1" }}>
            <div className="empty__icon">🔍</div>
            <h3>該当する単語がありません</h3>
            <p>検索条件や級を変えてみてください。</p>
          </div>
        ) : (
          show.map((v) => {
            const ws = Store.state.words[v.w] || {};
            const st = statusOf(v.w);
            const lv = ws.lv || 0;
            return (
              <button
                key={v.w}
                type="button"
                className={`vcard ${st.key === "mastered" ? "is-mastered" : ""}`}
                data-word={esc(v.w)}
                data-grade={v.grade}
                onClick={() => {
                  const item = EQ_VOCAB_BY_WORD[v.w];
                  if (item) {
                    sfx("click");
                    setDetail(item);
                  }
                }}
              >
                <div className="vcard__top">
                  <div>
                    <div className="vcard__word">{v.w}</div>
                    <div className="vcard__pos">{v.p}</div>
                  </div>
                  <span
                    className={`vcard__fav ${ws.fav ? "is-on" : ""}`}
                    data-fav={v.w}
                    role="button"
                    tabIndex={0}
                    aria-label="お気に入り"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(v.w);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFav(v.w);
                      }
                    }}
                  >
                    {ws.fav ? "♥" : "♡"}
                  </span>
                </div>
                <div className="vcard__meaning">{v.m}</div>
                <div className="vcard__ex">{v.e}</div>
                <div className="vcard__foot">
                  <span className={`vcard__status ${st.cls}`}>
                    <i />
                    {st.label}
                  </span>
                  <span className="vcard__level" title={`習熟度 ${lv}/5`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i key={i} className={i <= lv ? "on" : ""} />
                    ))}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="center" style={{ marginTop: 24 }} id="moreWrap">
        {filtered.length > limit ? (
          <button className="btn btn--outline" type="button" data-more onClick={more}>
            もっと見る（残り {filtered.length - limit} 語）
          </button>
        ) : null}
      </div>

      {detail ? <VocabDetail item={detail} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}
