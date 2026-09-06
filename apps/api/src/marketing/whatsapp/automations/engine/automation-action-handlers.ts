import { Logger } from '@nestjs/common';
import {
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  postSafeWebhook,
  validateInteractivePayload,
} from '@brokeros/int-whatsapp';
import { WA_MAX_TAG_CHAIN_DEPTH } from '@brokeros/constants';
import { AutomationRunContext } from './automation-types.js';
import {
  interpolateAutomationText,
  sendWithPhoneVariants,
} from './automation-helpers.js';

export interface ActionHandlerEnv {
  account: any;
  contact: any;
  context: AutomationRunContext;
  prisma: any;
  realtimeGateway: any;
  logger: Logger;
  resolveConversationId: (
    accountId: string,
    contactId: string,
    context: AutomationRunContext,
  ) => Promise<string>;
  dispatchCascadeTrigger: (
    accountId: string,
    triggerType: string,
    contactId?: string | null,
    context?: AutomationRunContext,
  ) => Promise<void>;
}

export async function executeAutomationAction(
  step: any,
  env: ActionHandlerEnv,
): Promise<string> {
  const {
    account,
    contact,
    context,
    prisma,
    realtimeGateway,
    logger,
    resolveConversationId,
    dispatchCascadeTrigger,
  } = env;

  const config = (step.stepConfig || {}) as Record<string, any>;

  switch (step.stepType) {
    // 1. Send Text Message
    case 'send_message': {
      if (!contact?.phone) {
        throw new Error('send_message requires a contact with phone');
      }
      const text = interpolateAutomationText(
        config.text || '',
        contact,
        context,
      );
      if (!text.trim()) throw new Error('send_message has empty text');

      const conversationId = await resolveConversationId(
        account.id,
        contact.id,
        context,
      );

      const res = await sendWithPhoneVariants(contact.phone, (target) =>
        sendTextMessage({
          phoneNumberId: account.phoneNumberId,
          accessToken: account.accessToken,
          to: target,
          text,
        }),
      );

      const msgRow = await prisma.whatsAppMessage.create({
        data: {
          conversationId,
          waMessageId: res.messageId,
          direction: 'OUTBOUND',
          type: 'TEXT',
          status: 'SENT',
          senderType: 'bot',
          contentType: 'text',
          senderName: 'Automation',
          body: text,
          sentAt: new Date(),
        },
      });

      await prisma.whatsAppConversation.update({
        where: { id: conversationId },
        data: { lastMessageText: text, lastMessageAt: msgRow.sentAt },
      });

      realtimeGateway.emitMessageSent(conversationId, msgRow, account.id);
      return `Sent text via Meta (${res.messageId})`;
    }

    // 2. Send Media Message
    case 'send_media': {
      if (!contact?.phone) {
        throw new Error('send_media requires a contact with phone');
      }
      if (!config.mediaUrl) throw new Error('send_media requires mediaUrl');

      const conversationId = await resolveConversationId(
        account.id,
        contact.id,
        context,
      );

      const res = await sendWithPhoneVariants(contact.phone, (target) =>
        sendMediaMessage({
          phoneNumberId: account.phoneNumberId,
          accessToken: account.accessToken,
          to: target,
          kind: config.mediaKind || 'image',
          link: config.mediaUrl,
          caption: config.caption
            ? interpolateAutomationText(config.caption, contact, context)
            : undefined,
        }),
      );

      const msgRow = await prisma.whatsAppMessage.create({
        data: {
          conversationId,
          waMessageId: res.messageId,
          direction: 'OUTBOUND',
          type: (config.mediaKind || 'IMAGE').toUpperCase(),
          status: 'SENT',
          senderType: 'bot',
          contentType: config.mediaKind || 'image',
          senderName: 'Automation',
          mediaUrl: config.mediaUrl,
          caption: config.caption,
          sentAt: new Date(),
        },
      });

      await prisma.whatsAppConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageText: `[${config.mediaKind || 'Media'}]`,
          lastMessageAt: msgRow.sentAt,
        },
      });

      realtimeGateway.emitMessageSent(conversationId, msgRow, account.id);
      return `Sent media via Meta (${res.messageId})`;
    }

    // 3 & 4. Send Interactive Buttons or List
    case 'send_buttons':
    case 'send_list': {
      if (!contact?.phone) {
        throw new Error(`${step.stepType} requires a contact with phone`);
      }

      const isButtons =
        config.kind === 'buttons' ||
        (Array.isArray(config.buttons) &&
          config.buttons.length > 0 &&
          (!config.sections || config.sections.length === 0));

      const conversationId = await resolveConversationId(
        account.id,
        contact.id,
        context,
      );

      if (isButtons) {
        const payload = {
          kind: 'buttons' as const,
          body: interpolateAutomationText(
            config.bodyText || config.body || '',
            contact,
            context,
          ),
          header: config.headerText || config.header,
          footer: config.footerText || config.footer,
          buttons: config.buttons || [],
        };

        const check = validateInteractivePayload(payload);
        if (!check.ok) throw new Error(check.error);

        const res = await sendWithPhoneVariants(contact.phone, (target) =>
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

        const msgRow = await prisma.whatsAppMessage.create({
          data: {
            conversationId,
            waMessageId: res.messageId,
            direction: 'OUTBOUND',
            type: 'INTERACTIVE',
            status: 'SENT',
            senderType: 'bot',
            contentType: 'interactive_buttons',
            senderName: 'Automation',
            body: payload.body,
            interactivePayload: payload as any,
            sentAt: new Date(),
          },
        });

        await prisma.whatsAppConversation.update({
          where: { id: conversationId },
          data: { lastMessageText: payload.body, lastMessageAt: msgRow.sentAt },
        });

        realtimeGateway.emitMessageSent(conversationId, msgRow, account.id);
        return `Sent interactive buttons (${res.messageId})`;
      } else {
        const payload = {
          kind: 'list' as const,
          body: interpolateAutomationText(
            config.bodyText || config.body || '',
            contact,
            context,
          ),
          button_label: config.buttonLabel || config.button_label || 'Select',
          header: config.headerText || config.header,
          footer: config.footerText || config.footer,
          sections: config.sections || [],
        };

        const check = validateInteractivePayload(payload);
        if (!check.ok) throw new Error(check.error);

        const res = await sendWithPhoneVariants(contact.phone, (target) =>
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

        const msgRow = await prisma.whatsAppMessage.create({
          data: {
            conversationId,
            waMessageId: res.messageId,
            direction: 'OUTBOUND',
            type: 'INTERACTIVE',
            status: 'SENT',
            senderType: 'bot',
            contentType: 'interactive_list',
            senderName: 'Automation',
            body: payload.body,
            interactivePayload: payload as any,
            sentAt: new Date(),
          },
        });

        await prisma.whatsAppConversation.update({
          where: { id: conversationId },
          data: { lastMessageText: payload.body, lastMessageAt: msgRow.sentAt },
        });

        realtimeGateway.emitMessageSent(conversationId, msgRow, account.id);
        return `Sent interactive list (${res.messageId})`;
      }
    }

    // 5. Send Template (With Numeric Sort Law)
    case 'send_template': {
      if (!contact?.phone) {
        throw new Error('send_template requires a contact with phone');
      }
      const templateName = config.templateName || config.template_name;
      if (!templateName) {
        throw new Error('send_template requires templateName');
      }
      const language = config.language || config.templateLanguage || 'en_US';

      let params: string[] = [];
      if (config.variables && typeof config.variables === 'object') {
        params = Object.keys(config.variables)
          .sort((a, b) => {
            const na = Number(a);
            const nb = Number(b);
            if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
            return a.localeCompare(b);
          })
          .map((k) =>
            interpolateAutomationText(
              String(config.variables[k]),
              contact,
              context,
            ),
          );
      } else if (Array.isArray(config.params)) {
        params = config.params.map((p: any) =>
          interpolateAutomationText(String(p), contact, context),
        );
      }

      const conversationId = await resolveConversationId(
        account.id,
        contact.id,
        context,
      );

      const res = await sendWithPhoneVariants(contact.phone, (target) =>
        sendTemplateMessage({
          phoneNumberId: account.phoneNumberId,
          accessToken: account.accessToken,
          to: target,
          templateName,
          language,
          params,
        }),
      );

      const msgRow = await prisma.whatsAppMessage.create({
        data: {
          conversationId,
          waMessageId: res.messageId,
          direction: 'OUTBOUND',
          type: 'TEMPLATE',
          status: 'SENT',
          senderType: 'bot',
          contentType: 'template',
          senderName: 'Automation',
          body: `[Template: ${templateName}]`,
          templateValues: params as any,
          sentAt: new Date(),
        },
      });

      await prisma.whatsAppConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageText: `[Template: ${templateName}]`,
          lastMessageAt: msgRow.sentAt,
        },
      });

      realtimeGateway.emitMessageSent(conversationId, msgRow, account.id);
      return `Sent template (${res.messageId})`;
    }

    // 6. Add Tag (With Chain Depth Infinite Loop Guard)
    case 'add_tag': {
      const tagId = config.tagId || config.tag_id;
      if (!contact || !tagId) {
        throw new Error('add_tag requires contact and tagId');
      }

      await prisma.whatsAppContactTag.upsert({
        where: {
          contactId_tagId: { contactId: contact.id, tagId },
        },
        create: { contactId: contact.id, tagId },
        update: {},
      });

      const depth = Number(context.vars?._tag_chain_depth) || 0;
      if (depth >= WA_MAX_TAG_CHAIN_DEPTH) {
        logger.warn(
          `tag_added recursion limit reached (depth=${depth}). Halting cascade.`,
        );
        return `Tag ${tagId} added; cascade halted at depth ${depth}`;
      }

      await dispatchCascadeTrigger(account.id, 'tag_added', contact.id, {
        ...context,
        tagId,
        vars: {
          ...(context.vars || {}),
          _tag_chain_depth: depth + 1,
        },
      });

      return `Tag ${tagId} added and tag_added dispatched`;
    }

    // 7. Remove Tag
    case 'remove_tag': {
      const tagId = config.tagId || config.tag_id;
      if (!contact || !tagId) {
        throw new Error('remove_tag requires contact and tagId');
      }
      await prisma.whatsAppContactTag.deleteMany({
        where: { contactId: contact.id, tagId },
      });
      return `Tag ${tagId} removed`;
    }

    // 8. Assign Conversation
    case 'assign_conversation': {
      let agentId = config.agentUserId || config.agent_id || config.user_id;
      const mode = config.mode || (agentId ? 'specific_agent' : 'round_robin');

      if (mode === 'round_robin' || !agentId) {
        const activeAgents = await prisma.user.findMany({
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            role: true,
            _count: {
              select: {
                whatsappConversations: {
                  where: { status: 'open' },
                },
              },
            },
          },
        });

        if (activeAgents.length > 0) {
          activeAgents.sort(
            (a: any, b: any) =>
              a._count.whatsappConversations - b._count.whatsappConversations,
          );
          agentId = activeAgents[0].id;
        }
      }
      if (!agentId) return 'No agent resolved';

      const conversationId = await resolveConversationId(
        account.id,
        contact.id,
        context,
      );
      const updatedConv = await prisma.whatsAppConversation.update({
        where: { id: conversationId },
        data: { agentUserId: agentId },
      });

      realtimeGateway.emitConversationUpdated(account.id, updatedConv);
      return `Assigned conversation to ${agentId}`;
    }

    // 9. Close Conversation
    case 'close_conversation': {
      const conversationId = await resolveConversationId(
        account.id,
        contact?.id,
        context,
      );
      if (conversationId) {
        const updatedConv = await prisma.whatsAppConversation.update({
          where: { id: conversationId },
          data: { status: 'closed' },
        });
        realtimeGateway.emitConversationUpdated(account.id, updatedConv);
        return `Closed conversation ${conversationId}`;
      }
      return 'Conversation marked as closed';
    }

    // 10. Send Outbound Webhook
    case 'send_webhook': {
      if (!config.url) throw new Error('send_webhook requires url');
      const rawTemplate = config.bodyTemplate || config.body_template;
      let body: any;
      if (rawTemplate) {
        const interpolated = interpolateAutomationText(
          rawTemplate,
          contact,
          context,
        );
        try {
          body = JSON.parse(interpolated);
        } catch {
          body = interpolated;
        }
      } else {
        body = {
          event: 'automation_step',
          contact: contact
            ? { id: contact.id, phone: contact.phone, name: contact.name }
            : null,
          context,
        };
      }

      await postSafeWebhook(config.url, body, config.secret);
      return `Webhook delivered to ${config.url}`;
    }

    // 11. Update Contact Field
    case 'update_contact_field': {
      if (!contact) throw new Error('update_contact_field requires contact');
      const fieldName = String(config.field || '');
      const val = interpolateAutomationText(
        config.value || '',
        contact,
        context,
      );

      if (fieldName.startsWith('custom:')) {
        const customFieldId = fieldName.replace(/^custom:/, '');
        await prisma.whatsAppContactCustomValue.upsert({
          where: {
            contactId_fieldId: {
              contactId: contact.id,
              fieldId: customFieldId,
            },
          },
          create: {
            contactId: contact.id,
            fieldId: customFieldId,
            value: val,
          },
          update: {
            value: val,
          },
        });
        return `Updated custom field ${customFieldId} to "${val}"`;
      }

      const allowed = ['name', 'email', 'company'];
      if (!allowed.includes(fieldName)) {
        return `Field ${fieldName} is not writable`;
      }
      await prisma.whatsAppContact.update({
        where: { id: contact.id },
        data: { [fieldName]: val },
      });
      return `Updated contact field ${fieldName}`;
    }

    // 12. Create Pipeline Deal
    case 'create_deal': {
      if (!contact) throw new Error('create_deal requires contact');
      const pipelineId = config.pipelineId || config.pipeline_id;
      const stageId = config.stageId || config.stage_id;
      if (!pipelineId || !stageId) {
        throw new Error('create_deal requires pipeline and stage');
      }

      const fallbackTitle = `Deal - ${contact.name || contact.phone}`;
      const title = interpolateAutomationText(
        config.title || fallbackTitle,
        contact,
        context,
      );
      const value = Number(config.value || config.deal_value || 0) || 0;
      const assignedUserId =
        config.assignedUserId || config.user_id || undefined;
      const conversationId = await resolveConversationId(
        account.id,
        contact.id,
        context,
      );

      const deal = await prisma.whatsAppDeal.create({
        data: {
          accountId: account.id,
          pipelineId,
          stageId,
          contactId: contact.id,
          conversationId,
          title,
          value,
          assignedUserId,
        },
      });

      await prisma.whatsAppDealActivity.create({
        data: {
          dealId: deal.id,
          type: 'created_by_automation',
          details: {
            automationId: step.automationId,
            stepId: step.id,
          },
        },
      });

      return `Created pipeline deal "${title}" (ID: ${deal.id})`;
    }

    default:
      return `Unknown step: ${step.stepType}`;
  }
}
