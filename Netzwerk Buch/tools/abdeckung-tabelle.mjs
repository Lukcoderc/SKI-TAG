// Erzeugt die Tabellen in Kapitel 9 aus docs/assets/abdeckung-daten.js oder prüft sie.
// node tools/abdeckung-tabelle.mjs             prüft, ob Kapitel 9 zu den Daten passt
// node tools/abdeckung-tabelle.mjs --schreiben schreibt die Tabellen neu
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const docs = new URL("../docs/", import.meta.url);
const kontext = { window: {} };
vm.createContext(kontext);
vm.runInContext(readFileSync(new URL("assets/abdeckung-daten.js", docs), "utf8"), kontext);
vm.runInContext(readFileSync(new URL("assets/abdeckung-wahl.js", docs), "utf8"), kontext);
vm.runInContext(readFileSync(new URL("assets/karte-daten.js", docs), "utf8"), kontext);
vm.runInContext(readFileSync(new URL("assets/reichweite-wahl.js", docs), "utf8"), kontext);
const { gateways, punkte } = kontext.window.ABDECKUNG;
const wahl = (z, s, n) => kontext.waehleStationen(gateways, punkte.length, z, s, n);
const de = (x, s = 1) => x.toFixed(s).replace(".", ",");
const ZUSCHLAG = [0, 10, 20, 30, 36.5];
const dbText = (z) => `${de(z, z % 1 ? 1 : 0)} dB`;
const zelle = ({ wahl: w, anteil }) => `${w.length}, ${anteil >= 95 ? "" : "nur "}${de(anteil)} %`;
const anteilMit = (stationen, z, s) => {
  const grenze = Math.round((s + z) * 10);
  return (punkte.filter((_, p) => stationen.some((g) => gateways[g].pegel[p] >= grenze)).length / punkte.length) * 100;
};

const zeilen = ZUSCHLAG.map((z) => {
  const fett = (t) => (z === 10 ? `<strong>${t}</strong>` : t);
  const [a, b, c] = [zelle(wahl(z, -115, 1)), zelle(wahl(z, -125, 1)), zelle(wahl(z, -115, 2))];
  return `            <tr><td data-spalte="Zuschlag">${fett(dbText(z))}</td><td data-spalte="Gut">${fett(a)}</td><td data-spalte="Knapp">${fett(b)}</td><td data-spalte="Doppelt">${fett(c)}</td></tr>`;
});
const haupt = wahl(10, -115, 1).wahl;
const reihe = haupt.map((k, i) => `            <tr><td>${i + 1}</td><td>${gateways[k].name}</td><td>${gateways[k].hoehe} m</td><td>${de(anteilMit(haupt.slice(0, i + 1), 10, -115))} %</td></tr>`);

const pfad = new URL("kapitel-09.html", docs);
const alt = readFileSync(pfad, "utf8").split(String.fromCharCode(13)).join("");
const ersetze = (c, anker, text) => {
  const a = c.indexOf("<tbody>", c.indexOf(anker)), b = c.indexOf("</tbody>", a);
  return c.slice(0, a) + text + c.slice(b);
};
let neu = ersetze(alt, 'id="wieviele"', `<tbody>\n${zeilen.join("\n")}\n          `);
neu = ersetze(neu, 'id="reihenfolge"', `<tbody>\n${reihe.join("\n")}\n          `);
const RADIEN = [0.3, 0.5, 1, 2, 3, 5, 10, 15];
const kreise = RADIEN.map((r) => {
  const { wahl: w, anteil } = kontext.waehleKreise(gateways, punkte, r * kontext.window.KARTE.proKm);
  const text = anteil >= 95 ? String(w.length) : `nicht erreichbar, mit ${w.length} Stationen ${de(anteil)} %`;
  return `            <tr><td>${de(r, r % 1 ? 1 : 0)} km</td><td>${text}</td></tr>`;
});
neu = ersetze(neu, 'id="radien"', `<tbody>\n${kreise.join("\n")}\n          `);
const kreisZahl = (r) => kontext.waehleKreise(gateways, punkte, r * kontext.window.KARTE.proKm).wahl.length;
const ersatz = [
  ["Mit Gelände", "Jeder Punkt hört ein Gateway gut, 10 dB Zuschlag", wahl(10, -115, 1).wahl.length],
  ["Mit Gelände", "Jeder Punkt hört zwei Gateways gut, 10 dB Zuschlag", wahl(10, -115, 2).wahl.length],
  ["Als Kreis", "2 km Reichweite", kreisZahl(2)],
  ["Als Kreis", "3 km Reichweite", kreisZahl(3)],
  ["Als Kreis", "5 km Reichweite", kreisZahl(5)],
].map(([r, a, n]) => `            <tr><td>${r}</td><td>${a}</td><td>${n}</td></tr>`);
neu = ersetze(neu, 'class="tabelle nur-ohne-js"', `<tbody>\n${ersatz.join("\n")}\n          `);

if (process.argv.includes("--schreiben")) {
  writeFileSync(pfad, neu);
  console.log("Kapitel 9 neu geschrieben.");
} else if (neu === alt) {
  console.log(`OK: Kapitel 9 passt zu den Daten (${gateways.length} Standorte, ${punkte.length} Punkte).`);
} else {
  console.log("FEHLER: Kapitel 9 passt nicht zu abdeckung-daten.js.");
  process.exit(1);
}
