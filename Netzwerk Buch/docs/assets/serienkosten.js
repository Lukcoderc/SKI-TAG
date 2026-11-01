// Rechner für die Kosten des Netzes: Anzahl mal Gerät und Zubehör, dazu der Server.
const felder = ["anzahl", "preis", "zubehoer", "server"].map((name) => document.getElementById(`ser-${name}`));
const euro = (wert) => `${wert.toLocaleString("de-AT")} €`;

function rechne() {
  const [anzahl, preis, zubehoer, server] = felder.map((feld) => +feld.value);
  const gateways = anzahl * (preis + zubehoer);
  document.getElementById("ser-anzahl-wert").textContent = anzahl;
  document.getElementById("ser-preis-wert").textContent = euro(preis);
  document.getElementById("ser-zubehoer-wert").textContent = euro(zubehoer);
  document.getElementById("ser-server-wert").textContent = euro(server);
  document.getElementById("ser-gateways").textContent = euro(gateways);
  document.getElementById("ser-gesamt").textContent = euro(gateways + server);
}

felder.forEach((feld) => feld.addEventListener("input", rechne));
rechne();
