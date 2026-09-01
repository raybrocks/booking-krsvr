import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface FeedbackNotificationEmailProps {
  rating: string;
  comments: string;
  phone?: string;
  adminEmail?: string;
}

export const FeedbackNotificationEmail: React.FC<FeedbackNotificationEmailProps> = ({
  rating,
  comments,
  phone,
  adminEmail = 'post@krsvr.no',
}) => {
  const getRatingDisplay = (r: string) => {
    if (r === 'happy') return { emoji: '😄', text: 'Kjempefornøyd (Happy)', color: '#16a34a' };
    if (r === 'neutral') return { emoji: '😐', text: 'Helt ok (Neutral)', color: '#ca8a04' };
    if (r === 'sad') return { emoji: '😞', text: 'Misfornøyd (Sad)', color: '#dc2626' };
    return { emoji: '⭐', text: r, color: '#9C39FF' };
  };

  const ratingInfo = getRatingDisplay(rating);

  return (
    <EmailLayout previewText={`Ny tilbakemelding mottatt: ${ratingInfo.text}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Ny Tilbakemelding fra Kunde ✨</Heading>

      <Text style={paragraphStyle}>
        En kunde har lagt igjen en tilbakemelding på <Link href="https://krsvr.no/feedback" style={{ color: '#9C39FF' }}>krsvr.no/feedback</Link>:
      </Text>

      <Section style={{ ...ratingCardStyle, borderLeftColor: ratingInfo.color }}>
        <Text style={{ fontSize: '20px', margin: '0 0 6px 0' }}>
          {ratingInfo.emoji} <strong style={{ color: ratingInfo.color }}>{ratingInfo.text}</strong>
        </Text>

        {comments && (
          <Section style={commentBoxStyle}>
            <Text style={{ fontSize: '14px', color: '#1f2937', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>
              &ldquo;{comments}&rdquo;
            </Text>
          </Section>
        )}

        {phone && (
          <Text style={{ fontSize: '13px', color: '#4b5563', margin: '12px 0 0 0' }}>
            📞 <strong>Telefon for oppfølging:</strong> <Link href={`tel:${phone}`} style={{ color: '#9C39FF' }}>{phone}</Link>
          </Text>
        )}
      </Section>

      <Button href="https://krsvr.no/admin" style={primaryButtonStyle}>
        Åpne Admin Dashboard &rarr;
      </Button>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#9C39FF',
  margin: '0 0 14px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '0 0 12px 0',
};

const ratingCardStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #9C39FF',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0 24px 0',
};

const commentBoxStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '12px 16px',
  marginTop: '12px',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#9C39FF',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
};
