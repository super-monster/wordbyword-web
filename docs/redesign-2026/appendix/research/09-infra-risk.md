# 09 部署、外部依赖与迁移风险评估（WordByWord 官网重构）

> 调研日期：2026-10-05。全程只读：未修改任何项目文件，只做了 curl/dig/RDAP/公开 GitHub API 的只读探测。
> 标注约定：**【已验证】** 有命令输出、文件行号或 URL 作证；**【推断】** 是基于证据的推理，开工前需要确认。

---

## 0. 结论速览（TL;DR）

1. **现状**【已验证】：GitHub Pages 用"从分支部署"（main，Jekyll 构建 `jekyll-build-pages v1.0.13`），Fastly CDN，所有资源固定 `cache-control: max-age=600`，**不能做服务端 301，也不能自定义响应头**。`www` 是 CNAME → `super-monster.github.io`，TTL 只有 **5 秒**。**apex `word-by-word.app` 没有 A/AAAA 记录，根本解析不到**，证书 SAN 也只有 www。
2. **DNS 区里还有生产 API**【已验证】：`api.` 和 `backend-test.` 两条 CNAME 指向 `ghs.googlehosted.com`（Cloud Run），`backend.` 是 A 记录 34.53.32.27。整个 zone 托管在 Google Cloud DNS（注册商 Squarespace），并且**开了 DNSSEC**（DS keyTag 22319）。所以把 NS 整体迁到 Cloudflare 风险很高：会连带 WordByWord iOS 和 Chrome 扩展的生产 API。**官网重构不要碰 NS。**
3. **契约 URL（以下地址必须一直能访问）**【已验证】
   - App Store 各区上架页：Marketing 用 `https://www.word-by-word.app`（部分区带 `/`），另有 `/support.html`、`/privacy.html`。
   - WordByWord iOS 内硬编码 `/privacy.html`，共 2 处。
   - SurfEnglish iOS 1.0.x–1.2.2 的历史版本也硬编码过同一个 `/privacy.html`。
   - Chrome 扩展的隐私页 `/chrome-extension/privacy.html` 推断已用于 Chrome Web Store（CWS），但未能证实。
4. **推荐方案 (b-lite)**：迁到 Cloudflare Pages，与 SurfEnglish 同一个账号、同一套技术栈。**只把 www 的 CNAME 从 `super-monster.github.io` 改指 `<project>.pages.dev`，不迁移 NS。**
   - 用 `_redirects` 做真正的 301，把 `xx-top.html` 迁到 `/xx/`；用 `_headers` 做缓存。
   - **最大的坑**：Cloudflare Pages 会自动把 `*.html` 用 308 跳到无扩展名地址，surfenglish.app 上实测已证实。契约 URL `/privacy.html` 等要在 `_redirects` 里加 200 rewrite 才能保持 200 直出，必须先在 preview 部署上实测。
   - 停机风险：TTL 5s 加上"先在 CF 绑定域名、再切 CNAME"，理论上接近零停机；唯一的窗口是 CF 签发证书的几分钟。
   - 回滚：CF 控制台可以一键回到上一个部署；DNS 层把 CNAME 切回 github.io 即可，可用到 GitHub 现有证书过期日 **2026-12-23**。
5. **备选方案 (a)**：留在 GitHub Pages，改用 Actions 构建 `dist` 并部署。旧 URL 只能用 instant meta refresh 的 HTML 跳转桩来"跳转"（Google 会把它当作永久跳转，但优先级低于服务端 301），缓存和响应头无法控制。
6. **迁移的 SEO 风险成本低**。GSC（域名属性）近 28 天只有 71 次点击、1,286 次展示，且几乎全部落在首页品牌词上（见 `00-gsc-baseline.md`）。**`/` 这个 URL 不变**；19 个语言页目前是孤岛页，没有任何内链、sitemap 或 hreflang（见 §1.5），本来就几乎没被收录，改路径的损失有限。
7. **site-notice**：建议改为**构建期渲染**：从 `src/notice.json` 读取开关和各语言文案，静态注入 `<div data-nosnippet>`；locale 从 `<html lang>` 取，不再依赖文件名映射。公告开启时压制 SurfEnglish 推广条。CF 上 HTML 默认 `max-age=0`，push 后约 1 分钟生效（GitHub Pages 现在最长要约 12 分钟）。

---

## 1. 当前部署现状

### 1.1 托管与构建

| 项 | 值 | 证据 |
|---|---|---|
| 仓库 | `super-monster/wordbyword-web`，public，默认分支 main，`has_pages: true` | `curl https://api.github.com/repos/super-monster/wordbyword-web` 返回 `{'visibility': 'public', 'default_branch': 'main', 'has_pages': True, 'pushed_at': '2026-08-23T08:14:08Z'}`【已验证】 |
| 构建方式 | 从分支部署（经典模式），动态 workflow `pages-build-deployment`，构建步骤为 `Pull ghcr.io/actions/jekyll-build-pages:v1.0.13` → `Build with Jekyll` → `Deploy to GitHub Pages` | `GET /repos/.../actions/workflows` 返回 `pages-build-deployment dynamic/pages/pages-build-deployment active`；最近一次 job steps【已验证】 |
| 构建耗时 | 35 秒到 1.5 分钟（2026-08-23 这次：08:14:10 开始，08:14:45 结束；2026-05-27 这次：14:25:34 开始，14:27:07 结束） | actions/runs 列表【已验证】 |
| 仓库内无 `.github/`、`.nojekyll`、`_config.yml`、`404.html`、`robots.txt`、`sitemap.xml` | 都没有 | `git ls-files` 全量列表（共 86 个文件）【已验证】 |
| CNAME 文件 | `www.word-by-word.app`（最早是 `support.word-by-word.app`，2025-06-01 由 3c7b29f、84630a2 改为 www） | `cat CNAME`，`git log -p -- CNAME`【已验证】 |
| Pages 设置（Enforce HTTPS、build_type） | 未登录无法读取：`gh` 未安装，未认证的 API `GET /pages` 返回 404 | 【未验证】 |
| 分析 | GA4 `G-QS1CJY8YWL`，硬编码在全部 24 个 HTML 中（如 `index.html:12-18`）；外加 `js/analytics.js`（点击事件） | grep【已验证】 |

### 1.2 HTTP 探测（`curl -sI`，2026-10-05 05:12 UTC）

| URL | 状态 | 关键响应头 |
|---|---|---|
| `https://www.word-by-word.app/` | 200 | `server: GitHub.com`, `cache-control: max-age=600`, `via: 1.1 varnish`, `x-served-by: cache-nrt-…`（Fastly 东京）, `last-modified: Sun, 23 Aug 2026 08:14:40 GMT`, etag `"6a8aabf0-2d90"` |
| `http://www.word-by-word.app/` | **200（没有跳 HTTPS）** | 同上，说明 GitHub 的 "Enforce HTTPS" 很可能没勾选【推断】 |
| `http://word-by-word.app/`、`https://word-by-word.app/` | **无法解析** | `curl: Could not resolve host: word-by-word.app` |
| `/ja-top.html` | 200 | max-age=600 |
| `/privacy.html`、`/support.html` | 200 | max-age=600 |
| `/chrome-extension/` | 200 | — |
| `/chrome-extension`（无斜杠） | 301 → `/chrome-extension/`，query 保留（`?x=1` 原样带上） | — |
| `/index.html`、`/index`、`/en-top`、`/ja-top`、`/privacy`、`/support`、`/chrome-extension/privacy`、`/backup/top` | **全部 200**（GitHub Pages 会自动补 `.html`） | 说明每个页面都有 2 到 5 个可访问的 URL |
| `/backup/top.html`、`/README.md` | 200（`README.md` 以 `text/markdown` 原样返回） | 备份页和 README 都被公开发布 |
| `/robots.txt`、`/sitemap.xml`、`/404.html`、`/.well-known/apple-app-site-association` | 404 | — |
| `/CNAME`、`/.DS_Store`、`/img/.DS_Store` | 404（Jekyll 排除了点文件；CNAME 也不对外提供） | — |
| `/nonexistent-xyz` | 404，`<title>Page not found · GitHub Pages`（GitHub 默认 404 页） | — |
| `img/screenshot-1.png`（小写） | 404；`img/Screenshot-1.png` 是 200 | **大小写敏感**【已验证】 |
| `img/Screenshot-2.png`、`-3`、`-4` | **404** | 20 个语言页引用了这些不存在的图（见 §5.4） |

### 1.3 DNS（`dig`、RDAP）

| 记录 | 值 | 备注 |
|---|---|---|
| 注册商 | Squarespace Domains II LLC；注册日 2025-02-03，到期 **2027-02-03**；状态 client delete/transfer prohibited | RDAP `pubapi.registry.google/rdap/domain/word-by-word.app`【已验证】 |
| NS | `ns-cloud-c1..c4.googledomains.com`；SOA `cloud-dns-hostmaster.google.com`；TLD 侧 NS TTL 10800 | 原 Google Domains，底层是 Google Cloud DNS；DNS 编辑入口应在 Squarespace 控制台【推断】 |
| **DNSSEC** | **已开启**：DS `22319 8 2 F50EC17F…`，TLD 侧 DS TTL 1800；RDAP `delegationSigned: True` | 【已验证】 |
| `www` | `CNAME super-monster.github.io.`，**TTL 5** | 权威服务器直查【已验证】，切换和回滚都极快 |
| apex `word-by-word.app` | **没有 A/AAAA/CNAME**（只返回 SOA） | 输入裸域的用户会解析失败【已验证】 |
| `api` | `CNAME ghs.googlehosted.com`，TTL 300 | Cloud Run 域名映射；Chrome 扩展 `config.json:4` 的 `"prodApiBase": "https://api.word-by-word.app/"` 指向它 |
| `backend-test` | `CNAME ghs.googlehosted.com`，TTL 300 | WordByWord iOS `Services/APIConfig.swift:11` 的 `baseURL = "https://backend-test.word-by-word.app"` |
| `backend` | `A 34.53.32.27`，TTL 300 | 遗留的 GCP VM（`SurfEnglish-iOS/Docs/wordbyword-backend-feature-model-map.md:91`） |
| MX / TXT / CAA | 全部为空 | 无邮件；**apex 没有 TXT**（GSC 域名属性不是用 apex TXT 验证的，见 §3.9）；无 CAA，任何 CA 都能签证书 |
| `_github-pages-challenge-super-monster` TXT | 空 | **该域名没有在 GitHub 账户里做"已验证域名"**，存在子域接管的理论风险（§5.7） |
| AXFR | `Transfer failed.` | 拿不到完整 zone。下文只列出常见子域爆破测到的 4 条，NS 迁移前必须从 Squarespace 导出完整 zone |

对照组 SurfEnglish【已验证】：NS 是 `cartman/vivienne.ns.cloudflare.com`，apex 解析到 Cloudflare Anycast（172.67.222.151 / 104.21.38.120）；`www` 由 zone 级 Redirect Rule 301 到 apex（`SurfEnglishWebsite/DEPLOY.md` 的 "Custom domains — LIVE" 段）。

### 1.4 TLS / HSTS

- 证书【已验证】：`issuer=Let's Encrypt YR1`，`subject=CN=www.word-by-word.app`，**SAN 只有 www**，有效期 `notBefore=Sep 24 2026`、`notAfter=Dec 23 2026`。由 GitHub 自动续期，前提是 www 一直指向 GitHub。
- HSTS【已验证】：`hstspreload.org` 返回 `"status": "preloaded", "preloadedDomain": "app"`。`.app` 整个 TLD 都在预加载列表里，浏览器永远走 HTTPS，所以 HTTP 返回 200 对真实用户没有影响；但爬虫和 curl 仍能拿到一个 HTTP 版本的重复页面。

### 1.5 现有架构中与迁移直接相关的问题

| # | 问题 | 证据 | 迁移时的处理 |
|---|---|---|---|
| P1 | **语言页没有任何内链**：19 个 `xx-top.html` 中只有 `zh-top.html` 被 `chrome-extension/index.html:319` 链接（`<a href="../zh-top.html">iOS 应用</a>`），首页、页脚、其他页一律不链接 | `grep -rn "-top"` 只命中这一处 | 重定向表要覆盖全部旧 URL；新架构必须有语言切换、hreflang、sitemap |
| P2 | 没有 canonical 和 hreflang（26 个 HTML 都是 0） | `grep -c "canonical\|hreflang"` 全部为 0 | 新模板生成自指 canonical 和完整 hreflang 簇 |
| P3 | 重复页：`index.html` 与 `en-top.html` 只差一行注释（`diff` 第 185 行）；`cn-top.html` 与 `zh-top.html` **完全相同**；再加上无扩展名变体，以及 GitHub 上 `http://` 也返回 200 | `diff -q cn-top.html zh-top.html` 返回 identical | `en-top`→`/`、`cn-top` 和 `zh-top`→`/zh-hans/`，都做 301 |
| P4 | `backup/*.html`（6 个）和 `README.md` 被公开发布 | curl 200 | 新构建只发布 `dist/`，旧路径 301 到 `/` 或返回 404 |
| P5 | 没有 robots.txt / sitemap.xml / 自定义 404 | curl 404 | 构建时生成 |
| P6 | 20 个语言页的截图区引用了 `img/Screenshot-2/3/4.png`，这些文件不存在，线上 404 | 本地存在性检查，加上线上 curl 404 | 构建时加大小写敏感的链接检查 |
| P7 | 非英语页的 6 张功能演示图 `img/feature_*_demo.png` **全都是同一个文件**（md5 `5d5463ff…`，与 `img/Screenshot-1.png` 相同，1530×3036，1.69 MB） | `md5 -r` | 素材问题，见 08 号报告；对基础设施的影响是页面图片总重：`index.html` 去重后约 **15.0 MB**、`ja-top.html` 约 **17.5 MB**，24 个 `<img>` 中 0 个用了 `loading="lazy"` |

---

## 2. 外部依赖 URL 契约清单（必须保持可访问）

### 2.1 清单

| # | URL | 引用方 | 证据 | 能否改 | 要求 |
|---|---|---|---|---|---|
| C1 | `https://www.word-by-word.app`（以及带尾斜杠的 `/`） | App Store Connect 的 Marketing URL（各区）、iTunes `sellerUrl` | `curl apps.apple.com/{us,jp,cn,kr,de}/app/id6741724502` 都含该链接，jp/kr 带 `/`；`itunes.apple.com/lookup?id=6741724502` 返回 `'sellerUrl': 'https://www.word-by-word.app'`【已验证】 | 可在 ASC 修改。Marketing/Support URL 推断属于版本级的本地化字段，修改需要随新版本提交【推断】 | `/` **保持 200，不变** |
| C2 | `https://www.word-by-word.app/privacy.html` | ASC 的 Privacy Policy URL | 同上（5 个区都有）【已验证】 | ASC 里随时可改（App 级字段）【推断】 | **200 直出（首选），或单跳 301/308** |
| C3 | 同上 `/privacy.html` | **WordByWord iOS 硬编码**：`WordByWordPrototype/SubscriptionManager/SubscriptionView.swift:68`、`WordByWordPrototype/Views/SettingsView/MoreSettingsView.swift:168` | grep【已验证】 | 已发布的二进制改不了；当前版本 v1.2.2 发布于 2026-05-27（iTunes lookup） | **永久可访问** |
| C4 | 同上 `/privacy.html` | **SurfEnglish iOS 历史版本硬编码**：`Browser/Engine/src/Views/SettingsView/MoreSettingsView.swift:168`（提交 `76a3cda` 于 2026-07-02 加入，`eb502af` 于 2026-09-02 删除；期间的版本包括 1.0.5、1.0.6、1.2.0、1.2.2） | `git log -S` 与 `git show`【已验证】。在 SurfEnglish UI 中是否能走到这个入口【未验证】 | 改不了 | 永久可访问 |
| C5 | `https://www.word-by-word.app/support.html` | ASC 的 Support URL | App Store 页面 HTML【已验证】；iOS 源码中没有引用 | 需随新版本修改【推断】 | 200 直出（首选），或单跳 301 |
| C6 | `https://www.word-by-word.app/chrome-extension/privacy.html` | Chrome Web Store 的隐私政策字段 | 仓库里**找不到**任何指向它的引用。扩展 README 只有 CWS 后台提交步骤（`WordByWord-translate-extension/README.md:182-188`）；落地页 CTA 只链接到泛化地址 `https://chrome.google.com/webstore`（`chrome-extension/index.html:243`）。所以扩展是否已上架、隐私 URL 填的是什么都【未验证】 | — | 按"可能在用"处理：200 直出 |
| C7 | `https://www.word-by-word.app/chrome-extension/` | 自站内链、可能的外链 | — | — | 保持，或单跳 301 |
| C8 | `https://www.word-by-word.app/zh-top.html` | `chrome-extension/index.html:319`（站内） | 【已验证】 | 新模板里会改掉 | 301 → `/zh-hans/` |
| C9 | 其余 19 个 `xx-top.html` 及无扩展名变体 | 只可能有外链或搜索索引，没有内链 | — | — | 301 → 新语言路径，保留至少 1 年（建议永久） |
| C10 | `api.` / `backend-test.` / `backend.word-by-word.app` | iOS、扩展、后端 | §1.3 | **不在本项目范围，但与官网在同一个 DNS zone** | NS 迁移时必须原样复制，且设为 DNS-only |
| C11 | GA4 `G-QS1CJY8YWL` | 全部页面 | `index.html:12-18` | — | 新模板继续使用同一个 Measurement ID，gtag 放在 `<head>` 里 |
| C12 | 外链素材 `https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us` | 22 处 `<img>` | grep【已验证】 | — | 属于外部依赖：Apple 官方徽章服务。如果加 CSP，要放行该域名 |

### 2.2 反向链接现状

- **SurfEnglish 官网没有链接回 WordByWord**【已验证】。在 `SurfEnglishWebsite`（排除 node_modules、.git、dist）里 grep `word-by-word|WordByWord|6741724502`，只命中 `.claude/settings.local.json:17` 的 WebFetch 白名单。可以在 SurfEnglish 的 `/about/` 加一句 "From the maker of WordByWord"，作为兄弟站互链。它属于正常的相关互链，不算 link scheme。
- SurfEnglish 的 iTunes `sellerUrl` 是 `https://surfenglish.app/`【已验证】。
- 现有推广脚本 `js/surfenglish-promo.js:21` 的 `appStoreUrl: 'https://apps.apple.com/app/id6787367021'` **没带 App Store Connect 的 campaign 参数**（`pt=`/`ct=`）【已验证】。因此 App Analytics 无法区分有多少 SurfEnglish 下载来自 WordByWord 官网，而这正是本次"引流"能否量化的关键（§3.8）。另外 `utm=` 只加在指向 surfenglish.app 的链接上（`:23`），但 surfenglish.app 本身没装 GA 或任何网页分析（`curl https://surfenglish.app/ | grep googletagmanager|cloudflareinsights` 无结果，build.mjs/templates 里也没有 gtag），所以这些 UTM 目前没人接收。

### 2.3 App Store 侧可以借力的点【推断】

迁移后，可以在 ASC 里按 App Store 本地化，把 Marketing URL 设成对应语言页（如 ja 填 `https://www.word-by-word.app/ja/`）。这样每个语言页都会从 apps.apple.com 获得一个权威入链，是对"非英语关键词零命中"最直接的修补之一。代价是要随下一个版本提交。

---

## 3. 迁移方案对比

### 3.1 方案 (a)：继续用 GitHub Pages，构建产物用 Actions 部署

**做法**：仓库保留源码，新增 `.github/workflows/pages.yml`（`actions/configure-pages` → `node build.mjs` → `actions/upload-pages-artifact@v3 path: dist` → `actions/deploy-pages@v4`），Settings → Pages → Source 改为 "GitHub Actions"。

| 维度 | 情况 |
|---|---|
| 旧 URL 跳转 | **不能服务端 301**。只能由构建生成跳转桩，例如 `ja-top.html`：`<meta http-equiv="refresh" content="0; url=/ja/">` + `<link rel="canonical" href="https://www.word-by-word.app/ja/">` + `location.replace()` + 可见链接。Google 文档原文："Google Search interprets instant meta refresh redirects as permanent redirects"，但服务端跳转"if possible"优先（developers.google.com/search/docs/crawling-indexing/301-redirects）。GitHub 会把 `/ja-top` 自动映射到 `ja-top.html`，一个桩可以同时覆盖两种变体 |
| 契约 URL | `/privacy.html` 等**原样作为文件输出，保持 200**，零风险 |
| 缓存和响应头 | 固定 `max-age=600`，不能自定义：没法给指纹资源配 immutable 长缓存，也没法加安全头或 `X-Robots-Tag`（只能用 `<meta name="robots">`） |
| Jekyll | 走 Actions 部署就不经过 Jekyll。如果改成"把 dist 提交到 gh-pages 分支"，dist 根目录必须放 `.nojekyll`，否则 `_` 开头的目录和文件会被丢掉 |
| CNAME | GitHub 文档原文："If you are publishing from a custom GitHub Actions workflow, no CNAME file is created, and any existing CNAME file is ignored"。自定义域名改由 Settings 保存，现有设置会保留【推断】，切换后需要立刻核对 |
| apex | 可以给 apex 加 4 条 A（185.199.108–111.153）和 4 条 AAAA。GitHub 原文："If you configure www.example.com as the custom domain… and you have GitHub Pages DNS records set up for the apex and www domains, then example.com will redirect to www.example.com"。**这是 (a) 唯一的额外收益，而且现在就能做** |
| 限额 | 站点最大 1 GB（当前 img 27 MB）、软带宽 100 GB/月、部署 10 分钟超时；用 Actions 部署时不受每小时 10 次构建的限制 |
| 预览环境 | 没有分支预览，只能本地预览 |
| 改动量 | 小：一个 workflow 文件加一次 Settings 切换，不动 DNS |

### 3.2 方案 (b)：迁到 Cloudflare Pages（与 SurfEnglish 同一栈）

又分两个子方案：

- **(b-lite，推荐)**：DNS 留在 Squarespace/Google Cloud DNS，**只改 www 这一条 CNAME** 指向 `<project>.pages.dev`。CF 文档原文：子域可以从外部 DNS 用 CNAME 接入，但必须**先在 Pages 控制台关联域名**，否则 "will result in your domain failing to resolve… 522 error"。
- **(b-full，不推荐在本项目内做)**：把 NS 迁到 Cloudflare，以便 apex 也能挂到 Pages。CF 原文："To deploy your Pages project to a custom apex domain, that custom domain must be a zone on the Cloudflare account"。代价见 §3.7.3。

| 维度 | 情况 |
|---|---|
| 旧 URL 跳转 | `_redirects` 支持真正的 301/308，静态规则上限 2,000 条、动态规则 100 条；文档原文："redirects are always followed, regardless of whether or not an asset matches the incoming request" |
| **`.html` 自动 308** | CF 原文："Pages will also redirect HTML pages to their extension-less counterparts: /contact.html → /contact"。在 surfenglish.app 实测【已验证】：`/index.html` 308 到 `/`，`/privacy/index.html` 308 到 `/privacy/`，`/privacy` 308 到 `/privacy/`，`/ja` 308 到 `/ja/`；query 保留（`/ja?utm_source=test` 308 到 `/ja/?utm_source=test`）。**影响**：只要输出里有 `privacy.html`，访问 `/privacy.html` 就会被 308 走，契约 URL 无法保持 200（解法见 §3.5） |
| 大小写 | 敏感【已验证】：`https://surfenglish.app/PRIVACY/` 返回 404 |
| 缓存 | 默认 `cache-control: public, max-age=0, must-revalidate` 加 ETag（CF 文档；surfenglish.app 实测一致）。可用 `_headers` 给指纹资源设 `max-age=31536000, immutable`（SurfEnglish `public/_headers` 已这么做） |
| 头部规则 | 最多 100 条，每条 2,000 字符；支持带主机名的规则，如 `https://:project.pages.dev/*`；**重定向响应不会套用 `_headers`** |
| pages.dev 重复站 | `https://surfenglishwebsite.pages.dev/` 返回 200，没有 `X-Robots-Tag`，靠 `<link rel="canonical" href="https://surfenglish.app/">` 兜底【已验证】。WordByWord 要照做，可额外用 `_headers` 给 pages.dev 主机加 `X-Robots-Tag: noindex`，或用账户级 Bulk Redirect |
| HTTP→HTTPS | pages.dev 和 CF 自定义域名默认 301 到 https【已验证：`http://surfenglishwebsite.pages.dev/` 返回 301】。www 走外部 DNS 的 CNAME 时行为应该相同【推断，需验证】 |
| 预览 | 每个分支和每次 push 都有 preview 部署，数量无上限，正好用来在切 DNS 前跑全量验收 |
| 限额（免费版） | 每月 500 次构建、同时 1 个构建、20 分钟超时、每站 20,000 个文件、单文件 25 MiB，都绰绰有余 |
| 回滚 | 控制台 Deployments 里可以一键 rollback 到任一历史部署 |
| 工具链复用 | SurfEnglish 已有 CF 账号、Git 集成、"release 分支"模型（`DEPLOY.md`：`main` 开发，`cloudflare-deploy` 发布）、手动备份 workflow（`.github/workflows/deploy.yml`，wrangler-action），可以照搬 |
| apex | b-lite 下 apex 依旧解析不到，与现状相同，不会更差 |

### 3.3 对比矩阵

| | (a) GH Pages + Actions | **(b-lite) CF Pages + 仅改 www CNAME** | (b-full) CF Pages + NS 迁移 |
|---|---|---|---|
| 旧 URL 迁移质量 | meta refresh（Google 视为永久，但次于服务端） | **服务端 301** | 服务端 301 |
| 契约 `.html` URL 保持 200 | 天然满足 | 需要 200 rewrite，要实测 | 同 b-lite |
| 缓存控制和安全头 | 不行 | 可以 | 可以 |
| 预览部署 | 无 | 有 | 有 |
| apex 修复 | 可以（加 A/AAAA） | 不行（维持现状） | 可以（Redirect Rule） |
| DNS 风险 | 无 | **极低**（只改 1 条 CNAME，TTL 5s） | **高**（DNSSEC、生产 API、完整 zone 复制） |
| 与 SurfEnglish 同栈 | 否 | 是 | 是 |
| 停机窗口 | 0（切 Pages source 时可能有几十秒） | CF 签证书的几分钟 | DNSSEC 处理不当会导致整域 SERVFAIL，可能持续数小时 |
| 回滚 | revert 后重新部署（约 1 分钟） | CF 一键回滚；或改 CNAME 回 github.io | 复杂 |
| 公告生效时间 | 构建 0.5 到 1.5 分钟，再加 CDN 最多 10 分钟 | 构建约 1 分钟，生效即时（max-age=0） | 同左 |

**推荐 (b-lite)**。如果用户不想多维护一个 CF 项目，(a) 是可接受的保底，SEO 上的差距只在"服务端 301"和"meta refresh"之间。**两个方案都建议把构建产物写成与托管无关的形式**（`dist/` 加一个按目标切换的 redirect 生成器），这样后续换托管不用改模板。

### 3.4 URL 映射表（新路径建议与 SurfEnglish `build.mjs:52-63` 的 locale 命名对齐）

| 旧 URL（含无扩展名变体） | 新 URL | 码 | 备注 |
|---|---|---|---|
| `/`、`/index.html`、`/index` | `/` | —（CF 会自动把 `/index.html` 308 到 `/`） | **品牌词流量的落点，绝对不能变** |
| `/en-top.html`、`/en-top` | `/` | 301 | 与 index 重复 |
| `/cn-top.html`、`/zh-top.html`（及无扩展名） | `/zh-hans/` | 301 | 两个文件完全相同 |
| `/tw-top.html` | `/zh-hant/` | 301 | |
| `/ja-top.html` | `/ja/` | 301 | 其余同理：ko es vi id th hi ar de fr it nl pl ru tr uk |
| `/pt-top.html` | `/pt-br/` 或 `/pt/` | 301 | 页面 `lang="pt"`，但用词偏巴西葡语（命中 "você"×1、"tela"×3，没有 "ecrã" 或 "telemóvel"），由 i18n/SEO 决定 |
| `/privacy.html`、`/support.html` | **原地保留** | 200 | 契约 C2–C5 |
| `/chrome-extension/`、`/chrome-extension/privacy.html` | **原地保留** | 200 | 契约 C6–C7 |
| `/backup/*`、`/README.md` | `/` 或 404 | 301 | 下线 |
| `/img/*`、`/wbw_logo.png`、`/favicon.ico` | 尽量保持原路径；如果重编码成 webp/avif 改了名，旧名可不跳转 | — | 图片 URL 变化只影响 Google 图片搜索，量可以忽略 |

`_redirects` 草案（b-lite 用，约 45 行，远低于 2,000 条上限）：
```
# legacy flat language pages → /<locale>/
/en-top.html   /          301
/en-top        /          301
/cn-top.html   /zh-hans/  301
/cn-top        /zh-hans/  301
/zh-top.html   /zh-hans/  301
/zh-top        /zh-hans/  301
/tw-top.html   /zh-hant/  301
/tw-top        /zh-hant/  301
/ja-top.html   /ja/       301
/ja-top        /ja/       301
# … ko es vi id th hi ar de fr it nl pl ru tr uk pt 同理（每种语言 2 行）
/backup/*      /          301
/README.md     /          301
# contract URLs: serve 200 at the exact legacy path (see §3.5, must be verified on preview)
/privacy.html                   /legal/privacy/            200
/support.html                   /legal/support/            200
/chrome-extension/privacy.html  /legal/extension-privacy/  200
```
注意：**不能用 `/:lang-top.html /:lang/ 301` 这种占位符一把梭**。原因有三：`cn`、`zh`、`tw`、`en` 需要特殊映射；占位符规则会占用动态规则的 100 条配额；还可能误伤别的路径。

### 3.5 契约 `.html` URL 在 CF Pages 上的处理（关键难点）

| 选项 | 做法 | 优点 | 风险 |
|---|---|---|---|
| **C-1（推荐，先在 preview 实测）** | 内容输出到 `legal/privacy/index.html` 等路径，再用 `_redirects` 的 200 proxy 映射回 `/privacy.html`。页面 canonical 写成 `https://www.word-by-word.app/privacy.html`，`/legal/*` 再加 `<meta name="robots" content="noindex">` 或用 canonical 消化重复 | 契约 URL 保持 200 直出，用户和审核员看到的地址不变 | CF 文档只说 "Proxying will only support relative URLs"、"only the first proxy applies"，没有明确说明 `.html` 源路径与自动 pretty-URL 的交互。**必须在 preview 部署上 `curl -sI` 实测**：确认返回 200 而不是 308，并且 body 正确 |
| C-2（兜底） | 直接输出 `privacy.html`，接受 CF 自动 308 到 `/privacy` | 零配置 | 契约 URL 变成单跳 308。Safari、App Review、CWS 都会跟随跳转，实际几乎没影响，但不再是"原样不变" |
| C-3 | 用 Pages Function 拦截 | 完全可控 | 引入 Functions：免费版每天 10 万次请求配额；`_headers` 和 `_redirects` 对 Functions 响应无效；复杂度过高，不推荐 |

如果走方案 (a)，`/privacy.html` 原样是文件，不存在这个问题。这是 (a) 的唯一硬优势。

### 3.6 b-lite 切换步骤（Runbook）

**T-7 天，准备**
1. 在 SurfEnglish 所在的 CF 账号新建 Pages 项目（例如 `wordbyword-web`），连接 GitHub `super-monster/wordbyword-web`。生产分支沿用 SurfEnglish 的模型，用 `cloudflare-deploy`；构建命令 `node build.mjs`，输出目录 `dist`。
2. 在 preview 和 pages.dev 上跑 §7 的验收脚本：全部旧 URL 返回 301 且是单跳；契约 URL 返回 200（验证 C-1）；canonical 和 hreflang 一律写死绝对地址 `https://www.word-by-word.app/...`，不能用 pages.dev；404 页正常；GA realtime 能收到 page_view。
3. 在 GSC 的 设置 → 所有权验证 里查明域名属性的验证方式（§3.9），确保至少还有一种备用验证方式。
4. 记录现状：截图 GitHub Settings → Pages（自定义域名、Enforce HTTPS、Source），并导出 Squarespace 里的 DNS 记录全表。

**T0，切换（选 GA 小时分布里的流量低谷，约 15 分钟）**
5. CF Pages → Custom domains → 添加 `www.word-by-word.app`，状态显示 pending/verifying。**先做这一步，否则会出 522。**
6. 在 Squarespace DNS 把 `www` 的 CNAME 从 `super-monster.github.io` 改为 `<project>.pages.dev`，TTL 保持很低（5 到 300 秒都行）。
7. 等 CF 显示 Active（证书签发通常几分钟）。期间新解析到 CF 的用户可能短暂遇到 TLS 错误，这是唯一的停机窗口；解析还缓存着旧记录的用户仍由 GitHub 正常服务。
8. 验收：`curl -sI https://www.word-by-word.app/ | grep -i server` 应该显示 `cloudflare`；再跑 §7 全量脚本；在 iOS 真机上点 App 设置里的"隐私政策"；打开 App Store 页面上的三个链接。

**T+1 天到 T+4 周，观察**
9. GSC：提交新的 `sitemap.xml`，对 `/`、`/ja/`、`/privacy.html` 做 URL Inspection；盯住"网页索引 → 已重定向 / 重复网页"报告和首页品牌词排名（基线：`wordbyword` 排名 1.6、`word by word` 排名 6.5）。
10. GitHub Pages **先不要下线**，把它作为 DNS 层的回滚目标保留到证书到期日 2026-12-23 之前。www 不再指向 GitHub 后，GitHub 无法续签证书。

**T+4 到 8 周，收尾**
11. GitHub 仓库 Settings → Pages：取消自定义域名并 Unpublish（或改成仅源码仓库）；删掉 `CNAME` 文件。
12. 在 GitHub 账户 Settings → Pages → Verified domains 验证 `word-by-word.app`（加 TXT `_github-pages-challenge-super-monster`），防止别人把 www 挂到自己的 github.io 上（§5.7）。

### 3.7 停机与 DNS 风险分析

#### 3.7.1 b-lite
- TTL 5 秒【已验证】，所以切换和回滚的传播都在秒级。部分 ISP 会把 TTL 下限设到 30 到 300 秒，影响可以忽略。
- 双端都在线：GitHub 继续服务旧站，CF 服务新站，传播期间少数用户可能先看到旧版再看到新版。这不影响 SEO（Googlebot 单次抓取的结果是一致的）。
- 证书窗口：外部 DNS 走 CNAME 接入时，CF 要等 CNAME 指过来才能完成证书验证，所以有几分钟（极端情况更久）的 TLS 失败窗口。没有 CAA 记录【已验证】，不会卡在 CA 授权上。将来如果加 CAA，必须放行 Let's Encrypt、Google Trust Services（pki.goog）和 SSL.com（CF 文档要求）。
- DNSSEC：只改 www 的 CNAME 内容，签名由 Google Cloud DNS 自动重签，**没有风险**。

#### 3.7.2 方案 (a)
不改 DNS；Pages Source 从 branch 切到 Actions 时，可能有一次部署间隙（几十秒）。

#### 3.7.3 b-full（NS 迁到 Cloudflare）：列出来是为了说明不要在本项目里做
1. **先关 DNSSEC**：在 Squarespace 删除 DS（keyTag 22319），等 TLD 侧 DS TTL 1800 秒加上缓存余量（建议 24 小时）。顺序错了会导致**整个 word-by-word.app 域 SERVFAIL，包括 `api.` 和 `backend-test.`**，同时打断 WordByWord iOS 和 Chrome 扩展的生产翻译功能。
2. 完整复制 zone（AXFR 被拒，只能从 Squarespace 导出）。`api.` 和 `backend-test.` 两条 CNAME 指向 `ghs.googlehosted.com`，**必须设为 DNS-only（灰云）**。如果开了代理，Cloud Run 的 Google 托管证书会续签失败或出现 525/重定向循环【推断，基于 Cloud Run 域名映射的工作方式】。
3. 改 NS（TLD 侧 NS TTL 10800 秒，即 3 小时），在 Cloudflare 重新开启 DNSSEC 并回填 DS。
4. GSC 域名属性的验证方式如果绑在 Google Domains 或 Squarespace 上（§3.9），NS 迁走后可能失效。
5. 收益只有 apex 跳 www 这一项，而 apex 从来没配置过，所有外部引用都用 www。**结论：apex 留作独立的小项目以后再做；或者在 (a) 阶段先用 GitHub 的 A/AAAA 记录顺手修好。**

### 3.8 GA4 连续性

| 点 | 风险 | 措施 |
|---|---|---|
| Measurement ID | 换托管不影响 GA4 | 新模板从唯一一处 `SITE.gaId = 'G-QS1CJY8YWL'` 输出，替代现在 24 处硬编码；**gtag 留在 `<head>` 里**（GSC 如果有 GA 方式的备用验证，依赖这一点） |
| page_path 断层 | `/ja-top.html` 变成 `/ja/`，报表按页面拆成两段 | 在 `gtag('config', …, { content_group: 'home-ja' })` 里带上内容分组或页面语言，跨新旧路径聚合；保留一张"新旧路径对照表"给 Explorations 做正则合并 |
| 重定向跳数 | 301 本身不产生 GA 命中；referrer 和 UTM 一般会保留。CF 的自动 308 和 zone 级 301 都保留 query【已验证】；`_redirects` 规则是否保留 query **没有文档说明** | preview 上实测 `curl -sI "/ja-top.html?utm_source=t"` |
| 事件维度 | `js/analytics.js:42-57` 用 `section[id]` 作为事件的 `location` 参数（`#hero/#features/#screenshots/#cta/#faq`）。`surfenglish-promo.js:19` 的 `sectionAfter: '#hero'` 也依赖它 | 新设计保留这些 section id，或者在 GA 里登记映射；`data-ga-event`/`data-ga-label` 机制原样保留 |
| 双站重复计数 | DNS 传播期间，两个托管上各自的 page_view 都是真实访问，不会重复 | 无需处理 |
| SurfEnglish 归因 | 现在只有 GA 事件 `surfenglish_promo`，量不到实际安装 | App Store 链接改用 campaign link：`https://apps.apple.com/app/apple-store/id6787367021?pt=<ProviderID>&ct=wbw_web_<placement>&mt=8`（`ct` 最长 40 字符，`pt` 从 ASC 的 App Analytics → Campaigns 获取）【推断，参数细节以 ASC 为准】 |
| 同意管理 | 现在没有 cookie/consent 横幅，EEA 访客的合规问题留待单独评估 | 超出本报告范围，只作提示 |

### 3.9 Search Console

- **现状**：属性是 `word-by-word.app` 的**域名属性**（`00-gsc-baseline.md:3`，来自用户截图）。但 apex 上没有 TXT 记录【已验证：`dig TXT word-by-word.app` 为空】。所以验证要么靠一条看不到名字的 CNAME 令牌记录（`<token>.word-by-word.app → gv-….dv.googlehosted.com`），要么是 Google Domains 时代的注册商自动验证【推断】。需要用户在 GSC 设置里确认。
- **路径迁移不需要 Change of Address**。Google 原文：该工具 "only to domain migrations"，"unnecessary for… moving paths within the same domain"。域名属性本身已覆盖 http、https、www、apex，换托管不影响属性。
- **Google 的要求**（site-move-with-url-changes 文档）：服务端 301/308 是首选；跳转"at least 1 year"；新 URL 要有自指 canonical、更新 hreflang、提交新 sitemap；"it can take a few weeks or more" 才会稳定。
- **建议**：
  1. 迁移前加一个 URL 前缀属性 `https://www.word-by-word.app/` 作为备份，用 HTML meta 或 GA 验证。
  2. 切换后提交 `sitemap.xml`。可以临时再提交一份只含旧 URL 的 `sitemap-legacy.xml`（2 到 4 周后删除），加快 Google 发现那些跳转。
  3. 观察"已重定向的网页""备用网页（有适当的规范标记）"计数是否按预期上升。
  4. 用 Bing Webmaster Tools 从 GSC 导入（可选）。

### 3.10 回滚方案

| 场景 | 回滚动作 | 耗时 | 前提 |
|---|---|---|---|
| 新版内容或样式有 bug | CF Deployments 里 Rollback 到上一个部署，或 `git revert` 后 push 发布分支 | 秒级或约 1 分钟 | — |
| CF 平台或证书出问题 | Squarespace 里把 www 的 CNAME 改回 `super-monster.github.io` | 秒级（TTL 5s） | GitHub Pages 还没 Unpublish，自定义域名配置还在，**证书在 2026-12-23 之前有效** |
| 回滚到 GitHub 后新 URL 404 | GitHub 上跑的是旧站，`/ja/` 这类新 URL 会 404，旧 URL 都正常 | — | 可以接受，回滚只是短期止血。如果要无损回滚，就让 (a) 的 Actions 部署同一份 `dist` 加 meta refresh 桩到 GitHub Pages，形成双托管热备，代价是多一个 workflow |
| 发现 SEO 严重下滑 | 不要回滚 URL 结构，来回改动更伤。先查 canonical、hreflang、跳转链、noindex 有没有误配 | — | — |

---

## 4. `js/site-notice.js` 应急公告在新架构中的保留

### 4.1 现状【已验证】
- 开关在 `js/site-notice.js:3` 的 `enabled: false`；20 种语言的文案写在 `translations` 里（`:4-125`）。
- locale 先按文件名映射（`:137-161` 的 `filenameLocaleMap`，键是 `ja-top.html` 等），映射不到再回退到 `<html lang>`（`:163-178`）。
- 公告是 JS 运行时注入的 `position: fixed` 横幅，并会根据它自身高度调整 `body > header` 的 `top` 和 `.nav-spacer` 的高度（`:304-330`）。
- `surfenglish-promo.js` 的推广条会读取 `.wbw-service-notice` 的高度来堆叠（`:153-200`，相对行号），两个脚本是耦合的。
- 所有 24 个 HTML 都引入了它（含 `chrome-extension/privacy.html:17`）。
- 历史上实际用过：`a9ac0c6` 于 2026-05-22 打开，`1151f55` 于 2026-05-27 关闭。在 GitHub Pages 上，从 push 到所有人可见最长约为构建 1.5 分钟加 CDN 600 秒，约 12 分钟。
- iOS App 和 Chrome 扩展都不读取这个公告（grep `site-notice` 无结果）。

### 4.2 新架构下的问题
- URL 改成 `/ja/` 后，`pathname.split('/').pop()` 得到空字符串，文件名映射全部失效，只能回退到 `<html lang>`。回退本身可用：`zh-Hans` 归到 zh-CN，`zh-Hant` 归到 zh-TW，`pt-BR` 归到 pt。但映射表成了死代码。
- 如果沿用 SurfEnglish 的 `_headers`（`/js/* Cache-Control: public, max-age=86400`），**一个不带指纹的 `site-notice.js` 最长会被缓存 1 天**，在事故场景下是致命的。
- 运行时注入加上 fixed 定位会造成 CLS。Google 渲染器也可能把公告文字收进摘要，出现"翻译服务不可用"这样的 snippet。

### 4.3 推荐设计
1. **单一数据源** `src/notice.json`：
   ```json
   { "enabled": false, "level": "outage", "updated": "2026-05-22",
     "hideSurfEnglishBar": true,
     "copy": { "en": {"eyebrow":"…","title":"…","message":"…"}, "ja": {…}, … } }
   ```
   20 种语言的文案从现有 `site-notice.js:4-125` 原样迁入，键名对齐新 locale 码。
2. **构建期静态渲染**：`enabled` 为 true 时，build 在每页 `<body>` 开头输出 `<div class="site-notice" role="status" data-nosnippet>…</div>`。用正常文档流（sticky 或 static），不用 fixed，也不用 JS 去量高度；同时不渲染 SurfEnglish 推广条（`hideSurfEnglishBar`）。这样没有 CLS，不依赖 JS，`data-nosnippet` 防止进入搜索摘要。
3. **生效路径**：编辑 `notice.json`，`git push origin main:cloudflare-deploy`，CF 构建约 1 分钟，HTML 的 `max-age=0` 让它即时生效。在 README 写一份运维手册，并附手动通道：本地 `node build.mjs && npx wrangler pages deploy dist`，用于 GitHub 不可用时。
4. **如果必须保留运行时 JS**（比如想做到"不重新构建也能开关"，但静态托管下其实做不到），文件名必须带指纹，由 build 改写 HTML 里的引用；或者在 `_headers` 里给 `/js/site-notice*.js` 单独设 `max-age=0`，并排在 `/js/*` 规则前面。locale 一律从 `<html lang>` 取。
5. 不要把公告开关放到后端 API 上：公告恰恰是在后端故障时才需要。

---

## 5. 其它风险

| # | 风险 | 证据 / 说明 | 措施 |
|---|---|---|---|
| 5.1 缓存 | GitHub 固定 600 秒，无法改；CF 默认 HTML、CSS、JS 都是 `max-age=0`（每次 304 协商），图片可以设 immutable | §1.2；SurfEnglish 的 `_headers` | 图片和 CSS/JS 用文件名指纹（照搬 SurfEnglish `build.mjs:25-28` 的 `fingerprint()` 和 `:45-46`）再配 immutable；HTML、`notice`、`robots`、`sitemap` 保持 `max-age=0` |
| 5.2 CNAME 文件 | (a) 走 Actions 时 CNAME 文件被忽略，靠 Settings 保存；(b) 不需要 CNAME | GitHub 文档原文见 §3.1 | 迁移后删除，避免误导 |
| 5.3 大小写敏感 | GitHub 和 CF 都区分大小写【已验证两边】；**macOS 本地 APFS 默认不区分**，`python3 -m http.server` 预览会掩盖问题。仓库里有 `img/en/language_setting_en.PNG`、`select_language_en.PNG`（大写扩展名）以及 `Screenshot-1.png` | `git ls-files` | 构建时把输出文件名统一成小写，并用 `git ls-files` 的精确列表做大小写敏感的引用校验；不通过就构建失败 |
| 5.4 已有坏链 | `img/Screenshot-2/3/4.png` 不存在，20 个页面引用后线上 404 | §1.5 P6 | 上面的构建校验会兜住 |
| 5.5 `.nojekyll` 与下划线目录 | 只在"分支部署"模式下有关：Jekyll 会丢弃 `_` 开头的文件和目录，还会处理带 YAML front matter 的文件里的 Liquid 语法 `{{ }}`。现在 `README.md` 作为静态文件原样发布（optional-front-matter 插件把 README 列入黑名单），`backup/` 也被发布 | §1.2 | (a) 用 Actions 部署可以绕开 Jekyll；如果坚持分支部署，`dist` 根目录放 `.nojekyll`。CF 天然不跑 Jekyll，但 `_redirects`、`_headers` 是 CF 的保留文件名，留在 GitHub 上也无害 |
| 5.6 点文件 | 仓库跟踪了 `.DS_Store`、`img/.DS_Store`（git status 显示 `.DS_Store` 有修改） | `git ls-files` | 新增 `.gitignore`；build 拷贝 public 时过滤掉点文件 |
| 5.7 子域接管 | 域名没有在 GitHub 做账户级验证（challenge TXT 为空）。如果将来 www 又指回 github.io，而本仓库已经 Unpublish，别人可以认领 `www.word-by-word.app`。反过来，如果删除 CF 项目时 CNAME 还指着 `<project>.pages.dev`，该项目名可能被他人重新注册 | §1.3 | 迁移收尾时做 GitHub 域名验证（§3.6 第 12 步）；永远不要先删托管再改 DNS |
| 5.8 pages.dev 重复内容 | 见 §3.2 | — | 绝对 canonical，加上 `_headers` 里的 `https://:project.pages.dev/*  X-Robots-Tag: noindex`（要确认不影响自定义域名） |
| 5.9 HTTP 版本 200 | GitHub 当前 HTTP 返回 200 | §1.2 | (a) 勾选 Enforce HTTPS；(b) CF 默认跳 https |
| 5.10 本地预览与线上行为不一致 | `python3 -m http.server`（README 推荐）不模拟 `_redirects` 和 pretty-URL；SurfEnglish 用的 `npx serve dist` 会默认去掉 `.html`，与 CF 相似但不完全一致 | `README.md` "Preview locally"；SurfEnglish `package.json` 的 `serve` | 以 CF preview 部署为验收标准；本地可选 `npx wrangler pages dev dist` |
| 5.11 页面重量 | 首页约 15 MB 图片、没有 lazy；原图 1530×3036 的 PNG | §1.5 P7 | 用户要求"不新增素材"，但对**现有素材重新编码或缩放**（webp/avif 加多尺寸 `srcset`）不算新增素材。为保持 SurfEnglish 那种"零依赖构建"，建议用本地脚本（macOS `sips` 或 `cwebp`）**预生成并提交**，不在 CF 构建时引入 sharp |
| 5.12 CSP 与第三方 | 如果照搬 SurfEnglish `_headers`，其中的 `X-Frame-Options: DENY` 等对本站无害；以后加 CSP 时要放行 `www.googletagmanager.com`、`*.google-analytics.com`、`tools.applemediaservices.com`、`apps.apple.com` | SurfEnglish `public/_headers` | — |
| 5.13 推广条 JS 依赖文件名 | `surfenglish-promo.js:459-466` 同样用文件名映射 locale（`:31-54` 写着 "mirrors site-notice.js"），新路径下会回退到 `<html lang>` | — | 新架构下推广区块改为构建期渲染（04 号报告的范畴） |
| 5.14 品牌词冲突 | 存在同名竞品 WordByWord.io（`https://wordbyword.io/en`，还有同名 Chrome 扩展 `chromewebstore.google.com/detail/wordbyword-…/nnikiceohfnfopndpmmkkeojiijhcbbg`） | WebSearch 结果 | 不是基础设施问题，但品牌词首页排名（1.6）是迁移时最该保护的资产，再次说明 `/` 不能动 |
| 5.15 时间窗 | GitHub 证书 2026-12-23 到期；Squarespace 域名 2027-02-03 到期 | §1.3、§1.4 | 迁移安排在 11 月中旬之前，保证回滚窗口至少 4 周；域名续费另外提醒 |

---

## 6. 风险登记表（开工用）

| ID | 风险 | 概率 | 影响 | 缓解 | 阶段 |
|---|---|---|---|---|---|
| R1 | 契约 URL `/privacy.html` 在 CF 被 308 或 404 | 中（不处理就必然被 308） | 高（App Review、App 内链接） | §3.5 的 C-1，preview 实测；兜底 C-2 | 构建与预览 |
| R2 | 切换时 CF 证书窗口出现 TLS 错误 | 中 | 低（几分钟） | 流量低谷切换、先绑定域名、TTL 5s 可回滚 | 切换 |
| R3 | 有人顺手做 NS 迁移导致 API 中断 | 低（只要遵守本方案） | **极高** | 本项目明确禁止改 NS；b-full 另立项，并先处理 DNSSEC | 全程 |
| R4 | 旧语言页 301 漏配或跳成链 | 中 | 中 | 由 build 从 locale 表自动生成 `_redirects`，加上 §7 脚本断言"单跳且目标 200" | 构建 |
| R5 | canonical 或 hreflang 写成 pages.dev 或相对路径 | 中 | 中 | `SITE.url` 常量；构建期断言 | 构建 |
| R6 | 首页品牌词排名波动 | 低 | 高 | `/` 不变；title 和 H1 保留 "WordByWord"；Search Console 每日观察 2 周 | 观察期 |
| R7 | 应急公告被长缓存 | 中（照搬 `_headers` 时） | 高（事故期间） | §4.3 构建期渲染，或给文件加指纹 | 构建 |
| R8 | GA 事件维度断层 | 高 | 低 | 保留 section id；加 content_group | 模板 |
| R9 | GSC 验证失效 | 低 | 中 | 先加一个备用 URL 前缀属性；不迁 NS | 准备 |
| R10 | 大小写或坏图问题被本地预览掩盖 | 高 | 低到中 | 构建期做大小写敏感校验 | 构建 |
| R11 | 回滚目标（GitHub）证书过期 | 时间触发 | 中 | 2026-12-23 前完成观察期；需要更长时就做双托管 | 观察期 |
| R12 | pages.dev 被索引 | 低 | 低 | canonical 加 noindex 头 | 构建 |

---

## 7. 切换前后验收脚本（草案，在 preview 和正式域名各跑一次）

```bash
BASE=${1:-https://www.word-by-word.app}
# 1) contract URLs must be 200 (no redirect)
for p in / /privacy.html /support.html /chrome-extension/ /chrome-extension/privacy.html; do
  printf "%-36s " "$p"; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "$BASE$p"; done
# 2) legacy URLs must be a single 301 hop to a 200 target, query preserved
for l in en cn zh tw ja ko es pt vi id th hi ar de fr it nl pl ru tr uk; do
  for v in "/$l-top.html" "/$l-top"; do
    loc=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$BASE$v?utm_source=t")
    tgt=$(echo "$loc" | awk '{print $2}'); code2=$(curl -s -o /dev/null -w "%{http_code}" "$tgt")
    echo "$v -> $loc -> $code2"; done; done
# 3) headers
curl -sI "$BASE/" | grep -iE "^HTTP|server|cache-control|x-robots"
# 4) canonical / hreflang absolute
curl -s "$BASE/ja/" | grep -oE '<link rel="(canonical|alternate)"[^>]+>' | head
# 5) 404
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/definitely-missing"
```
通过标准：
- 第 1 组全部 200。
- 第 2 组都是 `301 <新 URL>?utm_source=t -> 200`。
- 第 3 组：CF 上显示 `server: cloudflare`；HTML 的 `cache-control` 是 `max-age=0`。
- 第 4 组的 href 全部以 `https://www.word-by-word.app/` 开头。
- 第 5 组返回 404，并且是自定义 404 页。

---

## 8. 需要用户确认或提供的信息（开工前）

1. GSC 域名属性 `word-by-word.app` 的**验证方式**（设置 → 所有权验证）：是 CNAME 令牌还是注册商自动验证？它决定 R9 和 b-full 的可行性。
2. Squarespace 域名后台是否可以直接编辑 DNS，即 Google Cloud DNS 托管的区域是否可编辑。还要导出完整 DNS 记录，确认除了 www/api/backend/backend-test 之外是否还有别的记录。
3. Chrome 扩展**是否已上架 CWS**，隐私政策 URL 填的是什么（决定 C6 的级别）。
4. GitHub Pages 当前设置截图：Enforce HTTPS、Source、自定义域名。
5. 是否同意用 SurfEnglish 那个 Cloudflare 账号新建 Pages 项目；发布分支用 `cloudflare-deploy` 还是 `main`。
6. 新语言路径命名的最终决定：是否与 SurfEnglish 对齐使用 `zh-hans`/`zh-hant`；葡语用 `pt` 还是 `pt-br`。
7. 是否愿意在下一个 WordByWord 版本里把 ASC 的 Marketing URL 按本地化改成 `/xx/`（§2.3），以及是否拿得到 ASC 的 Provider Token 来做 SurfEnglish 的 campaign link（§3.8）。
