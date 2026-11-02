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
const ersatz = ZUSCHLAG.map((z) => `<tr><td>${dbText(z)}</td><td>${de(anteilMit(haupt, z, -115))} %</td><td>${de(anteilMit(haupt, z, -125))} %</td></tr>`).join("");

const pfad = new URL("kapitel-09.html", docs);
const alt = readFileSync(pfad, "utf8").split(String.fromCharCode(13)).join("");
const ersetze = (c, anker, text) => {
  const a = c.indexOf("<tbody>", c.indexOf(anker)), b = c.indexOf("</tbody>", a);
  return c.slice(0, a) + text + c.slice(b);
};
let neu = ersetze(alt, 'id="wieviele"', `<tbody>\n${zeilen.join("\n")}\n          `);
neu = ersetze(neu, 'id="reihenfolge"', `<tbody>\n${reihe.join("\n")}\n          `);
neu = ersetze(neu, 'class="tabelle nur-ohne-js"', `<tbody>${ersatz}`);

if (process.argv.includes("--schreiben")) {
  writeFileSync(pfad, neu);
  console.log("Kapitel 9 neu geschrieben.");
} else if (neu === alt) {
  console.log(`OK: Kapitel 9 passt zu den Daten (${gateways.length} Standorte, ${punkte.length} Punkte).`);
} else {
  console.log("FEHLER: Kapitel 9 passt nicht zu abdeckung-daten.js.");
  process.exit(1);
}
