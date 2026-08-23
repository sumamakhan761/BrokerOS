import { prismaClient as prisma } from '../../apps/api/src/lib/database/prisma-client.js';

async function main() {
  await prisma.user.deleteMany({});
  console.log('DELETED ALL USERS');
}
main().finally(() => prisma.$disconnect());

