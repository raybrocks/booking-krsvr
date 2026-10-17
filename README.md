# KRS VR Arena (`krsvr.no`)

Nettside, bookingsystem og administrasjonspanel for **KRS VR Arena** i Kristiansand (`Industrigata 12, 4632 Kristiansand`).

## Teknologistakk
- **Rammeverk:** Next.js 15 (App Router, TypeScript, React 19)
- **Styling:** Tailwind CSS v4, Motion (`motion/react`), Lucide Icons
- **Database & ORM:** PostgreSQL (Supabase) + Prisma ORM (`prisma/schema.prisma`)
- **Betaling:** Vipps MobilePay ePay API
- **E-post:** Resend + React Email (`components/emails/` og `components/emails/registry.ts`)

## Kjøre prosjektet lokalt

1. Installer avhengigheter:
   ```bash
   npm install
   ```
2. Konfigurer miljøvariabler i `.env` / `.env.local` (se `app/.env.example`).
3. Start utviklingsserveren (kjører fast på port **3050**):
   ```bash
   npm run dev
   ```
   Åpne [http://localhost:3050](http://localhost:3050) i nettleseren.

## Viktige retningslinjer
Se [`.agents/AGENTS.md`](./.agents/AGENTS.md) for:
- SEO- og AI-søk (GEO) retningslinjer
- Tone of Voice og språkbruk
- E-postmaler og sentralt e-postregister (`components/emails/registry.ts`)
- Pakkepriser, kapasitet (opptil 10 samtidige spillere), turneringsformat (10–64 pers) og bar-/serveringsregler
- Database- og Supabase `GRANT` + `RLS`-krav
