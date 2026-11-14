/* SkiTag · Seite „Der Chip“ (Feedback 91 und 92), nur auf chip.html geladen.
   Innenleben: das 3D-Modell des fertigen Chips zieht sich entlang seiner Dicke auseinander. Seit Feedback 111 Maxis
   aktuelles Modell „Fertiger Chip“ (assets/media/chip-teile.bin) mit nachgebauten Bauteilen auf der Platine, weichen
   Schatten und Texturen (Leiterbahnen, Modul-Deckel, Akku-Folie). Laut Werkstattbuch ein Konzept, kein Bauplan.
   Breit: der Abschnitt ist gepinnt, ScrollCraft schreibt den Fortschritt als --sc-p (0 bis 1):
     0,08 bis 0,62  der Chip öffnet sich; gegen Ende erscheinen die sechs Namen nacheinander
     danach         alles bleibt stehen: Namen rechts neben dem Stapel, je eine gestrichelte Linie zum Teil.
                    Seit Feedback 93 baut sich der Chip beim Weiterscrollen nicht wieder zusammen.
   Zum Antippen (.ist-klick: Handy, „weniger Bewegung“, ohne WebGL): nicht gepinnt, der Chip öffnet sich von
   selbst, sobald der Abschnitt mitten im Bild steht, und bleibt offen.
   Gezeichnet wird nur, wenn sich das Bild ändert. Ohne WebGL bleibt das Standbild mit den Namen darunter.
   Der Abschnitt „Probiere den Tag aus.“ darüber gehört zu chip-3d.js und seite.js. */
import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

const wurzel = document.documentElement;
const akt = document.getElementById("innenleben");
const bildEl = akt && akt.querySelector(".innen__bild");
const leinwand = akt && akt.querySelector(".innen__gl");
const zeiger = akt && akt.querySelector(".innen__zeiger");
const marken = akt ? Array.from(akt.querySelectorAll(".innen__marken li")) : [];
const ohneBewegung = matchMedia("(prefers-reduced-motion: reduce)").matches;
const handy = matchMedia("(pointer: coarse)").matches || innerWidth < 700;
// Feedback 116: schwächere Geräte (Sparmodus aus dem Kopf der Seite) und Handys zeichnen ohne weiche Schatten, ohne
// Klarlack und Samtglanz und mit weniger Pixeln; das Modell sieht fast gleich aus, kostet aber ein Vielfaches weniger.
const leicht = handy || wurzel.classList.contains("sparsam");
const klemme = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const abschnitt = (x, a, b) => klemme((x - a) / (b - a));
const weich = (x) => x * x * (3 - 2 * x);
const mix = (a, b, t) => a + (b - a) * t;

const OEFFNEN = [0.08, 0.62];

/* -------------------------------------------------------------- Zustand -- */
/* Z.offen ist das Ziel der Öffnung (0 bis 1): breit aus dem Scrollen, sonst offen, sobald der Abschnitt im Bild steht. */
const Z = { offen: 0, p: 0, sichtbar: false, klick: false, lesen: () => {} };
let anstossen = () => {};
if (akt) {
  Z.klick = akt.classList.contains("ist-klick");
  Z.lesen = () => {
    if (Z.klick) {
      const r = akt.getBoundingClientRect(), vh = innerHeight;
      if (r.top < vh * 0.45 && r.bottom > vh * 0.55) Z.offen = 1;   // einmal offen, bleibt offen
      return;
    }
    const p = parseFloat(akt.style.getPropertyValue("--sc-p")) || 0;
    Z.p = p;
    Z.offen = weich(abschnitt(p, OEFFNEN[0], OEFFNEN[1]));
  };
  let wartet = false;
  addEventListener("scroll", () => { if (!wartet) { wartet = true; requestAnimationFrame(() => { wartet = false; Z.lesen(); anstossen(); }); } }, { passive: true });
}

const webgl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
if (akt && leinwand && webgl) start().catch((f) => { console.warn("Chip-Seite 3D:", f); wurzel.classList.remove("chip3d-seite"); });

async function start() {
  /* ------------------------------------------------------------ Bühne -- */
  const renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, wurzel.classList.contains("sparsam") ? 1 : handy ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = !leicht;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const szene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  szene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  szene.environmentIntensity = 0.85;
  const FOV = 24;
  const kamera = new THREE.PerspectiveCamera(FOV, 1, 10, 2000);
  const licht = new THREE.DirectionalLight(0xffffff, 1.9); licht.position.set(60, 140, 120);
  // weiche Schatten der Bauteile auf Platine und Akku (Licht von oben vorne)
  licht.castShadow = !leicht; licht.shadow.mapSize.set(1536, 1536);
  licht.shadow.camera.left = -60; licht.shadow.camera.right = 60; licht.shadow.camera.top = 90; licht.shadow.camera.bottom = -90;
  licht.shadow.camera.near = 40; licht.shadow.camera.far = 400; licht.shadow.bias = -0.0004; licht.shadow.normalBias = 0.25; licht.shadow.radius = 4;
  const kante = new THREE.DirectionalLight(0x8fb4ff, 2.2); kante.position.set(-120, 40, -140);   // kaltes Randlicht von hinten
  const warm = new THREE.DirectionalLight(0xffc7a6, 0.8); warm.position.set(-140, -20, 80);
  szene.add(licht, kante, warm, new THREE.HemisphereLight(0xffffff, 0x38466e, 0.45));

  /* ---------------------------------------------------------- Modell -- */
  /* Seit Feedback 111: Maxis aktuelles Modell „Fertiger Chip“ (fertig4, ca. 66 × 46 × 18 mm, Werkstattbuch 3D).
     Schalen, Rand, Knopf, Platine, Akku, Ferrit, Motor und Schrauben kommen als Netz aus assets/media/chip-teile.bin.
     Die kleinen Bauteile sind bei ihm nur Quader; hier sind sie in ihrer Größe und Lage aus seinem Modell nachgebaut:
     Funkmodul und GPS mit Blechdeckel, Patch-Antenne, LoRa-Antenne, Taster, LED, dazu die Ladespule als Spirale.
     Die Lage der Bauteile ist laut Werkstattbuch ein Vorschlag. Maße in mm, die Dicke des Chips ist z. */
  // [Name, Material, Versatz entlang der Dicke in mm (offen), innen?]
  const NETZ = {
    rueckschale: ["schale", -58, false], schrauben: ["metall", -72, false],
    qi_ferrit: ["ferrit", -28, true], akku: ["akku", -16, true], platine: ["platine", 0, true], klein: ["chip", 0, true], motor: ["metall", 0, true],
    rand: ["orange", 30, false], vorderschale: ["schale", 45, false], ledstab: ["led", 45, false], ring: ["orange", 58, false], kappe: ["knopf", 64, false],
  };
  // Namen in der Reihenfolge der Liste im HTML: [Teil, Form des Umrisses]. Die Linie setzt am Punkt des Umrisses an,
  // der gerade am weitesten rechts steht (Feedback 112: so bleibt sie außen, auch wenn man den Stapel umdreht).
  // Die LED ist ein fester Punkt oben in der Vorderschale.
  const ANSATZ = [["kappe", "rund"], ["ledstab", "fest", 52.5, 23, 18], ["rand", "eckig"], ["platine", "eckig"], ["akku", "eckig"], ["qi", "rund"]];
  const GROESSE = [66, 46, 18];
  const holen = (pfad) => fetch(pfad).then((r) => { if (!r.ok) throw new Error("Modell fehlt: " + pfad); return r.arrayBuffer(); });
  const daten = await holen("assets/media/chip-teile.bin");

  /* Texturen aus dem Canvas: Struktur der Schalen, Platine mit Leiterbahnen, Deckel der Module, Akku-Folie */
  const leinwandTextur = (b, h, malen, wiederholen) => {
    const c = document.createElement("canvas"); c.width = b; c.height = h; malen(c.getContext("2d"), b, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (wiederholen) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const struktur = leinwandTextur(256, 256, (x) => {   // feine Struktur wie gestrahlter Kunststoff
    const d = x.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = 110 + Math.random() * 60; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
  }, true);
  struktur.colorSpace = THREE.NoColorSpace;

  // Platine 61 × 37,4 mm (x 2,5 bis 63,5, y 4,3 bis 41,7): Lötstopplack, Leiterbahnen, Durchkontaktierungen, Lötflächen
  const PL = { x0: 2.5, y0: 4.3, b: 61, h: 37.4 };
  const platineTextur = leinwandTextur(1220, 748, (x, B, H) => {
    const px = (mx) => ((mx - PL.x0) / PL.b) * B, py = (my) => (1 - (my - PL.y0) / PL.h) * H, s = B / PL.b;
    const g = x.createLinearGradient(0, 0, B, H); g.addColorStop(0, "#14684d"); g.addColorStop(1, "#0d5440");
    x.fillStyle = g; x.fillRect(0, 0, B, H);
    // Leiterbahnen: helleres Grün, abgerundet, im 45°-Raster
    x.strokeStyle = "rgba(70, 170, 120, 0.55)"; x.lineCap = "round"; x.lineJoin = "round";
    const bahn = (w, ...p) => { x.lineWidth = w * s; x.beginPath(); p.forEach(([a, b2], i) => (i ? x.lineTo(px(a), py(b2)) : x.moveTo(px(a), py(b2)))); x.stroke(); };
    bahn(0.5, [42.5, 14], [37, 14], [34.7, 11.5]); bahn(0.5, [42.5, 18], [38, 18], [36, 20.5]);
    bahn(0.4, [34.7, 9], [38, 6.5], [56, 6.5], [57.5, 8]); bahn(0.6, [21.5, 23], [27, 23], [30.5, 23]);
    bahn(0.4, [25, 12], [22, 15.5]); bahn(0.5, [57.5, 21.8], [59.5, 24], [59.5, 27]);
    bahn(0.4, [36.5, 23], [44, 23], [51.7, 23]); bahn(0.5, [33.5, 26], [33.5, 33], [38, 37.5], [41, 37.5]);
    bahn(0.4, [49, 34.7], [55, 34.7], [58.5, 30.5]); bahn(0.4, [25, 38], [30, 33], [30, 26]);
    bahn(0.8, [8, 36], [8, 40], [60, 40], [62, 38]); bahn(0.4, [12, 32], [12, 36]);
    for (let i = 0; i < 6; i++) bahn(0.3, [44 + i * 2.2, 26], [44 + i * 2.2, 29.5]);
    // Durchkontaktierungen
    x.fillStyle = "#c9a14a";
    [[38, 14], [36, 18], [56, 6.5], [27, 23], [22, 15.5], [59.5, 27], [44, 23], [33.5, 33], [41, 37.5], [55, 34.7], [30, 33], [12, 32], [8, 36], [62, 38], [20, 36], [48, 31]]
      .forEach(([a, b2]) => { x.beginPath(); x.arc(px(a), py(b2), 0.55 * s, 0, 7); x.fill(); x.fillStyle = "#0b3d2f"; x.beginPath(); x.arc(px(a), py(b2), 0.22 * s, 0, 7); x.fill(); x.fillStyle = "#c9a14a"; });
    // Lötflächen rund um die Module (gold)
    x.fillStyle = "#d4ad57";
    const pads = (x1, y1, x2, y2, n) => { for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; x.fillRect(px(x1 + (x2 - x1) * t) - 0.35 * s, py(y1 + (y2 - y1) * t) - 0.35 * s, 0.7 * s, 0.7 * s); } };
    pads(42.2, 6, 42.2, 22, 10); pads(57.8, 6, 57.8, 22, 10); pads(24.7, 6, 24.7, 16.7, 6); pads(35, 6, 35, 16.7, 6);
    // Bestückungsdruck: Umrisse und Beschriftung in Weiß
    x.strokeStyle = "rgba(240, 245, 240, 0.75)"; x.lineWidth = 0.18 * s; x.setLineDash([]);
    const rahmen = (a, b2, c2, d2) => x.strokeRect(px(a), py(d2), (c2 - a) * s, (d2 - b2) * s);
    rahmen(42, 5.8, 58, 22.3); rahmen(24.5, 5.8, 35.2, 16.9); rahmen(6, 15, 22, 31); rahmen(30, 19.5, 37, 26.5); rahmen(40.5, 30.2, 49.5, 39.2);
    x.fillStyle = "rgba(240, 245, 240, 0.85)"; x.font = `600 ${1.5 * s}px system-ui, sans-serif`;
    x.fillText("LORA", px(43), py(23.4)); x.fillText("GPS", px(25), py(18)); x.fillText("SW1", px(37.6), py(25.4)); x.fillText("M1", px(50.2), py(31));
    x.font = `700 ${2.1 * s}px system-ui, sans-serif`; x.fillText("SKI TAG", px(8), py(38.6));
    x.font = `500 ${1.2 * s}px system-ui, sans-serif`; x.fillText("fertig4 · Konzept", px(8), py(35.9));
  });
  const modulDeckel = (text) => leinwandTextur(256, 256, (x, B, H) => {   // gebürstetes Blech mit eingeprägter Schrift
    const g = x.createLinearGradient(0, 0, B, H); g.addColorStop(0, "#e9ecef"); g.addColorStop(0.5, "#c3c8ce"); g.addColorStop(1, "#dfe2e6");
    x.fillStyle = g; x.fillRect(0, 0, B, H);
    for (let i = 0; i < 260; i++) { x.strokeStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "90,96,104"},${0.05 + Math.random() * 0.06})`; x.lineWidth = 1; const yy = Math.random() * H; x.beginPath(); x.moveTo(0, yy); x.lineTo(B, yy + (Math.random() - 0.5) * 4); x.stroke(); }
    x.fillStyle = "rgba(60, 66, 74, 0.75)"; x.font = "700 40px system-ui, sans-serif"; x.textAlign = "center"; x.fillText(text, B / 2, H / 2 + 14);
    x.beginPath(); x.arc(30, 30, 9, 0, 7); x.fill();
  });
  const akkuTextur = leinwandTextur(960, 600, (x, B, H) => {   // Folie mit Aufkleber
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#d9dde3"); g.addColorStop(1, "#b9bfc8");
    x.fillStyle = g; x.fillRect(0, 0, B, H);
    x.fillStyle = "#1f2b4a"; x.fillRect(B * 0.08, H * 0.2, B * 0.84, H * 0.6);
    x.fillStyle = "#ff6a2e"; x.fillRect(B * 0.08, H * 0.2, B * 0.03, H * 0.6);
    x.fillStyle = "#ffffff"; x.font = "700 92px system-ui, sans-serif"; x.fillText("LiPo", B * 0.17, H * 0.52);
    x.font = "500 44px system-ui, sans-serif"; x.fillStyle = "rgba(255,255,255,0.75)"; x.fillText("3,7 V · flach", B * 0.17, H * 0.68);
  });

  const Phys = THREE.MeshPhysicalMaterial, Std = THREE.MeshStandardMaterial;
  const MAT = {
    schale: new Phys({ color: 0x24272d, roughness: 0.5, bumpMap: struktur, bumpScale: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.45 }),
    orange: new Phys({ color: 0xf0561a, roughness: 0.62, bumpMap: struktur, bumpScale: 0.18, sheen: 0.4, sheenColor: 0xffb08a, sheenRoughness: 0.6 }),
    knopf: new Phys({ color: 0x2e3137, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    metall: new Std({ color: 0xb4b8be, roughness: 0.26, metalness: 0.95 }),
    led: new Std({ color: 0xb6ffbe, emissive: 0x35e070, emissiveIntensity: 1.2, roughness: 0.1 }),
    ferrit: new Std({ color: 0x33363d, roughness: 0.8 }),
    kupfer: new Std({ color: 0xd98a4e, roughness: 0.28, metalness: 0.95 }),
    akku: new Std({ map: akkuTextur, roughness: 0.32, metalness: 0.55 }),
    platine: new Phys({ map: platineTextur, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    platineKante: new Std({ color: 0x0c4a38, roughness: 0.6 }),
    chip: new Std({ color: 0x1b1d22, roughness: 0.55 }),
    modulPlatine: new Std({ color: 0x1d3c6e, roughness: 0.5 }),
    gold: new Std({ color: 0xd8b057, roughness: 0.3, metalness: 1 }),
    blech: new Std({ color: 0xcdd2d8, roughness: 0.3, metalness: 0.9 }),
    keramik: new Std({ color: 0xe8dcc2, roughness: 0.75 }),
    silber: new Std({ color: 0xe1e4e8, roughness: 0.22, metalness: 0.95 }),
    taster: new Std({ color: 0x15171b, roughness: 0.6 }),
  };
  if (leicht) for (const m of Object.values(MAT)) if (m.isMeshPhysicalMaterial) { m.clearcoat = 0; m.sheen = 0; }
  const deckelMat = (text) => [MAT.blech, MAT.blech, MAT.blech, MAT.blech, new Std({ map: modulDeckel(text), roughness: 0.32, metalness: 0.85 }), MAT.blech];

  const stapel = new THREE.Group();   // Dicke des Chips zeigt nach oben
  stapel.rotation.x = -Math.PI / 2;
  const inhalt = new THREE.Group();
  inhalt.position.set(-GROESSE[0] / 2, -GROESSE[1] / 2, -GROESSE[2] / 2);
  stapel.add(inhalt); szene.add(stapel);

  const teile = {}, alle = [];
  const ebene = (name, versatz, innen) => {   // eine Gruppe je Schicht, die beim Öffnen entlang z wandert
    const g = new THREE.Group(); inhalt.add(g);
    const t = { name, m: g, versatz, innen }; teile[name] = t; alle.push(t); return g;
  };
  const schatten = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

  const qi = ebene("qi", -40, true);   // Ladespule; der Ferrit darüber ist eine eigene Schicht, damit die Spule zu sehen ist
  // Netze aus der Datei
  const kopfLaenge = new Uint32Array(daten, 0, 1)[0];
  const kopf = JSON.parse(new TextDecoder().decode(new Uint8Array(daten, 4, kopfLaenge)).replace(/\0+$/, ""));   // Kopf ist mit Nullen auf 4 Byte aufgefüllt
  let ofs = 4 + kopfLaenge;
  for (const { name, ecken, indizes } of kopf.teile) {
    const p16 = new Int16Array(daten, ofs, ecken * 3); ofs += Math.ceil(ecken * 6 / 4) * 4;
    const n8 = new Int8Array(daten, ofs, ecken * 3); ofs += Math.ceil(ecken * 3 / 4) * 4;
    const ix = new Uint16Array(daten, ofs, indizes); ofs += Math.ceil(indizes * 2 / 4) * 4;
    const pos = new Float32Array(ecken * 3), nor = new Float32Array(ecken * 3), uv = new Float32Array(ecken * 2);
    for (let i = 0; i < ecken * 3; i++) { pos[i] = p16[i] * kopf.schritt; nor[i] = n8[i] / 127; }
    const flach = name === "platine" || name === "akku";   // Bild von oben über die ganze Fläche
    const bb = [Infinity, Infinity, -Infinity, -Infinity];
    if (flach) for (let i = 0; i < ecken; i++) { bb[0] = Math.min(bb[0], pos[3 * i]); bb[1] = Math.min(bb[1], pos[3 * i + 1]); bb[2] = Math.max(bb[2], pos[3 * i]); bb[3] = Math.max(bb[3], pos[3 * i + 1]); }
    for (let i = 0; i < ecken; i++) {
      const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2];
      if (flach) { uv[2 * i] = (x - bb[0]) / (bb[2] - bb[0]); uv[2 * i + 1] = (y - bb[1]) / (bb[3] - bb[1]); continue; }
      const ax = Math.abs(nor[3 * i]), ay = Math.abs(nor[3 * i + 1]), az = Math.abs(nor[3 * i + 2]);   // Struktur überall gleich groß
      const [u, v] = az >= ax && az >= ay ? [x, y] : ax >= ay ? [y, z] : [x, z];
      uv[2 * i] = u / 9; uv[2 * i + 1] = v / 9;
    }
    if (name === "platine") { const pb = (PL.x0 - bb[0]) / (bb[2] - bb[0]); if (Math.abs(pb) > 0.01) console.warn("Platine verschoben", pb); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(new THREE.BufferAttribute(ix, 1));
    const [mat, versatz, innen] = NETZ[name];
    // Bauteile auf der Platine wandern mit der Platine
    const ziel = name === "klein" || name === "motor" ? teile.platine.m : ebene(name, versatz, innen);
    ziel.add(schatten(new THREE.Mesh(g, MAT[mat])));
  }

  // Selbst nachgebaute Bauteile (Größe und Lage aus Maxis Modell)
  const quader = (x0, y0, z0, x1, y1, z1, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return schatten(m);
  };
  const rund = (x0, y0, z0, x1, y1, z1, r, mat) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(x1 - x0, y1 - y0, z1 - z0, 3, r), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return schatten(m);
  };
  const auf = teile.platine.m;
  const modul = (x0, y0, x1, y1, z1, text) => {   // kleine Trägerplatine mit Lötkanten, darauf ein Blechdeckel
    const z0 = 8.6;
    auf.add(quader(x0, y0, z0, x1, y1, z0 + 0.8, MAT.modulPlatine));
    const n = Math.round((y1 - y0) / 1.6);
    for (let i = 0; i < n; i++) { const y = y0 + (i + 0.5) * (y1 - y0) / n; auf.add(quader(x0 - 0.05, y - 0.35, z0, x0 + 0.5, y + 0.35, z0 + 0.82, MAT.gold), quader(x1 - 0.5, y - 0.35, z0, x1 + 0.05, y + 0.35, z0 + 0.82, MAT.gold)); }
    const deckel = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 - 1.2, y1 - y0 - 1.2, z1 - z0 - 0.8), deckelMat(text));
    deckel.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + 0.8 + z1) / 2); auf.add(schatten(deckel));
  };
  modul(42.5, 6.3, 57.5, 21.8, 11.1, "RAK3172");   // Funkmodul (LoRa)
  modul(25, 6.3, 34.7, 16.4, 11.0, "L76K");        // GPS
  auf.add(rund(6.5, 15.5, 8.6, 21.5, 30.5, 12.6, 0.5, MAT.keramik));            // GPS-Antenne: Keramik
  auf.add(quader(10, 19, 12.6, 18, 27, 12.68, MAT.silber));                      // mit Silberfläche oben
  const speise = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.25, 20), MAT.silber);
  speise.rotation.x = Math.PI / 2; speise.position.set(15.5, 21.5, 12.75); auf.add(speise);
  auf.add(rund(58.5, 27.6, 8.6, 60.5, 33.4, 9.8, 0.2, MAT.keramik));             // LoRa-Antenne: Keramik mit Silberkappen
  auf.add(quader(58.4, 27, 8.6, 60.6, 27.8, 9.85, MAT.silber), quader(58.4, 33.2, 8.6, 60.6, 34, 9.85, MAT.silber));
  auf.add(quader(30.5, 20, 8.6, 36.5, 26, 11.2, MAT.taster));                    // Taster unter dem Knopf
  auf.add(quader(30.8, 20.3, 11.2, 36.2, 25.7, 11.45, MAT.blech));
  const stoessel = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.7, 32), MAT.taster);
  stoessel.rotation.x = Math.PI / 2; stoessel.position.set(33.5, 23, 11.8); auf.add(schatten(stoessel));
  auf.add(quader(51.7, 22.6, 8.6, 53.3, 23.4, 9.2, MAT.keramik), quader(52.1, 22.75, 9.2, 52.9, 23.25, 9.4, MAT.led));   // LED

  // Ladespule als flache Spirale aus Kupferdraht auf dem Ferrit
  class Spirale extends THREE.Curve {
    getPoint(t, z = new THREE.Vector3()) { const w = t * 15 * Math.PI * 2, r = 5.4 + 9.2 * t; return z.set(33 + Math.cos(w) * r, 23 + Math.sin(w) * r, 1.3); }
  }
  qi.add(schatten(new THREE.Mesh(new THREE.TubeGeometry(new Spirale(), leicht ? 700 : 1400, 0.28, leicht ? 5 : 6, false), MAT.kupfer)));

  const VERSATZ = alle.reduce((a, t) => [Math.min(a[0], t.versatz), Math.max(a[1], t.versatz)], [0, 0]);

  /* ------------------------------------------------- Zustand anwenden -- */
  const anwenden = (e) => {
    for (const t of alle) {
      t.m.position.z = t.versatz * e;
      if (t.innen) t.m.visible = e > 0.012;   // geschlossen bleibt das Innere unsichtbar (sonst blitzt es durch Spalte der Hülle)
    }
  };
  const mittelpunkt = new THREE.Vector3();
  // Der offene Stapel rückt nach links (Anteil SCHUB der Breite), rechts daneben stehen die Namen
  const SCHUB = handy || innerWidth < 900 ? 0.16 : 0.07;
  const DIAGONALE = Math.hypot(GROESSE[0], GROESSE[1]);
  let abstand = 1;
  const kameraSetzen = (e, az, el, B, H) => {
    const unten = -GROESSE[2] / 2 + VERSATZ[0] * e, oben = GROESSE[2] / 2 + (VERSATZ[1] + 4) * e;
    // Breite: die Diagonale, also die größte Breite in jeder Drehung (Feedback 113: beim Drehen bleibt die Größe gleich)
    const hoch = (oben - unten) * Math.cos(el) + 54 * Math.sin(el), breit = DIAGONALE;
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2)), o = weich(e);
    // halbe Breite des Stapels in px darf links nicht über den Rand und rechts nicht in die Namen reichen
    const namen = B < 500 ? 126 : 150;   // Platz für die Namen rechts in px
    const platz = Math.max(60, Math.min(B * (0.5 - SCHUB * o) - 8, B * (0.5 + SCHUB * o) - namen * o - 8));
    const d = Math.max((hoch / 2) * 1.14 / t, (breit / 2) * (H / 2) / (t * platz));
    abstand = d;
    mittelpunkt.set(0, (oben + unten) / 2, 0);
    kamera.aspect = B / H;
    kamera.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(d).add(mittelpunkt);
    kamera.up.set(0, 1, 0);
    kamera.lookAt(mittelpunkt);
    if (o > 0.001) kamera.setViewOffset(B, H, B * SCHUB * o, 0, B, H); else kamera.clearViewOffset();
    kamera.updateProjectionMatrix();
  };

  /* ----------------------------------------------- Namen und Linien -- */
  const NS = "http://www.w3.org/2000/svg";
  const linien = marken.map(() => {
    const g = document.createElementNS(NS, "g"), pfad = document.createElementNS(NS, "path"), kreis = document.createElementNS(NS, "circle");
    kreis.setAttribute("r", "4"); g.style.opacity = "0"; g.append(pfad, kreis); zeiger.appendChild(g);
    return { g, pfad, kreis };
  });
  const punkt = new THREE.Vector3(), orte = marken.map(() => ({ x: 0, y: 0 }));
  // Umrisse einmal aus den Maßen der Teile: je benanntem Teil 32 Punkte rundherum auf halber Höhe (rund: Kreis, eckig: Rechteck mit leicht eingezogenen Ecken)
  const masse = (gruppe) => {
    const box = new THREE.Box3(), bb = new THREE.Box3();
    gruppe.traverse((c) => { if (c.isMesh) { c.geometry.computeBoundingBox(); bb.copy(c.geometry.boundingBox).translate(c.position); box.union(bb); } });
    return box;
  };
  const umrisse = ANSATZ.map(([name, form, x, y, z]) => {
    if (form === "fest") return [new THREE.Vector3(x, y, z)];
    const b = masse(teile[name].m), cx = (b.min.x + b.max.x) / 2, cy = (b.min.y + b.max.y) / 2;
    const zz = name === "kappe" ? b.max.z : (b.min.z + b.max.z) / 2, rx = (b.max.x - b.min.x) / 2, ry = (b.max.y - b.min.y) / 2, l = [];
    for (let k = 0; k < 32; k++) {
      const w = (k / 32) * Math.PI * 2, c = Math.cos(w), s = Math.sin(w);
      const f = form === "rund" ? Math.min(rx, ry) * 0.97 : 1 / Math.max(Math.abs(c) / (rx - 1.2), Math.abs(s) / (ry - 1.2));
      l.push(new THREE.Vector3(cx + c * f, cy + s * f, zz));
    }
    return l;
  });
  const achseOben = new THREE.Vector3(GROESSE[0] / 2, GROESSE[1] / 2, 19.2), achseUnten = new THREE.Vector3(GROESSE[0] / 2, GROESSE[1] / 2, 1.3);
  const aufBild = (obj, v, B, H) => { obj.localToWorld(punkt.copy(v)); punkt.project(kamera); return [(punkt.x * 0.5 + 0.5) * B, (-punkt.y * 0.5 + 0.5) * H]; };
  const namenSetzen = (e, B, H) => {
    // Punkte an den Teilen: jeweils der rechteste Punkt des Umrisses
    ANSATZ.forEach(([name], i) => {
      let bx = -Infinity, by = 0;
      for (const v of umrisse[i]) { const [x, y] = aufBild(teile[name].m, v, B, H); if (x > bx) { bx = x; by = y; } }
      orte[i].x = bx; orte[i].y = by;
    });
    // Die Namen stehen still (Feedback 113): die Spalte liegt rechts neben dem Kreis, den der Stapel beim Drehen
    // überstreicht, die Höhen kommen von Punkten auf der Drehachse (Knopf oben, Ladespule unten). Beides ändert sich
    // beim Drehen nicht, nur die Linien suchen sich ihren Ansatz am Teil.
    punkt.copy(mittelpunkt).project(kamera);
    const mitteX = (punkt.x * 0.5 + 0.5) * B;
    const proMm = (H / 2) / (abstand * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    const yOben = aufBild(teile.kappe.m, achseOben, B, H)[1], yUnten = aufBild(teile.qi.m, achseUnten, B, H)[1];
    const spalte = Math.min(mitteX + (DIAGONALE / 2) * proMm + (B < 500 ? 18 : 34), B - (B < 500 ? 94 : 110));
    marken.forEach((li, i) => {
      // die Namen kommen nacheinander, wenn der Chip fast offen ist, und gehen mit dem Schließen wieder
      const an = weich(abschnitt(e, 0.62 + i * 0.045, 0.8 + i * 0.045));
      const y = mix(yOben, yUnten, i / (marken.length - 1)), o = orte[i], L = linien[i];
      li.style.opacity = an.toFixed(3);
      li.style.transform = "translate3d(" + (spalte + (1 - an) * 10).toFixed(1) + "px," + y.toFixed(1) + "px,0) translateY(-50%)";
      L.g.style.opacity = an.toFixed(3);
      L.kreis.setAttribute("cx", o.x.toFixed(1)); L.kreis.setAttribute("cy", o.y.toFixed(1));
      const knick = Math.max(o.x + 10, spalte - 30);
      L.pfad.setAttribute("d", "M" + o.x.toFixed(1) + " " + o.y.toFixed(1) + " L" + knick.toFixed(1) + " " + y.toFixed(1) + " L" + (spalte - 9).toFixed(1) + " " + y.toFixed(1));
    });
  };

  /* ------------------------------------------------------ Bildschleife -- */
  let e = 0, az = 0, el = 0, zug = 0, zugZiel = 0, zx = 0, zxS = 0, pS = -1;
  let bedarf = true, groesseAlt = "", letzteSig = "", laeuft = false, zuletzt = 0;

  const bild = (jetzt) => {
    const dt = zuletzt ? Math.min(0.05, (jetzt - zuletzt) / 1000) : 0.016; zuletzt = jetzt;
    Z.lesen();
    const gleit = (zeit) => (ohneBewegung ? 1 : 1 - Math.exp(-dt / zeit));
    // Öffnung: breit folgt sie dem Scrollen (kurz geglättet), sonst läuft sie in Ruhe auf
    e += (Z.offen - e) * gleit(Z.klick ? 0.5 : 0.1);
    if (Math.abs(Z.offen - e) < 0.0005) e = Z.offen;
    zug += (zugZiel - zug) * gleit(0.12); if (Math.abs(zugZiel - zug) < 0.0005) zug = zugZiel;
    zxS += (zx - zxS) * gleit(0.25); if (Math.abs(zx - zxS) < 0.0005) zxS = zx;
    const p = Z.klick ? 0 : Z.p || 0;
    if (pS < 0) pS = p;
    pS += (p - pS) * gleit(0.1); if (Math.abs(p - pS) < 0.0003) pS = p;
    const ruht = e === Z.offen && zug === zugZiel && zxS === zx && pS === p;
    // Blickrichtung: der Stapel dreht sich mit dem Scrollen ein Stück weiter; Ziehen und Zeiger drehen dazu
    az = -0.62 + pS * 0.45 + zug + zxS * 0.18;
    el = mix(0.52, 0.44, e);

    const B = bildEl.clientWidth, H = bildEl.clientHeight;
    if (B && H) {
      const gr = B + "x" + H;
      if (gr !== groesseAlt) { groesseAlt = gr; renderer.setSize(B, H, false); zeiger.setAttribute("viewBox", "0 0 " + B + " " + H); bedarf = true; }
      const sig = e.toFixed(4) + az.toFixed(4);
      if (sig !== letzteSig || bedarf) {
        letzteSig = sig; bedarf = false;
        anwenden(e);
        kameraSetzen(e, az, el, B, H);
        stapel.updateMatrixWorld(true);
        renderer.render(szene, kamera);
        namenSetzen(e, B, H);
      }
    }
    if (Z.sichtbar && !ruht) requestAnimationFrame(bild);
    else { laeuft = false; zuletzt = 0; }
  };
  anstossen = () => { if (!laeuft && Z.sichtbar) { laeuft = true; requestAnimationFrame(bild); } };

  // Ziehen dreht den Stapel (Maus und Finger; senkrecht bleibt Scrollen), der Zeiger neigt ihn leicht
  let gezogen = null;
  leinwand.addEventListener("pointerdown", (ev) => { gezogen = { x: ev.clientX, start: zugZiel }; try { leinwand.setPointerCapture(ev.pointerId); } catch (f) {} });
  leinwand.addEventListener("pointermove", (ev) => {
    if (gezogen) { zugZiel = gezogen.start + (ev.clientX - gezogen.x) * 0.008; anstossen(); }
    else if (ev.pointerType === "mouse") { const r = leinwand.getBoundingClientRect(); zx = (ev.clientX - r.left) / r.width - 0.5; anstossen(); }
  });
  const los = () => { gezogen = null; };
  leinwand.addEventListener("pointerup", los); leinwand.addEventListener("pointercancel", los);
  leinwand.addEventListener("pointerleave", () => { zx = 0; anstossen(); });

  new IntersectionObserver((ein) => { Z.sichtbar = ein[0].isIntersecting; anstossen(); }).observe(akt);
  let groesseWartet = 0;
  addEventListener("resize", () => { clearTimeout(groesseWartet); groesseWartet = setTimeout(() => { bedarf = true; if (!laeuft) { laeuft = true; requestAnimationFrame(bild); } }, 120); });

  // erstes Bild; das Standbild weicht erst jetzt
  wurzel.classList.add("chip3d-seite");
  if (document.fonts && document.fonts.ready) await document.fonts.ready.catch(() => {});
  Z.sichtbar = true; laeuft = true; requestAnimationFrame(bild);
}
