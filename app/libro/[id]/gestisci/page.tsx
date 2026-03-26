import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Libro, Prestito } from "@/lib/types";
import { Header } from "@/components/Header";
import { BadgeStato } from "@/components/BadgeStato";
import { GestisciLibroClient } from "./GestisciLibroClient";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

async function getLibroByToken(id: string, token: string): Promise<Libro | null> {
  const { data, error } = await supabase
    .from("libri")
    .select("*")
    .eq("id", id)
    .eq("edit_token", token)
    .single();

  if (error || !data) return null;
  return data;
}

async function getPrestiti(libroId: string): Promise<Prestito[]> {
  const { data, error } = await supabase
    .from("prestiti")
    .select("*")
    .eq("libro_id", libroId)
    .order("data_richiesta", { ascending: false });

  if (error) return [];
  return data ?? [];
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function GestisciLibroPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  const libro = await getLibroByToken(id, token);
  if (!libro) notFound();

  const prestiti = await getPrestiti(id);
  const activePrestiti = prestiti.filter(
    (p) => p.stato === "richiesto" || p.stato === "confermato" || p.stato === "in_corso"
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
          Torna alla pagina del libro
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestisci libro</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {libro.titolo} di {libro.autore}
          </p>
        </div>

        {/* Edit form */}
        <GestisciLibroClient libro={libro} editToken={token} />

        {/* Active loans */}
        {activePrestiti.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Prestiti attivi</h2>
            {activePrestiti.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {p.richiedente_contatto}
                  </span>
                  <BadgeStato stato={p.stato} />
                </div>
                {p.nodo_ritiro && (
                  <p className="text-xs text-gray-400">Nodo: {p.nodo_ritiro}</p>
                )}
                <a
                  href={siteUrl + "/prestito/" + p.id + "/gestisci?token=" + p.edit_token}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#3B6D11] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Gestisci prestito
                </a>
              </div>
            ))}
          </div>
        )}

        {/* All loans */}
        {prestiti.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Tutti i prestiti</h2>
            <div className="space-y-2">
              {prestiti.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-sm"
                >
                  <div>
                    <span className="text-gray-700">{p.richiedente_contatto}</span>
                    {p.data_richiesta && (
                      <span className="text-gray-400 text-xs ml-2">
                        {new Date(p.data_richiesta).toLocaleDateString("it-IT")}
                      </span>
                    )}
                  </div>
                  <BadgeStato stato={p.stato} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
