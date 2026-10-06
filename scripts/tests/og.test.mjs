// OG cards (doc 05 §7.8, doc 06 §7.4): the pure parts of src/templates/og.mjs — copy selection, reused site CSS, card
// markup — and the D-23 contract against the committed assets/og/og.json. Rendering needs macOS + Chrome
// (scripts/og.mjs, R34) and is not exercised here.
// Run: npm test   (node --test scripts/tests/*.test.mjs, one process per file)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfig, loadStrings, expandRoutes } from '../../src/lib/context.mjs';
import { esc, plain } from '../../src/lib/html.mjs';
import { checkOg, ogInputs } from '../../src/lib/validate-dist.mjs';
import { newIssues } from '../../src/lib/validate-util.mjs';
import { ogCard, ogCopy, ogFill, ogSiteCss } from '../../src/templates/og.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const cfg = loadConfig(ROOT);
const { strings } = loadStrings(cfg);
const L = (code) => cfg.LOCALES.find((l) => l.code === code);
const copyOf = (page, code) => ogCopy(page, L(code), strings[code], { f: ogFill({ ...cfg, year: 2026 }, L(code), strings[code]), SITE: cfg.SITE });
const siteCss = () => ogSiteCss(Object.fromEntries(['tokens', 'base', 'demo'].map((n) => [n, readFileSync(join(ROOT, `src/css/${n}.css`), 'utf8')])));

test('ogCopy: the D-23 inputs, one marker phrase (own line after a full stop), platform line, domain', () => {
  const en = copyOf('home', 'en');
  assert.deepEqual(en.inputs, ogInputs('home', L('en'), strings.en));
  assert.equal(en.headline.match(/<span class="kw">/g)?.length, 1);
  assert.match(en.headline, /\.<br><span class="kw">/);
  assert.equal(en.subline, esc(plain(strings.en.meta.ogSubline)));
  assert.equal(en.platform, esc(strings.en.features.find((x) => x.id === 'devices').title));
  assert.equal(en.domain, 'word-by-word.app');
  const ext = copyOf('chrome-extension', 'zh-Hans');
  assert.deepEqual(ext.inputs, ogInputs('chrome-extension', L('zh-Hans'), strings['zh-Hans']));
  assert.doesNotMatch(ext.headline, /<br>/, 'no forced break when the phrase does not follow a full stop');
  assert.equal(ext.platform, 'Chrome · Microsoft Edge');
  assert.doesNotMatch(copyOf('about', 'en').headline, /class="kw"/);
});

test('ogSiteCss: the reused site rules, light theme only', () => {
  const css = siteCss();
  assert.doesNotMatch(css, /prefers-color-scheme|forced-colors|prefers-reduced-motion|\/\*/);
  for (const sel of ['.kw', '.device', '.device-screen', '.ios-status', '.ios-time', 'html:lang(ja)']) {
    assert.match(css, new RegExp(`(^|\\n)${sel.replace(/[.()]/g, '\\$&')}\\s*\\{`), sel);
  }
});

test('ogCard: a standalone document with the site device (9:41) or the extension window', () => {
  const icon = { src: 'file:///icon-160.png' };
  const device = { kind: 'device', key: 'shot/ja/lookup', avif: [{ url: 'file:///lookup-720.avif', w: 720, h: 1468 }],
    fallback: { url: 'file:///lookup-540.jpg', w: 540, h: 1100 }, meta: { statusBg: '#F3F3F4', statusTone: 'dark' } };
  const html = ogCard({ locale: L('ja'), copy: copyOf('home', 'ja'), icon, shot: device, siteCss: siteCss() });
  assert.match(html, /^<!doctype html>\n<html lang="ja" dir="ltr" data-script="cjk">/);
  assert.match(html, /<div class="device device--og" style="--status-bg:#F3F3F4">/);
  assert.match(html, /<span class="ios-time">9:41<\/span>/);
  assert.match(html, /<source type="image\/avif" srcset="file:\/\/\/lookup-720\.avif">/);
  assert.doesNotMatch(html, /loading="lazy"|decoding="async"/, 'the screenshot needs the image in the first frame');
  assert.equal(html.match(/class="kw"/g)?.length, 1);
  const win = ogCard({ locale: L('en'), copy: copyOf('chrome-extension', 'en'), icon,
    shot: { kind: 'window', key: 'ext/common/hero', src: 'file:///hero-1280.avif', w: 1280, h: 800 }, siteCss: siteCss() });
  assert.match(win, /<div class="og-window"><img src="file:\/\/\/hero-1280\.avif" width="1280" height="800" alt="">/);
  assert.doesNotMatch(win, /class="device/);
});

test('assets/og/og.json matches the copy; a changed meta.ogHeadline without `npm run og` fails D-23 (ENG-12)',
  { skip: !existsSync(join(ROOT, 'assets/og/og.json')) && 'assets/og/og.json not generated yet' }, () => {
    const routes = expandRoutes(cfg);
    let i = newIssues();
    checkOg(cfg, strings, routes, { og: false }, i);
    assert.deepEqual(i.error, []);
    const changed = structuredClone(strings);
    changed.en.meta.ogHeadline = `${changed.en.meta.ogHeadline} (edited)`;
    i = newIssues();
    checkOg(cfg, changed, routes, { og: false }, i);
    assert.ok(i.error.some((e) => /^D-23 home-en: copy changed since the OG image was rendered \(headline\)/.test(e)), i.error.join('\n'));
  });
