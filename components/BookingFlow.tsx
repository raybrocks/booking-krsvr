"use client";

import { useState } from "react";
import { format, isSameDay, getDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Clock } from "lucide-react";

import { useBookingFlow } from "@/hooks/useBookingFlow";
import { getLanguageInfo } from "@/lib/languages";
import { toApproxEur } from "@/lib/currency";

const ENGLISH_TERMS_SUMMARY = `Terms & Conditions – KRS VR Arena AS

1. Booking & Capacity
Your booking reserves a 90-minute experience in the arena (including briefing, equipment setup, gameplay, and lounge time). You may adjust your player count and player names up until arrival, within the maximum capacity of your chosen experience.

2. Payment
You can pay on arrival in the arena by card (Visa, Mastercard, Apple Pay, Google Pay) or online in advance via Vipps (for Norwegian Vipps users). All prices include VAT.

3. Cancellation & Rescheduling
Cancellations or rescheduling must be made at least 48 hours prior to the booked start time via the 'Manage Booking' link in your confirmation email or by contacting post@krsvr.no / +47 40 82 83 02.

4. Arrival & Safety
Please arrive on time so you do not lose any game time. Participants must follow instructions given by the gamemaster. Minimum age is 8 years (18+ for Zombie Shooter).`;

export default function BookingFlow({ locale = "no" }: { locale?: "no" | "en" }) {
  const isEn = locale === "en";
  const {
    step, setStep, experiences, settings, loading,
    selectedDate, setSelectedDate, selectedTime, setSelectedTime,
    players, setPlayers, playerNames, setPlayerNames, selectedExperience, setSelectedExperience,
    filterType, setFilterType,
    firstName, setFirstName, lastName, setLastName, email, setEmail, phone, setPhone,
    customerNote, setCustomerNote,
    acceptedTerms, setAcceptedTerms, acceptedNewsletter, setAcceptedNewsletter,
    paymentType, setPaymentType, isSubmitting, bookingComplete,
    discountCodeInput, setDiscountCodeInput, appliedDiscount, validatingDiscount,
    discountError, discountMessage,
    bookedTimes, loadingTimes, availableTimes, bookedDates,
    isVippsTest, pricePerPerson, rawTotalPrice, totalPrice, amountToPay,
    handleApplyDiscount, handleNext, handleBack, handleSubmit
  } = useBookingFlow(locale);

  const [showSameDayWarning, setShowSameDayWarning] = useState(false);

  const onNextClick = () => {
    if (step === 1 && selectedDate && selectedTime) {
      const isToday = isSameDay(selectedDate, new Date());
      if (isToday) {
        setShowSameDayWarning(true);
        return;
      }
    }
    handleNext();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-20"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-light mb-4">{isEn ? "Booking Confirmed" : "Booking Bekreftet"}</h2>
        <p className="text-zinc-300 mb-8">
          {isEn
            ? `Thank you, ${firstName}. Your VR experience is booked for ${selectedDate ? format(selectedDate, "MMMM do, yyyy") : ""} at ${selectedTime}. We have sent a confirmation email to ${email}.`
            : `Takk, ${firstName}. VR opplevelsen er booket ${selectedDate ? format(selectedDate, "MMMM do, yyyy") : ""} kl. ${selectedTime}. Vi har sendt bekreftelse til ${email}.`}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full border-zinc-700 hover:bg-zinc-800">
          {isEn ? "Make another booking" : "Book en ny"}
        </Button>
      </motion.div>
    );
  }

  const translateCategory = (cat: string) => {
    if (!isEn) return cat === "All" ? "Alle" : cat;
    if (cat === "All") return "All";
    if (cat === "Familie") return "Family";
    if (cat === "Action Strategi") return "Action & Strategy";
    return cat;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-zinc-800 -z-10" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-500 ${
              step >= i ? "bg-[#9C39FF] text-white shadow-[0_0_15px_rgba(156,57,255,0.5)]" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
            }`}
          >
            {i}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="glass-panel rounded-3xl p-6 md:p-10"
        >
          {/* STEP 1: Date & Time */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">
                  {isEn ? "Select Date & Time" : "Velg dato & tid"}
                </h2>
                <p className="text-zinc-400">
                  {isEn ? "Choose when you would like to visit KRS VR Arena." : "Velg når dere vil besøke Krs VR Arena."}
                </p>
              </div>
              
              <div className="bg-[#9C39FF]/10 border border-[#9C39FF]/20 rounded-2xl p-4 md:p-5 text-sm text-zinc-300 space-y-3">
                {isEn ? (
                  <>
                    <p>
                      <strong>For groups of 2–10 players:</strong> <br />
                      Book directly using the calendar below (90-minute total experience). No upfront payment required — pay by card on arrival.
                    </p>
                    <p>
                      <strong>For larger groups (10–64 players):</strong> <br />
                      Explore our <Link href="/en/events" className="underline text-[#c48fff] hover:text-white">Group & Corporate Events</Link> or send a request via our <Link href="/en/contact" className="underline text-[#c48fff] hover:text-white">contact form</Link>.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>For små grupper (2-10 personer):</strong> <br />Bruk bookingmodulen under.
                    </p>
                    <p>
                      <strong>For større grupper (10-64 personer):</strong> <br />Utforsk våre arrangementssider og reserver via kontaktskjema.
                    </p>
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-10">
                <div className="w-full">
                  <Calendar
                    mode="single"
                    weekStartsOn={1}
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime("");
                    }}
                    disabled={(date) => {
                      const dateString = format(date, "yyyy-MM-dd");
                      const isPast = date < new Date(new Date().setHours(0,0,0,0));
                      if (isPast) return true;
                      
                      if (bookedDates.includes(dateString)) return false;
                      
                      if (settings?.specialHours && settings.specialHours[dateString]) {
                        return settings.specialHours[dateString].length === 0;
                      }
                      
                      const day = getDay(date);
                      return !settings?.openingHours[day.toString()] || settings.openingHours[day.toString()].length === 0;
                    }}
                    className="rounded-2xl border border-zinc-800 p-4 bg-zinc-950 w-full mx-auto"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-zinc-400" />
                    {isEn ? "Available Times" : "Ledige tider"}
                  </h3>
                  {selectedDate ? (
                    loadingTimes ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                      </div>
                    ) : (availableTimes.length > 0 || bookedTimes.length > 0) ? (
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from(new Set([...availableTimes, ...bookedTimes])).sort().map((time) => {
                          const timeStr = typeof time === 'string' ? time.trim() : String(time);
                          const isBooked = bookedTimes.includes(timeStr);
                          return (
                            <button
                              key={timeStr}
                              onClick={() => !isBooked && setSelectedTime(timeStr)}
                              disabled={isBooked}
                              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                isBooked
                                  ? "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed"
                                  : selectedTime === timeStr 
                                    ? "bg-[#9C39FF] text-white border-[#9C39FF] shadow-[0_0_15px_rgba(156,57,255,0.3)]" 
                                    : "border-zinc-800 hover:border-zinc-600 text-zinc-300"
                              }`}
                            >
                              {timeStr} {isBooked && (isEn ? "(Booked)" : "(Booket)")}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-sm">
                        {isEn ? "No available time slots on this date." : "Ingen ledige tider på denne datoen."}
                      </p>
                    )
                  ) : (
                    <p className="text-zinc-400 text-sm">
                      {isEn ? "Please select a date in the calendar first." : "Vennligst velg en dato først."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Group Size */}
          {step === 2 && (
            <div className="space-y-8 text-center max-w-lg mx-auto">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">
                  {isEn ? "Number of Players" : "Gruppestørrelse"}
                </h2>
                <p className="text-zinc-400">
                  {isEn ? "How many people will be playing?" : "Hvor mange skal spille?"}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <button 
                  onClick={() => setPlayers(Math.max(2, players - 1))}
                  className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  -
                </button>
                <div className="text-6xl font-light w-24">{players}</div>
                <button 
                  onClick={() => setPlayers(Math.min(10, players + 1))}
                  className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  +
                </button>
              </div>

              <div className="bg-zinc-900/50 border border-[#9C39FF]/20 rounded-2xl p-6 text-center max-w-sm mx-auto mb-8 shadow-[0_0_15px_rgba(156,57,255,0.05)]">
                <div className="text-4xl font-medium text-white mb-1">
                  {pricePerPerson} {isEn ? "NOK" : "kr"}{" "}
                  <span className="text-base font-normal text-zinc-400">
                    {isEn ? "per person" : "per pers"}
                  </span>
                </div>
                {isEn && (
                  <div className="text-xs text-[#c48fff] mb-2">
                    approx. €{toApproxEur(pricePerPerson)} per person
                  </div>
                )}
                <div className="text-sm text-zinc-400 font-medium">
                  {isEn
                    ? `Total for ${players} players: ${pricePerPerson * players} NOK (approx. €${toApproxEur(pricePerPerson * players)})`
                    : `Total for ${players}: ${pricePerPerson * players} kr`}
                </div>
              </div>
              
              <div className="bg-[#9C39FF]/10 border border-[#9C39FF]/20 rounded-2xl p-4 md:p-5 text-sm text-zinc-300 space-y-3">
                {isEn ? (
                  <>
                    <p>Price per person decreases automatically for larger groups.</p>
                    <p>
                      <strong>Flexible group size:</strong> You can adjust the number of players right up until arrival. Please check the maximum player limit on your chosen game before arrival.
                    </p>
                  </>
                ) : (
                  <>
                    <p>Prisene er per person og synker for større grupper.</p>
                    <p><strong>Merk:</strong> Du kan justere antall personer helt frem til spillet starter. Vennligst sjekk maks kapasitet på spillet dere velger før ankomst.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: VR Experience */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">
                  {isEn ? "Choose Your VR Experience" : "Velg VR Opplevelse"}
                </h2>
                <p className="text-zinc-400">
                  {isEn ? "Select a VR adventure for your group." : "Velg VR-eventyr for gruppen."}
                </p>
              </div>
              
              {/* Filter */}
              {experiences.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {["All", ...Array.from(new Set(experiences.map(e => e.type)))].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filterType === type 
                          ? "bg-[#9C39FF] text-white shadow-[0_0_10px_rgba(156,57,255,0.3)] border border-[#9C39FF]" 
                          : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      {translateCategory(type)}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-10">
                {Array.from(new Set(
                  experiences
                    .filter(e => e.maxPlayers >= players)
                    .filter(e => filterType === "All" || e.type === filterType)
                    .map(e => e.type)
                )).map(category => (
                  <div key={category} className="space-y-5">
                    {/* Category Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center py-5 shadow-lg">
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#9C39FF]/10 to-transparent"></div>
                      <h3 className="relative text-xl md:text-2xl font-bold uppercase tracking-[0.2em] text-white/90 z-10">
                        {translateCategory(category)}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {experiences
                        .filter(e => e.maxPlayers >= players)
                        .filter(e => e.type === category)
                        .map((exp) => (
                        <Card 
                          key={exp.id} 
                          className={`bg-transparent border cursor-pointer transition-all overflow-hidden ${
                            selectedExperience?.id === exp.id 
                              ? "border-[#9C39FF] ring-1 ring-[#9C39FF] shadow-[0_0_20px_rgba(156,57,255,0.15)]" 
                              : "border-zinc-800 hover:border-zinc-600"
                          }`}
                          onClick={() => setSelectedExperience(exp)}
                        >
                          <div className="relative h-48 w-full">
                            <Image src={exp.picture} alt={exp.name} fill className="object-cover" />
                            {exp.isNew && (
                              <div className="absolute top-3 left-3 bg-[#19EB5B] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-black shadow-md">
                                {isEn ? "New" : "Nyhet"}
                              </div>
                            )}
                            <div className="absolute top-3 right-3 bg-[#9C39FF] px-3 py-1 rounded-full text-xs font-medium text-white shadow-md">
                              {exp.displayType || translateCategory(exp.type)}
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <h3 className="text-xl font-medium mb-2">{exp.name}</h3>
                            <p className="text-zinc-400 text-sm mb-4">{exp.shortDescription}</p>
                            
                            <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                              <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{exp.duration || "90 min"}</span>
                              {exp.age && (
                                <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                  {isEn ? `Age ${exp.age.replace("+", "")}+` : `Fra ${exp.age} år`}
                                </span>
                              )}
                              <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                {isEn ? `Max ${exp.maxPlayers} players` : `Maks ${exp.maxPlayers} spillere`}
                              </span>
                              {exp.difficulty && <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{exp.difficulty}</span>}
                              {Array.isArray(exp.suitableFor) && exp.suitableFor.map((audience: string) => (
                                <span key={audience} className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{audience}</span>
                              ))}
                              {exp.jumpScare && (
                                <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Jump Scare</span>
                              )}
                              {exp.tags && exp.tags.map((tag: string) => (
                                <span key={tag} className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{tag}</span>
                              ))}
                              {exp.languages && exp.languages.length > 0 && (
                                <span
                                  className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 inline-flex items-center gap-1"
                                  title={`Available languages: ${exp.languages.join(', ')}`}
                                >
                                  🌐 {exp.languages.map((l: string) => getLanguageInfo(l).flag).join(' ')}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end mt-auto">
                              <Button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedExperience(exp);
                                    setStep(4);
                                }}
                                className="bg-[#9C39FF] hover:bg-[#8A2BE2] text-white px-8 rounded-full shadow-[0_0_15px_rgba(156,57,255,0.3)] hover:scale-105 transition-all"
                              >
                                {isEn ? "Select & Continue" : "Book nå"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {experiences
                .filter(e => e.maxPlayers >= players)
                .filter(e => filterType === "All" || e.type === filterType)
                .length === 0 && (
                <div className="text-center py-10 text-zinc-400 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                  {isEn
                    ? `No experiences available for ${players} players with the selected filter.`
                    : `Ingen opplevelser tilgjengelig for ${players} personer med valgt filter.`}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Personal Info */}
          {step === 4 && (
            <div className="space-y-8 max-w-md mx-auto">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">
                  {isEn ? "Your Contact Details" : "Dine opplysninger"}
                </h2>
                <p className="text-zinc-400">
                  {isEn ? "Who is making this booking?" : "Hvem står på bookingen?"}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-zinc-300">
                      {isEn ? "First Name" : "Fornavn"}
                    </Label>
                    <Input 
                      id="firstName" 
                      autoComplete="given-name"
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-zinc-300">
                      {isEn ? "Last Name" : "Etternavn"}
                    </Label>
                    <Input 
                      id="lastName" 
                      autoComplete="family-name"
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">
                    {isEn ? "Email Address" : "E-postadresse"}
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    autoComplete="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">
                    {isEn ? "Mobile Phone (incl. country code)" : "Telefonnummer"}
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    autoComplete="tel"
                    placeholder={isEn ? "+49 / +31 / +47 ..." : "+47 "}
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {isEn ? "Who will be playing? (Optional)" : "Hvem skal spille?"}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    {isEn
                      ? "For faster equipment setup in the arena, feel free to enter the first names of the players. You can also add or update names later via the link in your confirmation email."
                      : "For raskere kalibrering i arenaen, ber vi deg fylle inn fornavnet på spillerne. Er ikke alle navnene klare enda? Ikke noe problem – du kan gjerne bare skrive inn et tall (f.eks. \"3\")."}
                  </p>
                  <div className="space-y-3">
                    {Array.from({ length: players }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Label className="text-zinc-500 w-20">
                          {isEn ? `Player ${i + 1}` : `Spiller ${i + 1}`}
                        </Label>
                        <Input
                          placeholder={isEn ? "First name" : "Fornavn"}
                          value={playerNames[i] || ""}
                          onChange={(e) => {
                            const newNames = [...playerNames];
                            newNames[i] = e.target.value;
                            setPlayerNames(newNames);
                          }}
                          className="flex-1 bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-700 text-sm h-9"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <Label htmlFor="customerNote" className="text-zinc-300">
                  {isEn ? "Comment or note for our gamemaster (optional)" : "Kommentar til bookingen (valgfritt)"}
                </Label>
                <p className="text-sm text-zinc-400 mb-2">
                  {isEn
                    ? "Feel free to share the approximate age range, preferred language (English/German/Norwegian), or VR experience level of your group so our gamemaster can tailor your session."
                    : "Fortell oss gjerne litt om aldersspredningen og erfaringsnivået i gruppa (f.eks. om dere er erfarne gamere eller helt nybegynnere). Våre opplevelser er designet for å passe absolutt alle, men med litt info på forhånd kan vi tilpasse servicen og gi dere en enda bedre opplevelse!"}
                </p>
                <textarea
                  id="customerNote"
                  placeholder={
                    isEn
                      ? "Tell us briefly about your group, preferred language, or any special wishes..."
                      : "Skriv litt om gruppa, erfaringsnivå, eller andre beskjeder til oss..."
                  }
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white mt-2"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Terms */}
          {step === 5 && (
            <div className="space-y-8 max-w-md mx-auto">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">
                  {isEn ? "Almost Done" : "Nesten ferdig"}
                </h2>
                <p className="text-zinc-400">
                  {isEn ? "Please review and accept our booking terms." : "Vennligst se over våre vilkår."}
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms} 
                    onCheckedChange={(c) => setAcceptedTerms(c as boolean)} 
                    className="mt-1 border-zinc-600 data-[state=checked]:bg-[#9C39FF] data-[state=checked]:border-[#9C39FF] data-[state=checked]:text-white"
                  />
                  <div className="space-y-2 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium leading-relaxed">
                      {isEn
                        ? "I have read and accept the terms and conditions, including the cancellation policy."
                        : "Jeg har lest og aksepterer kjøpsvilkårene, inkludert avbestillingsregler."}
                    </Label>
                    <p className="text-xs text-zinc-400">
                      {isEn
                        ? "Free cancellation up to 48 hours before your scheduled start time."
                        : "Avbestilling må skje senest 48 timer før aktiviteten."}
                    </p>
                    <Dialog>
                      <DialogTrigger className="text-[#9C39FF] text-xs hover:underline outline-none text-left mt-1">
                        {isEn ? "Read full terms & conditions" : "Les fullstendige vilkår"}
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader tabIndex={-1} autoFocus className="outline-none">
                          <DialogTitle>{isEn ? "Terms & Conditions" : "Vilkår og betingelser"}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {isEn
                            ? ENGLISH_TERMS_SUMMARY
                            : settings?.termsContent || "Ingen vilkår tilgjengelig."}
                        </div>
                        <div className="mt-6 flex justify-between items-center pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              const dialog = e.currentTarget.closest('[role="dialog"]');
                              if (dialog) {
                                dialog.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            }}
                            className="text-zinc-500 hover:text-white text-sm font-medium transition-colors outline-none"
                          >
                            {isEn ? "↑ Back to top" : "↑ Til toppen"}
                          </button>
                          <DialogClose className="bg-[#9C39FF] hover:bg-[#8b33e6] text-white py-2 px-6 rounded-lg text-sm font-medium transition-colors">
                            {isEn ? "Close" : "Lukk"}
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <Checkbox 
                    id="newsletter" 
                    checked={acceptedNewsletter} 
                    onCheckedChange={(c) => setAcceptedNewsletter(c as boolean)} 
                    className="mt-1 border-zinc-600 data-[state=checked]:bg-[#9C39FF] data-[state=checked]:border-[#9C39FF] data-[state=checked]:text-white"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="newsletter" className="text-sm font-medium leading-relaxed">
                      {isEn ? "Subscribe to our newsletter" : "Meld meg på nyhetsbrev"}
                    </Label>
                    <p className="text-xs text-zinc-400">
                      {isEn
                        ? "Receive occasional updates on new VR experiences and offers."
                        : "Få oppdateringer om nye VR-opplevelser og tilbud."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Checkout */}
          {step === 6 && (
            <div className="space-y-8 max-w-lg mx-auto">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">
                  {isEn ? "Confirm & Payment Option" : "Betaling"}
                </h2>
                <p className="text-zinc-400">
                  {isEn
                    ? "Review your booking and choose your preferred payment method."
                    : "Se over bookingen og velg betalingsmetode."}
                </p>
              </div>
              
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="font-medium">{selectedExperience?.name}</h3>
                    <p className="text-sm text-zinc-400">
                      {players} {isEn ? "Players" : "Spillere"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{selectedDate && format(selectedDate, "MMM do")}</p>
                    <p className="text-sm text-zinc-400">{selectedTime}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end text-lg">
                  <span className="text-zinc-300">{isEn ? "Total Price" : "Sum"}</span>
                  <div className="text-right">
                    <div className="text-sm text-zinc-500 line-through">
                      {appliedDiscount && `${rawTotalPrice} NOK`}
                    </div>
                    <div className="font-medium text-white">
                      {pricePerPerson} NOK{" "}
                      <span className="text-sm font-normal text-zinc-400">
                        {isVippsTest ? (isEn ? "total" : "totalt") : "per person"}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400 mt-0.5">
                      {isEn
                        ? `Total: ${totalPrice} NOK (approx. €${toApproxEur(totalPrice)})`
                        : `Total: ${totalPrice} NOK`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Code Section */}
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                <Label htmlFor="discount" className="text-zinc-300">
                  {isEn ? "Do you have a promo / discount code?" : "Har du en rabattkode?"}
                </Label>
                <div className="flex space-x-2">
                  <Input 
                    id="discount"
                    value={discountCodeInput}
                    onChange={(e) => setDiscountCodeInput(e.target.value)}
                    placeholder={isEn ? "Enter code" : "Skriv inn kode"}
                    className="bg-zinc-950 border-zinc-800"
                    disabled={validatingDiscount}
                  />
                  <Button 
                    onClick={handleApplyDiscount}
                    disabled={!discountCodeInput.trim() || validatingDiscount}
                    variant="secondary"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  >
                    {validatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : isEn ? "Apply" : "Legg til"}
                  </Button>
                </div>
                {discountError && <p className="text-red-400 text-sm">{discountError}</p>}
                {discountMessage && <p className="text-green-400 text-sm">{discountMessage}</p>}
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-4 text-sm text-zinc-300 border border-zinc-800">
                <p>
                  {isEn
                    ? "Note: You can adjust your player count and player list right up until arrival. Please arrive on time so you do not lose any game time."
                    : "Merk: Du kan justere antall personer helt frem til spillet starter. Vennligst sjekk maks kapasitet på spillet dere velger før ankomst."}
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-300">{isEn ? "Payment Method" : "Betalingsalternativ"}</Label>
                <RadioGroup value={paymentType} onValueChange={(v: "vipps" | "terminal") => setPaymentType(v)}>
                  {isEn ? (
                    <>
                      {/* On English page: Terminal / Pay on arrival is listed FIRST and pre-selected */}
                      <div 
                        className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentType === 'terminal' ? 'border-[#9C39FF] bg-[#9C39FF]/10' : 'border-zinc-800 hover:border-zinc-700'}`} 
                        onClick={() => setPaymentType('terminal')}
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="terminal" id="terminal" className="mt-1 border-zinc-500 text-[#9C39FF]" />
                          <div className="space-y-1">
                            <Label htmlFor="terminal" className="cursor-pointer font-medium text-white">
                              Pay on arrival in the arena (Card / Apple Pay)
                            </Label>
                            <p className="text-xs text-zinc-300">
                              Pay with Visa, Mastercard, Apple Pay, or Google Pay when you arrive
                            </p>
                            <p className="text-[11px] text-[#c48fff]">
                              Recommended for international visitors — 0 NOK upfront online
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-white block">0 NOK now</span>
                          <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                            {totalPrice} NOK (~€{toApproxEur(totalPrice)}) at venue
                          </span>
                        </div>
                      </div>

                      <div 
                        className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentType === 'vipps' ? 'border-[#9C39FF] bg-[#9C39FF]/10' : 'border-zinc-800 hover:border-zinc-700'}`} 
                        onClick={() => setPaymentType('vipps')}
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="vipps" id="vipps" className="mt-1 border-zinc-500 text-[#9C39FF]" />
                          <div className="space-y-1">
                            <Label htmlFor="vipps" className="cursor-pointer font-medium text-white">
                              Pay online now with Vipps
                            </Label>
                            <p className="text-xs text-zinc-400">
                              Norwegian Vipps app users only (requires Norwegian phone number)
                            </p>
                          </div>
                        </div>
                        <span className="font-medium text-white whitespace-nowrap">{totalPrice} NOK</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div 
                        className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentType === 'vipps' ? 'border-[#9C39FF] bg-[#9C39FF]/10' : 'border-zinc-800 hover:border-zinc-700'}`} 
                        onClick={() => setPaymentType('vipps')}
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="vipps" id="vipps" className="mt-1 border-zinc-500 text-[#9C39FF]" />
                          <div className="space-y-1">
                            <Label htmlFor="vipps" className="cursor-pointer font-medium text-white">
                              Betal fullt oppgjør nå (Vipps)
                            </Label>
                            <p className="text-xs text-zinc-400">Rask og trygg betaling med Vipps på nett</p>
                          </div>
                        </div>
                        <span className="font-medium text-white whitespace-nowrap">{totalPrice} NOK</span>
                      </div>
                      
                      <div 
                        className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentType === 'terminal' ? 'border-[#9C39FF] bg-[#9C39FF]/10' : 'border-zinc-800 hover:border-zinc-700'}`} 
                        onClick={() => setPaymentType('terminal')}
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="terminal" id="terminal" className="mt-1 border-zinc-500 text-[#9C39FF]" />
                          <div className="space-y-1">
                            <Label htmlFor="terminal" className="cursor-pointer font-medium text-white">
                              Betal ved oppmøte i arenaen (Kortterminal)
                            </Label>
                            <p className="text-xs text-zinc-400">
                              Betal med bankkort, Visa, Mastercard eller Apple Pay ved ankomst
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              Passer for alle &ndash; også turister og internasjonale gjester uten Vipps
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-white block">0 NOK</span>
                          <span className="text-[11px] text-zinc-500 whitespace-nowrap">{totalPrice} NOK i arenaen</span>
                        </div>
                      </div>
                    </>
                  )}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 flex justify-between items-center pt-6 border-t border-zinc-800">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1 || isSubmitting}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {isEn ? "Back" : "Tilbake"}
            </Button>
            
            {step < 6 ? (
              <Button 
                onClick={onNextClick} 
                className="bg-[#9C39FF] text-white hover:bg-[#9C39FF]/90 rounded-full px-8 shadow-[0_0_20px_rgba(156,57,255,0.4)]"
              >
                {isEn ? "Continue" : "Fortsett"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : settings?.bookingsClosed ? (
              <Button
                disabled
                variant="outline"
                className="border-zinc-800 bg-zinc-900/50 opacity-100 cursor-not-allowed hover:bg-zinc-900/50 hover:text-white text-zinc-300 rounded-2xl h-auto py-3 px-8 flex flex-col items-center"
              >
                <div className="font-medium">{isEn ? "Online booking temporarily closed" : "Booking midlertidig stengt"}</div>
                <div className="text-xs text-zinc-500 mt-1">{isEn ? "Email post@krsvr.no" : "Send e-post til post@krsvr.no"}</div>
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-[#9C39FF] text-white hover:bg-[#9C39FF]/90 rounded-full px-8 shadow-[0_0_20px_rgba(156,57,255,0.4)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isEn ? "Processing..." : "Behandler..."}
                  </>
                ) : paymentType === 'terminal' ? (
                  isEn ? "Confirm Booking (Pay at Venue)" : "Bekreft booking (Betal i arenaen)"
                ) : (
                  isEn ? `Pay ${amountToPay} NOK with Vipps` : `Betal ${amountToPay} NOK med Vipps`
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={showSameDayWarning} onOpenChange={setShowSameDayWarning}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white sm:rounded-2xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">
              {isEn ? "Same-Day Booking" : "Booking samme dag"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 text-zinc-300">
            <p>
              {isEn
                ? "You have selected a time slot for today. For same-day bookings, please call or send us a quick SMS beforehand so we can confirm a gamemaster is ready to welcome you."
                : "Du har valgt å booke tid på dagens dato. For bookinger samme dag må dette avklares med oss på forhånd for å bekrefte at vi kan ta imot dere."}
            </p>
            <p className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-center text-lg">
              {isEn ? "Call or send SMS:" : "Ring eller send SMS:"} <br/>
              <strong className="text-white text-xl tracking-wide">+47 40 82 83 02</strong>
            </p>
            <p className="text-sm text-zinc-400">
              {isEn
                ? "If you have already spoken with us, click Continue to proceed with your booking."
                : "Dersom du allerede har vært i kontakt med oss, kan du trykke fortsett for å gå til neste steg i bookingen."}
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setShowSameDayWarning(false)} className="hover:bg-zinc-800 text-white rounded-full">
              {isEn ? "Cancel" : "Avbryt"}
            </Button>
            <Button 
              onClick={() => {
                setShowSameDayWarning(false);
                handleNext();
              }} 
              className="bg-[#9C39FF] text-white hover:bg-[#9C39FF]/90 rounded-full"
            >
              {isEn ? "Continue" : "Fortsett"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
