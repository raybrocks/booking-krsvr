import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface NewsletterBroadcastEmailProps {
  headline: string;
  teaser: string;
  bodyParagraphs: string[];
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  discountCode?: string;
  adminEmail?: string;
}

export const NewsletterBroadcastEmail: React.FC<NewsletterBroadcastEmailProps> = ({
  headline = 'Nyheter fra KRS VR Arena',
  teaser = 'Vi utvider kapasiteten og lanserer nye opplevelser for høsten.',
  bodyParagraphs = [
    'Vi i KRS VR Arena jobber kontinuerlig med å tilby de beste VR- og Mixed Reality-opplevelsene i Kristiansand.',
    'Nå har vi oppgradert lokalene og lagt til rette for enda bedre tilpasning for grupper, teambuilding og private arrangementer.',
    'Bruk koden under ved bestilling for 15% rabatt på din neste spilløkt.'
  ],
  ctaButtonText = 'Bestill tid på nett',
  ctaButtonUrl = 'https://krsvr.no/booking',
  discountCode = 'VR15',
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={teaser} adminEmail={adminEmail}>
      <Heading style={headingStyle}>{headline}</Heading>

      <Text style={teaserStyle}>{teaser}</Text>

      {bodyParagraphs.map((para, idx) => (
        <Text key={idx} style={paragraphStyle}>{para}</Text>
      ))}

      {discountCode && (
        <Section style={discountBoxStyle}>
          <Text style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>
            Rabattkode:
          </Text>
          <Text style={discountCodeStyle}>{discountCode}</Text>
          <Text style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
            Oppgi koden i kassen på <Link href="https://krsvr.no/booking" style={{ color: '#7c3aed' }}>krsvr.no</Link>
          </Text>
        </Section>
      )}

      {ctaButtonText && ctaButtonUrl && (
        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={ctaButtonUrl} style={primaryButtonStyle}>
            {ctaButtonText} &rarr;
          </Button>
        </Section>
      )}

      <Text style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '24px' }}>
        Du mottar denne e-posten fordi du har meldt deg på nyhetsbrevet eller booket hos oss.<br />
        <Link href="https://krsvr.no/unsubscribe" style={{ color: '#9ca3af', textDecoration: 'underline' }}>Meld deg av nyhetsbrevet</Link>
      </Text>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 10px 0',
  lineHeight: '1.3',
};

const teaserStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.5',
  color: '#4b5563',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 12px 0',
};

const discountBoxStyle: React.CSSProperties = {
  backgroundColor: '#fbfbfe',
  border: '1.5px dashed #c4b5fd',
  borderRadius: '10px',
  padding: '16px',
  margin: '20px 0',
  textAlign: 'center',
};

const discountCodeStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '800',
  letterSpacing: '2px',
  color: '#7c3aed',
  fontFamily: 'monospace',
  margin: 0,
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
};
