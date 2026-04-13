import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const {
      libroId,
      prestitoId,
      richiedenteContatto,
      richiedenteTipo,
      manageUrl,
    } = await req.json();

    // Fetch chat_id del proprietario
    const { data: libro } = await supabase
      .from("libri")
      .select("telegram_chat_id, titolo, autore")
      .eq("id", libroId)
      .single();

    if (!libro?.telegram_chat_id) {
      return NextResponse.json({ ok: false, reason: "no_chat_id" });
    }

    const contattoLabel =
      richiedenteTipo === "telegram"
        ? `Telegram: ${richiedenteContatto}`
        : `WhatsApp: +${richiedenteContatto}`;

    const text =
      `📚 Nuova richiesta di prestito!\n\n` +
      `"${libro.titolo}" di ${libro.autore}\n\n` +
      `Un utente vuole prendere in prestito il tuo libro.\n` +
      `Contattalo su ${contattoLabel}.\n\n` +
      `➡️ Gestisci la richiesta:\n${manageUrl}`;

    const res = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: libro.telegram_chat_id, text }),
      }
    );

    const result = await res.json();
    return NextResponse.json({ ok: result.ok });
  } catch (err) {
    console.error("Telegram notify error:", err);
    return NextResponse.json({ ok: false });
  }
}
