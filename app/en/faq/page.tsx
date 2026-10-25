import React from "react";
import { Metadata } from "next";
import { FaqClient } from "@/app/faq/FaqClient";

const faqs = [
  {
    question: "How do international visitors pay? Do I need the Norwegian Vipps app?",
    answer:
      "No, you do not need Vipps. When booking online on our English booking page (/en/booking), 'Pay on arrival in the arena (0 NOK upfront)' is pre-selected by default. You simply reserve your time slot online for free and pay by card terminal (Visa, Mastercard, Apple Pay, or cash) when you arrive at the arena.",
  },
  {
    question: "Are the games and instructions available in English or German?",
    answer:
      "Yes! All our gamemasters speak fluent English and guide your group safely through the entire visit. Inside the VR headsets, all games are available in English, and the majority of our VR Escape Rooms and family games also feature German, French, and Spanish in-game audio/text.",
  },
  {
    question: "How far is KRS VR Arena from the Kristiansand ferry port and city center?",
    answer:
      "We are located at Industrigata 12, 4632 Kristiansand (Lund) — only a 5-minute drive from the Color Line and Fjord Line ferry terminal and right off the E18 highway. Free street parking is available in the immediate area.",
  },
  {
    question: "Can you accommodate groups larger than 10 people?",
    answer:
      "Yes, we welcome groups of up to 64 people! Up to 10 players play simultaneously in our social tournament format. While one team plays in the arena, the rest follow the live action on our big screen (spectator view), check scorecards, and relax in the party lounge. By pre-order, we also offer bar packages (beer/cider or wine/sparkling) and hot local pizza delivery.",
  },
  {
    question: "Can we bring our own food, cake, or drinks?",
    answer:
      "For children's birthday parties, you are very welcome to bring your own birthday cake, snacks, candy, and soda to the party lounge. For corporate team building, company events, adult birthdays (18+), and bachelor/bachelorette parties, outside food and beverages are not permitted — instead, we offer pre-ordered bar packages (cold beer/cider/soft drinks or quality wine & sparkling) and coordinate delivery of fresh, hot local pizza directly to the lounge.",
  },
  {
    question: "What is included in the price?",
    answer:
      "The price includes a 90-minute total visit: registration and safety briefing, approximately 60 minutes of active in-game time in wireless VR, group photos after the game, complimentary drinking water, and 30 minutes of access to our party lounge after your session.",
  },
  {
    question: "Do we need any prior VR experience?",
    answer:
      "Not at all. Our experiences are designed to be intuitive and comfortable for everyone — regardless of age or previous gaming experience. Your group gets a dedicated gamemaster who provides a calm introduction to the equipment and assists you throughout the entire session.",
  },
  {
    question: "When should we arrive?",
    answer:
      "Please arrive on time so you do not lose any game time. We start registration and the safety briefing at your scheduled start time so you get maximum time inside the virtual arena.",
  },
  {
    question: "What should I wear, and can I wear glasses?",
    answer:
      "Because you walk freely around our large wireless VR arenas, we recommend comfortable clothing (such as a t-shirt) and flat shoes. Normal eyeglasses fit inside our VR headsets, though contact lenses provide the most comfortable fit if you use them.",
  },
  {
    question: "What are the Family Package Kids (8–12) and Family Package Youth (12+)?",
    answer:
      "For families who want a shared holiday activity, we offer two dedicated packages: Family Package Kids (ages 8–12) with safe, engaging cooperative games that children master easily, and Family Package Youth (ages 12+) with more action, cooperative missions, and friendly competition for teens and parents. Both include a 90-minute visit with a gamemaster and lounge access.",
  },
  {
    question: "Is KRS VR Arena a good indoor activity when it rains in Kristiansand?",
    answer:
      "Absolutely. Our 300 sqm indoor facility with two wireless free-roam arenas is one of Southern Norway's best rainy-day activities for families, tourists, groups of friends, and colleagues.",
  },
  {
    question: "How does cancellation or changing player count work?",
    answer:
      "You can cancel free of charge up to 48 hours before your scheduled session. You can also adjust your participant count and enter player names anytime via the 'Manage Booking' link in your confirmation email.",
  },
];

export const metadata: Metadata = {
  title: "FAQ – Frequently Asked Questions | KRS VR Arena Kristiansand",
  description:
    "Find answers to common questions about visiting KRS VR Arena in Kristiansand: tourist payment (0 NOK upfront), English & German game languages, family packages, age limits, parking, and group events.",
  keywords: [
    "FAQ VR Kristiansand",
    "KRS VR Arena questions",
    "VR age limit Kristiansand",
    "Indoor activity Kristiansand rain",
    "Things to do in Kristiansand with kids",
    "Family VR package Norway",
  ],
  alternates: {
    canonical: "https://www.krsvr.no/en/faq",
    languages: {
      "nb-NO": "https://www.krsvr.no/faq",
      en: "https://www.krsvr.no/en/faq",
      "x-default": "https://www.krsvr.no/en/faq",
    },
  },
  openGraph: {
    title: "FAQ – Frequently Asked Questions | KRS VR Arena",
    description:
      "Everything you need to know before visiting our wireless free-roam VR arena in Kristiansand, Norway.",
    url: "https://www.krsvr.no/en/faq",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishFaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-black pt-16 pb-20 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <FaqClient faqs={faqs} locale="en" />
      </div>
    </main>
  );
}
