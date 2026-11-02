// Suche über alle Seiten. Die Daten erzeugt tools/suchindex.mjs.
(function () {
  window.Suche = true;
  const feld = document.querySelector(".suche input");
  const liste = document.querySelector(".kapitel-nav details > ol");
  const treffer = document.createElement("ol");
  treffer.className = "treffer";
  treffer.hidden = true;
  liste.before(treffer);
  const klein = (s) => s.toLocaleLowerCase("de");
  const daten = window.SUCHE.map((e) => ({ ...e, roh: klein(e.t + " " + e.x) }));

  function zeige() {
    const worte = klein(feld.value).split(/\s+/).filter((w) => w.length > 1);
    treffer.replaceChildren();
    treffer.hidden = !worte.length;
    liste.hidden = !!worte.length;
    if (!worte.length) return;
    const gefunden = daten.filter((e) => worte.every((w) => e.roh.includes(w))).slice(0, 10);
    for (const e of gefunden) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = e.s + (e.a ? "#" + e.a : "");
      a.textContent = e.t;
      const wo = document.createElement("span");
      wo.textContent = e.k;
      li.append(a, wo);
      treffer.append(li);
    }
    if (!gefunden.length) {
      const li = document.createElement("li");
      li.textContent = "Nichts gefunden";
      treffer.append(li);
    }
  }
  feld.addEventListener("input", zeige);
  zeige();
})();
