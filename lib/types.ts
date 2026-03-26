export type Genere =
  | "Narrativa"
  | "Romanzo storico"
  | "Saggistica"
  | "Gialli / Thriller"
  | "Fantasy / Fantascienza"
  | "Poesia"
  | "Bambini / Ragazzi"
  | "Altro";

export type Barrio =
  | "Gràcia"
  | "Eixample"
  | "Poble Sec / Sant Antoni"
  | "Poblenou"
  | "Sants"
  | "Altro";

export type StatoPrestito =
  | "richiesto"
  | "confermato"
  | "in_corso"
  | "restituito"
  | "scaduto"
  | "annullato";

export type TipoContatto = "telegram" | "whatsapp" | "email" | "altro";

export interface Libro {
  id: string;
  titolo: string;
  autore: string;
  genere: Genere | null;
  barrio: Barrio | null;
  telegram: string | null;
  contatto_alternativo: string | null;
  disponibile: boolean;
  copertina_url: string | null;
  note: string | null;
  edit_token: string;
  created_at: string;
}

export interface Prestito {
  id: string;
  libro_id: string;
  richiedente_contatto: string;
  richiedente_tipo: TipoContatto;
  proprietario_contatto: string;
  proprietario_tipo: TipoContatto;
  stato: StatoPrestito;
  data_richiesta: string;
  data_conferma: string | null;
  data_ritiro: string | null;
  data_restituzione_prevista: string | null;
  data_restituzione_effettiva: string | null;
  nodo_ritiro: string | null;
  messaggio_richiedente: string | null;
  edit_token: string;
}

export interface PrestitoConLibro extends Prestito {
  libri: Libro;
}

export const GENERI: Genere[] = [
  "Narrativa",
  "Romanzo storico",
  "Saggistica",
  "Gialli / Thriller",
  "Fantasy / Fantascienza",
  "Poesia",
  "Bambini / Ragazzi",
  "Altro",
];

export const BARRIOS: Barrio[] = [
  "Gràcia",
  "Eixample",
  "Poble Sec / Sant Antoni",
  "Poblenou",
  "Sants",
  "Altro",
];

export const NODI_RITIRO: string[] = [
  "Gràcia - Plaça del Diamant",
  "Gràcia - Carrer de Verdi",
  "Eixample - Passeig de Gràcia",
  "Eixample - Carrer d'Enric Granados",
  "Poble Sec - Carrer de Blai",
  "Sant Antoni - Mercat de Sant Antoni",
  "Poblenou - Rambla del Poblenou",
  "Sants - Plaça de Sants",
  "Altro (da concordare)",
];
