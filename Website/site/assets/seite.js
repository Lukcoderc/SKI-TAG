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
  /* Weg, sobald die Schriften da sind, spätestens nach 5 s. */
  var lade = document.querySelector(".lade");
  if (lade) {
    var weg = function () {
      if (lade.classList.contains("ist-fertig")) return;
      lade.classList.add("ist-fertig");
      setTimeout(function () { lade.remove(); }, 600);
    };
    var schrift = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    schrift.then(function () { requestAnimationFrame(function () { requestAnimationFrame(weg); }); });
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
  /* Himmel, Berge und Schnee liegen hintereinander (seite.css liest --mx, --my, --sy und verschiebt die
     Ebenen verschieden weit). Läuft nur, solange der Einstieg zu sehen ist. */
  var held = document.querySelector(".held");
  if (held && !ohneBewegung) {
    var hx = 0, hy = 0, hxS = 0, hyS = 0, heldDa = false, heldLaeuft = false;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      hx = e.clientX / window.innerWidth - 0.5; hy = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    var heldTakt = function () {
      if (!heldDa) { heldLaeuft = false; return; }
      hxS += (hx - hxS) * 0.06; hyS += (hy - hyS) * 0.06;
      held.style.setProperty("--mx", hxS.toFixed(4));
      held.style.setProperty("--my", hyS.toFixed(4));
      held.style.setProperty("--sy", klemme(window.scrollY / Math.max(1, held.offsetHeight)).toFixed(4));
      requestAnimationFrame(heldTakt);
    };
    new IntersectionObserver(function (e) {
      heldDa = e[0].isIntersecting;
      if (heldDa && !heldLaeuft) { heldLaeuft = true; requestAnimationFrame(heldTakt); }
    }).observe(held);
  }

  /* Gemeinsamer Zustand für den Chip in 3D (chip-3d.js liest ihn in jedem Bild) */
  var chip = window.skitagChip = window.skitagChip || {};
  chip.zustand = "ruhe"; chip.ring = 0; chip.sek = 0; chip.gruppe = 0; chip.hilfe = 0;
  chip.blick = { schritt: 0, halten: 0, spielt: false, start: 0 };

  /* ------------------------------------ Was ist SKITAG?: drei Schritte -- */
  /* Die gepinnte Strecke ist in drei Teile geteilt: kurz drücken, drei Sekunden halten, Funk zur Liftstation.
     data-schritt schaltet Text und Fläche, --halten füllt den Ring im zweiten Schritt, data-spielt
     startet die Schleife „Gruppe rufen“ (4,2 s), sobald die Bühne steht. */
  var blick = document.getElementById("blick");
  if (blick && blick.querySelector(".blick__chip")) {
    var bz = chip.blick, blickDa = false, blickLaeuft = false;
    var blickTakt = function () {
      if (!blickDa) { blickLaeuft = false; return; }
      var r = blick.getBoundingClientRect(), vh = window.innerHeight;
      var p = klemme(-r.top / Math.max(1, r.height - vh));
      var sb = p < 0.28 ? 0 : p < 0.62 ? 1 : 2;
      if (sb !== bz.schritt) { bz.schritt = sb; blick.setAttribute("data-schritt", String(sb)); }
      var spielt = sb === 0 && r.top <= vh * 0.04 && r.bottom >= vh;
      if (spielt !== bz.spielt) { bz.spielt = spielt; bz.start = performance.now(); blick.toggleAttribute("data-spielt", spielt); }
      // der Ring ist nach gut der Hälfte des zweiten Schritts voll; danach bleibt „Notruf gesendet“ stehen, auch im dritten
      var h = sb === 1 ? abschnitt((p - 0.28) / 0.34, 0.05, 0.55) : sb === 2 ? 1 : 0;
      if (Math.abs(h - bz.halten) > 0.002 || (h === 1) !== blick.hasAttribute("data-voll")) {
        bz.halten = h; blick.style.setProperty("--halten", h.toFixed(3));
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

    // Halten dauert wie am echten Chip 3 s; Frist (echt 5 s) und der Weg der Hilfe sind verkürzt.
    var HALTEN = 3000, FRIST = 3000, LAUF = 7000, GRUPPE = 4600;
    var taktLaeuft = false, zustand = "ruhe", start = 0, hilfe = 0, gruppe = 0, letzteSekunde = -1, stufe = "";
    var START_TEXT = "Probier es aus: Drück den Knopf am Chip. Kurz für die Gruppe, drei Sekunden für den Notruf.";

    var setzeZustand = function (z) { zustand = z; chip.zustand = z; akt.setAttribute("data-zustand", z); };
    // Ring: beim Halten 0 bis 1, in der Frist 1 bis 0. --ring füllt den Ring ohne WebGL.
    var ringAuf = function (voll) { chip.ring = voll; akt.style.setProperty("--ring", voll.toFixed(4)); };
    var sage = function (t) { status.innerHTML = t; };
    var aktiv = function (name) { schritte.forEach(function (li) { li.classList.toggle("ist-aktiv", li.getAttribute("data-schritt") === name); }); };
    // Weg der Hilfe: Punkte schalten nacheinander an, die Linie füllt sich mit --hilfe
    var zeichnen = function () {
      var an = zustand === "lauf" || zustand === "fertig";
      wegPunkte.forEach(function (li) { li.classList.toggle("ist-an", an && hilfe >= parseFloat(li.getAttribute("data-ab"))); });
      akt.style.setProperty("--hilfe", (an ? hilfe : 0).toFixed(3));
      if (wegTitel) wegTitel.textContent = zustand === "fertig" ? "Hilfe ist da" : "Notruf gesendet";
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
