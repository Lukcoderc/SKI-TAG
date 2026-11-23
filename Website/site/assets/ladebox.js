/* SkiTag · Chip-Seite, Ladestation (Feedback 151, Lukis Idee).
   Am Anfang liegt der Chip in seiner Ladestation. Beim Scrollen (an das Scrollen gebunden, vor und zurück):
   1. die ersten 140 px hebt er sich aus der Station, die Station bleibt leer, ihr Licht wechselt von Laden auf Bereit;
   2. dann fliegt er hinunter auf den Platz des Chips in „Probiere den Tag aus“ und dreht sich dabei auf;
   3. am Ende blendet er in den echten Chip dort über. Das Foto dort ist vorher scharf und wird weich, sobald der Chip
      ankommt (--unscharf an .knopf__bild).
   Die Strecke zwischen dem Platz in der Station und dem Ziel ist im Dokument fest, deshalb reicht ein transform am Bild.
   Ohne JS und bei weniger Bewegung bleibt der Chip in der Station und der Chip unten steht gleich da. */
(function () {
  "use strict";
  var platz = document.querySelector(".ladebox__platz"), flieger = platz && platz.querySelector(".ladebox__chip");
  var akt = document.getElementById("der-chip"), ziel = akt && akt.querySelector(".knopf__chip"), bild = akt && akt.querySelector(".knopf__bild");
  var box = document.querySelector(".ladebox");
  if (!flieger || !ziel || !bild) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var wurzel = document.documentElement;
  wurzel.classList.add("ladeflug");
  var HEBEN = 140;
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var weich = function (x) { return x * x * (3 - 2 * x); };
  var inOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var mass = null;
  var messen = function () {
    var y = window.scrollY, a = platz.getBoundingClientRect(), z = ziel.getBoundingClientRect(), b = bild.getBoundingClientRect();
    // Ziel: Mitte des Chips unten; die Breite des liegenden Chips etwa wie die Höhe des stehenden mal 0,95
    mass = {
      ax: a.left + a.width / 2, ay: a.top + y + a.height / 2, aw: a.width,
      zx: z.left + z.width / 2, zy: z.top + y + z.height / 2, zh: z.height,
      // fertig, wenn das Bild unten gut im Bild steht
      ende: Math.max(HEBEN + 200, b.top + y - Math.max(70, (window.innerHeight - b.height) / 2))
    };
  };
  var letzt = "";
  var setzen = function () {
    if (!mass) messen();
    var y = window.scrollY;
    var h = weich(klemme(y / HEBEN));
    var f = klemme((y - HEBEN) / (mass.ende - HEBEN)), g = inOut(f);
    // senkrecht linear mit dem Scrollen, sonst rollt der Chip erst mit der Seite weg; waagrecht und Größe weich
    var dx = (mass.zx - mass.ax) * g, dy = (mass.zy - mass.ay) * f - h * mass.aw * 0.32 * (1 - f);
    var s = 1 + ((mass.zh * 0.95) / mass.aw - 1) * g;
    var dreh = Math.sin(g * Math.PI) * -14;
    var da = klemme((f - 0.82) / 0.16);   // Überblenden auf den echten Chip
    var t = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0) rotate(" + dreh.toFixed(1) + "deg) scale(" + s.toFixed(3) + ")";
    var schluessel = t + da.toFixed(2);
    if (schluessel === letzt) return;
    letzt = schluessel;
    flieger.style.transform = t;
    flieger.style.opacity = (1 - da).toFixed(2);
    flieger.style.filter = "drop-shadow(0 " + (8 + 30 * Math.max(h * (1 - g), Math.sin(g * Math.PI))).toFixed(0) + "px 30px rgba(14,29,64," + (0.18 + 0.2 * Math.sin(g * Math.PI)).toFixed(2) + "))";
    akt.style.setProperty("--kn-da", da.toFixed(2));
    bild.style.setProperty("--unscharf", weich(klemme((f - 0.72) / 0.26)).toFixed(3));
    if (box) box.classList.toggle("ist-leer", y > HEBEN * 0.5);
  };
  var wartet = false;
  window.addEventListener("scroll", function () { if (!wartet) { wartet = true; requestAnimationFrame(function () { wartet = false; setzen(); }); } }, { passive: true });
  window.addEventListener("resize", function () { mass = null; letzt = ""; setzen(); });
  window.addEventListener("load", function () { mass = null; letzt = ""; setzen(); });
  setzen();
})();
