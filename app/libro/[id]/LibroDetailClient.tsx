"use client";
import { useState } from "react";
import { Libro, Prestito } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LoVoglioForm } from "@/components/LoVoglioForm";

interface LibroDetailClientProps {
  libro: Libro;
  activeLoan?: Prestito;
}

export function LibroDetailClient({ libro, activeLoan }: LibroDetailClientProps) {
  const [showForm, setShowForm] = useState(false);

  if (!libro.disponibile || activeLoan) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
        <p className="text-sm text-gray-600 font-medium">
          Questo libro è attualmente in prestito.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Torna a controllare più tardi o esplora altri libri nel catalogo.
        </p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-900">Richiedi questo libro</h3>
        <LoVoglioForm libro={libro} onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowForm(true)}>
      Lo voglio!
    </Button>
  );
}
