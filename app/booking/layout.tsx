import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book VR-opplevelse i Kristiansand | KRS VR Arena",
  description:
    "Bestill din VR-opplevelse hos KRS VR Arena på Lund i Kristiansand. Velg mellom VR Escape Rooms, Tactical Arena, Zombie Shooter og Familiepakker. 0 kr å betale på nett ved valg av kortterminal i arenaen.",
  alternates: {
    canonical: "https://www.krsvr.no/booking",
    languages: {
      "nb-NO": "https://www.krsvr.no/booking",
      en: "https://www.krsvr.no/en/booking",
      "x-default": "https://www.krsvr.no/en/booking",
    },
  },
  openGraph: {
    title: "Book VR-opplevelse i Kristiansand | KRS VR Arena",
    description:
      "Reserver spilletid enkelt på nett hos KRS VR Arena i Kristiansand.",
    url: "https://www.krsvr.no/booking",
    type: "website",
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
