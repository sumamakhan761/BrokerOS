// ============================================================================
// BrokerOS — Email Automation & Flow Execution Engine
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { EmailIntegrationsService } from '../services/email-integrations.service.js';
import { EmailAiService } from '../ai/email-ai.service.js';
import { EmailAudienceService } from '../services/email-audience.service.js';

export interface InboundEmailContext {
  inboundId: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  headers?: Record<string, any>;
  provider: string;
  providerMsgId?: string;
  inReplyTo?: string;
  recipient?: any; // CampaignRecipient with campaign, project, and lead
}

@Injectable()
export class EmailAutomationEngineService {
  private readonly logger = new Logger(EmailAutomationEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationsService: EmailIntegrationsService,
    private readonly aiService: EmailAiService,
    private readonly audienceService: EmailAudienceService,
  ) {}

  /**
   * Main entry point when an inbound email reply is received.
   * Matches candidate flows (campaign-specific first, then global) and executes steps.
   */
  async processInboundReply(context: InboundEmailContext): Promise<{
    matchedFlowId?: string;
    flowName?: string;
    actionsExecuted: string[];
  }> {
    const actionsExecuted: string[] = [];

    try {
      const recipient = context.recipient;
      const campaignId = recipient?.campaignId;
      const inboundTextLower = `${context.subject} ${context.body}`.toLowerCase();

      // 1. Fetch active flows
      const flows = await this.prisma.emailFlow.findMany({
        where: { status: 'active' },
        include: { nodes: true },
      });

      if (flows.length === 0) {
        this.logger.log('No active email flows found.');
        return { actionsExecuted };
      }

      // 2. Filter & prioritize matching flows (Campaign-scoped first, then Global)
      const campaignScopedFlows = flows.filter(
        (f) => !f.isGlobal && campaignId && f.campaignIds.includes(campaignId),
      );
      const globalFlows = flows.filter((f) => f.isGlobal);

      const candidateFlows = [...campaignScopedFlows, ...globalFlows];

      let targetFlow: any = null;

      for (const flow of candidateFlows) {
        if (flow.triggerType === 'any_reply') {
          targetFlow = flow;
          break;
        }

        if (flow.triggerType === 'keyword_match') {
          const cfg = (flow.triggerConfig || {}) as any;
          const keywords: string[] = Array.isArray(cfg.keywords) ? cfg.keywords : [];
          const matchMode = cfg.matchMode || 'contains';

          const hasMatch = keywords.some((kw) => {
            const cleanKw = kw.toLowerCase().trim();
            if (!cleanKw) return false;
            if (matchMode === 'exact') {
              return inboundTextLower.trim() === cleanKw;
            }
            return inboundTextLower.includes(cleanKw);
          });

          if (hasMatch) {
            targetFlow = flow;
            break;
          }
        }
      }

      if (!targetFlow) {
        this.logger.log(`No flow matched for inbound reply from ${context.fromEmail}`);
        return { actionsExecuted };
      }

      this.logger.log(
        `Triggering Email Flow "${targetFlow.name}" (${targetFlow.id}) for recipient ${context.fromEmail}`,
      );

      // 3. Seed Flow Run record
      const flowRun = await this.prisma.emailFlowRun.create({
        data: {
          flowId: targetFlow.id,
          recipientId: recipient?.id || null,
          campaignId: campaignId || null,
          leadId: recipient?.leadId || null,
          status: 'active',
          inboundSubject: context.subject,
          inboundBody: context.body,
        },
      });

      // 4. Execute Flow Nodes
      const nodes: any[] = targetFlow.nodes || [];
      // Sort nodes starting with 'start'
      const startNode = nodes.find((n) => n.nodeType === 'start');
      const actionNodes = nodes.filter((n) => n.nodeType !== 'start');

      let outboundReplyText = '';

      for (const node of actionNodes) {
        const config = (node.config || {}) as any;

        switch (node.nodeType) {
          // ── Action: Send Direct Email Reply ──
          case 'send_email_reply': {
            if (!recipient) {
              actionsExecuted.push('send_email_reply skipped: no recipient record');
              break;
            }

            const subject = config.subject
              ? this.interpolateText(config.subject, recipient)
              : context.subject.startsWith('Re:')
              ? context.subject
              : `Re: ${context.subject}`;

            const htmlBody = this.interpolateText(
              config.htmlBody || config.textBody || 'Thank you for your response.',
              recipient,
            );
            const textBody = this.interpolateText(
              config.textBody || config.htmlBody || 'Thank you for your response.',
              recipient,
            );

            await this.dispatchOutboundReply({
              recipient,
              subject,
              htmlContent: htmlBody,
              plainTextContent: textBody,
              inboundMsgId: context.providerMsgId,
            });

            outboundReplyText = textBody;
            actionsExecuted.push(`Sent email reply: "${subject}"`);
            break;
          }

          // ── Action: AI Agent Autoreply (Groq openai/gpt-oss-120b) ──
          case 'ai_agent': {
            if (!recipient) {
              actionsExecuted.push('ai_agent skipped: no recipient record');
              break;
            }

            // Check loop guard (max replies per lead)
            const previousAiRunsCount = await this.prisma.emailFlowRun.count({
              where: {
                recipientId: recipient.id,
                status: 'completed',
                outboundReply: { not: null },
              },
            });

            const maxTurns = config.maxTurns || 3;
            if (previousAiRunsCount >= maxTurns) {
              this.logger.warn(`AI loop guard hit for recipient ${recipient.id} (${previousAiRunsCount} turns). Handoff to human.`);
              await this.executePreSalesHandoff(recipient);
              actionsExecuted.push(`AI limit reached (${maxTurns} turns). Handed off to Pre-Sales.`);
              break;
            }

            const aiReply = await this.aiService.generateAutoreply({
              leadName: recipient.name || 'Valued Buyer',
              inboundSubject: context.subject,
              inboundBody: context.body,
              originalCampaignTitle: recipient.campaign?.title,
              originalSubject: recipient.campaign?.subject,
              project: recipient.campaign?.project,
            });

            await this.dispatchOutboundReply({
              recipient,
              subject: aiReply.subject,
              htmlContent: aiReply.htmlBody,
              plainTextContent: aiReply.textBody,
              inboundMsgId: context.providerMsgId,
            });

            outboundReplyText = aiReply.textBody;
            actionsExecuted.push(`AI agent generated & sent reply using openai/gpt-oss-120b`);
            break;
          }

          // ── Action: Update Lead Status & Temperature ──
          case 'update_lead_status': {
            const newStatus = config.status || 'INTERESTED';
            const newTemp = config.temperature || 'HOT';

            if (recipient?.leadId) {
              await this.prisma.lead.update({
                where: { id: recipient.leadId },
                data: {
                  status: newStatus,
                  temperature: newTemp,
                },
              });
              actionsExecuted.push(`Updated CRM Lead status to ${newStatus} (${newTemp})`);
            } else if (recipient) {
              // Promote prospect to lead with dynamic source
              const newLead = await this.audienceService.promoteCsvRecipientToLead(
                recipient.id,
              );
              await this.prisma.lead.update({
                where: { id: newLead.id },
                data: {
                  status: newStatus,
                  temperature: newTemp,
                },
              });
              actionsExecuted.push(`Promoted prospect to new CRM Lead (${newStatus})`);
            }
            break;
          }

          // ── Action: Add Tag ──
          case 'add_tag': {
            const tagName = config.tagName || config.tag;
            if (tagName) {
              await this.prisma.emailTag.upsert({
                where: { name: tagName },
                create: { name: tagName, color: config.color || '#8B5CF6' },
                update: {},
              });
              actionsExecuted.push(`Attached tag "${tagName}"`);
            }
            break;
          }

          // ── Action: Handoff to Pre-Sales Manager ──
          case 'handoff_presales': {
            if (recipient) {
              await this.executePreSalesHandoff(recipient);
              actionsExecuted.push('Pushed lead to Pre-Sales Manager unassigned intake queue');
            }
            break;
          }

          case 'end': {
            actionsExecuted.push('Flow ended');
            break;
          }
        }
      }

      // 5. Mark Flow Run completed
      await this.prisma.emailFlowRun.update({
        where: { id: flowRun.id },
        data: {
          status: 'completed',
          outboundReply: outboundReplyText || null,
          endedAt: new Date(),
        },
      });

      return {
        matchedFlowId: targetFlow.id,
        flowName: targetFlow.name,
        actionsExecuted,
      };
    } catch (err: any) {
      this.logger.error(`Error executing email automation: ${err?.message}`);
      return { actionsExecuted };
    }
  }

  /**
   * Dispatches an outbound reply strictly using the recipient's recorded provider and mailbox
   */
  private async dispatchOutboundReply(args: {
    recipient: any;
    subject: string;
    htmlContent: string;
    plainTextContent: string;
    inboundMsgId?: string;
  }) {
    const { recipient, subject, htmlContent, plainTextContent, inboundMsgId } = args;

    const providerType = recipient.assignedProvider || 'AWS_SES';
    const fromEmail = recipient.assignedSenderEmail || recipient.campaign?.fromEmail;
    const fromName = recipient.campaign?.fromName || 'Sales & Advisory';

    const adapter = this.integrationsService.getAdapter(providerType);

    this.logger.log(
      `Dispatching outbound reply via ${providerType} from ${fromEmail} to ${recipient.email} (In-Reply-To: ${inboundMsgId})`,
    );

    await adapter.sendBatch({
      fromEmail,
      fromName,
      to: [{ email: recipient.email, name: recipient.name || undefined }],
      subject,
      htmlContent,
      plainTextContent,
      replyTo: fromEmail,
    });
  }

  /**
   * Routes lead to Pre-Sales Manager intake
   */
  private async executePreSalesHandoff(recipient: any) {
    if (recipient.leadId) {
      await this.prisma.lead.update({
        where: { id: recipient.leadId },
        data: {
          assignedUserId: null, // Unassigned ensures it lands in manager's intake queue
          status: 'INTERESTED',
          temperature: 'HOT',
        },
      });
    } else {
      await this.audienceService.promoteCsvRecipientToLead(recipient.id);
    }
  }

  /**
   * Interpolate merge tags
   */
  private interpolateText(template: string, recipient: any): string {
    if (!template) return '';
    const lead = recipient.lead || {};
    const campaign = recipient.campaign || {};
    const project = campaign.project || {};

    return template
      .replace(/{{firstName}}/g, lead.firstName || recipient.name || 'Valued Client')
      .replace(/{{lastName}}/g, lead.lastName || '')
      .replace(/{{email}}/g, recipient.email)
      .replace(/{{projectName}}/g, project.name || campaign.title || 'Our Project')
      .replace(/{{city}}/g, project.city || 'Prime Location')
      .replace(/{{brochureUrl}}/g, project.brochureUrl || '#');
  }
}
