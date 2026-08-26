/* ==========================================================================
   Eazy Fade Studio
   The hero footage plays itself. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

  /* scripting is on: entrance states in the stylesheet may now hide things */
  document.documentElement.classList.add('js');

  /* ======================================================================
     SMALL PAGE BITS
     ====================================================================== */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Open / closed, computed in the shop's timezone, not the visitor's */
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
    var isOpen = mins >= (10 * 60 + 30) && mins < (20 * 60);
    el.dataset.state = isOpen ? 'open' : 'closed';
    el.textContent = isOpen ? '● Open now — until 20:00' : '● Closed — opens 10:30';
  })();

  /* Gallery: a labelled placeholder if an image is ever missing */
  $$('.shot').forEach(function (fig, i) {
    var img = $('img', fig);
    if (!img) return;
    var grid = fig.parentNode;
    var fail = function () {
      fig.classList.add('is-empty');
      fig.setAttribute('data-slot', 'Photo ' + (i + 1) + ' missing');
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
  var groupSel = '.premise, .board, .marks, .lineup, .work, .says, .visit, .map, .foot';
  (function entrances() {
    var groups = $$(groupSel);
    groups.forEach(function (g) {
      Array.prototype.filter.call(g.children, function (c) { return c.nodeType === 1; })
        .forEach(function (c) { c.classList.add('rv'); });
    });
    if (!('IntersectionObserver' in window) || reduceMQ.matches) {
      groups.forEach(function (g) { g.classList.add('in', 'settled'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        setTimeout(function () { e.target.classList.add('settled'); }, 1400);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    groups.forEach(function (g) { io.observe(g); });
  })();

  /* ======================================================================
     THE GUARD RAIL — page progress drawn as a fade, ticked in guard numbers
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
      var rounded = Math.round(p * 200) / 200;
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
  var lineUpAPI = { finish: function () {} };

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
      p = clamp(p + (held ? dt / HOLD_MS : -dt / RELEASE_MS), 0, 1);
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
       swallows the NEXT press. touch-action and user-select handle the rest. */
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
    addEventListener('pointerup', stop);
    addEventListener('pointercancel', stop);
    btn.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); start(); }
    });
    btn.addEventListener('keyup', function (e) {
      if (e.key === ' ' || e.key === 'Enter') stop(); 
    });

    lineUpAPI.finish = function () {
      held = false;
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      p = 1; done = true; write();
      section.classList.add('is-done');
      $('.hold__label').textContent = 'Lined up';
    };
  })();

  /* ======================================================================
     THE HERO — the footage plays itself
     ====================================================================== */
  var stage  = $('.stage');
  var video  = $('#hero-video');
  var poster = $('.frame__poster');

  /* Two encodes of the same 6.71s cut. VP9 is 25% lighter and hardware-decoded on
     Chrome/Edge/Firefox; H.264 covers Safari. Only the chosen one is downloaded. */
  var SOURCES = [
    { url: 'assets/hero.webm', probe: 'video/webm; codecs="vp9"' },
    { url: 'assets/hero.mp4',  probe: 'video/mp4; codecs="avc1.640028"' }
  ];
  var SRC = (function pickSource() {
    var probe = document.createElement('video');
    for (var i = 0; i < SOURCES.length; i++) {
      if (probe.canPlayType(SOURCES[i].probe)) return SOURCES[i];
    }
    return SOURCES[SOURCES.length - 1];
  })();
  var POSTER_URL = 'assets/hero-poster.jpg';

  var heroLoaded = false;

  function failVideo() {
    if (!stage) return;
    stage.classList.remove('video-ready');
    stage.classList.add('video-failed');   /* the settled mark carries the frame */
  }

  function attempt() {
    var q = video.play();
    /* A refused play() is not a load failure — the video is fine, the browser just
       wants a gesture first. Leave it visible on its first frame; the gesture
       unlock below retries. Only a real error event falls back to the still. */
    if (q && q.catch) q.catch(function () {});
  }

  function loadHero() {
    if (heroLoaded || !video || !stage) return;
    heroLoaded = true;
    if (poster) poster.style.backgroundImage = "url('" + POSTER_URL + "')";
    video.addEventListener('canplay', function () {
      stage.classList.add('video-ready');
      attempt();
    }, { once: true });
    video.addEventListener('error', failVideo, { once: true });
    video.src = SRC.url;
    video.load();
  }

  /* Play while the hero is on screen; restart it if the visitor scrolls back up
     after it has finished, so returning to the top never lands on a frozen frame. */
  if (video && stage && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (!heroLoaded || reduceMQ.matches) return;
      if (!vis) { if (!video.paused) video.pause(); return; }
      if (video.ended || video.currentTime >= video.duration - 0.05) video.currentTime = 0;
      attempt();
    }, { threshold: 0.15 }).observe($('.hero'));
  }

  function applyHeroMode() {
    if (!stage || !video) return;
    if (reduceMQ.matches) {
      stage.classList.add('no-video');     /* the mark, held still. No video is fetched. */
      if (!video.paused) video.pause();
    } else {
      stage.classList.remove('no-video');
      loadHero();
    }
  }
  reduceMQ.addEventListener('change', function () {
    applyHeroMode();
    if (reduceMQ.matches) {
      $$(groupSel).forEach(function (g) { g.classList.add('in', 'settled'); });
      lineUpAPI.finish();
    }
  });
  applyHeroMode();
  if (reduceMQ.matches) lineUpAPI.finish();

  /* the copy arrives once, after paint */
  if (stage) requestAnimationFrame(function () { stage.classList.add('lead-in'); });

  /* iOS will not start a video from script until a gesture has unlocked the decoder */
  (function unlockOnFirstGesture() {
    if (!video) return;
    function unlock() {
      if (!reduceMQ.matches && video.paused && !video.ended) attempt();
      removeEventListener('touchstart', unlock);
      removeEventListener('pointerdown', unlock);
    }
    addEventListener('touchstart', unlock, { once: true, passive: true });
    addEventListener('pointerdown', unlock, { once: true });
  })();

  /* ======================================================================
     THE MAP — fall back to the address panel where Google can't be reached
     ====================================================================== */
  (function mapFallback() {
    var frame = $('.map__frame');
    var embed = $('.map__embed');
    if (!frame || !embed) return;
    var settled = false;
    var done = function (state) { if (!settled) { settled = true; frame.dataset.state = state; } };
    /* The iframe's load event is useless: Chromium fires it for its own error page
       too. Probe reachability instead — a no-cors fetch resolves opaquely when
       Google is reachable and rejects when the network or a policy blocks it. */
    if (!window.fetch) { done('ok'); return; }
    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
      .then(function () { done('ok'); })
      .catch(function () { done('blocked'); });
    setTimeout(function () { done('blocked'); }, 8000);
  })();
})();
