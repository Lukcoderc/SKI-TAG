// Rechner für eine Funkstrecke: Freiraum, ein Grat, Wald und ein geschätzter Zuschlag.
const FREQUENZ_MHZ = 869.525;
const WELLENLAENGE_M = 299.792458 / FREQUENZ_MHZ;
const SENDE_DBM = 20;
const GATEWAY_ANTENNE_DBI = 3;
const WALD_DB_PRO_M = 0.17;
const WALD_MAX_DB = 26.5;
const felder = {
  km: document.getElementById("str-km"),
  grat: document.getElementById("str-grat"),
  wald: document.getElementById("str-wald"),
  zuschlag: document.getElementById("str-zuschlag"),
};

function gratVerlust(hoeheM, abstandM) {
  const v = hoeheM * Math.sqrt((2 * abstandM) / (WELLENLAENGE_M * (abstandM / 2) ** 2));
  if (v <= -0.78) return 0;
  return 6.9 + 20 * Math.log10(Math.sqrt((v - 0.1) ** 2 + 1) + v - 0.1);
}

function bewerte(pegel) {
  if (pegel >= -115) return ["Gut", "Der Empfang ist sicher genug. Ab −115 dBm gilt ein Standort laut Übergabe als gut."];
  if (pegel >= -125) return ["Knapp", "Das geht noch, aber wenig mehr Dämpfung reicht und Pakete bleiben aus."];
  if (pegel >= -129) return ["Grenzwertig", "Das liegt an der Empfindlichkeitsgrenze bei SF9. Auf so einen Empfang ist kein Verlass."];
  return ["Kein Empfang", "Das Signal liegt unter dem, was das Gateway bei SF9 noch versteht."];
}

function rechne() {
  const km = +felder.km.value, grat = +felder.grat.value, wald = +felder.wald.value, zuschlag = +felder.zuschlag.value;
  const frei = 32.44 + 20 * Math.log10(km) + 20 * Math.log10(FREQUENZ_MHZ);
  const beugung = gratVerlust(grat, km * 1000);
  const waldDb = WALD_MAX_DB * (1 - Math.exp((-wald * WALD_DB_PRO_M) / WALD_MAX_DB));
  const pegel = SENDE_DBM + GATEWAY_ANTENNE_DBI - frei - beugung - waldDb - zuschlag;
  const [wort, text] = bewerte(pegel);
  document.getElementById("str-km-wert").textContent = `${zahlDe(km, 1)} km`;
  document.getElementById("str-grat-wert").textContent = `${zahlDe(grat)} m`;
  document.getElementById("str-wald-wert").textContent = `${wald} m`;
  document.getElementById("str-zuschlag-wert").textContent = `${zuschlag} dB`;
  document.getElementById("str-frei").textContent = `${zahlDe(frei)} dB`;
  document.getElementById("str-beugung").textContent = `${zahlDe(beugung)} dB`;
  document.getElementById("str-pegel").textContent = `${zahlDe(pegel)} dBm`;
  document.getElementById("str-urteil").textContent = wort;
  document.getElementById("str-text").textContent = text;
}

Object.values(felder).forEach((feld) => feld.addEventListener("input", rechne));
rechne();
