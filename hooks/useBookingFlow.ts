import { useState, useEffect, useMemo } from "react";
import { format, getDay } from "date-fns";
import { toast } from "sonner";

export type Experience = {
  id: string;
  name: string;
  shortDescription: string;
  picture: string;
  type: string;
  age: string;
  difficulty: string;
  maxPlayers: number;
  pricing: Record<string, number>;
  isActive: boolean;
  order?: number;
  familyFriendly?: boolean;
  teambuilding?: boolean;
  party?: boolean;
  jumpScare?: boolean;
  duration?: string;
  tags?: string[];
};

export type Settings = {
  openingHours: Record<string, string[]>;
  specialHours?: Record<string, string[]>;
  reservationFee: number;
  termsContent?: string;
  bookingsClosed?: boolean;
};

export function useBookingFlow() {
  const [step, setStep] = useState(1);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [players, setPlayers] = useState<number>(5);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  
  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedNewsletter, setAcceptedNewsletter] = useState(false);
  
  // Payment
  const [paymentType, setPaymentType] = useState<"full" | "reservation">("full");
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
           setExperiences(expData);
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
        toast.error("Failed to load booking data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
    } else {
      discountAmount = appliedDiscount.discount;
    }
    if (discountAmount > rawTotalPrice) discountAmount = rawTotalPrice;
  }
  const totalPrice = rawTotalPrice - discountAmount;
  const amountToPay = isVippsTest ? 2 : (paymentType === "full" ? totalPrice : Math.min(pricePerPerson, totalPrice));

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
        setDiscountError(data.error || "Ugyldig rabattkode");
        setAppliedDiscount(null);
      } else {
        setAppliedDiscount(data);
        setDiscountMessage(`Rabattkode lagt til! (-${data.type === 'percentage' ? data.discount + '%' : data.discount + ' kr'})`);
        setDiscountCodeInput("");
      }
    } catch (err) {
      setDiscountError("Kunne ikke validere rabattkode");
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!selectedDate || !selectedTime)) return toast.error("Vennligst velg dato og tid.");
    if (step === 3 && !selectedExperience) return toast.error("Vennligst velg en opplevelse.");
    if (step === 4) {
      if (!firstName || !lastName || !email || !phone) return toast.error("Vennligst fyll inn alle felter.");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return toast.error("Vennligst skriv inn en gyldig e-postadresse.");
      const digitCount = phone.replace(/\D/g, '').length;
      if (digitCount < 8) return toast.error("Telefonnummeret må inneholde minst 8 siffer.");
    }
    if (step === 5 && !acceptedTerms) return toast.error("Du må godta vilkårene.");
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
          firstName, lastName, email, phone,
          acceptedTerms, acceptedNewsletter,
          paymentType, totalPrice, amountPaid: amountToPay,
          status: "pending", discountCode: appliedDiscount?.code,
        })
      });

      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) throw new Error(bookingData.error || 'Failed to create pending booking');
      
      const bookingId = bookingData.id;

      if (amountToPay === 0) {
        const confirmZeroRes = await fetch('/api/booking/confirm-zero', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ bookingId })
        });
        if (!confirmZeroRes.ok) throw new Error('Kunne ikke bekrefte 0 kr booking');
        if (window.top) window.top.location.href = `/checkout/return?reference=${bookingId}`;
        else window.location.href = `/checkout/return?reference=${bookingId}`;
        return;
      }

      const response = await fetch('/api/vipps/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId, amount: amountToPay,
          description: `Booking: ${selectedExperience.name} for ${players} players`,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) throw new Error(data.error || 'Failed to initialize payment');

      if (window.top) window.top.location.href = data.checkoutUrl;
      else window.location.href = data.checkoutUrl;
      
    } catch (error) {
      console.error("Booking failed", error);
      toast.error("Payment initialization failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
