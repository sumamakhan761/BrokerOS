import { prismaClient as prisma } from '../src/lib/database/prisma-client.js';

async function backfillCommissions() {
  console.log("Starting commission backfill for existing completed bookings...");
  let count = 0;

  try {
    // Find all confirmed bookings that have a broker attached but no brokerage record
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        customer: {
          lead: {
            brokerId: { not: null }
          }
        },
        brokerageRecords: { none: {} }
      },
      include: {
        customer: { include: { lead: true } },
        unit: { include: { floor: { include: { tower: true } } } }
      }
    });

    console.log(`Found ${bookings.length} confirmed bookings with a broker but missing commission records.`);

    for (const booking of bookings) {
      const brokerId = booking.customer.lead?.brokerId;
      const projectId = booking.unit?.floor?.tower?.projectId;

      if (!brokerId || !projectId) continue;

      // Find deal card
      const dealCard = await prisma.brokerProjectAssignment.findUnique({
        where: { brokerId_projectId: { brokerId, projectId } }
      });

      if (dealCard) {
        const bookingValue = Number(booking.agreedPrice || 0);
        let brokerageAmount = 0;
        let brokeragePercent: any = null;

        if (dealCard.brokeragePercent) {
          brokeragePercent = dealCard.brokeragePercent;
          brokerageAmount = (bookingValue * Number(brokeragePercent)) / 100;
        } else if (dealCard.brokerageFlat) {
          brokerageAmount = Number(dealCard.brokerageFlat);
        }

        if (brokerageAmount > 0) {
          await prisma.brokerageRecord.create({
            data: {
              brokerId,
              bookingId: booking.id,
              bookingValue,
              brokeragePercent,
              brokerageAmount,
              netPayable: brokerageAmount,
              status: 'PENDING'
            }
          });

          // Also update the Unit and Booking to show the commission percentage
          await prisma.unit.update({
            where: { id: booking.unitId! },
            data: { commissionPercentage: brokeragePercent }
          });

          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              commissionPercentage: brokeragePercent,
              commissionAmount: brokerageAmount
            }
          });

          console.log(`Created commission record for Booking ${booking.bookingNumber} - Amount: ₹${brokerageAmount}`);
          count++;
        }
      } else {
        console.log(`Booking ${booking.bookingNumber} skipped - No Deal Card found for broker.`);
      }
    }

    console.log(`\nBackfill complete. Created ${count} commission records.`);

  } catch (error) {
    console.error("Error during backfill:", error);
  } finally {
    process.exit(0);
  }
}

backfillCommissions();
