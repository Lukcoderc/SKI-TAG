/* SkiTag · „Für jeden am Berg“: selbst seitwärts scrollen.
   Wischen, Trackpad, Shift + Mausrad, Pfeiltasten im Bereich, Ziehen mit
   der Maus und die beiden Pfeilknöpfe. Ohne JavaScript bleibt die Leiste
   ein normaler, waagrecht scrollbarer Bereich. */
(function () {
  "use strict";
  var schiene = document.querySelector(".jeden__schiene");
  if (!schiene) return;
  var zurueck = document.querySelector('[data-schiene="zurueck"]');
  var weiter = document.querySelector('[data-schiene="weiter"]');
  var ohneBewegung = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var schritt = function () {
    var erstes = schiene.querySelector(".fahrer");
    if (!erstes) return schiene.clientWidth * 0.8;
    var abstand = parseFloat(getComputedStyle(schiene).columnGap) || 0;
    return erstes.getBoundingClientRect().width + abstand;
  };
  var knoepfe = function () {
    var max = schiene.scrollWidth - schiene.clientWidth - 2;
    if (zurueck) zurueck.disabled = schiene.scrollLeft <= 2;
    if (weiter) weiter.disabled = schiene.scrollLeft >= max;
  };
  var fahren = function (richtung) {
    schiene.scrollBy({ left: richtung * schritt(), behavior: ohneBewegung ? "auto" : "smooth" });
  };
  if (zurueck) zurueck.addEventListener("click", function () { fahren(-1); });
  if (weiter) weiter.addEventListener("click", function () { fahren(1); });
  schiene.addEventListener("scroll", knoepfe, { passive: true });
  window.addEventListener("resize", knoepfe);
  knoepfe();

  // Beim Runterscrollen läuft die Leiste mit. Was man selbst seitwärts
  // scrollt, bleibt als Versatz erhalten, beides addiert sich.
  var abschnitt = document.getElementById("jeden");
  var versatz = 0, eigeneZeile = -1, letzteBasis = -1;
  if (abschnitt && !ohneBewegung) {
    schiene.classList.add("wird-gefuehrt");
    var basis = function () {
      var p = parseFloat(getComputedStyle(abschnitt).getPropertyValue("--sc-p")) || 0;
      var t = Math.min(1, Math.max(0, (p - 0.06) / 0.82));
      return t * (schiene.scrollWidth - schiene.clientWidth);
    };
    schiene.addEventListener("scroll", function () {
      // eine Bewegung, die nicht von uns kommt, ist eigenes Scrollen
      if (Math.abs(schiene.scrollLeft - eigeneZeile) > 1.5) versatz = schiene.scrollLeft - basis();
    }, { passive: true });
    var fuehren = function () {
      var b = basis();
      if (Math.abs(b - letzteBasis) > 0.5) {
        letzteBasis = b;
        var max = schiene.scrollWidth - schiene.clientWidth;
        var ziel = Math.min(max, Math.max(0, b + versatz));
        eigeneZeile = ziel;
        schiene.scrollLeft = ziel;
      }
      requestAnimationFrame(fuehren);
    };
    requestAnimationFrame(fuehren);
  }

  // Ziehen mit der Maus (Finger und Trackpad scrollen ohnehin selbst)
  var zieht = false, startX = 0, startLinks = 0, bewegt = false;
  schiene.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    zieht = true; bewegt = false; startX = e.clientX; startLinks = schiene.scrollLeft;
    schiene.classList.add("zieht");
  });
  window.addEventListener("pointermove", function (e) {
    if (!zieht) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 4) bewegt = true;
    schiene.scrollLeft = startLinks - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!zieht) return;
    zieht = false; schiene.classList.remove("zieht");
  });
  schiene.addEventListener("click", function (e) { if (bewegt) { e.preventDefault(); e.stopPropagation(); bewegt = false; } }, true);
})();
