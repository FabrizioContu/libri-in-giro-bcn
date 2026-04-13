"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GENERI, BARRIOS } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { BookPlus, AlertTriangle } from "lucide-react";

export function AggiungiLibroForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    titolo: "",
    autore: "",
    genere: "",
    barrio: "",
    telegram: "",
    contattoAlt: "",
    copertina: "",
    note: "",
  });
  const [contactTab, setContactTab] = useState<"telegram" | "altro">("telegram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.titolo.trim()) {
      setError("Il titolo è obbligatorio.");
      return;
    }
    if (!form.autore.trim()) {
      setError("Il nome dell'autore è obbligatorio.");
      return;
    }
    if (!form.genere) {
      setError("Seleziona un genere.");
      return;
    }
    if (!form.barrio) {
      setError("Seleziona un barrio.");
      return;
    }
    const contatto =
      contactTab === "telegram" ? form.telegram.trim() : form.contattoAlt.trim();
    if (!contatto) {
      setError("Inserisci almeno un contatto.");
      return;
    }

    setLoading(true);

    try {
      const telegramVal =
        contactTab === "telegram"
          ? form.telegram.trim().replace(/^@/, "") || null
          : null;
      const contattoAltVal =
        contactTab === "altro" ? form.contattoAlt.trim() || null : null;

      const { data, error: insertError } = await supabase
        .from("libri")
        .insert({
          titolo: form.titolo.trim(),
          autore: form.autore.trim(),
          genere: form.genere || null,
          barrio: form.barrio || null,
          telegram: telegramVal,
          contatto_alternativo: contattoAltVal,
          disponibile: true,
          copertina_url: form.copertina.trim() || null,
          note: form.note.trim() || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Salva il token localmente per recupero futuro dalla pagina del libro
      try {
        const stored = JSON.parse(localStorage.getItem("lgbcn_tokens") ?? "{}");
        stored[data.id] = data.edit_token;
        localStorage.setItem("lgbcn_tokens", JSON.stringify(stored));
      } catch {
        // localStorage non disponibile — non bloccare il flusso
      }

      router.push("/libro/" + data.id + "?nuovo=true");
    } catch (err: unknown) {
      console.error(err);
      setError("Si è verificato un errore durante l'inserimento. Riprova.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Dettagli del libro</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="titolo">
              Titolo <span className="text-[#A32D2D]">*</span>
            </Label>
            <Input
              id="titolo"
              placeholder="Es. Il nome della rosa"
              value={form.titolo}
              onChange={(e) => setForm((f) => ({ ...f, titolo: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="autore">
              Autore <span className="text-[#A32D2D]">*</span>
            </Label>
            <Input
              id="autore"
              placeholder="Es. Umberto Eco"
              value={form.autore}
              onChange={(e) => setForm((f) => ({ ...f, autore: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Genere <span className="text-[#A32D2D]">*</span>
            </Label>
            <Select
              value={form.genere}
              onValueChange={(v) => setForm((f) => ({ ...f, genere: v }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona genere" />
              </SelectTrigger>
              <SelectContent>
                {GENERI.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>
              Barrio <span className="text-[#A32D2D]">*</span>
            </Label>
            <Select
              value={form.barrio}
              onValueChange={(v) => setForm((f) => ({ ...f, barrio: v }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona il tuo barrio" />
              </SelectTrigger>
              <SelectContent>
                {BARRIOS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              Il tuo barrio abituale — serve per organizzare il ritiro.
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
        <div>
          <h2 className="font-semibold text-gray-900">
            Contatto <span className="text-[#A32D2D]">*</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Come vuoi essere contattato dai lettori interessati?
          </p>
        </div>
        <Tabs
          value={contactTab}
          onValueChange={(v) => setContactTab(v as "telegram" | "altro")}
        >
          <TabsList>
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="altro">WhatsApp</TabsTrigger>
          </TabsList>
          <TabsContent value="telegram">
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                @
              </span>
              <Input
                placeholder="il_tuo_username"
                value={form.telegram.replace(/^@/, "")}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    telegram: e.target.value.replace(/^@/, ""),
                  }))
                }
                className="pl-7"
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Il tuo nome profilo non sarà visibile — solo il link al tuo Telegram.
            </p>
          </TabsContent>
          <TabsContent value="altro">
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">
                +
              </span>
              <Input
                placeholder="34 612 345 678"
                value={form.contattoAlt}
                onChange={(e) => setForm((f) => ({ ...f, contattoAlt: e.target.value }))}
                className="pl-7"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Includi il prefisso internazionale, es. 34 per la Spagna
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Privacy notice */}
      <p className="text-xs text-gray-400 -mt-2 px-1">
        Il tuo contatto sarà visibile nella pagina pubblica del libro per permettere ai lettori di
        contattarti.{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600">
          Privacy
        </Link>
      </p>

      {/* Optional fields */}
      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Informazioni aggiuntive</h2>

        <div className="space-y-1.5">
          <Label htmlFor="copertina">URL copertina (opzionale)</Label>
          <Input
            id="copertina"
            type="url"
            placeholder="https://upload.wikimedia.org/..."
            value={form.copertina}
            onChange={(e) => setForm((f) => ({ ...f, copertina: e.target.value }))}
          />
          <p className="text-xs text-gray-400">
            Cerca il libro su{" "}
            <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-600">
              openlibrary.org
            </a>
            {" "}o Google Immagini, poi clic destro sull&apos;immagine → Copia indirizzo immagine.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note">Note (opzionale)</Label>
          <Textarea
            id="note"
            placeholder="Condizioni del libro, edizione, qualcosa da sapere..."
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle className="w-4 h-4 text-[#A32D2D] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#A32D2D]">{error}</p>
        </div>
      )}

      <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Inserimento in corso...
          </span>
        ) : (
          <>
            <BookPlus className="w-4 h-4" />
            Aggiungi al catalogo
          </>
        )}
      </Button>
    </form>
  );
}
