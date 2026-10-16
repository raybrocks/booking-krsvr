import * as React from 'react';
import { Heading, Text, Section, Button, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface AdminReviewRequestReceiptEmailProps {
  recipientName: string;
  recipientEmail: string;
  date?: string;
  platform: 'tripadvisor' | 'google' | 'both';
  language?: 'no' | 'en';
  sentAt?: string;
  adminEmail?: string;
}

const TRIPADVISOR_URL = 'https://no.tripadvisor.com/Attraction_Review-g190492-d34257006-Reviews-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html';
const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJOVTL6bcDOEYR8N3bbtLT474';

export const AdminReviewRequestReceiptEmail: React.FC<AdminReviewRequestReceiptEmailProps> = ({
  recipientName,
  recipientEmail,
  date,
  platform = 'both',
  language = 'no',
  sentAt,
  adminEmail = 'post@krsvr.no',
}) => {
  const isEn = language === 'en';
  const platformLabel =
    platform === 'both'
      ? 'Tripadvisor & Google'
      : platform === 'tripadvisor'
      ? 'Tripadvisor'
      : 'Google';

  return (
    <EmailLayout
      previewText={`Kvittering: Omtaleforespørsel sendt til ${recipientName}`}
      adminEmail={adminEmail}
    >
      <Heading style={headingStyle}>Kvittering på utsendt omtaleforespørsel</Heading>

      <Text style={paragraphStyle}>
        Forespørsel om omtale har blitt sendt til <strong>{recipientName}</strong> (<span style={{ color: '#4b5563' }}>{recipientEmail}</span>) fra admin-panelet.
      </Text>

      {/* Oppsummeringstabell */}
      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}>
          <strong>Mottaker:</strong> {recipientName} &lt;{recipientEmail}&gt;
        </Text>
        {date && (
          <Text style={detailRowStyle}>
            <strong>Dato for booking:</strong> {date}
          </Text>
        )}
        <Text style={detailRowStyle}>
          <strong>Plattform(er):</strong> {platformLabel}
        </Text>
        <Text style={detailRowStyle}>
          <strong>Språk:</strong> {isEn ? 'Engelsk (English)' : 'Norsk'}
        </Text>
        {sentAt && (
          <Text style={detailRowStyle}>
            <strong>Sendt:</strong> {sentAt}
          </Text>
        )}
      </Section>

      <Hr style={dividerStyle} />

      {/* Kopi av utsendt e-post */}
      <Text style={copyLabelStyle}>Kopi av e-posten kunden mottok:</Text>

      <Section style={previewBoxStyle}>
        <Heading style={previewHeadingStyle}>
          {isEn
            ? `Hi ${recipientName.split(' ')[0] || 'there'}, thank you for visiting us!`
            : `Hei ${recipientName.split(' ')[0] || 'deg'}, takk for besøket!`}
        </Heading>

        <Text style={previewParagraphStyle}>
          {isEn
            ? `We hope you had a great experience with us at Lund in Kristiansand.`
            : `Vi håper dere hadde en fin opplevelse hos oss på Lund i Kristiansand.`}
        </Text>

        <Text style={previewParagraphStyle}>
          {isEn
            ? `As a local arena in Kristiansand, feedback from our visitors means the world to our team. If you have a minute to spare, we would truly appreciate it if you could share a brief review.`
            : `Som en lokal arena i Kristiansand betyr tilbakemeldinger fra gjestene våre utrolig mye for teamet vårt. Dersom du har et lite minutt til overs, ville vi satt stor pris på om du delte en kort omtale.`}
        </Text>

        <Text style={previewParagraphStyle}>
          {isEn
            ? `The most valuable reviews often describe who you were, the occasion for your visit, and how you experienced it.`
            : `De mest verdifulle tilbakemeldingene beskriver gjerne hvem dere var, i hvilken anledning dere besøkte oss, og hvordan opplevelsen var.`}
        </Text>

        <Section style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>
          {(platform === 'tripadvisor' || platform === 'both') && (
            <div style={{ marginBottom: '10px' }}>
              <Button href={TRIPADVISOR_URL} style={tripadvisorButtonStyle}>
                ★ {isEn ? 'Review us on Tripadvisor' : 'Legg igjen vurdering på Tripadvisor'}
              </Button>
            </div>
          )}
          {(platform === 'google' || platform === 'both') && (
            <div>
              <Button href={GOOGLE_REVIEW_URL} style={googleButtonStyle}>
                ★ {isEn ? 'Write a review on Google' : 'Skriv en anmeldelse på Google'}
              </Button>
            </div>
          )}
        </Section>
      </Section>

      <Section style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button href="https://krsvr.no/admin" style={adminLinkButtonStyle}>
          Åpne Admin-panel &rarr;
        </Button>
      </Section>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 14px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '0 0 16px 0',
};

const detailsTableStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 16px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#1f2937',
  margin: '0 0 6px 0',
  lineHeight: '1.4',
};

const copyLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: '#6b7280',
  margin: '0 0 8px 0',
};

const previewBoxStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 16px 0',
};

const previewHeadingStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 12px 0',
  lineHeight: '1.3',
};

const previewParagraphStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#4b5563',
  lineHeight: '1.5',
  margin: '0 0 12px 0',
};

const tripadvisorButtonStyle: React.CSSProperties = {
  backgroundColor: '#00aa6c',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  display: 'inline-block',
};

const googleButtonStyle: React.CSSProperties = {
  backgroundColor: '#1a73e8',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  display: 'inline-block',
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const adminLinkButtonStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  display: 'inline-block',
};

export default AdminReviewRequestReceiptEmail;
