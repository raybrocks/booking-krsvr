import ManageBookingClient from './ManageBookingClient';

export default async function ManageBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-light mb-8 text-center">Administrer din booking</h1>
        <ManageBookingClient bookingId={id} />
      </div>
    </div>
  );
}
