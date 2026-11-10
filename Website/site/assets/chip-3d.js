/* SkiTag · der fertige Chip in 3D (Feedback 63 und 64), nur auf der Startseite.
   Modell: „Fertiger Chip“ aus dem Hardware-Repo (ma-xi.github.io/SKI-TAG-Hardware/3d.html), nur die sichtbaren
   Außenteile; die Teile innen sind laut Hardware noch nicht genau und fehlen darum. assets/media/chip-3d.bin
   entsteht aus den STL-Dateien (Positionen Int16 in 0,002 mm, Normalen Int8, indiziert), Reihenfolge in TEILE.

   Ablauf: eine feste, durchsichtige Leinwand über der Seite (pointer-events: none). Der Chip liegt in einem
   Anker (.chip-anker) und fliegt beim Scrollen zum nächsten:
     .held__chip   Einstieg: schwebt vor dem Wintertag, neigt sich zum Zeiger, um ihn fällt Schnee
     .blick__chip  „Was ist SKITAG?“ (gepinnt): kurz drücken (drei kleine Chips der Gruppe vibrieren),
                   drei Sekunden halten (Ring füllt sich), Funk zur Liftstation
     .knopf__chip  „Probiere den Tag aus“: Übersicht; im Ruhezustand fährt die Ansicht weiter nach
     .knopf__nah   ganz nah an den Knopf. Dann schneidet die Fläche (.knopf__bild) den Chip ab, und der
                   echte Knopf .chip-knopf wird in jedem Bild genau über den Knopf des Modells gelegt.
   Den Zustand (Schritt, Ring, Sekunde, Gruppe, Notruf) schreibt seite.js nach window.skitagChip.
   Eine Welteinheit ist ein CSS-Pixel auf der Ebene z = 0, darum lassen sich Anker direkt übernehmen.
   Ohne WebGL oder bei einem Fehler bleibt das Standbild in den Ankern (.chip-bild). */
import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";

const wurzel = document.documentElement;
const ohneBewegung = matchMedia("(prefers-reduced-motion: reduce)").matches;
const eins = (s) => document.querySelector(s), alle = (s) => Array.prototype.slice.call(document.querySelectorAll(s));
const anker = { held: eins(".held__chip"), blick: eins(".blick__chip"), knopf: eins(".knopf__chip"), nah: eins(".knopf__nah") };
const miniAnker = { blick: alle(".bk-mit .chip-anker"), knopf: alle(".kn-mit .chip-anker") };
const blickAkt = document.getElementById("blick"), knopfAkt = document.getElementById("der-chip");
const flaeche = eins(".knopf__bild"), knopfEl = eins(".chip-knopf");
const klemme = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const abschnitt = (x, a, b) => klemme((x - a) / (b - a));
const weich = (x) => x * x * (3 - 2 * x);
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const federnd = (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);   // schießt leicht über
const mix = (a, b, t) => a + (b - a) * t;

/* Zustand der Vorführung; seite.js schreibt hinein */
const S = (window.skitagChip = window.skitagChip || {});
if (!S.zustand) S.zustand = "ruhe";
if (!S.blick) S.blick = { schritt: 0, halten: 0, spielt: false, start: 0 };
const SCHLEIFE = 4200;   // „Gruppe rufen“ in „Was ist SKITAG?“, gleich lang wie die Animationen in seite.css
const ORANGE = 0xff5a1c, ROT = 0xff2d2d, GRUEN = 0x45ff7a;

if (anker.held && anker.blick && anker.knopf && anker.nah && flaeche) start().catch((f) => { console.warn("Chip 3D:", f); wurzel.classList.remove("chip3d-an"); });

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

  // Knopf: Mitte und Größe aus dem Ring, damit Druck, Füllring und der echte Knopf genau sitzen
  const rb = teile.ring.geometry.boundingBox, kb = teile.kappe.geometry.boundingBox;
  const knopfMitte = new THREE.Vector3((rb.min.x + rb.max.x) / 2, (rb.min.y + rb.max.y) / 2, Math.max(rb.max.z, kb.max.z) + 0.25);
  const knopfR = Math.max(rb.max.x - rb.min.x, rb.max.y - rb.min.y) / 2;
  const flach = (farbe, deckung) => new THREE.MeshBasicMaterial({ color: farbe, transparent: true, opacity: deckung, toneMapped: false, depthTest: false, side: THREE.DoubleSide });

  // Füllring um den Knopf (Halten). Er wird nicht aus Dreiecken gebaut, sondern auf einer Fläche im Shader
  // gerechnet: Kanten bleiben in jeder Größe scharf (Glättung über fwidth), der Bogen hat runde Enden, einen
  // Verlauf vom Anfang zur Spitze, einen hellen Punkt an der Spitze und einen weichen Schein. Darunter liegt
  // die blasse Spur, die voll gedeckt auch den Tastaturfokus zeigt. Winkel 0 zeigt im hochkant gedrehten
  // Modell nach oben, der Bogen läuft im Uhrzeigersinn. Die Farben sind sRGB-Werte, wie sie auf dem Bildschirm stehen.
  const RING_AUSSEN = knopfR + 6.5;   // halbe Kantenlänge der Fläche, lässt Platz für den Schein
  const flaecheVS = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const ringMat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    uniforms: {
      uAnteil: { value: 0 }, uSpur: { value: 0 }, uFokus: { value: 0 }, uDeckung: { value: 1 },
      uMitte: { value: (knopfR + 2.4) / RING_AUSSEN }, uHalb: { value: 0.62 / RING_AUSSEN },
      uA: { value: new THREE.Vector3(1, 0.62, 0.34) }, uB: { value: new THREE.Vector3(1, 0.35, 0.11) },
    },
    vertexShader: flaecheVS,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uAnteil, uSpur, uFokus, uDeckung, uMitte, uHalb;
      uniform vec3 uA, uB;
      vec4 ueber(vec4 o, vec4 u) { float a = o.a + u.a * (1.0 - o.a); return vec4((o.rgb * o.a + u.rgb * u.a * (1.0 - o.a)) / max(a, 0.0001), a); }
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        float aa = max(fwidth(r), 0.0001) * 1.1;
        float dKreis = abs(r - uMitte);
        float spur = 1.0 - smoothstep(uHalb - aa, uHalb + aa, dKreis);
        float w = atan(-p.y, p.x); if (w < 0.0) w += 6.2831853;
        float voll = step(0.999, uAnteil), an = step(0.002, uAnteil);
        float ende = clamp(uAnteil, 0.0, 1.0) * 6.2831853;
        vec2 kopf = vec2(cos(ende), -sin(ende)) * uMitte, anfang = vec2(uMitte, 0.0);
        float dKopf = length(p - kopf), dAnfang = length(p - anfang);
        bool imBogen = w <= ende || voll > 0.5;
        float d = imBogen ? dKreis : min(dKopf, dAnfang);
        float fuell = (1.0 - smoothstep(uHalb - aa, uHalb + aa, d)) * an;
        float schein = exp(-pow(max(d - uHalb, 0.0) / (uHalb * 2.8), 2.0)) * 0.27 * an;
        float lauf = imBogen ? clamp(w / max(ende, 0.001), 0.0, 1.0) : (dKopf < dAnfang ? 1.0 : 0.0);
        vec3 farbe = mix(uA, uB, lauf);
        float punkt = (1.0 - smoothstep(uHalb * 0.46 - aa, uHalb * 0.46 + aa, dKopf)) * an * (1.0 - voll);
        vec4 c = vec4(1.0, 1.0, 1.0, spur * max(uSpur, uFokus));
        c = ueber(vec4(farbe, schein), c);
        c = ueber(vec4(mix(farbe, vec3(1.0), punkt * 0.92), fuell), c);
        gl_FragColor = vec4(c.rgb, c.a * uDeckung);
      }`,
  });
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(RING_AUSSEN * 2, RING_AUSSEN * 2), ringMat);
  ring.position.copy(knopfMitte); ring.renderOrder = 3; ring.visible = false;
  inhalt.add(ring);
  const ringA = new THREE.Vector3(), ringB = new THREE.Vector3();
  const RING_FARBEN = { [ORANGE]: [[1, 0.62, 0.34], [1, 0.35, 0.11]], [ROT]: [[1, 0.42, 0.4], [1, 0.18, 0.18]] };

  // Wellen auf dem Chip: drei weiche Ringe, die vom Knopf nach außen laufen (Druck, Notruf, Hinweis „drück mich“)
  const wellenGeo = new THREE.PlaneGeometry(2, 2);
  const wellenFS = `
    precision highp float;
    varying vec2 vUv;
    uniform vec3 uFarbe; uniform float uDeckung;
    void main() {
      float r = length((vUv - 0.5) * 2.0), aa = max(fwidth(r), 0.0001) * 1.5;
      float band = smoothstep(0.89 - aa, 0.93, r) * (1.0 - smoothstep(0.955, 1.0, r));
      gl_FragColor = vec4(uFarbe, band * uDeckung);
    }`;
  const wellen = [0, 1, 2].map(() => {
    const mat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, uniforms: { uFarbe: { value: new THREE.Color(ORANGE) }, uDeckung: { value: 0 } }, vertexShader: flaecheVS, fragmentShader: wellenFS });
    const m = new THREE.Mesh(wellenGeo, mat);
    m.position.copy(knopfMitte); m.renderOrder = 1; m.visible = false; inhalt.add(m);
    return { m, mat, start: -1e9, gross: 4, staerke: 0.8, dauer: 900 };
  });
  let letzteWelle = 0;
  const welle = (jetzt, farbe, gross, anzahl, staerke, dauer) => {
    for (let i = 0; i < anzahl; i++) { const w = wellen[i]; w.start = jetzt + i * 150; w.gross = gross; w.staerke = staerke; w.dauer = dauer || 900; w.mat.uniforms.uFarbe.value.set(farbe).convertLinearToSRGB(); }
    letzteWelle = jetzt;
  };

  // Ziffer auf dem Knopf (3, 2, 1 beim Halten und in der Frist): groß gezeichnet, damit sie auch nah scharf bleibt
  const schrift = (getComputedStyle(wurzel).getPropertyValue("--sc-font-display") || "").trim() || '"Funnel Display", system-ui, sans-serif';
  const ziffern = {};
  const zifferTex = (n) => {
    if (!ziffern[n]) {
      const c = document.createElement("canvas"); c.width = c.height = 512;
      const x = c.getContext("2d");
      x.font = "640 340px " + schrift; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#fff";
      x.fillText(String(n), 256, 280);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      ziffern[n] = t;
    }
    return ziffern[n];
  };
  const zahlMat = flach(0xffffff, 0);
  const zahl = new THREE.Mesh(new THREE.PlaneGeometry(knopfR * 1.4, knopfR * 1.4), zahlMat);
  zahl.position.copy(knopfMitte); zahl.rotation.z = -Math.PI / 2; zahl.renderOrder = 5; zahl.visible = false;
  inhalt.add(zahl);
  let gezeigteZiffer = 0;

  // Leuchten der LED: ein weicher Punkt vor dem Lichtleiter
  const lb = teile.ledstab.geometry.boundingBox;
  const glanz = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const ledGlanz = new THREE.Sprite(new THREE.SpriteMaterial({ map: glanz, color: GRUEN, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false }));
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

  /* ------------------------------------- Die Gruppe: drei kleine Chips -- */
  const E = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "YXZ"));
  const minis = [0, 1, 2].map((i) => {
    const g = new THREE.Group(), l = new THREE.Group(), m = new THREE.Group(), inh = new THREE.Group();
    m.rotation.z = Math.PI / 2; inh.position.copy(inhalt.position);
    const led = ledMat.clone();
    for (const [name, , , mat] of TEILE) inh.add(new THREE.Mesh(teile[name].geometry, name === "ledstab" ? led : MAT[mat]));
    const gl = new THREE.Sprite(ledGlanz.material.clone()); gl.position.copy(ledGlanz.position); gl.scale.setScalar(16); gl.renderOrder = 4;
    inh.add(gl); g.add(l); l.add(m); m.add(inh); g.visible = false; szene.add(g);
    return { g, l, led, gl, pose: E(0.1 + i * 0.03, [-0.42, 0.46, -0.24][i], [0.09, -0.07, 0.05][i]) };
  });
  let miniRampe = 0;

  /* ------------------------------------------- Schnee im Einstieg -- */
  // drei Lagen: klein und fern (hinter dem Chip), mittel, groß und unscharf ganz vorn
  const schnee = [];
  if (!sparsam && !ohneBewegung) for (const [n, gr, deckung, z0, z1] of [[34, 5, 0.95, -500, -80], [14, 11, 0.75, 80, 340], [6, 34, 0.32, 520, 900]]) {
    const pos = new Float32Array(n * 3), fl = [];
    for (let i = 0; i < n; i++) fl.push({ x: Math.random(), y: Math.random(), z: mix(z0, z1, Math.random()), v: (0.025 + Math.random() * 0.03) * Math.sqrt(gr / 5), w: Math.random() * 6.283 });
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ map: glanz, size: gr, sizeAttenuation: false, transparent: true, opacity: deckung, depthWrite: false, toneMapped: false });
    const p = new THREE.Points(geo, mat); p.frustumCulled = false; szene.add(p);
    schnee.push({ p, geo, mat, fl, deckung, zug: gr / 34 });
  }

  /* ------------------------------------------------------- Größe -- */
  let B = 1, H = 1, radius = "28px";
  const groesse = () => {
    // ohne Bildlaufleiste, damit die Leinwand genau über dem Inhalt liegt
    B = document.documentElement.clientWidth || innerWidth; H = innerHeight;
    renderer.setSize(B, H, false);
    leinwand.style.width = B + "px"; leinwand.style.height = H + "px";
    kamera.aspect = B / H;
    kamera.position.set(0, 0, (H / 2) / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    kamera.near = kamera.position.z * 0.2; kamera.far = kamera.position.z * 3;
    kamera.updateProjectionMatrix();
    radius = getComputedStyle(flaeche).borderTopLeftRadius || "28px";
    bedarf = true;
  };
  let bedarf = true;
  addEventListener("resize", groesse);
  groesse();
  document.body.appendChild(leinwand);
  wurzel.classList.add("chip3d-an");

  /* ------------------------------------------------------- Posen -- */
  const POSE = {
    held: E(0.16, -0.55, 0.1),
    gruppe: E(0.12, -0.22, 0.03),
    halten: E(0.06, -0.08, 0),
    funk: E(0.18, 0.62, -0.05),
    knopf: E(0.1, -0.3, 0.04),
    nah: E(0.03, -0.12, 0),
    lauf: E(0.1, 0.42, -0.03),
  };
  const ziel = new THREE.Quaternion().copy(POSE.held), jetztQ = new THREE.Quaternion().copy(POSE.held);
  const dreh = new THREE.Quaternion(), euler = new THREE.Euler(), punkt = new THREE.Vector3();
  const achseY = new THREE.Vector3(0, 1, 0), achseX = new THREE.Vector3(1, 0, 0), achseZ = new THREE.Vector3(0, 0, 1);

  // Zeiger: der Chip neigt sich leicht dorthin (im Einstieg deutlich, nah am Knopf nur wenig)
  let zx = 0, zy = 0, zxS = 0, zyS = 0;
  addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") { zx = e.clientX / B - 0.5; zy = e.clientY / H - 0.5; } }, { passive: true });

  // Fokusring am Knopf nur bei Bedienung mit der Tastatur (der echte Knopf liegt unter der Leinwand)
  let tastatur = false;
  addEventListener("keydown", () => { tastatur = true; }, true);
  addEventListener("pointerdown", () => { tastatur = false; }, true);

  const mitte = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, w: r.width }; };

  /* ---------------------------------------------- Zustände der Teile -- */
  const effekt = { druck: 0, zittern: 0, ring: 0, ringFarbe: ORANGE, led: 0.15, ledFarbe: GRUEN };
  const effektS = { druck: 0, ring: 0, led: 0.15, dunkel: 0, ringAus: 0 };
  const ledFarbe = new THREE.Color(GRUEN), ledZiel = new THREE.Color();
  let sichtbar = true, eingang = ohneBewegung ? 1 : 0, nah = 0, letzterZustand = "ruhe", letzteZl = 1, letzterClip = "", letzteDeckung = "", knopfAn = null;
  const startZeit = performance.now();
  const zeit = { letzte: performance.now() };

  const bild = (jetzt) => { requestAnimationFrame(bild); zeichne(jetzt); };
  const zeichne = (jetzt) => {
    const dt = Math.max(0, Math.min(0.05, (jetzt - zeit.letzte) / 1000)); zeit.letzte = jetzt;
    const t = jetzt / 1000, s = scrollY;
    const glatt = (rest) => (ohneBewegung ? 1 : 1 - Math.pow(rest, dt));   // Anteil je Bild; rest = was nach 1 s noch fehlt

    /* ---- lesen: Abschnitte und Anker ---- */
    const br = blickAkt.getBoundingClientRect(), kr = knopfAkt.getBoundingClientRect();
    const blickOben = br.top + s, blickEnde = blickOben + br.height - H, knopfOben = kr.top + s;
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

    /* ---- wo ist der Chip, was zeigt er ---- */
    const z = S.zustand, g = S.gruppe || 0, bz = S.blick, sb = bz.schritt;
    const imKnopf = t2 > 0.5, imBlick = !imKnopf && t1 > 0.5, gelandet = t2 >= 0.98;
    const zl = bz.spielt ? ((jetzt - bz.start) % SCHLEIFE) / SCHLEIFE : -1;   // Stand in der Schleife „Gruppe rufen“

    // Nahansicht am Knopf: kommt mit dem letzten Stück des Flugs, weicht zurück, wenn Gruppe oder Notruf laufen
    const nahWunsch = z === "ruhe" || z === "halten" || z === "frist" || (z === "gruppe" && (g < 0.03 || g > 0.9));
    const nahZiel = imKnopf && nahWunsch ? (ohneBewegung ? (gelandet ? 1 : 0) : weich(abschnitt(t2, 0.8, 1))) : 0;
    nah += (nahZiel - nah) * glatt(0.012);
    if (Math.abs(nahZiel - nah) < 0.0008) nah = nahZiel;
    if (nah > 0) {
      const N = mitte(anker.nah), u = weich(nah);
      x = mix(x, N.x, u); y = mix(y, N.y, u); h = h * Math.pow(N.h / h, u);
    }

    ziel.copy(imKnopf ? (z === "lauf" || z === "fertig" ? POSE.lauf : nahZiel > 0.5 ? POSE.nah : POSE.knopf) : imBlick ? [POSE.gruppe, POSE.halten, POSE.funk][sb] : POSE.held);
    jetztQ.slerp(ziel, glatt(0.0025));

    /* ---- Wirkung auf Knopf, LED, Ring ---- */
    effekt.druck = 0; effekt.zittern = 0; effekt.ring = 0; effekt.ringAus = 0; effekt.led = 0.15; effekt.ledFarbe = GRUEN; effekt.ringFarbe = ORANGE;
    let ziffer = 0;
    const blinken = (takt) => (Math.sin(t * takt) > 0 ? 1 : 0.15);
    if (imKnopf) {
      if (z === "halten") { effekt.druck = 1; effekt.ring = S.ring; ziffer = S.sek; }   // beim Halten nur Ring und Ziffer, sonst bleibt alles ruhig
      else if (z === "frist") { effekt.ring = S.ring; effekt.ringFarbe = ROT; effekt.ledFarbe = ROT; effekt.led = blinken(7); ziffer = S.sek; }
      else if (z === "gruppe") { effekt.zittern = g > 0.004 && g < 0.07 ? 1 : 0; effekt.led = g < 0.78 ? blinken(18) : 0.15; }
      else if (z === "lauf") { const hh = S.hilfe || 0; effekt.ledFarbe = ROT; effekt.led = 0.65 + 0.35 * Math.sin(t * 6); effekt.zittern = (hh > 0.31 && hh < 0.35) || (hh > 0.38 && hh < 0.42) ? 1 : 0; }
      else if (z === "fertig") { effekt.led = 0.85; }
      else { effekt.led = 0.15 + 0.12 * (0.5 + 0.5 * Math.sin(t * 2)); }
      // Wellen: beim Rufen der Gruppe, beim Absenden des Notrufs, in Ruhe als Hinweis „drück mich“
      if (z !== letzterZustand) {
        if (z === "gruppe") welle(jetzt, ORANGE, 5, 3, 0.9);
        else if (z === "lauf") welle(jetzt, ROT, 7, 3, 0.95, 1100);
      } else if (z === "ruhe" && gelandet && nah > 0.9 && !ohneBewegung && jetzt - letzteWelle > 2600) welle(jetzt, 0xffb38f, 1.7, 1, 0.55, 1300);
    } else if (imBlick) {
      if (sb === 0) {   // kurz drücken: einmal je Schleife, danach vibrieren die Chips der Gruppe
        if (zl >= 0) {
          effekt.druck = zl > 0.015 && zl < 0.07 ? 1 : 0;
          effekt.led = zl > 0.07 && zl < 0.34 ? blinken(18) : 0.15;
          if (letzteZl < 0.07 && zl >= 0.07 && !ohneBewegung) welle(jetzt, ORANGE, 4, 2, 0.85);
        }
      } else if (sb === 1) {   // drei Sekunden halten: der Ring füllt sich mit dem Scrollen (seite.js: --halten)
        const r = bz.halten;
        effekt.druck = r < 1 ? 1 : 0; effekt.ring = r; effekt.ringFarbe = ORANGE; effekt.ringAus = r >= 1 ? 1 : 0;   // voll: blendet aus, statt zurückzulaufen
        effekt.ledFarbe = ROT; effekt.led = r < 1 ? 0.25 : 0.7 + 0.3 * Math.sin(t * 8);
      } else {   // Funk: rote LED ruhig, der Chip hat sich zur Liftstation gedreht
        effekt.ledFarbe = ROT; effekt.led = 0.55 + 0.25 * Math.sin(t * 4);
      }
    }
    letzterZustand = z; letzteZl = zl;
    const k = glatt(0.0001);
    effektS.druck = mix(effektS.druck, effekt.druck, k);
    // In „Was ist SKITAG?“ folgt der Ring direkt dem Scrollen; ist er voll, blendet er aus und läuft nie zurück.
    // In der Vorführung füllt er sich weich und leert sich schnell (die Frist läuft bewusst zurück).
    if (!imKnopf) { effektS.ring = effekt.ring; if (effekt.ring > 0 && effekt.ring < 1) effektS.ringAus = 0; }
    else effektS.ring = mix(effektS.ring, effekt.ring, effekt.ring < effektS.ring - 0.02 ? glatt(1e-9) : glatt(0.00001));
    effektS.ringAus = effekt.ringAus ? mix(effektS.ringAus, 1, glatt(0.002)) : imKnopf ? 0 : effektS.ringAus;
    effektS.led = mix(effektS.led, effekt.led, k);
    // Nacht: steht die Fläche auf Nacht (Notruf läuft, Schritte 2 und 3 in „Was ist SKITAG?“), wird das Licht schwächer
    const dunkel = imKnopf ? (z === "lauf" ? 1 : 0) : imBlick && sb >= 1 ? 0.8 : 0;
    effektS.dunkel = mix(effektS.dunkel, dunkel, glatt(0.002));
    renderer.toneMappingExposure = mix(1.08, 0.74, effektS.dunkel);

    // Eingang beim Laden: schwebt von unten ins Bild
    if (eingang < 1) eingang = klemme((jetzt - startZeit) / 1400);
    const ein = 1 - Math.pow(1 - eingang, 3);

    // Schweben und Zeiger: voll im Einstieg, leicht in der Nahansicht
    const ruhig = 1 - klemme(t1 * 3);
    zxS = mix(zxS, zx, 0.06); zyS = mix(zyS, zy, 0.06);
    const schweben = ohneBewegung ? 0 : Math.sin(t * 1.3) * 0.012 * h * (0.35 + 0.65 * ruhig) * (1 - nah);

    /* ---- zusammensetzen ---- */
    const skala = (h / GROESSE[0]) * (0.86 + 0.14 * ein);
    chip.position.set(x - B / 2, H / 2 - y + schweben - (1 - ein) * h * 0.25, flug * h * 0.6);
    chip.scale.setScalar(skala);
    lage.quaternion.copy(jetztQ);
    if (spin) { dreh.setFromAxisAngle(achseY, spin); lage.quaternion.premultiply(dreh); }
    if (kipp) { dreh.setFromAxisAngle(achseX, kipp); lage.quaternion.premultiply(dreh); }
    if (!ohneBewegung) {
      const zeiger = ruhig + nah * 0.3;
      dreh.setFromEuler(euler.set(zyS * 0.35 * zeiger + Math.sin(t * 0.9) * 0.03 * (1 - nah), zxS * 0.6 * zeiger + Math.sin(t * 0.7) * 0.14 * ruhig, 0));
      lage.quaternion.multiply(dreh);
      if (effekt.zittern) { dreh.setFromAxisAngle(achseZ, Math.sin(t * 58) * 0.01); lage.quaternion.multiply(dreh); chip.position.x += Math.sin(t * 71) * Math.min(h, 420) * 0.0025; }
      if (ein < 1) { dreh.setFromAxisAngle(achseY, (1 - ein) * -1.2); lage.quaternion.multiply(dreh); }
    }

    // Wie weit zeigt die Vorderseite zur Kamera? LED-Schein, Ringe, Ziffer und Wellen liegen ohne Tiefentest auf
    // dem Chip und würden sonst durch ihn hindurch scheinen, wenn er sich im Flug umdreht.
    punkt.set(0, 0, 1).applyQuaternion(lage.quaternion);
    const vorn = klemme((punkt.z - 0.08) / 0.3);

    // Knopf drücken (Modell: z ist die Dicke), Füllring, Spur, Ziffer, LED
    const tief = -0.9 * effektS.druck;
    teile.kappe.position.z = tief;
    const anteil = effektS.ring;
    const ru = ringMat.uniforms, rf = RING_FARBEN[effekt.ringFarbe] || RING_FARBEN[ORANGE];
    const fokus = tastatur && !!knopfEl && document.activeElement === knopfEl;
    ru.uAnteil.value = anteil;
    ru.uSpur.value = mix(ru.uSpur.value, anteil > 0.002 || effekt.ring > 0 ? 0.2 : 0, 0.2);
    ru.uFokus.value = mix(ru.uFokus.value, fokus ? 0.95 : 0, 0.25);
    ru.uA.value.lerp(ringA.fromArray(rf[0]), 0.15); ru.uB.value.lerp(ringB.fromArray(rf[1]), 0.15);
    ru.uDeckung.value = vorn * (1 - effektS.ringAus);
    ring.visible = vorn > 0.01 && effektS.ringAus < 0.99 && (anteil > 0.002 || ru.uSpur.value > 0.005 || ru.uFokus.value > 0.005);
    if (!imKnopf) ziffer = 0;
    if (ziffer > 0 && ziffer !== gezeigteZiffer) { zahlMat.map = zifferTex(ziffer); zahlMat.needsUpdate = true; gezeigteZiffer = ziffer; zahl.scale.setScalar(1.25); }
    zahlMat.opacity = mix(zahlMat.opacity, ziffer > 0 ? 1 : 0, 0.25);
    zahl.visible = zahlMat.opacity > 0.01 && !!zahlMat.map && vorn > 0.5;
    zahl.scale.setScalar(mix(zahl.scale.x, 1, 0.18));
    zahl.position.z = knopfMitte.z + 0.35 + tief;
    ledZiel.setHex(effekt.ledFarbe); ledFarbe.lerp(ledZiel, 0.2);
    ledMat.emissive.copy(ledFarbe); ledMat.emissiveIntensity = 0.2 + effektS.led * 2.2;
    ledGlanz.material.color.copy(ledFarbe); ledGlanz.material.opacity = klemme(effektS.led * 1.1 - 0.15) * vorn; ledGlanz.visible = vorn > 0.01;

    // Wellen auf dem Chip
    for (const w of wellen) {
      const a = (jetzt - w.start) / w.dauer;
      if (a < 0 || a > 1) { w.m.visible = false; continue; }
      const aus = 1 - Math.pow(1 - a, 3);
      w.m.visible = true; w.m.scale.setScalar(knopfR * (1.15 + aus * w.gross)); w.mat.uniforms.uDeckung.value = w.staerke * Math.pow(1 - a, 1.6) * vorn;
    }

    // Schatten: liegt unter dem Chip, wird beim Fliegen größer und blasser, in der Nahansicht fällt er weg
    schatten.position.set(chip.position.x, H / 2 - y - h * 0.6, -h * 0.4);
    schatten.scale.set(h * 1.2 * (1 + flug * 0.5), h * 1.2 * (1 + flug * 0.5), 1);
    schatten.material.opacity = (0.75 - flug * 0.6) * ein * (1 - nah);

    /* ---- die Gruppe ---- */
    const miniDa = (imBlick && sb === 0 && t1 >= 0.97 && t2 === 0) || (imKnopf && z === "gruppe" && g > 0.08 && g < 0.86);
    miniRampe = ohneBewegung ? (miniDa ? 1 : 0) : klemme(miniRampe + (miniDa ? dt : -dt) / 0.55);
    const miniOrt = imKnopf ? miniAnker.knopf : miniAnker.blick;
    for (let i = 0; i < 3; i++) {
      const m = minis[i], an = miniRampe > 0 && miniOrt[i] ? Math.max(0, federnd(klemme(miniRampe * 1.6 - i * 0.3))) : 0;
      m.g.visible = an > 0.01;
      if (!m.g.visible) continue;
      const r = mitte(miniOrt[i]);
      const vib = imKnopf ? g >= 0.335 + i * 0.037 && g < 0.72 : zl >= 0.27 + i * 0.04 && zl < 0.57 + i * 0.04;
      m.g.position.set(r.x - B / 2 + (vib && !ohneBewegung ? Math.sin(t * 71 + i) * r.h * 0.008 : 0), H / 2 - r.y + (ohneBewegung ? 0 : Math.sin(t * 1.5 + i * 2.1) * r.h * 0.02), 0);
      m.g.scale.setScalar((r.h / GROESSE[0]) * an);
      m.l.quaternion.copy(m.pose);
      if (!ohneBewegung) {
        dreh.setFromEuler(euler.set(Math.sin(t * 0.8 + i) * 0.04, Math.sin(t * 0.6 + i * 1.7) * 0.1, vib ? Math.sin(t * 58 + i * 2) * 0.025 : 0));
        m.l.quaternion.multiply(dreh);
      }
      const hell = vib ? blinken(20) : 0.12;
      m.led.emissive.setHex(0x2fd66a); m.led.emissiveIntensity = 0.2 + hell * 2.4;
      m.gl.material.opacity = klemme(hell * 1.1 - 0.15);
    }

    /* ---- Schnee im Einstieg ---- */
    const schneeSicht = 1 - klemme(s / (H * 0.8));
    for (const l of schnee) {
      l.p.visible = schneeSicht > 0.01;
      if (!l.p.visible) continue;
      const pos = l.geo.attributes.position;
      for (let i = 0; i < l.fl.length; i++) {
        const f = l.fl[i];
        f.y += f.v * dt; if (f.y > 1.1) { f.y = -0.1; f.x = Math.random(); }
        pos.setXYZ(i, (f.x - 0.5 + Math.sin(f.w + t * 0.5) * 0.012) * B * 1.25, (0.5 - f.y) * H * 1.25 + s * l.zug * 0.7, f.z);
      }
      pos.needsUpdate = true;
      l.mat.opacity = l.deckung * schneeSicht * ein;
    }

    /* ---- schreiben: echter Knopf, Ausschnitt, Leinwand ---- */
    if (knopfEl) {
      const an = imKnopf && t2 > 0.9;
      if (an) {
        chip.updateMatrixWorld(true);
        punkt.copy(knopfMitte); inhalt.localToWorld(punkt);
        const naeher = kamera.position.z / (kamera.position.z - punkt.z);
        punkt.project(kamera);
        const r = (knopfR + 2.6) * chip.scale.x * naeher;
        knopfEl.style.transform = "translate(" + ((punkt.x * 0.5 + 0.5) * B - (K.x - K.w / 2) - r).toFixed(1) + "px," + ((-punkt.y * 0.5 + 0.5) * H - (K.y - K.h / 2) - r).toFixed(1) + "px)";
        knopfEl.style.width = (2 * r).toFixed(1) + "px";
      }
      if (an !== knopfAn) { knopfAn = an; knopfEl.style.pointerEvents = an ? "" : "none"; }
    }
    let clip = "none";
    if (nah > 0.002) { const p = flaeche.getBoundingClientRect(); clip = "inset(" + p.top.toFixed(1) + "px " + (B - p.right).toFixed(1) + "px " + (H - p.bottom).toFixed(1) + "px " + p.left.toFixed(1) + "px round " + radius + ")"; }
    if (clip !== letzterClip) { leinwand.style.clipPath = clip; letzterClip = clip; }
    const deckung = (ohneBewegung ? tSnap : ein).toFixed(3);
    if (deckung !== letzteDeckung) { leinwand.style.opacity = deckung; letzteDeckung = deckung; }

    // nur zeichnen, solange der Chip im Bild ist
    const war = sichtbar;
    sichtbar = y + h > -h && y - h < H + h;
    if (sichtbar !== war) leinwand.style.visibility = sichtbar ? "visible" : "hidden";
    if (sichtbar || bedarf) { renderer.render(szene, kamera); bedarf = false; }
  };
  requestAnimationFrame(bild);
}
