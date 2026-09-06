// ============================================================================
// BrokerOS — WhatsApp Automation Execution Engine (Modular Coordinator)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';
import { WhatsAppRealtimeGateway } from '../gateway/whatsapp-realtime.gateway.js';
import {
  AutomationRunContext,
  ExecuteStepsArgs,
} from './engine/automation-types.js';
import { matchesAutomationTrigger } from './engine/automation-trigger-matcher.js';
import { evaluateAutomationCondition } from './engine/automation-condition-evaluator.js';
import { executeAutomationAction } from './engine/automation-action-handlers.js';

export { AutomationRunContext, ExecuteStepsArgs };

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
        if (!matchesAutomationTrigger(automation, context)) continue;

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
   * Top-level automation executor. Seeds log pessimistically and executes tree.
   */
  async executeAutomation(
    automation: any,
    contactId: string | null,
    context: AutomationRunContext = {},
  ): Promise<void> {
    // 1. Seed audit log pessimistically with status = 'failed'
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
          const taken = evaluateAutomationCondition(config, contact, context);
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
        const detail = await executeAutomationAction(step, {
          account,
          contact,
          context,
          prisma: this.prisma,
          realtimeGateway: this.realtimeGateway,
          logger: this.logger,
          resolveConversationId: (accId, cId, ctx) =>
            this.resolveConversationId(accId, cId, ctx),
          dispatchCascadeTrigger: (accId, tType, cId, ctx) =>
            this.runAutomationsForTrigger(accId, tType, cId, ctx),
        });

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
    if (!contact) {
      throw new Error('Cannot resolve conversation: contact not found');
    }

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
