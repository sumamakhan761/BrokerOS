// ============================================================================
// BrokerOS — WhatsApp Template Syncer
// ============================================================================

import { Logger } from '@nestjs/common';
import {
  fetchMessageTemplates,
  decrypt,
} from '@brokeros/int-whatsapp';

export async function syncAllAccountTemplates(
  prisma: any,
  logger: Logger,
): Promise<void> {
  try {
    const accounts = await prisma.whatsAppBusinessAccount.findMany({
      where: { isActive: true },
    });

    for (const account of accounts) {
      let accessToken = '';
      try {
        accessToken = decrypt(account.accessToken);
      } catch {
        continue;
      }

      const templates = await fetchMessageTemplates({
        wabaId: account.wabaId,
        accessToken,
        limit: 100,
      }).catch(() => []);

      for (const mt of templates) {
        let bodyText = '';
        let headerText: string | null = null;
        let footerText: string | null = null;
        let buttons: any[] = [];
        let exampleValues: any = null;

        for (const comp of mt.components || []) {
          if (comp.type === 'BODY') {
            bodyText = comp.text || '';
            if (comp.example?.body_text) exampleValues = comp.example.body_text;
          } else if (comp.type === 'HEADER') {
            headerText = comp.text || null;
          } else if (comp.type === 'FOOTER') {
            footerText = comp.text || null;
          } else if (comp.type === 'BUTTONS') {
            buttons = comp.buttons || [];
          }
        }

        const status = (mt.status || 'PENDING').toUpperCase();

        await prisma.whatsAppTemplate.upsert({
          where: {
            accountId_name_language: {
              accountId: account.id,
              name: mt.name,
              language: mt.language,
            },
          },
          create: {
            accountId: account.id,
            name: mt.name,
            language: mt.language,
            status,
            headerText,
            bodyText,
            footerText,
            buttons: buttons.length > 0 ? (buttons as any) : undefined,
            exampleValues: exampleValues ? (exampleValues as any) : undefined,
            isActive: true,
          },
          update: {
            status,
            headerText,
            bodyText,
            footerText,
            buttons: buttons.length > 0 ? (buttons as any) : undefined,
            exampleValues: exampleValues ? (exampleValues as any) : undefined,
            isActive: true,
          },
        }).catch(() => null);
      }
    }
  } catch (err: any) {
    logger.error(`Automated template sync error: ${err?.message}`);
  }
}
