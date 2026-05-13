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
  | { success: true; id: string; edit_token: string }
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

  return { success: true, id: data.id, edit_token: data.edit_token };
}
