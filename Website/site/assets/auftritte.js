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
               · die drei Karten werden wie Spielkarten ausgeteilt (leicht gedreht, nacheinander).
               · die E-Mail-Adresse baut sich Buchstabe für Buchstabe von der Mitte aus auf. */
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
    gsap.set(chipBox, { y: -90, rotate: -9, opacity: 0 });
    gsap.set(schritte, { y: 30, opacity: 0 });
    gsap.set(status, { opacity: 0 });
    tl.to(bild, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.4 }, 0)
      .to(chipBox, { y: 0, rotate: 0, opacity: 1, duration: 1.3, ease: "back.out(1.4)" }, 0.35)
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
  var bau = alle(".wir2__bau .wir2__karte");
  if (bau.length) {
    var tlk = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    gsap.set(bau, { y: 160, x: function (i) { return handy ? 0 : [90, 0, -90][i] || 0; }, rotate: function (i) { return handy ? 0 : [-10, 3, 11][i] || 0; }, opacity: 0, transformOrigin: "50% 100%" });
    tlk.to(bau, { y: 0, x: 0, rotate: 0, opacity: 1, duration: 1.4, stagger: 0.16, clearProps: "transform" }, 0);
    alle(".wir2__bau img").forEach(function (im, i) { gsap.set(im, { scale: 1.3 }); tlk.to(im, { scale: 1, duration: 2, ease: "power3.out", clearProps: "transform" }, 0.1 + i * 0.16); });
    einmal(eins(".wir2__bau"), tlk, "top 62%");
  }
  var mail = eins(".wk__mail");
  if (mail) {
    var zeichen = teilen(mail, "chars", { charsClass: "mail-zeichen" });
    if (zeichen) {
      var tlm = gsap.timeline({ paused: true });
      gsap.set(zeichen.chars, { yPercent: 120, opacity: 0, rotate: 8 });
      tlm.to(zeichen.chars, { yPercent: 0, opacity: 1, rotate: 0, duration: 0.9, ease: "expo.out", stagger: { each: 0.025, from: "center" } });
      einmal(mail, tlm, "top 70%");
    }
  }
})();
