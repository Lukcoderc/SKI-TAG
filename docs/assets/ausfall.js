// Spielt Ausfälle durch: Auswahl links, Folgen für Notruf, Chip und Betrieb darunter.
const AUSFAELLE = [
  {
    "name": "Ein Gateway, ein zweites hört mit",
    "notruf": "Kommt an. Der Server nutzt das zweite Gateway.",
    "chip": "Nichts Ungewöhnliches.",
    "wer": "Die Ausgabe-Seite zeigt das Gateway nach 30 Sekunden als „weg“. Benachrichtigt wird niemand."
  },
  {
    "name": "Das einzige Gateway in Reichweite",
    "notruf": "Kommt nicht an. Der Chip wiederholt ihn weiter.",
    "chip": "Nach 90 Sekunden blinkt er rot doppelt und vibriert jede Minute. Das heißt: 140 rufen.",
    "wer": "Die Ausgabe-Seite zeigt es nach 30 Sekunden. Benachrichtigt wird niemand."
  },
  {
    "name": "WLAN an der Station",
    "notruf": "Das Gateway hört ihn und puffert bis zu 60 Pakete. Bei 5 Chips reicht das rund 4 Minuten. Erst wenn das Netz zurück ist, kommt er an.",
    "chip": "Warnt nach 90 Sekunden.",
    "wer": "Die Ausgabe-Seite zeigt das Gateway als „weg“."
  },
  {
    "name": "Strom an der Station",
    "notruf": "Wie beim Ausfall des Gateways. Der Inhalt des Puffers ist vermutlich verloren.",
    "chip": "Warnt nach 90 Sekunden, wenn kein anderes Gateway hört.",
    "wer": "Die Ausgabe-Seite zeigt das Gateway als „weg“."
  },
  {
    "name": "Der Server",
    "notruf": "Kommt nicht an, weder in der App noch sonst wo.",
    "chip": "Warnt nach 90 Sekunden.",
    "wer": "Niemand automatisch. Auch die Ausgabe-Seite ist dann weg."
  },
  {
    "name": "Internet am Server",
    "notruf": "Erreicht das Gateway den Server noch, nimmt er den Notruf an. Die Apps bekommen ihn aber nicht.",
    "chip": "Der Chip bekommt eventuell ein ACK und warnt deshalb nicht.",
    "wer": "Niemand. Das ist die gefährlichste Lücke."
  },
  {
    "name": "Handy des Mitarbeiters",
    "notruf": "Der Server wartet 60 Sekunden, dann ist der nächste Mitarbeiter dran.",
    "chip": "Hat ein ACK, aber noch kein HELP. Er zeigt also keine Annahme.",
    "wer": "Niemand, solange noch ein Mitarbeiter übrig ist."
  },
  {
    "name": "Niemand nimmt an",
    "notruf": "Was nach dem letzten Mitarbeiter geschieht, ist nicht beschrieben.",
    "chip": "Kein HELP, also keine Annahme am Chip.",
    "wer": "Nicht geregelt."
  },
  {
    "name": "GPS-Empfang",
    "notruf": "Kommt an, mit der Position des Gateways, markiert als „ungefähr“.",
    "chip": "Sendet weiter, ohne eigene Uhrzeit etwas zufällig versetzt.",
    "wer": "Der Mitarbeiter sieht, dass die Position ungefähr ist, wenn die App es anzeigt."
  }
];
const wahl = document.getElementById("aus-wahl");

function zeige(i) {
  document.getElementById("aus-notruf").textContent = AUSFAELLE[i].notruf;
  document.getElementById("aus-chip").textContent = AUSFAELLE[i].chip;
  document.getElementById("aus-wer").textContent = AUSFAELLE[i].wer;
}

AUSFAELLE.forEach((ausfall, i) => {
  const label = document.createElement("label");
  const feld = document.createElement("input");
  feld.type = "radio";
  feld.name = "ausfall";
  feld.checked = i === 0;
  feld.addEventListener("change", () => zeige(i));
  label.append(feld, ausfall.name);
  wahl.append(label);
});
zeige(0);
