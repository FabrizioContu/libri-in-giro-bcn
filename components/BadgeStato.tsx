import { StatoPrestito } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BadgeStatoProps {
  stato: StatoPrestito;
  className?: string;
}

const STATO_CONFIG: Record<
  StatoPrestito,
  { label: string; className: string }
> = {
  richiesto: {
    label: "Richiesto",
    className: "bg-blue-100 text-blue-700",
  },
  confermato: {
    label: "Confermato",
    className: "bg-[#EAF3DE] text-[#3B6D11]",
  },
  in_corso: {
    label: "In corso",
    className: "bg-orange-100 text-[#BA7517]",
  },
  restituito: {
    label: "Restituito",
    className: "bg-gray-100 text-gray-600",
  },
  scaduto: {
    label: "Scaduto",
    className: "bg-red-100 text-[#A32D2D]",
  },
  annullato: {
    label: "Annullato",
    className: "bg-gray-100 text-gray-500",
  },
};

export function BadgeStato({ stato, className }: BadgeStatoProps) {
  const config = STATO_CONFIG[stato];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
