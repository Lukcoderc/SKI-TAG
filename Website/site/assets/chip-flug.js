/* SkiTag · Chip-Seite: der Chip fliegt in 3D hinunter (Runde nach Feedback 151, statt der Ladestation).
   Das echte Modell (Maxis „fertig4“, assets/media/chip-3d.bin, wie früher auf der Startseite) liegt auf einer festen,
   durchsichtigen Leinwand über der Seite. Oben schwebt es im Einstieg und dreht sich langsam. Beim Scrollen fliegt es
   (an das Scrollen gebunden, vor und zurück) hinunter auf den Platz des Chips in „Probiere den Tag aus“: eine ganze
   Drehung um die Hochachse, dabei eine Rolle, kommt in der Mitte nah an die Kamera und landet genau in der Pose des
   Renderbilds dort. Am Ende blendet es in das Renderbild über (--kn-da), das Foto dahinter wird weich (--unscharf).
   Eine Welteinheit ist ein CSS-Pixel auf der Ebene z = 0. Ohne WebGL oder bei weniger Bewegung bleibt alles still. */
import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";

const wurzel = document.documentElement;
const start = document.querySelector(".chip-flug-start");
const akt = document.getElementById("der-chip");
const ziel = akt && akt.querySelector(".knopf__chip");
const bild = akt && akt.querySelector(".knopf__bild");

const aufgeben = () => { wurzel.classList.remove("chipflug", "chipflug-an"); if (akt) akt.style.setProperty("--kn-da", "1"); };

const los = async () => {
  if (!start || !ziel || !bild || !wurzel.classList.contains("chipflug")) return aufgeben();
  const handy = matchMedia("(max-width: 860px)").matches;

  const leinwand = document.createElement("canvas");
  leinwand.className = "chip-flug-leinwand";
  leinwand.setAttribute("aria-hidden", "true");
  document.body.appendChild(leinwand);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { leinwand.remove(); return aufgeben(); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, handy ? 2 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const szene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  szene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  const licht = new THREE.DirectionalLight(0xffffff, 1.6); licht.position.set(-0.5, 1, 1.2); szene.add(licht);
  const kante = new THREE.DirectionalLight(0xffd2b8, 1.1); kante.position.set(1, -0.2, -0.6); szene.add(kante);

  const FOV = 30;
  const kamera = new THREE.PerspectiveCamera(FOV, 1, 50, 20000);

  /* Modell (Aufbau wie in chip-3d.js) */
  const TEILE = [
    ["rueckschale", 5042, 17046, "schwarz"], ["schrauben", 2530, 9468, "metall"], ["vorderschale", 4146, 14070, "schwarz"],
    ["rand", 2297, 9438, "orange"], ["ring", 1536, 9216, "orange"], ["kappe", 2592, 12948, "knopf"], ["ledstab", 136, 492, "led"],
  ];
  const SCHRITT = 0.0025, GROESSE = [66, 46, 18];
  let daten;
  try { daten = await fetch("assets/media/chip-3d.bin?v=2").then((r) => { if (!r.ok) throw new Error("Modell fehlt"); return r.arrayBuffer(); }); }
  catch (e) { leinwand.remove(); return aufgeben(); }
  const MAT = {
    schwarz: new THREE.MeshPhysicalMaterial({ color: 0x1c1f24, roughness: 0.38, clearcoat: handy ? 0 : 0.5, clearcoatRoughness: 0.22, envMapIntensity: 1.25 }),
    orange: new THREE.MeshPhysicalMaterial({ color: 0xe44e10, roughness: 0.5, clearcoat: handy ? 0 : 0.18, clearcoatRoughness: 0.4, envMapIntensity: 1.1 }),
    knopf: new THREE.MeshPhysicalMaterial({ color: 0x24262b, roughness: 0.55, clearcoat: handy ? 0 : 0.25, clearcoatRoughness: 0.5, envMapIntensity: 1.1 }),
    metall: new THREE.MeshStandardMaterial({ color: 0x9a9da2, roughness: 0.3, metalness: 0.9 }),
    led: new THREE.MeshStandardMaterial({ color: 0x9dffa0, emissive: 0x2fd66a, emissiveIntensity: 0.6, roughness: 0.15 }),
  };
  const chip = new THREE.Group(), lage = new THREE.Group(), modell = new THREE.Group(), inhalt = new THREE.Group();
  modell.rotation.z = Math.PI / 2;    // hochkant, Vorderseite zur Kamera
  inhalt.position.set(-GROESSE[0] / 2, -GROESSE[1] / 2, -GROESSE[2] / 2);
  chip.add(lage); lage.add(modell); modell.add(inhalt); szene.add(chip);
  let ofs = 0;
  for (const [, ecken, indizes, mat] of TEILE) {
    const p16 = new Int16Array(daten, ofs, ecken * 3); ofs += Math.ceil(ecken * 6 / 4) * 4;
    const n8 = new Int8Array(daten, ofs, ecken * 3); ofs += Math.ceil(ecken * 3 / 4) * 4;
    const ix = new Uint16Array(daten, ofs, indizes); ofs += Math.ceil(indizes * 2 / 4) * 4;
    const pos = new Float32Array(ecken * 3), nor = new Float32Array(ecken * 3);
    for (let i = 0; i < ecken * 3; i++) { pos[i] = p16[i] * SCHRITT; nor[i] = n8[i] / 127; }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setIndex(new THREE.BufferAttribute(ix, 1));
    inhalt.add(new THREE.Mesh(g, MAT[mat]));
  }
  const HOCH = GROESSE[0];   // Höhe des stehenden Chips in Modell-mm

  /* Maße */
  const klemme = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const weich = (x) => x * x * (3 - 2 * x);
  const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const mix = (a, b, t) => a + (b - a) * t;
  let vw = 0, vh = 0, m = null;
  const messen = () => {
    vw = innerWidth; vh = innerHeight;
    renderer.setSize(vw, vh, false);
    kamera.aspect = vw / vh;
    kamera.position.set(0, 0, (vh / 2) / Math.tan((FOV / 2) * Math.PI / 180));
    kamera.updateProjectionMatrix();
    const y = scrollY, a = start.getBoundingClientRect(), z = ziel.getBoundingClientRect(), b = bild.getBoundingClientRect();
    m = {
      ax: a.left + a.width / 2, ay: a.top + y + a.height / 2, ah: a.height * 0.86,
      zx: z.left + z.width / 2, zy: z.top + y + z.height / 2, zh: z.height * 0.95,
      ende: Math.max(320, b.top + y - Math.max(70, (vh - b.height) / 2)),
    };
  };

  let zeit0 = performance.now(), laeuft = false, sichtbar = true, f = 0;
  const zeichnen = (jetzt) => {
    if (!m) messen();
    const y = scrollY;
    f = klemme(y / m.ende);
    const fl = klemme(f / 0.84);                  // der Flug ist bei 84 % fertig, danach sitzt der Chip genau auf dem Ziel
    const g = inOut(fl);
    const t = (jetzt - zeit0) / 1000;
    const ruhe = 1 - weich(klemme(f / 0.12));     // Schweben nur oben
    // Weg in Bildschirmkoordinaten: waagrecht weich, senkrecht im Bogen (holt erst leicht aus)
    const sx = mix(m.ax, m.zx, g);
    const sy = mix(m.ay, m.zy, mix(fl, g, 0.35)) - y - Math.sin(fl * Math.PI) * vh * 0.08 + Math.sin(t * 1.3) * 6 * ruhe;
    const h = mix(m.ah, m.zh, g);
    const nah = Math.sin(fl * Math.PI);            // in der Mitte nah an die Kamera
    chip.position.set(sx - vw / 2, vh / 2 - sy, nah * vh * 0.4);
    chip.scale.setScalar(h / HOCH);
    // Drehung: oben langsames Pendeln, im Flug eine ganze Drehung und eine Rolle, landet frontal
    lage.rotation.set(
      Math.sin(t * 0.9) * 0.12 * ruhe + nah * 0.55,
      (Math.sin(t * 0.6) * 0.5 - 0.35) * ruhe + g * Math.PI * 2,
      Math.sin(fl * Math.PI * 2) * -0.35 + 0.06 * ruhe
    );
    renderer.render(szene, kamera);
    const da = klemme((f - 0.86) / 0.12);
    leinwand.style.opacity = (1 - da).toFixed(3);
    akt.style.setProperty("--kn-da", da.toFixed(3));
    bild.style.setProperty("--unscharf", weich(klemme((f - 0.72) / 0.26)).toFixed(3));
  };
  const schleife = (jetzt) => {
    zeichnen(jetzt);
    // weiter, solange oben geschwebt wird; sonst nur auf Scrollen
    if (sichtbar && f < 0.12) requestAnimationFrame(schleife); else laeuft = false;
  };
  const anstossen = () => { if (!laeuft) { laeuft = true; requestAnimationFrame(schleife); } };
  addEventListener("scroll", () => {
    sichtbar = scrollY < (m ? m.ende : 9e9) + vh;
    leinwand.style.visibility = scrollY > (m ? m.ende : 9e9) + 40 ? "hidden" : "visible";
    anstossen();
  }, { passive: true });
  addEventListener("resize", () => { m = null; anstossen(); });
  addEventListener("load", () => { m = null; anstossen(); });
  messen();
  wurzel.classList.add("chipflug-an");
  anstossen();
};

los().catch(() => aufgeben());
