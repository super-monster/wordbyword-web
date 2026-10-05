#!/usr/bin/env bash
# 把工作区 docs/redesign-2026/ 的当前内容提交到孤立分支 design-docs。
# 不切换分支、不改动当前分支的索引与工作区；推送需另行执行 git push origin design-docs。
# 用法：bash docs/redesign-2026/ops/sync-design-docs.sh "docs: <说明>"
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
BRANCH=design-docs
MSG="${1:-docs: sync redesign-2026 design docs}"

TMP_INDEX="$(mktemp)"
trap 'rm -f "$TMP_INDEX"' EXIT
export GIT_INDEX_FILE="$TMP_INDEX"

git read-tree --empty
git add -f -- docs/redesign-2026 ':(exclude,glob)**/.DS_Store'
blob="$(git hash-object -w docs/redesign-2026/ops/BRANCH-README.md)"
git update-index --add --cacheinfo "100644,${blob},README.md"
tree="$(git write-tree)"

parent="$(git rev-parse -q --verify "refs/heads/${BRANCH}" || true)"
if [ -n "$parent" ] && [ "$(git rev-parse "${parent}^{tree}")" = "$tree" ]; then
  echo "design-docs: no changes"
  exit 0
fi

commit="$(printf '%s\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n' "$MSG" \
  | git commit-tree "$tree" ${parent:+-p "$parent"})"
git update-ref "refs/heads/${BRANCH}" "$commit"
echo "design-docs -> ${commit}"
