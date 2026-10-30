// Checkliste für den Schultest: Der Fortschritt bleibt in diesem Browser gespeichert.
const SPEICHER = "skitag-schultest";
const haken = [...document.querySelectorAll(".checkliste input")];
const stand = document.getElementById("liste-stand");
const zuruecksetzen = document.getElementById("liste-reset");

function lies() {
  try { return JSON.parse(localStorage.getItem(SPEICHER)) ?? {}; } catch { return {}; }
}

function schreibe(werte) {
  try { localStorage.setItem(SPEICHER, JSON.stringify(werte)); } catch { /* Ohne Speicher geht die Liste trotzdem. */ }
}

function zeigeStand() {
  const erledigt = haken.filter((h) => h.checked).length;
  stand.textContent = `${erledigt} von ${haken.length} erledigt`;
}

function merke() {
  schreibe(Object.fromEntries(haken.map((h) => [h.id, h.checked])));
  zeigeStand();
}

const gespeichert = lies();
haken.forEach((h) => {
  h.checked = Boolean(gespeichert[h.id]);
  h.addEventListener("change", merke);
});
zuruecksetzen.addEventListener("click", () => {
  haken.forEach((h) => { h.checked = false; });
  merke();
});
zeigeStand();
