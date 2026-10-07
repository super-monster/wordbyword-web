# 实施决策日志

> 记录开工后用户确认的决策与关键执行节点。H 编号见 `appendix/research/12-rulings.md` 第三节。

## 2026-10-05

| 编号 | 事项 | 决定 | 影响 |
|---|---|---|---|
| — | 开工 | 用户确认按设计开工：先冻结旧站（M0-02），之后按计划分阶段推进，遇到需要决策的问题再提出 | M0 开始 |
| — | 操作用浏览器 | 用用户的 Chrome（Claude in Chrome，"Browser 1"）操作 GitHub、Cloudflare 等后台；登录由用户本人完成 | M0-02、M0-04、M1-02 |
| H10 | 设计文档去向 | 放到**独立分支** `design-docs`（与 main 无共同历史），分支根目录有说明 `README.md`；用 `ops/sync-design-docs.sh` 同步。仓库公开，分支内容同样公开可见（已告知用户） | M0-03 关闭；main 的 `.gitignore` 忽略 `docs/redesign-2026/`；CF Pages 预览分支排除 `design-docs` |
| H7 | 母语审校分工 | 用户本人审校 **zh-Hans、ja**；**zh-Hant、ko** 改为外部母语审校，T-7 前无着落则按 R36 回落（双模型互检 + 回译 + 术语表 lint，标记待复核）；**en** 用户不通读，按 R80 以双模型互检上线（上线后可补外部审校） | M0-08、M3-06/07 |
| H18 | 旧站止损（关闭固定推广条） | **不做**；旧站按现状冻结 | M0-09 取消 |

## M0-02 冻结旧站执行记录

- 冻结前基线（`ops/m0/before.txt`，2026-10-05T14:17:02Z）：`/`、`/ja-top.html`、`/privacy.html`、`/support.html`、`/chrome-extension/privacy.html` 均为 200，md5 已记录。
- 已创建并推送 `legacy-pages` 分支 → `7a389ba`（与 main 相同）。
- 2026-10-05T14:24Z：GitHub Pages 发布源由 `main` 切到 `legacy-pages / (root)`（用户 Chrome 操作）；Pages 构建 run 37324398657 成功。
- 已勾选 **Enforce HTTPS**：`http://www.word-by-word.app/` → 301 `https://…`（14:33Z 复测）。
- 已建分支规则集 **`freeze-legacy-pages`**（id 24509431，Active，目标 `legacy-pages`，无绕过名单）：Restrict updates、Restrict deletions、Block force pushes。API 复核：`rules/branches/legacy-pages` = `update`、`deletion`、`non_fast_forward`；`main` 无规则。
- 冻结验收（`ops/m0/after.txt`）：5 个 URL 的状态码、字节数、md5 与 `before.txt` **完全一致**（`diff` 无差异）→ **M0-02 通过**。之后 main 可以推送重构提交。
- GitHub Pages 自定义域名区域仍有 "word-by-word.app is improperly configured (NotServedByPagesError)" 警告：指 apex 未解析，属已知现状（F6），本期不处理。
- M0-03：设计文档已推送到 `design-docs` 分支；正式域名 `/docs/redesign-2026/00-README.md` 返回 404 → **M0-03 通过**。

## M0-07 内容事实核实（H11–H13，2026-10-05，源码与 App Store 页面）

| 编号 | 事项 | 结论 | 证据 |
|---|---|---|---|
| H12 | about 时间线日期 | 1.0 首发 2025-06-06；**1.1.0 = 2026-04-23**，1.1.1 = 2026-04-26，**1.2.0 = 2026-05-01**，1.2.1 = 2026-05-20，1.2.2 = 2026-05-27（当前版本） | App Store US 页面 Version History（2026-10-05 抓取）；F13 |
| H11 | X 截图中日文原文下的 "Extract chunks" 按钮 | **旧版行为**：截图拍于 2026-04-23（1.1.0 时期）；提交 `f738d0b`（2026-04-25 "Disable chunk extraction for non-English source languages"）起，非英语原文**不再显示**该按钮（`10-dom-render.js:922-930` `shouldShowExtractButton` 需 `isSourceSupported`；`MainViewModel.swift:1973` 仅 `en`）。新站 X 卡片按 R71 用 HTML 样张，不使用该截图 | WordByWordPrototype 源码与 git 历史 |
| H12 | Chrome 扩展是否收费 / Beta | 扩展源码中没有付费、订阅或试用逻辑；"Beta" 只出现在"句型结构解析"开关的注释中（默认关闭）。对外文案不写价格、不给扩展整体标 Beta；listing 未提供时按 S0 写 "Coming soon" | `WordByWord-translate-extension/src/core/settings.js:56`、`manifest.json`（v0.1.2） |
| H13 | 本地翻译引擎能否离线 | 本地引擎是 iOS 系统翻译（Apple `Translation` 框架，`TranslationAssetManager.swift`）：语言包状态为 `.supported` 时需先下载（App 估算约 100 MB），`.installed` 后在设备上翻译。整机断网流程（额度、统计等）未实测 → **对外不写"离线"**，可写"使用 iOS 内置翻译、在设备上完成（首次需下载语言包）" | `TranslationAssetManager.swift:26-50` |
| H11 | 截图第三方内容、zh-Hant 截图回落 | 按默认：R31–R33、R71（zh-Hant 用 en 截图） | 裁定 |

## M4-05 部分提前：GA4 后台设置（2026-10-06，用户确认）

- 用户确认"现在注册"：在 WordByWord-Web（538133762）注册 5 个事件级自定义维度——Event label（`event_label`）、Page locale（`page_locale`）、Element location（`element_location`）、From locale（`from_locale`）、To locale（`to_locale`）。参数名与 `src/js/analytics.js` 一致。理由：自定义维度不回溯，提前注册才能拿到旧站最后约 6 周的 label × locale 基线。
- 用户确认"标记"：`app_store_click` 设为关键事件（文档未要求；用于 G1 护栏与渠道转化率）。
- 增强型衡量保持开启（出站点击产生的 `click` 与自定义事件名称不同，不重复计数）。M4-05 剩余：DebugView 逐个验证新站事件。

## M1-01 main 重建（2026-10-05）

- 提交 `e3c3215`（main）："Rebuild main as a zero-dependency static generator (M1-01)"：删除旧站 84 个文件，favicon 移入 `public/`，新增 `build.mjs`、`src/site.mjs`、`src/lib/{html,seo}.mjs`、占位模板、`src/legal/*`（三份法律正文原样迁移，首行 updated 日期：privacy/support 2025-05-25，extension 2026-02-02）、`scripts/fixtures/{redirects.default.txt,requests.tsv}`（由文档 02 §5.2.2/§5.2.4 原样转写）、`.gitignore`（忽略 `docs/redesign-2026/`）。
- 本地构建：27 页、`_redirects` 67/7 与夹具逐行一致、D-20 通过；sitemap 23 条（S0）；首页 hreflang 22 条。
- 推送 main 后复测线上旧站：5 个关键 URL 与 `before.txt` 完全一致（`ops/m0/after-main-push.txt`），GitHub Pages 未被触发。
- **生产分支 `cloudflare-deploy` 的推送被权限检查归为"生产部署"而拦截**：由用户本人执行 `git push origin main:cloudflare-deploy`，或明确授权后再执行。CF 项目创建（含首次生产部署到 pages.dev）同样先取得用户明确确认。

## M0-04 权限清点（进行中，2026-10-05）

| 项 | 结果 |
|---|---|
| GitHub admin | 用户本人（super-monster），Chrome "Browser 1" 已登录；已完成 Pages 发布源切换、Enforce HTTPS、`legacy-pages` 规则集 |
| Cloudflare | Chrome "Browser 2" 已登录，账号 "Chi@icloud.com's Account"（c2c08e8d…）。现有 Pages 项目：`styliostudiowebside`、`styliostudiotop`、`surfenglishwebsite`、`surfenglish-admin`、`styliostudiomockup`，均已接 `super-monster` GitHub 仓库 → CF GitHub App 已安装（是否包含 `wordbyword-web` 待建项目时确认）。`wordbyword-web` 项目名未被占用 |
| GSC | Browser 2 可访问网域属性 `sc-domain:word-by-word.app`（只读读取基线，见 `ops/m0/gsc-baseline-2026-10-05.md`） |
| DNS 控制台（H8） | GCP 项目 "WordByWord"（wordbyword-450603）**未启用 Cloud DNS API、无任何区域** → DNS 不在该 GCP 项目中。NS 为 `ns-cloud-c1..4.googledomains.com`（原 Google Domains，已迁 Squarespace）→ 推断 DNS 控制台为 **Squarespace Domains**；Browser 2 未登录 Squarespace，待用户登录后只读确认 `api.`/`backend-test.`/`backend.` 记录所在并导出 zone（T0 前完成即可） |
| CF 应急部署 API Token、GitHub Secrets | 需用户本人创建与填写（涉及令牌，Claude 不代填） |

## M0-05 GSC 基线（H1，已完成）

- 28 天：70 点击 / 1,306 展示 / 排名 8.3；3 个月：111 / 2,220 / 9.6。
- **网页维度：只有 `/`、`/support.html`、`/chrome-extension/privacy.html`、`/privacy.html` 有展示；20 个语言页 0 展示。索引报告：Google 只知道 5 个网页（4 已编入、1 个"重复网页，用户未选定规范网页"）。** F30（架构为首因）由推断升级为实证。
- 详见 `ops/m0/gsc-baseline-2026-10-05.md`。
- **H2（GA4 基线，2026-10-06，只读导出）**：媒体资源 WordByWord-Web（538133762），衡量 ID G-QS1CJY8YWL，报告时区 JST。90 天 446 次浏览 / 382 名活跃用户，首页占 88.6%；28 天自然搜索占会话 61.7%。G1 护栏基线：`app_store_click ÷ page_view` = 4.0%（90 天）。`surfenglish_promo` 共 24 次，其中顶部条占 22 次（新版无顶部条，R42）。**T0 切换窗口定为 13:00–16:00 JST**（会话最低谷）。自定义维度 0 项：label 用预定义维度"链接文字"（旧站把 label 写入 `link_text`）代替，`page_locale` 用网页路径代替。详见 `ops/m0/ga4-baseline-2026-10-06.md`。

## M1-02 Cloudflare Pages 项目（2026-10-06）

- 用户本人执行 `git push origin main:cloudflare-deploy`（7c1bde1）。
- 在 CF 控制台（用户 Chrome "Browser 2"）创建 Pages 项目 **`wordbyword-web`**，连接 GitHub `super-monster/wordbyword-web`。（更正：当时以为 CF GitHub App 已有该仓库权限，实际没有，见下文"构建未触发"。）
  - 生产分支 `cloudflare-deploy`，自动部署开启；构建命令 `node build.mjs`，输出 `dist`，框架预设"无"，根目录空，构建系统版本 3。
  - 环境变量 `NODE_VERSION=24`（生产、预览均已核实）。
  - 预览分支：**自定义**，包括 `*`，排除 `legacy-pages`、`design-docs`、`dev`。
  - 自定义域名：未添加（T0 当天才添加，R/06 §10.2 第 7 步）。
- 首次生产部署成功：`https://wordbyword-web.pages.dev`（部署 c645bbb9）。实测：`x-robots-tag: noindex`（pages.dev 主机规则生效）；`/__build.json` 404（生产不输出构建戳）；**`/privacy.html` 直接 200，未被 CF 自动 308**（C-1 契约代理在 CF 上成立）；`/ja-top.html` → 301 `/ja/`。
- 控制台曾短暂显示"此项目已与您的 Git 帐户断开连接"提示；设置页显示仓库已连接（有"断开"按钮），后续推送若未触发构建再处理。
- 推送实测分支 `spike/default`（= 498026d，全部 20 语言发布的骨架）与 `spike/lc`（实验组 L、C 开启 + 合成用例），用于 M1-03。
- **构建未触发（已修复）**：推送 `main` 与 spike 分支后 CF 无新部署，控制台提示"此项目已与您的 Git 帐户断开连接"。原因：GitHub App "Cloudflare Workers and Pages" 安装为"仅选定仓库"，列表中只有 4 个仓库，不含 `wordbyword-web`，推送不会通知 CF。经用户同意（"同意，由你来加"），在 GitHub 设置 → Applications → Cloudflare Workers and Pages → Repository access 中加入 `wordbyword-web`（现为 5 个）。重推后 webhook 生效，`main`、`spike/default`、`spike/lc` 均完成预览构建。

## M1-03 preview 实测 spike（2026-10-06，已完成）

部署：`main`（958560f）；`spike/default`（e1c2ed5 = 498026d + 空提交，20 种语言全部发布）；`spike/lc`（2fb6cd3：实验组 L、C 开启，另加合成用例）；`spike/unshallow`（5cb0277：构建内先尝试 `git fetch --unshallow`）。spike 分支一律不合并。探针脚本为 `scripts/spike-check.sh`；main 另跑 `verify-deploy.sh --preview`（`QUERY_PRESERVED=1`）与 `contract-test.sh`。原始输出见 `ops/m1/`。

| # | 实测项 | 结果 | 结论 / 动作 |
|---|---|---|---|
| 1 | C-1 契约代理 | 3 个契约 URL 均 200、无 Location；`/privacy.html` 与 `/legal/privacy/` 的 body 字节一致；canonical 为契约绝对地址；扩展隐私页（S0）noindex、无 canonical；带 `?from=app` 仍 200；HEAD 200；6 个变体均单跳 301 | 采用 C-1，`contractMode:'proxy'` 定稿 |
| 2 | `_redirects` 是否保留 query | `/ja-top.html?utm_source=t` → `301 /ja/?utm_source=t` | 保留。verify-deploy 默认改为 `QUERY_PRESERVED=1`（丢 query 判 FAIL）；正式域名切换后复测（文档 02 §5.3 第 6 条） |
| 3 | 是否区分大小写（实验组 C） | 关：`/zh-Hans/`、`/pt-BR/`、`/ZH-HANS/` 均 404，`/zh-hans/` 200 → 匹配区分大小写（Q22）。开：`/zh-Hans/` → 301 `/zh-hans/`，`/pt-BR/` → 301 `/pt-br/`，无循环（Q23）；`/ZH-HANS/` 仍 404（只收 BCP 47 写法） | 开启 `experimentC` |
| 4 | `/index.html` 规则会不会循环 | `/index.html` → 301 `/`，`/index` → 301 `/`，无循环 | 保留 `indexHtmlRule:true` |
| 5 | 实验组 L | 开启后契约 URL 仍 200（data-page 正确）；`/legal/privacy/`、`/legal/support/`、`/legal/extension-privacy/` 单跳 301 到对应契约 URL | 开启 `experimentL`。contract-test 对 `/legal/*/` 的断言按 `.cache/redirects.json` 自动切换为单跳 301 |
| 6 | 嵌套 404 | `/spike-404/missing` 返回 `/spike-404/404.html`，`/ja/missing` 返回 `/ja/404.html`，状态码均为 404 | CF 支持就近查找 404。M4-12（本地化 404）具备条件，仍为 M4 可选项（R21） |
| 7 | Node 版本 | `v24.13.1`（`NODE_VERSION=24`） | 符合 |
| 8 | 浅克隆 | CF 克隆深度为 1（`gitShallow:true`，`gitCommits:1`）。后果：sitemap 无 lastmod；about 页"Last updated"退回构建日，每次部署都会变。`spike/unshallow`：构建内 `git fetch --unshallow` 成功，耗时约 2 s，之后 36 个提交，sitemap lastmod 6/6，about 日期等于源文件的 git 日期 | 在 CF 上构建前先补全历史，失败时按文档 06 §3.6.1 省略 lastmod 并告警。**注意：CF 构建环境的 origin 地址内嵌 GitHub 访问令牌**，构建不得打印或写出 remote 地址（探针输出已脱敏） |
| 9 | `_headers` 同名头 | 两条规则命中同一路径时，同名头的**两个值都会发出**（`x-spike: a` 与 `x-spike: b`）；`/assets/*` 的 Cache-Control 为单值 `public, max-age=31536000, immutable`，未与 CF 默认值叠加 | 维持 R47：同名头只出现在互不重叠的规则中。当前 `_headers` 已满足：安全头在 `/*`，缓存头在路径规则，noindex 在主机规则 |
| 10 | preview 是否自带 noindex | 去掉自有的 pages.dev 规则后，preview 仍返回 `X-Robots-Tag: noindex` | CF 对 preview 部署默认 noindex。生产 pages.dev 子域仍需自有主机规则（保留） |

- main（958560f）：`verify-deploy.sh --preview` 132 PASS / 0 WARN / 0 FAIL / 0 SKIP；`contract-test.sh` 21 PASS。
- 其它观察：`/cn/ja-top.html` → `/zh-hans/ja-top.html`（404），按文档 02 §5.3 第 9 条接受。CF 对 HTML 默认 `Cache-Control: public, max-age=0, must-revalidate`。
- **M1-09 验收（本地模拟器 vs CF）**：用同一套探针跑 `scripts/serve.mjs`（`--emulate-host` 对应预览主机，dist 来自同一提交）。唯一差异是同名头的表示：CF 分两行发出，模拟器原先合并为 `a, b`。已改为分行，并把就近 404 设为默认（新增 `--flat-404` 退回只用 `/404.html`）。改后 spike-default、spike-lc 两套配置的输出与 CF **逐行一致**；本地 `verify-deploy.sh --preview` 131 PASS / 1 SKIP（部署提交戳只能在真实边缘验证）。
- 定稿：`SITE.contractMode:'proxy'`；`SITE.redirectFlags = { indexHtmlRule: true, experimentL: true, experimentC: true }`。按文档 02 §5.2.3，全部语言发布后条数为 76/10；未发布语言的 X 规则不生成。

## M2-09 图片管线（2026-10-06，958560f）

- 产物：`assets/img/**` 91 个文件 + `assets/img/images.json`；`public/favicon.ico`（16 + 32）、`public/icons/*`、`public/site.webmanifest`。闸门：`scripts/check-images.mjs`（结构检查 + Chrome 实际解码，R79），CI 中运行。
- 偏离文档 05 v1.3 的实测修正（已写回文档 05 §5.x、§7.1、§7.3、§7.4、§7.8 与文档 06 §7.4；manifest `note` 字段记有依据）：
  - ja 朗读节选 y .658 → **.661**：.658 的首行切到红色译文条（墨迹 0.83%）。
  - zh-Hans 朗读节选 y .645 → **.6667**：.645 上下边都切到文字（墨迹 4.9% / 2.1%）。
  - zh-Hans 查词图 `pins` ①.303 ②.747 ③.83、`ring` {x .025, y .286, w .288, h .033}（M2 量取，待 A12 目视复核）。
  - 节选边缘门槛由"亮度 σ < 4"改为"墨迹占比 ≤ 0.5%"，σ 只作提示：空白行横跨白底与浅灰卡片交界时 σ 可达 5–6。
  - favicon 改在 node 中绘制圆角，不依赖 Chrome headless；ICO 为 16 + 32 双图。AVIF 一律不带 alpha 平面（`alpha:false`）。

## M1 退出（2026-10-06）

- 提交：63555ed（校验器 L-1…L-14、D-1…D-24，M1-07/12/13）→ 12ab37e（校验器发现的文案问题、JS 包瘦身）→ 054254c（采纳 M1-03：实验组 L、C 开启，`redirectEvidence`，CF 上补全 git 历史，IndexNow 密钥文件，`sitemap-legacy.xml`）→ 5328861（CI 跑测试与伪 locale 扫描）。
- 退出条件：① preview 构建正常（054254c：CF 实测 verify-deploy 136 PASS / 0 FAIL，contract-test 18 PASS；非浅克隆，39 个提交，sitemap lastmod 6/6）；② 38 条规则各有故意造错的样本触发（49 个测试，最后一个断言全部规则都被触发过）；③ spike 10 项均有结论，`contractMode:'proxy'`、`redirectFlags{true,true,true}` 定稿；④ 默认开关下 `_redirects` 与夹具逐行一致（67/7，测试断言；全开为 76/10）；⑤ CI Node 22/24 通过。
- Agent D 报告的 4 个内容问题：法律页标题移入 `en.json legal.*`；about 的 `*Word by Word*` 改为“Word by Word”（已写回文档 08）；zh-Hans `chromeExtension.cta.contactSubject` 由英文改为"Chrome 扩展"（已写回文档 08，**请在 zh-Hans 审校时确认**）；JS 包 11.6 → 9.3 KB。
- IndexNow 密钥已生成并写入 `SITE.indexNowKey`（公开值，构建输出 `/<key>.txt`）。`indexnow.yml` 在生产域名仍是 GitHub Pages 时会跳过，不会提前推送。
- 校验器的取舍（Agent D）：L-5 允许设计上为空的两个键；D-9 的 `@id` 引用只要全站某页定义即算闭合；D-17 额外接受 `maintenance`、`info` 级别；L-8 以文档 06 §4.2 的上限优先；伪 locale 扫描跳过脚本与英文法律正文。

## M2 进行中（2026-10-06）

- **官方徽章**（用户同意下载）：`scripts/badges.sh` 从 Apple Marketing Tools v2 取 18 种黑色本地化徽章，全部为 v2、无回落英文；三处显示高 48px（文档 05；文档 06 "高 40" 已更正），懒加载（D-6）。885df4e。
- **OpenCC 简体字表**（用户同意下载）：vendor `STCharacters.txt`（3ac34aa，Apache-2.0）；`_simplified-only.txt` 3,807 字；ja 子集去掉 JIS X 0208 汉字后 3,610 字（用本机 EUC-JP 解码器枚举，无需额外下载）。现有 ja 文案通过。7e87e2e。
- **M2-11 视觉评审**（en、ja、zh-Hans × 亮/暗 × 375/900/1280，另用临时阿语文案做 RTL 检查）：机身全部 9:41；编号钉不压字；节选图无叠加标签；暗色下 header、页脚、最终 CTA 图标描边清晰；390 宽页高 en 12,791 / ja 12,698 / zh-Hans 11,470（≤ 13,000）。修正（ce29b8c）：
  - zh-Hans 标题在词中断行（"原文不／动""网页翻／译""任／意网页"）→ 按文档 05 §3.5 给相应字段加 `{wbr}`，有标记的标题切为 keep-all（用 `:has(wbr)` 实现 `.wbr-keep`）；FAQ 标题用不换行空格避免"的"起行。**zh-Hans 文案仅改排版标记，未改措辞，请在审校时知悉**（已写回文档 08）。
  - 价格表：额度值不断行；Plus 价格只在括号前换行（ja 原来断成"価／格"）。
  - L2 页边注：`text-wrap: balance`，ja 用 `word-break: auto-phrase`（"言い／回し"）。
  - RTL：所有机身屏幕与语块示意卡固定 LTR（ar 下 L2 状态栏曾被镜像）；样张译文、X 样张译文、查词卡在 ar 下 `dir="rtl"` 右对齐、红条留左。
- **留给 M3（ar 文案）**：文档 05 §5.2.6 要求的"阿拉伯语译文按从右到左排版"直接写进 ar 的 `demo.caption`，不新增键。【建议，待确认】A8 的基准用真实的 `/ar/` 页面截图代替原型 `ar.html`（文档 05 §9.2）：生产模板已能渲染 RTL，本次已用临时阿语构建核对 §5.2.6 / §9.2 的各项规则。
- **M2-10 OG 图**（c83de46）：`scripts/og.mjs` + `src/templates/og.mjs`，首批 6 张（home ×3、about、扩展页 ×2），128–175 KB；`og.json` 输入哈希与 D-23 一致，确定性输出。偏离文档 05 §7.8（已核看全部 6 张图，质量合格）：① 标题字号从 64px 起按"2 行内且 ≥ 52px，否则 3 行"自适应，因现有 `meta.ogHeadline` 在 64px 下放不进 2 行；② 句号/冒号后的标记短语另起一行；③ 扩展页卡片用浏览器整窗截图而非 iPhone 机身（`ogInputs` 指定 `ext/common/hero`）；④ 平台行取 `features[devices].title`，扩展页为 "Chrome · Microsoft Edge"。注意：`og.mjs` 运行时读取 tokens/base/demo.css，这些 CSS 的改动不触发 D-23，改动后需手动重跑 `npm run og`。about 新增 `meta.ogImageAlt`。
- **评审备注（未改）**：拉丁文 hero H1 行高 1.08 小于字体内容区（约 1.19em），标记短语在第二行时黄底上沿贴住上一行的下伸部（en "paragraph"），未遮挡字形。原型已验证此设计，改动需在"标记圆角"与"标题行高"之间取舍，留待设计复核。

## M2 验收审计（2026-10-06，只读 agent，基于 7e87e2e，HEAD c83de46 复测）

结论：7 项 FAIL，已修 5 项（3167493）：扩展页 header（FIX-1，D-24 新增两态断言）；ja/zh-Hans 标题断行（FIX-2，C11）；`#surfenglish` 按卡片计高（FIX-6）；support.html 待修订注释（FIX-7）；M2-10 已在 c83de46 完成。另修：下载按钮可访问名称（D1，WCAG 2.5.3）、仅英文页的语言回落提示（D2）、无 JS 时不画 L2 引线（D4）、去掉 FAQ 展开动画（D5，05 §9.3）、扩展隐私页标题品牌重复（D6）、暂停按钮预留空间（D8）。进行中：公告条样式（FIX-3）与 about/扩展页/404 页面样式及二级页 H1 字号（FIX-4，后台 agent）。待用户确认：FIX-5（A8 基准用真实 `/ar/` 页代替原型 `ar.html`）。

文档冲突的取舍（按"裁定 > 视觉以 05 为准 / 文案以 08 为准 / 工程以 06 为准"）：

| # | 冲突 | 取舍 | 写回 |
|---|---|---|---|
| C1 | 06 §6.2 只许 opacity/transform/clip-path；05 允许 `grid-template-rows` | 按 05（样张译文展开），实测 CLS ≤ 0.0027 | 记录 |
| C2 | 样张 IO 阈值 06=0.25、05=0.35 | 按 05：0.35（另有 900ms 起播延迟） | 06 已改 |
| C3 | `hero.priceShort`（03/07）与 `hero.ctaNote`（05/06/08） | R77 已收编为 `ctaNote` | 03、07 已改 |
| C4 | 04 A4 量 `#surfenglish`，05 §6.2 量卡片 | 改为外边距，两种口径一致 | 代码已改 |
| C5 | 页脚 SE 图标 04=20px、05=32px | 按 05：32px | 记录 |
| C6 | about 落点 ⑤：04/06 要 3 条链接，08 只有 2 条 | 按 08（R75，SE 文案以 08 为唯一来源）；04 A22 仍通过 | 记录 |
| C7 | S1 时 FAQ `devices`：R45 要 listing 链接，08 链扩展页 | 按 R45。**S1 上架时须改 `faq.items[devices].aExtLive`，并新增 rich ref（如 `@chrome-store`）指向 listing**；S0 期间不受影响 | 记为 S1 待办 |
| C8 | 05 A2"同一 src 每页至多一次"与徽章出现三处 | A2 针对内容图片，徽章与图标豁免 | 记录 |
| C9 | 类名 `.sibling-note`（05）/ `.sibling__note`（04） | 按 04（BEM，与代码一致） | 记录 |
| C10 | 06 §5.5 法律正文标签白名单 vs 原样迁移 | 原样迁移优先；白名单只约束日后的修订 | 记录 |
| C11 | ja 的 `{wbr}` 与 auto-phrase 叠加冲突 | auto-phrase 只用于无标记标题 | 05 §3.5 已改 |
| C12 | 02 §7.4 不做面包屑，05 §6.3 线框画了面包屑 | 按 02：Phase 1 不做 | 记录 |
| C13 | 徽章高 06=40、05=48 | 按 05：48px | 06 已改 |

其它：D9 规格清单在 390 宽的高度 en 379 / zh-Hans 372（05 §5.4.4 目标 360），超出约 5%，接受，不改文案。

## M2 完成（2026-10-06）

- 提交：3167493（审计修复）→ 6fb1aab（M3-01 翻译记忆 `src/locales/_legacy/`、L-1 识别错名语言文件、claims-lint 补 11 种语言的"选中翻译"写法）→ 8b203b1（公告条与 about／扩展页／404 页面样式，FIX-3/FIX-4；CSS 打包去掉 `{ } ; ,` 两侧与 `:` 后的空白，52.2 → 46.6 KB，经 Chrome CSSOM 核对 425 条规则逐条一致）。
- 样式 agent 的取舍：不做可见面包屑（02 §7.4，about 的 JSON-LD BreadcrumbList 保留）；去歧义说明按 05 §6.3 放在导语下、≥1200px 移入右栏；S0 扩展页 CTA 按 05 §5.11/§6.4 用 eyebrow 行状态标签 + 邮件链接（`cta.unavailable` 未使用）；404 标题保留文案 "Page not found"，按 05 用衬线字体；D-6 允许每页一张 `fetchpriority="high"` 的 LCP 图（05 §8.2）；扩展页 header 按钮 <560px 改用 `nav.iphoneApp`（"iPhone app"）以免挤压 logo。新增文案键 `chromeExtension.excerptLabel`（en "Chrome extension · screenshot excerpt"；zh-Hans「Chrome 扩展 · 截图局部」，取自 05 §5.11，**请审校**）。
- 公告：现有 20 种语言的公告正文都超过手机两行，按 05 §5.15 一律折叠进 `<details>`（标题为 summary）。
- 未做（缺内容）：扩展页 05 §6.4 的桌面 HTML 样张（zh/ja/es 切换标签）与 7 种目标语言标签——文档 08 与 product.json 都没有对应文案和数据，留待补内容。小问题：320px 下 S0 的邮件链接箭头换行；S1 状态 380–389px 宽时字标与地球图标间距仅 2–12px。
- M2 退出条件：① 页面齐全（S1 用临时构建验证）；② 视觉矩阵评审通过（ar 用临时阿语构建核对 RTL）；③ D-6/D-7 与 AVIF 两层校验通过；④ 文档 04 A1–A9 通过（A6/A7 需更多语言上线与外网）；⑤ 模板 0 个硬编码界面字符串（伪 locale 扫描）。→ 打 tag `strings-v1`（M3-02）。
- CI 修复（94f9810）：Node 22 下根级 `after()` 钩子提前执行，删掉了校验器测试的共享构建目录（8b203b1 新增测试文件后时序改变才暴露）；改为每个测试文件独立进程（`node --test scripts/tests/*.test.mjs`），临时目录在进程退出时清理。CI Node 22/24 均通过。
- **`strings-v1` 已打 tag（94f9810，M3-02）**：en 文案冻结，M3 开始。

## M3 进行中（2026-10-06）

- 第一批（T1/T2）6 个翻译 agent：zh-Hant 完成；ko、es、pt-BR、fr、de 因使用额度上限中断，已分批恢复（进度保存在各自的私有副本与上下文中）。
- **zh-Hant 已接入**：`src/locales/zh-Hant.json` + OG 图 `home-zh-hant`（60px × 2 行，142.8 KB）；构建 0 error（11 页，`_redirects` 74/9），测试 58/58。QA 记录 `ops/m3/zh-Hant-qa.md`（关键词落点、Q1–Q13、回译、10 处没把握的措辞）。台湾用语人工排查；16 个标题加 `{wbr}`、5 处 `\u00a0`，320/375/768/1280 宽复测均在短语边界断行（文档 08 §7.7 已同步）。T1：上线前须母语审校（H7：外部审校或按 R36 回落）。
  - 待负责人决定：① `meta.appStoreSubtitle` 写「右滑翻譯 AI 解釋」，与 TW 店面原文「滑動翻譯 AI 解釋」不同（glossary X13 禁用「滑動翻譯」；该键在 zh-Hant 页面不显示）；② 指向英文 about／扩展页的链接文字加了「（英文頁面）」，ja、zh-Hans 未加——是否统一；③ 若 H11 改用 zh-Hans 截图，9 处 alt 与图注需重写。
- 测试夹具不再写死已发布语言数（`--keys` 取第一个未发布语言；D-2 按实际 hreflang 条数推算）。
- **PR-SE-1**：SE 仓库分支 `wbw-family-pr1`（f8dbc27、4a3ce46、42be5af、733b1d9）经用户同意已推送到 origin，供用户审阅；未合并、未动 main/cloudflare-deploy。S6 未做（需人工判断）。about 页 App Store 链接暂为普通链接，待 H3 provider token 后加 `ct=se-about`。
- **额度与节奏（2026-10-06 12:50）**：本周总额度已用 89%（10/9 00:00 JST 重置）。经用户确认选"继续全速"。为了在额度见底时尽量多留下已完成的语言，每个 agent 只做 1 种语言（第一批的数据显示，一个 agent 做 2 种语言时上下文会接近上限，总消耗反而更高），并发控制在约 7 个，有空位再补。
- **es、fr、ko 已接入**（e8e1aaf）：
  - OG 图：home-es 64px × 3 行，home-fr 58px × 3 行，home-ko 64px × 2 行。
  - 构建 0 error（14 页），测试 58/58，pseudo 0 error，check 0/0。
  - QA 记录：`ops/m3/{es,fr,ko}-qa.md`。ko 另做了 Sonnet 第二模型互检（R36），31 条意见中采纳 23 条。
  - demo 模板修复：ko 在宽度计算上属于 cjk，但句子之间要空格。原来的 demo 只要是 cjk 就把译文句子直接连写，现在改为只有 zh／ja 连写，ko 稿里临时加的尾空格已去掉。
- **es、fr 的 claims-lint 与 G1 词表已合入**（1d5fe5b）：各 25 条规则加上本语言写法，G1 加入 how-to 说法。采用最小文本插入，保留原文件的手工排版。L-14 与 L-9 的 es、fr 警告已消除。抽查反例句全部命中。
- **第二波开工**：
  - it、nl、pl、ru、tr 已启动；pt-BR、de 已恢复。uk、vi、th、id、ar、hi 排队。
  - 简报补了"Wave 2 notes"：每个 agent 只做 1 种语言；在最新 HEAD 的新副本上做最终校验；lint 补丁写成 `ops/m3/<code>-lint.json`，由负责人合入；仅有英文的页面统一标注；App 叫法照 App 原文；渲染检查各用独立端口。
- **待负责人决定（第一批汇总）**：
  1. 指向仅有英文页面的链接是否统一加"（英文）"标注。现状：zh-Hant、ko、fr 加了，es、ja、zh-Hans 没加。第二波按"加"执行。
  2. 截图可见图注是否注明"英文界面"。现状：zh-Hant、ko、es 加了，ja、zh-Hans 没加。
  3. App 侧字符串问题，建议转给 App：
     - es、fr 界面里 "AI" 与 "IA" 混用；
     - fr 按钮名用了英语式词首大写；
     - ko 的「더블 탭 번역」「검색 기록 상세」两处措辞。
  4. 各语言 `meta.appStoreSubtitle` 未核实（这些页面不渲染该键）。
  5. lookup 功能区的 kicker 保留 App 原名，es、fr 因此各有一条 L-8 警告：保留原名，还是改成自然说法。
  6. fr 首页在 375 宽下约 13.7k px，超出 13k 的软目标。
- **pt-BR、de 已接入**（6e3dddd，lint 数据 c657445）：
  - OG 图：home-pt-br 60px × 3 行，home-de 64px × 3 行。
  - 构建 0 error（16 页，`_redirects` 76/10），测试 58/58，pseudo 0 error，check 0/0。
  - lint 合并脚本扩展到 seOwned／seOwnedLead：取仓库现值与补丁的并集，仓库原有顺序在前，只改本语言那一行。pt-BR、de 的 seOwned 补上了语块词（blocos、Chunks），与 en、zh、ja、ko 一致。
  - 注意：seOwnedLead 会合并所有语言的写法后检查每一页的 H2（validate-dist.mjs:687），各语言的写法只会命中本语言文本，现阶段无冲突。
- **新增的待决事项**：
  1. **kicker 上限**："kicker 用 App 原名"与 24 宽度上限在拉丁语种冲突（pt-BR 30、fr 28、es 26）。可选：放宽到 32，或改用短名。
  2. **页面高度**：390 宽下首页高度的软目标是 ≤ 13,000 px，目前已超出的有 de 13,640、fr 13,548、pt-BR 13,070、es 13,048（en 12,821）。页脚语言列表会随上线语言增加而变长，建议改成相对 en 的比例，在 M3-09 预览检查时一并定。
  3. **de 的 SE 卡片余量**：在 320／375／900 宽下只剩 7–9 px，以后改卡片文案需要重测。
  4. **页脚链接**：de 页脚里指向英文页的 About、Support、隐私链接没有加"(auf Englisch)"，与正文链接的标注规则一起定。
- **额度变化（13:47）**：本周总额度回落到 4%（看起来被重置了），现在只受 5 小时额度限制，排队的语言不再等待，按约 7 个并发继续补位。
- **it、nl 已接入**：
  - 提交：文案 68714f2，lint 数据 4cb02e7，`{minOS}`／`{minMacOS}` 不换行修复 0267123。
  - OG 图：home-it 64px × 3 行，home-nl 58px × 3 行。
  - 构建 0 error（18 页），测试 58/58，pseudo 0 error，check 0/0。
  - 版本号修复的起因：it agent 在 390 和 1280 宽下看到"(macOS"落在行尾。现在占位符代入时把空格换成不换行空格，所有语言生效；JSON-LD 的 operatingSystem 是写死的，不受影响。
- **第二波新增的待决事项**：
  1. **it 的 AI／IA**：文档 03／08 给 it 写的是 "IA"，但 App 的 it 字符串全部用 "AI"，it 稿全页统一用 AI。如果要改成 IA，需要改 12 处，键名清单在 `it-qa.md` §6-3。
  2. **nl 的 "AI Lezing"**：App 原文照引，lezing 在荷兰语里通常指讲座，正文写 voorlezen。是否按规则 ③ 当作 App 错误改写。
  3. **nl-lint 可能误伤**：`hype` 的 "de enige" 和 `initial-version` 的 "eerste versie" 有误伤正常句子的可能，留待母语审校。
  4. **App 侧字符串问题**：it、nl 两种语言的问题清单在各自 QA 记录里，nl 的较多。
- **pl、uk、ru、tr 已接入**：
  - 文案：pl 4fa56f6，uk 0b68efc，ru、tr 5fc3223；各自的 lint 数据另行提交。
  - OG 图：home-pl、home-uk、home-ru、home-tr 都是 64px × 3 行。
  - 状态：15 种语言、22 页；干净 HEAD（3d520ab）上构建 0 error，测试 62/62，pseudo 0 error，check 0/0。
  - 流程改进：agent 会随时往仓库放未跟踪文件，有一次 uk.json 恰好在校验中途落地，导致误报。改为"先本地提交，再用 `git archive HEAD` 导出的干净副本跑全套校验，通过才推送"（scratchpad/verify-head.sh）。
- **第二波发现的跨语言问题，均已修复**：
  1. **lint 词边界**（bb689eb）：JS 的 `\w`、`\W`、`\b` 即使带 u 标志也只认 ASCII，`zaznacz\w* tekst` 匹配不到 "zaznaczyć tekst"；ru 的 seOwnedLead `^\W*` 等于不锚定开头。现在数据规则里的这三个记号改为任何文字的字母、附标与数字。现有文案没有新增命中，并补了测试。
  2. **价格表窄屏裁切**（54afac8）：`.table-wrap { overflow: hidden }` 加上不换行的值与标签，320 宽下 en 被裁 19px、fr 被裁 116px，560 宽下 fr 被裁 97px。现在：
     - 768 以下单元格、Plus 价格、"仅英文"标签可以换行；
     - 400 以下表格更紧凑，行名可自动断字；
     - 外框改为可横向滚动，作为兜底。
  3. **页眉**：360 以下只显示图标（品牌链接的名称来自图标的 alt）。es「Descargar」这类较长的下载短标签不再把语言按钮推到字标上。
     - 实测 13 种语言 × 21 个宽度（320–1440），后来加上 ru、tr、uk 复测，都没有表格溢出、整页横向溢出或页眉重叠。
  4. **HTML 解析器**（78b1856）：`"İ".toLowerCase()` 是两个码元，head 里每有一个土耳其语 İ，就会多截一个字符的 JSON-LD（D-9）。现在改为用不区分大小写的正则在原字符串上查找结束标签，并补了测试。tr 的 ogImageAlt 已换回含 İ 的原句。
- **为旧表格缩写的文案已改回**：
  - ru：「Только английский」「3,99 $ в месяц (США)」，由 ru agent 改回。
  - uk：「Лише англійська」「на місяць」。uk 的免费列表头保留同义词「Безплатно」，因为「Безкоштовно」按表头字号在 320 宽下仍超出 15px。
  - tr："· bulut motoru / · yerel motor"。
- **暂停与恢复**：14:4x 遇到 5 小时额度上限。vi、th、id、ar、hi 被主动暂停，进度保存在各自的副本里；额度恢复后已全部续跑。
- **新增待决事项**：
  1. "AI" 的写法：it、tr 正文用本地说法还是保留 AI。it 全页用 AI；tr 正文写 "yapay zekâ"，App 名照原文。
  2. **页面高度**：390 宽下 ru 13.8k、de 13.7k、uk 13.7k、fr 13.6k，均超过 13k 的软目标；页脚语言列表会随语言增加继续变长。仍建议改为相对 en 的比例。
  3. **App 侧字符串问题**：pl、uk、ru、tr 各有清单，见各自 QA 记录。几处较突出的：
     - ru 的 Update／Upgrade 两个按钮同为「Обновить Сейчас」；
     - ru 店面副标题与 FAQ 口径相反；
     - uk 的 App 里混入了俄语词；
     - tr 的 "Limit Raporlandı" 意思不对。
- **vi 已接入**（1331454，lint 数据 2dc25ec）：
  - OG 图：home-vi 56px × 2 行。
  - 状态：16 种语言、23 页，干净 HEAD 校验 CLEAN。
- **strings-v1 之后的 en 改动（f44fd7e）**：朗读功能截图（tts-ex 节选）实际显示的是朗读播放器正在读一句西班牙文，并没有"翻译后的段落"，vi agent 发现了这一点。
  - en 的 `features[speech].alt` 已按图改写。
  - 跟随 en 旧说法的 ko、es、pt-BR、fr、de、it、nl 也由负责人一并改写，这 7 处请母语审校时顺带确认。
  - zh-Hant、pl、ru、tr、uk、vi 原本就是按图写的；zh-Hans、ja 用的是各自语言的截图，不受影响。
- **vi 带出的待决事项**：
  1. SE 页脚店名：文档 04 写「SurfEnglish: Đọc tin tiếng Anh」，研究 05 记录的 VN 店面名是 "SurfEnglish: Bilingual News"。用哪个？
  2. VN 店面没有越南语本地化：appStoreSubtitle 照录了 US 英文副标题，所以有 1 条 L-4。
  3. App 侧字符串问题：X9「Dịch Chuyển」、双击和 local 各有两种说法、查词译成"搜索"等，清单见 `vi-qa.md`。
- **id 已接入**（fbfd7c2，lint 数据 2e8ced2）：
  - OG 图：home-id 64px × 3 行。
  - 状态：17 种语言、24 页，干净 HEAD 校验 CLEAN。
  - 措辞处理：右滑按 X12 写 "Geser"；App 自己的功能名是 "Gesek untuk Menerjemahkan"，glossary 已禁用 gesek。
- **id 带出的待决事项**：
  1. App 侧字符串问题：
     - X12 的 "Gesek"；
     - `tts_trial_exhausted_fallback_message` 整条是马来语，"mainan AI" 意思是"AI 玩具"；
     - Upgrade／Tingkatkan 混用；
     - 清单见 `id-qa.md`。
  2. 两条 kicker 的 L-8 warning（App 原名 25、28 > 24），与其他语言一起定。
- **th 已接入**（48342fa，lint 数据 ee73df7）：
  - OG 图：home-th 54px × 2 行。
  - 状态：18 种语言、25 页，干净 HEAD 校验 CLEAN，测试 63/63。
  - 泰文断行：Chrome 的 ICU 词典会把泰文断在词中间，例如「คลา|วด์」「อิน|เท|อร์เฟซ」。按 05 §3.5，标题类字段用 U+2060 连接复合词。
    - th.json 里写成 `⁠` 转义，审校时看得见；meta、title、OG、alt 不加。
    - 生成脚本与干净原稿保存在 `ops/m3/th-work/`（`glue-th.mjs` 由 `th.src.json` 生成 th.json）。以后改 th 文案，先改原稿，再重新生成。
- **随 th 修复的两处**：
  1. **校验器**（4883d1a）：匹配前去掉软连字符、零宽空格、U+2060、BOM。源文案侧在 `displayText`，构建产物侧在 `normSpace`，免得禁用词借连接符逃过检查。页面渲染用的 `plain()` 不动。
  2. **行高**（6439eb5）：05 §3.3 的表格原来只实现了 CJK 一行，现补上：
     - 泰文和阿拉伯文：标题 1.35，正文 1.8；
     - 天城文：标题 1.3，正文 1.75；
     - 三者标题字距均为 0。
     - th 实测：390 宽下页高 12,941，SE 卡片在 320／375／390／1280 宽下分别是 510／452／431／339，均达标。
- **th 带出的待决事项**：
  1. SE 页脚店名（与 vi 同一个问题）：文档 04 给的是本地化名，研究 05 记录的店面名是 "SurfEnglish: Bilingual News"。
  2. L-8"荧光笔短语 ≤ 3 词"按空格数词，对泰文不起作用。记为校验器改进项，暂不改。
  3. App 侧问题，清单见 `th-qa.md` §6-7：
     - X11「ท้องถิ่น」；
     - engine 被译成"发动机"；
     - 同一手势有两种叫法；
     - App 的 en 源串也有两处错：`folder_name_label` 是 "Border"，`usage_section_title` 是 "Dashed Underline"。
- **hi 已接入**（3ddf9d4，lint 数据 189a224）：
  - OG 图：home-hi 64px × 2 行。
  - 状态：19 种语言、26 页，干净 HEAD 校验 CLEAN，测试 64/64。
  - 措辞处理：
    - 按 X10，App 的 "AI पढ़ाई" 不照抄。Local Read 的 "स्थानीय पढ़ाई" 有同样问题，按规则 ③ 一并改写。
    - nukta 统一用"基字 + U+093C"。
- **NFC 规范化**（f6a6d22）：校验器在匹配前把文本和数据规则都转成 NFC，预组合的 nukta 字母（U+0958–095F）和"基字 + U+093C"两种写法都能命中。
- **hi 带出的待决事项**：
  1. **OG 模板**：`ogCopy()` 不把印地语句号「।」当句末，荧光笔短语不会单独起行。hi 已改写 OG 标题绕开了。若改模板，所有 OG 图都要重新生成，暂不改，记为改进项。
  2. **其他确认项**：
     - FAQ 里一处 Hinglish "website translate"（文档 08 §7.7 允许）；
     - hi 用的是英文 App Store 徽章，但徽章 alt 写的是印地语，是否保留；
     - hi 的 appStoreSubtitle 没有资料。
  3. **App 侧问题**：共 10 处，清单见 `hi-qa.md` §6。例如：
     - "असदस्ताक्षरित" 不是一个词；
     - "संदर्भित अर्थ" 意思错了；
     - `search_or_enter` 译反了。
- **ar 已接入，20 种语言全部完成**（e8173b9，lint 数据 921a31d）：
  - OG 图：home-ar 64px × 2 行。
  - 状态：27 页；干净 HEAD 校验 CLEAN，测试 64/64。
  - CF 预览（921a31d）：verify-deploy 178 pass、契约 18 pass、CI 绿。
- **RTL 修复**（21a6d17）：
  - 在 RTL 文本里，Intl 输出的 "‏3.99 US$" 会显示成 "$US 3.99"，"iOS 18" 会显示成 "18 iOS"。现在 RTL 页面的价格、系统版本、SE 级别都用 LRI…PDI 隔离（08 §7.7：混排片段由模板包，文案里不放控制符）。
  - 所有语言的 "A1–C1" 都不再在破折号后断行。
  - SE 卡片的商店链接箭头在 RTL 下改为「←」。
  - 校验器把双向标记和隔离符也视为不可见字符。
  - 在 ar 页面上按渲染坐标逐项核对过。
- **价格断行**（0b6193a）：id 的 "US$3,99/bulan" 中间没有断点，320 宽下表格超出 6px。Plus 价格现在可以在斜杠后换行（只在 400 以下生效）。
- **全量版面矩阵**：20 种语言 × 12 个宽度（320–1440），价格表和整页都没有溢出，页眉没有重叠。
  - SE 卡片在 320／390／1280 宽下的最大高度是 558／472／412（pl／de／de），均在 560／480／420 以内。
  - 390 宽下首页高度：en 12,944，最低 zh-Hans 11,642，最高 ru 13,930。超过 13,000 的有 es、pt-BR、fr、de、it、nl、pl、ru、tr、uk、vi、id，共 12 种。
- **M3 翻译阶段结论**：
  - 20 种语言的首页文案、glossary、lint 词表、OG 图都已入库。
  - 每种语言都有 QA 记录（`ops/m3/<code>-qa.md`，含回译、Q1–Q10、没把握的措辞）。
  - T1 的 zh-Hant、ko 和部分 T3 语言做了第二模型互检。
  - 还剩：
    - 母语审校（M3-06／07／08）；
    - 待负责人决定的统一性问题（见下）；
    - 汇总给 App 侧的字符串问题清单。
- **M3 汇总的待决事项**：
  1. 指向只有英文的页面的链接要不要统一加"（英文）"标注。目前 es、ja、zh-Hans 没加，其余都加了。
  2. kicker 照用 App 原名时，有 10 种语言超过 24 的宽度上限（仅 warning）。
  3. 390 宽首页高度的软目标。
  4. SE 页脚店名：vi、th、ar 是用文档 04 的本地化名，还是各区店面实际显示的 "SurfEnglish: Bilingual News"。
  5. 各语言的 "AI" 写法，以及未核实的 appStoreSubtitle（这些页面不渲染该键）。
  6. 改进项，暂不改：
     - OG 模板不把「।」当句末；
     - L-8 的"荧光笔短语 ≤ 3 词"对泰文不起作用。
- **负责人裁定（2026-10-06，M3 汇总的四项）**：
  1. **链接标注**：指向只有英文的页面的链接统一加"（英文）"标注，已给 es、ja、zh-Hans 补上（76586de）。zh-Hans 的扩展页有中文版，那条链接不加。
  2. **kicker 上限**：由 24 放宽到 32 wu（ed353f1），照用 App 原名，原有的 11 条 L-8 warning 已消失。文档 08 §7.6 已同步。
  3. **手机页长**：en 首页仍是 ≤ 13,000px，其他语言改为 ≤ 同一构建 en 首页高度的 108%。文档 05（§6.2 说明与 A17）和文档 07 风险表已同步。当前 20 种语言全部达标：最高 ru 13,930，en 12,944，比值 1.076。
  4. **SE 页脚店名**：vi、th、ar 改用店面实际显示的 "SurfEnglish: Bilingual News"（5f2f999）。

## M4 进行中（2026-10-06）

- **M3-09 渲染巡检**：在 390 宽下检查了 ar、th、hi、ja、zh-Hant、ko 的首屏。
  - ar：页眉、链接箭头都已镜像；机身内保持 LTR，红条在左。
  - th／hi：系统字体正常，标题在词边界断行。
  - CJK：H1 在词组边界断行；ko 的 demo 两句之间有空格。
  - 未发现问题。
- **M4-02 Lighthouse（手机端，PSI 共享配额已用尽，经负责人同意改用本机 `npx lighthouse@13.5.0`）**：
  - 第一轮有 7 页低于 90（LCP 3.8–4.2s，LCP 元素是首屏 H1，"元素渲染延迟"约 2.3s）。
    - 对照实验（en 各 3 次，有 GA／屏蔽 GA）全部 100 分。判定为环境因素：第一轮赶上 CDN 冷缓存，机器负载也高。Lantern 会把 LCP 之前开始的请求（GA 175KB、两张懒加载截图）算进去。
  - 复测（每页 2 次）：9 页性能 100（zh-Hant 第二次 96／LCP 2.8s），LCP 1.0–1.5s，CLS ≤ 0.004，TBT ≤ 40ms。无障碍和最佳实践全部 100。SEO 去掉预览站必然失败的 is-crawlable 后也是 100。
  - 门禁脚本 `scripts/lighthouse.mjs`（1c23b73，`npm run lighthouse -- --preview <reports>`）。
- **M4-03（部分）**：Lighthouse 无障碍（axe 子集，亮色）9 页全部 100。暗色、VoiceOver、禁用 JS 的检查待做。
- **M4-04**：W3C Nu 每个模板抽 1 页，共 7 页，除 allowlist 的 content-language 一条外 0 error。首页只有 1 条 warning：demo 中模拟网页的 `<article>` 没有标题，暂不处理。Rich Results Test 与 Schema Validator 按 06 §11.2 在发布前人工跑。
- **M4-07**：`check:external` 17 个外部 URL 全部可达，0 失败。
- **M4-10**：DEPLOY.md 补了三节（f8a9246）：§11 GA 新旧对照（旧 `cta` ≈ 新 `pricing` + 新 `cta`、按主机名过滤）、§12 生产监控、§13 切换后的日历提醒。
- **M4-12**：每种语言一个 404 页（c9e8755）。本地模拟器实测 `/ja/nope`、`/ar/a/b/c`、`/zh-hans/chrome-extension/nope` 都返回对应语言的 404 页，状态码 404。
- **M4-13**：生产监控 `monitor.yml`（f8a9246）：每天 06:17 JST 检查首页 200 并跑契约测试。T0 时设仓库变量 `PROD_MONITOR=on` 才会定时运行。
- **M4-08（部分）**：
  - GSC（Browser 2 的账号）已有网域资源 word-by-word.app。新建网址前缀备份资源 https://www.word-by-word.app/，因为是网域资源所有者，验证自动完成。切换后补加 GA 验证作为第二种方式。
  - Bing：需要负责人登录并授权从 GSC 导入。
  - Naver：要等切换后在新站放 meta 才能验证。
- **M4-09（待 DNS）**：GitHub 账户级已验证域名 word-by-word.app 已添加。待在 Squarespace DNS 加 TXT：
  - 主机 `_github-pages-challenge-super-monster`
  - 值 `def634f343bf777830667d22878167`
  - 加好后在 github.com/settings/pages 点 Verify。
- **仓库密钥**：
  - `CLOUDFLARE_ACCOUNT_ID` 由 Claude 添加（账号 ID 不是凭据）。
  - `CLOUDFLARE_API_TOKEN` 由负责人创建并填写。按规则，令牌由负责人本人操作；Cloudflare 的创建页由 Claude 预填权限 Account › Cloudflare Pages › Edit。
  - deploy-manual 第一次运行因令牌无效失败（CF 9106），生产没有变化；负责人重建令牌后进行第二次运行。
- **M3-06**：负责人裁定 zh-Hant、ko 先上线，母语审校之后补（R36 兜底），审校重点见各自 QA 记录。
- **M0-04 更正：DNS 控制台是 GCP Cloud DNS，不是 Squarespace**（负责人告知，2026-10-06 在 Browser 2 核实）：
  - 域名在 GCP 购买，放在 **VirtualApiProject**（`virtualapiproject`）项目里，不在 WordByWord 项目（wordbyword-450603）。
  - 之前只查了 WordByWord 项目，再由 NS 为 `googledomains.com` 推断成了 Squarespace，这个推断是错的。
  - Cloud DNS 区域 `word-by-word-app`（公开，DNSSEC 开）。现有记录：
    - `api` CNAME ghs.googlehosted.com
    - `backend-test` CNAME ghs.googlehosted.com
    - `backend` A 34.53.32.27
    - `home` A 36.13.145.177
    - NS／SOA（Cloud DNS）
    - `www` CNAME super-monster.github.io.，TTL 5
  - Cloud Domains：word-by-word.app 活跃，自动续订开，2027-02-03 到期，隐私保护开。续费由该项目的结算账号支付。同项目的 virtualapi.io 已于 2025-05-21 过期，与本项目无关。
  - 已同步更正 DEPLOY.md、00 风险表、06 §10 判定段、07 运营表。T0 当天改 `www` CNAME 也在这个控制台操作。
- **M4-09 完成**：在 Cloud DNS 新增 TXT `_github-pages-challenge-super-monster.word-by-word.app.`（TTL 300），其他记录未动。权威 DNS 与 8.8.8.8／1.1.1.1 立即可解析，GitHub 显示 "word-by-word.app Verified"。
- **M4-06 公告演练完成**（main 上有 54 个未发布提交的场景）：
  1. 从 `cloudflare-deploy`（7c1bde1）切 `hotfix/notice-20261006`，只改 `src/notice.json`（开启，`updated` 改为 2026-10-06）。
  2. deploy-manual #2 用时 41s；运行结束后 1s 生产就出现公告。`/`、`/ja/`、`/privacy.html` 和 404 页都有公告；SE 卡片按 R35 不渲染；未发布的 `/ko/`、`/vi/` 仍是 404。
  3. 同一分支关闭公告，deploy-manual #3 用时 61s，公告立即消失，SE 卡片恢复。
  4. 收尾：`cloudflare-deploy` 快进到 ddb2a3b，hotfix 以 `--no-ff` 并回 main（37543b9）。
  - deploy-manual #1 因令牌无效失败，生产没有变化。
- **M4-05 GA4 事件核对**（Browser 2，媒体资源 538133762，数据流 word-by-word-top）：
  - 客户端：在预览站上逐个触发，包装 `gtag` 记录事件名和参数。都符合 06 §8.2：
    - `app_store_click` 4 处，label 分别为 header／hero／pricing／cta；
    - `section_anchor_click`；
    - `nav_click`（页眉）；
    - `language_switch`（header:ja，from_locale／to_locale = en→ja，R38）；
    - `surfenglish_promo`（card_site／card_appstore）；
    - `contact_email_click`、`button_click`（Pause）、`faq_toggle`（label = FAQ id）；
    - `surfenglish_promo_view`（card，在无头 Chrome 中验证；后台标签页的 IntersectionObserver 不触发）。
  - **问题与修复（9eab3b4）**：新页脚的链接列表放在 `<nav>` 里，页脚链接全被记成 `nav_click`，旧站是 `footer_link_click`。已把页脚判断移到 nav 判断之前，复测为 `footer_link_click`。
  - 服务器端：实时报告收到上述事件，`app_store_click` 计为关键事件。DebugView 未出现调试事件（`gtag('set',{debug_mode})` 无效，改用 `config` 后也没有出现），以实时报告为准。
  - 增强型衡量：网页浏览、滚动、出站点击，另有 4 项，都已开启。出站点击会另记 `click` 事件，与自定义事件名不同，不会在同一指标里重复计数；旧站设置相同，为保持基线可比，**维持现状**（负责人可要求关闭）。
  - 数据污染：Lighthouse 与事件核对在预览站产生了约 26 个会话（主机名 main.wordbyword-web.pages.dev），报表按主机名过滤即可（DEPLOY.md §11）。
- **Bing**：负责人已完成登录与从 GSC 导入，Bing 提示需要 48 小时处理。
- **Naver**：
  - 负责人在 searchadvisor.naver.com 添加站点，选 HTML 태그，把 content 值发给 Claude；
  - Claude 写入 `SITE.verification.naver`（layout 已支持输出该 meta），随切换上线；
  - T0 之后点验证并提交 sitemap。
- **PR-SE-1 说明**：SE 仓库分支 `wbw-family-pr1`，4 个提交、18 个文件（+143／−35），未合并。
  - 内容：共享 Person（Jinlong）、页脚 "More from the maker"、about 页加 "Also by Jinlong"、SE 标题与关键词限定为英语、对应的 lint。
  - 待负责人审阅预览站 https://wbw-family-pr1.surfenglishwebsite.pages.dev/ 后，在 T0 前合并上线（R51）。
- **PR-SE-1 已合并上线（M3-10，负责人确认后，2026-10-06 23:47）**：
  - SE 仓库：`main` 由 7c464b6 快进到 733b1d9；`cloudflare-deploy` 由 2899a57 快进到 733b1d9；CF 自动构建，23:49 生效。
  - 顺带上线的 7c464b6（负责人 9-18 的宣传视频工具 `promo/`）：分别构建生产版与 main，dist 逐字节一致，对网站没有影响。
  - 线上核对（surfenglish.app）：
    - 页脚 "More from the maker" 链接 https://www.word-by-word.app/，旧站新站都可用；
    - about 页有 "Also by Jinlong: WordByWord"；
    - 无 X-Robots-Tag，抽查页面都是 200。
  - Person JSON-LD 与 WBW 新站逐字一致（R17）：@id https://surfenglish.app/about/#maker，name Jinlong，alternateName Chi Jinlong，sameAs 为 x.com/JinlongDev 与 App Store 开发者页。
  - 后续：PR-SE-2 在 T+7d 内完成，把 SE 页脚链接换成 WBW 对应语言页（R51）。
- **M4-03 完成**：
  - axe-core 4.14（取自已获准下载的 lighthouse 缓存）在无头 Chrome 中运行，范围是 WCAG 2.1 A/AA + best-practice，亮色与暗色、390 与 1280 宽。
    - 修复前有 2 条 best-practice：首页截图滚动区是与所在 section 同名的第二个 region 地标（landmark-unique）；about 表格左上角是空的 `th`（empty-table-header）。
    - 修复（f38b01d）：滚动区改为带名称的 `role="group"`，仍可用键盘聚焦滚动；空表头改为 `td`。
  - 暗色模式没有对比度问题。
  - 禁用 JS 的 en 首页分段截图：全部内容可读。demo 显示静态画面；FAQ、页眉菜单、语言切换都是原生 `<details>`，不依赖 JS。
  - VoiceOver 实机检查留给负责人，可选。
- **Naver**：负责人决定以后再做。

## M5 切换完成（T0 = 2026-10-06 23:57:15 JST，负责人决定提前切换）

- **决策**：负责人在 M4 汇总时选择"现在就开始切换"（原窗口 11/17–11/26 13:00–16:00 JST；午夜同为低流量时段，DNS 回滚只需秒级）。zh-Hans、ja 终校改为上线后补。
- **预检**（压缩 T-7／T-1）：
  1. 生产发布 `cloudflare-deploy` ddb2a3b → f38b01d，对 pages.dev 跑 verify-deploy：177 pass、0 fail、1 skip（生产无提交标记）；契约 18 pass。
  2. 旧站冻结复核 FREEZE OK：与 M0 before.txt 逐项一致。
  3. GitHub Pages 证书 notAfter 2026-12-23 07:32:53 GMT，距 T0 约 77 天，≥ 21 天，即 DNS 回滚截止日。
  4. www CNAME TTL 5；NS、DS 无变化。
- **T0 执行**：
  1. CF `wordbyword-web` 添加自定义域 www.word-by-word.app，选"我的 DNS 提供商"，CNAME 方式，未迁 NS。
  2. Cloud DNS（VirtualApiProject）只改 www：`super-monster.github.io.` → `wordbyword-web.pages.dev.`，TTL 5，其他记录未动。23:57:15 权威 DNS 与 8.8.8.8／1.1.1.1 都返回新目标。
  3. 23:58:56 https://www.word-by-word.app/ 返回 200，server: cloudflare，新证书 Let's Encrypt YE1（到 2027-01-04）。TLS 空窗约 1 分 41 秒。CF 状态显示"活动 / SSL 已启用"。
  4. 正式域名：契约测试 18 pass／0 fail，verify-deploy --prod 179 pass／0 fail／1 skip。中止条件均未触发。
  5. 抽查：
     - 旧 `/<xx>-top.html` 一跳 301 到 `/<xx>/`；
     - `/index.html`、`/en-top.html` 跳到 `/`；`/zh/` 跳到 `/zh-hans/`；
     - 契约 URL 都是 200，`/nope` 是 404；
     - 生产没有 X-Robots-Tag，有 HSTS，HTML 为 max-age=0。
  6. `SITE.legacySitemap = true` 并发布（bc24e63）：sitemap-legacy.xml 43 个旧 URL，sitemap.xml 23 个 URL。
     - 失误：这次推送前的干净校验报了 FAILED，推送仍被执行，原因是管道末尾的 tail 吞掉了退出码。失败的只是一条测试夹具，假设旧站点地图默认关闭；网站构建与检查都是 0 error，生产不受影响。已修测试（099dbb0），推送改用 `if verify; then push; fi`。
  7. 生产 `cloudflare-deploy` 与 main 对齐到 099dbb0。仓库变量 `PROD_MONITOR=on`，monitor 每天 06:17 JST 运行。
  8. 搜索引擎：
     - IndexNow：push 触发的 #4 已提交生产 sitemap；手动勾选 legacy 的首推（run 37484441083）submit 成功。
     - GSC（网域资源）：提交 sitemap.xml 与 sitemap-legacy.xml，初始状态"无法抓取"属于刚提交时的常态；以 Googlebot UA 实测两者都是 200 application/xml，robots 允许。
     - URL 检查后已请求编入索引：`/`（原已收录旧版）、`/zh-hans/`、`/ja/`、`/zh-hant/`、`/ko/`、`/es/`。
     - Bing：已从 GSC 导入，48 小时处理。Naver 延后。
  9. GA 实时报告出现新站标题的 page_view。GA 注释和 iPhone 内的链接实测待负责人做。
- **后续**（DEPLOY.md §13 日历）：
  - T+1h／T+1d 复跑 verify-deploy --prod，看 CF 的 4xx／5xx；
  - T+7d 内做 PR-SE-2（SE 页脚链接换成 WBW 各语言页）；
  - `sitemap-legacy.xml` 最迟 2026-11-17 撤下；
  - GitHub Pages 在 2026-11-04～12-16 之间下线，必须早于回滚截止 2026-12-23 16:32 JST；
  - zh-Hans、ja、zh-Hant、ko 及 T2／T3 的母语补审。
- **T0 第 5 步（负责人 iPhone 实测）通过**：WBW App 设置 → 隐私政策、订阅页的隐私链接、App Store 页面的 Marketing／Support／Privacy 三个链接都正常（2026-10-07 负责人确认）。
- **切换后复查（2026-10-07 00:21，约 T+25min）**：正式域名契约测试 18 pass，verify-deploy --prod 179 pass／0 fail。GSC 两个 sitemap 仍是"无法抓取"，"上次读取时间"为空，即 Google 尚未读取，属刚提交时的常态；T+1d 复查时若仍未读取再排查。
- **T+1d 定时检查**：已创建一次性定时任务 `wbw-t1d-check`，2026-10-07 15:07 JST 运行。只读：验收脚本、GSC、品牌词排名、GA、CF、PR-SE-2 就绪情况，中文汇报。应用未开着时，会在下次启动时运行。
- 收尾：本地 Cloudflare 模拟服务器（serve.mjs :4580）已停止，没有残留的测速、axe 或截图进程。
- **GSC 站点地图"无法抓取"排查（2026-10-07 00:27，负责人提问）**：
  - 两个 sitemap 的"上次读取时间"为空，"已发现的网页"为 0，即 Google 尚未处理，不是抓取失败。
  - 验证：
    1. dns.google 解析 www → wordbyword-web.pages.dev（TTL 5）；
    2. 以 Googlebot UA 请求：HTTP/2 200，application/xml，无 X-Robots-Tag，无 BOM，XML 完整，23 个 URL；
    3. GSC 网址检查对 sitemap.xml 做实时测试：用户代理"Google 检查工具智能手机版"，允许抓取，网页抓取成功。
  - 结论：Google 能正常读取，新提交的站点地图在首次处理前会一直显示"无法抓取"，通常几小时到几天内更新，无需处理。T+1d 定时检查会复看；超过约 3 天仍未读取，再删除后重新提交。
- **StylioStudio 网域资源（2026-10-07 00:35，负责人要求，不属于 WBW 改版）**：
  - 原因：styliostudio.app 在 GSC 里只有网址前缀资源 `https://styliostudio.app/`，所以资源列表下没有"网域资源"。网址前缀资源只统计这一个前缀下的网址；网域资源覆盖 http／https 和所有子域名。
  - 操作：
    1. GSC 新增 `sc-domain:styliostudio.app`，提供商选"任何 DNS 提供商"，不走 Cloudflare 授权。
    2. 在 Cloudflare 的 styliostudio.app 区域 apex 加一条 TXT（`google-site-verification=ncYa…HSU`，TTL 自动），其他记录都没动。
    3. 权威 NS、1.1.1.1、8.8.8.8 都已能查到这条 TXT，GSC 已自动完成验证。
  - 注意：
    - 这条 TXT 必须长期保留，删掉就会失去验证。
    - 历史数据仍在网址前缀资源里，两个资源并存，旧资源不删；新资源约 1 天后开始有数据。
    - sitemap 不必在新资源重复提交，robots.txt 已经声明了 sitemap。
  - 顺带发现：有一个原型子域名可以公开访问且没有 noindex。网址检查显示 Google 目前还不知道这个网址，没有收录。已告知负责人，没有改动。
- **GA4 事件数据保留期（2026-10-07，负责人确认）**：WordByWord-Web 的事件数据保留期从默认的 2 个月改为 14 个月；用户数据原本就是 14 个月。24 小时内生效，不回溯。原因：探索报告只能回看保留期内的事件，保留 2 个月的话，改版前的对比数据每天都会被删掉一部分。
- **SE 官网接入 GA 的计划（2026-10-07）**：设计文档放在 SE 官网仓库的 `docs/website-analytics-design-v0.1.md`。
  - SE 官网另建网站媒体资源，与 WordByWord-Web 并列。
  - 涉及 WBW 的改动有两项（该文档 M5，发布前需负责人批准）：
    1. 用浏览器标记 `?internal=on` 排除内部流量。WordByWord-Web 加 Internal Traffic 过滤器，测试工具打开页面时带上这个参数。
    2. 拿到 App Store provider token 后填 `SITE.pt`（D-11、H3）。两个 App 在同一开发者账号下，共用一个 pt。
  - 这次不做：WBW 不关联 Search Console；`consentMode` 维持 'off'，H6 仍未决。
