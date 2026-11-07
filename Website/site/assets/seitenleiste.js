/* SkiTag · Seitenleiste (nur unter 1200 px Breite): fährt links heraus, wenn man mit der Maus über das
   Logo fährt, und verschwindet wieder, wenn man sie verlässt. Auf dem Handy
   und mit der Tastatur öffnet ein Klick bzw. Enter auf das Logo die Leiste.
   Ohne JavaScript springt das Logo nach oben. */
(function () {
  "use strict";
  var marke = document.querySelector(".marke");
  var leiste = document.getElementById("seitenleiste");
  if (!marke || !leiste || typeof leiste.show !== "function") return;
  var ohneBewegung = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mitMaus = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var links = leiste.querySelectorAll("nav a");
  var leistenMarke = leiste.querySelector(".seite__marke");
  var zuTimer = 0, aufTimer = 0, perKlick = false, hoverSperre = false;
  // Am breiten Bildschirm stehen die Abschnitte als Sprungleiste an der Seite
  // (sprungleiste.js); dort führt das Logo nur an den Anfang. Gleiche
  // Bedingung wie in seite.css.
  var breit = window.matchMedia("(min-width: 1200px) and (min-height: 520px)");

  var modusSetzen = function () {
    if (breit.matches) {
      ["role", "aria-haspopup", "aria-controls", "aria-expanded"].forEach(function (n) { marke.removeAttribute(n); });
      marke.setAttribute("aria-label", "SkiTag, zum Anfang");
      if (leiste.open) { leiste.classList.remove("geht-zu"); leiste.close(); perKlick = false; }
    } else {
      marke.setAttribute("role", "button");
      marke.setAttribute("aria-haspopup", "true");
      marke.setAttribute("aria-controls", "seitenleiste");
      marke.setAttribute("aria-expanded", leiste.open ? "true" : "false");
      marke.setAttribute("aria-label", "SkiTag, Inhalt öffnen");
    }
  };
  modusSetzen();
  if (breit.addEventListener) breit.addEventListener("change", modusSetzen);

  var aktuell = function () {
    var mitte = window.innerHeight * 0.4, treffer = links[0];
    links.forEach(function (a) {
      var ziel = document.querySelector(a.getAttribute("href"));
      if (ziel && ziel.getBoundingClientRect().top <= mitte) treffer = a;
    });
    links.forEach(function (a) { if (a === treffer) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  };

  var oeffnen = function (fokus) {
    clearTimeout(zuTimer);
    if (leiste.open) { if (fokus) (leiste.querySelector('nav a[aria-current="true"]') || links[0]).focus(); return; }
    aktuell();
    leiste.classList.remove("geht-zu");
    leiste.show();
    marke.setAttribute("aria-expanded", "true");
    if (fokus) (leiste.querySelector('nav a[aria-current="true"]') || links[0]).focus();
  };
  var schliessen = function (fokusZurueck) {
    clearTimeout(aufTimer);
    if (!leiste.open || leiste.classList.contains("geht-zu")) return;
    leiste.classList.add("geht-zu");
    var fertig = function () {
      leiste.classList.remove("geht-zu");
      leiste.close();
      marke.setAttribute("aria-expanded", "false");
      perKlick = false;
      if (fokusZurueck) marke.focus();
    };
    if (ohneBewegung) fertig(); else setTimeout(fertig, 200);
  };
  var spaeterZu = function () { clearTimeout(zuTimer); zuTimer = setTimeout(function () { if (!perKlick) schliessen(false); }, 260); };

  // Maus: drüberfahren öffnet, verlassen schließt
  if (mitMaus) {
    marke.addEventListener("mouseenter", function () { if (hoverSperre || breit.matches) return; clearTimeout(zuTimer); aufTimer = setTimeout(function () { oeffnen(false); }, 90); });
    marke.addEventListener("mouseleave", function () { hoverSperre = false; clearTimeout(aufTimer); spaeterZu(); });
    leiste.addEventListener("mouseenter", function () { clearTimeout(zuTimer); });
    leiste.addEventListener("mouseleave", spaeterZu);
    // Sperre nach einem Sprung endet, sobald die Maus nicht mehr über dem Logo ist
    document.addEventListener("mousemove", function (e) { if (hoverSperre && !marke.contains(e.target)) hoverSperre = false; }, { passive: true });
  }

  // Klick, Tippen und Tastatur
  marke.addEventListener("click", function (e) {
    if (breit.matches) return;   // normaler Link an den Anfang
    e.preventDefault();
    if (leiste.open && perKlick) { schliessen(false); return; }
    perKlick = true;
    oeffnen(e.detail === 0);
  });
  leiste.querySelector(".seite__zu").addEventListener("click", function () { schliessen(true); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && leiste.open) schliessen(true); });
  document.addEventListener("pointerdown", function (e) {
    if (!leiste.open) return;
    if (leiste.contains(e.target) || marke.contains(e.target)) return;
    schliessen(false);
  });

  if (leistenMarke) leistenMarke.addEventListener("click", function (e) {
    e.preventDefault();
    perKlick = false;
    hoverSperre = true;
    schliessen(false);
    window.scrollTo({ top: 0, behavior: ohneBewegung ? "auto" : "smooth" });
    if (history.replaceState) history.replaceState(null, "", "#oben");
  });

  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var ziel = document.querySelector(a.getAttribute("href"));
      if (!ziel) return;
      e.preventDefault();
      perKlick = false;
      hoverSperre = true;
      schliessen(false);
      ziel.scrollIntoView({ behavior: ohneBewegung ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
    });
  });
})();
