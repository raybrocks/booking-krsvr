export interface BookingPaymentBreakdown {
  totalPrice: number;
  netRevenue: number;
  amountPaid: number;
  giftCardUsed: number;
  paidGiftCardUsed: number;
  goodwillGiftCardUsed: number;
  vippsPaid: number;
  terminalPaid: number;
  remaining: number;
  settledTotal: number;
  status: string;
  isRefunded: boolean;
  isCancelled: boolean;
  isPending: boolean;
  isTerminal: boolean;
  isSystem: boolean;
}

export function isSystemBlockedBooking(booking: {
  bookingType?: string | null;
  paymentType?: string | null;
  email?: string | null;
  firstName?: string | null;
  players?: number | null;
  experienceId?: string | null;
  parentBookingId?: string | null;
  internalNotes?: string | null;
}): boolean {
  const email = (booking.email || '').toLowerCase();
  const notes = booking.internalNotes || '';
  return (
    booking.bookingType === 'system' ||
    booking.paymentType === 'system' ||
    email.includes('system@sperret') ||
    booking.experienceId === 'system-slot-block' ||
    Boolean(booking.parentBookingId) ||
    notes.includes('Auto-generert tids-blokk') ||
    notes.includes('Manuelt sperret') ||
    (booking.firstName === 'Sperret' && Number(booking.players || 0) === 0)
  );
}

export function getBookingPaymentBreakdown(booking: {
  totalPrice?: number | null;
  amountPaid?: number | null;
  giftCardCode?: string | null;
  giftCardAmount?: number | null;
  goodwillGiftCardAmount?: number | null;
  giftCardRedemptions?: Array<{
    amount?: number | null;
    giftCard?: { paymentType?: string | null } | null;
  }> | null;
  vippsStatus?: string | null;
  status?: string | null;
  paymentType?: string | null;
  bookingType?: string | null;
  email?: string | null;
  firstName?: string | null;
  players?: number | null;
  experienceId?: string | null;
  parentBookingId?: string | null;
  internalNotes?: string | null;
}): BookingPaymentBreakdown {
  const totalPrice = Number(booking.totalPrice || 0);
  const amountPaid = Number(booking.amountPaid || 0);
  const rawGiftCard = Number(booking.giftCardAmount || 0);
  const giftCardUsed = rawGiftCard > 0 ? Math.min(totalPrice, rawGiftCard) : 0;

  let rawGoodwill = 0;
  if (typeof booking.goodwillGiftCardAmount === 'number') {
    rawGoodwill = Math.max(0, booking.goodwillGiftCardAmount);
  } else if (Array.isArray(booking.giftCardRedemptions) && booking.giftCardRedemptions.length > 0) {
    rawGoodwill = booking.giftCardRedemptions.reduce((sum, r) => {
      if (r?.giftCard?.paymentType === 'goodwill') {
        return sum + Math.max(0, Number(r.amount || 0));
      }
      return sum;
    }, 0);
  }

  const goodwillGiftCardUsed = Math.min(giftCardUsed, rawGoodwill);
  const paidGiftCardUsed = Math.max(0, giftCardUsed - goodwillGiftCardUsed);
  const netRevenue = Math.max(0, totalPrice - goodwillGiftCardUsed);

  const status = (booking.vippsStatus || '').toUpperCase();
  const isRefunded = status === 'REFUNDED' || status.includes('REFUND');
  const isCancelled = booking.status === 'cancelled';
  const isPending = booking.status === 'pending';
  const isTerminal =
    booking.paymentType === 'terminal' ||
    booking.paymentType === 'manual' ||
    booking.paymentType === 'cash' ||
    booking.paymentType === 'invoice';
  const isSystem = isSystemBlockedBooking(booking);

  const settledTotal = Math.max(amountPaid, giftCardUsed);
  const remaining = Math.max(0, totalPrice - settledTotal);
  const directPaid = Math.max(0, amountPaid - giftCardUsed);
  const vippsPaid = !isTerminal && !isRefunded && !isCancelled ? directPaid : 0;
  const terminalPaid = isTerminal && !isRefunded && !isCancelled ? directPaid : 0;

  return {
    totalPrice,
    netRevenue,
    amountPaid,
    giftCardUsed,
    paidGiftCardUsed,
    goodwillGiftCardUsed,
    vippsPaid,
    terminalPaid,
    remaining,
    settledTotal,
    status,
    isRefunded,
    isCancelled,
    isPending,
    isTerminal,
    isSystem,
  };
}
