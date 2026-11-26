/* SkiTag · Seite „Die App“ (seit Feedback 57, Szenen seit Feedback 59), nur auf app.html geladen.
   Jede Szene ([data-szene]) ist ein gepinnter ScrollCraft-Akt; die Engine schreibt den Fortschritt
   als --sc-p (0 bis 1, geglättet) an den Abschnitt. Dieses Skript liest ihn in jedem Bild, solange
   die Szene zu sehen ist, und setzt daraus:
     data-teil         welcher der drei Teile gerade dran ist (Text, Marken, Blatt im iPhone)
     --f an den Marken wie weit der aktuelle Teil ist (Füllbalken)
   und an den Teilen des App-Bilds (alle Zahlen sind Werte von --sc-p):
     data-ab="a [b]"          .ist-an, solange a ≤ p < b
     data-k="a b"             --k läuft von 0 (bei a) bis 1 (bei b)
     data-raus="a b c d"      --w geht von a bis b auf 1 und von c bis d zurück auf 0
     data-zeichne="a b"       der Pfad zeichnet sich von a bis b
     data-folge="pfad a b | …" die Figur fährt den Pfad (id) von a bis b entlang
     data-zahl-p="a b ziel"   die Zahl zählt von 0 bis ziel (mit vier Werten: von … bis …)
   Dazu läuft im Überblick der Login als Schleife. Ohne JavaScript stehen alle Texte untereinander. */
(function () {
  "use strict";
  document.documentElement.classList.add("js-app");

  var klemme = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var k = function (p, a, b) { return klemme((p - a) / (b - a)); };
  var punkte = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  var zahlen = function (s) { return s.trim().split(/\s+/).map(parseFloat); };
  var alle = function (wurzel, sel) { return Array.prototype.slice.call(wurzel.querySelectorAll(sel)); };

  // Login im Überblick: einfach an, die Animation läuft im CSS
  alle(document, ".bs-stapel[data-start] .bs").forEach(function (bs) { bs.classList.add("ist-an"); });

  var szenen = alle(document, "[data-szene]").map(function (el) {
    var svg = el.querySelector(".bs-karte");
    return {
      el: el,
      marken: alle(el, ".szene__marken li"),
      teile: alle(el, ".szene__teil").length || 3,
      ab: alle(el, "[data-ab]").map(function (n) { var z = zahlen(n.getAttribute("data-ab")); return { n: n, a: z[0], b: isNaN(z[1]) ? 2 : z[1], an: null }; }),
      k: alle(el, "[data-k]").map(function (n) { return { n: n, z: zahlen(n.getAttribute("data-k")) }; }),
      raus: alle(el, "[data-raus]").map(function (n) { return { n: n, z: zahlen(n.getAttribute("data-raus")) }; }),
      zeichne: alle(el, "[data-zeichne]").map(function (n) { return { n: n, z: zahlen(n.getAttribute("data-zeichne")) }; }),
      zahl: alle(el, "[data-zahl-p]").map(function (n) { return { n: n, z: zahlen(n.getAttribute("data-zahl-p")), alt: null }; }),
      folge: alle(el, "[data-folge]").map(function (n) {
        return {
          n: n,
          stuecke: n.getAttribute("data-folge").split("|").map(function (s) {
            var t = s.trim().split(/\s+/), pfad = svg && svg.querySelector("#" + t[0]);
            return { pfad: pfad, laenge: pfad ? pfad.getTotalLength() : 0, a: parseFloat(t[1]), b: parseFloat(t[2]) };
          }).filter(function (s) { return s.pfad; })
        };
      }),
      filme: alle(el, ".app-film__clip"),
      teil: -1, zuletzt: -1, sichtbar: true,
      // Handy (Feedback 88): nicht gepinnt, die Marken sind Knöpfe; der gewählte Teil spielt in KLICK_DAUER ab
      klick: el.classList.contains("ist-klick"), wahl: 0, start: 0, zentriert: false
    };
  });
  var KLICK_DAUER = 3800;
  // Feedback 156: je Teil ein Film aus der echten App. Nur der Film des aktuellen Teils läuft, und nur solange
  // die Szene zu sehen ist; geladen wird erst, wenn er dran ist (preload="none"). Bei „weniger Bewegung“ bleibt das Standbild.
  var ohneBewegungFilm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var filmZeigen = function (s) {
    s.filme.forEach(function (v, i) {
      if (s.sichtbar && v.preload !== "auto") v.preload = "auto";   // ist die Szene da, laden alle drei vor, damit der Wechsel ohne Lücke geht
      if (i === s.teil && s.sichtbar && !ohneBewegungFilm) {
        if (v.paused) { try { v.currentTime = 0; } catch (e) {} var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      } else if (!v.paused) v.pause();
    });
  };
  // auf dem Handy wechselt die Szene von selbst: ein Teil dauert dort so lange wie sein Film
  szenen.forEach(function (s) { s.dauer = s.filme.length ? 7600 : KLICK_DAUER; });
  var ohneBewegungApp = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Feedback 131: die Szene läuft von selbst durch alle drei Teile und beginnt dann von vorn; ein Knopf hält sie an.
  // Bei „weniger Bewegung“ steht sie am Anfang still, bis man auf Abspielen drückt.
  var HALT = 900;   // kurze Pause am Ende eines Teils, bevor der nächste beginnt
  var ZEICHEN_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="2.6" height="10" rx="1"/><rect x="9.4" y="3" width="2.6" height="10" rx="1"/></svg>';
  var ZEICHEN_SPIEL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6a.8.8 0 0 0 1.2.7l7.6-4.8a.8.8 0 0 0 0-1.4L6.2 2.5A.8.8 0 0 0 5 3.2z"/></svg>';
  szenen.forEach(function (s) {
    if (!s.klick) return;
    s.pause = ohneBewegungApp; s.pauseAb = 0;
    var ol0 = s.el.querySelector(".szene__marken");
    if (ol0) {
      var steuer = document.createElement("div"); steuer.className = "szene__steuer";
      ol0.parentNode.insertBefore(steuer, ol0); steuer.appendChild(ol0);
      var knopf = document.createElement("button"); knopf.type = "button"; knopf.className = "szene__pause";
      var zeigen = function () {
        knopf.innerHTML = s.pause ? ZEICHEN_SPIEL : ZEICHEN_PAUSE;
        knopf.setAttribute("aria-label", s.pause ? "Animation abspielen" : "Animation anhalten");
        knopf.setAttribute("aria-pressed", s.pause ? "true" : "false");
      };
      knopf.addEventListener("click", function () {
        var jetzt = performance.now();
        if (s.pause) { s.start += jetzt - (s.pauseAb || jetzt); s.pause = false; } else { s.pause = true; s.pauseAb = jetzt; }
        s.zuletzt = -1; zeigen(); starten();
      });
      zeigen(); steuer.appendChild(knopf); s.pauseKnopf = zeigen;
    }
  });
  szenen.forEach(function (s) {
    if (!s.klick) return;
    var ol = s.el.querySelector(".szene__marken");
    if (ol) { ol.removeAttribute("aria-hidden"); ol.setAttribute("role", "tablist"); }
    s.marken.forEach(function (li, i) {
      li.setAttribute("role", "tab"); li.setAttribute("tabindex", "0");
      var waehle = function () { s.wahl = i; s.start = performance.now(); s.pause = false; if (s.pauseKnopf) s.pauseKnopf(); s.zuletzt = -1; starten(); };
      li.addEventListener("click", waehle);
      li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); waehle(); } });
    });
  });

  var lesen = function (el) { return parseFloat(el.style.getPropertyValue("--sc-p")) || 0; };
  // am Handy: Stand aus dem gewählten Teil und der Zeit; läuft erst, wenn die Szene mitten im Bild steht
  var stand = function (s) {
    if (!s.klick) return lesen(s.el);
    var r = s.el.getBoundingClientRect(), vh = window.innerHeight;
    var zentriert = r.top < vh * 0.4 && r.bottom > vh * 0.6;
    var jetzt = performance.now();
    if (zentriert && !s.zentriert) { s.start = jetzt; if (s.pause) s.pauseAb = jetzt; }
    s.zentriert = zentriert;
    if (!zentriert) return s.wahl / s.teile;
    var zeit = (s.pause ? s.pauseAb : jetzt) - s.start;
    if (!s.pause && zeit > s.dauer + HALT) { s.wahl = (s.wahl + 1) % s.teile; s.start = jetzt; zeit = 0; }
    return (s.wahl + klemme(zeit / s.dauer) * 0.999) / s.teile;
  };

  var setzen = function (s) {
    var p = stand(s);
    if (Math.abs(p - s.zuletzt) < 0.0005) return;
    s.zuletzt = p;

    // Teil und Marken
    var n = s.teile, teil = Math.min(n - 1, Math.floor(p * n));
    if (teil !== s.teil) {
      var erstes = s.teil < 0;
      s.teil = teil; s.el.setAttribute("data-teil", String(teil));
      filmZeigen(s);
      // Feedback 121: mit GSAP steigen Überschrift und Text des neuen Teils nacheinander ein
      if (window.gsap && !erstes && !ohneBewegungApp) {
        var neu = s.el.querySelectorAll(".szene__teil")[teil];
        if (neu) gsap.fromTo(neu.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power3.out", stagger: 0.08, overwrite: true });
      }
    }
    s.marken.forEach(function (li, i) {
      var f = i < teil ? 1 : i > teil ? 0 : klemme(p * n - teil);
      li.style.setProperty("--f", f.toFixed(3));
      li.classList.toggle("ist-jetzt", i === teil);
      if (s.klick) li.setAttribute("aria-selected", i === teil ? "true" : "false");
    });

    s.ab.forEach(function (x) { var an = p >= x.a && p < x.b; if (an !== x.an) { x.an = an; x.n.classList.toggle("ist-an", an); } });
    s.k.forEach(function (x) { x.n.style.setProperty("--k", k(p, x.z[0], x.z[1]).toFixed(3)); });
    s.raus.forEach(function (x) { x.n.style.setProperty("--w", (k(p, x.z[0], x.z[1]) * (1 - k(p, x.z[2], x.z[3]))).toFixed(3)); });
    s.zeichne.forEach(function (x) { x.n.style.strokeDashoffset = (1 - k(p, x.z[0], x.z[1])).toFixed(4); });
    s.zahl.forEach(function (x) {
      var von = x.z.length > 3 ? x.z[2] : 0, bis = x.z.length > 3 ? x.z[3] : x.z[2];
      var wert = Math.round(von + (bis - von) * k(p, x.z[0], x.z[1]));
      if (wert !== x.alt) { x.alt = wert; x.n.textContent = punkte(wert); }
    });
    s.folge.forEach(function (x) {
      // das letzte Stück, das schon begonnen hat (vor dem ersten: dessen Anfang)
      var st = x.stuecke[0];
      x.stuecke.forEach(function (t) { if (p >= t.a) st = t; });
      var pt = st.pfad.getPointAtLength(st.laenge * k(p, st.a, st.b));
      x.n.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ")");
    });
  };

  // Nur rechnen, solange eine Szene zu sehen ist; die Engine glättet --sc-p über mehrere Bilder,
  // darum läuft dann eine Schleife statt nur auf Scroll-Ereignisse zu hören.
  var laeuft = false;
  var bild = function () {
    var irgendeine = false;
    szenen.forEach(function (s) { if (s.sichtbar) { irgendeine = true; setzen(s); } });
    if (irgendeine) requestAnimationFrame(bild); else laeuft = false;
  };
  function starten() { if (!laeuft) { laeuft = true; requestAnimationFrame(bild); } }

  if ("IntersectionObserver" in window) {
    szenen.forEach(function (s) { s.sichtbar = false; });
    var beob = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        szenen.forEach(function (s) { if (s.el === e.target) { s.sichtbar = e.isIntersecting; filmZeigen(s); } });
      });
      starten();
    });
    szenen.forEach(function (s) { beob.observe(s.el); });
    var login = new IntersectionObserver(function (e) { e.forEach(function (x) { x.target.classList.toggle("ist-weg", !x.isIntersecting); }); });
    alle(document, ".app-blick__bild").forEach(function (el) { login.observe(el); });
    // der Login-Film im Überblick läuft, solange er zu sehen ist
    var loginFilm = new IntersectionObserver(function (e) {
      e.forEach(function (x) {
        var v = x.target.querySelector(".app-film__clip"); if (!v || ohneBewegungFilm) return;
        if (x.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    }, { threshold: 0.25 });
    alle(document, "#ueberblick .app-film").forEach(function (el) { loginFilm.observe(el); });
  }
  szenen.forEach(setzen);
  starten();
})();
