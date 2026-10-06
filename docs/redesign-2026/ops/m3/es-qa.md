# M3 · es（西班牙语，中性国际西语）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | es（T2：LLM 翻译 + 回译 + 术语表 lint + 关键词检查后上线，上线后补母语审校，R36） |
| 交付 | `src/locales/es.json`（新建）、`src/data/glossary/es.json`（新建，由文档 08 §7.2.1 表 T-A…T-E 的 es 列生成，并逐条对照 `WordByWordPrototype/Localizable.xcstrings` 核过） |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4/§1.5/§1.6/§2.3（es 行，表 A/B/C）/§3.1–§3.9；文档 04 §5.1/§5.5/§5.7；裁定 R36、R39–R43、R46、R52、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照 |
| 称谓与地区 | tú；中性国际西语：不用 vosotros，不用 ordenador / computadora、móvil / celular 这类地区词（写"escritorio""iPhone"），Mac 不带冠词（避开 el / la Mac 的性别差异）；引号用 “ ”（与 App 的 es 文案一致） |
| 工作方式 | 私有副本 `$TMPDIR/wbw-m3-es/` 中构建和验收；OG 图只在副本里生成，未复制进真实仓库；真实仓库只放入上面两个文件和本记录 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys es`：0 缺、0 多）。副本里（含副本生成的 OG 图）`node build.mjs` 与 `node build.mjs --pseudo` 均 **0 error**；`scripts/check.mjs` 0 error / 0 warning；es 只剩 2 条与本 locale 有关的 warning：L-8 `features[lookup].kicker` 26 > 24（App 原名，见 §6 第 2 条）和 L-4（样张里照抄的英文值，文档 08 §1.5 列为正常）。
2. 真实仓库里还会多 2 条 es warning，都是数据文件缺 es 规则造成的，我按简报没有改这两个文件，只在 §6 给出已测试的补丁：L-14（`claims-lint.json` 没有 es 写法，24 条规则"未覆盖"）、L-9（`keyword-map.json` 没有 es 的 G1 how-to 词）。加上补丁后，es 文案对这些规则 0 命中。
3. title、description、H1 用文档 03 §3.9 的 es 草案：title 逐字照用（57 字符）；description 做了语感润色（159 字符，区间 120–160）；H1 只把 "la traducción" 改成 "su traducción"（73 字符，上限 75），荧光笔标在 K1 核心名词 "página web" 上。
4. SE 模式：`seMode = local`（文档 08 §7.8 的 full）。卡片与 FAQ、页脚链接都指向 `https://surfenglish.app/es/`（`hreflang="es"`）；`note` 写"界面 12 种语言，含西语"；`linkText` 用文档 04 §5.7 的 es 种子。
5. OG 图（只在副本里）：`node scripts/og.mjs --only home-es` 一次通过，标题 64 px × 3 行（第 3 行是荧光笔短语，与 en 现状完全相同的版式），副标题 30 px × 2 行，154.6 KB。
6. 版面实测（副本 + 浏览器，§7）：1280 / 390 / 375 / 320 px 下没有横向溢出；SE 卡片高 361 / 453 / 453 / 545 px（上限 420 / 480 / 480 / 560，R10、R84）；390 px 下整页 12,984 px（目标 ≤ 13,000）；样张红色译文条顶端在 735 px（R69：844 px 视口内可见）。为此缩短了 3 行价格表行名、hero 次级链接、SE 卡片正文和 note（§7 有前后数据）。
7. **需要负责人处理的事**（§6）：① 生成 `home-es` OG 图之前，真实仓库构建会报 D-23（这是唯一的 error）；② claims-lint / keyword-map 的 es 补丁待合并；③ App 的 es 界面混用 "AI" 与 "IA"。复核：以真实仓库当前状态（HEAD 7e5dc74，已含 zh-Hant 和改好的 D-2 测试）+ 本次两个文件做一份新副本，在副本里补跑 `og.mjs --only home-es` 后，`build` / `build --pseudo` 均 0 error，`node --test scripts/tests/*.test.mjs` 58/58 通过。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | "WordByWord: traductor bilingüe de páginas web para iPhone" | 品牌位 "WordByWord"（ES/MX 店面名就是 WordByWord，文档 03 §1.5）；K1 主词逐字 "traductor bilingüe de páginas web para iPhone"（文档 03 §2.3 表 A）；`seo.titleMust` 三个词元 iPhone / páginas web / traductor 全部命中；`primaryTokens.home.es`（iPhone + traductor）命中 | 57 字符（上限 60） |
| `meta.description` | "Aprende idiomas: en WordByWord, desliza un párrafo y su traducción aparece debajo. Toca dos veces una palabra para ver su significado. Gratis en iPhone y iPad." | 受众词 "aprender idiomas"（表 C，R39）；K1 动作 + 结果在前半句完整出现；"en WordByWord"（文档 03 §3.2 允许的写法，替代"内置浏览器"）；K2 动作 + 结果（toca dos veces → significado）；平台词 + 免费结尾（SEO-11）；不写价格 | 159 字符（区间 120–160） |
| `hero.title`（H1） | "Desliza un párrafo de una [[página web]]: su traducción aparece justo debajo." | K1 核心名词 "página web"（荧光笔 2 词，R65）；"段落"一级的动作 + 结果（R46、PRO-19），不暗示整页；不含品牌（R27）；不是 how-to 句式 | 73 字符（上限 75） |
| `hero.eyebrow` | "WordByWord · Lector web bilingüe para aprender idiomas" | 品牌 + 品类（bilingual web reader）+ 受众 | 54 wu（上限 60） |
| `hero.lede` = `ledeShort` | "WordByWord es un asistente de lectura para estudiantes de idiomas, en iPhone y iPad." | R39 定义句，以 "WordByWord es" 开头；"asistente" 只出现在定义句（§7.3 补充第 5 条） | 84 字符（上限 90） |
| `meta.ogHeadline` | "Lee cualquier página web en dos idiomas. [[El original, intacto.]]" | K1 场景；荧光笔 1 处 | 64 px × 3 行 |
| 功能区 H2 | "Desliza para traducir y toca dos veces para buscar, en las páginas web que lees" | K1 + K2 场景句；按 PRO-16 写"你读的网页"，不写"任何网页都能查词" | 79 字符 |
| 功能 H3 | K2 "Toca dos veces una palabra: la IA te da su significado en contexto"；K9 "Traduce publicaciones de X (antes Twitter) en el navegador integrado"；K5 "Extracción de Fragmentos y Action Flow, para oraciones en inglés"（带"英语"限定，R83）；K3 "Lectura en voz alta con IA o con las voces rápidas de iOS"；K4 "Analiza con IA la estructura de las oraciones largas"；K7 "Traducción en la nube o en el dispositivo"；K6 "Historial de traducciones y palabras consultadas" | 文档 03 §2.3 表 A / B 的 es 主词（K6、K7 逐字；K2 用 "significado … en contexto" + IA；K3 "lectura en voz alta con IA"；K4 "analizar la estructura de una oración con IA" 的动词形式） | 全部 ≤ 70 wu |
| 语言段 H2 | "Traducción a 21 idiomas, no solo desde el inglés" | K8 主词 "traducción a 21 idiomas"（数字用复数对象） | 48 字符 |
| 价格段 H2 | "Gratis todos los días. Actualiza a Plus si lees más" | K10 "gratis"；"Actualiza a Plus" 对应 App 的 "Actualizar a Plus" | 51 字符 |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（"aprender inglés""noticias en inglés"，文档 03 §1.4）；title / H1 / description / `cta.title` 里没有 how-to 句式（"cómo traducir""conservar el original" 等，见 §6 第 4 条的补丁）。"noticias en inglés" 只出现在 SE 卡片的锚文本里（R76 允许的位置）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | 通过 | JSON 可解析；与 en 键一致（L-1、L-2，`--keys` 0 缺 0 多）；副本 `build` 与 `build --pseudo` 0 error（真实仓库在生成 OG 图前会有 D-23，见 §6 第 1 条） |
| Q2 | 通过 | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 全部保留，ref 只用 @about / @se-site / @chrome（白名单内）；没有写死额度、价格、语言数（L-12 无提示）。es 的 CLDR 复数类别是 one / many / other（Node 24 ICU），所有"数字 + 可数名词"都写成含这三个类别的复数对象（`languages.title/uiCount/targetCount`、`gallery.items[languageList].caption`、`faq.items[languages|free].a`、`cta.recap`、`sibling.card.note`），用当前值核对过渲染："21 idiomas""20 idiomas""12 idiomas""50 traducciones""20 búsquedas""30 extracciones""20 flujos""5 explicaciones"。many 分支写 "# de idiomas"（西语百万级整数要加 de，如 "1.000.000 de idiomas"），当前值不会用到。`pricing.table.perDay` 写 "{n} al día"，数字后没有名词，不需要复数对象 |
| Q3 | 通过 | title 以品牌位开头，含全部 `titleMust` 词元；K1 为产品 / 品类意图（traductor），不与 G1 指南标题重复；title、description、H1、功能区 H2 无 §1.4 禁用主词 |
| Q4 | 通过 | `hero.title` 恰好 1 处 `[[ ]]`，标的短语 2 个词；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以 "WordByWord es" 开头并写明受众 |
| Q5 | 通过 | §1.1 红线表逐行核对（交互只写"内置浏览器里向右滑段落"；没有整页 / 一键 / Safari 扩展 / 离线 / 无限 AI 发音 / 暗色模式 / 生词本 / 安卓 / 账号同步）；§7.5 禁用说法：用 §6 第 3 条的 es 规则跑 L-14，0 命中（豁免键内的否定句除外），并做了人工复核 |
| Q6 | 通过 | 手势：句中 "desliza (un párrafo) a la derecha"、"toca dos veces"（App 的 tip 文案就是这两个说法），名词用 App 已有的 "doble toque"；kicker 用 App 叫法 "Deslizar para traducir""Toca dos veces para buscar"；§7.2.2 的 X1–X13 都不涉及 es；L-13 0 违规 |
| Q7 | 通过 | 每个 `alt`、`gallery.items[].caption` 都描述 en 截图里实际可见的内容并写明 "(interfaz en inglés)"（截图已逐张目视核对：西语维基页面 + 英文译文、convirtiéndose 卡片、设置页 Auto / Quote Style / Local Read、matrimonio 释义页、Spanish → English (US)、语言列表）；`features[x].alt` 描述社交帖样张并写 "no es una captura"；`demo.lookup.word` "end" 出现在 `demo.source[1]` |
| Q8 | 通过 | `seMode = local`：链接 SE 西语页（`hreflang="es"`）；`note` 写 "App en 12 idiomas, español incluido"；H2 以 "SurfEnglish:" 开头；没有"升级 / 替代 / New / 可能更适合你"；卖点只有 R41 三项，不写语音；`linkText` 是 SE 核心词短语，不是裸域名；local 模式不加 en-site 的界面说明句 |
| Q9 | 通过（1 条 W） | 代入占位符后全部在 §7.6 / L-8 上限内，唯一例外是 `features[lookup].kicker`（App 原名 26 字符 > 24 wu，见 §6 第 2 条）。`hero.how` 173（上限 180 wu）；规格清单 4 条 77–78 字符（上限 80）；所有 alt ≤ 125；`sibling.card.body` 28 词（上限 45）；`pricing.summary` 96 wu（上限 100） |
| Q10 | 通过 | es 不是 RTL / CJK / 泰文 / 天城文；没有 `{wbr}` |

## 3. 回译对照（es → English，对照 en.json）

| 键 | es | 回译（back-translation） | en.json |
|---|---|---|---|
| `meta.title` | WordByWord: traductor bilingüe de páginas web para iPhone | WordByWord: bilingual web page translator for iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| `meta.description` | Aprende idiomas: en WordByWord, desliza un párrafo y su traducción aparece debajo. Toca dos veces una palabra para ver su significado. Gratis en iPhone y iPad. | Learn languages: in WordByWord, swipe a paragraph and its translation appears below. Double-tap a word to see its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| `meta.ogHeadline` | Lee cualquier página web en dos idiomas. [[El original, intacto.]] | Read any web page in two languages. The original, intact. | Read any web page bilingually. Keep the original. |
| `meta.ogSubline` | Desliza un párrafo a la derecha · toca dos veces una palabra: su significado en contexto | Swipe a paragraph to the right · double-tap a word: its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| `hero.title` | Desliza un párrafo de una [[página web]]: su traducción aparece justo debajo. | Swipe a paragraph of a web page: its translation appears right below. | Swipe a paragraph on any web page. Its translation appears right below. |
| `hero.lede` | WordByWord es un asistente de lectura para estudiantes de idiomas, en iPhone y iPad. | WordByWord is a reading assistant for language students, on iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| `hero.how` | Abre un sitio web en el navegador integrado y desliza un párrafo a la derecha: la traducción aparece debajo. Toca dos veces una palabra y la IA te explica qué significa ahí. | Open a website in the built-in browser and swipe a paragraph to the right: the translation appears below. Double-tap a word and the AI explains what it means there. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| `featuresIntro.title` | Desliza para traducir y toca dos veces para buscar, en las páginas web que lees | Swipe to translate and double-tap to look up, on the web pages you read | Swipe to translate, double-tap to look up — on the websites you read |
| `features[swipe].title` | Deslizar para traducir: la traducción aparece debajo del original | Swipe to Translate: the translation appears below the original | Swipe to Translate: the translation appears right below the original |
| `features[lookup].title` | Toca dos veces una palabra: la IA te da su significado en contexto | Double-tap a word: the AI gives you its meaning in context | Double-tap a word for its AI meaning in context |
| `features[x].title` | Traduce publicaciones de X (antes Twitter) en el navegador integrado | Translate X (formerly Twitter) posts in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| `features[chunks].title` | Extracción de Fragmentos y Action Flow, para oraciones en inglés | Chunk Extraction and Action Flow, for English sentences | Chunk Extraction and Action Flow, for English sentences |
| `features[speech].title` | Lectura en voz alta con IA o con las voces rápidas de iOS | Read-aloud with AI or with the fast iOS voices | AI read-aloud, or fast on-device iOS voices |
| `features[syntax].title` | Analiza con IA la estructura de las oraciones largas | Analyze the structure of long sentences with AI | AI sentence structure analysis for long sentences |
| `features[engines].title` | Traducción en la nube o en el dispositivo | Translation in the cloud or on the device | Cloud or on-device translation |
| `features[display].title` | Diseño y estilo de la traducción | Layout and style of the translation | Translation layout and style |
| `features[history].title` | Historial de traducciones y palabras consultadas | History of translations and looked-up words | Translation and lookup history |
| `features[devices].title` | iPhone, iPad, Mac y Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| `faq[what-is].q` | ¿Qué es WordByWord? | What is WordByWord? | What is WordByWord? |
| `faq[whole-page].q` | ¿Puede WordByWord traducir una página web entera de una vez? | Can WordByWord translate an entire web page at once? | Can WordByWord translate a whole web page at once? |
| `faq[safari].q` | ¿Funciona en Safari o dentro de otras apps? | Does it work in Safari or inside other apps? | Does it work in Safari or inside other apps? |
| `faq[word-by-word].q` | ¿WordByWord es un traductor palabra por palabra? | Is WordByWord a word-by-word translator? | Is WordByWord a word-by-word translator? |
| `faq[x].q` | ¿Puedo leer X (antes Twitter) con WordByWord? | Can I read X (formerly Twitter) with WordByWord? | Can I read X (Twitter) with WordByWord? |
| `faq[languages].q` | ¿Qué idiomas admite WordByWord? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| `faq[free].q` | ¿WordByWord es gratis? ¿Cuáles son los límites diarios? | Is WordByWord free? What are the daily limits? | Is WordByWord free? What are the daily limits? |
| `faq[engines].q` | ¿Qué motor de traducción usa? | Which translation engine does it use? | Which translation engine does it use? |
| `faq[account].q` | ¿Necesito una cuenta para usar WordByWord? | Do I need an account to use WordByWord? | Do I need an account to use WordByWord? |
| `faq[restore].q` | ¿Cómo recupero WordByWord Plus en un iPhone o iPad nuevo? | How do I get WordByWord Plus back on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| `faq[android].q` | ¿Hay una versión para Android? | Is there a version for Android? | Is there an Android version? |
| `faq[english-learner].q` | Estoy aprendiendo inglés. ¿Vale la pena probar también SurfEnglish? | I'm learning English. Is it worth trying SurfEnglish too? | I’m learning English. Is SurfEnglish worth trying too? |
| `faq[devices].q` | ¿WordByWord funciona en iPad, Mac o en un navegador de escritorio? | Does WordByWord work on iPad, Mac or in a desktop browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| `pricing.summary` | Todas las funciones son gratis con estos límites; Plus los amplía por {plus.priceUS} al mes (EE. UU.). | All features are free with these limits; Plus raises them for US$3.99 a month (US). | Every feature is free within these limits; Plus raises them for {plus.priceUS}/month (US). |
| `sibling.card.eyebrow` | Del desarrollador de WordByWord | From the developer of WordByWord | From the developer of WordByWord |
| `sibling.card.title` | SurfEnglish: noticias diarias en inglés a tu nivel | SurfEnglish: daily news in English at your level | SurfEnglish: daily English news at your level |
| `sibling.card.body` | ¿Aprendes inglés? Sigue leyendo en WordByWord lo que quieras y prueba también SurfEnglish: noticias diarias por niveles y juegos de repaso, con el mismo deslizamiento y doble toque. | Learning English? Keep reading whatever you like in WordByWord and try SurfEnglish too: daily news by level and review games, with the same swipe and double-tap. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| `sibling.card.points` | Noticias reales en inglés, niveles A1–C1 / Juegos de repaso con lo que has leído / Comparte artículos en inglés desde Safari | Real news in English, levels A1–C1 / Review games with what you've read / Share English articles from Safari | Real English news at levels {se.levels} / Review games built from what you’ve read / Share English articles from Safari to the app |
| `sibling.card.note` | Gratis para empezar · iPhone y iPad · App en 12 idiomas, español incluido · Traduce a 21 idiomas | Free to start · iPhone and iPad · App in 12 languages, Spanish included · Translates into 21 languages | Free to start · iPhone and iPad · App in {se.uiLanguages} languages · Translations into {se.targetLanguages} |
| `sibling.card.linkText` | Noticias en inglés con traducción — SurfEnglish | English news with translation — SurfEnglish | Read English news at your level with SurfEnglish |
| `sibling.card.appStoreLinkText` | Consigue SurfEnglish en el App Store | Get SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| `sibling.card.shotAlt` | SurfEnglish, pantalla de juegos (interfaz en inglés): Sentence Builder y Word Raid, con frases y palabras guardadas | SurfEnglish, games screen (English interface): Sentence Builder and Word Raid, with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| `sibling.card.shotCaption` | Captura de SurfEnglish (interfaz en inglés) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| `sibling.footer.heading` / `linkText` | Del mismo desarrollador / SurfEnglish: Inglés y noticias | From the same developer / SurfEnglish: English and news（SE 在 ES/MX 店面的正式名） | More from the maker / SurfEnglish: Bilingual News |
| `cta.title` | Empieza a leer sitios web en dos idiomas en tu iPhone | Start reading websites in two languages on your iPhone | Start reading websites bilingually on iPhone |
| `cta.recap` | Desliza para traducir · Toca dos veces para buscar · Lectura en voz alta · 21 idiomas | Swipe to translate · Double-tap to look up · Read aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · {targetLanguages} languages |

FAQ 答案（不在回译清单里）也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音不限次、Plus 为月订且美区价格 + 以 App Store 为准；`restore` 引用 App 按钮 "Actualizar Ahora" → "Restaurar Compra"（T-E）；`devices` 的 S0 答案只写"同一开发者正在准备一个 Chrome 扩展"，不写扩展名称（R45），`aExtLive` 才写 "WordByWord Translate para Chrome" 和"只从该页链接安装"。

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都不改变事实：

1. `meta.description`："in the built-in browser" 写成 "en WordByWord"（文档 03 §3.2 允许的三种写法之一，与 §3.9 es 草案一致；"navegador integrado" 放进 160 字符会超长）。受众写成祈使句 "Aprende idiomas:"（草案原样）。
2. `hero.title`："any web page" 写成 "una página web"（草案原样；加 "cualquier" 会超过 75 字符，除非删掉 "justo"，见 §4 第 2 条）。
3. `features[x].title`：en 的 "read … bilingually" 写成 "Traduce publicaciones de X"，把 K9 主词 "traducir publicaciones de X (Twitter)" 放进 H3；正文仍写"译文出现在帖子下方"。
4. `sibling.card.body`：省掉了 "news" 前的 "English"（卡片 H2 和第 1 条要点里都有 "en inglés"），为了让卡片在 320 px 下不超过 560 px（§7）。
5. `sibling.card.points[2]`：省掉 "to the app"（"desde Safari" 已经说明是分享进 App）。
6. `sibling.card.linkText`：用文档 04 §5.7 的 es 种子（SE 西语站的核心词 "noticias en inglés con traducción"），没有 "at your level"。
7. `hero.platformNote` 不写美区价格（D2，与 ja / zh-Hans 相同）；`sibling.card.note` 写 "español incluido"（§7.8 local 模式要求）。

## 4. 没把握的措辞（12 处，附回译与替代写法）

| # | 键 | 现写法 | 回译 | 顾虑 | 替代写法 |
|---|---|---|---|---|---|
| 1 | `meta.description` | "Aprende idiomas: en WordByWord, desliza…" | "Learn languages: in WordByWord, swipe…" | 祈使句开头 + 冒号，像口号；草案原样 | "Para aprender idiomas: en WordByWord, desliza…"（164 字符，超出区间 → L-8 W）或把 K2 句改短为 "Doble toque en una palabra: su significado." 来换空间 |
| 2 | `hero.title` | "Desliza un párrafo de una página web: su traducción aparece justo debajo." | "Swipe a paragraph of a web page: its translation appears right below." | "deslizar un párrafo"（把段落当宾语）是 App 的说法，但 "de una página web" 略平 | "Desliza un párrafo de cualquier [[página web]]: la traducción aparece debajo."（73，保留 any，去掉 justo） |
| 3 | `meta.ogHeadline` | "Lee cualquier página web en dos idiomas. El original, intacto." | "Read any web page in two languages. The original, intact." | "intacto" 是否太强；"en dos idiomas" 是否不如 "bilingüe" 抓眼 | "Lee cualquier página web en bilingüe. [[Sin perder el original.]]"（需重跑 og.mjs） |
| 4 | `hero.lede` / FAQ / 页脚 | "…para estudiantes de idiomas…" | "…for language students…" | "estudiantes" 可能让人以为只给在校学生；但更长的 "quienes aprenden idiomas" 在 375 px 下多占一行，把样张红条推到 813 px | "WordByWord es un asistente de lectura para quienes aprenden idiomas, en iPhone y iPad."（85 字符，手机 3 行） |
| 5 | `features[x]`、FAQ `x` | "X (antes Twitter)" | "X (formerly Twitter)" | §7.2.3 要求首次出现写"X（旧 Twitter）"格式；K9 主词写的是 "X (Twitter)"，两者是否要统一 | 全部写 "X (Twitter)"，与关键词一致 |
| 6 | `features[x].title` | "Traduce publicaciones de X (antes Twitter) en el navegador integrado" | "Translate X (formerly Twitter) posts in the built-in browser" | en 强调"双语读"，es 强调"翻译"（为了 K9 主词） | "Lee publicaciones de X (antes Twitter) en bilingüe, en el navegador integrado"（75 > 70 wu → L-8 W） |
| 7 | `cta.title` | "Empieza a leer sitios web en dos idiomas en tu iPhone" | "Start reading websites in two languages on your iPhone" | 连续两个 "en" | "Lee sitios web en dos idiomas desde tu iPhone" |
| 8 | `sibling.card.body` | "…noticias diarias por niveles y juegos de repaso…" | "…daily news by level and review games…" | 去掉了 "en inglés"，靠上下文表明是英语新闻 | "…noticias diarias en inglés por niveles…"（320 px 下卡片 566 px，超 R84 的 560） |
| 9 | `features[engines].text` | "Nube (Azure y Google) o en el dispositivo (iOS); ¿sin cuota? Cambia al local." | "Cloud (Azure and Google) or on the device (iOS); out of quota? Switch to local." | 规格清单 80 字符限制下很紧凑，"cuota" 指云端次数要靠上下文 | "En la nube (Azure y Google) o en iOS; si se agota la nube, usa el local."（74） |
| 10 | `pricing.table.rows.lookup` | "Toca dos veces para buscar (IA)" | "Double-tap to look up (AI)" | App 原名是 "Toca dos veces para buscar (Significado AI)"；原名在手机表格里占 4 行 | "Toca dos veces para buscar (significado con IA)"（手机 4 行，整页 +45 px） |
| 11 | `demo.lookup.note` | "En esta oración forma parte del verbo frasal “end up”." | "In this sentence it is part of the phrasal verb “end up”." | 西语英语教学里也常直接说 "phrasal verb" | "En esta oración forma parte del phrasal verb “end up”." |
| 12 | `meta.appStoreSubtitle` | "Desliza para traducir, la IA explica" | "Swipe to translate, the AI explains" | ES/MX 店面的真实副标题查不到（研究 05 §2.1 只列了 US/JP/CN/TW/KR/DE），现值是 US 副标题的译文；该键只在 en 的 about 页用，es 页面不渲染 | 拿到 App Store Connect 的 es 副标题后替换 |

## 5. 西语处理要点（给审校人）

1. **App 叫法（rule ①）**：kicker 用 App 名（"Deslizar para traducir""Toca dos veces para buscar"，去掉 "(Significado AI)" 后缀，与 en / ja / zh-Hans 的做法一致）；正文里点名的 App 按钮 / 设置照 App 原文加引号：“Obtener explicación de sintaxis de IA”、“Lectura AI”、“Lectura local”、“Actualizar Ahora”、“Restaurar Compra”、"Más definiciones"、"Extracción de Fragmentos"、"Flujo de acciones"、"Automático / Párrafo / Frase por Frase"。Action Flow 在 H3 和样张标签里保留 App Store 名，正文写 "Flujo de acciones (Action Flow)"，价格表行名用 App 名 "Flujo de acciones"（文档 08 D3，与 zh-Hans 的处理相同）。
2. **AI / IA**：App 的 es 界面两种写法都有（"Lectura AI""Significado AI""Pronunciación AI" vs "…de IA"）。网站正文和表格行名一律写西语的 "IA"；只有在引号里引用 App 设置名时照 App 写 "Lectura AI"。见 §6 第 5 条。
3. **截图说明**：17 个 locale 都用 en 截图。除了 §7.1-5 要求的 alt 和画廊图注，我还在 `common.screenshotLabel` / `screenshotExcerptLabel`（功能区截图下的可见图注）加了 "(interfaz en inglés)"，让看图的人也知道为什么界面是英文（见 §6 第 6 条）。en 截图的原文是西语、译文是英语，alt 如实写了"西语页面 + 英文译文"。
4. **App Store 徽章**：es-es 徽章的图上文字是 "Consíguelo en el App Store"（页面实测），所以 `common.appStoreBadgeAlt` 写 "Consigue WordByWord en el App Store"，SE 文字链接写 "Consigue SurfEnglish en el App Store"（T8：用徽章动词 + 品牌，正好对应 en 的 "Get SurfEnglish on the App Store"）。
5. **价格**：`{plus.priceUS}` 在 es 渲染为 "3,99 US$"（`Intl.NumberFormat('es')`）；表头第二行在 "(EE. UU.)" 前换行。
6. **复数**：见 §2 Q2。

## 6. 需要负责人决定的问题

1. **D-23（构建会失败）**：真实仓库没有 `home-es` 的 OG 图，es.json 进入后 `node build.mjs` 会报 `D-23 home-es: no OG image`（与 zh-Hant 相同）。副本里已验证 `node scripts/og.mjs --only home-es` 一次通过、版式与 en 相同；按简报没有复制 OG 文件，请在统一生成 OG 时一起跑。
2. **`features[lookup].kicker` 超长（L-8 W）**："Toca dos veces para buscar" 26 字符 > 24 wu。这是 App 的功能名（去掉后缀），rule ① 要求 kicker 用 App 叫法，所以保留；实测 375 px 下大写 eyebrow 仍是一行，320 px 可以正常折行。如果要消掉 W，可改成非 App 用语 "Doble toque para buscar"（23），同时要改 glossary。
3. **claims-lint.json 缺 es 规则（L-14 W）**：按简报没有改数据文件。下面是我在副本里加入并测试过的 es 写法（对本文案 0 命中；对 24 个反例句子全部命中，例如 "Traduce la página web entera con un toque""sin conexión""modo oscuro""pares de idiomas""puede encajarte mejor"）。合并方式：把每个数组加到对应规则的 `patterns.es`（`selection-translate`、`jargon` 已有 es，不变）：

   ```json
   {"whole-page": ["traduc\\w* (toda |una |la )?(la )?página (web )?(entera|completa)", "página (web )?(entera|completa) de una vez", "traducción de (páginas?|webs?|sitios?)( web)? (enteras?|completas?)", "(con|en) un (solo )?toque", "traduc\\w* (todo el|un) sitio (web )?(entero|completo)"], "swipe-left": ["desliz\\w*[^.;:]{0,30}izquierda"], "safari-extension": ["extensión (de|para) Safari", "extensión (para|de) compartir", "en cualquier (otra )?app\\b", "dentro de (cualquier|otras) apps?", "desde cualquier app", "sin cambiar de app"], "offline": ["sin conexión", "\\boffline\\b", "sin (acceso a )?internet", "fuera de línea"], "unlimited-ai-voice": ["(IA|AI) ilimitad", "(pronunciación|lectura|voz|voces)( con| de)? (IA|AI) (ilimitad|sin límite)", "ilimitad\\w* (de |con )?(IA|AI)"], "dark-mode-theme": ["modo oscuro", "modo noche", "temas? personalizad", "colou?r(es)? de(l)? tema"], "shortcuts-volume": ["atajos? de teclado", "volumen"], "vocab-sync": ["tarjetas de (memoria|estudio)", "flash ?cards?", "(cuaderno|lista|libreta) de vocabulario", "sincroniz\\w*", "copia de seguridad en la nube", "repetición espaciada"], "android": ["android", "google play"], "desktop-version": ["versión (de|para) (escritorio|PC|Windows|ordenador|computadora)", "app de escritorio", "para (Windows|PC)\\b"], "x-app": ["(en|dentro de) la app de X\\b", "única app (que|para) traduc\\w* X\\b"], "plus-early-access": ["acceso anticipado"], "privacy-claim": ["no (se )?recopila\\w* (ningún |ninguna )?(dato|información)", "sin rastreo", "no (te )?rastrea"], "initial-version": ["versión inicial"], "language-pairs": ["pares? de idiomas"], "style-count": ["\\b\\d+ estilos", "\\b(cinco|seis|siete|ocho|nueve|diez) estilos"], "auto-detect-target": ["detecta\\w* (automáticamente )?(el )?idioma de destino"], "history-by-date": ["(agrupad|ordenad|clasificad)\\w* por fecha"], "plus-only": ["solo (para|con|en) (WordByWord )?Plus", "exclusiv\\w* (de|para) (WordByWord )?Plus"], "speaking-practice": ["expresión oral", "practica\\w* (la |tu )?pronunciación", "mejora\\w* tu (forma de )?hablar", "práctica de conversación"], "replacement-tone": ["puede encajarte mejor", "te (puede )?encaja\\w* mejor", "más adecuad", "en lugar de WordByWord", "app hermana", "(sustitu|reemplaz)\\w* (a )?WordByWord", "versión anterior de WordByWord"], "se-on-device-voice": ["voz (de IA )?en (el|tu) dispositivo", "voces? (de IA )?en (el|tu) dispositivo", "voces? sin conexión"], "se-hype": ["\\bnuev[oa]s?\\b", "más rápid", "más eficiente", "\\bactualiza", "mejor que"], "hype": ["revolucionari", "\\bel mejor\\b", "\\bla mejor\\b", "número uno", "\\bel único\\b", "\\bla única\\b", "primer\\w* del mundo", "(miles|millones) de (usuarios|personas|descargas)", "\\d[\\d.,]*\\s?(mil )?(usuarios|descargas)", "equipo de WordByWord", "nuestro equipo", "di adiós"], "ext-language-count": ["\\b(1\\d|2\\d)\\+? (idiomas|pares de idiomas)\\b"]}
   ```

4. **keyword-map.json 缺 es 的 G1 how-to 词（L-9 W）**：建议 `reserved.G1.es = ["\\bcómo (traducir|leer|ver)\\b", "(conservar|mantener|sin perder) el (texto )?original"]`，副本里测过，对本文案 0 命中（注意它会禁止首页 title / H1 / description / `cta.title` 出现 "sin perder el original"；OG 不在检查区）。
5. **App 的 es 界面混用 "AI" 与 "IA"**：建议报给 App 侧统一为西语的 "IA"（"Lectura con IA""Significado con IA""Pronunciación con IA"），之后可以把它记成文档 08 §7.2.2 的新 X 条目。在此之前网站正文写 "IA"，引用设置名时照 App 写 “Lectura AI”。是否现在就把 `features[speech].text` 的引号名改成 "IA"，请决定。
6. **截图图注里的"英文界面"**：我把 "(interfaz en inglés)" 加进了 `common.screenshotLabel` / `screenshotExcerptLabel`（可见图注），超出 §7.1-5 的最低要求（alt + 画廊图注）。如果希望各 locale 统一不加，改回 "Captura del iPhone" / "Detalle de captura" 即可，不影响校验。
7. **测试夹具（已由 7e5dc74 解决）**：我开工时的副本里，`scripts/tests/validate.test.mjs` 的 "D-2 hreflang clusters" 写死了 `/ja/ (ja): 3 hreflang links, expected 4`，es 发布后该测试和 "every rule … was caught" 元测试失败（56/58）。负责人在提交 7e5dc74（zh-Hant）里已把断言改成按 locale 数量计算；用当前 HEAD + es 复测为 58/58，无需再处理。
8. **`meta.appStoreSubtitle`**：见 §4 第 12 条，请提供 ES/MX 店面的真实副标题，或确认保留现值（es 页面不渲染此键）。
9. **母语审校（R36，T2 上线后补）**：建议审校人重点看 §4 的 12 处，以及"estudiantes de idiomas / quienes aprenden idiomas"、"X (antes Twitter)"、引号用 “ ” 还是 RAE 推荐的 « » 这三个统一性选择。

## 7. 版面实测（副本 + 本地 Cloudflare 模拟服务器，浅色模式）

| 视口 | SE 卡片高度（上限） | 样张红色译文条顶端 | 整页高度 | 横向溢出 |
|---|---|---|---|---|
| 1280 × 900 | 361 px（420） | — | 10,375 px（en 10,079） | 无 |
| 390 × 844 | 453 px（480） | 735 px（< 844，R69） | 12,984 px（目标 ≤ 13,000；en 12,758） | 无 |
| 375 × 812 | 453 px（480） | 733 px（en 733） | — | 无 |
| 320 × 700 | 545 px（560，R84） | — | 14,057 px | 无（价格表在自己的横向滚动容器内，与 en 相同） |

为满足上面的数字所做的调整（初稿 → 定稿）：
- `hero.secondaryCta` "Mira cómo funciona" → "Cómo funciona"：初稿在 375 px 下比可用宽度多 1 px，链接掉到徽章下面一行，样张下移 52 px。
- `hero.lede` "…en iPhone y iPad para quienes aprenden idiomas." → "…para estudiantes de idiomas, en iPhone y iPad."：手机上 3 行 → 2 行（§4 第 4 条）。
- 价格表行名缩短（"· motor en la nube" → "· nube"，"(significado con IA)" → "(IA)"）：390 px 下价格区 1,502 → 1,412 px。
- `features[syntax].text` 删去 "entre sí"，`sibling.card.note` 改为 "español incluido · Traduce a 21 idiomas"（手机 3 行 → 2 行），`sibling.card.body` 改为 "¿Aprendes inglés? … lo que quieras … noticias diarias por niveles …"（320 px 下卡片 566 → 545 px）。
- 目视检查了 375 px 的 hero、样张查词卡、L1 / L2 功能块（含 ①②③ 页边注）、X 样张、语块示意、价格表、SE 卡片和 FAQ，没有溢出或异常断行；kicker "02 TOCA DOS VECES PARA BUSCAR" 在 375 px 下是一行。
