import { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: { absolute: 'KRS VR Arena | Wireless Free-Roam VR & Escape Rooms in Kristiansand' },
  description: 'Experience wireless free-roam VR Escape Rooms, Action Strategy (Tactical Arena), and family-friendly VR adventures in our 300 sqm arena in Kristiansand, Norway. 5 minutes from the ferry port. 0 NOK upfront online.',
  keywords: [
    'VR Kristiansand',
    'Things to do in Kristiansand',
    'Indoor activities Kristiansand',
    'Rainy day activities Kristiansand',
    'Family activities Kristiansand',
    'VR Escape Room Kristiansand',
    'Escape Room Kristiansand',
    'Mixed Reality Kristiansand',
    'Tactical Arena Kristiansand',
    'Zombie Shooter Kristiansand',
    'Team building Kristiansand',
    'Bachelor party Kristiansand',
    'Bachelorette party Kristiansand',
    'Southern Norway family attractions'
  ],
  alternates: {
    canonical: 'https://www.krsvr.no/en',
    languages: {
      'nb-NO': 'https://www.krsvr.no',
      'en': 'https://www.krsvr.no/en',
      'de': 'https://www.krsvr.no/de',
      'nl': 'https://www.krsvr.no/nl',
      'x-default': 'https://www.krsvr.no/en',
    },
  },
  openGraph: {
    title: 'KRS VR Arena | Wireless Free-Roam VR & Escape Rooms in Kristiansand',
    description: 'Walk freely inside virtual worlds together with family, friends, or colleagues in our 300 sqm indoor arena at Lund in Kristiansand. Reserve online with 0 NOK upfront.',
    url: 'https://www.krsvr.no/en',
    siteName: 'KRS VR Arena',
    locale: 'en_US',
    type: 'website',
  }
};

export default function EnglishHomePage() {
  return <LandingPage locale="en" />;
}
