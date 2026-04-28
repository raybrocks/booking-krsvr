"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function verifyBooking() {
      if (!reference) {
        setStatus("error");
        return;
      }

      try {
        const bookingRef = doc(db, "bookings", reference);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
          await updateDoc(bookingRef, {
            status: "confirmed"
          });
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
        <h2 className="text-xl font-light">Verifying payment...</h2>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center py-20">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-light mb-4">Payment Verification Failed</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          We could not verify your payment or find your booking. If you were charged, please contact support.
        </p>
        <Button onClick={() => router.push("/")} className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full px-8">
          Return to Home
        </Button>
      </div>
    );
  }

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
        <h2 className="text-4xl font-light mb-4">Booking Confirmed!</h2>
        <p className="text-zinc-300 mb-8">
          Thank you for your payment. Your VR experience is successfully booked. We look forward to seeing you at Krs VR Arena!
        </p>
        <Button onClick={() => router.push("/")} className="bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full px-8 shadow-[0_0_20px_rgba(156,57,255,0.4)]">
          Book Another Session
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