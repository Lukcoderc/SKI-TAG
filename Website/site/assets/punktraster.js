/* Punktraster aus kleinen Quadraten (Feedback 156, Form seit Feedback 158): statt einer Bergkette bilden die Quadrate
   Funkwellen, die unten in der Mitte entstehen und nach außen leiser werden, so wie der Chip sein Signal zur
   Liftstation schickt. Hinter dem Text bleibt das Raster leise. Beim Hineinscrollen bauen sich die Wellen von innen nach
   außen auf, danach läuft alle paar Sekunden ein heller Puls nach außen, und mit der Maus leuchten die Quadrate um den
   Zeiger orange auf. Bei weniger Bewegung steht es fertig und still da.
   Aufbau: <section class="punktraster" data-ton="hell|dunkel"><canvas class="punktraster__flaeche"></canvas>…</section>
   Wahlweise data-quelle="x y" (Ursprung der Wellen, Anteile der Fläche, Standard 0.5 1.04) und
   data-frei="x y rx ry" (Ellipse, in der das Raster leise bleibt, Standard 0.5 0.45 0.3 0.38),
   am Handy (unter 600 px) data-quelle-handy und data-frei-handy, wenn angegeben. */
(function () {
  "use strict";
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var zeiger = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var glatt = function (a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };

  document.querySelectorAll(".punktraster").forEach(function (akt) {
    var lw = akt.querySelector(".punktraster__flaeche");
    if (!lw || !lw.getContext) return;
    var ctx = lw.getContext("2d"), dunkel = akt.getAttribute("data-ton") === "dunkel";
    var zahlen = function (name, std) { var v = (akt.getAttribute(name) || "").trim().split(/\s+/).map(Number); return v.length === std.length && v.every(isFinite) ? v : std; };
    var farbe = dunkel ? "255, 255, 255" : "14, 29, 64";
    var W = 0, H = 0, dpr = 1, punkte = [], rMax = 1, welle = 70;
    var zeit = { p: ruhig ? 1 : 0 }, maus = { x: -9999, y: -9999, s: 0 }, sichtbar = false, laeuft = false, t0 = 0;

    var bauen = function () {
      var r = akt.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; lw.width = Math.round(W * dpr); lw.height = Math.round(H * dpr);
      var handy = W < 600 && akt.hasAttribute("data-quelle-handy") ? "-handy" : "";   // am Handy eigene Werte, wenn angegeben
      var q = zahlen("data-quelle" + handy, [0.5, 1.04]), fr = zahlen("data-frei" + handy, [0.5, 0.45, W < 600 ? 0.46 : 0.3, 0.38]);
      var a = W < 600 ? 11 : 14, cx = W * q[0], cy = H * q[1];
      welle = W < 600 ? 66 : 100; rMax = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy)) * 1.02; punkte = [];
      if (akt.getAttribute("data-form") === "flocken") { flockenBauen(a, cx, cy, fr); return; }
      for (var y = a / 2; y < H; y += a) for (var x = a / 2; x < W; x += a) {
        var d = Math.hypot(x - cx, y - cy);
        var band = Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * d / welle), 4);
        // Text in der Mitte frei halten: in einer Ellipse um den Text nur ein Hauch
        var e = Math.hypot((x - W * fr[0]) / (W * fr[2]), (y - H * fr[1]) / (H * fr[3]));
        var frei = 0.12 + 0.88 * glatt(0.75, 1.3, e);
        var weit = Math.max(0, 1 - d / rMax);
        var a0 = (0.025 + 0.75 * band) * (0.5 + 0.5 * weit) * frei;
        if (a0 < 0.015) continue;
        punkte.push({ x: x, y: y, d: d, a: a0, b: band * frei, o: band > 0.8 && frei > 0.8 && Math.random() < 0.035 });
      }
    };

    // Runde 161 (data-form="flocken"): dieselben Quadrate, aber zu Schneeflocken angeordnet. Jede Flocke hat sechs Arme
    // mit je zwei Seitenästen, gerastert auf das Punktraster; dazwischen bleibt nur ein Hauch vom Raster. Fester Zufall,
    // damit das Muster bei jedem Laden gleich aussieht. Hinter dem Text (Ellipse data-frei) stehen keine Flocken.
    var zufall = function (i, j, k) { var v = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return v - Math.floor(v); };
    var flockenBauen = function (a, cx, cy, fr) {
      var nx = Math.ceil(W / a), ny = Math.ceil(H / a), flocken = [], d0 = a * 0.92;
      var setzen = function (x, y, w) { if (x < -a || y < -a || x > W + a || y > H + a) return; punkte.push({ x: x, y: y, d: Math.hypot(x - cx, y - cy), a: 0.3 + 0.6 * w, b: w, g: 1.2, o: w > 0.9 && zufall(Math.round(x), Math.round(y), 7) < 0.05 }); };
      var schritt = W < 600 ? 12 : 21;
      for (var gj = 0; gj * schritt < ny + schritt; gj++) for (var gi = 0; gi * schritt < nx + schritt; gi++) {
        var mx = ((gi + (gj % 2 ? 0.5 : 0)) * schritt + (zufall(gi, gj, 1) - 0.5) * schritt * 0.5) * a;
        var my = (gj * schritt * 0.92 + (zufall(gi, gj, 2) - 0.5) * schritt * 0.4) * a;
        var e = Math.hypot((mx - W * fr[0]) / (W * fr[2]), (my - H * fr[1]) / (H * fr[3]));
        var R = Math.round((W < 600 ? 3 : 5) + zufall(gi, gj, 3) * (W < 600 ? 2 : 3));
        if (e < 1.02 + (W < 600 ? 1 : 0.55) * (R + 1) * d0 / Math.min(W * fr[2], H * fr[3])) continue;   // die ganze Flocke bleibt außerhalb der Ellipse
        var dreh = zufall(gi, gj, 4) * Math.PI / 3, w0 = 0.55 + 0.45 * Math.min(1, (e - 1.08) / 0.5);
        flocken.push({ x: mx, y: my, r: (R + 1) * d0 });
        setzen(mx, my, w0);
        for (var arm = 0; arm < 6; arm++) {
          var wa = dreh + arm * Math.PI / 3, ca = Math.cos(wa), sa = Math.sin(wa);
          for (var t = 1; t <= R; t++) setzen(mx + ca * t * d0, my + sa * t * d0, w0 * (1 - 0.3 * t / R));
          var ab = Math.round(R * 0.55), l = Math.max(1, Math.round(R * 0.4));
          for (var sg = -1; sg <= 1; sg += 2) {
            var wb = wa + sg * Math.PI / 3, cb = Math.cos(wb), sb = Math.sin(wb);
            for (var u = 1; u <= l; u++) setzen(mx + (ca * ab + cb * u) * d0, my + (sa * ab + sb * u) * d0, w0 * 0.8);
          }
        }
      }
      // ein Hauch vom alten Raster dazwischen, aber nicht in den Flocken
      for (var iy = 0; iy < ny; iy++) for (var ix = 0; ix < nx; ix++) {
        if (zufall(ix, iy, 9) < 0.6) continue;
        var x = ix * a + a / 2, y = iy * a + a / 2, frei = true;
        for (var k = 0; k < flocken.length && frei; k++) if (Math.hypot(x - flocken[k].x, y - flocken[k].y) < flocken[k].r) frei = false;
        if (frei) punkte.push({ x: x, y: y, d: Math.hypot(x - cx, y - cy), a: 0.035, b: 0, g: 1, o: false });
      }
    };

    var malen = function (jetzt) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var p = zeit.p, gr = W < 600 ? 2.4 : 3;
      // Puls: alle 4,2 s läuft eine helle Welle von unten nach außen
      var pr = ruhig || !jetzt ? -999 : ((jetzt - t0) % 4200) / 4200 * rMax * 1.15;
      for (var i = 0; i < punkte.length; i++) {
        var q = punkte[i], auf = Math.max(0, Math.min(1, (p * 1.3 - q.d / rMax) / 0.16));
        if (auf <= 0) continue;
        var puls = Math.exp(-Math.pow((q.d - pr) / 34, 2)) * q.b;
        var nah = maus.s ? Math.max(0, 1 - Math.hypot(q.x - maus.x, q.y - maus.y) / 130) : 0;
        var s = gr * (q.g || 1) * (0.4 + 0.6 * auf) * (1 + nah * 0.9 + puls * 0.35);
        var orange = (q.o ? 0.8 : 0) + nah + puls * 0.25;
        ctx.fillStyle = orange > 0.25
          ? "rgba(255, 90, 28," + Math.min(1, orange) * auf + ")"
          : "rgba(" + farbe + "," + Math.min(1, q.a + puls * 0.4 + nah * 0.3) * auf + ")";
        ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
      }
    };

    var schleife = function (jetzt) {
      if (!sichtbar || ruhig) { laeuft = false; return; }
      malen(jetzt); requestAnimationFrame(schleife);
    };
    var starten = function () {
      if (ruhig) { malen(0); return; }
      if (!laeuft && sichtbar) { laeuft = true; requestAnimationFrame(schleife); }
    };

    bauen(); malen(0);
    new IntersectionObserver(function (e) {
      sichtbar = e[0].isIntersecting;
      if (sichtbar && !ruhig && zeit.p === 0) {
        t0 = performance.now() + 1200;   // der erste Puls kommt, wenn die Wellen stehen
        if (window.gsap) window.gsap.to(zeit, { p: 1, duration: 2.2, ease: "power2.out" });
        else zeit.p = 1;
      }
      starten();
    }, { threshold: 0.1 }).observe(akt);

    var ow = akt.offsetWidth, oh = akt.offsetHeight;
    window.addEventListener("resize", function () {
      if (Math.abs(akt.offsetWidth - ow) < 2 && Math.abs(akt.offsetHeight - oh) < 2) return;
      ow = akt.offsetWidth; oh = akt.offsetHeight; bauen(); malen(0);
    });
    if (!ruhig && zeiger) {
      akt.addEventListener("pointermove", function (e) { var r = akt.getBoundingClientRect(); maus.x = e.clientX - r.left; maus.y = e.clientY - r.top; maus.s = 1; });
      akt.addEventListener("pointerleave", function () { maus.s = 0; });
    }
  });
})();
