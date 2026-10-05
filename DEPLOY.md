# 部署与上线手册（www.word-by-word.app）

> 面向仓库所有者的操作手册，只写"怎么做"。规格与理由以设计文档为准：分支 `design-docs` 的 `docs/redesign-2026/`。
> 引用写法：「06 §10.2」= `06-技术架构与工程方案.md` 第 10.2 节；「07 §6」= `07-实施计划与风险.md`；「03 §6.3」= `03-SEO与关键词策略.md`；
> 「R23」等 = `appendix/research/12-rulings.md` 的裁定。文档与本文冲突时以文档（及裁定）为准，并回头修正本文。

## 1. 一览

- 构建：`node build.mjs` → `dist/`，零依赖，Node ≥ 22。任一构建闸门报 error 即非 0 退出 → Cloudflare 不部署，生产保持上一版。
- 托管：Cloudflare Pages 项目 `wordbyword-web`（与 SurfEnglish 同一 CF 账号），Git 集成连接 `super-monster/wordbyword-web`。
- T0（DNS 切换）之前，`www.word-by-word.app` 仍由 GitHub Pages 从冻结分支 `legacy-pages` 提供；新站生产部署只出现在
  `https://wordbyword-web.pages.dev`（`_headers` 对 pages.dev 输出 `X-Robots-Tag: noindex`）。
- GitHub Actions（`.github/workflows/`）：

| workflow | 触发 | 作用 | 需要的 secret |
|---|---|---|---|
| `check.yml` | 任意分支 push（`legacy-pages`、`design-docs` 除外）与 PR | Node 22 / 24 双版本跑 `node build.mjs`；`scripts/check.mjs` 存在时一并运行。只体检，不部署 | 无 |
| `deploy-manual.yml` | 手动（workflow_dispatch，输入 `ref`） | wrangler 直接部署到生产：备份通道 + 应急公告通道（§6） | `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` |
| `indexnow.yml` | push 到 `cloudflare-deploy`；手动 | 等 180 秒后运行 `scripts/indexnow.mjs`，把生产 sitemap 的全部 URL 推送给 IndexNow（03 §6.3） | 无 |

## 2. 分支模型（06 §1.2）

| 分支 | 用途 | 谁构建 | 约束 |
|---|---|---|---|
| `main` | 日常开发 | CF preview（`main.wordbyword-web.pages.dev`）+ `check.yml` | 合并前本地 `npm run build`（之后为 `npm run check`）通过 |
| `feat/*` 等 | 较大改动 | CF preview（`<branch>.wordbyword-web.pages.dev`）+ `check.yml` | — |
| `cloudflare-deploy` | **生产**：`git push origin main:cloudflare-deploy` | CF production | 只允许快进；分支规则集保护（§4）；由所有者本人推送 |
| `hotfix/notice-<YYYYMMDD>` | 应急公告专用：从 `cloudflare-deploy` 拉出，只改 `src/notice.json`（R57） | CF preview + `deploy-manual.yml` 部署到生产 | 部署后快进合入 `cloudflare-deploy`，再合回 `main`（§6） |
| `legacy-pages` | 冻结的旧站（= `7a389ba`），GitHub Pages 发布源与 DNS 回滚目标 | 只有 GitHub Pages；CF preview 排除 | **禁止推送**（规则集 `freeze-legacy-pages`，§10）；下线后转 tag（§9） |
| `design-docs` | 设计文档（孤立分支，无 `build.mjs`） | 不构建；CF preview 排除 | 不合并进 `main` |

远端还留有旧开发分支 `dev`（没有 `build.mjs`）：不要再向它推送（会让 CI 与 CF preview 构建失败），方便时删除。

## 3. Cloudflare Pages 项目设置（06 §10.1）

| 项 | 值 |
|---|---|
| 项目名 | `wordbyword-web`（= `src/site.mjs` 的 `SITE.pagesProject`；若被占用须两处同改） |
| Git 仓库 | `super-monster/wordbyword-web`（先在 GitHub 的 Cloudflare App 授权中加入本仓库） |
| Production branch | `cloudflare-deploy`（**创建项目前**该分支必须已存在，ENG-17） |
| Preview branches | Custom branches：Include `*`；Exclude `legacy-pages`、`design-docs` |
| Framework preset / Root directory | None / 留空（仓库根） |
| Build command / Build output directory | `node build.mjs` / `dist` |
| 环境变量 | `NODE_VERSION=24`，Production 与 Preview **都要设**（仓库 `.node-version` 也是 24；构建镜像不支持 24 时退到 22） |
| Custom domain | **不要提前添加**。只在 T0 当天添加 `www.word-by-word.app`（§7 T0 第 1 步） |

创建顺序（07 M1-02）：
1. 所有者执行 `git push origin main:cloudflare-deploy`，在仓库里建出生产分支。
2. CF 控制台 → Workers & Pages → 创建 Pages 项目 → 连接 Git → 选本仓库，按上表填写，保存并开始首个部署。
3. 项目 Settings → Builds：确认 Branch control（生产分支、Preview 的 Include/Exclude）；Variables：两个环境都加 `NODE_VERSION=24`。
4. 验收：`https://wordbyword-web.pages.dev/` 与 `https://main.wordbyword-web.pages.dev/` 可访问，响应头带 `x-robots-tag: noindex`。

## 4. 一次性设置（所有者手动）

1. **GitHub Secrets**（Settings → Secrets and variables → Actions → New repository secret），只有 `deploy-manual.yml` 使用：
   - `CLOUDFLARE_API_TOKEN`：CF → My Profile → API Tokens → Create Token → Custom token，权限 **Account · Cloudflare Pages · Edit**，
     Account Resources 只包含本账号。令牌只存进 GitHub，不写进任何文件（H9）。
   - `CLOUDFLARE_ACCOUNT_ID`：CF 控制台 Account home 显示的 Account ID（也是 `dash.cloudflare.com/<account-id>` 中的那段）。
   - 缺任何一个，`deploy-manual` 会在第二步报错退出。
2. **保护 `cloudflare-deploy`**：Settings → Rules → Rulesets → New branch ruleset（例如 `protect-cloudflare-deploy`，Active），
   目标 `cloudflare-deploy`，勾选 Restrict deletions、Block force pushes。可选：Require status checks →
   `check (node 22)`、`check (node 24)`。开启后任何提交都必须先在别的分支（main 或 hotfix/*）通过 CI 才能推到生产，
   紧急 revert 也要先推到 hotfix 分支等 CI 变绿（约 1 分钟）。
3. **IndexNow key**（M4，06 §10.2 第 5 步）：`openssl rand -hex 16` 生成 32 位 key（协议允许 8–128 位 `A-Z a-z 0-9 -`），写入
   `SITE.indexNowKey`；构建需随之输出 `dist/<key>.txt`（06 §3.4，首次配置前确认 `build.mjs` 已实现）。key 是公开的，不是 secret。
   发布后本地可先预演：`node build.mjs && node scripts/indexnow.mjs --dry-run --sitemap-file dist/sitemap.xml`。

## 5. 日常发布

1. 发布前：`main` 的 `check` 两个 Job 都是绿色；`https://main.wordbyword-web.pages.dev/` 目视正常；
   M4 起再对 preview 跑 `bash scripts/verify-deploy.sh <preview> --preview`（06 §11.4）。
2. 发布（所有者本人执行，只快进，禁止 `--force`）：

   ```bash
   git push origin main:cloudflare-deploy
   ```

3. 发布后：CF 自动构建并部署生产（约 1–2 分钟；构建失败则生产不变，看 CF 构建日志）。CF → Deployments 中确认生产部署对应该提交。
   T0 前在 `https://wordbyword-web.pages.dev/` 验证，T0 后在 `https://www.word-by-word.app/` 验证。
4. `indexnow.yml` 随后自动运行：key 未配置、或 www 仍在 GitHub Pages（T0 前）时自动跳过并保持绿色；结果写在该次运行的 Summary 中。
5. 内容有问题：CF → Deployments → 选上一个生产部署 → Rollback（秒级）；再在 `main` 上 revert 或修复后重新发布。

## 6. 应急公告（R57；06 §8.5、07 §6.8）

**不得从 `main` 部署到生产**：main 上可能有未审校的译文或半成品。公告改动一律从生产分支出发。全程可在手机上的 GitHub 网页完成。

1. GitHub 网页 → 分支下拉框 → 输入 `hotfix/notice-<YYYYMMDD>` → 选择 **from `cloudflare-deploy`** 创建（不要从 main 创建）。
2. 在该分支上编辑 `src/notice.json`：`"enabled": true`，更新 `"updated"`，按需修改 `copy`；直接提交到这个 hotfix 分支。
3. Actions → `deploy-manual` → Run workflow（Use workflow from 保持 `main`）→ `ref` 填 `hotfix/notice-<YYYYMMDD>` → Run。
   workflow 先做三道守卫，任一不满足即中止并写明原因：分支名只能是 `cloudflare-deploy` 或 `hotfix/*`；分支必须基于
   **当前**生产提交（`git merge-base` = `origin/cloudflare-deploy`）；hotfix 相对生产只允许改动 `src/notice.json`。
   之后以完整历史构建（sitemap lastmod 不丢失）并用 wrangler 部署到生产，约 1–2 分钟；HTML 为 `max-age=0`，部署后立即生效。
4. 线上确认：所有页面顶部出现公告；SE 卡片（落点 ①）不渲染，其余落点不变（R35）。
5. 当天收尾，否则下一次正常发布会冲掉公告：

   ```bash
   git fetch origin
   git push origin origin/hotfix/notice-<YYYYMMDD>:cloudflare-deploy     # 快进生产分支（CF 会以相同内容再构建一次）
   git switch main && git pull --ff-only && git merge --no-ff origin/hotfix/notice-<YYYYMMDD> && git push origin main
   ```

6. 关闭公告：同样流程，新建 `hotfix/notice-<YYYYMMDD>-off`，把 `enabled` 改回 `false`。
- 备用通道（GitHub Actions 不可用时，本地执行；同样只从 hotfix 分支或 `cloudflare-deploy` 构建，事后同样做第 5 步）：

  ```bash
  git fetch origin && git switch -C hotfix/notice-<YYYYMMDD> origin/hotfix/notice-<YYYYMMDD>
  node build.mjs && npx --yes wrangler pages deploy dist --project-name=wordbyword-web --branch=cloudflare-deploy
  ```

- 非公告的生产问题不走这条路：内容回退用 CF Rollback（§5 第 5 步）；代码修复走 `main` → 发布。
  `deploy-manual` 输入 `cloudflare-deploy` 只是把当前生产原样重新部署（CF Git 集成故障时的备份通道）。
- 演练（07 M4-06、06 A13）：在 main 上有未发布提交时跑一遍开启与关闭，确认生产上没有出现这些提交的内容。

## 7. 切换 Runbook 摘要（细节以 07 §6、06 §10.2 为准）

T0 目标窗口 2026-11-17 ～ 11-26（预期 11-25），避开 12-18 ～ 01-04（R23）。以下记录在执行时填写：

| 记录项 | 值 | 依据 |
|---|---|---|
| DNS 控制台（Squarespace Domains 或 GCP Cloud DNS：能看到 `api.`、`backend-test.`、`backend.` 三条记录的那一个） | ＿＿＿＿ | 06 §10.1、M0-04 |
| T0 日期与时段（GA 低谷） | ＿＿＿＿ | 07 §6.4 |
| T-1 实测 GitHub Pages 证书 notAfter | ＿＿＿＿ | 06 §10.2 第 6 步 |
| **DNS 回滚截止 = 上一行的 notAfter** | ＿＿＿＿ | R23 |
| GitHub Pages 下线日（≥ T+4 周，且早于回滚截止） | ＿＿＿＿ | §9 |
| 撤下 `sitemap-legacy.xml`（GSC 全部"已重定向"或满 6 周，先到者为准） | ＿＿＿＿ | 06 §10.2 第 15 步 |

- **T-7**：内容冻结，此后只修 bug；发布到 `cloudflare-deploy`，对 `https://wordbyword-web.pages.dev` 跑 `verify-deploy --preview` 无 FAIL；
  截图 GitHub Pages 设置；重新导出 GSC 与 GA 数据；重跑冻结复核（§10）无差异；回滚剧本（§8）存到手机。
- **T-1**：记录证书 notAfter，填入上表：

  ```bash
  echo | openssl s_client -connect www.word-by-word.app:443 -servername www.word-by-word.app 2>/dev/null | openssl x509 -noout -dates
  ```

  notAfter − T0 < 21 天时不切换：推迟到 GitHub 续签（notBefore 变化）之后，或按 07 §4.3 做双托管热备。
  另外：`dig www.word-by-word.app CNAME @ns-cloud-c1.googledomains.com` 确认 TTL 仍为 5、NS 与 DS 无变化；重跑冻结复核；
  CF 生产部署是预期提交且 `notice.enabled=false`；CF、DNS 控制台、GSC、GitHub、GA 均能登录；备好装有 WBW 1.2.2 的 iPhone。
- **T0**（约 45 分钟）：
  1. CF → `wordbyword-web` → Custom domains → 添加 `www.word-by-word.app`，状态 Pending。**必须先做这一步，否则会 522。**
  2. DNS 控制台只改 `www` 这一条记录，TTL 保持 5（不超过 300）：

     ```
     www  CNAME  super-monster.github.io.   →   www  CNAME  wordbyword-web.pages.dev.
     ```

     **不要动**：NS、DS/DNSSEC、`api.`、`backend-test.`、`backend.` 及其它任何记录。
  3. 观察：`dig +short www.word-by-word.app CNAME @ns-cloud-c1.googledomains.com` 返回 `wordbyword-web.pages.dev.`；
     CF 显示 Active；`curl -sI https://www.word-by-word.app/ | grep -i '^server'` 为 `cloudflare`。
  4. `bash scripts/contract-test.sh https://www.word-by-word.app --prod` 与 `bash scripts/verify-deploy.sh https://www.word-by-word.app --prod`：0 FAIL。
  5. iPhone：WBW → 设置 → 隐私政策；订阅页的隐私链接；App Store 页面上的 Marketing、Support、Privacy 三个链接。
  6. GA 实时报告有新路径的 page_view（带 `content_group`）；加 GA 注释（新旧 `page_path` 对照见 06 §8.4，`#cta` → `#pricing`，R12）。
  7. `SITE.legacySitemap = true` 并发布；GSC 提交 `sitemap.xml` 与 `sitemap-legacy.xml`，URL 检查 `/`、5 个 T1 首页、`/privacy.html`、`/ja-top.html`；
     提交 Bing；Actions → `indexnow` → Run workflow，勾选 **legacy**（IndexNow 首推 = 生产 sitemap + 全部旧 URL）；提交 Naver。记录各平台返回值。
  - **中止条件**（任一满足即执行 §8 的 DNS 回滚）：CNAME 修改 30 分钟后证书仍未 Active；任一契约 URL（`/privacy.html`、`/support.html`、
    `/chrome-extension/privacy.html`）不是 200（C-2 时不是单跳 308）；出现 5xx；首页空白或 404。只是内容问题时用 CF Rollback。
- **T+1h**：再跑 `verify-deploy --prod`；CF Analytics 看 4xx/5xx 比例；iOS Safari 看 Smart App Banner；用蜂窝网络访问一次。契约 URL 间歇失败 → 先修 `_redirects`，修不好回滚 DNS。
- **T+1d**：GSC 中 sitemap 已读取、URL 检查结果、抓取统计无 5xx 激增；GA 的 page_view 与上周同日相比，`surfenglish_promo`、`language_switch` 有数据；
  CF 404 路径 Top 列表中有价值的旧路径补 301（同步写进文档 02 §5.2 夹具）；12 个 `/<path>/` 返回 200 后合并 PR-SE-2（最迟 T+7d，R51）。
- **T+7d**：`wordbyword` 7 日均排名（连续 7 天 > 3.0 → 按 07 RK01 处理）；"已重定向"计数；Bing、Naver 收录；PR-SE-2 已合并。此后只修配置，不回滚 URL 结构。

## 8. 回滚（06 §10.4）

| 场景 | 动作 | 耗时 | 期限 |
|---|---|---|---|
| 新版内容或样式有问题 | CF → Deployments → 上一个生产部署 → Rollback；或 revert 后重新发布 | 秒级 / 约 1 分钟 | 无 |
| CF 平台或证书出问题 | DNS 控制台把 `www` 的 CNAME 改回 `super-monster.github.io.` | 秒级（TTL 5） | **T0 当时 GitHub Pages 证书的 notAfter**（§7 表，R23）；前提：`legacy-pages` 仍是 Pages 发布源、Pages 自定义域名仍保留 |
| 截止日之后仍要回到 GitHub | 改回 CNAME，等 GitHub 重新签发证书 | 几分钟到数小时，期间 TLS 报错 | 最后手段 |
| SEO 明显下滑 | **不回滚 URL 结构**；先查 canonical、hreflang、跳转链、noindex | — | — |

DNS 回滚后 `/ja/` 等新 URL 在 GitHub 上是 404，属预期：回滚只是短期止血，旧 URL 都正常。

## 9. GitHub Pages 下线（06 §10.2 第 16 步；T+4 周之后、回滚截止日之前）

前提：GitHub 账户级域名验证 `word-by-word.app` 已是 Verified（M4-09，在 DNS 控制台加 `_github-pages-challenge-super-monster…` TXT，切换前完成）。
顺序**不能反**：

1. 确认 `www` 已指向 CF 至少 4 周，且不再需要回滚。
2. GitHub → Settings → Pages：**先**移除 Custom domain，**再** Unpublish（或 Source 改为 None）。
3. 把 `legacy-pages` 转成 tag 并删除分支。规则集 `freeze-legacy-pages`（id 24509431）禁止删除，须先在 Settings → Rules → Rulesets 停用或删除它：

   ```bash
   git fetch origin legacy-pages
   git tag -a legacy-site-2026-08-23 origin/legacy-pages -m "Legacy site served by GitHub Pages until the Cloudflare cutover"
   git push origin legacy-site-2026-08-23 && git push origin --delete legacy-pages
   ```

4. 确认 DNS 中已没有任何指向 `github.io` 的记录；同步更新 README 与本文的分支表。
- 禁止：DNS 仍指向 GitHub 时移除 Pages 自定义域名；CNAME 仍指向 `wordbyword-web.pages.dev` 时删除 CF 项目（子域接管风险，研究 09 §5.7）。

## 10. 旧站冻结：证据与复核（R29、R56）

- 现状（2026-10-05 起）：GitHub Pages 发布源 = `legacy-pages` / `(root)`（= `7a389ba`），已勾选 Enforce HTTPS；规则集 `freeze-legacy-pages`
  （id 24509431，Active，无绕过名单）：Restrict updates、Restrict deletions、Block force pushes。
- 证据（`design-docs` 分支 `docs/redesign-2026/ops/`）：`decision-log.md` 的「M0-02 冻结旧站执行记录」（含 Pages 构建 run 37324398657）；
  `m0/before.txt`（2026-10-05T14:17:02Z）、`m0/after.txt`（14:25:34Z）、`m0/after-main-push.txt`（main 重建推送后），三份内容一致。
- 复核（T-7、T-1、Go/No-Go 时各跑一次；按 R56 只比状态码、字节数与响应体 md5，Last-Modified/ETag 变化属正常）：

  ```bash
  B=https://www.word-by-word.app
  CT=()   # T0 之后改为 CT=(--connect-to ::super-monster.github.io:)，绕过 DNS 直连 GitHub Pages 检查回滚目标
  for p in / /ja-top.html /privacy.html /support.html /chrome-extension/privacy.html; do
    printf '%s %s ' "$p" "$(curl -s "${CT[@]}" -o /tmp/wbw-body -w '%{http_code} %{size_download}' "$B$p")"; md5 -q /tmp/wbw-body
  done > legacy-check.txt
  git fetch -q origin design-docs
  diff <(git show origin/design-docs:docs/redesign-2026/ops/m0/before.txt) legacy-check.txt && echo "FREEZE OK"
  ```

  有差异 → 暂停切换，先查 `legacy-pages` 与 Pages 设置（07 RK05）。
