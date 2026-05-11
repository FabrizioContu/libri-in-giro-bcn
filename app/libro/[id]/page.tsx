import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Libro, Prestito } from "@/lib/types";
import { Header } from "@/components/Header";
import BadgeGenere from "@/components/BadgeGenere";
import { BadgeStato } from "@/components/BadgeStato";
import { LibroDetailClient } from "./LibroDetailClient";
import { GestisciButton } from "@/components/GestisciButton";
import { AvatarNickname } from "@/components/AvatarNickname";
import { ArrowLeft, MapPin } from "lucide-react";

async function getLibro(id: string): Promise<Libro | null> {
  const { data, error } = await supabase
    .from("libri")
    .select("*")
    .eq("id", id)
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

export const revalidate = 30;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuovo?: string }>;
}

export default async function LibroPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { nuovo } = await searchParams;

  const [libro, prestiti] = await Promise.all([getLibro(id), getPrestiti(id)]);

  if (!libro) notFound();

  const activeLoan = prestiti.find(
    (p) =>
      p.stato === "richiesto" ||
      p.stato === "confermato" ||
      p.stato === "in_corso",
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const shareText =
    'Ho appena aggiunto "' +
    libro.titolo +
    '" di ' +
    libro.autore +
    " al catalogo di Libri in Giro BCN! Disponibile a " +
    (libro.barrio ?? "Barcellona") +
    " → " +
    siteUrl + "/libro/" + libro.id;

  const shareUrl =
    "https://t.me/share/url?url=" +
    encodeURIComponent(siteUrl + "/libro/" + libro.id) +
    "&text=" +
    encodeURIComponent(
      'Ho appena aggiunto "' +
        libro.titolo +
        '" di ' +
        libro.autore +
        " al catalogo di Libri in Giro BCN! Disponibile a " +
        (libro.barrio ?? "Barcellona"),
    );

  const shareWhatsappUrl =
    "https://wa.me/?text=" + encodeURIComponent(shareText);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3B6D11] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al catalogo
        </Link>

        {/* Success banner (nuovo=true) */}
        {nuovo === "true" && (
          <div className="mb-6 p-4 rounded-2xl bg-[#EAF3DE] border border-[#3B6D11]/20 space-y-2">
            <p className="font-semibold text-[#3B6D11]">
              Libro aggiunto con successo!
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={
                  "/libro/" + libro.id + "/gestisci?token=" + libro.edit_token
                }
                className="text-sm text-[#3B6D11] underline underline-offset-2 hover:no-underline"
              >
                Gestisci il tuo libro
              </Link>
              <span className="text-gray-300">|</span>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#3B6D11] underline underline-offset-2 hover:no-underline"
              >
                Condividi su Telegram
              </a>
              <span className="text-gray-300">|</span>
              <a
                href={shareWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#3B6D11] underline underline-offset-2 hover:no-underline"
              >
                Condividi su WhatsApp
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-8">
          {/* Cover */}
          <div className="shrink-0 mx-auto sm:mx-0">
            {libro.copertina_url ? (
              <div className="relative w-200px h-300px sm:w-220px sm:h-330px rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={libro.copertina_url}
                  alt={"Copertina di " + libro.titolo}
                  fill
                  sizes="220px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-200px h-300px sm:w-220px sm:h-330px rounded-2xl bg-[#EAF3DE] flex items-center justify-center shadow-md">
                <span className="text-7xl font-bold text-[#3B6D11] select-none">
                  {libro.autore.trim().split(' ').pop()?.[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            {/* Status badge */}
            <div>
              {libro.disponibile ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3DE] text-[#3B6D11] text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#3B6D11] animate-pulse" />
                  Disponibile
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Non disponibile
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              {libro.titolo}
            </h1>
            <p className="text-lg text-gray-600">{libro.autore}</p>

            <div className="flex flex-wrap gap-2">
              {libro.genere && <BadgeGenere genere={libro.genere} />}
              {libro.barrio && (
                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {libro.barrio}
                </span>
              )}
            </div>

            {(libro.nickname || libro.avatar_emoji) && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <span>Condiviso da</span>
                <AvatarNickname emoji={libro.avatar_emoji} nickname={libro.nickname} />
              </div>
            )}

            {libro.note && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {libro.note}
                </p>
              </div>
            )}

            {/* CTA / Not available message */}
            <LibroDetailClient libro={libro} activeLoan={activeLoan} />

            <GestisciButton libroId={libro.id} />
          </div>
        </div>

        {/* Loan history */}
        {prestiti.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Storico prestiti
            </h2>
            <div className="space-y-3">
              {prestiti.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 text-sm"
                >
                  <div className="space-y-0.5">
                    <p className="text-gray-600">
                      {p.data_richiesta
                        ? new Date(p.data_richiesta).toLocaleDateString(
                            "it-IT",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : ""}
                    </p>
                    {p.nodo_ritiro && (
                      <p className="text-xs text-gray-400">{p.nodo_ritiro}</p>
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
