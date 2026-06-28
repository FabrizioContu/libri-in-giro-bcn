#!/usr/bin/env node
// PreToolUse hook: blocca le modifiche ai file di secrets (.env*).
// Riceve l'evento JSON su stdin; esce con codice 2 per bloccare la tool.
// Eccezioni consentite: *.example e *.sample (template senza segreti).
import path from "node:path";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    // Se non arriva stdin (invocazione manuale a vuoto), non bloccare.
    if (process.stdin.isTTY) resolve("");
  });
}

const raw = await readStdin();

let fp = "";
try {
  fp = JSON.parse(raw || "{}").tool_input?.file_path ?? "";
} catch {
  // JSON malformato: non è compito di questo hook fallire, lascia passare.
  process.exit(0);
}

const base = path.basename(fp);
const isEnv = base === ".env" || base.startsWith(".env.");
const isTemplate = base.endsWith(".example") || base.endsWith(".sample");

if (isEnv && !isTemplate) {
  console.error(
    `🔒 Modifica bloccata: "${fp}" è un file di secrets.\n` +
      `I file .env contengono TELEGRAM_BOT_TOKEN, HCAPTCHA_SECRET_KEY e le chiavi Supabase.\n` +
      `Modificalo manualmente se davvero necessario.`
  );
  process.exit(2);
}

process.exit(0);
