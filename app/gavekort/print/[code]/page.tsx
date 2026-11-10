import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintGiftCardClient from './PrintGiftCardClient';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  return {
    title: `Gavekort ${code} – KRS VR Arena`,
    robots: { index: false, follow: false },
  };
}

export default async function PrintGiftCardPage({ params }: Props) {
  const { code } = await params;
  const cleanCode = (code || '').trim().toUpperCase();

  const giftCard = await prisma.giftCard.findUnique({
    where: { code: cleanCode },
  });

  if (!giftCard || !giftCard.isPaid || giftCard.status === 'cancelled') {
    notFound();
  }

  const expiryFormatted = giftCard.expiresAt.toLocaleDateString('no-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <PrintGiftCardClient
      code={giftCard.code}
      targetPersons={giftCard.targetPersons}
      initialAmount={giftCard.initialAmount}
      balance={giftCard.balance}
      recipientName={giftCard.recipientName}
      senderName={giftCard.senderName}
      greetingMessage={giftCard.greetingMessage}
      expiresAt={expiryFormatted}
    />
  );
}
