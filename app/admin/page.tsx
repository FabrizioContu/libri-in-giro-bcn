import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Libro, Prestito } from "@/lib/types";
import { Header } from "@/components/Header";
import { BadgeStato } from "@/components/BadgeStato";
import { AdminClient } from "./AdminClient";
import Link from "next/link";
import { ExternalLink, BarChart3, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";

interface Props {
  searchParams: Promise<{ secret?: string }>;
}

async function getData() {
  const [libriRes, prestitiRes] = await Promise.all([
    supabase.from("libri").select("*").order("created_at", { ascending: false }),
    supabase
      .from("prestiti")
      .select("*, libri(titolo, autore)")
      .order("data_richiesta", { ascending: false }),
  ]);

  return {
    libri: (libriRes.data ?? []) as Libro[],
    prestiti: (prestitiRes.data ?? []) as (Prestito & {
      libri: { titolo: string; autore: string };
    })[],
  };
}

export default async function AdminPage({ searchParams }: Props) {
  const { secret } = await searchParams;

  const adminSecret = process.env.ADMIN_SECRET ?? "libri2024";
  if (secret !== adminSecret) notFound();

  const { libri, prestiti } = await getData();

  const totalLibri = libri.length;
  const availableLibri = libri.filter((l) => l.disponibile).length;
  const activeLoans = prestiti.filter(
    (p) =>
      p.stato === "richiesto" || p.stato === "confermato" || p.stato === "in_corso"
  ).length;
  const expiredLoans = prestiti.filter((p) => p.stato === "scaduto").length;

  const expiredPrestiti = prestiti.filter((p) => p.stato === "scaduto");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#3B6D11]" />
            Dashboard Admin
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Panoramica e gestione di Libri in Giro BCN
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wide">
              <BookOpen className="w-3.5 h-3.5" />
              Totale libri
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalLibri}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-[#3B6D11] text-xs font-medium uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#3B6D11]" />
              Disponibili
            </div>
            <p className="text-3xl font-bold text-[#3B6D11]">{availableLibri}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-[#BA7517] text-xs font-medium uppercase tracking-wide">
              <TrendingUp className="w-3.5 h-3.5" />
              Prestiti attivi
            </div>
            <p className="text-3xl font-bold text-[#BA7517]">{activeLoans}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-[#A32D2D] text-xs font-medium uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              Scaduti
            </div>
            <p className="text-3xl font-bold text-[#A32D2D]">{expiredLoans}</p>
          </div>
        </div>

        {/* Expired loans */}
        {expiredPrestiti.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#A32D2D]" />
              Prestiti scaduti
            </h2>
            <div className="space-y-2">
              {expiredPrestiti.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between p-4 rounded-2xl bg-white border border-red-100 shadow-sm gap-3"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-gray-900">
                      {p.libri.titolo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.libri.autore} &bull; {p.richiedente_contatto}
                    </p>
                    {p.data_restituzione_prevista && (
                      <p className="text-xs text-[#A32D2D]">
                        Prevista:{" "}
                        {new Date(p.data_restituzione_prevista).toLocaleDateString(
                          "it-IT"
                        )}
                      </p>
                    )}
                  </div>
                  <a
                    href={
                      siteUrl +
                      "/prestito/" +
                      p.id +
                      "/gestisci?token=" +
                      p.edit_token
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#3B6D11] hover:underline flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Gestisci
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All books */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Tutti i libri</h2>
          <AdminClient libri={libri} siteUrl={siteUrl} secret={secret!} />
        </div>
      </main>
    </div>
  );
}
