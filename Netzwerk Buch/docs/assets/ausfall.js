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
    "name": "Funkloch oder gestörter Kanal",
    "notruf": "Kommt nicht an, solange der Chip kein Gateway erreicht.",
    "chip": "Warnt nach 90 Sekunden und wiederholt weiter.",
    "wer": "Niemand. Für den Server sieht ein Funkloch aus wie ein Chip, der nichts zu melden hat."
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
    "name": "Server vor dem ACK",
    "notruf": "Kommt nicht an. Der Chip wiederholt weiter, nach dem Neustart kann er durchkommen.",
    "chip": "Warnt nach 90 Sekunden.",
    "wer": "Niemand automatisch. Auch die Ausgabe-Seite ist dann weg."
  },
  {
    "name": "Server direkt nach dem ACK",
    "notruf": "Wird nicht dauerhaft gespeichert, ist er verloren. Der Chip wiederholt nicht mehr.",
    "chip": "Heute keine Warnung, der Chip hat ja ein ACK. Vorschlag: Warnung 180 s nach dem ersten Senden.",
    "wer": "Niemand. Das verhindert nur die Regel aus Kapitel 11: erst speichern, dann ACK."
  },
  {
    "name": "Stromausfall am Server",
    "notruf": "Wie bei einem Absturz. Nach dem Neustart muss der Server offene Notrufe wieder aufnehmen.",
    "chip": "Warnt nach 90 Sekunden, solange kein ACK kam.",
    "wer": "Niemand automatisch."
  },
  {
    "name": "Internet am Server",
    "notruf": "Erreicht das Gateway den Server noch, nimmt er den Notruf an. Die Apps bekommen ihn aber nicht.",
    "chip": "Der Chip bekommt ein ACK und warnt heute deshalb nicht. Vorschlag: Warnung 180 s nach dem ersten Senden.",
    "wer": "Niemand. Das ist die gefährlichste Lücke."
  },
  {
    "name": "App geschlossen oder Handy ohne Netz",
    "notruf": "Der Server wartet heute 60 Sekunden, dann ist der nächste Mitarbeiter dran. Er merkt nicht, dass nichts ankam. Vorschlag: Weitergabe nach 15 s ohne Zustellung.",
    "chip": "Hat ein ACK, aber kein HELP 1. Er zeigt also keine Übernahme. Vorschlag: Warnung 180 s nach dem ersten Senden.",
    "wer": "Niemand, solange noch ein Mitarbeiter übrig ist."
  },
  {
    "name": "Niemand übernimmt",
    "notruf": "Was nach dem letzten Mitarbeiter geschieht, ist nicht festgelegt.",
    "chip": "Kein HELP 1. Vorschlag: Warnung 180 s nach dem ersten Senden.",
    "wer": "Nicht geregelt. Vorschlag: Zeitablauf aus Kapitel 13, der Leitstand erfährt es bei T0 + 120 s."
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
