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
- 待办：GitHub Pages 发布源切到 `legacy-pages`、勾选 Enforce HTTPS、`legacy-pages` 分支保护；重建后生成 `after.txt` 并比对。
