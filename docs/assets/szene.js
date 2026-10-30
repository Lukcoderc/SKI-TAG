// Hangszene zum Notruf: zeichnet jeden Schritt als reine Funktion von Schritt und Fortschritt.
const HANG_Y = (x) => {
  const t = Math.min(Math.max((x - 210) / 510, 0), 1);
  return 286 - 190 * Math.pow(t, 1.25);
};
const MITARBEITER_START = 540;
const MITARBEITER_ZIEL = 450;
const KOMET_LAENGE = 0.2;
const WELLEN_ABSTAND_PX = 22;
const AUSFALL_ORT = {
  knopf: { text: "Fünf Sekunden zum Abbrechen" },
  chip: { x: 505, y: 162, text: "Kein Gateway hört den Chip" },
  empfaenger: { x: 672, y: 48, text: "Das Gateway fällt aus" },
  server: { x: 102, y: 200, text: "Server oder Netzverbindung fallen aus" },
  app: { x: 576, y: 142, text: "Niemand reagiert" },
};
const SZENE_MS = { knopf: 2000, chip: 2400, empfaenger: 1900, server: 3200, app: 2600, rueckweg: 5000 };
const FOLGE = ["knopf", "chip", "empfaenger", "server", "app", "rueckweg"];
const WELLEN_JE_GRUPPE = 4;

const sz = (id) => document.getElementById("sz-" + id);
const anteil = (p, von, bis) => Math.min(Math.max((p - von) / (bis - von), 0), 1);
const weich = (t) => t * t * (3 - 2 * t);
const szene = sz("bild");
const wege = { funk: sz("funk"), kabel: sz("kabel"), netz: sz("netz"), mobil: sz("mobil") };
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
function setzeWellen(weg, q, rueckwaerts = false, gruppe = 0) {
  if (q <= 0 || q >= 1) return;
  const laenge = weg.getTotalLength();
  const abstand = WELLEN_ABSTAND_PX / laenge;
  const wachstum = Math.min(laenge / 200, 2);
  const wellen = [...sz("wellen").children].slice(gruppe * WELLEN_JE_GRUPPE, (gruppe + 1) * WELLEN_JE_GRUPPE);
  wellen.forEach((welle, i) => {
    const w = q * (1 + abstand * (WELLEN_JE_GRUPPE - 1)) - i * abstand;
    if (w <= 0 || w >= 1) return;
    const kopf = rueckwaerts ? 1 - w : w;
    const hier = weg.getPointAtLength(laenge * kopf);
    const dort = weg.getPointAtLength(laenge * Math.min(kopf + 0.01, 1));
    const zurueck = weg.getPointAtLength(laenge * Math.max(kopf - 0.01, 0));
    const winkel = Math.atan2(dort.y - zurueck.y, dort.x - zurueck.x) * (180 / Math.PI) + (rueckwaerts ? 180 : 0);
    welle.setAttribute("transform", `translate(${hier.x} ${hier.y}) rotate(${winkel}) scale(${1.2 + w * wachstum})`);
    welle.setAttribute("opacity", Math.min(w / 0.08, 1) * (1 - w * 0.3));
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
  sz("mastlicht").classList.remove("an");
  sz("schrank").classList.remove("an");
  sz("chip").setAttribute("r", 4);
  sz("zittern").setAttribute("visibility", "hidden");
  sz("halten").setAttribute("visibility", "hidden");
  sz("gast").setAttribute("transform", "translate(380 241) rotate(-13)");
}

const SCHRITTE = {
  knopf(p) {
    if (p === 0) return setzeStatus("Eine Person ist gestürzt");
    if (p < 1) {
      sz("halten").setAttribute("visibility", "visible");
      sz("halten").setAttribute("stroke-dashoffset", 1 - p);
    }
    sz("chip").setAttribute("r", 4 + 2 * Math.abs(Math.sin(p * 18)));
    setzeStatus("Der Knopf wird gedrückt");
  },
  chip(p) {
    setzeWellen(wege.funk, anteil(p, 0, 0.62));
    setzeWellen(wege.funk, anteil(p, 0.38, 1), false, 1);
    setzeStatus("Der Chip funkt");
  },
  empfaenger(p) {
    setzeKomet(wege.kabel, anteil(p, 0.1, 1));
    setzeStatus("Das Gateway leitet das Paket weiter");
  },
  server(p) {
    sz("schrank").classList.add("an");
    setzeServer(true, p);
    setzeKomet(wege.netz, anteil(p, 0.38, 0.72));
    setzeWellen(wege.mobil, anteil(p, 0.72, 1));
    sz("mastlicht").classList.toggle("an", p >= 0.72);
    if (p < 0.38) setzeStatus("Der Server sucht den nächsten Mitarbeiter");
    else setzeStatus(p < 0.72 ? "Der Notruf geht ins Internet" : "Der Mobilfunk bringt ihn zur App");
  },
  app(p) {
    sz("meldung").setAttribute("visibility", "visible");
    sz("bestaetigt").setAttribute("visibility", p > 0.55 ? "visible" : "hidden");
    setzeStatus(p < 0.55 ? "Die App zeigt den Notruf" : "Der Mitarbeiter übernimmt");
  },
  rueckweg(p) {
    const fahrt = anteil(p, 0.06, 0.96);
    setzeMitarbeiter(weich(fahrt), fahrt > 0 && fahrt < 1 ? 1 : 0);
    setzeWellen(wege.mobil, anteil(p, 0, 0.12), true);
    setzeKomet(wege.netz, anteil(p, 0.12, 0.26), true);
    setzeKomet(wege.kabel, anteil(p, 0.26, 0.4), true);
    setzeWellen(wege.funk, anteil(p, 0.4, 0.55), true);
    if (p >= 0.55 && p < 0.8) {
      sz("gast").setAttribute("transform", `translate(${380 + Math.sin(p * 150) * 2.4} 241) rotate(-13)`);
      sz("zittern").setAttribute("visibility", "visible");
    }
    if (p < 0.55) setzeStatus("Die Bestätigung läuft zum Chip");
    else setzeStatus(p < 0.96 ? "Der Chip vibriert: Hilfe kommt" : "Der Mitarbeiter ist da");
  },
};

window.Szene = {
  dauer: (id) => SZENE_MS[id],
  zeichne(id, p, stoerung) {
    grundzustand();
    const stelle = FOLGE.indexOf(id);
    const fertig = p >= 1 ? 1 : 0;
    // Was das Signal schon erreicht hat, bleibt sichtbar.
    sz("antenne").classList.toggle("an", stelle + fertig >= 2);
    if (stelle + fertig >= 3) {
      sz("schrank").classList.add("an");
      setzeServer(true);
    }
    sz("telefon").classList.toggle("an", stelle + fertig >= 4);
    if (!stoerung || id === "rueckweg") return SCHRITTE[id](p);
    SCHRITTE[id](1);
    sz("antenne").classList.toggle("an", id === "server" || id === "app");
    sz("telefon").classList.toggle("an", id === "app");
    sz("schrank").classList.toggle("an", id === "app");
    setzeServer(id === "app");
    const ort = AUSFALL_ORT[id];
    setzeRaute(ort.x ? ort : null);
    setzeStatus(ort.text);
    if (id === "chip") {
      [...sz("wellen").children].forEach((w) => w.setAttribute("opacity", 0));
      setzeWellen(wege.funk, 0.26);
    }
  },
};
