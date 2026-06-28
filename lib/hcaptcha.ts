"use server";

export async function verifyHcaptcha(token: string): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    // In sviluppo: salta la verifica se la chiave non è configurata.
    // In produzione: fail-closed — senza chiave NON si passa, così una
    // env var mancante non disattiva silenziosamente il captcha.
    if (process.env.NODE_ENV === "production") {
      console.error("HCAPTCHA_SECRET_KEY mancante in produzione — richiesta rifiutata.");
      return false;
    }
    return true;
  }

  const res = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`,
  });
  const data = await res.json();
  return data.success === true;
}
