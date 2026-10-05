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
