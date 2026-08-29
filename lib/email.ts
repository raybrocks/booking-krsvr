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

export async function sendRefundReceiptEmail(
  to: string, 
  details: {
    booking: any;
    refundAmount: number;
    receiptId: string;
  }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Refund receipt email not sent.");
    return;
  }

  const adminEmail = await getAdminEmail();
  const { booking, refundAmount, receiptId } = details;
  const { firstName, lastName, date, time, experienceId } = booking;
  
  let experienceTitle = "VR Opplevelse";
  if (experienceId) {
    try {
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) {
        experienceTitle = exp.name;
      }
    } catch (e) {}
  }

  const vatRate = 0.25;
  const refundExVat = refundAmount / (1 + vatRate);
  const vatAmount = refundAmount - refundExVat;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
        <h1 style="color: #9C39FF; margin-bottom: 5px; font-size: 24px;">Krs VR Arena AS</h1>
        <p style="margin: 0; font-size: 13px; color: #777;">Org.nr: 936318878 MVA | Kristiansand, Norge</p>
      </div>

      <div style="padding: 25px 0;">
        <div style="background-color: #f3e8ff; border-left: 4px solid #9C39FF; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <h2 style="color: #6b21a8; margin: 0 0 5px 0; font-size: 18px;">Kreditnota / Refusjonskvittering</h2>
          <p style="margin: 0; font-size: 14px; color: #581c87;">
            Hei ${firstName} ${lastName}, din betaling har blitt refundert via Vipps.
          </p>
        </div>

        <h3 style="font-size: 16px; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 8px; color: #222;">
          Refusjonsdetaljer
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Kvitteringsnummer:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; font-family: monospace;">${receiptId.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Dato for refusjon:</td>
            <td style="padding: 8px 0; text-align: right;">${new Intl.DateTimeFormat("no-NO", { dateStyle: "long" }).format(new Date())}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Opplevelse:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${experienceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Opprinnelig booking:</td>
            <td style="padding: 8px 0; text-align: right;">${date} kl. ${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Utbetalingsmetode:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #ff5b24;">Vipps</td>
          </tr>
          <tr style="border-top: 2px solid #eee; font-size: 16px;">
            <td style="padding: 12px 0; font-weight: bold;">Refundert beløp:</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right; color: #16a34a;">NOK ${refundAmount.toFixed(2)}</td>
          </tr>
        </table>

        <div style="background-color: #fafafa; border: 1px solid #eee; border-radius: 6px; padding: 12px 15px; margin-bottom: 25px; font-size: 12px; color: #666;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>MVA-grunnlag (Netto):</span>
            <span>NOK ${refundExVat.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>MVA (25%):</span>
            <span>NOK ${vatAmount.toFixed(2)}</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #666; margin: 20px 0;">
          💡 <em>Beløpet er tilbakeført via Vipps og vil være synlig på kontoen eller kortet du betalte med i løpet av kort tid (normalt 1–3 virkedager avhengig av din bank).</em>
        </p>

        <p style="font-size: 14px; color: #444; margin-top: 30px;">
          Har du spørsmål vedrørende refusjonen, kan du svare direkte på denne e-posten eller kontakte oss på <a href="mailto:${adminEmail}" style="color: #9C39FF;">${adminEmail}</a>.
        </p>
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #999;">
        <p style="margin: 0 0 5px 0;"><strong>Krs VR Arena AS</strong> | Industrigata 12, 4632 Kristiansand</p>
        <p style="margin: 0;">Tlf: <a href="tel:+4740828302" style="color: #999; text-decoration: none;">+47 408 28 302</a> | <a href="https://krsvr.no" style="color: #9C39FF; text-decoration: none;">krsvr.no</a></p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Krs VR Arena <booking@donotreply.krsvr.no>',
      to,
      replyTo: adminEmail,
      subject: `Refusjonskvittering: NOK ${refundAmount} - Krs VR Arena`,
      html,
    });
    
    if (error) {
      console.error("Resend error on refund email:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Failed to send refund email:", error);
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

export interface WeeklySummaryReportData {
  pastWeek: {
    periodLabel: string;
    completedBookingsCount: number;
    totalPlayers: number;
    avgGroupSize: number | string;
    vippsPaid: number;
    expectedCash: number;
    totalEstimatedRevenue: number;
    cancelledCount: number;
    popularExperiences: { name: string; count: number }[];
  };
  upcomingWeek: {
    periodLabel: string;
    bookingCount: number;
    totalPlayers: number;
    vippsPaid: number;
    expectedCash: number;
    totalEstimatedRevenue: number;
    bookings: Array<{
      id?: string;
      dateNice: string;
      time: string;
      duration?: number;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      players: number;
      experienceName: string;
      totalPrice: number;
      amountPaid: number;
      remainingCash: number;
      paymentType: string;
      internalNotes?: string;
      companyName?: string;
      bookingType?: string;
    }>;
  };
}

export async function sendWeeklyAdminSummary(
  to: string,
  reportData: WeeklySummaryReportData
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Weekly summary email not sent.");
    return;
  }

  const recipient = to || (await getAdminEmail());
  const { pastWeek, upcomingWeek } = reportData;

  const html = `
    <!DOCTYPE html>
    <html lang="no">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ukentlig Oppsummering & Vaktgrunnlag</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 640px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e4e4e7;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 32px 28px; text-align: center; border-bottom: 3px solid #9C39FF;">
          <div style="display: inline-block; background-color: #ffffff; color: #09090b; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
            KRS VR Arena
          </div>
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.02em;">
            Ukentlig Oppsummering & Vaktgrunnlag
          </h1>
          <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 13px;">
            ${pastWeek.periodLabel} (forrige uke) & oversikt for de neste 7 dagene
          </p>
        </div>

        <!-- Innhold -->
        <div style="padding: 28px 24px;">

          <!-- Seksjon 1: Uken som gikk -->
          <div style="margin-bottom: 32px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid #f4f4f5; padding-bottom: 8px;">
              <h2 style="margin: 0; font-size: 17px; font-weight: 700; color: #09090b;">
                📊 Uken som gikk (${pastWeek.periodLabel})
              </h2>
            </div>

            <!-- Nøkkeltall Grid -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 16px;">
              <tr>
                <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #065f46; letter-spacing: 0.05em; margin-bottom: 4px;">
                    💳 Innbetalt (Vipps)
                  </div>
                  <div style="font-size: 20px; font-weight: 800; color: #047857;">
                    ${pastWeek.vippsPaid.toLocaleString('nb-NO')} NOK
                  </div>
                  <div style="font-size: 11px; color: #065f46; margin-top: 2px;">
                    Garantert innbetalt i systemet
                  </div>
                </td>
                <td style="width: 50%; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e; letter-spacing: 0.05em; margin-bottom: 4px;">
                    🏢 Forventet kasse (Rest)
                  </div>
                  <div style="font-size: 20px; font-weight: 800; color: #b45309;">
                    ${pastWeek.expectedCash.toLocaleString('nb-NO')} NOK
                  </div>
                  <div style="font-size: 11px; color: #92400e; margin-top: 2px;">
                    Estimert restbeløp ved oppmøte
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 10px; padding: 14px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #52525b; letter-spacing: 0.05em; margin-bottom: 4px;">
                    💰 Estimert Totalomsetning
                  </div>
                  <div style="font-size: 18px; font-weight: 700; color: #18181b;">
                    ${pastWeek.totalEstimatedRevenue.toLocaleString('nb-NO')} NOK
                  </div>
                  <div style="font-size: 11px; color: #71717a; margin-top: 2px;">
                    Forhåndsbetalt + forventet kasse
                  </div>
                </td>
                <td style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 10px; padding: 14px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #52525b; letter-spacing: 0.05em; margin-bottom: 4px;">
                    👥 Gjennomførte Bookinger
                  </div>
                  <div style="font-size: 18px; font-weight: 700; color: #18181b;">
                    ${pastWeek.completedBookingsCount} (${pastWeek.totalPlayers} spillere)
                  </div>
                  <div style="font-size: 11px; color: #71717a; margin-top: 2px;">
                    Snitt ${pastWeek.avgGroupSize} pers per booking
                  </div>
                </td>
              </tr>
            </table>

            <!-- Tilleggsdetaljer for uken -->
            <div style="background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px; font-size: 13px; color: #3f3f46;">
              ${pastWeek.popularExperiences.length > 0 ? `
                <div style="margin-bottom: 6px;">
                  <strong>🎮 Mest populære opplevelser:</strong> ${pastWeek.popularExperiences.map(e => `${e.name} (${e.count})`).join(', ')}
                </div>
              ` : ''}
              <div>
                <strong>❌ Kanselleringer denne uken:</strong> ${pastWeek.cancelledCount} booking(er)
              </div>
            </div>

            <!-- Disclaimer boks -->
            <div style="background-color: #f8fafc; border-left: 3px solid #64748b; padding: 10px 14px; border-radius: 6px; font-size: 12px; color: #64748b; line-height: 1.5;">
              <strong>💡 Viktig merknad om kassetall:</strong> Bookingsystemet kjenner det nøyaktige forhåndsbetalte Vipps-beløpet. Restbeløpet i kassen er et estimat basert på opprinnelig bestilt antall spillere. Faktisk innkrevd beløp på kortterminal/Zettle i arenaen kan variere dersom kunden møtte opp med flere eller færre deltakere, eller la til kiosksalg.
            </div>
          </div>

          <!-- Seksjon 2: Uken som kommer (Vaktgrunnlag) -->
          <div style="margin-bottom: 32px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 2px solid #f4f4f5; padding-bottom: 8px;">
              <h2 style="margin: 0; font-size: 17px; font-weight: 700; color: #09090b;">
                📅 Uken som kommer (${upcomingWeek.periodLabel})
              </h2>
            </div>

            <!-- Prognose header -->
            <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 1px solid #ddd6fe; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px;">
              <div style="font-size: 14px; font-weight: 700; color: #5b21b6; margin-bottom: 4px;">
                Prognose for neste 7 dager:
              </div>
              <div style="font-size: 13px; color: #6d28d9; line-height: 1.5;">
                • <strong>${upcomingWeek.bookingCount}</strong> registrerte bookinger (<strong>${upcomingWeek.totalPlayers}</strong> forventede spillere)<br>
                • <strong>${upcomingWeek.vippsPaid.toLocaleString('nb-NO')} NOK</strong> allerede forhåndsbetalt via Vipps<br>
                • <strong>${upcomingWeek.expectedCash.toLocaleString('nb-NO')} NOK</strong> forventes krevd inn i kassen ved oppmøte
              </div>
            </div>

            <!-- Liste over kommende bookinger -->
            ${upcomingWeek.bookings.length === 0 ? `
              <div style="padding: 24px; text-align: center; background-color: #fafafa; border: 1px dashed #e4e4e7; border-radius: 10px; color: #71717a; font-size: 14px;">
                Ingen bookinger registrert for de neste 7 dagene enda.
              </div>
            ` : upcomingWeek.bookings.map(b => `
              <div style="background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <div style="font-size: 14px; font-weight: 700; color: #09090b;">
                    🕒 ${b.dateNice} kl ${b.time} <span style="font-size: 12px; font-weight: 500; color: #71717a;">(${b.duration || 90} min)</span>
                  </div>
                  <div>
                    ${b.remainingCash > 0 ? `
                      <span style="background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                        KREV INN: ${b.remainingCash} NOK
                      </span>
                    ` : `
                      <span style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                        FULLT OPPGJORT
                      </span>
                    `}
                  </div>
                </div>

                <div style="font-size: 13px; color: #27272a; margin-bottom: 4px;">
                  <strong>🎮 ${b.experienceName}</strong> • ${b.players} spillere
                </div>

                <div style="font-size: 12px; color: #52525b; margin-bottom: 6px;">
                  👤 ${b.companyName ? `<strong>${b.companyName}</strong> (${b.firstName} ${b.lastName})` : `<strong>${b.firstName} ${b.lastName}</strong>`} • 📞 ${b.phone} • ✉️ ${b.email}
                </div>

                <div style="font-size: 12px; color: #71717a;">
                  Totalt: ${b.totalPrice} NOK • Innbetalt Vipps: ${b.amountPaid} NOK
                </div>

                ${b.internalNotes ? `
                  <div style="margin-top: 8px; padding: 8px 12px; background-color: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 12px; color: #92400e;">
                    <strong>Notat/Kommentar:</strong> ${b.internalNotes}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Handling: Knapp til admin -->
          <div style="text-align: center; margin: 32px 0 16px 0;">
            <a href="https://krsvr.no/admin" style="display: inline-block; background-color: #9C39FF; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(156, 57, 255, 0.25);">
              Åpne Admin Dashboard →
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 20px 24px; text-align: center; border-top: 1px solid #e4e4e7; font-size: 12px; color: #71717a; line-height: 1.5;">
          <strong>KRS VR Arena</strong> • Skippergata 24, 4611 Kristiansand<br>
          E-post: <a href="mailto:post@krsvr.no" style="color: #9C39FF; text-decoration: none;">post@krsvr.no</a> • Tlf: 919 09 460<br>
          <span style="font-size: 11px; color: #a1a1aa; display: inline-block; margin-top: 8px;">
            Generert automatisk via Vercel Cron hver søndag kl 07:00.
          </span>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Krs VR Arena Admin <booking@donotreply.krsvr.no>',
      to: recipient,
      subject: `Ukentlig Oppsummering & Vaktgrunnlag (${pastWeek.periodLabel})`,
      html,
    });

    if (error) console.error("Admin resend error in weekly summary:", error);
    return data;
  } catch (err) {
    console.error("Failed to send admin weekly summary email:", err);
  }
}

export async function sendEmployeeInviteEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return;
  }

  const encodedEmail = encodeURIComponent(to);
  const loginUrl = `https://krsvr.no/admin?email=${encodedEmail}&register=true`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #9C39FF;">Velkommen til Krs VR Arena, ${name}!</h1>
      <p>Du har blitt lagt til som ansatt i vårt system.</p>
      <p>Før du kan logge inn, må du opprette en bruker med denne e-postadressen (<strong>${to}</strong>).</p>
      
      <div style="margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #9C39FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Gå til Admin-panelet for å registrere deg
        </a>
      </div>

      <p style="font-size: 14px; color: #555;">
        <strong>Slik gjør du det:</strong><br>
        1. Trykk på knappen over for å gå til admin-panelet.<br>
        2. Trykk på <em>"Ny ansatt? Registrer deg her"</em> nederst på skjermen.<br>
        3. Skriv inn denne e-posten og lag deg et passord.<br>
        4. Logg inn med den nye brukeren din!
      </p>

      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999;">
        Dette er en automatisk generert e-post fra Krs VR Arena systemet.<br>
        Dersom dette er en feil, kan du se bort fra denne e-posten.
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Krs VR Arena <booking@donotreply.krsvr.no>',
      to: to,
      subject: 'Invitasjon til Krs VR Arena Admin',
      html,
    });
    if (error) console.error("Resend employee invite error:", error);
  } catch (err) {
    console.error("Failed to send employee invite email:", err);
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
