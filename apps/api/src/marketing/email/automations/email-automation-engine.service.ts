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
   * Matches candidate flows (campaign-specific first, then global) and executes graph steps.
   */
  async processInboundReply(context: InboundEmailContext): Promise<{
    matchedFlowId?: string;
    flowName?: string;
    actionsExecuted: string[];
    outboundReply?: string;
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
          const keywords: string[] = Array.isArray(cfg.keywords)
            ? cfg.keywords
            : typeof cfg.keywords === 'string'
            ? cfg.keywords.split(',').map((k: string) => k.trim())
            : [];
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

      // 4. Build Node Graph
      const rawNodes: any[] = targetFlow.nodes || [];
      const nodeMap = new Map<string, any>(rawNodes.map((n) => [n.nodeKey, n]));

      // Linear ordering fallback
      const nonStartNodes = rawNodes.filter((n) => n.nodeType !== 'start');
      const startNode = rawNodes.find((n) => n.nodeType === 'start');

      let currentNode: any = null;
      if (startNode && startNode.config?.next_node_key && nodeMap.has(startNode.config.next_node_key)) {
        currentNode = nodeMap.get(startNode.config.next_node_key);
      } else if (nonStartNodes.length > 0) {
        currentNode = nonStartNodes[0];
      } else if (rawNodes.length > 0) {
        currentNode = rawNodes[0];
      }

      let outboundReplyText = '';
      let stepsCount = 0;
      const MAX_STEPS = 25; // Guard against infinite circular branching
      const executedKeys = new Set<string>();

      // 5. Graph Execution Loop
      while (currentNode && stepsCount < MAX_STEPS) {
        stepsCount++;
        executedKeys.add(currentNode.nodeKey);

        const config = (currentNode.config || {}) as any;
        const nodeType = currentNode.nodeType;

        // Determine default linear next node
        const currentLinearIndex = nonStartNodes.findIndex((n) => n.nodeKey === currentNode.nodeKey);
        let nextLinearNode =
          currentLinearIndex >= 0 && currentLinearIndex < nonStartNodes.length - 1
            ? nonStartNodes[currentLinearIndex + 1]
            : null;

        let nextNodeToExecute: any = null;

        switch (nodeType) {
          // ── Action: Send Email Reply ──
          case 'send_email':
          case 'send_email_reply': {
            if (!recipient) {
              actionsExecuted.push('send_email skipped: no recipient record');
              break;
            }

            const subject = config.subject
              ? this.interpolateText(config.subject, recipient)
              : context.subject.startsWith('Re:')
              ? context.subject
              : `Re: ${context.subject}`;

            const htmlBody = this.interpolateText(
              config.htmlBody || config.bodyHtml || config.textBody || 'Thank you for your response.',
              recipient,
            );
            const textBody = this.interpolateText(
              config.textBody || config.bodyHtml || config.htmlBody || 'Thank you for your response.',
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

            // Next node resolution
            if (config.next_node_key && nodeMap.has(config.next_node_key)) {
              nextNodeToExecute = nodeMap.get(config.next_node_key);
            } else {
              nextNodeToExecute = nextLinearNode;
            }
            break;
          }

          // ── Action: AI Agent Autoreply (Groq openai/gpt-oss-120b) ──
          case 'ai_agent':
          case 'ai_reply': {
            if (!recipient) {
              actionsExecuted.push('ai_agent skipped: no recipient record');
              break;
            }

            // 1. Human Handoff Conflict Check:
            // If a human sales executive has already claimed/been assigned to this lead,
            // pause AI so the bot does NOT talk over or contradict the human.
            const stopIfHumanActive = config.stopIfHumanActive !== false;
            if (stopIfHumanActive && recipient?.lead?.assignedUserId) {
              this.logger.log(
                `Skipping AI autoreply: Lead ${recipient.lead.id} is already claimed by executive ${recipient.lead.assignedUserId}.`,
              );
              actionsExecuted.push('AI reply skipped (lead is actively managed by a human sales executive)');
              nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
                ? nodeMap.get(config.next_node_key)
                : nextLinearNode;
              break;
            }

            // 2. Loop Guard Check (max turns per lead before routing to human):
            const maxTurns = config.maxTurns ?? 3;
            const previousAiRunsCount = await this.prisma.emailFlowRun.count({
              where: {
                recipientId: recipient.id,
                status: 'completed',
                outboundReply: { not: null },
              },
            });

            if (previousAiRunsCount >= maxTurns) {
              this.logger.warn(
                `AI reply limit reached for recipient ${recipient.id} (${previousAiRunsCount}/${maxTurns} turns). Auto-routing to Pre-Sales triage.`,
              );
              if (config.handoffOnMax !== false) {
                await this.executePreSalesHandoff(recipient);
                actionsExecuted.push(`AI limit reached (${maxTurns} replies). Auto-routed lead to Pre-Sales intake.`);
              } else {
                actionsExecuted.push(`AI limit reached (${maxTurns} replies). AI paused.`);
              }

              nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
                ? nodeMap.get(config.next_node_key)
                : nextLinearNode;
              break;
            }

            // 3. Generate AI response with custom instructions
            const aiReply = await this.aiService.generateAutoreply({
              leadName: recipient.name || recipient.lead?.firstName || 'Valued Buyer',
              inboundSubject: context.subject,
              inboundBody: context.body,
              originalCampaignTitle: recipient.campaign?.title,
              originalSubject: recipient.campaign?.subject,
              project: recipient.campaign?.project,
              customInstructions: config.instructions,
            });

            await this.dispatchOutboundReply({
              recipient,
              subject: aiReply.subject,
              htmlContent: aiReply.htmlBody,
              plainTextContent: aiReply.textBody,
              inboundMsgId: context.providerMsgId,
            });

            outboundReplyText = aiReply.textBody;
            actionsExecuted.push('AI Concierge (Groq openai/gpt-oss-120b) generated & dispatched reply');

            nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
              ? nodeMap.get(config.next_node_key)
              : nextLinearNode;
            break;
          }

          // ── Action: Condition / Branching ──
          case 'condition':
          case 'if_else': {
            const conditionType = config.conditionType || 'keywords';
            let conditionMet = false;

            if (conditionType === 'lead_status') {
              const currentStatus = (recipient?.lead?.status || '').toUpperCase();
              const targetStatus = (config.matchValue || 'INTERESTED').toUpperCase();
              conditionMet = currentStatus === targetStatus;
            } else if (conditionType === 'lead_temperature') {
              const currentTemp = (recipient?.lead?.temperature || '').toUpperCase();
              const targetTemp = (config.matchValue || 'HOT').toUpperCase();
              conditionMet = currentTemp === targetTemp;
            } else {
              // Default: Inbound text keywords match
              const rawKeywords = config.keywords;
              const kwList: string[] = Array.isArray(rawKeywords)
                ? rawKeywords
                : typeof rawKeywords === 'string'
                ? rawKeywords.split(',').map((k: string) => k.trim().toLowerCase())
                : [];
              conditionMet = kwList.some((kw) => kw && inboundTextLower.includes(kw));
            }

            if (conditionMet) {
              actionsExecuted.push(
                `Condition [${conditionType}] matched -> Branch TRUE (${config.if_true_node_key || 'continue'})`,
              );
              if (config.if_true_node_key && nodeMap.has(config.if_true_node_key)) {
                nextNodeToExecute = nodeMap.get(config.if_true_node_key);
              } else {
                nextNodeToExecute = nextLinearNode;
              }
            } else {
              actionsExecuted.push(
                `Condition [${conditionType}] not matched -> Branch FALSE (${config.if_false_node_key || 'continue'})`,
              );
              if (config.if_false_node_key && nodeMap.has(config.if_false_node_key)) {
                nextNodeToExecute = nodeMap.get(config.if_false_node_key);
              } else {
                nextNodeToExecute = nextLinearNode;
              }
            }
            break;
          }

          // ── Action: Update Lead Profile ──
          case 'update_lead':
          case 'update_lead_status': {
            const newStatus = config.status || 'INTERESTED';
            const newTemp = config.temperature || 'HOT';
            const scoreIncr = parseInt(config.scoreIncrement, 10) || 0;

            if (recipient?.leadId) {
              const updateData: any = {
                status: newStatus,
                temperature: newTemp,
              };
              if (scoreIncr > 0) {
                updateData.score = { increment: scoreIncr };
              }
              await this.prisma.lead.update({
                where: { id: recipient.leadId },
                data: updateData,
              });
              actionsExecuted.push(`Updated CRM Lead status to ${newStatus} (${newTemp})`);
            } else if (recipient) {
              const newLead = await this.audienceService.promoteCsvRecipientToLead(recipient.id);
              const updateData: any = {
                status: newStatus,
                temperature: newTemp,
              };
              if (scoreIncr > 0) {
                updateData.score = { increment: scoreIncr };
              }
              await this.prisma.lead.update({
                where: { id: newLead.id },
                data: updateData,
              });
              actionsExecuted.push(`Promoted prospect to new CRM Lead (${newStatus}, ${newTemp})`);
            }

            nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
              ? nodeMap.get(config.next_node_key)
              : nextLinearNode;
            break;
          }

          // ── Action: Assign Tag ──
          case 'add_tag':
          case 'add_lead_tag': {
            const tagName = config.tagName || config.tag;
            if (tagName) {
              await this.prisma.emailTag.upsert({
                where: { name: tagName },
                create: { name: tagName, color: config.color || '#10b981' },
                update: {},
              });
              actionsExecuted.push(`Assigned CRM tag "${tagName}"`);
            }

            nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
              ? nodeMap.get(config.next_node_key)
              : nextLinearNode;
            break;
          }

          // ── Action: Human Handoff / Pre-Sales Queue ──
          case 'human_handoff':
          case 'pre_sales_handoff':
          case 'handoff_presales': {
            if (recipient) {
              await this.executePreSalesHandoff(recipient);
              actionsExecuted.push('Routed lead to Pre-Sales Manager triage queue');
            }

            nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
              ? nodeMap.get(config.next_node_key)
              : nextLinearNode;
            break;
          }

          case 'end': {
            actionsExecuted.push('Flow execution sequence completed');
            nextNodeToExecute = null;
            break;
          }

          default: {
            this.logger.warn(`Unrecognized flow node type "${nodeType}" (Key: ${currentNode.nodeKey})`);
            nextNodeToExecute = nextLinearNode;
            break;
          }
        }

        // Avoid infinite loop if pointing to itself
        if (nextNodeToExecute && nextNodeToExecute.nodeKey === currentNode.nodeKey) {
          this.logger.warn(`Node ${currentNode.nodeKey} points to itself. Terminating execution.`);
          break;
        }

        currentNode = nextNodeToExecute;
      }

      // 6. Mark Flow Run completed
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
        outboundReply: outboundReplyText || undefined,
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
   * Routes lead to Pre-Sales Manager triage pool
   */
  private async executePreSalesHandoff(recipient: any) {
    if (recipient?.leadId) {
      await this.prisma.lead.update({
        where: { id: recipient.leadId },
        data: {
          assignedUserId: null, // Unassigned ensures it lands at the top of the manager's triage queue
          status: 'INTERESTED',
          temperature: 'HOT',
        },
      });
    } else if (recipient?.id) {
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
    const clientName = recipient.name || lead.firstName || 'Valued Client';

    return template
      .replace(/{{lead_name}}/g, clientName)
      .replace(/{{leadName}}/g, clientName)
      .replace(/{{firstName}}/g, lead.firstName || clientName)
      .replace(/{{lastName}}/g, lead.lastName || '')
      .replace(/{{email}}/g, recipient.email || '')
      .replace(/{{project_name}}/g, project.name || campaign.title || 'Our Project')
      .replace(/{{projectName}}/g, project.name || campaign.title || 'Our Project')
      .replace(/{{city}}/g, project.city || 'Prime Location')
      .replace(/{{brochure_url}}/g, project.brochureUrl || '#')
      .replace(/{{brochureUrl}}/g, project.brochureUrl || '#');
  }
}
