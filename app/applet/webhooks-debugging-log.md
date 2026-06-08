# Vipps Webhooks Debugging & Setup Log

Dette dokumentet oppsummerer hvordan webhooks fra Vipps er satt opp, hvilke utfordringer vi har støtt på, og hva som har blitt gjort for å feilsøke og løse problemene.

## 1. Hvordan Vipps Webhooks er satt opp

*   **Endpoint:** Vi lytter på webhooks på `/api/vipps/callback` (definert i `app/api/vipps/callback/route.ts`).
*   **Registrering:** Registering gjøres via verktøyet/ruten `/api/vipps/register-webhook`. Den sletter eksisterende webhooks og registrerer på nytt med riktig hostname (nå `https://krsvr.no/api/vipps/callback`).
*   **Flyt i Endpointet:**
    1.  *(Sikkerhet)* Vi mottar payload fra Vipps og parser JSON (støtter både singel-objekt og array av events). *Merk: HMAC validering brukes per nå ikke ettersom vi aktivt henter status fra Vipps for verifisering.*
    2.  Trekker ut unik `reference` (som oftest vår booking-ID).
    3.  *(Webhooks Logging)* Logger selve webhook-payloaden i `WebhookLog`-tabellen via Prisma (Supabase).
    4.  *(Verifikasjon)* Henter Access Token og gjør et oppslag mot Vipps API (`/epayment/v1/payments/{reference}`) for å hente den garantert oppdaterte statusen, for å unngå manipulasjon.
    5.  Skriver endelig status til PostgreSQL (`transactions` og `bookings` tabellene).
    6.  Dersom statusen er CAPTURED og e-post ikke er sendt, trigges utsendelse av bekreftelses-epost i bakgrunnen.

## 2. Hva som har feilet, og hva vi har funnet ut (Deep Research)

Vi har gjort dypdykk i ulike tekniske utfordringer knyttet til migreringen over til Supabase (PostgreSQL) og Vipps-integrasjonen:

### Funn 1: WebhookLog tabellen var tom etter Supabase overgang
Etter å ha byttet fra Firebase til Supabase (Prisma), kom det ingen nye webhooks inn i `WebhookLog`. Dette skyldtes at Vipps sine webhooks ikke var registrert på det nye eller riktige domenet. Vipps visste dermed ikke hvor payloadene skulle sendes. Vi løste dette ved å fyre av et kall mot `/api/vipps/register-webhook` i produksjon, som slettet feil/gamle registreringer og hooket opp den korrekte adressen (`https://krsvr.no/api/vipps/callback`).

### Funn 2: "Placed at" / createdAt krasjet i Admin Dashboard
Etter at vi migrerte fra Firebase til Prisma/Supabase, krasjet dato-visningen. Databaseringen endret format. Firebase Firestore returnerte objekter med `.toDate()` metode, mens Prisma/Supabase returnerer ordinære ISO-dato strenger/`Date` objekter.
*   **Løsning:** I `components/AdminDashboard.tsx` har vi byttet alle kall fra `booking.createdAt.toDate()` til `new Date(booking.createdAt)` og fjernet Firebase-spesifikke sjekker. Dato-sortering og fremvisning (`Dato Plassert`) fungerer dermed utmerket igjen.

### Funn 3: Vercel Timeout (Tidligere Hovedårsak)
Vi oppdaget før migreringen at koden for `/api/vipps/callback` var for treg for serverless-miljøet. Den sjekket alt serielt, noe som tok over 5-10 sekunder. Vipps forventer et raskt `200 OK` svar umiddelbart, og Vercel-funksjoner kutter om de tar lang tid. Resultatet var at webhook-prosessen kræsjet før bookingen ble oppdatert.

## 3. Hva vi har gjort for å stabilisere systemet

For å løse feilen for godt, ble det gjort følgende utbedringer:

1.  **Lynrask Utførelse og Asynkron E-post:**
    Alt som krever tid kjøres nå parallelt. API-ruten prioriterer å returnere `200 OK` til Vipps så fort som mulig. E-postutsendelsen ble skjøvet over i en "fire-and-forget" bakgrunnsoppgave (`Promise.resolve().then(...)`) for å unngå Vercel-timeouts.
2.  **Optimalisert Token Henting:**
    Nå hentes Vipps Access Token kun *én* gang før loopen starter, noe som sparer massiv responstid ved batch-events.
3.  **Tvungen Logging via Prisma:**
    Systemet skriver nå **ALLE** innkommende webhooks inn i Supabase/Prisma-tabellen `WebhookLog`. Eieren kan alltid slå opp i webhooks-loggen for feilsøking.
4.  **Ny Webhook-registrering (Viktig):**
    For at systemet skal virke på produksjonsdomenet, kaller vi nå en script-rute som automatisk tørker ut gamle Vipps URL-er og setter opp produksjons-URL-en korrekt.
5.  **Datofikser for Supabase:**
    Gjort backend helt Firebase-uavhengig og rettet formatkrasj (`.toDate()`) i admin-panel og lister.

Systemet er nå optimalisert til å ta imot Vipps-hendelser lynraskt via Vercel og lagre dem sikkert til Supabase!
