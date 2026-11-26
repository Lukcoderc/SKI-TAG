/* SkiTag · Seite „Am Skitag“ (seit Feedback 60), nur auf skitag.html geladen.
   Feedback 126: Der Tag läuft über die ganze Seite. Die Uhrzeit hängt am Scrollen (GSAP ScrollTrigger, weich
   nachgezogen): über der Überschrift ist es 07:30, an der ersten Station 08:10, an der letzten Mitternacht.
   Aus der Uhrzeit folgt alles andere:
   - .tagwelt (feste Ebene hinter der Seite): Himmelsfarben, Sonnenlicht im Bogen, Mond und Sterne, Bergfarben;
   - html.tagwelt-dunkel ab der Dämmerung (Uhr und Linie werden hell);
   - der Zeitstrahl: Linie füllt sich bis zur Leselinie (55 % der Fensterhöhe), der kleine Chip fährt mit,
     jede erreichte Station bekommt .ist-da und ihre Karte gleitet herein (GSAP);
   - die Uhr links zeigt die Zeit zwischen den Stationen in 5-Minuten-Schritten.
   Ohne GSAP folgt alles direkt dem Scrollen; ohne JavaScript stehen alle Stationen einfach da. */
(function () {
  "use strict";
  var tag = document.querySelector(".tag");
  if (!tag) return;
  var wurzel = document.documentElement;
  wurzel.classList.add("js-tag");

  var welt = document.querySelector(".tagwelt");
  var kopf = document.querySelector(".tag-kopf");
  var linie = tag.querySelector(".tag__linie");
  var zeitEl = tag.querySelector(".tag__zeit");
  var wasEl = tag.querySelector(".tag__was");
  var fuellung = tag.querySelector(".tag__fuellung"), chipEl = tag.querySelector(".tag__chip");
  var ohneBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gs = window.gsap && window.ScrollTrigger ? window.gsap : null;
  if (gs) { gs.registerPlugin(window.ScrollTrigger); wurzel.classList.add("js-tag-gsap"); }

  var halte = Array.prototype.map.call(tag.querySelectorAll(".tag__halt"), function (el) {
    var t = (el.getAttribute("data-zeit") || "0:0").split(":");
    var min = parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
    return { el: el, karte: el.querySelector(".tag__karte"), punkt: el.querySelector(".tag__punkt"), min: min === 0 ? 1440 : min, was: el.getAttribute("data-was") || "" };
  });

  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var zwei = function (n) { return (n < 10 ? "0" : "") + n; };

  /* ---------------------------------------------------- Himmel -- */
  // je Uhrzeit (Minuten): Himmel oben, Mitte, Horizont, hintere Kette, vordere Kette
  var FARBEN = [
    [450, "#a7b4d6", "#d7b3bd", "#f6d2b4", "#b9a9bf", "#5d5a7c"],    // 07:30 Morgendämmerung
    [570, "#6a9fd8", "#b0d0ee", "#e8f1f9", "#d3deec", "#6b819f"],    // 09:30
    [750, "#4a8ad6", "#9cc6ee", "#deecf8", "#d9e4f1", "#6f87a8"],    // 12:30 Mittag
    [930, "#5a8cc8", "#bccfe2", "#f2e3cc", "#dcd8dd", "#6e7690"],    // 15:30
    [1000, "#5f70a8", "#dea687", "#f7ca92", "#d6aa9b", "#5e4f68"],   // 16:40 goldenes Licht
    [1040, "#36447e", "#bb656d", "#f28d60", "#9e7087", "#3f3556"],   // 17:20 Sonnenuntergang
    [1090, "#141f45", "#2f3c70", "#6c5b88", "#3a3f6a", "#1d2244"],   // 18:10 Dämmerung
    [1440, "#050a19", "#0b1632", "#16244a", "#1c2a52", "#0e1d40"]    // Mitternacht
  ];
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); };
  var FARB_RGB = FARBEN.map(function (k) { return [k[0]].concat(k.slice(1).map(rgb)); });
  var mischen = function (a, b, t) { return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")"; };
  var NAMEN = ["--h1", "--h2", "--h3", "--b1", "--b2"];
  var letzterHimmel = -1, dunkel = null;
  var himmelSetzen = function (m) {
    var mr = Math.round(m * 2) / 2;
    if (mr === letzterHimmel || !welt) return;
    letzterHimmel = mr;
    var i = 0;
    while (i < FARB_RGB.length - 2 && m > FARB_RGB[i + 1][0]) i++;
    var a = FARB_RGB[i], b = FARB_RGB[i + 1], t = klemme((m - a[0]) / (b[0] - a[0]));
    t = t * t * (3 - 2 * t);
    for (var k = 0; k < NAMEN.length; k++) welt.style.setProperty(NAMEN[k], mischen(a[k + 1], b[k + 1], t));
    // Sonne im großen Bogen über das Fenster: 07:30 links unten, Mittag hoch oben, 17:30 rechts hinter den Bergen
    var s = klemme((m - 450) / (1050 - 450));
    welt.style.setProperty("--sx", (6 + s * 88).toFixed(2) + "%");
    welt.style.setProperty("--sy", (80 - Math.sin(Math.PI * s) * 64).toFixed(2) + "%");
    welt.style.setProperty("--sonne", (1 - klemme((m - 1030) / 40)).toFixed(3));
    welt.style.setProperty("--nacht", klemme((m - 1060) / 70).toFixed(3));
    // Feedback 131: goldenes Licht auf dem Panorama am Morgen (bis 09:30) und ab dem Nachmittag (15:30 bis 17:10 voll)
    welt.style.setProperty("--gold", Math.max(1 - klemme((m - 450) / 120), klemme((m - 930) / 100)).toFixed(3));
    var d = m >= 1055;
    if (d !== dunkel) { dunkel = d; wurzel.classList.toggle("tagwelt-dunkel", d); }
  };

  // Sterne: einmal gezeichnet (bei Größenänderung neu), sichtbar über --nacht
  var sterne = welt && welt.querySelector(".tagwelt__sterne");
  var sterneZeichnen = function () {
    if (!sterne) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
    sterne.width = w * dpr; sterne.height = h * dpr;
    var c = sterne.getContext("2d"); c.scale(dpr, dpr);
    var zufall = (function (s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(42);
    var n = Math.round(w * h / 5200);
    for (var i = 0; i < n; i++) {
      var y = Math.pow(zufall(), 1.6) * h * 0.75, x = zufall() * w, r = 0.35 + Math.pow(zufall(), 3) * 1.3;
      c.globalAlpha = 0.35 + zufall() * 0.65;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = zufall() < 0.15 ? "#ffe9c7" : "#ffffff"; c.fill();
    }
  };

  /* ------------------------------------------------ Zeitstrahl -- */
  var mass = null;
  var messen = function () {
    var r = linie.getBoundingClientRect();
    mass = {
      hoehe: r.height,
      anteile: halte.map(function (h) { var p = h.punkt.getBoundingClientRect(); return r.height > 0 ? (p.top + p.height / 2 - r.top) / r.height : 0; })
    };
  };

  /* ---------------------------------- Gondel und Skifahrer (Feedback 151) -- */
  /* Bis „Am Berg“ ist die Linie ein Gondelseil mit Stützen, und der Punkt ist eine Gondel, die am Seil fährt.
     Ab „Am Berg“ fährt ein Skifahrer weiter und zieht beim Scrollen seine Carving-Spur in den Schnee.
     Gezeichnet in ein SVG über der Linie (Größe in Pixeln, neu bei jeder Größenänderung). */
  var NS = "http://www.w3.org/2000/svg";
  var spurSvg = document.createElementNS(NS, "svg");
  spurSvg.setAttribute("class", "tag__spur"); spurSvg.setAttribute("aria-hidden", "true");
  spurSvg.innerHTML =
    '<g class="tag__seil"><path class="tag__seil-linie"/><g class="tag__stuetzen"></g></g>' +
    '<path class="tag__carve tag__carve--a"/><path class="tag__carve tag__carve--b"/>' +
    '<g class="tag__gondel"><path d="M0 -15 V-6" class="tag__gondel-buegel"/><circle cy="-15" r="2.6" class="tag__gondel-rolle"/>' +
      '<rect x="-12" y="-6" width="24" height="20" rx="5" class="tag__gondel-kabine"/><rect x="-8.5" y="-2.5" width="17" height="7" rx="2" class="tag__gondel-fenster"/></g>' +
    '<g class="tag__fahrer"><g class="tag__fahrer-dreh">' +
      '<path d="M-9 9 L9 5" class="tag__fahrer-ski"/><path d="M-1 -9 L1 0 L-3 7 M1 0 L5 6" class="tag__fahrer-koerper"/>' +
      '<path d="M-1 -6 L-7 -2 M0 -6 L7 -4" class="tag__fahrer-arme"/><circle cx="-1.5" cy="-12.5" r="3.2" class="tag__fahrer-kopf"/></g></g>';
  linie.parentNode.insertBefore(spurSvg, linie.nextSibling);
  wurzel.classList.add("js-spur");
  var spur = { seil: spurSvg.querySelector(".tag__seil-linie"), stuetzen: spurSvg.querySelector(".tag__stuetzen"),
    a: spurSvg.querySelector(".tag__carve--a"), b: spurSvg.querySelector(".tag__carve--b"),
    gondel: spurSvg.querySelector(".tag__gondel"), fahrer: spurSvg.querySelector(".tag__fahrer"), dreh: spurSvg.querySelector(".tag__fahrer-dreh") };
  var BERG = Math.max(0, halte.findIndex ? halte.findIndex(function (h) { return h.was === "Am Berg"; }) : 3);
  var kurve = null;   // Punkte der Carving-Linie
  var spurBauen = function () {
    var w = spurSvg.getBoundingClientRect().width, H = mass.hoehe, mitte = w / 2;
    spurSvg.setAttribute("viewBox", "0 0 " + w.toFixed(1) + " " + H.toFixed(1));
    var yB = (mass.anteile[BERG] || 0.5) * H;
    spur.seil.setAttribute("d", "M" + mitte + " 0 V" + yB.toFixed(1));
    var st = "";
    for (var y = 90; y < yB - 40; y += 240) st += '<path d="M' + (mitte - 7) + " " + y + " H" + (mitte + 7) + " M" + mitte + " " + y + " h0.01" + '"/>';
    spur.stuetzen.innerHTML = st;
    // Carving: weiche Bögen links und rechts der Mitte, eine Welle etwa alle 220 px
    var A = Math.min(w * 0.36, 26), L = 220, pts = [];
    for (var yy = yB; yy <= H + 0.5; yy += 4) {
      var t = (yy - yB) / L, ein = Math.min(1, (yy - yB) / 60);
      pts.push([mitte + A * ein * Math.sin(t * Math.PI * 2), yy]);
    }
    // Runde nach Feedback 152: die Spur wird nur bis zum Skifahrer als Pfad gebaut (statt einer ganzen Linie, die per
    // stroke-dasharray versteckt wird). Safari am iPhone zeigte mit dem Strich-Trick den Rest der Spur schon vorher.
    kurve = { pts: pts, yB: yB, bis: -1 };
    spur.a.setAttribute("d", ""); spur.b.setAttribute("d", "");
  };
  var spurBis = function (n) {
    if (n === kurve.bis) return;
    kurve.bis = n;
    var d = function (dx) { var t = ""; for (var i = 0; i < n; i++) t += (i ? "L" : "M") + (kurve.pts[i][0] + dx).toFixed(1) + " " + kurve.pts[i][1].toFixed(1); return t; };
    spur.a.setAttribute("d", n > 1 ? d(-2.2) : ""); spur.b.setAttribute("d", n > 1 ? d(2.2) : "");
  };
  var spurZeigen = function (f) {
    if (!kurve) spurBauen();
    var H = mass.hoehe, y = f * H, w = spurSvg.viewBox.baseVal ? spurSvg.viewBox.baseVal.width : 40, mitte = w / 2;
    var amBerg = y > kurve.yB;
    spur.gondel.style.opacity = amBerg ? 0 : 1;
    spur.fahrer.style.opacity = amBerg ? 1 : 0;
    if (!amBerg) {
      spur.gondel.setAttribute("transform", "translate(" + mitte.toFixed(1) + " " + y.toFixed(1) + ")");
      spurBis(0);
      return;
    }
    var i = Math.min(kurve.pts.length - 1, Math.max(0, Math.round((y - kurve.yB) / 4)));
    var p = kurve.pts[i], q = kurve.pts[Math.min(kurve.pts.length - 1, i + 1)], o = kurve.pts[Math.max(0, i - 1)];
    spurBis(i + 1);
    var neig = Math.atan2(q[0] - o[0], 8) * 180 / Math.PI;   // in die Kurve legen
    spur.fahrer.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
    spur.dreh.setAttribute("transform", "rotate(" + (-neig * 0.9).toFixed(1) + ") scale(1.5)");
  };

  var einblenden = function (h, da, sanft) {
    if (!gs || !h.karte) return;
    if (!sanft || ohneBewegung) { gs.set(h.karte, { opacity: da ? 1 : 0, y: da ? 0 : 30, filter: "blur(0px)" }); return; }
    if (da) gs.fromTo(h.karte, { opacity: 0, y: 40, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "expo.out", overwrite: true });
    else gs.to(h.karte, { opacity: 0, y: 24, filter: "blur(4px)", duration: 0.35, ease: "power2.in", overwrite: true });
  };

  var stand = { vor: 0, f: 0 }, letzteZeit = "", letztesWas = "", bereit = false;
  var zeigen = function () {
    if (!mass) messen();
    var f = stand.f;
    fuellung.style.transform = "scaleY(" + f.toFixed(4) + ")";
    chipEl.style.transform = "translate3d(0," + (f * mass.hoehe).toFixed(1) + "px,0)";
    spurZeigen(f);
    var a = mass.anteile, nr = -1;
    halte.forEach(function (h, i) {
      var da = a[i] <= f + 0.0001;
      if (da !== h.da) { h.da = da; h.el.classList.toggle("ist-da", da); einblenden(h, da, bereit); }
      if (da) nr = i;
    });
    var m;
    if (f <= 0) m = 450 + (halte[0].min - 450) * stand.vor;   // über der Überschrift: Morgendämmerung bis zur ersten Station
    else if (nr < 0) m = halte[0].min;
    else if (nr >= halte.length - 1) m = halte[halte.length - 1].min;
    else {
      // lange Lücken (Rückgabe bis Mitternacht): die Uhr bleibt erst nah an der Station und eilt dann weiter
      var luecke = halte[nr + 1].min - halte[nr].min, q = klemme((f - a[nr]) / Math.max(0.0001, a[nr + 1] - a[nr]));
      m = halte[nr].min + luecke * (luecke > 120 ? Math.pow(q, 2.6) : q);
    }
    var gerundet = Math.max(halte[0].min, Math.round(m / 5) * 5);
    var text = zwei(Math.floor(gerundet / 60) % 24) + ":" + zwei(gerundet % 60);
    if (text !== letzteZeit) { letzteZeit = text; zeitEl.textContent = text; }
    var was = halte[Math.max(0, nr)].was;
    if (was !== letztesWas) { letztesWas = was; wasEl.textContent = was; }
    himmelSetzen(m);
  };

  sterneZeichnen();
  window.addEventListener("resize", function () { messen(); kurve = null; sterneZeichnen(); zeigen(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { messen(); kurve = null; zeigen(); });

  if (gs) {
    // Karten, die noch nicht erreicht sind, warten unsichtbar
    halte.forEach(function (h) { if (h.karte) gs.set(h.karte, { opacity: 0, y: 30 }); });
    var glatt = ohneBewegung ? true : 0.8;
    gs.to(stand, { vor: 1, ease: "none", onUpdate: zeigen,
      scrollTrigger: { trigger: kopf || tag, start: "top top", end: "bottom 55%", scrub: glatt } });
    // Feedback 146: beginnt die Linie schon oberhalb von 55 % des Fensters (kurzer Kopf), startet der Fortschritt bei
    // Seitenanfang, damit der Punkt ganz oben auch ganz oben auf der Linie steht
    gs.to(stand, { f: 1, ease: "none", onUpdate: zeigen,
      scrollTrigger: { trigger: linie, start: function () { return Math.max(0, linie.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55); },
        end: "bottom 55%", scrub: glatt, onRefresh: function () { messen(); kurve = null; } } });
    // Feedback 127: am Ende sinkt das Gebirge der Tageswelt weich weg, während das Gebirge über dem Fuß hochkommt,
    // dazu wird der Himmel unten zum Dunkelblau des Fußes; so gibt es nie zwei Bergketten übereinander.
    var band = document.querySelector(".gebirge-band"), berge = welt && welt.querySelector(".tagwelt__berge");
    // Feedback 145: ganz oben wartet das Gebirge unter dem Bildrand (sonst liegt die Uhr auf dem Berg) und steigt
    // auf, während die Überschrift aus dem Bild scrollt. Eigene Größe --auf (CSS translate), damit es sich nicht mit dem
    // Absinken am Ende (transform) in die Quere kommt.
    // Feedback 146: die Berge sind ganz oben schon zu sehen, stehen aber knapp unter dem tiefsten Text im Bild (Uhr und
    // erste Station) und fahren beim Scrollen ganz hoch. Gemessen wird beim Laden und nach Größenänderungen.
    var auf = berge && berge.querySelector(".tagwelt__auf");
    if (auf && !ohneBewegung) {
      // das Panorama ist oben durchsichtig: der höchste Gipfel liegt bei 37,5 % der Bildhöhe (Bild 2400 × 686, cover, oben
      // angelegt); gerechnet wird mit dem Gipfel, nicht mit der unsichtbaren Bildkante
      var gipfel = function () { var r = berge.getBoundingClientRect(); return 0.375 * Math.max(r.height, r.width * 686 / 2400); };
      var startAuf = function () {
        var hb = berge.getBoundingClientRect().height, oben = window.innerHeight - hb + gipfel(), unten = 0;
        [tag.querySelector(".tag__uhr .tag__anzeige"), tag.querySelector(".tag__halt .tag__karte")].forEach(function (el) {
          if (el) unten = Math.max(unten, el.getBoundingClientRect().bottom + window.scrollY);
        });
        return hb > 0 ? klemme((unten + 18 - oben) / hb) : 0;
      };
      // Startwert als Funktion: ScrollTrigger rechnet ihn bei jedem refresh neu (nach dem Laden der Schrift, bei Größenänderung)
      // ganz ausgefahren stehen die Berge knapp unter der Uhr, die beim Scrollen stehen bleibt (sonst läge sie auf dem Berg)
      var endAuf = function () {
        var uhr = tag.querySelector(".tag__uhr"), anz = tag.querySelector(".tag__uhr .tag__anzeige");
        if (!uhr || !anz || window.innerWidth < 900) return 0;
        var hb = berge.getBoundingClientRect().height, oben = window.innerHeight - hb + gipfel();
        var uhrUnten = (parseFloat(getComputedStyle(uhr).top) || 0) + anz.getBoundingClientRect().height;
        return hb > 0 ? klemme((uhrUnten + 18 - oben) / hb) : 0;
      };
      gs.fromTo(auf, { "--auf": startAuf }, { "--auf": endAuf, ease: "none", immediateRender: true,
        scrollTrigger: { trigger: kopf || tag, start: "top top", end: function () { return Math.max(200, (kopf || tag).offsetHeight + window.innerHeight * 0.25); }, scrub: glatt, invalidateOnRefresh: true } });
      var neuRechnen = function () { window.ScrollTrigger.refresh(); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(neuRechnen);
      window.addEventListener("load", neuRechnen);
    }
    if (band && berge) {
      gs.fromTo(berge, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: 35, ease: "power1.in",
        scrollTrigger: { trigger: band, start: "top bottom", end: "top 45%", scrub: glatt } });
    }
    talfahrt();
    messen(); zeigen(); bereit = true;
    window.ScrollTrigger.refresh();
    return;
  }

  /* ------------------------------------- Talfahrt im Gebirge über dem Fuß (Runde nach Feedback 152) -- */
  /* Am Ende des Tages verlässt der Skifahrer den Zeitstrahl und fährt im Gebirge über dem Fuß von der Bergstation
     in Bögen den Hang hinunter bis ins Tal, wo er hinter dem vorderen Hügel mit den Tannen verschwindet. Er liegt in der
     mittleren Bergebene (SVG 1600 × 240), seine Spur wird bis zu ihm gezeichnet. Hängt am Scrollen über dem Band. */
  function talfahrt() {
    var band = document.querySelector(".gebirge-band"), ebene = band && band.querySelector(".gebirge__lage--mitte");
    if (!ebene || ohneBewegung) return;
    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "talfahrt");
    g.innerHTML = '<path class="talfahrt__spur"/><path class="talfahrt__spur"/>' +
      '<g class="tag__fahrer talfahrt__fahrer"><g class="tag__fahrer-dreh">' +
      '<path d="M-9 9 L9 5" class="tag__fahrer-ski"/><path d="M-1 -9 L1 0 L-3 7 M1 0 L5 6" class="tag__fahrer-koerper"/>' +
      '<path d="M-1 -6 L-7 -2 M0 -6 L7 -4" class="tag__fahrer-arme"/><circle cx="-1.5" cy="-12.5" r="3.2" class="tag__fahrer-kopf"/></g></g>';
    ebene.appendChild(g);
    var spuren = g.querySelectorAll(".talfahrt__spur"), fahrer = g.querySelector(".talfahrt__fahrer"), dreh = fahrer.firstChild;
    // von der Bergstation (880, 104) zum Tal unten links beim Lift, in weichen Bögen quer zum Hang
    var A = [884, 116], B = [686, 238], N = 160, pts = [];
    var dx = B[0] - A[0], dy = B[1] - A[1], lang = Math.hypot(dx, dy), qx = -dy / lang, qy = dx / lang;
    for (var i = 0; i < N; i++) {
      var t = i / (N - 1), e = t * t * (3 - 2 * t) * 0.35 + t * 0.65;
      var aus = Math.sin(t * Math.PI * 3.5) * 15 * Math.min(1, t * 6) * (1 - t * 0.35);
      pts.push([A[0] + dx * e + qx * aus, A[1] + dy * e + qy * aus]);
    }
    var bis = -1;
    var setzen = function (p) {
      var n = Math.max(1, Math.round(p * (N - 1)));
      wurzel.classList.toggle("talfahrt-an", p > 0.01);
      if (n !== bis) {
        bis = n;
        [-1.1, 1.1].forEach(function (v, k) {
          var d = "";
          for (var j = 0; j <= n && j < N; j++) d += (j ? "L" : "M") + (pts[j][0] + v).toFixed(1) + " " + (pts[j][1] + v * 0.4).toFixed(1);
          spuren[k].setAttribute("d", n > 1 ? d : "");
        });
      }
      var a = pts[Math.min(N - 1, n)], vor = pts[Math.min(N - 1, n + 2)], nach = pts[Math.max(0, n - 2)];
      var neig = Math.atan2(vor[0] - nach[0], Math.max(0.5, vor[1] - nach[1])) * 180 / Math.PI;
      fahrer.setAttribute("transform", "translate(" + a[0].toFixed(1) + " " + a[1].toFixed(1) + ")");
      dreh.setAttribute("transform", "rotate(" + (-neig * 0.5).toFixed(1) + ") scale(" + (0.62 + p * 0.25).toFixed(3) + ")");
      fahrer.style.opacity = p < 0.02 ? "0" : p > 0.97 ? "0" : "1";
    };
    setzen(0);
    var stand2 = { p: 0 };
    gs.to(stand2, { p: 1, ease: "none", onUpdate: function () { setzen(stand2.p); },
      scrollTrigger: { trigger: band, start: "top 85%", end: "bottom 70%", scrub: 0.8 } });
  }

  // ohne GSAP: direkt am Scrollen
  var direkt = function () {
    messen();
    var r = linie.getBoundingClientRect(), lese = innerHeight * 0.55;
    stand.f = r.height > 0 ? klemme((lese - r.top) / r.height) : 0;
    if (kopf) { var k = kopf.getBoundingClientRect(); stand.vor = klemme(-k.top / Math.max(1, k.height - lese)); }
    zeigen();
  };
  window.addEventListener("scroll", direkt, { passive: true });
  bereit = true; direkt();
})();

/* Feedback 156: Auftritt des Seitenkopfs mit GSAP. Die Überschrift steigt Zeile für Zeile aus einer Maske, die Marke,
   der Text und die drei Stationen folgen nacheinander. Ohne GSAP oder bei weniger Bewegung steht alles da. */
(function () {
  "use strict";
  var kopf = document.querySelector(".tag-kopf__kopf");
  if (!kopf || !window.gsap || !window.SplitText || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(SplitText);
  var h1 = kopf.querySelector("h1");
  var zeilen = SplitText.create(h1, { type: "lines", mask: "lines" }).lines;
  var tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
  tl.from(kopf.querySelector(".tag-kopf__marke"), { y: 16, opacity: 0, duration: 0.8 })
    .from(zeilen, { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.1)
    .from(kopf.querySelector(".kopfzeile__text"), { y: 20, opacity: 0, duration: 0.9 }, 0.45)
    .from(kopf.querySelectorAll(".tag-kopf__stationen li"), { y: 18, opacity: 0, scale: 0.94, duration: 0.8, stagger: 0.1 }, 0.6)
    .from(kopf.querySelector(".tag-kopf__weiter"), { opacity: 0, duration: 0.8 }, 1);
})();
