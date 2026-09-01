import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Link, Hr } from '@react-email/components';

interface EmailLayoutProps {
  previewText?: string;
  children: React.ReactNode;
  adminEmail?: string;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  previewText,
  children,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <Html lang="no">
      <Head />
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={brandTitleStyle}>
              KRS <span style={{ color: '#9C39FF' }}>VR</span> ARENA
            </Text>
            {previewText && (
              <Text style={{ display: 'none', fontSize: '1px', color: '#ffffff', lineHeight: '1px', maxHeight: '0px', maxWidth: '0px', opacity: 0, overflow: 'hidden' }}>
                {previewText}
              </Text>
            )}
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hrStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              <strong>Krs VR Arena AS</strong> &bull; Org.nr: 936318878 MVA<br />
              Industrigata 12, 4632 Kristiansand, Norge<br />
              Telefon: <Link href="tel:+4740828302" style={linkStyle}>+47 408 28 302</Link> &bull; E-post: <Link href={`mailto:${adminEmail}`} style={linkStyle}>{adminEmail}</Link>
            </Text>
            <Section style={socialLinksStyle}>
              <Link href="https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8" style={socialLinkItem}>📍 Google Maps</Link>
              <Link href="https://krsvr.no/faq" style={socialLinkItem}>❓ FAQ</Link>
              <Link href="https://www.instagram.com/krs.vr.arena" style={socialLinkItem}>Instagram</Link>
              <Link href="https://www.tiktok.com/@krs.vr.arena" style={socialLinkItem}>TikTok</Link>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const mainStyle: React.CSSProperties = {
  backgroundColor: '#f6f7fb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '24px 12px',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#0f0f13',
  padding: '24px 32px',
  textAlign: 'left',
  borderBottom: '2px solid #9C39FF',
};

const brandTitleStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '800',
  letterSpacing: '1px',
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  padding: '32px',
  color: '#1f2937',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#f3f4f6',
  margin: '0',
};

const footerStyle: React.CSSProperties = {
  backgroundColor: '#fafafa',
  padding: '24px 32px',
  textAlign: 'center',
};

const footerTextStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
};

const socialLinksStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '8px',
};

const socialLinkItem: React.CSSProperties = {
  color: '#9C39FF',
  fontSize: '12px',
  fontWeight: '600',
  textDecoration: 'none',
  margin: '0 8px',
};

const linkStyle: React.CSSProperties = {
  color: '#9C39FF',
  textDecoration: 'none',
  fontWeight: '500',
};
