/* Schneeflocken als Muster hinter „Schreib uns.“ (Runde 160, ersetzt das Punktraster aus Quadraten). Ein versetztes Raster aus
   feinen sechsarmigen Flocken in drei Formen und leicht verschiedenen Größen und Drehungen, hinter dem Text frei
   (weiche Ellipse in der Mitte). Beim Hineinscrollen erscheinen die Flocken von außen nach innen, mit der Maus drehen sich
   die Flocken um den Zeiger ein Stück und werden dunkler. Bei „weniger Bewegung“ steht alles fertig und still da.
   Aufbau: <section class="flockenmuster"><canvas class="flockenmuster__flaeche"></canvas>…</section> */
(function () {
  "use strict";
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var zeiger = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var glatt = function (a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  // fester Zufall, damit das Muster bei jedem Laden gleich aussieht
  var zufall = function (i, j, k) { var x = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return x - Math.floor(x); };

  // Eine Flocke mit Radius r um (0, 0): sechs Arme, je nach Form mit Seitenästen, Spitzen oder kleinem Sechseck
  var flocke = function (ctx, r, form) {
    ctx.beginPath();
    for (var a = 0; a < 6; a++) {
      var w = a * Math.PI / 3, c = Math.cos(w), s = Math.sin(w);
      var pt = function (l, q) { return [c * l - s * q, s * l + c * q]; };
      var m = function (l, q) { var p = pt(l, q); ctx.moveTo(p[0], p[1]); }, z = function (l, q) { var p = pt(l, q); ctx.lineTo(p[0], p[1]); };
      m(form === 2 ? r * 0.28 : 0, 0); z(r, 0);
      if (form === 0) { m(r * 0.5, 0); z(r * 0.74, r * 0.22); m(r * 0.5, 0); z(r * 0.74, -r * 0.22); }
      if (form === 1) { m(r * 0.38, 0); z(r * 0.56, r * 0.2); m(r * 0.38, 0); z(r * 0.56, -r * 0.2); m(r * 0.68, 0); z(r * 0.84, r * 0.14); m(r * 0.68, 0); z(r * 0.84, -r * 0.14); }
      if (form === 2) { var p = pt(r * 0.28, 0), q = pt(r * 0.28 * 0.5, r * 0.28 * 0.866); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); m(r * 0.62, 0); z(r * 0.8, r * 0.16); m(r * 0.62, 0); z(r * 0.8, -r * 0.16); }
    }
    ctx.stroke();
  };

  document.querySelectorAll(".flockenmuster").forEach(function (akt) {
    var lw = akt.querySelector(".flockenmuster__flaeche");
    if (!lw || !lw.getContext) return;
    var ctx = lw.getContext("2d");
    var W = 0, H = 0, dpr = 1, flocken = [];
    var auf = { p: ruhig ? 1 : 0 }, maus = { x: -9999, y: -9999, s: 0 }, sichtbar = false, laeuft = false, t0 = 0;

    var bauen = function () {
      var r = akt.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; lw.width = Math.round(W * dpr); lw.height = Math.round(H * dpr);
      var handy = W < 600, a = handy ? 46 : 64, dy = a * 0.866;
      var fx = 0.5, fy = 0.44, rx = handy ? 0.56 : 0.34, ry = handy ? 0.4 : 0.46;   // freie Ellipse hinter dem Text
      flocken = [];
      for (var j = -1, y = -a * 0.5; y < H + a; y += dy, j++) {
        for (var i = -1, x = (j % 2 ? a * 0.5 : 0) - a * 0.5; x < W + a; x += a, i++) {
          var ex = (x / W - fx) / rx, ey = (y / H - fy) / ry, e = Math.sqrt(ex * ex + ey * ey);
          var sicht = glatt(0.85, 1.35, e);
          if (sicht < 0.04) continue;
          var gr = (handy ? 7 : 9) * (0.75 + zufall(i, j, 1) * 0.6) * (0.7 + 0.3 * sicht);
          flocken.push({ x: x + (zufall(i, j, 2) - 0.5) * a * 0.3, y: y + (zufall(i, j, 3) - 0.5) * a * 0.3, r: gr, form: Math.floor(zufall(i, j, 4) * 3),
            w: zufall(i, j, 5) * Math.PI / 3, sicht: sicht, ab: 1 - Math.min(1, e / 2.2), dreh: 0 });
        }
      }
      malen();
    };

    var malen = function () {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      flocken.forEach(function (f) {
        // Auftritt: von außen nach innen (f.ab ist innen groß)
        var an = ruhig ? 1 : glatt(f.ab * 0.75, f.ab * 0.75 + 0.25, auf.p);
        if (an <= 0) return;
        var d = Math.hypot(f.x - maus.x, f.y - maus.y), naeh = maus.s * (1 - glatt(30, 170, d));
        f.dreh += (naeh * 0.9 - f.dreh) * 0.12;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.w + f.dreh); var sk = 0.6 + 0.4 * an + naeh * 0.18; ctx.scale(sk, sk);
        ctx.lineWidth = 1.25 / sk;
        var rand = glatt(0, 60, f.y) * glatt(0, 60, H - f.y);   // oben und unten weich auslaufen, keine halben Flocken am Rand
        var alpha = ((0.16 + 0.34 * f.sicht) * an + naeh * 0.35) * rand;
        ctx.strokeStyle = naeh > 0.05 ? "rgba(42, 74, 143, " + Math.min(0.9, alpha) + ")" : "rgba(122, 140, 170, " + alpha + ")";
        flocke(ctx, f.r, f.form);
        ctx.restore();
      });
    };

    var schritt = function (t) {
      if (!t0) t0 = t;
      if (auf.p < 1) auf.p = Math.min(1, (t - t0) / 1600);
      malen();
      var ruhe = auf.p >= 1 && flocken.every(function (f) { return Math.abs(f.dreh - (maus.s * (1 - glatt(30, 170, Math.hypot(f.x - maus.x, f.y - maus.y))) * 0.9)) < 0.004; });
      if (sichtbar && !ruhe) requestAnimationFrame(schritt); else laeuft = false;
    };
    var los = function () { if (!laeuft && !ruhig) { laeuft = true; requestAnimationFrame(schritt); } };

    bauen();
    var groesse = 0;
    window.addEventListener("resize", function () { clearTimeout(groesse); groesse = setTimeout(bauen, 150); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { e.forEach(function (x) { sichtbar = x.isIntersecting; if (sichtbar) los(); }); }, { threshold: 0.15 }).observe(akt);
    } else { auf.p = 1; malen(); }
    if (zeiger && !ruhig) {
      akt.addEventListener("pointermove", function (e) { var r = akt.getBoundingClientRect(); maus.x = e.clientX - r.left; maus.y = e.clientY - r.top; maus.s = 1; los(); });
      akt.addEventListener("pointerleave", function () { maus.s = 0; los(); });
    }
  });
})();
