# M3 · nl（Nederlands）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | nl（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校） |
| 交付 | `src/locales/nl.json`（新建）；`src/data/glossary/nl.json`（新建，§7.2.5 格式，数据取自文档 08 §7.2.1 表 T-A…T-E 的 nl 列、§7.2.2 规则 ①–③ 与 X5 / X6 / X7、§7.5 jargon 行）；`docs/redesign-2026/ops/m3/nl-lint.json`（建议的 nl lint 词表，未合入数据文件）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（nl 行、表 A / B / C）、§3.1–§3.9（nl 草案）；文档 04 §5.1、§5.5、§5.7（nl 的 uiNote、linkText 种子、T1–T11）；文档 05 §7.5；裁定 R36、R39–R43、R46、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照，es / fr / de / ko / zh-Hant 的成稿与 QA 记录作做法参照；`_legacy/nl.json`、`sibling-tm.json` 只作术语参考（带 warnings 的写法与事实一律未用） |
| App 叫法来源 | `/Users/ike/Dev/WordByWord/WordByWordPrototype/Localizable.xcstrings` 的 `localizations.nl.stringUnit.value`（与文档 08 表 T-A…T-E 的 nl 列逐条核对一致） |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-nl/` 起草与渲染检查；最终验证在按当前 HEAD（`c657445`，含 en / zh-Hans / zh-Hant / ja / ko / es / fr / pt-BR / de）重新 rsync 的 `scratchpad/wbw-m3-nl-final/` 里做。OG 图只在副本里生成，**没有**复制进真实仓库；lint 词表只在副本里合入自测 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys nl`：0 缺、0 多；与 ja / fr / de 一样不提供 `about.*`、`chromeExtension.*`、`legal.*`，提供 `notfound.*`）。在 HEAD `c657445` 的新副本里：`node build.mjs` 与 `--pseudo` 均 **0 error**；`node scripts/check.mjs` 0 error / 0 warning；`node --test scripts/tests/*.test.mjs` 58/58 通过。
2. nl 自己的 warning：L-8 `features[lookup].kicker` 29 > 24（有意保留 App 叫法，§6 第 4 条）；L-4 两条 review（`common.menu` = "Menu"、`footer.product` = "Product"，都是正确的荷兰语）+ 6 条文档 08 §1.5 预期的照抄值；L-14"26 条规则没有 nl 词表"、L-9"没有 nl 的 G1 how-to 模式"——这两条来自数据文件缺 nl 词表。我起草了 `nl-lint.json`（附录 A），在副本里合入后全站 0 error，nl 的 L-14 / L-9 警告消失，nl 文案 0 命中，57 个反例句全部命中。
3. title、H1 逐字采用文档 03 §3.9 nl 草案（title n60，正好到上限；H1 n74，荧光笔标"webpagina"）。description 在草案上润色：把电报体的"Tik twee keer op een woord: de betekenis."改为"Dubbeltik op een woord voor de betekenis."（n159）。称谓按文档 08 §7.3 用 je。
4. 手势：句中"veeg (een alinea) naar rechts"、"dubbeltik(ken)"（X7：不用 App 提示里的鼠标说法"Dubbelklik"）；功能名 kicker 用 App 叫法"Veeg om te vertalen""Dubbel tikken om op te zoeken"。
5. 复数：nl 的 CLDR 类别是 one / other。所有"数字占位符 + 可数名词"都写成两类复数对象（数字与名词之间用 U+00A0），当前值全部落在 other，渲染为"21 talen""20 talen""50 veegvertalingen""20 woordverklaringen""30 segmentextracties""20 Action Flow-analyses""5 AI-syntaxanalyses""21 vertaaltalen"。
6. SurfEnglish：nl 的 `seMode` = en-site。卡片用 `uiNote` 替换 note（"没有荷兰语界面，是英语和另外 11 种；可译成荷兰语"），linkText 用文档 04 §5.7 的 nl 种子（带"(Engelstalige website)"，链 SE 英文站，`hreflang="en"`），FAQ `english-learner` 在链接前加了 §7.8 的界面说明句。
7. 英文界面：所有截图 alt、4 条画廊图注、`common.screenshotLabel` / `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都写"(Engelse interface)"；指向英文页的富文本链接（`@about`、`@chrome`、`@se-site`）的链接文字带"(in het Engels)"。
8. OG（只在副本）：`node scripts/og.mjs --only home-nl` 通过，标题 58 px × 3 行、副标题 30 px × 2 行、148.2 KB（与 fr 相同的 58 px 版式；en 为 64 px × 3 行）。
9. 渲染检查（`scripts/serve.mjs` + 浏览器，端口 4602）：1280 / 390 / 375 / 320 px 都没有页面级横向溢出；SE 卡片 370 / 432 / 432 / 550 px（上限 420 / 480 / 480 / 560）；390 px 页面高 12,960 px（≤ 13,000；同一副本 en 为 12,854）。为此缩短了价格表三行行名、额度单元格与 SE 卡片 note 等（§7）。
10. 需要负责人决定的事见 §6：OG 图入库、是否合入 nl lint 词表、App 荷兰语字符串的问题清单（报给 App 侧）、"AI Lezing / Lokale Lezing"的处理、几处为版面做的缩写。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | WordByWord: tweetalige vertaalapp voor webpagina’s op iPhone | 品牌位 WordByWord（NL 店面名就是 WordByWord，研究 05 §2.1）；K1 主词「tweetalige vertaalapp voor webpagina’s op iPhone」**逐字完整**（文档 08 §7.3 nl 行；文档 03 §3.9 草案原样）；`seo.titleMust` = iPhone / webpagina / vertaalapp 全部命中（"webpagina"按整词匹配"webpagina’s"）；`primaryTokens.home.nl`（iPhone、vertaalapp）命中 | n60（上限 60） |
| `meta.description` | Voor taalleerders: veeg in WordByWord een alinea naar rechts en de vertaling staat eronder. Dubbeltik op een woord voor de betekenis. Gratis op iPhone en iPad. | 受众词「taalleerders」（表 C，R39）；K1 动作 + 结果（"veeg … een alinea naar rechts … de vertaling staat eronder"）在前一半；"in WordByWord"满足文档 03 §3.2；K2 动作 + 结果（"Dubbeltik op een woord voor de betekenis"）；平台 + 免费收尾（SEO-11）；不写价格 | n159（区间 120–160） |
| `hero.title`（H1） | Veeg een alinea van een [[webpagina]] naar rechts: de vertaling staat eronder. | K1 核心名词「webpagina」（荧光笔，1 个词，R65）；"段落"一级的动作 + 方向 + 结果（R46、PRO-19），不暗示整页；不含品牌（R27）；没有 how-to 句式；草案逐字 | n74（上限 75） |
| `hero.eyebrow` | WordByWord · Websites tweetalig lezen, voor taalleerders | 品牌 + 品类（K1 次词"websites tweetalig lezen"）+ 受众 | 56 wu（上限 60） |
| `hero.lede` = `ledeShort` | WordByWord is een leesassistent voor taalleerders op iPhone en iPad. | R39 定义句（"leesassistent"只出现在定义句、FAQ `what-is` 和页脚 tagline，D13） | n68（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | Lees elke webpagina tweetalig. [[Het origineel blijft staan.]] | K1"双语阅读 + 原文保留"；荧光笔 1 处；没用"origineel behouden"（建议留给 G1，见附录 A） | 58 px × 3 行 |
| 功能区 H2 | Veeg om te vertalen, dubbeltik voor de betekenis – op de websites die je leest | K1 App 名 + K2「betekenis」；"op de websites die je leest"（PRO-16，不写"任何网站"） | n78 |
| 功能 H3 | K1「Veeg om te vertalen: de vertaling staat direct onder het origineel」；K2「Dubbeltik op een woord: AI geeft de betekenis in context」；K9「X-berichten (Twitter) tweetalig lezen in de ingebouwde browser」；K5「Segmentextractie en Action Flow, voor Engelse zinnen」（R83 带"Engelse"）；K3「Voorlezen met een AI-stem of met snelle iOS-stemmen op je apparaat」；K4「Zinsbouw analyseren met AI, handig bij lange zinnen」；K7「Vertalen in de cloud of op het apparaat」；K6「Geschiedenis van vertalingen en opgezochte woorden」 | K4、K6、K7 与表 A / B 的 nl 主词逐字一致；K3「voorlezen met (een) AI-stem」、K2「betekenis … in context」+ AI、K9「X-berichten (Twitter)」为主词的语序变体 | 全部 ≤ 70 wu |
| 语言段 H2 | Vertalen naar 21 talen – en niet alleen vanuit het Engels（复数对象） | K8 主词「vertalen naar 21 talen」逐字 | 57 wu |
| 价格段 H2 | Elke dag gratis – upgrade naar Plus als je meer leest | K10「gratis」+ Plus（"upgraden naar Plus"与 App 的 `upgrade_to_plus_button`「Upgraden naar Plus」一致） | — |
| 最终 CTA H2 | Lees websites voortaan tweetalig op je iPhone | 动作句，不是 G1 标题，不暗示整页（R46） | 45 wu |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有的"Engels leren"和附录 A 建议新增的"Engels(e) nieuws""leer Engels""chunks"等都 0 命中）；title / H1 / description / `cta.title` 里没有 how-to 句式（附录 A 的 G1 模式"hoe""zo … je""origineel behouden"等 0 命中）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（L-1、L-2，`--keys nl` 0 缺 0 多）；新副本 build / `--pseudo` 0 error，`check.mjs` 0 error。真实仓库在生成 OG 之前会报 D-23（§6 第 1 条） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条；uiNote / FAQ 里的"11"是文档 08 §7.8 规定由译者写死的 {se.uiLanguages} − 1）。复数对象：`languages.title / uiCount / targetCount`、`gallery.items[languageList].caption`、`faq.items[languages].a`（2 处）、`faq.items[free].a`（5 处）、`cta.recap`、`sibling.card.note`，代入当前值核对过渲染（§0 第 5 条）。`{n}/dag` 与"{quota.localSwipe.free} met de lokale motor"后面没有可数名词，与 en 同构 |
| Q3 | ✓ | title 以品牌位开头，三个 `titleMust` 词元齐全；K1 是产品 / 品类意图（vertaalapp）；title、description、H1、功能区 H2 没有 §1.4 禁用主词，没有 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[webpagina]]`（1 个词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以"WordByWord is een leesassistent voor taalleerders"开头 |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的问句（豁免键）；Safari 扩展只出现在 FAQ `safari` 的否定回答；安卓只在 FAQ `android`；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT、"WordByWord.io"；CJK 原文不能双击查词、语块 / Action Flow 仅英语都写在同一屏（`features[lookup].note`、`features[chunks].note`、`languages.limits`、FAQ）。附录 A 的 nl 词表跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required`，L-13 0 违规）；按 X5–X7 修正：价格表写"AI-uitspraak (zin)"（App 为挪威语"AI Uttale (Setning)"）、画廊 alt 写"citaatstijl"（App"Cita Stijl / Citatstijl"）、全站不出现"dubbelklik"；句中手势按 §7.3 写"veeg … naar rechts""dubbeltik"；按钮名照 App 原文引用：“Nu Upgraden”“Aankoop Herstellen”“AI-syntaxuitleg ophalen”“AI Lezing”“Lokale Lezing”“Segmentextractie”“Actieverloop van de zin”“Meer definities”“Automatisch / Alinea / Zin voor Zin” |
| Q7 | ✓ | 5 处功能截图 alt、4 条画廊图注 + alt、2 个截图图注标签、OG alt、SE 截图 alt 与图注都写了"Engelse interface"，内容逐张对照了 `assets/img/shot/en/*` 与 `se/common/games-400.jpg`（语言列表 alt 提到了截图里可见的"Nederlands"）；`features[x].alt` 描述社交帖样张并注明"geen screenshot"（不写英文界面）；样张 `lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | en-site：用 uiNote（不含 `{se.uiLanguages}`，没有"App in 12 talen"，L-11 通过）；linkText 是 SE 核心词短语 + 品牌 +"(Engelstalige website)"（n66，en-site 上限 80），链 SE 英文站并带 `hreflang="en"`；FAQ 加了界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句"Leer je Engels?"；没有"nieuw / upgrade / vervangt / past misschien beter"；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音 |
| Q9 | ✓（1 条 W） | 代入占位符后全部在 §7.6 / L-8 限内，唯一例外是 `features[lookup].kicker` 29 > 24（App 叫法，§6 第 4 条）。title 60、description 159、H1 74、eyebrow 56、lede 68、how 178、platformNote 134、ctaNote 34、功能 H3 31–66、规格清单 4 条 76–79、SE 卡片 title 51 / body 26 词 / 要点 34–41、linkText 66、`cta.recap` 72、`pricing.summary` 94、所有 alt ≤ 125（最长 125：`features[lookup].alt`）、FAQ 答案最长 572 |
| Q10 | ✓ | nl 是拉丁文字，不涉及 RTL / CJK；没有 `{wbr}`（R61） |
| Q12 | ✓ | 见 §7：四个宽度无页面级横向溢出、无字体回落；额度表在 375 / 390 px 不再需要容器内横向滚动 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）没写扩展名称（"een Chrome-extensie van dezelfde ontwikkelaar is in voorbereiding"）；`aExtLive` 写了名称并注明只从该页面链接安装；首页没出现 WordByWord.io |

## 3. 回译对照（nl → English，对照 en.json）

| 键 | nl | 回译 | en.json |
|---|---|---|---|
| meta.title | WordByWord: tweetalige vertaalapp voor webpagina’s op iPhone | WordByWord: bilingual translation app for web pages on iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Voor taalleerders: veeg in WordByWord een alinea naar rechts en de vertaling staat eronder. Dubbeltik op een woord voor de betekenis. Gratis op iPhone en iPad. | For language learners: in WordByWord, swipe a paragraph to the right and the translation is right below it. Double-tap a word for its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Lees elke webpagina tweetalig. [[Het origineel blijft staan.]] | Read any web page bilingually. [[The original stays in place.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | Veeg een alinea naar rechts · dubbeltik op een woord voor de betekenis in context | Swipe a paragraph to the right · double-tap a word for its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | Veeg een alinea van een [[webpagina]] naar rechts: de vertaling staat eronder. | Swipe a paragraph of a [[web page]] to the right: the translation is below it. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord is een leesassistent voor taalleerders op iPhone en iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Open een website in de ingebouwde browser en veeg naar rechts over een alinea: de vertaling verschijnt eronder. Dubbeltik op een woord en AI legt uit wat het in die zin betekent. | Open a website in the built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word and AI explains what it means in that sentence. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Veeg om te vertalen, dubbeltik voor de betekenis – op de websites die je leest | Swipe to translate, double-tap for the meaning – on the websites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Veeg om te vertalen: de vertaling staat direct onder het origineel | Swipe to Translate: the translation sits right below the original | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Dubbeltik op een woord: AI geeft de betekenis in context | Double-tap a word: AI gives its meaning in context | Double-tap a word for its AI meaning in context |
| features[x].title | X-berichten (Twitter) tweetalig lezen in de ingebouwde browser | Reading X (Twitter) posts bilingually in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Segmentextractie en Action Flow, voor Engelse zinnen | Chunk Extraction and Action Flow, for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Voorlezen met een AI-stem of met snelle iOS-stemmen op je apparaat | Read aloud with an AI voice or with fast iOS voices on your device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Zinsbouw analyseren met AI, handig bij lange zinnen | Analyzing sentence structure with AI, handy for long sentences | AI sentence structure analysis for long sentences |
| features[engines].title | Vertalen in de cloud of op het apparaat | Translating in the cloud or on the device | Cloud or on-device translation |
| features[display].title | Opmaak en stijl van de vertaling | Layout and style of the translation | Translation layout and style |
| features[history].title | Geschiedenis van vertalingen en opgezochte woorden | History of translations and looked-up words | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac en Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | Wat is WordByWord? | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | Kan WordByWord een hele webpagina in één keer vertalen? | Can WordByWord translate a whole web page in one go? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Werkt het in Safari of in andere apps? | Does it work in Safari or in other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | Vertaalt WordByWord woord voor woord? | Does WordByWord translate word for word? | Is WordByWord a word-by-word translator? |
| faq[x].q | Kan ik X (voorheen Twitter) lezen met WordByWord? | Can I read X (formerly Twitter) with WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | Welke talen ondersteunt WordByWord? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | Is WordByWord gratis? Wat zijn de daglimieten? | Is WordByWord free? What are the daily limits? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | Welke vertaalmotor gebruikt de app? | Which translation engine does the app use? | Which translation engine does it use? |
| faq[account].q | Heb ik een account nodig voor WordByWord? | Do I need an account for WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Hoe krijg ik WordByWord Plus terug op een nieuwe iPhone of iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | Is er een Android-versie? | Is there an Android version? | Is there an Android version? |
| faq[english-learner].q | Ik leer Engels. Is SurfEnglish ook het proberen waard? | I’m learning English. Is SurfEnglish worth trying too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | Werkt WordByWord op iPad, Mac of in een desktopbrowser? | Does WordByWord work on iPad, Mac or in a desktop browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| faq[english-learner].a（en-site 补句） | De interface van SurfEnglish is niet in het Nederlands beschikbaar (wel in het Engels en 11 andere talen), maar de app kan wel naar het Nederlands vertalen. | SurfEnglish’s interface is not available in Dutch (it is in English and 11 other languages), but the app can translate into Dutch. | 文档 08 §7.8 模板：SurfEnglish’s interface isn’t available in {language} — it’s in English and {n} other languages — but it can translate into {language}. |
| pricing.summary | Alle functies zijn gratis binnen deze limieten; Plus verhoogt ze voor US$ 3,99 per maand (VS). | All features are free within these limits; Plus raises them for US$3.99 a month (US). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | Van de ontwikkelaar van WordByWord | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: dagelijks Engels nieuws op jouw niveau | SurfEnglish: daily English news at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | Leer je Engels? Blijf in WordByWord lezen wat je wilt en probeer ook SurfEnglish: dagelijks Engels nieuws per niveau en herhaalspelletjes, met hetzelfde vegen en dubbeltikken. | Learning English? Keep reading whatever you like in WordByWord and try SurfEnglish too: daily English news by level and review games, with the same swiping and double-tapping. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Echt Engels nieuws op niveau A1–C1 ／ Herhaalspelletjes met wat je hebt gelezen ／ Deel Engelse artikelen vanuit Safari | Real English news at level A1–C1 / Review games with what you have read / Share English articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.uiNote（替换 note） | Gratis · Geen Nederlandse interface (wel Engels en 11 andere talen) · Vertaalt naar het Nederlands | Free · No Dutch interface (but English and 11 other languages) · Translates into Dutch | （en 的 note：Free to start · iPhone and iPad · App in 12 languages · Translations into 21；文档 04 §5.7 nl uiNote 草案："Gratis om te beginnen · De app-interface is niet in het Nederlands (wel in het Engels en 11 andere talen) · Vertalingen naar het Nederlands mogelijk"） |
| sibling.card.linkText | Engels nieuws tweetalig lezen – SurfEnglish (Engelstalige website) | Read English news bilingually – SurfEnglish (English-language website) | Read English news at your level with SurfEnglish（文档 04 §5.7 nl 种子与本稿相同） |
| sibling.card.appStoreLinkText | Download SurfEnglish in de App Store | Download SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish, scherm Games (Engelse interface): Sentence Builder en Word Raid, te spelen met bewaarde zinnen en woorden | SurfEnglish, Games screen (English interface): Sentence Builder and Word Raid, to play with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | Screenshot van SurfEnglish (Engelse interface) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading / linkText | Van dezelfde ontwikkelaar ／ SurfEnglish: Bilingual News (EN) | From the same developer / （店面名，不翻译） | More from the maker / SurfEnglish: Bilingual News |
| cta.title | Lees websites voortaan tweetalig op je iPhone | From now on, read websites bilingually on your iPhone | Start reading websites bilingually on iPhone |
| cta.recap | Veeg om te vertalen · Dubbeltik voor de betekenis · Voorlezen · 21 talen | Swipe to translate · Double-tap for the meaning · Read aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（表中 nl 为可读形式：实际 JSON 里"·"和"–"前是 U+00A0，复数对象已代入当前值，价格由构建按 `Intl.NumberFormat('nl')` 输出为"US$ 3,99"。）

FAQ 答案（不在回译清单里）也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音不限次、Plus 为月订且标明美区价格 + 以 App Store 为准；`restore` 引用 App 按钮 “Nu Upgraden” → “Aankoop Herstellen”（T-E）；`engines` 写明云端目前由 Azure 与 Google 提供、本地用 iOS 系统翻译且首次可能要下载语言资源、额度用完可切本地；`devices` 的 S0 答案不写扩展名称（R45）。

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都有意为之：

1. `meta.description`："in the built-in browser" 写成 "in WordByWord"（文档 03 §3.2 允许的写法，与 §3.9 nl 草案一致）。
2. `hero.title`："any web page" 写成 "een webpagina"，"right below" 写成 "eronder"（草案原样；加 "elke"/"direct" 会超过 75 字符）。
3. `hero.platformNote` 不写美区价格（D2，与 ja / zh-Hans / es / fr / de 相同），写"Plus is een maandabonnement"。
4. `features[lookup].text` 写成"先读整句，再看这个词是否属于某个固定说法"；en 的"短语优先"在要点 ② "Uitdrukkingen en vaste combinaties worden eerst herkend"里保留（为让 390 px 页面不超 13,000 px，§7）。
5. `sibling.card.uiNote` 写 "Gratis"，没写种子的 "om te beginnen"（为让 note 在手机上是 2 行；App Store 对"免费 + 内购"的 App 也只标"Gratis"）。
6. `sibling.card.points[2]` 省略了 "to the app"（每条 ≤ 45 wu，与 es / fr / de 相同）。
7. `faq[what-is]`、`faq[devices]`（`a` 与 `aExtLive`）、`faq[english-learner]` 的链接文字加了 "(in het Engels)"，因为 about 页、扩展页和 SE 官网（en-site）都只有英文。
8. 价格表单元格写 "{n}/dag""Geen limiet"，Plus 列表头写 "US$ 3,99/maand (VS)"（en："{n} / day""No daily limit""$3.99 / month (US)"），为让表格在 375 / 390 px 不出现容器内横向滚动（§7）。

## 4. 没把握的措辞（14 处，附回译与替代写法）

| # | 键 | nl | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | `features[lookup].kicker` | Dubbel tikken om op te zoeken | Double tap to look up | Dubbeltik voor de betekenis ／ Dubbeltikken | App 叫法（`word_meaning_lookup_title` 去掉"(AI Betekenis)"，与 en / ja / es / fr / de 做法一致），29 > 24 → L-8 W；而且 App 写成两个词"Dubbel tikken"，Apple 荷兰语与本稿正文写一个词"dubbeltik(ken)"。需负责人决定（§6 第 4 条） |
| 2 | `features[speech].text`、FAQ `engines`、价格表 `localVoice` | “AI Lezing” ／ “Lokale Lezing” | "AI Lecture" / "Local Lecture" | AI-voorlezen ／ Lokaal voorlezen | 照 App 原文引用（波 2 规则：引用的 UI 名保留 App 字符串）；但荷兰语"lezing"通常是"讲座 / 演讲"，不是"朗读"。正文一律用自然说法"voorlezen"。报给 App 侧（§6 第 3、5 条） |
| 3 | `hero.eyebrow` | Websites tweetalig lezen, voor taalleerders | Reading websites bilingually, for language learners | Tweetalige leesapp voor taalleerders | en 的品类词 "bilingual web reader" 直译"tweetalige weblezer"不是常用词 |
| 4 | `hero.lede` / FAQ `what-is` / 页脚 | leesassistent | reading assistant | leeshulp ／ lees-app | R39 定义句；"leeshulp"在荷兰语里也常指阅读障碍辅助工具，所以没用 |
| 5 | `meta.ogHeadline` | Het origineel blijft staan. | The original stays in place. | Met het origineel erbij. | 没用更贴近 en 的"Behoud het origineel"，因为附录 A 建议把"origineel behouden"留给 G1 |
| 6 | 价格表 `perDay` / `noLimit` / `plus.price` | {n}/dag ／ Geen limiet ／ US$ 3,99/maand (VS) | 50/day / No limit / US$3.99/month (US) | {n} per dag ／ Geen daglimiet ／ US$ 3,99 per maand (VS) | 原写法下表格最小宽 388 px，在 375 / 390 px 的容器（341 / 356 px）里要横向滚动才能看全 Plus 列；短写法刚好放下（§7） |
| 7 | `sibling.card.uiNote` | Gratis · Geen Nederlandse interface (wel Engels en 11 andere talen) · Vertaalt naar het Nederlands | Free · No Dutch interface (but English and 11 other languages) · Translates into Dutch | 文档 04 §5.7 草案："Gratis om te beginnen · De app-interface is niet in het Nederlands (wel in het Engels en 11 andere talen) · Vertalingen naar het Nederlands mogelijk" | 草案在 390 px 下 3 行，页面多 19 px |
| 8 | `features[engines].text` | Cloud (Azure en Google) of iOS op het apparaat; cloudtegoed op? Kies lokaal. | Cloud (Azure and Google) or iOS on the device; cloud allowance used up? Choose local. | … cloudlimiet bereikt? Ga lokaal verder.（n81，超 80） | 规格清单 80 字符上限；"tegoed op"是"额度用完"的口语说法 |
| 9 | `faq.items[free].a` | 20 woordverklaringen met dubbeltikken | 20 word explanations by double-tapping | 20 keer een woord opzoeken met dubbeltikken | 荷兰语没有自然的可数名词对应"lookup" |
| 10 | `faq.items[free].a`、`features[syntax].text` | veegvertaling(en) | swipe translation(s) | vertaling(en) met een veeg | App 自己在 `chunk_extraction_mode_description_*` 里用"veegvertaling"，但它是新造复合词 |
| 11 | `features[x].*`、FAQ `x` / `english-learner` | X-berichten ／ bericht | X posts / post | X-posts ／ post | K9 关键词用"X-berichten"；X 的荷兰语界面本身用"post" |
| 12 | `hero.platformNote`、`features[devices].text`、FAQ | Macs met Apple-chip | Macs with an Apple chip | Macs met Apple silicon | Apple 荷兰语资料用"Mac met Apple-chip"（法语 "puce Apple"、德语 "Apple Chip" 同理）；请审校确认 |
| 13 | `features[speech].text` | Premium- of Enhanced-stemmen | Premium or Enhanced voices | Premium- of verbeterde stemmen | 照 App 的 nl 字符串（`local_speech_engine_*`）；iOS 荷兰语设置里"Enhanced"可能显示为"Verbeterd"，未在设备上核对 |
| 14 | `cta.title` | Lees websites voortaan tweetalig op je iPhone | From now on, read websites bilingually on your iPhone | Begin met tweetalig lezen op je iPhone | "voortaan"对应 en 的 "Start …"；替代写法丢了 K1 核心名词"websites" |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法**（xcstrings nl，引用处照原文，用 “ ”）：Veeg om te vertalen（`daily_sentence_translation_limit`）；Dubbel tikken om op te zoeken (AI Betekenis)（`word_meaning_lookup_title`）；Meer definities；Segmentextractie；Actieverloop van de zin / Actieverloop（正文括注"in de app: “Actieverloop van de zin”"，标题与表格用 App Store 名 Action Flow，D3）；AI-syntaxuitleg ophalen；AI Lezing / Lokale Lezing；Cloudvertaalmotor / Lokale motor；Automatisch / Alinea / Zin voor Zin；Automatisch tonen / Handmatig tonen；Nu Upgraden；Aankoop Herstellen；Upgraden naar Plus。nl 没有 `右滑翻译` 键的值（T-A "—"），kicker 用功能名。
- **按规则 ③ 修正、不照抄的 App 写法**：X5 "AI Uttale (Setning)"（挪威语）→ "AI-uitspraak (zin)"；为与之并列，"AI Uitspraak (Woord)" 写成 "AI-uitspraak (woord)"；X6 "Cita Stijl / Citatstijl" → "citaatstijl"；X7 "Dubbelklik" → "dubbeltik"；拼写分写错误（spatiefout）"Bron Taal""AI Betekenis"不用（正文写"brontaal"，表格行名把后缀缩成"(AI)"）。
- **手势**：句中"veeg (een alinea) naar rechts""veeg naar rechts over een alinea / een bericht"（与 App 提示 `tip_swipe_to_translate`"Veeg naar rechts over …"一致）；双击一律"dubbeltik(ken)"（Apple 荷兰语写法），名词用"vegen en dubbeltikken"。
- **AI**：荷兰语本来就写"AI"，不存在 es / fr / de 的"IA / KI"混用问题；复合词按荷兰语正字法加连字符（AI-stem、AI-uitspraak、AI-syntaxanalyse）。
- **称谓**：je / jouw（非正式），全站没有 u。
- **X**：kicker 与 FAQ 问句写"X (voorheen Twitter)"（§7.2.3），H3 用 K9 关键词"X-berichten (Twitter)"。
- **Apple 用语**：Apple Account、"iOS 18 of nieuwer"、Mac met Apple-chip、App Store 徽章文字"Download in de App Store"（`appStoreBadgeAlt` = "Download WordByWord in de App Store"，SE 文字链接同一动词）。
- **标点**：引号 “ ”（与 App nl 字符串一致），撇号 ’（webpagina’s），破折号用两侧带空格的 en dash（ – ），"·"与"–"前用 U+00A0，避免落到行首；价格"US$ 3,99"由构建输出。
- **App 店面副标题**：`meta.appStoreSubtitle` = "Veeg om te vertalen, AI legt uit" 是 US 副标题的译文；NL 店面的真实副标题没有资料（研究 05 §2.1 只列了 US / JP / CN / TW / KR / DE），不联网无法核对。该键只用于 about 事实表，nl 没有 about 页，不渲染（§6 第 6 条）。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，`home-nl.jpg` 与 `og.json` 没有复制进真实仓库。nl.json 入库后，`node build.mjs` 会报 `D-23 home-nl: no OG image`，直到负责人跑 `node scripts/og.mjs --only home-nl`（新副本实测通过：58 px × 3 行、副标题 30 px × 2 行、148.2 KB）。
2. **nl lint 词表**：`docs/redesign-2026/ops/m3/nl-lint.json`（附录 A）覆盖 27 条规则 + `seOwned` / `seOwnedLead` / `reserved.G1`。在新副本合入后：全站 build 与 `--pseudo` 0 error，nl 的 L-14 / L-9 警告消失，测试 58/58；`seOwnedLead` 作用于所有语言所有页面的 H2，我只用了荷兰语句首，其余 8 个语言的 H2 都不命中。是否合入、由谁合入，请决定。
3. **报给 App 侧的荷兰语字符串问题**（网站按规则 ③ 修正或照引并说明）：
   - ① `ai_pronunciation_sentence` = "AI Uttale (Setning)" 是挪威语（X5）；
   - ② `translation_style_title_quote_style` = "Cita Stijl"、键 "Quote Style" = "Citatstijl"，应为"Citaatstijl"（X6）；
   - ③ `tip_double_tap_context_meaning` 用了鼠标说法"Dubbelklik"（X7）；
   - ④ `audio_playback_title_streaming` / `_local` = "AI Lezing" / "Lokale Lezing"："lezing"一般指讲座，建议"AI-voorlezen" / "Lokaal voorlezen"（见第 5 条）；
   - ⑤ 分写错误（spatiefout）："Bron Taal"（同一 App 别处写"Brontaal selecteren"）、"Swipe Vertaalgeschiedenis"、"Swipe Vertaal Detail"、"(AI Betekenis)"、"AI Uitspraak (Woord)"、"Syntax Uitleg"、"Geschiedenis Detail"、"App Taal"；
   - ⑥ 同一手势两种叫法：功能名"Veeg om te vertalen"、说明里"veegvertaling"，但"Swipe-vertaalmotor""swipe-vertaling""online swipe-vertalingen""Swipe Vertaalgeschiedenis"；引擎名"Lokale motor"，额度提示里却是"lokale engine"；
   - ⑦ 错字：`free_tts_limit_message`"uitspraakt"（应为 uitspraken）、`remaining_word_tts_today`"woorduitspraaken"（应为 woorduitspraken）、`swipe_translation_online_limit_reached_title`"Online Vertaaliet Bereikt"（应为 vertaallimiet）；`remaining_sentence_tts_today`"Overgebleven zinnen vandaag"漏了"发音"；`subscribed_label`"Ingeschreven"（应为"Geabonneerd"）；
   - ⑧ 按钮用英语式词首大写（"Nu Upgraden""Aankoop Herstellen""Opnieuw Proberen""Schakel Om en Probeer Opnieuw"），荷兰语应为句首大写；网站 FAQ 照屏幕原样引用（规则 ①）；
   - ⑨ 称谓混用：多数提示用 je，书签相关提示用 u（"Uw bladwijzer …""Wilt u …"）。
4. **`features[lookup].kicker`**：保留 App 叫法"Dubbel tikken om op te zoeken"（规则 ①，与 en / ja / es / fr / de 做法一致）会有 1 条 L-8 W（29 > 24）；改成"Dubbeltikken"（12）可消除 W 并与 Apple 写法一致，但和 App 界面不一致，同时要改 glossary。
5. **"AI Lezing / Lokale Lezing"**：目前按波 2 规则照引 App 名（features[speech] 正文、FAQ `engines`、价格表"iOS-stem (Lokale Lezing)"），正文用"voorlezen"。如果负责人认为这属于规则 ③ 的"App 叫法本身有错"，网站可改写为"AI-voorlezen / Lokaal voorlezen"，并改 glossary 的 `contains` / `required`。
6. **`meta.appStoreSubtitle`**：请提供 NL 店面的真实副标题，或确认保留现值（nl 页面不渲染此键）。
7. **为版面做的缩写**（§7）：价格表行名"· cloud / · lokaal""(AI)"，单元格"{n}/dag""Geen limiet"，表头"US$ 3,99/maand (VS)"；SE 卡片 uiNote 用"Gratis"；`features[lookup].text` 与 `languages.lede` 缩短。如果负责人更看重贴近 en / 种子，可恢复原写法（代价：表格在 375 / 390 px 要容器内横向滚动；390 px 页面回到 13,100 px 以上）。
8. **L-4 的 2 条 review**："Menu"（`common.menu`）和"Product"（`footer.product`）是荷兰语的正常写法，保留。
9. **"(in het Engels)"标记**：按波 2 要求加在 `@about`、`@chrome`、`@se-site` 的富文本链接文字里；`aExtLive` 的扩展链接也加了（与 zh-Hant 相同，fr 未加）。页脚里指向英文页的链接（Over WordByWord、Ondersteuning、Privacybeleid）没有加，是否在页脚也加，请统一决定（影响所有非 en 语言）。
10. **页面长度**：最终副本 390 px 下 12,960 px（en 12,854）；375 px 13,102 px；320 px 13,732 px。页脚的语言链接列表随已发布语言增多而变高，20 个语言全部发布后各语言页面都会再增加几十像素，这一点与 nl 文案无关。
11. **复数对象**：文档 08 §1.4 没要求 nl 用复数对象，我按 M3 简报写了 one / other 两类；渲染结果与写普通占位符相同。
12. **母语审校**：按 R36，nl 上线后补母语审校；请审校人重点看 §4 的 14 处和 §6 第 3–5 条。

## 7. 版面实测（新副本 + `scripts/serve.mjs`，端口 4602；为不联网，渲染用的 dist 副本去掉了 GA 脚本）

| 视口 | SE 卡片高度（上限） | 样张红色译文条顶端 | 整页高度 | 横向溢出 |
|---|---|---|---|---|
| 1280 × 900 | 370 px（420） | — | 10,326 px | 无 |
| 390 × 844 | 432 px（480） | 735 px（< 844，R69） | 12,960 px（目标 ≤ 13,000；同一副本 en 12,854） | 无；额度表 356 / 356 px，无需容器内滚动 |
| 375 × 812 | 432 px（480） | 733 px | 13,102 px | 无；额度表 341 / 341 px |
| 320 × 640 | 550 px（560，R84） | — | 13,732 px | 无（画廊与额度表在各自的横向滚动容器内，与 en 相同；额度表 338 / 286 px，en 305 / 286 px） |

为满足上面的数字所做的调整（初稿 → 定稿，私有副本实测，当时 390 px 页面 13,098 → 12,928 px）：

- 价格表行名："Veeg om te vertalen · cloudmotor / · lokale motor"→"· cloud / · lokaal"，"Dubbel tikken om op te zoeken (AI-betekenis)"→"(AI)"：三行由 3 行变 2 行（−66 px）。
- 额度单元格与 Plus 表头："{n} per dag"→"{n}/dag"，"Geen daglimiet"→"Geen limiet"，"per maand"→"/maand"：表格最小宽度 388 → 341 px，375 / 390 px 下不再需要容器内横向滚动。
- `features[lookup].title`："Dubbeltik op een woord: de betekenis in context, uitgelegd door AI"→"Dubbeltik op een woord: AI geeft de betekenis in context"（3 行 → 2 行）；`features[lookup].text` 与 `languages.lede` 各缩短一行。
- `sibling.card.uiNote`：3 行 → 2 行（§4 第 7 条），卡片 451 → 432 px（390 px）。
- 目视检查了 390 px 的 hero、样张与查词卡、价格表、SE 卡片和 FAQ，以及 1280 px 的 hero 与 SE 卡片：没有溢出、异常断行或字体回落；header 在 < 560 px 显示短标签"Download"；hero 的 App Store 徽章与"Zo werkt het"在 375 / 390 px 同一行。

## 附录 A：建议的 nl lint 词表（`docs/redesign-2026/ops/m3/nl-lint.json`）

覆盖范围：`claims-lint.json` 中所有有按语言写法的规则（27 条；nl 原本一条都没有，包括已有多语言写法的 `selection-translate` 与 `jargon`）；跳过只有 `*` 的 `io-home`、`engine-claim`。`keywordMap` 部分对应 `keyword-map.json` 的 `seOwned.nl`（保留现有"Engels leren"并追加）、`seOwnedLead.nl`（新建）、`reserved.G1.nl`（新建）。完整正则见该文件；以 `(?<![\p{L}])` / `(?![\p{L}])` 代替 `\b`，避免"nieuw"（新）误中"nieuws"（新闻）这类情况。

**自测**（`scratchpad/nl-work/test-lint.mjs`，按校验器的语义：渲染后的叶子值，`only` / `exempt` / `exemptPrefix` 生效，跳过 `seo.*`）：nl 文案 0 命中；豁免键里的否定句命中但允许（FAQ `whole-page` 问句、`safari` 答案、`android` 问句、`devices` 答案）；`seOwned` 在 SE 检查区、`reserved.G1` 在 title / H1 / description / `cta.title`、`seOwnedLead` 在 nl 所有 H2 上 0 命中；合入新副本后全站 build / `--pseudo` 0 error（其余 8 个语言的 H2 也不命中 `seOwnedLead`）。

**反例句（57 句全部命中各自规则）**：

| 规则 | 反例句 |
|---|---|
| whole-page | Vertaal de hele webpagina met één tik. ／ Volledige pagina’s in één keer vertalen. ／ Snelle paginavertaling voor elke site. |
| swipe-left | Veeg een alinea naar links om te vertalen. ／ Naar links vegen verwijdert de vertaling. |
| safari-extension | Werkt als Safari-extensie. ／ Vertaal in elke app op je iPhone. ／ Je hoeft niet van app te wisselen.（旧站原句） |
| selection-translate | Selecteer tekst om te vertalen. ／ Markeer een woord en vertaal het direct. |
| offline | Werkt ook offline. ／ Vertalen zonder internetverbinding. |
| unlimited-ai-voice | Onbeperkte AI-uitspraak met hogere kwaliteit.（旧站原句）／ AI-uitspraak zonder limiet. |
| dark-mode-theme | Aangepaste thema's en donkere modus.（旧站原句）／ Kies je eigen kleurthema. |
| shortcuts-volume | Pas sneltoetsen aan en stel het volume in. |
| vocab-sync | Bewaar woorden als flashcards. ／ Synchroniseert tussen al je apparaten. |
| android | Ook verkrijgbaar op Android. ／ Download de Android-versie via Google Play. |
| desktop-version | Er is ook een desktopversie. ／ Download WordByWord voor Windows. |
| x-app | Vertaal berichten in de X-app. |
| plus-early-access | Vroege toegang tot nieuwe functies.（旧站原句） |
| privacy-claim | Er worden geen persoonlijke gegevens verzameld.（旧站原句）／ WordByWord verzamelt geen gegevens. |
| initial-version | De eerste versie ondersteunt meer dan 20 talen.（旧站原句） |
| language-pairs | Ondersteunt meer dan 20 taalkoppels.（旧站原句） |
| style-count | Kies uit 8 vertaalstijlen. ／ Zeven verschillende stijlen. |
| auto-detect-target | De app detecteert automatisch de doeltaal.（旧站原句） |
| history-by-date | Notities worden per datum gegroepeerd.（旧站原句） |
| plus-only | Zinsanalyse is alleen voor Plus beschikbaar. ／ Exclusief voor WordByWord Plus. |
| speaking-practice | Verbeter je luister- en spreekvaardigheid.（旧站原句）／ Oefen je uitspraak met AI. |
| jargon | Zin-voor-zin vergelijking en uitlijning.（旧站用语） |
| replacement-tone | SurfEnglish past misschien beter bij je. ／ Een zusterapp van WordByWord. ／ SurfEnglish vervangt WordByWord. |
| se-on-device-voice | Met AI-stemmen op je apparaat die ook offline werken.（规则只作用于 SE 卡片与 FAQ `english-learner`） |
| se-hype | Nieuw van de ontwikkelaar van WordByWord. ／ Leer sneller Engels.（同上，另含 `sibling.footer`、`about.family`） |
| hype | De beste vertaalapp voor iPhone. ／ Al 10.000 gebruikers. ／ Nieuw van het WordByWord-team. |
| ext-language-count | Vertaalt naar 20+ talen.（只作用于 `chromeExtension.*`） |
| seOwned | Engels leren met echte websites ／ Leer Engels met nieuws ／ Engels nieuws tweetalig lezen ／ Chunks voor Engelse zinnen |
| seOwnedLead | Leer je Engels? Probeer SurfEnglish ／ Engels leren met nieuws op jouw niveau |
| reserved.G1 | Hoe vertaal je een webpagina op iPhone en houd je het origineel? ／ Webpagina’s vertalen met behoud van het origineel ／ Zo vertaal je een webpagina op je iPhone |

**必须放行**（0 命中）："Voor taalleerders"、"talen leren door websites te lezen"、"WordByWord is een leesassistent voor taalleerders …"（表 C 的受众词，不含"Engels"）；`seOwnedLead` 对"SurfEnglish: dagelijks Engels nieuws op jouw niveau""Veelgestelde vragen over WordByWord""Elke dag gratis – upgrade naar Plus als je meer leest"不命中。注意：`seOwned` 的"Engels(e) nieuws"会让 nl 的 title / description / H1 / OG / 功能区 H2 永远不能写"Engels nieuws"——这正是 SE 的主词，SE 卡片与 FAQ 不在检查区，不受影响。合入前请母语审校再看一遍 `hype` 的"de enige"（可能误伤"de enige keer"一类正常句子）和 `initial-version` 的"eerste versie"。

## 附录 B：验证记录

最终验证在 `scratchpad/wbw-m3-nl-final/`（rsync 自真实仓库，HEAD `c657445`，含已提交的 en / zh-Hans / zh-Hant / ja / ko / es / fr / pt-BR / de），加入 `nl.json`、`glossary/nl.json`，并在副本里生成 `home-nl` OG。

| 命令 | 结果 |
|---|---|
| `node scripts/og.mjs --only home-nl` | ✓ headline 58 px × 3、sub 30 px × 2、q82、148.2 KB |
| `node build.mjs --out …/dist` | 17 页，0 error；nl 的 W：L-8（lookup kicker 29 > 24）、L-4（2 review + 6 expected）、L-14（26 条规则无 nl 词表）、L-9（无 nl G1 模式） |
| `node build.mjs --pseudo --out …/dist-pseudo` | 0 error |
| `node scripts/check.mjs --dist …/dist` | 17 个 HTML，0 error，0 warning |
| `node scripts/check.mjs --keys nl` | 0 missing，0 not in en |
| `node --test scripts/tests/*.test.mjs` | 58 pass，0 fail |
| 合入 `nl-lint.json` 后（另一份副本）build / `--pseudo` / test | 0 error；nl 只剩 L-8 与 L-4；58/58 |
