/* SkiTag · Chip-Seite, Abschnitt „Größe“ (Feedback 153): Chip neben einer Bankkarte im richtigen Verhältnis.
   Kommt die Fläche ins Bild, kommen Karte und Chip, die Maßlinien zeichnen sich ein und die Zahlen zählen hoch.
   Der Knopf „Auf die Karte legen“ legt den Chip quer auf die Karte und wieder zurück. Ohne JavaScript steht das Endbild. */
(function () {
  "use strict";
  var teil = document.getElementById("groesse");
  if (!teil) return;
  var knopf = teil.querySelector(".masz__legen");
  var flaeche = teil.querySelector(".masz__flaeche");
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var zahlen = Array.prototype.slice.call(teil.querySelectorAll("[data-zahl]"));

  var zaehlen = function () {
    if (still) return;
    var t0 = performance.now();
    var schritt = function (jetzt) {
      var p = Math.min(1, (jetzt - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
      zahlen.forEach(function (z) { z.textContent = Math.round(+z.getAttribute("data-zahl") * e); });
      if (p < 1) requestAnimationFrame(schritt);
    };
    requestAnimationFrame(schritt);
  };

  if (knopf) {
    knopf.hidden = false;
    knopf.addEventListener("click", function () {
      var an = !teil.classList.contains("liegt");
      teil.classList.toggle("liegt", an);
      knopf.setAttribute("aria-pressed", an ? "true" : "false");
      knopf.textContent = an ? "Wieder daneben legen" : "Auf die Karte legen";
    });
  }

  if (!("IntersectionObserver" in window)) return;
  teil.classList.add("masz-an");
  var io = new IntersectionObserver(function (eintraege) {
    if (!eintraege[0].isIntersecting) return;
    io.disconnect();
    teil.classList.add("ist-da");
    zaehlen();
  }, { threshold: 0.35 });
  io.observe(flaeche);
})();
