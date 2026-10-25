"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { formatNokWithEur } from "@/lib/currency";

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const langParam = searchParams.get("lang");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [bookingData, setBookingData] = useState<any>(null);

  const isEn = langParam === "en" || bookingData?.locale === "en";

  useEffect(() => {
    async function verifyBooking() {
      if (!reference) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch('/api/booking/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference })
        });

        if (response.ok) {
          const data = await response.json();
          setBookingData(data.booking || null);
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error verifying booking:", error);
        setStatus("error");
      }
    }

    verifyBooking();
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-[#9C39FF] mb-4" />
        <h2 className="text-xl font-light">
          {isEn ? "Verifying booking..." : "Verifiserer bestilling..."}
        </h2>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center py-20">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-light mb-4">
          {isEn ? "Could not verify booking" : "Kunne ikke verifisere bestilling"}
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          {isEn
            ? "We could not locate or verify your booking. Please contact us at post@krsvr.no if you have any questions."
            : "Vi klarte ikke å finne eller verifisere bestillingen din. Ta kontakt med oss på post@krsvr.no dersom du har spørsmål."}
        </p>
        <Button onClick={() => router.push(isEn ? "/en" : "/")} className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full px-8">
          {isEn ? "Back to Home" : "Tilbake til forsiden"}
        </Button>
      </div>
    );
  }

  const isTerminal = bookingData?.paymentType === 'terminal' || (bookingData?.amountPaid === 0 && (bookingData?.totalPrice || 0) > 0);
  const manageUrl = bookingData?.id
    ? isEn
      ? `/en/booking/manage/${bookingData.id}`
      : `/booking/manage/${bookingData.id}`
    : null;

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto"
      >
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-4xl font-light mb-4">
          {isEn ? "Booking Confirmed!" : "Bestillingen er bekreftet!"}
        </h2>
        
        {isTerminal ? (
          <div className="text-zinc-300 mb-8 space-y-3">
            <p>
              {isEn
                ? "Thank you for your reservation. You have chosen to pay upon arrival in the arena."
                : "Takk for din bestilling. Du har valgt å betale ved oppmøte."}
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300">
              <span className="text-zinc-400 block text-xs uppercase tracking-wider mb-1">
                {isEn ? "Payable at the arena" : "Betales i arenaen"}
              </span>
              <strong className="text-xl text-white font-semibold">
                {isEn
                  ? formatNokWithEur(bookingData?.totalPrice || 0, "en")
                  : `${bookingData?.totalPrice || 0} NOK`}
              </strong>
              <p className="text-xs text-zinc-400 mt-1">
                {isEn
                  ? "Paid by card terminal (Visa, Mastercard, Apple Pay, or cash) upon arrival before your session starts."
                  : "Betales med kortterminal (Visa, Mastercard, Apple Pay eller kontant) ved ankomst før spillstart."}
              </p>
            </div>
            <p className="text-sm text-zinc-400">
              {isEn
                ? `We have sent a confirmation email to ${bookingData?.email || "your email"}. Please arrive on time so you do not lose any game time. We look forward to welcoming you.`
                : `Vi har sendt en bekreftelse til ${bookingData?.email || "din e-post"}. Vi gleder oss til å ta imot dere!`}
            </p>
          </div>
        ) : (
          <p className="text-zinc-300 mb-8">
            {isEn
              ? "Thank you for your payment. Your VR experience is now confirmed and registered. A receipt and confirmation have been sent to your email. We look forward to welcoming you at KRS VR Arena."
              : "Takk for betalingen. Din VR-opplevelse er nå bekreftet og registrert. En kvittering og bekreftelse er sendt til din e-post. Vi gleder oss til å ta imot dere hos KRS VR Arena!"}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {manageUrl && (
            <Button onClick={() => router.push(manageUrl)} variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-white rounded-full px-6">
              {isEn ? "Manage Booking / Player Names" : "Administrer bestilling"}
            </Button>
          )}
          <Button onClick={() => router.push(isEn ? "/en" : "/")} className="bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full px-8 shadow-[0_0_20px_rgba(156,57,255,0.4)]">
            {isEn ? "Back to Home" : "Tilbake til forsiden"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutReturn() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-[#9C39FF] mb-4" />
          <h2 className="text-xl font-light">Loading...</h2>
        </div>
      }>
        <CheckoutReturnContent />
      </Suspense>
    </div>
  );
}