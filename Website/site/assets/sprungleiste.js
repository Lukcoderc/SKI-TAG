/* SkiTag · Seitenleiste als Blatt am breiten Bildschirm.
   Markiert den Abschnitt, in dem man gerade ist. Die Links selbst sind
   normale Sprungmarken und funktionieren auch ohne JavaScript. */
(function () {
  "use strict";
  var leiste = document.querySelector(".sprungleiste");
  if (!leiste) return;
  var links = Array.prototype.slice.call(leiste.querySelectorAll(".sprungleiste__nav a"));
  var ziele = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var breit = window.matchMedia("(min-width: 1200px) and (min-height: 520px)");
  var wartet = false;

  var setzen = function () {
    wartet = false;
    if (!breit.matches) return;
    var mitte = window.innerHeight * 0.4, aktiv = -1;
    ziele.forEach(function (z, i) {
      if (!z) return;
      var r = z.getBoundingClientRect();
      if (r.top <= mitte && r.bottom > mitte) aktiv = i;
    });
    links.forEach(function (a, i) {
      if (i === aktiv) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  };
  var anfragen = function () { if (!wartet) { wartet = true; requestAnimationFrame(setzen); } };

  window.addEventListener("scroll", anfragen, { passive: true });
  window.addEventListener("resize", anfragen);
  if (breit.addEventListener) breit.addEventListener("change", anfragen);
  // nach einem Mausklick den Fokusrahmen nicht stehen lassen (Tastatur behält ihn)
  leiste.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function (e) { if (e.detail > 0) a.blur(); }); });
  setzen();
})();
