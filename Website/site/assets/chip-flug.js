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
   Bei weniger Bewegung bleibt alles still (die Klasse chipflug fehlt dann).

   Runde 160: oben steht der SkiTag-Ausleihautomat (Bildfolge aus Blender, assets/media/automat/, vorher ein Wandgerät). Sein
   Ablauf läuft beim Laden von selbst, eine Spirale dreht sich und am Ende liegt der Chip im Ausgabefach. Beim ersten Scrollen übernimmt der Flieger
   genau dort (.chip-flug-start, aus data-chip), beginnt mit demselben Drehbild wie im Fach (data-chipbild) und dreht
   sich im Flug zum Ruhebild. Vorher (Feedback 157 und 158) waren es eine Jackentasche und ein Automat.
   Ohne Flug (Handy, Tablet hochkant) läuft nur der Ablauf der Station. */
(function () {
  "use strict";
  var wurzel = document.documentElement;
  var start = document.querySelector(".chip-flug-start");
  var akt = document.getElementById("der-chip");
  var ziel = akt && akt.querySelector(".knopf__chip");
  var bild = akt && akt.querySelector(".knopf__bild");
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var weich = function (x) { return x * x * (3 - 2 * x); };

  /* Feedback 159: die Ausleihstation (Bildfolge auf einer Leinwand, darüber die Frontplatte als HTML). Der Ablauf hängt
     nicht mehr am Scrollen: nach dem Laden läuft er in etwa fünf Sekunden von selbst durch (Ausleihen, Anzahl, Bezahlen,
     Code, dann fällt der Chip ins Fach). Scrollt man früher, läuft er zehnmal so schnell zu Ende, damit der Chip sofort
     draußen ist. Die Frontplatte liegt über eine perspektivische Matrix (matrix3d) genau auf der Front im Bild. */
  var station = (function () {
    var fig = document.querySelector(".station");
    if (!fig) return null;
    var front = fig.querySelector(".station__front"), startEl = fig.querySelector(".station__start");
    var zahlen = function (n) { return (fig.getAttribute(n) || "").trim().split(/\s+/).map(Number); };
    var ecken = zahlen("data-front"), chipR = zahlen("data-chip");
    // Rahmen des Chips in Bild K der Drehfolge (assets/media/chip/09.webp, Anteile), daraus die Startstelle des Fliegers
    var CB = [0.2467, 0.1367, 0.7611, 0.8722];
    var matrix = function (q, z) {   // Homographie von vier Punkten q auf vier Punkte z, als CSS matrix3d
      var A = [], B = [];
      for (var i = 0; i < 4; i++) {
        var x = q[2 * i], y = q[2 * i + 1], X = z[2 * i], Y = z[2 * i + 1];
        A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); B.push(X);
        A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); B.push(Y);
      }
      for (var c = 0; c < 8; c++) {
        var mx = c; for (var r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[mx][c])) mx = r;
        var t = A[c]; A[c] = A[mx]; A[mx] = t; t = B[c]; B[c] = B[mx]; B[mx] = t;
        for (r = 0; r < 8; r++) if (r !== c) {
          var f = A[r][c] / A[c][c]; for (var k = c; k < 8; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c];
        }
      }
      var h = B.map(function (v, i) { return v / A[i][i]; });
      return "matrix3d(" + [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1].map(function (v) { return +v.toFixed(8); }).join(",") + ")";
    };
    var legen = function () {
      var w = fig.clientWidth, h = fig.clientHeight;
      if (!w || ecken.length !== 8) return;
      var z = ecken.map(function (v, i) { return v * (i % 2 ? h : w); });
      front.style.transform = matrix([0, 0, 1392, 0, 1392, 3248, 0, 3248], z);
      if (chipR.length === 4) {
        var S = (chipR[2] - chipR[0]) * w / (CB[2] - CB[0]);
        startEl.style.left = ((chipR[0] * w - CB[0] * S) / w * 100).toFixed(3) + "%";
        startEl.style.top = ((chipR[1] * h - CB[1] * S) / h * 100).toFixed(3) + "%";
        startEl.style.width = (S / w * 100).toFixed(3) + "%";
      }
      fig.classList.add("station--bereit");
    };
    legen();
    var bw0 = fig.clientWidth;
    addEventListener("resize", function () { if (Math.abs(fig.clientWidth - bw0) > 1) { bw0 = fig.clientWidth; legen(); } });

    var ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches, lw = fig.querySelector(".station__film");
    if (ruhig || !lw || !lw.getContext) {   // still: Chip im Fach (Standbild), Bildschirm zeigt den letzten Schritt
      fig.classList.add("station--an", "station--bezahlt");
      return { tick: function () { return false; }, fertig: function () { return true; }, leer: function () {} };
    }
    fig.classList.add("station--spielt");
    var schritte = [].slice.call(fig.querySelectorAll(".station__schritt"));
    var knoepfe = [fig.querySelector('[data-tipp="0"]'), fig.querySelector('[data-tipp="1"]')];
    var c = lw.getContext("2d"), NT = 24, ORD = "assets/media/automat/", VT = "?v=1", bilder = [], leerBild = null;
    var dpr = Math.min(devicePixelRatio || 1, 2), bw = Math.min(730, Math.ceil(fig.clientWidth * dpr)), bh = Math.round(bw * 1200 / 730);
    lw.width = bw; lw.height = bh;
    var holen = function (src) {
      var alsBild = function () { return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = src; }); };
      if (!window.createImageBitmap || !window.fetch) return alsBild();
      return fetch(src).then(function (r) { if (!r.ok) throw r; return r.blob(); })
        .then(function (b) { return createImageBitmap(b, { resizeWidth: bw, resizeHeight: bh, resizeQuality: "high" }).catch(function () { return createImageBitmap(b); }); })
        .catch(alsBild);
    };
    var adresse = function (i) { return ORD + (i < 10 ? "0" : "") + i + ".webp" + VT; };
    var reihe = []; for (var i = 0; i < NT; i++) reihe.push(i); reihe.push("leer");
    var pos = 0, geladen = 0;
    var weiter = function () {
      if (pos >= reihe.length) return;
      var k = reihe[pos++];
      holen(k === "leer" ? ORD + "leer.webp" + VT : adresse(k)).then(function (b) {
        if (b) { if (k === "leer") leerBild = b; else bilder[k] = b; }
        geladen++; weiter();
      });
    };
    for (var n = 0; n < 4; n++) weiter();

    // Zeitplan in ms: Bildschirm an, Tipp auf „Chip ausleihen“, Tipp auf „Weiter“, Bezahlen, Code, Chip fällt
    var T = { tipp0: 1050, s1: 1350, tipp1: 2150, s2: 2450, bezahlt: 3350, s3: 3900, chip: 3700, fall: 2000, ende: 5800 };
    var t = -450, zuletzt = 0, gezeigt = null, istLeer = false, k0 = -1;
    var malen = function (b, wahl) { if (!b || wahl === gezeigt) return; c.clearRect(0, 0, bw, bh); c.drawImage(b, 0, 0, bw, bh); gezeigt = wahl; fig.classList.add("station--film"); };
    var anwenden = function () {
      fig.classList.toggle("station--an", t > 0);
      var k = t < T.s1 ? 0 : t < T.s2 ? 1 : t < T.s3 ? 2 : 3;
      if (k !== k0) { k0 = k; schritte.forEach(function (el, i) { el.classList.toggle("ist-da", i === k); el.classList.toggle("war-da", i < k); }); }
      knoepfe[0].classList.toggle("tippt", t >= T.tipp0 && t < T.s1 + 150);
      knoepfe[1].classList.toggle("tippt", t >= T.tipp1 && t < T.s2 + 150);
      fig.classList.toggle("station--zahlt", t >= T.s2 && t < T.bezahlt);
      fig.classList.toggle("station--bezahlt", t >= T.bezahlt);
      if (istLeer && leerBild) { malen(leerBild, "leer"); return; }
      var nr = Math.round(klemme((t - T.chip) / T.fall) * (NT - 1));
      for (var d = 0; d <= nr; d++) if (bilder[nr - d]) { malen(bilder[nr - d], nr - d); break; }
    };
    return {
      // einen Schritt weiter; eilig: es wird gescrollt, dann läuft der Rest zehnmal so schnell
      tick: function (jetzt, eilig) {
        var dt = zuletzt ? Math.min(64, jetzt - zuletzt) : 0; zuletzt = jetzt;
        if (!bilder[0] && t < 0) return true;              // erst los, wenn das erste Bild da ist
        if (t < T.ende) t = Math.min(T.ende, t + dt * (eilig ? 10 : 1));
        anwenden();
        return t < T.ende || (gezeigt !== NT - 1 && gezeigt !== "leer" && geladen < reihe.length);
      },
      fertig: function () { return t >= T.ende; },
      leer: function (ja) { if (ja !== istLeer) { istLeer = ja; gezeigt = null; anwenden(); } }
    };
  })();

  var aufgeben = function () {
    wurzel.classList.remove("chipflug", "chipflug-an"); if (akt) akt.style.setProperty("--kn-da", "1");
    // ohne Flug (Handy, Tablet hochkant) läuft nur der Ablauf der Station, der Chip bleibt im Fach
    if (!station) return;
    var schritt = function (jetzt) { if (station.tick(jetzt, scrollY > 2)) requestAnimationFrame(schritt); };
    requestAnimationFrame(schritt);
  };
  if (!start || !ziel || !bild || !wurzel.classList.contains("chipflug")) return aufgeben();

  var ORDNER = "assets/media/chip/", V = "?v=1", N = 30, RUHE = 16, DA = 0.86;
  var KS = +((document.querySelector(".station") || { getAttribute: function () { return ""; } }).getAttribute("data-chipbild")) || RUHE;   // Bild, in dem der Chip im Fach steht
  var url = function (i) { return ORDNER + (i < 10 ? "0" : "") + i + ".webp" + V; };
  var inOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var mix = function (a, b, t) { return a + (b - a) * t; };

  var flieger = document.createElement("div");
  flieger.className = "chip-flieger"; flieger.setAttribute("aria-hidden", "true"); flieger.style.visibility = "hidden";
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
    m.aus = 0;   // seit Feedback 159 kommt der Chip ohne Scrollen heraus, der Flug beginnt beim ersten Pixel
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
    if (KS !== RUHE) { reihe.splice(reihe.indexOf(KS), 1); reihe.unshift(KS); }   // das Startbild zuerst
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
  var soll = KS;
  var malen = function (nr) {
    var i = naechstes(nr);
    if (i < 0 || i === gemalt) return;
    ctx.clearRect(0, 0, px, px);
    ctx.drawImage(vorrat[i], 0, 0, px, px);
    gemalt = i;
  };

  var zeit0 = performance.now(), letzte = zeit0, laeuft = false, fs = -1, angekommen = null, sichtbar = false, istRaus = null;
  var zeichnen = function (jetzt) {
    if (!m && !messen()) return false;
    var y = scrollY, f = klemme(y / m.ende);
    // weich nachlaufen (Zeitkonstante etwa 110 ms, unabhängig von der Bildrate)
    var dt = Math.min(64, jetzt - letzte); letzte = jetzt;
    if (fs < 0) fs = f; else fs += (f - fs) * (1 - Math.exp(-dt / 110));
    if (Math.abs(f - fs) < 0.0004) fs = f;
    var ys = fs * m.ende;                           // Scrollstellung in Pixeln, wie sie der Flug gerade sieht
    var gestartet = ys > 0.5;
    var stationLaeuft = station ? station.tick(jetzt, gestartet) : false;
    var draussen = !station || (station.fertig() && gestartet);   // Chip liegt im Fach und es wird gescrollt: ab hier fliegt er
    if (station) station.leer(draussen);
    var fl = klemme((ys - m.aus) / (DA * m.ende - m.aus));   // bei 86 % sitzt der Chip genau auf dem Ziel
    var g = inOut(fl), t = (jetzt - zeit0) / 1000;
    var ruhe = 0;                                     // Feedback 156: in der Tasche schwebt nichts mehr
    var nah = Math.sin(fl * Math.PI);
    var yv = Math.min(fs, 1) * m.ende;
    var x = mix(m.ax, m.zx, g) + nah * Math.min(vw * 0.12, 160) * (m.zx > m.ax ? -1 : 1);
    var yy = mix(m.ay, m.zy, mix(fl, g, 0.4)) - yv + Math.sin(t * 1.1) * 5 * ruhe;
    var s = mix(m.as, m.zs, g) * (1 + nah * 0.35);
    var dreh = nah * -16;
    soll = Math.round(Math.max(0, Math.min(N - 1, mix(KS, RUHE, g) + 12 * Math.sin(fl * Math.PI * 2))));
    malen(soll);
    var k = s / GROSS;
    flieger.style.transform = "translate3d(" + (x - s / 2).toFixed(2) + "px," + (yy - s / 2).toFixed(2) + "px,0) rotate(" + dreh.toFixed(2) + "deg) scale(" + k.toFixed(4) + ")";
    // Schatten: Deckkraft als Variable, der Schatten ist ein eigenes Element unter der Leinwand
    flieger.style.setProperty("--schatten", (weich(klemme(fl / 0.15)) * (1 - g) * 0.6 + nah * 0.25).toFixed(2));
    // erst tauschen, wenn der Flug wirklich am Ziel ist (nicht, solange er noch nachläuft)
    var da = fs >= DA && f >= DA && gemalt >= 0;
    if (da !== angekommen) { angekommen = da; akt.style.setProperty("--kn-da", da ? "1" : "0"); }
    // der Flieger ist nur zwischen Tasche und Ziel zu sehen; solange der Chip in der Tasche steckt, zeigt ihn die Bildfolge
    var zeigen = draussen && !da && gemalt >= 0;
    if (zeigen !== istRaus) { istRaus = zeigen; flieger.style.visibility = zeigen ? "visible" : "hidden"; wurzel.classList.toggle("chipflug-an", zeigen); }
    sichtbar = !station || station.fertig();
    bild.style.setProperty("--unscharf", weich(klemme((fs - 0.7) / 0.16)).toFixed(3));
    return fs !== f || !sichtbar || stationLaeuft;                    // weiterlaufen, solange er nachläuft oder noch nicht übernommen hat
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
