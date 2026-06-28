import type { NextConfig } from "next";
import path from "path";

// Hosts that the browser is legitimately allowed to talk to.
// Supabase: il client anon viene usato lato browser (rpc, select).
// hCaptcha: script + iframe della verifica anti-bot.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "");
const supabaseWs = supabaseHost ? `wss://${supabaseHost}` : "";

const csp = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval' restano necessari finché non si introduce
  // una CSP basata su nonce via middleware (Next inietta script inline).
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://*.hcaptcha.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.hcaptcha.com ${supabaseUrl} ${supabaseWs}`.replace(/\s+/g, " ").trim(),
  "frame-src https://*.hcaptcha.com https://hcaptcha.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.5.0.2"],
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days — covers never change
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
