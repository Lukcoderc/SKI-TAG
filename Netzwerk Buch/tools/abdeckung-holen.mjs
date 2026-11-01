// Lädt Pisten und Lifte aus OpenStreetMap und Höhenkacheln (Terrain Tiles on AWS).
// node tools/abdeckung-holen.mjs <Ordner>. Die OSM-Daten ändern sich, das Ergebnis also auch.
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { inflateSync } from "node:zlib";

const ordner = process.argv[2].replace(/[\\/]?$/, "/");
const Z = 12, BOX = { s: 47.27, w: 12.25, n: 47.48, e: 12.47 };
const tx = (lo) => ((lo + 180) / 360) * 2 ** Z;
const ty = (la) => ((1 - Math.log(Math.tan((la * Math.PI) / 180) + 1 / Math.cos((la * Math.PI) / 180)) / Math.PI) / 2) * 2 ** Z;
const x0 = Math.floor(tx(BOX.w)), x1 = Math.floor(tx(BOX.e)), y0 = Math.floor(ty(BOX.n)), y1 = Math.floor(ty(BOX.s));
console.log("Kacheln", (x1 - x0 + 1) * (y1 - y0 + 1), `x ${x0}-${x1}, y ${y0}-${y1}`);

function pngZuRgb(puffer) {
  let p = 8, breite, hoehe, tiefe, typ;
  const idat = [];
  while (p < puffer.length) {
    const laenge = puffer.readUInt32BE(p), art = puffer.toString("latin1", p + 4, p + 8), d = puffer.subarray(p + 8, p + 8 + laenge);
    if (art === "IHDR") { breite = d.readUInt32BE(0); hoehe = d.readUInt32BE(4); tiefe = d[8]; typ = d[9]; }
    if (art === "IDAT") idat.push(d);
    p += 12 + laenge;
  }
  if (tiefe !== 8 || (typ !== 2 && typ !== 6)) throw new Error(`PNG-Typ ${typ}/${tiefe}`);
  const bpp = typ === 6 ? 4 : 3, zeile = breite * bpp, roh = inflateSync(Buffer.concat(idat)), bild = Buffer.alloc(zeile * hoehe);
  for (let y = 0; y < hoehe; y++) {
    const f = roh[y * (zeile + 1)], z = y * (zeile + 1) + 1;
    for (let i = 0; i < zeile; i++) {
      const a = i >= bpp ? bild[y * zeile + i - bpp] : 0, b = y ? bild[(y - 1) * zeile + i] : 0, c = i >= bpp && y ? bild[(y - 1) * zeile + i - bpp] : 0;
      let v = roh[z + i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      bild[y * zeile + i] = v & 255;
    }
  }
  return { breite, hoehe, bpp, bild };
}

mkdirSync(ordner + "kacheln", { recursive: true });
const abfrage = `[out:json][timeout:120];(
way["piste:type"="downhill"](${BOX.s},${BOX.w},${BOX.n},${BOX.e});
way["aerialway"~"^(gondola|cable_car|chair_lift|mixed_lift|t-bar|drag_lift)$"](${BOX.s},${BOX.w},${BOX.n},${BOX.e});
node["aerialway"="station"](${BOX.s},${BOX.w},${BOX.n},${BOX.e});
);out tags geom;`;

if (!existsSync(ordner + "osm.json")) {
  const r = await fetch("https://overpass.kumi.systems/api/interpreter", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(abfrage) });
  if (!r.ok) throw new Error("OpenStreetMap: " + r.status);
  writeFileSync(ordner + "osm.json", await r.text());
}
const seite = 256, sx = (x1 - x0 + 1) * seite, sy = (y1 - y0 + 1) * seite, raster = new Float32Array(sx * sy);
for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
  const datei = `${ordner}kacheln/${x}_${y}.png`;
  if (!existsSync(datei)) {
    const r = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`);
    if (!r.ok) throw new Error(`Kachel ${x}/${y}: ${r.status}`);
    writeFileSync(datei, Buffer.from(await r.arrayBuffer()));
  }
  const { bild, bpp } = pngZuRgb(readFileSync(datei));
  for (let i = 0; i < seite; i++) for (let j = 0; j < seite; j++) {
    const k = (i * seite + j) * bpp;
    raster[(i + (y - y0) * seite) * sx + j + (x - x0) * seite] = bild[k] * 256 + bild[k + 1] + bild[k + 2] / 256 - 32768;
  }
}
writeFileSync(ordner + "gelaende.bin", Buffer.from(raster.buffer));
writeFileSync(ordner + "gelaende.json", JSON.stringify({ Z, x0, y0, seite, sx, sy }));
