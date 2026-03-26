"use client";
import { useState, useCallback } from "react";
import { Libro } from "@/lib/types";
import { SearchBar } from "@/components/SearchBar";
import { LibroCard } from "@/components/LibroCard";
import { BookOpen } from "lucide-react";

interface CatalogClientProps {
  libri: Libro[];
}

export function CatalogClient({ libri }: CatalogClientProps) {
  const [filtered, setFiltered] = useState<Libro[]>(libri);

  const handleFilter = useCallback((result: Libro[]) => {
    setFiltered(result);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Search & filters */}
      <SearchBar libri={libri} onFilter={handleFilter} />

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "libro disponibile" : "libri disponibili"}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3DE] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#3B6D11]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">Nessun libro trovato</p>
            <p className="text-gray-500 text-sm mt-1">
              Prova a modificare i filtri o aggiungi il primo libro!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map((libro) => (
            <LibroCard key={libro.id} libro={libro} />
          ))}
        </div>
      )}
    </div>
  );
}
