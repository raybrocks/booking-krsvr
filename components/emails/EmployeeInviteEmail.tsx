import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface EmployeeInviteEmailProps {
  name: string;
  inviteUrl: string;
  adminEmail?: string;
}

export const EmployeeInviteEmail: React.FC<EmployeeInviteEmailProps> = ({
  name,
  inviteUrl,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText="Invitasjon som ansatt hos KRS VR Arena" adminEmail={adminEmail}>
      <Heading style={headingStyle}>Velkommen til teamet! 👋</Heading>

      <Text style={paragraphStyle}>Hei {name},</Text>
      <Text style={paragraphStyle}>
        Du har blitt lagt til som ansatt i bookingsystemet til <strong>KRS VR Arena</strong>.
      </Text>

      <Section style={calloutBoxStyle}>
        <Text style={calloutTitleStyle}>Aktiver din brukerkonto</Text>
        <Text style={calloutTextStyle}>
          Klikk på knappen under for å registrere passord og få tilgang til vaktliste, bookingkalender og administrasjonspanel.
        </Text>
        <Button href={inviteUrl} style={primaryButtonStyle}>
          Opprett bruker & Logg inn &rarr;
        </Button>
      </Section>

      <Text style={footnoteStyle}>
        Dersom du har spørsmål om vakter eller innlogging, kontakt leder på <Link href={`mailto:${adminEmail}`} style={{ color: '#9C39FF' }}>{adminEmail}</Link>.
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
  border: '1.5px solid #d8b4fe',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center',
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

const footnoteStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  marginTop: '24px',
};
