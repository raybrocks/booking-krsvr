import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface AdminBookingCancellationEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  date: string;
  time: string;
  experienceTitle?: string;
  amountPaid?: number;
  adminEmail?: string;
}

export const AdminBookingCancellationEmail: React.FC<AdminBookingCancellationEmailProps> = ({
  firstName,
  lastName,
  email,
  date,
  time,
  experienceTitle,
  amountPaid,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={`Booking Kansellert av Kunde: ${firstName} ${lastName}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Booking Kansellert av Kunde ⚠️</Heading>

      <Text style={paragraphStyle}>
        Kunden <strong>{firstName} {lastName}</strong> ({email}) har kansellert sin booking via kundeportalen.
      </Text>

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Kunde:</strong> {firstName} {lastName}</Text>
        <Text style={detailRowStyle}><strong>Tidspunkt:</strong> {date} kl {time}</Text>
        {experienceTitle && <Text style={detailRowStyle}><strong>Opplevelse:</strong> {experienceTitle}</Text>}
        {amountPaid !== undefined && (
          <Text style={detailRowStyle}><strong>Innbetalt beløp:</strong> NOK {amountPaid}</Text>
        )}
      </Section>

      <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0' }}>
        <em>Merk: Eventuelt reservasjonsgebyr er ikke refundert automatisk. Behandle eventuell refusjon i admin-panelet ved behov.</em>
      </Text>

      <Button href="https://krsvr.no/admin" style={primaryButtonStyle}>
        Gå til Admin Dashboard &rarr;
      </Button>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#dc2626',
  margin: '0 0 14px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '0 0 12px 0',
};

const detailsTableStyle: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0 16px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#991b1b',
  margin: '6px 0',
  lineHeight: '1.4',
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
