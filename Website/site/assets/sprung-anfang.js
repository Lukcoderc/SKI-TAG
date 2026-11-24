/* SkiTag · Knopf „Nach oben“ unten rechts.
   Eigene Datei, damit der Knopf auch dann funktioniert, wenn ein anderes
   Skript scheitert. Ohne JavaScript bleibt er immer sichtbar und springt
   über den Anker #oben nach oben. */
(function () {
  "use strict";
  var knopf = document.querySelector(".sprung-anfang");
  if (!knopf) return;
  var ohneBewegung = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-oben");

  var hoehe = function () {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  };
  // Dunkelblaue Flächen; beim Gebirge zählt nur der untere, dunkle Teil
  var dunkel = document.querySelectorAll(".nacht, .fuss, .kachel--nacht, .blick__punkt--nacht, .app-kontakt");
  // die Fläche der Vorführung wird nur dunkel, solange der Notruf läuft
  var vorfuehrung = document.getElementById("der-chip"), vorfuehrungBild = vorfuehrung && vorfuehrung.querySelector(".knopf__bild");
  var gebirge = document.querySelector(".gebirge");
  // Leistung (Runde nach Feedback 152): statt bei jedem Scrollbild alle dunklen Flächen auszumessen (zwingt den Browser,
  // das Layout mitten im Bild neu zu rechnen), meldet ein IntersectionObserver mit einem 1-Pixel-Fenster genau in der
  // Mitte des Knopfs, welche Fläche gerade darunter liegt. Ausgemessen wird nur noch beim Gebirge und der Vorführung,
  // und nur, solange sie unter dem Knopf liegen.
  var unter = [], gebirgeDa = false, vorfDa = false, io = null;
  var hellSetzen = function () {
    var hell = unter.length > 0;
    if (!hell && (gebirgeDa || vorfDa)) {
      var k = knopf.getBoundingClientRect(), x = k.left + k.width / 2, y = k.top + k.height / 2;
      var drin = function (r, oben) { return x >= r.left && x <= r.right && y >= oben && y <= r.bottom; };
      if (vorfDa && vorfuehrung.getAttribute("data-zustand") === "lauf") { var v = vorfuehrungBild.getBoundingClientRect(); hell = drin(v, v.top); }
      if (!hell && gebirgeDa) { var g = gebirge.getBoundingClientRect(); hell = drin(g, g.top + g.height * 0.55); }
    }
    knopf.classList.toggle("ist-hell", hell);
  };
  var beobachten = function () {
    if (!("IntersectionObserver" in window)) return;
    if (io) io.disconnect();
    unter = []; gebirgeDa = vorfDa = false;
    var k = knopf.getBoundingClientRect(), x = Math.round(k.left + k.width / 2), y = Math.round(k.top + k.height / 2);
    if (!k.width) return;
    io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        var el = e.target;
        if (el === gebirge) gebirgeDa = e.isIntersecting;
        else if (el === vorfuehrungBild) vorfDa = e.isIntersecting;
        else { var i = unter.indexOf(el); if (e.isIntersecting && i < 0) unter.push(el); else if (!e.isIntersecting && i >= 0) unter.splice(i, 1); }
      });
      hellSetzen();
    }, { rootMargin: -y + "px " + -(window.innerWidth - x - 1) + "px " + -(window.innerHeight - y - 1) + "px " + -x + "px" });
    for (var i = 0; i < dunkel.length; i++) io.observe(dunkel[i]);
    if (gebirge) io.observe(gebirge);
    if (vorfuehrungBild) io.observe(vorfuehrungBild);
  };
  // Am Handy verdeckt der Knopf sonst Text: er erscheint dort erst, wenn man wieder nach oben scrollt, und am Seitenende.
  var handy = window.matchMedia && window.matchMedia("(max-width: 860px), (pointer: coarse)").matches;
  var letzteHoehe = hoehe(), rauf = false;
  var setzen = function () {
    if (gebirgeDa || vorfDa) hellSetzen();
    var y = hoehe(), an = y > window.innerHeight * 1.2;
    if (handy) {
      if (y < letzteHoehe - 6) rauf = true; else if (y > letzteHoehe + 6) rauf = false;
      letzteHoehe = y;
      var ende = y + window.innerHeight > document.documentElement.scrollHeight - 160;
      an = an && (rauf || ende);
    }
    knopf.classList.toggle("ist-sichtbar", an);
    knopf.tabIndex = an ? 0 : -1;
    knopf.setAttribute("aria-hidden", an ? "false" : "true");
  };
  var wartet = false;
  window.addEventListener("scroll", function () { if (!wartet) { wartet = true; requestAnimationFrame(function () { wartet = false; setzen(); }); } }, { passive: true });
  window.addEventListener("resize", function () { beobachten(); setzen(); });
  window.addEventListener("pageshow", setzen);
  if (vorfuehrung && "MutationObserver" in window) new MutationObserver(hellSetzen).observe(vorfuehrung, { attributes: true, attributeFilter: ["data-zustand"] });
  beobachten(); setzen(); hellSetzen();

  knopf.addEventListener("click", function (e) {
    e.preventDefault();
    try { window.scrollTo({ top: 0, behavior: ohneBewegung ? "auto" : "smooth" }); }
    catch (_) { window.scrollTo(0, 0); }
    var marke = document.querySelector(".oben__marke");
    if (marke) { try { marke.focus({ preventScroll: true }); } catch (_) { marke.focus(); } }
  });
})();
