/* SkiTag · Einstieg als Szene am Berg (Runde nach Feedback 151). Die Bühne klebt oben, solange die Strecke durchscrollt.
   Aus dem Scrollstand p (0 bis 1, weich nachgezogen) wird die Kamera gerechnet: Fotopunkt c landet an Bildschirmstelle a,
   mit Zoom z über „deckt den Bildschirm“. Danach Lupe, Halten, Funkweg, Empfänger und die Karten.
   Fotokoordinaten beziehen sich auf held-szene.webp (2400 × 1606). */
(function () {
  "use strict";
  var strecke = document.querySelector(".hs-strecke");
  if (!strecke) return;
  var held = strecke.querySelector(".held--szene");
  var welt = held.querySelector(".hs-welt");
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  strecke.classList.add("ist-an");

  var W = 2400, H = 1606;
  var CHIP = [1056, 834], LED = [1054, 823], MAST = [404, 546];
  var vw = 0, vh = 0, handy = false;

  var klemme = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var teil = function (p, a, b) { return klemme((p - a) / (b - a), 0, 1); };
  var weich = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var misch = function (a, b, t) { return a + (b - a) * t; };

  /* Kameras: c = Fotopunkt, a = Stelle am Bildschirm (Anteil), z = Zoom über „deckt“ */
  var K = function () {
    return handy ? {
      start: { c: [1010, 860], a: [0.5, 0.62], z: 1 },
      chip: { c: CHIP, a: [0.3, 0.42], z: 2.3 },
      mast: { c: MAST, a: [0.58, 0.4], z: 1.7 },
      ende: { c: [700, 640], a: [0.5, 0.36], z: 1.05 }
    } : {
      start: { c: [1150, 800], a: [0.62, 0.5], z: 1.02 },
      chip: { c: CHIP, a: [0.5, 0.46], z: 2.3 },
      mast: { c: MAST, a: [0.6, 0.4], z: 1.55 },
      ende: { c: [760, 690], a: [0.58, 0.44], z: 1.12 }
    };
  };
  var kam = K();
  var deckt = function () { return Math.max(vw / W, vh / H); };
  var setzeKamera = function (c, a, z) {
    var s = deckt() * z;
    var tx = a[0] * vw - c[0] * s, ty = a[1] * vh - c[1] * s;
    tx = klemme(tx, vw - W * s, 0); ty = klemme(ty, vh - H * s, 0);
    welt.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0) scale(" + s.toFixed(4) + ")";
    return { s: s, tx: tx, ty: ty };
  };
  var mischK = function (A, B, t) {
    return { c: [misch(A.c[0], B.c[0], t), misch(A.c[1], B.c[1], t)], a: [misch(A.a[0], B.a[0], t), misch(A.a[1], B.a[1], t)], z: misch(A.z, B.z, t) };
  };

  var messen = function () {
    vw = held.clientWidth; vh = held.clientHeight;
    handy = vw <= 860; kam = K();
  };

  if (ruhig) { messen(); setzeKamera(kam.start.c, kam.start.a, kam.start.z); window.addEventListener("resize", function () { messen(); setzeKamera(kam.start.c, kam.start.a, kam.start.z); }); return; }
  strecke.classList.add("ist-lang");

  var lupe = held.querySelector(".hs-lupe"), lupeFoto = held.querySelector(".hs-lupe__foto"), zahl = held.querySelector(".hs-lupe__zahl");
  var linie = held.querySelector(".hs-linie line");
  var markeChip = held.querySelector(".hs-marke--chip"), markeStation = held.querySelector(".hs-marke--station");
  var karten = [].slice.call(held.querySelectorAll(".hs-karte"));
  var weg = held.querySelector("#hs-weg"), pakete = [].slice.call(held.querySelectorAll(".hs-pakete circle"));
  var wegLaenge = weg.getTotalLength();

  var ziel = 0, jetzt = 0, laeuft = false, alt = {};
  var setze = function (el, k, v) { var key = k; if (el.__w === undefined) el.__w = {}; if (el.__w[key] === v) return; el.__w[key] = v; el.style.setProperty(k, v); };
  var klasse = function (el, k, an) { if (el.classList.contains(k) !== an) el.classList.toggle(k, an); };

  var lesen = function () {
    var r = strecke.getBoundingClientRect();
    var lang = strecke.offsetHeight - vh;
    ziel = klemme(-r.top / Math.max(1, lang), 0, 1);
  };

  var zeichnen = function (p) {
    /* Kamera */
    var k;
    if (p < 0.32) k = mischK(kam.start, kam.chip, weich(teil(p, 0.05, 0.32)));
    else if (p < 0.6) k = kam.chip;
    else if (p < 0.8) k = mischK(kam.chip, kam.mast, weich(teil(p, 0.6, 0.8)));
    else k = mischK(kam.mast, kam.ende, weich(teil(p, 0.84, 0.97)));
    var cam = setzeKamera(k.c, k.a, k.z);
    var bild = function (pt) { return [cam.tx + pt[0] * cam.s, cam.ty + pt[1] * cam.s]; };

    /* Text raus, Verlauf weg */
    var text = 1 - teil(p, 0.03, 0.14);
    setze(held, "--text", text.toFixed(3));
    setze(held, "--text-zeiger", text > 0.5 ? "auto" : "none");
    setze(held, "--dunkel", (1 - teil(p, 0.06, 0.24)).toFixed(3));
    setze(held, "--p", p.toFixed(4));

    /* Lupe neben dem Chip */
    var chipS = bild(CHIP);
    var lu = teil(p, 0.28, 0.36) * (1 - teil(p, 0.62, 0.68));
    var g = lupe.offsetWidth;
    var lx = handy ? Math.min(vw - g / 2 - 14, chipS[0] + g * 0.75) : chipS[0] + Math.max(170, g * 0.95);
    var ly = handy ? chipS[1] - g * 0.35 : chipS[1] - g * 0.18;
    setze(lupe, "--lupe", lu.toFixed(3));
    setze(lupe, "--lx", lx.toFixed(1) + "px"); setze(lupe, "--ly", ly.toFixed(1) + "px");
    setze(linie.parentNode, "--lupe", lu.toFixed(3));
    if (lu > 0) {
      var dx = lx - chipS[0], dy = ly - chipS[1], d = Math.hypot(dx, dy) || 1, rr = g / 2 * (0.6 + lu * 0.4);
      linie.setAttribute("x1", chipS[0].toFixed(1)); linie.setAttribute("y1", chipS[1].toFixed(1));
      linie.setAttribute("x2", (lx - dx / d * rr).toFixed(1)); linie.setAttribute("y2", (ly - dy / d * rr).toFixed(1));
      /* Foto in der Lupe: der Chip ist 39 px hoch und soll 66 % der Lupe füllen */
      var S = g * 0.66 / 39, box = g * 1.16;
      setze(lupeFoto, "--bs", (W * S).toFixed(0) + "px");
      setze(lupeFoto, "--bx", (box / 2 - CHIP[0] * S).toFixed(1) + "px");
      setze(lupeFoto, "--by", (box / 2 - CHIP[1] * S).toFixed(1) + "px");
    }

    /* Halten: drei Sekunden, dann Alarm */
    var h = teil(p, 0.42, 0.56);
    setze(lupe, "--halten", h.toFixed(3));
    var z = h <= 0 ? "" : h < 1 ? String(Math.min(3, Math.floor(h * 3) + 1)) : "SOS";
    if (zahl.textContent !== (z === "SOS" ? "!" : z)) zahl.textContent = z === "SOS" ? "!" : z;
    klasse(held, "ist-alarm", p >= 0.56);

    /* Funkweg zur Station */
    var w = teil(p, 0.62, 0.8);
    setze(held, "--weg", w.toFixed(4));
    setze(held, "--weg-da", teil(p, 0.58, 0.64).toFixed(3));
    pakete.forEach(function (c, i) {
      var t = w * 1.25 - i * 0.12;
      if (t <= 0 || t >= 1 || w >= 1) { c.style.opacity = "0"; return; }
      var q = weg.getPointAtLength(t * wegLaenge);
      c.setAttribute("cx", q.x.toFixed(1)); c.setAttribute("cy", q.y.toFixed(1)); c.style.opacity = "1";
    });
    setze(held, "--empf", teil(p, 0.6, 0.66).toFixed(3));
    klasse(held, "ist-da", p >= 0.8);

    /* Marken an Chip und Station */
    var mc = p > 0.2 && p < 0.3;
    klasse(markeChip, "ist-da", mc);
    if (mc) { setze(markeChip, "--mx", (chipS[0] - 16).toFixed(1) + "px"); setze(markeChip, "--my", (chipS[1] - markeChip.offsetHeight - 30).toFixed(1) + "px"); }
    var st = bild(MAST), ms = p > 0.66;
    klasse(markeStation, "ist-da", ms);
    if (ms) { setze(markeStation, "--mx", (st[0] - 16).toFixed(1) + "px"); setze(markeStation, "--my", (st[1] - markeStation.offsetHeight - 34).toFixed(1) + "px"); }

    /* Karten */
    var n = p < 0.18 ? 0 : p < 0.4 ? 1 : p < 0.6 ? 2 : p < 0.82 ? 3 : 4;
    karten.forEach(function (el, i) { klasse(el, "ist-da", i + 1 === n); });
  };

  var takt = function () {
    jetzt += (ziel - jetzt) * 0.14;
    if (Math.abs(ziel - jetzt) < 0.0004) jetzt = ziel;
    zeichnen(jetzt);
    if (jetzt !== ziel) requestAnimationFrame(takt); else laeuft = false;
  };
  var anstossen = function () { lesen(); if (!laeuft) { laeuft = true; requestAnimationFrame(takt); } };

  messen(); lesen(); jetzt = ziel; zeichnen(jetzt);
  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", function () { messen(); lesen(); jetzt = ziel; zeichnen(jetzt); });
})();
