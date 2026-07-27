import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'post@krsvr.no';
  
  const existing = await prisma.employee.findUnique({
    where: { email }
  });

  if (existing) {
    console.log(`Brukere med e-post ${email} eksisterer allerede i Employee-tabellen.`);
  } else {
    const employee = await prisma.employee.create({
      data: {
        email,
        name: 'Admin',
        role: 'admin',
        isActive: true
      }
    });
    console.log(`Opprettet admin i Employee-tabellen:`, employee);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
