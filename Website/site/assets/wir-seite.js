/* SkiTag · Das sind wir (Feedback 106/109/152), nur auf wir.html.
   Klick auf die Adresse kopiert sie in die Zwischenablage, die Zeile darunter sagt kurz „Adresse kopiert“.
   Kopiert wird zuerst über eine versteckte Textfläche (braucht keine Erlaubnis), sonst über die Zwischenablage
   des Browsers. Klappt beides nicht, wird die Adresse markiert und die Zeile sagt, wie man sie kopiert.
   Die Auswahl bei „E-Mail schreiben“ schließt sich bei Klick daneben, mit Escape und nach einer Wahl. */
(function () {
  "use strict";
  var mail = document.querySelector(".wk__mail");
  var tipp = document.querySelector(".wk__tipp");
  var tippText = tipp && tipp.querySelector(".wk__tipp-text");

  var perTextflaeche = function (text) {
    var t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", "");
    t.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(t);
    t.select(); t.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(t);
    return ok;
  };

  if (mail && tipp) {
    var grund = tippText.textContent, zurueck = 0;
    var zeige = function (text, klasse) {
      tippText.textContent = text;
      tipp.classList.toggle("ist-kopiert", klasse === "ok");
      clearTimeout(zurueck);
      zurueck = setTimeout(function () { tippText.textContent = grund; tipp.classList.remove("ist-kopiert"); }, 2600);
    };
    var markieren = function () {
      var r = document.createRange(); r.selectNodeContents(mail);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      zeige("Adresse markiert, mit Strg+C kopieren");
    };
    mail.setAttribute("title", "Adresse kopieren");
    mail.addEventListener("click", function (e) {
      e.preventDefault();
      var text = mail.getAttribute("data-mail");
      if (perTextflaeche(text)) { zeige("Adresse kopiert", "ok"); return; }
      if (navigator.clipboard && window.isSecureContext) {
        var fertig = false;
        navigator.clipboard.writeText(text).then(function () { fertig = true; zeige("Adresse kopiert", "ok"); }, function () { fertig = true; markieren(); });
        setTimeout(function () { if (!fertig) markieren(); }, 1200);
      } else {
        markieren();
      }
    });
  }

  var wahl = document.querySelector(".wk__schreiben");
  if (wahl) {
    document.addEventListener("click", function (e) { if (wahl.open && !wahl.contains(e.target)) wahl.open = false; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && wahl.open) { wahl.open = false; wahl.querySelector("summary").focus(); } });
    wahl.querySelectorAll(".wk__wahl a").forEach(function (a) { a.addEventListener("click", function () { wahl.open = false; }); });
  }
  /* Feedback 152: Klick (am Handy Antippen) auf eine Person zeigt ihre Adresse und kopiert sie gleich. Am PC zeigt
     schon das Drüberfahren die Adresse. Der Hinweis wird kurz zu „Kopiert“; geht Kopieren nicht, öffnet sich die Mail-App. */
  var leute = Array.prototype.slice.call(document.querySelectorAll(".wir2__person"));
  var zeigerFein = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var schliessen = function () { leute.forEach(function (x) { x.classList.remove("ist-auf"); }); };
  leute.forEach(function (li) {
    var knopf = li.querySelector(".wir2__mail");
    if (!knopf) return;
    var hinweis = knopf.querySelector(".wir2__mail-hinweis");
    var grundtext = zeigerFein ? "Klicken zum Kopieren" : "Tippen zum Kopieren";
    var zurueck = 0;
    hinweis.textContent = grundtext;
    var melden = function (text, ok) {
      hinweis.textContent = text;
      knopf.classList.toggle("ist-kopiert", !!ok);
      clearTimeout(zurueck);
      zurueck = setTimeout(function () {
        hinweis.textContent = grundtext; knopf.classList.remove("ist-kopiert");
        if (!zeigerFein) li.classList.remove("ist-auf");
      }, 2400);
    };
    var kopieren = function () {
      var text = knopf.getAttribute("data-mail");
      if (perTextflaeche(text)) { melden("Kopiert", true); return; }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { melden("Kopiert", true); }, function () { location.href = "mailto:" + text; });
      } else {
        location.href = "mailto:" + text;
      }
    };
    li.addEventListener("click", function (e) {
      e.stopPropagation();
      leute.forEach(function (x) { if (x !== li) x.classList.remove("ist-auf"); });
      li.classList.add("ist-auf");
      kopieren();
    });
  });
  document.addEventListener("click", schliessen);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") schliessen(); });
})();

/* Feedback 156 · „Schreib uns.“: Raster aus kleinen Quadraten (square-dot grid) auf einer Leinwand. Die Quadrate bilden
   unten eine Bergkette (am Grat kräftig, nach unten leiser), darüber wird das Raster nach oben und zur Mitte hin leiser, damit der Text frei steht. Beim
   Hineinscrollen baut es sich von unten in einer Welle auf (GSAP, sonst sofort), die Gipfel bekommen einzelne orange
   Punkte, und mit der Maus leuchten die Quadrate um den Zeiger orange auf. Bei weniger Bewegung steht es fertig da. */
(function () {
  "use strict";
  var akt = document.querySelector(".wk-raster"), lw = akt && akt.querySelector(".wk-raster__flaeche");
  if (!akt || !lw || !lw.getContext) return;
  var ctx = lw.getContext("2d"), ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = 1, punkte = [], zeit = { p: ruhig ? 1 : 0 }, maus = { x: -9999, y: -9999, s: 0 }, laeuft = false, sichtbar = false;
  var grat = function (x) {   // Höhe der Bergkette (0 oben, 1 unten) an der Stelle x (0..1)
    return 0.6 - 0.13 * Math.sin(x * 7.1 + 0.6) - 0.08 * Math.sin(x * 17.3 + 2.1) - 0.04 * Math.sin(x * 37 + 1.3)
      + 0.1 * Math.exp(-Math.pow((x - 0.5) / 0.16, 2));   // in der Mitte tiefer, dort steht der Text
  };
  var bauen = function () {
    var r = akt.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; lw.width = Math.round(W * dpr); lw.height = Math.round(H * dpr);
    var a = W < 600 ? 11 : 14; punkte = [];
    for (var y = a / 2; y < H; y += a) for (var x = a / 2; x < W; x += a) {
      var gx = x / W, gy = y / H, g = grat(gx), innen = gy > g;
      var leise = innen ? (0.62 - 0.5 * Math.min(1, (gy - g) / Math.max(0.2, 1 - g))) * (gy > 0.9 ? (1 - gy) * 10 : 1) : 0.07 * Math.max(0, 1 - Math.hypot(gx - 0.5, (gy - 1) * 0.9) * 1.1) * (gy > g - 0.06 ? 0.35 : 1);
      if (leise < 0.012) continue;
      var kante = innen && gy - g < 0.03, spitze = kante && g < 0.5 && Math.random() < 0.55;
      punkte.push({ x: x, y: y, a: leise + (kante ? 0.25 : 0), o: spitze, d: Math.hypot(gx - 0.5, 1 - gy) });
    }
  };
  var malen = function () {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var p = zeit.p, gr = W < 600 ? 2.4 : 3;
    for (var i = 0; i < punkte.length; i++) {
      var q = punkte[i], auf = Math.max(0, Math.min(1, (p * 1.35 - q.d) / 0.18));
      if (auf <= 0) continue;
      var nah = maus.s ? Math.max(0, 1 - Math.hypot(q.x - maus.x, q.y - maus.y) / 130) : 0;
      var s = gr * (0.4 + 0.6 * auf) * (1 + nah * 0.9);
      ctx.fillStyle = (q.o || nah > 0.25) ? "rgba(255, 90, 28," + Math.min(1, (q.o ? 0.75 : 0) + nah) * auf + ")" : "rgba(14, 29, 64," + (q.a + nah * 0.3) * auf + ")";
      ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
    }
  };
  var anstossen = function () { if (laeuft || !sichtbar) return; laeuft = true; requestAnimationFrame(function () { laeuft = false; malen(); }); };
  bauen(); malen();
  new IntersectionObserver(function (e) {
    sichtbar = e[0].isIntersecting; anstossen();
    if (sichtbar && !ruhig && zeit.p === 0) {
      if (window.gsap) window.gsap.to(zeit, { p: 1, duration: 2.2, ease: "power2.out", onUpdate: malen });
      else { zeit.p = 1; malen(); }
    }
  }, { threshold: 0.2 }).observe(akt);
  var ow = 0;
  window.addEventListener("resize", function () { if (Math.abs(akt.offsetWidth - ow) < 2 && Math.abs(akt.offsetHeight - H) < 2) return; ow = akt.offsetWidth; bauen(); malen(); });
  if (!ruhig && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    akt.addEventListener("pointermove", function (e) { var r = akt.getBoundingClientRect(); maus.x = e.clientX - r.left; maus.y = e.clientY - r.top; maus.s = 1; anstossen(); });
    akt.addEventListener("pointerleave", function () { maus.s = 0; anstossen(); });
  }
})();

/* Feedback 156: die drei Fotoplätze kommen beim Hineinscrollen nacheinander von unten, leicht gekippt, und der große
   Anfangsbuchstabe steigt darin auf (GSAP). Ohne GSAP oder bei weniger Bewegung stehen sie einfach da. */
(function () {
  "use strict";
  var leute = document.querySelector(".wir2__leute");
  if (!leute || !window.gsap || !window.ScrollTrigger || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);
  var bilder = leute.querySelectorAll(".wir2__portrait"), zeichen = leute.querySelectorAll(".wir2__initial");
  var r = leute.getBoundingClientRect(); if (r.top < innerHeight) return;   // schon im Bild: nichts verstecken
  gsap.set(bilder, { y: 80, rotate: function (i) { return [-4, 0, 4][i % 3]; }, opacity: 0, transformOrigin: "50% 100%" });
  gsap.set(zeichen, { yPercent: 40, opacity: 0 });
  ScrollTrigger.create({ trigger: leute, start: "top 80%", once: true, onEnter: function () {
    gsap.to(bilder, { y: 0, rotate: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.12, clearProps: "transform,opacity" });
    gsap.to(zeichen, { yPercent: 0, opacity: 1, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.2, clearProps: "transform,opacity" });
  } });
})();
