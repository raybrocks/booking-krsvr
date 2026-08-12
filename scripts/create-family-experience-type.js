// scripts/create-family-experience-type.js
// Oppretter ExperienceType "Familiepakke" med slug "familiepakke" i databasen.
// Scriptet er idempotent – det kan kjøres flere ganger uten å lage duplikater.
// Kjøring: node scripts/create-family-experience-type.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'familiepakke';
  const name = 'Familiepakke';

  // Sjekk om typen allerede finnes
  const existing = await prisma.experienceType.findUnique({
    where: { slug },
  });

  if (existing) {
    console.log(`ℹ️  ExperienceType "${name}" finnes allerede.`);
    console.log(`   ID:    ${existing.id}`);
    console.log(`   Slug:  ${existing.slug}`);
    console.log(`   Order: ${existing.order}`);
    console.log('Ingen endringer gjort.');
    return;
  }

  // Finn neste ledige order-verdi
  const maxOrderEntry = await prisma.experienceType.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  const nextOrder = (maxOrderEntry?.order ?? 0) + 1;

  const created = await prisma.experienceType.create({
    data: {
      name,
      slug,
      order: nextOrder,
    },
  });

  console.log(`✅ ExperienceType "${name}" ble opprettet!`);
  console.log(`   ID:    ${created.id}`);
  console.log(`   Slug:  ${created.slug}`);
  console.log(`   Order: ${created.order}`);
  console.log('');
  console.log('Neste steg: Opprett opplevelser manuelt i admin med type "Familiepakke" og familyFriendly = true.');
}

main()
  .catch((e) => {
    console.error('❌ Feil:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
