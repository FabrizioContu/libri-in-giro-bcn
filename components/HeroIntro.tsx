import { Send } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroIntro() {
  return (
    <section className="bg-gradient-to-b from-[#EAF3DE] to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Libri in italiano
              <br className="hidden sm:block" /> a Barcellona
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 mb-10">
              Una biblioteca per chi ama la lingua italiana, dove si possono
              prestare e scambiare libri.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
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
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href="#catalogo">Trova il tuo prossimo libro ↓</a>
              </Button>
            </div>
          </div>

          <div className="flex-shrink-0 w-full max-w-xs lg:max-w-sm xl:max-w-md">
            <Image
              src="/hero.webp"
              alt="Barcellona — Libri in Giro BCN"
              width={400}
              height={600}
              className="rounded-2xl shadow-lg object-cover w-full h-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
