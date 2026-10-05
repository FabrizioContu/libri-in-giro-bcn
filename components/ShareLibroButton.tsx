"use client";
import { useState } from "react";
import { Share2, Copy, Check, ChevronDown } from "lucide-react";
import type { ShareLinks } from "@/lib/share";

interface Props {
  links: ShareLinks;
}

export function ShareLibroButton({ links }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Su mobile il menu nativo include già WhatsApp, Telegram e il resto
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: links.title, text: links.text, url: links.url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Share non permesso (es. desktop senza supporto reale): mostra le opzioni
      }
    }
    setExpanded((v) => !v);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(links.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard non disponibile (http o permesso negato): il link resta visibile nelle opzioni
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleShare}
        aria-expanded={expanded}
        className="inline-flex items-center gap-1.5 text-sm text-[#3B6D11] font-medium hover:underline underline-offset-2 transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Condividi
        {expanded && <ChevronDown className="w-3.5 h-3.5 rotate-180" />}
      </button>

      {expanded && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
          >
            Telegram
          </a>
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3B6D11]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiato!" : "Copia link"}
          </button>
        </div>
      )}
    </div>
  );
}
