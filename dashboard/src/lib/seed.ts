import { PrismaClient } from '@prisma/client';
import mockUsers from '../app/data/mockdata.json'; 

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');
  
  const createdUsers = await prisma.user.createMany({
    data: mockUsers.users,
    skipDuplicates: true,
  });
  
  console.log(`✅ Successfully created ${createdUsers.count} users`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });