# Project Instructions – KRS VR Arena (`krsvr.no`)

Du jobber på produksjonsprosjektet for **KRS VR Arena** i Kristiansand.
For detaljerte forretningsregler, SEO-krav, e-postmaler, priser og tone-of-voice, se alltid [`.agents/AGENTS.md`](./.agents/AGENTS.md), som er prosjektets primære styringsdokument (Single Source of Truth).

## Prosjektkontekst
- **Live URL:** `https://krsvr.no` (og `https://www.krsvr.no`)
- **Lokasjon:** Industrigata 12, Lund, 4632 Kristiansand (`58.149257, 8.016398`)
- **Hosting & CI/CD:** Vercel (automatisk bygg og deploy ved push til `main`-branchen på GitHub).
- **GitHub-repo:** `https://github.com/raybrocks/booking-krsvr.git` (`main` branch).
- **Teknologistakk:**
  - Next.js 15 (App Router, TypeScript, Tailwind CSS)
  - Database: PostgreSQL (Supabase) via Prisma ORM (`prisma/schema.prisma`)
  - Betaling: Vipps MobilePay ePay API
  - E-post: Resend + React Email (`components/emails/` og `components/emails/registry.ts`)

## Utvikling og Arbeidsflyt
1. **Lokal utviklingsserver:**
   - Skal **alltid** kjøres på port `3050` (`npm run dev`).
2. **`lbp` (Lint -> Build -> Push):**
   - Når brukeren skriver `lbp` (eller ber om «lint, build, push»), skal følgende kjøres automatisk i rekkefølge uten å be om ekstra bekreftelse:
     1. `npm run lint` (rett eventuelle feil/advarsler)
     2. `npm run build` (sikre at typer og produksjonsbygg går gjennom uten feil)
     3. `git add`, `git commit` med beskrivende melding og `git push origin main`
3. **Sikkerhetsregler:**
   - Opprett aldri et nytt GitHub-repo eller Vercel-prosjekt.
   - Ikke endre DNS-innstillinger eller koble fra Vercel/GitHub-integrasjonen.
   - Bruk aldri `git push --force`.
   - Commit aldri `.env`-filer, hemmeligheter, API-nøkler, `node_modules` eller `.next`.
   - Ved nye databasetabeller i `public`-skjemaet må det alltid legges til eksplisitte `GRANT`-setninger sammen med `RLS` (se `.agents/AGENTS.md`).
