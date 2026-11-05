/* SkiTag · „Für jeden am Berg“: selbst seitwärts scrollen.
   Wischen, Trackpad, Shift + Mausrad, Ziehen mit der Maus und die beiden
   Pfeilknöpfe. Kurz tippen springt eine Karte weiter, gedrückt halten
   scrollt langsam, solange man hält. Ohne JavaScript bleibt die Leiste ein
   normaler, waagrecht scrollbarer Bereich. */
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
  schiene.addEventListener("scroll", knoepfe, { passive: true });
  window.addEventListener("resize", knoepfe);
  knoepfe();

  // Pfeil: kurz tippen = eine Karte, halten = langsam scrollen
  var GESCHW = 0.28; // Pixel pro Millisekunde, rund 280 px pro Sekunde
  var verbinden = function (knopf, richtung) {
    if (!knopf) return;
    var start = 0, letzt = 0, haelt = false, gerollt = false, lauf = 0;
    var rollen = function (jetzt) {
      if (!haelt) return;
      if (jetzt - start > 260) {
        if (!gerollt) { gerollt = true; schiene.classList.add("rollt"); }
        schiene.scrollLeft += richtung * GESCHW * (jetzt - letzt);
      }
      letzt = jetzt;
      lauf = requestAnimationFrame(rollen);
    };
    var los = function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      haelt = true; gerollt = false; start = letzt = performance.now();
      if (knopf.setPointerCapture && e.pointerId !== undefined) { try { knopf.setPointerCapture(e.pointerId); } catch (_) {} }
      lauf = requestAnimationFrame(rollen);
    };
    var stopp = function () {
      if (!haelt) return;
      haelt = false; cancelAnimationFrame(lauf);
      if (gerollt) schiene.classList.remove("rollt");
      else schiene.scrollBy({ left: richtung * schritt(), behavior: ohneBewegung ? "auto" : "smooth" });
    };
    knopf.addEventListener("pointerdown", los);
    knopf.addEventListener("pointerup", stopp);
    knopf.addEventListener("pointercancel", stopp);
    knopf.addEventListener("lostpointercapture", stopp);
    knopf.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    // Tastatur: Enter oder Leertaste = eine Karte
    knopf.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!e.repeat) schiene.scrollBy({ left: richtung * schritt(), behavior: ohneBewegung ? "auto" : "smooth" }); }
    });
  };
  verbinden(zurueck, -1);
  verbinden(weiter, 1);

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
