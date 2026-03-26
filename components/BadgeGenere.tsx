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

export default function BadgeGenere({ genere }: { genere?: string | null }) {
  if (!genere) return null;
  const style = GENERE_STYLE[genere] ?? GENERE_STYLE["Altro"];

  return (
    <span
      style={{
        background: style.bg,
        color: style.text,
        fontSize: "11px",
        fontWeight: 500,
        padding: "2px 10px",
        borderRadius: "10px",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {genere}
    </span>
  );
}
