# WordByWord 官网首页 · 视觉原型（en / ja）

| 项 | 内容 |
|---|---|
| 版本 | **v1.1**（v1.0 → v1.1 变更见 §2） |
| 日期 | 2026-10-05 |
| 依据 | `../05-视觉设计系统.md` **v1.1**（token、字号阶梯、分区间距、组件、素材管线）；`../08-文案底稿.md` **v1.1** §2 en / §3 ja（全部可见文案，含 v1.3 定稿修正新增的键）；`../04-SurfEnglish兄弟推荐.md` §3.1（SE 卡片）；裁定 `../appendix/research/12-rulings.md` R39–R84（优先于各文档；v1.3 定稿修正见 §2 末行）；原型评审发现（`13-review-findings.json` 中指向原型的 15 条） |
| 状态 | 设计稿配套原型（不是生产代码，不是 06 的 `build.mjs`） |
| 引用写法 | 本文中单独出现的两位数编号（如 "05 §7.1""08 v1.1"）均指同批设计文档，即"文档 05"等（`../0X-*.md`）；"R#"指 `../appendix/research/12-rulings.md` 的裁定，"F#"指研究 10 §4 的事实条目，"H#"指裁定第三节的待提供清单 |

原型回答一个问题：按 05 v1.1 + 08 v1.1 + 裁定落地后，首页实际长什么样、尺寸和体积是否守得住。所有可见文案由 `tools/render.mjs` 在生成时**直接从 08 的 JSONC 代码块读取**，原型文案因此不会与 08 脱节。v1.3 起 `render.mjs` 不再带任何临时文案（`CFG` 只剩语言、文字系统、SE 链接目标与占位徽章两行字）；08 缺 `hero.ledeShort` / `hero.how`、`cta.recap`、`pricing.summary`、`nav.downloadShort`、`demo.byline` 时按 08 D19 回落（见 §4）。

> **生产模板禁止**：两页 `<head>` 里的 `<meta name="robots" content="noindex, nofollow" data-prototype-only>` 只为防止原型被收录（仓库若把 `docs/` 发布到 GitHub Pages，原型会出现在 `word-by-word.app/docs/…` 下）。**这一行不得带入任何生产模板**：可索引页输出 index 版 robots（06 §5.1.1、R49、SEO-06）。`check.mjs` 会拒绝没有 `data-prototype-only` 标记的 noindex。

---

## 1. 本地预览与重新生成

```bash
cd /Users/ike/Dev/WordByWord/wordbyword-web/docs/redesign-2026/prototype
python3 -m http.server 8899 --bind 127.0.0.1
# 英文首页 http://127.0.0.1:8899/            （index.html）
# 日文首页 http://127.0.0.1:8899/ja.html
```

```bash
cd /Users/ike/Dev/WordByWord/wordbyword-web
node docs/redesign-2026/prototype/tools/build-images.mjs   # 只读源素材 → assets/（先清空 app/ se/ brand/）+ assets/manifest.json（macOS；裁切在 node，sips 只解码/缩放/编码，R79）
node docs/redesign-2026/prototype/tools/render.mjs         # 08 文案 + manifest → index.html、ja.html
node docs/redesign-2026/prototype/tools/check.mjs          # 引用 / 结构 / 规则 / CSS / AVIF 闸门（结构 + Chrome，R79；sips 只作辅助）/ 节选边缘 / 体积；--no-chrome 跳过 Chrome 层并给出警告
node docs/redesign-2026/prototype/tools/shoot.mjs http://127.0.0.1:8899/ out/en-L 1366 900 light 1100   # 自检：量取 + 分段截图（需先起服务）
```

全部脚本只用 Node 24 自带模块，没有 npm 依赖；页面本身也没有外部 CDN、webfont 或框架。

| 文件 | 作用 |
|---|---|
| `index.html` / `ja.html` | 生成产物：en、ja 首页 |
| `style.css` | 两页共用的唯一样式表；05 v1.1 §2.1 token、§3.2 字号阶梯、§4.2 分区间距；物理属性只出现在 `@physical-ok` 标记的机身/App 复刻块内 |
| `demo.js` | 渐进增强：hero 样张时间线（05 §5.2.4）、sticky header 底线、`<details>` 菜单 Esc/外部点击关闭、L2 引线首次绘制 |
| `assets/` | 55 个派生图（`app/en`、`app/ja`、`se`、`brand`）+ `manifest.json`（源、裁切框、`statusBg`/`statusTone`、`pins`/`ring`、节选边缘指标、字节数） |
| `tools/build-images.mjs` | 素材管线（05 §7.1 参考实现：去状态栏裁切、P3→sRGB、偶数宽高、AVIF+JPEG、状态栏取色、favicon 亮/暗）；全部裁切（含偶数修边）在 node 中完成（R79） |
| `tools/png.mjs` | 零依赖 PNG 解码/编码 + 行亮度 σ / 墨迹占比 / 透明占比 |
| `tools/avif-check.mjs` | AVIF 校验（R58，按 R79 修正）：闸门 = 结构 + Chrome 回解 alpha；sips 回解只作辅助提示。也可单独对任意 AVIF 运行（`--chrome` 跑完整闸门） |
| `tools/render.mjs` | 原型渲染器 |
| `tools/check.mjs` | 校验与体积统计 |
| `tools/shoot.mjs` | Chrome headless + CDP 自检（量取 + 截图），开发期工具（R34） |

## 2. v1.1 变更（对照裁定与评审）

| 裁定 / 评审 | v1.1 做法 |
|---|---|
| R65 / VIS-02 荧光笔 | 全页只剩 hero H1 的一个短语（`<span class="kw">`，不再用 `<mark>`；≥560 不换行；暗色 `#D8BE2A`）+ 样张/截图里的查词演示。功能 H3、语言 H2、SE H2 的 `[[ ]]` 一律剥除；`render.mjs` 与 `check.mjs` 都断言 `.kw` ≤ 1 且在 `h1` 内 |
| R66 / VIS-03 样张 | 灰色骨架条删除。样张是一篇完整短文：衬线标题（`demo.headline`）→ 被右滑的段落 → 红条译文 → 两段未翻译的后续段落（`demo.more`，被查词卡部分遮住）。en 页源文西语、ja 页源文英语 |
| R67 / VIS-04 状态栏 | 所有截图裁掉原始状态栏（三种 preset 的去状态栏裁切区按 05 §7.1，输出 402:820），由 CSS 机身统一画 9:41 状态栏；底色与字色取自 manifest 的 `statusBg`/`statusTone`（构建时从裁切图首行取色：内置浏览器 `#F3F3F4`/深字，弹层 `#000000`/白字）。机身去掉投影 |
| R68 / VIS-05 字号阶梯 | 60 / 44 / 32 / 22 / 17（1280）→ 36 / 28 / 24 / 20 / 17（360）；CJK 专用阶梯 52 / 40 / 30。`.h-display` `.h-sub` `.h-3` `.h-4` 分离语义与视觉；`.h-m`、`h2, .h-xl` 删除 |
| R68 / VIS-06 分区间距 | 分区只取 `padding-block-start` 一个 token，底色变化或 footer 前才加底边距（`.section--end` / `.section--band`）；token 下调为 S 40–64、M 56–96、L 72–128 |
| R68 / VIS-07 规格行 | 4 列线描图标栅格 → 排版式规格清单（标签 + H3 + 事实，hairline，无图标；只在"显示"一行放 4 个 Aa 小样）；≥900 两列两行 |
| R68 / VIS-08、R43 价格区 | 删除 Free/Plus 两张复述卡；一张额度表 + 一行说明 + **WBW App Store 徽章**（`ct=wbw-pricing`）；价格进 Plus 列表头第二行；8px 马赛克条 + 3px 红线只在 Plus 表头 |
| R68 / VIS-16 底色交替 | languages 为 `--paper-2` 便签带，pricing 回到纸面底；下半部只有最终 CTA 一条便签带 |
| R69 / VIS-11 手机首屏 | DOM 顺序 = 手机阅读顺序：H1 → 定义句（`hero.lede` 首句）→ 徽章 + "看看怎么用" → `hero.ctaNote` → 样张 → 手势说明（`hero.lede` 其余句）→ platformNote。≥900 用 grid 把后两项放回左栏。390×844 首屏内红色译文条顶端 en y=717 / ja y=727（≤ 820） |
| R70 / VIS-12、VIS-13 品牌 | 任何宽度都保留字标（<560 为 15px，<380 为 14px）；logo `<img alt="WordByWord">` + 字标 `aria-hidden`；<560 语言切换器只留地球图标。暗色下所有 App 图标（header、页脚、最终 CTA、SE 图标）加 1px `rgb(242 236 230 / .40)` 外圈；favicon 出亮/暗两版（`media` 切换，暗版带同色外圈） |
| R71 / VIS-15 X 卡 | en、ja 都改为 HTML/CSS 通用社交帖样张（虚构账号 `@example`、首字母头像、源文 + 页面语言红条译文、通用操作图标，无 X 标志），图注写"示意，非截图"。en 不用截图的原因见 §5 G1 |
| VIS-09 L2 | 放大镜删除；编号钉移到机身外沿（逻辑 `start`/`end`，纵坐标 = 目标的整屏 y），被查单词用 2px 红色描边环（`ring`）；页边注首行与钉同高；<900 钉留在机身外沿、注释在机身下方按 ①②③ 堆叠 |
| VIS-10 节选 | 图上不再叠加标签，标签移到图下 figcaption；节选坐标按 05 §7.1（en 朗读 .652、en 句法 .40、ja 句法 .54），ja 朗读 .658 → **.661**（见 §6 K5）；`check.mjs` 校验首末 4 行 |
| VIS-17 画廊 | ja（n=2）≥900 改为左右版式：两台 320px 机身 + 右侧图注列；en（n=4）维持 4×240 |
| VIS-18 FAQ | ≥900 左 4 列 H2（sticky）+ 右 8 列问答；问题用衬线（`--font-read`），答案红条；第 1 问默认展开；13 问（R73） |
| VIS-19 马赛克 | hero 边线改为 content 宽、2 行 × 8px 的 SVG pattern；页脚 24px 孤立方块删除；最终 CTA 放 64px 4×4；暗色黑格用 `--mosaic-k` |
| VIS-20 红条 | 红条只挂在译文/回答下（样张、X 样张、FAQ 答案）；L1 要点改为 01/02/03 编号行，语言区脚注与当前语言改用 hairline / 下边线 |
| VIS-21 暗色 | 语块示意卡与 X 样张固定为白色"屏幕"；`.tag--en-only` 暗色为描边 |
| VIS-22 | 编号统一 13px；页脚语言链接行高 32px |
| R40–R44 SE 卡 | `<aside>` 纸面夹页卡；SE 图标 32px；H2 以 "SurfEnglish" 开头（`render.mjs`/`check.mjs` 断言）；互补叙事文案取自 08 v1.1；**无黑色徽章**，两条文字链接（App Store `ct=wbw-card` + `surfenglish.app`）；窗口为 `games-home.jpg` 上部裁切（x0 y112 720×792 → 400×440，显示 200×220），<900 隐藏且不下载 |
| R43 最终 CTA | 全宽便签带：左栏 80px App 图标 + 64px 马赛克，右栏 H2 + 要点回顾（`cta.text`）+ 48px 徽章（`ct=wbw-cta`）；页面上 WBW 图标最大 80px ≥ SE 图标 32px 的 2 倍 |
| R3 / R55 ct | App Store `ct` 只按落点：`wbw-header`、`wbw-hero`、`wbw-pricing`、`wbw-cta`、`wbw-footer`、`wbw-card`，不带 locale |
| R16 / R2 header | 原型为 S0（`SITE.chromeStoreUrl` 为空）：header 不显示 Chrome extension，页脚保留；FAQ "devices" 用 S0 答案（R45） |
| R49 / SEO-06 | 删除 v1.0 head 中"head tags mirror 02 §6"的说明；noindex 改为带 `data-prototype-only` 的标记行并加注释（见文首） |
| R58 / ENG-05 AVIF | `check.mjs` 对全部 AVIF 跑三层校验：结构（grid + 奇数尺寸）、`sips -s format png` 回解 + node 读 alpha、Chrome headless 回解 + canvas alpha（见 §6 K2） |
| R61 | 08 v1.1 在 ja 文案中自带 `{wbr}`；渲染器在标题中转 `<wbr>`，在 `<title>`、meta、aria-label 中剥除；v1.0 的手工 WBR 表删除 |
| R60 | `<html data-script>` + `data-page="home"` |
| ENG-09 | 界面字符串全部取自 08 v1.1 的 `common.*`、`nav.aria*`、`footer.ariaNav`，`render.mjs` 不再硬编码 |
| 一致性审计修正（2026-10-05） | 只改说明文字，未重新生成页面：表头补"引用写法"一行（本文的 05/06/08 = 文档 05/06/08）。§5 G1 的 X 卡分歧已按 R71"无合规截图的 locale"条款在文档 01/03/06/07/08 中统一为"全部 locale 用样张"，en 的 `sample` 文案仍待文档 08 v1.2 补齐；G2 的键名差异（`demo.headline`/`more`、`aS1`、`sibling.section.*`）以文档 06 §4.2 为准，映射见文档 08 §1.5 末尾注 |
| v1.3 定稿修正（R74–R84） | 重新生成两页并重跑自检（数据见 §3）。① `tools/render.mjs`：删除 `CFG.en.xSample` 与无用的 `CFG.*.gallery`，X 样张改读文档 08 S22 `features[x].sample.{author, handle, time, lang, source, translation, label}`（帖头"名称 + @handle · 时间"，缺 `sample` 即报错，handle 须含 `example`）；hero 改读 `hero.ledeShort` + `hero.how`（缺键时才按首句拆 `hero.lede`，08 D19）；样张渲染 `demo.byline`（`.wb-byline`）；价格区表下加 `pricing.summary`；最终 CTA 为 `cta.recap` → 徽章 → `cta.text` 小字（`.cta-note`）；header 下载按钮 <560 显示 `nav.downloadShort`（en Get / ja 入手），取消 <360 隐藏（原 D6）；SE 卡读 `sibling.card.*`（R74），站点链接锚文本为 `sibling.card.linkText`（R76，不再是 "surfenglish.app"）；规格清单直接用 08 缩短后的正文（R78）。新增断言：规格正文 ≤80 拉丁 / ≤40 全角（R78）、SE 链接不得用裸域名作锚文本（R76）、可见文本无 "Chi Jinlong"（R81）。② `style.css`：`.dl-long`/`.dl-short`；`.wb-byline`（标题下 6pt、13/18pt）；`.pricing-summary`；`.cta-note`；语块示意卡下划线 2px → 1px（R82）；SE 链接 `min-block-size` 36 → 32px、行高 1.4，`.sibling__note` 行高 1.45（R76 锚文本在手机折两行后仍守住 R10 / R84）。③ `tools/build-images.mjs`：偶数修边也改在 node 中裁（R79；原先用 `sips -c … --cropOffset 0 0`，实测输出像素自第 19 行起与源不一致、半透明像素增多），受影响的是缩放后为奇数尺寸的 540w 整屏图与 720w 节选图（AVIF 与 JPEG），体积约 +4–17%，全部 AVIF 仍为偶数尺寸。④ `tools/check.mjs`、`tools/avif-check.mjs`：AVIF 闸门改为结构 + Chrome（R79），sips 回解降为辅助警告；`--no-chrome` 时明确警告闸门不完整；check 同步加入 R76 / R81 断言。⑤ 本文：表头依据、§1 命令说明、§3 实测数据、§4 / §5 已解决条目标注、§6 删除已解决的 K1 / K6 并新增 K11、§7 体积与处理顺序、§8 验收数据 |
| v1.3 验收修正（2026-10-05） | 文档 08 按文档 06 改 `hero.lede`（只放定义句）与 X 样张字段（`name`，删 `lang`/`label`），删除 `closeUpSuffix` 与价格 `points`；重新运行 `render.mjs`，两页与修改前逐字节相同（原型本就渲染 `ledeShort`/`how`，并兼容旧字段）。`render.mjs` 只改两处注释，并给 `.wb-byline` 加 `aria-hidden`（文档 05 §5.2.6；属性变化，版面与 §3 实测不变）；`check.mjs`（含 Chrome 层）全部通过。§4 D10–D12、§5 G7 标为已解决（文档 05/06 改为可选键 `demo.byline`）；G8 / K11 仍待文档 08 压缩 en SE 卡 body |

## 3. 实测数据（2026-10-05 v1.3 重测，本机 Chrome headless，`tools/shoot.mjs` 与同口径 CDP 量取；DPR 1）

**页面总高度**（px）：

| 宽度 | en | ja | 目标 |
|---:|---:|---:|---|
| 1440 / 1366 / 1280 | 10,039 | 10,152 | — |
| 1024 | 9,671 | 9,862 | — |
| 900 | 9,631 | 9,735 | — |
| 768 | 12,006 | 11,984 | — |
| 560 | 12,329 | 12,201 | — |
| **390** | **12,947** | **12,787** | ≤ 13,000（R20、R69）✓（en 余量 53px） |
| 375 | 13,024 | 12,869 | （A17 以 390 为准） |
| 320 | 13,486 | 13,269 | — |

320–1440 共 10 档宽度、两种语言均无横向滚动（`scrollWidth = viewport`，无越界元素）；所有可见 `<img>` 都已解码（无 broken、无"白板"）。320 宽 header 一行放得下（下载按钮显示 `nav.downloadShort`，不再隐藏）。v1.1 首轮为 390：12,995 / 12,791；v1.0 为 1280：10,500 / 10,575，375：14,519 / 14,580。

**分区高度**（390 宽，en / ja）：hero 1,421 / 1,446 · features 5,189 / 5,013 · 画廊 780 / 749 · 语言 962 / 982 · 价格 1,309 / 1,450（含 `pricing.summary`）· SE 514 / 488（含上边距）· FAQ 1,309 / 1,208 · CTA 439 / 441（含 `cta.text` 小字）· 页脚 966 / 952。规格清单 379 / 347（v1.1 首轮 484 / 410；目标 ≤ 360，en 仍超 19px，见 K3）。

**SE 卡片高度**（`.sibling__inner`，px；en 站点链接锚文本 "Read English news at your level with SurfEnglish" 在手机上折成 2 行）：

| 视口 | en | ja | 上限（R10、R84） |
|---|---:|---:|---|
| 1280 / 1366 / 1440 | 361 | 360 | ≤ 420 ✓ |
| 1024 | 360 | 359 | ≤ 420 ✓ |
| 900 | 415 | 391 | ≤ 420 ✓ |
| 560 | 390 | 408 | ≤ 480 ✓ |
| 390 | 474 | 448 | ≤ 480 ✓（窗口隐藏，不下载；en 余量 6px，见 K11） |
| 375 | 474 | 448 | ≤ 480 ✓ |
| 320 | 558 | 551 | ≤ 560 ✓（R84） |

**手机首屏**（390×844，未滚动）：en 定义句（`hero.ledeShort`）y312–367、徽章行 y391–439、ctaNote y447–469、机身顶 y501、**红色译文条顶 y735**；ja 定义句 y319–374、机身顶 y511、**译文条顶 y744**；均 ≤ 844 − 24（A16 ✓）。比 v1.1 首轮（y717 / y727）低约 18px，是样张新增署名行 `demo.byline` 所致（机身内移动，页面总高不变）。

**标题字号**（计算样式，1366 / 390）：H1 60 / 36.8；章节 H2（features、languages、CTA）44 / 28.5；L1/L2 H3 与画廊、FAQ H2 32 / 24.3；M 卡 H3 与 SE H2 22 / 20.1；规格 H3、FAQ 问题 17。ja：52 / 32.7、40 / 26.5、30 / 22.3。（与 v1.1 首轮相同。）

**分区间距**（1366 / 390）：规格清单 → 画廊标题 96 / 56；价格徽章 → SE 卡 64 / 40；SE 卡 → FAQ 标题 96 / 56；画廊 → 语言标题 192 / 112（跨底色，两侧各一个 token）。（与 v1.1 首轮相同。）

**样张时间线**（v1.1 首轮实测，v1.3 未改 `demo.js`；Chrome headless，非 reduced-motion）：进入视口约 0.7s 后开始；终态停 1.2s → idle 1.9s → swiping 2.5s → translated 3.4s → tapping 4.9s → lookup 5.5s；第 2 轮 10.1s 起；17.1s 停回 `is-static`，按钮变为 Replay。L2 引线滚入后 `is-drawn`。（v1.0 的 K8"无法实看"已关闭。）

**体积**（`node tools/check.mjs`）：

| 资源 | 原始 | gzip | 预算 |
|---|---:|---:|---|
| `index.html` | 57.0 KB | 12.4 KB | 06：≤ 80 / ≤ 20 KB ✓ |
| `ja.html` | 57.4 KB | 13.5 KB | 同上 ✓ |
| `style.css` | 51.9 KB（含注释）；去注释与空白 42.0 KB | 12.8 KB（压缩后 9.6 KB） | 06：压缩后 ≤ 50 / gzip ≤ 12 KB ✓；05 设计目标压缩后 ≤ 40 KB ✗（K7） |
| `demo.js` | 5.0 KB | 1.9 KB | ≤ 8 KB ✓ |
| `assets/` 全部派生图 | 55 个文件，1,766.2 KB（AVIF 860.8、JPEG 892.6、PNG 12.8） | — | 仓库体积（v1.1 首轮 1,686.7 KB；增量来自 node 偶数修边，§2 末行；v1.0：64 个、2,129.6 KB） |

**单页实际下载的图片**（DPR 2，按 `srcset`/`sizes` 推算浏览器会选的候选；<900 时 SE 窗口不下载）：

| 页面 @ 视口 | AVIF 路径 | JPEG 回退路径 | 首屏位图 |
|---|---:|---:|---:|
| en @390 | 231.9 KB | 495.9 KB | 3.6 KB |
| en @1280 | 251.3 KB | 516.1 KB | 3.6 KB |
| ja @390 | 188.7 KB | 397.2 KB | 3.6 KB |
| ja @1280 | 212.9 KB | 417.3 KB | 3.6 KB |

预算：整页 ≤ 1.2 MB、首屏 ≤ 150 KB（05 §8.3）全部达标；hero 无位图（v1.0：en @1280 331.3 KB）。

**AVIF 校验**（R79）：35 个 AVIF，其中 18 个是 sips 写出的 512px 分块 grid，全部偶数宽高（闸门 1：结构 ✓）；Chrome headless 回解后透明像素占比最大 0.02%（闸门 2 ✓）；辅助的 sips 回解最大 0.02%。节选首末 4 行墨迹占比全部为 0（σ 提示 4 条，见 G4）。

## 4. 与 05 v1.1 的差异

| # | 差异 | 原因 |
|---|---|---|
| D1 | 【v1.3 已解决】样张缺署名行 | 08 v1.3 新增 `demo.byline`（R77、08 S25），原型渲染为 `.wb-byline`；与 05 的不一致见 D10 |
| D2 | 【v1.3 已解决】`hero.how` 由 `hero.lede` 拆出 | 08 v1.3 提供 `hero.ledeShort` + `hero.how`（R77、08 D19）；拆分只作缺键回落 |
| D3 | 【v1.3 已解决】最终 CTA 的要点回顾借用 `cta.text` | 08 v1.3 提供 `cta.recap`；`cta.text` 渲染为徽章下小字（05 §5.10.1） |
| D4 | 【v1.3 已解决】X 样张写死 `@example`、无时间 | 08 v1.3 `features[x].sample` 带 `handle`（`@runner.example`）与 `time`，en、ja 都由 08 提供 |
| D5 | L1/L2 机身在 <560 为 320px（05 §5.4.1/§5.4.2 写 `min(340px, 86vw)`） | 与 hero 同档；也是 05 §6.2 手机预算表"机身 705"所对应的尺寸，否则 390 宽页长约 13,190 |
| D6 | 【v1.3 已解决】<360 隐藏 header 的 Download 按钮 | 08 v1.3 提供 `nav.downloadShort`（en Get / ja 入手）；<560 显示短文字，320 宽实测无溢出，隐藏规则已删（05 §5.1） |
| D7 | ja 朗读节选 y = .661（05：.658） | .658 的首行切到译文红条（σ 13.7）；.661 首末行均为空白 |
| D8 | SE 窗口按 05 §7.7 裁切（y112 720×792 → 400×440，显示 200×220），未按 04 §6.1（y128–928 → 400×444，显示 200×222） | R8：裁切坐标以 05 为准；两者画面几乎相同 |
| D9 | App Store 徽章仍为 HTML/SVG 占位（v1.0 D12） | 原型不联网下载官方 SVG；生产按 05 §5.12 |
| D10 | 【v1.3 验收已解决】样张渲染署名行 `.wb-byline`（标题下 6pt，13/18pt，`aria-hidden`） | 05 §5.2.2 / §5.16 / A6 与 06 §4.2 已改为可选键 `demo.byline`、有值时渲染（R77 的 "about.byline" 按审计 L2 即此键），与 08 S25、原型一致；红条顶 en y735 / ja y744（≤ 820）。v1.3 验收补上 05 §5.2.6 要求的 `aria-hidden`（只改属性，版面不变） |
| D11 | 【v1.3 验收已解决】hero 渲染 `hero.ledeShort`（H1 下）+ `hero.how`（样张后） | 08 的 `hero.lede` 已按 06 §4.2 改为只放定义句，与 `ledeShort` 相同，所以 ≥560 时渲染 `ledeShort` 与 05 §5.2.1 的"显示 `hero.lede`"结果一致；`render.mjs` 输出不变（逐字节比对） |
| D12 | 【v1.3 验收已解决】X 样张字段 | 08 S22 已按 06 §4.2 改为 `{name, handle, time, source, translation}`（`lang` = `demo.sourceLang`，图注 = `features[chunks].sample.label`）；`render.mjs` 仍兼容旧字段 `author`/`lang`/`label`，输出不变 |

## 5. 跨文档缺口（建议主控分派）

| # | 缺口 | 建议 |
|---|---|---|
| G1 | 【v1.3 已解决】X 卡素材：en 截图每条译文下都有 "Extract chunks" 按钮（相邻按钮间空白约 .17–.19 屏高，放不下 .259 屏高的 16:9 节选），因此全部 locale 用 HTML 样张 | 已按 R71 统一；08 v1.3 补齐 en `features[x].sample`，`render.mjs` 的临时 `CFG.en.xSample` 已删除 |
| G2 | 【v1.3 已解决】08 缺 05 §5.16 的键 | R77 收编 `hero.ledeShort`/`how`、`demo.byline`、`cta.recap`、`nav.downloadShort`、`pricing.summary`、`features[x].sample.{handle,time}`；`common.illustrationLabel`、`faq.lede` 未收编（05 改用 `features[chunks].sample.label`、FAQ 左栏只放 H2）。05 与 08 仍有三处写法不一致，见 D10–D12 / G7 |
| G3 | 【v1.3 已解决】规格清单正文超长 | R78：08 缩为 en 75–80 字符、ja 34–38 全角；原型实测规格清单 379 / 347px（en 仍超 05 的 360px，见 K3） |
| G4 | 05 §7.1 / A19 的"首末 4px 行亮度 σ < 4"会误报：en 朗读节选的上边落在"浅灰卡片 + 白边"的空白行，σ ≈ 5.9 但没有任何文字；ja 句法下边 σ ≈ 4.2 同理 | 06 `check-images.mjs` 改用"墨迹占比"（与行中位亮度差 > 48 的像素占比 ≤ 0.5%）判失败，σ 只作提示；原型 `png.mjs` 的 `inkShare()` 是参考实现 |
| G5 | 【已由 R79 裁定】sips 复现不了 Chrome 的白板问题：用 06 §7.2 原命令产出的坏图（720×1485 grid）实测，sips 回解只有 1.69% 透明，Chrome 回解 100% 透明 | R79：闸门 = 结构 + Chrome 回解 alpha，sips 只作辅助；原型 `check.mjs` / `avif-check.mjs` 已按此实现（§2 末行） |
| G6 | 【已由 R79 裁定】sips 裁切的静默错误（本机实测）：`--cropOffset 0 0` 被忽略（退回居中裁切）；裁切框下边恰好触到图片底边时（raw preset 0,162 1206×2460 于 1206×2622）直接返回未裁切原图，均无报错；v1.3 又发现用它做 1px 偶数修边时，输出像素自第 19 行起与源不一致、半透明像素增多 | R79：裁切一律在 node 中完成；原型 `cropSRGB()` 与偶数修边都已改为 node |
| G7 | 【v1.3 验收已解决】05 与 08 对 R77 新键的写法不一致：`.wb-byline` 是否渲染（D10）、`hero.lede` 与 `ledeShort` 的关系（D11）、X 样张字段名（D12） | 署名行：05/06 按 08 改为可选键 `demo.byline`；`hero.lede` 与 X 样张字段：08 按 06 §4.2 改（一致性审计"v1.3 定稿验收"） |
| G8 | 【v1.3】08 en `sibling.card.body` 249 字符，超 05 §5.9 的 ≤ 180 拉丁字符；手机端正文 6 行，加上 R76 锚文本折两行，390 宽卡片 474px，离 480 只剩 6px（K11） | 文档 08 把 en body 压到 ≤ 180 字符（05 §5.9 已预告"超出时由文档 08 把正文压到 2 行"）；de、ru 实测前先做 |

## 6. 已知问题

| # | 问题 | 建议 |
|---|---|---|
| K2 | AVIF 闸门的 Chrome 层（R79）依赖本机 Chrome；无 Chrome 或 `--no-chrome` 时只剩结构层，`check.mjs` 会给出"闸门不完整"警告（sips 层对白板无效，G5） | 生产在 CI 跑结构层，素材变更后在 Mac 上跑一次 Chrome 层（与 ENG-05、R79 一致） |
| K3 | 手机端规格清单 379px（en）/ 347px（ja）；en 仍超 05 的 360px 19px（每条正文 2 行 + H3 1 行，hairline 与行距占约 40px） | 不影响 A17（390 宽 en 12,947）；由 05 决定接受 379px（R78 已按 05 的字数上限缩写），或 08 再压 en 正文 |
| K4 | ar 基准页 `ar.html`（05 §9.2、A8）本轮未做；钉位、引线、样张的 RTL 规则只在 CSS 中以逻辑属性预留 | 下一轮补 ar.html |
| K5 | 05 给出的 en 朗读节选 y .652 首行 σ 5.9（无文字，见 G4）；ja 朗读按扫描改为 .661（D7） | 按 G4 更新 05 §7.1 的判据 |
| K7 | CSS 去注释后 42.0 KB，超 05 的 40 KB 设计目标（06 的 50 KB 预算满足） | 生产按页拆分 CSS（首页不带扩展页、法律页样式），或接受 06 口径 |
| K8 | App Store 链接缺 `pt`（H3）；除 en、ja 外的语言链接 `href="#"`，生产路径写在 `data-prod-href` | 生产由 build 输出 |
| K9 | X 截图 "Extract chunks" 按钮的实际行为仍待 H11 确认；原型已不使用任何 X 截图 | — |
| K10 | L2 的钉位与描边环沿用 05 §7.2/§7.3 的坐标，目视位置正确（en 描边环套住 "convirtiéndose"，ja 套住 "designed"）；en 的 ② 落在"所属短语"说明的第 2 行 | M2 复核时可把 en ② 的 y 从 .747 微调到 .74，对准说明首行 |
| K11 | 【v1.3】SE 卡片 en 在 390 / 375 宽为 474px，离 R10 的 480 只剩 6px：R76 锚文本 "Read English news at your level with SurfEnglish" 在手机上折成 2 行，正文 249 字符占 6 行。原型已把 SE 链接目标高度从 36 降到 32px（与页脚链接同，VIS-22）、行高 1.4，note 行高 1.45（05 §5.9 预算 19/22px）才守住 R10 与 R84（320 宽 558 ≤ 560） | 见 G8；A9 要求的 de、ru 实测需在 08 压缩 body 后再做 |

## 7. 素材来源与处理（v1.1）

全部为只读派生，源文件未改动。处理顺序（R79）：sips 解码为 PNG（Display P3 源同时转 sRGB）→ node 精确裁切（整屏去掉顶部 54/874 状态栏；节选按整屏比例 y、高 .259）→ sips 缩放为中间 PNG → node 裁成偶数宽高 → sips 编码 AVIF q45（SE 窗口 q50）+ JPEG q60。下表体积为 v1.3 重建后的值。路径相对于 `/Users/ike/Dev/WordByWord/`。

| 输出 id | 源 | 裁切（源像素） | AVIF | JPEG 回退 | 状态栏 |
|---|---|---|---|---|---|
| `app/en/swipe` | `wordbyword-web/img/en/feature_swipe_demo.png` | 122,293 1286×2622 | 360w 28.1K / 540w 47.2K / 720w 65.7K | 540w 113.5K | `#F3F3F4` 深字 |
| `app/en/lookup` | `…/feature_doubletap_demo.png` | 同上；pins ①{start .403} ②{start .747} ③{end .83}，ring {x .385 y .388 w .29 h .032} | 23.9K / 42.9K / 59.5K | 103.4K | `#F3F3F4` |
| `app/en/tts-ex` | `…/feature_tts_demo.png` | 122,1942 1286×724（y .652） | 720w 11.4K / 1080w 17.9K | 720w 31.1K | — |
| `app/en/syntax-ex` | `…/feature_history_demo.png` | 122,1238 1286×724（y .40） | 13.4K / 19.2K | 33.6K | — |
| `app/en/settings` | `…/feature_customize_demo.png` | 122,293 1286×2622 | 360w 10.2K / 540w 19.0K | 53.8K | `#000000` 白字 |
| `app/en/dictionary` | `…/more_definitions.png` | 同上 | 12.5K / 22.5K | 57.8K | `#000000` |
| `app/en/languages` | `…/language_setting_en.PNG` | 0,162 1206×2460 | 4.8K / 8.5K | 29.3K | `#000000` |
| `app/en/language-list` | `…/select_language_en.PNG` | 同上 | 11.6K / 20.5K | 63.2K | `#000000` |
| `app/ja/swipe` | `Resources/wbw_jp/wbw_jp.001.png` | 221,932 842×1717 | 28.5K / 48.2K / 63.0K | 114.7K | `#F3F3F4` |
| `app/ja/lookup` | `…/wbw_jp.002.png` | 同上；pins ①{start .372} ②{start .733} ③{end .83}，ring {x .025 y .355 w .19 h .035} | 23.1K / 38.8K / 52.7K | 93.8K | `#F3F3F4` |
| `app/ja/tts-ex` | `…/wbw_jp.003.png` | 221,2029 842×474（y .661） | 720w 10.4K / 842w 12.9K | 30.9K | — |
| `app/ja/syntax-ex` | `…/wbw_jp.004.png` | 221,1807 842×474（y .54） | 15.2K / 18.7K | 40.4K | — |
| `app/ja/settings` | `…/wbw_jp.006.png` | 221,932 842×1717（画廊 n=2，加 720 档） | 8.7K / 15.2K / 19.5K | 49.6K | `#000000` |
| `app/ja/dictionary` | `…/wbw_jp.007.png` | 同上 | 12.1K / 20.6K / 27.4K | 57.5K | `#000000` |
| `se/games` | `../SurfEnglish/SurfEnglishWebsite/public/images/screenshots/games-home.jpg` | 0,112 720×792 → 400×440 | 7.2K（q50） | 20.1K | — |
| `brand/wbw-icon-64`、`-160` | `WordByWordPrototype/…/AppIcon~ios-marketing.png` | `sips -z` | PNG 2.4K / 4.9K | — | — |
| `brand/favicon-32`、`-dark` | 同上 | 32px，22.4% 圆角透明底；暗版外加 1px `rgb(242 236 230 / .40)` 外圈（node 4×4 超采样绘制） | PNG 1.2K / 1.3K | — | — |
| `se/se-icon-64` | `../SurfEnglish/SurfEnglishWebsite/public/icons/appicon-1024.png` | `sips -z` | PNG 3.0K | — | — |

v1.0 的 `lookup-loupe-*`、`x-ex-*`、`se-feed-window-*`（含真实人名新闻）、`se-icon-96` 已从 `assets/` 删除。

## 8. 对照 05 v1.1 §10 验收的自检

| 验收 | 原型结果 |
|---|---|
| A2 图片规范 | 所有 `<img>` 有 `width`/`height`/`alt`；hero 无位图；同一图每页一次；不含 §7.9 弃用文件（X 截图、SE feed、放大镜） |
| A4 字体 | 0 个字体请求 |
| A5 去模板感 | 机身外无 `#007AFF`、`backdrop-filter`、`.reveal`；`.device` 无 `box-shadow`；无 `<mark>`；无价格卡、无 4 列图标栅格（`check.mjs`） |
| A6 样张 | 无 JS / reduced-motion 显示终态；暂停/重播可用；两轮后停住（实测见 §3）；完整文章（标题 + 署名行 `demo.byline`，见 D10 + 段落 + 后续段落）、无骨架条；en、ja 文字不溢出机身 |
| A9 SE 卡与 CTA 权重 | 高度见 §3（en/ja：1280 361/360 ≤ 420、390 474/448 ≤ 480、320 558/551 ≤ 560，R84）；卡内无徽章，两条文字链接，站点链接锚文本为 SE 核心词短语（R76）；SE 图标 32px，WBW 图标最大 80px；de、ru 不在原型范围 |
| A12 视觉矩阵 | en/ja × 亮/暗 × 1366、en/ja 390 亮已截图目视；所有机身 9:41；暗色下 header、页脚、CTA 图标轮廓清楚；钉不压字；节选图上无标签 |
| A14 分区间距 | 见 §3（同底色相邻 ≤ token） |
| A15 标题层级 | 见 §3 |
| A16 手机首屏 | 红色译文条顶 en y735 / ja y744 ≤ 820 ✓ |
| A17 手机页长 | en 12,947 / ja 12,787 ≤ 13,000 ✓ |
| A18 母题用量 | `.kw` = 1 且在 h1；马赛克 3 处（hero 边线、Plus 表头、最终 CTA；另 2 处为 OG 与 404，不在本页） |
| A19 节选与 AVIF | 全部 AVIF 偶数尺寸；R79 闸门（结构 + Chrome 回解 alpha）通过，辅助的 sips 回解也无异常；节选边缘墨迹 0（σ 提示见 G4） |
| A20 文字系统属性 | `<html data-script>` ✓ |
| A1、A3、A7、A8、A10、A11、A13 | 不在原型范围（PSI、axe、多 locale、ar、OG、通知条） |
