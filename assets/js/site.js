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

  /* Safari below 14 has addListener but not addEventListener on a MediaQueryList,
     and the TypeError would take down everything defined after it. */
  function onMQ(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }
  /* One module failing must not silence the rest of the page. */
  function guard(name, fn) {
    try { fn(); } catch (e) {
      if (window.console && console.warn) console.warn('[efs] ' + name + ' failed:', e);
    }
  }

  /* scripting is on: entrance states in the stylesheet may now hide things */
  document.documentElement.classList.add('js');

  /* ======================================================================
     SMALL PAGE BITS
     ====================================================================== */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Open / closed, computed in the shop's timezone, not the visitor's */
  guard('openNow', function () {
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
  });

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
  guard('entrances', function () {
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
  });

  /* ======================================================================
     THE GUARD RAIL — page progress drawn as a fade, ticked in guard numbers
     ====================================================================== */
  guard('rail', function () {
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
  });

  /* ======================================================================
     THE ONE INTERACTIVE MOMENT — press and hold to line it up
     ====================================================================== */
  var lineUpAPI = { finish: function () {} };

  guard('lineUp', function () {
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
  });

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
  onMQ(reduceMQ, function () {
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
  guard('unlockOnFirstGesture', function () {
    if (!video) return;
    function unlock() {
      if (!reduceMQ.matches && video.paused && !video.ended) attempt();
      removeEventListener('touchstart', unlock);
      removeEventListener('pointerdown', unlock);
    }
    addEventListener('touchstart', unlock, { once: true, passive: true });
    addEventListener('pointerdown', unlock, { once: true });
  });


  /* ======================================================================
     BOOKING
     A static page cannot send anything by itself. So it does the work a
     barbershop actually needs: collects the booking, stamps it with a
     reference, and hands over a written message the client sends to the shop
     in one tap — which also leaves the client a copy in their own chat.
     ====================================================================== */
  guard('booking', function () {
    var dlg = $('#booking');
    if (!dlg) return;

    /* Older in-app browsers (a link opened inside WhatsApp or Facebook runs in a
       WebView that can lag well behind the real browser) have no showModal. The
       flow must still run there, so fall back to a plain fixed overlay rather
       than bailing out — bailing out let the trigger's href fire and sent people
       straight to WhatsApp before they had filled anything in. */
    var veil = null, lastFocus = null, usingFallback = false;

    function focusables() {
      return $$('a[href], button:not([disabled]), input:not([disabled]), textarea, select', dlg)
        .filter(function (el) { return el.getClientRects().length > 0; });
    }
    function trapTab(e) {
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function onEsc(e) { if (e.key === 'Escape') { e.preventDefault(); closeDlg(); } }

    function focusFirst() {
      var f = focusables();
      /* skip the close button so the first field is what receives focus */
      var target = f.filter(function (el) { return !el.closest('.bk__x'); })[0] || f[0];
      if (target) target.focus({ preventScroll: true });
    }

    function openDlg() {
      lastFocus = document.activeElement;
      if (dlg.showModal) {
        try { dlg.showModal(); focusFirst(); return; } catch (e) {}
      }
      usingFallback = true;
      dlg.classList.add('bk--fallback');
      dlg.setAttribute('open', '');
      dlg.setAttribute('role', 'dialog');
      dlg.setAttribute('aria-modal', 'true');
      if (!veil) {
        veil = document.createElement('div');
        veil.className = 'bk-veil';
        veil.addEventListener('click', closeDlg);
        document.body.appendChild(veil);
      }
      veil.hidden = false;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onEsc);
      document.addEventListener('keydown', trapTab);
      focusFirst();
    }
    function closeDlg() {
      if (usingFallback) {
        dlg.removeAttribute('open');
        dlg.classList.remove('bk--fallback');
        if (veil) veil.hidden = true;
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onEsc);
        document.removeEventListener('keydown', trapTab);
      } else if (dlg.close) {
        try { dlg.close(); } catch (e) {}
      }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    /* the close button lives in a method="dialog" form, which does nothing in
       the fallback path, so drive it explicitly too */
    var xBtn = $('.bk__x button', dlg);
    if (xBtn) xBtn.addEventListener('click', function (e) { e.preventDefault(); closeDlg(); });

    var SHOP_WA = '27657196289';
    var OPEN_MIN = 10 * 60 + 30, CLOSE_MIN = 20 * 60, STEP_MIN = 30, LEAD_MIN = 30;
    var STORE = 'efs.booking.last';

    var form = $('#bk-form'), receipt = $('#bk-receipt');
    var dateEl = $('#bk-date'), slotsEl = $('#bk-slots'), cutsEl = $('#bk-cuts');
    var notesEl = $('#bk-notes'), countEl = $('#bk-count');
    var nameEl = $('#bk-name'), phoneEl = $('#bk-phone');
    var backBtn = $('#bk-back'), nextBtn = $('#bk-next'), submitBtn = $('#bk-submit');
    var stepEls = $$('.bk__step', dlg), stepTabs = $$('.bk__steps li', dlg);
    var step = 1;

    /* ---- the shop's clock, wherever the visitor is ---- */
    function zaNow() {
      try {
        var p = {};
        new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric',
          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
          .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
        return { date: p.year + '-' + p.month + '-' + p.day,
                 mins: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10) };
      } catch (e) {
        var d = new Date();
        var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return { date: iso, mins: d.getHours() * 60 + d.getMinutes() };
      }
    }
    var hhmm = function (m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
    function prettyDate(iso) {
      var d = new Date(iso + 'T12:00:00');
      if (isNaN(d)) return iso;
      return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
    }

    /* ---- the price board is the single source of truth for services ---- */
    var services = $$('.board .row').map(function (r) {
      return { name: $('.row__name', r).textContent.trim(), price: $('.row__p', r).textContent.trim() };
    });
    if (!services.length) services = [{ name: 'Haircut', price: '' }];

    cutsEl.innerHTML = services.map(function (sv, i) {
      return '<label class="chip"><input type="radio" name="cut" value="' + i + '">' +
             '<span><b>' + sv.name + '</b><em>' + sv.price + '</em></span></label>';
    }).join('');

    /* ---- time slots, past ones struck out when the day is today ---- */
    function buildSlots() {
      var now = zaNow();
      var today = dateEl.value === now.date;
      var html = '';
      for (var m = OPEN_MIN; m <= CLOSE_MIN - STEP_MIN; m += STEP_MIN) {
        var gone = today && m < now.mins + LEAD_MIN;
        html += '<label class="chip"><input type="radio" name="time" value="' + m + '"' +
                (gone ? ' disabled' : '') + '><span>' + hhmm(m) + '</span></label>';
      }
      slotsEl.innerHTML = html;
    }

    /* ---- South African mobile numbers ---- */
    function normalisePhone(raw) {
      var d = String(raw || '').replace(/[^\d+]/g, '');
      if (d.slice(0, 3) === '+27') d = '27' + d.slice(3);
      else if (d.charAt(0) === '0') d = '27' + d.slice(1);
      else if (d.slice(0, 2) !== '27') return null;
      return /^27[6-8]\d{8}$/.test(d) ? d : null;
    }
    function prettyPhone(intl) {   /* 27657196289 -> 065 719 6289 */
      var local = '0' + intl.slice(2);
      return local.slice(0, 3) + ' ' + local.slice(3, 6) + ' ' + local.slice(6);
    }

    var ALPHA = 'ACDEFGHJKLMNPQRTUVWXY34679';   /* no 0/O, 1/I, 2/Z, 5/S, 8/B */
    function makeRef() {
      var out = '', rnd = new Uint8Array(4);
      if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(rnd);
      else for (var j = 0; j < 4; j++) rnd[j] = Math.floor(Math.random() * 256);
      for (var i = 0; i < 4; i++) out += ALPHA.charAt(rnd[i] % ALPHA.length);
      return 'EF-' + out;
    }

    function err(n, msg) {
      var el = $('.bk__err[data-for="step' + n + '"]', dlg);
      if (el) el.textContent = msg || '';
    }

    /* ---- step machine ---- */
    function show(n) {
      step = n;
      stepEls.forEach(function (f) { f.hidden = Number(f.dataset.step) !== n; });
      stepTabs.forEach(function (t) {
        var i = Number(t.dataset.step);
        if (i === n) { t.setAttribute('data-on', ''); t.removeAttribute('data-done'); }
        else if (i < n) { t.removeAttribute('data-on'); t.setAttribute('data-done', ''); }
        else { t.removeAttribute('data-on'); t.removeAttribute('data-done'); }
      });
      backBtn.hidden = n === 1;
      nextBtn.hidden = n === 3;
      submitBtn.hidden = n !== 3;
      var first = $('input, textarea', stepEls[n - 1]);
      if (first) first.focus({ preventScroll: true });
    }

    function validate(n) {
      err(n, '');
      if (n === 1) {
        if (!dateEl.value) { err(1, 'Pick which day you want to come in.'); dateEl.focus(); return false; }
        var now = zaNow();
        if (dateEl.value < now.date) { err(1, 'That day has already passed. Pick today or later.'); dateEl.focus(); return false; }
        var t = $('input[name="time"]:checked', dlg);
        if (!t) { err(1, 'Pick a time.'); return false; }
        if (dateEl.value === now.date && Number(t.value) < now.mins + LEAD_MIN) {
          err(1, 'That time has passed. Pick a later one.'); buildSlots(); return false;
        }
        return true;
      }
      if (n === 2) {
        if (!$('input[name="cut"]:checked', dlg)) { err(2, 'Choose the cut you want.'); return false; }
        if (isHouseCall() && notesEl.value.trim().length < 6) {
          err(2, 'A house call needs an address. Where must the barber come?');
          notesEl.focus();
          return false;
        }
        return true;
      }
      var okName = nameEl.value.trim().length >= 2;
      nameEl.setAttribute('aria-invalid', okName ? 'false' : 'true');
      if (!okName) { err(3, 'Tell us your name so the barber knows who is coming.'); nameEl.focus(); return false; }
      var intl = normalisePhone(phoneEl.value);
      phoneEl.setAttribute('aria-invalid', intl ? 'false' : 'true');
      if (!intl) { err(3, 'That does not look like a South African mobile number. Try 065 719 6289.'); phoneEl.focus(); return false; }
      return true;
    }

    /* ---- the message both sides get ---- */
    function compose(b) {
      return 'EAZY FADE STUDIO\nBooking ' + b.ref + '\n\n' +
             'Name: ' + b.name + '\n' +
             'Phone: ' + b.phonePretty + '\n' +
             'When: ' + b.dayPretty + ' at ' + b.timePretty + '\n' +
             'Cut: ' + b.cut + (b.price ? ' (' + b.price + ')' : '') + '\n' +
             (b.notes ? (b.house ? 'Address: ' : 'Notes: ') + b.notes + '\n' : '') +
             '\n19 Madiba St, Paballelo, Upington';
    }

    function renderReceipt(b) {
      $('#bk-ref').textContent = b.ref;
      $('#bk-lines').innerHTML =
        '<dt>Name</dt><dd>' + esc(b.name) + '</dd>' +
        '<dt>Phone</dt><dd>' + esc(b.phonePretty) + '</dd>' +
        '<dt>When</dt><dd>' + esc(b.dayPretty) + ' at ' + esc(b.timePretty) + '</dd>' +
        '<dt>Cut</dt><dd>' + esc(b.cut) + (b.price ? ' <span style="color:var(--accent)">' + esc(b.price) + '</span>' : '') + '</dd>' +
        (b.notes ? '<dt>' + (b.house ? 'Address' : 'Notes') + '</dt><dd>' + esc(b.notes) + '</dd>' : '');
      var text = compose(b);
      $('#bk-wa').href = 'https://wa.me/' + SHOP_WA + '?text=' + encodeURIComponent(text);
      form.hidden = true;
      receipt.hidden = false;
      $('#bk-ref').setAttribute('tabindex', '-1');
      $('#bk-ref').focus({ preventScroll: true });
    }
    function esc(v) {
      return String(v).replace(/[&<>"]/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
      });
    }

    /* ---- wiring ---- */
    dateEl.addEventListener('change', function () { buildSlots(); err(1, ''); });
    slotsEl.addEventListener('change', function () { err(1, ''); });
    var notesLabel = $('#bk-notes-label');
    function isHouseCall() {
      var c = $('input[name="cut"]:checked', dlg);
      return !!c && /house call/i.test(services[Number(c.value)].name);
    }
    function syncNotes() {
      if (isHouseCall()) {
        notesLabel.innerHTML = 'Where must we come? <span>Required</span>';
        notesEl.placeholder = 'Street address in Upington, and how to find the door';
      } else {
        notesLabel.innerHTML = 'Anything specific? <span>Optional</span>';
        notesEl.placeholder = 'Low fade, sharp line-up, leave the top';
      }
    }
    cutsEl.addEventListener('change', function () { err(2, ''); syncNotes(); });
    notesEl.addEventListener('input', function () { countEl.textContent = notesEl.value.length; });
    [nameEl, phoneEl].forEach(function (el) {
      el.addEventListener('input', function () { el.setAttribute('aria-invalid', 'false'); err(3, ''); });
    });

    nextBtn.addEventListener('click', function () { if (validate(step)) show(step + 1); });
    backBtn.addEventListener('click', function () { if (step > 1) show(step - 1); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(3)) return;
      var cutIdx = Number($('input[name="cut"]:checked', dlg).value);
      var mins = Number($('input[name="time"]:checked', dlg).value);
      var intl = normalisePhone(phoneEl.value);
      var b = {
        ref: makeRef(),
        name: nameEl.value.trim(),
        phoneIntl: intl,
        phonePretty: prettyPhone(intl),
        day: dateEl.value,
        dayPretty: prettyDate(dateEl.value),
        timePretty: hhmm(mins),
        cut: services[cutIdx].name,
        price: services[cutIdx].price,
        notes: notesEl.value.trim(),
        house: isHouseCall(),
        madeAt: Date.now()
      };
      try { localStorage.setItem(STORE, JSON.stringify(b)); } catch (e2) {}
      renderReceipt(b);
    });

    function reset() {
      form.reset();
      form.hidden = false;
      receipt.hidden = true;
      countEl.textContent = '0';
      syncNotes();
      [nameEl, phoneEl].forEach(function (el) { el.setAttribute('aria-invalid', 'false'); });
      [1, 2, 3].forEach(function (n) { err(n, ''); });
      var now = zaNow();
      dateEl.min = now.date;
      var max = new Date(now.date + 'T12:00:00'); max.setDate(max.getDate() + 60);
      dateEl.max = max.toISOString().slice(0, 10);
      /* past closing, default to tomorrow rather than a day with no slots left */
      dateEl.value = now.mins >= CLOSE_MIN - LEAD_MIN ? nextDay(now.date) : now.date;
      buildSlots();
      show(1);
    }
    function nextDay(iso) {
      var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    }
    $('#bk-again').addEventListener('click', reset);

    /* a booking already made is offered back, so closing the tab loses nothing */
    function showLast() {
      var el = $('#bk-last');
      var raw = null;
      try { raw = localStorage.getItem(STORE); } catch (e) {}
      if (!raw) { el.hidden = true; return; }
      var b;
      try { b = JSON.parse(raw); } catch (e) { el.hidden = true; return; }
      if (!b || !b.ref || Date.now() - (b.madeAt || 0) > 60 * 86400000) { el.hidden = true; return; }
      el.hidden = false;
      el.innerHTML = 'Last booking <b>' + esc(b.ref) + '</b> — ' + esc(b.dayPretty) + ' at ' + esc(b.timePretty) + ' · ';
      var a = document.createElement('button');
      a.type = 'button'; a.className = 'lineup__link'; a.textContent = 'view it';
      a.addEventListener('click', function () { renderReceipt(b); });
      el.appendChild(a);
    }

    /* The triggers are real WhatsApp links, so they still work with scripting off.
       With script, they open the booking flow instead. */
    $$('[data-book]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        reset();
        showLast();
        openDlg();
      });
    });
  });

  /* ======================================================================
     THE MAP — fall back to the address panel where Google can't be reached
     ====================================================================== */
  guard('mapFallback', function () {
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
  });
})();
