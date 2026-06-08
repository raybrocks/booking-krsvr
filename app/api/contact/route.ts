import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured.' },
      { status: 500 }
    );
  }

  try {
    const data = await req.json();

    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }
    
    let toEmail = 'post@krsvr.no';
    try {
      const settingsDoc = await prisma.setting.findUnique({
        where: { key: 'general' }
      });
      if (settingsDoc && settingsDoc.value) {
        const settingsData = settingsDoc.value as any;
        if (settingsData && settingsData.adminEmail) {
          toEmail = settingsData.adminEmail;
        }
      }
    } catch (e) {
      console.error("Failed to fetch admin email from db in contact:", e);
    }

    let htmlContent = `<h2>Ny henvendelse fra KRS VR Arena</h2>`;
    
    htmlContent += `<p><strong>Type:</strong> ${data.formType === 'arrangement' ? 'Arrangement / Gruppbooking' : 'Annen henvendelse'}</p>`;
    htmlContent += `<p><strong>Navn:</strong> ${data.name}</p>`;
    htmlContent += `<p><strong>E-post:</strong> ${data.email}</p>`;
    htmlContent += `<p><strong>Telefon:</strong> ${data.phone}</p>`;
    
    if (data.formType === 'arrangement') {
      htmlContent += `<p><strong>Gruppe:</strong> ${data.groupType === 'privat' ? 'Privat gruppe' : 'Bedrift / organisasjon'}</p>`;
      if (data.companyName) {
        htmlContent += `<p><strong>Bedriftsnavn:</strong> ${data.companyName}</p>`;
      }
      htmlContent += `<p><strong>Type arrangement:</strong> ${data.eventType}</p>`;
      htmlContent += `<p><strong>Ønsket opplegg:</strong> ${data.packageType}</p>`;
      htmlContent += `<p><strong>Antall personer:</strong> ${data.peopleCount}</p>`;
      htmlContent += `<p><strong>Dato:</strong> ${data.date}</p>`;
      if (data.altDate) {
        htmlContent += `<p><strong>Alternativ dato:</strong> ${data.altDate}</p>`;
      }
      htmlContent += `<p><strong>Tidspunkt:</strong> ${data.time}</p>`;
      htmlContent += `<p><strong>Matønsker:</strong> ${data.food}</p>`;
    }
    
    htmlContent += `<p><strong>Melding:</strong></p><p>${data.message.replace(/\\n/g, '<br/>')}</p>`;

    const { data: resendData, error } = await resend.emails.send({
      from: 'Krs VR Arena Form <booking@donotreply.krsvr.no>',
      to: toEmail,
      replyTo: data.email,
      subject: `Ny forespørsel: ${data.formType === 'arrangement' ? data.eventType || 'Arrangement' : 'Henvendelse'} fra ${data.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: resendData }, { status: 200 });
  } catch (error) {
    console.error('Contact form exception:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
