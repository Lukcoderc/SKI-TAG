// Erzeugt die Daten für die Suche: je Abschnitt Seite, Sprungmarke, Überschrift und Text.
// node tools/suchindex.mjs             prüft, ob die Daten aktuell sind
// node tools/suchindex.mjs --schreiben schreibt docs/assets/suche-daten.js neu
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const docs = new URL("../docs/", import.meta.url);
const ziel = new URL("assets/suche-daten.js", docs);
const text = (s) => s.replace(/<svg\b[\s\S]*?<\/svg>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export function suchDaten() {
  const eintraege = [];
  for (const datei of readdirSync(docs).filter((n) => n.endsWith(".html")).sort()) {
    const c = readFileSync(new URL(datei, docs), "utf8");
    const a = c.indexOf("<article");
    const artikel = c.slice(a, c.lastIndexOf("</article>")).replace(/<div class="blaettern">[\s\S]*?<\/div>/, "");
    const stand = artikel.match(/<p class="stand">([^·<]*)/)?.[1].trim() ?? "";
    const titel = text(artikel.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "");
    const wo = stand && stand !== titel ? `${stand}, ${titel}` : titel;
    const stuecke = artikel.split(/(?=<h2 )/);
    eintraege.push({ s: datei, a: "", k: wo, t: titel, x: text(stuecke[0]).slice(0, 400) });
    for (const st of stuecke.slice(1)) {
      const kopf = st.match(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/);
      if (!kopf || kopf[1] === "quellen") continue;
      eintraege.push({ s: datei, a: kopf[1], k: wo, t: text(kopf[2]), x: text(st.slice(kopf[0].length)) });
    }
  }
  return "window.SUCHE=" + JSON.stringify(eintraege) + ";\n";
}

export const aktuell = () => existsSync(ziel) && readFileSync(ziel, "utf8") === suchDaten();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--schreiben")) {
    writeFileSync(ziel, suchDaten());
    console.log("Suchdaten neu geschrieben.");
  } else if (aktuell()) {
    console.log("OK: Suchdaten sind aktuell.");
  } else {
    console.log("FEHLER: Suchdaten sind veraltet.");
    process.exit(1);
  }
}
