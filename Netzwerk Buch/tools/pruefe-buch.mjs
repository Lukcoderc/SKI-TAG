// Prüft alle Seiten: Struktur, interne Links und Sprungmarken, Versionen, Platzhalter,
// Reihenfolge der Kapitel und ob jeder Verweis zur richtigen Kapitelnummer zeigt.
// node "Netzwerk Buch/tools/pruefe-buch.mjs"
import { readFileSync, readdirSync } from "node:fs";
import { mitZahlen } from "./zaehle-marken.mjs";
import { aktuell } from "./suchindex.mjs";

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
  // Ein Link mit dem Text „Kapitel N“ muss auf die Datei von Kapitel N zeigen.
  for (const m of c.matchAll(/<a href="kapitel-(\d\d)\.html[^"]*">[^<]*Kapitel (\d+)/g)) {
    if (+m[1] !== +m[2]) fehler.push(n + ": Link auf " + m[1] + " heißt Kapitel " + m[2]);
  }
}

// Reihenfolge aus book.js gegen Dateien, Startseite, Blättern und Stand-Zeile.
const kapitel = [...readFileSync(new URL("assets/book.js", docs), "utf8").matchAll(/\{ teil: "([^"]+)", nr: ("?\w*"?), titel: "([^"]+)", datei: "([^"]+)" \}/g)]
  .map((m) => ({ teil: m[1], nr: m[2].replaceAll('"', ""), titel: m[3], datei: m[4] }));
const inBuch = new Set(kapitel.map((k) => k.datei));
for (const n of seiten) if (n !== "index.html" && !inBuch.has(n)) fehler.push(n + ": fehlt in book.js");
const start = inhalt["index.html"];
const aufStart = [...start.slice(start.indexOf('id="einstieg"')).matchAll(/class="inhalt-nr">\w*<\/span><div><a href="([^"]+)">([^<]+)/g)];
if (aufStart.map((m) => m[1] + m[2]).join() !== kapitel.map((k) => k.datei + k.titel).join()) fehler.push("index.html: Liste passt nicht zu book.js");
const teile = [...new Set(kapitel.map((k) => k.teil))];
const koepfe = [...start.matchAll(/<h2 id="[^"]+"(?: data-kurz="[^"]*")?>([^<]+)<\/h2>/g)].map((m) => m[1]);
for (const t of teile) if (!koepfe.includes(t)) fehler.push("index.html: Gruppe fehlt: " + t);
let rueckwaerts = 0;
kapitel.forEach((k, i) => {
  const c = inhalt[k.datei];
  if (!c) return fehler.push(k.datei + ": Datei fehlt");
  const vor = kapitel[i - 1], nach = kapitel[i + 1];
  const block = c.match(/<div class="blaettern">([\s\S]*?)<\/div>/)?.[1] ?? "";
  if (vor && !block.includes(`href="${vor.datei}"`)) fehler.push(k.datei + ": Zurück zeigt nicht auf " + vor.datei);
  if (nach && !block.includes(`href="${nach.datei}"`)) fehler.push(k.datei + ": Weiter zeigt nicht auf " + nach.datei);
  const zahl = /^\d+$/.test(k.nr);
  if (zahl && !c.includes(`<p class="stand">Kapitel ${k.nr} · Stand`)) fehler.push(k.datei + ": Stand-Zeile");
  if (zahl && !c.includes('class="kurz"')) fehler.push(k.datei + ": Kurz gesagt fehlt");
  if (zahl && !c.includes('id="ergebnis"')) fehler.push(k.datei + ": Ergebnis fehlt");
  for (const m of (c.match(/<p class="vorwissen">.*<\/p>/)?.[0] ?? "").matchAll(/Kapitel (\d+)/g)) {
    rueckwaerts++;
    if (+m[1] >= +k.nr) fehler.push(k.datei + ": baut auf späterem Kapitel " + m[1]);
  }
  if (zahl && +k.nr > 1 && !c.includes('class="vorwissen"')) fehler.push(k.datei + ": Baut-auf-Zeile fehlt");
});
for (const n of seiten) if (/class="seil|data-station/.test(inhalt[n])) fehler.push(n + ": Seil noch vorhanden");

// Einheitliche Begriffe: Der Knopf heißt „Annehmen“, die Stufe HELP 1 heißt Übernahme.
for (const n of seiten) for (const w of ["„Übernehmen“", "Einsatz übernehmen", "Ausblick Serie", "kein keine", "Kein Keine"]) if (inhalt[n].includes(w)) fehler.push(n + ": Begriff " + w);
// ACK und HELP stehen nur in Klammern, in der Protokolltabelle, im Glossar und in den Häufigen Fragen.
for (const n of seiten) {
  if (n === "kapitel-anhang.html" || n === "kapitel-fragen.html") continue;
  const rest = inhalt[n].replace(/\((?:ACK|HELP)[^)]*\)/g, "").replace(/<td>\d (?:ACK|HELP)<\/td>/g, "").replace("heißen die Meldungen ACK und HELP 1 bis 3", "");
  for (const m of rest.matchAll(/.{0,30}\b(?:ACK|HELP)\b.{0,30}/g)) fehler.push(n + ": Fachwort ohne Klammer: " + m[0]);
}
// Abkürzungen und Eigenbegriffe müssen im Glossar stehen.
const anhang = inhalt["kapitel-anhang.html"];
const glossar = anhang.slice(anhang.indexOf('id="glossar"'), anhang.indexOf('id="quellen"'));
for (const w of ["ACK", "AES", "CORS", "CRC", "dB", "DNS", "EIRP", "ETSI", "HELP", "HTTPS", "LoRa", "NIST", "RSSI", "SNR", "SSE", "TLS", "Token", "Übergabe", "Ladebox", "Ausgabe-Seite"]) {
  if (!glossar.includes(`<td>${w}`)) fehler.push("Glossar fehlt: " + w);
}
if (mitZahlen(start) !== start) fehler.push("index.html: Marken veraltet, tools/zaehle-marken.mjs --schreiben");
if (!aktuell()) fehler.push("Suchdaten veraltet, tools/suchindex.mjs --schreiben");

if (versionen.size !== 1) fehler.push("Versionen uneinheitlich: " + [...versionen].join(", "));
console.log(seiten.length + " Seiten, " + links + " interne Links, " + kapitel.length + " Einträge in " + teile.length + " Gruppen, " + rueckwaerts + " Baut-auf-Verweise, Version " + [...versionen].join(", "));
if (fehler.length) { console.log(fehler.join("\n")); process.exit(1); }
console.log("OK");
