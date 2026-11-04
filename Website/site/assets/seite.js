/* SkiTag · eigene Abläufe der Seite: Kopfleiste, Schneeflocken im Hang,
   der Halte-Knopf mit der Zeichnung des Notrufwegs, der Knopf nach oben.
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
    var anzahl = window.innerWidth < 700 ? 36 : 70;
    for (var i = 0; i < anzahl; i++) {
      var nah = Math.random() < 0.12;
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

  /* ------------------------------------------ Der Knopf (Höhepunkt) -- */
  var akt = document.getElementById("knopf");
  var knopf = akt && akt.querySelector(".haltknopf");
  if (knopf) {
    var ring = knopf.querySelector(".ring");
    var led = knopf.querySelector(".led");
    var status = document.getElementById("knopf-status");
    var nochmal = akt.querySelector('[data-aktion="nochmal"]');
    var wege = [1, 2, 3].map(function (n) { return akt.querySelector(".weg--" + n); });
    var wellen = akt.querySelectorAll(".welle");
    var punkt = akt.querySelector(".punkt-rot");
    var handyText = akt.querySelector(".handy-text");

    var HALTEN = 3000, FRIST = 5000, LAUF = 5600;
    var zustand = "ruhe", start = 0, demo = 0, laufStart = 0, letzteSekunde = -1;

    var setzeZustand = function (z) { zustand = z; knopf.setAttribute("data-zustand", z); };
    var ringAuf = function (rest) { ring.style.strokeDashoffset = rest; ring.style.opacity = rest >= 0.999 ? 0 : 1; };
    var sage = function (t) { status.innerHTML = t; };

    // Wie am echten Chip: In der Abbruch-Zeit bricht ein weiterer Druck ab, Loslassen allein nicht.
    var beginnen = function () {
      if (zustand === "frist") { abbrechenJetzt(); return; }
      if (zustand !== "ruhe" && zustand !== "fertig" && zustand !== "kurz") return;
      if (zustand === "fertig") zuruecksetzen();
      setzeZustand("halten"); start = performance.now(); letzteSekunde = -1;
      nochmal.hidden = true;
      sage("Weiter halten.");
    };
    var loslassen = function () {
      if (zustand !== "halten") return;
      setzeZustand("kurz");
      ringAuf(1);
      sage("<strong>Kurz gedrückt.</strong> Das ruft deine Gruppe, nicht die Bergbahn. Für einen Notruf drei Sekunden halten.");
    };
    var zuruecksetzen = function () {
      setzeZustand("ruhe"); demo = 0;
      ringAuf(1);
      nochmal.hidden = true;
      sage("Drei Sekunden halten. Mit der Maus, dem Finger oder der Leertaste.");
    };

    knopf.addEventListener("pointerdown", function (e) { e.preventDefault(); knopf.setPointerCapture && knopf.setPointerCapture(e.pointerId); beginnen(); });
    knopf.addEventListener("pointerup", loslassen);
    knopf.addEventListener("pointercancel", loslassen);
    knopf.addEventListener("lostpointercapture", loslassen);
    knopf.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    knopf.addEventListener("keydown", function (e) {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); beginnen(); }
      else if (e.key === " " || e.key === "Enter") e.preventDefault();
    });
    knopf.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); loslassen(); } });
    knopf.addEventListener("click", function (e) { e.preventDefault(); });
    function abbrechenJetzt() {
      zuruecksetzen();
      sage("<strong>Abgebrochen.</strong> Der zweite Druck hat den Notruf gestoppt, gesendet wurde nichts.");
    }
    nochmal.addEventListener("click", function () { zuruecksetzen(); knopf.focus(); });

    var zeichnen = function (anteil, rot) {
      wege[0].style.strokeDashoffset = 1 - abschnitt(anteil, 0.06, 0.28);
      wege[1].style.strokeDashoffset = 1 - abschnitt(anteil, 0.28, 0.48);
      wege[2].style.strokeDashoffset = 1 - abschnitt(anteil, 0.48, 0.64);
      for (var k = 0; k < wellen.length; k++) {
        var aus = abschnitt(anteil, 0.02 + k * 0.04, 0.1 + k * 0.04), zurueck = abschnitt(anteil, 0.84 + k * 0.04, 0.92 + k * 0.04);
        wellen[k].style.opacity = anteil < 0.36 ? (anteil > 0.02 ? 0.25 + 0.75 * aus : 0) : (anteil < 0.84 ? 0.3 : 0.3 + 0.7 * zurueck);
      }
      var p = abschnitt(anteil, 0.64, 0.7);
      punkt.style.opacity = p;
      punkt.style.transform = "scale(" + (0.4 + 0.6 * p) + ")";
      handyText.style.opacity = abschnitt(anteil, 0.66, 0.74);
      led.setAttribute("fill", rot ? "#d83a2c" : "#8fa3b8");
    };

    var takt = function (jetzt) {
      if (zustand === "halten") {
        var t = (jetzt - start) / HALTEN;
        ringAuf(1 - klemme(t));
        if (t >= 1) {
          setzeZustand("frist"); start = jetzt;
        }
      } else if (zustand === "frist") {
        var rest = FRIST - (jetzt - start);
        ringAuf(1 - klemme(rest / FRIST));
        var sek = Math.ceil(rest / 1000);
        if (sek !== letzteSekunde && sek > 0) { letzteSekunde = sek; sage("<strong>Notruf in " + sek + " s.</strong> Loslassen und noch einmal kurz drücken bricht ab."); }
        if (rest <= 0) {
          setzeZustand("lauf"); laufStart = jetzt;
          ringAuf(1);
          sage("<strong>Notruf gesendet.</strong> Dein Standort ist unterwegs.");
        }
      } else if (zustand === "lauf") {
        demo = ohneBewegung ? 1 : klemme((jetzt - laufStart) / LAUF);
        if (demo > 0.7 && demo < 0.78 && status.dataset.stufe !== "punkt") { status.dataset.stufe = "punkt"; sage("Ein Mitarbeiter sieht deinen roten Punkt und tippt auf Annehmen."); }
        if (demo >= 1) {
          setzeZustand("fertig"); status.dataset.stufe = "";
          sage("<strong>Dein Chip vibriert zweimal:</strong> Hilfe ist unterwegs. Das war eine Vorführung, gesendet wurde nichts.");
          nochmal.hidden = false;
        }
      }
      var p = parseFloat(getComputedStyle(akt).getPropertyValue("--sc-p")) || 0;
      var vomScrollen = ohneBewegung ? 1 : abschnitt(p, 0.1, 0.86);
      var anteil = Math.max(vomScrollen, demo);
      var rot = zustand === "frist" || zustand === "lauf" || zustand === "fertig" || (!ohneBewegung && vomScrollen > 0.06);
      zeichnen(anteil, rot);
      requestAnimationFrame(takt);
    };
    requestAnimationFrame(takt);
  }

  /* ------------------------------------------------------ Nach oben -- */
  var nachOben = document.querySelector(".nach-oben");
  if (nachOben) {
    nachOben.hidden = false;
    var obenSetzen = function () {
      var an = window.scrollY > window.innerHeight * 1.2;
      nachOben.classList.toggle("ist-sichtbar", an);
      nachOben.tabIndex = an ? 0 : -1;
    };
    window.addEventListener("scroll", obenSetzen, { passive: true });
    obenSetzen();
    nachOben.addEventListener("click", function (ev) {
      ev.preventDefault();
      window.scrollTo({ top: 0, behavior: ohneBewegung ? "auto" : "smooth" });
      var marke = document.querySelector(".marke");
      if (marke) marke.focus({ preventScroll: true });
    });
  }
})();
