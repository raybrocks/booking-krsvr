import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const includeAll = searchParams.get('all') === 'true' || searchParams.get('all') === '1';

    // Fetch bookings based on filter
    const [optInBookings, allValidBookings] = await Promise.all([
      prisma.booking.findMany({
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
      }),
      prisma.booking.findMany({
        where: {
          status: { not: 'cancelled' },
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const deduplicate = (list: typeof allValidBookings) => {
      const map = new Map<string, { email: string; firstName: string; lastName: string; createdAt: Date }>();
      list.forEach((b) => {
        const cleanEmail = (b.email || '').trim().toLowerCase();
        if (
          cleanEmail && 
          cleanEmail.includes('@') && 
          cleanEmail !== 'ingen@epost.no' && 
          !cleanEmail.includes('system@sperret') && 
          !cleanEmail.endsWith('@test.local') &&
          !map.has(cleanEmail)
        ) {
          map.set(cleanEmail, {
            email: cleanEmail,
            firstName: (b.firstName || '').trim(),
            lastName: (b.lastName || '').trim(),
            createdAt: b.createdAt,
          });
        }
      });
      return Array.from(map.values());
    };

    const optInList = deduplicate(optInBookings);
    const allList = deduplicate(allValidBookings);

    const subscribers = includeAll ? allList : optInList;

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
          'Content-Disposition': `attachment; filename="krsvr-kunder-${includeAll ? 'alle' : 'optin'}.csv"`,
        },
      });
    }

    return NextResponse.json({
      totalCount: subscribers.length,
      optInCount: optInList.length,
      allBookingsCount: allList.length,
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

export async function POST(_req: NextRequest) {
  try {
    const { addContactToNewsletter, DEFAULT_RESEND_SEGMENT_ID } = await import('@/lib/email');

    // Hent alle gyldige bookinger som ikke er kansellert
    const bookings = await prisma.booking.findMany({
      where: {
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

    const map = new Map<string, { email: string; firstName: string; lastName: string }>();
    bookings.forEach((b) => {
      const cleanEmail = (b.email || '').trim().toLowerCase();
      if (
        cleanEmail && 
        cleanEmail.includes('@') && 
        cleanEmail !== 'ingen@epost.no' && 
        !cleanEmail.includes('system@sperret') && 
        !cleanEmail.endsWith('@test.local') &&
        !map.has(cleanEmail)
      ) {
        map.set(cleanEmail, {
          email: cleanEmail,
          firstName: (b.firstName || '').trim(),
          lastName: (b.lastName || '').trim(),
        });
      }
    });

    const uniqueCustomers = Array.from(map.values());
    let synced = 0;
    let failed = 0;

    for (const customer of uniqueCustomers) {
      try {
        const res = await addContactToNewsletter(customer.email, customer.firstName, customer.lastName);
        if (res) {
          synced++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`Failed to sync customer ${customer.email}:`, err);
        failed++;
      }
    }

    const targetSegmentId = process.env.RESEND_SEGMENT_ID || DEFAULT_RESEND_SEGMENT_ID;

    return NextResponse.json({
      success: true,
      totalCustomers: uniqueCustomers.length,
      synced,
      failed,
      segmentId: targetSegmentId,
    });
  } catch (error: any) {
    console.error('Error syncing subscribers to Resend:', error);
    return NextResponse.json(
      { error: 'Kunne ikke synkronisere kontakter', details: error.message },
      { status: 500 }
    );
  }
}
