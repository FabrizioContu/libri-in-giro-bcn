const GENERE_STYLE: Record<string, { bg: string; text: string }> = {
  Narrativa: { bg: "#EAF3DE", text: "#27500A" },
  Saggistica: { bg: "#E6F1FB", text: "#0C447C" },
  "Gialli / Thriller": { bg: "#FAEEDA", text: "#633806" },
  "Romanzo storico": { bg: "#EEEDFE", text: "#3C3489" },
  "Fantasy / Fantascienza": { bg: "#FAECE7", text: "#712B13" },
  Poesia: { bg: "#FBEAF0", text: "#72243E" },
  "Bambini / Ragazzi": { bg: "#E1F5EE", text: "#085041" },
  Altro: { bg: "#F1EFE8", text: "#444441" },
};

interface Props {
  autore: string;
  genere?: string | null;
  size?: "sm" | "lg";
}

export default function CopertinaPH({ autore, genere, size = "sm" }: Props) {
  const lettera = autore.split(" ").pop()?.[0].toUpperCase() ?? "?";
  const style = GENERE_STYLE[genere ?? ""] ?? GENERE_STYLE["Altro"];
  const fontSize = size === "lg" ? "5rem" : "2.5rem";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: style.bg,
        color: style.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 500,
        borderRadius: "inherit",
      }}
    >
      {lettera}
    </div>
  );
}
