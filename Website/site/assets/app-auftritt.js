/* SkiTag · Die App: Auftritte (Runde 162, Luki: „alles viel besser animiert“). Nur auf app.html, nach app-seite.js.
   1. Jede Szene (Familie, Allein, Skischule) und die Tagesübersicht treten einmal auf, wenn sie ins Bild kommen:
      das Handy steigt aus der Tiefe und dreht sich gerade, dann geht sein Bildschirm an (öffnet sich aus einem Streifen
      in der Mitte), Reiter und Text steigen nacheinander dazu.
   2. Danach liegt das Handy beim Weiterscrollen ein wenig tiefer als die Seite (leichte Tiefe, an den Scroll gebunden).
   Der Wechsel zwischen den Filmen beim Antippen eines Reiters ist reines CSS (app-seite.css, „Wischen“).
   Was beim Laden schon im Bild steht, wird nicht versteckt. Ohne GSAP oder bei „weniger Bewegung“ steht alles da. */
(function () {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);
  var handy = window.matchMedia("(max-width: 860px)").matches;
  var alle = function (s, w) { return Array.prototype.slice.call((w || document).querySelectorAll(s)); };

  var auftritt = function (el, teile) {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;   // schon im Bild
    var tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    if (teile.handy) {
      var links = teile.links ? -1 : 1;
      gsap.set(teile.handy, { y: handy ? 90 : 160, rotateY: handy ? 0 : 26 * links, rotateX: 16, rotateZ: handy ? 0 : 4 * links, scale: 0.9, opacity: 0,
        transformPerspective: 1400, transformOrigin: "50% 80%" });
      tl.to(teile.handy, { y: 0, rotateY: 0, rotateX: 0, rotateZ: 0, scale: 1, opacity: 1, duration: 1.7, clearProps: "transform,opacity" }, 0);
    }
    if (teile.schirm) {
      gsap.set(teile.schirm, { clipPath: "inset(49% 6% 49% 6% round 30px)", filter: "brightness(2.2)" });
      tl.to(teile.schirm, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.05, ease: "power4.inOut", clearProps: "clipPath" }, 0.55)
        .to(teile.schirm, { filter: "brightness(1)", duration: 1.2, ease: "power2.out", clearProps: "filter" }, 0.9);
    }
    if (teile.reiter && teile.reiter.length) {
      gsap.set(teile.reiter, { y: 26, opacity: 0 });
      tl.to(teile.reiter, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, clearProps: "transform,opacity" }, 0.25);
    }
    if (teile.text && teile.text.length) {
      gsap.set(teile.text, { y: 30, opacity: 0 });
      tl.to(teile.text, { y: 0, opacity: 1, duration: 1, stagger: 0.1, clearProps: "transform,opacity" }, 0.4);
    }
    if (teile.knopf) {
      gsap.set(teile.knopf, { y: 18, scale: 0.92, opacity: 0 });
      tl.to(teile.knopf, { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.6)", clearProps: "transform,opacity" }, 0.8);
    }
    ScrollTrigger.create({ trigger: el, start: "top 68%", once: true, onEnter: function () { tl.play(); } });
  };

  alle(".szene[data-szene]").forEach(function (sz) {
    var teil = sz.querySelector(".szene__teil") ;
    var an = sz.querySelectorAll(".szene__teil")[+(sz.getAttribute("data-teil") || 0)] || teil;
    auftritt(sz, {
      handy: sz.querySelector(".app-iphone"), schirm: sz.querySelector(".app-film"), links: sz.classList.contains("szene--links"),
      reiter: alle(".szene__marken li", sz), text: an ? Array.prototype.slice.call(an.children) : []
    });
  });
  alle(".app-einzeln").forEach(function (el) {
    auftritt(el, {
      handy: el.querySelector(".app-iphone"), schirm: el.querySelector(".app-film"), links: true,
      text: alle(".app-absatz", el), knopf: el.querySelector(".app-los")
    });
  });

  // Tiefe: das Handy wandert beim Scrollen ein Stück langsamer als die Seite (am Rahmen, nicht am Handy selbst)
  if (!handy) alle(".szene__bild, .app-einzeln .app-blick__bild").forEach(function (b) {
    gsap.fromTo(b, { y: 50 }, { y: -50, ease: "none", scrollTrigger: { trigger: b, start: "top bottom", end: "bottom top", scrub: 0.6 } });
  });
})();
