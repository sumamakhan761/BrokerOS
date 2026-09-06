// ============================================================================
// BrokerOS — WhatsApp Flow Runtime Engine (Modular Coordinator)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';
import { WhatsAppRealtimeGateway } from '../gateway/whatsapp-realtime.gateway.js';
import { executeFlowNode } from './engine/flow-node-executors.js';

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
  ) { }

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
      const result = await executeFlowNode(currentNode, run, {
        account,
        prisma: this.prisma,
        realtimeGateway: this.realtimeGateway,
        logger: this.logger,
      });

      if (result.action === 'advance') {
        currentNode = result.nextKey ? nodesMap.get(result.nextKey) : null;
      } else {
        // suspend, terminal, or unknown: exit execution loop
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

  /**
   * Find a flow matching the trigger criteria.
   */
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
}
