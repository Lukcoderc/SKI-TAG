# Feedback-Worker: echtes Tageslimit für das Feedback-Formular

Die Website liegt auf GitHub Pages und hat keinen eigenen Server. Ein Limit nur im Browser (`localStorage` in
`site/assets/feedback.js`) bremst normale Besucher, lässt sich aber umgehen. Dieser kleine Cloudflare Worker
(kostenlos, 100 000 Anfragen pro Tag) steht deshalb zwischen Formular und FormSubmit und zählt auf dem Server:

| Schutz | Wert | Einstellbar über |
|---|---|---|
| Antworten pro Tag und Internetanschluss | 10 | `LIMIT_PRO_IP` |
| Antworten pro Tag insgesamt | 100 | `LIMIT_GESAMT` |
| Erlaubte Seiten | `https://lukcoderc.github.io` | `ERLAUBTE_HERKUNFT` (kommagetrennt) |
| Nachricht | 10 bis 600 Zeichen, Pflicht | `worker.js` |
| Spam-Falle `_honey`, Spamwörter, höchstens 8 KB | still verworfen | `worker.js` |

Die IP-Adresse wird nicht gespeichert, nur ein Hash mit Datum; die Zähler verfallen nach zwei Tagen.
Gezählt wird nach UTC-Tag (neuer Tag um 1 Uhr Wiener Zeit, im Sommer um 2 Uhr).
Die Adresse bei FormSubmit steht nur im Worker (Secret `FORMSUBMIT_ZIEL`), nicht mehr in der Seite.

## Einrichten im Cloudflare-Dashboard (ohne Kommandozeile)

1. Kostenloses Konto auf dash.cloudflare.com anlegen.
2. **Storage & Databases → KV → Create namespace**, Name `skitag-feedback-zaehler`.
3. **Compute (Workers) → Workers & Pages → Create → Worker**, Name `skitag-feedback`, „Hello World“ deployen.
4. **Edit code**: den ganzen Inhalt von `worker.js` hineinkopieren, **Deploy**.
5. Im Worker unter **Settings → Bindings → Add → KV namespace**: Variablenname `ZAEHLER`, Namespace aus Schritt 2.
6. Unter **Settings → Variables and Secrets**:
   - `FORMSUBMIT_ZIEL` als **Secret**: am besten die Zufalls-Kennung aus der Bestätigungsmail von FormSubmit,
     sonst `skitag.team@gmail.com`.
   - `ERLAUBTE_HERKUNFT` = `https://lukcoderc.github.io` (später die eigene Domain mit Komma dahinter ergänzen)
   - `LIMIT_PRO_IP` = `10`, `LIMIT_GESAMT` = `100`
7. Die Adresse des Workers notieren (`https://skitag-feedback.<name>.workers.dev`).

## Formular umstellen

In `site/feedback.html` am `<form class="fb__karte">`:

- `data-worker="https://skitag-feedback.<name>.workers.dev"` ergänzen (mit JavaScript geht die Antwort dann an den Worker),
- `action` auf dieselbe Worker-Adresse setzen (ohne JavaScript ebenso).

Danach eine Testantwort schicken und im Postfach (Label „Website-Feedback“) nachsehen.

## Ehrlich: was der Worker nicht verhindert

Solange FormSubmit die Mailadresse direkt annimmt, kann jemand, der die Adresse kennt, am Worker vorbei an
`formsubmit.co/skitag.team@gmail.com` schicken. Dagegen hilft nur, dass FormSubmit allein die Zufalls-Kennung kennt
und die Adresse nirgends mehr auf der Seite steht. FormSubmit selbst bietet laut seiner Doku kein Limit und keine
Sperre auf eine Domain. Wer das ganz zu haben will, schickt die Mails später direkt vom eigenen Server.
