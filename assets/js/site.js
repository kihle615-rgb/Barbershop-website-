/* ==========================================================================
   Eazy Fade Studio
   Scroll-scrubbed hero + page behaviour. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var smoothstep = function (p, e0, e1) {
    var t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  /* seeded PRNG so the "random" scatter is identical on every load */
  function rng(seed) {
    var s = seed >>> 0;
    return function () { return (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  }

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ======================================================================
     SMALL PAGE BITS (run regardless of hero mode)
     ====================================================================== */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Open / closed, computed in the shop's own timezone, not the visitor's */
  (function openNow() {
    var el = $('#open-now');
    if (!el) return;
    var mins;
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var h = 0, m = 0;
      parts.forEach(function (p) {
        if (p.type === 'hour') h = parseInt(p.value, 10);
        if (p.type === 'minute') m = parseInt(p.value, 10);
      });
      mins = h * 60 + m;
    } catch (e) {
      var d = new Date();
      mins = d.getHours() * 60 + d.getMinutes();
    }
    var open = 10 * 60 + 30, close = 20 * 60;
    var isOpen = mins >= open && mins < close;
    el.dataset.state = isOpen ? 'open' : 'closed';
    el.textContent = isOpen ? '● Open now — until 20:00' : '● Closed — opens 10:30';
  })();

  /* Gallery: a designed empty state until the shop's own photos are dropped in */
  $$('.shot').forEach(function (fig, i) {
    var img = $('img', fig);
    if (!img) return;
    var slots = ['Drop cut-1.jpg here', 'Drop cut-2.jpg here', 'Drop cut-3.jpg here', 'Drop cut-4.jpg here'];
    var grid = fig.parentNode;
    var fail = function () {
      fig.classList.add('is-empty');
      fig.setAttribute('data-slot', slots[i] || 'Photo slot');
      if (grid) grid.classList.add('awaiting');
    };
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail);
  });

  /* Pause every animation while the tab is hidden */
  document.addEventListener('visibilitychange', function () {
    document.body.classList.toggle('paused', document.hidden);
  });

  /* ======================================================================
     SECTION ENTRANCES
     ====================================================================== */
  (function entrances() {
    var groups = $$('.premise, .board, .marks, .lineup, .work, .says, .visit, .foot');
    groups.forEach(function (g) {
      var kids = Array.prototype.filter.call(g.children, function (c) { return c.nodeType === 1; });
      kids.forEach(function (c) { c.classList.add('rv'); });
    });
    if (!('IntersectionObserver' in window)) {
      groups.forEach(function (g) { g.classList.add('in', 'settled'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        /* retire the stagger delays once the entrance has finished */
        setTimeout(function () { e.target.classList.add('settled'); }, 1400);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    groups.forEach(function (g) { io.observe(g); });
  })();

  /* ======================================================================
     THE GUARD RAIL — page progress rendered as a fade, ticked in guard numbers
     ====================================================================== */
  (function rail() {
    var fade = $('.rail__fade');
    var links = $$('.rail__list a');
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var lastScroll = -1, lastActive = -1, queued = false;

    function paint() {
      queued = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      var rounded = Math.round(p * 200) / 200;               /* write only on change */
      if (fade && rounded !== lastScroll) {
        lastScroll = rounded;
        fade.style.setProperty('--scroll', rounded);
      }
      var mid = window.scrollY + window.innerHeight * 0.42;
      var active = -1;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].offsetTop <= mid) active = i;
      }
      if (active !== lastActive) {
        if (lastActive > -1 && links[lastActive]) links[lastActive].removeAttribute('aria-current');
        if (active > -1 && links[active]) links[active].setAttribute('aria-current', 'true');
        lastActive = active;
      }
    }
    function onScroll() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    paint();
  })();

  /* ======================================================================
     THE ONE INTERACTIVE MOMENT — press and hold to line it up
     ====================================================================== */
  var lineUpAPI = { finish: function () {}, reset: function () {} };

  (function lineUp() {
    var section = $('.lineup');
    var btn = $('.hold');
    var art = $('.lineup__art');
    if (!section || !btn || !art) return;

    var p = 0, held = false, raf = null, last = 0, done = false;
    var HOLD_MS = 1500, RELEASE_MS = 900;

    function sizeTrace() {
      art.style.setProperty('--traceW', (art.clientWidth * 0.88 - 10) + 'px');
    }
    sizeTrace();
    addEventListener('resize', sizeTrace);

    function write() {
      var r = Math.round(p * 200) / 200;
      art.style.setProperty('--p', r);
      btn.style.setProperty('--p', r);
    }

    function tick(now) {
      var dt = Math.min(100, now - (last || now));
      last = now;
      p += (held ? dt / HOLD_MS : -dt / RELEASE_MS);
      p = clamp(p, 0, 1);
      if (p >= 1 && !done) {
        done = true;
        section.classList.add('is-done');
        $('.hold__label').textContent = 'Lined up';
      }
      if (done) p = 1;                  /* the edge is cut: it does not soften again */
      write();
      if (!done && ((held && p < 1) || (!held && p > 0))) {
        raf = requestAnimationFrame(tick);
      } else { raf = null; last = 0; }
    }
    /* Pointer capture, not preventDefault: calling preventDefault on pointerdown
       swallows the NEXT press, so releasing early and pressing again did nothing.
       touch-action and user-select in the CSS already stop scroll and selection. */
    function start(e) {
      if (done) return;
      if (e && e.pointerId !== undefined && btn.setPointerCapture) {
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      }
      held = true;
      if (raf === null) raf = requestAnimationFrame(tick);
    }
    function stop() {
      held = false;
      if (!done && raf === null && p > 0) raf = requestAnimationFrame(tick);
    }

    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointercancel', stop);
    addEventListener('pointerup', stop);        /* safety net if capture is lost */
    addEventListener('pointercancel', stop);
    btn.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); start(); }
    });
    btn.addEventListener('keyup', function (e) {
      if (e.key === ' ' || e.key === 'Enter') stop();
    });

    /* reduced motion gets the finished state with no hold required */
    lineUpAPI.finish = function () {
      held = false;
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      p = 1; done = true; write();
      section.classList.add('is-done');
      $('.hold__label').textContent = 'Lined up';
    };
    lineUpAPI.reset = function () {
      if (done) return;
      p = 0; write();
    };
  })();

  /* ======================================================================
     THE HERO SCRUB
     ====================================================================== */
  var hero    = $('.hero');
  var stage   = $('.stage');
  var video   = $('#hero-video');
  var frame   = $('.frame');
  var poster  = $('.frame__poster');
  var ringEl  = $('.ring circle');
  var bandEls = $$('.band');

  /* Two encodes of the same 6.71s cut. VP9 is 25% lighter and hardware-decoded on
     Chrome/Edge/Firefox; H.264 covers Safari. Byte counts are the real file sizes,
     used only when a host omits Content-Length. */
  var SOURCES = [
    { url: 'assets/hero-scrub.webm', probe: 'video/webm; codecs="vp9"', mime: 'video/webm', bytes: 2317935 },
    { url: 'assets/hero-scrub.mp4',  probe: 'video/mp4; codecs="avc1.640028"', mime: 'video/mp4', bytes: 3068364 }
  ];
  var SRC = (function pickSource() {
    var probe = document.createElement('video');
    for (var i = 0; i < SOURCES.length; i++) {
      if (probe.canPlayType(SOURCES[i].probe)) return SOURCES[i];
    }
    return SOURCES[SOURCES.length - 1];
  })();
  var POSTER_URL = 'assets/hero-poster.jpg';

  /* ---- split the headlines once, at load ------------------------------ */
  function splitBands() {
    bandEls.forEach(function (band, bi) {
      var h = $('.band__h', band);
      if (!h || h.dataset.done) return;
      var fx = band.dataset.fx;
      var text = h.textContent.trim();
      var rand = rng(9973 + bi * 131);

      if (fx === 'focus') {
        /* two static copies crossfaded: never animate the filter itself */
        h.textContent = '';
        h.classList.add('fx-focus');
        var soft = document.createElement('span');
        soft.className = 'layer layer--soft';
        soft.setAttribute('aria-hidden', 'true');
        soft.textContent = text;
        var sharp = document.createElement('span');
        sharp.className = 'layer layer--sharp';
        sharp.textContent = text;
        h.appendChild(soft);
        h.appendChild(sharp);
        h.dataset.done = '1';
        return;
      }

      var words = text.split(/\s+/);
      var spread = parseFloat(band.dataset.spread || '0.45');
      var totalChars = text.replace(/\s+/g, '').length;
      var ci = 0;

      var sr = document.createElement('span');
      sr.className = 'sr';
      sr.textContent = text;
      var vis = document.createElement('span');
      vis.setAttribute('aria-hidden', 'true');

      words.forEach(function (w, wi) {
        var ws = document.createElement('span');
        ws.className = 'w';
        if (fx === 'drift') {
          ws.style.setProperty('--th', (wi / Math.max(1, words.length) * spread + rand() * 0.05).toFixed(4));
          ws.textContent = w;
        } else {
          for (var i = 0; i < w.length; i++) {
            var cs = document.createElement('span');
            cs.className = 'c';
            cs.textContent = w[i];
            cs.style.setProperty('--th', (ci / Math.max(1, totalChars) * spread + rand() * 0.05).toFixed(4));
            cs.style.setProperty('--jx', (-18 - rand() * 22).toFixed(1) + 'px');
            ws.appendChild(cs);
            ci++;
          }
        }
        vis.appendChild(ws);
        if (wi < words.length - 1) vis.appendChild(document.createTextNode(' '));
      });

      h.textContent = '';
      h.classList.add(fx === 'drift' ? 'fx-drift' : 'fx-align');
      h.appendChild(sr);
      h.appendChild(vis);
      h.dataset.done = '1';
    });
  }
  splitBands();

  /* ---- band bookkeeping ----------------------------------------------- */
  var bands = bandEls.map(function (el, i) {
    return {
      el: el,
      a: parseFloat(el.dataset.a),
      b: parseFloat(el.dataset.b),
      ramp: el.dataset.ramp ? parseFloat(el.dataset.ramp) : 0,
      first: i === 0,
      last: i === bandEls.length - 1,
      op: -1,
      k: -1
    };
  });

  var loadK = 0, loadStart = 0;

  function updateCaptions(p) {
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var f = Math.min(0.02, (b.b - b.a) / 3);
      var op;
      if (b.first)      op = 1 - smoothstep(p, b.b - f, b.b);
      else if (b.last)  op = smoothstep(p, b.a, b.a + f);
      else              op = smoothstep(p, b.a, b.a + f) * (1 - smoothstep(p, b.b - f, b.b));

      var ramp = b.ramp || Math.min(0.025, (b.b - b.a) * 0.35);
      var k = clamp((p - b.a) / ramp, 0, 1);
      if (b.first) k = Math.max(k, loadK);

      if (Math.abs(op - b.op) > 0.004) { b.op = op; b.el.style.opacity = op.toFixed(3); }
      if (Math.abs(k - b.k) > 0.008)   { b.k = k;  b.el.style.setProperty('--k', k.toFixed(3)); }
    }
  }

  function pinBandsFinal() {
    bands.forEach(function (b) {
      b.op = -1; b.k = -1;
      b.el.style.opacity = b.last ? '1' : '0';
      b.el.style.setProperty('--k', '1');
    });
  }

  /* ---- the scrub drive ------------------------------------------------- */
  var scrubOn = false;
  var target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true;

  function heroProgress() {
    if (!hero) return 0;
    var range = hero.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return clamp((window.scrollY - hero.offsetTop) / range, 0, 1);
  }

  var seekBusy = false, pendingTime = null;
  function requestSeek(t) {
    if (!video || !video.duration || isNaN(video.duration)) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    video.currentTime = t;
  }
  if (video) {
    video.addEventListener('seeked', function () {
      seekBusy = false;
      if (pendingTime !== null) { var t = pendingTime; pendingTime = null; requestSeek(t); }
    });
    video.addEventListener('error', function () {   /* the deadlock escape */
      seekBusy = false; pendingTime = null; failVideo();
    });
  }

  function tick(now) {
    var dt = Math.min(100, now - (lastTick || now));
    lastTick = now;

    if (loadK < 1 && loadStart) {
      loadK = clamp((now - loadStart) / 900, 0, 1);
    }

    var k = 0.16;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    var settled = Math.abs(target - shown) < 0.0005 && loadK >= 1;
    if (settled) { shown = target; rafId = null; lastTick = 0; }
    else { rafId = requestAnimationFrame(tick); }

    if (video && video.duration) requestSeek(shown * video.duration);
    updateCaptions(shown);
  }

  function onScroll() {
    target = heroProgress();
    if (rafId === null && heroOnScreen) { rafId = requestAnimationFrame(tick); }
  }

  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      heroOnScreen = e[0].isIntersecting;
      if (heroOnScreen && scrubOn && rafId === null) rafId = requestAnimationFrame(tick);
    }, { threshold: 0 }).observe(hero);
  }

  /* ---- loading the footage -------------------------------------------- */
  var heroInited = false;

  function failVideo() {
    if (!stage) return;
    stage.classList.remove('video-ready');
    stage.classList.add('video-failed');   /* the settled mark carries the hero instead */
  }

  function loadHeroBlob() {
    var ctrl = new AbortController();
    var watchdog = setTimeout(function () { ctrl.abort(); }, 20000);

    return fetch(SRC.url, { signal: ctrl.signal }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var total = Number(res.headers.get('Content-Length')) || SRC.bytes;
      if (!res.body || !res.body.getReader) {
        clearTimeout(watchdog);
        return res.blob();
      }
      var reader = res.body.getReader();
      var chunks = [], got = 0, lastRing = 0;
      return (function pump() {
        return reader.read().then(function (r) {
          if (r.done) { clearTimeout(watchdog); return new Blob(chunks, { type: SRC.mime }); }
          clearTimeout(watchdog);
          watchdog = setTimeout(function () { ctrl.abort(); }, 20000);
          chunks.push(r.value);
          got += r.value.length;
          var frac = Math.min(1, got / total);
          var now = performance.now();
          if (ringEl && (now - lastRing > 100 || frac === 1)) {
            lastRing = now;
            ringEl.style.setProperty('--ld', Math.round(126 * (1 - frac)));
          }
          return pump();
        });
      })();
    }).then(function (blob) {
      if (ringEl) ringEl.style.setProperty('--ld', 0);
      video.src = URL.createObjectURL(blob);
      video.load();
      video.addEventListener('canplay', function () {
        requestSeek(heroProgress() * video.duration);
        stage.classList.add('video-ready');
      }, { once: true });
    });
  }

  function initHeroOnce() {
    if (heroInited) return;
    heroInited = true;
    if (poster) poster.style.backgroundImage = "url('" + POSTER_URL + "')";
    loadStart = performance.now();

    var started = false;
    function startBlobFetch() {
      if (started) return;
      started = true;
      loadHeroBlob().catch(failVideo);
    }
    /* the poster wins the bandwidth race by design */
    var img = new Image();
    img.onload = startBlobFetch;
    img.onerror = startBlobFetch;
    img.src = POSTER_URL;
    setTimeout(startBlobFetch, 4000);
  }

  /* ======================================================================
     THE FIVE STATIC-HERO GATES — identical strings in CSS and JS
     ====================================================================== */
  var GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  var MQLS = GATES.map(function (q) { return matchMedia(q); });

  function enableScrub() {
    if (scrubOn || !hero || !video) return;
    scrubOn = true;
    initHeroOnce();
    addEventListener('scroll', onScroll, { passive: true });
    bands.forEach(function (b) { b.op = -1; b.k = -1; });
    unpinFinalStates();
    updateCaptions(heroProgress());
    onScroll();                         /* re-seek to where the page already is */
  }
  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    removeEventListener('scroll', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }
  function applyHeroMode() {
    var gated = MQLS.some(function (m) { return m.matches; });
    if (gated) disableScrub(); else enableScrub();
  }

  /* ---- reduced motion, honoured live and in BOTH directions ------------ */
  function pinToFinalStates() {
    disableScrub();
    pinBandsFinal();
    $$('.premise, .board, .marks, .lineup, .work, .says, .visit, .foot')
      .forEach(function (g) { g.classList.add('in', 'settled'); });
    lineUpAPI.finish();                 /* the hold completes itself */
  }
  function unpinFinalStates() {
    bands.forEach(function (b) {
      b.el.style.opacity = '';
      b.el.style.removeProperty('--k');
      b.op = -1; b.k = -1;
    });
  }

  MQLS.forEach(function (m) { m.addEventListener('change', applyHeroMode); });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
    if (e.matches) pinToFinalStates();
    else applyHeroMode();
  });

  applyHeroMode();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) pinToFinalStates();
})();
