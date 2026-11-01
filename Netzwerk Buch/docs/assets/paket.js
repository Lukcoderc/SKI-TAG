// Klickbarer Bauplan der Funkpakete: Felder eines Pakets wählen und ihre Bedeutung lesen.
const PAKETE = {
  uplink: [
    { name: "Kennung", byte: 1, text: "Immer 0xA7. Daran erkennt das Gateway ein SkiTag-Paket." },
    { name: "Chip-Nr.", byte: 1, text: "Welcher Chip sendet. Sie steht lesbar im Paket." },
    { name: "Zähler", byte: 4, text: "Steigt mit jedem Paket und wird nie kleiner. So erkennt der Server alte und doppelte Pakete." },
    { name: "Ereignis", byte: 1, geheim: true, text: "Was passiert ist, zum Beispiel Gruppe rufen, Notruf oder Start." },
    { name: "Ereignis-Nr.", byte: 1, geheim: true, text: "Laufende Nummer des Ereignisses. Der Server bestätigt genau diese Nummer." },
    { name: "Wert", byte: 1, geheim: true, text: "Zusatzangabe zum Ereignis." },
    { name: "Status", byte: 1, geheim: true, text: "Einzelne Schalter: GPS-Empfang, Strom von der Ladebox, lädt, bewegt sich, Akku fast leer, Notruf läuft, Akku leer." },
    { name: "Breite", byte: 4, geheim: true, text: "Breitengrad mal eine Million. Das ergibt eine Auflösung von rund 11 cm, die GPS-Genauigkeit ist aber geringer." },
    { name: "Länge", byte: 4, geheim: true, text: "Längengrad mal eine Million." },
    { name: "Höhe", byte: 2, geheim: true, text: "Höhe in Metern." },
    { name: "Tempo", byte: 1, geheim: true, text: "Meter pro Sekunde mal 4. Das reicht bis knapp 230 km/h." },
    { name: "Akku", byte: 1, geheim: true, text: "Ladestand in Prozent." },
    { name: "dlAck", byte: 1, geheim: true, text: "Quittung: das unterste Byte des Zählers vom letzten Downlink an diesen Chip. So weiß der Server, ob sein Befehl ankam." },
    { name: "Prüfwert", byte: 4, text: "Der MAC. Stimmt er nicht, verwirft der Server das Paket." },
  ],
  downlink: [
    { name: "Kennung", byte: 1, text: "Immer 0xA8. Daran erkennt der Chip einen Downlink." },
    { name: "Zähler", byte: 4, text: "Läuft mit der Uhr des Servers mit, 16 pro Sekunde, und wird nie kleiner. Der Chip merkt sich den letzten Wert im Flash." },
    { name: "Anzahl", byte: 1, geheim: true, text: "Wie viele Befehle folgen, höchstens 8." },
    { name: "Befehle", byte: 24, geheim: true, text: "Bis zu 8 Befehle zu je 3 Byte: Chip, Befehl und Wert. Ein Downlink kann also mehrere Chips auf einmal bedienen." },
    { name: "Prüfwert", byte: 4, text: "Der MAC. Damit erkennt der Chip, dass der Befehl wirklich vom Server kommt." },
  ],
};

const felder = document.getElementById("paket-felder");
const titel = document.getElementById("paket-titel");
const text = document.getElementById("paket-text");
const wahl = [...document.querySelectorAll("[data-paket]")];

function waehleFeld(knopf, feld) {
  felder.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === knopf)));
  titel.textContent = `${feld.name}, ${feld.byte} Byte${feld.geheim ? ", verschlüsselt" : ""}`;
  text.textContent = feld.text;
}

function zeigePaket(name) {
  wahl.forEach((b) => { b.dataset.an = String(b.dataset.paket === name); });
  felder.textContent = "";
  PAKETE[name].forEach((feld, i) => {
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = feld.geheim ? "feld feld-geheim" : "feld";
    knopf.style.flexGrow = feld.byte;
    knopf.textContent = feld.name;
    const groesse = document.createElement("small");
    groesse.textContent = `${feld.byte} B`;
    knopf.append(groesse);
    knopf.addEventListener("click", () => waehleFeld(knopf, feld));
    felder.append(knopf);
    if (i === 0) waehleFeld(knopf, feld);
  });
}

wahl.forEach((b) => b.addEventListener("click", () => zeigePaket(b.dataset.paket)));
zeigePaket("uplink");
