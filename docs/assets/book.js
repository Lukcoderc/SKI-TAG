// Seil, Kapitelliste und Seitennavigation für alle Kapitel.
const KAPITEL = [
  { nr: 1, titel: "Vom Knopfdruck zur App", datei: "kapitel-01.html" },
  { nr: 2, titel: "Anforderungen" },
  { nr: 3, titel: "Warum LoRa" },
  { nr: 4, titel: "Funkprotokoll" },
  { nr: 5, titel: "Sendeintervall und Kapazität" },
  { nr: 6, titel: "Rückkanal zum Chip" },
  { nr: 7, titel: "SOS: Vorrang und Fehlalarme" },
  { nr: 8, titel: "Die Gateways" },
  { nr: 9, titel: "Reichweite im Gelände" },
  { nr: 10, titel: "Standortplanung KitzSki" },
  { nr: 11, titel: "Strom und Netzanbindung" },
  { nr: 12, titel: "Der Server" },
  { nr: 13, titel: "Schnittstelle zur App" },
  { nr: 14, titel: "Ausfallsicherheit und Betrieb" },
  { nr: 15, titel: "Sicherheit und Datenschutz" },
  { nr: 16, titel: "Testplan Februar 2027" },
  { nr: 17, titel: "Ausblick Serie" },
  { nr: "A", titel: "Anhang" },
];

const STATIONEN = [
  { id: "chip", name: "Chip", x: 70, y: 66 },
  { id: "empfaenger", name: "Gateway", x: 360, y: 57 },
  { id: "server", name: "Server", x: 640, y: 48 },
  { id: "app", name: "App", x: 930, y: 39 },
];
const SPANNEN = ["M70 66 Q215 71 360 57", "M360 57 Q500 62 640 48", "M640 48 Q785 53 930 39"];
const SVG_NS = "http://www.w3.org/2000/svg";
const ohneBewegung = matchMedia("(prefers-reduced-motion: reduce)");
const schmal = matchMedia("(max-width: 820px)");

function pfadAus(d) {
  const pfad = document.createElementNS(SVG_NS, "path");
  pfad.setAttribute("d", d);
  return pfad;
}

function baueSeil() {
  const seil = document.querySelector(".seil");
  const strecke = document.createElement("div");
  strecke.className = "seil-strecke";
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "seil-linie");
  svg.setAttribute("viewBox", "0 0 1000 100");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  const spannen = SPANNEN.map(pfadAus);
  svg.append(...spannen);
  // Unsichtbarer Gesamtpfad, an dem die Gondel fährt.
  const pfad = pfadAus(SPANNEN.map((d, i) => (i ? d.replace(/^M\S+ \S+ /, "") : d)).join(" "));
  pfad.setAttribute("class", "seil-fahrweg");
  svg.append(pfad);

  const liste = document.createElement("ol");
  liste.className = "seil-stationen";
  liste.setAttribute("aria-label", "Stationen des Signalwegs");
  const links = STATIONEN.map((station) => {
    const li = document.createElement("li");
    li.style.left = station.x / 10 + "%";
    li.style.top = station.y + "%";
    const a = document.createElement("a");
    a.className = "station";
    a.href = "kapitel-01.html#schritt-" + station.id;
    a.textContent = station.name;
    li.append(a);
    liste.append(li);
    return a;
  });

  const gondel = document.createElement("div");
  gondel.className = "gondel";
  gondel.setAttribute("aria-hidden", "true");
  strecke.append(svg, liste, gondel);
  seil.append(strecke);

  const gesamt = pfad.getTotalLength();
  const laengeBei = (x) => {
    let von = 0, bis = gesamt;
    while (bis - von > 0.5) {
      const mitte = (von + bis) / 2;
      if (pfad.getPointAtLength(mitte).x < x) von = mitte;
      else bis = mitte;
    }
    return von;
  };
  const halte = STATIONEN.map((s) => laengeBei(s.x));
  let aktuell = 0;
  let laufend = 0;

  const setze = (laenge) => {
    const p = pfad.getPointAtLength(laenge);
    const r = strecke.getBoundingClientRect();
    gondel.style.transform = `translate(${(p.x / 1000) * r.width}px, ${(p.y / 100) * r.height + 9}px)`;
    aktuell = laenge;
  };

  function fahreZu(index, { stoerung = false, rueckweg = false, sofort = false } = {}) {
    links.forEach((a, i) => {
      a.setAttribute("aria-current", String(i === index));
      a.classList.toggle("gestoert", stoerung && i === index);
    });
    spannen.forEach((s, i) => {
      s.classList.toggle("aus", stoerung && i >= index);
      s.classList.toggle("zurueck", rueckweg);
    });
    cancelAnimationFrame(laufend);
    const start = aktuell, ziel = halte[index];
    if (sofort || ohneBewegung.matches || start === ziel) return setze(ziel);
    const dauer = 900, beginn = performance.now();
    const schritt = (jetzt) => {
      const t = Math.min((jetzt - beginn) / dauer, 1);
      setze(start + (ziel - start) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) laufend = requestAnimationFrame(schritt);
    };
    laufend = requestAnimationFrame(schritt);
  }

  const startIndex = Math.max(0, STATIONEN.findIndex((s) => s.id === document.body.dataset.station));
  aktuell = halte[startIndex];
  setze(aktuell);
  fahreZu(startIndex);
  addEventListener("resize", () => setze(aktuell));
  return { fahreZu };
}

function baueKapitelNav() {
  const ol = document.querySelector(".kapitel-nav ol");
  const details = document.querySelector(".kapitel-nav details");
  const passeAn = () => { details.open = !schmal.matches; };
  passeAn();
  schmal.addEventListener("change", passeAn);
  const seite = location.pathname.split("/").pop() || "kapitel-01.html";
  for (const k of KAPITEL) {
    const li = document.createElement("li");
    const nr = document.createElement("span");
    nr.textContent = k.nr;
    li.append(nr);
    if (k.datei) {
      const a = document.createElement("a");
      a.href = k.datei;
      a.textContent = k.titel;
      if (k.datei === seite) {
        li.className = "aktiv";
        a.setAttribute("aria-current", "page");
      }
      li.append(a);
    } else {
      const titel = document.createElement("span");
      titel.textContent = k.titel;
      li.className = "kommt";
      li.title = "Noch nicht geschrieben";
      li.append(titel);
    }
    ol.append(li);
  }
}

function baueSeitenNav() {
  const abschnitte = [...document.querySelectorAll("main h2[id]")];
  const baueListe = (ol) => abschnitte.map((h) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.dataset.kurz || h.textContent;
    li.append(a);
    ol.append(li);
    return a;
  });
  const links = baueListe(document.querySelector(".seiten-nav ol"));
  baueListe(document.querySelector(".seite-klein ol"));
  baueListe(document.querySelector(".seite-mobil ol"));
  const markiere = () => {
    const linie = document.querySelector(".seil").getBoundingClientRect().bottom + 120;
    let aktiv = -1;
    abschnitte.forEach((h, i) => {
      if (h.getBoundingClientRect().top < linie) aktiv = i;
    });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) aktiv = abschnitte.length - 1;
    links.forEach((a, i) => a.classList.toggle("aktiv", i === aktiv));
  };
  addEventListener("scroll", markiere, { passive: true });
  markiere();
}

document.documentElement.classList.add("js");
window.Seil = baueSeil();
baueKapitelNav();
baueSeitenNav();
