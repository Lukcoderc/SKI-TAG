// Gierige Auswahl für Kreise: nimmt immer die Station, deren Kreis die meisten noch fehlenden Pistenpunkte dazugewinnt.
// Wird von der Karte in Kapitel 9 und von tools/abdeckung-tabelle.mjs gleich verwendet.
function waehleKreise(gateways, punkte, radiusPx, zielProzent = 95) {
  const r2 = radiusPx * radiusPx;
  const drin = gateways.map((g) => punkte.map(([x, y]) => (x - g.x) ** 2 + (y - g.y) ** 2 <= r2));
  const erreicht = new Uint8Array(punkte.length);
  const wahl = [];
  let zahl = 0;
  while (zahl * 100 < zielProzent * punkte.length) {
    let beste = -1, gewinn = 0;
    drin.forEach((d, k) => {
      if (wahl.includes(k)) return;
      let n = 0;
      for (let i = 0; i < d.length; i++) if (d[i] && !erreicht[i]) n++;
      if (n > gewinn) { gewinn = n; beste = k; }
    });
    if (beste < 0) break;
    wahl.push(beste);
    drin[beste].forEach((v, i) => { if (v && !erreicht[i]) { erreicht[i] = 1; zahl++; } });
  }
  return { wahl, anteil: (zahl / punkte.length) * 100, erreicht };
}
