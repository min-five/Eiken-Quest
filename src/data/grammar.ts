/* ============================================================
   Grammar genres, lessons & mini quizzes
   ============================================================ */
import type {
  GrammarExample,
  GrammarGenre,
  GrammarSection,
  GrammarTopic,
  GrammarTopicBase,
  QuizItem,
} from "../types";

export const EQ_GENRES: GrammarGenre[] = [
    { id: "basic", name: "文の基本", desc: "be動詞・一般動詞・疑問文・語順", icon: "pen", color: "#6366f1" },
    { id: "tense", name: "時制", desc: "現在・過去・未来・完了形", icon: "clock", color: "#0ea5e9" },
    { id: "modal", name: "助動詞", desc: "can / must / should / may の世界", icon: "bolt", color: "#f59e0b" },
    { id: "passive", name: "受動態", desc: "〜される、という視点", icon: "repeat", color: "#8b5cf6" },
    { id: "verbal", name: "不定詞・動名詞・分詞", desc: "動詞を名詞・形容詞のように使う", icon: "shuffle", color: "#14b8a6" },
    { id: "relative", name: "関係詞", desc: "名詞を説明する接着剤", icon: "target", color: "#ec4899" },
    { id: "comparison", name: "比較", desc: "比べる表現をマスター", icon: "chart", color: "#ef4444" },
    { id: "subjunctive", name: "仮定法", desc: "現実と違う世界を語る", icon: "sparkle", color: "#a855f7" },
    { id: "connector", name: "接続詞・前置詞", desc: "文と文、語と語をつなぐ", icon: "arrow", color: "#0d9488" },
    { id: "noun", name: "名詞・冠詞・代名詞", desc: "a / the / 複数形 / it", icon: "book", color: "#0284c7" },
    { id: "syntax", name: "上級構文", desc: "強調・倒置・省略", icon: "grid", color: "#b45309" },
    { id: "idiom", name: "語法・イディオム", desc: "入試・英検頻出の表現", icon: "star", color: "#db2777" },
  ];

const T = (
  id: string,
  grade: GrammarTopicBase["grade"],
  genre: string,
  title: string,
  summary: string,
  sections: GrammarSection[],
  examples: GrammarExample[],
  tip: string,
  quiz: QuizItem[],
): GrammarTopicBase => ({ id, grade, genre, title, summary, sections, examples, tip, quiz });

const q = (stem: string, choices: string[], a: number, exp: string): QuizItem => ({
  q: stem,
  choices,
  a,
  exp,
});

const EQ_GRAMMAR_RAW: GrammarTopicBase[] = [
    /* ================= 5級 ================= */
    T("g5-be", "5", "basic", "be動詞 — am / is / are",
      "「〜です」「〜にいます」を表す、英語でいちばん最初に学ぶ動詞。",
      [
        { h: "be動詞は「イコール」の動詞", b: "be動詞は主語と補語（名詞・形容詞）を<b>イコール</b>で結びます。<br><code>I am a student.</code> = 私は学生です（I = student）。<br>主語によって形が変わります。<b>I → am</b>、<b>you / 複数 → are</b>、<b>he / she / it / 単数 → is</b>。" },
        { h: "否定文と疑問文", b: "否定文は be動詞のうしろに <b>not</b> を置きます。<code>I am not tired.</code><br>疑問文は be動詞を主語の前に出します。<code>Are you a teacher?</code> → <code>Yes, I am.</code> / <code>No, I'm not.</code>" },
      ],
      [
        { en: "I <b>am</b> from Japan.", ja: "私は日本出身です。" },
        { en: "She <b>is</b> very kind.", ja: "彼女はとても親切です。" },
        { en: "They <b>are not</b> here now.", ja: "彼らは今ここにいません。" },
      ],
      "主語を先に見るクセをつけましょう。「I なら am、それ以外の単数は is」と覚えると迷いません。",
      [
        q("I ___ a student.", ["am", "is", "are", "be"], 0, "主語が I なので am を使います。"),
        q("This ___ my new bike.", ["am", "is", "are", "be"], 1, "This は単数扱いなので is です。"),
        q("___ you from Canada?", ["Am", "Is", "Are", "Be"], 2, "you には are。疑問文では先頭に出ます。"),
      ]),

    T("g5-general", "5", "basic", "一般動詞 — play / like / study",
      "動作や状態を表す動詞。3人称単数の -s が最初の関門。",
      [
        { h: "ふつうの文", b: "主語が I / you / 複数のときは動詞は原形のままです。<code>I play tennis.</code><br>主語が he / she / it など<b>3人称単数</b>のときは、動詞に <b>-s / -es</b> を付けます。<code>She plays tennis.</code>" },
        { h: "3人称単数の作り方", b: "ふつうは <b>-s</b>（play → plays）。<br><b>s, x, ch, sh, o</b> で終わる語は <b>-es</b>（watch → watches, go → goes）。<br>子音字 + y は <b>y → ies</b>（study → studies）。<br><b>have → has</b> は不規則です。" },
      ],
      [
        { en: "I <b>like</b> Japanese food.", ja: "私は日本の食べ物が好きです。" },
        { en: "He <b>studies</b> English every day.", ja: "彼は毎日英語を勉強します。" },
        { en: "My sister <b>has</b> a cat.", ja: "私の姉は猫を飼っています。" },
      ],
      "主語が「I・you・複数」なら -s なし。「he・she・it・一人の名前」なら -s あり、とリズムで覚えましょう。",
      [
        q("She ___ tennis every Sunday.", ["play", "plays", "playing", "played"], 1, "主語 She は3人称単数なので plays。"),
        q("They ___ in Osaka.", ["lives", "live", "living", "is live"], 1, "They は複数なので原形 live。"),
        q("Tom ___ to school by bus.", ["go", "goes", "going", "went"], 1, "go は o で終わるので goes。"),
      ]),

    T("g5-negquestion", "5", "basic", "否定文・疑問文の作り方",
      "be動詞と一般動詞では、否定・疑問の作り方がまったく違います。",
      [
        { h: "be動詞 vs 一般動詞", b: "<b>be動詞</b>：not を付ける／主語の前に出す。<br><code>He is not busy.</code> / <code>Is he busy?</code><br><b>一般動詞</b>：<b>do / does</b> の力を借りる。<br><code>He does not like coffee.</code> / <code>Does he like coffee?</code>" },
        { h: "答えるとき", b: "<code>Do you play the piano?</code> → <code>Yes, I do.</code> / <code>No, I don't.</code><br><code>Does she live here?</code> → <code>Yes, she does.</code><br>be動詞の質問には be動詞で、do の質問には do で答えます。" },
      ],
      [
        { en: "I <b>don't</b> watch TV in the morning.", ja: "私は朝テレビを見ません。" },
        { en: "<b>Does</b> your father <b>cook</b> dinner?", ja: "あなたのお父さんは夕食を作りますか。" },
        { en: "It <b>isn't</b> cold today.", ja: "今日は寒くありません。" },
      ],
      "否定・疑問文を作るとき、一般動詞は<b>原形</b>に戻すのを忘れずに。does + likes はNGです。",
      [
        q("___ you like music?", ["Do", "Does", "Are", "Is"], 0, "一般動詞 like の疑問文は Do you ...? です。"),
        q("He ___ eat breakfast.", ["don't", "doesn't", "isn't", "not"], 1, "3人称単数の否定は doesn't + 原形。"),
        q("___ she a teacher?", ["Do", "Does", "Is", "Are"], 2, "名詞 teacher が続くので be動詞 Is です。"),
      ]),

    T("g5-plural", "5", "noun", "名詞の複数形",
      "1つと2つ以上を区別する。英語の名詞は「数」がとても大切。",
      [
        { h: "基本の作り方", b: "ふつうは <b>-s</b>（book → books）。<br><b>s, x, ch, sh</b> で終わる語は <b>-es</b>（box → boxes, watch → watches）。<br>子音字 + y は <b>y → ies</b>（city → cities）。<br><b>f / fe → ves</b>（knife → knives）。" },
        { h: "不規則な複数形", b: "<code>man → men</code>、<code>woman → women</code>、<code>child → children</code>、<code>foot → feet</code>、<code>tooth → teeth</code>、<code>mouse → mice</code>。<br>fish / sheep / deer は形が変わりません。" },
      ],
      [
        { en: "I have two <b>children</b>.", ja: "私には子どもが2人います。" },
        { en: "There are many <b>boxes</b> here.", ja: "ここにはたくさんの箱があります。" },
        { en: "These <b>knives</b> are sharp.", ja: "これらのナイフはよく切れます。" },
      ],
      "数えられる名詞は、複数なら必ず形を変えるか a / the を付けます。「名詞だけ裸で置かない」意識が大切です。",
      [
        q("I saw three ___ in the park.", ["child", "childs", "children", "childes"], 2, "child の複数形は children。"),
        q("There are many ___ on the desk.", ["box", "boxs", "boxes", "boxies"], 2, "box は x で終わるので boxes。"),
        q("My ___ are hurting.", ["foot", "foots", "feet", "feets"], 2, "foot の複数形は feet。"),
      ]),

    T("g5-article", "5", "noun", "a / an / the の使い分け",
      "冠詞は日本語にない概念。でも「初めて」か「特定」かで決まります。",
      [
        { h: "a / an は「初めて出る1つ」", b: "数えられる名詞の単数形で、まだ話題に出ていないものを指すとき。<br><code>I have <b>a</b> dog.</code><br>母音の<b>音</b>で始まる語には <b>an</b>。an apple, an hour（h は発音しない）、a university（ユの音）。" },
        { h: "the は「お互いに分かるもの」", b: "すでに話に出たもの、世界に1つしかないもの、文脈で特定できるもの。<br><code>I have a dog. <b>The</b> dog is very cute.</code><br><code><b>The</b> sun rises in the east.</code><br>数えられない名詞や複数形で「一般的な話」をするときは冠詞を付けません。<code>I like <b>music</b>.</code>" },
      ],
      [
        { en: "This is <b>an</b> interesting book.", ja: "これは面白い本です。" },
        { en: "<b>The</b> girl over there is my sister.", ja: "あそこにいる女の子が私の妹です。" },
        { en: "We need water.", ja: "私たちは水が必要です。" },
      ],
      "発音で選ぶのがポイント。an hour / a European country のように、つづりではなく音で判断します。",
      [
        q("I want ___ apple.", ["a", "an", "the", "—"], 1, "apple は母音の音で始まるので an。"),
        q("She is ___ university student.", ["a", "an", "the", "—"], 0, "university は「ユ」の音で始まるので a。"),
        q("I have a cat. ___ cat is white.", ["A", "An", "The", "—"], 2, "すでに出た cat を指すので the。"),
      ]),

    /* ================= 4級 ================= */
    T("g4-wh", "4", "basic", "疑問詞 — what / who / when / where / why / how",
      "情報を尋ねるための6つの魔法の言葉。",
      [
        { h: "疑問詞の意味", b: "<b>what</b> 何 / <b>who</b> 誰 / <b>when</b> いつ / <b>where</b> どこ / <b>why</b> なぜ / <b>how</b> どうやって・どのくらい。<br>疑問詞は文の先頭に置き、そのあとは疑問文の語順になります。<br><code>Where <b>do</b> you live?</code>" },
        { h: "組み合わせ表現", b: "<b>what time</b> 何時 / <b>how many</b> いくつの / <b>how much</b> いくら・どのくらい / <b>how long</b> どのくらいの長さ・期間 / <b>whose</b> 誰の。<br><code>How many books do you have?</code>" },
      ],
      [
        { en: "<b>What</b> is your favorite food?", ja: "あなたの好きな食べ物は何ですか。" },
        { en: "<b>How many</b> students are in your class?", ja: "あなたのクラスには何人の生徒がいますか。" },
        { en: "<b>Why</b> did you come here?", ja: "なぜここに来たのですか。" },
      ],
      "疑問詞のあとに be動詞が来るか do が来るかは、後ろを見て判断します。名詞が続けば be動詞が自然です。",
      [
        q("___ is that girl? — She is my sister.", ["What", "Who", "Where", "How"], 1, "人を尋ねるので Who。"),
        q("___ do you go to school? — By bike.", ["How", "What", "Who", "When"], 0, "手段を尋ねるので How。"),
        q("___ many apples do you have?", ["What", "How", "Which", "Why"], 1, "数の表現は How many。"),
      ]),

    T("g4-progressive", "4", "tense", "現在進行形 — be + -ing",
      "「今まさに〜している」を表す形。be動詞を忘れないこと。",
      [
        { h: "形と意味", b: "<b>am / is / are + 動詞の -ing形</b>。今この瞬間の動作や、一時的な状態を表します。<br><code>I <b>am studying</b> English now.</code><br>否定は be動詞のあとに not、疑問文は be動詞を前に出します。" },
        { h: "-ing の作り方", b: "ふつうは <b>-ing</b>（play → playing）。<br>e で終わる語は e を取る（make → making）。<br>「短母音 + 子音」で終わる語は子音を重ねる（run → running, swim → swimming）。" },
      ],
      [
        { en: "She <b>is cooking</b> dinner now.", ja: "彼女は今夕食を作っています。" },
        { en: "They <b>are playing</b> soccer in the park.", ja: "彼らは公園でサッカーをしています。" },
        { en: "I <b>am not sleeping</b>.", ja: "私は寝ていません。" },
      ],
      "「now / look / listen」があれば進行形のサイン。でも like / know / want など状態動詞は進行形にしません。",
      [
        q("Look! It ___ outside.", ["rains", "was raining", "is raining", "rain"], 2, "今降っているので現在進行形。"),
        q("He ___ his homework now.", ["do", "does", "is doing", "did"], 2, "now があるので is doing。"),
        q("The baby ___ now.", ["sleep", "sleeps", "is sleeping", "slept"], 2, "今寝ているので is sleeping。"),
      ]),

    T("g4-past", "4", "tense", "過去形 — 昨日のことを話す",
      "規則変化の -ed と、覚えるしかない不規則変化。",
      [
        { h: "過去形の作り方", b: "規則動詞は <b>-ed</b>（play → played, like → liked, study → studied）。<br>不規則動詞は形が変わります（go → went, see → saw, have → had, make → made, come → came）。" },
        { h: "否定文と疑問文", b: "過去形の否定・疑問では <b>did</b> を使い、動詞は<b>原形</b>に戻します。<br><code>I <b>didn't go</b> there.</code><br><code><b>Did</b> you <b>see</b> him?</code> → <code>Yes, I did.</code>" },
      ],
      [
        { en: "I <b>visited</b> Kyoto last year.", ja: "私は去年京都を訪れました。" },
        { en: "She <b>didn't come</b> to school yesterday.", ja: "彼女は昨日学校に来ませんでした。" },
        { en: "<b>Did</b> you <b>finish</b> your homework?", ja: "宿題を終えましたか。" },
      ],
      "yesterday / last week / ago は過去形のサイン。did を使ったら動詞は絶対に原形です。",
      [
        q("I ___ TV last night.", ["watch", "watched", "watching", "watches"], 1, "last night があるので過去形 watched。"),
        q("She ___ to the library yesterday.", ["go", "goes", "went", "gone"], 2, "go の過去形は went。"),
        q("___ you eat breakfast this morning?", ["Do", "Did", "Are", "Were"], 1, "過去の質問なので Did。"),
      ]),

    T("g4-future", "4", "tense", "未来表現 — will と be going to",
      "未来のことを言う方法は2つ。ニュアンスが少し違います。",
      [
        { h: "will は「その場で決めた・予測」", b: "<b>will + 動詞の原形</b>。<br><code>I <b>will help</b> you.</code>（今決めた）<br><code>It <b>will rain</b> tomorrow.</code>（予測）<br>否定は will not（won't）、疑問は Will you ...? です。" },
        { h: "be going to は「予定・根拠のある予測」", b: "<b>am / is / are going to + 原形</b>。<br><code>I <b>am going to visit</b> my grandmother this weekend.</code>（前から決めていた予定）<br><code>Look at those clouds. It <b>is going to rain</b>.</code>（根拠がある）" },
      ],
      [
        { en: "I <b>will call</b> you later.", ja: "あとで電話しますね。" },
        { en: "We <b>are going to have</b> a party next week.", ja: "私たちは来週パーティーをする予定です。" },
        { en: "She <b>won't be</b> late.", ja: "彼女は遅れないでしょう。" },
      ],
      "tomorrow / next week などの未来表現があっても、will か be going to かで迷ったら「その場で決めたか、前から決めていたか」を考えましょう。",
      [
        q("I think it ___ snow tomorrow.", ["will", "am", "was", "did"], 0, "単純な予測なので will snow。"),
        q("We ___ going to study abroad next year.", ["is", "am", "are", "be"], 2, "主語 We には are。"),
        q("Don't worry. I ___ help you.", ["am", "will", "was", "did"], 1, "その場で申し出るので will。"),
      ]),

    T("g4-conjunction", "4", "connector", "接続詞 — when / if / because / that",
      "2つの文をつなぐ接着剤。後ろは「文の形」になるのがポイント。",
      [
        { h: "よく使う接続詞", b: "<b>when</b> 〜のとき / <b>if</b> もし〜なら / <b>because</b> なぜなら / <b>that</b> 〜ということ / <b>but</b> しかし / <b>so</b> だから / <b>or</b> または。<br><code>I was happy <b>because</b> I passed the test.</code>" },
        { h: "if と when の違い", b: "<b>if</b> は「実現するかわからない条件」、<b>when</b> は「起きるはずの時」に使います。<br><code><b>If</b> it rains tomorrow, we will stay home.</code>（降るかわからない）<br><code><b>When</b> I get home, I will call you.</code>（帰るのは確実）" },
      ],
      [
        { en: "I will call you <b>when</b> I arrive.", ja: "着いたら電話します。" },
        { en: "<b>If</b> you are free, let's go shopping.", ja: "もし暇なら買い物に行きましょう。" },
        { en: "I think <b>that</b> he is right.", ja: "彼が正しいと思います。" },
      ],
      "接続詞の後ろは「主語 + 動詞」の完全な文。that は日本語では訳さないことが多いです。",
      [
        q("I stayed home ___ it was raining.", ["so", "because", "but", "or"], 1, "理由を表す because。"),
        q("___ it is sunny tomorrow, we will play tennis.", ["Because", "If", "So", "That"], 1, "条件の if。"),
        q("I know ___ she likes dogs.", ["that", "if", "because", "or"], 0, "「〜ということ」の that。"),
      ]),

    T("g4-comparison", "4", "comparison", "比較級・最上級",
      "「より〜」「いちばん〜」。-er / -est と more / most の使い分け。",
      [
        { h: "比較級と最上級の作り方", b: "短い形容詞は <b>-er / -est</b>（tall → taller → tallest）。<br>e で終わる語は <b>-r / -st</b>（large → larger → largest）。<br>子音字 + y は <b>y → i</b>（happy → happier → happiest）。<br>長い形容詞は <b>more / most</b>（beautiful → more beautiful → most beautiful）。" },
        { h: "不規則変化と文型", b: "<b>good → better → best</b>、<b>bad → worse → worst</b>、<b>many / much → more → most</b>、<b>little → less → least</b>。<br>比較級のあとは <b>than</b>、最上級の前には <b>the</b> を置きます。<br><code>She is <b>taller than</b> me.</code><br><code>This is <b>the best</b> book.</code>" },
      ],
      [
        { en: "My brother is <b>older than</b> me.", ja: "兄は私より年上です。" },
        { en: "This is <b>the most interesting</b> movie.", ja: "これはいちばん面白い映画です。" },
        { en: "Today is <b>hotter than</b> yesterday.", ja: "今日は昨日より暑いです。" },
      ],
      "最上級のあとに名詞が続く場合も the を忘れずに。the tallest boy のように使います。",
      [
        q("This bag is ___ than that one.", ["cheap", "cheaper", "cheapest", "more cheap"], 1, "than があるので比較級 cheaper。"),
        q("She is the ___ singer in Japan.", ["famous", "more famous", "most famous", "famousest"], 2, "長い形容詞の最上級は most famous。"),
        q("My score is ___ than yours.", ["bad", "worse", "worst", "worse than"], 1, "bad の比較級は worse。"),
      ]),

    T("g4-pronoun", "4", "noun", "代名詞の変化",
      "I / my / me / mine。同じ「私」でも役割で形が変わります。",
      [
        { h: "格の変化", b: "<b>主格</b>（〜は）I / you / he / she / it / we / they<br><b>所有格</b>（〜の）my / your / his / her / its / our / their<br><b>目的格</b>（〜を・に）me / you / him / her / it / us / them<br><b>所有代名詞</b>（〜のもの）mine / yours / his / hers / its / ours / theirs" },
        { h: "使い分けの例", b: "名詞の前に置くなら所有格。<code><b>My</b> bag is new.</code><br>動詞や前置詞の後ろなら目的格。<code>Please help <b>me</b>.</code><br>名詞をくり返さないなら所有代名詞。<code>This bag is <b>mine</b>.</code>" },
      ],
      [
        { en: "<b>She</b> is my friend. I like <b>her</b>.", ja: "彼女は私の友達です。私は彼女が好きです。" },
        { en: "This is <b>my</b> bike. That one is <b>yours</b>.", ja: "これは私の自転車です。あれはあなたのです。" },
        { en: "Please look at <b>us</b>.", ja: "私たちを見てください。" },
      ],
      "「〜の」は my、「〜のもの」は mine。日本語にすると似ているので、後ろに名詞があるかどうかで判断します。",
      [
        q("This is ___ book. Please read it.", ["I", "my", "me", "mine"], 1, "book の前なので所有格 my。"),
        q("Can you help ___?", ["I", "my", "me", "mine"], 2, "help の目的語なので目的格 me。"),
        q("That pen is ___.", ["her", "hers", "she", "him"], 1, "「彼女のもの」は hers。"),
      ]),

    /* ================= 3級 ================= */
    T("g3-perfect", "3", "tense", "現在完了 — have + 過去分詞",
      "過去と現在をつなぐ時制。経験・継続・完了の3つの意味。",
      [
        { h: "3つの意味", b: "<b>経験</b>「〜したことがある」<code>I <b>have visited</b> Kyoto twice.</code><br><b>継続</b>「ずっと〜している」<code>I <b>have lived</b> here for ten years.</code><br><b>完了</b>「〜してしまった／もう〜した」<code>She <b>has just finished</b> her homework.</code>" },
        { h: "キーワードと注意点", b: "経験：ever / never / before / twice<br>継続：for + 期間 / since + 起点<br>完了：just / already / yet<br><b>過去形との違い</b>：<code>I lost my key yesterday.</code>（過去の事実だけ）vs <code>I have lost my key.</code>（今も見つかっていない）" },
      ],
      [
        { en: "I <b>have never been</b> to Hokkaido.", ja: "私は一度も北海道に行ったことがありません。" },
        { en: "She <b>has lived</b> in Tokyo <b>since</b> 2018.", ja: "彼女は2018年から東京に住んでいます。" },
        { en: "<b>Have</b> you <b>finished</b> your homework <b>yet</b>?", ja: "もう宿題を終えましたか。" },
      ],
      "yesterday / last week / ago など明確な過去を表す語とは一緒に使えません。「今とつながっているか」が判断基準です。",
      [
        q("I ___ this movie three times.", ["see", "saw", "have seen", "am seeing"], 2, "経験「3回見たことがある」なので現在完了。"),
        q("She has lived here ___ 2015.", ["for", "since", "from", "in"], 1, "starting point には since。"),
        q("He ___ his homework yet.", ["didn't finish", "hasn't finished", "doesn't finish", "isn't finishing"], 1, "yet と現在完了の否定。"),
      ]),

    T("g3-modal", "3", "modal", "助動詞 — can / may / must / should",
      "動詞に「できる」「べき」などの気持ちを加える。後ろは必ず原形。",
      [
        { h: "意味の整理", b: "<b>can</b> できる・してもよい / <b>could</b> できた・控えめな依頼<br><b>may</b> してもよい・かもしれない / <b>must</b> しなければならない・ちがいない<br><b>have to</b> しなければならない / <b>should</b> すべきだ<br><b>had better</b> したほうがよい / <b>would</b> 〜だろう・〜したい" },
        { h: "共通ルール", b: "助動詞の後ろは<b>動詞の原形</b>。<br>3人称単数でも <b>-s は付けません</b>。<code>He <b>can swim</b>.</code>（cans はNG）<br>否定は助動詞 + not（can't, mustn't, shouldn't）。疑問文は助動詞を主語の前に出します。" },
      ],
      [
        { en: "You <b>should</b> see a doctor.", ja: "医者に診てもらったほうがいいですよ。" },
        { en: "We <b>must not</b> park here.", ja: "ここに駐車してはいけません。" },
        { en: "<b>May</b> I use your phone?", ja: "あなたの電話を使ってもいいですか。" },
      ],
      "must not は「禁止」、don't have to は「必要がない」。意味が正反対なので注意しましょう。",
      [
        q("You ___ be quiet in the library.", ["can", "must", "may", "would"], 1, "義務・強い必要なので must。"),
        q("He ___ swim very well.", ["can", "cans", "can to", "is can"], 0, "助動詞の後ろは原形、can に -s なし。"),
        q("You ___ eat too much. It's bad for you.", ["should", "shouldn't", "must", "don't"], 1, "「すべきでない」は shouldn't。"),
      ]),

    T("g3-passive", "3", "passive", "受動態 — be + 過去分詞",
      "「〜される」という視点に切り替える。目的語が主語に昇格します。",
      [
        { h: "基本の形", b: "能動態の目的語を主語にし、<b>be動詞 + 過去分詞 + by 〜</b> の形にします。<br><code>Many people <b>use</b> this app.</code><br>→ <code>This app <b>is used</b> by many people.</code><br>時制は be動詞で表します（is / was / will be / has been）。" },
        { h: "疑問文・否定文", b: "疑問文は be動詞を前に。<code><b>Is</b> this book <b>read</b> by children?</code><br>否定文は be動詞のあとに not。<code>This room <b>isn't cleaned</b> every day.</code><br>行為者が不明・重要でないときは by 〜 を省略します。" },
      ],
      [
        { en: "This temple <b>was built</b> 400 years ago.", ja: "この寺は400年前に建てられました。" },
        { en: "English <b>is spoken</b> in many countries.", ja: "英語は多くの国で話されています。" },
        { en: "The window <b>was broken</b> by the boy.", ja: "その窓はその少年によって割られました。" },
      ],
      "「by 〜」を付けるかは、行為者が大切かどうかで決めます。日本語の「〜によって」に引っぱられすぎないように。",
      [
        q("This bridge ___ in 1990.", ["build", "built", "was built", "is building"], 2, "過去の受動態 was built。"),
        q("Rice ___ in Japan.", ["grows", "is grown", "grow", "growing"], 1, "「育てられる」なので is grown。"),
        q("The room ___ every morning.", ["cleans", "is cleaned", "cleaning", "clean"], 1, "毎朝掃除される → is cleaned。"),
      ]),

    T("g3-infinitive", "3", "verbal", "不定詞の3用法",
      "to + 動詞の原形が、名詞・形容詞・副詞の3つの顔を持ちます。",
      [
        { h: "名詞的・形容詞的・副詞的", b: "<b>名詞的</b>「〜すること」主語・目的語・補語になる。<code>I like <b>to read</b> books.</code><br><b>形容詞的</b>「〜するための」名詞を修飾。<code>I have something <b>to eat</b>.</code><br><b>副詞的</b>「〜するために」目的・原因を表す。<code>I went to the store <b>to buy</b> milk.</code>" },
        { h: "重要構文", b: "<b>ask / tell + 人 + to do</b>「人に〜するよう頼む」<br><b>too ... to do</b>「〜するには…すぎる」<br><b>... enough to do</b>「〜するのに十分…」<br><b>It is ... to do</b>「〜することは…だ」<br><code>It is important <b>to practice</b> every day.</code>" },
      ],
      [
        { en: "I want <b>to be</b> a doctor.", ja: "私は医者になりたいです。" },
        { en: "She has a lot of homework <b>to do</b>.", ja: "彼女にはやるべき宿題がたくさんあります。" },
        { en: "He got up early <b>to catch</b> the first train.", ja: "彼は始発に乗るために早起きしました。" },
      ],
      "「to の前に名詞があるか」「文の要素になっているか」で用法を見分けます。日本語訳に頼りすぎないのがコツ。",
      [
        q("I went to the library ___ some books.", ["borrow", "to borrow", "borrowing", "borrowed"], 1, "目的「借りるために」の副詞的用法。"),
        q("It is difficult ___ this question.", ["answer", "to answer", "answering", "answered"], 1, "It is ... to do の構文。"),
        q("She asked me ___ the window.", ["close", "to close", "closing", "closed"], 1, "ask + 人 + to do。"),
      ]),

    T("g3-gerund", "3", "verbal", "動名詞 — -ing を名詞として使う",
      "「〜すること」。不定詞と意味が重なることも、変わることもあります。",
      [
        { h: "動名詞の使い方", b: "主語・目的語・補語・前置詞の目的語になります。<br><code><b>Swimming</b> is good for your health.</code>（主語）<br><code>I enjoy <b>reading</b> books.</code>（目的語）<br><code>Thank you for <b>helping</b> me.</code>（前置詞の後ろ）" },
        { h: "不定詞と動名詞の違い", b: "意味がほぼ同じ：like / love / begin / start<br>動名詞だけ：<b>enjoy / finish / stop / avoid / practice / mind</b><br>不定詞だけ：<b>want / hope / decide / plan</b><br>意味が変わる：<b>remember / forget</b>（remember doing = したことを覚えている、remember to do = するのを覚えておく）" },
      ],
      [
        { en: "I enjoy <b>listening</b> to music.", ja: "私は音楽を聴くのが好きです。" },
        { en: "<b>Studying</b> English is fun for me.", ja: "英語を勉強することは私にとって楽しいです。" },
        { en: "Don't forget <b>to call</b> me.", ja: "私に電話するのを忘れないで。" },
      ],
      "前置詞の後ろは必ず動名詞。be good at -ing / look forward to -ing は入試でも頻出です。",
      [
        q("I finished ___ my homework.", ["do", "to do", "doing", "did"], 2, "finish は動名詞だけを取ります。"),
        q("Thank you for ___ me.", ["help", "to help", "helping", "helped"], 2, "前置詞 for の後ろは動名詞。"),
        q("She decided ___ abroad.", ["study", "to study", "studying", "studied"], 1, "decide は不定詞を取ります。"),
      ]),

    T("g3-participle", "3", "verbal", "分詞の形容詞的用法",
      "現在分詞「〜している」、過去分詞「〜された」。名詞を後ろから説明。",
      [
        { h: "2つの分詞", b: "<b>現在分詞（-ing）</b>：能動・進行「〜している」<br><code>the <b>sleeping</b> baby</code> 眠っている赤ちゃん<br><b>過去分詞</b>：受動・完了「〜された」<br><code>the <b>broken</b> window</code> 割られた窓<br>1語なら名詞の前に、2語以上なら名詞の後ろに置きます。<code>the boy <b>running</b> in the park</code>" },
        { h: "補語として使う", b: "be動詞のあとに置くと状態を表します。<br><code>The door is <b>closed</b>.</code><br><code>She looked <b>surprised</b>.</code><br>感情を表す分詞：interesting / interested, exciting / excited, surprising / surprised。" },
      ],
      [
        { en: "I know the girl <b>playing</b> the piano.", ja: "私はピアノを弾いている女の子を知っています。" },
        { en: "This is a picture <b>taken</b> in Kyoto.", ja: "これは京都で撮られた写真です。" },
        { en: "I was <b>surprised</b> at the news.", ja: "私はその知らせに驚きました。" },
      ],
      "「〜している」なら -ing、「〜される／された」なら過去分詞。名詞との関係を矢印で考えると分かりやすいです。",
      [
        q("The boy ___ soccer is my brother.", ["play", "played", "playing", "to play"], 2, "「サッカーをしている」ので現在分詞。"),
        q("This is a book ___ in English.", ["write", "wrote", "written", "writing"], 2, "「英語で書かれた」ので過去分詞。"),
        q("The movie was very ___.", ["interest", "interesting", "interested", "interests"], 1, "物が人を面白がらせる → interesting。"),
      ]),

    T("g3-relative", "3", "relative", "関係代名詞 — who / which / that",
      "2つの文を1つにまとめ、名詞を後ろから説明します。",
      [
        { h: "主格の関係代名詞", b: "先行詞（説明される名詞）が人なら <b>who</b>、物なら <b>which</b>、どちらも <b>that</b> が使えます。<br><code>I have a friend. He lives in Canada.</code><br>→ <code>I have a friend <b>who</b> lives in Canada.</code><br>関係代名詞のあとは「主語 + 動詞」の形。" },
        { h: "目的格と所有格", b: "<b>目的格</b>：<code>the book <b>which</b> I bought</code>（私が買った本）→ 目的格は省略可能。<br><b>所有格 whose</b>：<code>the boy <b>whose</b> father is a doctor</code>（父親が医者である少年）<br>人以外でも whose は使えます。" },
      ],
      [
        { en: "I have a friend <b>who</b> speaks French.", ja: "私にはフランス語を話す友達がいます。" },
        { en: "This is the cake <b>which</b> my mother made.", ja: "これは母が作ったケーキです。" },
        { en: "The man <b>whose</b> car was stolen called the police.", ja: "車を盗まれた男は警察に電話しました。" },
      ],
      "関係代名詞の直後が「動詞」なら主格、「主語 + 動詞」なら目的格。空所の後ろをよく見ましょう。",
      [
        q("I know a girl ___ speaks three languages.", ["who", "which", "whose", "whom"], 0, "先行詞が人で、後ろが動詞なので主格 who。"),
        q("This is the house ___ he built.", ["who", "which", "whose", "what"], 1, "先行詞が物、後ろに主語 he があるので目的格 which。"),
        q("I met a boy ___ sister is a famous singer.", ["who", "which", "whose", "that"], 2, "「その姉が」という所有関係なので whose。"),
      ]),

    T("g3-comparison", "3", "comparison", "as ... as と比較の応用",
      "「同じくらい」「〜ほど…でない」。数量や倍数も表現できます。",
      [
        { h: "同等・否定", b: "<b>as + 形容詞/副詞 + as</b>「〜と同じくらい…」<br><code>He is <b>as tall as</b> his father.</code><br>否定は <b>not as ... as</b>「〜ほど…でない」<br><code>This book is <b>not as interesting as</b> that one.</code><br>as の間には形容詞か副詞が入ります。" },
        { h: "倍数・最上級の言い換え", b: "<b>twice as ... as</b>「2倍…」<br><code>This room is <b>twice as large as</b> mine.</code><br>最上級は比較級で言い換えられます。<br><code>He is the tallest in his class.</code> = <code>He is taller than any other student in his class.</code>" },
      ],
      [
        { en: "Mt. Fuji is <b>the highest</b> mountain in Japan.", ja: "富士山は日本でいちばん高い山です。" },
        { en: "This bag is <b>not as big as</b> that one.", ja: "このかばんはあれほど大きくありません。" },
        { en: "She runs <b>faster than</b> anyone else.", ja: "彼女は誰よりも速く走ります。" },
      ],
      "as ... as の間には「形容詞か副詞」しか入りません。名詞を入れたくなったら別の構文を疑いましょう。",
      [
        q("This watch is ___ as that one.", ["as expensive", "expensive as", "as expensive as", "more expensive"], 0, "as expensive as の形。"),
        q("Tom is not ___ his brother.", ["as tall as", "tall as", "as tall", "taller"], 0, "否定の同等比較 not as tall as。"),
        q("This pool is ___ as that one.", ["two times", "twice as large", "twice large", "as twice large"], 1, "「2倍の大きさ」は twice as large as。"),
      ]),

    T("g3-indirect", "3", "basic", "間接疑問文 — 疑問文の中に疑問文",
      "「〜か知っていますか」の形。語順が平叙文になるのがポイント。",
      [
        { h: "作り方", b: "疑問詞で始まる疑問文を、文の一部として組み込みます。組み込んだ後は<b>疑問詞 + 主語 + 動詞</b>の語順になります。<br><code>Where does he live?</code><br>→ <code>Do you know <b>where he lives</b>?</code><br>do / does は消え、動詞に三単現の -s が戻る点に注意。" },
        { h: "yes / no で答える質問", b: "疑問詞がない場合は <b>if</b> または <b>whether</b>「〜かどうか」を使います。<br><code>Is she coming?</code> → <code>I don't know <b>if she is coming</b>.</code>" },
      ],
      [
        { en: "Do you know <b>what this is</b>?", ja: "これが何か知っていますか。" },
        { en: "Tell me <b>where you bought</b> that bag.", ja: "そのかばんをどこで買ったか教えてください。" },
        { en: "I wonder <b>if it will rain</b> tomorrow.", ja: "明日雨が降るかどうか気になります。" },
      ],
      "間接疑問文では do / does / did を使いません。疑問文の形をそのまま入れないように注意。",
      [
        q("Do you know where ___?", ["does he live", "he lives", "he live", "is he live"], 1, "間接疑問文は平叙文の語順。"),
        q("I don't know ___ she will come.", ["that", "if", "what", "which"], 1, "「〜かどうか」は if。"),
        q("Please tell me what ___ .", ["do you want", "you want", "you do want", "want you"], 1, "疑問詞 + 主語 + 動詞。"),
      ]),

    T("g3-preposition", "3", "connector", "前置詞の使い分け",
      "in / on / at、for / since、by / until。日本語では同じでも英語では違う。",
      [
        { h: "時と場所", b: "<b>at</b>：点（at 7:00, at the station）<br><b>on</b>：接触・日付（on Monday, on the desk）<br><b>in</b>：空間・期間（in Japan, in July, in the box）<br>月・年・季節は in、曜日・日付は on、時刻は at。" },
        { h: "期間と期限", b: "<b>for</b> + 期間（for three years）<br><b>since</b> + 起点（since 2020）<br><b>by</b>「〜までに」（期限）<code>Finish it <b>by</b> Friday.</code><br><b>until</b>「〜までずっと」（継続）<code>Wait <b>until</b> Friday.</code>" },
      ],
      [
        { en: "I have studied English <b>for</b> five years.", ja: "私は5年間英語を勉強しています。" },
        { en: "The meeting starts <b>at</b> ten <b>on</b> Monday.", ja: "会議は月曜日の10時に始まります。" },
        { en: "Please finish this <b>by</b> noon.", ja: "正午までにこれを終えてください。" },
      ],
      "by は「期限」、until は「その時までずっと」。日本語の「まで」に引っぱられないようにしましょう。",
      [
        q("I have lived here ___ 2019.", ["for", "since", "by", "until"], 1, "起点には since。"),
        q("The train leaves ___ 8:30.", ["in", "on", "at", "for"], 2, "時刻には at。"),
        q("Submit the report ___ Friday.", ["until", "by", "since", "for"], 1, "期限「〜までに」は by。"),
      ]),

    /* ================= 準2級 ================= */
    T("p2-perfect", "pre2", "tense", "過去完了・未来完了",
      "基準となる時点より「前」や「それまでに」を表す完了形。",
      [
        { h: "過去完了 had + 過去分詞", b: "過去のある時点より<b>さらに前</b>の出来事を表します。<br><code>When I arrived, the train <b>had already left</b>.</code>（着いた時にはすでに出発していた）<br>継続：<code>He <b>had lived</b> there for ten years before he moved.</code>" },
        { h: "未来完了 will have + 過去分詞", b: "未来のある時点までに完了していることを表します。<br><code>I <b>will have finished</b> the work by tomorrow.</code><br>「by + 未来の時点」とセットで使うことが多いです。" },
      ],
      [
        { en: "She <b>had never seen</b> snow before she came to Japan.", ja: "彼女は日本に来る前、雪を見たことがありませんでした。" },
        { en: "By next year, I <b>will have worked</b> here for ten years.", ja: "来年で、ここで10年働いたことになります。" },
        { en: "The movie <b>had started</b> when we got to the theater.", ja: "劇場に着いたとき、映画は始まっていました。" },
      ],
      "過去完了は「過去の過去」。when / before / by the time の文で、どちらの出来事が先かを意識しましょう。",
      [
        q("When I got home, my family ___ dinner.", ["has", "had had", "have", "was"], 1, "私が帰る前に夕食を終えていた → had had。"),
        q("He had studied English for six years ___ he went abroad.", ["before", "after", "until", "since"], 0, "過去完了と before の組み合わせ。"),
        q("By 2030, she ___ here for 20 years.", ["will work", "will have worked", "has worked", "worked"], 1, "未来までの継続 → will have worked。"),
      ]),

    T("p2-modal-perfect", "pre2", "modal", "助動詞 + have + 過去分詞",
      "過去の出来事に対する推量や後悔を表す、入試頻出の形。",
      [
        { h: "推量の意味", b: "<b>must have p.p.</b>「〜したに違いない」<br><b>may / might have p.p.</b>「〜したかもしれない」<br><b>can't / couldn't have p.p.</b>「〜したはずがない」<br><code>He <b>must have missed</b> the bus.</code>" },
        { h: "後悔・非難", b: "<b>should have p.p.</b>「〜すべきだった（のにしなかった）」<br><b>shouldn't have p.p.</b>「〜すべきではなかった（のにした）」<br><b>needn't have p.p.</b>「〜する必要はなかった（のにした）」<br><code>You <b>should have told</b> me earlier.</code>" },
      ],
      [
        { en: "She <b>must have forgotten</b> our meeting.", ja: "彼女は私たちの約束を忘れたに違いない。" },
        { en: "I <b>should have studied</b> harder.", ja: "もっと勉強すべきだった。" },
        { en: "He <b>can't have said</b> such a thing.", ja: "彼がそんなことを言ったはずがない。" },
      ],
      "「must have」は過去の断定、「should have」は後悔。感情の方向が逆なのでセットで覚えましょう。",
      [
        q("The ground is wet. It ___ last night.", ["must rain", "must have rained", "should rain", "can rain"], 1, "過去の推量 must have rained。"),
        q("You ___ me the truth yesterday.", ["should tell", "should have told", "must tell", "may tell"], 1, "「言うべきだった」の後悔。"),
        q("She ___ the news. She looks surprised.", ["can't have heard", "must have heard", "should have heard", "may hear"], 0, "驚いている → 聞いたはずがない。"),
      ]),

    T("p2-passive", "pre2", "passive", "さまざまな受動態",
      "進行形・完了形の受動態、そして「〜と言われている」の表現。",
      [
        { h: "時制のある受動態", b: "<b>進行形</b>：be being + p.p.<code>The bridge <b>is being built</b>.</code><br><b>完了形</b>：have been + p.p.<code>The work <b>has been finished</b>.</code><br><b>助動詞</b>：can be + p.p.<code>This can <b>be seen</b> from here.</code>" },
        { h: "It is said that ... / be said to ...", b: "<code><b>It is said that</b> he is rich.</code><br>= <code>He <b>is said to be</b> rich.</code><br>同様に believed / reported / thought / known なども使えます。<br>群動詞は前置詞を残します。<code>The children <b>are looked after</b> by her.</code>" },
      ],
      [
        { en: "The road <b>is being repaired</b> now.", ja: "その道路は今修理されています。" },
        { en: "<b>It is believed that</b> the castle was built in the 16th century.", ja: "その城は16世紀に建てられたと考えられています。" },
        { en: "He <b>is known to</b> everyone.", ja: "彼は誰にでも知られています。" },
      ],
      "be said to の後ろは、元の文の時制に合わせて to do / to have done を使い分けます。",
      [
        q("The meeting ___ right now.", ["is holding", "is being held", "has held", "holds"], 1, "進行形の受動態 is being held。"),
        q("It ___ that she will resign.", ["says", "is said", "said", "is saying"], 1, "It is said that ... の受動構文。"),
        q("He is said ___ abroad last year.", ["to study", "to have studied", "studying", "studied"], 1, "過去の内容なので to have studied。"),
      ]),

    T("p2-causative", "pre2", "verbal", "使役動詞・知覚動詞",
      "「〜させる」「〜するのを見る」。目的語の後ろの形が勝負。",
      [
        { h: "使役動詞", b: "<b>make / let / have + 人 + 動詞の原形</b>「人に〜させる」<br><code>My father <b>made me clean</b> my room.</code><br><b>get + 人 + to do</b>「人に〜してもらう」<br><b>have / get + 物 + 過去分詞</b>「物を〜してもらう」<br><code>I <b>had my hair cut</b>.</code>" },
        { h: "知覚動詞", b: "<b>see / hear / feel + 人 + doing</b>「〜しているのを見る」<br><b>see / hear / feel + 人 + 原形</b>「〜するのを見る（一部始終）」<br><code>I saw him <b>crossing</b> the street.</code>（渡っている途中）<br><code>I saw him <b>cross</b> the street.</code>（渡りきるのを見た）" },
      ],
      [
        { en: "She <b>made me wait</b> for an hour.", ja: "彼女は私を1時間待たせました。" },
        { en: "I <b>had my car repaired</b> yesterday.", ja: "私は昨日車を修理してもらいました。" },
        { en: "I <b>heard someone calling</b> my name.", ja: "誰かが私の名前を呼んでいるのが聞こえました。" },
      ],
      "make / let / have の後ろは to なしの原形。get だけは to が必要、と整理すると混乱しません。",
      [
        q("My mother made me ___ my homework.", ["do", "to do", "doing", "done"], 0, "make + 人 + 原形。"),
        q("I got my brother ___ my bike.", ["fix", "to fix", "fixing", "fixed"], 1, "get + 人 + to do。"),
        q("I saw her ___ the piano.", ["play", "to play", "played", "plays"], 0, "知覚動詞 + 人 + 原形。"),
      ]),

    T("p2-participle", "pre2", "verbal", "分詞構文",
      "「〜しながら」「〜なので」。文を引き締める上級テクニック。",
      [
        { h: "基本の形と意味", b: "接続詞 + 主語 + 動詞 を、<b>分詞</b>に圧縮します。<br><code>When I walked in the park, I met him.</code><br>→ <code><b>Walking</b> in the park, I met him.</code><br>意味は<b>同時・理由・条件・譲歩・連続</b>など。文脈で判断します。" },
        { h: "完了形・受動・独立分詞", b: "<b>Having + p.p.</b>「〜してしまった後で」<br><code><b>Having finished</b> my homework, I went out.</code><br><b>過去分詞</b>で受動。<code><b>Written</b> in English, the book is hard to read.</code><br><b>独立分詞構文</b>：主語が異なる場合。<code><b>Weather permitting</b>, we will go.</code>" },
      ],
      [
        { en: "<b>Walking</b> along the river, I met an old friend.", ja: "川沿いを歩いているとき、旧友に会いました。" },
        { en: "<b>Not knowing</b> what to say, she kept silent.", ja: "何を言えばいいか分からず、彼女は黙っていました。" },
        { en: "<b>Having lost</b> my key, I couldn't enter the room.", ja: "鍵をなくしてしまったので、部屋に入れませんでした。" },
      ],
      "否定は分詞の前に not。意味が曖昧なときは、元の接続詞を補って考えるとスムーズです。",
      [
        q("___ tired, he went to bed early.", ["Feel", "Feeling", "Felt", "To feel"], 1, "「疲れていたので」理由の分詞構文。"),
        q("___ in 1900, the house is very old.", ["Building", "Built", "To build", "Build"], 1, "受動の意味なので過去分詞 Built。"),
        q("___ my homework, I watched TV.", ["Finish", "Finishing", "Having finished", "To finish"], 2, "宿題を終えた後 → Having finished。"),
      ]),

    T("p2-relative-adv", "pre2", "relative", "関係副詞 — where / when / why",
      "関係代名詞の「副詞バージョン」。先行詞が場所・時・理由。",
      [
        { h: "関係副詞の種類", b: "<b>where</b> 場所 / <b>when</b> 時 / <b>why</b> 理由（the reason why）。<br><code>This is the town <b>where</b> I was born.</code><br>関係副詞の後ろは<b>完全な文</b>（主語 + 動詞）になります。<br>関係代名詞は後ろが不完全（主語や目的語が欠ける）でした。" },
        { h: "書き換え", b: "<code>the house <b>where</b> he lives</code> = <code>the house <b>in which</b> he lives</code><br><code>the day <b>when</b> we met</code> = <code>the day <b>on which</b> we met</code><br>先行詞が the reason のときは why、または that / 省略も可能です。" },
      ],
      [
        { en: "Kyoto is a city <b>where</b> many temples remain.", ja: "京都は多くの寺が残る都市です。" },
        { en: "I remember the day <b>when</b> we first met.", ja: "初めて会った日のことを覚えています。" },
        { en: "Tell me the reason <b>why</b> you were absent.", ja: "欠席した理由を教えてください。" },
      ],
      "後ろが完全な文なら関係副詞、不完全なら関係代名詞。空所の後ろを必ず確認しましょう。",
      [
        q("This is the school ___ I studied.", ["which", "where", "who", "whose"], 1, "場所 + 完全な文 → where。"),
        q("I'll never forget the day ___ we met.", ["which", "where", "when", "why"], 2, "時 + 完全な文 → when。"),
        q("That is the reason ___ he left.", ["which", "when", "why", "where"], 2, "理由 → the reason why。"),
      ]),

    T("p2-comparison", "pre2", "comparison", "比較の応用 — the more ..., the more ...",
      "「〜すればするほど…」。倍数・否定比較も整理。",
      [
        { h: "相関比較", b: "<b>the + 比較級 + 主語 + 動詞, the + 比較級 + 主語 + 動詞</b><br><code><b>The more</b> you practice, <b>the better</b> you become.</code><br>「練習すればするほど、上手くなる」<br><code><b>The older</b> I get, <b>the less</b> I sleep.</code>" },
        { h: "数量・否定の比較", b: "<b>no more than</b>「たった〜しか」/ <b>not more than</b>「せいぜい〜」<br><b>no less than</b>「なんと〜も」/ <b>not less than</b>「少なくとも」<br><b>more than twice as ... as</b>「2倍以上…」<br><code>He has <b>no more than</b> ten books.</code>" },
      ],
      [
        { en: "<b>The more</b> you read, <b>the more</b> you learn.", ja: "読めば読むほど、多くを学べます。" },
        { en: "This bag is <b>three times as expensive as</b> that one.", ja: "このかばんはあれの3倍高いです。" },
        { en: "She is <b>no less talented than</b> her sister.", ja: "彼女は姉と同じくらい才能がある（劣らない）。" },
      ],
      "the 比較級の文は、前半と後半の「主語 + 動詞」の位置を固定して覚えると崩れません。",
      [
        q("___ you study, the more you learn.", ["More", "The more", "Most", "Much"], 1, "相関比較の The more ...。"),
        q("This is ___ as that one.", ["twice as big", "twice big", "as twice big", "big twice"], 0, "倍数 + as ... as。"),
        q("He has no ___ than five dollars.", ["many", "much", "more", "most"], 2, "no more than「たった〜しか」。"),
      ]),

    T("p2-subjunctive", "pre2", "subjunctive", "仮定法過去 — 現実と違う「もし」",
      "今の事実と反対のことを言うとき、過去形を使います。",
      [
        { h: "形と意味", b: "<b>If + 主語 + 過去形, 主語 + would / could / might + 原形</b><br><code><b>If I were</b> you, I <b>would</b> accept the offer.</code><br>「もし私があなたなら、その申し出を受けるのに」<br>be動詞は主語に関係なく <b>were</b> を使うのが基本です。" },
        { h: "倒置と願望", b: "if を省略して倒置できます。<code><b>Were I</b> you, ...</code><br>願望：<b>I wish + 過去形</b>「〜ならいいのに」<br><code>I <b>wish I could</b> fly.</code><br>過去形の代わりに could を使うと「能力」の仮定になります。" },
      ],
      [
        { en: "<b>If I had</b> more time, I <b>would travel</b> the world.", ja: "もっと時間があれば、世界中を旅行するのに。" },
        { en: "<b>If it were not</b> for water, no living thing could survive.", ja: "水がなければ、生き物は生きられないだろう。" },
        { en: "I <b>wish I were</b> taller.", ja: "もっと背が高ければいいのに。" },
      ],
      "仮定法の if 節には will を使いません。「今の事実の逆 → 過去形」とセットで覚えましょう。",
      [
        q("If I ___ rich, I would buy a house.", ["am", "was", "were", "will be"], 2, "仮定法過去では were が基本。"),
        q("If he ___ harder, he could pass the exam.", ["studies", "studied", "will study", "has studied"], 1, "仮定法過去の if 節は過去形。"),
        q("I wish I ___ speak French.", ["can", "could", "will", "am"], 1, "wish + 過去形（could）。"),
      ]),

    /* ================= 2級 ================= */
    T("g2-compound-relative", "2", "relative", "複合関係詞 — whoever / whatever",
      "「〜する人は誰でも」。先行詞を含む関係詞。",
      [
        { h: "複合関係代名詞", b: "<b>whoever</b> = 誰でも / <b>whatever</b> = 何でも / <b>whichever</b> = どちらでも。<br>先行詞を含むので、後ろに名詞を置きません。<br><code><b>Whoever</b> comes first will get the prize.</code><br><code>You can take <b>whatever</b> you like.</code>" },
        { h: "複合関係副詞", b: "<b>wherever</b> どこでも / <b>whenever</b> いつでも / <b>however</b> どんなに〜でも。<br><code><b>Wherever</b> you go, I will follow you.</code><br><code><b>However</b> hard he tries, he cannot win.</code>（however + 形容詞/副詞 + 主語 + 動詞）" },
      ],
      [
        { en: "<b>Whatever</b> happens, don't give up.", ja: "何が起きても、あきらめないで。" },
        { en: "<b>Whoever</b> wants to join is welcome.", ja: "参加したい人は誰でも歓迎です。" },
        { en: "<b>However</b> busy you are, you should sleep.", ja: "どんなに忙しくても、睡眠は取るべきです。" },
      ],
      "however は「どんなに〜でも」の意味では後ろに形容詞・副詞が必要。接続副詞の however（しかしながら）と区別しましょう。",
      [
        q("___ you do, do your best.", ["Whatever", "Whoever", "However", "Wherever"], 0, "「何をするにしても」→ Whatever。"),
        q("___ comes late must wait outside.", ["Who", "Whoever", "Whomever", "Whatever"], 1, "「遅れて来る人は誰でも」→ Whoever。"),
        q("___ difficult the task is, she never gives up.", ["However", "Whatever", "Whenever", "Wherever"], 0, "however + 形容詞。"),
      ]),

    T("g2-subjunctive-past", "2", "subjunctive", "仮定法過去完了",
      "「あのとき〜していたら」。過去への後悔を表します。",
      [
        { h: "形", b: "<b>If + 主語 + had + 過去分詞, 主語 + would / could / might + have + 過去分詞</b><br><code><b>If I had known</b> the truth, I <b>would have acted</b> differently.</code><br>「真実を知っていたら、違う行動をしていただろう」" },
        { h: "混合仮定法", b: "if 節は過去、主節は現在のこともあります。<br><code><b>If I had taken</b> your advice then, I <b>would be</b> rich now.</code><br>（あのとき助言を聞いていたら、今は裕福だろう）<br><b>but for</b> = もし〜がなければ。<code><b>But for</b> your help, I would have failed.</code>" },
      ],
      [
        { en: "If she <b>had left</b> earlier, she <b>wouldn't have missed</b> the train.", ja: "もっと早く出ていたら、電車に乗り遅れなかったのに。" },
        { en: "<b>But for</b> the rain, we <b>would have enjoyed</b> the trip.", ja: "雨がなければ、旅行を楽しめたのに。" },
        { en: "If I <b>had studied</b> medicine, I <b>would be</b> a doctor now.", ja: "医学を学んでいたら、今は医者だっただろう。" },
      ],
      "「過去の後悔 → had + p.p.」。「今と違う → 過去形」。時制のずれを意識すると混合仮定法も怖くありません。",
      [
        q("If I ___ his number, I would have called him.", ["knew", "had known", "know", "have known"], 1, "過去の仮定 → had known。"),
        q("If she had practiced more, she ___ the contest.", ["wins", "would win", "would have won", "won"], 2, "過去の結果 → would have won。"),
        q("___ for your support, I could not have finished.", ["But", "Except", "Without", "Despite"], 0, "But for 〜「〜がなければ」。"),
      ]),

    T("g2-emphasis", "2", "syntax", "強調構文と倒置",
      "「〜なのは…だ」。情報の焦点を動かすテクニック。",
      [
        { h: "It is ... that の強調構文", b: "強調したい要素を It is と that の間に入れます。<br><code><b>It was Tom that</b> broke the window.</code>（壊したのはトムだ）<br><code><b>It was yesterday that</b> I met her.</code>（会ったのは昨日だ）<br>人なら who も使えます。" },
        { h: "否定語句の倒置", b: "否定や限定の語句が文頭に来ると、疑問文の語順になります。<br><code><b>Never have I seen</b> such a beautiful view.</code><br><code><b>Not only did he pass</b>, but he also got a perfect score.</code><br><code><b>Only then did I realize</b> my mistake.</code>" },
      ],
      [
        { en: "<b>It was in Kyoto that</b> we first met.", ja: "私たちが初めて会ったのは京都でした。" },
        { en: "<b>Never have I</b> heard such a story.", ja: "そんな話は一度も聞いたことがありません。" },
        { en: "<b>Not until midnight did</b> he come home.", ja: "真夜中になってようやく彼は帰宅しました。" },
      ],
      "強調構文は「It is 〜 that」の that 以下が完全な文になるのが目印。関係代名詞の it とは構造が違います。",
      [
        q("It was my mother ___ cooked this dish.", ["who", "which", "whose", "what"], 0, "人を強調するので who も可。"),
        q("Never ___ such a wonderful performance.", ["I have seen", "have I seen", "I saw", "did I saw"], 1, "否定語句の倒置で have I seen。"),
        q("It was last year ___ I started learning English.", ["when", "that", "which", "who"], 1, "時を強調する強調構文は that。"),
      ]),

    T("g2-idiom", "2", "idiom", "頻出イディオム",
      "知っている単語の組み合わせが、特別な意味になる。",
      [
        { h: "動詞 + 前置詞", b: "<b>account for</b> 説明する・占める / <b>come up with</b> 思いつく / <b>put up with</b> 我慢する / <b>look forward to -ing</b> 楽しみにする / <b>make up for</b> 埋め合わせる / <b>run out of</b> 使い果たす / <b>take advantage of</b> 利用する。" },
        { h: "形容詞・副詞の表現", b: "<b>be aware of</b> 気づいている / <b>be subject to</b> 〜の影響を受ける / <b>be likely to do</b> 〜しそうだ / <b>as a result of</b> 〜の結果として / <b>in terms of</b> 〜の点で / <b>on behalf of</b> 〜を代表して / <b>regardless of</b> 〜にかかわらず。" },
      ],
      [
        { en: "She <b>came up with</b> a brilliant idea.", ja: "彼女は素晴らしいアイデアを思いつきました。" },
        { en: "We <b>ran out of</b> milk this morning.", ja: "今朝牛乳を切らしてしまいました。" },
        { en: "I'm <b>looking forward to seeing</b> you again.", ja: "またお会いできるのを楽しみにしています。" },
      ],
      "look forward to の to は前置詞なので、後ろは動名詞。ここは最頻出のひっかけポイントです。",
      [
        q("I'm looking forward to ___ you.", ["see", "seeing", "seen", "saw"], 1, "to は前置詞なので seeing。"),
        q("They ___ up with a new plan.", ["came", "took", "put", "made"], 0, "come up with = 思いつく。"),
        q("We have ___ out of time.", ["taken", "run", "made", "put"], 1, "run out of = 使い果たす。"),
      ]),

    /* ================= 準1級 ================= */
    T("p1-nonrestrictive", "pre1", "relative", "関係詞の非制限用法",
      "カンマを付けると「補足説明」になる。訳し方が変わります。",
      [
        { h: "制限用法と非制限用法", b: "<b>制限用法</b>（カンマなし）は名詞を限定します。<br><code>The students <b>who passed</b> the exam were happy.</code>（合格した学生たち）<br><b>非制限用法</b>（カンマあり）は補足説明。後ろからではなく、前から訳します。<br><code>The students, <b>who passed</b> the exam, were happy.</code>（学生たちは、試験に合格して、喜んだ）" },
        { h: "注意点", b: "非制限用法では <b>that は使えません</b>。<br>先行詞は固有名詞や唯一のものにもなります。<br><code>I met John, <b>who</b> lives in London.</code><br><code>He gave up the plan, <b>which</b> surprised everyone.</code><br>which は前の文全体を受けることもあります。" },
      ],
      [
        { en: "My father, <b>who is a teacher</b>, loves history.", ja: "私の父は教師で、歴史が大好きです。" },
        { en: "She passed the exam, <b>which made her parents happy</b>.", ja: "彼女は試験に合格し、それが両親を喜ばせました。" },
        { en: "Tokyo, <b>which has many restaurants</b>, is a great city.", ja: "東京は多くのレストランがあり、素晴らしい都市です。" },
      ],
      "カンマの有無で意味が変わるので、長文読解ではカンマを見落とさないこと。that は非制限用法では使えません。",
      [
        q("I visited Kyoto, ___ is famous for its temples.", ["that", "which", "who", "what"], 1, "カンマ付きの非制限用法、物なので which。"),
        q("My brother, ___ lives in Osaka, is a doctor.", ["that", "which", "who", "whom"], 2, "人を補足説明、主格 who。"),
        q("He was late, ___ annoyed everyone.", ["that", "what", "which", "who"], 2, "前の文全体を受ける which。"),
      ]),

    T("p1-inversion", "pre1", "syntax", "倒置と強調の応用",
      "否定語句・only・仮定法の倒置を整理。長文でも頻出。",
      [
        { h: "否定語句の倒置", b: "<b>Never / Hardly / Seldom / Little / Not until / No sooner ... than</b> が文頭に来ると倒置が起こります。<br><code><b>Hardly had I arrived</b> when the phone rang.</code><br><code><b>No sooner had he left</b> than it began to rain.</code><br><b>Only + 副詞句</b>：<code><b>Only after the meeting did</b> I understand.</code>" },
        { h: "so / neither と仮定法", b: "同意：<code>So <b>do I</b>. / Neither <b>can she</b>.</code><br>仮定法倒置：<code><b>Had I known</b> the truth, I would have told you.</code><br><code><b>Were it not for</b> water, nothing could live.</code><br><code><b>Should you need</b> help, call me.</code>" },
      ],
      [
        { en: "<b>Little did I know</b> that he was lying.", ja: "彼が嘘をついているなんて、私はまったく知りませんでした。" },
        { en: "<b>Not until he apologized did</b> she forgive him.", ja: "彼が謝るまで、彼女は許さなかった。" },
        { en: "<b>Had I seen</b> the sign, I would have stopped.", ja: "標識を見ていたら、止まっていただろう。" },
      ],
      "倒置は「否定・限定の語句が文頭 → 疑問文の語順」。Hardly ... when、No sooner ... than のペアも暗記しましょう。",
      [
        q("Hardly ___ home when it started raining.", ["I had got", "had I got", "I got", "did I get"], 1, "Hardly が文頭 → had I got。"),
        q("___ I known, I would have helped.", ["If", "Had", "Have", "Did"], 1, "仮定法倒置 Had I known。"),
        q("Not only ___ he sing, but he also dances.", ["can", "does", "is", "has"], 0, "Not only の倒置。can he sing。"),
      ]),

    T("p1-collocation", "pre1", "idiom", "コロケーションと語法",
      "動詞・前置詞・名詞の自然な組み合わせを身につける。",
      [
        { h: "動詞 + 前置詞の型", b: "<b>provide A with B</b> / <b>accuse A of B</b> / <b>prevent A from doing</b> / <b>remind A of B</b> / <b>deprive A of B</b> / <b>substitute A for B</b> / <b>attribute A to B</b>。<br>日本語から直訳すると前置詞を間違えやすいので、型で覚えます。" },
        { h: "紛らわしい表現", b: "<b>be used to -ing</b>「〜に慣れている」<br><b>used to do</b>「かつて〜した」<br><b>be used to do</b>「〜するために使われる」<br><b>make / do</b>：make a decision / make an effort / do research / do harm。<br><b>affect</b>（動詞）と <b>effect</b>（名詞）の区別も重要。" },
      ],
      [
        { en: "The teacher <b>accused him of</b> cheating.", ja: "先生は彼をカンニングしたと責めました。" },
        { en: "This device <b>prevents the machine from overheating</b>.", ja: "この装置は機械の過熱を防ぎます。" },
        { en: "She <b>is used to working</b> late.", ja: "彼女は遅くまで働くことに慣れています。" },
      ],
      "「be used to -ing（慣れている）」と「used to do（昔は〜した）」は意味が全く違います。形で覚えましょう。",
      [
        q("They accused him ___ stealing the money.", ["for", "of", "with", "from"], 1, "accuse A of B。"),
        q("The rain prevented us ___ going out.", ["to", "for", "from", "of"], 2, "prevent A from doing。"),
        q("I ___ to living in Tokyo now.", ["am used", "used", "use", "am using"], 0, "be used to -ing = 慣れている。"),
      ]),

    /* ================= 1級 ================= */
    T("g1-subjunctive", "1", "subjunctive", "仮定法の応用",
      "Were it not for / But for / as if / would rather。ニュアンスを精密に。",
      [
        { h: "条件を隠した仮定", b: "<b>Were it not for</b> = <b>If it were not for</b>「〜がなければ」<br><b>Had it not been for</b> = 過去の「〜がなかったなら」<br><b>But for</b> も同じ意味。<br><b>otherwise</b>「さもなければ」<br><code>The accident could have been worse, <b>but for</b> the seatbelt.</code>" },
        { h: "願望・比喩・要求", b: "<b>as if / as though + 仮定法</b>「まるで〜のように」<br><code>He talks <b>as if he knew</b> everything.</code><br><b>would rather + 過去形</b>「むしろ〜したい」<br><b>It is (high) time + 過去形</b>「そろそろ〜する時間だ」<br><b>suggest / demand / insist + that + (should) 原形</b>（要求・提案）" },
      ],
      [
        { en: "<b>Had it not been for</b> your advice, I would have failed.", ja: "あなたの助言がなかったら、私は失敗していたでしょう。" },
        { en: "She treats me <b>as if I were</b> her brother.", ja: "彼女はまるで私が兄であるかのように接します。" },
        { en: "It is high time you <b>went</b> to bed.", ja: "そろそろ寝る時間ですよ。" },
      ],
      "as if の後ろは「事実と違う」なら仮定法。「事実の可能性が高い」なら直説法も可能です。文脈で判断します。",
      [
        q("___ it not for your help, I could not finish this.", ["Were", "If", "Had", "Should"], 0, "Were it not for の倒置。"),
        q("He talks as if he ___ everything.", ["knows", "knew", "know", "has known"], 1, "事実と違う比喩 → 仮定法過去 knew。"),
        q("It is about time we ___ home.", ["go", "went", "will go", "have gone"], 1, "It is time + 過去形。"),
      ]),

    T("g1-nominalization", "1", "noun", "名詞構文と無生物主語",
      "英語らしい「モノが主語」の文と、動詞を名詞に変える技。",
      [
        { h: "無生物主語", b: "日本語では人を主語にするところを、英語ではモノや原因を主語にします。<br><code>The news <b>made me happy</b>.</code>（その知らせで私は幸せになった）<br><code>This road <b>will take you to</b> the station.</code>（この道を行けば駅に着きます）<br><code>What <b>brought you here</b>?</code>（どうしてここへ？）" },
        { h: "名詞構文", b: "動詞や形容詞を名詞にして、文を簡潔にします。<br><code>He arrived suddenly.</code> → <code>His <b>sudden arrival</b> surprised us.</code><br><code>She is very kind.</code> → <code>I was impressed by her <b>kindness</b>.</code><br><b>of + 抽象名詞</b> = 形容詞：<code>of importance</code> = important、<code>of value</code> = valuable。" },
      ],
      [
        { en: "His <b>failure to answer</b> made everyone suspicious.", ja: "彼が答えなかったことで、皆が疑い始めました。" },
        { en: "The <b>arrival of the train</b> was announced.", ja: "電車の到着がアナウンスされました。" },
        { en: "This matter is <b>of great importance</b>.", ja: "この件は非常に重要です。" },
      ],
      "無生物主語は「原因 → 結果」の順で捉えると訳しやすい。of + 抽象名詞は形容詞の言い換えとして頻出です。",
      [
        q("The news brought ___ great joy.", ["me", "my", "I", "mine"], 0, "bring + 人 + 物の語順。"),
        q("His sudden ___ surprised everyone.", ["arrive", "arrival", "arriving", "arrived"], 1, "所有格の後ろは名詞 arrival。"),
        q("This issue is of great ___ .", ["important", "importance", "importantly", "import"], 1, "of + 抽象名詞 = 形容詞。"),
      ]),

    T("g1-inversion", "1", "syntax", "高度な倒置・省略・強調",
      "長文読解と英作文の差をつける構文。",
      [
        { h: "倒置のバリエーション", b: "<b>So + 形容詞 + be動詞 + 主語 + that ...</b><br><code><b>So beautiful was the view that</b> we stood still.</code><br><b>Such + be + 主語 + that ...</b><br><code><b>Such was his anger that</b> he could not speak.</code><br><b>Only when / Only if</b>：<code><b>Only when you lose it do you realize</b> its value.</code>" },
        { h: "省略と代用", b: "繰り返しを避けるため、助動詞や do で受けます。<br><code>He can swim, and <b>so can she</b>.</code><br><code>I don't like it. — <b>Neither do I.</b></code><br>比較構文での省略：<code>You look better than <b>you did</b> yesterday.</code><br>if の省略：<code><b>If necessary</b>, call me.</code>" },
      ],
      [
        { en: "<b>So difficult was the question that</b> nobody answered it.", ja: "その問題はあまりに難しく、誰も答えられませんでした。" },
        { en: "<b>Only by practicing every day can you improve</b>.", ja: "毎日練習して初めて上達できます。" },
        { en: "He doesn't smoke, and <b>neither does she</b>.", ja: "彼はタバコを吸わないし、彼女も吸いません。" },
      ],
      "倒置は「目立たせたい要素を前に出す」という一点。so / such / only / 否定語のどれが先頭かで形が決まります。",
      [
        q("So tired ___ that he fell asleep immediately.", ["he was", "was he", "he is", "is he"], 1, "So + adj + was + 主語 の倒置。"),
        q("Only after the exam ___ how much he had studied.", ["he realized", "did he realize", "he did realize", "realized he"], 1, "Only 句の後ろは倒置。"),
        q("She can speak Spanish, and ___ can her sister.", ["also", "so", "neither", "too"], 1, "肯定の同意は so can ...。"),
      ]),

    T("g1-idiom", "1", "idiom", "上級イディオム・語法",
      "1級の語彙問題は「知っているか」の勝負。",
      [
        { h: "頻出の定型表現", b: "<b>in light of</b> 〜を踏まえて / <b>on the verge of</b> まさに〜しようとして / <b>give rise to</b> 引き起こす / <b>stem from</b> 〜に由来する / <b>fall short of</b> 〜に達しない / <b>be tantamount to</b> 〜に等しい / <b>take a toll on</b> 〜に打撃を与える / <b>be conducive to</b> 〜に役立つ。" },
        { h: "語法の注意", b: "<b>comprise</b> = consist of（受動態にしない）<br><b>prefer A to B</b>（to を使う、than ではない）<br><b>superior / inferior / senior / junior to</b>（than ではない）<br><b>the number of + 複数名詞</b>（単数扱い）vs <b>a number of</b>（多数の・複数扱い）<br><b>amount</b> は不可算、<b>number</b> は可算。" },
      ],
      [
        { en: "<b>In light of</b> the new evidence, the case was reopened.", ja: "新しい証拠を踏まえて、事件は再捜査されました。" },
        { en: "The company is <b>on the verge of</b> bankruptcy.", ja: "その会社はまさに倒産しかけています。" },
        { en: "His illness <b>stems from</b> years of overwork.", ja: "彼の病気は長年の過労に由来します。" },
      ],
      "前置詞まで含めて覚えるのが鉄則。in light of / on the verge of / be conducive to はセットで暗記しましょう。",
      [
        q("The new policy gave ___ to a lot of criticism.", ["rise", "raise", "arise", "rose"], 0, "give rise to = 引き起こす。"),
        q("The results fell short ___ our expectations.", ["to", "of", "from", "with"], 1, "fall short of 〜。"),
        q("This environment is conducive ___ learning.", ["for", "with", "to", "of"], 2, "be conducive to 〜。"),
      ]),
  ];

export const EQ_GRAMMAR: GrammarTopic[] = EQ_GRAMMAR_RAW.map((topic) => {
  const genre = EQ_GENRES.find((g) => g.id === topic.genre);
  return {
    ...topic,
    genreName: genre ? genre.name : "",
    genreColor: genre ? genre.color : "#4f46e5",
  };
});
