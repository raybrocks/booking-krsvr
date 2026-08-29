import React from 'react';
import FeedbackForm from '@/components/FeedbackForm';

export const metadata = {
  title: 'Gi oss tilbakemelding | KRS VR Arena',
  description: 'Din mening er viktig for oss. Fortell oss om din opplevelse!',
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light text-white text-center mb-12 tracking-tight">
          Vi vil gjerne høre fra deg!
        </h1>
        <FeedbackForm />
      </div>
    </div>
  );
}
