// ============================================================================
// BrokerOS — WhatsApp Automation Execution Engine (1:1 wacrm Engine Parity)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  phoneVariants,
  postSafeWebhook,
  validateInteractivePayload,
} from '@brokeros/int-whatsapp';
import { WA_MAX_TAG_CHAIN_DEPTH } from '@brokeros/constants';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';
import { WhatsAppRealtimeGateway } from '../gateway/whatsapp-realtime.gateway.js';

export interface AutomationRunContext {
  messageText?: string;
  conversationId?: string;
  tagId?: string;
  interactiveReplyId?: string;
  agentId?: string;
  vars?: Record<string, any>;
}

interface ExecuteStepsArgs {
  automation: any;
  contactId: string | null;
  context: AutomationRunContext;
  parentStepId: string | null;
  branch: 'yes' | 'no' | null;
  startPosition: number;
  logId: string | null;
}

@Injectable()
export class WhatsAppAutomationEngineService {
  private readonly logger = new Logger(WhatsAppAutomationEngineService.name);
  private readonly prisma = prismaClient;

  constructor(
    private readonly configService: WhatsAppConfigService,
    private readonly realtimeGateway: WhatsAppRealtimeGateway,
  ) { }

  /**
   * Fire all active automations matching the given trigger for an account.
   * Fire-and-forget: never throws to caller.
   */
  async runAutomationsForTrigger(
    accountId: string,
    triggerType: string,
    contactId?: string | null,
    context: AutomationRunContext = {},
  ): Promise<void> {
    try {
      // 1. Tenant ownership validation
      if (contactId) {
        const owned = await this.prisma.whatsAppContact.findFirst({
          where: { id: contactId, accountId, deletedAt: null },
          select: { id: true },
        });
        if (!owned) {
          this.logger.warn(
            `Contact ${contactId} does not belong to account ${accountId}. Refusing automation dispatch.`,
          );
          return;
        }
      }

      // 2. Fetch active automations matching trigger
      const automations = await this.prisma.whatsAppAutomation.findMany({
        where: {
          accountId,
          triggerType,
          isActive: true,
        },
      });

      if (automations.length === 0) return;

      for (const automation of automations) {
        if (!this.matchesTrigger(automation, context)) continue;

        // Execute asynchronously
        this.executeAutomation(automation, contactId || null, context).catch(
          (err) => {
            this.logger.error(
              `Automation ${automation.id} execution failed: ${err?.message}`,
            );
          },
        );
      }
    } catch (err: any) {
      this.logger.error(`runAutomationsForTrigger error: ${err?.message}`);
    }
  }

  /**
   * Evaluate whether trigger filters match the event context.
   */
  private matchesTrigger(
    automation: any,
    context: AutomationRunContext,
  ): boolean {
    const config = (automation.triggerConfig || {}) as Record<string, any>;

    if (automation.triggerType === 'keyword_match') {
      const keywords: string[] = config.keywords || [];
      const matchType: string = config.matchType || 'contains';
      const text = (context.messageText || '').trim().toLowerCase();

      if (!text || keywords.length === 0) return false;

      return keywords.some((kw) => {
        const cleanKw = kw.trim().toLowerCase();
        if (!cleanKw) return false;
        if (matchType === 'exact') return text === cleanKw;
        if (matchType === 'starts_with') return text.startsWith(cleanKw);

        // Unicode word-boundary matching (wacrm engine standard)
        try {
          const escaped = cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const unicodeRegex = new RegExp(
            `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,
            'iu',
          );
          if (unicodeRegex.test(text)) return true;
        } catch {
          // Fallback if lookarounds not supported
        }
        return text.includes(cleanKw);
      });
    }

    if (automation.triggerType === 'interactive_reply') {
      const targetId = config.buttonId || config.rowId || config.id;
      if (!targetId || !context.interactiveReplyId) return false;
      return context.interactiveReplyId === targetId;
    }

    if (automation.triggerType === 'tag_added') {
      const targetTagId = config.tagId;
      if (!targetTagId || !context.tagId) return false;
      return context.tagId === targetTagId;
    }

    return true;
  }

  /**
   * Top-level automation executor. Seeds log pessimistically and executes tree.
   */
  async executeAutomation(
    automation: any,
    contactId: string | null,
    context: AutomationRunContext = {},
  ): Promise<void> {
    // 1. Seed audit log pessimistically with status = 'failed'
    // Status only flips to 'success' if execution reaches the very end
    const log = await this.prisma.whatsAppAutomationLog.create({
      data: {
        automationId: automation.id,
        accountId: automation.accountId,
        contactId,
        triggerEvent: automation.triggerType,
        status: 'failed',
        stepsExecuted: { steps: [], context } as any,
      },
    });

    try {
      await this.executeStepsFrom({
        automation,
        contactId,
        context,
        parentStepId: null,
        branch: null,
        startPosition: 0,
        logId: log.id,
      });
    } catch (err: any) {
      this.logger.error(
        `Execution error in automation ${automation.id}: ${err?.message}`,
      );
      await this.prisma.whatsAppAutomationLog.update({
        where: { id: log.id },
        data: { errorMessage: err?.message || 'Unknown error' },
      });
    }
  }

  /**
   * Recursive tree executor for automation steps. Scoped by parentStepId and branch.
   */
  private async executeStepsFrom(args: ExecuteStepsArgs): Promise<void> {
    const {
      automation,
      contactId,
      context,
      parentStepId,
      branch,
      startPosition,
      logId,
    } = args;

    const account = await this.configService.getDecryptedAccount(
      automation.accountId,
    );
    if (!account) return;

    let contact: any = null;
    if (contactId) {
      contact = await this.prisma.whatsAppContact.findUnique({
        where: { id: contactId },
        include: { tags: true },
      });
    }

    // Query steps scoped to current branch level
    const steps = await this.prisma.whatsAppAutomationStep.findMany({
      where: {
        automationId: automation.id,
        parentStepId: parentStepId ?? null,
        branch: parentStepId ? (branch ?? 'yes') : null,
        position: { gte: startPosition },
      },
      orderBy: { position: 'asc' },
    });

    if (steps.length === 0) {
      if (parentStepId === null && logId) {
        await this.finalizeLog(logId, 'success', null);
      }
      return;
    }

    const stepResults: any[] = [];
    let status: 'success' | 'partial' | 'failed' = 'success';
    let errorMessage: string | null = null;

    for (const step of steps) {
      const config = (step.stepConfig || {}) as Record<string, any>;

      // ── Step: WAIT ──────────────────────────────────────────
      if (step.stepType === 'wait') {
        const delayMinutes = Math.max(1, Number(config.delayMinutes) || 1);
        const runAt = new Date(Date.now() + delayMinutes * 60 * 1000);

        await this.prisma.whatsAppAutomationPendingExecution.create({
          data: {
            automationId: automation.id,
            accountId: automation.accountId,
            contactId,
            parentStepId,
            branch,
            nextStepPosition: step.position + 1,
            context: context as any,
            runAt,
            status: 'pending',
            logId,
          },
        });

        stepResults.push({
          stepId: step.id,
          stepType: 'wait',
          status: 'success',
          detail: `Waiting ${delayMinutes} minute(s)`,
        });

        status = 'partial';
        await this.appendResults(logId, stepResults, status, errorMessage);
        return; // Halt immediate execution in this scope
      }

      try {
        // ── Step: CONDITION ───────────────────────────────────
        if (step.stepType === 'condition') {
          const taken = this.evaluateCondition(config, contact, context);
          const chosenBranch = taken ? 'yes' : 'no';

          stepResults.push({
            stepId: step.id,
            stepType: 'condition',
            status: 'success',
            detail: `branch=${chosenBranch}`,
          });

          // Recurse into child steps of the chosen branch
          await this.executeStepsFrom({
            ...args,
            parentStepId: step.id,
            branch: chosenBranch,
            startPosition: 0,
          });
          continue;
        }

        // ── Step: ALL OTHER TYPES ─────────────────────────────
        const detail = await this.runStep(step, account, contact, context);
        stepResults.push({
          stepId: step.id,
          stepType: step.stepType,
          status: 'success',
          detail,
        });
      } catch (err: any) {
        const msg = err?.message || String(err);
        stepResults.push({
          stepId: step.id,
          stepType: step.stepType,
          status: 'failed',
          detail: msg,
        });
        status = 'failed';
        errorMessage = msg;
        break; // Stop running remaining steps on error
      }
    }

    if (parentStepId === null) {
      await this.appendResults(logId, stepResults, status, errorMessage);
    } else {
      await this.appendResults(logId, stepResults, null, errorMessage);
    }
  }

  /**
   * Execute an individual automation step and record bot messages in the database.
   */
  private async runStep(
    step: any,
    account: any,
    contact: any,
    context: AutomationRunContext,
  ): Promise<string> {
    const config = (step.stepConfig || {}) as Record<string, any>;

    switch (step.stepType) {
      // 1. Send Text Message
      case 'send_message': {
        if (!contact?.phone)
          throw new Error('send_message requires a contact with phone');
        const text = this.interpolate(config.text || '', contact, context);
        if (!text.trim()) throw new Error('send_message has empty text');

        const conversationId = await this.resolveConversationId(
          account.id,
          contact.id,
          context,
        );

        const res = await this.sendWithVariants(contact.phone, (target) =>
          sendTextMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: target,
            text,
          }),
        );

        // Record bot message in database & emit live Socket.IO update
        const msgRow = await this.prisma.whatsAppMessage.create({
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

        await this.prisma.whatsAppConversation.update({
          where: { id: conversationId },
          data: { lastMessageText: text, lastMessageAt: msgRow.sentAt },
        });

        this.realtimeGateway.emitMessageSent(
          conversationId,
          msgRow,
          account.id,
        );
        return `Sent text via Meta (${res.messageId})`;
      }

      // 2. Send Media Message
      case 'send_media': {
        if (!contact?.phone)
          throw new Error('send_media requires a contact with phone');
        if (!config.mediaUrl) throw new Error('send_media requires mediaUrl');

        const conversationId = await this.resolveConversationId(
          account.id,
          contact.id,
          context,
        );

        const res = await this.sendWithVariants(contact.phone, (target) =>
          sendMediaMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: target,
            kind: config.mediaKind || 'image',
            link: config.mediaUrl,
            caption: config.caption
              ? this.interpolate(config.caption, contact, context)
              : undefined,
          }),
        );

        const msgRow = await this.prisma.whatsAppMessage.create({
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

        await this.prisma.whatsAppConversation.update({
          where: { id: conversationId },
          data: {
            lastMessageText: `[${config.mediaKind || 'Media'}]`,
            lastMessageAt: msgRow.sentAt,
          },
        });

        this.realtimeGateway.emitMessageSent(
          conversationId,
          msgRow,
          account.id,
        );
        return `Sent media via Meta (${res.messageId})`;
      }

      // 3 & 4. Send Interactive Buttons or List
      case 'send_buttons':
      case 'send_list': {
        if (!contact?.phone)
          throw new Error(`${step.stepType} requires a contact with phone`);

        const isButtons =
          config.kind === 'buttons' ||
          (Array.isArray(config.buttons) &&
            config.buttons.length > 0 &&
            (!config.sections || config.sections.length === 0));

        const conversationId = await this.resolveConversationId(
          account.id,
          contact.id,
          context,
        );

        if (isButtons) {
          const payload = {
            kind: 'buttons' as const,
            body: this.interpolate(
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

          const res = await this.sendWithVariants(contact.phone, (target) =>
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

          const msgRow = await this.prisma.whatsAppMessage.create({
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

          await this.prisma.whatsAppConversation.update({
            where: { id: conversationId },
            data: { lastMessageText: payload.body, lastMessageAt: msgRow.sentAt },
          });

          this.realtimeGateway.emitMessageSent(
            conversationId,
            msgRow,
            account.id,
          );
          return `Sent interactive buttons (${res.messageId})`;
        } else {
          const payload = {
            kind: 'list' as const,
            body: this.interpolate(
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

          const res = await this.sendWithVariants(contact.phone, (target) =>
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

          const msgRow = await this.prisma.whatsAppMessage.create({
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

          await this.prisma.whatsAppConversation.update({
            where: { id: conversationId },
            data: { lastMessageText: payload.body, lastMessageAt: msgRow.sentAt },
          });

          this.realtimeGateway.emitMessageSent(
            conversationId,
            msgRow,
            account.id,
          );
          return `Sent interactive list (${res.messageId})`;
        }
      }

      // 5. Send Template (With Numeric Sort Law)
      case 'send_template': {
        if (!contact?.phone)
          throw new Error('send_template requires a contact with phone');
        const templateName = config.templateName || config.template_name;
        if (!templateName)
          throw new Error('send_template requires templateName');
        const language = config.language || config.templateLanguage || 'en_US';

        // Meta templates use positional {{1}}, {{2}}, ... placeholders.
        // We MUST sort keys numerically so "10" does not precede "2"!
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
              this.interpolate(String(config.variables[k]), contact, context),
            );
        } else if (Array.isArray(config.params)) {
          params = config.params.map((p: any) =>
            this.interpolate(String(p), contact, context),
          );
        }

        const conversationId = await this.resolveConversationId(
          account.id,
          contact.id,
          context,
        );

        const res = await this.sendWithVariants(contact.phone, (target) =>
          sendTemplateMessage({
            phoneNumberId: account.phoneNumberId,
            accessToken: account.accessToken,
            to: target,
            templateName,
            language,
            params,
          }),
        );

        const msgRow = await this.prisma.whatsAppMessage.create({
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

        await this.prisma.whatsAppConversation.update({
          where: { id: conversationId },
          data: {
            lastMessageText: `[Template: ${templateName}]`,
            lastMessageAt: msgRow.sentAt,
          },
        });

        this.realtimeGateway.emitMessageSent(
          conversationId,
          msgRow,
          account.id,
        );
        return `Sent template (${res.messageId})`;
      }

      // 6. Add Tag (With Chain Depth Infinite Loop Guard)
      case 'add_tag': {
        const tagId = config.tagId || config.tag_id;
        if (!contact || !tagId)
          throw new Error('add_tag requires contact and tagId');

        await this.prisma.whatsAppContactTag.upsert({
          where: {
            contactId_tagId: { contactId: contact.id, tagId },
          },
          create: { contactId: contact.id, tagId },
          update: {},
        });

        // Guard against infinite recursive tag triggers
        const depth = Number(context.vars?._tag_chain_depth) || 0;
        if (depth >= WA_MAX_TAG_CHAIN_DEPTH) {
          this.logger.warn(
            `tag_added recursion limit reached (depth=${depth}). Halting cascade.`,
          );
          return `Tag ${tagId} added; cascade halted at depth ${depth}`;
        }

        await this.runAutomationsForTrigger(
          account.id,
          'tag_added',
          contact.id,
          {
            ...context,
            tagId,
            vars: {
              ...(context.vars || {}),
              _tag_chain_depth: depth + 1,
            },
          },
        );

        return `Tag ${tagId} added and tag_added dispatched`;
      }

      // 7. Remove Tag
      case 'remove_tag': {
        const tagId = config.tagId || config.tag_id;
        if (!contact || !tagId)
          throw new Error('remove_tag requires contact and tagId');
        await this.prisma.whatsAppContactTag.deleteMany({
          where: { contactId: contact.id, tagId },
        });
        return `Tag ${tagId} removed`;
      }

      // 8. Assign Conversation (Supports Specific Agent & Load-Balanced Round-Robin)
      case 'assign_conversation': {
        let agentId = config.agentUserId || config.agent_id || config.user_id;
        const mode = config.mode || (agentId ? 'specific_agent' : 'round_robin');

        if (mode === 'round_robin' || !agentId) {
          const activeAgents = await this.prisma.user.findMany({
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
              (a, b) =>
                a._count.whatsappConversations - b._count.whatsappConversations,
            );
            agentId = activeAgents[0].id;
          }
        }
        if (!agentId) return 'No agent resolved';

        const conversationId = await this.resolveConversationId(
          account.id,
          contact.id,
          context,
        );
        const updatedConv = await this.prisma.whatsAppConversation.update({
          where: { id: conversationId },
          data: { agentUserId: agentId },
        });

        this.realtimeGateway.emitConversationUpdated(account.id, updatedConv);
        return `Assigned conversation to ${agentId}`;
      }

      // 9. Close Conversation
      case 'close_conversation': {
        const conversationId = await this.resolveConversationId(
          account.id,
          contact.id,
          context,
        );
        const updatedConv = await this.prisma.whatsAppConversation.update({
          where: { id: conversationId },
          data: { status: 'closed' },
        });

        this.realtimeGateway.emitConversationUpdated(account.id, updatedConv);
        return 'Conversation closed';
      }

      // 10. Send Outbound Webhook (SSRF Protected & Custom Body Template)
      case 'send_webhook': {
        if (!config.url) throw new Error('send_webhook requires url');
        const rawTemplate = config.bodyTemplate || config.body_template;
        let body: any;
        if (rawTemplate) {
          const interpolated = this.interpolate(rawTemplate, contact, context);
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

      // 11. Update Contact Field (Standard & Custom Fields)
      case 'update_contact_field': {
        if (!contact) throw new Error('update_contact_field requires contact');
        const fieldName = String(config.field || '');
        const val = this.interpolate(config.value || '', contact, context);

        if (fieldName.startsWith('custom:')) {
          const customFieldId = fieldName.replace(/^custom:/, '');
          await this.prisma.whatsAppContactCustomValue.upsert({
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
        await this.prisma.whatsAppContact.update({
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
        const title = this.interpolate(
          config.title || fallbackTitle,
          contact,
          context,
        );
        const value = Number(config.value || config.deal_value || 0) || 0;
        const assignedUserId =
          config.assignedUserId || config.user_id || undefined;
        const conversationId = await this.resolveConversationId(
          account.id,
          contact.id,
          context,
        );

        const deal = await this.prisma.whatsAppDeal.create({
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

        await this.prisma.whatsAppDealActivity.create({
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

      // 13. Close Conversation
      case 'close_conversation': {
        const conversationId = await this.resolveConversationId(
          account.id,
          contact?.id,
          context,
        );
        if (conversationId) {
          await this.prisma.whatsAppConversation.update({
            where: { id: conversationId },
            data: { status: 'closed' },
          });
          this.realtimeGateway.emitConversationUpdated(conversationId, {
            status: 'closed',
          });
          return `Closed conversation ${conversationId}`;
        }
        return 'Conversation marked as closed';
      }

      default:
        return `Unknown step: ${step.stepType}`;
    }
  }

  /**
   * Resume an automation parked at a wait step.
   */
  async resumePendingExecution(pendingId: string): Promise<void> {
    const pending =
      await this.prisma.whatsAppAutomationPendingExecution.findUnique({
        where: { id: pendingId },
        include: { automation: true },
      });

    if (!pending || pending.status !== 'pending') return;

    await this.prisma.whatsAppAutomationPendingExecution.update({
      where: { id: pending.id },
      data: { status: 'running' },
    });

    try {
      await this.executeStepsFrom({
        automation: pending.automation,
        contactId: pending.contactId,
        context: (pending.context as any) || {},
        parentStepId: pending.parentStepId,
        branch: pending.branch as any,
        startPosition: pending.nextStepPosition,
        logId: pending.logId,
      });

      await this.prisma.whatsAppAutomationPendingExecution.update({
        where: { id: pending.id },
        data: { status: 'completed' },
      });
    } catch (err: any) {
      await this.prisma.whatsAppAutomationPendingExecution.update({
        where: { id: pending.id },
        data: { status: 'failed' },
      });
      throw err;
    }
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  private async resolveConversationId(
    accountId: string,
    contactId: string,
    context: AutomationRunContext,
  ): Promise<string> {
    if (context.conversationId) return context.conversationId;

    const existing = await this.prisma.whatsAppConversation.findFirst({
      where: { accountId, contactId, isActive: true },
      select: { id: true },
    });
    if (existing) return existing.id;

    const contact = await this.prisma.whatsAppContact.findUnique({
      where: { id: contactId },
    });
    if (!contact)
      throw new Error('Cannot resolve conversation: contact not found');

    const created = await this.prisma.whatsAppConversation.create({
      data: {
        accountId,
        contactId,
        contactPhone: contact.phone,
        contactName: contact.name,
        status: 'open',
      },
    });
    return created.id;
  }

  private evaluateCondition(
    config: Record<string, any>,
    contact: any,
    context: AutomationRunContext,
  ): boolean {
    const field = config.field;
    const operator = config.operator || 'equals';
    const expected = config.value;

    let actual: any = null;
    if (field === 'tag') {
      const hasTag = contact?.tags?.some((t: any) => t.tagId === expected);
      return operator === 'not_has' ? !hasTag : hasTag;
    } else if (field === 'message_text') {
      actual = context.messageText || '';
    } else if (contact && contact[field] !== undefined) {
      actual = contact[field];
    }

    if (operator === 'equals') return actual === expected;
    if (operator === 'not_equals') return actual !== expected;
    if (operator === 'contains') {
      return String(actual)
        .toLowerCase()
        .includes(String(expected).toLowerCase());
    }
    return Boolean(actual);
  }

  private interpolate(
    text: string,
    contact: any,
    context: AutomationRunContext,
  ): string {
    return text
      .replace(/{{\s*name\s*}}/gi, contact?.name || 'there')
      .replace(/{{\s*phone\s*}}/gi, contact?.phone || '')
      .replace(/{{\s*company\s*}}/gi, contact?.company || '')
      .replace(/{{\s*message\s*}}/gi, context.messageText || '');
  }

  private async sendWithVariants(
    phone: string,
    senderFn: (target: string) => Promise<any>,
  ) {
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

  private async appendResults(
    logId: string | null,
    newResults: any[],
    finalStatus: 'success' | 'partial' | 'failed' | null,
    errorMessage: string | null,
  ) {
    if (!logId) return;

    try {
      const current = await this.prisma.whatsAppAutomationLog.findUnique({
        where: { id: logId },
        select: { stepsExecuted: true },
      });

      const currentSteps =
        ((current?.stepsExecuted as any)?.steps as any[]) || [];
      const mergedSteps = [...currentSteps, ...newResults];

      const data: Record<string, any> = {
        stepsExecuted: { steps: mergedSteps },
      };
      if (finalStatus) data.status = finalStatus;
      if (errorMessage) data.errorMessage = errorMessage;

      await this.prisma.whatsAppAutomationLog.update({
        where: { id: logId },
        data,
      });
    } catch (err: any) {
      this.logger.error(`Failed to append log results: ${err?.message}`);
    }
  }

  private async finalizeLog(
    logId: string | null,
    status: 'success' | 'failed',
    errorMessage: string | null,
  ) {
    if (!logId) return;
    await this.prisma.whatsAppAutomationLog
      .update({
        where: { id: logId },
        data: { status, errorMessage },
      })
      .catch(() => null);
  }
}
