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
  locale?: "no" | "en";
}

export const BookingCancellationEmail: React.FC<BookingCancellationEmailProps> = ({
  firstName,
  lastName,
  experienceTitle,
  date,
  time,
  amountRefunded,
  adminEmail = 'post@krsvr.no',
  locale = 'no',
}) => {
  const isEn = locale === 'en';
  return (
    <EmailLayout
      previewText={
        isEn
          ? `Cancellation confirmation for ${experienceTitle}`
          : `Bekreftelse på kansellering for ${experienceTitle}`
      }
      adminEmail={adminEmail}
      locale={locale}
    >
      <Heading style={headingStyle}>
        {isEn ? 'Booking Cancellation' : 'Kansellering av booking'}
      </Heading>

      <Text style={paragraphStyle}>
        {isEn ? `Hello ${firstName} ${lastName},` : `Hei ${firstName} ${lastName},`}
      </Text>
      <Text style={paragraphStyle}>
        {isEn
          ? 'Your booking at KRS VR Arena has now been cancelled.'
          : 'Din bestilling hos KRS VR Arena er nå kansellert.'}
      </Text>

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}>
          <strong>{isEn ? 'Experience:' : 'Opplevelse:'}</strong> {experienceTitle}
        </Text>
        <Text style={detailRowStyle}>
          <strong>{isEn ? 'Date:' : 'Dato:'}</strong> {date}
        </Text>
        <Text style={detailRowStyle}>
          <strong>{isEn ? 'Time:' : 'Tidspunkt:'}</strong> {time}
        </Text>
        {amountRefunded !== undefined && amountRefunded > 0 && (
          <Text style={detailRowStyle}>
            <strong>{isEn ? 'Refunded amount:' : 'Refundert beløp:'}</strong> NOK {amountRefunded}
          </Text>
        )}
      </Section>

      <Text style={paragraphStyle}>
        {isEn ? (
          <>
            If you have any questions or would like to book a new time slot later, you are welcome to visit{' '}
            <Link href="https://krsvr.no/en/booking" style={{ color: '#7c3aed' }}>
              krsvr.no/en/booking
            </Link>{' '}
            or contact us at{' '}
            <Link href={`mailto:${adminEmail}`} style={{ color: '#7c3aed' }}>
              {adminEmail}
            </Link>
            .
          </>
        ) : (
          <>
            Dersom du har spørsmål eller ønsker å booke en ny tid senere, er du velkommen til å besøke{' '}
            <Link href="https://krsvr.no/booking" style={{ color: '#7c3aed' }}>
              krsvr.no
            </Link>{' '}
            eller kontakte oss på{' '}
            <Link href={`mailto:${adminEmail}`} style={{ color: '#7c3aed' }}>
              {adminEmail}
            </Link>
            .
          </>
        )}
      </Text>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#b91c1c',
  margin: '0 0 16px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
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
  fontSize: '13.5px',
  color: '#991b1b',
  margin: '5px 0',
};
