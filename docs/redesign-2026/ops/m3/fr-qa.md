# M3 · fr（Français）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | fr（T2：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校） |
| 交付 | `src/locales/fr.json`（新建）；`src/data/glossary/fr.json`（新建，§7.2.5 格式，数据取自文档 08 §7.2.1 表 T-A…T-E 的 fr 列、§7.2.2 规则 ①–③ 与 X7、§7.5 jargon 行） |
| 依据 | 文档 08 §7（7.1–7.10）、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§2.3（fr 行）、§3.1、§3.2、§3.9（fr 草案）；文档 04 §5.5、§5.7（fr 的 uiNote、linkText 种子、T1–T11）；文档 05 §7.5；裁定 R36、R39–R43、R46、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照 |
| 工作方式 | 在私有副本（scratchpad 下 `wbw-m3-fr/`）里构建和验证；OG 图只在副本里生成，**没有**复制进真实仓库；真实仓库只放入上面两个文件和本记录 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys fr`：0 缺、0 多）。副本里 `node build.mjs` 与 `--pseudo` 均 **0 error**，`scripts/check.mjs` 0 error / 0 warning。fr 自己的 warning 只有两条：L-8 `features[lookup].kicker` 28 > 24（有意保留 App 叫法，见 §6 第 4 条）；L-4 有 6 个值与 en 相同（Menu、Fig.、FAQ×2、Pause、Contact，都是正确的法语写法）。
2. 用真实仓库现有的 `claims-lint.json` / `keyword-map.json` 构建时，还会多出两条汇总 warning：L-14"fr 未覆盖 24 条规则"、L-9"fr 没有 G1 how-to 模式"。原因是这两个数据文件还没有 fr 词表。我起草了 fr 词表（附录 A），**只在副本里**加进去自测（fr 文案 0 命中），没有改真实仓库。
3. title / H1 用文档 03 §3.9 的 fr 草案：title 逐字照用（n57）；H1 只把冒号前的空格换成不换行空格（n73）。description 重写：草案写的是"balayez un paragraphe à droite""Gratuit sur iPhone."（缺 iPad），改后为 n160，以"Gratuit sur iPhone et iPad."收尾（SEO-11）。
4. 法语排版统一由生成脚本处理：冒号前 U+00A0；`; ? !` 前和 « » 内侧 U+202F；分隔点"·"前 U+00A0（避免"·"落到行首，375 px 下实测过）；FAQ 问句里倒装的连字符用 U+2011（避免"prend-／il"这类断行）；复数对象里数字与名词之间 U+00A0；撇号统一用 ’。
5. 复数：`Intl.PluralRules('fr')` 的类别是 one / many / other。所有"数字占位符 + 可数名词"都写成三类复数对象（many 只用于整百万，按法语写 "# de …" / "# d’…"）；当前数值全部落在 other。
6. SurfEnglish：fr 的 `seMode` = en-site（`perLocale.fr.uiNote`）。卡片 note 由 uiNote 替换，uiNote 按文档 04 T6 写"界面是英语和另外 11 种语言、没有法语；可译成法语"；linkText 带"(site en anglais)"，链 SE 英文站（模板加 `hreflang="en"`）；FAQ `english-learner` 在链接前加了 §7.8 要求的界面说明句。
7. OG（只在副本）：`node scripts/og.mjs --only home-fr` 通过，标题 58 px × 3 行、副标题 30 px × 2 行、146 KB（en 现状为 64 px × 3 行）。
8. 渲染检查（副本，本机 headless Chrome，`file://`，去掉 GA 脚本，不联网）：320 / 375 / 1280 px 都没有横向溢出；SE 卡片高度 545 / 432 / 370 px（R84 ≤ 560、R10 ≤ 480 / ≤ 420，全部满足）。
9. 需要负责人处理的事（§6）：① 真实仓库在生成 `home-fr` OG 图之前会报 D-23 error；② 加入 fr 后 `npm test` 有 2 项失败（D-2 测试写死了 hreflang 链接数）；③ 是否采用附录 A 的 fr lint 词表；④ 几处取舍。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | « WordByWord : traducteur bilingue de pages web pour iPhone » | 品牌位 WordByWord（冒号前加空格，文档 03 §3.1）；K1 主词「traducteur bilingue de pages web pour iPhone」**完整出现**（文档 03 §2.3 表 A）；`titleMust` = iPhone / pages web / traducteur 全部命中；`primaryTokens`（iPhone、traducteur）命中 | n57（上限 60） |
| `meta.description` | « Apprenez les langues : balayez un paragraphe dans WordByWord et sa traduction apparaît dessous. Touchez deux fois un mot : son sens. Gratuit sur iPhone et iPad. » | 受众词「apprendre les langues」（表 C，R39）；K1 动作 + 结果（"balayez un paragraphe … sa traduction apparaît dessous"，在前一半）；"dans WordByWord"满足"在 WordByWord 里"（文档 03 §3.2）；K2 动作「touchez deux fois un mot」+「sens」；平台 + 免费收尾（SEO-11） | n160（区间 120–160） |
| `hero.title`（H1） | « Balayez un paragraphe d’une [[page web]] : sa traduction apparaît en dessous. » | K1 核心名词「page web」（荧光笔，2 个词，R65）；"段落"一级的动作 + 结果（R46、PRO-19），不暗示整页；不含品牌（R27）；没有 how-to 句式 | n73（上限 75） |
| `hero.eyebrow` | « WordByWord · Lecteur web bilingue pour apprendre les langues » | 品牌 + 品类 + 受众 | 60 wu（上限 60） |
| `hero.lede` = `ledeShort` | « WordByWord est un assistant de lecture pour apprendre les langues, sur iPhone et iPad. » | R39 定义句（"assistant"只出现在定义句里，D13） | n86（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | « Lisez le web en deux langues. [[L’original reste en place.]] » | K1"双语阅读 + 原文保留"的意思；荧光笔 1 处；没用"garder l’original"（我建议留给 G1，见附录 A） | 58 px × 3 行 |
| 功能区 H2 | « Balayez pour traduire, touchez deux fois pour le sens — sur les sites que vous lisez » | K1「balayer pour traduire」+ K2「sens」；"sur les sites que vous lisez"（PRO-16，不写"任何网站"） | n84 |
| 功能 H3 | K1「Balayer pour traduire : la traduction s’affiche juste sous l’original」；K2「Touchez deux fois un mot : l’IA vous donne son sens en contexte」；K9「Lisez les posts X (ex-Twitter) en bilingue, dans le navigateur intégré」；K5「Extraction de Segments et Action Flow, pour les phrases en anglais」（R83 带"en anglais"）；K3「Lecture à voix haute par IA, ou voix iOS rapides sur l’appareil」；K4「Analyse par IA de la structure des phrases longues」；K7「Traduction dans le cloud ou sur l’appareil」；K6「Historique des traductions et des mots consultés」 | K3、K6、K7 与表 A / B 的主词逐字一致；K2「sens … en contexte」、K4「analyse … structure … par IA」为主词的语序变体 | 全部 ≤ 70 wu |
| 语言段 H2 | « Traduction en 21 langues, et pas seulement depuis l’anglais »（复数对象） | K8 主词「traduction en 21 langues」逐字 | 59 wu |
| 价格段 H2 | « Gratuit au quotidien ; passez à Plus si vous lisez davantage » | K10「gratuit」+ Plus | — |
| 最终 CTA H2 | « Commencez à lire le web en deux langues sur iPhone » | 动作句，不是 G1 标题，不暗示整页（R46） | 50 wu |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（fr 词表只有 `apprendre l['’]anglais`；"Apprenez les langues"不命中）；title / H1 / description / `cta.title` 里没有 how-to 句式（comment、garder l’original）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys fr`：0 缺、0 多；`about.*`、`chromeExtension.*`、`legal.*` 与 ja 一样不提供，fr 没有这些页面；`notfound.*` 照 ja / zh-Hans 提供）。副本 build / `--pseudo` 0 error，`check.mjs` 0 error。真实仓库在生成 OG 前报 D-23，`npm test` 有 2 项失败，见 §6 第 1、2 条 |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条；uiNote / FAQ 里的"11"是文档 08 §7.8 规定由译者写死的 {se.uiLanguages} − 1）。复数对象：`languages.title / uiCount / targetCount`、`gallery.items[languageList].caption`、`faq.items[languages].a`、`faq.items[free].a`（5 处）、`cta.recap`、`sibling.card.note`，代入当前值后渲染为"20 langues""21 langues""50 traductions""20 recherches de mots""30 extractions de segments""20 Action Flow""5 explications de syntaxe"。`{n} par jour` 与"{quota.localSwipe.free} avec le moteur local"后面没有可数名词，与 en 同构，不需要复数对象 |
| Q3 | ✓ | title 以品牌位开头，三个 `titleMust` 词元齐全；K1 是产品 / 品类意图；没有禁用主词和 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[page web]]`（2 个词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以"WordByWord est …"开头，写明"pour apprendre les langues" |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展只出现在 FAQ `safari` 的否定回答里；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT；CJK 原文不能双击查词、Chunks / Action Flow 仅英语都写在同一屏；没有 jargon "balayage""alignement"（C-16）。附录 A 的 fr 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required`，L-13 0 违规）：Balayer pour traduire、Double-tapez pour rechercher (Signification IA)、Plus de définitions、Extraction de Segments、Prononciation AI (Mot / Phrase)、Lecture locale；句子里按 §7.3 写"balayez … vers la droite""touchez deux fois"；X7 的鼠标说法"Double-cliquez"没有出现；按钮名照 App 原文引用：« Mettre à Niveau Maintenant »、« Restaurer l’Achat »、« Obtenir l’explication de la syntaxe par l’IA »、« Lecture AI »、« Fil d’actions » |
| Q7 | ✓ | 5 处截图 alt、4 条画廊图注 + alt、2 个截图图注标签（`common.screenshotLabel` / `screenshotExcerptLabel`，文档 05 §7.5 ③）、OG alt、SE 截图 alt 与图注都写了"interface en anglais"，内容逐张对照了 `assets/img/shot/en/*`（语言列表 alt 提到了截图里可见的"français"）；`features[x].alt` 描述社交帖样张并注明"pas une capture d’écran"；样张 `lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | en-site：用 uiNote（"Interface en anglais et 11 autres langues, pas en français · Traduit vers le français"，不含 `{se.uiLanguages}`，L-11 通过）；linkText 是 SE 核心词短语 + 品牌 +"(site en anglais)"（n72，en-site 上限 80）；FAQ 加了界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句"Vous apprenez l’anglais ?"；没有"mise à niveau / remplacer / nouveau / vous conviendra mieux / plus adapté"；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音 |
| Q9 | ✓（1 条 W） | 代入占位符后实测，全部在 §7.6 / L-8 限内，唯一例外是 `features[lookup].kicker` 28 > 24（App 叫法，§6 第 4 条）。title 57、description 160、H1 73、eyebrow 60、lede 86、how 171、platformNote 138、规格清单 4 条 77–79、SE 卡片 body 28 词、H2 51、要点 42–43 wu、linkText 72、所有 alt ≤ 125、`cta.recap` 90（上限 90） |
| Q10 | ✓ | fr 是拉丁文字，不涉及 RTL / CJK；没有 `{wbr}`（R61） |
| Q12 | ✓（副本） | headless Chrome 看了 320 / 375 / 1280 px：没有横向溢出，没有字体回落成方框；断行问题已修（"· 21 langues"落到行首、FAQ 问句"prend-／il"断开），见 §0 第 4 条 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）没写扩展名称；`aExtLive` 写了名称并注明只从该页面链接安装；首页没出现 WordByWord.io |

## 3. 回译对照（fr → English，对照 en.json）

| 键 | fr | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord : traducteur bilingue de pages web pour iPhone | WordByWord: bilingual web page translator for iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Apprenez les langues : balayez un paragraphe dans WordByWord et sa traduction apparaît dessous. Touchez deux fois un mot : son sens. Gratuit sur iPhone et iPad. | Learn languages: swipe a paragraph in WordByWord and its translation appears underneath. Double-tap a word: its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Lisez le web en deux langues. [[L’original reste en place.]] | Read the web in two languages. [[The original stays in place.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | Balayez un paragraphe vers la droite · touchez deux fois un mot pour son sens en contexte | Swipe right on a paragraph · double-tap a word for its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | Balayez un paragraphe d’une [[page web]] : sa traduction apparaît en dessous. | Swipe a paragraph of a [[web page]]: its translation appears below. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord est un assistant de lecture pour apprendre les langues, sur iPhone et iPad. | WordByWord is a reading assistant for learning languages, on iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Ouvrez un site dans le navigateur intégré et balayez un paragraphe vers la droite : sa traduction s’affiche dessous. Touchez deux fois un mot : l’IA explique son sens ici. | Open a site in the built-in browser and swipe right on a paragraph: its translation is shown underneath. Double-tap a word: the AI explains what it means here. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Balayez pour traduire, touchez deux fois pour le sens — sur les sites que vous lisez | Swipe to translate, double-tap for the meaning — on the sites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Balayer pour traduire : la traduction s’affiche juste sous l’original | Swipe to Translate: the translation is shown right under the original | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Touchez deux fois un mot : l’IA vous donne son sens en contexte | Double-tap a word: the AI gives you its meaning in context | Double-tap a word for its AI meaning in context |
| features[x].title | Lisez les posts X (ex-Twitter) en bilingue, dans le navigateur intégré | Read X (formerly Twitter) posts bilingually, in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Extraction de Segments et Action Flow, pour les phrases en anglais | Chunk Extraction and Action Flow, for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Lecture à voix haute par IA, ou voix iOS rapides sur l’appareil | AI read-aloud, or fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Analyse par IA de la structure des phrases longues | AI analysis of the structure of long sentences | AI sentence structure analysis for long sentences |
| features[engines].title | Traduction dans le cloud ou sur l’appareil | Translation in the cloud or on the device | Cloud or on-device translation |
| features[display].title | Mise en page et style des traductions | Layout and style of the translations | Translation layout and style |
| features[history].title | Historique des traductions et des mots consultés | History of translations and looked-up words | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac et Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | Qu’est-ce que WordByWord ? | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | WordByWord peut-il traduire toute une page web d’un coup ? | Can WordByWord translate a whole web page in one go? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Fonctionne-t-il dans Safari ou dans d’autres apps ? | Does it work in Safari or in other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | WordByWord traduit-il mot à mot ? | Does WordByWord translate word for word? | Is WordByWord a word-by-word translator? |
| faq[x].q | Puis-je lire X (ex-Twitter) avec WordByWord ? | Can I read X (formerly Twitter) with WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | Quelles langues WordByWord prend-il en charge ? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | WordByWord est-il gratuit ? Quelles sont les limites quotidiennes ? | Is WordByWord free? What are the daily limits? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | Quel moteur de traduction utilise-t-il ? | Which translation engine does it use? | Which translation engine does it use? |
| faq[account].q | Faut-il un compte pour utiliser WordByWord ? | Do you need an account to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Comment retrouver WordByWord Plus sur un nouvel iPhone ou iPad ? | How do I get WordByWord Plus back on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | Existe-t-il une version Android ? | Is there an Android version? | Is there an Android version? |
| faq[english-learner].q | J’apprends l’anglais. SurfEnglish mérite-t-il aussi un essai ? | I’m learning English. Does SurfEnglish deserve a try too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | WordByWord fonctionne-t-il sur iPad, Mac ou dans un navigateur d’ordinateur ? | Does WordByWord work on iPad, Mac or in a computer browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| faq[english-learner].a（en-site 补句） | L’interface de SurfEnglish n’existe pas en français (elle est en anglais et dans 11 autres langues), mais l’app traduit vers le français. | SurfEnglish’s interface isn’t available in French (it’s in English and 11 other languages), but the app translates into French. | 文档 08 §7.8 模板：SurfEnglish’s interface isn’t available in {language} — it’s in English and {n} other languages — but it can translate into {language}. |
| pricing.summary | Tout est gratuit dans ces limites ; Plus les augmente pour 3,99 $US par mois (prix aux États-Unis). | Everything is free within these limits; Plus raises them for US$3.99 a month (US price). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | Par le développeur de WordByWord | By the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish : l’actualité en anglais à votre niveau | SurfEnglish: English-language news at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | Vous apprenez l’anglais ? Gardez WordByWord pour vos pages et essayez aussi SurfEnglish : l’actualité en anglais par niveau et des jeux de révision, avec les mêmes gestes. | Learning English? Keep WordByWord for your pages and try SurfEnglish too: English news by level and review games, with the same gestures. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Vraies actualités en anglais, niveaux A1–C1 ／ Des jeux de révision tirés de vos lectures ／ Partagez des articles anglais depuis Safari | Real news in English, levels A1–C1 / Review games drawn from your reading / Share English articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.uiNote（替换 note） | Gratuit · Interface en anglais et 11 autres langues, pas en français · Traduit vers le français | Free · Interface in English and 11 other languages, not in French · Translates into French | （en 的 note：Free to start · iPhone and iPad · App in 12 languages · Translations into 21；文档 04 §5.7 fr uiNote 草案："Gratuit pour commencer · L’interface de l’app n’existe pas en français (anglais et 11 autres langues) · Traductions vers le français disponibles"） |
| sibling.card.linkText | L’actualité en anglais à votre niveau avec SurfEnglish (site en anglais) | English news at your level with SurfEnglish (site in English) | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | Télécharger SurfEnglish dans l’App Store | Download SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish, écran Games (interface en anglais) : Sentence Builder et Word Raid, à jouer avec les phrases et mots enregistrés | SurfEnglish, Games screen (English interface): Sentence Builder and Word Raid, to play with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | Capture d’écran de SurfEnglish (interface en anglais) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading / linkText | Du même développeur ／ SurfEnglish: Bilingual News (EN) | From the same developer / （商店名，不翻译） | More from the maker / SurfEnglish: Bilingual News |
| cta.title | Commencez à lire le web en deux langues sur iPhone | Start reading the web in two languages on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | Balayer pour traduire · Toucher deux fois pour le sens · Lecture à voix haute · 21 langues | Swipe to translate · Double-tap for the meaning · Read aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（表中 fr 为可读形式：实际 JSON 里带 U+00A0 / U+202F / U+2011，复数对象已代入当前值。）

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都有意为之：

1. `meta.title` 没有 "App"：法语产品词用 traducteur（文档 03 §1.6 / §3.9 的 fr 草案、`primaryTokens.home.fr`）。
2. `meta.description` 用"dans WordByWord"代替"built-in browser"（文档 03 §3.2 允许二选一）；受众写成祈使句"Apprenez les langues"（与文档 03 草案一致）。
3. `hero.title` 的"right below"写成"en dessous"（75 字符上限）。
4. SE 卡片的 H2 和 body 都没有"daily"：为满足 R84（320 px 下卡片 ≤ 560 px），缩短了 body；"l’actualité"本身就是"当日新闻"的意思，FAQ `english-learner` 保留了"chaque jour"。body 的"any page you like"写成"vos pages"。
5. `sibling.card.points[2]` 省略了"to the app"（每条 ≤ 45 wu）。
6. `faq[what-is]` 与 `faq[devices]` 的链接文字加了"(en anglais)"，因为 about 页和扩展页只有英文版。
7. `faq[engines].a` 的"AI Read"写成 App 的法语名 « Lecture AI »。

## 4. 没把握的措辞（11 处，附回译与替代写法）

| # | 键 | fr | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | features[lookup].kicker | Double-tapez pour rechercher | Double-tap (franglais verb) to search | Toucher deux fois（17）／Sens en contexte（16） | App 叫法（T-A，去掉"(Signification IA)"后缀，与 en / ja 做法一致），但 28 > 24 wu，且"Double-tapez"是英法混合词。替代写法不报 W，但和 App 界面不一致。需负责人决定（§6 第 4 条） |
| 2 | meta.description | … Touchez deux fois un mot : son sens. … | … Double-tap a word: its meaning. … | « Apprenez les langues avec WordByWord : balayez un paragraphe, sa traduction apparaît dessous ; touchez deux fois un mot pour son sens. Gratuit sur iPhone et iPad. »（n162，报 W） | 为了 ≤ 160 用了电报体 |
| 3 | hero.eyebrow | Lecteur web bilingue pour apprendre les langues | Bilingual web reader for learning languages | Le web bilingue pour apprendre les langues | "lecteur"也可理解为设备或读者本人 |
| 4 | meta.ogHeadline | Lisez le web en deux langues. L’original reste en place. | Read the web in two languages. The original stays in place. | … Gardez l’original.（更贴近 en 的 "Keep the original."） | 没用"garder l’original"，因为附录 A 建议把它留给 G1 的 how-to 主词 |
| 5 | features[x].title | Lisez les posts X (ex-Twitter) en bilingue, … | Read X (formerly Twitter) posts bilingually, … | … en version bilingue …（n79，超过 70 wu，报 W） | "en bilingue"偏口语；"posts"是 X 法语界面的叫法 |
| 6 | faq[free].a | 20 recherches de mots (toucher deux fois) | 20 word lookups (double tap) | 20 mots expliqués par l’IA ／ 20 recherches par double toucher | 法语没有通行的"double-tap"名词；"double toucher"不常用，括注写法最清楚 |
| 7 | cta.recap | Toucher deux fois pour le sens | Double-tap for the meaning | Sens des mots en contexte | 为了和前一项"Balayer pour traduire"并列（整行正好 90，到上限） |
| 8 | features[display].text | Auto, paragraphe ou phrase par phrase ; direct ou sur demande ; styles variés. | Auto, paragraph or sentence by sentence; immediately or on demand; varied styles. | « Automatique, Paragraphe ou Phrase par Phrase ; … »（App 叫法，n86，超过 80） | 规格清单 80 字符上限，所以用自然说法（规则 ②），App 叫法在 `features[swipe].bullets[0]` 里引用 |
| 9 | sibling.card.body | Gardez WordByWord pour vos pages et essayez aussi SurfEnglish : … | Keep WordByWord for your pages and try SurfEnglish too: … | Continuez à lire les pages de votre choix dans WordByWord, et essayez aussi SurfEnglish : l’actualité en anglais du jour, … | 原写法在 320 px 下多 2 行，卡片 587 px > 560（R84） |
| 10 | pricing.title | Gratuit au quotidien ; passez à Plus si vous lisez davantage | Free every day; switch to Plus if you read more | Gratuit chaque jour, Plus si vous lisez davantage | — |
| 11 | faq[english-learner].q | J’apprends l’anglais. SurfEnglish mérite-t-il aussi un essai ? | I’m learning English. Does SurfEnglish deserve a try too? | J’apprends l’anglais. Vaut-il la peine d’essayer aussi SurfEnglish ? | "mérite un essai"较书面 |

## 5. 术语与 App 叫法处理要点（给审校人）

- App 法语界面的叫法照抄（T-A…T-E），用于 kicker、价格表行名和"在 App 里点哪个按钮"：Balayer pour traduire、Double-tapez pour rechercher (Signification IA)、Plus de définitions、Extraction de Segments、Fil d’actions、Lecture AI / Lecture locale、Prononciation AI (Mot / Phrase)、Mettre à Niveau Maintenant、Restaurer l’Achat、Obtenir l’explication de la syntaxe par l’IA。App 原文的直撇号 ' 在网站上统一排成 ’，其余字符不变。
- App 原文的问题（不在官网范围内，建议报给 App 侧）：① 按钮名用了英语式的词首大写（« Mettre à Niveau Maintenant »、« Phrase par Phrase »），网站按 T-E 规则照原文引用；② "AI"与"IA"混用（Lecture AI、Prononciation AI ↔ Signification IA）；③ `tip_double_tap_context_meaning` 用了鼠标说法"Double-cliquez"（X7）；④ `swipe_translation_online_limit_reached_message` 用了"traductions par balayage"，而"balayage"作名词正是文档 08 §7.5 禁用的 jargon。网站正文一律用动词"balayez … vers la droite"，从不用名词"balayage"。
- Action Flow 保留 App Store 名（D3、§7.2.3），在 `features[chunks].text` 里括注 App 叫法 « Fil d’actions »。
- 称谓 vous；WordByWord 按阳性处理（"WordByWord est gratuit""Fonctionne-t-il"），"l’app"按阴性。
- `meta.appStoreSubtitle` = "Balayez pour traduire"：取自 2026-10-05 调研时保存的 App Store FR 页面（与研究 05 §2.1 的其它店面副标题同一方法），这个值不在任何文档里；只用于 about 事实表，fr 没有 about 页，不渲染。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，OG 文件没有复制进真实仓库。fr.json 进真实仓库后，`node build.mjs` 会报 `D-23 home-fr: no OG image`，直到负责人跑 `node scripts/og.mjs --only home-fr`（副本实测可通过：58 px × 3 行、146 KB）。
2. **测试**：加入 fr.json 后，`npm test` 有 2 项失败：`D-2 hreflang clusters` 用了写死的期望"/ja/ (ja): 3 hreflang links, expected 4"（多一个 locale 就变成"4 … expected 5"），以及依赖它的"every rule … was caught"。这是测试夹具和已发布 locale 数量绑死，不是 fr 文案的问题；zh-Hant 进仓库后同样会触发。建议把断言改成与数量无关的正则（例如 `/\/ja\/ \(ja\): \d+ hreflang links, expected \d+/`）。我没有改测试。
3. **fr lint 词表**：`claims-lint.json` 24 条规则没有 fr 写法（L-14 W），`keyword-map.json` 没有 fr 的 G1 模式（L-9 W）。附录 A 是建议词表（文档 08 §7.5 要求译者交付时补），在副本里自测 fr 文案 0 命中、en / ja / zh-Hans 不受影响。是否采用、由谁合入，请决定。
4. **`features[lookup].kicker`**：保留 App 叫法 "Double-tapez pour rechercher"（规则 ①，与 en / ja 的做法一致）会有 1 条 L-8 W（28 > 24）；改成自然说法可消除 W，但和 App 不一致。
5. **"AI"还是"IA"**：价格表行名照 App 写 "Prononciation AI (Mot)"、"Lecture AI"；如果负责人认为"AI"属于规则 ③ 的"别的语言"，网站可改成"IA"，同时报给 App 侧。
6. **`seo.titleMust`**：文档 08 §7.3 写的是"iPhone、page web"，但 title 里是复数"pages web"，而 `hasToken` 按整词匹配，所以 fr 用了 `["iPhone","pages web","traducteur"]`（与文档 03 §3.8 es 示例的 "páginas web" 同理）。请确认。
7. **页面长度**：375 px 下 fr 首页约 13.7k px（R20 / R69 的目标是 390 px 下 ≤ 13,000 px；ja 在 375 px 下 ≤ 13k）。法语正文比英语长约 25%，没有为此删内容。
8. **`sibling.card.note`**：en-site 下不渲染（由 uiNote 替换）。我故意没写界面语言数（"Gratuit pour commencer · iPhone et iPad · Traductions vers 21 langues"），以免以后切换 seMode 时冒出"App 有 12 种语言"一类暗示法语界面的说法。
9. **特殊字符**：U+202F（窄不换行空格）、U+2011（不换行连字符）在系统字体里都能显示；万一某个西文衬线字体缺字，浏览器会用回落字体显示这一个字符，不会出现方框。如果负责人倾向全站只用 U+00A0，可以在生成脚本里一处替换。
10. **母语审校**：按 R36，fr 上线后补母语审校；请审校人重点看 §4 的 11 处。

## 附录 A：建议的 fr lint 词表（只在副本里自测过，未改真实仓库）

`src/data/claims-lint.json` → 各规则的 `patterns.fr`（`jargon` 与 `selection-translate` 已有 fr，不重复）：

```json
{
  "whole-page": ["tradui\\w* (toute la|toute une|une|la) page( web)? (entière|complète|d[’']un (seul )?coup)", "tradui\\w* toute (la|une) page", "\\bpages? (web )?(entières?|complètes?)", "en un (seul )?(toucher|geste|clic)", "traduction de (la|toute la) page"],
  "swipe-left": ["(balay|gliss)\\w*(\\s+\\S+){0,3}\\s+(vers la gauche|à gauche)"],
  "safari-extension": ["extension (pour |de )?safari", "extension de partage", "dans (n[’']importe quelle|toutes? les|chaque) (autre )?app", "sans changer d[’']app"],
  "offline": ["hors[ -]ligne", "hors[ -]connexion", "sans (connexion( internet)?|internet|réseau)"],
  "unlimited-ai-voice": ["ia illimitée", "illimit\\w* (de )?(prononciation|lecture|voix)", "(prononciation|lecture|voix)\\w*( \\w+)? (ia|ai) illimit"],
  "dark-mode-theme": ["mode (sombre|nuit)", "thèmes? personnalis", "couleurs? de thème", "thème de couleur"],
  "shortcuts-volume": ["raccourcis? (clavier|de traduction)", "(réglage|contrôle|curseur) du volume", "régler le volume"],
  "vocab-sync": ["flash ?cards?", "fiches? (de révision|mémo)", "(carnet|liste) de vocabulaire", "synchronis\\w* (icloud|du compte|entre (vos )?appareils|dans le cloud)", "sauvegarde (icloud|dans le cloud)", "répétition espacée"],
  "android": ["version android", "sur android", "pour android", "appli(cation)? android", "google play"],
  "desktop-version": ["version (pour )?(ordinateur|pc|windows|de bureau)", "application de bureau", "pour (windows|pc)\\b"],
  "x-app": ["dans l[’']app(lication)? x\\b", "seule app\\w* (qui|à) tradui\\w* x\\b"],
  "plus-early-access": ["accès anticipé", "en avant-première"],
  "privacy-claim": ["aucune donnée (personnelle|collectée)", "ne collecte (aucune|pas de|jamais de) (donnée|information)", "sans (pistage|traçage|suivi publicitaire)", "aucun (pistage|traçage)"],
  "initial-version": ["version initiale"],
  "language-pairs": ["paires? de langues"],
  "style-count": ["\\b\\d+ styles", "\\b(cinq|six|sept|huit|neuf|dix) styles"],
  "auto-detect-target": ["détect\\w* (automatiquement )?(la|votre) langue cible", "langue cible (est )?détectée"],
  "history-by-date": ["(regroup|class|tri)\\w* par date"],
  "plus-only": ["réservée? (à|aux abonnés) plus", "exclusi\\w* (à|de|avec) (wordbyword )?plus", "uniquement (avec|dans|pour) (wordbyword )?plus", "(avec|dans) plus uniquement"],
  "speaking-practice": ["expression orale", "pratique de l[’']oral", "améliore\\w* (votre )?(prononciation|oral)", "entraînement (à la prononciation|à l[’']oral)"],
  "replacement-tone": ["vous conviendra (peut-être )?mieux", "(plus|mieux) adapté", "au lieu de wordbyword", "(app|application) sœur", "ancienne (app|version de wordbyword)", "remplac\\w* wordbyword", "passer de wordbyword à surfenglish"],
  "se-on-device-voice": ["voix (ia |ai )?(sur l[’']appareil|embarquées?|hors[ -]ligne|locales?)", "voix\\w* (qui fonctionnent )?hors[ -]ligne"],
  "se-hype": ["\\bnouve(au|lle|aux|lles)\\b", "plus rapide", "plus efficace", "mise à niveau", "meilleure? que"],
  "hype": ["révolution", "change la donne", "dites adieu", "\\b(le|la) meilleure?\\b", "numéro un", "\\b(le|la) seule?\\b", "premi\\w+ au monde", "des millions d", "\\d[\\d\\u00A0\\u202F .,]*\\s?[km]?\\+? (utilisateurs|téléchargements)", "équipe (de )?wordbyword", "notre équipe", "\\bles créateurs\\b"],
  "ext-language-count": ["\\b(1\\d|2\\d)\\+? (langues|paires de langues)\\b"]
}
```

`src/data/keyword-map.json` → `reserved.G1.fr`（G1 指南的 how-to 说法，首页 title / H1 / description / `cta.title` 禁用）：

```json
["\\bcomment\\b", "(en )?(gardant|conservant) l[’']original", "(garder|conserver) l[’']original"]
```

说明：`hype` 里的 `\b(le|la) seule?\b` 可能误伤正常句子（例如"la seule fois"），合入前请母语审校再看一遍；`se-hype` 的"mise à niveau"只作用于 SE 区块（规则自带 `only`），不会拦 FAQ `restore` 里 App 按钮名 « Mettre à Niveau Maintenant »。

## 附录 B：验证记录（私有副本）

| 命令 | 结果 |
|---|---|
| `node build.mjs --out …/dist`（副本数据 = 真实仓库 + fr 词表） | 0 error；fr 2 条 W（L-8 kicker、L-4） |
| `node build.mjs --out …/dist-real`（claims-lint / keyword-map 用真实仓库原文件） | 0 error；fr 4 条 W（上面 2 条 + L-14 未覆盖 + L-9 无 G1） |
| `node build.mjs --pseudo` | 两种数据下均 0 error |
| `node scripts/check.mjs --dist …` | 0 error / 0 warning |
| `node scripts/check.mjs --keys fr` | 0 missing / 0 not in en |
| `node scripts/og.mjs --only home-fr` | ✓ 标题 58 px × 3 行、副标题 30 px × 2 行、146.1 KB |
| `node --test scripts/tests/*.test.mjs` | 58 项中 2 项失败（D-2 测试写死了 hreflang 数量，§6 第 2 条）；去掉 fr.json 后 58/58 通过 |
| headless Chrome 320 / 375 / 1280 px | 无横向溢出；SE 卡片 545 / 432 / 370 px；375 px 页面高约 13.7k px |
