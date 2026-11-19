/* SkiTag · Seite „Am Skitag“ (seit Feedback 60), nur auf skitag.html geladen.
   Feedback 126: Der Tag läuft über die ganze Seite. Die Uhrzeit hängt am Scrollen (GSAP ScrollTrigger, weich
   nachgezogen): über der Überschrift ist es 07:30, an der ersten Station 08:10, an der letzten Mitternacht.
   Aus der Uhrzeit folgt alles andere:
   - .tagwelt (feste Ebene hinter der Seite): Himmelsfarben, Sonnenlicht im Bogen, Mond und Sterne, Bergfarben;
   - html.tagwelt-dunkel ab der Dämmerung (Uhr und Linie werden hell);
   - der Zeitstrahl: Linie füllt sich bis zur Leselinie (55 % der Fensterhöhe), der kleine Chip fährt mit,
     jede erreichte Station bekommt .ist-da und ihre Karte gleitet herein (GSAP);
   - die Uhr links zeigt die Zeit zwischen den Stationen in 5-Minuten-Schritten.
   Ohne GSAP folgt alles direkt dem Scrollen; ohne JavaScript stehen alle Stationen einfach da. */
(function () {
  "use strict";
  var tag = document.querySelector(".tag");
  if (!tag) return;
  var wurzel = document.documentElement;
  wurzel.classList.add("js-tag");

  var welt = document.querySelector(".tagwelt");
  var kopf = document.querySelector(".tag-kopf");
  var linie = tag.querySelector(".tag__linie");
  var zeitEl = tag.querySelector(".tag__zeit");
  var wasEl = tag.querySelector(".tag__was");
  var fuellung = tag.querySelector(".tag__fuellung"), chipEl = tag.querySelector(".tag__chip");
  var ohneBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gs = window.gsap && window.ScrollTrigger ? window.gsap : null;
  if (gs) { gs.registerPlugin(window.ScrollTrigger); wurzel.classList.add("js-tag-gsap"); }

  var halte = Array.prototype.map.call(tag.querySelectorAll(".tag__halt"), function (el) {
    var t = (el.getAttribute("data-zeit") || "0:0").split(":");
    var min = parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
    return { el: el, karte: el.querySelector(".tag__karte"), punkt: el.querySelector(".tag__punkt"), min: min === 0 ? 1440 : min, was: el.getAttribute("data-was") || "" };
  });

  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var zwei = function (n) { return (n < 10 ? "0" : "") + n; };

  /* ---------------------------------------------------- Himmel -- */
  // je Uhrzeit (Minuten): Himmel oben, Mitte, Horizont, hintere Kette, vordere Kette
  var FARBEN = [
    [450, "#a7b4d6", "#d7b3bd", "#f6d2b4", "#b9a9bf", "#5d5a7c"],    // 07:30 Morgendämmerung
    [570, "#6a9fd8", "#b0d0ee", "#e8f1f9", "#d3deec", "#6b819f"],    // 09:30
    [750, "#4a8ad6", "#9cc6ee", "#deecf8", "#d9e4f1", "#6f87a8"],    // 12:30 Mittag
    [930, "#5a8cc8", "#bccfe2", "#f2e3cc", "#dcd8dd", "#6e7690"],    // 15:30
    [1000, "#5f70a8", "#dea687", "#f7ca92", "#d6aa9b", "#5e4f68"],   // 16:40 goldenes Licht
    [1040, "#36447e", "#bb656d", "#f28d60", "#9e7087", "#3f3556"],   // 17:20 Sonnenuntergang
    [1090, "#141f45", "#2f3c70", "#6c5b88", "#3a3f6a", "#1d2244"],   // 18:10 Dämmerung
    [1440, "#050a19", "#0b1632", "#16244a", "#1c2a52", "#0e1d40"]    // Mitternacht
  ];
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); };
  var FARB_RGB = FARBEN.map(function (k) { return [k[0]].concat(k.slice(1).map(rgb)); });
  var mischen = function (a, b, t) { return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")"; };
  var NAMEN = ["--h1", "--h2", "--h3", "--b1", "--b2"];
  var letzterHimmel = -1, dunkel = null;
  var himmelSetzen = function (m) {
    var mr = Math.round(m * 2) / 2;
    if (mr === letzterHimmel || !welt) return;
    letzterHimmel = mr;
    var i = 0;
    while (i < FARB_RGB.length - 2 && m > FARB_RGB[i + 1][0]) i++;
    var a = FARB_RGB[i], b = FARB_RGB[i + 1], t = klemme((m - a[0]) / (b[0] - a[0]));
    t = t * t * (3 - 2 * t);
    for (var k = 0; k < NAMEN.length; k++) welt.style.setProperty(NAMEN[k], mischen(a[k + 1], b[k + 1], t));
    // Sonne im großen Bogen über das Fenster: 07:30 links unten, Mittag hoch oben, 17:30 rechts hinter den Bergen
    var s = klemme((m - 450) / (1050 - 450));
    welt.style.setProperty("--sx", (6 + s * 88).toFixed(2) + "%");
    welt.style.setProperty("--sy", (80 - Math.sin(Math.PI * s) * 64).toFixed(2) + "%");
    welt.style.setProperty("--sonne", (1 - klemme((m - 1030) / 40)).toFixed(3));
    welt.style.setProperty("--nacht", klemme((m - 1060) / 70).toFixed(3));
    // Feedback 131: goldenes Licht auf dem Panorama am Morgen (bis 09:30) und ab dem Nachmittag (15:30 bis 17:10 voll)
    welt.style.setProperty("--gold", Math.max(1 - klemme((m - 450) / 120), klemme((m - 930) / 100)).toFixed(3));
    var d = m >= 1055;
    if (d !== dunkel) { dunkel = d; wurzel.classList.toggle("tagwelt-dunkel", d); }
  };

  // Sterne: einmal gezeichnet (bei Größenänderung neu), sichtbar über --nacht
  var sterne = welt && welt.querySelector(".tagwelt__sterne");
  var sterneZeichnen = function () {
    if (!sterne) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
    sterne.width = w * dpr; sterne.height = h * dpr;
    var c = sterne.getContext("2d"); c.scale(dpr, dpr);
    var zufall = (function (s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(42);
    var n = Math.round(w * h / 5200);
    for (var i = 0; i < n; i++) {
      var y = Math.pow(zufall(), 1.6) * h * 0.75, x = zufall() * w, r = 0.35 + Math.pow(zufall(), 3) * 1.3;
      c.globalAlpha = 0.35 + zufall() * 0.65;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = zufall() < 0.15 ? "#ffe9c7" : "#ffffff"; c.fill();
    }
  };

  /* ------------------------------------------------ Zeitstrahl -- */
  var mass = null;
  var messen = function () {
    var r = linie.getBoundingClientRect();
    mass = {
      hoehe: r.height,
      anteile: halte.map(function (h) { var p = h.punkt.getBoundingClientRect(); return r.height > 0 ? (p.top + p.height / 2 - r.top) / r.height : 0; })
    };
  };

  var einblenden = function (h, da, sanft) {
    if (!gs || !h.karte) return;
    if (!sanft || ohneBewegung) { gs.set(h.karte, { opacity: da ? 1 : 0, y: da ? 0 : 30, filter: "blur(0px)" }); return; }
    if (da) gs.fromTo(h.karte, { opacity: 0, y: 40, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "expo.out", overwrite: true });
    else gs.to(h.karte, { opacity: 0, y: 24, filter: "blur(4px)", duration: 0.35, ease: "power2.in", overwrite: true });
  };

  var stand = { vor: 0, f: 0 }, letzteZeit = "", letztesWas = "", bereit = false;
  var zeigen = function () {
    if (!mass) messen();
    var f = stand.f;
    fuellung.style.transform = "scaleY(" + f.toFixed(4) + ")";
    chipEl.style.transform = "translate3d(0," + (f * mass.hoehe).toFixed(1) + "px,0)";
    var a = mass.anteile, nr = -1;
    halte.forEach(function (h, i) {
      var da = a[i] <= f + 0.0001;
      if (da !== h.da) { h.da = da; h.el.classList.toggle("ist-da", da); einblenden(h, da, bereit); }
      if (da) nr = i;
    });
    var m;
    if (f <= 0) m = 450 + (halte[0].min - 450) * stand.vor;   // über der Überschrift: Morgendämmerung bis zur ersten Station
    else if (nr < 0) m = halte[0].min;
    else if (nr >= halte.length - 1) m = halte[halte.length - 1].min;
    else {
      // lange Lücken (Rückgabe bis Mitternacht): die Uhr bleibt erst nah an der Station und eilt dann weiter
      var luecke = halte[nr + 1].min - halte[nr].min, q = klemme((f - a[nr]) / Math.max(0.0001, a[nr + 1] - a[nr]));
      m = halte[nr].min + luecke * (luecke > 120 ? Math.pow(q, 2.6) : q);
    }
    var gerundet = Math.max(halte[0].min, Math.round(m / 5) * 5);
    var text = zwei(Math.floor(gerundet / 60) % 24) + ":" + zwei(gerundet % 60);
    if (text !== letzteZeit) { letzteZeit = text; zeitEl.textContent = text; }
    var was = halte[Math.max(0, nr)].was;
    if (was !== letztesWas) { letztesWas = was; wasEl.textContent = was; }
    himmelSetzen(m);
  };

  sterneZeichnen();
  window.addEventListener("resize", function () { messen(); sterneZeichnen(); zeigen(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { messen(); zeigen(); });

  if (gs) {
    // Karten, die noch nicht erreicht sind, warten unsichtbar
    halte.forEach(function (h) { if (h.karte) gs.set(h.karte, { opacity: 0, y: 30 }); });
    var glatt = ohneBewegung ? true : 0.8;
    gs.to(stand, { vor: 1, ease: "none", onUpdate: zeigen,
      scrollTrigger: { trigger: kopf || tag, start: "top top", end: "bottom 55%", scrub: glatt } });
    gs.to(stand, { f: 1, ease: "none", onUpdate: zeigen,
      scrollTrigger: { trigger: linie, start: "top 55%", end: "bottom 55%", scrub: glatt, onRefresh: function () { messen(); } } });
    // Feedback 127: am Ende sinkt das Gebirge der Tageswelt weich weg, während das Gebirge über dem Fuß hochkommt,
    // dazu wird der Himmel unten zum Dunkelblau des Fußes; so gibt es nie zwei Bergketten übereinander.
    var band = document.querySelector(".gebirge-band"), berge = welt && welt.querySelector(".tagwelt__berge");
    if (band && berge) {
      gs.fromTo(berge, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: 35, ease: "power1.in",
        scrollTrigger: { trigger: band, start: "top bottom", end: "top 45%", scrub: glatt } });
    }
    messen(); zeigen(); bereit = true;
    window.ScrollTrigger.refresh();
    return;
  }

  // ohne GSAP: direkt am Scrollen
  var direkt = function () {
    messen();
    var r = linie.getBoundingClientRect(), lese = innerHeight * 0.55;
    stand.f = r.height > 0 ? klemme((lese - r.top) / r.height) : 0;
    if (kopf) { var k = kopf.getBoundingClientRect(); stand.vor = klemme(-k.top / Math.max(1, k.height - lese)); }
    zeigen();
  };
  window.addEventListener("scroll", direkt, { passive: true });
  bereit = true; direkt();
})();
