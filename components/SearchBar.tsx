"use client";
import { useState, useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Libro, Genere, Barrio, GENERI, BARRIOS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  libri: Libro[];
  onFilter: (filtered: Libro[]) => void;
}

export function SearchBar({ libri, onFilter }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedGenere, setSelectedGenere] = useState<Genere | null>(null);
  const [selectedBarrio, setSelectedBarrio] = useState<Barrio | null>(null);
  const [, startTransition] = useTransition();

  const applyFilters = useCallback(
    (q: string, genere: Genere | null, barrio: Barrio | null) => {
      startTransition(() => {
        const lower = q.toLowerCase();
        const filtered = libri.filter((l) => {
          const matchesText =
            !q ||
            l.titolo.toLowerCase().includes(lower) ||
            l.autore.toLowerCase().includes(lower);
          const matchesGenere = !genere || l.genere === genere;
          const matchesBarrio = !barrio || l.barrio === barrio;
          return matchesText && matchesGenere && matchesBarrio;
        });
        onFilter(filtered);
      });
    },
    [libri, onFilter]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    applyFilters(value, selectedGenere, selectedBarrio);
  };

  const handleGenereToggle = (genere: Genere) => {
    const next = selectedGenere === genere ? null : genere;
    setSelectedGenere(next);
    applyFilters(query, next, selectedBarrio);
  };

  const handleBarrioToggle = (barrio: Barrio) => {
    const next = selectedBarrio === barrio ? null : barrio;
    setSelectedBarrio(next);
    applyFilters(query, selectedGenere, next);
  };

  const clearAll = () => {
    setQuery("");
    setSelectedGenere(null);
    setSelectedBarrio(null);
    onFilter(libri);
  };

  const hasFilters = query || selectedGenere || selectedBarrio;

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Cerca per titolo o autore..."
          className="w-full h-12 rounded-2xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B6D11] focus:border-transparent shadow-sm transition-shadow"
        />
        {query && (
          <button
            onClick={() => handleQueryChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cancella ricerca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Genre chips */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {GENERI.map((genere) => (
            <button
              key={genere}
              onClick={() => handleGenereToggle(genere)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border",
                selectedGenere === genere
                  ? "bg-[#3B6D11] text-white border-[#3B6D11] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#3B6D11] hover:text-[#3B6D11]"
              )}
            >
              {genere}
            </button>
          ))}
        </div>

        {/* Barrio chips */}
        <div className="flex flex-wrap gap-1.5">
          {BARRIOS.map((barrio) => (
            <button
              key={barrio}
              onClick={() => handleBarrioToggle(barrio)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border",
                selectedBarrio === barrio
                  ? "bg-[#3B6D11] text-white border-[#3B6D11] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#3B6D11] hover:text-[#3B6D11]"
              )}
            >
              📍 {barrio}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 hover:border-gray-400 transition-all"
            >
              Rimuovi filtri
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
