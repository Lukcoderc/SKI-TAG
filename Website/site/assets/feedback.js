/* SkiTag · Seite „Feedback“ (seit Feedback 62), nur auf feedback.html geladen.
   - Fragen nacheinander (Weiter/Zurück, Enter im Regler), Stand „Frage n von 4“.
   - Wetter-Regler: setzt --w (0 bis 4) und die Himmelsfarben an der Karte, dazu Wort und Untertitel
     des Wetterberichts; bei Pulvertag funkelt der Schnee, bei Sturm wird der Bericht hell.
   - Slalom: der kleine Chip fährt je Frage durch das nächste Tor bis ins Ziel.
   - Senden: Knopf 1,2 s halten (Maus, Finger, Leertaste oder Enter). Seit Feedback 138 geht die Antwort dann wirklich
     raus: als JSON an FormSubmit (formsubmit.co/ajax/…), das sie als E-Mail an die Team-Adresse weiterleitet. „Danke“
     erscheint erst, wenn FormSubmit den Empfang bestätigt; sonst steht unter dem Knopf, was schiefging, und man kann
     es nochmal halten. Ist die Spam-Falle (_honey) ausgefüllt, wird nichts gesendet.
   - Spamschutz (Feedback 139): Die Nachricht ist Pflicht (mindestens 10 Zeichen), sonst geht es bei Frage 4 nicht weiter.
     Höchstens 10 Antworten pro Tag und 30 s Pause dazwischen, gezählt im Browser (localStorage). Das bremst nur
     normale Besucher: wer direkt an FormSubmit schickt oder den Speicher löscht, kommt daran vorbei. Echten Schutz
     geben nur FormSubmit selbst (Spam-Filter, _honey, _blacklist) oder ein eigener Server.
   Ohne JavaScript stehen alle Fragen untereinander und „Absenden“ schickt das Formular normal ab. */
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
  // Feedback 128: Ohne gezeichnete Piste (neue Gestaltung) zeigt ein schlichter Balken den Fortschritt (--fortschritt)
  var piste = karte.querySelector("#fb-piste");
  if (!piste) {
    var fahren = function (bis) { karte.style.setProperty("--fortschritt", bis.toFixed(3)); };
    var ziele = [0.12, 0.37, 0.62, 0.87, 1, 1];
  } else {
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
  }

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
  weiter.addEventListener("click", function () {
    if (schritt === 3 && !textPruefen()) { nachricht.focus(); return; }
    if (schritt < 4) zeigen(schritt + 1, true);
    if (schritt === 4) { var grenze = limitHinweis(); meldung(grenze || hinweisText, !!grenze); }
  });
  zurueck.addEventListener("click", function () { if (schritt > 0) zeigen(schritt - 1, true); });
  regler.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); zeigen(1, true); } });

  var nachricht = karte.querySelector("textarea[name=nachricht]");
  var zaehler = karte.querySelector(".fb__zaehler b");
  var textFehler = karte.querySelector(".fb__text-fehler");
  var MIN_TEXT = 10, MAX_TEXT = 600;
  var textOk = function () { return nachricht.value.trim().length >= MIN_TEXT; };
  var textMelden = function (text) { textFehler.textContent = text; nachricht.classList.toggle("ist-fehler", !!text); nachricht.setAttribute("aria-invalid", text ? "true" : "false"); };
  var textPruefen = function () {
    if (textOk()) { textMelden(""); return true; }
    var fehlt = MIN_TEXT - nachricht.value.trim().length;
    textMelden(nachricht.value.trim() ? "Noch " + fehlt + " Zeichen, dann geht es weiter." : "Schreib uns bitte ein paar Worte, mindestens " + MIN_TEXT + " Zeichen.");
    return false;
  };
  nachricht.addEventListener("input", function () {
    zaehler.textContent = String(nachricht.value.length);
    if (textFehler.textContent && textOk()) textMelden("");
  });

  /* Limit pro Browser: höchstens 10 Antworten in 24 Stunden, 30 s Pause zwischen zwei Antworten. Ohne localStorage
     (privates Fenster, gesperrt) zählt die Seite im Speicher mit, bis sie neu geladen wird. */
  var LIMIT_TAG = 10, PAUSE = 30000, TAG = 86400000, SPEICHER = "skitag-feedback-gesendet", imSpeicher = [];
  var gesendetLesen = function () {
    var liste = imSpeicher;
    try { var roh = JSON.parse(localStorage.getItem(SPEICHER) || "[]"); if (Array.isArray(roh)) liste = roh.concat(imSpeicher); } catch (e) {}
    var jetzt = Date.now();
    return liste.filter(function (z, i, a) { return typeof z === "number" && z <= jetzt && jetzt - z < TAG && a.indexOf(z) === i; }).sort();
  };
  var gesendetMerken = function () {
    var liste = gesendetLesen(); liste.push(Date.now()); imSpeicher = liste;
    try { localStorage.setItem(SPEICHER, JSON.stringify(liste)); } catch (e) {}
  };
  // gibt einen Hinweis zurück, wenn gerade nicht gesendet werden darf, sonst ""
  var limitHinweis = function () {
    var liste = gesendetLesen(), jetzt = Date.now();
    if (liste.length >= LIMIT_TAG) {
      var stunden = Math.ceil((liste[0] + TAG - jetzt) / 3600000);
      return "Du hast heute schon " + LIMIT_TAG + " Antworten geschickt, danke! Die nächste geht in " + (stunden <= 1 ? "einer Stunde" : stunden + " Stunden") + " wieder.";
    }
    var warten = liste.length ? Math.ceil((liste[liste.length - 1] + PAUSE - jetzt) / 1000) : 0;
    if (warten > 0) return "Kurz durchatmen: die nächste Antwort geht in " + warten + " Sekunden.";
    return "";
  };

  /* ------------------------------------------------- Halten zum Senden -- */
  var knopf = karte.querySelector(".fb__halten");
  var dauerHalten = 1200, beginn = 0, halteBild = 0, gehalten = false;
  // Füllstand direkt am Kreis (calc() mit Zahlen ohne Einheit ist für stroke-dashoffset in Firefox ungültig)
  var ringEl = knopf.querySelector(".fb__ring");
  var ring = function (v) { knopf.style.setProperty("--halt", v.toFixed(3)); ringEl.style.strokeDashoffset = (1 - v).toFixed(3); };
  /* Absenden an FormSubmit. Die E-Mail soll lesbar sein: statt der internen Werte stehen die sichtbaren Wörter drin. */
  /* Ziel: steht im Formular data-worker (Cloudflare-Worker mit echtem Tageslimit, siehe Website/feedback-worker), sonst
     wie bisher direkt FormSubmit. Der Worker antwortet im selben Format wie FormSubmit. */
  var WORKER = karte.getAttribute("data-worker") || "";
  var ZIEL = WORKER || "https://formsubmit.co/ajax/skitag.team@gmail.com";
  var hinweis = karte.querySelector(".fb__vorschau"), hinweisText = hinweis.textContent, knopfText = knopf.querySelector(".fb__halten-text");
  var beschriftung = function (input) { var l = input.closest("label"); return l ? l.textContent.replace(/\s+/g, " ").trim() : input.value; };
  // Steuerzeichen raus, Länge begrenzen (maxlength im HTML lässt sich im Browser abschalten)
  var sauber = function (wert, max) { return String(wert || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max); };
  var antwort = function () {
    var w = wetter[Math.round(parseFloat(regler.value))];
    var wer = karte.querySelector("input[name=wer]:checked");
    var wichtig = Array.prototype.map.call(karte.querySelectorAll("input[name=wichtig]:checked"), beschriftung);
    return {
      "Bewertung": w.wort.replace(".", "") + " (" + w.sub.toLowerCase() + ")",
      "Wer": wer ? beschriftung(wer) : "keine Angabe",
      "Am wichtigsten": wichtig.length ? wichtig.join(", ") : "keine Angabe",
      "Nachricht": sauber(nachricht.value, MAX_TEXT),
      "Vorname": sauber(karte.querySelector("input[name=vorname]").value, 40) || "keine Angabe",
      "_subject": karte.querySelector("input[name=_subject]").value,
      "_template": "table",
      "_captcha": "false",
      "_blacklist": karte.querySelector("input[name=_blacklist]").value,
      "_honey": karte.querySelector("input[name=_honey]").value
    };
  };
  var sendet = false;
  var meldung = function (text, fehler) { hinweis.textContent = text; hinweis.classList.toggle("ist-fehler", !!fehler); };
  var danke = function () {
    knopf.classList.remove("ist-gedrueckt", "ist-voll", "ist-am-senden"); ring(0);
    var name = (karte.querySelector("input[name=vorname]").value || "").trim();
    karte.querySelector(".fb__danke-name").textContent = name ? ", " + name : "";
    regler.value = "4"; wetterSetzen();
    zeigen(5, false);
    karte.querySelector(".fb__danke").focus({ preventScroll: true });
  };
  var fehlgeschlagen = function (grund) {
    sendet = false; knopf.disabled = false;
    knopf.classList.remove("ist-gedrueckt", "ist-voll", "ist-am-senden"); ring(0); knopfText.textContent = "Halten zum Senden";
    // FormSubmit wartet noch auf die Bestätigung per Mail an die Team-Adresse: das klar sagen, nicht „nochmal versuchen“
    if (grund === "limit-ip") meldung("Von deinem Anschluss sind heute schon genug Antworten gekommen. Danke! Morgen geht es wieder.", true);
    else if (grund === "limit-gesamt") meldung("Heute sind schon sehr viele Antworten gekommen. Versuch es bitte morgen wieder oder schreib uns an skitag.team@gmail.com.", true);
    else if (/activ/i.test(grund || "")) meldung("Das Formular ist noch nicht freigeschaltet. Schreib uns bis dahin bitte an skitag.team@gmail.com.", true);
    else meldung("Das hat nicht geklappt. Halt den Knopf nochmal oder schreib uns an skitag.team@gmail.com.", true);
  };
  var abgelehnt = function (text) {
    knopf.classList.remove("ist-gedrueckt", "ist-voll", "ist-am-senden"); ring(0);
    if (text) meldung(text, true);
  };
  var fertig = function () {
    if (sendet) return;
    // Spam-Falle ausgefüllt: so tun, als wäre alles gut, aber nichts senden
    if (karte.querySelector("input[name=_honey]").value) { danke(); return; }
    // Pflichttext und Tageslimit noch einmal direkt vor dem Senden prüfen
    if (!textPruefen()) { abgelehnt(""); zeigen(3, true); return; }
    var grenze = limitHinweis();
    if (grenze) { abgelehnt(grenze); return; }
    sendet = true; knopf.disabled = true; knopf.classList.add("ist-am-senden"); knopfText.textContent = "Wird gesendet …";
    meldung(hinweisText, false);
    var abbruch = "AbortController" in window ? new AbortController() : null;
    var uhr = setTimeout(function () { if (abbruch) abbruch.abort(); }, 15000);
    fetch(ZIEL, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(antwort()), signal: abbruch ? abbruch.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        clearTimeout(uhr);
        if (x.ok && String(x.d.success) === "true") { gesendetMerken(); sendet = false; knopf.disabled = false; knopfText.textContent = "Halten zum Senden"; danke(); }
        else { if (window.console) console.warn("FormSubmit:", x.d && x.d.message); fehlgeschlagen(x.d && x.d.message); }
      })
      .catch(function () { clearTimeout(uhr); fehlgeschlagen(); });
  };
  var laufen = function (t) {
    if (!gehalten) return;
    var p = Math.min(1, (t - beginn) / dauerHalten);
    ring(p);
    // voll: kurz aufleuchten und einen Puls nach außen schicken, dann „Danke“
    if (p >= 1) { gehalten = false; knopf.classList.add("ist-voll"); setTimeout(fertig, 520); }
    else halteBild = requestAnimationFrame(laufen);
  };
  var start = function (e) {
    if (gehalten || sendet) return;
    if (e && e.cancelable) e.preventDefault();
    var grenze = limitHinweis();
    if (grenze) { meldung(grenze, true); return; }
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
  // Fokusrahmen nur bei Bedienung mit der Tastatur (das Formular fokussiert den Knopf auch beim Weiterblättern)
  window.addEventListener("keydown", function (e) { if (e.key === "Tab") document.documentElement.classList.add("mit-tastatur"); }, true);
  window.addEventListener("pointerdown", function () { document.documentElement.classList.remove("mit-tastatur"); }, true);
  knopf.addEventListener("pointerdown", start);
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (n) { knopf.addEventListener(n, stopp); });
  knopf.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) start(e); });
  knopf.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") stopp(); });
  knopf.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  // „Noch eine Antwort schicken“: alles zurück auf Anfang
  karte.querySelector(".fb__nochmal").addEventListener("click", function () {
    karte.reset(); regler.value = "3"; wetterSetzen(); zaehler.textContent = "0"; textMelden("");
    var grenze = limitHinweis(); meldung(grenze || hinweisText, !!grenze);
    zeigen(0, true);
  });
  // mit JavaScript schickt nur der Halten-Knopf ab (Enter in einem Feld soll nicht absenden)
  // ohne JavaScript prüft der Browser „required“ und „minlength“, mit JavaScript macht das textPruefen()
  karte.noValidate = true;
  karte.addEventListener("submit", function (e) { e.preventDefault(); });

  zeigen(0, false);
})();
