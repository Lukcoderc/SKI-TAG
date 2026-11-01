// Karte der Abdeckung: Gateways an- und ausschalten, jeder Pistenpunkt zeigt das beste Signal.
const GUT_DBM = -115;
const KNAPP_DBM = -125;
const ORT_RAND = 44;
const { breite, hoehe, punkte, gateways, orte, start } = window.ABDECKUNG;
const karte = document.getElementById("abd-karte");
const liste = document.getElementById("abd-liste");
const zuschlagRegler = document.getElementById("abd-zuschlag");

karte.setAttribute("viewBox", `0 0 ${breite} ${hoehe}`);
const spur = (klasse) => {
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("class", klasse);
  karte.append(p);
  return p;
};
const spuren = { gut: spur("abd-gut"), knapp: spur("abd-knapp"), kein: spur("abd-kein") };

orte.forEach((ort) => {
  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("x", ort.x);
  text.setAttribute("y", Math.max(ort.y, ORT_RAND));
  text.setAttribute("class", "abd-ort");
  text.textContent = ort.name;
  karte.append(text);
});

const haken = gateways.map((g, i) => {
  const li = document.createElement("li");
  const label = document.createElement("label");
  const feld = document.createElement("input");
  feld.type = "checkbox";
  feld.checked = i < start;
  feld.addEventListener("change", zeichne);
  const name = document.createElement("span");
  name.textContent = `${g.name}, ${g.hoehe} m`;
  label.append(feld, name);
  li.append(label);
  liste.append(li);
  const raute = document.createElementNS(SVG_NS, "rect");
  raute.setAttribute("x", g.x - 7);
  raute.setAttribute("y", g.y - 7);
  raute.setAttribute("width", 14);
  raute.setAttribute("height", 14);
  raute.setAttribute("transform", `rotate(45 ${g.x} ${g.y})`);
  karte.append(raute);
  g.marke = raute;
  return feld;
});

function zeichne() {
  const zuschlag = +zuschlagRegler.value;
  const aktiv = gateways.filter((_, i) => haken[i].checked);
  const wege = { gut: [], knapp: [], kein: [] };
  let gut = 0, knapp = 0, doppelt = 0;
  punkte.forEach(([x, y], i) => {
    const pegel = aktiv.map((g) => g.pegel[i] - zuschlag);
    const bester = pegel.length ? Math.max(...pegel) : -999;
    const klasse = bester >= GUT_DBM ? "gut" : bester >= KNAPP_DBM ? "knapp" : "kein";
    if (klasse === "gut") gut++;
    if (klasse !== "kein") knapp++;
    if (pegel.filter((p) => p >= GUT_DBM).length >= 2) doppelt++;
    wege[klasse].push(`M${x} ${y}h0`);
  });
  Object.keys(spuren).forEach((k) => spuren[k].setAttribute("d", wege[k].join("")));
  gateways.forEach((g, i) => g.marke.setAttribute("class", haken[i].checked ? "abd-gateway an" : "abd-gateway"));
  const anteil = (n) => `${zahlDe((n / punkte.length) * 100)} %`;
  document.getElementById("abd-zuschlag-wert").textContent = `${zuschlag} dB`;
  document.getElementById("abd-zahl").textContent = aktiv.length;
  document.getElementById("abd-gut").textContent = anteil(gut);
  document.getElementById("abd-knapp").textContent = anteil(knapp);
  document.getElementById("abd-doppelt").textContent = anteil(doppelt);
}

zuschlagRegler.addEventListener("input", zeichne);
zeichne();
