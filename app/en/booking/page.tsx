import { Metadata } from "next";
import BookingFlow from "@/components/BookingFlow";

export const metadata: Metadata = {
  title: "Book VR Experience in Kristiansand | 0 NOK Upfront Online",
  description:
    "Reserve your VR Escape Room, Action Strategy (Tactical Arena), or Family VR package online at KRS VR Arena in Kristiansand. Pay 0 NOK upfront and pay by card (Visa, Mastercard, Apple Pay) upon arrival.",
  alternates: {
    canonical: "https://www.krsvr.no/en/booking",
    languages: {
      "nb-NO": "https://www.krsvr.no/booking",
      en: "https://www.krsvr.no/en/booking",
      "x-default": "https://www.krsvr.no/en/booking",
    },
  },
  openGraph: {
    title: "Book VR Experience in Kristiansand | KRS VR Arena",
    description:
      "Reserve your VR session online in seconds. 0 NOK upfront — pay by card (Visa, Mastercard, Apple Pay) upon arrival at the arena.",
    url: "https://www.krsvr.no/en/booking",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishBookingPage() {
  return (
    <main className="min-h-screen pb-20 pt-16">
      <div className="mb-10 px-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-center mb-3">
          Book VR Experience
        </h1>
        <p className="text-center text-zinc-400 font-light text-sm sm:text-base">
          Reserve online for 2–10 players · 0 NOK upfront when paying by card on arrival
        </p>
      </div>

      <div className="px-4 md:px-6 max-w-lg mx-auto">
        <BookingFlow locale="en" />
      </div>
    </main>
  );
}
