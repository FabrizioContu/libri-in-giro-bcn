import { supabase } from "@/lib/supabase";
import { Libro } from "@/lib/types";
import { Header } from "@/components/Header";
import { HeroIntro } from "@/components/HeroIntro";
import { CatalogClient } from "./CatalogClient";

async function getLibri(): Promise<Libro[]> {
  const { data, error } = await supabase
    .from("libri")
    .select("*")
    .eq("disponibile", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching libri:", error);
    return [];
  }
  return data ?? [];
}

export const revalidate = 60;

export default async function HomePage() {
  const libri = await getLibri();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroIntro />
      <main className="flex-1">
        <CatalogClient libri={libri} />
      </main>
      <footer className="border-t border-gray-100 bg-white py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400 space-y-1">
          <p>Libri in Giro BCN &mdash; Comunità italiana di Barcellona</p>
          <p>
            <a href="/privacy" className="hover:text-gray-600 underline underline-offset-2 transition-colors">
              Privacy
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
