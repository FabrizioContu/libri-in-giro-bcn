import { z } from "zod";
import { GENERI, BARRIOS } from "./types";

export const libroSchema = z.object({
  titolo: z.string().min(1).max(200).trim(),
  autore: z.string().min(1).max(200).trim(),
  genere: z.enum(GENERI as [string, ...string[]]),
  barrio: z.enum(BARRIOS as [string, ...string[]]),
  telegram: z.string().max(100).trim().nullable().optional(),
  contatto_alternativo: z.string().max(20).trim().nullable().optional(),
  copertina_url: z.string().max(500).trim().nullable().optional(),
  note: z.string().max(1000).trim().nullable().optional(),
  nickname: z.string().max(40).trim().nullable().optional(),
  avatar_emoji: z.string().max(10).nullable().optional(),
});

export const prestitoSchema = z.object({
  libro_id: z.string().uuid(),
  richiedente_contatto: z.string().min(1).max(100).trim(),
  richiedente_tipo: z.enum(["telegram", "whatsapp"]),
  proprietario_contatto: z.string().min(1).max(100).trim(),
  proprietario_tipo: z.enum(["telegram", "whatsapp"]),
  messaggio_richiedente: z.string().max(500).trim().nullable().optional(),
  nodo_ritiro: z.string().max(100).nullable().optional(),
});
