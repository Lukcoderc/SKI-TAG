/* SkiTag · der Chip als echte Renderbilder (Feedback 131, ersetzt chip-3d.js).
   Maxis Modell „fertig4“ ist in Blender (Cycles) wie ein Produktfoto gerendert: 30 Bilder einer Drehung um die
   Hochachse (assets/media/chip/00.webp bis 29.webp, Gieren -0,72 bis +0,44 rad in Schritten von 0,04, leicht von oben).
   assets/media/chip/punkte.json sagt je Bild, wo LED, Knopf, Ring, Gummirand und Seite im Bild liegen (0 bis 1).
   Ein Bild ist 1,4-mal so hoch wie der Chip lang ist; der Chip liegt in der Mitte. Darum füllt .chip-film
   140 % der Höhe seines Ankers (.chip-anker ist so hoch, wie der Chip lang ist).

   Startseite:  .held__chip  schwebt im Einstieg und dreht sich leicht zum Zeiger (echte Nachbarbilder, weich überblendet)
                .blick__chip  „Was ist SKITAG?“: dreht sich langsam hin und her; bz.punkte sagt seite.js, wohin die Linien zeigen
   Chip-Seite:  .knopf__chip  „Probiere den Tag aus“: fast von vorn, der echte Knopf (.chip-knopf) liegt genau über dem
                gerenderten, dazu die LED als Licht. Ring, Zustände und Gruppe zeichnet seite.js wie bisher (ohne WebGL-Zweig).
   Bei „weniger Bewegung“ steht jedes Bild still. Ohne JavaScript bleibt das Standbild (.chip-bild). */
(function () {
  "use strict";
  var wurzel = document.documentElement;
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var handy = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 700;
  var ORDNER = "assets/media/chip/", V = "?v=1", N = 30, G0 = -0.72, GS = 0.04;
  var klemme = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var url = function (i) { return ORDNER + (i < 10 ? "0" : "") + i + ".webp" + V; };
  var bildNr = function (gier) { return klemme((gier - G0) / GS, 0, N - 1); };
  var S = (window.skitagChip = window.skitagChip || {});
  if (!S.blick) S.blick = { schritt: 0, halten: 0, spielt: false };

  var held = document.querySelector(".held__chip"), blick = document.querySelector(".blick__chip");
  var knopf = document.querySelector(".knopf__chip");
  wurzel.classList.remove("chip3d-warte");
  if (!held && !blick && !knopf) return;

  /* Vorrat: jedes Bild wird einmal geladen und dekodiert; gezeigt werden nur fertige Bilder (sonst zeichnet der
     Browser für ein fehlendes Bild einen Rahmen, und das Dekodieren beim Drehen kostet jedes Mal Zeit) */
  var vorrat = [], fertig = [];
  var holen = function (i) {
    if (vorrat[i]) return vorrat[i];
    var im = new Image(); im.decoding = "async"; vorrat[i] = im;
    im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(function () { fertig[i] = true; }); };
    im.src = url(i); return im;
  };
  var naechstes = function (i) {   // das nächste fertige Bild zu i
    for (var d = 0; d < N; d++) { if (fertig[i - d]) return i - d; if (fertig[i + d]) return i + d; }
    return -1;
  };

  /* Ein Film in einem Anker: zwei Bilder übereinander; das obere blendet zum Nachbarbild über. Geändert wird nur,
     wenn sich das Bild oder die Überblendung (in Schritten von 1/16) wirklich ändert. */
  var Film = function (anker, nr) {
    var box = document.createElement("div"), a = new Image(), b = new Image();
    box.className = "chip-film"; box.setAttribute("aria-hidden", "true");
    a.className = b.className = "chip-film__bild"; a.alt = b.alt = ""; a.decoding = b.decoding = "async";
    var start = Math.round(nr); holen(start);
    a.src = url(start); b.style.opacity = "0"; b.style.visibility = "hidden";
    box.appendChild(a); box.appendChild(b); anker.insertBefore(box, anker.firstChild); anker.classList.add("hat-film");
    var ia = start, ib = -1, wb = -1;
    var f = { box: box, nr: nr, gezeigt: start, ladung: new Promise(function (ok) { if (a.complete && a.naturalWidth) ok(); else { a.onload = ok; a.onerror = ok; } }) };
    f.ladung.then(function () { fertig[start] = true; });
    f.setzen = function (wert) {
      wert = klemme(wert, 0, N - 1); f.nr = wert;
      var i = Math.floor(wert), w = Math.round((wert - i) * 16) / 16, j = Math.min(N - 1, i + 1);
      holen(i); holen(j);
      if (!fertig[i] || !fertig[j]) { var k = naechstes(Math.round(wert)); if (k < 0) return; i = j = k; w = 0; }
      if (i !== ia) { a.src = url(i); ia = i; }
      if (w > 0 && j !== ib) { b.src = url(j); ib = j; }
      if (w !== wb) { wb = w; b.style.opacity = String(w); b.style.visibility = w > 0 ? "visible" : "hidden"; }
      f.gezeigt = w > 0 ? i + w : i;
    };
    return f;
  };


  var daten = null;
  var punkte = fetch(ORDNER + "punkte.json" + V).then(function (r) { return r.json(); }).then(function (d) { daten = d; return d; }).catch(function () { return null; });
  // Punkt eines Bildes (zwischen zwei Bildern gemischt) in Anteilen des Bildes
  var ort = function (nr, name) {
    var n = daten.bilder.length, i = Math.min(n - 1, Math.floor(nr)), j = Math.min(n - 1, i + 1), w = Math.max(0, nr - i), p = daten.bilder[i][name], q = daten.bilder[j][name];
    return [p[0] + (q[0] - p[0]) * w, p[1] + (q[1] - p[1]) * w];
  };

  var bereit = [];
  var zeit0 = performance.now();

  /* ------------------------------------------------ Einstieg: schwebt, folgt dem Zeiger -- */
  // Feedback 131: ein festes Bild, das per CSS schwebt (läuft ganz auf der Grafikkarte). Der Zeiger setzt nur zwei
  // CSS-Werte für eine leichte Neigung; kein Bildwechsel, keine Schleife.
  if (held) {
    var hf = Film(held, bildNr(-0.55));
    hf.box.classList.add("chip-film--held", "chip-film--css");
    bereit.push(hf.ladung.then(function () { requestAnimationFrame(function () { hf.box.classList.add("ist-da"); }); }));
    if (!ruhig && !handy) {
      var zx = 0, zy = 0, wartet = false;
      window.addEventListener("pointermove", function (e) {
        zx = e.clientX / window.innerWidth - 0.5; zy = e.clientY / window.innerHeight - 0.5;
        if (wartet) return; wartet = true;
        requestAnimationFrame(function () { wartet = false; held.style.setProperty("--zx", zx.toFixed(3)); held.style.setProperty("--zy", zy.toFixed(3)); });
      }, { passive: true });
    }
  }

  /* ------------------------------------------------ „Was ist SKITAG?“: langsame Drehung -- */
  if (blick) {
    var bf = Film(blick, bildNr(-0.32));
    // Feedback 131: keine Drehung aus Einzelbildern mehr (sah ruckelig aus); ein festes Bild, das per CSS schwebt.
    // Die Linien folgen trotzdem genau, weil bz.punkte beim Lesen aus der aktuellen Lage gerechnet wird.
    bf.box.classList.add("chip-film--schau", "chip-film--schwebt");
    var bz = S.blick, blickSicht = false, gesehen = false;
    // bz.punkte wird erst beim Lesen ausgerechnet (seite.js zieht damit die Linien): so passen sie auch beim Scrollen genau
    var punkteAn = false;
    Object.defineProperty(bz, "punkte", { configurable: true, get: function () {
      if (!punkteAn || !daten) return null;
      var r = bf.box.getBoundingClientRect();
      return ["led", "knopf", "rand", "seite"].map(function (n) { var p = ort(bf.gezeigt, n); return { x: r.left + p[0] * r.width, y: r.top + p[1] * r.height }; });
    }, set: function () {} });
    new IntersectionObserver(function (e) {
      blickSicht = e[0].isIntersecting;
      if (blickSicht && !gesehen) { gesehen = true; bf.box.classList.add("ist-da"); }
      punkteAn = blickSicht;
    }, { rootMargin: "60% 0px" }).observe(blick);
  }

  /* ------------------------------------------------ Chip-Seite: echter Knopf über dem Bild -- */
  if (knopf) {
    var NR = bildNr(-0.08), kf = Film(knopf, NR);
    kf.box.classList.add("chip-film--knopf", "ist-da");
    var led = document.createElement("i"); led.className = "chip-film__led"; kf.box.appendChild(led);
    var echt = knopf.querySelector(".chip-knopf");
    // Fokusrahmen nur bei Bedienung mit der Tastatur (seite.js fokussiert den Knopf auch beim Klicken)
    window.addEventListener("keydown", function () { wurzel.classList.add("mit-tastatur"); }, true);
    window.addEventListener("pointerdown", function () { wurzel.classList.remove("mit-tastatur"); }, true);

    /* Gruppe rufen (kurz drücken): drei Funkwellen laufen vom Chip über das Bild, dann tauchen die Chips von drei
       Freunden auf (echte Renderbilder in anderer Drehung), jeder vibriert und blinkt grün, sobald ihn die Welle
       erreicht; darunter nur der Vorname. Abgespielt per CSS, sobald data-zustand="gruppe" gesetzt ist. */
    var flaeche = knopf.parentNode, gruppe = document.createElement("div");
    gruppe.className = "kg"; gruppe.setAttribute("aria-hidden", "true");
    var html = '<i class="kg__welle"></i><i class="kg__welle"></i><i class="kg__welle"></i>';
    [["Anna", 4, 17, 21, 0], ["Tom", 24, 84, 27, 1], ["Lea", 11, 19, 79, 2]].forEach(function (f) {
      html += '<div class="kg__freund" style="--x:' + f[2] + '%;--y:' + f[3] + '%;--i:' + f[4] + '"><div class="kg__chip"><div class="kg__bild"><img src="' + url(f[1]) + '" alt="" decoding="async" loading="lazy"><i class="kg__led" data-nr="' + f[1] + '"></i></div></div><span>' + f[0] + '</span></div>';
    });
    gruppe.innerHTML = html;
    flaeche.insertBefore(gruppe, knopf);
    punkte.then(function (d) {
      if (!d) return;
      var b = d.bilder[Math.round(NR)], k = b.knopf, rand = b.knopfRand;
      led.style.left = (b.led[0] * 100).toFixed(2) + "%"; led.style.top = (b.led[1] * 100).toFixed(2) + "%";
      gruppe.querySelectorAll(".kg__led").forEach(function (l) { var q = d.bilder[+l.getAttribute("data-nr")].led; l.style.left = (q[0] * 100).toFixed(2) + "%"; l.style.top = (q[1] * 100).toFixed(2) + "%"; });
      // Ring und Ziffer liegen genau auf dem gerenderten Gummiring und Knopf (Punkte aus Blender, Bild = 1000 × 1000)
      var NSV = "http://www.w3.org/2000/svg", svg = document.createElementNS(NSV, "svg");
      svg.setAttribute("class", "chip-film__ring"); svg.setAttribute("viewBox", "0 0 1000 1000");
      // der Füllring liegt mitten auf dem orangen Gummiring (die Punkte aus Blender liegen knapp außen, daher 0,86)
      var weg = "M" + b.ring.map(function (q) { return ((k[0] + (q[0] - k[0]) * 0.86) * 1000).toFixed(1) + " " + ((k[1] + (q[1] - k[1]) * 0.86) * 1000).toFixed(1); }).join(" L") + " Z";
      var spur = document.createElementNS(NSV, "path"), fuell = document.createElementNS(NSV, "path"), ziffer = document.createElementNS(NSV, "text");
      spur.setAttribute("d", weg); spur.setAttribute("class", "chip-film__spur");
      fuell.setAttribute("d", weg); fuell.setAttribute("class", "chip-film__fuell"); fuell.setAttribute("pathLength", "1");
      var xs0 = rand.map(function (q) { return q[0]; }), knopfB = (Math.max.apply(null, xs0) - Math.min.apply(null, xs0)) * 1000;
      ziffer.setAttribute("x", (k[0] * 1000).toFixed(1)); ziffer.setAttribute("y", (k[1] * 1000).toFixed(1));
      ziffer.setAttribute("class", "chip-film__ziffer"); ziffer.setAttribute("font-size", (knopfB * 0.42).toFixed(0));
      svg.appendChild(spur); svg.appendChild(fuell); svg.appendChild(ziffer); kf.box.appendChild(svg);
      // Ring und Ziffer folgen dem Zustand aus seite.js (chip.ring 0 bis 1, chip.sek); geschrieben wird nur bei Änderung
      var abschnittEl = document.getElementById("der-chip"), sicht = false, alt = "", altZ = "";
      var ringBild = function () {
        if (!sicht) return;
        var r = Math.max(0, Math.min(1, S.ring || 0)), z = S.zustand === "halten" || S.zustand === "frist" ? String(S.sek || "") : "";
        var w = (1 - r).toFixed(3);
        if (w !== alt) { alt = w; fuell.style.strokeDashoffset = w; }
        if (z !== altZ) { altZ = z; ziffer.textContent = z === "0" ? "" : z; ziffer.classList.remove("ist-neu"); void ziffer.getBoundingClientRect(); ziffer.classList.add("ist-neu"); }
        requestAnimationFrame(ringBild);
      };
      if (abschnittEl) new IntersectionObserver(function (e) { sicht = e[0].isIntersecting; if (sicht) requestAnimationFrame(ringBild); }).observe(abschnittEl);
      if (!echt) return;
      // Anteile des Bildes in Anteile des Ankers: das Bild ist 1,4 × so hoch wie der Anker und quadratisch
      var setzen = function () {
        var ar = knopf.getBoundingClientRect(); if (!ar.height) return;
        var seite = ar.height * 1.4, xs = rand.map(function (p) { return p[0]; });
        var breite = (Math.max.apply(null, xs) - Math.min.apply(null, xs)) * seite;
        echt.style.left = (50 + (k[0] - 0.5) * seite / ar.width * 100).toFixed(2) + "%";
        echt.style.top = (50 + (k[1] - 0.5) * 140).toFixed(2) + "%";
        echt.style.width = (breite / ar.width * 100).toFixed(2) + "%";
      };
      setzen(); window.addEventListener("resize", setzen);
    });
  }

  Promise.all(bereit).then(function () {
    window.dispatchEvent(new Event("skitag-chip-bereit"));
  });
})();
