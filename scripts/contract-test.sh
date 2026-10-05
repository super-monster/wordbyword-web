#!/usr/bin/env bash
# Contract URL test: doc 06 §9.3, doc 02 §5.4 and §5.2.4 (Q01–Q14; Q15/Q16 are in verify-deploy.sh).
# Expectations come from the build of the deployed commit, never from constants (ENG-03, ENG-13):
#   .cache/contracts.json  id, public, bare, bareSlash, internal, mode (proxy = C-1, file = C-2)
#   .cache/redirects.json  rules in effect: the variant rules (A4–A9, or A5' under C-2) and experiment L
#                          (L is on when a 3xx rule starts at the internal /legal/<id>/ path)
#   .cache/routes.json     indexable per contract: S1 → canonical = contract URL; S0 → noindex, no canonical (R2, R49)
#   src/site.mjs           SITE.url (canonical origin)
# Fields named in doc 06 §9.3 (indexable, experimentL) are used when contracts.json carries them.
#
# Usage: bash scripts/contract-test.sh <BASE> [--prod]
#   --prod  production domain: contract URLs and /legal/* must carry no X-Robots-Tag (R48). Without it the header is
#           only printed: preview hosts carry noindex by design (doc 02 §6.8).
# Run `node build.mjs` on the deployed commit first. Exit status 1 on any FAIL (2 on usage errors).
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd)
B=${1:-}; [ -n "$B" ] || { echo "usage: bash scripts/contract-test.sh <BASE> [--prod]" >&2; exit 2; }
B=${B%/}; shift
PROD=0
for a in "$@"; do case "$a" in --prod) PROD=1 ;; --preview) ;; *) echo "unknown option: $a" >&2; exit 2 ;; esac; done
for f in contracts redirects routes; do
  [ -f "$ROOT/.cache/$f.json" ] || { echo "missing .cache/$f.json: run node build.mjs on the deployed commit first" >&2; exit 2; }
done
TMP=$(mktemp -d "${TMPDIR:-/tmp}/contract-test.XXXXXX"); trap 'rm -rf "$TMP"' EXIT

# ———————————————— expectations (one tab-separated line per check; "-" = empty) ————————————————
cat > "$TMP/plan.mjs" <<'JS'
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const root = process.argv[2];
const cache = (f) => JSON.parse(readFileSync(`${root}/.cache/${f}.json`, 'utf8'));
const contracts = cache('contracts'), rules = cache('redirects'), routes = cache('routes');
const { SITE } = await import(pathToFileURL(`${root}/src/site.mjs`).href);
const out = (...f) => console.log(f.map((x) => (x === '' || x == null ? '-' : x)).join('\t'));
const rule = (from) => rules.find((q) => q.from === from);
// A variant must be a single rule to the spec target (doc 02 §5.2.2); its code comes from the rules in effect.
const variant = (label, from, target) => {
  const q = rule(from);
  if (!q) out('fail', `${label} ${from}: no _redirects rule (expected one hop to ${target})`);
  else if (q.to !== target) out('fail', `${label} ${from}: rule ${q.id} → ${q.to}, expected ${target}`);
  else out('hop', label, from, q.code, q.to);
};
for (const c of contracts) {
  const route = routes.find((r) => r.page === c.id);
  const indexable = typeof c.indexable === 'boolean' ? c.indexable : route?.indexable;
  if (indexable === undefined) { out('fail', `${c.id}: no route in .cache/routes.json`); continue; }
  const L = typeof c.experimentL === 'boolean' ? c.experimentL : (rule(c.internal)?.code ?? 200) !== 200;
  out('info', `${c.id}: ${c.mode === 'file' ? 'C-2 (file)' : 'C-1 (proxy)'}, ${indexable ? 'indexable' : 'S0 noindex'}, experiment L ${L ? 'on' : 'off'}`);
  if (c.mode === 'file') {                       // C-2: CF's automatic .html → extensionless 308 (F24, doc 02 §5.4)
    const canon = indexable ? SITE.url + c.bare : '-';
    out('hop', 'C-2', c.public, 308, c.bare);
    out('page', 'C-2', c.bare, c.id, canon);
    variant('C-2', c.bareSlash, c.bare);
    out('warn', `${c.id} runs in C-2: ${c.public} is a 308 to ${c.bare}; put the final URL into App Store Connect / CWS with the next release (doc 06 §9.2)`);
    continue;
  }
  const canon = indexable ? SITE.url + c.public : '-';
  out('page', 'Q01-Q03', c.public, c.id, canon);
  out('page', 'Q04', `${c.public}?from=app`, c.id, canon);
  out('head', 'Q05', c.public);
  variant('Q06-Q11', c.bare, c.public);
  variant('Q06-Q11', c.bareSlash, c.public);
  if (L) variant('Q12-Q14', c.internal, c.public);
  else { out('page', 'Q12-Q14', c.internal, c.id, canon); out('same', 'Q12-Q14', c.public, c.internal); }
}
JS
node "$TMP/plan.mjs" "$ROOT" > "$TMP/plan.tsv" || { echo "could not derive expectations from .cache/*.json" >&2; exit 2; }

# ———————————————— checks ————————————————
NP=0; NW=0; NF=0
pass() { NP=$((NP + 1)); printf 'PASS  %s\n' "$*"; }
warn() { NW=$((NW + 1)); printf 'WARN  %s\n' "$*"; }
fail() { NF=$((NF + 1)); printf 'FAIL  %s\n' "$*"; }
abs()  { case "$1" in http://* | https://*) printf '%s' "$1" ;; *) printf '%s%s' "$B" "$1" ;; esac; }
hdr()  { tr -d '\r' < "$TMP/h" | grep -i "^$1:" | sed 's/^[^:]*:[[:space:]]*//' | paste -sd'|' -; }

page() { # label path data-page canonical ("-" = S0: noindex and no canonical)
  local label=$1 path=$2 id=$3 canon=$4 code loc e="" robots can xr
  read -r code loc <<EOF
$(curl -s -D "$TMP/h" -o "$TMP/b" -w '%{http_code} %{redirect_url}' "$B$path")
EOF
  if [ "$code" != 200 ] || [ -n "$loc" ]; then fail "$label $path → $code${loc:+ $loc} (expected 200, no Location)"; return; fi
  grep -qF "data-page=\"$id\"" "$TMP/b" || e="$e; body lacks data-page=\"$id\""
  robots=$(grep -o '<meta name="robots" content="[^"]*"' "$TMP/b" | head -n 1 | sed 's/.*content="//;s/"$//')
  can=$(grep -o '<link rel="canonical" href="[^"]*"' "$TMP/b" | sed 's/.*href="//;s/"$//' | paste -sd' ' -)
  if [ "$canon" != - ]; then
    [ "$can" = "$canon" ] || e="$e; canonical [$can], expected $canon"
    case "$robots" in *noindex*) e="$e; robots \"$robots\": a contract page must not be noindex (R48)" ;; esac
  else
    [ -z "$can" ] || e="$e; S0 page has a canonical ($can) (R49)"
    case "$robots" in *noindex*) ;; *) e="$e; S0 page must be noindex, robots \"$robots\" (R2)" ;; esac
  fi
  xr=$(hdr x-robots-tag)
  [ "$PROD" = 1 ] && [ -n "$xr" ] && e="$e; X-Robots-Tag: $xr on production (R48)"
  if [ -n "$e" ]; then fail "$label $path${e}"; return; fi
  if [ "$canon" = - ]; then canon="noindex, no canonical"; else canon="canonical $canon"; fi
  pass "$label $path 200, data-page=$id, $canon${xr:+  [x-robots-tag: $xr]}"
}
hop() { # label path code target: exactly one hop, no redirect following
  local r; r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$B$2" | sed 's/ $//')
  if [ "$r" = "$3 $(abs "$4")" ]; then pass "$1 $2 → $3 $4"; else fail "$1 $2 → $r (expected $3 $(abs "$4"))"; fi
}
head_ok() { # label path
  local c; c=$(curl -s -I -o /dev/null -w '%{http_code}' "$B$2")
  if [ "$c" = 200 ]; then pass "$1 HEAD $2 200"; else fail "$1 HEAD $2 → $c (expected 200)"; fi
}
same() { # label path1 path2: byte-identical bodies (L off: /legal/* is the same file as the contract URL)
  curl -s -o "$TMP/1" "$B$2"; curl -s -o "$TMP/2" "$B$3"
  if cmp -s "$TMP/1" "$TMP/2"; then pass "$1 $3 body identical to $2"; else fail "$1 $3 body differs from $2"; fi
}

echo "contract-test  $B  $(date -u +%FT%TZ)$([ "$PROD" = 1 ] && printf '  --prod')"
while IFS=$'\t' read -r -u 3 kind a b c d; do
  case "$kind" in
    info) echo "-- $a" ;;
    page) page "$a" "$b" "$c" "$d" ;;
    head) head_ok "$a" "$b" ;;
    hop)  hop "$a" "$b" "$c" "$d" ;;
    same) same "$a" "$b" "$c" ;;
    warn) warn "$a" ;;
    fail) fail "$a" ;;
  esac
done 3< "$TMP/plan.tsv"

echo; echo "$NP pass, $NW warn, $NF fail"
if [ "$NF" = 0 ]; then echo "CONTRACT PASS"; exit 0; fi
echo "CONTRACT FAIL → doc 02 §5.4: a failing contract goes to 'file' (C-2) in SITE.contractMode; a failing experiment L goes off; redeploy and re-run"
exit 1
