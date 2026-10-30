// Notruf Schritt für Schritt: wählt Schritte, fährt die Gondel und zeigt Ausfälle.
const STATION_VON_SCHRITT = { chip: 0, empfaenger: 1, server: 2, app: 3, rueckweg: 0 };
const MS_PRO_WORT = 250;
const AUSFALL_ENDUNG = "-ausfall";

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
let zeitgeber = 0;

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
  li.append(b);
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

function stoppe() {
  clearTimeout(zeitgeber);
  zeitgeber = 0;
  abspielen.textContent = "Notruf abspielen";
}

function plane() {
  const woerter = teil(schritte[aktiv], "normal").textContent.trim().split(/\s+/).length;
  zeitgeber = setTimeout(() => {
    if (aktiv === schritte.length - 1) return stoppe();
    zeige(aktiv + 1);
    plane();
  }, woerter * MS_PRO_WORT);
}

function spiele() {
  if (zeitgeber) return stoppe();
  zeige(0);
  abspielen.textContent = "Anhalten";
  plane();
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
    if (i !== aktiv) zeige(i);
    return;
  }
  stoppe();
  zeige(i, { stoerung: e.target.classList.contains("ausfall") });
});
addEventListener("hashchange", ausHash);
addEventListener("resize", miss);

miss();
if (!ausHash()) zeige(0);
