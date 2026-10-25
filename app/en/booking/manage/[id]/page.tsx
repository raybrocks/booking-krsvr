import { Metadata } from "next";
import ManageBookingClient from "@/app/booking/manage/[id]/ManageBookingClient";

export const metadata: Metadata = {
  title: "Manage Your Booking | KRS VR Arena",
  robots: { index: false, follow: false },
};

export default async function EnglishManageBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-light mb-8 text-center">Manage Your Booking</h1>
        <ManageBookingClient bookingId={id} locale="en" />
      </div>
    </div>
  );
}
