import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { name, email, phone, company, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Krs VR Arena Form <booking@donotreply.krsvr.no>',
      to: 'post@krsvr.no',
      replyTo: email,
      subject: `Ny melding fra kontaktskjema: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #9C39FF;">Ny henvendelse fra nettsiden</h2>
          <p>Du har mottatt en ny melding fra kontaktskjemaet på krsvr.no.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Navn:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>E-post:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 0 0 10px 0;"><strong>Telefon:</strong> ${phone || 'Ikke oppgitt'}</p>
            <p style="margin: 0 0 10px 0;"><strong>Bedrift:</strong> ${company || 'Ikke oppgitt'}</p>
          </div>
          
          <h3 style="font-size: 16px; margin-top: 20px;">Melding:</h3>
          <div style="background: #fff; padding: 15px; border-left: 4px solid #9C39FF; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Contact form exception:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
