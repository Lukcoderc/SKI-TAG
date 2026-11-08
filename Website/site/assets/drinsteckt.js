// „Was drinsteckt“: der Prototyp-Chip zerlegt sich beim Scrollen in seine Schichten.
// Modell aus chip-modell.js (nach der Explosionszeichnung im Werkstattbuch).
// Liest den Scroll-Fortschritt --sc-p, den ScrollCraft auf <section id="aufbau"> setzt.
// ?explode=0..1 setzt den Zustand fest (für Standbilder und Prüfungen).
import * as THREE from "three";
import { Exploder, Labels, Picker } from "./vendor/explode.js";
import { baueChip, studio, webglGeht } from "./chip-modell.js?v=20";

const akt = document.getElementById("aufbau");
const buehne = akt?.querySelector(".aufbau__bild");
const canvas = akt?.querySelector(".aufbau__gl");
const params = new URLSearchParams(location.search);
const FEST = params.has("explode") ? +params.get("explode") : null;
const RUHIG = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FEIN = matchMedia("(hover: hover) and (pointer: fine)").matches;

if (akt && buehne && canvas && webglGeht()) start();

function start() {
  const { renderer, scene } = studio(canvas, { belichtung: 0.95, umgebung: 0.4 });
  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 20);

  // Nachtbühne: ein weiches Oberlicht, kaltes Randlicht von hinten, warmes Streiflicht von links
  const key = new THREE.DirectionalLight("#ffffff", 1.5);
  key.position.set(-1.2, 3.0, -0.6);   // von hinten oben, damit der Deckel nicht weiß spiegelt
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: 0.5, far: 6 });
  key.shadow.bias = -0.0005; key.shadow.radius = 6;
  scene.add(key);
  const rand = new THREE.DirectionalLight("#7fb2ff", 2.6); rand.position.set(-1.6, 0.8, -2.2); scene.add(rand);
  const warm = new THREE.DirectionalLight("#ffc29e", 0.9); warm.position.set(-2.4, 0.2, 1.2); scene.add(warm);

  const boden = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ color: "#000000", opacity: 0.35 }));
  boden.rotation.x = -Math.PI / 2; boden.receiveShadow = true;
  scene.add(boden);

  const { chip, teile, ledStoff } = baueChip();
  const dreh = new THREE.Group(); dreh.add(chip); scene.add(dreh);

  const ex = new Exploder(chip);
  const labels = new Labels(akt.querySelector(".aufbau__etiketten"), camera, canvas, { margin: 4, gap: 10, side: "right" });
  const ETIKETTEN = [
    [teile.knopf, "Knopf", "kurz drücken: Gruppe · halten: Hilfe", [12, 30.5, 0]],
    [teile.deckel, "Licht", "zeigt, was der Chip gerade tut", [55, 27, -10]],
    [teile.platine, "Funk und GPS", "sendet, wo du bist, ohne Handynetz", [48, 21, -10]],
    [teile.lade, "Vibration", "spürbare Antwort in der Jacke", [44, 16, -8]],
    [teile.akku, "Akku", "hält einen ganzen Skitag", [18, 14, -10]],
    [teile.qi, "Kabellos laden", "ganz ohne Stecker", [31, 3.8, -6]],
    [teile.unterteil, "Weiche Hülle", "schützt bei Stürzen", [60, 22, -6]],
  ];
  const etiketten = ETIKETTEN.map(([o, t, n, a]) => ({ teil: o, item: labels.add(o, t, { note: n, anchor: a }) }));
  if (FEIN) new Picker(canvas, camera, chip.children, {
    color: "#7fb2ff",
    onHover: (p) => etiketten.forEach((e) => { e.item.focus = !!p && e.teil === p; }),
  });

  // Rahmen: der Chip sitzt links in der Bühne, rechts stehen die Etiketten
  const blick = new THREE.Vector3(0.62, 0.44, 1).normalize();
  const ziel = new THREE.Vector3(0, 0.16, 0);
  const rahmen = { nah: 3, fern: 4 };
  function einpassen() {
    const r = buehne.getBoundingClientRect();
    const b = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    renderer.setSize(b, h, false);
    camera.aspect = b / h;
    const schmal = b < 520;
    const anteil = schmal ? 0.5 : 0.6;          // Breite, die der Chip nutzt; der Rest gehört den Etiketten
    camera.setViewOffset(b, h, b * (schmal ? 0.24 : 0.2), 0, b, h);   // Bild nach links schieben
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const abstand = (halbB, halbH) => Math.max(halbH / t, halbB / (t * camera.aspect * anteil)) * 1.08;
    rahmen.nah = abstand(0.62, 0.36);
    rahmen.fern = abstand(0.74, 1.08);
    camera.updateProjectionMatrix();
    akt.classList.toggle("aufbau--schmal", schmal);
  }
  einpassen();
  new ResizeObserver(einpassen).observe(buehne);

  // Ziehen dreht den Chip (senkrechtes Wischen scrollt weiter die Seite)
  let ziehYaw = 0, zielYaw = 0, zieht = null;
  canvas.addEventListener("pointerdown", (e) => { zieht = { x: e.clientX, yaw: zielYaw }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => { if (zieht) zielYaw = zieht.yaw + (e.clientX - zieht.x) * 0.008; });
  const loslassen = () => { zieht = null; };
  canvas.addEventListener("pointerup", loslassen);
  canvas.addEventListener("pointercancel", loslassen);

  const fortschritt = () => parseFloat(akt.style.getPropertyValue("--sc-p")) || 0;
  const zerlegt = (p) => FEST ?? (RUHIG ? 1 : THREE.MathUtils.clamp((p - 0.12) / 0.48, 0, 1));
  const ledAn = (p) => (FEST != null ? (FEST >= 1 ? 1 : 0) : RUHIG ? 0 : THREE.MathUtils.clamp((p - 0.66) / 0.1, 0, 1));

  let jetzt = zerlegt(fortschritt()), sichtbar = false, letzte = performance.now(), bilder = 0;
  new IntersectionObserver(([e]) => { sichtbar = e.isIntersecting; if (sichtbar) { letzte = performance.now(); requestAnimationFrame(bild); } }).observe(akt);

  function bild(t) {
    if (!sichtbar) return;
    const dt = Math.min(0.05, (t - letzte) / 1000); letzte = t;
    const p = fortschritt();
    jetzt += (zerlegt(p) - jetzt) * (RUHIG ? 1 : 1 - Math.pow(0.0005, dt));
    ex.set(jetzt);
    ziehYaw += (zielYaw - ziehYaw) * (1 - Math.pow(0.001, dt));
    dreh.rotation.y = -0.18 + (RUHIG ? 0 : (p - 0.4) * 0.6) + ziehYaw;
    camera.position.copy(ziel).addScaledVector(blick, THREE.MathUtils.lerp(rahmen.nah, rahmen.fern, jetzt));
    camera.lookAt(ziel);
    boden.position.y = THREE.MathUtils.lerp(-0.012, -0.83, jetzt);   // der Schatten bleibt unter dem untersten Teil
    ledStoff.emissiveIntensity = ledAn(p) * (2 + Math.sin(t / 180) * 0.6);
    renderer.render(scene, camera);
    labels.update();
    // jedes Etikett erscheint, sobald sein Teil sich gelöst hat
    for (const { teil: o, item } of etiketten) {
      const it = ex.items.find((i) => i.p === o);
      const k = it.off.lengthSq() ? it.p.position.clone().sub(it.home).length() / it.off.length() : 1;
      const a = THREE.MathUtils.clamp((k - 0.35) / 0.4, 0, 1);
      item.el.style.opacity = item.line.style.opacity = a;
    }
    if (++bilder === 2) { akt.classList.add("aufbau--3d"); window.__aufbauBereit = true; }
    requestAnimationFrame(bild);
  }
}
