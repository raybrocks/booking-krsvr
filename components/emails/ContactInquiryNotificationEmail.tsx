import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface ContactInquiryNotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  formType: 'contact' | 'arrangement';
  eventType?: string;
  companyName?: string;
  packageType?: string;
  peopleCount?: string;
  date?: string;
  altDate?: string;
  time?: string;
  food?: string;
  message: string;
  adminEmail?: string;
}

export const ContactInquiryNotificationEmail: React.FC<ContactInquiryNotificationEmailProps> = ({
  name,
  email,
  phone,
  formType,
  eventType,
  companyName,
  packageType,
  peopleCount,
  date,
  altDate,
  time,
  food,
  message,
  adminEmail = 'post@krsvr.no',
}) => {
  const isArrangement = formType === 'arrangement';

  return (
    <EmailLayout previewText={`Ny ${isArrangement ? eventType || 'Arrangementsforespørsel' : 'Kontakthenvendelse'} fra ${name}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>
        {isArrangement ? 'Ny Arrangementsforespørsel 🏢' : 'Ny Kontakthenvendelse ✉️'}
      </Heading>

      <Text style={paragraphStyle}>
        Det har kommet inn et nytt skjema fra nettsiden:
      </Text>

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Navn:</strong> {name}</Text>
        <Text style={detailRowStyle}><strong>E-post:</strong> <Link href={`mailto:${email}`} style={{ color: '#9C39FF' }}>{email}</Link></Text>
        {phone && <Text style={detailRowStyle}><strong>Telefon:</strong> <Link href={`tel:${phone}`} style={{ color: '#9C39FF' }}>{phone}</Link></Text>}
        {companyName && <Text style={detailRowStyle}><strong>Bedrift:</strong> {companyName}</Text>}
        {eventType && <Text style={detailRowStyle}><strong>Type arrangement:</strong> {eventType}</Text>}
        {packageType && <Text style={detailRowStyle}><strong>Ønsket opplegg:</strong> {packageType}</Text>}
        {peopleCount && <Text style={detailRowStyle}><strong>Antall personer:</strong> {peopleCount}</Text>}
        {date && <Text style={detailRowStyle}><strong>Ønsket dato:</strong> {date}</Text>}
        {altDate && <Text style={detailRowStyle}><strong>Alternativ dato:</strong> {altDate}</Text>}
        {time && <Text style={detailRowStyle}><strong>Tidspunkt:</strong> {time}</Text>}
        {food && <Text style={detailRowStyle}><strong>Matservering:</strong> {food}</Text>}
      </Section>

      <Section style={messageBoxStyle}>
        <Text style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
          Melding fra kunde:
        </Text>
        <Text style={{ fontSize: '14px', color: '#1f2937', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          {message}
        </Text>
      </Section>

      <Button href="https://krsvr.no/admin" style={primaryButtonStyle}>
        Åpne Forespørsler i Admin &rarr;
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
  margin: '16px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '6px 0',
  lineHeight: '1.4',
};

const messageBoxStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0 24px 0',
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
