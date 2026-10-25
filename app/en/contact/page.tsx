import React from "react";
import { Metadata } from "next";
import { EnglishContactForm } from "./EnglishContactForm";

export const metadata: Metadata = {
  title: "Contact Us & Group Inquiry (10–64 Players) | KRS VR Arena Kristiansand",
  description:
    "Send an inquiry for corporate team building, bachelor/bachelorette parties, birthday celebrations, or groups of 10–64 players at KRS VR Arena, Industrigata 12, 4632 Kristiansand.",
  alternates: {
    canonical: "https://www.krsvr.no/en/contact",
    languages: {
      "nb-NO": "https://www.krsvr.no/kontakt",
      en: "https://www.krsvr.no/en/contact",
      "x-default": "https://www.krsvr.no/en/contact",
    },
  },
  openGraph: {
    title: "Contact Us & Group Inquiry | KRS VR Arena Kristiansand",
    description:
      "Get in touch or request a tailored proposal for groups of 10–64 participants at KRS VR Arena in Kristiansand.",
    url: "https://www.krsvr.no/en/contact",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishContactPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <EnglishContactForm />
    </React.Suspense>
  );
}
