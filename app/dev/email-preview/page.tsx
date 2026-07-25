"use client";

import React, { useState } from 'react';

export default function EmailPreviewPage() {
  const [activeTab, setActiveTab] = useState<'confirmation' | 'cancellation' | 'adminNew' | 'adminUpdate' | 'adminCancel' | 'weekly'>('confirmation');

  // Dummy data
  const firstName = "Ola";
  const lastName = "Nordmann";
  const date = "12. august 2026";
  const time = "18:00";
  const players = 6;
  const totalPrice = 2400;
  const amountPaid = 2400;
  const experienceTitle = "Mixed Reality Shooter (90 min)";
  const adminEmail = "post@krsvr.no";
  const manageUrl = "#";
  const customText = "Velkommen til en fantastisk opplevelse hos oss!";
  const phone = "+47 408 28 302";
  const email = "ola.nordmann@example.com";

  // Footers
  const commonFooter = `
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
  `;

  const templates = {
    confirmation: `
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
      ${commonFooter}
    </div>
    `,
    cancellation: `
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
      ${commonFooter}
    </div>
    `,
    adminNew: `
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
    `,
    adminUpdate: `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <h1 style="color: #9C39FF;">Booking Endret av Kunde</h1>
      <p>Kunden <strong>${firstName} ${lastName}</strong> (${email}) har endret bookingen sin via selvkansellerings-portalen.</p>
      <p>Nytt tidspunkt er <strong>${date} kl ${time}</strong>.</p>
      <p>Logg inn i admin-panelet for mer informasjon.</p>
    </div>
    `,
    adminCancel: `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <h1 style="color: #ff4444;">Booking Kansellert av Kunde</h1>
      <p>Kunden <strong>${firstName} ${lastName}</strong> (${email}) har kansellert bookingen sin via selvkansellerings-portalen.</p>
      <p>Dette gjaldt bookingen for <strong>${date} kl ${time}</strong>.</p>
      <p>Eventuelt reservasjonsgebyr er <strong>ikke</strong> refundert automatisk. Logg inn i admin-panelet for å behandle eventuell refusjon via Vipps-knappen.</p>
    </div>
    `,
    weekly: `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <h1 style="color: #9C39FF;">Ukentlig Oppsummering & Vaktliste</h1>
      <p>Her er en oversikt over uken som gikk, og uken som kommer.</p>
      
      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Uken som gikk</h2>
      <ul style="list-style: none; padding: 0; background: #f9f9f9; padding: 15px; border-left: 4px solid #9C39FF;">
        <li style="margin-bottom: 8px;"><strong>Total omsetning:</strong> NOK 12500</li>
        <li style="margin-bottom: 8px;"><strong>Hvorav Vipps:</strong> NOK 10000</li>
        <li style="margin-bottom: 8px;"><strong>Hvorav Manuelle bookinger:</strong> NOK 2500</li>
        <li style="margin-bottom: 8px;"><strong>Antall bookinger:</strong> 5</li>
      </ul>

      <h2 style="font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Uken som kommer (Neste 7 dager)</h2>
        <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
          <p style="margin: 0 0 5px 0;"><strong>Dato:</strong> ${date} kl ${time}</p>
          <p style="margin: 0 0 5px 0;"><strong>Navn:</strong> ${firstName} ${lastName} (${players} pers)</p>
          <p style="margin: 0 0 5px 0;"><strong>Opplevelse:</strong> ${experienceTitle}</p>
          <p style="margin: 0; color: #9C39FF; font-size: 12px;"><strong>Vipps Booking</strong></p>
        </div>

      <p style="margin-top: 40px; font-size: 12px; color: #999;">Dette er en automatisk generert ukentlig oppsummering fra Krs VR Arena systemet.</p>
    </div>
    `
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-2xl font-bold">404 - Siden finnes ikke</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#9C39FF]">Forhåndsvisning av E-post Malene</h1>
        <p className="text-zinc-400 mb-8">
          Dette er en simulert forhåndsvisning av e-postene som sendes ut. Denne siden er låst til <code>localhost</code> og vil være utilgjengelig (404) på krsvr.no, selv om den pushes til GitHub.
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'confirmation', label: 'Kunde: Bekreftelse' },
            { id: 'cancellation', label: 'Kunde: Kansellert' },
            { id: 'adminNew', label: 'Admin: Ny Booking' },
            { id: 'adminUpdate', label: 'Admin: Endret Booking' },
            { id: 'adminCancel', label: 'Admin: Kansellert Booking' },
            { id: 'weekly', label: 'Admin: Ukentlig' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#9C39FF] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8 overflow-auto max-w-[800px] mx-auto border border-zinc-200">
          <div dangerouslySetInnerHTML={{ __html: templates[activeTab] }} />
        </div>
      </div>
    </div>
  );
}
