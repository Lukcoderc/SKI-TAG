// Prüft alle Seiten: Struktur, interne Links und Sprungmarken, Versionen, Platzhalter.
// node tools/pruefe-buch.mjs
import { readFileSync, readdirSync } from "node:fs";

const docs = new URL("../docs/", import.meta.url);
const seiten = readdirSync(docs).filter((n) => n.endsWith(".html"));
const inhalt = Object.fromEntries(seiten.map((n) => [n, readFileSync(new URL(n, docs), "utf8")]));
const ids = Object.fromEntries(seiten.map((n) => [n, new Set([...inhalt[n].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const versionen = new Set();
const fehler = [];
let links = 0;
const zaehle = (c, s) => c.split(s).length - 1;

for (const n of seiten) {
  const c = inhalt[n];
  if (!c.startsWith("<!DOCTYPE html>")) fehler.push(n + ": Beginn");
  for (const t of ["div", "table", "tbody", "tr", "td", "ul", "ol", "li", "section", "figure", "p", "dl", "details", "article"]) {
    if (zaehle(c, "<" + t + " ") + zaehle(c, "<" + t + ">") !== zaehle(c, "</" + t + ">")) fehler.push(n + ": Tag " + t);
  }
  if (/\$\d|undefined|\[object|NaN/.test(c.replace(/<svg[\s\S]*?<\/svg>/g, ""))) fehler.push(n + ": Platzhalter");
  const liste = [...c.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const x of new Set(liste.filter((v, i) => liste.indexOf(v) !== i))) fehler.push(n + ": doppelte id " + x);
  for (const m of c.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|assets|#mark)/.test(m[1])) continue;
    const [ziel, anker] = m[1].split("#");
    const z = ziel || n;
    links++;
    if (!ids[z]) fehler.push(n + ": Seite fehlt " + m[1]);
    else if (anker && !ids[z].has(anker)) fehler.push(n + ": Anker fehlt " + m[1]);
  }
  for (const m of c.matchAll(/assets\/(?:book|druck)\.(?:js|css)\?v=(\d+)/g)) versionen.add(m[1]);
}
if (versionen.size !== 1) fehler.push("Versionen uneinheitlich: " + [...versionen].join(", "));
console.log(seiten.length + " Seiten, " + links + " interne Links, Version " + [...versionen].join(", "));
if (fehler.length) { console.log(fehler.join("\n")); process.exit(1); }
console.log("OK");
