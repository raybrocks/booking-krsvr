import { prisma } from '../lib/prisma';

async function main() {
  console.log('--- Starting migration: Action & Tactical Arena ---');

  // 1. Update ExperienceType
  const updatedType = await prisma.experienceType.update({
    where: { id: 'cmqkqtq6x000412jeuvzhbi9h' },
    data: {
      name: 'Action',
      slug: 'action',
    },
  });
  console.log('Updated ExperienceType:', updatedType);

  // 2. Update Zombie Shooter (and any other experience with old type)
  const updatedZombie = await prisma.experience.update({
    where: { id: 'NhfWPDlik9Z6eSO4eyij' },
    data: {
      type: 'Action',
      filterCategories: ['Action'],
    },
  });
  console.log('Updated Zombie Shooter:', {
    id: updatedZombie.id,
    name: updatedZombie.name,
    type: updatedZombie.type,
    filterCategories: updatedZombie.filterCategories,
  });

  // 3. Update Tactical Arena (formerly Mixed Reality Shooter)
  const updatedTactical = await prisma.experience.update({
    where: { id: 'ztiASgjjGIQsoUXCdNIk' },
    data: {
      name: 'Tactical Arena',
      subName: 'Samle laget. Ta kontroll.',
      type: 'Action',
      filterCategories: ['Action'],
      shortDescription:
        'Dette er ikke VR der du står stille. I Tactical Arena (Spatial Ops) beveger dere dere fysisk rundt i arenaen, dukker bak cover og spiller direkte mot hverandre i taktiske lagkamper. Perfekt for bedrifter, avdelinger og teambuilding der samspill, kommunikasjon og taktikk avgjør — samt vennegjenger og utdrikningslag. Velg mellom klassiske lagspill som Team Deathmatch, Domination og Capture the Flag. Spillet har vunnet en rekke prestisjetunge internasjonale priser for beste Mixed Reality-opplevelse (Webby Awards, Auggie Awards m.fl.).',
    },
  });
  console.log('Updated Tactical Arena:', {
    id: updatedTactical.id,
    name: updatedTactical.name,
    subName: updatedTactical.subName,
    type: updatedTactical.type,
    filterCategories: updatedTactical.filterCategories,
  });

  console.log('--- Migration completed successfully ---');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
