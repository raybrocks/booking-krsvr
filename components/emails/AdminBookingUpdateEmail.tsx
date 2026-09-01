import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface AdminBookingUpdateEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  date: string;
  time: string;
  players?: number;
  experienceTitle?: string;
  adminEmail?: string;
}

export const AdminBookingUpdateEmail: React.FC<AdminBookingUpdateEmailProps> = ({
  firstName,
  lastName,
  email,
  date,
  time,
  players,
  experienceTitle,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={`Booking endret av kunde: ${firstName} ${lastName}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Booking endret av kunde</Heading>

      <Text style={paragraphStyle}>
        Kunden <strong>{firstName} {lastName}</strong> ({email}) har oppdatert bookingen sin via kundeportalen.
      </Text>

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Kunde:</strong> {firstName} {lastName}</Text>
        <Text style={detailRowStyle}><strong>Nytt tidspunkt:</strong> {date} kl {time}</Text>
        {experienceTitle && <Text style={detailRowStyle}><strong>Opplevelse:</strong> {experienceTitle}</Text>}
        {players && <Text style={detailRowStyle}><strong>Antall deltakere:</strong> {players} pers</Text>}
      </Section>

      <Button href="https://krsvr.no/admin" style={primaryButtonStyle}>
        Se oppdatering i Admin &rarr;
      </Button>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 14px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '0 0 12px 0',
};

const detailsTableStyle: React.CSSProperties = {
  backgroundColor: '#fefce8',
  borderLeft: '3px solid #ca8a04',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0 24px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#713f12',
  margin: '6px 0',
  lineHeight: '1.4',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '10px 18px',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
};
