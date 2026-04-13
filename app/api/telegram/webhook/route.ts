import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const text: string = message.text ?? "";
    const from = message.from;
    if (!from) return NextResponse.json({ ok: true });

    const chatId: number = from.id;
    const username: string = (from.username ?? "").toLowerCase();

    // Solo su /start
    if (!text.startsWith("/start")) return NextResponse.json({ ok: true });
    if (!username) return NextResponse.json({ ok: true });

    // Aggiorna telegram_chat_id su tutti i libri di questo proprietario
    await supabase
      .from("libri")
      .update({ telegram_chat_id: chatId })
      .ilike("telegram", username);

    // Risposta di conferma al proprietario
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text:
            "✅ Perfetto! Riceverai una notifica qui ogni volta che qualcuno richiede uno dei tuoi libri su Libri in Giro BCN.",
        }),
      }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
