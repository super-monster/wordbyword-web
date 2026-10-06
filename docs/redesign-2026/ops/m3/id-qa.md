# M3 · id（Bahasa Indonesia）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | id（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校） |
| 交付 | `src/locales/id.json`（新建：首页全部键 + `notfound.*`；id 没有 about / 扩展页 / legal 页，与 es、it 一样不交付 `about`、`chromeExtension`、`legal`）；`src/data/glossary/id.json`（新建，§7.2.5 格式）；`docs/redesign-2026/ops/m3/id-lint.json`（claims-lint / keyword-map 的 id 词表提案，未合并）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（id 行，表 A / B / C）、§3.1–§3.9（id 草案）；文档 04 §4、§5.1、§5.5、§5.7（id 的 linkText 种子、页脚、T1–T11）；裁定 R36、R39–R43、R46、R52、R61–R65、R71、R75–R78、R83、R84；ja / zh-Hans 作结构参照，es / pt-BR / it / nl 的 QA 记录作流程参照 |
| App 叫法来源 | `WordByWordPrototype/Localizable.xcstrings` 的 `localizations.id`（271 个键，逐条核对 T-A…T-E，抽取结果存于 scratchpad `id-xcstrings.tsv`）；价格表行名对照 App 自己的 Free / Plus 对比表（`FeatureQuotaManager.swift` `featureDisplayName`）；徽章文字按 `assets/badges/id-id.svg` 本地渲染核对（"Download di App Store"）；SE 用词对照 `SurfEnglishWebsite/src/locales/id.json` |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-id/` 写作、构建、渲染检查；最终校验在新副本 `scratchpad/wbw-m3-id-final/`（真实仓库 **HEAD f44fd7e** 的 `git archive` + 本次两个文件 + 副本内生成的 `home-id` OG）上完成，lint 提案另在 `wbw-m3-id-final-lint/`（同上 + 合并 `id-lint.json`）验证。OG 图只在副本里生成，**没有**复制进真实仓库 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys id`：0 缺、0 多）。新副本（HEAD f44fd7e + id 两个文件 + 副本内 OG）：`node build.mjs` **0 error**，`--pseudo` **0 error**，`node --test scripts/tests/*.test.mjs` **62/62**，`scripts/check.mjs` **0 error / 0 warning**。
2. id 自己的 warning：L-8 两条 kicker 超长（App 叫法：`Geser untuk Menerjemahkan` 25、`Ketuk dua kali untuk Mencari` 28，> 24，见 §6-3）；L-4 `common.menu` = "Menu"（印尼语本来就是这个词）。真实仓库的数据文件还缺 id 词表，所以另有 L-14（26 条规则"未覆盖"）和 L-9（无 G1 how-to 模式）两条汇总 W；把 `id-lint.json` 并进副本后这两条消失，id 文案 0 命中（附录 A、B）。
3. title 逐字用文档 03 §3.9 草案（n56）；description 只做语感微调（n160）；H1 在草案基础上改了结果分句，使 390 px 下从 6 行降到 4 行（与 en 同高，样张红条位置与 en 相同，§1、§7）。
4. **手势**：右滑一律写 **geser**（X12：App 的功能标题是 "Gesek untuk Menerjemahkan"，提示语却是 "Geser ke kanan…"；网站 kicker / 价格表写修正后的 "Geser untuk Menerjemahkan"，glossary 禁用 gesek）；句中写 "geser paragraf ke kanan"；双击写 "ketuk dua kali"（App 原文）。称谓 **Anda**（§7.3），全页无 kamu。
5. SE：`seMode('id') = local`（文档 08 §7.8 的 full）。卡片与 FAQ 链 `https://surfenglish.app/id/`（hreflang id），note 写"界面 12 种语言，含印尼语"（T6），linkText 用文档 04 §5.7 种子 "Berita bahasa Inggris dengan terjemahan — SurfEnglish"，App Store 文字链接 "Download SurfEnglish di App Store"（T8：Apple 印尼语徽章的动词），页脚 "Dari pengembang yang sama · SurfEnglish: Berita Inggris"（文档 04 §5.5）。
6. **复数**：`Intl.PluralRules('id')` 只有 `other` 一个类别，印尼语名词在数词后不变形；按文档 08 §1.4（"en、ja、zh-Hans、zh-Hant、ko、vi、th、id 不需要复数对象"）不写复数对象，与 ko / ja / zh-Hant 一致。
7. OG（只在副本）：`node scripts/og.mjs --only home-id` 一次通过，标题 64 px × 3 行（与 en / es / it 同版式），副标题 28 px × 2 行，154.6 KB。
8. 渲染（新副本 + `serve.mjs` 端口 4609，外部请求全部拦截）：1280 / 390 / 375 / 320 px 均无横向溢出；SE 卡片 389 / 448 / 448 / 545 px（上限 420 / 480 / 480 / 560）；390 px 整页 **13,179 px**（软目标 13,000；同一 HEAD 上 en 12,911、es 13,177、pt-BR 13,136、it 12,987、vi 12,993），见 §7。
9. **需要负责人处理的事**（§6）：① 真实仓库生成 `home-id` OG 之前构建报 D-23；② `id-lint.json` 待合并；③ kicker 的 L-8 W；④ 报给 App 侧的印尼语字符串问题（含一整条马来语字符串）；⑤ 页面高度略超软目标。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | « WordByWord: aplikasi terjemahan halaman web untuk iPhone » | 品牌位 WordByWord 在首（文档 03 §1.5：id 用 "WordByWord"）；K1 主词「aplikasi terjemahan halaman web untuk iPhone」**逐字完整出现**（文档 03 §2.3 表 A）；`titleMust` = iPhone / halaman web / aplikasi 全部命中；`primaryTokens.home.id`（iPhone、aplikasi）命中；无 how-to 句式 | n56（≤ 60） |
| `meta.description` | « Bagi pelajar bahasa: geser paragraf ke kanan di WordByWord, terjemahannya muncul di bawah. Ketuk dua kali kata untuk melihat artinya. Gratis di iPhone dan iPad. » | 受众词「pelajar bahasa」（表 C，R39）开头；K1 动作 + 结果在前半句；"di WordByWord"（文档 03 §3.2 允许，代替"内置浏览器"）；K2 动作「ketuk dua kali kata」→「artinya」；"Gratis di iPhone dan iPad" 收尾（SEO-11）；不写价格 | n160（120–160） |
| `hero.title`（H1） | « Geser paragraf [[halaman web]] ke kanan, terjemahan muncul di bawahnya. »（"ke kanan" 之间为不换行空格 ` `） | K1 核心名词「halaman web」（荧光笔 2 词，R65）；"段落"一级动作 + 结果（R46、PRO-19），不暗示整页；不含品牌（R27）；写了方向 "ke kanan" | n67（≤ 75） |
| `hero.eyebrow` | « WordByWord · Pembaca web dwibahasa untuk pelajar bahasa » | 品牌 + 品类（bilingual web reader）+ 受众 | 55 wu（≤ 60） |
| `hero.lede` = `ledeShort` | « WordByWord adalah asisten membaca untuk pelajar bahasa asing, di iPhone dan iPad. » | R39 定义句，以 "WordByWord adalah" 开头；"asisten" 只用在定义句（D13） | n81（≤ 90，故两者相同） |
| `meta.ogHeadline` | « Baca halaman web dalam dua bahasa. [[Teks asli tetap utuh.]] » | K1 场景（双语阅读 + 原文保留）；荧光笔 1 处 | 64 px × 3 行 |
| 功能区 H2 | « Geser untuk menerjemahkan, ketuk dua kali untuk arti kata — di situs yang Anda baca » | K1「geser untuk menerjemahkan」+ K2「arti kata」；"di situs yang Anda baca"（PRO-16，不写"任意网站"） | n83 |
| 功能 H3 | K1「Geser untuk Menerjemahkan: terjemahan muncul tepat di bawah teks asli」；K2「Ketuk dua kali untuk melihat **arti kata sesuai konteks dengan AI**」；K9「Baca postingan X (Twitter) dalam dua bahasa di browser bawaan」；K5「Ekstraksi Bagian dan Action Flow, untuk kalimat bahasa Inggris」（R83 带"bahasa Inggris"）；K3「**Bacakan teks dengan suara AI**, atau suara iOS yang cepat di perangkat」；K4「**Analisis struktur kalimat dengan AI** untuk kalimat panjang」；K7「**Terjemahan cloud atau di perangkat**」；K6「Riwayat terjemahan dan kata yang dicari」 | K2、K3、K4、K7 的表 A / B 主词**逐字**进 H3；K6 见下注 | 全部 ≤ 70 wu |
| 语言段 H2 | « Terjemahan ke 21 bahasa, bukan hanya dari bahasa Inggris » | K8 主词「terjemahan ke 21 bahasa」逐字 | 56 wu |
| 价格段 H2 | « Gratis tiap hari — Plus saat banyak membaca » | K10「gratis」+ Plus | 43 |
| 最终 CTA H2 | « Mulai membaca situs web dalam dua bahasa di iPhone » | 动作句，不是 G1 标题，不暗示整页（R46） | 50 wu |

注：K6 表 B 主词是「riwayat terjemahan dan pencarian kata」。印尼语 "riwayat pencarian" 默认指浏览器搜索记录（与文档 03 表 B 注、PRO-14 / I18-12 对 es / ko 等的理由相同），所以 H3 用 App 自己的说法「kata yang dicari」（`queried_words_section_title` = "Kata yang Dicari"）；主词原样保留在 `seo.keywords.K6`。

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有词表 `belajar bahasa Inggris`、`berita bahasa Inggris` 及附录 A 新增的 `kelompok kata`、`artikel … Inggris` 等全部 0 命中；"pelajar bahasa"、"belajar bahasa asing" 不命中）；title / H1 / description / `cta.title` 里没有 how-to 句式（cara menerjemahkan、bagaimana cara、mempertahankan teks asli、panduan）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 可解析；键与 en 一致（`--keys id` 0 缺 0 多）；数组 id 与顺序同 en。新副本 build / `--pseudo` 0 error，`check.mjs` 0 / 0，测试 62/62。真实仓库在生成 OG 前会报 D-23（§6-1） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条）。复数：id 只有 CLDR `other`，按文档 08 §1.4 不写复数对象（见 §0-6）；代入当前值后渲染为 "21 bahasa""20 bahasa""50 terjemahan geser""20 pencarian arti""30 Ekstraksi Bagian""20 Action Flow""5 penjelasan sintaks AI"，语法正确。`{plus.priceUS}` 渲染为 "US$3,99" |
| Q3 | ✓ | title 以品牌位开头，`titleMust` 三个词元齐全；K1 是产品 / 品类意图（aplikasi）；没有 §1.4 禁用主词、没有 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[halaman web]]`（2 词）；功能 H3、`languages.title` 无 `[[ ]]`；`hero.lede` 以 "WordByWord adalah" 开头，写明 "untuk pelajar bahasa asing" |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展只在 FAQ `safari` 的否定回答里；Android 只在 FAQ `android`；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT；CJK 原文不能双击查词、Ekstraksi Bagian / Action Flow 仅英语都写在同屏。旧版 legacy 的错误（"20 pasangan bahasa"、"dikelompokkan berdasarkan tanggal"、"Pelafalan AI tanpa batas"、"Tema kustom dan mode gelap"、"Akses awal ke fitur baru"、"Perbandingan Kalimat"、"Asisten Pintar"）一处都没沿用。附录 A 的 id 词表在副本里跑 L-14：0 命中（豁免键除外） |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required`，L-13 0 违规），X12 已按 geser 修正；句中按 §7.3 写 "geser … ke kanan""ketuk dua kali"；按钮 / 界面名照 App 原文加引号引用："Tingkatkan Sekarang""Pulihkan Pembelian""Dapatkan Penjelasan Sintaks AI""Riwayat Terjemahan Geser""Bacaan AI""Bacaan Lokal""Alur Tindakan Kalimat""Ekstraksi Bagian""Definisi Lainnya"；显示方式 "Otomatis / Paragraf / Kalimat demi Kalimat" |
| Q7 | ✓ | 5 处截图 alt、4 条画廊图注 + alt、2 个截图图注标签（`common.screenshotLabel` / `screenshotExcerptLabel`）、OG alt、SE 截图 alt 与图注都写了 "antarmuka bahasa Inggris"；内容逐张对照了 `assets/img/shot/en/*`（西语维基页 + 英文译文、"convirtiéndose" 卡片、朗读播放器正在读一句西语——按 f44fd7e 后的 en 写法、Swipe Translation Detail 的句法解释、设置页 Auto / Quote Style / Local Read、"matrimonio" 释义页、Spanish → English (US)、语言列表）；`features[x].alt` 描述社交帖样张并注明 "bukan tangkapan layar"；`demo.lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | local：note 写 "Antarmuka 12 bahasa, termasuk Indonesia"（T6），无 uiNote；linkText 是 SE 核心词短语 + 品牌（n53），不是裸域名；H2 以 SurfEnglish 开头；body 首句是条件句 "Sedang belajar bahasa Inggris?"；没有 "baru / tingkatkan / pengganti / mungkin lebih cocok / lebih cepat"（T10）；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音 |
| Q9 | ✓（2 条 W） | 代入占位符后全部在 §7.6 / L-8 限内，例外是两条 kicker（§6-3）。title 56、description 160、H1 67、eyebrow 55、lede 81、how 177、platformNote 122、规格清单 4 条 77–79、SE body 26 词、SE H2 52、要点 29–42 wu、linkText 53、`pricing.summary` 81 wu、`cta.recap` 88、所有 alt ≤ 125（最长 122） |
| Q10 | ✓ | 拉丁文字，不涉及 RTL / CJK；没有 `{wbr}`（R61）。H1 的 "ke kanan" 用不换行空格，避免 "ke" 悬在行尾 |
| Q12 | ✓ | 见 §7：四个宽度无横向溢出，没有字体回落 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）不写扩展名称；`aExtLive` 写了名称和"只从该页面的链接安装"；首页没有 WordByWord.io（`footer.notAffiliated` 不在首页渲染） |

指向只有英文的页面（@about、@chrome）的链接文字带 "(dalam bahasa Inggris)"；@se-site 链 SE 印尼语页，不带标记。

## 3. 回译对照（id → English，对照 en.json）

| 键 | id | 回译 | en.json |
|---|---|---|---|
| meta.title | WordByWord: aplikasi terjemahan halaman web untuk iPhone | WordByWord: web page translation app for iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Bagi pelajar bahasa: geser paragraf ke kanan di WordByWord, terjemahannya muncul di bawah. Ketuk dua kali kata untuk melihat artinya. Gratis di iPhone dan iPad. | For language learners: swipe a paragraph to the right in WordByWord, and its translation appears below. Double-tap a word to see its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Baca halaman web dalam dua bahasa. [[Teks asli tetap utuh.]] | Read web pages in two languages. [[The original text stays intact.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | Geser paragraf ke kanan · ketuk dua kali sebuah kata untuk melihat artinya sesuai konteks | Swipe a paragraph to the right · double-tap a word to see its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | Geser paragraf [[halaman web]] ke kanan, terjemahan muncul di bawahnya. | Swipe a [[web page]] paragraph to the right, and the translation appears below it. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord adalah asisten membaca untuk pelajar bahasa asing, di iPhone dan iPad. | WordByWord is a reading assistant for foreign-language learners, on iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Buka situs web di browser bawaan aplikasi, lalu geser paragraf ke kanan: terjemahannya muncul di bawahnya. Ketuk dua kali sebuah kata, dan AI menjelaskan artinya di kalimat itu. | Open a website in the app's built-in browser, then swipe a paragraph to the right: its translation appears below it. Double-tap a word, and AI explains what it means in that sentence. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Geser untuk menerjemahkan, ketuk dua kali untuk arti kata — di situs yang Anda baca | Swipe to translate, double-tap for a word's meaning — on the sites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Geser untuk Menerjemahkan: terjemahan muncul tepat di bawah teks asli | Swipe to Translate: the translation appears right below the original text | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Ketuk dua kali untuk melihat arti kata sesuai konteks dengan AI | Double-tap to see a word's meaning in context, with AI | Double-tap a word for its AI meaning in context |
| features[x].title | Baca postingan X (Twitter) dalam dua bahasa di browser bawaan | Read X (Twitter) posts in two languages in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Ekstraksi Bagian dan Action Flow, untuk kalimat bahasa Inggris | Chunk Extraction (app name, lit. "Part Extraction") and Action Flow, for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Bacakan teks dengan suara AI, atau suara iOS yang cepat di perangkat | Have text read aloud with an AI voice, or with fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Analisis struktur kalimat dengan AI untuk kalimat panjang | AI sentence structure analysis for long sentences | AI sentence structure analysis for long sentences |
| features[engines].title | Terjemahan cloud atau di perangkat | Cloud or on-device translation | Cloud or on-device translation |
| features[display].title | Tata letak dan gaya terjemahan | Translation layout and style | Translation layout and style |
| features[history].title | Riwayat terjemahan dan kata yang dicari | History of translations and looked-up words | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac, dan Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | Apa itu WordByWord? | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | Bisakah WordByWord menerjemahkan seluruh halaman web sekaligus? | Can WordByWord translate a whole web page at once? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Apakah bisa dipakai di Safari atau di dalam aplikasi lain? | Can it be used in Safari or inside other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | Apakah WordByWord penerjemah kata per kata? | Is WordByWord a word-by-word translator? | Is WordByWord a word-by-word translator? |
| faq[x].q | Bisakah saya membaca X (dulu Twitter) dengan WordByWord? | Can I read X (formerly Twitter) with WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | Bahasa apa saja yang didukung WordByWord? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | Apakah WordByWord gratis? Berapa batas hariannya? | Is WordByWord free? What are its daily limits? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | Mesin terjemahan apa yang dipakai? | Which translation engine is used? | Which translation engine does it use? |
| faq[account].q | Apakah saya perlu akun untuk memakai WordByWord? | Do I need an account to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Bagaimana memulihkan WordByWord Plus di iPhone atau iPad baru? | How do I restore WordByWord Plus on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | Apakah ada versi Android? | Is there an Android version? | Is there an Android version? |
| faq[english-learner].q | Saya sedang belajar bahasa Inggris. Apakah SurfEnglish juga layak dicoba? | I'm learning English. Is SurfEnglish worth trying too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | Apakah WordByWord bisa dipakai di iPad, Mac, atau browser komputer? | Can WordByWord be used on iPad, Mac or a computer browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| pricing.summary | Semua fitur gratis dalam batas ini; Plus menaikkannya seharga US$3,99/bulan (AS). | All features are free within these limits; Plus raises them for US$3.99/month (US). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | Dari pengembang WordByWord | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: berita bahasa Inggris sesuai level Anda | SurfEnglish: English news at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | Sedang belajar bahasa Inggris? Tetap baca halaman apa pun di WordByWord, dan coba juga SurfEnglish: berita harian per level dan game latihan, dengan gerakan yang sama. | Learning English? Keep reading any page in WordByWord, and try SurfEnglish too: daily news by level and practice games, with the same gestures. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Berita bahasa Inggris asli, level A1–C1 ／ Game latihan dari bacaan Anda ／ Bagikan artikel bahasa Inggris dari Safari | Real English news, levels A1–C1 / Practice games from your reading / Share English articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.note | Gratis untuk mulai · iPhone dan iPad · Antarmuka 12 bahasa, termasuk Indonesia · Terjemahan ke 21 bahasa | Free to start · iPhone and iPad · Interface in 12 languages, including Indonesian · Translations into 21 languages | Free to start · iPhone and iPad · App in 12 languages · Translations into 21 |
| sibling.card.linkText | Berita bahasa Inggris dengan terjemahan — SurfEnglish | English news with translation — SurfEnglish | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | Download SurfEnglish di App Store | Download SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | Layar Games SurfEnglish (antarmuka bahasa Inggris): Sentence Builder dan Word Raid dengan kalimat dan kata tersimpan | SurfEnglish Games screen (English interface): Sentence Builder and Word Raid with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | Tangkapan layar SurfEnglish (antarmuka bahasa Inggris) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer | Dari pengembang yang sama ／ SurfEnglish: Berita Inggris | From the same developer / SurfEnglish: English News（SE 的印尼语店面名，专名） | More from the maker / SurfEnglish: Bilingual News |
| cta.title | Mulai membaca situs web dalam dua bahasa di iPhone | Start reading websites in two languages on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | Geser untuk menerjemahkan · Ketuk dua kali untuk mencari arti · Bacakan teks · 21 bahasa | Swipe to translate · Double-tap to look up the meaning · Read text aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（占位符已代入当前值。FAQ 答案也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音不限次、Plus 为月订、美区价格 + 以 App Store 为准；`restore` 引用 App 按钮 "Tingkatkan Sekarang" → "Pulihkan Pembelian"（T-E）；`devices` 的 S0 答案只写"同一开发者正在准备 Chrome 扩展"，不写名称（R45）；`english-learner` 写全了 "geser dan ketuk dua kali yang sama" 和 "Kedua aplikasi bisa dipakai berdampingan"。）

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是有意为之的措辞差异：

1. `meta.title` 没有 "bilingual"：用文档 03 §3.9 的 id 草案原文（K1 主词本身不含"双语"）。
2. `hero.title`：草案为 « Geser paragraf halaman web ke kanan, terjemahannya muncul tepat di bawah. »，在 390 px 下折成 6 行，样张红条落到 815 px（375×812 时正好 812 px，压在首屏边缘）；改为 « …, terjemahan muncul di bawahnya. » 后为 4 行，与 en 同高，红条 735 px（与 en 相同，R69）。代价是少了 "tepat"（right）。"any web page" 写成 "halaman web"（不加"任何"，与草案一致）。
3. `meta.ogHeadline` 没有 "apa pun"（any）：带 "apa pun" 时 OG 标题的平衡断行把 "apa / pun" 拆在两行，去掉后为干净的 3 行、64 px。
4. `meta.description` 用 "di WordByWord" 代替 "built-in browser"（文档 03 §3.2 允许），多了方向 "ke kanan"，与草案相同。
5. `hero.platformNote` 不写美区价格（D2），只写 "Plus: langganan bulanan"；"{minOS} ke atas" = "iOS 18 及以上"。
6. SE 卡片 H2 去掉 "harian"（daily），body 把 "the same swipe and double-tap" 写成 "gerakan yang sama"（the same gestures），要点 2 写成 "Game latihan dari bacaan Anda"：都是为满足 R84（320 px 下 ≤ 560 px；初稿 613 px，定稿 545 px）。body 仍有 "berita harian"，FAQ 答案仍写全 "geser dan ketuk dua kali yang sama"。note 按 T6 加 "termasuk Indonesia"。
7. 画廊 4 条图注缩短（都保留 "antarmuka bahasa Inggris"），使 390 px 下图注最多 2 行。
8. `features[chunks].kicker` 写 "Teks bahasa Inggris"（English text）而不是 "Halaman bahasa Inggris"（English pages）：后者在 390 px 下把 "Hanya Inggris" 标签挤到第二行。
9. `pricing.title` 写成 "Gratis tiap hari — Plus saat banyak membaca"（Free every day — Plus when you read a lot），去掉了 "tingkatkan ke"（upgrade to），使 390 px 下为 2 行。
10. FAQ 标题写 "Tanya jawab WordByWord"（WordByWord Q&A），手机上 1 行。
11. FAQ `what-is` / `devices` 的链接文字带 "(dalam bahasa Inggris)"，因为 about 页和扩展页只有英文版（Wave 2 规则）。
12. `features[speech].text` 的 "a word or a whole sentence" 写成 "kata atau kalimat"（a word or a sentence）。

## 4. 没把握的措辞（12 处，附回译与替代写法）

| # | 键 | 现写法（回译） | 顾虑 | 替代写法（回译） |
|---|---|---|---|---|
| 1 | `hero.eyebrow` | Pembaca web dwibahasa untuk pelajar bahasa（Bilingual web reader for language learners） | "pembaca" 通常指"读者"（人）；SE 印尼语站也写 "Pembaca berita bilingual"，但不确定读者会否理解成软件；"dwibahasa" 正式，"bilingual" 更口语、更常被搜索 | « Aplikasi baca web dwibahasa untuk pelajar bahasa »（Bilingual web-reading app for language learners；61 wu，超 60） |
| 2 | 全页 | pelajar bahasa (asing)（(foreign-)language learners） | 表 C 给的就是 "pelajar bahasa"；但 "pelajar" 也常指中小学生 | « pembelajar bahasa »（更精确、偏学术）／ « Anda yang belajar bahasa asing »（更长） |
| 3 | `hero.title` | Geser paragraf halaman web ke kanan, terjemahan muncul di bawahnya.（Swipe a web-page paragraph right, the translation appears below it.） | "paragraf halaman web"（名词连写）与草案一致，语感稍硬；逗号连接两个分句是印尼语广告常见写法 | « Geser paragraf di halaman web ke kanan: terjemahannya muncul di bawahnya. »（n73，但 390 px 下 5–6 行） |
| 4 | `features[speech].kicker` / App 名 | Bacakan teks（Read the text aloud） | 祈使式作 kicker 略口语；App 的 "Bacaan AI / Bacaan Lokal" 里 "bacaan" 本义是"读物"，正文照 App 引用 | « Pembacaan teks »（Text reading）／ « Baca nyaring »（Read aloud，教学用语） |
| 5 | `pricing.table.englishOnly` | Hanya Inggris（English only） | 省掉 "bahasa"；Apple 印尼语 App Store 语言列表与 App 自己（"Default: Inggris"）都这样写，但单独看可能被读成"只有英国" | « Hanya bahasa Inggris »（在新表格 CSS 下标签折成 2 行，390 px +18、375 px +40 px） |
| 6 | `sibling.card.points[1]` | Game latihan dari bacaan Anda（Practice games from your reading） | en 是 "review games built from what you’ve read"；"game" 是借词 | « Permainan untuk mengulang bacaan Anda »（320 px 下 2 行，卡片 566 px > 560） |
| 7 | `pricing.title` | Gratis tiap hari — Plus saat banyak membaca（Free every day — Plus when you read a lot） | 省掉了动词 "tingkatkan ke"（upgrade to），偏标语体 | « Gratis setiap hari — tingkatkan ke Plus jika banyak membaca »（390 px 下 3 行） |
| 8 | `features[speech].text` | suara Premium atau Enhanced（Premium or Enhanced voices） | 照 App 原文；iOS 印尼语"语音内容"设置里增强语音的标签可能是 "Ditingkatkan"（未在真机核对） | « suara Premium atau Ditingkatkan » |
| 9 | `faq.title` | Tanya jawab WordByWord（WordByWord Q&A） | 比 "Pertanyaan seputar WordByWord" 生硬一点 | « Pertanyaan seputar WordByWord »（390 px 下 2 行） |
| 10 | `features[x].sample.translation` | Baru saja selesai lari 10K pertamaku. Pelan, tapi tidak berhenti sekali pun.（Just finished my first 10K run. Slow, but didn't stop once.） | 社交帖用了口语 "-ku"，与全站 "Anda" 语域不同（有意：这是虚构帖子） | « Baru saja menyelesaikan lari 10 km pertama saya. Lambat, tapi tidak berhenti sekali pun. » |
| 11 | 全页 | browser bawaan（built-in browser） | KBBI 规范词是 "peramban"；"browser" 在 SE 印尼语站和日常科技文案里更常见 | « peramban bawaan » |
| 12 | `common.appStoreBadgeAlt` | Download WordByWord di App Store | 照 Apple 印尼语徽章原文 "Download di App Store"（alt 应与可见文字一致）；SE 印尼语站自己写 "Unduh di App Store" | « Unduh WordByWord di App Store » |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法（rule ①），均与 `Localizable.xcstrings` 的 `localizations.id` 核对过**：kicker "Geser untuk Menerjemahkan"（`daily_sentence_translation_limit` = "Gesek untuk Menerjemahkan"，按 X12 改 geser）、"Ketuk dua kali untuk Mencari"（`word_meaning_lookup_title` 去掉 "(Arti AI)"，与 en / es / it 做法一致）；"Definisi Lainnya"（`more_definitions_title`）；"Ekstraksi Bagian"（`Chunk Extraction`）；"Alur Tindakan Kalimat"（`sentence_skeleton_settings_navigation_title`，也是 App 的 Free / Plus 对比表行名）；"Bacaan AI" / "Bacaan Lokal"（`audio_playback_title_*`）；"Dapatkan Penjelasan Sintaks AI"（`get_syntax_explanation_button`）；"Riwayat Terjemahan Geser"（`view_title_swipe_history`）；"Tingkatkan Sekarang" / "Pulihkan Pembelian"（T-E）；"Otomatis / Paragraf / Kalimat demi Kalimat"（`translation_mode_title_*`）；"Mesin terjemahan cloud / Mesin lokal"；"Pengucapan AI (Kata / Kalimat)"（价格表写 "Pengucapan AI · kata / kalimat"，与 en 的 "·" 写法一致）；"Bookmark"、"Tab"。
- **Action Flow**：H3、语言段、样张标签保留 App Store 名 "Action Flow"（D3、§7.2.3），正文括注 App 叫法 "Alur Tindakan Kalimat"；价格表行名用 App 叫法（与 zh-Hans / ko / it 相同）。
- **手势**：句中 "geser paragraf ke kanan"（App tip 原文 "Geser ke kanan pada teks apa pun…"），`demo.ui.swipeCue` = "Geser ke kanan"；双击一律 "ketuk dua kali"（App tip "Ketuk dua kali pada kata apa pun…"）。glossary 禁用 gesek（X12）、向左滑、鼠标 "klik dua kali"、单击查词（"ketuk kata"）。
- **称谓与排版**：称 Anda（首字母大写），全页无 kamu（glossary 禁用）；引号 “ ”；"X (dulu Twitter)" 是印尼媒体常见写法（§7.2.3 的"X（旧 Twitter）"格式）；"AI" 照 App 与印尼语惯例，不存在 AI / KA 之争；中文写 "Mandarin"（与 SE 印尼语站一致），"Mandarin Sederhana dan Tradisional"。
- **Apple 用词**：Akun Apple（2024 年起取代 ID Apple）、"Mac dengan chip Apple"、"iOS 18 atau versi lebih baru"（规格清单与 platformNote 用 "ke atas" / "+"）、商标声明用 Apple 印尼语句式。`{plus.priceUS}` 在 id 渲染为 "US$3,99"，句中写 "/bulan (AS)"。
- **glossary**（`src/data/glossary/id.json`）：`required` 锁定 10 个 kicker、`demo.ui.more`、样张 flowLabel 与 10 个价格表行名；`contains` 要求 FAQ `restore`、`syntax`、`speech`、`chunks`、`lookup.bullets[2]` 逐字引用 App 名；`banned` 收录 gesek（X12）、左滑、鼠标双击、单击查词、App 名变体、kamu、以及 App 一条字符串里混入的马来语词（percuma、naik taraf、tempatan、percubaan）。
- `meta.appStoreName` = "WordByWord"（文档 03 §1.5）、`appStoreSubtitle` = "Geser untuk menerjemahkan, AI menjelaskan"（US 副标题的译文）：ID 店面的 lookup 默认返回英语 "WordByWord Translate / Swipe to translate AI explains"（研究 05 附录 A），印尼语本地化名查不到；这两个键只用于 en 的 about 事实表，id 不渲染。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，OG 文件没有复制进真实仓库。id.json 进库后，`node build.mjs` 会报 `D-23 home-id: no OG image`，直到运行 `node scripts/og.mjs --only home-id`（新副本实测一次通过：64 px × 3 行、28 px × 2 行、154.6 KB）。
2. **id lint 词表**：`claims-lint.json` 有 26 条规则缺 id 写法（L-14 W，另 `hype` 有 `*` 但没有 id 写法）、`keyword-map.json` 缺 id 的 G1 模式（L-9 W）。`docs/redesign-2026/ops/m3/id-lint.json` 是提案（27 条规则 + seOwned / seOwnedLead / G1），在新副本合并后：id 文案 0 命中（豁免键除外），构建 0 error，测试 62/62，其他语言不受影响。注意印尼语 meN- 前缀吞 t："terjemah" → "menerjemahkan"，所以词表写成 `(mene|dite|te)rjemah`。
3. **kicker 的 L-8 W**：保留 App 叫法（Wave 2 要求）会有 2 条 W：`Geser untuk Menerjemahkan` 25（X12 修正后）、`Ketuk dua kali untuk Mencari` 28。320 px 下这两个大写 kicker 折成 2 行，375 px 以上 1 行。改成自然说法（如 "Ketuk dua kali" 14）可消除 W，但与 App 不一致。
4. **报给 App 侧的印尼语字符串问题**（规则 ③；网站已按下列方式处理）：
   - **X12**：`daily_sentence_translation_limit` = "Gesek untuk Menerjemahkan"，而 `tip_swipe_to_translate`、`Swipe down to close` 等都用 geser。"gesek" 是"刷（卡）、摩擦"，iOS 印尼语手势统一用 "geser"。建议 App 改为 "Geser untuk Menerjemahkan"。
   - **`tts_trial_exhausted_fallback_message` 是马来语**："Anda telah menggunakan masa percubaan percuma hari ini. Beralih ke sebutan tempatan. Naik taraf ke Plus untuk membuka kunci lebih banyak mainan AI."——percubaan percuma（马来语"免费试用"；印尼语 percuma 是"白费"）、sebutan tempatan（"本地发音"）、naik taraf（"升级"）、"mainan AI" 是"AI 玩具"（把 plays 译成了玩具）。建议改为 « Anda telah menggunakan uji coba gratis hari ini. Beralih ke pelafalan lokal. Tingkatkan ke Plus untuk membuka lebih banyak pemutaran AI. »
   - "Upgrade ke Plus"（`usage_status_upgrade_hint`）与 "Tingkatkan ke Plus"（`upgrade_to_plus_button`）不一致。
   - "Bacaan AI / Bacaan Lokal"："bacaan" 是"读物"，设置页标题却是 "Mode Pembacaan"（朗读模式）；建议 "Pembacaan AI / Pembacaan Lokal"。网站引用时照 App。
   - 同一功能两种写法："ketuk dua kali"（标题、提示）与 "Terjemahan ketuk ganda"（`double_tap_not_supported_message`，而且双击是查词，不是"翻译"）。
   - "Border" 一词两译：`Border` = "Batas"，`translation_style_title_border` = "Bingkai"。
   - `edit_bookmark_title` = "Edit Bookmarks"（未翻译）；书签用英语借词 "Bookmark"（iOS 印尼语 Safari 用 "Penanda"）。
   - 大小写混用："Ketuk dua kali untuk Mencari (Arti AI)""Gesek untuk Menerjemahkan"。
   - "suara Premium atau Enhanced"：iOS 印尼语界面里 Enhanced 语音可能叫 "Ditingkatkan"，建议 App 侧在真机核对。
   - （en 源文本身的问题，顺带记录）`folder_name_label` 与 `usage_section_title` 的 en 值是 "Border" / "Dashed Underline"，明显是复制错误；id 值 "Nama" / "Penggunaan" 是对的。
5. **页面长度**：同一 HEAD（f44fd7e）下 390 px 为 13,179 px，略超 13,000 的软目标（en 12,911、es 13,177、pt-BR 13,136、it 12,987、vi 12,993）。差额主要来自印尼语的长词：价格表行名（App 原名 "Geser untuk Menerjemahkan · cloud" 等在新 CSS 下折 3 行）、功能区 H2 4 行、语块 / 朗读 / 句法三张卡各多 1 行。已做的压缩见 §7；再往下压就要删 App 原名或事实。
6. **"pelajar bahasa" 与 "Hanya Inggris"**：见 §4-2、§4-5，若负责人偏好 "pembelajar bahasa" / "Hanya bahasa Inggris"，各改一处键值即可（后者会让页面再高 18–40 px）。
7. **母语审校**：按 R36，id 上线后补母语审校；请审校人重点看 §4 的 12 处和 §6-4。

## 7. 版面实测（新副本 HEAD f44fd7e + id，`scripts/serve.mjs --port 4609`，headless Chrome，外部请求全部拦截）

| 视口 | 横向溢出 | SE 卡片高度（上限） | 样张红色译文条顶端 | 整页高度（同 HEAD 的 en） |
|---|---|---|---|---|
| 1280 × 900 | 无 | 389 px（420） | 378 px（en 378） | 10,434 px（10,079） |
| 390 × 844 | 无 | 448 px（480） | 735 px（en 735，< 844，R69） | **13,179 px**（12,911；目标 ≤ 13,000） |
| 375 × 812 | 无 | 448 px（480） | 733 px（en 733，< 812） | 13,306 px（12,987） |
| 320 × 700 | 无 | 545 px（560，R84） | 873 px（en 873） | 14,162 px（13,420） |

H1 断行（`ke kanan` 不换行）：1280 / 390 / 375 px 为 « Geser paragraf ／ halaman web ／ ke kanan, terjemahan ／ muncul di bawahnya. »，320 px 为 6 行（与 en 同高 233 px）。

为满足上面的数字所做的调整（初稿 → 定稿）：

- H1 结果分句改写（6 → 4 行，红条 815 → 735 px，见 §3.1-2）；OG 标题去掉 "apa pun"（§3.1-3）。
- SE 卡片：H2 去掉 "harian"、body 用 "gerakan yang sama"、要点 2 改短、note 写 "termasuk Indonesia"：320 px 下 613 → 545 px，1280 px 下 412 → 389 px。
- 功能区：查词正文与要点 2、语块正文、朗读正文、句法正文各删几个词；语块 kicker 改 "Teks bahasa Inggris"，标签改 "Hanya Inggris"，kicker 与标签同行。
- 语言段 lede、限制 ①，价格段 H2，FAQ 标题与 `restore` 问句，画廊 4 条图注各缩短一行左右。
- 价格表：起初为了旧 CSS 的列宽保留了较长的标签；54afac8 之后标签可折行，改用短标签 "Hanya Inggris"（390 px −18、375 px −40、320 px −39 px）。App 原名的行名不缩写（负责人说明：不为旧的裁切问题缩写单元格）。
- 目视检查（深色模式截图）：390 / 375 / 320 px 的 hero、样张查词卡、L1 / L2（①②③ 页边注）、X 样张、语块示意、规格清单、语言段、价格表、SE 卡片、FAQ、最终 CTA、页脚，1280 px 的 hero、功能区、SE 卡片、价格表：没有溢出或异常断行；"·" 没有落到行首。

## 附录 A：建议的 id lint 词表（`docs/redesign-2026/ops/m3/id-lint.json`）

文件形状按 Wave 2 约定：`{"claimsLint": {"<rule id>": [...]}, "keywordMap": {"seOwned": [...], "seOwnedLead": [...], "reservedG1": [...]}}`。覆盖 27 条规则（所有带分语言写法、且还没有 id 键的规则；跳过只有 `*` 的 `io-home`、`engine-claim`）。匹配方式同校验器：`iu`，在代入占位符、去掉标记后的文本上，`\w` / `\b` 经 bb689eb 的 `unicodeWords()` 处理；需要词边界的地方显式写 `(?<![\p{L}])` / `(?![\p{L}])`。印尼语 meN- / di- 前缀：`terjemah` 的变形写成 `(mene|dite|te)rjemah`（menerjemahkan / diterjemahkan / terjemahkan）。

自测（新副本 + 本词表，`scratchpad/id-work/lint-counter.mjs`，98 项全部通过）：id 文案 0 命中（命中的都在规则自带的豁免键内：`faq.items[whole-page].q`、`faq.items[safari].a`、`faq.items[android]`、`faq.items[devices].a`、`faq.items[x].a`、`footer.notAffiliated`）；构建 0 error、L-14 / L-9 的 id 汇总 W 消失；测试 62/62。下列反例句全部命中：

| 规则 | 反例句（全部命中） |
|---|---|
| whole-page | Terjemahkan seluruh halaman web dengan WordByWord. ／ WordByWord menerjemahkan semua isi halaman sekaligus. ／ Seluruh halaman langsung diterjemahkan. ／ Terjemahan seluruh halaman web dalam sekejap. ／ Terjemahkan dengan sekali ketuk. |
| swipe-left | Geser paragraf ke kiri untuk menerjemahkan. ／ Usap ke arah kiri pada teks. |
| safari-extension | WordByWord adalah ekstensi Safari. ／ Gunakan ekstensi berbagi di iPhone. ／ Menerjemahkan di aplikasi apa pun. ／ Berfungsi di semua aplikasi. ／ Tanpa perlu berpindah aplikasi. |
| selection-translate | Pilih teks untuk menerjemahkan. ／ Sorot kata lalu terjemahkan. ／ Terjemahkan saat memilih teks. |
| offline | Bisa dipakai offline. ／ Menerjemahkan tanpa koneksi internet. ／ Tidak perlu internet. ／ Mode luring tersedia. |
| unlimited-ai-voice | Pengucapan AI tanpa batas dengan Plus. ／ Suara AI tidak terbatas. ／ AI tanpa batas untuk pelanggan. ／ Pelafalan tak terbatas setiap hari. |
| dark-mode-theme | Mendukung mode gelap. ／ Pilih tema kustom favorit Anda. ／ Ganti warna tema. |
| shortcuts-volume | Atur pintasan keyboard sesuka Anda. ／ Atur volume suara AI. |
| vocab-sync | Simpan kata ke flashcard. ／ Sinkronkan riwayat ke semua perangkat. ／ Buku kosakata bawaan. ／ Pencadangan ke iCloud otomatis. |
| android | Tersedia juga di Android. ／ Unduh di Google Play. |
| desktop-version | Ada versi desktop. ／ Kini ada versi untuk browser komputer. ／ Unduh aplikasi untuk Windows. ／ Versi web dari WordByWord. |
| x-app | Terjemahkan postingan di aplikasi X. ／ Bisa dipakai dengan aplikasi X. ／ Satu-satunya aplikasi yang bisa menerjemahkan X. |
| plus-early-access | Pelanggan Plus mendapat akses awal ke fitur baru. ／ Fitur baru lebih dulu untuk Plus. |
| privacy-claim | Aplikasi tidak mengumpulkan data pribadi. ／ Tidak ada data yang dikumpulkan. ／ Tanpa pelacakan. |
| initial-version | Versi awal mendukung lebih dari 20 bahasa. |
| language-pairs | Lebih dari 20 pasangan bahasa. |
| style-count | Pilih dari 8 gaya terjemahan. ／ Tujuh gaya berbeda. |
| auto-detect-target | Mendeteksi otomatis bahasa target Anda. ／ Bahasa target terdeteksi otomatis. |
| history-by-date | Riwayat dikelompokkan berdasarkan tanggal. |
| plus-only | Analisis sintaksis hanya untuk Plus. ／ Fitur khusus untuk pelanggan WordByWord Plus. |
| speaking-practice | Latihan berbicara setiap hari. ／ Tingkatkan kemampuan berbicara Anda. |
| jargon | Perbandingan kalimat satu per satu. ／ Penyelarasan teks yang cerdas. ／ Segmentasi cerdas untuk membaca.（旧版 id 页的 "Perbandingan Kalimat""segmentasi cerdas"） |
| replacement-tone | Jika belajar bahasa Inggris, SurfEnglish mungkin lebih cocok. ／ Aplikasi ini lebih sesuai untuk Anda. ／ Gunakan SurfEnglish sebagai pengganti WordByWord. ／ Beralih dari WordByWord ke SurfEnglish. |
| se-on-device-voice | Suara AI di perangkat yang bisa dipakai offline. ／ Suara yang berfungsi secara offline. |
| se-hype | Baru: aplikasi untuk belajar bahasa Inggris. ／ Lebih cepat dan lebih efisien. ／ Upgrade ke SurfEnglish. ／ Lebih baik daripada WordByWord. |
| hype | Aplikasi terjemahan terbaik. ／ Aplikasi revolusioner. ／ Satu-satunya aplikasi seperti ini. ／ Dipakai oleh 10.000 pengguna. ／ Tim WordByWord menyapa Anda. ／ Ucapkan selamat tinggal pada copy-paste. |
| ext-language-count | Ekstensi ini menerjemahkan ke 20 bahasa. |
| seOwned | Belajar bahasa Inggris dengan membaca berita ／ Berita bahasa Inggris sesuai level Anda ／ artikel berbahasa Inggris ／ Kelompok kata disorot otomatis ／ Learn chunks |
| seOwnedLead | Belajar bahasa Inggris lewat berita ／ Sedang belajar bahasa Inggris? Coba SurfEnglish ／ Saya sedang belajar bahasa Inggris |
| reservedG1 | Cara menerjemahkan halaman web di iPhone ／ Bagaimana cara membaca situs web dua bahasa ／ Terjemahkan dan tetap mempertahankan teks asli ／ Tanpa kehilangan teks asli ／ Panduan membaca dua bahasa |

不得误拦（文档 03 §1.4）：« Bagi pelajar bahasa: geser paragraf ke kanan di WordByWord »、« untuk pelajar bahasa asing »、« belajar bahasa asing dengan membaca situs web » 都不命中 seOwned；本页的 title / H1 / `cta.title` 与 « terjemahkan halaman web di iPhone »（表 A 允许首页用的次词）都不命中 reservedG1。

说明：`kelompok kata` 是 SE 印尼语官网对 chunks 的叫法（与 en `chunks`、pt-BR `blocos` 同理，只在 title / H1 / description / OG / 功能区 H2 禁用）。`se-hype` 的 `baru`、`tingkatkan` 只作用于 SE 区块（规则自带 `only`），不会拦 FAQ `restore` 里的 App 按钮名 "Tingkatkan Sekarang"。`hype` 的 `satu-satunya` 可能误伤正常句子，合入前请母语审校再看一遍。

## 附录 B：验证记录

| 命令 | 结果 |
|---|---|
| `node build.mjs --out …/dist`（新副本 = HEAD f44fd7e 的 git archive + id 两个文件 + 副本内 OG） | 0 error；id 5 条 W（L-8 kicker ×2、L-4、L-14 未覆盖、L-9 无 G1） |
| 同上，副本合并 `id-lint.json` 后 | 0 error；id 3 条 W（L-8 kicker ×2、L-4） |
| `node build.mjs --pseudo` | 两种数据下均 0 error |
| `node scripts/check.mjs --dist …` | 两种数据下均 0 error / 0 warning |
| `node scripts/check.mjs --keys id` | 0 missing / 0 not in en |
| `node scripts/og.mjs --only home-id` | ✓ 标题 64 px × 3 行、副标题 28 px × 2 行、154.6 KB |
| `node --test scripts/tests/*.test.mjs` | 62/62（两种数据下均通过） |
| `lint-counter.mjs` | 98/98 |
| headless Chrome 1280 / 390 / 375 / 320 px | 无横向溢出；SE 卡片 389 / 448 / 448 / 545 px；390 px 页高 13,179 px |
