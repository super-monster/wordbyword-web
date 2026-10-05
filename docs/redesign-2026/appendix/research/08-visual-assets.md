# 08 · WordByWord 官网视觉设计现状审计与素材盘点

> 调研日期 2026-10-05 · 只读调研，未修改任何项目文件。
> 标记约定：**[事实]** = 已用文件/命令/线上页面验证；**[推断]** = 基于证据的判断或建议，需设计阶段确认。
> 路径缩写：`WEB` = `/Users/ike/Dev/WordByWord/wordbyword-web`，`RES` = `/Users/ike/Dev/WordByWord/Resources`，`SEW` = `/Users/ike/Dev/SurfEnglish/SurfEnglishWebsite`，`IOS` = `/Users/ike/Dev/WordByWord/WordByWordPrototype`。

---

## 0. 结论速览（TL;DR）

1. **[事实] 19 个非英语页的视觉基本是坏的。** `img/feature_*_demo.png`（6 个）与 `img/Screenshot-1.png` 的 md5 完全相同（`5d5463ff…`，各 1,686,999 B），画面只是一个打开 VOA 文章、**看不到任何功能**的手机截图；非英语页 hero + 6 个功能配图 + 轮播第 1 张共 8 处都是这张图。轮播里的 `img/Screenshot-2/3/4.png` 在仓库中不存在，线上返回 404（`curl` 验证），所以这 19 个页面各有 3 张破图。英语页（`index.html`/`en-top.html`）用的是 `img/en/`，基本正常。
2. **[事实] 图片过重。** 本地图片：英文首页约 15.0 MB，日文页约 17.5 MB（其中 7 个不同 URL 指向同一张 1.69 MB 的图，合计约 11.8 MB）。6 个功能图标是 1024×1024、约 1 MB 的 ChatGPT 生成插画，却只显示为 72×72。没有 `loading="lazy"`、`width/height`、`srcset`、OG 图、apple-touch-icon。
3. **[事实] 品牌色没有用起来。** App 图标、AccentColor、App 内双语引用条和 SurfEnglish 的代码都把 **#CC3355** 定为 WordByWord 品牌红。网站主色却是 iOS 系统蓝 `#007aff`：它是 hero 整块背景，也用于所有 h3 和链接 hover。品牌红只出现在 hero 的一个按钮上，而这个按钮 hover 时会变成芥末黄 `#e0b900`，白字对比度只有 1.89:1。
4. **[推断] "AI 模板站感"主要来自 10 多个可以对上的特征**，详见 §2.3：整块纯色居中 hero、正文墙、6 段完全同构的左右交替 feature-row、AI 生成的"手指 + 横线"插画图标、每个 section 同款居中标题、白/灰交替条纹底、"Q1:" 式 FAQ、轮播重复展示上面已出现的图。chrome-extension 子站更典型：`#667eea→#764ba2` 紫色渐变、Discord blurple `#5865F2`、emoji 图标、"为什么选择我们"三卡片。
5. **[事实] 素材库比网站实际用到的强得多。** `RES/wbw_jp`、`RES/wbw_zh` **是真正本地化的截图**（App UI、示例文章、译文都是日文/中文），各有一套 7 张 App Store 营销图（1284×2778，6.5″ 规格）。另有原始截图和 X(Twitter) 场景图，可以直接给 ja、zh-CN 页使用，**不需要新增素材**。还有 3 类功能网站上完全没提：X 时间线逐句翻译、"提取语言块/Extract chunks"、词形变化。History 功能则**没有对应的真实截图**：`feature_history_demo.png` 拍的其实是"AI 句法解析"。
6. **[事实] 两个品牌已经共享一套"阅读标注"视觉语汇**：3px #CC3355 左引用条 + 黄色查词高亮 #FEE437 + 10 色 chunk 下划线。WBW 注入脚本、SurfEnglish App 和 SurfEnglish 官网都在用同一组值。这是做"同一家族"一致性最好的抓手。差异化可以靠：浅色纸张 / 墨黑 / 品牌红的 WBW，对比深海 / 玻璃 / 青紫渐变的 SE。

---

## 1. 方法与证据来源

- 读码：`WEB/css/style.css`（556 行）、`WEB/index.html`（262 行）、`WEB/chrome-extension/style.css`（779 行）、`WEB/chrome-extension/index.html`、`WEB/css/surfenglish-promo.css`（438 行）、`WEB/js/surfenglish-promo.js`、`SEW/src/css/style.css`（620 行）。
- 素材：对全部图片执行 `stat -f%z`、`sips -g pixelWidth -g pixelHeight -g hasAlpha`、`md5 -q`。逐张用 Read 工具看图（先用 sips 生成缩略图到 scratchpad）。用自写的 Swift（CoreGraphics）脚本采样精确色值、统计透明像素和不透明区域 bbox。
- 线上：Browser pane 打开 `https://www.word-by-word.app/`、`/ja-top.html`，在 1024 宽和 375×812 移动视口下，用 JS 量取各区块高度和破图列表。
- 交叉验证：`IOS/Resources/user-script/10-dom-render.js`、`40-highlight.js`、`IOS/.../Assets.xcassets/AccentColor.colorset`、`/Users/ike/Dev/SurfEnglish/SurfEnglish-iOS/SurfEnglish-iOS/Components/FeedTranslationStyling.swift`。

---

## 2. 当前设计语言审计（主站 `css/style.css` + `index.html`）

### 2.1 设计 token 现状（实际上没有 token，全部是散落的硬编码值）

| 维度 | 现状（证据） | 问题 |
|---|---|---|
| 主色 | `#007aff` iOS 系统蓝：hero 背景 `style.css:151`；nav hover `:130`；h3 `:270,297,402,510`；footer hover `:445` | 不是品牌色。白字在 #007aff 上对比度 **4.02:1**，hero 副标题 18px 常规体 **不达 WCAG AA** |
| 次级/按钮 | `#cc3355` hero 主按钮 `:181` → hover `#e0b900` 黄 `:191`；`#1d77e9` 白底次按钮文字 `:195`（4.31:1，不达 AA）；`#005bb5` `:141`；`#ff2d55` `.btn-download-store` `:361`（HTML 中已注释，死样式） | 4 个互不相关的强调色。hover 变黄是明显的拼接痕迹（白字 1.89:1） |
| 文本灰阶 | `#222 #333 #444 #555 #666 #999` 混用 | footer `#999` 在白底上 2.85:1，不达 AA |
| 背景 | `#f9f9f9` / `#ffffff` 逐段交替；`#f0f8ff` 仅用于死样式 `.feature-card` `:248` | 典型"条纹分段" |
| 字体 | `-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif` `:12`；标题字 `.app-title` 单独改成 `'Segoe UI','Arial'` `:60` | 没有 CJK/泰文/天城文/阿拉伯文 fallback（chrome-extension 版至少加了 PingFang/YaHei，`chrome-extension/style.css:12`）；字号没有 `clamp`，h1 固定 2.5rem，移动端也是 40px（线上实测 `h1fs: 40px`） |
| 字号层级 | h1 2.5rem `:157`；所有 h2 2rem `:237,318,350,390`；h3 1.25–1.45rem；正文 0.95–1.06rem；line-height 1.5/1.6/1.9 混用 | 层级平、对比弱，没有字距调校（只有 `letter-spacing:1px` 加宽 `:59,:514`，与现代收紧字距的做法相反） |
| 间距 | 每个 section 一律 `4rem 1rem` `:229,309,341,382`；hero `4rem 1rem 6rem` `:153`；feature-row gap 3rem / mb 4rem `:499-500` | 没有间距阶梯，节奏单调 |
| 圆角 | 4px（nav 按钮 `:136`）、6px→24px（同一规则写了两次 `:184/:188`）、10px（卡片/轮播 `:249,333`）、16px（图标 `:261,291`）、26px（功能图 `:533`）、28px（hero 图 `:217`） | 6 种值，没有体系 |
| 阴影 | 几乎都被注释掉了 `:218,334,534,535`；只剩死样式 `.feature-card:hover` `:256` | — |
| 容器宽度 | 1200 `:40,232,417` / 1100（`.features .container` 在 `:490` 被重定义）/ 1000 `:312` / 900 `:385` / 800 `:344` | 5 种宽度，左缘对不齐 |
| 断点 | 900 `:537`、700 `:74` 与 `:456`（两段**互相冲突**的同断点导航规则，前段用 `!important` 覆盖后段）、600 `:220,:477` | 没有平板优化；`.nav-spacer` 写死 64px `:146` |
| 动效 | 只有 0.2s 的 color/background/transform transition；`scroll-behavior:smooth` `:9` 没有 `prefers-reduced-motion` 守卫 | 没有进入动效，没有交互演示 |
| 暗色模式 | 无（`grep prefers-color-scheme` 无结果） | App 本身支持暗色（`RES/wbw_zh/zh-双击.001.png` 是暗色 UI） |
| RTL | `ar-top.html` 有 `dir="rtl"`，但 CSS 用物理属性：`.app-title{margin-left}` `:58`、`.feature-header-horizontal h3{text-align:left}` `:300`；CTA 列表内联 `text-align:left`（`index.html:178`） | 阿拉伯语页对齐错误 |
| 代码形态 | 缩进混杂：`:1-61` 4 空格、`:63-118` 0 空格、`:490-556` 2 空格；`git log -- css/style.css` 只有 1 次提交（2025-06-01） | **[推断]** 由多段片段拼贴而成，此后未系统维护 |

### 2.2 页面结构与实测体量

`index.html` 顺序：fixed header（`:27-42`）→ 蓝色 hero（`:46-60`）→ Key Features 6 段 zig-zag（`:63-151`）→ App Preview 横向轮播 8 张（`:154-168`）→ CTA/订阅（`:171-197`，含 5 处内联 style）→ FAQ 5 问（`:200-234`）→ footer（`:237-259`，"© 2025" 已过期）。SurfEnglish promo 由 JS 插在 `#hero` 之后（`js/surfenglish-promo.js:19,549`）。

线上实测 **[事实]**：
- 桌面（视口 1024）：hero 高 1429px（大于一屏），promo 卡 729px，整页 9324px。**用户在看到任何 WBW 功能之前，先看到的是 SurfEnglish 大卡片。**
- 移动 ja（375×812）：hero 1307px，hero 图顶部在 y=805（首屏之外）；首屏全是文字。features 区 5885px（6 段，每段配图都是同一张 VOA 截图）；promo 996px；整页 11220px。
- 移动端 header 实测高 105px（logo 一行 + 导航一行），但 spacer = 64 + 公告条 50 = 115px，而 header 从 y=51 开始到 y=156 结束 → **hero 顶部被盖住约 41px**。目前靠 hero 的 4rem padding 吸收，没有露出问题，但结构很脆弱。
- ja 移动端 h1 共 4 行，断成"即翻 / 訳"：CJK 没有 `word-break:auto-phrase` / `<wbr>` / `text-wrap:balance` 处理（见浏览器截图）。

### 2.3 "AI 临时搭建的千篇一律模板站"特征清单（逐条有证据）

| # | 特征 | 证据 | 为什么像模板 |
|---|---|---|---|
| T1 | 整块饱和纯色背景、全部居中的 hero：大标题 + 3 句长副标题 + 两枚胶囊按钮（实心 + 白色）+ 下方居中手机图 | `style.css:150-219`，`index.html:46-60` | 2020 年代 SaaS landing 最常见的骨架，信息密度低，个性为零 |
| T2 | 标题是"品牌名 + 泛化口号"：`Word by Word<br>Instant Translation, Smarter Language Learning` | `index.html:47` | 口号可以套到任何翻译 App 上 |
| T3 | hero 副标题是 3 句话的文字墙，最后一句是"WordByWord is your intelligent assistant…" | `index.html:48-52` | 典型 LLM 文案腔 |
| T4 | 6 段**完全同构**的左右交替 feature-row（72px 图标 + 蓝色 h3 + 段落 + 手机图），`.reverse` 机械交替 | `index.html:66-149`；`style.css:495-556` | 最典型的模板节奏；移动端堆叠后长达 5885px |
| T5 | 功能图标是 ChatGPT 生成的线稿插画（文件名就叫 `ChatGPT-feature_swipe.png`），6 张都是"手指 + 几条横线"的同一套构图，高亮色有时粉有时黄 | `img/feature_*.png`（md5 与 `RES/GPT-ICON/ChatGPT Image 2025年6月8日 *.png` 一一相同） | AI 插画的识别度很高，也和真实 App UI 无关 |
| T6 | 每个 section 标题完全相同：居中、2rem、700、`#222`，文案是 "Key Features / App Preview / Frequently Asked Questions" | `style.css:235-241,316-321,388-394` | 泛化分区命名，没有观点 |
| T7 | 白 / 浅灰交替的条纹背景 | `.features #fff` `:228` → `.screenshots #f9f9f9` `:308` → `.cta #fff` `:340` → `.faq #f9f9f9` `:381` | 默认模板配色 |
| T8 | FAQ 是"Q1: …"蓝色 h3 + 段落平铺，不是手风琴 | `index.html:203-232` | — |
| T9 | 轮播与上方内容重复：8 张中 5 张是功能区已经出现过的图；`doubletap_demo` 在页面中出现 3 次 | `index.html:58,91,159` | 典型"凑版面" |
| T10 | 颜色是系统默认色（`#007aff`、`#ff2d55` 都是 iOS 系统色）+ hover 黄 | §2.1 | 没有品牌色系统 |
| T11 | 胶囊按钮 + 卡片 hover 上浮（translateY -4px）+ 软阴影 | `style.css:254-256` | 通用微交互 |
| T12 | chrome-extension 子站：`#667eea→#764ba2(→#f64f59)` 渐变 hero + SVG 圆点纹理；Discord 品牌色 `#5865F2` 作为强调色；emoji 当图标（🚀🎯⚡✨🌟📖🧠🧩🎨🌙⚙️）；"为什么选择 WordByWord？"三卡片（精准/高效/美观）；✓ 列表；深色 footer `#1a1a2e` | `chrome-extension/style.css:64,95,114,121-130,241-270,326,347,365-371,601,688`；`chrome-extension/index.html:49,77-89,98,105` | 这一组合几乎就是 LLM 生成 landing page 的"签名" |

### 2.4 CSS 质量问题（影响重构评估）

- 死样式：`.feature-grid/.feature-card`（`:242-276`）、`.btn-download-store`（`:359-371`）、`.btn-download`（HTML 已注释，`index.html:39`）。
- 冲突与重复：700px 导航规则写了两遍（`:74-118` 带 `!important` vs `:456-476`）；`.features .container` 两次定义（`:231` vs `:490`）；`border-radius` 同一规则写了两次（`:184/:188`）。
- 内联样式：每个落地页 5 处（`grep -c 'style='` = 5），privacy/support 用整块 `<style>`，自成一套设计（卡片 520px、圆角 18，`privacy.html:20+`）。
- 同一个 logo 用两个 URL：header 用 `wbw_logo.png`（`index.html:30`），footer 用 `img/wbw_logo.png`（`:240`），md5 相同，会下载两次。
- App Store 徽章：所有语言页都用 `tools.applemediaservices.com/.../black/en-us`（不本地化，`index.html:187`），promo 却用 `toolbox.marketingtools.apple.com/.../black/<locale>`（`surfenglish-promo.js:24`）。同一页面出现两种来源、两种语言的徽章。
- hero 主按钮 "Download on App Store" 链接到 `#cta` 锚点，没有直接跳 App Store（`index.html:54`）。

### 2.5 现有 SurfEnglish 推广的视觉层观察

- 公告条：全宽深海军蓝渐变 `#0A1630→#1B1F4E`，z-index 1100，压在 WBW header 之上（`surfenglish-promo.css:34-44`），每个页面最顶部都是 SE 的视觉。
- 推广卡：深色"oceanic glass"大卡，三台倾斜手机，圆角 28（`:211-230,347-386`）。卡片本身做得不错，属于 SE 的设计语言；但在浅色 WBW 页面中视觉权重**高于** WBW 自己的 hero（深色、更精致、有动态构图），并且紧贴 hero 之后。**[推断]** 这和"WBW 定位不变、顺带推荐"相冲突。
- 选用的 3 张 SE 截图（feed/translate/word-raid）没有讲"和 WBW 的关系"。SE 官网素材里的 `SEW/public/images/screenshots/browser.jpg`（720×1565）展示的正是 SE 内置浏览器里的 WBW 式**红色引用条 + chunk 下划线**，是最自然的"血缘"桥接图（见 §5.4）。

---

## 3. 素材盘点

### 3.1 `WEB/img/`（根级）

| 文件 | 字节 | 像素 | 内容（看图确认） | 框/字/底 | 重复（md5） | 结论 |
|---|---|---|---|---|---|---|
| `Screenshot-1.png` | 1,686,999 | 1530×3036 | iPhone 框，Safari 打开 VOA "Wilbur and Orville Wright: The First Airplane"，只有文章头图，**看不到任何翻译或查词功能** | 有设备框；透明底（14.1% 透明，不透明 bbox x64-1466 y72-2964） | **组 A**（`5d5463ff…`） | 质量不足：不表达功能。19 个非英语页的 hero 用的就是它 |
| `feature_swipe_demo.png` | 1,686,999 | 1530×3036 | 同上 | 同上 | 组 A | 冗余，删除/停用 |
| `feature_doubletap_demo.png` | 1,686,999 | 同 | 同上 | 同上 | 组 A | 同上 |
| `feature_tts_demo.png` | 1,686,999 | 同 | 同上 | 同上 | 组 A | 同上 |
| `feature_context_demo.png` | 1,686,999 | 同 | 同上 | 同上 | 组 A | 同上 |
| `feature_history_demo.png` | 1,686,999 | 同 | 同上 | 同上 | 组 A | 同上 |
| `feature_customize_demo.png` | 1,686,999 | 同 | 同上 | 同上 | 组 A | 同上 |
| `Screenshot-2/3/4.png` | — | — | **不存在**；线上 404（`curl` → 404, 9379 B 错误页） | — | — | 19 页 × 3 张破图 |
| `ChatGPT-feature_swipe.png` | 1,120,595 | 1024² | AI 线稿：弯箭头 + 3 条蓝线 + 粉色高亮条 + 手指 | 白底、无 alpha | ≡ `RES/GPT-ICON/…15_14_20.png` | AI 感强；用于 72px 时浪费约 1 MB |
| `ChatGPT-feature_swipe-2.png` | 1,115,679 | 1024² | 同构图的彩色版：浅蓝圆角方底、黄色高亮、肤色手 | 自带浅蓝方底 | 独有 | **未被任何页面引用** |
| `feature_doubletap.png` | 1,018,082 | 1024² | AI 线稿：双击波纹 + 黄高亮 | 白底 | ≡ GPT-ICON 21_24_18 | 同 T5 |
| `feature_context.png` | 872,854 | 1024² | AI 线稿：放大镜 + 分子节点 + 粉条 | 白底 | ≡ GPT-ICON 21_24_40 | 同上 |
| `feature_customize.png` | 854,935 | 1024² | AI 线稿：齿轮 + 滑杆 | 白底 | ≡ GPT-ICON 21_24_47 | 同上 |
| `feature_tts.png` | 930,774 | 1024² | AI 线稿：喇叭 + 粉条 | 白底 | ≡ GPT-ICON 21_24_54 | 同上 |
| `feature_history.png` | 898,360 | 1024² | AI 线稿：时钟 + 粉条 | 白底 | ≡ GPT-ICON 21_25_19 | 同上 |
| `feature_swipe.png` | 540 | 32×32 | 极小的手势线稿 | 透明 | 独有 | 未使用（`grep` 只匹配到 `ChatGPT-feature_swipe.png` 的子串） |
| `wbw_logo.png` | 7,575 | 192×192 | 圆形 logo（见 §4） | 透明 | ≡ `WEB/wbw_logo.png`（组 D） | 分辨率只够 96px@2x；需要大图可以从 1024 AppIcon 派生 |

### 3.2 `WEB/img/en/`（英语页专用，内容正确度明显更高）

| 文件 | 字节 | 像素 | 内容 | 框/底 | 重复 | 结论 |
|---|---|---|---|---|---|---|
| `feature_swipe_demo.png` | 1,240,369 | 1530×3036 | es.m.wikipedia（西班牙语）每句下插入英文译文，**红色引用条** | iPhone 框 + 透明底 | — | ✅ 划词翻译主图 |
| `feature_doubletap_demo.png` | 1,747,453 | 同 | 双语段落 + 黄色高亮 "convirtiéndose" + AI 释义卡（Verb, IPA, 语境释义, "More Definitions"） | 同上 | **组 B** ≡ `feature_context_demo.png`（`3864f897…`） | ✅ **最佳 hero 候选**：一帧里同时有划译和查词 |
| `feature_context_demo.png` | 1,747,453 | 同 | 同上 | 同上 | 组 B | 与 doubletap 重复；"Context Analysis" 段需要换图或合并 |
| `feature_tts_demo.png` | 1,574,218 | 同 | 双语段落 + 底部 TTS 播放器（1/3、⏮⏸⏭、Hide Text） | 同上 | — | ✅ AI 朗读配图 |
| `feature_history_demo.png` | 1,256,214 | 同 | **实际是 "Swipe Translation Detail" + "Get AI Syntax Explanation" + 3 条句法解释卡** | 同上 | — | ⚠️ 名不副实：应作为"AI 句法/长难句解析"配图；History 没有真实截图 |
| `feature_customize_demo.png` | 708,704 | 同 | 设置 sheet：Auto 分段 / Quote Style / Local Read / 清除历史 | 同上 | — | ✅ 个性化设置配图 |
| `more_definitions.png` | 664,983 | 同 | 词典详情 "matrimonio"：Definition + Example sentences | 同上 | — | ✅ 词典详情配图 |
| `language_setting_en.PNG` | 114,347 | 1206×2622 | 源语言 Spanish / 目标语言 English(US) 设置页 | **无设备框**、不透明、扩展名大写 | — | 可用，但必须套 CSS 机身框才能和其他图统一 |
| `select_language_en.PNG` | 202,750 | 1206×2622 | 语言列表（越南语…土耳其语） | 无框 | — | 同上；适合做"20+ 语言"配图 |

> 共同点：`*_demo.png` 都是同一套 iPhone 机身 mockup，四周约 64/72px 透明留白（Swift bbox 实测 x64-1466 y72-2964）。**放在任何底色上都成立**，深浅色主题都能用。

### 3.3 `WEB/img/surfenglish/`

| 文件 | 字节 | 像素 | 内容 | 备注 |
|---|---|---|---|---|
| `feed.jpg` | 139,281 | 600×1304 | SE 首页信息流（BBC Sport，A2/B2 标签，玻璃底栏） | 原始截图，无框，暗色 |
| `translate.jpg` | 135,034 | 600×1304 | 同一信息流 + 中文译文，**红色引用条**（采样 ≈ `#C8345E`，JPEG 压缩后的 #CC3355） | 能证明 SE 继承了 WBW 的视觉 DNA |
| `word-raid.jpg` | 187,906 | 600×1304 | Word Raid 复古 LCD 游戏 | — |
| `icon-192.png` | 18,073 | 192² | SE 图标：深海军蓝→天蓝的平面波浪色带 | 色值见 §4.2 |

### 3.4 `WEB/chrome-extension/img/`

| 文件 | 字节 | 像素 | 内容 | 结论 |
|---|---|---|---|---|
| `hero-screenshot.png` | 186,411 | 1280×800 | Chrome 中的 VOA 文章：中文行内译文 + 红色引用条 + **彩色波浪 chunk 下划线** + 悬浮词卡 | ✅ 桌面端最好的产品图；≡ `screenshot-3.png`（**组 C**，`6b526cdd…`） |
| `screenshot-1.png` | 233,787 | 1280×800 | 同场景 + 扩展弹窗（设置面板，紫色 toggle） | ✅ |
| `screenshot-2.png` | 237,483 | 1280×800 | 选中整句 → 深色译文浮层 | ✅ |
| `screenshot-3.png` | 186,411 | 1280×800 | 与 hero 相同 | 冗余 |
| `screenshot-4.png` | 22,366 | 372×608 | 扩展弹窗竖向特写 | 分辨率偏低（只够约 186px@2x 宽） |
| `feature-inline.png` | 87,026 | 787×500 | hero 截图的裁切：双语 + chunk 波浪线 | ✅ 可做"证据条" |
| `feature-definition.png` | 54,828 | 709×253 | 裁切：黄色高亮 "experiments" + 词卡 "实验" | ✅ |
| `feature-structure.png` | 52,859 | 734×235 | 裁切：彩色 chunk 下划线 + 释义卡 "一片沙地" | ✅ |
| `logo-azure.png` | 23,264 | 512² | Azure 标志，透明 | 第三方商标，需遵守其品牌规范 |
| `logo-chatgpt.png` | 1,462 | **50×50** | ChatGPT 标志 | ⚠️ 分辨率不足 |
| `logo-gemini.png` | 35,687 | 450×253 | Gemini 字标，**不透明灰底**（角落 `#E3E3E3`） | ⚠️ 质量不足 |
| `logo-google.png` | 8,720 | 366×48 | Google 字标，透明 | 第三方商标 |
| `text-attribution.png` | 8,541 | 640×91 | "powered by Google Translate" 归属标识 3 种 | **未被引用** |

### 3.5 `WEB/wbw_logo.png`、`WEB/favicon.ico`

- `wbw_logo.png`：7,575 B，192×192，透明，圆形裁切的 App 图标（与 `img/wbw_logo.png` 相同）。
- `favicon.ico`：5,238 B，32×32，内容同样是圆形 logo（转 PNG 后看图确认）。没有 180px apple-touch-icon / 192/512 PNG / `theme-color`。
- 母版：`IOS/WordByWordPrototype/Assets.xcassets/AppIcon.appiconset/AppIcon~ios-marketing.png`，58,453 B，1024²，**可以作为所有 favicon/OG 派生图的母图**。注：该 appiconset 里的 dark/tinted 两个变体与默认图 md5 完全相同（`ceb0ffef…`），也就是没有单独设计暗色图标。这在网站范围之外，仅供参考。

### 3.6 `RES/`（本地素材库，网站目前**完全没用**）

#### `RES/GPT-ICON/`（6 张，均 1024²、无 alpha）
与 `WEB/img` 的 6 个功能图标逐一 md5 相同（**组 E**），是它们的原始出处。结论同 T5：属于 AI 插画，不建议继续放在显眼位置。

#### `RES/wbw_en/`（10 张）

| 文件 | 字节 | 像素 | 内容 | 框/字/底 | 结论 |
|---|---|---|---|---|---|
| `wbw_en.001.png` | 1,053,918 | 1284×2778 | 标题 "Any webpage, one swipe—instant bilingual reading"（粉→黄渐变字）+ 小图标 + 说明 + 手机（=`img/en/feature_swipe_demo` 同一屏） | 设备框 + **烘焙英文标题** + 黑→`#3B3B3B` 竖向渐变底 | App Store 6.5″ 营销图；网页可以裁出手机部分用 |
| `wbw_en.002.png` | 1,347,697 | 同 | "Double-tap a word, get AI-powered context-perfect meanings" + 查词卡（带 2.1 s 耗时） | 同上 | ⚠️ **缺陷**：英文图里的查词卡按钮是意大利语 "Altre definizioni"（裁切放大确认），英文站请改用 `img/en/feature_context_demo.png` |
| `wbw_en.003.png` | 1,222,725 | 同 | "Natural, crystal-clear AI speech" + TTS 播放器 | 同上 | ✅ |
| `wbw_en.004.png` | 1,064,723 | 同 | "AI dissects sentence structure…" + 句法解析 | 同上 | ✅ |
| `wbw_en.005.png` | 674,321 | 同 | "Pick your source, target, and even app language" + **两台叠放手机**（语言列表 + 设置） | 同上 | ✅ 唯一的双机构图 |
| `wbw_en.006.png` | 700,815 | 同 | "Fine-tune the details" + 设置 sheet | 同上 | ✅ |
| `wbw_en.007.png` | 661,152 | 同 | "Plenty of smart learning tools await" + matrimonio 词典页 | 同上 | ✅ |
| `ChatGPT Image 2026年4月23日 14_21_09.png` | 1,842,028 | 1284×2778 | "Perfectly optimized for X (formerly Twitter)…" + X 时间线（NHK 帖子，日文原文 + 英文译文 + "Extract chunks" 按钮） | AI 合成营销图，黑底 + 橙粉光晕 | 内容真实可用；属于 AI 合成，**[推断]** 宜改用原始截图 + CSS 框 |
| `Gemini_Generated_Image_yyguglyyguglyygu.png` | 5,520,705 | 1408×3040 | 同主题另一版 "Perfectly Adapted for X" | **右下角有 Gemini ✦ 水印** | ❌ 不要直接使用 |
| `スクリーンショット 2026-04-23 12.03.10.png` | 553,407 | 1206×2622 | X 时间线**原始截图**（NHK 日文 → 英译，Extract chunks） | 无框，圆角透明角 | ✅ X 功能的真实原图 |

#### `RES/wbw_jp/`（9 张）—— **确认是完整本地化截图**
UI 文案是日文（"他の意味""動詞（過去形）""スワイプ翻訳詳細""閉じる""右スワイプ翻訳モード設定"），示例文章是英文 VOA，译文是日文（EN→JA 场景），营销标题也是日文。

| 文件 | 字节 | 像素 | 内容 |
|---|---|---|---|
| `wbw_jp.001.png` | 1,138,432 | 1284×2778 | 「任意の Web ページを右にスワイプするだけで即座に対訳表示」+ VOA 英文 + 日文译文 |
| `wbw_jp.002.png` | 1,364,146 | 同 | 「単語をダブルタップ、AI が文脈を読み取り正確な意味を提示」+ "designed" 查词卡 → **ja 最佳 hero** |
| `wbw_jp.003.png` | 1,275,882 | 同 | 「自然でクリアな AI 合成音声」+ TTS 播放器 |
| `wbw_jp.004.png` | 1,105,221 | 同 | 「AI が文構造を分解し…」+ スワイプ翻訳詳細 / AI 文型解説 |
| `wbw_jp.005.png` | 684,487 | 同 | 「原文・翻訳・アプリ UI の言語を自由にカスタマイズ」+ 双机 |
| `wbw_jp.006.png` | 720,731 | 同 | 「細部まで自分好みに」+ 设置（自動 / 引用スタイル / ローカル読み上げ） |
| `wbw_jp.007.png` | 706,640 | 同 | 「さらに多彩なスマート学習ツール」+ "continued" 词典页，**含"語形変化"（词形变化）**，网站没有提到这一功能 |
| `ChatGPT Image 2026年4月23日 14_13_20.png` | 2,398,654 | 1284×2778 | 「X（旧Twitter）にも完全対応」+ X 时间线（OpenAI 帖子），AI 合成 |
| `スクリーンショット 2026-04-23 11.52.02.png` | 1,093,642 | 1206×2622 | X 原始截图（OpenAI "gpt-image-2" 帖子 + 日文译文 + 黄色查词 "capable"）。⚠️ 按钮文案是中文"提取语言块"，**日文图里混入了中文 UI** |

#### `RES/wbw_zh/`（11 张）—— **确认是简体中文本地化截图**
UI 是简体中文（"右滑翻译详情""获取 AI 句型解析""释义""词形变化""关闭"），译文是中文（EN→ZH）。

| 文件 | 字节 | 像素 | 内容 |
|---|---|---|---|
| `zh-右滑翻译.png` | 1,112,300 | 1284×2778 | 「任意网页，一滑即译，立刻开启双语阅读体验。」 |
| `zh-双击.001.png` | 1,407,894 | 同 | 「双击单词，智能释义，读懂不靠猜」，**App 处于暗色模式**（查词卡为深色） |
| `zh-TTS.001.png` | 1,208,396 | 同 | 「AI 合成语音，自然清晰，句子也能朗读」 |
| `AI句型解析.001.png` | 1,003,799 | 同 | 「AI 解析语法结构，复杂句子也一目了然」；返回按钮写着"右滑翻译历史"，说明句法解析是从**历史记录**进入的 |
| `zh-语言设置.001.png` | 680,405 | 同 | 「源语言、目标语言、界面语言，都由你决定。」双机 |
| `zh-设置.001.png` | 630,094 | 同 | 「个性化设置，自由掌控」（逐句 / 引用样式 / 本地朗读） |
| `zh-更多.001.png` | 647,353 | 同 | 「更多功能，等你亲自解锁体验」"place" 词典页（含词形变化） |
| `ChatGPT Image 2026年4月23日 12_58_37.png` | 1,121,124 | **853×1844** | 「完美适配了X（旧Twitter）」，AI 合成；**分辨率低于其他图** |
| `Gemini_Generated_Image_w92y4pw92y4pw92y.png` | 4,236,914 | 1284×2778 | 同上，**右下 Gemini ✦ 水印** ❌ |
| `スクリーンショット 2026-04-23 11.53.37.png` | 1,088,530 | 1206×2622 | X 原始截图（OpenAI 帖 + 中文译文 + 查词浮层"生成，产生"） |
| `スクリーンショット 2026-04-23 12.44.50.png` | 965,962 | 1206×2622 | X 原始截图，**语言块（chunk）已展开**：彩色下划线 + "关闭语言块" + 浮层"更好的工作流控制"（GitHub Copilot/Atlassian 帖子） |

> 营销图模板实测 **[事实]**：所有 `wbw_*.00N` 的底色都是左上 `#000000` → 1/3 高处 `#141414` → 底部 `#3B3B3B` 的竖向渐变；手机顶部统一在 y≈804/2778（29%）。`.005` 双机图在 y≈726（26%）。因此可以**按统一参数裁切**（例如 y≥760）得到"深色渐变底上的带框手机"，适合放进深色区块。

### 3.7 重复组汇总（md5）

| 组 | md5 | 文件 | 处理建议 |
|---|---|---|---|
| A | `5d5463ff56a1931567e6c7a77c5f1cbf`（1,686,999 B ×7） | `img/Screenshot-1.png` + `img/feature_{swipe,doubletap,tts,context,history,customize}_demo.png` | 全部停用（内容无效）；非英语页改用本地化图或 `img/en/` |
| B | `3864f89793e03ccb00828f8c5979d95a`（1,747,453 B ×2） | `img/en/feature_context_demo.png` = `img/en/feature_doubletap_demo.png` | 保留一份；"语境分析"段换图或与查词合并 |
| C | `6b526cdd07f447be7fb45877e23b7c7a` | `chrome-extension/img/hero-screenshot.png` = `screenshot-3.png` | 保留一份 |
| D | `f271d1cf9f12ffb03ae2ebb59a99da1c` | `wbw_logo.png` = `img/wbw_logo.png` | 统一引用一个 URL |
| E | 6 对 | `img/{ChatGPT-feature_swipe,feature_doubletap,feature_context,feature_customize,feature_tts,feature_history}.png` = `RES/GPT-ICON/*.png` | 出处一致；见约束 §6 |
| — | `ceb0ffef…` ×4 | iOS AppIcon 默认 / dark / tinted / AppLogo | 网站之外的问题，仅记录 |

### 3.8 功能 × 素材 × 语言 映射矩阵（重构时直接查用）

| 功能（建议的功能命名） | 英文素材 | 日文素材 | 简中素材 | 桌面/扩展 |
|---|---|---|---|---|
| 右滑逐句翻译 / 双语对照阅读 | `img/en/feature_swipe_demo.png`；`wbw_en.001` | `wbw_jp.001` | `zh-右滑翻译.png` | `chrome-extension/img/feature-inline.png`、`hero-screenshot.png` |
| 双击查词 · 语境释义 · 短语识别 | `img/en/feature_doubletap_demo.png`（不要用 `wbw_en.002`，有意大利语缺陷） | `wbw_jp.002` | `zh-双击.001`（暗色） | `feature-definition.png` |
| AI 朗读（AI 语音 / 本地 TTS） | `img/en/feature_tts_demo.png`；`wbw_en.003` | `wbw_jp.003` | `zh-TTS.001` | — |
| AI 句法 / 长难句解析 | `img/en/feature_history_demo.png`（文件名有误导）；`wbw_en.004` | `wbw_jp.004` | `AI句型解析.001` | `feature-structure.png` |
| 词典详情（释义 / 例句 / 词形变化） | `img/en/more_definitions.png`；`wbw_en.007` | `wbw_jp.007`（含語形変化） | `zh-更多.001`（含词形变化） | — |
| 20+ 语言对 / 界面语言 | `language_setting_en.PNG`、`select_language_en.PNG`；`wbw_en.005` | `wbw_jp.005` | `zh-语言设置.001` | — |
| 个性化设置 | `img/en/feature_customize_demo.png`；`wbw_en.006` | `wbw_jp.006` | `zh-设置.001` | `screenshot-1.png`、`screenshot-4.png` |
| **X/Twitter 时间线逐句翻译**（站上未提） | `RES/wbw_en/スクリーンショット 12.03.10` | `RES/wbw_jp/スクリーンショット 11.52.02`（混有中文按钮） | `RES/wbw_zh/スクリーンショット 11.53.37` | — |
| **语言块 Chunks 提取**（站上未提） | 同上图里的 "Extract chunks" 按钮 | — | `スクリーンショット 12.44.50`（已展开） | `feature-inline.png`、`feature-structure.png`（彩色波浪线） |
| 历史记录 / 自动分组 | **无真实截图** | 无 | 无（只有句法页顶部"右滑翻译历史"返回按钮） | — |

**[推断] 语言覆盖**：真正本地化的只有 en / ja / zh-CN。zh-TW 若用简体 UI 截图会出现繁简错位，建议 zh-TW 用英文图，或者接受简体 UI 并在 alt 中说明。其余 17 种语言用英文 UI 截图：示例本身就是"西语原文 + 英文译文"，对非英语用户依然能说明功能，而且远好于现在的 VOA 空白图。

### 3.9 用途分级

- **Hero 候选**（按语言）：en → `img/en/feature_doubletap_demo.png`，一帧里双语 + 高亮 + 释义卡，信息量最大；ja → `wbw_jp.002` 裁出的手机；zh-CN → `zh-双击.001`（暗色）或 `zh-右滑翻译` 裁出的手机；chrome-extension → `hero-screenshot.png`。备选构图：3 机扇形（划译 / 查词 / 句法）。
- **功能配图**：§3.8 矩阵中的 ✅ 项。
- **证据条 / 细节特写**：`chrome-extension/img/feature-*.png`（真实 chunk 波浪线、词卡，横幅比例，适合穿插在正文中）。
- **质量不足 / 不建议**：组 A 全部；`wbw_en.002`（意大利语按钮）；两张 Gemini 图（水印）；`wbw_zh` 的 ChatGPT 图（853×1844 低分辨率）；`logo-chatgpt.png`（50px）；`logo-gemini.png`（灰底）；`screenshot-4.png`（低分辨率，只能小尺寸）；6 个 AI 插画图标（不宜作为主要视觉）。
- **第三方内容**：截图中出现 VOA、es.wikipedia、NHK、OpenAI、GitHub/Atlassian、BBC（SE）内容及其标志。**[推断]** 作为功能演示一般可以接受，但 OpenAI/GitHub 的品牌帖子比较显眼，优先选 NHK/VOA 场景，必要时用 CSS 模糊处理头像。

### 3.10 体量与压缩实测（scratchpad 内，未动仓库）

| 样本 | 原始 | 处理 | 结果 |
|---|---|---|---|
| `img/en/feature_swipe_demo.png` 1530×3036 | 1,240,369 B | `sips -s format avif -s formatOptions 60 -Z 1310` → 660×1310，保留 alpha | **67,659 B**（-95%）；解码后裁切看图，文字清晰 |
| 同上 | — | PNG 660×1310 | 398,965 B（透明 PNG 作 fallback 太重） |
| `wbw_jp.002.png` 1284×2778 | 1,364,146 B | AVIF 647×1400 / JPEG q78 | 59,713 B / 170,726 B |
| `wbw_jp.001.png` | 1,138,432 B | JPEG q78，1000 高 | 113,254 B |
| JP 原始截图 1206×2622 | 1,093,642 B | JPEG q80，720 宽 | 67,009 B |
| `img/feature_tts.png` 1024² | 930,774 B | PNG 144² | 16,899 B |

工具链 **[事实]**：本机只有 `sips` 和 Swift/ImageIO。ImageIO 可写格式为 `jpeg/png/heic/avif/jpeg-2000`，**不能写 WebP**；没有 `cwebp/avifenc/magick/pngquant/ffmpeg`；Python 没有 PIL。所以零依赖方案就是 `sips` 输出 AVIF + JPEG/PNG fallback（`<picture>`）。AVIF 需要 Safari 16.4+ 或 Chrome 85+。

---

## 4. 品牌元素

### 4.1 Logo / App 图标结构 **[事实]**
- App 图标（1024²）：**4×4 方块马赛克**，只有 4 个色阶（黑 + 3 级品牌红）。上面是一个**白色斜体板衬线（slab-serif）大写 "T"**，左侧有 3 条水平"速度线"（运动感，对应"划过"手势）。
- 网站用的是圆形裁切版（`wbw_logo.png` 192²，以及 favicon 32²）。
- 4×4 网格逐格采样（中心点）：
  ```
  #000000 #000000 #882239 #44111C
  #44111C #44111C #44111C #000000
  #882239 #882239 #44111C #CC3355
  #000000 #882239 #000000 #CC3355
  ```
  面积占比：黑 30.5% / `#44111C` 22.1% / `#882239` 22.0% / `#CC3355` 12.5% / 白（T）12.3%。

### 4.2 精确色值与出处

| 色 | 值 | 出处（证据） |
|---|---|---|
| 品牌红 Crimson | **#CC3355** | AppIcon 采样；`IOS/.../AccentColor.colorset`（display-p3 r0.800 g0.200 b0.333）；App 内双语引用条 `IOS/Resources/user-script/10-dom-render.js:1138`（`border-left: 3px solid #cc3355;padding-left: 8px;`）；SurfEnglish iOS `FeedTranslationStyling.swift:21-22`（"WordByWord 品牌红（浏览器端 #cc3355）"`brandRed = Color(hex: "#CC3355")`）；现网 hero 按钮 `style.css:181` |
| 勃艮第 Burgundy | **#882239** | 图标；= #CC3355 亮度 × 2/3（同色相阶梯） |
| 牛血 Oxblood | **#44111C** | 图标；= #CC3355 亮度 × 1/3 |
| 墨黑 | #000000 | 图标 |
| 查词高亮黄 | **#FEE437** | `img/en/feature_doubletap_demo.png` 采样（16,956 px） |
| App 工具栏粉 | #E55A83 | 截图采样；仅可作装饰（白底对比度 3.43:1） |
| Chunk 调色板 | `#45b8d8 #f38eb1 #73c86b #8f88f7 #f3a45c #56c7b2 #f07b72 #6ca8ff #c18cf2 #d2b45f` | `IOS/Resources/user-script/40-highlight.js:22-31` |
| SE 图标色带 | `#0E4474 #1D4C78 #2D567D #3C6083`（深）/ `#96D1F2 #C5E9FD #D8F0FE`（浅） | `img/surfenglish/icon-192.png` 采样 |

可访问性 **[事实]**（WCAG 计算）：#CC3355 在白底上 5.03:1（AA ✓），在暖白 #FBF8F3 上 4.75:1（AA ✓），在纯黑上 4.17:1（只适合大字）；白字在 #882239 上 8.99:1、在 #44111C 上 15.64:1。品牌红系本身就能撑起可访问的配色。

### 4.3 产品自带的视觉语汇（最适合在网页上用 CSS 复刻）

1. **红色引用条**：3px #CC3355 左边线 + 8px 内边距，用于译文块（`10-dom-render.js:1138`）。在所有截图里都能看到，是 WBW 最强的识别符号。
2. **黄色荧光笔高亮**：查词词语背景 #FEE437。
3. **彩色波浪 chunk 下划线**：`text-decoration-style: wavy`（`10-dom-render.js:1448`），10 色调色板。
4. **速度线**：logo 的 3 条渐短横线，可作为"划过"手势和分隔装饰。
5. **4 阶马赛克方块**：可以用 CSS grid / `conic-gradient` 生成背景、分隔条或卡片角标。

### 4.4 [推断] WBW token 草案（供设计阶段落地）

```css
:root{
  --wbw-crimson:#CC3355; --wbw-burgundy:#882239; --wbw-oxblood:#44111C; --wbw-ink:#0B0B0C;
  --wbw-paper:#FBF8F3; /* 暖纸白，建议值 */  --wbw-marker:#FEE437;
  --wbw-quote: 3px solid var(--wbw-crimson);
  --ck1:#45b8d8; --ck2:#f38eb1; --ck3:#73c86b; --ck4:#8f88f7; --ck5:#f3a45c; /* 取自 40-highlight.js */
  --radius-sm:8px; --radius:14px; /* 比 SE 的 16/26 更"方"，呼应马赛克 */
  --font-sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,"PingFang SC","Hiragino Sans","Microsoft YaHei","Noto Sans","Noto Sans Thai","Noto Sans Devanagari","Noto Sans Arabic",sans-serif;
  --font-read: ui-serif,"New York","Iowan Old Style","Hiragino Mincho ProN","Songti SC",Georgia,serif; /* 阅读样张专用；logo 的 T 是斜体板衬线 */
}
```

---

## 5. 与 SurfEnglish 的家族化设计

### 5.1 SurfEnglish 设计语言摘要（`SEW/src/css/style.css`）**[事实]**
- 深色基底 `#04060D`，加 5 层 radial-gradient 的"深海"背景（`:44-52`）；玻璃卡（`rgba(255,255,255,.06)` + `blur(22px) saturate(180%)`，`:90-96`）。
- 强调色：青 `#4FD2FF` + 紫 `#B388FF` 渐变（`:6-7,20`）；`--quote:#FF5C8A` 用作译文引用条（`:10,435`）；chunk 色 `#F38EB1/#73C86B/#A98BEA/#F0A05A`（`:312`），与 WBW 调色板高度重合。
- 版式：容器 1120（`:54`）；h1 `clamp(2.4rem,5.5vw,4rem)`，字距 -0.02~-0.035em，`text-wrap:balance`（`:56-58,178-182`）；eyebrow 大写 + 0.14em 字距，并为 CJK/泰/印地/阿语单独收窄（`:67-72`）；section 上下 110px（`:364`）；断点 900/560。
- 组件：两栏 hero（文案 + **HTML 复刻的 App 实时演示** `.demo-screen`，按 pt 单位精确还原，`:212-358`）；CSS 机身框 `.phone`（圆角 54、内边距 11、渐变边框，`:196-207`）套原始截图；关键词用 `.kw` 渐变下划线标注，直接借用 chunk 下划线的视觉（`:80-88`）；`<details>` 手风琴 FAQ（`:487-493`）；reveal 动效配 `prefers-reduced-motion` 守卫（`:568-574`）；全面使用逻辑属性（`inset-inline`、`margin-inline-start`），RTL 友好。
- 图片规范：截图 720×1565 JPG，带 `width/height`、`loading`、`fetchpriority`（`SEW/src/templates/home.mjs:23`）；每个 locale 有 1200×630 OG 图（`SEW/public/images/og-*.png`）。

### 5.2 家族一致性：共享什么（"同一个开发者"的语法）**[推断]**
1. **同一套 token 架构和组件语法**：变量命名（`--accent/--ink/--hairline/--radius`）、type scale 公式（clamp + 负字距 + balance）、eyebrow、胶囊 `.btn`、App Store 徽章、CSS `.phone` 机身框、`<details>` FAQ、多列 footer + 语言列表、面包屑、section 节奏、900/560 断点、reveal + reduced-motion、逻辑属性。用户在两个站之间跳转时，会感到"同一种手感"。
2. **同一套"阅读标注"隐喻**：两站都用红色引用条表示译文、用彩色 chunk 线表示语块。证据：SE App 直接沿用 WBW 的 #CC3355（`FeedTranslationStyling.swift:21-22`），SE 官网 `--quote` 是更亮的 #FF5C8A。这是两个品牌之间可见的"血缘印记"。
3. **同一种图标哲学**：两个 App 图标都是"单一色相 4 阶 + 平面几何"（WBW 红色系方块，SE 蓝色系波浪），可以在 footer 并排展示为"家族徽章"。
4. **互链**：SE 官网目前完全没有提到 WordByWord（`grep -i wordbyword SEW/src/templates SEW/src/locales/en.json` 无结果），家族关系只有单向。可以在两站 footer 加对称的"From the makers of …"（是否需要由 SEO 报告决定）。

### 5.3 WBW 的独立识别：区分什么 **[推断]**

| 维度 | WordByWord | SurfEnglish |
|---|---|---|
| 场景隐喻 | 纸面与墨：在**任何网页**上读外语（网页多为浅色） | 夜海冲浪：沉浸式内容流 |
| 明暗基调 | **浅色暖纸为主**，墨黑 / 牛血色作重点带 | 深色为主 |
| 强调色 | #CC3355 单色相阶梯，**不用渐变**，实色、印刷感 | 青紫渐变、发光 |
| 材质 | 平面、纸张、细线（hairline）、方块马赛克 | 玻璃拟态、模糊、光晕 |
| 几何 | 更方的圆角（8/14），方格节奏 | 柔和大圆角（16/26），波浪 |
| 标题标注 | 黄色荧光笔 + 左侧红引用条（取自查词 / 译文 UI） | `.kw` 渐变下划线 |
| 字体气质 | 无衬线 UI + **衬线阅读样张**（呼应 logo 的板衬线 T） | 全无衬线 |

### 5.4 SE 推荐区块的视觉处理建议 **[推断]**
- **位置**：从 `#hero` 之后移到 WBW 功能讲完之后，例如 FAQ 之前，作为"下一步 / 进阶"。只需改 `CONFIG.sectionAfter`（`js/surfenglish-promo.js:19`）。顶部公告条建议改成 WBW 自己的视觉（细条、纸白底、红色引用条起头），或者只在二级页显示，不要用 SE 的深海配色压住 WBW 的 header。
- **构图**：保留 SE 深色卡作为浅色页面中的"一扇窗"。明暗反差本身就在说"这是另一个产品"，反而有利于 WBW 保持身份。卡片里加一行家族说明，并用 `SEW/public/images/screenshots/browser.jpg` 作为桥接图（SE 内置浏览器里的同款红色引用条 + chunk 线），讲"你熟悉的右滑翻译，在 SurfEnglish 里升级了"。比现在的 feed/word-raid 更"对用户有益"，也更自然。
- **双品牌徽记**：WBW 圆形 logo 与 SE 波浪图标并排，中间用细线连接，表示"同一开发者"。不需要新素材。

---

## 6. 视觉升级约束清单（只用现有素材）

### 6.1 素材使用规则
1. 只用 §3 盘点的现有图片，包括 `SEW/public/images/screenshots/*` 与 `SEW/public/icons/*` 这些兄弟站现有素材。**[待用户确认]** 缩放、裁切、格式转换（AVIF/JPEG）、压缩、从 1024 AppIcon 派生 favicon / apple-touch-icon / OG 图，默认视为"非新增素材"。
2. 语言 → 素材集：en 及 17 种无本地化截图的语言用 `img/en/` + `RES/wbw_en`（排除 `.002`）；ja 用 `RES/wbw_jp`；zh-CN 用 `RES/wbw_zh`；zh-TW 待定（§3.8）。
3. 组 A 的 7 个文件全部停用；`Screenshot-2/3/4` 的引用全部移除。
4. 一张图只在一页出现一次（取消"轮播重复上方配图"）。
5. 不使用：Gemini 水印图、`wbw_en.002`、`wbw_zh` 的 853px ChatGPT 图、`logo-chatgpt.png`、`logo-gemini.png`。AI 插画图标降级处理（见 6.2 第 6 条）或不用。
6. "History"功能没有图 → 改用 `AI句型解析` 的"右滑翻译历史 → 详情"叙事合并呈现，或只用文字 / CSS 列表示意。

### 6.2 只用 CSS / 排版就能做到的
1. **品牌 token 化**（§4.4），把 #007aff 从品牌层移除，蓝色只留给"网页链接"示意。
2. **红色引用条**作为全站排版母题：引用、功能要点、FAQ 答案左边线（`border-inline-start: 3px solid #CC3355`，RTL 自动镜像）。
3. **荧光笔高亮**标注标题关键词：`background: linear-gradient(transparent 60%, #FEE437 60%)`；**波浪 chunk 线**标注副标题：`text-decoration: underline wavy var(--ck2)`。
4. **马赛克方块**：用 4 阶红黑 CSS grid 做 hero 背景、section 分隔、卡片角标（复刻图标网格，零图片）。
5. **速度线**：3 条 `::before` 横线，做 eyebrow 前缀 / 手势提示 / 分隔。
6. AI 图标若暂时保留：缩到 144px 并加 `mix-blend-mode:multiply`，在浅色底上去掉白底；或者统一套进红色方块容器，降低插画感。
7. **HTML 实时双语样张**（参考 SE 的 `.demo-screen`）：在 CSS 机身里用真实 HTML 文本渲染"原文 → 红条译文 → 黄色查词 → 释义卡"，加 swipe / ripple 动效。零图片字节，可以按语言本地化，**同时是可索引文本**（对 SEO 也有好处）。示例句子要**自写**，不要照搬 VOA / Wikipedia 原文（版权和署名问题）。
8. 排版：`clamp()` 字号阶梯、负字距、`text-wrap: balance/pretty`；CJK 用 `word-break: auto-phrase`（Chromium）+ `<wbr>` + `line-break: strict`，修复"即翻/訳"这类断行；为 ja/zh/ko/th/hi/ar 设置 eyebrow 字距例外（照搬 SE `:71-72`）。
9. 布局：取消 6 段等权 zig-zag，改成"1 个主功能大段 + 2×2/3 栏次功能网格 + 1 个证据条（扩展截图裁切）"的混合节奏；统一容器宽度（1120）与 section 间距阶梯。
10. 暗色模式（`prefers-color-scheme`）：`*_demo.png` 透明底天然适配；App Store 裁切图本来就是深色底。
11. 动效：reveal + 手势演示，全部受 `prefers-reduced-motion` 控制。
12. 可访问性：修复 §2.1 和 §4.2 的对比度问题；hero CTA 直接链接 App Store 并使用本地化徽章（与 promo 同源）。

### 6.3 通过裁切 / 组合实现的
1. App Store 营销图统一裁 y≥760（`.005` 为 y≥690），得到深色渐变底的带框手机，放进墨黑 / 牛血色区块。也可以用 `mask-image` 让边缘渐隐，消掉渐变接缝。
2. 原始截图（`スクリーンショット*`、`language_setting_en.PNG` 等）套 CSS `.phone` 框，与 `*_demo.png` 的实体框在视觉上对齐（统一圆角和阴影）。**不要**在已经带框的图外再套一层框。
3. `*_demo.png` 裁掉四周 64/72px 透明留白后再缩放，减少无效像素。
4. 3 机扇形构图（参照 `surfenglish-promo.css:347-386`，但改用 WBW 的直角 / 方格气质）：划译 + 查词 + 句法。
5. 桌面扩展截图（1280×800）套 CSS 浏览器窗框，`feature-*.png` 作横向"证据条"。
6. OG 图（1200×630）：logo + 马赛克 + 一张手机裁切，用 HTML/CSS 渲染后截图导出（派生图），按 en/ja/zh 各一张。

### 6.4 性能预算 **[推断]**
- 首屏图片 ≤ 150 KB（hero AVIF 约 60–70 KB 实测），整页图片 ≤ 1.2 MB（现在是 15–17.5 MB）。
- 所有 `<img>` 带 `width/height` + `decoding="async"`，非首屏 `loading="lazy"`，hero 用 `fetchpriority="high"`；`<picture>` 提供 AVIF + JPEG（不透明）/ PNG（透明，或者压平到已知底色后用 JPEG）。

---

## 7. 难点与风险

| 风险 | 说明 / 证据 | 建议 |
|---|---|---|
| 21 个手写 HTML 页面 | 任何视觉改动都要同步 21+ 份文件；目前就已经因为不同步，出现了组 A / 404 问题 | 与架构报告联动：采用 SE 的 `build.mjs` + locales + templates 生成模式 |
| 本地化素材只覆盖 3 种语言 | §3.8 | 其余语言用英文图，在 alt 中用本地语言描述；接受"UI 为英文"的现实 |
| WebP 工具缺失 | ImageIO 只能写 AVIF/HEIC/JPEG/PNG | AVIF + JPEG fallback；如需 WebP 要 `brew install webp`（新增依赖，需确认） |
| 透明 PNG fallback 重 | 660 宽透明 PNG 仍有约 399 KB | 按区块底色压平成 JPEG fallback，或接受旧版 Safari 拿到较大的 PNG |
| AI 生成 / 第三方内容 | GPT-ICON 插画、ChatGPT/Gemini 合成图（含水印）；截图里有 OpenAI/GitHub/NHK/VOA/Wikipedia/BBC；扩展页有 Azure/Google/ChatGPT/Gemini 商标 | 主视觉改用真实截图 + CSS；商标区块遵守各家品牌规范或改成纯文字；`text-attribution.png`（Google Translate 归属）是否需要在网页上展示，需对照 Google 条款确认 |
| 素材本身有缺陷 | `wbw_en.002` 意大利语按钮；JP X 截图有中文按钮；`feature_history_demo` 名实不符 | 按 §3.8 选图；文件重命名时注意保持旧 URL |
| 图片 URL 变更 | 旧图 URL 可能已被 Google Images 收录；GitHub Pages 不支持 301 | 删除前评估；必要时保留旧文件一段时间 |
| SE 推广与 WBW 身份的平衡 | 现在 promo 的视觉权重高于 WBW hero（§2.5） | 移位 + 降权 + 桥接叙事（§5.4） |
| 固定 header 偏移脆弱 | spacer 写死 64px，移动端 header 实际 105px，重叠约 41px；promo JS 依赖 `.nav-spacer` 计算（`surfenglish-promo.js:599-626`） | 改用 `position: sticky` header（SE 的做法，`SEW style.css:99-105`），同时改写 promo 的 relayout |
| RTL / 多文字系统 | ar 页物理属性错位；没有泰文 / 天城文字体 fallback | 全面改用逻辑属性 + 完整 font stack |
| `backup/` 目录在线可访问 | `backup/top.html`、`backup/top.jp.html` 线上返回 200 | 不属于视觉范围，提示 SEO 报告处理（重复内容） |

---

## 8. 可复现命令（节选）

```bash
# 尺寸 / 字节 / md5
cd /Users/ike/Dev/WordByWord/wordbyword-web
for f in img/*.png img/en/* chrome-extension/img/*; do echo "$f $(stat -f%z "$f") $(sips -g pixelWidth -g pixelHeight "$f" | awk '/pixel/{printf $2" "}') $(md5 -q "$f")"; done
# 404 验证
for p in img/Screenshot-2.png img/Screenshot-3.png img/Screenshot-4.png; do curl -s -o /dev/null -w "$p %{http_code}\n" "https://www.word-by-word.app/$p"; done
# 页面图片引用
grep -o 'src="img/[^"]*"' ja-top.html | sort | uniq -c
# AVIF 压缩实测
sips -s format avif -s formatOptions 60 -Z 1310 img/en/feature_swipe_demo.png --out /tmp/x.avif
```
颜色采样和透明 bbox 用的 Swift 脚本保存在 scratchpad：`colors.swift`、`sample.swift`、`alpha.swift`、`reds.swift`、`bg.swift`。
