/* SkiTag · Chip-Seite, „Was im Chip steckt“ (Feedback 131, ersetzt chip-seite.js).
   Maxis Modell „fertig4“ mit allen Innenteilen ist in Blender (Cycles) gerendert: 48 Bilder vom geschlossenen bis zum
   ganz offenen Chip (assets/media/innen/00.webp bis 47.webp, 1800 px breit gerechnet und auf den Chip zugeschnitten; wo die
   Fläche auch mit der Pixeldichte des Bildschirms kleiner ist, die kleinere Fassung in innen/m/). Seit Feedback 132 öffnen
   sich die Teile gestaffelt von außen nach innen und stecken nicht mehr ineinander; die Größe richtet sich nach dem
   Bildschirm, nicht mehr nach dem Sparmodus (der lud auf Rechnern mit vier Kernen die kleinen Bilder, das wirkte pixelig). Die Bildfolge hängt nicht am Scrollen (das ruckelte beim langsamen Scrollen): sobald der Abschnitt im Bild
   steht, öffnet sich der Chip in einem Zug (1,8 s, etwa 26 Bilder je Sekunde); sobald man nach oben scrollt, schließt
   er sich wieder, scrollt man weiter nach unten, öffnet er sich erneut. Gespielt wird erst, wenn alle Bilder geladen und dekodiert sind.
   assets/media/innen/punkte.json sagt je Bild, wo die sechs Teile ihren äußersten Punkt rechts haben (Ansatz der Linie),
   wo die Spalte der Namen steht und wie hoch der Stapel reicht. Die Namen kommen nacheinander, wenn der Chip fast offen ist.
   Bei „weniger Bewegung“ steht der Chip gleich offen da. */
(function () {
  "use strict";
  var akt = document.getElementById("innenleben");
  var feld = akt && akt.querySelector(".innen__bild"), zeiger = akt && akt.querySelector(".innen__zeiger");
  if (!feld || !zeiger) return;
  var wurzel = document.documentElement, marken = Array.prototype.slice.call(akt.querySelectorAll(".innen__marken li"));
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Breite des ganzen Bildes in Gerätepixeln: über 1150 die große Fassung (1800 px), sonst die kleine (1100 px)
  var flaeche = Math.min(feld.clientWidth || window.innerWidth, (feld.clientHeight || window.innerHeight) * 4 / 3);
  var klein = flaeche * Math.min(window.devicePixelRatio || 1, 2) < 1150;
  var ORDNER = "assets/media/innen/" + (klein ? "m/" : ""), V = "?v=4", N = 48, SEITE = 4 / 3, DAUER = 1800;
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var abschnitt = function (x, a, b) { return klemme((x - a) / (b - a)); };
  var weich = function (x) { return x * x * (3 - 2 * x); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  var inOut = function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  var url = function (i) { return ORDNER + (i < 10 ? "0" : "") + i + ".webp" + V; };

  var a = new Image();
  a.className = "innen__film"; a.alt = ""; a.decoding = "async"; a.setAttribute("aria-hidden", "true");
  a.src = url(0);
  feld.insertBefore(a, zeiger);
  var gezeigt = 0;

  var NS = "http://www.w3.org/2000/svg";
  var linien = marken.map(function () {
    var g = document.createElementNS(NS, "g"), pfad = document.createElementNS(NS, "path"), kreis = document.createElementNS(NS, "circle");
    kreis.setAttribute("r", "4"); g.style.opacity = "0"; g.appendChild(pfad); g.appendChild(kreis); zeiger.appendChild(g);
    return { g: g, pfad: pfad, kreis: kreis };
  });

  /* Alle Bilder vorladen und dekodieren; erst dann darf die Folge laufen (sonst bliebe sie hängen) */
  var vorrat = [], da = [], geladen = null;
  // nur Bilder zeigen, die wirklich geladen sind (fehlt eines, bleibt das letzte gute stehen; kein Rahmen für ein fehlendes Bild)
  var gutesBild = function (i) { for (var d = 0; d < N; d++) { if (da[i - d]) return i - d; if (da[i + d]) return i + d; } return 0; };
  var laden = function () {
    if (geladen) return geladen;
    var liste = [];
    for (var i = 0; i < N; i++) (function (i) {
      var im = new Image(); im.decoding = "async"; im.src = url(i); vorrat[i] = im;
      liste.push((im.decode ? im.decode() : new Promise(function (ok, nein) { im.onload = ok; im.onerror = nein; }))
        .then(function () { da[i] = true; }, function () { da[i] = false; }));
    })(i);
    geladen = Promise.all(liste);
    return geladen;
  };

  var daten = null, letzteLage = "";
  var zeichnen = function () {
    if (geladen && !da[gezeigt]) gezeigt = gutesBild(gezeigt);
    if (a.getAttribute("data-nr") !== String(gezeigt)) { a.src = url(gezeigt); a.setAttribute("data-nr", String(gezeigt)); }
    if (!daten) return;
    var B = feld.clientWidth, H = feld.clientHeight; if (!B || !H) return;
    var b = daten.bilder[Math.min(gezeigt, daten.bilder.length - 1)];
    // Bild mit „contain“ in der Fläche
    var bw = Math.min(B, H * SEITE), bh = bw / SEITE, bx = (B - bw) / 2, by = (H - bh) / 2;
    // das Bild ist auf den Chip zugeschnitten: an seinen Platz im ganzen Bild setzen
    var z = daten.ausschnitt || [0, 0, 1, 1], lage = [bx + z[0] * bw, by + z[1] * bh, (z[2] - z[0]) * bw, (z[3] - z[1]) * bh].map(Math.round).join(",");
    if (lage !== letzteLage) {
      letzteLage = lage; var l = lage.split(",");
      a.style.left = l[0] + "px"; a.style.top = l[1] + "px"; a.style.width = l[2] + "px"; a.style.height = l[3] + "px";
    }
    zeiger.setAttribute("viewBox", "0 0 " + Math.round(B) + " " + Math.round(H));
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

  /* Öffnen und Schließen nach der Zeit: von der aktuellen Stellung zum Ziel (0 oder N - 1) */
  var ziel = gezeigt, von = gezeigt, start = 0, laeuft = false, wartetAuf = -1;
  var bild = function (jetzt) {
    var weg = Math.abs(ziel - von), dauer = DAUER * Math.max(0.25, weg / (N - 1));
    var t = klemme((jetzt - start) / dauer);
    gezeigt = Math.round(mix(von, ziel, inOut(t)));
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
    if (ruhig) return;
    var r = akt.getBoundingClientRect(), vh = window.innerHeight;
    var p = parseFloat(akt.style.getPropertyValue("--sc-p"));
    if (!daten) return;
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
  window.addEventListener("resize", zeichnen);

  // rechtzeitig vorladen, wenn der Abschnitt näher kommt
  // Anzahl der Bilder kommt aus der Punktdatei; erst danach wird geladen und gespielt
  fetch("assets/media/innen/punkte.json" + V).then(function (r) { return r.json(); }).then(function (d) {
    daten = d; N = d.bilder.length;
    wurzel.classList.add("chip3d-seite", "innen-film-an");
    if (ruhig) { gezeigt = N - 1; ziel = N - 1; laden().then(zeichnen); }
    zeichnen(); pruefen();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) laden(); }, { rootMargin: "100% 0px" }).observe(akt);
  }).catch(function () {});
})();
