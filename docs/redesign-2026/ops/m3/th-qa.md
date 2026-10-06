# M3 · th（ไทย）首页文案 QA 记录

| 项 | 内容 |
|---|---|
| locale | th（T3：按 R36 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校） |
| 交付 | `src/locales/th.json`（新建：首页全部键 + `notfound.*`；th 没有 about / 扩展页 / legal 页，与 ja、ko、it 一样不交付 `about`、`chromeExtension`、`legal`）；`src/data/glossary/th.json`（新建，§7.2.5 格式）；`docs/redesign-2026/ops/m3/th-lint.json`（claims-lint / keyword-map 的 th 词表提案，未合并） |
| 依据 | 文档 08 §7（7.1–7.10）、§1.1、§1.4、§1.5、§2 en 母版；文档 03 §1.4、§1.5、§1.6、§2.3（th 行，表 A / B / C）、§3.1–§3.9（th 草案）、§4.3（th 的 FAQ 问句写"ไอโฟน"）；文档 04 §5.1、§5.5、§5.7（th 的 linkText 种子、页脚表、T1–T11）、§8.6；文档 05 §3.3、§3.5（泰文断行、U+2060）；裁定 R36、R39–R43、R46、R52、R61–R65、R71、R75–R78、R83、R84；`ja.json` / `zh-Hans.json` 作结构参照，es / fr / ko / zh-Hant / de / pt-BR / it 的 QA 记录作流程参照 |
| App 叫法来源 | `WordByWordPrototype/Localizable.xcstrings` 的 `localizations.th`（逐条核对 T-A…T-E），App 内 Free / Plus 对比表的行名（`FeatureQuotaManager.swift` `featureDisplayName`、`SubscriptionComparisonView.swift`）；SurfEnglish 泰文站 `SurfEnglishWebsite/src/locales/th.json`（家族用语：เบราว์เซอร์ในตัว、หน้าจอแอป 12 ภาษา、ปัดไปทางขวา、แตะคำสองครั้ง） |
| 工作方式 | 私有副本 `scratchpad/wbw-m3-th/` 写作、构建、渲染检查；最终校验在新副本 `scratchpad/wbw-m3-th-final/`（真实仓库 HEAD 2e8ced2，工作区干净 + 本次两个文件 + 副本内生成的 `home-th` OG）上完成。OG 图只在副本里生成，**没有**复制进真实仓库 |
| 断行工具 | `scratchpad/th-work/th.src.json`（不含零宽字符的干净稿）→ `scratchpad/th-work/glue-th.mjs` 生成 `th.json`（插入 U+2060 / U+00A0，见 §8）→ `glossary-th.mjs` 按生成结果写 glossary。三个文件都在 scratchpad，没有放进仓库（§6-3） |
| 日期 | 2026-10-06 |

## 0. 摘要

1. 键与 en 完全一致（`check.mjs --keys th`：0 缺、0 多）。新副本（HEAD 2e8ced2 + th 两个文件 + 副本内 `home-th` OG）上：`node build.mjs` **0 error**，`--pseudo` **0 error**，`scripts/check.mjs` 0 error / 0 warning，`node --test scripts/tests/*.test.mjs` **62/62**。
2. th 自己的 warning：只有 L-4（7 个值与 en 相同：6 个是文档 08 §1.5 列为正常的样张照抄值，另 1 个是 `meta.appStoreSubtitle`，泰国区店面的副标题本来就是英文 "Swipe to translate AI explains"，§6-5）。真实仓库的数据文件还缺 th 词表，所以另有 L-14（26 条规则"未覆盖"）与 L-9（无 G1 how-to 模式）两条汇总 W；把 `th-lint.json` 并进副本后这两条消失，th 文案 0 命中（附录 A、B）。
3. title / description / H1 以文档 03 §3.9 的 th 草案为起点：title 在草案上加了"แบบ"（v43，避免读成"翻译双语网站的 App"）；description 调整语序、补"ใช้"（v138）；H1 用草案原句，荧光笔标在「หน้าเว็บ」（v44）。
4. **泰文断行（本 locale 的主要工作，§8）**：Chrome 用 ICU 词典给泰文断行，外来词和不少复合词会被断在词中（实测："คลา|วด์""เอน|จิ|นภา|ย""ชัง|ก์""อิน|เท|อร์เฟซ""การก|ระ|ทำ""มอง|หาว|ลี""ภูมิ|ภา|คอื่นๆ"）。处理：① 标题类键（H1、H2、H3、FAQ 问句、价格表行名、图注、eyebrow、SE 卡片标题与要点、CTA 要点）里的复合词与固定词组按文档 05 §3.5 用 U+2060 连接；② 全文（正文也算）只对 ICU 会断成非词的外来词与 App 按钮名加 U+2060；③ 数字占位符与量词之间用不换行空格（"21 ภาษา"），"ๆ" 写成 RI 规范的"อื่น ๆ"并用不换行空格防止"ๆ"落到行首；④ meta.title / description / ogHeadline / alt 一律不加。共 70 个键、233 个 U+2060、20 个 U+00A0。重测 320 / 375 / 390 / 1280 px：所有标题、FAQ 问句、价格表行名、图注都只断在词或词组边界（§7）。为此还改写了几处 ICU 会断错的说法（"มองหาวลี"→"ตรวจดูวลี"、"การเตรียม"→"กำลังเตรียม…อยู่"、"ที่มากับ iOS"→"ในตัวของ iOS"、"เดโม"→"ภาพจำลอง"、"อินเทอร์เฟซภาษาอังกฤษ"→"แอปเป็นภาษาอังกฤษ"、"บุ๊กมาร์ก"→App 的"รายการโปรด"、"สหราชอาณาจักร"→"(US และ UK)"）。
5. SE：`seMode('th') = local`（文档 08 的 full 模式）。卡片照常渲染；note 写"หน้าจอแอป 12 ภาษา รวมภาษาไทย"（界面含泰语）；linkText 是 SE 核心词短语 + 品牌，链 `https://surfenglish.app/th/`（`hreflang="th"`）；FAQ `english-learner` 的品牌锚"เว็บไซต์ SurfEnglish"不加"（ภาษาอังกฤษ）"，因为 SE 有泰文站。
6. OG（只在副本）：`node scripts/og.mjs --only home-th` 一次通过，标题 54 px × 2 行，副标题 30 px × 2 行，139.6 KB；副标题已加 U+2060，避免"ความ｜หมาย"断开（第一版就断在这里）。
7. 渲染（新副本 + `serve.mjs` 端口 4608，外部请求全部拦截）：1280 / 390 / 375 / 320 px 无横向溢出，价格表不需要横向滚动；SE 卡片 338 / 429 / 450 / 507 px（上限 420 / 480 / 480 / 560）；390 px 整页 **12,551 px**（≤ 13,000）；390×844 下样张红色译文条顶端 698 px。另按 54afac8 的口径查了 21 个宽度（320–1440）：无页面溢出、无表格溢出、header 无重叠。为让 320 px 的价格表不滚动，`pricing.table.perDay` 写成"{n}/วัน"（App 原文"%lld ครั้งต่อวัน"在 320 px 会让表格多出 26 px，§6-8）。
8. **需要负责人处理的事**（§6）：① 真实仓库生成 `home-th` OG 之前构建报 D-23；② `th-lint.json` 待合并；③ U+2060 的使用范围与维护方式，以及校验器匹配前应剥除 U+2060；④ 泰文标题行高（文档 05 §3.3 定为 1.35，CSS 未实现）；⑤ 店面名 / 副标题照抄英文；⑥ 页脚 SE 店面名需核对；⑦ 报给 App 侧的泰文字符串问题；⑧ perDay 与 App 写法不同。

## 1. 关键词落点（title / H1 / description 用了哪些主词）

| 位置 | 文案 | 承载的关键词 | 长度 |
|---|---|---|---|
| `meta.title` | « WordByWord: แอปแปลเว็บไซต์แบบสองภาษาบน iPhone » | 品牌位 WordByWord 在首（TH 店面名是 WordByWord Translate，但文档 03 §1.5 只有 zh-Hant / ru 用店面名）；K1 主词「แอปแปลเว็บไซต์สองภาษาบน iPhone」（表 A）中间加了"แบบ"；`titleMust` = iPhone / เว็บ / แอป 全部命中；`primaryTokens.home.th`（iPhone、แอป）命中；无 how-to 句式 | v43（上限 60） |
| `meta.description` | « สำหรับผู้เรียนภาษา: ปัดย่อหน้าไปทางขวาในเบราว์เซอร์ของ WordByWord แล้วคำแปลจะแสดงใต้ต้นฉบับ แตะคำสองครั้งเพื่อดูความหมายตามบริบทด้วย AI ใช้ฟรีบน iPhone และ iPad » | 受众词「ผู้เรียนภาษา」（表 C，R39）；K1 动作 + 结果在前半；"ในเบราว์เซอร์ของ WordByWord"（文档 03 §3.2：内置浏览器 / 在 WordByWord 里）；K2「ความหมาย…ตามบริบทด้วย AI」；平台 + 免费收尾（SEO-11）；不写价格；"ไอโฟน"按 §3.2 不进 description | v138（100–160） |
| `hero.title`（H1） | « ปัดย่อหน้าบน[[หน้าเว็บ]]ไปทางขวา คำแปลจะแสดงอยู่ใต้ต้นฉบับ » | 文档 03 §3.9 草案原句；K1 核心名词「หน้าเว็บ」（荧光笔 1 个词，R65）；"段落"一级动作 + 方向 + 结果「คำแปล…ใต้ต้นฉบับ」（文档 04 §8.6 把"คำแปลใต้ต้นฉบับ"划给 WBW）；不暗示整页（R46）；不含品牌（R27） | v44（上限 75） |
| `hero.eyebrow` | « WordByWord · แอปอ่านเว็บสองภาษาสำหรับผู้เรียนภาษา » | 品牌 + 品类（bilingual web reader → แอปอ่านเว็บสองภาษา）+ 受众 | 43（≤ 60） |
| `hero.lede` = `ledeShort` | « WordByWord คือแอปช่วยอ่านสำหรับผู้เรียนภาษา บน iPhone และ iPad » | R39 定义句，以"WordByWord คือ"开头；"แอปช่วยอ่าน"（阅读辅助 App）只用在定义句（D13），没有用"ผู้ช่วยอัจฉริยะ"（旧站 smart assistant） | v55（≤ 90，故两者相同） |
| `meta.ogHeadline` | « อ่านหน้าเว็บไหนก็ได้แบบสองภาษา [[ต้นฉบับยังอยู่ครบ]] » | K1 场景（任意网页双语读 + 原文保留）；"เว็บไซต์ไหนก็อ่านแบบสองภาษาได้"这类不带"英语"的说法按文档 04 §8.6 归 WBW；荧光笔 1 处 | 54 px × 2 行 |
| 功能区 H2 | « ปัดเพื่อแปล แตะสองครั้งเพื่อดูความหมาย บนเว็บไซต์ที่คุณอ่าน » | K1「ปัดเพื่อแปล」（App 名）+ K2「ความหมาย」；"บนเว็บไซต์ที่คุณอ่าน"（PRO-16，不写"任何网站"） | v45 |
| 功能 H3 | K1「ปัดเพื่อแปล: คำแปลแสดงตรงใต้ต้นฉบับ」；K2「แตะสองครั้งที่คำ ให้ AI บอกความหมายตามบริบท」；K9「แปลโพสต์ X (Twitter) อ่านคู่ต้นฉบับในเบราว์เซอร์ในตัว」；K5「การแยกชังก์และ Action Flow สำหรับประโยคภาษาอังกฤษ」（R83 带"ภาษาอังกฤษ"）；K3「อ่านออกเสียงด้วย AI หรือเสียง iOS ในเครื่องที่เร็วกว่า」；K4「วิเคราะห์โครงสร้างประโยคยาวด้วย AI」；K7「แปลบนคลาวด์หรือในเครื่อง」；K6「ประวัติการแปลและการค้นหาคำ」 | K3、K6、K7 与表 A / B 主词逐字一致；K4 只多一个"ยาว"；K9 主词去掉"บน iPhone"（how-to 归 G2）；K2「ความหมาย…ตามบริบท…AI」为主词的语序变体 | 全部 ≤ 70 |
| 语言段 H2 | « แปลได้ 21 ภาษา จากต้นฉบับหลายภาษา ไม่ใช่แค่ภาษาอังกฤษ » | K8 主词「แปลได้ 21 ภาษา」逐字（数字是占位符） | 46 |
| 价格段 H2 | « ใช้ฟรีทุกวัน อ่านเยอะขึ้นเมื่อไรค่อยอัปเกรดเป็น Plus » | K10「ใช้ฟรี」+ Plus；"อัปเกรดเป็น Plus"是 App 原文（`upgrade_to_plus_button`） | — |
| 最终 CTA H2 | « เริ่มอ่านเว็บไซต์แบบสองภาษาบน iPhone » | 动作句，不是 G1 标题，不暗示整页（R46） | 31 |
| FAQ `devices` 问句 | « WordByWord ใช้บนไอโฟน iPad, Mac หรือเบราว์เซอร์บนคอมพิวเตอร์ได้ไหม » | SEO-11：th 的本地写法"ไอโฟน"只出现这一次（文档 03 §4.3） | — |

检查结果：title / description / H1 / OG / 功能区 H2 里没有 SE 独占词（现有 `เรียนภาษาอังกฤษ`、`ข่าวภาษาอังกฤษ` 与附录 A 新增的 `ข่าวอังกฤษ`、`ฝึกภาษาอังกฤษ`、`ภาษาอังกฤษตามระดับ`、`ชังก์`、`กลุ่มคำ` 全部 0 命中；"ผู้เรียนภาษา"不命中）；title / H1 / description / `cta.title` 里没有 how-to 句式（วิธีแปล、อย่างไร、ยังไง、เก็บต้นฉบับไว้）。

## 2. Q1–Q13 逐条结果（文档 08 §7.9）

| # | 结果 | 说明 |
|---|---|---|
| Q1 | ✓ | JSON 可解析；键与 en 一致（`--keys th` 0 缺 0 多）；数组 id 与顺序同 en。新副本 build / `--pseudo` 0 error，`check.mjs` 0 / 0，测试 62/62。真实仓库在生成 OG 前会报 D-23（§6-1） |
| Q2 | ✓ | 占位符、`[[ ]]`、`**`、`[文本](@ref)` 都保留；ref 只用 `@about`、`@chrome`、`@se-site`（白名单内）。`Intl.PluralRules('th')` 只有 other，文档 08 §1.4 也写 th 不需要复数对象。没有写死额度、价格、语言数（L-12 0 条）。数字占位符与"ภาษา"之间是 U+00A0，代入后"21 ภาษา""20 ภาษา""12 ภาษา"不会拆行；`{plus.priceUS}` 在 th 渲染为"US$3.99" |
| Q3 | ✓ | title 以品牌位开头，`titleMust` 三个词元齐全；K1 是产品 / 品类意图（แอป）；没有 §1.4 禁用主词、没有 how-to 句式 |
| Q4 | ✓ | `hero.title` 恰好 1 处 `[[หน้าเว็บ]]`（1 个词）；功能 H3、`languages.title` 无 `[[ ]]`；`hero.lede` 以"WordByWord คือ"开头，写明"สำหรับผู้เรียนภาษา"。注意 L-8 按空格数词，泰文短语永远算 1 个词，这条检查对 th 不起作用（§6-3） |
| Q5 | ✓ | §1.1 红线逐行核对：整页翻译只出现在 FAQ `whole-page` 的否定回答里；Safari 扩展只出现在 FAQ `safari` 的否定回答里；没写离线、无限 AI 发音、暗色模式 / 主题、快捷键 / 音量、生词本 / 闪卡 / 同步、"Plus 专属"、样式数量、口语练习、ChatGPT、"ผู้ช่วยอัจฉริยะ"；CJK 原文不能双击查词、การแยกชังก์ / Action Flow 仅英语都写在同屏；没有沿用旧站的"เทียบประโยคต่อประโยค"（jargon）、"ไม่ต้องสลับแอป"、"ปัดไปทางซ้าย…"。附录 A 的 th 词表在副本里跑 L-14：0 命中（带与不带 U+2060 两种都测了） |
| Q6 | ✓ | kicker 与价格表行名用 App 叫法（glossary `required`，L-13 0 违规）；句子里按 §7.3 写"ปัดไปทางขวา""แตะสองครั้ง"；按钮 / 界面名照 App 原文加引号引用："อัปเกรดตอนนี้""กู้คืนการซื้อ""รับคำอธิบายไวยากรณ์ AI""ประวัติการแปลแบบสไลด์""การแยกชังก์""ลำดับการกระทำของประโยค""คำจำกัดความเพิ่มเติม""อัตโนมัติ / ย่อหน้า / ประโยคต่อประโยค"。X11 已执行：App 的"การอ่านท้องถิ่น"（Local Read）在正文写成"การอ่านออกเสียงด้วยเสียงในเครื่อง"，价格表写"เสียง iOS (อ่านด้วยเสียงในเครื่อง)"，glossary 禁用"ท้องถิ่น" |
| Q7 | ✓ | 5 处截图 alt、4 条画廊图注 + alt、2 个截图标签（`common.screenshotLabel` / `screenshotExcerptLabel`）、OG alt、SE 截图 alt 与图注都写了"(แอปเป็นภาษาอังกฤษ)"（App 是英文界面，§4-2）；内容逐张对照了 `assets/img/shot/en/*`（西语维基页 + 英文译文、"convirtiéndose"卡片、设置页 Auto / Quote Style / Local Read、"matrimonio"释义页、Spanish → English (US)、语言列表——列表里确实有"Thai (ไทย)"，所以 alt 写了"ไทย"）；朗读节选的 alt 按 f44fd7e 写成"播放器在屏幕底部朗读一句西语"；`features[x].alt` 描述社交帖样张并注明"ไม่ใช่ภาพหน้าจอ"；`demo.lookup.word` = "end"，出现在 `demo.source[1]` |
| Q8 | ✓ | full（local）模式：note 写"หน้าจอแอป {se.uiLanguages} ภาษา รวมภาษาไทย"；H2 以 SurfEnglish 开头；body 首句是条件句"กำลังเรียนภาษาอังกฤษอยู่ใช่ไหม"；卖点只用分级新闻、复习游戏、从 Safari 分享（R41），不提语音；没有"อาจเหมาะกว่า / ใหม่ / อัปเกรด / แทน WordByWord"（T10）；linkText 是 SE 核心词短语 + 品牌，不是裸域名（R76） |
| Q9 | ✓ | 代入占位符后全部在 §7.6 / L-8 限内（th 按可见字符计，U+2060 不计）：title 43、description 138、H1 44、eyebrow 43、lede 55、how 125、platformNote 109、规格清单 4 条 49–75、功能 H3 20–45、kicker 5–16、SE H2 42、要点 ≤ 35、linkText 41、`pricing.summary` 77、`cta.recap` 56、所有 alt ≤ 106（字素） |
| Q10 | ✓ | 泰文：词间不加空格，短语之间用空格；没有零宽空格（U+200B）；U+2060 按文档 05 §3.5 用于标题类字段中不能断开的复合词，另用于外来词（§8）；没有 `{wbr}`（R61） |
| Q12 | ✓ | 见 §7：四个宽度 + 21 个宽度无横向溢出，没有字体回落成方框（Thonburi） |
| Q13 | ✓ | FAQ `devices` 的 `a`（S0）只写"同一开发者正在准备一个 Chrome 扩展"，不写扩展名称；`aExtLive` 写了名称和"โปรดติดตั้งจากลิงก์ในหน้านั้นเท่านั้น"；首页没有 WordByWord.io（`footer.notAffiliated` 不在首页渲染） |

## 3. 回译对照（th → English，对照 en.json）

| 键 | th | 回译 | en.json |
|---|---|---|---|
| meta.title | WordByWord: แอปแปลเว็บไซต์แบบสองภาษาบน iPhone | WordByWord: an app that translates websites bilingually, on iPhone | WordByWord: Bilingual Web Page Translator App for iPhone |
| meta.description | สำหรับผู้เรียนภาษา: ปัดย่อหน้าไปทางขวาในเบราว์เซอร์ของ WordByWord แล้วคำแปลจะแสดงใต้ต้นฉบับ แตะคำสองครั้งเพื่อดูความหมายตามบริบทด้วย AI ใช้ฟรีบน iPhone และ iPad | For language learners: swipe a paragraph to the right in WordByWord's browser and the translation appears under the original. Double-tap a word to see its meaning in context with AI. Free to use on iPhone and iPad. | For language learners: swipe a paragraph in the built-in browser and its translation appears below. Double-tap a word for its meaning. Free on iPhone & iPad. |
| meta.ogHeadline | อ่านหน้าเว็บไหนก็ได้แบบสองภาษา [[ต้นฉบับยังอยู่ครบ]] | Read any web page bilingually. [[The original is all still there.]] | Read any web page bilingually. [[Keep the original.]] |
| meta.ogSubline | ปัดย่อหน้าไปทางขวา · แตะคำสองครั้งเพื่อดูความหมายตามบริบท | Swipe a paragraph to the right · double-tap a word to see its meaning in context | Swipe right on a paragraph · double-tap a word for its meaning in context |
| hero.title | ปัดย่อหน้าบน[[หน้าเว็บ]]ไปทางขวา คำแปลจะแสดงอยู่ใต้ต้นฉบับ | Swipe a paragraph on a [[web page]] to the right; the translation appears under the original. | Swipe a paragraph on [[any web page]]. Its translation appears right below. |
| hero.lede | WordByWord คือแอปช่วยอ่านสำหรับผู้เรียนภาษา บน iPhone และ iPad | WordByWord is a reading-assistant app for language learners, on iPhone and iPad. | WordByWord is a reading assistant for language learners on iPhone and iPad. |
| hero.how | เปิดเว็บไซต์ในเบราว์เซอร์ในตัวของแอป แล้วปัดย่อหน้าไปทางขวา คำแปลจะแสดงอยู่ใต้ย่อหน้านั้น แตะคำสองครั้ง แล้ว AI จะอธิบายว่าคำนั้นหมายถึงอะไรในประโยคนั้น | Open a website in the app's built-in browser and swipe a paragraph to the right: the translation appears under that paragraph. Double-tap a word and the AI explains what it means in that sentence. | Open a site in its built-in browser and swipe right on a paragraph: the translation appears below it. Double-tap a word for an AI explanation of what it means there. |
| featuresIntro.title | ปัดเพื่อแปล แตะสองครั้งเพื่อดูความหมาย บนเว็บไซต์ที่คุณอ่าน | Swipe to translate, double-tap to see the meaning — on the websites you read | Swipe to translate, double-tap to look up — on the websites you read |
| features[swipe].title | ปัดเพื่อแปล: คำแปลแสดงตรงใต้ต้นฉบับ | Swipe to Translate: the translation shows right under the original | Swipe to Translate: the translation appears right below the original |
| features[lookup].title | แตะสองครั้งที่คำ ให้ AI บอกความหมายตามบริบท | Double-tap a word and let AI tell you its meaning in context | Double-tap a word for its AI meaning in context |
| features[x].title | แปลโพสต์ X (Twitter) อ่านคู่ต้นฉบับในเบราว์เซอร์ในตัว | Translate X (Twitter) posts and read them next to the original in the built-in browser | Read X (Twitter) posts bilingually in the built-in browser |
| features[chunks].title | การแยกชังก์และ Action Flow สำหรับประโยคภาษาอังกฤษ | Chunk Extraction (app name) and Action Flow for English sentences | Chunk Extraction and Action Flow, for English sentences |
| features[speech].title | อ่านออกเสียงด้วย AI หรือเสียง iOS ในเครื่องที่เร็วกว่า | Read aloud with AI, or with the faster on-device iOS voices | AI read-aloud, or fast on-device iOS voices |
| features[syntax].title | วิเคราะห์โครงสร้างประโยคยาวด้วย AI | Analyze the structure of long sentences with AI | AI sentence structure analysis for long sentences |
| features[engines].title | แปลบนคลาวด์หรือในเครื่อง | Translate in the cloud or on the device | Cloud or on-device translation |
| features[display].title | รูปแบบการแสดงและสไตล์ของคำแปล | Display format and style of the translations | Translation layout and style |
| features[history].title | ประวัติการแปลและการค้นหาคำ | History of translations and word lookups | Translation and lookup history |
| features[devices].title | iPhone, iPad, Mac และ Vision Pro | iPhone, iPad, Mac and Vision Pro | iPhone, iPad, Mac and Vision Pro |
| faq[what-is].q | WordByWord คืออะไร | What is WordByWord? | What is WordByWord? |
| faq[whole-page].q | WordByWord แปลทั้งหน้าเว็บในครั้งเดียวได้ไหม | Can WordByWord translate a whole web page in one go? | Can WordByWord translate a whole web page at once? |
| faq[safari].q | ใช้ใน Safari หรือในแอปอื่นได้ไหม | Can it be used in Safari or in other apps? | Does it work in Safari or inside other apps? |
| faq[word-by-word].q | WordByWord เป็นแอปแปลแบบคำต่อคำหรือเปล่า | Is WordByWord a word-for-word translation app? | Is WordByWord a word-by-word translator? |
| faq[x].q | ใช้ WordByWord อ่าน X (Twitter) ได้ไหม | Can I use WordByWord to read X (Twitter)? | Can I read X (Twitter) with WordByWord? |
| faq[languages].q | WordByWord รองรับภาษาอะไรบ้าง | Which languages does WordByWord support? | Which languages does WordByWord support? |
| faq[free].q | WordByWord ใช้ฟรีไหม โควตาต่อวันมีเท่าไร | Is WordByWord free? How big is the daily quota? | Is WordByWord free? What are the daily limits? |
| faq[engines].q | ใช้เอนจินแปลภาษาตัวไหน | Which translation engine does it use? | Which translation engine does it use? |
| faq[account].q | ต้องมีบัญชีถึงจะใช้ WordByWord ได้ไหม | Do I need an account to use WordByWord? | Do I need an account to use WordByWord? |
| faq[restore].q | จะใช้ WordByWord Plus ต่อบน iPhone หรือ iPad เครื่องใหม่ได้อย่างไร | How do I keep using WordByWord Plus on a new iPhone or iPad? | How do I get WordByWord Plus back on a new iPhone or iPad? |
| faq[android].q | มีเวอร์ชัน Android ไหม | Is there an Android version? | Is there an Android version? |
| faq[english-learner].q | กำลังเรียนภาษาอังกฤษอยู่ SurfEnglish น่าลองด้วยไหม | I'm learning English — is SurfEnglish worth trying too? | I’m learning English. Is SurfEnglish worth trying too? |
| faq[devices].q | WordByWord ใช้บนไอโฟน iPad, Mac หรือเบราว์เซอร์บนคอมพิวเตอร์ได้ไหม | Does WordByWord work on an iPhone (colloquial spelling), iPad, Mac or in a computer browser? | Does WordByWord work on iPad, Mac or a desktop browser? |
| faq[english-learner].a | ใช้ WordByWord อ่านหน้าเว็บและโพสต์ X ที่คุณเลือกต่อไปได้ตามเดิม ไม่ว่าจะเป็นภาษาอังกฤษหรือภาษาอื่น ถ้าคุณอยากได้ข่าวภาษาอังกฤษรายวันที่แบ่งตามระดับ (A1–C1) และเกมทบทวนประโยคกับคำที่บันทึกไว้เพิ่มเติม SurfEnglish จากนักพัฒนาคนเดียวกันมีสิ่งเหล่านี้ให้ โดยใช้การปัดและการแตะสองครั้งแบบเดียวกัน ทั้งสองแอปใช้คู่กันได้ [เว็บไซต์ SurfEnglish] | Keep using WordByWord for the pages and X posts you choose, in English or another language. If you'd also like daily English news sorted by level (A1–C1) and games that review the sentences and words you saved, SurfEnglish from the same developer offers them, with the same swipe and double-tap. The two apps can be used side by side. [SurfEnglish website] | Keep using WordByWord for the pages and X posts you choose, in English or any other language. If you would also like daily English news sorted by level ({se.levels}) and games that review the sentences and words you have saved, SurfEnglish, from the same developer, adds that with the same swipe and double-tap. The two apps work side by side. [SurfEnglish website](@se-site) |
| pricing.summary | ทุกฟีเจอร์ใช้ฟรีภายในโควตานี้ ส่วน Plus เพิ่มโควตาให้ในราคา US$3.99 ต่อเดือน (ราคาในสหรัฐฯ) | Every feature is free within these quotas; Plus raises them for US$3.99 a month (US price). | Every feature is free within these limits; Plus raises them for $3.99/month (US). |
| sibling.card.eyebrow | จากผู้พัฒนา WordByWord | From the developer of WordByWord | From the developer of WordByWord |
| sibling.card.title | SurfEnglish: ข่าวภาษาอังกฤษรายวันตามระดับของคุณ | SurfEnglish: daily English news at your level | SurfEnglish: daily English news at your level |
| sibling.card.body | กำลังเรียนภาษาอังกฤษอยู่ใช่ไหม อ่านหน้าเว็บที่ชอบใน WordByWord ต่อไปได้เลย แล้วลอง SurfEnglish ด้วย: ข่าวภาษาอังกฤษรายวันแบ่งตามระดับและเกมทบทวน ใช้การปัดและการแตะสองครั้งแบบเดียวกัน | Learning English? Go on reading the pages you like in WordByWord, and try SurfEnglish too: daily English news sorted by level and review games, with the same swipe and double-tap. | Learning English? Keep reading any page you like in WordByWord, and try SurfEnglish too: daily English news by level and review games, with the same swipe and double-tap. |
| sibling.card.points | ข่าวภาษาอังกฤษจริง ระดับ A1–C1 ／ เกมทบทวนที่สร้างจากสิ่งที่คุณอ่าน ／ แชร์บทความภาษาอังกฤษจาก Safari เข้าแอป | Real English news, levels A1–C1 / Review games built from what you read / Share English articles from Safari into the app | Real English news at levels A1–C1 / Review games built from what you’ve read / Share English articles from Safari to the app |
| sibling.card.note | เริ่มใช้ฟรี · iPhone และ iPad · หน้าจอแอป 12 ภาษา รวมภาษาไทย · แปลได้ 21 ภาษา | Free to start · iPhone and iPad · app interface in 12 languages, Thai included · translates into 21 languages | Free to start · iPhone and iPad · App in 12 languages · Translations into 21 |
| sibling.card.linkText | อ่านข่าวภาษาอังกฤษตามระดับของคุณกับ SurfEnglish | Read English news at your level with SurfEnglish | Read English news at your level with SurfEnglish |
| sibling.card.appStoreLinkText | ดาวน์โหลด SurfEnglish บน App Store | Download SurfEnglish on the App Store | Get SurfEnglish on the App Store |
| sibling.card.shotAlt | หน้า Games ของ SurfEnglish (แอปเป็นภาษาอังกฤษ): Sentence Builder และ Word Raid พร้อมเล่นด้วยประโยคและคำที่บันทึกไว้ | SurfEnglish Games screen (app in English): Sentence Builder and Word Raid, ready to play with saved sentences and words | SurfEnglish Games screen: Sentence Builder and Word Raid, ready to play with saved sentences and words |
| sibling.card.shotCaption | ภาพหน้าจอ SurfEnglish (แอปเป็นภาษาอังกฤษ) | SurfEnglish screenshot (app in English) | SurfEnglish screenshot (English interface) |
| sibling.footer.heading / linkText | จากผู้พัฒนาเดียวกัน ／ SurfEnglish: ข่าวอังกฤษแปลคู่ | From the same developer / SE's Thai store name ("English news, translated side by side") | More from the maker / SurfEnglish: Bilingual News |
| cta.title | เริ่มอ่านเว็บไซต์แบบสองภาษาบน iPhone | Start reading websites bilingually on iPhone | Start reading websites bilingually on iPhone |
| cta.recap | ปัดเพื่อแปล · แตะสองครั้งเพื่อค้นหา · อ่านออกเสียง · แปลได้ 21 ภาษา | Swipe to translate · Double-tap to look up · Read aloud · Translates into 21 languages | Swipe to translate · Double-tap to look up · Read aloud · 21 languages |

（占位符已代入当前值；`{plus.priceUS}` 在 th 渲染为"US$3.99"。表中引用的是去掉 U+2060 后的可见文字。）

FAQ 答案（不在回译清单里）也逐句对过 en：额度全部是占位符；`free` 写明 iOS 语音不限次、Plus 为月订、美区价格 + "ราคาในประเทศอื่นแสดงอยู่ใน App Store"；`restore` 引用 App 按钮"อัปเกรดตอนนี้"→"กู้คืนการซื้อ"（T-E）；`account` 用"ไม่ต้องสร้างบัญชี"（不需要创建账号），没用"สมัครสมาชิก"（泰语里它同时指注册和订阅，会读成"不用订阅"）；`devices` 的 S0 答案只写"แต่นักพัฒนาคนเดียวกันกำลังเตรียมส่วนขยาย Chrome อยู่"，不写扩展名称（R45）；`aExtLive` 才写 "WordByWord Translate for Chrome" 和"只从该页面的链接安装"。

### 3.1 与 en 的事实偏差

**没有事实偏差。** 以下是措辞层面的差异，都有意为之：

1. `meta.title` 写"เว็บไซต์"（网站）+"แบบสองภาษา"（双语方式），不是逐字的"web page"：这是文档 03 表 A 的 K1 主词，`titleMust` 的"เว็บ"按子串命中；"แบบ"见 §4-3。
2. `meta.description` 用"ในเบราว์เซอร์ของ WordByWord"代替"built-in browser"（文档 03 §3.2 允许"在 WordByWord 里"），并写出"ด้วย AI"（en 只说 meaning，功能本身就是 AI 语境义，K2 主词带"ด้วย AI"）。
3. `hero.title`："any web page"写成"หน้าเว็บ"（草案原样，荧光笔标在 K1 核心名词上），"right below"写成"ใต้ต้นฉบับ"（文档 04 §8.6 划给 WBW 的说法）。
4. `hero.platformNote` 不写美区价格（D2），只写"Plus เป็นการสมัครสมาชิกรายเดือน"。
5. 所有截图说明写"(แอปเป็นภาษาอังกฤษ)"（App 是英文），不是逐字的"อินเทอร์เฟซภาษาอังกฤษ"（§4-2）。
6. `gallery.items[languages].caption` 写"ตั้งค่าภาษา…: แปลจากสเปนเป็นอังกฤษ (US)"（语言设置：从西语译成英语 (US)），同一事实。
7. FAQ `safari` 的"tabs and bookmarks"写"แท็บและรายการโปรด"：App 泰文版书签叫"รายการโปรด"（`bookmark_title`），也避开了 ICU 会断成"บุ๊|กมาร์ก"的外来词。
8. FAQ `languages`："both US and UK English"写"ภาษาอังกฤษ (US และ UK)"，与 App 语言列表的"English (US) / English (UK)"一致。
9. FAQ `devices` 问句多了"ไอโฟน"（SEO-11，文档 03 §4.3 指定 th 在此处用一次）。
10. FAQ `what-is` / `devices` 的链接文字带"(ภาษาอังกฤษ)"，因为 about 页和扩展页只有英文版（Wave 2 规则）；`@se-site` 不带，SE 有泰文站。
11. `pricing.table.perDay` 写"{n}/วัน"（与 en "{n} / day" 同构），不是 App 的"%lld ครั้งต่อวัน"（§6-8）。

## 4. 没把握的措辞（12 处，附回译与替代写法）

| # | 键 | 现写法（回译） | 顾虑 | 替代写法（回译） |
|---|---|---|---|---|
| 1 | `hero.lede` / `footer.tagline` / FAQ `what-is` | แอปช่วยอ่าน（a reading-help app） | "reading assistant"的直译"ผู้ช่วยการอ่าน"偏书面；"แอปช่วยอ่าน"自然，但略口语 | « ผู้ช่วยการอ่าน »（reading assistant）或 « ตัวช่วยอ่าน »（reading aid） |
| 2 | 全部截图说明与 alt | (แอปเป็นภาษาอังกฤษ)（the app is in English） | 简报要求写"英文界面"；字面的"อินเทอร์เฟซภาษาอังกฤษ"更像术语，而且 ICU 把它断成"อิน｜เท｜อร์เฟซ"，在窄屏图注里实测断在词中 | « (อินเทอร์เฟซภาษาอังกฤษ) »（English interface，需加 U+2060）或 « (หน้าจอภาษาอังกฤษ) »（English screens） |
| 3 | `meta.title` | แอปแปลเว็บไซต์แบบสองภาษาบน iPhone（an app that translates websites bilingually on iPhone） | 草案是"แอปแปลเว็บไซต์สองภาษา"，但"เว็บไซต์สองภาษา"在泰语里常指"双语网站"，整句可读成"翻译双语网站的 App"；加"แบบ"后消除歧义，与 K1 主词差一个词 | 草案原样 « WordByWord: แอปแปลเว็บไซต์สองภาษาบน iPhone » |
| 4 | `features[lookup].kicker`、价格表行名、`cta.recap` | แตะสองครั้งเพื่อค้นหา（double-tap to search） | 这是 App 名（`word_meaning_lookup_title`），但"ค้นหา"首先是"搜索"，用户可能以为是网页搜索 | 自然说法 « แตะสองครั้งดูความหมาย »（double-tap to see the meaning）——需 App 侧一起改（§6-7） |
| 5 | `features[chunks].*`、`languages.limits[1]`、FAQ | การแยกชังก์（Chunk Extraction，app name） | "ชังก์"是音译，泰国学习者不一定认识；SE 泰文站用"กลุ่มคำ"，但"กลุ่มคำ"是 SE 的主词（附录 A 把它列进 seOwned） | 正文第一次出现时括注 « การแยกชังก์ (วลีที่ใช้ร่วมกันเป็นชุด) »（chunks: phrases used as a unit） |
| 6 | `features[speech].text` | เสียง Premium หรือ Enhanced（Premium or Enhanced voices） | 照 App 原文保留英文；iOS 泰文界面里这两档的叫法我没有在真机上核对 | 按 iOS 泰文界面实际名称改写（需真机确认） |
| 7 | `meta.ogHeadline` | ต้นฉบับยังอยู่ครบ（the original is all still there） | 想表达 "Keep the original"；"อยู่ครบ"偏口语 | « ต้นฉบับไม่หายไปไหน »（the original doesn't go anywhere）——需重跑 og.mjs |
| 8 | FAQ `english-learner` 问句 | กำลังเรียนภาษาอังกฤษอยู่ SurfEnglish น่าลองด้วยไหม（I'm learning English — is SurfEnglish worth a try too?） | 两个短句之间只有空格，没有连接词 | « เรียนภาษาอังกฤษอยู่ ลองใช้ SurfEnglish ด้วยดีไหม »（Learning English — should I try SurfEnglish too?） |
| 9 | `hero.platformNote`、`features[devices].text`、FAQ | Mac ที่ใช้ชิป Apple（Mac that uses an Apple chip） | Apple 泰国官网对 Apple silicon 有"ชิป Apple""Apple silicon"两种写法 | « Mac ที่ใช้ Apple silicon » |
| 10 | `features[x].kicker` | X (Twitter เดิม)（X, formerly Twitter） | 泰国媒体也常写"X (ทวิตเตอร์)"；kicker 同时被 glossary 锁定 | « X (ทวิตเตอร์เดิม) » |
| 11 | `pricing.table.perDay` | {n}/วัน（n / day） | 比 App 的"{n} ครั้งต่อวัน"（n times per day）少了量词"ครั้ง"；表头是"โควตารายวัน"，意思清楚 | « {n} ครั้ง/วัน »：320 px 下表格仍溢出 3 px（§6-8） |
| 12 | `features[swipe].bullets[1]` | แสดงคำแปลอัตโนมัติ หรือแตะเพื่อเปิดดู（show translations automatically, or tap to open them） | App 的两个模式叫"แสดงอัตโนมัติ / แสดงด้วยตนเอง"，网站用的是自然说法 | 照 App：« แสดงอัตโนมัติ หรือแสดงด้วยตนเอง »（show automatically or manually） |

## 5. 术语与 App 叫法处理要点（给审校人）

- **App 叫法（rule ①），均与 `Localizable.xcstrings` 的 `localizations.th` 核对过**：kicker "ปัดเพื่อแปล"（`daily_sentence_translation_limit`）、"แตะสองครั้งเพื่อค้นหา"（`word_meaning_lookup_title` 去掉"(ความหมาย AI)"，与 en / ja / es / it 做法一致，价格表行名保留后缀）；"คำจำกัดความเพิ่มเติม"（`more_definitions_title`）；"การแยกชังก์"（`Chunk Extraction`）；"ลำดับการกระทำของประโยค"（`sentence_skeleton_settings_navigation_title`，也是 App 对比表的行名）；"การอ่าน AI"（`audio_playback_title_streaming`）；Local Read 按 X11 写"การอ่านออกเสียงด้วยเสียงในเครื่อง"；"รับคำอธิบายไวยากรณ์ AI"（`get_syntax_explanation_button`）；"ประวัติการแปลแบบสไลด์"（`view_title_swipe_history`）；"อัปเกรดตอนนี้" / "กู้คืนการซื้อ"（T-E）；"อัตโนมัติ / ย่อหน้า / ประโยคต่อประโยค"（`translation_mode_title_*`）；"เอนจินแปลภาษาบนคลาวด์ / เอนจินภายในเครื่อง"（价格表缩成"· เอนจินบนคลาวด์ / · เอนจินภายในเครื่อง"）；"การออกเสียง AI (คำ) / (ประโยค)"；"ไม่จำกัด"（`limit_unlimited`）；"รายการโปรด"（`bookmark_title`）。
- **Action Flow**：H3、语言段、样张标签保留 App Store 名 "Action Flow"（D3、§7.2.3），功能正文括注 App 叫法"ลำดับการกระทำของประโยค"；价格表行名用 App 叫法（与 zh-Hans / ko / es / it 相同）。
- **手势**：句中"ปัดไปทางขวา"（App tip `tip_swipe_to_translate`：ปัดไปทางขวาบนข้อความใดก็ได้…），功能名"ปัดเพื่อแปล"；双击一律"แตะสองครั้ง"（App tip：แตะสองครั้งที่คำใดก็ได้…）。不用"สไลด์""ดับเบิลคลิก"（glossary 禁用鼠标说法与左滑）。
- **称谓与语气**：中性礼貌，不加 ครับ / ค่ะ（§7.3）；少用"คุณ"，以祈使句为主；FAQ 问句不加"?"（泰文以疑问词收尾，与 SE 泰文站一致），答案先给"ได้ / ไม่ได้ / ไม่ต้อง / ฟรี"。开发者第三人称"Jinlong"，不写"เรา"（`common.contactUs` 写"ติดต่อผู้พัฒนา"）。
- **标点与排版**：引号用 “ ”（与 App 一致），App 原文的 ‘ ’ 用于样张释义；"ๆ"按 RI 规范写"อื่น ๆ"，并用不换行空格（U+00A0）防止"ๆ"落到行首；数字用阿拉伯数字。
- **Apple 用词**：บัญชี Apple（Apple Account）、ส่วนขยาย Safari、"iOS 18 ขึ้นไป"、商标声明按 Apple 泰文写法（"…ที่จดทะเบียนในสหรัฐอเมริกาและประเทศและภูมิภาคอื่น ๆ"）。
- **App Store 徽章**：th-th 徽章是 Apple 官方泰文版，`common.appStoreBadgeAlt` = "ดาวน์โหลด WordByWord บน App Store"，SE 文字链接 = "ดาวน์โหลด SurfEnglish บน App Store"（T8）。
- **glossary**（`src/data/glossary/th.json`）：`required` 锁定 10 个 kicker、`demo.ui.more`、样张 flowLabel 与 10 个价格表行名；`contains` 要求 FAQ `restore`、`syntax`、`chunks`、`lookup.bullets[2]` 逐字引用 App 名；`banned` 收录左滑、鼠标"ดับเบิลคลิก"、"ท้องถิ่น"（X11）、"เครื่องยนต์"（App 把 engine 误译成"发动机"）、App 名的变体、旧站的"ผู้ช่วยอัจฉริยะ"。因为 L-13 比较原始字符串，`required` / `contains` 里的值带着与 th.json 相同的 U+2060（`glossary-th.mjs` 从 th.json 读出，先确认去掉 U+2060 后等于 App 名）。
- `meta.appStoreName` / `appStoreSubtitle` = "WordByWord Translate" / "Swipe to translate AI explains"：泰国区店面的名称和副标题就是这两个英文串（`scratchpad/as_th.html`，研究 05 §2.1），照抄（§6-5）。

## 6. 需要负责人决定的问题

1. **OG 图（D-23）**：按简报，OG 文件没有复制进真实仓库。th.json 进库后，`node build.mjs` 会报 `D-23 home-th: no OG image`，直到运行 `node scripts/og.mjs --only home-th`（新副本实测一次通过：54 px × 2 行、副标题 30 px × 2 行、139.6 KB）。
2. **th lint 词表**：`claims-lint.json` 有 26 条规则缺 th 写法（L-14 W）、`keyword-map.json` 缺 th 的 G1 模式（L-9 W）。`docs/redesign-2026/ops/m3/th-lint.json` 是提案（27 条规则 + seOwned / seOwnedLead / G1），在新副本里合并后：th 文案 0 命中，构建 0 error，测试 62/62，其他语言不受影响。泰文没有空格，模式都是子串，没用 `\b`。是否采用、由谁合入，请决定。
3. **U+2060 的使用范围与维护**（§8）：
   - 现状：70 个键、233 个 U+2060。标题类键：复合词与固定词组；全文：ICU 会断成非词的外来词（คลาวด์、เอนจิน、ชังก์、อัปเกรด）、ICU 分错的词（การกระทำ、คำอธิบาย、ภายใน）和引号里的 App 按钮名。JSON 里写成 `⁠` 转义，审校时看得见。
   - 文档 05 §3.5 只写了"标题中确需不断开的复合词"用 U+2060；正文里的外来词也加，是因为"คลา｜วด์""เอนจิ｜นภายใน"这类断法会产生不是词的碎片（实测在 390 px 的规格清单里出现过）。如果只想在标题里用，删掉 `glue-th.mjs` 的 ALWAYS 列表对非标题键的作用即可，正文会回到浏览器默认断行。
   - 生成方式：`th.src.json`（干净稿）→ `glue-th.mjs` → `th.json`；以后改文案最好改干净稿再生成，否则手工维护 `⁠` 很容易漏或多。脚本目前只在 scratchpad，是否放进 `scripts/` 由负责人决定（我没有改仓库里的其他文件）。
   - **校验器**：L-9 / L-13 / L-14 和 D-8 都直接匹配原始字符串，词中的 U+2060 会让禁用词逃过匹配（例如"ไม่⁠จำกัด"不命中"ไม่จำกัด"）。th 文案已用去掉 U+2060 的版本另跑了一遍校验（0 error，附录 B），但建议校验器在匹配前统一剥除 U+2060（`validate-util.mjs` 的 `rendered()` / `displayText()`、`dom.mjs` 的 `textOf()` 各一行）。另外 L-8 的"荧光笔短语 ≤ 3 词"按空格数词，对泰文不起作用（任何泰文短语都算 1 个词），可考虑对 thai 改按可见字符计。
4. **泰文标题行高**：文档 05 §3.3 定泰文标题行高 1.35、正文 1.8，`base.css` 没有 `data-script="thai"` 的行高规则，H1 用的是拉丁的 1.08。截图里上下行的声调符号与下沉笔画没有碰撞，但很紧；要不要按文档补一条 `html[data-script="thai"] :is(h1, h2, h3) { line-height: 1.3 }`（改 CSS 不在本任务范围）。
5. **店面名 / 副标题**：泰国区 App Store 显示的是英文 "WordByWord Translate" / "Swipe to translate AI explains"，`meta.appStoreName` / `appStoreSubtitle` 照抄，因此 L-4 报 1 条 review W（`appStoreSubtitle`）。这两个键只用于 about 事实表，th 没有 about 页，不渲染。vi / tr / pl 也是这样处理的。
6. **页脚 SE 链接文字**："SurfEnglish: ข่าวอังกฤษแปลคู่" 取自文档 04 §5.5（来源是 SE 泰文站 `meta.appStoreName`）；研究 05 记录的 TH 店面名是 "SurfEnglish: Bilingual News"。请在泰国区店面确认现在的名字，不一致时以店面为准。
7. **报给 App 侧的泰文字符串问题**（规则 ③；网站已按下列方式处理）：
   - X11：`audio_playback_title_local` "การอ่านท้องถิ่น"、`tts_option_local_synthesis` "เสียงสังเคราะห์ในท้องถิ่น"、`tts_trial_exhausted_fallback_message` 里的"การออกเสียงท้องถิ่น"——"ท้องถิ่น"是"地方的"。网站写"อ่านออกเสียงด้วยเสียงในเครื่อง / เสียงในเครื่อง"。
   - `audio_playback_description_local` "ใช้เครื่องยนต์เสียงในตัวของอุปกรณ์"："เครื่องยนต์"是发动机，应为"เอนจิน"（App 其他地方都用 เอนจิน）。
   - 同一手势两种叫法："…แบบสไลด์"（`view_title_swipe_history`、`view_title_swipe_detail`）与"ปัด"（其余所有地方）。网站正文一律"ปัด"，只在引号里照 App 引用"ประวัติการแปลแบบสไลด์"。
   - 书签两种叫法："รายการโปรด"（`bookmark_title` 等）与"บุ๊กมาร์ก"（`edit_bookmark_*`、`view_bookmarks_button`）。
   - 源语言两种叫法："ภาษาแหล่งที่มา"（设置）与"ภาษาต้นฉบับ"（`select_source_language_title`）。
   - `word_meaning_lookup_title` "แตะสองครั้งเพื่อค้นหา"：意思是"双击以搜索"，建议"แตะสองครั้งดูความหมาย"；`double_tap_not_supported_message` 把查词叫"การแปลแบบแตะสองครั้ง"（双击翻译）。
   - `translation_style_title_quote_style` "รูปแบบการอ้างอิง" 的意思是"引用格式（文献）"，不是引用条样式。
   - `setting_title_audio_playback_mode_selection` "โหมดการอ่าน" 容易理解成"阅读模式"，建议"โหมดเสียงอ่าน"。
   - `send_feedback_button` "ส่งข้อเสนอแนะแบบฟีดแบ็ก" 重复（"发送反馈式的反馈"），建议"ส่งข้อเสนอแนะ"。
   - "Premium / Enhanced" 保留英文，建议按 iOS 泰文界面的实际名称改写。
   - 顺带发现（en 源串）：`folder_name_label` 与 `usage_section_title` 的 en 值是 "Border" / "Dashed Underline"，与键名不符（泰文是"ชื่อ""การใช้งาน"）。
8. **`pricing.table.perDay`**：App 写"%lld ครั้งต่อวัน"，网站用"{n}/วัน"。原因：数值单元格不换行（`.q-val`），"500 ครั้งต่อวัน"太宽，320 px 下表格比框宽 26 px，需要横向滚动；"{n} ครั้ง/วัน"仍多 3 px；"{n}/วัน"在 21 个宽度下都不溢出，表格也矮了约 120 px。如果更看重与 App 一致，可改回 App 写法并接受 320 px 下的滚动。
9. **正文里的复合词断行**：正文（段落、FAQ 答案、页边注）里像"อ่านออก｜เสียง""ห้อง｜สมุด""ภาษา｜อังกฤษ"这种在构词边界的断行没有处理，交给浏览器（文档 08 §7.7）；泰文网页普遍如此，读者可以接受。标题类字段里已全部避免。
10. **母语审校**：按 R36，th 上线后补母语审校；请审校人重点看 §4 的 12 处、§6-7 的 App 用词，以及 §7 的标题断行是否自然。

## 7. 版面实测（新副本 + `scripts/serve.mjs --port 4608`，headless Chrome，外部请求全部拦截）

| 视口 | 横向溢出 | 价格表 | SE 卡片高度（上限） | 样张红色译文条顶端 | 整页高度 |
|---|---|---|---|---|---|
| 1280 × 900 | 无 | 不滚动 | 338 px（420） | 378 px | 10,080 px |
| 390 × 844 | 无 | 不滚动 | 429 px（480） | 698 px（< 844，R69） | **12,551 px**（目标 ≤ 13,000） |
| 375 × 812 | 无 | 不滚动 | 450 px（480） | 697 px（< 812） | 12,595 px |
| 320 × 700 | 无 | 不滚动 | 507 px（560，R84） | 701 px | 12,974 px |

另测 21 个宽度（320、340、360、375、390、400、414、430、480、520、560、600、640、700、768、820、900、1024、1180、1280、1440）：页面溢出 0、表格溢出 0、header 无重叠。

**标题断行**（逐行读出渲染结果；"｜"为换行处，下列都在词或词组边界）：

| 元素 | 390 px | 320 px |
|---|---|---|
| H1 | ปัดย่อหน้าบนหน้าเว็บ｜ไปทางขวา คำแปลจะ｜แสดงอยู่ใต้ต้นฉบับ | ปัดย่อหน้าบน｜หน้าเว็บไปทางขวา｜คำแปลจะแสดงอยู่｜ใต้ต้นฉบับ |
| eyebrow | WordByWord · แอปอ่านเว็บสองภาษา｜สำหรับผู้เรียนภาษา | 同左 |
| lede | …แอปช่วยอ่านสำหรับผู้เรียนภาษา｜บน iPhone และ iPad | …แอปช่วยอ่านสำหรับ｜ผู้เรียนภาษา บน iPhone และ iPad |
| 功能区 H2 | ปัดเพื่อแปล แตะสองครั้ง｜เพื่อดูความหมาย｜บนเว็บไซต์ที่คุณอ่าน | 同左 |
| X H3 | แปลโพสต์ X (Twitter)｜อ่านคู่ต้นฉบับในเบราว์เซอร์ในตัว | 同左 |
| 语言 H2 | แปลได้ 21 ภาษา｜จากต้นฉบับหลายภาษา｜ไม่ใช่แค่ภาษาอังกฤษ | 同左 |
| 价格 H2 | ใช้ฟรีทุกวัน อ่านเยอะขึ้น｜เมื่อไรค่อยอัปเกรดเป็น Plus | ใช้ฟรีทุกวัน｜อ่านเยอะขึ้นเมื่อไร｜ค่อยอัปเกรดเป็น Plus |
| SE H2 | SurfEnglish: ข่าวภาษาอังกฤษ｜รายวันตามระดับของคุณ | SurfEnglish:｜ข่าวภาษาอังกฤษรายวัน｜ตามระดับของคุณ |
| CTA H2 | เริ่มอ่านเว็บไซต์｜แบบสองภาษาบน iPhone | เริ่มอ่านเว็บไซต์｜แบบสองภาษา｜บน iPhone |
| 价格表行名 | ปัดเพื่อแปล ·｜เอนจินภายในเครื่อง；แตะสองครั้งเพื่อค้นหา｜(ความหมาย AI) | คำจำกัดความ｜เพิ่มเติม；แตะสองครั้ง｜เพื่อค้นหา｜(ความหมาย AI) |
| FAQ 问句 | WordByWord แปลทั้งหน้าเว็บในครั้งเดียว｜ได้ไหม | WordByWord เป็นแอปแปลแบบ｜คำต่อคำหรือเปล่า |

加 U+2060 之前同一批元素实测的问题（举例）：H1 在 320 px 断成"…บนหน้า｜เว็บ…คำ｜แปล…"；功能区 H2 断成"แตะสอง｜ครั้ง"；画廊 H2 断成"คำจำกัด｜ความ"；FAQ H2 断成"เกี่ยว｜กับ"；价格表行名断成"เอนจิ｜นบนคลาวด์""เอนจิ｜นภายในเครื่อง""คำจำกัดความเพิ่ม｜เติม"；画廊图注断成"อินเท｜อร์เฟซ""ภาษาเป้า｜หมาย"；规格清单断成"คลา｜วด์"；OG 副标题断成"ความ｜หมาย"。

为满足上面的数字所做的调整（初稿 → 定稿）：

- `pricing.table.perDay` "{n} ครั้งต่อวัน" → "{n}/วัน"：320 px 价格表溢出 26 → 0 px（§6-8）。
- 截图说明"อินเทอร์เฟซภาษาอังกฤษ" → "แอปเป็นภาษาอังกฤษ"：外来词在窄屏图注里被断开（§4-2）。
- 目视检查（深色模式截图）：390 / 320 px 的 hero、样张查词卡、L1 / L2 功能块（①②③ 页边注）、X 样张、语块示意、规格清单、语言段、价格表、SE 卡片、FAQ、最终 CTA、页脚，1280 px 的 hero、功能区、SE 卡片：没有溢出或异常断行；泰文声调符号没有被裁切，"ๆ"没有落到行首。

## 8. 泰文断行处理说明（文档 08 §7.7、文档 05 §3.5）

- **为什么需要**：泰文词间无空格，Chrome 用 ICU 词典找断点。实测（Node 的 `Intl.Segmenter('th')` 与 Chrome 的 1 px 宽度逐断点测试结果一致）：ICU 词典里没有的外来词会被拆成非词（"คลา｜วด์""เอน｜จิ｜นภา｜ย""ชัง｜ก์""อิน｜เท｜อร์เฟซ""บุ๊｜กมาร์ก""เด｜โม""ไอ｜โฟน"），有些本土词组也会分错（"การก｜ระ｜ทำ""มอง｜หาว｜ลี""การเต｜รี｜ยม""ภูมิ｜ภา｜คอื่นๆ""รับคำ｜อธิบาย""ประวัติการ｜แปล"），复合词在构词边界可断（"หน้า｜เว็บ""ความ｜หมาย""คำ｜แปล""ผู้｜เรียน""เกี่ยว｜กับ"）。U+2060 只能取消断点，不能新增断点。
- **做法**：`glue-th.mjs` 在显示文本（去掉 `[[ ]]`）上算 ICU 断点，对每个"保护单位"内部的断点插入 U+2060（荧光笔边界处插在 `[[` 之前）。保护单位分两组：ALWAYS（全文）= 外来词与分错的词 + 引号内的 App 按钮名；HEADING（只在标题类键）= 复合词、绑定前缀词（การ- / ความ- / ผู้- / นัก-）、数量词组（สองครั้ง、สองภาษา、รายวัน）、会留下悬空介词或语气词的固定词组（บนเว็บไซต์、จากต้นฉบับ、ได้ไหม、ได้อย่างไร…）。
- **不加的地方**：`meta.title`、`meta.description`、`meta.ogHeadline`（进 `<title>`、meta、og:title）、`seo.*`、所有 alt、只做 aria-label 的键、英文样张原文。"ไอโฟน"（FAQ `devices`，SEO-11 的本地关键词）也不加，以免影响匹配；它在 320 px 以上都在第一行。
- **能改写的先改写**："มองหาวลี"→"ตรวจดูวลี"、"กำลังอยู่ระหว่างการเตรียม"→"กำลังเตรียม…อยู่"、"ที่มากับ iOS"→"ในตัวของ iOS"、"เดโม"→"ภาพจำลอง"、"บุ๊กมาร์ก"→"รายการโปรด"、"สหรัฐฯ และสหราชอาณาจักร"→"(US และ UK)"、"อินเทอร์เฟซ"→"แอปเป็นภาษาอังกฤษ"。
- **其他**：数字占位符与"ภาษา / ครั้ง"之间用 U+00A0；"ๆ"写成"อื่น ๆ"（RI 规范、与 App 一致），空格用 U+00A0，避免"ๆ"单独换到下一行。没有使用零宽空格 U+200B（文档 08 §7.7）。

## 附录 A：建议的 th lint 词表（`docs/redesign-2026/ops/m3/th-lint.json`）

文件形状按 Wave 2 约定：`{"claimsLint": {"<rule id>": [...]}, "keywordMap": {"seOwned": [...], "seOwnedLead": [...], "reservedG1": [...]}}`。覆盖 27 条规则（跳过只有 `*` 的 `io-home`、`engine-claim`；`hype` 有 `*` 也有各语言模式，所以补了 th）。匹配方式同校验器（`iu` + bb689eb 的 Unicode `\w`，在代入占位符、去掉标记后的文本上）；泰文模式全部是子串，`[^ ]{0,n}` 只在一个泰文短语内部跨越（泰文用空格分短语），没用 `\b`。

自测（新副本 = HEAD 2e8ced2 + th 两个文件 + 本词表）：th 文案 0 命中（否定句在各规则自带的豁免键内），去掉 U+2060 的 th 文案也 0 命中；构建 0 error、L-14 / L-9 的 th 汇总 W 消失；测试 62/62。下列 60 个反例句全部命中（`scratchpad/th-work/lint-test-th.mjs`）：

| 规则 | 反例句（全部命中） |
|---|---|
| whole-page | แปลทั้งหน้าเว็บได้ในคลิกเดียว ／ WordByWord แปลเว็บไซต์ทั้งหน้าให้อัตโนมัติ ／ แตะครั้งเดียวก็แปลได้ทั้งหน้า |
| swipe-left | ปัดย่อหน้าไปทางซ้ายเพื่อแปล ／ สไลด์ซ้ายเพื่อดูคำแปล |
| safari-extension | WordByWord เป็นส่วนขยายของ Safari ／ แปลได้ในแอปไหนก็ได้ ／ ใช้งานได้โดยไม่ต้องสลับแอป |
| selection-translate | เลือกข้อความแล้วแปลได้ทันที ／ ไฮไลต์คำเพื่อแปล ／ แปลทันทีที่เลือก |
| offline | แปลได้แม้ออฟไลน์ ／ ใช้ได้โดยไม่ต้องใช้อินเทอร์เน็ต |
| unlimited-ai-voice | ออกเสียง AI ได้ไม่จำกัด ／ Plus ฟังเสียง AI ไม่จำกัด ／ การออกเสียง AI ไม่จำกัดจำนวนครั้ง |
| dark-mode-theme | รองรับโหมดมืด ／ เปลี่ยนธีมสีได้ตามใจ |
| shortcuts-volume | ตั้งคีย์ลัดสำหรับแปล ／ ปรับระดับเสียงการอ่านได้ |
| vocab-sync | บันทึกคำลงสมุดคำศัพท์ ／ ซิงค์ประวัติข้ามอุปกรณ์ ／ ทบทวนด้วยแฟลชการ์ด |
| android | ดาวน์โหลดบน Google Play ได้แล้ว ／ มีเวอร์ชันแอนดรอยด์ |
| desktop-version | มีเวอร์ชันสำหรับคอมพิวเตอร์ ／ ดาวน์โหลดแอปสำหรับ Windows |
| x-app | แปลโพสต์ได้ในแอป X โดยตรง ／ แอปเดียวที่แปล X ได้ |
| plus-early-access | สมาชิก Plus ได้ลองฟีเจอร์ใหม่ก่อนใคร |
| privacy-claim | ไม่มีการเก็บข้อมูลส่วนตัว ／ แอปไม่เก็บข้อมูลใดๆ |
| initial-version | เวอร์ชันแรกนี้รองรับ 20 ภาษา |
| language-pairs | รองรับมากกว่า 20 คู่ภาษา ／ แปลระหว่างภาษากว่า 20 คู่ |
| style-count | เลือกได้ 8 สไตล์ ／ สไตล์การแปล 7 แบบ ／ มีแปดรูปแบบให้เลือก |
| auto-detect-target | แอปจะตรวจจับภาษาปลายทางโดยอัตโนมัติ |
| history-by-date | ประวัติถูกจัดกลุ่มตามวันที่ |
| plus-only | การวิเคราะห์ไวยากรณ์ใช้ได้เฉพาะ Plus ／ ฟีเจอร์นี้สำหรับสมาชิก Plus เท่านั้น |
| speaking-practice | ช่วยฝึกพูดภาษาอังกฤษ ／ พัฒนาทักษะการฟังและพูดไปพร้อมกัน |
| jargon | เทียบประโยคต่อประโยคแบบหนึ่งต่อหนึ่ง ／ การจัดแนวประโยคอัจฉริยะ |
| replacement-tone | ถ้าเรียนภาษาอังกฤษ SurfEnglish อาจเหมาะกว่า ／ ใช้ SurfEnglish แทน WordByWord ／ SurfEnglish แอปพี่น้องของ WordByWord |
| se-on-device-voice | เสียง AI บนเครื่อง ใช้ออฟไลน์ได้ |
| se-hype | แอปใหม่จากผู้พัฒนา WordByWord ／ เรียนได้เร็วกว่าเดิม ／ อัปเกรดเป็น SurfEnglish |
| hype | แอปแปลภาษาที่ดีที่สุด ／ ผู้ใช้กว่า 10,000 คน ／ ดาวน์โหลดแล้ว 50,000 ครั้ง ／ จากทีม WordByWord ／ ผู้ช่วยอัจฉริยะสำหรับการเรียนรู้ภาษา ／ บอกลาการคัดลอกไปวาง |
| ext-language-count | ส่วนขยายแปลได้ 20 ภาษา |
| seOwned | อ่านข่าวอังกฤษแปลคู่ ／ ฝึกภาษาอังกฤษทุกวัน ／ ข่าวภาษาอังกฤษตามระดับ ／ การแยกชังก์ ／ กลุ่มคำภาษาอังกฤษ |
| seOwnedLead | เรียนภาษาอังกฤษจากข่าว ／ กำลังเรียนภาษาอังกฤษอยู่ใช่ไหม ลอง SurfEnglish |
| reservedG1 | วิธีแปลหน้าเว็บบน iPhone โดยเก็บต้นฉบับไว้ ／ แปลเว็บบน iPhone ยังไงให้ต้นฉบับอยู่ ／ แปลหน้าเว็บอย่างไร |

不得误拦（文档 03 §1.4）：« สำหรับผู้เรียนภาษา »、« แอปอ่านเว็บสองภาษาสำหรับผู้เรียนภาษา »、« เรียนภาษาจากเว็บไซต์จริง »、« คำแปลภาษาอังกฤษอยู่ด้านล่าง » 都不命中 seOwned；SE 卡片 H2 « SurfEnglish: ข่าวภาษาอังกฤษรายวันตามระดับของคุณ » 不命中 seOwnedLead；th 的 title / H1 / description / `cta.title` 不命中 G1。

说明：`se-hype` 的"ใหม่"与"อัปเกรด"只作用于 SE 区块（规则自带 `only`），不会拦价格段的"อัปเกรดเป็น Plus"或 FAQ `restore` 里的 App 按钮"อัปเกรดตอนนี้"；`shortcuts-volume` 的"ระดับเสียง"（音量）不会命中"ตามระดับ"（按等级）；`hype` 没有收"ที่หนึ่ง"，因为样张释义里有"ไปยังที่ใดที่หนึ่ง"（去某个地方）；`seOwnedLead` 会作用于所有语言页面的 H2，th 模式只匹配泰文开头。合入前请母语审校再看一遍。

## 附录 B：验证记录

| 命令 | 结果 |
|---|---|
| `node build.mjs --out …/dist`（新副本，数据文件为真实仓库原样） | 0 error；th 3 条 W（L-4、L-14 未覆盖、L-9 无 G1） |
| 同上，副本合并 `th-lint.json` 后 | 0 error；th 1 条 W（L-4） |
| `node build.mjs --pseudo` | 两种数据下均 0 error |
| `node scripts/check.mjs --dist …` | 0 error / 0 warning |
| `node scripts/check.mjs --keys th` | 0 missing / 0 not in en |
| `node scripts/og.mjs --only home-th` | ✓ 标题 54 px × 2 行、副标题 30 px × 2 行、139.6 KB |
| `node --test scripts/tests/*.test.mjs` | 62/62（两种数据下均通过） |
| 去掉 U+2060 的 th 文案跑 `validateLocales`（`lint-test-th.mjs`） | 0 error（只有 L-4 W） |
| headless Chrome 1280 / 390 / 375 / 320 px | 无横向溢出；价格表不滚动；SE 卡片 338 / 429 / 450 / 507 px；390 px 页高 12,551 px |
| headless Chrome 21 个宽度（320–1440） | 页面溢出 0、表格溢出 0、header 无重叠 |
