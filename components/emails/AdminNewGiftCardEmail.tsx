import * as React from 'react';
import { Heading, Text, Section, Link, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface AdminNewGiftCardEmailProps {
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  code: string;
  initialAmount: number;
  targetPersons: number;
  expiresAt: string;
  recipientName?: string | null;
  senderName?: string | null;
  greetingMessage?: string | null;
  paymentRef?: string | null;
  adminUrl?: string;
}

export const AdminNewGiftCardEmail: React.FC<AdminNewGiftCardEmailProps> = ({
  buyerName,
  buyerEmail,
  buyerPhone,
  code,
  initialAmount,
  targetPersons,
  expiresAt,
  recipientName,
  senderName,
  greetingMessage,
  paymentRef,
  adminUrl = 'https://krsvr.no/admin?tab=giftcards',
}) => {
  return (
    <EmailLayout previewText={`Nytt gavekort solgt: ${buyerName} (${initialAmount} kr)`}>
      <Heading style={headingStyle}>
        Nytt gavekort solgt
      </Heading>

      <Text style={paragraphStyle}>
        Et nytt gavekort har blitt kjøpt og betalt via Vipps på nettbutikken.
      </Text>

      <Section style={detailsContainerStyle}>
        <Text style={fieldStyle}>
          <strong>Kjøper:</strong> {buyerName}
        </Text>
        <Text style={fieldStyle}>
          <strong>E-post:</strong> {buyerEmail}
        </Text>
        {buyerPhone && (
          <Text style={fieldStyle}>
            <strong>Telefon:</strong> {buyerPhone}
          </Text>
        )}
        <Hr style={{ borderColor: '#3f3f46', margin: '12px 0' }} />
        <Text style={fieldStyle}>
          <strong>Kode:</strong> <code style={{ color: '#c084fc', fontSize: '15px' }}>{code}</code>
        </Text>
        <Text style={fieldStyle}>
          <strong>Beløp:</strong> {initialAmount} kr ({targetPersons} personer)
        </Text>
        <Text style={fieldStyle}>
          <strong>Gyldig til:</strong> {expiresAt}
        </Text>
        {paymentRef && (
          <Text style={fieldStyle}>
            <strong>Vipps-referanse:</strong> {paymentRef}
          </Text>
        )}
        {(recipientName || senderName || greetingMessage) && (
          <>
            <Hr style={{ borderColor: '#3f3f46', margin: '12px 0' }} />
            {recipientName && (
              <Text style={fieldStyle}>
                <strong>Til:</strong> {recipientName}
              </Text>
            )}
            {senderName && (
              <Text style={fieldStyle}>
                <strong>Fra:</strong> {senderName}
              </Text>
            )}
            {greetingMessage && (
              <Text style={{ ...fieldStyle, fontStyle: 'italic' }}>
                &ldquo;{greetingMessage}&rdquo;
              </Text>
            )}
          </>
        )}
      </Section>

      <Section style={{ textAlign: 'center', margin: '24px 0 12px 0' }}>
        <Link href={adminUrl} style={adminLinkStyle}>
          Åpne gavekort i admin-dashbordet &rarr;
        </Link>
      </Section>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 12px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 16px 0',
};

const detailsContainerStyle: React.CSSProperties = {
  backgroundColor: '#18181b',
  borderRadius: '12px',
  padding: '18px 20px',
  color: '#f4f4f5',
  margin: '16px 0',
};

const fieldStyle: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  margin: '4px 0',
  color: '#d4d4d8',
};

const adminLinkStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#9C39FF',
  textDecoration: 'none',
};

export default AdminNewGiftCardEmail;
