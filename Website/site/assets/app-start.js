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
