"use client";
import { useState } from "react";
import Image from "next/image";
import CopertinaPH from "./CopertinaPH";

interface Props {
  src: string;
  titolo: string;
  autore: string;
  genere?: string | null;
}

export default function CopertinaImage({ src, titolo, autore, genere }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <CopertinaPH autore={autore} genere={genere} size="lg" />;
  }

  return (
    <Image
      src={src}
      alt={"Copertina di " + titolo}
      fill
      sizes="220px"
      className="object-cover"
      priority
      onError={() => setFailed(true)}
    />
  );
}
