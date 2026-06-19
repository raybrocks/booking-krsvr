"use client";

import { useState, useEffect, useMemo } from "react";
import { format, addDays, isSameDay, getDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Users, Clock, Calendar as CalendarIcon } from "lucide-react";

import { useBookingFlow } from "@/hooks/useBookingFlow";

export default function BookingFlow() {
  const {
    step, setStep, experiences, settings, loading,
    selectedDate, setSelectedDate, selectedTime, setSelectedTime,
    players, setPlayers, selectedExperience, setSelectedExperience,
    filterType, setFilterType,
    firstName, setFirstName, lastName, setLastName, email, setEmail, phone, setPhone,
    acceptedTerms, setAcceptedTerms, acceptedNewsletter, setAcceptedNewsletter,
    paymentType, setPaymentType, isSubmitting, bookingComplete,
    discountCodeInput, setDiscountCodeInput, appliedDiscount, validatingDiscount,
    discountError, discountMessage,
    globalPricing, bookedTimes, loadingTimes, availableTimes, bookedDates,
    isVippsTest, pricePerPerson, rawTotalPrice, discountAmount, totalPrice, amountToPay,
    handleApplyDiscount, handleNext, handleBack, handleSubmit
  } = useBookingFlow();

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
        <h2 className="text-3xl font-light mb-4">Booking Bekreftet</h2>
        <p className="text-zinc-300 mb-8">
          Takk, {firstName}. VR opplevelsen er booket {selectedDate ? format(selectedDate, "MMMM do, yyyy") : ""} kl. {selectedTime}. Vi har sendt bekreftelse til {email}.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full border-zinc-700 hover:bg-zinc-800">
          Book en ny
        </Button>
      </motion.div>
    );
  }

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
                <h2 className="text-3xl font-light tracking-tight mb-2">Velg dato & tid</h2>
                <p className="text-zinc-400">Velg når dere vil besøke Krs VR Arena.</p>
              </div>
              
              <div className="bg-[#9C39FF]/10 border border-[#9C39FF]/20 rounded-2xl p-4 md:p-5 text-sm text-zinc-300 space-y-3">
                <p>
                  <strong>For små grupper (2-8 personer):</strong> <br />Bruk bookingmodulen under.
                </p>
                <p>
                  <strong>For større grupper (8-64 personer):</strong> <br />Utforsk våre arrangementssider og reserver via kontaktskjema.
                </p>
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
                    Ledige tider
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
                              {timeStr} {isBooked && ("(Booket)")}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-sm">Ingen ledige tider på denne datoen.</p>
                    )
                  ) : (
                    <p className="text-zinc-400 text-sm">Vennligst velg en dato først.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Group Size */}
          {step === 2 && (
            <div className="space-y-8 text-center max-w-lg mx-auto">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">Gruppestørrelse</h2>
                <p className="text-zinc-400">Hvor mange skal spille?</p>
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
                  onClick={() => setPlayers(Math.min(8, players + 1))}
                  className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  +
                </button>
              </div>

              <div className="bg-zinc-900/50 border border-[#9C39FF]/20 rounded-2xl p-6 text-center max-w-sm mx-auto mb-8 shadow-[0_0_15px_rgba(156,57,255,0.05)]">
                <div className="text-4xl font-medium text-white mb-2">
                  {pricePerPerson} kr <span className="text-base font-normal text-zinc-400">per pers</span>
                </div>
                <div className="text-sm text-zinc-500 font-medium">
                  Total for {players}: {pricePerPerson * players} kr
                </div>
              </div>
              
              <div className="bg-[#9C39FF]/10 border border-[#9C39FF]/20 rounded-2xl p-4 md:p-5 text-sm text-zinc-300 space-y-3">
                <p>Prisene er per person og synker for større grupper.</p>
                <p><strong>Merk:</strong> Du kan justere antall personer helt frem til spillet starter. Vennligst sjekk maks kapasitet på spillet dere velger før ankomst.</p>
              </div>
            </div>
          )}

          {/* STEP 3: VR Experience */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">Velg VR Opplevelse</h2>
                <p className="text-zinc-400">Velg VR-eventyr for gruppen.</p>
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
                      {type === "All" ? "Alle" : type}
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
                        {category}
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
                            <div className="absolute top-3 right-3 bg-[#9C39FF] px-3 py-1 rounded-full text-xs font-medium text-white shadow-md">
                              {exp.type}
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <h3 className="text-xl font-medium mb-2">{exp.name}</h3>
                            <p className="text-zinc-400 text-sm mb-4">{exp.shortDescription}</p>
                            
                            <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                              {exp.duration && <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{exp.duration}</span>}
                              <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Fra {exp.age} år</span>
                              <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Maks {exp.maxPlayers} spillere</span>
                              {exp.difficulty && <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{exp.difficulty}</span>}
                              {exp.familyFriendly && (
                                <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Familievennlig</span>
                              )}
                              {exp.teambuilding && (
                                <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Teambuilding</span>
                              )}
                              {exp.party && (
                                <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Party</span>
                              )}
                              {exp.jumpScare && (
                                <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Jump Scare</span>
                              )}
                              {exp.tags && exp.tags.map(tag => (
                                <span key={tag} className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{tag}</span>
                              ))}
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
                                Book nå
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
                  Ingen opplevelser tilgjengelig for {players} personer med valgt filter.
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Personal Info */}
          {step === 4 && (
            <div className="space-y-8 max-w-md mx-auto">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">Dine opplysninger</h2>
                <p className="text-zinc-400">Hvem står på bookingen?</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-zinc-300">Fornavn</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-zinc-300">Etternavn</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">E-postadresse</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">Telefonnummer</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+47 "
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Terms */}
          {step === 5 && (
            <div className="space-y-8 max-w-md mx-auto">
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">Nesten ferdig</h2>
                <p className="text-zinc-400">Vennligst se over våre vilkår.</p>
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
                      Jeg har lest og aksepterer kjøpsvilkårene, inkludert avbestillingsregler.
                    </Label>
                    <p className="text-xs text-zinc-400">
                      Avbestilling må skje senest 48 timer før aktiviteten.
                    </p>
                    <Dialog>
                      <DialogTrigger className="text-[#9C39FF] text-xs hover:underline outline-none text-left mt-1">
                        Les fullstendige vilkår
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader tabIndex={-1} autoFocus className="outline-none">
                          <DialogTitle>Vilkår og betingelser</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {settings?.termsContent || "Ingen vilkår tilgjengelig."}
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
                            ↑ Til toppen
                          </button>
                          <DialogClose className="bg-[#9C39FF] hover:bg-[#8b33e6] text-white py-2 px-6 rounded-lg text-sm font-medium transition-colors">Lukk</DialogClose>
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
                      Meld meg på nyhetsbrev
                    </Label>
                    <p className="text-xs text-zinc-400">
                      Få oppdateringer om nye VR-opplevelser og tilbud.
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
                <h2 className="text-3xl font-light tracking-tight mb-2">Betaling</h2>
                <p className="text-zinc-400">Se over bookingen og velg betalingsmetode.</p>
              </div>
              
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="font-medium">{selectedExperience?.name}</h3>
                    <p className="text-sm text-zinc-400">{players} Spillere</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{selectedDate && format(selectedDate, "MMM do")}</p>
                    <p className="text-sm text-zinc-400">{selectedTime}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end text-lg">
                  <span className="text-zinc-300">Sum</span>
                  <div className="text-right">
                    <div className="text-sm text-zinc-500 line-through">
                      {appliedDiscount && `${rawTotalPrice} NOK`}
                    </div>
                    <div className="font-medium text-white">
                      {pricePerPerson} NOK <span className="text-sm font-normal text-zinc-400">{isVippsTest ? "totalt" : "per person"}</span>
                    </div>
                    <div className="text-sm text-zinc-500 mt-0.5">
                      {`Total: ${totalPrice} NOK`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Code Section */}
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
                <Label htmlFor="discount" className="text-zinc-300">Har du en rabattkode?</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="discount"
                    value={discountCodeInput}
                    onChange={(e) => setDiscountCodeInput(e.target.value)}
                    placeholder="Skriv inn kode"
                    className="bg-zinc-950 border-zinc-800"
                    disabled={validatingDiscount}
                  />
                  <Button 
                    onClick={handleApplyDiscount}
                    disabled={!discountCodeInput.trim() || validatingDiscount}
                    variant="secondary"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  >
                    {validatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Legg til"}
                  </Button>
                </div>
                {discountError && <p className="text-red-400 text-sm">{discountError}</p>}
                {discountMessage && <p className="text-green-400 text-sm">{discountMessage}</p>}
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-4 text-sm text-zinc-300 border border-zinc-800">
                <p>Merk: Du kan justere antall personer helt frem til spillet starter. Vennligst sjekk maks kapasitet på spillet dere velger før ankomst.</p>
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-300">Betalingsalternativ</Label>
                <RadioGroup value={paymentType} onValueChange={(v: "full" | "reservation") => setPaymentType(v)}>
                  <div className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentType === 'full' ? 'border-[#9C39FF] bg-[#9C39FF]/10' : 'border-zinc-800 hover:border-zinc-700'}`} onClick={() => setPaymentType('full')}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="full" id="full" className="border-zinc-500 text-[#9C39FF]" />
                      <Label htmlFor="full" className="cursor-pointer">Betal hele beløpet</Label>
                    </div>
                    <span className="font-medium">{totalPrice} NOK</span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentType === 'reservation' ? 'border-[#9C39FF] bg-[#9C39FF]/10' : 'border-zinc-800 hover:border-zinc-700'}`} onClick={() => setPaymentType('reservation')}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="reservation" id="reservation" className="border-zinc-500 text-[#9C39FF]" />
                      <div className="space-y-1">
                        <Label htmlFor="reservation" className="cursor-pointer font-medium">Reservasjonsavgift</Label>
                        <p className="text-xs text-zinc-400">Tilsvarer 1 person</p>
                        <p className="text-xs text-zinc-400">Betal restbeløpet i arenaen</p>
                      </div>
                    </div>
                    <span className="font-medium">{pricePerPerson} NOK</span>
                  </div>
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
              Tilbake
            </Button>
            
            {step < 6 ? (
              <Button 
                onClick={handleNext} 
                className="bg-[#9C39FF] text-white hover:bg-[#9C39FF]/90 rounded-full px-8 shadow-[0_0_20px_rgba(156,57,255,0.4)]"
              >
                Fortsett
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : settings?.bookingsClosed ? (
              <Button
                disabled
                variant="outline"
                className="border-zinc-800 bg-zinc-900/50 opacity-100 cursor-not-allowed hover:bg-zinc-900/50 hover:text-white text-zinc-300 rounded-2xl h-auto py-3 px-8 flex flex-col items-center"
              >
                <div className="font-medium">Booking midlertidig stengt</div>
                <div className="text-xs text-zinc-500 mt-1">Send e-post til post@krsvr.no</div>
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
                    Behandler...
                  </>
                ) : (
                  `Betal ${amountToPay} NOK`
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
