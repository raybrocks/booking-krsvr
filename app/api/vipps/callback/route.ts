import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.VIPPS_CALLBACK_TOKEN || 'DefaultSecureToken123';

    // Verify the callback token
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Vipps Webhook Received:', body);

    const reference = body.reference || body.aggregate?.reference;
    const amount = body.amount?.value || body.aggregate?.amount?.value || 0;
    const paymentStatus = body.name || body.status || 'UNKNOWN';

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    // Attempt to log transaction
    try {
      const transactionRef = adminDb.collection('transactions').doc(reference);
      await transactionRef.set({
        bookingId: reference,
        amount: amount,
        status: paymentStatus,
        vippsOrderId: body.orderId || body.pspReference || 'unknown',
        transactionLogHistory: FieldValue.arrayUnion(body),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (dbErr) {
      console.error('Failed to log transaction:', dbErr);
    }

    // Update booking with the latest vipps status
    try {
      const bookingRef = adminDb.collection('bookings').doc(reference);
      const updateData: any = {
        vippsStatus: paymentStatus,
        vippsUpdatedAt: FieldValue.serverTimestamp()
      };
      
      if (amount > 0 && (paymentStatus.includes('captured') || paymentStatus === 'CAPTURED' || paymentStatus.includes('reserved') || paymentStatus === 'AUTHORIZED' || paymentStatus === 'SALE')) {
        updateData.vippsAmount = amount;
      }
      
      if (paymentStatus.includes('cancelled') || paymentStatus === 'TERMINATED' || paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED') {
         updateData.status = 'cancelled';
      } else if (paymentStatus.includes('reserved') || paymentStatus === 'AUTHORIZED') {
         // Keep it pending or mark reserved? We can mark it confirmed once captured, or let the shop decide.
         // We won't automatically capture anymore since user wants to do it manually from dashboard!
         // Wait, user said "Dersom en ordre er reservert så skal det være 2 knapper"
         // I should NOT automatically capture here if previously they wanted manual capture.
      } else if (paymentStatus.includes('captured') || paymentStatus === 'CAPTURED' || paymentStatus === 'SALE') {
         updateData.status = 'confirmed';
         updateData.amountPaid = amount / 100;
      }

      await bookingRef.update(updateData);
    } catch (dbErr) {
      console.error('Failed to update booking with vipps status:', dbErr);
    }

    if (paymentStatus.includes('cancelled') || paymentStatus === 'TERMINATED' || paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED') {
       return NextResponse.json({ success: true });
    }

    // After updating booking, if it was captured we might need to send email
    if (paymentStatus.includes('captured') || paymentStatus === 'CAPTURED' || paymentStatus === 'SALE') {
       try {
         const bookingRef = adminDb.collection('bookings').doc(reference);
         const bookingSnap = await bookingRef.get();
         if (bookingSnap.exists) {
           const bookingData = bookingSnap.data()!;

           // Check if we already sent the email to avoid duplicates
           if (!bookingData.confirmationEmailSent) {
             // Fetch custom text from settings
             let customText = "";
             try {
               const settingsRef = adminDb.collection('settings').doc('general');
               const settingsSnap = await settingsRef.get();
               if (settingsSnap.exists) {
                 customText = settingsSnap.data()!.bookingConfirmationText || "";
               }
             } catch (e) {
               console.error("Failed to fetch settings for email:", e);
             }

             // Send email
             const { sendBookingConfirmationEmail, sendAdminNewBookingNotification, addContactToNewsletter } = await import('@/lib/email');
             
             await sendBookingConfirmationEmail(
               bookingData.email,
               { ...bookingData, amountPaid: amount / 100 },
               customText
             );

             // Send admin notification
             await sendAdminNewBookingNotification({ ...bookingData, amountPaid: amount / 100 });

             // Subscribe to newsletter if accepted
             if (bookingData.acceptedNewsletter && !bookingData.newsletterAdded) {
                await addContactToNewsletter(bookingData.email, bookingData.firstName, bookingData.lastName);
                await bookingRef.update({ newsletterAdded: true });
             }

             // Mark email as sent
             await bookingRef.update({
               confirmationEmailSent: true
             });
           }
         }

       } catch (error) {
         console.error('Error updating booking status from webhook:', error);
       }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vipps Callback Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}