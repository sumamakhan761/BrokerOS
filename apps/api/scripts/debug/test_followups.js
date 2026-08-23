import { prismaClient as prisma } from '../../src/lib/database/prisma-client.js';
prisma.followUp.findMany({ include: { lead: true } })
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .finally(() => prisma.$disconnect());

