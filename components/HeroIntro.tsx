import { Fragment } from "react";
import { BookPlus, Search, Handshake } from "lucide-react";
import { ElementType } from "react";

const steps: { icon: ElementType; label: string; sub: string }[] = [
  { icon: BookPlus,  label: "Aggiungi", sub: "il tuo libro" },
  { icon: Search,    label: "Trova",    sub: "un libro" },
  { icon: Handshake, label: "Prendilo", sub: "in prestito" },
];

export function HeroIntro() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-center text-gray-500 text-base sm:text-lg mb-8">
          Scambia libri con la comunità italiana di Barcellona
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0">
          {steps.map(({ icon: Icon, label, sub }, i) => (
            <Fragment key={label}>
              <div className="flex flex-col items-center gap-2 px-6">
                <div className="w-10 h-10 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#3B6D11]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden sm:block w-8 h-px bg-gray-200 shrink-0" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
