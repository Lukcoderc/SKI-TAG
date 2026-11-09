/* SkiTag · Seite „Feedback“ (seit Feedback 62), nur auf feedback.html geladen.
   - Fragen nacheinander (Weiter/Zurück, Enter im Regler), Stand „Frage n von 4“.
   - Wetter-Regler: setzt --w (0 bis 4) und die Himmelsfarben an der Karte, dazu Wort und Untertitel
     des Wetterberichts; bei Pulvertag funkelt der Schnee, bei Sturm wird der Bericht hell.
   - Slalom: der kleine Chip fährt je Frage durch das nächste Tor bis ins Ziel.
   - Senden: Knopf 1,2 s halten (Maus, Finger, Leertaste oder Enter), dann „Danke“.
   Das Formular schickt nichts ab; ohne JavaScript stehen alle Fragen untereinander. */
(function () {
  "use strict";
  var karte = document.querySelector(".fb__karte");
  if (!karte) return;
  document.documentElement.classList.add("js-fb");
  var ohneBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var fragen = Array.prototype.slice.call(karte.querySelectorAll(".fb__frage"));
  var nrEl = karte.querySelector(".fb__nr");
  var weiter = karte.querySelector(".fb__weiter");
  var zurueck = karte.querySelector(".fb__zurueck");
  var schritt = 0;

  /* ---------------------------------------------------------- Wetter -- */
  var regler = karte.querySelector(".fb__regler");
  var wortEl = karte.querySelector(".fb__wort");
  var subEl = karte.querySelector(".fb__sub");
  var wetter = [
    { wort: "Schneesturm.", sub: "Gefällt mir gar nicht", o: "#5d6b82", u: "#a7b2c2" },
    { wort: "Nebel.", sub: "Eher nicht", o: "#c3cad4", u: "#e6e9ee" },
    { wort: "Bewölkt.", sub: "Geht so", o: "#a8c3e2", u: "#e3ecf6" },
    { wort: "Sonnig.", sub: "Gefällt mir", o: "#69a8ec", u: "#cfe5fb" },
    { wort: "Pulvertag.", sub: "Richtig gut", o: "#2f86f0", u: "#c4e2ff" }
  ];
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); };
  var mischen = function (a, b, t) { var x = rgb(a), y = rgb(b); return "rgb(" + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(",") + ")"; };
  var wetterSetzen = function () {
    var w = parseFloat(regler.value), i = Math.min(3, Math.floor(w)), t = w - i;
    karte.style.setProperty("--w", w.toFixed(2));
    karte.style.setProperty("--himmel-o", mischen(wetter[i].o, wetter[i + 1].o, t));
    karte.style.setProperty("--himmel-u", mischen(wetter[i].u, wetter[i + 1].u, t));
    var n = wetter[Math.round(w)];
    if (wortEl.textContent !== n.wort) { wortEl.textContent = n.wort; subEl.textContent = n.sub; }
    regler.setAttribute("aria-valuetext", n.wort.replace(".", "") + ", " + n.sub.toLowerCase());
    karte.classList.toggle("ist-pulver", w >= 3.6);
    karte.classList.toggle("ist-dunkel", w < 0.7);
  };
  regler.addEventListener("input", wetterSetzen);
  // beim Loslassen auf die nächste Stufe einrasten
  regler.addEventListener("change", function () { regler.value = String(Math.round(parseFloat(regler.value))); wetterSetzen(); });
  wetterSetzen();

  /* ---------------------------------------------------------- Slalom -- */
  var piste = karte.querySelector("#fb-piste");
  var fahrer = karte.querySelector(".fb__fahrer");
  var tore = Array.prototype.slice.call(karte.querySelectorAll(".fb__tor"));
  var laenge = piste.getTotalLength();
  // wo auf der Piste jedes Tor liegt: der Punkt, der seiner Mitte am nächsten ist
  var torAnteil = tore.map(function (tor) {
    var m = tor.getAttribute("transform").match(/translate\(([\d.]+)[ ,]+([\d.]+)\)/), x = +m[1], y = +m[2], best = 0, abst = Infinity;
    for (var l = 0; l <= laenge; l += 2) { var p = piste.getPointAtLength(l), d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (d < abst) { abst = d; best = l; } }
    return best / laenge;
  });
  // Schritt → Platz auf der Piste: Start, Tor 1, Tor 2, Tor 3, kurz vor dem Ziel, Ziel
  var ziele = [0, torAnteil[0], torAnteil[1], torAnteil[2], (torAnteil[2] + 1) / 2, 1];
  var jetzt = 0, fahrt = 0;
  var fahren = function (bis) {
    cancelAnimationFrame(fahrt);
    var von = jetzt, start = performance.now(), dauer = ohneBewegung ? 0 : 900;
    var schrittBild = function (t) {
      var p = dauer ? Math.min(1, (t - start) / dauer) : 1, e = 1 - Math.pow(1 - p, 3);
      jetzt = von + (bis - von) * e;
      var pt = piste.getPointAtLength(laenge * jetzt);
      fahrer.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ")");
      tore.forEach(function (tor, i) {
        var durch = jetzt >= torAnteil[i] - 0.005;
        if (durch && !tor.classList.contains("ist-durch")) tor.classList.add("ist-durch");
        if (!durch) tor.classList.remove("ist-durch");
      });
      if (p < 1) fahrt = requestAnimationFrame(schrittBild);
    };
    fahrt = requestAnimationFrame(schrittBild);
  };

  /* ---------------------------------------------------------- Fragen -- */
  var zeigen = function (n, fokus) {
    schritt = n;
    karte.setAttribute("data-schritt", String(n));
    fragen.forEach(function (f, i) {
      f.classList.toggle("ist-dran", i === n);
      f.classList.toggle("ist-vorbei", i < n);
      f.setAttribute("aria-hidden", i === n ? "false" : "true");
      f.inert = i !== n;
    });
    nrEl.textContent = String(Math.min(n + 1, 4));
    nrEl.parentNode.style.visibility = n > 3 ? "hidden" : "visible";
    fahren(ziele[n]);
    if (fokus) {
      var ziel = fragen[n].querySelector("input, textarea, button") || fragen[n];
      try { ziel.focus({ preventScroll: true }); } catch (e) { ziel.focus(); }
    }
  };
  weiter.addEventListener("click", function () { if (schritt < 4) zeigen(schritt + 1, true); });
  zurueck.addEventListener("click", function () { if (schritt > 0) zeigen(schritt - 1, true); });
  regler.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); zeigen(1, true); } });

  var nachricht = karte.querySelector("textarea[name=nachricht]");
  var zaehler = karte.querySelector(".fb__zaehler b");
  nachricht.addEventListener("input", function () { zaehler.textContent = String(nachricht.value.length); });

  /* ------------------------------------------------- Halten zum Senden -- */
  var knopf = karte.querySelector(".fb__halten");
  var dauerHalten = 1200, beginn = 0, halteBild = 0, gehalten = false;
  var ring = function (v) { knopf.style.setProperty("--halt", v.toFixed(3)); };
  var fertig = function () {
    gehalten = false; knopf.classList.remove("ist-gedrueckt"); ring(0);
    var name = (karte.querySelector("input[name=vorname]").value || "").trim();
    karte.querySelector(".fb__danke-name").textContent = name ? ", " + name : "";
    regler.value = "4"; wetterSetzen();
    zeigen(5, false);
    karte.querySelector(".fb__danke").focus({ preventScroll: true });
  };
  var laufen = function (t) {
    if (!gehalten) return;
    var p = Math.min(1, (t - beginn) / dauerHalten);
    ring(p);
    if (p >= 1) fertig(); else halteBild = requestAnimationFrame(laufen);
  };
  var start = function (e) {
    if (gehalten) return;
    if (e && e.cancelable) e.preventDefault();
    gehalten = true; beginn = performance.now(); knopf.classList.add("ist-gedrueckt");
    halteBild = requestAnimationFrame(laufen);
  };
  var stopp = function () {
    if (!gehalten) return;
    gehalten = false; cancelAnimationFrame(halteBild); knopf.classList.remove("ist-gedrueckt");
    // Ring läuft sanft zurück
    var v = parseFloat(knopf.style.getPropertyValue("--halt")) || 0, t0 = performance.now();
    var zurueckBild = function (t) { var p = Math.min(1, (t - t0) / 300); ring(v * (1 - p)); if (p < 1 && !gehalten) requestAnimationFrame(zurueckBild); };
    requestAnimationFrame(zurueckBild);
  };
  knopf.addEventListener("pointerdown", start);
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (n) { knopf.addEventListener(n, stopp); });
  knopf.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) start(e); });
  knopf.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") stopp(); });
  knopf.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  karte.querySelector(".fb__nochmal").addEventListener("click", function () { zeigen(0, true); });
  karte.addEventListener("submit", function (e) { e.preventDefault(); });

  zeigen(0, false);
})();
