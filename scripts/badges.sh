#!/usr/bin/env bash
# Official Apple "Download on the App Store" badges, black, one per badge locale (doc 06 §7.4, doc 05 §5.x, I18-15).
# Downloads from Apple Marketing Tools (v2 API, v1 as fallback), checks every file and writes assets/badges/<badge>.svg.
# The badges are used unmodified (Apple's marketing guidelines); build.mjs fingerprints them and sizes them to 40 px.
# Badge locales come from LOCALES[].badge in src/site.mjs (ar and hi use en-us: Apple has no localized badge for them).
#
# Usage: bash scripts/badges.sh            (needs network; re-run only to refresh, then commit assets/badges/)
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT="$ROOT/assets/badges"
V2=https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black
V1=https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black
BADGES=$(cd "$ROOT" && node --input-type=module -e "const { LOCALES } = await import('./src/site.mjs'); console.log([...new Set(LOCALES.map((l) => l.badge))].join(' '))")
TMP=$(mktemp -d "${TMPDIR:-/tmp}/badges.XXXXXX"); trap 'rm -rf "$TMP"' EXIT

fetch() { curl -s -o "$2" -w '%{http_code} %{content_type}' "$1"; } # url file → "code type"
ok() { case "$1" in "200 image/svg+xml"*) return 0 ;; *) return 1 ;; esac; }
sum() { md5 -q "$1" 2>/dev/null || md5sum "$1" | cut -d' ' -f1; }

for b in $BADGES; do
  src=v2; r=$(fetch "$V2/$b" "$TMP/$b.svg")
  ok "$r" || { src=v1; r=$(fetch "$V1/$b" "$TMP/$b.svg"); }
  ok "$r" || { echo "✗ $b: $r from both v2 and v1" >&2; exit 1; }
  grep -q '<svg' "$TMP/$b.svg" && grep -q 'viewBox="' "$TMP/$b.svg" || { echo "✗ $b: not an SVG with a viewBox" >&2; exit 1; }
  echo "$b $src $(wc -c < "$TMP/$b.svg" | tr -d ' ') bytes" >> "$TMP/list"
done

# A localized badge identical to en-us means Apple fell back to English: map that locale to en-us instead (doc 06 §7.4).
EN=$(sum "$TMP/en-us.svg"); same=""
for b in $BADGES; do [ "$b" != en-us ] && [ "$(sum "$TMP/$b.svg")" = "$EN" ] && same="$same $b"; done
if [ -n "$same" ]; then
  echo "✗ identical to en-us (English fallback):$same — set their LOCALES badge to 'en-us' in src/site.mjs, then re-run" >&2
  exit 1
fi

mkdir -p "$OUT"
for b in $BADGES; do cp "$TMP/$b.svg" "$OUT/$b.svg"; done
for f in "$OUT"/*.svg; do n=$(basename "$f" .svg); [[ " $BADGES " == *" $n "* ]] || { rm "$f"; echo "removed unused $n.svg"; }; done
sed 's/^/✓ /' "$TMP/list"
echo "$(echo $BADGES | wc -w | tr -d ' ') badges → assets/badges/"
