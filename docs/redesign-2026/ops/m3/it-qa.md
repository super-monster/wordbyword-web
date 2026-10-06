# M3 · it（Italiano）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | it（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校） |
| 交付 | `src/locales/it.json`（新建：首页全部键 + `notfound.*`；it 没有 about / 扩展页 / legal 页，与 ja、fr 一样不交付 `about`、`chromeExtension`、`legal`）；`src/data/glossary/it.json`（新建，§7.2.5 格式）；`docs/redesign-2026/ops/m3/it-lint.json`（claims-lint / keyword-map 的 it 词表提案，未合并） |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（it 行，表 A / B / C）、§3.1–§3.9（it 草案）；文档 04 §5.1、§5.5、§5.7（it 的 uiNote、linkText 种子、T1–T11）；裁定 R36、R39–R43、R46、R52、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照，es / fr / ko / zh-Hant / de / pt-BR 的 QA 记录作流程参照 |
| App 叫法来源 | `WordByWordPrototype/Localizable.xcstrings` 的 `localizations.it`（逐条核对 T-A…T-E），以及 App 内 Free / Plus 对比表的行名（`FeatureQuotaManager.swift` `featureDisplayName`、`SubscriptionComparisonView.swift`） |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-it/` 写作、构建、渲染检查；最终校验在新副本 `scratchpad/wbw-m3-it-final/`（真实仓库 HEAD c657445 + 本次两个文件）上完成。OG 图只在副本里生成，**没有**复制进真实仓库 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys it`：0 缺、0 多）。新副本（HEAD c657445 + it 两个文件 + 副本内生成的 `home-it` OG 图）上：`node build.mjs` **0 error**，`--pseudo` **0 error**，`scripts/check.mjs` 0 error / 0 warning，`node --test scripts/tests/*.test.mjs` **58/58**。
2. it 自己的 warning：L-8 `features[lookup].kicker` 27 > 24（保留 App 叫法 "Tocca due volte per cercare"，见 §6-4）；L-4 有 4 个值与 en 相同且都是正确的意大利语写法（Home、Menu、Fig.、FAQ），另 6 个是文档 08 §1.5 列为正常的样张照抄值。真实仓库的数据文件还缺 it 词表，所以另有 L-14（24 条规则"未覆盖"）与 L-9（无 G1 how-to 模式）两条汇总 W；把 `it-lint.json` 并进副本后这两条消失，it 文案 0 命中（附录 A、B）。
3. title / description / H1 以文档 03 §3.9 的 it 草案为起点：title 逐字照用（n56）；H1 加了方向"a destra"（n75，见 §1）；description 重写为 n159。
4. **AI 而不是 IA**：意大利语 App 的所有字符串都写 "AI"（Lettura AI、Significato AI、Ottieni spiegazione sintattica AI、AI Pronuncia…），意大利科技产品文案也以 "AI" 为常见写法。网站全页统一写 "AI"，避免引号里的 App 名称（AI）和正文（IA）在同一页混用。这偏离了文档 03 表 A / 文档 08 §7.3 的 "(IA)"，需负责人确认（§6-3）。
5. SE：`seMode('it') = en-site`。卡片 note 由 uiNote 替换（"界面是英语和另外 11 种语言、没有意大利语；可译成意大利语"）；linkText 带 "(sito in inglese)"，链 SE 英文站（模板加 `hreflang="en"`）；FAQ `english-learner` 在链接前加了 §7.8 的界面说明句，链接文字也带 "(in inglese)"。
6. OG（只在副本）：`node scripts/og.mjs --only home-it` 一次通过，标题 64 px × 3 行（与 en、es 同版式），副标题 30 px × 2 行，154.6 KB。
7. 渲染（新副本 + `serve.mjs` 端口 4601，外部请求全部拦截）：1280 / 390 / 375 / 320 px 均无横向溢出；SE 卡片 370 / 432 / 453 / 535 px（上限 420 / 480 / 480 / 560）；390 px 整页 **12,996 px**（软目标 ≤ 13,000）；390×844 下样张红色译文条顶端 775 px（R69）。为此缩短了 hero 次级链接、价格表行名、SE 卡片标题与画廊图注（§7）。
8. **需要负责人处理的事**（§6）：① 真实仓库生成 `home-it` OG 图之前构建报 D-23；② `it-lint.json` 待合并；③ AI / IA；④ kicker 的 L-8 W；⑤ 报给 App 侧的意大利语字符串问题。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | « WordByWord: traduttore bilingue di pagine web per iPhone » | 品牌位 WordByWord 在首（IT 店面名就是 WordByWord，文档 03 §1.5）；K1 主词「traduttore bilingue di pagine web per iPhone」**完整出现**（文档 03 §2.3 表 A）；`titleMust` = iPhone / pagine web / traduttore 全部命中；`primaryTokens.home.it`（iPhone、traduttore）命中；无 how-to 句式 | n56（上限 60） |
| `meta.description` | « Impara le lingue: in WordByWord scorri a destra un paragrafo e sotto c’è la traduzione. Tocca due volte una parola per il significato. Gratis su iPhone e iPad. » | 受众词「imparare le lingue」（表 C，R39）；K1 动作 + 结果在前半句；"in WordByWord"（文档 03 §3.2 允许，代替"内置浏览器"）；K2 动作「tocca due volte una parola」+「significato」；平台 + 免费收尾（SEO-11）；不写价格 | n159（120–160） |
| `hero.title`（H1） | « Scorri a destra un paragrafo di una [[pagina web]]: la traduzione appare sotto. » | K1 核心名词「pagina web」（荧光笔 2 词，R65）；"段落"一级动作 + 结果（R46、PRO-19），不暗示整页；不含品牌（R27）。比草案多了"a destra"：意大利语"scorrere un testo"也有"浏览、扫读"的意思，加方向后只能理解成右滑手势 | n75（上限 75） |
| `hero.eyebrow` | « WordByWord · Lettore web bilingue per imparare le lingue » | 品牌 + 品类（bilingual web reader）+ 受众 | 56 wu（≤ 60） |
| `hero.lede` = `ledeShort` | « WordByWord è un assistente di lettura per chi impara le lingue, su iPhone e iPad. » | R39 定义句，以"WordByWord è"开头；"assistente"只用在定义句（D13） | n81（≤ 90，故两者相同） |
| `meta.ogHeadline` | « Leggi qualsiasi pagina web in due lingue. [[L’originale resta lì.]] » | K1 场景（双语阅读 + 原文保留）；荧光笔 1 处 | 64 px × 3 行 |
| 功能区 H2 | « Scorri per tradurre, tocca due volte per il significato — sui siti che leggi » | K1「scorri per tradurre」+ K2「significato」；"sui siti che leggi"（PRO-16，不写"任何网站"） | n76 |
| 功能 H3 | K1「Scorri per tradurre: la traduzione appare subito sotto l’originale」；K2「Tocca due volte una parola: l’AI ti dà il significato nel contesto」；K9「Leggi i post di X (ex Twitter) in due lingue nel browser integrato」；K5「Estrazione Segmenti e Action Flow, per le frasi in inglese」（R83 带"in inglese"）；K3「Lettura ad alta voce con l’AI, o voci iOS rapide sul dispositivo」；K4「Analisi AI della struttura delle frasi lunghe」；K7「Traduzione cloud o sul dispositivo」；K6「Cronologia di traduzioni e parole consultate」 | K6、K7 与表 A / B 主词逐字一致；K2「significato … nel contesto」、K3「lettura ad alta voce con l’AI」、K4「analisi … struttura … frasi」为主词的语序变体 | 全部 ≤ 70 wu |
| 语言段 H2 | « Traduzione in 21 lingue, e non solo dall’inglese »（复数对象） | K8 主词「traduzione in 21 lingue」逐字 | 48 wu |
| 价格段 H2 | « Gratis ogni giorno: passa a Plus quando leggi di più » | K10「gratis」+ Plus | — |
| 最终 CTA H2 | « Inizia a leggere i siti web in due lingue su iPhone » | 动作句，不是 G1 标题，不暗示整页（R46） | 51 wu |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有词表 `imparare l['’]inglese` 及附录 A 新增的 `notizie in inglese`、`impar\w* l’inglese`、`segmenti` 等全部 0 命中；"Impara le lingue"不命中）；title / H1 / description / `cta.title` 里没有 how-to 句式（come tradurre、mantenere l’originale、guida）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 可解析；键与 en 一致（`--keys it` 0 缺 0 多）；数组 id 与顺序同 en。新副本 build / `--pseudo` 0 error，`check.mjs` 0 / 0，测试 58/58。真实仓库在生成 OG 前会报 D-23（§6-1） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条；uiNote / FAQ 里的"11"是 §7.8 规定由译者写死的 {se.uiLanguages} − 1）。`Intl.PluralRules('it')` 的类别是 one / many / other：所有"数字占位符 + 可数名词"都写成三类复数对象（many 只用于整百万，意大利语写"# di lingue"），共 12 处：`languages.title / uiCount / targetCount`、`gallery.items[languageList].caption`、`faq.items[languages].a`、`faq.items[free].a`（5 处）、`cta.recap`、`sibling.card.note`。代入当前值后渲染为"21 lingue""20 lingue""50 traduzioni""20 ricerche""30 estrazioni""20 Action Flow""5 spiegazioni sintattiche"。`{n}/giorno` 与"{quota.localSwipe.free} con il motore locale"后面没有可数名词，与 en 同构 |
| Q3 | ✓ | title 以品牌位开头，`titleMust` 三个词元齐全；K1 是产品 / 品类意图（traduttore）；没有 §1.4 禁用主词、没有 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[pagina web]]`（2 词）；功能 H3、`languages.title` 无 `[[ ]]`；`hero.lede` 以"WordByWord è"开头，写明"per chi impara le lingue" |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展只出现在 FAQ `safari` 的否定回答里；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT；CJK 原文不能双击查词、Estrazione Segmenti / Action Flow 仅英语都写在同屏；没有 jargon "allineamento"、没有"selezionando"（legacy 的两处错误都没有沿用）。附录 A 的 it 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required`，L-13 0 违规）；句子里按 §7.3 写"scorri verso destra / a destra""tocca due volte"；按钮 / 界面名照 App 原文加引号引用："Aggiorna Ora""Ripristina Acquisto""Ottieni spiegazione sintattica AI""Cronologia Traduzione Swipe""Lettura AI""Lettura locale""Flusso azioni della frase""Altre definizioni""Automatico / Paragrafo / Frase per Frase"。X1–X13 都不涉及 it |
| Q7 | ✓ | 5 处截图 alt、4 条画廊图注 + alt、2 个截图图注标签（`common.screenshotLabel` / `screenshotExcerptLabel`）、OG alt、SE 截图 alt 与图注都写了"interfaccia in inglese"；内容逐张对照了 `assets/img/shot/en/*`（西语维基页 + 英文译文、"convirtiéndose"卡片、设置页 Auto / Quote Style / Local Read、"matrimonio"释义页、Spanish → English (US)、语言列表——列表里确实有"Italian (Italiano)"）；`features[x].alt` 描述社交帖样张并注明"non è uno screenshot"；`demo.lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | en-site：note 由 uiNote 替换，uiNote 不含 `{se.uiLanguages}`（L-11 通过）；linkText = SE 核心词短语 + 品牌 +"(sito in inglese)"（n73，en-site 上限 80）；FAQ 加了界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句"Stai imparando l’inglese?"；没有"aggiorna / sostituisce / nuovo / più adatta / fa più al caso tuo"（T10）；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音 |
| Q9 | ✓（1 条 W） | 代入占位符后全部在 §7.6 / L-8 限内，唯一例外是 kicker 27 > 24（§6-4）。title 56、description 159、H1 75、eyebrow 56、lede 81、how 180、platformNote 137、规格清单 4 条 75–79、SE body 30 词、SE H2 46、要点 38–39 wu、linkText 73、`pricing.summary` 96 wu、`cta.recap` 84、所有 alt ≤ 125（最长 OG alt 正好 125） |
| Q10 | ✓ | 拉丁文字，不涉及 RTL / CJK；没有 `{wbr}`（R61） |
| Q12 | ✓ | 见 §7：四个宽度无横向溢出，没有字体回落成方框 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）不写扩展名称；`aExtLive` 写了名称和"只从该页面的链接安装"；首页没有 WordByWord.io（`footer.notAffiliated` 不在首页渲染） |

## 3. 回译对照（it → English，对照 en.json）

| 键 | it | 回译 | en.json |
|---|---|---|---|
| meta.title | WordByWord: traduttore bilingue di pagine web per iPhone | WordByWord: bilingual web page translator for iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Impara le lingue: in WordByWord scorri a destra un paragrafo e sotto c’è la traduzione. Tocca due volte una parola per il significato. Gratis su iPhone e iPad. | Learn languages: in WordByWord swipe a paragraph to the right and the translation is right there below. Double-tap a word for its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Leggi qualsiasi pagina web in due lingue. [[L’originale resta lì.]] | Read any web page in two languages. [[The original stays where it is.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | Scorri a destra su un paragrafo · tocca due volte una parola per il suo significato nel contesto | Swipe right on a paragraph · double-tap a word for its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | Scorri a destra un paragrafo di una [[pagina web]]: la traduzione appare sotto. | Swipe a paragraph of a [[web page]] to the right: the translation appears below. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord è un assistente di lettura per chi impara le lingue, su iPhone e iPad. | WordByWord is a reading assistant for people learning languages, on iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Apri un sito nel browser integrato dell’app e scorri verso destra su un paragrafo: la traduzione appare subito sotto. Tocca due volte una parola e l’AI ti spiega cosa significa lì. | Open a site in the app's built-in browser and swipe right on a paragraph: the translation appears right below. Double-tap a word and the AI explains what it means there. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Scorri per tradurre, tocca due volte per il significato — sui siti che leggi | Swipe to translate, double-tap for the meaning — on the sites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Scorri per tradurre: la traduzione appare subito sotto l’originale | Swipe to translate: the translation appears right below the original | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Tocca due volte una parola: l’AI ti dà il significato nel contesto | Double-tap a word: the AI gives you its meaning in context | Double-tap a word for its AI meaning in context |
| features[x].title | Leggi i post di X (ex Twitter) in due lingue nel browser integrato | Read X (formerly Twitter) posts in two languages in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Estrazione Segmenti e Action Flow, per le frasi in inglese | Chunk Extraction (app name, lit. "Segment Extraction") and Action Flow, for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Lettura ad alta voce con l’AI, o voci iOS rapide sul dispositivo | Read-aloud with AI, or fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Analisi AI della struttura delle frasi lunghe | AI analysis of the structure of long sentences | AI sentence structure analysis for long sentences |
| features[engines].title | Traduzione cloud o sul dispositivo | Cloud or on-device translation | Cloud or on-device translation |
| features[display].title | Layout e stile delle traduzioni | Layout and style of the translations | Translation layout and style |
| features[history].title | Cronologia di traduzioni e parole consultate | History of translations and looked-up words | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac e Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | Che cos’è WordByWord? | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | WordByWord può tradurre un’intera pagina web in una volta sola? | Can WordByWord translate an entire web page in one go? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Funziona in Safari o dentro altre app? | Does it work in Safari or inside other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | WordByWord traduce parola per parola? | Does WordByWord translate word for word? | Is WordByWord a word-by-word translator? |
| faq[x].q | Posso leggere X (ex Twitter) con WordByWord? | Can I read X (formerly Twitter) with WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | Quali lingue supporta WordByWord? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | WordByWord è gratis? Quali sono i limiti giornalieri? | Is WordByWord free? What are the daily limits? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | Quale motore di traduzione usa? | Which translation engine does it use? | Which translation engine does it use? |
| faq[account].q | Serve un account per usare WordByWord? | Is an account needed to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Come recupero WordByWord Plus su un nuovo iPhone o iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | Esiste una versione per Android? | Is there a version for Android? | Is there an Android version? |
| faq[english-learner].q | Sto imparando l’inglese. Vale la pena provare anche SurfEnglish? | I'm learning English. Is it worth trying SurfEnglish too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | WordByWord funziona su iPad, Mac o nel browser di un computer? | Does WordByWord work on iPad, Mac or in a computer's browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| faq[english-learner].a（en-site 补句） | L’interfaccia di SurfEnglish non è disponibile in italiano (è in inglese e in altre 11 lingue), ma l’app traduce in italiano. | SurfEnglish's interface isn't available in Italian (it's in English and 11 other languages), but the app translates into Italian. | 文档 08 §7.8 模板：SurfEnglish’s interface isn’t available in {language} — it’s in English and {n} other languages — but it can translate into {language}. |
| pricing.summary | Ogni funzione è gratuita entro questi limiti; Plus li aumenta per 3,99 USD al mese (prezzo USA). | Every feature is free within these limits; Plus raises them for USD 3.99 a month (US price). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | Dallo sviluppatore di WordByWord | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: notizie in inglese al tuo livello | SurfEnglish: English news at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | Stai imparando l’inglese? Continua a leggere in WordByWord le pagine che vuoi e prova anche SurfEnglish: notizie quotidiane in inglese per livello e giochi di ripasso, con gli stessi gesti. | Learning English? Keep reading the pages you want in WordByWord and try SurfEnglish too: daily English news by level and review games, with the same gestures. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Notizie vere in inglese, livelli A1–C1 ／ Giochi di ripasso con ciò che hai letto ／ Condividi articoli in inglese da Safari | Real news in English, levels A1–C1 / Review games with what you've read / Share English articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.uiNote（替换 note） | Gratis per iniziare · Interfaccia in inglese e in altre 11 lingue, non in italiano · Traduce in italiano | Free to start · Interface in English and 11 other languages, not in Italian · Translates into Italian | （en note：Free to start · iPhone and iPad · App in 12 languages · Translations into 21；文档 04 §5.7 it uiNote 草案：Gratis per iniziare · L’interfaccia dell’app non è disponibile in italiano (inglese e altre 11 lingue) · Traduzioni in italiano disponibili） |
| sibling.card.linkText | Leggi notizie in inglese al tuo livello con SurfEnglish (sito in inglese) | Read English news at your level with SurfEnglish (site in English) | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | Scarica SurfEnglish su App Store | Download SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | Schermata Games di SurfEnglish (interfaccia in inglese): Sentence Builder e Word Raid, da giocare con frasi e parole salvate | SurfEnglish Games screen (English interface): Sentence Builder and Word Raid, to play with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | Screenshot di SurfEnglish (interfaccia in inglese) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading / linkText | Dallo stesso sviluppatore ／ SurfEnglish: Bilingual News (EN) | From the same developer / （IT 店面的正式名，不翻译） | More from the maker / SurfEnglish: Bilingual News |
| cta.title | Inizia a leggere i siti web in due lingue su iPhone | Start reading websites in two languages on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | Scorri per tradurre · Tocca due volte per cercare · Lettura ad alta voce · 21 lingue | Swipe to translate · Double-tap to look up · Read aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（复数对象与占位符已代入当前值；`{plus.priceUS}` 在 it 渲染为"3,99 USD"。）

FAQ 答案（不在回译清单里）也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音不限次、Plus 为月订、美区价格 + 以 App Store 为准；`restore` 引用 App 按钮 "Aggiorna Ora" → "Ripristina Acquisto"（T-E）；`devices` 的 S0 答案只写"同一开发者正在准备一个 Chrome 扩展"，不写扩展名称（R45）；`aExtLive` 才写 "WordByWord Translate per Chrome" 和"只从该页面的链接安装"。

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都有意为之：

1. `meta.title` 没有 "App"：产品词用 traduttore（文档 03 §1.6 / §3.9 的 it 草案、`primaryTokens.home.it`），与 es / fr 相同。
2. `meta.description` 用 "in WordByWord" 代替 "built-in browser"（文档 03 §3.2 允许）；受众写成祈使句 "Impara le lingue"（草案原样）；多了方向 "a destra"。
3. `hero.title`："any web page" 写成 "una pagina web"，"right below" 写成 "sotto"（75 字符上限），多了 "a destra"（避免"scorrere un paragrafo = 浏览一段"的歧义）。
4. `hero.platformNote` 不写美区价格（D2），只写 "Plus: abbonamento mensile"。
5. SE 卡片 H2 没有 "daily"：为满足 R84（320 px 下 ≤ 560 px），删了 "quotidiane"（删前 561 px）；body 和 FAQ 都保留了 "notizie quotidiane"。`points[2]` 省略 "to the app"（每条 ≤ 45 wu）。
6. `features[speech].text`：App 写 "voci Premium o Enhanced"，网站写 "voci Premium o migliorate"（iOS 意大利语界面对 Enhanced 语音的叫法，见 §4-5）。
7. FAQ `what-is` / `devices` / `english-learner` 的链接文字带 "(in inglese)" / "(pagina in inglese)"，因为 about 页、扩展页和 SE 站都只有英文版（Wave 2 规则）。
8. 价格表行名比 App 原名短：引擎写 "· cloud / · locale"，查词行写 "(AI)" 而不是 "(Significato AI)"（§7，与 es 做法一致）。

## 4. 没把握的措辞（12 处，附回译与替代写法）

| # | 键 | 现写法（回译） | 顾虑 | 替代写法（回译） |
|---|---|---|---|---|
| 1 | `hero.title` | Scorri a destra un paragrafo di una pagina web: la traduzione appare sotto.（Swipe a paragraph of a web page to the right: the translation appears below.） | "scorrere + 宾语 + a destra"是口语化的手势说法；Apple 官方多写 "scorri verso destra **su** …"，但加 "su" 会超 75 字符 | « Su una [[pagina web]], scorri a destra un paragrafo: sotto c’è la traduzione. »（On a web page, swipe a paragraph right: the translation is below. n73）；或草案原样 « Scorri un paragrafo di una [[pagina web]]: la traduzione appare subito sotto. »（n73，但"scorrere un paragrafo"可被读成"扫读一段"） |
| 2 | `meta.description` | … Tocca due volte una parola per il significato. …（Double-tap a word for the meaning.） | 为了 ≤ 160 用了界面提示式的紧凑说法（类似 "Tocca per i dettagli"） | « … Tocca due volte una parola per vederne il significato. … »（to see its meaning；n167，L-8 W） |
| 3 | `meta.ogHeadline` | L’originale resta lì.（The original stays where it is.） | "resta lì"偏口语 | « L’originale non si sposta. »（The original doesn't move.）——需重跑 og.mjs |
| 4 | `hero.eyebrow` | Lettore web bilingue per imparare le lingue（Bilingual web reader for learning languages） | "lettore"也可指人或硬件；软件义（lettore PDF、lettore di feed）常见 | « Lettura bilingue del web per imparare le lingue »（Bilingual web reading for learning languages；60 wu） |
| 5 | `features[speech].text` | … le voci Premium o migliorate che hai scaricato（the Premium or enhanced voices you downloaded） | App 的 it 文案写 "Premium o Enhanced"；iOS 意大利语"语音内容"设置里增强语音显示为 "Migliorata"（据我所知，需在真机上确认） | 照 App 写 « le voci Premium o Enhanced che hai scaricato » |
| 6 | 全页 | AI（l’AI, Pronuncia AI, Analisi AI…） | 文档 03 / 08 写的是 IA；意大利语两种都通行，App 全部用 AI | 全部改 IA（12 处可见文字，见 §6-3） |
| 7 | `features[x].sample.translation` | Ho appena corso la mia prima 10 km. Piano, ma senza fermarmi mai.（I just ran my first 10K. Slowly, but without ever stopping.） | "la mia prima 10 km"是跑者用语（"la 10 km"= 10 公里赛）；"Piano"回避了 slow 的阴阳性 | « Ho appena finito la mia prima corsa di 10 km. Lenta, ma senza fermarmi neanche una volta. » |
| 8 | `demo.ui.replay` | Rivedi（Watch again） | 动画播完后的按钮，也可写 "Ripeti" 或视频常用的 "Riproduci di nuovo" | « Ripeti »（Repeat） |
| 9 | `nav.chromeExtension` | Per Chrome（For Chrome） | "Estensione Chrome" 17 wu 超 16 wu 上限；S0 下导航本来就不显示该项 | « Estensione Chrome »（Chrome extension；L-8 W） |
| 10 | `pricing.table.rows.lookup` | Tocca due volte per cercare (AI)（Double-tap to look up (AI)） | App 原名是 "… (Significato AI)"，原名在 390 px 表格里占 5 行（+45 px） | « Tocca due volte per cercare (Significato AI) » |
| 11 | `features[display].title` | Layout e stile delle traduzioni（Layout and style of the translations） | "layout"是英语借词，意大利语网页常用 | « Impaginazione e stile delle traduzioni » |
| 12 | `sibling.card.points[1]` | Giochi di ripasso con ciò che hai letto（Review games with what you've read） | "con"略口语；en 是 "built from" | « Giochi di ripasso creati dalle tue letture »（Review games created from your reading；42 wu） |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法（rule ①），均与 `Localizable.xcstrings` 的 `localizations.it` 核对过**：kicker "Scorri per Tradurre"（`daily_sentence_translation_limit`）、"Tocca due volte per cercare"（`word_meaning_lookup_title` 去掉 "(Significato AI)"，与 en / ja / es / fr 做法一致）；"Altre definizioni"（`more_definitions_title`）；"Estrazione Segmenti"（`Chunk Extraction`）；"Flusso azioni della frase"（`sentence_skeleton_settings_navigation_title`，也是 App 自己的 Free / Plus 对比表行名）；"Lettura AI" / "Lettura locale"（`audio_playback_title_*`）；"Ottieni spiegazione sintattica AI"（`get_syntax_explanation_button`）；"Cronologia Traduzione Swipe"（`view_title_swipe_history`）；"Aggiorna Ora" / "Ripristina Acquisto"（T-E）；"Automatico / Paragrafo / Frase per Frase"（`translation_mode_title_*`）；"Motore di traduzione cloud / Motore locale"；"Segnalibri"、"Schede"（书签、标签页）。App 原文的直撇号 ' 在网站上统一排成 ’。
- **Action Flow**：H3、语言段、样张标签保留 App Store 名 "Action Flow"（D3、§7.2.3），正文括注 App 叫法 "Flusso azioni della frase"；价格表行名用 App 叫法（与 zh-Hans / ko / es 相同）。
- **手势**：句中"scorri verso destra su un paragrafo"（Apple 与 App tip 的说法，tip 原文 "Scorri a destra su qualsiasi testo…"），H1 / description 用更短的 "scorri a destra un paragrafo"；双击一律 "tocca due volte"，名词 "doppio tocco"（App 的 `double_tap_not_supported_message` 用法）。不用 "swipe" 作正文动词（只在引用 App 名 "Cronologia Traduzione Swipe" 时出现）。
- **称谓与排版**：称 tu；WordByWord 按阳性（"WordByWord è gratis"），"l’app" 按阴性；引号用 “ ”；撇号用 ’；"X (ex Twitter)" 是意大利媒体通行写法（§7.2.3 的"X（旧 Twitter）"格式）。`{plus.priceUS}` 渲染为 "3,99 USD"，所以句中写"al mese (prezzo USA)"，不再重复"USD"。
- **App Store 徽章**：it-it 徽章图上的文字是 "Scarica su App Store"（本地渲染核对过 `assets/badges/it-it.svg`），因此 `common.appStoreBadgeAlt` = "Scarica WordByWord su App Store"，SE 文字链接 = "Scarica SurfEnglish su App Store"（T8）。
- **Apple 用词**：Account Apple（2024 年起取代 ID Apple）、"Mac con chip Apple"、"iOS 18 o versioni successive"、商标声明用 Apple 意大利语官方句式（"registrati negli Stati Uniti e in altri Paesi e aree geografiche"）。
- **glossary**（`src/data/glossary/it.json`）：`required` 锁定 10 个 kicker、`demo.ui.more`、样张 flowLabel 与 10 个价格表行名；`contains` 要求 FAQ `restore`、`syntax`、`speech`、`chunks`、`lookup.bullets[2]` 逐字引用 App 名；`banned` 收录左滑、鼠标"doppio clic"、单击查词、App 名的变体、"AI Pronuncia" 语序、"IA"（§6-3 若改用 IA，需同时删掉这一条）。
- `meta.appStoreSubtitle` = "Scorri per tradurre, l’AI spiega"：是 US 副标题的译文，IT 店面的真实副标题本地查不到（调研保存的店面页里没有 IT）；该键只用于 about 事实表，it 没有 about 页，不渲染。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，OG 文件没有复制进真实仓库。it.json 进库后，`node build.mjs` 会报 `D-23 home-it: no OG image`，直到运行 `node scripts/og.mjs --only home-it`（副本实测一次通过：64 px × 3 行、154.6 KB）。
2. **it lint 词表**：`claims-lint.json` 有 24 条规则缺 it 写法（L-14 W）、`keyword-map.json` 缺 it 的 G1 模式（L-9 W）。`docs/redesign-2026/ops/m3/it-lint.json` 是提案（25 条规则 + seOwned / seOwnedLead / G1），在新副本里合并后：it 文案 0 命中，构建 0 error，测试 58/58，其他语言不受影响。是否采用、由谁合入，请决定。
3. **AI 还是 IA**：文档 03 表 A（K2–K4）和文档 08 §7.3 给 it 写的是 "(IA)"（属于 T3【待母语复核】的推断，研究 07 没有意大利语联想数据）。我的判断是意大利语产品文案里 "AI" 更常见（App 的全部意大利语字符串都用 AI），全页统一写 AI。如果要按文档用 IA，需要改 12 处可见文字：`meta.ogImageAlt`、`hero.how`、`features[lookup].title`、`features[speech].title`、`features[syntax].title`、`features[syntax].text`（"l’AI spiega"）、`features[syntax].alt`、价格表 4 行（lookup、lookupSpeech、swipeSpeech、syntax）、`faq.items[free].a`；另改 `seo.keywords` 与 glossary（删掉 "IA" 禁用、改 `required` 中的 4 个行名）。引号里的 App 名（"Lettura AI"、"Ottieni spiegazione sintattica AI"）无论如何保持 AI。
4. **`features[lookup].kicker`**：保留 App 叫法 "Tocca due volte per cercare"（规则 ①，Wave 2 要求）会有 1 条 L-8 W（27 > 24）；320 px 下大写 kicker 折成 2 行，375 px 以上是 1 行。改成自然说法（如 "Doppio tocco" 12）可消除 W，但与 App 不一致。
5. **报给 App 侧的意大利语字符串问题**（规则 ③；网站已按下列方式处理）：
   - 英语式词首大写：`daily_sentence_translation_limit` "Scorri per Tradurre"、"Seleziona Modalità di Traduzione"、"Frase per Frase"、"Ripristina Acquisto" 等。网站在 kicker / 价格表 / 引号里照 App 原文，正文用小写自然说法。
   - `ai_pronunciation_word / _sentence` = "AI Pronuncia (Parola / Frase)"：英语语序，意大利语应为 "Pronuncia AI (parola / frase)"。网站价格表写 "Pronuncia AI · parola / frase"，glossary 禁用 "AI Pronuncia"。
   - `upgrade_now_button` 与 `update_now_button` 都是 "Aggiorna Ora"（`button_text_refresh` 也是 "Aggiorna"）："aggiornare"首先是"更新"，升级更常说 "Passa a Plus"（App 自己的 `usage_status_upgrade_hint` 就是 "Passa a Plus…"）。网站 FAQ `restore` 照 App 引用 "Aggiorna Ora"。
   - 订阅相关用了 "iscrizione / Iscriviti / Iscritto"（意思是注册、报名），付费订阅在意大利语和 Apple 界面里是 "abbonamento / Abbonati / Abbonato"。网站正文一律写 "abbonamento"。
   - 同一手势两种叫法："traduzione con swipe""Cronologia Traduzione Swipe" vs "traduzione con scorrimento""Scorrimento a Destra"。
   - `tts_trial_limit_reached_title` "Limite di Riproduzione Raggiunta"：性不一致（limite 为阳性，应为 "Raggiunto"）。
   - "Stile di Citazione"（`Quote Style`）与 "Stile Citazione"（`translation_style_title_quote_style`）、"Sottolineato tratteggiato" 与 "Sottolineatura Tratteggiata" 两两不一致。
   - "voci Premium o Enhanced"：iOS 意大利语界面的叫法可能是 "Migliorata"，建议 App 侧在真机上核对。
6. **页面长度**：390 px 为 12,996 px（≤ 13,000）；375 px 13,287 px、320 px 13,837 px（en 分别为 12,930 / 13,394）。
7. **"(macOS 15+)" 断行**：规格清单 `features[devices].text` 在 390 / 1280 px 下会在占位符值 "macOS 15" 的空格处断开（"(macOS ／ 15+)"）；我加了 "i Mac…"，375 / 320 px 已正常。根治需要模板把 `{minOS}` / `{minMacOS}` 的值做成不换行（各语言同样受影响），没有改模板。
8. **`common.screenshotLabel`** 写成 "Screenshot (interfaccia in inglese)"，没有 "iPhone"：带 iPhone 的写法 42 wu，超过 40 wu 上限；图片本身在 iPhone 机身框里。
9. **母语审校**：按 R36，it 上线后补母语审校；请审校人重点看 §4 的 12 处和 §6-3。

## 7. 版面实测（新副本 + `scripts/serve.mjs --port 4601`，headless Chrome，外部请求全部拦截）

| 视口 | 横向溢出 | SE 卡片高度（上限） | 样张红色译文条顶端 | 整页高度 |
|---|---|---|---|---|
| 1280 × 900 | 无 | 370 px（420） | 378 px | 10,259 px |
| 390 × 844 | 无 | 432 px（480） | 775 px（< 844，R69） | **12,996 px**（目标 ≤ 13,000；en 12,853） |
| 375 × 812 | 无 | 453 px（480） | 773 px（< 812） | 13,287 px（en 12,930） |
| 320 × 700 | 无 | 535 px（560，R84） | 834 px（en 873） | 13,837 px（en 13,394） |

为满足上面的数字所做的调整（初稿 → 定稿）：

- `hero.secondaryCta` "Scopri come funziona" → "Come funziona"：初稿在 390 / 375 px 下掉到徽章下一行，样张下移 52 px（红条 827 → 775 px）。
- 价格表：`perDay` "{n} al giorno" → "{n}/giorno"、`noLimit` "Nessun limite giornaliero" → "Nessun limite"、引擎行 "· motore cloud / locale" → "· cloud / locale"、查词行去掉 "Significato"：390 px 价格区 1,590 → 1,429 px；`pricing.lede` 删掉"che si rinnova ogni giorno"（改 "quota gratuita giornaliera"，意思不变）。
- SE 卡片 H2 删 "quotidiane"：320 px 下 561 → 535 px（R84 ≤ 560）。
- 画廊标题与 3 条图注缩短（保留"interfaccia in inglese"）：390 px 画廊区 854 → 803 px。
- 字数：`hero.platformNote` 141 → 137、4 个 alt 126–130 → ≤ 125（初稿的 L-8 W 都已消除）。
- 目视检查（深色模式截图）：390 / 375 / 320 px 的 hero、样张查词卡、L1 / L2 功能块（①②③ 页边注）、X 样张、语块示意、规格清单、语言段、价格表、SE 卡片、FAQ、最终 CTA、页脚，1280 px 的 hero、功能区、SE 卡片、价格表：没有溢出或异常断行；"·"没有落到行首；kicker "TOCCA DUE VOLTE PER CERCARE" 在 375 px 以上为一行。

## 附录 A：建议的 it lint 词表（`docs/redesign-2026/ops/m3/it-lint.json`）

文件形状按 Wave 2 约定：`{"claimsLint": {"<rule id>": [...]}, "keywordMap": {"seOwned": [...], "seOwnedLead": [...], "reservedG1": [...]}}`。覆盖 25 条规则（跳过已有 it 的 `selection-translate`、`jargon` 与只有 `*` 的 `io-home`、`engine-claim`）。匹配方式同校验器（`iu`，在代入占位符、去掉标记后的文本上）；撇号写成 `['’]`；不在重音字母旁用 `\b`（JS 的 `\b` 只认 ASCII），改用 Unicode 前后断言。

自测（新副本 = HEAD c657445 + it.json + 本词表）：it 文案 0 命中（否定句在各规则自带的豁免键内）；构建 0 error、L-14 / L-9 的 it 汇总 W 消失；测试 58/58。下列反例句全部命中（`scratchpad/it-work/lint-counter.mjs`）：

| 规则 | 反例句（全部命中） |
|---|---|
| whole-page | Traduci un’intera pagina web con WordByWord. ／ WordByWord traduce tutta la pagina in una volta. ／ Traduzione con un solo tocco. |
| swipe-left | Scorri verso sinistra su un paragrafo per tradurlo. ／ Fai uno swipe a sinistra. |
| safari-extension | WordByWord è un’estensione per Safari. ／ Traduce in qualsiasi app. ／ Funziona senza cambiare app. |
| offline | Traduce anche offline. ／ Funziona senza connessione a internet. |
| unlimited-ai-voice | Pronuncia AI illimitata con Plus. ／ Voci AI senza limiti. ／ Lettura illimitata con voce AI. |
| dark-mode-theme | Supporta la modalità scura. ／ Scegli tra temi personalizzati. |
| shortcuts-volume | Usa le scorciatoie da tastiera. ／ Regola il volume della lettura. |
| vocab-sync | Salva le parole nelle flashcard. ／ Sincronizza su iCloud tra i dispositivi. ／ Un quaderno di vocaboli integrato. |
| android | Disponibile anche su Android. ／ Scaricala da Google Play. |
| desktop-version | Esiste una versione desktop. ／ Scarica l’app per Windows. |
| x-app | Traduci i post nell’app di X. ／ L’unica app che traduce X. |
| plus-early-access | Con Plus hai accesso anticipato alle novità. |
| privacy-claim | Nessun dato personale viene raccolto. ／ L’app non raccoglie alcun dato. |
| initial-version | La versione iniziale supporta 20 lingue. |
| language-pairs | Oltre 20 coppie di lingue. |
| style-count | Scegli tra 8 stili di traduzione. ／ Sette stili diversi. |
| auto-detect-target | Rileva automaticamente la lingua di destinazione. |
| history-by-date | La cronologia è raggruppata per data. |
| plus-only | L’analisi sintattica è solo per Plus. ／ Funzione esclusiva per WordByWord Plus. |
| speaking-practice | Migliora la tua pronuncia ogni giorno. ／ Pratica di conversazione con l’AI. |
| replacement-tone | SurfEnglish potrebbe fare più al caso tuo. ／ Un’app più adatta a chi studia inglese. ／ Usa SurfEnglish invece di WordByWord. |
| se-on-device-voice | Voci AI sul dispositivo, anche offline. ／ Voci che funzionano offline. |
| se-hype | Novità: la nuova app per l’inglese. ／ Più veloce ed efficiente. ／ Aggiorna a SurfEnglish. |
| hype | La migliore app di traduzione. ／ Un’app rivoluzionaria. ／ Oltre 10.000 utenti. ／ Il team di WordByWord. ／ Di’ addio al copia e incolla. |
| ext-language-count | L’estensione traduce in 20 lingue. |
| seOwned | Impara l’inglese con le notizie ／ Notizie in inglese al tuo livello ／ Estrazione dei segmenti ／ Learn chunks |
| seOwnedLead | Imparare l’inglese leggendo ／ Stai imparando l’inglese? Prova SurfEnglish |
| reservedG1 | Come tradurre le pagine web su iPhone ／ Traduci mantenendo l’originale ／ Guida alla lettura bilingue |

不得误拦（文档 03 §1.4）：« Impara le lingue: in WordByWord scorri a destra un paragrafo »、« per chi impara le lingue »、« imparare le lingue leggendo siti web » 都不命中 seOwned。

说明：`hype` 的 `(il|la) miglior[ei]?` 与 `(l’|la |il )unic[oa]` 可能误伤正常句子（如 "la migliore traduzione possibile" 出现在否定或比较语境），`plus-early-access` 的 "in anteprima" 也可能误伤"预览"义；合入前请母语审校再看一遍。`se-hype` 的 `aggiorna\w*` 只作用于 SE 区块（规则自带 `only`），不会拦 FAQ `restore` 里的 App 按钮名 "Aggiorna Ora"。`seOwnedLead` 会作用于所有语言页面的 H2，it 模式只匹配意大利语开头。

## 附录 B：验证记录

| 命令 | 结果 |
|---|---|
| `node build.mjs --out …/dist`（新副本，数据文件为真实仓库原样） | 0 error；it 4 条 W（L-8 kicker、L-4、L-14 未覆盖、L-9 无 G1） |
| 同上，副本合并 `it-lint.json` 后 | 0 error；it 2 条 W（L-8 kicker、L-4） |
| `node build.mjs --pseudo` | 两种数据下均 0 error |
| `node scripts/check.mjs --dist …` | 0 error / 0 warning |
| `node scripts/check.mjs --keys it` | 0 missing / 0 not in en |
| `node scripts/og.mjs --only home-it` | ✓ 标题 64 px × 3 行、副标题 30 px × 2 行、154.6 KB |
| `node --test scripts/tests/*.test.mjs` | 58/58（两种数据下均通过） |
| headless Chrome 1280 / 390 / 375 / 320 px | 无横向溢出；SE 卡片 370 / 432 / 453 / 535 px；390 px 页高 12,996 px |
