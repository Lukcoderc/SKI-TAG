/* SkiTag · Auftritte auf den Unterseiten (Feedback 131), mit GSAP (ScrollTrigger, SplitText). Jede Stelle bekommt eine
   eigene Bewegung, die zu ihrem Inhalt passt; jede läuft einmal, sobald die Stelle richtig im Bild ist (nicht schon, wenn
   man sie unten anschneidet) (außer „Unser Ziel“,
   das dem Scrollen folgt). Bewegt werden nur transform, opacity und clip-path. Ohne GSAP oder bei „weniger Bewegung“
   steht alles einfach da.
   Der Chip    · „Probiere den Tag aus“: die Fotofläche öffnet sich wie ein Fenster, der Chip fällt sanft hinein,
                 die drei Schritte steigen nacheinander auf.
               · „Zwei Stürze. Zwei Wege zur Hilfe.“: die erste Zeile kommt von links, die zweite von rechts (zwei Wege),
                 die Bergszene öffnet sich von der Mitte nach außen.
   Die App     · „Ein Code. Kein Konto.“: das iPhone wird wie aufgehoben (dreht sich aus der Schräge gerade), die drei
                 Zugänge springen nacheinander auf.
               · „Fragen zur App?“: das dunkle Band zieht sich von der Mitte auf, Text und Knopf folgen.
   Feedback    · die Karte klappt von unten hoch, das Foto wischt von links herein, die Frage folgt.
   Das sind wir· „Unser Ziel“: der große Satz wird Wort für Wort hell, während man liest (am Scrollen).
               · die drei Porträts werden wie Spielkarten ausgeteilt (leicht gedreht, nacheinander), der
                 Anfangsbuchstabe steigt auf, Name und Rolle folgen (Feedback 137).
               · Kontakt: Überschrift Wort für Wort, dann die Adresse Buchstabe für Buchstabe von links, der Strich
                 darunter zieht sich auf (Feedback 136). */
(function () {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  var handy = window.matchMedia("(max-width: 860px)").matches;
  var eins = function (s, w) { return (w || document).querySelector(s); };
  var alle = function (s, w) { return Array.prototype.slice.call((w || document).querySelectorAll(s)); };
  // einmal abspielen, sobald der Auslöser bei „start“ ist; steht er beim Laden schon dort, gleich
  var einmal = function (ausloeser, tl, start) { ScrollTrigger.create({ trigger: ausloeser, start: start || "top 55%", once: true, onEnter: function () { tl.play(); } }); };
  var teilen = function (el, art, extra) { return window.SplitText ? SplitText.create(el, Object.assign({ type: art }, extra || {})) : null; };

  /* ---------------------------------------------------------------- Der Chip: Probiere den Tag aus -- */
  var knopf = document.getElementById("der-chip");
  if (knopf) {
    var bild = eins(".knopf__bild", knopf), chipBox = eins(".knopf__chip", knopf), schritte = alle(".knopf__schritte li", knopf), status = eins(".knopf__status", knopf);
    var tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    gsap.set(bild, { clipPath: "inset(18% 22% 18% 22% round 48px)" });
    // Der Anker ist per CSS mit translate: -50% -50% zentriert. GSAP übernimmt das in transform, verlor aber die senkrechte
    // Hälfte, weil hier y animiert wird: der Chip saß dann eine halbe Höhe zu tief und der Knopf war unten abgeschnitten
    // (Feedback 141). Deshalb die Zentrierung ausdrücklich als xPercent/yPercent mitführen.
    // Fliegt der Chip in 3D herein (chip-flug.js, Klasse chipflug), übernimmt der Flug den Auftritt
    var flug = document.documentElement.classList.contains("chipflug");
    // Feedback 153: der Chip fiel von 90 px über der Fläche herein und hing dabei (und bei frühem Antippen) über den Rand
    // hinaus. Jetzt wächst er in der Fläche auf, ohne Überschwingen nach außen.
    if (!flug) gsap.set(chipBox, { translate: "none", xPercent: -50, yPercent: -50, x: 0, y: 18, scale: 0.86, opacity: 0 });   // x: 0, sonst liest GSAP die CSS-Zentrierung zusätzlich als Pixel ein
    gsap.set(schritte, { y: 30, opacity: 0 });
    gsap.set(status, { opacity: 0 });
    tl.to(bild, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.4 }, 0);
    if (!flug) tl.to(chipBox, { y: 0, scale: 1, opacity: 1, duration: 1.1, ease: "power3.out" }, 0.35);
    tl
      .to(schritte, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 }, 0.25)
      .to(status, { opacity: 1, duration: 0.8, clearProps: "opacity" }, 0.8)
      .set(bild, { clearProps: "clipPath" });
    einmal(knopf, tl, "top 55%");
  }

  /* ---------------------------------------------------------------- Der Chip: Zwei Wege -- */
  var weg = document.getElementById("weg");
  if (weg) {
    var h = eins("#weg-titel", weg), berg = eins(".berg", weg), lede = eins(".weg__lede", weg), auge = eins(".augenbraue", weg);
    var leise = h && eins(".leise", h);
    var tlw = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    if (h && leise) {
      // erste Zeile ist der Text vor dem <br>: als eigenes Stück verpacken
      var erste = document.createElement("span"); erste.className = "weg-zeile";
      while (h.firstChild && h.firstChild.nodeName !== "BR") erste.appendChild(h.firstChild);
      h.insertBefore(erste, h.firstChild);
      var br = erste.nextSibling; if (br && br.nodeName === "BR") br.remove();   // beide Zeilen als eigene Blöcke, sonst rückt die zweite ein
      erste.style.display = leise.style.display = "block";
      gsap.set(erste, { x: handy ? -60 : -160, opacity: 0 }); gsap.set(leise, { x: handy ? 60 : 160, opacity: 0 });
      tlw.to(erste, { x: 0, opacity: 1, duration: 1.3 }, 0.1).to(leise, { x: 0, opacity: 1, duration: 1.3 }, 0.25);
    }
    gsap.set([auge, lede], { y: 20, opacity: 0 });
    tlw.to(auge, { y: 0, opacity: 1, duration: 0.8 }, 0).to(lede, { y: 0, opacity: 1, duration: 0.9 }, 0.45);
    if (berg) { gsap.set(berg, { clipPath: "inset(0% 50% 0% 50%)" }); tlw.to(berg, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power4.inOut", clearProps: "clipPath" }, 0.5); }
    einmal(weg, tlw);
  }

  /* ---------------------------------------------------------------- Die App: Ein Code. Kein Konto. -- */
  var blick = document.getElementById("ueberblick");
  if (blick) {
    var iphone = eins(".app-iphone", blick), absaetze = alle(".app-absatz", blick), zugaenge = alle(".app-zugaenge li", blick);
    var tla = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    gsap.set(iphone, { y: 140, rotateY: handy ? 0 : -32, rotateX: 18, rotateZ: handy ? 0 : 6, opacity: 0, transformPerspective: 1400, transformOrigin: "50% 80%" });
    gsap.set(absaetze, { y: 24, opacity: 0 });
    gsap.set(zugaenge, { y: 26, scale: 0.86, opacity: 0 });
    tla.to(iphone, { y: 0, rotateY: 0, rotateX: 0, rotateZ: 0, opacity: 1, duration: 1.8 }, 0)
      .to(absaetze, { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.2)
      .to(zugaenge, { y: 0, scale: 1, opacity: 1, duration: 0.9, stagger: 0.1, ease: "back.out(1.7)" }, 0.6);
    einmal(blick, tla, "top 50%");
  }
  var band = eins(".app-kontakt");
  if (band) {
    var tlb = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    var bandText = alle("h3, p", band), bandKnopf = eins(".app-kontakt__knopf", band);
    // Start und Ende in derselben Form (vier verschiedene Werte), sonst kürzt der Browser „inset(0% 38% 0% 38%)“ ab und
    // GSAP öffnet das Band nur von einer Seite
    gsap.set(bandText, { x: -30, opacity: 0 }); gsap.set(bandKnopf, { x: 30, opacity: 0 });
    tlb.fromTo(band, { clipPath: "inset(0.1% 38.1% 0.2% 37.9% round 60px)" }, { clipPath: "inset(0% 0.01% 0% 0.02% round 28px)", duration: 1.3, ease: "power4.inOut", clearProps: "clipPath", immediateRender: true }, 0)
      .to(bandText, { x: 0, opacity: 1, duration: 0.9, stagger: 0.08, clearProps: "transform,opacity" }, 0.6)
      .to(bandKnopf, { x: 0, opacity: 1, duration: 1, clearProps: "transform,opacity" }, 0.75);
    einmal(band, tlb, "top 70%");
  }

  /* ---------------------------------------------------------------- Feedback: Karte -- */
  var karte = eins(".fb__karte");
  if (karte) {
    var szene = eins(".fb__szene", karte), fragen = eins(".fb__fragen", karte);
    var tlf = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    gsap.set(karte, { y: 90, rotateX: 14, opacity: 0, transformPerspective: 1600, transformOrigin: "50% 100%" });
    gsap.set(szene, { clipPath: "inset(0% 100% 0% 0%)" });
    gsap.set(fragen, { x: 40, opacity: 0 });
    tlf.to(karte, { y: 0, rotateX: 0, opacity: 1, duration: 1.4, clearProps: "transform" }, 0)
      .to(szene, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power4.inOut", clearProps: "clipPath" }, 0.3)
      .to(fragen, { x: 0, opacity: 1, duration: 1, clearProps: "transform,opacity" }, 0.6);
    einmal(karte, tlf, "top 80%");
  }

  /* ---------------------------------------------------------------- Das sind wir -- */
  var satz = eins(".wir2__satz");
  if (satz) {
    var woerter = teilen(satz, "words", { wordsClass: "ziel-wort" });
    if (woerter) {
      gsap.set(woerter.words, { opacity: 0.16 });
      gsap.to(woerter.words, { opacity: 1, ease: "none", stagger: 0.1,
        scrollTrigger: { trigger: satz, start: "top 72%", end: "bottom 35%", scrub: 0.5 } });
    }
  }
  /* Die drei Porträts (Feedback 137) werden wie Karten ausgeteilt: von unten, leicht gedreht, nacheinander; in jeder
     Fläche steigt danach der Anfangsbuchstabe auf, Name und Rolle folgen. */
  var leute = alle(".wir2__person");
  if (leute.length) {
    // während des Austeilens keine CSS-Übergänge (das Anheben beim Darüberfahren würde sonst gegen GSAP arbeiten)
    var liste = eins(".wir2__leute");
    liste.classList.add("wird-ausgeteilt");
    var tlp = gsap.timeline({ paused: true, defaults: { ease: "expo.out" }, onComplete: function () { liste.classList.remove("wird-ausgeteilt"); } });
    var flaechen = leute.map(function (p) { return eins(".wir2__portrait", p); });
    var buchst = leute.map(function (p) { return eins(".wir2__initial", p); }).filter(Boolean);   // wer schon ein Foto hat, hat keinen Buchstaben
    var texte = leute.map(function (p) { return alle(".titel-3, .wir2__rolle", p); });
    gsap.set(flaechen, { y: handy ? 80 : 140, x: function (i) { return handy ? 0 : [70, 0, -70][i] || 0; }, rotate: function (i) { return handy ? 0 : [-8, 2, 9][i] || 0; }, opacity: 0, transformOrigin: "50% 100%" });
    gsap.set(buchst, { yPercent: 40, opacity: 0 });
    gsap.set(texte, { y: 14, opacity: 0 });
    tlp.to(flaechen, { y: 0, x: 0, rotate: 0, opacity: 1, duration: 1.3, stagger: 0.14, clearProps: "transform,opacity" }, 0);
    tlp.to(buchst, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.14, clearProps: "transform,opacity" }, 0.45);
    texte.forEach(function (t, i) { tlp.to(t, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, clearProps: "transform,opacity" }, 0.7 + i * 0.14); });
    einmal(liste, tlp, "top 78%");
  }
  /* Kontakt (Feedback 136): ein ruhiger Ablauf statt gedrehter Buchstaben. Kennzeile, dann die Überschrift Wort für Wort
     aus einer Maske, der Satz, die Adresse Buchstabe für Buchstabe von links, der Strich darunter zieht sich auf,
     zuletzt Hinweis, Knopf und Fußzeile. */
  var kontakt = eins(".wir2__kontakt");
  if (kontakt) {
    var kAuge = eins(".auge", kontakt), kTitel = eins(".titel-2", kontakt), kLead = eins(".lead", kontakt), kMail = eins(".wk__mail", kontakt);
    var kRest = alle(".wk__tipp, .wk__schreiben, .wk__fuss", kontakt);
    var kWorte = teilen(kTitel, "words", { mask: "words" }), kZeichen = kMail && teilen(kMail, "chars", { mask: "chars", charsClass: "mail-zeichen" });
    var tlc = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    gsap.set(kAuge, { opacity: 0, y: 12 });
    gsap.set([kLead].concat(kRest), { opacity: 0, y: 18 });
    tlc.to(kAuge, { opacity: 1, y: 0, duration: 0.7, clearProps: "transform" }, 0);
    if (kWorte) { gsap.set(kWorte.words, { yPercent: 110 }); tlc.to(kWorte.words, { yPercent: 0, duration: 1.1, stagger: 0.08 }, 0.1); }
    tlc.to(kLead, { opacity: 1, y: 0, duration: 0.9, clearProps: "transform" }, 0.45);
    if (kMail) {
      gsap.set(kMail, { "--strich": 0 });
      if (kZeichen) { gsap.set(kZeichen.chars, { yPercent: 105 }); tlc.to(kZeichen.chars, { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.022 }, 0.7); }
      tlc.to(kMail, { "--strich": 1, duration: 0.9, ease: "power3.inOut" }, 1.05);
    }
    tlc.to(kRest, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, clearProps: "transform" }, 1.3);
    einmal(kontakt, tlc, "top 72%");
  }
})();
