// Rechner für den Spreading Factor: Sendezeit nach der Semtech-Formel, Empfindlichkeit aus dem SX1262-Datenblatt.
const SENDELEISTUNG_DBM = 20;
const TAKT_S = 20;
const AUSSCHNITT_MS = 40;
const EMPFINDLICHKEIT_SF7 = -124;
const DEMOD_SNR = { 7: -7.5, 8: -10, 9: -12.5, 10: -15, 11: -17.5, 12: -20 };
const SF_TEXT = {
  7: "Sehr kurz in der Luft und damit wenig Gefahr, dass sich Pakete treffen, aber die geringste Reichweite.",
  8: "Etwas mehr Reichweite als SF7 bei immer noch kurzer Sendezeit.",
  9: "Die Einstellung von SkiTag: ein Kompromiss aus Reichweite und Sendezeit, und die 5 Zeitfenster von je 4 Sekunden passen.",
  10: "Fast doppelt so lange in der Luft wie SF9, das Paket passt noch ins Zeitfenster, die Antwort wird aber knapper.",
  11: "Weit über eine halbe Sekunde pro Paket: Mit vielen Chips treffen sich die Pakete deutlich öfter.",
  12: "Größte Reichweite, aber sieben Mal so lange in der Luft wie SF9. Für viele Chips im selben Kanal ungeeignet.",
};

const regler = document.getElementById("sf-wert");
const linie = document.getElementById("sf-linie");
const grafik = document.getElementById("sf-chirp");

function zeichneChirps(sf) {
  const symbolMs = (2 ** sf / LORA_BANDBREITE_HZ) * 1000;
  const breite = (symbolMs / AUSSCHNITT_MS) * 700;
  const punkte = [];
  for (let x = 0; x < 700; x += breite) {
    punkte.push(`${x.toFixed(1)},110`, `${Math.min(x + breite, 700).toFixed(1)},${x + breite > 700 ? (110 - ((700 - x) / breite) * 100).toFixed(1) : 10}`);
  }
  linie.setAttribute("points", punkte.join(" "));
  grafik.setAttribute("aria-label", `Chirps bei SF${sf}: ein Chirp dauert ${symbolMs.toFixed(1).replace(".", ",")} Millisekunden`);
}

function zeige() {
  const sf = +regler.value;
  const zeit = sendezeitMs(sf);
  const empfindlichkeit = EMPFINDLICHKEIT_SF7 + DEMOD_SNR[sf] - DEMOD_SNR[7];
  document.getElementById("sf-anzeige").textContent = `SF${sf}`;
  regler.setAttribute("aria-valuetext", `SF${sf}`);
  document.getElementById("sf-zeit").textContent = `${zahlDe(zeit)} ms`;
  document.getElementById("sf-anteil").textContent = `${zahlDe(zeit / (TAKT_S * 10), 1)} %`;
  document.getElementById("sf-empf").textContent = `${zahlDe(empfindlichkeit, empfindlichkeit % 1 ? 1 : 0)} dBm`;
  const budget = SENDELEISTUNG_DBM - empfindlichkeit;
  document.getElementById("sf-budget").textContent = `${zahlDe(budget, budget % 1 ? 1 : 0)} dB`;
  document.getElementById("sf-text").textContent = SF_TEXT[sf];
  zeichneChirps(sf);
}

regler.addEventListener("input", zeige);
zeige();
