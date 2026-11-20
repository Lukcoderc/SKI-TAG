/* SkiTag · GSAP-Effekte für alle Seiten (Feedback 121).
   GSAP und SplitText liegen selbst ausgeliefert unter assets/vendor/ (GreenSock „Standard no-charge“-Lizenz, kostenlos,
   https://gsap.com/standard-license); die Seite lädt nichts von fremden Servern.
   Überschriften: Jede große Überschrift wird in Wörter geteilt, jedes Wort steckt in einer Maske und steigt von unten
   hinein, sobald die Überschrift ins Bild kommt (einmal). Steht sie beim Laden schon im Bild, bleibt sie, wie sie ist.
   Der Satz in den Bildfenstern (Feedback 133) kommt genauso.
   Ohne GSAP oder bei „weniger Bewegung“ passiert nichts. */
(function () {
  "use strict";
  if (!window.gsap || !window.SplitText || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(SplitText);

  var titel = Array.prototype.slice.call(document.querySelectorAll("h2.sc-display, h2.szene__titel, h2.wir-h2, p.fenster__satz"));
  var vh = window.innerHeight;
  titel = titel.filter(function (h) {
    var r = h.getBoundingClientRect();
    return r.width > 0 && !(r.top < vh && r.bottom > 0) && !h.closest("#am-berg") && !h.hasAttribute("data-eigener-auftritt");   // schon sichtbar: nicht anfassen; „Für deinen Skitag“ macht am-berg.js
  });
  var beob = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) {
      if (!e.isIntersecting) return;
      beob.unobserve(e.target);
      var w = e.target._gsWoerter;
      if (w) gsap.to(w, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, overwrite: true });
    });
  }, { threshold: 0.35 });

  if (titel.length) titel.forEach(function (h) {
    var teil = SplitText.create(h, { type: "words", mask: "words", wordsClass: "gs-wort" });
    h._gsWoerter = teil.words;
    gsap.set(teil.words, { yPercent: 110 });
    beob.observe(h);
  });

  /* Kennzahlen (data-hoch="Zielwert", Feedback 131): zählen einmal ruhig von 0 hoch, sobald sie im Bild sind,
     unabhängig vom Scrollen. Im HTML steht schon der Endwert (ohne JavaScript bleibt er einfach stehen). */
  var zahlen = document.querySelectorAll("[data-hoch]");
  if (zahlen.length) {
    var setzen = function (el, v) { el.textContent = (v < 0 ? "\u2212" : "") + Math.abs(Math.round(v)); };
    zahlen.forEach(function (el) { setzen(el, 0); });
    var zb = new IntersectionObserver(function (e) {
      e.forEach(function (x) {
        if (!x.isIntersecting) return;
        zb.unobserve(x.target);
        var el = x.target, o = { v: 0 }, ziel = parseFloat(el.getAttribute("data-hoch"));
        gsap.to(o, { v: ziel, duration: 1.6, ease: "power3.out", delay: 0.15, onUpdate: function () { setzen(el, o.v); } });
      });
    }, { threshold: 0.6 });
    zahlen.forEach(function (el) { zb.observe(el); });
  }
})();
