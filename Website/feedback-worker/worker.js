/* SkiTag · Feedback-Worker (Cloudflare Workers, kostenlos)
   Steht zwischen dem Feedback-Formular und FormSubmit und gibt dem Formular ein echtes Limit, das kein Besucher
   im Browser umgehen kann:
   - höchstens LIMIT_PRO_IP Antworten pro Tag und Internetanschluss (gezählt über einen Hash der IP, die IP selbst
     wird nicht gespeichert, der Zähler verfällt nach zwei Tagen),
   - höchstens LIMIT_GESAMT Antworten pro Tag insgesamt, egal von wie vielen Anschlüssen (schützt das Postfach,
     wenn viele Rechner gleichzeitig spammen),
   - nur von den Seiten in ERLAUBTE_HERKUNFT,
   - Nachricht Pflicht (10 bis 600 Zeichen), Vorname höchstens 40, Spam-Falle _honey, Spamwörter, höchstens 8 KB.
   Die Zieladresse bei FormSubmit (am besten die Zufalls-Kennung statt der Mailadresse) steht nur hier als Secret
   FORMSUBMIT_ZIEL und nie in der Seite.
   Antwortet wie FormSubmit ({ success: "true" | "false", message }), damit feedback.js nichts Neues lernen muss.
   Ohne JavaScript (normales Formular) leitet der Worker nach dem Senden auf _next zurück.
   Einrichten: siehe LIESMICH.md im selben Ordner. */

const MIN_TEXT = 10, MAX_TEXT = 600, MAX_NAME = 40, MAX_BYTES = 8192;
const SPAMWOERTER = ["viagra", "cialis", "casino", "porn", "bitcoin", "crypto", "forex", "loan", "seo service", "backlinks"];
const FELDER = ["Bewertung", "Wer", "Am wichtigsten", "Nachricht", "Vorname"];
// Felder des Formulars ohne JavaScript (name-Attribute) → Felder der E-Mail
const FORM_FELDER = { wetter: "Bewertung", wer: "Wer", wichtig: "Am wichtigsten", nachricht: "Nachricht", vorname: "Vorname" };
// Klartext für das Formular ohne JavaScript (mit JavaScript übersetzt feedback.js die Kürzel selbst)
const TEXT = {
  "limit-ip": "Von diesem Anschluss sind heute schon genug Antworten gekommen. Danke! Morgen geht es wieder.",
  "limit-gesamt": "Heute sind schon sehr viele Antworten gekommen. Bitte versuch es morgen wieder oder schreib uns an skitag.team@gmail.com."
};
const WETTER = ["Schneesturm (gefällt mir gar nicht)", "Nebel (eher nicht)", "Bewölkt (geht so)", "Sonnig (gefällt mir)", "Pulvertag (richtig gut)"];

export default {
  async fetch(request, env) {
    const erlaubt = String(env.ERLAUBTE_HERKUNFT || "").split(",").map((s) => s.trim()).filter(Boolean);
    const herkunft = request.headers.get("Origin") || "";
    const herkunftOk = erlaubt.includes(herkunft);
    const cors = herkunftOk ? { "Access-Control-Allow-Origin": herkunft, "Vary": "Origin" } : { "Vary": "Origin" };

    if (request.method === "OPTIONS") {
      if (!herkunftOk) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type, Accept", "Access-Control-Max-Age": "86400" } });
    }
    const json = (status, success, message, extra) =>
      new Response(JSON.stringify({ success: success ? "true" : "false", message }), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8", ...(extra || {}) } });

    if (request.method !== "POST") return json(405, false, "Nur POST.");
    if (!herkunftOk) return json(403, false, "Diese Seite darf hier nicht senden.");
    if (!env.FORMSUBMIT_ZIEL || !env.ZAEHLER) return json(500, false, "Worker ist nicht fertig eingerichtet.");

    const laenge = Number(request.headers.get("Content-Length") || 0);
    if (laenge > MAX_BYTES) return json(413, false, "Zu groß.");
    const roh = await request.text();
    if (roh.length > MAX_BYTES) return json(413, false, "Zu groß.");

    // Eingabe lesen: JSON (mit JavaScript) oder normales Formular (ohne JavaScript)
    const typ = request.headers.get("Content-Type") || "";
    const ohneJs = /application\/x-www-form-urlencoded/i.test(typ);
    let daten = {}, honig = "", weiter = "";
    try {
      if (ohneJs) {
        const f = new URLSearchParams(roh);
        for (const [name, feld] of Object.entries(FORM_FELDER)) {
          const werte = f.getAll(name);
          if (werte.length) daten[feld] = name === "wetter" ? (WETTER[Math.round(Number(werte[0]))] || "") : werte.join(", ");
        }
        honig = f.get("_honey") || "";
        weiter = f.get("_next") || "";
      } else {
        const j = JSON.parse(roh);
        if (!j || typeof j !== "object" || Array.isArray(j)) throw new Error();
        for (const feld of FELDER) if (j[feld] != null) daten[feld] = String(j[feld]);
        honig = j._honey ? String(j._honey) : "";
      }
    } catch (e) {
      return json(400, false, "Ungültige Anfrage.");
    }
    // _next nur auf eine erlaubte Seite (sonst könnte man den Worker als offene Weiterleitung missbrauchen)
    const zurueck = (() => { try { const u = new URL(weiter); return erlaubt.includes(u.origin) ? u.href : ""; } catch (e) { return ""; } })() || (herkunft + "/");
    const fertig = (ok, message, status) => ohneJs
      ? (ok ? Response.redirect(zurueck, 303) : new Response(TEXT[message] || message, { status: status || 400, headers: { "Content-Type": "text/plain; charset=utf-8" } }))
      : json(ok ? 200 : status || 400, ok, message);

    // Spam-Falle: so tun, als wäre alles gut
    if (honig) return fertig(true, "ok");

    const sauber = (w, max) => String(w || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
    for (const feld of FELDER) daten[feld] = sauber(daten[feld], feld === "Nachricht" ? MAX_TEXT : feld === "Vorname" ? MAX_NAME : 200);
    if (daten.Nachricht.length < MIN_TEXT) return fertig(false, "Die Nachricht braucht mindestens " + MIN_TEXT + " Zeichen.", 422);
    const klein = FELDER.map((f) => daten[f]).join(" ").toLowerCase();
    if (SPAMWOERTER.some((w) => klein.includes(w))) return fertig(true, "ok");   // still verwerfen

    // Zähler: pro Anschluss und gesamt, je Kalendertag (UTC)
    const tag = new Date().toISOString().slice(0, 10);
    const ip = request.headers.get("CF-Connecting-IP") || "unbekannt";
    const hash = await sha256(tag + "|" + ip + "|" + env.FORMSUBMIT_ZIEL);
    const kIp = "ip:" + tag + ":" + hash.slice(0, 32), kGesamt = "gesamt:" + tag;
    const [nIp, nGesamt] = await Promise.all([env.ZAEHLER.get(kIp), env.ZAEHLER.get(kGesamt)]).then((a) => a.map((v) => Number(v) || 0));
    const limitIp = Number(env.LIMIT_PRO_IP) || 10, limitGesamt = Number(env.LIMIT_GESAMT) || 100;
    if (nIp >= limitIp) return fertig(false, "limit-ip", 429);
    if (nGesamt >= limitGesamt) return fertig(false, "limit-gesamt", 429);

    // An FormSubmit weitergeben
    const an = {};
    for (const feld of FELDER) an[feld] = daten[feld] || (feld === "Nachricht" ? "keine" : "keine Angabe");
    an._subject = "Neues Feedback über die SkiTag-Website";
    an._template = "table";
    an._captcha = "false";
    let r, d = {};
    try {
      r = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(env.FORMSUBMIT_ZIEL), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Origin": herkunft, "Referer": herkunft + "/" },
        body: JSON.stringify(an)
      });
      d = await r.json().catch(() => ({}));
    } catch (e) {
      return fertig(false, "FormSubmit nicht erreichbar.", 502);
    }
    if (!r.ok || String(d.success) !== "true") return fertig(false, String(d.message || "FormSubmit hat abgelehnt."), 502);

    // erst nach Erfolg zählen; Zähler verfallen nach zwei Tagen von selbst
    await Promise.all([
      env.ZAEHLER.put(kIp, String(nIp + 1), { expirationTtl: 172800 }),
      env.ZAEHLER.put(kGesamt, String(nGesamt + 1), { expirationTtl: 172800 })
    ]);
    return fertig(true, "ok");
  }
};

async function sha256(text) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");
}
