# design-docs 分支说明

这是 **WordByWord 官网 2026 改版的设计文档分支**，与 `main` 没有共同历史（orphan 分支），**不参与网站构建与发布**，也**不要合并进 `main`**。

- 入口：[`docs/redesign-2026/00-README.md`](docs/redesign-2026/00-README.md)
- 内容：现状审计、信息架构与 URL、SEO 与关键词、SurfEnglish 兄弟推荐、视觉设计系统、技术架构、实施计划、文案底稿、可运行的视觉原型（`docs/redesign-2026/prototype/`）、研究报告与裁定（`docs/redesign-2026/appendix/`）
- 分支用途：设计文档的版本记录与备份。网站代码在 `main`（开发）与 `cloudflare-deploy`（生产）分支；旧站冻结在 `legacy-pages` 分支，作为切换前的回滚目标。
- 同步方式：在仓库根目录执行 `bash docs/redesign-2026/ops/sync-design-docs.sh "<提交说明>"`，再 `git push origin design-docs`。脚本只把工作区里的 `docs/redesign-2026/` 写入本分支，不切换分支，不影响 `main`。
- 注意：本仓库是公开仓库，本分支内容同样公开可见。

---

This orphan branch holds the design documents for the 2026 redesign of www.word-by-word.app. It is not built, not deployed, and must not be merged into `main`.
