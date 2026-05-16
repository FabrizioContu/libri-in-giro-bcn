"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GENERI, BARRIOS } from "@/lib/types";
import { createLibro } from "@/app/actions/libri";
import { TurnstileWidget } from "@/components/TurnstileWidget";
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
import { BookPlus, AlertTriangle, Scan, CheckCircle } from "lucide-react";
import { ISBNScanner } from "@/components/ISBNScanner";
import { fetchCoverByTitleAuthor } from "@/lib/cover-search";

const AVATAR_EMOJIS = ["📚","🦊","🌙","🌿","🌻","🍀","🎭","🎨","🦋","🌊","⭐","🎵","🦉","🐙","🌺","🍄"];

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
    nickname: "",
    avatar_emoji: "",
  });
  const [contactTab, setContactTab] = useState<"telegram" | "altro">("telegram");

  useEffect(() => {
    try {
      const savedNickname = localStorage.getItem("lgbcn_nickname") ?? "";
      const savedEmoji = localStorage.getItem("lgbcn_avatar_emoji") ?? "";
      if (savedNickname || savedEmoji) {
        setForm((f) => ({ ...f, nickname: savedNickname, avatar_emoji: savedEmoji }));
      }
    } catch { /* localStorage non disponibile */ }
  }, []);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnSource, setIsbnSource] = useState<string | null>(null);
  const [coverSearchLoading, setCoverSearchLoading] = useState(false);
  const [coverAutoFound, setCoverAutoFound] = useState(false);
  const copertinaCurrent = useRef(form.copertina);
  copertinaCurrent.current = form.copertina;

  const handleIsbnDetected = async (isbn: string) => {
    setShowScanner(false);
    setIsbnLoading(true);
    setError(null);
    try {
      const olRes = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const olData = await olRes.json();
      const olBook = olData[`ISBN:${isbn}`];
      if (olBook) {
        // ISBN-based cover URL is more reliable than the OLID-based one returned by the API
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        setForm((f) => ({
          ...f,
          titolo: olBook.title || f.titolo,
          autore: olBook.authors?.[0]?.name || f.autore,
          copertina: coverUrl,
        }));
        setIsbnSource(isbn);
        return;
      }
      const gbRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      const gbData = await gbRes.json();
      const gbBook = gbData.items?.[0]?.volumeInfo;
      if (gbBook) {
        setForm((f) => ({
          ...f,
          titolo: gbBook.title || f.titolo,
          autore: gbBook.authors?.[0] || f.autore,
          copertina:
            gbBook.imageLinks?.thumbnail?.replace("http:", "https:") ||
            f.copertina,
        }));
        setIsbnSource(isbn);
        return;
      }
      setError("ISBN non trovato nelle banche dati. Inserisci i dettagli manualmente.");
    } catch {
      setError("Errore durante la ricerca del libro. Riprova.");
    } finally {
      setIsbnLoading(false);
    }
  };

  useEffect(() => {
    if (isbnSource) return;
    if (form.titolo.trim().length < 3 || form.autore.trim().length < 2) return;

    const tid = setTimeout(async () => {
      if (copertinaCurrent.current) return;
      setCoverSearchLoading(true);
      const url = await fetchCoverByTitleAuthor(form.titolo, form.autore);
      setCoverSearchLoading(false);
      if (url) {
        setForm((f) => ({ ...f, copertina: f.copertina || url }));
        setCoverAutoFound(true);
      }
    }, 1000);

    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.titolo, form.autore, isbnSource]);

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

    if (!turnstileToken) {
      setError("Attendere il completamento della verifica di sicurezza.");
      return;
    }

    setLoading(true);

    const telegramVal =
      contactTab === "telegram"
        ? form.telegram.trim().replace(/^@/, "") || null
        : null;
    const contattoAltVal =
      contactTab === "altro" ? form.contattoAlt.trim() || null : null;

    const result = await createLibro({
      titolo: form.titolo.trim(),
      autore: form.autore.trim(),
      genere: form.genere,
      barrio: form.barrio,
      telegram: telegramVal,
      contatto_alternativo: contattoAltVal,
      copertina_url: form.copertina.trim() || null,
      note: form.note.trim() || null,
      nickname: form.nickname.trim() || null,
      avatar_emoji: form.avatar_emoji || null,
      captchaToken: turnstileToken,
      honeypot,
    });

    if (!result.success) {
      setError(result.error);
      setTurnstileToken(null);
      setTurnstileKey((k) => k + 1);
      setLoading(false);
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem("lgbcn_tokens") ?? "{}");
      stored[result.id] = result.edit_token;
      localStorage.setItem("lgbcn_tokens", JSON.stringify(stored));
      if (form.nickname.trim()) localStorage.setItem("lgbcn_nickname", form.nickname.trim());
      if (form.avatar_emoji) localStorage.setItem("lgbcn_avatar_emoji", form.avatar_emoji);
    } catch {
      // localStorage non disponibile — non bloccare il flusso
    }

    router.push("/libro/" + result.id + "?nuovo=true");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Dettagli del libro</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowScanner(true)}
            disabled={isbnLoading}
            className="gap-1.5"
          >
            {isbnLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <Scan className="w-3.5 h-3.5" />
            )}
            {isbnLoading ? "Ricerca..." : "Scansiona ISBN"}
          </Button>
        </div>

        {showScanner && (
          <ISBNScanner
            onDetected={handleIsbnDetected}
            onClose={() => setShowScanner(false)}
          />
        )}

        {isbnSource && !isbnLoading && (
          <div className="flex items-center gap-1.5 text-xs text-[#3B6D11]">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            Dati importati dall&apos;ISBN {isbnSource} — verifica e completa i campi
          </div>
        )}

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

        {(coverSearchLoading || form.copertina) && (
          <div className="flex items-center gap-3 pt-1">
            <div className="shrink-0 w-11 h-14 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {coverSearchLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.copertina} alt="Copertina" className="w-full h-full object-cover" />
              )}
            </div>
            <p className="text-xs text-gray-400">
              {coverSearchLoading
                ? "Cercando copertina..."
                : coverAutoFound
                ? <span className="text-[#3B6D11] flex items-center gap-1"><CheckCircle className="w-3 h-3 shrink-0" /> Copertina trovata automaticamente</span>
                : isbnSource
                ? <span className="text-[#3B6D11] flex items-center gap-1"><CheckCircle className="w-3 h-3 shrink-0" /> Copertina dall&apos;ISBN</span>
                : "Copertina impostata"}
            </p>
          </div>
        )}

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
            <p className="text-xs text-[#3B6D11] mt-1.5 font-medium">
              Per ricevere notifiche automatiche quando qualcuno richiede il tuo libro,{" "}
              <a
                href="https://t.me/LibriInGiroBot?start=1"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                avvia @LibriInGiroBot
              </a>
              .
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

      {/* Avatar */}
      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Il tuo avatar <span className="font-normal text-gray-400 text-sm">(opzionale)</span></h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Scegli un soprannome e un&apos;emoji — apparirà accanto ai tuoi libri al posto del tuo contatto.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Emoji</Label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm((f) => ({ ...f, avatar_emoji: f.avatar_emoji === emoji ? "" : emoji }))}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                  form.avatar_emoji === emoji
                    ? "border-[#3B6D11] bg-[#EAF3DE] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nickname">Soprannome</Label>
          <Input
            id="nickname"
            placeholder="Es. La lettrice di Gràcia"
            value={form.nickname}
            onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
            maxLength={40}
          />
        </div>
      </div>

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
            Trovata automaticamente dal titolo. Puoi incollarla manualmente se vuoi cambiare.
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

      {/* Honeypot — hidden from humans, filled by bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: "none" }}
        autoComplete="off"
      />

      <TurnstileWidget
        key={turnstileKey}
        onToken={setTurnstileToken}
        onExpire={() => setTurnstileToken(null)}
      />

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle className="w-4 h-4 text-[#A32D2D] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#A32D2D]">{error}</p>
        </div>
      )}

      <Button type="submit" size="lg" disabled={loading || isbnLoading} className="w-full sm:w-auto">
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
