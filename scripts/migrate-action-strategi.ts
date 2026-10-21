import { prisma } from '../lib/prisma';

async function main() {
  console.log('--- Starting migration: Action -> Action Strategi ---');

  // 1. Update ExperienceType
  const updatedType = await prisma.experienceType.update({
    where: { id: 'cmqkqtq6x000412jeuvzhbi9h' },
    data: {
      name: 'Action Strategi',
      slug: 'action-strategi',
    },
  });
  console.log('Updated ExperienceType:', updatedType);

  // 2. Update Zombie Shooter
  const updatedZombie = await prisma.experience.update({
    where: { id: 'NhfWPDlik9Z6eSO4eyij' },
    data: {
      type: 'Action Strategi',
      filterCategories: ['Action Strategi'],
    },
  });
  console.log('Updated Zombie Shooter:', {
    id: updatedZombie.id,
    name: updatedZombie.name,
    type: updatedZombie.type,
    filterCategories: updatedZombie.filterCategories,
  });

  // 3. Update Tactical Arena
  const updatedTactical = await prisma.experience.update({
    where: { id: 'ztiASgjjGIQsoUXCdNIk' },
    data: {
      type: 'Action Strategi',
      filterCategories: ['Action Strategi'],
    },
  });
  console.log('Updated Tactical Arena:', {
    id: updatedTactical.id,
    name: updatedTactical.name,
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
