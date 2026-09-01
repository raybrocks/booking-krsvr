import React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { prisma } from './prisma';
import { BookingConfirmationEmail } from '@/components/emails/BookingConfirmationEmail';
import { NameListReminderEmail } from '@/components/emails/NameListReminderEmail';
import { BookingCancellationEmail } from '@/components/emails/BookingCancellationEmail';
import { RefundReceiptEmail } from '@/components/emails/RefundReceiptEmail';
import { AdminNewBookingEmail } from '@/components/emails/AdminNewBookingEmail';
import { AdminBookingUpdateEmail } from '@/components/emails/AdminBookingUpdateEmail';
import { AdminBookingCancellationEmail } from '@/components/emails/AdminBookingCancellationEmail';
import { EmployeeInviteEmail } from '@/components/emails/EmployeeInviteEmail';

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
  _experienceDetails: any,
  _generalSettings: any
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
    return null;
  }

  const adminEmail = await getAdminEmail();
  let { id, manageToken, firstName, lastName, date, time, players, totalPrice, amountPaid, experienceId } = bookingDetails;
  
  if (!manageToken && id) {
    const crypto = await import('crypto');
    manageToken = crypto.randomBytes(32).toString('hex');
    try {
      await prisma.booking.update({
        where: { id },
        data: { manageToken }
      });
    } catch (e) {
      console.error("Failed to set manageToken on booking:", e);
    }
  }

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

  try {
    const html = await render(
      React.createElement(BookingConfirmationEmail, {
        firstName,
        lastName,
        experienceTitle,
        date,
        time,
        players: Number(players) || 1,
        totalPrice: Number(totalPrice) || 0,
        amountPaid: Number(amountPaid) || 0,
        manageUrl,
        customText,
        adminEmail,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'KRS VR Arena <booking@donotreply.krsvr.no>',
      to,
      replyTo: adminEmail,
      subject: 'Bestillingsbekreftelse og kvittering - KRS VR Arena',
      html,
    });
    
    if (error) {
      console.error("Resend API returned an error:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    return null;
  }
}

export async function sendNameListDailyReminderEmail(bookingDetails: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Reminder email not sent.");
    return null;
  }

  const adminEmail = await getAdminEmail();
  let { id, manageToken, firstName, lastName, date, time, players, email, experienceId } = bookingDetails;
  
  if (!manageToken && id) {
    const crypto = await import('crypto');
    manageToken = crypto.randomBytes(32).toString('hex');
    try {
      await prisma.booking.update({
        where: { id },
        data: { manageToken }
      });
    } catch (e) {
      console.error("Failed to set manageToken on booking in reminder:", e);
    }
  }

  const manageUrl = `https://krsvr.no/booking/manage/${id}?token=${manageToken}`;
  
  let experienceTitle = "VR Experience";
  if (experienceId) {
    try {
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) {
        experienceTitle = exp.name;
      }
    } catch (e) {}
  }

  try {
    const html = await render(
      React.createElement(NameListReminderEmail, {
        firstName,
        lastName,
        experienceTitle,
        date,
        time,
        players: Number(players) || 1,
        manageUrl,
        adminEmail,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'KRS VR Arena <booking@donotreply.krsvr.no>',
      to: email,
      replyTo: adminEmail,
      subject: `Påminnelse: Vi trenger navneliste til deres opplevelse den ${date} kl. ${time}`,
      html,
    });
    
    if (error) {
      console.error("Resend reminder error:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    return null;
  }
}

export async function sendBookingCancellationEmail(
  to: string,
  bookingDetails: any,
  amountRefunded?: number
) {
  if (!process.env.RESEND_API_KEY) return null;
  const adminEmail = await getAdminEmail();
  const { firstName, lastName, date, time, experienceId } = bookingDetails;

  let experienceTitle = "VR Experience";
  if (experienceId) {
    try {
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) experienceTitle = exp.name;
    } catch (e) {}
  }

  try {
    const html = await render(
      React.createElement(BookingCancellationEmail, {
        firstName,
        lastName,
        experienceTitle,
        date,
        time,
        amountRefunded,
        adminEmail,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'KRS VR Arena <booking@donotreply.krsvr.no>',
      to,
      replyTo: adminEmail,
      subject: 'Kansellering av booking - KRS VR Arena',
      html,
    });
    
    if (error) console.error("Resend cancellation error:", error);
    return data;
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
    return null;
  }
}

export async function sendRefundReceiptEmail(
  to: string,
  refundDetails: any
) {
  if (!process.env.RESEND_API_KEY) return null;
  const adminEmail = await getAdminEmail();
  const { booking, refundAmount, receiptId, firstName, lastName, paymentRef, date, time } = refundDetails;

  const fName = firstName || booking?.firstName || 'Kunde';
  const lName = lastName || booking?.lastName || '';
  const d = date || booking?.date || '';
  const t = time || booking?.time || '';
  const ref = paymentRef || receiptId || booking?.paymentId || 'Vipps Refusjon';
  const amount = Number(refundAmount) || 0;

  try {
    const html = await render(
      React.createElement(RefundReceiptEmail, {
        firstName: fName,
        lastName: lName,
        refundAmount: amount,
        paymentRef: ref,
        date: d,
        time: t,
        adminEmail,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'KRS VR Arena <booking@donotreply.krsvr.no>',
      to,
      replyTo: adminEmail,
      subject: `Kvittering for refusjon - KRS VR Arena`,
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
  if (!process.env.RESEND_API_KEY) return null;
  const adminEmail = await getAdminEmail();
  const { firstName, lastName, email, phone, date, time, players, totalPrice, amountPaid, bookingType, companyName, internalNotes, experienceId } = bookingDetails;
  
  let experienceTitle = "VR Experience";
  if (experienceId) {
    try {
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) experienceTitle = exp.name;
    } catch (e) {}
  }

  try {
    const html = await render(
      React.createElement(AdminNewBookingEmail, {
        firstName,
        lastName,
        email,
        phone,
        experienceTitle,
        date,
        time,
        players: Number(players) || 1,
        totalPrice: Number(totalPrice) || 0,
        amountPaid: Number(amountPaid) || 0,
        bookingType,
        companyName,
        internalNotes,
        adminEmail,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'KRS VR Arena Admin <booking@donotreply.krsvr.no>',
      to: adminEmail,
      subject: `Ny booking registrert: ${date} kl ${time} - ${firstName} ${lastName}`,
      html,
    });
    
    if (error) console.error("Admin resend error:", error);
    return data;
  } catch (err) {
    console.error("Failed to send admin email:", err);
    return null;
  }
}

export async function sendAdminBookingUpdateNotification(bookingDetails: any) {
  if (!process.env.RESEND_API_KEY) return null;
  const adminEmail = await getAdminEmail();
  const { firstName, lastName, email, date, time, players, experienceId } = bookingDetails;
  
  let experienceTitle: string | undefined;
  if (experienceId) {
    try {
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) experienceTitle = exp.name;
    } catch (e) {}
  }

  try {
    const html = await render(
      React.createElement(AdminBookingUpdateEmail, {
        firstName,
        lastName,
        email,
        date,
        time,
        players: players ? Number(players) : undefined,
        experienceTitle,
        adminEmail,
      })
    );

    await resend.emails.send({
      from: 'KRS VR Arena Admin <booking@donotreply.krsvr.no>',
      to: adminEmail,
      subject: `Booking endret av kunde: ${firstName} ${lastName}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send admin update email:", err);
  }
}

export async function sendAdminBookingCancellationNotification(bookingDetails: any) {
  if (!process.env.RESEND_API_KEY) return null;
  const adminEmail = await getAdminEmail();
  const { firstName, lastName, email, date, time, amountPaid, experienceId } = bookingDetails;
  
  let experienceTitle: string | undefined;
  if (experienceId) {
    try {
      const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
      if (exp && exp.name) experienceTitle = exp.name;
    } catch (e) {}
  }

  try {
    const html = await render(
      React.createElement(AdminBookingCancellationEmail, {
        firstName,
        lastName,
        email,
        date,
        time,
        experienceTitle,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
        adminEmail,
      })
    );

    await resend.emails.send({
      from: 'KRS VR Arena Admin <booking@donotreply.krsvr.no>',
      to: adminEmail,
      subject: `Booking kansellert av kunde: ${firstName} ${lastName}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send admin cancellation email:", err);
  }
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
      bookingType: string;
      paymentType: string;
      totalPrice: number;
      amountPaid: number;
      staffName?: string;
      staffId?: string;
    }>;
  };
}

export async function sendWeeklyAdminSummary(
  firstArg: string | WeeklySummaryReportData,
  secondArg?: WeeklySummaryReportData | string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Weekly summary email not sent.");
    return null;
  }

  let reportData: WeeklySummaryReportData;
  let recipientOverride: string | undefined;

  if (typeof firstArg === 'string') {
    recipientOverride = firstArg || undefined;
    reportData = secondArg as WeeklySummaryReportData;
  } else {
    reportData = firstArg;
    recipientOverride = secondArg as string | undefined;
  }

  const adminEmail = await getAdminEmail();
  const recipient = recipientOverride || adminEmail;
  const { pastWeek, upcomingWeek } = reportData;

  const experienceListHtml = (pastWeek.popularExperiences || [])
    .map(exp => `<li style="margin-bottom: 4px; color: #374151;">${exp.name}: <strong>${exp.count} stk</strong></li>`)
    .join('');

  const upcomingRowsHtml = (upcomingWeek.bookings || [])
    .map((b) => `
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
        <div style="font-weight: 600; font-size: 14px; color: #111827;">
          ${b.dateNice} kl. ${b.time} &bull; ${b.experienceName}
        </div>
        <div style="font-size: 13px; color: #4b5563; margin-top: 4px;">
          ${b.firstName} ${b.lastName} (${b.players} pers) &bull; ${b.phone} &bull; <span style="color: #7c3aed;">${b.paymentType}</span>
        </div>
      </div>
    `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="no">
    <head><meta charset="utf-8"/></head>
    <body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px 12px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f0f0f2;">
          <img src="https://krsvr.no/logo.svg" alt="KRS VR ARENA" width="140" style="display: block; max-width: 140px; height: auto;" />
        </div>
        <div style="padding: 32px; color: #1f2937;">
          <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px 0;">Ukentlig oppsummering og vaktplan</h1>
          <p style="font-size: 14px; line-height: 1.5; color: #374151;">Her er oppsummeringen for perioden ${pastWeek.periodLabel} og planlagte bookinger for neste uke.</p>
          
          <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 24px 0 8px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">Forrige uke (${pastWeek.periodLabel})</h2>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; font-size: 13.5px; color: #374151;">
            <p style="margin: 4px 0;"><strong>Gjennomførte bookinger:</strong> ${pastWeek.completedBookingsCount} (${pastWeek.totalPlayers} spillere)</p>
            <p style="margin: 4px 0;"><strong>Estimert totalomsetning:</strong> NOK ${pastWeek.totalEstimatedRevenue.toLocaleString('no-NO')}</p>
            <p style="margin: 4px 0;"><strong>Hvorav Vipps / Forhåndsbetalt:</strong> NOK ${pastWeek.vippsPaid.toLocaleString('no-NO')}</p>
            <p style="margin: 4px 0;"><strong>Hvorav Forventet oppmøte/faktura:</strong> NOK ${pastWeek.expectedCash.toLocaleString('no-NO')}</p>
          </div>

          ${experienceListHtml ? `
            <p style="font-size: 13px; font-weight: 600; margin: 12px 0 6px 0; color: #374151;">Mest spilte opplevelser:</p>
            <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px;">${experienceListHtml}</ul>
          ` : ''}

          <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 24px 0 8px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">Kommende uke (${upcomingWeek.periodLabel})</h2>
          <p style="font-size: 13.5px; color: #4b5563; margin-bottom: 12px;"><strong>${upcomingWeek.bookingCount} bookinger</strong> planlagt (${upcomingWeek.totalPlayers} spillere).</p>
          ${upcomingRowsHtml || '<p style="font-size: 13px; color: #9ca3af; font-style: italic;">Ingen bookinger registrert for kommende uke enda.</p>'}

          <div style="text-align: center; margin-top: 28px;">
            <a href="https://krsvr.no/admin" style="background: #7c3aed; color: #ffffff; padding: 11px 22px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">Åpne Admin Dashboard &rarr;</a>
          </div>
        </div>
        <div style="background-color: #fafbfc; padding: 20px 24px; text-align: center; border-top: 1px solid #f1f2f4; font-size: 12px; color: #6b7280;">
          <strong>Krs VR Arena AS</strong> &bull; Industrigata 12, 4632 Kristiansand &bull; <a href="mailto:post@krsvr.no" style="color: #7c3aed;">post@krsvr.no</a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'KRS VR Arena Admin <booking@donotreply.krsvr.no>',
      to: recipient,
      subject: `Ukentlig oppsummering og vaktplan (${pastWeek.periodLabel})`,
      html,
    });

    if (error) console.error("Admin resend error in weekly summary:", error);
    return data;
  } catch (err) {
    console.error("Failed to send admin weekly summary email:", err);
    return null;
  }
}

export async function sendEmployeeInviteEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return null;
  }

  const encodedEmail = encodeURIComponent(to);
  const inviteUrl = `https://krsvr.no/admin?email=${encodedEmail}&register=true`;
  const adminEmail = await getAdminEmail();

  try {
    const html = await render(
      React.createElement(EmployeeInviteEmail, {
        name,
        inviteUrl,
        adminEmail,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'KRS VR Arena <booking@donotreply.krsvr.no>',
      to,
      replyTo: adminEmail,
      subject: 'Du har blitt invitert som ansatt hos KRS VR Arena',
      html,
    });
    if (error) console.error("Resend employee invite error:", error);
    return data;
  } catch (err) {
    console.error("Failed to send employee invite email:", err);
    return null;
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
