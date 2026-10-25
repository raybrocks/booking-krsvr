"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function EnglishContactForm() {
  const searchParams = useSearchParams();

  const [formType, setFormType] = useState<"arrangement" | "annet" | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [groupType, setGroupType] = useState<"privat" | "bedrift" | "">("");
  const [companyName, setCompanyName] = useState("");
  const [eventType, setEventType] = useState("");
  const [packageType, setPackageType] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [date, setDate] = useState("");
  const [altDate, setAltDate] = useState("");
  const [time, setTime] = useState("");
  const [food, setFood] = useState("");
  const [bar, setBar] = useState("");
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    const eventParam = searchParams.get("event");

    if (typeParam || eventParam) {
      setFormType("arrangement");
    }

    if (typeParam === "privat" || typeParam === "private") {
      setGroupType("privat");
    } else if (typeParam === "bedrift" || typeParam === "corporate") {
      setGroupType("bedrift");
      setEventType("Corporate Team Building");
    } else if (typeParam === "bursdag" || typeParam === "birthday") {
      setGroupType("privat");
      setEventType("Birthday Party");
      setPackageType("Small group: 2–10 players / 90 minutes");
    } else if (typeParam === "utdrikningslag" || typeParam === "bachelor") {
      setGroupType("privat");
      setEventType("Bachelor / Bachelorette Party");
      setPackageType("Bachelor / Bachelorette Party: 1.5–3 hours");
    } else if (typeParam === "onsite") {
      setGroupType("bedrift");
      setEventType("VR On-Site (We come to you)");
      setPackageType("VR On-Site: At your location");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formType === "arrangement" && !consent) {
      alert("Please consent to us contacting you regarding your inquiry.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formType,
          name,
          email,
          phone,
          message,
          groupType,
          companyName,
          eventType,
          packageType,
          peopleCount,
          date,
          altDate,
          time,
          food,
          bar,
          locale: "en",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert("An error occurred while sending: " + (result.error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-white mb-6">
            Contact Us & Group Inquiry
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Fill in the form below and we will help you tailor an event for your group at KRS VR Arena in Kristiansand.
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
              Thank You for Your Inquiry!
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              We will get back to you shortly with a tailored proposal for your group.
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
                setBar("");
                setConsent(false);
              }}
              className="mt-8 px-8 py-3 rounded-full text-sm font-medium transition-all bg-white text-black hover:bg-zinc-200"
            >
              Send Another Inquiry
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="mb-10 bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
              <label className="block text-xl font-medium text-white tracking-tight mb-6 text-center">
                What is your inquiry about?
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
                  <span className="block font-medium">Event / Group Booking (10+ players)</span>
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
                  <span className="block font-medium">General Question</span>
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
                    Contact Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Phone (with country code)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-colors"
                      placeholder="+49 / +31 / +47 ..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-colors resize-y"
                      placeholder="How can we help you?"
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
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight mb-6">Contact Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight mb-6">Your Event</h3>

                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          Is this for a private group or a company/organization? *
                        </label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setGroupType("privat");
                              setEventType("");
                            }}
                            className={`p-3 rounded-lg border text-sm font-medium text-center transition-colors ${
                              groupType === "privat"
                                ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            Private Group
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGroupType("bedrift");
                              setEventType("");
                            }}
                            className={`p-3 rounded-lg border text-sm font-medium text-center transition-colors ${
                              groupType === "bedrift"
                                ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            Company / Organization
                          </button>
                        </div>
                      </div>

                      {groupType === "bedrift" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name *</label>
                          <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                          />
                        </motion.div>
                      )}

                      {groupType && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="block text-sm font-medium text-zinc-300 mb-3">
                            What type of event are you planning? *
                          </label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {groupType === "privat" &&
                              [
                                "Birthday Party",
                                "Bachelor / Bachelorette Party",
                                "Friends / Family Group",
                                "Other Private Event",
                              ].map((opt) => (
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
                            {groupType === "bedrift" &&
                              [
                                "Corporate Team Building",
                                "Kickoff / Company Party",
                                "Christmas Party (Julebord)",
                                "VR On-Site (We come to you)",
                                "Other Corporate Event",
                              ].map((opt) => (
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

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          Which package suits your group best?
                        </label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            "Small group: 2–10 players / 90 minutes",
                            "Large group / Tournament: 10–64 players / up to 3 hours",
                            "Bachelor / Bachelorette Party: 1.5–3 hours",
                            "VR On-Site: At your location",
                            "Not sure – would like a recommendation",
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPackageType(opt)}
                              className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                                packageType === opt
                                  ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                  : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                              } ${opt.startsWith("Not sure") ? "sm:col-span-2 text-center flex justify-center items-center font-medium" : ""}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Approximately how many participants? *
                        </label>
                        <input
                          type="text"
                          required
                          value={peopleCount}
                          onChange={(e) => setPeopleCount(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                          placeholder="e.g. 14"
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                          An estimate is fine if the final headcount is not confirmed yet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight mb-6">Preferred Date & Time</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Preferred Date</label>
                        <input
                          type="date"
                          style={{ colorScheme: "dark" }}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Alternative Date (optional)</label>
                        <input
                          type="date"
                          style={{ colorScheme: "dark" }}
                          value={altDate}
                          onChange={(e) => setAltDate(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Preferred Time</label>
                        <input
                          type="text"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          placeholder="e.g. 18:00 or afternoon/evening"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#9C39FF] outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight mb-6">Catering & Bar Preferences</h3>

                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          Would you like us to arrange food?
                        </label>
                        <div className="grid sm:grid-cols-1 gap-3">
                          {[
                            "Yes, please coordinate hot local pizza delivery to the lounge",
                            "Children's birthday: We will bring our own birthday cake / snacks",
                            "No food required",
                            "Not sure – please send recommendations",
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
                          Note: Outside food and drinks are not permitted at team building events, corporate gatherings, adult birthdays (18+), or bachelor/bachelorette parties (birthday cake and snacks are welcome for children&apos;s birthdays).
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          Would you like a pre-ordered bar package?
                        </label>
                        <div className="grid sm:grid-cols-1 gap-3">
                          {[
                            "Package 1: Cold beer, cider & soft drinks (Tuborg, Corona Extra, Breezer)",
                            "Package 2: Quality wine & sparkling (same supplier as Boen Gård)",
                            "Combination of both packages",
                            "No, coffee and water only",
                            "Not sure – please send complete price list",
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setBar(opt)}
                              className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                                bar === opt
                                  ? "bg-[#9C39FF]/10 border-[#9C39FF] text-white"
                                  : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Tell us a little more about your group *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[#9C39FF] outline-none transition-colors resize-y"
                          placeholder="Occasion, approximate age range, preferences, or questions..."
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
                          I consent to KRS VR Arena contacting me regarding this inquiry and storing my details to process the request.
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                    <span>Sending inquiry...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Inquiry <Send className="w-5 h-5 ml-1" />
                    </span>
                  )}
                </button>
              </motion.div>
            )}
          </form>
        )}

        {/* Google Maps */}
        <div className="mt-24 mb-10 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-3">
              Where to Find Us
            </h2>
            <p className="text-zinc-400">
              KRS VR Arena, Industrigata 12, 4632 Kristiansand · 5 minutes from the ferry port & E18
            </p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 p-2 rounded-2xl w-full">
            <iframe
              title="KRS VR Arena Map"
              width="100%"
              height="450"
              src="https://maps.google.com/maps?width=100%25&height=450&hl=en&q=Industrigata%2012,%204632%20Kristiansand+(KRS%20VR%20Arena)&t=&z=15&ie=UTF8&iwloc=B&output=embed"
              style={{ border: 0, borderRadius: "0.75rem" }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
