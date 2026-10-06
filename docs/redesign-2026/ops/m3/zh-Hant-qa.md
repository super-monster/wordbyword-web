# M3 · zh-Hant（繁體中文，台湾）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | zh-Hant（T1，定稿级；按 H7 交外部母语审校，审校人须熟悉台湾用语） |
| 交付 | `src/locales/zh-Hant.json`（新建）。`src/data/glossary/zh-Hant.json` 已存在，**未改动**（补充建议见 §6 第 7 条） |
| 依据 | 文档 08 §7（7.2.4 台湾用语表、7.3 zh-Hant 行、7.7、7.8）、§2 en 母版；文档 03 §1.4/§1.5/§2.2/§3.5/§3.9；文档 04 §5.5/§5.7；裁定 R36、R39–R43、R46、R61–R65、R71、R75–R78、R83；`zh-Hans.json` 只作结构参照（未做繁简转换，I18-07） |
| 工作方式 | 私有副本构建（scratchpad 下 `wbw-m3-zh-Hant/`），未在真实仓库构建；OG 图只在副本里生成，未复制进真实仓库 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys zh-Hant`：0 缺、0 多）；副本 `node build.mjs` 与 `--pseudo` 均 **0 error**，zh-Hant 只剩 1 条预期内的 L-4 warning（样张里照抄的英文值，文档 08 §1.5 列为正常）；`scripts/check.mjs` 0 error / 0 warning。
2. L-13 术语检查 0 违规：没有大陆用语、没有简体专用字、没有日文中点「・」。另外人工排查了 glossary 之外的常见大陆用语（帖子、關注、運行、插件、擴展、幫助、訪問、保存等），正文已改用台湾说法（貼文、追蹤、使用、擴充功能、說明、儲存）。
3. title / description / H1 用文档 03 §3.9 的 zh-Hant 草案：title 逐字照用（w32，正好到上限）；description 只做了语感润色（w80）；H1 文字与草案一致，只加了 `{wbr}`。
4. 断行：375 px 与 1280 px 下 H1、功能区 H2、多个 H3 和 H2 都在词中断开（「原文不／動」「點兩下單／字」「網頁翻／譯」「讀／得多」「「更／多釋義」」，以及行首出现「的」），按 zh-Hans 的 M2-11 先例加了 `{wbr}`，并在 5 个标题里用了不换行空格。复测 320 / 375 / 768 / 1280 px，所有标题都在短语边界换行（§7）。
5. OG 图（只在副本里）：`node scripts/og.mjs --only home-zh-Hant` 通过，标题字号 60 px × 2 行，与 zh-Hans 现状相同（文档 05 §7.8 的目标是 64 px，脚本只提示、不报错）。
6. **需要负责人处理的事有两件**（§6 第 1、2 条）：① zh-Hant.json 进入真实仓库后，`scripts/tests/validate.test.mjs` 会有 3 个测试失败，原因是测试夹具写死了"zh-Hant 未发布"；② 生成 OG 图之前，真实仓库的构建会报 D-23。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | 「WordByWord翻譯：iPhone 網頁雙語對照 App｜右滑即譯，AI 語境查單字」 | 品牌位「WordByWord翻譯」（文档 03 §1.5，TW 店面名，本身带"翻譯"）；K1「網頁雙語對照（翻譯）App」+「iPhone」；K1 次词「右滑翻譯」（以「右滑即譯」出现）；K2 主词「AI 語境查單字」；`seo.titleMust` 四个词元 iPhone / 網頁 / 雙語對照 / App 全部命中 | w32（上限 32） |
| `meta.description` | 「WordByWord 是為外語學習者設計的 iPhone／iPad 網頁雙語閱讀 App：在內建瀏覽器裡向右滑動段落，譯文就插在原文下方；點兩下單字，AI 會依上下文解釋它的意思。免費使用。」 | 定位词「外語學習者」（R39）；K1 品类「網頁雙語閱讀 App」；K1 动作 + 结果（向右滑動段落 → 譯文插在原文下方）；「內建瀏覽器」（文档 03 §3.2）；K2 动作（點兩下單字 → AI 依上下文解釋）；K10「免費」；平台词 iPhone（SEO-11） | w80（区间 50–90） |
| `hero.title`（H1） | 「iPhone [[網頁雙語對照]]：向右滑動段落，原文不動，譯文插在下方。」 | K1 核心名词「網頁雙語對照」（荧光笔 6 字，R65）；"段落"一级的动作 + 结果（R46、PRO-19），不暗示整页；不含品牌（R27） | w29.5（上限 32） |
| `hero.eyebrow` | 「WordByWord · 外語學習者的網頁雙語閱讀 App」 | 品牌 + 受众 + 品类 | 41 wu（上限 60） |
| `hero.lede` = `ledeShort` | 「WordByWord 是一款為外語學習者設計的 iPhone／iPad 閱讀助手，幫你用真實網頁學外語。」 | R39 定义句（取文档 03 §3.5 zh-Hant 定义句的首句） | w40.5（上限 45） |
| `meta.ogHeadline` | 「iPhone 網頁雙語對照：[[原文不動，譯文在下]]」 | K1 核心名词；荧光笔 1 处 | 60 px × 2 行 |
| 功能区 H2 | 「右滑翻譯，點兩下查單字：平常讀的網頁都能雙語對照」 | K1「右滑翻譯」「雙語對照」+ K2 次词「點兩下查單字」；不写"任何網頁都能查單字"（PRO-16） | — |
| 功能 H3 | 「AI 語境查單字：…」（K2）、「AI 句子結構解析：外語長句一眼看懂」（K4）、「翻譯與查單字紀錄，隨時回顧」（K6）、「雲端翻譯或 iOS 本機翻譯」（K7）、「在內建瀏覽器裡雙語看 X（推特）貼文」（K9）、「AI 朗讀，或用更快的 iOS 內建語音」（K3）、「語言塊提取與句子動作脈絡（Action Flow），僅限英文」（K5，带"英文"限定，R83） | 文档 03 §2.2 zh-Hant 表 | — |
| 语言段 H2 | 「21 種語言網頁翻譯，不限英文網頁」 | K8 主词「21 種語言網頁翻譯」 | 31 wu |
| 价格段 H2 | 「每天免費用，讀得多再升級 Plus」 | K10 | — |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（學英文、英文學習、英文新聞、英文閱讀、語塊、語言塊）；title / H1 / description / `cta.title` 里没有 G1 的 how-to 句式（怎麼、如何、方法）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys`：0 缺、0 多）；副本 build / `--pseudo` 均 0 error，`check.mjs` 0 error。真实仓库在生成 OG 图前会报 D-23，测试有 3 项失败，见 §6 第 1、2 条 |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用了 `@about`、`@chrome`、`@se-site`（都在白名单里）；没有写死额度、价格、语言数（L-12 0 条）；中文的 CLDR 复数只有 other，不需要复数对象（文档 08 §1.4） |
| Q3 | ✓ | title 以品牌位「WordByWord翻譯」开头，四个 titleMust 词元齐全；K1 是产品 / 品类意图；没有文档 03 §1.4 的禁用主词，也没有 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[網頁雙語對照]]`（6 个字）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以「WordByWord 是…」开头，写明「為外語學習者設計」 |
| Q5 | ✓ | §1.1 红线逐行核对：整页 / 一键翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展只出现在 FAQ `safari` 的否定回答里；没写离线、无限 AI 发音、暗色模式、生词本、账号同步、"Plus 专属"、样式数量；CJK 不能双击查词写在 L2 附註、语言段、FAQ 三处；Chunks / Action Flow 写明仅英文。L-14 0 条 |
| Q6 | ✓ | kicker：「右滑翻譯」「雙擊查詞」（glossary 必用词，X13）；`demo.ui.more`、价格表行名用「更多釋義」（X1 修正）；App 按钮名照 App 原文：「取得 AI 句法解析」「立即升級」「恢復購買」「AI朗讀」「本地朗讀」「本地引擎」「右滑翻譯歷史」（「本地…」只在引号里，正文用「本機」）；正文手势写「向右滑動」「點兩下」；§7.2.4 对照表全部遵守，L-13 0 条 |
| Q7 | ✓ | 9 处截图 alt / 图注都描述了 en 截图里的实际内容，并注明「英文介面」（逐张对照了 `assets/img/shot/en/*`）；`common.screenshotLabel` / `screenshotExcerptLabel` 也加了「（英文介面）」（文档 05 §7.5 ③"图注注明"）；`features[x].alt` 描述社交帖样张并注明「不是截圖」；`demo.lookup.word` = end，出现在 `demo.source[1]` 里 |
| Q8 | ✓ | `seMode` = local（`seLocalePath` 有 zh-Hant → `surfenglish.app/zh-hant/`）；卡片 H2 以 SurfEnglish 开头；body 首句是条件句「在學英文嗎？」，叙事是"互补、也值得一试"（「也不妨試試」），没有「升級／取代／新／更適合你」；卖点只用 R41 的三项；`note` 按 full 模式写「App 介面支援繁體中文等 {se.uiLanguages} 種語言」；`linkText` 是 SE 核心词短语 + 品牌，不是裸域名；`appStoreLinkText` 不含 →；页脚 heading / linkText 取文档 04 §5.5 |
| Q9 | ✓ | 全部在 §7.6 / L-8 限内（代入占位符后实测）：title w32、description w80、H1 w29.5、lede w40.5、how w55.5、规格清单 4 条 w29–35（≤40）、SE 卡片 body w76（≤110）、H2 w18.5（≤24）、linkText w18.5（≤30）、所有 alt ≤ 73 字符（≤125） |
| Q10 | ✓ | 标点用全角，引号用「」，中文与拉丁字母 / 数字之间有半角空格（品牌位「WordByWord翻譯」和 App 名「AI朗讀」照原文不加）；没有「・」；`{wbr}` 偏离了 §7.7"zh-Hant 不加"的默认写法，按简报沿用 zh-Hans 的 M2-11 先例，见 §7 |
| Q11 | 待办 | 按 R36 / H7，上线前由外部母语审校（熟悉台湾用语） |
| Q12 | ✓（副本） | 用 headless Chrome 看了 320 / 375 / 768 / 1280 px：没有溢出，字体没有回落成方框，标题断行见 §7 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）没写扩展名称；`aExtLive` 写了名称，并注明只从该页面链接安装；首页没出现 WordByWord.io（`footer.notAffiliated` 只在 about / 扩展页渲染） |

## 3. 回译对照（zh-Hant → English，对照 en.json）

| 键 | zh-Hant | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord翻譯：iPhone 網頁雙語對照 App｜右滑即譯，AI 語境查單字 | WordByWord Translate: bilingual side-by-side web page app for iPhone \| swipe right to translate, AI word lookup in context | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | （见 §1） | WordByWord is a bilingual web-reading app for iPhone/iPad designed for foreign-language learners: swipe right on a paragraph in the built-in browser and the translation is inserted right below the original; double-tap a word and AI explains what it means from the context. Free to use. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | iPhone 網頁雙語對照：[[原文不動，譯文在下]] | Bilingual web pages on iPhone: [[the original stays put, the translation goes below]] | Read any web page bilingually. [[Keep the original.]] |
| hero.title | iPhone [[網頁雙語對照]]：向右滑動段落，原文不動，譯文插在下方。 | iPhone [[bilingual web pages]]: swipe a paragraph to the right — the original stays where it is, the translation is inserted below. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord 是一款為外語學習者設計的 iPhone／iPad 閱讀助手，幫你用真實網頁學外語。 | WordByWord is an iPhone/iPad reading assistant designed for foreign-language learners; it helps you learn languages with real web pages. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | 用內建瀏覽器開啟任何網頁，向右滑動一段文字，譯文就會插在原文下方；點兩下單字，AI 會依照所在的句子解釋它的意思。 | Open any web page in the built-in browser and swipe right on a passage: the translation is inserted below the original. Double-tap a word and AI explains what it means in its sentence. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | 右滑翻譯，點兩下查單字：平常讀的網頁都能雙語對照 | Swipe to translate, double-tap to look up words: the web pages you usually read can all be read side by side | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | 右滑翻譯：譯文插在原文下方，逐段或逐句對照 | Swipe to Translate: the translation is inserted below the original, paragraph by paragraph or sentence by sentence | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | AI 語境查單字：點兩下單字，看懂它在這句話裡的意思 | AI word lookup in context: double-tap a word to understand what it means in this sentence | Double-tap a word for its AI meaning in context |
| features[x].title | 在內建瀏覽器裡雙語看 X（推特）貼文 | Read X (Twitter) posts bilingually in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | 語言塊提取與句子動作脈絡（Action Flow），僅限英文 | Chunk Extraction and Sentence Action Flow (Action Flow), English only | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | AI 朗讀，或用更快的 iOS 內建語音 | AI read-aloud, or the faster built-in iOS voices | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | AI 句子結構解析：外語長句一眼看懂 | AI sentence structure analysis: long foreign-language sentences, clear at a glance | AI sentence structure analysis for long sentences |
| features[engines].title | 雲端翻譯或 iOS 本機翻譯 | Cloud translation or on-device iOS translation | Cloud or on-device translation |
| features[display].title | 譯文怎麼排、用什麼樣式，你來決定 | You decide how translations are laid out and which style they use | Translation layout and style |
| features[history].title | 翻譯與查單字紀錄，隨時回顧 | Translation and word-lookup history, to look back on any time | Translation and lookup history |
| features[devices].title | iPhone、iPad、Mac、Vision Pro | iPhone, iPad, Mac, Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | WordByWord 是什麼？ | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | WordByWord 能在 iPhone 上一鍵翻譯整個網頁嗎？ | Can WordByWord translate a whole web page in one tap on iPhone? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | 可以在 Safari 或其他 App 裡使用嗎？ | Can I use it in Safari or other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | WordByWord 是逐字翻譯工具嗎？ | Is WordByWord a word-by-word translation tool? | Is WordByWord a word-by-word translator? |
| faq[x].q | 可以用 WordByWord 看 X（推特）嗎？ | Can I read X (Twitter) with WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | WordByWord 支援哪些語言？ | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | WordByWord 免費嗎？每天可以用幾次？ | Is WordByWord free? How many times a day can I use it? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | 用的是哪種翻譯引擎？ | Which kind of translation engine does it use? | Which translation engine does it use? |
| faq[account].q | 使用 WordByWord 需要註冊帳號嗎？ | Do I need to sign up for an account to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | 換了新的 iPhone 或 iPad，要怎麼恢復 WordByWord Plus？ | I got a new iPhone or iPad — how do I get WordByWord Plus back? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | 有 Android 版嗎？ | Is there an Android version? | Is there an Android version? |
| faq[english-learner].q | 我在學英文，SurfEnglish 也值得一試嗎？ | I'm learning English. Is SurfEnglish worth a try too? | I'm learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | WordByWord 可以在 iPad、Mac 或電腦瀏覽器上使用嗎？ | Can WordByWord be used on iPad, Mac or a computer's browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| pricing.summary | 額度內所有功能都免費；Plus 可提高額度，美國售價每月 {plus.priceUS}。 | Within the allowance every feature is free; Plus raises the allowance — US price {plus.priceUS} a month. | Every feature is free within these limits; Plus raises them for {plus.priceUS}/month (US). |
| sibling.card.eyebrow | 來自 WordByWord 的開發者 | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish：符合你程度的每日英文新聞 | SurfEnglish: daily English news that matches your level | SurfEnglish: daily English news at your level |
| sibling.card.body | 在學英文嗎？想讀的任何網頁，照樣可以用 WordByWord 讀；也不妨試試 SurfEnglish：每天依程度分級的英文新聞，加上複習小遊戲，右滑翻譯和雙擊查詞的用法都一樣。 | Learning English? Keep reading any page you want with WordByWord, and you might also try SurfEnglish: daily English news graded by level plus review mini-games, with swipe-to-translate and double-tap lookup working the same way. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | {se.levels} 分級的真實英文新聞／用你讀過的內容生成的複習遊戲／從 Safari 把英文文章分享到 App 裡讀 | Real English news graded A1–C1 / Review games generated from what you've read / Share English articles from Safari into the app to read | Real English news at levels {se.levels} / Review games built from what you've read / Share English articles from Safari to the app |
| sibling.card.note | 免費開始使用 · iPhone／iPad · App 介面支援繁體中文等 {se.uiLanguages} 種語言 · 可譯成 {se.targetLanguages} 種語言 | Free to start · iPhone/iPad · App interface in 12 languages including Traditional Chinese · Translates into 21 languages | Free to start · iPhone and iPad · App in {se.uiLanguages} languages · Translations into {se.targetLanguages} |
| sibling.card.linkText | 用 SurfEnglish 雙語對照讀分級英文新聞 | Read graded English news side by side with SurfEnglish | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | 在 App Store 取得 SurfEnglish | Get SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish 的遊戲頁：可以用存下來的句子和單字玩 Sentence Builder 與 Word Raid | SurfEnglish's Games page: play Sentence Builder and Word Raid with the sentences and words you saved | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | SurfEnglish 截圖（英文介面） | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading | 同一開發者的其他 App | Other apps by the same developer | More from the maker |
| sibling.footer.linkText | SurfEnglish：英文新聞·雙語對照 | SurfEnglish: English News · Bilingual (SE 的 TW 店面名，文档 04 §5.5) | SurfEnglish: Bilingual News |
| cta.title | 在 iPhone 上開始雙語閱讀外語網頁 | Start reading foreign-language web pages bilingually on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | 右滑翻譯 · 雙擊查詞 · AI 朗讀 · 可譯成 {targetLanguages} 種語言 | Swipe to Translate · Double-tap to Look Up · AI read-aloud · Translates into 21 languages | Swipe to translate · Double-tap to look up · Read aloud · {targetLanguages} languages |

### 3.1 与 en 的事实偏差

目标是 0 条。下面列出的都是有意为之、出处可查的差异，没有新增产品主张：

1. `meta.appStoreSubtitle` 写成「右滑翻譯 AI 解釋」，TW 店面的实际副标题是「滑動翻譯 AI 解釋」。原因：glossary 的 X13 禁用「滑動翻譯」（L-13 会报 error）。这个键只在 about 页（仅 en）渲染，zh-Hant 页面上不出现。是否逐字照录由负责人决定，见 §6 第 3 条。
2. `hero.lede` 比 en 多了半句「幫你用真實網頁學外語」，出处是 R39 定位句与文档 03 §3.5 的 zh-Hant 定义句；不是新功能。
3. `hero.platformNote` 不写美区价格，只写「Plus 為每月訂閱」（D2，与 zh-Hans 相同）。
4. `cta.recap` 的「AI 朗讀」比 en 的 "Read aloud" 范围窄（en 也包括 iOS 语音），与 zh-Hans 相同，取的是 K3 主词。
5. 指向英文页面的两处链接文字加了「（英文頁面）／（英文）」（FAQ `what-is` → `/about/`，FAQ `devices` → `/chrome-extension/`）。这是页面语言的事实说明。
6. 截图标签和图注都加了「（英文介面）」（文档 05 §7.5 ③）。

## 4. 没把握的措辞（10 处，附回译与替代写法）

| # | 键 | 现写法（回译） | 没把握的原因 | 替代写法（回译） |
|---|---|---|---|---|
| 1 | `features[speech].text` | 「也能使用你已下載的 Premium 或 Enhanced 高品質語音」（can also use Premium or Enhanced high-quality voices you have downloaded） | iOS 繁中界面里这两档语音的正式叫法我不能确定（可能是「高音質」「增強版」一类），所以先保留 Apple 的英文档名 | 「也能使用你已下載的高品質（Premium）或增強版（Enhanced）語音」 |
| 2 | `hero.lede` | 「…iPhone／iPad 閱讀助手，幫你用真實網頁學外語。」（a reading assistant … that helps you learn languages with real web pages） | 「閱讀助手」直译自 en，台湾读者可能觉得泛；zh-Hans 定稿用的是品类说法 | 「WordByWord 是一款為外語學習者設計的 iPhone／iPad 網頁雙語閱讀 App。」（a bilingual web-reading app … designed for language learners） |
| 3 | `hero.eyebrow` | 「WordByWord · 外語學習者的網頁雙語閱讀 App」（Bilingual web-reading app for language learners） | 原本写「為外語學習者設計的…」，375 px 下会在「閱／讀」之间断开（zh-Hans 现在也是这样）；缩短后 375 px 能放进一行，但语气略显电报体 | 「WordByWord · 為外語學習者設計的網頁雙語閱讀 App」（375 px 下会在词中断行） |
| 4 | `common.contactUs`、`footer.contact` | 「聯絡開發者」（Contact the developer） | 台湾网站惯用「聯絡我們」，但 §7.4 规定开发者用第三人称、不写"我们" | 「聯絡我們」（Contact us） |
| 5 | `pricing.table.rows.localSwipe` / `localVoice` | 「右滑翻譯 · 本機引擎」「iOS 內建語音（本機朗讀）」（Swipe translation · on-device engine / built-in iOS voice (on-device read-aloud)） | App 里叫「本地引擎」「本地朗讀」；按 §7.2.2 规则 ① 表格行名应用 App 叫法，但 glossary 禁止不加引号的「本地…」，所以用了台湾说法「本機」 | 「右滑翻譯 · 「本地引擎」」「iOS 語音（「本地朗讀」）」（引号里写 App 原名） |
| 6 | `featuresIntro.title` | 「右滑翻譯，點兩下查單字：平常讀的網頁都能雙語對照」（… the pages you usually read can all be read side by side） | 比 en 多了「都能雙語對照」的结论句 | 「右滑翻譯、點兩下查單字，就在你平常讀的網站上」（Swipe to translate, double-tap to look up — right on the sites you usually read） |
| 7 | `meta.ogHeadline` | 「原文不動，譯文在下」（original stays put, translation below） | 「在下」偏简省；改成「在下方」后 OG 标题会再缩小一档 | 「原文不動，譯文就在下方」（the translation is right below） |
| 8 | `features[x].kicker` / 正文 | 「X（推特）」「貼文」（X (Twitter), posts） | 台湾也常写「X（前推特）」或「推文」；文档 03 K9 用「X（推特）」 | 「X（舊稱推特）」「推文」 |
| 9 | `pricing.table.perDay` | 「{n} 次／天」（{n} times / day） | 「每天 {n} 次」更口语，但会把表格第一列挤窄，375 px 下出现「雲／端引擎」这样的词中断行 | 「每天 {n} 次」（{n} times a day） |
| 10 | `demo.lookup.meaning` | 「（end up + -ing）結果、最後（做了某事）；這裡指不知不覺就讀到了中午」（(end up + -ing) end up (doing sth); here: ended up reading until noon without noticing） | 台湾英语教学常写「end up + V-ing：最後（落得）…」，写法不统一 | 「（end up + V-ing）最後竟然（做了某事）；…」 |

## 5. 台湾用语处理要点（给审校人）

- 必用词照 §7.2.4：支援、介面、預設、偵測、取得、設定、內建、搜尋、連結、選單、帳號、登入、分頁、書籤、部落格、文件、片語、點一下、單字、使用者／你、網路；此外：儲存（不用「保存」）、追蹤（不用「關注」）、貼文、擴充功能、說明（Help）、隱私權政策、服務標章、搭載 Apple 晶片的 Mac、Apple 帳號、透過。
- App 按钮名照 App（规则 ④）：「雙擊查詞」「右滑翻譯」「更多釋義」（X1 修正后）、「語言塊提取」「句子動作脈絡」「取得 AI 句法解析」「AI朗讀」「本地朗讀」「本地引擎」「右滑翻譯歷史」「立即升級」「恢復購買」。句子里的动作一律写「點兩下」「向右滑動」。
- 「恢復購買」是 App 的 zh-TW 原文；Apple 台湾支援文件一般写作「回復購買項目」（待审校确认）。如果审校认为 App 按钮名本身要改，属于 App 侧问题（文档 08 §7.2.2 ③），网站继续照 App 原文引用。

## 6. 需要负责人决定的问题

1. **测试夹具（阻塞 CI）**：zh-Hant.json 进入仓库后，`node --test scripts/tests/*.test.mjs` 会有 3 项失败（没有 zh-Hant.json 时 58/58 通过，在副本里核实过）：
   - `validate.test.mjs:166`：断言 `check.mjs --keys` 输出里有 `zh-Hant  (no src/locales/zh-Hant.json`，需要换成一个仍未发布的 locale，或者改成不依赖具体 locale 的写法；
   - `validate.test.mjs:449` "D-2 hreflang clusters"：断言 `/ja/ (ja): 3 hreflang links, expected 4`，zh-Hant 发布后实际是 "4 …, expected 5"；
   - "every rule L-1…L-14 and D-1…D-24 was caught by a broken sample"：上一条失败后连带失败。
   按简报，测试文件我没有改。之后每加一个 locale，这两处夹具都还会失效。
2. **OG 图**：按简报没有把 OG 文件复制进真实仓库。生成前真实仓库构建会报 `D-23 home-zh-Hant: no OG image`（在真实仓库的副本里加上本文件实测过，只有这 1 条 error）。审校定稿后运行 `node scripts/og.mjs --only home-zh-Hant`；副本里渲染通过，标题 60 px × 2 行，与 zh-Hans 一致。
3. **`meta.appStoreSubtitle`**：TW 店面原文是「滑動翻譯 AI 解釋」，与 X13 冲突。两个选择：(a) 保持现在的「右滑翻譯 AI 解釋」，并建议 App 侧把 TW 副标题也改为「右滑翻譯」；(b) 逐字照录，同时在 glossary 的 `滑動翻譯` 禁用项上加 `"allowInKeys": ["meta.appStoreSubtitle"]`。
4. **`{wbr}` 与不换行空格**：§7.7 / R61 的默认写法是 zh-Hant 不加 `{wbr}`。按简报和 zh-Hans 的 M2-11 先例，本稿给 16 个标题加了 `{wbr}`，并在 5 个标题里用了不换行空格（JSON 中写作 `\u00a0`：「App 裡」「21 種」「升級 Plus」「在 iPhone 上」，以及 FAQ 标题里的「WordByWord 的」）。文档 08 §7.7 的 zh-Hant 行可能需要同步。
5. **链接文字里的「（英文頁面）」**：ja / zh-Hans 都没有这样标注。是否保留，或者全站统一，由负责人决定。
6. **截图回落（H11 / R33）**：本稿按默认用 en 截图写 alt 和图注。如果改用 zh-Hans 截图，9 处 alt / 图注要重写（改为描述简体界面）。
7. **glossary 补充（建议，未改动）**：现有 `required` 只有 6 项。建议按 zh-Hans 的做法把本稿用到的 App 叫法锁定：

```json
"required": {
  "features[x].kicker": "X（推特）", "features[chunks].kicker": "英文網頁", "features[speech].kicker": "朗讀",
  "features[syntax].kicker": "句法解析", "features[engines].kicker": "翻譯引擎", "features[display].kicker": "顯示",
  "features[history].kicker": "紀錄", "features[devices].kicker": "裝置", "features[chunks].sample.flowLabel": "Action Flow",
  "pricing.table.rows.cloudSwipe": "右滑翻譯 · 雲端引擎", "pricing.table.rows.localSwipe": "右滑翻譯 · 本機引擎",
  "pricing.table.rows.lookup": "雙擊查詞（AI 釋義）", "pricing.table.rows.lookupSpeech": "AI 發音 · 單字",
  "pricing.table.rows.swipeSpeech": "AI 發音 · 整句", "pricing.table.rows.localVoice": "iOS 內建語音（本機朗讀）",
  "pricing.table.rows.syntax": "AI 句法解析"
},
"contains": {
  "faq.items[restore].a": ["立即升級", "恢復購買"], "features[syntax].text": ["取得 AI 句法解析"],
  "features[speech].text": ["AI朗讀", "本地朗讀"], "features[chunks].text": ["語言塊提取", "句子動作脈絡"],
  "features[lookup].bullets[2]": ["更多釋義"]
}
```

另可加禁用项 `{ "pattern": "(點按|點擊|單擊|輕點)(單字)?查詞", "regex": true, "use": "雙擊查詞" }` 和 `{ "pattern": "更多定義", "use": "更多釋義" }`（与 zh-Hans glossary 对应）。

## 7. 断行检查（`{wbr}` 落点与结果）

方法：用 `scripts/serve.mjs` 起本地服务，headless Chrome 通过 CDP 逐字读取每个 h1 / h2 / h3 的行框。不加标记时在词中断开的标题：H1「原文不／動」（375 与 1280 px）、L2 H3「點兩下單／字」、语言段 H2「網頁翻／譯」、价格段 H2「讀／得多」（375 px）、画廊 H2「「更／多釋義」」（375 px）、FAQ H2 行首是「的」（1280 px）。加标记后的结果（375 px）：

- H1：iPhone 網頁雙語對照：／向右滑動段落，／原文不動，譯文／插在下方。（1280 px 相同，与 zh-Hans 一致；768 px 为 2 行；320 px 时「iPhone」单独一行）
- 功能区 H2：右滑翻譯，點兩下查單字：／平常讀的網頁都能雙語對照
- L1 / L2 H3：右滑翻譯：譯文插在／原文下方，逐段或逐句對照；AI 語境查單字：點兩下單字，／看懂它在這句話裡的意思
- 画廊 H2：App 裡的設定、／「更多釋義」與語言選擇；语言段 H2：21 種語言網頁翻譯，／不限英文網頁；价格段 H2：每天免費用，／讀得多再升級 Plus
- SE 卡片 H2：SurfEnglish：／符合你程度的每日英文新聞；FAQ H2：關於 WordByWord 的常見問題（1280 px：關於 WordByWord 的／常見問題）；CTA H2：在 iPhone 上／開始雙語閱讀外語網頁

320 / 375 / 768 / 1280 px 下，所有标题都在短语边界换行。
