import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWeeklyAdminSummary, WeeklySummaryReportData } from '@/lib/email';
import { getBookingPaymentBreakdown, isSystemBlockedBooking } from '@/lib/booking-utils';
import { subDays, addDays, format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron Request
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Calculate Date Ranges in Europe/Oslo timezone using YYYY-MM-DD strings
    const todayOsloStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Oslo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const todayOsloDate = parseISO(`${todayOsloStr}T12:00:00Z`);
    const pastWeekStartDate = subDays(todayOsloDate, 7);
    const pastWeekEndDate = subDays(todayOsloDate, 1);
    const upcomingWeekStartDate = todayOsloDate;
    const upcomingWeekEndDate = addDays(todayOsloDate, 6);

    const pastStartStr = format(pastWeekStartDate, 'yyyy-MM-dd');
    const pastEndStr = format(pastWeekEndDate, 'yyyy-MM-dd');
    const upcomingStartStr = format(upcomingWeekStartDate, 'yyyy-MM-dd');
    const upcomingEndStr = format(upcomingWeekEndDate, 'yyyy-MM-dd');

    const periodLabelPast = `${format(pastWeekStartDate, 'd. MMMM', { locale: nb })} – ${format(pastWeekEndDate, 'd. MMMM', { locale: nb })}`;
    const periodLabelUpcoming = `${format(upcomingWeekStartDate, 'd. MMMM', { locale: nb })} – ${format(upcomingWeekEndDate, 'd. MMMM', { locale: nb })}`;

    // 3. Fetch Bookings for past and upcoming ranges
    const allBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: pastStartStr,
          lte: upcomingEndStr,
        },
        status: { in: ['confirmed', 'paid', 'completed', 'cancelled'] },
      },
      include: {
        experience: true,
        giftCardRedemptions: {
          include: {
            giftCard: {
              select: { code: true, paymentType: true },
            },
          },
        },
      },
    });

    let pastVippsPaid = 0;
    let pastTerminalPaid = 0;
    let pastGiftCardUsed = 0;
    let pastGoodwillUsed = 0;
    let pastExpectedCash = 0;
    let pastCompletedCount = 0;
    let pastTotalPlayers = 0;
    let pastCancelledCount = 0;
    const pastExpCounts: Record<string, number> = {};

    const rawUpcoming: any[] = [];
    let upcomingVippsPaid = 0;
    let upcomingTerminalPaid = 0;
    let upcomingGiftCardUsed = 0;
    let upcomingGoodwillUsed = 0;
    let upcomingExpectedCash = 0;
    let upcomingTotalPlayers = 0;

    allBookings.forEach((b: any) => {
      try {
        if (!b.date) return;

        // Skip system blocks (manually blocked slots and auto-generated shadow blocks)
        if (isSystemBlockedBooking(b)) {
          return;
        }

        const p = getBookingPaymentBreakdown(b);
        const players = b.players || 0;
        const expName = b.experience?.name || 'VR Opplevelse';

        // Past week stats (YYYY-MM-DD range in Europe/Oslo)
        if (b.date >= pastStartStr && b.date <= pastEndStr) {
          if (b.status === 'cancelled') {
            pastCancelledCount++;
          } else {
            pastCompletedCount++;
            pastTotalPlayers += players;
            pastVippsPaid += p.vippsPaid;
            pastTerminalPaid += p.terminalPaid;
            pastGiftCardUsed += p.paidGiftCardUsed;
            pastGoodwillUsed += p.goodwillGiftCardUsed;
            pastExpectedCash += p.remaining;
            pastExpCounts[expName] = (pastExpCounts[expName] || 0) + 1;
          }
        }

        // Upcoming week list (active confirmed/paid/completed bookings)
        if (b.date >= upcomingStartStr && b.date <= upcomingEndStr && b.status !== 'cancelled') {
          upcomingTotalPlayers += players;
          upcomingVippsPaid += p.vippsPaid;
          upcomingTerminalPaid += p.terminalPaid;
          upcomingGiftCardUsed += p.paidGiftCardUsed;
          upcomingGoodwillUsed += p.goodwillGiftCardUsed;
          upcomingExpectedCash += p.remaining;

          const bookingDate = parseISO(`${b.date}T12:00:00Z`);
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
            totalPrice: p.totalPrice,
            amountPaid: p.amountPaid,
            giftCardCode: b.giftCardCode || null,
            giftCardAmount: p.giftCardUsed,
            discountCode: b.discountCode || null,
            remainingCash: p.remaining,
            paymentType: b.paymentType || 'vipps',
            internalNotes: b.internalNotes || '',
            companyName: b.companyName || '',
            bookingType: b.bookingType || 'private',
          });
        }
      } catch (e) {
        console.error('Error parsing booking for weekly stats:', e);
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
        terminalPaid: pastTerminalPaid,
        giftCardUsed: pastGiftCardUsed,
        goodwillUsed: pastGoodwillUsed,
        expectedCash: pastExpectedCash,
        totalEstimatedRevenue: pastVippsPaid + pastTerminalPaid + pastGiftCardUsed + pastExpectedCash,
        cancelledCount: pastCancelledCount,
        popularExperiences,
      },
      upcomingWeek: {
        periodLabel: periodLabelUpcoming,
        bookingCount: rawUpcoming.length,
        totalPlayers: upcomingTotalPlayers,
        vippsPaid: upcomingVippsPaid,
        terminalPaid: upcomingTerminalPaid,
        giftCardUsed: upcomingGiftCardUsed,
        goodwillUsed: upcomingGoodwillUsed,
        expectedCash: upcomingExpectedCash,
        totalEstimatedRevenue: upcomingVippsPaid + upcomingTerminalPaid + upcomingGiftCardUsed + upcomingExpectedCash,
        bookings: rawUpcoming,
      },
    };

    // 4. Send the Email
    await sendWeeklyAdminSummary('', reportData);

    return NextResponse.json({ success: true, reportData });

  } catch (error) {
    console.error("Error in weekly cron summary:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
