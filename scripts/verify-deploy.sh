#!/usr/bin/env bash
# Pre-launch acceptance of a deployment: doc 06 §11.4 (groups 1–6, plus 0 = deployed commit), research 09 §7.
#   bash scripts/verify-deploy.sh https://main.wordbyword-web.pages.dev --preview
#   bash scripts/verify-deploy.sh https://www.word-by-word.app --prod
# Expectations are derived from the build of the deployed commit, never hard-coded (ENG-13):
#   .cache/routes.json      published routes → page checks, hreflang counts (doc 02 §6.1), sitemap, Cloudflare 308s
#   .cache/redirects.json   _redirects rules in effect (flags and publish:false applied) → one hop each (doc 02 §5.2.4)
#   .cache/contracts.json   through scripts/contract-test.sh (group 2)
#   src/site.mjs            SITE.url / gaId / pagesProject; LOCALES: hreflang, extra codes, dir, script, content-language
#   scripts/fixtures/requests.tsv   request paths of Q19–Q21 and Q30 (doc 02 §5.2: verify-deploy reads the fixture)
#   dist/_headers, dist/index.html  expected Cache-Control per path rule; whether this build renders GA
# The only constants are Cloudflare's own: 308 for its automatic redirects and 404 for unknown paths.
#
# Usage: bash scripts/verify-deploy.sh <BASE> [--preview|--prod]   (run `node build.mjs` on the deployed commit first)
#   QUERY_PRESERVED=1 (default since M1-03 measured query preservation on CF, 2026-10-06): a redirect that drops the
#   query string is a FAIL; 0 downgrades it to a WARN (doc 02 §5.3-6).
#   A BASE on 127.0.0.1/localhost (scripts/serve.mjs) reports as SKIP what only the real edge can answer: the
#   deployed-commit stamp, the preview X-Robots-Tag (unless serve.mjs runs with --emulate-host <x>.<project>.pages.dev),
#   and the --prod server header and http → https.
# Exit status 1 on any FAIL (2 on usage errors). Go/No-Go: 0 FAIL and a note for every WARN (doc 07 §6.1).
set -u
ROOT=$(cd "$(dirname "$0")/.." && pwd)
usage() { echo "usage: [QUERY_PRESERVED=0|1] bash scripts/verify-deploy.sh <BASE> [--preview|--prod]" >&2; exit 2; }
B=${1:-}; [ -n "$B" ] || usage
B=${B%/}; shift
MODE=preview
for a in "$@"; do case "$a" in --preview) MODE=preview ;; --prod) MODE=prod ;; *) usage ;; esac; done
QP=${QUERY_PRESERVED:-1}; case "$QP" in 0 | 1) ;; *) usage ;; esac
case "$B" in
  http://127.* | http://localhost | http://localhost:* | http://\[::1\]* | http://0.0.0.0* | http://*.localhost | http://*.localhost:*) LOCAL=1 ;;
  *) LOCAL=0 ;;
esac
for f in routes redirects contracts; do
  [ -f "$ROOT/.cache/$f.json" ] || { echo "missing .cache/$f.json: run node build.mjs on the deployed commit first" >&2; exit 2; }
done
TMP=$(mktemp -d "${TMPDIR:-/tmp}/verify-deploy.XXXXXX"); trap 'rm -rf "$TMP"' EXIT
: > "$TMP/status"

# ———————————————— expectations: one tab-separated line per check ("-" = empty) ————————————————
cat > "$TMP/plan.mjs" <<'JS'
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.argv[2];
const cache = (f) => JSON.parse(readFileSync(join(root, '.cache', `${f}.json`), 'utf8'));
const read = (f) => (existsSync(join(root, f)) ? readFileSync(join(root, f), 'utf8') : '');
const routes = cache('routes'), rules = cache('redirects'), contracts = cache('contracts');
const { SITE, LOCALES } = await import(pathToFileURL(join(root, 'src/site.mjs')).href);
const out = (...f) => console.log(f.map((x) => (x === '' || x == null ? '-' : x)).join('\t'));
const group = (title) => out('group', title);
const loc = (code) => LOCALES.find((l) => l.code === code);
const published = new Set(routes.map((r) => r.publicUrl));
const homeLocales = new Set(routes.filter((r) => r.page === 'home').map((r) => r.locale)); // publish is decided by the build
const contractIds = new Set(contracts.map((c) => c.id));
// CF pattern → RegExp (`*` = the splat, captured; `:name` = one segment)
const pattern = (p) => new RegExp(`^${p.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('(.*)').replace(/:\w+/g, '[^/]+')}$`);
const compiled = rules.map((q) => ({ ...q, re: pattern(q.from) }));
const ruleFor = (path) => { // first match wins, :splat filled in
  for (const q of compiled) { const m = q.re.exec(path); if (m) return { ...q, to: q.to.replace(':splat', m[1] ?? '') }; }
  return null;
};
const fixture = (id) => {
  const row = read('scripts/fixtures/requests.tsv').split('\n').find((l) => l.split('\t')[0] === id);
  if (!row) { out('fail', `scripts/fixtures/requests.tsv has no ${id} row`); return []; }
  return [...row.split('\t')[1].matchAll(/`(?:GET |HEAD )?(\/[^`\s]*)`/g)].map((m) => m[1]);
};
const hopOr = (label, path, otherwise) => { // a path that some rule catches is tested as that rule
  const m = ruleFor(path);
  if (m) out('hop', `${label} ${m.id}`, path, m.code, m.to, published.has(m.to) ? 1 : 0); else otherwise();
};

out('origin', SITE.url, SITE.pagesProject);

group('0) deployment under test');
out('stamp');

group('1) pages: status, robots, canonical, hreflang count, language (doc 06 §11.4-1; R47, R49, R60)');
for (const r of routes) {
  if (r.page === '404' || contractIds.has(r.page)) continue; // 404 → group 4, contracts → group 2
  const l = loc(r.locale);
  const members = routes.filter((m) => m.page === r.page && m.indexable);
  // HL-1…HL-4, HL-7, HL-11: every indexable member + its extra codes (pt) + x-default when en is a member; 1 member → none
  const alternates = r.alternates ?? (r.indexable && members.length > 1
    ? members.reduce((n, m) => n + 1 + (loc(m.locale).hreflangExtra?.length ?? 0), 0) + (members.some((m) => m.locale === 'en') ? 1 : 0)
    : 0);
  out('page', r.publicUrl, r.page, r.indexable ? 1 : 0, alternates, l.hreflang, l.dir, l.script, l.contentLanguage);
}

group('2) contract URLs: scripts/contract-test.sh (doc 06 §9.3, Q01–Q14)');
out('contract');

group('3) _redirects: every static rule is one hop to a published 200 page; splat samples (Q06–Q11, Q15–Q21, Q32)');
for (const q of rules) {
  if (q.code === 200 || q.from.includes('*') || q.from.startsWith('/legal/')) continue; // rewrites and experiment L: group 2
  out('hop', q.id, q.from, q.code, q.to, published.has(q.to) ? 1 : 0);
}
const splat = (label, path) => {
  const m = ruleFor(path);
  if (!m) return out('fail', `${label} ${path}: no _redirects rule matches (requests.tsv vs .cache/redirects.json)`);
  out('splat', label === m.id ? label : `${label} ${m.id}`, path, m.code, m.to, published.has(m.to) ? 200 : 404); // no 2nd mapping (§5.3-9)
};
for (const q of rules.filter((x) => x.from.endsWith('/*'))) { // sample: a published non-home page under the target, else about/
  const base = q.to.replace(':splat', '');
  const page = routes.find((r) => r.page !== 'home' && r.publicUrl.endsWith('/') && r.publicUrl.startsWith(base) && r.publicUrl !== base);
  splat(q.id, q.from.slice(0, -1) + (page ? page.publicUrl.slice(base.length) : 'about/'));
}
for (const id of ['Q19', 'Q20', 'Q21']) for (const path of fixture(id)) splat(id, path);

group('4) Cloudflare automatic 308s, case sensitivity, retired and unpublished URLs (Q15, Q16, Q22–Q30, Q32)');
const dirs = routes.map((r) => r.publicUrl).filter((u) => u !== '/' && u.endsWith('/'));
for (const u of dirs) for (const src of [u.slice(0, -1), `${u}index.html`]) if (!ruleFor(src)) out('auto', src, u, 1);
if (!ruleFor('/index.html')) out('auto', '/index.html', '/', 1); // Q15 with indexHtmlRule off
if (!ruleFor('/index')) out('auto', '/index', '/', 0);           // Q16 with indexHtmlRule off: unverified → WARN only
if (dirs.length) out('autoq', dirs[0].slice(0, -1), dirs[0]);
for (const r of routes.filter((x) => x.page === 'home')) {      // Q22/Q23: /zh-Hans/ is not /zh-hans/
  const cased = `/${loc(r.locale).hreflang}/`;
  if (cased === r.publicUrl || cased.toLowerCase() !== r.publicUrl.toLowerCase()) continue;
  const m = ruleFor(cased);
  out('cased', r.publicUrl, cased, m ? m.code : 404, m ? m.to : '-');
}
for (const path of fixture('Q30')) hopOr('Q30', path, () => out('gone', 'Q30', path));
for (const l of LOCALES) if (l.path && !homeLocales.has(l.code)) hopOr(`Q32 ${l.code}`, `/${l.path}/`, () => out('gone', `Q32 ${l.code}`, `/${l.path}/`));

group('5) headers (doc 06 §3.6.4, §11.4-5)');
out('htmlcache', '/');
out('nosniff', '/');
const files = [];
(function walk(dir, rel) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(join(dir, e.name), `${rel}/${e.name}`); else files.push(`${rel}/${e.name}`);
  }
})(join(root, 'dist'), '');
const hrules = []; // path rules of dist/_headers with their Cache-Control values (host rules kept as separators only)
for (const raw of read('dist/_headers').split('\n')) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  if (/^([^\s]+:\/\/|\/)/.test(line)) { hrules.push({ path: line, re: line.startsWith('/') ? pattern(line) : null, cc: [] }); continue; }
  const m = /^cache-control\s*:(.*)$/i.exec(line);
  if (m && hrules.length) hrules.at(-1).cc.push(m[1].trim());
}
const ccRules = hrules.filter((h) => h.re && h.cc.length);
for (const h of ccRules) { // one sample file per rule; expected = what CF sends (every matching rule appends)
  const sample = files.find((f) => h.re.test(f) && !f.endsWith('.html') && !f.startsWith('/_'));
  if (!sample) { out('skip', `Cache-Control of ${h.path}: no file of this build matches`); continue; }
  const values = ccRules.filter((x) => x.re.test(sample)).flatMap((x) => x.cc);
  out('cache', h.path, sample, values.join(', '), values.length, h.path === '/assets/*' ? 'immutable' : '-');
}
out('robots-header', '/');
out('server', '/');
out('https');

group('6) sitemap.xml, robots.txt, favicon, GA (doc 06 §11.4-6, doc 02 §6.7–6.8, Q31)');
out('sitemap', routes.filter((r) => r.indexable).map((r) => r.publicUrl).join(' '), routes.filter((r) => !r.indexable).map((r) => r.publicUrl).join(' '));
out('robots', `${SITE.url}/sitemap.xml`);
if (existsSync(join(root, 'dist/favicon.ico'))) out('status', '/favicon.ico', 200);
out('ga', SITE.gaId, SITE.gaId && read('dist/index.html').includes(SITE.gaId) ? 1 : 0);
JS
node "$TMP/plan.mjs" "$ROOT" > "$TMP/plan.tsv" || { echo "could not derive expectations from .cache/*.json" >&2; exit 2; }

# ———————————————— checks ————————————————
NP=0; NW=0; NF=0; NS=0; C=""; PROJECT=""
pass() { NP=$((NP + 1)); printf '  PASS  %s\n' "$*"; }
warn() { NW=$((NW + 1)); printf '  WARN  %s\n' "$*"; }
fail() { NF=$((NF + 1)); printf '  FAIL  %s\n' "$*"; }
skip() { NS=$((NS + 1)); printf '  SKIP  %s\n' "$*"; }
abs()   { case "$1" in http://* | https://*) printf '%s' "$1" ;; *) printf '%s%s' "$B" "$1" ;; esac; }
get()   { curl -s -D "$TMP/h" -o "$TMP/b" -w '%{http_code} %{redirect_url}' "$1"; } # → $TMP/h, $TMP/b
first() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$1" | sed 's/ $//'; } # first hop only
hdr()   { tr -d '\r' < "$TMP/h" | grep -i "^$1:" | sed 's/^[^:]*:[[:space:]]*//' | paste -sd'|' -; }
status_of() { # path → status of one GET, cached (many rules share a target)
  local s; s=$(awk -v p="$1" '$1 == p { print $2; exit }' "$TMP/status")
  if [ -z "$s" ]; then s=$(curl -s -o /dev/null -w '%{http_code}' "$(abs "$1")"); printf '%s %s\n' "$1" "$s" >> "$TMP/status"; fi
  printf '%s' "$s"
}

check_stamp() { # preview builds publish /__build.json (build.mjs); production does not
  local dep head
  curl -s -o "$TMP/build.json" "$B/__build.json"
  dep=$(tr -d ' \n' < "$TMP/build.json" | grep -o '"commit":"[0-9a-f]*"' | cut -d'"' -f4)
  if [ -z "$dep" ]; then skip "no /__build.json (production branch or local build): deployed commit not compared"; return; fi
  head=$(git -C "$ROOT" rev-parse HEAD 2>/dev/null)
  if [ -z "$head" ]; then skip "deployed commit ${dep:0:12}; no local git HEAD to compare with"
  elif [ "${head#"$dep"}" != "$head" ] || [ "${dep#"$head"}" != "$dep" ]; then pass "deployed commit ${dep:0:12} = local HEAD, .cache describes this deployment"
  else fail "deployed commit ${dep:0:12} ≠ local HEAD ${head:0:12}: build .cache from the deployed commit (doc 06 §11.1)"; fi
}

check_page() { # url page indexable alternates lang dir script content-language
  local url=$1 id=$2 idx=$3 nalt=$4 lang=$5 dir=$6 script=$7 cl=$8 code loc e="" robots can n html at xr
  read -r code loc <<EOF
$(get "$B$url")
EOF
  if [ "$code" != 200 ] || [ -n "$loc" ]; then fail "$url → $code${loc:+ $loc} (expected 200)"; return; fi
  robots=$(grep -o '<meta name="robots" content="[^"]*"' "$TMP/b" | head -n 1 | sed 's/.*content="//;s/"$//')
  can=$(grep -o '<link rel="canonical" href="[^"]*"' "$TMP/b" | sed 's/.*href="//;s/"$//' | paste -sd' ' -)
  if [ "$idx" = 1 ]; then
    case "$robots" in index*) ;; *) e="$e; robots \"$robots\", expected index,…" ;; esac
    [ "$can" = "$C$url" ] || e="$e; canonical [$can], expected $C$url"
  else
    case "$robots" in noindex*) ;; *) e="$e; robots \"$robots\", expected noindex" ;; esac
    [ -z "$can" ] || e="$e; canonical $can on a noindex page (R49)"
  fi
  case "$robots" in *nofollow*) e="$e; robots contains nofollow" ;; esac
  n=$(grep -o '<link rel="alternate" hreflang=' "$TMP/b" | wc -l | tr -d ' ') # <link> only, not the switcher's <a hreflang>
  [ "$n" = "$nalt" ] || e="$e; $n <link rel=\"alternate\" hreflang>, expected $nalt"
  html=$(grep -o '<html[^>]*>' "$TMP/b" | head -n 1)
  for at in "lang=\"$lang\"" "dir=\"$dir\"" "data-script=\"$script\""; do
    case "$html" in *" $at"*) ;; *) e="$e; <html> lacks $at" ;; esac
  done
  grep -qF "<meta http-equiv=\"content-language\" content=\"$cl\">" "$TMP/b" || e="$e; no content-language meta \"$cl\""
  grep -qF "data-page=\"$id\"" "$TMP/b" || e="$e; no data-page=\"$id\""
  grep -q 'pages\.dev' "$TMP/b" && e="$e; body mentions pages.dev"
  [ -z "$(hdr content-language)" ] || e="$e; Content-Language response header (R47)"
  xr=$(hdr x-robots-tag)
  [ "$MODE" = prod ] && [ -n "$xr" ] && e="$e; X-Robots-Tag: $xr on production"
  if [ -n "$e" ]; then fail "$url${e}"; return; fi
  if [ "$idx" = 1 ]; then idx="index, self-canonical"; else idx="noindex, no canonical"; fi
  pass "$url 200, $idx, $n hreflang links, lang=$lang dir=$dir script=$script"
}

check_contract() {
  local out rc summary
  out=$(bash "$ROOT/scripts/contract-test.sh" "$B" $([ "$MODE" = prod ] && echo --prod) < /dev/null 2>&1); rc=$?
  printf '%s\n' "$out" | grep -E '^(FAIL|WARN)' | sed 's/^/        /'
  NW=$((NW + $(printf '%s\n' "$out" | grep -c '^WARN')))
  summary=$(printf '%s\n' "$out" | grep -E '^[0-9]+ pass' | tail -n 1)
  if [ "$rc" = 0 ]; then pass "contract-test: ${summary}"; else fail "contract-test exit $rc: ${summary:-see output above}"; fi
}

check_hop() { # label from code to published — requested with a query to see whether it survives
  local id=$1 from=$2 code=$3 to=$4 pub=$5 q='?utm_source=t' r want ts
  case "$to" in *\?*) q='' ;; esac # a target with its own query replaces the request's (CF)
  r=$(first "$B$from$q"); want="$code $(abs "$to")"
  if [ "$r" != "$want$q" ] && { [ -z "$q" ] || [ "$r" != "$want" ]; }; then fail "$id $from$q → $r (expected $want$q)"; return; fi
  ts=$(status_of "$to")
  if [ "$ts" != 200 ]; then fail "$id $from → $code $to, which returns $ts (the target must be 200: one hop)"; return; fi
  if [ "$pub" != 1 ]; then fail "$id $from → $to: the target is not a published route (Q17)"; return; fi
  if [ "$r" = "$want$q" ]; then pass "$id $from → $code $to"
  elif [ "$QP" = 1 ]; then fail "$id $from → $code $to drops the query string (QUERY_PRESERVED=1)"
  else warn "$id $from → $code $to drops the query string (QUERY_PRESERVED=0: record it in doc 02 §5.3-6)"; fi
}

check_splat() { # label path code to final-status: first hop exact, then the target's own status
  local r want ts; r=$(first "$B$2"); want="$3 $(abs "$4")"
  if [ "$r" != "$want" ]; then fail "$1 $2 → $r (expected $want)"; return; fi
  ts=$(status_of "$4")
  if [ "$ts" = "$5" ]; then pass "$1 $2 → $3 $4 ($ts)"; else fail "$1 $2 → $3 $4, which returns $ts (expected $5)"; fi
}

check_auto() { # source target strict — Cloudflare's own pretty-URL redirect (F24)
  local r want; r=$(first "$B$1"); want="308 $(abs "$2")"
  if [ "$r" = "$want" ]; then pass "$1 → 308 $2 (Cloudflare automatic)"
  elif [ "$3" = 1 ]; then fail "$1 → $r (expected $want, Cloudflare's automatic redirect)"
  else warn "$1 → $r (expected $want; unverified Cloudflare behaviour, doc 02 Q16)"; fi
}

check_autoq() { # source target — the automatic 308 keeps the query (research 09 §3.2)
  local q='?utm_source=t' r want; r=$(first "$B$1$q"); want="308 $(abs "$2")"
  if [ "$r" = "$want$q" ]; then pass "$1$q → 308 $2$q (query kept)"
  elif [ "$r" != "$want" ]; then fail "$1$q → $r (expected $want$q)"
  elif [ "$QP" = 1 ]; then fail "$1$q → $r drops the query string (QUERY_PRESERVED=1)"
  else warn "$1$q → $r drops the query string (QUERY_PRESERVED=0)"; fi
}

check_cased() { # lower cased code target
  local s r want
  s=$(status_of "$1"); r=$(first "$B$2")
  if [ "$s" != 200 ]; then fail "Q22 $1 → $s: must stay 200 (a 301 means _redirects ignores case: set experimentC off now)"; return; fi
  if [ "$3" = 404 ]; then
    [ "${r%% *}" = 404 ] || { fail "Q23 $2 → $r (expected 404 while experiment C is off)"; return; }
  else
    want="$3 $(abs "$4")"; [ "$r" = "$want" ] || { fail "Q23 $2 → $r (expected $want)"; return; }
  fi
  pass "Q22/Q23 $1 200, $2 → $r (case-sensitive, no loop)"
}

check_gone() { # label path — must be our 404 page with status 404, not a soft 404
  local code loc
  read -r code loc <<EOF
$(get "$B$2")
EOF
  if [ "$code" = 404 ] && grep -qF 'data-page="404"' "$TMP/b"; then pass "$1 $2 → 404, custom 404 page"
  elif [ "$code" = 404 ]; then fail "$1 $2 → 404 without data-page=\"404\" (not our 404.html)"
  elif [ "$code" = 200 ]; then fail "$1 $2 → 200: soft 404 (dist/404.html missing? CF then serves index.html, doc 02 §5.5-5)"
  else fail "$1 $2 → $code${loc:+ $loc} (expected 404)"; fi
}

check_htmlcache() {
  local v; get "$B$1" > /dev/null; v=$(hdr cache-control)
  case "$v" in *max-age=0*) pass "$1 Cache-Control: $v (HTML revalidates)" ;; *) fail "$1 Cache-Control \"$v\": HTML must keep max-age=0" ;; esac
}

check_nosniff() {
  local v; get "$B$1" > /dev/null; v=$(hdr x-content-type-options)
  if [ "$v" = nosniff ]; then pass "$1 X-Content-Type-Options: nosniff"; else fail "$1 X-Content-Type-Options \"$v\" (expected one nosniff)"; fi
}

check_cache() { # rule sample expected count required-token
  local code v; code=$(get "$B$2" | cut -d' ' -f1); v=$(hdr cache-control)
  if [ "$4" != 1 ]; then fail "$2 matches $4 _headers rules that set Cache-Control: CF would send \"$3\" (set it once)"
  elif [ "$code" != 200 ]; then fail "$2 → $code (sample file for $1: is the deployment from this commit?)"
  elif [ "$v" != "$3" ]; then fail "$2 Cache-Control \"$v\", expected \"$3\" from $1 (joined values?)"
  elif [ "$5" != - ] && [[ "$v" != *"$5"* ]]; then fail "$2 Cache-Control \"$v\" lacks $5 ($1)"
  else pass "$2 Cache-Control: $v ($1)"; fi
}

check_robots_header() {
  local v; get "$B$1" > /dev/null; v=$(hdr x-robots-tag)
  if [ "$MODE" = prod ]; then
    if [ -z "$v" ]; then pass "$1 no X-Robots-Tag (production)"; else fail "$1 X-Robots-Tag: $v on production (doc 06 §3.6.4)"; fi
  elif [[ "$v" == *noindex* ]]; then pass "$1 X-Robots-Tag: $v (preview)"
  elif [ "$LOCAL" = 1 ]; then skip "$1 preview X-Robots-Tag: a local host matches no pages.dev rule (serve.mjs --emulate-host main.$PROJECT.pages.dev emulates it)"
  else fail "$1 X-Robots-Tag \"$v\": a preview must send noindex (doc 02 §6.8)"; fi
}

check_server() {
  local v
  [ "$MODE" = prod ] || return 0
  if [ "$LOCAL" = 1 ]; then skip "server: cloudflare (needs the real edge)"; return; fi
  get "$B$1" > /dev/null; v=$(hdr server)
  if [ "$v" = cloudflare ]; then pass "server: cloudflare"; else fail "server \"$v\", expected cloudflare (DNS not on Pages yet?)"; fi
}

check_https() {
  local r
  [ "$MODE" = prod ] || return 0
  case "$B" in https://*) ;; *) skip "http → https: BASE is not https"; return ;; esac
  r=$(first "http://${B#https://}/")
  case "$r" in 30[1278]" https://"*) pass "http://${B#https://}/ → $r" ;; *) fail "http://${B#https://}/ → $r (expected a redirect to https)" ;; esac
}

check_sitemap() { # indexable-urls noindex-urls (space separated, "-" = none)
  local code n want=0 e="" u
  code=$(curl -s -o "$TMP/sitemap.xml" -w '%{http_code}' "$B/sitemap.xml")
  [ "$code" = 200 ] || { fail "/sitemap.xml → $code"; return; }
  for u in $1; do [ "$u" = - ] && continue; want=$((want + 1)); grep -qF "<loc>$C$u</loc>" "$TMP/sitemap.xml" || e="$e; missing $u"; done
  for u in $2; do [ "$u" = - ] && continue; grep -qF "<loc>$C$u</loc>" "$TMP/sitemap.xml" && e="$e; lists noindex $u (R49)"; done
  n=$(grep -o '<loc>' "$TMP/sitemap.xml" | wc -l | tr -d ' ')
  [ "$n" = "$want" ] || e="$e; $n <loc>, expected $want"
  if [ -z "$e" ]; then pass "/sitemap.xml 200, exactly the $want indexable routes"; else fail "/sitemap.xml${e}"; fi
}

check_robots() { # expected Sitemap URL
  local code; code=$(curl -s -o "$TMP/robots.txt" -w '%{http_code}' "$B/robots.txt")
  if [ "$code" = 200 ] && grep -qF "Sitemap: $1" "$TMP/robots.txt"; then pass "/robots.txt 200, Sitemap: $1"
  else fail "/robots.txt → $code, must contain \"Sitemap: $1\""; fi
}

check_status() { local s; s=$(curl -s -o /dev/null -w '%{http_code}' "$B$1"); if [ "$s" = "$2" ]; then pass "$1 $s"; else fail "$1 → $s (expected $2)"; fi; }

check_ga() { # id rendered-by-this-build
  if [ "$1" = - ]; then skip "GA: SITE.gaId is not set"
  elif [ "$2" != 1 ]; then warn "GA $1: this build does not render the tag yet (doc 06 §8.1); checked once dist/index.html has it"
  elif curl -s "$B/" | grep -qF "$1"; then pass "GA $1 on /"
  else fail "GA $1 missing on / although this build renders it"; fi
}

echo "verify-deploy  $B  --$MODE  QUERY_PRESERVED=$QP  $(date -u +%FT%TZ)"
[ "$LOCAL" = 1 ] && echo "local base: scripts/serve.mjs only approximates Cloudflare; the CF preview run is the acceptance"
while IFS=$'\t' read -r -u 3 kind a b c d e f g h; do
  case "$kind" in
    origin) C=$a; PROJECT=$b ;;
    group) printf '\n== %s\n' "$a" ;;
    stamp) check_stamp ;;
    page) check_page "$a" "$b" "$c" "$d" "$e" "$f" "$g" "$h" ;;
    contract) check_contract ;;
    hop) check_hop "$a" "$b" "$c" "$d" "$e" ;;
    splat) check_splat "$a" "$b" "$c" "$d" "$e" ;;
    auto) check_auto "$a" "$b" "$c" ;;
    autoq) check_autoq "$a" "$b" ;;
    cased) check_cased "$a" "$b" "$c" "$d" ;;
    gone) check_gone "$a" "$b" ;;
    htmlcache) check_htmlcache "$a" ;;
    nosniff) check_nosniff "$a" ;;
    cache) check_cache "$a" "$b" "$c" "$d" "$e" ;;
    robots-header) check_robots_header "$a" ;;
    server) check_server "$a" ;;
    https) check_https ;;
    sitemap) check_sitemap "$a" "$b" ;;
    robots) check_robots "$a" ;;
    status) check_status "$a" "$b" ;;
    ga) check_ga "$a" "$b" ;;
    skip) skip "$a" ;;
    fail) fail "$a" ;;
  esac
done 3< "$TMP/plan.tsv"

printf '\n%d pass, %d warn, %d fail, %d skip  (%s --%s%s)\n' "$NP" "$NW" "$NF" "$NS" "$B" "$MODE" "$([ "$LOCAL" = 1 ] && printf ', local')"
if [ "$NF" -gt 0 ]; then echo "FAILED"; exit 1; fi
if [ "$NW" -gt 0 ]; then echo "PASS WITH WARNINGS (each WARN needs a note in the Go/No-Go record)"; else echo "ALL PASS"; fi
