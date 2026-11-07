// Das 3D-Modell des Prototyp-Chips für „Was drinsteckt“ (drinsteckt.js).
// Aufbau und Reihenfolge nach der Explosionszeichnung im Werkstattbuch (Maximilian, Blatt 00):
// Knopf und Kragen, Deckel mit LED, Platine mit Modulen, Lade-Modul und Motor, Akku, Qi-Empfänger,
// Unterteil und Hülle. Außenmaß mit Hülle 120 × 60 × 32 mm, Farbe Signal-Orange (Werkstattbuch Kap. 2,
// beides entschieden). Die Maße der Teile innen sind geschätzt und nur zur Anschauung.
import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

export const FARBEN = {
  orange: "#ff4a10",     // Gehäuse in Signal-Orange
  graphit: "#262b33",    // weiche Hülle und Kragen aus TPU
  knopf: "#f4f6f8",      // der eine Knopf
  notruf: "#ff2d2d",
};

export function webglGeht() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
  catch { return false; }
}

// Renderer und Szene mit Studiolicht; transparenter Hintergrund, damit der Seitengrund durchscheint
export function studio(canvas, { schatten = true, belichtung = 1.05, umgebung = 0.85 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = belichtung;
  renderer.shadowMap.enabled = schatten;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xffffff, 0);
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = umgebung;
  return { renderer, scene };
}

export function baueChip({ innen = true, schatten = true } = {}) {
  const chip = new THREE.Group();
  chip.scale.setScalar(0.01);        // Millimeter → 120 mm = 1,2 Einheiten

  const stoff = (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.5, metalness: 0, ...o });
  const ORANGE = { color: FARBEN.orange, roughness: 0.62, specularIntensity: 0.35, clearcoat: 0.08, clearcoatRoughness: 0.7 };   // matt wie gedruckter Kunststoff, damit er nicht rosa spiegelt
  const TPU = { color: FARBEN.graphit, roughness: 0.82, sheen: 0.6, sheenRoughness: 0.5, sheenColor: "#5b6575" };
  const KNOPF = { color: FARBEN.knopf, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 };
  const STAHL = { color: "#c3cad2", roughness: 0.32, metalness: 0.9 };
  const KUPFER = { color: "#c0703a", roughness: 0.34, metalness: 0.95 };
  const BRETT = { color: "#24314a", roughness: 0.55 };

  const netz = (g, m) => { const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = schatten; return o; };
  const teile = {};
  const teil = (schluessel, name, daten) => { const g = new THREE.Group(); g.name = name; Object.assign(g.userData, daten); chip.add(g); teile[schluessel] = g; return g; };
  const kiste = (b, h, t, r, m, x, y, z) => { const o = netz(new RoundedBoxGeometry(b, h, t, 3, r), m); o.position.set(x, y, z); return o; };

  function rundRechteck(b, t, r) {
    const s = new THREE.Shape(), x = -b / 2, y = -t / 2;
    s.moveTo(x + r, y); s.lineTo(x + b - r, y); s.quadraticCurveTo(x + b, y, x + b, y + r);
    s.lineTo(x + b, y + t - r); s.quadraticCurveTo(x + b, y + t, x + b - r, y + t);
    s.lineTo(x + r, y + t); s.quadraticCurveTo(x, y + t, x, y + t - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  // Fläche in der x-z-Ebene, nach oben (y) extrudiert, unten bei y0
  function platte(form, hoehe, y0, fase = 0) {
    const g = new THREE.ExtrudeGeometry(form, {
      depth: hoehe - 2 * fase, bevelEnabled: fase > 0, bevelThickness: fase, bevelSize: fase, bevelSegments: 4, curveSegments: 28,
    });
    g.rotateX(-Math.PI / 2);
    g.translate(0, y0 + fase, 0);
    return g;
  }
  function textur(b, h, malen) {
    const c = document.createElement("canvas"); c.width = b; c.height = h;
    malen(c.getContext("2d"), b, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }

  // 7 · Unterteil und Hülle: gedruckte Wanne, rundum eine weiche Hülle aus TPU
  const unterteil = teil("unterteil", "Unterteil und Hülle", { stage: 0, explode: [0, -80, 0] });
  {
    const wanne = stoff(ORANGE);
    const wand = rundRechteck(114, 54, 12); wand.holes.push(rundRechteck(110, 50, 10));
    unterteil.add(netz(platte(rundRechteck(114, 54, 12), 2, 1), wanne));
    unterteil.add(netz(platte(wand, 22, 1), wanne));
    const huelle = stoff(TPU);
    const ring = rundRechteck(120, 60, 15); ring.holes.push(rundRechteck(114.4, 54.4, 12.2));
    unterteil.add(netz(platte(ring, 25.6, 0, 1.6), huelle));
    unterteil.add(netz(platte(rundRechteck(118, 58, 14), 1.4, 0, 0.5), huelle));
  }

  if (innen) {
    // 6 · Qi-Empfänger: flache Spule auf einer dünnen Folie
    const qi = teil("qi", "Qi-Empfänger", { stage: 1, explode: [0, -46, 0] });
    qi.add(netz(platte(rundRechteck(62, 42, 4), 0.6, 3.2), stoff({ color: "#1b2333", roughness: 0.7 })));
    const punkte = [];
    for (let i = 0; i <= 900; i++) {
      const a = (i / 900) * Math.PI * 2 * 13, r = 7 + (i / 900) * 12.5;
      punkte.push(new THREE.Vector3(Math.cos(a) * r, 4.2, Math.sin(a) * r));
    }
    qi.add(netz(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(punkte), 1400, 0.42, 6, false), stoff(KUPFER)));

    // 5 · Akku: LiPo 1000 mAh mit Aufkleber
    const akku = teil("akku", "Akku", { stage: 2, explode: [0, -14, 0] });
    akku.add(kiste(52, 9, 34, 2.2, stoff({ color: "#cfd6de", roughness: 0.28, metalness: 0.6 }), -8, 9.6, 0));
    const aufkleber = textur(512, 336, (g, b) => {
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, b, 336);
      g.fillStyle = "#0b1226"; g.font = "700 74px 'Funnel Display', system-ui, sans-serif"; g.fillText("LiPo", 40, 120);
      g.font = "500 58px 'Funnel Sans', system-ui, sans-serif"; g.fillText("1000 mAh · 3,7 V", 40, 210);
      g.fillStyle = FARBEN.orange; g.fillRect(40, 250, b - 80, 8);
    });
    const schild = new THREE.Mesh(new THREE.PlaneGeometry(40, 26), stoff({ map: aufkleber, roughness: 0.6 }));
    schild.rotation.x = -Math.PI / 2; schild.position.set(-9, 14.15, 0); schild.receiveShadow = schatten;
    akku.add(schild);
    akku.add(kiste(4, 0.4, 5, 0.15, stoff(STAHL), 19.6, 10, -5), kiste(4, 0.4, 5, 0.15, stoff(STAHL), 19.6, 10, 5));
    for (const [z, farbe] of [[-5, "#d23a2e"], [5, "#141821"]]) {
      const kabel = new THREE.CatmullRomCurve3([new THREE.Vector3(21, 10, z), new THREE.Vector3(26, 11, z * 0.8), new THREE.Vector3(30, 14, z * 0.5)]);
      akku.add(netz(new THREE.TubeGeometry(kabel, 20, 0.6, 6), stoff({ color: farbe, roughness: 0.5 })));
    }

    // 4 · Lade-Modul und Vibrationsmotor
    const lade = teil("lade", "Lade-Modul und Motor", { stage: 1, explode: [0, 10, 0] });
    lade.add(kiste(20, 1.4, 16, 0.4, stoff(BRETT), 34, 15.2, -8));
    lade.add(kiste(5, 1.4, 4, 0.3, stoff({ color: "#0f141c", roughness: 0.4 }), 32, 16.4, -8));
    const motor = netz(new THREE.CylinderGeometry(5, 5, 3, 32), stoff(STAHL));
    motor.position.set(-34, 16, 8); lade.add(motor);

    // 3 · Platine mit Modulen: Lochrasterplatte mit Funkmodul (RAK), GPS, Bewegungssensor, Akku-Messer
    const platine = teil("platine", "Platine mit Modulen", { stage: 1, explode: [0, 34, 0] });
    const raster = textur(1024, 496, (g, b, h) => {
      g.fillStyle = "#2b3a57"; g.fillRect(0, 0, b, h);
      g.fillStyle = "#c9a35a";
      const schritt = b / 39;
      for (let x = schritt / 2; x < b; x += schritt) for (let y = schritt / 2; y < h; y += schritt) { g.beginPath(); g.arc(x, y, 5.6, 0, Math.PI * 2); g.fill(); }
    });
    const pl = new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: raster, roughness: 0.55 });
    const seite = stoff({ color: "#24314a", roughness: 0.6 });
    const brett = netz(new THREE.BoxGeometry(100, 1.6, 48), [seite, seite, pl, seite, seite, seite]);
    brett.position.y = 19.8; platine.add(brett);
    const oben = 20.6;
    platine.add(kiste(26, 1.2, 16, 0.3, stoff({ color: "#141b29", roughness: 0.55 }), -30, oben + 0.6, -6));
    platine.add(kiste(20, 1.6, 13, 0.4, stoff(STAHL), -31, oben + 1.9, -6));
    platine.add(kiste(25, 1.2, 25, 0.3, stoff({ color: "#141b29", roughness: 0.55 }), 2, oben + 0.6, 4));
    platine.add(kiste(18, 4, 18, 0.8, stoff({ color: "#d9cdb4", roughness: 0.7 }), 2, oben + 3.2, 4));
    platine.add(kiste(13, 0.3, 13, 0.2, stoff(STAHL), 2, oben + 5.3, 4));
    platine.add(kiste(12, 1.2, 10, 0.3, stoff(BRETT), 27, oben + 0.6, 12));
    platine.add(kiste(12, 1.2, 10, 0.3, stoff(BRETT), 40, oben + 0.6, 12));
    for (const x of [27, 40]) platine.add(kiste(3, 0.9, 3, 0.2, stoff({ color: "#0f141c" }), x, oben + 1.6, 12));
  }

  // 2 · Deckel mit LED: Loch für den Knopf, LED vorne rechts, Schriftzug eingeprägt
  const deckel = teil("deckel", "Deckel mit LED", { stage: 0, explode: [0, 64, 0] });
  const ledStoff = stoff({ color: "#ffffff", roughness: 0.2, transmission: 0.25, emissive: FARBEN.notruf, emissiveIntensity: 0 });
  {
    const form = rundRechteck(114, 54, 12);
    const loch = new THREE.Path(); loch.absarc(0, 0, 9.2, 0, Math.PI * 2, true); form.holes.push(loch);
    const led = new THREE.Path(); led.absarc(38, -14, 2.6, 0, Math.PI * 2, true); form.holes.push(led);
    deckel.add(netz(platte(form, 4, 23.2, 1.4), stoff(ORANGE)));
    const kappe = netz(new THREE.SphereGeometry(2.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), ledStoff);
    kappe.position.set(38, 26.6, 14); deckel.add(kappe);
    const schrift = textur(512, 128, (g) => {
      g.clearRect(0, 0, 512, 128);
      g.fillStyle = "#ffffff"; g.font = "650 92px 'Funnel Display', system-ui, sans-serif"; g.textBaseline = "middle"; g.fillText("SkiTag", 8, 68);
    });
    const marke = new THREE.Mesh(new THREE.PlaneGeometry(24, 6), new THREE.MeshBasicMaterial({ color: "#b8390a", alphaMap: schrift, transparent: true, opacity: 0.55, depthWrite: false }));
    marke.rotation.x = -Math.PI / 2; marke.position.set(-38, 27.22, 16);
    deckel.add(marke);
  }

  // 1 · Knopf mit weichem Kragen
  const knopf = teil("knopf", "Knopf und Kragen", { stage: 0, explode: [0, 92, 0] });
  {
    const kragen = new THREE.LatheGeometry([[9, 0], [15, 0], [15.6, 0.8], [15, 2.6], [12.5, 3.6], [9.6, 3.4], [9, 2.4]].map(([r, y]) => new THREE.Vector2(r, y)), 72);
    kragen.translate(0, 27.2, 0);
    knopf.add(netz(kragen, stoff(TPU)));
    const kappe = new THREE.LatheGeometry([[0.01, 5.6], [4, 5.9], [6.8, 5.6], [8.1, 4.4], [8.4, 0], [8.2, -3]].map(([r, y]) => new THREE.Vector2(r, y)), 72);
    kappe.translate(0, 27.2, 0);
    knopf.add(netz(kappe, stoff(KNOPF)));
  }

  return { chip, teile, ledStoff };
}
