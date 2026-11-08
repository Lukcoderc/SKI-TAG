/* SkiTag · Seitenleiste am breiten Bildschirm.
   Je Link zwei Werte, die seite.css in Größe, Strich und Abstand übersetzt:
   --w     wie sehr man gerade in diesem Abschnitt ist (0 bis 1)
   --dehn  wie weit man mitten im Übergang vom Abschnitt davor ist (0 bis 1,
           am größten genau auf der Grenze); der Abstand zieht sich dann in die Länge.
   Liegt mehr als die Hälfte des Fensters auf dunklen Flächen, wird die Leiste dunkel.
   Die Links selbst sind normale Sprungmarken und funktionieren auch ohne JavaScript. */
(function () {
  "use strict";
  var leiste = document.querySelector(".sprungleiste");
  if (!leiste) return;
  var links = Array.prototype.slice.call(leiste.querySelectorAll(".sprungleiste__nav a"));
  var ziele = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var dunkel = document.querySelectorAll(".nacht, .fuss");
  var breit = window.matchMedia("(min-width: 1200px) and (min-height: 520px)");
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wartet = false;

  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var weich = function (x) { return x * x * (3 - 2 * x); };

  var setzen = function () {
    wartet = false;
    if (!breit.matches) return;
    var hoehe = window.innerHeight;
    var linie = hoehe * 0.4;      // Leselinie, wie bisher
    var zone = hoehe * 0.55;      // so lang dauert ein Übergang beim Scrollen
    // wie weit eine Kante (oben/unten eines Abschnitts) schon über die Leselinie gerutscht ist
    var drueber = function (kante) { return klemme((linie + zone / 2 - kante) / zone); };

    var rects = ziele.map(function (z) { return z ? z.getBoundingClientRect() : null; });
    links.forEach(function (a, i) {
      var r = rects[i];
      var w = 0, dehn = 0;
      if (r) {
        var rein = drueber(r.top), raus = drueber(r.bottom);
        w = weich(rein) * (1 - weich(raus));
        // Übergang vom Abschnitt davor (nur wenn der direkt anschließt)
        var vorher = rects[i - 1];
        if (vorher && Math.abs(vorher.bottom - r.top) < 2) dehn = Math.sin(Math.PI * rein);
      }
      if (ruhig.matches) { w = w > 0.5 ? 1 : 0; dehn = 0; }
      a.style.setProperty("--w", w.toFixed(3));
      a.style.setProperty("--dehn", dehn.toFixed(3));
      if (w > 0.5) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });

    var nacht = 0;
    Array.prototype.forEach.call(dunkel, function (el) {
      var r = el.getBoundingClientRect();
      nacht += Math.max(0, Math.min(r.bottom, hoehe) - Math.max(r.top, 0));
    });
    leiste.classList.toggle("ist-nacht", nacht > hoehe * 0.5);
  };
  var anfragen = function () { if (!wartet) { wartet = true; requestAnimationFrame(setzen); } };

  window.addEventListener("scroll", anfragen, { passive: true });
  window.addEventListener("resize", anfragen);
  if (breit.addEventListener) breit.addEventListener("change", anfragen);
  // nach einem Mausklick den Fokusrahmen nicht stehen lassen (Tastatur behält ihn)
  leiste.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function (e) { if (e.detail > 0) a.blur(); }); });
  setzen();
})();
