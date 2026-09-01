import * as React from 'react';
import { Heading, Text, Section, Link } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface BookingCancellationEmailProps {
  firstName: string;
  lastName: string;
  experienceTitle: string;
  date: string;
  time: string;
  amountRefunded?: number;
  adminEmail?: string;
}

export const BookingCancellationEmail: React.FC<BookingCancellationEmailProps> = ({
  firstName,
  lastName,
  experienceTitle,
  date,
  time,
  amountRefunded,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={`Bekreftelse på kansellering for ${experienceTitle}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Booking Kansellert</Heading>

      <Text style={paragraphStyle}>Hei {firstName} {lastName},</Text>
      <Text style={paragraphStyle}>
        Din bestilling hos KRS VR Arena har blitt kansellert.
      </Text>

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Opplevelse:</strong> {experienceTitle}</Text>
        <Text style={detailRowStyle}><strong>Dato:</strong> {date}</Text>
        <Text style={detailRowStyle}><strong>Tidspunkt:</strong> {time}</Text>
        {amountRefunded !== undefined && amountRefunded > 0 && (
          <Text style={detailRowStyle}><strong>Refundert beløp:</strong> NOK {amountRefunded}</Text>
        )}
      </Section>

      <Text style={paragraphStyle}>
        Dersom du har spørsmål eller ønsker å booke en ny tid senere, er du hjertelig velkommen til å besøke <Link href="https://krsvr.no/booking" style={{ color: '#9C39FF' }}>vår nettside</Link> eller kontakte oss på <Link href={`mailto:${adminEmail}`} style={{ color: '#9C39FF' }}>{adminEmail}</Link>.
      </Text>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#dc2626',
  margin: '0 0 16px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 12px 0',
};

const detailsTableStyle: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fee2e2',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#991b1b',
  margin: '6px 0',
};
