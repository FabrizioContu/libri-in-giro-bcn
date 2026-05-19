"use server";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyHcaptcha } from "@/lib/hcaptcha";
import { checkRateLimit } from "@/lib/rate-limit";
import { libroSchema } from "@/lib/validation";

export interface CreateLibroInput {
  titolo: string;
  autore: string;
  genere: string;
  barrio: string;
  telegram: string | null;
  contatto_alternativo: string | null;
  copertina_url: string | null;
  note: string | null;
  nickname: string | null;
  avatar_emoji: string | null;
  captchaToken: string;
  honeypot: string;
}

export type CreateLibroResult =
  | { success: true; id: string; edit_token: string }
  | { success: false; error: string };

export async function createLibro(input: CreateLibroInput): Promise<CreateLibroResult> {
  if (input.honeypot) return { success: false, error: "invalid" };

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const captchaOk = await verifyHcaptcha(input.captchaToken);
  if (!captchaOk)
    return { success: false, error: "Verifica di sicurezza fallita. Riprova." };

  const rateLimit = await checkRateLimit(ip, "create_libro");
  if (!rateLimit.allowed)
    return {
      success: false,
      error: "Hai aggiunto troppi libri di recente. Riprova tra un'ora.",
    };

  const parsed = libroSchema.safeParse({
    titolo: input.titolo,
    autore: input.autore,
    genere: input.genere,
    barrio: input.barrio,
    telegram: input.telegram || null,
    contatto_alternativo: input.contatto_alternativo || null,
    copertina_url: input.copertina_url || null,
    note: input.note || null,
    nickname: input.nickname || null,
    avatar_emoji: input.avatar_emoji || null,
  });

  if (!parsed.success)
    return { success: false, error: "Dati non validi. Controlla i campi e riprova." };

  const { data, error } = await supabaseServer
    .from("libri")
    .insert({
      titolo: parsed.data.titolo,
      autore: parsed.data.autore,
      genere: parsed.data.genere ?? null,
      barrio: parsed.data.barrio ?? null,
      telegram: parsed.data.telegram ?? null,
      contatto_alternativo: parsed.data.contatto_alternativo ?? null,
      disponibile: true,
      copertina_url: parsed.data.copertina_url ?? null,
      note: parsed.data.note ?? null,
      nickname: parsed.data.nickname ?? null,
      avatar_emoji: parsed.data.avatar_emoji ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Errore durante l'inserimento. Riprova." };

  const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  console.log("[telegram] groupChatId:", !!groupChatId, "botToken:", !!botToken);
  if (groupChatId && botToken) {
    const host = headersList.get("host") ?? "";
    const protocol = host.startsWith("localhost") || host.startsWith("10.") || host.startsWith("192.") ? "http" : "https";
    const libroUrl = `${protocol}://${host}/libro/${data.id}`;

    const parts = [
      `📚 Nuovo libro disponibile!\n`,
      `"${data.titolo}" di ${data.autore}`,
      data.barrio ? `📍 ${data.barrio}` : null,
      data.genere ? `🏷️ ${data.genere}` : null,
      `\n➡️ ${libroUrl}`,
    ].filter(Boolean).join("\n");

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: groupChatId, text: parts }),
    }).catch((err: unknown) => { console.error("[telegram] fetch error:", err); return null; });
    if (tgRes) {
      const tgJson = await tgRes.json().catch(() => null);
      console.log("[telegram] response:", JSON.stringify(tgJson));
    }
  }

  return { success: true, id: data.id, edit_token: data.edit_token };
}
