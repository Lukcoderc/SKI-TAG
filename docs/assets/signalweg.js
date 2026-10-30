// Notruf Schritt für Schritt: wählt Schritte, fährt die Gondel und zeigt Ausfälle.
const STATION_VON_SCHRITT = { chip: 0, empfaenger: 1, server: 2, app: 3, rueckweg: 0 };
const MS_PRO_WORT = 250;
const AUSFALL_ENDUNG = "-ausfall";
const HAND_MS = 2600;

const stapel = document.querySelector(".schritte");
const schritte = [...document.querySelectorAll(".schritt")];
const wahl = document.querySelector(".schritt-wahl");
const zurueck = document.querySelector("[data-aktion=zurueck]");
const weiter = document.querySelector("[data-aktion=weiter]");
const abspielen = document.querySelector("[data-aktion=abspielen]");
const ausfall = document.querySelector("[data-aktion=ausfall]");
const teil = (s, name) => s.querySelector("." + name);
const kurzId = (s) => s.id.replace("schritt-", "");
let aktiv = 0;
let zustand = "bereit";
let lauf = null;
let uhr = null;
let bild = 0;
const balken = [];

const tabs = schritte.map((schritt, i) => {
  const li = document.createElement("li");
  li.setAttribute("role", "presentation");
  const b = document.createElement("button");
  b.type = "button";
  b.id = "tab-" + schritt.id;
  b.setAttribute("role", "tab");
  b.setAttribute("aria-controls", schritt.id);
  b.textContent = schritt.dataset.kurz;
  b.addEventListener("click", () => {
    stoppe();
    zeige(i, { merken: true });
  });
  const balkenTeil = document.createElement("span");
  balkenTeil.className = "fortschritt";
  balkenTeil.setAttribute("aria-hidden", "true");
  balken.push(balkenTeil);
  li.append(b, balkenTeil);
  wahl.append(li);
  schritt.setAttribute("role", "tabpanel");
  schritt.setAttribute("aria-labelledby", b.id);
  return b;
});

// Ausgeblendete Teile bleiben über die Suche des Browsers auffindbar.
function zeige(i, { stoerung = false, merken = false } = {}) {
  aktiv = i;
  schritte.forEach((s, n) => {
    s.hidden = n === i ? false : "until-found";
    teil(s, "normal").hidden = n === i && !stoerung ? false : "until-found";
    teil(s, "ausfall").hidden = n === i && stoerung ? false : "until-found";
    tabs[n].setAttribute("aria-selected", String(n === i));
    tabs[n].tabIndex = n === i ? 0 : -1;
  });
  ausfall.dataset.an = String(stoerung);
  ausfall.textContent = stoerung ? "Zurück zum Normalfall" : "Was, wenn es hier ausfällt?";
  zurueck.disabled = i === 0;
  weiter.disabled = i === schritte.length - 1;
  const id = kurzId(schritte[i]);
  const rueckweg = id === "rueckweg";
  window.Seil.fahreZu(STATION_VON_SCHRITT[id], { stoerung: stoerung && !rueckweg, rueckweg });
  if (merken) history.replaceState(null, "", "#" + schritte[i].id + (stoerung ? AUSFALL_ENDUNG : ""));
  beschrifte();
  zeigeSzene(stoerung);
}

// Die Szene folgt immer der laufenden Uhr: im Player dem Balken, von Hand einer eigenen kurzen Uhr.
function starteBild() {
  cancelAnimationFrame(bild);
  const id = kurzId(schritte[aktiv]);
  const schleife = () => {
    const p = ohneBewegung.matches ? 1 : uhr?.effect.getComputedTiming().progress ?? 1;
    window.Szene.zeichne(id, p, false);
    if (uhr && uhr.playState !== "finished") bild = requestAnimationFrame(schleife);
  };
  schleife();
}

function zeigeSzene(stoerung) {
  if (zustand !== "bereit") return;
  cancelAnimationFrame(bild);
  uhr?.cancel();
  uhr = null;
  if (stoerung || ohneBewegung.matches) return window.Szene.zeichne(kurzId(schritte[aktiv]), 1, stoerung);
  uhr = stapel.animate([], { duration: HAND_MS });
  starteBild();
}

function miss() {
  stapel.style.minHeight = "";
  let hoehe = 0;
  for (const s of schritte) {
    for (const name of ["normal", "ausfall"]) {
      const t = teil(s, name);
      const vorher = [s.hidden, t.hidden];
      s.hidden = t.hidden = false;
      hoehe = Math.max(hoehe, t.offsetHeight);
      [s.hidden, t.hidden] = vorher;
    }
  }
  const stil = getComputedStyle(stapel);
  stapel.style.minHeight = hoehe + parseFloat(stil.paddingTop) + parseFloat(stil.paddingBottom) + "px";
}

function beschrifte() {
  const letzter = aktiv === schritte.length - 1;
  const bereit = letzter ? "Nochmal abspielen" : aktiv === 0 ? "Notruf abspielen" : "Ab hier abspielen";
  abspielen.dataset.zustand = zustand;
  abspielen.querySelector("span").textContent = { laeuft: "Pause", pausiert: "Fortsetzen", bereit }[zustand];
}

function stoppe() {
  lauf?.cancel();
  lauf = null;
  uhr?.cancel();
  uhr = null;
  zustand = "bereit";
  balken.forEach((b) => { b.style.transform = ""; });
  beschrifte();
}

// Der Fortschrittsbalken ist der Takt: Pausiert er, pausiert der ganze Ablauf.
function fahre() {
  const woerter = teil(schritte[aktiv], "normal").textContent.trim().split(/\s+/).length;
  balken.forEach((b, n) => { b.style.transform = n < aktiv ? "scaleX(1)" : ""; });
  uhr?.cancel();
  lauf = balken[aktiv].animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: woerter * MS_PRO_WORT });
  uhr = lauf;
  starteBild();
  lauf.onfinish = () => {
    if (aktiv === schritte.length - 1) {
      stoppe();
      return starteBild();
    }
    zeige(aktiv + 1);
    fahre();
  };
}

function spiele() {
  if (zustand === "laeuft") {
    lauf.pause();
    zustand = "pausiert";
  } else if (zustand === "pausiert") {
    lauf.play();
    zustand = "laeuft";
  } else {
    zustand = "laeuft";
    zeige(aktiv === schritte.length - 1 ? 0 : aktiv);
    fahre();
  }
  beschrifte();
}

function ausHash() {
  const hash = location.hash.slice(1);
  const stoerung = hash.endsWith(AUSFALL_ENDUNG);
  const id = stoerung ? hash.slice(0, -AUSFALL_ENDUNG.length) : hash;
  const ziel = schritte.findIndex((s) => s.id === id);
  if (ziel < 0) return false;
  stoppe();
  zeige(ziel, { stoerung });
  document.getElementById("signalweg").scrollIntoView();
  return true;
}

zurueck.addEventListener("click", () => { stoppe(); zeige(aktiv - 1, { merken: true }); });
weiter.addEventListener("click", () => { stoppe(); zeige(aktiv + 1, { merken: true }); });
abspielen.addEventListener("click", spiele);
ausfall.addEventListener("click", () => {
  stoppe();
  zeige(aktiv, { stoerung: ausfall.dataset.an !== "true", merken: true });
});
wahl.addEventListener("keydown", (e) => {
  const richtung = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!richtung) return;
  e.preventDefault();
  const neu = (aktiv + richtung + schritte.length) % schritte.length;
  stoppe();
  zeige(neu, { merken: true });
  tabs[neu].focus();
});
stapel.addEventListener("beforematch", (e) => {
  const i = schritte.indexOf(e.target.closest(".schritt"));
  if (e.target.classList.contains("schritt")) {
    if (i !== aktiv) {
      stoppe();
      zeige(i);
    }
    return;
  }
  stoppe();
  zeige(i, { stoerung: e.target.classList.contains("ausfall") });
});
addEventListener("hashchange", ausHash);
addEventListener("resize", miss);

miss();
if (!ausHash()) {
  zeige(0);
  cancelAnimationFrame(bild);
  uhr?.cancel();
  uhr = null;
  window.Szene.zeichne("chip", 0, false);
}
