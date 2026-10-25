import { useState, useEffect, useMemo } from "react";
import { format, getDay, isSameDay } from "date-fns";
import { toast } from "sonner";
import { localizeExperience } from "@/lib/i18n";

export type Experience = {
  id: string;
  name: string;
  nameEn?: string;
  subName?: string;
  subNameEn?: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  picture: string;
  images?: string[];
  type: string;
  displayType?: string;
  age: string;
  difficulty: string;
  difficultyEn?: string;
  maxPlayers: number;
  pricing: Record<string, number>;
  isActive: boolean;
  isNew?: boolean;
  order?: number;
  familyFriendly?: boolean;
  teambuilding?: boolean;
  party?: boolean;
  jumpScare?: boolean;
  duration?: string;
  tags?: string[];
  languages?: string[];
  suitableFor?: string[];
  suitableForEn?: string[];
};

export type Settings = {
  openingHours: Record<string, string[]>;
  specialHours?: Record<string, string[]>;
  reservationFee: number;
  termsContent?: string;
  bookingsClosed?: boolean;
};

export function useBookingFlow(locale: "no" | "en" = "no") {
  const isEn = locale === "en";
  const [step, setStep] = useState(1);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [players, setPlayers] = useState<number>(5);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(5).fill(""));
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  
  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  
  // Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedNewsletter, setAcceptedNewsletter] = useState(false);
  
  // Payment: Default to "terminal" (Pay on arrival) for international/English users
  const [paymentType, setPaymentType] = useState<"vipps" | "terminal">(isEn ? "terminal" : "vipps");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  // Discount Code
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  
  // Global Pricing State
  const [globalPricing, setGlobalPricing] = useState<Record<string, number>>({
    "2": 460, "3": 395, "4": 395, "5": 385, "6": 385, "7": 385, "8": 375
  });
  
  // Booked Times
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [rawBookingsForDate, setRawBookingsForDate] = useState<any[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const timestamp = new Date().getTime();
        const [expRes, settingsRes, datesRes] = await Promise.all([
          fetch(`/api/experiences?active_only=true&t=${timestamp}`),
          fetch(`/api/settings?t=${timestamp}`),
          fetch(`/api/booking/dates?t=${timestamp}`)
        ]);
        
        if (expRes.ok) {
           const expData = await expRes.json();
           const localizedExps: Experience[] = expData.map((e: any) => localizeExperience(e, locale));
           setExperiences(localizedExps);

           // Preselect experience if ?opplevelse= or ?experience= is in URL
           if (typeof window !== "undefined") {
             const params = new URLSearchParams(window.location.search);
             const preselectedId = params.get("opplevelse") || params.get("experience");
             if (preselectedId) {
               const found = localizedExps.find((e) => e.id === preselectedId);
               if (found) {
                 setSelectedExperience(found);
               }
             }
           }
        }
        
        if (settingsRes.ok) {
           const settingsData = await settingsRes.json();
           if (settingsData.general) {
             setSettings(settingsData.general as Settings);
           }
           if (settingsData.pricing && settingsData.pricing.pricing) {
             setGlobalPricing(settingsData.pricing.pricing);
           } else if (settingsData.pricing) {
             setGlobalPricing(settingsData.pricing);
           }
         }
         
         if (datesRes.ok) {
           const datesData = await datesRes.json();
           setBookedDates(datesData);
         }
      } catch (error) {
        console.error("Failed to load data", error);
        toast.error(isEn ? "Failed to load booking data. Please try again later." : "Kunne ikke laste bookingdata. Prøv igjen.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [locale, isEn]);

  useEffect(() => {
    async function fetchBookedTimes() {
      if (!selectedDate) {
        setBookedTimes([]);
        return;
      }
      setLoadingTimes(true);
      try {
        const dateString = format(selectedDate, "yyyy-MM-dd");
        const response = await fetch(`/api/booking?date=${dateString}`);
        if (!response.ok) throw new Error('Failed to fetch booked times');
        const existingBookings = await response.json();
        
        const now = Date.now();
        const activeBookings = existingBookings.filter((b: any) => {
          if (
            b.status?.toLowerCase() === "terminated" || 
            b.status?.toLowerCase() === "cancelled" ||
            b.status === "TERMINATED" || 
            b.status === "CANCELLED"
          ) return false;
          
          if (b.status?.toLowerCase() === "pending" && b.createdAt) {
            let createdAtMs = now;
            if (typeof b.createdAt === 'string') {
               createdAtMs = new Date(b.createdAt).getTime();
            }
            if (now - createdAtMs > 15 * 60 * 1000) return false;
          }
          return true;
        });
        
        const times = activeBookings.map((b: any) => typeof b.time === 'string' ? b.time.trim() : b.time);
        setRawBookingsForDate(activeBookings);
        setBookedTimes(times);
        setSelectedTime(prev => times.includes(prev?.trim()) ? "" : prev);
      } catch (error) {
        console.error("Failed to fetch booked times", error);
      } finally {
        setLoadingTimes(false);
      }
    }
    fetchBookedTimes();
  }, [selectedDate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const availableTimes = useMemo(() => {
    if (!selectedDate || !settings) return [];
    const dateString = format(selectedDate, "yyyy-MM-dd");
    if (settings.specialHours && settings.specialHours[dateString]) {
      return settings.specialHours[dateString];
    }
    return settings.openingHours[getDay(selectedDate).toString()] || [];
  }, [selectedDate, settings]);

  const isVippsTest = selectedExperience?.type && selectedExperience.type.toLowerCase() === "vipps test";
  const basePricePerPerson = globalPricing[players > 8 ? "8" : players.toString()] || 0;
  const pricePerPerson = isVippsTest ? 2 : basePricePerPerson;
  const rawTotalPrice = isVippsTest ? 2 : (selectedExperience ? basePricePerPerson * players : 0);

  let discountAmount = 0;
  if (!isVippsTest && appliedDiscount) {
    if (appliedDiscount.type === "percentage") {
      discountAmount = (rawTotalPrice * appliedDiscount.discount) / 100;
    } else if (appliedDiscount.type === "fixed_per_person") {
      discountAmount = appliedDiscount.discount * players;
    } else {
      discountAmount = appliedDiscount.discount;
    }
    if (discountAmount > rawTotalPrice) discountAmount = rawTotalPrice;
  }
  const totalPrice = rawTotalPrice - discountAmount;
  const amountToPay = isVippsTest ? 2 : (paymentType === "vipps" ? totalPrice : 0);

  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) return;
    setValidatingDiscount(true);
    setDiscountError("");
    setDiscountMessage("");
    try {
      const res = await fetch("/api/discount-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDiscountError(data.error || (isEn ? "Invalid discount code" : "Ugyldig rabattkode"));
        setAppliedDiscount(null);
      } else {
        setAppliedDiscount(data);
        setDiscountMessage(
          isEn
            ? `Discount code applied! (-${data.type === 'percentage' ? data.discount + '%' : data.discount + ' NOK'})`
            : `Rabattkode lagt til! (-${data.type === 'percentage' ? data.discount + '%' : data.discount + ' kr'})`
        );
        setDiscountCodeInput("");
      }
    } catch (err) {
      setDiscountError(isEn ? "Could not validate discount code" : "Kunne ikke validere rabattkode");
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!selectedDate || !selectedTime)) {
      return toast.error(isEn ? "Please select a date and time." : "Vennligst velg dato og tid.");
    }
    if (step === 3 && !selectedExperience) {
      return toast.error(isEn ? "Please select an experience." : "Vennligst velg en opplevelse.");
    }
    if (step === 4) {
      if (!firstName || !lastName || !email || !phone) {
        return toast.error(isEn ? "Please fill in all required fields." : "Vennligst fyll inn alle felter.");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return toast.error(isEn ? "Please enter a valid email address." : "Vennligst skriv inn en gyldig e-postadresse.");
      }
      const digitCount = phone.replace(/\D/g, '').length;
      if (digitCount < 8) {
        return toast.error(isEn ? "Phone number must contain at least 8 digits." : "Telefonnummeret må inneholde minst 8 siffer.");
      }
    }
    if (step === 5 && !acceptedTerms) {
      return toast.error(isEn ? "Please accept the terms and conditions." : "Du må godta vilkårene.");
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedExperience) return;
    setIsSubmitting(true);
    try {
      const bookingResponse = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: selectedExperience.id,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTime,
          players,
          playerNames: playerNames.slice(0, players),
          firstName, lastName, email, phone,
          internalNotes: customerNote.trim() !== '' ? customerNote : undefined,
          acceptedTerms, acceptedNewsletter,
          paymentType, totalPrice, amountPaid: amountToPay,
          status: "pending", discountCode: appliedDiscount?.code,
          locale,
        })
      });

      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) throw new Error(bookingData.error || 'Failed to create pending booking');
      
      const bookingId = bookingData.id;

      if (amountToPay === 0) {
        const confirmZeroRes = await fetch('/api/booking/confirm-zero', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ bookingId, locale })
        });
        if (!confirmZeroRes.ok) throw new Error('Kunne ikke bekrefte 0 kr booking');
        const returnUrl = `/checkout/return?reference=${bookingId}${isEn ? "&lang=en" : ""}`;
        if (window.top) window.top.location.href = returnUrl;
        else window.location.href = returnUrl;
        return;
      }

      const response = await fetch('/api/vipps/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId, amount: amountToPay,
          description: `Booking: ${selectedExperience.name} for ${players} players`,
          locale,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) throw new Error(data.error || 'Failed to initialize payment');

      if (window.top) window.top.location.href = data.checkoutUrl;
      else window.location.href = data.checkoutUrl;
      
    } catch (error) {
      console.error("Booking failed", error);
      toast.error(isEn ? "Booking submission failed. Please try again." : "Betalingsinitialisering feilet. Vennligst prøv igjen.");
      setIsSubmitting(false);
    }
  };

  const effectiveBookedTimes = useMemo(() => {
    const timeToMinutes = (t: string) => {
      if (!t || !t.includes(':')) return 0;
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const blocked = new Set<string>();

    // 1. Direct booking times & overlapping slots based on duration
    rawBookingsForDate.forEach((b: any) => {
      if (b.time) blocked.add(b.time.trim());

      const bStart = timeToMinutes(b.time);
      const bDuration = Number(b.duration) || 90;
      const bEnd = bStart + bDuration;

      availableTimes.forEach(slot => {
        const slotStart = timeToMinutes(slot);
        const slotEnd = slotStart + 90;
        if (slotStart < bEnd && bStart < slotEnd) {
          blocked.add(slot.trim());
        }
      });
    });

    // 2. If selected date is today, block past timeslots
    if (selectedDate && isSameDay(selectedDate, new Date())) {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      availableTimes.forEach(t => {
        const [h, m] = t.split(':').map(Number);
        if (h < currentHour || (h === currentHour && m <= currentMinute)) {
          blocked.add(t.trim());
        }
      });
    }

    return Array.from(blocked);
  }, [rawBookingsForDate, selectedDate, availableTimes]);

  return {
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
    globalPricing, bookedTimes: effectiveBookedTimes, loadingTimes, availableTimes, bookedDates,
    isVippsTest, pricePerPerson, rawTotalPrice, discountAmount, totalPrice, amountToPay,
    handleApplyDiscount, handleNext, handleBack, handleSubmit
  };
}
