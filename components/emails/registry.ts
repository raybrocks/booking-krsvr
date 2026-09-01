import React from 'react';
import { BookingConfirmationEmail } from './BookingConfirmationEmail';
import { NameListReminderEmail } from './NameListReminderEmail';
import { BookingCancellationEmail } from './BookingCancellationEmail';
import { RefundReceiptEmail } from './RefundReceiptEmail';
import { EmployeeInviteEmail } from './EmployeeInviteEmail';
import { AdminNewBookingEmail } from './AdminNewBookingEmail';
import { AdminBookingUpdateEmail } from './AdminBookingUpdateEmail';
import { AdminBookingCancellationEmail } from './AdminBookingCancellationEmail';
import { ContactInquiryNotificationEmail } from './ContactInquiryNotificationEmail';
import { FeedbackNotificationEmail } from './FeedbackNotificationEmail';
import { WeeklySummaryEmail } from './WeeklySummaryEmail';
import { NewsletterBroadcastEmail } from './NewsletterBroadcastEmail';

export interface EmailTemplateDefinition {
  id: string;
  title: string;
  category: 'customer' | 'internal' | 'marketing';
  categoryLabel: string;
  subject: string;
  trigger: string;
  filePath: string;
  mockProps: Record<string, any>;
  Component: React.ComponentType<any>;
}

export const EMAIL_CATEGORIES = [
  { id: 'customer', label: 'Bekreftelser til kunder' },
  { id: 'internal', label: 'Interne varslinger' },
  { id: 'marketing', label: 'Nyhetsbrev & Broadcasts' },
] as const;

export const EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  // ----------------------------------------------------
  // Kategori 1: Bekreftelser til kunder
  // ----------------------------------------------------
  {
    id: 'booking-confirmation',
    title: 'Bestillingsbekreftelse og kvittering',
    category: 'customer',
    categoryLabel: 'Bekreftelser til kunder',
    subject: 'Bestillingsbekreftelse og kvittering - KRS VR Arena',
    trigger: 'Sendes automatisk til kunden umiddelbart etter at en booking er bekreftet og betalt (både online og manuell).',
    filePath: 'components/emails/BookingConfirmationEmail.tsx',
    Component: BookingConfirmationEmail,
    mockProps: {
      firstName: 'Ola',
      lastName: 'Nordmann',
      experienceTitle: 'Mixed Reality Shooter (90 min)',
      date: '12. september 2026',
      time: '18:00',
      players: 6,
      totalPrice: 2400,
      amountPaid: 2400,
      manageUrl: 'https://krsvr.no/booking/manage/sample-booking-id?token=sample-token-123',
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'name-list-reminder',
    title: 'Påminnelse om navneliste (3 dager før)',
    category: 'customer',
    categoryLabel: 'Bekreftelser til kunder',
    subject: 'Påminnelse: Vi trenger navneliste til deres opplevelse den 12. september 2026 kl. 18:00',
    trigger: 'Sendes daglig (kl. 09:00) til kunder med arrangement innen 3 dager som ikke har fullført navneliste.',
    filePath: 'components/emails/NameListReminderEmail.tsx',
    Component: NameListReminderEmail,
    mockProps: {
      firstName: 'Kari',
      lastName: 'Hansen',
      experienceTitle: 'Zombie Shooter Kristiansand (90 min)',
      date: '12. september 2026',
      time: '18:00',
      players: 8,
      manageUrl: 'https://krsvr.no/booking/manage/sample-booking-id?token=sample-token-123',
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'booking-cancellation',
    title: 'Kanselleringsbekreftelse til kunde',
    category: 'customer',
    categoryLabel: 'Bekreftelser til kunder',
    subject: 'Kansellering av booking - KRS VR Arena',
    trigger: 'Sendes til kunde når en booking kanselleres av kunden i portalen eller av admin.',
    filePath: 'components/emails/BookingCancellationEmail.tsx',
    Component: BookingCancellationEmail,
    mockProps: {
      firstName: 'Ola',
      lastName: 'Nordmann',
      experienceTitle: 'VR Escape Room Kristiansand',
      date: '15. september 2026',
      time: '19:30',
      amountRefunded: 500,
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'refund-receipt',
    title: 'Refusjonskvittering (Vipps)',
    category: 'customer',
    categoryLabel: 'Bekreftelser til kunder',
    subject: 'Kvittering for refusjon - KRS VR Arena',
    trigger: 'Sendes til kunde når admin refunderer en innbetaling via Vipps i transaksjonsoversikten.',
    filePath: 'components/emails/RefundReceiptEmail.tsx',
    Component: RefundReceiptEmail,
    mockProps: {
      firstName: 'Lars',
      lastName: 'Pedersen',
      refundAmount: 1800,
      paymentRef: 'VIPPS-REF-8921738',
      date: '18. september 2026',
      time: '16:00',
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'employee-invite',
    title: 'Invitasjon til ny ansatt',
    category: 'customer',
    categoryLabel: 'Bekreftelser til kunder',
    subject: 'Du har blitt invitert som ansatt hos KRS VR Arena',
    trigger: 'Sendes når leder legger til en ny ansatt i systemet under Ansatte-fanen.',
    filePath: 'components/emails/EmployeeInviteEmail.tsx',
    Component: EmployeeInviteEmail,
    mockProps: {
      name: 'Simen Instruktør',
      inviteUrl: 'https://krsvr.no/admin?register=true&email=simen%40krsvr.no',
      adminEmail: 'post@krsvr.no',
    },
  },

  // ----------------------------------------------------
  // Kategori 2: Interne varslinger
  // ----------------------------------------------------
  {
    id: 'admin-new-booking',
    title: 'Varsel: Ny booking registrert',
    category: 'internal',
    categoryLabel: 'Interne varslinger',
    subject: 'Ny booking registrert: Ola Nordmann - 12. september 2026 kl 18:00',
    trigger: 'Sendes umiddelbart til post@krsvr.no når en ny kunde gjennomfører en bestilling.',
    filePath: 'components/emails/AdminNewBookingEmail.tsx',
    Component: AdminNewBookingEmail,
    mockProps: {
      firstName: 'Ola',
      lastName: 'Nordmann',
      email: 'ola.nordmann@example.com',
      phone: '+47 900 11 222',
      experienceTitle: 'Mixed Reality Shooter (90 min)',
      date: '12. september 2026',
      time: '18:00',
      players: 6,
      totalPrice: 2400,
      amountPaid: 2400,
      bookingType: 'private',
      internalNotes: 'Feirer bursdag.',
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'admin-booking-update',
    title: 'Varsel: Booking endret av kunde',
    category: 'internal',
    categoryLabel: 'Interne varslinger',
    subject: 'Booking endret: Ola Nordmann - 12. september 2026 kl 18:00',
    trigger: 'Sendes til admin når en kunde flytter tidspunkt eller oppdaterer spillere via administrasjonslenken sin.',
    filePath: 'components/emails/AdminBookingUpdateEmail.tsx',
    Component: AdminBookingUpdateEmail,
    mockProps: {
      firstName: 'Ola',
      lastName: 'Nordmann',
      email: 'ola.nordmann@example.com',
      date: '14. september 2026',
      time: '19:00',
      players: 8,
      experienceTitle: 'Spatial Ops Kristiansand (90 min)',
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'admin-booking-cancellation',
    title: 'Varsel: Booking kansellert av kunde',
    category: 'internal',
    categoryLabel: 'Interne varslinger',
    subject: 'Booking kansellert av kunde: Ola Nordmann - 12. september 2026 kl 18:00',
    trigger: 'Sendes til admin når en kunde kansellerer bookingen sin via kundeportalen.',
    filePath: 'components/emails/AdminBookingCancellationEmail.tsx',
    Component: AdminBookingCancellationEmail,
    mockProps: {
      firstName: 'Ola',
      lastName: 'Nordmann',
      email: 'ola.nordmann@example.com',
      date: '12. september 2026',
      time: '18:00',
      experienceTitle: 'Mixed Reality Shooter (90 min)',
      amountPaid: 500,
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'contact-inquiry',
    title: 'Varsel: Ny henvendelse / arrangementskjema',
    category: 'internal',
    categoryLabel: 'Interne varslinger',
    subject: 'Ny henvendelse: Teambuilding fra Tech Bedrift AS (Geir Hansen)',
    trigger: 'Sendes til admin når en kunde sender inn kontaktskjemaet eller arrangementsforespørsel.',
    filePath: 'components/emails/ContactInquiryNotificationEmail.tsx',
    Component: ContactInquiryNotificationEmail,
    mockProps: {
      name: 'Geir Hansen',
      email: 'geir@techbedrift.no',
      phone: '+47 412 34 567',
      formType: 'arrangement',
      eventType: 'Teambuilding & Firmafest',
      companyName: 'Tech Bedrift AS',
      packageType: 'VR Turnering + Pizza',
      peopleCount: '15-20 personer',
      date: '25. september 2026',
      altDate: '02. oktober 2026',
      time: '17:00 - 20:00',
      food: 'Pizza og mineralvann til hele gruppen',
      message: 'Hei. Vi ønsker et opplegg for bedriften vår med konkurranse og turnering i VR. Har dere plass til ca. 18 personer på ønsket dato?',
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'feedback-notification',
    title: 'Varsel: Ny kundetilbakemelding (/feedback)',
    category: 'internal',
    categoryLabel: 'Interne varslinger',
    subject: 'Ny tilbakemelding: Kjempefornøyd',
    trigger: 'Sendes til admin når en kunde gir tilbakemelding på krsvr.no/feedback.',
    filePath: 'components/emails/FeedbackNotificationEmail.tsx',
    Component: FeedbackNotificationEmail,
    mockProps: {
      rating: 'happy',
      comments: 'Veldig god opplevelse. Instruktøren var dyktig og tok godt imot oss.',
      phone: '+47 987 65 432',
      adminEmail: 'post@krsvr.no',
    },
  },
  {
    id: 'weekly-summary',
    title: 'Ukentlig rapport og vaktplan',
    category: 'internal',
    categoryLabel: 'Interne varslinger',
    subject: 'Ukentlig oppsummering og vaktliste - Uke 37',
    trigger: 'Kjøres automatisk hver mandag morgen via cron-jobb (/api/cron/weekly-summary).',
    filePath: 'components/emails/WeeklySummaryEmail.tsx',
    Component: WeeklySummaryEmail,
    mockProps: {
      weekNumber: 37,
      totalRevenue: 28400,
      vippsRevenue: 22000,
      manualRevenue: 6400,
      bookingCount: 9,
      upcomingBookings: [
        { date: 'Mandag 14.09', time: '17:00', firstName: 'Knut', lastName: 'Olsen', players: 6, experienceTitle: 'VR Escape Room', paymentType: 'Vipps' },
        { date: 'Onsdag 16.09', time: '18:30', firstName: 'Tech AS', lastName: '(Firmaevent)', players: 14, experienceTitle: 'Mixed Reality Shooter', paymentType: 'Faktura' },
        { date: 'Fredag 18.09', time: '19:00', firstName: 'Marte', lastName: 'Lie', players: 4, experienceTitle: 'Zombie Shooter', paymentType: 'Vipps' },
        { date: 'Lørdag 19.09', time: '14:00', firstName: 'Bursdag Jonas', lastName: '12 år', players: 8, experienceTitle: 'VR Arcade Party', paymentType: 'Vipps' },
      ],
      adminEmail: 'post@krsvr.no',
    },
  },

  // ----------------------------------------------------
  // Kategori 3: Nyhetsbrev & Broadcasts
  // ----------------------------------------------------
  {
    id: 'newsletter-broadcast',
    title: 'Nyhetsbrev / Kampanje-epost (Resend Broadcast)',
    category: 'marketing',
    categoryLabel: 'Nyhetsbrev & Broadcasts',
    subject: 'Nyheter fra KRS VR Arena: Oppgraderte opplevelser og høsttilbud',
    trigger: 'Masseutsendelse via Resend Broadcasts til nyhetsbrev-abonnenter og tidligere kunder.',
    filePath: 'components/emails/NewsletterBroadcastEmail.tsx',
    Component: NewsletterBroadcastEmail,
    mockProps: {
      headline: 'Nyheter fra KRS VR Arena',
      teaser: 'Vi utvider kapasiteten og lanserer nye opplevelser for høsten.',
      bodyParagraphs: [
        'Vi i KRS VR Arena jobber kontinuerlig med å tilby de beste VR- og Mixed Reality-opplevelsene i Kristiansand.',
        'Nå har vi oppgradert lokalene og lagt til rette for enda bedre tilpasning for grupper, teambuilding og private arrangementer.',
        'Bruk koden under ved bestilling for 15% rabatt på din neste spilløkt.'
      ],
      ctaButtonText: 'Bestill tid på nett',
      ctaButtonUrl: 'https://krsvr.no/booking',
      discountCode: 'VR15',
      adminEmail: 'post@krsvr.no',
    },
  },
];

export function getEmailTemplate(id: string): EmailTemplateDefinition | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id);
}
