/* SkiTag · Kopfleiste auf allen Seiten (seit Feedback 51, ersetzt Seitenleiste und Handy-Seitenleiste).
   Wie bei granola.ai: ganz oben liegt sie ohne Grund und Rand über der Seite, sobald man scrollt,
   wird sie eine weiße Pille mit feinem Rand und Schatten. Die Pille ragt links und rechts etwas
   über den Inhalt hinaus, darum bewegen sich Logo, Links und Knopf dabei nicht.
   Auf der Seite eines Kapitels (Der Chip, Die App, …) fahren rechts neben seinem Namen die
   Unterkapitel aus: jeder Abschnitt in <main> mit id und data-unter="Name" wird eines davon.
   Beim Scrollen ist das Unterkapitel hervorgehoben, in dem man gerade liest.
   Passt die Leiste nicht in die Breite, öffnet ein Menü-Knopf die Seiten als Liste.
   Ohne JavaScript bleibt sie eine normale Leiste mit Links; am Handy führt dann der Fuß weiter. */
(function () {
  "use strict";
  var kopf = document.querySelector(".oben");
  if (!kopf) return;
  var wurzel = document.documentElement;
  var liste = kopf.querySelector(".oben__seiten");
  var menueKnopf = kopf.querySelector(".oben__menue-knopf");
  var menue = kopf.querySelector(".oben__menue");
  var wirKnopf = kopf.querySelector(".oben__wir");
  var ohneBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  wurzel.classList.add("js-kopf");

  /* ------------------------------------------------- aktuelle Seite -- */
  var datei = function (href) {
    var teil = (href || "").split("#")[0].split("?")[0].split("/").pop();
    return teil === "" ? "index.html" : teil;
  };
  var hier = datei(location.pathname);
  var aktivLi = null;
  liste.querySelectorAll("a").forEach(function (a) {
    if (datei(a.getAttribute("href")) === hier) { a.setAttribute("aria-current", "page"); aktivLi = a.parentElement; }
    else a.removeAttribute("aria-current");
  });
  if (wirKnopf && datei(wirKnopf.getAttribute("href")) === hier) wirKnopf.setAttribute("aria-current", "page");

  /* ---------------------------------------------------- Unterkapitel -- */
  var abschnitte = Array.prototype.slice.call(document.querySelectorAll("main [data-unter][id]"));
  var unterLinks = [];   // je Unterkapitel: Link in der Leiste und Link im Menü
  var springen = function (e) {
    var ziel = document.getElementById(this.getAttribute("href").slice(1));
    if (!ziel) return;
    e.preventDefault();
    menueZu(false);
    ziel.scrollIntoView({ behavior: ohneBewegung ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + ziel.id);
    if (e.detail > 0) this.blur();
  };
  var unterLink = function (el, i) {
    var a = document.createElement("a");
    a.href = "#" + el.id;
    a.textContent = el.getAttribute("data-unter");
    a.style.setProperty("--i", i);
    a.addEventListener("click", springen);
    return a;
  };
  if (aktivLi && abschnitte.length) {
    var unter = document.createElement("div");
    unter.className = "oben__unter";
    var innen = document.createElement("div");
    innen.className = "oben__unter-innen";
    abschnitte.forEach(function (el, i) { var a = unterLink(el, i); innen.appendChild(a); unterLinks.push([a]); });
    unter.appendChild(innen);
    aktivLi.appendChild(unter);
    aktivLi.classList.add("ist-aktiv");
    // erst ausfahren, wenn die Seite steht (Schrift geladen), damit man die Bewegung sieht
    var ausfahren = function () { requestAnimationFrame(function () { requestAnimationFrame(function () { aktivLi.classList.add("ist-offen"); }); }); };
    var schrift = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    if (ohneBewegung) aktivLi.classList.add("ist-offen");
    else Promise.race([schrift, new Promise(function (f) { setTimeout(f, 1200); })]).then(function () { setTimeout(ausfahren, 220); });
  }

  /* ------------------------------------------------------------ Menü -- */
  // Gleiche Seiten als Liste; unter der aktuellen Seite stehen ihre Unterkapitel.
  var menueListe = document.createElement("ul");
  liste.querySelectorAll(":scope > li > a").forEach(function (a) {
    var li = document.createElement("li");
    var kopie = a.cloneNode(true);
    li.appendChild(kopie);
    if (a.parentElement === aktivLi && abschnitte.length) {
      var ul = document.createElement("ul");
      abschnitte.forEach(function (el, i) { var u = unterLink(el, i); var l = document.createElement("li"); l.appendChild(u); ul.appendChild(l); unterLinks[i].push(u); });
      li.appendChild(ul);
    }
    menueListe.appendChild(li);
  });
  menue.appendChild(menueListe);

  var menueOffen = function () { return menueKnopf.getAttribute("aria-expanded") === "true"; };
  var menueAuf = function () {
    menue.hidden = false;
    menueKnopf.setAttribute("aria-expanded", "true");
    menueKnopf.setAttribute("aria-label", "Menü schließen");
    kopf.classList.add("ist-menue");
  };
  function menueZu(fokusZurueck) {
    if (!menueOffen()) return;
    menue.hidden = true;
    menueKnopf.setAttribute("aria-expanded", "false");
    menueKnopf.setAttribute("aria-label", "Menü öffnen");
    kopf.classList.remove("ist-menue");
    if (fokusZurueck) menueKnopf.focus();
  }
  menueKnopf.addEventListener("click", function () { if (menueOffen()) menueZu(false); else menueAuf(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menueOffen()) menueZu(true); });
  document.addEventListener("pointerdown", function (e) { if (menueOffen() && !kopf.contains(e.target)) menueZu(false); });

  /* ------------------------------------------- passt die Leiste? -- */
  // Gemessen mit ganz ausgefahrenen Unterkapiteln; reicht die Breite nicht, übernimmt das Menü.
  // Gemessen wird an einer unsichtbaren Kopie: an der echten Leiste würden die Unterkapitel sonst
  // kurz aufspringen und danach sichtbar wieder zufahren, bevor sie richtig ausfahren (Feedback 52).
  var breiteSetzen = function () {
    var probe = kopf.cloneNode(true);
    var probeMenue = probe.querySelector(".oben__menue");
    if (probeMenue) probeMenue.remove();
    probe.classList.remove("ist-eng", "ist-menue");
    probe.classList.add("ist-messen");
    probe.setAttribute("aria-hidden", "true");
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);
    var probePille = probe.querySelector(".oben__pille");
    var eng = probePille.scrollWidth > probePille.clientWidth + 1;
    probe.remove();
    kopf.classList.toggle("ist-eng", eng);
    if (!eng) menueZu(false);
  };

  /* ------------------------------------------------- beim Scrollen -- */
  var jetzt = -1;
  var scrollSetzen = function () {
    kopf.classList.toggle("ist-unten", window.scrollY > 8);
    if (!abschnitte.length) return;
    var linie = window.innerHeight * 0.35, nr = -1;
    abschnitte.forEach(function (el, i) { if (el.getBoundingClientRect().top <= linie) nr = i; });
    if (nr !== -1 && abschnitte[nr].getBoundingClientRect().bottom < linie * 0.5) nr = -1;   // schon darunter (Fuß)
    if (nr === jetzt) return;
    jetzt = nr;
    unterLinks.forEach(function (paar, i) {
      paar.forEach(function (a) {
        a.classList.toggle("ist-jetzt", i === nr);
        if (i === nr) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    });
  };
  var wartet = false;
  window.addEventListener("scroll", function () {
    if (wartet) return;
    wartet = true;
    requestAnimationFrame(function () { wartet = false; scrollSetzen(); });
  }, { passive: true });
  window.addEventListener("resize", function () { breiteSetzen(); scrollSetzen(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(breiteSetzen);
  breiteSetzen();
  scrollSetzen();
})();
