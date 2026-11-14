/* SkiTag · Das sind wir (Feedback 106/109), nur auf wir.html.
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
})();
