import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt oss & Bestill gruppearrangement | KRS VR Arena",
  description:
    "Ta kontakt med KRS VR Arena i Kristiansand for spørsmål eller uforpliktende tilbud på teambuilding, firmaevent, utdrikningslag, bursdag og grupper opp til 64 personer.",
  alternates: {
    canonical: "https://www.krsvr.no/kontakt",
    languages: {
      "nb-NO": "https://www.krsvr.no/kontakt",
      en: "https://www.krsvr.no/en/contact",
      "x-default": "https://www.krsvr.no/en/contact",
    },
  },
  openGraph: {
    title: "Kontakt oss & Bestill gruppearrangement | KRS VR Arena",
    description:
      "Send en uforpliktende forespørsel for bedrifter, utdrikningslag, bursdager og grupper hos KRS VR Arena i Kristiansand.",
    url: "https://www.krsvr.no/kontakt",
    type: "website",
  },
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
