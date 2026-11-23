/* App-Abschnitt der Startseite (Feedback 151): spielt im Handy App Store → Laden → Öffnen → Code → Los geht's ab,
   in Schleife, solange der Abschnitt im Bild ist. Bei weniger Bewegung bleibt Schritt 3 stehen. */
(function () {
  var buehne = document.querySelector('.app-start__buehne');
  if (!buehne) return;
  var ast = buehne.querySelector('.ast');
  var ring = buehne.querySelector('.ast__ring');
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t0 = 0, raf = 0, sichtbar = false;
  var DAUER = 13000;
  function schritt(n) { if (buehne.dataset.schritt !== String(n)) { buehne.dataset.schritt = n; ast.dataset.schritt = n; } }
  function bild(t) {
    var z = (t - t0) % DAUER;
    if (z < 4600) {
      schritt(1);
      if (z < 1400) ast.dataset.holen = '';
      else if (z < 3300) { ast.dataset.holen = 'laedt'; ring.style.setProperty('--fort', ((z - 1400) / 1900).toFixed(3)); }
      else ast.dataset.holen = 'offen';
    } else if (z < 8800) schritt(2);
    else schritt(3);
    if (sichtbar) raf = requestAnimationFrame(bild);
  }
  buehne.dataset.schritt = '1';
  if (ruhig) { schritt(3); return; }
  new IntersectionObserver(function (e) {
    var war = sichtbar; sichtbar = e[0].isIntersecting;
    if (sichtbar && !war) { t0 = performance.now(); raf = requestAnimationFrame(bild); }
    if (!sichtbar) cancelAnimationFrame(raf);
  }, { threshold: 0.25 }).observe(buehne);
})();
