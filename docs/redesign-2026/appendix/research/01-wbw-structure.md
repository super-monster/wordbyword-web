# 01 · WordByWord 官网结构与内容审计

- 审计对象：`/Users/ike/Dev/WordByWord/wordbyword-web`（GitHub `super-monster/wordbyword-web`，**public 仓库**，`main` 分支，GitHub Pages + `CNAME=www.word-by-word.app`）
- 审计基线：HEAD `7a389ba`（2026-08-23，加入 SurfEnglish promo）。线上与 HEAD 一致：`curl -sI https://www.word-by-word.app/` → `last-modified: Sun, 23 Aug 2026 08:14:40 GMT`、`content-length: 11664`（= 本地 `index.html` 字节数）。
- 审计日期：2026-10-05。标注约定：**[事实]** = 已用文件/命令/URL 验证；**[推断]** = 基于证据的判断，需进一步确认。
- 本次只读，未修改任何项目文件。

---

## 0. 关键结论（按对 SEO / 重构的影响排序）

1. **[事实] 20 个非英语语言页几乎是“孤岛”**：全站没有语言切换器、没有 hreflang、没有 sitemap.xml、没有 robots.txt。唯一指向语言页的内部链接是 `chrome-extension/index.html:319 → ../zh-top.html`，而 `chrome-extension/` 本身又没有任何页面链接到它。`grep -rn -- '-top\.html'` 在 HTML 中只命中这一处。→ 这是“英语以外关键词几乎不命中”的**最直接结构性原因**（搜索引擎很难发现/理解这些页面的语言对应关系）。
2. **[事实] 所有页面 `<head>` 只有 3 个 meta**（charset / viewport / description）：无 canonical、无 hreflang、无 OG/Twitter、无 JSON-LD、无 `apple-itunes-app`、无 apple-touch-icon、无 theme-color（`grep -iE 'hreflang|canonical|og:|ld\+json|apple-itunes-app|apple-touch-icon|theme-color'` 非 backup 范围 0 命中）。
3. **[事实] 重复 URL 无 canonical**：英语内容至少 4 个 URL（`/`、`/index.html`、`/en-top.html`、`/en-top`，均 200）；`cn-top.html` 与 `zh-top.html` **字节完全相同**（md5 均为 `63d6a8cd…`），再加上无扩展名变体，简中也是 4 个 URL。`index.html` 与 `en-top.html` 仅差一行注释（`index.html:185`）。
4. **[事实] 非英语页截图全部失效或重复**：20 个非英语页的 hero + 6 个功能图 + 轮播第 1 张共 8 处引用的 7 个文件（`img/Screenshot-1.png`、`img/feature_*_demo.png`）**是同一张图**（md5 全为 `5d5463ff…`，1530×3036，一张 VOA 网页截图，不展示任何具体功能）；轮播第 2–4 张 `img/Screenshot-2/3/4.png` **在仓库与 git 历史中都不存在**（线上 404），即每个非英语页 3 张破图、共 60 处断链。
5. **[事实] 单页图片体积 15–17.5 MB**：英文页 17 个本地图片共 ~15.0 MB，日文页 ~17.5 MB；功能小图标是 1024×1024 PNG（~0.9–1.1 MB/张）却以 72×72 显示；所有 `<img>` 无 width/height、无 `loading="lazy"`。
6. **[事实] 线上公开暴露 `backup/`**：6 个旧版草稿页（`/backup/top.html` 等）线上 200、可被索引、图片相对路径全部断（41 个缺失引用），且无 GA；内容为“英语学习翻译助手”等旧定位，与正式页形成重复/低质内容。
7. **[事实] 域名层问题**：裸域 `word-by-word.app` **没有 A/AAAA 记录**（`dig @8.8.8.8 word-by-word.app A` → NOERROR, ANSWER: 0；`curl https://word-by-word.app/` → `Could not resolve host`）；`http://www.word-by-word.app/` 直接 200 未重定向 https（GitHub Pages “Enforce HTTPS” 未开启，.app 虽在 HSTS preload 中，浏览器会自动升级，但爬虫可见 http 副本）。
8. **[事实] 文案与产品现状多处不符**：网站称 Plus 有“无限 AI 发音”“自定义主题与夜间模式”、可“自定义翻译/查词快捷键”；源码显示 Plus 发音为每日 100/200 次上限、主题切换是空实现、无快捷键设置；而 App 已有的本地翻译引擎、Azure/Google 云引擎、语块提取（Chunk Extraction）、书签、X 优化等**网站完全没提**（详见 §3.6）。
9. **[事实] SurfEnglish 推广是 JS 运行时注入**（`js/surfenglish-promo.js`），在每页顶部加固定公告条 + 在 `#hero` 后插入深色大卡片，卡片的 `<h2>` 成为 WBW 页面 H1 之后的第一个 H2。[推断] 与“WBW 定位不变、顺带推荐”目标存在张力；且推广内容不在静态 HTML 中，SEO 传递依赖爬虫 JS 渲染。
10. **[事实] 维护成本高**：22 个落地 HTML 手工同步（每页 ~57 个文本节点 + 24 个 alt ≈ 80 条可译字符串 × 20 语言 ≈ 1,600 条散落在 HTML 中）；GA 片段复制 26 份；文件名→locale 映射在 `site-notice.js` 与 `surfenglish-promo.js` 中各写一份。

---

## 1. 文件 / 页面清单与职责

### 1.1 Git 跟踪文件（`git ls-files`，共 79 个）

| 路径 | 大小 | 职责 | 被谁链接 | 备注 |
|---|---|---|---|---|
| `index.html` | 11,664 B | 根页（英语） | 无（站点入口） | 与 `en-top.html` 仅差 1 行注释 |
| `en-top.html` | 11,584 B | 英语落地页 | 无 | 重复页 |
| `ar/de/es/fr/hi/id/it/ja/ko/nl/pl/pt/ru/th/tr/uk/vi-top.html` | 10.5–17 KB | 17 个语言落地页 | 无 | 孤岛 |
| `zh-top.html` | 11,139 B | 简中落地页 | `chrome-extension/index.html:319` | |
| `cn-top.html` | 11,139 B | 简中落地页 | 无 | 与 zh-top **完全相同** |
| `tw-top.html` | 10,533 B | 繁中落地页 | 无 | |
| `privacy.html` | 4,469 B | App 隐私政策（英文） | 22 个落地页页脚、`support.html:130,141`；**iOS App 硬编码**：`WordByWordPrototype/.../SubscriptionView.swift:68`、`MoreSettingsView.swift:168` | 无返回首页链接（死胡同页） |
| `support.html` | 4,811 B | 支持页（英文） | 22 个落地页页脚、chrome-ext 页脚 | 无返回首页链接；[推断] App Store Connect Support URL |
| `chrome-extension/index.html` | 13,945 B | Chrome 扩展落地页（仅 zh-CN） | **无任何页面链接** | 商店链接为占位符（§8） |
| `chrome-extension/privacy.html` | 9,040 B | 扩展隐私政策（英文） | 无（index 页未链接） | [推断] 供 Chrome Web Store 后台使用 |
| `chrome-extension/style.css` | 14,556 B | 扩展页独立样式 | | 紫色渐变 + emoji 模板风 |
| `chrome-extension/img/*.png` | 13 个，1.1 MB | 扩展页素材 | | `hero-screenshot.png` = `screenshot-3.png`（md5 相同）；`text-attribution.png` 未被引用 |
| `css/style.css` | 11,955 B | 主站共享样式 | 22 落地页 | 见 §6 |
| `css/surfenglish-promo.css` | 9,865 B | SurfEnglish 推广样式 | 24 页（落地页 + privacy/support）+ chrome-ext | |
| `js/analytics.js` | 5,291 B | GA4 点击自动埋点 | 26 页 | 见 §7.1 |
| `js/site-notice.js` | 16,778 B | 服务故障横幅（默认关） | 26 页 | 见 §7.2 |
| `js/surfenglish-promo.js` | 47,056 B | SurfEnglish 公告条 + 推广区块 | 25 页（chrome-ext/privacy 除外） | 见 §7.3 |
| `img/`（根） | 27 MB | WBW 截图/图标 | | 见 §4 |
| `img/en/` | 8.8 MB / 9 文件 | 英文截图 | 仅 `index.html`、`en-top.html` | |
| `img/surfenglish/` | 4 文件 / ~480 KB | 推广素材（600×1304 jpg + 192 icon） | promo JS 运行时 | |
| `wbw_logo.png` / `img/wbw_logo.png` | 7,575 B ×2 | Logo（192×192） | header 用根目录那份、footer 用 img/ 那份 | 两份 md5 相同 |
| `favicon.ico` | | 16/32 双尺寸 | `<link rel=icon>` | 无 apple-touch-icon |
| `backup/*.html` | 6 文件 / 100 KB | 历史草稿 | 无 | **线上公开 200**（§5） |
| `CNAME` | | `www.word-by-word.app` | | |
| `README.md` | 1,787 B | 仓库说明 | | **线上可访问** `/README.md` 200 |
| `.DS_Store`、`img/.DS_Store` | | macOS 垃圾文件 | | 已提交入库（线上 404，被 Jekyll 排除） |

另：`origin/dev` 分支停在 2025-06（`ae33a7c Adjust line height…`），与 main 相差 51 文件，[推断] 已废弃，可删除以免误部署。

### 1.2 托管行为（[事实]，curl 验证）

| URL | 结果 | 含义 |
|---|---|---|
| `https://www.word-by-word.app/` | 200 | 主入口 |
| `http://www.word-by-word.app/` | 200（无跳转） | 未强制 HTTPS |
| `https://word-by-word.app/` | DNS 解析失败 | 裸域无 A 记录（NS 为 Google Cloud DNS `ns-cloud-c*.googledomains.com`） |
| `/ja-top`（无扩展名） | 200 | GitHub Pages 自动补 `.html` → 又一组重复 URL |
| `/robots.txt`、`/sitemap.xml` | 404 | 不存在 |
| `/backup/top.html`、`/backup/sample.html` | 200 | 草稿公开 |
| `/README.md` | 200 | 原样输出 |
| `/.DS_Store`、`/CNAME` | 404 | 被 Jekyll 排除 |
| `/img/Screenshot-2.png` | 404 | 断图 |
| `/img/en/language_setting_en.png` vs `.PNG` | 404 vs 200 | 大小写敏感 |
| 任意不存在路径 | 404（GitHub 默认 404 页，9,379 B） | 无自定义 404 |

仓库无 `.nojekyll`、无 `_config.yml` → GitHub Pages 走默认 Jekyll 构建（下划线/点开头文件会被排除）。GitHub Pages **不支持服务端 301 与自定义 Header**。

---

## 2. 页面间链接关系与可发现性

### 2.1 导航 / 页脚 / 语言切换（[事实]）

- **Header**（所有落地页结构相同，如 `index.html:27-42`）：Logo 链到 `#`（只回到本页顶部，不回首页，`index.html:30`）；3 个锚点 `#features / #screenshots / #faq`；“Download App” 按钮被注释掉（`index.html:39`）。
- **Hero CTA**：`<a href="#cta" class="btn-primary">Download on App Store</a>`（`index.html:54`）→ 只是页内跳转到底部 CTA，**不是 App Store 链接**。全页唯一 App Store 链接在 CTA 区（`index.html:186`）。
- **Footer**（`index.html:246-256`）：`privacy.html`、`support.html`、`#faq`。无产品链接、无语言列表、无 SurfEnglish 链接、无 Chrome 扩展链接。
- **语言切换**：不存在。无 `<link rel="alternate" hreflang>`。无基于 `Accept-Language` 的跳转（静态托管也做不到服务端协商）。
- **privacy.html / support.html**：无 header/footer、无返回首页链接；support 仅链接 privacy 与 mailto（`support.html:121-141`）。
- **chrome-extension/index.html**：页脚链接 `../zh-top.html`（“iOS 应用”）、`../privacy.html`（注意：链到的是 **App 的**隐私政策，而非 `chrome-extension/privacy.html`，`chrome-extension/index.html:324`）、`../support.html`。

### 2.2 各语言页如何被发现（[事实] + [推断]）

```
外部链接 / 直接输入 ──► /  (index.html, en)
                         ├─► #anchors
                         ├─► privacy.html ─► (mailto)
                         └─► support.html ─► privacy.html
（无链接）  ar/de/es/fr/hi/id/it/ja/ko/nl/pl/pt/ru/th/tr/uk/vi/tw/cn/en-top.html
（无链接）  chrome-extension/index.html ─► ../zh-top.html, ../privacy.html, ../support.html
（无链接）  chrome-extension/privacy.html ─► index.html
（无链接）  backup/*.html
```

- [事实] 站内唯一入站到语言页的路径是孤岛页 chrome-extension → zh-top。
- [推断] 语言页只能靠外部链接（如 App Store 开发者页的营销 URL、社交帖子）或偶然抓取被发现；没有 hreflang 时，即使被索引，Google 也会把它们当作互不相关的独立页面，并倾向把 `/`（英文）展示给所有语言用户。这与“流量集中在 `word by word` 英文品牌词”的现象一致。
- [事实] 补充：WebSearch `site:word-by-word.app`（2026-10-05）只返回根页 `WordByWord - Your Smart Language Learning Assistant`；搜索 `"word-by-word.app" WordByWord` 结果中混有大量同名产品（`wordbyword.io`、`wordbyword.app`、Chrome 商店的 “WordByWord – Vocabulary Highlighter”、Quran Word by Word、Kory Stamper 的书）。[推断] “word by word” 是高度通用词 + 存在同名竞品，品牌词之外的长尾词才是机会。需 GSC 数据确认（§10）。

### 2.3 URL 体系问题汇总

| 问题 | 证据 | 影响 |
|---|---|---|
| 英语 4 个等价 URL | `/`、`/index.html`、`/en-top.html`、`/en-top` 均 200 | 权重分散、重复内容 |
| 简中 4 个等价 URL | `cn-top.html` ≡ `zh-top.html` + 无扩展名变体 | 同上 |
| 命名不规范 | `cn` / `tw` 非 BCP-47；`-top` 后缀无语义；`pt` 实为巴葡、`zh` 实为简中 | hreflang 需映射为 `zh-Hans`/`zh-Hant`/`pt-BR` |
| http / https 双份 | http 200 无跳转 | 需在 GitHub Pages 开 Enforce HTTPS |
| 裸域不可达 | 无 A 记录 | 输入 `word-by-word.app` 的用户直接失败 |

---

## 3. 21 个语言页一致性矩阵

> 实际是 **22 个落地 HTML（`index.html` + 21 个 `*-top.html`）= 20 种语言**（en 两份、zh-CN 两份）。与 iOS App 的 20 个 UI 语言完全对应（`Localizable.xcstrings`：ar, de, en, es, fr, hi, id, it, ja, ko, nl, pl, pt-BR, ru, th, tr, uk, vi, zh-Hans, zh-TW）。

### 3.1 共同骨架（[事实]，脚本解析全部 22 页）

- `<section id>` 顺序完全一致：`hero → features → screenshots → cta → faq`（+ JS 注入的 `#surfenglish` 在 hero 之后）。
- 每页 H1 = `Word by Word<br>{本地化标语}`（如 `index.html:47`）—— **H1 用的是带空格的通用词 “Word by Word”，不是品牌名 “WordByWord”**；H2 × 4（功能/预览/下载订阅/FAQ），H3 × 11（6 功能 + 5 FAQ）。
- FAQ 均为 5 条（无 FAQPage schema）；`support.html` 另有 4 条英文 FAQ（`<dl>`）。
- App Store 链接：全部 `https://apps.apple.com/app/6741724502`（缺 `id` 前缀但 Apple 会 302 到 `/us/app/wordbyword-translate/id6741724502`，可用）；`target="_blank"` 无 `rel`、无 `pt`/`ct` 归因参数。
- App Store 徽章：**全部 22 页都用英文 `.../black/en-us`**（`tools.applemediaservices.com`，现 302 到 `toolbox.marketingtools.apple.com`），alt 一律英文 “Download on the App Store”。而 promo JS 已使用本地化徽章（`ja-jp`、`zh-cn`…），两套不一致。
- 页脚链接一致：privacy / support / #faq；© 年份全部 **2025**。
- `<head>`：全部只有 charset / viewport / description；GA4 `G-QS1CJY8YWL` 内联；4 个外部脚本。
- 内联样式：每页 5 处 `style=""`（CTA `<ul>`、App Store `<a>`、徽章 `<img>`、页脚 `<p>`、空白 `<div style="flex:1 1 100%">`）；`ar-top.html:23` 另有 `<style>body{direction:rtl}</style>`（与 `<html dir="rtl">` 重复）。

### 3.2 逐页矩阵

列说明：title 长度/description 长度为字符数；“截图”A = `img/en/*`（英文真实截图），B = `img/Screenshot-1.png` + `img/feature_*_demo.png`（**同一张 VOA 截图**）+ 3 张缺失图。

| 文件 | `<html lang>` | title（字符） | desc（字符） | H1 第二行 | 截图 | 徽章 | © | 主要问题 |
|---|---|---|---|---|---|---|---|---|
| index.html | en | WordByWord - Your Smart Language Learning Assistant (51) | 212（>160 会截断） | Instant Translation, Smarter Language Learning | A | en-us | 2025 | 与 en-top 重复；FAQ Q4 “The initial version…”（过时） |
| en-top.html | en | 同上 (51) | 212 | 同上 | A | en-us | 2025 | 重复页 |
| ar-top.html | ar, dir=rtl | WordByWord - مساعدك الذكي لتعلم اللغات (38) | 162 | ترجمة فورية وتعلم لغات ذكي | B | en-us | 2025 | “تحديد”(选中) 描述手势；RTL 下 h3 `text-align:left`（style.css:300） |
| cn-top.html | zh-CN | WordByWord - 外语学习翻译助手 (21) | 52 | 随划随译 智能学外语 | B | en-us | 2025 | **≡ zh-top.html** |
| de-top.html | de | WordByWord – Ihr smarter Sprachlern-Assistent (45) | 210 | Sofort übersetzen, smarter Sprachen lernen | B | en-us | 2025 | 唯一用 en dash “–” 的 title |
| es-top.html | es | WordByWord - Tu Asistente Inteligente para Aprender Idiomas (59) | 224 | Traducción instantánea, aprendizaje inteligente de idiomas | B | en-us | 2025 | desc 过长 |
| fr-top.html | fr | WordByWord - Votre Assistant Intelligent d'Apprentissage des Langues (68) | 252 | Traduction instantanée, apprentissage intelligent des langues | B | en-us | 2025 | title/desc 过长 |
| hi-top.html | hi | WordByWord - आपकी स्मार्ट भाषा सीखने की सहायक (45) | 191 | तुरंत अनुवाद, स्मार्ट भाषा सीखना | B | en-us | 2025 | 语法错误（§3.4） |
| id-top.html | id | WordByWord - Asisten Pintar Belajar Bahasa (42) | 217 | Terjemahan Instan, Belajar Bahasa Lebih Pintar | B | en-us | 2025 | |
| it-top.html | it | WordByWord - Assistente intelligente per l'apprendimento delle lingue (69) | 223 | Traduzione istantanea, apprendimento linguistico intelligente | B | en-us | 2025 | “Seleziona per tradurre”（选中≠右滑）；页脚缺“版权所有”句并合并为 1 行（it-top.html:237） |
| ja-top.html | ja | WordByWord - 外国語学習翻訳アシスタント (26) | 64 | なぞるだけで即翻訳 スマートに外国語学習 | B | en-us | 2025 | 页脚 “All rights reserved.” 未翻译（ja-top.html:237） |
| ko-top.html | ko | WordByWord - 스마트 외국어 학습 도우미 (27) | 95 | 즉시 번역, 똑똑한 외국어 학습 | B | en-us | 2025 | 页脚缺版权句（ko-top.html:237） |
| nl-top.html | nl | WordByWord - Jouw Slimme Taalhulp (33) | 202 | Direct Vertalen, Slimmer Talen Leren | B | en-us | 2025 | |
| pl-top.html | pl | WordByWord - Twój inteligentny asystent nauki języków (53) | 214 | Błyskawiczne tłumaczenie, inteligentna nauka języków | B | en-us | 2025 | 标题“przesuwaniem”(滑动) 与正文/FAQ“zaznaczenie”(选中) 自相矛盾（pl-top.html:70 vs :49,:171,:201） |
| pt-top.html | pt（文案为巴西葡语） | WordByWord - Assistente inteligente para aprender idiomas (57) | 210 | Tradução instantânea, aprendizado inteligente de idiomas | B | en-us | 2025 | “Selecione para traduzir”；lang 应为 pt-BR；页脚缺版权句 |
| ru-top.html | ru | WordByWord - Ваш умный помощник в изучении языков (49) | 199 | Мгновенный перевод, умное изучение языков | B | en-us | 2025 | 错字“посрочное”（§3.4） |
| th-top.html | th | WordByWord - ผู้ช่วยอัจฉริยะสำหรับการเรียนรู้ภาษา (49) | 172 | แปลทันที เรียนภาษาต่างประเทศอย่างชาญฉลาด | B | en-us | 2025 | |
| tr-top.html | tr | WordByWord - Akıllı Dil Öğrenme Asistanınız (43) | 194 | Anında Çeviri, Akıllı Dil Öğrenme | B | en-us | 2025 | 正文“seçerek”(选中) vs 标题“Kaydırarak”(滑动) |
| tw-top.html | zh-TW | WordByWord - 外語學習翻譯助手 (21) | 52 | 隨劃隨譯 智慧學外語 | B | en-us | 2025 | FAQ 混入英文 UI 名 “Word History”（tw-top.html:225） |
| uk-top.html | uk | WordByWord - Ваш розумний помічник для вивчення мов (51) | 185 | Миттєвий переклад — розумне вивчення мов | B | en-us | 2025 | 用词错误（§3.4） |
| vi-top.html | vi | WordByWord - Trợ lý học ngoại ngữ thông minh (44) | 179 | Dịch tức thì, học ngoại ngữ thông minh | B | en-us | 2025 | 页脚缺版权句 |
| zh-top.html | zh-CN | WordByWord - 外语学习翻译助手 (21) | 52 | 随划随译 智能学外语 | B | en-us | 2025 | 混入英文、日式用词、模板注释（§3.4） |

观察：
- [事实] title 模式统一为 “WordByWord - 泛化标语”，最多只含“学习助手/翻译助手”这类泛化词，**没有一个页面 title/H1 包含具体功能核心词**（如“网页翻译/双语对照/逐句翻译/右滑翻译/iPhone/英语阅读”等）；CJK 页 description 仅 52–95 字，信息量少；欧语页 description 普遍 200+ 字符，SERP 中会被截断。
- [事实] nav 第 3 项有的语言翻成本地语（ja/ko/th/vi/it/pt/zh/tw/hi/ar），有的保留 “FAQ”/“SSS”（en/de/es/fr/id/nl/pl/ru/uk/tr），不统一但影响小。

### 3.3 截图引用问题（逐项证据）

| 问题 | 证据 |
|---|---|
| 只有英语两页用 `img/en/`；其余 20 页用根目录 `img/*_demo.png` | 脚本解析 imgs 列表（`index.html:58,77,91,105,119,133,147,158-165` vs `ja-top.html:58,77,91,105,119,133,147,158-161`） |
| 根目录 7 个“demo/截图”文件内容完全相同 | `md5`：`img/Screenshot-1.png`、`img/feature_{swipe,doubletap,tts,context,history,customize}_demo.png` 均为 `5d5463ff56a1931567e6c7a77c5f1cbf`（1530×3036，1,686,999 B） |
| 每个非英语页轮播 3 张图缺失 | `img/Screenshot-2/3/4.png` 不在 `git ls-files`，`git log --all` 历史中也从未出现；线上 404；20 页 × 3 = 60 处 |
| 英文页也有重复 | `img/en/feature_context_demo.png` ≡ `img/en/feature_doubletap_demo.png`（md5 `3864f897…`），而 hero 也用 doubletap 图 → 同一张图在英文页出现 4 次 |
| 图文不符 | `img/en/feature_history_demo.png` 实际是“Swipe Translation Detail + AI Syntax Explanation”界面，不是历史列表；`feature_customize_demo.png` 是设置页（Swipe Right Translation Mode / Translation Display Style / Speech Mode），文案却讲“快捷键/主题色”（目视检查缩略图） |
| 大小写 | `img/en/language_setting_en.PNG`、`select_language_en.PNG` 大写扩展名；引用与文件名一致，目前不出错；但任何“统一小写”的重构都会打断（线上 `.png` 404 / `.PNG` 200 已验证） |
| 可用的本地化素材（不算新增素材） | `/Users/ike/Dev/WordByWord/Resources/wbw_jp/wbw_jp.001–007.png`、`wbw_zh/zh-右滑翻译.png、zh-双击.001.png、zh-TTS.001.png、AI句型解析.001.png、zh-更多.001.png、zh-设置.001.png、zh-语言设置.001.png`、`wbw_en/wbw_en.001–007.png`（2025-06 制作）。[推断] 可直接解决 ja / zh-CN（及 zh-TW 暂用简中）截图问题；其它 17 种语言只能统一用英文截图（加 `alt` 本地化） |

### 3.4 错别字 / 翻译质量 / 残留（[事实]，逐条行号）

| 位置 | 问题 | 建议 |
|---|---|---|
| `ru-top.html:7, :49, :70` | “посрочное”是错字（应为“построчное”，且语义上应为“по предложениям/пофразовое”） | 改词 |
| `uk-top.html:7, :49, :70` | “покрокове вирівнювання” = “逐步对齐”，语义错误（应为“по реченнях/порядкове”） | 改词 |
| `hi-top.html:140` | “पूरी नियंत्रण” 性数不一致 → “पूरा नियंत्रण” | |
| `hi-top.html:6` | “सीखने की सहायक”（सहायक 为阳性）→ “सीखने का सहायक” | |
| `zh-top.html:50`（cn 同） | “对应超过20 种语言对”：日式用词“对应”+ 缺空格 → “支持 20 多种语言” | |
| `zh-top.html:229` | FAQ 中夹英文 “target language”、“Prompt 模板” | |
| `zh-top.html:235`、`tw-top.html:225` | 英文 UI 名 “Word History 页面” | 用 App 内实际中文名 |
| `zh-top.html:181-182` | 段落缺 `<br>`，两句被两个空格粘连 | |
| `zh-top.html:54,58,167,245,255-267` | 模板注释残留：“替换链接为 App Store 或相应下载地址”“替换为实际截图路径”“替换为你的 Logo 或图标”，以及注释掉的“微信公众号/微博/Bilibili/关于我们/使用条款” | 源码可见，删除 |
| `ja-top.html:237` | 页脚 “All rights reserved.” 未翻译 | |
| it/ko/pt/vi 页脚 `:237` | 版权句缺失或与“独立开发”合并在一行，与其他语言不一致 | |
| `pl-top.html:70` vs `:49,171,201` | 同一功能前后用“przesuwanie(滑)”与“zaznaczenie(选中)”两种说法 | |
| 全部 22 页 FAQ Q4（如 `index.html:224`） | “The initial version supports…”（初始版本）—— App 已是 1.2.2（`project.pbxproj MARKETING_VERSION = 1.2.2`） | |
| `index.html:50` 等 | “Supports over 20 language pairs” —— 实为 20+ 种**语言**（App `LanguageData.swift` 21 个 locale），“语言对”说法不准确 | |
| `support.html:126` | 用 “premium”，其余处叫 “Plus” | 统一 |
| `privacy.html:107` vs `chrome-extension/privacy.html:221` | 儿童年龄线 14 vs 13 不一致 | |

### 3.5 过时信息

- © 2025（22 落地页 + chrome-ext 页脚 `chrome-extension/index.html:312`），今天 2026-10-05。
- “initial version / 初始版本 / 初期バージョン”（全部 FAQ Q4）。
- `privacy.html` 无生效日期；`chrome-extension/privacy.html:156` 有 “Effective Date: February 2, 2026”。

### 3.6 网站描述 vs 产品实际（与 App 源码、App Store 对照）

产品侧证据来源：
- App Store（2026-10-05 抓取 `https://apps.apple.com/us/app/wordbyword-translate/id6741724502` 的 JSON-LD）：名称 **“WordByWord Translate”**、副标题 “Swipe to translate AI explains”、需 iOS 18.0+、iPhone/iPad、类别 Education/Reference、开发者 “Chi Jinlong”。
- 源码 `/Users/ike/Dev/WordByWord/WordByWordPrototype`（HEAD `0866b4e`，`MARKETING_VERSION = 1.2.2`）。

| 网站说法（位置） | 实际 | 结论 |
|---|---|---|
| Plus：“Unlimited AI pronunciation”（`index.html:180`，各语言同） | `FeatureQuotaManager.swift:73-78`：右滑发音 Free 10 / Plus 100 每日；双击发音 Free 10 / Plus 200 每日 | **[事实] 不符**（Plus 非无限） |
| Free：“20 AI pronunciations per day”（`index.html:218`） | 10（句）+10（词） | [事实] 合计吻合但口径不同 |
| Free：“a limited number of AI translations” | 在线右滑 50/日、本地右滑 100/日、双击 20/日、更多释义 10、句型解析 5、语块提取 30、句子骨架 20（Plus 500/无限）`FeatureQuotaManager.swift:63-82` | 可写得更具体 |
| Plus：“Custom themes and dark mode”（`index.html:182`）；“freely switch theme colors”（`index.html:143`） | `ApplicationSettings.swift:13,21,34` 仅定义 theme（light/dark/system，默认 system）；`ThemeOption` 除定义外无任何使用；`SettingsMenuViewController.swift:182-184` `toggleTheme()` 只有 `print` | **[推断，证据强] 未实现/非 Plus 功能** |
| “Customize translation/lookup shortcuts”（`index.html:143`） | `grep -iE 'shortcut|hotkey'` 源码 0 命中 | **[推断] 不存在** |
| “swipe … with your finger or mouse”（`index.html:206`） | iOS/iPadOS App；“mouse” 仅 iPad 外设场景 | 措辞问题 |
| it/pt/pl/tr/hi/ar/uk/ru 描述为“选中/выделите/seçerek/चुनते”文本即翻译 | App 手势是**右滑**（`Localizable.xcstrings` `tip_swipe_to_translate`: “Swipe right on any text…”） | **[事实] 不符** |
| 双击查词“any word”，zh/ja/ko 页强调中日韩 | `Localizable.xcstrings:7348` `double_tap_not_supported_message`: “Double-tap translation is currently not supported for Chinese, Japanese, and Korean.” | 需加限定（源语言为 CJK 时不可用） |
| **网站未提及**：本地/系统翻译引擎 | `swipe_translation_engine_mode_local_description`（`Localizable.xcstrings:22782`）“Uses iOS system translation” | 缺失卖点（离线/隐私） |
| 未提及：云引擎 Azure + Google | `:22530` | 缺失 |
| 未提及：语块提取 Chunk Extraction（仅英语） | `:4063` 等；App Store 描述 “Supports Language Chunk Extraction (currently English only)” | 缺失（且是 SurfEnglish 同源能力） |
| 未提及：AI 句型/句子骨架分析为免费可试用 | `grammar_structure_analysis`（`:9974`）、`sentenceSkeleton` 配额 | 网站只当 Plus 卖点 |
| 未提及：书签 | `bookmark_title`（`:1794`） | 缺失 |
| 未提及：X/Twitter 优化 | `Views/Components/WebView.swift:34-38` 对 x.com/twitter.com 特殊处理；App Store 描述 “Optimized for X” | 缺失 |
| 未提及：译文显示样式（引用块/下划线/波浪线/背景/边框） | `TranslationSettings.swift:419-437` | 这才是真实的“个性化” |
| 未提及：iPad、iOS 18+ | App Store JSON-LD | 缺失 |
| 订阅：月付 | `SubscriptionTest.storekit`：`com.wordbyword.premium.monthly`，P1M，3.99 | [事实] 吻合 |
| 页脚 “No personal data is collected” | App 用 Firebase Analytics（`privacy.html:92`、`GoogleService-Info.plist`）；**网站本身用 GA4** 且无 consent | 表述过绝对；网站 GA 未在任何隐私政策中说明 |

附带发现（非网站，但影响搜索展示）：**App Store 英文描述第一行是内部备注 “English concise submission version”**（同上 JSON-LD `description` 开头）。建议在 App Store Connect 删除。

---

## 4. 资源存在性、断链与大小写

脚本：解析全部 HTML 的 `src/href`，与 `git ls-files` 精确（大小写敏感）比对；JS 注入资源手动加入。

### 4.1 缺失资源（[事实]）

| 缺失路径 | 引用数 | 引用位置 |
|---|---|---|
| `img/Screenshot-2.png` | 20 | 每个非英语页轮播第 2 张（如 `ar-top.html:160`、`cn-top.html:169`、`ja-top.html:159`） |
| `img/Screenshot-3.png` | 20 | 同上第 3 张 |
| `img/Screenshot-4.png` | 20 | 同上第 4 张 |
| `backup/` 内 38 个路径（`backup/img/*`、`backup/wbw_logo.png`、`backup/privacy.html` 等） | 41 | 6 个 backup 页全部相对路径失效（如 `backup/top.html:411`、`backup/top2.html:122`） |

- 正式页（非 backup）其余本地引用全部存在；**无大小写不匹配**。
- 外部资源：App Store 链接、Apple 徽章、GA、surfenglish.app 各语言路径均可访问（`zh-hans/ zh-hant/ ja/ ko/ es/ pt-br/ vi/ id/ th/ hi/ ar/` 均 200；de/fr 等映射到英文根，正确，因为 `surfenglish.app/de/` 404）。

### 4.2 未引用 / 冗余资源（[事实]）

| 文件 | 大小 | 说明 |
|---|---|---|
| `img/ChatGPT-feature_swipe-2.png` | 1.1 MB | 未引用 |
| `img/feature_swipe.png` | 540 B（32×32） | 未引用 |
| `chrome-extension/img/text-attribution.png` | 8.5 KB | 未引用 |
| `img/feature_*_demo.png` ×6 + `Screenshot-1.png` | 7 × 1.69 MB | 内容相同，仓库冗余 ~10 MB，浏览器也会按不同 URL 重复下载 |
| `wbw_logo.png` vs `img/wbw_logo.png` | 7.5 KB ×2 | 同一文件两份，header/footer 各用一份 |
| `img/ChatGPT-feature_swipe.png` 等 6 个图标 | 0.85–1.12 MB，1024×1024 | 显示尺寸 72×72（`style.css:286-292`）；文件名带 “ChatGPT” 前缀，来源暴露于 URL（`Resources/GPT-ICON/` 为同一批 ChatGPT 生成图） |

### 4.3 页面重量（[事实]，按唯一 URL 求和）

| 页面 | `<img>` 数 | 唯一本地图片 | 字节 |
|---|---|---|---|
| `index.html` | 24 | 17 | ~15.0 MB |
| `ja-top.html`（其它非英语页同） | 20 | 15（含 3 个 404） | ~17.5 MB |
| `chrome-extension/index.html` | 14 | 14 | ~1.1 MB |

所有页面 `width/height` 属性 0 个、`loading="lazy"` 0 个；hero 图为 1530×3036 PNG（LCP 元素）。PageSpeed API 当日配额耗尽未能跑分（`Quota exceeded`），[推断] 移动端 LCP 会非常差。

---

## 5. 公开暴露但不应公开的内容

| 项 | 证据 | 风险 | 建议 |
|---|---|---|---|
| `backup/` 6 个草稿页 | 线上 `/backup/top.html`、`/backup/top.jp.html`、`/backup/sample.html` 均 200；无 robots/noindex；无 GA | 旧定位（“英语学习翻译助手”）、破图、`https://apps.apple.com/app/yourapp-id`（`backup/sample.html:37`）等占位内容可被索引，形成低质/重复页 | 移出部署目录（删除或移到不发布的分支/目录） |
| `README.md` | 线上 `/README.md` 200 | 暴露内部开关说明（低风险） | 构建产物中排除 |
| `.DS_Store` ×2 | 已提交入库（`git ls-files`），当前工作区还被修改；GitHub 公开仓库可下载；线上 404 | 仅泄露已公开文件名（解码结果为根目录文件列表），噪音 | 删除并加 `.gitignore` |
| 公开仓库 | `api.github.com/repos/super-monster/wordbyword-web` → `"visibility": "public"` | 草稿、注释、历史全部公开 | 知悉即可 |
| HTML 源码中的模板注释 | `zh-top.html:54,167,245,255-267`；`chrome-extension/index.html:253` 注释掉的“⭐ 已有 10,000+ 用户安装使用”（虚构社交证明占位） | 不专业；若误开启属虚假宣传 | 删除 |
| `chrome-extension/` 整个子站 | 商店按钮指向通用首页 `https://chrome.google.com/webstore`（`chrome-extension/index.html:243`），header/hero 的“立即安装/Chrome 商店安装”只跳 `#cta`；扩展仓库 `WordByWord-translate-extension` 中未找到任何商店上架链接；WebSearch 在 Chrome 商店只找到同名他人产品 “WordByWord – Vocabulary Highlighter”（`chromewebstore.google.com/detail/…/nnikiceohfnfopndpmmkkeojiijhcbbg`） | [推断] 扩展未上架或链接缺失，页面承诺无法兑现；且与他人同名扩展混淆 | 未上架前 `noindex` 或下线；上架后补真实链接 |
| `chrome-extension/privacy.html` 内容与扩展实际不符 | 写的权限为 `activeTab/storage/contextMenus`（`:211-213`），实际 manifest 为 `storage/tabs/tts/sidePanel/activeTab` + `host_permissions: https://www.google-analytics.com/*`（`WordByWord-translate-extension/manifest.json:13-21`）；又声称 “We do not use cookies or tracking technologies”（`:181`） | 合规风险（Chrome Web Store 审核/用户信任） | 若保留此页需与 manifest 对齐 |
| 网站 GA4 无同意机制 | 26 个页面内联 `gtag('config','G-QS1CJY8YWL')`，无 Consent Mode；存在 de/fr/it/nl/pl/es 等欧盟语言页 | [推断] GDPR/ePrivacy 风险；且与页脚“不收集个人数据”矛盾 | 设计阶段决定：Consent Mode v2 默认拒绝 / 在隐私政策中披露 |

---

## 6. 代码质量与可维护性

### 6.1 HTML

- 22 个落地页是**同一模板的 22 份手抄**：结构行号几乎完全一致（H1 都在第 47/48 行、截图区都在 157 行附近），任何结构改动都要改 22 个文件。
- 每页 ~57 个文本节点 + 24 个 `alt`（脚本统计 `index.html`）≈ 80 条可译串；20 语言 ≈ 1,600 条字符串散在 HTML 中，无 i18n 源文件。
- GA4 片段在 26 个文件中重复（`grep -rl G-QS1CJY8YWL` = 26）。
- 文件名→locale 映射在 `js/site-notice.js:139-161` 与 `js/surfenglish-promo.js:32-54` 各维护一份（README 也承认 “mirrors site-notice.js”）。
- 5 处内联 `style` × 22 页 = 110 处；`ar-top.html:175` 用内联 `text-align:right` 处理 RTL 列表。
- 语义：无 `<main>`；FAQ 用 `h3+p`（无 `<details>`/schema）；Logo `<a href="#">` 无意义；空 `<div style="flex:1 1 100%">` 作布局 hack（`index.html:257`）；`privacy/support` 用 `<div class="section-title">` 代替标题标签。

### 6.2 CSS（`css/style.css`）

- 无设计 token / CSS 变量，颜色硬编码：`#007aff`（hero 背景、标题）、`#1d77e9`、`#cc3355`（主按钮）、`#e0b900`（主按钮 hover）、`#ff2d55`、`#f9f9f9` 等，配色无体系。
- **主按钮 hover 色错误**：`.hero .btn-primary` 背景 `#cc3355` → hover `#e0b900`（黄）+ 白字（`style.css:180-192`）。计算对比度：白字 on `#e0b900` ≈ **1.9:1**（远低于 WCAG 4.5:1）。`border-radius` 同一规则内写了两次（`:184,:188`）。
- Hero 副标题：白字 + `opacity:0.9` on `#007aff`，白 on `#007aff` 对比度 ≈ **4.0:1**，18px 常规字重 → 不满足 AA（`style.css:150-173`）。
- 重复/冲突规则：`.features .container` 定义两次（`:231`、`:490`）；`@media (max-width:700px)` 定义两次（`:74`、`:456`），前者用 `!important` 横排、后者竖排导航，互相覆盖；缩进风格两套混用。
- 死代码：`.feature-grid`、`.feature-card*`（`:242-276`）、`.footer-copy`（`:447`）、`.btn-download-store`（`:359`，只在注释里用）、`.btn-download`（主站仅注释用）。
- 无 RTL 适配：`.feature-header-horizontal h3 { text-align:left }`（`:300`）、`.app-title { margin-left }`（`:58`）在阿语页方向错误；应改为逻辑属性（`text-align:start`、`margin-inline-start`）。
- 无暗色模式；字体只有系统栈（`style.css:12`），`.app-title` 另指定 `'Segoe UI'`（`:60`），在 Apple 设备上与正文不一致。
- [推断] “千篇一律 AI 模板感”来源：纯色 `#007aff` 大 hero + 居中两按钮 + 左右交替 feature row + 卡片式 FAQ；chrome-extension 子站更典型（`#667eea→#764ba2` 紫色渐变、emoji 图标 🚀🎯⚡✨🎨、`chrome-extension/style.css:64,114,326,601`）。

### 6.3 性能 / 体验

- 见 §4.3：单页 15–17.5 MB 图片、无尺寸属性（CLS）、无懒加载、1024² 图标当 72px 用。
- 轮播 `.screenshot-carousel` 只是横向滚动，无指示/按钮（`style.css:322-336`）。
- `surfenglish-promo.js` 47 KB 把 20 种语言文案全部下发到每个页面。

### 6.4 同步成本估算（[推断]）

| 变更类型 | 现在要改的文件数 |
|---|---|
| 改一句 FAQ / 加一个功能 | 22 个 HTML（再逐语言翻译） |
| 改 GA 配置 / 加 meta | 26 个 HTML |
| 新增一种语言 | 复制 1 个 HTML + 改 2 个 JS 映射 + promo I18N + site-notice 文案 |
| 改页脚 / 年份 | 23 个 HTML |
→ 必须引入“单一模板 + locale JSON + 构建脚本”（与 SurfEnglish `build.mjs` 同思路）。

---

## 7. 三个 JS 模块：作用、配置与重构需保留的接口

### 7.1 `js/analytics.js`（GA4 点击埋点）

- 机制：`document` 捕获阶段监听 click（`:186-201`），匹配 `a, button, [role="button"], [data-ga-event]`（`:2`），调用 `gtag('event', name, params)`；`gtag` 不存在时静默（`:173`）。
- 事件名决策顺序（`resolveEventName`，`:97-144`）：
  1. `data-ga-event`（小写、非字母数字转 `_`、≤40 字符，`:9-16`）
  2. `app_store_click`（域名 `apps.apple.com` / `itunes.apple.com`）
  3. `chrome_store_click`（域名 `chrome.google.com` / `chromewebstore.google.com` **且 pathname 含 `webstore`**）
  4. `contact_email_click`（mailto）
  5. `nav_click`（在 header 或 nav 内）
  6. `footer_link_click`
  7. `cta_click`（锚点 `#cta`）
  8. `section_anchor_click`（其它锚点）
  9. `internal_link_click` / `outbound_link_click` / `button_click` / `site_click`
- 参数（`:146-170`）：`event_category:'site_interaction'`、`event_label`、`link_text`、`link_url`、`link_domain`、`link_type`、`page_path`、`page_title`、`page_locale`（取 `<html lang>`）、`element_location`（`header`/`footer`/最近的 `section[id]`/`body`）、`target_section`、`outbound`、`transport_type:'beacon'`；空值删除。
- 自定义标签：`data-ga-label` 优先于 aria-label/title/文本/img alt（`:25-40`）。
- **Bug [事实]**：新版 Chrome 商店 URL 形如 `https://chromewebstore.google.com/detail/<slug>/<id>`，pathname 不含 `webstore` → 不会被识别为 `chrome_store_click`（`:86-87`）。
- [推断] `event_category/event_label` 是 UA 时代参数，GA4 中需注册为自定义维度才可在报表使用；GA4 Enhanced Measurement 若开启 outbound clicks，会与 `outbound_link_click` 重复计数——需在 GA 后台确认。
- **重构必须保留**：GA4 ID `G-QS1CJY8YWL`；上述事件名（历史报表连续性）；`data-ga-event` / `data-ga-label` 约定；`element_location` 依赖的 section id（`hero/features/screenshots/cta/faq/surfenglish`），改 id 会改变报表维度值；`page_locale` 依赖 `<html lang>`（若从 `zh-CN` 改为 `zh-Hans`，报表需做映射）。

### 7.2 `js/site-notice.js`（服务故障横幅）

- 开关：`config.enabled`（`:3`，当前 `false`）。git 历史显示它是**运维应急工具**：`2dc8034`（2026-05-12 引入）→ `a9ac0c6`（05-22 开）→ `1151f55`（05-27 关）。
- 文案：20 个 locale（`:4-125`），内容为“在线翻译服务暂时不可用”。
- locale 解析：文件名映射（`:139-161`）→ `<html lang>`（zh-tw/zh-hk/zh-hant → zh-TW；其它 zh → zh-CN）→ 短码 → en。
- 渲染：在 `body` 最前插入 `section.wbw-service-notice[role=alert]`，`position:fixed; z-index:1200`；用 `ResizeObserver` 把 `body > header` 的 `top` 和 `.nav-spacer` 高度推下去（`:304-346`）；设置 CSS 变量 `--wbw-service-notice-height`；防重复挂载 `window.__WBWServiceNoticeMounted`。
- **重构必须保留**：一个“改一处即可全站开关”的机制 + 20 语言文案；与固定 header 的布局协议（或在新布局中改为普通文档流横幅，消除 JS 量高度）；`.wbw-service-notice` 类名（promo JS 依赖它计算叠放高度，`surfenglish-promo.js:600-603`）。

### 7.3 `js/surfenglish-promo.js` + `css/surfenglish-promo.css`（临时推广）

- 配置（`:15-26`）：`enabled:true`、`showBar:true`、`showSection:true`、`sectionAfter:'#hero'`、`dismissDays:7`、`appStoreUrl:'https://apps.apple.com/app/id6787367021'`、`siteUrl:'https://surfenglish.app/'`、`utm:'utm_source=word-by-word.app&utm_medium=referral&utm_campaign=surfenglish_launch'`、`badgeBase:'https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/'`、`storageKey:'wbw.surfenglishPromo.dismissedAt'`。
- 文案：20 locale，每个含 `sitePath`（ja→`ja/`、zh-CN→`zh-hans/`、zh-TW→`zh-hant/`、pt→`pt-br/`、ko/es/vi/id/th/hi/ar 同名；de/fr/it/nl/pl/ru/tr/uk/en → 根）与本地化徽章码（`:59-440`）。
- 行为：① 固定公告条（`aside#wbw-se-bar`，z-index 1100，可关闭，关闭记入 localStorage 7 天）；② 在 `#hero` 后插入 `section#surfenglish.wbw-se-promo`（深色“oceanic liquid glass”卡片、3 张手机截图、本地化徽章、站点链接），并处理 `#surfenglish` 深链（`:551-554`）。privacy/support 无 `#hero` → 只显示公告条；chrome-ext 首页有 `#hero` → 也插入卡片（按 `lang=zh-CN` 出简中文案）。
- GA：`data-ga-event="surfenglish_promo"`，label：`bar_app_store`、`bar_site`、`bar_dismiss`、`section_app_store`、`section_site`。
- 全局副作用：`section[id]{scroll-margin-top:…}`（`surfenglish-promo.css:28-30`）作用于全站所有 section。
- 问题：
  - [事实] 推广卡片的 H2（如英文 “Learn English by reading what you actually enjoy.”）成为 H1 之后第一个 H2；公告条固定在每页顶部（包括 privacy/support）。[推断] 视觉权重与“WBW 身份不变、顺带推荐”目标冲突，也会稀释 WBW 页面主题相关性。
  - [事实] 内容为 JS 注入，静态 HTML 中不存在 → SEO 对 SurfEnglish 的链接/文本信号依赖 Googlebot 渲染。
  - [事实] App Store 链接无 `pt`/`ct` 归因参数，只有站点链接带 UTM → 无法在 App Store Connect 区分来自 WBW 官网的下载。
  - [事实] 文案中关于 SurfEnglish 的事实性声明（“App in 12 languages · Translates into 21 languages”、“On-device AI voice, works offline”、“graded A1–C1”）未在本审计中核验，交由 SurfEnglish 调研确认。
  - [事实] 反向：SurfEnglish 网站 `src/` 中没有任何 “WordByWord” 提及（`grep -i wordbyword` 0 命中）→ 两站之间只有单向引流。
- **重构需保留/迁移**：`surfenglish_promo` 事件名与 5 个 label（或在设计中定义新的 label 映射表）；UTM 规范；`#surfenglish` 锚点（若已在外部使用）；locale→`surfenglish.app` 路径映射表；localStorage 键（若保留可关闭条）。

---

## 8. 外部链接清单

| 链接 | 出现位置 | 参数/状态 |
|---|---|---|
| `https://apps.apple.com/app/6741724502` | 22 落地页 CTA（如 `index.html:186`，zh/cn `:191`） | 无 `id` 前缀（302 → `/us/app/wordbyword-translate/id6741724502`，200）；无 `pt`/`ct`/`mt`；`target=_blank` 无 rel |
| `https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us` | 22 落地页（如 `index.html:187`） | 一律 en-us；该域现 302 至 `toolbox.marketingtools.apple.com`；`style="height:60px"` 内联 |
| `https://apps.apple.com/app/id6787367021` | promo JS（bar + section） | SurfEnglish；200（→ `/us/app/surfenglish-bilingual-news/id6787367021`）；无归因参数 |
| `https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/{locale}` | promo JS | 本地化徽章（en-us, zh-cn, zh-tw, ja-jp, ko-kr, es-es, pt-br, vi-vn, id-id, th-th, hi-in, ar-sa, de-de, fr-fr, it-it, nl-nl, pl-pl, ru-ru, tr-tr, uk-ua） |
| `https://surfenglish.app/{sitePath}?utm_source=word-by-word.app&utm_medium=referral&utm_campaign=surfenglish_launch` | promo JS | sitePath 见 §7.3；已验证 11 个本地化路径 200 |
| `https://www.googletagmanager.com/gtag/js?id=G-QS1CJY8YWL` | 26 页 head | GA4 |
| `https://chrome.google.com/webstore` | `chrome-extension/index.html:243` | **占位**：通用商店首页（→ `chromewebstore.google.com/`），非具体扩展 |
| `mailto:app.wordbyword@gmail.com` | `privacy.html:117`、`support.html:121,135`、`chrome-extension/privacy.html:231` | 唯一联系方式 |
| `https://apps.apple.com/app/yourapp-id` | `backup/sample.html:37` | 草稿占位（线上公开） |
| 反向依赖：`https://www.word-by-word.app/privacy.html` | iOS App `SubscriptionView.swift:68`、`MoreSettingsView.swift:168` | **URL 不可改** |

---

## 9. 对重构设计的约束、难点与风险（基于本审计）

### 9.1 必须保持可访问的 URL（[事实] / [推断]）

| URL | 原因 |
|---|---|
| `/privacy.html` | iOS App 硬编码（[事实]）；App Store Connect 隐私 URL（[推断]） |
| `/support.html` | App Store Connect 支持 URL（[推断]） |
| `/chrome-extension/privacy.html` | Chrome Web Store 后台隐私 URL（[推断]） |
| `/` | 主入口、外链主体 |
| `/*-top.html`（21 个） | 可能已被索引/外链（需 GSC 确认）；改 URL 必须留跳转 |

### 9.2 难点与风险

1. **GitHub Pages 无服务端 301**：若迁移到 `/ja/` 这类目录结构，旧 `/ja-top.html` 只能用“静态跳转页”（`<meta http-equiv="refresh">` + `<link rel="canonical">` 指向新址 + JS `location.replace`）。Google 会把即时 meta refresh 当作永久重定向处理，但不如 301 稳妥。备选：迁到 Cloudflare Pages（SurfEnglish 已在用，支持 `_redirects` 301 与 `_headers`）——代价是 DNS 切换（当前 Google Cloud DNS）与部署流程变化。**也可保留现有文件名不变**，只补 canonical/hreflang/sitemap，风险最低但 URL 不美观。
2. **引入构建步骤**：GitHub Pages 当前直接发布仓库根目录（Jekyll）。改为 `build.mjs` 生成时需：GitHub Actions 部署 `dist/`，或提交构建产物；同时加 `.nojekyll`；确保 `CNAME` 进入产物。
3. **cn-top / zh-top 去重**：需选定唯一简中 URL，另一份改为跳转页；hreflang 的 `zh-Hans`/`zh-Hant` 与 GA `page_locale` 取值要一起规划。
4. **locale 代码迁移**：`pt` → `pt-BR`、`zh-CN` → `zh-Hans`（可选）会改变 GA `page_locale` 与两个 JS 的 locale 解析分支；建议所有脚本统一从一个 locale 配置读取，而非文件名。
5. **截图本地化在“不新增素材”约束下的边界**：仓库内只有英文一套有效截图；`Resources/wbw_jp`、`Resources/wbw_zh` 已有日/中截图（属于现有素材，需用户确认可用）；其余 17 种语言只能用英文截图。必须修复 60 处破图并去掉 7 份相同图片。
6. **图片优化**：1530×3036 PNG → 需生成 WebP/AVIF + 多尺寸 + width/height；构建脚本中做（不改变“素材”本身，只改格式/尺寸）。
7. **文案与产品对齐**：Plus 权益、快捷键、主题、手势描述需按 App 1.2.x 实际重写（§3.6），并补充本地翻译引擎、语块提取、书签、X 优化等真实卖点——这同时是 SEO 用“功能核心词”重写的素材来源。
8. **SurfEnglish 推广从 JS 注入改为模板内静态组件**：需决定位置/权重（例如从 hero 后移到功能区之后或页脚前；公告条是否保留、是否仅首访显示），并保留 GA 事件契约；同时考虑在 SurfEnglish 官网加反向“姊妹应用”链接。
9. **site-notice 应急开关**：重构后仍需“一处改动全站生效、无需重建 20 页”的能力（静态构建下可保留为运行时 JS + 配置，或改为构建期开关但需确认发布流程足够快）。
10. **Analytics 连续性**：section id、事件名、`data-ga-*` 约定改动会断报表；修复 `chrome_store_click` 识别 bug；评估 Consent Mode。
11. **域名**：为裸域 `word-by-word.app` 添加 GitHub Pages A/AAAA 记录（185.199.108–111.153 / 2606:50c0:8000–8003::153），并在 Pages 设置开启 Enforce HTTPS。
12. **清理暴露内容**：`backup/`、`README.md`（从产物排除）、`.DS_Store`、模板注释、未上架的 chrome-extension 子站（noindex 或下线）、过期 `origin/dev` 分支。

---

## 10. 未覆盖 / 待验证事项

- **GSC / GA4 实际数据**：哪些 URL 被索引、各语言页曝光/点击、查询词分布；本审计无法访问。设计阶段应先导出 GSC“网页”与“查询”报告，确认 `*-top.html` 是否有排名（决定 URL 是否值得保留）。
- App Store Connect 中配置的 Marketing URL / Support URL / Privacy URL 实际值（决定哪些 URL 必须保留）。
- Chrome 扩展是否已上架及其商店 URL、Chrome 后台登记的隐私政策 URL。
- GA4 后台：Enhanced Measurement 是否开启 outbound click、自定义维度是否注册 `element_location`/`page_locale` 等。
- `Resources/wbw_jp`、`wbw_zh` 截图是否与 App 1.2.x 当前界面一致、是否允许作为“现有素材”上线。
- SurfEnglish promo 中的事实声明（12 种界面语言、21 种翻译语言、离线 AI 语音、A1–C1 分级）。
- PageSpeed / Core Web Vitals 实测（当日 API 配额耗尽）。
