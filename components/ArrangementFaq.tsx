"use client";

import React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface ArrangementFaqProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  faqs: FaqItem[];
  contactHref?: string;
  contactLabel?: string;
}

export function ArrangementFaq({
  badge = "Spørsmål og svar",
  title = "Ofte stilte spørsmål",
  subtitle = "Her finner du svar på de vanligste spørsmålene om opplegg, fasiliteter og gjennomføring.",
  faqs,
  contactHref = "/kontakt",
  contactLabel = "Send oss en melding",
}: ArrangementFaqProps) {
  return (
    <section className="mt-20 md:mt-28">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#9C39FF] bg-[#9C39FF]/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          {badge}
        </span>
        <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-white">
          {title}
        </h2>
        <p className="mt-3 text-zinc-400 text-sm md:text-base leading-relaxed font-light">
          {subtitle}
        </p>
      </div>

      {/* ACCORDION CONTAINER */}
      <div className="bg-zinc-950/70 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <Accordion className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border-b border-white/5 last:border-0 px-2 py-2"
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-medium text-zinc-100 hover:text-[#9C39FF] hover:no-underline py-4 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-sm md:text-base leading-relaxed pt-1 pb-5 font-light">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* FOOTER HINT */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-zinc-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <MessageCircle className="w-4 h-4 text-[#9C39FF] shrink-0" />
            <span>
              Har dere spesielle ønsker eller spørsmål som ikke er besvart her?
            </span>
          </div>
          <Link
            href={contactHref}
            className="text-[#9C39FF] hover:text-white font-medium transition-colors underline underline-offset-4 shrink-0"
          >
            {contactLabel} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
