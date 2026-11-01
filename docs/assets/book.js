// Seil, Kapitelliste und Seitennavigation für alle Kapitel.
const KAPITEL = [
  { nr: 1, titel: "Vom Knopfdruck zur App", datei: "kapitel-01.html" },
  { nr: 2, titel: "Anforderungen", datei: "kapitel-02.html" },
  { nr: 3, titel: "Warum LoRa", datei: "kapitel-03.html" },
  { nr: 4, titel: "Funkprotokoll", datei: "kapitel-04.html" },
  { nr: 5, titel: "Sendeintervall und Kapazität", datei: "kapitel-05.html" },
  { nr: 6, titel: "Rückkanal zum Chip", datei: "kapitel-06.html" },
  { nr: 7, titel: "SOS: Vorrang und Fehlalarme", datei: "kapitel-07.html" },
  { nr: 8, titel: "Die Gateways", datei: "kapitel-08.html" },
  { nr: 9, titel: "Reichweite im Gelände", datei: "kapitel-09.html" },
  { nr: 10, titel: "Standortplanung KitzSki", datei: "kapitel-10.html" },
  { nr: 11, titel: "Strom und Netzanbindung", datei: "kapitel-11.html" },
  { nr: 12, titel: "Der Server", datei: "kapitel-12.html" },
  { nr: 13, titel: "Schnittstelle zur App", datei: "kapitel-13.html" },
  { nr: 14, titel: "Ausfallsicherheit und Betrieb", datei: "kapitel-14.html" },
  { nr: 15, titel: "Sicherheit und Datenschutz", datei: "kapitel-15.html" },
  { nr: 16, titel: "Testplan Februar 2027", datei: "kapitel-16.html" },
  { nr: 17, titel: "Ausblick Serie", datei: "kapitel-17.html" },
  { nr: 18, titel: "Testen in der Schule", datei: "kapitel-18.html" },
  { nr: "A", titel: "Anhang", datei: "kapitel-anhang.html" },
];

// Die Stationen des Seils sind die sechs Schritte eines Notrufs.
const STATIONEN = [
  { id: "knopf", name: "Knopf drücken", x: 60, y: 68 },
  { id: "chip", name: "Chip sendet", x: 215, y: 62 },
  { id: "empfaenger", name: "Gateway leitet weiter", x: 370, y: 56 },
  { id: "server", name: "Server entscheidet", x: 530, y: 50 },
  { id: "app", name: "Mitarbeiter wird alarmiert", x: 700, y: 44 },
  { id: "rueckweg", name: "Bestätigung kommt zurück", x: 940, y: 38 },
];
const SPANNEN = STATIONEN.slice(1).map((s, i) => {
  const a = STATIONEN[i];
  return `M${a.x} ${a.y} Q${(a.x + s.x) / 2} ${a.y + 5} ${s.x} ${s.y}`;
});
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
    const nummer = document.createElement("span");
    nummer.textContent = `${STATIONEN.indexOf(station) + 1}.`;
    const name = document.createElement("span");
    name.className = "station-name";
    name.textContent = " " + station.name;
    const text = document.createElement("span");
    text.append(nummer, name);
    a.append(text);
    a.setAttribute("aria-label", `Schritt ${STATIONEN.indexOf(station) + 1}: ${station.name}`);
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

  function fahreZu(index, { stoerung = false, sofort = false } = {}) {
    links.forEach((a, i) => {
      a.setAttribute("aria-current", String(i === index));
      a.classList.toggle("gestoert", stoerung && i === index);
    });
    spannen.forEach((s, i) => {
      s.classList.toggle("aus", stoerung && i >= index);
      s.classList.toggle("geschafft", i < index);
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
