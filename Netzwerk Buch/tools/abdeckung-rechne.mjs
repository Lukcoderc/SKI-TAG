// Rechnet die Pegel je Pistenpunkt und Liftstation: Freiraum plus Beugung an Graten (Deygout, ITU-R P.526).
// node tools/abdeckung-rechne.mjs <Ordner mit osm.json, gelaende.bin, gelaende.json>
import { readFileSync, writeFileSync } from "node:fs";

const ordner = process.argv[2].replace(/[\\/]?$/, "/");
const osm = JSON.parse(readFileSync(ordner + "osm.json", "utf8"));
const gel = JSON.parse(readFileSync(ordner + "gelaende.json", "utf8"));
const roh = readFileSync(ordner + "gelaende.bin");
const raster = new Float32Array(roh.buffer, roh.byteOffset, roh.length / 4);
const LAT0 = 47.38, LON0 = 12.36;
const xm = (lo) => (lo - LON0) * Math.cos((LAT0 * Math.PI) / 180) * 111320;
const ym = (la) => (la - LAT0) * 110574;
const hoeheLL = (la, lo) => {
  const a = (((lo + 180) / 360) * 2 ** gel.Z - gel.x0) * gel.seite;
  const b = (((1 - Math.log(Math.tan((la * Math.PI) / 180) + 1 / Math.cos((la * Math.PI) / 180)) / Math.PI) / 2) * 2 ** gel.Z - gel.y0) * gel.seite;
  const j = Math.min(Math.max(Math.floor(a), 0), gel.sx - 2), i = Math.min(Math.max(Math.floor(b), 0), gel.sy - 2), v = a - j, u = b - i;
  const h = (r, s) => raster[r * gel.sx + s];
  return h(i, j) * (1 - u) * (1 - v) + h(i, j + 1) * (1 - u) * v + h(i + 1, j) * u * (1 - v) + h(i + 1, j + 1) * u * v;
};
const lonVon = (x) => x / (Math.cos((LAT0 * Math.PI) / 180) * 111320) + LON0;
const latVon = (y) => y / 110574 + LAT0;
const hoehe = (x, y) => hoeheLL(latVon(y), lonVon(x));

const FREQ_MHZ = 869.525, LAMBDA = 299.792458 / FREQ_MHZ, ERDE = 8500e3;
const SENDE_DBM = 20, GATEWAY_DBI = 3, CHIP_DBI = 0, GATEWAY_H = 8, CHIP_H = 1.2, SCHRITT = 60;
const J = (v) => (v <= -0.78 ? 0 : 6.9 + 20 * Math.log10(Math.sqrt((v - 0.1) ** 2 + 1) + v - 0.1));

function beugung(prof, a, b, tiefe) {
  if (b - a < 2 || tiefe === 0) return 0;
  const d = prof[b].d - prof[a].d;
  let bestV = -Infinity, best = -1;
  for (let i = a + 1; i < b; i++) {
    const d1 = prof[i].d - prof[a].d, d2 = prof[b].d - prof[i].d;
    const linie = prof[a].h + ((prof[b].h - prof[a].h) * d1) / d;
    const v = (prof[i].h + (d1 * d2) / (2 * ERDE) - linie) * Math.sqrt((2 * d) / (LAMBDA * d1 * d2));
    if (v > bestV) { bestV = v; best = i; }
  }
  if (best < 0 || bestV <= -0.78) return 0;
  return J(bestV) + beugung(prof, a, best, tiefe - 1) + beugung(prof, best, b, tiefe - 1);
}

function pegel(g, p) {
  const d = Math.hypot(g.x - p.x, g.y - p.y);
  if (d < 30) return -40;
  const n = Math.max(2, Math.round(d / SCHRITT));
  const prof = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = p.x + (g.x - p.x) * t, y = p.y + (g.y - p.y) * t;
    let h = hoehe(x, y);
    if (i === 0) h = p.h + CHIP_H;
    if (i === n) h = g.h + GATEWAY_H;
    prof.push({ d: d * t, h });
  }
  const frei = 32.44 + 20 * Math.log10(d / 1000) + 20 * Math.log10(FREQ_MHZ);
  return SENDE_DBM + CHIP_DBI + GATEWAY_DBI - frei - beugung(prof, 0, n, 2);
}

// Pisten: nur KitzSki-Bereich der Box, Punkte alle 120 m, je 100-m-Zelle einer.
const wege = osm.elements.filter((e) => e.type === "way" && e.geometry);
const inKitzSki = (w) => { const m = w.geometry[Math.floor(w.geometry.length / 2)]; return m.lon >= 12.3 && m.lat >= 47.285; };
const pisten = wege.filter((e) => e.tags["piste:type"] === "downhill" && e.tags.area !== "yes" && e.tags["piste:grooming"] !== "backcountry" && inKitzSki(e));
const lifte = wege.filter((e) => e.tags.aerialway && e.tags.aerialway !== "station" && inKitzSki(e));
const zellen = new Set(), punkte = [];
let pistenM = 0;
for (const w of pisten) {
  let rest = 0;
  for (let i = 1; i < w.geometry.length; i++) {
    const a = { x: xm(w.geometry[i - 1].lon), y: ym(w.geometry[i - 1].lat) }, b = { x: xm(w.geometry[i].lon), y: ym(w.geometry[i].lat) };
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    pistenM += l;
    while (rest <= l) {
      const t = l ? rest / l : 0, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      const z = `${Math.round(x / 100)},${Math.round(y / 100)}`;
      if (!zellen.has(z)) { zellen.add(z); punkte.push({ x, y, h: hoehe(x, y) }); }
      rest += 120;
    }
    rest -= l;
  }
}

// Kandidaten: beide Enden der Gondeln und Sessellifte, je Ort einer.
const kandidaten = [];
for (const w of lifte) {
  if (!/gondola|cable_car|chair_lift|mixed_lift/.test(w.tags.aerialway)) continue;
  const g = w.geometry, enden = [g[0], g[g.length - 1]].map((e) => ({ x: xm(e.lon), y: ym(e.lat), h: hoeheLL(e.lat, e.lon) })).sort((p, q) => q.h - p.h);
  enden.forEach((e, i) => {
    if (kandidaten.some((k) => Math.hypot(k.x - e.x, k.y - e.y) < 150)) return;
    kandidaten.push({ ...e, name: `${w.tags.name ?? w.tags.ref ?? "Lift"} ${i === 0 ? "oben" : "unten"}`, art: w.tags.aerialway });
  });
}
console.log("Pistenmeter in Box:", Math.round(pistenM / 1000), "km; Punkte:", punkte.length, "Lifte:", lifte.length, "Kandidaten:", kandidaten.length);

const pegelTab = kandidaten.map((g, i) => {
  return punkte.map((p) => (Math.hypot(g.x - p.x, g.y - p.y) > 25000 ? -200 : pegel(g, p)));
});

const xs = punkte.map((p) => p.x), ys = punkte.map((p) => p.y);
const rand = 300, minX = Math.min(...xs) - rand, maxX = Math.max(...xs) + rand, minY = Math.min(...ys) - rand, maxY = Math.max(...ys) + rand;
const BREITE = 620, faktor = BREITE / (maxX - minX), HOEHE = Math.round((maxY - minY) * faktor);
const px = (x) => +((x - minX) * faktor).toFixed(1), py = (y) => +((maxY - y) * faktor).toFixed(1);
const daten = {
  breite: BREITE, hoehe: HOEHE,
  orte: [["Kitzbühel", 47.4467, 12.3923], ["Kirchberg", 47.4467, 12.317], ["Kitzbüheler Horn", 47.477, 12.43], ["Hahnenkamm", 47.4266, 12.3633], ["Jochberg", 47.375, 12.417], ["Pass Thurn", 47.31, 12.405]].map(([name, la, lo]) => ({ name, x: px(xm(lo)), y: py(ym(la)) })),
  punkte: punkte.map((p) => [px(p.x), py(p.y)]),
  gateways: kandidaten.map((g, k) => ({ name: g.name, hoehe: Math.round(g.h), x: px(g.x), y: py(g.y), pegel: pegelTab[k].map((v) => Math.round(v * 10)) })),
};
writeFileSync(new URL("../docs/assets/abdeckung-daten.js", import.meta.url), "// Gerechnete Pegel in Zehntel dBm. Geodaten: OpenStreetMap-Mitwirkende (ODbL), Gelände: Terrain Tiles on AWS.\nwindow.ABDECKUNG = " + JSON.stringify(daten) + ";\n");
console.log("Standorte", kandidaten.length, "Punkte", punkte.length, "Piste km", Math.round(pistenM / 1000), "Lifte", lifte.length);
