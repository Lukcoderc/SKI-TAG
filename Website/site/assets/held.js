// Einstieg: der Chip schwebt über dem Schnee, dreht sich langsam und steigt beim Scrollen.
// Modell aus chip-modell.js, nur die äußeren Teile (das Innere sieht man hier nicht).
import * as THREE from "three";
import { baueChip, studio, webglGeht } from "./chip-modell.js?v=20";

const akt = document.querySelector(".hang");
const canvas = akt?.querySelector(".hang__gl");
const RUHIG = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FEIN = matchMedia("(hover: hover) and (pointer: fine)").matches;

if (akt && canvas && webglGeht()) start();

function start() {
  const { renderer, scene } = studio(canvas, { schatten: false, belichtung: 0.95, umgebung: 0.6 });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));   // ganze Bühne: etwas sparsamer
  const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 30);

  const key = new THREE.DirectionalLight("#ffffff", 1.8); key.position.set(-1.2, 3, 2); scene.add(key);
  const himmel = new THREE.HemisphereLight("#eaf3ff", "#9fb6cf", 0.25); scene.add(himmel);
  const rand = new THREE.DirectionalLight("#cfe3ff", 1.4); rand.position.set(1.8, 1.2, -2); scene.add(rand);

  const { chip, ledStoff } = baueChip({ innen: false, schatten: false });
  const schwebe = new THREE.Group(); schwebe.add(chip);
  chip.position.y = -0.16;                 // Mitte des Chips auf Höhe 0
  scene.add(schwebe);

  // weicher, kalter Schatten am Boden: eine Ebene mit einem radialen Verlauf
  const sc = document.createElement("canvas"); sc.width = sc.height = 256;
  const g = sc.getContext("2d");
  const verlauf = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  verlauf.addColorStop(0, "rgba(40,70,110,0.55)"); verlauf.addColorStop(0.45, "rgba(60,95,140,0.22)"); verlauf.addColorStop(1, "rgba(80,110,150,0)");
  g.fillStyle = verlauf; g.fillRect(0, 0, 256, 256);
  const schatten = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  schatten.rotation.x = -Math.PI / 2; schatten.position.y = -0.42;
  scene.add(schatten);

  let breit = 1, hoch = 1;
  function einpassen() {
    const r = canvas.getBoundingClientRect();
    breit = Math.max(1, Math.round(r.width)); hoch = Math.max(1, Math.round(r.height));
    renderer.setSize(breit, hoch, false);
    camera.aspect = breit / hoch;
    camera.updateProjectionMatrix();
  }
  einpassen();
  new ResizeObserver(einpassen).observe(canvas);

  // Zeiger neigt den Chip leicht zu sich (nur Maus)
  const zeiger = { x: 0, y: 0, zx: 0, zy: 0 };
  if (FEIN && !RUHIG) addEventListener("pointermove", (e) => { zeiger.zx = e.clientX / innerWidth - 0.5; zeiger.zy = e.clientY / innerHeight - 0.5; }, { passive: true });

  const fortschritt = () => parseFloat(akt.style.getPropertyValue("--sc-p")) || 0;
  let sichtbar = false, bilder = 0, glatt = fortschritt();
  new IntersectionObserver(([e]) => { sichtbar = e.isIntersecting; if (sichtbar) requestAnimationFrame(bild); }).observe(akt);

  function bild(t) {
    if (!sichtbar) return;
    const sek = t / 1000;
    glatt += (fortschritt() - glatt) * 0.12;
    const p = RUHIG ? 0 : glatt;
    zeiger.x += (zeiger.zx - zeiger.x) * 0.06; zeiger.y += (zeiger.zy - zeiger.y) * 0.06;

    // schweben, langsam drehen; beim Scrollen kippt er zur Kamera und wird größer
    const schweben = RUHIG ? 0 : Math.sin(sek * 1.1) * 0.035;
    schwebe.position.y = schweben;
    schwebe.rotation.y = (RUHIG ? -0.5 : -0.62 + Math.sin(sek * 0.35) * 0.22 + p * 0.9) + zeiger.x * 0.5;
    schwebe.rotation.x = 0.08 + zeiger.y * 0.25 + p * 0.35;
    schwebe.rotation.z = RUHIG ? 0 : Math.sin(sek * 0.7) * 0.03;
    schatten.material.opacity = 0.9 - schweben * 6 - p * 0.6;
    schatten.scale.setScalar(1 - schweben * 1.5);

    // Kamera: der Chip steht unten in der Mitte und steigt mit dem Scrollen nach oben
    const schmal = breit < 700;
    const abstand = (schmal ? 6.4 : 5.2) - p * 1.2;
    camera.position.set(0, 1.55 * abstand / 5, abstand);
    camera.lookAt(0, 0, 0);
    const unten = (schmal ? 0.27 : 0.24) - p * 0.16;     // Anteil der Höhe, um den die Szene nach unten rückt
    camera.setViewOffset(breit, hoch, 0, -hoch * unten, breit, hoch);

    // die LED atmet ruhig in Weiß, als Zeichen „bereit“
    ledStoff.emissive.set("#ffffff");
    ledStoff.emissiveIntensity = RUHIG ? 0.4 : 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(sek * 2.2));

    renderer.render(scene, camera);
    if (++bilder === 2) akt.classList.add("hang--3d");
    requestAnimationFrame(bild);
  }
}
