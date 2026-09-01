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
      <Heading style={headingStyle}>Velkommen som ansatt</Heading>

      <Text style={paragraphStyle}>Hei {name},</Text>
      <Text style={paragraphStyle}>
        Du er lagt til som ansatt i systemet til <strong>KRS VR Arena</strong>.
      </Text>

      <Section style={calloutBoxStyle}>
        <Text style={calloutTitleStyle}>Opprett passord og få tilgang</Text>
        <Text style={calloutTextStyle}>
          Klikk på knappen under for å opprette ditt passord og få tilgang til vaktliste, bookingkalender og administrasjonspanel.
        </Text>
        <Button href={inviteUrl} style={primaryButtonStyle}>
          Opprett bruker og logg inn &rarr;
        </Button>
      </Section>

      <Text style={footnoteStyle}>
        Har du spørsmål, ta kontakt med leder på <Link href={`mailto:${adminEmail}`} style={{ color: '#7c3aed' }}>{adminEmail}</Link>.
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
  textAlign: 'center',
};

const calloutTitleStyle: React.CSSProperties = {
  color: '#4338ca',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const calloutTextStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '13.5px',
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

const footnoteStyle: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#6b7280',
  marginTop: '24px',
};
