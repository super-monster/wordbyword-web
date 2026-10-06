# M3 · ru（Русский）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | ru（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校） |
| 交付 | `src/locales/ru.json`（新建）；`src/data/glossary/ru.json`（新建，§7.2.5 格式）；本记录；lint 建议 `docs/redesign-2026/ops/m3/ru-lint.json` |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（ru 行，表 A/B/C）、§3.1–§3.9（ru 草案）、§4.3；文档 04 §5.1、§5.5、§5.7（ru 的 uiNote、linkText 种子、T1–T11）；裁定 R36、R39–R43、R46、R52、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照，`fr.json`（同为 en-site）作 SE 写法参照 |
| App 叫法来源 | `WordByWordPrototype/Localizable.xcstrings` 的 ru 值（2026-10-06 逐键抽取）与 App 自己的额度列表 `FeatureQuotaManager.swift` `featureDisplayName()`；App Store RU 店面名称 / 副标题取自 scratchpad 里 2026-10-05 保存的店面页 `as_ru.html` |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-ru/` 构建和验收；OG 图只在副本里生成，**没有**复制进真实仓库；最终验证在新的 HEAD 副本 `scratchpad/wbw-m3-ru-final3/`（用 `git archive 54afac8` 导出的真实仓库 HEAD + ru 两个文件；工作区里任何未提交的修改都没有带入）上重跑 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 一致（`check.mjs --keys ru`：0 缺、0 多；`about.*`、`chromeExtension.*`、`legal.*` 与 ja / fr 一样不提供，ru 没有这些页面；`notfound.*` 照 ja / fr 提供；en-site 所需的 `sibling.card.uiNote` 已提供）。新 HEAD 副本（54afac8，`git archive` 导出，不含工作区里任何未提交的修改）里 `node build.mjs`、`--pseudo` 均 **0 error**，`node --test scripts/tests/*.test.mjs` 60/60，`scripts/check.mjs` 0 error。
2. ru 自己的 warning 只有两条：L-8 `features[lookup].kicker` 29 > 24（有意保留 App 叫法「Дважды коснитесь, чтобы найти」，见 §6 第 3 条）；L-4 6 个值与 en 相同（全是文档 08 §1.5 列出的"照抄"键）。用真实仓库现有的 `claims-lint.json` / `keyword-map.json` 构建时还会多两条汇总 W：L-14"ru 未覆盖 24 条规则"、L-9"ru 没有 G1 how-to 模式"——原因是这两个数据文件还没有 ru 词表。我把建议词表写在 `ru-lint.json`（附录 A），只在副本里合进去自测：ru 文案 0 命中，59 条反例全部命中。
3. title 逐字照用文档 03 §3.9 的 ru 草案（n58）；description 只把"проведите по абзацу вправо"换成 App 提示里的语序"проведите вправо по абзацу"（n157）；H1 在草案基础上补了 en 的"any"并把荧光笔放在 K1 核心名词上：«Проведите вправо по абзацу [[любого сайта]] — перевод появится прямо под ним.»（n73）。
4. 品牌位：title 用 App Store RU 店面名「WordByWord Переводчик」（文档 03 §1.5、§7.2.3），正文一律写「WordByWord」。称谓 вы（小写）。手势：右滑写「проведите вправо (по абзацу)」（App 的 `tip_swipe_to_translate` 同语序），名词用「перевод свайпом」；双击写「дважды коснитесь (слова)」（App 的 `tip_double_tap_context_meaning`），名词用 App 已有的「двойное касание」。
5. 复数（R62）：ru 的 CLDR 类别是 one / few / many / other。所有"数字占位符 + 名词"都写成四类复数对象，并按句中的格选词形：宾格「на 21 язык / 22 языка / 25 языков」、前置格「на 20 языках / 21 языке」、表格「N в день」、FAQ「50 раз」。用 1–500 的值逐个渲染核对过（§2 Q2）。
6. SurfEnglish：ru 的 `seMode` = en-site。卡片 note 由 uiNote 替换（"界面是英语和另外 11 种语言、没有俄语；可译成俄语"）；linkText 用文档 04 §5.7 的 ru 种子并标注"(англоязычный сайт)"，链 SE 英文站（模板加 `hreflang="en"`）；FAQ `english-learner` 链接前加了 §7.8 要求的界面说明句。
7. OG（只在副本）：`node scripts/og.mjs --only home-ru` 一次通过，标题 64 px × 3 行、副标题 28 px × 2 行、151.6 KB。
8. 渲染（新 HEAD 副本 + `scripts/serve.mjs` 端口 4604 + 本机 headless Chrome，外部请求全部拦截）：1280 / 390 / 375 / 320 px 都没有页面级横向溢出；SE 卡片 370 / 448 / 469 / 542 px（上限 420 / 480 / 480 / 560，全部满足）；价格表在 320–1440 px 的 19 个宽度下都完整显示、不需要横向滚动（54afac8 的表格 CSS）；390 px 页面高 13,833 px，超过 13,000 的软目标（§6 第 5 条）。
9. 第二模型互检（Claude Sonnet，只读，§8）：结论是"读起来像俄语母语的产品网站"（自评 8/10）。27 条意见采纳 19 条（含 2 条按版面实测换了写法），8 条说明理由后未采纳；没有发现事实偏差、整页 / 离线 / Safari 扩展 / 替换性措辞。
10. 需要负责人处理的事（§6）：① 真实仓库生成 `home-ru` OG 图前会报 D-23；② `ru-lint.json` 的合入（交付时负责人已在工作区合入）；③ kicker 的 L-8 W；④ App 侧 ru 文案问题清单（§5）；⑤ 几处取舍。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案（回译） | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | «WordByWord Переводчик: двуязычный перевод сайтов на iPhone»（WordByWord Translator: bilingual website translation on iPhone） | 品牌位 = RU 店面名「WordByWord Переводчик」（自带品类词"翻译器"，文档 03 §1.5）；K1「перевод сайтов на iPhone」（文档 03 表 A 次词 / 文档 08 §7.3 K1）逐字；"Переводчик … сайтов … iPhone"同时覆盖表 A 主词「переводчик сайтов для iPhone」的三个词元；`titleMust` = iPhone / сайтов / Переводчик 全部命中；`primaryTokens.home.ru`（iPhone、Переводчик）命中 | n58（上限 60） |
| `meta.description` | «Для изучающих языки: в WordByWord проведите вправо по абзацу — перевод появится под ним. Двойное касание слова покажет значение. Бесплатно для iPhone и iPad.»（For language learners: in WordByWord, swipe right on a paragraph — the translation appears below it. A double tap on a word shows its meaning. Free for iPhone and iPad.） | 受众词「изучающие языки」（表 C，R39）；K1 动作 + 结果在前半句；"в WordByWord"（文档 03 §3.2 允许的写法）；K2 动作 + 结果；平台 + 免费收尾（SEO-11）；不写价格；"на айфоне"按文档 03 §3.2 / §4.3 放在 FAQ `devices` 问句，不进 description | n157（区间 120–160） |
| `hero.title`（H1） | «Проведите вправо по абзацу [[любого сайта]] — перевод появится прямо под ним.»（Swipe right on a paragraph of [[any website]] — the translation appears right below it.） | K1 核心名词「сайт」（荧光笔 2 词，R65）；"段落"级动作 + 结果（R46、PRO-19），不暗示整页；不含品牌（R27）；不是 how-to 句式 | n73（上限 75） |
| `hero.eyebrow` | «WordByWord · Двуязычное чтение сайтов для изучающих языки» | 品牌 + 品类（双语读网站）+ 受众 | 57（上限 60） |
| `hero.lede` = `ledeShort` | «WordByWord — это помощник в чтении на iPhone и iPad для изучающих языки.» | R39 定义句，以"WordByWord — это"开头（俄语的"是"）；"помощник"只出现在定义句（D13、§7.3 补充第 5 条） | n72（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | «Читайте любой сайт на двух языках. [[Оригинал на месте.]]»（Read any website in two languages. [[The original stays in place.]]） | K1 场景；荧光笔 1 处；没用"сохранить оригинал"（留给 G1，见附录 A 的 G1 模式） | 64 px × 3 行 |
| 功能区 H2 | «Перевод свайпом и значения слов двойным касанием — на сайтах, которые вы читаете» | K1「перевод свайпом」+ K2「значение слова」；"на сайтах, которые вы читаете"（PRO-16，不写"任何网站"） | n79 |
| 功能 H3 | K1「Перевод сайтов по абзацам — прямо под оригиналом」；K2「Дважды коснитесь слова — ИИ покажет его значение в контексте」；K9「Перевод постов в X (Twitter) прямо во встроенном браузере」；K5「Извлечение Фрагментов и Action Flow — для английских предложений」（R83 带"英语"限定）；K3「Озвучка голосом ИИ или быстрые голоса iOS на устройстве」；K4「Разбор длинных предложений с помощью ИИ」；K7「Облачный или локальный перевод」；K6「История переводов и поиска слов」 | K6、K7 与文档 03 表 B 主词逐字一致；K2「значение слова … в контексте (ИИ)」、K3「озвучка … голосом ИИ」、K4「разбор … предложени… с помощью ИИ」、K9「перевод постов в X (Twitter)」为主词的词形 / 语序变体；K1 用次词「перевод сайтов」+「под оригиналом」 | 全部 ≤ 70 |
| 语言段 H2 | «Перевод на 21 язык — и не только с английского»（复数对象） | K8 主词「перевод на 21 язык」逐字 | 46 |
| 价格段 H2 | «Бесплатно каждый день. Читаете больше — подключите Plus» | K10「бесплатно」+ Plus | — |
| 最终 CTA H2 | «Читайте сайты на двух языках — прямо на iPhone» | 动作句，不是 G1 标题，不暗示整页（R46） | 46 |
| FAQ 问句 | «Работает ли WordByWord на айфоне, iPad, Mac или в браузере на компьютере?» 等 | SEO-11：ru 的本地写法「на айфоне」用在 `devices` 问句（文档 03 §4.3 给的就是这个问句） | — |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有 `(учить|изучение) английск`，以及附录 A 新增的 `английск… новост`、`новост… на английском` 等）；title / H1 / description / `cta.title` 里没有附录 A 建议的 G1 how-to 模式（`как перевести`、`сохранить оригинал`、`с сохранением оригинала`）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9；另附 Q12、Q13）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys ru` 0 缺 0 多）。新 HEAD 副本 build / `--pseudo` 0 error，`check.mjs` 0 error。真实仓库在生成 OG 前报 D-23（§6 第 1 条） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`。没有写死额度、价格、语言数（L-12 0 条；uiNote / FAQ 里的"11"是文档 08 §7.8 规定由译者写死的 {se.uiLanguages} − 1）。复数对象：`languages.title / uiCount / targetCount`、`gallery.items[languageList].caption`、`faq.items[languages].a`、`faq.items[free].a`、`pricing.table.perDay`、`cta.recap`、`sibling.card.note`，代入当前值渲染为「Перевод на 21 язык」「Приложение на 20 языках」「На выбор 21 язык перевода」「50 раз」「500 в день」（`perDay` 四个分支都是「# в день」，复数对象只是为了满足 L-12），并用 1、2、3、5、21、22、25、101 等值逐个核对了 one / few / many 词形。L-12 要求"数字占位符紧挨字母必须用复数对象"；FAQ `free` 里 "локальным — {quota.localSwipe.free}, значение слова … — {quota.lookup.free}" 这类破折号列举后面不接名词，与 en 同构，可以不用复数对象 |
| Q3 | ✓ | title 以品牌位开头，`titleMust` 三个词元齐全；K1 是产品 / 品类意图；没有禁用主词和 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[любого сайта]]`（2 词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以「WordByWord — это」开头并写明「для изучающих языки」 |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展 / 其他 App 只出现在 FAQ `safari` 的否定回答里；Android 只在 FAQ `android`；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT、隐私断言；CJK 原文不能双击查词、Chunks / Action Flow 仅英语都写了；jargon「выравнивание」「посрочный」（C-16）没有出现。附录 A 的词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required`，L-13 0 违规）：Проведите для перевода、Дважды коснитесь, чтобы найти (AI Значение)、Больше определений、AI произношение (слово / предложение)、Извлечение Фрагментов、Ход действий、Анализ структуры синтаксиса ИИ；句中按 §7.3 写「проведите вправо」「дважды коснитесь」；按钮名照 App 原文加 « » 引用：«Обновить Сейчас»、«Восстановить Покупку»、«Получить объяснение синтаксиса ИИ»、«Чтение ИИ»、«Локальное чтение»、«Автоматический»、«Абзац»、«Предложение за Предложением»。§7.2.2 的 X1–X13 都不涉及 ru；§7.2.3：网站写 Plus，不写 App 里的「Плюс」 |
| Q7 | ✓ | 5 处截图 alt、4 条画廊图注 + alt、2 个截图图注标签（`common.screenshotLabel` / `screenshotExcerptLabel`）、OG alt、SE 截图 alt 与图注都写了"(английский интерфейс)"，内容逐张对照了 `assets/img/shot/en/*` 与 `se/common/games`（语言列表截图里看得到的是越南语、葡萄牙语、乌克兰语、意大利语、中文……，没有俄语，alt 如实写）；`features[x].alt` 描述社交帖样张并注明"(не скриншот)"；样张 `lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | en-site：用 uiNote（不含 `{se.uiLanguages}`，L-11 通过）；linkText 是 SE 核心词短语 + 品牌 +"(англоязычный сайт)"（n67，en-site 上限 80）；FAQ 加了界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句「Учите английский?」；没有"обновление / замена / новый / может подойти лучше"；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音 |
| Q9 | ✓（1 条 W） | 代入占位符后全部在 §7.6 / L-8 限内，唯一例外是 `features[lookup].kicker` 29 > 24（App 叫法）。title 58、description 157、H1 73、eyebrow 57、lede 72、how 172、platformNote 126、规格清单 4 条 74–77、SE 卡片 H2 45 / body 23 词 / 要点 25–32 / linkText 67、`cta.recap` 69、`pricing.summary` 83、所有 alt ≤ 123 |
| Q10 | ✓ | 西里尔文字：引号用 «»，破折号用 —（前面是不换行空格，破折号不会落到行首）；"数字 + 名词"全部是复数对象；没有 `{wbr}`（R61） |
| Q12 | ✓（副本） | 1280 / 390 / 375 / 320 px 没有页面级横向溢出、没有字体回落成方框；SE 卡片高度达标；价格表在 320–1440 px 的 19 个宽度下都完整显示（54afac8）；样张红色译文条顶端 390 × 844 下在 775 px（R69 要求 844 内可见） |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）没写扩展名称；`aExtLive` 写了名称并注明只从该页面链接安装；首页没出现 WordByWord.io |

## 3. 回译对照（ru → English，对照 en.json）

| 键 | ru | 回译（back-translation） | en 原文 |
|---|---|---|---|
| meta.title | WordByWord Переводчик: двуязычный перевод сайтов на iPhone | WordByWord Translator: bilingual website translation on iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Для изучающих языки: в WordByWord проведите вправо по абзацу — перевод появится под ним. Двойное касание слова покажет значение. Бесплатно для iPhone и iPad. | For language learners: in WordByWord, swipe right on a paragraph — the translation appears below it. A double tap on a word shows its meaning. Free for iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Читайте любой сайт на двух языках. [[Оригинал на месте.]] | Read any website in two languages. [[The original stays in place.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | Проведите вправо по абзацу · дважды коснитесь слова — его значение в контексте | Swipe right on a paragraph · double-tap a word — its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | Проведите вправо по абзацу [[любого сайта]] — перевод появится прямо под ним. | Swipe right on a paragraph of [[any website]] — the translation appears right below it. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord — это помощник в чтении на iPhone и iPad для изучающих языки. | WordByWord is a reading assistant on iPhone and iPad for language learners. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Откройте сайт во встроенном браузере приложения и проведите вправо по абзацу — перевод появится под ним. Дважды коснитесь слова, и ИИ объяснит, что оно значит именно здесь. | Open a site in the app’s built-in browser and swipe right on a paragraph — the translation appears below it. Double-tap a word and the AI explains what it means right here. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Перевод свайпом и значения слов двойным касанием — на сайтах, которые вы читаете | Swipe translation and word meanings with a double tap — on the sites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Перевод сайтов по абзацам — прямо под оригиналом | Website translation paragraph by paragraph — right below the original | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Дважды коснитесь слова — ИИ покажет его значение в контексте | Double-tap a word — the AI shows its meaning in context | Double-tap a word for its AI meaning in context |
| features[x].title | Перевод постов в X (Twitter) прямо во встроенном браузере | Translating X (Twitter) posts right in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Извлечение Фрагментов и Action Flow — для английских предложений | Chunk Extraction and Action Flow — for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Озвучка голосом ИИ или быстрые голоса iOS на устройстве | Read-aloud in an AI voice, or fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Разбор длинных предложений с помощью ИИ | Breaking down long sentences with AI | AI sentence structure analysis for long sentences |
| features[engines].title | Облачный или локальный перевод | Cloud or local translation | Cloud or on-device translation |
| features[display].title | Вид и стиль перевода | Look and style of the translation | Translation layout and style |
| features[history].title | История переводов и поиска слов | History of translations and word lookups | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac и Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | Что такое WordByWord? | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | Может ли WordByWord перевести всю страницу сайта сразу? | Can WordByWord translate a whole page of a website at once? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Работает ли WordByWord в Safari или в других приложениях? | Does WordByWord work in Safari or in other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | WordByWord — это пословный переводчик? | Is WordByWord a word-for-word translator? | Is WordByWord a word-by-word translator? |
| faq[x].q | Можно ли читать и переводить X (Twitter) в WordByWord? | Can you read and translate X (Twitter) in WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | Какие языки поддерживает WordByWord? | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | Бесплатен ли WordByWord? Какие есть дневные лимиты? | Is WordByWord free? What daily limits are there? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | Какой движок перевода использует WordByWord? | Which translation engine does WordByWord use? | Which translation engine does it use? |
| faq[account].q | Нужен ли аккаунт, чтобы пользоваться WordByWord? | Do you need an account to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Как восстановить WordByWord Plus на новом iPhone или iPad? | How do I restore WordByWord Plus on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | Есть ли версия WordByWord для Android? | Is there a version of WordByWord for Android? | Is there an Android version? |
| faq[english-learner].q | Я учу английский. Стоит ли попробовать ещё и SurfEnglish? | I’m learning English. Is it worth trying SurfEnglish as well? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | Работает ли WordByWord на айфоне, iPad, Mac или в браузере на компьютере? | Does WordByWord work on an iPhone (colloquial spelling), iPad, Mac or in a browser on a computer? | Does WordByWord work on iPad, Mac or a desktop browser? |
| faq[english-learner].a（en-site 补句） | Интерфейса на русском у SurfEnglish нет (он на английском и ещё 11 языках), но переводить на русский приложение умеет. | SurfEnglish has no Russian interface (it is in English and 11 more languages), but the app can translate into Russian. | 文档 08 §7.8 模板：SurfEnglish’s interface isn’t available in {language} — it’s in English and {n} other languages — but it can translate into {language}. |
| pricing.summary | В этих пределах всё бесплатно; Plus повышает лимиты за 3,99 $ в месяц (цена в США). | Within these limits everything is free; Plus raises the limits for $3.99 a month (US price). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | От разработчика WordByWord | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: новости на английском по уровням | SurfEnglish: news in English by level | SurfEnglish: daily English news at your level |
| sibling.card.body | Учите английский? Читайте любые страницы в WordByWord и попробуйте также SurfEnglish: ежедневные новости по уровням и игры для повторения, с теми же жестами. | Learning English? Read any pages in WordByWord and try SurfEnglish as well: daily news by level and review games, with the same gestures. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Новости дня, уровни A1–C1 ／ Игры для повторения прочитанного ／ Отправляйте статьи из Safari | Today’s news, levels A1–C1 / Games for reviewing what you have read / Send articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.uiNote（替换 note） | Бесплатный старт · Интерфейс на английском и ещё 11 языках, без русского · Переводит на русский | Free to start · Interface in English and 11 more languages, no Russian · Translates into Russian | （en 的 note：Free to start · iPhone and iPad · App in 12 languages · Translations into 21；文档 04 §5.7 ru uiNote 草案："Бесплатный старт · Интерфейс приложения не переведён на русский (английский и ещё 11 языков) · Переводить на русский можно"） |
| sibling.card.linkText | Новости на английском с переводом — SurfEnglish (англоязычный сайт) | News in English with translation — SurfEnglish (English-language site) | Read English news at your level with SurfEnglish（文档 04 §5.7 ru 种子："Новости на английском с переводом — SurfEnglish (сайт на английском)"） |
| sibling.card.appStoreLinkText | Загрузите SurfEnglish в App Store | Download SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish, экран Games (английский интерфейс): Sentence Builder и Word Raid — игры по сохранённым предложениям и словам | SurfEnglish, Games screen (English interface): Sentence Builder and Word Raid — games based on saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | Скриншот SurfEnglish (английский интерфейс) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading / linkText | От того же разработчика ／ SurfEnglish: Bilingual News (EN) | From the same developer / （商店名，不翻译） | More from the maker / SurfEnglish: Bilingual News |
| cta.title | Читайте сайты на двух языках — прямо на iPhone | Read websites in two languages — right on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | Перевод свайпом · Значение слова двойным касанием · Озвучка · 21 язык | Swipe translation · Word meaning with a double tap · Read-aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（表中 ru 为可读形式：实际 JSON 里破折号和"·"前是 U+00A0，复数对象已代入当前值。）

FAQ 答案也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音不限次、Plus 为月订且美区价格 + 以 App Store 为准；`restore` 按 T-E 引用 App 按钮 «Обновить Сейчас» → «Восстановить Покупку»；`devices` 的 S0 答案只写"同一开发者正在准备 Chrome 扩展"，不写扩展名称（R45），`aExtLive` 才写 "WordByWord Translate для Chrome" 和"只从该页链接安装"；`engines` 把 en 的 "AI Read" 写成 App 的 «Чтение ИИ»。

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都有依据：

1. `meta.title` 没有 "App"：ru 的产品词是品牌位里的「Переводчик」（文档 03 §1.5、§1.6、§3.9；`primaryTokens.home.ru`）。
2. `meta.description` 用 "в WordByWord" 代替 "built-in browser"（文档 03 §3.2 允许，与 §3.9 草案一致）。
3. `hero.platformNote` 不写美区价格，只写 "Plus — ежемесячная подписка"（D2，与 ja / fr 相同）。
4. SE 卡片为满足 R10 / R84 的高度做了压缩：H2 没有 "daily / your"（body 保留了「ежедневные」）；body 写「с теми же жестами」（同样的手势），没有逐一点名右滑和双击（FAQ `english-learner` 点名了）；`points[0]` 写成「Новости дня」（当日新闻）而不是 "Real English news"（"English" 已在 H2 里；"Настоящие новости" 在 320 px 下多 1 行，卡片 563 > 560）；`points[2]` 写成「Отправляйте статьи из Safari」（从 Safari 发送文章），省略了 "English" 和 "to the app"。
5. `features[x].title` 用 K9 主词的"перевод постов в X (Twitter)"（翻译 X 帖子），en 写的是"双语读"；正文仍写"译文出现在帖子下方"。
6. 价格表行名按规则 ① 用 App 叫法（en 用描述性名称）：Action Flow 行写 App 的「Ход действий」；`perDay` 写「N в день」（对应 en 的 "N / day"；App 自己的额度表写「N раз в день」，见 §4 第 5 条）。
7. FAQ 中指向 about 页、扩展页、SE 官网的链接文字都加了 "(на английском)"（这三处目标页只有英文）。
8. `features[swipe].bullets[2]` 首次出现 X 时写 "X (бывший Twitter)"（文档 08 §7.2.3）。

## 4. 没把握的措辞（14 处，附回译与替代写法）

| # | 键 | ru | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | features[lookup].kicker | Дважды коснитесь, чтобы найти | Double-tap to find | Двойное касание — значение (27)／Значение слова (14) | App 叫法（T-A，去掉"(AI Значение)"后缀，与 en / ja 做法一致），但 29 > 24（L-8 W），而且"найти"（找到）不是 "look up"（查词义）的意思，俄语读者会觉得别扭。替代写法不报 W，但与 App 不一致。需负责人决定（§6 第 3 条） |
| 2 | meta.title | …: двуязычный перевод сайтов на iPhone | …: bilingual translation of websites on iPhone | …: перевод сайтов с оригиналом на iPhone（n57） | 文档 03 草案原样；"двуязычный перевод"（双语翻译）的搭配不算常见，但能直接表达"双语对照"，也是 §7.3 的 K1 写法 |
| 3 | meta.ogHeadline | [[Оригинал на месте.]] | [[The original stays in place.]] | [[Оригинал остаётся.]]／[[Оригинал не исчезает.]] | 电报体，作为口号可接受；没用 "сохраните оригинал"（更贴近 en 的 "Keep the original."），因为附录 A 把它留给 G1 how-to |
| 4 | features[engines].text | Облако (Azure, Google) или iOS; облачный лимит исчерпан — включите локальный. | Cloud (Azure, Google) or iOS; cloud limit used up — turn on the local one. | В облаке (Azure и Google) или на устройстве (iOS); кончилось облако — локальный.（n78） | 规格清单 80 字符限制下很紧凑，"включите локальный"要靠标题"облачный или локальный"理解成"本地引擎" |
| 5 | pricing.table.perDay | {n} в день → 「500 в день」 | 500 a day | {n} раз в день →「500 раз в день」（App 额度表 `limit_per_day%lld` 的写法） | 两种都是地道俄语；「N в день」对应 en 的 "N / day"。按 54afac8 的 CSS 实测，「N раз в день」在 320 px 下表格宽 307 > 286（框内出现横向滚动），375 px 下表格高 +162 px，所以保留短的写法 |
| 6 | sibling.card.body | …и попробуйте также SurfEnglish: …игры для повторения, с теми же жестами. | …and try SurfEnglish as well: …review games, with the same gestures. | …а ещё попробуйте SurfEnglish: … — с теми же свайпом и двойным касанием. | "жесты"比较泛；为 375 px 下卡片 ≤ 480 px 选了短写法。互检指出原稿「попробуйте ещё SurfEnglish」的"ещё"容易读成"再"，已改为「также」 |
| 7 | featuresIntro.title | Перевод свайпом и значения слов двойным касанием — на сайтах, которые вы читаете | Swipe translation and word meanings with a double tap — on the sites you read | Свайп — перевод, двойное касание — значение: на сайтах, которые вы читаете | 名词化较重，但关键词（перевод、значение слова）都在 |
| 8 | features[history].title | История переводов и поиска слов | History of translations and word lookups | История переводов и найденных значений слов | K6 主词照文档 03 表 B；"поиск слов"偶尔会被理解成"搜索记录"（PRO-14 / I18-12 提过同类问题），加了"слов"后歧义不大 |
| 9 | hero.eyebrow | Двуязычное чтение сайтов для изучающих языки | Bilingual reading of websites for language learners | Сайты на двух языках — для изучающих языки | en 是 "Bilingual web reader"（阅读器）；俄语"ридер"偏口语，所以用"чтение"（阅读） |
| 10 | demo.lookup.meaning | (end up + -ing) в итоге сделать что-то; здесь: незаметно зачитаться до полудня | (end up + -ing) to end up doing something; here: to get absorbed in reading until noon without noticing | …; здесь: в итоге читать до полудня | "зачитаться"很地道，但比译文「в итоге читают」多了一层"沉浸"的意思 |
| 11 | sibling.card.points[0] | Новости дня, уровни A1–C1 | Today’s news, levels A1–C1 | Настоящие новости, уровни A1–C1（320 px 下卡片 563 > 560） | en 是 "Real English news"。初稿「Реальные новости」被互检指出会读成"真新闻 vs 假新闻"；「Новости дня」同时带出了 "daily" |
| 12 | meta.appStoreSubtitle | Переводите по словам | Translate word by word | — | RU 店面的真实副标题（`as_ru.html`），只在 en 的 about 事实表里用，ru 页面不渲染；但它与 FAQ `word-by-word`（"不是逐词直译"）的口径相反，见 §6 第 7 条 |
| 13 | common.* / pricing.note / FAQ | Аккаунт Apple | Apple Account | аккаунт Apple | 互检建议句中小写；我按 Apple 俄语材料把 "Аккаунт Apple" 当专名大写（等同于以前的 "Apple ID"），请审校人按 Apple 现行俄语文案确认 |
| 14 | features[speech].text | …с загруженными голосами Premium или Enhanced | …with downloaded Premium or Enhanced voices | …с загруженными голосами «Премиум» или «Улучшенный» | 照 App 的 ru 文案（`local_speech_engine_*`）保留拉丁字母；如果 iOS 俄语设置里的名称不同，读者可能找不到，请审校人在真机上确认 |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法照抄**（T-A…T-E 与 `featureDisplayName()`；用于 kicker、价格表行名和"在 App 里点哪个按钮"）：Проведите для перевода、Дважды коснитесь, чтобы найти (AI Значение)、Больше определений、AI произношение (слово / предложение)、Голос iOS (Локальное чтение)、Извлечение Фрагментов、Ход действий、Анализ структуры синтаксиса ИИ、Чтение ИИ / Локальное чтение、Автоматический / Абзац / Предложение за Предложением、Получить объяснение синтаксиса ИИ、Обновить Сейчас、Восстановить Покупку。句子里用自然说法（规则 ②）：перевод свайпом、двойное касание、озвучка、разбор предложения、облачный / локальный движок。
- **Action Flow** 保留 App Store 名（D3、§7.2.3），在 `features[chunks].text` 里括注 App 叫法「Ход действий」；价格表行名用 App 叫法。
- **ИИ / AI**：正文一律写俄语的「ИИ」；引用 App 名时照 App（App 里两种都有）。
- **Plus**：网站写 Plus（§7.2.3），不写 App `user_type_plus` 的「Плюс」（glossary 禁用）。
- **App 侧 ru 文案的问题**（不在官网范围内，建议报给 App 侧）：
  1. 英语式的词首大写（Title Case）：«Извлечение Фрагментов»、«Предложение за Предложением»、«История Перевода Свайпом»、«Обновить Сейчас»、«Восстановить Покупку»、«Исходный Язык»。俄语只大写第一个词。网站引用时照原文。
  2. "AI" 与 "ИИ" 混用：«Чтение ИИ»、«Анализ структуры синтаксиса ИИ» ↔ «Дважды коснитесь, чтобы найти (AI Значение)»、«AI произношение (слово)»。
  3. «Дважды коснитесь, чтобы найти (AI Значение)»：「найти」是"找到"，不是"查词义"；「AI Значение」语序不自然。建议如「Значение слова двойным касанием (ИИ)」。
  4. «Проведите для перевода»：祈使句当功能名（与 ko 的 X4 同类）；`右滑翻译` 键没有 ru 值。
  5. `update_now_button`（更新 App）与 `upgrade_now_button`（升级到 Plus）的 ru 都是 «Обновить Сейчас»，用户分不清；「Обновить до Plus」也容易读成"更新"。建议升级类按钮用「Перейти на Plus」/「Оформить Plus」。FAQ `restore` 目前照引 «Обновить Сейчас»（它就是设置页里那个按钮的文字）。
  6. 语法错误：`audio_playback_description_streaming` 写「облачную AI-синтез речи」（阴性形容词配阳性名词），应为「облачный AI-синтез речи」。
  7. 手势用词不统一：«Проведите…»、«…Свайпом»、«…При Смахивании Вправо»（`Swipe Right Translation Mode Settings`）。
  8. 「Анализ структуры синтаксиса ИИ」「Получить объяснение синтаксиса ИИ」的属格链读起来像"AI 的句法"。
- **称谓与性**：вы（小写）；WordByWord 按阳性处理（«WordByWord доступен»「Бесплатен ли WordByWord」），"приложение"为中性。
- **排版**：«» 引号；破折号 — 前用 U+00A0（避免落到行首）；"·"前用 U+00A0；复数对象里数字与名词之间 U+00A0；"10 км"、"3 ч"用 U+00A0；三处用 U+00A0 防断行（价格表「(AI Значение)」、Chunks H3 的「Action Flow」、Plus 价格「в месяц」，避免介词"в"留在行尾）；全文使用 ё。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，OG 文件没有复制进真实仓库。ru.json 进真实仓库后，`node build.mjs` 会报 `D-23 home-ru: no OG image`，直到负责人跑 `node scripts/og.mjs --only home-ru`（新 HEAD 副本实测可通过：64 px × 3 行、副标题 28 px × 2 行、151.6 KB）。
2. **ru lint 词表**（`docs/redesign-2026/ops/m3/ru-lint.json`，附录 A）：`claims-lint.json` 24 条规则没有 ru 写法（L-14 W），`keyword-map.json` 没有 ru 的 G1 模式（L-9 W）。我在工作中发现现有的 `seOwnedLead.ru`（`^\W*(учить|изучение) английск`）对俄文 H2 不锚定开头（JS 的 `\W` 也匹配西里尔字母）；HEAD bb689eb 已让 `compileAll` 把 `\w` / `\W` / `\b` 改成 Unicode 语义，这个问题随之解决（新副本里实测已锚定）。附录 A 的模式用 `\p{L}` 和显式字符类写成，两种编译方式下结果相同。交付时负责人已在工作区合入（27/29 条规则已有 ru）；我用工作区的数据文件在副本里构建过一次，ru 0 error、0 命中。
3. **`features[lookup].kicker`**：保留 App 叫法「Дважды коснитесь, чтобы найти」会有 1 条 L-8 W（29 > 24），且 App 叫法本身不好（§5 第 3 条）。改成「Значение слова」可消除 W，但与 App 不一致。
4. **价格表（已由 54afac8 解决）**：在旧 CSS（`.table-wrap { overflow: hidden }` + 单元格 `nowrap`）下，ru 初稿的表格在 390 / 375 / 320 px 都被裁掉 Plus 列；en 在 320 px 也被裁 19 px，fr 在 390 / 375 / 320 px 都被裁。我当时为了适配旧 CSS 把 "English only" 标签缩写成「Только англ.」、Plus 价格缩写成「3,99 $/мес.」。负责人提交 54afac8 后（< 768 px 允许换行、框内可滚动、< 400 px 加密排版），按负责人要求把这两处改回全写（「Только английский」「3,99 $ в месяц (США)」）。实测 320–1440 px 的 19 个宽度下表格都完整显示、无需滚动。「N в день」保留（理由见 §4 第 5 条）。
5. **页面长度**：390 px 下 ru 首页 13,833 px（同一 HEAD 下 en 12,847；fr、es 的记录分别是 13,548、13,047；R20 / R69 的软目标是 13,000）。页脚的语言列表随已发布 locale 增加而变长，这部分对所有语言相同。俄语正文比英语长约 25%，价格表的 App 原名在手机上多为 3 行；没有为此删内容。
6. **K1 主词**：文档 08 §7.3 写的 K1 是「двуязычный перевод сайтов на iPhone」，文档 03 §2.3 表 A 是「переводчик сайтов для iPhone」（次词「перевод сайтов на iPhone」）。按 §7.3"以文档 03 为准"，`seo.keywords.K1.primary` 用了表 A 的写法，§7.3 的写法放进次词；title 用 §3.9 草案，两种写法的词元都覆盖。`seo.titleMust` 定为 `["iPhone","сайтов","Переводчик"]`（文档 08 §7.3 的 "iPhone、сайтов" + §1.6 的产品词）。请确认。
7. **App Store RU 店面文案**（不在网站范围内）：副标题「Переводите по словам」（"逐词翻译"）与网站 FAQ `word-by-word` 的口径相反；店面描述里还有"более 20 языковых пар""группируются по дате""коснитесь слова"（单击）等文档 01 列为错误的旧说法。建议下次提交 App 时一并更新（H16）。
8. **母语审校**：按 R36，ru 上线后补母语审校；请审校人重点看 §4 的 14 处、§8 未采纳的 8 条和 §5 的 App 叫法取舍。

## 7. 版面实测（副本 + `scripts/serve.mjs --port 4604` + 本机 headless Chrome，外部请求全部拦截，浅色模式）

| 视口 | SE 卡片高度（上限） | 价格表宽 / 容器宽 | 样张红色译文条顶端 | 整页高度 | 页面级横向溢出 |
|---|---|---|---|---|---|
| 1280 × 900 | 370 px（420） | 734 / 734 | 378 px | 10,641 px | 无 |
| 390 × 844 | 448 px（480） | 356 / 356 | 775 px（< 844，R69） | 13,833 px（目标 ≤ 13,000；同一 HEAD 下 en 12,847） | 无 |
| 375 × 812 | 469 px（480） | 341 / 341 | 773 px | 14,058 px | 无 |
| 320 × 700 | 542 px（560，R84） | 286 / 286 | 855 px | 14,957 px | 无 |

为满足上面的数字所做的调整（初稿 → 定稿）：
- SE 卡片：初稿 440 / 469 / 532 / 631 px（1280 / 390 / 375 / 320），1280、375、320 三处超限。H2 从「SurfEnglish: свежие новости на английском для вашего уровня」缩成「SurfEnglish: новости на английском по уровням」（1280 下从 2 行变 1 行），body、要点、uiNote 一起压短（§3.1 第 4 条）。
- 价格表：初稿 406 px 宽，在旧 CSS 下 390 / 375 / 320 px 的 Plus 列都被裁（"500 раз в", "3,99 $ в м…"）。值改为「N в день」；54afac8 之后标签和价格恢复全写，320–1440 px 的 19 个宽度下都完整显示（320 px 下行名按模板规则断字，价格表区块高 2,036 px）。
- 规格清单 `engines`：初稿「Azure и Google в облаке или iOS на устройстве; облачный лимит исчерпан — iOS.」意思不清，改为「…— включите локальный.」。
- 互检后的改动（§8）让 390 px 页面增加约 25 px（hero `how` 多 1 行）；SE 卡片与价格表数字不变。
- 目视检查了 1280 / 390 / 320 px 的 hero、样张查词卡、L1 / L2 功能块（含 ①②③ 页边注）、X 样张、语块示意、规格清单、画廊、语言段、价格表、SE 卡片、FAQ、最终 CTA 和页脚：没有溢出或异常断行；375 px 下"Как это работает →"与徽章在同一行。

## 8. 第二模型互检（Claude Sonnet，只读，2026-10-06）

互检人逐键对照 en.json 读了 ru.json（并参考了 glossary、claims-lint 和文档 08），共提 27 条意见，结论：读起来像俄语母语的产品网站（8/10），复数全部正确，没有错别字，没有整页 / 离线 / Safari 扩展 / X App / 替换性措辞。

**采纳（19 条）**：FAQ `engines`「при первом использовании iOS」有歧义（读成"第一次用 iOS"）→「в первый раз системе может потребоваться…」，并改为「работает на базе сервисов перевода」；FAQ `restore` 问句「вернуть」（也有"退款"义）→「восстановить」；`features[syntax].text`「в истории переводов свайпом и нажмите」的歧义 → 「Откройте в истории предложение, переведённое свайпом」（App 里"История Переводов"其实是查词历史，这样也避开了界面名混淆）；FAQ `safari`「— не расширение…и не добавляет」→「не является расширением…」；"ещё"读成"再" → FAQ 用「также」、SE 卡片用「попробуйте также」；FAQ `free`「Бесплатная версия включает в день」→「Каждый день бесплатно доступно」；FAQ `languages`「язык, на котором вы читаете…его можно сменить」→「язык страницы, которую вы читаете…язык можно сменить и вручную」；FAQ `whole-page`「оставить выбор」→「доверить выбор」；Chunks 正文「работают как единое целое」（直译腔）→「образуют единое целое」；`common.langFallbackNote` 第二句改写；画廊 `languages` 图注去掉连续三个"английский"；`featuresIntro.lede`「Почти всё делают два жеста」→「Основную работу делают два жеста」（贴近 en 的 "most of the work"）；`aExtLive`「с этой страницы」→「со страницы расширения」；`features[lookup].bullets[2]` 补「формами слова」、画廊图注写「полная словарная статья」；`features[swipe].bullets[0]`「Режимы показа」→「Режимы перевода」（与 App 设置名一致）；`features[swipe].bullets[2]` 去掉"любые"（改为「— в браузере приложения」）；`hero.how`「во встроенном браузере」→「во встроенном браузере приложения」、FAQ `what-is` →「в его встроенном браузере」（避免理解成 iOS 自带的 Safari）；SE 要点「Реальные новости」（会读成"真新闻 vs 假新闻"）与「Делитесь статьями из Safari」（会读成社交分享）——按版面实测分别改为「Новости дня」「Отправляйте статьи из Safari」（互检建议的「Настоящие…」「…в приложение」会让卡片在 320 / 375 px 下超限）。

**未采纳（8 条）**：
1. `features[engines].text` 去掉「облачный」：本地引擎也有每日额度，去掉后"额度用完"指代不明；80 字符内保留「облачный лимит исчерпан — включите локальный」。
2. FAQ `free`「объяснение синтаксиса от ИИ」→「…синтаксиса ИИ」：后者在正文里会读成"AI 的句法"，正是 §5 报给 App 侧的问题。
3. 「Аккаунт Apple」改小写：按 Apple 俄语材料作专名保留大写，列入 §4 第 13 条请审校人确认。
4. `features[speech].alt` 改成"翻译后的段落 + 播放器"：实际截图（`shot/en/tts-ex`）是播放器里的西语原句，现写法与画面一致（en 的 alt 描述的是整屏）。
5. `cta.recap` 写「21 язык перевода」：在 390 px 下多 1 行（+28 px），页面已超软目标，"21 язык"在要点回顾里足够清楚。
6. 价格表 `actionFlow` 行写「Ход действий (Action Flow)」：规则 ① 用 App 原名，Chunks 卡正文已把两者对应起来。
7. 「Premium / Enhanced」改俄文：App 的 ru 文案就是拉丁字母，列入 §4 第 14 条请在真机上确认。
8. title 改「двуязычное чтение сайтов」：title 按文档 03 §3.9 草案保留 K1"перевод сайтов"。

另外，互检人也指出 App Store RU 副标题「Переводите по словам」与 FAQ `word-by-word` 口径相反，且「по словам」还有"据说"的意思（§6 第 7 条）。

## 附录 A：建议的 ru lint 词表（只在副本里自测过，未改真实仓库）

完整内容见 `docs/redesign-2026/ops/m3/ru-lint.json`（`{"claimsLint": {...}, "keywordMap": {"seOwned": [...], "seOwnedLead": [...], "reservedG1": [...]}}`）。覆盖 `claims-lint.json` 中所有有按 locale 写法、且还没有 ru 的 25 条规则（`selection-translate`、`jargon` 已有 ru；`io-home`、`engine-claim` 只有 `*`）；`ext-language-count` 虽然只作用于扩展页（ru 没有），也按要求补了。

写法要点：西里尔词边界写成 `(?<![\p{L}])` / `(?![\p{L}])`，字母写成 `\p{L}`，不依赖 `\b` / `\w`（JS 在 `u` 模式下仍把它们当 ASCII；bb689eb 起 `compileAll` 会改写成 Unicode 语义，这两种情况下这些模式的结果都一样）；`se-hype` 的"новый"类模式排除了「новости」；`hype` 的"единственн"不会误伤「без единой остановки」。

自测（HEAD 54afac8 的新副本，把词表合进 `claims-lint.json` / `keyword-map.json` 后）：ru 文案 L-14 / L-9 0 命中；下列 59 条反例全部被对应规则命中（直接用 `RegExp` 与经仓库的 `compileAll` 两种方式都试过）；5 条"不得误拦"的通用学习说法（如「Для изучающих языки」「Изучайте языки по настоящим сайтам」「Я учу языки」）全部通过。

| 规则 | 反例（应命中） |
|---|---|
| whole-page | Переводите всю страницу одним касанием. ／ WordByWord переводит сайт целиком. ／ Перевод всей веб-страницы сразу. |
| swipe-left | Проведите влево по абзацу, чтобы перевести его. ／ Свайп влево открывает перевод. |
| safari-extension | Работает как расширение для Safari. ／ Переводите текст в любом приложении. ／ Без переключения между приложениями. |
| offline | Перевод работает офлайн. ／ Работает без интернета. |
| unlimited-ai-voice | Безлимитная ИИ-озвучка в Plus. ／ Неограниченное произношение ИИ. |
| dark-mode-theme | Поддерживает тёмный режим и собственные темы. ／ Меняйте цвет темы. |
| shortcuts-volume | Горячие клавиши для перевода. ／ Регулировка громкости озвучки. |
| vocab-sync | Сохраняйте слова в личный словарь и учите их по флеш-картам. ／ Синхронизация между устройствами через iCloud. |
| android | Скачайте версию для Android в Google Play. ／ Есть ли приложение на андроид? |
| desktop-version | Есть версия для компьютера. ／ Десктопное приложение для Windows. |
| x-app | Переводите посты прямо в приложении X. ／ Единственное приложение, которое переводит посты в X. |
| plus-early-access | Подписчики Plus получают ранний доступ к новым функциям. |
| privacy-claim | Мы не собираем никаких данных. ／ Сбор данных не ведётся. ／ Без отслеживания. |
| initial-version | Начальная версия поддерживает 20 языков. |
| language-pairs | Более 20 языковых пар. |
| style-count | 7 стилей перевода на выбор. ／ Восемь стилей отображения. |
| auto-detect-target | Приложение автоматически определяет целевой язык. |
| history-by-date | История сгруппирована по датам. |
| plus-only | Разбор синтаксиса доступен только в Plus. ／ Функция только для подписчиков. |
| speaking-practice | Тренируйте произношение и разговорные навыки. ／ Улучшите своё произношение. |
| replacement-tone | SurfEnglish может подойти лучше. ／ Используйте SurfEnglish вместо WordByWord. ／ Сестринское приложение WordByWord. |
| se-on-device-voice | ИИ-голос на устройстве работает без интернета. |
| se-hype | Новое приложение от разработчика WordByWord. ／ Учите английский быстрее. |
| hype | Лучший переводчик для iPhone. ／ Единственное приложение такого рода. ／ Более миллиона пользователей. ／ Команда WordByWord ／ Революционный способ читать. |
| ext-language-count | Переводит на 20+ языков. |
| seOwned | Учите английский по новостям ／ Английские новости каждый день ／ Новости на английском по уровням ／ Изучение английского по сайтам |
| seOwnedLead | Учите английский с SurfEnglish ／ «Изучайте английский» каждый день |
| reserved.G1 | Как перевести сайт на iPhone ／ Переводите сайты и сохраняйте оригинал ／ Перевод с сохранением оригинала |

注意：`seOwned` 新增的「новост… на английском」只作用于 title / H1 / description / OG / 功能区 H2，SE 卡片里的同一说法（R76 允许的锚文本和卡片 H2）不受影响；G1 模式会禁止首页 title / H1 / description / `cta.title` 出现"сохранить оригинал"，OG 不在检查区。

## 附录 B：验证记录

| 命令 | 结果 |
|---|---|
| `node build.mjs --out …/dist`（`git archive 54afac8` 导出的新副本 + ru 两个文件 + 副本内生成的 OG；`claims-lint.json` / `keyword-map.json` 用 HEAD 原文件） | 0 error；ru 4 条 W：L-8 kicker、L-4（6 个照抄值）、L-14 未覆盖 24 条规则、L-9 无 G1 模式 |
| `node build.mjs --pseudo --out …/dist-pseudo`（同上） | 0 error |
| 同一副本合入 `ru-lint.json` 后 `node build.mjs` / `--pseudo` | 均 0 error；ru 只剩 L-8 kicker 与 L-4 两条 W（L-14 / L-9 消失，ru 文案 0 命中） |
| 同一副本换成负责人工作区里正在合入的 `claims-lint.json` / `keyword-map.json` | 0 error；ru 只剩 L-8、L-4 |
| `node scripts/check.mjs --dist …/dist` | 0 error / 0 warning |
| `node scripts/check.mjs --keys ru` | 0 missing / 0 not in en |
| `node scripts/og.mjs --only home-ru` | ✓ 标题 64 px × 3 行、副标题 28 px × 2 行、151.6 KB（`meta.ogHeadline` / `ogSubline` 在最后两轮修改中没有变，OG 不需要重新生成） |
| `node --test scripts/tests/*.test.mjs` | 60/60（两种数据文件下都通过） |
| `ru-work/lint-test.mjs`（附录 A 的反例自测） | 59 条反例全部命中（`RegExp` 与仓库 `compileAll` 两种方式）；5 条"不得误拦"说法全部通过 |
| headless Chrome 1280 / 390 / 375 / 320 px（`serve.mjs --port 4604`） | 无页面级横向溢出；SE 卡片 370 / 448 / 469 / 542 px；390 px 页面高 13,833 px |
| 价格表 320–1440 px 共 19 个宽度 | 表格宽度都等于容器宽度：无裁切、无滚动 |
