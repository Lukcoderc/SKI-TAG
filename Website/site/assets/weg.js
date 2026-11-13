/* SkiTag · Der Weg zur Hilfe (Feedback 99/100), nur auf chip.html.
   Eine gezeichnete Bergszene: links stürzt jemand mit SkiTag, rechts jemand mit dem Handy. Beide Abläufe laufen im
   gleichen Takt (etwa 1,6 s je Schritt) auf einer Zeitleiste. Beim Handy ruft die Rettung danach erst die Bergbahn
   an (Feedback 101); zeichne(t) setzt für jeden Zeitpunkt alle Stellungen.
   Das Markup zeigt ohne dieses Skript das Endbild. Gespielt wird einmal, sobald die Szene zu 40 % im Bild ist;
   „Nochmal ansehen“ spielt sie erneut. Bei „weniger Bewegung“ bleibt es beim Endbild.
   Gezeigt werden Schritte, keine echten Zeiten: der Takt ist für beide Seiten gleich. */
(function () {
  "use strict";
  var berg = document.querySelector(".berg");
  if (!berg) return;
  var svg = berg.querySelector(".berg__bild");
  var $ = function (s) { return berg.querySelector(s); };
  var knopf = document.querySelector('[data-aktion="weg-nochmal"]');

  /* Am Handy nur der Ausschnitt mit beiden Leuten und der Liftstation; Leute, Helfer und Zeichen dort größer (G) */
  var schmal = window.matchMedia("(max-width: 700px)");
  var G = 1;

  /* Gondeln ruhen außer Sicht */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { berg.classList.toggle("ist-weg", !e[0].isIntersecting); }).observe(berg);
  }

  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || !svg.getBBox) return;

  var T = 17.3, TAKT = 1.55;
  var RUF = 1.2 + 5 * TAKT, BB = 1.2 + 6 * TAKT;   // Handy: Anruf bei der Rettung („Ort erklären“), danach ruft die Rettung die Bergbahn an
  var RX = 760, RY = 110;                            // Stelle der Rettung im Himmel (am Handy anders, siehe rahmen)
  var ramp = function (t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); };
  var weich = function (x) { return x * x * (3 - 2 * x); };
  var federn = function (x) {   // springt leicht über 1 hinaus und setzt sich
    if (x <= 0) return 0; if (x >= 1) return 1;
    var c = 2.2; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  };
  var fix = function (x) { return Math.round(x * 100) / 100; };
  var deck = function (el, v) { el.style.opacity = v <= 0.001 ? 0 : fix(v); };
  var stelle = function (el, x, y, s, extra) { el.setAttribute("transform", "translate(" + fix(x) + " " + fix(y) + ")" + (s !== undefined && s !== 1 ? " scale(" + fix(s) + ")" : "") + (extra || "")); };

  var e = {
    personA: $("#berg-person-a"), personB: $("#berg-person-b"), puffA: $("#berg-puff-a"), puffB: $("#berg-puff-b"),
    armHoch: $("#berg-arm-hoch"), armUnten: $("#berg-arm-unten"),
    chipruf: $("#berg-chipruf"), chiprufRing: $("#berg-chipruf-ring"),
    wellen: berg.querySelectorAll(".berg__welle"), funk: $("#berg-funk"), funkPunkt: $("#berg-funk-punkt"),
    antLicht: $("#berg-antenne-licht"), antSpitze: $("#berg-antenne-spitze"),
    pinA: $("#berg-pin-a"), ringA: $("#berg-ring-a"),
    helferA: $("#berg-helfer-a"), helferB: $("#berg-helfer-b"), frageB: $("#berg-frage-b"),
    pfadA: $("#berg-pfad-a"), pfadB: $("#berg-pfad-b"), suche: $("#berg-suche"),
    blase: $("#berg-blase-b"), blasenZeichen: berg.querySelectorAll(".berg__blase-zeichen"),
    daA: $("#berg-da-a"), daB: $("#berg-da-b"),
    rettung: $("#berg-rettung"), rettungRing: $("#berg-rettung-ring"), stationRing: $("#berg-station-ring"),
    anrufA: $("#berg-anruf-a"), anrufB: $("#berg-anruf-b"),
  };
  e.anrufALinien = e.anrufA.querySelectorAll("path"); e.anrufBLinien = e.anrufB.querySelectorAll("path");
  var LA = e.pfadA.getTotalLength(), LB = e.pfadB.getTotalLength(), LF = e.funk.getTotalLength();
  var funkPunkt = function (p) { return e.funk.getPointAtLength(p * LF); };
  var zuletzt = T;

  /* Karten: Schritt je Zeitpunkt */
  var karten = berg.querySelectorAll(".berg__karte");
  var KARTE = [
    { el: karten[0], schritte: [[0, "Gestürzt"], [1.2, "Knopf halten"], [3.1, "Standort geht raus"], [4.35, "Mitarbeiter fährt los"], [7.6, "Hilfe ist da"]], eigene: [1.2] },
    { el: karten[1], schritte: [[0, "Gestürzt"], [1.2, "Handschuhe aus"], [1.2 + TAKT, "Handy finden"], [1.2 + 2 * TAKT, "Entsperren"], [1.2 + 3 * TAKT, "Netz suchen"],
      [1.2 + 4 * TAKT, "Nummer wählen"], [RUF, "Ort erklären"], [BB, "Rettung ruft Bergbahn an"], [12.0, "Hilfe sucht dich"], [16.1, "Hilfe ist da"]],
      eigene: [1.2, 1.2 + TAKT, 1.2 + 2 * TAKT, 1.2 + 3 * TAKT, 1.2 + 4 * TAKT, 1.2 + 5 * TAKT] },
  ];
  var dauer = berg.querySelector(".berg__dauer");   // Durchschnittsdauer beim Handy, erst wenn die Hilfe da ist
  var dauerAn = null;
  KARTE.forEach(function (k) { k.text =k.el.querySelector(".berg__jetzt"); k.punkte = k.el.querySelectorAll(".berg__punkte i"); k.jetzt = null; });
  var kartenSetzen = function (t) {
    KARTE.forEach(function (k) {
      var txt = k.schritte[0][1];
      for (var i = 0; i < k.schritte.length; i++) if (t >= k.schritte[i][0]) txt = k.schritte[i][1];
      if (txt !== k.jetzt) {
        k.jetzt = txt; k.text.textContent = txt;
        k.el.classList.toggle("ist-fertig", txt === "Hilfe ist da");
        if (k.text.animate && t > 0) k.text.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
      }
      for (var j = 0; j < k.punkte.length; j++) k.punkte[j].classList.toggle("an", t >= k.eigene[j]);
    });
    if (dauer && (t >= 16.3) !== dauerAn) {
      dauerAn = t >= 16.3; dauer.style.opacity = dauerAn ? 1 : 0;
      if (dauerAn && dauer.animate && t < T) dauer.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "ease-out" });
    }
  };

  var helferSetzen = function (el, pfad, L, p, abstand) {   // am Ende schauen beide Helfer nach links, zur gestürzten Person
    var a = pfad.getPointAtLength(p * L), n = pfad.getPointAtLength(Math.min(L, p * L + 2));
    var links = p >= 1 ? true : n.x < a.x - 0.01;
    // größere Figuren am Handy: der Helfer bleibt am Ende etwas weiter weg, damit er die Person nicht verdeckt
    el.setAttribute("transform", "translate(" + fix(a.x + (G - 1) * abstand * p) + " " + fix(a.y) + ")" + (G !== 1 ? " scale(" + G + ")" : ""));
    el.querySelector(".berg__dreh").setAttribute("transform", "scale(" + (links ? -1.15 : 1.15) + " 1.15)");
  };
  var puls = function (ring, t, a, r0, r1, staerke) {   // zwei kurze Ringe, die sich ausbreiten
    var p1 = ramp(t, a, a + 0.6), p2 = ramp(t, a + 0.35, a + 0.95), p = p1 < 1 ? p1 : p2;
    var an = (p1 > 0 && p1 < 1) || (p2 > 0 && p2 < 1);
    ring.setAttribute("r", fix(r0 + p * (r1 - r0)));
    deck(ring, an ? (1 - p) * staerke : 0);
  };
  var alarm = function (el, t, a) {   // orange Ringe am Helfer
    var ring = el.querySelector(".berg__alarm");
    ring.setAttribute("cy", -24); puls(ring, t, a, 10, 40, 0.95);
  };
  var linien = function (liste, d) { for (var i = 0; i < liste.length; i++) liste[i].setAttribute("d", d); };
  var laufen = function (liste, t) { for (var i = 0; i < liste.length; i++) liste[i].setAttribute("stroke-dashoffset", fix(-t * 26)); };

  var zeichne = function (t) {
    zuletzt = t;
    /* Sturz: beide rutschen ein Stück und bleiben liegen, Schnee staubt */
    var s = weich(ramp(t, 0, 0.65));
    stelle(e.personA, 322 - 40 * (1 - s), 455 - 26 * (1 - s), G, " rotate(" + fix(-28 * (1 - s)) + ")");
    stelle(e.personB, 938 - 36 * (1 - s), 420 - 30 * (1 - s), G, " rotate(" + fix(-24 * (1 - s)) + ")");
    var pf = ramp(t, 0.45, 1.5);
    deck(e.puffA, pf > 0 && pf < 1 ? (1 - pf) * 0.95 : 0); stelle(e.puffA, 316, 462, (0.5 + pf * 0.9) * G);
    deck(e.puffB, pf > 0 && pf < 1 ? (1 - pf) * 0.95 : 0); stelle(e.puffB, 932, 428, (0.5 + pf * 0.9) * G);

    /* ---- SkiTag ---- */
    var auf = federn(ramp(t, 1.0, 1.45)), weg = ramp(t, 4.3, 4.7);
    deck(e.chipruf, ramp(t, 1.0, 1.15) * (1 - weg)); stelle(e.chipruf, 322, 455 - 83 * G, Math.max(0.01, auf * (1 - 0.3 * weg)) * G);
    e.chiprufRing.setAttribute("stroke-dashoffset", fix(1 - ramp(t, 1.45, 2.95)));
    var wellenAn = t >= 3.0 && t <= 4.9;
    for (var i = 0; i < e.wellen.length; i++) {
      var ph = ((t - 3.0) * 1.25 + i / 3) % 1;
      e.wellen[i].setAttribute("r", fix(12 * G + ph * 64));
      deck(e.wellen[i], wellenAn ? (1 - ph) * 0.85 * (1 - ramp(t, 4.5, 4.9)) : 0);
    }
    var fp = weich(ramp(t, 3.1, 4.1));
    e.funk.setAttribute("stroke-dashoffset", fix(1 - fp));
    deck(e.funk, t >= 3.1 ? 0.75 * (1 - ramp(t, 5.4, 6.4)) : 0);
    var pk = funkPunkt(fp);
    e.funkPunkt.setAttribute("cx", fix(pk.x)); e.funkPunkt.setAttribute("cy", fix(pk.y));
    deck(e.funkPunkt, t >= 3.1 && t < 4.2 ? 1 : 0);
    var al = ramp(t, 4.05, 4.85);
    e.antLicht.setAttribute("r", fix(6 + al * 26)); deck(e.antLicht, al > 0 && al < 1 ? (1 - al) : 0);
    e.antSpitze.setAttribute("fill", t >= 4.05 && t < 9 ? "#ff5a1c" : "#95a2b9");
    var pin = federn(ramp(t, 4.2, 4.7)), pinWeg = ramp(t, 7.5, 7.8);
    deck(e.pinA, ramp(t, 4.2, 4.32) * (1 - pinWeg)); stelle(e.pinA, 322, 455 - (51 + 34 * (1 - pin)) * G, G);
    var ringAn = t >= 4.5 && t < 7.6, rp = ((t - 4.5) / 1.3) % 1;
    e.ringA.setAttribute("rx", fix((16 + rp * 42) * G)); e.ringA.setAttribute("ry", fix((16 + rp * 42) * 0.28 * G));
    deck(e.ringA, ringAn ? (1 - rp) * 0.8 : 0);
    alarm(e.helferA, t, 4.35);
    helferSetzen(e.helferA, e.pfadA, LA, weich(ramp(t, 4.9, 7.6)), 50);
    var da = federn(ramp(t, 7.6, 8.0));
    deck(e.daA, ramp(t, 7.6, 7.72)); stelle(e.daA, 322, 455 - 77 * G, Math.max(0.01, da) * G);

    /* ---- Handy ---- */
    var k = Math.floor((t - 1.2) / TAKT), blaseAn = t >= 1.2 && t < 1.2 + 6 * TAKT;
    k = Math.max(0, Math.min(5, k));
    var lokal = (t - 1.2) - k * TAKT;
    deck(e.blase, blaseAn ? Math.min(1, ramp(t, 1.2, 1.35)) * (1 - ramp(t, 1.2 + 6 * TAKT - 0.2, 1.2 + 6 * TAKT)) : 0);
    stelle(e.blase, 938, 420 - 98 * G, (0.82 + 0.18 * federn(ramp(lokal, 0, 0.35))) * G);
    for (var j = 0; j < e.blasenZeichen.length; j++) e.blasenZeichen[j].style.display = j === k ? "" : "none";
    var hoch = t >= 1.2 + TAKT;
    e.armHoch.style.opacity = hoch ? 1 : 0; e.armUnten.style.opacity = hoch ? 0 : 1;
    /* Beim „Ort erklären“ telefoniert die Person mit der Rettung; danach ruft die Rettung erst die Bergbahn an */
    var rb = federn(ramp(t, RUF, RUF + 0.4));
    deck(e.rettung, ramp(t, RUF, RUF + 0.12)); stelle(e.rettung, RX, RY, Math.max(0.01, rb) * G);
    deck(e.anrufA, ramp(t, RUF, RUF + 0.25) * (1 - ramp(t, BB, BB + 0.4))); laufen(e.anrufALinien, t);
    puls(e.rettungRing, t, BB, 24, 46, 0.9);
    deck(e.anrufB, ramp(t, BB + 0.1, BB + 0.35) * (1 - ramp(t, BB + 1.3, BB + 1.7))); laufen(e.anrufBLinien, t);
    puls(e.stationRing, t, BB + 0.7, 30, 64, 0.9);
    var sucheAn = ramp(t, 11.9, 12.4) * (1 - ramp(t, 16.1, 16.7));
    deck(e.suche, sucheAn); e.suche.setAttribute("stroke-dashoffset", fix(-t * 14));
    alarm(e.helferB, t, 11.8);
    var hb = ramp(t, 12.1, 16.1);
    helferSetzen(e.helferB, e.pfadB, LB, 0.5 * (hb + weich(hb)), 40);
    var hpos = e.pfadB.getPointAtLength(0.5 * (hb + weich(hb)) * LB);
    deck(e.frageB, t >= 12.4 && t < 15.9 ? Math.min(1, ramp(t, 12.4, 12.6)) * (1 - ramp(t, 15.7, 15.9)) : 0);
    stelle(e.frageB, hpos.x + 4 + (G - 1) * 40 * hb, hpos.y - 80 * G + Math.sin(t * 5) * 3, G);
    var db = federn(ramp(t, 16.1, 16.5));
    deck(e.daB, ramp(t, 16.1, 16.22)); stelle(e.daB, 938, 420 - 82 * G, Math.max(0.01, db) * G);

    kartenSetzen(t);
  };

  var raf = 0, start = 0;
  var bild = function (jetzt) {
    var t = (jetzt - start) / 1000;
    zeichne(Math.min(t, T));
    if (t < T) raf = requestAnimationFrame(bild);
    else if (knopf) knopf.hidden = false;
  };
  var abspielen = function () {
    cancelAnimationFrame(raf);
    start = performance.now();
    raf = requestAnimationFrame(bild);
  };

  /* Ausschnitt und Größe je nach Breite; der Funk beginnt an der Brust der (größeren) Figur */
  var rahmen = function () {
    svg.setAttribute("viewBox", schmal.matches ? "240 96 820 544" : "0 0 1200 640");
    G = schmal.matches ? 1.5 : 1;
    var brust = 455 - 18 * G;
    e.funk.setAttribute("d", "M326 " + fix(brust) + " C 350 320 470 170 626 99");
    LF = e.funk.getTotalLength();
    for (var i = 0; i < e.wellen.length; i++) e.wellen[i].setAttribute("cy", fix(brust - 3 * G));
    // Rettung im Himmel; Anruf vom Handy der Person zur Rettung und von der Rettung zur Liftstation
    RX = G > 1 ? 820 : 760; RY = G > 1 ? 168 : 110;
    var hx = 938 + 19 * G, hy = 420 - 52 * G;
    linien(e.anrufALinien, "M" + fix(hx) + " " + fix(hy) + " Q " + fix(hx - 30) + " " + (RY + 60) + " " + RX + " " + RY);
    linien(e.anrufBLinien, "M" + RX + " " + RY + " Q " + fix((RX + 648) / 2) + " " + (RY - 20) + " 648 146");
    zeichne(zuletzt);
  };
  if (schmal.addEventListener) schmal.addEventListener("change", rahmen); else if (schmal.addListener) schmal.addListener(rahmen);
  rahmen();
  if (ruhig) return;   // bei „weniger Bewegung“ bleibt das Endbild stehen

  zeichne(0);
  var beob = new IntersectionObserver(function (eintrag) {
    if (!eintrag[0].isIntersecting) return;
    beob.disconnect();
    abspielen();
  }, { threshold: 0.4 });
  beob.observe(berg);
  if (knopf) knopf.addEventListener("click", abspielen);
})();
