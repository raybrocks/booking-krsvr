import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface AdminNewBookingEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experienceTitle: string;
  date: string;
  time: string;
  players: number;
  totalPrice: number;
  amountPaid: number;
  bookingType?: string;
  companyName?: string;
  internalNotes?: string;
  adminEmail?: string;
}

export const AdminNewBookingEmail: React.FC<AdminNewBookingEmailProps> = ({
  firstName,
  lastName,
  email,
  phone,
  experienceTitle,
  date,
  time,
  players,
  totalPrice,
  amountPaid,
  bookingType,
  companyName,
  internalNotes,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={`Ny Booking: ${firstName} ${lastName} - ${date} kl ${time}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Ny Booking Gjennomført 🎯</Heading>

      <Text style={paragraphStyle}>
        En ny booking har blitt registrert og betalt i systemet.
      </Text>

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Kunde:</strong> {firstName} {lastName} {companyName ? `(${companyName})` : ''}</Text>
        <Text style={detailRowStyle}><strong>E-post:</strong> <Link href={`mailto:${email}`} style={{ color: '#9C39FF' }}>{email}</Link></Text>
        <Text style={detailRowStyle}><strong>Telefon:</strong> <Link href={`tel:${phone}`} style={{ color: '#9C39FF' }}>{phone}</Link></Text>
        <Text style={detailRowStyle}><strong>Type:</strong> {bookingType === 'corporate' ? 'Bedriftsbooking' : 'Privatbooking'}</Text>
        <Text style={detailRowStyle}><strong>Opplevelse:</strong> {experienceTitle}</Text>
        <Text style={detailRowStyle}><strong>Tidspunkt:</strong> {date} kl {time}</Text>
        <Text style={detailRowStyle}><strong>Antall spillere:</strong> {players} pers</Text>
        <Text style={detailRowStyle}><strong>Totalpris / Betalt:</strong> NOK {totalPrice} / NOK {amountPaid}</Text>
        {internalNotes && (
          <Text style={detailRowStyle}><strong>Notat:</strong> <em>{internalNotes}</em></Text>
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

const detailsTableStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #9C39FF',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0 24px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
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
