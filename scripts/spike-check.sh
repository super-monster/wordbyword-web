#!/usr/bin/env bash
# M1-03 Cloudflare Pages spike: probe a deployment and print one line per experiment (doc 02 §5.2.4, §5.4; doc 06 §10.2-2).
# Usage: bash scripts/spike-check.sh https://<branch>.wordbyword-web.pages.dev [--spike]
#   --spike  also run the synthetic checks that exist only on the spike/lc branch (headers join, nested 404, L/C groups)
set -uo pipefail
B="${1:?base url}"; SPIKE="${2:-}"
code() { curl -s -o /dev/null -w '%{http_code}' "$B$1"; }
loc()  { curl -s -o /dev/null -w '%{redirect_url}' "$B$1" | sed "s#^$B##"; }
hop()  { printf '%s %s' "$(code "$1")" "$(loc "$1")"; }
hdr()  { curl -sI "$B$1" | tr -d '\r' | grep -i "^$2:" | sed 's/^[^:]*: *//' | paste -sd'|' -; }
page() { curl -s "$B$1" | grep -o 'data-page="[^"]*"' | head -1; }
canon(){ curl -s "$B$1" | grep -o '<link rel="canonical" href="[^"]*"' | sed 's/.*href="//;s/"$//'; }
row()  { printf '%-34s %s\n' "$1" "$2"; }

echo "== $B  $(date -u +%FT%TZ)"
row "build stamp"                "$(curl -s "$B/__build.json" | tr -d '\n ' )"
echo "-- contracts (C-1, Q01–Q05)"
for u in /privacy.html /support.html /chrome-extension/privacy.html; do
  row "$u" "$(hop "$u")  $(page "$u")  canonical=$(canon "$u")  robots=[$(hdr "$u" x-robots-tag)]"
done
row "/privacy.html?from=app"     "$(hop '/privacy.html?from=app')"
row "HEAD /privacy.html"         "$(curl -sI -o /dev/null -w '%{http_code}' "$B/privacy.html")"
row "body(/privacy.html)=/legal/privacy/" "$( [ "$(curl -s "$B/privacy.html" | md5)" = "$(curl -s "$B/legal/privacy/" | md5)" ] && echo SAME || echo DIFF )"
echo "-- contract variants (Q06–Q11)"
for u in /privacy /privacy/ /support /support/ /chrome-extension/privacy /chrome-extension/privacy/; do row "$u" "$(hop "$u")"; done
echo "-- /legal/* (Q12–Q14)"
for u in /legal/privacy/ /legal/support/ /legal/extension-privacy/; do row "$u" "$(hop "$u")"; done
echo "-- index rule & CF automatic 308 (Q15, Q16, Q24–Q29)"
for u in /index.html /index /ja /ja/index.html /about /chrome-extension /zh-hans/chrome-extension /chrome-extension/index.html; do row "$u" "$(hop "$u")"; done
echo "-- legacy & aliases (sample of Q17–Q21)"
for u in /ja-top.html /ja-top /cn-top.html /tw-top /pt-top.html /en-top.html /en /en/ /zh /cn/ /zh-tw /pt/ /en/about/ /zh/chrome-extension/ /cn/ja-top.html; do row "$u" "$(hop "$u")"; done
row "/ja-top.html?utm_source=t (Q18)" "$(hop '/ja-top.html?utm_source=t')"
echo "-- case sensitivity (Q22, Q23)"
for u in /zh-hans/ /zh-Hans/ /pt-BR/ /ZH-HANS/; do row "$u" "$(hop "$u")"; done
echo "-- 404s (Q30)"
for u in /backup/top.html /README.md /CNAME /img/Screenshot-1.png /wbw_logo.png /css/style.css /jp/ /definitely-missing-xyz; do row "$u" "$(hop "$u")  $(page "$u")"; done
echo "-- headers"
row "/ x-robots-tag"             "[$(hdr / x-robots-tag)]"
row "/ cache-control"            "[$(hdr / cache-control)]"
row "/ strict-transport-security" "[$(hdr / strict-transport-security)]"
row "/robots.txt"                "$(code /robots.txt)"
row "/sitemap.xml"               "$(code /sitemap.xml) urls=$(curl -s "$B/sitemap.xml" | grep -c '<loc>')"

if [ "$SPIKE" = "--spike" ]; then
  echo "-- spike/lc synthetic checks"
  row "/spike-h/x/ x-spike (join?)" "[$(hdr /spike-h/x/ x-spike)]"
  row "/assets/spike.txt cache"    "[$(hdr /assets/spike.txt cache-control)]"
  row "/spike-404/missing"         "$(code /spike-404/missing)  $(page /spike-404/missing)"
  row "/ja/missing (nested 404?)"  "$(code /ja/missing)  $(page /ja/missing)"
  row "preview default robots"     "[$(hdr / x-robots-tag)]  (spike omits our pages.dev rules)"
fi
