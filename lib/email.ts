import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getAdminEmail() {
  try {
    const settingsDoc = await prisma.setting.findUnique({
      where: { key: 'general' }
    });
    if (settingsDoc && settingsDoc.value) {
      const settingsData = settingsDoc.value as any;
      if (settingsData && settingsData.adminEmail) {
        return settingsData.adminEmail;
      }
    }
  } catch (e) {
    console.error("Failed to fetch admin email", e);
  }
  return "post@krsvr.no";
}

export async function sendEmail(
  to: string, 
  bookingDetails: any,
  experienceDetails: any,
  generalSettings: any
) {
  return sendBookingConfirmationEmail(to, bookingDetails, "");
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
  const { id, manageToken, firstName, lastName, date, time, players, totalPrice, amountPaid, experienceId } = bookingDetails;
  
  const manageUrl = `https://krsvr.no/booking/manage/${id}?token=${manageToken}`;
  
  let experienceTitle = "VR Experience";
  if (experienceId) {
    try {
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) {
        experienceTitle = exp.name;
      }
    } catch (e) {
      console.error("Error fetching experience title:", e);
    }
  }

  // Basic HTML template for the email
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #9C39FF;">Bestillingsbekreftelse og Kvittering</h1>
      <p>Hei ${firstName} ${lastName},</p>
      <p>Takk for din bestilling! Din betaling er registrert.</p>
      
      ${customText ? `<div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9C39FF;">
        <p style="margin: 0;">${customText.replace(/\n/g, '<br/>')}</p>
      </div>` : ''}

      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Bestillingsdetaljer</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 10px;"><strong>Opplevelse:</strong> ${experienceTitle}</li>
        <li style="margin-bottom: 10px;"><strong>Dato:</strong> ${date}</li>
        <li style="margin-bottom: 10px;"><strong>Tidspunkt:</strong> ${time}</li>
        <li style="margin-bottom: 10px;"><strong>Antall personer:</strong> ${players}</li>
      </ul>

      <p style="margin-top: 15px; font-size: 14px; background: #fff8e1; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; color: #665000;">
        <strong>Merk:</strong> Du kan justere antall personer helt frem til spillet starter. Vennligst sjekk spillets makskapasitet før dere ankommer arenaen.<br/>
      </p>

      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Betalingskvittering</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 10px;"><strong>Totalpris:</strong> NOK ${totalPrice}</li>
        <li style="margin-bottom: 10px;"><strong>Betalt beløp (Reservasjonsgebyr/Fullt):</strong> NOK ${amountPaid}</li>
        <li style="margin-bottom: 10px;"><strong>Gjenstående beløp:</strong> NOK ${totalPrice - amountPaid} (betales ved oppmøte)</li>
      </ul>

      <div style="margin-top: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        <h3 style="font-size: 16px; margin-top: 0; margin-bottom: 15px; color: #333;">Nyttig før ankomst</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #555;">
          <strong>Slik finner du oss:</strong><br/>
          <a href="https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8" target="_blank" rel="noopener noreferrer" style="color: #9C39FF; text-decoration: none; font-weight: bold;">📍 Google Maps Veibeskrivelse</a>
        </p>
        <p style="margin: 0; font-size: 14px; color: #555;">
          <strong>Lurer du på noe?</strong><br/>
          Spørsmål rundt briller/linser, bekledning eller annet? Sjekk ut våre <a href="https://krsvr.no/faq" target="_blank" rel="noopener noreferrer" style="color: #9C39FF; text-decoration: none; font-weight: bold;">Ofte Stilte Spørsmål (FAQ)</a>.
        </p>
      </div>

      <div style="margin-top: 20px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
        <h3 style="font-size: 16px; margin-top: 0; margin-bottom: 10px; color: #333;">Endre bookingen din?</h3>
        <p style="margin: 0; font-size: 14px; color: #555;">
          Du kan selv endre tidspunkt eller spill for bookingen din inntil 48 timer før start. <br/><br/>
          <a href="${manageUrl}" style="color: #9C39FF; text-decoration: underline; font-weight: bold;">Klikk her for å administrere din booking</a>.
        </p>
      </div>

      <p style="margin-top: 40px; font-size: 14px; color: #666;">
        Har du spørsmål eller behov for å endre på din bestilling, vennligst svar på denne e-posten, eller ta kontakt med oss på ${adminEmail}.
      </p>
      <p style="font-size: 14px; color: #666;">
        Med vennlig hilsen,<br/>Krs VR Arena
      </p>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; line-height: 1.5;">
        <strong>Krs VR Arena AS</strong><br/>
        Organisasjonsnummer: 936318878 MVA<br/>
        Industrigata 12<br/>
        4632 Kristiansand, Norge<br/>
        Telefon: <a href="tel:+4740828302" style="color: #9C39FF; text-decoration: none;">+47 408 28 302</a><br/>
        <a href="mailto:${adminEmail}" style="color: #9C39FF; text-decoration: none;">${adminEmail}</a>
        
        <div style="margin-top: 15px;">
          <a href="https://www.instagram.com/krs.vr.arena" style="color: #9C39FF; text-decoration: none; margin-right: 15px;">Instagram</a>
          <a href="https://www.tiktok.com/@krs.vr.arena" style="color: #9C39FF; text-decoration: none; margin-right: 15px;">TikTok</a>
          <a href="https://www.youtube.com/@KrsVRArena" style="color: #9C39FF; text-decoration: none;">YouTube</a>
        </div>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Krs VR Arena <booking@donotreply.krsvr.no>',
      to,
      replyTo: adminEmail,
      subject: 'Bestillingsbekreftelse og Kvittering - Krs VR Arena',
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
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) {
        experienceTitle = exp.name;
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
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; line-height: 1.5;">
        <strong>Krs VR Arena AS</strong><br/>
        Organisasjonsnummer: 936318878 MVA<br/>
        Industrigata 12<br/>
        4632 Kristiansand, Norge<br/>
        Telefon: <a href="tel:+4740828302" style="color: #9C39FF; text-decoration: none;">+47 408 28 302</a><br/>
        <a href="mailto:${adminEmail}" style="color: #9C39FF; text-decoration: none;">${adminEmail}</a>
        
        <div style="margin-top: 15px;">
          <a href="https://www.instagram.com/krs.vr.arena" style="color: #9C39FF; text-decoration: none; margin-right: 15px;">Instagram</a>
          <a href="https://www.tiktok.com/@krs.vr.arena" style="color: #9C39FF; text-decoration: none; margin-right: 15px;">TikTok</a>
          <a href="https://www.youtube.com/@KrsVRArena" style="color: #9C39FF; text-decoration: none;">YouTube</a>
        </div>
      </div>
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
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) {
        experienceTitle = exp.name;
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

export async function sendAdminBookingUpdateNotification(bookingDetails: any) {
  if (!process.env.RESEND_API_KEY) return;
  const adminEmail = await getAdminEmail();
  const { firstName, lastName, email, date, time } = bookingDetails;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <h1 style="color: #9C39FF;">Booking Endret av Kunde</h1>
      <p>Kunden <strong>${firstName} ${lastName}</strong> (${email}) har endret bookingen sin via selvkansellerings-portalen.</p>
      <p>Nytt tidspunkt er <strong>${date} kl ${time}</strong>.</p>
      <p>Logg inn i admin-panelet for mer informasjon.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Krs VR Arena Admin <booking@donotreply.krsvr.no>',
      to: adminEmail,
      subject: `Kunde endret booking: ${firstName} ${lastName}`,
      html,
    });
  } catch (err) {}
}

export async function sendAdminBookingCancellationNotification(bookingDetails: any) {
  if (!process.env.RESEND_API_KEY) return;
  const adminEmail = await getAdminEmail();
  const { firstName, lastName, email, date, time } = bookingDetails;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <h1 style="color: #ff4444;">Booking Kansellert av Kunde</h1>
      <p>Kunden <strong>${firstName} ${lastName}</strong> (${email}) har kansellert bookingen sin via selvkansellerings-portalen.</p>
      <p>Dette gjaldt bookingen for <strong>${date} kl ${time}</strong>.</p>
      <p>Eventuelt reservasjonsgebyr er <strong>ikke</strong> refundert automatisk. Logg inn i admin-panelet for å behandle eventuell refusjon via Vipps-knappen.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Krs VR Arena Admin <booking@donotreply.krsvr.no>',
      to: adminEmail,
      subject: `Kunde KANSELLERT booking: ${firstName} ${lastName}`,
      html,
    });
  } catch (err) {}
}

export async function sendWeeklyAdminSummary(
  to: string,
  weeklyStats: { totalRevenue: number, vippsRevenue: number, manualRevenue: number, numExperiences: number },
  upcomingBookings: any[]
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Weekly summary email not sent.");
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <h1 style="color: #9C39FF;">Ukentlig Oppsummering & Vaktliste</h1>
      <p>Her er en oversikt over uken som gikk, og uken som kommer.</p>
      
      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Uken som gikk</h2>
      <ul style="list-style: none; padding: 0; background: #f9f9f9; padding: 15px; border-left: 4px solid #9C39FF;">
        <li style="margin-bottom: 8px;"><strong>Total omsetning:</strong> NOK ${weeklyStats.totalRevenue}</li>
        <li style="margin-bottom: 8px;"><strong>Hvorav Vipps:</strong> NOK ${weeklyStats.vippsRevenue}</li>
        <li style="margin-bottom: 8px;"><strong>Hvorav Manuelle bookinger:</strong> NOK ${weeklyStats.manualRevenue}</li>
        <li style="margin-bottom: 8px;"><strong>Antall bookinger:</strong> ${weeklyStats.numExperiences}</li>
      </ul>

      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Uken som kommer (Neste 7 dager)</h2>
      ${upcomingBookings.length === 0 ? '<p>Ingen bookinger registrert for neste uke enda.</p>' : ''}
      ${upcomingBookings.map(b => `
        <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
          <p style="margin: 0 0 5px 0;"><strong>Dato:</strong> ${b.date} kl ${b.time}</p>
          <p style="margin: 0 0 5px 0;"><strong>Navn:</strong> ${b.firstName} ${b.lastName} (${b.players} pers)</p>
          <p style="margin: 0 0 5px 0;"><strong>Opplevelse:</strong> ${b.experience?.name || 'Ukjent'} (${b.duration} min)</p>
          ${b.paymentType === 'manual' ? '<p style="margin: 0; color: #d97706; font-size: 12px;"><strong>Manuell Booking</strong></p>' : ''}
          ${b.paymentType === 'vipps' ? '<p style="margin: 0; color: #9C39FF; font-size: 12px;"><strong>Vipps Booking</strong></p>' : ''}
          ${b.internalNotes ? `<div style="margin-top: 10px; padding: 10px; background-color: #fff9c4; border-left: 3px solid #fbc02d; font-size: 13px;"><strong style="color: #f57f17">Notat/Kommentar:</strong><br/>${b.internalNotes}</div>` : ''}
        </div>
      `).join('')}

      <p style="margin-top: 40px; font-size: 12px; color: #999;">Dette er en automatisk generert ukentlig oppsummering fra Krs VR Arena systemet.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Krs VR Arena Admin <booking@donotreply.krsvr.no>',
      to,
      subject: `Ukentlig Oppsummering & Vaktliste`,
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
  
  const segmentId = process.env.RESEND_SEGMENT_ID || "cd27fc2d-8077-4580-9404-9190a982020a";
  
  try {
    const data = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      segments: [
        { id: segmentId }
      ]
    } as any); 
    console.log("Contact added to Resend segment successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to add contact to newsletter:", error);
  }
}
