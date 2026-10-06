# M3 · uk（Українська）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | uk（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校；文档 04 T11 把 uk 列为优先补审的语言） |
| 交付 | `src/locales/uk.json`（新建）；`src/data/glossary/uk.json`（新建，§7.2.5 格式）；`docs/redesign-2026/ops/m3/uk-lint.json`（建议的 uk lint 词表，未合入数据文件）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（uk 行、表 C）、§3.1、§3.2、§3.6、§3.8、§3.9（uk 草案）、§4.3；文档 04 §5.1、§5.5、§5.7（uk 的 uiNote、linkText 种子、T1–T11）；文档 05 §7.5；裁定 R36、R39–R43、R46、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照，`fr.json` / `de.json` 作 en-site 参照；`_legacy/uk.json`、`sibling-tm.json` 只作术语参考（带 warnings 的写法与事实一律未用）。按要求从 en.json 直接写乌克兰语，没有参考 ru |
| App 字符串核对 | `WordByWordPrototype/Localizable.xcstrings` 的 `localizations.uk.stringUnit.value`（python 逐键读取，与文档 08 表 T-A…T-E 的 uk 列逐条一致）；价格表行名另对照 App 的"免费 / Plus 对比"页 `FeatureQuotaManager.swift` `featureDisplayName()`；App Store 徽章文字取自 `assets/badges/uk-ua.svg`（渲染后为「Завантажити в App Store」） |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-uk/` 起草、测长度、做渲染检查；最终验证在按 HEAD `0267123` 重新 rsync 的 `scratchpad/wbw-m3-uk-final/` 里做。OG 图只在副本里生成，**没有**复制进真实仓库；lint 词表只在副本里合入自测，测完已还原 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys uk`：0 缺、0 多；与 ja / fr / de 一样不提供 `about.*`、`chromeExtension.*`、`legal.*`，提供 `notfound.*`）。HEAD `0267123` 新副本里：`node build.mjs` 与 `--pseudo` 均 **0 error**；`node scripts/check.mjs` 0 error / 0 warning；`node --test scripts/tests/*.test.mjs` 58/58 通过。
2. uk 自己的 warning 有四条：L-8 `features[lookup].kicker` 28 > 24（按 Wave 2 规则保留 App 叫法）；L-4 只有 6 个"预期相同"的值（样张英文原句、虚构账号等，文档 08 §1.5）；L-14"24 条规则没有 uk 词表"、L-9"没有 uk 的 G1 how-to 模式"——后两条来自数据文件缺 uk 词表。我起草了 `uk-lint.json`（附录 A），在副本里合入后全站 0 error，uk 的 L-14 / L-9 消失。
3. title、description 逐字采用文档 03 §3.9 uk 草案（n50、n160）；H1 保留草案语序，只把"просто під ним"改成"одразу під ним"（n74），荧光笔标"сайті"。称谓按文档 08 §7.3 用 ви。
4. 复数：uk 的 CLDR 类别是 one / few / many / other，所有"数字占位符 + 名词"都写了四类复数对象，并按格变化分别处理（工具格"21 мовою / 20 мовами"、属格"з 21 мови"、主格"21 мова"、宾格"50 перекладів"）。用 1、2、5、21、22、1.5 逐一代入核对过，全部合语法（§2 Q2）。
5. SurfEnglish：uk 的 `seMode` = en-site。卡片用 `uiNote` 替换 note（"界面是英语和另外 11 种语言、没有乌克兰语；可译成乌克兰语"），linkText 带"(сайт англійською)"，FAQ `english-learner` 在链接前加了 §7.8 的界面说明句。为满足卡片高度（R10 / R84），卡片文案比 en 短（§3.1 第 6 条）。
6. 英文界面：所有截图 alt、4 条画廊图注、`common.screenshotLabel` / `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都写"інтерфейс англійською"；指向英文页的富文本链接（`@about`、`@chrome`、`@se-site`）链接文字带"(англійською)"。
7. OG（只在副本）：`node scripts/og.mjs --only home-uk` 通过，标题 **64 px × 3 行**、副标题 28 px × 2 行、146.5 KB，与 home-en 同版式。初稿标题"Оригінал лишається на місці."只能缩到 44 px，已改短为"Оригінал — на місці."。
8. 渲染检查（headless Chrome + `scripts/serve.mjs`，端口 4606）：320 / 375 / 390 / 414 / 768 / 900 / 1280 px 无横向溢出；SE 卡片 547 / 469 / 448 / 429 / 344 / 411 / 393 px，全部在上限内；价格表在 ≥ 375 px 完整显示；390 px（FAQ 收起）页面高 13,663 px（en 12,885、de 13,704、fr 13,612）。
9. 需要负责人决定的事见 §6，主要是：OG 图入库、是否合入 uk lint 词表（附带发现现有 uk / ru 正则里 `\w`、`^\W*` 对西里尔字母失效）、价格表为放进 375 px 做的四处缩写、320 px 下的两个模板问题、App 侧的 uk 字符串问题。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | «WordByWord: двомовний перекладач сайтів для iPhone» | 品牌位 WordByWord（文档 03 §1.5：uk 不用本地化店名）；K1 主词「двомовний перекладач сайтів для iPhone」**逐字完整**（文档 03 §2.3 表 A）；`titleMust` = iPhone / сайтів / перекладач 全部命中；`primaryTokens`（iPhone、перекладач）命中 | n50（上限 60） |
| `meta.description` | «Для вивчення мов: у WordByWord проведіть по абзацу праворуч — переклад з’явиться під ним. Подвійний дотик покаже значення слова. Безкоштовно для iPhone та iPad.»（草案原样） | 受众词「вивчення мов」（表 C，R39，文档 03 §1.4 必须放行的通用学习词）；K1 动作 + 结果在前一半；"у WordByWord"满足文档 03 §3.2；K2「значення слова」；平台 + 免费收尾（SEO-11）；"на айфоні"按 §3.2 放在 FAQ 问句，不进 description | n160（区间 120–160） |
| `hero.title`（H1） | «Проведіть по абзацу на [[сайті]] праворуч — переклад з’явиться одразу під ним.» | K1 核心名词「сайт」（荧光笔，1 个词，R65）；"段落"一级的动作 + 结果（R46、PRO-19），写了方向"праворуч"；不含品牌（R27）；没有 how-to 句式 | n74（上限 75） |
| `hero.eyebrow` | «WordByWord · Двомовне читання сайтів для вивчення мов» | 品牌 + 品类 + 受众 | 53 wu（上限 60） |
| `hero.lede` = `ledeShort` | «WordByWord — це помічник у читанні на iPhone та iPad для тих, хто вивчає мови.» | R39 定义句（"помічник"只出现在定义句、FAQ `what-is` 和页脚 tagline，D13） | n78（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | «Читайте сайти двома мовами. [[Оригінал — на місці.]]» | K1 次词「читати сайти двома мовами」+ 原文保留；荧光笔 1 处；没用"зберегти оригінал"（建议留给 G1，见附录 A） | 64 px × 3 行 |
| 功能区 H2 | «Переклад свайпом і значення слова подвійним дотиком — на сайтах, які ви читаєте» | K1「переклад」+ K2「значення слова」；"на сайтах, які ви читаєте"（PRO-16，不写"任何网站"） | n80 |
| 功能 H3 | K1「Проведіть для перекладу: оригінал зверху, переклад одразу під ним」；K2「Двічі торкніться слова — ШІ пояснить його значення в контексті」；K9「Читайте дописи в X (Twitter) двома мовами у вбудованому браузері」；K5「Виділення Фрагментів і Action Flow для англійських речень」（R83 带"англійських"）；K3「Озвучення тексту голосом ШІ або швидкі голоси iOS на пристрої」；K4「Розбір структури довгих речень за допомогою ШІ」；K7「Хмарний або локальний переклад」；K6「Історія перекладів і пошуку слів」 | K3、K6、K7 与表 A / B 主词逐字一致；K2「значення … в контексті」、K4「розбір … за допомогою ШІ」、K9「дописи в X (Twitter)」为主词的语序变体 | 全部 ≤ 70 wu（最长 65） |
| 语言段 H2 | «Переклад 21 мовою — і не лише з англійської»（复数对象） | K8 主词「переклад 21 мовою」逐字 | 43 wu |
| 价格段 H2 | «Безкоштовно щодня — Plus, коли читаєте більше» | K10「безкоштовн-」+ Plus | — |
| 最终 CTA H2 | «Почніть читати сайти двома мовами на iPhone» | 动作句，不是 G1 标题，不暗示整页（R46） | 43 wu |
| FAQ `devices` 问句 | «Чи працює WordByWord на айфоні, iPad, Mac або в браузері на комп’ютері?» | SEO-11 的本地写法「на айфоні」（文档 03 §4.3 指定位置） | n71 |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有 `seOwned.uk` 与附录 A 新增的"новини англійською""чанк""виділення фрагментів"都 0 命中）；title / H1 / description / `cta.title` 里没有 how-to 句式（附录 A 的 G1 模式 0 命中）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys uk` 0 缺 0 多）；HEAD 新副本 build / `--pseudo` 0 error，`check.mjs` 0 error，测试 58/58 |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条；uiNote 与 FAQ 里的"11"是文档 08 §7.8 规定由译者写死的 {se.uiLanguages} − 1，后接复数属格/工具格已核对）。复数对象（one / few / many / other）共 13 处：`languages.title / uiCount / targetCount`、`gallery.items[languageList].caption`（属格）、`faq.items[languages].a`（2 处）、`faq.items[free].a`（5 处）、`cta.recap`（主格）、`sibling.card.note`；当前值渲染为"21 мовою""20 мовами""одну з 21 мови""21 мова""50 перекладів""20 пошуків значень""30 виділень фрагментів""20 аналізів Action Flow""5 пояснень синтаксису"；1 / 2 / 5 / 21 / 22 / 1.5 逐一代入也都合语法。`pricing.table.perDay` 写成"{n} / день"（与 en 的"{n} / day"同构，数字后没有名词，不需要复数对象，见 §6 第 3 条）；"{quota.localSwipe.free} — із локальним"同 en 省略名词 |
| Q3 | ✓ | title 以品牌位开头，`titleMust` = ["iPhone","сайтів","перекладач"] 齐全（文档 08 §7.3 只写了"iPhone、сайтів"，按文档 03 §3.8 / §1.6 补上产品词，与 fr / de 的做法一致）；K1 是产品 / 品类意图；没有禁用主词和 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[сайті]]`（1 个词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以"WordByWord — це …"开头（乌克兰语用破折号 + це 表示"是"），写明"для тих, хто вивчає мови" |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展只在 FAQ `safari`；Android 只在 FAQ `android`；桌面版只在 FAQ `devices`；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT、"команда WordByWord / творці"；CJK 原文不能双击查词、Chunks / Action Flow 仅英语都写在同一屏；没有 jargon "вирівнювання / покрокове"（现有 claims-lint uk 规则）。附录 A 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required` 22 项，L-13 0 违规）；句子按 §7.3 写"проведіть праворуч""двічі торкніться"；按钮名照 App 原文引用：«Оновити Зараз»、«Відновити Покупку»、«Отримати пояснення синтаксису ШІ»、«AI Читання»、«Локальне читання»、«Авто» / «Абзац» / «Речення за Реченням»、«Більше визначень»、«Потік дій»（glossary `contains`，L-13 通过）。App 里的俄语词"Граница""Сплошне""движок"没有照抄（规则 ③，glossary `banned`） |
| Q7 | ✓ | 5 处功能截图 alt、4 条画廊图注 + alt、`common.screenshotLabel`（"Екран iPhone (інтерфейс англійською)"）/ `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都注明"інтерфейс англійською"；内容逐张对照 `assets/img/shot/en/*`（西语 Wikipedia 页 + 英文译文、"convirtiéndose"、"matrimonio"、Auto / Quote Style / Local Read 按截图里的英文原样引用；语言列表 alt 提到截图里可见的"українська"）；`features[x].alt` 描述社交帖样张并注明"не знімок екрана"；样张 `lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | en-site：uiNote 不含 `{se.uiLanguages}`、不写"12 мов"，写"англійською та ще 11 мовами, без української"（L-11 通过）；linkText = SE 核心词短语 + 品牌 +"(сайт англійською)"（n61，en-site 上限 80）；FAQ 加了界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句"Вивчаєте англійську?"；没有"може підійти краще / замість / новий / швидше / оновлення"；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音 |
| Q9 | ✓（1 条 W） | 代入占位符后实测（附录 B），全部在 §7.6 / L-8 限内，唯一例外是 `features[lookup].kicker` 28 > 24（App 叫法）。`features[lookup].alt` 正好 125 |
| Q10 | ✓ | uk 是西里尔文字：引号 «»，破折号 —（前面用不换行空格，避免破折号落到行首），撇号统一用 ’（U+2019，glossary 禁止混入 ' 和 ʼ）；没有 `{wbr}`（R61） |
| Q12 | ✓（副本） | 320–1280 px 无横向溢出、无字体回落；375 px 下 H1 5 行，长词不撑破容器；页眉按钮 < 560 显示"Отримати"（Ukrainian App Store 的"获取"按钮就是这个词），≥ 560 显示"Завантажити"。320 px 下有两个模板层面的问题（价格表 Plus 列被裁、字标被地球图标压住），见 §6 第 3、4 条 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）没写扩展名称；`aExtLive` 写了名称并注明只从该页面的链接安装；首页没出现 WordByWord.io |

## 3. 回译对照（uk → English，对照 en.json）

| 键 | uk | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord: двомовний перекладач сайтів для iPhone | WordByWord: bilingual website translator for iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | Для вивчення мов: у WordByWord проведіть по абзацу праворуч — переклад з’явиться під ним. Подвійний дотик покаже значення слова. Безкоштовно для iPhone та iPad. | For learning languages: in WordByWord, swipe along a paragraph to the right — the translation will appear below it. A double tap shows the word's meaning. Free for iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | Читайте сайти двома мовами. [[Оригінал — на місці.]] | Read websites in two languages. [[The original stays in place.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | Проведіть праворуч по абзацу · двічі торкніться слова — його значення в контексті | Swipe right on a paragraph · double-tap a word — its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | Проведіть по абзацу на [[сайті]] праворуч — переклад з’явиться одразу під ним. | Swipe right on a paragraph on a [[website]] — the translation will appear right below it. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord — це помічник у читанні на iPhone та iPad для тих, хто вивчає мови. | WordByWord is a reading assistant on iPhone and iPad for people who are learning languages. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | Відкрийте сайт у вбудованому браузері й проведіть праворуч по абзацу: переклад з’явиться під ним. Двічі торкніться слова — і ШІ пояснить, що воно означає саме тут. | Open a site in the built-in browser and swipe right on a paragraph: the translation will appear below it. Double-tap a word, and AI will explain what it means right here. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | Переклад свайпом і значення слова подвійним дотиком — на сайтах, які ви читаєте | Translation with a swipe and a word's meaning with a double tap — on the websites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | Проведіть для перекладу: оригінал зверху, переклад одразу під ним | Swipe to Translate: original on top, translation right below it | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | Двічі торкніться слова — ШІ пояснить його значення в контексті | Double-tap a word — AI explains its meaning in context | Double-tap a word for its AI meaning in context |
| features[x].title | Читайте дописи в X (Twitter) двома мовами у вбудованому браузері | Read X (Twitter) posts in two languages in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | Виділення Фрагментів і Action Flow для англійських речень | Chunk Extraction and Action Flow for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | Озвучення тексту голосом ШІ або швидкі голоси iOS на пристрої | Text read aloud in an AI voice, or fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | Розбір структури довгих речень за допомогою ШІ | Breaking down the structure of long sentences with AI | AI sentence structure analysis for long sentences |
| features[engines].title | Хмарний або локальний переклад | Cloud or local translation | Cloud or on-device translation |
| features[display].title | Розміщення та стиль перекладу | Placement and style of the translation | Translation layout and style |
| features[history].title | Історія перекладів і пошуку слів | History of translations and word lookups | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac і Vision Pro | iPhone, iPad, Mac and Vision Pro | （同左） |
| faq[what-is].q | Що таке WordByWord? | What is WordByWord? | （同左） |
| faq[whole-page].q | Чи може WordByWord перекласти всю вебсторінку одразу? | Can WordByWord translate the whole web page at once? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | Чи працює WordByWord у Safari або в інших застосунках? | Does WordByWord work in Safari or in other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | Чи перекладає WordByWord дослівно, слово в слово? | Does WordByWord translate literally, word for word? | Is WordByWord a word-by-word translator? |
| faq[x].q | Чи можна читати X (колишній Twitter) у WordByWord? | Can you read X (formerly Twitter) in WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | Які мови підтримує WordByWord? | Which languages does WordByWord support? | （同左） |
| faq[free].q | WordByWord безкоштовний? Які щоденні ліміти? | Is WordByWord free? What are the daily limits? | （同左） |
| faq[engines].q | Який рушій перекладу використовує WordByWord? | Which translation engine does WordByWord use? | Which translation engine does it use? |
| faq[account].q | Чи потрібен обліковий запис, щоб користуватися WordByWord? | Do you need an account to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | Як повернути WordByWord Plus на новому iPhone чи iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? | （同左） |
| faq[android].q | Чи є версія для Android? | Is there a version for Android? | Is there an Android version? |
| faq[english-learner].q | Я вивчаю англійську. Чи варто спробувати ще й SurfEnglish? | I'm learning English. Is it worth trying SurfEnglish as well? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | Чи працює WordByWord на айфоні, iPad, Mac або в браузері на комп’ютері? | Does WordByWord work on an iPhone ("aifon"), iPad, Mac or in a browser on a computer? | Does WordByWord work on iPad, Mac or a desktop browser? |
| pricing.summary | У межах цих лімітів усі функції безкоштовні; Plus підвищує їх за 3,99 USD на місяць (ціна в США). | Within these limits all features are free; Plus raises them for USD 3.99 a month (US price). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | Від розробника WordByWord | From the developer of WordByWord | （同左） |
| sibling.card.title | SurfEnglish: новини англійською для вашого рівня | SurfEnglish: news in English for your level | SurfEnglish: daily English news at your level |
| sibling.card.body | Вивчаєте англійську? Читайте у WordByWord і далі будь-які сторінки, а ще спробуйте SurfEnglish: щоденні новини за рівнями та ігри для повторення — з тими самими жестами. | Learning English? Keep reading any pages you like in WordByWord, and also try SurfEnglish: daily news by level and review games — with the same gestures. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | Новини англійською, рівні A1–C1 ／ Ігри для повторення прочитаного ／ Діліться статтями англійською із Safari | News in English, levels A1–C1 / Games for reviewing what you've read / Share English articles from Safari | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.uiNote（替换 note） | Безкоштовно · Інтерфейс англійською та ще 11 мовами, без української · Перекладає українською | Free · Interface in English and 11 other languages, not in Ukrainian · Translates into Ukrainian | （en 的 note：Free to start · iPhone and iPad · App in 12 languages · Translations into 21；文档 04 §5.7 uk 草案："Безкоштовний старт · Інтерфейс застосунку не має української (англійська та ще 11 мов) · Перекладати українською можна"） |
| sibling.card.linkText | Новини англійською за рівнем — SurfEnglish (сайт англійською) | News in English by level — SurfEnglish (site in English) | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | Завантажити SurfEnglish в App Store | Download SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | Екран Games у SurfEnglish (інтерфейс англійською): Sentence Builder і Word Raid зі збереженими реченнями та словами | SurfEnglish Games screen (English interface): Sentence Builder and Word Raid with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | Знімок екрана SurfEnglish (інтерфейс англійською) | SurfEnglish screenshot (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer | Від того самого розробника ／ SurfEnglish: Bilingual News (EN) | From the same developer / （店名，不翻译） | More from the maker / SurfEnglish: Bilingual News |
| faq[english-learner].a（SE 相关） | Користуйтеся й надалі WordByWord для сторінок і дописів у X, які ви обираєте, — англійською чи будь-якою іншою мовою. Якщо вам хочеться ще й щоденних новин англійською за рівнями (A1–C1) та ігор для повторення збережених речень і слів, SurfEnglish від того самого розробника дає саме це — з тими самими свайпом і подвійним дотиком. Обидва застосунки можна використовувати паралельно. Інтерфейсу SurfEnglish українською немає — він англійською та ще 11 мовами, — але перекладати українською застосунок уміє. Сайт SurfEnglish (англійською) | Keep using WordByWord for the pages and X posts you choose — in English or any other language. If you'd also like daily English news by level (A1–C1) and games to review saved sentences and words, SurfEnglish from the same developer gives you exactly that — with the same swipe and double tap. The two apps can be used side by side. SurfEnglish has no Ukrainian interface — it's in English and 11 other languages — but the app can translate into Ukrainian. SurfEnglish website (in English) | Keep using WordByWord for the pages and X posts you choose, in English or any other language. If you would also like daily English news sorted by level (A1–C1) and games that review the sentences and words you have saved, SurfEnglish, from the same developer, adds that with the same swipe and double-tap. The two apps work side by side. [+ §7.8 en-site sentence] SurfEnglish website |
| cta.title | Почніть читати сайти двома мовами на iPhone | Start reading websites in two languages on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | Переклад свайпом · Значення слів подвійним дотиком · Читання вголос · 21 мова | Swipe translation · Word meanings with a double tap · Read aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（表中 uk 为可读形式：实际 JSON 里破折号和"·"前是 U+00A0，复数对象已代入当前值，价格由构建按 `Intl.NumberFormat('uk')` 输出为"3,99 USD"。）

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下差异都有依据：

1. `meta.title` 没有 "App"：uk 的产品词是 перекладач（文档 03 §3.9 草案、§1.6 `primaryTokens.home.uk`）。
2. description 用"у WordByWord"代替"in the built-in browser"（文档 03 §3.2 允许二选一；草案原样）；H1 / description / how 写了方向"праворуч"（与 App 提示 `tip_swipe_to_translate`「Проведіть вправо …」和文档 08 §7.3 一致；向左滑会删除译文，F14）。
3. H1 没有"any"（"будь-якому"），与草案一致，也避开整页联想；超长时只能删它（加上会到 n85）。
4. OG 标题是"原文留在原处"而不是祈使句"保留原文"：把"зберегти оригінал"留给 G1 的 how-to 主词（附录 A）。
5. hero.platformNote 不写美区价格数字，只写"Plus — щомісячна підписка"（D2，与 ja / zh-Hans / fr / de 相同）。
6. SE 卡片：title 少了"daily"（body 保留"щоденні"）；要点 1 少了"Real"，要点 3 少了"to the app"；"the same swipe and double-tap"写成"з тими самими жестами"（同样的手势）——都是为卡片高度（R10 / R84）；uiNote 按 en-site 规则替换 note。
7. FAQ `english-learner` 多了 §7.8 规定的界面说明句；指向英文页面的三个富文本链接文字带"(англійською)"；FAQ `devices` 问句多了"на айфоні"（SEO-11）。
8. 价格表：每日额度写"50 / день"（= en "50 / day"），免费列表头写"Безплатно"，"仅英语"标签写"Лише англ."，Plus 表头价格写"3,99 USD/міс. (США)"——为了让表格在 375 px 放得下（§6 第 3 条）。
9. FAQ `engines` 的"AI Read"写成 App 的 uk 名 «AI Читання»。

## 4. 没把握的措辞（12 处，附回译与替代写法）

| # | 键 | uk | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | hero.title | …переклад з’явиться **одразу** під ним. | …the translation will appear right below it. | …з’явиться **просто** під ним（文档 03 草案原文） | "просто під ним"在书面语里就是"正下方"，但很多读者会读成"简单地出现在下面"；"одразу"同时带"马上"的意思，与 en 的"right below"更贴。语序"по абзацу на сайті праворуч"沿用草案（也比"праворуч по абзацу на сайті"在 320 px 少一行） |
| 2 | features[lookup].kicker | Двічі торкніться, щоб знайти | Double-tap to find | Значення в контексті（20，不报 W） | App 叫法（`word_meaning_lookup_title` 去掉"(AI Значення)"）；28 > 24 wu 报 W。"знайти"（找到）本身是 App 的误译（应为"дізнатися значення"），见 §6 第 6 条 |
| 3 | hero.lede / faq[what-is] / footer.tagline | помічник у читанні … для тих, хто вивчає мови | an assistant in reading … for those learning languages | помічник для читання …（更常见，但会与后面的"для тих"连用两个"для"） | R39 定义句；"помічник"只用在定义句（D13） |
| 4 | pricing.table.colFree | Безплатно | Free of charge | Безкоштовно（与正文一致，但表格在 375 px 会被裁掉 Plus 列） | 两词是同义的规范词；为放下表格只在表头用"Безплатно"，正文、标题仍用 K10 的"безкоштовн-" |
| 5 | pricing.table.englishOnly | Лише англ. | English only (abbr.) | Лише англійська（原写法，占宽导致表格在 ≤ 414 px 被裁） | 同一个键也用在 Chunks 卡片的标签上；"англ."是常见缩写 |
| 6 | pricing.table.perDay | 50 / день | 50 / day | 50 разів на день（App 对比页原文，表格太宽）／ 50 на день（需要一个四个分支相同的复数对象才能过 L-12） | 见 §6 第 3 条 |
| 7 | features[history].text | Переклади й шукані слова зберігаються з реченням; очистити можна будь-коли. | Translations and the words you looked up are saved with their sentence; you can clear them any time. | …слова, які ви шукали, …（更口语，但超过 80 字符） | "шукані"偏书面 |
| 8 | features[engines].text | Хмарний: Azure і Google; локальний: iOS. Скінчився хмарний ліміт — перемкніться. | Cloud: Azure and Google; local: iOS. Cloud limit used up — switch. | Хмара (Azure і Google) чи iOS на пристрої; ліміт хмари вичерпано — на локальний.（80） | 规格清单 80 字符上限下的电报体 |
| 9 | featuresIntro.title / cta.recap / FAQ | переклад свайпом | translation by swipe | переклад проведенням пальця（生硬） | "свайп"是外来词，但 App 自己大量使用（"Історія Перекладу Свайпом""Рушій перекладу свайпом"），口语里也通行；句子里的动作一律写"проведіть праворуч" |
| 10 | meta.ogHeadline | Оригінал — на місці. | The original — in its place. | Оригінал лишається на місці.（OG 只能缩到 44 px） | 带破折号的省略句在标题里自然 |
| 11 | features[speech].text | …голоси Premium чи Enhanced | …Premium or Enhanced voices | голоси «Преміум» чи «Покращений» | 按 App 的 uk 字符串保留英文名（`local_speech_engine_*`）；iOS 乌克兰语设置里这两档可能显示为本地化名称，请审校人在设备上确认 |
| 12 | 全页 | застосунок | app | додаток（App 的"Мова Додатку"用的是这个） | "застосунок"是规范推荐词（Дія、monobank 等都用），"додаток"更口语、搜索量也大；全页统一用"застосунок" |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法**（xcstrings uk，引用处照原文，含 App 的英式首字母大写）：Проведіть для перекладу；Двічі торкніться, щоб знайти (AI Значення)；Більше визначень；Виділення Фрагментів；Потік дій у реченні / Потік дій（正文括注一次，标题与表格用 App Store 名 Action Flow，D3）；Отримати пояснення синтаксису ШІ；Аналіз структури синтаксису ШІ（价格表行名，取自 App 对比页）；AI Читання / Локальне читання；AI вимова (Слово / Речення)；Хмарний рушій перекладу / Локальний рушій；Авто / Абзац / Речення за Реченням；Оновити Зараз；Відновити Покупку。
- **AI 与 ШІ**：正文一律写"ШІ"；只有引用 App 叫法时保留 App 的"AI"（«AI Читання»、«AI вимова»、«(AI Значення)»）。
- **称谓**：ви（小写，网页正文惯例）。WordByWord 与"застосунок"按阳性处理。
- **X**：kicker 与 FAQ 问句写"X (колишній Twitter)"（§7.2.3），帖子叫"допис / дописи"（X 乌克兰语界面用词）。
- **Apple 用语**：обліковий запис Apple（Apple Account）；Mac із чипом Apple；"{minOS} або новіша"（按"iOS = 系统"作阴性）；徽章文字「Завантажити в App Store」→ `appStoreBadgeAlt` = «Завантажити WordByWord в App Store»，SE 文字链接同结构；页眉短按钮"Отримати"= 乌克兰区 App Store 的"获取"按钮。
- **排版**：引号 «»，破折号 —（前加 U+00A0），列表点"·"前加 U+00A0，复数对象里数字与名词之间 U+00A0，撇号 ’；у/в、і/й、з/із/зі 按乌克兰语谐音规则逐处处理（如"із Safari""із застосунком""браузері й"）。
- **en-site 的 SE 文案**：没有照搬文档 04 §5.7 的 uk 种子：uiNote 种子里"Інтерфейс застосунку не має української"语感生硬，改成"Інтерфейс англійською та ще 11 мовами, без української"；linkText 种子"Новини англійською з перекладом"按 T7"语义以 en 为准"改成"…за рівнем"。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，`home-uk.jpg` 与 `og.json` 没有复制进真实仓库。uk.json 入库后，`node build.mjs` 会报 `D-23 home-uk: no OG image`，直到负责人跑 `node scripts/og.mjs --only home-uk`（新副本实测通过：64 px × 3 行、副标题 28 px × 2 行、146.5 KB）。
2. **uk lint 词表**：`docs/redesign-2026/ops/m3/uk-lint.json`（附录 A）覆盖 25 条规则 + `seOwned` / `seOwnedLead` / `reserved.G1`。副本合入后：全站（含已入库的其余 11 个语言）build 与 `--pseudo` 0 error，uk 的 L-14 / L-9 警告消失；反例句 47 条全部命中，必须放行的句子全部放行。**附带发现（不在 uk 范围，供负责人处理）**：JavaScript 正则里 `\w`、`\b` 即使带 u 标志也只认 ASCII，所以现有 `selection-translate` 的 uk `"виділ\\w* текст"` 与 ru `"выдел\\w* текст"` 实际只能匹配"виділ текст"这种不存在的写法（建议改成 `\\p{L}*`）；`keyword-map.json` 的 `seOwnedLead.ru` 用了 `^\\W*`，而 `\W` 会吃掉西里尔字母，等于"在 H2 任何位置出现"都算开头（我的 uk 模式改用 `^[\\s\\p{P}\\p{S}]*`）。
3. **价格表宽度**：`.table-wrap` 是 `overflow: hidden`，表格超宽时 Plus 列直接被裁掉，不能横向滚动。uk 原写法在 320–414 px 都被裁（表宽 437 px）；我用四处缩写让它在 ≥ 375 px 放得下（"50 / день"、表头"Безплатно"、标签"Лише англ."、价格"3,99 USD/міс. (США)"），320 px 下仍裁掉约 43 px（en 在 320 px 也裁 19 px、de 43 px；fr 在 375 / 390 px 也被裁）。建议模板把 `.table-wrap` 改为 `overflow-x: auto`；改了之后 uk 可以恢复"Безкоштовно""Лише англійська"和 App 原文"50 разів на день"。
4. **320 px 页眉**：uk 的短按钮"Отримати"在 320 px 下让地球图标压住"WordByWord"字标最后一个字母约 8 px（es、nl 同样 −8 px；340 px 起正常）。"Скачати"也只能缩到 −3 px，只有"Взяти"这类不自然的词才放得下。建议模板在 < 340 px 隐藏 `.brand-name`（现在只对扩展页的按钮这样做）。
5. **页面长度**：390 px、FAQ 收起时 uk 首页 13,663 px（en 12,885、de 13,704、fr 13,612、it 13,028、nl 12,991；R20 / R69 目标 ≤ 13,000）。主要多在功能区（+242）和价格表（+254，表格变窄后行名换行更多）。没有为此删内容。
6. **报给 App 侧的 uk 字符串问题**（规则 ③，网站不照抄或照引并说明）：① `translation_style_title_border` / `_description_border` = «Граница»（俄语；同一含义的 `Border` 键是 «Межа»）；② `translation_style_title_underline_solid` = «Сплошне Підкреслення»（俄语形式，应为 «Суцільне підкреслення»）；③ «Підкреслення штрихами» 与 «Пунктирне Підкреслення» 同义两译；④ `audio_playback_description_local` 用 «движок»，设置页用 «рушій»；⑤ "AI" 与 "ШІ" 混用；⑥ 大量英式首字母大写（«Речення за Реченням»«Оновити Зараз»«Мова Джерела»）；⑦ `word_meaning_lookup_title` 的 «щоб знайти»（"找到"）不是"查词义"；⑧ `upgrade_now_button` 与 `update_now_button` 都是 «Оновити Зараз»，"升级到 Plus"读起来像"立即更新"；⑨ `limit_per_day%lld` = «%lld разів на день» 没有复数变体（3 次会显示成"3 разів"）；⑩ «Мова Додатку» 用"додаток"，网站用规范词"застосунок"。
7. **`meta.appStoreSubtitle`**：乌克兰区店面的副标题没有资料（研究 05 §2.1 只列了 US/JP/CN/TW/KR/DE），现值"Переклад свайпом, пояснення від ШІ"是 US 副标题的译文；该键只在 en 的 about 页用，uk 页面不渲染。拿到 App Store Connect 的 uk 副标题后替换。
8. **`seo.titleMust`**：文档 08 §7.3 写的是"iPhone、сайтів"，我按文档 03 §3.8 / §1.6 加了产品词"перекладач"（与 fr / de / it / nl 同样做法），请确认。
9. **`sibling.card.note`**：en-site 下不渲染（由 uiNote 替换），但 L-3 要求存在；我写成不涉及界面语言的"Безкоштовно · iPhone та iPad · Переклад 21 мовою"，以免以后切换 seMode 时冒出"界面有 12 种语言"一类暗示乌克兰语界面的说法。
10. **页脚里指向英文页的链接**（Про WordByWord、Підтримка、Політика конфіденційності、"Розробник: Jinlong"）没有加"(англійською)"：这次只给富文本链接加了标记，页脚标签是通用键（与 de 的处理相同）。
11. **母语审校**：按 R36，uk 上线后补母语审校（文档 04 T11 把 uk 列为优先）；请审校人重点看 §4 的 12 处和 SE 卡片。

## 附录 A：建议的 uk lint 词表（`docs/redesign-2026/ops/m3/uk-lint.json`）

覆盖范围：`claims-lint.json` 中所有有按语言写法、且还没有 uk 键的规则（25 条，含同时有 `*` 和按语言写法的 `hype`）；跳过 `selection-translate`、`jargon`（已有 uk）和 `io-home`、`engine-claim`（只有 `*`）。`keywordMap` 对应 `seOwned.uk`（追加）、`seOwnedLead.uk`（新建）、`reserved.G1.uk`（新建）。乌克兰语词尾变化多，模式用词干 + `\p{L}*`；词边界用 `(?<![\p{L}])` / `(?![\p{L}])`；撇号写成 `[’'ʼ]`。

**自测**（副本 = HEAD `0267123` + uk，合入词表后）：`node build.mjs` 与 `--pseudo` 全站 0 error（uk 文案 0 命中；其余 11 个已发布语言的 H2 也不命中 `seOwnedLead`）；测完已还原副本数据文件，并与真实仓库逐字节比对一致。

**反例句（全部命中各自规则）**：

| 规则 | 反例句 |
|---|---|
| whole-page | Перекладайте всю вебсторінку одним дотиком. ／ Переклад усієї сторінки за секунду. |
| swipe-left | Проведіть по абзацу ліворуч, щоб побачити переклад. ／ Свайп вліво відкриває переклад. |
| safari-extension | Працює як розширення для Safari в будь-якому застосунку. ／ Не потрібно перемикати застосунки. |
| offline | Перекладає офлайн, без інтернету. ／ Працює без підключення до інтернету. |
| unlimited-ai-voice | З Plus — необмежена вимова ШІ. ／ Безлімітне озвучення голосом ШІ. |
| dark-mode-theme | Підтримує темний режим і власні теми оформлення. |
| shortcuts-volume | Налаштовуйте гарячі клавіші та гучність озвучення. |
| vocab-sync | Зберігайте слова у флеш-картки й синхронізуйте їх через iCloud. ／ Словник нових слів з інтервальним повторенням. |
| android | Завантажте застосунок для Android у Google Play. |
| desktop-version | Є також десктопна версія для Windows. ／ Програма для комп’ютера вже доступна. |
| x-app | Перекладайте дописи прямо в застосунку X. |
| plus-early-access | Підписники Plus отримують ранній доступ до нових функцій. |
| privacy-claim | WordByWord не збирає жодних персональних даних. |
| initial-version | Початкова версія підтримує багато мов. |
| language-pairs | Понад 20 мовних пар. |
| style-count | Оберіть один із 8 стилів перекладу. ／ Сім стилів перекладу на вибір. |
| auto-detect-target | Застосунок автоматично визначає мову перекладу. |
| history-by-date | Історія групується за датою. |
| plus-only | Аналіз синтаксису доступний лише з Plus. |
| speaking-practice | Покращуйте вимову та розвивайте говоріння. |
| replacement-tone | SurfEnglish може підійти вам краще, ніж попередній застосунок. ／ Спробуйте SurfEnglish замість WordByWord. |
| se-on-device-voice | ШІ-голос на пристрої, працює офлайн.（规则只作用于 SE 卡片与 FAQ `english-learner`） |
| se-hype | Новинка: SurfEnglish — швидший спосіб вивчати англійську. ／ Нові ігри після оновлення.（同上，另含 `sibling.footer`、`about.family`） |
| hype | Найкращий перекладач — революційний застосунок від команди WordByWord. ／ Понад 10 000 користувачів. |
| ext-language-count | Перекладає 20 мовами.（只作用于 `chromeExtension.*`） |
| seOwned | Вивчайте англійську за новинами ／ Новини англійською з перекладом ／ Англійські новини для вашого рівня ／ Чанки в кожному реченні ／ Виділення фрагментів у заголовку |
| seOwnedLead | Вивчаєте англійську? Спробуйте SurfEnglish ／ Вчіть англійську з SurfEnglish ／ Вивчення англійської з новинами |
| reserved.G1 | Як перекласти сайт на iPhone і зберегти оригінал ／ Перекладайте сторінки, зберігаючи оригінал ／ Покрокова інструкція |

**必须放行**（0 命中）：«Для вивчення мов»、«для тих, хто вивчає мови»、«вивчення мов через читання сайтів»、«Двомовне читання сайтів для вивчення мов»、«іспанський текст з англійським перекладом під ним»（文档 03 §1.4：不含"英语"的通用学习词归 WBW）；`seOwnedLead` 对 uk 页全部 H2（«SurfEnglish: новини англійською для вашого рівня»«Запитання про WordByWord»等）和 FAQ 问句 «Я вивчаю англійську. …» 不命中；G1 模式对 uk 的 title、H1、`cta.title`、OG 标题不命中。

起草时发现并修掉的问题：`seOwnedLead` 最初照 ru 写成 `^\W*…`，结果命中了 «Я вивчаю англійську. …»（`\W` 吃掉了"Я"），已改为 `^[\s\p{P}\p{S}]*`。合入前请母语审校再看一遍 `hype` 的 `(єдиний|єдина|єдине)`（可能误伤"єдиний обліковий запис"一类正常说法）和 `se-hype` 的 `нов…` 词尾列表（刻意不含"новини / новин"）。

## 附录 B：验证记录

最终验证在 `scratchpad/wbw-m3-uk-final/`（rsync 自真实仓库，HEAD `0267123`，含已入库的 en / zh-Hans / zh-Hant / ja / ko / es / pt-BR / fr / de / it / nl），加入 `uk.json`、`glossary/uk.json`，并在副本里生成 `home-uk` OG。

| 命令 | 结果 |
|---|---|
| `node scripts/og.mjs --only home-uk` | ✓ headline 64 px × 3、sub 28 px × 2、q82、146.5 KB |
| `node build.mjs --out …/dist` | 19 页，0 error；uk 的 W：L-8（lookup kicker 28 > 24）、L-4（6 个预期相同值）、L-14（24 条规则无 uk 词表）、L-9（无 uk G1 模式） |
| `node build.mjs --pseudo --out …/dist-pseudo` | 0 error |
| `node scripts/check.mjs` | 19 个 HTML，0 error，0 warning |
| `node scripts/check.mjs --keys uk` | 0 missing，0 not in en |
| `node --test scripts/tests/*.test.mjs` | 58 pass，0 fail |
| 合入 `uk-lint.json` 后 build / `--pseudo` | 0 error；uk 的 L-14 / L-9 W 消失 |
| 复验：交付前按当时的工作区（HEAD `0267123` + 尚未提交的 pl 文件）重新 rsync，加入 uk | build / `--pseudo` 均 0 error（20 页），`check.mjs` 0 / 0，测试 58/58；合入 `uk-lint.json` 后仍 0 error；真实仓库里的 `uk.json`、`glossary/uk.json` 与验证所用文件逐字节相同 |

长度实测（占位符代入后，`text-length.mjs` 口径）：title 50 / 60；description 160（120–160）；H1 74 / 75；eyebrow 53 / 60；lede 78 / 90；ctaNote 39 / 40；how 163 / 180（L-8 上限 220）；platformNote 128 / 140；规格清单 80 / 75 / 75 / 76（≤ 80）；功能 H3 ≤ 65 / 70；`languages.title` 43 / 70；`pricing.summary` 97 / 100；`cta.title` 43 / 70；`cta.recap` 77 / 90；SE title 48 / 60、body 26 词 / 45、要点 31 / 31 / 39（≤ 45）、linkText 61 / 80；FAQ 问句 ≤ 71 / 120、答案 ≤ 537 / 600；所有 alt ≤ 125（`features[lookup].alt` 正好 125）。

渲染（headless Chrome + `scripts/serve.mjs --port 4606`，浅色，FAQ 展开测卡片、收起测页高）：

| 宽度 | 横向溢出 | H1 行数 | SE 卡片高度（上限） | 价格表 | 页眉按钮 |
|---|---|---|---|---|---|
| 320 | 无 | 6 | 547（560） | 表宽 329 / 286，Plus 列被裁（模板，§6 第 3 条） | Отримати（字标被压 8 px，§6 第 4 条） |
| 375 | 无 | 5 | 469（480） | 放得下 | Отримати |
| 390 | 无 | 4 | 448（480） | 放得下 | Отримати |
| 414 | 无 | 4 | 429（480） | 放得下 | Отримати |
| 768 | 无 | 3 | 344（480） | 放得下 | Завантажити |
| 900 | 无 | 4 | 411（420） | 放得下 | Завантажити |
| 1280 | 无 | 4 | 393（420） | 放得下 | Завантажити |

390 px、FAQ 收起时页面高度：uk 13,663 px（en 12,885、de 13,704、fr 13,612、it 13,028、nl 12,991）。
