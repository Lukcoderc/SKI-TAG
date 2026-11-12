/* SkiTag · Seite „Am Skitag“ (seit Feedback 60), nur auf skitag.html geladen.
   Der Zeitstrahl folgt dem Scrollen: Die Linie füllt sich bis zur Leselinie (55 % der Fensterhöhe),
   der kleine Chip sitzt an ihrer Spitze, jede Station, die er erreicht hat, bekommt .ist-da.
   Die Uhr links zeigt die Zeit zwischen den Stationen (in 5-Minuten-Schritten), der Himmel dahinter
   folgt der Uhrzeit: Sonne von links nach rechts im Bogen, abends orange, ab 17:40 Nacht mit Mond.
   Ohne JavaScript stehen alle Stationen einfach da. */
(function () {
  "use strict";
  var tag = document.querySelector(".tag");
  if (!tag) return;
  document.documentElement.classList.add("js-tag");

  var linie = tag.querySelector(".tag__linie");
  var zeitEl = tag.querySelector(".tag__zeit");
  var wasEl = tag.querySelector(".tag__was");
  var himmel = tag.querySelector(".tag__himmel");
  var halte = Array.prototype.map.call(tag.querySelectorAll(".tag__halt"), function (el) {
    var t = (el.getAttribute("data-zeit") || "0:0").split(":");
    var min = parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
    return { el: el, punkt: el.querySelector(".tag__punkt"), min: min === 0 ? 1440 : min, was: el.getAttribute("data-was") || "" };
  });

  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var zwei = function (n) { return (n < 10 ? "0" : "") + n; };

  // Himmel: Farben oben und unten zu bestimmten Uhrzeiten, dazwischen gemischt
  var farben = [
    [450, "#f6d0bf", "#e6edf8"],   // 07:30 Morgen
    [600, "#bcd9f7", "#eaf3fd"],   // 10:00
    [840, "#a9cff5", "#e3f0fc"],   // 14:00
    [960, "#ffc59e", "#fde4cf"],   // 16:00 Nachmittag
    [1010, "#f2906c", "#f9c9a6"],  // 16:50 Abendrot
    [1070, "#2b3b6e", "#4b5481"],  // 17:50 Dämmerung
    [1440, "#0b1226", "#17284f"]   // Mitternacht
  ];
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); };
  var mischen = function (a, b, t) { var x = rgb(a), y = rgb(b); return "rgb(" + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(",") + ")"; };
  var himmelSetzen = function (m) {
    var i = 0;
    while (i < farben.length - 2 && m > farben[i + 1][0]) i++;
    var a = farben[i], b = farben[i + 1], t = klemme((m - a[0]) / (b[0] - a[0]));
    himmel.style.setProperty("--himmel-o", mischen(a[1], b[1], t));
    himmel.style.setProperty("--himmel-u", mischen(a[2], b[2], t));
    // Sonne im Bogen von 07:30 (links unten) bis 17:20 (rechts unten)
    var s = klemme((m - 450) / (1040 - 450));
    himmel.style.setProperty("--sonne-x", (8 + s * 84).toFixed(1) + "%");
    himmel.style.setProperty("--sonne-y", (66 - Math.sin(Math.PI * s) * 48).toFixed(1) + "%");
    tag.classList.toggle("ist-nacht", m >= 1060);
  };

  /* Feedback 90: Am Handy scrollt man ruckweise (Finger, Schwung), am PC gleichmäßig. Darum folgt der Strahl
     dem Scrollen nicht direkt, sondern gleitet weich zum Ziel (Zeitkonstante GLEITEN). Linie und Chip laufen nur über
     transform (keine Layoutarbeit je Bild), Text und Himmel werden nur bei Änderung geschrieben. */
  var GLEITEN = 0.16;
  var fuellung = tag.querySelector(".tag__fuellung"), chipEl = tag.querySelector(".tag__chip");
  var ziel = 0, jetztF = -1, zuletzt = 0, laeuft = false, letzteZeit = "", letztesWas = "", letzterHimmel = -1, mass = null;
  var ohneBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Ziel aus der Scrollstelle; die Lage der Stationen auf der Linie (0 bis 1) wird dabei mitgemessen
  var messen = function () {
    var r = linie.getBoundingClientRect(), lese = window.innerHeight * 0.55;
    var anteile = halte.map(function (h) { var p = h.punkt.getBoundingClientRect(); return r.height > 0 ? (p.top + p.height / 2 - r.top) / r.height : 0; });
    mass = { hoehe: r.height, anteile: anteile };
    ziel = r.height > 0 ? klemme((lese - r.top) / r.height) : 0;
  };

  var zeigen = function (f) {
    fuellung.style.transform = "scaleY(" + f.toFixed(4) + ")";
    chipEl.style.transform = "translate3d(0," + (f * mass.hoehe).toFixed(1) + "px,0)";
    var a = mass.anteile, nr = -1;
    halte.forEach(function (h, i) { var da = a[i] <= f + 0.0001; if (da !== h.da) { h.da = da; h.el.classList.toggle("ist-da", da); } if (da) nr = i; });
    var m;
    if (nr < 0) m = halte[0].min;
    else if (nr >= halte.length - 1) m = halte[halte.length - 1].min;
    else m = halte[nr].min + (halte[nr + 1].min - halte[nr].min) * klemme((f - a[nr]) / Math.max(0.0001, a[nr + 1] - a[nr]));
    var gerundet = Math.round(m / 5) * 5;
    var text = zwei(Math.floor(gerundet / 60) % 24) + ":" + zwei(gerundet % 60);
    if (text !== letzteZeit) { letzteZeit = text; zeitEl.textContent = text; }
    var was = halte[Math.max(0, nr)].was;
    if (was !== letztesWas) { letztesWas = was; wasEl.textContent = was; }
    var mr = Math.round(m);
    if (mr !== letzterHimmel) { letzterHimmel = mr; himmelSetzen(m); }
  };

  var bild = function (t) {
    var dt = zuletzt ? Math.min(0.1, (t - zuletzt) / 1000) : 0.016; zuletzt = t;
    messen();
    if (jetztF < 0 || ohneBewegung) jetztF = ziel;
    else jetztF += (ziel - jetztF) * (1 - Math.exp(-dt / GLEITEN));
    if (Math.abs(ziel - jetztF) < 0.0004) jetztF = ziel;
    zeigen(jetztF);
    if (jetztF !== ziel) requestAnimationFrame(bild); else { laeuft = false; zuletzt = 0; }
  };
  var anfragen = function () { if (!laeuft) { laeuft = true; requestAnimationFrame(bild); } };
  window.addEventListener("scroll", anfragen, { passive: true });
  window.addEventListener("resize", anfragen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(anfragen);
  messen(); jetztF = ziel; zeigen(jetztF);
})();
