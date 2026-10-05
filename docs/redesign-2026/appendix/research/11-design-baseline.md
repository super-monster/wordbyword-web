# 11 · 设计基线（主控裁定，所有设计文档必须遵守）

> 本文件由主控根据 00–10 研究报告与用户 2026-10-05 的答复整理。事实以 `10-fact-check.md` §4 为准；
> 本文件定义的是**跨文档的决策**。设计文档可以细化、补充，但不得与之矛盾；如确有更好的方案，
> 在文档里以「对基线的修订建议」单独列出，并说明理由。

## A. 用户已确认的决策（2026-10-05）

| # | 决策 | 用户答复 |
|---|---|---|
| U1 | 托管 | **Cloudflare Pages（b-lite）**：新建 CF Pages 项目，只把 `www` CNAME 从 `super-monster.github.io` 改指 `<project>.pages.dev`；**不迁 NS**、不动 `api.` / `backend-test.` / `backend.` 记录；apex `word-by-word.app` 本期维持现状（另立小项） |
| U2 | 素材边界 | 以下均视为"现有素材"可用：① `Resources/wbw_en|wbw_jp|wbw_zh` 本地化截图；② 裁切 / 压缩 / 转格式 / 从 App 图标派生 favicon、apple-touch-icon / HTML 渲染导出的 OG 图；③ HTML/CSS 实现的 App 界面演示样张（示例文字自写）；④ SurfEnglish 官网现有截图（`SurfEnglishWebsite/public/images/screenshots/*`、`public/icons/*`）用于兄弟推荐区块 |
| U3 | chrome-extension 子站 | **纳入新站一起重做**，进入导航。（注意：CWS listing URL 目前在仓库中找不到 → 设计中做成配置项 `SITE.chromeStoreUrl`，未提供时 CTA 降级为"即将上架/联系我们"，并列为开工前待提供项） |
| U4 | 对外开发者署名 | **"Jinlong"**（与 SE 官网一致；JSON-LD 中 `alternateName: "Chi Jinlong"` 以对应 App Store 开发者名） |

## B. 定位与边界（不可违背）

1. **WordByWord 官网身份不变**：首页、title、H1、导航的主角始终是 WordByWord。SurfEnglish 只是"兄弟应用推荐"，在视觉权重和篇幅上都是次要的。
2. **WBW 的核心主张**（必须与产品事实一致，见 fact-check F13–F17）：
   - iPhone / iPad App（兼容 Apple 芯片 Mac、Vision Pro），**App 内置浏览器**里打开任意网页，**向右滑动段落**，译文插在原文下方（自动 / 段落 / 逐句三种显示）。**不是整页一键翻译，不是 Safari 扩展**。
   - 双击单词：AI 结合上下文给出释义，短语优先，例句与词形（**中日韩源文不支持双击查词**）。
   - AI 朗读 / 系统 TTS；AI 句法（长难句）解析；英语源文专属：语言块 Chunks、Action Flow。
   - 翻译引擎：云端（Azure + Google）或本地（iOS 系统翻译）。
   - 界面 20 种语言；译文目标 21 种语言；源语言默认英语、可切换。
   - 免费可用 + 每日额度；Plus 月订（$3.99 US）提升额度。**禁止**再写"无限 AI 发音""自定义主题/暗色模式""快捷键/音量设置""不收集任何个人数据"。
3. **SurfEnglish 的事实**：只教英语（源语言固定 en）；英语新闻信息流（A1–C1 分级）+ 逐句双语 + 语块 + 语境查词 + 离线语音 + 复习游戏 + 内置浏览器；界面 12 种语言；**中国大陆 App Store 不可下载**；Plus $2.99/月、$24.99/年；两款 App 同一开发者账号，App Store "More by" 已互相展示。
4. **关键词归属**（防两站互相蚕食，见 07 §7.3）：
   - WBW 主攻：工具/翻译意图——"iPhone 上双语阅读/翻译任意网页并保留原文"、"AI 语境词典/查词"、"X(Twitter) 双语阅读"、"多语言（不只英语）"、"word by word translation（长尾）"。
   - SE 独占：含"英语/English + 学习"意图，或含 新闻/分级/语块/游戏/多读。WBW 页面的 title/H1/description **不以"学英语"作主词**。
   - 共享功能词（逐句、双击、语境）必须加限定词：WBW 写"网页 + 任意语言"，SE 写"英语新闻"。
5. **两站之间不使用 hreflang 或 canonical**；互链是正常的编辑性链接（不加 nofollow），不带 UTM（SE 站没有统计）；App Store 链接带 `pt`/`ct`（`ct` ≤ 30 字符；`pt` 待用户提供）。

## C. 信息架构与 URL（Phase 1）

| 路径 | 内容 | 语言 |
|---|---|---|
| `/` | 英文首页（x-default）——**URL 不变**，保护品牌词排名 | en |
| `/<locale>/` | 19 个本地化首页：`zh-hans zh-hant ja ko es pt-br fr de it nl pl ru tr uk vi th id ar hi` | 各自 |
| `/about/` | 产品与开发者实体页（参照 SE `/about/`）：WordByWord 是什么、谁做的、与 SurfEnglish 的关系、与同名产品 WordByWord.io 无关 | en（本地化 about 列入 Phase 2 评估） |
| `/chrome-extension/` | 重做的 Chrome 扩展页（U3），扩展 UI 语言为 en/ja/ko/zh_CN → 至少 en 主版本；是否做 ja/ko/zh-Hans 版本由 IA 文档论证 | en (+?) |
| `/privacy.html`、`/support.html`、`/chrome-extension/privacy.html` | **契约 URL**：必须保持可访问，优先 200 直出（CF Pages `.html` → 308 的问题需 preview 实测，方案 C-1/C-2 见 09 §3.5） | en |
| `/404` | 自定义 404（多语言引导） | en |
| `robots.txt`、`sitemap.xml` | 新增；sitemap 含 hreflang alternates 与图片 | — |

- 旧 URL → 新 URL 一律 **301**（`_redirects`）：`/index.html → /`，`/en-top.html → /`，`/cn-top.html` 与 `/zh-top.html → /zh-hans/`，`/tw-top.html → /zh-hant/`，`/pt-top.html → /pt-br/`，其余 `/<xx>-top.html → /<xx>/`；同时覆盖无扩展名变体（`/ja-top`）。`/backup/*` 删除（404）。
- 每个 locale 首页：自引用 canonical + 全量 hreflang（20 个 + x-default=`/`）。
- 站内必须有**可抓取的语言切换器**（header 或 footer 的全量语言链接列表），每个页面互链所有语言版本。
- Phase 2 内容页（指南/解释页）路径规则由 SEO 文档定义，但必须先在 IA 文档中预留：建议 en 为 `/guides/<slug>/`，本地化为 `/<locale>/guides/<slug>/`。**不做"语言 × 功能"程序化批量页**。

## D. 技术架构基线

- 同一仓库 `super-monster/wordbyword-web` 内重建：**fork SurfEnglish 的零依赖生成器思路**（`build.mjs` + `src/locales/*.json` + `src/templates/*.mjs` + `src/css` + `src/js` + `public/` → `dist/`），不做跨仓库共享包。
- Node 24，零 npm 依赖；CF Pages 构建命令 `node build.mjs`、输出 `dist`；分支模型与 SE 一致（`main` 开发 + preview；`cloudflare-deploy` 生产）。
- **图片在本地预处理并提交**（macOS `sips` 可产出 AVIF/JPEG；CF 构建机是 Linux，没有 sips），构建期只做复制 + 指纹。
- 保留：GA4 `G-QS1CJY8YWL`；`analytics.js` 的事件约定（`data-ga-event` / `data-ga-label`）；`surfenglish_promo` 事件名（label 重新规划）；site-notice 的"全站一键开关"能力（改为构建期渲染，见 09 §4.3）。
- 删除：`js/surfenglish-promo.js`、`css/surfenglish-promo.css`（其 20 语言文案作为翻译资产迁入 locale JSON 后再改写）、`backup/`、根目录手写 HTML。
- 不照抄 SE 的已知缺陷（03 §1.13、F23）：`applicationCategory` 用 Google 支持值、`og:locale` 用 `ja_JP` 形式、title 长度控制、图片指纹化后才设长缓存。

## E. 视觉方向基线

- 方向名：**"纸与墨 · 阅读批注"**——暖纸白底 + 墨黑 + 品牌红 **#CC3355**（App 图标 / AccentColor / App 内译文引用条），用产品自身的阅读批注语汇做母题：3px 红色译文引用条、黄色荧光笔查词高亮 #FEE437、彩色波浪语块下划线、logo 速度线、4 阶红黑马赛克方块。
- 与 SE（深海 / 玻璃 / 青紫渐变 / 大圆角）形成"同一家族、不同性格"：共享 token 架构、组件语法、红色译文引用条这一"血缘印记"；WBW 浅色为主、实色印刷感、方正几何、衬线阅读样张 + 系统无衬线 UI。
- 不引入 webfont（系统字体栈，含 CJK/泰/天城/阿拉伯 fallback）；支持暗色模式与 RTL（逻辑属性）；`prefers-reduced-motion`。
- Hero 采用 **HTML/CSS 实时双语样张**（可本地化、可索引），辅以真实截图；取消 6 段等权 zig-zag、轮播、AI 插画图标作为主视觉。
- 性能预算：首屏图片 ≤ 150 KB，整页图片 ≤ 1.2 MB（现状 15–17.5 MB），所有 `<img>` 带宽高。

## F. SurfEnglish 兄弟推荐基线

- 全部为**构建期静态 HTML**；不放首屏、不用固定条/弹窗；位于功能介绍之后；体量 ≤ 约半屏。
- 落点（由推荐文档细化）：① 功能区之后的"兄弟应用"区块；② FAQ 中"主要想学英语用哪个"；③ 语言支持段落里的情境提示；④ 页脚 "More from the maker"；⑤ `/about/` 家族说明；⑥ **SE 官网侧的反向链接**（about + footer，作为 SE 仓库的配套改动）。
- 受众条件：只面向"学英语"的访客，用条件式话术（"如果你主要在学英语…"），不是"WordByWord 的替代品/升级版"。
- 按语言规则：zh-Hans 页**不放 SE 的 App Store 下载徽章**（大陆不可下载）；de/fr/it/nl/pl/ru/tr/uk 链到 SE 英文页，并注明"App 界面为英文等 12 种语言，译文可选你的语言"；其余 11 个与 SE 重合的语言链到 SE 对应语言页。
- privacy / support 页不放推荐区块；chrome-extension 页可放页脚家族链接，不放推荐区块。

## G. 范围外但需在文档中显式标注的风险

- WBW iOS 生产版指向 `backend-test.word-by-word.app`，而 SE 侧把它当测试环境（F21 / G8）。
- App Store US 描述首行内部备注 "English concise submission version"；ASC 各本地化 Marketing URL 可在上线后改为对应语言页。
- WBW 隐私标签 "Data Not Collected" 与集成 Firebase Analytics 的出入；官网 GA 的同意管理（EEA）。
- apex `word-by-word.app` 不可解析（另立小项）。
- SE 官网无任何统计 → 无法在 SE 侧度量来自 WBW 的流量。

## H. 待用户提供（开工前清单，设计文档统一引用此清单）

1. GSC「网页」「国家」标签页导出、`ja-top.html` URL 检查结果（决定上线监控基线）。
2. GA4 中 `surfenglish_promo` 各 label 的点击基线、各页面流量。
3. App Store Connect Provider Token（`pt`）。
4. Chrome Web Store 扩展 listing URL（或上架时间表）。
5. CWS 后台登记的扩展隐私政策 URL。
6. GA 同意管理（Consent Mode）方案取舍、privacy.html 是否同步改写。
