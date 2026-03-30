import { Header } from "@/components/Header";
import Link from "next/link";

export const metadata = {
  title: "Privacy — Libri in Giro BCN",
  description: "Informativa sul trattamento dei dati personali di Libri in Giro BCN.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Informativa sulla privacy</h1>
          <p className="text-sm text-gray-400">Ultimo aggiornamento: marzo 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Chi siamo</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Libri in Giro BCN è un servizio di scambio libri per la comunità italiana di Barcellona.
            Il responsabile del trattamento dei dati è il gestore del progetto, contattabile
            tramite il gruppo Telegram della comunità.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Quali dati raccogliamo</h2>
          <ul className="text-sm text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
            <li>
              <span className="font-medium text-gray-800">Dati del libro:</span> titolo, autore,
              genere e quartiere — necessari per il catalogo.
            </li>
            <li>
              <span className="font-medium text-gray-800">Contatto del proprietario:</span> username
              Telegram, numero WhatsApp o altro contatto fornito volontariamente al momento
              dell&apos;inserimento del libro.
            </li>
            <li>
              <span className="font-medium text-gray-800">Contatto del richiedente:</span> username
              Telegram, numero WhatsApp o altro contatto fornito al momento della richiesta di
              prestito.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Perché raccogliamo questi dati</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            I dati di contatto vengono raccolti esclusivamente per permettere la comunicazione tra
            chi offre un libro e chi vuole prenderlo in prestito. Senza un contatto non è possibile
            organizzare lo scambio. La base giuridica del trattamento è l&apos;esecuzione di un
            contratto (art. 6.1.b GDPR).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Come vengono usati i dati</h2>
          <ul className="text-sm text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
            <li>Il contatto del proprietario è visibile nella pagina pubblica del libro.</li>
            <li>
              Il contatto del richiedente viene condiviso con il proprietario del libro per
              organizzare il prestito.
            </li>
            <li>I dati non vengono venduti né condivisi con terze parti a fini commerciali.</li>
            <li>Non utilizziamo strumenti di tracciamento o analytics.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Cookie</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento del
            servizio. Non utilizziamo cookie di profilazione o tracciamento di terze parti.
            Non è richiesto il tuo consenso per questi cookie.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Dove sono conservati i dati</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            I dati sono conservati su{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3B6D11] underline underline-offset-2"
            >
              Supabase
            </a>
            , un servizio di database con server in Europa. Supabase agisce come responsabile del
            trattamento ai sensi del GDPR.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">I tuoi diritti</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Hai il diritto di accedere, correggere o richiedere la cancellazione dei tuoi dati
            personali in qualsiasi momento. Per farlo, contatta il gestore tramite il gruppo
            Telegram della comunità indicando i dati da eliminare.
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100">
          <Link
            href="/"
            className="text-sm text-[#3B6D11] hover:underline underline-offset-2"
          >
            ← Torna al catalogo
          </Link>
        </div>
      </main>
    </div>
  );
}
