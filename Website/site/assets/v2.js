/* SkiTag · Gestaltung v2 (Feedback 128): kleine gemeinsame Helfer für alle neu aufgebauten Seiten.
   - [data-auf]: gleitet einmal weich herein, sobald es ins Bild kommt (Gruppen mit data-auf-gruppe nacheinander);
   - .wort-wechsel[data-woerter]: das Wort im Titel wechselt ruhig von unten nach oben;
   - video[data-v2-film]: spielt nur, solange es zu sehen ist, und gar nicht bei „weniger Bewegung“.
   Ohne JavaScript steht alles einfach da. */
(function () {
  "use strict";
  var wurzel = document.documentElement;
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  wurzel.classList.add("js-v2");

  /* Einblenden */
  var auf = document.querySelectorAll("[data-auf]");
  document.querySelectorAll("[data-auf-gruppe]").forEach(function (g) {
    Array.prototype.forEach.call(g.querySelectorAll("[data-auf]"), function (el, i) { el.style.setProperty("--v-verz", (i * 90) + "ms"); });
  });
  if (!("IntersectionObserver" in window) || ruhig) {
    auf.forEach(function (el) { el.classList.add("ist-auf"); });
  } else {
    var beob = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("ist-auf"); beob.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    auf.forEach(function (el) { beob.observe(el); });
  }

  /* Große Überschrift jeder Seite: Wort für Wort aus der Unschärfe (wie der Einstieg der Startseite).
     Die Wörter werden in Spans gelegt, Zeilenumbrüche und hervorgehobene Teile (.leise) bleiben erhalten. */
  if (!ruhig) document.querySelectorAll("main h1.titel-1, main h1.sc-display").forEach(function (h) {
    var n = 0;
    var gehen = function (knoten) {
      Array.prototype.slice.call(knoten.childNodes).forEach(function (k) {
        if (k.nodeType === 3) {
          var teile = k.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          teile.forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var sp = document.createElement("span"); sp.className = "wb-h"; sp.style.setProperty("--w", n++); sp.textContent = t; frag.appendChild(sp);
          });
          knoten.replaceChild(frag, k);
        } else if (k.nodeType === 1 && !k.classList.contains("nur-vorlesen")) gehen(k);
      });
    };
    gehen(h);
    h.classList.add("wb-rein");
    requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add("ist-da"); }); });
  });

  /* Wort im Titel */
  document.querySelectorAll(".wort-wechsel[data-woerter]").forEach(function (el) {
    var woerter = el.getAttribute("data-woerter").split("|"), i = 0;
    if (ruhig || woerter.length < 2) return;
    setInterval(function () {
      if (document.hidden) return;
      i = (i + 1) % woerter.length;
      el.classList.add("ist-weg");
      setTimeout(function () { el.textContent = woerter[i]; el.classList.remove("ist-weg"); el.classList.add("ist-neu");
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove("ist-neu"); }); }); }, 320);
    }, 2600);
  });

  /* Videos nur im Bild */
  document.querySelectorAll("video[data-v2-film]").forEach(function (v) {
    if (ruhig) { v.removeAttribute("autoplay"); v.pause(); return; }
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
    }, { threshold: 0.1 }).observe(v);
  });
})();
