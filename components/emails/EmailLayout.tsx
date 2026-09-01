import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Link, Hr, Img } from '@react-email/components';

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
          {/* Clean Website Header */}
          <Section style={headerStyle}>
            <Link href="https://krsvr.no" style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Img
                src="https://krsvr.no/krsvrarena_logo_sort.png"
                alt="KRS VR ARENA"
                width="140"
                height="34"
                style={logoImgStyle}
              />
            </Link>
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
              Industrigata 12, 4632 Kristiansand<br />
              Telefon: <Link href="tel:+4740828302" style={linkStyle}>+47 408 28 302</Link> &bull; E-post: <Link href={`mailto:${adminEmail}`} style={linkStyle}>{adminEmail}</Link>
            </Text>
            <Section style={socialLinksStyle}>
              <Link href="https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8" style={socialLinkItem}>Google Maps</Link>
              <Link href="https://krsvr.no/faq" style={socialLinkItem}>Ofte stilte spørsmål (FAQ)</Link>
              <Link href="https://krsvr.no" style={socialLinkItem}>krsvr.no</Link>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const mainStyle: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '32px 12px',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '28px 32px 20px 32px',
  textAlign: 'left',
  borderBottom: '1px solid #f0f0f2',
};

const logoImgStyle: React.CSSProperties = {
  display: 'block',
  maxWidth: '140px',
  height: 'auto',
  border: '0',
  outline: 'none',
};

const contentStyle: React.CSSProperties = {
  padding: '32px',
  color: '#1f2937',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#f1f2f4',
  margin: '0',
};

const footerStyle: React.CSSProperties = {
  backgroundColor: '#fafbfc',
  padding: '24px 32px',
  textAlign: 'center',
};

const footerTextStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0 0 10px 0',
};

const socialLinksStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '4px',
};

const socialLinkItem: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '500',
  textDecoration: 'underline',
  margin: '0 8px',
};

const linkStyle: React.CSSProperties = {
  color: '#7c3aed',
  textDecoration: 'none',
  fontWeight: '500',
};
