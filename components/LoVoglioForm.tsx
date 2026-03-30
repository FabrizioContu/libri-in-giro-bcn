"use client";
import { useState } from "react";
import { Libro, NODI_RITIRO } from "@/lib/types";
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
import { Send, Copy, Check, ExternalLink } from "lucide-react";

interface LoVoglioFormProps {
  libro: Libro;
  onCancel: () => void;
}

export function LoVoglioForm({ libro, onCancel }: LoVoglioFormProps) {
  const [tab, setTab] = useState<"telegram" | "whatsapp" | "altro">("telegram");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [altroContatto, setAltroContatto] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [nodoRitiro, setNodoRitiro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    prestitoId: string;
    editToken: string;
    manageUrl: string;
    ownerHasTelegram: boolean;
    telegramUrl?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const contatto =
      tab === "telegram"
        ? telegramUsername.startsWith("@")
          ? telegramUsername
          : "@" + telegramUsername
        : tab === "whatsapp"
        ? whatsappNumber.replace(/\s+/g, "").replace(/^\+/, "")
        : altroContatto;

    if (
      !contatto.trim() ||
      (tab === "telegram" && contatto.trim() === "@") ||
      (tab === "whatsapp" && contatto.replace(/\D/g, "").length < 8)
    ) {
      setError("Inserisci il tuo contatto per procedere.");
      return;
    }

    setLoading(true);

    try {
      const proprietarioTipo = libro.telegram ? "telegram" : "altro";
      const proprietarioContatto = libro.telegram
        ? libro.telegram.startsWith("@")
          ? libro.telegram
          : "@" + libro.telegram
        : libro.contatto_alternativo ?? "";

      const { data, error: insertError } = await supabase
        .from("prestiti")
        .insert({
          libro_id: libro.id,
          richiedente_contatto: contatto.trim(),
          richiedente_tipo: tab,
          proprietario_contatto: proprietarioContatto,
          proprietario_tipo: proprietarioTipo,
          stato: "richiesto",
          messaggio_richiedente: messaggio.trim() || null,
          nodo_ritiro: nodoRitiro || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const prestitoId = data.id;
      const editToken = data.edit_token;
      const manageUrl = siteUrl + "/prestito/" + prestitoId + "/gestisci?token=" + editToken;

      const ownerHasTelegram = !!libro.telegram;
      let telegramUrl: string | undefined;

      if (ownerHasTelegram && libro.telegram) {
        const tgUsername = libro.telegram.replace(/^@/, "");
        const testo =
          "Ciao! Vorrei prendere in prestito \"" +
          libro.titolo +
          "\" di " +
          libro.autore +
          ". Contattami: " +
          contatto +
          ". Conferma qui: " +
          manageUrl;
        telegramUrl = "https://t.me/" + tgUsername + "?text=" + encodeURIComponent(testo);
      }

      setSuccessData({
        prestitoId,
        editToken,
        manageUrl,
        ownerHasTelegram,
        telegramUrl,
      });
    } catch (err: unknown) {
      console.error(err);
      setError("Si e verificato un errore. Riprova tra qualche secondo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!successData) return;
    await navigator.clipboard.writeText(successData.manageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (successData) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="p-4 rounded-xl bg-[#EAF3DE] border border-[#3B6D11]/20">
          <p className="font-semibold text-[#3B6D11] mb-1">Richiesta inviata!</p>
          {successData.ownerHasTelegram ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Apri Telegram per contattare il proprietario e confermare il prestito.
              </p>
              <Button asChild className="w-full" size="lg">
                <a href={successData.telegramUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Contatta su Telegram
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Il proprietario non ha Telegram. Contattalo direttamente:{" "}
                <strong>{libro.contatto_alternativo}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Comunicagli questo link per confermare il prestito:
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={successData.manageUrl}
                  className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 select-all"
                />
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900">
          Come possiamo contattarti?
        </Label>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "telegram" | "whatsapp" | "altro")}>
          <TabsList className="w-full">
            <TabsTrigger value="telegram" className="flex-1">
              Telegram
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex-1">
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="altro" className="flex-1">
              Altro
            </TabsTrigger>
          </TabsList>
          <TabsContent value="telegram">
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                @
              </span>
              <Input
                placeholder="username"
                value={telegramUsername.replace(/^@/, "")}
                onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ""))}
                className="pl-7"
                autoComplete="off"
              />
            </div>
          </TabsContent>
          <TabsContent value="whatsapp">
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">
                +
              </span>
              <Input
                placeholder="34 612 345 678"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="pl-7"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Includi il prefisso internazionale, es. 34 per la Spagna
            </p>
          </TabsContent>
          <TabsContent value="altro">
            <Input
              placeholder="Email, o come preferisci essere contattato"
              value={altroContatto}
              onChange={(e) => setAltroContatto(e.target.value)}
              className="mt-2"
              autoComplete="off"
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-1.5">
        <Label>Nodo di ritiro preferito</Label>
        <Select value={nodoRitiro} onValueChange={setNodoRitiro}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona un nodo (opzionale)" />
          </SelectTrigger>
          <SelectContent>
            {NODI_RITIRO.map((nodo) => (
              <SelectItem key={nodo} value={nodo}>
                {nodo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Messaggio (opzionale)</Label>
        <Textarea
          placeholder="Aggiungi un messaggio per il proprietario..."
          value={messaggio}
          onChange={(e) => setMessaggio(e.target.value)}
          rows={3}
        />
      </div>

      {error && (
        <p className="text-sm text-[#A32D2D] bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Annulla
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Invio...
            </span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Invia richiesta
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
