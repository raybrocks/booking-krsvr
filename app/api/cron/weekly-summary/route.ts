import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWeeklyAdminSummary } from '@/lib/email';
import { startOfDay, endOfDay, subDays, addDays, format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron Request
    // Vercel sends the Authorization header with a Bearer token matching CRON_SECRET
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Calculate Date Ranges
    const today = new Date();
    // Past 7 days
    const pastWeekStart = startOfDay(subDays(today, 7));
    const pastWeekEnd = endOfDay(subDays(today, 1));
    
    // Upcoming 7 days
    const upcomingWeekStart = startOfDay(today);
    const upcomingWeekEnd = endOfDay(addDays(today, 6));

    // We can filter the past week's bookings based on their creation date or their experience date.
    // The prompt says "Uken som gikk: Total omsetning denne uken... antall gjennomførte opplevelser"
    // To match "gjennomførte opplevelser" we look at bookings where the 'date' falls in the past 7 days.
    // Wait, let's fetch all confirmed bookings and parse their dates.
    
    const allBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['confirmed', 'paid'] }
      },
      include: {
        experience: true
      }
    });

    let totalRevenue = 0;
    let vippsRevenue = 0;
    let manualRevenue = 0;
    let numExperiences = 0;
    const upcomingBookings: any[] = [];

    allBookings.forEach((b: any) => {
      try {
        if (!b.date) return;
        const bookingDate = new Date(b.date);
        
        // Past week stats
        if (bookingDate >= pastWeekStart && bookingDate <= pastWeekEnd) {
          numExperiences++;
          totalRevenue += (b.totalPrice || 0);
          if (b.paymentType === 'vipps') {
            vippsRevenue += (b.totalPrice || 0);
          } else if (b.paymentType === 'manual') {
            manualRevenue += (b.totalPrice || 0);
          }
        }

        // Upcoming week list
        if (bookingDate >= upcomingWeekStart && bookingDate <= upcomingWeekEnd) {
          // Add detailed info
          // Format date string nicely for the email e.g. "mandag 12. juni"
          const niceDate = format(bookingDate, 'EEEE d. MMMM', { locale: nb });
          upcomingBookings.push({
            ...b,
            dateNice: niceDate
          });
        }
      } catch (e) {
        console.error("Error parsing booking date for stats:", e);
      }
    });

    // Sort upcoming bookings by date + time
    upcomingBookings.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });

    // Format the date strings back into the object for email template
    const formattedUpcoming = upcomingBookings.map(b => ({
      ...b,
      date: b.dateNice || b.date
    }));

    const stats = {
      totalRevenue,
      vippsRevenue,
      manualRevenue,
      numExperiences
    };

    // 3. Send the Email
    await sendWeeklyAdminSummary("post@krsvr.no", stats, formattedUpcoming);

    return NextResponse.json({ success: true, stats, upcomingBookings: formattedUpcoming });

  } catch (error) {
    console.error("Error in weekly cron summary:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
