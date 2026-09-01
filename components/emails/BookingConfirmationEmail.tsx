import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface BookingConfirmationEmailProps {
  firstName: string;
  lastName: string;
  experienceTitle: string;
  date: string;
  time: string;
  players: number;
  totalPrice: number;
  amountPaid: number;
  manageUrl: string;
  customText?: string;
  adminEmail?: string;
}

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
  firstName,
  lastName,
  experienceTitle,
  date,
  time,
  players,
  totalPrice,
  amountPaid,
  manageUrl,
  customText,
  adminEmail = 'post@krsvr.no',
}) => {
  const remainingAmount = totalPrice - amountPaid;

  return (
    <EmailLayout previewText={`Bestillingsbekreftelse for ${experienceTitle} den ${date}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Bestillingsbekreftelse & Kvittering 🎉</Heading>
      
      <Text style={paragraphStyle}>Hei {firstName} {lastName},</Text>
      <Text style={paragraphStyle}>Takk for din bestilling hos KRS VR Arena! Vi gleder oss til å gi dere en uforglemmelig VR-opplevelse.</Text>

      {customText && (
        <Section style={customTextBoxStyle}>
          <Text style={{ margin: 0, fontSize: '14px', color: '#4a044e' }}>
            {customText}
          </Text>
        </Section>
      )}

      {/* Navneliste Callout Boks */}
      <Section style={calloutBoxStyle}>
        <Text style={calloutTitleStyle}>📋 Navneliste & Justering av deltakere</Text>
        <Text style={calloutTextStyle}>
          For at vi skal kunne klargjøre VR-headset, tilpasse spillene og gi dere en sømløs og rå opplevelse fra første sekund, trenger vi en navneliste over deltakerne <strong>senest 3 dager før ankomst</strong>.
        </Text>
        <Text style={calloutSubTextStyle}>
          💡 <em>Du trenger ikke å vente – hvis du allerede vet hvem som skal være med, kan du legge inn navnene med en gang. Her kan du også justere antall spillere dersom det blir endringer i gruppen.</em>
        </Text>
        <Button href={manageUrl} style={primaryButtonStyle}>
          Fyll ut navneliste / Juster spillere &rarr;
        </Button>
      </Section>

      {/* Booking Detaljer */}
      <Text style={subheadingStyle}>Bestillingsdetaljer</Text>
      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Opplevelse:</strong> {experienceTitle}</Text>
        <Text style={detailRowStyle}><strong>Dato:</strong> {date}</Text>
        <Text style={detailRowStyle}><strong>Tidspunkt:</strong> {time}</Text>
        <Text style={detailRowStyle}><strong>Antall personer:</strong> {players} pers</Text>
      </Section>

      {/* Betalingskvittering */}
      <Text style={subheadingStyle}>Betalingskvittering</Text>
      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Totalpris:</strong> NOK {totalPrice}</Text>
        <Text style={detailRowStyle}><strong>Betalt beløp:</strong> NOK {amountPaid}</Text>
        <Text style={detailRowStyle}><strong>Gjenstående beløp:</strong> NOK {remainingAmount} (betales ved oppmøte/faktura)</Text>
      </Section>

      {/* Praktisk Info */}
      <Section style={infoBoxStyle}>
        <Text style={infoBoxTitleStyle}>Nyttig før ankomst</Text>
        <Text style={infoBoxTextStyle}>
          📍 <strong>Slik finner du oss:</strong> Industrigata 12, Lund, 4632 Kristiansand (<Link href="https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8" style={{ color: '#9C39FF' }}>Google Maps</Link>)
        </Text>
        <Text style={infoBoxTextStyle}>
          ⏰ <strong>Oppmøte:</strong> Møt opp 10-15 minutter før for enkel briefing og utstyrsjustering.
        </Text>
        <Text style={infoBoxTextStyle}>
          👓 <strong>Briller / Linser:</strong> VR-brillene passer over de fleste vanlige synsbriller.
        </Text>
      </Section>

      <Text style={footnoteStyle}>
        Har du spørsmål eller spesielle ønsker? Svar direkte på denne e-posten eller kontakt oss på <Link href={`mailto:${adminEmail}`} style={{ color: '#9C39FF' }}>{adminEmail}</Link>.
      </Text>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#9C39FF',
  margin: '0 0 16px 0',
};

const subheadingStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#111827',
  margin: '24px 0 8px 0',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '6px',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 12px 0',
};

const customTextBoxStyle: React.CSSProperties = {
  backgroundColor: '#fdf4ff',
  borderLeft: '4px solid #9C39FF',
  padding: '12px 16px',
  borderRadius: '6px',
  margin: '16px 0',
};

const calloutBoxStyle: React.CSSProperties = {
  backgroundColor: '#faf5ff',
  border: '1.5px solid #d8b4fe',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const calloutTitleStyle: React.CSSProperties = {
  color: '#7e22ce',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px 0',
};

const calloutTextStyle: React.CSSProperties = {
  color: '#3b0764',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const calloutSubTextStyle: React.CSSProperties = {
  color: '#6b21a8',
  fontSize: '13px',
  lineHeight: '1.4',
  margin: '0 0 16px 0',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#9C39FF',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
};

const detailsTableStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '8px 0 16px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#4b5563',
  margin: '4px 0',
  lineHeight: '1.5',
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0 16px 0',
};

const infoBoxTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#334155',
  margin: '0 0 8px 0',
};

const infoBoxTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  margin: '4px 0',
  lineHeight: '1.4',
};

const footnoteStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  marginTop: '24px',
  lineHeight: '1.5',
};
