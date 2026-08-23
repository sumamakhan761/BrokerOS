import { prismaClient as prisma } from '../../apps/api/src/lib/database/prisma-client.js';


async function main() {
  const bookings = await prisma.booking.findMany({
    select: {
      id: true,
      tokenAmount: true,
      commissionAmount: true,
      totalPayable: true,
      agreedPrice: true,
      status: true
    }
  });
  console.log(JSON.stringify(bookings, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
