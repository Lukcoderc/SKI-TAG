// Zeigt, wie lange ein Befehl des Servers wartet, bis der Chip sein nächstes Paket sendet.
const zeitRegler = document.getElementById("warte-zeit");
const FENSTER_S = 8;
const FALL = {
  normal: { takt: 20, text: "Der Chip ist unterwegs und sendet alle 20 Sekunden." },
  ladebox: { takt: 60, text: "Der Chip liegt in der Ladebox und sendet nur alle 60 Sekunden." },
  notruf: { takt: 8, text: "Der Chip wiederholt seinen Notruf alle 4 bis 8 Sekunden, nach 6 Versuchen nur noch alle 15 bis 25 Sekunden." },
};
const fallKnoepfe = [...document.querySelectorAll("[data-fall]")];
let fall = "normal";

function zeigeWartezeit() {
  const { takt, text } = FALL[fall];
  zeitRegler.max = takt - 1;
  const jetzt = Math.min(+zeitRegler.value, takt - 1);
  const naechstes = ((FENSTER_S % takt) - jetzt + takt) % takt;
  document.getElementById("warte-sekunde").textContent = `Sekunde ${jetzt}`;
  document.getElementById("warte-ergebnis").textContent = `${naechstes} s`;
  document.getElementById("warte-max").textContent = `${takt} s`;
  document.getElementById("warte-text").textContent = text;
  const breite = 100 / takt;
  const balken = document.getElementById("warte-weg");
  balken.style.left = `${jetzt * breite}%`;
  balken.style.width = `${Math.min(naechstes, takt - jetzt) * breite}%`;
  document.getElementById("warte-paket").style.left = `${(FENSTER_S % takt) * breite}%`;
}

fallKnoepfe.forEach((knopf) => knopf.addEventListener("click", () => {
  fall = knopf.dataset.fall;
  fallKnoepfe.forEach((k) => { k.dataset.an = String(k === knopf); });
  zeigeWartezeit();
}));
zeitRegler.addEventListener("input", zeigeWartezeit);
zeigeWartezeit();
