/* WordByWord site script · progressive enhancement only (doc 06 §6.1). Ported from the design prototype.
   Without JS (or with prefers-reduced-motion) the page is complete: the sample shows its final frame,
   menus are native <details>, L2 notes sit level with their pins (leader lines are drawn only with JS). */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hasIO = 'IntersectionObserver' in window;

  /* ---- sticky header hairline (05 §5.1) ---- */
  const header = document.querySelector('.site-header');
  const sentinel = document.querySelector('.header-sentinel');
  if (header && sentinel && hasIO) {
    new IntersectionObserver(([e]) => header.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);
  } else if (header) header.classList.add('is-stuck');

  /* ---- <details> menus: Esc / outside click closes, focus back to summary (02 §7.2) ---- */
  const menus = [...document.querySelectorAll('.lang-switch, .nav-menu')];
  document.addEventListener('click', (ev) => {
    for (const d of menus) if (d.open && !d.contains(ev.target)) d.open = false;
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    for (const d of menus) if (d.open) { d.open = false; d.querySelector('summary').focus(); }
  });
  for (const d of menus) d.addEventListener('toggle', () => {
    if (d.open) for (const o of menus) if (o !== d) o.open = false;
  });
  document.querySelectorAll('.nav-menu-panel a').forEach((a) => a.addEventListener('click', () => { a.closest('details').open = false; }));

  /* ---- L2 leader lines: draw once when first seen (05 §5.4.2); lines are CSS, logical, never flipped by JS ---- */
  const spread = document.querySelector('.spread');
  if (spread) {
    if (reduced.matches || !hasIO) spread.classList.add('is-drawn');
    else {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { spread.classList.add('is-drawn'); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(spread);
    }
  }

  /* ---- hero sample (05 §5.2.4) ---- */
  const fig = document.querySelector('.sample');
  if (!fig) return;
  const screen = fig.querySelector('.sample-screen');
  const s1 = fig.querySelector('.s1');
  const word = fig.querySelector('.w');
  const btn = fig.querySelector('.sample-toggle');
  const STATES = ['is-static', 'is-idle', 'is-swiping', 'is-translated', 'is-tapping', 'is-lookup'];
  // 05 v1.1 §5.2.4: a loop starts from the server-rendered final frame (is-static), so there is no flash on load:
  // hold -> idle (card/highlight fade, translation folds, 500ms) -> swipe (900ms, always left -> right, R63)
  // -> translation slides in -> double-tap ripples -> highlight + card -> hold.
  const STEPS = [[1200, 'is-idle'], [1800, 'is-swiping'], [2700, 'is-translated'], [4200, 'is-tapping'], [4800, 'is-lookup']];
  const LOOP_MS = 8200;
  const maxLoops = Number(fig.dataset.loops) || 2;
  let timers = [];
  let loops = 0;
  let playing = false;
  let started = false;

  const set = (cls) => { fig.classList.remove(...STATES); fig.classList.add(cls); };
  const clear = () => { timers.forEach(clearTimeout); timers = []; };

  function place() {
    // anchor cues to the real text boxes (works for any locale / font)
    const sr = screen.getBoundingClientRect();
    if (!sr.width) return;
    const r1 = s1.getClientRects()[0];
    const rw = word.getBoundingClientRect();
    if (r1) {
      screen.style.setProperty('--sx', `${r1.left - sr.left + 14}px`);
      screen.style.setProperty('--sy', `${r1.top - sr.top + r1.height / 2}px`);
    }
    screen.style.setProperty('--tx', `${rw.left - sr.left + rw.width / 2}px`);
    screen.style.setProperty('--ty', `${rw.top - sr.top + rw.height / 2}px`);
  }

  function setButton() {
    if (!btn) return;
    btn.textContent = playing ? btn.dataset.pause : btn.dataset.replay;
  }

  function loop() {
    clear();
    place();
    for (const [t, cls] of STEPS) timers.push(setTimeout(() => set(cls), t));
    timers.push(setTimeout(() => {
      loops += 1;
      if (loops >= maxLoops) stop(); else loop();
    }, LOOP_MS));
  }
  function play() {
    if (reduced.matches) return;
    loops = 0; playing = true; setButton(); loop();
  }
  function stop() {
    clear(); playing = false; set('is-static'); setButton();
  }

  if (reduced.matches || !hasIO) return;     // final frame only; no control needed
  if (btn) {
    btn.classList.add('is-ready');
    btn.addEventListener('click', () => (playing ? stop() : play()));
  }
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !started) { started = true; setTimeout(play, 900); }
    else if (!e.isIntersecting && playing) stop();
  }, { threshold: 0.35 }).observe(fig);
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });
  reduced.addEventListener?.('change', () => { if (reduced.matches) { stop(); btn?.classList.remove('is-ready'); } });
  if ('ResizeObserver' in window) new ResizeObserver(place).observe(screen);
  document.fonts?.ready.then(place);
})();
