// Zählt die Status-Marken je Kapitel und trägt sie auf der Startseite ein.
// node tools/zaehle-marken.mjs             prüft, ob die Startseite stimmt
// node tools/zaehle-marken.mjs --schreiben trägt die Zahlen neu ein
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const docs = new URL("../docs/", import.meta.url);
const MARKEN = [["fest", "Fest"], ["entschieden", "Entschieden"], ["geschaetzt", "Geschätzt"], ["offen", "Offen"]];

function zeile(datei) {
  const c = readFileSync(new URL(datei, docs), "utf8");
  const teile = MARKEN.map(([m, wort]) => {
    const n = c.split(`#mark-${m}"`).length - 1;
    if (!n) return "";
    const klasse = m === "offen" ? ' class="inhalt-offen"' : "";
    return `<span${klasse}><svg class="mark mark-klein" aria-hidden="true"><use href="#mark-${m}"/></svg>${n} ${wort}</span>`;
  }).join("");
  return `<p class="inhalt-zahlen">${teile}</p>`;
}

export function mitZahlen(start) {
  return start
    .replace(/<p class="inhalt-zahlen">.*?<\/p>/g, "")
    .replace(/(<a href="(kapitel-\d\d\.html)">[^<]*<\/a><p>[^<]*<\/p>)(<\/div>)/g, (m, a, datei, z) => a + zeile(datei) + z);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pfad = new URL("index.html", docs);
  const alt = readFileSync(pfad, "utf8");
  const neu = mitZahlen(alt);
  if (process.argv.includes("--schreiben")) {
    writeFileSync(pfad, neu);
    console.log("Startseite neu geschrieben.");
  } else if (alt === neu) {
    console.log("OK: Marken auf der Startseite stimmen.");
  } else {
    console.log("FEHLER: Marken auf der Startseite stimmen nicht.");
    process.exit(1);
  }
}
