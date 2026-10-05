# 12 · 主控裁定 v1.1（基线补充，2026-10-05）

> 适用于 `docs/redesign-2026/01–08` 与 `prototype/`。本文件是 `11-design-baseline.md` 的补充，**优先级高于各文档中的不同写法**。
> 编号 R1–R38；"07 §10 #n" 指 07 文档一致性问题表中的条目。

## 一、跨文档冲突裁定

| # | 议题 | 裁定 |
|---|---|---|
| R1 | Chrome 扩展页语言（07 §10 #1） | Phase 1 做 **en `/chrome-extension/` + zh-Hans `/zh-hans/chrome-extension/`**（扩展 UI 有 zh_CN；旧页即中文）。06 的 `PAGES`/L-3 按此修改。ja/ko 版留到 Phase 3 |
| R2 | 扩展子站状态机（07 §10 #2、#16；01 R5；02 §13；03 修订 1） | 由 `SITE.chromeStoreUrl` 驱动两态。**S1（已提供 listing URL）**：可索引、进 sitemap、header 导航显示 "Chrome extension"、CTA 指向 listing。**S0（未提供）**：页面 `noindex`、不进 sitemap、header 导航**隐藏**该项、footer 保留链接、CTA 为 "Coming soon" + 联系方式。这是对 U3（纳入新站、进入导航）的落地方式：拿到 H4 即为 S1。两态下页面都必须写明与 WordByWord.io 的同名扩展无关。`/chrome-extension/privacy.html` 恒为 200，索引状态随页面状态 |
| R3 | SE 推荐的 GA label 与 ct（#3） | 事件名 `surfenglish_promo` 不变；label 按 **04**（`card_*`、`faq_*`、`footer_*`、`about_*`、`langhint_anchor` 等）。曝光事件只给落点 ①（`surfenglish_promo_view`，可见 ≥50% 时每页 1 次）。**ct 默认按落点、不按 locale**：`wbw-card`、`wbw-faq`、`wbw-footer`、`wbw-about`（≤30 字符）；locale 维度看 GA 的 `page_locale`。理由：ASC 每个 campaign 需 ≥5 次首次下载才显示数据，按 20 locale 拆分永远看不到数据。06 的 `section_*`/`wbw-section-<l>` 改为与 04 一致 |
| R4 | 语言段落里的 SE 提示（#4） | 只做**站内锚点**跳到 `#surfenglish`，不放外链（04） |
| R5 | FAQPage 结构化数据（#5） | **不输出**（F26）。`faqSchema` 移除或恒为 false；FAQ 只做可见内容 |
| R6 | meta keywords（#6） | **不输出** |
| R7 | 滚动渐入 reveal（#7） | **不做**（05）。动效仅限 hero 样张与微交互；全部受 `prefers-reduced-motion` 约束 |
| R8 | 图片管线（#8；原型 K1） | **裁切坐标、质量参数、CSS 画机身**按 05；**脚本名、目录、指纹路径**按 06。06 §7 必须加入：AVIF 编码前把宽高修正为**偶数**（sips 对 >1024px 的图做分块编码，Chrome 遇到奇数尺寸的分块 AVIF 会整张透明），以及构建/检查阶段的解码 + alpha 校验（防止"白板图"）。原型 `tools/build-images.mjs` 是参考实现 |
| R9 | OG 图路径（#9） | 按 06：指纹化放在 `/assets/` 下 |
| R10 | SE 卡片高度（#10） | 桌面 **≤420px**，手机 **≤480px**，所有 locale 同一标准；基线 §F 的"约半屏"以此量化 |
| R11 | SE 卡片外观（#11；05 §5.9 vs 04 §3.1） | 按 **04**：WBW 纸面卡片，SE 只以图标 + 一张深色截图作为"窗口"。截图避免出现真实人名/名人新闻标题（原型现用的 `feed-chunks` 裁切含 "Adam Driver & Anne Hathaway"），优先选中性内容（如 `browser.jpg` 的裁切或其它中性新闻），由 04/05 修订时目视确认 |
| R12 | 价格区 id（#12） | `pricing`。页内锚点：`#features #languages #pricing #faq #surfenglish`，**保留 `#screenshots`**；`#cta` 不再作为价格区 id（旧 → 新对照写进 GA 对照表） |
| R13 | 功能块标题层级（#13） | section 标题 H2；功能块 **H3**（视觉字号可放大） |
| R14 | CJK description 长度（#14） | 按 03 的分文字类型区间；06 L-8 同步 |
| R15 | "与 WordByWord.io 无关"声明位置（#15） | 只放 `/about/` 与扩展页（两种语言） |
| R16 | Header 导航（#16） | Features / Languages / Pricing / FAQ / Chrome extension（仅 S1）+ 语言切换器 + Download 按钮 |
| R17 | Person 实体（#17；04 R1；03 S1） | `name: "Jinlong"`，`alternateName: "Chi Jinlong"`，共享 `@id: https://surfenglish.app/about/#maker`；`sameAs` 用 04 的清单（经 curl 验证）且两站**逐字一致**，并补 App Store 开发者页。**SE 可见署名保持 "Jinlong"，不改 SE 的 `makerFullName`**（否决 03 的 S1：SE 在 `1c684e0` 主动改成了 Jinlong，与 U4 一致） |
| R18 | 品牌守护阈值（#18） | 目标："wordbyword" 查询 28 天平均排名 **≤2.0**（T+4w 评估）；警戒：7 日均值连续 7 天 **>3.0** → 启动排查/回退评估；06 A15 作为上线验收保留 |
| R19 | 性能预算口径（#19） | 以 **06** 的数字为准（CSS/HTML/JS/图片、Lighthouse 阈值）；05 的 CSS ≤40KB 改为"压缩后 ≤40KB" |
| R20 | 手机端页面长度（#20） | 目标放宽到 **≤13,000px**（390 宽）；手机端收起规格行与放大镜特写；hero 的 platformNote 移到样张之后，使样张在首屏露出更多。不删 08 文案键 |
| R21 | 本地化 404（#21） | Phase 1 只做 en（含 20 语言首页链接列表）；本地化 404 作为 M4 可选项 |
| R22 | 字段名、徽章、版权行、`screenshots` id（#22） | 代码字段名以 **06** 为准；App Store 徽章 locale 按 F28；版权行 `© 2025–{currentYear} Jinlong`；保留 `screenshots` id |
| R23 | 工期与回滚期限（#23） | 采用 **07** 的估算与里程碑：T0 目标窗口 2026-11-17～11-26（预期 11-25），避开 12-18～01-04；**DNS 回滚截止 = T0 当时 GitHub Pages 证书的 notAfter**（不写死 12-23）。07 增加一列"AI 辅助（Claude Code）下的工程估时"，说明可压缩与不可压缩部分（审校、等待、监控） |
| R24 | §H 编号（#24） | 统一为 H1–H18，见下文第三节；各文档引用此编号，删除各自私设的 H7/H8 |
| R25 | 指南 hub 门槛 | ≥2 篇指南时才生成 hub（02） |
| R26 | 译文显示样式数量 | 源码是 7 种（`TranslationSettings.swift:460-476`），对外文案**不写数量**，写"多种样式（引用条、背景、边框、下划线…）" |
| R27 | 首页 H1 不含品牌名（03 问题 1） | **接受**。条件：eyebrow（H1 上方可见）、首段定义句（"WordByWord is an iPhone and iPad app…"）、title 首词必须含品牌；logo alt 为 "WordByWord" |
| R28 | 第三人称规则 | 站点文案提到 SE 时用"同一开发者的 SurfEnglish"之类第三人称；不用 "our sister app"（08 §1.1） |

## 二、补充裁定

| # | 议题 | 裁定 |
|---|---|---|
| R29 | **先冻结旧站**（06 修订 1；07 R06/R07） | M0 第一步：从 `7a389ba` 建 `legacy-pages` 分支，把 GitHub Pages 发布源切到该分支；之后 main 才能合入新架构代码。写入 06 Runbook、07 WBS 的首个任务与风险表 |
| R30 | **设计文档入库策略** | 仓库是 public（F1），文档含 DNS/后端等内部信息 → 默认**不入公开仓库**（本地保留，或放私有仓库，或脱敏后再提交）；列为 H10。原型只作为设计参考，不进生产 `dist` |
| R31 | X 截图中日文原文下的 "Extract chunks" 按钮（05 问题 2） | 不得用于暗示语块支持非英语；X 场景图须裁掉该按钮，或只用于"X 双语阅读"且图注不提语块；按钮实际行为列为 H11 待确认 |
| R32 | 截图中的第三方内容 | VOA / Wikipedia / NHK 的文章文本作为界面演示可用；避免显眼的品牌推广帖（OpenAI、GitHub 等）与真实人名标题；头像做模糊处理 |
| R33 | zh-Hant 截图回落 | 默认用 **en** 截图（避免繁简错位）；用户可在 H11 中改选 zh-Hans 截图 |
| R34 | OG 图 / favicon 渲染工具 | 允许本机用 Chrome headless 渲染（开发期工具，产物提交入库；SE 的 `promo/render.mjs` 已有先例） |
| R35 | 公告开启时的 SE 卡片 | site-notice 开启时**不渲染**落点 ①（04 R5），其余落点不变 |
| R36 | **母语审校策略**（07 最大外部依赖） | en + T1（ja、zh-Hans、zh-Hant、ko）上线前必须经母语审校：默认由用户本人审校 zh-Hans / zh-Hant / ja（如用户不具备，则须外部审校）；ko 需外部母语审校，若 T-7 前无着落，则 ko 以"双模型互检 + 回译 + 术语表 lint"上线并标记待复核。T2/T3 以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校。**不再作为无默认值的阻塞项** |
| R37 | 旧站止损 | 可选的 M0 quick win：在旧站把 `surfenglish-promo.js` 的 `showBar` 设为 false（去掉固定顶部条）。属于线上改动，**需用户确认后执行**（H18） |
| R38 | 语言切换埋点（02 问题 3） | 新增 `language_switch` 事件（from/to locale），不计入 `nav_click`/`footer_link_click`；GA 报表断层用 06/02 的对照表处理 |

## 三、统一的待用户提供 / 确认清单（H1–H18）

| 编号 | 事项 | 阻塞 | 未提供时的默认 |
|---|---|---|---|
| H1 | GSC「网页」「国家」导出、`ja-top.html` URL 检查 | 不阻塞（M6 基线） | 用 00 基线 |
| H2 | GA4 各页面流量、`surfenglish_promo` 各 label 基线 | M5（T-7 前导出） | 上线后前 8 周作为基线 |
| H3 | ASC Provider Token（`pt`） | 不阻塞 | 输出不带 pt 的链接并告警 |
| H4 | Chrome Web Store listing URL | 不阻塞 | 扩展页 S0 |
| H5 | CWS 后台登记的扩展隐私政策 URL | 不阻塞 | 按契约 URL 处理 |
| H6 | GA Consent Mode 与 privacy 页是否改写 | 不阻塞 | `consentMode='off'`（建议 `'ads-denied'`），privacy 不写隐私断言 |
| H7 | 母语审校安排（尤其 ko、T2/T3） | M3 | 按 R36 |
| H8 | Google Cloud DNS 中 `www` 记录的编辑权限、zone 全表导出；GSC 网域属性验证方式 | **M5** | 无默认 |
| H9 | Cloudflare 账号新建 Pages 项目权限；应急部署 API Token | **M1** | 无默认 |
| H10 | `docs/`、`prototype/` 是否进入公开仓库 | M1（仅影响提交） | 不入库（R30） |
| H11 | 素材确认：X 截图 "Extract chunks" 按钮行为、第三方内容、zh-Hant 截图回落 | M2 | R31–R33 |
| H12 | about 时间线中 1.1 / 1.2 的日期；扩展是否收费、能否标 Beta | M2 | 不写具体月份；写 "Coming soon"，不标价格 |
| H13 | 本地翻译引擎能否离线使用 | 不阻塞 | 不写"离线" |
| H14 | SE 仓库配套 PR 的授权与排期 | M3 / M6 | WBW 先上线，SE PR 随后 |
| H15 | `twitter:creator`、`sameAs` 是否沿用 `@JinlongDev` | 不阻塞 | 沿用 |
| H16 | WBW iOS 下一版本的提交时间（ASC 本地化 Marketing URL、US 描述首行备注） | M6 | 延后 |
| H17 | `backend-test` 风险是否已知、有无计划 | 不阻塞（范围外） | 登记为风险 |
| H18 | 是否立即在旧站关闭固定顶部推广条（R37） | 不阻塞 | 不做 |

---

## 四、v1.2 裁定（根据对抗性评审 13-review-findings.json，2026-10-05）

> 评审共 89 条（SEO 14 / 产品 19 / 工程 17 / i18n 15 / 视觉 24）。**默认全部接受**，按各条 `fix` 执行；
> 以下裁定覆盖或修正 R1–R38 中的相关条目，并处理需要主控拍板的事项。被下列裁定改写的旧裁定以本节为准。

### 定位与 SurfEnglish 推荐（最高优先级）

| # | 议题 | 裁定 |
|---|---|---|
| R39 | **WBW 定位不变**（PRO-02；用户原话"WordByWord 官网身份/定位仍然是不变的"） | WBW 的定位是"**用真实网页学外语的阅读助手**"（翻译 + 查词 + 朗读，覆盖多种语言），不是纯翻译工具。首页定义句、hero 副文、FAQ "What is WordByWord" 必须写明它为**学外语/读外语的人**而做（en 例："WordByWord is a reading assistant for language learners on iPhone and iPad…"）。关键词归属不变：WBW 不以"学英语"作主词，但**通用的"语言学习 / learn languages by reading / 外語学習 / 外语学习"属于 WBW**，可进 title 后半、description、H1 副句。03 的 K 表与 20 个 title/description/H1 草案据此复核 |
| R40 | **SE 推荐的叙事轴**（PRO-01 blocker、SEO-13、PRO-08、PRO-13） | 从"WBW 管多语言、SE 管英语、SE 可能更适合你"改为"**互补、也值得一试**"：WBW 让你读**任何你想读的网页**；SE 是同一开发者为学英语的人做的另一种练法——**按水平分级的每日英语新闻 + 复习小游戏**，沿用你熟悉的右滑翻译与双击查词。**禁止**"may suit you better / 可能更适合你 / より合うかも"一类替换性措辞，禁止暗示 WBW 是旧版或将被取代（SE 侧文案同样适用，删除 "earlier app" 类说法；WBW about 时间线不以 SE 发布收尾）。SE 区块 H2 **以 SurfEnglish 品牌开头**（例："SurfEnglish: daily English news at your level, from the developer of WordByWord"），并纳入 seoLint（H2 也检查"学英语"开头） |
| R41 | **SE 卖点必须是 WBW 没有的、且不贬低 WBW**（PRO-03） | 可用卖点：A1–C1 分级英语新闻信息流、复习小游戏（Sentence Builder / Word Raid）、从 Safari 分享文章进 App（须核实 SE 分享扩展存在）。**不得**把"端侧/离线语音"作为 SE 独有卖点（WBW 的 Local Read 同样是端侧 iOS 语音） |
| R42 | **落点精简**（PRO-05、PRO-04；取代 R4） | 删除落点 ③（语言段提示），落点为 ① 卡片、② FAQ 一问、④ 页脚、⑤ /about/、⑥ SE 侧反向链接。**zh-Hans 页只保留 ② FAQ、④ 页脚、⑤ about**（不渲染 ① 卡片），并在 FAQ 中如实注明"SurfEnglish 目前未在中国大陆 App Store 上架" |
| R43 | **WBW 的转化入口优先**（PRO-07、VIS-14；修正 R11/R3 相关） | 价格区**必须有 WBW 的 App Store 徽章**。SE 卡片**不使用黑色 App Store 徽章**，改为文字链接（"Get SurfEnglish on the App Store →" + "surfenglish.app"），视觉权重低于 WBW 的任何 CTA。FAQ 之后的 WBW 最终 CTA 加强（App 图标 + 徽章 + 一句要点回顾），确保页面下半部的视觉重心属于 WBW |
| R44 | **SE 卡片配图**（VIS-01；取代 R11 的选图部分） | 用 SE 官网现有 `games-home.jpg` 的上部裁切（Games 标题 + Sentence Builder / Word Raid 卡片，内容中性、无第三方新闻、展示 WBW 没有的游戏功能）；备选 `game-word-raid.jpg`。不再使用任何新闻 feed 截图 |
| R45 | **扩展 FAQ 在 S0 下的表述**（PRO-06） | S0 时 FAQ/首页不出现扩展的具体名称，只说"桌面浏览器扩展正在准备中"并链到扩展页；S1 时才写名称与 listing 链接。两态都须避免把用户引到 WordByWord.io 的同名扩展 |

### SEO / 度量

| # | 议题 | 裁定 |
|---|---|---|
| R46 | 首页 vs 指南的关键词唯一映射（SEO-01、PRO-19） | 03 增加"关键词 → URL 唯一映射表"并进 seoLint。首页主词为**产品/品类意图**（en 如 "bilingual web reader / translator app for iPhone"，zh-Hans "网页双语对照翻译 App"，ja/ko 保留含 アプリ/앱 的写法）；"how to translate web pages on iPhone (keep original)" 类 how-to 查询只归 G1 指南。H1 与 CTA 文案不得暗示整页翻译（写"段落/每段下方"），不得与 G1 标题重复 |
| R47 | Content-Language（SEO-04、ENG-07、I18-14） | **不输出** Content-Language HTTP 头；保留 `<html lang>`；保留 `<meta http-equiv="content-language">`，值用 Bing 惯用的 语言-地区 形式（zh-Hans→`zh-cn`、zh-Hant→`zh-tw`、pt-BR→`pt-br`，其余为语言码）；W3C 闸门对这一条做显式 allowlist |
| R48 | `/legal/*`（SEO-05） | 不加 noindex，靠 canonical 指回契约 URL |
| R49 | 索引一致性校验（SEO-06） | 06 新增 D-20：indexable ⇔ 无 noindex ⇔ 有自引用 canonical ⇔ 在 sitemap；noindex 页不得进 sitemap/hreflang 簇；verify-deploy 逐页断言。原型 head 的 `noindex,nofollow` 不得带入模板 |
| R50 | KPI 口径（SEO-07、SEO-08；修正 R18 配套） | 非品牌 = 未筛选总量 − 品牌正则匹配量（记录匿名占比）；非英语 KPI 用"网页"维度（`/<locale>/` 前缀）。删除"全站点击 ≥57"阈值，改为品牌桶点击 ≥ 基线 80% + 非品牌点击；"word by word" 单列观察并给预期区间；点击类告警需连续两个 28 天窗口不达标 |
| R51 | 外链价值（SEO-02；修正 H14 默认） | App Store 指向官网的链接是 nofollow：ASC Marketing URL 改语言页只算"发现/引荐入口"。**PR-SE-1 在 T0 前合并；PR-SE-2（SE 页脚按 locale 链到 WBW 语言页）在 T+7d 内合并** |
| R52 | SE 侧防蚕食（SEO-03） | PR-SE-1 增加 S7：SE 12 个 locale 的 "Any website, read bilingually" 类标题加"英文/English"限定；从 SE meta.keywords 删除归属 WBW 的词；SE build 加镜像 lint |
| R53 | pt hreflang（SEO-12、I18-13） | `/pt-br/` 同时标注 `hreflang="pt-BR"` 与 `hreflang="pt"`（sitemap 同步） |
| R54 | `_redirects` 唯一事实源（SEO-14、ENG-02、ENG-03） | **02 的映射表是唯一规格**（含 D 组别名、尾斜杠契约变体）；06 生成器必须逐条产出并以 02 为测试夹具；D-12 链式跳转校验豁免契约 200 代理规则 |
| R55 | ct 与 Smart App Banner（ENG-06；扩展 R3） | WBW 自身的 App Store `ct` 也**只按落点**（`wbw-hero`、`wbw-pricing`、`wbw-cta`、`wbw-ext`…，≤30 字符），locale 看 GA |

### 工程 / i18n / 视觉

| # | 议题 | 裁定 |
|---|---|---|
| R56 | 旧站冻结验收（ENG-01 blocker；修正 R29） | 不用 last-modified；改为对比切换前后关键 URL 的响应体 md5（`/`、`/ja-top.html`、`/privacy.html`、`/support.html`）与 HTTP 状态 |
| R57 | 应急公告发布路径（ENG-04） | 公告改动从**生产分支**（`cloudflare-deploy`）拉 hotfix 分支提交并部署，再合回 main；不得从 main 直接部署到生产 |
| R58 | AVIF 校验（ENG-05） | 定义可执行的解码校验：用 `sips -s format png` 回解 AVIF，再用 node 读取 PNG 的 alpha 通道统计（或 Chrome headless 截图像素抽样），透明像素占比 > 阈值即失败；写进 `scripts/check-images.mjs` |
| R59 | 字符串冻结与 OG 生成时点（ENG-11、ENG-12） | strings-v1 冻结在 en 模板全部完成（M2-03/M2-05）之后；17 个 locale 的 OG 图在 M3 审校定稿后统一生成，审校改动后重新生成 |
| R60 | 文字系统属性（I18-04） | LOCALES 增加 `script` 字段（latn/cyrl/cjk/thai/deva/arab），模板输出 `<html data-script>` |
| R61 | 断行标记（I18-03） | 不用 `｜` 作断行标记（与 CJK title 分隔符冲突）；locale JSON 中用 `{wbr}` 记号，构建时转 `<wbr>`，在 title/meta/JSON-LD 中剥除 |
| R62 | 复数（I18-02） | 占位符支持基于 `Intl.PluralRules` 的复数形式（如 `{targetLanguages, plural, one{…} few{…} many{…} other{…}}` 的最小实现），ru/uk/ar/pl 等必须使用 |
| R63 | ar 手势方向（I18-01） | App 按**物理方向**判定右滑；ar 页文字写"向右滑"，手势示意、速度线等表示手势方向的元素**不镜像**；其余布局按 RTL 镜像 |
| R64 | 术语 lint（I18-06、I18-07） | 08 的术语表落地为 `src/data/glossary/<locale>.json`（必须用词 + 禁用变体），06 定义 lint；zh-Hant 台湾用语清单扩充（≥40 组），并注明 App 的 zh-TW 界面本身有大陆用语——引用 App 按钮名时照 App，正文用台湾用语 |
| R65 | 荧光笔母题（VIS-02） | 荧光笔只用于 **hero H1 的一个短语** 和 **样张/截图中的查词演示**；其它 section 标题改用排版层级、红色引用条或速度线 eyebrow，不再加黄块 |
| R66 | hero 样张内容（VIS-03） | 去掉灰色骨架条，改为自写的完整"文章"（标题 + 2–3 段衬线正文），让首屏像一页被批注过的读物 |
| R67 | 截图状态栏（VIS-04） | 截图裁掉原始状态栏，由 CSS 机身统一绘制 9:41 状态栏 |
| R68 | 页面节奏（VIS-05、VIS-06、VIS-07、VIS-08、VIS-16） | 05 重定字号阶梯（section H2 与功能 H3 拉开层级）、合并相邻分区内边距；4 列图标规格行改为排版式"规格清单"；价格区去掉 Free/Plus 两张复述卡（表格 + 一行摘要 + WBW 徽章）；languages 与 pricing 底色交替 |
| R69 | 手机首屏（VIS-11、PRO-09；修正 R20） | <560 宽：H1 → 一句短副文 → CTA（含"免费下载 · iPhone & iPad"一行）→ 样张，样张红色译文条须在 844px 高视口内可见；长 platformNote 移到样张之后。页面长度目标仍为 ≤13,000px |
| R70 | 品牌可见性与暗色（VIS-12、VIS-13） | 手机端保留字标（可缩小），logo 链接有可读名称；暗色模式下 App 图标加 1px 浅色描边/底板，favicon 提供暗色适配版本 |
| R71 | X 卡片素材（VIS-15；补充 R31/R32） | ja / zh-Hans（以及无合规截图的 locale）的"读 X"卡改用 **HTML/CSS 通用社交帖样张**（自写文本、无 X 标志与真实账号），en 可用裁掉 "Extract chunks" 按钮的 X 截图 |
| R72 | 原型修正回写（VIS-24） | 原型 README §4 中已验证的修正（D1/D2/D6/D10 等）回写进 05，避免实施时倒退 |
| R73 | FAQ 增补（PRO-17、PRO-18） | 增加支持类问题：是否需要注册账号、如何恢复购买、是否有 Android 版；删除未经确认的"名字含义=逐词细读"品牌叙事 |

---

## 五、v1.3 裁定（根据修订轮与一致性审计的遗留项，2026-10-05）

| # | 议题 | 裁定 |
|---|---|---|
| R74 | SE 推荐的 locale 键命名 | 以文档 04 §3.7 / 文档 06 的 **`sibling.card.*`** 为准；文档 08 中的 `sibling.section.*` 机械改名为 `sibling.card.*`；`sibling.languagesTip` 键删除（落点 ③ 已取消，R42） |
| R75 | SE 文案唯一来源 | **文档 08 是全站文案（含 SE 推荐文案）的唯一来源**。文档 04 保留原则、受众模型、落点规格、20 locale 矩阵、度量与 SE 侧 PR，文案部分改为"键 → 文档 08 位置"的索引表，不再保留第二份定稿文案 |
| R76 | 指向 SE 官网的锚文本 | 锚文本用 **SE 在该语言的核心词短语**（如 en "Read English news at your level with SurfEnglish"，具体以文档 08 为准），链接到 SE 对应语言页；不使用裸域名 "surfenglish.app" 作锚文本。App Store 文字链接写"Get SurfEnglish on the App Store →"（本地化）。R43 括注中的 "surfenglish.app" 指链接目标，不是锚文本 |
| R77 | 原型补出的文案键 | 以下键并入文档 06 schema 与文档 08（en/ja/zh-Hans 定稿）：`hero.ledeShort`、`hero.ctaNote`、`hero.how`、`demo.articleTitle`、`demo.context`、`pricing.summary`、`cta.recap`、`nav.downloadShort`、`demo.byline`（样张署名行；原写作 about.byline，v1.3 验收更正）、X 卡样张 `features[x].sample{handle,time,source,translation}`（各 locale 自写，虚构账号，无 X 标志）。键名以文档 06 v1.1 已定义者为准，原型 README D1–D4 的临时字段一并收编 |
| R78 | 规格清单文案长度 | 规格清单每条正文 en ≤80 字符、CJK ≤40 字；文档 08 缩写现有 4 条 |
| R79 | 图片管线（修正 R8 / R58） | **裁切在 node 中完成**（解码 PNG → 裁切 → 编码，参照原型 `tools/png.mjs`；sips 的 crop 在偏移 0 0 与贴底时不可靠）；sips 只做缩放与格式编码。AVIF 校验闸门 = **结构检查（偶数宽高、分块）+ Chrome headless 实际解码后的 alpha 抽样**；sips 回解只作辅助，不作闸门 |
| R80 | en 母版文案审校 | en 不设外部母语审校为上线前置：由用户通读 + 双模型互检（可读性、事实、禁用表述）后上线；不阻塞 T0 |
| R81 | about 页可见署名 | 页面可见文本**不出现 "Chi Jinlong"**（U4：对外署名为 Jinlong）；去歧义声明改为链接到 App Store 开发者页（"WordByWord on the App Store"）；JSON-LD `alternateName: "Chi Jinlong"` 保留（U4 已同意） |
| R82 | 语块下划线与品牌红 | 手机样张按 iOS 实际（1px 实线）；Chrome 扩展页样张按扩展实际（波浪线）；站点其它位置不把语块下划线当装饰。品牌红以 sRGB **#CC3355** 为准（小字号红字用 05 的 #B32847） |
| R83 | 基线 §B4 澄清 | 不含"英语"的通用学习词（语言学习、learn languages by reading、外国語学習…）归 WBW（R39）；"Chunks/语块"作为 WBW 功能名可出现在功能 H3 中，但须带"English/英语"限定，且不进 title/H1 |
| R84 | SE 卡片在 320px 宽 | R10 的 ≤480 适用于 ≥375px 视口；320px 下 ≤560 可接受 |
