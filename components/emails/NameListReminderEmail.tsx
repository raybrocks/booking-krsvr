import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface NameListReminderEmailProps {
  firstName: string;
  lastName: string;
  experienceTitle: string;
  date: string;
  time: string;
  players: number;
  manageUrl: string;
  adminEmail?: string;
}

export const NameListReminderEmail: React.FC<NameListReminderEmailProps> = ({
  firstName,
  lastName,
  experienceTitle,
  date,
  time,
  players,
  manageUrl,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={`Påminnelse: Navneliste til ${experienceTitle} den ${date}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Påminnelse om navneliste</Heading>

      <Text style={paragraphStyle}>Hei {firstName} {lastName},</Text>
      <Text style={paragraphStyle}>
        Vi gleder oss til å ta imot dere hos KRS VR Arena <strong>{date} kl. {time}</strong> ({players} deltakere / {experienceTitle}).
      </Text>

      {/* Callout */}
      <Section style={calloutBoxStyle}>
        <Text style={calloutTitleStyle}>Vennligst registrer navneliste før ankomst</Text>
        <Text style={calloutTextStyle}>
          For at vi skal kunne klargjøre VR-utstyret og gjøre alt klart før dere kommer, ber vi om at du fyller ut fornavn på deltakerne i forkant.
        </Text>
        <Text style={calloutSubTextStyle}>
          Dere kan justere antall deltakere og navnelisten helt frem til ankomst. Vær imidlertid oppmerksom på at sene endringer ved oppmøte kan skape forsinkelser i klargjøringen og medføre redusert spilletid.
        </Text>
        <Button href={manageUrl} style={primaryButtonStyle}>
          Fyll ut navneliste &rarr;
        </Button>
      </Section>

      {/* Praktisk info */}
      <Section style={infoBoxStyle}>
        <Text style={infoBoxTitleStyle}>Praktisk informasjon</Text>
        <Text style={infoBoxTextStyle}>
          <strong>Adresse:</strong> Industrigata 12, 4632 Kristiansand (<Link href="https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8" style={{ color: '#7c3aed' }}>Google Maps</Link>)
        </Text>
        <Text style={infoBoxTextStyle}>
          <strong>Oppmøte:</strong> Møt presist for å ikke miste spilletid.
        </Text>
      </Section>

      <Text style={footnoteStyle}>
        Har du spørsmål, kan du svare direkte på denne e-posten eller kontakte oss på <Link href={`mailto:${adminEmail}`} style={{ color: '#7c3aed' }}>{adminEmail}</Link>.
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

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 12px 0',
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
  margin: '4px 0',
  lineHeight: '1.5',
};

const footnoteStyle: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#6b7280',
  marginTop: '24px',
  lineHeight: '1.5',
};
