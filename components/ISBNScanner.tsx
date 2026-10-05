"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Keyboard } from "lucide-react";
import { ISBN13_RE } from "@/lib/isbn-lookup";

interface ISBNScannerProps {
  onDetected: (isbn: string) => void;
  onClose: () => void;
}

export function ISBNScanner({ onDetected, onClose }: ISBNScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const detectedRef = useRef(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualIsbn, setManualIsbn] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    if (manualMode) return;

    let cancelled = false;

    import("@zxing/browser").then(({ BrowserMultiFormatReader }) => {
      if (cancelled) return;

      const reader = new BrowserMultiFormatReader();

      reader
        .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (!result || detectedRef.current) return;
          const text = result.getText().replace(/-/g, "");
          if (ISBN13_RE.test(text)) {
            detectedRef.current = true;
            controlsRef.current?.stop();
            onDetected(text);
          }
        })
        .then((controls) => {
          if (cancelled) {
            controls.stop();
            return;
          }
          controlsRef.current = controls;
          setCameraReady(true);
        })
        .catch(() => {
          if (cancelled) return;
          setCameraError(true);
          setManualMode(true);
        });
    });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [manualMode, onDetected]);

  if (manualMode) {
    // Niente <form> qui: lo scanner vive dentro il form di AggiungiLibroForm e
    // un form annidato faceva un submit nativo che ricaricava la pagina.
    const submitManual = () => {
      const isbn = manualIsbn.replace(/[-\s]/g, "");
      if (ISBN13_RE.test(isbn)) onDetected(isbn);
    };

    return (
      <div className="space-y-1.5">
        {cameraError && (
          <p className="text-xs text-gray-500">
            Fotocamera non disponibile. Inserisci l&apos;ISBN a mano.
          </p>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="ISBN-13 (es. 9788804668237)"
            value={manualIsbn}
            onChange={(e) => setManualIsbn(e.target.value)}
            onKeyDown={(e) => {
              // Invio non deve inviare il form del libro
              if (e.key === "Enter") {
                e.preventDefault();
                submitManual();
              }
            }}
            className="text-sm"
            autoFocus
            inputMode="numeric"
          />
          <Button type="button" size="sm" onClick={submitManual}>
            Cerca
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose} aria-label="Chiudi">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full aspect-video object-cover"
          playsInline
          muted
        />
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-20 border-2 border-white/70 rounded" />
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Chiudi scanner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-500">Inquadra il codice a barre del libro</p>
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="text-xs text-gray-500 underline underline-offset-2 flex items-center gap-1 shrink-0"
        >
          <Keyboard className="w-3 h-3" />
          Inserisci manualmente
        </button>
      </div>
    </div>
  );
}
