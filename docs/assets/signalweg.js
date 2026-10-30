// Notruf Schritt für Schritt: jeder Klick spielt den nächsten Schritt in der Szene ab.
const AUSFALL_ENDUNG = "-ausfall";

const stapel = document.querySelector(".schritte");
const schritte = [...document.querySelectorAll(".schritt")];
const wahl = document.querySelector(".schritt-wahl");
const zurueck = document.querySelector("[data-aktion=zurueck]");
const naechster = document.querySelector("[data-aktion=naechster]");
const ausfall = document.querySelector("[data-aktion=ausfall]");
const szenenBild = document.querySelector(".szene");
const SCROLL_MS = 350;
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
  const name = document.createElement("span");
  name.className = "tab-name";
  name.textContent = " " + schritt.dataset.klein;
  b.append(`${i + 1}.`, name);
  b.setAttribute("aria-label", `Schritt ${i + 1}: ${schritt.dataset.kurz}`);
  b.addEventListener("click", () => zeige(i, { merken: true }));
  li.append(b);
  wahl.append(li);
  schritt.setAttribute("role", "tabpanel");
  schritt.setAttribute("aria-labelledby", b.id);
  return b;
});

function beschrifte() {
  const letzter = aktiv === schritte.length - 1;
  if (!gestartet) naechster.textContent = "Start: Knopf drücken";
  else if (letzter) naechster.textContent = "Nochmal von vorn";
  else naechster.textContent = `Weiter zu Schritt ${aktiv + 2}: ${schritte[aktiv + 1].dataset.kurz}`;
  const zurueckMoeglich = gestartet && aktiv > 0;
  zurueck.disabled = !zurueckMoeglich;
  zurueck.textContent = zurueckMoeglich ? `Zurück zu Schritt ${aktiv}` : "Zurück";
}

// Die Szene läuft einmal durch und bleibt dann am Ende des Schritts stehen.
function spieleSzene(stoerung, verzoegerung = 0) {
  cancelAnimationFrame(bild);
  uhr?.cancel();
  uhr = null;
  const id = kurzId(schritte[aktiv]);
  if (stoerung || ohneBewegung.matches) return window.Szene.zeichne(id, 1, stoerung);
  uhr = stapel.animate([], { duration: window.Szene.dauer(id), delay: verzoegerung, fill: "backwards" });
  const schleife = () => {
    window.Szene.zeichne(id, uhr?.effect.getComputedTiming().progress ?? 1, false);
    if (uhr && uhr.playState !== "finished") bild = requestAnimationFrame(schleife);
  };
  schleife();
}

// Bei einem Klick muss die Szene ganz zu sehen sein, sonst verpasst man die Animation.
function holeSzeneInsBild() {
  const unten = szenenBild.getBoundingClientRect().bottom;
  const kopf = wahl.getBoundingClientRect().top;
  const oben = document.querySelector(".seil").getBoundingClientRect().bottom + 8;
  if (kopf >= oben && unten <= innerHeight) return 0;
  scrollBy({ top: kopf - oben, behavior: ohneBewegung.matches ? "auto" : "smooth" });
  return ohneBewegung.matches ? 0 : SCROLL_MS;
}

// Ausgeblendete Teile bleiben über die Suche des Browsers auffindbar.
function zeige(i, { stoerung = false, merken = false, ruhig = false } = {}) {
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
  ausfall.textContent = stoerung ? "Zurück zum Normalfall" : schritte[i].dataset.frage || "Was, wenn es hier ausfällt?";
  const id = kurzId(schritte[i]);
  window.Seil.fahreZu(i, { stoerung: stoerung && id !== "rueckweg" && id !== "knopf", sofort: ruhig });
  if (merken) history.replaceState(null, "", "#" + schritte[i].id + (stoerung ? AUSFALL_ENDUNG : ""));
  beschrifte();
  if (ruhig) return window.Szene.zeichne(id, 1, stoerung);
  spieleSzene(stoerung, merken ? holeSzeneInsBild() : 0);
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

// Beim Laden der Seite läuft nichts von selbst: Der Schritt aus der Adresse steht gleich am Ende.
function ausHash(ruhig = false) {
  const hash = location.hash.slice(1);
  const stoerung = hash.endsWith(AUSFALL_ENDUNG);
  const id = stoerung ? hash.slice(0, -AUSFALL_ENDUNG.length) : hash;
  const ziel = schritte.findIndex((s) => s.id === id);
  if (ziel < 0) return false;
  zeige(ziel, { stoerung, ruhig });
  document.getElementById("signalweg").scrollIntoView({ behavior: ruhig ? "instant" : "smooth" });
  return true;
}

function anfang() {
  zeige(0, { ruhig: true });
  gestartet = false;
  history.replaceState(null, "", location.pathname + location.search);
  window.Szene.zeichne("knopf", 0, false);
  beschrifte();
}

naechster.addEventListener("click", () => {
  if (aktiv === schritte.length - 1) return anfang();
  zeige(gestartet ? aktiv + 1 : 0, { merken: true });
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
addEventListener("hashchange", () => ausHash());
addEventListener("resize", miss);

miss();
if (!ausHash(true) || (aktiv === 0 && ausfall.dataset.an !== "true")) anfang();
