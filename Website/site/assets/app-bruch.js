/* SkiTag · Fotobruch auf der App-Seite (Feedback 151, überarbeitet). Solange ein Bruch im Bild ist, rechnet die Schleife
   aus seiner Lage --auf (öffnet sich vom runden Fenster auf volle Breite, bis die Mitte erreicht ist) und --zieh
   (das Foto gleitet etwas langsamer als die Seite). Bei „weniger Bewegung“ bleibt alles offen und still. */
(function () {
  "use strict";
  var brueche = [].slice.call(document.querySelectorAll(".app-bruch"));
  if (!brueche.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var sichtbar = [], laeuft = false;
  var weich = function (t) { return t * t * (3 - 2 * t); };
  var takt = function () {
    var vh = window.innerHeight;
    sichtbar.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var mitte = (r.top + r.height / 2) / vh;                 // 1.5 unten draußen … 0.5 Mitte … -0.5 oben draußen
      var auf = weich(Math.min(1, Math.max(0, (1.35 - mitte) / 0.85)));
      var zieh = Math.max(-1, Math.min(1, (mitte - 0.5))) * 9;
      el.style.setProperty("--auf", auf.toFixed(3));
      el.style.setProperty("--zieh", zieh.toFixed(2));
    });
    laeuft = false;
  };
  var anstossen = function () { if (!laeuft && sichtbar.length) { laeuft = true; requestAnimationFrame(takt); } };
  var io = new IntersectionObserver(function (e) {
    e.forEach(function (x) {
      var i = sichtbar.indexOf(x.target);
      if (x.isIntersecting && i < 0) sichtbar.push(x.target);
      if (!x.isIntersecting && i >= 0) sichtbar.splice(i, 1);
    });
    anstossen();
  }, { rootMargin: "10% 0px" });
  brueche.forEach(function (el) { el.style.setProperty("--auf", "0"); io.observe(el); });
  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", anstossen);
})();
