import { Header } from "@/components/Header";
import { AggiungiLibroForm } from "./AggiungiLibroForm";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function AggiungiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3B6D11] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al catalogo
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Aggiungi un libro
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Condividi un libro con la comunità italiana di Barcellona.
          </p>
        </div>

        <AggiungiLibroForm />

        <div className="p-4 rounded-2xl bg-[#EAF3DE] border border-[#3B6D11]/20 flex items-start gap-3">
          <Send className="w-4 h-4 text-[#3B6D11] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#3B6D11]">Hai molti libri da aggiungere?</p>
            <p className="text-sm text-gray-600">
              Scrivimi su Telegram e ti carico il catalogo in una volta sola.
            </p>
            <a
              href="https://t.me/FabrizioContu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-[#3B6D11] font-medium hover:underline underline-offset-2 transition-colors"
            >
              Contattami in privato →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
