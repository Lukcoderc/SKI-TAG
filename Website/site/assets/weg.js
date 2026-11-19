/* SkiTag · Der Weg zur Hilfe (Feedback 99/100), nur auf chip.html.
   Eine Bergszene (seit Feedback 124 ein echtes Foto mit Kartenpunkten): links stürzt jemand mit SkiTag, rechts jemand mit dem Handy. Beide Abläufe laufen im
   gleichen Takt (etwa 1,6 s je Schritt) auf einer Zeitleiste. Beim Handy ruft die Rettung danach erst die Bergbahn
   an (Feedback 101); zeichne(t) setzt für jeden Zeitpunkt alle Stellungen.
   Das Markup zeigt ohne dieses Skript das Endbild. Gespielt wird mit dem Knopf „Ablauf starten“ mitten im Bild
   (Feedback 131); „Nochmal ansehen“ spielt sie erneut. Bei „weniger Bewegung“ bleibt es beim Endbild.
   Gezeigt werden Schritte, keine echten Zeiten: der Takt ist für beide Seiten gleich.
   Feedback 121: Der Takt läuft über eine GSAP-Zeitleiste (pausiert, solange die Szene nicht im Bild ist), die Kurven
   für Sturz, Funk, Helfer und Zeichen kommen aus GSAP, und die Karten wechseln mit GSAP (Text gleitet ein, Striche
   wachsen, „Hilfe ist da“ hebt sich kurz). Ohne GSAP läuft der alte Takt mit requestAnimationFrame. */
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

  var gs = window.gsap || null, tl = null, gestartet = false;
  /* Gondeln ruhen außer Sicht, die Zeitleiste auch */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      var weg = !e[0].isIntersecting;
      berg.classList.toggle("ist-weg", weg);
      if (tl && gestartet && tl.progress() < 1) { if (weg) tl.pause(); else tl.resume(); }
    }).observe(berg);
  }

  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || !svg.getBBox) return;

  var T = 17.3, TAKT = 1.55;
  var TEMPO = 1.25;   // Feedback 131: alles einen Ticken langsamer (der Ablauf dauert 25 % länger, die Schritte bleiben im Verhältnis)
  var RUF = 1.2 + 5 * TAKT, BB = 1.2 + 6 * TAKT;   // Handy: Anruf bei der Rettung („Ort erklären“), danach ruft die Rettung die Bergbahn an
  var RX = 1060, RY = 50;                            // Stelle der Rettung im Himmel oben rechts
  // Feedback 131: Skigebiet von oben mit zwei getrennten Pisten. A mit SkiTag auf der Hauptpiste links, B mit dem Handy auf der
  // Piste rechts hinter dem Wald, wie die Karten darüber (Koordinaten im Foto); die Talstation mit dem Empfänger liegt unten (SX, SY)
  var AX = 370, AY = 340, BX = 935, BY = 285, SX = 668, SY = 540;
  var ramp = function (t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); };
  var weich = function (x) { return x * x * (3 - 2 * x); };
  var federn = function (x) {   // springt leicht über 1 hinaus und setzt sich
    if (x <= 0) return 0; if (x >= 1) return 1;
    var c = 2.2; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  };
  // mit GSAP: rutschen und auslaufen (Sturz), anziehen und abbremsen (Funk, Helfer), kurz überschwingen (Zeichen)
  var kurve = function (name, ersatz) {
    if (!gs) return ersatz;
    var f = gs.parseEase(name);
    return function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : f(x); };
  };
  var rutschen = kurve("power3.out", weich), gleiten = kurve("power2.inOut", weich), fahren = kurve("sine.inOut", weich);
  federn = kurve("back.out(2)", federn);
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
    spurA: $("#berg-spur-a"), spurB: $("#berg-spur-b"),
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
  KARTE.forEach(function (k) { k.text = k.el.querySelector(".berg__jetzt"); k.punkte = k.el.querySelectorAll(".berg__punkte i"); k.jetzt = null; k.an = []; });
  var einblenden = function (el, dauerS) {
    if (gs) gs.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: dauerS, ease: "power3.out", overwrite: true });
    else if (el.animate) el.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: dauerS * 1000, easing: "ease-out" });
  };
  var kartenSetzen = function (t) {
    KARTE.forEach(function (k) {
      var txt = k.schritte[0][1];
      for (var i = 0; i < k.schritte.length; i++) if (t >= k.schritte[i][0]) txt = k.schritte[i][1];
      if (txt !== k.jetzt) {
        k.jetzt = txt; k.text.textContent = txt;
        var fertig = txt === "Hilfe ist da";
        k.el.classList.toggle("ist-fertig", fertig);
        if (t > 0 && t < T) {
          einblenden(k.text, 0.45);
          if (fertig && gs) gs.fromTo(k.el, { y: 0 }, { y: -4, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 });
        }
      }
      for (var j = 0; j < k.punkte.length; j++) {
        var an = t >= k.eigene[j];
        if (an === k.an[j]) continue;
        k.an[j] = an; k.punkte[j].classList.toggle("an", an);
        // der Strich wächst von links, wenn der Schritt erreicht ist
        if (gs) { if (an && t > 0 && t < T) gs.fromTo(k.punkte[j], { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", duration: 0.4, ease: "power2.out" }); else gs.set(k.punkte[j], { scaleX: 1 }); }
      }
    });
    if (dauer && (t >= 16.3) !== dauerAn) {
      dauerAn = t >= 16.3; dauer.style.opacity = dauerAn ? 1 : 0;
      if (dauerAn && t < T) einblenden(dauer, 0.6);
    }
  };

  // Helfer als Punkt auf der Piste; hinter ihm wächst seine Spur (Feedback 124)
  var helferSetzen = function (el, pfad, L, p, abstand, spur, sichtbar) {
    var a = pfad.getPointAtLength(p * L);
    // größere Punkte am Handy: der Helfer bleibt am Ende etwas weiter weg, damit er die Person nicht verdeckt
    el.setAttribute("transform", "translate(" + fix(a.x + (G - 1) * abstand * p) + " " + fix(a.y) + ")" + (G !== 1 ? " scale(" + G + ")" : ""));
    if (spur) { spur.setAttribute("stroke-dashoffset", fix(1 - p)); deck(spur, p > 0 ? 0.9 * sichtbar : 0); }
  };
  var puls = function (ring, t, a, r0, r1, staerke) {   // zwei kurze Ringe, die sich ausbreiten
    var p1 = ramp(t, a, a + 0.6), p2 = ramp(t, a + 0.35, a + 0.95), p = p1 < 1 ? p1 : p2;
    var an = (p1 > 0 && p1 < 1) || (p2 > 0 && p2 < 1);
    ring.setAttribute("r", fix(r0 + p * (r1 - r0)));
    deck(ring, an ? (1 - p) * staerke : 0);
  };
  var alarm = function (el, t, a) {   // orange Ringe am Helfer
    var ring = el.querySelector(".berg__alarm");
    ring.setAttribute("cy", 0); puls(ring, t, a, 10, 34, 0.95);
  };
  var linien = function (liste, d) { for (var i = 0; i < liste.length; i++) liste[i].setAttribute("d", d); };
  var laufen = function (liste, t) { for (var i = 0; i < liste.length; i++) liste[i].setAttribute("stroke-dashoffset", fix(-t * 26)); };

  var zeichne = function (t) {
    zuletzt = t;
    /* Sturz: beide rutschen ein Stück und bleiben liegen, Schnee staubt */
    var s = rutschen(ramp(t, 0, 0.75));
    // die Punkte rutschen die Piste hinunter und bleiben liegen
    stelle(e.personA, AX - 16 * (1 - s), AY - 48 * (1 - s), G);
    stelle(e.personB, BX - 14 * (1 - s), BY - 46 * (1 - s), G);
    var pf = ramp(t, 0.45, 1.5);
    deck(e.puffA, pf > 0 && pf < 1 ? (1 - pf) * 0.95 : 0); stelle(e.puffA, AX, AY, (0.6 + pf * 1.2) * G);
    deck(e.puffB, pf > 0 && pf < 1 ? (1 - pf) * 0.95 : 0); stelle(e.puffB, BX, BY, (0.6 + pf * 1.2) * G);

    /* ---- SkiTag ---- */
    var auf = federn(ramp(t, 1.0, 1.45)), weg = ramp(t, 4.3, 4.7);
    deck(e.chipruf, ramp(t, 1.0, 1.15) * (1 - weg)); stelle(e.chipruf, AX, AY - 55 * G, Math.max(0.01, auf * (1 - 0.3 * weg)) * G);
    e.chiprufRing.setAttribute("stroke-dashoffset", fix(1 - ramp(t, 1.45, 2.95)));
    var wellenAn = t >= 3.0 && t <= 4.9;
    for (var i = 0; i < e.wellen.length; i++) {
      var ph = ((t - 3.0) * 1.25 + i / 3) % 1;
      e.wellen[i].setAttribute("r", fix(12 * G + ph * 64));
      deck(e.wellen[i], wellenAn ? (1 - ph) * 0.85 * (1 - ramp(t, 4.5, 4.9)) : 0);
    }
    var fp = gleiten(ramp(t, 3.1, 4.1));
    e.funk.setAttribute("stroke-dashoffset", fix(1 - fp));
    deck(e.funk, t >= 3.1 ? 0.75 * (1 - ramp(t, 5.4, 6.4)) : 0);
    var pk = funkPunkt(fp);
    e.funkPunkt.setAttribute("cx", fix(pk.x)); e.funkPunkt.setAttribute("cy", fix(pk.y));
    deck(e.funkPunkt, t >= 3.1 && t < 4.2 ? 1 : 0);
    var al = ramp(t, 4.05, 4.85);
    e.antLicht.setAttribute("r", fix(6 + al * 26)); deck(e.antLicht, al > 0 && al < 1 ? (1 - al) : 0);
    e.antSpitze.setAttribute("fill", t >= 4.05 && t < 9 ? "#ff5a1c" : "#95a2b9");
    var pin = federn(ramp(t, 4.2, 4.7)), pinWeg = ramp(t, 7.5, 7.8);
    deck(e.pinA, ramp(t, 4.2, 4.32) * (1 - pinWeg)); stelle(e.pinA, AX, AY - (16 + 34 * (1 - pin)) * G, G);
    var ringAn = t >= 4.5 && t < 7.6, rp = ((t - 4.5) / 1.3) % 1;
    e.ringA.setAttribute("rx", fix((16 + rp * 42) * G)); e.ringA.setAttribute("ry", fix((16 + rp * 42) * 0.45 * G));
    deck(e.ringA, ringAn ? (1 - rp) * 0.8 : 0);
    alarm(e.helferA, t, 4.35);
    helferSetzen(e.helferA, e.pfadA, LA, fahren(ramp(t, 4.9, 7.6)), -14, e.spurA, 1);   // hält links neben der Person
    deck(e.helferA, ramp(t, 4.3, 4.55));   // erscheint an der Station, wenn der Alarm ankommt
    var da = federn(ramp(t, 7.6, 8.0));
    deck(e.daA, ramp(t, 7.6, 7.72)); stelle(e.daA, AX, AY - 42 * G, Math.max(0.01, da) * G);

    /* ---- Handy ---- */
    var k = Math.floor((t - 1.2) / TAKT), blaseAn = t >= 1.2 && t < 1.2 + 6 * TAKT;
    k = Math.max(0, Math.min(5, k));
    var lokal = (t - 1.2) - k * TAKT;
    deck(e.blase, blaseAn ? Math.min(1, ramp(t, 1.2, 1.35)) * (1 - ramp(t, 1.2 + 6 * TAKT - 0.2, 1.2 + 6 * TAKT)) : 0);
    stelle(e.blase, BX, BY - 68 * G, (0.82 + 0.18 * federn(ramp(lokal, 0, 0.35))) * G);
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
    helferSetzen(e.helferB, e.pfadB, LB, 0.5 * (hb + weich(hb)), 14, e.spurB, 1);
    deck(e.helferB, ramp(t, 11.75, 12.0));
    var hpos = e.pfadB.getPointAtLength(0.5 * (hb + weich(hb)) * LB);
    deck(e.frageB, t >= 12.4 && t < 15.9 ? Math.min(1, ramp(t, 12.4, 12.6)) * (1 - ramp(t, 15.7, 15.9)) : 0);
    stelle(e.frageB, hpos.x + (G - 1) * 14 * hb, hpos.y - 30 * G + Math.sin(t * 5) * 3, G);
    var db = federn(ramp(t, 16.1, 16.5));
    deck(e.daB, ramp(t, 16.1, 16.22)); stelle(e.daB, BX, BY - 42 * G, Math.max(0.01, db) * G);

    kartenSetzen(t);
  };

  var raf = 0, start = 0;
  var bild = function (jetzt) {
    var t = (jetzt - start) / 1000 / TEMPO;
    zeichne(Math.min(t, T));
    if (t < T) raf = requestAnimationFrame(bild);
    else if (knopf) knopf.hidden = false;
  };
  var ersterStart = true;
  var abspielen = function () {
    if (knopf) knopf.hidden = true;
    gestartet = true;
    if (gs) {
      // eine Zeitleiste, die die Zeit t von 0 bis T gleichmäßig laufen lässt; zeichne(t) setzt dazu alle Stellungen
      if (!tl) {
        var uhr = { t: 0 };
        tl = gs.timeline({ paused: true, onComplete: function () { if (knopf) { knopf.hidden = false; gs.fromTo(knopf, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }); } } })
          .to(uhr, { t: T, duration: T * TEMPO, ease: "none", onUpdate: function () { zeichne(uhr.t); } });
      }
      if (ersterStart) gs.from(karten, { opacity: 0, y: -12, duration: 0.7, ease: "power3.out", stagger: 0.12 });
      ersterStart = false;
      tl.restart();
      return;
    }
    cancelAnimationFrame(raf);
    start = performance.now();
    raf = requestAnimationFrame(bild);
  };

  /* Ausschnitt und Größe je nach Breite; der Funk beginnt an der Brust der (größeren) Figur */
  var rahmen = function () {
    // am Handy nur der Ausschnitt um Station und Pisten (Feedback 124: Foto)
    svg.setAttribute("viewBox", schmal.matches ? "250 0 860 640" : "0 0 1200 640");
    G = schmal.matches ? 1.4 : 1;
    e.funk.setAttribute("d", "M" + AX + " " + AY + " C " + (AX + 40) + " " + (AY + 60) + " " + (SX - 110) + " " + (SY - 40) + " " + SX + " " + SY);
    LF = e.funk.getTotalLength();
    for (var i = 0; i < e.wellen.length; i++) { e.wellen[i].setAttribute("cx", AX); e.wellen[i].setAttribute("cy", AY); }
    // Rettung im Himmel; Anruf vom Handy der Person zur Rettung und von der Rettung zur Liftstation
    RX = G > 1 ? 1080 : 1060; RY = G > 1 ? 70 : 50;
    var hx = BX + 12 * G, hy = BY - 25 * G;
    linien(e.anrufALinien, "M" + fix(hx) + " " + fix(hy) + " Q " + fix(hx - 10) + " " + (RY + 90) + " " + RX + " " + RY);
    linien(e.anrufBLinien, "M" + RX + " " + RY + " Q " + fix((RX + SX) / 2 + 60) + " " + fix((RY + SY) / 2 - 60) + " " + SX + " " + SY);
    zeichne(zuletzt);
  };
  if (schmal.addEventListener) schmal.addEventListener("change", rahmen); else if (schmal.addListener) schmal.addListener(rahmen);
  rahmen();
  if (ruhig) return;   // bei „weniger Bewegung“ bleibt das Endbild stehen

  /* Feedback 131: die Szene startet nicht mehr von selbst, sondern mit einem Knopf mitten im Bild. So weiß man, was
     gleich passiert: Davor steht der Moment kurz vor den beiden Stürzen, leicht abgedunkelt. */
  zeichne(0);
  var start = document.createElement("div");
  start.className = "berg__start";
  start.innerHTML = '<button type="button" class="berg__los"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6a.8.8 0 0 0 1.2.7l7.6-4.8a.8.8 0 0 0 0-1.4L6.2 2.5A.8.8 0 0 0 5 3.2z"/></svg>Ablauf starten</button>'
    + '<p>Zwei Stürze im selben Moment. Wer bekommt zuerst Hilfe?</p>';
  berg.appendChild(start);
  start.querySelector(".berg__los").addEventListener("click", function () {
    start.classList.add("ist-weg");
    setTimeout(function () { start.remove(); }, 600);
    abspielen();
  });
  if (knopf) knopf.addEventListener("click", abspielen);
})();
