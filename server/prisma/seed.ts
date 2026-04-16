import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alex@example.com' },
      update: {},
      create: { name: 'Alex Rivera', email: 'alex@example.com' },
    }),
    prisma.user.upsert({
      where: { email: 'jamie@example.com' },
      update: {},
      create: { name: 'Jamie Chen', email: 'jamie@example.com' },
    }),
    prisma.user.upsert({
      where: { email: 'morgan@example.com' },
      update: {},
      create: { name: 'Morgan Lee', email: 'morgan@example.com' },
    }),
  ]);

  console.log('Seeded users:');
  users.forEach(u => console.log(`  ${u.name}  id=${u.id}`));
  console.log('\nPaste the first id as currentUserId in task-modal.component.ts');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
