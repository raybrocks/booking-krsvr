"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { MapPin, Mail, Phone, Clock, Send, Users } from "lucide-react";

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Det oppstod en feil ved sending av meldingen. Vennligst prøv igjen senere.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-black pt-16 pb-20 relative overflow-hidden">
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-10 text-center px-4"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter">
            Kontakt Oss
          </h1>
          <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
            Har du spørsmål, ønsker du å booke for en større gruppe, eller planlegger et firmaevent?
            Ta kontakt med oss – vi hjelper deg gjerne!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 max-w-6xl mx-auto">
          
          {/* Informasjonskolonne */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Kontaktinfo */}
            <div className="bg-zinc-950/80 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-medium text-white mb-6">Kontaktinformasjon</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#9C39FF]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Besøksadresse</h3>
                    <p className="text-zinc-400 font-light">
                      Industrigata 12, 4632 Kristiansand.<br />
                      Gratis parkering tilgjengelig.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#9C39FF]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">E-post</h3>
                    <p className="text-zinc-400 font-light">post@krsvr.no</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#9C39FF]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Telefon</h3>
                    <p className="text-zinc-400 font-light">+47 40828302</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Åpningstider */}
            <div className="bg-zinc-950/80 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-[#9C39FF]" />
                <h2 className="text-2xl font-medium text-white">Åpningstider</h2>
              </div>
              <div className="text-zinc-400 font-light mb-6">
                Se bookingside for tilgjengelighet
              </div>
              
              <div className="p-4 rounded-xl bg-[#9C39FF]/10 border border-[#9C39FF]/20 mt-6">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#9C39FF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white text-sm font-medium mb-1">Firma & Større grupper</h4>
                    <p className="text-zinc-400 text-sm font-light leading-relaxed">
                      Større bedriftsgrupper og foreninger kan gjerne forespørre andre tider (både hverdager og helger) 
                      utover våre faste åpningstider i bookingkalenderen. Send oss en melding her!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skjemakolonne */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 h-full"
          >
            <div className="bg-zinc-950/80 border border-zinc-800/50 rounded-3xl p-8 md:p-10 backdrop-blur-xl h-full flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-medium text-white mb-2">Send oss en melding</h2>
                <p className="text-zinc-400 font-light">Vi svarer så raskt vi kan, vanligvis innen 24 timer.</p>
              </div>

              {isSuccess ? (
                <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center space-y-4 my-auto">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-medium text-white">Takk for at du tok kontakt!</h3>
                  <p className="text-zinc-400 font-light">
                    Din melding er mottatt. Vi vil komme tilbake til deg så fort vi kan.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-zinc-700 hover:bg-zinc-800 text-white"
                    onClick={() => setIsSuccess(false)}
                  >
                    Send ny melding
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-zinc-300">Navn</label>
                      <Input 
                        id="name"
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-[#9C39FF] text-white h-12" 
                        placeholder="Ditt navn"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-zinc-300">Telefon</label>
                      <Input 
                        id="phone"
                        name="phone" 
                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-[#9C39FF] text-white h-12" 
                        placeholder="Ditt telefonnummer"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-zinc-300">E-postadresse</label>
                      <Input 
                        id="email"
                        name="email" 
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-[#9C39FF] text-white h-12" 
                        placeholder="din@epost.no"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium text-zinc-300">Bedrift (valgfritt)</label>
                      <Input 
                        id="company"
                        name="company" 
                        type="text" 
                        value={formData.company}
                        onChange={handleChange}
                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-[#9C39FF] text-white h-12" 
                        placeholder="Bedriftsnavn"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-zinc-300">Melding</label>
                    <textarea 
                      id="message"
                      name="message" 
                      required 
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="flex w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9C39FF] focus-visible:border-transparent text-white placeholder:text-zinc-500 resize-y" 
                      placeholder="Skriv din melding her... (Husk å oppgi ønsket dato/tidspunkt hvis det gjelder booking for en større gruppe)"
                    ></textarea>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-[#9C39FF] hover:bg-[#8b32e6] text-white text-lg rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Sender melding...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send melding <Send className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* Kartseksjon */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="mt-12 rounded-3xl overflow-hidden border border-zinc-800/50 h-[400px] bg-zinc-900"
        >
          <iframe 
            src="https://maps.google.com/maps?q=KRS%20VR%20Arena,%20Industrigata%2012,%204632%20Kristiansand&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps"
            className="filter grayscale contrast-125 opacity-80"
          ></iframe>
        </motion.div>
      </div>
    </main>
  );
}
