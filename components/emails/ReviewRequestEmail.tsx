import * as React from 'react';
import { Heading, Text, Section, Link, Button, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface ReviewRequestEmailProps {
  firstName: string;
  date?: string;
  platform: 'tripadvisor' | 'google' | 'both';
  language?: 'no' | 'en';
  adminEmail?: string;
}

const TRIPADVISOR_URL = 'https://no.tripadvisor.com/UserReviewEdit-g190492-d34257006-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html';
const GOOGLE_REVIEW_URL = 'https://g.page/r/CfC9vWzS0yO-EBM/review';

export const ReviewRequestEmail: React.FC<ReviewRequestEmailProps> = ({
  firstName,
  platform = 'both',
  language = 'no',
  adminEmail = 'post@krsvr.no',
}) => {
  const isEn = language === 'en';

  const previewText = isEn
    ? `How was your visit to KRS VR Arena? Share your experience with us.`
    : `Hvordan var oppholdet ditt hos KRS VR Arena? Del gjerne din opplevelse.`;

  const headingText = isEn
    ? `Hi ${firstName || 'there'}, thank you for visiting us!`
    : `Hei ${firstName || 'deg'}, takk for besøket!`;

  return (
    <EmailLayout previewText={previewText} adminEmail={adminEmail}>
      <Heading style={headingStyle}>{headingText}</Heading>

      <Text style={paragraphStyle}>
        {isEn
          ? `We hope you had a great experience with us at Lund in Kristiansand.`
          : `Vi håper dere hadde en fin opplevelse hos oss på Lund i Kristiansand.`}
      </Text>

      <Text style={paragraphStyle}>
        {isEn
          ? `As a local arena in Kristiansand, feedback from our visitors means the world to our team. If you have a minute to spare, we would truly appreciate it if you could share a brief review.`
          : `Som en lokal arena i Kristiansand betyr tilbakemeldinger fra gjestene våre utrolig mye for teamet vårt. Dersom du har et lite minutt til overs, ville vi satt stor pris på om du delte en kort omtale.`}
      </Text>

      <Text style={paragraphStyle}>
        {isEn
          ? `The most valuable reviews often describe who you were, the occasion for your visit, and how you experienced it.`
          : `De mest verdifulle tilbakemeldingene beskriver gjerne hvem dere var, i hvilken anledning dere besøkte oss, og hvordan opplevelsen var.`}
      </Text>

      {/* Button Section */}
      <Section style={buttonContainerStyle}>
        {(platform === 'tripadvisor' || platform === 'both') && (
          <Section style={singleButtonWrapperStyle}>
            <Button href={TRIPADVISOR_URL} style={tripadvisorButtonStyle}>
              ★ {isEn ? 'Review us on Tripadvisor' : 'Legg igjen vurdering på Tripadvisor'}
            </Button>
            <Text style={microTextStyle}>
              {isEn ? 'Rated on Tripadvisor' : 'Anbefalt på Tripadvisor'}
            </Text>
          </Section>
        )}

        {(platform === 'google' || platform === 'both') && (
          <Section style={singleButtonWrapperStyle}>
            <Button href={GOOGLE_REVIEW_URL} style={googleButtonStyle}>
              ★ {isEn ? 'Write a review on Google' : 'Skriv en anmeldelse på Google'}
            </Button>
            <Text style={microTextStyle}>
              {isEn ? 'Google Maps Review' : 'Google Maps Anmeldelse'}
            </Text>
          </Section>
        )}
      </Section>

      <Hr style={dividerStyle} />

      <Text style={supportTextStyle}>
        {isEn ? (
          <>
            Had any issues or feedback you would like to share directly with us? Feel free to reply directly to this email or contact us at{' '}
            <Link href={`mailto:${adminEmail}`} style={linkStyle}>{adminEmail}</Link>.
          </>
        ) : (
          <>
            Var det noe som ikke sto til forventningene, eller har du innspill du ønsker å dele direkte med oss? Svar gjerne direkte på denne e-posten eller skriv til oss på{' '}
            <Link href={`mailto:${adminEmail}`} style={linkStyle}>{adminEmail}</Link>.
          </>
        )}
      </Text>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  margin: '28px 0 24px 0',
  textAlign: 'center',
};

const singleButtonWrapperStyle: React.CSSProperties = {
  margin: '0 0 16px 0',
};

const tripadvisorButtonStyle: React.CSSProperties = {
  backgroundColor: '#00aa6c',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '13px 26px',
  borderRadius: '8px',
  display: 'inline-block',
  boxShadow: '0 2px 4px rgba(0, 170, 108, 0.25)',
};

const googleButtonStyle: React.CSSProperties = {
  backgroundColor: '#1a73e8',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '13px 26px',
  borderRadius: '8px',
  display: 'inline-block',
  boxShadow: '0 2px 4px rgba(26, 115, 232, 0.25)',
};

const microTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#6b7280',
  margin: '6px 0 0 0',
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '28px 0 20px 0',
};

const supportTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: '1.5',
  margin: 0,
};

const linkStyle: React.CSSProperties = {
  color: '#7c3aed',
  textDecoration: 'none',
};

export default ReviewRequestEmail;
