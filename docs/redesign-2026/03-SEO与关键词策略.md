# WordByWord 官网重构 · 03 SEO 与关键词策略

| 项 | 内容 |
|---|---|
| 文档编号 | 03 |
| 版本 | v1.1 |
| 日期 | 2026-10-05 |
| 状态 | 设计稿（已评审修订） |
| 依赖文档 | `appendix/research/11-design-baseline.md`（主控基线，必须遵守）；`appendix/research/12-rulings.md`（主控裁定 R1–R84〔含 v1.3 第五节〕、统一待办 H1–H18，**优先于本文旧写法**）；`appendix/research/10-fact-check.md` §4 F1–F36（唯一可信事实来源）；研究 00（GSC 基线）、02（技术 SEO 审计）、03（SE 官网拆解）、05（产品事实）、06（SEO/GEO 实践）、07（关键词与竞品）、09（基础设施与风险）；`appendix/research/13-review-findings.json`（对抗性评审）；同批设计文档 01、02（均 v1.1）、04（SurfEnglish 推荐）、05（视觉）、06（技术架构）、07（实施计划）、08（文案底稿） |
| 读者 | 按此开工的工程师 / 产品负责人；locale 文案译者与母语复核人 |
| 标记 | 【决策】本文定案，开工照做；【裁定】直接落实主控裁定；【事实】可追溯到报告编号或 文件:行号；【建议】可按数据调整 |
| 引用写法 | 「研究 07 §5.1」指 `appendix/research/07-keyword-landscape.md` 第 5.1 节（研究 00–10 同理，研究 10 的冲突条目写作「研究 10 C18」）；「文档 02 §6.1」指本批设计文档 02；「F14」指研究 10 §4 的事实条目；「R46」指裁定；「H7」指裁定第三节统一编号的待提供清单 H1–H18；「基线 §B4」指 `11-design-baseline.md`；「SEO-01 / PRO-02 / I18-12」指评审条目。v1.0 中私设的 H7–H10 已删除，改按裁定编号引用（§10、§11） |

---

## 0. 摘要

1. 【事实】非英语几乎不命中的首因是架构（语言页无入链、无 sitemap、无 hreflang、有重复页），其次才是关键词（title/H1 全是"智能学习助手"类泛词，全站 "iPhone" 0 次），再次是内容质量（F30、F11、研究 02 §7）。架构修复由文档 02 / 文档 06 负责，本文负责**关键词、页面承载、结构化数据、技术 SEO 清单、内容路线与度量**。
2. 【裁定】定位不变（R39）：WBW 是"**用真实网页学外语的阅读助手**"（翻译 + 查词 + 朗读，覆盖多种语言），为学外语、读外语的人而做，不是纯翻译工具。它占 5 个搜索位置：P1 iPhone 网页双语对照（主战场）、P2 AI 语境查词、P3 X(Twitter) 双语阅读、P4 多语言（次要卖点，写清限制）、P5 "word by word translation" 长尾。通用的"语言学习 / learn languages by reading / 外语学习 / 外国語学習"属于 WBW，可进 title 后半、description、hero 副文与定义句；凡含"学英语 / 英语新闻 / 分级 / 语块 / 游戏 / 多读"意图的词归 SurfEnglish（基线 §B4）。
3. 【决策】关键词以**功能**为单位组织（K1–K10，§2），每个功能在 en / zh-Hans / zh-Hant / ja / ko 有 1 个主词 + 2–4 个次词，其余 15 个 locale 有主词（待母语复核）。所有措辞对齐 F13–F17：右滑、内置浏览器、非整页翻译、中日韩源文不支持双击、Chunks/Action Flow 仅英语。
4. 【裁定】**关键词 → URL 唯一映射**（R46，§1.6）：首页主词是**产品/品类意图**（en "bilingual web page translator app for iPhone"、zh-Hans"网页双语对照翻译 App"、ja/ko 保留含 アプリ/앱 的写法）；"how to translate web pages on iPhone (and keep the original)" 这类 how-to 查询只归 Phase 2 的 G1 指南。seoLint 断言同一主词只出现在一个 URL 的 title/H1。首页 title 模板 `<品牌位>：<K1 产品/品类主词 + 平台>｜<K2、差异点或受众>`，品牌在首；拉丁 ≤ 60 字符、CJK ≤ 32 全角宽度。20 个 locale 的 title / description / H1 已按新规则重写并逐条测长（§3.9），T1 五语为定稿级。
5. 【决策】品牌：`/` URL 与 "WordByWord" 首词不变以守住导航词 "wordbyword"（排名 1.6，F25）；H1 不放品牌名，由 eyebrow、首段定义句、title 首词承担（R27）；不为 "word by word" head term 优化，只用 FAQ + 指南承接 "word by word translation / meaning" 长尾；用 `/about/` + JSON-LD `alternateName` + 可见说明与 WordByWord.io 去歧义（F27）。
6. 【决策】JSON-LD `@graph`：WebSite（仅 `/`）+ WebPage + MobileApplication（`EducationalApplication`，界面语言用 `inLanguage`，不放 aggregateRating，SEO-09）+ Person（与 SE 共享 `@id` `https://surfenglish.app/about/#maker`，`name: "Jinlong"`、`alternateName: "Chi Jinlong"`，`sameAs` 与文档 04 §8.1 逐字一致，R17）。不建 Organization；不输出 FAQPage（R5、F26）；BreadcrumbList 只用于 about / 扩展页 / 指南。SE 侧配套改动见 §5.5（S1 已被 R17 否决；新增 S7 防蚕食，R52）。
7. 【决策】技术 SEO 按 §6 清单上线：自引用 canonical、hreflang 簇（首页 22 条：20 种语言 + `/pt-br/` 的 `pt` 别名 + x-default，R53；HTML 与 sitemap 同源生成）、robots、含 hreflang 与图片的 sitemap、"可索引 ⇔ 无 noindex ⇔ 自引用 canonical ⇔ 在 sitemap"（R49）、每 locale OG 图、只放 WBW 的 Smart App Banner、`<meta http-equiv="content-language">`（语言-地区写法，**不输出** Content-Language HTTP 头，R47）、`/legal/*` 不加 noindex（R48）、Bing + IndexNow（同一次推送覆盖 Bing / Yandex / Naver 等）、Naver Search Advisor（ko）、可选 Yandex（ru）；Baidu 低优先。
8. 【决策】Phase 1 只上 20 个首页 + `/about/` + 扩展页（en + zh-Hans，R1）+ 契约页 + en 404（R21）；Phase 2 四篇指南（G1 iPhone 网页双语阅读、G2 iPhone 双语读 X、G3 word-by-word vs sentence-by-sentence、G4 与 Immersive Translate 的诚实对比）；**不做"语言 × 功能"程序化批量页**。
9. 【建议】KPI（口径按 R18、R50）：locale 首页收录数、非品牌展示/点击（= 未筛选总量 − 品牌正则匹配量，记录匿名占比）、非英语展示（"网页"维度）、"word by word" 长尾单列、品牌守护（"wordbyword" 28 天平均排名 ≤ 2.0；品牌桶点击 ≥ 基线 80%）、SE 推荐点击、App Store `ct`（只按落点，R55）下载。点击类告警须连续两个 28 天窗口不达标才触发。监控节奏 T0 前 / T+0 / T+3 天 / T+7 天 / 2 周 / 4 周 / 6 周 / 12 周（§8.3），回退阈值见 §8.4。
10. 最大不确定性：没有搜索量数据（研究 07 §1）、GSC「网页」「国家」数据缺失（H1）、T2/T3 上线时只有 LLM 互检而无母语审校（R36、H7）；fr/de/it/nl/pl/ru/tr/uk 8 个 locale 没有任何 follow 外链（SEO-02）。§8 的目标值在拿到 H1 数据后重新标定。

---

## 1. 策略总纲

### 1.1 起点：现状为什么不命中

| 层 | 现状【事实】 | 证据 | 本文对应章节 |
|---|---|---|---|
| 架构 | 20 个语言页无任何站内入链（唯一一处是 `chrome-extension/index.html:319`），无 hreflang / canonical / sitemap / robots，`cn-top ≡ zh-top` | F2–F4、研究 02 §2.2 | §6（清单），URL 与切换器由文档 02 负责 |
| 关键词 | 21 个 title 都是 `WordByWord - <泛化"智能语言学习助手">`；"iPhone" 0 次；ru/uk/vi 等有错译或术语化（"посрочное""Quét""alineación"） | F11、研究 02 §1.2–1.3、研究 07 §2.3 | §2、§3 |
| 内容 | 非英语页 7 张同图 + 3 张 404 图；Chunks / X 适配 / 本地引擎均未提及；多处与产品不符（"无限 AI 发音""暗色模式""in your browser"） | F8、F11、研究 05 §7 | §2.1 事实边界、§4 |
| 实体 | "WordByWord" 与 WordByWord.io、Quran word-by-word、同名图书混淆；搜索摘要已把两家产品写成一个 | F27、研究 07 §3.1 | §1.5、§5 |

GSC 现状（F25，28 天）：71 次点击 / 1,286 次展示；"wordbyword" 40/130、排名 1.6；"word by word" 13/758、排名 6.5；没有功能词，也没有非英语查询进入前列（研究 00）。

### 1.2 把"用核心关键词介绍功能"落成规则

用户原话："最新的 SEO 优化应该是用更加核心的关键词来介绍/说明应用的各项功能。"【决策】落为 6 条规则：

1. **一功能一主词**：每个功能（K1–K10）在每种语言只有一个主关键词，取自该语言用户真实搜索的说法（研究 07 §5 的 autocomplete 证据），不从英文直译（研究 03 §2.4）。
2. **主词进入"高权重位"**：K1 主词（产品/品类意图，R46）进 title、description、首段定义句、OG；H1 写 K1 的动作 + 结果并含 K1 核心名词（网页 / web page …），可用 "translate web pages" 一类次词，但不得用 G1 的 how-to 主词（§1.6）；K2 主词进 title 后半或 description；其余功能主词进功能区 H3（"功能关键词 + 收益"句式，研究 03 §2.3）与 FAQ 问句。
3. **功能名 = App 内名称 + 搜索说法**：App 内名称（研究 05 §8 的 xcstrings 本地化名）保证与产品一致，搜索说法保证有人搜。例：ja H3「右スワイプ翻訳：Webページを原文のすぐ下に対訳表示」。
4. **只说真的**：每个关键词背后的能力必须能在 F13–F17 找到依据；有限制的（CJK 双击、Chunks 仅英语、无整页翻译）在同一屏写明。
5. **共享词带限定**：与 SE 共享的功能词（逐句、双击、语境）在 WBW 一律带"网页 / 任意语言 / iPhone"限定（基线 §B4）。
6. **H2 不写空口号**：每个 H2 至少包含一个功能词或场景词（避开 SE 的同类问题，研究 03 §1.13 #9）。
7. **一词一页**【裁定】：同一主词在同一语言里只由一个 URL 的 title/H1 承载（R46，§1.6），由 seoLint 断言。

### 1.3 WBW 要占的五个搜索位置

【裁定】定位（R39）：WBW 是"用真实网页学外语的阅读助手"——翻译 + 查词 + 朗读，覆盖多种语言，为学外语、读外语的人而做。下表 5 个位置是它的功能入口；**受众/定位词**（language learners、learn languages by reading、外语学习者、外語學習者、外国語学習、외국어 공부…）不单列为一个搜索位置，而是作为限定语进入 description、首段定义句、hero 副文与 FAQ "What is WordByWord"（§3.2、§3.5、§4.3），title 后半可选（§3.1）。

| # | 位置 | 意图 | 代表查询（en / zh-Hans / ja） | 承载页 | 优先级 | 诚实边界 |
|---|---|---|---|---|---|---|
| P1 | iPhone 上读网页并保留原文（双语对照） | 产品 / 品类（首页）＋ how-to（G1） | 首页：bilingual web page translator app for iPhone · bilingual reading app / 网页双语对照翻译 App · 网页翻译 App / webページ 翻訳 アプリ iphone · 対訳 表示 アプリ；G1：how to translate web pages on iPhone and keep the original / iPhone 网页翻译怎么保留原文 / iPhoneでWebページを翻訳して原文も残す方法 | 产品意图 → 20 个首页（title、hero、K1）；how-to → **只归 G1**（R46、§1.6） | **主** | 是"右滑段落 → 译文插入原文下方"，**不是整页一键翻译，也不是 Safari 扩展**（F14、F13） |
| P2 | AI 语境查词 | 工具 | word meaning in context · AI dictionary / AI 语境查词 · 双击查词 / 文脈 辞書 · ダブルタップ 辞書 | 首页 K2、FAQ | 次 | 中日韩**源文**不支持双击（F15） |
| P3 | X(Twitter) 双语阅读 | how-to + 工具 | translate x posts iphone / 推特翻译 / X 翻訳 原文 表示 | 首页 K9、G2 | 次 | Immersive Translate 的 iOS Safari 扩展也能翻 X 网页版（F29），WBW 的差异在内置浏览器支持 X 登录 + 右滑逐条 + 双击查词 |
| P4 | 多语言（不只英语） | 下载 / 信息 | read spanish websites with translation / 日语网页翻译 / 韓国語サイト 翻訳 | 首页 K8（语言段）、FAQ | 辅助 | 源语言默认英语、可自动识别和切换；CJK 源文只有右滑翻译与朗读可用；Chunks / Action Flow 仅英语（F15、研究 10 C15） |
| P5 | "word by word translation" 长尾 | 信息 | word by word translation · word by word meaning | FAQ #4、G3、`/about/` | 辅助 | 不碰 Quran / Bible 意图（研究 07 §3.2）；如实说明 WordByWord 是按句/段翻译 + 按词释义，不是逐词直译 |

**不占的位置**【决策】："learn English by reading""English news with translation""英语新闻双语对照""英語ニュース 対訳""영어 뉴스 읽기"等，以及"语块 / chunks / チャンク"作主词——归 SE（§1.4）。注意区分：不带"英语"的通用说法"learn languages by reading websites / 用网页学外语 / Webで外国語学習"属于 WBW（R39）；"Chunks / 语块"作为 WBW 的功能名可以出现在功能区 H3，但须带"English / 英语"限定，且不进 title / H1（R83，§1.4）。

### 1.4 关键词归属：WBW vs SurfEnglish

**归属规则**（基线 §B4，展开研究 07 §7.3）：

| 归属 | 判定 | WBW 中允许出现的位置 |
|---|---|---|
| WBW 独占 | 工具/翻译意图；含"网页 / 网站 / 任意网站 / X / iPhone 网页翻译 / 21 种语言 / 多语言 / Immersive 对比 / word by word translation"；**不带"英语"的通用学习/受众词**："language learners / learn languages by reading / 外语学习 / 外語學習 / 外国語学習 / 외국어 공부"（R39） | 全部位置（受众词不放 title 开头，§3.1） |
| SE 独占 | 含"英语/English + 学习"意图，或含新闻 / 分级 / 语块 / 游戏 / 多读 | **只**出现在 SE 落点 ① 卡片（zh-Hans 不渲染）、② FAQ 一问、④ 页脚家族链接、⑤ `/about/` 家族说明（R42 已删除 ③ 语言段提示）；作为**指向 SE 的锚文本**使用。不得进 WBW 页面的 title / H1 / description / OG / 功能区 H2；SE 区块自身的 H2 必须以 "SurfEnglish" 开头（R40，§4.4） |
| 共享功能词 | 逐句、双击、语境、对照 | WBW 加"网页 / 任意语言 / iPhone"限定；SE 加"英语新闻 / 英文网站"限定。SE 现网 "Any website, read bilingually / 任何网站，都能双语对照着读" 未加限定、直接占 K1 领地，由 SE 侧 S7 修正并加镜像 lint（R52、SEO-03，§5.5） |

> 【裁定 R83：基线 §B4 澄清】① SE 独占的"学习"词以**含"英语 / English"**为判据；不含"英语"的通用学习词（语言学习、learn languages by reading、外语学习、外国語学習、외국어 공부…）归 WBW（R39），不受上表 SE 行与 §1.4 禁用表限制。② "Chunks / 语块"作为 WBW 的功能名，可以出现在功能区 H3（K5），但必须带 "English / 英语"限定（如 "(English pages only)""（仅英文网页）""（英語ページのみ）"），且不进 title / H1（也不进 description / OG，见下）；除此之外，"语块"作主词仍归 SE。

**特殊情况：K5 Chunks / Action Flow**。【决策】它是 WBW 的真实功能（仅英语源文，F15），但"语块 / chunks"是 SE 的主词。WBW 页面里：
- 可以在功能区用一个 H3 介绍，名称用 App 内叫法（en "Chunk Extraction""Action Flow"；zh-Hans"语言块提取""句子动作脉络"），并带"仅英文网页"限定（R83：H3 中须出现"English / 英语 / 英文"一类限定词，§4.2 的示例均满足）；
- 不进 title / H1 / description / OG，不在 FAQ 里单独设"什么是语块"问题（那是 SE 首页 FAQ 的问题，研究 03 §2.4）。
- Action Flow 三种叫法统一用 App Store 的 "Action Flow"（研究 05 §8 使用提示）。

**禁用主词表**（用于 §3.8 lint：出现在 title / H1 / description / og:title / og:description 即构建失败；正文与推荐区块不受限）：

| locale | 禁用模式（不区分大小写） |
|---|---|
| en | `learn(ing)? English`、`English news`、`English learning`、`chunks?` |
| zh-Hans | `学英语`、`英语学习`、`英语新闻`、`英语阅读`、`语块`、`语言块` |
| zh-Hant | `學英文`、`英文學習`、`英文新聞`、`英文閱讀`、`語塊`、`語言塊` |
| ja | `英語学習`、`英語ニュース`、`英語多読`、`英語リーディング`、`チャンク` |
| ko | `영어 공부`、`영어 학습`、`영어 뉴스`、`영어 읽기`、`청크`、`표현 묶음` |
| es / pt-BR | `aprender inglés`、`noticias en inglés` / `aprender inglês`、`notícias em inglês` |
| fr / de / it / nl | `apprendre l'anglais` / `Englisch lernen` / `imparare l'inglese` / `Engels leren` |
| pl / ru / uk / tr | `nauka angielskiego` / `(учить\|изучение) английск` / `(вчити\|вивчення) англійськ` / `İngilizce öğren` |
| vi / th / id | `học tiếng Anh`、`tin tiếng Anh` / `เรียนภาษาอังกฤษ`、`ข่าวภาษาอังกฤษ` / `belajar bahasa Inggris`、`berita bahasa Inggris` |
| ar / hi | `تعلم الإنجليزية` / `अंग्रेज़ी सीख`、`इंग्लिश न्यूज़` |

> 例外：ja 次关键词「英語サイト 翻訳 アプリ」是"翻译英文网站"的工具意图，不含学习意图，允许出现在 description 和正文，但不放在 title 开头（§2.2）。

**不得误拦的通用学习词**【裁定】（R39、PRO-02）：禁用表只针对"英语 + 学习"与 SE 品类词，下列说法必须能通过 §3.8 的 lint，并作为 lint 自测用例写进 `scripts/fixtures/`：en "language learners""learn languages by reading"；zh-Hans"外语学习者""用网页学外语"；zh-Hant"外語學習者"；ja「外国語を学びながら」「外国語学習」；ko「외국어 공부」；es "aprender idiomas"；de "Sprachlernende"；ru "изучающих языки"；vi "người học ngoại ngữ"；th "ผู้เรียนภาษา"；ar "لمتعلمي اللغات"；hi "भाषा सीखने वालों"。（上述模式与禁用表无重叠：例如 ja `英語学習` 不匹配「外国語学習」，ko `영어 공부` 不匹配「외국어 공부」。）

**替换性措辞禁用**【裁定】（R40）：WBW 全站（含 SE 卡片、FAQ、about）不得出现把 SE 写成 WBW 替代品的说法，seoLint 对全页可见文本报 error：en `may suit you better|better fit|instead of WordByWord`、zh `可能更适合你|更适合你`、ja `(の方|のほう)が合う|より合う`、ko `더 잘 맞`；其余 locale 由文档 08 的 claims-lint 词表补齐（文档 06 L-14 / D-15）。

### 1.5 品牌词策略与去歧义

| 对象 | 现状【事实】 | 策略【决策】 |
|---|---|---|
| 导航词 "wordbyword" | 40 点击 / 130 展示，排名 1.6，CTR 30.8%（F25） | `/` URL 不变（基线 §C）；en title 首词保持 "WordByWord"；首段定义句以 "WordByWord is…" 开头；eyebrow 含品牌、logo alt = "WordByWord"，H1 不放品牌名（R27）；WebSite `name` = "WordByWord"；改版后按 §8.4 监控（阈值 R18），触发警戒先回退 title 文案 |
| 拼写变体 "word-by-word"、"wordby" | 60 / 6 展示 | 由域名 + 品牌连写自然覆盖，不单独优化 |
| 通用短语 "word by word" | 758 展示、CTR 1.7%，意图多为释义、Quran、词典书（研究 07 §3.1） | **不追 head term**，接受改版后展示下降；不在 title/H1 中用分写的 "Word by Word"（现 H1 正是如此，F11）。保留 "Word by Word" 作 WebSite / MobileApplication 的 `alternateName` 和 `/about/` 中的一句可见说明（"sometimes written 'Word by Word'"），给真正找品牌的人兜底 |
| 长尾 "word by word translation / meaning / translate" | 16 / 17 / 1 展示，排名 16.6 / 23 / 3.0 | FAQ #4（§4.3）+ 指南 G3（§7.2）+ `/about/` 承接；回答"WordByWord 不是逐词直译，而是按句/段翻译 + 按词给语境释义" |
| 同名实体 | WordByWord.io（Chrome 扩展 + 词汇平台，634 URL，en/ru/de）；CWS 上的 "WordByWord – Vocabulary Highlighter"；Quran Word by Word 系列 App；同名图书（F27） | ① `/about/` 设 "Not to be confused with" 小节，点名 WordByWord.io 与其 Chrome 扩展"与本产品无关"（基线 §C 已定；该声明只放 `/about/` 与扩展页，R15）；声明以链接到 App Store 开发者页（锚文本 "WordByWord on the App Store"）的方式指明官方 App，页面可见文本不出现 "Chi Jinlong"，该名只作 JSON-LD Person 的 `alternateName`（R81）；② JSON-LD 用 `sameAs` 指向本 App 的 App Store 页与开发者页；③ 每页可见文本固定出现"iPhone / iPad 应用"这一描述性后缀；④ Chrome 扩展页 title 用扩展的正式名 "WordByWord Translate for Chrome"（§3.10），与 "Vocabulary Highlighter" 区分 |
| App Store 本地化名 | en "WordByWord Translate"、zh-Hant "WordByWord翻譯"、ru "WordByWord Переводчик"，其余 "WordByWord"（F17） | 全部进 MobileApplication `alternateName`；**zh-Hant 与 ru 首页 title 的品牌位使用 App Store 本地化名**（这两个名称本身带"翻譯 / Переводчик"品类词，且与该语种 App Store 搜索结果一致）；其余 locale 用 "WordByWord" |
| 写法统一 | 站内混用 "Word by Word" 与 "WordByWord"（研究 02 §1.4） | 可见文本、alt、og:site_name 一律 "WordByWord"（连写，W 与 B、W 大写） |

### 1.6 关键词 → URL 唯一映射表（R46、SEO-01）

【裁定】下表是"哪类查询由哪个 URL 的 title / H1 承载"的唯一规格。同一语言内，一个主词只能出现在**一个 URL** 的 title 或 H1 中；其它页面可以在正文、FAQ、锚文本里提到它，但不能放进 title / H1。G1–G4 上线前，它们的 how-to / 比较类主词在任何页面的 title / H1 中都不出现：宁可暂时空缺，也不让首页去接信息意图。理由：这类 SERP 被 Apple 支持页与 how-to 博客占据（研究 07 §0 #9），产品落地页与查询意图不匹配，还会和 G1 互相蚕食。

| # | 查询簇 | 意图 | 主词（en / zh-Hans / zh-Hant / ja / ko） | 唯一承载 URL（title + H1） | 其它页面允许的用法 |
|---|---|---|---|---|---|
| M1 | 网页双语对照 App（P1 产品意图） | 商业 / 下载 | bilingual web page translator app for iPhone / 网页双语对照翻译 App / 網頁雙語對照翻譯 App / Webページ 翻訳・対訳 アプリ / 아이폰 웹페이지 번역 앱；其余 15 个 locale 见 §2.3 表 A 的 K1 | 该语言的首页（`/`、`/<locale>/`） | G1 正文用品牌锚链回首页；about、扩展页正文可提 |
| M2 | 在 iPhone 上翻译网页并保留原文（P1 how-to） | 信息 | how to translate web pages on iPhone and keep the original / iPhone 网页翻译怎么保留原文 / iPhone 網頁翻譯如何保留原文 / iPhoneでWebページを翻訳して原文も残す方法 / 아이폰 웹페이지 번역 원문 같이 보는 방법 | G1 `/guides/read-web-pages-bilingually-iphone/` 及其本地化版本（Phase 2） | 首页 H1 可含 "translate web pages / 网页翻译" 作次词；首页 title、H1、最终 CTA 标题不得出现 how-to 句式（how to / 怎么 / 如何 / 方法 / 방법），也不得与 G1 标题重复；Phase 2 起首页 K1 H3 下放一条指向 G1 的描述性锚文本 |
| M3 | AI 语境查词（P2） | 工具 | word meaning in context (AI dictionary) / AI 语境查词 / AI 語境查單字 / 文脈がわかるAI辞書 / AI 사전 | 首页（title 后半或 description + K2 H3） | G6（Phase 3）若上线，主词取"AI 语境查词是什么"的信息意图，与首页区分 |
| M4 | X(Twitter) 双语阅读（P3） | how-to + 工具 | how to read X (Twitter) posts bilingually on iPhone / 在 iPhone 上双语看推特 / 在 iPhone 上雙語看推特 / iPhoneでXのポストを原文と訳文で読む方法 / 아이폰에서 트위터 게시물 원문과 번역 같이 보기 | G2（Phase 2） | 首页只在 K9 H3 写功能句（"Read X (Twitter) posts bilingually in the built-in browser"），不写 how-to |
| M5 | word by word translation（P5） | 信息 | word-by-word vs sentence-by-sentence translation | G3（Phase 2） | 首页 FAQ #4、`/about/` 正文；任何 title / H1 不用分写的 "Word by Word" |
| M6 | 与 Immersive Translate 比较 | 比较 | immersive translate iphone / alternative；沉浸式翻译 iPhone；イマーシブ翻訳 アプリ | G4（Phase 2） | 首页不出现竞品名（§7.2 G4） |
| M7 | 品牌导航 "wordbyword" | 导航 | WordByWord | `/`（en title 首词） | 所有页面 title 的品牌位 |
| M8 | 产品实体与去歧义 | 导航 / 信息 | About WordByWord；WordByWord vs WordByWord.io | `/about/` | 扩展页写一句无关声明（R15） |
| M9 | Chrome 扩展 | 下载 | WordByWord Translate for Chrome；bilingual translation Chrome extension；网页双语对照翻译扩展 | `/chrome-extension/`、`/zh-hans/chrome-extension/`（仅 S1 可索引，R1、R2） | 首页 FAQ 在 S0 下不写扩展名称（R45） |

**落到构建**【决策】：每个可索引页面在 locale JSON 中声明 `seo.primary`（主词原文，供人读）与 `seo.primaryTokens`（判定用词元，不区分大小写；拉丁 / 西里尔 / 阿拉伯文字按整词匹配，避免 "App" 命中 "appears"；中日韩、泰文、天城文按子串匹配）。`seoLint` 跨页面断言：在同一 locale 内，**title 或 H1 同时包含页面 X 全部 `primaryTokens` 的页面集合恰好是 {X}**（§3.8 `uniquePrimary()`）；另对首页的 `#cta` H2 做同样检查，防止收尾 CTA 复述 G1 标题（SEO-01）。词元取"能区分意图"的最小集合：

| locale | 首页 `primaryTokens` | G1 `primaryTokens`（Phase 2 启用） |
|---|---|---|
| en | `["Web Page","App","iPhone"]` | `["How to","Keep the Original"]` |
| zh-Hans | `["网页","双语对照","App"]` | `["怎么","保留原文"]` |
| zh-Hant | `["網頁","雙語對照","App"]` | `["如何","保留原文"]` |
| ja | `["Webページ","アプリ"]` | `["方法","原文も残す"]` |
| ko | `["웹페이지","앱"]` | `["방법","원문"]` |
| 其余 15 个 | `"iPhone"` + §3.9 title 中的产品词（es traductor、pt-BR tradutor、fr traducteur、de Übersetzer-App、it traduttore、nl vertaalapp、pl tłumacz、ru Переводчик、tr uygulaması、uk перекладач、vi ứng dụng、th แอป、id aplikasi、ar تطبيق、hi ऐप） | G1 本地化时再定（Phase 3） |

---

## 2. 功能 × 关键词主表

### 2.1 功能清单与事实边界

只收录产品真实存在的功能（F13–F16、研究 05 §2.4）。**不存在、不得出现**：整页一键翻译、Safari 扩展/分享扩展、"任何 App 里翻译"、左滑、主题/暗色模式、快捷键、音量、生词本/闪卡/复习游戏、账号同步、"无限 AI 发音"、"不收集任何个人数据"（F11、F16、研究 05 §2.4 末段、基线 §B2）。

| K | 功能（App 内英文名） | 真实行为与边界【事实】 | 免费 / Plus 每日额度（F16） | 关键词地位 |
|---|---|---|---|---|
| K1 | 右滑翻译 / 双语对照（Swipe to Translate） | 在 **App 内置浏览器**（地址栏、多标签、收藏）中对段落**向右滑动**，译文插在原文下方；显示方式 Auto / Paragraph / Sentence by Sentence；结果可自动或手动显示；多种译文样式（默认引用条；源码共 7 种，对外文案不写数量，写"引用条、背景、边框、下划线…"，R26） | 云端 50 / 500；本地 100 / 不限；右滑发音 10 / 100 | 全站主词 |
| K2 | 双击 AI 语境查词（Double-tap to Look Up, AI Meaning）+ More Definitions | 双击单词 → 语境义、短语优先、发音；More 给完整释义、例句、词形；**中日韩源文不可用** | 双击 20 / 500；双击发音 10 / 200；More 10 / 500 | 第二主词 |
| K3 | AI 朗读 / 发音（AI Read / Local Read） | 云端 AI 语音（自然、较慢）或 iOS 本地语音（快、可选已下载的增强语音、语速档位）；Local Read 本身就是端侧 iOS 语音，任何文案不得把"端侧语音"写成 SE 独有（R41） | AI 发音见上；本地语音不限 | 功能区 H3 |
| K4 | AI 句法解析（AI Syntax Structure Analysis） | 对整句给出 AI 语法结构解释，入口在右滑翻译详情 / 历史（研究 08 §3.6） | 5 / 500 | 功能区 H3 |
| K5 | 语言块 Chunks（Chunk Extraction）& Action Flow | 翻译后标出短语块、句子核心动作与关联动作；自动 / 手动 / 关闭；**仅英语源文** | Chunks 30 / 500；Action Flow 20 / 500 | 不争主词（§1.4） |
| K6 | 历史回顾（Translation History / 查词历史） | 右滑翻译历史 + 查词历史（按上下文分组，约 1000 组），可清空。各语言命名避开"搜索记录"类说法（在 ja/ko 等语言里默认指浏览器搜索记录）：ja 用 App 叫法「スワイプ翻訳履歴」「単語履歴一覧」（PRO-14），ko 用「번역 기록·단어 찾기 기록」（I18-12） | — | 功能区 H3（弱） |
| K7 | 翻译引擎选择 | Cloud（"currently backed by Azure and Google"）或 Local（iOS 系统翻译，首次可能需下载语言资源）；云端额度用完可一键切本地重试；能否离线未验证，不写"离线"（H13） | 见 K1 | 功能区设置行 / FAQ |
| K8 | 语言支持 | 界面 20 种；译文目标 21 个 locale；源语言默认英语，按页面内容自动识别，也可手动切换 | — | 语言段 H2 |
| K9 | X(Twitter) 适配 | 内置浏览器兼容 X 登录流程；新手引导把 X 列为首推场景；App Store 写 "Optimized for X" | — | 功能区 H3 + G2 |
| K10 | 免费可用 + Plus | 免费下载、每日额度；唯一 IAP 为 Plus 月订（US $3.99），各地价格以 App Store 显示为准 | 见上 | 价格段 H2 / FAQ |

平台描述统一为："iPhone 和 iPad（iOS / iPadOS 18 及以上），也可在 Apple 芯片 Mac（macOS 15+）与 Apple Vision Pro 上运行"（F13）。

### 2.2 T1 五种语言：主关键词 + 次关键词

依据列中 "AC✓" 指研究 07 §5 中该说法在 Google/Baidu 联想里出现过（有需求信号，无量级数据）。

每张表首行"定位"是 R39 的受众/定位词：不单独成为一个 K，也不放 title 开头；进入 description、首段定义句、hero 副文与 FAQ "What is WordByWord"。K1 主词按 R46 改为产品/品类意图（v1.0 的 how-to 主词移到 G1，§1.6 M2）。

**en**

| K | 主关键词 | 次关键词 | 依据 / 备注 |
|---|---|---|---|
| 定位 | reading assistant for language learners | learn languages by reading real websites；bilingual web reader | R39；旧站与 App Store 都是"language learning assistant"（研究 05 §2.1–2.2） |
| K1 | bilingual web page translator app for iPhone | bilingual reading app for any website；side-by-side translation app；translation below the original；translate web pages（H1 次词） | R46、SEO-01；AC✓（研究 07 §5.1 #1–4）。承载句必须同时出现 "swipe (right on) a paragraph"，不写 "one tap""whole page"。"how to translate web pages on iPhone (and keep the original)" 归 G1 |
| K2 | word meaning in context (AI dictionary) | double-tap to look up a word；phrase and idiom meanings；example sentences and word forms | 研究 07 §5.1 #8；不写 "tap"（是双击） |
| K3 | AI read-aloud and pronunciation | text to speech for web pages；hear how a sentence sounds；iOS voices with speed control | 研究 05 §2.4 #10 |
| K4 | AI sentence structure analysis | break down long sentences；grammar of a sentence explained | 研究 05 §2.4 #9 |
| K5 | （不争 → SE） | 正文称 "Chunk Extraction" / "Action Flow (English pages only)" | §1.4 |
| K6 | translation and lookup history | review looked-up words in context；swipe translation history | 不写 "vocabulary list""flashcards" |
| K7 | cloud or on-device translation | translation by Azure and Google；Apple on-device translation (iOS) | 不写 "offline"（未验证，H13） |
| K8 | translate into 21 languages | app in 20 languages；detects the page language automatically；read Spanish, French or German websites with translation | 举例优先非 CJK 源语言（双击可用） |
| K9 | translate X (Twitter) posts on iPhone | read tweets with the original；X translation in a built-in browser | 研究 07 §5.1 #5（AC✓） |
| K10 | free translation app for iPhone | daily free limits；WordByWord Plus price | F16 |

**zh-Hans**

| K | 主关键词 | 次关键词 | 依据 / 备注 |
|---|---|---|---|
| 定位 | 外语学习者的网页阅读助手 | 用网页学外语；为边读外语网页边学语言的人设计 | R39、PRO-02 |
| K1 | 网页双语对照翻译 App（iPhone） | iPhone 网页翻译 App；原文下方显示译文；网页逐句对照翻译；右滑翻译 | R46；研究 07 §5.2 #1–2（AC✓）。"iPhone 网页翻译怎么保留原文"归 G1。"逐句翻译"单用被文言文占（Baidu），只用带"网页"的组合；不用"划词翻译"（交互是右滑段落，用户预期是选词弹窗，研究 05 §7 #8） |
| K2 | AI 语境查词 | 双击查词；单词在句子里的意思；短语释义与例句；词形变化 | "上下文查词"是 SE 关键词 → WBW 写"网页 / 任意语言 + 语境查词" |
| K3 | AI 朗读 | 网页朗读；单词发音；iOS 本地语音朗读 | |
| K4 | AI 句子结构解析 | 长难句解析；语法结构分析 | "长难句"多为英语考试语境 → 正文写"外语长句"，不写"英语" |
| K5 | （不争 → SE） | 正文称"语言块提取""句子动作脉络（仅英文网页）" | |
| K6 | 翻译与查词历史 | 查词记录回顾；右滑翻译历史 | 不写"生词本" |
| K7 | 云端 / 本地翻译引擎 | iOS 系统翻译；Azure 与 Google 翻译 | |
| K8 | 21 种语言网页翻译 | 日语网页翻译；韩语网页翻译；界面 20 种语言；自动识别网页语言 | 日韩源文只写"右滑翻译、朗读可用" |
| K9 | 推特（X）双语翻译 | X 推文翻译中文；推特翻译 iPhone；推特原文译文对照 | 研究 07 §5.2 #5（AC✓） |
| K10 | 免费网页翻译 App | 每日免费额度；WordByWord Plus 价格 | |

**zh-Hant**（台湾用语：單字、點兩下、內建、紀錄、介面，研究 07 §5.3；完整的网站用词对照表与禁用表见文档 08 §7.2.2 与 `src/data/glossary/zh-Hant.json`，R64、I18-07。App 的 zh-TW 界面本身带大陆用语，引用 App 按钮名时照 App，正文用台湾用语）

| K | 主關鍵詞 | 次關鍵詞 | 备注 |
|---|---|---|---|
| 定位 | 外語學習者的網頁閱讀助手 | 用網頁學外語 | R39 |
| K1 | 網頁雙語對照翻譯 App（iPhone） | iPhone 網頁翻譯 App；網頁翻譯推薦；原文下方顯示譯文；右滑翻譯 | R46；研究 07 §5.3 #1–3（AC✓）。title 品牌位"WordByWord翻譯"已含"翻譯"（§1.5） |
| K2 | AI 語境查單字 | 點兩下查單字；單字在句子裡的意思；片語解釋與例句 | 研究 07 §5.3 用词表 |
| K3 | AI 朗讀 | 網頁朗讀；單字發音 | |
| K4 | AI 句子結構解析 | 長句解析；文法結構分析 | |
| K5 | （不争 → SE） | 正文稱「語言塊提取」「句子動作脈絡（僅英文網頁）」 | |
| K6 | 翻譯與查詢紀錄 | 查單字紀錄複習；右滑翻譯紀錄 | |
| K7 | 雲端／裝置端翻譯引擎 | iOS 系統翻譯 | |
| K8 | 21 種語言網頁翻譯 | 日文網站翻譯；介面 20 種語言 | |
| K9 | X（推特）雙語翻譯 | 推特翻譯 iPhone；推文原文譯文對照 | |
| K10 | 免費網頁翻譯 App | 每日免費額度 | |

**ja**

| K | 主キーワード | サブキーワード | 备注 |
|---|---|---|---|
| 定位 | 外国語を学びながらWebを読む人のためのアプリ | 外国語学習；Webで外国語を学ぶ | R39、PRO-02 |
| K1 | Webページ 翻訳・対訳 アプリ（iPhone） | iPhoneでWebページを対訳表示；原文と訳文を並べて表示；英語サイト 翻訳 アプリ；右スワイプ翻訳 | R46（保留含アプリ的写法）；研究 07 §5.4 #1–4（AC✓；"原文併記"的 iPhone 角度几乎无人覆盖）。「なぞって翻訳」无需求（AC×），只作 UI 叫法。「…原文も残す方法」归 G1 |
| K2 | 文脈がわかるAI辞書 | ダブルタップ 辞書；文脈 意味 辞書；熟語・イディオムの意味；例文と語形変化 | 研究 07 §5.4 #7 |
| K3 | AI読み上げ | Webページ 読み上げ アプリ；単語の発音 | 研究 07 §5.4 #8 |
| K4 | AI文構造解析 | 長い文の構造を解説；文法構造の解説 | |
| K5 | （不争 → SE） | 正文称「チャンク抽出」「文の動きの流れ（英語ページのみ）」 | |
| K6 | 翻訳履歴・単語履歴 | スワイプ翻訳履歴；調べた単語を文脈ごとに復習 | PRO-14：「検索履歴」在日语里通常指浏览器搜索记录；用 App 叫法（xcstrings `view_title_swipe_history`「スワイプ翻訳履歴」、`view_title_translation_history`「単語履歴一覧」） |
| K7 | クラウド／オンデバイス翻訳エンジン | iOS の翻訳機能；Azure・Google 翻訳 | |
| K8 | 21言語に翻訳 | 韓国語サイト 翻訳；中国語 ウェブページ 翻訳；アプリ表示20言語 | 研究 07 §5.4 #9。中韩源文只有右滑翻译与朗读 |
| K9 | X（旧Twitter）翻訳 原文表示 | X 翻訳 iPhone；ポスト 翻訳 対訳 | 研究 07 §5.4 #6（AC✓，大量排障类查询 → G2） |
| K10 | 無料 翻訳アプリ iPhone | 1日の無料枠；WordByWord Plus 料金 | |

**ko**（Naver 份额高，见 §6.3）

| K | 주 키워드 | 보조 키워드 | 备注 |
|---|---|---|---|
| 定位 | 외국어 공부용 웹페이지 읽기 앱 | 웹으로 외국어 공부 | R39 |
| K1 | 아이폰 웹페이지 번역 앱 | 웹페이지 번역 앱；원문·번역 같이 보기；원문 아래 번역 표시；웹페이지 문장별 번역 | R46（保留含앱的写法）；研究 07 §5.5 #1–4。不单用"대역"（被 대역폭 等占）。「…원문 같이 보는 방법」归 G1 |
| K2 | AI 사전 | 문맥 단어 뜻；두 번 탭 단어 뜻；숙어·표현 뜻；예문과 어형 변화 | I18-12：v1.0 的「문맥에 맞는 뜻 AI 사전」是硬拼词组。H3 写「두 번 탭하면 AI 사전이 문맥에 맞는 뜻을 알려 줘요」 |
| K3 | AI 읽어주기 | 웹페이지 읽어주기；단어 발음 듣기 | |
| K4 | AI 문장 구조 분석 | 긴 문장 구조 풀이；문법 구조 분석 | SE ko 关键词含"구문 분석"→ WBW 写"웹페이지 긴 문장" |
| K5 | （不争 → SE） | 正文称「청크 추출」「문장 동작 흐름(영어 페이지만)」 | |
| K6 | 번역 기록·단어 찾기 기록 | 찾아본 단어 복습 | I18-12：「검색 기록」默认指浏览器搜索记录 |
| K7 | 클라우드/기기 내 번역 엔진 | iOS 기본 번역 | |
| K8 | 21개 언어로 번역 | 일본어 웹페이지 번역；앱 화면 20개 언어 | |
| K9 | 트위터(X) 번역 원문 같이 보기 | 트위터 번역 아이폰；X 게시물 번역 | 研究 07 §5.5 #6 |
| K10 | 무료 번역 앱 아이폰 | 하루 무료 사용량 | |

> ko 语体（I18-12）：`meta.description` 与 FAQ 答案用합니다체；hero、功能卡片、按钮用해요체；同一段落不混用。首段定义句位于 hero，用해요체；FAQ "WordByWord는 무엇인가요?" 的答案用同一内容的합니다체版本（§3.5）。

### 2.3 其余 15 个 locale：主关键词（全部【待母语复核】）

原则：用该语言联想中出现的说法作骨架（研究 07 §5.6–5.16），避开研究 07 §2.3 列出的术语化 / 错译词（alineación、Hizalama、محاذاة، संरेखण、"Quét"、"посрочное"、"Selecione/Seleziona"）。K5 在所有 locale 均不设主词，正文用研究 05 §8 的 App 内名称 + "仅英文网页"本地化限定。hi 用户常用英文或 Hinglish 搜索（研究 07 §5.16），hi 页正文可自然出现一次英文 "website translate"。

**表 A：K1–K4**

| locale | K1 产品/品类主词（R46；括号内为 v1.0 的动词式，降为 H1/正文次词，并作为 G1 本地化时的 how-to 主词候选） | K2 AI 语境查词 | K3 AI 朗读 | K4 AI 句法解析 |
|---|---|---|---|---|
| es | traductor bilingüe de páginas web para iPhone（次词：traducir páginas web en iPhone） | significado de una palabra en contexto (IA) | lectura en voz alta con IA | analizar la estructura de una oración con IA |
| pt-BR | tradutor bilíngue de páginas da web para iPhone（次词：traduzir páginas da web no iPhone） | significado da palavra no contexto (IA) | leitura em voz alta com IA | análise da estrutura da frase com IA |
| fr | traducteur bilingue de pages web pour iPhone（次词：traduire une page web sur iPhone） | sens d'un mot en contexte (IA) | lecture à voix haute par IA | analyse de la structure d'une phrase par IA |
| de | Übersetzer-App für Webseiten (iPhone)（次词：Webseite übersetzen auf dem iPhone） | Wortbedeutung im Kontext (KI) | Text vorlesen lassen mit KI | Satzstruktur mit KI analysieren |
| it | traduttore bilingue di pagine web per iPhone（次词：tradurre pagine web su iPhone） | significato di una parola nel contesto (IA) | lettura ad alta voce con IA | analisi della struttura della frase con IA |
| nl | vertaalapp voor webpagina’s (iPhone)（次词：website vertalen op iPhone） | betekenis van een woord in context (AI) | voorlezen met AI-stem | zinsbouw analyseren met AI |
| pl | dwujęzyczny tłumacz stron WWW na iPhone’a（次词：tłumaczenie stron na iPhonie） | znaczenie słowa w kontekście (AI) | czytanie na głos głosem AI | analiza budowy zdania z AI |
| ru | переводчик сайтов для iPhone（次词：перевод сайтов на iPhone） | значение слова в контексте (ИИ) | озвучка текста голосом ИИ | разбор предложения с помощью ИИ |
| tr | iPhone için web sayfası çeviri uygulaması（次词：iPhone'da web sitesi çevirme） | bağlama göre kelime anlamı (yapay zekâ) | yapay zekâ ile sesli okuma | yapay zekâ ile cümle yapısı analizi |
| uk | двомовний перекладач сайтів для iPhone（次词：переклад сайтів на iPhone） | значення слова в контексті (ШІ) | озвучення тексту голосом ШІ | розбір речення за допомогою ШІ |
| vi | ứng dụng dịch trang web song ngữ trên iPhone（次词：dịch trang web trên iPhone） | tra từ theo ngữ cảnh bằng AI | đọc văn bản bằng giọng AI | phân tích cấu trúc câu bằng AI |
| th | แอปแปลเว็บไซต์สองภาษาบน iPhone（次词：แปลเว็บไซต์บน iPhone） | ความหมายคำตามบริบทด้วย AI | อ่านออกเสียงด้วย AI | วิเคราะห์โครงสร้างประโยคด้วย AI |
| id | aplikasi terjemahan halaman web untuk iPhone（次词：terjemahkan halaman web di iPhone） | arti kata sesuai konteks dengan AI | bacakan teks dengan suara AI | analisis struktur kalimat dengan AI |
| ar | تطبيق ترجمة ثنائية اللغة لصفحات الويب على iPhone（次词：ترجمة صفحات الويب على iPhone） | معنى الكلمة حسب السياق بالذكاء الاصطناعي | القراءة بصوت الذكاء الاصطناعي | تحليل بنية الجملة بالذكاء الاصطناعي |
| hi | iPhone के लिए द्विभाषी वेब पेज अनुवाद ऐप（次词：iPhone पर वेबसाइट का अनुवाद） | संदर्भ के अनुसार शब्द का अर्थ (AI) | AI आवाज़ में पढ़कर सुनाना | AI से वाक्य संरचना का विश्लेषण |

**表 B：K6–K10**

| locale | K6 历史 | K7 翻译引擎 | K8 语言 | K9 X 适配 | K10 免费 |
|---|---|---|---|---|---|
| es | historial de traducciones y palabras consultadas | traducción en la nube o en el dispositivo | traducción a 21 idiomas | traducir publicaciones de X (Twitter) en iPhone | app de traducción gratis para iPhone |
| pt-BR | histórico de traduções e palavras consultadas | tradução na nuvem ou no dispositivo | tradução para 21 idiomas | traduzir posts do X (Twitter) no iPhone | app de tradução grátis para iPhone |
| fr | historique des traductions et des mots consultés | traduction dans le cloud ou sur l'appareil | traduction en 21 langues | traduire des posts X (Twitter) sur iPhone | application de traduction gratuite pour iPhone |
| de | Verlauf von Übersetzungen und nachgeschlagenen Wörtern | Übersetzung in der Cloud oder auf dem Gerät | Übersetzung in 21 Sprachen | X-Posts (Twitter) übersetzen auf dem iPhone | kostenlose Übersetzer-App fürs iPhone |
| it | cronologia di traduzioni e parole consultate | traduzione cloud o sul dispositivo | traduzione in 21 lingue | tradurre i post di X (Twitter) su iPhone | app di traduzione gratis per iPhone |
| nl | geschiedenis van vertalingen en opgezochte woorden | vertalen in de cloud of op het apparaat | vertalen naar 21 talen | X-berichten (Twitter) vertalen op iPhone | gratis vertaalapp voor iPhone |
| pl | historia tłumaczeń i sprawdzonych słów | tłumaczenie w chmurze lub na urządzeniu | tłumaczenie na 21 języków | tłumaczenie postów z X (Twittera) na iPhonie | darmowa aplikacja do tłumaczenia na iPhone'a |
| ru | история переводов и поиска слов | облачный или локальный перевод | перевод на 21 язык | перевод постов в X (Twitter) на iPhone | бесплатный переводчик для iPhone |
| tr | çeviri ve bakılan kelime geçmişi | bulutta veya cihazda çeviri | 21 dile çeviri | X (Twitter) gönderilerini iPhone'da çevirme | iPhone için ücretsiz çeviri uygulaması |
| uk | історія перекладів і пошуку слів | хмарний або локальний переклад | переклад 21 мовою | переклад дописів у X (Twitter) на iPhone | безкоштовний перекладач для iPhone |
| vi | lịch sử dịch và tra từ | dịch trên đám mây hoặc trên thiết bị | dịch sang 21 ngôn ngữ | dịch bài đăng X (Twitter) trên iPhone | ứng dụng dịch miễn phí cho iPhone |
| th | ประวัติการแปลและการค้นหาคำ | แปลบนคลาวด์หรือในเครื่อง | แปลได้ 21 ภาษา | แปลโพสต์ X (Twitter) บน iPhone | แอปแปลภาษาฟรีบน iPhone |
| id | riwayat terjemahan dan pencarian kata | terjemahan cloud atau di perangkat | terjemahan ke 21 bahasa | terjemahkan postingan X (Twitter) di iPhone | aplikasi terjemahan gratis untuk iPhone |
| ar | سجل الترجمات والبحث عن الكلمات | ترجمة سحابية أو على الجهاز | الترجمة إلى 21 لغة | ترجمة منشورات X (تويتر) على iPhone | تطبيق ترجمة مجاني لـ iPhone |
| hi | अनुवाद और शब्द खोज का इतिहास | क्लाउड या डिवाइस पर अनुवाद | 21 भाषाओं में अनुवाद | iPhone पर X (Twitter) पोस्ट का अनुवाद | iPhone के लिए मुफ़्त अनुवाद ऐप |

> 表 B 的 K6：es / pt-BR / fr / de / it / nl / pl / tr 的 v1.0 写法（búsquedas、consultas、recherches、Suchverlauf、ricerche、opzoekingen、wyszukiwań、arama geçmişi）同样容易被理解为浏览器搜索记录，按 PRO-14 / I18-12 的同一理由改为"查过的词"。

**表 C：定位词与 iPhone 本地写法**（R39、SEO-11；用于 description、定义句与 FAQ，见 §3.9 / §4.3）

| locale | 定位 / 受众词（不含"英语"） | iPhone 本地写法（在 FAQ 问句中出现一次） |
|---|---|---|
| es / pt-BR | aprender idiomas | — |
| fr / de / it / nl | apprendre les langues / Sprachlernende / imparare le lingue / taalleerders | — |
| pl / ru / tr / uk | nauka języków / изучающие языки / dil öğrenenler / вивчення мов | ru "на айфоне"、uk "на айфоні" |
| vi / th / id | người học ngoại ngữ / ผู้เรียนภาษา / pelajar bahasa | th "ไอโฟน" |
| ar / hi | متعلمو اللغات / भाषा सीखने वाले | ar "الآيفون" |
| （T1 补充） | 见 §2.2 各表"定位"行 | zh-Hans"苹果手机"；ko 已在 title 中用「아이폰」 |

> ar 页**写方向**【裁定】（R63、I18-01，取代 v1.0 的"不写方向"）：App 按**物理方向**判定右滑（`20-features.js:418` `distanceX > 0` 走翻译分支，`distanceX < 0` 移除译文），App 自己的阿语提示是 tip_swipe_to_translate[ar]「اسحب لليمين على أي نص لعرض ترجمته.」。ar 文案一律写"向右"：句中用「اسحب الفقرة لليمين」，`demo.ui.swipeCue` 用「اسحب لليمين」；手势示意与速度线不镜像（文档 05 §9.2）。v1.0 只照搬了配额标签「اسحب للترجمة」，照此实施会让阿语用户按 RTL 直觉向左滑，结果是删除译文。

### 2.4 对研究报告措辞的修正（开工时以本表右列为准）

> 本表"来源"列中"研究 07 §6.1 F1…F6"的 F# 是研究 07 自己的功能编号，不是研究 10 §4 的事实条目 F1–F36。

| 来源 | 原措辞 | 问题（事实依据） | 本文替换 |
|---|---|---|---|
| 研究 07 §6.1 F1 en 主词 | translate web pages on iPhone **and keep the original** | 是信息意图 how-to，首页接不住（研究 07 §0 #9）；配套文案若写成"翻译整页"还会失实（F14、研究 10 G6） | 首页主词改为产品意图 `bilingual web page translator app for iPhone`；how-to 主词只归 G1（R46、§1.6）；承载句必须含 "swipe (right on) a paragraph" |
| 研究 07 §6.3 en H1 | Translate any web page on iPhone — and keep the original. | 暗示一次翻译整页 | "Swipe a paragraph on any web page. Its translation appears right below."（v1.0 的 "Swipe to translate web pages…" 仍有整页歧义，PRO-19） |
| 研究 07 §6.3 zh-Hans H1 | 任意网页，原文下方即见译文 | 同上，暗示自动整页 | "iPhone 网页双语对照：向右滑动段落，原文不动，译文插在下方。" |
| 研究 07 §6.3 ja H1 | どんなWebページも、原文のすぐ下に訳文を。 | 同上；且与 SE ja H1「原文のすぐ下の訳文」句式重复 | 「Webページの段落を右スワイプで翻訳。原文はそのまま、訳文は下に」（写明"段落"，PRO-19；去掉句末「。」并控制在 w32 内，I18-10） |
| 研究 07 §0 #4、§4.2 | Immersive/Mate 在 iOS 是 Safari 扩展 → iPhone 上保留原文的双语翻译"几乎是空白" | Immersive Translate iOS 已能在 Safari 做双语网页翻译，含 X 网页版（F29） | 不写"唯一 / 空白 / only app"；差异点写"内置浏览器 + 右滑按需翻译 + AI 语境查词 + 英文 Chunks/Action Flow + 历史" |
| 研究 07 §4.2、§5.1 #7、§6.1 F5 | "learn Japanese/Korean/Chinese by reading websites" 作 WBW 独占主打 | CJK 源文不支持双击，Chunks/Action Flow 仅英语（F15、研究 10 C15） | 多语言作辅助卖点；举例优先西 / 法 / 德；CJK 源文写"右滑翻译和朗读可用" |
| 研究 07 §6.1 F5 | read websites in 20+ languages；20+ 语言互译 | 事实是 21 种译文语言、20 种界面语言；源语言候选 = Apple Translation 支持 ∩ 20 种（研究 05 §2.3） | "21 种译文语言 · 20 种界面语言 · 自动识别网页语言" |
| 研究 07 §6.1 F2 次词 | tap to look up words while reading | 是双击 | double-tap to look up a word |
| 研究 07 §6.1 F1 zh 次词、§5.2 #3 | 划词翻译 iOS / App | 交互是右滑段落，不是选词（研究 05 §7 #8） | 不作关键词；用"右滑翻译" |
| 研究 07 §6.1 F4 | saved words by date；按日期回顾 | 查词历史按上下文分组；无"生词本 / 按日期"证据（研究 05 §2.4 #11） | "翻译与查词历史 · 按语境回顾" |
| 研究 07 §6.1 F6 | AI translation with Google, Azure or on-device；离线翻译 | 用户只能选"云端（Azure + Google）/ 本地（iOS 系统翻译）"；离线未验证 | "cloud or on-device translation"；"offline" 待验证（H13） |
| 研究 07 §3.3 #4 | "an iPhone app by Chi Jinlong" | 对外署名定为 "Jinlong"（U4） | 可见文本 "by Jinlong"；JSON-LD `alternateName: "Chi Jinlong"` |
| 研究 07 §7.4 | 指向 SE 的链接保留 UTM | SE 站无统计，不加 UTM（研究 10 C11、基线 §B5） | 不加 UTM；用 GA 事件 + App Store `ct` |
| 研究 06 §3.7 定义句 | 在任何网页**或 App** 里**左滑**选中的文字 | 只在内置浏览器中右滑（研究 10 §0.3） | 见 §3.5 定义句 |
| 研究 06 §6.2 alt 示例 | 在 **Safari** 中左滑一段英文 | 同上 | 见 §3.6 alt 规则 |
| 研究 06 §3.6 | 想在**任何 App** 或网页里即时翻译 → WordByWord | 同上 | "想在 iPhone 上对照着读各种语言的网页 → WordByWord" |
| 研究 02 §8.1 #9、研究 07 §3.3 #2 | SE 关系用 `isRelatedTo` | 研究 10 C18：不用 isRelatedTo | 共享 Person `@id` + 可见文本 + `mentions`（§5） |

---

## 3. 页面级关键词承载规则

### 3.1 title

【决策】模板：

| 页面类型 | 模板 | 示例（en） |
|---|---|---|
| locale 首页 | `<品牌位>：<K1 产品/品类主词（含平台词）>｜<K2、差异点或受众词>`（R46） | `WordByWord: Bilingual Web Page Translator App for iPhone` |
| `/about/` | `About WordByWord — <品类描述>` | `About WordByWord — Bilingual Web Reader for iPhone & iPad` |
| 指南页 | `<问题式或任务式标题> \| WordByWord`（品牌在尾） | `How to Translate Web Pages on iPhone and Keep the Original \| WordByWord`（G1；该 how-to 主词只在 G1 的 title/H1 出现，§1.6 M2；品牌后缀不计入上限，允许被截） |
| 契约页 | `Privacy Policy \| WordByWord`、`Support \| WordByWord` | — |

规则：
- 品牌位 = "WordByWord"；zh-Hant 用 "WordByWord翻譯"、ru 用 "WordByWord Переводчик"（§1.5）。分隔符：拉丁 `: ` 或 ` – `，CJK 全角 `：` `｜`，fr 冒号前加空格（`WordByWord : `）。zh-Hant / zh-Hans 不用日文中点「・」（U+30FB），并列用全角逗号（I18-07）。
- `｜` 只作 title 分隔符，**不作断行标记**；locale JSON 中的断行记号统一为 `{wbr}`，构建时在可见标题里转成 `<wbr>`，在 title / meta / OG / JSON-LD / alt / aria-label 中一律剥除（R61、I18-03）。seoLint 计长前先剥除 `{wbr}` 与荧光笔标记 `[[ ]]`（文档 06 L-7），并断言 title / meta / JSON-LD 中不残留这两种记号。
- **长度上限**（Google 按像素截断，以下为构建 lint 阈值；R14 规定 description 区间以本表为准，文档 06 L-8 同步）：

| 文字 | 计量方式 | title 上限 | description 建议区间 |
|---|---|---|---|
| 拉丁、西里尔（en es pt-BR fr de it nl pl ru tr uk vi id） | 字素数（`Intl.Segmenter` 的 grapheme 计数） | ≤ 60 | 120–160 |
| 中日韩（zh-Hans zh-Hant ja ko） | 全角宽度：全角 / 谚文 = 1，半角 = 0.5 | ≤ 32 | 50–90 |
| 泰文、天城文（th hi） | 去掉组合符号后的可见字符数 | ≤ 60 | 100–160 |
| 阿拉伯文（ar） | 字素数（同拉丁；harakat、tanwin 等组合符号并入所附字母，不单独计数） | ≤ 60 | 120–160 |

- 计量口径与文档 06 L-8 统一为"字素数"（一致性审计 L10）；v1.1 写的"Unicode 字符数"作废。§3.9 的实测值已按字素数复核：只有 ar description 因 tanwin 由 159 变为 157，其余不变。

- 每个首页 title 必须含：品牌位 + 平台词（iPhone / 아이폰）+ K1 核心名词（网页 / Webページ / 웹페이지 / web page …）+ **产品词**（App / アプリ / 앱 / traductor / Übersetzer-App …，R46）。各 locale 的必含词元见 §3.8 `titleMust`。
- 受众词（R39）可进 title 后半，但不放 title 开头；目前 20 个 title 都因长度上限没有放，受众词由 description 与定义句承担。
- 不允许：§1.4 禁用主词；G1 的 how-to 句式（how to / 怎么 / 如何 / 方法 / 방법，§1.6）；"Smart""Assistant""助手""アシスタント""도우미"这类泛词（F11）；竞品品牌（G4 指南页除外）；全大写；emoji。

### 3.2 meta description

【决策】句式：`<受众词（可选，R39）>：<动作（右滑段落）→ 结果（译文在原文下方）>。<K2 动作 → 结果>。<平台 + 免费>。`
- 前 1/2 长度内必须出现 K1 主词或 K1 动作（移动端截断更早）；K1 的动作 + 结果必须在 description 中完整出现。
- 必须提到"内置浏览器 / built-in browser"、"在 WordByWord 里"，或用"WordByWord 是……App"的定义式开头，避免读者以为是 Safari 或桌面扩展（研究 05 §7 #8）。
- **必须含平台词 "iPhone"**（移动端摘要会加粗平台词）；拉丁 / 西里尔 / 阿拉伯 / 泰 / 天城文的 description 以本地化的"iPhone / iPad，免费"收尾（en "Free on iPhone & iPad."，SEO-11）。ru、uk、ar、th、zh-Hans 的本地写法（айфон、айфоні、الآيفون、ไอโฟน、苹果手机）不进 description，放在 FAQ 问句里各出现一次（§4.3），以免摘要显得口语化。
- 受众词（R39）：T1 五语必须有；T2 / T3 在长度允许时都加了（§3.9），不再为它牺牲 K1 的动作 + 结果。
- ko 用합니다체（I18-12）；ja 和欧之间不加空格（I18-10）。
- 与 title 不重复同一短语超过一次；每页唯一。
- 不写价格数字（会过期）；写"免费 / Free"可以（免费下载 + 每日额度，F16）。

### 3.3 H1 与 eyebrow

- 【决策】每页一个 H1。首页 H1 = **K1 动作（右滑段落）+ 结果（译文在原文下方 / 原文不动）**，必须含 K1 核心名词（网页 / web page …），**必须写明"段落"一级的动作**，不得暗示整页翻译（R46、PRO-19）；可含 "translate web pages" 一类次词，但不得出现 G1 的 how-to 句式或与 G1 标题重复（§1.6）。
- 不放品牌（R27：品牌由 title 首词、logo alt、eyebrow、首段定义句承担，主角仍是 WordByWord，满足基线 §B1）；不放 SE；不复用 SE 的 H1 句式（SE："Read English news with the translation directly below every sentence"，研究 03 §2.3）。
- H1 中的荧光笔短语 `[[…]]` 恰好 1 处（R65、文档 06 L-7），由文档 08 标注；建议落在 K1 核心名词上。
- H1 拉丁 ≤ 75 字符、CJK ≤ 32 全角宽度（hero 排版两行内；计长前剥除 `[[ ]]` 与 `{wbr}`）。
- eyebrow（H1 上方小字，`<p>` 非标题）模板：`WordByWord · <品类>`。例：en "WordByWord · Bilingual web reader"；zh-Hans "WordByWord · 网页双语阅读"；ja "WordByWord・Web対訳リーダー"。"免费 · iPhone & iPad" 不再放在 eyebrow，改为 CTA 下方的一行 `hero.ctaNote`（原 `hero.ctaNote`，R77 收编）（en "Free to start · iPhone & iPad"；zh-Hans "免费使用 · iPhone / iPad"；ja「無料で使える・iPhone / iPad」），所有宽度都显示（R69、PRO-09）。

### 3.4 H2 / H3 层级模板（首页）

```
H1  K1 动作 + 结果（hero）
 H2  功能区：K1 + K2 场景句（例 "Swipe to translate, double-tap to look up — on any website"）
  H3  K1 右滑翻译：<收益>
  H3  K2 双击 AI 语境查词：<收益>
  H3  K9 X(Twitter) 双语阅读：<收益>
  H3  K4 AI 句法解析：<收益>
  H3  K3 AI 朗读：<收益>
  H3  K5 Chunks & Action Flow（仅英文网页）
  H3  K6 历史回顾
  H3  K7 翻译引擎（可并入设置行，不单列也可）
 H2  语言段：K8（"21 种译文语言，20 种界面语言"）
 H2  价格段：K10（"每天免费用，读得多再升级 Plus"）
 H2  SE 区块：以 "SurfEnglish" 开头（R40，例 "SurfEnglish: daily English news at your level, from the developer of WordByWord"；zh-Hans 不渲染，R42）
 H2  FAQ（"关于 WordByWord 的常见问题"）
 H2  最终 CTA（不与 G1 标题重复的动作句，例 "Start reading websites bilingually on iPhone"，R46；配 App 图标 + 徽章 + 一句要点回顾，R43）
```

规则：section 标题 H2、功能块 H3（视觉字号可放大，R13）；H3 用"功能关键词 + 收益"句式（研究 03 §2.3）；功能名首次出现时使用 App 内叫法（研究 05 §8）以便与 App 一致；H2 / H3 不跳级；FAQ 问句用 `<h3>` 或 `<summary>` 内文本（两者都可被抓取）。各 section 的关键词任务见 §4.1。

### 3.5 首段定义句（GEO 可引用）

【决策】hero 内 H1 之后紧跟一段 `<p>`，以"WordByWord 是……"开头，**一句话讲清是什么、为谁、在哪里用、怎么用、得到什么**；纯 HTML 文本（不放图、不靠 JS），各 locale 本地化。AI 爬虫不执行 JS（研究 06 §3.7），这句是 AI 摘要最可能引用的文本。【裁定】R39：定义句、hero 副文、FAQ "What is WordByWord" 必须写明它为**学外语 / 读外语的人**而做；手机首屏只放短副文时（R69），完整定义句紧随样张之后，但仍是 hero 内的纯文本。

| locale | 定义句（T1 定稿级） |
|---|---|
| en | WordByWord is a reading assistant for language learners on iPhone and iPad. Open any website in its built-in browser, swipe right on a paragraph, and the translation appears below the original — paragraph by paragraph or sentence by sentence. Double-tap a word for an AI explanation of what it means in that sentence, or have the text read aloud. |
| zh-Hans | WordByWord 是一款为外语学习者设计的 iPhone / iPad 阅读助手，帮你用真实网页学外语：在 App 内置浏览器中打开任意网页，向右滑动一段文字，译文就会插在原文下方（可按段落或逐句显示）；双击单词，AI 会结合所在句子解释它的意思，也可以朗读原文。 |
| zh-Hant | WordByWord 是一款為外語學習者設計的 iPhone／iPad 閱讀助手，幫你用真實網頁學外語：在 App 內建瀏覽器開啟任何網頁，向右滑動一段文字，譯文就會插在原文下方（可依段落或逐句顯示）；點兩下單字，AI 會依照所在句子解釋它的意思，也可以朗讀原文。 |
| ja | WordByWordは、外国語を学びながらWebを読む人のためのiPhone・iPadアプリです。アプリ内ブラウザで開いたページの段落を右にスワイプすると、訳文が原文のすぐ下に挿入されます（段落ごと・一文ごとの表示に対応）。単語をダブルタップすると、その文での意味をAIが説明し、読み上げもできます。 |
| ko（hero，해요체） | WordByWord는 외국어를 공부하며 웹을 읽는 사람을 위한 iPhone·iPad 앱이에요. 앱 안의 브라우저로 연 페이지에서 문단을 오른쪽으로 밀면 번역이 원문 바로 아래에 들어가고(문단별·문장별 표시), 단어를 두 번 탭하면 그 문장에서의 뜻을 AI가 알려 줘요. 읽어 주기도 돼요. |
| ko（FAQ #1 答案，합니다체） | 同上内容，句尾改为「…앱입니다」「…알려 줍니다」「…읽어 줍니다」（I18-12） |
| 其余 15 个 | 按 en 句式本地化（"<品牌> 是为学外语的人设计的 iPhone / iPad 阅读应用：<右滑段落 → 译文在原文下方>；<双击 → 语境义>"），受众词用 §2.3 表 C；ar 写「لليمين」（R63）；【待母语复核】 |

### 3.6 图片 alt

| 图片类型 | 规则 | 示例 |
|---|---|---|
| 功能截图 | 描述画面里**实际可见**的东西 + 所演示的功能，一句话；功能词自然出现一次；与页面语言一致 | en："WordByWord on iPhone: a paragraph of an English news article with its Japanese translation inserted below after a right swipe"；ja：「iPhoneのWordByWordで英語記事の段落を右にスワイプし、日本語訳が原文の下に表示された画面」（ja 和欧之间不加空格，I18-10） |
| 界面语言与页面语言不一致的截图（17 个 locale 用英文 UI 图，研究 08 §3.8；zh-Hant 默认回落 en 截图，R33） | alt 用页面语言，并如实写"英文界面" | de："WordByWord auf dem iPhone (englische Oberfläche): Unter einem englischen Absatz erscheint nach einem Wisch nach rechts die Übersetzung" |
| 装饰图（马赛克、速度线、分隔） | `alt=""`，或用 CSS 实现 | — |
| HTML/CSS 实时样张（基线 §E） | 是文本不是图，无 alt；容器加 `data-nosnippet`，避免搜索摘要引用示例句；源文元素加 `lang`（如 `lang="en"`） | `<div class="demo" data-nosnippet>…<p lang="en">…</p><p lang="ja">…</p></div>` |
| App Store 徽章 | 用 Apple 本地化徽章；alt 用 Apple 在该语言的徽章文字 | en "Download on the App Store"；ja「App Store からダウンロード」 |
| X 场景图（K9） | R71 允许 en 用裁掉 "Extract chunks" 按钮的 X 截图（alt 不提语块，R31）；但文档 05 §5.4.3 实测 en 截图每条译文下都有该按钮、裁不出合规节选，因此 en 与 ja / zh-Hans 等一样属于"没有合规截图的 locale"，全部改用 HTML/CSS 通用社交帖样张（自写文本、无 X 标志与真实账号，R71），按"实时样张"处理，无 alt；补拍到合规截图后再按 H11 改回 | en："WordByWord on iPhone: an X (Twitter) post with its translation below, in the built-in browser" |
| SE 截图 / 图标（推荐区块） | alt 以 "SurfEnglish" 开头，描述画面；不用 WBW 的关键词。配图用 SE `games-home.jpg` 的上部裁切（R44），不用新闻 feed 截图 | "SurfEnglish on iPhone: the Games screen with Sentence Builder and Word Raid" |
| logo | header logo alt = "WordByWord"（不写 "Word by Word" 或 "logo"） | — |

禁止：alt 堆砌关键词；一张图多处复用却写不同功能的 alt（F8 的反例）；写画面里没有的功能。

### 3.7 锚文本

| 链接 | 规则 | 示例 |
|---|---|---|
| 站内功能 → 指南（Phase 2） | 描述目标页内容，本地化；同一页对同一目标只用一次精确关键词锚 | "how to read web pages bilingually on iPhone" |
| 语言切换器 | 母语名称（日本語、Deutsch、繁體中文），不用国旗；`<a href hreflang lang>`（ar 加 `dir="rtl"`）；链接到同一页面的对应语言版本，没有该版本时回落到该语言首页（文档 02 §7.2）；点击上报 `language_switch`（R38） | `<a href="/ja/" hreflang="ja" lang="ja">日本語</a>` |
| App Store CTA | 本地化 "在 App Store 下载 WordByWord"；徽章图 alt 即锚文本；`ct` 只按落点（R55，§6.2） | — |
| 指向 SE 官网 | 【R76】① 卡片的官网链接（`sibling.card.linkText`）用 SE 在该语言的**核心词短语 + 品牌**（让链接信号落在 SE 主词上，研究 07 §7.4），链接到 SE 对应语言页（无 SE 界面的 8 种语言链 SE 英文页并加 `hreflang="en"`，文档 04 §5.7 T7）；核心词按 R40/R41 取 SE 独有的卖点（分级英语新闻、复习小游戏），措辞是"也值得一试"而不是"更适合你"；各语言定稿以文档 08 为准。每页只有这 1 个精确关键词锚；其余落点用品牌锚：② FAQ "SurfEnglish website"（本地化）、④ 页脚用 SE 的本地化 App Store 名、⑤ about 只用品牌；同页锚文本不重复。**任何落点都不用裸域名 "surfenglish.app" 作锚文本**（R43 括注中的 "surfenglish.app" 指链接目标）。正常 follow，不加 nofollow，**不带 UTM** | en "Read English news at your level with SurfEnglish"（R76 示例；定稿见文档 08 §2 `sibling.card.linkText`，其余语言见文档 08 与文档 04 §5.7） |
| 指向 SE 的 App Store | **文字链接**（本地化的 "Get SurfEnglish on the App Store →"，"→" 由模板以 `aria-hidden` 追加，不进锚文本，R76），不用黑色徽章，视觉权重低于 WBW 的任何 CTA（R43）；`ct` 只按落点（`wbw-card` / `wbw-about`，R3；② FAQ 与 ④ 页脚只链 SE 官网，不放 App Store 链接，因此没有 `wbw-faq` / `wbw-footer` 这两个 SE campaign，文档 04 §7.2）；zh-Hans 页不放（R42、F36） | — |
| 页脚 about | "About WordByWord"（本地化） | — |
| 禁止 | "click here / 点击这里 / こちら"；全站页脚堆精确关键词锚；JS 生成的链接 | — |

### 3.8 构建期 SEO lint

【决策】构建期增加 `seoLint()`，对每个输出页面检查，**error 级失败即中止构建**。落地位置以文档 06 §3.7 为准：本节规则并入 **L-9**（品牌、关键词归属、唯一映射与 how-to 禁用；映射表转写为 `src/data/keyword-map.json`）、**L-11**（SE 区块 H2 以 SurfEnglish 开头）、**D-8**（H1 唯一）、**D-9**（JSON-LD）、**D-20**（索引一致）；事实红线的正则只在本文给**种子**，执行由 **L-14**（locale JSON 叶子值，按键路径豁免）与 **D-15**（模板字面量）完成（ENG-10；`claims-lint.json` 结构为 `{rules:[{id, patterns:{'*':[…], en:[…], ja:[…]…}, exempt:[keyPath]}]}`，某 locale 无规则时报 W 级"未覆盖"）。

```js
// 伪代码：数据来自 src/locales/<code>.json 的 meta / hero / seo 字段；计长前 strip({wbr}, [[ ]])（R61、文档 06 L-7）
const LIMIT = { latn: { title: 60 }, cyrl: { title: 60 }, arab: { title: 60 }, thai: { title: 60 }, deva: { title: 60 }, cjk: { title: 32 } };  // 键 = LOCALES.script（R60）
// 事实红线种子（基线 §B2、F11、F14）→ 并入 claims-lint.json，由文档 06 L-14 / D-15 执行；FAQ 中"不能整页翻译"之类否定句按键路径豁免。
const CLAIM_SEED = [
  /one[- ]tap translat|translate (the )?(whole|entire) (web ?)?page|safari extension|swipe left/i,
  /unlimited ai|dark mode|custom themes?|keyboard shortcuts?|no personal data/i,
  /一键翻译整|整页翻译|左滑|无限\s*AI|AI\s*发音无限|暗色模式|夜间模式|自定义主题|不收集任何/,
  /ページ全体を一括|左にスワイプ|無制限のAI/,
];
const REPLACEMENT_BAN = /* §1.4「替换性措辞禁用」，R40 */;
function seoLint(page, t, site) {
  const T = strip(t.meta.title), H1 = strip(t.hero.title), D = t.meta.description;
  error(len(T, page.script) > LIMIT[page.script].title, 'title too long');
  error(!T.startsWith(t.meta.brandToken), 'brand must lead title');
  error(page.kind === 'home' && !t.seo.titleMust.every(tok => hasToken(T, tok, page.script)), 'title misses must-have tokens');
  error(FORBIDDEN_PRIMARY[page.locale].some(re => re.test(headZone(t))), 'SE-owned keyword in title/H1/description/OG');
  error(page.kind === 'home' && HOWTO[page.locale].test(T + ' ' + H1 + ' ' + ctaH2(page)), 'how-to phrasing belongs to G1 (R46)');
  error(page.kind === 'home' && !PLATFORM[page.locale].test(D), 'description must mention iPhone (SEO-11)');
  error(/\{wbr\}|<wbr>|\[\[|\]\]/.test(T + D + jsonLd(page)), 'markup token leaked into title/meta/JSON-LD (R61)');
  error(REPLACEMENT_BAN.test(visibleText(page)), 'replacement wording about SurfEnglish (R40)');
  const seH2 = sectionH2(page, '#surfenglish');                       // SEO-13、PRO-08
  if (seH2) error(!seH2.startsWith('SurfEnglish'), 'SE block H2 must start with "SurfEnglish", not a learn-English clause (R40)');
  error(countH1(page.html) !== 1, 'exactly one H1');
  warn(!inRange(len(D, page.script), DESC_RANGE[page.script]), 'description length');
}
// 跨页面：同一 locale 内，title/H1 含页面 X 全部 primaryTokens 的页面集合必须恰好是 {X}（§1.6、R46）
function uniquePrimary(pagesByLocale) { /* 对每个 X：pages.filter(p => X.primaryTokens.every(tok => hasToken(p.T + ' ' + p.H1, tok, p.script))) 的长度必须为 1 */ }
// hasToken：不区分大小写；latn / cyrl / arab 按整词匹配（用 Unicode 边界 /(?<![\p{L}\p{N}])tok(?![\p{L}\p{N}])/iu，不用 ASCII \b，否则 vi「ứng dụng」等带变音符的词会漏判），cjk / thai / deva 按子串匹配（§1.6）
```

`seo.titleMust`（首页必含词元，不区分大小写，R46）：en `["Web Page","iPhone","App"]`；zh-Hans `["iPhone","网页","双语对照","App"]`；zh-Hant `["iPhone","網頁","雙語對照","App"]`；ja `["iPhone","Webページ","翻訳","アプリ"]`；ko `["아이폰","웹페이지","번역","앱"]`；其余 15 个 locale：`"iPhone"` + K1 核心名词 + §1.6 表中的产品词（如 es `["iPhone","páginas web","traductor"]`、de `["iPhone","Webseiten","Übersetzer-App"]`）。

`HOWTO`（首页 title / H1 / `#cta` H2 禁用的 how-to 句式，§1.6 M2）：en `/\bhow to\b|keep the original/i`；zh-Hans `/怎么|如何|方法/`；zh-Hant `/怎麼|如何|方法/`；ja `/方法|やり方/`；ko `/방법|하는 법/`；其余 locale 在 G1 本地化时补齐（未补齐时只报 W）。

`PLATFORM`（description 必含平台词）：所有 locale 为 `/iPhone/`（ko 另接受 `아이폰`）。

自测用例（`scripts/fixtures/seolint/`）：§1.4 的"不得误拦的通用学习词"全部通过；"Learning English in particular? Meet SurfEnglish." 作为 `#surfenglish` H2 必须报错；"Translate web pages on iPhone — and keep the original" 作为 en `#cta` H2 必须报错。

locale JSON 另存 `seo.keywords.K1..K10`（主 / 次）、`seo.primary`、`seo.primaryTokens`，只供 lint 与写作参考，**不输出 `<meta name="keywords">`**（R6；Google 忽略，20 个 locale 维护成本高）。

### 3.9 20 个 locale 首页 title / description / H1（v1.1 重写）

【裁定】按 R39（定位）、R46（产品/品类意图 + 唯一映射）、PRO-19（H1 写"段落"、不暗示整页）、SEO-11（description 含 iPhone）、I18-01/R63（ar 写方向）、I18-07（zh-Hant）、I18-10（ja）、I18-12（ko）全部重写。长度为实测（拉丁、西里尔、阿拉伯为字素数 `n`，§3.1；CJK 为全角宽度 `w`；th / hi 为去掉组合符号后的可见字符数 `v`），全部满足 §3.1 的上限与区间；H1 计长前剥除 `[[ ]]` 与 `{wbr}`。T1（en、zh-Hans、zh-Hant、ja、ko）为定稿级，zh-Hans / zh-Hant / ja / ko 按 R36 上线前仍须母语审校，en 按 R80 由用户通读 + 双模型互检后上线；T2 / T3 全部【待母语复核】，按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线、上线后补审。定稿后写入 `src/locales/<code>.json` 的 `meta.title`、`meta.description`、`hero.title`；最终文案以文档 08 为准，08 改动这三项时须重跑 seoLint。

**T1（定稿级）**

| locale | title | description | H1 |
|---|---|---|---|
| en | WordByWord: Bilingual Web Page Translator App for iPhone（n56） | For language learners: swipe right on a paragraph in WordByWord to see its translation below. Double-tap a word for its meaning. Free on iPhone & iPad.（n151） | Swipe a paragraph on any web page. Its translation appears right below.（n71） |
| zh-Hans | WordByWord：iPhone 网页双语对照翻译 App｜右滑即译，AI 语境查词（w31） | WordByWord 是为外语学习者设计的 iPhone / iPad 网页双语阅读 App：在内置浏览器里向右滑动段落，译文插在原文下方；双击单词，AI 结合上下文给出释义。免费使用。（w76.5） | iPhone 网页双语对照：向右滑动段落，原文不动，译文插在下方。（w29.5） |
| zh-Hant | WordByWord翻譯：iPhone 網頁雙語對照 App｜右滑即譯，AI 語境查單字（w32） | WordByWord 是為外語學習者設計的 iPhone／iPad 網頁雙語閱讀 App：在內建瀏覽器向右滑動段落，譯文插在原文下方；點兩下單字，AI 依上下文給出解釋。免費使用。（w75） | iPhone 網頁雙語對照：向右滑動段落，原文不動，譯文插在下方。（w29.5） |
| ja | WordByWord｜iPhoneでWebページを翻訳・対訳表示するアプリ（w27.5） | WordByWordは外国語のWebページを読んで学べるiPhone・iPadアプリ。アプリ内ブラウザで段落を右にスワイプすると訳文が原文のすぐ下に。単語をダブルタップでAIが文脈に合う意味を表示。無料。（w89.5） | Webページの段落を右スワイプで翻訳。原文はそのまま、訳文は下に（w30.5） |
| ko | WordByWord: 아이폰 웹페이지 번역 앱 \| 원문·번역 같이 보기（w28.5） | WordByWord는 외국어 공부용 iPhone·iPad 웹페이지 번역 앱입니다. 문단을 오른쪽으로 밀면 번역이 원문 아래에 나오고, 단어를 두 번 탭하면 AI가 문맥에 맞는 뜻을 알려 줍니다. 무료입니다.（w89.5） | 웹페이지 문단을 오른쪽으로 밀면 번역이 바로 아래에 나와요.（w29） |

**T2（待母语复核）**

| locale | title | description | H1 |
|---|---|---|---|
| es | WordByWord: traductor bilingüe de páginas web para iPhone（n57） | Aprende idiomas: en WordByWord, desliza un párrafo a la derecha y su traducción aparece debajo. Doble toque en una palabra: su sentido. Gratis en iPhone y iPad.（n160） | Desliza un párrafo de una página web: la traducción aparece justo debajo.（n73） |
| pt-BR | WordByWord: tradutor bilíngue de páginas da web para iPhone（n59） | Aprenda idiomas: no WordByWord, deslize um parágrafo para a direita e a tradução surge embaixo. Dois toques numa palavra dão o sentido. Grátis no iPhone e iPad.（n160） | Deslize um parágrafo de uma página da web e veja a tradução logo abaixo.（n72） |
| fr | WordByWord : traducteur bilingue de pages web pour iPhone（n57） | Apprenez les langues : dans WordByWord, balayez un paragraphe à droite, la traduction apparaît dessous. Touchez deux fois un mot : son sens. Gratuit sur iPhone.（n160） | Balayez un paragraphe d’une page web : sa traduction apparaît en dessous.（n73） |
| de | WordByWord: Übersetzer-App für Webseiten auf dem iPhone（n55） | Für Sprachlernende: Absatz in WordByWord nach rechts wischen, die Übersetzung steht darunter. Doppeltippen zeigt die Wortbedeutung. Gratis für iPhone und iPad.（n159） | Absatz einer Webseite nach rechts wischen – die Übersetzung steht darunter.（n75） |

**T3（待母语复核）**

| locale | title | description | H1 |
|---|---|---|---|
| it | WordByWord: traduttore bilingue di pagine web per iPhone（n56） | Impara le lingue: in WordByWord scorri un paragrafo a destra e la traduzione appare sotto. Due tocchi su una parola: il significato. Gratis su iPhone e iPad.（n157） | Scorri un paragrafo di una pagina web: la traduzione appare subito sotto.（n73） |
| nl | WordByWord: tweetalige vertaalapp voor webpagina’s op iPhone（n60） | Voor taalleerders: veeg in WordByWord een alinea naar rechts, de vertaling staat eronder. Tik twee keer op een woord: de betekenis. Gratis op iPhone en iPad.（n157） | Veeg een alinea van een webpagina naar rechts: de vertaling staat eronder.（n74） |
| pl | WordByWord: dwujęzyczny tłumacz stron WWW na iPhone’a（n53） | Do nauki języków: w WordByWord przesuń akapit w prawo, a tłumaczenie pojawi się pod nim. Stuknij dwa razy słowo, by poznać sens. Za darmo na iPhonie i iPadzie.（n159） | Przesuń akapit strony w prawo – tłumaczenie pojawi się tuż pod oryginałem.（n74） |
| ru | WordByWord Переводчик: двуязычный перевод сайтов на iPhone（n58） | Для изучающих языки: в WordByWord проведите по абзацу вправо — перевод появится под ним. Двойное касание слова покажет значение. Бесплатно для iPhone и iPad.（n157） | Проведите по абзацу на сайте вправо — перевод появится прямо под ним.（n69） |
| tr | WordByWord: iPhone için web sayfası çeviri uygulaması（n53） | Dil öğrenenler için: WordByWord’de bir paragrafı sağa kaydırın, çevirisi altında görünür. Kelimeye çift dokunup anlamını görün. iPhone ve iPad’de ücretsiz.（n155） | Web sayfasında bir paragrafı sağa kaydırın, çevirisi hemen altında belirir.（n75） |
| uk | WordByWord: двомовний перекладач сайтів для iPhone（n50） | Для вивчення мов: у WordByWord проведіть по абзацу праворуч — переклад з’явиться під ним. Подвійний дотик покаже значення слова. Безкоштовно для iPhone та iPad.（n160） | Проведіть по абзацу на сайті праворуч — переклад з’явиться просто під ним.（n74） |
| vi | WordByWord: ứng dụng dịch trang web song ngữ trên iPhone（n56） | Cho người học ngoại ngữ: trong WordByWord, vuốt một đoạn sang phải, bản dịch hiện ngay bên dưới. Chạm hai lần vào từ để xem nghĩa. Miễn phí trên iPhone, iPad.（n158） | Vuốt một đoạn trên trang web sang phải, bản dịch hiện ngay bên dưới.（n68） |
| th | WordByWord: แอปแปลเว็บไซต์สองภาษาบน iPhone（v40） | สำหรับผู้เรียนภาษา: ในเบราว์เซอร์ของ WordByWord ปัดย่อหน้าไปทางขวา คำแปลจะแสดงใต้ต้นฉบับ แตะคำสองครั้งเพื่อดูความหมายตามบริบทด้วย AI ใช้ได้ฟรีบน iPhone และ iPad（v138） | ปัดย่อหน้าบนหน้าเว็บไปทางขวา คำแปลจะแสดงอยู่ใต้ต้นฉบับ（v44） |
| id | WordByWord: aplikasi terjemahan halaman web untuk iPhone（n56） | Untuk pelajar bahasa: di WordByWord, geser paragraf ke kanan, terjemahannya muncul di bawah. Ketuk dua kali kata untuk melihat arti. Gratis di iPhone dan iPad.（n159） | Geser paragraf halaman web ke kanan, terjemahannya muncul tepat di bawah.（n73） |
| ar | WordByWord: تطبيق ترجمة ثنائية اللغة لصفحات الويب على iPhone（n60） | لمتعلمي اللغات: في متصفح WordByWord، اسحب أي فقرة إلى اليمين فتظهر ترجمتها أسفلها. انقر نقرًا مزدوجًا على كلمة لتعرف معناها حسب السياق. مجاني على iPhone وiPad.（n157） | اسحب فقرة من صفحة الويب لليمين، فتظهر ترجمتها تحتها ويبقى الأصل في مكانه.（n73） |
| hi | WordByWord: iPhone के लिए द्विभाषी वेब पेज अनुवाद ऐप（v47） | भाषा सीखने वालों के लिए: WordByWord के ब्राउज़र में किसी पैराग्राफ़ को दाईं ओर स्वाइप करें, अनुवाद ठीक नीचे दिखेगा। शब्द पर डबल टैप करके अर्थ देखें। iPhone और iPad पर मुफ़्त।（v146） | वेब पेज के किसी पैराग्राफ़ को दाईं ओर स्वाइप करें — अनुवाद ठीक उसके नीचे दिखेगा।（v66） |

v1.0 → v1.1 的主要变化：① title 从"<动作> web pages on iPhone"改为"<产品/品类> App for iPhone"，how-to 说法让给 G1（R46）；② description 以受众词开头（R39，T1 必有；T2/T3 全部放下了），以"iPhone / iPad，免费"收尾（SEO-11）；③ H1 一律写"滑动**段落** → 译文在下方"（PRO-19），不再出现 "Swipe to translate web pages"；④ ja H1 由 w32.5 降到 w30.5、去掉句末「。」，和欧之间不加空格（I18-10）；⑤ zh-Hant title 去掉日文中点「・」（I18-07）；⑥ ko description 统一为합니다체、H1 为해요체（I18-12）；⑦ ar title / description / H1 写明「إلى اليمين / لليمين」（R63、I18-01）。

复核要点（给母语复核人）：① 手势动词与 App 内该语言叫法一致（研究 05 §8：es "Deslizar"、vi "Vuốt"、pt "Deslize"、it "Scorri"，不用 "Quét""Selecione""Seleziona"）；② 不出现"整页 / 一键"，H1 的动作对象是"段落"；③ 不出现 §1.4 禁用主词，也不出现 G1 的 how-to 句式（§1.6）；④ 品牌连写；⑤ 读起来像当地 App 官网而不是译文；⑥ 受众词用 §2.3 表 C 的"学外语"说法，不得写成"学英语"；⑦ ru、uk、ar、th、zh-Hans 的本地 iPhone 写法放在 FAQ 问句（§4.3），不改 description；⑧ ko 语体：description / FAQ 答案합니다체，hero / 卡片 / 按钮해요체（I18-12）；⑨ ja 和欧之间不加空格（I18-10）；⑩ zh-Hant 按文档 08 §7.2.2 的台湾用语表（R64），不得由 zh-Hans 直接繁简转换；⑪ ar 写"向右"（R63）；⑫ ru/uk/pl/ar 中"数字 + 名词"走复数对象（R62），例如 K8 的"21 种语言"。

### 3.10 `/about/` 与扩展页

| 页面 | title | description | H1 |
|---|---|---|---|
| `/about/`（en） | About WordByWord — Bilingual Web Reader for iPhone & iPad（n57） | Official facts about WordByWord: features, languages, free limits and price, who makes it, SurfEnglish by the same maker, and why it is not WordByWord.io.（n154） | About WordByWord |
| `/chrome-extension/`（en） | WordByWord Translate for Chrome: Bilingual Web Translation（n58） | From the maker of the WordByWord iPhone app: hold Shift over a paragraph to see its translation below the original, or press Control on a word for its meaning.（n159） | Bilingual web translation in Chrome, with the original kept in place（n68） |
| `/zh-hans/chrome-extension/`（zh-Hans，R1） | WordByWord Translate for Chrome：网页双语对照翻译扩展（w26.5） | 来自 WordByWord iPhone App 的开发者：在 Chrome 中按住 Shift 指向段落，译文显示在原文下方；按 Control 指向单词，查看它在句中的意思。（w65.5） | 在 Chrome 里对照读网页，原文留在原处（w18） |

v1.0 about description 中的 "its sister app SurfEnglish" 按 R28 改为第三人称的 "SurfEnglish by the same maker"。zh-Hans 扩展页三项为【建议】，以文档 08 定稿为准。

**`/about/` 内容要求**（实体页，参照 SE `about.mjs`，研究 03 §1.10）：
- 首句定义句（同 §3.5 en，写明为学外语的人而做，R39）；产品事实行写 "a bilingual web reader for language learners on iPhone and iPad"（PRO-02）；
- 产品事实表：平台（iPhone / iPad，iOS / iPadOS 18+；兼容 Apple 芯片 Mac 与 Vision Pro）、App Store 分类（Education、Reference）、价格（免费下载 + 每日额度；Plus 月订，US $3.99）、界面 20 种语言、译文 21 种语言、源语言自动识别、已知限制（CJK 源文不支持双击；Chunks / Action Flow 仅英语；无整页翻译）、翻译引擎（Cloud: Azure + Google；Local: iOS）、当前版本 1.2.2、首发 2025-06-06（F13–F17）；时间线中 1.1 / 1.2 的具体月份待 H12，未确认前不写月份；
- "Who makes WordByWord"：Jinlong，独立 iOS 开发者，链接到 SE `/about/#maker`（同一 Person，R17）；可见署名只写 "Jinlong"，**页面可见文本不出现 "Chi Jinlong"**，该名只在 JSON-LD Person 的 `alternateName` 中输出（R81）；
- "WordByWord and SurfEnglish"：家族说明（文案以文档 08 §5.2 `about.family` 为准，约束见文档 04 §3.5、§5.6，R75；基线 §F⑤）。按 R40 写成"互补、也值得一试"：WBW 读你自己打开的任何网页，SE 是同一开发者为学英语的人做的分级英语新闻 + 复习小游戏；不写"更适合你"，不暗示 WBW 是旧版；时间线以 WBW 自己的版本收尾，不以 SE 发布收尾（PRO-13）；
- "Not to be confused with"：WordByWord.io 及其 Chrome 扩展、"Word by Word" 同名图书 / Quran 应用"与本产品无关"（R15：该声明只放 about 与扩展页）；官方 App 以链接到 App Store 开发者页（锚文本 "WordByWord on the App Store"）的方式指明，不写"由 Chi Jinlong 发布"一类可见文字（R81）；同时写一句 "WordByWord (sometimes written 'Word by Word')"。不写"名字的含义 = 逐词细读"一类未经确认的品牌叙事（R73、PRO-18）；
- Official links：App Store、官网、扩展页、Privacy、Support；
- `Last updated: <date>`（构建时取该页源文件的 git 日期）；
- 不写隐私 / 数据收集断言，等 H6 结论。

**扩展页的索引规则**【裁定】（R1、R2、R45、R49；v1.0 的"修订建议 1"已由 R2 裁定）：Phase 1 做 en `/chrome-extension/` 与 zh-Hans `/zh-hans/chrome-extension/`，ja / ko 版本留到 Phase 3。由 `SITE.chromeStoreUrl` 驱动两态：

| 状态 | 条件 | 索引 | 导航 / CTA | 首页 FAQ |
|---|---|---|---|---|
| S0（默认） | 未提供 listing URL（H4） | `noindex,follow`；不写 canonical；不进 sitemap；不进任何 hreflang 簇（R49） | header 导航**隐藏**该项，页脚保留链接；CTA 为 "Coming soon" + 联系方式 | 只说"桌面浏览器扩展正在准备中"并链到扩展页，**不写扩展名称**（R45） |
| S1 | 已提供 listing URL | 可索引、自引用 canonical、进 sitemap；en + zh-Hans 组成两成员的 hreflang 簇，x-default → en | header 显示 "Chrome extension"；CTA 指向 listing | 写名称与 listing 链接 |

两态下页面都写明与 WordByWord.io 的同名扩展无关（R2、R15）；`/chrome-extension/privacy.html` 恒为 200，索引状态跟随扩展页（R2）。理由：一个不能安装的扩展页面对搜索用户无用，还会在 "WordByWord Chrome extension" 这个已被 WordByWord.io 占据的查询（F27）上加重混淆。页面关键词：bilingual translation Chrome extension；translate web page in Chrome and keep the original；hover translate。事实边界：目标语言仅 7 种（zh ja ko fr de es en）；依赖 Chrome / Edge 138+ 内置 Translator API；Shift 段落翻译、Control 语境释义（`WordByWord-translate-extension/src/core/settings.js:19,43`、README）；不得写 "20+ languages""Powered by ChatGPT"（研究 05 §7 #15–16）；是否收费、能否标 Beta 待 H12，未确认前不标价格。

---

## 4. 首页结构模板

### 4.1 线框与各 section 的关键词任务

section 顺序以文档 02 §7.5 为准；本节规定**每块承担哪些关键词、必须出现什么、不能出现什么**。页内锚点为 `#features #languages #pricing #faq #surfenglish`，保留 `#screenshots`；价格区 id 为 `pricing`，`#cta` 只作最终 CTA（R12；旧 `cta` ≈ 新 `pricing` + 新 `cta`，GA 对照表见文档 02 §7.5 / 文档 06）。

```
┌ header ─ logo「WordByWord」· Features · Languages · Pricing · FAQ · Chrome extension（仅 S1）· [语言切换 ▾] · [Download]（R16）
├ #hero ─ eyebrow / H1(K1) / 短副文 / CTA + ctaNote 一行（原 priceShort，R77） / 实时双语样张(HTML, data-nosnippet) / 定义句 p / 真实截图
│          （<560 宽：H1 → 短副文 → CTA + "免费 · iPhone & iPad" → 样张；长 platformNote 移到样张之后，R69）
├ #features ─ H2(K1+K2 场景句)
│    ├ H3 K1 右滑翻译      ├ H3 K2 双击语境查词   ├ H3 K9 X 双语阅读
│    ├ H3 K4 AI 句法解析    ├ H3 K3 AI 朗读        ├ H3 K5 Chunks/Action Flow（仅英文网页）
│    └ H3 K6 历史回顾  ·  设置行：K7 云端/本地引擎、译文显示方式与样式
├ #screenshots ─（可并入 features；alt 规则见 §3.6）
├ #languages ─ H2(K8) / 21 种译文语言列表(文本) / 限制说明（R42：不再放 SE 情境提示③）
├ #pricing ─ H2(K10) / 免费额度表 / Plus / **WBW App Store 徽章**（R43）
├ #surfenglish ─ H2「SurfEnglish: …」（R40）· 桌面 ≤ 420px、手机 ≤ 480px（R10）· zh-Hans 不渲染、公告开启时不渲染（R42、R35）
├ #faq ─ H2 / 10–12 问（§4.3）
├ #cta ─ H2（不与 G1 标题重复的动作句，R46）/ App 图标 + 徽章 + 一句要点回顾（R43）
└ footer ─ 20 种语言链接 · About · Chrome 扩展 · Privacy · Support · More from the maker(SurfEnglish) · © 2025–{currentYear} Jinlong（R22）
```

| section | 关键词任务 | 必须出现 | 不得出现 | 链接 |
|---|---|---|---|---|
| header | 品牌 + 导航 | logo alt "WordByWord"（手机端保留字标，R70）；可抓取的语言切换（基线 §C） | 精确关键词锚 | 锚点 + 20 语言首页；Download（`ct=wbw-header`） |
| #hero | K1 动作与核心名词（H1）、定位词与 K2（定义句）、平台词 | H1、定义句（§3.5，含受众，R39）、"内置浏览器"、"iPhone / iPad"、"免费"（priceShort，R69） | SE、"学英语"、"整页 / 一键"、G1 的 how-to 句式 | App Store（`ct=wbw-hero`，R55） |
| #features | K1、K2、K9、K4、K3、K5、K6、K7 各一个 H3 | 每个 H3 的"功能词 + 收益"；K2 处写 CJK 限制；K5 处写"仅英文网页" | 不存在的功能（§2.1） | Phase 2 起 K1 → G1、K9 → G2 |
| #languages | K8 | 21 种译文语言（母语名称纯文本列表）、20 种界面语言、源语言自动识别、CJK 与 Chunks 限制 | "20+ language pairs""任意语言都能双击"；任何 SE 提示（R42） | — |
| #pricing | K10 | 免费下载、主要功能每日额度（F16）、Plus 月订；价格以 App Store 为准；WBW 的 App Store 徽章（R43） | "无限 AI 发音""暗色模式""主题" | App Store（`ct=wbw-pricing`，R55） |
| #surfenglish | SE 的核心词只作锚文本 | H2 以 "SurfEnglish" 开头（R40）；互补式叙事："WBW 读你打开的任何网页；SE 是同一开发者为学英语的人做的分级英语新闻 + 复习小游戏"（R40、R41）；按语言规则（基线 §F）；静态 HTML；配图 `games-home.jpg` 上部裁切（R44） | WBW 关键词；"新上线 / New"；"升级版 / 替代品 / 可能更适合你"（R40）；把端侧/离线语音写成 SE 独有（R41）；黑色 App Store 徽章（R43） | SE 对应语言页；SE App Store 文字链接（`ct=wbw-card`，R3）；zh-Hans 不渲染本区块（R42） |
| #faq | 长尾问句 | 可见 `<details>` / 文本，问句用当地说法 | FAQPage JSON-LD（R5、§5.1） | `english-learner` → SE 官网（只链官网，无 App Store 链接与 `ct`，文档 04 §7.2）；#4 `word-by-word` → G3（Phase 2）；`devices` → 扩展页（S0 不写名称，R45） |
| #cta | 收尾转化（不承载 G1 主词） | 动作句（例 en "Start reading websites bilingually on iPhone"）+ App 图标 + 徽章 + 一句要点回顾（R43） | G1 的 how-to 句式或 G1 标题（R46、SEO-01；文档 08 v1.0 的 "Translate web pages on iPhone — and keep the original" 须改） | App Store（`ct=wbw-cta`，R55） |
| footer | 品牌、语言、实体 | 20 种语言全量链接、About、"More from the maker" | 关键词堆砌；WordByWord.io 声明（只放 about 与扩展页，R15） | SE 首页（品牌锚，`ct` 仅用于 App Store 链接：`wbw-footer`） |

### 4.2 功能区 H3 示例（en / zh-Hans / ja）

本表约束关键词，最终文案以文档 08 为准；`featureList`（§5.2）与可见 H3 同源。ja 和欧之间不加空格（I18-10）。

| K | en | zh-Hans | ja |
|---|---|---|---|
| K1 | Swipe to Translate: the translation appears right below the original | 右滑翻译：译文插在原文下方，逐段或逐句对照 | 右スワイプ翻訳：訳文は原文のすぐ下に表示（I18-10） |
| K2 | Double-tap a word for its AI meaning in context | 双击查词：AI 给出这个词在这句话里的意思 | ダブルタップで、文脈に合った意味をAIが解説 |
| K9 | Read X (Twitter) posts bilingually in the built-in browser | 在内置浏览器里双语看推特（X） | X（旧Twitter）のポストも原文と訳文で読める |
| K4 | AI sentence structure analysis for long sentences | AI 句子结构解析：外语长句一眼看清 | 長い文も、AIが文の構造を解説 |
| K3 | AI read-aloud, or fast on-device iOS voices | AI 朗读，也可用 iOS 本地语音 | AI読み上げと、すぐに再生できるiOSの音声（I18-10） |
| K5 | Chunk Extraction and Action Flow (English pages only) | 语言块提取与句子动作脉络（仅英文网页） | チャンク抽出と文の動きの流れ（英語ページのみ） |
| K6 | Swipe and lookup history to look back on | 翻译与查词历史，随时回看 | スワイプ翻訳と単語の履歴でふり返り（PRO-14） |
| K7 | Cloud translation (Azure + Google) or on-device iOS translation | 云端翻译（Azure + Google）或 iOS 本地翻译 | クラウド翻訳（Azure・Google）かiOSの端末内翻訳 |

ko 的 K2 H3 写「두 번 탭하면 AI 사전이 문맥에 맞는 뜻을 알려 줘요」（I18-12）。

### 4.3 FAQ 问题清单（可见内容，对准真实长尾）

【决策】FAQ 只做可见内容，不输出 FAQPage（R5、F26）。问句用当地用户的问法；答案第一句直接回答（答案先行，研究 06 §3.7）。ko 的答案用합니다체（I18-12）。id 与文档 02 §3.4 / 文档 08 对齐（如 `faq-english-learner`、`faq-devices`）。

| # | en 问句 | zh-Hans / ja 问句 | 对准的长尾 / 目的 | 答案要点（事实依据） |
|---|---|---|---|---|
| 1 | What is WordByWord? | WordByWord 是什么？／WordByWordとは？ | 品牌 + 定义（GEO） | §3.5 定义句；首句写明受众："…an iPhone and iPad app for language learners and anyone reading websites in another language…"（R39、PRO-02）；平台（F13） |
| 2 | Can WordByWord translate a whole web page at once? | 能一键翻译整个网页吗？／ページ全体を一度に翻訳できますか？ | "translate whole page iphone"；诚实预期管理 | 不能。按段落右滑，译文插在原文下方；显示方式 Auto / Paragraph / Sentence by Sentence（F14） |
| 3 | Does it work in Safari or other apps? | 能在 Safari 或其他 App 里用吗？／Safariで使えますか？ | "safari bilingual translation" | 不能。在 WordByWord 内置浏览器中使用：粘贴网址或搜索即可打开任意网站（F13、研究 05 §2.1） |
| 4 | Is WordByWord a word-by-word translator? | WordByWord 是逐词翻译吗？／逐語訳のアプリですか？ | "word by word translation / meaning"（GSC P5） | 只陈述事实："It is not a word-for-word translator: it translates sentences and paragraphs, and explains single words in context."；不解释名字含义（R73、PRO-18）；链接 G3（Phase 2） |
| 5 | Can I read X (Twitter) with WordByWord? | 能用它看推特（X）吗？／X（旧Twitter）も読めますか？ | K9 | 可以在内置浏览器登录 X 网页版，右滑逐条翻译、双击查词（研究 05 §2.4 #12） |
| 6 | Which languages does WordByWord support? | 支持哪些语言？／対応言語は？ | K8、"translate into <lang>" | 21 种译文语言、20 种界面语言；源语言默认英语、自动识别可切换；中日韩原文不支持双击；Chunks / Action Flow 仅英语（F15） |
| 7 | Is WordByWord free? What are the daily limits? | 免费吗？每天能用多少次？／無料ですか？1日の上限は？ | K10 | 免费下载；云端右滑 50、本地右滑 100、双击 20 次/天等；Plus 提升额度，月订（US $3.99）（F16）；已在其他设备订阅："Tap Restore Purchase in the app."（R73、PRO-17） |
| 8 | Which translation engine does it use? | 用的是什么翻译引擎？／翻訳エンジンは？ | K7 | Cloud（Azure + Google）或 Local（iOS 系统翻译）；云端额度用完可切本地（F14）；不写"离线"（H13） |
| 9 | Does it work on iPad and Mac? Is there an Android or desktop version? | 苹果手机、iPad 和 Mac 都能用吗？有安卓版吗？／iPadやMacでも使えますか？Android版はありますか？ | 平台长尾；SEO-11 的本地写法 | iPhone / iPad（iOS / iPadOS 18+）；也可在 Apple 芯片 Mac（macOS 15+）与 Vision Pro 上运行（F13）；**没有 Android 版**（R73）；桌面浏览器：S0 写"桌面浏览器扩展正在准备中"并链到扩展页、不写名称，S1 写 "WordByWord Translate for Chrome" 与 listing 链接（R45） |
| 10 | I'm learning English. Is SurfEnglish worth a try too? | 我在学英语，也可以试试 SurfEnglish 吗？／英語を学んでいます。SurfEnglishも使えますか？ | SE 落点 ②（R42） | 互补式（R40）："Keep using WordByWord for the pages and X posts you choose; add SurfEnglish if you want levelled English news and review games."；zh-Hans 不放 SE 下载链接，并如实注明"SurfEnglish 目前未在中国大陆 App Store 上架"（R42）；de/fr/it/nl/pl/ru/tr/uk 注明 SE 界面无该语言、译文可选（基线 §F、F18）；SE 的语音卖点必须带"AI"限定，不写成 WBW 没有的端侧语音（R41） |
| 11 | Do I need an account? | 需要注册账号吗？／アカウント登録は必要ですか？ | 支持类（R73、PRO-17） | "No. WordByWord works without signing up; you only sign in to sites such as x.com inside its browser." |

> 【一致性审计】上表按 SEO 意图列出问题，编号只作本节引用。上线的问题集合、顺序与问句措辞以文档 08 §2 为准：共 13 问，#1–#8 同上表，之后依次为 `account`、`restore`、`android`（R73），`english-learner` 排倒数第二、`devices` 排最后（文档 04 §3.2、文档 08 D5）。上表 #9 对应 `devices`（Android 问另设 `android`），#10 对应 `english-learner`，#11 对应 `account`。

**问句中的本地 iPhone 写法**（SEO-11）：`devices` 问句在 ru 写 "Работает ли WordByWord на айфоне, iPad и Mac?"，uk 写 "Чи працює WordByWord на айфоні, iPad і Mac?"，ar 写 "هل يعمل WordByWord على الآيفون والآيباد وMac؟"，th 写 "WordByWord ใช้บนไอโฟน iPad และ Mac ได้ไหม"，zh-Hans 写"苹果手机、iPad 和 Mac 都能用吗？"。SEO-11 原建议的 zh-Hans 问句"苹果手机怎么翻译网页并保留原文？"是 how-to 句式，按 §1.6 归 G1，故改放在问 #9。

暂不放：隐私 / 数据收集问题（等 H6）；"什么是语块"（SE 的 FAQ 题，§1.4）。

### 4.4 SE 推荐区块的 SEO 约束

位置、篇幅与写作规则由文档 04 负责，文案以文档 08 为唯一来源（R75）；SEO 侧只约束（R40–R44、R3、R10、R35、R42、R76、R84）：
1. 构建期静态 HTML（F36）；标题用 H2，**以 "SurfEnglish" 品牌开头**（R40；en 例 "SurfEnglish: daily English news at your level, from the developer of WordByWord"，ja 例「SurfEnglish：同じ開発者の、レベル別英語ニュースアプリ」）。"Learning English in particular?" 一类条件句挪到正文第一句。seoLint 检查 `#surfenglish h2`（§3.8，SEO-13、PRO-08）。
2. 叙事是"互补、也值得一试"，卖点只用 WBW 没有的（A1–C1 分级英语新闻、Sentence Builder / Word Raid 复习小游戏、从 Safari 分享文章进 App〔SE 分享扩展已核实，文档 04 §5.1〕）；禁止替换性措辞（§1.4）与"端侧/离线语音是 SE 独有"（R41）。
3. 区块内文字 ≤ 首页正文的 15%（避免主题被稀释，研究 02 §4.1 #2 的教训）；高度桌面 ≤ 420px、手机 ≤ 480px（R10；≤ 480px 适用于 ≥ 375px 宽，320px 宽 ≤ 560px，R84）。
4. 每页最多 1 个 SE 核心词锚文本（①，§3.7）；不用裸域名 "surfenglish.app" 作锚文本（R76）。
5. 落点：① 卡片（19 个首页；zh-Hans 不渲染；site-notice 开启时不渲染）、② FAQ 一问、④ 页脚、⑤ `/about/`、⑥ SE 侧反向链接（R42 删除 ③，R35）。zh-Hans 页只保留 ②④⑤。
6. GA：事件 `surfenglish_promo`，label 按文档 04（`card_*`、`faq_*`、`footer_*`、`about_*`；`langhint_anchor` 停用）；曝光事件只给落点 ①（`surfenglish_promo_view`，可见 ≥ 50% 时每页 1 次）（R3）。locale 维度看 GA 的 `page_locale`，不进 label。
7. SE 的 App Store 链接：文字链接、不用黑色徽章，视觉权重低于 WBW 的任何 CTA（R43）；`ct` 只按落点：`wbw-card`、`wbw-about`（≤ 30 字符，R3、F28；② ④ 不放 SE 的 App Store 链接，文档 04 §7.2）。v1.0 的 `ct=wbw-<slot>-<locale>` 已被 R3 取代：ASC 每个 campaign 需 ≥ 5 次首次下载才显示数据，按 locale 拆分永远看不到。

---

## 5. 结构化数据

### 5.1 决策汇总

| 类型 | 决策 | 理由 |
|---|---|---|
| WebSite | 【决策】只在 `/` 输出完整节点；locale 页只用 `@id` 引用 | Google 站点名称只认首页的 WebSite（研究 06 §4）；避免同一 `@id` 在不同语言页给出不同 description（SE 的同类问题，研究 03 §1.13 #8） |
| WebPage | 每页一个，`inLanguage` = 该页语言，name / description = 该页 title / description | 本地化文字都放在 WebPage 上 |
| MobileApplication | 【决策】`@id` 全站唯一 `https://www.word-by-word.app/#app`；`applicationCategory: "EducationalApplication"`；en 首页与 `/about/` 输出完整节点（含 description、featureList）；locale 页只输出语言无关字段；20 种界面语言用 `inLanguage`（CreativeWork 属性，MobileApplication 继承），**不用** `availableLanguage`（SEO-09） | `EducationalApplication` 在 Google 支持列表内，并与 App Store 主分类 Education 一致（研究 05 §2.1）；不照抄 SE 的非法值（F23）。`availableLanguage` 在 schema.org 上只用于 ContactPoint、Course、LodgingBusiness、ServiceChannel、TouristAttraction（2026-10-05 核实），用在 MobileApplication 上 Schema Markup Validator 会报"属性不被该类型识别" |
| aggregateRating / review | 【决策】**不放** | ① Google 要求评分来自本站用户，禁止聚合其他网站（App Store）的评分（F26、研究 06 §4）；② WBW 全球评分接近 0（cn 区 1 条 2.0，F17）。代价是拿不到软件富结果，接受；JSON-LD 的价值定位为实体消歧与 AI 可读性 |
| Person | 【裁定】与 SE 共享 `@id` `https://surfenglish.app/about/#maker`；`name: "Jinlong"`，`alternateName: "Chi Jinlong"`（U4、F19）；`sameAs` 用文档 04 §8.1 的清单 `["https://x.com/JinlongDev", "https://apps.apple.com/developer/id1794902022"]`，两站**逐字一致**（R17；开发者页用不带店面的短链接，2026-10-05 实测 301 → `/us/developer/chi-jinlong/id1794902022`）；每页内联一份相同节点，不依赖跨域解析 | R17、研究 10 C18、研究 06 §4 |
| Organization | 【决策】**不需要** | 独立开发者，无公司实体；App Store 卖家是个人 "Chi Jinlong"（F19）；Google 的 Organization 无必填项，用 Person 更真实（研究 06 §4）。将来若有工作室名，再加 Organization 并让 `founder` 指向同一 Person |
| BreadcrumbList | 【决策】首页不输出；`/about/`、`/chrome-extension/`、指南页输出（与可见面包屑一致） | 移动端结果已不显示面包屑（研究 06 §4），桌面仍有用，成本极低 |
| FAQPage | 【决策】**不输出** | FAQ 富结果 2026-05 起不再展示（F26）；只做可见 FAQ |
| HowTo / SearchAction | 不做 | 已移除（研究 06 §4） |
| Article | 仅 Phase 2 指南页 | 作者、日期（E-E-A-T） |
| 跨站关系 | 共享 Person `@id` + 可见文字说明 + `/about/` 的 `mentions`；**不用** `isRelatedTo`、不在两站间用 hreflang / canonical | 研究 10 C18、F35 |

### 5.2 en 首页 `@graph` 完整示例

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.word-by-word.app/#website",
      "url": "https://www.word-by-word.app/",
      "name": "WordByWord",
      "alternateName": ["WordByWord Translate", "Word by Word"],
      "inLanguage": ["en", "zh-Hans", "zh-Hant", "ja", "ko", "es", "pt-BR", "fr", "de", "it",
                     "nl", "pl", "ru", "tr", "uk", "vi", "th", "id", "ar", "hi"],
      "publisher": { "@id": "https://surfenglish.app/about/#maker" }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.word-by-word.app/#webpage",
      "url": "https://www.word-by-word.app/",
      "name": "WordByWord: Bilingual Web Page Translator App for iPhone",
      "description": "For language learners: swipe right on a paragraph in WordByWord to see its translation below. Double-tap a word for its meaning. Free on iPhone & iPad.",
      "inLanguage": "en",
      "isPartOf": { "@id": "https://www.word-by-word.app/#website" },
      "about": { "@id": "https://www.word-by-word.app/#app" },
      "mainEntity": { "@id": "https://www.word-by-word.app/#app" },
      "primaryImageOfPage": "https://www.word-by-word.app/assets/og/home-en.<h8>.jpg"
    },
    {
      "@type": "MobileApplication",
      "@id": "https://www.word-by-word.app/#app",
      "name": "WordByWord",
      "alternateName": ["WordByWord Translate", "WordByWord翻譯", "WordByWord Переводчик", "Word by Word"],
      "description": "WordByWord is a reading assistant for language learners on iPhone and iPad: open any website in its built-in browser, swipe right on a paragraph to see the translation below the original, and double-tap a word for an AI explanation of its meaning in context.",
      "url": "https://www.word-by-word.app/",
      "operatingSystem": "iOS 18.0 or later, iPadOS 18.0 or later",
      "applicationCategory": "EducationalApplication",
      "softwareVersion": "1.2.2",
      "datePublished": "2025-06-06",
      "image": "https://www.word-by-word.app/icons/icon-512.png",
      "screenshot": [
        "https://www.word-by-word.app/assets/img/shot/en/swipe-540.<h8>.jpg"
      ],
      "featureList": [
        "Swipe to Translate: the translation appears right below the original",
        "Double-tap a word for its AI meaning in context",
        "Read X (Twitter) posts bilingually in the built-in browser",
        "AI sentence structure analysis for long sentences",
        "AI read-aloud, or fast on-device iOS voices",
        "Chunk Extraction and Action Flow (English pages only)",
        "Swipe and lookup history to look back on",
        "Cloud translation (Azure + Google) or on-device iOS translation"
      ],
      "inLanguage": ["en", "zh-Hans", "zh-Hant", "ja", "ko", "es", "pt-BR", "fr", "de", "it",
                     "nl", "pl", "ru", "tr", "uk", "vi", "th", "id", "ar", "hi"],
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "url": "https://apps.apple.com/app/id6741724502",
        "description": "Free download with daily free limits; optional WordByWord Plus monthly subscription"
      },
      "downloadUrl": "https://apps.apple.com/app/id6741724502",
      "installUrl": "https://apps.apple.com/app/id6741724502",
      "sameAs": ["https://apps.apple.com/app/id6741724502"],
      "creator": { "@id": "https://surfenglish.app/about/#maker" },
      "publisher": { "@id": "https://surfenglish.app/about/#maker" },
      "mainEntityOfPage": { "@id": "https://www.word-by-word.app/#webpage" }
    },
    {
      "@type": "Person",
      "@id": "https://surfenglish.app/about/#maker",
      "name": "Jinlong",
      "alternateName": "Chi Jinlong",
      "url": "https://surfenglish.app/about/",
      "sameAs": [
        "https://x.com/JinlongDev",
        "https://apps.apple.com/developer/id1794902022"
      ]
    }
  ]
}
```

字段来源：`softwareVersion`、`datePublished` 来自 `SITE.appVersion` / `SITE.appReleaseDate`（F13，发版时更新）；`featureList` 与可见 H3（§4.2）同源，构建时生成，不手写；`screenshot`、`primaryImageOfPage` 用构建产物的指纹化路径（`/assets/…`，R8、R9、文档 06 §6.2，OG 与 sitemap、JSON-LD 共用同一 URL）；`inLanguage` 为 20 种界面语言（F15，SEO-09）；`offers` 只描述 App 本体价格 0，不另列 Plus 价格（避免地区价格过期）；`downloadUrl` 不带 `pt/ct`（结构化数据保持规范 URL）；Person `sameAs` 与文档 04 §8.1 逐字一致（R17，开发者页 URL 取自 App Store 页面并经 curl 验证）。文档 06 D-9 增加"属性必须在该类型定义域内"的白名单校验（SEO-09）。

### 5.3 locale 首页（以 `/ja/` 为例）的差异

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.word-by-word.app/ja/#webpage",
      "url": "https://www.word-by-word.app/ja/",
      "name": "WordByWord｜iPhoneでWebページを翻訳・対訳表示するアプリ",
      "description": "WordByWordは外国語のWebページを読んで学べるiPhone・iPadアプリ。アプリ内ブラウザで段落を右にスワイプすると訳文が原文のすぐ下に。単語をダブルタップでAIが文脈に合う意味を表示。無料。",
      "inLanguage": "ja",
      "isPartOf": { "@id": "https://www.word-by-word.app/#website" },
      "about": { "@id": "https://www.word-by-word.app/#app" },
      "mainEntity": { "@id": "https://www.word-by-word.app/#app" },
      "primaryImageOfPage": "https://www.word-by-word.app/assets/og/home-ja.<h8>.jpg"
    },
    {
      "@type": "MobileApplication",
      "@id": "https://www.word-by-word.app/#app",
      "name": "WordByWord",
      "operatingSystem": "iOS 18.0 or later, iPadOS 18.0 or later",
      "applicationCategory": "EducationalApplication",
      "isAccessibleForFree": true,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD",
                  "url": "https://apps.apple.com/app/id6741724502" },
      "downloadUrl": "https://apps.apple.com/app/id6741724502",
      "sameAs": ["https://apps.apple.com/app/id6741724502"],
      "creator": { "@id": "https://surfenglish.app/about/#maker" }
    },
    { "@type": "Person", "@id": "https://surfenglish.app/about/#maker", "name": "Jinlong",
      "alternateName": "Chi Jinlong", "url": "https://surfenglish.app/about/",
      "sameAs": ["https://x.com/JinlongDev", "https://apps.apple.com/developer/id1794902022"] }
  ]
}
```

### 5.4 `/about/` 与指南页

`/about/`：`AboutPage`（`@id …/about/#webpage`，`mainEntity` → `#app`，`author` → Person，`inLanguage: "en"`，`mentions` → SE App）+ 完整 MobileApplication（同 §5.2）+ Person（加 `"description": "Independent iOS developer and creator of SurfEnglish and WordByWord."`，与文档 04 §8.1 的 SE 侧写法逐字一致）+ BreadcrumbList（Home › About）。`mentions` 节点：

```json
{ "@type": "MobileApplication", "@id": "https://surfenglish.app/#app",
  "name": "SurfEnglish", "url": "https://surfenglish.app/",
  "creator": { "@id": "https://surfenglish.app/about/#maker" } }
```

指南页（Phase 2）：`Article`（`headline`、`description`、`datePublished`、`dateModified`（取该页源文件 git 日期，不手写）、`author` / `publisher` → Person、`about` → `#app`、`inLanguage`、`image` 为文中真实截图）+ BreadcrumbList（Home › Guides › 本页）+ Person。

### 5.5 SE 侧需要同步的修改（SE 仓库配套改动，不在本仓库执行）

具体文件与行号以文档 04 §8 为准（PR-SE-1 / PR-SE-2）；本表只列 SEO 侧的要求。

| # | 位置 | 改动 | 目的 |
|---|---|---|---|
| S1 | ~~`build.mjs:39-40` 把 `makerFullName` 改为 `'Chi Jinlong'`~~ | **已被 R17 否决**：SE 可见署名保持 "Jinlong"，不改 `makerFullName`（SE 在 `1c684e0` 主动改成了 Jinlong，与 U4 一致）。Person 的 `alternateName: "Chi Jinlong"` 只在 JSON-LD 中输出，不进入可见文本，实现方式以文档 04 §8.1 为准 | 两站 Person 节点一致，同时不改 SE 的对外署名 |
| S2 | `src/templates/home.mjs`、`about.mjs` 的 Person 节点 | `sameAs` 增加 `https://apps.apple.com/developer/id1794902022` | 两站 Person 字段逐字相同（R17） |
| S3 | `about.mjs` Person `description` | "Independent iOS developer and creator of SurfEnglish and WordByWord." | 实体层面声明两款 App 同一作者 |
| S4 | `about.mjs` | AboutPage 增加 `mentions` → `{"@type":"MobileApplication","@id":"https://www.word-by-word.app/#app","name":"WordByWord","url":"https://www.word-by-word.app/"}`；正文加 "Also by Jinlong: WordByWord" 一段 + Official links 加一项。文案按 R40 / PRO-13：写 "WordByWord is the developer's web reader for many languages, and SurfEnglish shares its reading engine."，**删除 "earlier app" 一类说法**，不写"读非英语内容时 WordByWord 更合适"之类的分流句 | 反向实体关联 + 可抓取反链（基线 §F⑥） |
| S5 | `layout.mjs` footer | "More from the maker：WordByWord" 一条链接；锚文本用 WBW 在该语言的 K1 主词 + 品牌（12 个 locale 的锚文本表见文档 04 §8.2，不写"学英语""新闻""整页翻译"）；PR-SE-1 先链 WBW 根（`localized: false`），PR-SE-2 改为按 locale 链到 WBW 对应语言页（`/<path>/`，follow） | 双向编辑性链接，规模受控（研究 06 §5.1）；这是 11 个非英语 locale 唯一的 follow 外链来源（SEO-02） |
| S6（可选） | `home.mjs:97` 等 | `applicationCategory` 改为 `EducationalApplication`；`og:locale` 改 `ll_CC` | 修 SE 自身缺陷（F23），不阻塞 WBW |
| **S7**（R52、SEO-03） | `src/locales/*.json` 的 `explore.title`（12 个 locale；`home.mjs:255` 渲染为 `<h2>`、`:124` 写入 JSON-LD `featureList`）与 `meta.keywords`；`build.mjs` | ① 12 个 locale 的 "Any website, read bilingually" 类标题加"英文 / English"限定，例 en "Beyond the news: any English website, read bilingually"、zh-Hans"英文网站，也能双语对照着读"、ja「英語のサイトも、対訳で読める」、ko「영어 웹사이트도 대역으로 읽기」；② 从 SE `meta.keywords` 删除归属 WBW 的词（parallel text reading app、translation below the original、段落翻译 / 段落翻訳 / 문단 번역）；③ SE build 增加镜像 lint：title / H1 / H2 中出现 "any website / 任何网站 / どんなサイト / 어떤 웹사이트" 时，同一字符串必须同时含 English / 英语 / 英文 / 英語 / 영어 | 防蚕食规则不能只在 WBW 侧执行：SE 现网的 H2 与 featureList 直接占了 WBW 的 K1 领地，违反基线 §B4"SE 写英语新闻限定" |

**时序**【裁定】（R51，修正 H14 的默认值）：**PR-SE-1（S2–S4、S5 的 `localized: false`、S7）在 T0 前合并；PR-SE-2（S5 改为 `localized: true`）在 T0 后 verify-deploy 通过即合并，最迟 T+7d**，合并前用脚本确认 WBW 的 12 个 `/<path>/` 全部返回 200（文档 04 §8.4）。PR-SE-1 合并前两站 Person 的 `sameAs` 短暂不一致，可接受。

---

## 6. 技术 SEO 清单

### 6.1 locale 首页 `<head>` 模板（`/ja/` 示例）

```html
<html lang="ja" data-script="cjk">                 <!-- ar: lang="ar" dir="rtl" data-script="arab"（R60） -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WordByWord｜iPhoneでWebページを翻訳・対訳表示するアプリ</title>
<meta name="description" content="…（§3.9）">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">  <!-- 原型 head 的 noindex,nofollow 不得带入模板（R49） -->
<meta http-equiv="content-language" content="ja">  <!-- zh-Hans→zh-cn、zh-Hant→zh-tw、pt-BR→pt-br，其余为语言码（R47）；不输出同名 HTTP 头 -->
<link rel="canonical" href="https://www.word-by-word.app/ja/">
<link rel="alternate" hreflang="en" href="https://www.word-by-word.app/">
<link rel="alternate" hreflang="zh-Hans" href="https://www.word-by-word.app/zh-hans/">
<!-- … 共 22 条：20 种语言（含自身）+ /pt-br/ 的 hreflang="pt"（R53）+ x-default；条数由 LOCALES 计算 … -->
<link rel="alternate" hreflang="x-default" href="https://www.word-by-word.app/">
<link rel="author" href="https://www.word-by-word.app/about/">
<meta name="apple-itunes-app" content="app-id=6741724502">
<meta property="og:type" content="website">
<meta property="og:site_name" content="WordByWord">
<meta property="og:title" content="…（= title）">
<meta property="og:description" content="…（= description）">
<meta property="og:url" content="https://www.word-by-word.app/ja/">
<meta property="og:image" content="https://www.word-by-word.app/assets/og/home-ja.<h8>.jpg">  <!-- R9 -->
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="…（本地化）">
<meta property="og:locale" content="ja_JP">
<meta property="og:locale:alternate" content="en_US"> <!-- … 其余 18 个 … -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="@JinlongDev">   <!-- H15 默认沿用 -->
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png">
<meta name="theme-color" content="…（文档 05 token）">
<script type="application/ld+json">{ … §5.3 … }</script>
<!-- GA4 G-QS1CJY8YWL 留在 <head>（研究 09 §3.8） -->
```

### 6.2 清单

| 项 | 规则【决策】 | 实现 | 验收 |
|---|---|---|---|
| canonical | 每个可索引页自引用、绝对 URL、`https://www.word-by-word.app` 前缀、目录以 `/` 结尾；永不出现 `pages.dev`；契约页 canonical 指向契约 URL 本身（`/privacy.html` 等，按研究 09 §3.5 C-1）；S0 下的扩展页与扩展隐私页不写 canonical（文档 02 §3.5） | `layout` 统一输出 | 脚本抓取所有 HTML，canonical 与访问 URL（去 query）一致 |
| 索引一致性 | 【裁定】每个产出页满足 **可索引 ⇔ robots 不含 noindex ⇔ 有自引用 canonical ⇔ 在 sitemap**；noindex 页不得进 sitemap 或任何 hreflang 簇；`_headers` 中除 pages.dev 主机规则外不得出现 X-Robots-Tag（R49、SEO-06） | 文档 06 D-20 | 构建期 D-20；verify-deploy 对 20 个首页断言 robots meta 含 `index`、不含 `noindex`，`--prod` 下 X-Robots-Tag 为空 |
| hreflang | 20 个首页互相声明 + `/pt-br/` 同时标 `pt-BR` 与 `pt`（R53）+ `x-default → /`，共 22 条，**条数由 LOCALES 计算，不写死**；代码 `en zh-Hans zh-Hant ja ko es pt-BR fr de it nl pl ru tr uk vi th id ar hi`（F35，研究 02 §2.5）；单语页（`/about/`）不输出；扩展页只在 S1 下组成 en + zh-Hans 两成员簇；指南按实际译本成簇；**不与 SE 互指** | HTML `<link>` 与 sitemap `xhtml:link` 由同一个 `LOCALES` 函数生成（与 SE 一致，研究 03 §1.7；文档 02 §6.1） | 每个首页 22 条；全部双向；全部 200 且为 canonical URL；GSC 不再提供 hreflang 报告，靠构建脚本断言 |
| 语言切换器 | header 紧凑入口 + footer 20 语言全量静态链接；不按 IP / `navigator.language` 自动跳转（研究 06 §1.4）；可选的语言建议条须为可关闭的普通链接、非弹窗、带 `data-nosnippet`（文档 02 §0 第 8 条） | 静态 HTML | 20 个首页互相可达（每页 ≥ 19 条语言内链） |
| robots.txt | `User-agent: *` / `Allow: /` / `Sitemap: https://www.word-by-word.app/sitemap.xml`；不屏蔽 Googlebot、Bingbot、OAI-SearchBot、PerplexityBot；GPTBot、Google-Extended 默认不屏蔽（与搜索可见性无关，属商业选择，研究 06 §3.7） | 构建生成 | `curl` 200，内容如上 |
| noindex | `/404` 页 `noindex` 且不输出 canonical（修 SE 的同类问题，研究 03 §1.13 #6）；扩展页与扩展隐私页在 S0 下 `noindex,follow`（R2、§3.10）。**`/legal/*` 不加 noindex**，靠 canonical 指回契约 URL（R48、SEO-05）：`/legal/privacy/` 与 `/privacy.html` 是同一个文件（200 代理），加 noindex 会让契约 URL 一起带上，而它们都在 sitemap 里 | meta robots | 抓取验证；契约 URL 与 `/legal/*/` 响应无 `X-Robots-Tag`（文档 02 §5.4） |
| sitemap.xml | 只列可索引 canonical URL：20 个首页（每条带 22 条 `xhtml:link`）+ `/about/` + `/privacy.html` + `/support.html`，S0 共 23 条；S1 再加 `/chrome-extension/`、`/zh-hans/chrome-extension/`、`/chrome-extension/privacy.html`，共 26 条（文档 02 §0 第 2 条）；每个首页带 `image:image`（该 locale 的 hero / 功能截图 + OG 图，只写 `image:loc`，路径与 og:image 相同，R9）；`lastmod` 取该页**自身**源文件（locale JSON + 页面模板）的 git 日期，不把 `build.mjs` / `layout.mjs` 算进去（避免 SE 那样全站 lastmod 一起变，研究 03 §1.6）；浅克隆拿不到历史时整体省略 `lastmod`（文档 06 §3.6.1）；不写 `priority` / `changefreq` | 构建生成 | XML 校验通过；URL 全部 200 |
| sitemap-legacy.xml | 列出全部旧 URL（`/ja-top.html` 等 21 + 无扩展名变体），T0 一并提交；**删除条件**：GSC 中该 sitemap 的 URL 全部显示为"已重定向"，或上线满 6 周，以先到者为准（SEO-10；v1.0 的"2–4 周后删除"对小站偏短，Googlebot 重抓旧 URL 可能更慢） | 手写一次 | GSC 中旧 URL 显示"已重定向" |
| 重定向 | 旧 URL 单跳 301 到新 URL（基线 §C 映射）；保留 ≥ 1 年（建议永久）；不用占位符规则；**规格与测试夹具以文档 02 §5.2 为唯一事实源**（R54） | `_redirects`（研究 09 §3.4；文档 06 生成器逐条产出） | 研究 09 §7 脚本；文档 06 D-12 以文档 02 夹具断言 |
| OG / Twitter | 每 locale 一张 1200×630 OG 图（HTML/CSS 用本机 Chrome headless 渲染导出，R34；17 个 locale 的 OG 在 M3 审校定稿后统一生成，审校改动后重新生成，R59），指纹化放在 `/assets/og/home-<locale>.<h8>.jpg`（R9）；`og:image:alt` 本地化；`og:locale` 用 `ll_CC`：en_US、zh_CN、zh_TW、ja_JP、ko_KR、es_ES、pt_BR、fr_FR、de_DE、it_IT、nl_NL、pl_PL、ru_RU、tr_TR、uk_UA、vi_VN、th_TH、id_ID、ar_AR、hi_IN；`twitter:card summary_large_image`，`twitter:creator @JinlongDev`（H15） | 构建输出（文档 06 `scripts/og.mjs`） | 抽查 X / LINE / Slack 预览 |
| Smart App Banner | `<meta name="apple-itunes-app" content="app-id=6741724502">`，**只放 WBW 自己的 id**（基线 §B1、研究 06 §7.1）；不加 `app-argument`（App 无 associated domains）；拿到 `pt`（H3）后可试 `affiliate-data=pt=<pt>&ct=wbw-sab`，以 ASC App Analytics 实测为准；privacy / support 页也放 | layout | iOS Safari 真机可见（模拟器不显示） |
| App Store 链接 | `https://apps.apple.com/app/apple-store/id6741724502?pt=<pt>&ct=<ct>&mt=8`（F28）；【裁定】`ct` **只按落点**，不带 page / locale：`wbw-header`、`wbw-hero`、`wbw-pricing`、`wbw-cta`、`wbw-about`、`wbw-ext`、`wbw-sab`（R55、ENG-06；locale 维度看 GA 的 `page_locale`）。理由同 R3：ASC 每个 campaign 需 ≥ 5 次首次下载才显示数据，20 locale × 6 落点 + Smart Banner ≈ 140 个 campaign 在当前流量下永远不可见。`pt` 未到位前先用不带参数的 `https://apps.apple.com/app/id6741724502` | `SITE.appStore.ct(placement)` | `ct` 长度 ≤ 30；全站不同 `ct` 值 ≤ 10（文档 06 D-11，ENG-06） |
| App Store 徽章 | 用 Apple 本地化 SVG（`toolbox.marketingtools.apple.com/.../black/<locale>`，F28）；uk 用 v2 接口的 `uk-ua`，ar、hi 用 `en-us`（文档 02 §4.1 注 ⁵ 的 2026-10-05 复核，修正 F28 的 uk 部分）；下载后自托管，写 `width` / `height` | `assets/badges/` | 20 locale 徽章不再全是 en-us（F11） |
| Content-Language | 【裁定】（R47，取代 v1.0 的"`_headers` 按路径输出"）：**不输出 Content-Language HTTP 头**（CF 对命中多条规则的同名头用逗号拼接，`/*` 加 `/ja/*` 会让 `/ja/` 返回 `en, ja`，SEO-04）；保留 `<html lang>`；保留 `<meta http-equiv="content-language">`，值取 LOCALES 的 `contentLanguage`：zh-Hans→`zh-cn`、zh-Hant→`zh-tw`、pt-BR→`pt-br`，其余为语言码（Bing 惯用语言-地区写法，I18-14）；W3C Nu 校验对这一条 error 做显式 allowlist（ENG-07） | layout；`_headers` 不得出现 Content-Language | 抓取 `/ja/` 的 meta 值严格等于 `ja`、`/zh-hans/` 等于 `zh-cn`；`curl -sI` 任一路径均无 `content-language` 头 |
| 文字系统属性 | `<html data-script>`：latn / cyrl / cjk / thai / deva / arab（R60），供文档 05 的多文字排版规则使用 | layout | 文档 06 的 D 规则断言 |
| HTTPS / 主机 | 唯一主机 `www`；apex 本期不处理（基线 §A U1、§G）；`.app` 在 HSTS 预加载列表，浏览器强制 https（F6） | — | — |
| pages.dev | `<project>.pages.dev` 会 200 返回同内容（F24）；靠绝对 canonical 指回 www，站内与外部任何地方都不链接 pages.dev | — | 抽查 pages.dev 页面 canonical 为 www |
| 不做 | llms.txt（对 Google 无作用，研究 06 §3.8）、`<meta name="keywords">`（R6）、AMP、FAQPage（R5）、Content-Language HTTP 头（R47） | — | — |

### 6.3 搜索引擎接入

| 引擎 | 适用 locale | 做法【决策】 | 时间点 |
|---|---|---|---|
| Google Search Console | 全部 | 网域属性已存在（F25）；迁移前加 URL 前缀属性 `https://www.word-by-word.app/` 作备份（研究 09 §3.9；验证方式见 H8）；提交 `sitemap.xml` + `sitemap-legacy.xml`；对 `/`、5 个 T1 首页、`/about/`、`/privacy.html` 做 URL 检查并请求编入索引；`/ja-top.html` 检查确认显示重定向；同域改路径**不用** Change of Address | T0 |
| Bing Webmaster Tools + IndexNow | 全部；zh-Hans 大陆用户的主要可行路径（必应中国份额 21.76%，研究 06 §1.7）；ja（Bing 31.41%） | 从 GSC 导入站点；提交 sitemap；根目录放 IndexNow key 文件 `/<key>.txt`。【决策】（SEO-10）`scripts/indexnow.mjs` **不做差分**：生产部署完成后直接抓取 `https://www.word-by-word.app/sitemap.xml` 中的全部 URL（不超过 30 条）一次性 POST 到 `https://api.indexnow.org/indexnow`；**T0 首推另外加上 `sitemap-legacy.xml` 中的全部旧 URL**，让 Bing / Yandex 尽快看到 301。v1.0 的"按 lastmod 与上次推送时间做差分"不可执行：浅克隆时 sitemap 省略 lastmod（文档 06 §3.6.1），GitHub Actions 默认也是浅克隆，"上次推送时间"也没有地方存。如果将来页面多到需要差分，Action 必须 `fetch-depth: 0`，用 `git diff --name-only <prev> <cur>` 映射到 `PAGES.sources`。CF Pages 构建在部署前执行，不能在构建里推送；脚本在 `cloudflare-deploy` 分支部署完成后由 GitHub Action 延迟执行或手动执行 | T0；每次发版 |
| Naver Search Advisor | ko | 注册 `https://www.word-by-word.app`；HTML 标签验证（`<meta name="naver-site-verification">` 放在 `/` 的 `<head>`，由 `SITE.verification.naver` 输出）；提交 sitemap。**IndexNow 已覆盖 Naver**（2026-10-05 核实 `indexnow.org/searchengines.json`：bing、yandex、seznam、naver、yep、internetarchive、amazonbot），上面那一次推送就会同步给 Naver；对 `/ko/` 手工发"웹 페이지 수집 요청"只是补充（SEO-10）。Naver 不支持 hreflang（研究 06 §1.7），`/ko/` 必须靠 sitemap 与自身内容被发现；Naver 摘要重视 title / description / og 标签，ko 三者必须是韩语 | T0 |
| Yandex Webmaster | ru（可选） | meta 验证 + sitemap；推送已由 IndexNow 覆盖 | T+2 周内，可选 |
| Baidu | zh-Hans | **低优先，不做专门优化**。理由：站点境外托管、无 ICP，Baidu 对境外站收录弱（研究 06 §1.7）；Baidu 不支持 hreflang；CF / Google Analytics 在大陆的可达性未验证（研究 10 G11）；大陆可行路径是 Bing。可选：百度搜索资源平台提交 sitemap，零维护 | 可选 |

### 6.4 图片 SEO 与 Core Web Vitals 预算

**图片规则**【决策】：
- 有意义的图一律用 `<img>`（不用 CSS 背景）；`<picture>`：AVIF + JPEG 回退（本机 `sips` 能出 AVIF / JPEG、不能出 WebP，F33），本地预处理后提交（基线 §D）。AVIF 编码前把宽高修正为偶数，并做解码 + alpha 校验，防止"白板图"（R8、R58，文档 06 §7）。
- 所有 `<img>` 写 `width` / `height`；首屏真实截图 `loading="eager" fetchpriority="high"`，其余 `loading="lazy" decoding="async"`。hero 主体是 HTML 实时样张（基线 §E；自写的完整文章段落，R66），LCP 元素很可能是 H1 或样张文字。
- 文件名描述性 + 语言后缀 + 指纹，路径按文档 06 §6.2：`/assets/img/<group>/<set>/<subject>-<w>.<h8>.<ext>`；OG 图 `/assets/og/home-<locale>.<h8>.jpg`（R9：OG 也指纹化，与 sitemap、JSON-LD 共用同一 URL；v1.0 的"OG 不指纹"已被 R9 取代）。
- 本地化截图只有 en / ja / zh-Hans（F31）；zh-Hant 默认回落 en 截图（R33），与其余 16 个 locale 一样在 alt 写明"英文界面"（§3.6）；不使用带 Gemini 水印图、`wbw_en.002`（意大利语按钮）；"读 X"卡在全部 locale 改用 HTML/CSS 通用社交帖样张（R71；en 截图裁不掉 "Extract chunks" 按钮，R31、文档 05 §5.4.3）；截图裁掉原始状态栏，由 CSS 机身统一绘制（R67）。
- 截图中的第三方内容：VOA / Wikipedia / NHK 的文章文本可用；避免显眼的品牌推广帖（OpenAI、GitHub 等）与真实人名标题；头像做模糊处理（R32）。SE 卡片配图用 `games-home.jpg` 上部裁切（R44）。

**CWV 与体量预算**：【裁定】数字以文档 06 为准（R19：文档 06 §6.3 体积预算 D-18 与 §11 Lighthouse 阈值）。v1.0 本节自定的 HTML / CSS / JS gzip 数字已删除，避免两份口径。SEO 侧只重申与排名直接相关的门槛：

| 指标 | 门槛 | 依据 / 测量 |
|---|---|---|
| LCP | ≤ 2.5 s（移动，实验室 Lighthouse 默认节流） | web.dev 阈值（研究 06 §6.1）；站点流量小，CrUX 现场数据大概率不可得，以实验室为准 |
| CLS | 实验室 ≤ 0.05；现场 ≤ 0.1 | 无 JS 注入条（基线 §F），图片全部带尺寸 |
| INP / TBT | 现场 INP ≤ 200 ms；实验室 TBT 按文档 06（≤ 200 ms） | — |
| 首屏图片 / 整页图片 | ≤ 150 KB / ≤ 1.2 MB（现状 15–17.5 MB，F8） | 基线 §E |
| Web 字体 | 0 | 基线 §E |
| Lighthouse（移动） | SEO = 100；其余阈值按文档 06 | 每次发版跑 5 个 T1 首页 |

### 6.5 站外配套（不在网站代码内，影响搜索表现）

| 项 | 动作 | 依据 |
|---|---|---|
| App Store US 描述首行 | 删除内部备注 "English concise submission version"（会进入品牌 SERP 摘要）；随 WBW iOS 下一版本提交（H16） | F17、基线 §G |
| ASC 本地化 Marketing URL | 下个版本把各本地化的 Marketing URL 改为对应语言页（ja → `/ja/` 等）。【裁定】apps.apple.com 指向开发者网站的链接一律是 `rel="nofollow noopener noreferrer"`（2026-10-05 curl `apps.apple.com/jp/app/id6741724502` 实测，隐私政策链接同样），所以它只是各语言页的**发现与引荐入口，不计入排名预期**（R51、SEO-02）；提交时间见 H16 | 研究 09 §2.3、基线 §G |
| SE 官网页脚 PR-SE-2 | 真正 follow、按 locale 指向 WBW 语言页的外链只有这一处：SE 的 12 个 locale 页脚链到 WBW 对应路径（en → `/`，其余 11 个 → `/<path>/`）。【裁定】R51：PR-SE-1 在 T0 前合并，**PR-SE-2 在 T0 后 verify-deploy 通过即合并，最迟 T+7d**（§5.5） | R51、文档 04 §8.4 |
| fr / de / it / nl / pl / ru / tr / uk | SE 没有这 8 种界面语言，PR-SE-2 覆盖不到，这 8 个语言页**没有任何 follow 外链**。§8.2 的展示目标对它们按"以品牌词为主"标定，避免误判为迁移失败（SEO-02） | SEO-02 |
| X 个人资料、Product Hunt 等 | 简介链接分别指向两款 App 官网，与 Person `sameAs` 一致 | 研究 06 §5.3 #4 |

---

## 7. 内容路线图

### 7.1 Phase 1（随改版上线）

| 页面 | 关键词任务 | 内容要求 |
|---|---|---|
| 20 个 locale 首页 | §1.6 M1 + §2 主表 + §3.9 | 结构按 §4；审校按 R36 与 R80：en 不设外部母语审校前置，由用户通读 + 双模型互检（可读性、事实、禁用表述）后上线，不阻塞 T0（R80）；T1（ja、zh-Hans、zh-Hant、ko）上线前必须母语审校（zh-Hans / zh-Hant / ja 默认由用户本人审校，zh-Hant 须熟悉台湾用语，做不到时至少术语表 lint 零违规；ko 需外部审校，T-7 前无着落则以"双模型互检 + 回译 + 术语表 lint"上线并标记待复核）；T2 / T3 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校（H7） |
| `/about/` | 品牌 + 实体 + 去歧义 + P5（§1.6 M8） | §3.10 |
| `/chrome-extension/`、`/zh-hans/chrome-extension/` | 扩展品牌词（§1.6 M9） | §3.10；R1 两种语言；S0 时 noindex、不进 sitemap、header 隐藏（R2） |
| `/privacy.html`、`/support.html` | 无关键词任务 | 补 title / description / canonical；不放推荐区块（基线 §F） |
| `/404` | — | Phase 1 只做 en（含 20 种语言首页链接列表），noindex；本地化 404 为 M4 可选项（R21） |

### 7.2 Phase 2 指南（brief）

路径：en `/guides/<slug>/`，本地化 `/<locale>/guides/<slug>/`（基线 §C）；slug 一律英文且各语言共用（便于 hreflang 映射，URL 关键词作用很小，研究 06 §1.3）。≥ 2 篇指南时才生成 `/guides/` 索引页（R25；v1.0 写的"≥ 3 篇"已被取代），footer 链接。开始时间：T+4 周复盘确认收录健康之后。

**G1 · 在 iPhone 上双语阅读网页并保留原文**

| 项 | 内容 |
|---|---|
| slug | `read-web-pages-bilingually-iphone` |
| 目标查询 / 意图 | 【裁定】这是 how-to 查询在 title / H1 层的**唯一承载页**（R46、§1.6 M2），首页不再瞄准这些说法。信息型 how-to：en "how to translate web pages on iPhone"、"translate a webpage iphone keep original"；zh-Hans"iPhone 网页翻译""iphone网页翻译中文""双语对照网页翻译"；zh-Hant"iPhone 網頁翻譯中文"；ja「webページ 翻訳 iphone」「原文と訳文を並べて表示」；ko「아이폰 웹페이지 번역」「원문 번역 같이 보기」（研究 07 §5.1–5.5，均 AC✓；SERP 被 Apple / Google 帮助页与科技博客占据，几乎都只讲 Safari 整页替换，研究 07 §0 #9） |
| 目标 locale | en、zh-Hans、zh-Hant、ja、ko（T2 视 T+12 周数据决定） |
| 标题草案 | en "How to Translate Web Pages on iPhone and Keep the Original"；zh-Hans「iPhone 网页翻译怎么保留原文？3 种做法对比」；zh-Hant「iPhone 網頁翻譯如何保留原文？3 種做法比較」；ja「iPhoneでWebページを翻訳して原文も残す方法」；ko「아이폰 웹페이지 번역, 원문과 같이 보는 방법」 |
| 大纲 | ① 答案先行：Safari 自带翻译会替换原文、只能来回切换"显示原文"，要对照阅读有三类做法；② 做法 A：Safari 自带翻译（步骤、优缺点，引用 Apple 支持页）；③ 做法 B：Safari 扩展（如 Immersive Translate 的整页双语，如实描述并注明核查日期，F29）；④ 做法 C：WordByWord（内置浏览器打开网址 → 右滑段落 → 切换段落 / 逐句显示 → 双击查词），配真实截图；⑤ 对比表（是否保留原文、是否整页、能否查词、X 网页版、价格）；⑥ 限制：WBW 不能整页翻译，中日韩原文不能双击；⑦ 3 条 FAQ；⑧ CTA |
| 可用素材 | `img/en/feature_swipe_demo`、`wbw_en.001`（裁机身）；`wbw_jp.001`；`zh-右滑翻译.png`；HTML 样张。Safari 与扩展部分只用文字描述（没有现成截图，不新增素材，U2） |
| 与 SE 区隔 | 不用"学英语"框架；示例用多种语言（如西语新闻 → 英文、英文博客 → 日文）；**不放 SE 推荐**：R42 的落点清单（①②④⑤⑥）不含指南，页脚 ④ 照常 |
| 内链 | 入：首页 K1 H3 下"在 iPhone 上对照阅读网页的几种做法"；出：首页 #features（品牌锚 + 产品主词，不用 G1 自己的 how-to 主词作锚）、G2、G4、`/about/` |

**G2 · 在 iPhone 上双语读 X / Twitter**

| 项 | 内容 |
|---|---|
| slug | `translate-x-twitter-posts-iphone` |
| 目标查询 / 意图 | 信息型 + 排障：en "translate x posts"、"translate tweets on iphone"、"x translate post not working"；zh-Hans"推特翻译中文""推特翻译设置"；zh-Hant"推特翻譯"；ja「X 翻訳 原文 表示」「X 翻訳 表示されない」；ko「트위터 번역 안됨」「트위터 번역 기능」（研究 07 §5，AC✓） |
| 目标 locale | en、ja、zh-Hans、zh-Hant、ko |
| 标题草案 | en "How to Read X (Twitter) Posts Bilingually on iPhone"；ja「iPhoneでX（旧Twitter）のポストを原文と訳文で読む方法」；zh-Hans「在 iPhone 上双语看推特（X）：原文和译文一起读」；zh-Hant「在 iPhone 上雙語看推特（X）」；ko「아이폰에서 트위터(X) 게시물을 원문과 번역으로 같이 보기」 |
| 大纲 | ① 答案先行；② X App 自带的帖子翻译（逐条点按，**写作时按 X 当前版本实测后再写细节**）；③ 为什么 X App 里用不了浏览器扩展；④ 用 WordByWord：内置浏览器登录 X 网页版 → 右滑帖子 → 双击查词 → 多语言时间线示例（日语 NHK 帖 → 英文）；⑤ 也可以：Safari + Immersive Translate 扩展翻 X 网页版（F29，如实写）；⑥ 限制：X 网页版登录规则可能变化、CJK 双击、每日额度；⑦ FAQ |
| 可用素材 | X 原始截图（`Resources/wbw_en/スクリーンショット 2026-04-23 12.03.10.png`、`wbw_zh/…11.53.37.png`、`…12.44.50.png`；ja 截图混有中文按钮，需裁切或改用 en 图，研究 08 §3.6）；所有 X 截图裁掉 "Extract chunks" 按钮、图注不提语块（R31，按钮行为待 H11）；没有合规截图的语言用 HTML/CSS 通用社交帖样张（R71）；不用 AI 合成营销图 |
| 与 SE 区隔 | SE 也预置 X（研究 05 §4），但 G2 定位"读多语言时间线"，不出现学英语框架；文末**不加** SE 条件说明（PRO-01、R42） |
| 内链 | 入：首页 K9 H3；出：G1、首页、`/about/` |

**G3 · Word-by-word vs sentence-by-sentence translation**

| 项 | 内容 |
|---|---|
| slug | `word-by-word-vs-sentence-translation` |
| 目标查询 / 意图 | 信息型：GSC 已有展示的 "word by word translation"（16，排名 16.6）、"word by word meaning"（17，排名 23）、"translation word by word"、"word by word translate"（研究 00）；扩展 "word for word translation"、"literal translation vs meaning" |
| 目标 locale | en（zh-Hans「逐词翻译和逐句对照有什么区别」、ja「逐語訳と一文ずつの対訳の違い」列入 Phase 3 可选） |
| 标题草案 | "Word-by-Word vs Sentence-by-Sentence Translation, Explained" |
| 大纲 | ① 定义：逐词（直译、行间注释）与逐句（保留意思）；② 自写例句说明逐词直译何时有用、何时误导（习语、语序差异大的语言）；③ 学习与阅读中更好的组合：句子级译文 + 单词的语境释义；④ WordByWord 怎么做：右滑出句 / 段译文，双击看词在这句里的意思——并坦白"虽然叫 WordByWord，但不做逐词直译"；⑤ FAQ："有没有逐词翻译的 App？"（如实回答）。**不涉及 Quran / Bible 逐词译本**（研究 07 §3.2） |
| 可用素材 | HTML 样张（逐词 vs 逐句对照的排版样张，自写例句） |
| 与 SE 区隔 | 讨论翻译方法本身，与语言无关；不以"学英语"为题（SE 有 `/learn-english-by-reading/`，避免同题） |
| 内链 | 入：首页 FAQ #4、`/about/`；出：首页、G1 |

**G4 · WordByWord 与 Immersive Translate（iPhone 版）诚实对比**

| 项 | 内容 |
|---|---|
| slug | `wordbyword-vs-immersive-translate-iphone` |
| 目标查询 / 意图 | 比较 / 选型：en "immersive translate iphone"、"immersive translate alternative"、"immersive translate ios"；zh-Hans"沉浸式翻译 iPhone""沉浸式翻译 替代""沉浸式翻译 App"；zh-Hant"沉浸式翻譯 app"；ja「イマーシブ翻訳 スマホ」「イマーシブ翻訳 アプリ」（研究 07 §5，AC✓） |
| 目标 locale | en、zh-Hans、zh-Hant、ja |
| 标题草案 | en "WordByWord vs Immersive Translate on iPhone, Compared"；zh-Hans「WordByWord 和沉浸式翻译（iPhone 版）怎么选：如实对比」；zh-Hant「WordByWord 與沉浸式翻譯 iPhone 版比較」；ja「WordByWordとイマーシブ翻訳（iPhone版）の違い」 |
| 大纲 | ① 一句话结论：想在 Safari 里整页双语 → Immersive Translate；想按段落按需翻译并查词、读 X → WordByWord；② 两者如何工作（Immersive：iOS App + Safari 扩展、整页双语、可翻 X 网页版，F29；WBW：自带浏览器、右滑段落、AI 语境查词、英文 Chunks / Action Flow、历史、21 种译文语言）；③ 对比表；④ "Immersive Translate 更合适的情况"；⑤ "WordByWord 不同的地方"；⑥ 价格（WBW Plus $3.99/月；对方价格写作时核查）；⑦ 最后核查日期 |
| 规范 | 品牌顺序 WBW 在前；不使用对方 logo 与截图；每条对方能力附官方来源链接与核查日期，每 6 个月复核；不贬低；不写"唯一""最好"（研究 07 R5、研究 06 §3.6） |
| 可用素材 | WBW 截图；对比表纯文本 |
| 与 SE 区隔 | 无关 SE；不放推荐区块 |
| 内链 | 入：G1；出：首页、G1。首页不直接链 G4（避免首页出现竞品名） |

### 7.3 Phase 3（可选，按 T+12 周数据决定）

- T1 本地化 `/about/`（基线 §C 已列为 Phase 2 评估项）；
- G3 的 zh-Hans / ja 版本；G1 的 T2 版本；
- G5「在 iPhone 上读西语 / 法语 / 德语网站」——**一页覆盖多种语言**，不按语言拆页；
- G6「AI 语境查词是什么、和词典有什么不同」（en）；
- G7「用真实网页学外语：在 iPhone 上边读边查」——R39 的通用学习角度（不限语种），可写；不得写成"学英语"（§1.4），与 SE 的 `/learn-english-by-reading/` 不同题。

### 7.4 明确不做

- **"语言 × 功能"程序化批量页**（如 /translate-japanese-to-english/、/for-korean-learners/）——doorway / scaled content 风险（研究 06 §3.2、研究 07 R6），也违反基线 §C；
- 任何"学英语 / learn English by reading"指南（SE 的题，研究 07 §7.4）；不带"英语"的"用网页学外语"属于 WBW（R39，见 §7.3 G7）；
- "best translation apps 2026"类榜单、竞品 listicle；Quran / Bible 逐词内容；
- FAQPage / HowTo 标注、llms.txt、AMP、固定频率博客。

### 7.5 指南编辑规范

1. 每篇署名 "Jinlong"，页内显示发布与更新日期（与 JSON-LD 一致）；
2. 步骤必须在当前 App 版本（1.2.2）上实测；截图来自现有素材或 HTML 样张；
3. 先写 en，再按 §2 关键词本地化（不是逐句翻译）；未经母语复核的语言不发布，hreflang 簇允许不完整（研究 06 §3.2）；
4. 首段即答案；关键事实（价格、语言数、限制）写成文本；
5. 每篇至少 2 条站内入链、1 条出链回首页对应功能。

---

## 8. 度量与目标

### 8.1 基线与口径（F25 / 研究 00，28 天至 2026-10-02）

| 分桶 | 查询 | 展示 | 点击 |
|---|---|---|---|
| 品牌导航 | wordbyword、word-by-word、wordby | 196 | 41 |
| 通用短语 head | word by word、by word、by-word、by words | 777 | 13 |
| "word by word" 长尾（P5） | word by word translation / meaning / translate、translation word by word、by word meaning、word to word meaning | 50 | 2 |
| 前 13 条以外（未知，含匿名查询） | — | 263 | 15 |
| 合计（未筛选总量） | — | 1,286 | 71 |

**口径**【裁定】（R50、SEO-07）：
- **品牌正则** `B = word.?by.?word|wordby|^by.?words?$|word.?to.?word`（覆盖品牌导航、通用短语 head 与 P5 长尾三个桶，它们在查询层面无法与品牌干净地分开）。
- **非品牌展示 / 点击 = 同一 28 天窗口的未筛选总量 − 查询正则"匹配" B 的总量**。不能用"查询 → 自定义（正则）→ 不匹配"直接取数：GSC 一旦按查询筛选，总计就不含匿名查询，而小站的长尾和非英语查询大量是匿名的，会让 T+4w / T+12w 的结果与基线（残差法）口径不一致、系统性偏低，把成功判成失败。按此口径当前非品牌 ≤ 263 展示 / ≤ 15 点击（残差中可能还有少量 B 匹配查询），H1 导出后用同一公式重算精确值。
- **匿名占比** = 查询表各行合计 ÷ 未筛选总量，每次复盘同时记录，用来判断非品牌数字的可信度。
- **非英语 KPI 只用"网页"维度**：按 `/<locale>/` 前缀筛选（页面筛选不排除匿名查询）。
- **P5 长尾单列**：查询正则 `word.?by.?word.+(translat|mean)|translat.+word.?by.?word|word.?to.?word`，与非品牌分开设目标。
- 文档 01 §6.3 v1.0 的"非品牌 = 不含 word、by"口径已删除：它会把 K2 主词 "word meaning in context" 与 G3 的目标查询一起排除（SEO-07）。

网页 / 国家维度缺失（H1），各 locale 收录现状未知，推断几乎只有 `/` 被收录（研究 02 §6、F30）。

### 8.2 KPI 与目标【建议，拿到 H1 后重标定】

| KPI | 数据源 / 口径 | 基线 | T+4 周 | T+12 周 |
|---|---|---|---|---|
| locale 首页收录数 | GSC 网页索引 / URL 检查 | 推断 ≈ 0/19（只有 `/`） | ≥ 15/20 | 20/20 + `/about/` |
| 非品牌展示（28 天） | §8.1：未筛选总量 − B 匹配量 | ≤ 263 | ≥ 300 | ≥ 600 |
| 非品牌点击（28 天） | 同上 | ≤ 15 | ≥ 15 | ≥ 30 |
| 匿名占比 | 查询表合计 ÷ 总量 | 待 H1 | 记录 | 记录 |
| "word by word" 长尾（P5） | §8.1 的 P5 正则 | 50 展示 / 2 点击 | 展示 ≥ 50（不低于基线；FAQ #4 与 `/about/` 承接） | 展示 ≥ 100；G3 已上线时平均排名 ≤ 15 |
| 非英语展示（28 天） | GSC「网页」维度，`/<locale>/` 前缀 | ≈ 0（前 13 条无非英语查询） | ≥ 5 个 locale 有展示 | 合计 ≥ 300；有 SE 页脚 follow 外链的 11 个 locale（PR-SE-2）中 ≥ 8 个各 ≥ 20。fr / de / it / nl / pl / ru / tr / uk 8 个 locale 没有任何 follow 外链，只要求收录、展示以品牌词为主，不设下限（SEO-02） |
| 品牌排名守护 | GSC 查询 = wordbyword | 排名 1.6，CTR 30.8% | 28 天平均排名 ≤ 2.0（R18） | 同左 |
| 品牌桶点击 | wordbyword + word-by-word + wordby | 41 | ≥ 基线 80%（≥ 33，R50） | 同左 |
| "word by word" head | GSC 查询 = word by word | 758 展示 / 13 点击 / 排名 6.5 | **观察，不设目标与告警**：展示 300–758、点击 0–13 都属预期（SEO-08；R27 让 H1 不再含 "Word by Word"，且该词意图错配） | 观察 |
| Bing 收录 | BWT | 未知 | ≥ 15 个首页 | 20 |
| Naver 收录 `/ko/` | Search Advisor | 未知 | 已收录 | — |
| SE 推荐点击 | GA4 `surfenglish_promo`，按 label（`card_*`、`faq_*`、`footer_*`、`about_*`，R3）× `page_locale` | H2 | 记录 | 以文档 04 目标为准；按"点击 / 首页 page_view"报告 |
| WBW 下载（web 来源） | ASC App Analytics → Campaigns，`ct=wbw-*`（只按落点，R55）；Web Referrer = word-by-word.app | 未知（链接无 ct） | `ct` 数据出现（≥ 5 次首次下载才显示，研究 06 §7.2） | **按落点**有可比数据；locale 维度用 GA 的 `app_store_click × page_locale` 近似（ENG-06） |
| SE 下载（来自 WBW） | SE 的 ASC，`ct=wbw-card / wbw-about`（R3；文档 04 §7.2） | 未知 | 同上 | 同上 |
| AI 引荐 | GA4 referrer（chatgpt.com、perplexity.ai、copilot）；BWT AI Performance | — | 观察 | 观察 |
| 性能 | Lighthouse（5 个 T1 首页），阈值按文档 06（R19） | 移动 LCP 推断 > 4 s（研究 02 §5.4） | 达到 §6.4 门槛 | 保持 |

流量基数极小（约 2.5 点击 / 天），所有判断用 28 天窗口，优先看排名与展示，不看单日点击。**点击类告警须连续两个 28 天窗口不达标才触发**（R50）；品牌排名告警按 R18。文档 07 §7.1 / 文档 01 v1.0 的"全站点击 T+4w ≥ 57（基线 80%）"已删除：71 − 13 = 58，只剩 1 次点击的余量，而 28 天 71 次点击的自然波动约 ±8（√71），预期内的 "word by word" 下降会被当成迁移事故（SEO-08）。

### 8.3 监控节奏

| 时间 | 检查项 |
|---|---|
| T0 前 | PR-SE-1（含 S7）已合并（R51）；GSC URL 前缀备份属性已验证（H8） |
| T+0（切换日） | 研究 09 §7 / 文档 06 §11.4 验收脚本（契约 URL 200、旧 URL 单跳 301、canonical / hreflang 绝对地址、索引一致性 D-20、404）；GSC 提交两个 sitemap，URL 检查 `/`、5 个 T1 首页、`/privacy.html`、`/ja-top.html`；BWT 提交；**IndexNow 首推 = 生产 sitemap 全部 URL + sitemap-legacy 全部旧 URL**（§6.3）；Naver 提交；GA4 实时报告有 page_view；iOS 真机看 Smart App Banner |
| T+3 天 | GSC 网页索引：新 URL 是否"已发现 / 已抓取"；抓取统计无 5xx；"wordbyword" 7 日平均排名（R18 警戒线）；GSC 404 列表；CF 4xx / 5xx |
| T+7 天 | **PR-SE-2 已合并**（verify-deploy 通过即合并，最迟此日，R51）；抽查 SE 12 个 locale 页脚链接指向 WBW 对应语言页 |
| T+2 周 | 20 个首页逐一 URL 检查（是否编入、Google 选择的 canonical 是否为自身）；"重复网页，Google 选择的规范网页与用户指定的不同"计数；品牌守护；首批非品牌查询（按 locale，"网页"维度）；Bing 收录数 |
| T+4 周 | KPI 复盘 #1（§8.2，按 §8.1 口径并记录匿名占比）；检查 SERP 中 title 是否被 Google 改写（改写多的 locale 调整 title）；用 GSC 查询数据微调 T1 的次关键词；按 §6.2 的条件判断能否删除 `sitemap-legacy.xml`（全部显示"已重定向"或满 6 周）；决定 Phase 2 是否开工 |
| T+6 周 | 若 `sitemap-legacy.xml` 仍未删除，此时删除（SEO-10） |
| T+12 周 | KPI 复盘 #2；用"页面 × 查询"数据重排 Phase 2 / 3 优先级；复核 SE 推荐与 `ct` 数据；T2 / T3 母语补审完成情况（R36） |

### 8.4 回退阈值

| 触发条件 | 窗口 | 动作 |
|---|---|---|
| 契约 URL（`/privacy.html`、`/support.html`、`/chrome-extension/privacy.html`）非 200 / 非单跳 | 即时 | 立即修 `_redirects`；修不了按研究 09 §3.10 / 文档 06 §10.4 回滚 DNS（回滚截止 = T0 当时 GitHub Pages 证书的 notAfter，R23） |
| 旧 URL 返回 4xx 或多跳 | 即时 | 修 `_redirects` |
| `/` 未编入索引，或 "wordbyword" **7 日平均排名连续 7 天 > 3.0** | 7 天（R18） | 启动排查 / 回退评估：查 `/` 的 canonical / robots / 渲染；把 en title 回退为 "WordByWord - <描述>" 的旧格式（只改文案，不动架构）；14 天仍未恢复，评估回滚托管 |
| 品牌桶（wordbyword + word-by-word + wordby）点击 < 基线 80%（< 33） | **连续两个 28 天窗口**（R50） | 同上；并检查 SERP 中是否被 WordByWord.io 挤占，必要时在 en title 尾部加 "Translate" |
| 非品牌点击低于 §8.2 目标 | 连续两个 28 天窗口（R50） | 不触发回退；检查收录、title 改写与 SE 外链状态，调整次关键词 |
| ≥ 3 个 locale 首页被判"重复 / Google 选择了不同的规范网页" | T+4 周 | 检查该页本地化完整度（title、正文、alt 是否仍有英文块）、hreflang 回指、canonical |
| 实验室 LCP > 2.5 s 或 CLS > 0.05 | 每次发版 | 阻断发布（阈值按文档 06，R19） |
| 某 locale 的 description 被 Google 大量替换为样张或页脚文字 | T+4 周 | 检查 `data-nosnippet` 与首段定义句位置 |
| "word by word" head 下降 | — | 不触发（§8.2 预期区间内） |

---

## 9. 验收标准

**构建期（自动，CI / `node build.mjs` 必须通过；规则编号见文档 06 §3.7）**
- [ ] A1 `seoLint()`（文档 06 L-9、L-11、D-8）0 error：20 个首页 + about + 扩展页的 title 长度、品牌位、`titleMust` 词元（含产品词，R46）、禁用主词、how-to 句式不进首页 title / H1 / `#cta` H2、关键词唯一映射 `uniquePrimary()`（§1.6）、description 含 "iPhone"（SEO-11）、`{wbr}` / `[[ ]]` 不泄漏到 title / meta / JSON-LD（R61）、SE 区块 H2 以 "SurfEnglish" 开头（R40）、无替换性措辞（R40）、H1 唯一；§1.4 与 §3.8 列出的自测用例全部按预期通过 / 报错。
- [ ] A2 每个首页 22 条 hreflang（20 种语言 + `/pt-br/` 的 `pt` + x-default；条数由 LOCALES 计算，R53），全部双向、绝对 URL、指向 canonical；任何页面无指向 surfenglish.app 的 hreflang / canonical；noindex 页不在任何簇中。
- [ ] A3 每个可索引页 canonical 为自身绝对 URL（`https://www.word-by-word.app/…`），无 `pages.dev`；S0 扩展页与 404 无 canonical。
- [ ] A4 `sitemap.xml` 通过 XML 校验；S0 23 条 / S1 26 条；首页含 `xhtml:link` 与 `image:image`；`lastmod` 为页面自身源文件的 git 日期（浅克隆时整体省略）；**可索引 ⇔ 无 noindex ⇔ 自引用 canonical ⇔ 在 sitemap** 逐页成立（R49、文档 06 D-20）；`/legal/*` 与契约 URL 无 noindex、无 X-Robots-Tag（R48）。
- [ ] A5 JSON-LD：**Schema Markup Validator 0 error**（MobileApplication 用 `inLanguage`，无 `availableLanguage`，SEO-09）；Rich Results Test 只允许 SoftwareApplication 缺 `aggregateRating` / `review` 这一项（与文档 01 S8 一致）；所有页 Person `@id` = `https://surfenglish.app/about/#maker`，`name` = "Jinlong"，`alternateName` = "Chi Jinlong"，`sameAs` 与文档 04 §8.1 逐字一致（R17、文档 06 D-9）；`applicationCategory` = `EducationalApplication`；无 `aggregateRating`、无 FAQPage（R5）。
- [ ] A6 `og:locale` 全部为 `ll_CC`；每个 locale 的 OG 图存在、为 1200×630、路径为 `/assets/og/home-<locale>.<h8>.jpg`（R9），与文案哈希一致（文档 06 D-23）。
- [ ] A7 `apple-itunes-app` 只含 `app-id=6741724502`；全站 App Store 链接的 `ct` ≤ 30 字符、**只按落点取值**、每个 App 的不同 `ct` 值 ≤ 10（R3、R55、文档 06 D-11）；SE 的 App Store 链接是文字链接、zh-Hans 页没有（R42、R43）；指向 surfenglish.app 的链接无 `utm_`、无 `nofollow`。
- [ ] A8 所有 `<img>` 有 `width` / `height`；首屏仅一个 `fetchpriority="high"`；整页图片 ≤ 1.2 MB，首屏 ≤ 150 KB；体积预算按文档 06 §6.3（R19）。
- [ ] A9 语言声明：每页 `<html lang dir data-script>` 与 locale 一致（R60）；恰有 1 个 `<meta http-equiv="content-language">`，值为 `zh-cn` / `zh-tw` / `pt-br` / 语言码（R47）；`_headers` 不含 Content-Language，任何路径的响应都没有 `content-language` 头；W3C Nu 对该 meta 的 error 在 allowlist 内。

**发布前（人工）**
- [ ] A10 母语审校按 R36 / R80（§7.1）：en 的 title / description / H1 / 定义句 / 功能 H3 / FAQ 已经用户通读 + 双模型互检（R80）；T1 的同一组字段已审校签字（ko 若走"双模型互检 + 回译 + 术语表 lint"，须标记待复核）；T2 / T3 已过术语表 lint（文档 06 L-13）与关键词检查。
- [ ] A11 产品事实抽查：随机 10 条能力表述均能对应 F13–F17（右滑、内置浏览器、非整页、CJK 双击限制、Chunks / Action Flow 仅英语、额度、价格）；ar 页手势写"向右"（R63）。
- [ ] A12 定位（R39）：20 个首页的定义句、hero 副文、FAQ "What is WordByWord" 都写明为学外语 / 读外语的人而做，且没有"学英语"主词。
- [ ] A13 SE 推荐（R40–R44）：zh-Hans 页无 SE 卡片 ①、无 SE 的 App Store 链接，FAQ 注明 SE 未在中国大陆 App Store 上架（R42）；de/fr/it/nl/pl/ru/tr/uk 页 SE 说明写明"界面为英文等 12 种语言，译文可选该语言"（基线 §F）；价格区有 WBW 徽章（R43）；全站无替换性措辞。
- [ ] A14 Lighthouse 移动：5 个 T1 首页达到文档 06 §11 的阈值（Performance ≥ 90、SEO = 100、LCP ≤ 2.5 s、CLS ≤ 0.05，R19）。
- [ ] A15 扩展页（en + zh-Hans，R1）在 `chromeStoreUrl` 为空时为 noindex、无 canonical、不在 sitemap、header 无扩展导航项，首页 FAQ 不写扩展名称（R2、R45、文档 06 D-24）。

**上线后**
- [ ] A16 T0 清单（§8.3）全部完成并留截图：GSC / BWT / Naver 提交、IndexNow 推送成功（HTTP 200 / 202，含旧 URL）。
- [ ] A17 T+4 周：≥ 15 个 locale 首页编入索引；"wordbyword" 28 天平均排名 ≤ 2.0（R18）；品牌桶点击 ≥ 基线 80%。
- [ ] A18 SE 侧：PR-SE-1（S2–S4、S5 根链接、S7）在 T0 前已上线，PR-SE-2 在 T+7d 内已上线（R51）；两站 Person 节点逐字段一致；SE 12 个 locale 的 "any website" 类标题都带"英文 / English"限定，SE meta.keywords 不含 WBW 归属词（R52）。

---

## 10. 未决事项（引用裁定第三节 H1–H18）

| 编号 | 对本文的影响 | 阻塞 / 未提供时的默认做法（裁定第三节） |
|---|---|---|
| H1 GSC「网页」「国家」导出、`ja-top.html` URL 检查 | §8 的基线与目标值；判断各 locale 是否已有收录 / 排名、优先语种是否调整；匿名占比基线 | 不阻塞；按"只有 `/` 收录"的推断执行，用研究 00 基线；目标值在 T+4 周复盘时用 §8.1 口径重标定 |
| H2 GA4 `surfenglish_promo` 基线与各页流量 | §8.2 SE 推荐 KPI 的对照基线 | M5（T-7 前导出）；否则以上线后前 8 周为基线，只记录不设目标 |
| H3 ASC Provider Token（`pt`） | App Store `ct` 归因、Smart App Banner `affiliate-data` | 不阻塞；先发不带 `pt/ct` 的规范链接并在构建日志告警；`ct` 生成函数先就位，拿到 `pt` 后只改配置 |
| H4 Chrome Web Store listing URL | 扩展页 S0 / S1（§3.10） | 不阻塞；S0：noindex、不进 sitemap、header 隐藏、FAQ 不写名称 |
| H5 CWS 后台登记的扩展隐私政策 URL | `/chrome-extension/privacy.html` 契约处理（不影响关键词） | 不阻塞；按契约 URL 处理，恒为 200 |
| H6 GA Consent Mode、privacy.html 是否改写 | FAQ 不放隐私问题；`/about/` 不写数据收集断言 | 不阻塞；保持沉默，不写"不收集任何数据" |
| H7 母语审校安排（尤其 ko、T2/T3） | §3.9 的 T1 定稿、§7.1 上线门槛、A10 | M3；按 R36（v1.0 本文私设的"H7 母语复核人"已并入此项） |
| H8 GSC 网域属性验证方式等 | §6.3 GSC URL 前缀备份属性 | M5；无默认 |
| H11 素材确认（X 截图 "Extract chunks" 按钮、第三方内容、zh-Hant 截图回落） | §3.6 alt、§6.4、G2 素材 | M2；按 R31–R33、R71 |
| H12 about 时间线 1.1 / 1.2 日期；扩展是否收费、能否标 Beta | §3.10 about 与扩展页文案 | M2；不写具体月份；写 "Coming soon"，不标价格 |
| H13 本地翻译引擎能否离线使用 | K7 能否加 "offline translation / 离线翻译" 次关键词 | 不阻塞；一律不写"离线"（v1.0 私设的"H8"已并入此项） |
| H14 SE 仓库配套 PR 的授权与排期 | §5.5 S2–S7 | M3 / M6；R51：PR-SE-1 在 T0 前、PR-SE-2 在 T+7d 内合并（v1.0 私设的"H9"已并入此项）。PR-SE-2 若推迟，11 个 locale 在 T+4 周前没有 follow 外链，§8.2 的非英语展示目标相应下调 |
| H15 `twitter:creator`、`sameAs` 是否沿用 `@JinlongDev` | §5、§6.1 | 不阻塞；沿用（v1.0 私设的"H10"已并入此项） |
| H16 WBW iOS 下一版本的提交时间 | §6.5 ASC 本地化 Marketing URL、US 描述首行备注 | M6；延后 |

---

## 11. 对基线的修订建议

1. ~~基线 §C / U3 补一条扩展页索引规则~~ → **已由 R2 裁定**（S0 noindex、不进 sitemap、header 隐藏；S1 可索引），本文 §3.10 已按裁定改写。
2. ~~基线 §H 增补 4 项~~ → **已由裁定第三节统一编号吸收**：母语复核 → H7（R36）；本地引擎离线 → H13；SE 配套 PR → H14（排期由 R51 裁定）；`twitter:creator` / `sameAs` → H15。
3. **基线 §B4 补一句澄清**（仍待主控确认，不影响开工）："语块 / chunks"归 SE，但 WBW 确实有这个功能（仅英语）。建议明确为：WBW 可以在功能区 H3 正文介绍 Chunks / Action Flow，用 App 内名称并加"仅英文网页"限定；不进入 title / H1 / description / OG / FAQ 问句。这只是把现有规则讲清楚，不改变方向。
4. **基线 §B4 补一句澄清**（R39 的落地写法，建议并入基线）："学英语"归 SE，但不带"英语"的通用学习 / 受众词（language learners、learn languages by reading、外语学习、外国語学習、외국어 공부）归 WBW，可进 title 后半、description、hero 副文与定义句；构建 lint 必须放行这些说法（§1.4 自测用例）。

---

## 12. 修订记录 v1.1（2026-10-05）

### 12.1 评审条目

| 评审编号 | 处理结果 | 修改位置 |
|---|---|---|
| SEO-01（首页与 G1 抢同一个 how-to 查询） | **已改**：新增"关键词 → URL 唯一映射表"并接入 seoLint（`uniquePrimary()`、首页 title / H1 / `#cta` H2 的 how-to 句式禁用）；首页 K1 主词改为产品 / 品类意图（en "bilingual web page translator app for iPhone"、zh-Hans"网页双语对照翻译 App"，ja / ko 保留 アプリ / 앱）；20 个 title 按新模板重写；`titleMust` 加产品词；how-to 只归 G1；收尾 CTA 示例改为 "Start reading websites bilingually on iPhone"。文档 08 的 `cta.title` 与 meta / hero 三项须按 §3.9、§4.1 同步 | §0 第 4 条、§1.2 第 2 / 7 条、§1.3、§1.6、§2.2、§2.3 表 A、§2.4、§3.1、§3.3、§3.4、§3.8、§3.9、§4.1、§7.2 G1、A1 |
| SEO-02（App Store 链接是 nofollow） | **已改**：ASC Marketing URL 改称"发现与引荐入口，不计入排名预期"（附 2026-10-05 curl 证据）；PR-SE-2 写成固定动作（T0 后 verify-deploy 通过即合并，最迟 T+7d，R51）；fr/de/it/nl/pl/ru/tr/uk 的展示目标按"以品牌词为主"标定。文档 01 O1 已在其 v1.1 改写；文档 07 §7.1 / §9 待其修订时同步 | §0 第 10 条、§5.5 时序、§6.5、§8.2、§8.3、§10 H14、A18 |
| SEO-03（SE 侧也在占"任意网站双语读"） | **已改**：§5.5 新增 S7（12 个 locale 的 explore.title 加"英文 / English"限定、删 SE meta.keywords 中的 WBW 词、SE build 镜像 lint），并入 PR-SE-1（R52）。文档 04 §8 须同步增加 S7 | §1.4 共享词行、§5.5 S7、A18 |
| SEO-04（`_headers` 的 Content-Language 会被逗号拼接） | **已改（采用方案 A，与 R47 一致）**：不输出 Content-Language HTTP 头，`_headers` 不得出现该头；验收改为"任何路径都没有该头"。文档 07 M1-06 须删掉该项 | §0 第 7 条、§6.1、§6.2、A9 |
| SEO-05（`/legal/*` noindex 会连带契约 URL） | **已改**：删除 `/legal/*` noindex，改为靠 canonical 指回契约 URL（R48）。**拒绝**其备选方案（用 `_headers` 给 `/legal/*` 加 X-Robots-Tag），理由：R48 已裁定不加 noindex，R49 / 文档 06 D-13 也禁止 pages.dev 之外的 X-Robots-Tag | §0 第 7 条、§6.2 noindex 行、A4 |
| SEO-07（非品牌口径前后不一致） | **已改**：非品牌 = 未筛选总量 − 品牌正则匹配量，记录匿名占比；非英语 KPI 用"网页"维度；P5 长尾单列一行目标 | §8.1、§8.2 |
| SEO-08（"全站点击 ≥ 57"必然误报） | **已改**（本文部分）：KPI 表不含全站点击阈值，并注明已删除的理由；品牌桶点击 ≥ 基线 80%；"word by word" head 给出预期区间且不设告警；点击类告警须连续两个 28 天窗口不达标（R50）。文档 07 §7.1 须同步 | §8.2、§8.4 |
| SEO-09（`availableLanguage` 不在 MobileApplication 定义域） | **已改**：改用 `inLanguage`（2026-10-05 核实 schema.org 定义域）；A5 改为 "Schema Markup Validator 0 error；RRT 只允许缺 aggregateRating / review"，与文档 01 S8 一致；注明文档 06 D-9 增加定义域白名单 | §0 第 6 条、§5.1、§5.2、A5 |
| SEO-10（IndexNow 差分不可执行等） | **已改**：indexnow.mjs 改为抓生产 sitemap 全量推送，T0 首推加上全部旧 URL；注明需要差分时的 `fetch-depth: 0` 方案；Naver 行写明 IndexNow 已覆盖（2026-10-05 核实 indexnow.org/searchengines.json：bing、yandex、seznam、naver、yep、internetarchive、amazonbot），手工请求只是补充；sitemap-legacy 删除条件改为"全部显示已重定向或满 6 周，先到者为准" | §6.2 sitemap-legacy 行、§6.3、§8.3 |
| SEO-11（description 缺 iPhone；本地写法未覆盖） | **已改（落点微调）**：en 与 15 个 T2/T3 description 都以本地化的"iPhone / iPad，免费"收尾，seoLint 断言 description 含 "iPhone"；ru / uk / ar / th / zh-Hans 的本地写法统一放在 FAQ #9 问句。zh-Hans 未采用原建议的"苹果手机怎么翻译网页并保留原文？"，理由：这是 G1 的 how-to 句式（R46、§1.6 M2），改为"苹果手机、iPad 和 Mac 都能用吗？" | §2.3 表 C、§3.2、§3.8、§3.9、§4.3 |
| SEO-13（SE 区块 H2 规则无法执行） | **已改（按 R40 取方案 a）**：H2 必须以 "SurfEnglish" 开头，条件句挪到正文；seoLint 增加 `#surfenglish h2` 检查和反例用例（对应文档 06 L-11）。文档 08 / 原型须同步 | §1.4、§3.4、§3.8、§4.4、A1 |
| PRO-02（新首页没写受众） | **已改（按 R39）**：定位改为"用真实网页学外语的阅读助手"；T1 关键词表加"定位"行，T2/T3 加表 C；定义句、description、FAQ #1、about 都写明受众；§1.4 增加"不得误拦的通用学习词"与 lint 自测用例。原建议"列为待用户确认项"不再需要：R39 已由用户原话裁定 | §0 第 2 条、§1.3、§1.4、§2.2、§2.3 表 C、§3.2、§3.5、§3.9、§3.10、§4.3、§7.3 G7、§11 第 4 条、A12 |
| PRO-07（价格区丢了 WBW 徽章） | **已改**：#pricing 必须有 WBW 的 App Store 徽章（R43）；`ct` 按 R55 为 `wbw-pricing`（不是原文的 `web-pricing-<l>`）。SE 卡片改文字链接。文档 04 §3.1、文档 05 卡片组件待其修订时同步 | §4.1、§4.4 第 7 条、A7、A13 |
| PRO-08（SE 区块 H2 与本文规则冲突） | **已改**：采纳本文原规则（品牌开头）；ja 例句采用 PRO-08 的写法，en 例句采用 R40 的写法（"SurfEnglish: daily English news at your level, from the developer of WordByWord"）；lint 落到文档 06 L-11 | §3.4、§4.4 第 1 条 |
| PRO-14（ja「検索履歴」歧义） | **已改**：K6 ja 主词改为「翻訳履歴・単語履歴」，H3 改为「スワイプ翻訳と単語の履歴でふり返り」；同一理由顺带修正 es / pt-BR / fr / de / it / nl / pl / tr 的 K6 | §2.1 K6、§2.2 ja、§2.3 表 B、§4.2 |
| ENG-06（WBW 自身 ct 按 locale 拆分永远看不到数据） | **已改（命名按 R55）**：WBW 的 `ct` 只按落点；值用 R55 的 `wbw-header / wbw-hero / wbw-pricing / wbw-cta / wbw-about / wbw-ext / wbw-sab`，**不用** ENG-06 建议的 `web-*` 前缀（R55 已定）；全站不同 `ct` ≤ 10；KPI"按 locale 有可比数据"改为"按落点 + GA page_locale 近似"。文档 06 §8.3 仍是旧格式，须同步 | §4.1、§6.2 App Store 链接行、§8.2、A7 |
| ENG-07（content-language meta 不过 W3C） | **部分拒绝**：删除 meta、改输出 HTTP 头的方案与 R47 冲突，未采纳；按 R47 保留 meta（值改为语言-地区写法）、不输出 HTTP 头、W3C 闸门对该条做显式 allowlist。ENG-07 对 `_headers` 逗号拼接的担忧已采纳为"`_headers` 不得出现 Content-Language" | §6.1、§6.2、A9 |
| ENG-10（D-15 按原文无法实现） | **已改（本文侧）**：§3.8 改为只提供事实红线种子，执行拆为文档 06 L-14（locale 叶子值，按键路径豁免）与 D-15（模板字面量），并写明 `claims-lint.json` 结构与"未覆盖"W 级规则 | §1.4、§3.8 |
| I18-01（ar 手势方向写反） | **已改**：取消"ar 不写方向"，改为写「لليمين」并引用 App 源码与 App 自身阿语提示（R63）；ar title / description / H1 重写；手势示意不镜像交文档 05 | §2.3 ar 注、§3.5、§3.9、A11 |
| I18-03（`｜` 断行标记与 CJK title 分隔符冲突） | **已改（记号按 R61 用 `{wbr}`，不用 I18-03 建议的 `{/}` / `¦`）**：`｜` 只作 title 分隔符；`{wbr}` 在 title / meta / OG / JSON-LD / alt / aria-label 中剥除；seoLint 计长前剥除并断言不泄漏。05 / 08 / BudouX 部分不在本文范围 | §3.1、§3.3、§3.8、A1 |
| I18-07（zh-Hant 台湾用语与 title 中点） | **已改**：zh-Hant title 去掉「・」改为全角逗号；按 R46 在品类词后保留 "App"（与 I18-07 给的 title 相差一个 "App"，w32 仍在上限内）；§2.2 zh-Hant 说明引用文档 08 §7.2.2 用词表与 glossary lint（R64）；§7.1 写明 zh-Hant 审校人须熟悉台湾用语，做不到时至少术语表 lint 零违规 | §2.2 zh-Hant、§3.1、§3.9、§7.1 |
| I18-10（ja H1 超长、空格规则不一） | **已改（本文部分）**：ja H1 改为「Webページの段落を右スワイプで翻訳。原文はそのまま、訳文は下に」（w30.5，无句末「。」，同时满足 PRO-19 的"段落"）；全文 ja 和欧之间不加空格（定义句、description、alt、H3 例）。platformNote、engines 等文案在文档 08 | §2.4、§3.2、§3.5、§3.6、§3.9、§4.2 |
| I18-12（ko 关键词与语体） | **已改**：K2 主词改为「AI 사전」、K6 改为「번역 기록·단어 찾기 기록」；语体规则写入 §2.2 注：description / FAQ 答案합니다체，hero / 卡片 / 按钮해요체；ko 定义句拆为 hero（해요체）与 FAQ（합니다체）两版。文档 04 的 ko 草案不在本文范围 | §2.2 ko、§3.2、§3.5、§3.9、§4.3 |
| I18-14（content-language 取值） | **部分拒绝**：采纳 zh-Hans→`zh-cn`、zh-Hant→`zh-tw`、pt-BR→`pt-br`；**拒绝** ja-jp、ko-kr、ar-sa、hi-in 等"语言-主市场"值，理由：R47 规定其余语言写语言码（与文档 02 v1.1 一致） | §6.1、§6.2、A9 |
| PRO-19（ja / en H1 有整页歧义；经 R46 引用） | **已改**：20 个 H1 一律写"滑动段落 → 译文在下方"，en 改为 "Swipe a paragraph on any web page. Its translation appears right below." | §2.4、§3.3、§3.9 |
| SEO-06 / SEO-12 / SEO-14、PRO-01 / PRO-03 / PRO-05 / PRO-09 / PRO-13 / PRO-17 / PRO-18（经裁定间接涉及本文） | 已按对应裁定落实（R49、R53、R54、R40–R42、R69、R73），见下表 | 见 12.2 |

### 12.2 裁定落实

| 裁定 | 处理结果 | 修改位置 |
|---|---|---|
| R39 定位不变 | 已改（见 PRO-02） | §0、§1.3、§1.4、§2.2、§2.3、§3.2、§3.5、§3.9、§3.10、§4.3、§7.3、A12 |
| R40 / R41 / R28 SE 叙事、卖点与第三人称 | 已改：H2 品牌开头、互补式叙事、禁用替换性措辞（lint）、SE 独有卖点清单、端侧语音不得写成 SE 独有、about 描述去掉 "sister app" | §1.4、§2.1 K3、§3.4、§3.7、§3.10、§4.1、§4.3 #10、§4.4、§5.5 S4、A13 |
| R42 落点精简 | 已改：删除 ③；zh-Hans 只保留 ②④⑤；FAQ 注明 SE 未在中国大陆上架；指南不设 SE 落点 | §1.4、§4.1、§4.3、§4.4、§7.2 G1 / G2、A13 |
| R43 WBW 转化优先 | 已改：价格区 WBW 徽章、SE 文字链接、最终 CTA 加强 | §3.4、§3.7、§4.1、§4.4、A7、A13 |
| R44 SE 卡片配图 | 已改：alt 例与图片规则改为 `games-home.jpg` 上部裁切 | §3.6、§4.1、§6.4 |
| R45 扩展 FAQ 在 S0 下的表述 | 已改 | §1.6 M9、§3.10、§4.3 #9、A15 |
| R46 唯一映射 | 已改（见 SEO-01） | 同 SEO-01 |
| R47 Content-Language | 已改（见 SEO-04、ENG-07、I18-14） | §0、§6.1、§6.2、A9 |
| R48 `/legal/*` | 已改（见 SEO-05） | §6.2、A4 |
| R49 索引一致性 | 已改：§6.2 新增一行；原型 noindex 不得带入；S0 扩展页无 canonical | §0、§3.10、§6.1、§6.2、A3、A4 |
| R50 KPI 口径 | 已改（见 SEO-07、SEO-08） | §0、§8 |
| R51 外链价值与 SE PR 排期 | 已改（见 SEO-02） | §5.5、§6.5、§8.3、§10 H14、A18 |
| R52 SE 侧防蚕食 S7 | 已改（见 SEO-03） | §1.4、§5.5、A18 |
| R53 pt hreflang | 已改：首页 22 条，由 LOCALES 计算 | §0、§6.1、§6.2、A2 |
| R54 `_redirects` 唯一事实源 | 已标注：以文档 02 §5.2 为准 | §6.2 重定向行 |
| R55 WBW 自身 ct 只按落点 | 已改（见 ENG-06） | §3.7、§4.1、§6.2、§8.2、A7 |
| R1 / R2 / R16 扩展子站 | 已改：en + zh-Hans；S0 / S1 两态表；header 只在 S1 显示；v1.0"修订建议 1"改为已由 R2 裁定 | §0、§1.6 M9、§3.10、§4.1、§7.1、§11 第 1 条、A15 |
| R3 SE 的 label 与 ct | 已改：label 按文档 04，`ct` 按落点（`wbw-card` 等），曝光事件只给 ① | §3.7、§4.4、§8.2 |
| R5 / R6 不输出 FAQPage、meta keywords | 已标注 | §3.8、§4.3、§5.1、§6.2 |
| R8 / R9 / R58 图片管线与 OG 路径 | 已改：OG 与截图路径改为 `/assets/…` 指纹路径；AVIF 偶数宽高与 alpha 校验 | §5.2、§5.3、§6.1、§6.2、§6.4、A6 |
| R10 SE 卡片高度 | 已改：替换 v1.0 的"≤ 半屏" | §4.1、§4.4 |
| R12 / R22 价格区 id、页内锚点、版权行 | 已改：`#pricing`、`#surfenglish`、保留 `#screenshots`；`#cta` 只作最终 CTA；版权行 `© 2025–{currentYear} Jinlong` | §4.1 |
| R13 标题层级 | 已标注 | §3.4 |
| R14 description 区间 | 已标注：本文 §3.1 为准，文档 06 L-8 已同步 | §3.1 |
| R15 WordByWord.io 声明位置 | 已改：只放 about 与扩展页 | §1.5、§1.6 M8、§3.10、§4.1 footer 行 |
| R17 Person | 已改：`sameAs` 改用文档 04 §8.1 的清单（`https://apps.apple.com/developer/id1794902022`），两站逐字一致；Person description 与 SE 侧一致；v1.0 的 S1（改 SE `makerFullName`）标注为**已被 R17 否决** | §0、§5.1、§5.2、§5.3、§5.4、§5.5 S1–S3、A5 |
| R18 品牌守护阈值 | 已改：28 天平均排名 ≤ 2.0；7 日均值连续 7 天 > 3.0 启动排查 | §1.5、§8.2、§8.4、A17 |
| R19 性能预算口径 | 已改：删掉本文自定的 HTML / CSS / JS 预算，统一引用文档 06 | §6.4、§8.2、§8.4、A8、A14 |
| R21 本地化 404 | 已改 | §0、§7.1 |
| R23 DNS 回滚截止 | 已标注 | §8.4 |
| R24 H 编号 | 已改：删除 v1.0 私设的 H7–H10，§10 按 H1–H18 重写，§11 第 2 条改为"已由裁定第三节吸收" | 页首引用写法、§10、§11 |
| R25 指南 hub 门槛 | 已改：≥ 2 篇才生成 | §7.2 |
| R26 译文样式数量 | 已改：不写"8 种" | §2.1 K1 |
| R27 H1 不含品牌 | 已标注：eyebrow、定义句、title 首词、logo alt 含品牌 | §0、§1.5、§3.3 |
| R31–R33、R71 截图素材 | 已改 | §3.6、§6.4、§7.2 G2 |
| R34 / R59 OG 渲染与生成时点 | 已标注 | §6.2 OG 行 |
| R35 公告开启时不渲染 ① | 已标注 | §4.1、§4.4 |
| R36 母语审校 | 已改：T1 / T2 / T3 的上线门槛按 R36 | §0、§3.9、§7.1、§10 H7、A10 |
| R38 `language_switch` | 已标注 | §3.7 |
| R60 `data-script` | 已改 | §6.1、§6.2、A9 |
| R61 `{wbr}` 断行记号 | 已改（见 I18-03） | §3.1、§3.3、§3.8 |
| R62 复数 | 已标注：复核要点 ⑫ | §3.9 |
| R63 ar 手势方向 | 已改（见 I18-01） | §2.3、§3.5、§3.9 |
| R64 术语 lint | 已标注：zh-Hant 用语表与 glossary | §2.2 zh-Hant、§3.9 复核要点 ⑩、A10 |
| R65 荧光笔只用于 H1 一个短语 | 已标注：H1 的 `[[…]]` 恰好 1 处 | §3.3 |
| R66 / R67 hero 样张与截图状态栏 | 已标注 | §6.4 |
| R69 手机首屏 | 已改：eyebrow 不再放"免费"，新增 `hero.ctaNote`（原 `hero.ctaNote`，R77 收编） | §3.3、§3.5、§4.1 |
| R70 品牌可见性 | 已标注：手机端保留字标 | §4.1 header 行 |
| R73 FAQ 增补 | 已改：新增"是否需要账号"、恢复购买、Android；删除名字含义叙事 | §3.10、§4.3 |
| R29 / R30 / R37 / R56 / R57、R4 / R7 / R11 / R20 | 不涉及本文，或已被 R42 / R44 / R69 取代，无改动 | — |

### 12.3 自查与引用规范化

| 项 | 处理结果 | 修改位置 |
|---|---|---|
| 引用规范化 | 已改：研究报告统一写成「研究 0X §…」（含「研究 10 C18」「研究 07 R5」等），设计文档写成「文档 0X §…」（替换 v1.0 的"IA 文档 / 技术文档 / 视觉文档 / 推荐文档"）；删除 scratchpad 路径（`as_us.html`），只保留结论；依赖文档改为 `appendix/research/` 下的相对路径 | 全文 |
| 与文档 06 v1.1 对齐 | 已改：seoLint 的落地位置写为文档 06 L-9 / L-11 / L-14 / D-8 / D-9 / D-15 / D-20 / D-24；文档 06 §4.2 的 `seo.titleMust` 示例（仍为 `["Translate","Web Pages","iPhone"]`）、`keyword-map.json` 的 G1 词元与 §8.3 的 `ct` 格式须按本文 §1.6、§3.8、§6.2 同步 | §3.8、§6.2 |
| v1.0 自身问题 | 已改：ja H1 实测 w32.5 超出自定上限；zh-Hans / zh-Hant H1 的"向右一滑"未写段落；th 长度标注用了 `n` 而规则是可见字符数（改为 `v`）；en / T2 / T3 description 缺 iPhone | §3.9 |
| 需他文档同步的事项（不越权改写） | 文档 08：meta.title / description、hero.title（§3.9）、cta.title（§4.1）、sibling.section.title（§4.4）、ja K6 H3、ko 语体、FAQ #9 / #10 / #11（§4.3）；文档 04：§8 增加 S7、S1 按 R17、S4 文案、sameAs；文档 07：M1-06 删除 Content-Language 头、§7.1 KPI 口径；文档 05：ar 手势不镜像 | — |
| 一致性审计修正（2026-10-05） | 已改：SE 的 App Store `ct` 收敛为 `wbw-card` / `wbw-about`（② ④ 不放 App Store 链接，与文档 04 §7.2、文档 06 §8.3 一致，R3）；§4.1、§4.3 的 FAQ 引用改为 id，并注明上线顺序以文档 08 为准（13 问，`english-learner` 倒数第二、`devices` 最后）；§4.4 SE 分享扩展改为已核实（文档 04 §5.1）；§5.2 JSON-LD 示例的图标路径与 `screenshot` 改为文档 06 的 `/icons/icon-512.png`、`shot/en/swipe-540`，删去不存在的 X 截图；§3.6、§6.4 的 X 卡改为全部 locale 用样张（文档 05 §5.4.3，R71）；§2.4 注明"研究 07 F#"不是事实条目 | §2.4；§3.6；§3.7；§4.1；§4.3；§4.4；§5.2；§6.4；§8.2 |
| v1.3 定稿修正（R74–R84） | 已改：**R76** §3.7 锚文本规则与文档 04 §5.1 统一：只有 ① 官网链接用 SE 核心词短语 + 品牌（en 例 "Read English news at your level with SurfEnglish"，定稿以文档 08 为准，删去原 ja / zh-Hant 示例），② ④ ⑤ 用品牌锚 / 专名，任何落点不用裸域名 "surfenglish.app"，App Store 文字链接的 "→" 不进锚文本；§4.4 第 4 条同步。**R83** §1.3 "不占的位置"、§1.4 增加基线 §B4 澄清：不含"英语"的通用学习词归 WBW；"Chunks / 语块"作 WBW 功能名可进功能 H3，须带 English / 英语限定，不进 title / H1。**R81** §1.5 同名实体行、§3.10 about 内容要求：可见文本不出现 "Chi Jinlong"（只在 JSON-LD `alternateName`），去歧义声明链接到 App Store 开发者页（"WordByWord on the App Store"）。**R75** §3.10 家族说明与 §4.4 引言改为"文案以文档 08 为唯一来源"。**R84** §4.4 第 3 条注明手机 ≤ 480px 适用于 ≥ 375px 宽、320px 宽 ≤ 560px。遗留 **L10**：§3.1 拉丁 / 西里尔 / 阿拉伯文计量改为字素数（与文档 06 L-8 一致），§3.9 实测值按字素数复核，ar description n159 → n157。连带 **R80**（同为 v1.3 裁定、与本文直接冲突）：§3.9 引言、§7.1 首页审校、A10 写明 en 按用户通读 + 双模型互检上线。依赖文档行改为 R1–R84 | 依赖文档；§1.3；§1.4；§1.5；§3.1；§3.7；§3.9（引言、ar 行）；§3.10；§4.4（引言、第 3、4 条）；§7.1；A10 |
