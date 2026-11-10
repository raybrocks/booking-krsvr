import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import GiftCardReceiptClient from './GiftCardReceiptClient';

export const metadata: Metadata = {
  title: 'Kvittering for Gavekort | KRS VR Arena',
  robots: { index: false, follow: false },
};

export default function GiftCardReceiptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Laster kvittering...</div>}>
      <GiftCardReceiptClient />
    </Suspense>
  );
}
