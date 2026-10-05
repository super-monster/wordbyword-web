# 07 · 关键词与竞品版图研究（多语言）

> 研究日期：2026-10-05 · 只读调研，未修改任何项目文件
> 标注约定：**【事实】**＝有文件行号 / 命令输出 / URL 可复现；**【推断】**＝基于 SERP 构成、行业常识或间接证据的判断；**【未验证】**＝未拿到证据，需后续确认。
> 交叉引用：GSC 基线见 `research/00-gsc-baseline.md`；SE 官网架构见 `research/03-se-architecture.md`；现有推广方案见 `research/04-promo-current.md`。

---

## 0. TL;DR（给设计阶段的 10 条结论）

1. **非英语关键词不命中，首要原因是架构而不是用词**。【事实】20 个语言页几乎是孤岛：全站唯一指向 `*-top.html` 的链接只有 `chrome-extension/index.html:319`（指向 `../zh-top.html`）；所有页面都没有 `hreflang`/`canonical`（`grep -l hreflang *.html` → 0），`robots.txt` 与 `sitemap.xml` 线上均返回 404；`cn-top.html` 与 `zh-top.html` 内容完全相同（`diff -q` → identical）。用日语、西语 H1 原句做精确搜索，只返回根域名和 App Store，没有语言页【推断：语言页基本未被收录】。
2. **其次才是用词**：所有页 title 都是零搜索量的"Smart Language Learning Assistant / 外语学习翻译助手"类泛词（`index.html:6`, `ja-top.html:6`, `cn-top.html:6`）；全站 **0 次出现 "iPhone"**（index/ja/cn/ko/es 逐一计数为 0），而真实查询普遍带 `iphone / app / アプリ / 앱` 修饰（见 §5 autocomplete）；多个语种的功能标题用了"alignment / 对齐"这种 NLP 术语（ru/uk 还有误译，见 §2.3）。
3. **品牌词 "word by word" 是风险大于机会**：它在 Google autocomplete 中被 Quran / Bible / 词典图书 / picture dictionary 占据；同名竞品 **WordByWord.io**（Chrome 扩展 + 词汇平台，sitemap 634 URL，en/ru/de）在 "WordByWord" 品牌搜索里占多个前排位置，搜索摘要甚至把两者混为一谈。GSC 里 "word by word" 贡献 758/1286 展示但 CTR 仅 1.7%（`00-gsc-baseline.md`）。策略：**守住品牌导航词 + 用实体标记去歧义 + 只做 "word by word translation app" 这类长尾**，不追 head term。
4. **WordByWord 的可防守差异化关键词区**＝"**iPhone 上翻译任意网页并保留原文（含 X/Twitter）** + **任意语言对（不只英语）** + **AI 语境查词**"。证据：Safari 自带翻译会替换原文（多家 how-to 证实）；Immersive Translate/Mate 在 iOS 是 Safari 扩展；X App 不允许扩展（x-translator README 摘要）。
5. **SurfEnglish 与 WordByWord 现在的关键词高度重叠**（逐句对照、双击查词、语境、対訳、上下文…），且 SE 也有内置浏览器"任何网站都能双语读"（`SurfEnglishWebsite/src/locales/zh-Hans.json` explore.title）。分工必须靠 **"源语言范围 + 用户意图"**：SE 独占"学英语/英语新闻/分级/语块/游戏"；WBW 独占"网页翻译工具/多语言/非英语源语言/X 翻译/沉浸式翻译 iPhone 替代"。
6. **兄弟推荐的最佳落点是"学英语意图"**：在 WBW 页面中，凡是读者表现出"我主要想学英语"的位置（FAQ、语言支持段、英语学习场景），用 SE 的母语核心词做锚文本自然转介（例：ja「英語ニュースを対訳で読むなら SurfEnglish」）。这既对用户有益，也把 WBW 的流量送到 SE 的核心词页面，而不让 WBW 自己去抢这些词。
7. **竞品可借鉴**：LingQ（19 个 hreflang + x-default + "learn-japanese-online" 这类按目标语言的落地页）、Bilingual Pages（`/vs/readlang` 诚实对比页 + JSON-LD）、Immersive Translate（每个功能/场景独立 URL，如 `/webpage/x-twitter-website-translator/`；但其 1,924 个语言对程序化页不适合小静态站照抄）。
8. **优先语种（建议）**：T1 = en / ja / zh-Hans / zh-Hant / ko；T2 = es / pt-BR / fr / de；T3 = 其余。依据：iOS 份额【推断】、SERP 竞争、与 SE 的重叠度、搜索引擎格局（中国大陆 Baidu、韩国 Naver、俄罗斯 Yandex 非 Google 主导【推断】）。
9. **内容机会集中在"信息意图 how-to"**："translate web page iPhone / webページ 翻訳 iphone / iphone网页翻译 / traducir página web iphone / webseite übersetzen iphone" 等查询 autocomplete 均存在，但 SERP 被 Apple/Google 帮助页和科技博客占据、都只讲 Safari 整页替换；"保留原文/双语对照"这一角度几乎无人覆盖 → 可做 3–5 篇纯文字 + 现有截图的指南页（不需新素材）。
10. **没有搜索量数据**：本研究无 Keyword Planner/Ahrefs/Semrush 权限，所有"竞争度/需求"均为基于 SERP 首页构成 + Google/Baidu autocomplete 的定性判断。上线前务必用 GSC「国家/页面」维度补基线（`00-gsc-baseline.md` 末尾已列待补）。

---

## 1. 方法与数据局限

| 手段 | 用途 | 局限 |
|---|---|---|
| `WebSearch`（US-only，返回前 ~9 个链接 + 摘要） | 观察 SERP 首页是谁（App Store / 帮助页 / 博客 / 竞品官网） | 非真实地域 SERP；排序是工具返回顺序，近似而非精确排名 |
| Google Autocomplete：`suggestqueries.google.com/complete/search?client=firefox&hl=<hl>&gl=<gl>` | 验证"母语者真实说法是否存在需求"；**有 suggestion = 有一定搜索量**，无 suggestion ≠ 无量 | 只能定性；中国大陆 Google 数据代表性弱 |
| Baidu suggestion：`suggestion.baidu.com/su?wd=…&action=opensearch` | 简中真实说法（大陆） | 同上 |
| `curl` 抓竞品 HTML（脚本 `scratchpad/peek.py`） | 读 title / meta description / H1 / H2 / hreflang / JSON-LD | 部分站点 Cloudflare 拦截（matetranslate.com）、JS 渲染站拿不到 H1（toucan、languagereactor） |
| `curl` 抓 App Store 页（`apps.apple.com/<cc>/app/id6741724502[?l=]`） | WBW 各店面 name / subtitle / description | — |
| 本地文件 | WBW 页面文案、SE locales 关键词 | — |

> 【事实】本次所有 autocomplete 原始输出可用 `scratchpad/sug.py` 复现（stdin 每行 `hl|gl|query`）。

---

## 2. 现状基线（与关键词相关的已验证事实）

### 2.1 WBW 功能与 App Store 元数据

功能（`index.html` 正文 H3，行号 70/84/98/112/126/140）：滑动翻译+逐句对照、双击查词+AI 解释、AI 发音、上下文解析/短语优先、历史自动分组、个性化设置；"Supports over 20 language pairs"（`index.html:50`）。App UI 本地化 20 种（`WordByWordPrototype/Localizable.xcstrings`：ar de en es fr hi id it ja ko nl pl pt-BR ru th tr uk vi zh-Hans zh-TW）。

App Store（`curl apps.apple.com/<cc>/app/id6741724502`，JSON-LD `software-application` + subtitle）【事实】：

| 店面/语言 | name | subtitle |
|---|---|---|
| us (en) | **WordByWord Translate** | Swipe to translate AI explains |
| jp | WordByWord | なぞって翻訳、AIで文脈を解釈 |
| cn | WordByWord | 任意网页一划即译，开启双语阅读体验 |
| tw | WordByWord翻譯 | 滑動翻譯 AI 解釋 |
| kr | WordByWord | 스와이프 번역, AI 해설 |
| es | WordByWord | Desliza y traduce, IA explica |
| br | WordByWord | Deslize para traduzir de IA |
| fr / de | WordByWord | Balayez pour traduire / Wischen zum Übersetzen |
| ru | WordByWord Переводчик | Переводите по словам |
| vn?l=vi / th?l=th / id?l=id / tr?l=tr / sa?l=ar | WordByWord | Vuốt để dịch AI giải thích / เลื่อนเพื่อแปล AI อธิบาย / Geser untuk menerjemahkan / Kaydırın, AI açıklar / اسحب للترجمة، والذكاء يشرح |

- 【事实·需修】**英文 App Store 描述第一行是遗留草稿标记 "English concise submission version"**（us 店 JSON-LD description 开头）。App Store 页在品牌 SERP 里排在官网旁边（见 §3），这行字会被搜索摘要引用，属于低成本高优先修复（不在网站代码内，需在 App Store Connect 改）。
- 【事实】英文描述含 "Optimized for X (formerly Twitter)"、"Supports Microsoft Azure, Google Translate, and local translation"、"Language Chunk Extraction (currently English only)" ——**官网没有提到 X 优化和本地翻译引擎**，这是可补的功能关键词。
- 【事实】WBW 自己的 App Store 页 "You Might Also Like" 里出现 **"Word by Word: Vocabulary Diary"**（另一家的 App）以及 TapEnglish、PhraseCut、SegLingo、LexiTales、LingoBlend 等阅读/词汇类 App——这是 Apple 认定的同类竞品集合。

### 2.2 站点关键词载体现状

| 位置 | 现状 | 问题 |
|---|---|---|
| `<title>` | `WordByWord - Your Smart Language Learning Assistant`（index.html:6）；ja「外国語学習翻訳アシスタント」；zh「外语学习翻译助手」；ko「스마트 외국어 학습 도우미」 | 无功能词、无平台词；"Smart … Assistant" 类短语在 autocomplete 中无任何需求信号 |
| meta description | "translate by swiping text **in your browser**"（index.html:7） | "browser" 会被理解为桌面浏览器扩展；无 "iPhone/app" |
| H1 | `Word by Word<br>Instant Translation, Smarter Language Learning`（index.html:47） | H1 首词是品牌（被歧义短语稀释），核心功能词缺失 |
| 平台词 | index/ja/cn/ko/es 中 "iPhone" 出现 0 次，"iOS" 1 次 | 真实查询普遍带 iphone/app 修饰（§5） |
| 语言页互链 | 仅 `chrome-extension/index.html:319` 链到 `../zh-top.html` | 其余 19 个语言页无入口 |
| hreflang / canonical / sitemap / robots | 全无；线上 robots.txt、sitemap.xml 均 404 | 搜索引擎无法发现与归并语言版本 |
| 重复页 | `cn-top.html` ≡ `zh-top.html` | 重复内容、信号分散 |

### 2.3 本地化文案中的"非母语/术语化"问题（直接影响关键词匹配）【事实 + 语言判断】

| 文件:行 | 现文案 | 问题 | 母语者常用说法（建议方向） |
|---|---|---|---|
| `ru-top.html:70` (+:7) | Перевод свайпом, **посрочное** выравнивание | "посрочное" 是错字（应为"построчное"=逐行），且"выравнивание(对齐)"是术语 | перевод по предложениям, параллельный перевод, двуязычный перевод |
| `uk-top.html:49` (+:7) | **покрокове** вирівнювання речень | "покрокове"=逐步，语义错误 | переклад по реченнях, паралельний текст |
| `vi-top.html:70` | **Quét** để dịch | "quét"通常指扫描/扫码；App Store 已用 "Vuốt" | Vuốt để dịch, đọc song ngữ, dịch song ngữ |
| `ar-top.html:71` | محاذاة الجمل | "句子对齐"是 NLP 术语 | ترجمة جملة بجملة، قراءة ثنائية اللغة |
| `hi-top.html:7` | वाक्य-दर-वाक्य **संरेखण** | 同上术语化 | वाक्य-दर-वाक्य अनुवाद（及英文/Hinglish） |
| `tr-top.html:70` | Cümle **Hizalama** | 术语化 | cümle cümle çeviri, çift dilli okuma |
| `es-top.html:70` / `fr-top.html:70` | alineación / alignement phrase à phrase；fr "**Balayage**"、"Double-tap" | 术语化；balayage≈扫描；franglais | traducción frase por frase, lectura bilingüe / traduction phrase par phrase, lecture bilingue, toucher deux fois |
| `pt-top.html:70` / `it-top.html:70` | **Selecione** para traduzir / **Seleziona** per tradurre | 与"滑动"交互不一致（App Store br 用 Deslize） | Deslize para traduzir, leitura bilíngue / Scorri per tradurre, lettura bilingue |
| 全部语种 H3 | "…Alignment / 对齐 / 対訳"并列短语 | H3 为"功能名+功能名"结构，缺"用户要做的事" | 改为"任务 + 结果"句式（见 §6） |

---

## 3. 品牌词 "word by word" 的歧义问题（任务 Q4）

### 3.1 证据

**Google autocomplete（en-US）【事实】**
- `word by word` → word by word **quran** / word by word **meaning** / word by word **book** / word by word **the secret life of dictionaries**（Kory Stamper 的书）/ word by word **translation of quran** / word by word **picture dictionary** (+pdf) / word by word translation / word by word quran translation in english
- `word by word translation` → of quran ×6 变体、bible、surah fatiha、gayatri mantra
- `word by word translator` → 同上 Quran/Bible 主导
- ja `逐語訳` → 逐語訳とは / 直訳 違い / 聖書；zh Baidu `逐句翻译` → 全是文言文（滕王阁序/醉翁亭记…）；vi `dịch từng câu` → 佛经；id `translate per kalimat` → 阿语/Quran

**SERP（WebSearch）【事实】**
- "word by word translation" → WordReference 论坛、ACL 1952 论文、Columbia "Word for Word"、Wikipedia *Literal translation*、Quran Word by Word App ×2、Linguee
- "word by word translation app" → Quran WBW ×2、Google Play 翻译器、**Tokenize & Translate（OneByOne）**、…、第 9 位 **WordByWord Translate（App Store）**
- "Word by Word app iPhone" → Words of Word、**Rapid Reader: Word by Word**（RSVP 速读）、Word to Word 游戏、Microsoft Word 相关；**WBW 官网和 App 均不在列**
- "WordByWord"（品牌导航） → SourceForge *WordByWord*、**peerlist WordByWord.io**、**Chrome Web Store "WordByWord – Vocabulary H…"（wordbyword.io）**、WBW App Store（gb）、**wordbyword.io docs**、**wordbyword.io blog**、word-by-word.app（第 7 位）、UBY、Word(disambiguation)
- 带日文/中文 H1 原句的精确搜索：结果中 wordbyword.io / peerlist 排在 word-by-word.app 之前，且搜索摘要把 "WordByWord.io 的 Chrome 扩展 + 50 种语言" 与 "WBW 的滑动翻译" 写成同一个产品 → **实体混淆已经发生**。

**同名/近名实体清单【事实】**

| 实体 | 类型 | 体量/信号 |
|---|---|---|
| WordByWord.io（wordbyword.io） | Chrome 扩展 + Web 词汇/SRS 平台，"50+ languages" | `sitemap.xml` 634 URL（en 245 / ru 198 / de 191），hreflang de/en/ru/x-default，JSON-LD；博客 "Best Translation Extensions for Chrome in 2026: Ranked" 已有排名 |
| Word by Word: Vocabulary Diary | iOS App（"Language notebook & dictionary"） | 出现在 WBW 自己 App Store 页的推荐位 |
| Rapid Reader: Word by Word | iOS App（RSVP 速读） | 占 "Word by Word app iPhone" 首页 |
| Word by Word Picture Dictionary（Oxford/Pearson 教材） / *Word by Word* (Kory Stamper) | 图书 | 占 autocomplete |
| Quran Word by Word 系列 App | iOS/Android | 占 "word by word translation(app)" 首页 |
| github terry2tan/wordByword、sourceforge wordbyword | 开源项目 | 占中文/英文品牌搜索零星位置 |

### 3.2 判断：机会还是风险？

- **head term "word by word"：风险 > 机会**【推断】。GSC 显示其 758 展示、排名 6.5、CTR 1.7%（`00-gsc-baseline.md`）——展示多但意图错配（查释义、查 Quran 逐词译本、查词典书）。为它优化会把站点主题往"逐词直译"拉，与 WBW 实际卖点（逐句、语境、非字面）相反；且 Quran 相关意图属于宗教文本学习，不应作为营销目标。
- **品牌导航词 "wordbyword"：必须保护**【事实+推断】。它是唯一高 CTR 查询（40/130，排名 1.6）。重构时首页 URL、title 品牌前缀、与 App Store 的互相印证都要保留。
- **长尾 "word by word translation app / word by word translator app"：可做（中低优先）**【推断】。WBW App Store 已在该 SERP 第 9 位，说明 Apple 页面有相关性；官网可用一段 FAQ/说明"WordByWord 不是逐词直译，而是逐句+语境"自然覆盖，同时满足这类用户（他们多为学习者，想看每个词的意思）。
- **信息型内容机会**：可写一篇 "Word-by-word vs. sentence-by-sentence translation: which one helps you learn a language?"（及 zh/ja 版本：「逐词翻译和逐句对照，哪个更适合学外语」/「逐語訳と一文ずつの対訳、語学にはどちらが効く？」），承接歧义流量并把用户导向产品；**不要**做 Quran/Bible 相关内容。

### 3.3 去歧义措施（给设计阶段）

1. **统一实体名**：App Store 英文名为 "WordByWord Translate"，官网/其它店面为 "WordByWord"。建议官网 JSON-LD 用 `name: "WordByWord"` + `alternateName: ["WordByWord Translate", "Word by Word", "WordByWord翻譯", "WordByWord Переводчик"]`，并在可见文案中固定一个描述性后缀（如 "WordByWord – bilingual web translator for iPhone"）。
2. **JSON-LD**：`SoftwareApplication`（operatingSystem iOS、applicationCategory EducationalApplication、`sameAs` App Store `https://apps.apple.com/app/id6741724502`、`author`/`publisher` 同 SE 的 Person/Organization）、`WebSite`、`Organization`/`Person`；与 SurfEnglish 的 Person 实体（SE `dist/index.html` 已有 `"@type":"Person"`）使用同一个 `@id`/`sameAs`，让搜索引擎把两款 App 归到同一开发者。
3. **title 不以通用短语开头**：用 "WordByWord" 连写（品牌）而非 "Word by Word"（H1 现为 `Word by Word<br>…`），减少与短语的混同；功能词放在品牌后。
4. **显式差异化文案**：在 About/FAQ 中写明 "WordByWord is an iPhone app by Chi Jinlong; not affiliated with WordByWord.io"【需用户确认是否愿意点名】。
5. **外部印证**：SE 官网 about 页增加"同一开发者的另一款 App：WordByWord"（目前 SE 源码中 `grep -i wordbyword` 无结果）。

---

## 4. 竞品版图（任务 Q2）

### 4.1 官网关键词写法对比【事实：curl 抓取 2026-10-05】

| 竞品 | title / H1（en） | 关键词模式 | 多语言 SEO | 可借鉴 / 应避免 |
|---|---|---|---|---|
| **Immersive Translate 沉浸式翻译** | T: "Immersive Translate - Next-Gen AI Translator \| Bilingual Website Translation, PDF, Video Subtitle, Manga & Image Translation"；H1: "The Ultimate AI Translator for Web, PDFs and Videos"；zh T: "沉浸式翻译 - 新一代AI翻译软件 \| 双语对照网页翻译/PDF翻译/视频字幕翻译/漫画&图片翻译" | **品牌 + 品类词 + "\|" + 场景词列表**；每种语言用当地核心词（ja「二言語ウェブサイト翻訳」、ko「이중 언어 웹사이트 번역」、de「Zweisprachige Webseitenübersetzung」、ru「Двуязычный перевод веб-сайтов」） | 15 个 hreflang（无 x-default）；**sitemap 2,949 URL**：`/translate/`（语言对程序化页）1,924、`/webpage/`（站点专属翻译页，如 X/Twitter、Xiaohongshu）424、`/video/` 263、`/toplist/` 18、`/compare/` 20 | 借鉴：每个场景独立 URL + 本地母语词；**X 专页**："X (Twitter) Translator: Read Global Tweets in Your Language"。避免：小站照搬 1,924 个语言对薄页（规模化内容风险【推断】） |
| **LingQ** | T: "Learn Languages Online with Real Content \| LingQ Language App"；H1: "Learn Languages from Books Podcasts Movies TV Shows" | 方法论词 "real content"；**按目标语言的落地页** `/en/learn-japanese-online/`（T: "Language App to Learn Japanese Online \| LingQ"） | 19 hreflang **含 x-default**，JSON-LD | 借鉴：目标语言落地页（WBW 可做少量 "learn Japanese/Korean/Chinese by reading websites"） |
| **Readlang** | T: "Learn a Language by Reading \| Readlang"；H1: "Learn a language reading what you love" | title 即核心词 "learn a language by reading" | 无 hreflang，JSON-LD | 借鉴：title = 一句核心意图词，干净 |
| **Bilingual Pages** | T: "Bilingual Pages — Tap to Translate & Read Books in 2 Languages"；`/en/vs/readlang` T: "Bilingual Pages vs Readlang: Browser Reader or Mobile Library?" | 功能动作词（tap to translate）+ 对比页 | 11 hreflang 含 x-default，JSON-LD | 借鉴：**诚实对比页**（"Where X shines / has gaps / When X is right"）结构 |
| **Trancy** | T: "Trancy - YouTube AI Bilingual Subtitles & **Language Reactor Pro**"；H2: "Webpage AI Text Selection Translation", "Full-Text Immersive Translation" | 在 title 里蹭竞品品牌 | 41 hreflang（语言+地区重复，冗余） | 避免：title 蹭竞品品牌（品牌/商标风险、观感差）；避免 hreflang 冗余 |
| **WordByWord.io**（同名） | T: "Learn a Language from Websites, YouTube & PDF \| WordByWord.io"；H1: "Learn a language and expand your vocabulary from the content you love" | 场景（websites/YouTube/PDF）+ 博客横评 | de/en/ru + x-default，JSON-LD，634 URL | 风险源（§3）；也说明"学习型扩展 + 博客"在英/俄/德语区有效 |
| **Language Reactor** | T: "Language Reactor"（无 H1） | 纯品牌 | 无 | 品牌驱动，SEO 弱，不必借鉴 |
| **Toucan** | T: "Toucan - Learn a new language just by browsing the internet." | 一句话意图 | 无 | "learn … by browsing" 的说法可参考 |
| **DeepL** | `/en/ios-app` T: "DeepL for iOS: accurate translation and writing improvement"；H1: "DeepL for iOS: communicate from anywhere" | **平台专页**（ios-app） | （HTML 中未见 hreflang，可能走 header）【未验证】 | 借鉴：平台词进 title |
| **Mate Translate** | 官网被 Cloudflare 拦截；App Store "Language Translator by Mate"；Safari 扩展：整页翻译 + 选中段落弹窗翻译 | — | — | 说明 iOS 上"Safari 扩展"是主流形态 |
| **Google Translate / Apple 翻訳 / Safari 内建** | 帮助中心页占据 "translate web page iPhone" 类 SERP（Google Translate Help、support.apple.com、MacRumors、iMore、AppleInsider、idownloadblog） | — | — | 关键事实：**Safari 翻译整页替换原文，只能"显示原文"来回切换**（日文 SERP 摘要明确"原文と訳文を同時に並べて表示する機能ではありません"） |
| **Kindle / Word Wise** | 【未检索】Kindle 场景限于电子书，不与网页阅读直接竞争【推断】 | | | |
| **同类 iOS 阅读/学习 App**（SERP 中反复出现） | duoBooks、Beelinguapp、Readle、Linga、EWA、Reverso Context、Smart Book、SegLingo、LinguoLand、Linguistic Browser–LingoLog、NextWord Browser、Learn Japanese Browser、Yomu Yomu | 多为"书库/故事"型；**"浏览器型"仅 LingoLog/NextWord/Learn Japanese Browser 等小 App** | — | WBW 的"任意网页 + 多语言 + AI 语境"在 iOS 上竞争者少【推断】 |

### 4.2 定位空白（WBW 可占的"位置"）【推断，依据见括号】
- **iPhone 上"翻译整页但保留原文、逐句插在下方"**：Safari 内建做不到（how-to SERP）；Immersive Translate iOS 版是 Safari 扩展（App Store 页 "Immersive Translate for Safari"）。autocomplete 存在 "immersive translate ios / ipad / safari ios / app store"，说明 iPhone 用户在找这类能力。
- **X/Twitter 双语阅读（iPhone）**：X App 不支持扩展（WebSearch 摘要引用 x-translator："mobile iOS/Android is not supported as the X App does not allow extensions"）；WBW 英文 App Store 描述写了 "Optimized for X"，官网却没写。
- **非英语源语言**：英语母语者 "learn japanese/korean/chinese/spanish by reading (app / news)" 均有 autocomplete；SE 只做英语，正好不冲突。
- **AI 语境查词**：英文 "context dictionary" 被 Reverso 占，但 "AI dictionary with context / understand words in context" 的 SERP 是一批小 App（UrLingo、Pickvocab、Context、Quicktionary），竞争中等偏低。

---

## 5. 多语言关键词候选（任务 Q1）

**图例**：意图 I＝信息（how-to/比较）、T＝工具（想马上用）、D＝下载（找 App）；AC✓＝Google（或 Baidu）autocomplete 出现该说法（有需求信号），AC×＝无建议；竞争：高/中/低＝依据 SERP 首页构成的定性判断；**→SE**＝属于 SurfEnglish 的核心意图，WBW 不作为主攻、改为兄弟推荐锚文本。

### 5.1 English（en）
| # | 关键词 | 意图 | 需求信号 | 竞争（SERP 首页是谁） | 备注 |
|---|---|---|---|---|---|
| 1 | translate web page on iPhone (+ keep original / bilingual) | I/T | AC✓ "translate web page iphone", "translate a webpage iphone", "…safari ios" | 高：Apple Support、MacRumors、iMore、AppleInsider、idownloadblog、popsci | 用指南页打"keep original"长尾 |
| 2 | bilingual reading app / bilingual reader app | D | AC✓ | 中：Immersive Translate(App Store)、Bilingual Reader(Chrome)、Beelinguapp、Bilingual Pages、Parallel Books | 与 SE 部分重叠，WBW 加 "for any website" |
| 3 | side by side translation app / parallel translation app | D | AC✓ 两者均有 "… app" | 中：被 Bible/书籍意图稀释 | 次关键词 |
| 4 | sentence by sentence translation | T/I | AC✓（弱） | 中：Tatoeba、Tokenize & Translate、anythingtranslate | 与 SE 共用，加 "web page" 限定 |
| 5 | translate X (Twitter) posts (on iPhone) | I | AC✓ "translate x posts (to english)", "translate twitter posts" | 中：教程站 + Immersive X 专页 | WBW 差异点 |
| 6 | Immersive Translate alternative for iPhone | I | AC✓ "immersive translate alternative", "immersive translate ios/ipad/app" | 中：alternativeto、saasworthy、toolify、竞品博客 | 做诚实对比页 |
| 7 | learn Japanese / Korean / Chinese / Spanish by reading (app, news) | I/D | AC✓ japanese/spanish/chinese 均含 "…by reading app" | 中-高：LingQ、Satori、Yomu Yomu、Readlang、listicles | **WBW 独占（非英语源）** |
| 8 | AI dictionary that understands context / word meaning in context | T | AC✓ "context dictionary"（Reverso 主导）；"look up words in context" 弱 | 中：Reverso、UrLingo、Pickvocab、Quicktionary | |
| 9 | word by word translation app | D | AC✓ "word by word translator" | 高歧义（Quran 系） | WBW App Store 已第 9 位；FAQ 级覆盖 |
| 10 | AI text to speech for language learning / AI pronunciation app | T | AC✓ | 【未查 SERP】推断中-高（TTS 工具站） | 次要 |
| — | learn English by reading (news/articles) | I/D | AC✓ | 中：App Store 阅读 App、planetspark 等 | **→SE** |

### 5.2 简体中文（zh-Hans）——注意大陆以 Baidu 为主
| # | 关键词 | 意图 | 需求信号 | 竞争 | 备注 |
|---|---|---|---|---|---|
| 1 | 双语对照翻译 / 双语对照网页翻译 | T | Google AC✓ "双语对照翻译"；Baidu AC✓ "双语对照翻译软件" | 高：沉浸式翻译官网 + App Store、网站翻译器 | 加 "iPhone/App" 修饰降竞争 |
| 2 | 网页翻译 app / iPhone 网页翻译 | T/I | Baidu AC✓ "网页翻译app"；Google AC✓ "iphone网页翻译中文/怎么用"、"iphone safari 网页翻译" | 中-高：App Store、知乎、Safari 教程站 | |
| 3 | 划词翻译 app / 划词翻译 iOS | T | Google+Baidu AC✓ "划词翻译app/软件/软件推荐" | 中：知乎、少数派、小众软件、V2EX（**多为桌面**） | iOS 空档；WBW 现有"随划随译"可保留 |
| 4 | 沉浸式翻译 替代 / 沉浸式翻译 App | I | AC✓ "沉浸式翻译 替代"、Baidu "沉浸式翻译APP / 安卓下载" | 中：知乎、linux.do、GitHub | 对比/替代指南 |
| 5 | 推特翻译 / X 推文翻译中文 | I | AC✓ "推特翻译设置/中文/功能" | 中：教程站、知乎 | WBW 差异点 |
| 6 | 上下文查词 / AI 语境释义 | T | AC 弱（"上下文 翻译"） | 低-中：小型 App（语境英语单词AI、LinguoLand） | 低量低竞争 |
| 7 | 日语/韩语 网页 翻译 学习（看日文网站、读韩语新闻） | I/D | 【未逐条 AC】 | 推断中 | WBW 多语言差异 |
| 8 | AI 朗读 / 网页朗读 / 英语发音 | T | 【未验证】 | — | 次要 |
| — | 双语阅读 app、中英对照（读新闻/新闻app）、英语阅读app、看新闻学英语 | D/I | Baidu AC✓ "双语阅读app"、Google AC✓ "中英对照读新闻 / 中英对照新闻app"、Baidu "英语阅读app十大排名" | 中 | **→SE**（SE zh-Hans keywords 已含） |
| 避免 | 逐句翻译、逐词/逐字翻译 | — | Baidu AC 全是文言文；"逐字翻译"是另类直译工具 | — | 不作主词，正文自然出现即可 |

### 5.3 繁体中文（zh-Hant，台湾）
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | 雙語對照網頁翻譯 | T | AC✓ | 高（沉浸式翻譯） |
| 2 | 網頁翻譯 app / 網頁翻譯推薦 / 網頁翻譯 ai | T/D | AC✓ | 中-高 |
| 3 | iPhone 網頁翻譯（中文） | I | AC✓ "iphone 網頁翻譯中文/功能"、"iphone safari 網頁翻譯" | 中（教學文） |
| 4 | 劃詞翻譯 | T | AC✓（"劃詞翻譯軟體"） | 中 |
| 5 | 沉浸式翻譯 app / 替代 | I/D | AC✓ "沉浸式翻譯app"、"…dcard/ptt" | 中（電腦王阿達、Dcard、PTT） |
| 6 | 查單字 app | D | AC✓ | 中【推断】 |
| — | 英文閱讀 app 推薦、中英對照讀新聞 / 新聞app | D/I | AC✓ | **→SE** |
| 用词 | 台湾用"單字/軟體/影片/點兩下"，WBW tw 页现用"查詞/片語"（`tw-top.html:84,112`）可改"查單字" | | | |

### 5.4 日本語（ja）
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | Webページ 翻訳 iPhone / webページ 翻訳 アプリ iphone / ウェブページ 翻訳 iphone | I/T | AC✓ | 中-高：日経xTECH、マイナビ、appps.jp 等 how-to（全是 Safari 方法） |
| 2 | 英語 サイト 翻訳 アプリ / 英語 サイト 翻訳 iphone / …ai | T/D | AC✓ | 中 |
| 3 | 対訳 表示 / 対訳 アプリ | T/D | AC✓（弱；"対訳 聖書 アプリ"） | 中-低 |
| 4 | 原文と訳文を並べて表示（原文併記） | I | AC×；SERP 有 窓の杜、Zenn、Qiita、MdN 文章（桌面扩展向） | 低-中，**iPhone 角度空白** |
| 5 | イマーシブ翻訳 スマホ / アプリ / 代わり | I/D | AC✓ "イマーシブ翻訳 スマホ/アプリ/無料/安全" | 中 |
| 6 | X 翻訳（設定・表示されない）→ "X 翻訳 原文 表示 iPhone" | I | AC✓ 大量 troubleshooting | 中 |
| 7 | 文脈 辞書 / 文脈 意味 辞書 | T | AC✓ | 低-中 |
| 8 | 英語 読み上げ アプリ / 英語 読み上げ ai | T | AC✓ | 中-高（TTS 工具） |
| 9 | 韓国語 翻訳 アプリ（学習）/ 中国語 翻訳 ウェブページ | D | AC✓ "韓国語 翻訳 アプリ (papago)"、"中国語 翻訳 ウェブページ" | 高（Papago、my-best 榜单） |
| — | 英語ニュース 対訳、英語 リーディング アプリ、英語多読 アプリ | D/I | AC✓ | **→SE**（SE ja keywords 已含 "英語ニュース 対訳/英語多読"） |
| 避免 | 逐語訳（=直译概念，AC 为释义/圣经）；「なぞって翻訳」无需求（AC×），仅作 UI 文案 | | | |

### 5.5 한국어（ko）——Naver 主导，Google 只是部分流量【推断】
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | 웹페이지 번역 앱 / 웹페이지 번역 추천 / 웹페이지 번역 ai | T/D | AC✓ | 中-高 |
| 2 | 아이폰 웹페이지 번역 | I | AC✓ | 中（Google 帮助、App Store 웹사이트 번역기） |
| 3 | 이중 언어 번역 | T | AC✓（弱） | 中（Immersive ko title 用 "이중 언어 웹사이트 번역"） |
| 4 | 원문 번역 같이 보기 / 원문 대조 번역 | I/T | AC× | 低（长尾） |
| 5 | 이머시브 번역(기) | I | AC✓ | 中 |
| 6 | 트위터 번역 (안됨/기능/설정) | I | AC✓ | 中 |
| 7 | 일본어 번역 앱 추천 | D | AC✓ | 高（Papago） |
| 8 | 영어 사전 앱 / 문맥 뜻 | D | AC✓ "영어 사전 앱" | 高（Naver 사전；말해보카 主打 "문맥에 맞게 단어 뜻"） |
| — | 영어 원서 읽기 앱 / 영어 읽기 앱 / 영어 뉴스 번역 | D | AC✓ | **→SE** |
| 避免 | 单独 "대역"（AC 被 대역폭/대역전재판 占）——要用 "영한대역/대역 읽기" | | | |

### 5.6 Español（es）
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | traducir página web iPhone (Safari) | I | AC✓ | 高（Google Ayuda、Macworld、Apple） |
| 2 | traductor de páginas web (app / gratis) | T | AC✓ | 高（扩展为主） |
| 3 | app para aprender idiomas leyendo / aprender idiomas leyendo | D/I | AC✓ | 中（duoBooks、Eppika、Linga、language-lit 榜单） |
| 4 | traductor con contexto | T | AC✓ | 高（Reverso） |
| 5 | lectura bilingüe | T/I | AC✓（弱） | 中-低 |
| 6 | traducción frase por frase | T | AC× | 低 |
| 7 | traducir tuits / publicaciones de X | I | 【未验证】 | — |
| — | aprender inglés leyendo (libros/textos) | I/D | AC✓ | **→SE** |
| 避免 | alineación、texto paralelo（AC = 学校写作练习） | | | |

### 5.7 Português（pt-BR）
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | traduzir página iphone / traduzir página safari iphone | I | AC✓ | 高 |
| 2 | tradutor de sites (online / melhor) | T | AC✓ | 高 |
| 3 | tradução lado a lado | T | AC✓ | 中-低 |
| 4 | leitura bilíngue | T/I | AC✓（弱） | 低 |
| 5 | app para ler artigos em inglês / app para ler notícias em inglês | D | AC✓ | 中 → 偏 SE |
| 6 | app para aprender idiomas lendo | D | 【推断】 | 中（duoBooks、Linga、LingoBlend） |
| — | aprender inglês lendo、app para ler em inglês | I/D | AC✓ | **→SE** |
| 修正 | pt 页 "Selecione para traduzir" → "Deslize para traduzir"（与 App Store 一致） | | | |

### 5.8 Français（fr）——SE 无 fr 本地化
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | traduire une page web iPhone / traduire page safari iphone | I | AC✓ | 高 |
| 2 | traducteur de site web / traducteur de page web (automatique) | T | AC✓ | 高 |
| 3 | apprendre une langue en lisant (application) | I/D | SERP：Linga、Readle、Reverso | 中 |
| 4 | lecture bilingue (anglais français) | T/I | AC✓ | 中-低 |
| 5 | traduction en contexte / traducteur en contexte | T | AC✓ | 高（Reverso） |
| 6 | apprendre l'anglais en lisant (application) | I/D | AC✓ | 中；SE 无 fr 版，WBW 可承接但注明 SE 仅英文界面 |
| 避免 | balayage、double-tap、alignement | | | |

### 5.9 Deutsch（de）——SE 无 de 本地化
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | Webseite übersetzen iPhone (Safari) | I | AC✓（含 "ios 26"） | 高 |
| 2 | Webseiten Übersetzer (Safari/App) | T | AC✓ | 高 |
| 3 | Sprachen lernen durch Lesen | I/D | AC✓ | 中（Readle、Smart Book、Reverso） |
| 4 | Englisch lernen durch Lesen (App / Zeitung) | I/D | AC✓ | 中 |
| 5 | Übersetzung im Kontext | T | AC✓（弱） | 中-高（Reverso） |
| 6 | zweisprachig lesen / Satz für Satz übersetzen | T | AC× | 低 |
| 避免 | Paralleltext（AC = 学校写作体裁） | | | |

### 5.10 Tiếng Việt（vi）
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | đọc song ngữ (anh việt) | T/D | AC✓ | 中（"Song ngữ Anh Việt" App、duoBooks） |
| 2 | dịch song ngữ (online) | T | AC✓（含 youtube/netflix 场景） | 中 |
| 3 | dịch trang web trên iphone (sang tiếng việt) | I | AC✓ | 中（how-to） |
| 4 | tra từ theo ngữ cảnh | T | 【未 AC】SE 已用 | 低 |
| 5 | app học ngoại ngữ qua đọc（日/韩/中） | D | 【推断】 | 中 |
| — | đọc báo song ngữ anh việt、học tiếng anh qua đọc báo (song ngữ) | I/D | AC✓ | **→SE** |
| 避免 | dịch từng câu（AC 被佛经占）；"Quét" | | | |

### 5.11 ภาษาไทย（th）
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | แปลเว็บไซต์ / แปลเว็บเป็นภาษาไทย | T | AC✓ | 中-高 |
| 2 | แอพแปลภาษาอังกฤษ / แอพแปลภาษาที่ดีที่สุด | D | AC✓ | 高（Google แปลภาษา、iTranslate、榜单） |
| 3 | แปล 2 ภาษา（แปลสองภาษา） | T | AC✓（弱） | 低 |
| 4 | แปลทีละประโยค | T | AC× | 低 |
| 5 | แอพแปลภาษา หน้าจอ（屏幕翻译，邻近需求） | D | AC✓ | 中 |
| — | อ่านข่าวภาษาอังกฤษ พร้อมแปล | I | AC✓ | **→SE**（SE th keywords 已含） |

### 5.12 Bahasa Indonesia（id）
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | aplikasi terjemahan bahasa inggris (ke indonesia) | D | AC✓ | 高 |
| 2 | translate per kalimat (bahasa inggris indonesia) | T | AC✓（阿语/Quran 变体多） | 中 |
| 3 | terjemahan dua bahasa | T | AC× | 低 |
| 4 | terjemahkan halaman web di iPhone | I | AC× | 中（Google Bantuan） |
| — | aplikasi baca bahasa inggris、belajar bahasa inggris dengan membaca | D/I | AC✓ | **→SE** |

### 5.13 Русский（ru）——Yandex 份额高；SE 无 ru 本地化
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | параллельный перевод (приложение / книги) | T/D | AC✓ | 中（SBook、Читалка Параллельных Текстов、duoBooks） |
| 2 | чтение с переводом / английский чтение с переводом | T | AC✓（Quran 变体多） | 中 |
| 3 | перевод сайта / переводчик сайтов (расширение) | T | AC✓ | 高 |
| 4 | перевод в контексте / переводчик в контексте | T | AC✓ | 高（Reverso Context） |
| 5 | двуязычный перевод | T | AC✓ | 中-低 |
| 6 | иммерсивный перевод | I | AC✓ | 中 |
| 修正 | ru 页 "посрочное выравнивание" 错字（`ru-top.html:7,70`） | | | |

### 5.14 Türkçe（tr）——SE 无 tr 本地化
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | web sitesi çeviri / safari web sitesi çeviri | T/I | AC✓ | 中-高 |
| 2 | iphone safari sayfa dili çevirme | I | AC✓ | 中 |
| 3 | ingilizce okuma uygulaması / ingilizce makale okuma uygulaması | D | AC✓ | 中 |
| 4 | okuyarak ingilizce öğrenmek | I | AC✓ | 中 |
| 5 | cümle cümle çeviri | T | AC✓（弱） | 低 |
| 避免 | "Hizalama"；"çift dilli" 单独（AC 被腰带/教育占） | | | |

### 5.15 العربية（ar）
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | ترجمة المواقع (تلقائيا / في سفاري / بالذكاء الاصطناعي) | T/I | AC✓ | 中-高 |
| 2 | ترجمة صفحة ويب (من الانجليزية الى العربية) | T | AC✓ | 中-高 |
| 3 | تطبيق ترجمة (فورية / الشاشة) | D | AC✓ | 高 |
| 4 | ترجمة جملة (بالانجليزي) | T | AC✓ | 高（通用翻译） |
| 5 | قراءة ثنائية اللغة / ترجمة جملة بجملة | T | AC× | 低（SE ar 已用） |
| — | تعلم الانجليزية من خلال القراءة | I | AC✓ | **→SE** |
| 避免 | محاذاة الجمل | | | |

### 5.16 हिन्दी（hi）——实际多用英文/Hinglish 搜索；iOS 份额低【推断】
| # | 关键词 | 意图 | 需求信号 | 竞争 |
|---|---|---|---|---|
| 1 | हिंदी अनुवाद ऐप / हिंदी अनुवाद करें | T/D | AC✓ | 高（Play 翻译器） |
| 2 | website translate hindi (to english) | T | AC✓ | 中 |
| 3 | english reading app (for adults) | D | AC✓（hi-IN 下英文 query） | 中 → 偏 SE |
| 4 | english padhna sikhe app / इंग्लिश पढ़ना सीखें | D | AC✓ | 中（扫盲型意图，与两款 App 都不完全匹配） |
| 5 | वाक्य-दर-वाक्य अनुवाद | T | 【未 AC】SE 已用 | 低 |

> it / nl / pl / uk 不在本次必查范围：沿用 en 的结构，主关键词建议 it "tradurre pagine web iPhone / lettura bilingue"、nl "website vertalen iPhone / tweetalig lezen"、pl "tłumaczenie stron iPhone / czytanie dwujęzyczne"、uk "переклад сайтів iPhone / паралельний переклад"（均【未验证】）。

---

## 6. 功能 × 关键词映射（任务 Q3）

### 6.1 映射总表（en / zh-Hans / ja 完整）

| 功能 | en 主关键词 | en 次关键词 | zh-Hans 主 | zh-Hans 次 | ja 主 | ja 次 |
|---|---|---|---|---|---|---|
| **F1 滑动翻译 · 逐句对照（网页内插入译文、保留原文）** | translate web pages on iPhone and keep the original | bilingual reading app (for any website); side-by-side / parallel translation app; sentence-by-sentence translation; inline translation below the original; **translate X (Twitter) posts on iPhone**; Immersive Translate alternative for iPhone | iPhone 网页双语对照翻译 | 网页翻译 app；划词翻译 iOS/App；原文下方显示译文；推特/X 双语翻译；沉浸式翻译 替代（iPhone） | iPhoneでWebページを対訳表示（原文と訳文を並べて読む） | 英語サイト 翻訳 アプリ；webページ 翻訳 アプリ iphone；一文ずつ翻訳；X 翻訳 原文 表示；イマーシブ翻訳 スマホ 代わり |
| **F2 双击查词 · AI 语境解释 · 短语优先** | AI dictionary that understands context | word meaning in context; tap to look up words while reading; phrase & idiom lookup; collocations and example sentences; context-aware definitions | AI 语境查词（上下文释义） | 双击查词；短语/固定搭配识别；单词在句子里的意思；AI 释义 例句 | 文脈がわかるAI辞書 | 文脈 意味 辞書；ダブルタップ 辞書；熟語・コロケーション；英単語 意味 文脈；ポップアップ辞書 |
| **F3 AI 发音 / TTS** | natural AI voice to read words and sentences aloud | AI text to speech for language learning; pronunciation app; adjustable TTS speed | AI 朗读与发音 | 单词/句子朗读；语速调节；原生 TTS 与 AI 语音切换 | AI音声で読み上げ | 英語 読み上げ アプリ；読み上げ ai；発音 確認；読み上げ速度 |
| **F4 历史记录 · 自动分组（回顾）** | translation & lookup history for review | saved words by date; review words you looked up | 翻译与查词历史（按日期回顾） | 生词回顾；查词记录 | 翻訳・検索履歴で復習 | 調べた単語 復習；日付ごとに自動整理 |
| **F5 20+ 语言对（自动识别）** | read websites in 20+ languages | learn Japanese/Korean/Chinese/Spanish by reading websites; Japanese↔English, Korean↔English reader | 20+ 语言互译 · 读外语网站 | 看日文/韩文网站；日语/韩语 网页 翻译 学习 | 20以上の言語に対応（多言語） | 韓国語 中国語 ウェブ 翻訳 学習；韓国語 ニュース 翻訳 |
| （补）F6 翻译引擎 / X 优化 | AI translation with Google, Azure or on-device engines | offline/on-device translation | AI/本地翻译引擎可选 | 离线翻译 | 翻訳エンジン選択（オンデバイス） | オフライン 翻訳 |

**使用规则**
- F1 是全站主词：首页 title/H1/meta 必须含 F1 主词 + 平台词（iPhone）。F2 是第二主词，进 title 后半或 meta。F3/F4 只作 H2/H3 与 FAQ 级覆盖（搜索需求弱，不单独建页）。F5 用于"语言支持"段和（可选的）2–4 个目标语言落地页。
- F1 次关键词中 "translate X posts" 与 "Immersive Translate alternative" 适合**独立指南页**（信息意图），而不是塞进首页。
- 中文 "逐句翻译" 不作主词（Baidu 被文言文占），用"双语对照 / 原文下方显示译文"。

### 6.2 其余语言的主关键词（每功能 1 个）

| 语言 | F1 | F2 | F3 | F5 |
|---|---|---|---|---|
| zh-Hant | iPhone 網頁雙語對照翻譯 | AI 語境查單字 | AI 朗讀發音 | 20+ 語言互譯 |
| ko | 아이폰 웹페이지 번역 앱(원문·번역 같이 보기) | 문맥에 맞는 뜻 AI 사전 | AI 음성 읽기 | 20개 이상 언어 번역 |
| es | traductor bilingüe de páginas web para iPhone | diccionario con IA según el contexto | pronunciación con voz IA | leer webs en más de 20 idiomas |
| pt-BR | tradutor bilíngue de sites para iPhone | dicionário com IA no contexto | pronúncia com voz de IA | ler sites em mais de 20 idiomas |
| fr | traduire une page web sur iPhone en gardant l'original | dictionnaire IA en contexte | prononciation par voix IA | lire des sites dans plus de 20 langues |
| de | Webseiten zweisprachig übersetzen auf dem iPhone | KI-Wörterbuch mit Kontext | KI-Vorlesestimme | Webseiten in über 20 Sprachen lesen |
| vi | dịch song ngữ trang web trên iPhone | tra từ theo ngữ cảnh bằng AI | đọc phát âm bằng giọng AI | hơn 20 ngôn ngữ |
| th | แปลเว็บไซต์สองภาษาบน iPhone | ความหมายตามบริบทด้วย AI | อ่านออกเสียงด้วย AI | กว่า 20 ภาษา |
| id | terjemahkan halaman web dua bahasa di iPhone | kamus AI sesuai konteks | pelafalan suara AI | lebih dari 20 bahasa |
| ru | двуязычный перевод сайтов на iPhone | ИИ-словарь с учётом контекста | озвучка ИИ-голосом | более 20 языков |
| tr | iPhone'da web sitesi çift dilli çeviri | bağlama göre anlam veren yapay zekâ sözlük | yapay zekâ sesli okuma | 20+ dil |
| ar | ترجمة صفحات الويب ثنائية اللغة على iPhone | قاموس ذكي حسب السياق | نطق بصوت الذكاء الاصطناعي | أكثر من 20 لغة |
| hi | iPhone पर वेबसाइट का द्विभाषी अनुवाद | संदर्भ के अनुसार AI शब्दकोश | AI आवाज़ में उच्चारण | 20+ भाषाएँ |

> 以上为【推断】的母语表达草案，需母语者复核（尤其 hi/ar/th/tr）。原则：用该语言 autocomplete 中出现的说法作骨架（§5），不要从英文直译。

### 6.3 title / H1 草案（示例，供设计阶段定稿）
- en title: `WordByWord – Bilingual Web Translator & AI Context Dictionary for iPhone`（≈70 字符，可截为 "WordByWord – Translate Any Web Page on iPhone, Keep the Original"）；H1: "Translate any web page on iPhone — and keep the original."
- zh-Hans title: `WordByWord - iPhone 网页双语对照翻译｜划词翻译 · AI 语境查词`；H1：「任意网页，原文下方即见译文」
- zh-Hant title: `WordByWord - iPhone 網頁雙語對照翻譯｜劃詞翻譯・AI 語境查單字`
- ja title: `WordByWord｜Webページを対訳で読めるiPhone翻訳アプリ・文脈がわかるAI辞書`；H1：「どんなWebページも、原文のすぐ下に訳文を。」
- ko title: `WordByWord - 아이폰 웹페이지 번역 앱 | 원문·번역 같이 보기, AI 문맥 사전`
- 注意与 SE 的区隔：SE ja title 是「英語ニュースを対訳で読むアプリ」——WBW 用「Webページ / どんなサイトでも / 多言語」，**不写「英語ニュース」**；SE en 用 "Translation Below Every Sentence" 作卖点句——WBW 英文 H1 不要复用同一句式。

---

## 7. SurfEnglish 协同与防蚕食（任务 Q5）

### 7.1 SE 已占的关键词（`SurfEnglishWebsite/src/locales/*.json` 的 `meta.keywords`）【事实】
- en: bilingual news reader, read English news with translation, English news bilingual, sentence by sentence translation, parallel text reading app, translation below the original, language chunks, contextual dictionary, double-tap word meaning, learn English by reading news, English reading app iPhone
- zh-Hans: 英语新闻双语对照, 双语阅读app, 英语双语阅读, 逐句翻译, 逐句对照阅读, 中英对照阅读, 中英双语新闻, 段落翻译, 语言块标注, 语境释义, 双击查词, 上下文查词, 英语新闻阅读app, 看新闻学英语, iPhone英语阅读
- ja: 英語ニュース 対訳, 日英対訳 リーディング, 英日対訳アプリ, 逐文翻訳, 一文ずつ翻訳, 段落翻訳, 原文の下に訳文, 文脈辞書, 文脈語義, チャンク, スラッシュリーディング, ダブルタップ辞書, 英語ニュースアプリ iPhone, 英語多読
- ko/es/pt-BR/vi/th/id/ar/hi/zh-Hant 同构（新闻 + 双语 + 逐句 + 语境 + 语块 + 双击 + 学英语）。
- 另：`/learn-english-by-reading/`（en）keywords: learn English by reading, bilingual reading, English news with translation, sentence by sentence translation, parallel text, language chunks, contextual vocabulary, English reading app。
- SE 也宣称"Any website, read bilingually"（explore.title）与"内置浏览器"（about 描述）——**功能上 SE ⊇ WBW 的英语部分**。
- SE 支持 12 个站点语言（ar en es hi id ja ko pt-BR th vi zh-Hans zh-Hant）；de/fr/it/nl/pl/ru/tr/uk 无本地化页（`research/04-promo-current.md` 及 `js/surfenglish-promo.js:289-422` 中这些语言 `sitePath: ''`）。

### 7.2 重叠诊断【事实 + 推断】
WBW 现有 title/H3/FAQ 中的"逐句对照 / 双击查词 / 上下文 / 対訳 / 文脈 / bilingual reading / sentence-by-sentence"与 SE 关键词几乎一一对应。两站若都把这些词放进 title/H1，搜索引擎会在两个域名之间摇摆（同开发者、同功能描述），双方都难稳定排名【推断】。由于 SE 是未来主推，**这些"英语学习 + 逐句双语"词应让给 SE**。

### 7.3 关键词归属规则（建议）

| 归属 | 判定规则 | 示例 |
|---|---|---|
| **SE 独占** | 含"英语/English"+学习意图，或含 新闻/分级/语块/游戏/多读 | learn English by reading (news/articles)、English news with translation、英语新闻双语对照、看新闻学英语、中英对照读新闻、英語ニュース 対訳、英語多読、英語 リーディング アプリ、영어 원서/뉴스 읽기 앱、aprender inglés leyendo、đọc báo song ngữ、อ่านข่าวภาษาอังกฤษ พร้อมแปล、language chunks/语言块/チャンク |
| **WBW 独占** | 工具/翻译意图，或含 网页/网站/任意网站/X/Safari/iPhone 网页翻译，或非英语源语言，或竞品替代 | translate web page on iPhone (keep original)、bilingual web translation、iPhone 网页双语对照翻译、划词翻译 iOS、Webページ 対訳表示、X/Twitter 翻译、learn Japanese/Korean/Chinese by reading websites、Immersive Translate alternative iPhone、word by word translation app、20+ languages |
| **共享（必须加限定词）** | 逐句/双击/语境 这类功能词 | WBW 写"网页 + 逐句"、"任意语言 + 语境查词"；SE 写"英语新闻 + 逐句"、"英语单词语境释义" |

### 7.4 在 WBW 站内"兄弟推荐"的自然落点与锚文本

原则：**只在读者表现出"学英语"意图的地方推荐**；锚文本使用 SE 在该语言的核心词（让 WBW 的链接权重落在 SE 的主词上）；链接指向 SE 对应语言页；推荐内容静态写在 HTML 中（现方案为 JS 注入，见 `04-promo-current.md` §4.2）。

| 落点 | 文案思路（示例，需润色） | 锚文本（=SE 主词） |
|---|---|---|
| FAQ 新增一问："我主要想学英语，用哪个？" | en: "If English is your goal, our sister app SurfEnglish gives you real English news with levels, and keeps the translation below each sentence." | en: "read English news bilingually with SurfEnglish" |
| 语言支持段（F5）结尾 | zh: "WordByWord 适合读各种语言的网站；如果你专注学英语，可以试试同一开发者的 SurfEnglish。" | zh: 「英语新闻双语对照阅读 App：SurfEnglish」 |
| ja 同上 | 「英語学習が目的なら、同じ開発者の SurfEnglish もおすすめです。」 | ja: 「英語ニュースを対訳で読むアプリ SurfEnglish」 |
| ko | 「영어 공부가 목적이라면 같은 개발자의 SurfEnglish도 써 보세요.」 | ko: 「영어 뉴스 원문·번역 대역 읽기 앱 SurfEnglish」 |
| es / pt-BR / vi / th / id / ar / hi / zh-Hant | 同构 | 各自 SE `meta.appStoreName` / 首个 keyword（如 es "noticias en inglés con traducción"、vi "đọc tin tiếng Anh song ngữ"、th "ข่าวอังกฤษแปลคู่"） |
| de / fr / it / nl / pl / ru / tr / uk | SE 无本地化站点与 UI（SE 界面 12 语言）→ **弱化或省略**；若保留，链接到 SE 英文页并注明"App in English and 11 other languages" | en 锚文本 |
| 页脚 "More from the developer" | 两款 App 图标并列（使用现有 `img/surfenglish/` 素材，不新增） | "SurfEnglish – Bilingual News" |

**避免**：WBW 页面 title/H1/meta 中出现"学英语 / learn English / 英語学習"作为主词；WBW 的英语学习指南页（若有）与 SE `/learn-english-by-reading/` 同题。

**链接卫生**【推断】：同一开发者的编辑性推荐不需要 `nofollow`；现有 UTM（`utm_source=word-by-word.app…`，`js/surfenglish-promo.js:23`）可保留用于 GA，SE 页面已有 canonical（`dist/index.html` `<link rel="canonical" href="https://surfenglish.app/">`），参数 URL 不会造成重复；反向：SE about 页加一句"同一开发者另有多语言网页翻译 App WordByWord"，形成双向实体关联（SE 源码当前无任何 WordByWord 提及）。

---

## 8. 给设计阶段的落地建议

### 8.1 页面 × 目标关键词（不新增素材：纯文字 + 现有截图）
| 页面（每语言一份，按优先级） | 主关键词 | 次关键词 | 优先语种 |
|---|---|---|---|
| 首页 `/<lang>/` | F1 主词 + iPhone | F2 主词、品牌 "WordByWord" | 全部 21→20（合并 cn/zh） |
| 指南：在 iPhone 上翻译网页并保留原文 | translate web page iPhone keep original / iPhone 网页 双语对照 / webページ 翻訳 原文 iPhone | Safari 翻译的限制、对比 | en, ja, zh-Hans, zh-Hant, ko（T2 可选 es/de/fr/pt-BR） |
| 指南：iPhone 上双语读 X/Twitter | translate X posts iPhone / 推特 双语 翻译 / X 翻訳 原文 | 关注海外账号学外语 | en, ja, zh-Hans, zh-Hant, ko |
| 对比：Immersive Translate on iPhone vs WordByWord（诚实对比，参照 Bilingual Pages `/vs/` 结构） | immersive translate alternative iphone / 沉浸式翻译 替代 iPhone / イマーシブ翻訳 スマホ | — | en, zh-Hans, zh-Hant, ja |
| 解释：Word-by-word vs sentence-by-sentence translation | word by word translation (app) | literal translation、学习效果 | en（+zh/ja 可选） |
| 目标语言落地页（可选、限 2–4 个） | learn Japanese / Korean / Chinese by reading websites | Japanese↔English reader | en |
| About（实体页，参照 SE `/about/`） | WordByWord app / developer | 与 SE 的关系、去歧义 | en（+主要语种） |

### 8.2 优先级与理由
- **T1：en / ja / zh-Hans / zh-Hant / ko** —— iOS 份额高的市场【推断】，且已有 App Store 本地化元数据；ja/zh/ko 的"网页双语对照"需求明确（AC✓）。
- **T2：es / pt-BR / fr / de** —— 体量大但 "traducir página web iphone" 类被大站占；先保证首页本地化质量与 hreflang。
- **T3：vi / th / id / ru / tr / ar / hi / it / nl / pl / uk** —— 首页修正术语/错译即可，不做额外内容页。ru 受 Yandex、ko 受 Naver、大陆受 Baidu 影响，Google 优化效果有限【推断】；可考虑 Naver Search Advisor / Bing Webmaster 提交 sitemap【推断】。

### 8.3 度量
- 上线前：GSC 导出「国家 × 查询」「页面 × 查询」（`00-gsc-baseline.md` 已列为待补）。
- 上线后 4–8 周：看非品牌查询展示数（按语言目录分组）、"wordbyword" 品牌词排名不下降、"word by word" head term 展示可下降但 CTR 应上升；SE 推荐位点击用现有 GA 事件 `surfenglish_promo`（`README.md` 所述）。

---

## 9. 风险与待验证

| # | 风险 / 不确定点 | 级别 | 应对 |
|---|---|---|---|
| R1 | 无搜索量数据，竞争度为定性判断 | 中 | 用 GSC + 上线后数据迭代；必要时用 Keyword Planner 补 T1 语种 |
| R2 | 品牌混淆（WordByWord.io 等）短期内无法消除 | 中 | 实体标记 + 描述性后缀 + About 页；不改名的前提下接受部分混淆 |
| R3 | WBW 与 SE 互相蚕食 | 高（若不分工） | 按 §7.3 归属表写文案；WBW 页面审查清单："title/H1 不含 English/英语/英語" |
| R4 | 母语表达草案（§6.2）未经母语者校对 | 中 | 至少 T1 语种请母语者复核；T3 至少修正 §2.3 的明显错误 |
| R5 | "Immersive Translate" 对比页涉及他人商标 | 低-中 | 事实性、可验证、注明日期；不在 title 里蹭对方品牌（Trancy 反例） |
| R6 | 程序化页面（语言对/站点页）规模化导致薄内容 | 中 | 只做 2–4 个有实质内容的目标语言页 |
| R7 | App Store 英文描述遗留 "English concise submission version" | 低成本高收益 | App Store Connect 修改（非网站工作） |
| R8 | WebSearch 为 US SERP，非本地 SERP | 中 | ja/zh/ko 上线前用当地 IP 或 GSC 复核 |
| R9 | 【未验证】Kindle/Apple Live Translation 新功能对"iPhone 网页翻译保留原文"需求的侵蚀 | 低 | 持续观察 |

---

## 附录 A · 关键 autocomplete 原始输出（节选，2026-10-05）
- [en-us] word by word → word by word quran / meaning / book / the secret life of dictionaries / translation of quran / picture dictionary / translation / picture dictionary pdf / quran translation in english
- [en-us] bilingual reading app → bilingual reader app / bilingual book app / bilingual reading ebook app / best free bilingual reading app
- [en-us] translate web page iphone → …safari / translate a page iphone / translate web page ios / translate web page to english iphone
- [en-us] immersive translate ios → immersive translate app / app download / ipad / app store / app reddit / chrome ios / safari ios
- [en-us] learn japanese by reading → …manga / books / app / news / light novel / reddit
- [en-us] translate x posts → …to english / x translate posts automatically / auto translate x posts / x translate post not working
- [ja-jp] webページ 翻訳 iphone → webページ 翻訳 アプリ iphone；ウェブページ 翻訳 → chrome / やり方 / iphone / edge / 拡張機能 / safari / ipad / 中国語
- [ja-jp] 英語 サイト 翻訳 → iphone / アプリ / google / ai / edge / safari / できない / スマホ / ipad
- [ja-jp] イマーシブ翻訳 → 拡張機能 / 使い方 / 無料 / 動画 / スマホ / youtube / 安全 / アプリ
- [ja-jp] 逐語訳 → とは / 英語 / 直訳 違い / 読み方 / 例文 / 意訳 / 聖書
- [zh-CN] 双语对照 → 双语对照翻译 / 教材 / 英文；划词翻译 → 软件 / chrome / 软件推荐 / 工具 / mac / windows / github / 扩展 / app
- [Baidu] 网页翻译 → 插件 / 功能在哪 / 浏览器 / 软件免费 / app；双语阅读 → app / 网站；逐句翻译 → 滕王阁序/醉翁亭记/师说… （文言文）
- [zh-TW] 雙語對照 → 雙語對照網頁翻譯；沉浸式翻譯 → dcard / chrome / app / 安全 / ptt
- [ko-kr] 웹페이지 번역 → 확장프로그램 / ai / 번역기 / 추천 / 앱；대역 → 대역갤 / 대역전재판 / 대역폭（歧义）
- [es] traducir página web iphone → safari / automáticamente；aprender idiomas leyendo → libros / app para…
- [pt-BR] app para ler em inglês → livros grátis / textos / notícias / mangá / artigos
- [fr] traduire une page web iphone → safari / automatique / smartphone；apprendre l'anglais en lisant → application / histoires courtes
- [de] webseite übersetzen iphone → safari / ios 18 / ios 26 / firefox；englisch lernen durch lesen → app / zeitung
- [vi] đọc song ngữ → anh việt / tiếng anh / báo song ngữ / truyện / sách；dịch từng câu → chú đại bi（佛经）
- [th] แปลเว็บ → แปลเว็บไซต์ / แปลเว็บตูน / เป็นภาษาไทย；อ่านข่าวภาษาอังกฤษ → พร้อมแปล
- [id] aplikasi terjemahan → bahasa inggris / ke indonesia / suara / video
- [ru] параллельный перевод → приложение / книги / онлайн；перевод в контексте → переводчик в контексте
- [tr] ingilizce okuma uygulaması → kitap / makale / hikaye；web sitesi çeviri → otomatik / safari
- [ar] ترجمة المواقع → تلقائيا / في سفاري / بالذكاء الاصطناعي
- [hi-in] english reading app → free / for adults / for students；हिंदी अनुवाद → ऐप / करें

## 附录 B · 主要来源 URL
- WBW 官网 https://www.word-by-word.app/ ；App Store https://apps.apple.com/us/app/id6741724502 （及 jp/cn/tw/kr/es/br/fr/de/ru、vn?l=vi、th?l=th、id?l=id、tr?l=tr、sa?l=ar）
- 竞品：https://immersivetranslate.com/en/ ，/zh-Hans/，/ja/，/en/webpage/x-twitter-website-translator/，https://immersivetranslate.com/sitemap.xml ；https://www.lingq.com/en/ ，/en/learn-japanese-online/ ；https://readlang.com/ ；https://www.languagereactor.com/ ；https://jointoucan.com/ ；https://www.trancy.org/ ；https://www.deepl.com/en/ios-app ；https://bilingualpages.com/en/vs/readlang ；https://wordbyword.io/en ，https://wordbyword.io/sitemap.xml ；Mate https://apps.apple.com/us/app/language-translator-by-mate/id1073473333
- 歧义：https://en.wikipedia.org/wiki/Literal_translation ；https://apps.apple.com/us/app/quran-word-by-word-translation/id1450748510 ；https://apps.apple.com/us/app/rapid-reader-word-by-word/id6757988217 ；https://chromewebstore.google.com/detail/wordbyword-%E2%80%93-vocabulary-h/nnikiceohfnfopndpmmkkeojiijhcbbg
- how-to SERP 样本：https://www.macrumors.com/how-to/safari-webpage-translation-ios/ ；https://xtech.nikkei.com/atcl/nxt/column/18/00088/00107/ ；https://support.google.com/translate/answer/2534559?hl=ja&co=GENIE.Platform%3DiOS ；https://forest.watch.impress.co.jp/docs/review/2002718.html
- X 扩展限制：https://github.com/Zhao73/x-translator
- 中文替代讨论：https://zhuanlan.zhihu.com/p/1938155932451308390 ；https://linux.do/t/topic/853954 ；https://www.kocpc.com.tw/archives/644615
- 本地文件：`/Users/ike/Dev/WordByWord/wordbyword-web/{index,ja-top,cn-top,…}.html`、`js/surfenglish-promo.js`、`/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite/src/locales/*.json`、`dist/learn-english-by-reading/index.html`、`dist/about/index.html`、`/Users/ike/Dev/WordByWord/WordByWordPrototype/Localizable.xcstrings`
