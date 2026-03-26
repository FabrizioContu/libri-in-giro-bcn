import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Libro, Prestito } from "@/lib/types";
import { Header } from "@/components/Header";
import { BadgeStato } from "@/components/BadgeStato";
import { TimelinePrestito } from "@/components/TimelinePrestito";
import { GestisciPrestitoClient } from "./GestisciPrestitoClient";
import Link from "next/link";
import { ArrowLeft, BookOpen, MapPin } from "lucide-react";

async function getPrestitoByToken(
  id: string,
  token: string
): Promise<(Prestito & { libri: Libro }) | null> {
  const { data, error } = await supabase
    .from("prestiti")
    .select("*, libri(*)")
    .eq("id", id)
    .eq("edit_token", token)
    .single();

  if (error || !data) return null;
  return data as Prestito & { libri: Libro };
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function GestisciPrestitoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  const prestito = await getPrestitoByToken(id, token);
  if (!prestito) notFound();

  const libro = prestito.libri;

  // Countdown for in_corso
  let daysLeft: number | null = null;
  if (prestito.stato === "in_corso" && prestito.data_restituzione_prevista) {
    const prevista = new Date(prestito.data_restituzione_prevista);
    const now = new Date();
    daysLeft = Math.ceil((prevista.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Back */}
        <Link
          href={"/libro/" + libro.id}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3B6D11] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al libro
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestisci prestito</h1>
          <p className="text-gray-500 text-sm mt-1">
            Aggiorna lo stato di questo prestito
          </p>
        </div>

        {/* Book info card */}
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-16 rounded-lg bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-[#3B6D11]" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-gray-900">{libro.titolo}</p>
            <p className="text-sm text-gray-600">{libro.autore}</p>
            {libro.barrio && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {libro.barrio}
              </p>
            )}
          </div>
        </div>

        {/* Requester info */}
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900">Informazioni</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Richiedente</p>
              <p className="font-medium text-gray-800">{prestito.richiedente_contatto}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Stato</p>
              <BadgeStato stato={prestito.stato} />
            </div>
            {prestito.nodo_ritiro && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                  Nodo di ritiro
                </p>
                <p className="font-medium text-gray-800">{prestito.nodo_ritiro}</p>
              </div>
            )}
            {prestito.messaggio_richiedente && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                  Messaggio
                </p>
                <p className="text-gray-700 italic">
                  &ldquo;{prestito.messaggio_richiedente}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Countdown */}
          {daysLeft !== null && (
            <div
              className={
                "p-3 rounded-xl text-sm font-medium " +
                (daysLeft < 0
                  ? "bg-red-50 text-[#A32D2D] border border-red-100"
                  : daysLeft <= 7
                  ? "bg-orange-50 text-[#BA7517] border border-orange-100"
                  : "bg-[#EAF3DE] text-[#3B6D11] border border-[#3B6D11]/20")
              }
            >
              {daysLeft < 0
                ? "Restituzione in ritardo di " + Math.abs(daysLeft) + " giorni"
                : daysLeft === 0
                ? "Restituzione prevista per oggi"
                : "Restituzione prevista tra " + daysLeft + " giorni"}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Cronologia</h2>
          <TimelinePrestito
            stato={prestito.stato}
            dataRichiesta={prestito.data_richiesta}
            dataConferma={prestito.data_conferma}
            dataRitiro={prestito.data_ritiro}
            dataRestituzionePrevista={prestito.data_restituzione_prevista}
            dataRestituzioneEffettiva={prestito.data_restituzione_effettiva}
          />
        </div>

        {/* Actions */}
        <GestisciPrestitoClient
          prestito={prestito}
          editToken={token}
          libroId={libro.id}
        />
      </main>
    </div>
  );
}
