/* SkiTag · eigene Abläufe der Seite: Ebenen im Einstieg, die Schritte in „Was ist SKITAG?“,
   die Vorführung am Knopf des Chips (Gruppe rufen, Notruf).
   Die Engine (scrollcraft.js) bleibt unverändert. */
(function () {
  "use strict";
  var ohneBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var abschnitt = function (x, von, bis) { return klemme((x - von) / (bis - von)); };
  var wurzel = document.documentElement;
  var sparsam = function () { return wurzel.classList.contains("sparsam"); };

  /* --------------------------------------------------- Ladebildschirm -- */
  /* Weg, sobald die Schriften (und auf der Startseite der 3D-Chip) da sind, spätestens nach 5 s.
     Lädt der 3D-Chip gar nicht, zeigt die Seite nach 6 s doch das Standbild. */
  setTimeout(function () { if (!wurzel.classList.contains("chip3d-an")) wurzel.classList.remove("chip3d-warte"); }, 6000);
  var lade = document.querySelector(".lade");
  if (lade) {
    var weg = function () {
      if (lade.classList.contains("ist-fertig")) return;
      lade.classList.add("ist-fertig");
      setTimeout(function () { lade.remove(); }, 600);
    };
    var schrift = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    // auf der Startseite auch auf den 3D-Chip warten, höchstens 3 s, damit er nicht nach dem Ladebildschirm aufpoppt
    var chipBereit = !document.querySelector(".held__chip") ? Promise.resolve() : new Promise(function (fertig) {
      window.addEventListener("skitag-chip-bereit", fertig, { once: true });
      setTimeout(fertig, 3000);
    });
    Promise.all([schrift, chipBereit]).then(function () { requestAnimationFrame(function () { requestAnimationFrame(weg); }); });
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

  /* --------------------------------- Einstieg: Ebenen folgen Zeiger und Scrollen -- */
  /* Sonne und drei Bergebenen liegen hintereinander und werden verschieden weit verschoben. Gesetzt wird
     direkt transform auf den Ebenen (eigene Ebenen im Browser, kein Neuzeichnen), und nur, wenn sich der
     Wert merklich ändert. Läuft nur, solange der Einstieg zu sehen ist. */
  var held = document.querySelector(".held");
  if (held && !ohneBewegung) {
    var hx = 0, hy = 0, hxS = 0, hyS = 0, syAlt = -1, heldDa = false, heldLaeuft = false;
    // Feedback 116: die Schleife läuft nur, solange sich etwas bewegt (Zeiger, Scrollen, Nachgleiten), sonst ruht sie
    var anstossen = function () { if (heldDa && !heldLaeuft) { heldLaeuft = true; requestAnimationFrame(heldTakt); } };
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      hx = e.clientX / window.innerWidth - 0.5; hy = e.clientY / window.innerHeight - 0.5;
      anstossen();
    }, { passive: true });
    window.addEventListener("scroll", function () { anstossen(); }, { passive: true });
    // [Element, Weg je Zeiger x, je Zeiger y, je Scrollen] in Pixeln. Im Sparmodus bleibt das Video stehen (spart
    // auf schwachen Grafikkarten das Verschieben einer großen Videofläche in jedem Bild).
    var heldEbenen = [[".held__wort", 8, 6, -24], [".held__film", 0, 0, 110], [".held__sonne", -14, -10, 50], [".held__lage--fern", -10, -5, 90], [".held__lage--mitte", -20, -9, 45], [".held__lage--nah", -34, -12, 0]]
      .map(function (e) { return { el: held.querySelector(e[0]), x: e[1], y: e[2], s: e[3], alt: "" }; })
      .filter(function (e) { return e.el; });
    var heldHoehe = held.offsetHeight;
    window.addEventListener("resize", function () { heldHoehe = held.offsetHeight; anstossen(); });
    var heldTakt = function () {
      if (!heldDa) { heldLaeuft = false; return; }
      hxS += (hx - hxS) * 0.06; hyS += (hy - hyS) * 0.06;
      var sy = klemme(window.scrollY / Math.max(1, heldHoehe)), spar = sparsam();
      heldEbenen.forEach(function (e) {
        if (spar && e.s === 110) { if (e.alt) { e.el.style.transform = ""; e.alt = ""; } return; }
        var t = "translate3d(" + (hxS * e.x).toFixed(1) + "px," + (hyS * e.y + sy * e.s).toFixed(1) + "px,0)";
        if (t !== e.alt) { e.el.style.transform = t; e.alt = t; }
      });
      var ruht = Math.abs(hx - hxS) < 0.0008 && Math.abs(hy - hyS) < 0.0008 && sy === syAlt;
      syAlt = sy;
      if (ruht) { heldLaeuft = false; return; }
      requestAnimationFrame(heldTakt);
    };
    new IntersectionObserver(function (e) {
      heldDa = e[0].isIntersecting;
      anstossen();
    }).observe(held);
  }
  /* Bergvideo im Einstieg (Feedback 103): läuft nur, solange der Einstieg zu sehen ist */
  var heldFilm = document.getElementById("held-film");
  if (heldFilm && heldFilm.autoplay && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { var p = heldFilm.play(); if (p && p.catch) p.catch(function () {}); }
      else heldFilm.pause();
    }).observe(heldFilm);
  }

  /* Gemeinsamer Zustand für den Chip in 3D (chip-3d.js liest ihn in jedem Bild) */
  var chip = window.skitagChip = window.skitagChip || {};
  chip.zustand = "ruhe"; chip.ring = 0; chip.sek = 0; chip.gruppe = 0; chip.hilfe = 0;
  chip.blick = { schritt: 0, halten: 0, spielt: false, start: 0 };

  /* ------------------------------------ Was ist SKITAG?: drei Schritte -- */
  /* Die gepinnte Strecke ist in drei gleich lange Teile geteilt: kurz drücken, drei Sekunden halten, Funk.
     Feedback 83: alle drei laufen im selben Takt mit dem Scrollen. In jedem Drittel läuft die Animation von
     5 % bis 70 % und bleibt danach stehen, damit man sie lesen kann (TAKT_AN, TAKT_AUS).
     data-schritt schaltet Text und Fläche; --zl ist der Stand von „Gruppe rufen“ (0 bis 0,68 der früheren
     4,2-s-Schleife, seite.css und chip-3d.js lesen ihn), --halten füllt den Ring im zweiten Schritt. */
  /* Am Handy (.ist-klick, Feedback 88) wird nicht gescrollt: drei Knöpfe wählen den Schritt, er spielt dann in
     KLICK_DAUER ab (gleicher Takt), sobald der Abschnitt mitten im Bild steht. bz.p ist der Stand für chip-3d.js. */
  var TAKT_AN = 0.05, TAKT_AUS = 0.7, GRUPPE_ENDE = 0.68, KLICK_DAUER = 3600;
  var blick = document.getElementById("blick");
  if (blick && blick.querySelector(".blick__chip")) {
    var bz = chip.blick, blickDa = false, blickLaeuft = false;
    bz.klick = blick.classList.contains("ist-klick"); bz.wahl = 0; bz.wahlStart = 0; bz.zentriert = false;
    if (bz.klick) {
      var namen = ["Kurz drücken", "Drei Sekunden", "Ohne Netz"];
      var wahl = document.createElement("div");
      wahl.className = "blick__wahl"; wahl.setAttribute("role", "tablist"); wahl.setAttribute("aria-label", "Was der Knopf kann");
      var wahlKnoepfe = namen.map(function (name, i) {
        var b = document.createElement("button");
        b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", i === 0 ? "true" : "false");
        b.innerHTML = "<span>0" + (i + 1) + "</span>" + name;
        b.addEventListener("click", function () {
          bz.wahl = i; bz.wahlStart = performance.now();
          if (bz.spielt) { bz.spielt = false; blick.removeAttribute("data-spielt"); void blick.offsetWidth; }
          wahlKnoepfe.forEach(function (k, j) { k.setAttribute("aria-selected", j === i ? "true" : "false"); });
          if (blickDa && !blickLaeuft) { blickLaeuft = true; requestAnimationFrame(blickTakt); }
        });
        wahl.appendChild(b);
        return b;
      });
      var liste = blick.querySelector(".blick__schritte");
      liste.parentNode.insertBefore(wahl, liste);
    }
    var blickTakt = function () {
      if (!blickDa) { blickLaeuft = false; return; }
      var r = blick.getBoundingClientRect(), vh = window.innerHeight, p;
      if (bz.klick) {
        // läuft erst, wenn der Abschnitt mitten im Bild steht; kommt er neu dorthin, beginnt der Schritt von vorn
        var zentriert = r.top < vh * 0.35 && r.bottom > vh * 0.65;
        if (zentriert && !bz.zentriert) bz.wahlStart = performance.now();
        bz.zentriert = zentriert;
        var roh = zentriert ? klemme((performance.now() - bz.wahlStart) / KLICK_DAUER) : 0;
        p = (bz.wahl + roh * 0.999) / 3;
      } else p = klemme(-r.top / Math.max(1, r.height - vh));
      bz.p = p;
      var sb = p < 1 / 3 ? 0 : p < 2 / 3 ? 1 : 2;
      var innen = abschnitt((p - sb / 3) * 3, TAKT_AN, TAKT_AUS);   // Stand der Animation im laufenden Drittel
      if (sb !== bz.schritt) { bz.schritt = sb; blick.setAttribute("data-schritt", String(sb)); }
      var spielt = sb === 0 && (bz.klick ? bz.zentriert : r.top <= vh * 0.04 && r.bottom >= vh);
      if (spielt !== bz.spielt) { bz.spielt = spielt; blick.toggleAttribute("data-spielt", spielt); }
      // Feedback 89: am Handy laufen die CSS-Animationen von „Gruppe rufen“ von selbst (einmal, bis 68 %), statt in
      // jedem Bild über --zl gestellt zu werden; bz.zl folgt derselben Uhr, damit die Gruppe in 3D im Takt vibriert.
      var zl = !bz.klick ? (sb === 0 ? innen * GRUPPE_ENDE : GRUPPE_ENDE)
        : sb === 0 ? (bz.zentriert ? Math.min(GRUPPE_ENDE, (performance.now() - bz.wahlStart) / 4200) : 0) : GRUPPE_ENDE;
      if (Math.abs(zl - (bz.zl || 0)) > 0.0005) { bz.zl = zl; if (!bz.klick) blick.style.setProperty("--zl", zl.toFixed(4)); }
      // der Ring füllt sich im gleichen Takt; danach bleibt „Notruf gesendet“ stehen, auch im dritten Schritt
      var h = sb === 1 ? innen : sb === 2 ? 1 : 0;
      if (Math.abs(h - bz.halten) > 0.002 || (h === 1) !== blick.hasAttribute("data-voll")) {
        bz.halten = h;
        var hc = bz.klick ? (Math.round(h * 20) / 20).toFixed(2) : h.toFixed(3);
        if (hc !== bz.haltenCss) { bz.haltenCss = hc; blick.style.setProperty("--halten", hc); }
        var sek = String(Math.min(3, Math.max(1, Math.ceil(h * 3))));
        if (blick.getAttribute("data-sek") !== sek) blick.setAttribute("data-sek", sek);
        blick.toggleAttribute("data-voll", h >= 1);
      }
      requestAnimationFrame(blickTakt);
    };
    new IntersectionObserver(function (e) {
      blickDa = e[0].isIntersecting;
      if (blickDa && !blickLaeuft) { blickLaeuft = true; requestAnimationFrame(blickTakt); }
    }).observe(blick);
  }

  /* ------------------------------------------- Der Chip (Vorführung) -- */
  /* Es gibt nur den Knopf am Chip selbst (.chip-knopf liegt genau über dem Knopf des 3D-Chips).
     Kurz drücken ruft die Gruppe. Drei Sekunden halten startet den Notruf, danach läuft die Frist:
     wie am echten Chip bricht ein weiterer Druck ab, Loslassen allein nicht. Danach läuft der Weg
     der Hilfe von selbst: Liftstation empfängt, Mitarbeiter fährt los, Hilfe ist da.
     chip-3d.js liest den Zustand aus window.skitagChip (Ring, Sekunde, Fortschritt). */
  var akt = document.getElementById("der-chip");
  var knopf = akt && akt.querySelector(".chip-knopf");
  if (knopf) {
    var status = document.getElementById("knopf-status");
    var nochmal = akt.querySelector('[data-aktion="nochmal"]');
    var schritte = akt.querySelectorAll(".knopf__schritte li");
    var wegPunkte = akt.querySelectorAll(".kn-weg li");
    var wegTitel = akt.querySelector(".kn-weg__titel");
    var wegLinie = akt.querySelector(".kn-weg ol"), hilfeCss = "";

    // In der Vorführung verkürzt: Halten 1,2 s (echt 3 s, Feedback 72), Abbrechen 3 s (echt 5 s, Feedback 77).
    var HALTEN = 1200, FRIST = 3000, LAUF = 7000, GRUPPE = 4600;
    var taktLaeuft = false, zustand = "ruhe", start = 0, hilfe = 0, gruppe = 0, letzteSekunde = -1, stufe = "";
    var START_TEXT = "Probier es aus: Drück den Knopf am Chip. Kurz für die Gruppe, gedrückt halten für den Notruf.";

    var setzeZustand = function (z) { zustand = z; chip.zustand = z; akt.setAttribute("data-zustand", z); };
    // Ring: beim Halten 0 bis 1, in der Frist 1 bis 0. --ring füllt den Ring ohne WebGL.
    // Feedback 89: nicht mehr an den ganzen Abschnitt (sonst rechnet der Browser jedes Bild alle Stile darin neu)
    var ringEl = akt.querySelector(".chip-knopf__ring"), ringCss = "";
    var ringAuf = function (voll) {
      chip.ring = voll;
      if (!ringEl || wurzel.classList.contains("chip3d-an")) return;   // mit 3D zeichnet chip-3d.js den Ring
      var v = voll.toFixed(3); if (v !== ringCss) { ringCss = v; ringEl.style.setProperty("--ring", v); }
    };
    var sage = function (t) { status.innerHTML = t; };
    var aktiv = function (name) { schritte.forEach(function (li) { li.classList.toggle("ist-aktiv", li.getAttribute("data-schritt") === name); }); };
    // Weg der Hilfe: Punkte schalten nacheinander an, die Linie füllt sich mit --hilfe
    var zeichnen = function () {
      var an = zustand === "lauf" || zustand === "fertig";
      wegPunkte.forEach(function (li) { li.classList.toggle("ist-an", an && hilfe >= parseFloat(li.getAttribute("data-ab"))); });
      var hv = (an ? hilfe : 0).toFixed(3);
      if (wegLinie && hv !== hilfeCss) { hilfeCss = hv; wegLinie.style.setProperty("--hilfe", hv); }
      var titel = zustand === "fertig" ? "Hilfe ist da" : "Notruf gesendet";
      if (wegTitel && wegTitel.textContent !== titel) wegTitel.textContent = titel;
    };

    var zuruecksetzen = function () {
      setzeZustand("ruhe"); hilfe = 0; gruppe = 0; stufe = ""; chip.hilfe = 0; chip.gruppe = 0; chip.sek = 0;
      ringAuf(0); nochmal.hidden = true; aktiv("gruppe");
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
      ringAuf(0); zeichnen();
      aktiv("halten");
      sage("<strong>Weiter halten.</strong> Loslassen ruft nur deine Gruppe.");
      anstossen();
    };
    var loslassen = function () {
      if (zustand !== "halten") return;
      // lange genug gehalten, auch wenn seit dem Drücken kaum ein Bild gezeichnet wurde
      if (performance.now() - start >= HALTEN) { setzeZustand("frist"); start += HALTEN; chip.sek = 3; aktiv("halten"); return; }
      ringAuf(0); chip.sek = 0;
      setzeZustand("gruppe"); start = performance.now();
      aktiv("gruppe");
      sage("<strong>Kurz gedrückt.</strong> Die Chips deiner Gruppe vibrieren, die App zeigt ihnen, wo du bist.");
    };
    chip.druecken = druecken; chip.loslassen = loslassen;

    knopf.addEventListener("pointerdown", function (e) { e.preventDefault(); knopf.focus({ preventScroll: true }); if (knopf.setPointerCapture) { try { knopf.setPointerCapture(e.pointerId); } catch (_) {} } druecken(); });
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
    nochmal.addEventListener("click", function () { zuruecksetzen(); knopf.focus({ preventScroll: true }); });

    var anstossen = function () { if (!taktLaeuft) { taktLaeuft = true; requestAnimationFrame(takt); } };
    var takt = function (jetzt) {
      if (zustand === "halten") {
        var t = klemme((jetzt - start) / HALTEN);
        ringAuf(t);
        var s = Math.max(1, Math.ceil((1 - t) * 3));
        if (s !== chip.sek) chip.sek = s;
        if (t >= 1) { setzeZustand("frist"); start = jetzt; letzteSekunde = -1; }
      } else if (zustand === "frist") {
        var rest = FRIST - (jetzt - start);
        ringAuf(klemme(rest / FRIST));
        var sek = Math.ceil(rest / 1000);
        chip.sek = Math.max(0, sek);
        if (sek !== letzteSekunde && sek > 0) { letzteSekunde = sek; sage("<strong>Notruf in " + sek + " s.</strong> Noch einmal kurz drücken bricht ab."); }
        if (rest <= 0) {
          setzeZustand("lauf"); start = jetzt; ringAuf(0); chip.sek = 0; aktiv("hilfe");
          sage("<strong>Notruf gesendet.</strong> Die Liftstation empfängt deinen Standort.");
        }
      } else if (zustand === "lauf") {
        hilfe = ohneBewegung ? 1 : klemme((jetzt - start) / LAUF); chip.hilfe = hilfe;
        if (hilfe > 0.3 && stufe === "") { stufe = "meldung"; sage("<strong>Ein Mitarbeiter fährt los.</strong> Dein Chip vibriert zweimal."); }
        if (hilfe >= 1) {
          setzeZustand("fertig");
          sage("<strong>Hilfe ist da.</strong> Das war eine Vorführung, gesendet wurde nichts.");
          nochmal.hidden = false;
        }
      } else if (zustand === "gruppe") {
        gruppe = klemme((jetzt - start) / GRUPPE); chip.gruppe = gruppe;
        if (gruppe >= 1) { setzeZustand("ruhe"); gruppe = 0; chip.gruppe = 0; sage(START_TEXT); }
      }
      zeichnen();
      // in Ruhe und nach der Hilfe steht alles still
      if (zustand !== "ruhe" && zustand !== "fertig") requestAnimationFrame(takt); else taktLaeuft = false;
    };
    setzeZustand("ruhe");
    aktiv("gruppe");
    zeichnen();
  }

  var fortschritt = function (el) { return parseFloat(el.style.getPropertyValue("--sc-p")) || 0; };

  /* --------------------------------------------- Die App im iPhone -- */
  /* Kurzfassung seit Feedback 56 (vorher eine gepinnte Strecke mit vier ausführlichen Schritten):
     Die Marken Familien, Skischulen, Alle auf der Piste, Neu im Skigebiet schalten den Bildschirm
     im iPhone um. Seit Feedback 69 nur noch auf Klick, kein Durchlauf von selbst. */
  var appAkt = document.getElementById("app");
  var appMarken = appAkt ? appAkt.querySelectorAll(".app-akt__fuer button") : [];
  if (appAkt && appMarken.length) {
    var app = appAkt.querySelector(".app");
    var appNr = 0;
    var appZeigen = function (nr) {
      appNr = nr;
      app.setAttribute("data-bild", appMarken[nr].getAttribute("data-bild"));
      appMarken.forEach(function (m, i) { m.setAttribute("aria-pressed", i === nr ? "true" : "false"); });
    };
    appMarken.forEach(function (m, i) {
      m.addEventListener("click", function () { appZeigen(i); });
    });
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
    document.querySelectorAll(".held, .gebaut, .gebirge, .schluss, .fragen, .ct").forEach(function (el) { ruhen.observe(el); });
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

  /* ------------------------------------------ Gut zu wissen (Liste) -- */
  /* Seit Feedback 104 eine schlichte Liste: ein Klick auf die Frage klappt Antwort und Animation auf, noch einer
     schließt sie; Escape schließt alle. Die Klasse js-fq setzt
     schon der Kopf der Seite, damit die Antworten nicht kurz aufblitzen. */
  var fqKacheln = document.querySelectorAll(".fq");
  if (fqKacheln.length) {
    wurzel.classList.add("js-fq");
    fqKacheln.forEach(function (k) {
      var b = k.querySelector(".fq__frage");
      if (!b) return;
      b.addEventListener("click", function () {
        var auf = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", String(auf));
        k.classList.toggle("ist-offen", auf);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".fq.ist-offen .fq__frage").forEach(function (b) { b.click(); });
    });
  }

  /* ---------------------------------- Fortschritt der Scroll-Animationen -- */
  /* Solange eine gepinnte Strecke den Bildschirm hält, zeigt der Balken ihren
     Fortschritt (--sc-p der Engine, 0 bis 1). Danach blendet er aus.
     Seit Feedback 74 ist er in Abschnitte geteilt: data-marken am Abschnitt nennt, wo der nächste Punkt
     beginnt (Anteile 0 bis 1). Dort trennt eine kleine Lücke den Balken; erreichte Abschnitte sind voll,
     der laufende füllt sich, die kommenden sind blass. So sieht man, wie weit es bis zum nächsten Punkt ist. */
  var balken = document.querySelector(".akt-balken");
  var akte = document.querySelectorAll('[data-sc-act="pin"], [data-sc-act="scrub"]');
  var balkenWartet = false, balkenAkt = null;
  var balkenMarken = function (a) {
    balken.querySelectorAll(".akt-balken__marke").forEach(function (m) { m.remove(); });
    (a.getAttribute("data-marken") || "").trim().split(/\s+/).filter(Boolean).forEach(function (w) {
      var m = document.createElement("span");
      m.className = "akt-balken__marke"; m.style.left = (parseFloat(w) * 100).toFixed(2) + "%"; m.setAttribute("data-bei", w);
      balken.appendChild(m);
    });
  };
  function balkenSetzen() {
    balkenWartet = false;
    var h = window.innerHeight, an = null;
    akte.forEach(function (a) { if (a.classList.contains("ist-klick")) return; var r = a.getBoundingClientRect(); if (r.top <= h * 0.1 && r.bottom >= h * 0.9) an = a; });   // am Handy zum Antippen: kein Balken
    balken.classList.toggle("ist-an", !!an);
    if (!an) return;
    if (an !== balkenAkt) { balkenAkt = an; balkenMarken(an); }
    balken.classList.toggle("ist-nacht", an.classList.contains("nacht"));
    var p = fortschritt(an);
    balken.firstElementChild.style.transform = "scaleX(" + p.toFixed(4) + ")";
    balken.querySelectorAll(".akt-balken__marke").forEach(function (m) { m.classList.toggle("ist-durch", p >= parseFloat(m.getAttribute("data-bei"))); });
  }
  if (balken && akte.length) {
    window.addEventListener("scroll", function () { if (!balkenWartet) { balkenWartet = true; requestAnimationFrame(balkenSetzen); } }, { passive: true });
    window.addEventListener("resize", balkenSetzen);
    requestAnimationFrame(balkenSetzen);
  }

  /* ------------------------------------------------ Seitenwechsel -- */
  /* Feedback 94: Wo der Browser nicht selbst zwischen den Seiten überblendet (.ohne-uebergang), blendet der Inhalt
     kurz aus, bevor die nächste Seite lädt. Nur für eigene Seiten im selben Fenster, nicht für Sprünge auf der Seite. */
  if (wurzel.classList.contains("ohne-uebergang") && !ohneBewegung) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.target || a.hasAttribute("download")) return;
      var ziel = new URL(a.href, location.href);
      if (ziel.origin !== location.origin || (ziel.pathname === location.pathname && ziel.search === location.search)) return;
      e.preventDefault();
      wurzel.classList.add("seite-geht");
      setTimeout(function () { location.href = ziel.href; }, 140);
    });
    // zurück aus dem Seitenspeicher des Browsers: wieder sichtbar
    window.addEventListener("pageshow", function () { wurzel.classList.remove("seite-geht"); });
  }

})();
