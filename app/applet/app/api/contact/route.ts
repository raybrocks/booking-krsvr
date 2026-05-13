import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Default to a dummy key if env var is missing during build
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email would have been sent:", data);
      // Faking success response for development if API key is missing
      return NextResponse.json({ success: true, fake: true });
    }

    let htmlContent = `<h2>Ny henvendelse fra KRS VR Arena</h2>`;
    
    htmlContent += `<p><strong>Type:</strong> ${data.formType === 'arrangement' ? 'Arrangement / Gruppebooking' : 'Annen henvendelse'}</p>`;
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

    const result = await resend.emails.send({
      from: 'KRS VR Arena <onboarding@resend.dev>', 
      to: ['post@krsvr.no'],
      subject: `Ny forespørsel: ${data.formType === 'arrangement' ? data.eventType || 'Arrangement' : 'Henvendelse'} fra ${data.name}`,
      replyTo: data.email,
      html: htmlContent,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
