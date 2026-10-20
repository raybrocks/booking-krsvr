"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [bookingData, setBookingData] = useState<any>(null);

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
        <h2 className="text-xl font-light">Verifiserer bestilling...</h2>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center py-20">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-light mb-4">Kunne ikke verifisere bestilling</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          Vi klarte ikke å finne eller verifisere bestillingen din. Ta kontakt med oss på post@krsvr.no dersom du har spørsmål.
        </p>
        <Button onClick={() => router.push("/")} className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full px-8">
          Tilbake til forsiden
        </Button>
      </div>
    );
  }

  const isTerminal = bookingData?.paymentType === 'terminal' || (bookingData?.amountPaid === 0 && (bookingData?.totalPrice || 0) > 0);

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
        <h2 className="text-4xl font-light mb-4">Bestillingen er bekreftet!</h2>
        
        {isTerminal ? (
          <div className="text-zinc-300 mb-8 space-y-3">
            <p>
              Takk for din bestilling. Du har valgt å betale ved oppmøte.
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300">
              <span className="text-zinc-400 block text-xs uppercase tracking-wider mb-1">Betales i arenaen</span>
              <strong className="text-xl text-white font-semibold">
                {bookingData?.totalPrice || 0} NOK
              </strong>
              <p className="text-xs text-zinc-400 mt-1">
                Betales med kortterminal (Visa, Mastercard, Apple Pay eller kontant) ved ankomst før spillstart.
              </p>
            </div>
            <p className="text-sm text-zinc-400">
              Vi har sendt en bekreftelse til {bookingData?.email || 'din e-post'}. Vi gleder oss til å ta imot dere!
            </p>
          </div>
        ) : (
          <p className="text-zinc-300 mb-8">
            Takk for betalingen. Din VR-opplevelse er nå bekreftet og registrert. En kvittering og bekreftelse er sendt til din e-post. Vi gleder oss til å ta imot dere hos KRS VR Arena!
          </p>
        )}

        <Button onClick={() => router.push("/")} className="bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full px-8 shadow-[0_0_20px_rgba(156,57,255,0.4)]">
          Tilbake til forsiden
        </Button>
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