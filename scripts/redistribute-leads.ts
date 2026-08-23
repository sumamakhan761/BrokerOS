import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  console.log('Starting lead redistribution...');

  // 1. Get all PRE_SALES users
  const preSalesUsers = await prisma.user.findMany({
    where: { role: { code: 'PRE_SALES' } },
  });

  if (preSalesUsers.length === 0) {
    console.log('No PRE_SALES users found. Exiting.');
    return;
  }

  console.log(`Found ${preSalesUsers.length} PRE_SALES users.`);

  // 2. Get all Leads
  const leads = await prisma.lead.findMany();

  if (leads.length === 0) {
    console.log('No leads found to redistribute. Exiting.');
    return;
  }

  console.log(`Found ${leads.length} leads. Distributing round-robin...`);

  // 3. Round-robin assignment
  let userIndex = 0;
  for (const lead of leads) {
    const assignedUser = preSalesUsers[userIndex];
    await prisma.lead.update({
      where: { id: lead.id },
      data: { assignedUserId: assignedUser.id }
    });
    console.log(`Assigned Lead ${lead.id} to User ${assignedUser.username} (${assignedUser.id})`);

    userIndex = (userIndex + 1) % preSalesUsers.length;
  }

  console.log('Lead redistribution complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
