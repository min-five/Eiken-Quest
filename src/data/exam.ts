/* ============================================================
   Reading passages & speaking/interview practice
   ============================================================ */
import type {
  ExamInfo,
  GradeId,
  InterviewSet,
  ReadingPassage,
} from "../types";

const R = (
  id: string,
  grade: GradeId,
  title: string,
  level: string,
  text: string[],
  questions: ReadingPassage["questions"],
): ReadingPassage => ({ id, grade, title, level, text, questions });

export const EQ_READING: ReadingPassage[] = [
    R("r5-1", "5", "Emma's Family", "やさしい", [
      "Hello. I'm Emma. I live in Osaka with my family. I have one brother. His name is Jack. He is ten years old.",
      "I like music. I play the piano every day. On Sundays, I go to the park with my dog. His name is Cookie. He is very cute. I love him.",
    ], [
      { q: "Where does Emma live?", choices: ["Tokyo", "Osaka", "Kyoto", "Nagoya"], a: 1, exp: "本文に「I live in Osaka」とあります。" },
      { q: "How old is Jack?", choices: ["Eight", "Nine", "Ten", "Eleven"], a: 2, exp: "「He is ten years old.」から10歳。" },
      { q: "What does Emma do on Sundays?", choices: ["She plays tennis.", "She goes to the park with her dog.", "She studies English.", "She visits her friend."], a: 1, exp: "「On Sundays, I go to the park with my dog.」" },
      { q: "What is the name of Emma's dog?", choices: ["Jack", "Emma", "Cookie", "Osaka"], a: 2, exp: "犬の名前は Cookie です。" },
    ]),

    R("r4-1", "4", "A Day at the Zoo", "ふつう", [
      "Last Saturday, my class went to the zoo. We left school at nine and took a bus. The bus ride was about forty minutes.",
      "We saw many animals. My favorite was the elephant. It was very big and smart. We also saw lions, monkeys, and penguins. After lunch, it started to rain, so we went to the gift shop. I bought a small toy elephant for my sister.",
      "We came back to school at four. It was a fun day, and I want to go there again with my family.",
    ], [
      { q: "How did the class go to the zoo?", choices: ["By train", "By bus", "By bike", "On foot"], a: 1, exp: "「took a bus」とあります。" },
      { q: "What was the writer's favorite animal?", choices: ["The lion", "The monkey", "The elephant", "The penguin"], a: 2, exp: "「My favorite was the elephant.」" },
      { q: "What did they do when it started to rain?", choices: ["They went home.", "They went to the gift shop.", "They took a nap.", "They saw more animals."], a: 1, exp: "雨が降り出したので gift shop へ行きました。" },
      { q: "What did the writer buy?", choices: ["A toy lion", "A book", "A toy elephant", "A hat"], a: 2, exp: "妹のために小さな toy elephant を買いました。" },
    ]),

    R("r3-1", "3", "My Volunteer Experience", "やや長め", [
      "Last summer, I spent two weeks volunteering at a local library. I chose this activity because I love books and wanted to do something useful during the summer vacation.",
      "My job was to put returned books back on the shelves and help children find books they wanted. At first, I was nervous because I did not know where all the books were. However, the librarians were very kind, and they taught me how the library was organized.",
      "The most memorable moment was when a small boy asked me for a book about dinosaurs. I found a colorful picture book for him, and he smiled and said, \"Thank you!\" That made me very happy.",
      "Through this experience, I learned that even small actions can help other people. I also became more confident when talking to strangers. I would like to volunteer again next summer.",
    ], [
      { q: "Why did the writer choose to volunteer at the library?", choices: ["Because a friend asked.", "Because the writer loves books.", "Because the library paid money.", "Because the school required it."], a: 1, exp: "「because I love books」が理由です。" },
      { q: "What was the writer nervous about at first?", choices: ["Speaking English", "Working with children", "Not knowing where the books were", "Being late"], a: 2, exp: "本の場所が分からなかったので不安でした。" },
      { q: "What did the small boy want?", choices: ["A book about dinosaurs", "A library card", "A picture of a library", "A new bag"], a: 0, exp: "恐竜の本を探していました。" },
      { q: "What did the writer learn?", choices: ["Libraries are boring.", "Small actions can help others.", "Children cannot read.", "Volunteering is difficult."], a: 1, exp: "最後の段落に「even small actions can help other people」とあります。" },
    ]),

    R("rpre2-1", "pre2", "Food Waste and Our Choices", "標準", [
      "Every year, a large amount of food is thrown away around the world. In Japan alone, millions of tons of food are wasted annually. This is not only a waste of money but also a serious environmental problem, because producing food uses water, land, and energy.",
      "There are several reasons for food waste. Supermarkets often throw away products that are still safe to eat simply because their labels show a date that has passed. Restaurants sometimes serve very large portions, and customers leave food on their plates. At home, people buy more than they need and forget what is in their refrigerators.",
      "Some countries have started to take action. In France, supermarkets are required to give unsold food to charities instead of throwing it away. In Japan, some companies are using technology to predict how much food customers will buy, so they can reduce the amount they prepare.",
      "However, laws and technology alone cannot solve the problem. Consumers also need to change their habits. Buying only what we need, planning meals, and using leftovers are simple but effective steps. Small changes in daily life, made by millions of people, can have a major impact.",
    ], [
      { q: "Why is food waste an environmental problem?", choices: ["It makes cities dirty.", "Producing food uses resources.", "It causes traffic jams.", "It increases food prices."], a: 1, exp: "食料生産に水・土地・エネルギーが使われるため。" },
      { q: "What do supermarkets sometimes do?", choices: ["Sell only fresh food.", "Give food to farmers.", "Throw away safe food because of labels.", "Stop selling vegetables."], a: 2, exp: "ラベルの日付が過ぎたという理由で捨てることがあります。" },
      { q: "What is France doing about the problem?", choices: ["Banning supermarkets", "Requiring stores to donate unsold food", "Raising food prices", "Teaching cooking in schools"], a: 1, exp: "フランスでは未販売食品を慈善団体へ寄付することが義務付けられています。" },
      { q: "What does the writer suggest at the end?", choices: ["Waiting for new laws", "Changing consumer habits", "Eating only at restaurants", "Buying food in bulk"], a: 1, exp: "最後に消費者の習慣の変化が必要だと述べています。" },
    ]),

    R("r2-1", "2", "Working from Anywhere", "やや難", [
      "Before 2020, working from home was uncommon in many companies. Most employees travelled to an office every day, and managers believed that face-to-face communication was essential for teamwork. Then the pandemic forced millions of people to work remotely, and both workers and companies discovered that many tasks could be done just as well from home.",
      "Remote work has clear advantages. Employees save time and money on commuting, and they can arrange their schedules around family needs. Companies can hire talented people regardless of where they live, and they may need less office space. Studies have also found that remote workers are often more productive, partly because they experience fewer interruptions.",
      "However, remote work is not perfect. Some people feel isolated without daily contact with colleagues. New employees may find it difficult to learn the culture of a company. In addition, the boundary between work and private life can easily disappear, leading to longer working hours and stress.",
      "Many companies are now choosing a hybrid system, in which employees work from home some days and come to the office on others. This approach allows workers to enjoy flexibility while still meeting colleagues in person. The key to success seems to be not where people work, but how well teams communicate and how much trust managers place in their employees.",
    ], [
      { q: "What did many companies believe before 2020?", choices: ["Remote work was more productive.", "Face-to-face communication was essential.", "Offices were too expensive.", "Employees preferred working from home."], a: 1, exp: "第1段落に「managers believed that face-to-face communication was essential」とあります。" },
      { q: "Which is mentioned as an advantage of remote work?", choices: ["Fewer interruptions", "Higher salaries", "Shorter vacations", "More office space"], a: 0, exp: "「fewer interruptions」が生産性の理由として挙げられています。" },
      { q: "What problem does the writer mention?", choices: ["Employees cannot use computers.", "New workers may struggle to learn company culture.", "Companies cannot find workers.", "Offices are becoming too small."], a: 1, exp: "新入社員が企業文化を学びにくいという課題が述べられています。" },
      { q: "What is the main idea of the last paragraph?", choices: ["Offices will disappear completely.", "Hybrid work balances flexibility and contact.", "Managers should not trust employees.", "Remote work is always better."], a: 1, exp: "ハイブリッド勤務が柔軟性と対面の良さを両立させると述べています。" },
    ]),

    R("rpre1-1", "pre1", "The Value of Failure", "難", [
      "Modern education often rewards students for giving correct answers and punishes them for making mistakes. From an early age, children learn that failure is something to be avoided. Yet a growing body of research suggests that this attitude may actually prevent learning and reduce creativity.",
      "Psychologists have found that people learn more effectively when they struggle with a problem before being shown the solution. This phenomenon, sometimes called \"productive failure,\" occurs because the effort of exploring wrong approaches helps the brain build a deeper understanding of the correct one. Students who are simply given the answer may remember it briefly, but they are less able to apply it in new situations.",
      "Failure also plays an important role in innovation. Many successful products were developed after a series of unsuccessful attempts. The inventor James Dyson reportedly built more than five thousand prototypes before his vacuum cleaner worked. If he had treated each failure as a reason to stop, the final product would never have existed.",
      "This does not mean that failure is always beneficial. Repeated failure without guidance can damage confidence and motivation. The crucial factor is how failure is interpreted. When teachers and managers treat mistakes as information rather than as evidence of incompetence, people become more willing to take risks, ask questions, and experiment. In other words, a culture that accepts failure is likely to produce more learning, not less.",
    ], [
      { q: "What does the writer say about modern education?", choices: ["It encourages too many mistakes.", "It often punishes mistakes.", "It focuses on creativity.", "It ignores correct answers."], a: 1, exp: "第1段落で、間違いを罰する傾向があると述べています。" },
      { q: "What is \"productive failure\"?", choices: ["Failing without any guidance", "Learning through struggling with a problem", "Giving up after several attempts", "Memorizing correct answers"], a: 1, exp: "答えを見せる前に自分で悩むことで深く学ぶ現象です。" },
      { q: "Why is James Dyson mentioned?", choices: ["To show that failure can lead to innovation", "To criticize modern education", "To explain how vacuums work", "To prove that inventors are rich"], a: 0, exp: "多数の試作の末に成功した例として挙げられています。" },
      { q: "What is the crucial factor according to the writer?", choices: ["The number of failures", "How failure is interpreted", "The age of the learner", "The type of school"], a: 1, exp: "失敗をどう解釈するかが重要だと述べています。" },
    ]),

    R("r1-1", "1", "The Attention Economy", "最難関", [
      "In the digital age, attention has become one of the most valuable commodities in the world. Technology companies generate enormous profits by capturing the time and focus of their users, and they employ increasingly sophisticated methods to do so. Every notification, autoplay feature, and personalized recommendation is designed to keep us engaged for just a little longer.",
      "The consequences of this attention economy are ambiguous. On the one hand, digital platforms provide unprecedented access to information, entertainment, and social connection. On the other, critics argue that the constant competition for our attention undermines our capacity for sustained concentration, deep reading, and reflective thought. Studies suggest that frequent interruptions, even brief ones, impose a measurable cognitive cost, making it harder to return to a complex task.",
      "Some commentators frame the issue as a matter of individual responsibility: people should simply exercise self-control and limit their screen time. Yet this perspective may underestimate the extent to which platforms are engineered to exploit psychological vulnerabilities. Features such as infinite scrolling and variable rewards are borrowed directly from behavioral science, and they operate largely below the level of conscious awareness.",
      "Regulation is one possible response. Several countries have introduced rules requiring platforms to limit features aimed at children, and some researchers advocate for design standards that prioritize user well-being over engagement. Others place their faith in digital literacy education, arguing that informed users are the most effective defense. Whichever approach is adopted, the debate ultimately concerns a fundamental question: whether human attention should be treated as a resource to be extracted, or as a capacity worth protecting.",
    ], [
      { q: "What is the main purpose of the features mentioned in the first paragraph?", choices: ["To reduce screen time", "To keep users engaged", "To protect private data", "To improve concentration"], a: 1, exp: "通知や自動再生などは利用者をつなぎとめるための仕組みです。" },
      { q: "What cognitive cost is mentioned?", choices: ["Improved memory", "Difficulty returning to complex tasks", "Faster reading speed", "Better multitasking"], a: 1, exp: "中断によって複雑な作業に戻りにくくなるというコストが述べられています。" },
      { q: "Why does the writer criticize the \"individual responsibility\" view?", choices: ["It ignores platform design that exploits psychology.", "It demands too much regulation.", "It focuses only on children.", "It is supported by too much research."], a: 0, exp: "プラットフォームが心理的弱点を利用する設計になっている点を見落としているから。" },
      { q: "Which response is NOT mentioned?", choices: ["Regulation", "Design standards", "Digital literacy education", "Banning all social media"], a: 3, exp: "SNSの全面禁止には触れていません。" },
      { q: "What fundamental question does the writer raise?", choices: ["Whether attention is a resource or a capacity to protect", "Whether technology companies pay enough tax", "Whether children should use phones", "Whether reading is still important"], a: 0, exp: "最後の文に明示されています。" },
    ]),
  ];

export const EQ_READING_BY_GRADE: Partial<Record<GradeId, ReadingPassage[]>> = {};
EQ_READING.forEach((passage) => {
  (EQ_READING_BY_GRADE[passage.grade] ??= []).push(passage);
});

const I = (
  grade: GradeId,
  data: Omit<InterviewSet, "grade">,
): InterviewSet => ({ grade, ...data });

export const EQ_INTERVIEW: Record<GradeId, InterviewSet> = {
    "5": I("5", {
      hasReading: true,
      intro: "英検5級のスピーキングテストへようこそ。本番は音読（20語程度）→ パッセージについて2問 → 身近なこと1問、の録音型テストです。",
      passage: {
        title: "My Family",
        text: "This is my family. There are four people in my family: my father, my mother, my sister, and I. My father is a teacher. My mother works at a hospital. My sister is eight years old. We have a dog. His name is Pochi. We like him very much.",
      },
      qa: [
        { q: "How many people are there in your family?", model: "There are four people in my family.", hint: "There are ... で人数を答えましょう。" },
        { q: "What does your father do?", model: "He is a teacher.", hint: "He is a ... / She is a ... で職業を答えます。" },
        { q: "Do you have a pet?", model: "Yes, I do. I have a dog.", hint: "Yes, I do. / No, I don't. で答えたあと、一言添えると好印象。" },
      ],
      opinion: null,
      tips: [
        "録音型のテストです。マイクに向かって、ゆっくり・はっきり、相手に伝わる声で話しましょう。",
        "音読は「ゆっくり・はっきり・区切りを意識」。分からない単語は飛ばさず、推測して読みましょう。",
        "質問は短文でOK。沈黙が一番もったいないので、まずは Yes / No から始めましょう。",
      ],
    }),

    "4": I("4", {
      hasReading: true,
      intro: "英検4級のスピーキングテストへようこそ。本番は音読（25語程度）→ 内容についての質問 → 身近なことについての質問、の録音型テストです。",
      passage: {
        title: "A School Festival",
        text: "Last month, my school had a festival. We practiced for two weeks. My class made a small cafe. We served cake and tea. Many students came to our cafe. I was nervous, but everyone was kind. After the festival, we cleaned the classroom together. It was a very good day.",
      },
      qa: [
        { q: "When did the school have a festival?", model: "Last month.", hint: "時を聞かれたら、Last month. のように短く答えてもOK。" },
        { q: "What did the writer's class make?", model: "They made a small cafe.", hint: "主語を they に変えて答えましょう。" },
        { q: "How did the writer feel at the festival?", model: "The writer was nervous, but everyone was kind.", hint: "本文の気持ちを表す語を探します。" },
        { q: "What do you like to do on weekends?", model: "I like to play soccer with my friends.", hint: "自分のことなので、I like to ... で自由に答えましょう。" },
      ],
      opinion: null,
      tips: [
        "音読の前に、意味の区切りを確認しましょう。区切りを意識すると、聞き取りやすくなります。",
        "質問の主語が writer / he / she に変わることがあります。代名詞に注意。",
        "「I don't know.」でも沈黙よりは合格につながります。まず声を出しましょう。",
      ],
    }),

    "3": I("3", {
      hasReading: true,
      intro: "英検3級の面接は「音読 → 3つの質問」の流れ。内容は身近な話題です。",
      passage: {
        title: "A Trip to the Beach",
        text: "Last summer, Ken and his family visited a beach in Okinawa. They stayed there for three days. On the first day, they swam in the sea and enjoyed a picnic on the sand. On the second day, it rained, so they visited an aquarium. Ken was surprised to see a huge whale shark. He took many photos and sent them to his friends. On the last day, they bought some presents for Ken's grandparents before going home.",
      },
      qa: [
        { q: "How long did Ken and his family stay at the beach?", model: "They stayed there for three days.", hint: "本文の数字と期間表現をそのまま使いましょう。" },
        { q: "What did they do on the second day?", model: "Because it rained, they visited an aquarium.", hint: "理由 + 行動の形で答えると自然です。" },
        { q: "Why did Ken take many photos?", model: "He was surprised to see a huge whale shark.", hint: "Why には Because ... で答えましょう。" },
      ],
      opinion: null,
      tips: [
        "音読は20秒黙読 → 音読。固有名詞（Okinawa, aquarium）も落ち着いて。",
        "質問は3つ。1つ目は Yes / No、2つ目は本文の内容、3つ目は理由、というパターンが多いです。",
        "答えは基本的に本文の語句を使います。自分の意見を足す必要はありません。",
      ],
    }),

    "pre2": I("pre2", {
      hasReading: true,
      intro: "準2級からは「音読 → Q&A → 意見問題」に。意見問題は理由を2つ言えると高評価です。",
      passage: {
        title: "Learning Through Travel",
        text: "Many students join school trips to other countries. Some people think these trips are expensive and not very useful, but they can offer valuable experiences that cannot be gained in a classroom. When students visit a foreign country, they must communicate in a language that is not their own. This can be difficult at first, but it helps them become more confident. They also learn about local customs and food, which can change the way they see the world. In addition, living with a host family teaches them to be independent. Although not every student can afford to travel, such programs may be worth supporting.",
      },
      qa: [
        { q: "What do some people think about school trips to other countries?", model: "They think the trips are expensive and not very useful.", hint: "Some people think ... の形で本文を言い換えます。" },
        { q: "How can traveling help students become more confident?", model: "They must communicate in a different language, which helps them become more confident.", hint: "本文の因果関係をつなげて答えましょう。" },
        { q: "What can students learn from a host family?", model: "They can learn to be independent.", hint: "host family の近くに書かれている内容を探します。" },
      ],
      opinion: {
        topic: "Do you think school trips to other countries are a good idea?",
        points: ["新しい経験ができる", "お金がかかる"],
        sample: "I think school trips to other countries are a good idea. First, students can have experiences that they cannot get in a classroom, such as communicating in a foreign language. Second, they can learn about different cultures and become more open-minded. However, these trips are expensive, so schools should offer support for students who cannot afford them.",
      },
      tips: [
        "意見問題は「I think ...」→「First, ...」→「Second, ...」→「However, ...」の型が使えます。",
        "理由はできれば2つ。1つしか思いつかなくても、具体的な例を添えれば十分です。",
        "音読中にキーワードに印を付けるつもりで読むと、Q&Aで探しやすくなります。",
      ],
    }),

    "2": I("2", {
      hasReading: true,
      intro: "2級の面接は、社会的なテーマについて自分の意見を論理的に述べる力が試されます。",
      passage: {
        title: "The Rise of Online Shopping",
        text: "Online shopping has changed the way people buy things. In the past, most people went to stores to buy clothes, food, and household goods. Today, however, a growing number of consumers order almost everything through the Internet. This shift has clear benefits: people can compare prices easily, shop at any time, and have products delivered to their homes. For elderly people or those living in remote areas, online shopping can be especially convenient. On the other hand, it has caused problems for small local shops, many of which have been forced to close. There are also concerns about the environmental impact of packaging and delivery. Some cities are now trying to support local businesses by creating shared delivery systems and encouraging residents to shop in their neighborhoods.",
      },
      qa: [
        { q: "What are some benefits of online shopping?", model: "People can compare prices easily, shop at any time, and have products delivered.", hint: "benefits の直後に3つ列挙されています。" },
        { q: "Why is online shopping convenient for some people?", model: "It is especially convenient for elderly people and those in remote areas.", hint: "For elderly people ... の部分を探しましょう。" },
        { q: "What are some cities doing to help local businesses?", model: "They are creating shared delivery systems and encouraging residents to shop locally.", hint: "最後の文に具体策が書かれています。" },
      ],
      opinion: {
        topic: "Do you think online shopping will replace traditional stores in the future?",
        points: ["便利さと選択肢の広さ", "体験・対面の価値 / 地域経済"],
        sample: "I believe online shopping will continue to grow, but it will not completely replace traditional stores. First, online shopping is convenient and offers a wider choice of products at competitive prices. Second, physical stores provide experiences that the Internet cannot, such as trying on clothes and receiving advice from staff. In addition, local shops are important for communities. Therefore, I think the two forms of shopping will coexist in the future.",
      },
      tips: [
        "意見は「賛成・反対」を最初に明確に。結論を最後に繰り返すと論理的に聞こえます。",
        "理由は2つ + 具体例。テンプレートに当てはめすぎず、自分の言葉で言い換えましょう。",
        "分からない質問は「Could you say that again, please?」と聞き返してOK。",
      ],
    }),

    "pre1": I("pre1", {
      hasReading: true,
      intro: "準1級では、抽象度の高い文章の音読と、社会的な問題に対する意見が問われます。",
      passage: {
        title: "The Cost of Convenience",
        text: "Few people would deny that convenience has improved our lives. Food can be ordered with a single tap, information is available instantly, and services that once required hours of waiting are now delivered within minutes. Yet the pursuit of convenience carries hidden costs. When tasks become effortless, the skills required to perform them may gradually disappear. Research on navigation, for example, suggests that people who rely entirely on digital maps often develop a weaker sense of direction. Similarly, the habit of reading short summaries instead of complete texts may limit our ability to follow complex arguments. This is not to say that convenience should be rejected. Rather, it suggests that individuals and societies should make deliberate choices about which skills are worth preserving, and which forms of effort remain valuable even when they could be avoided.",
      },
      qa: [
        { q: "What examples of convenience are mentioned?", model: "Ordering food with a single tap, instant access to information, and faster services.", hint: "第1段落の具体例を拾います。" },
        { q: "What hidden cost does the writer point out?", model: "Skills may gradually disappear when tasks become effortless.", hint: "「hidden costs」の直後を探しましょう。" },
        { q: "What example of navigation is given?", model: "People who rely on digital maps may develop a weaker sense of direction.", hint: "Research on navigation ... の文です。" },
        { q: "What does the writer ultimately suggest?", model: "We should make deliberate choices about which skills are worth preserving.", hint: "最後の文を言い換えます。" },
      ],
      opinion: {
        topic: "Should we try to preserve skills that technology has made unnecessary?",
        points: ["アイデンティティ・文化の継承", "効率性・実用性"],
        sample: "I believe some skills are worth preserving even if technology makes them unnecessary. First, certain skills are closely tied to cultural identity and personal pride. For example, traditional crafts carry history and meaning that cannot be replaced by machines. Second, learning to do things manually can deepen our understanding of the world and improve our ability to solve unexpected problems. Of course, we should not reject useful technology. However, keeping some skills alive is a way of maintaining diversity and human agency.",
      },
      tips: [
        "音読は意味のまとまりで区切る。コンマや接続詞の前で軽く間を置くと聞きやすいです。",
        "意見問題は「立場 → 理由2つ → 譲歩 → 結論」の4段構成を意識。",
        "準1級では語彙の正確さも評価されます。無理に難しい語を使わず、確実な語で正確に。",
      ],
    }),

    "1": I("1", {
      hasReading: false,
      intro: "1級の2次試験は「5つの社会問題から1つ選んでスピーチ → Q&A」。知識と論理構成の両方が問われます。",
      passage: null,
      qa: [
        { q: "What is the biggest challenge facing your generation?", model: "I believe it is balancing technological progress with human well-being. While innovation offers tremendous opportunities, it also creates new forms of inequality and distraction that require careful regulation.", hint: "抽象的でも、理由と具体例を1つずつ添えると説得力が出ます。" },
        { q: "How can governments encourage people to live more sustainable lives?", model: "Governments can combine incentives with infrastructure. For instance, subsidizing public transport and renewable energy makes sustainable choices practical, rather than merely asking citizens to make sacrifices.", hint: "「形容詞 + 具体策」の組み合わせが有効です。" },
        { q: "Do you think artificial intelligence will create more jobs than it destroys?", model: "In the short term, AI may displace routine jobs. In the long term, however, it could create demand for roles that require judgment, creativity, and interpersonal skills. The outcome will depend largely on how seriously we invest in retraining.", hint: "短期的・長期的視点を分けて答えると1級らしい深みが出ます。" },
      ],
      opinion: null,
      speechTopics: [
        { topic: "Should social media platforms be held responsible for the content their users post?", points: ["表現の自由 / 監視のリスク", "偽情報・ヘイトスピーチの拡散"] },
        { topic: "Is universal basic income a realistic solution to job loss caused by automation?", points: ["貧困の緩和・行政コスト", "労働意欲への影響・財源"] },
        { topic: "Should governments invest more in space exploration?", points: ["科学技術への波及効果", "地上の課題への資源配分"] },
        { topic: "Can economic growth and environmental protection be compatible?", points: ["グリーン技術・雇用", "資源の有限性・途上国の事情"] },
        { topic: "Should the voting age be lowered to sixteen?", points: ["政治参加の促進・若者の当事者意識", "判断力・制度設計の難しさ"] },
      ],
      tips: [
        "スピーチは2分。構成は「結論 → 理由2つ（各具体例つき）→ 反論への配慮 → 結論の再提示」。",
        "1級では「なぜそう言えるのか」を一段深く問われます。統計でなくても、具体的な事例や比較で支えましょう。",
        "Q&Aでは質問の意図を確認する余裕を。「That is an important point. I would argue that ...」でつなぐと自然です。",
      ],
    }),
  };

export const EQ_EXAM_INFO: Record<GradeId, ExamInfo> = {
    "5": { first: "筆記25分 / リスニング20分", second: "スピーキングテスト（約3分）", pass: "正答率約60%", writing: "なし" },
    "4": { first: "筆記35分 / リスニング30分", second: "スピーキングテスト（約4分）", pass: "正答率約60%", writing: "なし" },
    "3": { first: "筆記50分 / リスニング25分", second: "面接（音読 + Q&A）", pass: "正答率約60%", writing: "英作文あり" },
    "pre2": { first: "筆記75分 / リスニング25分", second: "面接（音読 + Q&A + 意見）", pass: "正答率約65%", writing: "英作文あり" },
    "2": { first: "筆記85分 / リスニング30分", second: "面接（音読 + Q&A + 意見）", pass: "正答率約65%", writing: "英作文あり" },
    "pre1": { first: "筆記90分 / リスニング30分", second: "面接（音読 + Q&A + 意見）", pass: "正答率約70%", writing: "英作文あり" },
    "1": { first: "筆記100分 / リスニング35分", second: "面接（スピーチ + Q&A）", pass: "正答率約75%", writing: "英作文あり" },
  };
