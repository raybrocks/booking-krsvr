const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

async function main() {
  console.log("Starting migration...");
  
  // Get all unique string types from Experience
  const experiences = await prisma.experience.findMany();
  const typesSet = new Set();
  
  experiences.forEach(exp => {
    if (exp.type && typeof exp.type === 'string') {
      typesSet.add(exp.type);
    }
  });
  
  const uniqueTypes = Array.from(typesSet);
  console.log(`Found ${uniqueTypes.length} unique types:`, uniqueTypes);
  
  // Create ExperienceTypes and map typeIds
  for (let i = 0; i < uniqueTypes.length; i++) {
    const typeName = uniqueTypes[i];
    const slug = slugify(typeName);
    
    // Check if exists
    let typeRecord = await prisma.experienceType.findUnique({
      where: { slug }
    });
    
    if (!typeRecord) {
      typeRecord = await prisma.experienceType.create({
        data: {
          name: typeName,
          slug: slug,
          order: i
        }
      });
      console.log(`Created ExperienceType: ${typeName}`);
    }
    
    // Update all experiences with this type string to link the ID
    const updateResult = await prisma.experience.updateMany({
      where: { 
        type: typeName,
        typeId: null // Only update if not already linked
      },
      data: {
        typeId: typeRecord.id
      }
    });
    
    console.log(`Linked ${updateResult.count} experiences to type: ${typeName}`);
  }
  
  console.log("Migration completed.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
