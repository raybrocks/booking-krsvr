export interface BookingPaymentBreakdown {
  totalPrice: number;
  amountPaid: number;
  giftCardUsed: number;
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
    amountPaid,
    giftCardUsed,
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
