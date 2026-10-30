// Hangszene zum Notruf: zeichnet jeden Schritt als reine Funktion von Schritt und Fortschritt.
const HANG_Y = (x) => 215 - 0.242 * x;
const MITARBEITER_START = 440;
const MITARBEITER_ZIEL = 292;
const AUSFALL_ORT = {
  chip: { x: 405, y: 83, text: "Kein Empfänger hört den Chip" },
  empfaenger: { x: 562, y: 30, text: "Der Empfänger fällt aus" },
  server: { x: 75, y: 150, text: "Server oder Internet fallen aus" },
  app: { x: 478, y: 82, text: "Niemand reagiert" },
};

const sz = (id) => document.getElementById("sz-" + id);
const anteil = (p, von, bis) => Math.min(Math.max((p - von) / (bis - von), 0), 1);
const szene = sz("bild");
const wege = { funk: sz("funk"), netz: sz("netz"), mobil: sz("mobil") };

function setzeMitarbeiter(f) {
  const x = MITARBEITER_START + (MITARBEITER_ZIEL - MITARBEITER_START) * f;
  sz("mitarbeiter").setAttribute("transform", `translate(${x} ${HANG_Y(x)})`);
}

function setzePaket(weg, q, rueckwaerts = false) {
  const laenge = weg.getTotalLength();
  const punkt = weg.getPointAtLength(laenge * (rueckwaerts ? 1 - q : q));
  const paket = sz("paket");
  paket.setAttribute("cx", punkt.x);
  paket.setAttribute("cy", punkt.y);
  paket.setAttribute("visibility", "visible");
}

function setzeRinge(sichtbar, p) {
  document.querySelectorAll("#sz-ringe circle").forEach((ring, i) => {
    const t = (p * 3 + i / 3) % 1;
    ring.setAttribute("r", 12 + t * 46);
    ring.setAttribute("opacity", sichtbar ? 1 - t : 0);
  });
}

function setzeWege(funk, netz, mobil) {
  wege.funk.classList.toggle("an", funk);
  wege.netz.classList.toggle("an", netz);
  wege.mobil.classList.toggle("an", mobil);
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

function grundzustand() {
  setzeRinge(false, 0);
  setzeWege(false, false, false);
  setzeMitarbeiter(0);
  setzeRaute(null);
  sz("paket").setAttribute("visibility", "hidden");
  sz("meldung").setAttribute("visibility", "hidden");
  sz("sos").setAttribute("visibility", "visible");
  sz("server-haus").classList.remove("aktiv");
  sz("halten").setAttribute("stroke-dashoffset", 1);
  sz("gast").removeAttribute("transform");
}

const SCHRITTE = {
  chip(p) {
    const halten = anteil(p, 0, 0.4);
    sz("sos").setAttribute("visibility", p < 0.4 ? "hidden" : "visible");
    if (p === 0) return setzeStatus("Ein Gast ist gestürzt");
    sz("halten").setAttribute("stroke-dashoffset", p < 0.4 ? 1 - halten : 1);
    if (p < 0.4) return setzeStatus("Der Gast hält den Knopf");
    setzeRinge(true, p);
    setzePaket(wege.funk, anteil(p, 0.4, 1));
    setzeStatus("Der Chip funkt den Notruf");
  },
  empfaenger(p) {
    setzeWege(true, false, false);
    setzePaket(wege.netz, p);
    setzeStatus("Der Empfänger reicht das Paket weiter");
  },
  server(p) {
    setzeWege(true, true, false);
    sz("server-haus").classList.add("aktiv");
    if (p < 0.5) return setzeStatus("Der Server sucht den nächsten Mitarbeiter");
    setzePaket(wege.mobil, anteil(p, 0.5, 1));
    setzeStatus("Der Server schickt den Notruf");
  },
  app(p) {
    setzeWege(true, true, true);
    sz("meldung").setAttribute("visibility", "visible");
    setzeMitarbeiter(0.12 * anteil(p, 0.6, 1));
    setzeStatus(p < 0.6 ? "Die App zeigt den Notruf" : "Der Mitarbeiter übernimmt");
  },
  rueckweg(p) {
    setzeWege(p >= 0.45 && p < 0.65, p >= 0.2 && p < 0.45, p < 0.2);
    setzeMitarbeiter(0.12 + 0.88 * anteil(p, 0, 0.95));
    if (p < 0.2) setzePaket(wege.mobil, anteil(p, 0, 0.2), true);
    else if (p < 0.45) setzePaket(wege.netz, anteil(p, 0.2, 0.45), true);
    else if (p < 0.65) setzePaket(wege.funk, anteil(p, 0.45, 0.65), true);
    if (p >= 0.65 && p < 0.95) {
      sz("gast").setAttribute("transform", `translate(${Math.sin(p * 120) * 1.6} 0)`);
    }
    if (p < 0.65) setzeStatus("Die Antwort läuft zurück zum Chip");
    else setzeStatus(p < 0.95 ? "Der Chip vibriert: Hilfe kommt" : "Der Mitarbeiter ist da");
  },
};

window.Szene = {
  zeichne(id, p, stoerung) {
    grundzustand();
    if (!stoerung || id === "rueckweg") return SCHRITTE[id](p);
    const ort = AUSFALL_ORT[id];
    SCHRITTE[id](1);
    sz("paket").setAttribute("visibility", "hidden");
    setzeRaute(ort);
    setzeStatus(ort.text);
    if (id !== "app") setzeRinge(id === "chip", 0.2);
    if (id === "empfaenger") setzeWege(false, false, false);
    if (id === "server") setzeWege(true, false, false);
    if (id === "server") sz("server-haus").classList.remove("aktiv");
  },
};
