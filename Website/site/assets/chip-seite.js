/* SkiTag · Seite „Der Chip“ (Feedback 91 und 92), nur auf chip.html geladen.
   Innenleben: das 3D-Modell des fertigen Chips zieht sich entlang seiner Dicke auseinander. Außenteile aus
   assets/media/chip-3d.bin (wie auf der Startseite), Innenteile aus assets/media/chip-innen.bin (Hardware-Modell
   „Fertiger Chip“, dort als noch nicht maßgenau geführt; hier nur als Schichten gezeigt, ohne Maße).
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

const wurzel = document.documentElement;
const akt = document.getElementById("innenleben");
const bildEl = akt && akt.querySelector(".innen__bild");
const leinwand = akt && akt.querySelector(".innen__gl");
const zeiger = akt && akt.querySelector(".innen__zeiger");
const marken = akt ? Array.from(akt.querySelectorAll(".innen__marken li")) : [];
const ohneBewegung = matchMedia("(prefers-reduced-motion: reduce)").matches;
const handy = matchMedia("(pointer: coarse)").matches || innerWidth < 700;
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
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, handy ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);

  const szene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  szene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  szene.environmentIntensity = 0.85;
  const FOV = 24;
  const kamera = new THREE.PerspectiveCamera(FOV, 1, 10, 2000);
  const licht = new THREE.DirectionalLight(0xffffff, 1.7); licht.position.set(60, 140, 120);
  const kante = new THREE.DirectionalLight(0x8fb4ff, 2.2); kante.position.set(-120, 40, -140);   // kaltes Randlicht von hinten
  const warm = new THREE.DirectionalLight(0xffc7a6, 0.8); warm.position.set(-140, -20, 80);
  szene.add(licht, kante, warm, new THREE.HemisphereLight(0xffffff, 0x38466e, 0.45));

  /* ---------------------------------------------------------- Modell -- */
  // [Name, Ecken, Indizes, Material, Versatz entlang der Dicke in mm (offen)]
  const AUSSEN = [
    ["rueckschale", 5028, 16158, "schwarz", -40], ["schrauben", 2689, 9474, "metall", -53], ["vorderschale", 4043, 13542, "schwarz", 38],
    ["rand", 2304, 9252, "orange", 24], ["ring", 1536, 9216, "orange", 50], ["kappe", 1440, 6420, "knopf", 57], ["ledstab", 248, 840, "led", 38],   // der Lichtleiter der LED bleibt in der Vorderschale sitzen (Feedback 95: schwebte sonst als loser Winkel darüber)
  ];
  const INNEN = [
    ["qi_spule", 576, 1728, "kupfer", -26], ["qi_ferrit", 384, 1140, "ferrit", -23.5], ["akku", 208, 612, "akku", -12],
    ["platine", 608, 1764, "platine", 2], ["klein", 120, 180, "bauteil", 2], ["l76k", 24, 36, "schirm", 2], ["patch", 24, 36, "keramik", 2],
    ["patch_oben", 24, 36, "silber", 2.06], ["rak3172", 24, 36, "schirm", 2], ["lora_antenne", 24, 36, "keramik", 2],
    ["motor", 192, 564, "silber", 2], ["taster", 24, 36, "bauteil", 2], ["led_smd", 24, 36, "keramik", 2],
  ];
  // Namen in der Reihenfolge der Liste im HTML: [Teil, Punkt im Modell (mm), an dem die Linie ansetzt]
  const ANSATZ = [
    ["kappe", 27.3, 18.75, 17.6],      // Knopf: Mitte der Kappe
    ["ledstab", 40.8, 21.6, 17.0],     // LED: Lichtpunkt in der Vorderschale
    ["rand", 48, 0.6, 8.5],            // Hülle: vordere Seite des weichen Rands
    ["platine", 44, 6.5, 8.6],         // Platine mit Sensoren: vordere Ecke der Platine
    ["akku", 38, 6.6, 4.7],            // Akku: vordere Kante
    ["qi_spule", 30, 7.5, 1.6],        // Laden: Ladespule
  ];
  const SCHRITT = 0.002, GROESSE = [54, 37.5, 17.8];
  const holen = (pfad) => fetch(pfad).then((r) => { if (!r.ok) throw new Error("Modell fehlt: " + pfad); return r.arrayBuffer(); });
  const [aussenDaten, innenDaten] = await Promise.all([holen("assets/media/chip-3d.bin"), holen("assets/media/chip-innen.bin")]);

  const struktur = (() => {   // feine Struktur wie gestrahlter Kunststoff
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"), d = x.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = 110 + Math.random() * 60; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  })();
  const Std = THREE.MeshStandardMaterial;
  const MAT = {
    schwarz: new Std({ color: 0x2a2d33, roughness: 0.55, bumpMap: struktur, bumpScale: 0.35 }),
    orange: new Std({ color: 0xf0561a, roughness: 0.6, bumpMap: struktur, bumpScale: 0.2 }),
    knopf: new Std({ color: 0x34373d, roughness: 0.32 }),
    metall: new Std({ color: 0xa4a8ae, roughness: 0.3, metalness: 0.9 }),
    led: new Std({ color: 0x9dffa0, emissive: 0x2fd66a, emissiveIntensity: 0.9, roughness: 0.15 }),
    kupfer: new Std({ color: 0xd98a4e, roughness: 0.35, metalness: 0.85 }),
    ferrit: new Std({ color: 0x3a3d45, roughness: 0.7 }),
    akku: new Std({ color: 0xc3cad6, roughness: 0.38, metalness: 0.75 }),
    platine: new Std({ color: 0x1f7a5c, roughness: 0.5, metalness: 0.1 }),
    bauteil: new Std({ color: 0x24272d, roughness: 0.5 }),
    schirm: new Std({ color: 0xc9cdd3, roughness: 0.28, metalness: 0.9 }),
    silber: new Std({ color: 0xd5d8dd, roughness: 0.3, metalness: 0.85 }),
    keramik: new Std({ color: 0xe9e2d2, roughness: 0.6 }),
  };

  const stapel = new THREE.Group();   // Dicke des Chips zeigt nach oben
  stapel.rotation.x = -Math.PI / 2;
  const inhalt = new THREE.Group();
  inhalt.position.set(-GROESSE[0] / 2, -GROESSE[1] / 2, -GROESSE[2] / 2);
  stapel.add(inhalt); szene.add(stapel);

  const teile = {}, alle = [];
  const bauen = (daten, liste, innen) => {
    let ofs = 0;
    for (const [name, ecken, indizes, mat, versatz] of liste) {
      const p16 = new Int16Array(daten, ofs, ecken * 3); ofs += Math.ceil(ecken * 6 / 4) * 4;
      const n8 = new Int8Array(daten, ofs, ecken * 3); ofs += Math.ceil(ecken * 3 / 4) * 4;
      const ix = new Uint16Array(daten, ofs, indizes); ofs += Math.ceil(indizes * 2 / 4) * 4;
      const pos = new Float32Array(ecken * 3), nor = new Float32Array(ecken * 3), uv = new Float32Array(ecken * 2);
      for (let i = 0; i < ecken * 3; i++) { pos[i] = p16[i] * SCHRITT; nor[i] = n8[i] / 127; }
      for (let i = 0; i < ecken; i++) {   // UVs je nach Flächenrichtung, damit die Struktur überall gleich groß ist
        const ax = Math.abs(nor[3 * i]), ay = Math.abs(nor[3 * i + 1]), az = Math.abs(nor[3 * i + 2]);
        const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2];
        const [u, v] = az >= ax && az >= ay ? [x, y] : ax >= ay ? [y, z] : [x, z];
        uv[2 * i] = u / 9; uv[2 * i + 1] = v / 9;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      g.setIndex(new THREE.BufferAttribute(ix, 1));
      const m = new THREE.Mesh(g, MAT[mat]);
      inhalt.add(m);
      const t = { name, m, versatz, innen };
      teile[name] = t; alle.push(t);
    }
  };
  bauen(aussenDaten, AUSSEN, false); bauen(innenDaten, INNEN, true);
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
  const kameraSetzen = (e, az, el, B, H) => {
    const unten = -GROESSE[2] / 2 + VERSATZ[0] * e, oben = GROESSE[2] / 2 + (VERSATZ[1] + 4) * e;
    const hoch = (oben - unten) * Math.cos(el) + 44 * Math.sin(el), breit = 54 * Math.abs(Math.cos(az)) + 37.5 * Math.abs(Math.sin(az));
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2)), o = weich(e);
    // halbe Breite des Stapels in px darf links nicht über den Rand und rechts nicht in die Namen reichen
    const namen = B < 500 ? 126 : 150;   // Platz für die Namen rechts in px
    const platz = Math.max(60, Math.min(B * (0.5 - SCHUB * o) - 8, B * (0.5 + SCHUB * o) - namen * o - 8));
    const d = Math.max((hoch / 2) * 1.14 / t, (breit / 2) * (H / 2) / (t * platz));
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
  const namenSetzen = (e, B, H) => {
    // Punkte an den Teilen
    let rechts = 0;
    ANSATZ.forEach(([name, x, y, z], i) => {
      teile[name].m.localToWorld(punkt.set(x, y, z)); punkt.project(kamera);
      orte[i].x = (punkt.x * 0.5 + 0.5) * B; orte[i].y = (-punkt.y * 0.5 + 0.5) * H;
      if (orte[i].x > rechts) rechts = orte[i].x;
    });
    // rechte Kante des Stapels: vordere Ecke des Rands; die Namen stehen in einer Spalte daneben, gleichmäßig von
    // der Höhe des Knopfs bis zur Rückschale verteilt (gleiche Reihenfolge wie die Teile von oben nach unten)
    teile.rand.m.localToWorld(punkt.set(54, 0, 8.5)); punkt.project(kamera);
    rechts = Math.max(rechts, (punkt.x * 0.5 + 0.5) * B);
    teile.rueckschale.m.localToWorld(punkt.set(40, 2, 2)); punkt.project(kamera);
    const yUnten = (-punkt.y * 0.5 + 0.5) * H, yOben = orte[0].y;
    const spalte = Math.min(rechts + (B < 500 ? 30 : 64), B - (B < 500 ? 94 : 110));
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
