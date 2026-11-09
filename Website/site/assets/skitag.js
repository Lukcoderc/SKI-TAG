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

  var letzteZeit = "";
  var setzen = function () {
    var r = linie.getBoundingClientRect();
    var lese = window.innerHeight * 0.55;
    var f = r.height > 0 ? klemme((lese - r.top) / r.height) : 0;
    linie.style.setProperty("--linie", f.toFixed(4));

    // Stationen: erreicht, sobald die Leselinie ihren Punkt passiert hat
    var ys = halte.map(function (h) { var p = h.punkt.getBoundingClientRect(); return p.top + p.height / 2; });
    var nr = -1;
    halte.forEach(function (h, i) { var da = ys[i] <= lese; h.el.classList.toggle("ist-da", da); if (da) nr = i; });

    // Uhrzeit zwischen der letzten erreichten und der nächsten Station
    var m;
    if (nr < 0) m = halte[0].min;
    else if (nr >= halte.length - 1) m = halte[halte.length - 1].min;
    else {
      var t = klemme((lese - ys[nr]) / (ys[nr + 1] - ys[nr]));
      m = halte[nr].min + (halte[nr + 1].min - halte[nr].min) * t;
    }
    var gerundet = Math.round(m / 5) * 5;
    var text = zwei(Math.floor(gerundet / 60) % 24) + ":" + zwei(gerundet % 60);
    if (text !== letzteZeit) { letzteZeit = text; zeitEl.textContent = text; }
    wasEl.textContent = halte[Math.max(0, nr)].was;
    himmelSetzen(m);
  };

  var wartet = false;
  var anfragen = function () { if (!wartet) { wartet = true; requestAnimationFrame(function () { wartet = false; setzen(); }); } };
  window.addEventListener("scroll", anfragen, { passive: true });
  window.addEventListener("resize", anfragen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(anfragen);
  setzen();
})();
