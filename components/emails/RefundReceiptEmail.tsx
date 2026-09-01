import * as React from 'react';
import { Heading, Text, Section, Link } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface RefundReceiptEmailProps {
  firstName: string;
  lastName: string;
  refundAmount: number;
  paymentRef: string;
  date: string;
  time: string;
  adminEmail?: string;
}

export const RefundReceiptEmail: React.FC<RefundReceiptEmailProps> = ({
  firstName,
  lastName,
  refundAmount,
  paymentRef,
  date,
  time,
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={`Kvittering for refusjon - NOK ${refundAmount}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Kvittering for Refusjon 💳</Heading>

      <Text style={paragraphStyle}>Hei {firstName} {lastName},</Text>
      <Text style={paragraphStyle}>
        Vi har gjennomført en refusjon via Vipps for din bestilling ({date} kl {time}).
      </Text>

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Refundert beløp:</strong> NOK {refundAmount}</Text>
        <Text style={detailRowStyle}><strong>Vipps Referanse:</strong> {paymentRef}</Text>
        <Text style={detailRowStyle}><strong>Dato for refusjon:</strong> {new Date().toLocaleDateString('no-NO')}</Text>
      </Section>

      <Text style={paragraphStyle}>
        Beløpet overføres automatisk tilbake til betalingskortet / kontoen som ble benyttet i Vipps. Dette tar normalt 1-3 virkedager avhengig av banken din.
      </Text>

      <Text style={footnoteStyle}>
        Har du spørsmål rundt refusjonen, ta gjerne kontakt med oss på <Link href={`mailto:${adminEmail}`} style={{ color: '#9C39FF' }}>{adminEmail}</Link>.
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

const detailsTableStyle: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #dcfce7',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#166534',
  margin: '6px 0',
};

const footnoteStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  marginTop: '24px',
};
