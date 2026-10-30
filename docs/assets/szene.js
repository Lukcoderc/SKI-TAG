// Hangszene zum Notruf: zeichnet jeden Schritt als reine Funktion von Schritt und Fortschritt.
const HANG_Y = (x) => {
  const t = Math.min(Math.max((x - 210) / 510, 0), 1);
  return 286 - 190 * Math.pow(t, 1.25);
};
const MITARBEITER_START = 540;
const MITARBEITER_ZIEL = 450;
const KOMET_LAENGE = 0.14;
const AUSFALL_ORT = {
  chip: { x: 520, y: 150, text: "Kein Empfänger hört den Chip" },
  empfaenger: { x: 672, y: 48, text: "Der Empfänger fällt aus" },
  server: { x: 104, y: 176, text: "Server oder Internet fallen aus" },
  app: { x: 576, y: 142, text: "Niemand reagiert" },
};
const SZENE_MS = { chip: 2200, empfaenger: 1300, server: 1700, app: 2000, rueckweg: 4000 };

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

function setzeRinge(x, y, p, reichweite = 230) {
  const ringe = sz("ringe");
  ringe.setAttribute("transform", `translate(${x} ${y})`);
  [...ringe.children].forEach((ring, i) => {
    const t = anteil(p, i * 0.22, 0.56 + i * 0.22);
    ring.setAttribute("r", 14 + weich(t) * reichweite);
    ring.setAttribute("opacity", t > 0 && t < 1 ? 1 - t : 0);
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
  [...sz("ringe").children].forEach((r) => r.setAttribute("opacity", 0));
  setzeMitarbeiter(0);
  setzeRaute(null);
  setzeServer(false);
  sz("paket").setAttribute("visibility", "hidden");
  sz("meldung").setAttribute("visibility", "hidden");
  sz("bestaetigt").setAttribute("visibility", "hidden");
  sz("telefon").classList.remove("an");
  sz("antenne").classList.remove("an");
  sz("sos").setAttribute("visibility", "visible");
  sz("halten").setAttribute("stroke-dashoffset", 1);
  sz("gast").setAttribute("transform", "translate(380 241) rotate(-13)");
}

const SCHRITTE = {
  chip(p) {
    sz("sos").setAttribute("visibility", p < 0.42 ? "hidden" : "visible");
    if (p === 0) return setzeStatus("Ein Gast ist gestürzt");
    if (p < 0.42) {
      sz("halten").setAttribute("stroke-dashoffset", 1 - p / 0.42);
      return setzeStatus("Der Gast hält den Knopf");
    }
    const funk = anteil(p, 0.42, 1);
    setzeRinge(380, 230, funk);
    setzeKomet(wege.funk, funk);
    setzeStatus("Der Chip funkt den Notruf");
  },
  empfaenger(p) {
    sz("antenne").classList.toggle("an", p < 0.25);
    setzeKomet(wege.kabel, anteil(p, 0.08, 1));
    setzeStatus("Der Empfänger reicht das Paket weiter");
  },
  server(p) {
    setzeServer(true, p);
    setzeKomet(wege.mobil, anteil(p, 0.5, 1));
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
    setzeKomet(wege.mobil, anteil(p, 0, 0.14), true);
    setzeKomet(wege.kabel, anteil(p, 0.14, 0.32), true);
    if (p >= 0.32 && p < 0.5) setzeRinge(672, 64, anteil(p, 0.32, 0.5), 200);
    setzeKomet(wege.funk, anteil(p, 0.32, 0.5), true);
    if (p >= 0.5 && p < 0.72) {
      sz("gast").setAttribute("transform", `translate(${380 + Math.sin(p * 150) * 1.8} 241) rotate(-13)`);
    }
    if (p < 0.5) setzeStatus("Die Antwort läuft zurück zum Chip");
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
    setzeRaute(AUSFALL_ORT[id]);
    setzeStatus(AUSFALL_ORT[id].text);
  },
};
