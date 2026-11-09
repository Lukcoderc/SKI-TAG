/* SkiTag · eigene Abläufe der Seite: Schneeflocken im Hang,
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
    // das Video im Einstieg: warten, bis das erste Bild da ist, höchstens 2,5 s
    var film = document.querySelector(".held__video");
    var bild = !film || film.readyState >= 2 ? Promise.resolve() : new Promise(function (fertig) {
      film.addEventListener("loadeddata", fertig, { once: true });
      film.addEventListener("error", fertig, { once: true });
      setTimeout(fertig, 2500);
    });
    var schrift = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([bild, schrift]).then(function () { requestAnimationFrame(function () { requestAnimationFrame(weg); }); });
    setTimeout(weg, 5000);
  }

  /* ----------------------------------------- Wechselndes Wort im Titel -- */
  /* „Ein Mietchip für [deine Gruppe]“ (seit Feedback 42 eigene Form statt Notions Pille): alle 2,6 s
     steigen die Buchstaben einzeln weich verschwommen nach oben weg, die neuen kommen nacheinander
     von unten und werden scharf, darunter zeichnet sich eine geschwungene Skispur in der Farbe des
     Worts. Der Platz ist immer so breit wie das längste Wort, damit sich die Zeile nie bewegt. */
  document.querySelectorAll(".wechsel").forEach(function (platz) {
    var woerter = (platz.getAttribute("data-woerter") || "").split("|");
    var wort = platz.querySelector(".wechsel__wort");
    if (!wort || woerter.length < 2) return;
    var setzeWort = function (text) {
      wort.textContent = "";
      Array.prototype.forEach.call(text, function (z, i) {
        var b = document.createElement("span");
        b.className = "wechsel__b"; b.style.setProperty("--n", i);
        b.textContent = z === " " ? "\u00a0" : z;
        wort.appendChild(b);
      });
    };
    var breiteSetzen = function () {
      var jetzt = wort.textContent.replace(/\u00a0/g, " "), max = 0;
      platz.style.width = "auto";
      woerter.forEach(function (w) { setzeWort(w); max = Math.max(max, platz.getBoundingClientRect().width); });
      setzeWort(jetzt);
      platz.style.width = Math.ceil(max) + "px";
    };
    setzeWort(wort.textContent);
    breiteSetzen();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(breiteSetzen);
    window.addEventListener("resize", breiteSetzen);
    if (ohneBewegung) return;
    var nr = 0, sichtbar = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; }).observe(platz);
    setInterval(function () {
      if (!sichtbar || document.hidden) return;
      platz.classList.add("ist-raus");
      setTimeout(function () {
        nr = (nr + 1) % woerter.length;
        platz.classList.add("ist-rein");
        setzeWort(woerter[nr]);
        platz.setAttribute("data-farbe", String(nr % 5));
        platz.classList.remove("ist-raus");
        requestAnimationFrame(function () { requestAnimationFrame(function () { platz.classList.remove("ist-rein"); }); });
      }, 420);
    }, 2600);
  });

  /* Die Kopfleiste steht seit Feedback 51 in kopfleiste.js. */

  /* ------------------------------------------ Video im Einstieg -- */
  /* Läuft als Schleife; bei weniger Bewegung steht es auf dem ersten Bild, außer Sicht ruht es */
  var heldFilm = document.querySelector(".held__video");
  if (heldFilm) {
    if (ohneBewegung) { heldFilm.removeAttribute("autoplay"); heldFilm.pause(); }
    else if ("IntersectionObserver" in window) new IntersectionObserver(function (e) {
      if (wurzel.classList.contains("sparsam-video")) return;
      if (e[0].isIntersecting) { var p = heldFilm.play(); if (p && p.catch) p.catch(function () {}); } else heldFilm.pause();
    }).observe(heldFilm);
  }

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
     allein nicht. Danach läuft die Meldung von selbst: Liftstation empfängt,
     Mitarbeiter kommt, Hilfe ist da. Seit Feedback 63 steht hier der Chip in 3D
     (chip-3d.js): er liest den Zustand aus window.skitagChip und ruft druecken/
     loslassen, wenn man direkt auf seinen Knopf drückt. */
  var akt = document.getElementById("der-chip");
  var knopf = akt && akt.querySelector(".haltknopf");
  if (knopf) {
    var chip = window.skitagChip = window.skitagChip || { zustand: "ruhe", ring: 0, gruppe: 0, hilfe: 0 };
    var status = document.getElementById("knopf-status");
    var nochmal = akt.querySelector('[data-aktion="nochmal"]');
    var schritte = akt.querySelectorAll(".knopf__schritte li");
    var bildFlaeche = akt.querySelector(".knopf__bild");
    var meldung = akt.querySelector(".kn-meldung");
    var meldungZeilen = meldung ? meldung.querySelectorAll(".kn-meldung__weg li") : [];
    var meldungBalken = meldung ? meldung.querySelector(".kn-meldung__balken i") : null;

    // In der Vorführung verkürzt; am echten Chip 3 s halten und 5 s Frist.
    var HALTEN = 1000, FRIST = 2000, LAUF = 8000, GRUPPE = 2400;
    var taktLaeuft = false, zustand = "ruhe", start = 0, hilfe = 0, gruppe = 0, letzteSekunde = -1, stufe = "";
    var START_TEXT = "Probier es aus: kurz drücken oder halten.";

    // Halte-Knopf nach „HoldButton“ (React Bits): --hb-p ist der Füllstand 0 bis 1, die Welle
    // braucht Breite und Höhe des Knopfs, die Aufschrift wechselt mit dem Zustand
    var knopfTexte = knopf.querySelectorAll(".haltknopf__text");
    var AUFSCHRIFT = { ruhe: "Kurz drücken oder halten", halten: "Weiter halten …", frist: "Nochmal drücken bricht ab",
      lauf: "Notruf gesendet", fertig: "Hilfe ist da", gruppe: "Gruppe gerufen" };
    var fuellen = function (p) { knopf.style.setProperty("--hb-p", klemme(p).toFixed(4)); };
    var knopfMessen = function () { knopf.style.setProperty("--hb-w", knopf.offsetWidth + "px"); knopf.style.setProperty("--hb-h", knopf.offsetHeight + "px"); };
    knopfMessen();
    if (window.ResizeObserver) new ResizeObserver(knopfMessen).observe(knopf);
    var setzeZustand = function (z) {
      zustand = z; chip.zustand = z; knopf.setAttribute("data-zustand", z); akt.setAttribute("data-zustand", z);
      var t = AUFSCHRIFT[z] || AUFSCHRIFT.ruhe;
      knopfTexte.forEach(function (el) { el.textContent = t; });
    };
    var ringAuf = function (rest) { chip.ring = 1 - rest; fuellen(1 - rest); };
    var sage = function (t) { status.innerHTML = t; };
    var aktiv = function (name) { schritte.forEach(function (li) { li.classList.toggle("ist-aktiv", li.getAttribute("data-schritt") === name); }); };

    var zuruecksetzen = function () {
      setzeZustand("ruhe"); hilfe = 0; gruppe = 0; stufe = ""; chip.hilfe = 0; chip.gruppe = 0;
      ringAuf(1); nochmal.hidden = true; aktiv("gruppe");
      sage(START_TEXT); zeichnen();
    };
    var abbrechen = function () {
      zuruecksetzen();
      sage("<strong>Abgebrochen.</strong> Der zweite Druck hat den Notruf gestoppt.");
    };
    var druecken = function () {
      if (zustand === "frist") { abbrechen(); return; }
      if (zustand === "lauf") return;
      hilfe = 0; gruppe = 0; stufe = ""; chip.hilfe = 0; chip.gruppe = 0; nochmal.hidden = true;
      setzeZustand("halten"); start = performance.now(); letzteSekunde = -1;
      aktiv("halten");
      sage("Weiter halten für einen Notruf, oder loslassen für die Gruppe.");
      anstossen();
    };
    var loslassen = function () {
      if (zustand !== "halten") return;
      // lange genug gehalten, auch wenn seit dem Drücken kaum ein Bild gezeichnet wurde
      if (performance.now() - start >= HALTEN) { setzeZustand("frist"); start += HALTEN; aktiv("halten"); return; }
      ringAuf(1);
      setzeZustand("gruppe"); start = performance.now();
      aktiv("gruppe");
      sage("<strong>Kurz gedrückt:</strong> Deine Gruppe wird gerufen. Ihre Chips vibrieren.");
    };
    chip.druecken = druecken; chip.loslassen = loslassen;

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

    // Wellen, Gruppe und Meldung um den Chip
    var zeichnen = function () {
      bildFlaeche.style.setProperty("--gruppe", gruppe.toFixed(3));
      if (!meldung) return;
      meldung.classList.toggle("ist-an", zustand === "lauf" || zustand === "fertig");
      meldung.classList.toggle("ist-fertig", zustand === "fertig");
      meldungZeilen.forEach(function (li) { li.classList.toggle("ist-an", hilfe >= parseFloat(li.getAttribute("data-ab")) && (zustand === "lauf" || zustand === "fertig")); });
      if (meldungBalken) meldungBalken.style.transform = "scaleX(" + hilfe.toFixed(3) + ")";
    };

    var anstossen = function () { if (!taktLaeuft) { taktLaeuft = true; requestAnimationFrame(takt); } };
    var takt = function (jetzt) {
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
        hilfe = ohneBewegung ? 1 : klemme((jetzt - start) / LAUF); chip.hilfe = hilfe;
        if (hilfe > 0.15 && stufe === "") { stufe = "meldung"; sage("<strong>Ein Mitarbeiter kommt zu Hilfe.</strong> Dein Chip vibriert zweimal."); }
        if (hilfe >= 1) {
          setzeZustand("fertig");
          sage("<strong>Hilfe ist da.</strong> Das war eine Vorführung, gesendet wurde nichts.");
          nochmal.hidden = false;
        }
      } else if (zustand === "gruppe") {
        gruppe = ohneBewegung ? 1 : klemme((jetzt - start) / GRUPPE); chip.gruppe = gruppe;
        // kurzer Druck: der Knopf füllt sich schnell orange und leert sich wieder
        fuellen(gruppe < 0.2 ? gruppe / 0.2 : gruppe > 0.75 ? (1 - gruppe) / 0.25 : 1);
        if (gruppe >= 1) { setzeZustand("ruhe"); gruppe = 0; chip.gruppe = 0; }
      }
      zeichnen();
      // in Ruhe und nach der Hilfe steht alles still
      if (zustand !== "ruhe" && zustand !== "fertig") requestAnimationFrame(takt); else taktLaeuft = false;
    };
    setzeZustand("ruhe");
    aktiv("gruppe");
    zeichnen();
  }

  /* --------------------------------------------- Die App im iPhone -- */
  /* Kurzfassung seit Feedback 56 (vorher eine gepinnte Strecke mit vier ausführlichen Schritten):
     Die Marken Familien, Skischulen, Alle auf der Piste, Neu im Skigebiet schalten den Bildschirm
     im iPhone um. Solange der Abschnitt zu sehen ist und niemand mit den Marken arbeitet, wechselt
     er alle 4 s von selbst zur nächsten Marke; bei „weniger Bewegung“ nur auf Klick. */
  var appAkt = document.getElementById("app");
  var appMarken = appAkt ? appAkt.querySelectorAll(".app-akt__fuer button") : [];
  if (appAkt && appMarken.length) {
    var app = appAkt.querySelector(".app");
    var appNr = 0, appSichtbar = false, appRuht = false, appUhr = 0;
    var appZeigen = function (nr) {
      appNr = nr;
      app.setAttribute("data-bild", appMarken[nr].getAttribute("data-bild"));
      appMarken.forEach(function (m, i) { m.setAttribute("aria-pressed", i === nr ? "true" : "false"); });
    };
    var appWeiter = function () {
      clearTimeout(appUhr);
      if (ohneBewegung || !appSichtbar || appRuht) return;
      appUhr = setTimeout(function () {
        if (!document.hidden) appZeigen((appNr + 1) % appMarken.length);
        appWeiter();
      }, 4000);
    };
    appMarken.forEach(function (m, i) {
      m.addEventListener("click", function () { appZeigen(i); appWeiter(); });
    });
    var appLinks = appAkt.querySelector(".app-akt__fuer");
    appLinks.addEventListener("pointerenter", function () { appRuht = true; clearTimeout(appUhr); });
    appLinks.addEventListener("pointerleave", function () { appRuht = false; appWeiter(); });
    appLinks.addEventListener("focusin", function () { appRuht = true; clearTimeout(appUhr); });
    appLinks.addEventListener("focusout", function () { appRuht = false; appWeiter(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { appSichtbar = e[0].isIntersecting; appWeiter(); }, { threshold: 0.35 }).observe(appAkt);
    }
    appZeigen(0);
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
    document.querySelectorAll(".held, .gebaut, .gebirge, .schluss").forEach(function (el) { ruhen.observe(el); });
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
