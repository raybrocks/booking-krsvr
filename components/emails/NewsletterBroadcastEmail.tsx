import * as React from 'react';
import { Heading, Text, Section, Link, Button, Img } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface NewsletterBroadcastEmailProps {
  headline: string;
  teaser: string;
  bodyParagraphs: string[];
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  bannerImageUrl?: string;
  discountCode?: string;
  adminEmail?: string;
}

export const NewsletterBroadcastEmail: React.FC<NewsletterBroadcastEmailProps> = ({
  headline = 'Eksklusiv Nyhet fra KRS VR Arena! 🚀',
  teaser = 'Vi lanserer nye opplevelser og gir deg en eksklusiv rabattkode denne helgen.',
  bodyParagraphs = [
    'Vi i KRS VR Arena oppdaterer stadig vårt utvalg av immersive opplevelser og Mixed Reality-spill.',
    'Nå har vi gleden av å introdusere nye moduser og utvidet kapasitet for større grupper, teambuilding og bursdager!',
    'Bruk rabattkoden under ved din neste bestilling for å sikre deg 15% rabatt på alle helgebookinger.'
  ],
  ctaButtonText = 'Bestill din opplevelse nå',
  ctaButtonUrl = 'https://krsvr.no/booking',
  discountCode = 'VRVIP15',
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
          <Text style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', color: '#7e22ce', fontWeight: '700' }}>
            Din Eksklusive Rabattkode:
          </Text>
          <Text style={discountCodeStyle}>{discountCode}</Text>
          <Text style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6b21a8' }}>
            Oppgi koden i kassen på <Link href="https://krsvr.no/booking" style={{ color: '#7e22ce' }}>krsvr.no</Link>
          </Text>
        </Section>
      )}

      {ctaButtonText && ctaButtonUrl && (
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button href={ctaButtonUrl} style={primaryButtonStyle}>
            {ctaButtonText} &rarr;
          </Button>
        </Section>
      )}

      <Text style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '24px' }}>
        Du mottar denne e-posten fordi du har meldt deg på nyhetsbrevet vårt eller booket en opplevelse hos oss.<br />
        <Link href="https://krsvr.no/unsubscribe" style={{ color: '#9ca3af', textDecoration: 'underline' }}>Meld deg av nyhetsbrevet</Link>
      </Text>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#111827',
  margin: '0 0 12px 0',
  lineHeight: '1.3',
};

const teaserStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#9C39FF',
  fontWeight: '600',
  margin: '0 0 20px 0',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 14px 0',
};

const discountBoxStyle: React.CSSProperties = {
  backgroundColor: '#faf5ff',
  border: '2px dashed #c084fc',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center',
};

const discountCodeStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '900',
  letterSpacing: '3px',
  color: '#9C39FF',
  fontFamily: 'monospace',
  margin: 0,
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#9C39FF',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '14px 28px',
  fontSize: '15px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(156, 57, 255, 0.25)',
};
