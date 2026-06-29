import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const experiences = await prisma.experience.findMany();
  let updatedCount = 0;

  for (const exp of experiences) {
    if (!exp.duration || exp.duration.includes('45') || exp.duration.includes('55') || exp.duration.includes('60')) {
      await prisma.experience.update({
        where: { id: exp.id },
        data: { duration: '90 min' },
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} experiences to 90 min duration.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
