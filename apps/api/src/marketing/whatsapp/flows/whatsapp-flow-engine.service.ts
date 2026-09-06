// ============================================================================
// BrokerOS — WhatsApp Flow Runtime Engine (1:1 wacrm Engine Parity)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  sendTextMessage,
  sendMediaMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  phoneVariants,
  validateInteractivePayload,
} from '@brokeros/int-whatsapp';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';
import { WhatsAppRealtimeGateway } from '../gateway/whatsapp-realtime.gateway.js';

export interface FlowInboundMessage {
  kind: 'text' | 'button_reply' | 'list_reply';
  text?: string;
  replyId?: string;
  replyTitle?: string;
}

@Injectable()
export class WhatsAppFlowEngineService {
  private readonly logger = new Logger(WhatsAppFlowEngineService.name);
  private readonly prisma = prismaClient;

  constructor(
    private readonly configService: WhatsAppConfigService,
    private readonly realtimeGateway: WhatsAppRealtimeGateway,
  ) {}

  /**
   * Dispatch an inbound message to the flows subsystem.
   * Returns { handled: true, runId } if processed or initiated by a flow,
   * or { handled: false } so callers know to proceed with automations.
   */
  async dispatchInboundToFlows(args: {
    accountId: string;
    contactId: string;
    conversationId: string;
    message: FlowInboundMessage;
    isFirstInbound?: boolean;
  }): Promise<{ handled: boolean; runId?: string }> {
    const { accountId, contactId, conversationId, message, isFirstInbound } =
      args;

    try {
      // 1. Check if an active flow run already exists for this contact
      const activeRun = await this.prisma.whatsAppFlowRun.findFirst({
        where: {
          accountId,
          contactId,
          status: 'active',
        },
        include: {
          flow: true,
        },
        orderBy: { startedAt: 'desc' },
      });

      if (activeRun) {
        await this.handleReplyForActiveRun(activeRun, message);
        return { handled: true, runId: activeRun.id };
      }

      // 2. No active run: check if inbound message triggers a new active flow
      const matchedFlow = await this.findMatchingEntryFlow(
        accountId,
        message,
        Boolean(isFirstInbound),
      );

      if (matchedFlow) {
        const run = await this.startFlowRun(
          matchedFlow,
          contactId,
          conversationId,
          accountId,
        );
        return { handled: true, runId: run.id };
      }

      return { handled: false };
    } catch (err: any) {
      this.logger.error(`dispatchInboundToFlows error: ${err?.message}`);
      return { handled: false };
    }
  }

  /**
   * Pause active flow run if a human agent intervenes and sends a message.
   */
  async handleAgentPreemption(conversationId: string): Promise<void> {
    try {
      const activeRun = await this.prisma.whatsAppFlowRun.findFirst({
        where: { conversationId, status: 'active' },
      });

      if (activeRun) {
        this.logger.log(
          `Agent intervened in conversation ${conversationId}. Pausing active flow run ${activeRun.id}.`,
        );
        await this.prisma.whatsAppFlowRun.update({
          where: { id: activeRun.id },
          data: {
            status: 'paused_by_agent',
            endedAt: new Date(),
            endReason: 'agent_intervened',
          },
        });
      }
    } catch (err: any) {
      this.logger.error(`handleAgentPreemption error: ${err?.message}`);
    }
  }

  /**
   * Start a new flow execution run and execute nodes up to the first suspension point.
   */
  async startFlowRun(
    flow: any,
    contactId: string,
    conversationId: string,
    accountId: string,
  ): Promise<any> {
    const run = await this.prisma.whatsAppFlowRun.create({
      data: {
        flowId: flow.id,
        accountId,
        contactId,
        conversationId,
        status: 'active',
        currentNodeKey: 'start',
        vars: {},
      },
    });

    const nodes = await this.prisma.whatsAppFlowNode.findMany({
      where: { flowId: flow.id },
    });

    const nodesMap = new Map<string, any>();
    for (const node of nodes) {
      nodesMap.set(node.nodeKey, node);
    }

    // Find entry point node
    const startNode =
      nodesMap.get('start') || nodes.find((n) => n.nodeType === 'start');
    if (!startNode) {
      this.logger.warn(`Flow ${flow.id} has no start node.`);
      await this.prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          endedAt: new Date(),
          endReason: 'missing_start_node',
        },
      });
      return run;
    }

    // Run node loop
    await this.executeNodeLoop(run, startNode, nodesMap);
    return run;
  }

  /**
   * Process customer reply for an active flow run.
   */
  private async handleReplyForActiveRun(
    run: any,
    message: FlowInboundMessage,
  ): Promise<void> {
    const nodes = await this.prisma.whatsAppFlowNode.findMany({
      where: { flowId: run.flowId },
    });

    const nodesMap = new Map<string, any>();
    for (const node of nodes) {
      nodesMap.set(node.nodeKey, node);
    }

    const currentNode = nodesMap.get(run.currentNodeKey);
    if (!currentNode) {
      this.logger.warn(
        `Run ${run.id} is at unknown nodeKey ${run.currentNodeKey}`,
      );
      await this.prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          endedAt: new Date(),
          endReason: 'node_not_found',
        },
      });
      return;
    }

    const config = (currentNode.config || {}) as Record<string, any>;

    // Case 1: Suspended at send_buttons
    if (currentNode.nodeType === 'send_buttons') {
      const buttons: Array<{
        reply_id: string;
        title: string;
        next_node_key: string;
      }> = config.buttons || [];
      const hit = buttons.find(
        (b) =>
          (message.replyId && b.reply_id === message.replyId) ||
          (message.text &&
            b.title.trim().toLowerCase() === message.text.trim().toLowerCase()),
      );

      if (hit && hit.next_node_key) {
        const vars = (run.vars || {}) as Record<string, any>;
        await this.prisma.whatsAppFlowRun.update({
          where: { id: run.id },
          data: {
            currentNodeKey: hit.next_node_key,
            vars: { ...vars, _reprompt_count: 0 },
          },
        });
        const nextNode = nodesMap.get(hit.next_node_key);
        if (nextNode) await this.executeNodeLoop(run, nextNode, nodesMap);
        return;
      }

      await this.handleFallback(run, currentNode, nodesMap);
      return;
    }

    // Case 2: Suspended at send_list
    if (currentNode.nodeType === 'send_list') {
      let hitKey: string | null = null;
      for (const section of config.sections || []) {
        for (const row of section.rows || []) {
          if (
            (message.replyId && row.reply_id === message.replyId) ||
            (message.text &&
              row.title.trim().toLowerCase() ===
                message.text.trim().toLowerCase())
          ) {
            hitKey = row.next_node_key;
            break;
          }
        }
        if (hitKey) break;
      }

      if (hitKey) {
        const vars = (run.vars || {}) as Record<string, any>;
        await this.prisma.whatsAppFlowRun.update({
          where: { id: run.id },
          data: {
            currentNodeKey: hitKey,
            vars: { ...vars, _reprompt_count: 0 },
          },
        });
        const nextNode = nodesMap.get(hitKey);
        if (nextNode) await this.executeNodeLoop(run, nextNode, nodesMap);
        return;
      }

      await this.handleFallback(run, currentNode, nodesMap);
      return;
    }

    // Case 3: Suspended at collect_input
    if (currentNode.nodeType === 'collect_input') {
      const text = (message.text || '').trim();
      if (text) {
        const currentVars = (run.vars || {}) as Record<string, any>;
        const varKey = config.var_key || 'user_input';
        const updatedVars = { ...currentVars, [varKey]: text };

        const nextKey = config.next_node_key;
        await this.prisma.whatsAppFlowRun.update({
          where: { id: run.id },
          data: {
            vars: { ...updatedVars, _reprompt_count: 0 },
            currentNodeKey: nextKey,
          },
        });

        if (nextKey) {
          const nextNode = nodesMap.get(nextKey);
          if (nextNode) await this.executeNodeLoop(run, nextNode, nodesMap);
        }
        return;
      }

      await this.handleFallback(run, currentNode, nodesMap);
      return;
    }
  }

  /**
   * Execute auto-advancing nodes in an in-memory loop until a suspension or terminal node.
   */
  private async executeNodeLoop(
    run: any,
    initialNode: any,
    nodesMap: Map<string, any>,
  ): Promise<void> {
    const account = await this.configService.getDecryptedAccount(run.accountId);
    if (!account) return;

    let currentNode = initialNode;

    while (currentNode) {
      const config = (currentNode.config || {}) as Record<string, any>;

      switch (currentNode.nodeType) {
        case 'start': {
          const nextKey = config.next_node_key;
          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: { currentNodeKey: nextKey },
          });
          currentNode = nextKey ? nodesMap.get(nextKey) : null;
          break;
        }

        case 'send_message': {
          const contact = await this.prisma.whatsAppContact.findUnique({
            where: { id: run.contactId },
          });
          if (contact?.phone) {
            const text = this.interpolate(config.text || '', contact, run.vars);
            const res = await this.sendWithVariants(contact.phone, (target) =>
              sendTextMessage({
                phoneNumberId: account.phoneNumberId,
                accessToken: account.accessToken,
                to: target,
                text,
              }),
            );

            await this.recordBotMessage(
              run,
              res.messageId,
              text,
              'text',
              'TEXT',
            );
          }

          const nextKey = config.next_node_key;
          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: { currentNodeKey: nextKey },
          });
          currentNode = nextKey ? nodesMap.get(nextKey) : null;
          break;
        }

        case 'send_media': {
          const contact = await this.prisma.whatsAppContact.findUnique({
            where: { id: run.contactId },
          });
          if (contact?.phone && config.media_url) {
            const res = await this.sendWithVariants(contact.phone, (target) =>
              sendMediaMessage({
                phoneNumberId: account.phoneNumberId,
                accessToken: account.accessToken,
                to: target,
                kind: config.media_type || 'image',
                link: config.media_url,
                caption: config.caption
                  ? this.interpolate(config.caption, contact, run.vars)
                  : undefined,
              }),
            );

            await this.recordBotMessage(
              run,
              res.messageId,
              `[${config.media_type || 'Media'}]`,
              config.media_type || 'image',
              (config.media_type || 'IMAGE').toUpperCase(),
            );
          }

          const nextKey = config.next_node_key;
          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: { currentNodeKey: nextKey },
          });
          currentNode = nextKey ? nodesMap.get(nextKey) : null;
          break;
        }

        case 'set_tag': {
          if (config.tag_id && run.contactId) {
            if (config.mode === 'remove') {
              await this.prisma.whatsAppContactTag.deleteMany({
                where: { contactId: run.contactId, tagId: config.tag_id },
              });
            } else {
              await this.prisma.whatsAppContactTag.upsert({
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
          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: { currentNodeKey: nextKey },
          });
          currentNode = nextKey ? nodesMap.get(nextKey) : null;
          break;
        }

        case 'condition': {
          const matched = await this.evaluateConditionNode(config, run);
          const nextKey = matched ? config.true_next : config.false_next;

          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: { currentNodeKey: nextKey },
          });
          currentNode = nextKey ? nodesMap.get(nextKey) : null;
          break;
        }

        // ── Suspension Node: SEND_BUTTONS ───────────────────
        case 'send_buttons': {
          const contact = await this.prisma.whatsAppContact.findUnique({
            where: { id: run.contactId },
          });
          if (contact?.phone) {
            const body = this.interpolate(config.text || '', contact, run.vars);
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

            await this.recordBotMessage(
              run,
              res.messageId,
              payload.body,
              'interactive_buttons',
              'INTERACTIVE',
              payload,
            );
          }

          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: { currentNodeKey: currentNode.nodeKey },
          });
          return; // Suspend
        }

        // ── Suspension Node: SEND_LIST ──────────────────────
        case 'send_list': {
          const contact = await this.prisma.whatsAppContact.findUnique({
            where: { id: run.contactId },
          });
          if (contact?.phone) {
            const body = this.interpolate(config.text || '', contact, run.vars);
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

            await this.recordBotMessage(
              run,
              res.messageId,
              payload.body,
              'interactive_list',
              'INTERACTIVE',
              payload,
            );
          }

          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: { currentNodeKey: currentNode.nodeKey },
          });
          return; // Suspend
        }

        // ── Suspension Node: COLLECT_INPUT ──────────────────
        case 'collect_input': {
          const contact = await this.prisma.whatsAppContact.findUnique({
            where: { id: run.contactId },
          });
          if (contact?.phone) {
            const prompt = this.interpolate(
              config.prompt_text || '',
              contact,
              run.vars,
            );
            const res = await this.sendWithVariants(contact.phone, (target) =>
              sendTextMessage({
                phoneNumberId: account.phoneNumberId,
                accessToken: account.accessToken,
                to: target,
                text: prompt,
              }),
            );

            await this.recordBotMessage(
              run,
              res.messageId,
              prompt,
              'text',
              'TEXT',
            );
          }

          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: { currentNodeKey: currentNode.nodeKey },
          });
          return; // Suspend
        }

        // ── Terminal Node: HANDOFF ──────────────────────────
        case 'handoff': {
          if (config.assign_to && run.conversationId) {
            await this.prisma.whatsAppConversation.update({
              where: { id: run.conversationId },
              data: { agentUserId: config.assign_to },
            });
          }

          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: {
              status: 'handed_off',
              endedAt: new Date(),
              endReason: 'handoff',
            },
          });
          return;
        }

        // ── Terminal Node: END ──────────────────────────────
        case 'end': {
          await this.prisma.whatsAppFlowRun.update({
            where: { id: run.id },
            data: {
              status: 'completed',
              endedAt: new Date(),
              endReason: 'completed',
            },
          });
          return;
        }

        default:
          this.logger.warn(`Unknown flow node type: ${currentNode.nodeType}`);
          return;
      }
    }
  }

  /**
   * Handle unrecognised customer replies at suspension nodes (reprompt vs handoff).
   */
  private async handleFallback(
    run: any,
    node: any,
    nodesMap: Map<string, any>,
  ): Promise<void> {
    const vars = (run.vars || {}) as Record<string, any>;
    const currentReprompt = (vars._reprompt_count || 0) + 1;
    const maxReprompts = 2; // Default max 2 retries before escalating

    if (currentReprompt <= maxReprompts) {
      await this.prisma.whatsAppFlowRun.update({
        where: { id: run.id },
        data: { vars: { ...vars, _reprompt_count: currentReprompt } },
      });

      // Re-send current suspension prompt
      await this.executeNodeLoop(run, node, nodesMap);
      return;
    }

    // Retries exhausted: escalate to handoff
    this.logger.log(
      `Flow run ${run.id} exhausted reprompts. Escalating to handoff.`,
    );
    await this.prisma.whatsAppFlowRun.update({
      where: { id: run.id },
      data: {
        status: 'handed_off',
        endedAt: new Date(),
        endReason: 'fallback_exhausted',
      },
    });
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  private async findMatchingEntryFlow(
    accountId: string,
    message: FlowInboundMessage,
    isFirstInbound: boolean,
  ): Promise<any | null> {
    const flows = await this.prisma.whatsAppFlow.findMany({
      where: { accountId, status: 'active' },
      orderBy: { createdAt: 'asc' },
    });

    const candidates: string[] = [];
    if (message.text) candidates.push(message.text.trim());
    if (message.replyTitle) candidates.push(message.replyTitle.trim());
    if (message.replyId) candidates.push(message.replyId.trim());

    for (const flow of flows) {
      if (flow.triggerType === 'first_inbound_message' && isFirstInbound) {
        return flow;
      }

      if (flow.triggerType === 'keyword') {
        const cfg = (flow.triggerConfig || {}) as Record<string, any>;
        const keywords: string[] = cfg.keywords || [];
        const matchType = cfg.match_type || 'contains';

        for (const candidate of candidates) {
          const text = candidate.toLowerCase();
          const matches = keywords.some((kw) => {
            const clean = kw.trim().toLowerCase();
            if (!clean) return false;
            if (matchType === 'exact') return text === clean;
            return text.includes(clean);
          });
          if (matches) return flow;
        }
      }
    }

    return null;
  }

  private async evaluateConditionNode(
    config: Record<string, any>,
    run: any,
  ): Promise<boolean> {
    const subject = config.subject; // 'var' | 'tag' | 'contact_field'
    const subjectKey = config.subject_key;
    const operator = config.operator || 'equals';
    const configValue = config.value || '';

    let actualValue: string | undefined;

    if (subject === 'var') {
      const vars = (run.vars || {}) as Record<string, any>;
      actualValue =
        vars[subjectKey] !== undefined ? String(vars[subjectKey]) : undefined;
    } else if (subject === 'tag') {
      const hasTag = await this.prisma.whatsAppContactTag.findFirst({
        where: { contactId: run.contactId, tagId: subjectKey },
      });
      actualValue = hasTag ? 'present' : undefined;
    } else if (subject === 'contact_field') {
      const contact = await this.prisma.whatsAppContact.findUnique({
        where: { id: run.contactId },
      });
      if (contact && (contact as any)[subjectKey] !== undefined) {
        actualValue = String((contact as any)[subjectKey]);
      }
    }

    switch (operator) {
      case 'present':
        return actualValue !== undefined && actualValue !== '';
      case 'absent':
        return actualValue === undefined || actualValue === '';
      case 'equals':
        return actualValue === configValue;
      case 'contains':
        return actualValue !== undefined && actualValue.includes(configValue);
      default:
        return false;
    }
  }

  private interpolate(text: string, contact: any, vars?: any): string {
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

  private async recordBotMessage(
    run: any,
    waMessageId: string,
    body: string,
    contentType: string,
    type: any,
    interactivePayload?: any,
  ) {
    if (!run.conversationId) return;

    const msgRow = await this.prisma.whatsAppMessage.create({
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

    await this.prisma.whatsAppConversation.update({
      where: { id: run.conversationId },
      data: { lastMessageText: body, lastMessageAt: msgRow.sentAt },
    });

    this.realtimeGateway.emitMessageSent(
      run.conversationId,
      msgRow,
      run.accountId,
    );
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
}
