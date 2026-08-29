import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWeeklyAdminSummary, WeeklySummaryReportData } from '@/lib/email';
import { startOfDay, endOfDay, subDays, addDays, format } from 'date-fns';
import { nb } from 'date-fns/locale';

export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron Request
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Calculate Date Ranges (Past 7 full days and Upcoming 7 days)
    const today = new Date();
    const pastWeekStart = startOfDay(subDays(today, 7));
    const pastWeekEnd = endOfDay(subDays(today, 1));
    
    const upcomingWeekStart = startOfDay(today);
    const upcomingWeekEnd = endOfDay(addDays(today, 6));

    const periodLabelPast = `${format(pastWeekStart, 'd. MMMM', { locale: nb })} – ${format(pastWeekEnd, 'd. MMMM', { locale: nb })}`;
    const periodLabelUpcoming = `${format(upcomingWeekStart, 'd. MMMM', { locale: nb })} – ${format(upcomingWeekEnd, 'd. MMMM', { locale: nb })}`;

    // 3. Fetch Bookings for past and upcoming ranges
    const allBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['confirmed', 'paid', 'cancelled'] }
      },
      include: {
        experience: true
      }
    });

    let pastVippsPaid = 0;
    let pastExpectedCash = 0;
    let pastCompletedCount = 0;
    let pastTotalPlayers = 0;
    let pastCancelledCount = 0;
    const pastExpCounts: Record<string, number> = {};

    const rawUpcoming: any[] = [];
    let upcomingVippsPaid = 0;
    let upcomingExpectedCash = 0;
    let upcomingTotalPlayers = 0;

    allBookings.forEach((b: any) => {
      try {
        if (!b.date) return;
        
        // Skip auto-generated shadow bookings
        if (b.internalNotes && b.internalNotes.includes('Auto-generert tids-blokk')) {
          return;
        }
        
        const bookingDate = new Date(b.date);
        const totalPrice = b.totalPrice || 0;
        const amountPaid = b.amountPaid || 0;
        const remaining = Math.max(0, totalPrice - amountPaid);
        const players = b.players || 0;
        const expName = b.experience?.name || 'VR Opplevelse';

        // Past week stats
        if (bookingDate >= pastWeekStart && bookingDate <= pastWeekEnd) {
          if (b.status === 'cancelled') {
            pastCancelledCount++;
          } else {
            pastCompletedCount++;
            pastTotalPlayers += players;
            pastVippsPaid += amountPaid;
            pastExpectedCash += remaining;
            pastExpCounts[expName] = (pastExpCounts[expName] || 0) + 1;
          }
        }

        // Upcoming week list (active confirmed/paid bookings)
        if (bookingDate >= upcomingWeekStart && bookingDate <= upcomingWeekEnd && b.status !== 'cancelled') {
          upcomingTotalPlayers += players;
          upcomingVippsPaid += amountPaid;
          upcomingExpectedCash += remaining;

          const niceDate = format(bookingDate, 'EEEE d. MMMM', { locale: nb });
          rawUpcoming.push({
            id: b.id,
            dateNice: niceDate.charAt(0).toUpperCase() + niceDate.slice(1),
            dateRaw: b.date,
            time: b.time || '00:00',
            duration: b.duration || 90,
            firstName: b.firstName || '',
            lastName: b.lastName || '',
            email: b.email || '',
            phone: b.phone || '',
            players,
            experienceName: expName,
            totalPrice,
            amountPaid,
            remainingCash: remaining,
            paymentType: b.paymentType || 'vipps',
            internalNotes: b.internalNotes || '',
            companyName: b.companyName || '',
            bookingType: b.bookingType || 'private'
          });
        }
      } catch (e) {
        console.error("Error parsing booking for weekly stats:", e);
      }
    });

    // Sort upcoming bookings chronologically by date and time
    rawUpcoming.sort((a, b) => {
      const dateTimeA = new Date(`${a.dateRaw}T${a.time}`);
      const dateTimeB = new Date(`${b.dateRaw}T${b.time}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });

    // Sort popular experiences
    const popularExperiences = Object.entries(pastExpCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const pastAvgGroupSize = pastCompletedCount > 0 
      ? (pastTotalPlayers / pastCompletedCount).toFixed(1) 
      : '0';

    const reportData: WeeklySummaryReportData = {
      pastWeek: {
        periodLabel: periodLabelPast,
        completedBookingsCount: pastCompletedCount,
        totalPlayers: pastTotalPlayers,
        avgGroupSize: pastAvgGroupSize,
        vippsPaid: pastVippsPaid,
        expectedCash: pastExpectedCash,
        totalEstimatedRevenue: pastVippsPaid + pastExpectedCash,
        cancelledCount: pastCancelledCount,
        popularExperiences
      },
      upcomingWeek: {
        periodLabel: periodLabelUpcoming,
        bookingCount: rawUpcoming.length,
        totalPlayers: upcomingTotalPlayers,
        vippsPaid: upcomingVippsPaid,
        expectedCash: upcomingExpectedCash,
        totalEstimatedRevenue: upcomingVippsPaid + upcomingExpectedCash,
        bookings: rawUpcoming
      }
    };

    // 4. Send the Email
    await sendWeeklyAdminSummary('', reportData);

    return NextResponse.json({ success: true, reportData });

  } catch (error) {
    console.error("Error in weekly cron summary:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
