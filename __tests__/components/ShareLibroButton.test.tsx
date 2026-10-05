import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareLibroButton } from "@/components/ShareLibroButton";
import { buildShareLinks } from "@/lib/share";

const links = buildShareLinks(
  { id: "abc-123", titolo: "Il nome della rosa", autore: "Umberto Eco", barrio: "Gràcia", disponibile: true },
  "https://libri.example",
  "visitor"
);

function setShare(value: unknown) {
  Object.defineProperty(navigator, "share", { value, configurable: true, writable: true });
}

describe("ShareLibroButton", () => {
  afterEach(() => {
    setShare(undefined);
    vi.restoreAllMocks();
  });

  it("opens the native share sheet when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setShare(share);

    render(<ShareLibroButton links={links} />);
    await userEvent.click(screen.getByRole("button", { name: /condividi/i }));

    expect(share).toHaveBeenCalledWith({ title: links.title, text: links.text, url: links.url });
    expect(screen.queryByRole("link", { name: /telegram/i })).toBeNull();
  });

  it("stays quiet when the user cancels the native sheet", async () => {
    setShare(vi.fn().mockRejectedValue(new DOMException("cancel", "AbortError")));

    render(<ShareLibroButton links={links} />);
    await userEvent.click(screen.getByRole("button", { name: /condividi/i }));

    expect(screen.queryByRole("link", { name: /telegram/i })).toBeNull();
  });

  it("shows Telegram, WhatsApp and copy options without Web Share", async () => {
    setShare(undefined);

    render(<ShareLibroButton links={links} />);
    await userEvent.click(screen.getByRole("button", { name: /condividi/i }));

    expect(screen.getByRole("link", { name: /telegram/i })).toHaveAttribute("href", links.telegram);
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", links.whatsapp);
  });

  it("copies the book link", async () => {
    setShare(undefined);
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    render(<ShareLibroButton links={links} />);
    await user.click(screen.getByRole("button", { name: /condividi/i }));
    await user.click(screen.getByRole("button", { name: /copia link/i }));

    expect(writeText).toHaveBeenCalledWith(links.url);
    expect(await screen.findByText(/copiato!/i)).toBeInTheDocument();
  });
});
