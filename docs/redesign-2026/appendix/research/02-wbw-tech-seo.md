# 02 · WordByWord 官网技术 SEO 审计（代码 + 线上）

- 审计日期：2026-10-05
- 范围：仓库 `/Users/ike/Dev/WordByWord/wordbyword-web`（HEAD `7a389ba`，2026-08-23）+ 线上 `https://www.word-by-word.app`
- 标注约定：**[事实]** = 有文件行号、命令输出或 URL 直接证明；**[推断]** = 基于事实与 Google 公开文档的判断，需 GSC 数据或实测确认。
- 线上与仓库一致性 **[事实]**：`curl` 下载线上 `/`、`index.html`、`en/ja/zh/cn/tw/de-top.html`、`privacy.html`、`support.html`、`chrome-extension/`、`js/surfenglish-promo.js`、`css/style.css`，与仓库文件 `cmp` 全部字节一致（线上 `Last-Modified: Sun, 23 Aug 2026 08:14:40 GMT`）。所以下文对仓库的结论同样适用于线上。

---

## 0. 结论速览（TL;DR）

"英语以外关键词几乎不命中"不是单一原因造成的。按影响大小排序：

| # | 类别 | 根因 | 严重度 |
|---|---|---|---|
| 1 | 架构 / 可发现性 | 20 个语言页是**孤岛**：站内没有任何可抓取链接指向它们（首页、页脚、导航都没有语言切换），也**没有 sitemap.xml**（404）和 hreflang。Google 只能靠外链发现它们。用 WebSearch 精确搜索这些页面的标题，返回的都只有英文首页 `/` | **P0 致命** |
| 2 | 关键词 / 定位 | 品牌名 "WordByWord / word by word" 本身是英文短语，非英语用户不会用母语去搜它。各语言 title 都是"品牌 + 泛化的'智能语言学习助手'"，不含该语言用户真实会搜的功能词（如双语对照、网页翻译、对訳、번역 앱、iPhone、App 等）。同时有同名竞品 **wordbyword.io**（Chrome 扩展，en/ru/de 共 634 个 URL）在抢品牌词 | **P0/P1 高** |
| 3 | 内容质量 | 20 个非英语页的 hero 加 6 个功能图**全部是同一张图**（7 个 URL，MD5 相同），另外 3 张截图 404。正文只有约 550 词，内容停留在早期版本（App Store 现有的"语块 / X 优化 / 本地翻译"都没写）。这类页面容易被判定为模板化的薄内容 | **P1 高** |
| 4 | 重复 / 规范化 | 没有 canonical；`/`、`/index.html`、`/en-top.html` 三个 URL 几乎是同一页；`cn-top.html` 与 `zh-top.html` 字节完全相同；无扩展名 URL（`/ja-top`）和 http 版本都返回 200；`backup/*.html` 共 6 个旧页面公开可访问，也没有 noindex | **P1 中高** |
| 5 | 技术基础 | robots.txt 和 sitemap 都 404；用的是 GitHub 默认 404 页；**HTTP 没有跳转到 HTTPS**；**apex 域名 `word-by-word.app` 没有 DNS 记录**；没有 OG、Twitter Card、JSON-LD、apple-itunes-app | **P1 中** |
| 6 | 性能 / CWV | 单页图片 14–17 MB；首屏 hero 是 1.6–1.7 MB 的 PNG（1530×3036）；图标原图 1024² 约 1 MB，却只显示成 72px；所有 `<img>` 都没写 width/height，也没有 lazy；JS 插入的顶部条会把整页往下推 | **P1 中**（移动端 LCP 大概率不及格） |
| 7 | JS 注入推广 | SurfEnglish 区块和顶部条只靠 JS 生成。不执行 JS 的爬虫（含 AI 爬虫）看不到；Google 渲染后又会把"学英语"这个 H2 排在 WBW 自己的"Key Features"前面，冲淡页面主题 | **P2 中低** |

---

## 1. `<head>` 逐页审计

### 1.1 缺失项矩阵 [事实]

在全站 HTML（不含 backup）里检索 `hreflang|rel="canonical"|og:|twitter:|ld+json|name="robots"|theme-color|apple-itunes-app|apple-touch-icon|manifest`，**一条也没有**。

| 元素 | index / 20 语言页 | privacy / support | chrome-extension/ | 备注 |
|---|---|---|---|---|
| `<title>` | 有 | 有 | 有 | 见 1.2 |
| meta description | 有 | **无** | 有（privacy 无） | |
| canonical | **无** | 无 | 无 | |
| hreflang | **无** | — | — | |
| og:* / twitter:* | **无** | 无 | 无 | 分享到 X、LINE、微信、Slack 时没有预览图和标题 |
| JSON-LD | **无** | 无 | 无 | 没有 WebSite、MobileApplication、Organization 实体 |
| meta robots | 无（默认 index） | 无 | 无 | 可以接受 |
| theme-color | 无 | 无 | 无 | |
| apple-itunes-app | **无** | 无 | — | 没有 Safari 智能横幅（WBW 是 iOS 应用，这是最直接的转化入口） |
| apple-touch-icon / manifest | 无 | 无 | 无 | |
| favicon | `favicon.ico`（只含 16×16 和 32×32） | **privacy/support 没有 favicon 链接** | `../favicon.ico` | Google 搜索结果的网站图标建议大于 48×48，现在只有 32px |
| `<html lang>` | 正确（ar 带 `dir="rtl"`；cn/zh 为 zh-CN，tw 为 zh-TW） | en | zh-CN | Google 不用 lang 判断语言（见 2.3），但对无障碍有意义 |

参考对象 SurfEnglish（`/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite/dist/index.html` 头部）：canonical、12 语 hreflang + x-default、apple-itunes-app、og（1200×630）、twitter、`max-image-preview:large` robots、JSON-LD `@graph`（WebSite / Person / WebPage …）一应俱全，`dist/sitemap.xml` 也带 `xhtml:link` 和 `image:image`。**注意别照搬的一处**：SurfEnglish 的 `og:locale` 写成 `zh_Hans`、`ja` 这类非标准值，规范格式是 `zh_CN`、`ja_JP`。

### 1.2 title / description 长度与定位（逐语言）[事实 + 评估]

长度按 Unicode 字符计。经验阈值（[推断]，Google 实际按像素截断）：title 拉丁字母约 50–60 字、CJK 约 28–32 字；description 拉丁字母约 150–160 字、CJK 约 80–100 字。

| 页面 | title（字符数） | desc 字符数 | 评估 |
|---|---|---|---|
| index / en-top | `WordByWord - Your Smart Language Learning Assistant`（51） | 212（超长） | 品牌 + 泛化描述。没有 translate、bilingual、iPhone、app。desc 写的是 "swiping text **in your browser**"，会让人以为是浏览器扩展，和同名竞品 wordbyword.io 的扩展更难区分 |
| zh-top / cn-top | `WordByWord - 外语学习翻译助手`（21） | 52 | 太短，空间浪费。没有"双语对照、网页翻译、iPhone、App" |
| tw-top | `WordByWord - 外語學習翻譯助手`（21） | 52 | 同上；App Store 台湾区名称是 "WordByWord翻譯"，网站没有对齐 |
| ja-top | `WordByWord - 外国語学習翻訳アシスタント`（26） | 64 | 没有"対訳 / 翻訳アプリ / 英語 / iPhone"。desc 用的"なぞる"和 App Store 日文版用的"スワイプ"不一致 |
| ko-top | `WordByWord - 스마트 외국어 학습 도우미`（27） | 95 | 没有 "번역 앱 / 웹페이지 번역 / 아이폰" |
| es-top | `… Tu Asistente Inteligente para Aprender Idiomas`（59） | 224（超长） | 没有 "traductor / traducir páginas web / iPhone" |
| fr-top | `… Votre Assistant Intelligent d'Apprentissage des Langues`（68，会被截断） | 252（超长） | |
| it-top | `… Assistente intelligente per l'apprendimento delle lingue`（69，会被截断） | 223 | |
| de-top | `WordByWord – Ihr smarter Sprachlern-Assistent`（45） | 210 | 没有 "Übersetzer / Webseite übersetzen / iPhone" |
| pt-top | `… Assistente inteligente para aprender idiomas`（57） | 210 | 内容是巴西葡语（出现 "você"、"tela"），hreflang 应写 pt-BR |
| ru-top | `… Ваш умный помощник в изучении языков`（49） | 199 | desc 和 H3 里有拼写错误"**посрочное**"（应为 построчное），`ru-top.html:7`、`:70` |
| uk-top | `… Ваш розумний помічник для вивчення мов`（51） | 185 | |
| vi / id / th / hi / ar / nl / pl / tr | 33–49 | 162–229 | 全部套用同一模板"品牌 + 智能语言学习助手" |

小结 [事实]：21 个 title 都是 `WordByWord - <泛化"智能语言学习助手">` 的结构，没有一个提到 iPhone、iPad 或 App。正文里 "iPhone" 出现 0 次，"iOS" 只在订阅说明里出现 1 次（`index.html:193`）。拉丁语系的 description 普遍 190–250 字，会被截断。

### 1.3 候选功能词命中矩阵 [事实；候选词本身是推断]

用脚本检查各页是否包含该语言用户可能会搜的功能词。T=title，D=description，H=h1–h3，B=正文，`-`=完全没有出现：

```
en  bilingual[B] translate web page[-] parallel[-] side by side[-] iPhone[-] iPad[-] Safari[-] learn English[-] dictionary[-] text to speech[-] translation app[-] translator[-]
zh  双语[-] 对照[HB] 网页翻译[-] 划词翻译[HB] 逐句翻译[D] 沉浸式[-] 英语阅读[-] 学英语[-] iPhone[-] 查词[HB] 词典[-] 朗读[B] 翻译App[-]
tw  雙語[-] 對照[HB] 網頁翻譯[-] 劃詞翻譯[HB] 逐句翻譯[D] 英文閱讀[-] iPhone[-] 查單字[-] 字典[-]
ja  対訳[DHB] 翻訳アプリ[-] ウェブページ[B] 英語[-] 英文[-] iPhone[-] 辞書[HB] 発音[-] 読み上げ[B] 単語[B]
ko  번역 앱[-] 웹페이지 번역[-] 대조[DHB] 원문[B] 영어 공부[-] 아이폰/iPhone[-] 사전[-] 발음[DHB]
es  traductor[-] traducir páginas[-] página web[B] bilingüe[B] aprender inglés[-] iPhone[-] diccionario[HB]
de  Übersetzer[-] Webseite übersetzen[-] zweisprachig[B] Englisch lernen[-] iPhone[-] Wörterbuch[HB] Aussprache[-]
fr  traducteur[-] page web[B] bilingue[B] apprendre l'anglais[-] iPhone[-] dictionnaire[HB]
pt  tradutor[-] bilíngue[B] aprender inglês[-] iPhone[-] dicionário[-]
ru  переводчик[-] веб-страниц[B] параллельн[-] двуязычн[B] английск[-] iPhone[-] словарь[HB]
vi  dịch trang web[-] song ngữ[B] học tiếng Anh[-] iPhone[-] từ điển[-] ứng dụng dịch[-]
```

英文页正文词频（558 词）：translat 3.2%、word 2.3%、AI 1.8%、sentence 1.4%、swipe 1.4%、bilingual 0.2%、iPhone、browser、dictionary、English 都是 0。中文页正文 946 个汉字："翻译"13 次、"双语"0 次、"英语"1 次。

**结论**：高意图词（"双语对照、网页翻译、翻译 App、iPhone、parallel / bilingual reading"）几乎都只零星出现在正文里，没有进入 title、description、H1。页面的语义重心是"泛化的语言学习助手"，在各语种里都是竞争最激烈、区分度最低的说法。

### 1.4 品牌一致性与品牌冲突 [事实]

- 站内同时出现两种写法：H1 和 logo alt 写 "Word by Word"（`index.html:30,47`），privacy/support 的 title 写 "… | Word by Word"，其余地方写 "WordByWord"。App Store 名称：美区 "WordByWord Translate"，台湾区 "WordByWord翻譯"，其余区 "WordByWord"（来源：`itunes.apple.com/lookup?id=6741724502&country=…`）。
- **同名竞品**：wordbyword.io 也叫 "WordByWord"（Chrome 扩展，在 Chrome Web Store 占着 "WordByWord" 这个名字）。它的 sitemap 有 634 个 URL，分 en 245 / ru 198 / de 191，并且有大量博客文章（如 "Best Translation Extensions for Chrome in 2026"）。在 WebSearch 结果里它和 word-by-word.app 并排出现，ru、de 品牌词基本被它占住。另外 "Word by Word" 还是 Kory Stamper 的书名和一本 Picture Dictionary 的书名，英文品牌词本身就有歧义。
- 本站的 `chrome-extension/` 子站也打 "WordByWord Chrome 扩展"，但它的 CTA 只指向 `https://chrome.google.com/webstore`（通用首页，`chrome-extension/index.html:243`），站内也没有任何页面链接到它，是个孤岛页。品牌混淆风险高。
- 附带发现（ASO）[事实]：美区 App Store 描述第一行是内部备注 **"English concise submission version"**（lookup API 的 `description` 字段开头），建议尽快在 App Store Connect 删除。

---

## 2. 多语言架构

### 2.1 URL 清单与问题 [事实]

| 现 URL | 内容 | 问题 |
|---|---|---|
| `/`、`/index.html` | 英文 | 同一文件。`/index.html` 也返回 200，没有 canonical |
| `/en-top.html` | 英文 | 和 index.html 只差 1 行注释（`diff` 结果：只有第 185 行注释不同），完全重复 |
| `/zh-top.html`、`/cn-top.html` | 简体中文 | **字节完全相同**（`diff` 无输出）；"cn" 是国家码，不是语言码 |
| `/tw-top.html` | 繁体中文 | "tw" 是地区码 |
| `/uk-top.html` | 乌克兰语 | uk 确实是乌克兰语的 ISO 639-1 代码，但人和工具常误读为英国 |
| `/pt-top.html` | 巴西葡语 | 内容是 pt-BR |
| `/<xx>-top.html` × 其余 15 个 | 各语种 | 命名本身不影响 Google 识别语言（Google 不看 URL，见 2.3），但 `-top.html` 没有语义，也不利于以后迁到目录式结构 |
| `/ja-top`（无扩展名） | 同 ja-top.html | GitHub Pages 自动返回 200，形成第二个 URL |
| `http://www.…/*` | 全部 | **HTTP 返回 200，不跳 HTTPS**（`curl -v http://www.word-by-word.app/` → `HTTP/1.1 200 OK`）。而且 `super-monster.github.io/wordbyword-web/` 会 301 到 **http**://www.word-by-word.app/，说明 GitHub Pages 的 "Enforce HTTPS" 没开 |
| `word-by-word.app`（apex） | — | **DNS 没有 A/AAAA 记录**（`dig +short word-by-word.app A` 为空；`curl` 报 `Could not resolve host`）。用户手动输入不带 www 的域名，或者别人外链到 apex，都会直接打不开，外链权重丢失 |
| `/backup/top.html`、`top.jp.html`、`sample.html`、`top-1/2/3.html` | 旧版中文、日文页 | 线上返回 200，没有 noindex（例：`backup/top.html` → 200，16796 B）。它们的标题（如"网页原文对照翻译 · AI英语助手"）和 zh/ja 页主题重叠 |
| `/README.md` | 仓库说明 | 线上 200，`text/markdown`，泄露了内部配置说明（低风险） |

### 2.2 站内链接图：语言页是孤岛 [事实]

脚本提取了每个页面的全部 `href`：

- `index.html` 和 20 个 `*-top.html` 的站内链接**只有** `privacy.html`、`support.html`、锚点（`#features`、`#faq`…）和 `css`/`favicon`。logo 链接是 `href="#"`（`index.html:30`），**连首页都不链**。
- 全站只有一处链接指向语言页：`chrome-extension/index.html:319 → ../zh-top.html`，而 `chrome-extension/` 本身没有任何站内入链。
- `js/surfenglish-promo.js:31-53` 和 `js/site-notice.js:140-160` 里的 `xx-top.html` 只是"文件名 → locale"的映射表，不会生成链接。
- `privacy.html` 除了 mailto 之外没有任何链接（`privacy.html:117`），是死胡同；`support.html` 只链 privacy。

**含义** [推断，强]：Google 发现 URL 主要靠链接和 sitemap，现在两样都没有，20 个语言页只能靠外部反链或手动提交才会被发现。即使被发现，它们也拿不到任何站内链接权重。

### 2.3 没有 hreflang 时 Google 如何处理 [事实：Google 文档；推断：适用到本站]

Google 文档（https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites）明确说：

- "Google uses the visible content of your page to determine its language. We don't use any code-level language information such as `lang` attributes, or the URL."
- 建议在页面上放其它语言版本的链接，让用户可以切换；避免按语言自动跳转；用 hreflang 帮助搜索结果链接到正确的语言版本；目录式结构（`example.com/de/`）是推荐方案之一。

套到本站 [推断]：

1. 文件名 `cn`、`tw`、`uk` 本身不会让 Google 认错语言。真正的问题是**发现、收录和聚类**，而不是命名。
2. 没有 hreflang 时，每个语言页都是独立页面，没有"同一内容的不同语言版本"这层关系。结果是：非英语用户搜品牌词时，Google 只能给出唯一有权重、被收录的英文首页 `/`。这和 WebSearch 的观察完全一致：日语、韩语、德语、中文的品牌 + 功能词查询都只返回 `https://www.word-by-word.app/`，标题也是英文的 "Your Smart Language Learning Assistant"（见 §6）。
3. hreflang 必须互相回指，而且只有在各语言 URL 都被收录、都是 canonical 时才生效。所以顺序必须是：先解决可发现性和 canonical，再加 hreflang。

### 2.4 重复内容风险清单 [事实；影响为推断]

1. 英文首页内容在 `/`、`/index.html`、`/index`、`/en-top.html`、`/en-top` 都返回 200，再乘以 http/https 两种协议，最多 10 个 URL。
2. 简体中文：`zh-top`、`cn-top` × 扩展名 / 无扩展名 × 协议，共 8 个 URL，内容完全相同。
3. 其余每个语言页 4 个 URL（协议 × 扩展名）。
4. `backup/` 下 6 个旧页面和 zh/ja 主题重叠。
5. 20 个非英语页的版式、图片、FAQ 结构完全一样，只有文字是翻译的。这本身不算重复内容（不同语言），但配合"同图 ×7 + 3 张坏图"和薄内容，容易被归入 "Crawled – currently not indexed"。[推断]

现实影响 [推断]：变体 URL 只有被链接到才会被发现。但 github.io 的 301 指向 http 版本，这会主动制造 http 变体。修复代价很低：开启 Enforce HTTPS、加自引用 canonical、删除或 noindex 重复页。

### 2.5 建议目标 URL 映射（供设计阶段使用，对齐 SurfEnglish 方案）[建议]

| 旧 URL | 新 URL | hreflang |
|---|---|---|
| `/`（保持不动，承接现有流量） | `/` | `en` + `x-default` |
| `/index.html`、`/en-top.html` | → `/` | — |
| `/zh-top.html`、`/cn-top.html` | `/zh-hans/` | `zh-Hans` |
| `/tw-top.html` | `/zh-hant/` | `zh-Hant` |
| `/pt-top.html` | `/pt-br/` | `pt-BR` |
| `/uk-top.html` | `/uk/` | `uk` |
| `/<xx>-top.html`（ja ko es de fr it nl pl ru tr vi id th hi ar） | `/<xx>/` | `<xx>` |
| `/backup/*` | 删除，或 noindex | — |

SurfEnglish 用的是 `zh-hans`、`zh-hant`、`pt-br`、`ja`… 共 12 个（`SurfEnglishWebsite/build.mjs:50-63`）。WBW 用同一套 path 命名，两站的 promo 互链和 hreflang 心智模型就能一致。

**GitHub Pages 无法发 301**，有两种做法：(a) 在旧 URL 放 stub 页，内容为 `<meta http-equiv="refresh" content="0; url=/ja/">`，再加 `rel=canonical` 指向新 URL。Google 把即时 meta refresh 视为永久重定向 [事实：Google "Redirects and Google Search" 文档]。(b) 迁到 Cloudflare Pages，用 `_redirects` 做真正的 301（见 §3.4）。

---

## 3. 爬取 / 索引基础设施

### 3.1 robots / sitemap / 404 [事实，curl 输出]

```
https://www.word-by-word.app/robots.txt            → HTTP/2 404 （GitHub 默认 404 页，9379 B）
https://www.word-by-word.app/sitemap.xml           → HTTP/2 404
https://www.word-by-word.app/this-page-does-not-exist-xyz → HTTP/2 404，<title>Page not found · GitHub Pages</title>
https://www.word-by-word.app/img/Screenshot-2.png  → 404（被 20 个页面引用）
```

- 仓库里没有 `404.html`、`robots.txt`、`sitemap.xml`、`.nojekyll`、`_config.yml`，也没有 Search Console 验证文件或 meta。apex 没有 TXT 记录，所以无法用 DNS 验证"网域资源"。[推断] 现在的 GSC 资源很可能是 URL 前缀资源（https://www…），或者是通过 GA 标签验证的，这种资源**看不到 http 变体的数据**。
- 对照：surfenglish.app 的 robots.txt 和 sitemap.xml 都返回 200。

### 3.2 域名与跳转 [事实]

| 请求 | 结果 |
|---|---|
| `http://word-by-word.app/`、`https://word-by-word.app/` | `Could not resolve host`，apex 没有 A 记录 |
| `www.word-by-word.app` | CNAME → `super-monster.github.io.`（185.199.108–111.153） |
| `http://www.word-by-word.app/` | **200**（没有跳 HTTPS） |
| `https://www.word-by-word.app/` | 200 |
| `https://super-monster.github.io/wordbyword-web/` | 301 → **http**://www.word-by-word.app/ |
| `/chrome-extension` | 301 → `/chrome-extension/`（正常） |
| `/Index.html` | 404（大小写敏感，正常） |
| NS | `ns-cloud-c1~c4.googledomains.com` |

需要修复的是：给 apex 加 A 和 AAAA 记录，指向 GitHub Pages 的 4 个 IP。两者都配置好后，GitHub 会自动做 apex ↔ www 跳转。另外要在仓库 Settings → Pages 里勾选 "Enforce HTTPS"。

### 3.3 响应头 [事实]

HTML、CSS、PNG 都是 `cache-control: max-age=600`，`server: GitHub.com`，`via: 1.1 varnish`，`content-encoding: gzip`（没观察到 br）。1.2 MB 的截图也只缓存 10 分钟。没有 HSTS、`X-Robots-Tag` 或任何安全头。

### 3.4 托管平台能力边界：GitHub Pages vs Cloudflare Pages（SurfEnglish 现用）

| 能力 | GitHub Pages（现状） | Cloudflare Pages |
|---|---|---|
| 自定义响应头（Cache-Control、X-Robots-Tag、安全头） | 不支持（实测所有资源固定 600s） | `_headers`（SurfEnglish 已经用了：图片 `max-age=31536000, immutable`） |
| 301 重定向 | 不支持，只能用 meta refresh 或 JS | `_redirects` |
| 自定义 404 | 支持（根目录 `404.html`） | 支持 |
| 强制 HTTPS / apex 跳转 | 支持，但目前没配置 | 支持 |
| 无扩展名 URL 自动 200 | 会，无法关闭，会产生变体 URL | 默认把 `.html` 308 到无扩展名 URL |
| 构建步骤（node build.mjs） | 要么用 GitHub Actions 发布 Pages，要么把产物提交进仓库 | 原生支持 |
| Jekyll 陷阱 | 没有 `.nojekyll` 时默认跑 Jekyll，**以 `_` 开头的文件会被忽略**，照搬 `_headers` 不会生效 | — |

[推断] 如果复用 SurfEnglish 的生成器模式，有两条路。一是留在 GitHub Pages，用 Actions 部署 `dist/`，重定向用 meta refresh stub，缓存头接受现状。二是迁到 Cloudflare Pages，拿到 301 和缓存头。迁移的风险在 DNS：现在 NS 是 Google Cloud DNS，`www` 的 CNAME 可以直接改指 `*.pages.dev`；apex 要么也托管到 Cloudflare，要么只做 www 跳转。这是设计阶段需要拍板的事项。

---

## 4. 内容可抓取性

### 4.1 SurfEnglish 推广（JS 注入）对 SEO 的影响

实现方式 [事实]：
- 静态 HTML 里只有 `<link rel="stylesheet" href="css/surfenglish-promo.css">` 和 `<script src="js/surfenglish-promo.js" defer>`（`index.html:10,22`），**页面里没有一个字是关于 SurfEnglish 的**。
- 推广区块通过 `anchor.insertAdjacentElement('afterend', section)` 插在 `#hero` 后面（`surfenglish-promo.js:509-549`），包含 `<h2 class="wbw-se-promo__title">`。顶部条在 `body.insertBefore(bar, body.firstChild)` 插入（`:559-588`），运行时机是 DOMContentLoaded 或 defer 执行时（`:663-664`）。
- 链接是 `target="_blank" rel="noopener"`，没有 nofollow，URL 带 `?utm_source=word-by-word.app&utm_medium=referral&utm_campaign=surfenglish_launch`（`:23,476`）。
- 语言映射：de、fr、it、nl、pl、ru、tr、uk 的 `sitePath: ''`（`:289-422`），也就是这些语种的用户会被送到 SurfEnglish 的英文根目录，因为 SurfEnglish 只有 12 种语言。

影响：
1. **不执行 JS 的抓取器看不到** [事实]：WebFetch 抓取 `/` 和 `/ja-top.html`，结果是 "SurfEnglish 一词未出现"，链接列表里也没有 surfenglish.app。[推断] Bing 和 Naver 渲染有限，Baidu 基本不渲染，GPTBot、ClaudeBot、PerplexityBot 等 AI 爬虫不执行 JS，所以从这些渠道给 SurfEnglish 引流和传递链接信号的效果接近 0。Google 渲染后能看到，但要排进第二阶段渲染队列。
2. **主题稀释** [事实：渲染后 DOM]：在浏览器里渲染 ja-top.html 后，H2 的顺序是 `["本当に興味のあるものを読んで、英語を身につける。", "主な機能", "画面プレビュー", …]`，也就是第一个 H2 讲的是另一个 App 的"学英语"。WBW 自己支持 20 种语言互译，现在页面主题被"英语学习"抢了先。[推断] 对 WBW 排名有轻度负面影响。
3. 跨站互链本身没问题：同一开发者的兄弟 App 推荐属于正常的编辑性链接。但每个页面同时放"顶部条 + 区块"两处，再加 UTM，看起来像广告位而不是推荐。SurfEnglish 那边也没有反向链接到 word-by-word.app（在 `SurfEnglishWebsite` 的 src/dist 里检索 `word-by-word` 无结果）。
4. privacy 和 support 页也会显示推广条（`privacy.html:17-19`）。App Store 审核员访问 support URL 时看到的是另一个 App 的广告。[推断] 低风险，但不够优雅。

**建议方向**（供设计阶段参考）：把 SurfEnglish 推荐改成**静态 HTML**，放在页面中后段，作为与 WBW 功能叙事相关的"进阶 / 兄弟应用"区块，用 H2 或 H3，这样所有爬虫都能看到；去掉每页都出现的 fixed 顶部条，或者改成非 fixed、在 HTML 里预留高度的静态条；de/fr/it 等 SurfEnglish 没有本地化页的语种，就直接链 App Store。

### 4.2 标题结构 [事实]

所有语言页结构一致：1 个 H1、4 个 H2、11 个 H3。
- H1 = `Word by Word<br>{泛化口号}`，例如 "Word by Word / Instant Translation, Smarter Language Learning"、"随划随译 智能学外语"、"なぞるだけで即翻訳 スマートに外国語学習"。品牌占了 H1 的一半，口号是泛化表述。
- H2 = "Key Features / App Preview / Free to Use, Unlock More with Upgrade / Frequently Asked Questions"，**不含任何功能词**。
- H3 = 6 个功能名 + 5 个 FAQ 问题。这部分最贴近搜索意图，但层级最低。
- privacy、support 只有 H1。

### 4.3 图片 alt 质量 [事实]

- 装饰性图标写了 "Swipe Translation Icon"、"History Icon" 这类 alt（`index.html:69,83…`），应该改成 `alt=""`。
- 截图 alt 只有 1–3 个词（"History"、"Customization"、"App Interface Example"），没有描述画面内容。
- **非英语页 alt 和图片内容不符**：ja、zh、de 等页面里，7 个不同的 alt（"スワイプ翻訳"、"ダブルタップ辞書"、"AI音声"…）指向的是**同一张图**（`img/Screenshot-1.png` 和 `img/feature_*_demo.png`，MD5 都是 `5d5463ff…`），对图片搜索和无障碍来说都是误导。
- **3 张坏图**：20 个非英语页都引用了 `img/Screenshot-2/3/4.png`（例：`ja-top.html:159-161`）。这三个文件在仓库里**从来没有存在过**（`git log --all -- img/Screenshot-2.png` 无记录），线上返回 404。
- `img/en/feature_context_demo.png` 和 `img/en/feature_doubletap_demo.png` 的 MD5 也相同，英文页"上下文解析"这一节放的是双击查词的截图。

### 4.4 正文体量与关键词密度 [事实]

见 1.3：英文 558 词，中文 946 个汉字。核心高意图词（bilingual、parallel、iPhone、对照阅读、网页翻译）密度接近 0。正文内容停留在早期版本，App Store 现有描述里的 "language chunks"、"Action Flow"、"optimized for X (Twitter)"、"Microsoft Azure / Google / local translation" 在网站上都没有出现（对比 WebSearch 抓到的 App Store 摘要与 `index.html` 正文）。页脚写着 "No personal data is collected"（`index.html:243`），但站点加载了 GA4，和 support 页 "except anonymous analytics" 的说法不一致（信任和合规层面的小问题）。

---

## 5. 性能 / Core Web Vitals 风险

### 5.1 图片清单（字节、像素）[事实：`stat` + `sips`]

| 文件 | 字节 | 像素 | 实际显示尺寸 | 备注 |
|---|---|---|---|---|
| img/Screenshot-1.png | 1,686,999 | 1530×3036 | hero 420×833 | 非英语页的 hero |
| img/feature_{swipe,doubletap,tts,context,history,customize}_demo.png | 各 1,686,999 | 1530×3036 | 330×655 | **6 个文件和 Screenshot-1 的 MD5 完全相同** |
| img/en/feature_context_demo.png | 1,747,453 | 1530×3036 | 330×655 | 和 doubletap_demo 是同一个文件 |
| img/en/feature_doubletap_demo.png | 1,747,453 | 1530×3036 | hero 420×833 | 英文页的 hero |
| img/en/feature_tts_demo.png | 1,574,218 | 1530×3036 | | |
| img/en/feature_history_demo.png | 1,256,214 | 1530×3036 | | |
| img/en/feature_swipe_demo.png | 1,240,369 | 1530×3036 | | |
| img/en/feature_customize_demo.png | 708,704 | 1530×3036 | | |
| img/en/more_definitions.png | 664,983 | 1530×3036 | 轮播 300px | |
| img/en/select_language_en.PNG | 202,750 | 1206×2622 | 轮播 300px | 扩展名是大写 .PNG |
| img/en/language_setting_en.PNG | 114,347 | 1206×2622 | 轮播 300px | |
| img/ChatGPT-feature_swipe.png | 1,120,595 | 1024×1024 | **72×72** | 图标 |
| img/feature_doubletap.png | 1,018,082 | 1024×1024 | 72×72 | |
| img/feature_tts.png | 930,774 | 1024×1024 | 72×72 | |
| img/feature_history.png | 898,360 | 1024×1024 | 72×72 | |
| img/feature_context.png | 872,854 | 1024×1024 | 72×72 | |
| img/feature_customize.png | 854,935 | 1024×1024 | 72×72 | |
| img/ChatGPT-feature_swipe-2.png | 1,115,679 | 1024×1024 | — | **没有被引用** |
| img/feature_swipe.png | 540 | 32×32 | — | 没有被引用 |
| img/wbw_logo.png / wbw_logo.png | 7,575 | 192×192 | 40 / 36 | 两份相同 |
| img/surfenglish/feed / translate / word-raid.jpg | 139,281 / 135,034 / 187,906 | 600×1304 | 约 207×375 | promo 用，已写 width/height 和 lazy |
| img/surfenglish/icon-192.png | 18,073 | 192×192 | 28 / 56 | |
| favicon.ico | 5,238 | 16 + 32 | | |
| chrome-extension/img/*（14 张） | 1.4 KB–237 KB | 最大 1280×800 | | 体量合理 |

单页图片总量 [事实，脚本累加唯一 URL]：
- `index.html`：17 个本地图片 URL，**14.27 MB**，另有 SE promo 0.47 MB。
- `ja-top.html`、`zh-top.html`：**16.71 MB**。同一张 1.65 MB 的图通过 7 个不同 URL 被下载 7 次，约 11.5 MB 是重复下载。
- 6 个图标约 5.6 MB，按 72px 显示时每个只需要不到 10 KB（WebP、144px @2x）。
- 全站**没有一张** WebP/AVIF，也没有用 `<picture>` 或 `srcset`。

### 5.2 `<img>` 属性 [事实]

`index.html` 24 个 `<img>`，各语言页 20 个：**width/height 为 0 个，`loading` 为 0 个**，也没有 `decoding` 和 `fetchpriority`。只有 JS 注入的 promo 图带了 width/height、`loading="lazy"`、`decoding="async"`（`surfenglish-promo.js:405-406`）。App Store 徽章用的是 Apple 远程 SVG `…/black/en-us`，**所有语言页都用英文徽章**；promo 区块反而做了本地化徽章。

### 5.3 Render-blocking [事实]

`<head>` 里的阻塞资源只有 `css/style.css`（11,955 B，gzip 后 2,639 B）和 `css/surfenglish-promo.css`（9,865 B）。gtag 是 async，三个自有 JS（analytics 5.3 KB、site-notice 16.8 KB 且 `enabled:false`、promo 47 KB / gzip 后 15.8 KB）都是 defer。没有 Web 字体。**渲染阻塞不是瓶颈，瓶颈在图片。** 可以优化的点：site-notice.js 关闭时仍然每页加载 16.8 KB；promo.js 有 47 KB，其中大部分是 20 种语言的文案表。

### 5.4 LCP [推断，有计算依据]

移动端 hero 图显示为 70vw，约 262×520，面积大于标题文本块，很可能是 LCP 元素。它是 1.65–1.71 MB 的 PNG，没有 preload，也没有 `fetchpriority="high"`。在 Lighthouse "Slow 4G"（约 1.6 Mbps）条件下，光下载就要约 8 秒，**移动端 LCP 大概率超过 4 秒（Poor）**。（PageSpeed Insights API 今天返回 429 配额错误，没拿到实测值；CrUX 需要 API key。建议设计阶段在 GSC 的 Core Web Vitals 报告或 PSI 网页上补测。）

### 5.5 CLS 风险

机制 [事实，代码]：
1. 顶部条 `.wbw-se-bar` 是 `position: fixed`（`surfenglish-promo.css:34-44`），本身不会推动布局。但 `relayout()` 会把 `header.style.top` 设为条高，并把 `.nav-spacer` 的高度设为 64px + 条高（`surfenglish-promo.js:611-625`），也就是首屏所有内容往下移动一个条的高度。脚本在 DOMContentLoaded 前后执行（defer），如果浏览器在 promo.js 下载完之前已经完成首次绘制（慢网络下很常见），这次位移就会计入 CLS。条高实测：375px 宽时 **57.7px**（浏览器面板测得 `barH: 57.73`）。
2. ResizeObserver 会在条高变化时再次 relayout（`:631-632`），横竖屏切换或字体回退都会触发二次位移。
3. 主内容的 `<img>` 都没有尺寸。桌面 1024×768 下，hero 图（显示高度约 833px）加载前，下方的 promo 或 features 区块会先出现在视口下部，图片到达后被整体推出视口。

估算 [推断]：(1) 移动端约等于影响比例 1.0 × 距离比例 58/812 ≈ **0.07**；(3) 桌面约为影响比例 0.26 × 距离比例 1.0 ≈ **0.26**。两者叠加会超过 0.1 的"良好"阈值。实测记录：在浏览器面板里看到过一条 `layout-shift` 值为 **0.6057**，来源节点是 `hero`、`hero-image`、`HEADER`、`wbw-se-bar__text`，正好就是上面描述的"条高变化 → header 和 hero 下移"链路。但这次是在切换视口仿真时触发的，面板当时处于隐藏状态，没有 paint 记录，**不能当作真实用户的 CLS 值**，只能说明这条链路确实存在。

---

## 6. 线上收录 / 搜索观察（WebSearch，非 Google 引擎，只作旁证）

| 查询 | 本站出现的结果 |
|---|---|
| `site:word-by-word.app` | 只有 `https://www.word-by-word.app/`，标题 "WordByWord - Your Smart Language Learning Assistant"，摘要取自英文 meta description |
| `"word-by-word.app"` | 只有 `/`，其余被 Kory Stamper 的《Word by Word》等书占据 |
| `WordByWord app swipe to translate iPhone` | App Store 页面（ca）排在前面，`/` 排第 6 |
| `WordByWord 划词翻译 iPhone 逐句翻译` | **本站没有出现**，只出现 App Store 页面 |
| `WordByWord なぞるだけで即翻訳 外国語学習翻訳アシスタント`（日文页的原文 title 和 H1） | 只出现英文 `/`，ja-top.html 没出现；wordbyword.io 同时出现 |
| `WordByWord 스마트 외국어 학습 도우미 번역 앱`（韩文页的原文 title） | 只出现英文 `/` 和 App Store kr 页 |
| `"WordByWord" Sprachlern-Assistent …`（德文） | 只出现英文 `/`；wordbyword.io 和 betalist 同时出现 |
| `"WordByWord - 外语学习翻译助手"`（zh-top 的**精确 title**） | **没有 zh-top**，只有 `/`，另外还有 sourceforge 上的同名项目和 wordbyword.io |
| `"WordByWord" "Tu Asistente Inteligente para Aprender Idiomas"`（es 的精确 title） | 本站没有出现 |
| `word by word app bilingual reading translation below original iPhone` | `/` 排在第 10，前面是 LumoRead、Duoreader、duoBooks、Immersive Translate 等竞品 |

结论 [推断，强]：在这个搜索引擎里，**所有语言页都没有被检索到**，连精确 title 都搜不到，只有英文首页被收录或展示。这和 §2.2 的"孤岛"结构完全吻合。Bing 抓取返回的是无关结果（site: 被忽略），DuckDuckGo 返回了反爬页面，都没有绕过。**需要用户在 GSC 确认**：Pages 报告里 `*-top.html` 的状态（"已发现 – 尚未编入索引"还是"未被发现"），以及 URL 检查工具对 `ja-top.html` 的结果。

---

## 7. 根因排序（"英语以外关键词几乎不命中"）

| 排序 | 类别 | 根因 | 证据 | 严重度 |
|---|---|---|---|---|
| 1 | 架构 | 语言页没有站内入链、没有 sitemap、没有 hreflang，Google 很难发现，也无法和首页建立语言版本关系 | §2.2 链接提取；§3.1 sitemap 404；§6 精确 title 也搜不到 | **P0** |
| 2 | 关键词 | 品牌名是英文短语，非英语用户不会搜；title、H1、H2 都是"泛化学习助手"，不含母语功能词和 iPhone/App；同名竞品 wordbyword.io 抢品牌词 | §1.2、§1.3 矩阵；§1.4 | **P0/P1** |
| 3 | 内容 | 非英语页同图 ×7、坏图 ×3、alt 与图不符、正文薄且内容过时，收录价值低 | §4.3 MD5 和 404；§4.4 | **P1** |
| 4 | 规范化 | 没有 canonical；index/en-top 重复，cn/zh 完全相同；无扩展名和 http 变体；backup 页公开；apex 打不开 | §2.1、§2.4、§3.2 | **P1** |
| 5 | 技术 | 没有 OG/Twitter/JSON-LD/智能横幅；用 GitHub 默认 404；没有 robots；HTTPS 未强制 | §1.1、§3 | **P1/P2** |
| 6 | 性能 | 单页 14–17 MB，hero 1.7 MB PNG，图片无尺寸，JS 条导致位移，移动端 LCP 和 CLS 风险高（页面体验） | §5 | **P1/P2** |
| 7 | JS 推广 | SE 内容只在 JS 渲染后出现，非 Google 引擎和 AI 爬虫看不到；渲染后又冲淡 WBW 主题 | §4.1 | **P2** |

[推断] 第 1 条修好之前，第 2–7 条的优化对非英语流量几乎没有作用；只修第 1 条、不修第 2 和第 3 条，页面会被收录，但排名有限。

---

## 8. 给设计阶段的输入

### 8.1 修复清单（按优先级）

**P0（架构与发现）**
1. 迁到目录式多语言 URL（映射见 §2.5），每页加自引用 canonical，加 21 个 hreflang（20 种语言 + x-default）并互相回指。
2. 全站页头放可抓取的语言切换 `<a href>` 链接，页脚放语言索引；logo 链接改成 `/` 或对应语言根目录。
3. 生成 `sitemap.xml`，带 `xhtml:link` 的 hreflang 和 `image:image`，再加 `robots.txt`（`Sitemap:` 一行）。提交到 GSC，并对 20 个新 URL 逐个请求编入索引。
4. 旧 URL 用 meta refresh + canonical 的 stub（留在 GitHub Pages 时），或 `_redirects` 301（迁到 Cloudflare 时）。`cn-top.html` 和 `zh-top.html` 都指向 `/zh-hans/`；`en-top.html` 和 `index.html` 指向 `/`（`/index.html` 无法单独重定向，靠 canonical 处理）。

**P1（关键词、内容、规范化、基础 meta）**
5. 每种语言重写 title、description、H1、H2：功能词在前，品牌在后，加上 iPhone/iPad/App。description 按语种控制长度。H2 从"Key Features"改成"功能词式"标题（例："iPhone 网页双语对照翻译"）。具体词表交给关键词研究产出（本报告只证明现状没有这些词）。
6. 非英语页的 hero 和功能图换成对应功能的截图，去掉同图复用，修掉 3 张坏图。`/Users/ike/Dev/WordByWord/Resources/wbw_jp/`、`wbw_zh/`、`wbw_en/` 里已有本地化截图（1284×2778，7 张或更多），属于"现有素材"，**需要用户确认能否使用**。
7. 正文和 App Store 现有描述对齐，补上 X 优化、语块、本地翻译、多引擎这些内容；FAQ 增加按功能意图写的问题。
8. 加 OG/Twitter 元标签。og:image 需要 1200×630，现有素材里没有现成的，可以用截图在构建时拼一张，或先用 logo 加 summary card。加 `apple-itunes-app app-id=6741724502`、`theme-color`、apple-touch-icon（192px logo 可以直接用）。
9. 加 JSON-LD：`WebSite`（name/alternateName，影响搜索结果里显示的站点名）、`MobileApplication`（operatingSystem iOS、applicationCategory EducationalApplication、offers price 0、sameAs App Store）、Organization 或 Person，以及 SurfEnglish 作为同一开发者的 `isRelatedTo` / `sameAs` 关联。[事实] 各区评分数接近 0（cn 只有 1 条评分，均分 2），**不能写 aggregateRating**，所以拿不到软件富结果，JSON-LD 的价值主要在实体识别。另外 FAQ 富结果自 2023 年起只对权威政府和医疗站展示，FAQPage 只当语义标注用。
10. 开启 Enforce HTTPS；apex 加 A/AAAA；删除 `backup/` 和线上的 `README.md`，或改成 noindex；添加自定义 `404.html`（多语言，带首页和语言链接）。

**P2（性能与推广）**
11. 图片转 WebP 并给 2–3 档 `srcset`：截图约 660w/990w，图标 144w。全部写上 width/height；首屏 hero 加 `fetchpriority="high"`，其余加 `loading="lazy"`。预计单页从约 15 MB 降到 1 MB 以内（[推断]，WebP q≈80 时 1530×3036 截图缩到 990w 约 60–120 KB）。
12. SurfEnglish 推荐改成静态 HTML，放在功能区之后、CTA 附近，作为"同一团队的英语进阶应用"。去掉 fixed 顶部条，或改成静态、预留高度的条；不在 privacy/support 页显示；没有对应语言页的语种直接链 App Store。保留 `data-ga-*` 埋点。

### 8.2 难点与风险

- **现有流量集中在 `/`（英文）**：`/` 的 URL、title 主语义和主要内容都要稳住，只做增量改写，避免已有的品牌词排名掉下去。建议分两步：先上线架构和元数据（URL、hreflang、sitemap、canonical），观察 2–4 周 GSC 数据，再改文案。
- **GitHub Pages 发不了 301**：meta refresh 能被 Google 接受，但其它引擎和外链的信号传递弱一些，另外 stub 页会以"已重定向"状态出现在 GSC。如果迁到 Cloudflare Pages，要改 DNS（现在 NS 在 Google Cloud DNS），apex 方案也要一起定。
- **引入构建步骤**：复用 SurfEnglish 的 `build.mjs` 模式后，20 种语言 × 1 个模板，文案要从现有 HTML 抽成 locales JSON，工作量主要在抽取文案和人工校对（ru 已经有拼写错误）。GitHub Pages 默认跑 Jekyll，产物里有 `_` 开头的文件会被忽略，需要 `.nojekyll`。
- **品牌冲突**：wordbyword.io 同名，并且占了 Chrome Web Store 的名字。本站的 `chrome-extension/` 子站如果扩展没上架，建议 noindex 或下线，避免和竞品混淆、浪费抓取预算。是否保留**需要用户决定**。
- **推广与定位的平衡**：从 JS 注入改成静态 HTML 后，SurfEnglish 的文字会正式成为 WBW 页面内容的一部分。篇幅和位置要克制（建议不超过一屏、位置靠后、用 H2 或 H3），否则会进一步稀释 WBW 的主题。
- **双横幅冲突**：同时加 WBW 的 `apple-itunes-app` 智能横幅和 SE 的顶部条，Safari 里会出现两条横幅。建议移除 SE 顶部条。
- **验证依赖**：根因 1 的最终确认依赖 GSC（索引覆盖、URL 检查）。CWV 实测依赖 PSI 或 CrUX（今天 API 配额用完）。需要用户提供 GSC 截图或导出数据，作为改版前的基线。

### 8.3 待用户确认的问题
1. GSC 是哪种资源类型（网域还是 URL 前缀）？`*-top.html` 在 GSC 里的索引状态是什么？
2. 托管是留在 GitHub Pages，还是迁到 Cloudflare Pages（和 SurfEnglish 统一）？
3. `Resources/wbw_jp`、`wbw_zh`、`wbw_en` 的本地化截图算不算"现有素材"，可不可以用？
4. `chrome-extension/` 子站保留、noindex 还是下线？
5. 美区 App Store 描述开头的 "English concise submission version" 是否已经知道（建议修正）？

---

## 附录：关键命令与证据来源

- 头部、标题、图片统计：在仓库根目录用 python 正则解析 `index.html`、`*-top.html`、`privacy.html`、`support.html`、`chrome-extension/*.html`。
- 重复检测：`diff index.html en-top.html`（只差第 185 行注释）；`diff cn-top.html zh-top.html`（相同）；`md5 -r img/*.png img/en/*`。
- 图片尺寸：`stat -f %z` 加 `sips -g pixelWidth -g pixelHeight`。
- 线上：`curl -sS -o /dev/null -D -`（各 URL 头部）；`dig +short word-by-word.app A|NS|TXT`；线上文件与仓库 `cmp`。
- App Store：`https://itunes.apple.com/lookup?id=6741724502&country={us,jp,cn,kr,de,es,tw,fr,br}`。
- 竞品：`https://wordbyword.io/sitemap.xml`（634 个 `<loc>`，en 245 / ru 198 / de 191）。
- Google 文档：https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- SurfEnglish 对照：`/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite/dist/index.html`、`dist/sitemap.xml`、`dist/_headers`、`build.mjs:50-63,117-120,173-176`。
