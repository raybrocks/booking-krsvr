"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronDown, MoveRight, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function KontaktPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Laster...</div>}>
      <KontaktForm />
    </React.Suspense>
  );
}

function KontaktForm() {
  const searchParams = useSearchParams();
  
  // High-level query
  const [formType, setFormType] = useState<"arrangement" | "annet" | null>(null);

  // General fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Arrangement fields
  const [groupType, setGroupType] = useState<"privat" | "bedrift" | "">("");
  const [companyName, setCompanyName] = useState("");
  const [eventType, setEventType] = useState("");
  const [packageType, setPackageType] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [date, setDate] = useState("");
  const [altDate, setAltDate] = useState("");
  const [time, setTime] = useState("");
  const [food, setFood] = useState("");
  const [consent, setConsent] = useState(false);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize from search params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const eventParam = searchParams.get("event");
    const pakkeParam = searchParams.get("pakke");

    if (typeParam || eventParam || pakkeParam) {
      setFormType("arrangement");
    }

    if (typeParam === "privat") setGroupType("privat");
    if (typeParam === "bedrift") setGroupType("bedrift");

    if (eventParam) {
      // Map basic values
      if (eventParam === "bursdag") setEventType("Bursdag");
      if (eventParam === "utdrikningslag") setEventType("Utdrikningslag");
      if (eventParam === "teambuilding") setEventType("Teambuilding");
      if (eventParam === "julebord") setEventType("Julebord");
    }

    if (pakkeParam === "dagsevent") {
      setPackageType("Privat dagsevent: 10–64 personer / inntil 8 timer");
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formType === "arrangement" && !consent) {
      alert("Du må samtykke til at vi kan kontakte deg.");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const isFormValid = () => {
    if (formType === "annet") {
      return name && email && message;
    }
    if (formType === "arrangement") {
      const isBaseValid = name && email && groupType && eventType && peopleCount && message;
      if (groupType === "bedrift" && !companyName) return false;
      return isBaseValid && consent;
    }
    return false;
  };

  return (
    <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden text-zinc-100">
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-white mb-6">
            Send forespørsel om arrangement
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Fyll ut skjemaet nedenfor, så hjelper vi deg med å sette sammen en uforglemmelig opplevelse hos KRS VR Arena.
          </p>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900/40 border border-white/10 rounded-2xl p-10 lg:p-16 text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-[#9C39FF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#9C39FF]" />
            </div>
            <h2 className="text-3xl font-medium tracking-tight mb-4 text-white">
              Takk for forespørselen!
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Vi tar kontakt så snart vi kan med forslag til opplegg for deres gruppe.
            </p>
            <button 
              onClick={() => {
                setIsSuccess(false);
                setFormType(null);
                setName("");
                setEmail("");
                setPhone("");
                setMessage("");
                setCompanyName("");
                setEventType("");
                setPackageType("");
                setPeopleCount("");
                setDate("");
                setAltDate("");
                setTime("");
                setFood("");
                setConsent(false);
              }}
              className="mt-8 px-8 py-3 rounded-full text-sm font-medium transition-all bg-white text-black hover:bg-zinc-200"
            >
              Send ny forespørsel
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            
            {/* Step 1: Valg av type henvendelse */}
            <div className="mb-10 bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
              <label className="block text-xl font-medium text-white tracking-tight mb-6 text-center">
                Hva gjelder henvendelsen?
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormType("arrangement")}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    formType === "arrangement" 
                      ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white shadow-[0_0_20px_rgba(156,57,255,0.15)]" 
                      : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="block font-medium">Arrangement / gruppebooking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormType("annet")}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    formType === "annet" 
                      ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white shadow-[0_0_20px_rgba(156,57,255,0.15)]" 
                      : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="block font-medium">Annen henvendelse</span>
                </button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {formType === "annet" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6"
                >
                  <h3 className="text-2xl font-medium tracking-tight border-b border-white/10 pb-4 mb-6">
                    Kontaktinformasjon
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Navn *</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-colors"
                        placeholder="Ditt fulle navn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">E-post *</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-colors"
                        placeholder="din@epost.no"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Telefon</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-colors"
                      placeholder="Ditt telefonnummer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Melding *</label>
                    <textarea 
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-colors resize-y"
                      placeholder="Hva kan vi hjelpe deg med?"
                    ></textarea>
                  </div>
                </motion.div>
              )}

              {formType === "arrangement" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  {/* Kontaktinfo */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight mb-6">Kontaktinformasjon</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Navn *</label>
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">E-post *</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Telefon</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gruppe & Formål */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight mb-6">Deres arrangement</h3>
                    
                    <div className="space-y-8">
                      {/* 1. Type gruppe */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Gjelder dette privat gruppe eller bedrift? *</label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => { setGroupType("privat"); setEventType(""); }}
                            className={`p-3 rounded-lg border text-sm font-medium text-center transition-colors ${
                              groupType === "privat"
                                ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            Privat gruppe
                          </button>
                          <button
                            type="button"
                            onClick={() => { setGroupType("bedrift"); setEventType(""); }}
                            className={`p-3 rounded-lg border text-sm font-medium text-center transition-colors ${
                              groupType === "bedrift"
                                ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            Bedrift / organisasjon
                          </button>
                        </div>
                      </div>

                      {/* 2. Bedriftsnavn */}
                      {groupType === "bedrift" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Bedriftsnavn *</label>
                          <input 
                            type="text" 
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                          />
                        </motion.div>
                      )}

                      {/* 3. Type event */}
                      {groupType && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="block text-sm font-medium text-zinc-300 mb-3">Hva slags arrangement planlegger dere? *</label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {groupType === "privat" && ["Bursdag", "Utdrikningslag", "Privat dagsevent", "Annet privat arrangement"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setEventType(opt)}
                                className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                                  eventType === opt
                                    ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                    : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                            {groupType === "bedrift" && ["Teambuilding", "Kick Off / Firmafest", "Julebord", "Privat dagsevent for bedrift", "Annet firmaevent"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setEventType(opt)}
                                className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                                  eventType === opt
                                    ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                    : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* 4. Opplegg */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Hvilket opplegg passer best?</label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            "Liten gruppe: 2–8 personer / 90 minutter",
                            "Medium gruppe: 9–16 personer / 2,5 timer",
                            "Stor gruppe: 17–24 personer / 3,5 timer",
                            "Privat dagsevent: 10–64 personer / inntil 8 timer",
                            "Usikker – ønsker anbefaling"
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPackageType(opt)}
                              className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                                packageType === opt
                                  ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                  : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                              } ${opt === "Usikker – ønsker anbefaling" ? "sm:col-span-2 text-center flex justify-center items-center font-medium" : ""}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 5. Antall */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Ca. hvor mange blir dere? *</label>
                        <input 
                          type="text" 
                          required
                          value={peopleCount}
                          onChange={(e) => setPeopleCount(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                          placeholder="F.eks. 12"
                        />
                        <p className="mt-2 text-xs text-zinc-500">Det går fint om antallet ikke er helt bestemt enda.</p>
                      </div>
                    </div>
                  </div>

                  {/* Kalender / Tid */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight mb-6">Når ønsker dere å arrangere?</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Ønsket dato</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            style={{ colorScheme: 'dark' }}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Alternativ dato (valgfritt)</label>
                        <input 
                          type="date" 
                          style={{ colorScheme: 'dark' }}
                          value={altDate}
                          onChange={(e) => setAltDate(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Ønsket tidspunkt / tidsrom</label>
                        <input 
                          type="text" 
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          placeholder="F.eks. kl 18:00 eller kveldstid"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                        />
                        <p className="mt-2 text-xs text-zinc-500">Har dere flere aktuelle datoer, skriv det gjerne i tilleggsinfo lenger ned.</p>
                      </div>
                    </div>
                  </div>

                  {/* Mat & Tillegg */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight mb-6">Ekstra ønsker</h3>
                    
                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Ønsker dere hjelp med mat?</label>
                        <div className="grid sm:grid-cols-1 gap-3">
                          {[
                            "Ja, vi ønsker at dere koordinerer pizza/mat",
                            "Nei, vi ordner selv",
                            "Usikker"
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFood(opt)}
                              className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                                food === opt
                                  ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                  : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
                          KRS VR Arena kan koordinere levering av pizza/mat på forespørsel. Medbrakt mat og drikke avtales på forhånd.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Fortell oss gjerne litt mer *</label>
                        <textarea 
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[#9C39FF] outline-none transition-colors resize-y"
                          placeholder="Eksempel: anledning, alder på deltakere, ønsket stemning, spesielle behov, matønsker, tidsramme eller andre spørsmål."
                        ></textarea>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="pt-0.5">
                          <input 
                            id="consent" 
                            type="checkbox" 
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="w-5 h-5 rounded border-zinc-500 text-[#9C39FF] bg-black/40 focus:ring-[#9C39FF] focus:ring-offset-black cursor-pointer accent-[#9C39FF]"
                          />
                        </div>
                        <label htmlFor="consent" className="text-sm text-zinc-300 cursor-pointer">
                          Jeg samtykker til at KRS VR Arena kan kontakte meg angående henvendelsen, og lagre mine data for å behandle forespørselen.
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            {formType && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 flex justify-end"
              >
                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className={`flex items-center justify-center w-full md:w-auto px-10 py-4 rounded-full text-base font-medium transition-all shadow-lg ${
                    !isFormValid() 
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                      : "bg-[#9C39FF] text-white hover:bg-[#8b32e6] shadow-[#9C39FF]/20"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sender forespørsel...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send forespørsel <Send className="w-5 h-5 ml-1" />
                    </span>
                  )}
                </button>
              </motion.div>
            )}

          </form>
        )}
      </div>
    </main>
  );
}
