# WordByWord 官网重构 · 00 总览（入口）

| 项 | 内容 |
|---|---|
| 适用范围 | 设计文档集 v1.1：`01`–`08`、`prototype/`、`appendix/` |
| 日期 | 2026-10-05 |
| 读者 | 开发者本人；后续执行实现的人或 AI 会话 |
| 优先级 | 裁定 `12-rulings.md` > 基线 `11-design-baseline.md` > 各文档正文；事实以研究 10 §4（F1–F36）为准 |
| 入库策略 | 与全套文档相同：H10 决定前**不提交到公开仓库**（§7） |

本文只做导航和摘要，不新增决策；与其它文档不一致时，以裁定和对应文档为准。

---

## 1. 一页纸结论

### 1.1 目标：用户的四项诉求

（归纳自文档 01 §0、§3，文档 03 §1.2，R39）

1. **英语以外的关键词几乎不命中**：让 19 种非英语页面被发现、被收录、能排上名。
2. **按最新 SEO 做法，用更核心的关键词介绍各项功能**（用户原话见文档 03 §1.2）。
3. **去掉"千篇一律的 AI 模板站"观感**，换成属于 WordByWord 自己的视觉。
4. **优雅地推荐兄弟应用 SurfEnglish，WBW 官网的身份与定位不变**（R39）。

### 1.2 现状根因（三句话）

1. 架构是首因：20 个非英语文件在站内没有入链，也没有 sitemap、hreflang、canonical，GitHub Pages 又做不了 301，搜索引擎基本看不到这些页面；其次才是 title/H1 全是泛词、全站 "iPhone" 出现 0 次（F3、F4、F30）。
2. 没有品牌系统，也没有单一事实源：22 份落地页 HTML 全靠手抄，品牌红 #CC3355 没用上，主视觉是 AI 插画和同一张 VOA 截图，另有 60 处破图，至少 10 处文案与产品事实相反（F8、F11、F32）。
3. SE 推广靠 JS 外挂：固定顶部条加 hero 后的整屏卡片，导致主次倒置、不分受众（中国大陆下载不了）、爬虫看不到、下载无法归因（F10）。

### 1.3 方案要点

| 方面 | 要点 | 详见 |
|---|---|---|
| 架构 / 托管 | 在同一仓库内重建零依赖生成器（沿用 SE 的 `build.mjs` 思路，Node 24）：`src/locales/*.json` + 模板 → `dist/` → Cloudflare Pages。只把 `www` 的 CNAME 改指 CF，不迁 NS，不动 `api.`、`backend*`，apex 不处理（U1）。构建本身就是闸门：38 项校验，任何 error 都会阻断部署。旧 URL 单跳 301（`_redirects` 默认 67 条静态、7 条动态）；`/privacy.html` 等契约 URL 在原地址直接返回 200 | 文档 06、02 |
| 信息架构 | 英文首页 `/` 的 URL 不变（守住品牌词），另有 19 个 `/<locale>/`、`/about/`、扩展页（en + zh-Hans，S0/S1 两态）、契约页和 en 404；每页自引用 canonical，首页簇 22 条 hreflang；sitemap 23 条（S0）或 26 条（S1） | 文档 02 |
| SEO 与关键词 | 定位为"用真实网页学外语的阅读助手"（R39）。首页主词取产品/品类意图（en 为 "Bilingual Web Page Translator App for iPhone"），how-to 类查询只归 Phase 2 指南 G1（R46）。一个功能一个主词（K1–K10），"关键词 → URL"唯一映射由 seoLint 断言；"学英语、英语新闻、分级、语块"归 SE。JSON-LD 与 SE 共用 Person `@id`。Phase 2 写 4 篇指南，不做程序化批量页 | 文档 03、08 |
| SurfEnglish 推荐 | 叙事为"互补、也值得一试"，禁止"可能更适合你"一类替换性措辞（R40）。全部是构建期静态 HTML。落点：① 卡片（价格区后、FAQ 前）、② FAQ 一问、④ 页脚、⑤ about、⑥ SE 官网反链；zh-Hans 页只保留 ②④⑤（R42）。卡片高度桌面 ≤ 420px、手机 ≤ 480px，只用文字链接、不用黑色徽章，H2 以 SurfEnglish 开头；WBW 的徽章和最终 CTA 优先（R43） | 文档 04 |
| 视觉 | 方向为"纸与墨 · 阅读批注"：暖纸白、墨黑加品牌红 #CC3355。母题全部取自 App（3px 红色译文条、荧光笔、语块下划线、速度线、马赛克），只用在与 App 内同义的地方。hero 是可本地化、可被索引的 HTML/CSS 实时双语样张。不用 webfont，支持暗色模式和 RTL。单页图片从 15–17.5 MB 降到约 0.26 MB | 文档 05、原型 |

### 1.4 预期收益与衡量

流量基数很小：28 天 71 次点击，58% 来自品牌导航词。所以重构的风险低，收益只能来自"非品牌功能词 × 各语言目录"的增量。所有判断都用 28 天窗口，点击类告警须连续两个窗口不达标才触发（R50）。

| 指标 | 基线 | T+4 周 | T+12 周 |
|---|---|---|---|
| "wordbyword" 28 天平均排名 | 1.6 | ≤ 2.0（7 日均值连续 7 天 > 3.0 即启动排查，R18） | 同左 |
| 品牌桶点击 | 41 | ≥ 33（基线的 80%） | 同左 |
| locale 首页收录 | 推断约 0/19 | ≥ 15/20 | 20/20 + `/about/` |
| 非品牌展示 / 点击 | 约 263 / 15 | ≥ 300 / ≥ 15 | ≥ 600 / ≥ 30 |
| 非英语展示（"网页"维度） | 约 0 | ≥ 5 个 locale 有展示 | 合计 ≥ 300 |
| 实验室 LCP / CLS | LCP 推断 > 4 s | ≤ 2.5 s / ≤ 0.05 | 保持 |

"word by word" 头部词只观察、不告警（新 H1 不再含该短语，且意图本就错配）。SE 推荐预计每月只有个位数到十几次点击，不以短期下载量论成败。口径见文档 03 §8、文档 07 §7.1。

### 1.5 工期与 T0

- 投入：T0 前人工估时 43.05 人日；用 Claude Code 辅助约 24.5 人日，排期按 ×1.3 约 32 人日。外部审校另计，上线前只有 ko 约 1.0 人日（en 按 R80 不设外部审校；文档 07 §0、§4）。
- **T0 窗口 2026-11-17～11-26，预期 11-25（周三）**。乐观 11-17，保守 12-08。避开 12-18～01-04；如果会越过 12-17，就改到 2027-01-12 那一周（R23）。
- 里程碑：M0 10-06～10-08 → M1 至 10-19（校准点）→ M2 至 10-30 → M3 11-02～11-12 → M4 至 11-18（Go 评审 11-23）→ M5：T-7 11-18、T0 11-25、T+7d 12-02 → M6 至 T+12w（2027-02-17）。
- DNS 回滚截止 = T0 当时 GitHub Pages 证书的 notAfter（T-1 实测），不写死日期。

---

## 2. 已确认的关键决策

### 2.1 用户决策（基线 §A，2026-10-05）

| # | 决策 |
|---|---|
| U1 | 托管用 Cloudflare Pages（b-lite）：只改 `www` 的 CNAME，不迁 NS，apex 本期维持现状 |
| U2 | 只用现有素材：三套本地化截图、由此派生的图标和 OG 图、HTML/CSS 样张、SE 官网现有截图 |
| U3 | Chrome 扩展子站纳入新站一起重做，并进入导航（落地方式见 R2） |
| U4 | 对外署名 "Jinlong"；JSON-LD 中 `alternateName: "Chi Jinlong"` |

### 2.2 主控裁定（节选；全文见 [12-rulings](appendix/research/12-rulings.md)）

| R | 一句话 |
|---|---|
| R29 / R56 | M0 第一步：从 `7a389ba` 建 `legacy-pages`，把 GitHub Pages 发布源切过去，按关键 URL 的响应体 md5 验收；完成前不得向 main 推送重构提交 |
| R30 | 文档与原型默认不入公开仓库（H10）；原型不进生产 `dist` |
| R2 / R45 | 扩展页由 `SITE.chromeStoreUrl` 驱动：S0（默认）noindex、header 隐藏、CTA 为 "Coming soon"；S1 可索引并进入导航 |
| R23 | 排期按文档 07；T0 窗口 11-17～11-26；回滚截止 = 证书 notAfter |
| R27 | 首页 H1 不含品牌名，由 eyebrow、首段定义句和 title 首词承担品牌 |
| R39 | WBW 定位不变："用真实网页学外语的阅读助手"，不以"学英语"作主词 |
| R40 / R41 | SE 推荐叙事为"互补、也值得一试"；卖点只写 WBW 没有的（分级英语新闻、复习游戏、从 Safari 分享） |
| R42 | 落点 ①②④⑤⑥（删除 ③）；zh-Hans 只留 ②④⑤，并注明 SE 未在中国大陆上架 |
| R43 | 价格区必须有 WBW 徽章；SE 卡片只用文字链接；加强最终 CTA |
| R75 | 文档 08 是全站文案（含 SE 推荐文案）的唯一来源；文档 04 只保留原则、落点、矩阵、度量与 SE 侧 PR，文案部分改为"键 → 文档 08 位置"的索引 |
| R76 | 指向 SE 官网的锚文本用 SE 在该语言的核心词短语（如 en "Read English news at your level with SurfEnglish"，以文档 08 为准），不用裸域名 "surfenglish.app"；App Store 文字链接写 "Get SurfEnglish on the App Store →"（本地化） |
| R46 | 关键词 → URL 唯一映射；首页用产品/品类主词，how-to 归 G1；H1 和 CTA 不暗示整页翻译 |
| R17 | Person `name: "Jinlong"`，与 SE 共用 `@id`，两站 `sameAs` 逐字一致 |
| R81 | about 页可见文本不出现 "Chi Jinlong"，去歧义改为链接到 App Store 开发者页（"WordByWord on the App Store"）；JSON-LD `alternateName: "Chi Jinlong"` 保留 |
| R18 / R50 | 品牌排名 ≤ 2.0，品牌桶 ≥ 80%；非品牌 = 未筛选总量 − 品牌正则匹配量；删除"全站点击 ≥ 57" |
| R54 | 文档 02 §5.2 是 `_redirects` 的唯一规格和测试夹具 |
| R36 / R80 | 审校：本人审 zh-Hans/zh-Hant/ja；en 由本人通读 + 双模型互检，不设外部审校，不阻塞 T0（R80）；ko 外部审校，T-7 前没有着落可以回落；T2/T3 上线后补审 |
| R51 | SE 仓库的 PR-SE-1 在 T0 前合并，PR-SE-2 在 T+7d 内合并 |
| R57 | 应急公告从生产分支 `cloudflare-deploy` 拉 hotfix 分支，不从 main 直接部署 |
| R8 / R58 / R79 | 裁切在 node 中完成，sips 只做缩放与格式编码；AVIF 宽高必须为偶数；闸门 = 结构检查 + Chrome headless 实际解码后的 alpha 抽样（sips 回解只作辅助），防止 Chrome 显示"白板图" |
| R5 / R6 / R47 | 不输出 FAQPage、meta keywords 和 Content-Language HTTP 头 |

---

## 3. 文档地图

| 文件 | 读它解决什么问题 |
|---|---|
| [01-现状审计与根因](01-现状审计与根因.md) | 现在哪里坏了、为什么坏；问题 ID 到负责章节的索引（§5）；问题何时算关闭（§6） |
| [02-信息架构与URL](02-信息架构与URL.md) | 有哪些页面和 URL；旧 URL 怎么 301（§5.2 夹具）；hreflang、canonical、sitemap；导航与语言切换器 |
| [03-SEO与关键词策略](03-SEO与关键词策略.md) | 每种语言用什么词、放在哪里；title/description/H1 草案；JSON-LD；技术 SEO 清单；KPI 与回退阈值 |
| [04-SurfEnglish兄弟推荐](04-SurfEnglish兄弟推荐.md) | SE 在哪里推荐、对谁说、按什么原则说、怎么度量（文案本身在文档 08，R75）；SE 仓库的配套 PR（S1–S7） |
| [05-视觉设计系统](05-视觉设计系统.md) | token、字号、组件、线框；素材裁切与图片预算；暗色、RTL、可访问性 |
| [06-技术架构与工程方案](06-技术架构与工程方案.md) | 目录、`build.mjs`、locale schema、38 项校验、图片管线、GA、契约 URL、CF 设置与切换 Runbook、CI |
| [07-实施计划与风险](07-实施计划与风险.md) | 里程碑与 WBS（可直接建 issue）、关键路径、风险 RK01–RK29、T-7～T+7d Runbook、KPI |
| [08-文案底稿](08-文案底稿.md) | 全站文案的唯一来源（含 SE 推荐文案，R75）：en/ja/zh-Hans 定稿级 JSONC、about 与扩展页文案、其余 17 个 locale 的翻译简报和术语表 |
| [prototype/](prototype/README.md) | 按设计落地后首页（en/ja）实际长什么样，尺寸和体积守不守得住（实测见 README §3） |
| `appendix/research/00`–`10` | 研究报告（只读）：00 GSC 基线；01 结构审计；02 技术 SEO；03 SE 官网架构；04 现有 SE 推广；05 产品事实；06 SEO/GEO 实践；07 关键词与竞品；08 视觉与素材；09 托管与迁移风险；10 事实核查（§4 的 F1–F36 是唯一可信事实源） |
| [11-design-baseline](appendix/research/11-design-baseline.md) | 用户决策 U1–U4 与跨文档基线 §B–§H |
| [12-rulings](appendix/research/12-rulings.md) | 主控裁定 R1–R84 与统一待办 H1–H18，优先于所有文档正文 |
| `appendix/research/13-review-findings.json` | 对抗性评审 89 条（2 blocker、48 major、39 minor），每条含 issue、evidence、fix |
| [consistency-audit](appendix/consistency-audit.md) | v1.1 一致性审计结果，以及遗留问题 L1–L12（需拍板的部分已由 v1.3 裁定 R74–R84 处理） |

**推荐阅读顺序**

- **决策者**（约 1 小时）：本文 → 01 §0 → 12-rulings 第三节（H 清单）和第四、五节 → 07 §0、§2、§4.2、§5 前 5 条风险 → 04 §0、05 §0，并打开原型看一眼 → consistency-audit 第六节。
- **实施者**：本文 → 11 基线 → 12 裁定 → 研究 10 §4 → 07（按 WBS 推进）→ 06 全文 → 02 §4–§7 → 03 §3、§5、§6 → 08 → 05 与原型 README → 04。细节再查研究报告和评审 JSON。

**冲突时以谁为准**：裁定 > 基线 > 文档正文。分项来说，`_redirects` 以文档 02 §5.2 为准；代码字段名、脚本名、目录和性能预算以文档 06 为准；裁切坐标与画质参数以文档 05 为准；排期以文档 07 为准；可见文案（含 SE 三语文案）以文档 08 为准。`appendix/research/*` 只读，不要改。

---

## 4. 引用约定

| 写法 | 含义 | 位置 |
|---|---|---|
| 研究 0X §n | 研究报告的章节。研究 10 的冲突和遗漏条目写作"研究 10 C18""G3" | `appendix/research/0X-*.md` |
| 文档 0X §n | 本批设计文档的章节 | `0X-*.md`；原型 README 中裸写的"05 §…"也指文档 05（L12） |
| F1–F36 | 关键事实条目 | 研究 10 §4 |
| R1–R84 | 主控裁定：R1–R28 处理跨文档冲突，R29–R38 为补充，R39–R73 为依据评审的 v1.2 裁定，R74–R84 为处理审计遗留项的 v1.3 裁定 | `12-rulings.md` 第一、二、四、五节 |
| H1–H18 | 待用户提供 / 确认的清单 | `12-rulings.md` 第三节 |
| U1–U4、基线 §A–§H | 用户决策与设计基线 | `11-design-baseline.md` |
| SEO- / PRO- / ENG- / I18- / VIS-nn | 评审条目 | `13-review-findings.json` 的 `id` 字段 |
| L1–L12 | 一致性审计遗留问题 | `consistency-audit.md` 第六节 |

**容易混淆的编号**：
- RK01–RK29 是文档 07 的风险编号，不是裁定；M0-01 等是 WBS 任务。
- D-n、L-n 是文档 06 的产物校验和 locale 校验规则；L-n 与审计遗留 L1 写法相近，要看上下文。
- A# 是各文档的验收项；K1–K10 是功能关键词，G1–G4 是 Phase 2 指南（文档 03）。
- "S1"可能指扩展子站的状态、SE 仓库的改动项，或文档 01 的 SEO 问题；"P1"可能指 SE 推广问题、问题级别，或文档 03 的搜索位置。
- C-1、C-2 是契约 URL 的两种实现方案；C-01 等是文档 01 的文案问题。

---

## 5. 开工前清单

### 5.1 会阻塞里程碑的 H 项

| H | 事项 | 阻塞 | 未提供时 |
|---|---|---|---|
| H9 | CF 新建 Pages 项目的权限；应急部署 API Token | **M1** | 无默认值，不能开始 M1 |
| H10 | `docs/`、`prototype/` 是否进入公开仓库 | M1（只影响提交） | 不入库（R30） |
| H11 | 素材确认：X 截图按钮的行为、第三方内容、zh-Hant 截图回落 | M2 | 按 R31–R33、R71 |
| H12 | about 时间线中的日期；扩展是否收费、能否标 Beta | M2 | 不写月份；写 "Coming soon"，不标价格 |
| H7 | 母语审校安排（尤其是 ko 和 T2/T3） | M3 | 按 R36；en 按 R80（本人通读 + 双模型互检，不阻塞 T0） |
| H14 | SE 仓库配套 PR 的授权与排期 | M3 / M6 | 按 R51 |
| H2 | GA4 页面流量、`surfenglish_promo` 各 label 的基线 | M5（T-7 前导出） | 以上线后前 8 周为基线 |
| H8 | DNS 控制台中 `www` 的编辑权限、zone 全表导出、GSC 网域属性的验证方式 | **M5** | 无默认值，不能执行 T0 |
| H16 | WBW iOS 下一版本的提交时间 | M6 | 延后 |

H1、H3–H6、H13、H15、H17、H18 不阻塞，走裁定第三节的默认值。M0 的退出条件还要求 H9 已关闭、H7 的分工已排期（文档 07 §2）。

**此前待拍板的遗留项已由 v1.3 裁定处理**：L2 → R77（08/06 补 `hero.how` 等键，文档 07 新增 M2-15）；L4 → R76（锚文本用 SE 核心词短语）；L5 → R79（闸门 = 结构 + Chrome 层，sips 只作辅助）；L6 → R80（en 不设外部审校，不阻塞 T0，文档 07 的 N3 已关闭）；L7 → R81（about 页可见文本不出现 "Chi Jinlong"）。开工前不再有需要主控或用户拍板的遗留项。

### 5.2 M0 第一步：冻结旧站（R29、R56；文档 07 M0-02、文档 06 §1.2）

GitHub Pages 现在从 main 发布。新结构一旦推上 main，根目录就没有 `index.html`，线上会立刻坏掉，DNS 切换前的回滚目标也随之消失。所以必须先冻结：

0. （可选，须用户确认 H18）如果要先在旧站关掉固定推广条（M0-09），顺序是：先导出 H2 → 做止损提交 → 再从止损提交建 `legacy-pages`。
1. 记录冻结前的基线：
   ```bash
   for p in / /ja-top.html /privacy.html /support.html /chrome-extension/privacy.html; do
     u="https://www.word-by-word.app$p"
     printf '%s %s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code} %{size_download}' "$u")" "$(curl -s "$u" | md5)"
   done > before.txt
   ```
2. `git branch legacy-pages 7a389ba && git push origin legacy-pages`
3. GitHub → Settings → Pages → Source 选 `legacy-pages` / `(root)`；勾选 Enforce HTTPS；给 `legacy-pages` 开分支保护，禁止推送。
4. 重建完成后，用同一条命令生成 `after.txt`；`diff before.txt after.txt` 没有差异即通过。Last-Modified 和 ETag 会变成新的部署时间，这是正常现象，不作判据。
5. 通过之后 main 才能推送重构提交；`docs/` 仍按 H10 处理。T-7、T-1 各重跑一次比对，确认回滚目标完好。

---

## 6. 原型：预览与边界

```bash
cd /Users/ike/Dev/WordByWord/wordbyword-web/docs/redesign-2026/prototype
python3 -m http.server 8899 --bind 127.0.0.1
# en：http://127.0.0.1:8899/    ja：http://127.0.0.1:8899/ja.html
```

重新生成与校验在仓库根目录执行（Node 24，零依赖；图片管线需要 macOS 的 `sips`，Chrome 层校验需要本机 Chrome）：

```bash
node docs/redesign-2026/prototype/tools/build-images.mjs
node docs/redesign-2026/prototype/tools/render.mjs
node docs/redesign-2026/prototype/tools/check.mjs        # 加 --no-chrome 可跳过 Chrome 层
```

**与生产实现的边界**

- 原型是设计参考，不是生产代码，也不是文档 06 的 `build.mjs`，不进生产 `dist`（R30）。
- 可以复用：`style.css`（token 与组件）；`tools/build-images.mjs` 与 `tools/png.mjs`，作为 `images.mjs` 的参考实现（含偶数尺寸修正和 node 内精确裁切，R79，见原型 README G6）；`tools/avif-check.mjs`；`tools/render.mjs`（`home.mjs` 可以由它改造）。
- 不得带入生产：head 中带 `data-prototype-only` 的 `noindex, nofollow`（R49、D-20）；`render.mjs` 对旧字段（`features[x].sample.author/lang/label`、缺 `ledeShort`/`how` 时拆分 `hero.lede`）的兼容回落。v1.3 起原型已读文档 08 的新键名（`sibling.card.*`、`aExtLive`、`demo.articleTitle/context`），不再带临时文案；键名以文档 06 §4.2 为准（R74、R77）。
- 覆盖范围：只有 en、ja 首页（S0 状态）；ar 基准页未做（K4）；App Store 徽章是占位，链接缺 `pt`（D9、K8）；390 宽 en 页长 12,947px（≤ 13,000，余量 53px），SE 卡 390 宽 en 474px（≤ 480，余量 6px，K11）。

---

## 7. 安全提示

- 仓库 `super-monster/wordbyword-web` 是 **public**（F1）。本目录含 DNS 结构、后端域名、权限与内部路径等信息。**H10 决定前不要提交 `docs/`**（R30），本文件也一样。
- GitHub Pages 目前**从 main 分支发布**（Jekyll）。提交到 main 的任何文件都会被公开发布到 `www.word-by-word.app` 下：原型 HTML 一定会被原样发布，Markdown 也可能被渲染成页面（RK07）。即使 M0-02 之后发布源改为 `legacy-pages`，公开仓库里的内容依然人人可读。
- 实操：提交时不要用 `git add -A` 或 `git add .`；可以在本机 `.git/info/exclude` 中加入 `docs/`，只在本地生效，不进仓库。如果日后决定脱敏入库，必须在 M0-02 之后进行，并在 CF 的 Build watch paths 中排除 `docs/**`、`prototype/**`。
- 一旦误提交：立即撤回，确认 `/docs/redesign-2026/` 返回 404，必要时在 GSC 申请移除；Git 历史仍有记录，是否重写历史由本人决定。

---

## 8. 范围外但需关注的风险

| 风险 | 说明 | 建议 / 编号 |
|---|---|---|
| WBW 生产版依赖 `backend-test` | iOS 生产版唯一的后端是 `backend-test.word-by-word.app`，SE 侧把它当测试环境，而且已经在上面先切过模型。官网引流越成功，受影响的用户越多 | 最晚在 T0 前确认（H17、RK23、F21） |
| App Store US 描述首行 | 首行是内部备注 "English concise submission version"，会出现在品牌词的搜索摘要里 | 随下一个版本删除（H16、F17） |
| 隐私标签与同意管理 | 隐私标签写 "Data Not Collected"，App 却集成了 Firebase Analytics；官网 GA 对 EEA 访客没有同意机制 | 复核标签；H6 决定后改写 privacy 页（RK22） |
| 扩展隐私页 | 权限说明和"不追踪"声明与 manifest 不符 | 上架前按 manifest 重写（H5、C-22） |
| ASC Marketing URL | 各本地化仍指向根域；apps.apple.com 的外链是 nofollow，只算引荐入口 | 下一个版本改为对应语言页（H16、R51） |
| apex 无法解析 | `word-by-word.app` 没有 A/AAAA 记录，切换后依旧 | 另立小项（U1、F6） |
| SE 官网没有统计 | 无法度量 WBW 带过去的流量 | 随 PR-SE-2 接入统计（F23） |
| App 本地化瑕疵 | ar 译文缺 `dir`；ko 界面混有汉字，zh-TW 界面有大陆用语 | 下一个 App 版本修正（I18-05、I18-06） |
| 域名续费 | 注册在 GCP Cloud Domains（项目 VirtualApiProject），2027-02-03 到期，自动续订已开（2026-10-06 核实） | 确认该 GCP 项目的结算账号保持有效 |

---

## 修订记录 v1.1

| 评审 / 裁定编号 | 处理结果 | 修改位置 |
|---|---|---|
| v1.3 定稿修正（R74–R84） | 已改：关键决策表加入 R75、R76、R81，R8/R58 行并入 R79，R36 行并入 R80（en 不设外部审校、不阻塞 T0，删除"en 审校人未定，见 L6"）；工期数字与文档 07 v1.3 核对一致（人工 42.3 → 43.05，AI 辅助约 24 → 24.5，排期口径约 31 → 32 人日；T0 窗口 11-17～11-26、预期 11-25 与各里程碑日期不变；外部审校上线前只剩 ko）；开工前清单 H7 默认补 R80，"待拍板"段改为 L2/L4–L7 已由 R76、R77、R79–R81 处理；裁定范围 R1–R73 → R1–R84；文档地图中 04/08 的职责按 R75 改写；原型边界补 `png.mjs`（R79）与 R74/R77 的键名、样张来源。规则数 38 项、`_redirects` 67/7、RK01–RK29 经核对与文档 06、07 一致，未改 | §1.5；§2.2（R75、R76、R81 新增，R36/R80、R8/R58/R79 改写）；§3 文档地图（04、08、12-rulings、consistency-audit 行）与推荐阅读顺序；§4 引用约定 R 行；§5.1 H7 行与"待拍板"段；§6 与生产实现的边界；本表（新增） |
| v1.3 验收修正（2026-10-05） | 已改：§6"与生产实现的边界"删除已过时的"原型保留旧键名 `sibling.section.*`/`aS1`/`demo.headline`、`render.mjs` 内 en 临时 X 文案"两条（原型 v1.3 已改读新键、无临时文案），改为说明 `render.mjs` 的旧字段兼容回落不得带入生产；覆盖范围中的"390 宽 en 页长 12,995px，余量 5px（K1）"更新为原型 README §3 的 v1.3 实测 12,947px（余量 53px），并补 SE 卡 390 宽 474px（余量 6px，K11）。§1.5 工期、§1.4 KPI、§1.3 的 67/7、38 项校验、sitemap 23/26、hreflang 22 与文档 07、06、02 逐项核对一致，未改 | §6 |
