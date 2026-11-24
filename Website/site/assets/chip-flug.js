/* SkiTag · Chip-Seite: der Chip fliegt hinunter in „Probiere den Tag aus“ (Runde nach Feedback 151, überarbeitet).
   Es fliegt genau derselbe Chip wie unten: die 30 Renderbilder aus Blender (assets/media/chip/00 bis 29.webp, dieselben
   wie in chip-film.js). Ein festes Element (.chip-flieger) liegt am Anfang genau über dem Bild im Einstieg, fliegt beim
   Scrollen (vor und zurück) im Bogen hinunter, dreht sich dabei durch die Renderbilder (eine Drehung hin und zurück),
   kommt in der Mitte etwas näher und kippt leicht. Am Ziel liegt es genau auf dem Chip in „Probiere den Tag aus“
   (Bild 16, gleiche Größe), dann wird nur noch getauscht.

   Feedback 153 („flackert und ist nicht smooth“), darum seit dann:
   - Die Bilder werden einmal vorab dekodiert (ImageBitmap) und auf eine Leinwand gemalt. Vorher bekam ein <img> bei
     jedem Bildwechsel eine neue Quelle, und der Browser dekodierte das Bild beim Malen neu: das flackerte.
   - Die Größe ändert sich nur über transform (scale), nicht über width/height, also ohne neues Layout.
   - Der Flug folgt dem Scrollen weich nach (eigene Stellung, die der Scrollstellung nachläuft). Er rechnet auf dem
     Bildschirm nur mit dieser Stellung, darum springt er auch bei groben Mausrad-Stufen nicht.
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

  var ORDNER = "assets/media/chip/", V = "?v=1", N = 30, RUHE = 16, DA = 0.86;
  var url = function (i) { return ORDNER + (i < 10 ? "0" : "") + i + ".webp" + V; };
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var weich = function (x) { return x * x * (3 - 2 * x); };
  var inOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var mix = function (a, b, t) { return a + (b - a) * t; };

  var flieger = document.createElement("div");
  flieger.className = "chip-flieger"; flieger.setAttribute("aria-hidden", "true");
  var leinwand = document.createElement("canvas");
  var ctx = leinwand.getContext("2d");
  flieger.appendChild(leinwand); document.body.appendChild(flieger);

  var vw = 0, vh = 0, m = null, GROSS = 0;   // GROSS: Kantenlänge der Leinwand in CSS-Pixeln (größte Flugstellung)
  var messen = function () {
    vw = innerWidth; vh = innerHeight;
    var y = scrollY, a = start.getBoundingClientRect(), film = ziel.querySelector(".chip-film");
    if (!film) return false;
    var z = film.getBoundingClientRect(), b = bild.getBoundingClientRect();
    m = {
      ax: a.left + a.width / 2, ay: a.top + y + a.height / 2, as: a.width,
      zx: z.left + z.width / 2, zy: z.top + y + z.height / 2, zs: z.width,
      ende: Math.max(320, b.top + y - Math.max(70, (vh - b.height) / 2)),
    };
    GROSS = Math.ceil(Math.max(m.as, m.zs) * 1.36);
    flieger.style.width = flieger.style.height = GROSS + "px";
    return true;
  };

  /* Bilder: einmal laden, in der gebrauchten Größe dekodieren, dann nur noch malen */
  var vorrat = [], gemalt = -1, px = 0;
  var naechstes = function (i) { for (var d = 0; d < N; d++) { if (vorrat[i - d]) return i - d; if (vorrat[i + d]) return i + d; } return -1; };
  var laden = function () {
    var dpr = Math.min(devicePixelRatio || 1, 2);
    px = Math.min(900, Math.ceil(GROSS * dpr));
    leinwand.width = leinwand.height = px;
    // zuerst das Ruhebild, dann von dort nach außen, damit der Anfang des Flugs zuerst fertig ist
    var reihe = [RUHE];
    for (var d = 1; d < N; d++) { if (RUHE + d < N) reihe.push(RUHE + d); if (RUHE - d >= 0) reihe.push(RUHE - d); }
    var holen = function (i) {
      var alsBild = function () {
        return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = url(i); })
          .then(function (im) { return im && im.decode ? im.decode().then(function () { return im; }, function () { return im; }) : im; });
      };
      if (!window.createImageBitmap || !window.fetch) return alsBild();
      return fetch(url(i)).then(function (r) { if (!r.ok) throw r; return r.blob(); })
        .then(function (b) { return createImageBitmap(b, { resizeWidth: px, resizeHeight: px, resizeQuality: "high" }).catch(function () { return createImageBitmap(b); }); })
        .catch(alsBild);
    };
    // vier zugleich, damit das Dekodieren den Rest der Seite nicht aufhält
    var pos = 0;
    var weiter = function () {
      if (pos >= reihe.length) return;
      var i = reihe[pos++];
      holen(i).then(function (b) { if (b) { vorrat[i] = b; if (gemalt < 0 || Math.abs(i - soll) < Math.abs(gemalt - soll)) { gemalt = -2; anstossen(); } } weiter(); });
    };
    for (var k = 0; k < 4; k++) weiter();
  };
  var soll = RUHE;
  var malen = function (nr) {
    var i = naechstes(nr);
    if (i < 0 || i === gemalt) return;
    ctx.clearRect(0, 0, px, px);
    ctx.drawImage(vorrat[i], 0, 0, px, px);
    gemalt = i;
  };

  var zeit0 = performance.now(), letzte = zeit0, laeuft = false, fs = -1, angekommen = null, sichtbar = false;
  var zeichnen = function (jetzt) {
    if (!m && !messen()) return false;
    var y = scrollY, f = klemme(y / m.ende);
    // weich nachlaufen (Zeitkonstante etwa 110 ms, unabhängig von der Bildrate)
    var dt = Math.min(64, jetzt - letzte); letzte = jetzt;
    if (fs < 0) fs = f; else fs += (f - fs) * (1 - Math.exp(-dt / 110));
    if (Math.abs(f - fs) < 0.0004) fs = f;
    var fl = klemme(fs / DA);                      // bei 86 % sitzt der Chip genau auf dem Ziel
    var g = inOut(fl), t = (jetzt - zeit0) / 1000;
    var ruhe = 1 - weich(klemme(fs / 0.08));       // oben ganz leichtes Schweben, nur auf und ab
    var nah = Math.sin(fl * Math.PI);
    var yv = Math.min(fs, 1) * m.ende;              // Scrollstellung, wie sie der Flug gerade sieht
    var x = mix(m.ax, m.zx, g) + nah * Math.min(vw * 0.12, 160) * (m.zx > m.ax ? -1 : 1);
    var yy = mix(m.ay, m.zy, mix(fl, g, 0.4)) - yv + Math.sin(t * 1.1) * 5 * ruhe;
    var s = mix(m.as, m.zs, g) * (1 + nah * 0.35);
    var dreh = nah * -16;
    soll = Math.round(Math.max(0, Math.min(N - 1, RUHE + 13 * Math.sin(fl * Math.PI * 2))));
    malen(soll);
    var k = s / GROSS;
    flieger.style.transform = "translate3d(" + (x - s / 2).toFixed(2) + "px," + (yy - s / 2).toFixed(2) + "px,0) rotate(" + dreh.toFixed(2) + "deg) scale(" + k.toFixed(4) + ")";
    // Schatten: Deckkraft als Variable, der Schatten ist ein eigenes Element unter der Leinwand
    flieger.style.setProperty("--schatten", ((1 - g) * 0.6 + nah * 0.25).toFixed(2));
    // erst tauschen, wenn der Flug wirklich am Ziel ist (nicht, solange er noch nachläuft)
    var da = fs >= DA && f >= DA && gemalt >= 0;
    if (da !== angekommen) {
      angekommen = da;
      flieger.style.visibility = da ? "hidden" : "visible";
      akt.style.setProperty("--kn-da", da ? "1" : "0");
    }
    if (!sichtbar && gemalt >= 0) { sichtbar = true; wurzel.classList.add("chipflug-an"); }
    bild.style.setProperty("--unscharf", weich(klemme((fs - 0.7) / 0.16)).toFixed(3));
    return fs !== f || fs < 0.08;                    // weiterlaufen, solange er nachläuft oder oben schwebt
  };
  var schleife = function (jetzt) {
    if (zeichnen(jetzt) && !document.hidden) requestAnimationFrame(schleife); else laeuft = false;
  };
  var anstossen = function () { if (!laeuft) { laeuft = true; letzte = performance.now(); requestAnimationFrame(schleife); } };
  addEventListener("scroll", anstossen, { passive: true });
  addEventListener("resize", function () { var alt = GROSS; m = null; messen(); if (GROSS > alt * 1.15) { gemalt = -1; vorrat = []; laden(); } anstossen(); });
  addEventListener("load", function () { m = null; messen(); anstossen(); });
  document.addEventListener("visibilitychange", anstossen);
  if (messen()) laden(); else addEventListener("load", function () { if (!px) laden(); });
  anstossen();
})();
