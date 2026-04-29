import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmationEmail(
  to: string, 
  bookingDetails: any,
  customText: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return;
  }

  const { firstName, lastName, date, time, players, totalPrice, amountPaid } = bookingDetails;
  
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
        <li style="margin-bottom: 10px;"><strong>Date:</strong> ${date}</li>
        <li style="margin-bottom: 10px;"><strong>Time:</strong> ${time}</li>
        <li style="margin-bottom: 10px;"><strong>Players:</strong> ${players}</li>
      </ul>

      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Receipt</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 10px;"><strong>Total Price:</strong> NOK ${totalPrice}</li>
        <li style="margin-bottom: 10px;"><strong>Amount Paid (Reservation Fee):</strong> NOK ${amountPaid}</li>
        <li style="margin-bottom: 10px;"><strong>Remaining Balance Amount:</strong> NOK ${totalPrice - amountPaid} (to be paid at the venue)</li>
      </ul>

      <p style="margin-top: 40px; font-size: 14px; color: #666;">
        If you have any questions or need to make changes to your booking, please don't hesitate to contact us.
      </p>
      <p style="font-size: 14px; color: #666;">
        Best regards,<br/>Krs Urban
      </p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Krs Urban <booking@krsurban.no>', // Configure a verified domain in Resend
      to,
      subject: 'Booking Confirmation & Receipt - Krs Urban',
      html,
    });
    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
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
