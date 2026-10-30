// Notruf Schritt für Schritt: jeder Klick spielt den nächsten Schritt in der Szene ab.
const STATION_VON_SCHRITT = { chip: 0, empfaenger: 1, server: 2, app: 3, rueckweg: 0 };
const AUSFALL_ENDUNG = "-ausfall";

const stapel = document.querySelector(".schritte");
const schritte = [...document.querySelectorAll(".schritt")];
const wahl = document.querySelector(".schritt-wahl");
const zurueck = document.querySelector("[data-aktion=zurueck]");
const naechster = document.querySelector("[data-aktion=naechster]");
const ausfall = document.querySelector("[data-aktion=ausfall]");
const teil = (s, name) => s.querySelector("." + name);
const kurzId = (s) => s.id.replace("schritt-", "");
let aktiv = 0;
let gestartet = false;
let uhr = null;
let bild = 0;

const tabs = schritte.map((schritt, i) => {
  const li = document.createElement("li");
  li.setAttribute("role", "presentation");
  const b = document.createElement("button");
  b.type = "button";
  b.id = "tab-" + schritt.id;
  b.setAttribute("role", "tab");
  b.setAttribute("aria-controls", schritt.id);
  b.textContent = schritt.dataset.kurz;
  b.addEventListener("click", () => zeige(i, { merken: true }));
  li.append(b);
  wahl.append(li);
  schritt.setAttribute("role", "tabpanel");
  schritt.setAttribute("aria-labelledby", b.id);
  return b;
});

function beschrifte() {
  const letzter = aktiv === schritte.length - 1;
  if (!gestartet) naechster.textContent = "Notruf starten";
  else if (letzter) naechster.textContent = "Nochmal von vorn";
  else naechster.textContent = "Weiter: " + schritte[aktiv + 1].dataset.kurz;
  zurueck.disabled = !gestartet || aktiv === 0;
}

// Die Szene läuft einmal durch und bleibt dann am Ende des Schritts stehen.
function spieleSzene(stoerung) {
  cancelAnimationFrame(bild);
  uhr?.cancel();
  uhr = null;
  const id = kurzId(schritte[aktiv]);
  if (stoerung || ohneBewegung.matches) return window.Szene.zeichne(id, 1, stoerung);
  uhr = stapel.animate([], { duration: window.Szene.dauer(id) });
  const schleife = () => {
    window.Szene.zeichne(id, uhr?.effect.getComputedTiming().progress ?? 1, false);
    if (uhr && uhr.playState !== "finished") bild = requestAnimationFrame(schleife);
  };
  schleife();
}

// Ausgeblendete Teile bleiben über die Suche des Browsers auffindbar.
function zeige(i, { stoerung = false, merken = false } = {}) {
  aktiv = i;
  gestartet = true;
  schritte.forEach((s, n) => {
    s.hidden = n === i ? false : "until-found";
    teil(s, "normal").hidden = n === i && !stoerung ? false : "until-found";
    teil(s, "ausfall").hidden = n === i && stoerung ? false : "until-found";
    tabs[n].setAttribute("aria-selected", String(n === i));
    tabs[n].tabIndex = n === i ? 0 : -1;
  });
  ausfall.dataset.an = String(stoerung);
  ausfall.textContent = stoerung ? "Zurück zum Normalfall" : "Was, wenn es hier ausfällt?";
  const id = kurzId(schritte[i]);
  const rueckweg = id === "rueckweg";
  window.Seil.fahreZu(STATION_VON_SCHRITT[id], { stoerung: stoerung && !rueckweg, rueckweg });
  if (merken) history.replaceState(null, "", "#" + schritte[i].id + (stoerung ? AUSFALL_ENDUNG : ""));
  beschrifte();
  spieleSzene(stoerung);
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

function ausHash() {
  const hash = location.hash.slice(1);
  const stoerung = hash.endsWith(AUSFALL_ENDUNG);
  const id = stoerung ? hash.slice(0, -AUSFALL_ENDUNG.length) : hash;
  const ziel = schritte.findIndex((s) => s.id === id);
  if (ziel < 0) return false;
  zeige(ziel, { stoerung });
  document.getElementById("signalweg").scrollIntoView();
  return true;
}

naechster.addEventListener("click", () => {
  const letzter = aktiv === schritte.length - 1;
  zeige(!gestartet || letzter ? 0 : aktiv + 1, { merken: true });
});
zurueck.addEventListener("click", () => zeige(aktiv - 1, { merken: true }));
ausfall.addEventListener("click", () => zeige(aktiv, { stoerung: ausfall.dataset.an !== "true", merken: true }));
wahl.addEventListener("keydown", (e) => {
  const richtung = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!richtung) return;
  e.preventDefault();
  const neu = (aktiv + richtung + schritte.length) % schritte.length;
  zeige(neu, { merken: true });
  tabs[neu].focus();
});
stapel.addEventListener("beforematch", (e) => {
  const i = schritte.indexOf(e.target.closest(".schritt"));
  if (e.target.classList.contains("schritt")) {
    if (i !== aktiv) zeige(i);
    return;
  }
  zeige(i, { stoerung: e.target.classList.contains("ausfall") });
});
addEventListener("hashchange", ausHash);
addEventListener("resize", miss);

miss();
if (!ausHash()) {
  zeige(0);
  gestartet = false;
  cancelAnimationFrame(bild);
  uhr?.cancel();
  uhr = null;
  window.Szene.zeichne("chip", 0, false);
  beschrifte();
}
