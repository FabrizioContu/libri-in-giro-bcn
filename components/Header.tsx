import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-[#3B6D11] transition-colors flex-shrink-0"
        >
          <Image
            src="/logo.webp"
            alt="Libri in Giro BCN"
            width={32}
            height={32}
            className="rounded-sm"
          />
          <span>
            Libri in Giro{" "}
            <span className="text-[#3B6D11]">BCN</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/aggiungi">+ Aggiungi un libro</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
