// ============================================================================
// BrokerOS — WhatsApp Marketing Worker Processor (Broadcasts & Pending Steps)
// ============================================================================

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  phoneVariants,
  decrypt,
  postSafeWebhook,
  fetchMessageTemplates,
} from '@brokeros/int-whatsapp';

@Injectable()
export class MarketingWhatsAppProcessor
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketingWhatsAppProcessor.name);
  private readonly prisma = prismaClient;
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;
  private isScanningAutomations = false;
  private automationsScanInterval: NodeJS.Timeout | null = null;
  private templateSyncInterval: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.logger.log('MarketingWhatsAppProcessor background scanner started.');
    setTimeout(() => this.scanAndProcessBroadcasts(), 3000);
    this.scanInterval = setInterval(() => this.scanAndProcessBroadcasts(), 7000);

    setTimeout(() => this.scanAndProcessPendingAutomations(), 5000);
    this.automationsScanInterval = setInterval(
      () => this.scanAndProcessPendingAutomations(),
      15000,
    );

    // Daily template sync (every 24 hours, runs first check after 12 seconds)
    setTimeout(() => this.syncAllAccountTemplates(), 12000);
    this.templateSyncInterval = setInterval(
      () => this.syncAllAccountTemplates(),
      24 * 60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.automationsScanInterval) {
      clearInterval(this.automationsScanInterval);
      this.automationsScanInterval = null;
    }
    if (this.templateSyncInterval) {
      clearInterval(this.templateSyncInterval);
      this.templateSyncInterval = null;
    }
  }

  async scanAndProcessBroadcasts(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      // Find broadcasts ready for execution
      const eligibleBroadcasts = await this.prisma.whatsAppBroadcast.findMany({
        where: {
          OR: [
            { status: 'SENDING' },
            {
              status: 'SCHEDULED',
              OR: [
                { scheduledAt: null },
                { scheduledAt: { lte: new Date() } },
              ],
            },
          ],
        },
        include: {
          account: true,
        },
        take: 3,
      });

      for (const broadcast of eligibleBroadcasts) {
        await this.processBroadcast(broadcast);
      }
    } catch (err: any) {
      this.logger.error(`Broadcast scanner error: ${err?.message}`);
    } finally {
      this.isScanning = false;
    }
  }

  private async processBroadcast(broadcast: any): Promise<void> {
    const { id: broadcastId, account, templateName, templateLanguage } = broadcast;

    if (!account || !account.isActive) {
      this.logger.warn(
        `Skipping broadcast ${broadcastId}: account inactive or missing`,
      );
      return;
    }

    let accessToken = '';
    try {
      accessToken = decrypt(account.accessToken);
    } catch (err: any) {
      this.logger.error(
        `Failed to decrypt token for account ${account.id} in broadcast ${broadcastId}: ${err?.message}`,
      );
      await this.prisma.whatsAppBroadcast.update({
        where: { id: broadcastId },
        data: { status: 'FAILED' },
      });
      return;
    }

    // Mark as SENDING if not already
    if (broadcast.status !== 'SENDING') {
      await this.prisma.whatsAppBroadcast.update({
        where: { id: broadcastId },
        data: { status: 'SENDING' },
      });
    }

    // Process batch of pending recipients
    const batchSize = 25;
    const recipients = await this.prisma.whatsAppBroadcastRecipient.findMany({
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
      const remainingPending = await this.prisma.whatsAppBroadcastRecipient.count({
        where: { broadcastId, status: 'PENDING' },
      });

      if (remainingPending === 0) {
        await this.prisma.whatsAppBroadcast.update({
          where: { id: broadcastId },
          data: { status: 'COMPLETED' },
        });
        this.logger.log(`Broadcast ${broadcastId} completed.`);
      }
      return;
    }

    for (const recipient of recipients) {
      const targetPhone = recipient.phone || recipient.contact?.phone;
      if (!targetPhone) {
        await this.prisma.$transaction(async (tx) => {
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
        await this.prisma.$transaction(async (tx) => {
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
        await this.prisma.$transaction(async (tx) => {
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

  // ─────────────────────────────────────────────
  // 2. Pending Automation Executions (Wait Step Resume)
  // ─────────────────────────────────────────────

  async scanAndProcessPendingAutomations(): Promise<void> {
    if (this.isScanningAutomations) return;
    this.isScanningAutomations = true;

    try {
      const pendings = await this.prisma.whatsAppAutomationPendingExecution.findMany({
        where: {
          status: 'pending',
          runAt: { lte: new Date() },
        },
        include: {
          automation: {
            include: {
              steps: { orderBy: { position: 'asc' } },
            },
          },
          account: true,
          contact: {
            include: { tags: true },
          },
        },
        take: 5,
      });

      for (const pending of pendings) {
        await this.processPendingAutomation(pending);
      }
    } catch (err: any) {
      this.logger.error(`Pending automation scanner error: ${err?.message}`);
    } finally {
      this.isScanningAutomations = false;
    }
  }

  private async processPendingAutomation(pending: any): Promise<void> {
    const { id: pendingId, automation, account, contact } = pending;

    if (!automation || !account || !account.isActive) {
      await this.prisma.whatsAppAutomationPendingExecution.update({
        where: { id: pendingId },
        data: { status: 'failed' },
      });
      return;
    }

    let accessToken = '';
    try {
      accessToken = decrypt(account.accessToken);
    } catch (err: any) {
      this.logger.error(`Failed to decrypt token for pending execution ${pendingId}: ${err?.message}`);
      await this.prisma.whatsAppAutomationPendingExecution.update({
        where: { id: pendingId },
        data: { status: 'failed' },
      });
      return;
    }

    await this.prisma.whatsAppAutomationPendingExecution.update({
      where: { id: pendingId },
      data: { status: 'running' },
    });

    const context = (pending.context || {}) as Record<string, any>;
    let currentBranch: 'yes' | 'no' | null = pending.branch || null;
    const executedSteps: any[] = [];

    try {
      for (const step of automation.steps) {
        if (step.position < pending.nextStepPosition) continue;

        if (step.branch && step.branch !== currentBranch) {
          executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'skipped' });
          continue;
        }

        const config = (step.stepConfig || {}) as Record<string, any>;

        switch (step.stepType) {
          case 'send_message': {
            if (contact?.phone) {
              const text = (config.text || '')
                .replace(/{{\s*name\s*}}/gi, contact.name || 'there')
                .replace(/{{\s*phone\s*}}/gi, contact.phone || '')
                .replace(/{{\s*company\s*}}/gi, contact.company || '');
              await this.sendWithVariants(account.phoneNumberId, accessToken, contact.phone, (target) =>
                sendTextMessage({
                  phoneNumberId: account.phoneNumberId,
                  accessToken,
                  to: target,
                  text,
                }),
              );
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'send_template': {
            if (contact?.phone) {
              const templateName = config.templateName || config.template_name;
              const language = config.language || config.templateLanguage || 'en_US';
              if (templateName) {
                await this.sendWithVariants(account.phoneNumberId, accessToken, contact.phone, (target) =>
                  sendTemplateMessage({
                    phoneNumberId: account.phoneNumberId,
                    accessToken,
                    to: target,
                    templateName,
                    language,
                    params: config.params,
                  }),
                );
              }
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'send_buttons': {
            if (contact?.phone) {
              await this.sendWithVariants(account.phoneNumberId, accessToken, contact.phone, (target) =>
                sendInteractiveButtons({
                  phoneNumberId: account.phoneNumberId,
                  accessToken,
                  to: target,
                  bodyText: config.bodyText || '',
                  headerText: config.headerText,
                  footerText: config.footerText,
                  buttons: config.buttons || [],
                }),
              );
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'send_list': {
            if (contact?.phone) {
              await this.sendWithVariants(account.phoneNumberId, accessToken, contact.phone, (target) =>
                sendInteractiveList({
                  phoneNumberId: account.phoneNumberId,
                  accessToken,
                  to: target,
                  bodyText: config.bodyText || '',
                  buttonLabel: config.buttonLabel || 'Select',
                  headerText: config.headerText,
                  footerText: config.footerText,
                  sections: config.sections || [],
                }),
              );
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'add_tag': {
            if (contact && config.tagId) {
              await this.prisma.whatsAppContactTag.upsert({
                where: { contactId_tagId: { contactId: contact.id, tagId: config.tagId } },
                create: { contactId: contact.id, tagId: config.tagId },
                update: {},
              });
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'remove_tag': {
            if (contact && config.tagId) {
              await this.prisma.whatsAppContactTag.deleteMany({
                where: { contactId: contact.id, tagId: config.tagId },
              });
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'assign_conversation': {
            if (context.conversationId) {
              let agentId = config.agentUserId || config.agent_id || config.user_id;
              if (config.mode === 'round_robin' || !agentId) {
                const activeAgents = await this.prisma.user.findMany({
                  where: { status: 'ACTIVE' },
                  select: {
                    id: true,
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
                      a._count.whatsappConversations -
                      b._count.whatsappConversations,
                  );
                  agentId = activeAgents[0].id;
                }
              }
              if (agentId) {
                await this.prisma.whatsAppConversation.update({
                  where: { id: context.conversationId },
                  data: { agentUserId: agentId },
                });
              }
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'close_conversation': {
            if (context.conversationId) {
              await this.prisma.whatsAppConversation.update({
                where: { id: context.conversationId },
                data: { status: 'closed' },
              });
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'update_contact_field': {
            if (contact) {
              const fieldName = String(config.field || '');
              const val = (config.value || '')
                .replace(/{{\s*name\s*}}/gi, contact.name || 'there')
                .replace(/{{\s*phone\s*}}/gi, contact.phone || '')
                .replace(/{{\s*company\s*}}/gi, contact.company || '');

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
              } else if (['name', 'email', 'company'].includes(fieldName)) {
                await this.prisma.whatsAppContact.update({
                  where: { id: contact.id },
                  data: { [fieldName]: val },
                });
              }
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'create_deal': {
            if (contact) {
              const pipelineId = config.pipelineId || config.pipeline_id;
              const stageId = config.stageId || config.stage_id;
              if (pipelineId && stageId) {
                const fallbackTitle = `Deal - ${contact.name || contact.phone}`;
                const title = (config.title || fallbackTitle)
                  .replace(/{{\s*name\s*}}/gi, contact.name || 'there')
                  .replace(/{{\s*phone\s*}}/gi, contact.phone || '')
                  .replace(/{{\s*company\s*}}/gi, contact.company || '');
                const value = Number(config.value || config.deal_value || 0) || 0;
                const assignedUserId = config.assignedUserId || config.user_id || undefined;

                const deal = await this.prisma.whatsAppDeal.create({
                  data: {
                    accountId: account.id,
                    pipelineId,
                    stageId,
                    contactId: contact.id,
                    conversationId: context.conversationId || undefined,
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
                      automationId: automation.id,
                      stepId: step.id,
                    },
                  },
                });
              }
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'send_webhook': {
            if (config.url) {
              await postSafeWebhook(
                config.url,
                {
                  event: 'automation_step_resume',
                  automationId: automation.id,
                  contact: contact ? { id: contact.id, phone: contact.phone, name: contact.name } : null,
                  context,
                },
                config.secret,
              );
            }
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'condition': {
            const matches = this.evaluateCondition(config, contact, context);
            currentBranch = matches ? 'yes' : 'no';
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
            break;
          }

          case 'wait': {
            const delayMinutes = Math.max(1, Number(config.delayMinutes) || 1);
            const runAt = new Date(Date.now() + delayMinutes * 60 * 1000);

            await this.prisma.whatsAppAutomationPendingExecution.create({
              data: {
                automationId: automation.id,
                accountId: automation.accountId,
                parentStepId: step.id,
                nextStepPosition: step.position + 1,
                branch: currentBranch || null,
                contactId: contact?.id || null,
                runAt,
                status: 'pending',
                context: context as any,
              },
            });

            await this.prisma.whatsAppAutomationPendingExecution.update({
              where: { id: pendingId },
              data: { status: 'completed' },
            });
            return;
          }

          default:
            executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'skipped' });
        }
      }

      await this.prisma.whatsAppAutomationPendingExecution.update({
        where: { id: pendingId },
        data: { status: 'completed' },
      });

      // Audit log
      await this.prisma.whatsAppAutomationLog.create({
        data: {
          automationId: automation.id,
          accountId: automation.accountId,
          contactId: contact?.id || null,
          triggerEvent: 'wait_resumed',
          status: 'success',
          stepsExecuted: { steps: executedSteps, context } as any,
        },
      }).catch(() => null);
    } catch (stepErr: any) {
      this.logger.error(`Error executing resumed step for pending ${pendingId}: ${stepErr?.message}`);
      await this.prisma.whatsAppAutomationPendingExecution.update({
        where: { id: pendingId },
        data: { status: 'failed' },
      });
    }
  }

  private evaluateCondition(config: any, contact: any, context: any): boolean {
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
    if (operator === 'contains') return String(actual).toLowerCase().includes(String(expected).toLowerCase());
    return Boolean(actual);
  }

  private async sendWithVariants(
    phoneNumberId: string,
    accessToken: string,
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

  // ─────────────────────────────────────────────
  // 3. Automated Daily Template Sync
  // ─────────────────────────────────────────────

  async syncAllAccountTemplates(): Promise<void> {
    try {
      const accounts = await this.prisma.whatsAppBusinessAccount.findMany({
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

          await this.prisma.whatsAppTemplate.upsert({
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
      this.logger.error(`Automated template sync error: ${err?.message}`);
    }
  }
}
