/* SkiTag · Das sind wir (Feedback 106/109/152), nur auf wir.html.
   Klick auf die Adresse kopiert sie in die Zwischenablage, die Zeile darunter sagt kurz „Adresse kopiert“.
   Kopiert wird zuerst über eine versteckte Textfläche (braucht keine Erlaubnis), sonst über die Zwischenablage
   des Browsers. Klappt beides nicht, wird die Adresse markiert und die Zeile sagt, wie man sie kopiert.
   Die Auswahl bei „E-Mail schreiben“ schließt sich bei Klick daneben, mit Escape und nach einer Wahl. */
(function () {
  "use strict";
  var mail = document.querySelector(".wk__mail");
  var tipp = document.querySelector(".wk__tipp");
  var tippText = tipp && tipp.querySelector(".wk__tipp-text");

  var perTextflaeche = function (text) {
    var t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", "");
    t.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(t);
    t.select(); t.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(t);
    return ok;
  };

  if (mail && tipp) {
    var grund = tippText.textContent, zurueck = 0;
    var zeige = function (text, klasse) {
      tippText.textContent = text;
      tipp.classList.toggle("ist-kopiert", klasse === "ok");
      clearTimeout(zurueck);
      zurueck = setTimeout(function () { tippText.textContent = grund; tipp.classList.remove("ist-kopiert"); }, 2600);
    };
    var markieren = function () {
      var r = document.createRange(); r.selectNodeContents(mail);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      zeige("Adresse markiert, mit Strg+C kopieren");
    };
    mail.setAttribute("title", "Adresse kopieren");
    mail.addEventListener("click", function (e) {
      e.preventDefault();
      var text = mail.getAttribute("data-mail");
      if (perTextflaeche(text)) { zeige("Adresse kopiert", "ok"); return; }
      if (navigator.clipboard && window.isSecureContext) {
        var fertig = false;
        navigator.clipboard.writeText(text).then(function () { fertig = true; zeige("Adresse kopiert", "ok"); }, function () { fertig = true; markieren(); });
        setTimeout(function () { if (!fertig) markieren(); }, 1200);
      } else {
        markieren();
      }
    });
  }

  var wahl = document.querySelector(".wk__schreiben");
  if (wahl) {
    document.addEventListener("click", function (e) { if (wahl.open && !wahl.contains(e.target)) wahl.open = false; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && wahl.open) { wahl.open = false; wahl.querySelector("summary").focus(); } });
    wahl.querySelectorAll(".wk__wahl a").forEach(function (a) { a.addEventListener("click", function () { wahl.open = false; }); });
  }
  /* Feedback 152: Klick (am Handy Antippen) auf eine Person zeigt ihre Adresse und kopiert sie gleich. Am PC zeigt
     schon das Drüberfahren die Adresse. Der Hinweis wird kurz zu „Kopiert“; geht Kopieren nicht, öffnet sich die Mail-App. */
  var leute = Array.prototype.slice.call(document.querySelectorAll(".wir2__person"));
  var zeigerFein = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var schliessen = function () { leute.forEach(function (x) { x.classList.remove("ist-auf"); }); };
  leute.forEach(function (li) {
    var knopf = li.querySelector(".wir2__mail");
    if (!knopf) return;
    var hinweis = knopf.querySelector(".wir2__mail-hinweis");
    var grundtext = zeigerFein ? "Klicken zum Kopieren" : "Tippen zum Kopieren";
    var zurueck = 0;
    hinweis.textContent = grundtext;
    var melden = function (text, ok) {
      hinweis.textContent = text;
      knopf.classList.toggle("ist-kopiert", !!ok);
      clearTimeout(zurueck);
      zurueck = setTimeout(function () {
        hinweis.textContent = grundtext; knopf.classList.remove("ist-kopiert");
        if (!zeigerFein) li.classList.remove("ist-auf");
      }, 2400);
    };
    var kopieren = function () {
      var text = knopf.getAttribute("data-mail");
      if (perTextflaeche(text)) { melden("Kopiert", true); return; }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { melden("Kopiert", true); }, function () { location.href = "mailto:" + text; });
      } else {
        location.href = "mailto:" + text;
      }
    };
    li.addEventListener("click", function (e) {
      e.stopPropagation();
      leute.forEach(function (x) { if (x !== li) x.classList.remove("ist-auf"); });
      li.classList.add("ist-auf");
      kopieren();
    });
  });
  document.addEventListener("click", schliessen);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") schliessen(); });
})();

/* Feedback 158: das Punktraster hinter „Schreib uns.“ steckt jetzt in assets/punktraster.js (Funkwellen statt Bergkette). */

/* Feedback 156: die drei Fotoplätze kommen beim Hineinscrollen nacheinander von unten, leicht gekippt, und der große
   Anfangsbuchstabe steigt darin auf (GSAP). Ohne GSAP oder bei weniger Bewegung stehen sie einfach da. */
(function () {
  "use strict";
  var leute = document.querySelector(".wir2__leute");
  if (!leute || !window.gsap || !window.ScrollTrigger || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);
  var bilder = leute.querySelectorAll(".wir2__portrait"), zeichen = leute.querySelectorAll(".wir2__initial");
  var r = leute.getBoundingClientRect(); if (r.top < innerHeight) return;   // schon im Bild: nichts verstecken
  gsap.set(bilder, { y: 80, rotate: function (i) { return [-4, 0, 4][i % 3]; }, opacity: 0, transformOrigin: "50% 100%" });
  gsap.set(zeichen, { yPercent: 40, opacity: 0 });
  ScrollTrigger.create({ trigger: leute, start: "top 80%", once: true, onEnter: function () {
    gsap.to(bilder, { y: 0, rotate: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.12, clearProps: "transform,opacity" });
    gsap.to(zeichen, { yPercent: 0, opacity: 1, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.2, clearProps: "transform,opacity" });
  } });

})();
