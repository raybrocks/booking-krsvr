import * as React from 'react';
import { Heading, Text, Section, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

export type AdminBookingChangeType = 'time' | 'players' | 'names' | 'names_and_players' | 'multiple';

export interface AdminBookingUpdateEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  date: string;
  time: string;
  oldDate?: string;
  oldTime?: string;
  players?: number;
  oldPlayers?: number;
  experienceTitle?: string;
  oldExperienceTitle?: string;
  playerNames?: string[];
  changeType?: AdminBookingChangeType;
  adminEmail?: string;
}

export const AdminBookingUpdateEmail: React.FC<AdminBookingUpdateEmailProps> = ({
  firstName,
  lastName,
  email,
  date,
  time,
  oldDate,
  oldTime,
  players,
  oldPlayers,
  experienceTitle,
  oldExperienceTitle,
  playerNames = [],
  changeType = 'time',
  adminEmail = 'post@krsvr.no',
}) => {
  const isTimeChanged =
    changeType === 'time' ||
    (changeType === 'multiple' && Boolean((oldDate && oldDate !== date) || (oldTime && oldTime !== time)));

  const validPlayerNames = Array.isArray(playerNames)
    ? playerNames.map((n) => (typeof n === 'string' ? n.trim() : '')).filter(Boolean)
    : [];

  const getHeading = () => {
    switch (changeType) {
      case 'names':
        return 'Navneliste oppdatert av kunde';
      case 'names_and_players':
        return 'Navneliste og deltakere oppdatert';
      case 'players':
        return 'Deltakerantall endret av kunde';
      case 'time':
        return 'Tidspunkt endret av kunde';
      default:
        return 'Booking oppdatert av kunde';
    }
  };

  const getIntroText = () => {
    switch (changeType) {
      case 'names':
        return (
          <Text style={paragraphStyle}>
            Kunden <strong>{firstName} {lastName}</strong> ({email}) har lagt inn eller oppdatert navnelisten for bookingen sin. <em>Tidspunktet er uendret.</em>
          </Text>
        );
      case 'names_and_players':
        return (
          <Text style={paragraphStyle}>
            Kunden <strong>{firstName} {lastName}</strong> ({email}) har oppdatert navnelisten og endret antall deltakere{oldPlayers && oldPlayers !== players ? ` (fra ${oldPlayers} til ${players} pers)` : ''}. <em>Tidspunktet er uendret.</em>
          </Text>
        );
      case 'players':
        return (
          <Text style={paragraphStyle}>
            Kunden <strong>{firstName} {lastName}</strong> ({email}) har endret antall deltakere{oldPlayers && oldPlayers !== players ? ` fra ${oldPlayers} til ${players} pers` : ''}. <em>Tidspunktet er uendret.</em>
          </Text>
        );
      case 'time':
        return (
          <Text style={paragraphStyle}>
            Kunden <strong>{firstName} {lastName}</strong> ({email}) har flyttet bookingen sin til et nytt tidspunkt via kundeportalen.
          </Text>
        );
      default:
        return (
          <Text style={paragraphStyle}>
            Kunden <strong>{firstName} {lastName}</strong> ({email}) har oppdatert bookingen sin via kundeportalen.
          </Text>
        );
    }
  };

  return (
    <EmailLayout previewText={`${getHeading()}: ${firstName} ${lastName}`} adminEmail={adminEmail}>
      <Heading style={headingStyle}>{getHeading()}</Heading>

      {getIntroText()}

      <Section style={detailsTableStyle}>
        <Text style={detailRowStyle}><strong>Kunde:</strong> {firstName} {lastName}</Text>

        {isTimeChanged ? (
          <>
            {oldDate && oldTime && (
              <Text style={detailRowStyle}><strong>Tidligere tidspunkt:</strong> {oldDate} kl {oldTime}</Text>
            )}
            <Text style={detailRowStyle}><strong>Nytt tidspunkt:</strong> {date} kl {time}</Text>
          </>
        ) : (
          <Text style={detailRowStyle}><strong>Tidspunkt:</strong> {date} kl {time}</Text>
        )}

        {experienceTitle && (
          <Text style={detailRowStyle}>
            <strong>Opplevelse:</strong> {experienceTitle}
            {oldExperienceTitle && oldExperienceTitle !== experienceTitle ? ` (tidligere: ${oldExperienceTitle})` : ''}
          </Text>
        )}

        {players !== undefined && (
          <Text style={detailRowStyle}>
            <strong>Antall deltakere:</strong> {players} pers
            {oldPlayers && oldPlayers !== players ? ` (tidligere: ${oldPlayers} pers)` : ''}
          </Text>
        )}

        {validPlayerNames.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #fde047' }}>
            <Text style={{ ...detailRowStyle, fontWeight: '700', marginBottom: '4px' }}>
              Registrerte spillernavn ({validPlayerNames.length} av {players || validPlayerNames.length}):
            </Text>
            <Text style={{ ...detailRowStyle, margin: '2px 0', fontSize: '13px', lineHeight: '1.5' }}>
              {validPlayerNames.map((name, i) => `${i + 1}. ${name}`).join(' • ')}
            </Text>
          </div>
        )}
      </Section>

      <Button href="https://krsvr.no/admin" style={primaryButtonStyle}>
        Se oppdatering i Admin &rarr;
      </Button>
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
  margin: '0 0 12px 0',
};

const detailsTableStyle: React.CSSProperties = {
  backgroundColor: '#fefce8',
  borderLeft: '3px solid #ca8a04',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0 24px 0',
};

const detailRowStyle: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#713f12',
  margin: '6px 0',
  lineHeight: '1.4',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '10px 18px',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
};
