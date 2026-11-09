/* SkiTag · Knopf „Nach oben“ unten rechts.
   Eigene Datei, damit der Knopf auch dann funktioniert, wenn ein anderes
   Skript scheitert. Ohne JavaScript bleibt er immer sichtbar und springt
   über den Anker #oben nach oben. */
(function () {
  "use strict";
  var knopf = document.querySelector(".sprung-anfang");
  if (!knopf) return;
  var ohneBewegung = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-oben");

  var hoehe = function () {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  };
  // Dunkelblaue Flächen; beim Gebirge zählt nur der untere, dunkle Teil
  var dunkel = document.querySelectorAll(".nacht, .fuss, .kachel--nacht, .blick__punkt--nacht");
  var gebirge = document.querySelector(".gebirge");
  var hellSetzen = function () {
    var k = knopf.getBoundingClientRect(), x = k.left + k.width / 2, y = k.top + k.height / 2, hell = false;
    var drin = function (r, oben) { return x >= r.left && x <= r.right && y >= oben && y <= r.bottom; };
    for (var i = 0; i < dunkel.length && !hell; i++) { var r = dunkel[i].getBoundingClientRect(); hell = drin(r, r.top); }
    if (!hell && gebirge) { var g = gebirge.getBoundingClientRect(); hell = drin(g, g.top + g.height * 0.55); }
    knopf.classList.toggle("ist-hell", hell);
  };
  var setzen = function () {
    hellSetzen();
    var an = hoehe() > window.innerHeight * 1.2;
    knopf.classList.toggle("ist-sichtbar", an);
    knopf.tabIndex = an ? 0 : -1;
    knopf.setAttribute("aria-hidden", an ? "false" : "true");
  };
  var wartet = false;
  window.addEventListener("scroll", function () { if (!wartet) { wartet = true; requestAnimationFrame(function () { wartet = false; setzen(); }); } }, { passive: true });
  window.addEventListener("resize", setzen);
  window.addEventListener("pageshow", setzen);
  setzen();

  knopf.addEventListener("click", function (e) {
    e.preventDefault();
    try { window.scrollTo({ top: 0, behavior: ohneBewegung ? "auto" : "smooth" }); }
    catch (_) { window.scrollTo(0, 0); }
    var marke = document.querySelector(".oben__marke");
    if (marke) { try { marke.focus({ preventScroll: true }); } catch (_) { marke.focus(); } }
  });
})();
