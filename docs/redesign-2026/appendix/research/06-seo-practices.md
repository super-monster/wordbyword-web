# 06 · SEO/GEO 最佳实践研究：独立开发者的多语言 iOS App 官网（截至 2026-10-05）

> 研究对象：WordByWord 官网（https://www.word-by-word.app ，GitHub Pages 静态站）重构。参照对象：SurfEnglish 官网（/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite）。
> 方法：WebSearch/WebFetch 拉取 Google Search Central、Apple、Bing、GitHub、Cloudflare、OpenAI 官方文档（记录各页 "Last updated"），辅以行业研究；用 curl/grep/dig 对线上站点和仓库做事实核对。
>
> 来源标记：
> - 【官方】厂商文档或官方博客（Google / Apple / Microsoft / GitHub / Cloudflare / OpenAI）
> - 【官方人员】Google/Bing 员工的公开表态（非文档，权重次于文档）
> - 【行业研究】有方法论的数据研究（Ahrefs、Pew、Princeton、Vercel 等）
> - 【行业经验】从业者共识，没有对照实验
> - 【推断】本报告根据以上来源得出的推论，落地前需要验证
> - 【已验证】本次在仓库或线上实测得到的事实（附命令或 文件:行号）

---

## 0. 结论速览（可直接作为设计文档的"原则"章节）

1. **最大的问题在架构，不在关键词。** 【已验证】`index.html` 里的 `<a href>` 只指向 css、favicon、App Store、privacy、support（见 §0.1 F3）。20 个语言页没有任何站内链接，也没有 hreflang、canonical 和 sitemap，基本是孤立页面。【推断】这很可能是"英语以外几乎没有命中"的首要原因，可以在 GSC 的"网页索引 → 已发现，尚未编入索引"和 URL Inspection 中核实。Google 原文是"Every page you care about should have a link from at least one other page on your site"（【官方】links-crawlable，2025-12-10）。
2. **hreflang、自引用 canonical、sitemap、语言切换器四件套必须一起上线，成本最低、收益最大。** 光改 URL 结构不会带来排名，Google 说 URL 里的关键词 "hardly any effect"（【官方】SEO Starter Guide，2025-12-10）。
3. **URL 迁移可以做，但应与托管迁移一起评估。** GitHub Pages 不能发 301，只能用 `meta refresh 0`。Google 把它当作永久重定向，但这在官方的推荐顺序里排第二（【官方】Redirects，2026-04-14）。如果要换成 `/ja/` 这类子目录，推荐迁到 Cloudflare（Pages 或 Workers，用 `_redirects` 发真 301），或者至少在 GitHub Pages 前面加 Cloudflare 代理，用 Bulk Redirects。WordByWord 目前流量很小（28 天 71 次点击，见 `00-gsc-baseline.md`），迁移风险的绝对代价低。
4. **关键词要按语言做本地化，并按"功能 + 场景"组织，但不能做 语言×功能×场景 的批量模板页。** Google 的 scaled content abuse 和 doorway abuse 政策明确点名了"automated transformations like … translating"和"pages targeted at specific regions … that funnel users"（【官方】Spam policies，2026-08-28）。
5. **GEO 没有特殊配方。** Google 明确说进入 AI Overviews/AI Mode 不需要 llms.txt、特殊 schema 或分块写法（【官方】AI optimization guide，2026-07-10；2026-06-15 补充 llms.txt 说明）。有效的做法是：关键事实以 HTML 文本出现（不放在图片或 JS 里），答案先行，具体可核对。llms.txt 对 Google 无作用，对其他 AI 的作用也没有证据。
6. **结构化数据要降低预期。** FAQ 富结果从 2026-05-07 起不再展示，HowTo 2023 年已移除，sitelinks search box 2024 年已移除，移动端 breadcrumb 2025-01 起不显示。`SoftwareApplication` 富结果必须带评分，而把 App Store 评分搬到自己站上违反"Don't aggregate reviews or ratings from other websites"（【官方】review snippet，2026-09-08）。所以 JSON-LD 的主要价值是实体消歧和站点名称，不是富结果。
7. **姊妹站互链是安全的，前提是规模合理、语义真实。** Mueller 2026-01-14 说同公司品牌站互链"pretty common … no problem … at reasonable scale"（【官方人员】），自家站点不需要 nofollow（【官方】qualify-outbound-links）。真正要避免的是：用 JS 注入链接（AI 爬虫看不到）、全站页脚堆精确关键词锚文本、以及在两个产品之间误用 canonical 或 hreflang。
8. **品牌关联靠同一个 Person 实体。** 两站 JSON-LD 共用同一个 `Person` `@id`（SurfEnglish 已有 `https://surfenglish.app/about/#maker`），各自的 `SoftwareApplication.creator` 都指向它，再加 about 页和 `sameAs`。
9. **图片和 CWV 是现成的低垂果实。** 【已验证】正文截图为 1530×3036 的 PNG，单张 0.7–1.75 MB；图标为 1024×1024 PNG，约 1 MB；没有 width/height，没有 lazy；有 404 图片和重复图片。只做缩放和转码（AVIF/WebP + `<picture>` 回退）不算新增素材，符合用户的约束。
10. **App 官网特有的三件事：** Smart App Banner（只放 WordByWord 自己的 app-id）、带 `pt/ct` 的 App Store 链接（分别衡量 WBW 下载和 SurfEnglish 导流）、本地化的 App Store 徽章（【已验证】Apple 提供 ja-jp、zh-cn 等 SVG）。

### 0.1 与本研究直接相关的现状事实（已验证）

| # | 事实 | 证据 |
|---|---|---|
| F1 | 所有 HTML 都没有 `hreflang`，也没有 `rel=canonical` | `grep -l hreflang *.html` 无输出；`grep -c hreflang ja-top.html` → 0 |
| F2 | 没有 robots.txt 和 sitemap.xml | `curl https://www.word-by-word.app/robots.txt` 与 `/sitemap.xml` 均返回 404 |
| F3 | 首页没有任何链接指向语言页 | `grep -oE 'href="[^"#]+"' index.html` 只有 css/style.css、css/surfenglish-promo.css、favicon.ico、apps.apple.com/app/6741724502、privacy.html、support.html。语言页文件名只出现在 `js/surfenglish-promo.js:33-52`（推广文案的语言映射，不是链接） |
| F4 | 有重复语言页 | `cn-top.html` 与 `zh-top.html` 的 md5 相同（63d6a8cd…），且都是 `lang="zh-CN"`；`en-top.html` 与 `index.html` 都是英语 |
| F5 | 语言页图片 404，且存在重复图片 | `ja-top.html:159-161` 引用 `img/Screenshot-2/3/4.png`，仓库里只有 `img/Screenshot-1.png`。`img/*_demo.png` 7 个文件 md5 相同（5d5463ff…，即 Screenshot-1）。`img/en/feature_context_demo.png` 与 `feature_doubletap_demo.png` md5 相同（3864f897…）。其余语言页推测结构相同，需逐页核实 |
| F6 | 日文页用了英文 App Store 徽章 | `ja-top.html:182` 使用 `…/black/en-us` |
| F7 | HTTP 不跳 HTTPS；裸域无法解析 | `curl -sI http://www.word-by-word.app/` → `200 OK`（未开启 Enforce HTTPS）；`dig +short word-by-word.app A` 为空；NS 是 `ns-cloud-c*.googledomains.com`（不在 Cloudflare） |
| F8 | 同一页面有多个 URL 都返回 200 | `/ja-top` 与 `/ja-top.html`、`/` 与 `/index.html` 均为 200（GitHub Pages 支持无扩展名访问） |
| F9 | 无法自定义响应头 | 响应头为 `server: GitHub.com`、`cache-control: max-age=600`，无法设置 `Content-Language` 或长缓存 |
| F10 | 图片过大，缺少尺寸和懒加载 | `img/en/*_demo.png` 为 1530×3036，0.7–1.75 MB；`img/feature_*.png` 为 1024×1024，0.85–1.1 MB；`index.html`、`ja-top.html` 中 `loading=` 出现 0 次；`<img>` 没有 width/height（如 `index.html:58`） |
| F11 | App Store 链接无归因参数，且无 Smart App Banner | `index.html:186` 为 `https://apps.apple.com/app/6741724502`，无 `pt/ct`，会 301 到 `/us/app/wordbyword-translate/id6741724502`；没有 `apple-itunes-app` meta |
| F12 | SurfEnglish 推广由 JS 注入 | `js/surfenglish-promo.js`（顶部条和 hero 后区块） |
| F13 | SurfEnglish 站可直接复用的实现 | hreflang 表 `build.mjs:52-63`，x-default `build.mjs:120`；JSON-LD `@graph` 见 `src/templates/home.mjs:58-140`（WebSite/Person/WebPage/SoftwareApplication/FAQPage）；`apple-itunes-app` 见 `layout.mjs:26`；LCP 图片 `fetchpriority/eager/width/height` 见 `home.mjs:23`；`public/_headers` 中 images 设为 immutable 一年 |
| F14 | SurfEnglish 有一处 schema 小错，不要照搬 | `home.mjs:97`、`about.mjs:41`、`learn-english-by-reading.mjs:69` 中 `applicationCategory: ['NewsApplication','EducationApplication']` 不在 Google 支持列表内，正确值是 `EducationalApplication`（【官方】software-app，2026-09-08） |

---

## 1. 多语言站点

### 1.1 hreflang 规范要点（【官方】Localized versions，Last updated 2026-09-21）
URL：https://developers.google.com/search/docs/specialty/international/localized-versions

| 规则 | Google 原文要点 | 对 WBW 的含义 |
|---|---|---|
| 三种实现方式等价 | HTML `<link>`、HTTP `Link` header、sitemap `xhtml:link` 三选一即可 | GitHub Pages 不能设 header，用 HTML `<link>`；如果后续用生成器，也可以同时输出 sitemap 版。不建议两种混用，以免维护不一致 |
| 自引用 | "Each language version must list itself as well as all other language versions." | 每个语言页的 `<head>` 都要有完整列表，包括自己 |
| 双向 | "If two pages don't both point to each other, the tags will be ignored." | 必须由生成器统一输出，手工维护 20 个文件极易出错 |
| 绝对 URL | 必须包含协议（`https://`），不能写 `//example.com` | 统一用 `https://www.word-by-word.app/...` |
| 语言码 | ISO 639-1；地区码 ISO 3166-1 Alpha-2；文字码 ISO 15924（`zh-Hans`、`zh-Hant`，可写成 `zh-Hans-US`） | `uk` 是乌克兰语（合法）。不要把它和"英国"混淆，`UK` 作为地区码是非法的（Google 原文点名 `EU`、`UN`、`UK` 无效） |
| x-default | "designed for language selector pages"，也可作为未匹配语言时的回退 | 指向英文首页 `/` |
| 不能合并 link | 2024-06-12 更新："Don't combine link tags … e.g. hreflang with media in a single link" | 每个 alternate 单独写一个 `<link>` |
| 不用于判定语言或 canonical | "Google doesn't use hreflang or the HTML lang attribute to detect the language of a page" | 语言由可见内容判定，所以 title、description、正文、alt 都必须是该语言（见 1.6） |
| 可以跨域 | "Alternate URLs do not need to be in the same domain." | **不要**在 WBW 和 SurfEnglish 之间加 hreflang。它们是不同产品，不是同一内容的不同语言版本 |
| 与 canonical 配合 | 【官方】canonical 文档（2026-07-10）："specify a canonical page in the same language" | 每个语言页 canonical 指向自己，不能都指向英文页 |
| 译文不算重复 | "Localized versions of a page are only considered duplicates if the main content of the page remains untranslated." | 只翻译导航、正文仍是英语的页面会被视为重复 |

【行业经验】hreflang 列表里的 URL 必须是 canonical URL（即 `/ja-top.html` 与 `/ja-top` 二选一，见 F8），否则 Google 会忽略这组 alternate。

### 1.2 WBW 语言码映射建议（【推断】，基于 F4 与 SurfEnglish 的 `build.mjs:52-63`）

| 当前文件 | 当前 `lang` | 建议 hreflang | 处理 |
|---|---|---|---|
| index.html | en | `en` + `x-default` | 英文主页 |
| en-top.html | en | — | 与首页重复：重定向到 `/`（或设 canonical 到 `/`），不进 sitemap |
| cn-top.html / zh-top.html | zh-CN（两者字节相同） | `zh-Hans` | 只保留一个，另一个重定向 |
| tw-top.html | zh-TW | `zh-Hant` | |
| ar-top.html | ar（已有 `dir="rtl"`） | `ar` | 保留 `dir="rtl"` |
| de/es/fr/hi/id/it/ja/ko/nl/pl/ru/th/tr/vi | 同名 | 同名 | |
| pt-top.html | pt | `pt`；如果文案是巴西葡语，可写 `pt-BR` | SurfEnglish 用 `pt-BR`。WBW 若无法确认用语，保守用 `pt` |
| uk-top.html | uk | `uk`（乌克兰语） | |

`zh-Hans/zh-Hant` 与 `zh-CN/zh-TW` 都被 Google 接受（【官方】同上）。选 `zh-Hans/zh-Hant` 的理由：(a) 它表达的是文字而不是地区，能同时覆盖港澳和海外繁体用户；(b) 与 iOS 和 App Store 的本地化标识、SurfEnglish 的 `build.mjs:53-54` 保持一致。【推断】

### 1.3 URL 结构（【官方】Managing multi-regional and multilingual sites，2025-12-10）
URL：https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites

- Google 列出的四种方案：ccTLD、子域、**子目录（gTLD 下 `/de/`，"Low maintenance"）**、URL 参数（`?loc=de`，**"Not recommended"**）。
- WBW 现在的"文件名后缀"（`/ja-top.html`）不在 Google 的表里，但本质上仍是"每种语言一个独立 URL"，hreflang 完全可以工作。Google 只明确反对参数方案和"同一 URL 按访客切换内容"（见 1.4）。【推断】
- Google 说 URL 里的关键词 "have hardly any effect beyond appearing in breadcrumbs"（【官方】SEO Starter Guide，2025-12-10）。因此 `/ja/` 相比 `/ja-top.html`，**收益主要是可读性、可维护性，以及和 SurfEnglish 一致，而不是排名**。【推断】
- 结论：**URL 改造是可选项，不是 SEO 修复的前提。** 是否改见 §2 的方案矩阵。

### 1.4 自动语言跳转的风险
- 【官方】"Avoid automatically redirecting users from one language version of a site to a different language version"；"Don't use IP analysis to adapt your content"（managing-multi-regional-sites，2025-12-10）。
- 【官方】Googlebot 默认从美国 IP 抓取，且 "sends HTTP requests without setting Accept-Language"，因此推荐 "separate locale URL configurations" + hreflang（locale-adaptive pages，2025-12-10）。
- 【已验证】WBW 当前没有基于 `navigator.language` 的跳转（`grep navigator.language js/*.js *.html` 无结果）。**重构后也不要加**。可以接受的替代方案：首页顶部显示一条非阻断的提示条（"このページは日本語でもご覧いただけます →"），只在浏览器语言与页面语言不一致时出现，可关闭，并且是普通 `<a href>`。【推断】Google 认为小横幅不属于侵入式插页（【官方】avoid-intrusive-interstitials，2025-12-10）。

### 1.5 语言切换器
- 【官方】"Consider adding hyperlinks to other language versions of a page"（同 1.3）。切换器本身就是语言页的**站内链接来源**，可以直接修复 F3。
- 【行业经验】（W3C i18n 与本地化厂商的共识）不用国旗表示语言；用该语言的母语名称（日本語、Deutsch、繁體中文）；用 `<a href hreflang lang>` 而不是 `<select onchange>`；切换后跳到**对应页面**的对应语言版本，而不是该语言的首页。
- 设计建议【推断】：页头用紧凑的语言按钮，页脚放一份完整的 20 语言静态链接列表（纯 HTML，保证可抓取）。每个链接带 `lang` 属性，必要时带 `dir`。

### 1.6 翻译质量与 "scaled content"
- 【官方】spam policies（2026-08-28）把 scaled content abuse 定义为以操纵排名为目的、低价值地批量生成页面，例子包括 "automated transformations like synonymizing, translating"（语境是抓取他人内容）和 "Using generative AI tools … to generate many pages without adding value"。
- 【官方】using-gen-ai-content（2026-10-01）："It is critical to manually factcheck and review all AI-generated content"，自动生成的 title、description、结构化数据和 alt 同样适用。
- 【官方人员】Mueller（2019-10-23，SER 转述）：自动翻译"I don't think that would trigger manual actions, but if the translations are bad, then it's bad content in general"；"noindex until reviewed by local users / speakers"。
- 【行业研究】Glenn Gabe（GSQI，2025-05-05，更新于 2025-06-11）：Google 立场已经软化，Reddit 的机器翻译页在法、西等市场大量排名；但前提是原文本身有价值。
- 【官方】标题与正文语言或文字系统不一致时，Google 会改写标题（title-link，2025-12-10）。
- 对 WBW 的操作规则【推断】：
  1. 每个语言页的 `title`、`meta description`、H1、H2、正文、`alt`、按钮、App Store 徽章**全部本地化**（F6 是反例）。
  2. 用 LLM 翻译可以，但要用 iOS App 自己的 `Localizable.xcstrings` 术语表保证术语一致，并且至少由母语者抽检 zh-Hans、zh-Hant、ja、ko 等主力语言。
  3. 无法审校的语言宁可只做首页，不做深层功能页（hreflang 允许部分语言缺席，见 3.2）。
  4. 不要为了"覆盖更多语言"新增没有真实用户的语言。

### 1.7 非 Google 引擎：Bing、Naver、Baidu（对"非英语流量"很关键）
- 【行业研究】StatCounter 2026-09：**日本 Google 59.27% / Bing 31.41% / Yahoo! 7.61%**；**中国 Baidu 46.65% / Bing 21.76% / Google 1.46%**；台湾 Google 79.48% / Yahoo! 11.37% / Bing 8.24%（gs.statcounter.com，实测抓取）。韩国 2026-08 Google 46.6% / Naver 43.71%（第三方转述 StatCounter，移动端 Naver 更高）。
- 【官方人员】Bing 的 Fabrice Canel（2020-09-10）："hreflang is indeed a far weaker signal than content-language at Bing"。所以除了 hreflang，还应输出 `<html lang>` 和 `<meta http-equiv="content-language" content="ja">`（GitHub Pages 不能设 HTTP 头，只能用 meta，见 F9）。
- 【官方】IndexNow（indexnow.org）：在根目录放 key 文件，POST 最多 10,000 个 URL；Bing、Yandex、Naver、Seznam 等参与，**Google 不参与**。静态站可以在部署脚本里调用。
- 【行业经验】Naver 不支持 hreflang，需要在 Naver Search Advisor 手动注册并提交 sitemap（每站一个）；Baidu 对非 ICP、境外托管站点的收录很弱。WBW 在大陆获得自然流量的可行路径主要是 **Bing**（必应中国 21.76%），而不是 Google。【推断】
- 落地建议：Bing Webmaster Tools（可以从 GSC 导入）+ IndexNow + Naver Search Advisor。Bing 2026-02 推出了 AI Performance 报告，可以看 Copilot 引用情况（【官方】blogs.bing.com，2026-02）。

---

## 2. 站点迁移与 URL 变更

### 2.1 Google 对各类重定向的处理（【官方】Redirects and Google Search，2026-04-14）
URL：https://developers.google.com/search/docs/crawling-indexing/301-redirects

| 类型 | Google 的处理 |
|---|---|
| 301 / 308（服务端） | 永久重定向，在结果中显示目标 URL。**首选** |
| `meta refresh` 0 秒 | "Google Search interprets instant meta refresh redirects as permanent redirects"。服务端做不到时的**第一替代** |
| `meta refresh` 大于 0 秒 | 视为临时重定向，源 URL 留在结果中。**不要用** |
| JavaScript `location` | 视为永久，但只在 "can't do server-side or meta refresh" 时使用，因为依赖渲染 |
| crypto redirect（纯链接加说明文字） | 最后手段 |

补充：【官方】canonical 文档（2026-07-10）把强弱排为 redirect（强）、`rel=canonical`（强）、sitemap（弱），并且不要用 robots.txt 做规范化。

### 2.2 URL 变更迁移步骤（【官方】Site move with URL changes，2026-08-20）
- 建立完整的旧到新 URL 映射；更新新页面上的自引用 canonical；**更新 hreflang**；替换全站内链。
- 在 Search Console 中**同时提交新旧 sitemap**，观察旧 sitemap 的已索引数降到 0、新 sitemap 上升。
- 重定向链控制在 3–5 跳以内（Googlebot 最多跟 10 跳）。
- 重定向**至少保留 1 年**。
- Change of Address 工具**只适用于换域名**，同域内改路径用不上（2026-06-17 的更新补充了 www 与非 www 子域变体的说明）。
- 会有暂时的排名波动。中型站需要数周。
- 只换托管、URL 不变（【官方】site-move-no-url-changes，2025-12-10）：提前一周把 DNS TTL 调低；预期 Googlebot 抓取速率先短暂下降、几天内回升；旧托管保留到流量归零。

### 2.3 在 GitHub Pages 上能做什么
- 【已验证/官方】GitHub Pages 没有 `_redirects`，也不能自定义响应头（F9；GitHub Pages limits 文档对此只字未提，社区的通行做法是用插件生成 HTML 跳转页）。
- 【官方】`jekyll-redirect-from` 是 GitHub 生态里的标准做法，它的模板同时使用 `<link rel="canonical">`、`<script>location=…</script>`、`<meta http-equiv="refresh" content="0; url=…">`、`<meta name="robots" content="noindex">`，外加一个可点击链接（github.com/jekyll/jekyll-redirect-from，redirect.html）。
- WBW 建议的跳转桩模板【推断】（在 Google 的推荐基础上，去掉 noindex）：
  ```html
  <!doctype html>
  <html lang="ja"><head><meta charset="utf-8">
  <title>WordByWord（日本語）</title>
  <link rel="canonical" href="https://www.word-by-word.app/ja/">
  <meta http-equiv="refresh" content="0; url=https://www.word-by-word.app/ja/">
  <script>location.replace("https://www.word-by-word.app/ja/"+location.hash)</script>
  </head><body><a href="https://www.word-by-word.app/ja/">日本語版はこちら</a></body></html>
  ```
  不加 noindex 的理由：meta refresh 0 已经是"永久"信号，noindex 是多余的；另外 Google 的 JS SEO 文档说遇到 noindex 可能跳过渲染（javascript-seo-basics，2026-03-04），会让 JS 兜底失效。这一点属于【推断】，jekyll-redirect-from 加 noindex 的做法也被广泛使用且未见问题报告，两者都可以接受。
- 必做的 GitHub Pages 设置（【官方】GitHub Docs）：
  - 勾选 **Enforce HTTPS**（"transparently redirect all HTTP requests to HTTPS"），修复 F7。
  - 给裸域 `word-by-word.app` 加 A 记录 `185.199.108.153 / .109.153 / .110.153 / .111.153`。GitHub 会在 apex 与 www 之间自动跳转（"Setting up a www subdomain alongside an apex domain is recommended"）。

### 2.4 方案矩阵（【推断】，综合 §2.1–2.3 与 Cloudflare 官方文档）

| 方案 | 做法 | 优点 | 缺点 / 风险 |
|---|---|---|---|
| **A. 保持 URL，原地修复** | 继续用 GitHub Pages 和 `xx-top.html`；补 hreflang、canonical、sitemap、robots、切换器；`en-top`、`zh-top` 用 meta refresh 合并 | 零迁移风险；当天见效 | 文件名丑，与 SurfEnglish 不一致；无法设 header 和缓存（F9）；以后迁移还要再折腾一次 |
| **B. GitHub Pages + 子目录 + meta refresh** | 新建 `/ja/index.html` 等；旧 `ja-top.html` 改成跳转桩 | 不换托管；URL 干净 | meta refresh 不是官方首选；跳转桩至少要保留 1 年；仍无法设 header；`/ja-top` 无扩展名变体同样会命中跳转桩（可以接受） |
| **C. 迁到 Cloudflare Pages/Workers + 子目录 + `_redirects` 301** | 复用 SurfEnglish 的 `build.mjs` 模式；`_redirects` 写 `/ja-top.html /ja/ 301`、`/ja-top /ja/ 301`；`_headers` 设长缓存和 `Content-Language` | 真 301；可设 header（缓存、安全头、Content-Language）；与 SurfEnglish 技术栈一致 | DNS 要动（见下）；需要一次部署链路改造；托管和 URL 同时变化，排查波动原因会更难 |
| **D. GitHub Pages 前加 Cloudflare 代理** | NS 迁到 Cloudflare，开代理，用 Bulk Redirects 发 301 | 托管不变也能有真 301 | 多一层；GitHub 证书签发与代理 SSL 模式有兼容坑（【行业经验】）；只是过渡方案 |

Cloudflare 侧的官方事实：
- `_redirects` 支持 301/302/303/307/308 和 200 代理；上限是 2,000 条静态 + 100 条动态；**不支持按 query、国家或语言跳转**（正好避免违反 §1.4）（【官方】Cloudflare Pages redirects，2026-08-25）。
- Workers static assets 原生支持 `_redirects` 和 `_headers`。Pages 支持在非 Cloudflare 托管的 zone 上通过 CNAME 绑定自定义域；**Workers 要求 Cloudflare 托管 NS**（【官方】migrate-from-pages，2026-09-22）。
- Cloudflare 官方博客（2025-04）："you should start with Workers. Cloudflare Pages will continue to be supported, but, going forward, all of our investment … will be dedicated to improving Workers."
- 免费计划：Single Redirects 10 条规则；Bulk Redirects 15 条规则、共 10,000 个 URL（【官方】rules/url-forwarding，2026-08-14）。
- 【已验证】`word-by-word.app` 的 NS 在 `ns-cloud-c*.googledomains.com`，`surfenglish.app` 在 Cloudflare（`vivienne/cartman.ns.cloudflare.com`）。

**建议路径【推断】**：
- 第一阶段：在 GitHub Pages 上执行方案 A 的"必修项"（HTTPS、裸域、hreflang、canonical、sitemap、切换器、修 404 图片、合并重复页），先让语言页被抓取和索引。这一步与 URL 是否改造无关，可以立即上线。
- 第二阶段：如果决定统一用 SurfEnglish 的生成器，把 NS 迁到 Cloudflare（和 SurfEnglish 放在同一账号），用方案 C 一次性完成"换托管 + 子目录 + 301"。理由：流量基数小（`00-gsc-baseline.md`：28 天 71 次点击），波动的绝对损失可控；而 301 和 header 能力是长期收益。
- 如果担心同时变两件事难以归因，可以先做"只换托管、URL 不变"（风险低，见 2.2），2–4 周后再换 URL。
- **必须保护的资产**：品牌词 "wordbyword"（排名 1.6，CTR 31%）对应首页 `/`，首页 URL 不变。

### 2.5 迁移后的检查清单（【官方】汇总）
- GSC：提交新 sitemap，旧 URL 单独做一个临时 sitemap（`sitemap-legacy.xml`）以加速发现重定向；在 URL Inspection 中抽查 `/ja-top.html`，确认"Google 选择的 canonical"是 `/ja/`。
- 每个新 URL：自引用 canonical、完整的 hreflang 组、出现在 sitemap 中、至少有一个站内 `<a href>` 链接。
- 所有旧 URL（含无扩展名变体 `/ja-top`）单跳到达目标，不能出现链式跳转。
- 外链和自有渠道（App Store Connect 的 Marketing URL / Support URL、Chrome 扩展商店页、SurfEnglish 站上的链接、社交资料）改成新 URL。

---

## 3. 关键词与内容

### 3.1 People-first（【官方】Creating helpful content，Last updated 2026-10-01）
- 自检问题：是否提供 original information；作者是否 self-evident（"Who"）；是否披露自动化的使用方式（"How"）；是否主要为了帮助人而不是操纵排名（"Why"）。
- 搜索引擎优先的危险信号："producing lots of content on many different topics in hopes that some of it might perform well"、"using extensive automation to produce content on many topics"。
- 字数不是因素："No, we don't" have a preferred word count。
- 对 WBW 的含义【推断】：每个功能页都要有**只有开发者自己能写出来的东西**，比如具体操作（左滑、双击）、真实截图、适用和不适用的场景、与 SurfEnglish 的分工；不能是空泛的"提升语言学习效率"。

### 3.2 "功能 + 场景 + 语言" 着陆页的边界
- 【官方】Doorway abuse（spam policies，2026-08-28）："Multiple domain names or pages targeted at specific regions or cities that funnel users to one page"；"Substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy"。
- 【官方】Scaled content abuse：同上，见 §1.6。
- 安全边界【推断】：
  - **一个真实功能或一个真实场景对应一个页面。** WBW 现有 6 个功能（滑动翻译、双击查词、AI 发音、语境解析、历史、自定义），每个都有对应的截图和图标素材。建议做**1 个首页 + 最多 4–6 个功能/场景页**，比如"逐句对照阅读""点按查词"，具体名称由关键词研究决定。不要做"WordByWord for Japanese learners / for Korean learners / …"这类只替换名词的页面矩阵。
  - **语言轴只能是翻译轴**：同一个功能页翻译成 N 种语言属于正常的 hreflang 组；但在同一语言下按"目标语言 × 母语"展开 20×20 个页面属于 doorway 风险区。
  - hreflang 组可以不完整：某个功能页只有 en、ja、zh-Hans、zh-Hant、ko 五个版本时，这五页互相声明即可（规则见 §1.1），其他语言不出现在这一组里。
  - 每个功能页都要有可浏览的层级入口（首页功能区和导航都链接到它），不能只靠 sitemap 被发现。

### 3.3 关键词本地化（不是翻译）
- 【官方】SEO Starter Guide："anticipate your readers' search terms"，不同水平的用户用词不同。
- 【行业经验】（Lokalise、POEditor 等本地化与 SEO 指南，2024–2026）直译的关键词往往不是当地用户真正搜索的词。比如德语用户可能直接搜英文术语；日语用户偏好短词，并且常用日语搜索外国产品。
- 对 WBW 的方法【推断】：
  1. 以 iOS App 的 `Localizable.xcstrings` 和 App Store 各语言元数据为起点，因为它们已经是本地化过的功能词。
  2. 每种主力语言用 GSC（上线后）、Google Keyword Planner、Ahrefs/Semrush 免费额度和搜索联想做验证。
  3. 每个功能选 1 个主词和 2–3 个变体，写进 title、H1、首段和 alt。
  4. **示例假设（待验证，不能直接使用）**：zh-Hans 的"划词翻译 / 逐句翻译 / 双语对照阅读 / 生词本"，ja 的"対訳 / 英文 和訳 アプリ / タップ 辞書"，ko 的"단어 사전 앱 / 문장 번역"。
- 品牌词保护：每个语言页的 title 都保留 "WordByWord"（【官方】title-link："Brand concisely … at the beginning or end"）。

### 3.4 主题集群（【行业经验】HubSpot topic cluster 模型）
- 结构是"支柱页 + 子页 + 双向内链"。对一个只有 6 个功能的 App 官网，**首页就是支柱页**，功能页是子页；不需要博客式的大规模集群。【推断】
- WBW 和 SurfEnglish 的主题划分建议：WBW 讲"阅读和听力时的即时翻译与查词"（工具型），SurfEnglish 讲"通过真实内容学英语"（学习型，已有 `learn-english-by-reading` 指南页）。两站的主题集群不重叠，互链时是"相邻主题推荐"，而不是"同一主题的两个答案"，这样可以避免两站互相蚕食同一关键词。【推断】

### 3.5 FAQ
- 【官方】FAQ 富结果从 **2026-05-07 起不再出现**；2026-05-08 文档加入弃用通知；2026-06-15 文档被移除（Search Central updates）。【行业研究】The HOTH（2026-05-21）还报告了 GSC 中 FAQ 报告和 Rich Results Test 支持在 2026-06 移除、API 数据在 2026-08 移除。
- 【官方】AI features：结构化数据要和可见文本一致；Google 没有说 FAQPage 有害。【官方】Bing（2025-10-08）建议用 Q&A 格式和 JSON-LD（含 FAQ）帮助 AI 理解。
- 建议【推断】：保留**可见的** FAQ 区块（价格、隐私、支持的语言、iOS 版本、与 SurfEnglish 的区别），写成问答形式。FAQPage JSON-LD 可以加（对 Bing 等仍可能有用），但**不要为它投入额外工作**，也不要指望 Google 显示富结果。

### 3.6 对比页的风险与边界
- 【官方】Write high quality reviews（2025-12-10）：评测和对比要"Evaluate from a user's perspective"、"Explain what sets something apart from its competitors"、"Cover comparable things … which might be best for certain uses"、讨论优缺点。
- **WordByWord vs SurfEnglish**（同一开发者）是最自然、风险最低的"对比"：做成"选哪个更适合你"的说明区块或页面，明确写出"由同一开发者制作"，按场景推荐（"想在任何 App 或网页里即时翻译 → WordByWord；想通过新闻和内容系统学英语 → SurfEnglish"）。这既是对用户有益的引流，也满足 E-E-A-T 中的透明要求。【推断】
- 与第三方竞品的对比页（比如对比 Google 翻译、DeepL）：只在有第一手测试和截图时才做；不贬低对方，不使用对方商标作为页面主标题。默认不建议做。【推断】

### 3.7 AI Overviews 与生成式搜索（GEO）
**官方立场**
- 【官方】AI features（2025-12-10）："There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary"；"You don't need to create new machine readable files, AI text files, or markup"。适用的仍是常规最佳实践：robots 和 CDN 允许抓取、内链可发现、重要内容以文本形式存在、用图片和视频辅助、结构化数据与可见文本一致、良好的页面体验。
- 【官方】AI optimization guide（2026-07-10）明确否定以下做法：llms.txt 和特殊文件、"break your content into tiny pieces"、"write in a specific way just for generative AI"、刷 inauthentic mentions、过度依赖结构化数据。该指南提到可以用 Search Console 的 Generative AI 表现报告衡量。【行业研究】多家媒体报道该报告于 2026-06-03 开始灰度、2026-08-31 全量，目前只有展示数据，没有点击和查询数据，数据从 2026-05-18 开始。
- 【官方】Google 博客 "Top ways to ensure your content performs well in Google's AI experiences"（2025-05-21）：unique、non-commodity 内容；页面体验；技术可访问性；多模态。
- 【官方】AI 展示控制：`nosnippet`、`data-nosnippet`、`max-snippet`、`noindex`。`Google-Extended` 只影响 Google 其他 AI 系统的训练和 grounding，不影响 Search 和 AI Overviews。

**Bing / Copilot**（【官方】Microsoft，Krishna Madhavan，2025-10-08）
- title、description、H1 是重要信号；用 H2/H3 切分内容；使用列表、Q&A、表格；"Write for intent"；避免 "long walls of text"、装饰性符号（→ ★★★ !!!）、"next-gen" 这类没有依据的说法；不要把关键信息藏在 tab、PDF 或图片里。

**研究数据**
- 【行业研究】Princeton GEO 论文（Aggarwal 等，arXiv 2311.09735，KDD 2024）："GEO can boost visibility by up to 40%"。有效手段包括加引用来源、统计数字、引语；关键词堆砌无效甚至有害。注意这是在研究用生成引擎上的实验，不能直接等同于 Google 的 AI Overviews。
- 【行业研究】Pew（2025-07-22）：出现 AI 摘要时，用户点击普通结果的比例为 8%，没有时为 15%；摘要内来源链接只有约 1% 被点击。
- 【行业研究】Ahrefs：AIO 让第 1 名的 CTR 下降 34.5%（2025-04），更新后为 58%（2026-02，基于 2025-12 数据，30 万关键词）。
- 【行业研究】Vercel（2024-12-17）：GPTBot、ClaudeBot、PerplexityBot **不执行 JavaScript**；AppleBot 和 Googlebot/Gemini 会执行。

**对 WBW 的写法规范【推断】**
1. 每页首段写成一句可被直接引用的定义句（各语言本地化），例如："WordByWord 是一款 iOS 应用：在任何网页或 App 里左滑选中的文字即可逐句对照翻译，双击单词即时查词，并支持 AI 发音与语境解析。"
2. 关键事实（支持多少种语言、免费和 Plus 的区别、iOS 最低版本、价格、隐私做法）以 HTML 文本出现，不能只在截图里。
3. **SurfEnglish 推荐区块改成静态 HTML**（现在由 JS 注入，见 F12），否则 ChatGPT、Claude、Perplexity 的爬虫看不到两款 App 之间的关系。
4. robots.txt 允许 `Googlebot`、`Bingbot`、`OAI-SearchBot`（【官方】OpenAI：屏蔽后"will not be shown in ChatGPT search answers"）。是否屏蔽 `GPTBot`（训练用）属于商业选择，与搜索可见性无关。
5. 衡量：GSC 的 Generative AI 报告、Bing Webmaster Tools 的 AI Performance、GA4 的 referrer（chatgpt.com、perplexity.ai 等）。

### 3.8 llms.txt 的现状
- 【官方】Google 在 2026-06-15 的更新中写明："these files aren't needed for Google Search (and won't negatively or positively impact your visibility or rankings), it's fine if you want to maintain these files"。
- 【行业研究，二手汇总】SE Ranking 分析约 30 万个域名，llms.txt 采用率约 10%，与被 AI 引用之间没有统计关系；Ahrefs 统计的 137,210 个有效 llms.txt 中，2026-05 有 97% 零请求。Mueller 将其类比为 keywords meta，Illyes 表示 Google 不打算采用（据 digitalapplied、nytroseo 等 2026 年汇总，原始数据未逐一核验）。
- 结论【推断】：**不作为 SEO 或 GEO 手段**。如果想做，只作为一个 5 分钟的附加项（列出首页、功能页、about、support 的 Markdown 摘要），不进入关键路径，也不需要为它维护多语言版本。

---

## 4. 结构化数据现状（截至 2026-10）

| 类型 | Google 现状 | 建议 |
|---|---|---|
| `WebSite`（name / alternateName / url） | 【官方】site-names（2025-12-10）："WebSite structured data is most important" 用于站点名称；**只能放在首页**；只支持域名和子域级别，不支持子目录 | 只在 `/` 输出，`name: "WordByWord"`，`alternateName: ["Word by Word", "WordByWord Translate"]`。与 `og:site_name` 和 title 保持一致 |
| `SoftwareApplication` / `MobileApplication` | 【官方】software-app（2026-09-08）：富结果要求 `name`、`offers.price`，**加上** `aggregateRating` 或 `review` 二选一；`applicationCategory` 只接受列表内的值（如 `EducationalApplication`、`UtilitiesApplication`、`ReferenceApplication`） | 输出用于实体理解（`operatingSystem: "iOS"`、`offers.price: "0"`、`downloadUrl`、`sameAs` App Store URL、`screenshot`、`featureList`、`inLanguage`、`creator`）。**不写 aggregateRating**，因为评分来自 App Store，违反下一行的规则，可接受没有星级富结果。修正 F14 |
| 评分 / 评论 | 【官方】review-snippet（2026-09-08）："Ratings must be sourced directly from users"；"Don't aggregate reviews or ratings from other websites"；自我控制评论的 Organization 类没有资格 | 不在 JSON-LD 中放 App Store 评分。页面上可以文字引用"App Store 评分 x.x"并链接过去（纯文本，不加标记）。【推断】 |
| `Organization` | 【官方】organization（2026-09-08）："no required properties"；推荐放在首页或 about 页，不需要每页都放；`logo` 至少 112×112；`sameAs` 可以有多个 | 独立开发者用 `Person` 更真实（SurfEnglish 已经这样做）。如果有工作室名，可以加 `Organization` 并让 `founder` 指向同一个 Person |
| `Person` | 无专门富结果；用于作者和创作者的实体识别 | **两站共用一个 `@id`：`https://surfenglish.app/about/#maker`**（`home.mjs:55`）。WBW 页面可以内联一份相同的 Person 节点（同样的 name、url、sameAs），保证不依赖跨域解析也能工作。【推断】 |
| `FAQPage` | **富结果已停止（2026-05-07）** | 可选，见 §3.5 |
| `HowTo` | **2023-09-14 已移除**（【官方】updates） | 不做 |
| `BreadcrumbList` | 仍在 gallery；【行业研究】2025-01-23 起移动端结果只显示域名，不显示面包屑（Google 宣布，SEL、Slashdot 等报道） | 功能页可以加（桌面端仍有用），优先级低 |
| Sitelinks search box | 2024 年已移除（【官方】updates 2024-11-29） | 不做 |
| 图片偏好 | 【官方】2026-03-02：Google 同时使用 schema.org（`primaryImageOfPage`/`image`）与 `og:image` 选取首选图 | 每页给出本地化的 `og:image`，用现有截图裁切即可 |

WBW 首页 JSON-LD 骨架（【推断】，按 SurfEnglish 的 `@graph` 模式，字段待设计阶段确定）：
```json
{"@context":"https://schema.org","@graph":[
 {"@type":"WebSite","@id":"https://www.word-by-word.app/#website","url":"https://www.word-by-word.app/","name":"WordByWord","alternateName":["Word by Word"],"inLanguage":["en","ja","zh-Hans","zh-Hant","ko","…"],"publisher":{"@id":"https://surfenglish.app/about/#maker"}},
 {"@type":"Person","@id":"https://surfenglish.app/about/#maker","name":"<makerName>","url":"https://surfenglish.app/about/","sameAs":["https://x.com/JinlongDev"]},
 {"@type":"WebPage","@id":"https://www.word-by-word.app/#webpage","url":"https://www.word-by-word.app/","isPartOf":{"@id":"https://www.word-by-word.app/#website"},"mainEntity":{"@id":"https://www.word-by-word.app/#app"},"inLanguage":"en"},
 {"@type":"MobileApplication","@id":"https://www.word-by-word.app/#app","name":"WordByWord","operatingSystem":"iOS","applicationCategory":"EducationalApplication","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"downloadUrl":"https://apps.apple.com/app/id6741724502","sameAs":["https://apps.apple.com/app/id6741724502"],"creator":{"@id":"https://surfenglish.app/about/#maker"}}
]}
```
（两款 App 的兄弟关系用页面可见文本和普通链接表达，靠共同的 `creator` 关联即可。不要用 `isRelatedTo` 这类 Product 专属属性去硬套。）

---

## 5. 姊妹产品交叉推广

### 5.1 政策边界
- 【官方】Link spam（spam policies，2026-08-28）："Excessive link exchanges ('Link to me and I'll link to you') or partner pages exclusively for the sake of cross-linking"。关键词是 *excessive* 和 *exclusively for the sake of cross-linking*。
- 【官方人员】Mueller（Bluesky，SER 2026-01-14 报道）谈同公司品牌站之间建 partner 页互链："This seems pretty common, I don't see a problem with it when done at reasonable scale"。他也提到单一站点整体可能表现更好，但分站"shouldn't cause problems"。
- 【官方】qualify-outbound-links（2025-12-10）：`sponsored` 用于付费链接，`ugc` 用于用户内容，`nofollow` 用于"you'd rather Google not associate your site with"；正常的编辑性链接不需要 rel。【官方】links-crawlable："Use nofollow only when you don't trust the source, and not for every external link."
- 【官方】Site reputation abuse 针对的是**第三方**内容借用站点信誉。同一开发者的自家产品不属于这种情况。

### 5.2 WBW 到 SurfEnglish 的推荐规范【推断】
| 规则 | 理由 |
|---|---|
| 推荐区块写在 HTML 源码里（构建时生成），不用 JS 注入 | AI 爬虫不执行 JS（Vercel 2024-12）；Google 虽然能渲染，但 "not all bots can run JavaScript"（【官方】JS SEO basics，2026-03-04） |
| 普通 follow 链接，不加 nofollow 或 sponsored | 自有产品，非付费（5.1） |
| 控制规模：每页 1 个语义化推荐区块 + 页脚 "From the same developer" 1 个链接 + about/FAQ 中的说明 | 符合 "reasonable scale"，避免全站页脚堆链接 |
| 锚文本用"品牌 + 简短描述"并本地化，例如 "SurfEnglish — 用真实新闻学英语"，同一页面不重复使用精确关键词 | links-crawlable：锚文本应 descriptive，关键词堆砌违规 |
| 链接到 SurfEnglish 对应语言的页面（`https://surfenglish.app/ja/` 等）；WBW 有而 SurfEnglish 没有的语言（de、fr、it、nl、pl、ru、tr、uk）链接到 SurfEnglish 英文页，或该语言用户最可能使用的版本 | SurfEnglish 只有 12 种语言（`build.mjs:52-63`）；对用户有益，不跳到看不懂的页面 |
| **绝不**在两站之间使用 `rel=canonical` 或 `hreflang` | 两者只用于同一内容的不同版本（§1.1） |
| 推荐区块写清楚"为什么"：面向哪类用户、和 WBW 有什么区别、二者可以同时使用 | people-first（§3.1）；对比规范见 §3.6 |
| 顶部公告条：小横幅、可关闭、不遮挡正文；**不做弹窗** | 【官方】avoid-intrusive-interstitials：小横幅可以接受，遮挡内容的 dialog 属于侵入式 |
| Smart App Banner 只放 WBW 的 app-id | 定位不变；meta 语法只支持一个 `app-id`（【官方】Apple） |
| 反向：SurfEnglish 的 about 页和页脚介绍 WBW（"我的另一款 App"），形成双向的品牌关联 | 实体关联；规模同样有限 |

### 5.3 把品牌和权重关联传给新站的手段（按有效性排序，【推断】）
1. **真实的、可抓取的链接**，来自 WBW 中流量最高的页面（首页），而不是只放在深层页面。这是唯一被官方确认会传递信号的方式。
2. **同一个 Person 实体**：两站 JSON-LD 用相同的 `@id`、name、`sameAs`（X 账号）；SurfEnglish 的 about 页（已存在，`about.mjs`）列出两款 App；WBW 新增简短的 about 区块或页面，链接到同一个 about。
3. App Store 侧：两款 App 在同一开发者账号下，App Store 的"同一开发者的更多 App"区块会自动展示（属于 Apple 生态内的关联，与 Web SEO 无关但对转化有效）。
4. 外部资料的 `sameAs` 一致（Product Hunt、X、GitHub 等），App Store Connect 中两款 App 的 Marketing URL 各自指向自己的官网。
5. 不要做的：批量建"vs / alternative" 页互相指；在第三方站点刷提及（【官方】AI optimization guide 明确说 inauthentic mentions 没有帮助）。

### 5.4 引流衡量
- 指向 SurfEnglish 的 App Store 链接加 `ct=wbw-<placement>-<lang>`（如 `wbw-home-promo-ja`，30 字符以内），加上 `pt=<provider token>` 和 `mt=8`（§7.2）。provider token 标识的是开发者账号，两款 App 在同一账号下时共用。
- 站内链接到 surfenglish.app 时，用 GA4 的 outbound 事件区分位置（现有 `js/analytics.js:81-89` 已经在判断 outbound）。不建议在内链 URL 上加 `utm_*`，否则会给 SurfEnglish 制造带参数的重复 URL，需要靠 canonical 兜底。如果一定要加，SurfEnglish 的每页都必须有自引用 canonical（它已经有）。【推断】

---

## 6. 图片 SEO 与 Core Web Vitals

### 6.1 官方要点
- 【官方】CWV 阈值（web.dev/vitals，2024-10-31）：LCP ≤ 2.5 s、INP ≤ 200 ms（2024 年取代 FID）、CLS ≤ 0.1，以第 75 百分位计算，移动端和桌面端分开。
- 【官方】page experience：CWV "used by ranking systems"，但好成绩 "doesn't guarantee … top"；不存在单一的 page experience 信号；相关性优先。
- 【官方】Optimize LCP（web.dev，2020-04-30，更新于 2025-03-31）："The LCP resource should be discoverable from the HTML source"；"Never lazy-load your LCP image"；对可能成为 LCP 的 `<img>` 使用 `fetchpriority="high"`；不要用 CSS 背景图做 LCP；使用 AVIF/WebP、`srcset/sizes`。
- 【官方】Image SEO（2026-03-02）：用 `<img>` 而不是 CSS 背景；支持 BMP、GIF、JPEG、PNG、WebP、SVG、AVIF（AVIF 于 2024-08-30 加入）；`<picture>` 和 `srcset` 必须带回退 `src`；文件名要有描述性；alt 描述准确、不堆关键词；用 `og:image` 或 `primaryImageOfPage` 指定首选图，避免使用"带文字的通用图"。
- 【官方】Lazy-loading：原生 `loading="lazy"` 可以被 Google 处理；不要懒加载首屏内容。

### 6.2 WBW 的具体做法【推断】（只缩放和转码，不新增素材）
| 现状（F5/F10） | 改造 |
|---|---|
| 截图为 1530×3036 PNG，0.7–1.75 MB | 按显示宽度的 2 倍生成（手机框里显示约 300–360 CSS px，生成 720 px 宽，与 SurfEnglish 的 `width="720" height="1565"` 一致），格式 AVIF 加 WebP，`<picture>` 用 JPEG 或 PNG 回退。单张预计 < 100 KB |
| 图标为 1024×1024 PNG，约 1 MB | 生成 2× 显示尺寸（如 128–192 px）的 WebP/PNG，每张应该只有几 KB |
| 无 width/height | 全部补上固有尺寸，防止 CLS |
| 无 lazy | 首屏 hero 截图用 `loading="eager" fetchpriority="high"`，其余用 `loading="lazy"` |
| Screenshot-2/3/4 404；7 张同图；两张 demo 重复 | 删除重复文件；语言页改为引用实际存在的素材。各语言是否有本地化截图，看 `/Users/ike/Dev/WordByWord/Resources`（wbw_en/wbw_jp/wbw_zh）；没有的语言统一用英文截图，alt 写本地化文字 |
| alt 为 "App Interface Example" 之类的泛称 | 本地化、描述性的 alt，例如"在 Safari 中左滑一段英文后显示逐句中文翻译"（不要堆关键词） |
| 文件名 `ChatGPT-feature_swipe.png` | 改为描述性文件名，如 `swipe-translation-icon.webp`。旧图片 URL 在图片搜索中的历史价值很低，可以直接替换 |
| GitHub Pages 缓存只有 600 s（F9） | 迁到 Cloudflare 后用 `_headers` 给 `/img/*` 设 `max-age=31536000, immutable`（参考 SurfEnglish 的 `public/_headers`），文件名带内容 hash 或版本号 |
| 第三方 App Store 徽章走 `tools.applemediaservices.com` | 【已验证】旧域名 301 到 `toolbox.marketingtools.apple.com`，返回 9–11 KB 的 SVG。建议直接用新域名，或下载后自托管，并显式写 width/height，避免一次 301 和布局偏移 |

---

## 7. App 官网特有事项

### 7.1 Smart App Banner（【官方】Apple，Promoting Apps with Smart App Banners）
- 语法：`<meta name="apple-itunes-app" content="app-id=6741724502, app-argument=https://www.word-by-word.app/ja/">`。`app-id` 必填；`app-argument` 可选，作用是在已安装时把 URL 传给 App。
- 行为：只在 iOS Safari 中显示；已安装时按钮显示为 "Open"，未安装时跳转 App Store；用户关闭后不再出现；设备不支持或该地区未上架时不显示；**不能在 frame 中显示，模拟器中也不显示**。
- 【官方】Google 认可它是非侵入式的（"Native app install banners like Safari Smart App Banners"）。
- 归因：【官方】Apple Campaign links 文档写明可以在 Smart App Banner 中加入 campaign token 和 provider token；【行业经验】写法是 `affiliate-data=pt=XXXX&ct=wbw-sab`（来自开发者社区实践，Apple 文档页没有给出完整示例，上线后要在 App Analytics 中验证）。
- 建议：WBW 每页都放，并且只放 WBW 的 app-id（§5.2）。`app-argument` 只在 App 能处理该 URL 时添加，否则省略。

### 7.2 App Store 链接参数（【官方】App Store Connect Analytics → Campaign links）
- 格式：`https://apps.apple.com/app/apple-store/id<APPID>?pt=<provider>&ct=<campaign>&mt=8`。
- `pt` 标识开发者账号，所有 campaign 共用，**必须先在 App Store Connect 生成一次 campaign link 才能拿到**；`ct` 最多 30 个字符（字母数字、空格和常用标点，首尾不能是空格）。
- 数据门槛：活动开始至少 24 小时，且至少 5 次首次下载；点击后 24 小时内的首次下载计入；多次点击时**最近一次**链接获得归因。
- 用户会被自动导向本地 storefront，所以链接里不需要 `/jp/`、`/cn/` 这类国家码。【已验证】`apps.apple.com/app/6741724502` 与 `/app/id6741724502` 都会 301 到 `/us/app/wordbyword-translate/id6741724502`（当前出口 IP）。规范写法统一用带 `id` 前缀的形式。
- 【官方】来源类型（Acquisition）：Safari 中来自网站的点击记为 **Web Referrer**（重定向链中最后一个 URL 作为来源）；iOS 上来自 Chrome 等非 Safari 浏览器的点击记为该浏览器 App 的 **App Referrer**。所以 campaign 参数能补上按"位置"细分的维度。
- 命名建议【推断】：WBW 自身用 `ct=web-<page>-<lang>`（如 `web-home-ja`、`web-swipe-zh-Hans`）；导向 SurfEnglish 的用 `ct=wbw-<placement>-<lang>`。

### 7.3 本地化徽章（【官方】Apple Marketing Guidelines）
- Apple 提供约 50 种本地化徽章；"App Store" 字样始终是英文；**不能自己翻译或修改徽章**；优先使用黑色版；徽章四周的留白至少为徽章高度的 1/4。
- 【已验证】`https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/{ja-jp|zh-cn|zh-tw|ko-kr|en-us}` 均返回 200 的 SVG，且内容互不相同。修复 F6。

### 7.4 Custom Product Pages（可选，【官方】Apple）
- 每个 App 最多 70 个自定义产品页，URL 形如 `…?ppid=<id>`；可以替换截图、宣传文本、预览视频，可以本地化；从 iOS 18 起支持深链；在 Acquisition 中可以与默认页对比转化。
- 用法【推断】：给 SurfEnglish 做一个"给 WordByWord 用户"的自定义产品页（首屏截图强调与 WBW 的差异和互补），WBW 站内导向 SurfEnglish 的链接使用 `ppid` + `ct`。这一步只用 App Store 已有的素材，与网站"不新增素材"的约束不冲突。

### 7.5 Universal Links 与深链（可选）
- 【官方】AASA 文件必须放在 `https://<domain>/.well-known/apple-app-site-association`，"using https:// with a valid certificate and with no redirects"；iOS 14 及以后由 Apple CDN 抓取。
- 【推断】在 GitHub Pages 上，Jekyll 默认忽略点开头的目录，需要 `.nojekyll`；Cloudflare 可以用 `_headers` 设置 `Content-Type: application/json`。只有当 WBW App 实际实现了 associated domains 时才需要做。默认不在本次范围内。

---

## 8. 可直接写入设计文档的 `<head>` 规范（每个语言页，【推断】，综合以上官方要求）

```html
<html lang="ja">                               <!-- ar 页加 dir="rtl" -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{本地化主关键词} | WordByWord</title>     <!-- 品牌在首或尾，各页唯一 -->
<meta name="description" content="{本地化、各页唯一}">
<meta http-equiv="content-language" content="ja">  <!-- 给 Bing 和 Naver 用 -->
<link rel="canonical" href="https://www.word-by-word.app/ja/">
<link rel="alternate" hreflang="en" href="https://www.word-by-word.app/">
<link rel="alternate" hreflang="ja" href="https://www.word-by-word.app/ja/">
<link rel="alternate" hreflang="zh-Hans" href="https://www.word-by-word.app/zh-hans/">
<link rel="alternate" hreflang="zh-Hant" href="https://www.word-by-word.app/zh-hant/">
<!-- … 列出全部语言（含自身），每个一行 … -->
<link rel="alternate" hreflang="x-default" href="https://www.word-by-word.app/">
<meta property="og:site_name" content="WordByWord">
<meta property="og:locale" content="ja_JP">
<meta property="og:image" content="https://www.word-by-word.app/img/og/ja.jpg">
<meta name="apple-itunes-app" content="app-id=6741724502">
<link rel="preload" as="image" href="{hero.avif}" fetchpriority="high">  <!-- 可选；也可以只在 img 上写 fetchpriority -->
<script type="application/ld+json">{ … §4 … }</script>
```
（如果采用方案 A 保留旧 URL，把上面的路径换成 `/ja-top.html` 等即可，结构不变。）

robots.txt（【推断】）：
```
User-agent: *
Allow: /
Sitemap: https://www.word-by-word.app/sitemap.xml
```
（不屏蔽 OAI-SearchBot、PerplexityBot、Bingbot；是否屏蔽 GPTBot、Google-Extended 由用户决定，与搜索可见性无关。）

sitemap（【官方】build-sitemap，2026-07-08）：只列 canonical URL，使用绝对 URL；`lastmod` 只有在"consistently and verifiably accurate"时才会被使用，因此要由构建脚本根据内容变化生成，不能每次构建都刷新；`priority` 和 `changefreq` 会被忽略，不必写；可以选择用 `xhtml:link` 输出 hreflang（与 HTML 二选一，见 §1.1）。

---

## 9. 风险与不确定性

| 风险 | 级别 | 说明和缓解 |
|---|---|---|
| 语言页长期未被索引，补上 hreflang 后起量很慢 | 中 | hreflang 不会让页面被索引，**站内链接和 sitemap 才会**。上线后在 GSC 对 4–5 个主力语言页做 URL Inspection 并请求编入索引；Bing 用 IndexNow 推送 |
| meta refresh 迁移的信号传递比 301 慢或不完整 | 低到中 | 官方说视为永久重定向；但它依赖抓取 HTML，次要搜索引擎（Naver、Baidu）的支持更不确定。能上 Cloudflare 的话优先 301 |
| 托管与 URL 同时变化，难以归因 | 低 | 流量基数小；可以分两步做（§2.4） |
| 机器翻译质量引发 scaled content 风险 | 中 | 页面数量受控（≤ 7 页 × 主力语言），使用术语表，母语抽检；无法审校的语言只保留首页 |
| 交叉推广被视为链接方案 | 低 | 两款真实产品、规模受控、锚文本自然；Mueller 2026-01 的表态支持这种做法 |
| 以 SurfEnglish 为模板时照搬其错误 | 低 | F14 的 `applicationCategory`；FAQPage 不再有富结果 |
| 行业数据（AIO CTR、llms.txt、市场份额）来自第三方二手汇总 | — | 已标注【行业研究】；只用于定方向，不作为决策阈值 |
| 本次 "site:" 检索使用的不是 Google 本身，结果只能作参考 | — | 语言页是否已被 Google 索引，以 GSC 为准 |

---

## 10. 来源清单（类型 · 日期）

**Google Search Central（官方）**
- Localized versions / hreflang · 2026-09-21 · https://developers.google.com/search/docs/specialty/international/localized-versions
- Managing multi-regional and multilingual sites · 2025-12-10 · https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Locale-adaptive pages · 2025-12-10 · https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages
- Site move with URL changes · 2026-08-20 · https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Site move without URL changes · 2025-12-10 · https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes
- Redirects and Google Search · 2026-04-14 · https://developers.google.com/search/docs/crawling-indexing/301-redirects
- Consolidate duplicate URLs · 2026-07-10 · https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Spam policies · 2026-08-28 · https://developers.google.com/search/docs/essentials/spam-policies
- Creating helpful content · 2026-10-01 · https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Using generative AI content · 2026-10-01 · https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- AI features and your website · 2025-12-10 · https://developers.google.com/search/docs/appearance/ai-features
- AI optimization guide · 2026-07-10 · https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Blog: Top ways … AI experiences on Search · 2025-05-21 · https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search
- Documentation updates（FAQ 2026-05-08/06-15，llms.txt 2026-06-15，preferred image 2026-03-02，AVIF 2024-08-30，hreflang link 2024-06-12，HowTo 2023-09-14，sitelinks search box 2024-11-29，Change of Address 2026-06-17）· https://developers.google.com/search/updates
- Software app structured data · 2026-09-08 · https://developers.google.com/search/docs/appearance/structured-data/software-app
- Review snippet · 2026-09-08 · https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Organization · 2026-09-08 · https://developers.google.com/search/docs/appearance/structured-data/organization
- Site names · 2025-12-10 · https://developers.google.com/search/docs/appearance/site-names
- Search gallery · 2026-06-15 · https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- JavaScript SEO basics · 2026-03-04 · https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Links crawlable · 2025-12-10 · https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Qualify outbound links · 2025-12-10 · https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links
- Image SEO · 2026-03-02 · https://developers.google.com/search/docs/appearance/google-images
- Lazy-loading · https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading
- Build a sitemap · 2026-07-08 · https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- SEO Starter Guide · 2025-12-10 · https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Title links · 2025-12-10 · https://developers.google.com/search/docs/appearance/title-link
- Avoid intrusive interstitials · 2025-12-10 · https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials
- Page experience · https://developers.google.com/search/docs/appearance/page-experience
- Write high quality reviews · 2025-12-10 · https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews
- web.dev Optimize LCP · 2020-04-30，更新于 2025-03-31 · https://web.dev/articles/optimize-lcp
- web.dev Web Vitals · 2024-10-31 · https://web.dev/articles/vitals

**Google 员工表态**
- Mueller：品牌站互链 "reasonable scale" · 2026-01-14 · https://www.seroundtable.com/google-linking-brand-websites-40761.html
- Mueller：自动翻译与 noindex · 2019-10-23 · https://www.seroundtable.com/google-auto-translating-content-penalty-28413.html

**Microsoft / Bing**
- Optimizing Your Content for Inclusion in AI Search Answers · 2025-10-08 · https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers
- AI Performance in Bing Webmaster Tools · 2026-02 · https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- Fabrice Canel：hreflang 是弱信号 · 2020-09-10 · https://x.com/facan/status/1304120691172601856
- IndexNow 文档 · https://www.indexnow.org/documentation

**Apple**
- Smart App Banners · https://developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners
- Campaign links · https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links
- Acquisition sources（Web Referrer）· https://developer.apple.com/help/app-store-connect/view-app-analytics/view-acquisition-sources/
- Custom product pages · https://developer.apple.com/app-store/custom-product-pages/
- Marketing guidelines（badges）· https://developer.apple.com/app-store/marketing/guidelines
- Supporting associated domains · https://developer.apple.com/documentation/xcode/supporting-associated-domains

**托管**
- GitHub Pages HTTPS · https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- GitHub Pages custom domain · https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- GitHub Pages limits · https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- jekyll-redirect-from 模板 · https://github.com/jekyll/jekyll-redirect-from/blob/master/lib/jekyll-redirect-from/redirect.html
- Cloudflare Pages redirects · 2026-08-25 · https://developers.cloudflare.com/pages/configuration/redirects/
- Cloudflare migrate Pages to Workers · 2026-09-22 · https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
- Cloudflare blog: full-stack on Workers · 2025-04 · https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/
- Cloudflare redirects overview · 2026-08-14 · https://developers.cloudflare.com/rules/url-forwarding/

**OpenAI**
- Crawlers（OAI-SearchBot / GPTBot / ChatGPT-User）· https://developers.openai.com/api/docs/bots

**行业研究和经验**
- Princeton GEO（KDD 2024）· v1 2023-11-16，v3 2024-06-28 · https://arxiv.org/abs/2311.09735
- Pew：AI summary 与点击 · 2025-07-22 · https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/
- Ahrefs AIO CTR 58%（媒体转述）· 2026-02 · https://www.medianama.com/2026/02/223-google-ai-overviews-click-through-rates-58-study/
- Vercel：AI 爬虫不执行 JS · 2024-12-17 · https://vercel.com/blog/the-rise-of-the-ai-crawler
- GSQI（Glenn Gabe）：自动翻译与 scaled content · 2025-05-05 · https://www.gsqi.com/marketing-blog/auto-translating-content-google-scaled-content-abuse/
- The HOTH：FAQ 富结果弃用时间线 · 2026-05-21 · https://www.thehoth.com/blog/google-faq-rich-results-deprecated/
- llms.txt 证据汇总（二手）· 2026 · https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026
- 移动端面包屑移除（报道）· 2025-01-23 · https://tech.slashdot.org/story/25/01/23/1753237/google-removes-url-breadcrumbs-from-mobile-search-results
- GSC Generative AI 报告（报道）· 2026 · https://neilpatel.com/blog/gsc-ai-search-data-generative-ai-report/
- StatCounter（日本、中国、台湾，2026-09）· https://gs.statcounter.com/search-engine-market-share/all/japan （另有 /china、/taiwan）
- HubSpot topic clusters · https://blog.hubspot.com/marketing/topic-clusters-seo
- 语言选择器不用国旗（行业汇总）· https://simplelocalize.io/blog/posts/flags-as-language-in-language-selector/
- Naver 不支持 hreflang（行业）· https://www.linguise.com/blog/guide/naver-seo-guide/
- SEO localization（行业）· https://lokalise.com/blog/seo-localization/
