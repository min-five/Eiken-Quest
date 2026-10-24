/* ============================================================
   Eiken Writing (Essay / Summary) Practice Prompts & Templates
   ============================================================ */
import type { WritingEntry } from "../types";

export const WRITING_TOPICS: WritingEntry[] = [
  /* ---- 3級 (25〜35 words) ---- */
  {
    id: "w3-1",
    grade: "3",
    title: "外国への旅行について",
    topic: "Do you want to travel to foreign countries in the future?",
    minWords: 25,
    maxWords: 35,
    tips: [
      "最初に自分の意見（Yes / No）をはっきり書きましょう。",
      "理由を2つ（First, / Second,）書きましょう。",
      "難しい単語を使わず、知っている短い文で正確に書くのが合格のコツです。",
    ],
    usefulPhrases: [
      {
        category: "意見を言う",
        phrases: ["I want to travel to foreign countries.", "I do not want to travel to foreign countries."],
      },
      {
        category: "理由1を言う",
        phrases: ["First, I want to eat delicious local food.", "First, I am interested in foreign history and culture."],
      },
      {
        category: "理由2を言う",
        phrases: ["Second, I want to make many foreign friends.", "Second, it is a great experience to practice English."],
      },
    ],
    modelAnswer:
      "I want to travel to foreign countries in the future. First, I want to eat delicious local food. Second, it is a great experience to practice speaking English with local people.",
    translation:
      "私は将来外国に旅行したいです。第1に、美味しい現地の料理を食べたいからです。第2に、現地の人々と英語を話す練習をする素晴らしい経験になるからです。",
  },
  {
    id: "w3-2",
    grade: "3",
    title: "朝食について",
    topic: "Which do you like better, rice or bread for breakfast?",
    minWords: 25,
    maxWords: 35,
    tips: [
      "I like rice better. または I like bread better. で始めましょう。",
      "好きな味や、手軽さ（easy to eat / make）などを理由にすると書きやすいです。",
    ],
    usefulPhrases: [
      {
        category: "意見を言う",
        phrases: ["I like rice better for breakfast.", "I like bread better for breakfast."],
      },
      {
        category: "理由1・2",
        phrases: ["First, it is delicious and healthy.", "Second, it gives me a lot of energy for morning study.", "Second, it is very quick and easy to prepare."],
      },
    ],
    modelAnswer:
      "I like rice better for breakfast. First, it is very delicious with miso soup and fish. Second, eating rice gives me energy to study hard at school all morning.",
    translation:
      "私は朝食にはご飯の方が好きです。第1に、味噌汁や魚と一緒だととても美味しいからです。第2に、ご飯を食べると学校で午前中ずっと勉強するエネルギーが出るからです。",
  },

  /* ---- 準2級 (50〜60 words) ---- */
  {
    id: "wpre2-1",
    grade: "pre2",
    title: "学校でのタブレット使用について",
    topic: "Do you think students should use tablets in school classes?",
    minWords: 50,
    maxWords: 65,
    tips: [
      "I think that students should use tablets... で始めましょう。",
      "理由は2つ。First, と Second,（または Also,）を使いましょう。",
      "「便利」「紙の節約」「重い教科書を持ち運ばなくてよい」などの理由が書きやすいです。",
    ],
    usefulPhrases: [
      {
        category: "意見",
        phrases: ["I think that students should use tablets in classes.", "I do not think that students should use tablets in classes."],
      },
      {
        category: "理由1",
        phrases: ["First, tablets make studying more interesting and interactive.", "First, students can easily search for information online."],
      },
      {
        category: "理由2",
        phrases: ["Second, carrying light tablets is better than heavy textbooks.", "Also, it saves paper and protects the environment."],
      },
    ],
    modelAnswer:
      "I think that students should use tablets in school classes. I have two reasons. First, students can easily search for useful information and videos on the Internet. Second, using tablets allows teachers and students to share opinions quickly. Therefore, tablets improve learning efficiency.",
    translation:
      "私は生徒たちが学校の授業でタブレットを使うべきだと思います。理由は2つあります。第1に、生徒はインターネット上で役立つ情報や動画を簡単に調べられます。第2に、タブレットを使うことで先生と生徒が素早く意見を共有できます。したがって、タブレットは学習効率を高めます。",
  },
  {
    id: "wpre2-2",
    grade: "pre2",
    title: "朝型生活と夜型生活",
    topic: "Do you think it is better for people to wake up early in the morning?",
    minWords: 50,
    maxWords: 65,
    tips: [
      "朝早く起きることのメリット（健康、集中力、時間の有効活用）を2点挙げましょう。",
    ],
    usefulPhrases: [
      {
        category: "意見",
        phrases: ["I think it is better for people to wake up early.", "I believe that waking up early is important."],
      },
      {
        category: "理由",
        phrases: ["First, it is quiet in the morning, so people can concentrate well.", "Second, getting morning sunlight helps maintain a healthy rhythm."],
      },
    ],
    modelAnswer:
      "I think it is better for people to wake up early in the morning. First, the morning is very quiet, so people can concentrate on studying or working without any distractions. Second, waking up early is good for health and helps maintain a regular lifestyle. For these reasons, I support waking up early.",
    translation:
      "私は朝早く起きる方が良いと思います。第1に、朝はとても静かなので、邪魔されることなく勉強や仕事に集中できます。第2に、早起きは健康に良く、規則正しい生活習慣を保つのに役立ちます。これらの理由から、私は早起きを支持します。",
  },

  /* ---- 2級 (80〜100 words) ---- */
  {
    id: "w2-1",
    grade: "2",
    title: "オンラインショッピングの将来",
    topic: "Today, many people shop online. Do you think more people will buy things on the Internet in the future?",
    minWords: 80,
    maxWords: 105,
    tips: [
      "構成：導入(意見) → 理由1(具体例) → 理由2(具体例) → 結論",
      "接続詞（First, / In addition, / For example, / Therefore,）を的確に使いましょう。",
    ],
    usefulPhrases: [
      {
        category: "意見の提示",
        phrases: ["I believe that more people will buy things on the Internet in the future.", "I agree with the idea that online shopping will continue to expand."],
      },
      {
        category: "理由1 (利便性)",
        phrases: ["First, online shopping is extremely convenient because people can purchase products anytime from home.", "To begin with, customers can easily compare prices across various stores."],
      },
      {
        category: "理由2 (配送・技術)",
        phrases: ["Second, delivery services have become much faster and more reliable.", "In addition, smartphones and fast Internet connections are widespread among all generations."],
      },
      {
        category: "結論",
        phrases: ["For these reasons, I am certain that online shopping will grow even further.", "Therefore, more consumers will rely on Internet shopping in the years ahead."],
      },
    ],
    modelAnswer:
      "I believe that more people will buy things on the Internet in the future. I have two reasons to support my opinion. First, online shopping is extremely convenient because people can purchase goods anytime from home without wasting time traveling to physical stores. Second, delivery services have improved significantly, allowing customers to receive ordered items on the same day. Moreover, it is simple to compare prices and read reviews online. For these reasons, the popularity of online shopping will undoubtedly continue to rise.",
    translation:
      "私は将来、より多くの人々がインターネットで買い物をするようになると考えています。私の意見を支持する理由は2つあります。第1に、実店舗へ行く時間を無駄にすることなく、いつでも自宅から商品を購入できるため非常に便利だからです。第2に、配送サービスが大幅に向上し、注文した商品をその日のうちに受け取れるようになったからです。さらに、オンライン上で価格を比較したりレビューを読んだりすることも簡単です。これらの理由から、オンラインショッピングの人気は間違いなく高まり続けるでしょう。",
  },
  {
    id: "w2-2",
    grade: "2",
    title: "公共交通機関の利用促進",
    topic: "Some people say that governments should encourage people to use public transportation rather than private cars. Do you agree with this opinion?",
    minWords: 80,
    maxWords: 105,
    tips: [
      "環境問題（CO2削減、大気汚染改善）と渋滞緩和（traffic congestion）の2点を論点にすると書きやすいです。",
    ],
    usefulPhrases: [
      {
        category: "意見",
        phrases: ["I agree with the opinion that governments should encourage public transportation.", "I strongly support the promotion of public transport."],
      },
      {
        category: "理由1 (環境)",
        phrases: ["First of all, trains and buses produce significantly less carbon dioxide per passenger than private cars, which helps combat global warming."],
      },
      {
        category: "理由2 (渋滞・経済)",
        phrases: ["Secondly, reducing the number of cars on the roads can solve severe traffic congestion in urban areas.", "Furthermore, taking public transit is often cheaper and safer than maintaining personal vehicles."],
      },
    ],
    modelAnswer:
      "I agree with the opinion that governments should encourage people to use public transportation rather than private cars. First of all, using trains and buses is much better for the environment because they produce far less greenhouse gases per passenger, helping to prevent global warming. Second, promoting public transport helps alleviate severe traffic congestion in large cities, saving commuters valuable time. In addition, it reduces the risk of traffic accidents. Therefore, encouraging public transit is beneficial for society as a whole.",
    translation:
      "政府は自家用車よりも公共交通機関の利用を推奨すべきだという意見に私は賛成です。まず第1に、電車やバスは乗客1人あたりの温室効果ガス排出量がはるかに少ないため、地球温暖化防止に役立ち、環境にとってはるかに優れているからです。第2に、公共交通機関を推進することは大都市における深刻な交通渋滞を緩和し、通勤者の貴重な時間を節約するのに役立ちます。さらに、交通事故のリスクも低減します。したがって、公共交通機関の利用促進は社会全体にとって有益です。",
  },

  /* ---- 準1級 (120〜150 words) ---- */
  {
    id: "wpre1-1",
    grade: "pre1",
    title: "再生可能エネルギーへの移行",
    topic: "Should Japan invest more heavily in renewable energy sources such as solar and wind power?",
    minWords: 120,
    maxWords: 155,
    tips: [
      "POINTS: Climate change, Energy security, Economic cost, Technological innovation",
      "アカデミックな語彙（sustainable, dependence on fossil fuels, greenhouse gas emissions）を活用しましょう。",
    ],
    usefulPhrases: [
      {
        category: "導入",
        phrases: ["I firmly believe that Japan should invest more resources in renewable energy.", "It is crucial for Japan to accelerate its transition toward clean energy."],
      },
      {
        category: "本論1 (気候変動)",
        phrases: ["To begin with, expanding renewable energy is essential to tackle global climate change and meet carbon neutrality goals."],
      },
      {
        category: "本論2 (エネルギー自給率)",
        phrases: ["In addition, Japan currently relies heavily on imported fossil fuels, which threatens its energy security. Developing domestic green energy will stabilize the supply."],
      },
    ],
    modelAnswer:
      "I firmly believe that Japan should invest more heavily in renewable energy sources such as solar, wind, and geothermal power. First, expanding clean energy is indispensable for combating the global climate crisis. By replacing coal and gas with renewables, Japan can drastically reduce its greenhouse gas emissions and fulfill its international commitments to environmental sustainability. Second, increasing domestic renewable energy capacity will strengthen national energy security. Japan currently depends on foreign nations for over eighty percent of its fossil fuels, leaving the economy vulnerable to geopolitical tensions and fluctuating fuel prices. Generating domestic renewable power will provide long-term economic stability. While initial infrastructure costs are substantial, technological advancements will inevitably lower expenses over time. In conclusion, investing in renewable energy is an urgent necessity for Japan's sustainable and secure future.",
    translation:
      "私は、日本が太陽光、風力、地熱などの再生可能エネルギー源により多くの投資を行うべきだと確信しています。第1に、クリーンエネルギーの拡大は地球規模の気候危機に対処するために不可欠です。石炭やガスを再生可能エネルギーに置き換えることで、日本は温室効果ガス排出量を劇的に削減し、環境の持続可能性に関する国際的な公約を果たすことができます。第2に、国内の再生可能エネルギー容量を増やすことは、国家のエネルギー安全保障を強化します。日本は現在、化石燃料の80％以上を外国に依存しており、経済が地政学的な緊張や燃料価格の変動に対して脆弱になっています。国内で再生可能電力を発電することは、長期的な経済の安定をもたらします。初期のインフラ費用は多大ですが、技術革新により時間の経過とともに費用は確実に低下します。結論として、再生可能エネルギーへの投資は、日本の持続可能で安全な未来にとって緊急の必要事項です。",
  },

  /* ---- 1級 (200〜240 words) ---- */
  {
    id: "w1-1",
    grade: "1",
    title: "人工知能の発展と倫理的規制",
    topic: "Can the rapid advancement of artificial intelligence be adequately regulated to ensure ethical use?",
    minWords: 200,
    maxWords: 250,
    tips: [
      "3つの理由または対比（技術の進化速度、国際協調の難しさ、経済競争）を論理的に展開します。",
    ],
    usefulPhrases: [
      {
        category: "主張",
        phrases: ["I hold the view that adequately regulating the rapid advancement of artificial intelligence presents formidable challenges."],
      },
      {
        category: "論点展開",
        phrases: ["First and foremost, the exponential velocity of technological innovation inherently outpaces bureaucratic legislative processes.", "Furthermore, achieving global consensus is extraordinarily complex due to fierce geopolitical competition."],
      },
    ],
    modelAnswer:
      "I hold the view that adequately regulating the rapid advancement of artificial intelligence to ensure ethical use presents formidable, if not insurmountable, challenges. While governance frameworks are urgently needed, several structural obstacles impede comprehensive regulation. First and foremost, the exponential velocity of technological breakthroughs inherently outpaces the sluggish pace of bureaucratic and legislative procedures. By the time governments formulate binding rules regarding algorithmic bias or autonomous decision-making, the technological frontier has already evolved, rendering existing statutes obsolete. Second, achieving international consensus on AI governance is extraordinarily difficult due to fierce geopolitical and economic rivalries. Major global powers view AI supremacy as central to their national security and economic prosperity. Consequently, nations may hesitate to impose stringent domestic restrictions that might handicap their tech sectors against international competitors who operate under looser guidelines. Finally, the opaque nature of complex deep-learning models complicates enforcement; even creators cannot always anticipate or audit the internal mechanisms behind machine-generated outputs. In conclusion, while multi-stakeholder collaboration and ethical guidelines must be pursued vigorously, fully adequate regulation of AI remains an elusive objective in an interconnected and highly competitive global landscape.",
    translation:
      "私は、倫理的な利用を保証するために人工知能の急速な進歩を適切に規制することは、克服不可能ではないにしても、非常に手強い課題であると考えています。ガバナンスの枠組みが緊急に必要である一方で、いくつかの構造的な障害が包括的な規制を妨げています。まず第一に、技術革新の指数関数的な速度は、官僚的および立法手続きの緩慢なペースを本質的に追い越してしまいます。政府がアルゴリズムの偏りや自律的意思決定に関する拘束力のある規則を策定する頃には、技術の最前線はすでに進化しており、既存の法令を時代遅れにしてしまいます。第二に、熾烈な地政学的および経済的競争のため、AIガバナンスに関する国際的な合意を達成することは極めて困難です。主要な大国は、AIの覇権が国家安全保障と経済的繁栄の核心であると見なしています。その結果、各国は、より緩やかなガイドラインの下で事業を展開する国際的な競争相手に対して自国のハイテク分野に不利をもたらす可能性のある厳しい国内規制を課すことを躊躇する可能性があります。最後に、複雑な深層学習モデルの不透明な性質が規制の執行を困難にしています。開発者自身でさえ、機械によって生成された出力の背後にある内部メカニズムを常に予測または監査できるとは限りません。結論として、複数の利害関係者による協力と倫理的ガイドラインは精力的に追求されなければならないものの、相互に連結し高度に競争的な世界情勢において、AIの完全に適切な規制は達成困難な目標であり続けています。",
  },
];
