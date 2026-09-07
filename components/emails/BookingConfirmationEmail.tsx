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
  isUpdate?: boolean;
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
  isUpdate = false,
}) => {
  const remainingAmount = totalPrice - amountPaid;

  return (
    <EmailLayout 
      previewText={isUpdate ? `Oppdatert bestilling for ${experienceTitle} den ${date}` : `Bestillingsbekreftelse for ${experienceTitle} den ${date}`} 
      adminEmail={adminEmail}
    >
      <Heading style={headingStyle}>
        {isUpdate ? 'Oppdatert bestillingsbekreftelse' : 'Bestillingsbekreftelse og kvittering'}
      </Heading>
      
      <Text style={paragraphStyle}>Hei {firstName} {lastName},</Text>
      <Text style={paragraphStyle}>
        {isUpdate 
          ? 'Her er en oppdatert bekreftelse på din bestilling hos KRS VR Arena. Nedenfor finner du de oppdaterte detaljene.'
          : 'Takk for din bestilling. Vi gleder oss til å ta imot dere hos KRS VR Arena.'}
      </Text>

      {customText && (
        <Section style={customTextBoxStyle}>
          <Text style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
            {customText}
          </Text>
        </Section>
      )}

      {/* Navneliste og justering */}
      <Section style={calloutBoxStyle}>
        <Text style={calloutTitleStyle}>Navneliste og antall deltakere</Text>
        <Text style={calloutTextStyle}>
          For at vi skal kunne klargjøre VR-utstyret og gjøre alt klart før dere kommer, ber vi om at du fyller ut fornavn på deltakerne i forkant.
        </Text>
        <Text style={calloutSubTextStyle}>
          Dere kan justere antall deltakere og oppdatere navnelisten helt frem til ankomst. Vær imidlertid oppmerksom på at sene endringer ved oppmøte kan skape forsinkelser i klargjøringen og medføre redusert spilletid.
        </Text>
        <Button href={manageUrl} style={primaryButtonStyle}>
          Administrer booking og navneliste &rarr;
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
        <Text style={detailRowStyle}><strong>Gjenstående beløp:</strong> NOK {remainingAmount} {remainingAmount > 0 ? '(betales ved oppmøte/faktura)' : ''}</Text>
      </Section>

      {/* Praktisk Info */}
      <Section style={infoBoxStyle}>
        <Text style={infoBoxTitleStyle}>Praktisk informasjon</Text>
        <Text style={infoBoxTextStyle}>
          <strong>Adresse:</strong> Industrigata 12, Lund, 4632 Kristiansand (<Link href="https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8" style={{ color: '#7c3aed' }}>Google Maps</Link>)
        </Text>
        <Text style={infoBoxTextStyle}>
          <strong>Oppmøte:</strong> Møt presist for å ikke miste spilletid.
        </Text>
        <Text style={infoBoxTextStyle}>
          <strong>Briller og linser:</strong> VR-brillene passer over de fleste vanlige synsbriller.
        </Text>
      </Section>

      <Text style={footnoteStyle}>
        Har du spørsmål rundt bestillingen, kan du svare direkte på denne e-posten eller kontakte oss på <Link href={`mailto:${adminEmail}`} style={{ color: '#7c3aed' }}>{adminEmail}</Link>.
      </Text>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 16px 0',
};

const subheadingStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#111827',
  margin: '24px 0 8px 0',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '6px',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 12px 0',
};

const customTextBoxStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderLeft: '3px solid #7c3aed',
  padding: '12px 16px',
  borderRadius: '6px',
  margin: '16px 0',
};

const calloutBoxStyle: React.CSSProperties = {
  backgroundColor: '#fbfbfe',
  border: '1px solid #e0e7ff',
  borderRadius: '10px',
  padding: '20px',
  margin: '24px 0',
};

const calloutTitleStyle: React.CSSProperties = {
  color: '#4338ca',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 6px 0',
};

const calloutTextStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '13.5px',
  lineHeight: '1.5',
  margin: '0 0 6px 0',
};

const calloutSubTextStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12.5px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '11px 20px',
  fontSize: '13px',
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
  fontSize: '13.5px',
  color: '#4b5563',
  margin: '4px 0',
  lineHeight: '1.5',
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0 16px 0',
};

const infoBoxTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 8px 0',
};

const infoBoxTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#4b5563',
  margin: '5px 0',
  lineHeight: '1.5',
};

const footnoteStyle: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#6b7280',
  marginTop: '24px',
  lineHeight: '1.5',
};
