// Kapazitätsrechner: Wie voll wird ein Kanal, wenn Chips ohne feste Fenster senden?
const eingabe = {
  chips: document.getElementById("kap-chips"),
  takt: document.getElementById("kap-takt"),
  sf: document.getElementById("kap-sf"),
  kanaele: document.getElementById("kap-kanaele"),
};
const GRENZE_LORAWAN_PROZENT = 1;

function urteil(chance, sendeanteil, kanaele) {
  if (kanaele > 1 && sendeanteil > GRENZE_LORAWAN_PROZENT) return "In den Bändern mit mehreren Kanälen sind nur 1 % Sendezeit erlaubt. Diese Einstellung liegt darüber.";
  if (chance >= 0.85) return "Der Kanal ist kaum belastet, fast jedes Paket kommt durch.";
  if (chance >= 0.6) return "Es geht, aber spürbar viele Pakete müssen wiederholt werden oder gehen verloren.";
  return "Der Kanal ist überlastet: Ein großer Teil der Pakete stößt zusammen.";
}

function rechne() {
  const chips = +eingabe.chips.value;
  const takt = +eingabe.takt.value;
  const sf = +eingabe.sf.value;
  const kanaele = +eingabe.kanaele.value;
  const zeitS = sendezeitMs(sf) / 1000;
  const last = (chips / kanaele) * (zeitS / takt);
  const chance = Math.exp(-2 * last);
  const sendeanteil = (zeitS / takt) * 100;
  document.getElementById("kap-chips-wert").textContent = chips;
  document.getElementById("kap-belegt").textContent = `${zahlDe(Math.min(last * 100, 999), 1)} %`;
  document.getElementById("kap-chance").textContent = `${zahlDe(chance * 100)} %`;
  document.getElementById("kap-sendeanteil").textContent = `${zahlDe(sendeanteil, 1)} %`;
  document.getElementById("kap-urteil").textContent = urteil(chance, sendeanteil, kanaele);
}

Object.values(eingabe).forEach((feld) => feld.addEventListener("input", rechne));
rechne();
