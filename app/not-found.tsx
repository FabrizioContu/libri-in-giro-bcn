import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <BookWith404 />

        <h1 className="mt-8 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          Pagina non trovata
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-sm">
          Questo libro non è nel catalogo.
          <br />
          Forse è già in prestito, o forse non esiste affatto.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link href="/">Torna al catalogo</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/aggiungi">Aggiungi un libro</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function BookWith404() {
  return (
    <svg
      width="280"
      height="200"
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shadow */}
      <ellipse cx="140" cy="188" rx="80" ry="8" fill="#e5e7eb" />

      {/* Left page */}
      <path
        d="M44 32 C44 28 48 24 52 24 L136 24 L136 168 L52 168 C48 168 44 164 44 160 Z"
        fill="#fafafa"
        stroke="#d1d5db"
        strokeWidth="1.5"
      />
      {/* Left page inner shadow */}
      <path
        d="M136 24 L136 168 L132 165 L132 27 Z"
        fill="#e5e7eb"
      />

      {/* Right page */}
      <path
        d="M236 32 C236 28 232 24 228 24 L144 24 L144 168 L228 168 C232 168 236 164 236 160 Z"
        fill="#fafafa"
        stroke="#d1d5db"
        strokeWidth="1.5"
      />
      {/* Right page inner shadow */}
      <path
        d="M144 24 L144 168 L148 27 L148 165 Z"
        fill="#e5e7eb"
      />

      {/* Book spine */}
      <rect x="133" y="22" width="14" height="148" rx="2" fill="#3B6D11" />

      {/* Book cover edges */}
      <path d="M44 160 C44 164 48 172 52 172 L136 172 L136 168 L52 168 C48 168 44 164 44 160Z" fill="#c8ddb0" />
      <path d="M236 160 C236 164 232 172 228 172 L144 172 L144 168 L228 168 C232 168 236 164 236 160Z" fill="#c8ddb0" />

      {/* Left cover bottom */}
      <rect x="44" y="168" width="92" height="4" rx="1" fill="#c8ddb0" />
      {/* Right cover bottom */}
      <rect x="144" y="168" width="92" height="4" rx="1" fill="#c8ddb0" />

      {/* Left page lines (decorative) */}
      <line x1="62" y1="50" x2="120" y2="50" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="62" y1="60" x2="110" y2="60" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="62" y1="70" x2="118" y2="70" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="62" y1="80" x2="105" y2="80" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />

      {/* "404" on right page — handwritten style via text */}
      <text
        x="190"
        y="108"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="52"
        fontWeight="bold"
        fill="#3B6D11"
        opacity="0.85"
      >
        404
      </text>

      {/* Small bookmark ribbon */}
      <path d="M214 22 L214 50 L220 44 L226 50 L226 22 Z" fill="#BA7517" />

      {/* Pen on left page */}
      <g transform="translate(68, 98) rotate(-30)">
        {/* Pen body */}
        <rect x="0" y="0" width="6" height="36" rx="2" fill="#BA7517" />
        {/* Pen tip */}
        <polygon points="0,36 6,36 3,44" fill="#4b5563" />
        {/* Pen clip */}
        <rect x="4.5" y="2" width="2" height="28" rx="1" fill="#9a5e10" />
        {/* Pen top */}
        <rect x="0" y="0" width="6" height="6" rx="2" fill="#9a5e10" />
      </g>

      {/* Ink stroke from pen tip (like it's writing) */}
      <path
        d="M81 148 Q95 152 105 145"
        stroke="#3B6D11"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
