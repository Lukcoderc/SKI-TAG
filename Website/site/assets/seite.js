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
     weiterer Druck ab, Loslassen allein nicht. Danach spielt der Rest von
     selbst ab: das Signal erreicht die Liftstation, ein Mitarbeiter macht
     sich auf den Weg und fährt zur verletzten Person. */
  var akt = document.getElementById("der-chip");
  var knopf = akt && akt.querySelector(".haltknopf");
  if (knopf) {
    var ring = knopf.querySelector(".ring");
    var led = knopf.querySelector(".led");
    var status = document.getElementById("knopf-status");
    var nochmal = akt.querySelector('[data-aktion="nochmal"]');
    var weg = function (n) { return akt.querySelector(".weg--" + n); };
    var g1 = weg("g1"), g2 = weg("g2"), h1 = weg("h1");
    var wellen = akt.querySelectorAll(".welle");
    var zittern = akt.querySelectorAll(".zittern");
    var pings = akt.querySelectorAll(".ping");
    var glanz = akt.querySelector(".du-glanz");
    var spurMa = akt.querySelector(".spur-mitarbeiter");
    var mitarbeiter = akt.querySelector(".mitarbeiter");
    var spurMaLaenge = spurMa ? spurMa.getTotalLength() : 0;
    var schritte = akt.querySelectorAll(".gesten li");

    // In der Vorführung verkürzt; am echten Chip 3 s halten und 5 s Abbruch-Zeit.
    var HALTEN = 1000, FRIST = 2000, LAUF = 7000, GRUPPE = 2200;
    var zustand = "ruhe", start = 0, hilfe = 0, gruppe = 0, letzteSekunde = -1, stufe = "";

    var setzeZustand = function (z) { zustand = z; knopf.setAttribute("data-zustand", z); };
    var ringAuf = function (rest) { ring.style.strokeDashoffset = rest; ring.style.opacity = rest >= 0.999 ? 0 : 1; };
    var sage = function (t) { status.innerHTML = t; };
    var aktiv = function (name) { schritte.forEach(function (li) { li.classList.toggle("ist-aktiv", li.getAttribute("data-schritt") === name); }); };

    var zuruecksetzen = function () {
      setzeZustand("ruhe"); hilfe = 0; gruppe = 0; stufe = "";
      ringAuf(1); nochmal.hidden = true; aktiv("");
      sage("Kurz drücken oder halten. Mit der Maus, dem Finger oder der Leertaste.");
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

    var puls = function (x, von, bis) { var t = abschnitt(x, von, bis); return t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0; };
    var zeichnen = function () {
      g1.style.strokeDashoffset = 1 - abschnitt(gruppe, 0, 0.4);
      g2.style.strokeDashoffset = 1 - abschnitt(gruppe, 0.05, 0.45);
      for (var z = 0; z < zittern.length; z++) {
        zittern[z].style.opacity = gruppe > 0.45 && gruppe < 1 ? 0.35 + 0.65 * Math.abs(Math.sin(gruppe * 28)) : (gruppe >= 1 ? 0.5 : 0);
      }
      h1.style.strokeDashoffset = 1 - abschnitt(hilfe, 0.02, 0.26);
      h1.style.opacity = hilfe > 0.4 ? 0.35 : 1;
      pings[0].style.opacity = puls(hilfe, 0.24, 0.36) + puls(hilfe, 0.3, 0.42) * 0.6;
      pings[1].style.opacity = puls(hilfe, 0.28, 0.42);
      // Mitarbeiter fährt los und kommt an
      var fahrt = abschnitt(hilfe, 0.4, 0.92);
      var weich = fahrt < 0.5 ? 2 * fahrt * fahrt : 1 - Math.pow(-2 * fahrt + 2, 2) / 2;
      spurMa.style.strokeDasharray = spurMaLaenge + " " + spurMaLaenge;
      spurMa.style.strokeDashoffset = spurMaLaenge * (1 - weich);
      spurMa.style.opacity = fahrt > 0 ? 0.8 : 0;
      var pkt = spurMa.getPointAtLength(weich * spurMaLaenge);
      mitarbeiter.setAttribute("transform", "translate(" + pkt.x.toFixed(1) + " " + pkt.y.toFixed(1) + ")");
      for (var k = 0; k < wellen.length; k++) {
        var raus = abschnitt(hilfe, 0.02 + k * 0.04, 0.1 + k * 0.04);
        var zwei = puls(hilfe, 0.38 + k * 0.02, 0.46 + k * 0.02) + puls(hilfe, 0.48 + k * 0.02, 0.56 + k * 0.02);
        var g = abschnitt(gruppe, 0.0 + k * 0.04, 0.08 + k * 0.04);
        var w = hilfe > 0 ? (hilfe < 0.3 ? 0.25 + 0.75 * raus : 0.15 + 0.85 * Math.min(1, zwei)) : (gruppe > 0 ? 0.2 + 0.6 * g : 0);
        wellen[k].style.opacity = w;
      }
      glanz.style.opacity = (zustand === "frist" || zustand === "lauf") ? 0.55 + 0.45 * Math.abs(Math.sin(performance.now() / 380)) : (zustand === "fertig" ? 0.4 : 0);
      led.setAttribute("fill", (zustand === "frist" || zustand === "lauf" || zustand === "fertig") ? "#ff2d2d" : "#fff4ee");
    };

    var demoSichtbar = false;
    new IntersectionObserver(function (e) { var war = demoSichtbar; demoSichtbar = e[0].isIntersecting; if (demoSichtbar && !war) requestAnimationFrame(takt); }).observe(akt);
    var takt = function (jetzt) {
      if (!demoSichtbar) return;
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
          sage("<strong>Notruf gesendet.</strong> Dein Standort geht an die Liftstation.");
        }
      } else if (zustand === "lauf") {
        hilfe = ohneBewegung ? 1 : klemme((jetzt - start) / LAUF);
        if (hilfe > 0.38 && stufe === "") { stufe = "unterwegs"; sage("<strong>Ein Mitarbeiter ist unterwegs zu dir.</strong> Dein Chip vibriert zweimal."); }
        if (hilfe >= 1) {
          setzeZustand("fertig");
          sage("<strong>Hilfe ist da.</strong> Das war eine Vorführung, gesendet wurde nichts.");
          nochmal.hidden = false;
        }
      } else if (zustand === "gruppe") {
        gruppe = ohneBewegung ? 1 : klemme((jetzt - start) / GRUPPE);
        if (gruppe >= 1) { setzeZustand("ruhe"); gruppe = 1; }
      }
      if (zustand !== "ruhe" || gruppe > 0) zeichnen();
      requestAnimationFrame(takt);
    };
    zeichnen();
  }

  var fortschritt = function (el) { return parseFloat(el.style.getPropertyValue("--sc-p")) || 0; };

  /* ------------------------------------- Kopfleiste über der Nacht -- */
  /* Liegt die Leiste über einer nachtblauen Bühne, wird sie hell. */
  var nachtFlaechen = document.querySelectorAll(".nacht");
  function leisteNacht() {
    var unter = leiste.getBoundingClientRect().bottom / 2;
    var nacht = false;
    nachtFlaechen.forEach(function (n) { var r = n.getBoundingClientRect(); if (r.top <= unter && r.bottom >= unter) nacht = true; });
    leiste.classList.toggle("ist-nacht", nacht);
  }
  window.addEventListener("scroll", leisteNacht, { passive: true });
  leisteNacht();

  /* ------------------------------------------- So kommt Hilfe (Netz) -- */
  /* Vier Schritte über die gepinnte Strecke: Knopf halten, die Station hört
     mit, ein Mitarbeiter kommt, Empfänger an allen Stationen. */
  var netz = document.getElementById("berg");
  if (netz) {
    var sterne = netz.querySelector(".netz__sterne");
    if (sterne) {
      var NS = "http://www.w3.org/2000/svg", zufall = 7;
      var naechste = function () { zufall = (zufall * 9301 + 49297) % 233280; return zufall / 233280; };
      for (var s = 0; s < 120; s++) {
        var c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", (naechste() * 1600).toFixed(1));
        c.setAttribute("cy", (naechste() * 420).toFixed(1));
        c.setAttribute("r", (0.6 + naechste() * 1.4).toFixed(2));
        c.setAttribute("opacity", (0.25 + naechste() * 0.6).toFixed(2));
        sterne.appendChild(c);
      }
    }
    var nSchritte = netz.querySelectorAll(".netz__schritte li");
    var wellenN = netz.querySelectorAll(".netz__wellen circle");
    var funk = netz.querySelector(".netz__funk");
    var stationen = netz.querySelectorAll(".netz__station");
    var felder = netz.querySelectorAll(".netz__feld");
    var karte = netz.querySelector(".netz__karte");
    var nSpur = netz.querySelector(".netz__spur");
    var nMa = netz.querySelector(".netz__mitarbeiter");
    var glut = netz.querySelector(".netz__glut");
    var nSpurLaenge = nSpur.getTotalLength();
    var netzLetztP = -1, netzSichtbar = false;
    new IntersectionObserver(function (e) { var war = netzSichtbar; netzSichtbar = e[0].isIntersecting; if (netzSichtbar && !war) requestAnimationFrame(netzTakt); }).observe(netz);
    var netzTakt = function (jetzt) {
      if (!netzSichtbar) return;
      var p = ohneBewegung ? 0.95 : fortschritt(netz);
      var wellenLaufen = !ohneBewegung && p > 0.01 && p < 0.47;
      if (p === netzLetztP && !wellenLaufen) { requestAnimationFrame(netzTakt); return; }
      netzLetztP = p;
      var nr = p < 0.22 ? 0 : p < 0.45 ? 1 : p < 0.7 ? 2 : 3;
      nSchritte.forEach(function (li, i) { li.classList.toggle("ist-aktiv", i === nr); li.classList.toggle("ist-gezeigt", i < nr); });
      // 1: Wellen vom Chip
      var w = abschnitt(p, 0.02, 0.2);
      for (var k = 0; k < wellenN.length; k++) {
        var phase = ohneBewegung ? 0.5 : ((jetzt / 1600 + k / 3) % 1);
        wellenN[k].setAttribute("r", (20 + phase * 90).toFixed(1));
        wellenN[k].setAttribute("opacity", (w * (1 - phase) * (nr < 3 ? 1 : 0.4)).toFixed(2));
      }
      glut.setAttribute("opacity", (0.4 + 0.6 * w).toFixed(2));
      // 2: Funkweg zur Station, Antenne leuchtet, Feld der Station
      var f = abschnitt(p, 0.2, 0.36);
      funk.style.strokeDashoffset = 1 - f;
      stationen[0].classList.toggle("ist-an", f >= 1);
      var feld0 = abschnitt(p, 0.3, 0.44);
      felder[0].style.opacity = feld0; felder[0].style.transform = "scale(" + feld0 + ")";
      // 3: Mitarbeiter bekommt den Notruf und fährt hin
      karte.classList.toggle("ist-an", p > 0.47 && p < 0.74);
      var fahrt = abschnitt(p, 0.5, 0.68);
      var pkt = nSpur.getPointAtLength(fahrt * nSpurLaenge);
      nMa.setAttribute("transform", "translate(" + pkt.x.toFixed(1) + " " + pkt.y.toFixed(1) + ")");
      nSpur.style.opacity = fahrt > 0 ? 0.7 : 0;
      // 4: alle Stationen mit Feld, das ganze Gebiet
      for (var j = 1; j < felder.length; j++) {
        var e = abschnitt(p, 0.72 + j * 0.03, 0.86 + j * 0.03);
        felder[j].style.opacity = e; felder[j].style.transform = "scale(" + e + ")";
        stationen[j].classList.toggle("ist-an", e > 0.5);
      }
      requestAnimationFrame(netzTakt);
    };
  }

  /* --------------------------------------------- Die App im iPhone -- */
  /* Drei Bildschirme über die gepinnte Strecke: Route, Gruppe, Mein Tag. */
  var appAkt = document.getElementById("app");
  if (appAkt) {
    var app = appAkt.querySelector(".app");
    var appSchritte = appAkt.querySelectorAll(".app-akt__schritte li");
    var letztesBild = -1;
    var appTakt = function () {
      var p = fortschritt(appAkt);
      var nr = p < 0.36 ? 0 : p < 0.68 ? 1 : 2;
      if (nr !== letztesBild) {
        letztesBild = nr;
        app.setAttribute("data-bild", String(nr));
        appSchritte.forEach(function (li, i) { li.classList.toggle("ist-aktiv", i === nr); });
      }
      requestAnimationFrame(appTakt);
    };
    requestAnimationFrame(appTakt);
    appSchritte.forEach(function (li, i) {
      li.addEventListener("click", function () {
        var oben = appAkt.getBoundingClientRect().top + window.scrollY;
        var strecke = appAkt.offsetHeight - window.innerHeight;
        window.scrollTo({ top: oben + strecke * [0.18, 0.52, 0.84][i], behavior: ohneBewegung ? "auto" : "smooth" });
      });
    });
  }

  /* ------------------------------------- aktiver Link in der Leiste -- */
  var leistenLinks = document.querySelectorAll(".leiste__links a");
  if (leistenLinks.length) {
    var ziele = Array.prototype.map.call(leistenLinks, function (a) { return document.querySelector(a.getAttribute("href")); });
    var markieren = function () {
      var mitte = window.innerHeight * 0.4, aktiv = -1;
      ziele.forEach(function (z, i) { if (z) { var r = z.getBoundingClientRect(); if (r.top <= mitte && r.bottom >= mitte) aktiv = i; } });
      leistenLinks.forEach(function (a, i) { if (i === aktiv) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    };
    window.addEventListener("scroll", markieren, { passive: true });
    markieren();
  }
})();
