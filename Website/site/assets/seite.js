/* SkiTag · eigene Abläufe der Seite: Kopfleiste, Schneeflocken im Hang,
   der Halte-Knopf mit der Zeichnung des Notrufwegs.
   Die Engine (scrollcraft.js) bleibt unverändert. */
(function () {
  "use strict";
  var ohneBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var abschnitt = function (x, von, bis) { return klemme((x - von) / (bis - von)); };

  /* ------------------------------------------------------- Kopfleiste -- */
  var leiste = document.querySelector(".leiste");
  var hang = document.querySelector(".hang");
  function leisteSetzen() {
    var grenze = hang ? hang.offsetHeight - window.innerHeight * 1.1 : 200;
    leiste.classList.toggle("ist-unten", window.scrollY > grenze);
  }
  window.addEventListener("scroll", leisteSetzen, { passive: true });
  leisteSetzen();

  /* ------------------------------------------------- Schneeflocken -- */
  if (!ohneBewegung) document.querySelectorAll("canvas.flocken").forEach(function (leinwand) {
    var ctx = leinwand.getContext("2d");
    var flocken = [];
    var sichtbar = false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var groesse = function () { leinwand.width = leinwand.clientWidth * dpr; leinwand.height = leinwand.clientHeight * dpr; };
    groesse();
    window.addEventListener("resize", groesse);
    var anzahl = window.innerWidth < 700 ? 12 : 22;
    for (var i = 0; i < anzahl; i++) {
      var nah = Math.random() < 0.06;
      flocken.push({ x: Math.random(), y: Math.random(),
        r: nah ? 2.6 + Math.random() * 2.4 : 0.8 + Math.random() * 1.4,
        v: nah ? 0.0016 + Math.random() * 0.0012 : 0.0005 + Math.random() * 0.0007,
        w: Math.random() * Math.PI * 2, a: nah ? 0.6 : 0.85 });
    }
    new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; }).observe(leinwand);
    var schneien = function () {
      if (sichtbar) {
        var b = leinwand.width, h = leinwand.height;
        ctx.clearRect(0, 0, b, h);
        for (var j = 0; j < flocken.length; j++) {
          var f = flocken[j];
          f.y += f.v; f.w += 0.01;
          if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
          ctx.beginPath();
          ctx.arc((f.x + Math.sin(f.w) * 0.006) * b, f.y * h, f.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255," + f.a + ")";
          ctx.fill();
        }
      }
      requestAnimationFrame(schneien);
    };
    requestAnimationFrame(schneien);
  });

  /* ------------------------------------------- Der Chip (Vorführung) -- */
  /* Kurz drücken ruft die Gruppe. Drei Sekunden halten startet den Notruf,
     danach fünf Sekunden Abbruch-Zeit: wie am echten Chip bricht ein
     weiterer Druck ab, Loslassen allein nicht. Danach spielt der Weg zum
     Mitarbeiter von selbst ab, ohne Scrollen. */
  var akt = document.getElementById("der-chip");
  var knopf = akt && akt.querySelector(".haltknopf");
  if (knopf) {
    var ring = knopf.querySelector(".ring");
    var led = knopf.querySelector(".led");
    var status = document.getElementById("knopf-status");
    var nochmal = akt.querySelector('[data-aktion="nochmal"]');
    var weg = function (n) { return akt.querySelector(".weg--" + n); };
    var g1 = weg("g1"), g2 = weg("g2"), h1 = weg("h1"), h2 = weg("h2");
    var wellen = akt.querySelectorAll(".welle");
    var zittern = akt.querySelectorAll(".zittern");
    var punkt = akt.querySelector(".punkt-rot");
    var handyText = akt.querySelector(".handy-text");
    var annehmen = akt.querySelector(".annehmen");
    var schritte = akt.querySelectorAll(".gesten li");

    var HALTEN = 3000, FRIST = 5000, LAUF = 5200, GRUPPE = 2200;
    var zustand = "ruhe", start = 0, hilfe = 0, gruppe = 0, letzteSekunde = -1, stufe = "";

    var setzeZustand = function (z) { zustand = z; knopf.setAttribute("data-zustand", z); };
    var ringAuf = function (rest) { ring.style.strokeDashoffset = rest; ring.style.opacity = rest >= 0.999 ? 0 : 1; };
    var sage = function (t) { status.innerHTML = t; };
    var aktiv = function (name) { schritte.forEach(function (li) { li.classList.toggle("ist-aktiv", li.getAttribute("data-schritt") === name); }); };

    var zuruecksetzen = function () {
      setzeZustand("ruhe"); hilfe = 0; gruppe = 0; stufe = "";
      ringAuf(1); nochmal.hidden = true; aktiv("");
      sage("Kurz drücken oder drei Sekunden halten. Mit der Maus, dem Finger oder der Leertaste.");
    };
    var abbrechen = function () {
      zuruecksetzen();
      sage("<strong>Abgebrochen.</strong> Der zweite Druck hat den Notruf gestoppt, gesendet wurde nichts.");
    };
    var druecken = function () {
      if (zustand === "frist") { abbrechen(); return; }
      if (zustand === "lauf") return;
      hilfe = 0; gruppe = 0; stufe = ""; nochmal.hidden = true;
      setzeZustand("halten"); start = performance.now(); letzteSekunde = -1;
      aktiv("halten");
      sage("Weiter halten für einen Notruf, oder loslassen für die Gruppe.");
    };
    var loslassen = function () {
      if (zustand !== "halten") return;
      ringAuf(1);
      setzeZustand("gruppe"); start = performance.now();
      aktiv("gruppe");
      sage("<strong>Kurz gedrückt:</strong> Deine Gruppe wird gerufen. Die Bergbahn wird nicht alarmiert.");
    };

    knopf.addEventListener("pointerdown", function (e) { e.preventDefault(); if (knopf.setPointerCapture) { try { knopf.setPointerCapture(e.pointerId); } catch (_) {} } druecken(); });
    knopf.addEventListener("pointerup", loslassen);
    knopf.addEventListener("pointercancel", loslassen);
    knopf.addEventListener("lostpointercapture", loslassen);
    knopf.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    knopf.addEventListener("keydown", function (e) {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (!e.repeat) druecken();
    });
    knopf.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); loslassen(); } });
    knopf.addEventListener("click", function (e) { e.preventDefault(); });
    nochmal.addEventListener("click", function () { zuruecksetzen(); knopf.focus(); });

    var zeichnen = function () {
      g1.style.strokeDashoffset = 1 - abschnitt(gruppe, 0, 0.4);
      g2.style.strokeDashoffset = 1 - abschnitt(gruppe, 0.05, 0.45);
      for (var z = 0; z < zittern.length; z++) {
        var an = gruppe > 0.45 && gruppe < 1 ? 0.35 + 0.65 * Math.abs(Math.sin(gruppe * 28)) : (gruppe >= 1 ? 0.5 : 0);
        zittern[z].style.opacity = an;
      }
      h1.style.strokeDashoffset = 1 - abschnitt(hilfe, 0.02, 0.36);
      h2.style.strokeDashoffset = 1 - abschnitt(hilfe, 0.36, 0.52);
      for (var k = 0; k < wellen.length; k++) {
        var raus = abschnitt(hilfe, 0.02 + k * 0.04, 0.1 + k * 0.04), zurueck = abschnitt(hilfe, 0.84 + k * 0.04, 0.92 + k * 0.04);
        var g = abschnitt(gruppe, 0.0 + k * 0.04, 0.08 + k * 0.04);
        var w = hilfe > 0 ? (hilfe < 0.4 ? 0.25 + 0.75 * raus : (hilfe < 0.84 ? 0.3 : 0.3 + 0.7 * zurueck)) : (gruppe > 0 ? 0.2 + 0.6 * g : 0);
        wellen[k].style.opacity = w;
      }
      var p = abschnitt(hilfe, 0.52, 0.58);
      punkt.style.opacity = p;
      punkt.style.transform = "scale(" + (0.4 + 0.6 * p) + ")";
      handyText.style.opacity = abschnitt(hilfe, 0.55, 0.62);
      annehmen.setAttribute("fill", hilfe > 0.72 && hilfe < 0.82 ? "#5d6f84" : "#1b2430");
      led.setAttribute("fill", (zustand === "frist" || zustand === "lauf" || zustand === "fertig") ? "#d83a2c" : "#8fa3b8");
    };

    var takt = function (jetzt) {
      if (zustand === "halten") {
        var t = (jetzt - start) / HALTEN;
        ringAuf(1 - klemme(t));
        if (t >= 1) { setzeZustand("frist"); start = jetzt; }
      } else if (zustand === "frist") {
        var rest = FRIST - (jetzt - start);
        ringAuf(1 - klemme(rest / FRIST));
        var sek = Math.ceil(rest / 1000);
        if (sek !== letzteSekunde && sek > 0) { letzteSekunde = sek; sage("<strong>Notruf in " + sek + " s.</strong> Loslassen und noch einmal kurz drücken bricht ab."); }
        if (rest <= 0) {
          setzeZustand("lauf"); start = jetzt; ringAuf(1); aktiv("hilfe");
          sage("<strong>Notruf gesendet.</strong> Dein Standort ist unterwegs zur Bergbahn.");
        }
      } else if (zustand === "lauf") {
        hilfe = ohneBewegung ? 1 : klemme((jetzt - start) / LAUF);
        if (hilfe > 0.56 && stufe === "") { stufe = "punkt"; sage("Der nächste Mitarbeiter sieht deinen Standort und tippt auf <strong>Annehmen</strong>."); }
        if (hilfe >= 1) {
          setzeZustand("fertig");
          sage("<strong>Dein Chip vibriert zweimal:</strong> Hilfe ist unterwegs. Das war eine Vorführung, gesendet wurde nichts.");
          nochmal.hidden = false;
        }
      } else if (zustand === "gruppe") {
        gruppe = ohneBewegung ? 1 : klemme((jetzt - start) / GRUPPE);
        if (gruppe >= 1) { setzeZustand("ruhe"); gruppe = 1; }
      }
      zeichnen();
      requestAnimationFrame(takt);
    };
    requestAnimationFrame(takt);
  }

  /* ------------------------------------------------- Die App (Skizze) -- */
  var appAkt = document.getElementById("app");
  if (appAkt) {
    var spur = appAkt.querySelector(".spur");
    var route = appAkt.querySelector(".route");
    var radius = appAkt.querySelector(".radius");
    var ziel = appAkt.querySelectorAll(".ziel");
    var kind = appAkt.querySelector(".kind");
    var appTakt = function () {
      var p = ohneBewegung ? 1 : (parseFloat(getComputedStyle(appAkt).getPropertyValue("--sc-p")) || 0);
      var r = abschnitt(p, 0.04, 0.28);
      route.style.strokeDashoffset = 1 - r;
      ziel.forEach(function (z) { z.style.opacity = abschnitt(p, 0.02, 0.1); });
      spur.style.strokeDashoffset = 1 - abschnitt(p, 0.36, 0.6);
      radius.style.strokeDashoffset = 1 - abschnitt(p, 0.68, 0.8);
      radius.style.fillOpacity = abschnitt(p, 0.7, 0.82);
      var raus = abschnitt(p, 0.82, 0.95);
      kind.style.opacity = abschnitt(p, 0.7, 0.76);
      kind.setAttribute("transform", "translate(" + (160 + 70 * raus) + " " + (430 + 45 * raus) + ")");
      radius.style.stroke = raus >= 1 ? "#5d6f84" : "#1b2430";
      requestAnimationFrame(appTakt);
    };
    requestAnimationFrame(appTakt);
  }
})();
