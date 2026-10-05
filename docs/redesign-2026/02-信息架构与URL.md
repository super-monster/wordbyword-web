# WordByWord 官网重构 · 02 信息架构、URL 与多语言架构

| 项 | 内容 |
|---|---|
| 版本 | v1.1 |
| 日期 | 2026-10-05 |
| 依赖文档 | 研究报告 `appendix/research/00-gsc-baseline.md`（GSC 基线）、`01-wbw-structure.md`（结构审计）、`02-wbw-tech-seo.md`（技术 SEO）、`03-se-architecture.md`（SE 架构）、`06-seo-practices.md`（SEO 实践）、`09-infra-risk.md`（基础设施与风险）、`10-fact-check.md`（事实核查，F1–F36）、`11-design-baseline.md`（设计基线）、`12-rulings.md`（主控裁定 R1–R84，含 v1.3 第五节；统一待办 H1–H18）、`13-review-findings.json`（对抗性评审）；源码：`wordbyword-web`、`WordByWord-translate-extension`、`SurfEnglishWebsite` |
| 状态 | 设计稿（已评审修订） |
| 范围 | 页面清单与分期、URL 规则、locale 表、旧 URL 迁移与 **`_redirects` 唯一规格及测试夹具**（R54）、契约 URL、hreflang、canonical、sitemap、robots、导航与内链、语言建议条、Phase 2 路径预留、与 SurfEnglish 的 IA 关系 |
| 不在范围 | 文案与关键词（文档 03、文档 08）、视觉与组件（文档 05）、兄弟推荐区块的话术与体量（文档 04）、构建实现与部署 Runbook（文档 06） |

标记：【决策】本文定案；【裁定】直接落实主控裁定；【事实】有出处；【建议】可选或待实测。
引用写法：「研究 09 §3.5」指 `appendix/research/09-infra-risk.md` 第 3.5 节；「文档 06 §3.6.3」指本批设计文档 06；「F24」指研究 10 §4 的事实条目；「R54」指 `appendix/research/12-rulings.md` 的裁定；「H4」指裁定第三节统一编号的待提供清单 H1–H18；「基线 §C」指 `appendix/research/11-design-baseline.md`；「SEO-05 / ENG-03 / I18-04」指评审条目（`13-review-findings.json`）。裁定优先于本文旧写法；本文与其它文档的不一致以裁定为准。

---

## 0. 摘要

1. 【决策】主机固定为 `https://www.word-by-word.app`，`/` 永远是英文首页兼 x-default，URL 不变（F25：品牌词 "wordbyword" 排名 1.6，全部落在 `/`）。
2. 【决策】Phase 1 共 20 个语言首页（`/` + 19 个 `/<locale>/`），加上 `/about/`、Chrome 扩展子站（`/chrome-extension/` en + `/zh-hans/chrome-extension/` zh-Hans，R1）、3 个契约 URL、en 版 404（本地化 404 是 M4 可选项，R21）、robots、sitemap。sitemap 有 23 个（S0）或 26 个（S1）URL。
3. 【决策】locale 路径全部小写（`zh-hans`、`zh-hant`、`pt-br`）；hreflang 和 `<html lang>` 用规范大小写（`zh-Hans`、`zh-Hant`、`pt-BR`）；`og:locale` 用 `ll_CC`（`ja_JP`、`zh_CN`）；`<html>` 另带 `data-script`（R60）；`<meta http-equiv="content-language">` 用 Bing 惯用的"语言-地区"写法（`zh-cn`、`zh-tw`、`pt-br`，其余写语言码），**不输出** Content-Language HTTP 头（R47）。不照抄 SE 的写法（F23、研究 03 §1.7）。
4. 【裁定】**本文 §5.2 是 `_redirects` 的唯一规格和测试夹具**（R54）。文档 06 的生成器必须逐条产出，构建校验 D-12 拿 §5.2 当夹具做断言。默认配置为 **67 条静态、7 条动态**；两个实验组全开时为 76 条静态、10 条动态，远低于 2,000/100 的上限。v1.0 写的"62/7"是计数错误：C 组实际是 40 条，不是 42 条。v1.1 又补了 7 条带尾斜杠的别名。旧 URL 一律单跳 301；`/backup/*`、旧图片、旧 CSS/JS 不做跳转，直接 404。
5. 【决策】契约 URL `/privacy.html`、`/support.html`、`/chrome-extension/privacy.html` 优先用 C-1：在原地址 200 直出，内容实际放在 `/legal/*/`，由 `_redirects` 的 200 规则映射回来。`/legal/*` **不加 noindex**，靠 canonical 指回契约 URL（R48）。C-1 必须先在 preview 上按 §5.4 实测；哪个 URL 没通过，就只把它退回 C-2（单跳 308）。
6. 【决策】hreflang 簇按"页面键"组建，只包含已生成且可索引的语言版本。每个成员都列出自己和其它所有成员；有英文版时，x-default 指向英文版；只有一种语言的页面不输出 hreflang。`/pt-br/` 同时标注 `pt-BR` 和 `pt` 两个码（R53），所以首页簇共 22 条 `<link rel="alternate">`。这个数字由 `LOCALES` 计算得出，不写死。HTML `<link>` 和 sitemap `xhtml:link` 用同一个函数生成，构建时断言两者一致。
7. 【决策】语言切换器是 `<details>` 加 `<a href hreflang lang>` 列表，header 和 footer 各放一份，不依赖 JS。链接指向"同一页面的对应语言版本"，没有该语言版本时回落到该语言首页。点击上报 `language_switch` 事件，携带 from/to locale，不计入 `nav_click`/`footer_link_click`（R38）。
8. 【决策】不做任何服务端自动语言跳转。【建议】只在有对应语言版本的页面上显示一条语言建议条：固定在底部、可关闭、带 `data-nosnippet`，不产生 CLS。
9. 【裁定】扩展子站按 `SITE.chromeStoreUrl` 分两态（R2、R16、R45）。**S1**（已提供 listing URL）：可索引，进 sitemap，header 导航显示 "Chrome extension"，CTA 指向 listing。**S0**（默认）：`noindex,follow`，不进 sitemap，header 导航**隐藏**该项，页脚保留链接，CTA 为 "Coming soon" 加联系方式；首页 FAQ 只说"桌面浏览器扩展正在准备中"，不出现扩展名称。两态下扩展页都要写明与 WordByWord.io 的同名扩展无关。`/chrome-extension/privacy.html` 始终可以访问，索引状态跟随扩展页。
10. 【裁定】Header 由 Features / Languages / Pricing / FAQ / Chrome extension（仅 S1）、语言切换器、Download 按钮组成（R16）。页内锚点为 `#features #languages #pricing #faq #surfenglish`，保留 `#screenshots`；价格区的 id 是 `pricing`（R12）。
11. 【决策】Phase 2 内容页预留为 `/guides/<slug>/` 和 `/<locale>/guides/<slug>/`，所有语言共用一个英文 ASCII slug，不做"语言 × 功能"批量页。SurfEnglish 只做编辑性互链：不加 hreflang、canonical、nofollow，也不带 UTM。落点为 ①②④⑤⑥（R42 删除了 ③）；zh-Hans 页只保留 ②④⑤。

---

## 1. 范围、原则与 URL 书写规范

### 1.1 原则

| # | 原则 | 依据 |
|---|---|---|
| P1 | `/` 的地址、语言（en）和品牌主角都不变 | 基线 §B1、§C；F25；R39 |
| P2 | 每个 URL 只有一个规范形式。其它变体（`.html`、无扩展名、无尾斜杠、大小写别名、旧文件名）全部单跳 301/308 到规范形式，契约 URL 例外 | F5（现状一个页面有 2–5 个返回 200 的 URL）；研究 06 §2.2 |
| P3 | 页面清单、locale、hreflang、切换器、sitemap、`_redirects` 都从同一份数据（`LOCALES` + `PAGES` + `CONTRACTS` + `ALIASES`）生成，不手写；`_redirects` 的生成结果以 §5.2 夹具为测试基准（R54） | 研究 09 §6 风险登记表第 4、5 项；研究 06 §1.1（双向回指靠人工维护必然出错） |
| P4 | SEO 标签（canonical、hreflang、og:url、sitemap、JSON-LD）用绝对 URL；站内导航用根相对路径（`/ja/`），这样 preview 部署也能正常导航 | 研究 03 §1.3（SE `layout.mjs:29-31` 的做法） |
| P5 | 声明的语言必须等于正文语言。缺少译文时不生成该语言页，也不进 hreflang 和 sitemap，不做整页英文回退 | 研究 03 §1.4、§1.13 #7；研究 06 §1.1 |
| P6 | 所有被 sitemap 收录的 URL 都要至少有一个站内 `<a href>` 入链 | 研究 06 §0 第 1 条；F4 |
| P7 | 可索引性四项一致：indexable ⇔ 无 noindex ⇔ 有自引用 canonical ⇔ 在 sitemap（按对外 URL 判定，见 §6.2） | R49 |

### 1.2 URL 书写规范【决策】

| 规则 | 规范 | 反例 |
|---|---|---|
| 协议与主机 | `https://www.word-by-word.app`（`SITE.url`） | `http://`、apex、`*.pages.dev` |
| 目录页 | 小写，以 `/` 结尾：`/ja/`、`/about/`、`/zh-hans/chrome-extension/` | `/ja`、`/ja/index.html`、`/JA/` |
| 契约页 | 保持原 `.html` 形式：`/privacy.html`、`/support.html`、`/chrome-extension/privacy.html` | `/privacy`、`/privacy/`（只作为 301 源） |
| locale 段 | 只用 §4 表中的 19 个小写路径段；英文没有前缀 | `/en/`、`/cn/`（只作为 301 源）；`/zh-Hans/`（实验组 C 启用前返回 404，见 §5.2） |
| slug | `[a-z0-9-]`，≤ 60 字符，英文，所有语言共用（§9） | 本地文字 slug、日期、品牌词 |
| 站内链接 | 根相对、带尾斜杠，**不得**指向任何跳转源 | `href="ja-top.html"`、`href="#"` 当 logo 链接（F4） |
| 锚点 | §7.5 注册表中的英文 id，所有语言相同（R12） | 翻译后的 id |

---

## 2. 站点地图

### 2.1 Phase 1 页面清单【决策】

| # | 路径 | 语言 | 目的 | 目标意图 | sitemap | index | 入链来源 |
|---|---|---|---|---|---|---|---|
| P1-01 | `/` | en | 品牌主页，x-default。定位：**用真实网页学外语的阅读助手**（翻译 + 查词 + 朗读，覆盖多种语言，R39） | 品牌导航（wordbyword、word by word app）；产品/品类意图（en 例："bilingual web reader / translator app for iPhone"，R46）。how-to 查询（"how to translate web pages on iPhone"）只归 Phase 2 的 G1 指南，首页不争（R46）。关键词与 URL 的唯一映射表见文档 03（R46 新增） | ✅ | ✅ | 全站 header logo（en 页）；header/footer 语言列表（全站每页）；ASC Marketing URL 与 `sellerUrl`（研究 09 §2.1 C1；App Store 上的链接是 nofollow，只算发现/引荐入口，R51）；SE 官网反链（基线 F⑥，排期见 R51）；旧 `/index.html`、`/en-top*` 的 301；D 组 `/en`、`/en/` 别名 |
| P1-02 | `/<locale>/` ×19 | 各自 | 本地化首页 | 本地语言的产品/品类意图加品牌词（R46；ja/ko 保留含 アプリ/앱 的写法） | ✅ | ✅ | 全站语言切换器和页脚语言列表（每页都链到 20 个首页）；hreflang 簇；sitemap；旧 `*-top` 的 301；D 组别名；（上线后）ASC 按本地化设置的 Marketing URL（研究 09 §2.3，nofollow，R51）；SE 同语言页反链 |
| P1-03 | `/about/` | en | 产品与开发者实体页：WordByWord 是什么、谁做的、与 SurfEnglish 的关系、与 WordByWord.io 无关（这条声明只放在 about 和扩展页，R15） | 实体/导航（WordByWord developer、WordByWord app vs wordbyword.io） | ✅ | ✅ | 全站页脚 "About"；页脚署名 "Made by Jinlong"；首页 FAQ `faq-what-is` 中的"关于"链接；`<link rel="author">` |
| P1-04 | `/chrome-extension/` | en | 扩展产品页（U3；两态见 §3.5） | 导航（WordByWord Chrome extension）；次要：网页悬停双语翻译扩展 | 条件¹ | 条件¹ | header 导航（**仅 S1**，R16）；页脚"产品"列（两态都有，R2）；首页 FAQ `faq-devices`（措辞按 R45）；zh-Hans 版的切换器；CWS listing 的网站字段（S1，且已填写时） |
| P1-05 | `/zh-hans/chrome-extension/` | zh-Hans | 同上（中文） | WordByWord Chrome 扩展 | 条件¹ | 条件¹ | zh-Hans 页的 header（仅 S1）和页脚；zh-Hans 首页 FAQ `faq-devices`；en 版的切换器 |
| P1-06 | `/privacy.html` | en | App 隐私政策（契约 C2–C4） | 导航 | ✅ | ✅ | 全站页脚；iOS App 硬编码（`SubscriptionView.swift:68`、`MoreSettingsView.swift:168`，F12）；ASC；support 页 |
| P1-07 | `/support.html` | en | 支持与联系（契约 C5） | 导航（wordbyword support） | ✅ | ✅ | 全站页脚；ASC Support URL |
| P1-08 | `/chrome-extension/privacy.html` | en | 扩展隐私政策（契约 C6）。两态下都可访问，索引状态跟随扩展页（R2） | 导航 | 条件¹ | 条件¹ | 扩展子站页脚；CWS 后台（H5，未证实） |
| P1-09 | `/404.html`（未匹配的路径返回 404 状态） | en | 迷路后的多语言引导：英文正文 + 20 种语言首页链接列表 | — | ❌ | ❌ `noindex` | — |
| P1-10 | `/robots.txt`、`/sitemap.xml` | — | 抓取入口 | — | — | — | GSC / Bing 提交 |
| P1-11 | `/legal/privacy/`、`/legal/support/`、`/legal/extension-privacy/` | en | C-1 方案下的内容存放路径，不对外 | — | ❌ | 不加 noindex，canonical 指向契约 URL（R48） | **不得**有任何站内链接 |
| P1-12 | `/sitemap-legacy.xml`（临时） | — | 只列 21 个旧 `*-top.html` 和 `/index.html`，加快 Google 发现跳转；上线后 2–4 周删除 | — | — | — | 只在 GSC 提交，不写进 robots.txt（研究 09 §3.9） |

¹ 跟随 `SITE.chromeStoreUrl`（H4）。S1（有合法 listing URL）时 `index`，带自引用 canonical，进 sitemap。S0（为空）时 `noindex,follow`，不写 canonical（R49），不进 sitemap（§3.5）。

本地化 404（`/<locale>/404.html` ×19）不在 Phase 1 范围内，是 M4 可选项（R21；文档 07 M4-12）。前提是 M1-03 spike 证实 CF 支持嵌套 404（§6.9）。

sitemap 中的 URL 数：首页 20 + about 1 + privacy/support 2 = 23；S1 时再加 3（扩展页两个语言版本和扩展隐私页），共 26。

### 2.2 Phase 1 结构树

```
www.word-by-word.app
├── /                               en · x-default · 首页
├── /zh-hans/ /zh-hant/ /ja/ /ko/ /es/ /pt-br/ /fr/ /de/ /it/ /nl/
│   /pl/ /ru/ /tr/ /uk/ /vi/ /th/ /id/ /ar/ /hi/      19 个本地化首页
│   └── /zh-hans/chrome-extension/  扩展页（zh-Hans）
├── /about/                         en · 实体页
├── /chrome-extension/              en · 扩展页（S0 noindex / S1 index）
│   └── privacy.html                契约 C6
├── /privacy.html                   契约 C2–C4
├── /support.html                   契约 C5
├── /404.html                       仅根目录（本地化 404 为 M4 可选，R21）
├── /robots.txt  /sitemap.xml  (/sitemap-legacy.xml 临时)
├── /_redirects  /_headers          CF 保留文件，不对外
└── /legal/{privacy,support,extension-privacy}/   C-1 存放路径，不链接
```

### 2.3 Phase 2（上线后 1–3 个月）【决策：只预留路径；内容与选题由文档 03 定稿】

| # | 路径 | 语言 | 目的 | 进入条件 | sitemap / index |
|---|---|---|---|---|---|
| P2-01 | `/guides/<slug>/` | en | 信息型长尾。候选选题见研究 07 §8.1：在 iPhone 上翻译网页并保留原文（G1，独占这类 how-to 查询，R46）；在 iPhone 上双语读 X；与 Immersive Translate 的诚实对比（必须写明对方有 Safari 扩展能力，F29）；word-by-word 与 sentence-by-sentence 翻译的区别 | 每篇都有只有开发者能写出的内容（真实操作和限制，F14–F15） | ✅ / ✅ |
| P2-02 | `/<locale>/guides/<slug>/` | T1：ja、zh-Hans、zh-Hant、ko | 同一指南的本地化版本 | 母语审校通过（`reviewed: true`）才生成；审校安排按 R36 / H7 | ✅ / ✅ |
| P2-03 | `/guides/`、`/<locale>/guides/` | 各自 | 指南索引（hub） | 该语言已有 ≥ 2 篇指南才生成（R25） | ✅ / ✅ |
| P2-04 | `/<locale>/about/` | T1 评估 | 本地化实体页（基线 §C：Phase 2 评估） | 评估结论为"有用"，且母语审校通过 | ✅ / ✅ |

### 2.4 Phase 3（视数据）

| # | 路径 | 条件 |
|---|---|---|
| P3-01 | `/ja/chrome-extension/`、`/ko/chrome-extension/` | 已进入 S1，且扩展在 0.1.2 之后发过新版本（证明仍在维护）（§3.2） |
| P3-02 | T2 语言（es、pt-br、fr、de）的 `/<locale>/guides/<slug>/` | T1 指南在 GSC 中出现非品牌词展示 |
| P3-03 | 目标语言落地页（研究 07 §8.1 的可选项，en，最多 2–4 个） | 需单独评审，默认不做。必须如实写出：中日韩源文不支持双击查词，Chunks/Action Flow 只支持英语（F15）。不得做成程序化矩阵（基线 §C） |
| P3-04 | apex `word-by-word.app` → www | 另立小项，见基线 U1、F34 |

### 2.5 保留路径（任何内容不得占用）

`/about/`、`/guides/`、`/chrome-extension/`、`/legal/`、`/.well-known/`（预留给将来可能的 AASA，研究 06 §7.5）、19 个 locale 段，以及 §5.2 D 组中的别名前缀（`en`、`zh`、`cn`、`zh-cn`、`tw`、`zh-tw`、`pt`）。D-12（f）在构建期检查：任何跳转规则的源都不得与 indexable 页面的规范 URL 相同。静态资源目录（`/assets/`、`/icons/`）由文档 06 §3.5 定，文件名一律带指纹（`favicon.ico` 与 `/icons/*` 除外）。

---

## 3. Chrome 扩展子站（U3）

### 3.1 事实

| 项 | 事实 | 出处 |
|---|---|---|
| 名称与版本 | "WordByWord Translate"，MV3，v0.1.2；最后一次提交是 `1a7ef55`（2026-02-13） | `manifest.json`；F20 |
| UI 语言 | en / ja / ko / zh_CN，4 份 `messages.json` 各 169 个 key，key 集完全一致；`default_locale: zh_CN` | `_locales/*`（本次 python 校验）；`manifest.json:5` |
| 交互 | 鼠标悬停加 Shift 翻译段落；Control 键调出语境释义；侧边栏历史；TTS | `README.md:3`；`manifest.json` 的 `side_panel`、`tts` |
| 目标语言 | 只有 7 种：zh、ja、ko、fr、de、es、en | `src/core/settings.js:19` |
| 浏览器 | 本地模型需要 Chrome / Edge 138+；另有云端翻译（`api.word-by-word.app`） | `README.md:22`；`config.json` |
| 上架状态 | 找不到 listing。现有 CTA 指向通用商店首页；"10,000+ 用户"已被注释掉 | `chrome-extension/index.html:243, 253`；F20 |
| 现有子站 | 只有 `lang="zh-CN"` 一个版本，没有任何入链；页脚把"iOS 应用"链到 `../zh-top.html` | `chrome-extension/index.html:2, 319`；F4 |
| 隐私页 | 英文，Effective Date 2026-02-02；所列权限与 manifest 不符 | `chrome-extension/privacy.html:156`；研究 01 §5 |
| 撞名 | CWS 上有他人开发的 "WordByWord – Vocabulary Highlighter"；wordbyword.io 也有扩展 | F27 |

### 3.2 做哪几种语言【裁定 R1】

| 方案 | 结论 | 理由 |
|---|---|---|
| 只做 en | ❌ 不够 | 现有子站的读者和唯一的历史互链都是中文；扩展的 `default_locale` 是 zh_CN，CWS listing 的默认语言也是中文。只保留 en 会丢掉现成的中文内容 |
| **en + zh-Hans** | ✅ **Phase 1**（R1） | en 是 x-default，也满足基线的最低要求；zh-Hans 有现成文案可以迁移（需按 §3.6 修正事实），也与扩展默认语言一致 |
| + ja、ko | ⏸ Phase 3 | 扩展 UI 有 ja/ko，术语可以直接取自 `_locales/{ja,ko}`，翻译成本低。但扩展未上架，2026-02 以来也没有提交，现在做等于给一个可能没人能安装的产品铺多语言页面。等 P3-01 的条件满足再做 |
| + 其它语言（zh-Hant、es、fr、de…） | ❌ 不做 | 扩展 UI 没有这些语言。落地页语言比产品 UI 语言多会造成误导；"目标语言包含 fr/de/es"不等于"界面是 fr/de/es" |

**规则**：扩展子站的语言集合必须是扩展 `_locales` 的子集（en、ja、ko、zh-Hans）。构建时检查 chrome-extension 页的 `locales ⊆ ['en','ja','ko','zh-Hans']`。文档 06 §3.3 的 `PAGES` 和 L-3 需按 R1 同步为 `['en','zh-Hans']`。

### 3.3 路径【决策】

| 页面 | 路径 | 说明 |
|---|---|---|
| en | `/chrome-extension/` | 保留现有 URL（研究 09 §2.1 C7）。**注意**：该 URL 的正文语言从 zh-CN 换成 en。它没有入链，大概率未被收录（F4），影响可以忽略 |
| zh-Hans | `/zh-hans/chrome-extension/` | 沿用全站 `/<locale>/<page>/` 规则，slug 用英文（§9） |
| 隐私 | `/chrome-extension/privacy.html` | 只有 en，契约 URL 原地保留 |
| `/chrome-extension/index.html` | CF 自动 308 → `/chrome-extension/` | 不需要规则（F24；§5.2.4 Q29） |
| 旧素材 `/chrome-extension/img/*`、`style.css` | 404 | 新页面复用的素材（U2）改走带指纹的路径 |

### 3.4 与 iOS 首页的关系【决策】

- **品牌层级**：WordByWord（品牌）→ iOS App（主产品，各语言首页）→ Chrome 扩展（次级产品页）。扩展页沿用同一套 layout 和 header/footer，不再保留独立的紫色模板站。
- **互链**：首页链到扩展页的入口有三处：header 导航（**仅 S1**，R16）、页脚"产品"列（两态都有，R2）、首页 FAQ `faq-devices`（"能在 iPad、Mac 或电脑浏览器上用吗"，键名以文档 08 为准）。S0 时这条 FAQ 只写"桌面浏览器扩展正在准备中"，链到扩展页，不出现扩展的具体名称；S1 时才写名称和 listing 链接（R45）。扩展页通过 logo、header 的"iPhone App"项和页脚链回**同语言首页**（en → `/`，zh-Hans → `/zh-hans/`）。
- **与同名产品切割**：扩展页（en、zh-Hans 两版、两态）正文都必须写明"与 WordByWord.io 的同名扩展无关"（R2、R15）；任何状态下都不得出现可能把用户引到 WordByWord.io 扩展或 "Vocabulary Highlighter" 的链接（R45、F27）。
- **防蚕食品牌词**：扩展页的 title 和 H1 必须在靠前位置出现 "Chrome"（例如 "WordByWord for Chrome"），品牌导航词交给首页。扩展商店名 "WordByWord Translate" 与 iOS 美区名相同（F17），这一点更要注意。具体文案由文档 03、08 定。
- **首页与扩展页之间不建 hreflang**：两者内容不同，不是互译关系。扩展页只在自己的两个语言版本之间建簇（§6.4）。
- 兄弟推荐：扩展页只保留页脚的家族链接（落点 ④），不放推荐区块（基线 F、F36、R42）。
- 实体：JSON-LD 中扩展单独使用一个 `@id`（`/chrome-extension/#app`），细节见文档 03。

### 3.5 扩展子站状态机（H4）【裁定 R2、R16、R45】

| 维度 | **S0 未提供**（默认） | **S1 已提供 listing** |
|---|---|---|
| 条件 | `!SITE.chromeStoreUrl`（`null` 或 `''`） | URL 通过下方校验 |
| header 导航项 "Chrome extension" | **隐藏**（R2、R16） | 显示 |
| 页脚"产品"列链接 | 保留 | 保留 |
| 首页 FAQ `faq-devices` | 只说"桌面浏览器扩展正在准备中"，链扩展页，不写扩展名称（R45） | 写扩展名称和 listing 链接（R45） |
| 页面主 CTA | 不可点击的状态标签 "Coming soon to the Chrome Web Store"，不标 Beta，不标价格（H12 默认）。次级链接"联系我们"（`mailto:app.wordbyword@gmail.com`，subject 预填 `Chrome extension`）。**禁止**链到通用商店首页或 CWS 搜索页（F20、F27） | "Add to Chrome" → listing，加 `data-ga-event="chrome_store_click"`（绕开 `analytics.js:86-87` 识别不到新域名的 bug，F9） |
| 扩展页 header 主按钮 | WBW 的 App Store 按钮，文字须写明是 iPhone App，不得让人以为是扩展下载（`ct=wbw-ext`，R55） | "Add to Chrome" → listing |
| robots / canonical | `noindex,follow`；**不写 canonical**（R49） | `index,follow`；自引用 canonical |
| sitemap | 不进（扩展隐私页同样不进） | 进（两个语言版本加扩展隐私页） |
| hreflang | 不输出 | en + zh-Hans + x-default |
| JSON-LD | 不写 `downloadUrl`/`installUrl` | 写 `installUrl` |
| `/chrome-extension/privacy.html` | 可访问（C-1 下 200），`noindex`，无 canonical | 可访问，`index`，canonical 为契约 URL |
| 两态共同 | 正文写明与 WordByWord.io 的同名扩展无关（R2、R15） | 同左 |

构建时校验 `chromeStoreUrl`：必须为空，或者匹配 `^https://chromewebstore\.google\.com/detail/[a-z0-9-]+/[a-p]{32}$`，否则构建失败。
状态切换**不影响** `_redirects`（§5.2.1）。v1.0 写的"header 导航项在两种状态下都显示"已被 R2/R16 取代（见 §13 第 1 条）。

### 3.6 内容约束（交给文档 08）

扩展页的表述只能以 §3.1 的事实为准：目标语言 7 种（现页 FAQ 写的"20+ 种"是错的）；"悬停 + Shift"；本地模型需要 Chrome/Edge 138+；AI 释义来自 OpenAI / Gemini 模型，不写 "ChatGPT 驱动"（研究 05 §7 #16）；删除被注释掉的"10,000+ 用户"。扩展隐私页的权限描述要与 `manifest.json:13-21` 对齐（研究 01 §5）。扩展是否收费、能否标 Beta 待 H12 确认；确认前按 S0 默认写法处理。

---

## 4. Locale 表

### 4.1 总表【决策】

表中的顺序就是 `LOCALES` 的数组顺序，切换器、hreflang 列表、sitemap 都按这个顺序输出。

| # | code | 路径 | hreflang | og:locale | html lang | content-language（R47） | data-script（R60） | dir | 原生名 | 来源旧文件（旧 lang） | 本地化截图（F31） | SE locale | 徽章 locale（F28、I18-15） | 优先级 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | en | `/` | en | en_US | en | en | latn | ltr | English | `index.html`、`en-top.html`（en） | ✅ `img/en/`、`Resources/wbw_en` | ✅ `/` | en-us | T1 |
| 2 | zh-Hans | `/zh-hans/` | zh-Hans | zh_CN | zh-Hans | zh-cn | cjk | ltr | 简体中文 | `zh-top.html` ≡ `cn-top.html`（zh-CN） | ✅ `Resources/wbw_zh` | ✅ `/zh-hans/`（只做落点 ②④⑤，R42） | zh-cn | T1 |
| 3 | zh-Hant | `/zh-hant/` | zh-Hant | zh_TW | zh-Hant | zh-tw | cjk | ltr | 繁體中文 | `tw-top.html`（zh-TW） | ❌（默认回落 en，R33） | ✅ `/zh-hant/` | zh-tw | T1 |
| 4 | ja | `/ja/` | ja | ja_JP | ja | ja | cjk | ltr | 日本語 | `ja-top.html`（ja） | ✅ `Resources/wbw_jp` | ✅ `/ja/` | ja-jp | T1 |
| 5 | ko | `/ko/` | ko | ko_KR | ko | ko | cjk | ltr | 한국어 | `ko-top.html`（ko） | ❌ | ✅ `/ko/` | ko-kr | T1 |
| 6 | es | `/es/` | es | es_ES² | es | es | latn | ltr | Español | `es-top.html`（es） | ❌ | ✅ `/es/` | es-es | T2 |
| 7 | pt-BR | `/pt-br/` | pt-BR **+ pt**⁴ | pt_BR | pt-BR | pt-br | latn | ltr | Português (Brasil) | `pt-top.html`（pt） | ❌ | ✅ `/pt-br/` | pt-br | T2 |
| 8 | fr | `/fr/` | fr | fr_FR | fr | fr | latn | ltr | Français | `fr-top.html`（fr） | ❌ | ❌ → `/` | fr-fr | T2 |
| 9 | de | `/de/` | de | de_DE | de | de | latn | ltr | Deutsch | `de-top.html`（de） | ❌ | ❌ → `/` | de-de | T2 |
| 10 | it | `/it/` | it | it_IT | it | it | latn | ltr | Italiano | `it-top.html`（it） | ❌ | ❌ → `/` | it-it | T3 |
| 11 | nl | `/nl/` | nl | nl_NL | nl | nl | latn | ltr | Nederlands | `nl-top.html`（nl） | ❌ | ❌ → `/` | nl-nl | T3 |
| 12 | pl | `/pl/` | pl | pl_PL | pl | pl | latn | ltr | Polski | `pl-top.html`（pl） | ❌ | ❌ → `/` | pl-pl | T3 |
| 13 | ru | `/ru/` | ru | ru_RU | ru | ru | cyrl | ltr | Русский | `ru-top.html`（ru） | ❌ | ❌ → `/` | ru-ru | T3 |
| 14 | tr | `/tr/` | tr | tr_TR | tr | tr | latn | ltr | Türkçe | `tr-top.html`（tr） | ❌ | ❌ → `/` | tr-tr | T3 |
| 15 | uk | `/uk/` | uk | uk_UA | uk | uk | cyrl | ltr | Українська | `uk-top.html`（uk） | ❌ | ❌ → `/` | **uk-ua（v2 接口有本地化徽章）**⁵ | T3 |
| 16 | vi | `/vi/` | vi | vi_VN | vi | vi | latn | ltr | Tiếng Việt | `vi-top.html`（vi） | ❌ | ✅ `/vi/` | vi-vn | T3 |
| 17 | th | `/th/` | th | th_TH | th | th | thai | ltr | ไทย | `th-top.html`（th） | ❌ | ✅ `/th/` | th-th | T3 |
| 18 | id | `/id/` | id | id_ID | id | id | latn | ltr | Bahasa Indonesia | `id-top.html`（id） | ❌ | ✅ `/id/` | id-id | T3 |
| 19 | ar | `/ar/` | ar | ar_AR³ | ar | ar | arab | **rtl** | العربية | `ar-top.html`（ar, rtl） | ❌ | ✅ `/ar/` | **en-us**（ar-sa 无本地化徽章）⁵ | T3 |
| 20 | hi | `/hi/` | hi | hi_IN | hi | hi | deva | ltr | हिन्दी | `hi-top.html`（hi） | ❌ | ✅ `/hi/` | **en-us**（hi-in 无本地化徽章）⁵ | T3 |

² es 的 og:locale 暂取 `es_ES`。如果文案按拉美用语校对，可以改成 `es_LA`。og:locale 只影响分享卡片，不影响排名。
³ `ar_AR` 是 Facebook locale 列表中阿拉伯语的通用写法。
⁴ 【裁定 R53】`/pt-br/` 同时标注 `hreflang="pt-BR"` 和 `hreflang="pt"`（`hreflangExtra:['pt']`），sitemap 同步输出。旧 `pt-top.html` 是 `lang=pt`（F2），原本覆盖所有葡语用户；只标 pt-BR 时，葡萄牙、安哥拉、莫桑比克等地的葡语用户可能被交给 x-default（英文）（SEO-12、I18-13）。`pt` 只出现在 hreflang 中，不进 `og:locale`、切换器和 content-language。
⁵ 【事实，I18-15，2026-10-05 复核】Apple 徽章接口：v2 路径 `…/api/v2/badges/download-on-the-app-store/black/uk-ua` 返回 200（10,867 B），是真正的乌克兰语徽章；v1 路径的 uk-ua 回落为英文图（10,804 B，与 en-us 相同）。`ar-sa`、`hi-in` 在 v2 下返回 404，在 v1 下回落为英文图。所以 uk 用 `uk-ua`（v2），ar、hi 直接用 `en-us`。这修正了 F28 中"uk-ua 回落英文"的说法。文档 05 §5.12、文档 06 §7.4 的 `badges.sh` 需要同步：从 v2 拉取，并断言 HTTP 200、`image/svg+xml`，且除 en-us 外 md5 ≠ en-us。

**列说明**
- **content-language**（R47）：只用于 `<meta http-equiv="content-language">`，取 Bing 惯用的写法：zh-Hans→`zh-cn`，zh-Hant→`zh-tw`，pt-BR→`pt-br`，其余写语言码。`<html lang>` 和 hreflang 不受影响。**不输出** Content-Language HTTP 头（§6.2）。
- **data-script**（R60、I18-04）：取值为 `latn|cyrl|cjk|thai|deva|arab`，模板输出到 `<html data-script>`。文档 05 §3.3 的 CJK 断行与行高、eyebrow 不大写、拉丁负字距等规则都挂在这个属性上，缺了它这些规则会静默失效。
- 截图为 ❌ 的语言：hero 用可本地化的 HTML/CSS 双语样张（基线 §E），真实截图回落到 en 版，alt 本地化（研究 06 §6.2）。zh-Hant 默认用 en 截图，不用简体截图（R33；可在 H11 中改选）。
- SE 列为 ❌ 的 8 种语言：兄弟推荐链到 SE 英文首页，并注明"App 界面为英文等 12 种语言，译文可选你的语言"（基线 F、F36）。话术按 R40（互补、也值得一试），不写"可能更适合你"一类的替换性措辞。
- zh-Hans：只渲染落点 ② FAQ、④ 页脚、⑤ about，不渲染 ① 卡片。FAQ 中如实注明"SurfEnglish 目前未在中国大陆 App Store 上架"（R42、F18）。
- 优先级沿用研究 07 §8.2。T1：上线前必须经母语审校。默认由用户本人审 zh-Hans、zh-Hant、ja；ko 需要外部母语审校，T-7 前没有着落时按 R36 的兜底流程上线并标记待复核。Phase 2 的指南覆盖 T1。T2/T3：以"LLM 翻译 + 回译 + 术语表 lint + 关键词检查"上线，上线后补母语审校（R36）。T3 首页还要修正已知错译（研究 01 §3.4），不做额外内容页（研究 06 §1.6）。
- 原生名用 SE `build.mjs:52-63` 的写法，SE 没有的语言由本表补齐。

### 4.2 数据结构（`src/site.mjs`）【决策】

代码字段名以文档 06 §3.2–3.3 为准（R22）。本文新增 3 个字段：`script`（R60）、`contentLanguage`（R47）、`hreflangExtra`（R53），文档 06 §3.2 需要同步。

```js
// 唯一的 locale 数据源；JSON 文件名 = code（src/locales/zh-Hans.json）
// legacy = 旧文件名前缀（生成 §5.2 C 组）；en 的 'en' 生成 B3/B4；index 由 redirectFlags.indexHtmlRule 生成 B1/B2
export const LOCALES = [
  { code:'en',      path:'',        hreflang:'en',      og:'en_US', native:'English',  dir:'ltr',
    script:'latn', contentLanguage:'en',    legacy:['en'],      badge:'en-us' },
  { code:'zh-Hans', path:'zh-hans', hreflang:'zh-Hans', og:'zh_CN', native:'简体中文', dir:'ltr',
    script:'cjk',  contentLanguage:'zh-cn', legacy:['cn','zh'], badge:'zh-cn' },
  { code:'pt-BR',   path:'pt-br',   hreflang:'pt-BR',   og:'pt_BR', native:'Português (Brasil)', dir:'ltr',
    script:'latn', contentLanguage:'pt-br', hreflangExtra:['pt'], legacy:['pt'], badge:'pt-br' },
  { code:'uk',      path:'uk',      hreflang:'uk',      og:'uk_UA', native:'Українська', dir:'ltr',
    script:'cyrl', contentLanguage:'uk',    legacy:['uk'],      badge:'uk-ua' },
  { code:'ar',      path:'ar',      hreflang:'ar',      og:'ar_AR', native:'العربية',  dir:'rtl',
    script:'arab', contentLanguage:'ar',    legacy:['ar'],      badge:'en-us' },
  // … 共 20 项，与 §4.1 逐列一致
].map((l) => ({ publish: true, ...l }));
```

- 构建期对 LOCALES 的断言（建议并入文档 06 §3.7 的 L/D 规则）：`script` 必须在六个合法值之内；`contentLanguage` 匹配 `^[a-z]{2,3}(-[a-z]{2})?$`；`hreflangExtra` 中的码不得与任何 locale 的 `hreflang` 重复；en 必须 `publish:true`；每页 `<html>` 都要带 `data-script`，且值与该页 locale 一致（I18-04）。
- v1.0 的 `se` 字段（`full`/`no-badge`/`en-site`）已删除（文档 06 §3.2）：SE 推荐的按语言差异由 `SIBLING` 与 `seMode(l)` 推导，取值 `local` / `en-site` / `no-card`，zh-Hans 为 `no-card`（只渲染 ②④⑤，R42；SE 卡片不用任何徽章，R43），见文档 04 §3.7、文档 06 §4.3。
- 截图集（§4.1"本地化截图"列）由文档 06 的 `img.localeSet(l)` 推导；优先级（T1–T3）只在本表中维护，Phase 2 生成指南时如有需要再加 `tier` 字段。
- `PAGES` 的代码形态以文档 06 §3.3 为准。IA 约束：chrome-extension 页的 `locales:['en','zh-Hans']`（R1），`indexable = Boolean(SITE.chromeStoreUrl)`（R2）；`extension-privacy` 契约页的 `indexable` 同样跟随 `chromeStoreUrl`（R2；文档 06 当前写的 `indexable:true` 需要修改）；404 只有 en（R21）。
- 推导函数：`pageUrl(pageKey, code)` 在该语言版本不存在时返回 `null`；`alternatesFor(pageKey)` 返回 `[{hreflang, href}]`，包含附加码和 x-default，HTML 与 sitemap 共用这一个函数（§6.1 HL-9）。

### 4.3 对 GA 维度的影响

`analytics.js` 的 `page_locale` 取自 `<html lang>`（研究 01 §7.1），以下取值会变化。请在 GA 探索报告中用映射表合并新旧值（H2 提供基线后核对）：

| 旧值 | 新值 | 旧页面 → 新页面 |
|---|---|---|
| zh-CN | zh-Hans | `zh-top.html`、`cn-top.html`、旧 `chrome-extension/` → `/zh-hans/` |
| zh-TW | zh-Hant | `tw-top.html` → `/zh-hant/` |
| pt | pt-BR | `pt-top.html` → `/pt-br/` |
| zh-CN | en | 旧 `/chrome-extension/`（zh）→ 新 `/chrome-extension/`（en） |

`language_switch` 事件的 `from_locale` / `to_locale` 参数（§7.2，R38）使用新值。

---

## 5. 旧 → 新 URL 映射与 `_redirects`

### 5.1 映射总表【决策】

| 类别 | 旧 URL（含变体） | 新 URL | 码 | 规则（§5.2） | 依据 |
|---|---|---|---|---|---|
| 英文首页 | `/` | `/` | 200 | — | P1 |
| 首页重复 | `/index.html`、`/index`、`/en-top.html`、`/en-top` | `/` | 301 | B1–B4 | F2、研究 09 §1.5 P3 |
| 简中合并 | `/zh-top(.html)`、`/cn-top(.html)` | `/zh-hans/` | 301 | C01–C04 | F2（md5 相同）、F35 |
| 繁中 | `/tw-top(.html)` | `/zh-hant/` | 301 | C05–C06 | F35 |
| 葡语 | `/pt-top(.html)` | `/pt-br/` | 301 | C13–C14 | 研究 10 §2 C10 |
| 其余 16 种 | `/<xx>-top(.html)` | `/<xx>/` | 301 | C07–C40 | 基线 §C |
| 未发布 locale（`publish:false`） | 该 locale 的旧文件与别名 | `/` | **302**（上线后改 301 到 `/<code>/`） | §5.2.3 | 文档 06 §3.2 |
| 契约 URL | `/privacy.html`、`/support.html`、`/chrome-extension/privacy.html` | 原地址 | 200（C-1） | A1–A3 | F12、研究 09 §3.5 |
| 契约变体 | `/privacy`、`/privacy/`、`/support`、`/support/`、`/chrome-extension/privacy`、`/chrome-extension/privacy/` | 对应的 `.html` | 301 | A4–A9 | F5（GitHub 时期返回 200） |
| C-1 存放路径 | `/legal/privacy/` 等 3 个 | 实验组 L 关闭时 200（canonical 指回契约 URL）；开启时 301 → 契约 URL | 200 / 301 | L1–L3（实验） | R48；§5.4 |
| 扩展首页 | `/chrome-extension/`；`/chrome-extension`、`/chrome-extension/index.html` | `/chrome-extension/` | 200；CF 自动 308 | — | F24 |
| locale 目录变体 | `/ja`、`/ja/index.html` | `/ja/` | CF 自动 308 | — | F24 |
| 别名（含尾斜杠） | `/en`、`/en/`、`/en/…`；`zh`、`cn`、`zh-cn`、`tw`、`zh-tw`、`pt` 同理 | 对应 locale（路径保留） | 301 | D01–D21 | §5.3 第 4 条 |
| 大小写别名 | `/zh-Hans`、`/zh-Hans/`、`/zh-Hans/…`；`zh-Hant`、`pt-BR` 同理 | 小写路径 | 实验组 C：默认 404，实测后 301 | X1–X9（实验） | §5.3 第 5 条 |
| 下线 | `/backup/*`（6 页）、`/README.md`、`/CNAME` | — | 404 | E（无规则） | 基线 §C、F5 |
| 旧图片 | `/img/**`、`/wbw_logo.png`、`/chrome-extension/img/*` | — | 404 | E | 见下 |
| 旧 CSS/JS | `/css/{style,surfenglish-promo}.css`、`/js/{analytics,site-notice,surfenglish-promo}.js`、`/chrome-extension/style.css` | — | 404 | E | 见下 |
| favicon | `/favicon.ico` | 原路径（用 App 图标派生的新文件，U2②） | 200 | — | 浏览器默认请求 |
| http / apex | `http://www…`、`word-by-word.app` | — | CF 默认跳 https（需实测）；apex 不在范围内 | — | 研究 09 §3.2、U1 |

**旧图片、CSS、JS 不做跳转的理由**【决策】
1. 图片 URL 的价值只体现在 Google 图片搜索中，可以忽略（研究 06 §6.2、研究 09 §3.4）。把图片 301 到 HTML 是错误信号；新图片带指纹，也没有一一对应的目标。
2. iOS App 和扩展都不读取站点的 JS（研究 09 §4.1）。切换 DNS 时，访客浏览器里缓存的旧 HTML（`max-age=600`，F7）最多会有 10 分钟加载到无样式页面，可以接受。
3. 上线后 4 周内查看 GSC 的 404 报告和 CF Analytics。如果某个旧图片 URL 有可观的请求量，就补一条"图片 → 新图片"的 301（同时更新 §5.2 夹具）。

### 5.2 `_redirects` 唯一规格与测试夹具【裁定 R54】

本节是 `_redirects` 内容的**唯一规格**，同时也是测试夹具（R54、ENG-03、SEO-14）。文档 06 §3.6.3 的 `buildRedirects` 必须逐条产出本节规则；06 中"49 条"的旧生成器已被取代。

仓库是公开的，设计文档默认不入库（R30、H10），所以 M1-04/M1-06 要把本节的两张夹具**原样转写**进仓库：§5.2.2 存为 `scripts/fixtures/redirects.default.txt`，§5.2.4 存为 `scripts/fixtures/requests.tsv`。build 校验（D-12（g））和 `verify-deploy.sh` 都读这两份文件。改动任何一方，都必须在同一次变更中同步另一方。

#### 5.2.1 开关

| 开关（`src/site.mjs`） | 默认 | 由谁定 | 影响的规则 |
|---|---|---|---|
| `SITE.contractMode` | `'proxy'`（C-1）。可以写成按契约区分的对象，例如 `{privacy:'proxy', support:'file', 'extension-privacy':'proxy'}`，实现逐 URL 降级 | M1-03 spike + §5.4 判定 | A 组、L 组 |
| `SITE.redirectFlags.indexHtmlRule` | `true` | M1-03（`/index.html` 规则会不会循环） | B1、B2 |
| `SITE.redirectFlags.experimentL` | `false` | M1-03 + §5.4 | L1–L3 |
| `SITE.redirectFlags.experimentC` | `false` | M1-03（`_redirects` 匹配是否区分大小写） | X1–X9 |
| `LOCALES[].publish` | `true`（en 必须为 `true`） | 文档 07 §4.4 压缩选项 | C、D、X 组中以该 locale 为目标的规则 |
| `SITE.chromeStoreUrl` | `null` | H4 | **不影响** `_redirects`（S0/S1 只影响索引与导航） |

#### 5.2.2 默认夹具（全部开关取默认值）

格式：每行 `id  from  to  code`，按空白切分；`#` 开头的行和空行是注释。生成的 `dist/_redirects` 去掉 id 列后，**逐行（含顺序）**必须与本表相等；生成器可以输出英文分组注释，比对时忽略。

```
# _redirects — www.word-by-word.app (Cloudflare Pages) — default fixture (02 §5.2.2, R54)
# First match wins. Order: A(200) > A(variants) > [L] > B > C > D(static) > [X static] > D(splat) > [X splat]
# Default budget: 67 static / 7 dynamic; with experiments L+C: 76 / 10 (limits 2,000 / 100)

# ---------- A. Contract URLs: 200 proxy at the legacy .html path (C-1) ----------
A1   /privacy.html                    /legal/privacy/                  200
A2   /support.html                    /legal/support/                  200
A3   /chrome-extension/privacy.html   /legal/extension-privacy/        200
# Extensionless / trailing-slash variants (were 200 on GitHub Pages)
A4   /privacy                         /privacy.html                    301
A5   /privacy/                        /privacy.html                    301
A6   /support                         /support.html                    301
A7   /support/                        /support.html                    301
A8   /chrome-extension/privacy        /chrome-extension/privacy.html   301
A9   /chrome-extension/privacy/       /chrome-extension/privacy.html   301

# ---------- B. English home duplicates ----------
B1   /index.html                      /                                301
B2   /index                           /                                301
B3   /en-top.html                     /                                301
B4   /en-top                          /                                301

# ---------- C. Legacy flat language pages -> /<locale>/ (20 non-en legacy files x 2) ----------
C01  /cn-top.html    /zh-hans/   301
C02  /cn-top         /zh-hans/   301
C03  /zh-top.html    /zh-hans/   301
C04  /zh-top         /zh-hans/   301
C05  /tw-top.html    /zh-hant/   301
C06  /tw-top         /zh-hant/   301
C07  /ja-top.html    /ja/        301
C08  /ja-top         /ja/        301
C09  /ko-top.html    /ko/        301
C10  /ko-top         /ko/        301
C11  /es-top.html    /es/        301
C12  /es-top         /es/        301
C13  /pt-top.html    /pt-br/     301
C14  /pt-top         /pt-br/     301
C15  /fr-top.html    /fr/        301
C16  /fr-top         /fr/        301
C17  /de-top.html    /de/        301
C18  /de-top         /de/        301
C19  /it-top.html    /it/        301
C20  /it-top         /it/        301
C21  /nl-top.html    /nl/        301
C22  /nl-top         /nl/        301
C23  /pl-top.html    /pl/        301
C24  /pl-top         /pl/        301
C25  /ru-top.html    /ru/        301
C26  /ru-top         /ru/        301
C27  /tr-top.html    /tr/        301
C28  /tr-top         /tr/        301
C29  /uk-top.html    /uk/        301
C30  /uk-top         /uk/        301
C31  /vi-top.html    /vi/        301
C32  /vi-top         /vi/        301
C33  /th-top.html    /th/        301
C34  /th-top         /th/        301
C35  /id-top.html    /id/        301
C36  /id-top         /id/        301
C37  /ar-top.html    /ar/        301
C38  /ar-top         /ar/        301
C39  /hi-top.html    /hi/        301
C40  /hi-top         /hi/        301

# ---------- D. Locale prefix aliases: static (bare + trailing slash) ----------
D01  /en             /           301
D02  /en/            /           301
D03  /zh             /zh-hans/   301
D04  /zh/            /zh-hans/   301
D05  /cn             /zh-hans/   301
D06  /cn/            /zh-hans/   301
D07  /zh-cn          /zh-hans/   301
D08  /zh-cn/         /zh-hans/   301
D09  /tw             /zh-hant/   301
D10  /tw/            /zh-hant/   301
D11  /zh-tw          /zh-hant/   301
D12  /zh-tw/         /zh-hant/   301
D13  /pt             /pt-br/     301
D14  /pt/            /pt-br/     301

# ---------- D. Locale prefix aliases: splat (last) ----------
D15  /en/*           /:splat             301
D16  /zh/*           /zh-hans/:splat     301
D17  /cn/*           /zh-hans/:splat     301
D18  /zh-cn/*        /zh-hans/:splat     301
D19  /tw/*           /zh-hant/:splat     301
D20  /zh-tw/*        /zh-hant/:splat     301
D21  /pt/*           /pt-br/:splat       301

# ---------- E. Retired (no rule = 404): /backup/*, /README.md, /CNAME, legacy /img/*, /css/*, /js/*, /chrome-extension/{img/*,style.css} ----------
```

#### 5.2.3 开关增量（在默认夹具上增删，结果同样逐行比对）

| 开关取值 | 增量 | 插入位置 |
|---|---|---|
| `experimentL = true` | 新增 `L1 /legal/privacy/ /privacy.html 301`、`L2 /legal/support/ /support.html 301`、`L3 /legal/extension-privacy/ /chrome-extension/privacy.html 301` | A9 之后、B1 之前 |
| `experimentC = true` | 新增静态 `X1 /zh-Hans /zh-hans/`、`X2 /zh-Hans/ /zh-hans/`、`X3 /zh-Hant /zh-hant/`、`X4 /zh-Hant/ /zh-hant/`、`X5 /pt-BR /pt-br/`、`X6 /pt-BR/ /pt-br/`（均 301）；新增 splat `X7 /zh-Hans/* /zh-hans/:splat`、`X8 /zh-Hant/* /zh-hant/:splat`、`X9 /pt-BR/* /pt-br/:splat`（均 301）。由 LOCALES 中 `hreflang ≠ path` 的项生成 | X1–X6 在 D14 之后；X7–X9 在 D21 之后 |
| `indexHtmlRule = false` | 删除 B1、B2，由 CF 自动 308 兜底（308 同样是永久跳转） | — |
| 契约 k 的 `contractMode = 'file'`（C-2） | 删除 A(k) 的 200 规则和它的两条变体规则，再新增一条 `<bareSlash> <bare> 301`。以 privacy 为例：删除 A1、A4、A5，新增 `A5' /privacy/ /privacy 301`。如果实验组 L 开着，同时删除 L(k) | 原 A(k) 变体的位置 |
| locale L 的 `publish = false` | C 组、D 组中以 `/<L.path>/` 为目标的规则，目标一律改为 `/`、码改为 302（splat 规则的目标同样改为 `/`，丢弃 `:splat`）；删除 X 组中 L 的规则 | 原位置 |

**条数**（D-12 用来断言上限；文档 07 M1-06 的验收数字以本表为准）

| 配置 | 静态 | 动态 |
|---|---|---|
| 默认（A 9 + B 4 + C 40 + D 静态 14） | **67** | **7** |
| + 实验组 L | 70 | 7 |
| + 实验组 C | 73 | 10 |
| + L + C | 76 | 10 |
| 每个契约 URL 降为 C-2 | −2 | 0 |
| `indexHtmlRule = false` | −2 | 0 |

#### 5.2.4 请求级用例（contract-test 与 verify-deploy 的期望值来源）

期望值按当前开关计算。`verify-deploy.sh` 不写死状态码和目标（ENG-13），而是读取 build 输出的 `.cache/redirects.json`（按开关生效后的规则）和 `.cache/routes.json`（页面清单，含 `publicUrl`、`indexable`），再结合本表生成断言。

| 用例 | 请求 | 期望首跳 | 期望 Location | 终点 | 依赖开关 | 其它断言 |
|---|---|---|---|---|---|---|
| Q01 | `GET /privacy.html` | 200 | 无 | — | proxy | body 含 `data-page="privacy"`；canonical = `https://www.word-by-word.app/privacy.html`；生产域名无 `X-Robots-Tag`（R48） |
| Q02 | `GET /support.html` | 200 | 无 | — | proxy | 同 Q01 |
| Q03 | `GET /chrome-extension/privacy.html` | 200 | 无 | — | proxy | S0：含 `noindex`、无 canonical；S1：canonical 为契约 URL（R2、R49） |
| Q04 | `GET /privacy.html?from=app` | 200 | 无 | — | proxy | — |
| Q05 | `HEAD /privacy.html` | 200 | 无 | — | proxy | — |
| Q06–Q11 | A4–A9 的源 | 301 | 对应契约 URL | 200 | proxy | 单跳 |
| Q12–Q14 | `/legal/privacy/`、`/legal/support/`、`/legal/extension-privacy/` | L 关：200；L 开：301 | L 关：无；L 开：契约 URL | 200 | experimentL | L 关时 body 与契约 URL 字节一致，canonical 指回契约 URL；生产无 `X-Robots-Tag`（R48） |
| Q15 | `/index.html` | 开：301；关：308 | `/` | 200 | indexHtmlRule | 不得循环 |
| Q16 | `/index` | 开：301；关：【需实测】 | `/` | 200 | indexHtmlRule | — |
| Q17 | B3–B4、C01–C40、D01–D14 的每个源（由夹具逐条生成，共 56 个用例） | 规则码 | 规则目标 | 200 | publish | 单跳；目标在 `.cache/routes.json` 中 |
| Q18 | `/ja-top.html?utm_source=t` | 301 | `/ja/?utm_source=t` | 200 | — | query 丢失只判 **WARN**（`QUERY_PRESERVED=0`），不判 FAIL（§5.3 第 6 条、A3） |
| Q19 | `/en/about/` | 301 | `/about/` | 200 | — | D15 |
| Q20 | `/zh/chrome-extension/` | 301 | `/zh-hans/chrome-extension/` | 200 | — | D16 |
| Q21 | `/cn/ja-top.html` | 301 | `/zh-hans/ja-top.html` | 404 | — | splat 不做二次映射，可接受（§5.3 第 9 条） |
| Q22 | `/zh-hans/` | 200 | 无 | — | 全部配置 | 返回 301 说明匹配不区分大小写，必须立即关闭实验组 C |
| Q23 | `/zh-Hans/`、`/pt-BR/` | C 关：404；C 开：301 | C 开：`/zh-hans/`、`/pt-br/` | 200 | experimentC | 不得循环 |
| Q24 | `/ja` | 308 | `/ja/` | 200 | — | CF 自动（F24） |
| Q25 | `/ja/index.html` | 308 | `/ja/` | 200 | — | CF 自动 |
| Q26 | `/about` | 308 | `/about/` | 200 | — | CF 自动 |
| Q27 | `/chrome-extension` | 308 | `/chrome-extension/` | 200 | — | CF 自动 |
| Q28 | `/zh-hans/chrome-extension` | 308 | `/zh-hans/chrome-extension/` | 200 | — | CF 自动 |
| Q29 | `/chrome-extension/index.html` | 308 | `/chrome-extension/` | 200 | — | CF 自动 |
| Q30 | `/backup/top.html`、`/README.md`、`/CNAME`、`/img/Screenshot-1.png`、`/wbw_logo.png`、`/css/style.css`、`/js/surfenglish-promo.js`、`/chrome-extension/style.css`、`/chrome-extension/img/hero-screenshot.png`、`/jp/`、`/definitely-missing-xyz` | 404 | 无 | — | — | body 含 `data-page="404"`（不是 SPA 返回的 200） |
| Q31 | 全部已发布首页、`/about/`、`/chrome-extension/`、`/zh-hans/chrome-extension/`、`/robots.txt`、`/sitemap.xml`、`/favicon.ico` | 200 | 无 | — | publish | 首页 canonical 自引用；首页 `<link rel="alternate" hreflang>` 数 = 已发布 locale 数 + 附加码数 + 1（§6.1） |
| Q32 | 未发布 locale L：`/<L>-top.html`；`/<L.path>/` | 302；404 | `/`；无 | 200；— | publish=false | L 不出现在 sitemap、hreflang、切换器中 |

### 5.3 规则说明

1. **不用占位符一把梭**。不能写 `/:lang-top.html /:lang/ 301`：`cn`、`zh`、`tw`、`pt`、`en` 都需要特殊映射，占位规则会占用动态配额，还可能误伤其它路径（研究 09 §3.4）。20 个非英语旧文件逐条列出，`en-top` 归入 B 组。
2. **顺序**：CF 按先到先得匹配（F24；CF 文档写明 "Only the first redirect in your file will apply"）。固定顺序为：A(200) → A(变体) → [L] → B → C → D 静态 → [X 静态] → D splat → [X splat]。契约 200 规则放在最前；splat 规则放在最后，避免抢先匹配。
3. **`/index.html` 规则（`indexHtmlRule`）**：基线 §C 要求 301。CF 会自动把它 308 到 `/`，但 `_redirects` 先于静态资源执行（"Redirects are always followed, regardless of whether or not an asset matches"），所以规则会生效，得到 301。【需实测，M1-03】如果 preview 上出现循环，把 `indexHtmlRule` 设为 `false`，删掉 B1、B2，靠 CF 的自动 308 兜底（308 同样是永久跳转）。
4. **别名 D 组**：`/en/` 是最容易被拼出来的错误地址（英文没有前缀）；`cn`、`tw`、`pt` 是旧文件名里的语言码；`zh-cn`、`zh-tw` 是常见写法。这些都是零成本的兜底。v1.1 为每个别名补了带尾斜杠的静态规则（D02、D04…D14），不再依赖"CF 的 splat 能否匹配空串"这个未写进文档的行为（spike 仍会记录实测结果）。`/jp/`、`/kr/` 是国家码，本站从未使用，不收（Q30 断言 404）。
5. **大小写别名放实验组 C**：CF 文档没有说明 `_redirects` 是否区分大小写（F24 只证明了资源服务区分大小写）。一旦匹配不区分大小写，`/zh-Hans/*` 就会命中真实的 `/zh-hans/…` 页面并无限循环。因此默认关闭，等 preview 实测证明区分大小写后再开启（Q22、Q23）。
6. **query 保留**：CF 文档没有说明 `_redirects` 是否保留 query（研究 09 §3.8，本次复查 CF redirects 文档也未提及）。CF 的自动 308 已证实会保留 query（研究 09 §3.2）。【需实测】请求 `/ja-top.html?utm_source=t`，期望得到 `Location: /ja/?utm_source=t`。如果 query 丢失，只影响旧 URL 上的外部 UTM，可以接受，不为此引入 Pages Functions（研究 09 §3.5 C-3）。`verify-deploy.sh` 用 `QUERY_PRESERVED` 控制这一项：取 0 时只告警（SEO-14、ENG-13）。实测记录（M1-03 填写；正式域名切换后复测一次）：

   | 日期 | 环境 | 请求 | 实际 Location | `QUERY_PRESERVED` |
   |---|---|---|---|---|
   | 2026-10-06 | preview（`spike-default`、`spike-lc`、`main` 三个预览） | `/ja-top.html?utm_source=t` | `/ja/?utm_source=t`（301） | 1 |
   | （待填） | 生产 | 同上 | | |

7. **hash**：fragment 不会发到服务端，浏览器跳转时会自动带上。所以 `/ja-top.html#faq` 会落到 `/ja/#faq`，前提是 §7.5 保留了 `faq` 这个 id。旧版 `#cta` 同理会落到新版的最终 CTA 区（§7.5）。
8. **保留期限**：所有 301 永久保留，至少 1 年（F26、研究 06 §2.2）。
9. **splat 不做二次映射**：`/cn/ja-top.html` → `/zh-hans/ja-top.html` → 404（Q21）。这类组合没有真实来源，不为它加规则。D-12（d）只检查 splat 目标去掉通配部分后的前缀。
10. **未发布 locale**：按文档 06 §3.2，`publish:false` 的语言不生成页面，它的旧 URL 和别名临时 302 到 `/`（§5.2.3）。语言上线后改为 301 到 `/<code>/`，不会有损失。

### 5.4 契约 URL：C-1 / C-2 与 preview 实测【决策】

**C-1（首选，`contractMode:'proxy'`）**
- 产物：`dist/legal/privacy/index.html`、`dist/legal/support/index.html`、`dist/legal/extension-privacy/index.html`。`dist` 中**不出现** `privacy.html`、`support.html`、`chrome-extension/privacy.html`，否则会触发 CF 的自动 308。
- `_redirects` A 组的 3 条 200 规则把内容映射回契约地址（§5.2.2 A1–A3）。代理目标必须带尾斜杠。
- 页内 canonical 写契约绝对地址（如 `https://www.word-by-word.app/privacy.html`），不写 hreflang。S0 时扩展隐私页改为 `noindex`，且不写 canonical（R2、R49）。
- 【裁定 R48】页内**不要**写 `noindex`（S0 下的扩展隐私页除外）：同一个文件也会从契约地址输出，写了会连契约页一起被去索引。这修正了研究 09 §3.5 C-1 中"`/legal/*` 加 noindex"的建议。`/legal/*` 的重复靠 canonical 消化，必要时再开实验组 L。**也不采用** `_headers` 中 `/legal/*  X-Robots-Tag: noindex` 的做法（SEO-05 提出的备选），因为代理请求是否会继承这个头没有文档说明。文档 03 §6.2 中"`/legal/*` noindex"一行按 SEO-05/R48 删除。

**C-2（兜底，逐 URL 降级，`contractMode` 中该契约设为 `'file'`）**
- 产物直接输出 `dist/privacy.html` 等，接受 CF 自动 `308 /privacy.html → /privacy`。canonical 改写为 `/privacy`。`_redirects` 按 §5.2.3 增量处理：删除 200 规则和两条变体，新增 `/privacy/ → /privacy 301`。
- 判定标准：`/privacy.html` 单跳 308 到一个返回 200 的目标，iOS 真机能打开。ASC 中的地址暂不改，下一个版本再更新。降级后该 URL 仍可访问，符合 R2 对扩展隐私页"始终可访问"的要求。

**preview 实测步骤**（先在 `<branch>.<project>.pages.dev` 上跑；正式切换 DNS 后在正式域名上再跑一遍）。期望值见 §5.2.4 Q01–Q16；正式脚本是文档 06 §9.3 的 `contract-test.sh`，下面是最小手工版：

```bash
P=https://<branch>.<project>.pages.dev
# 1) 契约 URL：期望 200、无 Location、canonical 正确（Q01–Q03）
for u in /privacy.html /support.html /chrome-extension/privacy.html; do
  printf '%-34s ' "$u"
  curl -s -o /tmp/b -w '%{http_code} [%{redirect_url}] ' "$P$u"
  grep -o '<link rel="canonical"[^>]*>' /tmp/b
done
# 2) 带 query 仍 200（Q04）
curl -s -o /dev/null -w '%{http_code}\n' "$P/privacy.html?src=app"
# 3) 6 个变体：单跳 301 → 契约 URL（Q06–Q11）
for u in /privacy /privacy/ /support /support/ /chrome-extension/privacy /chrome-extension/privacy/; do
  curl -s -o /dev/null -w "$u %{http_code} %{redirect_url}\n" "$P$u"; done
# 4) 存放路径与契约 URL 字节一致（Q12，实验组 L 关闭时）
diff <(curl -s "$P/privacy.html") <(curl -s "$P/legal/privacy/") && echo SAME
# 5) 实验组 L：开启后重新部署，重复 1) 与下面一行（Q12–Q14 期望单跳 301）
for u in /legal/privacy/ /legal/support/ /legal/extension-privacy/; do
  curl -s -o /dev/null -w "$u %{http_code} %{redirect_url}\n" "$P$u"; done
# 6) 生产域名：契约 URL 与 /legal/*/ 都不带 X-Robots-Tag（R48）
for u in /privacy.html /legal/privacy/; do curl -sI "https://www.word-by-word.app$u" | grep -i x-robots-tag; done
```

| 判定 | 条件 | 动作 |
|---|---|---|
| C-1 通过 | 3 个契约 URL 都返回 `200` 且无 Location；body 与存放路径一致；canonical 为契约绝对地址（S0 下的扩展隐私页为 noindex、无 canonical）；带 query 也是 200；6 个变体都是单跳 301 | 采用 C-1 |
| 实验组 L 通过 | 开启后契约 URL 仍为 200，`/legal/*/` 单跳 301 到契约 URL | 保留实验组 L；contract-test 中 `/legal/*/` 的断言随 `experimentL` 切换：关闭时期望 200 + canonical 指回契约 URL，开启时期望单跳 301（ENG-03） |
| 实验组 L 失败 | 契约 URL 变成 301/308，或出现循环 | 关闭实验组 L，只靠 canonical |
| C-1 部分失败 | 某个契约 URL 返回 308、404 或循环 | 只把该 URL 降为 C-2 |
| 上线门槛 | 正式域名切换后（研究 09 §3.6 第 8 步）：iOS 真机在"设置 → 隐私政策"（`MoreSettingsView`）和订阅页（`SubscriptionView`）都能打开；App Store 页面上的 3 个链接都能打开；契约 URL 无 `X-Robots-Tag` | 不满足就回滚 DNS（研究 09 §3.10；回滚截止时间按 R23） |

### 5.5 生成与构建期校验【决策】

**生成输入**：`LOCALES[].legacy`、`LOCALES[].publish`、`CONTRACTS`（含 `public`、`bare`、`bareSlash`、`internal`，ENG-03）、`ALIASES`、`SITE.contractMode`、`SITE.redirectFlags`。文档 06 §3.1/§3.3 需按下面的形态补齐：

```js
// D 组：数组顺序就是输出顺序；每项生成 /x 和 /x/（静态，在前）以及 /x/*（splat，在后）
export const ALIASES = [
  { from:'en',    to:'en' },
  { from:'zh',    to:'zh-Hans' }, { from:'cn', to:'zh-Hans' }, { from:'zh-cn', to:'zh-Hans' },
  { from:'tw',    to:'zh-Hant' }, { from:'zh-tw', to:'zh-Hant' },
  { from:'pt',    to:'pt-BR' },
];
// SITE 中新增；按 M1-03 spike 结论修改
redirectFlags: { indexHtmlRule: true, experimentL: false, experimentC: false },
// CONTRACTS 每项新增 bareSlash
{ id:'privacy', public:'/privacy.html', bare:'/privacy', bareSlash:'/privacy/', internal:'/legal/privacy/' },
```

**构建时校验**（任一条 E 级不满足即失败；对应文档 06 §3.7 的 D-12，按 ENG-02 改写）：

1. **D-12 `_redirects` 结构**
   - (a) 每条 3xx 规则的目标按 CF 语义解析（`/x/` → `dist/x/index.html`，`/` → `dist/index.html`），必须是 dist 中的文件；或者是某条 200 规则的源，且那条 200 规则的目标能解析到 dist 中的文件（例如 A4 `/privacy` → `/privacy.html` → A1 → `dist/legal/privacy/index.html`）。
   - (b) 3xx 规则的目标不得是另一条 3xx 规则的源（禁止链式跳转）。**200 代理规则的源不算 3xx 源**，这就是 R54 所说的"豁免契约 200 代理规则"。
   - (c) 200 规则的目标必须以 `/` 结尾，并能解析到 dist 中的文件；200 规则的源不得在 dist 中有同名文件（否则会触发 CF 自动 308，见第 4 条）。200 规则的目标同时是某条 3xx 规则的源时（只可能是实验组 L），只报 W，并要求 M1-03 有实测记录。
   - (d) 目标含 `:splat` 或其它占位符时，只校验去掉通配部分后的前缀能否按 (a) 解析（例如 `/zh-hans/`、`/`）。
   - (e) 3xx 的目标必须是规范形式：以 `/` 结尾，或者等于某个契约的对外 URL。不得是会被 CF 再次自动 308 的地址（`/ja`、dist 中真实存在的 `*.html`、`/x/index.html`），否则会形成"规则 301 + CF 308"两跳。
   - (f) 源不重复；源不得与任何 indexable 页面的规范 URL 相同（防止真实页面被跳走）。
   - (g) **夹具一致**：默认开关下，生成结果与 `scripts/fixtures/redirects.default.txt`（= §5.2.2）逐行相等；非默认开关下，按 §5.2.3 增量处理后再比对。自测用例：用当前 `CONTRACTS`、`LOCALES`、`ALIASES` 生成的规则在所有开关组合下都必须 0 error（ENG-02）。
2. 静态规则 ≤ 2,000 条，动态规则 ≤ 100 条（F24）；实际条数等于 §5.2.3 条数表中对应配置的数值。
3. 对 `dist` 中所有 HTML 做大小写敏感的站内链接检查：每个 `href` 和 `src` 都能解析到资源，或者是 200 规则的源；**不得**指向任何跳转源（研究 09 §5.3），也不得链到 `/legal/*`。
4. C-1 模式下，`dist` 中不存在 `privacy.html`、`support.html`、`chrome-extension/privacy.html`（按契约逐个判断）。
5. 根目录有 `404.html`。CF 在没有顶层 `404.html` 时会按 SPA 处理，把 `index.html` 以 200 返回给所有未知路径（CF 文档原文："If your project does not include a top-level 404.html file, Pages assumes that you are deploying a single-page application"）。
6. build 输出 `.cache/redirects.json`（开关生效后的规则）和 `.cache/routes.json`（页面清单），供 `verify-deploy.sh` 读取（§5.2.4）。

---

## 6. hreflang、canonical、sitemap、robots

### 6.1 hreflang 规则【决策】

规则编号用 `HL-n`，避免与裁定第三节的统一待办 H1–H18 混淆（R24）。

| # | 规则 | 依据 |
|---|---|---|
| HL-1 | 簇按页面键组建（`home`、`about`、`chrome-extension`、`guide:<slug>`）。成员是该页面键下**已生成且 indexable** 的各语言版本 | F26；研究 06 §3.2；R49 |
| HL-2 | 每个成员都列出**全部**成员，包括自己 | F26（"must list itself"） |
| HL-3 | 有 en 成员时，`x-default` = en 成员；没有 en 成员时不写 x-default | 研究 06 §1.1 |
| HL-4 | 成员只有 1 个时不输出任何 hreflang，只写 canonical | 单语言页的自引用 hreflang 没有作用（SE 在 `about.mjs:136` 输出了，不照抄） |
| HL-5 | href 用绝对、规范、带尾斜杠的地址；不得出现 pages.dev、旧 URL 或别名 | 研究 09 §6 风险登记表第 5 项 |
| HL-6 | hreflang 值取自 `LOCALES.hreflang`（`zh-Hans`、`zh-Hant`、`pt-BR`），其余不带地区码 | F35 |
| HL-7 | `noindex` 页面（404、S0 下的扩展页与扩展隐私页、`/legal/*` 存放路径）不进入任何簇，也不输出 hreflang | 研究 06 §1.1（alternate 必须是 canonical 页）；R49 |
| HL-8 | WBW 与 SE 之间**永不**使用 hreflang 或 canonical | 基线 §B5、F35 |
| HL-9 | HTML `<link>` 与 sitemap `xhtml:link` 都输出，由同一个 `alternatesFor(pageKey)` 生成，构建时断言两者逐条相等 | 基线 §C；研究 06 §1.1 担心的"两处不一致"由单一来源消除 |
| HL-10 | 每个 `<link>` 只写一个 hreflang，不与 `media` 等属性合并 | 研究 06 §1.1（2024-06 更新） |
| HL-11 | **附加码**（`hreflangExtra`，目前只有 pt-BR 的 `pt`）：簇中有 pt-BR 成员时，紧跟在 pt-BR 条目之后输出一条 `hreflang="pt"`，href 与 pt-BR 相同；sitemap 同步。文档 06 D-2 的"hreflang 码不重复"按**码**判断，允许同一个 URL 对应多个码。`pt` 不进 og:locale、切换器和 content-language | R53；SEO-12、I18-13 |

**条数**：每个可索引首页的 `<link rel="alternate" hreflang>` 数 = 已发布 locale 数 + 附加码数 + 1（x-default）。全部发布时为 20 + 1 + 1 = **22**。构建断言和 `verify-deploy.sh` 都按这个公式从 `LOCALES` 计算，不写死。计数只统计 `<link rel="alternate" hreflang=`，不统计切换器里 `<a hreflang>` 的 40 个链接（ENG-13）。文档 03 §6.2（"每个首页恰 21 条"）、03 A2 和文档 06 §11.4 组 1 需要同步。

### 6.2 页面类型 × head 输出

| 页面类型 | robots meta | canonical | hreflang | og:locale | sitemap |
|---|---|---|---|---|---|
| 首页 ×20 | `index,follow,max-image-preview:large` | 自身 | 20 个 + `pt` + x-default（HL-11） | 自身，另加 19 个 `og:locale:alternate` | ✅（含 xhtml 与 image） |
| `/about/`（Phase 1） | `index,follow` | 自身 | 无（HL-4） | en_US | ✅ |
| 扩展页 S1 | `index,follow` | 自身 | en、zh-Hans、x-default | 自身，另加 1 个 alternate | ✅（含 xhtml） |
| 扩展页 S0 | `noindex,follow` | **不写**（R49） | 无（HL-7） | 自身 | ❌ |
| 契约页（privacy、support） | `index,follow` | 契约绝对地址 | 无 | en_US | ✅ |
| 扩展隐私页 | S1 同契约页；S0 为 `noindex,follow`、不写 canonical（R2、R49） | — | 无 | en_US | S1 ✅ / S0 ❌ |
| `/legal/*/` | 与契约页是同一个文件 | 契约绝对地址 | 无 | — | ❌ |
| 404 | `noindex` | **不写**（SE 的 404 canonical 指向 `/404.html`，这是缺陷，研究 03 §1.13 #6） | 无 | — | ❌ |
| 指南（P2） | `index,follow` | 自身 | 已有的语言版本，有 en 时加 x-default | 自身，另加 alternates | ✅（含 xhtml） |

**可索引性一致（R49，文档 06 新增 D-20）**：按**对外 URL**（`routes[].publicUrl`）判定 indexable ⇔ 无 noindex ⇔ 有自引用 canonical ⇔ 在 sitemap；noindex 页不得进入 sitemap 和 hreflang 簇。C-1 的存放路径 `/legal/*/` 是契约 URL 的别名路径，不单独判定。它们必须满足：body 与契约 URL 相同；不进 sitemap 和 hreflang；没有站内链接（§5.5 第 3 条）。原型 head 中的 `noindex,nofollow` 不得带进模板。

**`<html>` 与语言声明**（所有页面）：
- `<html lang="{hreflang}" dir="{dir}" data-script="{script}" data-page="{pageId}">`（R60、I18-04；文档 06 §5.1.1 第 2 行需要同步）。
- `<meta http-equiv="content-language" content="{contentLanguage}">`，取值见 §4.1（R47）。这个 meta 主要给 Bing 用（研究 06 §1.7）。Google 不用 `lang` 判断语言（F26）。
- W3C Nu 校验器把这个 meta 报为 error（"Using the meta element to specify the document-wide default language is obsolete"）。按 R47，文档 07 M4-04 和文档 06 §11.2 的 W3C 闸门对**这一条消息**做显式 allowlist，其余 error 仍然要求为 0（ENG-07）。
- **不输出** Content-Language HTTP 头（R47）。`_headers` 中不得出现 `Content-Language`：CF 会把多条规则命中的同名头用逗号拼接，`/*` 规则会让 `/ja/` 返回 "en, ja"（ENG-07）。文档 03 §6.2 的"Content-Language"行、文档 07 M1-06 的"_headers … Content-Language"需要同步删除。

### 6.3 示例：`/ja/`（首页簇；`/` 及其余 18 个首页的列表与此相同，只有 canonical、lang、data-script、content-language、og:locale 不同）

```html
<html lang="ja" dir="ltr" data-script="cjk" data-page="home">
<head>
<link rel="canonical" href="https://www.word-by-word.app/ja/">
<link rel="alternate" hreflang="en" href="https://www.word-by-word.app/">
<link rel="alternate" hreflang="zh-Hans" href="https://www.word-by-word.app/zh-hans/">
<link rel="alternate" hreflang="zh-Hant" href="https://www.word-by-word.app/zh-hant/">
<link rel="alternate" hreflang="ja" href="https://www.word-by-word.app/ja/">
<link rel="alternate" hreflang="ko" href="https://www.word-by-word.app/ko/">
<link rel="alternate" hreflang="es" href="https://www.word-by-word.app/es/">
<link rel="alternate" hreflang="pt-BR" href="https://www.word-by-word.app/pt-br/">
<link rel="alternate" hreflang="pt" href="https://www.word-by-word.app/pt-br/">
<link rel="alternate" hreflang="fr" href="https://www.word-by-word.app/fr/">
<link rel="alternate" hreflang="de" href="https://www.word-by-word.app/de/">
<link rel="alternate" hreflang="it" href="https://www.word-by-word.app/it/">
<link rel="alternate" hreflang="nl" href="https://www.word-by-word.app/nl/">
<link rel="alternate" hreflang="pl" href="https://www.word-by-word.app/pl/">
<link rel="alternate" hreflang="ru" href="https://www.word-by-word.app/ru/">
<link rel="alternate" hreflang="tr" href="https://www.word-by-word.app/tr/">
<link rel="alternate" hreflang="uk" href="https://www.word-by-word.app/uk/">
<link rel="alternate" hreflang="vi" href="https://www.word-by-word.app/vi/">
<link rel="alternate" hreflang="th" href="https://www.word-by-word.app/th/">
<link rel="alternate" hreflang="id" href="https://www.word-by-word.app/id/">
<link rel="alternate" hreflang="ar" href="https://www.word-by-word.app/ar/">
<link rel="alternate" hreflang="hi" href="https://www.word-by-word.app/hi/">
<link rel="alternate" hreflang="x-default" href="https://www.word-by-word.app/">
<meta http-equiv="content-language" content="ja">
<meta property="og:url" content="https://www.word-by-word.app/ja/">
<meta property="og:locale" content="ja_JP">
<meta property="og:locale:alternate" content="en_US">
<!-- … 其余 18 个 og:locale:alternate，按 LOCALES 顺序，取 og 字段；不含 pt -->
```

其它页的差异举例：`/zh-hans/` 写 `data-script="cjk"`、`content="zh-cn"`；`/pt-br/` 写 `data-script="latn"`、`content="pt-br"`；`/ar/` 写 `dir="rtl" data-script="arab"`、`content="ar"`。

### 6.4 示例：`/chrome-extension/`（S1，部分语言簇）

```html
<html lang="en" dir="ltr" data-script="latn" data-page="chrome-extension">
<link rel="canonical" href="https://www.word-by-word.app/chrome-extension/">
<link rel="alternate" hreflang="en" href="https://www.word-by-word.app/chrome-extension/">
<link rel="alternate" hreflang="zh-Hans" href="https://www.word-by-word.app/zh-hans/chrome-extension/">
<link rel="alternate" hreflang="x-default" href="https://www.word-by-word.app/chrome-extension/">
<meta http-equiv="content-language" content="en">
```
`/zh-hans/chrome-extension/` 输出同样的 3 条 alternate，canonical 指向自身，`data-script="cjk"`、`content="zh-cn"`。S0 状态下两页都输出 `noindex,follow`，不输出 hreflang，也不输出 canonical（R49）。

### 6.5 示例：Phase 2 指南（只有 en、ja、zh-Hans、zh-Hant、ko 五个版本）

```html
<!-- /ja/guides/translate-web-pages-iphone/ -->
<link rel="canonical" href="https://www.word-by-word.app/ja/guides/translate-web-pages-iphone/">
<link rel="alternate" hreflang="en" href="https://www.word-by-word.app/guides/translate-web-pages-iphone/">
<link rel="alternate" hreflang="zh-Hans" href="https://www.word-by-word.app/zh-hans/guides/translate-web-pages-iphone/">
<link rel="alternate" hreflang="zh-Hant" href="https://www.word-by-word.app/zh-hant/guides/translate-web-pages-iphone/">
<link rel="alternate" hreflang="ja" href="https://www.word-by-word.app/ja/guides/translate-web-pages-iphone/">
<link rel="alternate" hreflang="ko" href="https://www.word-by-word.app/ko/guides/translate-web-pages-iphone/">
<link rel="alternate" hreflang="x-default" href="https://www.word-by-word.app/guides/translate-web-pages-iphone/">
```
其余 15 种语言**不出现**在这个簇里，也不指向它们的首页：hreflang 只连接同一内容的不同译本（研究 06 §3.2）。这个簇里没有 pt-BR 成员，所以也不输出 `pt`（HL-11）。

### 6.6 只有部分语言存在的页面

- `/about/`（Phase 1 只有 en）：不输出 hreflang，只写 canonical。Phase 2 如果新增 `/ja/about/` 等版本，就按 HL-1 到 HL-3 组簇，x-default 指向 `/about/`。
- 某语言的指南未通过审校：不生成该页（P5），簇里也没有它。切换器对该语言回落到首页（§7.2）。
- 不允许用"整页英文回退"填补缺失的语言（研究 03 §1.4）。

### 6.7 sitemap.xml 写法

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.word-by-word.app/</loc>
    <lastmod>2026-10-20</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.word-by-word.app/"/>
    <xhtml:link rel="alternate" hreflang="zh-Hans" href="https://www.word-by-word.app/zh-hans/"/>
    <!-- … 与 §6.3 相同的 22 条（含 pt 与 x-default），顺序一致 … -->
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.word-by-word.app/"/>
    <image:image><image:loc>https://www.word-by-word.app/assets/img/shot/en/swipe-540.3f2a91c0.jpg</image:loc></image:image>
    <image:image><image:loc>https://www.word-by-word.app/assets/og/home-en.9c1e2d4a.jpg</image:loc></image:image>
  </url>
  <!-- 其余 19 个首页：每条都带完整的 22 条 xhtml:link -->
  <url>
    <loc>https://www.word-by-word.app/about/</loc>
    <lastmod>2026-10-20</lastmod>
  </url>
  <url><loc>https://www.word-by-word.app/privacy.html</loc><lastmod>2026-10-20</lastmod></url>
  <url><loc>https://www.word-by-word.app/support.html</loc><lastmod>2026-10-20</lastmod></url>
  <!-- S1 时追加：/chrome-extension/、/zh-hans/chrome-extension/（各带 3 条 xhtml:link）、/chrome-extension/privacy.html -->
</urlset>
```
- 只列规范 URL，用绝对地址，不写 `priority` 和 `changefreq`（研究 06 §8）。
- `lastmod` 取该页模板加对应 locale JSON 的 git 提交日期，**不包含** `build.mjs` 和 layout。SE 把它们算了进去，结果全站 lastmod 一起跳（研究 03 §1.6）；Google 只采信"一致且可验证"的 lastmod（研究 06 §8）。浅克隆时整体省略 lastmod，见文档 06 §3.6.1。
- 图片只列该语言图片集的 L1 截图（`shot/<set>/swipe`，hero 是 HTML 样张、没有位图，R66；无本地化截图时回落 en 版本）和该语言的 OG 图，路径为 `/assets/` 下的指纹路径（R9；命名见文档 06 §3.5）。

### 6.8 robots.txt 与 pages.dev

```
User-agent: *
Allow: /

Sitemap: https://www.word-by-word.app/sitemap.xml
```
- 不 Disallow `/legal/`：屏蔽抓取会让 Google 看不到 canonical，反而可能把它当作无内容 URL 收录。不屏蔽 AI 搜索爬虫（研究 06 §3.7）。
- `_headers` 加入以下两条，防止 pages.dev 和 preview 被索引（CF 文档给出的写法；研究 09 §5.8）。验收时确认正式域名的响应**不**带这个头。`_headers` 中不得出现 `Content-Language`（§6.2，R47）。

```
https://:project.pages.dev/*
  X-Robots-Tag: noindex
https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
```

### 6.9 404【裁定 R21】

- `/404.html`（Phase 1 唯一的 404）：en 正文，加一个 20 种语言的首页链接列表（原生名、`lang`、`hreflang`），这个列表本身就是多语言引导。不依赖 JS。
- 全部 `noindex`，不写 canonical 和 hreflang，不进 sitemap，状态码必须是 404（§5.5 第 5 条；§5.2.4 Q30）。
- 本地化 404（M4 可选项，文档 07 M4-12）：CF 会沿目录树就近查找 `404.html`（CF 文档原文："look up the directory tree for a matching 404.html file, ending in /404.html"）。M1-03 spike 证实支持后，构建可以另外输出 `/<locale>/404.html` ×19：`/ja/xxx` 显示日文 404，并给出"返回日文首页"的链接。模板相同，文案取自各 locale JSON 的 `notFound.*`。Phase 1 不做。

---

## 7. 导航与内链

### 7.1 Header【裁定 R16】

```
桌面（≥ 900px）
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ [▦ WordByWord]  功能  支持的语言  价格  常见问题  Chrome 扩展（仅 S1）  [◍ 简体中文 ▾] [App Store 下载] │
└───────────────────────────────────────────────────────────────────────────────────────────┘
手机
┌──────────────────────────────────────┐
│ [▦ WordByWord]        [◍ 中文 ▾]  [☰] │   ☰ = <details class="nav-menu">，不靠 JS 即可展开；字标保留（R70）
└──────────────────────────────────────┘
```

| 元素 | 主站页面（首页、about、契约页、404） | 扩展页 |
|---|---|---|
| logo | → 当前语言首页（en 页 → `/`），有可读名称 "WordByWord"。修正现状的 `href="#"`（F4） | → 同语言首页 |
| 导航项 | `功能` → `{home}#features`；`支持的语言` → `{home}#languages`；`价格` → `{home}#pricing`；`常见问题` → `{home}#faq`；`Chrome 扩展` → 同语言扩展页，没有该语言版本时 → `/chrome-extension/`，**仅 S1 显示**（R2、R16）；（P2）`指南` → `{home}guides/` | `iPhone App` → 同语言首页；`功能` → 本页 `#features`；`常见问题` → 本页 `#faq` |
| 语言切换器 | §7.2 | §7.2 |
| 主按钮 | WBW 的 App Store 下载按钮（`ct=wbw-header`，`data-ga-label="header"`；`ct` 只按落点，locale 维度看 GA，R55；`pt` 见 H3） | S1："Add to Chrome"；S0：WBW iPhone App 的 App Store 按钮（`ct=wbw-ext`，§3.5） |

- 导航项最多 5 个文字项（S0 时为 4 个），标签来自 locale JSON 的 `nav.*`；`{home}` = `pageUrl('home', locale)`。en-only 页面（about、契约页）的 locale 是 en，所以导航指向 `/#features`。About 只放在页脚（原型 D11）。
- 同页锚点也写成 `{home}#features` 这种完整路径：在首页上点击是同文档跳转，不会重新加载；在其它页面上点击会回到首页对应区块。

### 7.2 语言切换器（可抓取实现）【决策】

```html
<details class="lang-switch">
  <summary aria-label="Language / 言語: 日本語">
    <svg aria-hidden="true" class="i-globe">…</svg><span lang="ja">日本語</span>
  </summary>
  <nav aria-label="言語を選択">
    <p class="lang-note">…</p>  <!-- 仅当本页不足 20 个语言版本时由构建输出，见下 -->
    <ul>
      <li><a href="/" hreflang="en" lang="en"
             data-ga-event="language_switch" data-ga-label="header:en">English</a></li>
      <li><a href="/zh-hans/" hreflang="zh-Hans" lang="zh-Hans"
             data-ga-event="language_switch" data-ga-label="header:zh-Hans">简体中文</a></li>
      <li><a href="/ja/" hreflang="ja" lang="ja" aria-current="page"
             data-ga-event="language_switch" data-ga-label="header:ja">日本語</a></li>
      <!-- … 按 LOCALES 顺序共 20 项（只列已发布的 locale；pt 附加码不出现在这里） … -->
      <li><a href="/ar/" hreflang="ar" lang="ar" dir="rtl"
             data-ga-event="language_switch" data-ga-label="header:ar">العربية</a></li>
    </ul>
  </nav>
</details>
```

- **目标映射**：`href = pageUrl(pageKey, L) ?? pageUrl('home', L)`，即跳到同一页面的 L 语言版本，不存在时回落到 L 语言首页。例：在 `/zh-hans/chrome-extension/` 选 English → `/chrome-extension/`；选日本語 → `/ja/`（Phase 3 之前）；在 `/privacy.html` 选任何语言 → 该语言首页。
- **回落提示**：页面的语言版本少于 20 个时，菜单顶部用当前页语言显示一行说明，例如 en："This page is available in English only. Other languages open their home page."。不要给每个回落项单独加标记，19 个标记太嘈杂。
- **可抓取**：完整的 `<a href>` 列表写在 HTML 源码里，`<details>` 不加 JS 也能展开。每个链接都带 `hreflang`（目标语言）和 `lang`（链接文字的语言，用于正确选字体和朗读），阿拉伯语再加 `dir="rtl"`。不用国旗，不用 `<select onchange>`（研究 06 §1.5）。
- **JS 增强**（≤ 20 行，可选）：点击外部或按 Esc 关闭，焦点回到 summary（照搬 SE `main.js:18-23`）。
- **页脚再放一份同样的 20 项列表**（§7.3）。这样每个页面都有两处指向全部语言版本的链接（基线 §C）。
- **GA**【裁定 R38】：链接显式写 `data-ga-event="language_switch"`，否则 header 内的点击会被计成 `nav_click`，页脚内的点击会被计成 `footer_link_click`，这两个历史事件会突然变大（研究 01 §7.1 的事件决策顺序）。`data-ga-label` = `<位置>:<目标 locale>`，位置取 `header`、`footer` 或 `404`。`analytics.js` 对该事件自动附加 `from_locale`（当前 `<html lang>`）和 `to_locale`（链接的 `hreflang`）两个参数（文档 06 §8.2 需要同步）。点击 `aria-current` 项不上报。

### 7.3 Footer【决策】

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ▦ WordByWord   <本地化 tagline：在 App 内置浏览器里右滑段落，译文插在原文下方>     │
│                                                                            │
│ 产品                    帮助                     More from the maker         │
│ iPhone / iPad App       支持                     SurfEnglish — <本地化描述>   │
│ Chrome 扩展（两态都有）  隐私政策                  （第三人称、互补式话术，R40）  │
│ 关于                    联系我们 (mailto)                                     │
│ （P2）指南              常见问题 (#faq)                                       │
│                                                                            │
│ 语言 · Language                                                             │
│ English · 简体中文 · 繁體中文 · 日本語 · 한국어 · Español · Português (Brasil) · │
│ Français · Deutsch · Italiano · Nederlands · Polski · Русский · Türkçe ·    │
│ Українська · Tiếng Việt · ไทย · Bahasa Indonesia · العربية · हिन्दी          │
│                                                                            │
│ © 2025–{currentYear} Jinlong · Made by Jinlong（→ /about/） · Apple 商标声明   │
└────────────────────────────────────────────────────────────────────────────┘
```
- 指向 en-only 页面的链接（关于、支持、隐私）在非 en 页面上要加 `hreflang="en"`，告知目标是英文（照 SE `layout.mjs` 的做法）。
- "Chrome 扩展"链接在 S0/S1 两态下都保留（R2）；S0 时这是除 FAQ 外唯一的入链，满足 U3"纳入新站"的可发现性要求。
- "More from the maker"（落点 ④）每页只放 1 个链接，目标按 §10.2 映射。锚文本是品牌名加简短描述，不堆关键词（研究 06 §5.2）；话术用第三人称、互补式（R28、R40）。
- 全站页脚一致，契约页和扩展页也一样。页脚家族链接是导航，不是推荐区块（基线 F 只禁止在 privacy、support、扩展页放推荐**区块**）。"与 WordByWord.io 无关"的声明不放在页脚，只放在 `/about/` 和扩展页的正文里（R15）。
- 版权行为 `© 2025–{currentYear} Jinlong`，年份由构建日期生成（R22；修正 23 个文件里写死的 © 2025，F11）。署名 "Jinlong" 依据 U4、R17。

### 7.4 面包屑【决策】

- Phase 1 不做：所有页面都只有 1–2 层，header logo 加导航已经够用。
- Phase 2 指南：显示可见面包屑 `WordByWord › 指南 › <标题>`（各级链接到同语言的首页和 hub），同时输出与之一致的 `BreadcrumbList`，避免 SE "有可见面包屑、没有 JSON-LD"的不一致（研究 03 §1.13 #10）。移动端 SERP 已不再显示面包屑（研究 06 §4），这里主要是为了页面内导航。

### 7.5 首页区块顺序与页内锚点 id【裁定 R12、R42、R43】

**首页区块顺序**（文档 04 §3.0 把最终顺序交给本文决定；与原型一致）：

`hero` → `features` → `screenshots` → `languages` → `pricing` → `surfenglish`（落点 ① 卡片，条件渲染）→ `faq` → `cta`（WBW 最终下载 CTA）→ footer

- ① 必须放在 WBW 最后一个功能/价格区块之后，并且与 WBW 的任何 App Store 徽章之间至少隔一个区块（文档 04 §3.0）。
- ① 在 zh-Hans 页**不渲染**（R42），site-notice 开启时也不渲染（R35）。这两种情况下页面上没有 `#surfenglish`；外部 `#surfenglish` 深链会落在页面顶部，可以接受。
- 价格区**必须**有 WBW 的 App Store 徽章；FAQ 之后的 `cta` 区要加强（App 图标 + 徽章 + 一句要点回顾），让页面下半部的视觉重心留在 WBW（R43）。

| id | 区块 | 旧版 | 要求 |
|---|---|---|---|
| `hero` | 首屏 | ✅ | `<section id>` |
| `features` | 功能 | ✅ | `<section id>`；导航目标 |
| `screenshots` | 真实截图 | ✅ | **保留**（R12、R22）。新设计取消了轮播（基线 §E）；如果没有独立截图区，就把 id 放在承载真实截图的容器上，保证 `/#screenshots` 不失效 |
| `languages` | 语言支持 | 新 | `<section id>`；导航目标 |
| `pricing` | 免费与 Plus | 新（旧版价格在 `#cta` 内） | `<section id>`；导航目标（R12）。v1.0 的 `plus` 作废 |
| `surfenglish` | 兄弟应用卡片（落点 ①） | ✅（旧版由 JS 注入，`surfenglish-promo.js:517`） | `<aside id>` 或 `<section id>`，保留旧值，延续 GA 的 `element_location` 和外部 `#surfenglish` 深链；zh-Hans 和公告开启时不存在 |
| `faq` | 常见问题 | ✅ | `<section id>`；导航和页脚目标 |
| `cta` | WBW 最终下载 CTA | ✅（旧版 = 价格 + 下载） | `<section id>`。只承担最终 CTA，**不再**作为价格区 id（R12）。hero 的主按钮直接链 App Store，不再链 `#cta` |
| `faq-<key>` | 单条 FAQ（如 `faq-what-is`、`faq-devices`、`faq-english-learner`） | 新 | 放在 `<details id>` 上，不是 section，不影响 `element_location`。key 以文档 08 为准，含 R73 新增的账号、恢复购买、Android 等问题 |

规则：id 用英文小写 kebab-case，所有语言相同，永不翻译。只有一级区块用 `section[id]`（SE 卡片可用 `aside[id]`），保持 `element_location` 的粒度。改名或删除已注册的 id，必须同步更新本表和 GA 映射。sticky header 用全站的 `section[id]{scroll-margin-top}` 处理，不再依赖推广 CSS 泄漏到全局的规则（研究 01 §7.3）。

**对 GA 报表的影响**（H2 提供基线后核对；文档 06 §8.4 需要同步）

| 维度 / 事件 | 变化 | 处理 |
|---|---|---|
| `element_location` | 保留 `hero/features/screenshots/faq/surfenglish/header/footer/body`；新增 `languages`、`pricing`。`cta` 的含义改变：旧版 `cta` = 价格 + 下载（旧 `index.html:171`），新版 `cta` = 只有最终下载 | 新旧对照时，旧 `cta` ≈ 新 `pricing` + 新 `cta`，在 Explorations 中合并两者（R12）。文档 06 §8.4 中"`screenshots` 消失"的说法作废（R22） |
| `page_path` | `/ja-top.html` → `/ja/` 等 | 用 `content_group`（`home`、`about`、`chrome_extension`、`legal`、`404`，P2 加 `guide`）加 §4.3 的 locale 映射跨新旧路径聚合；在 Explorations 里用正则 `^/(ja-top\.html\|ja/)$` 合并 |
| `nav_click`、`footer_link_click` | 语言链接如果不显式标注会被计入，导致突增 | 统一用 `language_switch`，带 from/to（§7.2，R38） |
| `chrome_store_click` | 新商店域名识别不到（F9） | CTA 显式写 `data-ga-event`（§3.5） |
| `surfenglish_promo` | 旧 label `bar_*`、`section_*` 停用 | 新 label 按文档 04（`card_*`、`faq_*`、`footer_*`、`about_*`，R3）；`langhint_anchor` 随落点 ③ 一起删除（R42） |

---

## 8. 自动语言跳转与语言建议条

### 8.1 结论【决策】：不做服务端自动跳转

1. Google 明确建议不要按语言自动跳转，也不要按 IP 调整内容。Googlebot 从美国 IP 抓取，且不发送 `Accept-Language`（研究 06 §1.4）。自动跳转会让爬虫只能看到一个版本。
2. CF `_redirects` 本身就不支持按语言或国家跳转（研究 06 §2.4）。要做只能上 Pages Functions，引入额外的复杂度和请求配额（研究 09 §3.5 C-3）。
3. 品牌词流量落在 `/`（F25）。对 `/` 做任何条件跳转，都会危及排名 1.6 的品牌页。
4. 用户在 `/` 上随时可以用 header 的切换器切到自己的语言，成本只是一次点击。

### 8.2 语言建议条（可选，推荐 Phase 1 随首页上线）【建议】

| 项 | 规范 |
|---|---|
| 出现位置 | 只在 hreflang 簇里包含"建议语言 M"的页面上出现：Phase 1 是 20 个首页，Phase 2 加上指南页。en-only 页面（about、契约页）、404、S0 下的扩展页不出现 |
| 触发 | 按顺序遍历 `navigator.languages`，取第一个能映射到本站 locale 的语言作为 M（映射见下表）。以下条件同时满足才显示：M ≠ 当前页语言；`document.referrer` 不是本站（刚用切换器主动选过语言的人不打扰）；30 天内没有关闭过针对 M 的建议 |
| 形态 | `position: fixed`，固定在底部（`inset-block-end: 16px` 加安全区），最大宽度 480px。固定定位不推挤正文，不产生 CLS。放在底部，也避开了 Safari 顶部的 Smart App Banner |
| 文案 | 用**目标语言 M** 书写，例如 ja：「このページは日本語でもご覧いただけます。」，按钮「日本語で表示」，关闭按钮的 aria-label「閉じる」。字符串来自各 locale JSON 的 `langSuggest.{message,action,close}`；构建时只把本页簇内各语言的字符串内联成 `<script type="application/json" id="lang-suggest">`，约 3 KB |
| 目标 URL | 从 head 中的 `<link rel="alternate" hreflang="M">` 读取（M 取 locale 码，pt 系浏览器读 `pt-BR` 条目），不另外维护映射 |
| 可访问性 | `role="region"`，`aria-label` 用 M 语言；不抢焦点；`lang` 和 `dir` 按 M 设置；`prefers-reduced-motion` 时不做动画 |
| 搜索 | 容器加 `data-nosnippet`，防止渲染器把"本页面也有英文版"之类的句子当作摘要（研究 09 §4.3 同理） |
| 存储 | `localStorage['wbw.langSuggest'] = {dismissed:'ja', at:<ts>}`，读写都包在 try/catch 里。不用 cookie，也不存储任何其它信息 |
| GA | 接受按钮加 `data-ga-event="lang_suggest" data-ga-label="accept:ja"`；关闭按钮加 `data-ga-label="dismiss:ja"`。这里不重复上报 `language_switch` |
| 禁止 | 不自动跳转，不遮挡正文，不做弹窗；JS 失败时什么也不显示（页面照常可用） |

浏览器语言 → 本站 locale 的映射：

| 浏览器语言（前缀匹配，忽略大小写） | M |
|---|---|
| `zh-Hans*`、`zh-CN`、`zh-SG`、只有 `zh` | zh-Hans |
| `zh-Hant*`、`zh-TW`、`zh-HK`、`zh-MO` | zh-Hant |
| `pt*` | pt-BR |
| `en*` | en |
| 主码 ∈ {ja ko es fr de it nl pl ru tr uk vi th id ar hi} | 同名 |
| 其它（如 nb、sv、he） | 不显示 |

---

## 9. Phase 2 预留路径规则

### 9.1 路径【决策】

| 内容 | en | 其它语言 |
|---|---|---|
| 指南 / 解释页 / 诚实对比 | `/guides/<slug>/` | `/<locale>/guides/<slug>/` |
| 指南索引 | `/guides/`（该语言 ≥ 2 篇时生成，R25） | `/<locale>/guides/` |
| 本地化实体页 | `/about/` | `/<locale>/about/`（Phase 2 评估） |

对比页也放在 `/guides/` 下，不另开 `/vs/` 或 `/compare/` 命名空间：页面少，一个命名空间更容易维护，也避免看起来像批量对比页（研究 06 §5.3 第 5 条）。**不做"语言 × 功能"程序化批量页**（基线 §C；研究 06 §3.2）。

### 9.2 slug 语言：英文 slug 与本地 slug 的取舍

| 维度 | 英文 ASCII slug，所有语言共用 | 本地 slug（如 `/ja/guides/iphone-ウェブページ-翻訳/`） |
|---|---|---|
| 排名 | URL 关键词 "hardly any effect"（研究 06 §1.3） | 同左，几乎没有收益 |
| 分享与可读 | 稳定、短，在任何渠道都不变形 | 非 ASCII 字符被复制、分享时会变成 `%E3%82…` 这样的百分号编码，中日韩泰阿印尤其难看 |
| 工程 | 页面键 = slug，切换器、hreflang、`_redirects` 都直接复用 | 需要维护 slug × locale 映射；macOS（APFS）与 Linux 构建机在 Unicode 正规化（NFC/NFD）上有差异，大小写之外又多一类"本地正常、线上 404"的风险（研究 09 §5.3） |
| SERP 展示 | 桌面端面包屑式 URL 显示英文词 | 显示本地词，CTR 可能略有提升（未经验证） |

**【决策】** 每篇指南只有一个英文 slug，作为它的 key，所有语言共用。本地关键词放在 title、H1、首段和 alt 里。slug 规则见 §1.2。到 Phase 3，只有在 es、pt-br、fr、de 这类拉丁字母语言上**有数据证明** URL 显示会影响 CTR 时，才评估改用本地 ASCII slug，旧 slug 301 过去。

### 9.3 生成规则

1. 数据：`src/guides/<slug>/<code>.json`，字段至少包括 `title`、`description`、`reviewed`、`updated`。`reviewed !== true` 的语言版本不生成（P5、研究 06 §1.6）。
2. hreflang 按 §6.1 组簇（含 HL-11 的附加码）；切换器按 §7.2 回落。
3. 入链：首页对应功能段落里的上下文链接（每个首页最多 1–2 条，只链本语言已有的指南）、页脚"指南"列、hub、相关指南之间的互链。只靠 sitemap 被发现是不够的（研究 06 §3.2）。
4. 改 slug 时，构建必须自动在 `_redirects` 里为所有语言版本追加 `旧 slug → 新 slug 301`；删除指南时，301 到同语言 hub，没有 hub 就 301 到同语言首页。追加的规则放在 D 组静态规则之后、splat 规则之前，并在同一次变更中更新 §5.2 夹具与条数表（R54）。

---

## 10. 与 SurfEnglish 的 IA 关系

### 10.1 互链位置【裁定 R42；话术与体量见文档 04】

叙事轴按 R40：两者互补，SE 也值得一试。WBW 让你读**任何你想读的网页**；SE 是同一开发者为学英语的人做的另一种练法。**禁止**"可能更适合你"一类的替换性措辞。SE 卖点只用 WBW 没有的功能（R41）。

| # | 方向 | 位置 | 页面 | 目标 |
|---|---|---|---|---|
| ① | WBW→SE | 兄弟卡片 `#surfenglish`（`pricing` 之后、`faq` 之前，§7.5） | 19 个首页（**zh-Hans 不渲染**，R42；公告开启时也不渲染，R35） | SE 同语言页（§10.2）。App Store 链接用文字链接，不用黑色徽章（R43），`ct=wbw-card`（R3） |
| ② | WBW→SE | FAQ 中关于 SurfEnglish 的一问（`faq-english-learner`） | 20 个首页 | SE 同语言页（§10.2），只放 SE 官网链接，不放 App Store 链接，因此没有 `ct`（文档 04 §7.2）。zh-Hans 注明 SE 目前未在中国大陆 App Store 上架（R42） |
| ~~③~~ | — | ~~`#languages` 段落中的情境提示~~ | — | **已删除（R42，取代 R4）** |
| ④ | WBW→SE | 页脚 "More from the maker" | 全站 | SE 同语言页（en-only 页面 → SE `/`） |
| ⑤ | WBW→SE | `/about/` 的家族说明 | `/about/` | SE `/` 与 SE `/about/`；另有 SE App Store 文字链接（`ct=wbw-about`，R3、R43） |
| ⑥ | SE→WBW | SE `/about/` 与 SE 页脚（SE 仓库的配套改动） | SE 12 个语言页 | WBW 同语言首页。SE 的 12 个 locale 在 WBW 都有对应页，一一映射即可 |
| — | 不放 | privacy、support、扩展页的正文区块 | — | 基线 F、F36 |

### 10.2 WBW locale → SE URL

| WBW locale | SE 目标 | 备注 |
|---|---|---|
| en | `https://surfenglish.app/` | |
| zh-Hans | `https://surfenglish.app/zh-hans/` | 只有落点 ②④⑤，不渲染 ① 卡片，也不放任何 SE 的 App Store 链接（SE 在中国大陆不可下载，F18、R42） |
| zh-Hant、ja、ko、es、pt-BR、vi、id、th、hi、ar | `https://surfenglish.app/<同 path>/` | 共 10 个，路径与 WBW 完全相同 |
| de、fr、it、nl、pl、ru、tr、uk | `https://surfenglish.app/` | 注明"App 界面为英文等 12 种语言，译文可选你的语言"（基线 F；修正现有"App in 12 Sprachen"的误导说法，F10） |

### 10.3 IA 层的禁止项与约束

- 两站之间不写 `hreflang` 和 `canonical`，也不写 `<link rel="alternate">`（基线 §B5、F35）。两款 App 是不同的产品，不是同一内容的不同语言版本（研究 06 §1.1）。
- 不加 `nofollow`/`sponsored`，不带 UTM（研究 10 §2 C11：SE 没有统计，UTM 无人接收，还会给 SE 制造带参数的 URL）。归因靠 WBW 侧的 GA 事件和 App Store 的 `ct`（只按落点，R3、R55）。
- SE 的 URL 不进 WBW 的 sitemap；SE 不出现在 WBW 的语言切换器里。
- 实体关联通过双方 JSON-LD 共用同一个 creator Person（`@id: https://surfenglish.app/about/#maker`，R17）加可见文字说明来实现，不用 `isRelatedTo`（研究 10 §2 C18；细节见文档 03）。
- SE 侧改动（⑥）属于 SE 仓库的配套工作，排期按 R51：**PR-SE-1 在 T0 前合并；PR-SE-2（SE 页脚按 locale 链到 WBW 语言页）在 T+7d 内合并**（取代 v1.0"WBW 先上线、SE 后补、不设期限"的写法；H14）。App Store 上指向官网的链接是 nofollow，只算发现/引荐入口，不计入外链价值（R51）。

---

## 11. 验收标准

全部在 CF preview 上通过后才切 DNS；切换后在正式域名上重跑一遍（研究 09 §3.6、§7）。期望值不写死：脚本读 §5.2 夹具和 build 输出的 `.cache/{routes,redirects}.json`。

| # | 项 | 通过标准 | 方法 |
|---|---|---|---|
| A1 | 页面清单 | `dist` 中的 HTML 恰好是 §2.1 列出的页面：已发布首页、about、2 个扩展页、3 个 `/legal/*/`（按契约的 C-1/C-2 状态计）、1 个 404（R21），没有多余页面（例如 backup） | 构建日志加 `find dist -name '*.html'` |
| A2 | 旧 URL | 21 个旧文件 × 2 种写法（`.html` / 无扩展名）共 42 个，加 `/index.html`、`/index`，全部**单跳**到 §5.2.2 的目标（B 组、C 组），码与夹具一致（默认 301；`publish:false` 为 302；`indexHtmlRule=false` 时 B1 为 CF 308），目标返回 200 | §5.2.4 Q15–Q17；`verify-deploy.sh` 组 3 |
| A3 | query | `/ja-top.html?utm_source=t` 的 Location 带上 `?utm_source=t`；没带就在 §5.3 第 6 条记录实测结果，判 **WARN**，不阻塞上线（`QUERY_PRESERVED=0`） | §5.2.4 Q18 |
| A4 | 契约 URL | 满足 §5.4 判定表中"C-1 通过"或"逐 URL 降为 C-2"的条件；iOS 真机两个入口都能打开；生产域名下契约 URL 与 `/legal/*/` 都没有 `X-Robots-Tag`（R48） | §5.4 脚本、文档 06 §9.3 加真机 |
| A5 | 别名 | D 组 14 条静态规则和 7 条 splat 规则全部单跳 301（Q17、Q19、Q20）；实验组 C 开启前，`/zh-Hans/` 返回 404 而不是循环，`/zh-hans/` 始终返回 200（Q22、Q23） | curl |
| A6 | hreflang | 解析所有可索引页面：每个簇都对称、包含自身、x-default 正确；首页的 `<link rel="alternate" hreflang>` 数 = 已发布 locale 数 + 附加码数 + 1（全部发布时为 22），由 LOCALES 计算；`pt` 与 `pt-BR` 指向同一 URL；所有 href 都是 200 的规范 URL；sitemap 的 xhtml 与 HTML 逐条相等；簇中不出现 noindex 页和 SE 的 URL | 构建期断言（HL-9、HL-11）加研究 09 §7 第 4 组 |
| A7 | canonical 与可索引一致 | 每个可索引页的 canonical 都是自身的绝对地址（契约页为契约地址），以 `https://www.word-by-word.app/` 开头；404、S0 下的扩展页和扩展隐私页都没有 canonical；按对外 URL 满足 indexable ⇔ 无 noindex ⇔ 自引用 canonical ⇔ 在 sitemap（R49，文档 06 D-20） | 构建期断言加 grep |
| A8 | 切换器 | 每个页面的 header 和 footer 各有 20 个 `<a hreflang>`（只计已发布的 locale）；在簇页面上指向同页面的对应语言版本，否则指向该语言首页；关闭 JS 后仍可展开并点击 | 脚本加禁用 JS 手测 |
| A9 | 内链 | 站内链接全部大小写敏感地可解析，0 个指向跳转源或 `/legal/*`；sitemap 中的每个 URL 至少有 1 个站内入链 | §5.5 第 3 条 |
| A10 | 404 | `/definitely-missing-xyz` 返回 404 和自定义页面（不是 SPA 返回的 200）；§5.2.4 Q30 的全部路径返回 404。本地化 404 不在 Phase 1 验收范围（R21） | curl |
| A11 | robots/sitemap | 两者都返回 200；sitemap 只含 §2.1 标 ✅ 的 URL（S0 状态 23 条，S1 状态 26 条），不含 pages.dev | curl 加 xmllint |
| A12 | pages.dev | `<project>.pages.dev` 和 preview 的响应带 `X-Robots-Tag: noindex`，正式域名的响应不带 | `curl -sI` |
| A13 | 锚点 | 20 个首页都有 §7.5 的全部 id，例外是 zh-Hans 页和公告开启时没有 `surfenglish`；`/#faq`、`/ja-top.html#faq`、`/#pricing`、`/#cta` 最终都落到对应区块 | 脚本加手测 |
| A14 | 扩展子站 | `chromeStoreUrl` 为空和填入合法 URL 两种配置都能构建通过，输出符合 §3.5：S0 时 header 没有扩展导航项，页脚有；扩展页和扩展隐私页为 noindex、无 canonical、不在 sitemap 中；首页 FAQ 不出现扩展名称；S1 时全部反过来。两态下扩展页都有"与 WordByWord.io 无关"的声明。填入非法 URL 时构建失败 | 构建两次 |
| A15 | SE 关系 | 全站 0 个指向 surfenglish.app 的 hreflang 或 canonical；SE 链接不带 `utm_`、`nofollow`；zh-Hans 页没有 ① 卡片，也没有 SE 的 App Store 链接；首页没有落点 ③；SE 卡片不用黑色 App Store 徽章 | grep |
| A16 | GA | 语言链接触发 `language_switch`，带 `from_locale`/`to_locale`，不触发 `nav_click`/`footer_link_click`（R38）；`page_locale` 取值为 §4.3 的新值；realtime 能收到 page_view | GA DebugView |
| A17 | 上线后 | 提交 `sitemap.xml` 和 `sitemap-legacy.xml`；对 `/`、`/ja/`、`/privacy.html` 做 URL Inspection；品牌守护按 R18/R50："wordbyword" 查询的 28 天平均排名在 T+4w 时 **≤ 2.0**；7 日均值连续 7 天 **> 3.0** 时启动排查和回退评估。4 周后 GSC 中旧 URL 显示为"已重定向" | GSC（基线依赖 H1） |
| A18 | `_redirects` 夹具 | D-12（a）–（g）全部 0 error；默认开关下生成结果与 §5.2.2 逐行相等；条数与 §5.2.3 条数表一致（默认 67/7） | 构建期断言（R54） |
| A19 | 语言声明 | 每页 `<html>` 都带 `lang`、`dir`、`data-script`，且与 locale 一致；`content-language` meta 的值等于 `LOCALES.contentLanguage`；任何响应都没有 Content-Language HTTP 头（R47、R60） | 构建期断言加 `curl -sI` |

---

## 12. 未决事项（引用裁定第三节 H1–H18）

| 编号 | 对本文的影响 | 未提供时的默认做法 |
|---|---|---|
| H1 GSC「网页」「国家」导出、`ja-top.html` URL 检查 | 作为 A17 的监控基线；判断是否有旧语言页带着外部价值（不改变 301 设计） | 照常上线，用上线当周的数据作为基线 |
| H2 GA4 `surfenglish_promo` 各 label 基线、各页面流量 | 核对 §4.3、§7.5 中的 GA 维度映射（含旧 `cta` → 新 `pricing` + `cta`） | 先按本文映射上线，事后补对照 |
| H3 ASC Provider Token（`pt`） | header、价格区、SE 卡片等 App Store 链接的完整归因参数 | 输出不带 pt 的链接并告警；`ct` 照常按落点输出 |
| H4 CWS listing URL | 扩展子站处于 S0 还是 S1（§3.5）：是否索引、是否进 sitemap、header 是否显示、CTA 形态；是否进入 Phase 3（ja/ko） | S0 |
| H5 CWS 后台登记的扩展隐私 URL | 决定 `/chrome-extension/privacy.html` 是否是真正的外部契约 | 一律按契约处理，始终可访问 |
| H6 Consent Mode 与 privacy.html 改写 | 只影响契约页的内容，不影响 URL | URL 不变 |
| H7 母语审校安排 | 决定 T1 首页和 Phase 2 指南（P2-02）何时能 `reviewed:true` | 按 R36 |
| H8 Google Cloud DNS `www` 记录的编辑权限 | A1–A19 在正式域名上的复测时间 | 无默认（阻塞 M5） |
| H9 Cloudflare Pages 项目权限 | M1-03 spike（§5.2.1 各开关的取值、§5.3 第 6 条的实测记录） | 无默认（阻塞 M1） |
| H10 `docs/` 是否进入公开仓库 | §5.2 夹具需要转写进 `scripts/fixtures/`，不依赖文档本身是否入库 | 不入库（R30） |
| H12 扩展是否收费、能否标 Beta | §3.5 S0 的 CTA 文案 | 写 "Coming soon"，不标 Beta，不标价格 |
| H14 SE 仓库配套 PR 的授权与排期 | 落点 ⑥ 的上线时间 | 按 R51：PR-SE-1 在 T0 前合并，PR-SE-2 在 T+7d 内合并 |

---

## 13. 对基线的修订建议（v1.1 状态）

1. **扩展页的 header 导航项按状态显示**（涉及基线 U3"进入导航"）→ **已由 R2、R16 裁定采纳**：S0 时 header 隐藏，只保留页脚"产品"列和首页 FAQ 的入链；S1 时 header 显示。已落实到 §0 第 9 条、§2.1、§3.5、§7.1、A14。
2. **补充本地化 404** → **已由 R21 裁定**：Phase 1 只做 en（含 20 种语言的首页链接列表）；本地化 404 作为 M4 可选项（文档 07 M4-12），前提是 M1-03 证实 CF 支持嵌套 404。已落实到 §2.1、§2.2、§6.9、A1、A10。

本版没有新的基线修订建议。

---

## 14. 修订记录 v1.1（2026-10-05）

| 评审 / 裁定编号 | 处理结果 | 修改位置 |
|---|---|---|
| SEO-05（`/legal/*` noindex 与契约 URL 冲突） | **已改（部分采纳）**。本文 v1.0 已经不加 noindex，与 R48 一致；新增"生产域名下契约 URL 与 `/legal/*/` 无 `X-Robots-Tag`"的断言，并注明文档 03 §6.2 的对应行要删除。**拒绝**其中的备选方案（用 `_headers` 给 `/legal/*` 加 X-Robots-Tag），理由：R48 裁定不加 noindex，靠 canonical | §0 第 5 条、§2.1 P1-11、§5.4、§5.2.4 Q01/Q12、A4 |
| SEO-12（pt 通用 hreflang） | 已改：`hreflangExtra:['pt']`，首页簇 22 条，sitemap 同步，条数改为由 LOCALES 计算 | §0 第 6 条、§4.1 注 ⁴、§4.2、§6.1 HL-11 与条数段、§6.3、§6.7、A6 |
| SEO-14（`_redirects` 条数与 query 判定） | 已改：本文成为唯一规格；条数改为按 §5.2.3 条数表计算；query 丢失判 WARN，并在 §5.3 第 6 条预留实测记录表 | §5.2、§5.3 第 6 条、A2、A3、A18 |
| ENG-01（旧站冻结验收不能用 last-modified） | 不涉及本文（目标为文档 07/06，已由 R56 裁定），无改动 | — |
| ENG-02（D-12 与契约代理规则冲突） | 已改：按 (a)–(d) 改写 D-12，另增 (e) 规范目标、(f) 源不得是真实页面、(g) 夹具一致，并补 0 error 自测用例 | §5.5 第 1 条 |
| ENG-03（`_redirects` 两份规格矛盾） | 已改：确定本文是唯一规格（R54）；定义 `ALIASES`、`SITE.redirectFlags{indexHtmlRule, experimentL, experimentC}`、`CONTRACTS.bareSlash`；contract-test 对 `/legal/*/` 的断言随 `experimentL` 切换。条数没有沿用 ENG-03 写的 62/7 和 68/10：那是 v1.0 的计数错误，见下文"自查"一行 | §5.2.1–§5.2.4、§5.4 判定表、§5.5 |
| ENG-07（content-language meta 不过 W3C；`_headers` 同名头拼接） | **部分拒绝**：删除 meta、改用 HTTP 头的方案与 R47 冲突。按 R47 保留 meta（值改为语言-地区写法），**不输出** HTTP 头，W3C 闸门对这一条做显式 allowlist。ENG-07 对 `_headers` 逗号拼接的担忧采纳为"`_headers` 不得出现 Content-Language" | §0 第 3 条、§4.1 列说明、§6.2、§6.8、A19 |
| ENG-11（strings-v1 冻结时点） | 不涉及本文（目标为文档 07，已由 R59 裁定），无改动 | — |
| ENG-13（verify-deploy 误判） | 已改：hreflang 只统计 `<link rel="alternate">`，数量由 LOCALES 计算；query 判 WARN；期望值改为读夹具和 `.cache/{routes,redirects}.json`，覆盖 `publish:false` 的 302 | §5.2.4 引言与 Q17/Q18/Q32、§5.5 第 6 条、§6.1 条数段、A2、A3、A6 |
| I18-04（缺 `data-script`） | 已改：LOCALES 加 `script` 字段，§4.1 加列，`<html>` 模板加 `data-script`，加构建断言 | §4.1、§4.2、§6.2、§6.3、§6.4、A19 |
| I18-13（pt 通用 hreflang） | 已改，与 SEO-12 合并处理 | 同 SEO-12 |
| I18-14（content-language 取值） | **部分拒绝**：采纳"LOCALES 加 `contentLanguage` 字段，取值与 hreflang 分开"，以及 zh-cn、zh-tw、pt-br 三个值；**拒绝** ja-jp、ko-kr、ar-sa、hi-in 等"语言-主市场"值，理由：R47 规定其余语言写语言码 | §4.1、§4.2、§6.2 |
| I18-15（徽章 v2 接口） | 已改，并于 2026-10-05 用 curl 复核（v2 uk-ua 返回 200、10,867 B；v2 ar-sa/hi-in 返回 404）：uk 用 `uk-ua`（v2），ar、hi 用 `en-us`；注明 F28 的 uk 部分已被修正，05/06 的 `badges.sh` 需要同步 | §4.1 徽章列与注 ⁵、§4.2 |
| R1 扩展页 en + zh-Hans | 已标注为裁定，注明 06 的 PAGES/L-3 需要同步 | §3.2、§4.2 |
| R2 / R16 扩展子站状态机与 header 导航 | 已改：S0 时 header 隐藏、页脚保留、noindex、无 canonical、不进 sitemap；扩展隐私页始终可访问，索引状态跟随扩展页；两态都有 WordByWord.io 声明 | §0 第 9、10 条，§2.1，§3.4，§3.5，§6.2，§7.1，§7.3，A14，§13 第 1 条 |
| R3 / R55 `ct` 只按落点 | 已改：header `wbw-header`、扩展页 `wbw-ext`、SE 卡片 `wbw-card` | §3.5、§7.1、§10.1、§10.3 |
| R9 OG 与图片路径 | 已改：sitemap 示例改为 `/assets/` 下的指纹路径 | §6.7 |
| R12 价格区 id | 已改：`plus` → `pricing`；`cta` 只作为最终 CTA；GA 对照表写明旧 `cta` ≈ 新 `pricing` + 新 `cta`；导航增加 `#pricing` | §0 第 10 条、§7.1、§7.5、A13 |
| R15 WordByWord.io 声明的位置 | 已改：只放 about 和扩展页，不放页脚 | §2.1 P1-03、§3.4、§7.3 |
| R17 Person | 已引用 | §7.3、§10.3 |
| R18 / R50 品牌守护阈值 | 已改：A17 改为 ≤ 2.0（28 天，T+4w），警戒线为 7 日均值连续 7 天 > 3.0 | A17 |
| R21 本地化 404 | 已改：Phase 1 只做 en，本地化 404 为 M4-12 可选项 | §0 第 2 条、§2.1、§2.2、§6.9、A1、A10、§13 第 2 条 |
| R22 字段名、版权行、`screenshots` | 已改：LOCALES/PAGES 字段名按 06；版权行 `© 2025–{currentYear} Jinlong`；保留 `screenshots` | §4.2、§7.3、§7.5 |
| R24 H 编号 | 已改：原 hreflang 规则编号 H-1…H-10 改为 HL-1…HL-11，避免与 H7/H8 等统一编号冲突；§12 按 H1–H18 引用 | §6.1、§6.2、§6.6、§12 |
| R25 hub 门槛 | 已标注 | §2.3、§9.1 |
| R33 zh-Hant 截图回落 | 已标注 | §4.1 |
| R35 公告开启时不渲染 ① | 已改 | §7.5、§10.1、A13 |
| R36 母语审校 | 已改 | §2.3、§4.1 列说明、§12 H7 |
| R38 `language_switch` | 已改：label 为 `<位置>:<目标>`，自动附带 `from_locale`/`to_locale`；`lang_suggest` 不重复上报 | §0 第 7 条、§4.3、§7.2、§7.5、§8.2、A16 |
| R39 / R46 定位与关键词唯一映射 | 已改：P1-01/P1-02 的目的与意图；how-to 查询归 G1 | §2.1、§2.3 |
| R40 / R41 / R28 SE 叙事 | 已改：互补式、第三人称，禁止替换性措辞 | §4.1 列说明、§7.3、§10.1 |
| R42 落点精简 | 已改：删除 ③；zh-Hans 只保留 ②④⑤；`langhint_anchor` 停用 | §0 第 11 条、§4.1、§7.5、§10.1、§10.2、A13、A15 |
| R43 WBW 转化优先 | 已改：价格区必须有 WBW 徽章；最终 CTA 加强；SE 卡片不用黑色徽章 | §7.5、§10.1、A15 |
| R45 扩展 FAQ 在 S0 下的表述 | 已改 | §2.1、§3.4、§3.5、A14 |
| R47 Content-Language | 已改（见 ENG-07、I18-14） | §0 第 3 条、§4.1、§4.2、§6.2、§6.8、A19 |
| R48 `/legal/*` | 已改（见 SEO-05） | §2.1、§5.1、§5.4 |
| R49 索引一致性 | 已改：新增原则 P7；S0 下的扩展页和扩展隐私页不写 canonical；说明 `/legal/*/` 作为别名路径的判定方式 | §1.1、§2.1 注 ¹、§3.5、§6.2、A7 |
| R51 外链价值与 SE PR 排期 | 已改 | §2.1、§10.3、§12 H14 |
| R53 pt hreflang | 已改（见 SEO-12） | 同 SEO-12 |
| R54 `_redirects` 唯一事实源 | 已改：§5.2 重写为开关表、默认夹具（带 id）、开关增量、条数表、请求级用例；补全 D 组尾斜杠别名 D02…D14；夹具转写进仓库 `scripts/fixtures/` | §0 第 4 条、§1.1 P3、§5.1–§5.5、§9.3 第 4 条、A18 |
| R60 `data-script` | 已改（见 I18-04） | 同 I18-04 |
| 自查：v1.0 条数错误 | 已改：v1.0 写"C 42 条，静态 62 条"，实际 C 组只有 40 条（20 个非英语旧文件 × 2；en-top 在 B 组），v1.0 的真实条数是 60/7。v1.1 补了 7 条尾斜杠别名，默认为 **67/7**。文档 07 M1-06 的"静态 62 条、动态 7 条"，以及文档 06 §3.6.3 的"49 条"，都需要按 §5.2.3 条数表同步 | §0 第 4 条、§5.2.3 |
| 自查：FAQ id 对齐 | 已改：`faq-surfenglish` → `faq-english-learner`，`faq-chrome` → `faq-devices`（与文档 08 D5、原型一致） | §3.4、§7.5、§10.1 |
| 引用规范化 | 已改：研究报告统一写成「研究 0X §…」，设计文档写成「文档 0X §…」；研究 09 风险表条目写明节号，避免与裁定 R# 混淆；依赖文档改为 `appendix/research/` 下的相对路径 | 全文 |
| 一致性审计修正（2026-10-05） | 已改：§4.2 LOCALES 示例删除 v1.0 的 `se` 字段，说明改为由 `SIBLING`/`seMode()` 推导（`local`/`en-site`/`no-card`，与文档 04 §3.7、文档 06 §3.2 一致，R42、R43）；§10.1 落点 ② 注明只链 SE 官网、无 App Store 链接与 `ct`，⑤ 补 `ct=wbw-about`（文档 04 §7.2）；§6.7 sitemap 图片示例由不存在的 `hero-720` 改为 `shot/en/swipe-540`（hero 无位图，R66、文档 06 §3.6.1）；两处裸写的"06 §…"补"文档"前缀 | §4.1 注 ⁵；§4.2；§6.7；§7.5；§10.1 |
| v1.3 验收修正（2026-10-05） | 已改：文首"依赖文档"的裁定范围 R1–R73 → R1–R84（含 v1.3 第五节）；§7.5"对 GA 报表的影响"表中 `page_path` 行的正则含未转义的竖线，在 GFM 表格里会拆出多余的一列，改为转义写法（`\|`）。`_redirects` 67/7（L 70/7、C 73/10、L+C 76/10）、A17 品牌阈值、§10.1 落点与 ct 经验收核对与 R74–R84 无冲突，未改 | 文首表；§7.5 |
