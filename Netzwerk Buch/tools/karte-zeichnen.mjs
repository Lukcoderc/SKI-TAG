// Zeichnet die Karte des Skigebiets: Relief als Bild, Pisten und Lifte als Linien.
// Grundlage sind dieselben Daten wie für Kapitel 9: node tools/abdeckung-holen.mjs <Ordner>
// node tools/karte-zeichnen.mjs <Ordner mit osm.json, gelaende.bin, gelaende.json>
// Schreibt docs/assets/karte-relief.png und docs/assets/karte-daten.js.
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync, crc32 } from "node:zlib";
import vm from "node:vm";

const ordner = process.argv[2].replace(/[\\/]?$/, "/");
const docs = new URL("../docs/", import.meta.url);
const osm = JSON.parse(readFileSync(ordner + "osm.json", "utf8"));
const gel = JSON.parse(readFileSync(ordner + "gelaende.json", "utf8"));
const roh = readFileSync(ordner + "gelaende.bin");
const raster = new Float32Array(roh.buffer, roh.byteOffset, roh.length / 4);

// Gleiche Projektion wie tools/abdeckung-rechne.mjs, geeicht an den Orten der vorhandenen Karte.
const LAT0 = 47.38, LON0 = 12.36;
const xm = (lo) => (lo - LON0) * Math.cos((LAT0 * Math.PI) / 180) * 111320;
const ym = (la) => (la - LAT0) * 110574;
const k = { window: {} };
vm.createContext(k);
vm.runInContext(readFileSync(new URL("assets/abdeckung-daten.js", docs), "utf8"), k);
const { breite, hoehe, orte } = k.window.ABDECKUNG;
const KITZ = [47.4467, 12.3923], KIRCH = [47.4467, 12.317];
const a = orte.find((o) => o.name === "Kitzbühel"), b = orte.find((o) => o.name === "Kirchberg");
const f = (a.x - b.x) / (xm(KITZ[1]) - xm(KIRCH[1]));
const minX = xm(KITZ[1]) - a.x / f, maxY = ym(KITZ[0]) + a.y / f;
const px = (lo) => (xm(lo) - minX) * f, py = (la) => (maxY - ym(la)) * f;
const lonVon = (x) => (x / f + minX) / (Math.cos((LAT0 * Math.PI) / 180) * 111320) + LON0;
const latVon = (y) => (maxY - y / f) / 110574 + LAT0;

const hoeheLL = (la, lo) => {
  const u0 = (((lo + 180) / 360) * 2 ** gel.Z - gel.x0) * gel.seite;
  const v0 = (((1 - Math.log(Math.tan((la * Math.PI) / 180) + 1 / Math.cos((la * Math.PI) / 180)) / Math.PI) / 2) * 2 ** gel.Z - gel.y0) * gel.seite;
  const j = Math.min(Math.max(Math.floor(u0), 0), gel.sx - 2), i = Math.min(Math.max(Math.floor(v0), 0), gel.sy - 2), v = u0 - j, u = v0 - i;
  const h = (r, s) => raster[r * gel.sx + s];
  return h(i, j) * (1 - u) * (1 - v) + h(i, j + 1) * (1 - u) * v + h(i + 1, j) * u * (1 - v) + h(i + 1, j + 1) * u * v;
};

// Relief: Schummerung mit Licht von Nordwesten, leicht nach Höhe aufgehellt. Farben aus book.css.
const MASS = 2, W = breite * MASS, H = hoehe * MASS, STUFEN = 32;
// Zwei Paletten für dieselben Stufen: dunkle und helle Ansicht des Buchs.
const baue = (VON, BIS) => { const p = Buffer.alloc(STUFEN * 3); for (let s = 0; s < STUFEN; s++) for (let c = 0; c < 3; c++) p[s * 3 + c] = Math.round(VON[c] + ((BIS[c] - VON[c]) * s) / (STUFEN - 1)); return p; };
const palette = baue([0x07, 0x0b, 0x12], [0x8f, 0x9b, 0xad]);
const paletteHell = baue([0x86, 0x9a, 0xb0], [0xff, 0xff, 0xff]);
const hoehen = new Float32Array((W + 2) * (H + 2));
for (let y = -1; y <= H; y++) for (let x = -1; x <= W; x++) hoehen[(y + 1) * (W + 2) + x + 1] = hoeheLL(latVon((y + 0.5) / MASS), lonVon((x + 0.5) / MASS));
const zelleM = 1 / (f * MASS);
const AZ = (315 * Math.PI) / 180, ALT = (40 * Math.PI) / 180;
let hMin = Infinity, hMax = -Infinity;
for (const v of hoehen) { hMin = Math.min(hMin, v); hMax = Math.max(hMax, v); }
const zeilen = Buffer.alloc(H * (W + 1));
for (let y = 0; y < H; y++) {
  zeilen[y * (W + 1)] = 0;
  for (let x = 0; x < W; x++) {
    const g = (dx, dy) => hoehen[(y + 1 + dy) * (W + 2) + x + 1 + dx];
    const dzdx = (g(1, 0) - g(-1, 0)) / (2 * zelleM), dzdy = (g(0, 1) - g(0, -1)) / (2 * zelleM);
    const steil = Math.atan(Math.hypot(dzdx, dzdy)), richtung = Math.atan2(dzdy, -dzdx);
    const licht = Math.max(0, Math.sin(ALT) * Math.cos(steil) + Math.cos(ALT) * Math.sin(steil) * Math.cos(AZ - richtung));
    const hoch = (g(0, 0) - hMin) / (hMax - hMin);
    const t = Math.min(1, Math.max(0, 0.8 * licht ** 1.4 + 0.45 * hoch - 0.2));
    zeilen[y * (W + 1) + 1 + x] = Math.round(t * (STUFEN - 1));
  }
}
const chunk = (art, daten) => {
  const kopf = Buffer.alloc(8);
  kopf.writeUInt32BE(daten.length, 0);
  kopf.write(art, 4, "latin1");
  const pruef = Buffer.alloc(4);
  pruef.writeUInt32BE(crc32(Buffer.concat([Buffer.from(art, "latin1"), daten])) >>> 0, 0);
  return Buffer.concat([kopf, daten, pruef]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 3;
const idat = chunk("IDAT", deflateSync(zeilen, { level: 9 }));
const bild = (pal) => Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("PLTE", pal), idat, chunk("IEND", Buffer.alloc(0))]);
const png = bild(palette);
writeFileSync(new URL("assets/karte-relief.png", docs), png);
writeFileSync(new URL("assets/karte-relief-hell.png", docs), bild(paletteHell));

// Pisten und Lifte als vereinfachte Linien.
const vereinfache = (p, tol) => {
  if (p.length < 3) return p;
  const [s, e] = [p[0], p[p.length - 1]];
  let max = 0, idx = 0;
  for (let i = 1; i < p.length - 1; i++) {
    const d = Math.abs((e[0] - s[0]) * (s[1] - p[i][1]) - (s[0] - p[i][0]) * (e[1] - s[1])) / (Math.hypot(e[0] - s[0], e[1] - s[1]) || 1);
    if (d > max) { max = d; idx = i; }
  }
  return max > tol ? [...vereinfache(p.slice(0, idx + 1), tol).slice(0, -1), ...vereinfache(p.slice(idx), tol)] : [s, e];
};
const pfad = (wege) => wege.map((w) => vereinfache(w.geometry.map((g) => [px(g.lon), py(g.lat)]), 0.6).map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("")).join("");
const wege = osm.elements.filter((e) => e.type === "way" && e.geometry);
const pisten = wege.filter((e) => e.tags["piste:type"] === "downhill" && e.tags.area !== "yes" && e.tags["piste:grooming"] !== "backcountry");
const lifte = wege.filter((e) => e.tags.aerialway && e.tags.aerialway !== "station");
// Höhenraster für den Geländeschnitt in der Karte: alle 4 Kartenpunkte eine Höhe in Metern, als Int16 in Base64.
const RASTER = 4, rb = Math.ceil(breite / RASTER) + 1, rh = Math.ceil(hoehe / RASTER) + 1;
const gitter = new Int16Array(rb * rh);
for (let j = 0; j < rh; j++) for (let i = 0; i < rb; i++) gitter[j * rb + i] = Math.round(hoeheLL(latVon(j * RASTER), lonVon(i * RASTER)));
const raster64 = Buffer.from(gitter.buffer).toString("base64");
const daten = { breite, hoehe, proKm: +(f * 1000).toFixed(3), pisten: pfad(pisten), lifte: pfad(lifte), raster: { schritt: RASTER, b: rb, h: rh, werte: raster64 }, stand: osm.osm3s?.timestamp_osm_base?.slice(0, 10) ?? "" };
writeFileSync(new URL("assets/karte-daten.js", docs), `// Karte des Skigebiets. Geodaten: OpenStreetMap-Mitwirkende (ODbL), Gelände: Terrain Tiles on AWS.\nwindow.KARTE = ${JSON.stringify(daten)};\n`);
console.log(`Relief ${W}×${H}, ${Math.round(png.length / 1024)} KB; Pisten ${pisten.length}, Lifte ${lifte.length}; 1 km = ${daten.proKm} Punkte; OSM-Stand ${daten.stand}`);
