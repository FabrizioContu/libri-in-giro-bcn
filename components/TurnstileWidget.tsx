"use client";
import Script from "next/script";
import { useRef, useEffect } from "react";

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark";
          size?: "normal" | "compact" | "invisible";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onExpire?: () => void;
}

// Named TurnstileWidget for import compatibility — now backed by hCaptcha
export function TurnstileWidget({ onToken, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const initWidget = () => {
    if (!containerRef.current || widgetIdRef.current || !window.hcaptcha) return;
    widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "",
      callback: onToken,
      "expired-callback": onExpire,
      theme: "light",
    });
  };

  // If script was already loaded before this component mounted, init directly
  useEffect(() => {
    if (window.hcaptcha) initWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script
        src="https://js.hcaptcha.com/1/api.js"
        strategy="afterInteractive"
        onLoad={initWidget}
      />
      <div ref={containerRef} />
    </>
  );
}
