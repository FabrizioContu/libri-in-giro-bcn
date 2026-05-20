"use client";
import { useState } from "react";
import { Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildContactUrl } from "@/lib/contatto";
import { TipoContatto } from "@/lib/types";

interface RispondiButtonProps {
  tipo: TipoContatto;
  contatto: string;
  titolo: string;
  autore: string;
}

const LABEL: Record<TipoContatto, string> = {
  telegram: "Rispondi su Telegram",
  whatsapp: "Rispondi su WhatsApp",
  email: "Rispondi via Email",
  altro: "Copia messaggio",
};

export function RispondiButton({ tipo, contatto, titolo, autore }: RispondiButtonProps) {
  const [copied, setCopied] = useState(false);

  const testo = `Ciao! Ho ricevuto la tua richiesta per "${titolo}" di ${autore}. `;

  if (tipo === "altro") {
    return (
      <Button
        variant="outline"
        className="w-full border-[#3B6D11]/30 text-[#3B6D11] hover:bg-[#EAF3DE]"
        onClick={async () => {
          await navigator.clipboard.writeText(testo);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copiato!" : LABEL.altro}
      </Button>
    );
  }

  const href = buildContactUrl(tipo, contatto, testo);

  return (
    <Button variant="outline" className="w-full border-[#3B6D11]/30 text-[#3B6D11] hover:bg-[#EAF3DE]" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Send className="w-4 h-4" />
        {LABEL[tipo]}
      </a>
    </Button>
  );
}
