"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyTokenButtonProps {
  token: string;
  libroId: string;
  siteUrl: string;
}

export function CopyTokenButton({ token, libroId, siteUrl }: CopyTokenButtonProps) {
  const [copied, setCopied] = useState(false);
  const url = `${siteUrl}/libro/${libroId}/gestisci?token=${token}`;

  return (
    <Button
      variant="outline"
      size="sm"
      className="shrink-0 border-[#3B6D11]/30 text-[#3B6D11] hover:bg-[#EAF3DE]"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
}
