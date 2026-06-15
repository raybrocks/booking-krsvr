import { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: { absolute: 'KRS VR Arena | VR Escape Room & Arcade i Kristiansand' },
  description: 'Opplev eksklusive VR Escape Rooms, skytespill og eventyr i Kristiansand med full bevegelsesfrihet. Løs oppdrag, koder eller konkurrer i lagspill. Perfekt for venner, bursdag, utdrikningslag og teambuilding.',
  keywords: [
    'VR Kristiansand',
    'Escape Room',
    'Escape Room Kristiansand',
    'Virtual Reality Kristiansand',
    'Teambuilding Kristiansand',
    'Utdrikningslag Kristiansand',
    'Barnebursdag Kristiansand',
    'Firmafest Kristiansand'
  ],
  alternates: {
    canonical: 'https://www.krsvr.no',
  },
  openGraph: {
    title: 'KRS VR Arena | VR Escape Room & Arcade i Kristiansand',
    description: 'Opplev eksklusive VR Escape Rooms, skytespill og eventyr i Kristiansand med full bevegelsesfrihet.',
    url: 'https://www.krsvr.no',
    siteName: 'KRS VR Arena',
    locale: 'nb_NO',
    type: 'website',
  }
};

export default function Page() {
  return <LandingPage />;
}
