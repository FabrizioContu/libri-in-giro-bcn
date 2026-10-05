import type { Libro } from "./types";

export type ShareVariant = "owner" | "visitor";

export interface ShareLinks {
  url: string;
  title: string;
  text: string;
  telegram: string;
  whatsapp: string;
}

type ShareableLibro = Pick<Libro, "id" | "titolo" | "autore" | "barrio" | "disponibile">;

// "owner": banner dopo l'inserimento ("Ho appena aggiunto…").
// "visitor": bottone Condividi visibile a tutti nella scheda.
export function buildShareLinks(
  libro: ShareableLibro,
  siteUrl: string,
  variant: ShareVariant
): ShareLinks {
  const url = `${siteUrl}/libro/${libro.id}`;
  const dove = libro.barrio ?? "Barcellona";
  const libroRef = `"${libro.titolo}" di ${libro.autore}`;

  const text =
    variant === "owner"
      ? `Ho appena aggiunto ${libroRef} al catalogo di Libri in Giro BCN! Disponibile a ${dove}`
      : libro.disponibile
        ? `${libroRef} è disponibile in prestito a ${dove} su Libri in Giro BCN`
        : `${libroRef} su Libri in Giro BCN`;

  return {
    url,
    title: libro.titolo,
    text,
    // Telegram mette l'URL come anteprima a parte: non va ripetuto nel testo
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} → ${url}`)}`,
  };
}
