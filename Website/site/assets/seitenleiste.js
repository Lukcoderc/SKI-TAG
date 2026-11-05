/* SkiTag · Seitenleiste: Klick auf das Logo klappt links eine Leiste mit
   allen Abschnitten aus. Ohne JavaScript springt das Logo nach oben. */
(function () {
  "use strict";
  var marke = document.querySelector(".marke");
  var leiste = document.getElementById("seitenleiste");
  if (!marke || !leiste || typeof leiste.showModal !== "function") return;
  var ohneBewegung = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var links = leiste.querySelectorAll("nav a");

  marke.setAttribute("role", "button");
  marke.setAttribute("aria-haspopup", "dialog");
  marke.setAttribute("aria-controls", "seitenleiste");
  marke.setAttribute("aria-expanded", "false");
  marke.setAttribute("aria-label", "SkiTag, Inhalt öffnen");

  // welcher Abschnitt gerade zu sehen ist
  var aktuell = function () {
    var mitte = window.innerHeight * 0.4, treffer = links[0];
    links.forEach(function (a) {
      var ziel = document.querySelector(a.getAttribute("href"));
      if (ziel && ziel.getBoundingClientRect().top <= mitte) treffer = a;
    });
    links.forEach(function (a) { if (a === treffer) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  };

  var oeffnen = function () {
    aktuell();
    leiste.showModal();
    marke.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("leiste-offen");
    var jetzt = leiste.querySelector('nav a[aria-current="true"]') || links[0];
    if (jetzt) jetzt.focus();
  };
  var schliessen = function () {
    if (!leiste.open) return;
    leiste.classList.add("geht-zu");
    var fertig = function () {
      leiste.classList.remove("geht-zu");
      leiste.close();
    };
    if (ohneBewegung) fertig(); else setTimeout(fertig, 180);
  };
  leiste.addEventListener("close", function () {
    marke.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("leiste-offen");
  });

  marke.addEventListener("click", function (e) { e.preventDefault(); if (leiste.open) schliessen(); else oeffnen(); });
  leiste.querySelector(".seite__zu").addEventListener("click", schliessen);
  // Klick neben die Leiste schließt sie
  leiste.addEventListener("click", function (e) { if (e.target === leiste) schliessen(); });
  leiste.addEventListener("cancel", function (e) { e.preventDefault(); schliessen(); });

  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var ziel = document.querySelector(a.getAttribute("href"));
      if (!ziel) return;
      e.preventDefault();
      schliessen();
      setTimeout(function () {
        ziel.scrollIntoView({ behavior: ohneBewegung ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
      }, ohneBewegung ? 0 : 190);
    });
  });
})();
