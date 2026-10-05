# 04 · 现有 SurfEnglish 临时推广方案评估

> 调研日期：2026-10-05 · 范围：`wordbyword-web` 中 `js/surfenglish-promo.js`、`css/surfenglish-promo.css`、`img/surfenglish/*`、README、各页面引入方式、线上实际渲染。
> 标记约定：**[事实]** = 已用文件行号/命令输出/线上请求验证；**[推断]** = 基于证据的判断，需设计阶段或用户确认。
> 只读调研，未修改任何项目文件。

---

## 0. 结论速览（TL;DR）

1. **机制**：一个 47 KB 的自包含 IIFE，在 `DOMContentLoaded` 时向 **25 个页面**注入两块内容：①固定在 header 之上的深色公告条（`<aside>`，可关闭 7 天）；②紧跟 `#hero` 之后的整段深色 SurfEnglish 推广卡（图标 + 标题 + 长文案 + 4 chips + App Store 徽章 + 官网链接 + 3 张手机截图）。文案内置 20 种语言，结构完整、无缺键。[事实]
2. **对 WordByWord 定位的稀释很严重**：在 375×812 手机上，公告条 50px + header 105px = **155px 常驻遮挡（19% 视口）**，并把 WordByWord 自己的主 CTA 挤到首屏之外（按钮 top=764、bottom=814 > 812）；推广卡高 **1015px（1.25 屏）**，插在 hero 与 WordByWord 功能介绍之间。用户在 WordByWord 官网看到的**第一个 App Store 按钮属于 SurfEnglish**。[事实，实测]
3. **SEO 几乎零收益**：内容和链接全部由 JS 注入，非渲染型爬虫（含 WebFetch 实测、绝大多数 AI 爬虫）完全看不到 SurfEnglish；Google 渲染后能看到，但链接是全站模板化重复链接 + 泛化锚文本（"Learn more"/"App Store"），且渲染后 DOM 中页面第一个 `<h2>` 变成了 SurfEnglish 的标题，反而稀释 WordByWord 页面主题。链接为 `rel="noopener"`，**没有 nofollow**。[事实 + 推断]
4. **文案已过时**：促销文案取自 SurfEnglish 2026-08-21 的旧定位（"Surf the web, learn English"），而 SurfEnglish 已于 **2026-09-16 重新定位为 "Bilingual News / 译文在每句原文下方 / 语言块（chunks）"**；App Store 名称已是 "SurfEnglish: Bilingual News"。促销文案完全没提 bilingual / chunks，截图也是旧版 UI（底栏还是 "X" 而不是 "Browse"）。[事实]
5. **中国大陆不可下载**：iTunes lookup `country=cn` 返回 0 条结果、`apps.apple.com/cn/app/id6787367021` 返回 404，而 WordByWord 在 cn 区可用。`cn-top.html`/`zh-top.html` 上的 "App Store 下载" 对大陆用户是死链。[事实]
6. **测量闭环缺失**：WBW 侧只有点击事件（无曝光事件，无法算 CTR）；App Store 直链没有 `ct`/`pt` 活动参数；surfenglish.app 线上**没有任何前端统计脚本**，UTM 实际上无人接收。[事实]
7. **值得保留**：20 语种翻译资产（尤其 de/fr/it/nl/pl/ru/tr/uk 这 8 种 SurfEnglish 官网本身没有的语言）、`sitePath` 语言映射（已全部验证 200 + canonical 正确）、Apple 徽章语言映射、GA 事件命名、`icon-192.png` 与 `word-raid.jpg`。**应废弃**：固定公告条 + relayout 逻辑、hero 后的整屏深色卡、JS 注入方式、过时的 tagline/lead/bar 文案、`feed.jpg`（与 `translate.jpg` 几乎重复且为旧 UI）。

---

## 1. 事实基线

| 项 | 内容 | 证据 |
|---|---|---|
| 引入提交 | `7a389ba`（2026-08-23，chi），提交信息写的是 "Refactor code structure and remove redundant code blocks…"，**与实际内容（新增推广模块）不符** | `git show --stat 7a389ba` |
| 改动规模 | 33 files, +1194/−1：新增 JS 668 行、CSS 438 行、4 张图；25 个 HTML 各加 2 行；README 扩写 | 同上 |
| 文件体积 | `js/surfenglish-promo.js` 47,056 B（gzip 传输 15,880 B）；`css/surfenglish-promo.css` 9,865 B（gzip 2,916 B） | `wc -c`；`curl -H 'Accept-Encoding: gzip' -w %{size_download}` |
| 其中 I18N 表 | 第 59–440 行 = 35,399 B（占 JS 75%）；单一语言条目约 1.4 KB（en 1,409 B / zh-CN 1,408 B）→ 每页实际只用到约 4% | `sed -n 59,440p … \| wc -c` |
| 图片 | `img/surfenglish/feed.jpg` 600×1304 139,281 B；`translate.jpg` 600×1304 135,034 B；`word-raid.jpg` 600×1304 187,906 B；`icon-192.png` 192×192 18,073 B（合计约 480 KB） | `sips`、`ls -la` |
| 线上状态 | 线上 JS/CSS 与本地**逐字节相同**；`last-modified: Sun, 23 Aug 2026 08:14:40 GMT`；GitHub Pages `cache-control: max-age=600` | `curl` + `diff -q` |
| 引入方式 | 每页 `<head>` 两行：`<link rel="stylesheet" href="css/surfenglish-promo.css" />` + `<script src="js/surfenglish-promo.js" defer></script>`；`chrome-extension/index.html` 用 `../` 前缀；`privacy.html`/`support.html` 中 link 位于 analytics.js 与 site-notice.js 之间（`privacy.html:17-19`、`support.html:17-19`） | `grep -n surfenglish *.html` |
| 覆盖页面 | 25 个 HTML：`index.html` + 21 个 `*-top.html` + `chrome-extension/index.html`（有 `#hero` → 公告条 + 推广卡，共 23 页）；`privacy.html`、`support.html`（无 `#hero` → 只有公告条） | `grep -c 'id="hero"'` |
| 开关 | `CONFIG.enabled/showBar/showSection`（`js/surfenglish-promo.js:15-26`），改一处即可全站关闭 | — |

---

## 2. 机制详解

### 2.1 CONFIG（`js/surfenglish-promo.js:15-26`）

| 键 | 值 | 说明 |
|---|---|---|
| `enabled` | `true` | 总开关 |
| `showBar` | `true` | 公告条 |
| `showSection` | `true` | 推广卡 |
| `sectionAfter` | `'#hero'` | 推广卡插在该元素之后（`insertAdjacentElement('afterend')`，`:549`） |
| `dismissDays` | `7` | 公告条关闭后隐藏天数 |
| `appStoreUrl` | `https://apps.apple.com/app/id6787367021` | 无国家码、无 `ct`/`pt` |
| `siteUrl` | `https://surfenglish.app/` | + `sitePath` + UTM |
| `utm` | `utm_source=word-by-word.app&utm_medium=referral&utm_campaign=surfenglish_launch` | 无 `utm_content`，公告条和推广卡的 UTM 完全相同 |
| `badgeBase` | `https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/` | 第三方实时请求 SVG |
| `storageKey` | `wbw.surfenglishPromo.dismissedAt` | localStorage |

`SHOTS = ['feed.jpg','translate.jpg','word-raid.jpg']`（`:29`）。

### 2.2 注入流程与 DOM 位置

- 防重：`window.__WBWSurfEnglishPromoMounted`（`:447-450`）。
- 资源基址：用 `document.currentScript.src` 解析 `../img/surfenglish/`，因此子目录（chrome-extension）也能工作（`:453-456`）。
- `mount()`（`:651-661`）：先 `mountSection()` 再（未关闭时）`mountBar()`；`defer` 脚本，`readyState==='loading'` 时挂 `DOMContentLoaded`。
- **推广卡**（`:509-555`）：`<section class="wbw-se-promo" id="surfenglish" dir=…>`，内含 `<h2 class="wbw-se-promo__title">`、`<p lead>`、`<ul chips>`、徽章 `<a>`（`target=_blank rel=noopener`）、官网 `<a>`、3 个 `<figure class="wbw-se-phone"><img loading="lazy" width=600 height=1304>`。支持 `#surfenglish` 深链（`:552-554`）。
- **公告条**（`:559-649`）：`<aside class="wbw-se-bar" id="wbw-se-bar" aria-label="SurfEnglish">` 作为 `body.firstChild` 插入（在 `<header>` 之前）；内含图标、"New" 胶囊、长/短两版文案（CSS 断点 639px 切换）、App Store CTA、"Learn more"、关闭按钮。
- **布局补偿**（`:590-642`）：测量 `body > header` 是否 fixed/sticky → 改写 `header.style.top`、`.nav-spacer` 高度（或 `body.paddingTop`），并兼容 `js/site-notice.js` 的 `.wbw-service-notice`（z-index：bar 1100 < notice 1200，header 100，见 `css/surfenglish-promo.css:39`）；`ResizeObserver` + `resize` 重算。
- CSS 全局副作用：`:root` 注入 `--se-*`、`--wbw-se-offset`、`--wbw-se-header-h` 变量；**`section[id] { scroll-margin-top: … }` 作用于 WordByWord 所有 section**（`css/surfenglish-promo.css:28-30`）——这其实顺带修好了锚点被 fixed header 遮挡的问题，重构时应把这条移入主样式表。

### 2.3 语言识别（`:32-54`, `:458-469`）

1. 取 `location.pathname` 的文件名，查 `FILENAME_LOCALE`（21 个 `*-top.html`；`cn-top.html` 与 `zh-top.html` 都映射 `zh-CN`，`tw-top.html` → `zh-TW`）。
2. 否则读 `<html lang>`：`zh*` 中含 `tw|hk|hant` → `zh-TW`，其余 `zh-CN`；否则取主语言子标签，I18N 有则用，否则 `en`。
3. 实际落地：`/`（index.html，lang=en）→ en；`privacy.html`/`support.html`（lang=en）→ en；`chrome-extension/index.html`（lang=zh-CN）→ zh-CN；`ar-top.html` 带 `dir="rtl"`，且 I18N.ar 自带 `dir:'rtl'`，箭头 SVG 在 RTL 下 `scaleX(-1)`。[事实：`grep '<html'` 输出]

### 2.4 I18N 表

**结构**（每语言）：`sitePath`、`badge`、`label`、（ar 额外 `dir`）、`bar{text, short, cta, more, close}`、`promo{eyebrow, tagline, title, lead, chips[4], site, note, store, alts[3]}`。`bar.text/short` 含 `<strong>` HTML，经 `innerHTML` 原样注入（静态字符串，无 XSS 面，但译文必须 HTML-safe）。

**完整性校验**（node 解析 I18N 后逐语言比对键结构、chips=4、alts=3）：**20 种语言全部 OK，无缺键**。[事实]

| locale | sitePath（→ surfenglish.app） | Apple badge | 徽章是否真本地化 | bar 长文案字数 | lead 字数 |
|---|---|---|---|---|---|
| en | `''`（根） | en-us | — | 90 | 264 |
| zh-CN | `zh-hans/` | zh-cn | 是 | 47 | 98 |
| zh-TW | `zh-hant/` | zh-tw | 是 | 48 | 106 |
| ja | `ja/` | ja-jp | 是 | 57 | 128 |
| ko | `ko/` | ko-kr | 是 | 63 | 149 |
| es | `es/` | es-es | 是 | 97 | 322 |
| pt | `pt-br/` | pt-br | 是 | 94 | 306 |
| vi | `vi/` | vi-vn | 是 | 95 | 291 |
| id | `id/` | id-id | 是 | 105 | 313 |
| th | `th/` | th-th | 是 | 86 | 237 |
| hi | `hi/` | hi-in | **否（回落英文图）** | 87 | 288 |
| ar (rtl) | `ar/` | ar-sa | **否（回落英文图）** | 93 | 259 |
| de | `''` | de-de | 是 | 95 | 367 |
| fr | `''` | fr-fr | 是 | 104 | 351 |
| it | `''` | it-it | 是 | 99 | 325 |
| nl | `''` | nl-nl | 是 | 95 | 317 |
| pl | `''` | pl-pl | 是 | 103 | 332 |
| ru | `''` | ru-ru | 是 | 94 | 348 |
| tr | `''` | tr-tr | 是 | 98 | 327 |
| uk | `''` | uk-ua | **否（回落英文图）** | 98 | 330 |

- `sitePath` 12 个目标 URL 全部线上验证：带 UTM 访问均 **200**，且各页 `<link rel="canonical">` 指向不带 UTM 的干净 URL（如 `https://surfenglish.app/zh-hans/`）。[事实：curl 循环]
- de/fr/it/nl/pl/ru/tr/uk 8 种语言因 SurfEnglish 官网无对应语言页而回落英文根路径——**这 8 种语言的 promo 译文是目前 SurfEnglish 在这些语言里唯一的营销文案资产**。[事实：`build.mjs` LOCALES 只有 12 种]
- 徽章本地化验证方法：对每个 badge code 的 SVG 取 md5 与 en-us 比较；hi-in / ar-sa / uk-ua 与 en-us 相同。[事实]
- 讽刺点：WordByWord 自己 22 处 App Store 徽章**全部写死 en-us**（`grep badges/... *.html` → 22× `black/en-us`，且用的是旧域名 `tools.applemediaservices.com`），客人比主人本地化得更好。这张 badge 映射表可直接复用到 WordByWord 自身 CTA。[事实]

#### 2.4.1 英文（en）全文摘录（`:60-77`）

| 键 | 文案 |
|---|---|
| label | New |
| bar.text | New from the WordByWord team: **SurfEnglish** — learn English faster by reading real articles. |
| bar.short | New: **SurfEnglish** — learn English faster by reading real articles |
| bar.cta / more / close | App Store / Learn more / Dismiss |
| promo.eyebrow | New · From the makers of WordByWord |
| promo.tagline | Surf the web, learn English. |
| promo.title | Learn English by reading what you actually enjoy. |
| promo.lead | SurfEnglish turns real articles, X posts and podcasts into daily English practice. Swipe a sentence to translate it in place, double-tap a word for its meaning in context, listen with an on-device AI voice — and play games built from what you read. Free on iPhone. |
| promo.chips | ① Real articles, graded A1–C1 ② Swipe to translate · Double-tap to look up ③ On-device AI voice, works offline ④ Games built from your reading |
| promo.site | Visit surfenglish.app |
| promo.note | Free to start · App in 12 languages · Translates into 21 languages |
| promo.store | Download on the App Store |
| promo.alts | ① SurfEnglish home feed: real English articles with difficulty levels ② Swipe a sentence to see its translation inline ③ Word Raid — a retro arcade game built from the words you looked up |

#### 2.4.2 简体中文（zh-CN）全文摘录（`:79-96`）

| 键 | 文案 |
|---|---|
| label | 新上线 |
| bar.text | WordByWord 团队新作：**SurfEnglish** —— 读真实英语文章，更高效地学英语。 |
| bar.short | **SurfEnglish** 新上线 —— 读真实文章，更高效学英语 |
| bar.cta / more / close | App Store 下载 / 了解更多 / 关闭 |
| promo.eyebrow | 新上线 · 来自 WordByWord 团队 |
| promo.tagline | 边冲浪，边学英语 |
| promo.title | 读你真正感兴趣的内容，更高效地学英语。 |
| promo.lead | SurfEnglish 把真实的英语文章、X 帖子和播客变成每天的英语练习：右滑翻译整句、双击查看单词在语境中的含义、本地 AI 语音朗读，读过的内容还会自动生成单词游戏。iPhone 免费下载。 |
| promo.chips | ① 真实文章，A1–C1 难度分级 ② 右滑翻译 · 双击查词 ③ 本地 AI 语音，离线可用 ④ 游戏由你读过的内容生成 |
| promo.site | 访问官网 surfenglish.app |
| promo.note | 免费开始 · 应用界面 12 种语言 · 可译成 21 种语言 |
| promo.store | 在 App Store 下载 |
| promo.alts | ① SurfEnglish 首页信息流：带难度等级的真实英语文章 ② 右滑一句，译文就在原文下方出现 ③ Word Raid —— 由你查过的单词生成的复古街机游戏 |

（繁中 zh-TW `:98-115` 为同义繁体改写：「新上線」「讀真實英文文章，更有效率地學英語」「邊衝浪，邊學英語」「裝置端 AI 語音」等。）

#### 2.4.3 日文（ja）全文摘录（`:117-134`）

| 键 | 文案 |
|---|---|
| label | New |
| bar.text | WordByWordチームの新作 **SurfEnglish** — 本物の英文記事を読んで、英語をもっと効率よく学ぼう。 |
| bar.short | 新登場 **SurfEnglish** — 本物の記事を読んで英語を学ぶ |
| bar.cta / more / close | App Store / 詳しく見る / 閉じる |
| promo.eyebrow | 新登場 · WordByWordチームより |
| promo.tagline | ネットの波に乗って、英語を学ぼう |
| promo.title | 本当に興味のあるものを読んで、英語を身につける。 |
| promo.lead | SurfEnglishは、本物の英文記事・Xの投稿・ポッドキャストを毎日の英語学習に変えるアプリ。スワイプで文をその場で翻訳、ダブルタップで文脈に合った単語の意味を表示、端末内AI音声で読み上げ。読んだ内容からゲームが自動生成されます。iPhoneで無料。 |
| promo.chips | ① 本物の記事、A1–C1のレベル表示 ② スワイプで翻訳 · ダブルタップで単語検索 ③ 端末内AI音声、オフライン対応 ④ 読んだ内容から生まれるゲーム |
| promo.site | 公式サイト surfenglish.app へ |
| promo.note | 無料で始められる · アプリは12言語対応 · 21言語に翻訳 |
| promo.store | App Storeでダウンロード |
| promo.alts | ① SurfEnglishのホームフィード：難易度付きの本物の英文記事 ② 文をスワイプすると、その場に翻訳が表示 ③ Word Raid — 調べた単語から作られるレトロなアーケードゲーム |

#### 2.4.4 其它 17 种语言

ko / es / pt / vi / id / th / hi / ar / de / fr / it / nl / pl / ru / tr / uk / zh-TW：键集合、chips 数、alts 数与 en 完全一致，均为与 en 同义的本地化（含本地化的 `close` 用于 `aria-label`、本地化 Apple 徽章 alt）。见 `js/surfenglish-promo.js:98-439`。

### 2.5 GA 埋点

- 所有可点击元素带 `data-ga-event="surfenglish_promo"` + `data-ga-label`：

| label | 元素 | 位置 |
|---|---|---|
| `bar_app_store` | 公告条 App Store CTA | `:578-579` |
| `bar_site` | 公告条 Learn more | `:580-581` |
| `bar_dismiss` | 公告条关闭按钮 | `:583-584` |
| `section_app_store` | 推广卡徽章 | `:532-533` |
| `section_site` | 推广卡官网链接 | `:536-537` |

- 由 `js/analytics.js` 捕获阶段统一监听 `[data-ga-event]`：事件名 = `sanitizeEventName('surfenglish_promo')`；参数含 `event_category:'site_interaction'`、`event_label`(=label)、`link_url`、`link_domain`、`page_path`、`page_locale`(=`<html lang>`)、`element_location`、`outbound`（`js/analytics.js` `resolveEventName` / `buildEventParams`）。
- `element_location`：推广卡内 = `surfenglish`（`closest('section[id]')`）；公告条为 `<aside>`，既非 header/footer 也非 section → `body`。
- 因为显式 `data-ga-event` 优先，SurfEnglish 的 App Store 点击**不会**落入 WordByWord 的 `app_store_click`（不污染 WBW 转化指标）——这是正确设计。[事实]
- **缺口**：无曝光（view/impression）事件 → 无法计算 CTR、无法比较 bar vs section 的效率；`event_label` 在 GA4 需注册为自定义维度才能在报表中使用（GA 后台配置无法从仓库验证）。[事实 + 推断]

### 2.6 关闭记忆（`:490-505`, `:644-648`, `:658`）

- 点 × → `localStorage[wbw.surfenglishPromo.dismissedAt] = Date.now()` → 移除 bar → relayout。
- 下次加载：`Date.now() - at < 7 × 864e5` 则不挂 bar。**只控制公告条，推广卡始终显示**。
- localStorage 不可用（无痕/禁用）时 try/catch 吞掉 → 每次访问都会再出现。
- key 以 origin 为粒度，跨语言页共享；7 天后自动"复活"。

### 2.7 链接与 UTM

- App Store：`https://apps.apple.com/app/id6787367021`（无国家码 → Apple 按用户 storefront 跳转；无 `ct=`/`pt=` App Analytics 活动参数，App Store Connect 只能看到 web referrer 级别）。
- 官网：`https://surfenglish.app/<sitePath>?utm_source=word-by-word.app&utm_medium=referral&utm_campaign=surfenglish_launch`；bar 与 section 共用同一 UTM（无 `utm_content` 区分位置）。
- **surfenglish.app 线上无任何前端统计**：`curl https://surfenglish.app/ | grep cloudflareinsights|gtag|plausible` 无输出；源码 `src/templates/layout.mjs`、`src/js/main.js` 亦无 analytics。→ UTM 当前**无人接收**（除非 Cloudflare 后台另有服务端统计，仓库无法验证）。[事实]
- 所有外链 `target="_blank" rel="noopener"`，**无 `nofollow`/`sponsored`**。[事实：`:532,536,578,580`]

### 2.8 素材

| 文件 | 内容 | 状态 |
|---|---|---|
| `icon-192.png` | SurfEnglish 图标（与 SurfEnglish 官网 `public/icons/` 中各文件 md5 均不同，应为单独导出的 192px 版） | 可用 |
| `feed.jpg` | 首页信息流（BBC Sport 新闻卡片 + A2/B2 等级），**旧版底栏 Home/Explore/X/Games/Settings** | 旧 UI |
| `translate.jpg` | 与 `feed.jpg` 同一画面，仅第一条新闻下多了**中文**译文（右滑翻译效果） | 旧 UI，且与 feed.jpg 视觉几乎重复 |
| `word-raid.jpg` | Word Raid 游戏（复古掌机风） | 游戏 UI 应仍有效 |

- SurfEnglish 当前官网（1.3.0）截图为 720×1565，底栏已变为 **Home/Explore/Browse/Games/Settings**（`SurfEnglishWebsite/public/images/screenshots/feed-translation.jpg`，2026-09-16），另有 `feed-chunks.jpg`、`browser.jpg`、`explore.jpg`。[事实：读图比对]
- 所有语言页展示的翻译截图都是**中文译文**，对西语/日语等访客并不"所见即所得"。[事实]
- 截图中含第三方新闻图片（BBC 体育/新闻配图、人物肖像），属于真实 App 截图惯例，风险低，但在一个非 SurfEnglish 自有域名上展示需知悉。[推断]

---

## 3. 用户实际看到的效果（线上实测）

在 Browser pane 打开 `https://www.word-by-word.app/`，用 JS 测量 DOM（文档坐标，scrollY=0）。[事实]

### 3.1 桌面 1024×768

| 元素 | top | 高度 |
|---|---|---|
| 公告条 `#wbw-se-bar` | 0 | 48 |
| header（`style.top` 被改为 49px） | 49 | 57 |
| `.nav-spacer`（64 → 113） | 0 | 113 |
| `#hero` | 113 | 1429 |
| **`#surfenglish` 推广卡** | **1542** | **729（≈0.95 屏）** |
| `#features` | 2271 | 4524 |
| 文档总高 | — | 9324 |

首屏：顶部深海军蓝渐变条（图标 + 渐变 "NEW" 胶囊 + "New from the WordByWord team: SurfEnglish — learn English faster by reading real articles." + 白边胶囊 "App Store →" + 青色 "Learn more →" + ×），其下才是白色 WordByWord header 和蓝色 hero。滚过 hero 的大手机截图后，是一整屏深色"oceanic liquid glass"卡片：青色 eyebrow、SurfEnglish 图标与名称、白色大标题、长段落、4 个玻璃胶囊、黑色 App Store 徽章 + 青色官网链接、右侧三台倾斜扇形排列并被卡片底边裁切的手机截图。整页其余部分是浅色/蓝色的 WordByWord 风格，**推广卡是全页视觉权重最高、质感最"新"的区块**。

### 3.2 手机 375×812

| 元素 | top | 高度 |
|---|---|---|
| 公告条 | 0 | 50 |
| header（两行：logo + 导航换行） | 51 | **105** |
| `#hero` | 115 | 1409 |
| hero 主 CTA "Download on App Store" | **764** | 50（**bottom=814 > 视口 812，被挤出首屏**） |
| **推广卡** | **1524** | **1015（≈1.25 屏）** |
| `#features` | 2539 | 6030 |

- 公告条 + header 共 **155px 常驻固定（占视口 19%）**，滚动全程不消失，直到点 ×。
- 移动端公告条只显示短文案 + "App Store →" + ×（图标、NEW 胶囊、Learn more 被隐藏，`css/surfenglish-promo.css:174-201`）。
- 首屏可见的唯一"App Store"按钮是 SurfEnglish 的（直达 App Store），WordByWord 自己的 CTA 在折线下方，且它还只是锚点 `#cta`，要再滚到底部点徽章。→ **在 WordByWord 官网上，SurfEnglish 的转化路径比 WordByWord 更短**。
- 附带发现（与推广无关的既有问题）：手机端 header 实高 105px，但 `.nav-spacer` 基线仍是 64px（`css/style.css:145-147`），header 底边（156）覆盖 hero 顶部约 41px（被 hero 的 4rem 上内边距吸收，所以不明显）。推广脚本的 relayout 以 spacer 基线为准，未修正此问题。
- 日文页（`ja-top.html`）实测截图：公告条为「新登場 SurfEnglish — 本物の記事を読んで英語を学ぶ」+「App Store →」+ ×。

### 3.3 非渲染视角

- `WebFetch https://www.word-by-word.app/ja-top.html` → 页面内容**完全不含 "SurfEnglish"**，章节只有 主な機能 / 画面プレビュー / 料金 / よくある質問。[事实]
- `WebSearch "site:word-by-word.app SurfEnglish"` → 无相关命中。[事实，搜索引擎覆盖不全，仅作旁证]

---

## 4. 问题评估

### 4.1 UX 与品牌定位（核心问题）

| # | 问题 | 证据 | 严重度 |
|---|---|---|---|
| U1 | **双重推广、位置过高**：固定公告条 + hero 后整屏推广卡，一页内对同一 App 出现 4 个 CTA（bar 2 + section 2） | §3 实测 | 高 |
| U2 | 固定条常驻占 19%（手机）/14%（桌面）视口，且**每页**都有（含 privacy/support） | §3 | 高 |
| U3 | **把 WordByWord 主 CTA 挤出首屏**（375×812） | 按钮 bottom=814 | 高 |
| U4 | 推广卡插在 hero 和"主要功能"之间，访客须先看完 1~1.25 屏 SurfEnglish 才能看到 WordByWord 功能；渲染后 DOM 中页面第一个 `<h2>` 是 SurfEnglish 的标题 | §3；`:528` | 高 |
| U5 | 视觉层级倒置：深色玻璃卡（新设计语言）比宿主页面（亮蓝 + 默认字体）更精致，暗示"WordByWord 是旧版" | CSS `:211-230` vs `css/style.css:150-155` | 中高 |
| U6 | 两个黑色"Download on the App Store"徽章（WBW `#cta` 与 SurfEnglish 推广卡）外观完全相同，指向不同 App，容易误点 | `index.html:186-189`；`:534` | 中 |
| U7 | **受众错配**：WordByWord 支持 21 种源语言（`WordByWordPrototype/Models/LanguageData.swift`，默认源语言 en-US），访客中有学日/韩/西语的人；SurfEnglish 只服务"学英语"的人。现方案对所有人无条件推送"Learn English"，对英语母语访客（`index.html`/`en-top.html`）几乎无意义 | 代码 | 中 |
| U8 | Chrome 扩展落地页（桌面浏览器扩展）上推 iPhone App；privacy/support（App Store 审核与用户求助入口）上挂他 App 广告条——场景不匹配 | `chrome-extension/index.html:10,22`；`privacy.html:17-19` | 中 |
| U9 | "New/新上线"无过期机制：SurfEnglish 2026-08-18 上架（iTunes lookup `releaseDate`），到 10 月已不"新"；`utm_campaign=surfenglish_launch` 同理 | lookup | 低中 |
| U10 | 关闭只管公告条，7 天后复活；推广卡不可关闭 | `:658` | 低 |
| U11 | **中国大陆不可下载**：cn storefront lookup `resultCount=0`，`apps.apple.com/cn/app/id6787367021` → 404；而 WordByWord 在 cn 可用。`cn-top.html`/`zh-top.html`/`chrome-extension/index.html`（zh-CN）上的"App Store 下载"对大陆用户是死路。原因推测为 App 主类目为 **News**（lookup `primaryGenreName: News`）在大陆需资质 | lookup；404 | 高（对 zh-CN 流量） |

**对用户诉求"不搞错定位"的判断**：现方案在视觉与信息架构上都让 SurfEnglish 成为页面的"第二主角"甚至"第一 CTA"，与"WordByWord 定位不变、只是顺带告知"的目标**不一致**。[推断，基于以上事实]

### 4.2 SEO

| # | 问题 | 证据/说明 |
|---|---|---|
| S1 | **全部为 JS 注入**：不执行 JS 的抓取器（WebFetch 实测；GPTBot/ClaudeBot/PerplexityBot 等 AI 爬虫普遍不渲染 JS；部分 Bing/Yandex/Naver/Baidu 渲染能力有限）看不到任何 SurfEnglish 内容和链接 → 对 GEO/AI 答案中的"WordByWord 开发者 → SurfEnglish"实体关联零贡献 | [事实 WebFetch] + [推断 爬虫行为] |
| S2 | Google 渲染后能看到链接，`rel="noopener"` 无 nofollow → 是可跟踪链接；但它们是**全站 25 页模板化重复**的链接，锚文本为 "App Store"/"Learn more"/"Visit surfenglish.app" 等泛化词，相关性信号弱 | `:578-581`, `:532-537` |
| S3 | 同一开发者的兄弟产品互链本身合规，**不需要 nofollow**；但"每页多个、相同锚文本、模板位置"的模式价值低于"少量、静态 HTML、上下文相关、描述性锚文本"的链接 | [推断，Google 链接最佳实践] |
| S4 | 渲染后主题稀释：每个 WBW 落地页在 hero 后插入一个 `<h2>` + 98~367 字的"通过阅读学英语"段落，WBW 页面（"任意网页滑动翻译 / 多语言"）的主题焦点被 SurfEnglish 的"英语新闻"主题冲淡；且 1.3 之后两者都主打"逐句翻译在原文下方 + 双击语境释义"，**关键词互相蚕食风险上升**（需 SEO 方案明确两站的关键词归属） | [事实 DOM 顺序] + [推断] |
| S5 | UTM 链接是可跟踪链接，目标页 canonical 已正确去参数（已验证 12 个），权重会归并，风险低；但既然 SurfEnglish 侧无人接收 UTM，现阶段 UTM 只有成本没有收益 | §2.7 |
| S6 | 无结构化数据关联：WBW 页面 0 个 JSON-LD（`grep ld+json index.html ja-top.html` 无结果）；SurfEnglish 已有 `Person @id = https://surfenglish.app/about/#maker`（`src/templates/home.mjs:55`）。WBW 可在 JSON-LD 中引用同一 Person 作为 `creator`，SurfEnglish 的 `SoftwareApplication` 可加 `isBasedOn` → WordByWord，形成双向实体关联 | [事实] + [建议] |
| S7 | **单向关系**：surfenglish.app 源码与线上 About 页均无 "WordByWord"/"word-by-word" 字样 → 两站之间只有 WBW→SE 的（JS）链接，缺少 SE→WBW 的回链与"同一开发者"的事实陈述 | `grep -rn WordByWord src` 无输出；`curl /about/` 无匹配 |

### 4.3 性能

| # | 问题 | 数据 |
|---|---|---|
| P1 | 每页额外 JS 47,056 B（gzip 15,880 B）+ CSS 9,865 B（gzip 2,916 B）；其中 75% 是其它 19 种语言的文案。对比：页面 HTML 本身 11,664 B，主样式 11,955 B → **推广 JS 是页面 HTML 的 4 倍** | §1 |
| P2 | **CLS**：在已缓存场景下脚本在首帧前执行，未观测到 layout-shift（buffered 条目为空）；但在"首帧先于 defer 脚本"（弱网/首访）时，公告条挂载会把 header 与 hero 整体下推。模拟（移除后重新注入脚本，PerformanceObserver 计量）：**1024×768 = 0.048，375×812 = 0.063**（来源节点：`hero`、`HEADER`），单项即吃掉 CLS"良好"阈值 0.1 的一半以上 | 实测 |
| P3 | 推广卡插入 hero 之后，会在挂载时把其后所有内容下推 729/1015px；对 `/#faq` 等深链首屏，Chrome 有 scroll anchoring 可缓解，Safari 行为未验证，可能出现锚点错位 | [推断] |
| P4 | 每次页面加载向 `toolbox.marketingtools.apple.com` 发起第三方请求（徽章 SVG 8.6–10.8 KB）+ 新连接；徽章 `<img>` 只有 `height` 无 `width` | `:534`；curl |
| P5 | 3 张截图约 462 KB，`loading="lazy"`（好），但无 WebP/AVIF/srcset；显示宽度 ≤232px，600px 原图对 2x 屏合理 | `:544-545` |
| P6 | ResizeObserver + resize 监听开销可忽略 | — |

### 4.4 可访问性

| # | 问题 | 说明 |
|---|---|---|
| A1 | `<aside aria-label="SurfEnglish">` 是 `<body>` 第一个子元素，位于 `<header>` 之前；读屏/键盘用户在每页都要先经过 3 个推广控件才到 WordByWord 导航（站点无 skip link） | `:587-588` |
| A2 | 所有链接 `target=_blank`，无"新窗口打开"提示 | WCAG 建议性技术 G201 |
| A3 | 公告条 CTA 文案在多数语言只是 "App Store"，脱离上下文时链接目的不清（宿主是另一个 App 的官网，更易混淆） | `bar.cta` |
| A4 | 关闭按钮 30×30（手机 26×26）：满足 WCAG 2.2 SC 2.5.8 最低 24×24，但低于 Apple HIG 44pt | CSS `:146-149,197-200` |
| A5 | `-webkit-line-clamp: 2` 截断公告条长文案；es/id/fr/pl 等 100+ 字符语言在 640–900px 宽度下可能被截断 | CSS `:84-87` |
| A6 | 正面：关闭按钮有本地化 `aria-label`；`:focus-visible` 描边；RTL 处理；装饰图标 `alt=""`；截图 alt 本地化；对比度估算（`--se-ink-faint` 叠深蓝 ≈ 5:1）达 AA | — |

### 4.5 维护性

| # | 问题 |
|---|---|
| M1 | **文案双源、已漂移**：SurfEnglish 文案真源是 `SurfEnglishWebsite/src/locales/*.json`，promo 手工复制了 08-21 版的 meta.description，09-16 SE 改版后未同步（见 §5） |
| M2 | 与 WBW DOM 强耦合：依赖 `body > header` 为 fixed、`.nav-spacer`、`#hero`、`.wbw-service-notice` 的存在与 z-index 约定；任何 WBW 改版都会使 relayout 逻辑失效 |
| M3 | 25 个 HTML 各自手写引入（`privacy/support` 的引入位置与其它页不同），WBW 无构建系统 → 每次调整都是批量手改 |
| M4 | HTML 字符串拼接 + `innerHTML`，翻译中的 HTML 标签（`<strong>`）需译者保持 |
| M5 | CSS 中 `section[id]` scroll-margin 与 `:root` 变量是全局副作用，移除模块会让 WBW 锚点重新被 header 遮挡 |
| M6 | 提交信息与内容不符（`7a389ba`），回溯困难 |
| 正面 | 单文件开关、README 有完整说明、事件命名清晰、`sitePath`/badge 映射集中可查 |

---

## 5. 文案定位准确性对照（vs `SurfEnglishWebsite/src/locales/en.json`）

**SurfEnglish 当前自我定位（2026-09-16 起，`2899a57 Rebuild site around bilingual reading for 1.3.0`）**：
- `meta.title`（`en.json:6`）："SurfEnglish: Bilingual News — Read English with the Translation Below Every Sentence"
- `meta.appStoreName/Subtitle`（`:11-12`）："SurfEnglish: Bilingual News" / "Read English with Translation"（线上 iTunes lookup US trackName 一致；JP："SurfEnglish：英語ニュース・対訳で学習"；版本 1.3.1，主类目 News）
- `hero.title`（`:24`）："Read English news with the translation directly below every sentence."
- 三大手势（`:122-163`）：右滑逐句翻译在原文下方 / **语言块（chunks）自动高亮** / 双击语境释义 + 发音
- `footer.tagline`（`:363`）："English news, read bilingually."
- zh-Hans：「英语新闻双语对照阅读」「逐句翻译、语言块标注、双击查词」；ja：「英語ニュースを対訳で読む」「チャンク表示」。

**promo 文案的来源**：与 SurfEnglish 2026-08-21 版 `meta.description` 几乎逐字相同（`git show 0520202:src/locales/en.json` → "SurfEnglish turns real articles, X posts and podcasts into daily English practice. Swipe to translate, double-tap to look up words, listen with an on-device AI voice, and play games built from what you read. Free on iPhone."），旧版 title 为 "SurfEnglish App — Learn English by Reading the Web"。[事实]

| promo 表述 | 当前 SE 定位 | 判定 |
|---|---|---|
| tagline "Surf the web, learn English." / 边冲浪，边学英语 | 旧品牌宣言；现为 "English news, read bilingually." | **过时** |
| bar "learn English **faster** by reading real articles" / 更高效地学英语 | SE 官网不做"更快/更高效"的效果承诺 | **无依据的效果承诺**，建议删除 |
| "real articles, **X posts and podcasts**" | 现：真实新闻 + 自定义 RSS；X/播客站点只是浏览器里的"精选入口"（`explore.bullets`）；旧截图底栏的 "X" 已改为 "Browse" | **部分过时/夸大** |
| "Swipe a sentence to translate it in place" | 一致（Swipe right → 原文下方） | 准确，但未点出"译文在原文下方 / 双语对照"这一现核心卖点 |
| "double-tap a word for its meaning in context" | 一致（且现强调带发音） | 准确 |
| "on-device AI voice, works offline" | 一致（Kokoro，12 种英/美音，离线） | 准确 |
| "games built from what you read" | 一致（Sentence Builder、Word Raid） | 准确 |
| "Real articles, graded A1–C1" | 一致（"CEFR-style levels from A1 to C1"） | 准确 |
| "App in 12 languages · Translates into 21 languages" | 一致 | 准确 |
| "Free on iPhone" | 现："Free to start"，每日额度限制；支持 iPhone **和 iPad**，iOS 18+ | 略不严谨（note 中的 "Free to start" 是准确的） |
| — | **language chunks（语言块）**、**bilingual / 双语对照**、**Free Explore 浏览器（任意网站双语阅读）** | **完全缺失**——恰好是 1.3 的核心差异化卖点 |
| eyebrow "From the makers of WordByWord" | 与用户描述一致（SE 基于 WBW 构建） | 准确，且是唯一真正"对 WBW 访客有意义"的桥接信息 |

**关键推断**：SE 1.3 的新定位（逐句译文在原文下方 + 双击语境释义）与 WordByWord 自身核心卖点（`index.html:68-87`：Swipe to Translate, Sentence Alignment / Double Tap … AI Explanation）**高度重叠**。因此新的推荐文案不能只罗列 SE 功能，而必须回答"我已经在用/在看 WordByWord，为什么还要 SurfEnglish"——区分点应为：WBW = 任意网页、21 种源语言（学任何外语）的翻译阅读工具；SE = 专为学英语设计，自带分级英语新闻流（A1–C1）、语言块、游戏化复习、离线 AI 语音。这也是两站 SEO 关键词分工的依据。[推断]

---

## 6. 资产去留清单

### 6.1 保留并复用

| 资产 | 位置 | 复用方式 |
|---|---|---|
| 20 语种 eyebrow "From the makers of WordByWord" | `promo.eyebrow`（去掉 "New ·" 前缀） | 兄弟应用卡片的"关系说明"行 |
| chips 中仍准确的 4 类短语（A1–C1 分级 / 右滑翻译 · 双击查词 / 端侧 AI 语音离线 / 由阅读生成游戏） | `promo.chips` | 差异点列表、对比表行标题 |
| `note`（免费开始 · 12 种界面语言 · 21 种翻译语言） | `promo.note` | 卡片脚注 |
| `store`（本地化 "Download on the App Store"）、`close`、`more`（了解更多） | 各语言 | 按钮/alt/aria 文案 |
| **de/fr/it/nl/pl/ru/tr/uk 8 种语言全部译文** | `:288-439` | SE 官网无这些语言，这是唯一译文资产；新文案翻译时作为术语与语气参考（TM） |
| `sitePath` 映射 | I18N 各语言 | 已验证 12 个目标 200 + canonical 正确，直接沿用 |
| Apple 徽章语言映射（含 hi-in/ar-sa/uk-ua 回落英文的已知事实） | I18N `badge` | 同时用于 **WordByWord 自身** CTA 的本地化徽章（目前全站写死 en-us） |
| GA 事件名 `surfenglish_promo` + 位置 label 命名风格 | `:533,537,579,581,584` | 保持事件名连续，新增 `placement`/曝光事件 |
| `icon-192.png` | `img/surfenglish/` | 兄弟卡片图标（建议改为静态 `<img>`，附 width/height） |
| `word-raid.jpg` | 同上 | 展示 SE 独有能力（游戏化），与 WBW 差异最大的一张 |
| `translate.jpg`（有条件） | 同上 | 若不允许引入新素材，可作唯一"阅读界面"截图；需知悉为旧 UI 且固定显示中文译文 |
| `section[id]{scroll-margin-top}` 思路 | CSS `:28-30` | 移入 WBW 主样式（用实际 header 高度） |
| `rel="noopener"`、RTL 箭头翻转、`focus-visible` 样式 | — | 新组件沿用 |

### 6.2 改造

| 资产 | 改造方向 |
|---|---|
| title / lead / tagline / bar 文案 | 以 SE 1.3 定位重写（bilingual news / 原文下方逐句译文 / 语言块），删除 "faster/更高效"、"X posts and podcasts"、"New"；12 种语言可直接从 `SurfEnglishWebsite/src/locales/*.json` 的 `meta`/`hero`/`gestures` 取材，其余 8 种需新译 |
| alts | 与最终选用截图一致；translate 截图 alt 应注明"中文译文示例" |
| UTM | 改 `utm_campaign` 为常青名（如 `wbw_crosspromo`），加 `utm_content=<placement>`；App Store 链接加 `ct=<placement>`（`pt` 需用户从 App Store Connect 提供 provider token） |
| zh-CN 页面 CTA | 大陆不可下载：zh-CN 页面不放 App Store 直链，或注明"暂未在中国大陆 App Store 提供"，主链指向 `surfenglish.app/zh-hans/` |

### 6.3 废弃

| 资产 | 原因 |
|---|---|
| 固定公告条（HTML/CSS/relayout/ResizeObserver/关闭记忆） | 喧宾夺主、CLS 风险、挤掉 WBW 主 CTA、A11y 顺序问题、与 WBW DOM 强耦合 |
| hero 后的整屏深色推广卡及其 CSS（`--se-*` 主题、三机扇形布局） | 位置与视觉权重不符合"顺带推荐"定位；设计应融入 WBW 新设计系统 |
| JS 注入 + 47 KB 全语言内联 | SEO 不可见、性能浪费；改为构建期/静态 HTML 按页输出 |
| `feed.jpg` | 旧 UI，且与 `translate.jpg` 几乎重复 |
| privacy/support/chrome-extension 页上的推广 | 场景不匹配（求助/合规/桌面扩展页） |
| "New/新上线" 标签与 `surfenglish_launch` 活动名 | 已非新品期 |

---

## 7. 给设计阶段的输入（约束 + 原则 + 待确认）

### 7.1 设计原则（推断，供方案阶段采纳）

1. **主次**：WordByWord 永远是首屏唯一主角；SurfEnglish 不进入首屏、不使用固定/悬浮元素、不出现在 hero 与功能区之间。
2. **以用户收益为切入**：用"如果你主要在学英语…"的条件式引导，并给出与 WBW 的差异（见 §5 关键推断），可做成 FAQ 条目"WordByWord 和 SurfEnglish 有什么区别？"+ 功能页尾部的"兄弟应用"卡片 + 全站 footer "More from the maker" 静态链接。
3. **静态可抓取**：内容与链接写入 HTML（若引入 SurfEnglish 式 `build.mjs` 生成器则在模板层输出），描述性锚文本（如 "SurfEnglish — bilingual English news reader"），每页 1–2 个 follow 链接，不加 nofollow。
4. **按页面/语言差异化**：仅落地页展示卡片；privacy/support 仅 footer 链接；chrome-extension 页仅 footer；zh-CN 处理大陆不可下载。
5. **测量闭环**：曝光事件（IntersectionObserver，`surfenglish_promo_view`）+ 点击事件带 `placement`；App Store `ct`；建议 SurfEnglish 站补一个轻量统计（否则 UTM 无意义）。
6. **实体关联**：WBW JSON-LD 的 `creator` 引用 `https://surfenglish.app/about/#maker`；SurfEnglish About 页与 JSON-LD 增加 "Built on WordByWord" 事实与回链（需改 SurfEnglish 仓库，另立任务）。
7. **关键词分工**：WBW 占"任意网页/多语种 滑动翻译、浏览器翻译、语境词典"；SE 占"英语新闻双语对照、学英语阅读、语言块"；推广文案避免在 WBW 页上重复 WBW 自己的核心关键词去描述 SE。

### 7.2 风险与难点

| 风险 | 说明 |
|---|---|
| 去掉固定条后点击量下降 | 当前最显眼位置带来的点击会减少；需先从 GA4 拉取 `surfenglish_promo` 各 label 的现有基线（仓库无法获取） |
| 截图素材约束 | "不新增素材"若严格执行，只能用旧版 UI 截图；SurfEnglish 仓库已有 1.3.0 截图（`public/images/screenshots/feed-translation.jpg` 等），是否算"新素材"需用户裁定 |
| 8 种语言新文案翻译 | SE 官网无 de/fr/it/nl/pl/ru/tr/uk 文案，新定位文案需重新翻译/审校 |
| 两站关键词互相蚕食 | 1.3 后功能描述高度重叠，需在 SEO 方案中统一 |
| 移除模块的副作用 | 删除 `surfenglish-promo.css` 会同时去掉全局 `scroll-margin-top`，锚点会被 fixed header 遮挡，需在主样式中补上 |

### 7.3 需要用户确认的问题

1. 是否接受完全取消顶部固定公告条（推荐取消）？若要保留"告知"，是否接受仅在首次访问/特定语言、非固定、可永久关闭的轻量形式？
2. SurfEnglish 1.3.0 的现有截图（SurfEnglish 仓库内）能否复制到 WordByWord 站使用，是否违反"不新增素材"？
3. GA4 中 `surfenglish_promo` 现有点击数据（按 label、按语言）是否可提供，作为改版前基线？
4. App Store Connect 的 provider token（`pt`）是否可用于活动链接？
5. SurfEnglish 未上架中国大陆（News 类目）是否为长期状态？zh-CN 页面的推荐策略据此决定。
6. 是否愿意同步修改 SurfEnglish 官网（About 页 + JSON-LD 回链 WordByWord、加统计）？

---

## 8. 证据索引（可复现命令）

- 机制：`/Users/ike/Dev/WordByWord/wordbyword-web/js/surfenglish-promo.js`（CONFIG `:15-26`，FILENAME_LOCALE `:32-54`，I18N `:59-440`，resolveLocale `:458-469`，dismiss `:490-505`，mountSection `:509-555`，mountBar `:559-649`，mount `:651-667`）
- 样式：`/Users/ike/Dev/WordByWord/wordbyword-web/css/surfenglish-promo.css`（全局副作用 `:9-30`，bar `:34-201`，promo `:205-432`）
- 埋点：`/Users/ike/Dev/WordByWord/wordbyword-web/js/analytics.js`
- 引入：`git show 7a389ba -- index.html privacy.html chrome-extension/index.html`
- I18N 完整性：node 解析 I18N 后逐语言比对（结果见 §2.4 表）
- 线上一致性：`curl https://www.word-by-word.app/js/surfenglish-promo.js | diff - js/surfenglish-promo.js`（相同）
- gzip 体积：`curl -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}'` → 15,880 / 2,916
- sitePath 与 canonical：`curl https://surfenglish.app/<path>/?utm_… | grep canonical`（12/12 正确）
- 徽章本地化：`curl …/black/<code> | md5` 对比 en-us
- App Store 可用性：`curl 'https://itunes.apple.com/lookup?id=6787367021&country=cn'` → resultCount 0；`curl -w %{http_code} https://apps.apple.com/cn/app/id6787367021` → 404；WordByWord `id=6741724502&country=cn` → 1
- SE 定位：`/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite/src/locales/en.json`（`:6-12`, `:22-29`, `:122-163`, `:363`）；旧版 `git -C …/SurfEnglishWebsite show 0520202:src/locales/en.json`；改版提交 `2899a57`（2026-09-16）
- SE 无统计/无回链：`curl https://surfenglish.app/ | grep -o 'cloudflareinsights|gtag|plausible'`（空）；`grep -rn WordByWord …/SurfEnglishWebsite/src`（空）
- 线上布局实测：Browser pane 打开 `https://www.word-by-word.app/`，1024×768 与 375×812 下 `getBoundingClientRect()`；CLS 模拟为移除 bar/section 后重新注入脚本并用 `PerformanceObserver({type:'layout-shift'})` 计量
- 非渲染视角：WebFetch `https://www.word-by-word.app/ja-top.html`（无 SurfEnglish）
- WBW 多源语言：`/Users/ike/Dev/WordByWord/WordByWordPrototype/WordByWordPrototype/Models/LanguageData.swift`（21 种语言，`defaultSourceLanguage = "en-US"`）
