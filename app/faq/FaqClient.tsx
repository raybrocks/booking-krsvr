"use client";

import React from "react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "motion/react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  return (
    <>
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-10 text-center px-4"
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter">
          Ofte Stilte Spørsmål
        </h1>
        <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
          Her finner du svar på de vanligste spørsmålene. Finner du ikke svar på det du leter etter, ta gjerne <Link href="/kontakt" className="text-[#9C39FF] hover:text-white transition-colors underline underline-offset-4">kontakt med oss</Link>.
        </p>
      </motion.div>

      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="bg-zinc-950/80 border border-zinc-800/50 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl"
      >
        <Accordion className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/5 last:border-0 px-2 py-2">
              <AccordionTrigger className="text-left text-lg md:text-xl font-medium text-zinc-100 hover:text-white hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 text-base md:text-lg leading-relaxed pt-2 pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </>
  );
}
