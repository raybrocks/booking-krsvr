import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface AdminNameListReminderEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  players: number;
  validNamesCount: number;
  reminderCount: number;
  experienceTitle?: string;
  bookingType?: string;
  companyName?: string;
  adminEmail?: string;
}

export const AdminNameListReminderEmail: React.FC<AdminNameListReminderEmailProps> = ({
  firstName,
  lastName,
  email,
  phone,
  date,
  time,
  players,
  validNamesCount,
  reminderCount,
  experienceTitle,
  bookingType,
  companyName,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={`Kunde purret for navneliste: ${firstName} ${lastName}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Påminnelse om navneliste sendt</Heading>

      <Text style={paragraphStyle}>
        En automatisk påminnelse om å registrere navneliste har blitt sendt til kunden.
      </Text>

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}>
          <strong>Kunde:</strong> {firstName} {lastName} {companyName ? `(${companyName})` : ''}
        </Text>
        <Text style={detailRowStyle}>
          <strong>E-post:</strong> <Link href={`mailto:${email}`} style={{ color: '#7c3aed' }}>{email}</Link>
        </Text>
        {phone && (
          <Text style={detailRowStyle}>
            <strong>Telefon:</strong> <Link href={`tel:${phone}`} style={{ color: '#7c3aed' }}>{phone}</Link>
          </Text>
        )}
        {bookingType && (
          <Text style={detailRowStyle}>
            <strong>Type:</strong> {bookingType === 'corporate' ? 'Bedriftsbooking' : 'Privatbooking'}
          </Text>
        )}
        {experienceTitle && (
          <Text style={detailRowStyle}>
            <strong>Opplevelse:</strong> {experienceTitle}
          </Text>
        )}
        <Text style={detailRowStyle}>
          <strong>Tidspunkt:</strong> {date} kl {time}
        </Text>
        <Text style={detailRowStyle}>
          <strong>Status navneliste:</strong> {validNamesCount} av {players} spillere registrert
        </Text>
        <Text style={detailRowStyle}>
          <strong>Utsendt purring:</strong> Påminnelse nr. {reminderCount}
        </Text>
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
  backgroundColor: '#f9fafb',
  borderLeft: '3px solid #7c3aed',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0 24px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#374151',
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
