# Implementeringsplan: Fra Firebase til Supabase (PostgreSQL)

Dette dokumentet beskriver trinn for trinn hvordan vi går fra en NoSQL løsning (Firebase) til en robust relasjonell database (PostgreSQL via Supabase). Målet er å skape et dønn solid bookingsystem der dobbeltbookinger elimineres via transaksjoner og constraints i databasen. 

---

## 🛠️ Trinn 1: Klargjøre Supabase
**Status:** Utført. Nøkler er lagt inn og fungerer supert med URL-encoding.

---

## 🏗️ Trinn 2: Strukturere databasen med Prisma
**Status:** Utført. `schema.prisma` er ferdig konfigurert med avanserte anti-dobbeltbooking constraints.

---

## 🚀 Trinn 3: Synkronisering og oppretting av tabeller i Supabase
**Status:** Utført! Databasen på Supabase er nå oppdatert med ditt nye skjema og alle referanser og tabeller er satt opp der.

---

## 🔄 Trinn 4: Bygge de nye Backend API-rutene (Maskin - Min oppgave i 3 etapper)
**Status:** Utført! Alle backend-ruter snakker nå med Supabase (via Prisma) i stedet for Firebase.
Ingen Firebase-ting er slettet fra frontend enda.

* **Etappe A:** Lage `/api/experiences` og `/api/settings`. Omskrive kall til Prisma. Teste at det fungerer. (Fullført)
* **Etappe B (Den viktigste):** Oppdatere `/api/booking`, samt innholdet i `vipps/`-mappen (`vipps/callback`, `vipps/capture`, `vipps/cancel` osv) slik at betalings-statuser snakker med Supabase direkte. Database-constraints sikrer nå at to bookinger på samme tidspunkt feiler på systemnivå. (Fullført)
* **Etappe C:** Bygge egne endepunkter for admin-panelet (`/api/admin/bookings`, `/api/admin/receipts`, `/api/testimonials`). (Fullført)

---

## 🎨 Trinn 5: Frontend konvertering (Maskin - Min logikk)
Dette er neste trinn. Firebase Client "onSnapshot"-lyttere fjernes fra frontend-komponenter slik som `BookingFlow.tsx`, `AdminDashboard.tsx`, osv, og byttes ut med vanlige `fetch()`-kall til våre nye API-endepunkter.

---

## 🧹 Trinn 6: Sletting av Firebase fra prosjektet (Maskin - Min oppgave)
Når vi har verifisert i plattformen at alt laster over Supabase, fjerner vi `firebase` og `firebase-admin` fra `package.json`. Alle ubrukte konfigurasjonsfiler til Firebase fjernes. 

---

### Status Logg
✅ **Trinn 1:** Supabase innstillinger (Utført)
✅ **Trinn 2:** Sette opp Prisma (Utført)
✅ **Trinn 3:** Synkronisere database (Utført)
✅ **Trinn 4:** Bygge backend rutene (Utført! Supabase logikk er på plass)
⏳ **Trinn 5:** Konvertere frontend (Starter på din bekreftelse...)
🔘 **Trinn 6:** Fjerne Firebase (Venter)
