import * as React from 'react';
import { Html, Body, Head, Heading, Container, Text, Section } from '@react-email/components';

interface FeedbackEmailProps {
  rating: string;
  comments: string;
  phone: string;
}

export const FeedbackNotificationEmail: React.FC<FeedbackEmailProps> = ({
  rating,
  comments,
  phone,
}) => {
  const getRatingEmoji = (r: string) => {
    if (r === 'happy') return '😄 Happy';
    if (r === 'neutral') return '😐 Neutral';
    if (r === 'sad') return '😞 Sad';
    return r;
  };

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#333333' }}>Ny tilbakemelding mottatt</Heading>
          
          <Section style={{ margin: '20px 0' }}>
            <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>
              Opplevelse: {getRatingEmoji(rating)}
            </Text>
            
            {comments && (
              <Text style={{ fontSize: '15px', color: '#555555', backgroundColor: '#f4f4f5', padding: '15px', borderRadius: '5px' }}>
                <strong>Kommentar:</strong><br />
                {comments}
              </Text>
            )}

            {phone && (
              <Text style={{ fontSize: '15px', color: '#555555' }}>
                <strong>Telefonnummer for kontakt:</strong> {phone}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
