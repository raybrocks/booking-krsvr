import * as React from 'react';
import { Heading, Text, Section, Link, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export interface WeeklyBookingItem {
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  players: number;
  experienceTitle: string;
  paymentType: string;
}

export interface WeeklySummaryEmailProps {
  weekNumber: number;
  totalRevenue: number;
  vippsRevenue: number;
  manualRevenue: number;
  bookingCount: number;
  upcomingBookings: WeeklyBookingItem[];
  adminEmail?: string;
}

export const WeeklySummaryEmail: React.FC<WeeklySummaryEmailProps> = ({
  weekNumber,
  totalRevenue,
  vippsRevenue,
  manualRevenue,
  bookingCount,
  upcomingBookings = [],
  adminEmail = 'post@krsvr.no',
}) => {
  return (
    <EmailLayout previewText={`Ukentlig rapport for uke ${weekNumber}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>Ukentlig Oppsummering & Vaktplan 📊</Heading>

      <Text style={paragraphStyle}>
        Her er oppsummeringen for <strong>Uke {weekNumber}</strong> med resultater og plan for de neste 7 dagene:
      </Text>

      {/* Finansoversikt */}
      <Text style={subheadingStyle}>Økonomi & Nøkkeltall</Text>
      <Section style={kpiGridStyle}>
        <Section style={kpiCardStyle}>
          <Text style={kpiLabelStyle}>Total Omsetning</Text>
          <Text style={kpiValueStyle}>NOK {totalRevenue.toLocaleString('no-NO')}</Text>
        </Section>
        <Section style={kpiCardStyle}>
          <Text style={kpiLabelStyle}>Antall Bookinger</Text>
          <Text style={kpiValueStyle}>{bookingCount} stk</Text>
        </Section>
      </Section>

      <Section style={detailsBoxStyle}>
        <Text style={detailRowStyle}><strong>Hvorav Vipps:</strong> NOK {vippsRevenue.toLocaleString('no-NO')}</Text>
        <Text style={detailRowStyle}><strong>Hvorav Faktura/Manuell:</strong> NOK {manualRevenue.toLocaleString('no-NO')}</Text>
      </Section>

      {/* Kommende 7 dager */}
      <Text style={subheadingStyle}>Kommende 7 Dager ({upcomingBookings.length} bookinger)</Text>
      {upcomingBookings.length === 0 ? (
        <Text style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>Ingen bookinger registrert for neste uke enda.</Text>
      ) : (
        <Section style={{ margin: '12px 0 24px 0' }}>
          {upcomingBookings.map((b, idx) => (
            <Section key={idx} style={bookingRowStyle}>
              <Text style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                📅 {b.date} kl. {b.time} &bull; {b.experienceTitle}
              </Text>
              <Text style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {b.firstName} {b.lastName} ({b.players} spillere) &bull; <span style={{ color: '#9C39FF' }}>{b.paymentType}</span>
              </Text>
            </Section>
          ))}
        </Section>
      )}

      <Button href="https://krsvr.no/admin" style={primaryButtonStyle}>
        Gå til Vaktliste & Admin &rarr;
      </Button>
    </EmailLayout>
  );
};

const headingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#9C39FF',
  margin: '0 0 14px 0',
};

const subheadingStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#111827',
  margin: '20px 0 8px 0',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '4px',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '0 0 12px 0',
};

const kpiGridStyle: React.CSSProperties = {
  margin: '12px 0',
};

const kpiCardStyle: React.CSSProperties = {
  backgroundColor: '#faf5ff',
  border: '1px solid #e9d5ff',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '6px 0',
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b21a8',
  textTransform: 'uppercase',
  fontWeight: '600',
  margin: 0,
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#581c87',
  margin: '4px 0 0 0',
};

const detailsBoxStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '8px 0 16px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#4b5563',
  margin: '4px 0',
};

const bookingRowStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '10px 14px',
  margin: '8px 0',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#9C39FF',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
};
