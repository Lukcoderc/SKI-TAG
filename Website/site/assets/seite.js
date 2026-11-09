/* SkiTag · eigene Abläufe der Seite: Kopfleiste, Schneeflocken im Hang,
   der Halte-Knopf mit der Zeichnung des Notrufwegs.
   Die Engine (scrollcraft.js) bleibt unverändert. */
(function () {
  "use strict";
  var ohneBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var abschnitt = function (x, von, bis) { return klemme((x - von) / (bis - von)); };
  var wurzel = document.documentElement;
  var sparsam = function () { return wurzel.classList.contains("sparsam"); };

  /* --------------------------------------------------- Ladebildschirm -- */
  /* Weg, sobald die Schriften und das Bild des Einstiegs da sind, spätestens nach 5 s. */
  var lade = document.querySelector(".lade");
  if (lade) {
    var weg = function () {
      if (lade.classList.contains("ist-fertig")) return;
      lade.classList.add("ist-fertig");
      setTimeout(function () { lade.remove(); }, 600);
    };
    var poster = document.querySelector(".hang .sc-stage__poster");
    var bild = !poster || poster.complete ? Promise.resolve() : new Promise(function (fertig) {
      poster.addEventListener("load", fertig, { once: true });
      poster.addEventListener("error", fertig, { once: true });
    });
    var schrift = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([bild, schrift]).then(function () { requestAnimationFrame(function () { requestAnimationFrame(weg); }); });
    setTimeout(weg, 5000);
  }

  /* ------------------------------------------------------- Kopfleiste -- */
  var leiste = document.querySelector(".leiste");
  var hang = document.querySelector(".hang");
  function leisteSetzen() {
    var grenze = hang ? hang.offsetHeight - window.innerHeight * 1.1 : 200;
    leiste.classList.toggle("ist-unten", window.scrollY > grenze);
  }
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
    var laeuft = false;
    new IntersectionObserver(function (e) {
      sichtbar = e[0].isIntersecting;
      if (sichtbar && !laeuft) { laeuft = true; requestAnimationFrame(schneien); }
    }).observe(leinwand);
    var schneien = function () {
      if (!sichtbar || sparsam()) { laeuft = false; return; }
      {
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
    var spuren = akt.querySelectorAll(".netz__spuren");
    var paket = akt.querySelector(".netz__paket");
    var maSchild = ma.querySelectorAll(".netz__etikett");
    var spurLaenge = spur.getTotalLength();
    var funkLaenge = funk.getTotalLength();
    // Sessellift und Fahrer im Hintergrund laufen als SMIL; bei wenig Bewegung stehen sie
    var bewegtBild = akt.querySelector(".netz__bewegt");
    if (ohneBewegung && bewegtBild && bewegtBild.pauseAnimations) bewegtBild.pauseAnimations();

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
      var funkWeg = abschnitt(hilfe, 0.005, 0.07);
      funk.style.strokeDashoffset = 1 - funkWeg;
      funk.style.opacity = hilfe > 0.5 ? 0.35 : 1;
      // ein leuchtender Punkt läuft dem roten Weg voraus
      var pp = funk.getPointAtLength(funkWeg * funkLaenge);
      paket.setAttribute("cx", pp.x.toFixed(1)); paket.setAttribute("cy", pp.y.toFixed(1));
      paket.setAttribute("opacity", (hilfe > 0 && hilfe < 0.1 ? 1 - abschnitt(hilfe, 0.07, 0.1) : 0).toFixed(2));
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
      // unterwegs fährt er in der Hocke, davor und danach steht er; hinter ihm bleibt die Skispur
      ma.classList.toggle("faehrt", fahrt > 0 && fahrt < 1);
      spuren.forEach(function (p) { p.style.strokeDashoffset = 1 - weich; });
      var schild = (1 - abschnitt(fahrt, 0.7, 0.95)).toFixed(2);
      maSchild.forEach(function (el) { el.style.opacity = schild; });
      for (var j = 1; j < felder.length; j++) {
        var e = abschnitt(hilfe, 0.84 + j * 0.025, 0.96 + j * 0.01);
        felder[j].style.opacity = e; felder[j].style.transform = "scale(" + e + ")";
        stationen[j].classList.toggle("ist-an", e > 0.5);
      }
      led.setAttribute("fill", notruf ? "#ff2d2d" : "#fff4ee");
    };

    var demoSichtbar = false, ruheGezeichnet = false;
    var hintergrund = function () {
      if (!bewegtBild || !bewegtBild.pauseAnimations || ohneBewegung) return;
      if (demoSichtbar && !sparsam()) bewegtBild.unpauseAnimations(); else bewegtBild.pauseAnimations();
    };
    window.addEventListener("skitag-sparsam", hintergrund);
    new IntersectionObserver(function (e) { var war = demoSichtbar; demoSichtbar = e[0].isIntersecting; hintergrund(); if (demoSichtbar && !war) requestAnimationFrame(takt); }).observe(akt);
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
  var nachtFlaechen = document.querySelectorAll(".nacht, .fuss");
  function leisteNacht() {
    var unter = leiste.getBoundingClientRect().bottom / 2;
    var nacht = false;
    nachtFlaechen.forEach(function (n) { var r = n.getBoundingClientRect(); if (r.top <= unter && r.bottom >= unter) nacht = true; });
    leiste.classList.toggle("ist-nacht", nacht);
  }
  leisteNacht();
  // beide Kopfleisten-Prüfungen höchstens einmal je Bild, nicht bei jedem Scroll-Ereignis
  var leisteWartet = false;
  window.addEventListener("scroll", function () {
    if (leisteWartet) return;
    leisteWartet = true;
    requestAnimationFrame(function () { leisteWartet = false; leisteSetzen(); leisteNacht(); });
  }, { passive: true });

  /* --------------------------------------------- Die App im iPhone -- */
  /* Drei Bildschirme über die gepinnte Strecke: Route, Gruppe, Mein Tag. */
  var appAkt = document.getElementById("app");
  if (appAkt) {
    var app = appAkt.querySelector(".app");
    var appSchritte = appAkt.querySelectorAll(".app-akt__schritte li");
    var letztesBild = -1, appWartet = false;
    var appTakt = function () {
      appWartet = false;
      var p = fortschritt(appAkt);
      var nr = p < 0.36 ? 0 : p < 0.68 ? 1 : 2;
      if (nr !== letztesBild) {
        letztesBild = nr;
        app.setAttribute("data-bild", String(nr));
        appSchritte.forEach(function (li, i) { li.classList.toggle("ist-aktiv", i === nr); });
      }
    };
    // die Engine setzt --sc-p in ihrem eigenen Bild davor, darum hier ein Bild später lesen
    window.addEventListener("scroll", function () { if (!appWartet) { appWartet = true; requestAnimationFrame(appTakt); } }, { passive: true });
    requestAnimationFrame(appTakt);
    appSchritte.forEach(function (li, i) {
      li.addEventListener("click", function () {
        var oben = appAkt.getBoundingClientRect().top + window.scrollY;
        var strecke = appAkt.offsetHeight - window.innerHeight;
        window.scrollTo({ top: oben + strecke * [0.18, 0.52, 0.84][i], behavior: ohneBewegung ? "auto" : "smooth" });
      });
    });
  }

  /* ------------------- Gebirge über dem Schluss, Schriftzug im Fuß -- */
  /* Beide kommen einmal hoch, sobald ein Teil davon sichtbar ist:
     die Berge ab einem Viertel, die Buchstaben ab einem Drittel. */
  var einmal = function (el, schwelle) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.classList.add("ist-da"); return; }
    var beob = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { el.classList.add("ist-da"); beob.disconnect(); }
    }, { threshold: schwelle });
    beob.observe(el);
  };
  einmal(document.querySelector(".gebirge"), 0.25);
  einmal(document.querySelector(".fuss__wort"), 0.35);

  /* -------------------------------- Zier-Animationen ruhen außer Sicht -- */
  /* .ist-weg hält die endlosen CSS-Animationen an (Tag im Einstieg, Kacheln, Gebirge, Schluss). */
  if ("IntersectionObserver" in window) {
    var ruhen = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { e.target.classList.toggle("ist-weg", !e.isIntersecting); });
    });
    document.querySelectorAll(".hang, .gebaut, .gebirge, .schluss").forEach(function (el) { ruhen.observe(el); });
  }

  /* --------------------------------------------- Ruckeln erkennen -- */
  /* Liegt beim Scrollen die Hälfte der Bilder über 26 ms (unter etwa 38 Bildern je
     Sekunde), wechselt die Seite in den Sparmodus und merkt sich das für den nächsten
     Besuch (dann auch ohne Video im Einstieg). */
  if (!sparsam() && !ohneBewegung) {
    var proben = [], vorher = 0, misst = false, bis = 0;
    var auswerten = function () {
      if (proben.length < 40) return;
      var s = proben.slice().sort(function (a, b) { return a - b; });
      if (s[Math.floor(s.length / 2)] > 26) {
        wurzel.classList.add("sparsam");
        try { localStorage.setItem("skitag-sparsam", "1"); } catch (e) {}
        window.dispatchEvent(new Event("skitag-sparsam"));
        proben = null;
      } else if (proben.length > 400) proben = null;
    };
    var messen = function (t) {
      if (vorher && proben) proben.push(t - vorher);
      vorher = t;
      if (proben && performance.now() < bis) requestAnimationFrame(messen);
      else { misst = false; vorher = 0; if (proben) auswerten(); }
    };
    window.addEventListener("scroll", function () {
      if (!proben || document.hidden) return;
      bis = performance.now() + 250;
      if (!misst) { misst = true; requestAnimationFrame(messen); }
    }, { passive: true });
  }

  /* ---------------------------------- Fortschritt der Scroll-Animationen -- */
  /* Solange eine gepinnte Strecke den Bildschirm hält, zeigt der Balken ihren
     Fortschritt (--sc-p der Engine, 0 bis 1). Danach blendet er aus. */
  var balken = document.querySelector(".akt-balken");
  var akte = document.querySelectorAll('[data-sc-act="pin"], [data-sc-act="scrub"]');
  var balkenWartet = false;
  function balkenSetzen() {
    balkenWartet = false;
    var h = window.innerHeight, an = null;
    akte.forEach(function (a) { var r = a.getBoundingClientRect(); if (r.top <= h * 0.1 && r.bottom >= h * 0.9) an = a; });
    balken.classList.toggle("ist-an", !!an);
    if (!an) return;
    balken.classList.toggle("ist-nacht", an.classList.contains("nacht"));
    balken.firstElementChild.style.transform = "scaleX(" + fortschritt(an).toFixed(4) + ")";
  }
  if (balken && akte.length) {
    window.addEventListener("scroll", function () { if (!balkenWartet) { balkenWartet = true; requestAnimationFrame(balkenSetzen); } }, { passive: true });
    window.addEventListener("resize", balkenSetzen);
    requestAnimationFrame(balkenSetzen);
  }

})();
