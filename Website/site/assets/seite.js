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
  /* Kurz drücken ruft die Gruppe. Halten startet den Notruf, danach läuft
     die Frist: wie am echten Chip bricht ein weiterer Druck ab, Loslassen
     allein nicht. Danach spielt der Weg in der Nachtgrafik von selbst ab:
     Funk zur Liftstation, Meldung an den Mitarbeiter, er fährt zur Person,
     zuletzt leuchten die Empfänger an allen Stationen. */
  var akt = document.getElementById("der-chip");
  var knopf = akt && akt.querySelector(".haltknopf");
  if (knopf) {
    var NS = "http://www.w3.org/2000/svg";
    var sterne = akt.querySelector(".netz__sterne");
    if (sterne) {
      var zufall = 7;
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
    var ring = knopf.querySelector(".ring");
    var led = knopf.querySelector(".led");
    var status = document.getElementById("knopf-status");
    var nochmal = akt.querySelector('[data-aktion="nochmal"]');
    var schritte = akt.querySelectorAll(".knopf__schritte li");
    var wellen = akt.querySelectorAll(".netz__wellen circle");
    var wellenGruppe = akt.querySelector(".netz__wellen");
    var gwege = akt.querySelectorAll(".netz__gweg");
    var zittern = akt.querySelector(".netz__zittern");
    var funk = akt.querySelector(".netz__funk");
    var ping = akt.querySelector(".netz__ping");
    var stationen = akt.querySelectorAll(".netz__station");
    var felder = akt.querySelectorAll(".netz__feld");
    var karte = akt.querySelector(".netz__karte");
    var spur = akt.querySelector(".netz__spur");
    var ma = akt.querySelector(".netz__mitarbeiter");
    var glut = akt.querySelector(".netz__glut");
    var spurLaenge = spur.getTotalLength();

    // Ab Tablet steht die Grafik in einer eigenen, schmaleren Fläche. Der
    // Ausschnitt wird dann so gelegt, dass „Du“, die Gruppe, die Liftstation
    // und der Mitarbeiter im Bild bleiben (Mitte bei x = 1160 der Zeichnung).
    // Am Handy bleibt sie mittig (dort verschiebt seite.css die Welt selbst).
    var bilder = akt.querySelectorAll(".netz__bild");
    var bildFlaeche = akt.querySelector(".knopf__bild");
    var flaeche = window.matchMedia("(min-width: 861px)");
    var ausrichten = function () {
      var box = "0 0 1600 900", art = "xMidYMid slice";
      if (flaeche.matches && bildFlaeche) {
        var r = bildFlaeche.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          var sichtbar = r.width / Math.max(r.width / 1600, r.height / 900);
          var x0 = Math.min(Math.max(1160 - sichtbar / 2, 0), Math.max(1600 - sichtbar, 0));
          box = Math.round(x0) + " 0 1600 900"; art = "xMinYMid slice";
        }
      }
      bilder.forEach(function (b) { b.setAttribute("viewBox", box); b.setAttribute("preserveAspectRatio", art); });
    };
    ausrichten();
    if (flaeche.addEventListener) flaeche.addEventListener("change", ausrichten);
    if (window.ResizeObserver && bildFlaeche) new ResizeObserver(ausrichten).observe(bildFlaeche);
    else window.addEventListener("resize", ausrichten);

    // In der Vorführung verkürzt; am echten Chip 3 s halten und 5 s Frist.
    var HALTEN = 1000, FRIST = 2000, LAUF = 8000, GRUPPE = 2400;
    var zustand = "ruhe", start = 0, hilfe = 0, gruppe = 0, letzteSekunde = -1, stufe = "";
    var START_TEXT = "Probier es aus: kurz drücken oder halten.";

    var setzeZustand = function (z) { zustand = z; knopf.setAttribute("data-zustand", z); ruheGezeichnet = false; };
    var ringAuf = function (rest) { ring.style.strokeDashoffset = rest; ring.style.opacity = rest >= 0.999 ? 0 : 1; };
    var sage = function (t) { status.innerHTML = t; };
    var aktiv = function (name) { schritte.forEach(function (li) { li.classList.toggle("ist-aktiv", li.getAttribute("data-schritt") === name); }); };

    var zuruecksetzen = function () {
      setzeZustand("ruhe"); hilfe = 0; gruppe = 0; stufe = "";
      ringAuf(1); nochmal.hidden = true; aktiv("gruppe");
      sage(START_TEXT);
    };
    var abbrechen = function () {
      zuruecksetzen();
      sage("<strong>Abgebrochen.</strong> Der zweite Druck hat den Notruf gestoppt.");
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
      // lange genug gehalten, auch wenn seit dem Drücken kaum ein Bild gezeichnet wurde
      if (performance.now() - start >= HALTEN) { setzeZustand("frist"); start += HALTEN; aktiv("halten"); return; }
      ringAuf(1);
      setzeZustand("gruppe"); start = performance.now();
      aktiv("gruppe");
      sage("<strong>Kurz gedrückt:</strong> Deine Gruppe wird gerufen.");
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
    var zeichnen = function (jetzt) {
      var notruf = zustand === "frist" || zustand === "lauf" || zustand === "fertig";
      // Wellen vom Chip: orange für die Gruppe, rot für den Notruf
      var staerke = hilfe > 0 ? (1 - abschnitt(hilfe, 0.14, 0.26)) : (gruppe > 0 && gruppe < 1 ? 1 - abschnitt(gruppe, 0.6, 1) : (zustand === "frist" ? 0.8 : 0));
      wellenGruppe.setAttribute("stroke", notruf ? "#ff2d2d" : "#ff5a1c");
      for (var k = 0; k < wellen.length; k++) {
        var phase = ohneBewegung ? 0.5 : ((jetzt / 1400 + k / 3) % 1);
        wellen[k].setAttribute("r", (20 + phase * 90).toFixed(1));
        wellen[k].setAttribute("opacity", (staerke * (1 - phase)).toFixed(2));
      }
      glut.setAttribute("opacity", (notruf ? 0.75 + 0.25 * Math.sin(jetzt / 260) : 0.55).toFixed(2));
      // Gruppe
      gwege[0].style.strokeDashoffset = 1 - abschnitt(gruppe, 0, 0.4);
      gwege[1].style.strokeDashoffset = 1 - abschnitt(gruppe, 0.05, 0.45);
      zittern.style.opacity = gruppe > 0.45 && gruppe < 1 ? 0.35 + 0.65 * Math.abs(Math.sin(jetzt / 45)) : 0;
      // Notruf: Funk zur Station, Antenne, Meldung, Fahrt, alle Stationen
      funk.style.strokeDashoffset = 1 - abschnitt(hilfe, 0.005, 0.07);
      funk.style.opacity = hilfe > 0.5 ? 0.35 : 1;
      stationen[0].classList.toggle("ist-an", hilfe >= 0.07);
      ping.style.opacity = puls(hilfe, 0.06, 0.18) + puls(hilfe, 0.14, 0.26) * 0.7;
      ping.setAttribute("r", (12 + 30 * ((hilfe * 8) % 1)).toFixed(1));
      var f0 = abschnitt(hilfe, 0.09, 0.22);
      felder[0].style.opacity = f0; felder[0].style.transform = "scale(" + f0 + ")";
      karte.classList.toggle("ist-an", hilfe > 0.15);
      var fahrt = abschnitt(hilfe, 0.3, 0.8);
      var weich = fahrt < 0.5 ? 2 * fahrt * fahrt : 1 - Math.pow(-2 * fahrt + 2, 2) / 2;
      var pkt = spur.getPointAtLength(weich * spurLaenge);
      ma.setAttribute("transform", "translate(" + pkt.x.toFixed(1) + " " + pkt.y.toFixed(1) + ")");
      spur.style.opacity = fahrt > 0 ? 0.7 : 0;
      for (var j = 1; j < felder.length; j++) {
        var e = abschnitt(hilfe, 0.84 + j * 0.025, 0.96 + j * 0.01);
        felder[j].style.opacity = e; felder[j].style.transform = "scale(" + e + ")";
        stationen[j].classList.toggle("ist-an", e > 0.5);
      }
      led.setAttribute("fill", notruf ? "#ff2d2d" : "#fff4ee");
    };

    var demoSichtbar = false, ruheGezeichnet = false;
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
        if (sek !== letzteSekunde && sek > 0) { letzteSekunde = sek; sage("<strong>Notruf in " + sek + " s.</strong> Noch einmal kurz drücken bricht ab."); }
        if (rest <= 0) {
          setzeZustand("lauf"); start = jetzt; ringAuf(1); aktiv("hilfe");
          sage("<strong>Notruf gesendet.</strong> Die Liftstation empfängt deinen Standort.");
        }
      } else if (zustand === "lauf") {
        hilfe = ohneBewegung ? 1 : klemme((jetzt - start) / LAUF);
        if (hilfe > 0.15 && stufe === "") { stufe = "meldung"; sage("<strong>Ein Mitarbeiter kommt zu Hilfe.</strong> Dein Chip vibriert zweimal."); }
        if (hilfe >= 1) {
          setzeZustand("fertig");
          sage("<strong>Hilfe ist da.</strong> Das war eine Vorführung, gesendet wurde nichts.");
          nochmal.hidden = false;
        }
      } else if (zustand === "gruppe") {
        gruppe = ohneBewegung ? 1 : klemme((jetzt - start) / GRUPPE);
        if (gruppe >= 1) { setzeZustand("ruhe"); gruppe = 1; }
      }
      // in Ruhe steht alles still, dann wird nichts neu gezeichnet
      if (zustand !== "ruhe" || ruheGezeichnet === false) { zeichnen(jetzt); ruheGezeichnet = zustand === "ruhe"; }
      requestAnimationFrame(takt);
    };
    aktiv("gruppe");
    zeichnen(0);
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

})();
