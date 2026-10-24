/* ============================================================
   Eiken Dictation & Word Order Practice Prompts
   ============================================================ */
import type { DictationItem } from "../types";

export const DICTATION_ITEMS: DictationItem[] = [
  /* ---- 5級 ---- */
  {
    id: "d5-1",
    grade: "5",
    en: "I play soccer with my friends every Sunday.",
    ja: "私は毎週日曜日、友達とサッカーをします。",
    category: "日常行動",
    hint: "every Sunday は文末に置きます",
  },
  {
    id: "d5-2",
    grade: "5",
    en: "What time do you usually eat breakfast?",
    ja: "あなたは普段何時に朝食を食べますか？",
    category: "疑問文",
    hint: "What time で始まる疑問文です",
  },
  {
    id: "d5-3",
    grade: "5",
    en: "My sister likes listening to music in her room.",
    ja: "私の姉は部屋で音楽を聴くことが好きです。",
    category: "動名詞",
    hint: "like ~ing で「〜することが好き」",
  },

  /* ---- 4級 ---- */
  {
    id: "d4-1",
    grade: "4",
    en: "We are going to visit the new museum tomorrow.",
    ja: "私たちは明日、新しい博物館を訪れる予定です。",
    category: "未来の表現",
    hint: "be going to + 動詞の原形",
  },
  {
    id: "d4-2",
    grade: "4",
    en: "This book is more interesting than that one.",
    ja: "この本はあの本よりも面白いです。",
    category: "比較級",
    hint: "more + 形容詞 + than",
  },
  {
    id: "d4-3",
    grade: "4",
    en: "You must not take pictures inside the library.",
    ja: "図書館の中で写真を撮ってはいけません。",
    category: "助動詞",
    hint: "must not は「〜してはならない」",
  },

  /* ---- 3級 ---- */
  {
    id: "d3-1",
    grade: "3",
    en: "Have you ever been to a foreign country before?",
    ja: "あなたは今までに外国に行ったことがありますか？",
    category: "現在完了（経験）",
    hint: "Have you ever been to ~ ?",
  },
  {
    id: "d3-2",
    grade: "3",
    en: "The girl who is playing the piano is my cousin.",
    ja: "ピアノを弾いている少女は私のいとこです。",
    category: "関係代名詞",
    hint: "The girl who is ~ で修飾します",
  },
  {
    id: "d3-3",
    grade: "3",
    en: "I was told to clean my room before dinner.",
    ja: "私は夕食前に部屋を掃除するように言われました。",
    category: "受動態",
    hint: "be told to + 動詞の原形",
  },

  /* ---- 準2級 ---- */
  {
    id: "dpre2-1",
    grade: "pre2",
    en: "Could you tell me how to get to the station?",
    ja: "駅への行き方を教えていただけますか？",
    category: "依頼・道案内",
    hint: "how to get to ~ で「〜への行き方」",
  },
  {
    id: "dpre2-2",
    grade: "pre2",
    en: "If it had not rained yesterday, we would have gone hiking.",
    ja: "もし昨日雨が降っていなければ、私たちはハイキングに行っていたでしょう。",
    category: "仮定法過去完了",
    hint: "If it had not + 過去分詞, would have + 過去分詞",
  },
  {
    id: "dpre2-3",
    grade: "pre2",
    en: "The government should encourage citizens to recycle plastic waste.",
    ja: "政府は市民にプラスチックごみのリサイクルを奨励すべきです。",
    category: "社会・環境",
    hint: "encourage A to do で「Aに〜するよう勧める」",
  },

  /* ---- 2級 ---- */
  {
    id: "d2-1",
    grade: "2",
    en: "Due to heavy snow, the flight was delayed for two hours.",
    ja: "大雪のため、その便は2時間遅延しました。",
    category: "原因・理由",
    hint: "Due to は「〜が原因で」",
  },
  {
    id: "d2-2",
    grade: "2",
    en: "It is important for consumers to consider environmental sustainability.",
    ja: "消費者が環境の持続可能性を考慮することは重要です。",
    category: "It is ~ for ... to 不定詞",
    hint: "environmental sustainability = 環境の持続可能性",
  },
  {
    id: "d2-3",
    grade: "2",
    en: "Not only students but also teachers benefited from the online system.",
    ja: "生徒だけでなく教師もそのオンラインシステムの恩恵を受けました。",
    category: "相関接続詞",
    hint: "not only A but also B",
  },

  /* ---- 準1級 ---- */
  {
    id: "dpre1-1",
    grade: "pre1",
    en: "The company implemented strict measures to prevent security breaches.",
    ja: "その企業はセキュリティ侵害を防ぐために厳格な措置を講じました。",
    category: "ビジネス・セキュリティ",
    hint: "implement strict measures = 厳格な措置を講じる",
  },
  {
    id: "dpre1-2",
    grade: "pre1",
    en: "Under no circumstances should confidential information be disclosed to the public.",
    ja: "いかなる状況下でも機密情報が一般に開示されてはなりません。",
    category: "否定の倒置",
    hint: "Under no circumstances + 助動詞 + 主語",
  },

  /* ---- 1級 ---- */
  {
    id: "d1-1",
    grade: "1",
    en: "The committee reached a unanimous consensus regarding the fiscal reforms.",
    ja: "委員会は財政改革に関して満場一致の合意に達しました。",
    category: "政治・経済",
    hint: "unanimous consensus = 満場一致の合意",
  },
  {
    id: "d1-2",
    grade: "1",
    en: "Technological innovation inherently outpaces the velocity of legislative adjustments.",
    ja: "技術革新は本質的に法制度の適応速度を追い抜いてしまいます。",
    category: "先端論述",
    hint: "inherently outpaces = 本質的に追い抜く",
  },
];
