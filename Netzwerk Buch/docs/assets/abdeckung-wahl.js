// Gierige Auswahl: nimmt immer die Station, die die meisten noch fehlenden Pistenpunkte dazugewinnt.
// Pegel und Schwellen sind Zehntel dBm, damit Karte, Tabelle und Prüfskript exakt gleich rechnen.
function waehleStationen(gateways, punktZahl, zuschlagDb, schwelleDbm, noetig = 1, zielProzent = 95) {
  const grenze = Math.round((schwelleDbm + zuschlagDb) * 10);
  const zaehler = new Int16Array(punktZahl);
  const wahl = [];
  let erreicht = 0;
  while (erreicht * 100 < zielProzent * punktZahl) {
    let beste = -1, gewinn = 0;
    gateways.forEach((g, k) => {
      if (wahl.includes(k)) return;
      let n = 0;
      for (let i = 0; i < punktZahl; i++) if (zaehler[i] < noetig && g.pegel[i] >= grenze) n++;
      if (n > gewinn) { gewinn = n; beste = k; }
    });
    if (beste < 0) break;
    wahl.push(beste);
    for (let i = 0; i < punktZahl; i++) {
      if (gateways[beste].pegel[i] >= grenze && ++zaehler[i] === noetig) erreicht++;
    }
  }
  return { wahl, anteil: (erreicht / punktZahl) * 100 };
}
