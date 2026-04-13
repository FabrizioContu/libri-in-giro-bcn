import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroIntro() {
  return (
    <section className="bg-gradient-to-b from-[#EAF3DE] to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Libri tra italiani<br className="hidden sm:block" /> a Barcellona
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-10">
          Un gruppo dove condividiamo, prestiamo e scambiamo libri.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto gap-2">
            <a
              href="https://t.me/LibriInGiroBCN"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send className="w-4 h-4" />
              Unisciti al gruppo Telegram
            </a>
          </Button>
        </div>

        <div className="mt-8">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href="#catalogo">
              Trova il tuo prossimo libro ↓
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
