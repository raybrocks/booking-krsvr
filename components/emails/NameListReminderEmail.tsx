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
      <Heading style={headingStyle}>Påminnelse: Navneliste til deres VR-opplevelse 🎮</Heading>

      <Text style={paragraphStyle}>Hei {firstName} {lastName},</Text>
      <Text style={paragraphStyle}>
        Vi gleder oss til å ta dere imot hos KRS VR Arena <strong>{date} kl. {time}</strong> ({players} spillere / {experienceTitle})!
      </Text>

      {/* Callout */}
      <Section style={calloutBoxStyle}>
        <Text style={calloutTitleStyle}>📋 Vennligst registrer navneliste før ankomst</Text>
        <Text style={calloutTextStyle}>
          For at vi skal kunne klargjøre VR-headsettene, sette opp lagene i spillet og gi dere en sømløs og fantastisk opplevelse fra første sekund, trenger vi fornavn (eller kallenavn) på alle som skal spille.
        </Text>
        <Text style={calloutSubTextStyle}>
          Det tar under 1 minutt å fylle ut. Du kan også justere antall spillere dersom det har blitt endringer i gruppen.
        </Text>
        <Button href={manageUrl} style={primaryButtonStyle}>
          Klikk her for å fylle inn navn nå &rarr;
        </Button>
      </Section>

      {/* Praktisk info */}
      <Section style={infoBoxStyle}>
        <Text style={infoBoxTitleStyle}>Oppmøte & Praktisk info</Text>
        <Text style={infoBoxTextStyle}>
          📍 <strong>Adresse:</strong> Industrigata 12, 4632 Kristiansand (<Link href="https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8" style={{ color: '#9C39FF' }}>Google Maps</Link>)
        </Text>
        <Text style={infoBoxTextStyle}>
          ⏰ <strong>Oppmøtetid:</strong> Møt opp 10-15 minutter før spillstart for enkel briefing og tilpasning av briller.
        </Text>
      </Section>

      <Text style={footnoteStyle}>
        Har du spørsmål? Svar direkte på denne e-posten eller kontakt oss på <Link href={`mailto:${adminEmail}`} style={{ color: '#9C39FF' }}>{adminEmail}</Link>.
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

const paragraphStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 12px 0',
};

const calloutBoxStyle: React.CSSProperties = {
  backgroundColor: '#faf5ff',
  border: '1.5px solid #c084fc',
  borderRadius: '12px',
  padding: '22px',
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
