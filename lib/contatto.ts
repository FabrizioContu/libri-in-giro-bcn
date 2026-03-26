import { TipoContatto } from "./types";

/**
 * Builds a contact URL or display string based on contact type.
 * For Telegram: returns the t.me URL with pre-filled message.
 * For others: returns a formatted string.
 */
export function buildContactUrl(
  tipo: TipoContatto,
  contatto: string,
  testo?: string
): string {
  const testoEncoded = testo ? encodeURIComponent(testo) : "";
  switch (tipo) {
    case "telegram": {
      const username = contatto.replace(/^@/, "");
      return testo
        ? `https://t.me/${username}?text=${testoEncoded}`
        : `https://t.me/${username}`;
    }
    case "whatsapp": {
      const phone = contatto.replace(/\D/g, "");
      return testo
        ? `https://wa.me/${phone}?text=${testoEncoded}`
        : `https://wa.me/${phone}`;
    }
    case "email": {
      return testo
        ? `mailto:${contatto}?body=${testoEncoded}`
        : `mailto:${contatto}`;
    }
    default:
      return contatto;
  }
}

/**
 * Detects the contact type from a contact string.
 */
export function detectContactType(contatto: string): TipoContatto {
  if (contatto.startsWith("@") || /^[a-zA-Z0-9_]{5,32}$/.test(contatto)) {
    return "telegram";
  }
  if (contatto.includes("@") && contatto.includes(".")) {
    return "email";
  }
  if (/^\+?[\d\s\-()]{7,}$/.test(contatto)) {
    return "whatsapp";
  }
  return "altro";
}

/**
 * Formats a contact for display.
 */
export function formatContact(tipo: TipoContatto, contatto: string): string {
  if (tipo === "telegram") {
    return contatto.startsWith("@") ? contatto : `@${contatto}`;
  }
  return contatto;
}
