# M3 · ar（العربية，RTL）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | ar（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校；文档 04 T11 把 ar 列为优先补审的语言） |
| 交付 | `src/locales/ar.json`（新建）；`src/data/glossary/ar.json`（新建，§7.2.5 格式）；`docs/redesign-2026/ops/m3/ar-lint.json`（claims-lint / keyword-map 的 ar 词表提案，未合入数据文件）；本记录 |
| 依据 | 文档 08 §7（7.1–7.10，重点 §7.7 RTL）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（ar 行，表 A / B / C 与 ar 写方向的裁定）、§3.1–§3.9（ar 草案）、§4.3；文档 04 §5.1、§5.5、§5.7（ar 的 linkText 种子、页脚、T1–T11）；文档 05 §5.2.6、§9.2（RTL）；裁定 R36、R39–R43、R46、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照，es / ko / pt-BR 作 full 模式参照 |
| App 叫法来源 | `/Users/ike/Dev/WordByWord/WordByWordPrototype/Localizable.xcstrings` 的 ar 值（逐键抽取，与文档 08 表 T-A…T-E 的 ar 列逐条一致）；价格表行名对照 App 的免费 / Plus 对比页（`FeatureQuotaManager.swift` 的 `featureDisplayName`）；SE 的阿语用词对照 SE 官网 `SurfEnglishWebsite/src/locales/ar.json` |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-ar/` 中写作、构建、渲染检查；文案由生成脚本输出（复数对象按六个 CLDR 类别统一生成）；OG 图只在副本里生成，**没有**复制进真实仓库；最终验证在真实仓库最新 HEAD 的新副本 `scratchpad/wbw-m3-ar-final/` 上重跑 |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys ar`：0 缺、0 多；与其他 locale 一样不提供 `about.*`、`chromeExtension.*`、`legal.*`，提供 `notfound.*`）。在真实仓库最新 HEAD 的新副本里加入 ar 并生成 `home-ar` OG 图后：`node build.mjs` 与 `--pseudo` 均 **0 error**，`node --test scripts/tests/*.test.mjs` 全部通过，`scripts/check.mjs` 0 error / 0 warning（数字见附录 B）。
2. ar 自己的 warning：L-4 7 条（6 条是文档 08 §1.5 预期的样张英文原句 / 虚构账号，另 1 条是 `meta.appStoreSubtitle`，见 §6 第 4 条）；数据文件还没有 ar 词表，所以另有两条汇总 W：L-14"ar 未覆盖 24 条规则"、L-9"ar 没有 G1 how-to 模式"。我起草了 `docs/redesign-2026/ops/m3/ar-lint.json`（附录 A），只在副本里合入自测：ar 文案 0 命中，25 条规则和 3 组关键词模式全部命中反例；合入后 ar 只剩 L-4。没有 L-8 长度警告（ar 的 kicker 都在 24 以内）。
3. title、description 逐字采用文档 03 §3.9 的 ar 草案（n60、n157）；H1 用草案句子，只把"صفحة الويب"改为"أي صفحة ويب"（对应 en 的 any web page，n74），荧光笔标 K1 名词"صفحة ويب"（2 个词）。工作途中在较早的 HEAD 上发现：阿语标题沿用拉丁的 1.08 行高时，荧光笔一旦落在第二行，黄色底色会盖住上一行 ب ي 下方的点（"اسحب"的点、OG 标题里"أي"被盖成"أى"）；负责人的 6439eb5 已按文档 05 §3.3 把阿语标题行高设为 1.35，我在 HEAD 189a224 上用 9 种宽度复核：荧光笔始终是一整块、不再遮挡（§7）。
4. 手势：句中统一写"اسحب الفقرة لليمين"（向右，R63），样张提示 `demo.ui.swipeCue` 写 App tip 原文"اسحب لليمين"；双击统一写 App 的"انقر نقرًا مزدوجًا"。kicker 和价格表用 App 功能名"اسحب للترجمة""انقر نقرًا مزدوجًا للبحث"。全文没有"左滑"、单击查词或"选中即译"。
5. 复数：ar 的 CLDR 类别是 zero / one / two / few / many / other。所有"数字占位符 + 名词"（9 个键、16 个复数对象）都写了六个类别，并按格处理双数（属格"لغتين"、主格"لغتان"、宾格"ترجمتين"）和 3–10 / 11–99 / 100+ 的数名搭配（"5 لغات""21 لغة""100 لغة"；"5 شروح نحوية""20 شرحًا نحويًا""100 شرح نحوي"）。用 0、1、2、5、11、21、100、103 逐一代入核对过（§2 Q2）。数字一律西式（与 App 的 `%lld` 一致；`Intl.NumberFormat('ar')` 在 Node 24 / ICU 78 下也输出西式数字）。
6. SurfEnglish：ar 的 `seMode` = local（full）。卡片 note 写"界面含阿拉伯语等 12 种"，`linkText` 用文档 04 §5.7 的 ar 种子"أخبار إنجليزية مع الترجمة — SurfEnglish"，链 SE 阿语页；页脚用文档 04 §5.5 的"من المطوّر نفسه"与"SurfEnglish: أخبار إنجليزية"；FAQ `english-learner` 不加界面说明句（SE 有阿语界面）。
7. RTL：页面 `dir="rtl"`，机身内部保持 LTR，阿语译文行（`.wb-tr`、`.post-tr`）和查词卡（`.wb-card`）为 RTL，红条留在左侧，滑动提示从左向右（模板实现，已在三种宽度目视确认）。样张图注按文档 05 §5.2.6 加了"阿拉伯语按从右到左排版"一句。没有手工插入 RLM / LRM（glossary 禁止）；多词拉丁专名（Action Flow、App Store、Apple Vision Pro、WordByWord Plus）在可见文案里用不换行空格，避免在 RTL 换行时被拆成两半。`{minOS}+` 这类"拉丁 + 加号"写法在 RTL 段落里会显示成"+iOS 18"，所以规格清单写"{minOS} فأحدث"（"或更新"）。
8. OG（只在副本）：`node scripts/og.mjs --only home-ar` 通过，**64 px × 2 行**、副标题 30 px × 2 行、126.7 KB，版式为镜像（文字在右、面板在左）。标题与 en 同构："اقرأ المواقع بلغتين. [[الأصل في مكانه.]]"（读网站用两种语言。原文留在原处。）；更贴字面的"اقرأ أي صفحة ويب بلغتين. …"只能排到 60 px（§4 第 3 条）。
9. 渲染（HEAD 新副本 + `scripts/serve.mjs` 端口 4610 + 本机 headless Chrome，屏蔽外网）：1280 / 390 / 375 / 320 px 都没有横向溢出；SE 卡片 339 / 421 / 421 / 421 px（上限 420 / 480 / 480 / 560）；390 px 整页 12,751 px（同一构建 en 12,943、hi 12,888、th 12,973、es 13,209）；样张红色译文条顶端 761 px（390×844，距底 83 px）。
10. 需要负责人处理的事见 §6，主要是：OG 图入库、是否合入 ar lint 词表、价格在 RTL 里显示成"$US 3.99"、SE 卡片的"→"在 RTL 下不镜像、`meta.appStoreName` / `appStoreSubtitle` 取值、一批 App 阿语字符串问题。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | «WordByWord: تطبيق ترجمة ثنائية اللغة لصفحات الويب على iPhone» | 品牌位 WordByWord（SA 店面名是 "WordByWord Translate"，但文档 03 §1.5 / 08 §7.3 规定 ar 品牌位用 "WordByWord"）；K1 主词「تطبيق ترجمة ثنائية اللغة لصفحات الويب على iPhone」**逐字完整**（文档 03 §2.3 表 A）；`seo.titleMust` = iPhone / لصفحات الويب / تطبيق 全部命中；`primaryTokens.home.ar`（iPhone、تطبيق）命中 | n60（上限 60） |
| `meta.description` | «لمتعلمي اللغات: في متصفح WordByWord، اسحب أي فقرة إلى اليمين فتظهر ترجمتها أسفلها. انقر نقرًا مزدوجًا على كلمة لتعرف معناها حسب السياق. مجاني على iPhone وiPad.»（草案原样） | 受众词「لمتعلمي اللغات」（表 C，R39；文档 03 §1.4 列为必须放行的通用学习词）；K1 动作 + 结果（向右滑段落 → 译文在下方）在前一半，写了方向（R63）；"في متصفح WordByWord"满足文档 03 §3.2 的"内置浏览器"要求；K2「معناها حسب السياق」；平台 + 免费收尾（SEO-11）；"الآيفون"按 §3.2 放在 FAQ 问句里 | n157（区间 120–160） |
| `hero.title`（H1） | «اسحب فقرة من أي [[صفحة ويب]] لليمين، فتظهر ترجمتها تحتها ويبقى الأصل في مكانه.»（草案句子，加"أي"） | K1 核心名词「صفحة ويب」（荧光笔，2 个词，R65）+ 段落一级的动作 + 结果（R46、PRO-19），写了方向「لليمين」（R63）；不含品牌（R27）；没有 how-to 句式 | n74（上限 75） |
| `hero.eyebrow` | «WordByWord · قراءة الويب بلغتين لمتعلمي اللغات» | 品牌 + 品类（双语读网页）+ 受众 | 46 wu（上限 60） |
| `hero.lede` = `ledeShort` | «WordByWord هو مساعد قراءة لمتعلمي اللغات على iPhone وiPad.» | R39 定义句，以"WordByWord هو"开头；"مساعد قراءة"只用在定义句、FAQ `what-is` 和页脚 tagline（D13） | n58（≤ 90，故与 ledeShort 相同） |
| `meta.ogHeadline` | «اقرأ المواقع بلغتين. [[الأصل في مكانه.]]» | K1 场景（双语读网站）+ 原文保留，与 en 同构；荧光笔 1 处；没用 G1 的"الاحتفاظ بالأصل"一类说法 | 64 px × 2 行 |
| 功能区 H2 | «اسحب للترجمة، وانقر نقرًا مزدوجًا لمعرفة المعنى — في المواقع التي تقرؤها» | K1 / K2 的手势 + 结果（App 功能名"اسحب للترجمة"）；"في المواقع التي تقرؤها"（PRO-16，不写"任何网站"） | n70 |
| 功能 H3 | K1「اسحب للترجمة: تظهر الترجمة أسفل النص الأصلي مباشرة」；K2「انقر نقرًا مزدوجًا على كلمة ليشرح الذكاء الاصطناعي معناها حسب السياق」；K9「اقرأ منشورات X (تويتر) بلغتين في المتصفح المدمج」；K5「استخراج المقاطع وAction Flow للجمل الإنجليزية」（R83 带"الإنجليزية"）；K3「القراءة بصوت الذكاء الاصطناعي، أو بأصوات iOS السريعة على الجهاز」；K4「تحليل بنية الجمل الطويلة بالذكاء الاصطناعي」；K7「ترجمة سحابية أو على الجهاز」；K6「سجل الترجمات والبحث عن الكلمات」 | K3、K6、K7 与表 A / B 主词逐字一致；K1 次词「الترجمة أسفل النص الأصلي」；K2「معناها حسب السياق」+ 「الذكاء الاصطناعي」、K4「تحليل بنية … بالذكاء الاصطناعي」、K9「منشورات X (تويتر)」为主词的语序 / 词形变体 | 全部 ≤ 70 wu（最长 66） |
| 语言段 H2 | «الترجمة إلى 21 لغة، من الإنجليزية ومن غيرها»（复数对象） | K8 主词「الترجمة إلى 21 لغة」逐字 | 43 wu |
| 价格段 H2 | «مجاني كل يوم، وارتقِ إلى Plus حين تقرأ أكثر» | K10「مجاني」+ Plus | — |
| 最终 CTA H2 | «ابدأ قراءة المواقع بلغتين على iPhone» | 动作句，不是 G1 标题，不暗示整页（R46） | 36 wu |
| FAQ `devices` 问句 | «هل يعمل WordByWord على الآيفون والآيباد وMac، أو في متصفح على الكمبيوتر؟» | SEO-11 的本地写法「الآيفون」（文档 03 §4.3 指定的位置；glossary 禁止它出现在别处） | n72 |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有的"تعلم الإنجليزية"，以及附录 A 建议新增的"أخبار إنجليزية""قراءة الإنجليزية""استخراج المقاطع""مجموعات الكلمات"）；title / H1 / description / `cta.title` 里没有 how-to 句式（附录 A 的 G1 模式"كيف / كيفية / طريقة + ترجم""الاحتفاظ بالأصل"0 命中）。

## 2. Q1–Q10 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 能解析；键与 en 一致（`--keys ar` 0 缺 0 多；`notfound.*` 照 ja / zh-Hans 提供）；HEAD 新副本 build / `--pseudo` 0 error，`check.mjs` 0 error，测试全部通过（附录 B）。真实仓库在生成 `home-ar` OG 图之前会报 D-23（§6 第 2 条） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）；没有写死额度、价格、语言数（L-12 0 条）。复数对象 16 处（9 个键），六个类别全写：`gallery.items[languageList].caption`、`languages.title / uiCount / targetCount`、`pricing.table.perDay`、`faq.items[languages].a`（2 处）、`faq.items[free].a`（6 处）、`sibling.card.note`（2 处）、`cta.recap`。当前值渲染为"21 لغة""بـ 20 لغة""بـ 12 لغة""50 مرة يوميًا""10 مرات يوميًا""5 مرات يوميًا""100 مرة يوميًا""50 ترجمة""20 عملية بحث""30 عملية استخراج""20 عملية Action Flow""5 شروح نحوية"；0 / 1 / 2 / 5 / 11 / 21 / 100 / 103 逐一代入也都合语法（如"لغة واحدة""لغتين / لغتان""ترجمتين""شرحًا نحويًا واحدًا""103 لغات"）。名词尽量选以 ة 结尾的（ترجمة、عملية、مرة），这样 11–99（宾格）和 100+（属格）的写法相同；"شرح"不是，所以 many 写"# شرحًا نحويًا"、other 写"# شرح نحوي"。价格表 `perDay` 写"{n, plural, …} يوميًا"，避免 App 的"50 مرات في اليوم"那种数名不搭配的写法（§6 第 7 条） |
| Q3 | ✓ | title 以品牌位开头，`titleMust` = ["iPhone","لصفحات الويب","تطبيق"] 齐全。文档 08 §7.3 写的是"iPhone、صفحات الويب"，但 `hasToken` 对阿拉伯文按整词匹配，title 里是带介词的"لصفحات الويب"（ل 粘在词前），所以用这个形式（与 es / pl / uk 按 title 实际词形取词元的做法一致）；K1 是产品 / 品类意图；没有禁用主词和 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[صفحة ويب]]`（2 个词）；功能 H3、`languages.title` 没有 `[[ ]]`；`hero.lede` 以"WordByWord هو …"开头（阿语用代词 هو 表示"是"），写明"لمتعلمي اللغات" |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展 / 其他 App 只在 FAQ `safari`；Android 只在 FAQ `android`；桌面版只在 FAQ `devices`（S0 不写扩展名称）；没写离线、无限 AI 发音（iOS 语音写"فلا حد يوميًا لها"）、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量（"وعدة أنماط"）、口语练习、ChatGPT、"فريق WordByWord / صنّاع"；CJK 原文不能双击查词、Chunks / Action Flow 仅英语都写在同一屏；没有旧站的"محاذاة"（jargon）、"عند تحديد النص"（选中即译）、"مساعدك الذكي"。附录 A 词表在副本里跑 L-14：0 命中 |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required` 23 项、`contains` 10 项，L-13 0 违规）：اسحب للترجمة、انقر نقرًا مزدوجًا للبحث (معنى AI)、تعريفات إضافية、استخراج المقاطع、النطق بالذكاء الاصطناعي (الكلمة / الجملة)、تحليل بنية الجملة النحوية للذكاء الاصطناعي；句中按 §7.3 写"اسحب الفقرة لليمين""انقر نقرًا مزدوجًا"；按钮名照 App 原文用 «» 引用：«ترقية الآن»、«استعادة الشراء»、«احصل على شرح التركيب النحوي للذكاء الاصطناعي»、«قراءة الذكاء الاصطناعي»、«القراءة المحلية»、«تلقائي» / «فقرة» / «جملة بجملة»、«تعريفات إضافية»。X8：Action Flow 的 App 阿语缺译，保留 App Store 名，正文括注"(تسلسل الأفعال في الجملة)"（待母语复核） |
| Q7 | ✓ | 5 处功能截图 alt、4 条画廊图注 + alt、`common.screenshotLabel` / `screenshotExcerptLabel`（可见图注）、OG alt、SE 截图 alt 与图注都写了"(الواجهة بالإنجليزية)"，内容逐张对照 `assets/img/shot/en/*`（西语 Wikipedia 页 + 英文译文、"convirtiéndose"卡片、朗读播放器 + 西语句子 + 底部工具栏、"Syntax Explanations"、设置页 Auto / Quote Style / Local Read、"matrimonio"释义页、Spanish → English (US)、语言列表）；截图里的英文界面名（Auto、Quote Style、Local Read、More Definitions、Syntax Explanations、Sentence Builder、Word Raid）在 alt 里照英文原样写；`features[x].alt` 描述社交帖样张并注明"ليس لقطة شاشة"；`demo.lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | full（local）：note 写"واجهة التطبيق بـ 12 لغة منها العربية"；linkText = SE 核心词短语 + 品牌（文档 04 §5.7 种子，n39），链 SE 阿语页（`hreflang="ar"`）；FAQ 不加界面说明句；H2 以 SurfEnglish 开头；body 首句是条件句"تتعلّم الإنجليزية؟"；没有"قد يناسبك أكثر / بدلًا من / جديد / أسرع / ترقية"；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音；`points[0]` 写"بمستويات A1–C1"（"在 A1–C1 级别"，PRO-10，不写"من A1"） |
| Q9 | ✓ | 代入占位符后实测，全部在 §7.6 / L-8 限内，0 条 L-8：title 60、description 157、H1 74、eyebrow 46、lede 58、how 152、platformNote 129、规格清单 77 / 63 / 69 / 77、`cta.recap` 65、`pricing.summary` 91、SE 卡片 title 41、body 24 词、要点 36 / 28 / 42、linkText 39、所有 alt ≤ 123、FAQ 答案最长 406（`free`） |
| Q10 | ✓ | 页面 `dir="rtl"`、`data-script="arab"`；手势写"向右"（R63）；没有 `{wbr}`；标点用 ، ؛ ؟ 和 «»；数字西式；没有手工 RLM / LRM（glossary 有禁用项；价格里的 U+200F 是 `Intl.NumberFormat` 自己加的） |
| Q12 | ✓（HEAD 新副本） | 1280 / 390 / 375 / 320 px 无横向溢出、无字体回落（Geeza Pro / SF Arabic）；详见 §7。已用文案规避的问题："Action Flow"等拉丁专名在 RTL 换行时被拆开、"{minOS}+"的加号跑到另一端；荧光笔遮挡上一行的问题已由 6439eb5 解决；需要模板处理的问题见 §6 |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）只写"同一开发者正在准备 Chrome 扩展"，不写名称；`aExtLive` 写了名称"WordByWord Translate for Chrome"并注明只从扩展页面的链接安装；首页没出现 WordByWord.io（`footer.notAffiliated` 不在首页渲染） |

## 3. 回译对照（ar → English，对照 en.json）

| 键 | ar | 回译 | en 原文 |
|---|---|---|---|
| meta.title | WordByWord: تطبيق ترجمة ثنائية اللغة لصفحات الويب على iPhone | WordByWord: a bilingual translation app for web pages on iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | لمتعلمي اللغات: في متصفح WordByWord، اسحب أي فقرة إلى اليمين فتظهر ترجمتها أسفلها. انقر نقرًا مزدوجًا على كلمة لتعرف معناها حسب السياق. مجاني على iPhone وiPad. | For language learners: in the WordByWord browser, swipe any paragraph to the right and its translation appears below it. Double-tap a word to learn its meaning in context. Free on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | اقرأ المواقع بلغتين. [[الأصل في مكانه.]] | Read websites in two languages. [[The original stays in its place.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | اسحب الفقرة لليمين · انقر نقرًا مزدوجًا على كلمة لتعرف معناها في سياقها | Swipe the paragraph to the right · double-tap a word to learn its meaning in its context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.eyebrow | WordByWord · قراءة الويب بلغتين لمتعلمي اللغات | WordByWord · reading the web in two languages, for language learners | WordByWord · Bilingual web reader for language learners |
| hero.title | اسحب فقرة من أي [[صفحة ويب]] لليمين، فتظهر ترجمتها تحتها ويبقى الأصل في مكانه. | Swipe a paragraph of any [[web page]] to the right: its translation appears under it and the original stays in place. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord هو مساعد قراءة لمتعلمي اللغات على iPhone وiPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | افتح موقعًا في المتصفح المدمج في التطبيق، واسحب الفقرة لليمين: تظهر الترجمة تحتها. وانقر نقرًا مزدوجًا على كلمة ليشرح لك الذكاء الاصطناعي معناها في سياقها. | Open a site in the app's built-in browser and swipe the paragraph to the right: the translation appears under it. And double-tap a word so that the AI explains its meaning in its context. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | اسحب للترجمة، وانقر نقرًا مزدوجًا لمعرفة المعنى — في المواقع التي تقرؤها | Swipe to translate, and double-tap to find out the meaning — on the websites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | اسحب للترجمة: تظهر الترجمة أسفل النص الأصلي مباشرة | Swipe to Translate: the translation appears directly below the original text | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | انقر نقرًا مزدوجًا على كلمة ليشرح الذكاء الاصطناعي معناها حسب السياق | Double-tap a word and the AI explains its meaning according to the context | Double-tap a word for its AI meaning in context |
| features[x].title | اقرأ منشورات X (تويتر) بلغتين في المتصفح المدمج | Read X (Twitter) posts in two languages in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | استخراج المقاطع وAction Flow للجمل الإنجليزية | Chunk Extraction and Action Flow for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | القراءة بصوت الذكاء الاصطناعي، أو بأصوات iOS السريعة على الجهاز | Reading aloud in an AI voice, or with the fast iOS voices on the device | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | تحليل بنية الجمل الطويلة بالذكاء الاصطناعي | Analysis of the structure of long sentences with AI | AI sentence structure analysis for long sentences |
| features[engines].title | ترجمة سحابية أو على الجهاز | Cloud or on-device translation | Cloud or on-device translation |
| features[display].title | تخطيط الترجمة ونمطها | The translation's layout and its style | Translation layout and style |
| features[history].title | سجل الترجمات والبحث عن الكلمات | History of translations and of word lookups | Translation and lookup history |
| features[devices].title | iPhone وiPad وMac وVision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | ما هو WordByWord؟ | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | هل يترجم WordByWord صفحة الويب كاملة دفعة واحدة؟ | Does WordByWord translate the whole web page in one go? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | هل يعمل في Safari أو داخل تطبيقات أخرى؟ | Does it work in Safari or inside other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | هل WordByWord مترجم كلمة بكلمة؟ | Is WordByWord a word-by-word translator? | Is WordByWord a word-by-word translator? |
| faq[x].q | هل يمكنني قراءة X (تويتر) باستخدام WordByWord؟ | Can I read X (Twitter) using WordByWord? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | ما اللغات التي يدعمها WordByWord؟ | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | هل WordByWord مجاني؟ وما الحدود اليومية؟ | Is WordByWord free? And what are the daily limits? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | ما محرك الترجمة الذي يستخدمه؟ | Which translation engine does it use? | Which translation engine does it use? |
| faq[account].q | هل أحتاج إلى حساب لاستخدام WordByWord؟ | Do I need an account to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | كيف أستعيد WordByWord Plus على iPhone أو iPad جديد؟ | How do I get WordByWord Plus back on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | هل يوجد إصدار لنظام Android؟ | Is there a version for Android? | Is there an Android version? |
| faq[english-learner].q | أتعلّم الإنجليزية. هل يستحق SurfEnglish التجربة أيضًا؟ | I'm learning English. Is SurfEnglish worth trying too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | هل يعمل WordByWord على الآيفون والآيباد وMac، أو في متصفح على الكمبيوتر؟ | Does WordByWord work on the iPhone, the iPad and Mac, or in a browser on a computer? | Does WordByWord work on iPad, Mac or a desktop browser? |
| pricing.title | مجاني كل يوم، وارتقِ إلى Plus حين تقرأ أكثر | Free every day, and step up to Plus when you read more | Free every day — upgrade to Plus when you read more |
| pricing.summary | كل الميزات مجانية ضمن هذه الحدود، ويرفعها Plus مقابل ‏3.99 US$ شهريًا (في الولايات المتحدة). | All features are free within these limits, and Plus raises them for US$3.99 a month (in the US). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | من مطوّر WordByWord | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: أخبار إنجليزية يومية بمستواك | SurfEnglish: daily English news at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | تتعلّم الإنجليزية؟ واصل قراءة أي صفحة تريدها في WordByWord، وجرّب SurfEnglish أيضًا: أخبار إنجليزية يومية حسب المستوى وألعاب للمراجعة، بالسحب نفسه والنقر المزدوج نفسه. | Learning English? Keep reading any page you want in WordByWord, and try SurfEnglish too: daily English news by level and games for review, with the same swipe and the same double-tap. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | أخبار إنجليزية حقيقية بمستويات A1–C1 ／ ألعاب مراجعة مستمدة مما قرأته ／ شارك مقالات إنجليزية من Safari إلى التطبيق | Real English news at levels A1–C1 / Review games drawn from what you have read / Share English articles from Safari to the app | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.note | ابدأ مجانًا · iPhone وiPad · واجهة التطبيق بـ 12 لغة منها العربية · الترجمة إلى 21 لغة | Start free · iPhone and iPad · app interface in 12 languages, Arabic among them · translation into 21 languages | Free to start · iPhone and iPad · App in 12 languages · Translations into 21 |
| sibling.card.linkText | أخبار إنجليزية مع الترجمة — SurfEnglish | English news with translation — SurfEnglish | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | نزّل SurfEnglish من App Store | Download SurfEnglish from the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | SurfEnglish، شاشة الألعاب (الواجهة بالإنجليزية): Sentence Builder وWord Raid جاهزتان للعب بالجمل والكلمات المحفوظة | SurfEnglish, Games screen (English interface): Sentence Builder and Word Raid, ready to play with the saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | لقطة شاشة من SurfEnglish (الواجهة بالإنجليزية) | Screenshot from SurfEnglish (English interface) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading / linkText | من المطوّر نفسه ／ SurfEnglish: أخبار إنجليزية | From the same developer / SurfEnglish: English News | More from the maker / SurfEnglish: Bilingual News |
| cta.title | ابدأ قراءة المواقع بلغتين على iPhone | Start reading websites in two languages on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | اسحب للترجمة · انقر نقرًا مزدوجًا للبحث · القراءة بصوت عالٍ · 21 لغة | Swipe to translate · Double-tap to look up · Reading aloud · 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（表中 ar 为可读形式：实际 JSON 里多词拉丁专名带 U+00A0，复数对象已代入当前值；价格里的 U+200F 由 `Intl.NumberFormat` 生成。）

FAQ 答案（不在回译清单里）也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音没有每日上限、Plus 为月订、美区价格 + 以 App Store 为准；`restore` 引用 App 按钮 «ترقية الآن» → «استعادة الشراء»（T-E）；`engines` 的"首次可能需要下载语言资源"照 App 的 `swipe_translation_engine_mode_local_description`；`devices` 的 S0 答案只写"同一开发者正在准备 Chrome 扩展"，`aExtLive` 才写 "WordByWord Translate for Chrome" 和"只从扩展页面的链接安装"。

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都有意为之：

1. `meta.title` 没有单独的"App"一词：阿语产品词是"تطبيق"（文档 03 §3.9 草案、`primaryTokens.home.ar`）。
2. `meta.description` 用"في متصفح WordByWord"（在 WordByWord 的浏览器里）代替"built-in browser"（文档 03 §3.2 允许），并写了方向"إلى اليمين"（R63）；K2 句写"لتعرف معناها حسب السياق"（"按语境的意思"，比 en 多"语境"）。
3. `hero.title` 用文档 03 草案的句子：比 en 多"原文留在原处"（与 zh-Hans / ja 的 H1 同义），写了方向"لليمين"；草案的"صفحة الويب"改为"أي صفحة ويب"以对应 en 的 any；荧光笔标 K1 名词"صفحة ويب"（en 标的是"any web page"三个词，ar 的"أي"不进荧光笔，荧光笔才能在所有宽度保持一整块）。
4. `meta.ogHeadline` 与 en 同构，但"any web page"写成"المواقع"（网站），"Keep the original"写成陈述句"الأصل في مكانه"（原文在原处），避开 G1 的"保留原文"句式，并能排到 64 px（§4 第 3 条）。
5. `hero.platformNote` 不写美区价格（D2，与 ja / zh-Hans / es 相同）；规格清单 `features[devices].text` 用"فأحدث"（或更新）代替"+"，并把"Apple Vision Pro"缩成"Vision Pro"以守 80 字符（与 `features[devices].title` 一致）。
6. SE 卡片：`linkText` 用文档 04 §5.7 的 ar 种子"أخبار إنجليزية مع الترجمة"（英文新闻附翻译），不是 en 的"at your level"；`appStoreLinkText` 用 Apple 徽章的动词"نزّل"（下载）；`note` 按 full 模式写"界面含阿拉伯语"。
7. `faq[devices].q` 加了"الآيفون"（SEO-11 指定位置），因此问句比 en 多"iPhone"。
8. 链接到英文页面的文字加了"(بالإنجليزية)"：FAQ `what-is`（@about）、`devices`（@chrome，a 与 aExtLive）；`@se-site` 指向 SE 阿语页，不加。
9. 样张图注比 en 多一句"阿语按从右到左排版"（文档 05 §5.2.6 的要求）。

## 4. 没把握的措辞（12 处，附回译与替代写法）

| # | 键 | ar | 回译 | 替代写法 | 说明 |
|---|---|---|---|---|---|
| 1 | hero.title | اسحب فقرة من أي [[صفحة ويب]] لليمين، فتظهر ترجمتها تحتها ويبقى الأصل في مكانه. | Swipe a paragraph of any web page to the right: its translation appears under it and the original stays in place. | 草案原句「اسحب فقرة من صفحة الويب لليمين، …」；或荧光笔含"أي"：「… من [[أي صفحة ويب]] …」 | 草案只有"صفحة الويب"（这个网页），我加了"أي"对应 en 的 any（第二模型的建议）。荧光笔含"أي"时在 320–414 px 会被拆成两段，所以只标两个词 |
| 2 | 全文（双击） | انقر نقرًا مزدوجًا | Click / tap a double click | 「اضغط مرتين」（press twice，iOS 触屏语境常见） | App 与文档 08 §7.3 的写法，但这是 Microsoft 体系里鼠标"双击"的标准译法；SE 阿语官网写"انقر نقرتين"。若审校认为应改，需要 App 与网站一起改（kicker、价格表行名、glossary） |
| 3 | meta.ogHeadline | اقرأ المواقع بلغتين. [[الأصل في مكانه.]] | Read websites in two languages. The original stays in its place. | 「اقرأ أي صفحة ويب بلغتين. [[الأصل في مكانه.]]」（更贴 en，60 px）；「اقرأ صفحات الويب بلغتين. …」（60 px） | 用"المواقع"（网站）代替"أي صفحة ويب"，是为了排到 64 px；og:title 因此没有"صفحة ويب"一词 |
| 4 | meta.title | تطبيق ترجمة ثنائية اللغة لصفحات الويب على iPhone | A bilingual translation app for web pages on iPhone | 「تطبيق لقراءة صفحات الويب بلغتين على iPhone」（n56） | 草案原文、K1 逐字；"ثنائية اللغة"修饰"ترجمة"略书面，阿语用户更常搜"ترجمة صفحات الويب""ترجمة المواقع"。保持草案 |
| 5 | features[x].sample.time | منذ 3 س | 3 h ago | 「3 س」（X 阿语界面的写法） | 模板把帖子头部放在 LTR 画布里，"3 س"会在视觉上读成"س 3"；加"منذ"后整段以阿语字母开头，读序正确。≤ 8 wu 放不下"منذ 3 ساعات" |
| 6 | features[chunks].kicker / text、价格表 | استخراج المقاطع | Extraction of segments | 「مجموعات الكلمات」（SE 阿语官网对 chunks 的叫法） | App 的叫法（规则 ①，照用）；"مقاطع"平时多指"片段 / 视频片段" |
| 7 | features[chunks].text | Action Flow (تسلسل الأفعال في الجملة) | Action Flow (the sequence of actions in the sentence) | 「Action Flow (مسار الأفعال في الجملة)」 | App 没有阿语（X8），括注沿用文档 08 X8 的写法，待母语复核 |
| 8 | pricing.title | مجاني كل يوم، وارتقِ إلى Plus حين تقرأ أكثر | Free every day, and step up to Plus when you read more | 「مجاني كل يوم، وقم بالترقية إلى Plus حين تقرأ أكثر」（App 的"الترقية إلى Plus"） | 第二模型认为"قم بالترقية"是直译腔，改用"ارتقِ"；但"ارتقِ"在 App 里没有出现过 |
| 9 | hero.eyebrow | قراءة الويب بلغتين لمتعلمي اللغات | Reading the web in two languages, for language learners | 「قارئ ويب ثنائي اللغة لمتعلمي اللغات」（初稿：bilingual web reader） | 第二模型认为"قارئ ويب"像在说"读网页的人"，改为动名词 |
| 10 | faq[safari].a | ليس ملحقًا لـ Safari | It is not an extension for Safari | 「ليس امتدادًا لـ Safari」／「ليس إضافة لـ Safari」 | Apple 阿语把 Safari 扩展叫"ملحقات"（据我所知，未能联网核实）；Chrome 扩展用 Chrome 自己的"إضافة" |
| 11 | features[history] / K6 | سجل الترجمات والبحث عن الكلمات | History of translations and of word lookups | 「تاريخ الترجمة」（App 的叫法） | App 混用"تاريخ"（也是"日期"）与"سجل"，网站统一"سجل"（§6 第 7 条） |
| 12 | features[engines].text | سحابية (Azure وGoogle) أو على الجهاز عبر iOS؛ نفدت حصتك السحابية؟ بدّل للمحلي. | Cloud (Azure and Google) or on the device via iOS; out of your cloud quota? Switch to local. | 「… نفدت الترجمات السحابية؟ استخدم المحرك المحلي.」（n81，超 1） | 80 字符上限下的电报体，"للمحلي"省略了"المحرك" |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法的来源**：`WordByWordPrototype/Localizable.xcstrings` 的 ar 值（与文档 08 表 T-A…T-E 的 ar 列逐条核对，一致）；价格表行名对照 App 的免费 / Plus 对比页（`featureDisplayName`：功能名 + 引擎名，次数为 `limit_per_day%lld`）。用到的 App 字符串：
  - 功能名：`daily_sentence_translation_limit` اسحب للترجمة；`word_meaning_lookup_title` انقر نقرًا مزدوجًا للبحث (معنى AI)；`more_definitions_title` تعريفات إضافية；`Chunk Extraction` استخراج المقاطع；`grammar_structure_analysis` تحليل بنية الجملة النحوية للذكاء الاصطناعي；`ai_pronunciation_word` / `_sentence` النطق بالذكاء الاصطناعي (الكلمة) / (الجملة)；Action Flow 无阿语（X8）；
  - 设置与按钮：`audio_playback_title_streaming` / `_local` قراءة الذكاء الاصطناعي / القراءة المحلية；`swipe_translation_engine_mode_api_title` / `_local_title` محرك الترجمة السحابي / المحرك المحلي；`translation_mode_title_*` تلقائي / فقرة / جملة بجملة；`get_syntax_explanation_button` احصل على شرح التركيب النحوي للذكاء الاصطناعي；`upgrade_now_button` ترقية الآن；`restore_purchase_button` استعادة الشراء；`bookmark_title` الإشارات المرجعية；`tab_manager_view_switch_tabs` تبديل علامات التبويب（正文据此写"علامات تبويب وإشارات مرجعية"）；
  - 提示：`tip_swipe_to_translate`「اسحب لليمين على أي نص لعرض ترجمته.」（右滑写方向的依据，R63）、`tip_double_tap_context_meaning`「انقر نقرًا مزدوجًا على أي كلمة لعرض معناها السياقي.」；`swipe_translation_engine_mode_api_description`「…والمدعوم حاليًا بخدمات الترجمة من Azure وGoogle」与 `swipe_translation_engine_mode_local_description`「…قد تحتاج موارد اللغة إلى التنزيل عند الاستخدام لأول مرة」（FAQ `engines` 照此措辞）；`local_speech_engine_*` 里 Premium / Enhanced 保留英文（正文同）。
- **kicker** 去掉"(معنى AI)"后缀（与 en / ja / es / fr 相同）；价格表两行右滑翻译写"· المحرك السحابي / · المحرك المحلي"（与 en 的"· cloud engine"同构；App 对比页是括号里的引擎全名），其余行名与 App 一致；Action Flow 行写英文原名。
- **称谓**：通用阳性祈使（اسحب、انقر、افتح、اختر），FAQ 问句用第一人称（هل أحتاج…؟ كيف أستعيد…؟），与 en 相同。开发者用第三人称（"مطوّر مستقل اسمه Jinlong""من مطوّر WordByWord""من المطوّر نفسه""تواصل مع المطوّر"），不写"نحن / فريق"。
- **数字与标点**：西式数字（App 的 `%lld` 与 `Intl.NumberFormat('ar')` 都是西式）；阿语逗号 ،、分号 ؛、问号 ؟；引号 «»；"و"直接粘在后面的拉丁词或数字上（"وiPad""و20 عملية"），这是阿语的正常写法，渲染已核对。
- **RTL 与混排**：不手工插入任何方向控制符；多词拉丁专名用不换行空格（Action Flow、App Store、Apple Vision Pro、Vision Pro、WordByWord Plus、WordByWord Translate for Chrome；不含 meta、alt、样张）；避免"拉丁 + 加号"（"{minOS}+"）这类在 RTL 里会把符号挪到另一端的写法，改用"فأحدث / أو أحدث"；括号内容以阿语结尾或包含阿语时，浏览器按 UAX #9 的成对括号规则（N0）镜像正确，已在 320 / 390 / 1280 px 目视确认。
- **术语**：段落 = فقرة（App 用词）；"look up a word"句中写"لتعرف معناها"（查意思），功能名照 App 写"للبحث"；查过的词 = "الكلمات التي بحثت عنها"；"swipe translation" = "الترجمة بالسحب"（App 的 `chunk_extraction_mode_description_*` 用词）；历史 = "سجل"（不用 App 的"تاريخ"，§6 第 7 条）；内置浏览器 = "المتصفح المدمج"（与 SE 阿语官网一致）；Chrome 扩展 = "إضافة Chrome"（Chrome 网上应用店的阿语叫法）；Safari 扩展 = "ملحق لـ Safari"（Apple 阿语叫 Safari 的扩展"ملحقات"，待母语审校确认）；Apple 芯片 = "شريحة Apple"（"أجهزة Mac المزوّدة بشريحة Apple"）；Apple Account = "حساب Apple"；"English interface" = "(الواجهة بالإنجليزية)"；英文页链接标"(بالإنجليزية)"。
- **X**：kicker 写"X (تويتر سابقًا)"（"X，旧称推特"，阿语媒体的通行写法）；K9 关键词位置写"X (تويتر)"。
- **SE 阿语用词**：卡片与 FAQ 的"أخبار إنجليزية""ألعاب للمراجعة""بالسحب نفسه والنقر المزدوج نفسه"对照 SE 官网 ar.json；SE 官网把双击写成"انقر نقرتين"，WordByWord 页面不跟（glossary 禁止），统一用本 App 的"انقر نقرًا مزدوجًا"。

## 6. 需要负责人决定的问题

1. **阿语标题行高（已由 6439eb5 解决，记录备查）**：我在较早的 HEAD 上起草时，阿语标题沿用拉丁的行高（`.h-display` 1.08），Geeza Pro / SF Arabic 的字面框比拉丁字体高，`.kw` 的黄色底色画的是字面框，荧光笔一旦在第二行，就会盖住上一行 ب ي 下方的点（原 H1 在 1280 / 320 px 下"اسحب"的点被盖掉，OG 标题里"أي"被盖成"أى"）。负责人的 6439eb5 已按文档 05 §3.3 设阿语标题行高 1.35；我在 HEAD 189a224 上复核了 9 种宽度（1280–320 px）和 OG：荧光笔与上一行之间有空隙，不再遮挡，因此 H1 的荧光笔放回 K1 名词，OG 用与 en 同构的句子。无需再处理。
2. **OG 图（D-23）**：按简报，OG 文件没有复制进真实仓库。ar.json 进库后，`node build.mjs` 会报 `D-23 home-ar: no OG image`，直到运行 `node scripts/og.mjs --only home-ar`（HEAD 189a224 新副本实测通过：64 px × 2 行、126.7 KB）。
3. **ar lint 词表**：`docs/redesign-2026/ops/m3/ar-lint.json`（附录 A）。不合入时，真实仓库构建对 ar 多两条汇总 W（L-14 未覆盖 24 条、L-9 无 G1 模式）。词表按 bb689eb 之后的 Unicode `\w` / `\b` 写；阿语把 و ف ب ل 和冠词 ال 粘在词前，所以大多数模式是带 `(ال)?` 的子串匹配，不是整词匹配。
4. **`meta.appStoreName` / `appStoreSubtitle`**（只在 en 的 about 事实表里用，ar 页面不渲染）：研究 05 §2.1 的逐国 lookup 和 scratchpad 里的 SA 店面页（`as_sa.html`）都显示 SA 店面用的是默认 en-US 元数据（名称 "WordByWord Translate"、副标题 "Swipe to translate AI explains"，App Store 没有阿语本地化），所以照店面原样写（与 pl / tr 的处理相同，因此有 1 条 L-4 W）。请确认，或决定改用阿语译文。title 品牌位仍按文档 08 §7.3 写 "WordByWord"。
5. **价格在 RTL 里显示为"$US 3.99"**：`{plus.priceUS}` 由 `Intl.NumberFormat('ar', {style:'currency', currency:'USD'})` 生成"‏3.99 US$"（U+200F 是 Intl 自带的）。在 RTL 段落里"$"跑到"US"左边，视觉上是"‏$US 3.99"（价格表表头、`pricing.summary`、FAQ `free`）。逻辑顺序没错，但看起来别扭。建议模板对 ar 把价格包进 `<bdi dir="ltr">`，或改用 `currencyDisplay: 'code'`（"3.99 USD"）。我没有改模板。
6. **SE 卡片"→"不镜像**：`appStoreLinkText` 后面的"→"由模板以 `<span aria-hidden>` 追加，是普通字符，ar 页上仍指向右边（阅读方向的反方向）；文档 05 §9.2 要求"→"链接在 RTL 下镜像（hero 的 `.link-arrow` 已经镜像）。建议模板对这个 span 也做镜像或换成"←"。
7. **App 侧的阿语字符串问题**（§7.2.2 规则 ③，网站已按规则处理，建议报给 App）：
   - 次数没有复数变体：`limit_per_day%lld` = "%lld مرات في اليوم"，以及 `limit_30_per_day` / `limit_50_per_day` / `limit_80_per_day`（"30 / 50 / 80 مرات في اليوم"）——11 以上应为单数"مرة"（"50 مرة في اليوم"），App 的免费 / Plus 对比页因此显示"50 مرات""500 مرات"。同类：`This folder contains %lld items.` = "يحتوي على %lld عنصر"（3–10 应为"عناصر"）。
   - Action Flow 整组（`sentence_skeleton_*`）没有阿语（X8），ar 界面显示英文"Sentence Action Flow"。
   - "للذكاء الاصطناعي"是 "AI …" 的直译（字面是"属于 AI 的"）：`grammar_structure_analysis` "تحليل بنية الجملة النحوية للذكاء الاصطناعي"、`get_syntax_explanation_button` "احصل على شرح التركيب النحوي للذكاء الاصطناعي"；通顺写法是"بالذكاء الاصطناعي"。同一功能还有第三个名字 `explanations_available` "تحليل التركيب متاح"、`label_syntax_explanations` "تفسيرات التركيب النحوي"。网站按规则 ① 照 App 原文引用按钮名和表格行名，句中用"تحليل بنية الجمل … بالذكاء الاصطناعي"。
   - "历史"两种说法：`view_title_translation_history` "تاريخ الترجمة"、`view_title_swipe_history` "تاريخ ترجمة السحب"、`word_history_cleared_message` "تم مسح تاريخ ترجمة الكلمات"（"تاريخ"也是"日期"），而 `button_text_clear_*` 用"مسح سجل ترجمة الجمل"、`navigationTitle_history_detail` 用"تفاصيل السجل"。网站统一写"سجل"（glossary 禁止"تاريخ الترجمة"）。
   - 书签两种说法：`bookmark_title` "الإشارات المرجعية" 与 `view_bookmarks_button` "عرض العلامات المرجعية"；引用样式两种：`translation_style_title_quote_style` "نمط الاقتباس" 与 `Quote Style` 键 "أسلوب الاقتباس"。
   - 点按动词不一致：多数用"النقر"，`swipe_translation_result_display_mode_description_manual` 用"عند الضغط على إظهار الترجمة"。另外"انقر نقرًا مزدوجًا"是 Microsoft 体系里鼠标"双击"的标准译法，iOS 触屏语境常见"اضغط مرتين"（与文档 08 X7 对 de / fr / nl 的修正同类问题）；网站按文档 08 §7.3 跟 App 写"انقر نقرًا مزدوجًا"，是否整体改动请母语审校与 App 一起定（§4 第 2 条）。
   - `double_tap_not_supported_message` 把查词叫"الترجمة بالنقر المزدوج"（翻译），而功能名是"…للبحث"（查找）。
   - `free_tts_limit_message` "لقد استخدمت جميع نطقك المجاني لليوم"语法别扭（"你所有的免费发音"），宜写"جميع مرات النطق المجانية لهذا اليوم"。
   - iOS 语音有两个名字：对比页 `tts_option_local_synthesis` "الصوت المُركب محليًا"，朗读设置"القراءة المحلية"。网站价格表写"صوت iOS (القراءة المحلية)"。
   - （已在文档 05 §11 登记）App 的译文 span 没有 `dir`，阿语译文在 App 里以 LTR 排版；网站样张按正确的 RTL 排版并在图注说明。
8. **页脚 SE 链接名**：文档 04 §5.5 给 ar 的 `sibling.footer.linkText` 是"SurfEnglish: أخبار إنجليزية"（取自 SE 官网 ar.json 的 `meta.appStoreName`），已照用；但研究 05 §3.5 记录 SA / AE 店面上 SE 的实际名称是 "SurfEnglish: Bilingual News"（与 vi / th / id / hi 同样情况）。页脚链接指向 SE 阿语官网而不是 App Store，所以我认为用官网的阿语名没有问题，请确认。
9. **母语审校**（R36，T3 上线后补；文档 04 T11 把 ar 列为优先）：请审校人重点看 §4 各条，以及三个统一性选择：双击写"انقر نقرًا مزدوجًا"（App 用词）还是"اضغط مرتين"、"历史"统一写"سجل"、"English interface"统一写"(الواجهة بالإنجليزية)"。

## 7. 渲染检查（HEAD 189a224 新副本 + ar，`node scripts/serve.mjs --dir …/dist --port 4610 --quiet`，本机 headless Chrome，屏蔽外网；亮色与暗色各看一遍；用完已停掉服务）

| 视口 | 横向溢出 | SE 卡片高度（上限） | 整页高度 | 其他 |
|---|---|---|---|---|
| 1280 × 800 | 无 | 339 px（420） | 10,164 px | H1 4 行，荧光笔在第 2 行、一整块，不遮挡第 1 行；价格表 734 px 框内完整 |
| 390 × 844 | 无 | 421 px（480） | 12,751 px（软目标 13,000；同一构建 en 12,943 · hi 12,888 · th 12,973 · es 13,209 · pl 13,523 · uk 13,685） | 样张红色译文条顶端 761 px（R69：在 844 px 视口内，距底 83 px）；H1 4 行；价格表 356 / 356 px 不滚动 |
| 375 × 812 | 无 | 421 px（480） | 12,803 px | 红条顶端 759 px（< 812，距底 53 px）；价格表 341 / 341 px |
| 320 × 640 | 无 | 421 px（560，R84） | 13,182 px | H1 5 行；价格表 286 / 286 px 不滚动（行名折 3–4 行，54afac8 之后的预期表现）；页眉只显示图标（< 360 px 的新规则）；hero 的"شاهد كيف يعمل"折到徽章下一行（en / es / pl 在 320 px 同样如此） |

荧光笔：1280 / 900 / 768 / 560 / 414 / 390 / 375 / 360 / 320 px 下都是一整块（在第 1 或第 2 行），与上一行之间有空隙（例：1280 px 行高 81 px，荧光笔框从第 2 行的 86 px 处开始）。

RTL 专项（三种宽度目视）：
- 页面整体镜像：页眉品牌在右、下载按钮在左；L2 页边注 ①② 在右、③ 在左；M 网格、价格表、SE 卡片（文字在右、截图在左）、FAQ（+/− 在左）、页脚都按逻辑方向镜像；hero 的"شاهد كيف يعمل ←"箭头已镜像。
- 机身内部保持 LTR（`.sample-screen` direction = ltr）：英文文章、地址栏、工具栏不镜像；阿语译文行 `.wb-tr` 为 rtl + 右对齐，红条在左；查词卡 `.wb-card` 为 rtl（"end · فعل · 🔊"顺序正确，«end up» 的书名号方向正确）；滑动提示仍从左向右（模板按 R63 实现，没有改动）。
- X 样张：帖子头部在 LTR 画布里，时间写"منذ 3 س"（以阿语字母开头，浏览器把它当成一个 RTL 片段，读出来是"منذ 3 س"；若只写 X 阿语界面的"3 س"，在 LTR 头部里会读反）；帖子译文为 rtl、红条在左。
- 语块示意卡的释义"set off for: الانطلاق نحو مكان ما"在 LTR 画布里（模板没有给 `.ck-gloss` 设 dir）：英文短语在左、阿语释义在右，阿语部分自成 RTL 片段，读序正确。
- 混排核对过的字符串：`hero.lede`（以 WordByWord 开头、以"iPhone وiPad."结尾）、`hero.ctaNote`、`hero.platformNote`（"· Plus اشتراك شهري ·""iOS 18 أو أحدث"）、规格清单（"(Azure وGoogle)""(iOS 18 فأحدث)، وMac بشريحة Apple (macOS 15 فأحدث)"）、`features[chunks].title`（"وAction Flow"不再被拆开）、FAQ 里的"x.com""(A1–C1)""(‏3.99 US$ في الولايات المتحدة، …)"、SE 卡片标题"SurfEnglish: …"与 note、页脚"© 2025–2026 Jinlong · من تطوير Jinlong"（年份区间在 RTL 里按从右到左读，是正常表现）。
- 已用文案规避的问题：① 多词拉丁专名在 RTL 换行处被拆开（用不换行空格）；② "{minOS}+"在 RTL 中会显示成"+iOS 18"（改写为"فأحدث"）。荧光笔遮挡上一行的问题由 6439eb5 解决（§6 第 1 条）。
- 需要模板处理的问题：价格显示为"$US 3.99"（§6 第 5 条）；SE 卡片"→"不镜像（§6 第 6 条）；FAQ 里的"(A1–C1)"在 390 px 下会在"–"后折行（en 也会折，RTL 下两段分在行的两端，略难读；可由模板把 `{se.levels}` 包成不折行的 `<bdi>`）。

## 8. 第二模型互检记录（T3 不强制，额外做的）

- 审校方：Claude Sonnet，单独运行，只读。输入是 ar.json、en.json 和固定规则（称谓、手势写法、App 原名原样引用、品牌词用拉丁字母、复数对象及当前值、西式数字、不加方向控制符、不换行空格、禁用说法）。
- 审校方的总评：现代标准阿语自然流畅，祈使语气统一，手势与 App 用词遵守规则；所有复数分支（含双数的格）都正确；没有发现语法、一致或拼写错误；品牌、数字、标点干净；SurfEnglish 一直是"也值得一试"的口吻。剩下的是一处指代歧义、几处直译腔和术语不统一。
- **采纳**（19 条）：
  1. `languages.lede` / FAQ `languages` 的"ويحدّثها"可能被读成修饰"الصفحة"的关系从句（"你读、它更新的那一页"）→ "ويحدّث الإعداد"（更新设置）；
  2. FAQ `devices`（S0）"ويُعِدّ المطوّر نفسه حاليًا"读成"开发者本人正在准备" → "وهناك إضافة لمتصفح Chrome من المطوّر نفسه قيد الإعداد"（来自同一开发者的扩展正在准备中）；
  3. `languages.limits[0]`"صفحات الصينية…"（"中文的页面"，别扭）→ "صفحات بالصينية أو اليابانية أو الكورية"；
  4. `nav.ariaMain`"الرئيسية"与面包屑"首页"同词，读屏会念成"首页，导航" → "التنقل الرئيسي"；
  5. `common.langFallbackNote` 直译腔 → "…وعند اختيار لغة أخرى تُفتح صفحتها الرئيسية"；
  6. `pricing.title`"قم بالترقية"（直译腔）→ "وارتقِ إلى Plus"（§4 第 8 条）；
  7. `featuresIntro.lede`"حاضر""نظرة أدق" → "في متناولك""نظرة فاحصة"；
  8. `hero.eyebrow`"قارئ ويب"（像"读网页的人"）→ "قراءة الويب بلغتين"；
  9. 查词卡 `meaning`"(فعل شيء)"不标音时可能被读成过去式动词 → "القيام بشيء"，"هنا"一句改为"يجدون أنفسهم يقرؤون حتى الظهر"（不知不觉读到中午）；`note` 去掉多余的"هي" → "تأتي الكلمة ضمن الفعل المركّب «end up»"；
  10. 画廊图注 1"وضع القراءة"单独看像"阅读模式" → "وضع القراءة بصوت عالٍ"；
  11. "جمل أمثلة" → "جمل توضيحية"（图注与 alt）；
  12. 画廊图 3 图注"اللغة المصدر والمستهدفة"不对称 → "اللغة المصدر واللغة المستهدفة"；alt 统一为"الإنجليزية الأمريكية"；
  13. `features[swipe].text`"اكتب عنوانًا"（"عنوان"单用也是"标题"）→ "اكتب عنوان موقع"；
  14. `features[lookup].text`"المعنى المناسب هنا" → "المعنى الملائم للجملة"；
  15. `features[chunks].text` 一句里两次"في الجملة" → "فعلها الرئيسي"（保留 X8 的完整括注）；
  16. `features[engines].text`"حصة السحابة"（"云的份额"）→ "حصتك السحابية"；
  17. FAQ `account`"دون تسجيل"（与下一句的"تسجيل الدخول"易混）→ "دون إنشاء حساب"；
  18. H1"من صفحة الويب" → "من أي صفحة ويب"（对应 en 的 any；n74）；
  19. X 样张译文"أول جري لي"（"جري"是不可数动名词）→ "أول سباق جري لي"，"كنت بطيئًا"（给虚构账号定了性别）→ "كان إيقاعي بطيئًا"；SE 要点"مبنية مما قرأته" → "مستمدة مما قرأته"；`nav.about`"نبذة"与页脚"حول"统一为"حول"。
- **未采纳**（11 条，附理由）：
  1. `hero.platformNote` 补美区价格：文档 08 D2 规定非 en 页首屏不写美区价格（ja / zh-Hans / es / pl 相同）；
  2. 朗读、句法两张截图的 alt 改回 en 的写法：我对照了实际截图（朗读节选是播放器"1 / 3"、暂停键、"Hide Text"、西语句子和底部工具栏；句法节选是"Syntax Explanations"区块），alt 按画面写（文档 03 §3.6），en 的 alt 与画面不完全符合（pl 也报告过朗读这一张）；
  3. FAQ `devices` 问句的"الآيفون والآيباد"改回拉丁字母：这是 SEO-11 / 文档 03 §4.3 指定的本地写法和位置；
  4. SE 卡片 `linkText` 改成 en 的"at your level"、页脚改成"bilingual"：卡片用文档 04 §5.7 的 ar 种子（SE 阿语官网的头号关键词"أخبار إنجليزية مع الترجمة"），页脚用文档 04 §5.5 的专名，两者都是规定值；
  5. description 的"إلى اليمين"统一成"لليمين"：草案原文，两种写法都对，文档 03 §3.9 也是这样写的；
  6. 删除样张图注里"阿语从右到左"一句：文档 05 §5.2.6 要求加；
  7. X 样张时间改为"3 س"：见 §4 第 5 条（LTR 头部里的读序问题）；
  8. X kicker 去掉"سابقًا"：文档 08 §7.2.3 规定首次出现写"X（旧 Twitter）"格式（ja / es / pl 的 kicker 同样）；
  9. `common.contactUs` / `footer.contact` 改为"تواصل معنا"：文档 08 §7.4 不用"我们 / us"，开发者用第三人称；
  10. `features[syntax].text`"سجل الترجمة بالسحب"统一成"سجل الترجمات"：App 有两个历史（右滑翻译历史、查词历史），这里指前者，保留区分；
  11. alt 与法律声明里的"App Store""Apple Vision Pro"也加不换行空格：alt 不显示、法律声明不改动，不换行空格只用于可见正文。
- **可选项未改**："فأحدث"与"أو أحدث"并存（规格清单为了 80 字符用前者）、"تُكتشف"与"يتعرّف"并存、"النصوص الأصلية بالصينية"与"النصوص الصينية"并存——审校方也认为两种都可以。

## 附录 A：建议的 ar lint 词表（`docs/redesign-2026/ops/m3/ar-lint.json`，未合入数据文件）

- 覆盖：`claims-lint.json` 中有按语言写法、且还没有 ar 键的全部 25 条规则（24 条"未覆盖" + `hype`）。跳过已有 ar 的 `selection-translate`、`jargon`，以及只有 `*` 的 `io-home`、`engine-claim`。`keyword-map.json`：`seOwned.ar` 追加 4 条（现有的"تعلم الإنجليزية"保留）、`seOwnedLead.ar` 1 条、`reserved.G1.ar` 4 条。
- 写法：按 bb689eb 之后的规则写（`\w` = 任何文字的字母 / 附加符号 / 数字，`\b`、`\W` 在阿语词边界上有效）。阿语把 و ف ب ل 与冠词 ال 粘在下一个词上，所以多数模式是带可选 `(ال)?` 的子串；词干里可能出现叠音符或元音符号的位置写 `\p{M}*`（تعلّم、يتعرّف）；`[إا]` / `[أا]` 容许省略 hamza；`\s` 同时匹配文案里的不换行空格。
- 自测（副本，合入后重建）：ar 文案 0 命中（豁免键按 claims-lint.json 原样）、L-9 / D-8 0 error，L-14"未覆盖"和 L-9"无 G1"两条 W 消失；其他 locale 不受影响（ar 模式只作用于 ar；`seOwnedLead` 作用于所有页面的 H2，但只匹配以阿语"تعلّم الإنجليزية"一类开头的标题）；测试全部通过。脚本在 scratchpad 的 `ar-work/ar-lint-test.mjs`。
- 需要人工复核的地方：`se-hype` 的"جديد"、`hype` 的"الأفضل / الوحيد"、`vocab-sync` 的"مزامن…"、`dark-mode-theme` 的"ثيم…"范围较宽，合入前请母语审校看一遍；`shortcuts-volume` 刻意只拦复数"اختصارات"，因为单数"باختصار"（简而言之）是常用词。

反例（每条规则的全部反例都命中；带"旧站"的是旧 ar 页面原句）：

| 规则 | 反例（全部命中） |
|---|---|
| `whole-page` | 「ترجم صفحة الويب كاملة بنقرة واحدة.」；「يترجم WordByWord الصفحة بالكامل.」；「ترجمة كامل الموقع إلى لغتك.」；「ترجمة المواقع كلها دفعة واحدة.」 |
| `swipe-left` | 「اسحب الفقرة لليسار لترى ترجمتها.」；「لإزالة الترجمة، اسحب النص المترجم إلى اليسار.」（旧站）；「اسحبها يسارًا.」 |
| `safari-extension` | 「إضافة Safari تترجم أي صفحة.」；「استخدمه كملحق مشاركة.」；「يعمل في أي تطبيق على iPhone.」；「دون الحاجة لتبديل التطبيقات، حسّن مفرداتك.」（旧站） |
| `offline` | 「ترجمة دون اتصال بالإنترنت.」；「يعمل بدون إنترنت.」；「متاح في وضع عدم الاتصال.」；「ترجمة أوفلاين على iPhone.」；「Offline translation.」 |
| `unlimited-ai-voice` | 「نطق غير محدود وبجودة أعلى بالذكاء الاصطناعي.」（旧站）；「قراءة بالذكاء الاصطناعي بلا حدود مع Plus.」；「أصوات AI غير محدودة.」 |
| `dark-mode-theme` | 「مظهر داكن للقراءة ليلًا.」；「ثيمات مخصصة ووضع ليلي.」（旧站）；「يدعم الوضع الداكن.」；「غيّر ألوان الثيم بحرية.」（旧站）；「اختر ألوان السمة.」 |
| `shortcuts-volume` | 「خصص اختصارات الترجمة والبحث.」（旧站）；「عدّل سرعة وحجم TTS.」（旧站）；「التحكم في مستوى الصوت.」 |
| `vocab-sync` | 「فلاش كاردز للمراجعة.」；「بطاقات تعليمية من الكلمات التي بحثت عنها.」；「قائمة المفردات تتزامن مع iCloud.」；「مزامنة السجل عبر أجهزتك.」；「نسخ احتياطي سحابي لسجلك.」；「مراجعة بالتكرار المتباعد.」 |
| `android` | 「نسخة أندرويد قريبًا.」；「حمّله من Google Play.」；「متاح على Android.」 |
| `desktop-version` | 「نسخة الويب من WordByWord.」；「نسخة لسطح المكتب قريبًا.」；「تطبيق WordByWord للكمبيوتر.」；「متوفر لنظام Windows.」 |
| `x-app` | 「ترجم المنشورات داخل تطبيق X.」；「التطبيق الوحيد الذي يترجم تويتر.」 |
| `plus-early-access` | 「وصول مبكر للميزات الجديدة.」（旧站）；「كن أول من يجرب الميزات الجديدة.」；「احصل على الميزات الجديدة قبل غيرك.」 |
| `privacy-claim` | 「البيانات الشخصية لا تُجمع.」；「لا يتم جمع أي بيانات شخصية.」（旧站）；「لا نجمع بياناتك.」；「بلا تتبع وبلا إعلانات.」；「التطبيق لا يتتبعك.」 |
| `initial-version` | 「الإصدار الأولي يدعم الترجمة والشرح بين أكثر من 20 لغة.」（旧站） |
| `language-pairs` | 「يدعم أكثر من 20 زوج لغوي.」（旧站）；「مئات الأزواج اللغوية.」 |
| `style-count` | 「8 أنماط للترجمة.」；「سبعة أنماط مختلفة للعرض.」 |
| `auto-detect-target` | 「يكتشف التطبيق اللغة المستهدفة تلقائيًا.」（旧站）；「يتم تحديد اللغة الهدف آليًا.」 |
| `history-by-date` | 「يتم حفظ جميع ترجماتك وبحثك تلقائيًا وتجميعها حسب التاريخ.」（旧站）；「سجل مرتب حسب الأيام.」 |
| `plus-only` | 「شرح التركيب النحوي متاح لمشتركي Plus فقط.」；「ميزة حصرية لـ WordByWord Plus.」；「للمشتركين فقط.」；「بريميوم فقط.」 |
| `speaking-practice` | 「حسّن مهارات الاستماع والتحدث معًا.」（旧站）；「تدريب على النطق بالذكاء الاصطناعي.」；「النطق بالذكاء الاصطناعي، استمع وتحدث.」（旧站） |
| `replacement-tone` | 「SurfEnglish أنسب لك.」；「قد يناسبك SurfEnglish أكثر لتعلم الإنجليزية.」；「استخدم SurfEnglish بدلًا من WordByWord.」；「التطبيق الشقيق لـ WordByWord.」；「سيحل SurfEnglish محل WordByWord.」；「التطبيق السابق من المطوّر نفسه.」；「انتقل إلى SurfEnglish.」；「الخيار الأفضل لمتعلمي الإنجليزية.」 |
| `se-on-device-voice` | 「أصوات تعمل بدون اتصال.」；「صوت ذكاء اصطناعي على الجهاز، يعمل دون إنترنت.」（旧站）；「واستمع بصوت ذكاء اصطناعي يعمل على جهازك.」（旧站） |
| `se-hype` | 「جديد من فريق WordByWord: SurfEnglish.」（旧站）；「تعلَّم الإنجليزية بكفاءة أعلى.」（旧站）；「تعلّم أسرع مع SurfEnglish.」；「الترقية إلى SurfEnglish.」；「أفضل من التطبيقات الأخرى.」 |
| `hype` | 「الأول من نوعه في العالم.」；「تطبيق ثوري لترجمة المواقع.」；「أفضل تطبيق لتعلم اللغات.」；「رقم 1 في App Store.」；「التطبيق الوحيد من نوعه.」；「أكثر من 10,000 مستخدم.」；「ملايين المستخدمين حول العالم.」；「جديد من فريق WordByWord.」；「من صنّاع WordByWord.」（旧站）；「قل وداعًا لنسخ النصوص.」 |
| `ext-language-count` | 「يترجم إلى 20 لغة.」；「أكثر من 20 زوجًا لغويًا.」 |
| keyword-map `seOwned` | 「تعلم الإنجليزية مع الأخبار」；「تعلّم اللغة الإنجليزية على iPhone」；「أخبار إنجليزية مع الترجمة」；「اقرأ الأخبار بالإنجليزية」；「قراءة الإنجليزية كل يوم」；「استخراج المقاطع للجميع」；「مجموعات الكلمات」；「Chunks」 |
| keyword-map `seOwnedLead` | 「تتعلّم الإنجليزية؟ جرّب SurfEnglish」；「تعلم اللغة الإنجليزية مع الأخبار」；「هل تتعلم الإنجليزية؟」 |
| keyword-map `reservedG1` | 「كيف تترجم صفحات الويب على iPhone」；「ترجمة المواقع مع الاحتفاظ بالنص الأصلي」；「طريقة قراءة المواقع بلغتين」；「احتفظ بالأصل واقرأ الترجمة」 |

放行用例（不得误拦的通用学习词，文档 03 §1.4）："لمتعلمي اللغات"、"متعلمو اللغات"、"تعلم اللغات بقراءة المواقع"、"مساعد قراءة لمتعلمي اللغات على iPhone وiPad" —— `seOwned.ar` 0 命中。

## 附录 B：验证记录

| 命令 | 结果 |
|---|---|
| `node build.mjs --out …/dist`（HEAD 189a224 新副本 + ar.json + glossary，数据文件用真实仓库原文件） | 0 error；ar 3 条 W：L-4（7 个值与 en 相同：6 个文档 08 §1.5 预期项 + `meta.appStoreSubtitle`）、L-14 未覆盖 24 条、L-9 无 G1 |
| 同上，副本数据文件合入附录 A 词表 | 0 error；ar 只剩 L-4 |
| `node build.mjs --pseudo --out …/dist-pseudo` | 两种数据下均 0 error |
| `node scripts/check.mjs` | 0 error / 0 warning |
| `node scripts/check.mjs --keys ar` | 0 missing / 0 not in en |
| `node scripts/og.mjs --only home-ar` | ✓ 标题 64 px × 2 行、副标题 30 px × 2 行、126.7 KB（文件只留在副本） |
| `node --test scripts/tests/*.test.mjs` | 64/64 通过（两种数据下） |
| `node ar-work/ar-lint-test.mjs`（scratchpad） | 25 条规则 + 3 组关键词模式全部命中反例；放行用例 0 误拦；ar 文案 0 命中 |
| `node ar-work/plural-check.mjs`（scratchpad） | 16 个复数对象 × 8 个取值（0 / 1 / 2 / 5 / 11 / 21 / 100 / 103）全部渲染为合语法的阿语 |
| headless Chrome 1280 / 390 / 375 / 320 px | 无横向溢出；SE 卡片 339 / 421 / 421 / 421 px；390 px 页面高 12,751 px；红条顶端 761 px |
