import { useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AccentId, FontSize, PomodoroSettings, ThemePref } from "../types";
import { EQ_ALL_VOCAB, EQ_GRADE_MAP } from "../data/vocabulary";
import { EQ_GENRES, EQ_GRAMMAR } from "../data/grammar";
import { useStore } from "../lib/useStore";
import { Store } from "../lib/store";
import { useApp } from "../lib/app-context";
import { debounce, fmtDate } from "../lib/format";
import { clockFontFamily } from "../lib/fonts";
import { sfx, speak, toast } from "../lib/ui";
import { APP_VERSION } from "../lib/constants";
import { confirmDialog } from "../components/ConfirmProvider";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { CloudSyncSection } from "../components/CloudSyncSection";

const THEMES: { id: ThemePref; label: string; icon: IconName; desc: string }[] = [
  { id: "light", label: "ライト", icon: "sun", desc: "明るい背景" },
  { id: "dark", label: "ダーク", icon: "moon", desc: "目にやさしい" },
  { id: "system", label: "システム", icon: "monitor", desc: "端末に合わせる" },
];

const ACCENTS: { id: AccentId; label: string; color: string }[] = [
  { id: "indigo", label: "インディゴ", color: "#4f46e5" },
  { id: "teal", label: "ティール", color: "#0d9488" },
  { id: "rose", label: "ローズ", color: "#e11d48" },
  { id: "violet", label: "バイオレット", color: "#7c3aed" },
  { id: "amber", label: "アンバー", color: "#d97706" },
  { id: "blue", label: "ブルー", color: "#2563eb" },
];

const CLOCK_FONTS = [
  { id: "orbitron", name: "Orbitron（デジタル）" },
  { id: "tech", name: "Share Tech（モノスペース）" },
  { id: "rounded", name: "丸ゴシック（やわらか）" },
  { id: "serif", name: "明朝（上品）" },
  { id: "hand", name: "手書き（あたたかい）" },
  { id: "pixel", name: "ドット（レトロ）" },
  { id: "manrope", name: "Manrope（モダン）" },
] as const;

const DAILY_GOALS = [20, 30, 50, 80, 120, 200];

function gradeName(id: string): string {
  if (id === "all") return "すべての級";
  const g = EQ_GRADE_MAP[id as keyof typeof EQ_GRADE_MAP];
  return g ? g.full : id;
}

function SettingRow({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div className="setting-row__body">
        <div className="setting-row__title">{title}</div>
        {desc ? <div className="setting-row__desc">{desc}</div> : null}
      </div>
      <div className="setting-row__control">{children}</div>
    </div>
  );
}

function Toggle({
  id,
  checked,
  label,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch__track" />
    </label>
  );
}

export function SettingsPage() {
  const s = useStore();
  const api = useApp();
  const set = s.settings;
  const prof = s.profile;
  const pomo = set.pomo || { focus: 25, break: 5, long: 15, cycles: 4, auto: true };
  const g = prof.grade === "all" ? null : EQ_GRADE_MAP[prof.grade];
  const now = new Date();
  const clockSample = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const [name, setName] = useState(prof.name || "学習者");
  const saveName = useMemo(
    () =>
      debounce((value: string) => {
        Store.setProfile({ name: value.trim() || "学習者" });
      }, 300),
    [],
  );

  const [pc, setPc] = useState<PomodoroSettings>({
    focus: Number(pomo.focus || 25),
    break: Number(pomo.break || 5),
    long: Number(pomo.long || 15),
    cycles: Number(pomo.cycles || 4),
    auto: pomo.auto !== false,
  });

  const fileRef = useRef<HTMLInputElement>(null);

  let bytes = 0;
  try {
    bytes = new Blob([Store.exportJSON()]).size;
  } catch {
    bytes = 0;
  }
  const sizeLabel = bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const earned = (s.badges || []).length;

  const savePomodoro = (next: PomodoroSettings) => {
    const clean: PomodoroSettings = {
      focus: Math.max(1, Math.min(120, Number(next.focus) || 25)),
      break: Math.max(1, Math.min(60, Number(next.break) || 5)),
      long: Math.max(1, Math.min(60, Number(next.long) || 15)),
      cycles: Math.max(2, Math.min(10, Number(next.cycles) || 4)),
      auto: !!next.auto,
    };
    setPc(clean);
    Store.setSetting("pomo", clean);
  };

  const exportData = () => {
    try {
      const data = Store.exportJSON();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const d = new Date();
      a.href = url;
      a.download = `eikenquest-backup-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
        d.getDate(),
      ).padStart(2, "0")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1200);
      toast("学習データを書き出しました", "success");
      sfx("complete");
    } catch {
      toast("書き出しに失敗しました", "error");
    }
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        Store.importJSON(String(reader.result || ""));
        setName(Store.state.profile.name || "学習者");
        toast("学習データを読み込みました", "success");
        sfx("complete");
      } catch (err) {
        toast(`読み込みに失敗しました：${err instanceof Error ? err.message : "形式を確認してください"}`, "error", 4200);
      }
    };
    reader.onerror = () => toast("ファイルを読み込めませんでした", "error");
    reader.readAsText(file, "utf-8");
  };

  const resetData = () => {
    void confirmDialog({
      title: "学習データをリセットしますか？",
      message:
        "XP・連続記録・単語の習得状況・クイズ履歴・バッジがすべて消えます。表示設定は保持されます。この操作は取り消せません。",
      confirmLabel: "リセットする",
      cancelLabel: "やめる",
      danger: true,
    }).then((ok) => {
      if (!ok) return;
      Store.reset(true);
      setName(Store.state.profile.name || "学習者");
      toast("学習データをリセットしました", "success");
    });
  };

  return (
    <div className="page settings-wrap">
      <div className="page-head">
        <div className="page-head-row">
          <div>
            <div className="eyebrow">Settings</div>
            <h1>設定</h1>
            <p>見た目・学習目標・時計の表示を、自分に合わせてカスタマイズ。変更は自動で保存されます。</p>
          </div>
          <span className="pill pill--success">
            <Icon name="check" size={14} /> 自動保存
          </span>
        </div>
      </div>

      {/* ---------------- Profile ---------------- */}
      <section className="settings-group">
        <div className="settings-group__head">
          <h2>
            <Icon name="star" size={18} /> プロフィール
          </h2>
          <p>ホームのあいさつや記録に使われます。</p>
        </div>
        <div className="setting-row">
          <div className="setting-row__body">
            <div className="setting-row__title">ニックネーム</div>
            <div className="setting-row__desc">アプリ内に表示される名前です（20文字まで）。</div>
          </div>
          <div className="setting-row__control setting-row__control--nick">
            <input
              className="input"
              id="setName"
              type="text"
              maxLength={20}
              autoComplete="nickname"
              value={name}
              aria-label="ニックネーム"
              onChange={(e) => {
                setName(e.target.value);
                saveName(e.target.value);
              }}
              onBlur={() => {
                const value = name.trim() || "学習者";
                setName(value);
                Store.setProfile({ name: value });
              }}
            />
          </div>
        </div>
        <SettingRow title="学習する級" desc="単語・文法・試験対策の出題レベルが切り替わります。">
          <div className="row" style={{ gap: 8 }}>
            <span className="grade-badge" style={{ "--g": g ? g.color : "#4f46e5" } as CSSProperties}>
              {gradeName(prof.grade)}
            </span>
            <button className="btn btn--outline btn--sm" type="button" data-change-grade onClick={() => api.openGradePicker()}>
              変更
            </button>
          </div>
        </SettingRow>
      </section>

      {/* ---------------- Appearance ---------------- */}
      <section className="settings-group">
        <div className="settings-group__head">
          <h2>
            <Icon name="sun" size={18} /> 表示とテーマ
          </h2>
          <p>ダークモード・アクセントカラー・文字サイズを変更できます。</p>
        </div>
        <div className="theme-cards">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-card ${set.theme === t.id ? "is-active" : ""}`}
              data-theme-opt={t.id}
              aria-pressed={set.theme === t.id}
              onClick={() => {
                Store.setSetting("theme", t.id);
                sfx("click");
                toast(
                  t.id === "dark"
                    ? "ダークモードに切り替えました"
                    : t.id === "light"
                      ? "ライトモードに切り替えました"
                      : "端末の設定に合わせます",
                  "info",
                  1600,
                );
              }}
            >
              <span className={`theme-card__preview theme-card__preview--${t.id === "system" ? "auto" : t.id}`}>
                <span className="theme-card__bar" />
                <span className="theme-card__bar accent" />
                <span className="theme-card__bar" style={{ width: "52%" }} />
              </span>
              <span className="theme-card__label">{t.label}</span>
              <span className="theme-card__check">✓</span>
            </button>
          ))}
        </div>
        <SettingRow title="アクセントカラー" desc="ボタンやグラフの基調色を選びます。">
          <div className="accent-swatches">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`swatch ${set.accent === a.id ? "is-active" : ""}`}
                data-accent-opt={a.id}
                style={{ "--sw": a.color } as CSSProperties}
                title={a.label}
                aria-label={a.label}
                aria-pressed={set.accent === a.id}
                onClick={() => {
                  Store.setSetting("accent", a.id);
                  sfx("click");
                }}
              />
            ))}
          </div>
        </SettingRow>
        <SettingRow title="文字サイズ" desc="本文の大きさを3段階で調整します。">
          <select
            className="select"
            id="setFontSize"
            aria-label="文字サイズ"
            value={set.fontSize}
            onChange={(e) => {
              Store.setSetting("fontSize", e.target.value as FontSize);
              sfx("click");
            }}
          >
            <option value="small">小さめ</option>
            <option value="normal">標準</option>
            <option value="large">大きめ</option>
          </select>
        </SettingRow>
        <SettingRow title="アニメーションを減らす" desc="動きを抑えて、集中しやすい表示にします。">
          <Toggle
            id="setMotion"
            checked={set.motion === "reduce"}
            label="アニメーションを減らす"
            onChange={(checked) => Store.setSetting("motion", checked ? "reduce" : "full")}
          />
        </SettingRow>
      </section>

      {/* ---------------- Sound ---------------- */}
      <section className="settings-group">
        <div className="settings-group__head">
          <h2>
            <Icon name="headphones" size={18} /> サウンドと読み上げ
          </h2>
          <p>効果音とタイマー音のオン・オフを設定します。読み上げはブラウザの音声機能を使います。</p>
        </div>
        <SettingRow title="効果音" desc="正解・不正解・完了時などの効果音を鳴らします。">
          <Toggle
            id="setSound"
            checked={set.sound !== false}
            label="効果音"
            onChange={(checked) => {
              Store.setSetting("sound", checked);
              if (checked) sfx("correct");
            }}
          />
        </SettingRow>
        <SettingRow title="タイマー終了音" desc="タイマーやポモドーロの終了時にアラームを鳴らします。">
          <Toggle
            id="setTimerSound"
            checked={set.timerSound !== false}
            label="タイマー終了音"
            onChange={(checked) => {
              Store.setSetting("timerSound", checked);
              if (checked) sfx("alarm");
            }}
          />
        </SettingRow>
        <SettingRow title="音声のテスト" desc="端末の音量と読み上げ音声を確認できます。">
          <button
            className="btn btn--soft btn--sm"
            type="button"
            data-test-sound
            onClick={() => {
              sfx("complete");
              speak("Hello! This is a voice test for EikenQuest.", { rate: 0.9 });
              toast("効果音と読み上げをテストしました", "info");
            }}
          >
            <Icon name="volume" size={15} /> テスト
          </button>
        </SettingRow>
      </section>

      {/* ---------------- Learning ---------------- */}
      <section className="settings-group">
        <div className="settings-group__head">
          <h2>
            <Icon name="target" size={18} /> 学習目標
          </h2>
          <p>毎日の達成度と連続記録の計算に使います。</p>
        </div>
        <SettingRow title="1日の目標XP" desc="無理なく続けられる量に設定しましょう。">
          <select
            className="select"
            id="setDailyGoal"
            aria-label="1日の目標XP"
            value={set.dailyGoal || 50}
            onChange={(e) => {
              const value = Number(e.target.value) || 50;
              Store.setSetting("dailyGoal", value);
              toast(`1日の目標を ${value} XP に設定しました`, "success", 1800);
            }}
          >
            {DAILY_GOALS.map((n) => (
              <option key={n} value={n}>
                {n} XP
              </option>
            ))}
          </select>
        </SettingRow>
        <SettingRow title="タイマーの自動継続" desc="繰り返しタイマーで、次のセットを自動的に開始します。">
          <Toggle
            id="setAutoNext"
            checked={set.autoNext !== false}
            label="タイマーの自動継続"
            onChange={(checked) => Store.setSetting("autoNext", checked)}
          />
        </SettingRow>
        <div className="setting-row">
          <div className="setting-row__body">
            <div className="setting-row__title">学習の記録</div>
            <div className="setting-row__desc">XP・バッジ・単語の定着度を確認できます。</div>
          </div>
          <div className="setting-row__control">
            <a className="btn btn--outline btn--sm" href="#/progress">
              記録を見る
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- Clock ---------------- */}
      <section className="settings-group">
        <div className="settings-group__head">
          <h2>
            <Icon name="clock" size={18} /> 時計と集中タイマー
          </h2>
          <p>時計ページの表示形式とポモドーロの初期値を設定します。</p>
        </div>
        <div className="setting-row">
          <div className="setting-row__body">
            <div className="setting-row__title">時計のフォント</div>
            <div className="setting-row__desc">デジタル時計・タイマー・ストップウォッチに反映されます。</div>
          </div>
          <div className="setting-row__control" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span
              className="settings-clock-preview"
              id="setClockPreview"
              style={{ fontFamily: clockFontFamily(set.clockFont) }}
            >
              {clockSample}
            </span>
            <select
              className="select"
              id="setClockFont"
              aria-label="時計のフォント"
              style={{ minWidth: 190 }}
              value={set.clockFont}
              onChange={(e) => {
                Store.setSetting("clockFont", e.target.value as typeof set.clockFont);
                sfx("click");
              }}
            >
              {CLOCK_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <SettingRow title="24時間表示" desc="オフにすると AM / PM の12時間表示になります。">
          <Toggle
            id="setClock24"
            checked={set.clock24h !== false}
            label="24時間表示"
            onChange={(checked) => Store.setSetting("clock24h", checked)}
          />
        </SettingRow>
        <SettingRow title="秒を表示" desc="時計に秒を表示します。">
          <Toggle
            id="setClockSeconds"
            checked={set.clockSeconds !== false}
            label="秒を表示"
            onChange={(checked) => Store.setSetting("clockSeconds", checked)}
          />
        </SettingRow>
        <SettingRow
          title="画面スリープ防止（常時点灯）"
          desc="学習中や時計・タイマー表示中に、端末の画面が自動で暗くなったり消灯・ロックされるのを防ぎます。"
        >
          <Toggle
            id="setKeepAwake"
            checked={set.keepAwake !== false}
            label="画面スリープ防止"
            onChange={(checked) => Store.setSetting("keepAwake", checked)}
          />
        </SettingRow>
        <SettingRow
          title="省エネモード（バッテリー節約）"
          desc="アニメーションや半透明効果を抑え、OLED向け真黒（ピュアブラック）表示に切り替えてバッテリー消費を大幅に削減します。"
        >
          <Toggle
            id="setEcoMode"
            checked={!!set.ecoMode}
            label="省エネモード"
            onChange={(checked) => Store.setSetting("ecoMode", checked)}
          />
        </SettingRow>
        <div className="setting-row" style={{ display: "block" }}>
          <div className="setting-row__body">
            <div className="setting-row__title">ポモドーロの初期値</div>
            <div className="setting-row__desc">集中・休憩の長さと、長休憩までのセット数を決めます。</div>
          </div>
          <div className="pomo-settings" style={{ marginTop: 12 }}>
            <label className="field">
              <span className="label">集中（分）</span>
              <input
                className="input"
                id="pomoFocus"
                type="number"
                min={1}
                max={120}
                value={pc.focus}
                onChange={(e) => savePomodoro({ ...pc, focus: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span className="label">休憩（分）</span>
              <input
                className="input"
                id="pomoBreak"
                type="number"
                min={1}
                max={60}
                value={pc.break}
                onChange={(e) => savePomodoro({ ...pc, break: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span className="label">長休憩（分）</span>
              <input
                className="input"
                id="pomoLong"
                type="number"
                min={1}
                max={60}
                value={pc.long}
                onChange={(e) => savePomodoro({ ...pc, long: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span className="label">長休憩までのセット</span>
              <input
                className="input"
                id="pomoCycles"
                type="number"
                min={2}
                max={10}
                value={pc.cycles}
                onChange={(e) => savePomodoro({ ...pc, cycles: Number(e.target.value) })}
              />
            </label>
          </div>
          <label className="switch" style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              id="pomoAuto"
              checked={pc.auto !== false}
              onChange={(e) => savePomodoro({ ...pc, auto: e.target.checked })}
            />
            <span className="switch__track" />
            <span className="switch__text">自動で次のセッションへ</span>
          </label>
        </div>
        <div className="setting-row">
          <div className="setting-row__body">
            <div className="setting-row__title">集中タイマーを開く</div>
            <div className="setting-row__desc">時計・ストップウォッチ・繰り返しタイマー・ポモドーロ。</div>
          </div>
          <div className="setting-row__control">
            <a className="btn btn--soft btn--sm" href="#/clock">
              時計ページへ
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- Cloud Sync ---------------- */}
      <CloudSyncSection />

      {/* ---------------- Data ---------------- */}
      <section className="settings-group">
        <div className="settings-group__head">
          <h2>
            <Icon name="download" size={18} /> データ管理
          </h2>
          <p>学習データはこの端末のブラウザに保存されています（約 {sizeLabel}）。</p>
        </div>
        <SettingRow title="エクスポート" desc="学習記録をJSONファイルとして保存し、別の端末へ移せます。">
          <button className="btn btn--outline btn--sm" type="button" data-export onClick={exportData}>
            <Icon name="download" size={15} /> 書き出す
          </button>
        </SettingRow>
        <SettingRow title="インポート" desc="書き出したJSONファイルから学習データを復元します。">
          <button className="btn btn--outline btn--sm" type="button" data-import onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={15} /> 読み込む
          </button>
        </SettingRow>
        <SettingRow title="学習データをリセット" desc="XP・単語・履歴・バッジなどを初期化します。表示設定は保持されます。">
          <button className="btn btn--danger btn--sm" type="button" data-reset onClick={resetData}>
            <Icon name="trash" size={15} /> リセット
          </button>
        </SettingRow>
        <input
          ref={fileRef}
          type="file"
          id="importFile"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (file) importData(file);
            e.target.value = "";
          }}
        />
      </section>

      {/* ---------------- About ---------------- */}
      <section className="settings-group">
        <div className="settings-group__head">
          <h2>
            <Icon name="info" size={18} /> EikenQuest について
          </h2>
          <p>英検5級から1級までを、ひとつの場所で。</p>
        </div>
        <div className="setting-row" style={{ display: "block" }}>
          <dl className="key-value">
            <dt>バージョン</dt>
            <dd>{APP_VERSION}</dd>
            <dt>収録単語</dt>
            <dd>{EQ_ALL_VOCAB ? EQ_ALL_VOCAB.length : 0} 語</dd>
            <dt>文法レッスン</dt>
            <dd>
              {EQ_GRAMMAR.length} テーマ / {EQ_GENRES.length} ジャンル
            </dd>
            <dt>獲得バッジ</dt>
            <dd>{earned} 個</dd>
            <dt>利用開始</dt>
            <dd>{fmtDate(s.createdAt || Date.now())}</dd>
          </dl>
        </div>
        <div className="setting-row" style={{ display: "block" }}>
          <div className="setting-row__title" style={{ marginBottom: 10 }}>
            キーボードショートカット
          </div>
          <dl className="key-value">
            <dt>クイズの選択</dt>
            <dd>
              <span className="kbd">1</span> 〜 <span className="kbd">4</span>
            </dd>
            <dt>次の問題へ</dt>
            <dd>
              <span className="kbd">Enter</span>
            </dd>
            <dt>タイマー開始 / 停止</dt>
            <dd>
              <span className="kbd">Space</span>
            </dd>
            <dt>ストップウォッチ</dt>
            <dd>
              <span className="kbd">L</span> ラップ · <span className="kbd">R</span> リセット
            </dd>
            <dt>メニューを閉じる</dt>
            <dd>
              <span className="kbd">Esc</span>
            </dd>
          </dl>
        </div>
        <div className="setting-row">
          <div className="setting-row__body">
            <div className="setting-row__title">オフラインでも使えます</div>
            <div className="setting-row__desc">ページを開いた後は、通信なしでも学習を続けられます。</div>
          </div>
          <div className="setting-row__control">
            <span className="pill pill--success">端末保存</span>
          </div>
        </div>
      </section>

      <p className="tiny muted center">変更内容はこのブラウザに自動保存されます。同期キーを設定するとPCとスマホ間で完全自動同期されます。</p>
    </div>
  );
}
