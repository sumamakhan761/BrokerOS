import { prismaClient as prisma } from './src/lib/database/prisma-client.js';
async function main() {
  const cm = await prisma.user.findFirst({ where: { role: { code: 'CLOSING_MANAGER' } } });
  if (!cm) {
    console.error('Closing Manager not found!');
    process.exit(1);
  }
  console.log('CM id:', cm.id);
  const leads = await prisma.lead.findMany({ where: { assignedUserId: cm.id } });
  console.log('Assigned leads:', leads.length, leads.map(l => l.status));
  const allCP = await prisma.lead.findMany({ where: { interestedProject: { isCpProject: true } } });
  console.log('All CP leads:', allCP.length);
}
main().finally(() => process.exit(0));
