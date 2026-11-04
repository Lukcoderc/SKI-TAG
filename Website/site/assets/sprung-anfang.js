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
  var setzen = function () {
    var an = hoehe() > window.innerHeight * 1.2;
    knopf.classList.toggle("ist-sichtbar", an);
    knopf.tabIndex = an ? 0 : -1;
    knopf.setAttribute("aria-hidden", an ? "false" : "true");
  };
  window.addEventListener("scroll", setzen, { passive: true });
  window.addEventListener("resize", setzen);
  window.addEventListener("pageshow", setzen);
  setzen();

  knopf.addEventListener("click", function (e) {
    e.preventDefault();
    try { window.scrollTo({ top: 0, behavior: ohneBewegung ? "auto" : "smooth" }); }
    catch (_) { window.scrollTo(0, 0); }
    var marke = document.querySelector(".marke");
    if (marke) { try { marke.focus({ preventScroll: true }); } catch (_) { marke.focus(); } }
  });
})();
