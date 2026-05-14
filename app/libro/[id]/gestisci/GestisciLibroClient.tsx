"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Libro, GENERI, BARRIOS } from "@/lib/types";
import { aggiornaLibro, eliminaLibro, getRpcErrorMessage } from "@/lib/rpc";
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
import {
  Save,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Search,
  CheckCircle,
} from "lucide-react";
import { fetchCoverByTitleAuthor } from "@/lib/cover-search";

const AVATAR_EMOJIS = [
  "📚",
  "🦊",
  "🌙",
  "🌿",
  "🌻",
  "🍀",
  "🎭",
  "🎨",
  "🦋",
  "🌊",
  "⭐",
  "🎵",
  "🦉",
  "🐙",
  "🌺",
  "🍄",
];

interface GestisciLibroClientProps {
  libro: Libro;
  editToken: string;
}

export function GestisciLibroClient({
  libro,
  editToken,
}: GestisciLibroClientProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    titolo: libro.titolo,
    autore: libro.autore,
    genere: libro.genere ?? "",
    barrio: libro.barrio ?? "",
    telegram: libro.telegram ?? "",
    contattoAlt: libro.contatto_alternativo ?? "",
    copertina: libro.copertina_url ?? "",
    note: libro.note ?? "",
    disponibile: libro.disponibile,
    nickname: libro.nickname ?? "",
    avatar_emoji: libro.avatar_emoji ?? "",
  });
  const [contactTab, setContactTab] = useState<"telegram" | "altro">(
    libro.telegram ? "telegram" : "altro",
  );
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [coverSearchLoading, setCoverSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const result = await aggiornaLibro({
      p_id: libro.id,
      p_token: editToken,
      p_titolo: form.titolo,
      p_autore: form.autore,
      p_genere: form.genere || null,
      p_barrio: form.barrio || null,
      p_telegram: contactTab === "telegram" ? form.telegram || null : null,
      p_contatto_alt: contactTab === "altro" ? form.contattoAlt || null : null,
      p_copertina_url: form.copertina || null,
      p_note: form.note || null,
      p_disponibile: form.disponibile,
      p_nickname: form.nickname.trim() || null,
      p_avatar_emoji: form.avatar_emoji || null,
    });

    setLoading(false);

    if (!result.success && result.error) {
      setError(getRpcErrorMessage(result.error));
    } else {
      setSuccess(true);
      router.refresh();
    }
  };

  const handleToggleDisponibile = async () => {
    setError(null);
    const newVal = !form.disponibile;
    setForm((f) => ({ ...f, disponibile: newVal }));

    const result = await aggiornaLibro({
      p_id: libro.id,
      p_token: editToken,
      p_titolo: form.titolo,
      p_autore: form.autore,
      p_genere: form.genere || null,
      p_barrio: form.barrio || null,
      p_telegram: contactTab === "telegram" ? form.telegram || null : null,
      p_contatto_alt: contactTab === "altro" ? form.contattoAlt || null : null,
      p_copertina_url: form.copertina || null,
      p_note: form.note || null,
      p_disponibile: newVal,
      p_nickname: form.nickname.trim() || null,
      p_avatar_emoji: form.avatar_emoji || null,
    });

    if (!result.success && result.error) {
      setForm((f) => ({ ...f, disponibile: !newVal }));
      setError(getRpcErrorMessage(result.error));
    } else {
      router.refresh();
    }
  };

  const handleCoverSearch = async () => {
    setCoverSearchLoading(true);
    const url = await fetchCoverByTitleAuthor(form.titolo, form.autore);
    setCoverSearchLoading(false);
    if (url) setForm((f) => ({ ...f, copertina: url }));
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError(null);

    const result = await eliminaLibro({ p_id: libro.id, p_token: editToken });

    setDeleteLoading(false);

    if (!result.success && result.error) {
      setError(getRpcErrorMessage(result.error));
      setConfirmDelete(false);
    } else {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Availability toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Disponibilità</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {form.disponibile
              ? "Il libro è visibile nel catalogo"
              : "Il libro non appare nel catalogo"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleDisponibile}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
        >
          {form.disponibile ? (
            <>
              <ToggleRight className="w-8 h-8 text-[#3B6D11]" />
              <span className="text-[#3B6D11]">Disponibile</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-8 h-8 text-gray-400" />
              <span className="text-gray-500">Non disponibile</span>
            </>
          )}
        </button>
      </div>

      {/* Fields */}
      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900">Dettagli libro</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="titolo">Titolo *</Label>
            <Input
              id="titolo"
              value={form.titolo}
              onChange={(e) =>
                setForm((f) => ({ ...f, titolo: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="autore">Autore *</Label>
            <Input
              id="autore"
              value={form.autore}
              onChange={(e) =>
                setForm((f) => ({ ...f, autore: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Genere</Label>
            <Select
              value={form.genere}
              onValueChange={(v) => setForm((f) => ({ ...f, genere: v }))}
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
            <Label>Barrio</Label>
            <Select
              value={form.barrio}
              onValueChange={(v) => setForm((f) => ({ ...f, barrio: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona barrio" />
              </SelectTrigger>
              <SelectContent>
                {BARRIOS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          <Label>Contatto</Label>
          <Tabs
            value={contactTab}
            onValueChange={(v) => setContactTab(v as "telegram" | "altro")}
          >
            <TabsList>
              <TabsTrigger value="telegram">Telegram</TabsTrigger>
              <TabsTrigger value="altro">Altro</TabsTrigger>
            </TabsList>
            <TabsContent value="telegram">
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  @
                </span>
                <Input
                  placeholder="username"
                  value={form.telegram.replace(/^@/, "")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      telegram: e.target.value.replace(/^@/, ""),
                    }))
                  }
                  className="pl-7"
                />
              </div>
            </TabsContent>
            <TabsContent value="altro">
              <Input
                placeholder="WhatsApp, email, o altro contatto"
                value={form.contattoAlt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contattoAlt: e.target.value }))
                }
                className="mt-2"
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="copertina">URL copertina (opzionale)</Label>
          <div className="flex gap-2">
            <Input
              id="copertina"
              type="url"
              placeholder="https://..."
              value={form.copertina}
              onChange={(e) =>
                setForm((f) => ({ ...f, copertina: e.target.value }))
              }
            />
            <button
              type="button"
              onClick={handleCoverSearch}
              disabled={coverSearchLoading || !form.titolo}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {coverSearchLoading ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-gray-500" />
              )}
              <span className="hidden sm:inline text-gray-600">Cerca</span>
            </button>
          </div>
          {(coverSearchLoading || form.copertina) && (
            <div className="flex items-center gap-3 pt-1">
              <div className="shrink-0 w-11 h-14 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {coverSearchLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.copertina}
                    alt="Copertina"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-xs text-gray-400">
                {coverSearchLoading ? (
                  "Cercando copertina..."
                ) : (
                  <span className="flex items-center gap-1 text-[#3B6D11]">
                    <CheckCircle className="w-3 h-3 shrink-0" /> Copertina
                    impostata
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note">Note (opzionale)</Label>
          <Textarea
            id="note"
            placeholder="Condizioni del libro, edizione, note per il lettore..."
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
        </div>
      </div>

      {/* Avatar */}
      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900">
            Il tuo avatar{" "}
            <span className="font-normal text-gray-400 text-sm">
              (opzionale)
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Appare accanto ai tuoi libri al posto del tuo contatto.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Emoji</Label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    avatar_emoji: f.avatar_emoji === emoji ? "" : emoji,
                  }))
                }
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
            onChange={(e) =>
              setForm((f) => ({ ...f, nickname: e.target.value }))
            }
            maxLength={40}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle className="w-4 h-4 text-[#A32D2D] shrink-0 mt-0.5" />
          <p className="text-sm text-[#A32D2D]">{error}</p>
        </div>
      )}

      {success && (
        <p className="text-sm text-[#3B6D11] bg-[#EAF3DE] border border-[#3B6D11]/20 rounded-xl px-3 py-2">
          Modifiche salvate con successo!
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none sm:px-8"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvataggio...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salva modifiche
            </>
          )}
        </Button>

        <div className="sm:ml-auto">
          {!confirmDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              Elimina libro
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmDelete(false)}
              >
                Annulla
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Eliminando..." : "Conferma eliminazione"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
