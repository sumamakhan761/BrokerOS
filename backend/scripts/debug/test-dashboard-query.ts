import { prismaClient as prisma } from '../../src/lib/database/prisma-client.js';

async function main() {
  const bookingFilter = { status: { not: 'CANCELLED' } };
  const bookings = await prisma.booking.findMany({
    where: bookingFilter as any,
    include: {
      customer: {
        include: { lead: true }
      },
      brokerageRecords: true
    }
  });
  console.log('Bookings returned with include:', bookings.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
