/* SkiTag · Chip-Seite, „Was im Chip steckt“ (Feedback 131, ersetzt chip-seite.js).
   Maxis Modell „fertig4“ mit allen Innenteilen ist in Blender (Cycles) gerendert: eine Bildfolge vom geschlossenen bis zum
   ganz offenen Chip (assets/media/innen/00.webp ..., 1800 px breit gerechnet und auf den Chip zugeschnitten; wo die
   Fläche auch mit der Pixeldichte des Bildschirms kleiner ist, die kleinere Fassung in innen/m/). Seit Feedback 132 öffnen
   sich die Teile gestaffelt von außen nach innen und stecken nicht mehr ineinander; die Größe richtet sich nach dem
   Bildschirm, nicht nach dem Sparmodus. Die Bildfolge hängt nicht am Scrollen (das ruckelte beim langsamen Scrollen):
   sobald der Abschnitt im Bild steht, öffnet sich der Chip in einem Zug (1,8 s); sobald man nach oben scrollt, schließt
   er sich wieder, scrollt man weiter nach unten, öffnet er sich erneut. Gespielt wird erst, wenn alle Bilder geladen
   und dekodiert sind.
   Seit 2026-11-22 (Ruckeln): die Bilder liegen vorab dekodiert als ImageBitmap bereit und werden auf ein Canvas gemalt,
   statt die Quelle eines img zu tauschen (das ließ den Browser bei jedem Wechsel neu dekodieren). Zwischen zwei
   Nachbarbildern wird genau überblendet, die Namen und Linien gehen ebenso stufenlos mit.
   punkte.json im jeweiligen Ordner sagt je Bild, wo die sechs Teile ihren äußersten Punkt rechts haben (Ansatz der Linie),
   wo die Spalte der Namen steht und wie hoch der Stapel reicht; die kleine Fassung darf weniger Bilder haben (fehlt ihre
   punkte.json, gilt die große). Die Namen kommen nacheinander, wenn der Chip fast offen ist.
   Bei „weniger Bewegung“ steht der Chip gleich offen da. */
(function () {
  "use strict";
  var akt = document.getElementById("innenleben");
  var feld = akt && akt.querySelector(".innen__bild"), zeiger = akt && akt.querySelector(".innen__zeiger");
  if (!feld || !zeiger) return;
  var wurzel = document.documentElement, marken = Array.prototype.slice.call(akt.querySelectorAll(".innen__marken li"));
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Breite des ganzen Bildes in Gerätepixeln: über 1150 die große Fassung, sonst die kleine
  var flaeche = Math.min(feld.clientWidth || window.innerWidth, (feld.clientHeight || window.innerHeight) * 4 / 3);
  var klein = flaeche * Math.min(window.devicePixelRatio || 1, 2) < 1150;
  var ORDNER = "assets/media/innen/" + (klein ? "m/" : ""), V = "?v=5", N = 48, SEITE = 4 / 3, DAUER = 1800;
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var abschnitt = function (x, a, b) { return klemme((x - a) / (b - a)); };
  var weich = function (x) { return x * x * (3 - 2 * x); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  var inOut = function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  var url = function (i) { return ORDNER + (i < 10 ? "0" : "") + i + ".webp" + V; };

  var leinwand = document.createElement("canvas");
  leinwand.className = "innen__film"; leinwand.setAttribute("aria-hidden", "true");
  feld.insertBefore(leinwand, zeiger);
  var ctx = leinwand.getContext("2d");
  var gezeigt = 0, gemalt = -1;   // gezeigt: Stellung als Kommazahl (0 bis N - 1)

  var NS = "http://www.w3.org/2000/svg";
  var linien = marken.map(function () {
    var g = document.createElementNS(NS, "g"), pfad = document.createElementNS(NS, "path"), kreis = document.createElementNS(NS, "circle");
    kreis.setAttribute("r", "4"); g.style.opacity = "0"; g.appendChild(pfad); g.appendChild(kreis); zeiger.appendChild(g);
    return { g: g, pfad: pfad, kreis: kreis };
  });

  /* Ein Bild laden und fertig dekodieren: als ImageBitmap (dekodiert neben dem Hauptfaden), sonst als img */
  var holen = function (i) {
    var alsBild = function () {
      return new Promise(function (ok, nein) {
        var im = new Image(); im.decoding = "async"; im.onload = function () { ok(im); }; im.onerror = nein; im.src = url(i);
      }).then(function (im) { return im.decode ? im.decode().then(function () { return im; }, function () { return im; }) : im; });
    };
    if (!window.createImageBitmap || !window.fetch) return alsBild();
    return fetch(url(i)).then(function (r) { if (!r.ok) throw r; return r.blob(); })
      .then(function (b) { return createImageBitmap(b); })
      .catch(alsBild);
  };
  var vorrat = [], geladen = null, erstes = null;
  // nur Bilder zeigen, die wirklich da sind (fehlt eines, nimmt es das nächste gute)
  var gutesBild = function (i) { for (var d = 0; d < N; d++) { if (vorrat[i - d]) return i - d; if (vorrat[i + d]) return i + d; } return -1; };
  var ablegen = function (i) { return function (b) { vorrat[i] = b; if (Math.abs(i - gezeigt) < 1) { gemalt = -1; zeichnen(); } }; };
  var laden = function () {
    if (geladen) return geladen;
    var liste = [erstes || holen(0).then(ablegen(0), function () {})];
    for (var i = 1; i < N; i++) liste.push(holen(i).then(ablegen(i), function () {}));
    geladen = Promise.all(liste);
    return geladen;
  };

  /* Malen: zwei Nachbarbilder genau überblenden ((1 - t) · A + t · B, mit „lighter“ addiert) */
  var malen = function () {
    if (gezeigt === gemalt) return;
    var i = Math.floor(gezeigt), t = gezeigt - i;
    if (t < 0.02) t = 0; else if (t > 0.98) { i += 1; t = 0; }
    var a = vorrat[i] ? i : gutesBild(i);
    if (a < 0) return;
    var A = vorrat[a], B = t > 0 && a === i && vorrat[i + 1] ? vorrat[i + 1] : null;
    var w = A.naturalWidth || A.width, h = A.naturalHeight || A.height;
    if (leinwand.width !== w || leinwand.height !== h) { leinwand.width = w; leinwand.height = h; }
    ctx.globalCompositeOperation = "copy"; ctx.globalAlpha = B ? 1 - t : 1;
    ctx.drawImage(A, 0, 0, w, h);
    if (B) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = t; ctx.drawImage(B, 0, 0, w, h); }
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    gemalt = gezeigt;
  };

  // Punktdaten zwischen zwei Bildern mischen, damit Linien und Namen stufenlos mitgehen
  var punkt = function (f) {
    var L = daten.bilder, n = L.length - 1, x = Math.max(0, Math.min(n, f)), i = Math.floor(x), t = x - i;
    var p = L[i], q = L[Math.min(i + 1, n)];
    if (t === 0 || p === q) return p;
    return {
      e: mix(p.e, q.e, t), spalte: mix(p.spalte, q.spalte, t), oben: mix(p.oben, q.oben, t), unten: mix(p.unten, q.unten, t),
      orte: p.orte.map(function (o, k) { return [mix(o[0], q.orte[k][0], t), mix(o[1], q.orte[k][1], t)]; })
    };
  };

  var daten = null, letzteLage = "";
  var zeichnen = function () {
    if (!daten) return;
    malen();
    var B = feld.clientWidth, H = feld.clientHeight; if (!B || !H) return;
    var b = punkt(gezeigt);
    // Bild mit „contain“ in der Fläche
    var bw = Math.min(B, H * SEITE), bh = bw / SEITE, bx = (B - bw) / 2, by = (H - bh) / 2;
    // das Bild ist auf den Chip zugeschnitten: an seinen Platz im ganzen Bild setzen
    var z = daten.ausschnitt || [0, 0, 1, 1], lage = [bx + z[0] * bw, by + z[1] * bh, (z[2] - z[0]) * bw, (z[3] - z[1]) * bh].map(Math.round).join(",");
    if (lage !== letzteLage) {
      letzteLage = lage; var l = lage.split(",");
      leinwand.style.left = l[0] + "px"; leinwand.style.top = l[1] + "px"; leinwand.style.width = l[2] + "px"; leinwand.style.height = l[3] + "px";
      zeiger.setAttribute("viewBox", "0 0 " + Math.round(B) + " " + Math.round(H));
    }
    var spalte = Math.min(bx + b.spalte * bw + (B < 500 ? 18 : 34), B - (B < 500 ? 94 : 110));
    marken.forEach(function (li, k) {
      var an = weich(abschnitt(b.e, 0.62 + k * 0.045, 0.8 + k * 0.045));
      var y = by + mix(b.oben, b.unten, k / (marken.length - 1)) * bh;
      var ox = bx + b.orte[k][0] * bw, oy = by + b.orte[k][1] * bh, L = linien[k];
      li.style.opacity = an.toFixed(3);
      li.style.transform = "translate3d(" + (spalte + (1 - an) * 10).toFixed(1) + "px," + y.toFixed(1) + "px,0) translateY(-50%)";
      L.g.style.opacity = an.toFixed(3);
      L.kreis.setAttribute("cx", ox.toFixed(1)); L.kreis.setAttribute("cy", oy.toFixed(1));
      var knick = Math.max(ox + 10, spalte - 30);
      L.pfad.setAttribute("d", "M" + ox.toFixed(1) + " " + oy.toFixed(1) + " L" + knick.toFixed(1) + " " + y.toFixed(1) + " L" + (spalte - 9).toFixed(1) + " " + y.toFixed(1));
    });
  };

  /* Öffnen und Schließen nach der Zeit: von der aktuellen Stellung zum Ziel (0 oder N - 1), stufenlos */
  var ziel = gezeigt, von = gezeigt, start = 0, laeuft = false, wartetAuf = -1;
  var bild = function (jetzt) {
    var weg = Math.abs(ziel - von), dauer = DAUER * Math.max(0.25, weg / (N - 1));
    var t = klemme((jetzt - start) / dauer);
    gezeigt = mix(von, ziel, inOut(t));
    zeichnen();
    if (t < 1) requestAnimationFrame(bild); else laeuft = false;
  };
  var fahren = function (nach) {
    if (nach === ziel && (laeuft || gezeigt === nach || wartetAuf === nach)) return;
    ziel = nach; wartetAuf = nach;
    laden().then(function () {
      wartetAuf = -1;
      if (ziel !== nach) return;
      von = gezeigt; start = performance.now();
      if (!laeuft) { laeuft = true; requestAnimationFrame(bild); }
    });
  };

  /* Wann öffnen: steht der Abschnitt gut im Bild (gepinnt ab ein paar Prozent, sonst wenn er die Mitte erreicht);
     schließen, wenn man über den Abschnitt zurück nach oben scrollt */
  var pruefen = function () {
    if (ruhig || !daten) return;
    var r = akt.getBoundingClientRect(), vh = window.innerHeight;
    var p = parseFloat(akt.style.getPropertyValue("--sc-p"));
    // Feedback 131: die Richtung zählt. Nach oben scrollen schließt den Chip sofort, nach unten öffnet er sich wieder
    // (kleine Bewegungen unter 12 px zählen nicht, damit er beim Zittern am Mausrad nicht hin und her springt)
    var y = window.scrollY, schritt = y - letztesY;
    if (Math.abs(schritt) >= 12) { richtung = schritt > 0 ? 1 : -1; letztesY = y; }
    var imBild = r.top < vh * 0.45 && r.bottom > vh * 0.3;
    var offen = !isNaN(p) && p > 0 ? p > 0.03 : imBild;
    if (richtung < 0 && r.bottom > 0) fahren(0);
    else if (offen && richtung >= 0) fahren(N - 1);
    else if (r.top > vh * 0.6) fahren(0);
  };
  var letztesY = window.scrollY, richtung = 0;
  var wartet = false;
  window.addEventListener("scroll", function () { if (!wartet) { wartet = true; requestAnimationFrame(function () { wartet = false; pruefen(); }); } }, { passive: true });
  window.addEventListener("resize", function () { letzteLage = ""; zeichnen(); });

  // Anzahl der Bilder kommt aus der Punktdatei des Ordners; erst danach wird geladen und gespielt.
  // Das erste Bild kommt sofort, alle anderen, sobald der Abschnitt näher kommt.
  var punkteHolen = function (ordner) { return fetch(ordner + "punkte.json" + V).then(function (r) { if (!r.ok) throw r; return r.json(); }); };
  punkteHolen(ORDNER).catch(function () { return punkteHolen("assets/media/innen/"); }).then(function (d) {
    daten = d; N = d.bilder.length;
    wurzel.classList.add("chip3d-seite", "innen-film-an");
    if (ruhig) { gezeigt = N - 1; ziel = N - 1; holen(N - 1).then(ablegen(N - 1), function () {}); }
    else erstes = holen(0).then(ablegen(0), function () {});
    zeichnen(); pruefen();
    if ("IntersectionObserver" in window && !ruhig) new IntersectionObserver(function (e) { if (e[0].isIntersecting) laden(); }, { rootMargin: "100% 0px" }).observe(akt);
    else if (!ruhig) laden();
  }).catch(function () {});
})();
