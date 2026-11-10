import React from 'react';
import type { Metadata } from 'next';
import GiftCardPurchaseView from '@/components/GiftCardPurchaseView';

export const metadata: Metadata = {
  title: 'Kjøp Gavekort på VR-opplevelser | KRS VR Arena Kristiansand',
  description:
    'Gi en opplevelse som huskes. Kjøp digitalt gavekort på VR Escape Room, VR Arcade og teambuilding i Kristiansand. Umiddelbar levering til din e-post og enkel betaling med Vipps.',
  alternates: {
    canonical: 'https://krsvr.no/gavekort',
  },
  openGraph: {
    title: 'Gavekort på VR-opplevelser i Kristiansand | KRS VR Arena',
    description:
      'Den perfekte gaven til bursdag, jubileum eller vennegjengen. Kjøp gavekort for 2–10 personer med umiddelbar levering og enkel betaling med Vipps.',
    url: 'https://krsvr.no/gavekort',
    siteName: 'KRS VR Arena',
    locale: 'nb_NO',
    type: 'website',
  },
};

export default function GiftCardPage() {
  return <GiftCardPurchaseView />;
}
