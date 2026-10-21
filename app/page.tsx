import { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: { absolute: 'KRS VR Arena | Kristiansands mest sosiale VR-opplevelser' },
  description: 'Opplev Kristiansands mest sosiale VR-opplevelser på 143 kvm arena. Samarbeid og latter i VR Escape Rooms, taktiske lagspill i Tactical Arena og gode fellesopplevelser for teambuilding, utdrikningslag, bursdag, venner og familie.',
  keywords: [
    'Mixed Reality Kristiansand',
    'VR Escape Room Kristiansand',
    'Escape Room Kristiansand',
    'VR Kristiansand',
    'VR Arcade Kristiansand',
    'Tactical Arena Kristiansand',
    'Action Strategi',
    'Zombie Shooter Kristiansand',
    'Spatial Ops Kristiansand',
    'Teambuilding Kristiansand',
    'Utdrikningslag Kristiansand',
    'Bursdag Kristiansand',
    'Firmaevent Kristiansand',
    'Sosial VR Kristiansand',
    'Innendørs aktivitet Kristiansand',
    'Ting å gjøre i Kristiansand',
    'Aktiviteter for studenter Kristiansand',
    'Ferieaktiviteter Kristiansand',
    'Familiepakke Kristiansand'
  ],
  alternates: {
    canonical: 'https://www.krsvr.no',
  },
  openGraph: {
    title: 'KRS VR Arena | Kristiansands mest sosiale VR-opplevelser',
    description: 'Opplev latter, samarbeid og felles opplevelser hos KRS VR Arena på Lund i Kristiansand. Full bevegelsesfrihet på 143 kvm arena for teambuilding, utdrikningslag, bursdag, venner og familie.',
    url: 'https://www.krsvr.no',
    siteName: 'KRS VR Arena',
    locale: 'nb_NO',
    type: 'website',
  }
};

export default function Page() {
  return <LandingPage />;
}
