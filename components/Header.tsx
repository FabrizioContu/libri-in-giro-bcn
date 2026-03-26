import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-[#3B6D11] transition-colors flex-shrink-0"
        >
          <BookOpen className="w-6 h-6 text-[#3B6D11]" aria-hidden="true" />
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
