# 04 · SurfEnglish 兄弟应用推荐设计

| 项 | 内容 |
|---|---|
| 文档编号 | 04 |
| 版本 | v1.1 |
| 日期 | 2026-10-05 |
| 状态 | 设计稿（已评审修订） |
| 上位约束 | `appendix/research/12-rulings.md`（主控裁定 R1–R84，含 v1.2 第四节、v1.3 第五节；H1–H18 统一编号）——**优先于基线与本文原文**；`appendix/research/11-design-baseline.md`（设计基线，下称"基线"，§B/§D/§E/§F）；`appendix/research/10-fact-check.md` §4（F1–F36，唯一可信事实来源） |
| 依赖资料 | 研究 00（GSC 基线）、研究 04（现有推广，全文）、研究 05 §2–§6（产品事实）、研究 06 §5、§7（SEO 实践）、研究 07 §7（关键词归属）、研究 08 §2.5、§4、§5（视觉素材）；评审 `appendix/research/13-review-findings.json`（本文相关：PRO-01、PRO-03、PRO-04、PRO-05、PRO-07、PRO-08、PRO-11、PRO-12、PRO-13、SEO-03、ENG-08、I18-12、VIS-14；交叉相关：SEO-02、SEO-13、PRO-10、ENG-06、VIS-01） |
| 同批设计文档 | 文档 02 信息架构与URL（区块顺序、锚点、互链表）、文档 03 SEO与关键词策略（H2 与锚文本约束、seoLint）、文档 05 视觉设计系统（token、卡片与最终 CTA 组件）、文档 06 技术架构与工程方案（`src/data/sibling.mjs` 的 `SIBLING`、`seMode()`、lint）、文档 08 文案底稿（`sibling.*`、`faq.items[english-learner]`、`about.family` 的落地；**全站文案含 SE 推荐文案的唯一来源**，R75）。本文只定义与它们的接口 |
| 范围 | WBW 站内 4 个推荐落点（①②④⑤；③ 已删除，R42）+ SurfEnglish 官网侧配套改动（⑥，SE 仓库独立 PR，含 S1–S7）+ 临时方案下线 |
| 入库策略 | 本文含 SE 仓库内部路径与排期，按 R30 / H10 默认不入公开仓库 |

- 标记：【决策】本文定案；【事实】有出处；【推断】有证据链但未直接验证；【建议】推荐做法，可由主控调整。
- 引用写法：「研究 0X §…」指 `appendix/research/0X-*.md`；「文档 0X §…」指本目录下的设计文档；「F#」指研究 10 §4 的事实条目；「R#」指主控裁定；「H#」指裁定第三节的待提供清单；「PRO-01 / SEO-03 / …」指评审条目；「基线 §F」指 `11-design-baseline.md` 的章节；`home.mjs:255` 指仓库文件和行号。
- 落点编号：① 兄弟卡片、② FAQ 一问、④ 页脚、⑤ `/about/` 家族说明、⑥ SE 侧反向链接。**③（语言段提示）已按 R42 删除**，编号保留不复用，以免与 GA 历史和其它文档的引用错位。

---

## 0. 摘要

1. 【决策，R40】叙事轴是"**互补、也值得一试**"，不是分流。WordByWord 帮你读**自己打开的任何网页和 X 帖子**，英文或其他语言都行（WBW 定位不变，R39）；SurfEnglish 是同一位开发者为学英语的人做的**另一种练法**：按水平分级的每日英语新闻 + 复习小游戏，沿用你熟悉的右滑翻译与双击查词。两款可以一起用。**禁止**"may suit you better / 可能更适合你 / のほうが合うかもしれません"一类替换性措辞，禁止暗示 WBW 是旧版或将被取代（WBW 与 SE 两侧文案都适用）。
2. 【决策，R42】站内落点为 ① 兄弟卡片（价格之后、FAQ 之前）、② FAQ 一问、④ 全站页脚 "More from the maker"、⑤ `/about/` 家族说明；⑥ 是 SE 官网的页脚和 about 反向链接。**删除 ③ 语言段提示**。**zh-Hans 页只保留 ②④⑤**，不渲染 ①，并在 ② 中如实写明 SurfEnglish 目前未在中国大陆 App Store 上架。全部是构建期静态 HTML，不用 JS 注入、固定条、弹窗，没有关闭按钮。
3. 【决策，R10、R84】体量：① 在桌面 1280×800 下 ≤ 420 px，在手机 375×812 下 ≤ 480 px，所有 locale 同一标准；≤ 480 px 适用于 ≥ 375 px 宽的视口，320 px 宽时 ≤ 560 px 即可接受（R84）。每个页面指向 surfenglish.app 的链接 ≤ 3 个（含页脚），指向 SE App Store 的链接 ≤ 1 个，同一页内锚文本不重复。
4. 【决策，R43】WBW 的转化入口优先：价格区**必须有 WBW 的 App Store 徽章**；① **不使用黑色 App Store 徽章**，改为两条文字链接（"Get SurfEnglish on the App Store →"〔本地化〕与 SE 官网链接；官网链接的锚文本用 SE 在该语言的核心词短语，例 en "Read English news at your level with SurfEnglish"，定稿以文档 08 为准，**不用裸域名 "surfenglish.app" 作锚文本**，R76），视觉权重低于 WBW 的任何 CTA；FAQ 之后的 WBW 最终 CTA 加强（App 图标 + 徽章 + 一句要点回顾，组件见文档 05），页面下半部的视觉重心属于 WBW。SE 图标在 ① 中显示为 32 px；WBW 图标在页面上的最大显示尺寸 ≥ SE 图标的 2 倍（VIS-14）。
5. 【决策，R11 外观 + R44 选图】视觉：在 WBW "纸与墨"纸面里做一张"夹页卡"（同色系浅底、细线框、方圆角、无阴影、无渐变）。SE 的身份只靠两样东西表达：SE 图标，以及 SE 官网 `games-home.jpg` 上部裁出来的**深色"窗口"**（Games 标题 + Sentence Builder / Word Raid 两张游戏卡，内容中性、无第三方新闻、展示 WBW 没有的功能）。裁切 x 0–720、y 128–928，缩到 400×444，显示 200×222 px；AVIF 实测 7,804 B。WBW 的 CSS 里不出现 SE 的青紫渐变或玻璃效果。
6. 【决策，R41】卖点只写 WBW 没有、且不贬低 WBW 的三项：**A1–C1 分级的每日英语新闻**、**用你读过的内容生成的复习小游戏**、**从 Safari 把英文文章分享进 App**（SE 分享扩展已在 SE iOS 源码核实存在，§5.1）。前两项是主卖点，第三项限定为"英文文章"，不写成"任何网页"。语块、双击查词、内置浏览器是两款共有的；端侧/离线语音不作为 SE 独有卖点（WBW 的 Local Read 同样是设备上的 iOS 语音，F16、PRO-03）。
7. 【决策】按 `seMode()`（文档 06 §4.3）分三档：`local`（11 个：en 与 SE 有界面的 10 种语言）链 SE 同语言页；`en-site`（de/fr/it/nl/pl/ru/tr/uk）链 SE 英文页（`hreflang="en"`），用"界面没有本语言、但可译成本语言"的 `uiNote` 替换 note；`no-card`（zh-Hans）不渲染 ①、全站无 SE App Store 链接。
8. 【决策，R3/R55】链接不加 nofollow，不带 UTM，在同一窗口打开。SE 的 App Store 链接用 campaign link，**`ct` 只按落点**：① `wbw-card`、⑤ `wbw-about`；locale 维度看 GA 的 `page_locale`。GA4 沿用 `surfenglish_promo`，label 为 `card_*`、`faq_site`、`footer_site`、`about_*`；`langhint_anchor` 随 ③ 删除。① 有一个曝光事件 `surfenglish_promo_view`。
9. 【决策，R40/PRO-08】SE 区块的 H2 **以 "SurfEnglish" 品牌开头**（例："SurfEnglish: daily English news at your level"），条件句"Learning English in particular?"挪到正文第一句；构建 lint 检查 `sibling.card.title` 以 SurfEnglish 开头（文档 03 seoLint 同步覆盖 H2）。
10. 【决策，R17/R51/R52】SE 侧配套改动 S1–S7：Person `alternateName: "Chi Jinlong"` 用新字段输出、**不改 SE 的 `makerFullName`、可见署名保持 "Jinlong"**；about 新增 "Also by Jinlong: WordByWord" 一节（删除 "earlier app" 类说法）；页脚 "More from the maker"；**S7 防蚕食**：SE 12 个 locale 的 "Any website, read bilingually" 加"英文"限定、删 meta.keywords 中归属 WBW 的词、加镜像 lint。**PR-SE-1 在 T0 前合并，PR-SE-2（页脚按 locale 链到 WBW 语言页）在 T+7d 内合并**。
11. 【决策】临时方案（`js/surfenglish-promo.js` 47 KB、CSS、4 张图）在新站上线时一并删除。20 种语言的译文先抽进 `src/locales/_legacy/` 作翻译记忆（文档 06 §4.5），再按 §5 改写。全局 `scroll-margin-top` 迁入主样式。

---

## 1. 设计原则

### 1.1 "对用户有益"的判定标准（5 道门槛，每个落点都要全部通过）

| # | 门槛 | 判定问题 | 不通过时的处理 |
|---|---|---|---|
| G1 | 需求匹配 | 这个页面的访客中，是否有相当一部分在学英语，而且母语不是英语？ | 不放 ①②，只保留 ④ 页脚 |
| G2 | 可获得 | 访客所在地区能下载、界面能用吗？ | zh-Hans 页不渲染 ①，全站不给大陆访客 SE 的 App Store 链接，② 写明未上架（F18、R42）；SE 没有该语言界面时如实说明（F36） |
| G3 | 信息增量 | 推荐里有没有访客自己不容易知道的信息，比如两款 App 各自做什么、同一开发者、可以一起用？ | 只剩"还有另一个 App，见下文"时，删掉这个落点（③ 即按此删除，PRO-05） |
| G4 | 零打扰 | 是否遮挡、挤占首屏，是否让 WBW 的主 CTA 后移或被替代，是否需要访客"关掉"它？ | 一律不做（没有固定条、弹窗，也不放首屏；不为避让 SE 而删 WBW 的徽章，PRO-07） |
| G5 | 诚实且不贬低 | 每一条能力描述能否在 F13–F18 / 基线 §B 里找到依据？是否暗示 SE 比 WBW "更好、更新、更适合"，或 WBW 是旧版、会被取代？是否把两款共有的能力写成 SE 独有？ | 改写，或删除（R40、R41） |

### 1.2 何时不推荐【决策】

| 场景 | 处理 | 理由 |
|---|---|---|
| 首屏、hero，以及 WBW 功能介绍之前 | 不出现 | 基线 §B.1、§F；研究 04 U3/U4 实测旧方案把 WBW 主 CTA 挤出了首屏 |
| zh-Hans 首页 | 不渲染 ①；保留 ② 与 ④ | G2：主体访客在中国大陆，SE 不可下载（F18、R42） |
| `/privacy.html`、`/support.html`、`/404` | 正文不放，只保留全站页脚 ④ | 访客是来办事的（找政策、求助、走错路）；研究 04 U8 |
| `/chrome-extension/` | 正文不放，只保留页脚 ④ | 访客用的是桌面浏览器扩展，SE 只有 iOS 版；基线 §F |
| Phase 2 指南页（任何主题） | 正文不放，只保留页脚 ④ | 非英语源语言的指南 G1 不成立（研究 05 §5.1 D 类）；英语与 X 类指南是 WBW 的主战场（文档 03 的 K9），在文末推 SE 等于把 WBW 自己的读者分流出去（PRO-01）。v1.0"X 指南文末加 ② 式条件说明"的做法作废 |
| 站点公告（site-notice）开启期间 | 不渲染 ①，其余落点不变（R35） | 两款 App 共用同一个后端（研究 05 TL;DR #4）。服务出故障时推荐另一款 App 会误导访客 |
| 根据 IP、`navigator.language` 判断访客身份 | 不做 | 静态页可缓存、爬虫和访客看到同一内容、不处理个人数据、页面不闪动 |

### 1.3 语气与措辞

推荐的语气应当像开发者顺口提一句"如果你也在学英语，我还做了另一个 App，也值得一试"，而不是一则广告，也不是"你该换一个"。

| 用 | 不用 | 依据 |
|---|---|---|
| H2 以品牌开头："SurfEnglish: …"；条件句放在正文第一句："Learning English in particular? / 主要在学英语？" | H2 以"学英语"开头；祈使句和催促："Download now""立即下载" | R40、PRO-08、文档 03 §4.4；研究 05 §5.2 |
| 互补："也值得一试 / 可以搭配 / 两款可以一起用 / The two apps work side by side" | 替换性措辞："may suit you better / better fit / 可能更适合你 / のほうが合うかもしれません / 더 잘 맞을 수 있어요"；"更好、升级版、新版、替代、取代、best、#1" | R40；基线 §F："不是 WBW 的替代品或升级版" |
| 先说 WBW 自己的用途："WordByWord 帮你读自己打开的任何网页和推文，英文或其他语言都行" | 把分工写成"WBW 管多语言、SE 管英语"——英语恰恰是 WBW 最核心的场景（默认源语言、Chunks、Action Flow、X） | R39、PRO-01；研究 05 §2.2 |
| 两款共有的操作只作从句："沿用你熟悉的右滑翻译与双击查词 / with the same swipe-to-translate and double-tap" | 单独成句的"操作完全相同 / work the same way as in WordByWord"（与替换性措辞连用时读起来像"换过去也没有成本"） | R40；PRO-01 |
| 只写 SE 多出来、WBW 没有的：分级英语新闻、复习小游戏、从 Safari 分享英文文章 | 端侧/离线语音作 SE 独有卖点；"faster / 更高效"等效果承诺；"X posts and podcasts" | R41、PRO-03；研究 04 §5 |
| "同一位开发者 / the same developer"；第三人称"同一开发者的 SurfEnglish" | "WordByWord 团队 / the makers / team"；"our sister app / 我们的姊妹 App"；"earlier app / 早期 App / 前作" | 基线 §A U4；R28；R40、PRO-13 |
| "Free to start / 免费开始" | 价格数字、评分、下载量、"New / 新上线"；"Many people use both"一类无法核实的说法 | 价格因地区而异且会变动；SE 评分接近 0（研究 05 §3.5）；研究 04 U9；G5 |
| 句号收尾，不用感叹号和 emoji | —— | —— |

### 1.4 与现有临时方案的逐项对比

| # | 维度 | 现状（证据） | 新方案 | 为什么改 |
|---|---|---|---|---|
| 1 | 位置 | 紧跟 `#hero`（`surfenglish-promo.js:19`） | 价格之后、FAQ 之前；价格区保留 WBW 徽章 | 现状下，访客在 WBW 官网看到的第一个 App Store 按钮属于 SE（研究 04 §3.2）；R43 |
| 2 | 形式 | fixed 顶部条 + 整屏卡片（研究 04 §1） | 无固定元素，全页只有一张卡 | 顶部条在手机上常驻占 155 px（19%），并把 WBW 主 CTA 挤出首屏（研究 04 U2/U3） |
| 3 | 体量 | 卡片在手机上 1,015 px（1.25 屏），桌面 729 px（研究 04 §3） | 桌面 ≤ 420 px，手机 ≤ 480 px（≥ 375 px 宽；320 px 宽 ≤ 560 px） | 基线 §F；R10、R84 |
| 4 | 实现 | DOMContentLoaded 后用 JS 注入，47,056 B（F10） | 构建期静态 HTML；仅曝光埋点需要不到 1 KB 的 JS | 非渲染型爬虫和 AI 爬虫完全看不到（研究 04 S1，WebFetch 实测）；另有性能和 CLS 问题（研究 04 P1/P2） |
| 5 | 视觉 | SE 的深海玻璃卡加三台倾斜手机，是全页视觉权重最高的区块（研究 08 §2.5） | 纸面夹页卡 + 一扇 200 px 宽的截图"窗口"；无黑色徽章；SE 图标 32 px | 层级倒置，看起来像在暗示 WBW 是旧版（研究 04 U5）；R43、VIS-14 |
| 6 | 受众 | 不加条件地对所有人说 "Learn English"（研究 04 U7） | H2 只写品牌与 SE 是什么；正文第一句是条件句，访客自己判断 | 学其他语言的人和英语母语者用不上 SE（研究 05 §5.1）；R40 |
| 7 | 定位文案 | 8 月旧定位 "Surf the web, learn English"（研究 04 §5） | SE 1.3 的 "Bilingual News"；卖点只写分级新闻、复习游戏与从 Safari 分享英文文章 | 文案已过时，与 SE 官网不一致（研究 04 M1 双源漂移）；"任意网页"是 WBW 的领地（基线 §B.4） |
| 8 | 关系表述 | "New · From the makers / WordByWord 团队" | "From the developer of WordByWord / 来自 WordByWord 的开发者" | 独立开发者（U4）；"New" 已经不新（研究 04 U9） |
| 9 | 中国大陆 | zh-CN 页放 App Store 下载按钮（研究 04 U11） | zh-Hans 不渲染 ①，只保留 ②（注明未上架）与 ④ | 大陆 App Store 打开是 404（F18）；R42 |
| 10 | 8 种无 SE 界面的语言 | 链 SE 英文根，写 "App in 12 Sprachen"（F10） | 链 SE 英文页并加 `hreflang="en"`，明确写"界面没有德语，可译成德语" | 原文案误导用户 |
| 11 | 页面范围 | 25 页，含 privacy/support/chrome-extension（研究 04 §1） | 19 个语言首页渲染 ①，20 个语言首页有 ②，`/about/` 有 ⑤；其余页面只有页脚 ④ | 场景不匹配（研究 04 U8） |
| 12 | 链接 | UTM + `target=_blank`（研究 04 §2.7） | 不带 UTM、同窗口打开、不加 nofollow | SE 站没有统计，UTM 无人接收（研究 10 §2 C11）；新窗口打开却没有提示（研究 04 A2） |
| 13 | App Store 归因 | 不带 `pt/ct`（研究 04 §2.7） | campaign link，`ct` 只按落点（`wbw-card`、`wbw-about`） | R3：ASC 每个 campaign 需 ≥ 5 次首次下载才显示，按 locale 拆分永远看不到数据 |
| 14 | 统计 | 只有点击，5 个 label，没有曝光（研究 04 §2.5） | 新 label 体系 + ① 的曝光事件 | 现在无法计算点击率 |
| 15 | 截图 | feed/translate/word-raid，旧 UI，600 px，合计约 462 KB（研究 04 §2.8） | `games-home.jpg` 上部裁切一张，400×444，AVIF 7.8 KB | 底栏还是旧版 "X"；feed 截图含真实人名新闻标题（R11、R32）；R44 |
| 16 | 徽章 | 每次加载都向 Apple toolbox 发第三方请求（研究 04 P4） | ① 不用徽章，改为文字链接 | R43：避免两个同外观的黑色徽章抢 WBW 的转化；也省掉一次请求 |
| 17 | 关闭记忆 | localStorage 记 7 天，只管顶部条（研究 04 §2.6） | 不需要 | 没有需要关掉的打扰元素 |
| 18 | 反向链接 | SE 站没有任何指向 WBW 的链接（研究 04 S7） | SE 页脚 + about 页（⑥，S4/S5） | 形成双向的实体关联 |
| 19 | 结构化数据 | WBW 没有 JSON-LD（F3） | 两站共用 Person `@id`（R17） | 研究 10 §2 C18 |
| 20 | 维护 | 文案和 DOM 强耦合（研究 04 M1/M2） | 单一数据源 `src/data/sibling.mjs`（`SIBLING`）+ locale JSON，构建时校验 | 防止再次漂移；字段名以文档 06 为准（R22） |
| 21 | SE 侧措辞 | SE 首页 "Any website, read bilingually"（无"英语"限定）与 WBW 的 K1 重叠 | S7：SE 12 个 locale 加"英文"限定，删 WBW 归属的 meta.keywords，加镜像 lint | R52、SEO-03：防止两站互相蚕食 |

---

## 2. 受众与情境模型

### 2.1 访客分群（以研究 05 §5.1 为底）

| 分群 | 典型落地页 | SE 对他是否有益 | 本设计中他会看到什么 |
|---|---|---|---|
| A 母语非英语、在学英语，且 SE 有其母语界面 | ja/ko/zh-hant/es/pt-br/vi/id/th/hi/ar | 是，作为 WBW 之外的补充练习 | `local` 版 ①，链 SE 对应语言页，带 App Store 文字链接；② FAQ |
| B 同 A，但母语是 de/fr/it/nl/pl/ru/tr/uk | 这 8 个语言页 | 是，但要说清界面问题 | `en-site` 版 ①，用 `uiNote` 替换 note，链 SE 英文页；② FAQ 加界面说明 |
| C 中国大陆的英语学习者 | zh-hans | 下载不了 | 不渲染 ①；② FAQ 写明未上架；④ 页脚只链 SE 官网（R42） |
| C′ 用简体中文的海外访客（新马、海外华人） | zh-hans | 是 | 同 C。静态页无法区分 C 和 C′，按"不误导 C"取最保守的处理；C′ 仍能从 ② 和 ④ 找到 SE |
| D 学英语以外外语的人 | 任意 | 否 | ① 的 H2 只是品牌名与"英语新闻"，正文第一句的条件不成立；紧接着一句告诉他 WBW 就是为他读的任何网页而做的。没有任何把他引向 SE 的暗示 |
| E 英语母语者 | `/`（en） | 否 | 同 D。en 页同时是 x-default，也有大量非母语访客，所以保留 `local` 版 ① |
| F 只想看懂外语网页、并不学习的人 | 任意 | 弱 | 同 D |
| G 正在用 WBW 读英文的学习者（WBW 的核心用户） | 任意 | 是，作为**另加**的一款 | 文案先确认"WordByWord 继续帮你读你打开的网页和推文"，再介绍 SE 多出来的分级新闻与复习游戏；不暗示他应该换 App（R40、PRO-01） |

【事实】en 页的国家构成还不知道（F25，GSC 缺"国家"维度，H1）。拿到数据后，如果 en 页绝大多数访客来自英语国家，可以在 en 页关掉 ①、只保留 ②④（在 `SIBLING.perLocale.en` 设 `card: false`，§3.7）。

### 2.2 话术骨架【决策，R40】

每个 ① 都按下面的固定骨架写：

```
[H2 品牌]  SurfEnglish：每天读符合你水平的英语新闻        ← 以品牌开头（R40、PRO-08、文档 03 §4.4）
[条件]     主要在学英语？                                ← 正文第一句；只有 A/B/G 会继续往下读
[WBW]      WordByWord 帮你读自己打开的任何网页和推文，英文或其他语言都行。 ← D/E/F 读到这里就知道 WBW 适合自己；G 知道不用换
[互补]     SurfEnglish 是另一种练法，沿用同样的右滑翻译和双击查词。两款可以一起用。
```

然后列出 **3 条** SE 独有、WBW 没有的能力（R41；前两条是研究 05 §4 中判为"SE 独有"的项），顺序固定：

1. 按 A1–C1 分级的每日英语新闻信息流（主卖点）；
2. 用你翻译过的句子和查过的词生成的复习小游戏（Sentence Builder / Word Raid）（主卖点）；
3. 从 Safari 把英文文章分享进 SurfEnglish 阅读（分享扩展，§5.1 已核实；WBW 没有分享扩展，F13）。

不进列表的能力及理由：

| 能力 | 为什么不写成 SE 的卖点 |
|---|---|
| 语块（Chunks）、双击查词、右滑翻译 | 两款 App 共有（WBW 的 Chunks 只支持英语，F15）；只作为"沿用同样的手势"从句出现 |
| 内置浏览器 | 两款共有，且"读任意网页"是 WBW 的领地（基线 §B.4） |
| 端侧 / 离线语音 | WBW 的 Local Read 同样是设备上的 iOS 语音，Free/Plus 均不限次（F16、研究 05 §2.5）；写成 SE 独有既不实，也贬低 WBW（R41、PRO-03）。只允许在 ⑤ 的对照表中、两边都如实描述时出现（§5.6） |
| 分享扩展写成"任何 App 的任何网页" | 只能写成第 3 条的"从 Safari 分享**英文**文章"：泛化成"任意网页"就进入了 WBW 的核心领地，会把叙事拉回"SE 是 WBW 的超集"（PRO-01）。另：SE 官网目前没有宣传这项能力，§8 建议 SE 侧补一句，避免双源漂移 |

---

## 3. 落点设计

### 3.0 总览

| 落点 | 页面 | 形式 | 指向 surfenglish.app 的链接 | SE App Store 链接 | 渲染开关（`SIBLING`） |
|---|---|---|---|---|---|
| ① 兄弟卡片 | 19 个语言首页（zh-Hans 不渲染，R42；公告开启时不渲染，R35） | `<aside>` 卡片 | 1 | 1（文字链接，R43） | `placements.card` |
| ② FAQ | 20 个语言首页 | FAQ 中的一问 `english-learner` | 1 | 0 | `placements.faq` |
| ~~③ 语言段提示~~ | — | — | — | — | **已删除（R42，取代 R4）** |
| ④ 页脚 | 全站所有页面 | 页脚中一栏 | 1 | 0 | `placements.footer` |
| ⑤ about 家族说明 | `/about/`（en） | 正文中一节 | 2（SE 官网 + SE about） | 1 | `placements.about` |
| ⑥ SE 反向链接 | surfenglish.app 全站 + `/about/` | 页脚一栏 + about 一节 | — | 1（WBW） | SE 仓库（§8） |

每页链接计数：首页 = ① 1 + ② 1 + ④ 1 = 3 个 surfenglish.app 链接、1 个 SE App Store 链接（zh-Hans 为 2 个、0 个）；`/about/` = ⑤ 2 + ④ 1 = 3 个、1 个（about 的 maker 段只用纯文本提到 SurfEnglish，不放链接，PRO-12）。

【决策】`enabled = false` 只关闭 ①② 这两个推荐性落点（文档 07 R12 的回退手段）。④⑤ 是"同一开发者"的事实信息，保留不动。

**首页中的位置**（区块顺序由文档 02 §7.5 定稿，本文只约束相对位置）：

```
┌ Header (WBW)                                         ┐
│ Hero (WBW)                         ← 首屏只有 WBW    │
│ 功能 Features / 截图 (WBW)                           │
│ 语言支持 Languages (WBW)            ← 不再有 ③        │
│ 价格 Pricing (WBW) + WBW App Store 徽章  ← R43 必须有 │
│ ① 兄弟卡片 aside#surfenglish (SE)   ← 文字链接，无徽章 │
│ FAQ (WBW) …… ② 倒数第二问                             │
│ 最终下载 CTA (WBW)：App 图标 + 徽章 + 要点回顾 ← R43   │
└ Footer …… ④ More from the maker                      ┘
```

约束：
1. ① 必须放在 WBW 最后一个功能/价格区块之后。
2. 【R43，取代 v1.0"与 WBW 徽章之间至少隔一个区块"】价格区**必须有 WBW 的 App Store 徽章**（`ct=wbw-pricing`，GA label `pricing`，文档 03/06）；① 内**不得出现黑色 App Store 徽章**或与 WBW CTA 同外观的按钮。两者外观不同，① 紧跟价格区也不会造成徽章混淆（研究 04 U6、PRO-07）。不得为了避让 SE 而删掉 WBW 自己的徽章（原型 README D6 的做法作废）。
3. ① 的 `h2` 字号不超过 WBW section H2 的 0.75 倍（具体字阶以文档 05 R68 后的阶梯为准）。
4. 【VIS-14】SE 图标在 ① 中显示 32 px（与 ⑤ 一致；④ 页脚为 20 px）；WBW 图标在同一页面上的最大显示尺寸 ≥ SE 图标的 2 倍（最终 CTA 的 WBW 图标 ≥ 64 px，组件见文档 05 §6.1）；截图窗口显示宽度 200 px。页面下半部唯一的 App 大图标属于 WBW。

### 3.1 ① 兄弟卡片

**体量**（R10、R84）：桌面 1280×800 下 ≤ 420 px 高，内容最大宽度 960 px；手机 375×812 下 ≤ 480 px，所有 locale 同一标准（最长的 de/ru 也要满足）。手机的 ≤ 480 px 适用于 ≥ 375 px 宽的视口；320 px 宽时 ≤ 560 px 即可接受（R84；原型 v1.3 实测 320 宽 en 558 / ja 551 px，390 宽 en 474 px，原型 README §3、K11）。

**信息层级**（从上到下）：SE 图标 32 px + eyebrow（关系）→ h2（"SurfEnglish：…"）→ 正文（条件 → WBW 用途 → 互补）→ 3 条 SE 独有能力 → note（免费开始 · 平台 · 语言）→ 动作行（App Store 文字链接 + SE 官网链接）。截图窗口在桌面版放右侧，手机版隐藏。

**桌面线框（`local` / `en-site`）**

```
┌───────────────────────────────────────────────────────────────────────┐
│ [SE 32] FROM THE DEVELOPER OF WORDBYWORD                  ┌────────┐  │
│                                                           │ Games  │  │
│ SurfEnglish: daily English news at your level      (h2)   │[6] [17]│  │
│                                                           │PLAY NOW│  │
│ Learning English in particular? WordByWord helps you      │▓Sentence│ │
│ read any page or post you open … SurfEnglish adds a       │▓Builder │ │
│ different kind of practice … side by side.                │▓Word    │ │
│                                                           │▓Raid    │ │
│ ▪ Daily English news at levels A1–C1                      └────────┘  │
│ ▪ Review games built from your own reading                200×222     │
│ ▪ Share English articles from Safari to the app           (caption)   │
│ Free to start · iPhone and iPad · App in 12 languages · …   (小字)    │
│ Get SurfEnglish on the App Store →    Read English news at your level…│
└───────────────────────────────────────────────────────────────────────┘
```

**手机线框（宽度 < 720 px 时隐藏截图）**

```
┌─────────────────────────────────┐
│ [SE] FROM THE DEVELOPER OF WBW  │
│ SurfEnglish: daily English news │
│ at your level                   │
│ Learning English in particular? │
│ WordByWord helps you … (≤4 行)  │
│ ▪ Daily English news, A1–C1     │
│ ▪ Review games from your reading│
│ ▪ Share English articles from   │
│   Safari to the app             │
│ Free to start · iPhone and iPad │
│ Get SurfEnglish on the App      │
│ Store →                         │
│ Read English news at your level…│
└─────────────────────────────────┘
```

（线框中的文字只示意结构；文案以文档 08 为准，R75。官网链接文字按 R76 用 SE 核心词短语，不用裸域名。）

**zh-Hans**：不渲染 ①（R42），页面上没有 `#surfenglish`（文档 02 §7.5）。v1.0 的 text 变体作废。

**HTML 结构草案**（模板输出，以 ja 页为例；`{…}` 为 locale JSON 键，文字取自文档 08 §3，R75；图片路径与指纹规则以文档 06 §7 为准，R8）

```html
<aside class="sibling" id="surfenglish" aria-labelledby="sibling-title"
       data-ga-view="surfenglish_promo_view" data-ga-label="card">
  <div class="sibling__inner">
    <div class="sibling__text">
      <p class="sibling__eyebrow">
        <img class="sibling__icon" src="/assets/se-icon-64.<hash>.png"
             width="32" height="32" alt="" decoding="async" loading="lazy">
        <span>{sibling.card.eyebrow}</span>
      </p>
      <h2 id="sibling-title">{sibling.card.title}</h2>
      <p>{sibling.card.body}</p>
      <ul class="sibling__points">
        <li>{sibling.card.points[0]}</li>   <!-- 等级区间 {se.levels} 代入后用 <bdi> 包裹 -->
        <li>{sibling.card.points[1]}</li>
        <li>{sibling.card.points[2]}</li>
      </ul>
      <p class="sibling__note">{sibling.card.note}</p>   <!-- en-site 用 {sibling.card.uiNote} 替换 -->
      <p class="sibling__actions">
        <a class="sibling__store"
           href="https://apps.apple.com/app/apple-store/id6787367021?pt=PT&amp;ct=wbw-card&amp;mt=8"
           data-ga-event="surfenglish_promo" data-ga-label="card_appstore">{sibling.card.appStoreLinkText}<span aria-hidden="true"> →</span></a>
        <a class="sibling__link" href="https://surfenglish.app/ja/" hreflang="ja"
           data-ga-event="surfenglish_promo" data-ga-label="card_site">{sibling.card.linkText}</a>
      </p>
    </div>
    <figure class="sibling__window">
      <picture>
        <source type="image/avif" srcset="/assets/se-games.<hash>.avif">
        <img src="/assets/se-games.<hash>.jpg" width="400" height="444"
             loading="lazy" decoding="async"
             alt="{sibling.card.shotAlt}">
      </picture>
      <figcaption>{sibling.card.shotCaption}</figcaption>
    </figure>
  </div>
</aside>
```

要点：
- 用 `<aside>` 并带可访问名称，屏幕阅读器会读作 complementary 区域。这在语义上如实表明它不是正文主线，读屏用户可以跳过。`id="surfenglish"` 沿用旧版深链（研究 04 §2.2；文档 02 §7.5）。
- App Store 链接是**文字链接**（R43）：无底色、无边框、不用 Apple 黑色徽章；链接文字必须含 "SurfEnglish"，与 WBW 自己的徽章区分（研究 04 U6）。末尾的 "→" 用 `aria-hidden` 包起来，不进锚文本。
- 链接不加 `target`、不加 `rel`。
- `A1–C1` 一类等级标记用 `<bdi>` 包起来（ar 页必需，其它语言无害）。
- 图片 `width/height` 写源图像素（400×444），由 CSS 缩到 200 px 宽，保持宽高比、避免 CLS。

**交互**【决策】：没有关闭按钮、不可折叠、没有动效（不做 reveal 和倾斜，R7）、不做轮播。理由：它不遮挡任何内容，体量受控，折叠反而要引入状态和 JS。唯一的 JS 是曝光埋点（§7.3），是渐进增强，关掉 JS 不影响显示。

**与 WBW 视觉系统的融合**【决策，R11：外观按本文】

结论：**放在同一套纸面系统里，SE 只通过"一扇窗"露面**。不采纳研究 08 §5.4 "保留 SE 深色卡作为一扇窗"的整卡方案，也不采纳文档 05 v1.0 §5.9 的 `<section>` + 对照 `<dl>` + 徽章方案（以本节为准，由文档 05 同步）。原因：
1. 深色大卡在浅色页面里视觉权重最高，这正是研究 04 U5 的问题。
2. 截图本身就是 SE 的深色 UI，明暗反差已经足够说明"这是另一个产品"。
3. WBW 的 CSS 里不引入 `--se-*` token，两套视觉不会互相渗透。

```css
/* token 名沿用文档 05；数值以文档 05 为准 */
.sibling { margin-block: var(--section-y-s); }
.sibling__inner {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: clamp(24px, 4vw, 40px);
  align-items: center; max-inline-size: 960px; margin-inline: auto;
  padding: clamp(20px, 3vw, 32px);
  background: var(--paper-2);                 /* 比页面纸色深一阶，像一张夹页 */
  border: 1px solid var(--hairline); border-radius: var(--r-2);  /* 方圆角，不做 SE 的 26px */
}
.sibling__eyebrow { display: flex; align-items: center; gap: 10px;
  font-size: var(--fs-small); letter-spacing: .06em; color: var(--ink-2); }
.sibling__icon { inline-size: 32px; block-size: 32px; border-radius: 7px; } /* 仅 SE 图标带 SE 自己的颜色 */
.sibling h2 { font-size: clamp(1.125rem, 2vw, 1.375rem); line-height: 1.3; }
.sibling__note { font-size: var(--fs-small); color: var(--ink-2); }
.sibling__actions { display: flex; flex-wrap: wrap; gap: 8px 24px; }
.sibling__store, .sibling__link {           /* 两条都是普通文字链接（R43） */
  color: var(--ink); text-decoration: underline; text-underline-offset: .2em; }
.sibling__window { margin: 0; inline-size: 200px; }
.sibling__window img { display: block; inline-size: 100%; block-size: auto;
  border-radius: 12px; outline: 1px solid var(--hairline); }
.sibling__window figcaption { font-size: .75rem; color: var(--ink-2); margin-block-start: 6px; }
@media (max-width: 719px) {
  .sibling__inner { grid-template-columns: 1fr; }
  .sibling__window { display: none; }        /* lazy 图片不显示时不请求，需按验收 A12 实测 */
}
```

- 禁止出现：渐变、`backdrop-filter`、`box-shadow` 辉光，以及青色 #4FD2FF 和紫色 #B388FF（研究 08 §5.1）；填充色按钮、Apple 黑色徽章。列表符号沿用全站样式；红色引用条不用于这里的要点（VIS-20 的规则）。
- 暗色模式：卡片用 `--paper-2` 的暗色值；SE 图标按 R70 加 1px 浅色描边；截图不变。
- RTL：全部用逻辑属性，grid 列序会自动镜像。

### 3.2 ② FAQ 中的一问

- **位置**：FAQ 列表的倒数第二问（文档 08 D5：共 10 问，`english-learner` 排第 9 问）。不放第一问，WBW 自己的问题优先。
- **形式**：沿用站内 FAQ 组件（`<details>`，默认折叠，内容在 HTML 里，可以被抓取）。答案最后一句是一个指向 SE 官网的品牌锚链接（`data-ga-label="faq_site"`）。zh-Hans 的答案由模板在末尾（官网链接之后）追加未上架说明 `sibling.availability`，作为答案的最后一句（R42；文档 06 §4.2）；`en-site` 的 8 种语言在链接前加一句界面说明（文档 08 §7.8）。
- **SEO**：不输出 FAQPage 标注（R5、F26）；这一问只作为可见内容，同时方便 AI 摘要引用。
- **问法**：问的是"有什么不同"，不是"该用哪个"——后者是二选一的替换框架（R40）。
- **文案**：问句与答案以文档 08 为准（键 `faq.items[english-learner]`，位置见 §5.3 索引，R75）；下面只示意 zh-Hans 的结构。

```
▸ 我在学英语，SurfEnglish 和 WordByWord 有什么不同？
  两款 App 出自同一位开发者……自己想读的网页和推文，都可以继续用 WordByWord 读。
  SurfEnglish 只用于学英语，多了分级英语新闻和复习游戏。两款可以一起用。SurfEnglish 官网 →
  SurfEnglish 目前未在中国大陆 App Store 上架。        ← sibling.availability，模板追加
```

### 3.3 ~~③ 语言支持段的情境提示~~（已删除，R42 取代 R4）

删除理由（PRO-05）：
- 不满足 G3：它只说"还有一个 App，见下文"，而 ① 就在下方、中间只隔着价格区。
- 它紧跟在 "Chunk Extraction and Action Flow work on English text only" 之后，读起来像用 SE 弥补 WBW 的不足；实际上 SE 同样只支持英语，而 WBW 在英文页面上的 Chunks 是能用的。

连带删除：locale 键 `sibling.languagesTip`、GA label `langhint_anchor`、`placements` 中的 `languages`、文档 08 S11 的类型改动。语言段只讲 WBW 自己的语言能力，不提 SurfEnglish（文档 02 §10.1、文档 08 §1.6 同步）。

### 3.4 ④ 页脚 "More from the maker"

- **位置**：全站页脚里的一栏。全站所有页面都有，包括 privacy、support、404、chrome-extension，因为它是页脚里的一条家族信息，不是推荐区块（文档 02 §10.1、文档 06 PAGES `sibling:'footer-only'`）。
- **结构**：栏标题 + 一条链接（20 px 的 SE 图标 + SE 在该语言的 App Store 名称）。链接目标按 §4 矩阵（zh-Hans 链 SE 的 `/zh-hans/` 官网页，不链 App Store）；英文单页（privacy/support/about/404/chrome-extension）都链到 `https://surfenglish.app/`。

```
  More from the maker
  [SE] SurfEnglish: Bilingual News
```

```html
<div class="footer-col footer-family">
  <h2 class="footer-heading">More from the maker</h2>
  <a href="https://surfenglish.app/" hreflang="en"
     data-ga-event="surfenglish_promo" data-ga-label="footer_site">
    <img src="/assets/se-icon-40.<hash>.png" width="20" height="20" alt="" loading="lazy">
    SurfEnglish: Bilingual News</a>
</div>
```

（栏标题用 `h2` 还是 `p`，跟随文档 05 的页脚组件。）

### 3.5 ⑤ `/about/` 家族说明（en）

- **位置**：在 `/about/` 的 "Who makes WordByWord"（`id="maker"`，文档 08 §5）之后，单独一节 `section#family`。
- **内容**：一段关系说明、一张对照表、一句中国大陆说明、三条链接（SE 官网、SE App Store `ct=wbw-about`、SE about#maker）。不放截图。
- **图标**：对照表表头用 32 px 的 SE 图标与 32 px 的 WBW 图标（同一规格，表示"并列的两款"）；about 页 WBW 的最大图标在页头（≥ 64 px，文档 05/08），满足 §3.0 约束 4。v1.0 的两个 72 px "家族徽记"作废。
- **链接预算**（PRO-12）：⑤ 2 个 surfenglish.app 链接 + ④ 页脚 1 个 = 3 个，App Store 1 个。因此：
  - maker 段（"Who makes WordByWord"）只用纯文本提到 SE："Jinlong also makes SurfEnglish (see below)."，不放链接；
  - about 的 `meta description` 不出现 SurfEnglish（§10 反模式 #5）；
  - about 时间线不以"同一开发者发布 SurfEnglish"收尾，以 WBW 自己的当前版本收尾（R40、PRO-13）。
  以上三条由文档 08 §5 落实，本文只作约束。
- **可见署名**（R81、R17）：about 页可见文本只写 "Jinlong"，**不出现 "Chi Jinlong"**；去歧义声明以链接到 App Store 开发者页（"WordByWord on the App Store"）的方式指明官方 App；"Chi Jinlong" 只作 JSON-LD Person 的 `alternateName`。由文档 08 §5 落实。

```
WordByWord and SurfEnglish                                    (h2)
Both apps are made by the same independent developer, Jinlong, …
┌──────────────────────┬──────────────────────────┬──────────────────────┐
│                      │ [32] WordByWord          │ [32] SurfEnglish     │
├──────────────────────┼──────────────────────────┼──────────────────────┤
│ …（见文档 08 §5.2）  │                          │                      │
└──────────────────────┴──────────────────────────┴──────────────────────┘
SurfEnglish is not available on the App Store in mainland China.
• SurfEnglish website  • SurfEnglish on the App Store  • About SurfEnglish's developer
```

### 3.6 ⑥ SE 官网反向链接

在 SE 仓库单独提 PR，详见 §8。

### 3.7 数据与构建接口【决策；与文档 06 v1.1 §4.2、§4.3 统一，R22、ENG-08】

推荐的唯一配置源是 `src/data/sibling.mjs` 的 `SIBLING`（文档 06 v1.1 §4.3 已按本文接口落地；v1.0 的 `sibling.json` 与 `LOCALES.se` 字段作废）。下面是本文的终表，与文档 06 一致：

```js
// src/data/sibling.mjs —— SE 推荐的唯一配置源（文案在 src/locales/<locale>.json 的 sibling.*）
export const SIBLING = {
  enabled: true,                       // false 时关闭 ①②；④⑤ 保留（文档 07 R12 的回退手段）
  placements: { card: true, faq: true, footer: true, about: true },   // 没有 langHint（③ 已删除，R42）
  name: 'SurfEnglish',
  appStoreId: '6787367021',
  siteOrigin: 'https://surfenglish.app',
  seLocalePath: { en: '', 'zh-Hans': 'zh-hans', 'zh-Hant': 'zh-hant', ja: 'ja', ko: 'ko',
    es: 'es', 'pt-BR': 'pt-br', vi: 'vi', id: 'id', th: 'th', hi: 'hi', ar: 'ar' },  // 其余 8 个 → SE 英文根页
  platforms: ['iPhone', 'iPad'],       // SE 若推出 Android，改数据而不是改文案
  perLocale: {
    'zh-Hans': { card: false, availabilityNote: true },   // R42：只渲染 ②④⑤；② 末尾追加 sibling.availability
    de: { uiNote: true }, fr: { uiNote: true }, it: { uiNote: true }, nl: { uiNote: true },
    pl: { uiNote: true }, ru: { uiNote: true }, tr: { uiNote: true }, uk: { uiNote: true },
  },
  cardImage: 'se/common/games',        // games-home.jpg 上部裁切（R44，§6）；备选 game-word-raid.jpg
  ctMode: 'placement',                 // ct 只按落点：① wbw-card、⑤ wbw-about（R3、R55）
  suppressWhenNotice: true,            // site-notice 开启时不渲染 ①（R35）
  copyReviewedAt: '2026-10-05',        // 超过 180 天构建报 W，提醒对照 SE 定位复核
};
```

`seMode(l)`（文档 06）：`perLocale[l].card === false` → `'no-card'`；`l in seLocalePath` → `'local'`；否则 `'en-site'`。三种模式的渲染规则：

| `seMode` | locale | ① | ② | ④ | SE App Store 链接 | 额外文案 |
|---|---|---|---|---|---|---|
| `local` | en、zh-Hant、ja、ko、es、pt-BR、vi、id、th、hi、ar | 渲染（含窗口与 App Store 文字链接） | 渲染 | 渲染 | ① 1 个 | — |
| `en-site` | de、fr、it、nl、pl、ru、tr、uk | 渲染；SE 官网链接加 `hreflang="en"` | 渲染；链接前加界面说明句（文档 08 §7.8） | 渲染（`hreflang="en"`） | ① 1 个 | `sibling.card.uiNote` 替换 `note` |
| `no-card` | zh-Hans | **不渲染**（R42） | 渲染；答案末尾追加 `sibling.availability` | 渲染（链 SE `/zh-hans/`） | **0 个** | `sibling.availability` |

locale JSON 的键（en 为例；键路径与文档 06 v1.1 §4.2 一致）：

```jsonc
"sibling": {
  "card": {                          // ①；no-card 的 locale 不需要（文档 06 L-3）
    "eyebrow": "", "title": "", "body": "",
    "points": ["", "", ""],          // 恰为 3 条，顺序固定（§2.2）；与文档 06 L-11 一致
    "note": "", "uiNote": "",        // uiNote 仅 en-site 必填
    "linkText": "", "appStoreLinkText": "", "shotAlt": "", "shotCaption": ""
  },
  "availability": "",                // 仅 no-card（zh-Hans）必填
  "footer": { "heading": "", "linkText": "" }
},
"faq":   { "items": [ /* …, */ { "id": "english-learner", "q": "", "a": "… [SurfEnglish website](@se-site)" } ] },
"about": { "family": { "title": "", "text": "", "table": { /* … */ }, "closing": "", "links": [ /* 3 条 */ ] } }
```

- 【R74】① 的键统一为 **`sibling.card.*`**（与文档 06 一致）；文档 08 v1.1 jsonc 中的 `sibling.section.*` 机械改名为 `sibling.card.*`（`text` → `body`、`siteLink` → `linkText`、`appStoreAlt` → `appStoreLinkText`、`imageAlt` / `imageCaption` → `shotAlt` / `shotCaption`）；`sibling.languagesTip` 删除（落点 ③ 已取消，R42）。
- 落点 ② 不单设键，就是 `faq.items[english-learner]`；`placements.faq=false` 时隐藏这一问（文档 06 §4.5）。
- `appStoreLinkText` 不含箭头；"→" 由模板以 `<span aria-hidden="true">` 追加，不进锚文本（文档 06 §4.2 的示例带箭头，以本条为准）。
- `points[2]`（从 Safari 分享）本文已核实（§5.1），该条件解除；文档 01 §4.5、文档 03 §4.4、文档 05 §5.9、文档 06 §4.2 原标的"须核实"已在一致性审计中同步改为"已核实"。

构建规则（文档 06 的 lint 编号见括号）：
1. 按上表的模式决定输出哪些落点；`no-card` 的页面不得出现 `id6787367021`（D-11）。
2. `en-site`：用 `card.uiNote` 替换 `card.note`；指向 surfenglish.app 的链接加 `hreflang="en"`。
3. App Store 链接由 `appStoreLink({ appId, placement })` 生成（`ct=wbw-card` / `wbw-about`）；缺少 `pt` 时按文档 06 的降级规则输出并告警，不失败（H3）。
4. `ct` 断言 `/^[a-z0-9-]{1,30}$/`；全站不同 `ct` 值的数量 ≤ 10（R55、ENG-06、D-11）。WBW 自己的 `wbw-about` 与 ⑤ 的 `wbw-about` 字面相同，但分属 WBW 与 SE 两个 App 的 campaign 报表，不冲突。
5. 对 `sibling.*`、`faq.items[english-learner]`、`about.family` 跑禁用词检查（§10；`claims-lint.json` 的 `replacement-tone` 规则按 §5.7 T10 补全各语言写法，L-14），命中就让构建失败。
6. **`sibling.card.title` 必须以 "SurfEnglish" 开头**（全部 locale；R40、PRO-08；L-11），并由文档 03 的 seoLint 对渲染后的 `#surfenglish h2` 再查一次。
7. 缺键时构建失败（L-1）；`no-card` 的 locale 豁免 `sibling.card.*`（L-3）。数组按条数比较：`sibling.card.points` 恰为 3 条、与 en 一致（ENG-08 的数组语义；文档 06 L-11）。
8. **L-11（ENG-08）**：`en-site` 时 `sibling.card.uiNote` 非空且不得出现 "12 <本语言的'语言'一词>"；`no-card` 时 `sibling.availability` 非空；`placements` 的键只能是 `card`、`faq`、`footer`、`about`。
9. `copyReviewedAt` 距构建日超过 180 天报 W。
10. `suppressWhenNotice` 为 true 且 site-notice 开启时，不输出 ①（其余落点不变）。

---

## 4. 20 个 locale 的推荐矩阵【决策】

说明：
- ②④ 在 20 个语言首页全部显示；① 在 19 个首页显示（zh-Hans 除外，R42），site-notice 开启时全部不显示（R35）。
- "SE 链接"是 ①②④ 共用的目标 URL。
- `ct` 只按落点（R3、R55）：① 全部为 `wbw-card`，⑤ 为 `wbw-about`；locale 维度看 GA 的 `page_locale`。
- SE 卡片不用 App Store 徽章（R43），所以不再需要"SE 徽章 locale"一列；WBW 自己的徽章 locale 见文档 06 `LOCALES.badge`。

| locale | WBW 路径 | `seMode` | ① | SE 链接 | `hreflang` | ① App Store 文字链接 | ① ct | 附加说明 |
|---|---|---|---|---|---|---|---|---|
| en | `/` | local | ✓ | `https://surfenglish.app/` | en | ✓ | `wbw-card` | — |
| zh-Hans | `/zh-hans/` | **no-card** | **✗** | `https://surfenglish.app/zh-hans/` | zh-Hans | **✗** | — | 只有 ②④；② 含"未在中国大陆 App Store 上架"（F18、R42） |
| zh-Hant | `/zh-hant/` | local | ✓ | `…/zh-hant/` | zh-Hant | ✓ | `wbw-card` | 用台湾用语（R64） |
| ja | `/ja/` | local | ✓ | `…/ja/` | ja | ✓ | `wbw-card` | — |
| ko | `/ko/` | local | ✓ | `…/ko/` | ko | ✓ | `wbw-card` | 卡片해요체、FAQ 答案합니다체（I18-12） |
| es | `/es/` | local | ✓ | `…/es/` | es | ✓ | `wbw-card` | — |
| pt-BR | `/pt-br/` | local | ✓ | `…/pt-br/` | pt-BR | ✓ | `wbw-card` | — |
| vi | `/vi/` | local | ✓ | `…/vi/` | vi | ✓ | `wbw-card` | — |
| id | `/id/` | local | ✓ | `…/id/` | id | ✓ | `wbw-card` | — |
| th | `/th/` | local | ✓ | `…/th/` | th | ✓ | `wbw-card` | — |
| hi | `/hi/` | local | ✓ | `…/hi/` | hi | ✓ | `wbw-card` | — |
| ar | `/ar/` | local | ✓ | `…/ar/` | ar | ✓ | `wbw-card` | RTL；`A1–C1` 用 `<bdi>`；"右滑"按物理方向写，手势示意不镜像（R63） |
| de | `/de/` | en-site | ✓ | `https://surfenglish.app/` | **en** | ✓ | `wbw-card` | uiNote |
| fr | `/fr/` | en-site | ✓ | 同上 | en | ✓ | `wbw-card` | uiNote |
| it | `/it/` | en-site | ✓ | 同上 | en | ✓ | `wbw-card` | uiNote |
| nl | `/nl/` | en-site | ✓ | 同上 | en | ✓ | `wbw-card` | uiNote |
| pl | `/pl/` | en-site | ✓ | 同上 | en | ✓ | `wbw-card` | uiNote |
| ru | `/ru/` | en-site | ✓ | 同上 | en | ✓ | `wbw-card` | uiNote |
| tr | `/tr/` | en-site | ✓ | 同上 | en | ✓ | `wbw-card` | uiNote |
| uk | `/uk/` | en-site | ✓ | 同上 | en | ✓ | `wbw-card` | uiNote |

合计：`local` 11 个、`en-site` 8 个、`no-card` 1 个；① 19 个页面，全部共用一个 `ct`。

依据：
- 12 个 SE 路径线上全部返回 200，`/de/` 返回 404（研究 05 §6）。
- SE 在 TW/HK/JP/KR/VN/TH/ID/IN/BR/MX/ES/SA/AE/DE/FR/RU/TR/UA/IT/NL/PL/GB 均可下载，中国大陆不可下载（研究 05 §3.5、F18）。

---

## 5. 文案

> 【R75，v1.3】**文档 08 是全站文案（含 SE 推荐文案）的唯一来源。** 本节不再保留第二份定稿文案：v1.1 中 §5.2 / §5.3 / §5.6 的 en / ja / zh-Hans 定稿表，以及 zh-Hant / ko 草案，已改为"键 → 文档 08 位置"的索引（§5.2、§5.3、§5.6）。zh-Hant、ko 与其余 15 种语言一样，按文档 08 §7 的翻译简报，以文档 08 §2 的 en 为母本产出（文档 08 §7.8）。本节保留：写作规则（§5.1）、④ 页脚 20 语言的栏标题与链接文字（§5.5）、改写规则 T1–T11 与 8 种语言的 `uiNote`、17 种语言的 `linkText` 种子（§5.7）。后三项文档 08 没有收录，由文档 08 §7.8 直接引用本节，是这些键现有的唯一取值，不构成第二份文案。键名按 R74 用 `sibling.card.*`（§3.7），以文档 06 §4.2、§4.5 为准（R22）。

### 5.1 通用规则

| 项 | 规则 |
|---|---|
| 长度 | h2：拉丁文字 ≤ 60 字符；CJK/韩文 ≤ 24 字（不含 "SurfEnglish" 与冒号）。正文：≤ 45 词 / ≤ 110 字（品牌名不计）。每条要点 ≤ 45 字符 / ≤ 22 字。note 一行 |
| H2 | 以 "SurfEnglish" 开头，后接 SE 是什么（"daily English news at your level"）；不以"学英语"开头，不写条件句（R40、PRO-08；构建规则 §3.7 第 6 条） |
| 锚文本【R76】 | ① 的 `linkText` 用 **SE 在该语言的核心词短语 + 品牌**（例 en "Read English news at your level with SurfEnglish"，定稿以文档 08 为准），链接到 SE 对应语言页（`en-site` 链 SE 英文页，见 §5.7 T7）；这是全页唯一一处精确关键词锚（研究 07 §7.4、文档 03 §3.7）。① 的 `appStoreLinkText` 用本地化的 "Get SurfEnglish on the App Store"，"→" 由模板追加、不进锚文本。② 用品牌锚"SurfEnglish 官网 / SurfEnglish website"；④ 用 SE 的本地化 App Store 名（专名）；⑤ 只用品牌锚。**任何落点都不用裸域名 "surfenglish.app" 作锚文本**（R43 括注中的 "surfenglish.app" 指链接目标）。同页锚文本互不重复 |
| 叙事 | 条件 → WBW 用途 → 互补（R40）。WBW 的用途写"读你自己打开的任何网页和 X 帖子，英文或其他语言"；不把英语"让给" SE（PRO-01） |
| 能力边界：可写（SE） | 分级英语新闻（A1–C1）、复习小游戏（Sentence Builder / Word Raid，由你翻译过的句子和查过的词生成）、从 Safari 分享英文文章进 App（见下"分享扩展"行）、译文在原文下方、内置浏览器（只作事实陈述，不作卖点）、右滑翻译与双击查词（与 WBW 共有，只作从句）、界面 12 种语言、译文 21 种语言、免费开始、iPhone/iPad（F18、基线 §B.3、SE 官网 `src/locales/en.json` 的 games 段） |
| 能力边界：语音 | 与 WBW 对比时，SE 的语音必须带"AI / 神经"限定（"natural AI English voices on your device"），WBW 一侧同时写明"云端 AI 语音或设备上的 iOS 语音"；**不得**把端侧/离线语音写成 SE 独有卖点（R41、PRO-03、F16）。① ② 中不写语音 |
| 能力边界：分享扩展 | 【事实】SE 有分享扩展：SE iOS 仓库的 `SurfEnglishShare` target（`project.pbxproj:237-257`，`productType = com.apple.product-type.app-extension`；`SurfEnglishShare/Info.plist`：`com.apple.share-services`，接受 1 个 Web URL / Web Page），由提交 `8cc50ed`（2026-09-14，"从其它 App 分享网址到 SurfEnglish，用自由探索打开"）加入，合入 v1.3.0（`40d7f85`），当前 `MARKETING_VERSION = 1.3.1`。【推断】App Store 现行 1.3.1 包含该扩展（F18）。【决策】已核实，作为 ① 的第 3 条要点使用（R41）；措辞限定为"从 Safari 分享**英文**文章进 App"，不得写成"任何 App 里的任何网页"，也不与 WBW 对比（不写"WordByWord 没有"）。SE 官网 `src/locales/en.json` 目前没有提到分享扩展，§8.0 建议 SE 侧补充；`copyReviewedAt` 复核时一并检查该能力是否仍在 |
| 能力边界：不写 | 价格、评分、下载量、标签页数量、AI Natural Translation、"faster / 更高效"、"X posts and podcasts"、Word Stack / Word Grid 等"即将推出"的游戏 |
| WBW 的表述 | "在内置浏览器里读你打开的网页和 X 帖子、右滑段落"（F14）；不写"整页翻译"或"任何 App 里" |
| 称谓与语体 | 跟随该语言页 WBW 正文的称谓（du/Sie、tu/vous 等）。ko：卡片、按钮、链接用해요체；FAQ 答案与 meta description 用합니다체；同一段落不混用（I18-12） |
| 用语 | zh-Hant 正文用台湾用语（貼文、點兩下、介面、取得），引用 App 按钮名时照 App（R64） |
| 品牌名 | SurfEnglish、WordByWord、App Store、Sentence Builder、Word Raid 不翻译 |
| 数字 | 等级、语言数用占位符 `{se.levels}`、`{se.uiLanguages}`、`{se.targetLanguages}`（文档 06 `product.json` 的 `se`）；句式避免"from {se.levels}"这类代入后不通的结构，写成"at levels {se.levels}"（PRO-10） |

### 5.2 ① 兄弟卡片（键 → 文档 08 位置索引，R75）

| 键（`sibling.card.*`，R74） | en | ja | zh-Hans | zh-Hant、ko 与其余 15 种 |
|---|---|---|---|---|
| `eyebrow`、`title`、`body`、`points[0–2]`、`note`、`linkText`、`appStoreLinkText`、`shotAlt`、`shotCaption` | 文档 08 §2 jsonc `sibling.card` | 文档 08 §3 jsonc `sibling.card` | 不渲染 ①（`no-card`，R42；L-3 豁免） | 按文档 08 §7 翻译简报产出，母本为文档 08 §2；按语言规则见文档 08 §7.8 与本文 §5.7 |
| `uiNote`（仅 `en-site`） | — | — | — | de / fr / it / nl / pl / ru / tr / uk：本文 §5.7 的 uiNote 表（文档 08 §7.8 引用） |
| `linkText` 的按语言种子 | — | — | — | 本文 §5.7 的 linkText 表（T7；R76） |
| `sibling.availability`（仅 `no-card`） | — | — | 文档 08 §4 jsonc `sibling.availability`（v1.3 已从 `faq.items[english-learner].a` 移入此键，文档 08 S27） | — |

- 文档 08 v1.3 的 jsonc 已按 R74 改用 `sibling.card.*` / `sibling.footer.*`（§3.7），入库不需要再改名。
- 长度、H2 前缀、卖点、锚文本等写作规则见 §5.1；构建检查见 §3.7 第 5–8 条与 A18。
- v1.1 本节的 en / ja 定稿表与 zh-Hant / ko 草案已删除（R75），不再作为译者母本。

### 5.3 ② FAQ（`faq.items[english-learner]`；键 → 文档 08 位置索引，R75）

| 键 | en | ja | zh-Hans | 其余 17 种 |
|---|---|---|---|---|
| `faq.items[english-learner].q`、`.a`（答案末尾是指向 SE 官网的品牌锚链接 `@se-site`，R76） | 文档 08 §2 jsonc `faq.items` | 文档 08 §3 jsonc `faq.items` | 文档 08 §4 jsonc `faq.items`；模板在答案末尾追加 `sibling.availability`（§3.2） | 按文档 08 §7 翻译简报产出；`en-site` 的 8 种在链接前加一句界面说明（文档 08 §7.8） |

- 问法是"有什么不同"，不是"该用哪个"（R40）；答案不出现"更合适 / better fit"。
- PRO-01 建议的 "Many people use both" 不采用：无法核实（G5），改为"两款可以一起用"。
- 语音不进 FAQ（R41）；v1.0 的"on-device voices that work offline"整句删除。
- v1.1 本节的 en / ja / zh-Hans 定稿与 zh-Hant / ko 草案已删除（R75）。

### 5.4 ~~③ 语言段提示~~（已删除，R42）

v1.0 的 `sibling.languagesTip`（en/ja/zh-Hans/zh-Hant/ko 五条）全部作废，不进 locale JSON，也不进翻译简报。

### 5.5 ④ 页脚（20 种语言全量）

> R75：本节是 ④ 的按语言取值，文档 08 没有另存（文档 08 §7.8 直接引用本表），因此不构成第二份文案；文档 08 收编后，本节改为索引行。链接文字是专名，不是裸域名（R76）。

栏标题 `sibling.footer.heading`（键名按文档 06 v1.1 §4.2）：

| locale | heading | locale | heading |
|---|---|---|---|
| en | More from the maker | it | Dallo stesso sviluppatore |
| zh-Hans | 同一开发者的其他 App | nl | Van dezelfde ontwikkelaar |
| zh-Hant | 同一開發者的其他 App | pl | Od tego samego twórcy |
| ja | 同じ開発者のアプリ | ru | От того же разработчика |
| ko | 같은 개발자의 다른 앱 | tr | Aynı geliştiriciden |
| es | Del mismo desarrollador | uk | Від того самого розробника |
| pt-BR | Do mesmo desenvolvedor | vi | Cùng nhà phát triển |
| fr | Du même développeur | th | จากผู้พัฒนาเดียวกัน |
| de | Vom selben Entwickler | id | Dari pengembang yang sama |
| ar | من المطوّر نفسه | hi | इसी डेवलपर से |

链接文字 `sibling.footer.linkText` 直接取 SE `src/locales/<l>.json` 的 `meta.appStoreName`（App Store 上的正式名称，属于专名，不另造关键词锚；与 ① 的 `linkText` 不重复，符合文档 03 §3.7"页脚只用品牌"的意图）：
- en "SurfEnglish: Bilingual News"
- zh-Hans "SurfEnglish：英语新闻·双语对照"
- zh-Hant "SurfEnglish：英文新聞·雙語對照"
- ja "SurfEnglish：英語ニュース・対訳で学習"
- ko "SurfEnglish: 영어 뉴스 원문·번역"
- es "SurfEnglish: Inglés y noticias"
- pt-BR "SurfEnglish: Inglês e notícias"
- vi "SurfEnglish: Đọc tin tiếng Anh"
- id "SurfEnglish: Berita Inggris"
- th "SurfEnglish: ข่าวอังกฤษแปลคู่"
- hi "SurfEnglish: इंग्लिश न्यूज़"
- ar "SurfEnglish: أخبار إنجليزية"
- de/fr/it/nl/pl/ru/tr/uk 统一用 "SurfEnglish: Bilingual News (EN)"，这些店面的实际名称就是这个（研究 05 §3.5）；链接加 `hreflang="en"`
- 文档 02 v1.1 §10.1 把页脚写作"SurfEnglish — <本地化描述>"，以本表为准（同一含义：品牌 + SE 在该语言的店面副标题）

### 5.6 ⑤ `/about/` 家族说明（en；键 `about.family`；索引，R75）

| 键 | 位置 |
|---|---|
| `about.family.{title, text, table{head[], rows[]{label, wbw, se}}, closing, links[]}` | 文档 08 §5.2 jsonc `about.family`（键结构见文档 08 §1.5 S15） |

v1.1 本节的定稿文案已删除（R75）。文档 08 §5.2 的 `about.family` 须满足以下约束（沿用 v1.1 对 v1.0 的修正）：
- 不写 "SurfEnglish came later … meant for different readers"：前半句暗示先后与继承，后半句是分流框架（R40、PRO-13）。
- 对照表 "Read aloud" 行按 PRO-03 写：两边都如实写出端侧能力，SE 一侧带 "AI" 限定；这是对照表里的并列描述，不是 SE 的独有卖点（R41）。SE 列不写 "also offline"：WBW 能否离线未验证（H13），单方写 offline 仍构成不对称对比（与文档 08 §5.2 `family.table` 一致）。
- 结语不写 "If you read in more than one language, WordByWord is the one built for that. If English is your focus, SurfEnglish adds …"（分流 + "focus" 暗示 SE 更适合英语学习者，PRO-01）；按 R40 写成"想读什么都用 WordByWord；学英语、还想要分级新闻和复习游戏时，SurfEnglish 也值得一试，两款可以一起用"。
- 链接只用品牌锚（§5.1），链接预算见 §3.5。

对照表各行的事实依据：
- 共用阅读引擎：研究 05 TL;DR #4
- X 是首推场景：研究 05 §2.2
- CJK 不支持双击查词，Chunks/Action Flow 仅英语：F15
- 历史记录、复习游戏：研究 05 §4；SE 官网 `src/locales/en.json` games 段
- 语音：WBW 云端 AI 朗读与 Local Read（设备内置语音，Free/Plus 均不限，F16、研究 05 §2.5）；SE 端侧神经语音 Kokoro、可离线（SE 官网 `src/locales/en.json` voice 段）
- 语言数：F15 / F18
- 大陆：F18

### 5.7 其余 17 种语言的改写规则（zh-Hant、ko 与 15 种 T2/T3 语言）

翻译资产来源：`js/surfenglish-promo.js:59-440` 的 I18N 表（20 种语言、键齐全，研究 04 §2.4）。先用 §9 第 2 步抽进 `src/locales/_legacy/`（文档 06 §4.5），再以文档 08 §2 的 en 为母本、按文档 08 §7 的翻译简报和下面的规则改写（R75）。v1.1 中 zh-Hant、ko 另有本文草案，现已删除，这两种语言同样按本节规则产出，并遵守 §5.1 的 zh-Hant 台湾用语与 ko 语体规则。

| # | 规则 | 示例（de） |
|---|---|---|
| T1 | 删除：`label`（New/Neu…）、`tagline`、`bar.*`、`promo.title/lead`（旧定位），所有 "faster/schneller" 类效果承诺，以及 `chips[2]`（端侧 AI 语音，R41） | — |
| T2 | eyebrow：`promo.eyebrow` 去掉 "New ·" 前缀，"Machern/créateurs/team" 改为单数"开发者" | Neu · Von den Machern von WordByWord → **Vom Entwickler von WordByWord** |
| T3 | title：以 "SurfEnglish: " 开头，后接"符合你水平的英语新闻"；**不写条件句**（R40、PRO-08） | **SurfEnglish: Englische Nachrichten auf deinem Niveau** |
| T4 | body：条件 → WBW 用途 → 互补（同样的手势只作从句）→ 一起用；"Wischen/Doppeltippen"等术语沿用 `chips[1]` 的译法；不得出现"passt vielleicht besser"一类替换性措辞（T10） | **Lernst du vor allem Englisch? Mit WordByWord liest du jede Seite und jeden Post, den du öffnest – auf Englisch oder in einer anderen Sprache. SurfEnglish ist eine weitere Art zu üben – mit demselben Wischen und Doppeltippen. Beide Apps lassen sich nebeneinander nutzen.** |
| T5 | points：恰好 3 条，顺序固定。`chips[0]` 改成"每日分级英语新闻 + {se.levels}"，`chips[3]` 改成"用自己读过的内容生成的复习游戏"，第 3 条"从 Safari 分享英文文章"没有旧译文，按 en 新译；`chips[1]`（两款共有）与 `chips[2]`（语音）不进列表；避免 "von {se.levels}" 一类代入后不通的结构（PRO-10） | **Tägliche englische Nachrichten auf Niveau {se.levels} ／ Wiederholungsspiele aus deiner eigenen Lektüre ／ Englische Artikel aus Safari in die App teilen** |
| T6 | note：SE 支持的 9 种语言（zh-Hant/ko/es/pt-BR/vi/id/th/hi/ar）写"界面含本语言等 {se.uiLanguages} 种"；8 种无 SE 界面的语言改用下表的 `uiNote`，写成"英语和另外 11 种"，**不得出现 "12 <本语言的'语言'一词>"**（PRO-11） | 见下表 |
| T7 | linkText（R76）：用 SE 在该语言的核心词短语 + "SurfEnglish"，语义以文档 08 §2 en 的 `linkText` 为准；9 种 SE 有界面的语言用 SE 核心词（下表），链 SE 同语言页；8 种 `en-site` 语言用本语言描述，加"（英文网站）"，链 SE 英文页；不用裸域名 "surfenglish.app" 作锚文本 | **Englische Nachrichten zweisprachig lesen – SurfEnglish (Website auf Englisch)** |
| T8 | appStoreLinkText：用 Apple 徽章文案在该语言的动词，加 "SurfEnglish"；它是文字链接，不做成徽章（R43） | **SurfEnglish im App Store laden** |
| T9 | 称谓与语体跟随该语言页 WBW 正文；ar 的"右滑"按物理方向写"向右滑"，手势示意不镜像（R63） | — |
| T10 | 禁用替换性措辞（进 §3.7 第 5 条的禁用词表）：de "passt vielleicht besser / besser geeignet"；fr "vous conviendra peut-être mieux / plus adapté"；es "puede encajarte mejor / más adecuada"；pt-BR "pode combinar melhor / mais adequado"；it "potrebbe fare più al caso tuo / più adatta"；nl "past misschien beter"；pl "może lepiej pasować"；ru "может подойти лучше"；uk "може підійти краще"；tr "daha uygun olabilir"；vi "có thể phù hợp hơn"；id "mungkin lebih cocok"；th "อาจเหมาะกว่า"；hi "ज़्यादा उपयुक्त"；ar "قد يناسبك أكثر"。这是 lint 的种子词表，母语审校时补全 | — |
| T11 | 审校按 R36（H7）与 R80：en 母版不设外部母语审校前置，由用户通读 + 双模型互检（可读性、事实、禁用表述）后上线（R80）；T1（ja、zh-Hans、zh-Hant、ko）上线前母语审校；其余 15 种以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校，th/hi/ar/tr/uk/pl 优先 | — |

**8 种语言的 `uiNote`（定稿草案，替换 note）**

| locale | uiNote |
|---|---|
| de | Kostenlos starten · Die App-Oberfläche gibt es nicht auf Deutsch (Englisch und 11 weitere Sprachen) · Übersetzungen ins Deutsche sind möglich |
| fr | Gratuit pour commencer · L’interface de l’app n’existe pas en français (anglais et 11 autres langues) · Traductions vers le français disponibles |
| it | Gratis per iniziare · L’interfaccia dell’app non è disponibile in italiano (inglese e altre 11 lingue) · Traduzioni in italiano disponibili |
| nl | Gratis om te beginnen · De app-interface is niet in het Nederlands (wel in het Engels en 11 andere talen) · Vertalingen naar het Nederlands mogelijk |
| pl | Za darmo na start · Interfejs aplikacji nie jest dostępny po polsku (angielski i 11 innych języków) · Tłumaczenia na polski są dostępne |
| ru | Бесплатный старт · Интерфейс приложения не переведён на русский (английский и ещё 11 языков) · Переводить на русский можно |
| tr | Ücretsiz başlayın · Uygulama arayüzü Türkçe değil (İngilizce ve 11 dil daha) · Türkçeye çeviri yapılabilir |
| uk | Безкоштовний старт · Інтерфейс застосунку не має української (англійська та ще 11 мов) · Перекладати українською можна |

- v1.1 修正：de 原稿的 "(u. a. Englisch, insgesamt 12 Sprachen)" 与 A6 冲突（PRO-11）；pl "(m.in. angielski, łącznie 12 języków)"、tr "(İngilizce dahil 12 dil)" 同理统一为"英语和另外 11 种"。
- "11" 是 `{se.uiLanguages} − 1`，由译者直接写成数字（文档 08 §7.8）；数字写死，所以不涉及 R62 的复数占位符；ru/uk/pl 的 "11" 后接复数属格，语法已核对。

**① 的 linkText 种子（其余 17 种语言；R76，翻译时语义以文档 08 §2 en `linkText` 为准）**

| locale | linkText |
|---|---|
| zh-Hant | 英文新聞雙語對照閱讀 — SurfEnglish |
| ko | 영어 뉴스를 원문과 번역으로 — SurfEnglish |
| es | Noticias en inglés con traducción — SurfEnglish |
| pt-BR | Notícias em inglês com tradução — SurfEnglish |
| vi | Đọc tin tiếng Anh song ngữ — SurfEnglish |
| id | Berita bahasa Inggris dengan terjemahan — SurfEnglish |
| th | ข่าวอังกฤษแปลคู่ — SurfEnglish |
| hi | अनुवाद के साथ अंग्रेज़ी खबरें — SurfEnglish |
| ar | أخبار إنجليزية مع الترجمة — SurfEnglish |
| de | Englische Nachrichten zweisprachig lesen – SurfEnglish (Website auf Englisch) |
| fr | Lire l’actualité en anglais avec traduction – SurfEnglish (site en anglais) |
| it | Notizie in inglese con traduzione – SurfEnglish (sito in inglese) |
| nl | Engels nieuws tweetalig lezen – SurfEnglish (Engelstalige website) |
| pl | Wiadomości po angielsku z tłumaczeniem – SurfEnglish (strona po angielsku) |
| ru | Новости на английском с переводом — SurfEnglish (сайт на английском) |
| tr | İngilizce haberleri çeviriyle okuyun – SurfEnglish (İngilizce site) |
| uk | Новини англійською з перекладом — SurfEnglish (сайт англійською) |

（zh-Hant、ko 两行取自 v1.1 已删除草案中的 `linkText`。）

② 在这 17 种语言里按文档 08 §2 en 版语义翻译，同样适用 T1–T11；FAQ 答案中的"中国大陆"一句只出现在 zh-Hans；`en-site` 的 8 种语言在链接前加一句界面说明（文档 08 §7.8 的 en 模板）。

---

## 6. 素材

### 6.1 选择与理由【决策，R44 取代 R11 的选图部分】

| 角色 | 文件 | 用于 | 理由 |
|---|---|---|---|
| **主图（窗口）** | SE `public/images/screenshots/games-home.jpg`（720×1565，118,596 B，提交 `dbe6bfa` 2026-07-25）的上部裁切 | ① 桌面版 | 展示 WBW **没有**的功能（复习游戏），与卡片卖点一致；内容中性：没有第三方新闻、没有真实人名或品牌（R32）；符合 U2④（SE 官网现有截图） |
| 备选 | `game-word-raid.jpg`（720×1565，2026-07-25） | 主图不可用时 | R44 指定的备选；像素风游戏画面，使用前需目视确认与"纸与墨"纸面的反差可接受 |
| 不用 | `feed-chunks.jpg`（v1.0 主图）、`feed-translation.jpg`、`home-feed.jpg` | — | 新闻 feed 含真实人名/名人新闻标题（例如 "Adam Driver & Anne Hathaway"，R11、R32）；R44 规定不再使用任何新闻 feed 截图 |
| 不用 | `browser.jpg`、`explore.jpg` | — | 讲的是"SE 浏览器里也能右滑"，即两款的**相同点**；`browser.jpg` 还有 BBC 字标占画面 1/4（R32） |
| 不用 | `word-lookup.jpg`、`chunk-list.jpg`、`game-sentence-builder.jpg` | — | 查词、语块是两款共有能力；Sentence Builder 已出现在主图中 |
| 不用 | WBW 仓库 `img/surfenglish/*`（600×1304，旧底栏 "X"） | — | 研究 04 §2.8，随临时方案一起删除 |
| SE 图标 | SE `public/icons/appicon-1024.png` | ①（32 px）、④（20 px）、⑤（32 px） | 官方母版；WBW 仓库里 `icon-192.png` 的 md5 与它不同，是另外导出的版本（研究 04 §2.8） |

**裁切坐标【决策；已用 Read 目视确认】**：在 720×1565 的原图上取 **x 0–720、y 128–928**（720×800），再缩到 **400×444**（宽高均为偶数，R8），CSS 显示 **200×222 px**（2x）。

| 区域 | 原图 y 坐标（约） | 处理 |
|---|---|---|
| 状态栏 9:41 | 0–100 | 裁掉（与 R67 的思路一致：不展示原始状态栏） |
| 留白 | 100–128 | 裁掉 |
| "Games" 标题 | 155–210 | 保留（顶部留约 30 px 呼吸） |
| 统计卡 "6 Sentences ready / 17 Words collected" | 222–348 | 保留 |
| "PLAY NOW" + Sentence Builder 卡 + Word Raid 卡 | 405–900 | 保留（Word Raid 卡底边在约 y 900，下方留约 28 px） |
| "COMING SOON"（Word Stack / Word Grid，灰色未上线） | 935–1330 | 裁掉：不展示未上线的功能 |
| 底部 tab 栏（含旧版 "X" tab） | 1375–1490 | 裁掉：旧 UI |
| Ambience / Track | 1365–1565 | 裁掉 |

【事实】截图是 2026-07-25 的（1.3 之前），但 SE iOS 的 `Games/GameHome/GameHomeView.swift` 自 2026-07-21 之后只有一次触感反馈相关的提交（`3685600`，2026-09-03），布局与文案键未变。【推断】保留区域与 1.3.1 的实际画面一致；作为 H11 素材确认的一项请用户目视确认。截图界面是英文，所以非 en 页面的 `shotCaption` 注明"英语表示/英文介面"。

### 6.2 处理规格与命令（本机 sips，F33；2026-10-05 在 scratchpad 实测）

| 输出 | 尺寸 | 实测体积 | 预算 |
|---|---|---|---|
| `se-games.avif`（资产键 `se/common/games`，`SIBLING.cardImage`） | 400×444（显示 200×222，2x） | 7,804 B（`formatOptions 50`） | ≤ 12 KB |
| `se-games.jpg`（回退） | 400×444 | 25,191 B（`formatOptions 70`） | ≤ 30 KB |
| `se-icon-64.png` | 64²（① ⑤ 的 32 px @2x） | 3,078 B | ≤ 4 KB |
| `se-icon-40.png` | 40²（④ 的 20 px @2x） | 1,523 B | ≤ 2 KB |

- 实测回解：`sips -s format png` 把 AVIF 解回 PNG，尺寸 400×444、`hasAlpha: no`，目视画面完整。按 R79，sips 回解只作辅助检查；"白板图"闸门是**结构检查（偶数宽高、分块）+ Chrome headless 实际解码后的 alpha 抽样**（文档 06 §7.5 的 `scripts/check-images.mjs`）。
- 对照：同一裁切不缩放（720×800）时 AVIF q50 为 14,845 B、JPEG q60 为 48,414 B；400 宽已足够 200 px 显示的 2x。
- v1.0 的 `se-feed-window.*`（536×700）、`se-icon-96`、`se-icon-144` 以及 SE 卡片用的 App Store 徽章 SVG 全部作废。WBW 自己的徽章由文档 05/06 管理。

① 在桌面首次加载时约增加 11 KB（AVIF + 图标），手机上不加载截图，只增加约 3 KB，符合基线 §E 的整页图片 ≤ 1.2 MB。

```sh
# 输出目录、脚本名、指纹路径以文档 06 §7 为准（R8）；下面用 $OUT 代替
SE=/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite/public; T="$TMPDIR/se-crop"; mkdir -p "$T"
sips -s format png "$SE/images/screenshots/games-home.jpg" --out "$T/full.png"   # sips 只转格式，不裁切（R79）
node "$CROP" "$T/full.png" 0 128 720 800 "$T/crop.png"   # 在 node 中裁切（x y w h）：解码 PNG → 裁切 → 编码，参照原型 tools/png.mjs；脚本名以文档 06 §7 为准
sips -z 444 400 "$T/crop.png" --out "$T/w400.png"            # 先缩放成 PNG，只做一次有损编码
sips -s format avif -s formatOptions 50 "$T/w400.png" --out "$OUT/se-games.avif"
sips -s format jpeg -s formatOptions 70 "$T/w400.png" --out "$OUT/se-games.jpg"
sips -s format png "$OUT/se-games.avif" --out "$T/decoded.png"   # 辅助检查，不作闸门；闸门由 check-images.mjs 执行（R79）
for s in 40 64; do sips -z $s $s "$SE/icons/appicon-1024.png" --out "$OUT/se-icon-$s.png"; done
```

- 不用 `sips -c … --cropOffset` 裁切（R79）：原型 `tools/build-images.mjs` 实测，偏移为 "0 0" 时 sips 会退回居中裁切，矩形贴到底边时会原样返回整图，两种情况都不报错。sips 只做缩放与格式编码。
- 构建只负责复制和加指纹（基线 §D）；SE 截图更新时手动重跑上面这段。原型 `tools/build-images.mjs` 中的 `se/feed-window` 条目应改为本节的 `se/common/games`（文档 06 `SIBLING.cardImage`）（原型不在本文修改范围，由文档 05/原型维护者同步）。

---

## 7. 链接与度量

### 7.1 链接属性【决策】

| 属性 | 取值 | 理由 |
|---|---|---|
| `rel` | 不写（不加 nofollow/sponsored/ugc） | 同一开发者的编辑性推荐，没有付费（研究 06 §5.1；Google 的说法是 nofollow 只用于不信任的来源） |
| UTM | 不带 | SE 站没有统计，UTM 无人接收，还会制造带参数的 URL（研究 10 §2 C11、F23） |
| `target` | 不写（同窗口打开） | 打开新窗口需要额外提示（研究 04 A2）；在 iOS 上点 App Store 链接本来就会切到 App Store App |
| `hreflang` | 目标页的语言 | 8 种语言链英文页，属性和可见的"（英文网站）"同时说明 |
| 两站之间的 canonical 和 hreflang 簇 | 不用 | 基线 §B.5、F35；文档 02 §10.3 |
| Smart App Banner | 只放 WBW 的 `app-id` | 一页只能放一个；WBW 身份不变（研究 06 §5.2、§7.1） |
| SE 侧 Referrer | SE 的 `_headers` 已设 `strict-origin-when-cross-origin` | WBW 的 GA4 能把来自 surfenglish.app 的会话识别为 referral，不需要 UTM |

### 7.2 App Store campaign link 与 `ct` 取值【R3、R55】

格式（F28）：`https://apps.apple.com/app/apple-store/id6787367021?pt=<PT>&ct=<ct>&mt=8`。`pt` 待提供（H3），缺失时的降级见 §3.7 第 3 条。**`ct` 只按落点，不按 locale**；locale 维度看 GA 的 `page_locale`。

| 方向 | App | 落点 | ct |
|---|---|---|---|
| WBW → SE | SE `id6787367021` | ① 兄弟卡片 | `wbw-card` |
| WBW → SE | SE `id6787367021` | ⑤ `/about/` 家族说明 | `wbw-about` |
| SE → WBW | WBW `id6741724502` | SE `/about/` 的 "Also by Jinlong" 一节（§8.3） | `se-about` |

- 共 3 个取值，最长 9 个字符，满足 ≤ 30 的上限。② ④ 不放 App Store 链接，所以没有 ct；zh-Hans 页没有任何 SE App Store 链接。
- WBW 自己的 App Store 链接同样只按落点（`wbw-hero`、`wbw-pricing`、`wbw-cta`、`wbw-ext`…，R55，定义见文档 03/06）。`wbw-card` / `wbw-about` 归属 **SE 这个 App** 的 campaign 报表，与 WBW 自己的 `wbw-*` 不在同一张报表里，不会混淆；全站不同 ct 值总数 ≤ 10（§3.7 第 4 条）。
- 两款 App 属于同一开发者账号（F19），共用同一个 `pt`。
- v1.0 的"落点 × locale"共 20 个取值（`wbw-card-en` … `wbw-about-en`）与 `ctMode` 降级开关一并作废。
- 【事实】ASC 的 campaign 数据要求活动开始满 24 小时、首次下载至少 5 次才会显示（研究 06 §7.2，R3 的理由）。即使只按落点，`wbw-about` 也可能长期不到门槛。【建议】看总量时用 ASC 的 Web Referrer `word-by-word.app` 维度兜底（⚠️ 上线后验证这个维度确实存在）。

### 7.3 GA4 事件

沿用 `analytics.js` 的约定：显式写的 `data-ga-event` 优先，所以 SE 的 App Store 文字链接点击不会算进 WBW 的 `app_store_click`（研究 04 §2.5）。

| 落点 | 元素 | event | label |
|---|---|---|---|
| ① | App Store 文字链接 | `surfenglish_promo` | `card_appstore` |
| ① | 官网链接 | `surfenglish_promo` | `card_site` |
| ① | 曝光 | `surfenglish_promo_view` | `card` |
| ② | 官网链接 | `surfenglish_promo` | `faq_site` |
| ④ | 官网链接 | `surfenglish_promo` | `footer_site` |
| ⑤ | 官网 / App Store / SE about | `surfenglish_promo` | `about_site` / `about_appstore` / `about_maker` |

- 旧 label（`bar_app_store`、`bar_site`、`bar_dismiss`、`section_app_store`、`section_site`）停用。做前后对比时，`section_*` 对应 `card_*`。上线当天在 GA4 里加注释。文档 06 v1.1 §8.3 已按本表改写（R3）。
- v1.0 的 `langhint_anchor` 随落点 ③ 删除（R42），从未上线，不需要对照。
- locale 不写进 label，由已有的 `page_locale` 参数提供。需要在 GA4 后台把 `event_label`、`page_locale` 注册成事件级自定义维度（研究 04 §2.5 指出现在无法验证是否已注册）。
- 文档 03 v1.0 §4.4 的 label/ct 格式（`<slot>-<locale>`）已被 R3 取代；文档 03 v1.1 §4.4 第 6–7 条已与本表一致。

**曝光事件的取舍**【决策：做，范围限定在 ①；R3】

| 方面 | 内容 |
|---|---|
| 价值 | 没有曝光就算不出点击率，"没人看到"和"看到了没点"无法区分（研究 04 §2.5 缺口） |
| 隐私 | 不采集新的数据类别，与已有 GA 用同一套同意机制（H6；默认 `consentMode='off'`）。不写 cookie 或 localStorage，也不采集滚动深度序列 |
| 成本 | 每次页面加载最多 1 个事件；`analytics.js` 增加约 20 行通用代码 |

```js
// analytics.js 增量：通用 data-ga-view（每页每元素最多一次）
if ('IntersectionObserver' in window && typeof window.gtag === 'function') {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el);
    window.gtag('event', sanitizeEventName(el.dataset.gaView), {
      event_category: 'site_interaction', event_label: el.dataset.gaLabel || '',
      page_path: location.pathname, page_locale: document.documentElement.lang || '' });
  }), { threshold: 0.5 });
  document.querySelectorAll('[data-ga-view]').forEach((el) => io.observe(el));
}
```

### 7.4 成功指标与评估周期

| 指标 | 定义 | 来源 | 判读 |
|---|---|---|---|
| V 曝光率 | `surfenglish_promo_view` / 渲染 ① 的 19 个首页的 `page_view` | GA4 | 有多少访客滚到了 ① |
| C1 卡片点击率 | (`card_site` + `card_appstore`) / V，按 `page_locale` 分 | GA4 | 卡片本身是否有效 |
| C2 千次点击 | 全部 `surfenglish_promo` 点击 / 1,000 次首页 `page_view` | GA4 | 与旧基线（`bar_*` + `section_*`，H2）比较，**预期会下降**，因为去掉了固定条和黑色徽章，这是可以接受的代价 |
| D 归因下载 | SE 的 ASC Campaigns 中 `wbw-card`、`wbw-about` 的首次下载数；Web Referrer 维度 | ASC | 真实收益 |
| R 反向流量 | 来源为 surfenglish.app 的会话数 | WBW GA4 | ⑥ 是否起作用 |
| G1 护栏 | WBW 自己的 `app_store_click` / `page_view`，其中单看价格区（label `pricing`）与最终 CTA | GA4 | 不得低于改版前基线；价格区恢复 WBW 徽章后应高于原型方案（R43） |
| G2 护栏 | GSC 中 "wordbyword" 查询的 28 天平均排名 ≤ 2.0（现为 1.6，F25）；7 日均值连续 7 天 > 3.0 时启动排查 | GSC | 推荐不能稀释品牌页（R18） |

评估节奏：
- T+2 周：检查事件和 ct 是否正常（DebugView、ASC 中是否出现 campaign）。
- T+8 周：第一次评估。
- 之后每季度一次，同时对照 `copyReviewedAt` 复核 SE 的定位是否有变化。

预期量级【推断】：GSC 28 天只有 71 次点击（F25），SE 相关点击每月大概是个位数到低两位数。因此评估看比率和方向，不设绝对目标。没有 H2 基线时，上线后的前 8 周就作为基线。

决策规则：
- C1 在 V ≥ 1,000 时仍低于 0.5%：改 title 和 text 措辞（按顺序改动并加注释，不做 A/B 测试；改动仍须遵守 R40 与 §10）。
- G1 下降超过 10%：先检查 ① 的体量和位置，以及价格区徽章是否存在。
- 有 GSC 国家数据后（H1），en 页英语国家占比超过 70%：en 页关掉 ①，只保留 ②④。

---

## 8. SE 官网侧配套改动（SE 仓库独立 PR）

仓库：`/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite`，分支模型：main → preview，`cloudflare-deploy` 为生产（F22）。行号按 2026-10-05 的 SE main（`7c464b6`）核对。授权与排期见 H14；合并时点按 R51（§8.4）。

### 8.0 PR 清单（编号与文档 03 §5.5 对齐，新增 S7）

| # | 内容 | 依据 | 所属 PR |
|---|---|---|---|
| S1 | Person 增加 `alternateName: "Chi Jinlong"`，用**新字段** `makerAltName` 输出；**不改** `makerFullName`，可见署名保持 "Jinlong"；顺带修掉 about 可见文本 "Jinlong (Jinlong)" 的重复 | R17、U4（取代文档 03 §5.5 S1"makerFullName 改为 Chi Jinlong"） | PR-SE-1 |
| S2 | Person `sameAs` 增加 App Store 开发者页，两站逐字一致 | R17、H15 | PR-SE-1 |
| S3 | Person `description` 写明两款 App 同一作者 | 文档 03 §5.5 | PR-SE-1 |
| S4 | about 新增 "Also by Jinlong: WordByWord" 一节；措辞不出现 "earlier app"、"better fit" | R40、PRO-13、基线 §F⑥ | PR-SE-1 |
| S5 | 页脚 "More from the maker"：先统一链 WBW 根（`localized:false`），再按 locale 链 WBW 语言页（`localized:true`） | 基线 §F⑥、R51 | PR-SE-1（链根）/ PR-SE-2（按 locale） |
| S6（可选） | `applicationCategory` 改为 `EducationalApplication`；`og:locale` 改 `ll_CC` | F23、文档 03 §5.5 | 不阻塞 |
| **S7** | 防蚕食：12 个 locale 的 `explore.title` 加"英文"限定；从 `meta.keywords` 删除归属 WBW 的词；SE build 加镜像 lint | R52、SEO-03、基线 §B.4 | PR-SE-1 |

- 小节号沿用 v1.0（§8.4 上线顺序、§8.5 验收），供文档 03 §5.5 与本文 A20 引用；S7 的细节在新增的 §8.6。
- 另（不属于 S1–S7，不阻塞）：WBW 侧 ① 的第 3 条要点写了"从 Safari 分享英文文章进 App"（§5.1 已核实），SE 官网目前没有宣传这项能力。建议 SE 维护者在 SE 官网功能列表或 FAQ 补一句，让两站说法同源。

### 8.1 Person（S1–S3；R17）

| 文件:行 | 现状 | 改为 |
|---|---|---|
| `build.mjs:39-40` | `makerName: 'Jinlong'`、`makerFullName: 'Jinlong'` | **两项都不改**（R17：SE 在 `1c684e0` 主动改成了 Jinlong，与 U4 一致）；新增 `makerAltName: 'Chi Jinlong'`（只给 JSON-LD 用）和 `makerSameAs: ['https://x.com/JinlongDev', 'https://apps.apple.com/developer/id1794902022']` |
| `home.mjs:73`、`about.mjs:30`、`learn-english-by-reading.mjs:60` | `alternateName: site.makerFullName` | `alternateName: site.makerAltName` |
| `home.mjs:75`、`about.mjs:33`、`learn-english-by-reading.mjs:62` | `sameAs: [site.xUrl]` | `sameAs: site.makerSameAs`（【事实】2026-10-05 curl 实测：开发者页短链 301 → `/us/developer/chi-jinlong/id1794902022`；用不带店面的短链，避免把链接固定到美区） |
| `about.mjs:31` | `description: 'Independent iOS developer and creator of SurfEnglish.'` | `'Independent iOS developer and creator of SurfEnglish and WordByWord.'` |
| `about.mjs:115` | 可见文本 `${makerName} (${makerFullName})` → "Jinlong (Jinlong)" | 只输出 `${esc(site.makerName)}`；可见文本不出现 "Chi Jinlong"（R17） |
| `layout.mjs:45` | `<meta name="author" content="${esc(site.makerFullName)}">` | 不改（值仍为 "Jinlong"） |

两站共用的 Person 约定（文档 03 必须逐字采用，R17）：

```json
{ "@type": "Person", "@id": "https://surfenglish.app/about/#maker", "name": "Jinlong",
  "alternateName": "Chi Jinlong", "url": "https://surfenglish.app/about/",
  "sameAs": ["https://x.com/JinlongDev", "https://apps.apple.com/developer/id1794902022"] }
```

WBW 的 `SoftwareApplication.creator` 引用 `{"@id": "https://surfenglish.app/about/#maker"}`。不用 `isRelatedTo`（研究 10 §2 C18）。文档 03 v1.1 §5.5 S2 的 sameAs 已改用本节的短链（R17），两处一致。

### 8.2 页脚 "More from the maker"（S5）

**`build.mjs`**（`SITE` 对象内，`:31-47` 之间）新增：

```js
wordByWord: { name: 'WordByWord', url: 'https://www.word-by-word.app', appStoreId: '6741724502',
              localized: false },   // PR-SE-2 改为 true（WBW 新站上线、12 个 /<path>/ 全部 200 之后）
```

**`src/templates/layout.mjs`**：在 `:127`（Product 栏的 `</div>`）和 `:128`（`<div class="footer-langs">`）之间插入：

```js
        <div class="footer-family">
          <h4>${esc(t.footer.moreFromMaker)}</h4>
          <a href="${site.wordByWord.url}/${site.wordByWord.localized && locale.path ? locale.path + '/' : ''}"
             hreflang="${site.wordByWord.localized ? locale.hreflang : 'en'}">${esc(t.footer.wordByWord)}</a>
        </div>
```

两站使用相同的 locale 路径名（F35），所以直接复用 `locale.path`；SE 的 12 个 locale 在 WBW 都有对应页（文档 02 §10.1 ⑥）。英文单页（about/guide/support/privacy/404）的 `locale` 是 `locales[0]`，会链到 WBW 根。

**`src/css/style.css:501`**：`.footer-grid { grid-template-columns: 1.2fr 1fr 1.6fr; }` 改为 `1.2fr 1fr 1fr 1.6fr`；`:597` 的移动端单列规则不用改。

**`src/locales/*.json`（12 个）**：在 `footer` 对象里（en `:362`、ja/zh-Hans `:336` 等）新增两个键：

| locale | `moreFromMaker` | `wordByWord` |
|---|---|---|
| en | More from the maker | WordByWord — bilingual web reader for iPhone, in many languages |
| zh-Hans | 同一开发者的其他 App | WordByWord：网页双语对照翻译 App（多语言） |
| zh-Hant | 同一開發者的其他 App | WordByWord：網頁雙語對照翻譯 App（多語言） |
| ja | 同じ開発者のアプリ | WordByWord — Webページを対訳で読むアプリ（多言語対応） |
| ko | 같은 개발자의 다른 앱 | WordByWord: 웹페이지 원문·번역 같이 보기 앱 (다국어) |
| es | Del mismo desarrollador | WordByWord: traductor bilingüe de páginas web (varios idiomas) |
| pt-BR | Do mesmo desenvolvedor | WordByWord: tradutor bilíngue de sites (vários idiomas) |
| vi | Cùng nhà phát triển | WordByWord: dịch song ngữ trang web (nhiều ngôn ngữ) |
| id | Dari pengembang yang sama | WordByWord: terjemahan dua bahasa untuk halaman web (banyak bahasa) |
| th | จากผู้พัฒนาเดียวกัน | WordByWord: แปลเว็บไซต์สองภาษา (หลายภาษา) |
| hi | इसी डेवलपर से | WordByWord: वेबसाइटों का द्विभाषी अनुवाद (कई भाषाएँ) |
| ar | من المطوّر نفسه | WordByWord: ترجمة صفحات الويب ثنائية اللغة (لغات متعددة) |

锚文本取 WBW 首页的产品/品类主词（研究 07 §6.1–6.2；R46：en "bilingual web reader"、zh-Hans "网页双语对照翻译 App"、ja/ko 保留 アプリ/앱）。按关键词归属（基线 §B.4）不写"学英语"和"新闻"，也不写"整页翻译"（F14）。

### 8.3 `/about/` 家族说明（S4）

**`src/templates/about.mjs`**：在 `:116`（"Who made" 段落结束）和 `:118`（`<h2>Official links</h2>`）之间插入：

```html
<h2 id="wordbyword">Also by Jinlong: WordByWord</h2>
<p>WordByWord is the developer's web reader for English and many other languages, and SurfEnglish
shares its reading engine. Open any page or X post in its built-in browser, swipe right on a
paragraph to place the translation below it, and double-tap a word for an AI explanation in
context (not available for Chinese, Japanese or Korean text). The two apps work side by side:
WordByWord for any page you choose to read, SurfEnglish for a daily, levelled English news feed
and review games.</p>
<ul class="official-links">
  <li><a href="https://www.word-by-word.app/">WordByWord website</a></li>
  <li><a href="https://apps.apple.com/app/apple-store/id6741724502?pt=PT&amp;ct=se-about&amp;mt=8">WordByWord on the App Store</a></li>
</ul>
```

- 与 v1.0 的差异（PRO-13、R40）：删除 "WordByWord is the developer's **earlier** app"（暗示 WBW 是旧版、SE 是继任者）；删除结尾 "If you read in languages other than English, WordByWord is the better fit"（反向的分流措辞，同样违反 R40）；"web reader for many languages" 写成 "for English and many other languages"，不把英语"让给" SE（PRO-01）。
- 链接不加 `rel`（about 页现有链接用 `rel="noopener"`，同站外链可沿用，但不得加 nofollow）；不带 UTM。
- （可选，文档 03 §5.5 S4）AboutPage 增加 `mentions` → `{"@type":"MobileApplication","@id":"https://www.word-by-word.app/#app","name":"WordByWord","url":"https://www.word-by-word.app/"}`，`@id` 与文档 03 的 WBW 节点一致。
- 同时把 `:127` 的 "Last updated" 更新为 PR 合并的日期。facts 表（`:60-71`）不改。SE about 页是纯英文页，这一节不需要本地化。

### 8.4 上线顺序（R51；取代 v1.0"PR-SE-1 任何时候、PR-SE-2 不设期限"）

- **PR-SE-1**（S1–S4、S5 链根、S7，可带 S6）：**在 WBW 的 T0 之前合并**。它只链 WBW 根（现在就是 200），其余改动都在 SE 自身，不依赖 WBW 新站。
- **PR-SE-2**（S5 改为 `localized: true`）：WBW 上线、verify-deploy 通过后合并，**最迟 T+7d**。合并前用脚本确认 WBW 的 12 个 `/<path>/` 全部 200 且不跳转。这是唯一按 locale 指向 WBW 语言页、正常 follow 的外链（App Store 上指向官网的链接是 nofollow，只算发现/引荐入口，R51、SEO-02）。

### 8.5 SE PR 验收

1. `node build.mjs` 通过。`grep -c 'word-by-word.app' dist/**/*.html`：16 个页面每页至少 1 处，about 页至少 2 处。
2. PR-SE-2 之后，12 个 locale 首页的页脚链接目标与 `locale.path` 一致，`hreflang` 与 locale 一致。
3. Person 在 home、about、guide 三个模板里 `name` = "Jinlong"、`alternateName` = "Chi Jinlong"、`sameAs` 与 §8.1 逐字一致，schema 校验无错误；`build.mjs` 的 `makerFullName` 仍为 'Jinlong'；页面可见文本里没有 "Chi Jinlong"，也没有 "Jinlong (Jinlong)"。
4. 页脚在 375 px 宽时单列不溢出，在 1120 px 宽时 4 列不折行。
5. 链接不带 nofollow 和 UTM，`se-about` 的格式与 §7.2 一致。
6. S7：12 个 locale 的 `explore.title` 都带"英文"限定；`meta.keywords` 中不含 §8.6(b) 表里的词；故意把 en 的 `explore.title` 改回 "Any website, read bilingually." 时镜像 lint 让构建失败。
7. 措辞：`grep -riE "earlier app|better fit|may suit you better" dist/` = 0。

### 8.6 防蚕食（S7；R52、SEO-03）

**(a) `explore.title` 加"英文"限定**（12 个 `src/locales/*.json`；`home.mjs:255` 渲染为 `<h2>`，`:124` 写入 JSON-LD `featureList`，改 JSON 后两处自动生效）。保留 `[[ ]]` 高亮标记：

| locale | 现状 | 改为（草案，SE 维护者终审） |
|---|---|---|
| en | Any website, [[read bilingually]]. | Beyond the news: any English website, [[read bilingually]]. |
| zh-Hans | 任何网站，都能[[双语对照着读]]。 | 英文网站，也能[[双语对照着读]]。 |
| zh-Hant | 任何網站，都能[[雙語對照著讀]]。 | 英文網站，也能[[雙語對照著讀]]。 |
| ja | どんなサイトも、[[対訳で読める]]。 | 英語のサイトも、[[対訳で読める]]。 |
| ko | 어떤 웹사이트든, [[대역으로 읽기]]. | 영어 웹사이트도 [[대역으로 읽기]]. |
| es | Cualquier sitio web, [[leído en bilingüe]]. | Cualquier sitio web en inglés, [[leído en bilingüe]]. |
| pt-BR | Qualquer site, [[lido em bilíngue]]. | Qualquer site em inglês, [[lido em bilíngue]]. |
| vi | Trang web nào cũng [[đọc song ngữ]] được. | Trang web tiếng Anh nào cũng [[đọc song ngữ]] được. |
| id | Situs web apa pun, [[dibaca secara bilingual]]. | Situs web berbahasa Inggris apa pun, [[dibaca secara bilingual]]. |
| th | เว็บไซต์ไหนก็[[อ่านแบบสองภาษา]]ได้ | เว็บไซต์ภาษาอังกฤษไหนก็[[อ่านแบบสองภาษา]]ได้ |
| hi | कोई भी वेबसाइट, [[द्विभाषी पढ़ें]]। | कोई भी अंग्रेज़ी वेबसाइट, [[द्विभाषी पढ़ें]]। |
| ar | أي موقع ويب، [[بقراءة ثنائية اللغة]]. | أي موقع ويب باللغة الإنجليزية، [[بقراءة ثنائية اللغة]]. |

**(b) 从 `meta.keywords` 删除归属 WBW 的词**（没有"英语/新闻"限定的"段落翻译 / 原文下方译文 / 平行文本 App"类说法；基线 §B.4）。en、zh-Hans、zh-Hant、ja、ko 按评审 SEO-03 给出的词删除，其余 7 种按同一规则删除对应译法：

| locale | 删除 |
|---|---|
| en | parallel text reading app；translation below the original |
| zh-Hans | 段落翻译 |
| zh-Hant | 段落翻譯 |
| ja | 段落翻訳；原文の下に訳文 |
| ko | 문단 번역；원문 아래 번역 |
| es | texto paralelo；traducción debajo del original |
| pt-BR | texto paralelo；tradução abaixo do original |
| vi | văn bản song song；dịch đoạn văn；bản dịch ngay dưới nguyên văn |
| id | teks paralel；terjemahan paragraf；terjemahan di bawah teks asli |
| th | ข้อความคู่ขนาน；แปลย่อหน้า；คำแปลใต้ต้นฉบับ |
| hi | समानांतर पाठ；अनुच्छेद अनुवाद；मूल के नीचे अनुवाद |
| ar | نص متوازٍ；ترجمة الفقرات；الترجمة أسفل النص الأصلي |

（WBW 自己不输出 meta keywords，R6。SE 侧这一步主要是让两站的关键词归属在源头一致。）

**(c) SE build 镜像 lint**（在 `build.mjs` 生成 HTML 之后执行，命中即构建失败）：

```js
// title / h1 / h2 / JSON-LD featureList 中出现"任意网站"类说法时，必须同时出现"英语"限定
const ANY_SITE = { en: /\bany\b[^.]*\bwebsites?\b/i, 'zh-Hans': /任何网站/, 'zh-Hant': /任何網站/, ja: /どんなサイト/,
  ko: /어떤 웹사이트/, es: /cualquier sitio/i, 'pt-BR': /qualquer site/i, vi: /trang web nào/i,
  id: /situs web apa pun/i, th: /เว็บไซต์ไหน/, hi: /कोई भी वेबसाइट/, ar: /أي موقع/ };
const ENGLISH = { en: /\bEnglish\b/, 'zh-Hans': /英文|英语/, 'zh-Hant': /英文|英語/, ja: /英語/, ko: /영어/,
  es: /inglés/i, 'pt-BR': /inglês/i, vi: /tiếng Anh/i, id: /Inggris/i, th: /อังกฤษ/, hi: /अंग्रेज़ी/, ar: /الإنجليزية/ };
```

这是 WBW 侧 seoLint（文档 03 §3.8）的镜像：WBW 页面的 title/H1/description 不以"学英语"作主词，SE 页面的标题不以"任意网站"作主词。

---

## 9. 临时方案下线步骤

| 步 | 动作 | 说明 |
|---|---|---|
| 0（可选，现在就能做） | 在旧站把 `js/surfenglish-promo.js:17` 的 `showBar` 改为 `false`，`:19` 的 `sectionAfter` 改为 `'#faq'` | 新站上线前先止损：去掉固定条，把卡片移到页尾（现有页面都有 `#faq`）。属于线上改动，**需用户确认后执行**（R37、H18，默认不做）；本文不改动任何文件 |
| 1 | 导出 GA4 中 `surfenglish_promo` 按 label × `page_locale` 的 28 天和 90 天数据 | H2；这是对比基线，T-7 前导出 |
| 2 | 运行一次性脚本（文档 06 §4.5 的 `scripts/extract-legacy.mjs`）：用 node 解析 `surfenglish-promo.js` 的 I18N（研究 04 §8 的方法），输出到 `src/locales/_legacy/` | 翻译记忆，不进构建；文件头注明"已过时，仅作术语参考" |
| 3 | 按文档 08 把 `sibling.*`、`faq.items[english-learner]`、`about.family` 写进 locale JSON（键与位置见 §5 索引，R75）；按 §6 生成素材；按 §3.7 写 `src/data/sibling.mjs` | 模板文件名与 partial 结构以文档 06 为准 |
| 4 | **在同一个 PR 里删除** `js/surfenglish-promo.js`、`css/surfenglish-promo.css`、`img/surfenglish/feed.jpg`、`translate.jpg`、`word-raid.jpg`、`icon-192.png` | 图标改为从 SE 母版派生；git 历史保留原文件。按 R29，这一步发生在 main 已与 GitHub Pages 发布源脱钩之后 |
| 5 | 把 `css/surfenglish-promo.css:27-30` 的 `section[id]{scroll-margin-top}` 迁入主样式，按新 header 的实际高度设值 | 研究 04 M5：否则锚点会被固定 header 遮住 |
| 6 | 改写 `README.md:11-33` 的 "SurfEnglish cross-promotion" 一节，指向 `src/data/sibling.mjs` 和本文 | — |
| 7 | 构建后检查 `grep -r "surfenglish-promo\|utm_source" dist/` = 0 | 根目录手写 HTML 在重建时整体删除（基线 §D），25 处引入随之消失 |
| 8 | 上线后 `curl -I https://www.word-by-word.app/js/surfenglish-promo.js` → 404 | 不需要重定向（文档 02 §5 E 组） |
| 9 | 用户浏览器里残留的 localStorage `wbw.surfenglishPromo.dismissedAt` 不处理 | 没有副作用 |

---

## 10. 反模式清单

1. 固定或吸顶条、弹窗、插屏、悬浮按钮、toast；任何需要访客"关掉"的推荐。
2. 推荐出现在首屏、hero 之后紧接的位置，或 WBW 功能介绍之前；**在 ① 里使用黑色 App Store 徽章或与 WBW CTA 同外观的按钮；为了避让 SE 而删掉 WBW 价格区的徽章**（R43、PRO-07）。
3. 一页放两张以上卡片；各落点重复同一个锚文本；每页指向 surfenglish.app 的链接超过 3 个（含页脚）或 SE App Store 链接超过 1 个（研究 06 §5.1 "excessive"）。
4. 用 JS 注入推荐内容，或用 `<template>` 延迟渲染。
5. 在 WBW 的 title、H1、meta description（含 `/about/` 的 description）、Smart App Banner 里出现 SurfEnglish；把"学英语 / learn English"当作 WBW 页面的主词（基线 §B.4）。
6. "New / 新上线 / 新作"标签；"faster / 更高效 / 最好 / #1 / 升级 / 新版 / 替代"等措辞；**替换性措辞**："may suit you better / better fit / 可能更适合你 / のほうが合うかもしれません / 더 잘 맞을 수 있어요"及 §5.7 T10 的各语言写法；**暗示 WBW 是旧版**："earlier app / 早期 App / 前作"，或 about 时间线以 SE 发布收尾（R40、PRO-13）；感叹号；emoji。
7. 写价格、评分、下载量；写 F18 / 基线 §B.3 / §5.1 核实清单以外的 SE 能力；**把端侧/离线语音、语块、双击查词写成 SE 独有**（R41、PRO-03）；把 WBW 描述成"整页翻译"或"在任何 App 里翻译"。
8. zh-Hans 页渲染 ① 卡片，或放 SE 的下载徽章、App Store 链接；建议用户"切换 Apple ID 地区"（R42）。
9. 在 de/fr/it/nl/pl/ru/tr/uk 页写 "App in 12 Sprachen" 一类会误读成"有本语言界面"的文案；链接 SE 的 `/de/` 这类不存在的页面。
10. 链接带 UTM，或加 nofollow/sponsored；两站之间做 canonical 或 hreflang；在 Smart App Banner 里放 SE 的 app-id。
11. 在 WBW 的 CSS 里引入 SE 的深海背景、玻璃效果、青紫渐变、`--se-*` token；倾斜手机、三机扇形排列、轮播。
12. 在 WBW 的功能区里用 SE 截图来说明 WBW 的功能。
13. 按 IP、语言或 UA 隐藏或显示推荐；为推荐写 cookie 或 localStorage；为推荐另加第三方脚本或像素。
14. 运行时从 Apple toolbox 或 surfenglish.app 热链图片。
15. 在 privacy、support、404、chrome-extension 页以及 Phase 2 指南页的正文放推荐（只保留页脚 ④）。
16. 原样照搬 SE 官网的长段文案（重复内容），而不是按 WBW 的语境改写。
17. SE 区块的 H2 以"学英语 / Learning English"条件句开头（R40、PRO-08）。
18. 用 SE 的新闻 feed 截图（含真实人名标题、第三方品牌）做窗口；展示"Coming soon"的未上线功能（R32、R44）。
19. 在语言段（Chunks / Action Flow 只支持英语的说明旁）提 SurfEnglish（R42、PRO-05）。
20. SE 图标在页面上的显示尺寸超过 WBW 最大图标的一半（VIS-14）。

---

## 验收标准

| # | 项 | 方法 | 通过条件 |
|---|---|---|---|
| A1 | 静态可抓取 | 不执行 JS，`curl -s https://www.word-by-word.app/ja/` | 包含 `surfenglish.app/ja/` 和 ① 的 H2 文本（以 "SurfEnglish" 开头） |
| A2 | 无打扰元素 | 检查 `.sibling` 相关 CSS；打开 DevTools 看 | 没有 `position: fixed/sticky`；没有关闭按钮；没有 localStorage 写入 |
| A3 | 位置与转化入口 | 375×812 和 1280×800 下 `#surfenglish.getBoundingClientRect().top`；DOM 顺序 | 大于视口高度；在 `#pricing` 之后、`#faq` 之前；**`#pricing` 内有 WBW 的 App Store 徽章**；`#surfenglish` 内没有 Apple 徽章 `<img>`、没有填充色按钮（R43、PRO-07） |
| A4 | 体量 | 测量 `#surfenglish` 的高度（19 个渲染 ① 的 locale） | 1280×800 ≤ 420 px；375×812 ≤ 480 px（R10）；320 px 宽 ≤ 560 px（R84） |
| A5 | zh-Hans | `grep -c 'id="surfenglish"\|6787367021' dist/zh-hans/index.html`；检查 FAQ 与页脚 | 0 处；`english-learner` 一问存在且含"未在中国大陆 App Store 上架"；页脚 ④ 链 `surfenglish.app/zh-hans/`（R42） |
| A6 | 8 种语言 | 检查 `dist/{de,fr,it,nl,pl,ru,tr,uk}/index.html` | SE 链接是 `https://surfenglish.app/` 并带 `hreflang="en"`；有 `uiNote`（含 "11"）；没有 "12 Sprachen / 12 langues / 12 lingue / 12 talen / 12 języ / 12 язык / 12 dil / 12 мов" 一类写法（PRO-11） |
| A7 | 链接有效 | 用脚本请求矩阵中全部 SE URL | 全部 200，没有跳转 |
| A8 | 链接属性 | `grep` dist | 指向 surfenglish.app 和 apps.apple.com 的链接没有 `utm_`，`rel` 不含 nofollow/sponsored/ugc，没有 `target` |
| A9 | ct | 用正则 `ct=([a-z0-9-]+)` 抽取 SE App Store 链接的全部值 | 只有 `wbw-card`（19 个首页）与 `wbw-about`（`/about/`）；每个 ≤ 30 字符；全站不同 ct 值 ≤ 10（R3、R55）；配置了 `pt` 时链接格式符合 F28 |
| A10 | 点击埋点 | GA4 DebugView 逐个点击 | 每个元素的 event 和 label 与 §7.3 一致；WBW 徽章仍然上报 `app_store_click`，SE 的 App Store 文字链接不上报；不存在 `langhint_anchor` |
| A11 | 曝光埋点 | 滚动到 ① 两次 | 每次页面加载只上报 1 次 `surfenglish_promo_view` |
| A12 | 素材 | 检查 `ls -l`；`check-images.mjs`；DevTools Network | AVIF ≤ 12 KB，JPEG ≤ 30 KB，宽高为偶数，结构检查与 Chrome headless 解码后的 alpha 抽样通过（R8、R79；sips 回解只作辅助）；图标符合 §6.2；所有 `<img>` 带 width/height；Chrome 和 Safari 在 375 px 宽时不请求窗口截图（若仍请求，记录下来，可接受） |
| A13 | 可访问性 | axe 和 VoiceOver | 无违规；`aside` 有可访问名称；App Store 文字链接的可访问名称含 "SurfEnglish"、不含 "→"；文字对比度 ≥ 4.5:1；焦点可见 |
| A14 | RTL | 检查 `/ar/` | 卡片镜像正确，`A1–C1` 显示顺序正确，手势用语为"向右滑"（R63），没有横向滚动 |
| A15 | 页面范围 | 检查 privacy/support/404/chrome-extension 与 Phase 2 指南页 | 没有 ①②；页脚有 ④；全站没有落点 ③（R42） |
| A16 | 旧方案清理 | `git ls-files \| grep -E 'surfenglish-promo\|img/surfenglish'` | 只剩 `src/locales/_legacy/` 下的翻译记忆文件 |
| A17 | 实体 | 校验 WBW 和 SE 两站的 JSON-LD | Person 的 `@id`、`name`、`alternateName`、`sameAs` 逐字一致；WBW 的 `creator` 引用该 `@id`（R17） |
| A18 | 文案检查 | 构建时对 `sibling.*`、`faq.items[english-learner]`、`about.family` 跑禁用词正则（New\|新上线\|faster\|更高效\|升级\|替代\|best\|#1\|!\|may suit you better\|better fit\|可能更适合你\|より合うかも\|のほうが合うかも\|earlier app，以及 §5.7 T10 的各语言写法）；检查 `sibling.card.title` 前缀 | 0 命中，且 19 个 locale 的 `sibling.card.title` 都以 "SurfEnglish" 开头，否则构建失败（R40） |
| A19 | 开关 | 分别设 `SIBLING.enabled=false`、打开 site-notice | 前者 ①② 消失、④⑤ 保留；后者 ① 消失、②④⑤ 保留 |
| A20 | SE PR | §8.5 | 全部通过；PR-SE-1 在 T0 前、PR-SE-2 在 T+7d 内合并（R51） |
| A21 | 视觉权重 | 1280×800 与 375×812 截图，测量图标显示尺寸 | ① 中 SE 图标 32 px；WBW 图标在同页的最大显示尺寸 ≥ 64 px（≥ SE 的 2 倍）；最终 CTA 有 WBW 图标 + 徽章 + 要点回顾（R43、VIS-14；组件见文档 05） |
| A22 | about 页链接预算 | `grep -o 'href="https://surfenglish.app[^"]*"' dist/about/index.html`；检查 meta | surfenglish.app 链接 ≤ 3（含页脚），SE App Store 链接 1 个；maker 段没有 SE 链接；`meta description` 不含 SurfEnglish；时间线最后一条不是 SE 发布（PRO-12、PRO-13） |

## 未决事项（按裁定第三节 H1–H18）

| 编号 | 对本文的影响 | 未提供时的默认做法 |
|---|---|---|
| H1 GSC「国家」 | 决定 en 页是否保留 ①（§7.4 决策规则） | en 保留 ① |
| H2 GA4 `surfenglish_promo` 基线 | C2 和 G1 的对比基线 | 上线后前 8 周作为基线 |
| H3 ASC `pt` | §7.2 的全部 campaign link | 按文档 06 `appStoreLink()` 降级并告警 |
| H6 Consent Mode | 曝光和点击事件在 EEA 是否少计；de/fr/it/nl/pl 的数据需要按同意率折算 | 与全站 GA 的方案一致，不为推荐单独处理 |
| H7 母语审校 | zh-Hant、ko 与 §5.7 其余 15 种语言的 SE 文案（按文档 08 §7 产出） | 按 R36（T1 上线前审校；ko 无着落时双模型互检 + 回译 + 术语表 lint 并标记待复核；T2/T3 上线后补审）；en 按 R80（用户通读 + 双模型互检，不阻塞 T0） |
| H11 素材确认 | §6.1 的 `games-home.jpg` 裁切（07-25 截图，推断与 1.3.1 画面一致） | 按 §6.1 使用；如用户认为与现行 UI 不符，改用备选 `game-word-raid.jpg` 或请 SE 侧重拍同一画面 |
| H14 SE 仓库配套 PR | §8 的 S1–S7 | 排期按 R51：PR-SE-1 在 T0 前、PR-SE-2 在 T+7d 内合并；授权仍需用户确认 |
| H15 `@JinlongDev` | §8.1 Person `sameAs` | 沿用 |
| H18 旧站顶部条 | §9 第 0 步 | 不做 |

## 原"对基线的修订建议"的处理

v1.0 在本节提出的 6 条建议（原编号 R1–R6，与主控裁定编号冲突，v1.1 改称 BL-1–BL-6）均已被裁定吸收或取代：

| 原编号 | 内容 | 处理 |
|---|---|---|
| BL-1（原 R1，"新增 §H7"） | SE 官网恢复 "Chi Jinlong" 需用户确认 | **已由 R17 裁定**：可见署名保持 "Jinlong"，不改 `makerFullName`；"Chi Jinlong" 只作 JSON-LD `alternateName`，用新字段输出（§8.1）。私设的 §H7 删除 |
| BL-2（原 R2，"新增 §H8"） | 15 种语言文案的母语审校 | **已由 R36 / H7 裁定**（§5.7 T11）。私设的 §H8 删除 |
| BL-3（原 R3） | "privacy/support 页不放推荐区块"不包括全站页脚 ④ | **已由文档 02 §10.1 与文档 06 PAGES 的 `sibling:'footer-only'` 采纳** |
| BL-4（原 R4） | zh-Hans 用 text 变体；③ 只用站内锚点 | **已被 R42 取代**：zh-Hans 不渲染 ①；③ 删除（R4 本身也被 R42 取代） |
| BL-5（原 R5） | site-notice 开启时不渲染 ①；`analytics.js` 增加 `data-ga-view` | **已由 R35、R3 裁定** |
| BL-6（原 R6） | ct 默认"落点 × locale"，预留 `ctMode:'placement'` | **已被 R3 / R55 取代**：ct 默认且只按落点 |

---

## 修订记录 v1.1

| 评审 / 裁定编号 | 处理结果 | 修改位置 |
|---|---|---|
| PRO-01（blocker：分工轴劝英语学习者换 App） | 已改：叙事轴改为"互补、也值得一试"（R40）；全文删除"may suit you better / 可能更适合你 / のほうが合うかもしれません / 더 잘 맞을 수 있어요"；en/ja/zh-Hant/ko 卡片与 en/ja/zh-Hans/zh-Hant/ko FAQ 重写，先写"WordByWord 帮你读自己打开的网页和推文，英文或其他语言都行"；SE about 文案同步；删除"X 指南文末加 SE 条件说明"（Phase 2 指南只留页脚）。**部分不采纳**：① 桥接句按 R40 保留为从句"沿用同样的右滑翻译和双击查词"（R40 明文要求），只删除独立成句的"操作完全相同"；FAQ 建议句 "Many people use both" 无法核实（G5），改为"两款可以一起用" | §0 #1；§1.2；§1.3；§2.1 G 行；§2.2；§5.2；§5.3；§5.6；§8.3 |
| PRO-03（离线语音写成 WBW 没有） | 已改：§5.1 加规则——对比时 SE 语音必须带"AI"限定，且不得作为 SE 独有卖点；⑤ 对照表 Read aloud 行按评审改写。**部分不采纳**：评审给 en FAQ 的 "natural-sounding AI voices … even offline" 一句不写进 FAQ，因为 R41 禁止把端侧/离线语音作为 SE 卖点；① ② 中整体不写语音 | §0 #6；§2.2 表；§5.1；§5.3 注；§5.6 |
| PRO-04（zh-Hans 过度推荐） | 已改：zh-Hans 不渲染 ①（`perLocale['zh-Hans'].card=false`），只保留 ②（模板追加 `sibling.availability`）、④、⑤；矩阵、A5、A19 同步 | §0 #2/#7；§1.1 G2；§1.2；§2.1 C/C′；§3.0；§3.1；§3.7；§4；§5.2；A5 |
| PRO-05（落点 ③ 多余且暗中贬低 WBW） | 已改：删除 ③；删除 `sibling.languagesTip`、`langhint_anchor`、`placements.langHint`；§3.3、§5.4 改为删除说明 | §0 #2；§3.0；§3.3；§3.7；§5.4；§7.3；§10 #19；A10、A15 |
| PRO-07（价格区徽章让给 SE） | 已改：价格区必须有 WBW 徽章（`ct=wbw-pricing`）；① 改用文字链接、不用黑色徽章；约束 2 改写；原型 README D6 作废 | §0 #4；§3.0 约束 2；§3.1 HTML/CSS；§10 #2；A3、A13 |
| PRO-08（H2 以"学英语"开头） | 已改：H2 以 "SurfEnglish" 开头，条件句挪到正文第一句；话术骨架、T3 改写；lint 检查 `sibling.card.title` 前缀（seoLint 由文档 03 覆盖 H2） | §0 #9；§2.2；§3.7 规则 6；§5.1；§5.2；§5.7 T3；§10 #17；A18 |
| PRO-11（de uiNote 与 A6 冲突） | 已改：de 改为 "Englisch und 11 weitere Sprachen"；pl、tr 同理统一为"英语和另外 11 种"；A6 改为检查"含 11、无 12 + 语言词" | §5.7 uiNote 表；A6 |
| PRO-12（about 页 SE 链接超限、description 提 SE） | 已改：⑤ 加链接预算（≤ 3 含页脚），maker 段只用纯文本、about description 不出现 SurfEnglish；具体文案由文档 08 落实 | §3.0；§3.5；§10 #3/#5；A22 |
| PRO-13（"earlier app"、时间线以 SE 收尾） | 已改：SE about 文案改为 "the developer's web reader for English and many other languages"，并删掉反向的 "better fit"；WBW about 时间线不以 SE 发布收尾（约束，文档 08 落实）；⑤ 删除 "SurfEnglish came later" | §3.5；§5.6；§8.3；§10 #6；A22 |
| SEO-03（SE 侧防蚕食） | 已改：新增 S7（12 个 locale 的 `explore.title` 加"英文"限定、删 meta.keywords 中归属 WBW 的词、镜像 lint），并入 PR-SE-1 | §1.4 #21；§8.0；§8.5 第 6 条；§8.6 |
| ENG-08（两套推荐接口） | 已改：§3.7 与文档 06 v1.1 统一为 `src/data/sibling.mjs` 的 `SIBLING`、`seMode()` 与 `sibling.card.*` 键；补 L-11（uiNote / availability / title 前缀 / placements 键）、数组条数语义、`copyReviewedAt`；`enabled=false` 关 ①② | §3.0；§3.7；A19 |
| I18-12（ko 语体混用、"오프라인에서도 되는"） | 已改：§5.1 写明 ko 卡片해요체、FAQ 答案합니다체；ko 草案按此重写；语音要点删除，"오프라인에서도 되는"随之消失 | §5.1；§5.2 ko；§5.3 ko |
| VIS-14（SE 卡视觉压过 WBW 收尾） | 已改：SE 图标 32 px、窗口 200 px；WBW 图标最大显示尺寸 ≥ SE 的 2 倍；最终 CTA 加强（组件归文档 05）；⑤ 的 72 px 家族徽记作废 | §0 #4；§3.0 约束 4；§3.1；§3.5；§10 #20；A21 |
| SEO-13、PRO-10、ENG-06、SEO-02（交叉） | 已改：H2 lint（同 PRO-08）；要点写成 "at levels {se.levels}"；ct 只按落点、全站 ≤ 10 个；PR-SE-2 的 follow 外链价值与合并时点 | §3.7；§5.1；§5.2；§7.2；§8.4 |
| VIS-01（交叉：建议改用 HTML 样张、禁用 game 截图） | **拒绝**：与 R44 冲突，按裁定使用 `games-home.jpg` 上部裁切 | §6.1 |
| R39 | 已改：WBW 用途写成"读你打开的任何网页和推文，英文或其他语言"，不把英语让给 SE | §1.3；§2.2；§5.1 |
| R40 | 已改：见 PRO-01、PRO-08、PRO-13 | 全文 |
| R41 | 已改：卖点限分级新闻、复习游戏、从 Safari 分享英文文章；**分享扩展已核实**（SE iOS `SurfEnglishShare` target，`com.apple.share-services`，`8cc50ed` 合入 1.3.0） | §0 #6；§2.2；§5.1；§5.2 |
| R42 | 已改：见 PRO-04、PRO-05 | 同上 |
| R43 | 已改：见 PRO-07、VIS-14 | 同上 |
| R44（取代 R11 选图） | 已改：窗口改为 `games-home.jpg` 裁切 x 0–720、y 128–928 → 400×444，显示 200×222；sips 实测 AVIF 7,804 B、JPEG 25,191 B，回解无透明；新闻 feed 截图全部不用 | §0 #5；§3.1；§6 |
| R3、R55 | 已改：ct 只按落点（`wbw-card`、`wbw-about`、反向 `se-about`）；删除 20 个 locale 级 ct 与 `ctMode` 降级开关；label 删除 `langhint_anchor` | §0 #8；§3.7；§4；§7.2；§7.3；A9 |
| R10 | 已改：桌面 ≤ 420 px、手机 ≤ 480 px，所有 locale 同一标准 | §0 #3；§3.1；A4 |
| R11 | 外观部分保持（按本文）；选图部分已被 R44 取代 | §3.1；§6.1 |
| R17 | 已改：SE 不改 `makerFullName`，用新字段 `makerAltName` 输出 alternateName；sameAs 两站逐字一致 | §8.1；A17 |
| R22 | 已改：字段名与文档 06 v1.1 统一 | §3.7；§5 各表键名 |
| R24 | 已改：删除私设 §H7/§H8，未决事项按 H1–H18 重排 | 未决事项；原修订建议 |
| R28 | 已改：第三人称，不用 "our sister app" | §1.3 |
| R32、R67 | 已改：裁切避开第三方内容、真实人名与原始状态栏 | §6.1 |
| R35 | 已改：site-notice 开启时只隐藏 ① | §1.2；§3.7；A19 |
| R36 / H7 | 已改：母语审校按 R36 | §5.7 T11；未决事项 |
| R37 / H18 | 已改：旧站止损需用户确认，默认不做 | §9 第 0 步 |
| R5 | 已改：不输出 FAQPage | §3.2 |
| R7 | 已确认：卡片无动效 | §3.1 |
| R8、R58 | 已改：偶数宽高、单次有损编码、回解校验 | §6.2；A12 |
| R18 | 已改：G2 护栏按 R18 阈值 | §7.4 |
| R29 | 已改：旧文件删除发生在 main 与发布源脱钩之后 | §9 第 4 步 |
| R46 | 已改：SE 页脚指向 WBW 的锚文本对齐首页产品/品类主词 | §8.2 |
| R51 | 已改：PR-SE-1 在 T0 前、PR-SE-2 在 T+7d 内合并 | §0 #10；§8.4；A20 |
| R52 | 已改：见 SEO-03 | §8.6 |
| R63、R64、R70 | 已改：ar 手势方向；zh-Hant 台湾用语；暗色下 SE 图标描边 | §3.1；§4；§5.1 |
| R12、R13、R65、R68、R69 | 引用：`#pricing` id、section H2 层级、荧光笔不进卡片、字阶以文档 05 为准；与卡片无冲突 | §3.0；§3.1 |
| 未受影响的裁定 | R1、R2、R6、R9、R14–R16、R19–R21、R23、R25–R27、R30（仅在文首"入库策略"引用）、R31、R33、R34、R38、R45、R47–R50、R53、R54、R56、R57、R59–R62、R66、R71–R73 与 SE 推荐无直接关系，未做正文修改 | — |
| 编号与引用规范化 | 已改：原"对基线的修订建议" R1–R6 改称 BL-1–BL-6 并标注裁定；研究报告引用统一为"研究 0X §…"，设计文档为"文档 0X §…"；`research/…` 路径改为 `appendix/research/…`；小节号 §8.4/§8.5 保持 v1.0 含义，S7 放在新增的 §8.6 | 全文 |
| 跨文档同步提示（不在本文修改） | 文档 08：`sibling.*` 键名按文档 06 v1.1 §4.5 改名；`linkText` 用 SE 核心词锚（本文 §5.1、文档 03 §3.7），不用裸域名 "surfenglish.app"；about maker 段去链接、description 去 SE、时间线不以 SE 收尾。文档 05：§5.9 卡片组件按本文 §3.1（`<aside>`、无徽章、32 px 图标、200 px 窗口）。原型：`se/feed-window` 改为 `se/common/games`，价格区恢复 WBW 徽章。文档 02 §7.5："① 与 WBW 徽章之间至少隔一个区块"按本文 §3.0 约束 2 改为"① 内不用黑色徽章"。文档 03 §4.4 第 7 条：② ④ 不放 App Store 链接，实际只有 `wbw-card`、`wbw-about` 两个 ct | — |
| 被拒绝的评审条目 | VIS-01（与 R44 冲突）；PRO-01、PRO-03 各有一处子建议未采纳（见上） | — |
| 一致性审计修正（2026-10-05） | 已改：§5.6 对照表 Read aloud 行删去 SE 列的 "also offline"（R41、H13，与文档 08 §5.2 一致）；§5 文首注明 en / ja / zh-Hans 的 SE 文案措辞以文档 08 为准（本文保留规则、页脚 20 语言表、zh-Hant/ko 草案与改写规则）；§3.7、§7.3、§8.1 中指向文档 03 / 06 旧写法的过期提示改为"已一致" | §3.7；§5；§5.6；§7.3；§8.1 |
| v1.3 定稿修正（R74–R84） | 已改：**R75** 文档 08 为文案唯一来源：§5.2 ①、§5.3 ②、§5.6 ⑤ 的 en / ja / zh-Hans 定稿表与 zh-Hant / ko 草案删除，改为"键 → 文档 08 位置"索引；§5.6 只保留对 `about.family` 的约束与事实依据；§3.1 HTML 草案的 ja 文字改为 `{sibling.card.*}` 键；§3.1 线框、§3.2、§3.5 线框注明文案以文档 08 为准；§5.5 页脚表与 §5.7 的 uiNote / linkText 种子是文档 08 §7.8 引用的唯一取值，保留并加注；§5.7 改为覆盖 zh-Hant、ko 在内的 17 种语言（linkText 种子补 zh-Hant、ko 两行，T6 改为 9 种）；§9 第 3 步改为按文档 08 写入。**R76** 锚文本统一：① 官网链接用 SE 核心词短语 + 品牌（en 例 "Read English news at your level with SurfEnglish"），任何落点不用裸域名 "surfenglish.app"，App Store 文字链接为本地化的 "Get SurfEnglish on the App Store →"。**R74** §3.7 增加 `sibling.section.*` → `sibling.card.*` 改名与 `languagesTip` 删除说明。**R81** §3.5 增加 about 可见文本不出现 "Chi Jinlong"、去歧义链接到 App Store 开发者页。**R84** ① 手机 ≤ 480 px 适用于 ≥ 375 px 宽，320 px 宽 ≤ 560 px。连带（同为 v1.3 裁定、与本文直接冲突）：**R79** §6.2 裁切改在 node 中完成，sips 只缩放与编码，sips 回解改为辅助检查，A12 闸门改为结构检查 + Chrome headless alpha 抽样；**R80** §5.7 T11、未决事项 H7 写明 en 按用户通读 + 双模型互检上线。文首上位约束改为 R1–R84 | 文首；§0 #3、#4；§1.4 #3；§3.1（体量、线框、HTML 草案）；§3.2；§3.5；§3.7；§5 文首；§5.1 锚文本行；§5.2；§5.3；§5.5；§5.6；§5.7（标题、引言、T6、T7、T11、linkText 表）；§6.2；§9 第 3 步；A4；A12；未决事项 H7 |
| v1.3 验收修正（2026-10-05） | 已改：§5.2 `sibling.availability` 行与段后说明仍写"文档 08 v1.1 写在 FAQ 答案末尾 / jsonc 仍用旧键名 `sibling.section.*`"，文档 08 v1.3 已完成迁移与改名（S27、R74），改为现状；§3.1 体量引用的原型数据由"320 宽 560 px（K6）"更新为 v1.3 实测（320 宽 en 558 / ja 551 px，390 宽 en 474 px，K11） | §3.1；§5.2 |
