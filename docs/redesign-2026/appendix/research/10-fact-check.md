# 10 · 研究报告交叉事实核查（完整性评审）

- 核查日期：2026-10-05。对象：`research/00`–`09` 共 10 份报告。全程只读，未修改任何项目文件。中间产物放在 `scratchpad/fc/`（App Store 页面 HTML、Google updates 页面、Bing 响应）。
- 标记：✅ 已确认；❌ 错误（附正确事实）；⚠️ 无法确认、只部分正确，或已过时。【事实】有命令、文件行号或 URL 作证；【推断】是判断。
- 本报告第 4 节「关键事实清单」是后续设计阶段**唯一的可信事实来源**。各报告与第 4 节冲突时，以第 4 节为准。

---

## 0. 结论速览

1. **大部分硬事实经得起复核。** 包括：语言页是孤岛、站内没有 hreflang/canonical/sitemap/robots、`cn-top ≡ zh-top`、7 张同图加 3 张不存在的截图、apex 无解析、HTTP 不跳 HTTPS、SurfEnglish 在中国大陆不可下载、两款 App 的语言能力和额度。共抽查 80 余条，错误集中在**计数、跳转码、过时的政策日期和示例文案**，没有推翻任何报告的主结论。
2. **需要纠正的错误**（详见第 1、2 节）：
   - 仓库文件数是 86（01 写成 79）。
   - 引入 GA 和 site-notice 的 HTML 是 26 个（09 写成 24）。
   - App Store 链接和旧徽章域名的跳转是 **301**（01 写成 302）。
   - App Store campaign token `ct` 最长 **30** 字符（09 写成 40）。
   - FAQ 富结果自 **2026-05-07 起已完全不展示**（02、03 还停留在 2023 年"只对政府/健康站展示"的说法）。
   - GSC 是**网域属性**（02 推断为 URL 前缀属性）。
   - 00 中前 13 条查询的点击合计是 56，不是 57。
3. **最需要警惕的错误是 06 的示例文案**："在任何网页或 App 里**左滑**"、"在 **Safari** 中左滑"、"想在**任何 App** 里即时翻译 → WordByWord"。实际情况是：WBW 只在 **App 内置浏览器**中**右滑**翻译，没有 Safari 扩展，也没有分享扩展。这些文案如果被设计阶段直接沿用，就会写进官网造成虚假宣传。
4. **本次补查出的、对设计有影响的新事实**：
   - (a) WBW **没有整页自动翻译**，只能逐段右滑，所以 07 的 "Translate any web page on iPhone" 主张需要改写措辞。
   - (b) 两款 App 属于**同一开发者账号**（artistId 1794902022，"Chi Jinlong"），App Store 页面已经互相展示在 "More by" 区块；但 SE 官网的 Person 实体名写的是 "Jinlong"，跨站共用实体前必须先统一名称。
   - (c) **WBW iOS 生产版的唯一后端地址是 `backend-test.word-by-word.app`**，而 SE 团队把这个环境当作"测试环境"，2026-09-24 已在上面先切换了模型。这是推广 WBW 时的产品稳定性风险（不属于官网范围）。
   - (d) Immersive Translate 的 iOS 版通过 Safari 扩展已经能做 iPhone 上的双语网页翻译（包括 X 网页版），所以 07 所说的"定位空白"比原判断要窄。
   - (e) apex 加 GitHub A 记录（01、02、06 的建议）与 09 推荐的 b-lite 托管方案互斥，需要二选一。
5. **报告间的主要矛盾**有 4 处，裁定如下：
   - 托管迁移：**不迁 NS**，按 09 的 b-lite 只改 `www` 的 CNAME；06 第二阶段"迁 NS"的建议作废。
   - 葡语：用 `pt-BR`，路径 `/pt-br/`。
   - 指向 SE 官网的链接：**不再带 UTM**（SE 侧没有统计），改为 WBW 侧 GA 点击事件加 App Store `ct` 参数。
   - CLS：没有现场数据，所有数值都只是实验室估算。

---

## 1. 逐报告抽查

### 00 · GSC 基线（来自用户截图）
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | 28 天 71 次点击、1,286 次展示、CTR 5.5%、平均排名 8.3 | ⚠️ | 来自用户截图，无法独立核验 |
| 2 | 前 13 条查询合计约 1,023 次展示 | ✅ | 130+758+60+3+1+17+16+11+7+6+6+4+4 = 1,023 |
| 3 | 前 13 条合计 57 次点击 | ❌ | 40+13+1+1+1 = **56**（约占 71 的 79%） |
| 4 | "wordbyword" CTR 约 31%，"word by word" CTR 1.7% | ✅ | 40/130 = 30.8%；13/758 = 1.7% |
| 5 | 缺少网页 / 国家 / 设备维度 | ✅（缺口） | 原文末尾已列为"待补充"，至今没有补上（见 §3 G1） |

### 01 · 结构审计
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | `cn-top.html` 与 `zh-top.html` 字节相同 | ✅ | `md5` 两者都是 `63d6a8cde56fe6abc683ee538931bc5a` |
| 2 | `index.html` 与 `en-top.html` 只差 1 行注释 | ✅ | `diff` 输出 `185d184 <!-- <a … btn-download-store …> -->` |
| 3 | 7 个文件同图；`Screenshot-2/3/4` 从未存在 | ✅ | 7 个文件 md5 都是 `5d5463ff…`；`git log --all -- img/Screenshot-{2,3,4}.png` 为 0 条；线上 `/img/Screenshot-2.png` 返回 404 |
| 4 | Git 跟踪文件共 79 个 | ❌ | `git ls-files \| wc -l` = **86**（09 的数字正确）。其中 HTML 32 个：22 个落地页、privacy、support、chrome-extension 下 2 个、backup 下 6 个 |
| 5 | GA 在 26 份 HTML 中各复制一份 | ✅ | `grep -rl G-QS1CJY8YWL --include=*.html` = 26（6 个 backup 页没有 GA）；`site-notice.js` 和 `analytics.js` 也是 26 份；`surfenglish-promo.js` 是 25 份 |
| 6 | 唯一指向语言页的站内链接是 `chrome-extension/index.html:319` | ✅ | `grep -rnoE 'href="[^"]*-top\.html'` 只命中这一处 |
| 7 | App Store 链接和徽章域名是 **302** 跳转 | ❌ | `curl` 结果：`apps.apple.com/app/6741724502` 和 `/app/id6741724502` 都 **301** 到 `/us/app/wordbyword-translate/id6741724502`；`tools.applemediaservices.com/...` **301** 到 `toolbox.marketingtools.apple.com/...` |
| 8 | apex 无 A 记录；HTTP 返回 200 | ✅ | `dig @8.8.8.8 word-by-word.app A` → NOERROR，ANSWER 0；`curl http://www…/` → 200 |
| 9 | Plus 发音有上限；主题切换是空实现 | ✅ | `FeatureQuotaManager.swift:63-84`；`SettingsMenuViewController.swift:182-184` 只有 `print("切换主题逻辑")` |
| 10 | 单页图片：英文约 15.0 MB，日文约 17.5 MB | ✅ | 按唯一 URL 累加：index 14.97 MB，ja/zh 17.52 MB；`width/height` 0 处，`loading` 0 处 |

### 02 · 技术 SEO
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | robots.txt 与 sitemap.xml 都返回 404 | ✅ | `curl` 结果 404/404 |
| 2 | `super-monster.github.io/wordbyword-web/` 301 到 **http** 版本 | ✅ | `curl` 结果 `301 http://www.word-by-word.app/` |
| 3 | 所有资源 `cache-control: max-age=600` | ✅ | `curl -sI /` |
| 4 | GSC "很可能是 URL 前缀资源" | ❌ | 00 依据用户截图写明是**网域属性**；09 也采用网域属性 |
| 5 | FAQ 富结果"2023 年起只对政府和健康站展示" | ⚠️ 过时 | Google Search Central updates 原文："The FAQ rich result feature is no longer shown in Google Search results, as announced in the changelog entry in **May 2026**"；2026-05-08 加入弃用通知，2026-06-15 删除文档。"不做 FAQ 富结果"这一结论不变 |
| 6 | wordbyword.io 的 sitemap 有 634 个 URL（en/ru/de） | ✅ | `curl` 共 634 个 `<loc>`，其中 en 244、ru 197、de 190，另有根路径若干 |
| 7 | "美区 WordByWord Translate、台湾 WordByWord翻譯、其余区 WordByWord" | ⚠️ 过简 | 名称跟随 App Store 的**本地化语言**，不跟随店面（见第 4 节 F20） |
| 8 | 页面重量 14.27 / 16.71 | ✅ | 单位是 MiB（换算即 14.97 / 17.52 MB），与 01 一致 |
| 9 | CLS 曾观测到 0.6057 | ⚠️ | 02 自己也注明这是切换视口仿真时的伪迹，不能当作真实用户值 |

### 03 · SurfEnglish 官网架构
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | 12 个 locale 及其路径 | ✅ | `SurfEnglishWebsite/build.mjs:52-63`；线上 12 个路径都是 200，`/de/`、`/fr/` 是 404 |
| 2 | `TRANSLATE_LANGS` 共 21 种，与 App 一致 | ✅ | `build.mjs:66-72` |
| 3 | `applicationCategory` 用了非法值 | ✅ | `home.mjs:97`、`about.mjs:41`、`learn-english-by-reading.mjs:69` 都是 `['NewsApplication','EducationApplication']` |
| 4 | `og:locale` 输出 `ja`、`zh_Hans` | ✅ | `layout.mjs:62-63`；`dist/ja/index.html` 中可见 |
| 5 | SE 站全站没有提到 WBW，也没有任何统计 | ✅ | `grep -rniE "wordbyword\|word-by-word"` 在 src/build.mjs/public 中 0 处；`gtag\|googletagmanager\|cloudflareinsights\|plausible` 在 src/dist 中 0 处；线上首页同样无统计 |
| 6 | CF Pages 自动 308；`www` 301 到 apex | ✅ | `curl` 结果：`/index.html` 308 → `/`，`/404.html` 308 → `/404`，`/privacy` 308 → `/privacy/`；SE 的 NS 是 `cartman/vivienne.ns.cloudflare.com` |
| 7 | "SE 上线约 2.5 个月（2026-07-25 起）" | ⚠️ 需澄清 | 2026-07-25 是 SE **官网仓库首个提交**（`dbe6bfa`）。App 在 App Store 的 releaseDate 是 **2026-08-18**；`build.mjs:42` 的 `launchDate` 是 2026-08-21 |
| 8 | en title 84 个字符 | ✅ | node 统计 `meta.title` 长度 84 |
| 9 | FAQ 富结果"2023-08 起仅限政府和健康站" | ⚠️ 过时 | 同 02 #5 |

### 04 · 现有推广方案
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | JS 47,056 B，CSS 9,865 B | ✅ | `wc -c` |
| 2 | 共 25 个页面引入 | ✅ | `grep -rl surfenglish-promo.js` = 25（`chrome-extension/privacy.html` 除外） |
| 3 | CONFIG 各项（enabled、sectionAfter `#hero`、appStoreUrl 不带 pt/ct、UTM） | ✅ | `js/surfenglish-promo.js:15-26` |
| 4 | de/fr/it/nl/pl/ru/tr/uk 的 `sitePath` 为空，并写着 "App in 12 Sprachen" | ✅ | `:289-422` 中 `sitePath: ''`；`:302` "App in 12 Sprachen"，`:321` "App en 12 langues" |
| 5 | SE 在中国大陆不可下载 | ✅ | lookup `country=cn` 无结果；`apps.apple.com/cn/app/id6787367021` 返回 404；WBW 在 cn 区正常（301 到 `/cn/app/wordbyword/…`） |
| 6 | SE 首发日期 2026-08-18 | ✅ | lookup 的 `releaseDate` |
| 7 | 手机端布局实测（条加 header 共 155px、WBW 主 CTA 底边 814 > 812） | ⚠️ | 本次没有重新做浏览器实测；从代码推断（fixed 条加 relayout）方向一致 |
| 8 | 静态 HTML 中没有 SurfEnglish 文字 | ✅ | `index.html`、`ja-top.html` 只在 `<link>`、`<script>` 两行出现 "surfenglish" |

### 05 · 产品真相
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | 只有 1 个 App target 和 1 个测试 target，没有任何扩展 | ✅ | `project.pbxproj:145,169`；`app-extension` 出现 0 次 |
| 2 | 源语言默认 en-US；目标语言回退 ja-JP；21 个目标 locale | ✅ | `Models/LanguageData.swift:21-43`、`AppLanguagePreferences` |
| 3 | 双击查词不支持中日韩；Chunks 和 Action Flow 只支持英语 | ✅ | `Resources/user-script/20-features.js:281`；`MainViewModel.swift:1973-1981`（`baseLanguage == "en"`）、`:2386` |
| 4 | 额度表 | ✅ | `FeatureQuotaManager.swift:63-84`，逐项一致 |
| 5 | xcstrings 共 315 个 key、20 个 locale | ✅ | python 统计结果：`ar de en es fr hi id it ja ko nl pl pt-BR ru th tr uk vi zh-Hans zh-TW` |
| 6 | 按店面列出的 App 名（如 VN/TH/ID 叫 "WordByWord Translate"） | ⚠️ | 这是店面默认语言下的名称。`lookup country=vn&lang=vi` 返回 "WordByWord"，`country=jp&lang=en_us` 返回 "WordByWord Translate"。名称是**按本地化**决定的 |
| 7 | WBW Plus $3.99/月；SE $2.99/月、$24.99/年 | ✅ | App Store US 页面的 In-App Purchases（`scratchpad/fc/*_us.html`） |
| 8 | WBW 隐私标签写"不收集数据"，但集成了 Firebase | ✅ | `wbw_us.html` 含 "Data Not Collected"；`AnalyticsManager.swift` `import FirebaseAnalytics` |
| 9 | Chrome 扩展 v0.1.2，最后提交 2026-02-13，目标语言 7 种 | ✅ | `manifest.json`；`git log -1` 为 `1a7ef55 2026-02-13`；`src/core/settings.js:19` |
| 10 | 兼容 Mac（M1+）与 Vision Pro | ✅ | App Store 页面："Requires macOS 15.0 or later and a Mac with Apple M1"、"visionOS 2.0 or later" |

### 06 · SEO/GEO 最佳实践
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | FAQ 富结果自 2026-05-07 起不再展示；llms.txt 说明发布于 2026-06-15 | ✅ | developers.google.com/search/updates（`scratchpad/fc/gupdates.html`） |
| 2 | `ct` 最长 30 字符；链接格式 `…/app/apple-store/id…?pt=&ct=&mt=8` | ✅ | Apple 文档 campaign-links："up to 30 alphanumeric characters and spaces" |
| 3 | App Store 链接是 301 跳转 | ✅ | 同 01 #7 |
| 4 | 第二阶段"把 NS 迁到 Cloudflare" | ❌（方案层面） | 迁 NS 不是必需的：CF 文档说明子域可以从外部 DNS 用 CNAME 接入，只有 apex 才要求 zone 在 CF 上。该 zone 还开了 DNSSEC（DS 22319），并承载生产 API（`api.`、`backend-test.`），迁 NS 风险高，以 09 为准 |
| 5 | 示例定义句"在任何网页**或 App** 里**左滑**选中的文字"、alt 示例"在 **Safari** 中左滑"、对比文案"想在**任何 App** 或网页里即时翻译 → WordByWord" | ❌ | 正确事实：只在 **App 内置浏览器**中**右滑**（xcstrings `tip_swipe_to_translate`："Swipe right on any text…"）；没有 Safari 扩展和分享扩展（见 05 #1） |
| 6 | "WBW 现有 6 个功能，每个都有对应的截图和图标素材" | ❌ 部分 | 非英语页 6 张功能图是同一张无效图；英文"语境解析"图与"双击"图重复；History **没有任何真实截图**（08 §3.8） |
| 7 | "两款 App 在同一开发者账号下" | ✅（本次补证） | lookup 显示两者 `artistName` 都是 "Chi Jinlong"、`artistId` 都是 1794902022；两款 App 的 App Store 页都有 "More by" 区块互相展示 |
| 8 | 葡语 hreflang 保守写 `pt` | ⚠️ 已裁定 | 见 §2 C10，采用 `pt-BR` |

### 07 · 关键词与竞品
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | 全站 "iPhone" 出现 0 次 | ✅ | index、ja、zh 页计数都是 0 |
| 2 | ru 页错字 "посрочное" | ✅ | `ru-top.html:7,70` |
| 3 | wordbyword.io 有 634 个 URL | ✅ | 同 02 #6 |
| 4 | 以 "Translate any web page on iPhone — and keep the original" 作为 F1 主张 | ⚠️ 措辞风险 | WBW **没有整页翻译**：xcstrings 中没有 whole/full page 或 auto-translate 相关键，只有右滑后按 Auto/Paragraph/Sentence-by-Sentence 显示。应改写为"在内置浏览器里对任意网页逐段右滑，译文插在原文下方" |
| 5 | "Immersive/Mate 在 iOS 上是 Safari 扩展 → iPhone 上保留原文的双语翻译几乎是空白" | ⚠️ 偏乐观 | Immersive Translate 的 iOS App 自带 Safari 扩展，可在 Safari 中做双语网页翻译，包括 X、Reddit 网页版（App Store id6447957425 的描述）。WBW 的差异点应落在"右滑逐句 + AI 语境查词 + 英语 Chunks/Action Flow + 内置浏览器适配 X 登录" |
| 6 | 把 "learn Japanese/Korean/Chinese by reading websites" 归为 WBW 独占 | ⚠️ | 中日韩**源文**不支持双击查词，Chunks 和 Action Flow 也只支持英语（05 #3）。对这类用户只能诚实地说"右滑翻译 + 朗读可用"，不宜作为主打 |
| 7 | App Store 副标题（US/JP/CN/TW/KR） | ⚠️ 未重新抓取 | 05 与 07 分别独立抓取，结果一致，可以采信 |
| 8 | autocomplete 与 SERP 观察 | ⚠️ | 时变数据，且不是 Google 本地 SERP，只能作定性参考 |

### 08 · 视觉素材
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | md5 重复组 A/B/D | ✅ | 本次 md5 复核一致 |
| 2 | Logo 是白色斜体板衬线 "T" + 3 条速度线 + 红黑马赛克 | ✅ | 已目视 `wbw_logo.png` |
| 3 | 品牌红 #CC3355：AccentColor 加 App 内译文引用条 | ✅ | `AccentColor.colorset` 为 display-p3 0.800/0.200/0.333；`Resources/user-script/10-dom-render.js:1138` `border-left: 3px solid #cc3355;padding-left: 8px` |
| 4 | 站点主色 #007aff；按钮 hover 变 #e0b900 | ✅ | `css/style.css:130,151,181,191` |
| 5 | favicon 是 32×32 | ⚠️ | 实际包含 **16×16 和 32×32** 两个尺寸（`file favicon.ico`），与 01 一致 |
| 6 | "19 个非英语页各有 3 张破图" | ⚠️ 计数 | 引用 `Screenshot-2.png` 的文件是 **20 个**（19 种语言，因为 cn 与 zh 重复），共 60 处断链 |
| 7 | `Resources/wbw_en/jp/zh` 的文件清单 | ✅ | 分别是 10/9/11 个文件。**补充**：`wbw_*.00N` 营销图的修改日期是 2025-06-08/09，属于 1.0 时期，**不包含 Chunks 和 Action Flow**；只有 2026-04-23 的 X 截图里能看到 "Extract chunks" 按钮 |
| 8 | 本机没有 WebP 工具 | ✅ | `cwebp/avifenc/magick/pngquant/ffmpeg` 都不存在，Python 也没有 PIL；node 版本为 v24.14.1 |
| 9 | `wbw_en.002` 中出现意大利语按钮 | ⚠️ | 本次没有重新目视 |

### 09 · 基础设施与风险
| # | 结论 | 判定 | 证据 / 正确事实 |
|---|---|---|---|
| 1 | `www` CNAME TTL 5；DNSSEC 已开；`api.`、`backend-test.` 指向 ghs.googlehosted.com；`backend.` 是 A 记录 | ✅ | 直查权威服务器：`www … 5 IN CNAME super-monster.github.io.`；DS `22319 8 2 F50EC17F…`；`backend` → 34.53.32.27 |
| 2 | 证书 SAN 只有 www，到期 2026-12-23 | ✅ | `openssl s_client`：`notAfter=Dec 23 07:32:53 2026 GMT` |
| 3 | 仓库 86 个文件 | ✅ | 同 01 #4 |
| 4 | "GA 硬编码在全部 **24** 个 HTML"、"所有 **24** 个 HTML 引入 site-notice" | ❌ | 两者都是 **26**（非 backup 的 HTML 全部包含） |
| 5 | "19 个 xx-top.html" | ⚠️ 计数 | 共 21 个 `*-top.html`，其中非英语 20 个；同一报告另一处又写成 20 |
| 6 | CF：apex 必须是 CF zone；子域可以外部 CNAME 接入，但要先在控制台绑定，否则 522 | ✅ | developers.cloudflare.com/pages/configuration/custom-domains |
| 7 | `ct` 最长 40 字符 | ❌ | Apple 文档规定 **30** 字符（同 06 #2） |
| 8 | SE iOS 历史版本硬编码过 `/privacy.html` | ✅ | `git log -S` 显示 `76a3cda`（2026-07-02）加入、`eb502af`（2026-09-02，提交信息含"死代码清理"）删除。是否能在 UI 中走到该入口：⚠️ 未验证 |
| 9 | ASC Marketing URL 用根域（jp/kr 带 `/`）；隐私和支持 URL 用 `.html` | ✅ | 已抓 App Store us/jp 页面。**补充**：SE 的 ASC 隐私 URL 是 `surfenglish.app/privacy/`，不是 WBW 的地址 |
| 10 | `.app` 在 HSTS 预加载列表中 | ✅ | hstspreload.org 返回 `"preloadedDomain": "app"` |

---

## 2. 报告间矛盾与裁定

| # | 议题 | 各方说法 | 裁定（依据） |
|---|---|---|---|
| C1 | 仓库文件数 | 01：79；09：86 | **86**（`git ls-files \| wc -l`） |
| C2 | 含 GA / site-notice 的 HTML 数 | 01：26；09：24 | **26**（grep 结果） |
| C3 | 非英语页数量 | 01/02：20；08/09：19（09 文中前后不一） | **20 个文件、19 种语言**（cn ≡ zh）；引用破图的文件 20 个，共 60 处 |
| C4 | App Store 链接与徽章的跳转码 | 01：302；05/06：301 | **301**（curl） |
| C5 | FAQ 富结果 | 02/03：2023 年起只对政府和健康站展示；06：2026-05 起完全不展示 | **06 正确**（Google updates）。两种说法的结论相同：不做 FAQ 富结果，可见 FAQ 只作内容 |
| C6 | `ct` 长度 | 06：30；09：40 | **30**（Apple 文档） |
| C7 | GSC 属性类型 | 02：推断为 URL 前缀；00/09：网域属性 | **网域属性**（用户截图）。验证方式未知（apex 无 TXT，见 09 §3.9） |
| C8 | 是否迁移 NS | 06 第二阶段：迁 NS 到 CF；03/09：不需要，风险高 | **不迁 NS**。CF 子域可以外部 CNAME 接入；zone 开了 DNSSEC，并承载 `api.`、`backend-test.` 生产 API。托管只在 (a) GitHub Pages + Actions 与 (b-lite) CF Pages + 改 `www` CNAME 之间选 |
| C9 | apex 修复 | 01/02/06：现在就给 apex 加 GitHub Pages A/AAAA；09：b-lite 下 apex 维持不可解析 | **两者互斥**。GitHub 的 apex → www 跳转要求 www 也由同一个 GitHub Pages 站点服务。切到 CF 后，如果 apex 仍指向 GitHub，会出现 "Site not found"，还有子域被他人认领的风险。规则：**选 (a) 就加 A/AAAA；选 b-lite 就保持 apex 不解析，另立项处理**（例如单独的 redirect 站或日后迁 NS） |
| C10 | 葡语代码 | 02/03/09：pt-BR；06：保守用 `pt` | **pt-BR，路径 `/pt-br/`**。页面用词是巴葡（"você"×1、"tela"×3、"ecrã" 0）；App UI locale 是 `pt-BR`；SE 也用 `/pt-br/` |
| C11 | 指向 SE 官网的链接是否带 UTM | 04/07：保留，加 `utm_content`；06：不要加 | **默认不加**。SE 站没有任何统计（已验证），UTM 没人接收，还会给 SE 制造带参数的 URL。改用 WBW 侧 GA 点击事件（`data-ga-label` 区分位置）加 App Store `ct`。等 SE 站接入统计后再考虑 |
| C12 | 推广条高度、CLS | 02：57.7px，CLS 0.07/0.26，另有 0.6057 伪迹；04：50px，模拟 CLS 0.048/0.063 | 都是**实验室数值**，没有 CrUX/PSI 现场数据。设计上推广条会被移除，无需细究；采用 04 的模拟值作量级参考 |
| C13 | SE 上线时间 | 03：2026-07-25；04/05：2026-08-18 | 不冲突：07-25 是官网首个提交，**08-18 是 App Store 上架日**，08-21 是 `launchDate` 常量。对外文案以 08-18 为准 |
| C14 | App 名称 | 02：其余区都叫 "WordByWord"；05：按店面列表；07：按 `?l=` 列表 | **按 App Store 本地化决定**：en-US 为 "WordByWord Translate"，zh-Hant 为 "WordByWord翻譯"，ru 为 "WordByWord Переводчик"，ja/zh-Hans/ko/vi 等为 "WordByWord" |
| C15 | WBW 的差异化定位 | 07：iPhone 网页双语翻译 + 非英语源语言（含中日韩）；05：英语体验最全，中日韩源文受限 | 以 **05 的能力矩阵**为准。中日韩源文只有右滑和朗读可用；主张以"内置浏览器 + 右滑逐句 + AI 语境查词 + X 适配"为核心，"多语言"作为次要卖点，并写清限制 |
| C16 | SE 推荐卡的视觉 | 08：保留 SE 深色卡作为"一扇窗"，移到功能区之后；04：废弃整屏深色卡，融入 WBW 设计系统 | 两者都同意：**不放首屏、不用固定条、放在功能区之后、改为静态 HTML**。卡片体量交给设计决策，建议不超过半屏，并按受众条件显示（只对学英语的访客） |
| C17 | 推广区的实现方式 | 08 §5.4：改 `CONFIG.sectionAfter` 即可；02/04/06/07：改为静态 HTML | **改为构建期静态 HTML**（AI 爬虫不执行 JS；04 已用 WebFetch 实测看不到） |
| C18 | 跨站 JSON-LD 关联 | 01：`isRelatedTo`；04：`isBasedOn`；06：只用共同 `creator`，不要硬套 `isRelatedTo` | 用**共同的 Person `@id`** 作 creator，再加可见文本说明关系；`isRelatedTo` 不用；`isBasedOn` 可选，非必要。**前提是先统一 Person 名称**（见 §3 G4） |

---

## 3. 遗漏（对设计决策重要、原报告未覆盖或覆盖不足）及补查

| # | 遗漏 | 补查结果 | 对设计的影响 |
|---|---|---|---|
| G1 | **GSC 的网页 / 国家 / 设备 / 索引覆盖数据**：所有"语言页没被收录"的判断都来自非 Google 引擎的旁证 | ⚠️ 无法补查。WebSearch 不是 Google；Bing `site:` 返回 challenge 页，按规则不绕过 | 决定 URL 是否保留，以及 hreflang、迁移的上线顺序。**开工前请用户导出 GSC「网页」「国家」两个标签页，以及 `ja-top.html` 的 URL 检查结果** |
| G2 | GA4 基线：各页面流量、`surfenglish_promo` 各 label 点击 | ⚠️ 仓库内拿不到 | 改版前后的推广效果对比需要它 |
| G3 | SurfEnglish 自身的 GSC 基线 | ⚠️ 没有任何报告覆盖 | 03 指出 SE 的 SEO 方法"技术完整但效果未证"。没有 SE 数据，就不能默认 SE 的做法更优 |
| G4 | **开发者实体命名不一致** | 【事实】App Store 两款 App 的 `artistName` 都是 **"Chi Jinlong"**（artistId 1794902022）；SE 官网 `build.mjs:39-40` 中 `makerName` 和 `makerFullName` 都是 **"Jinlong"** | 两站共用 Person `@id` 前要统一 name/alternateName，并请用户确认对外署名 |
| G5 | **同一账号与 App Store 互相展示**（06 只是断言） | 【事实】WBW 和 SE 的 US 页面都有 "More by" 区块并展示对方 | App Store 内的关联已经存在；网站互链是补充，不必在网站上重复强调"下载另一款" |
| G6 | **WBW 没有整页翻译** | 【事实】xcstrings 中没有 whole/full page 相关键；JS/Swift 中也没有 translateAll/fullPage；只有右滑后的 Auto/Paragraph/Sentence-by-Sentence | 关键词主张和 H1 必须写"右滑任意段落"，不能写"一键翻译整个网页"（07 §6.3 的草案需要改） |
| G7 | **竞品 Immersive Translate 在 iOS 上的能力** | 【事实】它的 iOS App 自带 Safari 扩展，可做双语网页翻译，包括 X/Reddit 网页版（App Store id6447957425 的描述） | "Immersive Translate alternative" 对比页要诚实写清对方的能力；WBW 的差异在"右滑按需翻译 + AI 语境查词 + 英语 Chunks/Action Flow + 学习历史" |
| G8 | **WBW 生产后端依赖"测试环境"** | 【事实】WBW iOS `Services/APIConfig.swift:11` 唯一的 `baseURL` 是 `https://backend-test.word-by-word.app`。SE 文档 `wordbyword-backend-feature-model-map.md:38,89` 把它定义为"测试（Debug）"环境，生产是 `wordbyword-api.surfenglish.app`；`:384` 记录 2026-09-24 "test 已切"新模型。【推断】已上线的 1.2.2 很可能就用这个地址（该文件 2026-04-03 创建，早于 1.2.2 发布） | 不属于官网范围。但官网会给 WBW 引流，SE 侧在"测试环境"上做的实验会直接影响 WBW 线上用户。**建议在设计文档的风险章节注明，并请用户确认** |
| G9 | 营销截图的版本 | 【事实】`Resources/wbw_*/wbw_*.00N.png` 是 2025-06-08/09 制作，属于 1.0 时期的 UI | 想展示 Chunks 和 Action Flow，只能用 2026-04-23 的 X 原始截图，或用 CSS/HTML 复刻的样张；"不新增素材"的边界要请用户确认 |
| G10 | **apex 与托管方案的耦合** | 见 §2 C9 | 必须在设计文档中写成一个决策项 |
| G11 | 中国大陆可达性 | ⚠️ 本地无法测试。【推断】github.io 和 Google Analytics 在大陆访问不稳定；pages.dev 域名在大陆通常不可用，但自定义域名走 CF 时情况不同；Baidu 对境外站收录弱（06 §1.7） | WBW 在 cn 区可下载，zh-Hans 页有真实受众，托管选择应把大陆可达性列为评估项；SE 推荐在 zh-Hans 页**不放下载徽章** |
| G12 | Webfont 策略 | 现状：两站都只用系统字体，没有 webfont（03 §3.2、08 §2.1） | 引入 Google Fonts 是否算"新增素材"、CJK 字体体积如何控制，需要定一个原则。建议沿用系统字体栈加衬线阅读样张（08 §4.4），零新增 |
| G13 | SE 的平台扩展计划 | 【事实】`/Users/ike/Dev/SurfEnglish/SurfEnglish Android/` 目前只有 `docs/`（迁移蓝图等），没有代码 | 推荐文案暂时可以写 iPhone/iPad，但组件里的平台字段要做成数据驱动 |
| G14 | SE 的 "ja-preview" 数据包是否意味着 SE 将支持学日语 | 【事实】`runtime-language-core-1.4.0-ja-preview.sqlite` 的 `runtime_meta` 显示是"英语 language_core + 日语 language_pack"（日语释义）；源数据为 NGSL 英语词表 | **不改变** "SE 只教英语"的结论 |
| G15 | 网站 GA 的同意管理与隐私政策披露 | 01、09 只作提示 | EEA 访客的 Consent Mode 与 privacy.html 改写需要用户决策；改版文案不再使用 "No personal data is collected" |

---

## 4. 关键事实清单（设计阶段唯一可信来源，共 36 条）

**A. 站点与仓库**
- F1【事实】仓库 `super-monster/wordbyword-web` 是 public，GitHub Pages 从 main 分支部署（Jekyll），HEAD 为 `7a389ba`（2026-08-23），共 86 个跟踪文件，其中 HTML 32 个：22 个落地页（`index` 加 21 个 `*-top`）、privacy、support、chrome-extension 下 2 个、backup 下 6 个。线上内容与仓库一致（`last-modified: 23 Aug 2026`，`content-length: 11664`）。
- F2【事实】语言页：21 个 `*-top.html` 等于 en-top 加 20 个非英语文件，对应 19 种语言，因为 `cn-top ≡ zh-top`（md5 `63d6a8cd…`）。`index` 与 `en-top` 只差第 185 行注释。站点覆盖的 20 种语言与 App UI 的 20 个 locale 一一对应。
- F3【事实】26 个非 backup 的 HTML 中，hreflang、canonical、OG、JSON-LD、`apple-itunes-app` 出现 0 次。线上 robots.txt 与 sitemap.xml 都是 404，404 页面用的是 GitHub 默认页。
- F4【事实】全站唯一指向语言页的链接是 `chrome-extension/index.html:319 → ../zh-top.html`，而 chrome-extension 本身没有任何入链。Logo 链接到 `#`；hero 的 CTA 是 `#cta` 锚点。
- F5【事实】URL 变体：`/x` 与 `/x.html` 都返回 200；HTTP 返回 200，不跳 HTTPS；`super-monster.github.io/wordbyword-web/` 301 到 **http**://www；`/backup/*.html` 与 `/README.md` 线上返回 200。
- F6【事实】DNS：apex 无 A/AAAA 记录，无法解析；`www` CNAME 指向 `super-monster.github.io`，TTL 5；NS 是 Google Cloud DNS（`ns-cloud-c1..4`）；**DNSSEC 已开**（DS 22319）；`api.`、`backend-test.` CNAME 指向 `ghs.googlehosted.com`；`backend.` A 记录为 34.53.32.27。证书 SAN 只有 www，到期 2026-12-23。`.app` 在 HSTS 预加载列表中。
- F7【事实】GitHub Pages 的响应头固定 `cache-control: max-age=600`，不能自定义 header，也不能做服务端 301。
- F8【事实】图片：`img/Screenshot-1.png` 与 6 个 `img/feature_*_demo.png` 的 md5 都是 `5d5463ff…`（1530×3036，1.69 MB，VOA 页面截图，看不出任何功能），被 20 个非英语文件用作 hero、6 个功能图和轮播首图。`Screenshot-2/3/4` 在 git 历史中从未存在，造成 60 处 404。`img/en/feature_context_demo ≡ feature_doubletap_demo`。单页本地图片：index 14.97 MB，ja/zh 17.52 MB；`width/height` 0 处，`loading` 0 处；功能图标是 1024² 约 1 MB 的 PNG，显示尺寸 72px。
- F9【事实】GA4 `G-QS1CJY8YWL` 内联在 26 个 HTML 中；`analytics.js`、`site-notice.js` 也在 26 个 HTML 中（site-notice 的 `enabled: false`）；`surfenglish-promo.js` 在 25 个 HTML 中。`analytics.js:86-87` 的 Chrome 商店识别要求 pathname 含 `webstore`，因此新版商店 URL 识别不到。
- F10【事实】现有推广完全靠 JS 注入，静态 HTML 中没有 SurfEnglish 文字：fixed 顶部条加 `#hero` 之后的整屏卡片，App Store 链接不带 `pt/ct`，指向 SE 官网的链接带 UTM。de/fr/it/nl/pl/ru/tr/uk 链到 SE 英文根，文案却写 "App in 12 Sprachen/langues…"，有误导。文件 47,056 B。
- F11【事实】文案与产品不符：Plus 写"Unlimited AI pronunciation"、"Custom themes and dark mode"，正文写"shortcuts/volume/theme colors"，FAQ 写"initial version"、"20 language pairs"，页脚写"No personal data is collected"，描述写"in your browser"。23 个文件仍是 © 2025；"iPhone" 出现 0 次；22 处 App Store 徽章都是 `en-us` 且用旧域名（301）。所有 title 都是 "WordByWord - <泛化学习助手>"，H1 都是 "Word by Word<br>…"。
- F12【事实】契约 URL：`/privacy.html` 硬编码在 WBW iOS 中（`SubscriptionView.swift:68`、`MoreSettingsView.swift:168`，用系统浏览器打开）。ASC 的隐私和支持 URL 是 `/privacy.html`、`/support.html`；Marketing/seller URL 是根域（jp/kr 带 `/`）。SE 的 ASC 隐私 URL 是 `surfenglish.app/privacy/`。`/chrome-extension/privacy.html` 是否被 CWS 使用：⚠️ 未知。

**B. 产品**
- F13【事实】WBW iOS 只有一个 App target，没有 Safari 扩展、分享扩展或 Widget。支持 iPhone 和 iPad，iOS 18+，兼容 Mac（M1+，macOS 15）与 visionOS 2。App Store 当前版本 1.2.2（2026-05-27），首发 2025-06-06。最后一次代码提交 2026-06-03。
- F14【事实】核心交互：在 **App 内置浏览器**中对文本**右滑**，译文插在原文下方，显示方式有 Auto/Paragraph/Sentence-by-Sentence，结果可自动或手动显示。**没有整页自动翻译**。翻译引擎有两种：Cloud（Azure + Google）和 Local（iOS 系统翻译）。
- F15【事实】语言：UI 20 个 locale（xcstrings 315 个 key）；目标语言 21 个 locale；源语言默认 en-US，会自动检测，也可手动切换。**双击查词不支持中日韩源文**；**Chunks 和 Action Flow 只支持英语源文**。
- F16【事实】每日额度 Free/Plus（`FeatureQuotaManager.swift:63-84`）：云端右滑 50/500；本地右滑 100/不限；Chunks 30/500；Action Flow 20/500；右滑发音 10/100；双击查词 20/500；双击发音 10/200；More 10/500；句型解析 5/500。唯一的 IAP 是 Plus 月订 $3.99（US）。主题切换只有 `print`；没有快捷键和音量设置。
- F17【事实】WBW App 名按本地化决定：en 为 "WordByWord Translate"，zh-Hant 为 "WordByWord翻譯"，ru 为 "WordByWord Переводчик"，其余为 "WordByWord"。US 描述第一行是内部备注 "English concise submission version"。评分几乎为 0（cn 区 1 条，2.0）。隐私标签写 "Data Not Collected"，但 App 集成了 Firebase Analytics。
- F18【事实】SurfEnglish：US 名称 "SurfEnglish: Bilingual News"，版本 1.3.1（2026-09-19），App Store 上架 2026-08-18，类别 News + Education。界面 12 种语言（en、zh-Hans、zh-Hant、ja、ko、es、pt-BR、vi、id、th、hi、ar）；翻译目标 21 种，与 WBW 同一语言池；**只能学英语**（`MainViewModel.swift:2324` 硬编码 `sourceLanguage: "en"`）。Plus $2.99/月、$24.99/年。**中国大陆不可下载**（lookup cn 无结果，`/cn/` 404）。
- F19【事实】两款 App 属于同一开发者账号："Chi Jinlong"，artistId 1794902022；App Store 页面已在 "More by" 中互相展示。SE 官网 Person 名是 "Jinlong"，与此不一致。
- F20【事实】Chrome 扩展：v0.1.2，最后提交 2026-02-13，目标语言 7 种；找不到商店 listing；官网子站的 CTA 指向商店通用首页 `chrome.google.com/webstore`。
- F21【事实】WBW iOS 的 `APIConfig.baseURL` 是 `https://backend-test.word-by-word.app`，而 SE 侧把它定义为测试环境（见 §3 G8）。

**C. SurfEnglish 官网（参照对象）**
- F22【事实】零依赖 `node build.mjs`，包含 12 个 locale，路径为 `''/zh-hans/zh-hant/ja/ko/es/pt-br/vi/id/th/hi/ar`；hreflang 加 x-default；sitemap 16 个 URL；JSON-LD `@graph`；`apple-itunes-app`。部署在 CF Pages，生产分支 `cloudflare-deploy`；NS 在 Cloudflare；www 301 到 apex。官网首个提交 2026-07-25。
- F23【事实】SE 站不应照抄的缺陷：`applicationCategory` 用了非法值；`og:locale` 为 `ja`/`zh_Hans`；en title 84 字符；**没有任何统计**（所以 UTM 无人接收）；全站没有提到 WordByWord。
- F24【事实】CF Pages 的行为：`*.html` 和无尾斜杠路径会 308 到无扩展名/带斜杠地址（`/index.html`→`/`，`/404.html`→`/404`）；`pages.dev` 返回 200 且没有 `X-Robots-Tag`；**apex 自定义域名要求 zone 在 CF 上**；子域可以从外部 DNS 用 CNAME 接入，但必须先在控制台绑定，否则 522。`_redirects` 中 `.html` 源路径做 200 rewrite 的行为：⚠️ 需在 preview 环境实测。

**D. SEO 与外部规则**
- F25【事实，来自用户截图】GSC（网域属性，28 天，截至 2026-10-02）：71 次点击，1,286 次展示，平均排名 8.3。"wordbyword" 40/130，排名 1.6；"word by word" 13/758，排名 6.5。前 13 条查询中没有非英语词，也没有功能词。网页和国家维度缺失。
- F26【事实】Google：FAQ 富结果自 2026-05 起不再展示；HowTo 2023 年已移除；SoftwareApplication 富结果需要 rating 或 review，且不能搬用 App Store 评分；llms.txt 对 Google Search 无作用；即时 meta refresh 视为永久重定向（服务端 301 优先，至少保留 1 年）；hreflang 必须自引用且互相回指；Google 不用 `lang` 属性判断页面语言。
- F27【事实】品牌冲突：wordbyword.io（sitemap 634 个 URL，en/ru/de）、Chrome 商店上的 "WordByWord – Vocabulary Highlighter"、Quran Word by Word 系列 App、同名图书。
- F28【事实】Apple campaign link 格式为 `https://apps.apple.com/app/apple-store/id<ID>?pt=<provider>&ct=<≤30 字符>&mt=8`；Smart App Banner 只能写一个 `app-id`；Apple 提供本地化 SVG 徽章（`toolbox.marketingtools.apple.com/.../black/<locale>`），其中 hi-in、ar-sa、uk-ua 实际回落为英文图。
- F29【事实】Immersive Translate 的 iOS App 自带 Safari 扩展，能在 iPhone 上做双语网页翻译，包括 X 网页版。
- F30【推断，证据链完整】"非英语关键词几乎不命中"的首因是**架构**（没有入链、没有 sitemap、没有 hreflang、存在重复页），其次是关键词（title/H1 是泛化词、不含平台词和功能词），再次是内容质量（同图、破图、内容过时）。

**E. 素材与视觉**
- F31【事实】真正本地化的截图只覆盖 en（`img/en/`、`Resources/wbw_en`）、ja（`Resources/wbw_jp`）、zh-Hans（`Resources/wbw_zh`）。营销图是 1284×2778、2025-06 制作，不含 Chunks/Action Flow。X 场景原始截图是 2026-04-23 的。有 2 张带 Gemini 水印的图不可用。History 没有任何真实截图。6 个功能图标是 ChatGPT 生成的插画。
- F32【事实】品牌元素：logo 是白色斜体板衬线 "T"，配 3 条速度线，底为 4×4 红黑马赛克。品牌红 **#CC3355**（AccentColor display-p3 0.8/0.2/0.333；App 内译文引用条为 3px #cc3355，见 `10-dom-render.js:1138`）。现站主色却是 iOS 系统蓝 #007aff，按钮 hover 变 #e0b900（白字对比度约 1.9:1）。没有暗色模式；RTL 使用物理属性。
- F33【事实】本机图片工具链：`sips`/ImageIO 可以输出 AVIF/JPEG/PNG/HEIC；**不能输出 WebP**，也没有 cwebp/avifenc/magick/ffmpeg/PIL。Node 版本 v24.14.1。

**F. 已定裁决（作为设计约束）**
- F34【裁定】托管二选一：(a) GitHub Pages + Actions，加 apex A/AAAA 和 meta refresh 跳转桩；或 (b-lite) CF Pages，只改 `www` CNAME，用 `_redirects` 301，apex 暂不处理。**两个方案都不迁 NS。** `/` URL 不变（品牌词资产）。
- F35【裁定】locale 代码与路径对齐 SE：`zh-hans`/`zh-hant`/`pt-br`（hreflang 写 `zh-Hans`/`zh-Hant`/`pt-BR`），`cn-top` 与 `zh-top` 合并到 `/zh-hans/`；**不在 WBW 与 SE 之间使用 hreflang 或 canonical**。
- F36【裁定】SE 推荐的规则：静态 HTML、位于功能区之后、不放首屏、不用固定条；只面向学英语的访客，用条件式措辞；zh-Hans 页不放 SE 下载徽章；de/fr/it/nl/pl/ru/tr/uk 页要注明"界面为英文，可翻译成该语言"；链接不带 UTM，App Store 链接带 `ct`；privacy、support、chrome-extension 页不放推广区块。

---

## 5. 开工前仍需用户提供或确认（合并去重后的清单）

1. GSC：「网页」「国家」两个标签页的导出、`ja-top.html` 的 URL 检查结果、网域属性的验证方式。
2. GA4：`surfenglish_promo` 各 label 的点击基线，以及各页面的流量。
3. 托管选择：(a) 还是 (b-lite)；apex 是否本期处理。
4. "不新增素材"的边界：`Resources/wbw_*`、SE 仓库中的 1.3 截图、裁切图、程序化合成的 OG 图、CSS/HTML 复刻的样张、webfont，分别是否允许。
5. 对外开发者署名（"Chi Jinlong" 还是 "Jinlong"）；是否在页面上点名声明与 WordByWord.io 无关。
6. Chrome 扩展的去留（未上架时建议 noindex 或下线），以及它在 CWS 后台登记的隐私 URL。
7. WBW 生产环境使用 `backend-test` 后端的风险是否已知、是否有计划（不属于官网范围，但影响引流）。
8. ASC 的 Provider Token（`pt`）；是否愿意在下个版本把各本地化的 Marketing URL 改为对应语言页；是否修正 US 描述首行的内部备注。
9. 网站 GA 的同意管理方案，以及 privacy.html 是否要改写（包括"不收集数据"的表述与 Firebase 实际情况的冲突）。

---

## 附：本次核查用到的关键命令

- 仓库：`git ls-files | wc -l`；`md5 -q cn-top.html zh-top.html`；`diff index.html en-top.html`；`md5 -r img/*_demo.png img/en/*_demo.png`；`git log --all -- img/Screenshot-{2,3,4}.png`；`grep -rl G-QS1CJY8YWL|site-notice.js|surfenglish-promo.js --include=*.html`；`grep -rnoE 'href="[^"]*-top\.html'`。
- 线上：用 `curl -s -o /dev/null -w "%{http_code} %{redirect_url}"` 逐个探测站点、App Store、徽章 URL；`dig @ns-cloud-c1.googledomains.com www… CNAME`；`dig DS`；`openssl s_client … | openssl x509 -dates -ext subjectAltName`；`hstspreload.org/api/v2/status`。
- App Store：`itunes.apple.com/lookup?id={6741724502,6787367021}&country={us,jp,cn,tw,kr,de,vn,ru}[&lang=]`；抓取 App Store 页面 HTML（`scratchpad/fc/{wbw,se}_{us,jp}.html`）。
- 产品：`Localizable.xcstrings`（python 统计）；`FeatureQuotaManager.swift:63-84`；`MainViewModel.swift:1973-1981`；`20-features.js:281`；`APIConfig.swift:11`；`SettingsMenuViewController.swift:182-184`；`project.pbxproj:145,169`。
- SE：`build.mjs:33-72`；`src/locales/{en,zh-Hans,ja}.json` 中的 `meta`；`git log --reverse | head`；对 `surfenglish.app` 各路径做 `curl`；`git log -S'word-by-word.app/privacy.html'`（SE-iOS）。
- 外部文档：developers.google.com/search/updates；developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links；developers.cloudflare.com/pages/configuration/custom-domains；WebSearch 查询 Immersive Translate iOS。
