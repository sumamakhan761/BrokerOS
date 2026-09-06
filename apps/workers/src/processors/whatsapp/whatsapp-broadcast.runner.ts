// ============================================================================
// BrokerOS — WhatsApp Broadcast Runner
// ============================================================================

import { Logger } from '@nestjs/common';
import {
  sendTemplateMessage,
  phoneVariants,
  decrypt,
} from '@brokeros/int-whatsapp';

export async function processBroadcast(
  prisma: any,
  broadcast: any,
  logger: Logger,
): Promise<void> {
  const { id: broadcastId, account, templateName, templateLanguage } = broadcast;

  if (!account || !account.isActive) {
    logger.warn(`Skipping broadcast ${broadcastId}: account inactive or missing`);
    return;
  }

  let accessToken = '';
  try {
    accessToken = decrypt(account.accessToken);
  } catch (err: any) {
    logger.error(
      `Failed to decrypt token for account ${account.id} in broadcast ${broadcastId}: ${err?.message}`,
    );
    await prisma.whatsAppBroadcast.update({
      where: { id: broadcastId },
      data: { status: 'FAILED' },
    });
    return;
  }

  // Mark as SENDING if not already
  if (broadcast.status !== 'SENDING') {
    await prisma.whatsAppBroadcast.update({
      where: { id: broadcastId },
      data: { status: 'SENDING' },
    });
  }

  // Process batch of pending recipients
  const batchSize = 25;
  const recipients = await prisma.whatsAppBroadcastRecipient.findMany({
    where: {
      broadcastId,
      status: 'PENDING',
    },
    include: {
      contact: true,
    },
    take: batchSize,
  });

  if (recipients.length === 0) {
    // Check if any failed or sent
    const remainingPending = await prisma.whatsAppBroadcastRecipient.count({
      where: { broadcastId, status: 'PENDING' },
    });

    if (remainingPending === 0) {
      await prisma.whatsAppBroadcast.update({
        where: { id: broadcastId },
        data: { status: 'COMPLETED' },
      });
      logger.log(`Broadcast ${broadcastId} completed.`);
    }
    return;
  }

  for (const recipient of recipients) {
    const targetPhone = recipient.phone || recipient.contact?.phone;
    if (!targetPhone) {
      await prisma.$transaction(async (tx: any) => {
        await tx.whatsAppBroadcastRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            errorMessage: 'Recipient has no valid phone number',
          },
        });
        await tx.whatsAppBroadcast.update({
          where: { id: broadcastId },
          data: { failedCount: { increment: 1 } },
        });
      });
      continue;
    }

    const variants = phoneVariants(targetPhone);
    let sentId: string | null = null;
    let lastError: any = null;

    for (const variant of variants) {
      try {
        const res = await sendTemplateMessage({
          phoneNumberId: account.phoneNumberId,
          accessToken,
          to: variant,
          templateName,
          language: templateLanguage || 'en_US',
          params: Array.isArray(recipient.templateParams)
            ? (recipient.templateParams as string[])
            : undefined,
        });

        if (res?.messageId) {
          sentId = res.messageId;
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (sentId) {
      await prisma.$transaction(async (tx: any) => {
        await tx.whatsAppBroadcastRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'SENT',
            waMessageId: sentId,
            sentAt: new Date(),
          },
        });
        await tx.whatsAppBroadcast.update({
          where: { id: broadcastId },
          data: { sentCount: { increment: 1 } },
        });
      });
    } else {
      await prisma.$transaction(async (tx: any) => {
        await tx.whatsAppBroadcastRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            errorMessage: lastError?.message || 'Meta template delivery failed',
          },
        });
        await tx.whatsAppBroadcast.update({
          where: { id: broadcastId },
          data: { failedCount: { increment: 1 } },
        });
      });
    }
  }
}
