'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { FeedbackNotificationEmail } from '@/components/emails/FeedbackNotificationEmail';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitFeedback(formData: FormData) {
  const rating = formData.get('rating') as string;
  const comments = formData.get('comments') as string | null;
  const phone = formData.get('phone') as string | null;
  const source = formData.get('source') as string | null;

  if (!rating || !['happy', 'neutral', 'sad'].includes(rating)) {
    return { success: false, error: 'Ugyldig rating.' };
  }

  const consentToContact = !!phone && phone.trim().length > 0;

  try {
    const { error: dbError } = await supabaseAdmin.from('feedback_submissions').insert({
      rating,
      comments: comments ? comments.trim().substring(0, 2000) : null,
      phone: phone ? phone.trim().substring(0, 30) : null,
      consent_to_contact: consentToContact,
      source: source ? source.substring(0, 100) : null
    });

    if (dbError) {
      console.error('Database Error in submitFeedback:', dbError);
      return { success: false, error: 'Kunne ikke lagre tilbakemeldingen.' };
    }

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'KRS VR Arena <post@krsvr.no>',
        to: 'admin@krsvr.no',
        subject: `Ny tilbakemelding mottatt (${rating})`,
        react: React.createElement(FeedbackNotificationEmail, { 
          rating, 
          comments: comments || '', 
          phone: phone || '' 
        }),
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Exception in submitFeedback:', err);
    return { success: false, error: 'Noe gikk galt.' };
  }
}
