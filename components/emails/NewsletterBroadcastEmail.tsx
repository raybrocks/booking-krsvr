import * as React from 'react';
import { Heading, Text, Section, Link, Button, Img } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface FeaturedExperienceProp {
  name: string;
  type?: string;
  shortDescription?: string;
  picture?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface NewsletterBroadcastEmailProps {
  headline: string;
  preheader?: string;
  teaser: string;
  bodyParagraphs: string[];
  featuredExperience?: FeaturedExperienceProp | null;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  discountCode?: string;
  adminEmail?: string;
  unsubscribeUrl?: string;
}

export const NewsletterBroadcastEmail: React.FC<NewsletterBroadcastEmailProps> = ({
  headline = 'Nyheter fra KRS VR Arena',
  preheader,
  teaser = 'Vi utvider kapasiteten og lanserer nye opplevelser for høsten.',
  bodyParagraphs = [
    'Vi i KRS VR Arena jobber kontinuerlig med å tilby de beste VR- og Mixed Reality-opplevelsene i Kristiansand.',
    'Nå har vi oppgradert lokalene og lagt til rette for enda bedre tilpasning for grupper, teambuilding og private arrangementer.',
    'Bruk koden under ved bestilling for 15% rabatt på din neste spilløkt.'
  ],
  featuredExperience,
  ctaButtonText = 'Bestill tid på nett',
  ctaButtonUrl = 'https://krsvr.no/booking',
  discountCode = 'VR15',
  adminEmail = 'post@krsvr.no',
  unsubscribeUrl = '{{{RESEND_UNSUBSCRIBE_URL}}}',
}) => {
  const effectivePreview = preheader || teaser;

  return (
    <EmailLayout previewText={effectivePreview} adminEmail={adminEmail}>
      <Heading style={headingStyle}>{headline}</Heading>

      <Text style={teaserStyle}>{teaser}</Text>

      {bodyParagraphs.map((para, idx) => (
        <Text key={idx} style={paragraphStyle}>{para}</Text>
      ))}

      {/* Optional Featured Experience Card */}
      {featuredExperience && featuredExperience.name && (
        <Section style={featuredCardStyle}>
          {featuredExperience.picture && (
            <Img
              src={featuredExperience.picture}
              alt={featuredExperience.name}
              width="550"
              style={featuredImgStyle}
            />
          )}
          <div style={{ padding: '16px' }}>
            {featuredExperience.type && (
              <Text style={featuredTypeStyle}>
                {featuredExperience.type}
              </Text>
            )}
            <Heading as="h3" style={featuredTitleStyle}>
              {featuredExperience.name}
            </Heading>
            {featuredExperience.shortDescription && (
              <Text style={featuredDescStyle}>
                {featuredExperience.shortDescription}
              </Text>
            )}
            {featuredExperience.buttonUrl && (
              <Button
                href={featuredExperience.buttonUrl}
                style={secondaryButtonStyle}
              >
                {featuredExperience.buttonText || 'Se opplevelse og bestill'} &rarr;
              </Button>
            )}
          </div>
        </Section>
      )}

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

      <Text style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '28px', lineHeight: '1.5' }}>
        Du mottar denne e-posten fordi du har meldt deg på nyhetsbrevet eller booket hos oss.<br />
        <Link href={unsubscribeUrl} style={{ color: '#9ca3af', textDecoration: 'underline' }}>
          Meld deg av nyhetsbrevet her
        </Link>
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

const featuredCardStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  overflow: 'hidden',
  margin: '24px 0',
};

const featuredImgStyle: React.CSSProperties = {
  width: '100%',
  maxHeight: '260px',
  objectFit: 'cover',
  display: 'block',
};

const featuredTypeStyle: React.CSSProperties = {
  fontSize: '11px',
  textTransform: 'uppercase',
  fontWeight: '700',
  letterSpacing: '0.05em',
  color: '#7c3aed',
  margin: '0 0 6px 0',
};

const featuredTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 8px 0',
  lineHeight: '1.3',
};

const featuredDescStyle: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 16px 0',
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#18181b',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
};
