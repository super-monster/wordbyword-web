# M3 · hi（हिन्दी）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | hi（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校；文档 04 T11 把 hi 列为优先补审的语言） |
| 交付 | `src/locales/hi.json`（新建）；`src/data/glossary/hi.json`（新建，§7.2.5 格式）；`docs/redesign-2026/ops/m3/hi-lint.json`（建议的 hi lint 词表，未合入数据文件）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10，重点 §7.3 hi 行、§7.7 天城文）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（表 A / B / C 的 hi 行）、§3.1、§3.2、§3.6、§3.8、§3.9（hi 草案）；文档 04 §5.1、§5.5（hi 页脚）、§5.7（hi linkText 种子、T1–T11）；裁定 R36、R39–R43、R46、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照，`es.json` / `ko.json` / `pt-BR.json` 作 full 模式参照，`uk-qa.md` 作记录格式参照；`_legacy/hi.json`、`sibling-tm.json` 只作术语参考（带 warnings 的写法与事实一律未用：「चुनते ही」「संरेखण」「20+ भाषा जोड़ों」「तिथि के अनुसार समूहित」「डार्क मोड」「कोई व्यक्तिगत डेटा…」等） |
| App 字符串核对 | `WordByWordPrototype/Localizable.xcstrings` 的 `localizations.hi.stringUnit.value`（node 逐键读取，315 个键中 270 个有 hi 值；与文档 08 表 T-A…T-E 的 hi 列逐条一致）；价格表行名另对照 App 的"免费 / Plus 对比"页 `FeatureQuotaManager.swift` `featureDisplayName()` 与 `SubscriptionComparisonView.swift`；SE 页脚名与 SE 用词对照 SurfEnglish 官网仓库 `SurfEnglishWebsite/src/locales/hi.json`（`meta.appStoreName` = «SurfEnglish: इंग्लिश न्यूज़»）；hi 的 App Store 徽章是 en-us 图（文档 02 §4.1 注 ⁵） |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-hi/`（由 `git archive HEAD` 展开）起草、测长度、做渲染检查；最终验证在按 HEAD `ee73df7` 重新展开的 `scratchpad/wbw-m3-hi-final/` 里做。OG 图只在副本里生成，**没有**复制进真实仓库；lint 词表只在副本里合入自测 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys hi`：0 缺、0 多；与 ja / uk 等一样不提供 `about.*`、`chromeExtension.*`、`legal.*`，提供 `notfound.*`）。HEAD `ee73df7` 新副本里：`node build.mjs` 与 `--pseudo` 均 **0 error**；`node scripts/check.mjs` 0 error / 0 warning；`node --test scripts/tests/*.test.mjs` 63/63 通过（附录 B）。
2. hi 自己的 warning 只有三类：L-4 的 6 个"预期相同"值（样张英文原句、虚构账号等，文档 08 §1.5）；L-14"24 条规则没有 hi 词表"、L-9"没有 hi 的 G1 how-to 模式"——后两条来自数据文件缺 hi 词表。我起草了 `hi-lint.json`（附录 A），在副本里合入后全站 0 error，hi 的 L-14 / L-9 消失。**没有** L-8 warning：两个功能名 kicker 都在 24 以内（20、22）。
3. title、description、H1 用文档 03 §3.9 的 hi 草案：title 逐字（v47）；H1 逐字，只加了荧光笔「[[वेब पेज]]」（v66）；description 只把"शब्द पर डबल टैप करके अर्थ देखें"补成"किसी शब्द पर डबल टैप करके उसका अर्थ देखें"（v156，区间 100–160）。称谓按文档 08 §7.3 用 आप（礼貌祈使 -एँ / -ें）。
4. 复数：hi 的 CLDR 类别是 one / other。所有"数字占位符 + 可数名词"都写成 `{x, plural, one{…} other{…}}`（16 处），并按格选词形：间接格"21 भाषाओं में"、直接格"21 भाषाएँ"、"# बार"（"次"，单复数同形，两个分支相同，见 §2 Q2）。0 / 1 / 2 / 5 / 21 / 1.5 逐一代入核对过。
5. SurfEnglish：hi 的 `seMode` = local（文档 08 §7.8 的 full），卡片、FAQ、页脚都链 `https://surfenglish.app/hi/`；note 写"ऐप हिन्दी समेत 12 भाषाओं में"（界面含印地语等 12 种）；linkText 按 en 语义写 SE 核心词"अपने स्तर की अंग्रेज़ी खबरें"（SE 印地语站与店面副标题的主词）+ 品牌；页脚用文档 04 §5.5 的 hi 值。卡片高度 320 / 375 / 390 / 1280 px 下为 460 / 419 / 419 / 338 px，都在 R10 / R84 上限内。
6. 英文界面：所有截图 alt、4 条画廊图注、`common.screenshotLabel` / `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都写"अंग्रेज़ी इंटरफ़ेस"；指向英文页的富文本链接（`@about`、`@chrome`）文字带"(अंग्रेज़ी में)" / "(अंग्रेज़ी पेज)"；`@se-site` 指向 SE 的印地语页，不加标记。
7. OG（只在副本）：`node scripts/og.mjs --only home-hi` 一次通过，标题 **64 px × 2 行**（第 2 行是荧光笔短语，与 en 同一版式）、副标题 30 px × 2 行、142.5 KB。初稿"कोई भी वेब पेज दो भाषाओं में पढ़ें। [[…]]"只能排成 58 px，而且荧光笔短语接在"पढ़ें।"后面同一行——模板只在 `. : ! ? 。：！？` 后给荧光笔短语换行，不认天城文句号「।」（§6 第 3 条）；改成"वेब पेज दो भाषाओं में पढ़ें। [[मूल पाठ जस का तस।]]"后第一句正好占满第 1 行。
8. 渲染检查（headless Chrome + `scripts/serve.mjs --port 4611`，HEAD `ee73df7` 的 CSS，已含天城文行高 1.75 / 标题 1.3）：320 / 375 / 390 / 414 / 768 / 900 / 1280 px 无横向溢出、无字体回落；390 px（FAQ 收起）页面高 **12,888 px**（≤ 13,000；en 12,943、uk 13,685、th 12,973、vi 13,025）。
9. 需要负责人决定的事见 §6，主要是：OG 图入库、是否合入 hi lint 词表、OG 模板认「।」、App 侧的 hi 字符串问题（X10 之外 Local Read 同样把"朗读"写成"学习"等 10 处）、正文里那一处 Hinglish"website translate"。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | «WordByWord: iPhone के लिए द्विभाषी वेब पेज अनुवाद ऐप» | 品牌位 WordByWord（文档 03 §1.5：hi 不用本地化店名）；K1 主词「iPhone के लिए द्विभाषी वेब पेज अनुवाद ऐप」**逐字完整**（文档 03 §2.3 表 A）；`titleMust` = iPhone / वेब पेज / ऐप 全部命中；`primaryTokens.home.hi`（iPhone、ऐप）命中 | v47（上限 60） |
| `meta.description` | «भाषा सीखने वालों के लिए: WordByWord के ब्राउज़र में किसी पैराग्राफ़ को दाईं ओर स्वाइप करें, अनुवाद ठीक नीचे दिखेगा। किसी शब्द पर डबल टैप करके उसका अर्थ देखें। iPhone और iPad पर मुफ़्त।» | 受众词「भाषा सीखने वालों」（表 C，R39，文档 03 §1.4 列为必须放行的通用学习词）；K1 动作 + 结果在前一半；"WordByWord के ब्राउज़र में"满足文档 03 §3.2（内置浏览器 / 在 WordByWord 里）；K2「शब्द … अर्थ」；平台 + 免费收尾（SEO-11） | v156（区间 100–160） |
| `hero.title`（H1） | «[[वेब पेज]] के किसी पैराग्राफ़ को दाईं ओर स्वाइप करें — अनुवाद ठीक उसके नीचे दिखेगा।» | K1 核心名词「वेब पेज」（荧光笔，2 个词，R65）；"段落"一级的动作 + 结果（R46、PRO-19），写了方向"दाईं ओर"；不含品牌（R27）；没有 how-to 句式 | v66（上限 75） |
| `hero.eyebrow` | «WordByWord · भाषा सीखने वालों के लिए द्विभाषी वेब रीडर» | 品牌 + 品类（双语网页阅读器）+ 受众 | 49 / 60 |
| `hero.lede` = `ledeShort` | «WordByWord भाषा सीखने वालों को पढ़ने में मदद करने वाला iPhone और iPad ऐप है।» | R39 定义句（印地语是 SOV 语序，"WordByWord … है"就是"WordByWord 是……"；"reading assistant"写成"帮助阅读的 App"，见 §4 第 1 条） | 68（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | «वेब पेज दो भाषाओं में पढ़ें। [[मूल पाठ जस का तस।]]» | K1 核心名词 + 双语阅读；荧光笔 1 处；"原文原封不动"用习语「जस का तस」，没用"मूल पाठ बनाए रखें"（"保留原文"留给 G1，附录 A 已列入 G1 模式） | 64 px × 2 行 |
| 功能区 H2 | «स्वाइप करके अनुवाद, डबल टैप करके अर्थ — उन वेबसाइटों पर जिन्हें आप पढ़ते हैं» | K1「स्वाइप … अनुवाद」+ K2「डबल टैप … अर्थ」；"在你读的网站上"（PRO-16，不写"任何网站"） | 70 wu 内 |
| 功能 H3 | K1「स्वाइप करें और मूल पाठ के ठीक नीचे अनुवाद पाएँ」；K2「शब्द पर डबल टैप करें — AI संदर्भ के अनुसार उसका अर्थ बताएगा」；K9「बिल्ट-इन ब्राउज़र में X (Twitter) पोस्ट का अनुवाद, मूल पोस्ट के साथ」；K5「अंग्रेज़ी वाक्यों के लिए खंड निष्कर्षण और Action Flow」（R83 带"अंग्रेज़ी"）；K3「AI आवाज़ में पढ़कर सुनाना, या डिवाइस पर iOS की तेज़ आवाज़ें」；K4「लंबे वाक्यों के लिए AI से वाक्य संरचना का विश्लेषण」；K7「क्लाउड या डिवाइस पर अनुवाद」；K6「अनुवाद और शब्द खोज का इतिहास」 | K3、K4、K6、K7 与表 A / B 主词逐字一致；K2「संदर्भ के अनुसार … अर्थ (AI)」、K9「X (Twitter) पोस्ट का अनुवाद」为主词的语序变体 | 全部 ≤ 57 / 70 |
| 语言段 H2 | «21 भाषाओं में अनुवाद — सिर्फ़ अंग्रेज़ी से नहीं»（复数对象） | K8 主词「21 भाषाओं में अनुवाद」逐字 | 35 / 70 |
| 价格段 H2 | «हर दिन मुफ़्त — ज़्यादा पढ़ें, तो Plus में अपग्रेड करें» | K10「मुफ़्त」+ Plus | — |
| 最终 CTA H2 | «iPhone पर वेबसाइटें दो भाषाओं में पढ़ना शुरू करें» | 动作句，不是 G1 标题，不暗示整页（R46） | 38 / 70 |
| FAQ `safari` 答案 | «… फिर वहीं पैराग्राफ़ स्वाइप करके website translate करें।» | 文档 08 §7.7 / 文档 03 §2.3：hi 用户常用英文 / Hinglish 搜索，正文自然出现一次"website translate"（§6 第 6 条） | — |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有 `seOwned.hi` 与附录 A 新增的"अंग्रेज़ी खबरें / समाचार""खंड निष्कर्षण""शब्द समूह"都 0 命中）；title / H1 / description / `cta.title` 里没有 how-to 句式（附录 A 的 G1 模式"कैसे""तरीका""मूल पाठ … रखें"0 命中）。hi 没有表 C 要求的 iPhone 本地写法（文档 03 §2.3 表 C 只给 ru / uk / ar / th / zh-Hans 设了），所以 FAQ 问句没有放"आईफ़ोन"。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys hi` 0 缺 0 多）；HEAD 新副本 build / `--pseudo` 0 error，`check.mjs` 0 / 0，测试 63/63 |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条）。复数对象（one / other）16 处：`languages.title / uiCount / targetCount`、`gallery.items[languageList].caption`、`faq.items[languages].a`（2 处）、`faq.items[free].a`（6 处）、`cta.recap`、`sibling.card.note`（2 处）、`pricing.table.perDay`。当前值渲染为"21 भाषाओं में""20 भाषाओं में""21 अनुवाद भाषाओं में से""21 भाषाएँ""12 भाषाओं में""दिन में 500 बार""50 बार स्वाइप अनुवाद"；0 / 1（one）代入为"1 भाषा में""1 भाषा""1 बार"，2 / 5 / 21 / 1.5（other）都合语法。印地语里"बार"（次）和直接格的阳性名词单复数同形，所以这几处两个分支相同——仍按简报写成复数对象，以后换成会变形的名词时不用改结构 |
| Q3 | ✓ | title 以品牌位开头，`titleMust` = ["iPhone","वेब पेज","ऐप"] 齐全（文档 08 §7.3 写的是"iPhone、वेब"，按文档 03 §3.8 / §1.6 把 K1 核心名词写全并补产品词"ऐप"，与 fr / de / uk 的做法一致）；K1 是产品 / 品类意图；没有禁用主词和 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[वेब पेज]]`（2 个词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 是"WordByWord … ऐप है।"（SOV 语序下的"是"字句），写明"भाषा सीखने वालों को"（为学外语的人） |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展只在 FAQ `safari`；Android 只在 FAQ `android`；桌面版只在 FAQ `devices`；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量（只写"कई शैलियाँ"）、口语练习、ChatGPT、"टीम / निर्माता"；CJK 原文不能双击查词、Chunks / Action Flow 仅英语都写了；没有 jargon"संरेखण"与"चुनते ही / टेक्स्ट चुन"（现有 claims-lint hi 规则）。附录 A 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required` 22 项，L-13 0 违规）；句子按 §7.3 写"दाईं ओर स्वाइप करें""डबल टैप करें"；按钮、页面、设置名照 App 原文引用：“अब अपग्रेड करें”、“खरीदारी पुनर्स्थापित करें”、“एआई वाक्य रचना व्याख्या प्राप्त करें”、“स्वाइप अनुवाद इतिहास”、“स्वचालित” / “अनुच्छेद” / “वाक्य दर वाक्य”、“अधिक परिभाषाएँ”、“खंड निष्कर्षण”、“वाक्य क्रिया प्रवाह”（glossary `contains`，L-13 通过）。X10：App 的 "AI पढ़ाई"（"पढ़ाई"是"学习"）不照抄，写"AI से पढ़कर सुनाना"；同样有问题的 "स्थानीय पढ़ाई"（Local Read）按规则 ③ 写成"स्थानीय आवाज़ से पढ़कर सुनाना"，glossary 把"पढ़ाई"列为禁用 |
| Q7 | ✓ | 5 处功能截图 alt、4 条画廊图注 + alt、`common.screenshotLabel`（"iPhone स्क्रीनशॉट (अंग्रेज़ी इंटरफ़ेस)"）/ `screenshotExcerptLabel`、OG alt、SE 截图 alt 与图注都注明"अंग्रेज़ी इंटरफ़ेस"；内容逐张对照 `assets/img/shot/en/*`（西语 Wikipedia 页 + 英文译文、"convirtiéndose"、"matrimonio"、Auto / Quote Style / Local Read / More Definitions / Syntax Explanations 按截图里的英文原样引用；朗读节选按 `f44fd7e` 的 en 新写法描述成"屏幕下方的朗读播放器正在读一句西语"；语言列表 alt 只列截图里看得见的语言——截图里看不到"हिन्दी"）；`features[x].alt` 描述社交帖样张并注明"स्क्रीनशॉट नहीं"；样张 `lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | full（local）：note 写"ऐप हिन्दी समेत 12 भाषाओं में"（含本语言，T6）；linkText = SE 核心词短语 + 品牌，不是裸域名（R76）；H2 以 SurfEnglish 开头；body 首句是条件句"अंग्रेज़ी सीख रहे हैं?"；没有"ज़्यादा उपयुक्त / की जगह / नया / तेज़ी से / अपग्रेड"（T10 种子与附录 A 的 `replacement-tone`、`se-hype` 0 命中）；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音 |
| Q9 | ✓ | 代入占位符后实测（附录 B），全部在 §7.6 / L-8 限内（天城文按"去掉非间距组合符号后的可见字符"计，alt 按字素计）。`features[devices].text` 正好 80 / 80 |
| Q10 | ✓ | 天城文：nukta 统一写成"基字 + U+093C"（NFC），而且凡是 f / z 音都带 nukta（मुफ़्त、अंग्रेज़ी、ज़्यादा、पैराग्राफ़、ब्राउज़र、इंटरफ़ेस、आवाज़…；App 自己写"मुफ्त"），glossary 禁用不带 nukta 的拼法和预组合字符 U+0958–095F；"AI""iPhone""App Store"保留拉丁字母；句末用「।」，问号用"?"；破折号、"·"前用不换行空格；没有 `{wbr}`（R61） |
| Q12 | ✓（副本） | 320–1280 px 无横向溢出、无字体回落（Kohinoor Devanagari）；375 px 下 H1 4 行；连字（क्ष、त्र、द्वि、स्व…）与上下标 matra 没有被裁；几个 App 名（"वाक्य दर वाक्य"、标题里的"खंड निष्कर्षण"）和 CTA 回顾的各要点用不换行空格连住，三个较长的 FAQ 问句（`safari`、`word-by-word`、`free`）末尾的"है? / हैं?"用不换行空格挂在前一个词上，避免孤字成行 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）没写扩展名称（"इसी डेवलपर का एक Chrome एक्सटेंशन तैयार हो रहा है"）；`aExtLive` 写了名称并注明只从该页面的链接安装；首页没出现 WordByWord.io |

## 3. 回译对照（hi → English，对照 en.json）

| 键 | hi | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord: iPhone के लिए द्विभाषी वेब पेज अनुवाद ऐप | WordByWord: Bilingual web page translation app for iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | भाषा सीखने वालों के लिए: WordByWord के ब्राउज़र में किसी पैराग्राफ़ को दाईं ओर स्वाइप करें, अनुवाद ठीक नीचे दिखेगा। किसी शब्द पर डबल टैप करके उसका अर्थ देखें। iPhone और iPad पर मुफ़्त। | For language learners: in WordByWord's browser, swipe a paragraph to the right — the translation will appear right below. Double-tap a word to see its meaning. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | वेब पेज दो भाषाओं में पढ़ें। [[मूल पाठ जस का तस।]] | Read web pages in two languages. [[The original, just as it was.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | पैराग्राफ़ को दाईं ओर स्वाइप करें · शब्द पर डबल टैप करें और संदर्भ के अनुसार अर्थ देखें | Swipe a paragraph to the right · double-tap a word and see its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | [[वेब पेज]] के किसी पैराग्राफ़ को दाईं ओर स्वाइप करें — अनुवाद ठीक उसके नीचे दिखेगा। | Swipe any paragraph of a [[web page]] to the right — the translation will appear right below it. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord भाषा सीखने वालों को पढ़ने में मदद करने वाला iPhone और iPad ऐप है। | WordByWord is an iPhone and iPad app that helps language learners read. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | ऐप के बिल्ट-इन ब्राउज़र में कोई वेबसाइट खोलें और किसी पैराग्राफ़ को दाईं ओर स्वाइप करें: अनुवाद ठीक उसके नीचे आ जाएगा। किसी शब्द पर डबल टैप करें, तो AI बताएगा कि वहाँ उसका क्या मतलब है। | Open a website in the app's built-in browser and swipe a paragraph to the right: the translation will appear right below it. Double-tap a word and AI will tell you what it means there. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | स्वाइप करके अनुवाद, डबल टैप करके अर्थ — उन वेबसाइटों पर जिन्हें आप पढ़ते हैं | Translation with a swipe, the meaning with a double tap — on the websites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | स्वाइप करें और मूल पाठ के ठीक नीचे अनुवाद पाएँ | Swipe and get the translation right below the original | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | शब्द पर डबल टैप करें — AI संदर्भ के अनुसार उसका अर्थ बताएगा | Double-tap a word — AI will tell you its meaning in context | Double-tap a word for its AI meaning in context |
| features[x].title | बिल्ट-इन ब्राउज़र में X (Twitter) पोस्ट का अनुवाद, मूल पोस्ट के साथ | Translating X (Twitter) posts in the built-in browser, alongside the original post | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | अंग्रेज़ी वाक्यों के लिए खंड निष्कर्षण और Action Flow | Chunk Extraction and Action Flow for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | AI आवाज़ में पढ़कर सुनाना, या डिवाइस पर iOS की तेज़ आवाज़ें | Reading aloud in an AI voice, or fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | लंबे वाक्यों के लिए AI से वाक्य संरचना का विश्लेषण | Analysis of sentence structure with AI, for long sentences | AI sentence structure analysis for long sentences |
| features[engines].title | क्लाउड या डिवाइस पर अनुवाद | Translation in the cloud or on the device | Cloud or on-device translation |
| features[display].title | अनुवाद का लेआउट और शैली | Layout and style of the translation | Translation layout and style |
| features[history].title | अनुवाद और शब्द खोज का इतिहास | History of translations and word lookups | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac और Vision Pro | iPhone, iPad, Mac and Vision Pro | （同左） |
| faq[what-is].q | WordByWord क्या है? | What is WordByWord? | （同左） |
| faq[whole-page].q | क्या WordByWord पूरा वेब पेज एक साथ अनुवाद कर सकता है? | Can WordByWord translate a whole web page at once? | （同左） |
| faq[safari].q | क्या यह Safari में या दूसरे ऐप्स के अंदर काम करता है? | Does it work in Safari or inside other apps? | （同左） |
| faq[word-by-word].q | क्या WordByWord शब्द-दर-शब्द अनुवाद करता है? | Does WordByWord translate word by word? | Is WordByWord a word-by-word translator? |
| faq[x].q | क्या WordByWord में X (पहले Twitter) पढ़ा जा सकता है? | Can X (formerly Twitter) be read in WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | WordByWord किन भाषाओं को सपोर्ट करता है? | Which languages does WordByWord support? | （同左） |
| faq[free].q | क्या WordByWord मुफ़्त है? रोज़ की सीमाएँ क्या हैं? | Is WordByWord free? What are the daily limits? | （同左） |
| faq[engines].q | यह कौन-सा अनुवाद इंजन इस्तेमाल करता है? | Which translation engine does it use? | （同左） |
| faq[account].q | क्या WordByWord इस्तेमाल करने के लिए अकाउंट ज़रूरी है? | Is an account required to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | नए iPhone या iPad पर WordByWord Plus फिर से कैसे पाएँ? | How do you get WordByWord Plus again on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | क्या इसका Android वर्ज़न है? | Is there an Android version of it? | Is there an Android version? |
| faq[english-learner].q | अंग्रेज़ी सीख रहे हैं? क्या SurfEnglish भी आज़माने लायक है? | Learning English? Is SurfEnglish worth trying too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | क्या WordByWord iPad, Mac या कंप्यूटर के ब्राउज़र पर चलता है? | Does WordByWord run on iPad, Mac or a computer's browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| pricing.summary | इन सीमाओं में हर सुविधा मुफ़्त है; Plus इन्हें $3.99/माह (अमेरिका) में बढ़ा देता है। | Within these limits every feature is free; Plus raises them for $3.99/month (USA). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | WordByWord के डेवलपर की ओर से | From the developer of WordByWord | （同左） |
| sibling.card.title | SurfEnglish: आपके स्तर की रोज़ की अंग्रेज़ी खबरें | SurfEnglish: daily English news at your level | （同左） |
| sibling.card.body | अंग्रेज़ी सीख रहे हैं? अपनी पसंद का कोई भी पेज WordByWord में पढ़ते रहें, और SurfEnglish भी आज़माएँ: स्तर के हिसाब से रोज़ की अंग्रेज़ी खबरें और दोहराने वाले गेम, उसी स्वाइप और डबल टैप के साथ। | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double tap. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | A1–C1 स्तरों की असली अंग्रेज़ी खबरें ／ आपके पढ़े हुए से बने दोहराने वाले गेम ／ Safari से अंग्रेज़ी लेख ऐप में शेयर करें | Real English news at levels A1–C1 / Review games built from what you've read / Share English articles from Safari to the app | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.note | शुरुआत मुफ़्त · iPhone और iPad · ऐप हिन्दी समेत 12 भाषाओं में · 21 भाषाओं में अनुवाद | Free to start · iPhone and iPad · App in 12 languages, Hindi included · Translation into 21 languages | Free to start · iPhone and iPad · App in 12 languages · Translations into 21 |
| sibling.card.linkText | SurfEnglish पर अपने स्तर की अंग्रेज़ी खबरें पढ़ें | Read English news at your level on SurfEnglish | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | App Store से SurfEnglish डाउनलोड करें | Download SurfEnglish from the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish की Games स्क्रीन (अंग्रेज़ी इंटरफ़ेस): सहेजे गए वाक्यों और शब्दों से खेलने के लिए Sentence Builder और Word Raid | SurfEnglish Games screen (English interface): Sentence Builder and Word Raid, to play with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | SurfEnglish का स्क्रीनशॉट (अंग्रेज़ी इंटरफ़ेस) | SurfEnglish screenshot (English interface) | （同左） |
| sibling.footer | इसी डेवलपर से ／ SurfEnglish: इंग्लिश न्यूज़ | From this developer / （SE 的 hi 店面名，不翻译） | More from the maker / SurfEnglish: Bilingual News |
| faq[english-learner].a | अपनी पसंद के पेज और X पोस्ट पढ़ने के लिए WordByWord इस्तेमाल करते रहें — चाहे वे अंग्रेज़ी में हों या किसी और भाषा में। अगर आप स्तर (A1–C1) के हिसाब से रोज़ की अंग्रेज़ी खबरें और सहेजे गए वाक्यों व शब्दों को दोहराने वाले गेम भी चाहते हैं, तो इसी डेवलपर का SurfEnglish यही देता है — उसी स्वाइप और डबल टैप के साथ। दोनों ऐप साथ-साथ इस्तेमाल किए जा सकते हैं। SurfEnglish की वेबसाइट | Keep using WordByWord to read the pages and X posts you choose — whether they are in English or any other language. If you also want daily English news by level (A1–C1) and games that review the sentences and words you've saved, SurfEnglish from the same developer gives you exactly that — with the same swipe and double tap. The two apps can be used side by side. SurfEnglish website | Keep using WordByWord for the pages and X posts you choose, in English or any other language. If you would also like daily English news sorted by level (A1–C1) and games that review the sentences and words you have saved, SurfEnglish, from the same developer, adds that with the same swipe and double-tap. The two apps work side by side. SurfEnglish website |
| cta.title | iPhone पर वेबसाइटें दो भाषाओं में पढ़ना शुरू करें | Start reading websites in two languages on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | स्वाइप से अनुवाद · डबल टैप से अर्थ · पढ़कर सुनाना · 21 भाषाएँ | Translation by swipe · meaning by double tap · read aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（表中 hi 为可读形式：实际 JSON 里破折号和"·"前是 U+00A0，复数对象已代入当前值，价格由构建按 `Intl.NumberFormat('hi')` 输出为"$3.99"。）

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下差异都有依据：

1. `meta.title` 写"अनुवाद ऐप"（翻译 App）而不是"translator"：hi 的产品词就是 ऐप（文档 03 §3.9 草案、§1.6 `primaryTokens.home.hi`）。
2. description 用"WordByWord के ब्राउज़र में"代替"in the built-in browser"（文档 03 §3.2 允许二选一；草案原样）；H1 / description / how 写了方向"दाईं ओर"（与 App 提示 `tip_swipe_to_translate`「किसी भी पाठ पर दाएं स्वाइप करें…」和文档 08 §7.3 一致；向左滑会删除译文，F14）。
3. OG 标题去掉了"any"（"कोई भी"）：保留它时标题只能排成 58 px，而且荧光笔短语挤在第 2 行（§0 第 7 条）；另外"原文原封不动"不写成祈使句"保留原文"，把"मूल पाठ … रखें"留给 G1。
4. hero.platformNote 不写美区价格数字，只写"Plus: मासिक सब्सक्रिप्शन"（D2，与 ja / zh-Hans / es / uk 相同）。
5. 价格表"∞"写"कोई सीमा नहीं"（没有上限），en 是"No daily limit"：天城文的"कोई दैनिक सीमा नहीं"在 375 px 的价格列里要折两行；App 对比页本身对这两行显示"असीमित"（不限），所以事实不变（只有本地引擎的 Plus 与 iOS 语音这两行）。
6. FAQ `x`、`english-learner` 问句不用第一人称：印地语的"我在学 / 我能"必须带性别（सकता / सकती，रहा / रही），改成被动或第二人称，意思不变。
7. FAQ `free` 把每项额度写成"N बार …"（N 次……），与 App 对比页的"दिन में %lld बार"同一说法。
8. 指向英文页面的两个富文本链接文字带"(अंग्रेज़ी में)" / "(अंग्रेज़ी पेज)"。
9. FAQ `safari` 答案末尾多了一处 Hinglish"website translate करें"（"然后就在那里滑动段落来 website translate"）：只是换了动词的说法，没有新事实（§6 第 6 条）。

## 4. 没把握的措辞（14 处，附回译与替代写法）

| # | 键 | hi | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | hero.lede / faq[what-is] / footer.tagline | …भाषा सीखने वालों को पढ़ने में मदद करने वाला iPhone और iPad ऐप है। | …an app that helps language learners read | …के लिए रीडिंग असिस्टेंट है（"a reading assistant for…"，更贴 R39 原文，但是 Hinglish）／ पढ़ने का सहायक ऐप | R39 定义句；"सहायक / असिस्टेंट"直译偏生硬，"帮助阅读的 App"更自然 |
| 2 | 全页 | बिल्ट-इन ब्राउज़र | built-in browser | ऐप का अपना ब्राउज़र（App 自己的浏览器）／ अंतर्निहित ब्राउज़र（App 用词，书面） | 印度科技媒体常用"बिल्ट-इन"；FAQ `safari` 用"इसका अपना ब्राउज़र" |
| 3 | features[speech].text / faq[engines].a | AI से पढ़कर सुनाना ／ स्थानीय आवाज़ से पढ़कर सुनाना | reading aloud with AI / reading aloud with the local voice | AI वाचन ／ स्थानीय वाचन（更短，"वाचन"=朗读，App 的"वाचन मोड"也用这个词） | X10 只给了 AI Read 的写法；Local Read 按同一结构类推。两者都不加引号，因为不是 App 的界面名（App 写的是有误的"…पढ़ाई"） |
| 4 | meta.ogHeadline | मूल पाठ जस का तस। | The original, just as it was. | मूल पाठ अपनी जगह पर।（原文在原处） | "जस का तस"是常用习语（原封不动），审校人可确认语感是否适合标题 |
| 5 | sibling.card.body / points / FAQ | दोहराने वाले गेम | games for going over (things) again | रिवीज़न गेम（印度英语"revision"=复习） | SE 印地语站写的是"गेम्स"；"दोहराना"是纯印地语"复习" |
| 6 | 全页 | सब्सक्रिप्शन | subscription | सदस्यता（App 用词，如"सदस्यता लें""सदस्यता की स्थिति"） | Apple 印地语界面写"सब्सक्रिप्शन"；口语也常用 |
| 7 | pricing.note / faq[account] / faq[restore] | Apple खाता ／ WordByWord अकाउंट | Apple Account / WordByWord account | Apple अकाउंट（统一用"अकाउंट"） | Apple 的印地语官方用"Apple खाता"；"अकाउंट"在网页语境更常见。两个词混用，请审校人定一个 |
| 8 | features[display].kicker | प्रदर्शन | display (also "performance") | डिस्प्ले | 与 App 的"अनुवाद परिणाम प्रदर्शन"一致，但单独看可能被读成"性能" |
| 9 | features[history].title | अनुवाद और शब्द खोज का इतिहास | history of translations and word lookups ("word search") | अनुवाद और देखे गए शब्दों का इतिहास | 表 B 的 K6 主词原样；"खोज"有被理解成浏览器搜索记录的风险（PRO-14），但前面有"शब्द"限定 |
| 10 | faq[safari].a | …फिर वहीं पैराग्राफ़ स्वाइप करके website translate करें। | …then translate the website right there by swiping paragraphs | …फिर वहीं स्वाइप करके अनुवाद करें।（去掉 Hinglish） | 文档 08 §7.7 建议正文自然出现一次；位置选在"逐段滑动"的语境里，避免被理解成整页翻译 |
| 11 | demo.lookup.note | इस वाक्य में यह फ़्रेज़ल वर्ब “end up” का हिस्सा है। | In this sentence it is part of the phrasal verb "end up". | …“end up” वाक्यांश का हिस्सा है।（短语的一部分） | "फ़्रेज़ल वर्ब"是印度英语教学的通行说法；纯印地语没有对应术语 |
| 12 | pricing.table.rows.syntax | एआई वाक्य रचना संरचना विश्लेषण | AI syntax structure analysis | AI वाक्य रचना विश्लेषण | App 对比页原名（`grammar_structure_analysis`，含 App 的"एआई"拼法）；"रचना संरचना"语义重复，是 App 原文的问题 |
| 13 | features[x].kicker / faq[x].q | X (पहले Twitter) | X (formerly Twitter) | X (पूर्व में Twitter)／एक्स (पहले ट्विटर) | §7.2.3 要求首次出现写"X（旧 Twitter）"格式，品牌保留拉丁字母 |
| 14 | features[chunks] / languages.limits / faq | खंड निष्कर्षण | chunk extraction (literally "segment extraction") | — | App 叫法，书面化；SE 印地语站把语块叫"शब्द समूह"。正文照引 App 名，附录 A 把两者都列入 SE 独占词 |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法**（xcstrings hi，引用处照原文）：अनुवाद के लिए स्वाइप करें（K1 功能名；hi 没有"右滑翻译"短名）；AI अर्थ के लिए डबल टैप करें；अधिक परिभाषाएँ；खंड निष्कर्षण；वाक्य क्रिया प्रवाह / क्रिया प्रवाह（正文括注一次，标题与表格用 App Store 名 Action Flow，D3）；एआई वाक्य रचना व्याख्या प्राप्त करें（按钮）；एआई वाक्य रचना संरचना विश्लेषण（价格表行名，取自 App 对比页）；AI उच्चारण (शब्द / वाक्य)；क्लाउड अनुवाद इंजन / स्थानीय इंजन；स्वचालित / अनुच्छेद / वाक्य दर वाक्य；अनुवाद मोड；वाचन मोड；स्वाइप अनुवाद इतिहास；अब अपग्रेड करें；खरीदारी पुनर्स्थापित करें。
- **AI 与 एआई**：正文一律写拉丁字母"AI"（§7.7）；只有引用 App 的 K4 名称时保留 App 的"एआई"（glossary 只在这两个键放行）。
- **称谓**：आप（礼貌祈使 -एँ / -ें）。WordByWord 与"ऐप"按阳性处理（"WordByWord … करता है"）；开发者 Jinlong 用敬语复数（"Jinlong बनाते हैं"）。问句避免第一人称（性别）。
- **拼写**：nukta 统一（फ़ / ज़ 音一律加点：मुफ़्त、अंग्रेज़ी、ज़्यादा、पैराग्राफ़、ब्राउज़र、इंटरफ़ेस、आवाज़、फ़िलहाल、कॉफ़ी、फ़ॉलो…）；ख / ग / क 不加点（खबरें、गौर、आखिर，与 SE 印地语站一致）；"हिन्दी"按语言切换器写法；"वेब पेज"两个词；手势统一"दाईं ओर स्वाइप करें""डबल टैप"（不写"दो बार टैप""डबल-टैप"）。
- **排版**：句末「।」，问句"?"；引号“ ”；破折号与"·"前用 U+00A0；数字用西式数字（与 `Intl.NumberFormat('hi')` 默认一致）。
- **X**：kicker 与 FAQ 问句写"X (पहले Twitter)"，其余写 X；帖子叫"पोस्ट"（阴性）。
- **Apple 用语**：Apple खाता；Apple सिलिकॉन वाले Mac；"{minOS} या उसके बाद का वर्ज़न"。徽章是 en-us 英文图（"Download on the App Store"），`appStoreBadgeAlt` 写印地语"App Store से WordByWord डाउनलोड करें"（§6 第 8 条）。
- **SE 文案**：footer 用文档 04 §5.5 的 hi 值（栏标题"इसी डेवलपर से"，链接文字是 SE 的 hi 店面名"SurfEnglish: इंग्लिश न्यूज़"）；linkText 没有照搬 §5.7 种子"अनुवाद के साथ अंग्रेज़ी खबरें — SurfEnglish"，按 T7"语义以 en 为准"写成"…अपने स्तर की अंग्रेज़ी खबरें…"。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，`home-hi.jpg` 与 `og.json` 没有复制进真实仓库。hi.json 入库后，`node build.mjs` 会报 `D-23 home-hi: no OG image`，直到负责人跑 `node scripts/og.mjs --only home-hi`（HEAD `ee73df7` 新副本实测：64 px × 2 行、副标题 30 px × 2 行、q82、142.5 KB）。
2. **hi lint 词表**：`docs/redesign-2026/ops/m3/hi-lint.json`（附录 A）覆盖 25 条规则 + `seOwned`（追加 5 条）/ `seOwnedLead` / `reserved.G1`。副本合入后：全站（26 页）build 与 `--pseudo` 0 error、`check.mjs` 0 / 0、测试 63/63，hi 的 L-14 / L-9 警告消失；反例句 103 条全部命中，必须放行的 49 条全部放行；另外往副本的 hi.json 注入了 16 处违规，L-9 / L-13 / L-14 全部报出。附带建议：L-14 / L-9 匹配前可以先做 NFC 规范化——天城文 nukta 字母有预组合形式（U+0958–095F），NFC 会把它们拆开；hi 的 glossary 已禁止预组合形式，所以 hi 文案本身没问题。
3. **OG 模板不认「।」**：`src/templates/og.mjs` `ogCopy()` 只在 `[.:!?。：！？]` 之后给荧光笔短语换行。hi（以及用「।」的语言）的句号是 U+0964，所以"…पढ़ें। [[…]]"时荧光笔短语不会单独起行。hi 用"第一句正好占满一行"的写法绕开了；建议把 `।` 加进这个字符类（改模板会让所有 OG 的模板哈希变化，需要重跑 `npm run og`）。
4. **报给 App 侧的 hi 字符串问题**（规则 ③，网站不照抄或照引并说明）：① `audio_playback_title_streaming` = «AI पढ़ाई»（X10）**和** `audio_playback_title_local` = «स्थानीय पढ़ाई»：都是"学习"不是"朗读"，X10 只列了前一个；建议 «AI से पढ़कर सुनाना / स्थानीय आवाज़ में पढ़कर सुनाना» 或 «AI वाचन / स्थानीय वाचन»；② "AI"与"एआई"混用（AI उच्चारण / AI अर्थ… 与 एआई वाक्य रचना…）；③ «मुफ्त» 不带 nukta，同一界面"आवाज़"又带；④ `Audio Playback Mode Settings` = «पठन मोड सेटिंग्स» 而 `setting_title_audio_playback_mode_selection` = «वाचन मोड»（同一设置两个名字）；⑤ «मैनुअल» / «मैन्युअल»、«दाएँ» / «दाएं» 两种拼法并存；⑥ `user_type_not_subscribed` = «असदस्ताक्षरित»（不是词；`not_subscribed_label` 是 «असदस्यित»）；⑦ `tip_double_tap_context_meaning` 的 «संदर्भित अर्थ» 是"被引用的意思"，应为 «संदर्भ के अनुसार अर्थ»；⑧ `search_or_enter` = «URL खोजें या दर्ज करें»（"搜索 URL 或输入"），应为 «खोजें या URL दर्ज करें»；⑨ `free_tts_limit_message` «अपनी सभी मुफ्त उच्चारण»、`more_definitions_trial_exhausted_message` «अपनी सभी मुफ्त परीक्षणों»：阳性名词配了阴性 «अपनी»；⑩ `double_tap_not_supported_message` 用 «चाइनीज»（其余语言名都是印地语 «जापानी / कोरियाई»，应为 «चीनी»），而且把查词叫"डबल-टैप अनुवाद"。
5. **`meta.appStoreSubtitle`**：印度区店面的 hi 副标题没有资料（研究 05 §2.1 只列了 US/JP/CN/TW/KR/DE），现值"स्वाइप से अनुवाद, AI से व्याख्या"是 US 副标题的译文；该键只在 en 的 about 页用，hi 页面不渲染。拿到 App Store Connect 的 hi 副标题后替换。
6. **Hinglish"website translate"**：文档 08 §7.7 / 文档 03 §2.3 允许正文出现一次。我放在 FAQ `safari` 答案的最后一句（逐段滑动的语境，不会被读成整页翻译）。如果负责人觉得混写不合适，替代句见 §4 第 10 条（同时把 `seo.keywords.K1.secondary` 里的 "website translate" 留作参考词即可）。
7. **`seo.titleMust`**：文档 08 §7.3 写的是"iPhone、वेब"，我按文档 03 §3.8 / §1.6 写成 ["iPhone","वेब पेज","ऐप"]（K1 核心名词写全 + 产品词），请确认。
8. **徽章 alt 与图上文字不同语言**：hi 用 en-us 徽章（图上是英文"Download on the App Store"），alt 写印地语。屏幕阅读器用户听到的是本页语言，但严格按 WCAG 2.5.3（label in name）可能要求包含图上文字。我倾向保留印地语；如需对齐，可写成"App Store से WordByWord डाउनलोड करें (Download on the App Store)"。
9. **页脚里指向英文页的链接**（WordByWord के बारे में、सहायता、गोपनीयता नीति、"Jinlong द्वारा बनाया गया"）没有加"(अंग्रेज़ी में)"：这次只给富文本链接加了标记，页脚标签是通用键（与 uk / de 的处理相同）。
10. **母语审校**：按 R36，hi 上线后补母语审校（文档 04 T11 把 hi 列为优先）；请审校人重点看 §4 的 14 处和 SE 卡片，以及 nukta 拼写策略（§5）。

## 附录 A：建议的 hi lint 词表（`docs/redesign-2026/ops/m3/hi-lint.json`）

覆盖范围：`claims-lint.json` 中所有有按语言写法、且还没有 hi 键的规则（25 条，含同时有 `*` 和按语言写法的 `hype`）；跳过 `selection-translate`、`jargon`（已有 hi）和 `io-home`、`engine-claim`（只有 `*`）。`keywordMap` 对应 `seOwned.hi`（追加）、`seOwnedLead.hi`（新建）、`reserved.G1.hi`（新建）。

写法要点：自 `bb689eb` 起数据文件里的 `\w`、`\W`、`\b` 覆盖所有文字的字母、组合符号与数字，所以 hi 模式直接用 `\b`（天城文词可能以元音符号结尾，那是 `\p{M}` 不是 `\p{L}`，`(?<![\p{L}])` 一类写法在这里会漏判）；nukta 写成"基字 + U+093C"，`ज़?` / `फ़?` 表示 nukta 可有可无，这样不带点的拼法也能命中；印地语后置词结构用 `(\S+\s+){0,3}` 容纳中间的词。

**自测**（`scratchpad/hi-work/hi-lint-test.mjs`，用副本里的 `compileAll` 编译，与校验器同一套 u + i 标志）：反例句 103 条全部命中，必须放行的 49 条全部放行；合入 HEAD `ee73df7` 新副本后全站 0 error（hi 文案 0 命中；其余 18 个已发布语言的 H2 也不命中 `seOwnedLead.hi`）。另用合入后的全部 hi 规则扫了一遍旧站 hi 翻译记忆（`_legacy/hi.json` 与 `sibling-tm.json` 的 hi 段）：带 warnings 的旧句里，划词即译、句子对齐、语言对、初始版本、自动识别目标语言、按日期分组、主题与暗色、快捷键与音量、抢先体验、隐私断言、口语练习（"सुनें और बोलें"）、无限 AI 发音（"असीमित और उच्च गुणवत्ता वाला AI उच्चारण"）、端侧 / 离线语音、SE 的"नया / तेज़ी से"、"WordByWord टीम"都被命中（后两条是扫描时发现漏判后补的写法）；没被命中的是"स्मार्ट … सहायक"式标题、"免费 20 次 AI 发音"这类没有对应规则的旧事实，以及"हमारा AI"一类第一人称（en 规则同样只拦"our team"）。

**反例句（每条规则选列；全部命中各自规则）**：

| 规则 | 反例句 |
|---|---|
| whole-page | एक टैप में पूरे वेब पेज का अनुवाद करें। ／ पूरी वेबसाइट का एक साथ अनुवाद। ／ वन-टैप अनुवाद, किसी भी साइट पर। |
| swipe-left | अनुवाद देखने के लिए पैराग्राफ़ को बाईं ओर स्वाइप करें। ／ बाएँ स्वाइप करते ही अनुवाद। ／ लेफ़्ट स्वाइप से अनुवाद खोलें। |
| safari-extension | यह एक Safari एक्सटेंशन है। ／ किसी भी ऐप में तुरंत अनुवाद करें। ／ ऐप बदलने की ज़रूरत नहीं।（旧站原句） |
| offline | ऑफ़लाइन अनुवाद भी काम करता है। ／ बिना इंटरनेट के अनुवाद करें। ／ इंटरनेट कनेक्शन की ज़रूरत नहीं। |
| unlimited-ai-voice | • असीमित और उच्च गुणवत्ता वाला AI उच्चारण（旧站原句） ／ AI आवाज़ में बिना किसी सीमा के सुनें। ／ AI उच्चारण पर कोई सीमा नहीं। |
| dark-mode-theme | डार्क मोड और कस्टम थीम के साथ। ／ अपनी पसंद की रंग योजना चुनें। |
| shortcuts-volume | अनुवाद के शॉर्टकट बदलें और वॉल्यूम समायोजित करें।（旧站同义句） |
| vocab-sync | शब्दों को फ़्लैशकार्ड में सहेजें। ／ iCloud सिंक से सभी डिवाइसों में। ／ नए शब्दों की सूची रोज़ दोहराएँ। |
| android | Android वर्ज़न जल्द आ रहा है। ／ Google Play से डाउनलोड करें। ／ एंड्रॉइड फ़ोन पर चलाएँ। |
| desktop-version | WordByWord का डेस्कटॉप ऐप भी है। ／ Windows के लिए उपलब्ध। ／ कंप्यूटर के लिए ऐप डाउनलोड करें। |
| x-app | X ऐप में सीधे अनुवाद करें। |
| plus-early-access | Plus सदस्यों को नई सुविधाओं का अर्ली एक्सेस। ／ नई सुविधाओं का जल्दी एक्सेस।（旧站原句） |
| privacy-claim | कोई व्यक्तिगत डेटा एकत्र नहीं किया जाता।（旧站原句） ／ ट्रैकिंग नहीं। |
| initial-version | प्रारंभिक संस्करण में 20+ भाषाओं का समर्थन है।（旧站原句） |
| language-pairs | 20+ भाषा जोड़ों का समर्थन।（旧站原句） |
| style-count | 8 तरह की अनुवाद शैलियाँ। ／ आठ शैलियों में से चुनें। |
| auto-detect-target | ऐप स्वतः लक्ष्य भाषा पहचानता है।（旧站原句） ／ अनुवाद की भाषा अपने आप तय होती है। |
| history-by-date | इतिहास तिथि के अनुसार समूहित होता है।（旧站同义句） |
| plus-only | वाक्य रचना विश्लेषण सिर्फ़ Plus में। ／ केवल Plus उपयोगकर्ताओं के लिए। |
| speaking-practice | सुनने और बोलने की क्षमता एक साथ बढ़ाएँ।（旧站原句） ／ AI उच्चारण, सुनें और बोलें（旧站标题） ／ बोलने का अभ्यास करें। |
| replacement-tone | अंग्रेज़ी के लिए SurfEnglish आपके लिए ज़्यादा उपयुक्त हो सकता है।（文档 04 T10 种子） ／ WordByWord की जगह SurfEnglish आज़माएँ। ／ SurfEnglish, WordByWord का सिस्टर ऐप। |
| se-on-device-voice | डिवाइस पर चलने वाली AI आवाज़ से सुनें। ／ AI आवाज़, ऑफ़लाइन भी।（旧 SE 推广原句；规则只作用于 SE 卡片与 FAQ `english-learner`） |
| se-hype | नया: SurfEnglish के साथ और तेज़ी से अंग्रेज़ी सीखें। ／ अपग्रेड करें।（同上，另含 `sibling.footer`、`about.family`） |
| hype | सबसे अच्छा अनुवाद ऐप ／ दुनिया का पहला द्विभाषी ब्राउज़र ／ 10,000+ डाउनलोड ／ WordByWord टीम की ओर से ／ इकलौता ऐप |
| ext-language-count | 20 भाषाओं में अनुवाद करता है।（只作用于 `chromeExtension.*`；hi 目前没有扩展页） |
| seOwned | अनुवाद के साथ अंग्रेज़ी खबरें ／ अंग्रेजी सीखने का ऐप ／ इंग्लिश न्यूज़ पढ़ें ／ खंड निष्कर्षण के साथ ／ शब्द समूह अपने आप हाइलाइट |
| seOwnedLead | अंग्रेज़ी सीख रहे हैं? SurfEnglish आज़माएँ ／ क्या आप अंग्रेज़ी सीख रहे हैं? |
| reserved.G1 | iPhone पर वेब पेज का अनुवाद कैसे करें ／ मूल पाठ रखें और अनुवाद देखें ／ अनुवाद का आसान तरीका ／ स्टेप बाय स्टेप गाइड |

**必须放行**（0 命中）：«भाषा सीखने वालों के लिए»、«असली वेबसाइटें पढ़कर भाषा सीखने वालों के लिए बनाया गया।»、«अंग्रेज़ी पैराग्राफ़ के ठीक नीचे उसका हिन्दी अनुवाद»、«अंग्रेज़ी पेज»、«सिर्फ़ अंग्रेज़ी»（文档 03 §1.4：不含"学英语"意图的说法归 WBW）；`seOwnedLead` 对 hi 页全部 H2（«SurfEnglish: आपके स्तर की रोज़ की अंग्रेज़ी खबरें»«WordByWord के बारे में सवाल»等）不命中；G1 模式对 hi 的 title、H1、description、`cta.title` 不命中；相邻规则的易误伤句也放行：«iOS की आवाज़ों पर कोई दैनिक सीमा नहीं है।»（unlimited-ai-voice）、«पेज की भाषा … अपने आप पहचानी जाती है»（auto-detect-target）、«कीमतें क्षेत्र के हिसाब से अलग होती हैं»（history-by-date）、«मुफ़्त डाउनलोड»«दिन में 50 बार»（hype）、«WordByWord Plus एक मासिक सब्सक्रिप्शन है»（plus-only）。

合入前请母语审校再看一遍：`hype` 的 `\b(इकलौता|इकलौती|एकमात्र)\b`（可能误伤"唯一的账户"一类正常说法）、`se-hype` 的 `\bनई\b` / `\bनए\b`（只作用于 SE 区块）、`dark-mode-theme` 的 `\bथीम`（App 本身有一个"थीम"按钮字符串 `button_text_theme`，但 WBW 没有主题功能）。

## 附录 B：验证记录

最终验证在 `scratchpad/wbw-m3-hi-final/`（`git archive` 真实仓库 HEAD `ee73df7`，含已入库的 en / zh-Hans / zh-Hant / ja / ko / es / pt-BR / fr / de / it / nl / pl / uk / ru / tr / vi / id / th），加入 `hi.json`、`glossary/hi.json`，并在副本里生成 `home-hi` OG。

| 命令 | 结果 |
|---|---|
| `node scripts/og.mjs --only home-hi` | ✓ headline 64 px × 2、sub 30 px × 2、q82、142.5 KB |
| `node build.mjs` | 26 页，0 error；hi 的 W：L-4（6 个预期相同值）、L-14（24 条规则无 hi 词表）、L-9（无 hi G1 模式） |
| `node build.mjs --pseudo --out …/dist-pseudo` | 0 error |
| `node scripts/check.mjs` | 26 个 HTML，0 error，0 warning |
| `node scripts/check.mjs --keys hi` | 0 missing，0 not in en |
| `node --test scripts/tests/*.test.mjs` | 63 pass，0 fail |
| 合入 `hi-lint.json` 后 build / `--pseudo` / check / 测试 | 0 error / 0 error / 0·0 / 63 pass；hi 的 L-14、L-9 W 消失 |

长度实测（占位符代入后，`text-length.mjs` 口径：天城文为去掉非间距组合符号后的可见字符，alt 为字素）：title 47 / 60；description 156（100–160）；H1 66 / 75；eyebrow 49 / 60；lede 68 / 90；ctaNote 28 / 40；how 159 / 180；platformNote 125 / 140；secondaryCta 16 / 24；kicker ≤ 22 / 24（swipe 20、lookup 22）；功能 H3 ≤ 57 / 70；功能正文 ≤ 242 / 320；规格清单 72 / 59 / 58 / 80（≤ 80）；`languages.title` 35 / 70；`pricing.summary` 67 / 100；`cta.title` 38 / 70；`cta.recap` 52 / 90；SE title 40 / 60、body 37 词 / 45、要点 28 / 28 / 29（≤ 45）、linkText 38 / 60、appStoreLinkText 34 / 60；FAQ 问句 ≤ 53 / 120、答案 ≤ 402 / 600；`common.screenshotExcerptLabel` 38 / 40；所有 alt ≤ 92 / 125；样张译文合计 92 / 180。

渲染（headless Chrome + `scripts/serve.mjs --port 4611`，HEAD `ee73df7` 的 CSS，浅色，FAQ 展开测卡片、收起测页高）：

| 宽度 | 横向溢出 | H1 行数 | SE 卡片高度（上限） | 价格表 | 页眉按钮 |
|---|---|---|---|---|---|
| 320 | 无 | 5 | 460（560） | 放得下（单元格换行，`54afac8` 之后） | डाउनलोड（< 360 只显示图标，字标不被压） |
| 375 | 无 | 4 | 419（480） | 放得下 | डाउनलोड |
| 390 | 无 | 4 | 419（480） | 放得下 | डाउनलोड |
| 414 | 无 | 4 | 419（480） | 放得下 | डाउनलोड |
| 768 | 无 | 3 | 312（480） | 放得下 | डाउनलोड करें |
| 900 | 无 | 4 | 392（420） | 放得下 | डाउनलोड करें |
| 1280 | 无 | 4 | 338（420） | 放得下 | डाउनलोड करें |

390 px、FAQ 收起时页面高度：hi 12,888 px（en 12,943、uk 13,685、th 12,973、vi 13,025；R20 / R69 目标 ≤ 13,000）。手机首屏样张的红色译文条：390 × 844 视口下在 y 753–795 px，完整可见（R69；en 735–795）；375 × 812 下在 770–812 px。
