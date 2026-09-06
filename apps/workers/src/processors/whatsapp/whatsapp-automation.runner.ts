// ============================================================================
// BrokerOS — WhatsApp Automation Step Execution Runner
// ============================================================================

import { Logger } from '@nestjs/common';
import {
  sendTextMessage,
  sendTemplateMessage,
  sendInteractiveButtons,
  sendInteractiveList,
  decrypt,
  postSafeWebhook,
} from '@brokeros/int-whatsapp';
import {
  sendWithVariants,
  interpolate,
  evaluateCondition,
} from './whatsapp-worker.helpers.js';

export async function processPendingAutomation(
  prisma: any,
  pending: any,
  logger: Logger,
): Promise<void> {
  const { id: pendingId, automation, account, contact } = pending;

  if (!automation || !account || !account.isActive) {
    await prisma.whatsAppAutomationPendingExecution.update({
      where: { id: pendingId },
      data: { status: 'failed' },
    });
    return;
  }

  let accessToken = '';
  try {
    accessToken = decrypt(account.accessToken);
  } catch (err: any) {
    logger.error(`Failed to decrypt token for pending execution ${pendingId}: ${err?.message}`);
    await prisma.whatsAppAutomationPendingExecution.update({
      where: { id: pendingId },
      data: { status: 'failed' },
    });
    return;
  }

  await prisma.whatsAppAutomationPendingExecution.update({
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
            const text = interpolate(config.text || '', contact);
            await sendWithVariants(account.phoneNumberId, accessToken, contact.phone, (target) =>
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
              await sendWithVariants(account.phoneNumberId, accessToken, contact.phone, (target) =>
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
            await sendWithVariants(account.phoneNumberId, accessToken, contact.phone, (target) =>
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
            await sendWithVariants(account.phoneNumberId, accessToken, contact.phone, (target) =>
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
            await prisma.whatsAppContactTag.upsert({
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
            await prisma.whatsAppContactTag.deleteMany({
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
              const activeAgents = await prisma.user.findMany({
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
                  (a: any, b: any) =>
                    a._count.whatsappConversations -
                    b._count.whatsappConversations,
                );
                agentId = activeAgents[0].id;
              }
            }
            if (agentId) {
              await prisma.whatsAppConversation.update({
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
            await prisma.whatsAppConversation.update({
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
            const val = interpolate(config.value || '', contact);

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
            } else if (['name', 'email', 'company'].includes(fieldName)) {
              await prisma.whatsAppContact.update({
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
              const title = interpolate(config.title || fallbackTitle, contact);
              const value = Number(config.value || config.deal_value || 0) || 0;
              const assignedUserId = config.assignedUserId || config.user_id || undefined;

              const deal = await prisma.whatsAppDeal.create({
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

              await prisma.whatsAppDealActivity.create({
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
          const matches = evaluateCondition(config, contact, context);
          currentBranch = matches ? 'yes' : 'no';
          executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'success' });
          break;
        }

        case 'wait': {
          const delayMinutes = Math.max(1, Number(config.delayMinutes) || 1);
          const runAt = new Date(Date.now() + delayMinutes * 60 * 1000);

          await prisma.whatsAppAutomationPendingExecution.create({
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

          await prisma.whatsAppAutomationPendingExecution.update({
            where: { id: pendingId },
            data: { status: 'completed' },
          });
          return;
        }

        default:
          executedSteps.push({ stepId: step.id, stepType: step.stepType, status: 'unknown' });
          break;
      }
    }

    await prisma.whatsAppAutomationPendingExecution.update({
      where: { id: pendingId },
      data: { status: 'completed' },
    });

    await prisma.whatsAppAutomationExecution.create({
      data: {
        automationId: automation.id,
        contactId: contact?.id || null,
        conversationId: context.conversationId || null,
        status: 'completed',
        logs: executedSteps as any,
      },
    });
  } catch (err: any) {
    logger.error(`Failed executing pending automation step: ${err?.message}`);
    await prisma.whatsAppAutomationPendingExecution.update({
      where: { id: pendingId },
      data: { status: 'failed' },
    });
  }
}
