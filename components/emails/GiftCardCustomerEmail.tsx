import * as React from 'react';
import { Heading, Text, Section, Link, Button, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface GiftCardCustomerEmailProps {
  buyerName: string;
  code: string;
  initialAmount: number;
  targetPersons: number;
  expiresAt: string;
  recipientName?: string | null;
  senderName?: string | null;
  greetingMessage?: string | null;
  printUrl?: string;
  bookingUrl?: string;
  locale?: 'no' | 'en';
}

export const GiftCardCustomerEmail: React.FC<GiftCardCustomerEmailProps> = ({
  buyerName,
  code,
  initialAmount,
  targetPersons,
  expiresAt,
  recipientName,
  senderName,
  greetingMessage,
  printUrl = `https://krsvr.no/gavekort/print/${code}`,
  bookingUrl = 'https://krsvr.no/booking',
  locale = 'no',
}) => {
  const isEn = locale === 'en';

  return (
    <EmailLayout
      previewText={
        isEn
          ? `Your gift card from KRS VR Arena (${code})`
          : `Ditt gavekort fra KRS VR Arena (${code})`
      }
      locale={locale}
    >
      <Heading style={headingStyle}>
        {isEn ? 'Thank you for your gift card purchase' : 'Takk for ditt kjøp av gavekort'}
      </Heading>

      <Text style={paragraphStyle}>
        {isEn
          ? `Hi ${buyerName}, here is your gift card for KRS VR Arena. You can forward this email to the recipient, or use the link below to print an elegant gift certificate.`
          : `Hei ${buyerName}, her er ditt gavekort for KRS VR Arena. Du kan videresende denne e-posten til mottakeren, eller åpne lenken nedenfor for å skrive ut et pent gavebevis.`}
      </Text>

      {/* Gift Card Visual Box */}
      <Section style={cardContainerStyle}>
        <Section style={cardHeaderStyle}>
          <Text style={cardBadgeStyle}>
            {isEn ? 'GIFT CERTIFICATE' : 'GAVEKORT'}
          </Text>
          <Text style={cardTitleStyle}>
            KRS VR ARENA
          </Text>
          <Text style={cardSubTitleStyle}>
            {targetPersons > 0
              ? isEn
                ? `VR Experience for ${targetPersons} persons (${initialAmount} NOK)`
                : `VR-opplevelse for ${targetPersons} personer (${initialAmount} kr)`
              : `${initialAmount} kr`}
          </Text>
        </Section>

        <Section style={cardBodyStyle}>
          {recipientName && (
            <Text style={cardFieldStyle}>
              <strong>{isEn ? 'To:' : 'Til:'}</strong> {recipientName}
            </Text>
          )}
          {senderName && (
            <Text style={cardFieldStyle}>
              <strong>{isEn ? 'From:' : 'Fra:'}</strong> {senderName}
            </Text>
          )}

          {greetingMessage && (
            <Section style={greetingBoxStyle}>
              <Text style={greetingTextStyle}>
                &ldquo;{greetingMessage}&rdquo;
              </Text>
            </Section>
          )}

          <Section style={codeBoxStyle}>
            <Text style={codeLabelStyle}>
              {isEn ? 'GIFT CARD CODE' : 'GAVEKORTKODE'}
            </Text>
            <Text style={codeValueStyle}>
              {code}
            </Text>
            <Text style={expiryStyle}>
              {isEn ? `Valid until: ${expiresAt}` : `Gyldig til: ${expiresAt}`}
            </Text>
          </Section>
        </Section>
      </Section>

      {/* Actions */}
      <Section style={{ textAlign: 'center', margin: '28px 0 20px 0' }}>
        <Button href={printUrl} style={primaryButtonStyle}>
          {isEn ? 'Open Printable Gift Certificate (PDF)' : 'Åpne utskriftsvennlig gavekort (PDF)'}
        </Button>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
        <Link href={bookingUrl} style={secondaryLinkStyle}>
          {isEn ? 'Go to booking at krsvr.no' : 'Gå til booking på krsvr.no'} &rarr;
        </Link>
      </Section>

      <Hr style={hrStyle} />

      {/* Instructions */}
      <Heading as="h3" style={subHeadingStyle}>
        {isEn ? 'How to redeem the gift card:' : 'Slik benyttes gavekortet:'}
      </Heading>
      <Text style={listTextStyle}>
        {isEn
          ? '1. Visit www.krsvr.no/en/booking and choose your preferred VR experience, date, and time.'
          : '1. Gå inn på www.krsvr.no/booking og velg ønsket opplevelse, dato og klokkeslett.'}
      </Text>
      <Text style={listTextStyle}>
        {isEn
          ? `2. Enter the code ${code} in the promo / gift card field during checkout.`
          : `2. Tast inn koden ${code} i feltet for rabattkode / gavekort i kassen.`}
      </Text>
      <Text style={listTextStyle}>
        {isEn
          ? '3. If your group is larger than the card covers, you only pay for the extra players during checkout. If you are fewer, the remaining balance stays on the code for 12 months.'
          : '3. Hvis dere blir flere deltakere enn gavekortet dekker, betaler dere kun for de ekstra personene ved bestilling. Blir dere færre, forblir restbeløpet på koden i 12 måneder.'}
      </Text>

      <Text style={footerNoteStyle}>
        {isEn
          ? 'We look forward to welcoming you to KRS VR Arena at Lund in Kristiansand!'
          : 'Vi gleder oss til å ta imot dere hos KRS VR Arena på Lund i Kristiansand!'}
      </Text>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
  letterSpacing: '-0.3px',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#374151',
  margin: '0 0 20px 0',
};

const cardContainerStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0c',
  border: '1px solid #27272a',
  borderRadius: '16px',
  overflow: 'hidden',
  margin: '20px 0',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
};

const cardHeaderStyle: React.CSSProperties = {
  padding: '24px 24px 16px 24px',
  textAlign: 'center',
  background: 'linear-gradient(180deg, rgba(156, 57, 255, 0.18) 0%, rgba(10, 10, 12, 0) 100%)',
  borderBottom: '1px solid #1f1f23',
};

const cardBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  color: '#c084fc',
  margin: '0 0 6px 0',
  textTransform: 'uppercase',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '800',
  letterSpacing: '1px',
  color: '#ffffff',
  margin: '0 0 4px 0',
};

const cardSubTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#e4e4e7',
  fontWeight: '600',
  margin: 0,
};

const cardBodyStyle: React.CSSProperties = {
  padding: '20px 24px 24px 24px',
};

const cardFieldStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#d4d4d8',
  margin: '0 0 8px 0',
};

const greetingBoxStyle: React.CSSProperties = {
  backgroundColor: '#18181b',
  borderLeft: '3px solid #9C39FF',
  padding: '12px 16px',
  borderRadius: '6px',
  margin: '14px 0',
};

const greetingTextStyle: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#f4f4f5',
  fontStyle: 'italic',
  margin: 0,
};

const codeBoxStyle: React.CSSProperties = {
  backgroundColor: '#131316',
  border: '1px dashed #3f3f46',
  borderRadius: '10px',
  padding: '16px',
  textAlign: 'center',
  marginTop: '16px',
};

const codeLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1.5px',
  color: '#a1a1aa',
  margin: '0 0 6px 0',
};

const codeValueStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 'bold',
  letterSpacing: '3px',
  color: '#a855f7',
  fontFamily: 'monospace',
  margin: '0 0 6px 0',
};

const expiryStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#71717a',
  margin: 0,
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#9C39FF',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '13px 26px',
  borderRadius: '9999px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 14px 0 rgba(156, 57, 255, 0.4)',
};

const secondaryLinkStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#9C39FF',
  textDecoration: 'none',
  fontWeight: '600',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const subHeadingStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 10px 0',
};

const listTextStyle: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#4b5563',
  margin: '0 0 8px 0',
};

const footerNoteStyle: React.CSSProperties = {
  fontSize: '13px',
  fontStyle: 'italic',
  color: '#6b7280',
  margin: '18px 0 0 0',
};

export default GiftCardCustomerEmail;
