# M3 · pl（Polski）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | pl（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校；文档 04 T11 把 pl 列为优先补审的语言） |
| 交付 | `src/locales/pl.json`（新建）；`src/data/glossary/pl.json`（新建，§7.2.5 格式）；`docs/redesign-2026/ops/m3/pl-lint.json`（claims-lint / keyword-map 的 pl 词表提案，未合入数据文件）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（pl 行，表 A / B / C）、§3.1–§3.9（pl 草案）；文档 04 §5.1、§5.5、§5.7（pl 的 uiNote、linkText 种子、页脚、T1–T11）；裁定 R36、R39–R43、R46、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照，es / fr / ko / zh-Hant 的 QA 记录作流程参照 |
| App 叫法来源 | `/Users/ike/Dev/WordByWord/WordByWordPrototype/Localizable.xcstrings` 的 pl 值（逐键抽取）；价格表行名按 App 自己的额度对比页（`FeatureQuotaManager.swift` 的 `featureDisplayName`）核对 |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-pl/` 中写作、构建、渲染检查；文案由生成脚本输出（波兰语排版：单字母词后、"–"和"·"前用不换行空格 U+00A0）；OG 图只在副本里生成，**没有**复制进真实仓库；最终验证在真实仓库最新 HEAD 的新副本 `scratchpad/wbw-m3-pl-final/` 上重跑 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys pl`：0 缺、0 多；与其他 locale 一样不提供 `about.*`、`chromeExtension.*`、`legal.*`）。在真实仓库最新 HEAD（0267123）的新副本里加入 pl 并生成 `home-pl` OG 图后：`node build.mjs` 与 `--pseudo` 均 **0 error**，`node --test scripts/tests/*.test.mjs` 58/58，`scripts/check.mjs` 0 error / 0 warning。
2. pl 自己的 warning：L-8 两个 kicker 超长（`features[swipe].kicker` 26 > 24、`features[lookup].kicker` 32 > 24，都是 App 原名，按 wave-2 规则保留）；L-4 两个值与 en 相同（`common.menu` = "Menu"，波兰语就是这个词；`meta.appStoreSubtitle`，见 §6 第 3 条）。真实仓库的数据文件还没有 pl 词表，所以另有两条汇总 W：L-14"pl 未覆盖 25 条规则"、L-9"pl 没有 G1 how-to 模式"。我起草了 pl 词表 `docs/redesign-2026/ops/m3/pl-lint.json`（附录 A），只在副本里合入自测：pl 文案 0 命中，26 条规则和 3 组关键词模式全部命中反例；合入后上面两条 W 消失。
3. title、H1 用文档 03 §3.9 的 pl 草案：title 逐字照用（n53）；H1 改成"Przesuń akapit [[strony WWW]] w prawo – tłumaczenie pojawi się tuż pod nim."（n71），让荧光笔落在 K1 核心名词"strony WWW"上，并与 title 用同一个词。description 把草案的"Stuknij dwa razy słowo, by poznać sens"改成 App 手势"Dotknij dwukrotnie słowa – AI je wyjaśni"（文档 08 §7.3 已点名要改；第二模型认为"sens"太虚），并把结尾的"na iPhonie i iPadzie"换成"na iPhone’a i iPada"以压回 160 字符。
4. 手势：句中统一写"przesuń (akapit) w prawo"和"dotknij dwukrotnie (słowa)"，与 App 的提示文案 `tip_swipe_to_translate`、`tip_double_tap_context_meaning` 一致；kicker 和价格表用 App 的功能名"Przesuń, aby przetłumaczyć""Dotknij dwukrotnie, aby wyszukać"。全文不用"stuknij""kliknij"。
5. 复数：`Intl.PluralRules('pl')` 的类别是 one / few / many / other。所有"数字占位符 + 可数名词"（8 个键、14 个复数对象）都写了四个类别；按格分别处理（"na 21 języków"宾格、"w 20 językach"位置格、"z 21 języków"属格、"daje … 1 ekstrakcję / 1 analizę"宾格单数）。当前数值（5、10、12、20、21、30、50、100…）全部落在 many，渲染为"21 języków""20 językach""50 tłumaczeń""20 sprawdzeń słów""30 ekstrakcji fragmentów""20 analiz Action Flow""5 wyjaśnień składni AI"。
6. SurfEnglish：pl 的 `seMode` = en-site（`perLocale.pl.uiNote`）。卡片 note 由 `uiNote` 替换，写"界面是英语和另外 11 种语言、没有波兰语；可译成波兰语"；`linkText` 用文档 04 §5.7 的 pl 种子 +"(strona po angielsku)"，链 SE 英文站；FAQ `english-learner` 在链接前加了 §7.8 要求的界面说明句；页脚用文档 04 §5.5 的"Od tego samego twórcy"和"SurfEnglish: Bilingual News (EN)"。
7. OG（只在副本）：`node scripts/og.mjs --only home-pl` 通过，标题 64 px × 3 行、副标题 30 px × 2 行、155.6 KB（与 en 同版式）。原写法"Oryginał zostaje na miejscu."只能排到 50 px，所以缩成"Oryginał zostaje."（§4 第 5 条）。
8. 渲染（HEAD 新副本 + `scripts/serve.mjs` 端口 4603 + 本机 headless Chrome，屏蔽 GA 请求）：1280 / 390 / 375 / 320 px 都没有横向溢出；SE 卡片 393 / 450 / 450 / 558 px（上限 420 / 480 / 480 / 560）；390 px 整页 13,452 px，超过 13,000 的软目标（同一 HEAD 上 en 12,885、es 13,111、fr 13,612、de 13,704，§7）；样张红色译文条顶端 735 px（390×844）。
9. 需要负责人处理的事见 §6，主要是：OG 图入库（否则 D-23）、是否合入 pl lint 词表、`meta.appStoreName` / `appStoreSubtitle` 的取值、两个 kicker 的 L-8 W、价格表在 320 px 被裁切（模板问题，所有 locale 都有）、一批 App 波兰语字符串问题（报给 App 侧）。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | „WordByWord: dwujęzyczny tłumacz stron WWW na iPhone’a” | 品牌位 WordByWord（PL 店面名是 "WordByWord Translate"，但文档 08 §7.3 / 文档 03 §1.5 规定 pl 品牌位用 "WordByWord"）；K1 主词「dwujęzyczny tłumacz stron WWW na iPhone’a」**逐字完整**（文档 03 §2.3 表 A）；`seo.titleMust` = iPhone / stron WWW / tłumacz 全部命中；`primaryTokens.home.pl`（iPhone、tłumacz）命中 | n53（上限 60） |
| `meta.description` | „Do nauki języków: w WordByWord przesuń akapit w prawo, a tłumaczenie pojawi się pod nim. Dotknij dwukrotnie słowa – AI je wyjaśni. Za darmo na iPhone’a i iPada.” | 受众词「nauka języków」（表 C，R39；不含"angielski"，不触发 SE 词）；K1 动作 + 结果（przesuń akapit w prawo → tłumaczenie pojawi się pod nim）在前一半；"w WordByWord"满足文档 03 §3.2；K2 动作「dotknij dwukrotnie słowa」+ AI 解释；平台 + 免费收尾（SEO-11） | n160（区间 120–160） |
| `hero.title`（H1） | „Przesuń akapit [[strony WWW]] w prawo – tłumaczenie pojawi się tuż pod nim.” | K1 核心名词「strony WWW」（荧光笔，2 个词，R65）；"段落"一级的动作 + 结果，写了方向（R46、PRO-19）；不含品牌（R27）；没有 how-to 句式 | n71（上限 75） |
| `hero.eyebrow` | „WordByWord · Dwujęzyczny czytnik stron do nauki języków” | 品牌 + 品类（bilingual web reader）+ 受众 | 55 wu（上限 60） |
| `hero.lede` = `ledeShort` | „WordByWord to asystent czytania na iPhone’a i iPada dla osób uczących się języków.” | R39 定义句，以"WordByWord to"开头；"asystent"只用在定义句、FAQ `what-is` 和页脚 tagline（D13） | n82（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | „Czytaj strony WWW w dwóch językach. [[Oryginał zostaje.]]” | K1 场景（双语读网页）+ 原文保留；荧光笔 1 处；没用 G1 的"zachowaj oryginał" | 64 px × 3 行 |
| 功能区 H2 | „Przesuń, by przetłumaczyć, dotknij dwukrotnie, by sprawdzić słowo – na stronach, które czytasz” | K1 / K2 的手势 + 结果；"na stronach, które czytasz"（PRO-16，不写"任何网站"） | n95 |
| 功能 H3 | K1「Przesuń, aby przetłumaczyć: tłumaczenie pojawia się tuż pod oryginałem」；K2「Dotknij dwukrotnie słowa, a AI poda jego znaczenie w kontekście」；K9「Tłumaczenie postów z X (Twittera) we wbudowanej przeglądarce」；K5「Ekstrakcja Fragmentów i Action Flow dla zdań po angielsku」（R83 带"po angielsku"）；K3「Czytanie na głos: głos AI albo szybkie głosy iOS na urządzeniu」；K4「Analiza budowy długich zdań z pomocą AI」；K7「Tłumaczenie w chmurze lub na urządzeniu」；K6「Historia tłumaczeń i sprawdzanych słów」 | K7 与表 B 主词逐字一致；K6 把表 B 的"sprawdzonych"（完成体，营销语里易读成"经过验证的"）改为"sprawdzanych"（§4 第 3 条）；K2「znaczenie … w kontekście」+ AI、K4「analiza budowy … zdań z … AI」、K9「tłumaczenie postów z X (Twittera)」、K3「czytanie na głos … głos AI」为主词的语序 / 词形变体 | 全部 ≤ 70 wu |
| 语言段 H2 | „Tłumaczenie na 21 języków – nie tylko z angielskiego”（复数对象） | K8 主词「tłumaczenie na 21 języków」逐字 | 52 wu |
| 价格段 H2 | „Za darmo na co dzień – przejdź na Plus, gdy czytasz więcej” | K10「za darmo」+ Plus | 59 wu |
| 最终 CTA H2 | „Zacznij czytać strony w dwóch językach na iPhonie” | 动作句，不是 G1 标题，不暗示整页（R46） | 49 wu |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有的 "nauka angielskiego"，以及附录 A 建议新增的"ucz… się angielskiego""wiadomości po angielsku""chunk""Ekstrakcja Fragmentów"）；title / H1 / description / `cta.title` 里没有 how-to 句式（附录 A 的 G1 模式"jak przetłumaczyć / jak czytać""zachować oryginał"0 命中）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys pl` 0 缺 0 多；`notfound.*` 照 ja / zh-Hans 提供）；HEAD 新副本 build / `--pseudo` 0 error，`check.mjs` 0 error / 0 warning，测试 58/58。真实仓库在生成 `home-pl` OG 图之前会报 D-23（§6 第 1 条） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条；uiNote 与 FAQ 里的"11"是文档 08 §7.8 规定由译者写死的 {se.uiLanguages} − 1，波兰语"11 innych języków"用复数属格，语法已核对）。复数对象见 §0 第 5 条，四个类别全写，代入当前值核对过渲染。`pricing.table.perDay` 写"{n}/dzień"，数字后没有被计数的名词，不需要复数对象，也不触发 L-12（数字后面紧跟的是"/"） |
| Q3 | ✓ | title 以品牌位开头，三个 `titleMust` 词元齐全（文档 08 §7.3 写的是"iPhone、strony"，但 `hasToken` 按整词匹配，title 里是属格复数"stron"，所以用 `["iPhone","stron WWW","tłumacz"]`，与 es / fr / de 的处理相同）；K1 是产品 / 品类意图；没有禁用主词和 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[strony WWW]]`（2 个词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以"WordByWord to …"开头，写明"dla osób uczących się języków" |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定问答里；Safari 扩展 / "其他 App"只在 FAQ `safari`；Android 只在 FAQ `android`；桌面版只在 FAQ `devices`（S0 不写扩展名称）；没写离线、无限 AI 发音（iOS 语音写"nie mają dziennego limitu"）、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量（"różne style"）、口语练习、ChatGPT、"zespół WordByWord"；CJK 原文不能双击查词、Chunks / Action Flow 仅英语都写在同一屏；没有 jargon "wyrównanie"（旧站用过，C-16）和"zaznaczenie"（旧站把手势写成选中文字，C-09）。附录 A 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required` 22 项、`contains` 6 项，L-13 0 违规）：Przesuń, aby przetłumaczyć、Dotknij dwukrotnie, aby wyszukać (Znaczenie AI)、Więcej definicji、Ekstrakcja Fragmentów、Przebieg działań w zdaniu、Wymowa AI (Słowo / Zdanie)、Głos iOS (Lokalne Czytanie)、Analiza struktury składni AI；句中按 §7.3 写"przesuń … w prawo""dotknij dwukrotnie"；X7 一类的鼠标说法（旧站的"kliknij dwukrotnie / podwójne kliknięcie"）没有出现；按钮名照 App 原文引用：„Uaktualnij Teraz”、„Przywróć Zakup”、„Pobierz wyjaśnienie składni AI”、„Czytanie AI”、„Lokalne Czytanie”、„Automatycznie”、„Akapit”、„Zdanie po Zdaniu”；Action Flow 保留 App Store 名，正文括注 App 叫法„Przebieg działań”（D3） |
| Q7 | ✓ | 5 处功能截图 alt、4 条画廊图注 + alt、`common.screenshotLabel` / `screenshotExcerptLabel`（可见图注）、OG alt、SE 截图 alt 与图注都写了"(interfejs po angielsku)"，内容逐张对照 `assets/img/shot/en/*`（西语 Wikipedia 页 + 英文译文、"convirtiéndose"卡片、朗读播放器、句法解析、设置页 Auto / Quote Style / Local Read、"matrimonio"释义页、Spanish → English (US)、语言列表）；朗读截图的 alt 按节选画面写成"播放器 + 西语句子 + 底部工具栏"，比 en 的"译文段落 + 底部播放器"更贴合实际画面；`features[x].alt` 描述社交帖样张并注明"to nie zrzut ekranu"；`demo.lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | en-site：uiNote 不含 `{se.uiLanguages}`、不写"12 języków"，含"11"（L-11 通过）；linkText = SE 核心词短语 + 品牌 +"(strona po angielsku)"（n74，en-site 上限 80），链 SE 英文站（模板加 `hreflang="en"`）；FAQ 加了界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句"Uczysz się angielskiego?"；没有"może lepiej pasować / zamiast / nowy / szybciej / uaktualnij / następca"；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音；`points[0]` 写"na poziomach A1–C1"（PRO-10，不写"od A1"） |
| Q9 | ✓（2 条 W） | 代入占位符后实测，全部在 §7.6 / L-8 限内，例外只有两个 kicker（App 原名）。title 53、description 160、H1 71、eyebrow 55、lede 82、how 172、platformNote 132、规格清单 76 / 78 / 80 / 75、`cta.recap` 88、`pricing.summary` 99（上限 100）、SE 卡片 title 54、body 25 词、要点 40 / 33 / 41、linkText 74、所有 alt ≤ 125、FAQ 答案最长 584（`english-learner`，上限 600） |
| Q10 | ✓ | pl 是拉丁文字，不涉及 RTL / CJK；没有 `{wbr}`（R61）；排版用不换行空格（单字母词 a / i / o / u / w / z 之后、"–"和"·"之前、数字与单位之间），这是波兰语排版惯例，不是标记 |
| Q12 | ✓（副本） | 1280 / 390 / 375 / 320 px 无横向溢出、无字体回落（ą ć ę ł ń ó ś ź ż 在系统字体里都有）；价格表在 390 / 375 px 完整显示，320 px 被裁 30 px（模板问题，en 也裁 19 px，§6 第 6 条）；详见 §7 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）只写"同一开发者正在准备一个 Chrome 扩展"，不写名称；`aExtLive` 写了名称并注明只从扩展页面的链接安装；首页没出现 WordByWord.io（`footer.notAffiliated` 不在首页渲染） |

## 3. 回译对照（pl → English，对照 en.json）

| 键 | pl | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord: dwujęzyczny tłumacz stron WWW na iPhone’a | WordByWord: bilingual translator of web pages for iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Do nauki języków: w WordByWord przesuń akapit w prawo, a tłumaczenie pojawi się pod nim. Dotknij dwukrotnie słowa – AI je wyjaśni. Za darmo na iPhone’a i iPada. | For learning languages: in WordByWord, swipe a paragraph to the right and the translation appears below it. Double-tap a word – the AI explains it. Free for iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Czytaj strony WWW w dwóch językach. [[Oryginał zostaje.]] | Read web pages in two languages. The original stays. | Read any web page bilingually. Keep the original. |
| meta.ogSubline | Przesuń akapit w prawo · dotknij dwukrotnie słowa, by poznać jego znaczenie w kontekście | Swipe a paragraph to the right · double-tap a word to learn its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | Przesuń akapit [[strony WWW]] w prawo – tłumaczenie pojawi się tuż pod nim. | Swipe a paragraph of a web page to the right – the translation appears right below it. | Swipe a paragraph on any web page. Its translation appears right below. |
| hero.lede | WordByWord to asystent czytania na iPhone’a i iPada dla osób uczących się języków. | WordByWord is a reading assistant for iPhone and iPad for people learning languages. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Otwórz stronę we wbudowanej przeglądarce aplikacji i przesuń akapit w prawo: tłumaczenie pojawi się pod nim. Dotknij dwukrotnie słowa, a AI wyjaśni, co znaczy w tym zdaniu. | Open a page in the app’s built-in browser and swipe a paragraph to the right: the translation appears below it. Double-tap a word and the AI explains what it means in this sentence. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Przesuń, by przetłumaczyć, dotknij dwukrotnie, by sprawdzić słowo – na stronach, które czytasz | Swipe to translate, double-tap to check a word – on the pages you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Przesuń, aby przetłumaczyć: tłumaczenie pojawia się tuż pod oryginałem | Swipe to Translate: the translation appears right below the original | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Dotknij dwukrotnie słowa, a AI poda jego znaczenie w kontekście | Double-tap a word and the AI gives its meaning in context | Double-tap a word for its AI meaning in context |
| features[x].title | Tłumaczenie postów z X (Twittera) we wbudowanej przeglądarce | Translation of X (Twitter) posts in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Ekstrakcja Fragmentów i Action Flow dla zdań po angielsku | Chunk Extraction and Action Flow for sentences in English | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Czytanie na głos: głos AI albo szybkie głosy iOS na urządzeniu | Reading aloud: an AI voice or fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Analiza budowy długich zdań z pomocą AI | Analysis of the structure of long sentences with the help of AI | AI sentence structure analysis for long sentences |
| features[engines].title | Tłumaczenie w chmurze lub na urządzeniu | Translation in the cloud or on the device | Cloud or on-device translation |
| features[display].title | Układ i styl tłumaczeń | Layout and style of translations | Translation layout and style |
| features[history].title | Historia tłumaczeń i sprawdzanych słów | History of translations and of the words you look up | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac i Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | Czym jest WordByWord? | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | Czy WordByWord przetłumaczy całą stronę naraz? | Will WordByWord translate the whole page at once? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Czy działa w Safari albo w innych aplikacjach? | Does it work in Safari or in other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | Czy WordByWord tłumaczy słowo po słowie? | Does WordByWord translate word by word? | Is WordByWord a word-by-word translator? |
| faq[x].q | Czy w WordByWord mogę czytać posty z X (Twittera)? | Can I read posts from X (Twitter) in WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | Jakie języki obsługuje WordByWord? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | Czy aplikacja WordByWord jest darmowa? Jakie są dzienne limity? | Is the WordByWord app free? What are the daily limits? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | Jakiego silnika tłumaczeń używa WordByWord? | Which translation engine does WordByWord use? | Which translation engine does it use? |
| faq[account].q | Czy do korzystania z WordByWord potrzebne jest konto? | Is an account needed to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Jak odzyskać WordByWord Plus na nowym iPhonie lub iPadzie? | How do I get WordByWord Plus back on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | Czy jest wersja na Androida? | Is there a version for Android? | Is there an Android version? |
| faq[english-learner].q | Uczę się angielskiego. Czy warto wypróbować też SurfEnglish? | I’m learning English. Is it worth trying SurfEnglish too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | Czy WordByWord działa na iPadzie, Macu lub w przeglądarce na komputerze? | Does WordByWord work on iPad, Mac or in a browser on a computer? | Does WordByWord work on iPad, Mac or a desktop browser? |
| faq[english-learner].a（en-site 补句） | Interfejs SurfEnglish nie jest dostępny po polsku – jest po angielsku i w 11 innych językach – ale aplikacja tłumaczy na polski. | SurfEnglish’s interface isn’t available in Polish – it’s in English and 11 other languages – but the app translates into Polish. | 文档 08 §7.8 模板：SurfEnglish’s interface isn’t available in {language} — it’s in English and {n} other languages — but it can translate into {language}. |
| pricing.summary | Wszystkie funkcje są za darmo w ramach tych limitów; Plus podnosi je za 3,99 USD miesięcznie (USA). | All features are free within these limits; Plus raises them for US$3.99 a month (US). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | Od twórcy WordByWord | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: wiadomości po angielsku na twoim poziomie | SurfEnglish: news in English at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | Uczysz się angielskiego? Czytaj dalej dowolne strony w WordByWord i wypróbuj też SurfEnglish: codzienne wiadomości według poziomu i gry powtórkowe – z tymi samymi gestami. | Learning English? Keep reading any pages in WordByWord and try SurfEnglish too: daily news by level and review games – with the same gestures. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Angielskie wiadomości na poziomach A1–C1 ／ Gry powtórkowe z tego, co czytasz ／ Angielskie artykuły z Safari do aplikacji | English news at levels A1–C1 / Review games from what you read / English articles from Safari to the app | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.uiNote（替换 note） | Za darmo · Interfejs: angielski i 11 innych języków, bez polskiego · Tłumaczy na polski | Free · Interface: English and 11 other languages, no Polish · Translates into Polish | （en 的 note：Free to start · iPhone and iPad · App in 12 languages · Translations into 21；文档 04 §5.7 pl uiNote 草案：„Za darmo na start · Interfejs aplikacji nie jest dostępny po polsku (angielski i 11 innych języków) · Tłumaczenia na polski są dostępne”） |
| sibling.card.linkText | Wiadomości po angielsku z tłumaczeniem – SurfEnglish (strona po angielsku) | News in English with translation – SurfEnglish (site in English) | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | Pobierz SurfEnglish z App Store | Download SurfEnglish from the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish, ekran Games (interfejs po angielsku): Sentence Builder i Word Raid z zapisanymi zdaniami i słowami | SurfEnglish, Games screen (English interface): Sentence Builder and Word Raid with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | Zrzut ekranu SurfEnglish (interfejs po angielsku) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading / linkText | Od tego samego twórcy ／ SurfEnglish: Bilingual News (EN) | From the same developer / （店面名，不翻译） | More from the maker / SurfEnglish: Bilingual News |
| cta.title | Zacznij czytać strony w dwóch językach na iPhonie | Start reading web pages in two languages on your iPhone | Start reading websites bilingually on iPhone |
| cta.recap | Tłumaczenie przesunięciem · Znaczenie słowa w kontekście · Czytanie na głos · 21 języków | Swipe translation · Word meaning in context · Reading aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（表中 pl 为可读形式：实际 JSON 里带 U+00A0，复数对象已代入当前值。）

FAQ 答案（不在回译清单里）也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音没有每日上限、Plus 为月订且美区价格 + 以 App Store 为准；`restore` 引用 App 按钮 „Uaktualnij Teraz” → „Przywróć Zakup”（T-E）；`engines` 的首次下载句照 App 的 `swipe_translation_engine_mode_local_description`；`devices` 的 S0 答案只写"同一开发者正在准备一个 Chrome 扩展"，`aExtLive` 才写 "WordByWord Translate dla Chrome" 和"只从扩展页面的链接安装"。

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都有意为之：

1. `meta.title` 没有"App"：波兰语产品词用 tłumacz（文档 03 §3.9 草案、`primaryTokens.home.pl`）。
2. `meta.description` 用"w WordByWord"代替"built-in browser"（文档 03 §3.2 允许）；受众写成"Do nauki języków:"（草案原样）；K2 句写"AI je wyjaśni"（AI 来解释），没有逐字写"its meaning"（160 字符上限）。
3. `hero.title` 的"any web page"写成"strony WWW"（不加"dowolnej"，否则超过 75 字符），并写了方向"w prawo"（与草案一致）。
4. `meta.ogHeadline` 的"Keep the original"写成"Oryginał zostaje"（原文保留），为了 64 px 字号，也避开 G1 的"zachować oryginał"。
5. `features[x].title` 用 K9 主词"tłumaczenie postów z X (Twittera)"，正文仍写"译文出现在帖子下方"（与 es 的处理相同）。
6. SE 卡片：title 没有"daily"（body 有"codzienne"）；body 把"the same swipe and double-tap"写成"z tymi samymi gestami"，并去掉第二个"po angielsku"（卡片高度，§7）；`points[0]` 去掉"Real"、`points[2]` 写成名词短语"Angielskie artykuły z Safari do aplikacji"（"Udostępniaj … z Safari"会被读成 WordByWord 的功能，且 ≤ 45 放不下动词 + 宾语 + "do aplikacji"）；`linkText` 用文档 04 §5.7 的 pl 种子（"z tłumaczeniem"），不是 en 的"at your level"。
7. `cta.recap` 第 2 项写结果"Znaczenie słowa w kontekście"（词义），不写手势"dotknij dwukrotnie"（90 字符上限）。
8. `hero.platformNote` 不写美区价格（D2，与 ja / zh-Hans / es / fr 相同）；价格表 `pricing.plus.price` 写"3,99 USD miesięcznie w USA"（不加括号，原因见 §7）。
9. 链接到英文页面的文字加了"(po angielsku)"：FAQ `what-is`（@about）、`devices`（@chrome，a 与 aExtLive）、`english-learner`（@se-site，en-site 模式）。

## 4. 没把握的措辞（14 处，附回译与替代写法）

| # | 键 | pl | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | features[lookup].kicker | Dotknij dwukrotnie, aby wyszukać | Double-tap to search | „Dotknij dwukrotnie”（18）／„Znaczenie w kontekście”（22） | App 原名（T-A，去掉"(Znaczenie AI)"），32 > 24 wu，390 / 375 px 折 2 行；"wyszukać"（搜索）用来说"查词义"偏弱，句中我都写"sprawdzić"。改了可消 W，但与 App 不一致（§6 第 4 条） |
| 2 | meta.description | Do nauki języków: … Dotknij dwukrotnie słowa – AI je wyjaśni. … | For learning languages: … Double-tap a word – the AI explains it. … | „Ucz się języków z WordByWord: przesuń akapit w prawo, a pod nim pojawi się tłumaczenie. Dotknij dwukrotnie słowa – poznasz sens. Za darmo na iPhone’a i iPada.”（n158） | 草案的"Do nauki języków:"像标签；K2 句没有"znaczenie"一词（放不下，正好 160） |
| 3 | features[history].title / text、seo K6 | Historia tłumaczeń i sprawdzanych słów | History of translations and of the words you look up | „… sprawdzonych słów”（文档 03 表 B 原文）／„… wyszukanych słów”（App 动词） | 第二模型指出"sprawdzone słowa"在营销语里容易读成"经过验证的词"，改用未完成体"sprawdzanych"；"wyszukan-"会联想到浏览器搜索记录（PRO-14） |
| 4 | hero.title | Przesuń akapit [[strony WWW]] w prawo – tłumaczenie pojawi się tuż pod nim. | Swipe a paragraph of a web page to the right – the translation appears right below it. | „Przesuń akapit [[strony]] w prawo – tłumaczenie pojawi się tuż pod oryginałem.”（草案，n74） | "strona WWW"略显正式，但它是 K1 主词的一部分，也与 title 一致；荧光笔在 ≥ 560 px 不换行，桌面 H1 为 5 行 |
| 5 | meta.ogHeadline | Czytaj strony WWW w dwóch językach. [[Oryginał zostaje.]] | Read web pages in two languages. The original stays. | „… [[Oryginał zostaje na miejscu.]]”（50 px）／„… [[Zachowaj oryginał.]]”（G1 用语） | "Oryginał zostaje."比较简省；完整说法只能排到 50 px |
| 6 | hero.eyebrow | Dwujęzyczny czytnik stron do nauki języków | Bilingual page reader for learning languages | „Dwujęzyczne czytanie stron do nauki języków” | "czytnik"也常指电子书阅读器之类的设备 |
| 7 | features[x].title | Tłumaczenie postów z X (Twittera) we wbudowanej przeglądarce | Translation of X (Twitter) posts in the built-in browser | „Posty z X (Twittera) w dwóch językach, we wbudowanej przeglądarce”（n65） | 为放 K9 主词用了名词短语；en 强调"双语读" |
| 8 | featuresIntro.title | Przesuń, by przetłumaczyć, dotknij dwukrotnie, by sprawdzić słowo – na stronach, które czytasz | Swipe to translate, double-tap to check a word – on the pages you read | „Przesuń, by przetłumaczyć; dotknij dwukrotnie, by sprawdzić słowo – …”（分号） | 第二模型认为三个逗号连在一起略赶；按 en 的结构保留逗号（语法正确） |
| 9 | pricing.table.perDay | {n}/dzień | {n}/day | „{n, plural, … # razy dziennie}”（App 额度页的写法） | App 写"50 razy dziennie"，在网页表格里太宽（§7）；"50/dzień"是常见简写 |
| 10 | cta.recap | Tłumaczenie przesunięciem · Znaczenie słowa w kontekście · Czytanie na głos · 21 języków | Swipe translation · Word meaning in context · Reading aloud · 21 languages | „Przesuń i przetłumacz · Dotknij dwukrotnie i sprawdź · Czytanie na głos · 21 języków”（n84） | 现写法是名词并列，更像要点；替代写法与 en 的动词结构一致 |
| 11 | features[engines].text | Chmura (Azure i Google) lub iOS; limit w chmurze wyczerpany? Użyj lokalnego. | Cloud (Azure and Google) or iOS; cloud limit used up? Use the local one. | „W chmurze (Azure, Google) lub w iOS; po wyczerpaniu limitu – lokalnie.”（n70） | 80 字符上限下的电报体；"lokalnego"省略了"silnika" |
| 12 | sibling.card.linkText | Wiadomości po angielsku z tłumaczeniem – SurfEnglish (strona po angielsku) | News in English with translation – SurfEnglish (site in English) | „Wiadomości po angielsku na twoim poziomie – SurfEnglish (strona anglojęzyczna)”（n78） | 用了文档 04 §5.7 的种子（SE 核心词"with translation"）；en 的语义是"at your level"；两个"po angielsku"略重复 |
| 13 | features[x].sample.name | Konto demo | Demo account | „Przykładowe konto”（"Sample Account"直译，但样张头部会溢出 19–22 px） | 见 §7 |
| 14 | 全文 | twórca（指开发者）；nav "Rozszerzenie" | creator; "Extension" | „deweloper”；nav „Rozszerzenie Chrome”（19 > 16 wu，L-8 W） | "twórca"与文档 04 的页脚标题一致；nav 按文档 08 §7.6 允许的缩写（同 de "Erweiterung"），页脚和 FAQ 写全称"rozszerzenie do Chrome" |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法的来源**：`WordByWordPrototype/Localizable.xcstrings` 的 pl 值（与文档 08 表 T-A…T-E 的 pl 列逐条核对，一致）；价格表行名另外对照了 App 的额度对比页（`FeatureQuotaManager.swift` 的 `featureDisplayName`：功能名 + 引擎名，`limit_per_day%lld` = "%lld razy dziennie"）。用到的 App 字符串：
  - 功能名：`daily_sentence_translation_limit` Przesuń, aby przetłumaczyć；`word_meaning_lookup_title` Dotknij dwukrotnie, aby wyszukać (Znaczenie AI)；`more_definitions_title` Więcej definicji；`Chunk Extraction` Ekstrakcja Fragmentów；`sentence_skeleton_settings_navigation_title` / `_ui_analyze` Przebieg działań w zdaniu / Przebieg działań；`grammar_structure_analysis` Analiza struktury składni AI；`ai_pronunciation_word` / `_sentence` Wymowa AI (Słowo) / (Zdanie)；
  - 设置与按钮：`audio_playback_title_streaming` / `_local` Czytanie AI / Lokalne Czytanie；`swipe_translation_engine_mode_api_title` / `_local_title` Chmurowy silnik tłumaczeń / Silnik lokalny；`translation_mode_title_*` Automatycznie / Akapit / Zdanie po Zdaniu；`get_syntax_explanation_button` Pobierz wyjaśnienie składni AI；`upgrade_now_button` Uaktualnij Teraz；`restore_purchase_button` Przywróć Zakup；`bookmark_title` Zakładki；`tab_manager_view_switch_tabs` Przełącz Karty（正文据此写"karty i zakładki"）；
  - 提示：`tip_swipe_to_translate` „Przesuń w prawo po dowolnym tekście…”、`tip_double_tap_context_meaning` „Dotknij dwukrotnie dowolnego słowa…”（手势写法的依据）；`swipe_translation_engine_mode_local_description` „Przy pierwszym użyciu może być konieczne pobranie zasobów językowych.”（FAQ `engines` 照此措辞）。
- **kicker** 去掉"(Znaczenie AI)"后缀（与 en / ja / es / fr 相同）；价格表的两行右滑翻译写"· w chmurze / · lokalnie"（App 是"(Chmurowy silnik tłumaczeń)"/"(Silnik lokalny)"，原样放进 390 px 的表格会多两行），其余行名与 App 一致。
- **AI**：App 的 pl 文案一律写"AI"，波兰语网页里"AI"也是常用写法（文档 03 表 A 的 pl 关键词同样写"(AI)"），所以正文也写"AI"，不改成"SI"。
- **称谓**：ty（命令式）；物主代词小写（"twoim", "ciebie"），这是面向大众的网页写法，不是书信；避免第二人称过去时（-łeś / -łaś）和"sam / sama"这类带性别的形式。WordByWord 当主语时只用现在时或将来时（不需要定性别）；需要形容词时写"aplikacja WordByWord"（阴性）。
- **排版**：单字母词（a, i, o, u, w, z）之后、半角破折号"–"和分隔点"·"之前用不换行空格（波兰语排版惯例，避免"w"挂在行末、"–"落到行首）；`meta.title` / `meta.description`、alt、样张英文原文不处理；价格表行名允许在"·"前换行（窄屏首列）。引号用„ ”（与 App 的 pl 文案一致），撇号用 ’（iPhone’a）。
- **iPhone 的变格**：na iPhone’a（适用于 / 给 iPhone）、na iPhonie（在 iPhone 上）、iPada / iPadzie、Macu / Macach（Apple 官方写法"Mac z czipem Apple"）。品牌名 WordByWord、SurfEnglish、App Store、Action Flow、Premium / Enhanced（App 原文保留英文）不变格。
- **术语**：段落 = akapit（App 用词）；"look up a word"在句中写"sprawdzić słowo / znaczenie"，功能名照 App 写"wyszukać"；查过的词 = "sprawdzane słowa"（K6，不用易读成"经过验证"的"sprawdzone"，也不用会联想到搜索记录的"wyszukiwania"）；"swipe translation"写"tłumaczenie przesunięciem"（App 的历史页标题"Historia Tłumaczenia Przesunięciem"）；developer = twórca（与文档 04 §5.5 的页脚"Od tego samego twórcy"一致）；Chrome 扩展 = "rozszerzenie (do Chrome)"（Chrome 自己的波兰语叫法），页眉导航只写"Rozszerzenie"（≤ 16 wu）；Apple 芯片 = "czip Apple"（据我所知是 Apple 波兰官网 Mac 页的写法，待母语审校确认）；"English interface" = "interfejs po angielsku"；英文页链接标"(po angielsku)"。
- **X**：首次出现写"X (dawniej Twitter)"（波兰媒体的通行写法）；K9 关键词位置用属格"X (Twittera)"。


## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，OG 文件没有复制进真实仓库。pl.json 进库后，`node build.mjs` 会报 `D-23 home-pl: no OG image`，直到运行 `node scripts/og.mjs --only home-pl`（HEAD 新副本实测通过：64 px × 3 行、155.6 KB）。
2. **pl lint 词表**：`docs/redesign-2026/ops/m3/pl-lint.json`（附录 A）。不合入时，真实仓库构建对 pl 多两条汇总 W（L-14 未覆盖 25 条、L-9 无 G1 模式）。另建议顺手把现有 `selection-translate` 的 pl 模式改成 `zaznacz\p{L}*\s+tekst`。
3. **`meta.appStoreName` / `appStoreSubtitle`**（只用于 en 的 about 事实表，pl 页面不渲染）：研究 05 §2.1 的逐国 lookup 显示 PL 店面的 App 名是 **"WordByWord Translate"**（与 US 相同，说明 PL 店面用的是默认的 en-US 元数据），所以 `appStoreName` 写 "WordByWord Translate"，与文档 03 §1.5"其余 locale 用 WordByWord"的笼统写法不同；PL 店面的副标题没有记录，我按同一推断写了 US 副标题原文 "Swipe to translate AI explains"（因此有 1 条 L-4 W）。请确认 PL 店面实际值，或决定改用波兰语译文。title 品牌位仍按文档 08 §7.3 写 "WordByWord"。
4. **两个 kicker 超长（L-8 W）**："Przesuń, aby przetłumaczyć"（26）、"Dotknij dwukrotnie, aby wyszukać"（32，390 / 375 px 折成 2 行）。按 wave-2 规则保留 App 原名；若要消掉 W，可改成非 App 用语"Przesuń i przetłumacz"（21）/"Dotknij dwukrotnie"（18），同时改 glossary。
5. **`seo.titleMust`**：文档 08 §7.3 写"iPhone、strony"，title 里是属格复数"stron WWW"，`hasToken` 按整词匹配，所以用了 `["iPhone","stron WWW","tłumacz"]`（与 es / fr / de 的处理一致）。请确认。
6. **价格表在 320 px 被裁切（模板问题，所有 locale 都有）**：`.table-wrap { overflow: hidden }` 加上数值格 `white-space: nowrap`，表格最小宽度大于 286 px 的容器时，右边的 Plus 列被直接裁掉（实测 en 19 px、es 37 px、fr 116 px、pl 30 px；fr 在 390 px 也裁 46 px）。建议模板改成 `overflow-x: auto`（或 < 360 px 时允许数值换行）。我没有改 CSS。
7. **页面高度**：390 px 下 13,452 px，超过 13,000 的软目标约 450 px（同一 HEAD 上 fr 13,612、de 13,704 也超过）。主要来自价格表（波兰语行名长，首列 140 px 内折 2–4 行）和功能区（H2、L2 标题与正文多一行）。已经做过的压缩见 §7；再压只能删内容，没有做。
8. **App 侧的波兰语字符串问题**（§7.2.2 规则 ③，网站已按规则处理，建议报给 App）：
   - 标签普遍用英语式的词首大写：„Przywróć Zakup”、„Uaktualnij Teraz”、„Zdanie po Zdaniu”、„Lokalne Czytanie”、„Ekstrakcja Fragmentów”、„Historia Tłumaczeń”、„Język Źródłowy”、„Styl Cytowania”、„Przełącz i Spróbuj Ponownie”等。波兰语只大写首字母。网站引用按钮名时照 App 原文（规则 ①），所以页面上也带着这些大写。
   - "upgrade"有三种译法：`upgrade_to_plus_button` „Uaktualnij do Plus”、`usage_status_upgrade_hint` „Przejdź na Plus”，以及 `feature_trial_exhausted_message`、`free_tts_limit_message`、`more_definitions_trial_exhausted_message` 里的 „Zaktualizuj (do Plus)”——"zaktualizować"是"更新（软件）"，用在这里是错的。
   - "点按"有两个动词：`word_meaning_lookup_title`、`tip_double_tap_context_meaning` 用"dotknij"，`chunk_extraction_mode_description_manual`、`sentence_skeleton_mode_description_manual`、`swipe_translation_result_display_mode_description_manual` 用"stuknięcie"（iOS 系统本身用"stuknij"）。网站统一用 App 功能名里的"dotknij dwukrotnie"。
   - "右滑翻译"有两种说法："tłumaczenie przesunięciem"（`chunk_extraction_*`、历史页标题）与"tłumaczenie gestem"（`sentence_skeleton_*`）。
   - 只有阳性的第二人称过去时："Wykorzystałeś …"（5 条额度提示）、"Odblokowałeś …"；建议改成无人称"Wykorzystano …"。
   - iOS 语音有两个名字：额度对比页 `tts_option_local_synthesis` „Lokalnie Syntetyzowany Głos”，朗读设置 „Lokalne Czytanie”。网站价格表写"Głos iOS (Lokalne Czytanie)"。
   - `double_tap_not_supported_message` 把查词叫"Tłumaczenie przez podwójne dotknięcie"（翻译），功能名却是"wyszukać"。
   - `limit_per_day%lld` = "%lld razy dziennie" 没有复数变体（值为 1 时会出现"1 razy"；现有额度都 ≥ 5，暂不出错）。
   - `send_feedback_button` „Wyślij Informację Zwrotną” 与 `feedback_submit_button` „Wyślij opinię” 不一致；`source_language_changed_title` „Język Źródłowy Zmieniony” 是英语语序，宜写"Zmieniono język źródłowy"。
   - 第二模型另提三点：iOS 系统里恢复购买的通行叫法是"Przywróć zakupy"；"Analiza struktury składni AI"中"struktury składni"语义重复，且与按钮"Pobierz wyjaśnienie składni AI"是同一功能的两个名字（"Przebieg działań"与"Przebieg działań w zdaniu"同理）；单独的"Czytanie"（AI / Lokalne）可能被理解成用户自己阅读，"Czytanie na głos"更清楚。
9. **排版用不换行空格**：全文 300 处左右，属于波兰语排版惯例（单字母词不留行尾、破折号不起行）。如果负责人倾向不用，生成脚本里删掉 `typo()` 一步即可；它不影响任何校验（`\s` 能匹配 U+00A0，`hasToken` 只看 title）。
10. **母语审校**（R36，T3 上线后补；文档 04 T11 把 pl 列为优先）：请审校人重点看 §4 的各条，以及三个统一性选择：物主代词小写（twój / twoim）、"twórca"指开发者、"strony WWW"与"strony internetowe"的分工（title / H1 用 WWW，正文用 internetowe / strony）。

## 7. 渲染检查（HEAD 0267123 新副本 + pl，`node scripts/serve.mjs --dir …/dist --port 4603 --quiet`，本机 headless Chrome，屏蔽 GA 请求，深色系统主题；用完已停掉服务）

| 视口 | 横向溢出 | SE 卡片高度（上限） | 整页高度 | 其他 |
|---|---|---|---|---|
| 1280 × 900 | 无 | 393 px（420） | 10,414 px | H1 5 行（en 4 行：荧光笔短语"strony WWW"在 ≥ 560 px 不换行，独占一行） |
| 390 × 844 | 无 | 450 px（480） | 13,452 px（软目标 13,000；同一 HEAD 上 en 12,885 · es 13,111 · pt-BR 13,133 · it 13,028 · nl 12,991 · fr 13,612 · de 13,704） | 样张红色译文条顶端 735 px（R69：在 844 px 视口内）；H1 4 行；价格表 356 / 356 px，完整 |
| 375 × 812 | 无 | 450 px（480） | 13,790 px | 红条顶端 800 px（< 812）；H1 5 行；价格表 341 / 341 px，完整 |
| 320 × 700 | 无 | 558 px（560，R84） | 14,383 px | 价格表 316 px 放在 286 px 的容器里，右侧 30 px 被 `overflow: hidden` 裁掉（en 19 px、es 37 px、fr 116 px，模板问题，§6 第 6 条）；kicker 4 个里有 3 个折成 2 行 |

为满足上面的数字所做的调整（初稿 → 定稿）：
- 价格表：`perDay` "{n} razy dziennie"（与 App 的额度页一致）→ "{n}/dzień"：初稿每个数值格 118 px 宽且不换行，390 px 下 Plus 列被挤出表格；`pricing.plus.price` "{plus.priceUS} miesięcznie (USA)" → "{plus.priceUS} miesięcznie w USA"：模板在"("前把价格设为不换行（`priceLines`），"3,99 USD miesięcznie"一整段 142 px，去掉括号后可以在空格处换行；两行右滑翻译的行名缩短为"· w chmurze / · lokalnie"，并允许在"·"前换行。结果：390 / 375 px 表格完整，320 px 裁切从 57 px 降到 30 px。
- SE 卡片：body 删掉"po angielsku"和"przesunięciem i dwukrotnym dotknięciem"（改为"z tymi samymi gestami"），`uiNote` 缩短：375 px 下 490 → 450 px，320 px 下 600 → 558 px。
- X 样张：`sample.name` "Przykładowe konto" → "Konto demo"：原写法让头部（名字 + @runner.example · 3 godz.）比卡片宽 19–22 px，被裁掉"godz."。
- `hero.secondaryCta` 用"Jak to działa"（13 字符）：实测"Zobacz, jak to działa"在 375 px 会掉到徽章下一行（CTA 行高 48 → 100 px，与 es 遇到的情况相同）。
- 目视检查了 390 / 375 / 320 px 的 hero、样张查词卡、L1 / L2（含 ①②③ 页边注）、X 样张、语块示意、规格清单、价格表、SE 卡片、FAQ、页脚：没有溢出、没有断在词中、没有方框字。剩下的观感问题：`features[lookup].kicker` 在 390 / 375 px 折成 2 行（"DOTKNIJ DWUKROTNIE, / ABY WYSZUKAĆ"），H1 在桌面和 375 px 为 5 行。

## 8. 第二模型互检记录（T3 不强制，额外做的）

- 审校方：Claude Sonnet，单独运行，只读。输入是 pl.json、en.json 和本简报的固定规则（称谓、手势写法、App 原名原样引用、品牌词、复数对象、不换行空格、长度上限、禁用说法）。
- 审校方的总评：波兰语自然、准确，可以发布；没有发现语法错误；8 个含复数对象的键，每个分支的格都对；从句前的逗号和动词体正确；ty 语体一致，没有带性别的第二人称过去时；所有限长字段都在上限内。剩下的是几处直译、两处歧义和术语不统一。
- **采纳**（10 条）：
  1. `languages.lede` 的"WordByWord domyślnie zakłada angielski"紧跟在"选择你要译成的语言"之后，会被读成"目标语言默认英语" → "Język strony to domyślnie angielski; WordByWord wykrywa go i aktualizuje"；
  2. FAQ `devices`（a 与 aExtLive）的"dzięki App Store"（"多亏了 App Store"）→ "z App Store"；
  3. `pricing.summary` 的"W tych limitach"是直译，且"je"可能指"funkcje" → "Wszystkie funkcje są za darmo w ramach tych limitów; Plus podnosi je …"；
  4. `features[syntax].text` 里"przesunięciem"悬空，像"滑动打开" → "Otwórz w historii zdanie przetłumaczone przesunięciem …"；
  5. `nav.chromeExtension` 的"Wtyczka"与页脚、FAQ 以及 Chrome 自己的"rozszerzenie"不一致 → "Rozszerzenie"（审校建议的"Rozszerzenie Chrome"超过 16 wu，按文档 08 §7.6 允许的导航缩写处理）；
  6. "sprawdzone słowa"易读成"经过验证的词" → "sprawdzane słowa"（H3、规格清单、seo K6）；
  7. SE 卡片 `points[2]`"Udostępniaj artykuły po angielsku z Safari"像在说 WordByWord 的功能 → "Angielskie artykuły z Safari do aplikacji"（保留"英文"限定，R41）；
  8. `features[chunks].text`的"albo wcale"可能被读成"可能根本不工作" → "Uruchamiaj je automatycznie lub po dotknięciu – albo je wyłącz."；
  9. `meta.description`的"by poznać sens"太虚 → "– AI je wyjaśni"（同长，160）；
  10. FAQ `engines`"wyczerpiesz tłumaczenia"（用完翻译）→ "wyczerpiesz dzienny limit tłumaczeń"（用完额度）。
- **未采纳**（3 条，附理由）：
  1. `hero.platformNote` 补美区价格：文档 08 D2 规定非 en 页首屏不写美区价格；
  2. "z czipem Apple"改"z układem Apple"：据我所知 Apple 波兰官网的 Mac 产品页写"czip"（如"z czipem M3"），但无法联网核实，留给母语审校确认；
  3. `featuresIntro.title` 的逗号改分号：可选项，逗号在语法上正确，保留 en 的结构（列入 §4 第 8 条）。
- **备注**：审校方看不到截图，提醒核对 `features[speech].alt`；我对照过 `assets/img/shot/en/tts-ex-720.jpg`（朗读播放器"1 / 3"、暂停键、"Hide Text"，下方是西语句子，再下方是底部工具栏），alt 与画面一致。"11 innych języków"写死是文档 08 §7.8 的规定，SE 增加界面语言时要同步改（与 fr / de 等相同）。审校方对 App 字符串的意见并入 §6 第 8 条。

## 附录 A：建议的 pl lint 词表（`docs/redesign-2026/ops/m3/pl-lint.json`，未合入数据文件）

- 覆盖：`claims-lint.json` 中有按语言写法、且还没有 pl 键的全部 26 条规则（25 条"未覆盖" + `hype`）。跳过 `selection-translate`（已有 pl）和只有 `*` 的 `io-home`、`engine-claim`。`keyword-map.json`：`seOwned.pl` 追加 5 条（现有的 "nauka angielskiego" 保留）、`seOwnedLead.pl` 1 条、`reserved.G1.pl` 2 条。
- 写法：校验器用 `ui` / `iu` 标志匹配，JS 的 `\w`、`\b` 只认 ASCII，会漏掉 ą ć ę ł ń ó ś ź ż，所以词表一律用 `\p{L}*` 和 `(?<!\p{L})…(?!\p{L})`；空白写 `\s`，能匹配文案里的不换行空格。
- 自测（副本，合入后重建）：pl 文案 0 命中（豁免键按 claims-lint.json 原样）、L-9 / D-8 0 error，L-14"未覆盖"和 L-9"无 G1"两条 W 消失；en / ja / zh-Hans 等其他 locale 不受影响（pl 模式只作用于 pl，`seOwnedLead` 虽然作用于所有 locale 的 H2，但只匹配波兰语开头）；58/58 测试通过。
- 需要人工复核的地方：`hype` 的"jedyny / jedyna + 名词"、`speaking-practice` 的"mówienie"、`shortcuts-volume` 的"głośność"范围较宽，合入前请母语审校看一遍；`se-hype` 的"uaktualni…"只作用于 SE 区块（规则自带 `only`），不会拦 FAQ `restore` 里的 App 按钮名„Uaktualnij Teraz”。
- 顺带发现：现有 `selection-translate` 的 pl 模式 `zaznacz\w* tekst` 因为 `\w` 只认 ASCII，拦不住"zaznaczając tekst"一类带变音字母的词形，建议改为 `zaznacz\p{L}*\s+tekst`（本稿未用到这类词，不影响）。

反例（每条规则至少命中一句；`lint-test.mjs` 自测脚本在 scratchpad 的 `pl-gen/` 里）：

| 规则 | 反例（全部命中） |
|---|---|
| `whole-page` | „WordByWord przetłumaczy całą stronę jednym dotknięciem.”；„Tłumaczenie całych stron internetowych na iPhonie.”；„Czytaj całe witryny naraz w dwóch językach.”；„Strony w całości po polsku.” |
| `swipe-left` | „Przesuń akapit w lewo, aby zobaczyć tłumaczenie.”；„Wystarczy gest w lewo.” |
| `safari-extension` | „Rozszerzenie do Safari tłumaczy każdą stronę.”；„Tłumacz w każdej aplikacji na iPhonie.”；„Działa bez przełączania aplikacji.”；„Rozszerzenie udostępniania iOS.” |
| `offline` | „Tłumaczenie offline na iPhonie.”；„Działa bez internetu.”；„Czytaj bez połączenia z siecią.” |
| `unlimited-ai-voice` | „Nieograniczona wymowa AI w wersji Plus.”；„Czytanie AI bez limitu dla subskrybentów.”；„Nielimitowane głosy AI.” |
| `dark-mode-theme` | „Tryb ciemny i własne motywy.”；„Wybierz kolor motywu.”；„Ciemny motyw dla nocnych lektur.” |
| `shortcuts-volume` | „Skróty klawiszowe do tłumaczenia.”；„Regulacja głośności i tempa.” |
| `vocab-sync` | „Fiszki ze sprawdzonych słów.”；„Twoja lista słówek synchronizuje się z iCloud.”；„Powtórki w odstępach.” |
| `android` | „Wersja na Androida już wkrótce.”；„Pobierz z Google Play.” |
| `desktop-version` | „Wersja na komputer i aplikacja na Windows.”；„WordByWord dla PC.” |
| `x-app` | „Tłumacz posty w aplikacji X.”；„Jedyna aplikacja, która tłumaczy X.” |
| `plus-early-access` | „Plus daje wczesny dostęp do nowych funkcji.”；„Subskrybenci jako pierwsi dostają nowości.” |
| `privacy-claim` | „Nie zbieramy żadnych danych.”；„Aplikacja nie gromadzi informacji.”；„Bez śledzenia.”；„Żadne dane osobowe nie są zbierane.” |
| `initial-version` | „Wersja początkowa obsługuje ponad 20 języków.” |
| `language-pairs` | „Ponad 20 par językowych.” |
| `style-count` | „8 stylów tłumaczenia do wyboru.”；„Siedem różnych stylów.” |
| `auto-detect-target` | „Aplikacja automatycznie wykrywa język docelowy.”；„Język docelowy jest wykrywany sam.” |
| `history-by-date` | „Historia grupowana według daty.”；„Wpisy posortowane po dniach.” |
| `plus-only` | „Analiza składni tylko w wersji Plus.”；„Funkcja dostępna wyłącznie dla WordByWord Plus.”；„Tylko dla premium.” |
| `speaking-practice` | „Ćwiczenie wymowy z AI.”；„Popraw swoją wymowę i mówienie.”；„Rozwijaj mówienie.” |
| `jargon` | „Wyrównanie zdanie po zdaniu.”；„Inteligentny podział i wyrównaniem jeden do jednego.” |
| `replacement-tone` | „SurfEnglish może lepiej pasować do nauki angielskiego.”；„Zamiast WordByWord wybierz SurfEnglish.”；„Aplikacja siostrzana WordByWord.”；„SurfEnglish zastąpi WordByWord.”；„Poprzednia aplikacja tego twórcy.” |
| `se-on-device-voice` | „Głos AI na urządzeniu, działa offline.”；„Lokalny głos bez internetu.” |
| `se-hype` | „Nowość od twórcy WordByWord.”；„Nowa aplikacja: szybsza nauka.”；„Ucz się szybciej z SurfEnglish.”；„Lepsza niż inne aplikacje.”；„Uaktualnij do SurfEnglish.” |
| `hype` | „Rewolucyjny tłumacz stron.”；„Najlepsza aplikacja do nauki języków.”；„Numer jeden w App Store.”；„Jedyna taka aplikacja.”；„Ponad 10 000 użytkowników.”；„Miliony pobrań.”；„Zespół WordByWord zaprasza.”；„Pożegnaj kopiowanie tekstu.” |
| `ext-language-count` | „Tłumaczy na 20 języków.”；„Ponad 20 par językowych.” |
| keyword-map `seOwned` | „Nauka angielskiego z wiadomościami”；„Ucz się angielskiego na iPhonie”；„Angielskie wiadomości z tłumaczeniem”；„Wiadomości po angielsku na twoim poziomie”；„Chunki i zwroty”；„Ekstrakcja fragmentów dla każdego” |
| keyword-map `seOwnedLead` | „Nauka języka angielskiego? Wypróbuj SurfEnglish”；„Uczysz się angielskiego? Oto SurfEnglish” |
| keyword-map `reservedG1` | „Jak przetłumaczyć stronę na iPhonie”；„Tłumaczenie z zachowaniem oryginału”；„Jak czytać strony WWW w dwóch językach” |

放行用例（不得误拦的通用学习词，文档 03 §1.4）："Do nauki języków"、"dla osób uczących się języków"、"nauka języków przez czytanie stron" —— `seOwned.pl` 0 命中。

## 附录 B：验证记录

| 命令 | 结果 |
|---|---|
| `node build.mjs --out …/dist`（HEAD 0267123 新副本 + pl.json + glossary，数据文件用真实仓库原文件） | 0 error；pl 5 条 W：L-8 ×2（两个 kicker）、L-4（`meta.appStoreSubtitle`、`common.menu`）、L-14 未覆盖、L-9 无 G1 |
| 同上，副本数据文件合入附录 A 词表 | 0 error；pl 只剩 L-8 ×2、L-4 |
| `node build.mjs --pseudo --out …/dist-pseudo` | 两种数据下均 0 error |
| `node scripts/check.mjs` | 0 error / 0 warning |
| `node scripts/check.mjs --keys pl` | 0 missing / 0 not in en |
| `node scripts/og.mjs --only home-pl` | ✓ 标题 64 px × 3 行、副标题 30 px × 2 行、155.6 KB |
| `node --test scripts/tests/*.test.mjs` | 58/58 通过 |
| `node pl-gen/lint-test.mjs`（scratchpad） | 26 条规则 + 3 组关键词模式全部命中反例；放行用例 0 误拦 |
| headless Chrome 1280 / 390 / 375 / 320 px | 无横向溢出；SE 卡片 393 / 450 / 450 / 558 px；390 px 页面高 13,452 px |
