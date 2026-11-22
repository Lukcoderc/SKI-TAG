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
Die Mails verschickt der Worker über Resend (kostenlos, 100 Mails pro Tag), weil FormSubmit Anfragen von
Cloudflare-Workern mit „Rate limit exceeded“ ablehnt (Cloudflare teilt seine Adressen mit vielen Nutzern).
Ohne eigene Domain schickt Resend nur an die Adresse des eigenen Kontos, deshalb läuft das Resend-Konto auf die
Team-Adresse. Ohne `RESEND_KEY` fällt der Worker auf FormSubmit zurück.

## Einrichten im Cloudflare-Dashboard (ohne Kommandozeile)

1. Kostenloses Konto auf dash.cloudflare.com anlegen.
2. **Storage & Databases → KV → Create namespace**, Name `skitag-feedback-zaehler`.
3. **Compute (Workers) → Workers & Pages → Create → Worker**, Name `skitag-feedback`, „Hello World“ deployen.
4. **Edit code**: den ganzen Inhalt von `worker.js` hineinkopieren, **Deploy**.
5. Im Worker unter **Settings → Bindings → Add → KV namespace**: Variablenname `ZAEHLER`, Namespace aus Schritt 2.
6. Unter **Settings → Variables and Secrets**:
   - `FORMSUBMIT_ZIEL` als **Secret**: die Adresse, an die die Mails gehen (die Team-Adresse).
   - `ERLAUBTE_HERKUNFT` = `https://lukcoderc.github.io` (später die eigene Domain mit Komma dahinter ergänzen)
   - `LIMIT_PRO_IP` = `10`, `LIMIT_GESAMT` = `100`
   - `RESEND_KEY` als **Secret**: API-Schlüssel aus resend.com (Konto mit der Team-Adresse, Berechtigung „Sending access“).
     Optional `ABSENDER`, sobald eine eigene Domain bei Resend bestätigt ist (sonst `onboarding@resend.dev`).
7. Die Adresse des Workers notieren (`https://skitag-feedback.<name>.workers.dev`).

## Formular umstellen

In `site/feedback.html` am `<form class="fb__karte">`:

- `data-worker="https://skitag-feedback.<name>.workers.dev"` ergänzen (mit JavaScript geht die Antwort dann an den Worker),
- `action` auf dieselbe Worker-Adresse setzen (ohne JavaScript ebenso).

Danach eine Testantwort schicken und im Postfach (Label „Website-Feedback“) nachsehen.

Stand 2026-11-22: umgestellt auf `https://skitag-feedback.skitag.workers.dev/`. Einen Rückfall auf FormSubmit gibt
es im Formular nicht mehr.

## Ehrlich: was der Worker nicht verhindert

Der Resend-Schlüssel liegt nur im Worker, am Worker vorbei kommt also niemand an Resend. FormSubmit nimmt zwar
weiter Formulare für die Team-Adresse an und lässt sich nicht abschalten; deshalb schiebt ein Gmail-Filter alle Mails
von `submissions@formsubmit.co` in den Papierkorb. Die Mailadresse selbst ist öffentlich und kann wie jede Adresse
normalen Spam bekommen, das filtert Gmail.

Eingerichtet am 2026-11-22 im Cloudflare-Konto von Lukas (Worker `skitag-feedback`, KV `skitag-feedback-zaehler`).
