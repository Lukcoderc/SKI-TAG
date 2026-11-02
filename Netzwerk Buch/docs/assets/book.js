// Kapitelliste und Seitennavigation für alle Seiten.
// Die Reihenfolge folgt dem Weg des Signals: Jedes Kapitel setzt nur voraus, was davor steht.
const KAPITEL = [
  { teil: "Einstieg", nr: "", titel: "SkiTag in 5 Minuten", datei: "kapitel-kurz.html" },
  { teil: "Einstieg", nr: "", titel: "Häufige Fragen", datei: "kapitel-fragen.html" },
  { teil: "Grundlagen", nr: 1, titel: "Vom Knopfdruck zur App", datei: "kapitel-01.html" },
  { teil: "Grundlagen", nr: 2, titel: "Anforderungen", datei: "kapitel-02.html" },
  { teil: "Funk", nr: 3, titel: "Warum LoRa", datei: "kapitel-03.html" },
  { teil: "Funk", nr: 4, titel: "Funkprotokoll", datei: "kapitel-04.html" },
  { teil: "Funk", nr: 5, titel: "Sendeintervall und Kapazität", datei: "kapitel-05.html" },
  { teil: "Funk", nr: 6, titel: "Rückkanal zum Chip", datei: "kapitel-06.html" },
  { teil: "Gateways am Berg", nr: 7, titel: "Die Gateways", datei: "kapitel-07.html" },
  { teil: "Gateways am Berg", nr: 8, titel: "Reichweite im Gelände", datei: "kapitel-08.html" },
  { teil: "Gateways am Berg", nr: 9, titel: "Standortplanung KitzSki", datei: "kapitel-09.html" },
  { teil: "Gateways am Berg", nr: 10, titel: "Strom und Netzanbindung", datei: "kapitel-10.html" },
  { teil: "Server und App", nr: 11, titel: "Der Server", datei: "kapitel-11.html" },
  { teil: "Server und App", nr: 12, titel: "Schnittstelle zur App", datei: "kapitel-12.html" },
  { teil: "Notruf und Sicherheit", nr: 13, titel: "SOS: Vorrang und Fehlalarme", datei: "kapitel-13.html" },
  { teil: "Notruf und Sicherheit", nr: 14, titel: "Ausfallsicherheit und Betrieb", datei: "kapitel-14.html" },
  { teil: "Notruf und Sicherheit", nr: 15, titel: "Sicherheit und Datenschutz", datei: "kapitel-15.html" },
  { teil: "Test und Serie", nr: 16, titel: "Testen in der Schule", datei: "kapitel-16.html" },
  { teil: "Test und Serie", nr: 17, titel: "Testplan Februar 2027", datei: "kapitel-17.html" },
  { teil: "Test und Serie", nr: 18, titel: "Ausblick auf den Betrieb", datei: "kapitel-18.html" },
  { teil: "Nachschlagen", nr: "", titel: "Entscheidungen und offene Punkte", datei: "kapitel-entscheidungen.html" },
  { teil: "Nachschlagen", nr: "", titel: "Anhang", datei: "kapitel-anhang.html" },
];
// schmal nur hier, SVG_NS und ohneBewegung nutzen auch die Kapitel-Skripte.
const SVG_NS = "http://www.w3.org/2000/svg";
const ohneBewegung = matchMedia("(prefers-reduced-motion: reduce)");
const schmal = matchMedia("(max-width: 820px)");

function baueKapitelEintrag(k, seite) {
  const li = document.createElement("li");
  if (k.nr) {
    const nr = document.createElement("span");
    nr.textContent = k.nr;
    li.append(nr);
  } else {
    li.classList.add("ohne-nr");
  }
  if (k.datei) {
    const a = document.createElement("a");
    a.href = k.datei;
    a.textContent = k.titel;
    if (k.datei === seite) {
      li.classList.add("aktiv");
      a.setAttribute("aria-current", "page");
    }
    li.append(a);
  } else {
    const titel = document.createElement("span");
    titel.textContent = k.titel;
    li.classList.add("kommt");
    li.title = "Noch nicht geschrieben";
    li.append(titel);
  }
  return li;
}

function baueKapitelNav() {
  const ol = document.querySelector(".kapitel-nav ol");
  const details = document.querySelector(".kapitel-nav details");
  const passeAn = () => { details.open = !schmal.matches; };
  passeAn();
  schmal.addEventListener("change", passeAn);
  const seite = location.pathname.split("/").pop() || "index.html";
  if (seite === "index.html") document.querySelector(".buch-marke").setAttribute("aria-current", "page");
  let liste;
  let teil;
  for (const k of KAPITEL) {
    if (k.teil !== teil) {
      teil = k.teil;
      const gruppe = document.createElement("li");
      gruppe.className = "teil";
      const name = document.createElement("span");
      name.className = "teil-name";
      name.textContent = teil;
      liste = document.createElement("ol");
      gruppe.append(name, liste);
      ol.append(gruppe);
    }
    liste.append(baueKapitelEintrag(k, seite));
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
    const linie = 120;
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

// Suche: Daten und Logik laden erst, wenn jemand ins Feld klickt.
function baueSuche() {
  const details = document.querySelector(".kapitel-nav details");
  const form = document.createElement("form");
  form.className = "suche";
  form.setAttribute("role", "search");
  const feld = document.createElement("input");
  feld.type = "search";
  feld.placeholder = "Im Buch suchen";
  feld.setAttribute("aria-label", "Im Buch suchen");
  form.append(feld);
  details.querySelector("summary").after(form);
  form.addEventListener("submit", (e) => e.preventDefault());
  const v = [...document.scripts].find((s) => /book\.js/.test(s.src))?.src.split("?")[1] ?? "";
  feld.addEventListener("focus", () => {
    if (window.Suche || document.querySelector("#suche-skript")) return;
    const daten = document.createElement("script");
    daten.src = "assets/suche-daten.js?" + v;
    daten.onload = () => {
      const logik = document.createElement("script");
      logik.id = "suche-skript";
      logik.src = "assets/suche.js?" + v;
      document.head.append(logik);
    };
    document.head.append(daten);
  });
}

// Am Handy: Blättern auch oben und ein Knopf zurück zum Inhalt.
function baueHandyHilfen() {
  const unten = document.querySelector(".blaettern");
  const kopf = document.querySelector(".vorwissen") || document.querySelector(".stand");
  if (unten && kopf) {
    const oben = unten.cloneNode(true);
    oben.classList.add("blaettern-oben");
    kopf.after(oben);
  }
  const knopf = document.createElement("a");
  knopf.className = "zum-inhalt";
  knopf.href = "#";
  knopf.textContent = "Inhalt";
  knopf.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".kapitel-nav details").open = true;
    scrollTo({ top: 0, behavior: ohneBewegung.matches ? "auto" : "smooth" });
  });
  document.body.append(knopf);
}

document.documentElement.classList.add("js");
baueKapitelNav();
baueSeitenNav();
baueSuche();
baueHandyHilfen();
