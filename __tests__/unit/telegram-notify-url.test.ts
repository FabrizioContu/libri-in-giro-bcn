import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// L'header Host è controllato dall'attaccante (host poisoning): le notifiche
// Telegram NON devono MAI costruire URL a partire da lì, ma solo dalla env
// trusted NEXT_PUBLIC_SITE_URL. Questi test bloccano una regressione del fix.
const MALICIOUS_HOST = "evil.attacker.com";
const TRUSTED_SITE = "https://libri-in-giro-bcn.example";

vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve({
      get: (key: string) => {
        if (key === "host") return MALICIOUS_HOST;
        if (key === "x-forwarded-for") return "203.0.113.10";
        return null;
      },
    }),
}));

vi.mock("@/lib/hcaptcha", () => ({
  verifyHcaptcha: () => Promise.resolve(true),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => Promise.resolve({ allowed: true }),
}));

vi.mock("@/lib/supabase-server", () => {
  const titolo = "Il nome della rosa";
  const autore = "Umberto Eco";
  return {
    supabaseServer: {
      from: (table: string) => {
        if (table === "prestiti") {
          return {
            insert: () => ({
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: "11111111-1111-1111-1111-111111111111",
                      edit_token: "edit-tok-xyz",
                    },
                    error: null,
                  }),
              }),
            }),
          };
        }
        // table === "libri": usata sia da createLibro (insert) sia da
        // createPrestito (select del telegram_chat_id del proprietario).
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    id: "22222222-2222-2222-2222-222222222222",
                    titolo,
                    autore,
                    barrio: "Gràcia",
                    genere: "Narrativa",
                  },
                  error: null,
                }),
            }),
          }),
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { telegram_chat_id: "999", titolo, autore },
                  error: null,
                }),
            }),
          }),
        };
      },
    },
  };
});

import { createPrestito } from "@/app/actions/prestiti";
import { createLibro } from "@/app/actions/libri";

const validPrestito = {
  libro_id: "33333333-3333-4333-8333-333333333333",
  richiedente_contatto: "mario",
  richiedente_tipo: "telegram" as const,
  proprietario_contatto: "luigi",
  proprietario_tipo: "telegram" as const,
  messaggio_richiedente: null,
  nodo_ritiro: null,
  captchaToken: "tok",
  honeypot: "",
};

const validLibro = {
  titolo: "Il nome della rosa",
  autore: "Umberto Eco",
  genere: "Narrativa",
  barrio: "Gràcia",
  telegram: null,
  contatto_alternativo: null,
  copertina_url: null,
  note: null,
  nickname: null,
  avatar_emoji: null,
  captchaToken: "tok",
  honeypot: "",
};

// Estrae il testo del messaggio inviato a Telegram dall'ultima fetch utile.
function telegramMessageText(fetchMock: ReturnType<typeof vi.fn>): string {
  const call = fetchMock.mock.calls.find((c) =>
    String(c[0]).includes("api.telegram.org")
  );
  if (!call) throw new Error("Nessuna chiamata a Telegram registrata");
  const body = JSON.parse(call[1].body);
  return body.text as string;
}

describe("Telegram notify URLs — host poisoning hardening", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi
      .fn()
      .mockResolvedValue({ json: () => Promise.resolve({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", TRUSTED_SITE);
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-bot-token");
    vi.stubEnv("TELEGRAM_GROUP_CHAT_ID", "test-group");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("createPrestito builds the manage link from NEXT_PUBLIC_SITE_URL", async () => {
    const res = await createPrestito({ ...validPrestito });

    expect(res.success).toBe(true);
    expect(telegramMessageText(fetchMock)).toContain(`${TRUSTED_SITE}/prestito/`);
  });

  it("createPrestito NEVER leaks the attacker-controlled Host header", async () => {
    await createPrestito({ ...validPrestito });

    expect(telegramMessageText(fetchMock)).not.toContain(MALICIOUS_HOST);
  });

  it("createLibro builds the book link from NEXT_PUBLIC_SITE_URL", async () => {
    const res = await createLibro({ ...validLibro });

    expect(res.success).toBe(true);
    expect(telegramMessageText(fetchMock)).toContain(`${TRUSTED_SITE}/libro/`);
  });

  it("createLibro NEVER leaks the attacker-controlled Host header", async () => {
    await createLibro({ ...validLibro });

    expect(telegramMessageText(fetchMock)).not.toContain(MALICIOUS_HOST);
  });
});
