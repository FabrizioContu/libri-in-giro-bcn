import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Libri in Giro BCN",
  description:
    "Condividi e prendi in prestito libri con la comunità italiana di Barcellona.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.webp", type: "image/webp" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo.webp",
    shortcut: "/logo.webp",
  },
  openGraph: {
    title: "Libri in Giro BCN",
    description:
      "Condividi e prendi in prestito libri con la comunità italiana di Barcellona.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="py-4 text-center text-xs text-gray-400">
          Sviluppato da{" "}
          <a
            href="https://fabriziocontu.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[#3B6D11] transition-colors"
          >
            FabriDev
          </a>
        </footer>
      </body>
    </html>
  );
}
