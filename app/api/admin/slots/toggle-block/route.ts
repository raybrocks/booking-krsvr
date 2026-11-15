import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { date, time, times, block } = data;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const timesToProcess: string[] = Array.isArray(times) ? times : (time ? [time] : []);
    if (timesToProcess.length === 0) {
      return NextResponse.json({ error: 'At least one time slot is required' }, { status: 400 });
    }

    // Ensure a dedicated non-game system experience exists for manually blocked slots
    // (so blocked slots are never assigned to Abyss Vault or any active game)
    const SYSTEM_BLOCK_EXPERIENCE_ID = 'system-slot-block';
    await prisma.experience.upsert({
      where: { id: SYSTEM_BLOCK_EXPERIENCE_ID },
      update: {
        name: 'Manuelt sperret',
        type: 'System',
        isActive: false,
      },
      create: {
        id: SYSTEM_BLOCK_EXPERIENCE_ID,
        name: 'Manuelt sperret',
        shortDescription: 'Systemreservert tidsblokk for manuelt sperrede tidspunkt',
        type: 'System',
        isActive: false,
        maxPlayers: 0,
      },
    });

    const results: any[] = [];

    for (const t of timesToProcess) {
      if (block) {
        // Block the slot
        const existing = await prisma.booking.findFirst({
          where: {
            date,
            time: t
          }
        });

        if (existing) {
          if (existing.status === 'cancelled' || existing.status === 'terminated') {
            const hasFinancialHistory = await prisma.receipt.findFirst({
              where: {
                bookingId: existing.id,
                status: { in: ['CAPTURED', 'REFUNDED'] },
              },
            });
            if (hasFinancialHistory || (existing.amountPaid || 0) > 0) {
              await prisma.booking.update({
                where: { id: existing.id },
                data: { time: `${existing.time} (kansellert-${existing.id.slice(-4)})` },
              });
            } else {
              await prisma.booking.delete({ where: { id: existing.id } });
            }
          } else if (existing.bookingType !== 'system' && !existing.email?.includes('system@sperret')) {
            // Real customer booking exists
            results.push({ time: t, status: 'already_customer_booked', bookingId: existing.id });
            continue;
          } else {
            // Already blocked
            results.push({ time: t, status: 'already_blocked', bookingId: existing.id });
            continue;
          }
        }

        const newBlock = await prisma.booking.create({
          data: {
            experienceId: SYSTEM_BLOCK_EXPERIENCE_ID,
            date,
            time: t,
            players: 0,
            firstName: 'Sperret',
            lastName: '(Manuelt sperret)',
            email: 'system@sperret',
            phone: '',
            acceptedTerms: true,
            paymentType: 'system',
            totalPrice: 0,
            status: 'confirmed',
            bookingType: 'system',
            duration: 90,
            manageToken: crypto.randomBytes(32).toString('hex'),
            internalNotes: 'Manuelt sperret fra Special Dates & Exceptions'
          }
        });

        results.push({ time: t, status: 'blocked', bookingId: newBlock.id });
      } else {
        // Unblock the slot
        const existingBlocks = await prisma.booking.findMany({
          where: {
            date,
            time: t,
            OR: [
              { bookingType: 'system' },
              { email: 'system@sperret' },
              { firstName: 'Sperret' }
            ]
          }
        });

        for (const blk of existingBlocks) {
          await prisma.booking.delete({ where: { id: blk.id } });
        }

        results.push({ time: t, status: 'unblocked' });
      }
    }

    return NextResponse.json({ success: true, date, results });
  } catch (error: any) {
    console.error('Toggle slot block error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle slot block' },
      { status: 500 }
    );
  }
}
