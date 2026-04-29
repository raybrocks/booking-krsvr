import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reference = body.reference;
    
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const bookingRef = doc(db, 'bookings', reference);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingSnap.data();

    // If it's already confirmed, we might just need to ensure the email is sent
    if (bookingData.status !== 'confirmed') {
      await updateDoc(bookingRef, {
        status: 'confirmed'
      });
    }

    // Check if we need to send the email
    if (!bookingData.confirmationEmailSent) {
      let customText = "";
      try {
        const settingsRef = doc(db, 'settings', 'general');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          customText = settingsSnap.data().bookingConfirmationText || "";
        }
      } catch (e) {
        console.error("Failed to fetch settings for email:", e);
      }

      const { sendBookingConfirmationEmail, addContactToNewsletter } = await import('@/lib/email');
      
      // Ensure we pass the current data including any potentially missing fields
      const emailData = { 
        ...bookingData, 
        amountPaid: bookingData.amountPaid || 0 
      };

      await sendBookingConfirmationEmail(
        bookingData.email,
        emailData,
        customText
      );

      if (bookingData.acceptedNewsletter && !bookingData.newsletterAdded) {
         await addContactToNewsletter(bookingData.email, bookingData.firstName, bookingData.lastName);
         await updateDoc(bookingRef, { newsletterAdded: true });
      }

      // Mark email as sent
      await updateDoc(bookingRef, {
        confirmationEmailSent: true
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying booking:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
