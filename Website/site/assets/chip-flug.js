/* SkiTag · Chip-Seite: der Chip fliegt hinunter in „Probiere den Tag aus“ (Runde nach Feedback 151, überarbeitet).
   Feedback danach: der Chip im Flug hatte einen anderen Farbton als unten und blendete komisch über. Darum fliegt jetzt
   genau derselbe Chip wie unten: die 30 Renderbilder aus Blender (assets/media/chip/00 bis 29.webp, dieselben wie in
   chip-film.js), kein eigenes 3D-Modell mehr. Ein festes Element (.chip-flieger) liegt am Anfang genau über dem Bild im
   Einstieg, fliegt beim Scrollen (vor und zurück) im Bogen hinunter, dreht sich dabei durch die Renderbilder (eine
   Drehung hin und zurück), kommt in der Mitte etwas näher und kippt leicht. Am Ziel liegt es Pixel für Pixel auf dem
   Chip in „Probiere den Tag aus“ (Bild 16, gleiche Größe), dann wird nur noch getauscht: kein Überblenden.
   Bei weniger Bewegung bleibt alles still (die Klasse chipflug fehlt dann). */
(function () {
  "use strict";
  var wurzel = document.documentElement;
  var start = document.querySelector(".chip-flug-start");
  var akt = document.getElementById("der-chip");
  var ziel = akt && akt.querySelector(".knopf__chip");
  var bild = akt && akt.querySelector(".knopf__bild");
  var aufgeben = function () { wurzel.classList.remove("chipflug", "chipflug-an"); if (akt) akt.style.setProperty("--kn-da", "1"); };
  if (!start || !ziel || !bild || !wurzel.classList.contains("chipflug")) return aufgeben();

  var ORDNER = "assets/media/chip/", V = "?v=1", N = 30, RUHE = 16;
  var url = function (i) { return ORDNER + (i < 10 ? "0" : "") + i + ".webp" + V; };
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var weich = function (x) { return x * x * (3 - 2 * x); };
  var inOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var mix = function (a, b, t) { return a + (b - a) * t; };

  // alle Renderbilder vorab laden und dekodieren; gezeigt wird immer das nächste fertige
  var fertig = [], quellen = [];
  for (var i = 0; i < N; i++) (function (i) {
    var im = new Image(); im.decoding = "async"; im.src = url(i); quellen[i] = im.src;
    im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(function () { fertig[i] = true; }); };
  })(i);
  var naechstes = function (i) { for (var d = 0; d < N; d++) { if (fertig[i - d]) return i - d; if (fertig[i + d]) return i + d; } return RUHE; };

  var flieger = document.createElement("div");
  flieger.className = "chip-flieger"; flieger.setAttribute("aria-hidden", "true");
  var img = document.createElement("img"); img.alt = ""; img.decoding = "async"; img.src = url(RUHE);
  flieger.appendChild(img); document.body.appendChild(flieger);
  var gezeigt = RUHE;

  var vw = 0, vh = 0, m = null;
  var messen = function () {
    vw = innerWidth; vh = innerHeight;
    var y = scrollY, a = start.getBoundingClientRect(), film = ziel.querySelector(".chip-film");
    var z = (film || ziel).getBoundingClientRect(), b = bild.getBoundingClientRect();
    if (!film) return false;
    m = {
      ax: a.left + a.width / 2, ay: a.top + y + a.height / 2, as: a.width,
      zx: z.left + z.width / 2, zy: z.top + y + z.height / 2, zs: z.width,
      ende: Math.max(320, b.top + y - Math.max(70, (vh - b.height) / 2)),
    };
    return true;
  };

  var zeit0 = performance.now(), laeuft = false, f = 0, angekommen = null;
  var zeichnen = function (jetzt) {
    if (!m && !messen()) return;
    var y = scrollY;
    f = klemme(y / m.ende);
    var fl = klemme(f / 0.86);                     // bei 86 % sitzt der Chip genau auf dem Ziel
    var g = inOut(fl), t = (jetzt - zeit0) / 1000;
    var ruhe = 1 - weich(klemme(f / 0.1));          // Schweben nur oben, nur auf und ab (Feedback: das Drehen oben ruckelte)
    var nah = Math.sin(fl * Math.PI);
    var x = mix(m.ax, m.zx, g) + Math.sin(fl * Math.PI) * Math.min(vw * 0.12, 160) * (m.zx > m.ax ? -1 : 1);
    var yy = mix(m.ay, m.zy, mix(fl, g, 0.4)) - y + Math.sin(t * 1.1) * 5 * ruhe;
    var s = mix(m.as, m.zs, g) * (1 + nah * 0.35);
    var dreh = Math.sin(fl * Math.PI) * -16;
    // Drehung durch die Renderbilder: hin bis ganz links, zurück bis ganz rechts, landet auf Bild 16
    var nr = Math.round(Math.max(0, Math.min(N - 1, RUHE + 13 * Math.sin(fl * Math.PI * 2))));
    nr = naechstes(nr);
    if (nr !== gezeigt) { img.src = quellen[nr]; gezeigt = nr; }
    flieger.style.transform = "translate3d(" + (x - s / 2).toFixed(1) + "px," + (yy - s / 2).toFixed(1) + "px,0) rotate(" + dreh.toFixed(2) + "deg)";
    flieger.style.width = flieger.style.height = s.toFixed(1) + "px";
    flieger.style.setProperty("--schatten", ((1 - g) * 0.6 + nah * 0.25).toFixed(2));
    var da = f >= 0.86;
    if (da !== angekommen) {
      angekommen = da;
      flieger.style.visibility = da ? "hidden" : "visible";
      akt.style.setProperty("--kn-da", da ? "1" : "0");
    }
    bild.style.setProperty("--unscharf", weich(klemme((f - 0.7) / 0.16)).toFixed(3));
  };
  var schleife = function (jetzt) {
    zeichnen(jetzt);
    if (f < 0.1 && !document.hidden) requestAnimationFrame(schleife); else laeuft = false;
  };
  var anstossen = function () { if (!laeuft) { laeuft = true; requestAnimationFrame(schleife); } };
  addEventListener("scroll", anstossen, { passive: true });
  addEventListener("resize", function () { m = null; anstossen(); });
  addEventListener("load", function () { m = null; anstossen(); });
  document.addEventListener("visibilitychange", anstossen);
  wurzel.classList.add("chipflug-an");
  anstossen();
})();
