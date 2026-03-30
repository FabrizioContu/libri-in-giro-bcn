"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prestito, NODI_RITIRO } from "@/lib/types";
import { aggiornaPrestito, getRpcErrorMessage } from "@/lib/rpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Package, RotateCcw, AlertTriangle } from "lucide-react";

interface GestisciPrestitoClientProps {
  prestito: Prestito;
  editToken: string;
  libroId: string;
}

export function GestisciPrestitoClient({
  prestito,
  editToken,
  libroId,
}: GestisciPrestitoClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodoRitiro, setNodoRitiro] = useState(prestito.nodo_ritiro ?? "");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const handleAction = async (
    stato: Prestito["stato"],
    extra?: { nodo?: string; dataRitiro?: string }
  ) => {
    setLoading(true);
    setError(null);

    const result = await aggiornaPrestito({
      p_id: prestito.id,
      p_token: editToken,
      p_stato: stato,
      p_data_ritiro: extra?.dataRitiro ?? null,
      p_nodo_ritiro: extra?.nodo ?? null,
    });

    setLoading(false);

    if (!result.success && result.error) {
      setError(getRpcErrorMessage(result.error));
    } else {
      router.refresh();
      setConfirmAction(null);
    }
  };

  const { stato } = prestito;

  if (stato === "restituito" || stato === "annullato") {
    return (
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Questo prestito è concluso ({stato}).
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
      <h2 className="font-semibold text-gray-900">Azioni disponibili</h2>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle className="w-4 h-4 text-[#A32D2D] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#A32D2D]">{error}</p>
        </div>
      )}

      {/* richiesto state */}
      {stato === "richiesto" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Il richiedente vuole prendere in prestito questo libro. Puoi confermare o
            rifiutare la richiesta.
          </p>

          {confirmAction === "annullato" ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Confermi di voler rifiutare questa richiesta?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmAction(null)}
                  disabled={loading}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction("annullato")}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "..." : "Conferma rifiuto"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nodo di ritiro concordato</Label>
                <Select value={nodoRitiro} onValueChange={setNodoRitiro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona nodo (opzionale)" />
                  </SelectTrigger>
                  <SelectContent>
                    {NODI_RITIRO.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction("annullato")}
                  disabled={loading}
                  className="flex-1"
                >
                  <X className="w-4 h-4" />
                  Rifiuto
                </Button>
                <Button
                  onClick={() =>
                    handleAction("confermato", { nodo: nodoRitiro || undefined })
                  }
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Confermo il prestito
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* confermato state */}
      {stato === "confermato" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Il prestito è confermato. Quando hai consegnato il libro al richiedente,
            segna il ritiro.
          </p>
          <Button
            onClick={() =>
              handleAction("in_corso", { dataRitiro: new Date().toISOString() })
            }
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Package className="w-4 h-4" />
            )}
            Confermo il ritiro
          </Button>
        </div>
      )}

      {/* in_corso state */}
      {stato === "in_corso" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Il libro è in prestito. Quando ti viene restituito, segna la restituzione.
          </p>
          <Button
            onClick={() => handleAction("restituito")}
            disabled={loading}
            variant="outline"
            className="w-full border-[#3B6D11] text-[#3B6D11] hover:bg-[#EAF3DE]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#3B6D11]/30 border-t-[#3B6D11] rounded-full animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Libro restituito
          </Button>
        </div>
      )}

      {/* scaduto state */}
      {stato === "scaduto" && (
        <div className="space-y-3">
          <p className="text-sm text-[#A32D2D] bg-red-50 border border-red-100 p-3 rounded-xl">
            Questo prestito è scaduto. Se il libro è stato restituito, segna la
            restituzione.
          </p>
          <Button
            onClick={() => handleAction("restituito")}
            disabled={loading}
            variant="outline"
            className="w-full border-[#3B6D11] text-[#3B6D11] hover:bg-[#EAF3DE]"
          >
            <RotateCcw className="w-4 h-4" />
            Segna come restituito comunque
          </Button>
        </div>
      )}
    </div>
  );
}
