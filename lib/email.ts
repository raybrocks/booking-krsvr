import { Resend } from 'resend';
import { adminDb } from '@/lib/firebase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getAdminEmail() {
  try {
    const settingsRef = adminDb.collection('settings').doc('general');
    const settingsSnap = await settingsRef.get();
    if (settingsSnap.exists && settingsSnap.data()?.adminEmail) {
      return settingsSnap.data()?.adminEmail;
    }
  } catch (e) {
    console.error("Failed to fetch admin email", e);
  }
  return "post@krsvr.no";
}

export async function sendBookingConfirmationEmail(
  to: string, 
  bookingDetails: any,
  customText: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return;
  }

  const adminEmail = await getAdminEmail();
  const { firstName, lastName, date, time, players, totalPrice, amountPaid, experienceId } = bookingDetails;
  
  let experienceTitle = "VR Experience";
  if (experienceId) {
    try {
      const expRef = adminDb.collection('experiences').doc(experienceId);
      const expSnap = await expRef.get();
      if (expSnap.exists && expSnap.data()?.title) {
        experienceTitle = expSnap.data()?.title;
      }
    } catch (e) {
      console.error("Error fetching experience title:", e);
    }
  }

  // Basic HTML template for the email
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #9C39FF;">Booking Confirmation & Receipt</h1>
      <p>Hi ${firstName} ${lastName},</p>
      <p>Thank you for your booking! Your payment of NOK ${amountPaid} has been received.</p>
      
      ${customText ? `<div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9C39FF;">
        <p style="margin: 0;">${customText.replace(/\n/g, '<br/>')}</p>
      </div>` : ''}

      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Booking Details</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 10px;"><strong>Experience:</strong> ${experienceTitle}</li>
        <li style="margin-bottom: 10px;"><strong>Date:</strong> ${date}</li>
        <li style="margin-bottom: 10px;"><strong>Time:</strong> ${time}</li>
        <li style="margin-bottom: 10px;"><strong>Players:</strong> ${players}</li>
      </ul>

      <p style="margin-top: 15px; font-size: 14px; background: #fff8e1; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; color: #665000;">
        <strong>Merk:</strong> Du kan justere antall personer helt frem til spillet starter. Vennligst sjekk spillets makskapasitet før dere ankommer arenaen.<br/>
        <span style="font-size: 12px; opacity: 0.9;"><strong>Note:</strong> You can adjust the number of players right up until the game starts. Please check the game's maximum capacity before arriving.</span>
      </p>

      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Receipt</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 10px;"><strong>Total Price:</strong> NOK ${totalPrice}</li>
        <li style="margin-bottom: 10px;"><strong>Amount Paid (Reservation Fee):</strong> NOK ${amountPaid}</li>
        <li style="margin-bottom: 10px;"><strong>Remaining Balance Amount:</strong> NOK ${totalPrice - amountPaid} (to be paid at the venue)</li>
      </ul>

      <p style="margin-top: 40px; font-size: 14px; color: #666;">
        If you have any questions or need to make changes to your booking, please don't hesitate to reply to this email, or contact us at ${adminEmail}.
      </p>
      <p style="font-size: 14px; color: #666;">
        Best regards,<br/>Krs VR Arena
      </p>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; line-height: 1.5;">
        <strong>Krs VR Arena AS</strong><br/>
        Organisasjonsnummer: 936318878 MVA<br/>
        Kristiansand, Norge<br/>
        <a href="mailto:${adminEmail}" style="color: #9C39FF; text-decoration: none;">${adminEmail}</a>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Krs VR Arena <booking@donotreply.krsvr.no>',
      to,
      replyTo: adminEmail,
      subject: 'Booking Confirmation & Receipt - Krs VR Arena',
      html,
    });
    
    if (error) {
      console.error("Resend API returned an error:", error);
      return null;
    }
    
    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send email (exception):", error);
    return null;
  }
}

export async function sendBookingCancellationEmail(
  to: string, 
  bookingDetails: any
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Cancellation email not sent.");
    return;
  }

  const adminEmail = await getAdminEmail();
  const { firstName, lastName, date, time, experienceId, amountPaid } = bookingDetails;
  
  let experienceTitle = "VR Experience";
  if (experienceId) {
    try {
      const expRef = adminDb.collection('experiences').doc(experienceId);
      const expSnap = await expRef.get();
      if (expSnap.exists && expSnap.data()?.title) {
        experienceTitle = expSnap.data()?.title;
      }
    } catch (e) {}
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #FF3939;">Booking Kansellert / Refundert</h1>
      <p>Hei ${firstName} ${lastName},</p>
      <p>Din booking hos Krs VR Arena har blitt kansellert.</p>
      
      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Bookingdetaljer</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 10px;"><strong>Opplevelse:</strong> ${experienceTitle}</li>
        <li style="margin-bottom: 10px;"><strong>Dato:</strong> ${date}</li>
        <li style="margin-bottom: 10px;"><strong>Tid:</strong> ${time}</li>
        ${amountPaid ? `<li style="margin-bottom: 10px;"><strong>Refundert beløp (NOK):</strong> ${amountPaid}</li>` : ''}
      </ul>

      <p style="margin-top: 40px; font-size: 14px; color: #666;">
        Har du spørsmål, vennligst svar på denne e-posten eller kontakt oss på ${adminEmail}.
      </p>
      <p style="font-size: 14px; color: #666;">
        Vennlig hilsen,<br/>Krs VR Arena
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Krs VR Arena <booking@donotreply.krsvr.no>',
      to,
      replyTo: adminEmail,
      subject: 'Booking Kansellert - Krs VR Arena',
      html,
    });
    
    if (error) {
      console.error("Resend API returned an error:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    return null;
  }
}

export async function sendAdminNewBookingNotification(bookingDetails: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Admin email not sent.");
    return;
  }

  const adminEmail = await getAdminEmail();
  const { firstName, lastName, email, phone, date, time, players, totalPrice, amountPaid, experienceId } = bookingDetails;
  
  let experienceTitle = "VR Experience";
  if (experienceId) {
    try {
      const expRef = adminDb.collection('experiences').doc(experienceId);
      const expSnap = await expRef.get();
      if (expSnap.exists && expSnap.data()?.title) {
        experienceTitle = expSnap.data()?.title;
      }
    } catch (e) {}
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <h1 style="color: #9C39FF;">Ny Booking Mottatt</h1>
      <p>En ny booking har blitt gjennomført og betalt.</p>
      
      <ul style="list-style: none; padding: 0; background: #f9f9f9; padding: 15px; border-left: 4px solid #9C39FF;">
        <li style="margin-bottom: 8px;"><strong>Navn:</strong> ${firstName} ${lastName}</li>
        <li style="margin-bottom: 8px;"><strong>E-post:</strong> ${email}</li>
        <li style="margin-bottom: 8px;"><strong>Telefon:</strong> ${phone}</li>
        <li style="margin-bottom: 8px;"><strong>Opplevelse:</strong> ${experienceTitle}</li>
        <li style="margin-bottom: 8px;"><strong>Dato:</strong> ${date}</li>
        <li style="margin-bottom: 8px;"><strong>Tidspunkt:</strong> ${time}</li>
        <li style="margin-bottom: 8px;"><strong>Antall personer:</strong> ${players}</li>
        <li style="margin-bottom: 8px;"><strong>Totalpris (NOK):</strong> ${totalPrice}</li>
        <li style="margin-bottom: 8px;"><strong>Forhåndsbetalt (NOK):</strong> ${amountPaid}</li>
      </ul>
      <p>Logg inn i admin-panelet for mer informasjon.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Krs VR Arena Admin <booking@donotreply.krsvr.no>',
      to: adminEmail,
      subject: `Ny Booking: ${date} kl ${time} - ${firstName} ${lastName}`,
      html,
    });
    
    if (error) console.error("Admin resend error:", error);
    return data;
  } catch (err) {
    console.error("Failed to send admin email:", err);
  }
}


export async function addContactToNewsletter(email: string, firstName: string, lastName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Contact not added to newsletter.");
    return;
  }
  
  // Use either the env variable or the hardcoded segment ID provided by the user
  const segmentId = process.env.RESEND_SEGMENT_ID || "cd27fc2d-8077-4580-9404-9190a982020a";
  // The audience ID is kept for backward compatibility if the SDK needs it (though Segments are the new way)
  // We omit audienceId as Resend recommends using the project-level contacts and segments.
  
  try {
    const data = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      segments: [
        { id: segmentId }
      ]
    } as any); // Type cast in case of old SDK issues, but tsc proves it works.
    console.log("Contact added to Resend segment successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to add contact to newsletter:", error);
    // Don't throw so it doesn't break booking flow
  }
}
