import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Libro } from "@/lib/types";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const { LibroCard } = await import("@/components/LibroCard");

const base: Libro = {
  id: "abc-123",
  titolo: "Il nome della rosa",
  autore: "Umberto Eco",
  genere: "Narrativa",
  barrio: "Gràcia",
  telegram: "test_user",
  contatto_alternativo: null,
  disponibile: true,
  copertina_url: null,
  note: null,
  edit_token: "token-xyz",
  created_at: "2024-01-01T00:00:00Z",
  nickname: null,
  avatar_emoji: null,
};

describe("LibroCard", () => {
  it("renders title and author", () => {
    render(<LibroCard libro={base} />);
    expect(screen.getByRole("heading", { name: "Il nome della rosa" })).toBeInTheDocument();
    expect(screen.getAllByText("Umberto Eco").length).toBeGreaterThan(0);
  });

  it("renders cover image when copertina_url is set", () => {
    const libro = { ...base, copertina_url: "https://example.com/cover.jpg" };
    render(<LibroCard libro={libro} />);
    const img = screen.getByAltText("Copertina di Il nome della rosa");
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("shows no cover img when copertina_url is null", () => {
    render(<LibroCard libro={base} />);
    expect(screen.queryByAltText(/copertina/i)).not.toBeInTheDocument();
  });

  it("links to the libro detail page", () => {
    render(<LibroCard libro={base} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/libro/abc-123");
  });
});
