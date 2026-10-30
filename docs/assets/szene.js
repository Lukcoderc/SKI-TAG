// Hangszene zum Notruf: zeichnet jeden Schritt als reine Funktion von Schritt und Fortschritt.
const HANG_Y = (x) => {
  const t = Math.min(Math.max((x - 210) / 510, 0), 1);
  return 286 - 190 * Math.pow(t, 1.25);
};
const MITARBEITER_START = 540;
const MITARBEITER_ZIEL = 450;
const KOMET_LAENGE = 0.14;
const WELLEN_ABSTAND = 0.055;
const AUSFALL_ORT = {
  knopf: { text: "Fünf Sekunden zum Abbrechen" },
  chip: { x: 505, y: 162, text: "Kein Empfänger hört den Chip" },
  empfaenger: { x: 672, y: 48, text: "Der Empfänger fällt aus" },
  server: { x: 104, y: 176, text: "Server oder Internet fallen aus" },
  app: { x: 576, y: 142, text: "Niemand reagiert" },
};
const SZENE_MS = { knopf: 1500, chip: 1500, empfaenger: 1300, server: 1700, app: 2000, rueckweg: 4000 };

const sz = (id) => document.getElementById("sz-" + id);
const anteil = (p, von, bis) => Math.min(Math.max((p - von) / (bis - von), 0), 1);
const weich = (t) => t * t * (3 - 2 * t);
const szene = sz("bild");
const wege = { funk: sz("funk"), kabel: sz("kabel"), mobil: sz("mobil") };
const leds = [...document.querySelectorAll(".sz-led")];

function setzeMitarbeiter(f, tempo = 0) {
  const x = MITARBEITER_START + (MITARBEITER_ZIEL - MITARBEITER_START) * f;
  sz("mitarbeiter").setAttribute("transform", `translate(${x} ${HANG_Y(x)})`);
  sz("schnee").setAttribute("opacity", tempo);
}

function setzeKomet(weg, q, rueckwaerts = false) {
  if (q <= 0 || q >= 1) return;
  const kopf = rueckwaerts ? 1 - q : q;
  const laenge = weg.getTotalLength();
  const punkt = weg.getPointAtLength(laenge * kopf);
  weg.setAttribute("stroke-dashoffset", rueckwaerts ? -kopf : -(kopf - KOMET_LAENGE));
  weg.setAttribute("opacity", 1);
  const paket = sz("paket");
  paket.setAttribute("cx", punkt.x);
  paket.setAttribute("cy", punkt.y);
  paket.setAttribute("visibility", "visible");
}

// Funk breitet sich als Wellenbögen zum Ziel aus, der Bogen wächst mit der Entfernung.
function setzeWellen(weg, q, rueckwaerts = false) {
  if (q <= 0) return;
  const laenge = weg.getTotalLength();
  [...sz("wellen").children].forEach((welle, i) => {
    const w = q * (1 + WELLEN_ABSTAND * 3) - i * WELLEN_ABSTAND;
    if (w <= 0 || w >= 1) return;
    const kopf = rueckwaerts ? 1 - w : w;
    const hier = weg.getPointAtLength(laenge * kopf);
    const dort = weg.getPointAtLength(laenge * Math.min(kopf + 0.01, 1));
    const zurueck = weg.getPointAtLength(laenge * Math.max(kopf - 0.01, 0));
    const winkel = Math.atan2(dort.y - zurueck.y, dort.x - zurueck.x) * (180 / Math.PI) + (rueckwaerts ? 180 : 0);
    welle.setAttribute("transform", `translate(${hier.x} ${hier.y}) rotate(${winkel}) scale(${1 + w * 1.6})`);
    welle.setAttribute("opacity", Math.min(w / 0.08, 1) * (1 - w * 0.45));
  });
}

function setzeStatus(text) {
  if (sz("status").textContent === text) return;
  sz("status").textContent = text;
  szene.setAttribute("aria-label", "Szene am Hang: " + text);
}

function setzeRaute(ort) {
  const raute = sz("raute");
  raute.setAttribute("visibility", ort ? "visible" : "hidden");
  if (ort) raute.setAttribute("transform", `translate(${ort.x} ${ort.y})`);
}

function setzeServer(aktiv, p = 0) {
  leds.forEach((led, i) => led.classList.toggle("an", aktiv && (i + Math.floor(p * 26)) % 3 === 0));
}

function grundzustand() {
  Object.values(wege).forEach((w) => w.setAttribute("opacity", 0));
  [...sz("wellen").children].forEach((w) => w.setAttribute("opacity", 0));
  setzeMitarbeiter(0);
  setzeRaute(null);
  setzeServer(false);
  sz("paket").setAttribute("visibility", "hidden");
  sz("meldung").setAttribute("visibility", "hidden");
  sz("bestaetigt").setAttribute("visibility", "hidden");
  sz("telefon").classList.remove("an");
  sz("antenne").classList.remove("an");
  sz("halten").setAttribute("stroke-dashoffset", 1);
  sz("gast").setAttribute("transform", "translate(380 241) rotate(-13)");
}

const SCHRITTE = {
  knopf(p) {
    if (p === 0) return setzeStatus("Ein Gast ist gestürzt");
    sz("halten").setAttribute("stroke-dashoffset", 1 - p);
    setzeStatus("Der Knopf wird gedrückt");
  },
  chip(p) {
    setzeWellen(wege.funk, p);
    setzeStatus("Der Chip funkt");
  },
  empfaenger(p) {
    sz("antenne").classList.toggle("an", p < 0.25);
    setzeKomet(wege.kabel, anteil(p, 0.08, 1));
    setzeStatus("Der Empfänger reicht das Paket weiter");
  },
  server(p) {
    setzeServer(true, p);
    setzeWellen(wege.mobil, anteil(p, 0.5, 1));
    sz("telefon").classList.toggle("an", p > 0.95);
    setzeStatus(p < 0.5 ? "Der Server sucht den nächsten Mitarbeiter" : "Der Server schickt den Notruf");
  },
  app(p) {
    sz("telefon").classList.add("an");
    sz("meldung").setAttribute("visibility", "visible");
    sz("bestaetigt").setAttribute("visibility", p > 0.55 ? "visible" : "hidden");
    setzeStatus(p < 0.55 ? "Die App zeigt den Notruf" : "Der Mitarbeiter übernimmt");
  },
  rueckweg(p) {
    const fahrt = anteil(p, 0.06, 0.96);
    setzeMitarbeiter(weich(fahrt), fahrt > 0 && fahrt < 1 ? 1 : 0);
    setzeWellen(wege.mobil, anteil(p, 0, 0.16), true);
    setzeKomet(wege.kabel, anteil(p, 0.16, 0.32), true);
    setzeWellen(wege.funk, anteil(p, 0.32, 0.5), true);
    if (p >= 0.5 && p < 0.72) {
      sz("gast").setAttribute("transform", `translate(${380 + Math.sin(p * 150) * 1.8} 241) rotate(-13)`);
    }
    if (p < 0.5) setzeStatus("Die Bestätigung läuft zum Chip");
    else setzeStatus(p < 0.96 ? "Der Chip vibriert: Hilfe kommt" : "Der Mitarbeiter ist da");
  },
};

window.Szene = {
  dauer: (id) => SZENE_MS[id],
  zeichne(id, p, stoerung) {
    grundzustand();
    if (!stoerung || id === "rueckweg") return SCHRITTE[id](p);
    SCHRITTE[id](1);
    sz("telefon").classList.toggle("an", id === "app");
    setzeServer(false);
    const ort = AUSFALL_ORT[id];
    setzeRaute(ort.x ? ort : null);
    setzeStatus(ort.text);
    if (id === "chip") {
      [...sz("wellen").children].forEach((w) => w.setAttribute("opacity", 0));
      setzeWellen(wege.funk, 0.26);
    }
  },
};
