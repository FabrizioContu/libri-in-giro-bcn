import { StatoPrestito } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Clock, XCircle, Package, RotateCcw, AlertTriangle } from "lucide-react";

interface TimelinePrestitoProps {
  stato: StatoPrestito;
  dataRichiesta?: string | null;
  dataConferma?: string | null;
  dataRitiro?: string | null;
  dataRestituzionePrevista?: string | null;
  dataRestituzioneEffettiva?: string | null;
}

type Step = {
  key: StatoPrestito | "fine";
  label: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  { key: "richiesto", label: "Richiesto", icon: <Clock className="w-4 h-4" /> },
  { key: "confermato", label: "Confermato", icon: <Check className="w-4 h-4" /> },
  { key: "in_corso", label: "In corso", icon: <Package className="w-4 h-4" /> },
  { key: "restituito", label: "Restituito", icon: <RotateCcw className="w-4 h-4" /> },
];

const STATO_ORDER: Record<string, number> = {
  richiesto: 0,
  confermato: 1,
  in_corso: 2,
  restituito: 3,
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TimelinePrestito({
  stato,
  dataRichiesta,
  dataConferma,
  dataRitiro,
  dataRestituzionePrevista,
  dataRestituzioneEffettiva,
}: TimelinePrestitoProps) {
  const isTerminal = stato === "annullato" || stato === "scaduto";
  const currentOrder = STATO_ORDER[stato] ?? -1;

  const stepDates: Record<string, string | null | undefined> = {
    richiesto: dataRichiesta,
    confermato: dataConferma,
    in_corso: dataRitiro,
    restituito: dataRestituzioneEffettiva,
  };

  if (isTerminal) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
        {stato === "annullato" ? (
          <XCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-[#A32D2D] flex-shrink-0" />
        )}
        <div>
          <p className="font-semibold text-sm text-gray-800">
            {stato === "annullato" ? "Prestito annullato" : "Prestito scaduto"}
          </p>
          {stato === "scaduto" && dataRestituzionePrevista && (
            <p className="text-xs text-gray-500 mt-0.5">
              Restituzione prevista: {formatDate(dataRestituzionePrevista)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {STEPS.map((step, index) => {
        const stepOrder = STATO_ORDER[step.key] ?? -1;
        const isCompleted = stepOrder < currentOrder;
        const isCurrent = step.key === stato;
        const isPending = stepOrder > currentOrder;

        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  isCompleted && "bg-[#3B6D11] text-white",
                  isCurrent && "bg-[#3B6D11] text-white ring-4 ring-[#EAF3DE]",
                  isPending && "bg-gray-100 text-gray-400"
                )}
              >
                {step.icon}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-6 mt-1",
                    isCompleted ? "bg-[#3B6D11]" : "bg-gray-200"
                  )}
                />
              )}
            </div>
            <div className="pt-1 pb-4">
              <p
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isCurrent && "text-[#3B6D11]",
                  isCompleted && "text-gray-700",
                  isPending && "text-gray-400"
                )}
              >
                {step.label}
              </p>
              {stepDates[step.key] && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(stepDates[step.key])}
                </p>
              )}
              {step.key === "in_corso" && isCurrent && dataRestituzionePrevista && (
                <p className="text-xs text-[#BA7517] mt-0.5 font-medium">
                  Prevista entro {formatDate(dataRestituzionePrevista)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
