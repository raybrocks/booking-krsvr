import { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: { absolute: 'KRS VR Arena | VR Escape Room & Arcade i Kristiansand' },
  description: 'Opplev eksklusive VR Escape Rooms, Mixed Reality og actionfylte skytespill i Kristiansand med full bevegelsesfrihet. Perfekt for vennegjengen, studenter, teambuilding, utdrikningslag og familiepakker i helger og ferier.',
  keywords: [
    'Mixed Reality Kristiansand',
    'VR Escape Room Kristiansand',
    'Escape Room Kristiansand',
    'VR Kristiansand',
    'VR Arcade Kristiansand',
    'Zombie Shooter Kristiansand',
    'Spatial Ops Kristiansand',
    'Teambuilding Kristiansand',
    'Utdrikningslag Kristiansand',
    'Bursdag Kristiansand',
    'Firmaevent Kristiansand',
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
    title: 'KRS VR Arena | VR Escape Room & Arcade i Kristiansand',
    description: 'Opplev eksklusive VR Escape Rooms, Mixed Reality og actionfylte opplevelser i Kristiansand for vennegjenger, studenter, teambuilding, utdrikningslag og familiepakker.',
    url: 'https://www.krsvr.no',
    siteName: 'KRS VR Arena',
    locale: 'nb_NO',
    type: 'website',
  }
};

export default function Page() {
  return <LandingPage />;
}
