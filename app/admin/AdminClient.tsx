"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Libro } from "@/lib/types";
import { aggiornaLibro, eliminaLibro, getRpcErrorMessage } from "@/lib/rpc";
import BadgeGenere from "@/components/BadgeGenere";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";

interface AdminClientProps {
  libri: Libro[];
  siteUrl: string;
  secret: string;
}

export function AdminClient({ libri, siteUrl, secret }: AdminClientProps) {
  const router = useRouter();
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleToggle = async (libro: Libro) => {
    setToggling(libro.id);
    setErrors((e) => ({ ...e, [libro.id]: "" }));

    const result = await aggiornaLibro({
      p_id: libro.id,
      p_token: libro.edit_token,
      p_titolo: libro.titolo,
      p_autore: libro.autore,
      p_genere: libro.genere,
      p_barrio: libro.barrio,
      p_telegram: libro.telegram,
      p_contatto_alt: libro.contatto_alternativo,
      p_copertina_url: libro.copertina_url,
      p_note: libro.note,
      p_disponibile: !libro.disponibile,
    });

    setToggling(null);
    if (!result.success && result.error) {
      setErrors((e) => ({ ...e, [libro.id]: getRpcErrorMessage(result.error!) }));
    } else {
      router.refresh();
    }
  };

  const handleDelete = async (libro: Libro) => {
    setDeleting(libro.id);
    setErrors((e) => ({ ...e, [libro.id]: "" }));

    const result = await eliminaLibro({ p_id: libro.id, p_token: libro.edit_token });

    setDeleting(null);
    if (!result.success && result.error) {
      setErrors((e) => ({ ...e, [libro.id]: getRpcErrorMessage(result.error!) }));
      setConfirmDelete(null);
    } else {
      router.refresh();
      setConfirmDelete(null);
    }
  };

  if (libri.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4">Nessun libro nel catalogo.</p>
    );
  }

  return (
    <div className="space-y-2">
      {libri.map((libro) => (
        <div
          key={libro.id}
          className="flex items-start justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm gap-3"
        >
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {libro.titolo}
              </p>
              {libro.genere && <BadgeGenere genere={libro.genere} />}
            </div>
            <p className="text-xs text-gray-500">
              {libro.autore}
              {libro.barrio ? " · " + libro.barrio : ""}
            </p>
            {errors[libro.id] && (
              <p className="text-xs text-[#A32D2D]">{errors[libro.id]}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Availability toggle */}
            <button
              onClick={() => handleToggle(libro)}
              disabled={toggling === libro.id}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              title={libro.disponibile ? "Segna come non disponibile" : "Segna come disponibile"}
            >
              {toggling === libro.id ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-[#3B6D11] rounded-full animate-spin" />
              ) : libro.disponibile ? (
                <ToggleRight className="w-6 h-6 text-[#3B6D11]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {/* Manage link */}
            <Link
              href={"/libro/" + libro.id + "/gestisci?token=" + libro.edit_token}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#3B6D11] hover:bg-[#EAF3DE] transition-colors"
              title="Gestisci"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            {/* Delete */}
            {confirmDelete === libro.id ? (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(null)}
                  className="h-7 px-2 text-xs"
                >
                  No
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(libro)}
                  disabled={deleting === libro.id}
                  className="h-7 px-2 text-xs"
                >
                  {deleting === libro.id ? "..." : "Si"}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(libro.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#A32D2D] hover:bg-red-50 transition-colors"
                title="Elimina"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
