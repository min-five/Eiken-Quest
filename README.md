# EikenQuest

英検5級・4級・3級・準2級・2級・準1級・1級に対応した、ブラウザだけで動く学習アプリです。
1次試験対策・2次試験（面接）／5・4級スピーキングテストのシミュレーション・単語帳・ジャンル別英文法・時計／集中タイマーをひとつにまとめています。

React 18 + TypeScript + Vite で構築しています。画面はハッシュルーティング（`#/vocab` など）で切り替わり、学習データは従来どおり `localStorage`（`eikenquest.state.v1`）に保存されます。

## すぐに始める

Node.js 18 以上を用意し、このフォルダで次を実行してください。

```powershell
npm install
npm run dev
```

表示された URL（既定は `http://localhost:5173`）をブラウザで開きます。

### 本番用ビルド

```powershell
npm run build
npm run preview
```

`npm run build` は型チェック（`tsc --noEmit`）のあと、静的ファイルを `dist/` に出力します。`dist/` を任意の静的ホスティングに置けば公開できます。ビルド済みファイルは `index.html` を直接ダブルクリックしても動きません（`file://` ではモジュールを読み込めないため）。必ず HTTP サーバー経由で開いてください。

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動（HMR あり） |
| `npm run build` | 型チェック + 本番ビルド |
| `npm run preview` | ビルド結果をローカルで確認 |
| `npm run typecheck` | 型チェックのみ |

> 学習データはブラウザの `localStorage` に保存されます。サーバーには送信されません。

## 主な機能

- **ホーム** — 今日の目標、連続学習日数、レベル、週間グラフ、今日の単語、次のおすすめ
- **単語帳** — 級・状態・キーワードで絞り込み。発音、例文、お気に入り、間隔反復（SRS）
- **英文法** — 12ジャンル・約40テーマ。解説 → 例文 → 3問ミニクイズ
- **1次試験対策** — 単語・文法・読解・リスニング・制限時間つきミニ模試
- **2次試験（面接）** — 入室 → 音読 → Q&A → 意見 → スピーチ → 自己評価。5級・4級は録音型スピーキングテストに対応
- **時計・集中タイマー** — デジタル時計、ストップウォッチ、繰り返しタイマー、ポモドーロ。時計フォントは7種類
- **学習記録** — XP、28日ヒートマップ、分野別の定着度、バッジ、クイズ履歴
- **設定** — ライト／ダーク／システム、6色のアクセント、文字サイズ、効果音、1日の目標、データの書き出し・読み込み

## 級の切り替え

右上の級チップ、またはメニュー内の「学習中の級」から変更できます。
選択した級は単語・文法・1次試験の出題に反映されます。学習記録は級を変えても残ります。

## キーボードショートカット

| 操作 | キー |
| --- | --- |
| クイズの選択肢 | `1` 〜 `4` |
| 次の問題へ | `Enter` |
| タイマー開始／停止 | `Space` |
| ストップウォッチのラップ | `L` |
| ストップウォッチのリセット | `R` |
| メニューを閉じる | `Esc` |

## データについて

- 設定 → データ管理 → 「書き出す」でJSONバックアップを作成できます。
- 別の端末では「読み込む」から復元できます。
- 「学習データをリセット」はXP・履歴・バッジなどを初期化します（表示設定は保持）。
- ブラウザのデータ消去やシークレットモードでは記録が失われることがあります。

## ファイル構成

```text
index.html             Vite のエントリHTML（テーマの初回適用もここで実施）
vite.config.ts         Vite 設定
tsconfig.json          TypeScript 設定
public/
  favicon.svg          アイコン
  manifest.json        PWA用マニフェスト
src/
  main.tsx             React エントリポイント（CSS の読み込み）
  App.tsx              アプリシェル（トップバー・ドロワー・ルーティング・級選択）
  types.ts             共有型定義
  styles/
    tokens.css         デザイントークン（テーマ・アクセント・文字サイズ）
    base.css           リセットと基本要素
    layout.css         トップバー・ドロワー・タブバー
    components.css     カード・ボタン・モーダル・クイズなど
    pages.css          各ページ固有のスタイル
  lib/
    store.ts           localStorage・XP・SRS・バッジ
    router.ts          ハッシュルーター
    ui.ts              トースト・効果音・読み上げ・紙吹雪
    quiz-data.ts       クイズ問題の生成
    format.ts / fonts.ts / useStore.ts / useMedia.ts / app-context.ts
  data/
    vocabulary.ts      級・単語データ
    grammar.ts         文法ジャンル・レッスン
    exam.ts            読解・リスニング・面接データ
  components/
    Quiz.tsx           クイズエンジン
    Modal.tsx / ConfirmProvider.tsx / ToastHost.tsx / Bits.tsx / Icon.tsx
  pages/
    HomePage.tsx / VocabPage.tsx / GrammarPage.tsx / ExamPage.tsx
    InterviewPage.tsx / ClockPage.tsx / ProgressPage.tsx / SettingsPage.tsx
```

## 対応ブラウザ

最新の Chrome / Edge / Firefox / Safari を想定しています。
音声読み上げは `speechSynthesis` に対応したブラウザで利用できます。
