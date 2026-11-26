/* SkiTag · Startseite, „Für deinen Skitag.“ (Feedback 131): großer Auftritt mit GSAP (ScrollTrigger, SplitText).
   1. Die dunkle Fläche wächst beim Hereinscrollen aus einer abgerundeten Karte auf volle Breite (an den Scroll gebunden).
   2. Einmal, wenn die Oberkante des Abschnitts knapp über der Mitte des Fensters ist (vorher sähe man es kaum): die Augenbraue gleitet herein, die Überschrift klappt
      Buchstabe für Buchstabe in 3D von unten herein, der Satz steigt Zeile für Zeile aus einer Maske, die Linien der vier
      Aussagen zeichnen sich von links und der Text steigt darüber auf, die drei Fotokarten fliegen gekippt aus der Tiefe herein und das Foto darin zoomt auf.
   3. Danach bewegen sich die Karten beim Weiterscrollen unterschiedlich schnell (Tiefe).
   Bewegt werden nur transform, opacity und clip-path. Ohne GSAP oder bei „weniger Bewegung“ steht alles einfach da. */
(function () {
  "use strict";
  var akt = document.getElementById("am-berg");
  if (!akt || !window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  var handy = window.matchMedia("(max-width: 860px)").matches;

  var $ = function (s) { return akt.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(akt.querySelectorAll(s)); };
  var auge = $(".augenbraue"), titel = $("#am-berg-titel"), satz = $(".am-berg__satz");
  var liste = $(".am-berg__punkte"), punkte = $$(".am-berg__punkte li"), punktText = $$(".am-berg__punkte li span"), karten = $$(".am-berg__karte");
  var bilder = karten.map(function (k) { return k.querySelector("img"); }), texte = karten.map(function (k) { return k.querySelector("div"); });

  // 1 · Fläche: von der abgerundeten Karte zur vollen Breite
  gsap.fromTo(akt, { clipPath: handy ? "inset(0% 3% 0% 3% round 28px)" : "inset(0% 6% 0% 6% round 48px)" }, {
    clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
    scrollTrigger: { trigger: akt, start: "top bottom", end: "top 25%", scrub: 0.6 }
  });

  // 2 · Auftritt
  var buchstaben = SplitText.create(titel, { type: "words,chars", wordsClass: "ab-wort", charsClass: "ab-zeichen" }).chars;
  var zeilen = satz ? SplitText.create(satz, { type: "lines", mask: "lines", linesClass: "ab-zeile" }).lines : [];   // seit Feedback 156 ohne Satz
  gsap.set(titel, { perspective: 700 });
  gsap.set(buchstaben, { yPercent: 115, rotateX: -95, opacity: 0, transformOrigin: "50% 100% -20px" });
  gsap.set(auge, { x: -24, opacity: 0 });
  if (zeilen.length) gsap.set(zeilen, { yPercent: 105 });
  gsap.set([liste].concat(punkte), { "--linie": 0 });
  gsap.set(punkte, { "--strich": 0 });
  gsap.set(punktText, { y: 22, opacity: 0 });
  gsap.set(karten, { y: handy ? 120 : 220, rotateX: 32, rotateY: function (i) { return handy ? 0 : [-14, 0, 14][i] || 0; }, scale: 0.82, opacity: 0, transformPerspective: 1200, transformOrigin: "50% 100%" });
  gsap.set(bilder, { scale: 1.45, transition: "none" });
  gsap.set(texte, { y: 26, opacity: 0 });

  var tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
  tl.to(auge, { x: 0, opacity: 1, duration: 0.9 }, 0)
    .to(buchstaben, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.15, stagger: 0.028 }, 0.05)
    .to([liste].concat(punkte), { "--linie": 1, duration: 1.1, ease: "power3.inOut", stagger: 0.1 }, 0.35)
    .to(punkte, { "--strich": 1, duration: 0.7, ease: "power3.out", stagger: 0.1 }, 0.55)
    .to(punktText, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.6)
    ;
  ScrollTrigger.create({ trigger: akt, start: "top 42%", once: true, onEnter: function () { tl.play(); } });
  // die Karten liegen weiter unten: eigener Auslöser, sobald sie selbst gut im Bild sind
  var tlk = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
  tlk.to(karten, { y: 0, rotateX: 0, rotateY: 0, scale: 1, opacity: 1, duration: 1.6, stagger: 0.14 }, 0)
    .to(bilder, { scale: 1.02, duration: 2.2, ease: "power3.out", stagger: 0.14, clearProps: "transition,transform,scale" }, 0)
    .to(texte, { y: 0, opacity: 1, duration: 0.9, stagger: 0.14 }, 0.7);
  ScrollTrigger.create({ trigger: $(".am-berg__karten"), start: "top 78%", once: true, onEnter: function () { tlk.play(); } });

  // 3 · Tiefe beim Weiterscrollen (erst nach dem Auftritt, damit sich beides nicht in die Quere kommt)
  if (!handy) tlk.eventCallback("onComplete", function () {
    karten.forEach(function (k, i) {
      gsap.fromTo(k, { y: 0 }, { y: [-40, 30, -70][i] || 0, ease: "none",
        scrollTrigger: { trigger: akt, start: "top 20%", end: "bottom top", scrub: 0.8 } });
    });
  });
})();

/* Feedback 156: Beschreibung auf den Fotokarten. Mit Maus reicht Hover (CSS). Auf Touchgeräten öffnet ein Tippen die
   Karte und schließt die anderen, ein zweites Tippen oder ein Tippen daneben schließt sie wieder. */
(function () {
  "use strict";
  var karten = Array.prototype.slice.call(document.querySelectorAll(".am-berg__karte"));
  if (!karten.length) return;
  var maus = window.matchMedia("(hover: hover) and (pointer: fine)");
  karten.forEach(function (k) {
    k.addEventListener("click", function (e) {
      if (maus.matches) return;
      e.stopPropagation();
      var auf = !k.classList.contains("ist-offen");
      karten.forEach(function (x) { x.classList.remove("ist-offen"); });
      k.classList.toggle("ist-offen", auf);
    });
    k.addEventListener("keydown", function (e) { if (e.key === "Escape") k.blur(); });
  });
  document.addEventListener("click", function () { karten.forEach(function (x) { x.classList.remove("ist-offen"); }); });
})();
