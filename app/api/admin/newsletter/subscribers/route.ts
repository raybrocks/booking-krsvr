import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    // Fetch all bookings with acceptedNewsletter = true
    const bookings = await prisma.booking.findMany({
      where: {
        acceptedNewsletter: true,
        status: { not: 'cancelled' },
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Deduplicate by email
    const map = new Map<string, { email: string; firstName: string; lastName: string; createdAt: Date }>();
    bookings.forEach((b) => {
      const cleanEmail = (b.email || '').trim().toLowerCase();
      if (cleanEmail && !cleanEmail.includes('system@sperret') && !map.has(cleanEmail)) {
        map.set(cleanEmail, {
          email: cleanEmail,
          firstName: (b.firstName || '').trim(),
          lastName: (b.lastName || '').trim(),
          createdAt: b.createdAt,
        });
      }
    });

    const subscribers = Array.from(map.values());

    if (format === 'csv') {
      const csvRows = [
        'email,first_name,last_name,registered_at',
        ...subscribers.map((s) => {
          const esc = (val: string) => `"${val.replace(/"/g, '""')}"`;
          return `${esc(s.email)},${esc(s.firstName)},${esc(s.lastName)},"${s.createdAt.toISOString()}"`;
        }),
      ];

      const csvContent = csvRows.join('\r\n');
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="krsvr-nyhetsbrev-abonnenter.csv"',
        },
      });
    }

    return NextResponse.json({
      totalCount: subscribers.length,
      subscribers,
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente abonnenter', details: error.message },
      { status: 500 }
    );
  }
}
