/* SkiTag · der fertige Chip in 3D (seit Feedback 63), nur auf der Startseite.
   Modell: „Fertiger Chip“ aus dem Hardware-Repo (ma-xi.github.io/SKI-TAG-Hardware/3d.html), nur die sichtbaren Außenteile; die Teile innen
   sind laut Hardware noch nicht genau und fehlen darum. assets/media/chip-3d.bin entsteht aus den STL-Dateien
   (Positionen Int16 in 0,002 mm, Normalen Int8, indiziert), die Reihenfolge steht unten in TEILE.

   Ablauf: eine feste, durchsichtige Leinwand über der Seite (pointer-events: none). Der Chip liegt in einem
   von drei Ankern und fliegt beim Scrollen zum nächsten:
     .held__chip  im Einstieg vor dem Bergfenster, schwebt und folgt leicht dem Zeiger
     .blick__chip in „Was ist SKITAG?“ (gepinnt): zeigt kurz drücken, drei Sekunden halten, Funk
     .knopf__chip in „Ein Knopf. Zwei Wege.“: dort bleibt er, der Knopf der Vorführung (seite.js) steuert ihn
   Eine Welteinheit ist ein CSS-Pixel auf der Ebene z = 0, darum lassen sich Anker direkt übernehmen.
   Ohne WebGL oder bei einem Fehler bleibt das Standbild in den Ankern (.chip-bild). */
import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";

const wurzel = document.documentElement;
const ohneBewegung = matchMedia("(prefers-reduced-motion: reduce)").matches;
const anker = { held: document.querySelector(".held__chip"), blick: document.querySelector(".blick__chip"), knopf: document.querySelector(".knopf__chip") };
const blickAkt = document.getElementById("blick"), knopfAkt = document.getElementById("der-chip");
const klemme = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const abschnitt = (x, a, b) => klemme((x - a) / (b - a));
const weich = (x) => x * x * (3 - 2 * x);
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mix = (a, b, t) => a + (b - a) * t;

/* Zustand für den Knopf der Vorführung; seite.js schreibt hinein und hängt druecken/loslassen an */
const knopfZustand = (window.skitagChip = window.skitagChip || { zustand: "ruhe", ring: 0, gruppe: 0, hilfe: 0 });

if (anker.held && anker.blick && anker.knopf) start().catch((f) => { console.warn("Chip 3D:", f); wurzel.classList.remove("chip3d-an"); });

async function start() {
  /* ------------------------------------------------------------ Bühne -- */
  const leinwand = document.createElement("canvas");
  leinwand.className = "chip3d";
  leinwand.setAttribute("aria-hidden", "true");
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (f) { return; }
  const sparsam = wurzel.classList.contains("sparsam");
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, sparsam ? 1.25 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);

  const szene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  szene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const FOV = 22;
  const kamera = new THREE.PerspectiveCamera(FOV, 1, 50, 20000);
  const licht = new THREE.DirectionalLight(0xffffff, 1.5);
  licht.position.set(0.5, 0.9, 1).multiplyScalar(4000);
  const kante = new THREE.DirectionalLight(0xffe2d0, 0.9);   // warmes Kantenlicht von hinten links
  kante.position.set(-1, 0.4, -0.6).multiplyScalar(4000);
  szene.add(licht, kante, new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.35));

  /* ---------------------------------------------------------- Modell -- */
  const TEILE = [
    ["rueckschale", 5028, 16158, "schwarz"], ["schrauben", 2689, 9474, "metall"], ["vorderschale", 4043, 13542, "schwarz"],
    ["rand", 2304, 9252, "orange"], ["ring", 1536, 9216, "orange"], ["kappe", 1440, 6420, "knopf"], ["ledstab", 248, 840, "led"],
  ];
  const SCHRITT = 0.002, GROESSE = [54, 37.5, 17.8];
  const daten = await fetch("assets/media/chip-3d.bin").then((r) => { if (!r.ok) throw new Error("Modell fehlt"); return r.arrayBuffer(); });

  // feine Struktur wie gestrahlter Kunststoff
  const struktur = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"), d = x.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = 110 + Math.random() * 60; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  })();
  const ledMat = new THREE.MeshPhysicalMaterial({ color: 0x9dffa0, emissive: 0x2fd66a, emissiveIntensity: 0.25, roughness: 0.15, transmission: 0.2 });
  const MAT = {
    schwarz: new THREE.MeshPhysicalMaterial({ color: 0x1d1f23, roughness: 0.58, clearcoat: 0.12, clearcoatRoughness: 0.5, bumpMap: struktur, bumpScale: 0.35 }),
    orange: new THREE.MeshPhysicalMaterial({ color: 0xf0561a, roughness: 0.62, sheen: 0.6, sheenColor: 0xffb08a, sheenRoughness: 0.6, clearcoat: 0.1, bumpMap: struktur, bumpScale: 0.2 }),
    knopf: new THREE.MeshPhysicalMaterial({ color: 0x2a2c31, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    metall: new THREE.MeshStandardMaterial({ color: 0x9a9da2, roughness: 0.3, metalness: 0.9 }),
    led: ledMat,
  };

  const chip = new THREE.Group();          // Lage und Größe auf der Seite
  const lage = new THREE.Group();          // Drehung (Pose, Flug, Zittern)
  const modell = new THREE.Group();        // hochkant: Höhe nach oben, Vorderseite zur Kamera
  modell.rotation.z = Math.PI / 2;
  const inhalt = new THREE.Group();
  inhalt.position.set(-GROESSE[0] / 2, -GROESSE[1] / 2, -GROESSE[2] / 2);
  chip.add(lage); lage.add(modell); modell.add(inhalt);
  szene.add(chip);

  let ofs = 0;
  const teile = {};
  for (const [name, ecken, indizes, mat] of TEILE) {
    const p16 = new Int16Array(daten, ofs, ecken * 3); ofs += Math.ceil(ecken * 6 / 4) * 4;
    const n8 = new Int8Array(daten, ofs, ecken * 3); ofs += Math.ceil(ecken * 3 / 4) * 4;
    const ix = new Uint16Array(daten, ofs, indizes); ofs += Math.ceil(indizes * 2 / 4) * 4;
    const pos = new Float32Array(ecken * 3), nor = new Float32Array(ecken * 3), uv = new Float32Array(ecken * 2);
    for (let i = 0; i < ecken * 3; i++) { pos[i] = p16[i] * SCHRITT; nor[i] = n8[i] / 127; }
    // UVs je nach Flächenrichtung, damit die Struktur überall gleich groß ist
    for (let i = 0; i < ecken; i++) {
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
    g.computeBoundingBox();
    const m = new THREE.Mesh(g, MAT[mat]);
    teile[name] = m; inhalt.add(m);
  }

  // Knopf: Mitte und Größe aus dem Ring, damit Druck und Füllring genau sitzen
  const rb = teile.ring.geometry.boundingBox, kb = teile.kappe.geometry.boundingBox;
  const knopfMitte = new THREE.Vector3((rb.min.x + rb.max.x) / 2, (rb.min.y + rb.max.y) / 2, Math.max(rb.max.z, kb.max.z) + 0.25);
  const knopfR = Math.max(rb.max.x - rb.min.x, rb.max.y - rb.min.y) / 2;
  // Füllring um den Knopf (für das Halten): Ring aus Segmenten, gezeichnet wird ein Anteil davon
  const SEG = 120;
  const ringGeo = new THREE.RingGeometry(knopfR + 0.9, knopfR + 2.3, SEG, 1, 0, -Math.PI * 2);   // Winkel 0 zeigt im hochkant gedrehten Modell nach oben, negativ läuft im Uhrzeigersinn
  // RingGeometry liegt in Segmenten hintereinander: 6 Indizes je Segment
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff5a1c, transparent: true, toneMapped: false, depthTest: false, side: THREE.DoubleSide });
  const fuellRing = new THREE.Mesh(ringGeo, ringMat);
  const ringGrund = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false, depthTest: false, side: THREE.DoubleSide }));
  // die Ringe liegen in der Ebene des Knopfs, nur ohne die Drehung des Modells
  fuellRing.position.copy(knopfMitte); ringGrund.position.copy(knopfMitte);
  fuellRing.renderOrder = 3; ringGrund.renderOrder = 2;
  inhalt.add(ringGrund, fuellRing);

  // Leuchten der LED: ein weicher Punkt vor dem Lichtleiter
  const lb = teile.ledstab.geometry.boundingBox;
  const glanz = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const ledGlanz = new THREE.Sprite(new THREE.SpriteMaterial({ map: glanz, color: 0x45ff7a, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  // Mitte der vordersten Fläche des Lichtleiters (dort sieht man den Lichtpunkt)
  {
    const p = teile.ledstab.geometry.attributes.position; let sx = 0, sy = 0, n = 0;
    for (let i = 0; i < p.count; i++) if (p.getZ(i) > lb.max.z - 0.3) { sx += p.getX(i); sy += p.getY(i); n++; }
    ledGlanz.position.set(n ? sx / n : (lb.min.x + lb.max.x) / 2, n ? sy / n : (lb.min.y + lb.max.y) / 2, lb.max.z + 0.1);
  }
  ledGlanz.scale.setScalar(12); ledGlanz.renderOrder = 4;
  inhalt.add(ledGlanz);

  // weicher Schatten unter dem Chip (flache Ellipse, dreht nicht mit)
  const schattenTex = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 64;
    const x = c.getContext("2d"); x.translate(128, 32); x.scale(1, 0.25);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, 128);
    g.addColorStop(0, "rgba(14,22,40,.55)"); g.addColorStop(0.5, "rgba(14,22,40,.2)"); g.addColorStop(1, "rgba(14,22,40,0)");
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, 128, 0, Math.PI * 2); x.fill();
    return new THREE.CanvasTexture(c);
  })();
  const schatten = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.25), new THREE.MeshBasicMaterial({ map: schattenTex, transparent: true, depthWrite: false, toneMapped: false }));
  schatten.renderOrder = -1;
  szene.add(schatten);

  /* ------------------------------------------------------- Größe -- */
  let B = 1, H = 1;
  const groesse = () => {
    // ohne Bildlaufleiste, damit die Leinwand genau über dem Inhalt liegt
    B = document.documentElement.clientWidth || innerWidth; H = innerHeight;
    renderer.setSize(B, H, false);
    leinwand.style.width = B + "px"; leinwand.style.height = H + "px";
    kamera.aspect = B / H;
    kamera.position.set(0, 0, (H / 2) / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    kamera.near = kamera.position.z * 0.2; kamera.far = kamera.position.z * 3;
    kamera.updateProjectionMatrix();
    bedarf = true;
  };
  let bedarf = true;
  addEventListener("resize", groesse);
  groesse();
  document.body.appendChild(leinwand);
  wurzel.classList.add("chip3d-an");

  /* ------------------------------------------------------- Posen -- */
  const E = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "YXZ"));
  const POSE = {
    held: E(0.16, -0.55, 0.1),
    gruppe: E(0.12, -0.28, 0.04),
    halten: E(0.06, -0.08, 0),
    funk: E(0.18, 0.62, -0.05),
    knopf: E(0.1, -0.32, 0.05),
  };
  const ziel = new THREE.Quaternion().copy(POSE.held), jetztQ = new THREE.Quaternion().copy(POSE.held);
  const tmpQ = new THREE.Quaternion(), dreh = new THREE.Quaternion(), achseY = new THREE.Vector3(0, 1, 0), achseX = new THREE.Vector3(1, 0, 0), achseZ = new THREE.Vector3(0, 0, 1);

  // Zeiger im Einstieg: der Chip neigt sich leicht dorthin
  let zx = 0, zy = 0, zxS = 0, zyS = 0;
  addEventListener("pointermove", (e) => { zx = e.clientX / B - 0.5; zy = e.clientY / H - 0.5; }, { passive: true });

  const mitte = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, w: r.width }; };

  /* ---------------------------------------------- Zustände der Teile -- */
  const effekt = { druck: 0, zittern: 0, ring: 0, ringFarbe: 0xff5a1c, led: 0.15, ledFarbe: 0x45ff7a };
  const effektS = { druck: 0, ring: 0, led: 0.15 };
  const ledFarbe = new THREE.Color(), ledZiel = new THREE.Color();
  let schrittBlick = -1, sichtbar = true, eingang = ohneBewegung ? 1 : 0, startZeit = performance.now();

  /* Im Abschnitt „Was ist SKITAG?“: welcher Schritt und wie weit */
  const blickSchritt = (p) => (p < 0.34 ? 0 : p < 0.67 ? 1 : 2);

  const zeit = { letzte: performance.now() };
  const bild = (jetzt) => {
    requestAnimationFrame(bild);
    const dt = Math.min(0.05, (jetzt - zeit.letzte) / 1000); zeit.letzte = jetzt;
    const s = scrollY;

    // Abschnitte in Seiten-Koordinaten
    const br = blickAkt.getBoundingClientRect(), kr = knopfAkt.getBoundingClientRect();
    const blickOben = br.top + s, blickEnde = blickOben + br.height - H, knopfOben = kr.top + s;
    const pBlick = klemme((s - blickOben) / Math.max(1, br.height - H));
    const a1 = Math.max(0, blickOben - H * 0.95), t1 = abschnitt(s, a1, blickOben);
    const t2 = abschnitt(s, blickEnde, knopfOben);

    const A = mitte(anker.held), Bk = mitte(anker.blick), K = mitte(anker.knopf);
    let x, y, h, spin = 0, kipp = 0, flug = 0, tSnap = 1;
    if (t2 > 0) {
      const e = ohneBewegung ? (t2 < 0.5 ? 0 : 1) : inOut(t2);
      x = mix(Bk.x, K.x, e); y = mix(Bk.y, K.y, e); h = mix(Bk.h, K.h, e);
      if (!ohneBewegung) { x += Math.sin(Math.PI * e) * Math.min(B * 0.06, 90) * (Bk.x < K.x ? -1 : 1); spin = -Math.PI * 2 * e; kipp = Math.sin(Math.PI * e) * 0.5; }
      flug = Math.sin(Math.PI * t2); tSnap = Math.abs(1 - 2 * t2);
    } else {
      const e = ohneBewegung ? (t1 < 0.5 ? 0 : 1) : inOut(t1);
      x = mix(A.x, Bk.x, e); y = mix(A.y, Bk.y, e); h = mix(A.h, Bk.h, e);
      if (!ohneBewegung && t1 > 0 && t1 < 1) { y -= Math.sin(Math.PI * e) * Math.min(H * 0.12, 120); spin = Math.PI * 2 * e; kipp = -Math.sin(Math.PI * e) * 0.35; }
      flug = t1 > 0 && t1 < 1 ? Math.sin(Math.PI * t1) : 0; tSnap = t1 > 0 ? Math.abs(1 - 2 * t1) : 1;
    }

    // Pose je nach Ort
    const imKnopf = t2 > 0.5, imBlick = !imKnopf && t1 > 0.5;
    const sb = blickSchritt(pBlick);
    if (imBlick && sb !== schrittBlick) { schrittBlick = sb; blickAkt.setAttribute("data-schritt", String(sb)); }
    ziel.copy(imKnopf ? POSE.knopf : imBlick ? [POSE.gruppe, POSE.halten, POSE.funk][sb] : POSE.held);
    jetztQ.slerp(ziel, ohneBewegung ? 1 : 1 - Math.pow(0.0025, dt));

    // Wirkung auf Knopf, LED und Ring
    effekt.druck = 0; effekt.zittern = 0; effekt.ring = 0; effekt.led = 0.15; effekt.ledFarbe = 0x45ff7a; effekt.ringFarbe = 0xff5a1c;
    const t = jetzt / 1000;
    if (imKnopf) {
      const z = knopfZustand.zustand;
      if (z === "halten") { effekt.druck = 1; effekt.ring = knopfZustand.ring; }
      else if (z === "frist") { effekt.ring = knopfZustand.ring; effekt.ringFarbe = 0xff2d2d; effekt.ledFarbe = 0xff2d2d; effekt.led = Math.sin(t * 14) > 0 ? 1 : 0.1; }
      else if (z === "gruppe") { const g = knopfZustand.gruppe; effekt.druck = g < 0.12 ? 1 : 0; effekt.zittern = g > 0.15 && g < 0.75 ? 1 : 0; effekt.led = g < 0.85 ? (Math.sin(t * 18) > 0 ? 1 : 0.2) : 0.15; }
      else if (z === "lauf") { const hh = knopfZustand.hilfe; effekt.ledFarbe = 0xff2d2d; effekt.led = 0.65 + 0.35 * Math.sin(t * 6); effekt.zittern = (hh > 0.16 && hh < 0.2) || (hh > 0.22 && hh < 0.26) ? 1 : 0; }
      else if (z === "fertig") { effekt.led = 0.8; }
      else { effekt.led = 0.15 + 0.12 * (0.5 + 0.5 * Math.sin(t * 2)); }
    } else if (imBlick) {
      const innen = sb === 0 ? pBlick / 0.34 : sb === 1 ? (pBlick - 0.34) / 0.33 : (pBlick - 0.67) / 0.33;
      if (sb === 0) {   // kurz drücken: alle 2,4 s ein Druck, danach vibrieren die Chips der Gruppe
        const z = (t % 2.4) / 2.4;
        effekt.druck = z < 0.08 ? 1 : 0; effekt.zittern = z > 0.1 && z < 0.4 ? 1 : 0;
        effekt.led = z < 0.5 ? (Math.sin(t * 18) > 0 ? 1 : 0.2) : 0.15;
      } else if (sb === 1) {   // drei Sekunden halten: der Ring füllt sich mit dem Scrollen
        const r = abschnitt(innen, 0.05, 0.75);
        effekt.druck = r < 1 ? 1 : 0; effekt.ring = r; effekt.ringFarbe = r < 1 ? 0xff5a1c : 0xff2d2d;
        effekt.ledFarbe = 0xff2d2d; effekt.led = r < 1 ? 0.25 : 0.7 + 0.3 * Math.sin(t * 8);
        blickAkt.style.setProperty("--halten", r.toFixed(3));
        const sek = String(Math.min(3, Math.max(1, Math.ceil(r * 3))));
        if (blickAkt.dataset.sek !== sek) blickAkt.dataset.sek = sek;
        blickAkt.toggleAttribute("data-voll", r >= 1);
      } else {   // Funk: rote LED ruhig, der Chip hat sich zur Liftstation gedreht
        effekt.ledFarbe = 0xff2d2d; effekt.led = 0.55 + 0.25 * Math.sin(t * 4);
      }
    }
    const k = ohneBewegung ? 1 : 1 - Math.pow(0.0001, dt);
    effektS.druck = mix(effektS.druck, effekt.druck, k);
    effektS.ring = effekt.ring < effektS.ring - 0.02 ? mix(effektS.ring, effekt.ring, ohneBewegung ? 1 : 1 - Math.pow(1e-9, dt)) : mix(effektS.ring, effekt.ring, ohneBewegung ? 1 : 1 - Math.pow(0.00001, dt));   // leert sich schnell, füllt sich weich
    effektS.led = mix(effektS.led, effekt.led, k);

    // Eingang beim Laden: schwebt von unten ins Bild
    if (eingang < 1) eingang = klemme((jetzt - startZeit) / 1400);
    const ein = 1 - Math.pow(1 - eingang, 3);

    // Schweben und Zeiger nur, solange der Chip im Einstieg ist
    const ruhig = 1 - klemme(t1 * 3);
    zxS = mix(zxS, zx, 0.06); zyS = mix(zyS, zy, 0.06);
    const schweben = ohneBewegung ? 0 : Math.sin(t * 1.3) * 0.012 * h * (0.35 + 0.65 * ruhig);

    // zusammensetzen
    const skala = (h / GROESSE[0]) * (0.86 + 0.14 * ein);
    chip.position.set(x - B / 2, H / 2 - y + schweben - (1 - ein) * h * 0.25, flug * h * 0.6);
    chip.scale.setScalar(skala);
    lage.quaternion.copy(jetztQ);
    if (spin) { dreh.setFromAxisAngle(achseY, spin); lage.quaternion.premultiply(dreh); }
    if (kipp) { dreh.setFromAxisAngle(achseX, kipp); lage.quaternion.premultiply(dreh); }
    if (!ohneBewegung) {
      dreh.setFromEuler(new THREE.Euler(zyS * 0.35 * ruhig + Math.sin(t * 0.9) * 0.03, zxS * 0.6 * ruhig + Math.sin(t * 0.7) * 0.05 * ruhig, 0));
      lage.quaternion.multiply(dreh);
      if (effekt.zittern) { dreh.setFromAxisAngle(achseZ, Math.sin(t * 90) * 0.025); lage.quaternion.multiply(dreh); chip.position.x += Math.sin(t * 117) * h * 0.006; }
      if (ein < 1) { dreh.setFromAxisAngle(achseY, (1 - ein) * -1.2); lage.quaternion.multiply(dreh); }
    }
    leinwand.style.opacity = String(ohneBewegung ? tSnap : ein);

    // Knopf drücken (Modell: z ist die Dicke), Füllring, LED
    teile.kappe.position.z = -0.9 * effektS.druck;
    const anteil = effektS.ring;
    ringGeo.setDrawRange(0, Math.round(SEG * anteil) * 6);
    fuellRing.visible = anteil > 0.002;
    ringMat.color.setHex(effekt.ringFarbe);
    ringGrund.material.opacity = anteil > 0.002 || effekt.ring > 0 ? 0.35 : 0;
    ledZiel.setHex(effekt.ledFarbe); ledFarbe.lerp(ledZiel, 0.2);
    ledMat.emissive.copy(ledFarbe); ledMat.emissiveIntensity = 0.2 + effektS.led * 2.2;
    ledGlanz.material.color.copy(ledFarbe); ledGlanz.material.opacity = klemme(effektS.led * 1.1 - 0.15);

    // Schatten: liegt unter dem Chip, wird beim Fliegen größer und blasser
    schatten.position.set(chip.position.x, H / 2 - y - h * 0.6, -h * 0.4);
    schatten.scale.set(h * 1.2 * (1 + flug * 0.5), h * 1.2 * (1 + flug * 0.5), 1);
    schatten.material.opacity = (0.75 - flug * 0.6) * ein;

    // nur zeichnen, solange der Chip im Bild ist
    sichtbar = y + h > -h && y - h < H + h;
    leinwand.style.visibility = sichtbar ? "visible" : "hidden";
    if (sichtbar || bedarf) { renderer.render(szene, kamera); bedarf = false; }
  };
  requestAnimationFrame(bild);

  /* ----------------- Knopf am Chip selbst drücken (im Abschnitt Knopf) -- */
  const strahl = new THREE.Raycaster(), zeiger = new THREE.Vector2();
  const getroffen = (e) => {
    zeiger.set((e.clientX / B) * 2 - 1, -(e.clientY / H) * 2 + 1);
    strahl.setFromCamera(zeiger, kamera);
    return strahl.intersectObjects(Object.values(teile), false).length > 0;
  };
  let gedrueckt = false;
  anker.knopf.addEventListener("pointerdown", (e) => {
    if (!getroffen(e) || !knopfZustand.druecken) return;
    e.preventDefault(); gedrueckt = true;
    try { anker.knopf.setPointerCapture(e.pointerId); } catch (_) {}
    knopfZustand.druecken();
  });
  const los = () => { if (gedrueckt) { gedrueckt = false; knopfZustand.loslassen && knopfZustand.loslassen(); } };
  anker.knopf.addEventListener("pointerup", los);
  anker.knopf.addEventListener("pointercancel", los);
  anker.knopf.addEventListener("pointermove", (e) => { anker.knopf.style.cursor = getroffen(e) ? "pointer" : ""; });
  anker.knopf.addEventListener("contextmenu", (e) => e.preventDefault());
}
