import Link from "next/link";
import Image from "next/image";
import { Libro, GENERE_STYLE } from "@/lib/types";
import BadgeGenere from "./BadgeGenere";
import { AvatarNickname } from "./AvatarNickname";
import { MapPin } from "lucide-react";

interface LibroCardProps {
  libro: Libro;
}

export function LibroCard({ libro }: LibroCardProps) {
  const stile = GENERE_STYLE[libro.genere ?? ""] ?? GENERE_STYLE["Altro"];

  return (
    <Link
      href={`/libro/${libro.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B6D11] rounded-2xl"
    >
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Cover */}
        <div
          className="relative aspect-square w-full overflow-hidden"
          style={{ background: stile.bg }}
        >
          {libro.copertina_url ? (
            <Image
              src={libro.copertina_url}
              alt={`Copertina di ${libro.titolo}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center gap-1.5">
              <div className="w-6 h-px mb-1" style={{ background: stile.text, opacity: 0.35 }} />
              <p
                className="text-[11px] font-bold leading-tight line-clamp-4 uppercase tracking-widest px-2 select-none"
                style={{ color: stile.text }}
              >
                {libro.titolo}
              </p>
              <div className="w-6 h-px my-1" style={{ background: stile.text, opacity: 0.35 }} />
              <p
                className="text-[10px] leading-tight line-clamp-2 select-none"
                style={{ color: stile.text, opacity: 0.65 }}
              >
                {libro.autore}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-[#3B6D11] transition-colors">
            {libro.titolo}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">{libro.autore}</p>

          <div className="mt-auto pt-2 flex flex-wrap gap-1 items-center">
            {libro.genere && <BadgeGenere genere={libro.genere} />}
            {libro.barrio && (
              <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                <MapPin className="w-3 h-3 shrink-0" />
                {libro.barrio}
              </span>
            )}
          </div>
          <AvatarNickname emoji={libro.avatar_emoji} nickname={libro.nickname} />
        </div>
      </article>
    </Link>
  );
}
