# Libri in Giro BCN

Piattaforma di scambio libri per la comunità italiana di Barcellona. Gli utenti pubblicano libri che vogliono condividere, altri li richiedono in prestito — tutto senza registrazione.

## Funzionalità

- **Catalogo pubblico** — libri disponibili filtrabili per genere e quartiere
- **Aggiunta libro** — chiunque può pubblicare un libro; protezione anti-spam con hCaptcha, rate limiting e honeypot
- **Gestione libro** — il proprietario modifica o rimuove il proprio libro tramite `edit_token` (niente account)
- **Sistema prestiti** — ciclo di vita completo: `richiesto → confermato → in_corso → restituito`
- **Scansione ISBN** — ricerca copertina via fotocamera direttamente dal form
- **Copertine automatiche** — ricerca su Open Library e Google Books tramite titolo + autore
- **Notifiche Telegram** — bot che avvisa sulle richieste di prestito
- **Pannello admin** — gestione della piattaforma

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| UI | React 19, Tailwind CSS 4, Radix UI |
| Database | Supabase (PostgreSQL) |
| Validazione | Zod |
| Anti-spam | hCaptcha + honeypot + rate limiting su DB |
| Barcode | @zxing/browser |
| Test | Vitest + Testing Library, Playwright (E2E) |

## Sviluppo locale

### Prerequisiti

- Node.js 20+
- Un progetto Supabase (o locale via `supabase start`)

### Setup

```bash
npm install
cp .env.example .env.local
# Compila le variabili d'ambiente (vedi sezione sotto)
npm run dev
```

### Variabili d'ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Test

```bash
# Unit + integrazione
npm test

# Con coverage
npm run test:coverage

# E2E (Playwright)
npm run test:e2e
npm run test:e2e:ui   # con interfaccia grafica
```

## Struttura

```
app/
  page.tsx                        # Catalogo pubblico
  aggiungi/                       # Form aggiunta libro
  libro/[id]/                     # Dettaglio libro + gestione proprietario
  prestito/[id]/gestisci/         # Gestione prestito
  admin/                          # Pannello admin
  actions/                        # Server Actions (libri, prestiti)
  api/telegram/                   # Webhook e notifiche Telegram
lib/
  types.ts                        # Tipi condivisi (Libro, Prestito, ecc.)
  validation.ts                   # Schemi Zod
  rate-limit.ts                   # Rate limiting via tabella Supabase
  cover-search.ts                 # Ricerca copertine (Open Library + Google Books)
  hcaptcha.ts                     # Verifica captcha lato server
```

## Modello dati

**Libri** — titolo, autore, genere, barrio, contatto (Telegram/alternativo), copertina, `edit_token` per la gestione senza autenticazione.

**Prestiti** — collegati a un libro; tracciano richiedente, proprietario, punto di ritiro, stato e date del ciclo di vita.

**Rate limits** — tabella Supabase; limiti: 3 libri/ora, 5 richieste prestito/ora per IP.

## Quartieri supportati

Gràcia · Eixample · Poble Sec / Sant Antoni · Poblenou · Sants

## Comunità

- Canale Telegram: [t.me/LibriInGiroBCN](https://t.me/LibriInGiroBCN)
