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
- 详见 `ops/m0/gsc-baseline-2026-10-05.md`。H2（GA4 基线）待做。
