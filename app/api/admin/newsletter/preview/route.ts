import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { render } from '@react-email/components';
import { NewsletterBroadcastEmail } from '@/components/emails/NewsletterBroadcastEmail';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      headline,
      preheader,
      teaser,
      bodyParagraphs,
      featuredExperience,
      ctaButtonText,
      ctaButtonUrl,
      discountCode,
      adminEmail,
    } = body;

    const html = await render(
      React.createElement(NewsletterBroadcastEmail, {
        headline: headline || 'Nyheter fra KRS VR Arena',
        preheader: preheader || undefined,
        teaser: teaser || '',
        bodyParagraphs: Array.isArray(bodyParagraphs) ? bodyParagraphs : [],
        featuredExperience: featuredExperience || undefined,
        ctaButtonText: ctaButtonText || undefined,
        ctaButtonUrl: ctaButtonUrl || undefined,
        discountCode: discountCode || undefined,
        adminEmail: adminEmail || 'post@krsvr.no',
      })
    );

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error('Error rendering newsletter preview:', error);
    return NextResponse.json(
      { error: 'Kunne ikke rendere forhåndsvisning', details: error.message },
      { status: 500 }
    );
  }
}
