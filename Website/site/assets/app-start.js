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
    buehne.dataset.schritt = (p === 'store' || p === 'laedt' || p === 'offen') ? '1' : (p === 'app' ? '3' : '2');
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

/* Auftritt beim Hineinscrollen (Feedback 153: „Die App. Immer passend zu dir.“ besser animieren): das Handy steigt
   von unten auf und richtet sich auf, die vier Fotos fliegen von außen an ihren Platz, die Infofelder gleiten herein.
   Am Scrollen festgemacht (vor und zurück), danach ziehen die Fotos beim Weiterscrollen leicht mit (Tiefe).
   Bei weniger Bewegung oder ohne GSAP steht alles gleich an seinem Platz. */
(function () {
  var buehne = document.querySelector('.app-start__buehne');
  if (!buehne || !window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var gs = window.gsap; gs.registerPlugin(window.ScrollTrigger);
  var handy = buehne.querySelector('.app-start__handy');
  var fotos = Array.prototype.slice.call(buehne.querySelectorAll('.asf'));
  var felder = buehne.querySelector('.app-start__felder');
  // die Fotos liegen am Anfang weit außerhalb; damit sie trotzdem rechtzeitig laden, früh auf „sofort laden“ stellen
  new IntersectionObserver(function (e, io) {
    if (!e[0].isIntersecting) return;
    fotos.forEach(function (f) { f.loading = 'eager'; }); io.disconnect();
  }, { rootMargin: '150% 0px' }).observe(buehne);

  var schmal = window.matchMedia('(max-width: 899px)').matches;
  var w = function (v) { return function () { return v * window.innerWidth / 100; }; };
  var h = function (v) { return function () { return v * window.innerHeight / 100; }; };
  // woher jedes Foto kommt: [x in vw, y in vh, Drehung]
  var her = schmal
    ? [[-70, 10, -16], [-70, 20, 12], [70, -8, 14], [70, 16, -12]]
    : [[-55, 18, -18], [-45, 38, 14], [55, -14, 16], [50, 32, -14]];
  var tl = gs.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: buehne, start: 'top 98%', end: schmal ? 'top 30%' : 'center 58%', scrub: 0.9, invalidateOnRefresh: true }
  });
  tl.from(handy, { y: h(42), rotation: -9, scale: 0.78, opacity: 0, duration: 1, ease: 'power2.out' }, 0);
  fotos.forEach(function (f, i) {
    tl.from(f, { x: w(her[i][0]), y: h(her[i][1]), rotation: her[i][2], scale: 0.86, opacity: 0, duration: 0.85 }, 0.08 + i * 0.07);
  });
  if (felder) tl.from(felder, { x: schmal ? 0 : w(18), y: schmal ? h(8) : 0, opacity: 0, duration: 0.6 }, 0.45);

  // danach: Tiefe beim Weiterscrollen, die Fotos ziehen verschieden schnell mit
  if (!schmal) {
    var tiefe = [-60, 50, -40, 70];
    fotos.forEach(function (f, i) {
      gs.to(f, { yPercent: tiefe[i] * 0.25, ease: 'none', scrollTrigger: { trigger: buehne, start: 'center 58%', end: 'bottom top', scrub: true } });
    });
  }
})();
