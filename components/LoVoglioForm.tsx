"use client";
import { useState } from "react";
import { Libro, NODI_RITIRO } from "@/lib/types";
import { createPrestito } from "@/app/actions/prestiti";
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
import { Send, Copy, Check, ExternalLink } from "lucide-react";

interface LoVoglioFormProps {
  libro: Libro;
  onCancel: () => void;
}

export function LoVoglioForm({ libro, onCancel }: LoVoglioFormProps) {
  const [tab, setTab] = useState<"telegram" | "whatsapp">("telegram");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [nodoRitiro, setNodoRitiro] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    prestitoId: string;
    editToken: string;
    manageUrl: string;
    richiedenteTab: "telegram" | "whatsapp";
    ownerHasTelegram: boolean;
    notifySent: boolean;
    telegramUrl?: string;
    whatsappUrl?: string;
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
        : whatsappNumber.replace(/\s+/g, "").replace(/^\+/, "");

    if (
      !contatto.trim() ||
      (tab === "telegram" && contatto.trim() === "@") ||
      (tab === "whatsapp" && contatto.replace(/\D/g, "").length < 8)
    ) {
      setError("Inserisci il tuo contatto per procedere.");
      return;
    }

    if (!turnstileToken) {
      setError("Attendere il completamento della verifica di sicurezza.");
      return;
    }

    setLoading(true);

    try {
      const proprietarioTipo = libro.telegram ? "telegram" : "whatsapp";
      const proprietarioContatto = libro.telegram
        ? libro.telegram.startsWith("@")
          ? libro.telegram
          : "@" + libro.telegram
        : libro.contatto_alternativo ?? "";

      const result = await createPrestito({
        libro_id: libro.id,
        richiedente_contatto: contatto.trim(),
        richiedente_tipo: tab,
        proprietario_contatto: proprietarioContatto,
        proprietario_tipo: proprietarioTipo,
        messaggio_richiedente: messaggio.trim() || null,
        nodo_ritiro: nodoRitiro || null,
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

      const prestitoId = result.id;
      const editToken = result.edit_token;
      const manageUrl = siteUrl + "/prestito/" + prestitoId + "/gestisci?token=" + editToken;

      const ownerHasTelegram = !!libro.telegram;

      // La notifica automatica al proprietario viene inviata lato server da
      // createPrestito, con dati validati. Qui leggiamo solo l'esito.
      const notifySent = result.notifySent;

      // Messaggio in prima persona — il richiedente lo manda direttamente al proprietario
      const contattoLabel =
        tab === "telegram"
          ? "Telegram: " + contatto
          : "WhatsApp: +" + contatto;

      const testoManuale =
        "Ciao! Vorrei prendere in prestito \"" +
        libro.titolo +
        "\" di " +
        libro.autore +
        ". Puoi contattarmi su " +
        contattoLabel +
        ". Gestisci la richiesta qui: " +
        manageUrl;

      // Genera sempre tutti i link disponibili verso il proprietario
      let telegramUrl: string | undefined;
      let whatsappUrl: string | undefined;

      if (libro.telegram) {
        const tgUsername = libro.telegram.replace(/^@/, "");
        telegramUrl = "https://t.me/" + tgUsername + "?text=" + encodeURIComponent(testoManuale);
      }
      if (libro.contatto_alternativo) {
        const numero = libro.contatto_alternativo.replace(/\D/g, "");
        whatsappUrl = "https://wa.me/" + numero + "?text=" + encodeURIComponent(testoManuale);
      }

      setSuccessData({
        prestitoId,
        editToken,
        manageUrl,
        richiedenteTab: tab,
        ownerHasTelegram,
        notifySent,
        telegramUrl,
        whatsappUrl,
      });
    } catch (err: unknown) {
      console.error(err);
      setError("Si è verificato un errore. Riprova tra qualche secondo.");
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
        {successData.notifySent ? (
          <div className="p-4 rounded-xl bg-[#EAF3DE] border border-[#3B6D11]/20">
            <p className="font-semibold text-[#3B6D11] mb-1">Richiesta inviata!</p>
            <p className="text-sm text-gray-700">
              Il proprietario ha ricevuto una notifica automatica su Telegram con il tuo contatto.
            </p>
          </div>
        ) : (successData.telegramUrl || successData.whatsappUrl) ? (
          <div className="space-y-3">
            {successData.telegramUrl && (
              <>
                <Button asChild className="w-full" size="lg">
                  <a href={successData.telegramUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Contatta il proprietario su Telegram
                  </a>
                </Button>
                {successData.richiedenteTab === "whatsapp" && (
                  <p className="text-xs text-gray-400 text-center">
                    Il messaggio include già il tuo numero WhatsApp.
                  </p>
                )}
              </>
            )}
            {successData.whatsappUrl && (
              <Button asChild className="w-full" size="lg" variant={successData.telegramUrl ? "outline" : "default"}>
                <a href={successData.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Contatta il proprietario su WhatsApp
                </a>
              </Button>
            )}
            <p className="text-xs text-gray-400 text-center">
              Il messaggio è già pre-compilato con il tuo contatto.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#EAF3DE] border border-[#3B6D11]/20 space-y-2">
            <p className="font-semibold text-[#3B6D11]">Richiesta inviata!</p>
            <p className="text-sm text-gray-600">
              Condividi questo link con il proprietario per confermare il prestito:
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
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900">
          Come possiamo contattarti?
        </Label>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "telegram" | "whatsapp")}>
          <TabsList className="w-full">
            <TabsTrigger value="telegram" className="flex-1">
              Telegram
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex-1">
              WhatsApp
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
        </Tabs>
        <p className="text-xs text-gray-400 pt-1">
          Il tuo contatto sarà condiviso solo con il proprietario del libro per organizzare il
          prestito.{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600">
            Privacy
          </Link>
        </p>
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
