/* App-Abschnitt der Startseite (Runde nach Feedback 151): das Handy zeigt eine App-Store-Seite und spielt in Schleife ab,
   solange der Abschnitt im Bild ist: Bildschirmfotos wischen, Laden tippen, Ring lädt, Öffnen tippen, die App wächst
   aus dem Icon, Einloggen, dann die Gruppe auf der Karte. Setzt data-phase an .ast und data-schritt (1 bis 3) an der
   Bühne für die Infofelder. Bei weniger Bewegung bleibt die App-Store-Seite stehen. */
(function () {
  var buehne = document.querySelector('.app-start__buehne');
  if (!buehne) return;
  var ast = buehne.querySelector('.ast');
  var knopf = buehne.querySelector('.st__knopf');
  var ring = buehne.querySelector('.st__ring');
  var finger = buehne.querySelector('.st__finger');
  var icon = buehne.querySelector('.st__icon');
  var app = buehne.querySelector('.ast__app');
  var karten = Array.prototype.slice.call(buehne.querySelectorAll('.asi'));
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t0 = 0, raf = 0, sichtbar = false, phase = '', getippt = {};
  var DAUER = 15500;
  // Zeitplan in ms: ab wann welche Phase gilt
  var PLAN = [[0, 'store'], [6200, 'laedt'], [8300, 'offen'], [9300, 'start'], [10000, 'login-a'], [11300, 'login-b'], [12600, 'app']];
  var TIPPS = [6000, 9050];
  function setze(p) {
    if (p === phase) return;
    if (p === 'offen') {
      // die App wächst genau aus dem Icon heraus
      var a = ast.getBoundingClientRect(), ic = icon.getBoundingClientRect();
      app.style.transformOrigin = (ic.left - a.left + ic.width / 2) + 'px ' + (ic.top - a.top + ic.height / 2) + 'px';
    }
    phase = p; ast.dataset.phase = p;
    var n = (p === 'store' || p === 'laedt' || p === 'offen') ? '1' : (p === 'app' ? '3' : '2');
    buehne.dataset.schritt = n;
    karten.forEach(function (k) { k.classList.toggle('ist-an', k.dataset.schritt === n); });
  }
  function tippe() {
    // Finger auf die Mitte des Knopfs setzen (in Pixeln innerhalb der Store-Seite)
    var a = ast.getBoundingClientRect(), k = knopf.getBoundingClientRect();
    finger.style.left = (k.left - a.left + k.width / 2) + 'px';
    finger.style.top = (k.top - a.top + k.height / 2) + 'px';
    ast.classList.remove('tippt'); void ast.offsetWidth; ast.classList.add('tippt');
    setTimeout(function () { ast.classList.remove('tippt'); }, 700);
  }
  function bild(t) {
    var z = (t - t0) % DAUER, runde = Math.floor((t - t0) / DAUER);
    var p = 'store';
    for (var i = 0; i < PLAN.length; i++) if (z >= PLAN[i][0]) p = PLAN[i][1];
    // kurz vor Schluss zurück zur Store-Seite (die App schrumpft ins Icon)
    if (z > DAUER - 700) p = 'store';
    if (p === 'store' && phase !== 'store' && phase !== '') { ring.style.setProperty('--fort', '0'); }
    setze(p);
    if (p === 'laedt') ring.style.setProperty('--fort', Math.min(1, (z - 6200) / 1900).toFixed(3));
    TIPPS.forEach(function (tz, n) {
      var key = runde + '-' + n;
      if (z >= tz && z < tz + 400 && !getippt[key]) { getippt[key] = 1; tippe(); }
    });
    if (sichtbar) raf = requestAnimationFrame(bild);
  }
  setze('store');
  if (ruhig) return;
  new IntersectionObserver(function (e) {
    var war = sichtbar; sichtbar = e[0].isIntersecting;
    if (sichtbar && !war) { t0 = performance.now(); getippt = {}; phase = ''; ast.dataset.phase = ''; void ast.offsetWidth; setze('store'); raf = requestAnimationFrame(bild); }
    if (!sichtbar) cancelAnimationFrame(raf);
  }, { threshold: 0.25 }).observe(buehne);
})();

/* Auftritt beim Hineinscrollen (Feedback 154, ersetzt das Einfliegen am Scrollen): einmal abgespielt, sobald die Bühne
   ins Bild kommt. Das Foto öffnet sich aus der Mitte, das Handy steigt auf, die drei Karten gleiten nacheinander herein.
   Weil es nicht am Scrollen hängt, gibt es keine halben Zwischenstände, in denen etwas übereinander liegt. Danach zieht
   nur das Bild im Foto beim Scrollen leicht mit (Tiefe). Ohne GSAP oder bei weniger Bewegung steht alles gleich da. */
(function () {
  var buehne = document.querySelector('.app-start__buehne');
  if (!buehne || !window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var gs = window.gsap; gs.registerPlugin(window.ScrollTrigger);
  var handy = buehne.querySelector('.app-start__handy');
  var foto = buehne.querySelector('.app-start__foto');
  var bild = foto && foto.querySelector('img');
  var karten = buehne.querySelectorAll('.asi');
  var schmal = window.matchMedia('(max-width: 899px)').matches;
  if (bild) new IntersectionObserver(function (e, io) { if (e[0].isIntersecting) { bild.loading = 'eager'; io.disconnect(); } }, { rootMargin: '150% 0px' }).observe(buehne);

  var tl = gs.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  if (foto) tl.fromTo(foto, { clipPath: 'inset(14% 22% 14% 22% round 2rem)', opacity: 0.4 }, { clipPath: 'inset(0% 0% 0% 0% round 0rem)', opacity: 1, duration: 1.2, ease: 'power3.inOut', clearProps: 'clipPath' }, 0);
  if (bild) tl.from(bild, { scale: 1.18, duration: 1.6 }, 0);
  tl.fromTo(handy, { y: schmal ? 50 : 90, rotation: -5, scale: 0.92, opacity: 0 }, { y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.1, clearProps: 'transform,translate,rotate,scale,opacity' }, 0.25);
  // fromTo mit festem Ziel und danach weg mit den Inline-Werten, sonst blockieren sie das Hervorheben der Karte per CSS
  tl.fromTo(karten, { x: schmal ? 0 : 50, y: schmal ? 24 : 0, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, stagger: 0.12, clearProps: 'transform,translate,rotate,scale,opacity' }, schmal ? 0.7 : 0.55);
  window.ScrollTrigger.create({ trigger: buehne, start: 'top 78%', once: true, onEnter: function () { tl.play(); } });

  // Tiefe: nur das Bild im Foto zieht beim Scrollen etwas mit, der Rahmen bleibt stehen
  if (bild) gs.fromTo(bild, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: buehne, start: 'top bottom', end: 'bottom top', scrub: true } });
})();
