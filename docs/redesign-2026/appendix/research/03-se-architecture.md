# 03 · SurfEnglish 官网架构与 SEO 方法拆解（供 WordByWord 重构参考）

> 研究对象：`/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite`（下文简称 SE 站），线上 https://surfenglish.app
> 对照对象：`/Users/ike/Dev/WordByWord/wordbyword-web`（下文简称 WBW 站），线上 https://www.word-by-word.app
> 日期：2026-10-05。标记约定：**【事实】**=已用文件/命令/URL 验证；**【推断】**=基于证据的判断或外部最佳实践，需在设计阶段确认。
> 全程只读；唯一的构建验证是把 SE 源码 rsync 到 scratchpad 后执行 `node build.mjs`（未触碰原仓库）。

---

## 0. TL;DR

1. **【事实】SE 站是一个约 1,600 行（build.mjs 217 + templates 1,273 + main.js 122）的零依赖 Node 生成器**：`src/locales/<code>.json` → `src/templates/*.mjs`（返回 HTML 字符串的纯函数）→ `dist/`。Node v24 下全量构建 0.18s 产出 17 个 HTML；scratchpad 重建与仓库 `dist/` 逐字节一致（唯一差异是 sitemap `lastmod`，因副本无 `.git`）。线上 CSS/JS 指纹（`style.0ddea364f7bf.css` / `main.cf44b1fa24bd.js`）与本地 dist 一致，说明线上就是当前 `cloudflare-deploy` 分支（2899a57，2026-09-16）。
2. **SEO 骨架完整且正确**：每个语言首页自引用 canonical + 12 语言 hreflang 全簇 + x-default；带 hreflang 和 image 扩展的 sitemap；`@graph` 互相引用的 JSON-LD（WebSite / Person / WebPage / SoftwareApplication / FAQPage / Article / AboutPage / BreadcrumbList）；每语言独立 OG 图；所有语言页在每一页的 header+footer 语言菜单中被内链。
3. **关键词方法 = ASO 与 SEO 同源**：每个 locale 的 title / description / keywords 都镜像该 locale 的 App Store 名称/副标题/关键词（提交 2899a57 的 commit message 明说），并且是**母语关键词调研**而非翻译（ja 用「対訳」「スラッシュリーディング」「英語多読」，zh-Hans 用「双语对照」「逐句翻译」「中英对照阅读」，ko 用「영한대역」，es 用「texto paralelo」）。title 结构：`品牌：品类核心词｜功能词1・功能词2・功能词3`；功能区 H3 = “功能关键词 + 收益”；FAQ 问句 = 定义型长尾查询。
4. **可直接搬到 WBW 的是“机制”而非“皮肤/内容”**：build 管线（指纹、git lastmod、sitemap/robots/hreflang、locale 循环）、layout 的 `<head>` SEO 块、JSON-LD 组装方式、about/指南页模式基本可复用；hero `demo.mjs`（SE 1.3.0 Home 界面像素级复刻）、`style.css` 中 ~150 行 demo 样式、`main.js` 中 ~100 行动画循环、全部 locale 文案、Plus/游戏/CEFR 等区块都不适用。视觉上 SE 是“深色玻璃拟态 + 青紫渐变”，直接套用会让 WBW 看起来像 SE 的换皮，也恰恰是用户想摆脱的“千篇一律 AI 官网”风格。
5. **SE 有若干不应照抄的缺陷**：`applicationCategory` 用了 Google 不支持的值（`NewsApplication` / `EducationApplication`，正确是 `EducationalApplication`）；SoftwareApplication 缺少 `aggregateRating/review` 故本就不可能出 App 富结果；FAQ 富结果自 2023-08 起仅限权威政府/健康站点；`og:locale` 值格式错误（`ja`、`zh_Hans`）；拉丁语系 title 84–103 字符过长；图片 1 年 `immutable` 却未加指纹；App Store 徽章文字在所有语言都是英文。
6. **反向互链现状：SE → WBW 为零**。SE 站源码、dist、README/DEPLOY、App Store 元数据、promo 文案中均无 WordByWord 字样；SE iOS 的用户可见本地化字符串也没有（仅代码注释与后端域名 `word-by-word.app` 共享）。当前互链是单向的：WBW → SE，且是 JS 注入（`js/surfenglish-promo.js`），初始 HTML 中没有指向 surfenglish.app 的链接。
7. **对照 WBW 现状的几个硬伤（已验证，直接解释“非英语关键词几乎不命中”）**：WBW 的 20 个非英语页没有任何站内链接指向它们（仅 `chrome-extension/index.html:319` 一处链到 `zh-top.html`），无 hreflang、无 canonical、无 sitemap/robots（线上 404）、无 JSON-LD；20 个非英语页每页 3 张图 404（`img/Screenshot-2/3/4.png` 不存在）；`index.html` 与 `en-top.html`、`cn-top.html` 与 `zh-top.html` 内容重复；裸域 `word-by-word.app` DNS 无 A 记录（无法访问）。

---

## 1. 生成器架构

### 1.1 目录与数据流【事实】

```
build.mjs                         站点配置 SITE / LOCALES / TRANSLATE_LANGS + 构建流程
src/locales/<code>.json ×12       全部文案（en.json 为结构母本；README.md “Editing copy”）
src/templates/
  layout.mjs   145 行  <head> SEO 标签 + header + footer 外壳；导出 esc()、appStoreBadge()
  home.mjs     390 行  语言首页（12 份）+ JSON-LD 图谱；导出 renderDemoBody()
  demo.mjs      84 行  hero：SE 1.3.0 Home feed 的 HTML 复刻
  about.mjs    142 行  /about/（英文）实体事实页
  learn-english-by-reading.mjs 213 行  /learn-english-by-reading/（英文）指南文章
  support.mjs   82 行 / privacy.mjs 189 行  App Store 提交页（英文）
  notfound.mjs  28 行  404.html
src/css/style.css 620 行 / src/js/main.js 122 行
public/  → 原样拷贝（_headers、icons/、images/og-*.png、images/screenshots/*.jpg）
```

流程（`build.mjs:97-217`）：
1. `rmSync(dist)` 清空 → 逐 locale 读 JSON（`:100-115`）。
2. 生成共享 hreflang 串 `alternates`（`:118-120`），组装 `ctx = {site, locales, strings, alternates, localeUrl, translateLangs}`（`:122-123`）。
3. 12 个首页：`homePage({...ctx, locale, t: strings[code]})` → `dist/<path>/index.html`（`:126-131`）。
4. 4 个英文独立页由 `standalonePages` 数组驱动（`:134-168`），每项声明 `path / render / sources（用于 lastmod）/ images（用于 sitemap）`。
5. 404（`:171`）、sitemap.xml（`:174-200`）、robots.txt（`:202-207`）。
6. 拷贝 `public/`、`src/css`、`src/js`，并额外写出带指纹的 CSS/JS（`:210-214`）。

模板全是 `export function xxxPage(ctx) { return \`...\` }` 的模板字符串，无模板引擎、无 npm 依赖（`package.json` 只有 `build`/`serve` 两个脚本，`serve` 用 `npx serve`）。

### 1.2 `SITE` 对象字段（`build.mjs:32-48`）【事实】

| 字段 | 值 | 用途 |
|---|---|---|
| `url` | `https://surfenglish.app` | canonical / hreflang / OG / JSON-LD 的绝对 URL 前缀（apex 为规范主机） |
| `name` | `SurfEnglish` | `og:site_name`、brand aria-label |
| `appStoreUrl` / `appStoreId` | `…/app/id6787367021` / `6787367021` | CTA、JSON-LD `downloadUrl/installUrl/offers.url`；`appStoreId` 存在时输出 `<meta name="apple-itunes-app">`（`layout.mjs:25-27`） |
| `productHuntUrl`、`xUrl` | PH 链接、`https://x.com/JinlongDev` | JSON-LD `sameAs` |
| `makerName` / `makerFullName` | 都是 `Jinlong` | Person 实体、`<meta name="author">`（两字段同值，`alternateName` 冗余） |
| `currentVersion` | `1.3.0` | JSON-LD `softwareVersion`、版本徽章 |
| `launchDate` | `2026-08-21` | 指南页 `datePublished` |
| `supportEmail` | `support@surfenglish.app` | footer / support |
| `ogImage`、`icon` | `/images/og.png`、`/icons/appicon-1024.png` | 默认 OG 图、JSON-LD `image` |
| `stylesheetPath` / `scriptPath` | `/css/style.<sha256前12位>.css` 等 | cache-busting（见 1.5） |

另有 `LOCALES`（`:51-64`，每项 `{code, path, hreflang, native}`）与 `TRANSLATE_LANGS`（`:68-72`，21 个翻译目标语言，注释要求与 App 的 `LearningTargetLanguage.all` 同步）。

### 1.3 路由 / URL 规则【事实】

- `en` → `/`（`path: ''`，同时是 x-default）；其余 → `/<path>/`，path 全小写：`zh-hans`、`zh-hant`、`ja`、`ko`、`es`、`pt-br`、`vi`、`id`、`th`、`hi`、`ar`（`build.mjs:52-63`）。hreflang 用规范大小写（`zh-Hans`、`pt-BR`），URL 用小写——二者分离。
- 独立页：`/about/`、`/learn-english-by-reading/`、`/support/`、`/privacy/`，全部目录式 `index.html` + 尾斜杠。
- `localeUrl(l)` 生成绝对 URL（`build.mjs:74`）；导航内链用站内相对路径（`layout.mjs:29-31`，注释：“absolute URLs stay in SEO tags only”，好处是 preview 部署也能导航）。
- 线上：`/ja` → 308 → `/ja/`（Cloudflare Pages 自动尾斜杠），`https://www.surfenglish.app/ja/` → 301 → apex（`curl -sI` 验证）。
- RTL：`dir` 仅对 `ar` 硬编码（`layout.mjs:24`、`demo.mjs:38`），locale JSON 里的 `meta.dir` 字段实际未被使用。

### 1.4 语言回退机制【事实】

`build.mjs:101-115`：对每个 locale `try` 读取 JSON，并校验 `strings[code].demo` 与 `.gestures` 存在（`:105`，用于拦截旧 schema）；失败则**整份**回退为 `en.json` 并打印警告。注意：
- 回退是**整文件级**，不是逐 key 级。只要文件存在且有 `demo/gestures`，缺失的嵌套 key 会在模板里直接抛错（如 `t.gestures.items.map`），不会回退。
- 回退后仍会在 `/<locale>/` 输出页面，`<html lang>`、hreflang 声明为该语言，但正文是英文——会造成“声明语言 ≠ 实际语言”。WBW 若采用应改成：缺失则**不生成该语言页 + 不进 hreflang/sitemap**，或逐 key 合并回退。【推断】
- 各 locale 结构一致性：抽检 ja / zh-Hans / ar / hi 与 en 的扁平 key 集合，缺失 0、多余 0（node 脚本验证）。en 比其它语言多 26 行，仅因为 `demo.translations` 有 3 条（es / zh-Hans / ja 轮播），其它 locale 只有 1 条（自己的语言）。

### 1.5 cache-busting 指纹【事实】

- `fingerprint(path)` = 文件内容 sha256 前 12 位（`build.mjs:25-28`），写入 `SITE.stylesheetPath/scriptPath`（`:46-47`），layout 引用（`layout.mjs:76`、`:141`）。构建时额外写出指纹文件（`:213-214`）。
- 副作用：`:211-212` 先把整个 `src/css`、`src/js` 拷进 dist，所以 dist 里同时存在 `style.css` 与 `style.0ddea364f7bf.css`（`ls dist/css` 验证），无害但冗余。
- `_headers` 对 `/css/*`、`/js/*` 只给 `max-age=86400`（`public/_headers:13-17`），没有利用指纹设 `immutable`；对 `/images/*`、`/icons/*` 给 `max-age=31536000, immutable`（`:7-11`）**但图片没有指纹**——提交 2899a57 恰好原地替换了 `browser.jpg`、`feed-translation.jpg` 等同名截图，老访客浏览器缓存可能长达一年看到旧图。【事实+推断】
- HTML 由 CF Pages 默认 `cache-control: public, max-age=0, must-revalidate`（线上 `curl -sI https://surfenglish.app/` 验证）。

### 1.6 lastmod / sitemap / robots【事实】

- `lastModified(...paths)`（`build.mjs:77-93`）：工作区有未提交改动 → 用构建日；否则 `git log -1 --format=%cs -- <paths>`；任何异常 → 构建日。首页的 sources = `home.mjs + layout.mjs + locales/<code>.json + build.mjs`（`:184`），独立页 sources 见 `standalonePages[].sources`。因为每页都包含 `build.mjs` 与 `layout.mjs`，改一次 build 配置会让全站 lastmod 一起变（线上 16 条 lastmod 均为 2026-09-16）。
- sitemap（`:174-200`）：命名空间含 `xhtml`（hreflang）与 `image`；12 个首页每条都带完整 13 条 `xhtml:link`（12 语言 + x-default）+ 2 张图（`feed-translation.jpg` + 该语言 OG 图）；独立页只带 `images`。共 16 个 `<url>`（不含 404）。support/privacy 的 `images: []` 会留下空行，无害。
- robots.txt（`:202-207`）：`Allow: /` + `Sitemap:` 绝对 URL。
- 线上 `https://surfenglish.app/sitemap.xml` 与本地 dist 一致（16 条）。

### 1.7 hreflang【事实】

- `<head>` 内：`LOCALES.map(→ <link rel="alternate" hreflang="${l.hreflang}" href="${localeUrl(l)}">)` + `x-default → SITE.url/`（`build.mjs:118-120`），12 个首页共用同一串，每页自引用、互相回链，满足 Google“每个语言版本必须列出自己和所有其它版本”的要求（Google 文档 localized-versions 验证）。
- `zh-Hans` / `zh-Hant` 这类 ISO 15924 脚本子标签被 Google 明确支持（同文档：“zh-Hant: Chinese (Traditional) / zh-Hans: Chinese (Simplified)”）。
- 英文独立页只输出 `hreflang="en"` 自引用（如 `about.mjs:136`），不参与首页簇。
- 同时在 sitemap 中重复声明（双保险）。
- `og:locale` / `og:locale:alternate` 由 `hreflang.replace('-', '_')` 生成（`layout.mjs:62-63`），得到 `ja`、`zh_Hans`、`ko` 等——不符合 OG 的 `ll_CC` 格式（应为 `ja_JP`、`zh_CN`、`zh_TW`、`ko_KR`）。`dist/ja/index.html` 中可见 `og:locale content="ja"`、`alternate content="zh_Hans"`。WBW 不要照抄。

### 1.8 JSON-LD 图谱【事实】

全部用 `@graph` + 稳定 `@id` 互相引用，跨页复用同一实体 ID：

| 实体 | `@id` | 出现页面 | 字段 |
|---|---|---|---|
| WebSite | `https://surfenglish.app/#website` | 12 个首页 | `url, name, description(本地化), inLanguage(12 语言数组)`（`home.mjs:61-68`） |
| Person（作者/开发者） | `https://surfenglish.app/about/#maker` | 首页、about、指南 | `name, alternateName, url(/about/), sameAs[X]`；about 页另加 `description`（`about.mjs:26-34`） |
| WebPage | `<localeUrl>#webpage` | 首页 | `url, name(=meta.title), description, keywords, isPartOf→WebSite, mainEntity→App, inLanguage`（`home.mjs:77-87`） |
| SoftwareApplication | `https://surfenglish.app/#app`（所有语言共用一个） | 首页（全量）、about（中量）、指南（精简） | 首页：`name, alternateName[本地化 App Store 名, 'SurfEnglish App'], slogan(=App Store 副标题), operatingSystem('iOS 18.0 or later'), softwareVersion, releaseNotes(本版更新项拼接), applicationCategory['NewsApplication','EducationApplication'], description, url, downloadUrl, installUrl, image, screenshot[5], creator→Person, sameAs[AppStore, ProductHunt], offers{Offer, price '0.00', USD, InStock, url, description}, isAccessibleForFree, availableLanguage[12], featureList[手势标题×3 + explore/feed/voice/games 标题去 [[ ]]], mainEntityOfPage→WebPage`（`home.mjs:88-130`） |
| FAQPage | `<localeUrl>#faq` | 首页 | `isPartOf→WebPage, mainEntity[Question{name, acceptedAnswer{Answer,text}}]`，数据即页面可见 FAQ（`home.mjs:131-140`） |
| AboutPage | `/about/#webpage` | about | `url, name, description, mainEntity→App, author→Person, inLanguage`（`about.mjs:16-25`） |
| Article | `/learn-english-by-reading/#article` | 指南 | `headline, description, url, mainEntityOfPage, image[3 张截图], datePublished(=SITE.launchDate), dateModified('2026-09-16' 硬编码), author/publisher→Person, about→App, inLanguage`（`learn-english-by-reading.mjs:37-55`） |
| BreadcrumbList | 无 `@id` | 指南 | Home → 本页（`:75-81`）；about 页有可见面包屑（`about.mjs:75`）但没有对应 JSON-LD |
| FAQPage | `/learn-english-by-reading/#faq` | 指南 | 4 个“如何通过阅读学英语”问答（`:15-32`, `:82-90`） |
| FAQPage（独立，无 @graph/@id） | — | support | 首页 10 问 + 5 个支持问答（`support.mjs:11-43`）——与首页 FAQ 重复标注同一批问答 |

外部规则核对（WebFetch/curl Google 官方文档）：
- **SoftwareApplication 富结果**必需 `name`、`offers.price`，且**必须**有 `aggregateRating` 或 `review` 之一；SE 两者都没有 → 不会出 App 富结果，JSON-LD 的价值主要在实体理解/AI 检索。【事实】
- Google 支持的 `applicationCategory` 列表中有 `EducationalApplication`、`ReferenceApplication`、`BrowserApplication` 等，**没有** `NewsApplication`、`EducationApplication`。【事实】
- Google review snippet 指南：“Don't aggregate reviews or ratings from other websites.” → 不能把 App Store 评分搬进 `aggregateRating`。【事实】因此 WBW 同样拿不到 App 富结果，应把 JSON-LD 定位为“实体消歧 + AI/生成式搜索可读性”。【推断】
- FAQ 富结果：Google 2023-08-08 公告“FAQ rich results will only be shown for well-known, authoritative government and health websites”。【事实】FAQPage 对 SE/WBW 不产生 SERP 展示，但问答文本本身仍是可被检索的长尾内容。【推断】

### 1.9 `<head>` 与 OG（`layout.mjs:37-79`）【事实】

`title`、`description`、`keywords`、`author`、`robots: index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1`、`canonical`、`rel=author → /about/`、hreflang 串、Smart App Banner、OG（type/site_name/title/description/url/image/secure_url/type/width 1200/height 630/alt/locale/locale:alternate、article:published/modified_time 可选）、Twitter（summary_large_image、creator @JinlongDev）、`theme-color #070B18`、favicon 196、apple-touch-icon、可选 preload、CSS、`<noscript>` 让 `.reveal` 可见、JSON-LD。

- 每语言 OG 图：存在 `public/images/og-<code>.png` 就自动使用（`build.mjs:106-109`），12 张均为 1200×630（`sips` 验证）。仓库内没有生成 OG 图的脚本（`scripts/` 只有 `update_app_store_metadata.py`），即 OG 图是仓库外制作的素材。【事实】
- `<meta name="keywords">` 被 Google 忽略，SE 仍逐语言填写（成本低，Bing/Naver/百度等可能参考）。【推断】

### 1.10 /about/ 的 SEO 作用（`about.mjs`）

- **实体事实页（entity home）**：给搜索引擎与 LLM 一个第一方、可引用的“产品是什么/谁做的”页面——`AboutPage` + `Person#maker` + `SoftwareApplication#app`，正文首句即定义句（“SurfEnglish is a bilingual news reader for iPhone.”，`:78`），含**产品事实表**（平台、分类、免费/订阅、界面 12 语言、翻译 21 语言、是否需账号、广告政策、版本，`:60-71`）、“Who made SurfEnglish?”（`:114-116`，`rel="me"` 指向 X）、官方链接列表（`:118-125`）。
- 所有页面 `<link rel="author" href="/about/">`、footer “SurfEnglish by Jinlong → /about/”（`layout.mjs:48`、`:135`）都指向它，Person `@id` 也落在 `/about/#maker`。提交 0520202 的标题就是“Improve SEO and **generative search discoverability**”。【事实】
- 这是 WBW 最适合**自然提及 SE** 的位置：同一 Person 实体下的“Other apps by the same developer”。【推断】

### 1.11 /learn-english-by-reading/ 的 SEO 作用

- **信息型查询入口**：瞄准“learn English by reading / bilingual reading / parallel text”等非品牌长尾（keywords，`:202`），title 为问题式“How to Learn English by Reading the News Bilingually — SurfEnglish”（`:200`）。
- 结构：定义型导语（加粗首句可被摘要引用）→ 署名与更新日期（E-E-A-T，`:104`）→ 6 步“15 分钟例程”有序列表 → 截图 figure（带描述性 alt/figcaption）→ “双语阅读 vs 整页翻译”对比 → 痛点 → 该存/该跳过两栏 → 适用人群 → 4 问 FAQ → CTA。
- `ogType: 'article'` + `article:published_time/modified_time`（`:207-209`）。
- 依赖首页数据：`import { renderDemoBody } from './home.mjs'`（`:4`），复用 `t.demo` 例句与 `t.bilingual` 标签（`:94-96, :129-140`）——WBW 复用时需切断。
- 只有英文版；非英语用户只能通过 12 个首页获得关键词覆盖——**SE 的非英语长尾覆盖本身也很薄**（每语言 1 个 URL）。【事实+推断】

### 1.12 FAQ 结构化数据

- 首页 FAQ 来源 `t.faq.items`（en 10 问，`en.json:311-356`），可见 `<details>` 与 JSON-LD 用同一数据，保证一致（`home.mjs:131-140` / `:354-364`）。
- 问句即用户查询句式：“What are language chunks?”“Does double-tap lookup include pronunciation?”“Can I read any website bilingually?”“Is SurfEnglish free?”“Does it work offline?”——每条都是一个功能关键词的定义/资格问题。ja/zh 同构（ja.json:290-302 等）。
- 富结果层面已无收益（见 1.8），但对 AI 摘要/“People also ask”类抽取仍有价值。【推断】

### 1.13 SE 中不应照抄的问题清单【事实】

| # | 问题 | 位置 |
|---|---|---|
| 1 | `applicationCategory` 用了 Google 不支持的值 | `home.mjs:97`、`about.mjs:41`、`learn-…mjs:69` |
| 2 | `og:locale` 格式错误（`ja`、`zh_Hans`） | `layout.mjs:62-63` |
| 3 | 拉丁语系 title 过长：en 84、es 94、pt-BR 92、vi 103、id 98 字符；description 250+（node 统计）。品牌+App Store 名放最前，被 SERP 截断时丢的是功能词 | `src/locales/*.json` meta |
| 4 | 图片 1 年 immutable 但无指纹 | `public/_headers:7-11` |
| 5 | App Store 徽章文字所有语言均英文 `'Download on the','App Store'` | `home.mjs:188,371`、`about.mjs:82`、`learn-…mjs:108` |
| 6 | 404 canonical 指向 `/404.html` 且 robots=index | `notfound.mjs:22`、`layout.mjs:46` |
| 7 | 整文件回退导致“声明语言≠正文语言” | `build.mjs:110-114` |
| 8 | WebSite 实体同一 `@id` 在不同语言页给出不同 description | `home.mjs:61-68` |
| 9 | 多个 H2 是无关键词的口号（“Questions, answered.”“A natural voice that lives on your iPhone.”） | `dist/index.html` H2 列表 |
| 10 | about 页可见面包屑无 BreadcrumbList；support FAQ 与首页 FAQ 重复标注 | `about.mjs:75`、`support.mjs:11-13` |
| 11 | 站点无任何访问统计（无 gtag/CF beacon），从 WBW 来的 `utm_` 流量在 SE 侧不可测 | `grep` dist/templates 无结果；线上首页无 beacon |
| 12 | `surfenglishwebsite.pages.dev` 可直接 200 访问且无 `X-Robots-Tag: noindex`，仅靠 canonical 指回 apex | `curl -sI` 验证 |

---

## 2. 关键词策略

### 2.1 方法论【事实】

- 提交 2899a57：“Copy and keywords in all 12 locales now mirror the App Store Connect 1.3.0 listing (name, subtitle, keywords, description)”。即 **网站 SEO 与 ASO 用同一套核心词**：`meta.appStoreName`、`meta.appStoreSubtitle` 直接进入 JSON-LD `alternateName`、`slogan`（`home.mjs:92-93`）。
- 核心语义簇（en）：`bilingual news reader` / `read English news with translation` / `sentence by sentence translation` / `translation below the original` / `language chunks` / `contextual dictionary / meaning in context` / `double-tap word meaning` / `learn English by reading news` / `English reading app iPhone`（`en.json:9`）。所有标题、功能名、FAQ 都围绕这一簇改写，没有“Smart Assistant / All-in-one”之类泛词。

### 2.2 title / description 模板（逐 locale 抽样）【事实】

| locale | title | 结构 |
|---|---|---|
| en | `SurfEnglish: Bilingual News — Read English with the Translation Below Every Sentence` | App Store 名 — 价值主张（含核心词） |
| ja | `SurfEnglish：英語ニュースを対訳で読むアプリ｜一文ずつ翻訳・チャンク表示・ダブルタップ辞書` | 品牌：品类词｜功能词×3 |
| zh-Hans | `SurfEnglish：英语新闻双语对照阅读 App｜逐句翻译、语言块标注、双击查词` | 同上 |
| zh-Hant | `SurfEnglish：英文新聞雙語對照閱讀 App｜逐句翻譯、語塊標註、點兩下查字` | 同上，用台湾用语（英文/點兩下/查字） |
| ko | `SurfEnglish: 영어 뉴스 원문·번역 대역 읽기 앱 | 문장별 번역·표현 묶음·두 번 탭 사전` | 同上 |
| es | `SurfEnglish: Inglés y noticias — Lee noticias en inglés con la traducción debajo de cada frase` | 同 en |

description 统一句式：`<品牌> 是 iPhone 上的 <品类核心词>：<动作1→结果（核心词）>；<动作2→结果>；<动作3→结果>。免费。`（zh-Hans `:8`、ja `:8`、en `:8`）——每个功能以“手势 + 功能名 + 收益”的形式写一遍，等于在 description 里把三大功能关键词各出现一次。

### 2.3 正文标题层级的关键词分布【事实】

- **H1**（hero，`home.mjs:184`）= 价值主张 + 品类核心词：en “Read English news with the [[translation directly below]] every sentence.”；ja “英語ニュースを、[[原文のすぐ下の訳文]]と一緒に読む。”；zh-Hans “读英语新闻，译文就[[紧接在每一句原文下方]]。”。
- **eyebrow**（H1 上方小字）= 品类 + 平台 + 价格：“Bilingual news reader · iPhone · Free to start” / “英語ニュース対訳リーダー · iPhone · 無料で始める”。
- **功能 H3**（三手势，`home.mjs:149`）= “功能关键词 + 收益”，最接近用户要的“用核心关键词介绍功能”：
  - en：`Sentence-by-sentence translation, right below the original` / `Language chunks, highlighted automatically` / `The meaning that fits this sentence — with pronunciation`
  - ja：`一文ずつの対訳を、原文のすぐ下に` / `チャンク（意味のまとまり）を自動でハイライト` / `この文に合った語義を、発音つきで`
  - zh-Hans：`逐句对照翻译，译文紧接在原文下方` / `语言块智能标注，自动完成` / `贴合这句话的释义，附带发音`
  - kicker 写手势：“01 · Swipe right / 02 · One tap / 03 · Double-tap”。
- **H2**（各区块）：部分含关键词（“Any website, [[read bilingually]].” / “任何网站，都能[[双语对照着读]]。”），部分是纯口号（见 1.13 #9）。
- `featureList`（JSON-LD）直接取上述 H3 + 部分 H2 去标记文本（`home.mjs:122-128`），让结构化数据与可见标题一致。

### 2.4 本地化关键词是“调研”而非“翻译”【事实】

| locale | `meta.keywords` 里的本地特有词 |
|---|---|
| ja | 英語ニュース 対訳、日英対訳 リーディング、逐文翻訳、一文ずつ翻訳、原文の下に訳文、文脈辞書、**スラッシュリーディング**、**英語多読** |
| zh-Hans | 英语新闻双语对照、双语阅读app、逐句对照阅读、**中英对照阅读**、中英双语新闻、语言块标注、双击查词、上下文查词、**看新闻学英语** |
| zh-Hant | 同构但用 英文新聞、語塊、點兩下查字、看新聞學英文 |
| ko | 영어 뉴스 원문 번역、**영한대역**、한영대역、대역 읽기 앱、원문 대조 번역、문맥 사전、구문 분석 |
| es | lectura bilingüe、**texto paralelo**、traducción paralela、diccionario contextual、bloques de sentido |

同一功能在不同语言选用了当地学习者的惯用说法（“chunks”→ja 保留外来语「チャンク」并加注「意味のまとまり」；zh-Hans「语言块」；zh-Hant「語塊」；ko「표현 묶음」；es「bloques de sentido」），并在 FAQ 里配一条“什么是 X？”把该术语定义清楚。这正是 WBW 非英语页缺失的部分。

### 2.5 `[[…]]` 高亮关键词机制【事实】

- 文案里用 `[[文本]]` 标记（每个 locale 恰好 5 处：hero / gestures / feed / explore / games 标题，`grep -c '\[\['` 验证）。
- `mk(s)`（`home.mjs:20`）先 `esc()` 再把 `[[x]]` 替换为 `<mark class="kw">x</mark>`；`plain(s)`（`:57`）为 JSON-LD 剥离标记。
- `.kw` 样式（`style.css:81-88`）：去掉默认黄底，用青→紫渐变做 0.14em 底部下划线 + 发光 `text-shadow`，`box-decoration-break: clone` 支持换行——**刻意复用 App 内“语言块下划线”的视觉语言**（CSS 文件头注释：“The page is "annotated" the way the app annotates text”）。
- SEO 层面：`<mark>` 本身无排名作用，真正起作用的是 H1/H2 文本里含核心词；`[[ ]]` 的价值在于让翻译者在每种语言里自行决定“哪段是核心词”，视觉与关键词对齐。【推断】

### 2.6 小结：可迁移到 WBW 的关键词写法【推断】

1. 先定每语言的“品类核心词 + 3–6 个功能核心词”，同时作为 App Store 名/副标题/关键词与网站 title/H1/H3/FAQ 的唯一来源。
2. title：`核心品类词｜功能词… — WordByWord`，拉丁语系 ≤60 字符、CJK ≤30–35 全角字，避免 SE 的过长问题。
3. 每个功能一个“功能关键词 + 收益”的 H2/H3，H2 不写纯口号。
4. FAQ 每个功能术语一条“什么是 X / X 怎么用”。

---

## 3. 设计系统

### 3.1 设计 tokens（`style.css:5-25`）【事实】

- 主色：`--accent #4FD2FF`（青）、`--accent2 #B388FF`（紫）、`--grad: linear-gradient(135deg, accent, accent2)`；强调 `--lens #FF9E64`、`--quote #FF5C8A`（译文左边线色）；文字 `--ink #EAF1FF` + `--ink-soft .66` + `--ink-faint .4`；分隔线 `--hairline .10 / --hairline-strong .16`；玻璃 `--glass .06 / --glass-2 .10`。
- 业务语义色：CEFR `--a1..--c1`（绿→蓝→黄→橙→粉）、语言块 `--ck1..--ck4`。
- 圆角：`--radius 26px`、`--radius-sm 16px`；手机框 54px/43px。
- 背景：`body #04060D` + 固定 `.bg` 层 5 个径向渐变“深海光斑”（`:44-52`）。

### 3.2 字体【事实】

仅系统字体栈（`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, …, "Noto Sans"`，`:23-24`）；demo 内另有含 `PingFang SC/TC`、`Hiragino Sans`、`Apple SD Gothic Neo` 的栈（`:218-219`）。无 webfont、无 Google Fonts（`grep @font-face|fonts.googleapis` 无结果）→ 零字体请求，CJK/泰/印地/阿拉伯走系统字体。字号全部 `clamp()`；标题 `letter-spacing -.02~-.035em`、`text-wrap: balance`，段落 `text-wrap: pretty`；CJK/泰/印地/阿语 eyebrow 降低字距（`:71-72`）。

### 3.3 组件清单【事实】

`.glass`（`backdrop-filter: blur(22px) saturate(180%)`）、粘性玻璃 header（60px）、`<details>` 语言菜单（双列网格，移动端改 fixed）、`.btn`（渐变胶囊）、内联 SVG App Store 徽章 `.asbadge`（`layout.mjs:10-15`，无外部资源）、`.phone` 手机框（渐变描边 + 双层阴影 + 可倾斜 ±2°/上抬）、`.gesture-row`（图文交错 + 图标 glyph）、`.feature-row`、`.compare`（“翻译器 App ✕ vs SurfEnglish ✓”两栏，左栏原文删除线）、`.loop-grid` 三卡、`.check-list`（✓ 列表）、`.chip`（含 CEFR 色）、`.badge/.badge-new`、`.release` 更新卡、`.voice-wave`（28 根渐变条 CSS 动画）、`.games-grid`、`.plus-grid`、FAQ `<details>`（+/– 切换）、footer 三列（品牌 / 产品链接 / 语言网格）、文章页组件（`.breadcrumbs`、`.routine-list` 计数圆点、`.article-media` figure、`.table-wrap` 事实表、`.article-cta`）。

### 3.4 动效【事实】

- `.reveal` 滚动渐入（opacity + translateY 24px，0.7s），IntersectionObserver threshold 0.12（`main.js:5-16`），`<noscript>` 与 `prefers-reduced-motion` 时直接可见（`layout.mjs:77`、`style.css:570-574`）。
- hero demo 状态机（见 3.7）、`voice-wave` 呼吸条、`scroll-behavior: smooth`（reduced-motion 时关闭）。

### 3.5 响应式 / RTL【事实】

- 断点 900px（单列、隐藏主导航、语言菜单 fixed、手机框去倾斜、section padding 110→80）与 560px（隐藏品牌文字、标题缩小、事实表纵排）（`style.css:577-620`）。
- 大量使用逻辑属性（`margin-inline-start`、`inset-inline-end`、`padding-inline-start`、`border-inline-start`），RTL 只需 `dir="rtl"`；仅 FAQ summary 有一条 `[dir="rtl"]` 覆盖（`:493`）。
- demo 使用容器查询：`.phone-hero { container-type: inline-size }` + `--pt: calc(100cqw / 402)`（`:215-217`），在任何宽度按 iPhone 点数等比缩放。

### 3.6 暗色模式【事实】

**仅暗色**，无 `prefers-color-scheme`、无浅色主题（grep 无结果），`theme-color #070B18`。WBW 若要支持浅/深双主题需新写一套 token。

### 3.7 hero `demo.mjs` 的工作方式【事实】

- `renderDemo({t, locale, esc, renderDemoBody})`（`demo.mjs:31-84`）输出一个 `figure.phone.phone-hero.demo.is-static`，内部是 SE 1.3.0 Home feed 的 HTML/CSS 像素复刻（iPhone 17 Pro 402×874pt，所有尺寸 `calc(N * var(--pt))`）：状态栏、问候/标题、话题 tabs、文章卡（来源/时间/话题、英文标题、译文标题、英文摘要、译文正文、缩略图 SVG、CEFR 等级、按钮）、第二张卡、底部 dock；图标与缩略图都是内联 SVG（`I`、`THUMB_CITY`、`THUMB_CAFE`，被 `promo/` 视频管线复用）。
- 文本来自 locale：`t.demo`（英文原文、chunks、查词 word、标签）、`t.demo.ui`（App 内 UI 文案的本地化）、`t.demo.translations[]`（译文；en 有 es/zh-Hans/ja 三条轮播）。原文/译文都是真实 DOM 文本，带 `lang`/`dir="auto"`。
- `renderDemoBody()`（`home.mjs:32-44`）按句切分 → `.sen-N`，对 chunks 做首次出现的字符串替换 → `.ck-1..4`，查词词用 ASCII 词边界正则包 `.wd`。
- 默认 `is-static`：无 JS 或 reduced-motion 时直接呈现“已翻译 + 已标注语言块”的终态（`style.css:338-341`）。
- `main.js:25-122`：进入视口（threshold .25）后移除 `is-static`，按 `is-swiping 1250ms → is-translated 1700 → is-chunked 1500 → is-bubble 2100 → is-lookup 3400 → 复位 1000` 循环；复位时轮换 `demo-data` JSON 中的下一种译文语言；用 `offsetLeft/offsetTop` 把气泡/手势锚定到真实文字位置（`anchor()`/`place()`），resize 与字体加载后重算；`visibilitychange` 时暂停。
- 对 WBW 的意义：这是“用产品自己的 UI 作为 hero，而不是放截图”的做法，视觉辨识度高且是可索引文本；但它**完全依赖 SE 的界面**，WBW 需要另做自己的界面复刻（且需与用户确认“用代码复刻界面”是否算“新增素材”）。【推断】

### 3.8 对“去 AI 模板感”的启示【推断】

- SE 的识别度来自两点：①把产品自身的交互语言（语言块下划线、译文左侧色条、CEFR 色）提炼为站点视觉语汇（`.kw`、`.compare-tr`、chip 色）；②hero 是“活的产品”而非截图拼贴。
- 但 SE 的底色（深色玻璃拟态、青紫渐变、uppercase eyebrow、三卡网格、✓ 列表）本身属于近两年 AI 生成落地页的高频组合。WBW 若直接 fork style.css，会同时产生“像 SE 换皮”（品牌混淆）与“仍然千篇一律”两个问题。建议只复用 token 机制、组件结构、逻辑属性/RTL/reduced-motion 等工程做法，视觉语汇从 WBW 自己的 UI（滑动翻译、逐句对齐、语境解释卡片等）中提炼。

---

## 4. 部署【事实】

- **托管**：Cloudflare Pages 项目 `surfenglishwebsite`，Git 集成连接 GitHub `super-monster/SurfEnglishWebsite`；Production branch `cloudflare-deploy`；Build command `node build.mjs`；Output `dist`；Framework preset None（`DEPLOY.md`）。
- **分支模型**：`main` 日常开发（push 只产生 preview 部署）；发布 = `git push origin main:cloudflare-deploy`。当前 `origin/cloudflare-deploy` = 2899a57（2026-09-16），`main` 领先 1 个提交（7c464b6 promo 管线，站点输出不变）。另有本地分支 `backup/main-before-sync-20260821-b7fcf3b`。
- **备份部署**：`.github/workflows/deploy.yml` 仅 `workflow_dispatch`，Node 22 构建后 `wrangler pages deploy dist --project-name=surfenglishwebsite --branch=cloudflare-deploy`，需 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`；故意手动以免与 Git 集成重复部署（提交 6ea158a）。
- **域名**：`surfenglish.app` 与 `www.surfenglish.app` 都挂在 Pages 项目（CNAME 代理到 `surfenglishwebsite.pages.dev`）；NS 为 Cloudflare（`dig NS` 验证）。**www→apex 在 zone 级 Redirect Rule**（“从 WWW 重定向到根”模板，`https://www.*` → `https://${1}`，301），因为 Pages 的 `_redirects` 不能跨主机（提交 b998792 删除了 `public/_redirects`）。线上 `www.surfenglish.app/ja/` → 301 → `surfenglish.app/ja/` 验证通过。
- **`_headers`**（`public/_headers`）：全站 `X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`Referrer-Policy: strict-origin-when-cross-origin`、`Permissions-Policy: camera=(), microphone=(), geolocation=()`；缓存见 1.5。404 线上返回 `cache-control: no-store`。
- **本地预览**：`npm run serve` 或 `.claude/launch.json`（`npx serve -l 4573 dist`）。

**WBW 的部署现状差异**【事实】：GitHub Pages（`server: GitHub.com`），`CNAME` 文件内容 `www.word-by-word.app`；域名 NS 在 Google Cloud DNS（`ns-cloud-c*.googledomains.com`）；**裸域 `word-by-word.app` 无 A 记录，`curl` 报 “Could not resolve host”**；`/ja-top` 与 `/ja-top.html` 都 200（扩展名可省略 → URL 变体）；`/sitemap.xml`、`/robots.txt` 均 404。

**由此带来的部署决策点**【推断】：
1. 若 WBW 改为构建式站点：(a) 留在 GitHub Pages，用 Actions（`actions/deploy-pages`）构建发布——但 GitHub Pages 不支持 `_headers`、不支持服务器端 301（旧 `*-top.html` 只能用“静态 stub + canonical + meta refresh”），也无法设置缓存头；(b) 迁到 Cloudflare Pages——可用 `_redirects` 做同主机 301（`/ja-top.html → /ja/`）与 `_headers`；不必迁 NS，只需在 Google DNS 把 `www` CNAME 指向 `<project>.pages.dev`；但 **apex→www/或 www→apex 的跨主机重定向在 Google DNS 下无法像 SE 那样用 zone Redirect Rule 实现**，需迁 NS 到 Cloudflare 或保留 GitHub Pages 的 apex 自动跳转机制。CF Pages 对 `.html` 的自动 pretty-URL 308 与 `_redirects` 的优先级需实测。
2. 无论哪种方案，必须保持对外已登记的 URL 可用：App Store Connect 中 WBW 的 support/privacy URL（推断为 `/support.html`、`/privacy.html`）、Chrome Web Store 指向的 `chrome-extension/` 子站、以及 GA4（`G-QS1CJY8YWL`，`index.html:12-18`）埋点。
3. 规范主机：WBW 当前事实上的规范主机是 `www`（与 SE 的 apex 相反），重构时不要改主机，避免额外迁移成本。

---

## 5. 可复用性评估（WBW 照此重构）

### 5.1 逐文件判定

| SE 文件 | 行数 | 判定 | 复用 / 改造要点 | 预估改造量 |
|---|---|---|---|---|
| `build.mjs` | 217 | **改造** | 直接留：`fingerprint`、`lastModified`、locale 循环、hreflang 串、sitemap（xhtml+image）、robots、指纹写出、`standalonePages` 机制。要改：`SITE`（WBW 的 url=`https://www.word-by-word.app`、appStoreId `6741724502`、support 邮箱、无 ProductHunt?）、`LOCALES` 改为 WBW 21 语言、删 `TRANSLATE_LANGS` 或换成 WBW 语言表、删 `demo/gestures` schema 校验（`:105`）、回退改为“缺失则不生成”、新增 `chrome-extension/` 原样拷贝、新增旧 URL 兼容（`_redirects` 或 stub 页生成）、新增“兄弟应用”数据（SE 各语言 URL 映射）、去掉 `cpSync` 冗余未指纹文件 | ~40% 行改动 |
| `layout.mjs` | 145 | **改造** | `<head>` 块（`:37-79`）几乎原样复用（修 `og:locale` 映射、徽章本地化）；新增 GA4 注入；header/footer 品牌、导航锚点（`#reading/#explore/#games/#plus`）重写；footer 增“Also by the developer → SurfEnglish”静态链接位；RTL 改读 `t.meta.dir` | ~45% |
| `home.mjs` | 390 | **部分复用** | 留：`mk()`、`phone()`（需改为按图传 width/height，WBW 截图是 1530×3036 / 1206×2622 / 1024×1024，而 `phone()` 写死 720×1565，`:22-23`）、JSON-LD `@graph` 组装框架（`:53-142`）、layout 调用（`:375-389`）。重写：全部 section（`:175-373`：三手势、compare、feed/CEFR、explore、voice、games、languages、Plus、privacy…）换为 WBW 功能区；JSON-LD 字段替换（operatingSystem、applicationCategory 改合法值、featureList、screenshot、offers），可增加第二个 `SoftwareApplication`（Chrome 扩展，`BrowserApplication`） | ~65–70% |
| `demo.mjs` | 84 | **不适用** | SE 1.3.0 UI 像素复刻，全部 SE 专属；只能借鉴 `--pt` + container query 的缩放手法 | 100%（若做 WBW 版需新写） |
| `about.mjs` | 142 | **模式复用** | 结构（AboutPage + Person + App、定义句、事实表、Who made、Official links）直接用；文案全换；新增“同开发者的其他应用：SurfEnglish”一节 → 最自然的 SE 推荐位 + 实体关联 | 结构 10% / 文案 90% |
| `learn-english-by-reading.mjs` | 213 | **模式复用** | Article + Breadcrumb + FAQ 模板可用；需切断对 `renderDemoBody`、`t.demo`、`t.bilingual` 的依赖（`:4, :94-96, :129-140`）；主题改为 WBW 的信息型查询（如“逐句对照翻译阅读外语”），英语学习者段落可自然引出 SE | 结构 20% / 内容 100% 新写 |
| `support.mjs` / `privacy.mjs` | 82 / 189 | **外壳复用，内容不适用** | WBW 已有英文 `support.html`、`privacy.html`（`<html lang="en">` 验证），把正文迁入模板；注意 URL 必须保持 | 中 |
| `notfound.mjs` | 28 | **直接复用** | 改文案（“Wiped out / Back to shore”是冲浪梗）、去掉 canonical、加 noindex | 小 |
| `style.css` | 620 | **结构复用，视觉重做** | `:212-361`（~150 行）demo 专用 → 删除；其余 ~470 行的组件结构、逻辑属性、断点、reduced-motion 可借鉴；tokens/配色/玻璃/渐变必须换成 WBW 自己的视觉语汇；如需浅色主题需新增 | 视觉 tokens 100%、组件 ~50% |
| `main.js` | 122 | **部分复用** | `:1-23`（reveal + 语言菜单外点关闭）直接用；`:25-122` demo 循环删除 | 小 |
| `public/_headers` | 17 | **视托管而定** | CF Pages 直接用（可把 css/js 改为 immutable）；GitHub Pages 无效 | 小 |
| `.github/workflows/deploy.yml` | 39 | **改造/替换** | CF Pages：改 project 名；GitHub Pages：换成 `actions/upload-pages-artifact` + `deploy-pages` | 小 |
| `package.json`、`.claude/launch.json` | — | **直接复用** | 改名/端口 | 极小 |
| `src/locales/*.json` | ~4.2k 行 | **schema 不适用** | 需按 WBW 功能重新设计 schema（meta/nav/hero/features[]/faq/…/sibling），21 份文案按 2.6 的关键词方法重写——**整个项目中最大的工作量** | 100% |

工程量粗估【推断】：生成器 + layout + 首页/about/指南/支持/隐私/404 模板 + 新 CSS ≈ 4–6 人日（不含文案）；21 语言的关键词调研与文案是独立的大块工作（可先做 en + 若干流量语言，其余分批），远大于工程本身。

### 5.2 必须拿掉或改写的 SE 特有假设

1. **语言集合**：SE 12 种（en、zh-Hans、zh-Hant、ja、ko、es、pt-BR、vi、id、th、hi、ar）；WBW 21 种，多出 de、fr、it、nl、pl、ru、tr、uk，且 WBW 用 `pt`（非 pt-BR）、`cn`/`zh` 两个文件内容完全相同（`diff` 0 行）、`tw`=zh-TW。需定义 WBW 的 code↔path↔hreflang 表与旧文件名映射。
2. **学习目标语言**：SE 只教英语（文案全是 “Read English…/learn English”）；WBW 的定位是多外语（`index.html:7` “boost your reading and listening in foreign languages”）。SE 推荐只对“学英语的人”有意义，推荐文案要条件化（如“如果你在学英语…”）。
3. **SE 在 WBW 8 个额外语言无本地化页**：de/fr/it/nl/pl/ru/tr/uk 只能链到 SE 英文根页（现有 `surfenglish-promo.js:289-422` 已这样做，`sitePath: ''`），文案应诚实说明“App 界面为英文等 12 种，可译成你的语言”（SE 的 `TRANSLATE_LANGS` 含 Français、Deutsch、Italiano、Русский、Türkçe、Polski、Nederlands、Українська，`build.mjs:68-72`）。
4. **平台**：SE 只有 iOS（JSON-LD `operatingSystem: 'iOS 18.0 or later'`、只放 App Store 徽章、Smart Banner）；WBW 还有 Chrome 扩展子站 `chrome-extension/`（`<html lang="zh-CN">`，有独立 privacy），需要多产品/多平台的实体与 CTA 设计。
5. **hero demo 依赖 SE UI 与 402×874pt 测量值**（`demo.mjs:1-2`），以及 `t.demo`/`t.demo.ui` 的 schema。
6. **业务区块**：Plus 订阅、CEFR 分级、游戏（Word Raid/Sentence Builder）、Kokoro 语音、Free Explore 浏览器、1.3.0 release 卡，均为 SE 专属。
7. **英文独立页取 `locales[0]` / `strings.en`**（about/指南/support/privacy/404 各 2 处）。
8. **单品牌外壳**：header/footer 写死 `SurfEnglish` 字样与 app 图标（`layout.mjs:86-87, :115-116, :135`）。
9. **暗色单主题**、截图固定 720×1565、App Store 徽章英文文案。
10. **无站点统计**：WBW 有 GA4 + `js/analytics.js`，新 layout 需保留。
11. **规范主机**：SE 用 apex，WBW 用 www（`CNAME`）。

### 5.3 素材约束下的注意点【事实+推断】

- WBW 现有素材重复度高：`img/` 根目录 7 个文件 md5 相同（`Screenshot-1.png` 与 6 个 `feature_*_demo.png`，1530×3036、各 1.69MB）；`img/en/feature_context_demo.png` 与 `feature_doubletap_demo.png` 相同。非英语页每页引用的 `img/Screenshot-2/3/4.png` 不存在（线上 404）。实际可用的独立截图约为 `img/en/` 下 7 张 + 6 张 1024×1024 的 `feature_*.png` 插画 + `img/surfenglish/` 下 3 张 SE 截图（600×1304）。【事实】
- SE 的 OG 图是 12 张专门制作的 1200×630 图；在“不新增素材”约束下，WBW 的 OG 图要么复用现有图（尺寸不合规），要么由现有截图程序化合成——需要用户确认合成图算不算“新增素材”。【推断】
- 截图体积大（1.2–1.75MB PNG），SE 的做法是 720 宽 JPEG（100–270KB）。对既有素材做压缩/转码不改变内容，建议列入范围。【推断】

---

## 6. 反向互链现状（SE → WBW）

【事实】
- SE 网站：`grep -ri "WordByWord|word-by-word|word by word"` 于 `src/`、`build.mjs`、`README.md`、`DEPLOY.md`、`public/_headers`、`appstore-metadata/`、`promo/*.json`、`dist/` —— **0 处**。about 页的 Person 实体、Official links、footer 均无 WBW。
- SE App Store 元数据（`appstore-metadata/v1.1.0.toml`）：无 WBW 字样。
- SE iOS 用户可见字符串（`SurfEnglish-iOS/SurfEnglish-iOS/Localization/*.lproj`）：无；仅 `Localization/LearningTargetLanguage.swift:5` 注释“与 WordByWord 引擎一致”，以及代码中共享后端 `WBWAPIConfig.swift:17`（`https://backend-test.word-by-word.app`）、`QuickContextMeaning.swift:226-227` 注释中的 `api.word-by-word.app`——证明两产品同源同后端，但对用户/搜索引擎不可见。
- WBW → SE：仅有 `js/surfenglish-promo.js`（668 行）+ `css/surfenglish-promo.css`（438 行）运行时注入的顶部条与 hero 后区块（`CONFIG.enabled: true`，`:16-26`）。初始 HTML 里 `href` 只有 App Store、privacy、support（`grep href index.html` 验证），不含 surfenglish.app；链接带 `utm_source=word-by-word.app&utm_medium=referral&utm_campaign=surfenglish_launch`，但 SE 侧无统计脚本可接收。App Store 链接未带 `ct`/`pt` 活动参数。

【推断】
- JS 注入的链接对 Google 通常可见（会渲染 JS），但对很多其他爬虫/AI 抓取器不可见，且“New / 新上线”措辞随时间过期；推广文案（“Surf the web, learn English”“X posts and podcasts”）也与 SE 1.3.0 官网的“bilingual news reader”定位已有漂移。
- 建议的互链形态：WBW 侧用**静态 HTML**、按语言映射到 SE 对应 locale URL（映射表可直接沿用 promo.js 的 `sitePath`）、使用描述性锚文本（该语言的 SE 核心词，如「英語ニュースを対訳で読む SurfEnglish」）；SE 侧在 `/about/` 增加“Also by Jinlong: WordByWord”反链，并在两站 JSON-LD 中让两个 `SoftwareApplication` 共享同一个 `creator` Person `@id`（可统一用 `https://surfenglish.app/about/#maker` 或在 WBW 建对应实体并互相 `sameAs`），形成跨站实体关联。同一所有者站点间的适度编辑性互链无需 nofollow；避免全站堆砌多处链接。App Store 链接改用 App Store Connect 活动链接（`pt`+`ct`）以便归因。

---

## 7. 附：与 WBW 现状的关键对照（均已验证）

| 维度 | SE | WBW（当前） |
|---|---|---|
| 生成方式 | `node build.mjs` 生成，文案在 JSON | 21 个手写 HTML，文案散落在各文件 |
| 语言 URL | `/`、`/ja/`… 目录式 | `/ja-top.html` 等；`index.html` ≈ `en-top.html`（去空白后仅差 1 行注释），`cn-top.html` = `zh-top.html` |
| 语言页被内链 | 每页 header+footer 语言菜单链接全部 12 页 | 根目录所有 HTML 都不链接 `*-top.html`；全站仅 `chrome-extension/index.html:319` 链到 `zh-top.html` |
| canonical / hreflang | 全部有 | 0（`grep -c hreflang` = 0，无 canonical） |
| sitemap / robots | 有 | 线上均 404 |
| JSON-LD | 完整 `@graph` | 0 |
| title | 关键词驱动（见 2.2） | 泛化品牌句：“WordByWord - Your Smart Language Learning Assistant”/“外国語学習翻訳アシスタント”/“外语学习翻译助手” |
| 图片 | 720 宽 JPEG、懒加载、显式宽高 | 1.2–1.7MB PNG；非英语页 3 张 404 |
| 主机 | apex + www 301 | www 可用；apex 无法解析 |

这组事实足以解释“自然流量几乎只命中品牌词、非英语几乎不命中”：非英语页既不可发现（无内链/无 sitemap/无 hreflang），标题也不含任何当地功能关键词，且与英文页之间没有语言关系声明。【推断，但证据链完整】

---

## 8. 给设计阶段的可直接引用结论

1. 采用 SE 的**生成器 + locale JSON + 模板**架构是对的，可 fork `build.mjs`/`layout.mjs` 并按 5.1 改造；`demo.mjs`、SE 视觉 tokens、SE 文案不复用。
2. 关键词方法按 2.6 执行；修掉 1.13 中的 12 个问题，不要把 SE 的错误一起复制。
3. URL 迁移（`*-top.html` → `/xx/`）是最大技术风险：涉及托管选择（GitHub Pages 无 301/无 headers vs Cloudflare Pages 需改 DNS）、旧 URL 排名继承、App Store/Chrome Web Store 已登记 URL；另一选项是**保留现有文件名**、只补 canonical/hreflang/sitemap/内链与文案（风险最低，收益可能已覆盖大头）。两案需在设计文档中并列评估。
4. SE 推荐位优先级：about 页“同开发者应用”区块（实体关联）> 首页内一个与 WBW 功能叙事衔接的静态区块（只对英语学习者措辞）> footer 一条兄弟应用链接；去掉 JS 注入与“New”措辞；同步在 SE `/about/` 加反链。
5. SE 自身的 SEO 方法“技术上完整”，但上线仅约 2.5 个月（2026-07-25 起），流量效果尚无数据证明；WBW 重构应在 Search Console 中按语言/查询类型设对照指标，而非默认 SE 做法必然更优。
