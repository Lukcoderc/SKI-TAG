// Karte der Abdeckung: mit Gelände gerechnet oder als Kreis. Die Karte wählt jeweils die wenigsten Stationen für 95 % der Pisten
// und erklärt für einen Pistenpunkt, woher sein Signal kommt und was Strecke und Gelände kosten.
(function () {
  const GUT_DBM = -115;
  const KNAPP_DBM = -125;
  const SENDE_DBM = 20, GATEWAY_DBI = 3, GATEWAY_H = 8, CHIP_H = 1.2, FREQ_MHZ = 869.525;
  const KREIS_ZUSCHLAG = 10;
  const ORT_RAND = 44;
  const { breite, hoehe, punkte, gateways, orte } = window.ABDECKUNG;
  const { proKm, pisten, lifte, raster } = window.KARTE;
  const $ = (id) => document.getElementById(id);
  const karte = $("abd-karte"), profil = $("abd-profil");
  const art = $("abd-art"), ziel = $("abd-ziel"), zuschlag = $("abd-zuschlag"), radius = $("abd-radius");

  const ZUSCHLAG_TEXT = {
    0: "Nur Entfernung und Gelände, sonst nichts. Das ist zu optimistisch.",
    10: "Die Annahme des Modells: Verlust durch den Körper und die kleine Antenne im Chip.",
    20: "10 dB mehr Reserve, etwa für Schnee über dem Chip. Gemessen ist das nicht.",
    30: "20 dB mehr Reserve, etwa für einen Chip am Waldrand. Gemessen ist das nicht.",
    36.5: "Der schlimme Fall: Körper und Chip-Antenne und dazu dichter Wald, bis 26,5 dB nach ITU-R P.833.",
  };

  // Höhen aus dem Raster, bilinear
  const roh = Uint8Array.from(atob(raster.werte), (z) => z.charCodeAt(0));
  const hoehen = new Int16Array(roh.buffer);
  const hoeheBei = (x, y) => {
    const u = Math.min(Math.max(x / raster.schritt, 0), raster.b - 1.001), v = Math.min(Math.max(y / raster.schritt, 0), raster.h - 1.001);
    const i = Math.floor(u), j = Math.floor(v), a = u - i, b = v - j, h = (p, q) => hoehen[q * raster.b + p];
    return h(i, j) * (1 - a) * (1 - b) + h(i + 1, j) * a * (1 - b) + h(i, j + 1) * (1 - a) * b + h(i + 1, j + 1) * a * b;
  };

  const svg = (name, attr, ziel = karte) => {
    const e = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attr)) e.setAttribute(k, v);
    ziel.append(e);
    return e;
  };
  karte.setAttribute("viewBox", `0 0 ${breite} ${hoehe}`);
  svg("image", { href: "assets/karte-relief.png", x: 0, y: 0, width: breite, height: hoehe, preserveAspectRatio: "none" });
  svg("path", { class: "karte-piste", d: pisten });
  svg("path", { class: "karte-lift", d: lifte });
  const kreise = svg("g", { class: "abd-kreise" });
  const spuren = { gut: svg("path", { class: "abd-gut" }), knapp: svg("path", { class: "abd-knapp" }), kein: svg("path", { class: "abd-kein" }) };
  const linie = svg("line", { class: "abd-linie" });
  const ring = svg("circle", { class: "abd-wahl", r: 13 });
  const marken = gateways.map((g) => svg("rect", { x: g.x - 7, y: g.y - 7, width: 14, height: 14, transform: `rotate(45 ${g.x} ${g.y})`, class: "abd-gateway" }));
  orte.forEach((o) => { svg("text", { x: o.x, y: Math.max(o.y, ORT_RAND), class: "abd-ort" }).textContent = o.name; });

  const km = (k, i) => Math.hypot(gateways[k].x - punkte[i][0], gateways[k].y - punkte[i][1]) / proKm;
  const strecke = (d) => 32.44 + 20 * Math.log10(Math.max(d, 0.01)) + 20 * Math.log10(FREQ_MHZ);
  const stufeVon = (dbm) => (dbm >= GUT_DBM ? "gut" : dbm >= KNAPP_DBM ? "knapp" : "kein");

  let gewaehlt = -1, vonHand = false, stand = null;

  function gelaende() {
    const noetig = ziel.value === "zwei" ? 2 : 1, z = +zuschlag.value;
    const { wahl } = waehleStationen(gateways, punkte.length, z, GUT_DBM, noetig);
    const gut = Math.round((GUT_DBM + z) * 10), knapp = Math.round((KNAPP_DBM + z) * 10);
    const stufe = punkte.map((_, i) => {
      const pegel = wahl.map((k) => gateways[k].pegel[i]);
      const zahl = pegel.filter((p) => p >= gut).length;
      if (zahl >= noetig) return "gut";
      return zahl > 0 || pegel.some((p) => p >= knapp) ? "knapp" : "kein";
    });
    // Quelle eines Punkts: die gewählte Station mit dem stärksten Signal
    const quelle = (i) => wahl.reduce((b, k) => (b < 0 || gateways[k].pegel[i] > gateways[b].pegel[i] ? k : b), -1);
    const schlimmst = () => punkte.reduce((b, _, i) => (b < 0 || gateways[quelle(i)].pegel[i] < gateways[quelle(b)].pegel[b] ? i : b), -1);
    return { wahl, stufe, z, r: 0, quelle, schlimmst };
  }

  function kreis() {
    const r = +radius.value * proKm;
    const { wahl, erreicht } = waehleKreise(gateways, punkte, r);
    const quelle = (i) => wahl.reduce((b, k) => (b < 0 || km(k, i) < km(b, i) ? k : b), -1);
    // Am meisten zeigt ein Punkt im Kreis, der nach dem Gelände trotzdem ein Funkloch ist
    const schlimmst = () => {
      let best = -1, wert = Infinity;
      punkte.forEach((_, i) => {
        const p = gateways[quelle(i)].pegel[i] - (erreicht[i] ? 10000 : 0);
        if (p < wert) { wert = p; best = i; }
      });
      return best;
    };
    return { wahl, stufe: punkte.map((_, i) => (erreicht[i] ? "gut" : "kein")), z: KREIS_ZUSCHLAG, r, quelle, schlimmst, erreicht };
  }

  function zeichneProfil(k, i) {
    profil.replaceChildren();
    const W = 320, H = 150, L = 6, R = 6, O = 20, U = 22, N = 120;
    profil.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const g = gateways[k], [px, py] = punkte[i], d = km(k, i);
    const boden = Array.from({ length: N + 1 }, (_, n) => hoeheBei(g.x + ((px - g.x) * n) / N, g.y + ((py - g.y) * n) / N));
    const hA = boden[0] + GATEWAY_H, hB = boden[N] + CHIP_H;
    const sicht = (n) => hA + ((hB - hA) * n) / N;
    const lo = Math.min(...boden) - 40, hi = Math.max(...boden, hA) + 60;
    const X = (n) => L + ((W - L - R) * n) / N, Y = (h) => O + ((H - O - U) * (hi - h)) / (hi - lo);
    svg("path", { class: "profil-gelaende", d: `M${X(0)} ${H - U}` + boden.map((h, n) => `L${X(n).toFixed(1)} ${Y(h).toFixed(1)}`).join("") + `L${X(N)} ${H - U}Z` }, profil);
    let grat = "";
    boden.forEach((h, n) => { if (n > 0 && n < N && h > sicht(n)) grat += `${grat && boden[n - 1] > sicht(n - 1) ? "L" : "M"}${X(n).toFixed(1)} ${Y(h).toFixed(1)}`; });
    if (grat) svg("path", { class: "profil-grat", d: grat }, profil);
    svg("line", { class: "profil-sicht", x1: X(0), y1: Y(hA), x2: X(N), y2: Y(hB) }, profil);
    svg("rect", { class: "profil-gateway", x: X(0) - 4, y: Y(hA) - 4, width: 8, height: 8, transform: `rotate(45 ${X(0)} ${Y(hA)})` }, profil);
    svg("circle", { class: "profil-punkt", cx: X(N), cy: Y(hB), r: 4 }, profil);
    const text = (x, y, t, anker) => { svg("text", { x, y, "text-anchor": anker }, profil).textContent = t; };
    text(L, 13, `${g.name.replace(/ (oben|unten)$/, "")}, ${Math.round(boden[0])} m`, "start");
    text(W - R, 13, `Piste, ${Math.round(boden[N])} m`, "end");
    text(L, H - 6, "0 km", "start");
    text(W - R, H - 6, `${zahlDe(d, 1)} km`, "end");
    return boden.some((h, n) => n > 0 && n < N && h > sicht(n));
  }

  function erklaere(i) {
    const { quelle, z, r, erreicht } = stand;
    const k = quelle(i), g = gateways[k], d = km(k, i);
    const pegel = g.pegel[i] / 10, frei = strecke(d), gel = Math.max(0, SENDE_DBM + GATEWAY_DBI - frei - pegel), an = pegel - z;
    const stufe = stufeVon(an);
    ring.setAttribute("cx", punkte[i][0]); ring.setAttribute("cy", punkte[i][1]);
    linie.setAttribute("x1", g.x); linie.setAttribute("y1", g.y); linie.setAttribute("x2", punkte[i][0]); linie.setAttribute("y2", punkte[i][1]);
    linie.setAttribute("class", stufe === "kein" ? "abd-linie loch" : "abd-linie");
    const blockiert = zeichneProfil(k, i);

    const urteil = { gut: "Gutes Signal.", knapp: "Nur knappes Signal: Es kommt an, aber schon kleine Störungen reichen.", kein: "Funkloch: Hier kommt kein Notruf sicher an." }[stufe];
    const warum = d < 0.05 ? "Der Punkt liegt direkt an der Station."
      : blockiert ? `Das Gelände ragt in die Sichtlinie zwischen Gateway und Piste, im Schnitt rot. Das kostet hier ${zahlDe(gel)} dB.`
      : gel >= 6 ? `Kein Grat schneidet die Sichtlinie, aber das Gelände kommt ihr nahe. Auch das kostet ${zahlDe(gel)} dB, siehe Kapitel 8.`
      : "Freie Sicht: Das Gelände kostet kaum etwas, es zählt fast nur die Entfernung.";
    let kopf;
    if (art.value === "kreis") {
      const drin = erreicht[i] ? `Der Punkt liegt im Kreis von ${g.name}, ${zahlDe(d, 1)} km entfernt.` : `Der Punkt liegt außerhalb aller Kreise, ${g.name} ist ${zahlDe(d, 1)} km entfernt.`;
      const satz = { gut: "kommt hier gutes Signal an", knapp: "kommt hier nur knappes Signal an", kein: "ist hier ein Funkloch" }[stufe];
      const taeuscht = (erreicht[i] && stufe === "kein") || (!erreicht[i] && stufe === "gut") ? " Der Kreis täuscht hier." : "";
      kopf = `${drin} Mit Gelände und ${KREIS_ZUSCHLAG} dB Zuschlag gerechnet ${satz}.${taeuscht}`;
    } else {
      kopf = `Das stärkste Signal kommt von ${g.name}, ${zahlDe(d, 1)} km entfernt. ${urteil}`;
    }
    $("abd-punkt-text").textContent = `${kopf} ${warum}`;
    $("abd-punkt-rechnung").textContent = `${SENDE_DBM} dBm Sendeleistung + ${GATEWAY_DBI} dBi Antenne − ${zahlDe(frei)} dB Strecke − ${zahlDe(gel)} dB Gelände − ${zahlDe(z, z % 1 ? 1 : 0)} dB Zuschlag = ${zahlDe(an)} dBm. Gut ab −115 dBm, knapp ab −125 dBm.`;
  }

  function zeichne() {
    const mitKreis = art.value === "kreis";
    $("abd-gelaende").hidden = mitKreis;
    $("abd-kreis").hidden = !mitKreis;
    stand = mitKreis ? kreis() : gelaende();
    const { wahl, stufe, r } = stand;

    const wege = { gut: [], knapp: [], kein: [] };
    stufe.forEach((s, i) => wege[s].push(`M${punkte[i][0]} ${punkte[i][1]}h0`));
    Object.keys(spuren).forEach((k) => spuren[k].setAttribute("d", wege[k].join("")));
    kreise.replaceChildren(...(mitKreis ? wahl.map((k) => {
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("cx", gateways[k].x); c.setAttribute("cy", gateways[k].y); c.setAttribute("r", r);
      return c;
    }) : []));
    marken.forEach((m, k) => m.setAttribute("class", wahl.includes(k) ? "abd-gateway an" : "abd-gateway"));

    const anteil = (wege.gut.length / punkte.length) * 100;
    $("abd-zahl").textContent = wahl.length;
    $("abd-anteil").textContent = `${zahlDe(anteil, 1)} %`;
    $("abd-zuschlag-text").textContent = ZUSCHLAG_TEXT[zuschlag.value];
    const hinweis = $("abd-hinweis");
    hinweis.hidden = anteil >= 95;
    hinweis.textContent = mitKreis
      ? "Mit diesem Radius erreichen auch alle Liftstationen zusammen keine 95 %."
      : "Mehr Stationen helfen hier nicht mehr: An den roten Stellen kommt von keiner der 59 Liftstationen genug Signal an.";
    $("abd-liste").replaceChildren(...wahl.map((k) => {
      const li = document.createElement("li");
      li.textContent = `${gateways[k].name}, ${gateways[k].hoehe} m`;
      return li;
    }));
    if (!vonHand || gewaehlt < 0) gewaehlt = stand.schlimmst();
    erklaere(gewaehlt);
  }

  karte.addEventListener("click", (e) => {
    const p = karte.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(karte.getScreenCTM().inverse());
    let best = -1, abstand = 30;
    punkte.forEach(([x, y], i) => { const a = Math.hypot(x - q.x, y - q.y); if (a < abstand) { abstand = a; best = i; } });
    if (best < 0) return;
    gewaehlt = best; vonHand = true;
    erklaere(best);
  });
  $("abd-schlimmst").addEventListener("click", () => { vonHand = false; zeichne(); });
  [art, ziel, zuschlag, radius].forEach((e) => e.addEventListener("change", zeichne));
  zeichne();
})();
