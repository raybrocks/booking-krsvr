import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | KRS VR Arena Kristiansand",
  description:
    "Read how KRS VR Arena collects and processes personal data in accordance with GDPR and applicable data protection regulations.",
  alternates: {
    canonical: "https://www.krsvr.no/en/privacy",
    languages: {
      "nb-NO": "https://www.krsvr.no/personvern",
      en: "https://www.krsvr.no/en/privacy",
      "x-default": "https://www.krsvr.no/en/privacy",
    },
  },
};

export default function EnglishPrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/en"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-light text-white mb-10 tracking-tight">
          Privacy Policy
        </h1>

        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
            This privacy policy explains how KRS VR Arena collects and processes personal data. Our focus is to provide you with a safe and enjoyable experience, and we only store the information necessary to process your booking and conduct your visit.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">
              1. Data Controller
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              KRS VR Arena (Industrigata 12, 4632 Kristiansand, Norway, Org. no. 936 318 878) is the data controller responsible for the processing of personal data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">
              2. Purpose of Processing
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              We collect personal data solely to:
            </p>
            <ul className="list-disc pl-6 text-zinc-400 space-y-2">
              <li>Receive, register, and manage your booking of VR experiences.</li>
              <li>Send booking confirmations, receipts, and practical visit information.</li>
              <li>Contact you if changes or questions arise regarding your reservation.</li>
              <li>Process secure payments via our payment partners.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">
              3. Information We Process
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              When you book with us, we ask for necessary contact details such as your name, email address, and phone number, as well as details about the booked experience (date, time, game, number of players, and optional first names/nicknames for headset preparation). Card details are handled exclusively by our certified payment providers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">
              4. Sharing of Personal Data
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              We never sell your personal data to third parties. Information is shared only with our technical service providers (such as booking database and email delivery) to the extent necessary to deliver our services under strict data processing agreements.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-medium text-white mb-4">
              5. Your Rights (GDPR)
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Under the General Data Protection Regulation (GDPR), you have the right to request access to, correction of, or deletion of your personal data (except where retention is required by Norwegian accounting law). Contact us at post@krsvr.no for any privacy-related requests.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
