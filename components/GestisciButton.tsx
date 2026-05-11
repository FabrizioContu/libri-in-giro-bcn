"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  libroId: string;
}

export function GestisciButton({ libroId }: Props) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("lgbcn_tokens") ?? "{}");
      setToken(stored[libroId] ?? null);
    } catch {
      // localStorage non disponibile
    }
  }, [libroId]);

  // Token trovato in localStorage — mostra il link diretto
  if (token) {
    return (
      <div className="pt-2">
        <a
          href={`/libro/${libroId}/gestisci?token=${token}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#3B6D11] font-medium hover:underline underline-offset-2 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Gestisci il tuo libro
        </a>
      </div>
    );
  }

  // Nessun token — mostra il link "Sei il proprietario?" con form inline
  return (
    <div className="pt-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Sei il proprietario?
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Codice di accesso"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  router.push(`/libro/${libroId}/gestisci?token=${input.trim()}`);
                }
              }}
              className="h-9 text-sm"
            />
            <Button
              size="sm"
              disabled={!input.trim()}
              onClick={() =>
                router.push(`/libro/${libroId}/gestisci?token=${input.trim()}`)
              }
            >
              Accedi
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Trovi il codice nel link di gestione mostrato quando hai aggiunto il libro.
          </p>
        </div>
      )}
    </div>
  );
}
