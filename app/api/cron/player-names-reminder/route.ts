import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNameListDailyReminderEmail, sendAdminNameListReminderNotification } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 0. Verify Vercel Cron Request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Fetch settings to get configured reminder days
    let reminderDays = 3;
    try {
      const settingsDoc = await prisma.setting.findUnique({
        where: { key: 'general' }
      });
      if (settingsDoc && settingsDoc.value) {
        const val = settingsDoc.value as any;
        if (typeof val.nameListReminderDays === 'number' && val.nameListReminderDays > 0) {
          reminderDays = val.nameListReminderDays;
        }
      }
    } catch (e) {
      console.error("Failed to fetch settings for player names reminder:", e);
    }

    // 2. Determine dates in YYYY-MM-DD
    const now = new Date();
    // Using Oslo / local date string
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const targetDateObj = new Date(now);
    targetDateObj.setDate(targetDateObj.getDate() + reminderDays);
    const targetDateStr = `${targetDateObj.getFullYear()}-${String(targetDateObj.getMonth() + 1).padStart(2, '0')}-${String(targetDateObj.getDate()).padStart(2, '0')}`;

    // 3. Find all active bookings within the window
    const candidates = await prisma.booking.findMany({
      where: {
        status: { in: ['confirmed', 'paid', 'completed'] },
        players: { gt: 0 },
        date: {
          gte: todayStr,
          lte: targetDateStr,
        },
        parentBookingId: null, // exclude shadow blocks
      },
      include: {
        experience: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    const sentTo: any[] = [];
    const skipped: any[] = [];

    for (const booking of candidates) {
      // Ignore invalid or internal emails
      if (!booking.email || booking.email === 'ingen@epost.no' || booking.email.includes('@sperret')) {
        skipped.push({ id: booking.id, reason: 'No valid email' });
        continue;
      }

      // Check player names count
      const validNames = (booking.playerNames || []).filter(n => n && n.trim().length > 0);
      const isMissingNames = validNames.length < booking.players;

      if (!isMissingNames) {
        skipped.push({ id: booking.id, reason: 'Names already complete', namesCount: validNames.length, players: booking.players });
        continue;
      }

      // Check if already reminded today
      if (booking.lastReminderDate === todayStr) {
        skipped.push({ id: booking.id, reason: 'Already reminded today', lastReminderDate: booking.lastReminderDate });
        continue;
      }

      // Ensure manageToken exists
      let token = booking.manageToken;
      if (!token) {
        token = crypto.randomBytes(32).toString('hex');
        await prisma.booking.update({
          where: { id: booking.id },
          data: { manageToken: token }
        });
        booking.manageToken = token;
      }

      // Send reminder email
      const emailResult = await sendNameListDailyReminderEmail(booking);

      if (emailResult) {
        const newReminderCount = (booking.reminderCount || 0) + 1;

        // Update booking lastReminderDate and reminderCount
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            lastReminderDate: todayStr,
            reminderCount: { increment: 1 }
          }
        });

        // Send confirmation/notification to admin
        try {
          await sendAdminNameListReminderNotification(booking, {
            validNamesCount: validNames.length,
            reminderCount: newReminderCount
          });
        } catch (adminErr) {
          console.error("Failed to send admin notification for player names reminder:", adminErr);
        }

        sentTo.push({
          id: booking.id,
          name: `${booking.firstName} ${booking.lastName}`,
          email: booking.email,
          date: booking.date,
          time: booking.time,
          players: booking.players,
          namesCount: validNames.length,
          reminderCount: newReminderCount
        });
      } else {
        skipped.push({ id: booking.id, reason: 'Email send failed' });
      }
    }

    return NextResponse.json({
      success: true,
      today: todayStr,
      targetDate: targetDateStr,
      reminderDays,
      totalCandidates: candidates.length,
      sentCount: sentTo.length,
      sentTo,
      skippedCount: skipped.length,
      skipped
    });
  } catch (error: any) {
    console.error("Player names reminder cron error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
