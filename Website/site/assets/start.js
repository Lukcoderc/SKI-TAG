/* SkiTag · Startseite, Runde nach Feedback 156 (GSAP mit ScrollTrigger und SplitText, selbst ausgeliefert).
   1. Beim Hinunterscrollen steigt der Text im Bergvideo etwas auf und wird blasser (der Schatten an der Unterkante
      des Videos steht in start.css).
   2. Der Knopf „So funktioniert der Chip“ folgt mit Maus ein wenig dem Zeiger (magnetisch), der Pfeil stupst beim
      ersten Hinsehen zweimal nach rechts.
   5. Bildfenster: „Einmal drücken,“ wird beim Hineinscrollen wie ein Knopf gedrückt (zusammen, zurück, Ring geht auf),
      danach erscheinen die übrigen Wörter mit dem Scrollen nacheinander.
   Ohne GSAP oder bei „weniger Bewegung“ steht alles einfach da. */
(function () {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var gs = window.gsap; gs.registerPlugin(window.ScrollTrigger);
  var handy = window.matchMedia("(max-width: 860px)").matches;

  /* 1 · über dem Video: nur das Raster gleitet leicht nach oben (Abdunkeln entfällt seit Feedback 157) */
  var held = document.querySelector(".held--video"), blick = document.getElementById("blick");
  if (held && blick) {
    var raster = held.querySelector(".held__raster");
    if (raster) gs.fromTo(raster, { y: 0, opacity: 1 }, { y: handy ? -40 : -90, opacity: 0.35, ease: "none",
      scrollTrigger: { trigger: blick, start: "top bottom", end: "top 15%", scrub: 0.5 } });
  }

  /* 2 · magnetischer Knopf */
  var mehr = document.querySelector(".schau__mehr");
  if (mehr) {
    var pfeil = mehr.querySelector(".schau__pfeil");
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      var zx = gs.quickTo(mehr, "x", { duration: 0.5, ease: "power3.out" }), zy = gs.quickTo(mehr, "y", { duration: 0.5, ease: "power3.out" });
      mehr.addEventListener("pointermove", function (e) {
        var r = mehr.getBoundingClientRect();
        zx((e.clientX - r.left - r.width / 2) * 0.18); zy((e.clientY - r.top - r.height / 2) * 0.3);
      });
      mehr.addEventListener("pointerleave", function () { zx(0); zy(0); });
    }
    gs.set(mehr, { scale: 0.9, opacity: 0 });
    if (pfeil) window.ScrollTrigger.create({ trigger: mehr, start: "top 85%", once: true, onEnter: function () {
      gs.timeline({ delay: 0.35 }).to(mehr, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.8)", clearProps: "scale,opacity" })
        .to(pfeil, { x: 6, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 3 }, "+=0.1");
    } });
  }

  /* 5 · „Einmal drücken,“ */
  var satz = document.querySelector(".druck-satz");
  if (satz && window.SplitText) {
    gs.registerPlugin(window.SplitText);
    var an = satz.querySelector(".druck-satz__an"), ring = satz.querySelector(".druck-satz__ring"), rest = satz.querySelector(".druck-satz__rest");
    var woerter = window.SplitText.create(rest, { type: "words", wordsClass: "ziel-wort" }).words;
    gs.set(woerter, { opacity: 0.14, y: 14 });
    gs.set(an, { transformOrigin: "50% 60%" });
    var druck = gs.timeline({ paused: true });
    druck.fromTo(an, { opacity: 0, y: 30, scale: 1.08 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" })
      .to(an, { scale: 0.9, y: 4, duration: 0.14, ease: "power2.in" }, "+=0.15")
      .to(an, { scale: 1, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" })
      .fromTo(ring, { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 5, duration: 1.1, ease: "power2.out" }, "<")
      .to(an, { color: "#ffffff", duration: 0.12, yoyo: true, repeat: 1 }, "<");
    window.ScrollTrigger.create({ trigger: satz, start: "top 82%", once: true, onEnter: function () { druck.play(); } });
    gs.to(woerter, { opacity: 1, y: 0, ease: "none", stagger: 0.12,
      scrollTrigger: { trigger: satz, start: "top 75%", end: "bottom 55%", scrub: 0.5 } });
  }
})();
