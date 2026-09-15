/* ==========================================================================
   Prithvi Bhardwaj — site behaviour
   Every block guards its own elements, so the same file runs on every page.
   ========================================================================== */
(function () {
  'use strict';

  var d = document, w = window, root = d.documentElement, b = d.body;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  var reduced = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof w.gsap !== 'undefined';
  var hasST = hasGsap && typeof w.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  root.classList.remove('no-js');
  if (reduced || !hasGsap) root.classList.add('reduced-motion');
  var animate = hasGsap && !reduced;

  var themeListeners = [];

  /* ---------- Theme ---------- */
  $$('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      themeListeners.forEach(function (fn) { fn(next); });
    });
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('.menu-btn');
  function closeMenu() {
    b.classList.remove('menu-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = b.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (typeof w.Lenis !== 'undefined' && !reduced) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    if (hasGsap) {
      if (hasST) lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToEl(el) {
    if (lenis) {
      lenis.scrollTo(el, { offset: -48, duration: 1.3, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    } else {
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = $(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (id === '#top') {
        if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else w.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        history.replaceState(null, '', ' ');
        return;
      }
      scrollToEl(el);
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Nav state + progress bar ---------- */
  var nav = $('.nav'), prog = $('.progress'), lastY = w.scrollY;
  function onScroll() {
    var y = w.scrollY;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 24);
      if (y > 420 && y > lastY + 6 && !b.classList.contains('menu-open')) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 420) nav.classList.remove('is-hidden');
    }
    if (prog) {
      var max = root.scrollHeight - w.innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    lastY = y;
  }
  w.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  var sections = $$('main section[id]'), navLinks = $$('.nav-link');
  if (sections.length && navLinks.length && 'IntersectionObserver' in w) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Spotlight (all pointers) ---------- */
  var spot = $('.spotlight');
  if (spot) {
    w.addEventListener('pointermove', function (e) {
      spot.style.setProperty('--mx', e.clientX + 'px');
      spot.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
  }

  /* ---------- Custom cursor (fine pointers only) ---------- */
  var dot = $('.cursor-dot'), ring = $('.cursor-ring');
  if (fine && !reduced && dot && ring) {
    b.classList.add('has-cursor');
    var label = $('span', ring);
    var mx = -100, my = -100, rx = -100, ry = -100, shown = false;
    w.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; dot.style.opacity = '1'; ring.style.opacity = '1'; rx = mx; ry = my; }
    }, { passive: true });
    d.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    d.addEventListener('mouseenter', function () { if (shown) { dot.style.opacity = '1'; ring.style.opacity = '1'; } });
    (function cursorLoop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(cursorLoop);
    })();
    d.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('a, button, [data-cursor], input, textarea') : null;
      if (!t || t.matches('input, textarea')) { b.classList.remove('cursor-hover', 'cursor-label'); return; }
      var txt = t.getAttribute('data-cursor');
      if (txt) { if (label) label.textContent = txt; b.classList.add('cursor-label'); b.classList.remove('cursor-hover'); }
      else { b.classList.add('cursor-hover'); b.classList.remove('cursor-label'); }
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && animate) {
    $$('[data-magnetic]').forEach(function (el) {
      var strength = 0.28;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.5, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      });
    });
  }

  /* ---------- Hero: generative flow field ---------- */
  var canvas = $('.hero-canvas');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, pts = [], running = false, tick = 0, mouse = { x: -9999, y: -9999 };
    var colAcc = '240,179,91', colInk = '122,115,105';

    function hexToRgb(hex) {
      hex = hex.replace('#', '').trim();
      if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
      var n = parseInt(hex, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
    }
    function refreshColours() {
      var cs = getComputedStyle(root);
      var a = cs.getPropertyValue('--accent').trim(), i = cs.getPropertyValue('--ink-3').trim();
      if (a.charAt(0) === '#') colAcc = hexToRgb(a);
      if (i.charAt(0) === '#') colInk = hexToRgb(i);
    }
    refreshColours();
    themeListeners.push(refreshColours);

    function resize() {
      var dpr = Math.min(w.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(60, Math.min(200, Math.floor((W * H) / 9500)));
      pts = [];
      for (var k = 0; k < n; k++) {
        pts.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, r: 0.8 + Math.random() * 1.5, s: 0.4 + Math.random() * 0.9 });
      }
    }
    function field(x, y, t) {
      var s = 0.0026;
      return Math.sin(x * s + t) * Math.cos(y * s * 1.3 - t * 0.7) * Math.PI + Math.sin((x + y) * s * 0.5 + t * 0.5) * 1.2;
    }
    function draw() {
      if (!running) return;
      tick += 0.0035;
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, dd, dist, a, f;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        a = field(p.x, p.y, tick);
        p.vx += Math.cos(a) * 0.05 * p.s; p.vy += Math.sin(a) * 0.05 * p.s;
        dx = p.x - mouse.x; dy = p.y - mouse.y; dd = dx * dx + dy * dy;
        if (dd < 160 * 160 && dd > 0.01) { dist = Math.sqrt(dd); f = (1 - dist / 160) * 0.9; p.vx += (dx / dist) * f; p.vy += (dy / dist) * f; }
        p.vx *= 0.96; p.vy *= 0.96; p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      }
      ctx.lineWidth = 0.7;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; dd = dx * dx + dy * dy;
          if (dd < 120 * 120) {
            ctx.strokeStyle = 'rgba(' + colInk + ',' + ((1 - Math.sqrt(dd) / 120) * 0.38).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        ctx.fillStyle = 'rgba(' + colAcc + ',' + (0.45 + p.s * 0.4).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    function start() { if (running) return; running = true; requestAnimationFrame(draw); }
    function stop() { running = false; }

    resize();
    var rT; w.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(resize, 150); });
    canvas.parentElement.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    canvas.parentElement.addEventListener('pointerleave', function () { mouse.x = -9999; mouse.y = -9999; });
    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: 0.02 }).observe(canvas);
    } else { start(); }
    d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else if (canvas.getBoundingClientRect().bottom > 0) start(); });
  }

  /* ---------- Hero: split title + intro timeline ---------- */
  var title = $('.hero-title');
  if (title) {
    $$('.word', title).forEach(function (word) {
      var text = word.textContent; word.textContent = '';
      Array.prototype.forEach.call(text, function (ch) {
        var s = d.createElement('span'); s.className = 'char'; s.textContent = ch; word.appendChild(s);
      });
    });
    if (animate) {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .to('.hero-title .char', { y: 0, duration: 1.15, stagger: 0.032 }, 0.15)
        .to('.hero-fade-in', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.75);
    }
  }

  /* ---------- Hero: rotating role ---------- */
  var rot = $('.rotator');
  if (rot) {
    var items = $$('span', rot), idx = 0;
    var fitRotator = function () { rot.style.width = Math.ceil(items[idx].getBoundingClientRect().width) + 'px'; };
    items[0].classList.add('is-in');
    fitRotator();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(fitRotator);
    w.addEventListener('resize', fitRotator);
    if (!reduced && items.length > 1) {
      setInterval(function () {
        var cur = items[idx]; idx = (idx + 1) % items.length; var nxt = items[idx];
        cur.classList.remove('is-in'); cur.classList.add('is-out'); nxt.classList.add('is-in');
        fitRotator();
        setTimeout(function () { cur.classList.remove('is-out'); }, 700);
      }, 2800);
    }
  }

  /* ---------- Tilt ---------- */
  function initTilt(els) {
    if (!fine || reduced || typeof w.VanillaTilt === 'undefined' || !els.length) return;
    VanillaTilt.init(els, { max: 5, speed: 700, scale: 1.01, glare: true, 'max-glare': 0.10, gyroscope: false });
  }

  /* ---------- Scroll reveals ---------- */
  if (hasST && !reduced) {
    $$('[data-reveal]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: parseFloat(el.getAttribute('data-reveal-delay') || '0'),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete: function () { if (el.hasAttribute('data-tilt')) initTilt([el]); else initTilt($$('[data-tilt]', el)); }
      });
    });
    $$('[data-reveal-group]').forEach(function (g) {
      var kids = Array.prototype.slice.call(g.children);
      gsap.to(kids, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09,
        scrollTrigger: { trigger: g, start: 'top 85%', once: true },
        onComplete: function () { initTilt(kids.filter(function (k) { return k.hasAttribute('data-tilt'); })); }
      });
    });
    var heroWrap = $('.hero .wrap');
    if (heroWrap) gsap.to(heroWrap, { y: 110, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    var portrait = $('.portrait-wrap');
    if (portrait) gsap.fromTo(portrait, { y: 30 }, { y: -30, ease: 'none', immediateRender: false, scrollTrigger: { trigger: portrait, start: 'top bottom', end: 'bottom top', scrub: true } });
  } else {
    var targets = $$('[data-reveal]').concat($$('[data-reveal-group] > *'));
    if (!reduced && 'IntersectionObserver' in w) {
      var revIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-revealed'); revIO.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -10% 0px' });
      targets.forEach(function (t) { revIO.observe(t); });
    } else {
      targets.forEach(function (t) { t.classList.add('is-revealed'); });
    }
    initTilt($$('[data-tilt]'));
  }

  /* ---------- Project visuals ---------- */
  $$('[data-matrix]').forEach(function (svg) {
    var ns = 'http://www.w3.org/2000/svg', size = 17, gap = 4, ox = 116, oy = 48, n = 0;
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var p = Math.exp(-(Math.pow(r - 1.3, 2) + Math.pow(c - 1.05, 2)) / 3.2);
        var rect = d.createElementNS(ns, 'rect');
        rect.setAttribute('x', ox + c * (size + gap)); rect.setAttribute('y', oy + r * (size + gap));
        rect.setAttribute('width', size); rect.setAttribute('height', size); rect.setAttribute('rx', 4);
        rect.setAttribute('class', 'cell ' + (p > 0.12 ? 'accf' : 'inkf'));
        rect.setAttribute('fill-opacity', (0.08 + p * 0.92).toFixed(2));
        rect.style.setProperty('--i', n++);
        svg.appendChild(rect);
      }
    }
  });
  if ('IntersectionObserver' in w) {
    var projIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); projIO.unobserve(en.target); } });
    }, { threshold: 0.35 });
    $$('.proj').forEach(function (p) { projIO.observe(p); });
  }

  /* ---------- Clock (Singapore) ---------- */
  var clocks = $$('[data-clock]');
  if (clocks.length && w.Intl && Intl.DateTimeFormat) {
    var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', hour12: false });
    var tickClock = function () { var s = fmt.format(new Date()) + ' SGT'; clocks.forEach(function (c) { c.textContent = s; }); };
    tickClock(); setInterval(tickClock, 15000);
  }
  $$('[data-year]').forEach(function (y) { y.textContent = String(new Date().getFullYear()); });

  /* ---------- Copy email ---------- */
  $$('[data-copy]').forEach(function (btn) {
    var lbl = $('span', btn), orig = lbl ? lbl.textContent : '';
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy');
      var done = function () {
        btn.classList.add('is-copied'); if (lbl) lbl.textContent = 'Copied';
        setTimeout(function () { btn.classList.remove('is-copied'); if (lbl) lbl.textContent = orig; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(val).then(done, done);
      else { var ta = d.createElement('textarea'); ta.value = val; d.body.appendChild(ta); ta.select(); try { d.execCommand('copy'); } catch (e) {} d.body.removeChild(ta); done(); }
    });
  });

  /* ---------- Contact form ---------- */
  var form = $('.form');
  if (form) {
    var status = $('.form-status', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.name && form.name.value || '').trim();
      var email = (form.email && form.email.value || '').trim();
      var msg = (form.message && form.message.value || '').trim();
      if (!name || !email || !msg) { if (status) { status.style.color = 'var(--accent)'; status.textContent = 'Please fill in all three fields.'; } return; }
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) {
        if (status) { status.style.color = ''; status.textContent = 'Sending…'; }
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ name: name, email: email, message: msg }) })
          .then(function (r) { if (!r.ok) throw new Error('bad'); if (status) status.textContent = 'Sent. Thanks, I will reply soon.'; form.reset(); })
          .catch(function () { if (status) { status.style.color = 'var(--accent)'; status.textContent = 'That did not go through. Email me directly instead.'; } });
        return;
      }
      var subject = encodeURIComponent('Hello from ' + name);
      var body = encodeURIComponent(msg + '\n\n' + name + '\n' + email);
      w.location.href = 'mailto:prithvi.bhardwaj@u.nus.edu?subject=' + subject + '&body=' + body;
      if (status) { status.style.color = ''; status.textContent = 'Opening your email app…'; }
    });
  }
})();
