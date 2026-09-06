import { Logger } from '@nestjs/common';
import {
  sendTextMessage,
  sendMediaMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  phoneVariants,
  validateInteractivePayload,
} from '@brokeros/int-whatsapp';
import { evaluateFlowConditionNode } from './flow-condition-evaluator.js';

export interface FlowNodeEnv {
  account: any;
  prisma: any;
  realtimeGateway: any;
  logger: Logger;
}

export function interpolateFlowText(
  text: string,
  contact: any,
  vars?: any,
): string {
  let res = text
    .replace(/{{\s*name\s*}}/gi, contact?.name || 'there')
    .replace(/{{\s*phone\s*}}/gi, contact?.phone || '')
    .replace(/{{\s*company\s*}}/gi, contact?.company || '');

  if (vars && typeof vars === 'object') {
    for (const [k, v] of Object.entries(vars)) {
      const regex = new RegExp(`{{\\s*vars\\.${k}\\s*}}`, 'gi');
      res = res.replace(regex, String(v ?? ''));
    }
  }
  return res;
}

export async function sendWithFlowVariants<T = any>(
  phone: string,
  senderFn: (target: string) => Promise<T>,
): Promise<T> {
  const variants = phoneVariants(phone);
  let lastErr: any = null;
  for (const v of variants) {
    try {
      return await senderFn(v);
    } catch (err: any) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Delivery failed across all phone variants');
}

export async function recordFlowBotMessage(
  run: any,
  waMessageId: string,
  body: string,
  contentType: string,
  type: any,
  prisma: any,
  realtimeGateway: any,
  interactivePayload?: any,
) {
  if (!run.conversationId) return;

  const msgRow = await prisma.whatsAppMessage.create({
    data: {
      conversationId: run.conversationId,
      waMessageId,
      direction: 'OUTBOUND',
      type,
      status: 'SENT',
      senderType: 'bot',
      contentType,
      senderName: 'Flow Bot',
      body,
      interactivePayload: interactivePayload || undefined,
      sentAt: new Date(),
    },
  });

  await prisma.whatsAppConversation.update({
    where: { id: run.conversationId },
    data: { lastMessageText: body, lastMessageAt: msgRow.sentAt },
  });

  realtimeGateway.emitMessageSent(
    run.conversationId,
    msgRow,
    run.accountId,
  );
}

export interface NodeExecutionResult {
  action: 'advance' | 'suspend' | 'terminal' | 'unknown';
  nextKey?: string | null;
}

export async function executeFlowNode(
  currentNode: any,
  run: any,
  env: FlowNodeEnv,
): Promise<NodeExecutionResult> {
  const { account, prisma, realtimeGateway, logger } = env;
  const config = (currentNode.config || {}) as Record<string, any>;

  switch (currentNode.nodeType) {
    case 'start': {
      const nextKey = config.next_node_key;
      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { currentNodeKey: nextKey },
      });
      return { action: 'advance', nextKey };
    }

    case 'send_message': {
      const contact = await prisma.whatsAppContact.findUnique({
        where: { id: run.contactId },
      });
      if (contact?.phone) {
        const text = interpolateFlowText(config.text || '', contact, run.vars);
        const res = await sendWithFlowVariants(contact.phone, (target) =>
          sendTextMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: target,
            text,
          }),
        );

        await recordFlowBotMessage(
          run,
          res.messageId,
          text,
          'text',
          'TEXT',
          prisma,
          realtimeGateway,
        );
      }

      const nextKey = config.next_node_key;
      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { currentNodeKey: nextKey },
      });
      return { action: 'advance', nextKey };
    }

    case 'send_media': {
      const contact = await prisma.whatsAppContact.findUnique({
        where: { id: run.contactId },
      });
      if (contact?.phone && config.media_url) {
        const res = await sendWithFlowVariants(contact.phone, (target) =>
          sendMediaMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: target,
            kind: config.media_type || 'image',
            link: config.media_url,
            caption: config.caption
              ? interpolateFlowText(config.caption, contact, run.vars)
              : undefined,
          }),
        );

        await recordFlowBotMessage(
          run,
          res.messageId,
          `[${config.media_type || 'Media'}]`,
          config.media_type || 'image',
          (config.media_type || 'IMAGE').toUpperCase(),
          prisma,
          realtimeGateway,
        );
      }

      const nextKey = config.next_node_key;
      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { currentNodeKey: nextKey },
      });
      return { action: 'advance', nextKey };
    }

    case 'set_tag': {
      if (config.tag_id && run.contactId) {
        if (config.mode === 'remove') {
          await prisma.whatsAppContactTag.deleteMany({
            where: { contactId: run.contactId, tagId: config.tag_id },
          });
        } else {
          await prisma.whatsAppContactTag.upsert({
            where: {
              contactId_tagId: {
                contactId: run.contactId,
                tagId: config.tag_id,
              },
            },
            create: { contactId: run.contactId, tagId: config.tag_id },
            update: {},
          });
        }
      }

      const nextKey = config.next_node_key;
      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { currentNodeKey: nextKey },
      });
      return { action: 'advance', nextKey };
    }

    case 'condition': {
      const matched = await evaluateFlowConditionNode(config, run, prisma);
      const nextKey = matched ? config.true_next : config.false_next;

      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { currentNodeKey: nextKey },
      });
      return { action: 'advance', nextKey };
    }

    // ── Suspension Node: SEND_BUTTONS ───────────────────
    case 'send_buttons': {
      const contact = await prisma.whatsAppContact.findUnique({
        where: { id: run.contactId },
      });
      if (contact?.phone) {
        const body = interpolateFlowText(config.text || '', contact, run.vars);
        const payload = {
          kind: 'buttons' as const,
          body,
          header: config.header_text,
          footer: config.footer_text,
          buttons: (config.buttons || []).map((b: any) => ({
            id: b.reply_id,
            title: b.title,
          })),
        };

        const check = validateInteractivePayload(payload);
        if (!check.ok) throw new Error(check.error);

        const res = await sendWithFlowVariants(contact.phone, (target) =>
          sendInteractiveButtons({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: target,
            bodyText: payload.body,
            headerText: payload.header,
            footerText: payload.footer,
            buttons: payload.buttons,
          }),
        );

        await recordFlowBotMessage(
          run,
          res.messageId,
          payload.body,
          'interactive_buttons',
          'INTERACTIVE',
          prisma,
          realtimeGateway,
          payload,
        );
      }

      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { currentNodeKey: currentNode.nodeKey },
      });
      return { action: 'suspend' };
    }

    // ── Suspension Node: SEND_LIST ──────────────────────
    case 'send_list': {
      const contact = await prisma.whatsAppContact.findUnique({
        where: { id: run.contactId },
      });
      if (contact?.phone) {
        const body = interpolateFlowText(config.text || '', contact, run.vars);
        const payload = {
          kind: 'list' as const,
          body,
          button_label: config.button_label || 'Select',
          header: config.header_text,
          footer: config.footer_text,
          sections: config.sections || [],
        };

        const check = validateInteractivePayload(payload);
        if (!check.ok) throw new Error(check.error);

        const res = await sendWithFlowVariants(contact.phone, (target) =>
          sendInteractiveList({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: target,
            bodyText: payload.body,
            buttonLabel: payload.button_label,
            headerText: payload.header,
            footerText: payload.footer,
            sections: payload.sections,
          }),
        );

        await recordFlowBotMessage(
          run,
          res.messageId,
          payload.body,
          'interactive_list',
          'INTERACTIVE',
          prisma,
          realtimeGateway,
          payload,
        );
      }

      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { currentNodeKey: currentNode.nodeKey },
      });
      return { action: 'suspend' };
    }

    // ── Suspension Node: COLLECT_INPUT ──────────────────
    case 'collect_input': {
      const contact = await prisma.whatsAppContact.findUnique({
        where: { id: run.contactId },
      });
      if (contact?.phone) {
        const prompt = interpolateFlowText(
          config.prompt_text || '',
          contact,
          run.vars,
        );
        const res = await sendWithFlowVariants(contact.phone, (target) =>
          sendTextMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: target,
            text: prompt,
          }),
        );

        await recordFlowBotMessage(
          run,
          res.messageId,
          prompt,
          'text',
          'TEXT',
          prisma,
          realtimeGateway,
        );
      }

      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { currentNodeKey: currentNode.nodeKey },
      });
      return { action: 'suspend' };
    }

    // ── Terminal Node: HANDOFF ──────────────────────────
    case 'handoff': {
      if (config.assign_to && run.conversationId) {
        await prisma.whatsAppConversation.update({
          where: { id: run.conversationId },
          data: { agentUserId: config.assign_to },
        });
      }

      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: {
          status: 'handed_off',
          endedAt: new Date(),
          endReason: 'handoff',
        },
      });
      return { action: 'terminal' };
    }

    // ── Terminal Node: END ──────────────────────────────
    case 'end': {
      await prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          endedAt: new Date(),
          endReason: 'completed',
        },
      });
      return { action: 'terminal' };
    }

    default:
      logger.warn(`Unknown flow node type: ${currentNode.nodeType}`);
      return { action: 'unknown' };
  }
}
