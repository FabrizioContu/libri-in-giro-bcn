"use server";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyHcaptcha } from "@/lib/hcaptcha";
import { checkRateLimit } from "@/lib/rate-limit";
import { prestitoSchema } from "@/lib/validation";

export interface CreatePrestitoInput {
  libro_id: string;
  richiedente_contatto: string;
  richiedente_tipo: "telegram" | "whatsapp";
  proprietario_contatto: string;
  proprietario_tipo: "telegram" | "whatsapp";
  messaggio_richiedente: string | null;
  nodo_ritiro: string | null;
  captchaToken: string;
  honeypot: string;
}

export type CreatePrestitoResult =
  | { success: true; id: string; edit_token: string; notifySent: boolean }
  | { success: false; error: string };

export async function createPrestito(
  input: CreatePrestitoInput
): Promise<CreatePrestitoResult> {
  if (input.honeypot) return { success: false, error: "invalid" };

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const captchaOk = await verifyHcaptcha(input.captchaToken);
  if (!captchaOk)
    return { success: false, error: "Verifica di sicurezza fallita. Riprova." };

  const rateLimit = await checkRateLimit(ip, "create_prestito");
  if (!rateLimit.allowed)
    return {
      success: false,
      error: "Hai inviato troppe richieste di prestito. Riprova tra un'ora.",
    };

  const parsed = prestitoSchema.safeParse({
    libro_id: input.libro_id,
    richiedente_contatto: input.richiedente_contatto,
    richiedente_tipo: input.richiedente_tipo,
    proprietario_contatto: input.proprietario_contatto,
    proprietario_tipo: input.proprietario_tipo,
    messaggio_richiedente: input.messaggio_richiedente || null,
    nodo_ritiro: input.nodo_ritiro || null,
  });

  if (!parsed.success)
    return { success: false, error: "Dati non validi. Controlla i campi e riprova." };

  const { data, error } = await supabaseServer
    .from("prestiti")
    .insert({
      libro_id: parsed.data.libro_id,
      richiedente_contatto: parsed.data.richiedente_contatto,
      richiedente_tipo: parsed.data.richiedente_tipo,
      proprietario_contatto: parsed.data.proprietario_contatto,
      proprietario_tipo: parsed.data.proprietario_tipo,
      stato: "richiesto",
      messaggio_richiedente: parsed.data.messaggio_richiedente ?? null,
      nodo_ritiro: parsed.data.nodo_ritiro ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Errore durante l'inserimento. Riprova." };

  // Notifica automatica al proprietario via bot Telegram.
  // Eseguita interamente lato server con dati validati: il client non può
  // iniettare contenuto arbitrario nel messaggio inviato al proprietario.
  let notifySent = false;
  try {
    const { data: libro } = await supabaseServer
      .from("libri")
      .select("telegram_chat_id, titolo, autore")
      .eq("id", parsed.data.libro_id)
      .single();

    if (libro?.telegram_chat_id) {
      // URL costruita da una env trusted, MAI dall'header Host (host poisoning):
      // l'attaccante potrebbe iniettare un dominio malevolo nella notifica.
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const manageUrl = `${siteUrl}/prestito/${data.id}/gestisci?token=${data.edit_token}`;

      const contattoLabel =
        parsed.data.richiedente_tipo === "telegram"
          ? `Telegram: ${parsed.data.richiedente_contatto}`
          : `WhatsApp: +${parsed.data.richiedente_contatto}`;

      const text =
        `📚 Nuova richiesta di prestito!\n\n` +
        `"${libro.titolo}" di ${libro.autore}\n\n` +
        `Un utente vuole prendere in prestito il tuo libro.\n` +
        `Contattalo su ${contattoLabel}.\n\n` +
        `➡️ Gestisci la richiesta:\n${manageUrl}`;

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        const res = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: libro.telegram_chat_id, text }),
          }
        );
        const result = await res.json();
        notifySent = result.ok === true;
      }
    }
  } catch (err) {
    // Non bloccare il flusso: il richiedente ha comunque i link di contatto manuali
    console.error("Telegram notify error:", err);
  }

  return { success: true, id: data.id, edit_token: data.edit_token, notifySent };
}
