import { supabase } from "./supabase";
import { StatoPrestito } from "./types";

export interface RpcError {
  code: string;
  message: string;
}

function parseRpcError(error: unknown): RpcError {
  if (error && typeof error === "object" && "code" in error) {
    const e = error as { code: string; message: string };
    return { code: e.code, message: e.message };
  }
  return { code: "UNKNOWN", message: "Errore sconosciuto" };
}

export async function aggiornaLibro(params: {
  p_id: string;
  p_token: string;
  p_titolo: string;
  p_autore: string;
  p_genere: string | null;
  p_barrio: string | null;
  p_telegram: string | null;
  p_contatto_alt: string | null;
  p_copertina_url: string | null;
  p_note: string | null;
  p_disponibile: boolean;
  p_nickname?: string | null;
  p_avatar_emoji?: string | null;
}): Promise<{ success: boolean; error?: RpcError }> {
  const { error } = await supabase.rpc("aggiorna_libro", params);
  if (error) return { success: false, error: parseRpcError(error) };
  return { success: true };
}

export async function eliminaLibro(params: {
  p_id: string;
  p_token: string;
}): Promise<{ success: boolean; error?: RpcError }> {
  const { error } = await supabase.rpc("elimina_libro", params);
  if (error) return { success: false, error: parseRpcError(error) };
  return { success: true };
}

export async function aggiornaPrestito(params: {
  p_id: string;
  p_token: string;
  p_stato: StatoPrestito;
  p_data_ritiro?: string | null;
  p_nodo_ritiro?: string | null;
}): Promise<{ success: boolean; error?: RpcError }> {
  const { error } = await supabase.rpc("aggiorna_prestito", params);
  if (error) return { success: false, error: parseRpcError(error) };
  return { success: true };
}

export function getRpcErrorMessage(error: RpcError): string {
  switch (error.code) {
    case "P0001":
      return "Token non valido o record non trovato.";
    case "P0002":
      return "Il libro ha un prestito attivo e non può essere eliminato.";
    case "P0003":
    case "P0004":
      return "Transizione di stato non consentita.";
    default:
      return error.message || "Si è verificato un errore. Riprova.";
  }
}
