// ============================================================================
// BrokerOS — Email Automation & Flow Execution Engine
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { EmailIntegrationsService } from '../services/email-integrations.service.js';
import { EmailAiService } from '../ai/email-ai.service.js';
import { EmailAudienceService } from '../services/email-audience.service.js';

export interface InboundEmailContext {
  inboundId?: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  headers?: Record<string, any>;
  provider: string;
  providerMsgId?: string;
  inReplyTo?: string;
  recipient?: any; // CampaignRecipient with campaign, project, and lead
  forceFlowId?: string;
  isSimulation?: boolean;
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
   * Main entry point when an inbound email reply is received or simulated.
   * Matches candidate flows (campaign-specific first, then global, or specific forced flow) and executes graph steps.
   */
  async processInboundReply(context: InboundEmailContext): Promise<{
    matchedFlowId?: string;
    flowName?: string;
    triggerMatched?: boolean;
    triggerReason?: string;
    actionsExecuted: string[];
    outboundReply?: string;
    renderedSubject?: string;
    renderedBody?: string;
  }> {
    const actionsExecuted: string[] = [];

    try {
      const leadName = context.fromEmail ? context.fromEmail.split('@')[0] : 'Valued Prospect';
      const recipient = context.recipient || {
        id: 'synthetic_recipient',
        email: context.fromEmail,
        name: leadName,
        assignedSenderEmail: context.toEmail,
        assignedProvider: context.provider === 'SIMULATOR' ? 'SYSTEM_DEFAULT' : (context.provider || 'SYSTEM_DEFAULT'),
        campaign: {
          title: 'Skyline Crest Residences',
          subject: context.subject,
          fromEmail: context.toEmail,
          fromName: 'Sales & Advisory',
          project: {
            name: 'Skyline Crest Residences',
            city: 'Mumbai',
            brochureUrl: '#',
            amenities: ['Clubhouse', 'Gymnasium', 'Infinity Pool', '24/7 Security'],
          },
        },
        lead: {
          firstName: leadName,
          lastName: '',
          email: context.fromEmail,
          status: 'NEW',
          temperature: 'WARM',
        },
      };

      const campaignId = recipient?.campaignId;
      const inboundTextLower = `${context.subject} ${context.body}`.toLowerCase();

      let targetFlow: any = null;

      if (context.forceFlowId) {
        targetFlow = await this.prisma.emailFlow.findUnique({
          where: { id: context.forceFlowId },
          include: {
            nodes: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        if (!targetFlow) {
          this.logger.warn(`Flow with ID ${context.forceFlowId} not found for simulation.`);
          return {
            actionsExecuted: [`Flow ID ${context.forceFlowId} not found`],
            triggerMatched: false,
          };
        }
      } else {
        // 1. Fetch active flows
        const flows = await this.prisma.emailFlow.findMany({
          where: { status: 'active' },
          include: {
            nodes: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });

        if (flows.length === 0) {
          this.logger.log('No active email flows found.');
          return { actionsExecuted: ['No active email flows registered in system.'] };
        }

        // 2. Filter & prioritize matching flows (Campaign-scoped first, then Global)
        const campaignScopedFlows = flows.filter(
          (f) => !f.isGlobal && campaignId && f.campaignIds.includes(campaignId),
        );
        const globalFlows = flows.filter((f) => f.isGlobal);
        const candidateFlows = [...campaignScopedFlows, ...globalFlows];

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
      }

      if (!targetFlow) {
        this.logger.log(`No flow matched for inbound reply from ${context.fromEmail}`);
        return { actionsExecuted: ['No matching flow found for inbound reply.'] };
      }

      // Check trigger condition match
      let triggerMatched = true;
      let triggerReason = 'Inbound trigger condition met.';
      if (targetFlow.triggerType === 'keyword_match') {
        const cfg = (targetFlow.triggerConfig || {}) as any;
        const keywords: string[] = Array.isArray(cfg.keywords)
          ? cfg.keywords
          : typeof cfg.keywords === 'string'
          ? cfg.keywords.split(',').map((k: string) => k.trim())
          : [];
        const matchMode = cfg.matchMode || 'contains';

        if (keywords.length > 0) {
          const matchedKw = keywords.find((kw) => {
            const cleanKw = kw.toLowerCase().trim();
            if (!cleanKw) return false;
            if (matchMode === 'exact') {
              return inboundTextLower.trim() === cleanKw;
            }
            return inboundTextLower.includes(cleanKw);
          });

          if (matchedKw) {
            triggerMatched = true;
            triggerReason = `Trigger keyword "${matchedKw}" matched in message body.`;
          } else {
            triggerMatched = false;
            triggerReason = `Inbound message does not contain any required trigger keywords: [${keywords.join(', ')}]`;
          }
        }
      }

      if (!triggerMatched) {
        return {
          matchedFlowId: targetFlow.id,
          flowName: targetFlow.name,
          triggerMatched: false,
          triggerReason,
          actionsExecuted: [`Trigger not matched: ${triggerReason}`],
        };
      }

      this.logger.log(
        `Triggering Email Flow "${targetFlow.name}" (${targetFlow.id}) for recipient ${context.fromEmail}`,
      );

      // 3. Seed Flow Run record (skip in simulation mode)
      let flowRunId: string | null = null;
      if (!context.isSimulation && targetFlow.id) {
        try {
          const flowRun = await this.prisma.emailFlowRun.create({
            data: {
              flowId: targetFlow.id,
              recipientId: context.recipient?.id || null,
              campaignId: campaignId || null,
              leadId: context.recipient?.leadId || null,
              status: 'active',
              inboundSubject: context.subject,
              inboundBody: context.body,
            },
          });
          flowRunId = flowRun.id;
        } catch (err: any) {
          this.logger.warn(`Could not seed flow run record: ${err.message}`);
        }
      }

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
      let renderedSubjectText = '';
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
            const subject = config.subject
              ? this.interpolateText(config.subject, recipient)
              : context.subject.startsWith('Re:')
              ? context.subject
              : `Re: ${context.subject}`;

            const htmlBody = this.interpolateText(
              config.htmlBody || config.bodyHtml || config.textBody || 'Thank you for reaching out.',
              recipient,
            );
            const textBody = this.interpolateText(
              config.textBody || config.bodyHtml || config.htmlBody || 'Thank you for reaching out.',
              recipient,
            );

            if (!context.isSimulation) {
              await this.dispatchOutboundReply({
                recipient,
                subject,
                htmlContent: htmlBody,
                plainTextContent: textBody,
                inboundMsgId: context.providerMsgId,
              });
              actionsExecuted.push(`Sent email reply: "${subject}"`);
            } else {
              actionsExecuted.push(`Send Email Reply: "${subject}"`);
            }

            outboundReplyText = textBody;
            renderedSubjectText = subject;

            nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
              ? nodeMap.get(config.next_node_key)
              : nextLinearNode;
            break;
          }

          // ── Action: AI Agent Autoreply (Groq openai/gpt-oss-120b) ──
          case 'ai_agent':
          case 'ai_reply': {
            const stopIfHumanActive = config.stopIfHumanActive !== false;
            if (!context.isSimulation && stopIfHumanActive && recipient?.lead?.assignedUserId) {
              this.logger.log(
                `Skipping AI autoreply: Lead ${recipient.lead.id} is already claimed by executive ${recipient.lead.assignedUserId}.`,
              );
              actionsExecuted.push('AI reply skipped (lead is actively managed by a human sales executive)');
              nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
                ? nodeMap.get(config.next_node_key)
                : nextLinearNode;
              break;
            }

            let aiReply = { subject: `Re: ${context.subject}`, textBody: '', htmlBody: '' };
            try {
              aiReply = await this.aiService.generateAutoreply({
                leadName: recipient.name || recipient.lead?.firstName || 'Valued Buyer',
                inboundSubject: context.subject,
                inboundBody: context.body,
                originalCampaignTitle: recipient.campaign?.title,
                originalSubject: recipient.campaign?.subject,
                project: recipient.campaign?.project,
                customInstructions: config.instructions,
              });
            } catch (aiErr: any) {
              this.logger.warn(`AI generateAutoreply fallback: ${aiErr.message}`);
              aiReply.textBody = `Thank you for contacting us regarding ${recipient.campaign?.project?.name || 'Skyline Crest Residences'}. We will share the complete price sheet and project highlights with you shortly.`;
              aiReply.htmlBody = `<p>${aiReply.textBody}</p>`;
            }

            if (!context.isSimulation) {
              await this.dispatchOutboundReply({
                recipient,
                subject: aiReply.subject,
                htmlContent: aiReply.htmlBody,
                plainTextContent: aiReply.textBody,
                inboundMsgId: context.providerMsgId,
              });
              actionsExecuted.push(`AI Concierge generated & dispatched reply: "${aiReply.subject}"`);
            } else {
              actionsExecuted.push(`AI Concierge (Groq openai/gpt-oss-120b) generated reply: "${aiReply.subject}"`);
            }

            outboundReplyText = aiReply.textBody;
            renderedSubjectText = aiReply.subject;

            nextNodeToExecute = config.next_node_key && nodeMap.has(config.next_node_key)
              ? nodeMap.get(config.next_node_key)
              : nextLinearNode;
            break;
          }

          // ── Action: Condition / Branching (WhatsApp Parity) ──
          case 'condition':
          case 'if_else': {
            const criteriaType = config.criteriaType || 'keywords';
            let conditionMet = false;

            if (criteriaType === 'tag') {
              const targetTag = (config.targetTag || '').toLowerCase().trim();
              const leadTags: string[] = (recipient?.lead?.tags || []).map((t: any) =>
                typeof t === 'string' ? t.toLowerCase() : (t.name || '').toLowerCase(),
              );
              conditionMet = !!targetTag && leadTags.includes(targetTag);
            } else if (criteriaType === 'budget') {
              const minBudget = Number(config.minBudget) || 0;
              const leadBudget = Number(recipient?.lead?.budget) || 0;
              conditionMet = leadBudget >= minBudget;
            } else {
              // Default: keyword match in inbound text
              const rawKeywords = config.keywords;
              const kwList: string[] = Array.isArray(rawKeywords)
                ? rawKeywords
                : typeof rawKeywords === 'string'
                ? rawKeywords.split(',').map((k: string) => k.trim().toLowerCase())
                : [];

              conditionMet = kwList.length === 0 || kwList.some((kw) => kw && inboundTextLower.includes(kw));
            }

            const branches = config.branches || (currentNode as any).branches;
            const branchKey = conditionMet ? 'yes' : 'no';
            const branchSteps: any[] = branches?.[branchKey] || [];

            if (branchSteps.length > 0) {
              actionsExecuted.push(
                `Condition evaluated to ${conditionMet ? 'TRUE' : 'FALSE'} -> Executing ${branchKey.toUpperCase()} branch (${branchSteps.length} step${branchSteps.length === 1 ? '' : 's'})`,
              );

              // Execute steps inside the active branch
              for (const bStep of branchSteps) {
                const bType = bStep.nodeType;
                const bConfig = bStep.config || {};

                if (bType === 'send_email' || bType === 'send_email_reply') {
                  const subject = bConfig.subject
                    ? this.interpolateText(bConfig.subject, recipient)
                    : context.subject.startsWith('Re:')
                    ? context.subject
                    : `Re: ${context.subject}`;

                  const htmlBody = this.interpolateText(
                    bConfig.htmlBody || bConfig.bodyHtml || bConfig.textBody || 'Thank you for reaching out.',
                    recipient,
                  );
                  const textBody = this.interpolateText(
                    bConfig.textBody || bConfig.bodyHtml || bConfig.htmlBody || 'Thank you for reaching out.',
                    recipient,
                  );

                  if (!context.isSimulation) {
                    await this.dispatchOutboundReply({
                      recipient,
                      subject,
                      htmlContent: htmlBody,
                      plainTextContent: textBody,
                      inboundMsgId: context.providerMsgId,
                    });
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] Sent email reply: "${subject}"`);
                  } else {
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] Send Email Reply: "${subject}"`);
                  }
                  outboundReplyText = textBody;
                  renderedSubjectText = subject;
                } else if (bType === 'ai_agent' || bType === 'ai_reply') {
                  let aiReply = { subject: `Re: ${context.subject}`, textBody: '', htmlBody: '' };
                  try {
                    aiReply = await this.aiService.generateAutoreply({
                      leadName: recipient.name || recipient.lead?.firstName || 'Valued Buyer',
                      inboundSubject: context.subject,
                      inboundBody: context.body,
                      originalCampaignTitle: recipient.campaign?.title,
                      originalSubject: recipient.campaign?.subject,
                      project: recipient.campaign?.project,
                      customInstructions: bConfig.instructions,
                    });
                  } catch (aiErr: any) {
                    aiReply.textBody = `Thank you for contacting us regarding ${recipient.campaign?.project?.name || 'Skyline Crest Residences'}. We will share the complete price sheet and project highlights with you shortly.`;
                    aiReply.htmlBody = `<p>${aiReply.textBody}</p>`;
                  }

                  if (!context.isSimulation) {
                    await this.dispatchOutboundReply({
                      recipient,
                      subject: aiReply.subject,
                      htmlContent: aiReply.htmlBody,
                      plainTextContent: aiReply.textBody,
                      inboundMsgId: context.providerMsgId,
                    });
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] AI Concierge dispatched reply: "${aiReply.subject}"`);
                  } else {
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] AI Concierge generated reply: "${aiReply.subject}"`);
                  }
                  outboundReplyText = aiReply.textBody;
                  renderedSubjectText = aiReply.subject;
                } else if (bType === 'add_tag' || bType === 'add_lead_tag') {
                  const tagName = bConfig.tagName || bConfig.tag;
                  if (tagName) {
                    if (!context.isSimulation) {
                      await this.prisma.emailTag.upsert({
                        where: { name: tagName },
                        create: { name: tagName, color: bConfig.color || '#8B5CF6' },
                        update: {},
                      });
                    }
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] Assigned CRM tag "${tagName}"`);
                  }
                } else if (bType === 'end') {
                  actionsExecuted.push(`[${branchKey.toUpperCase()}] Flow execution terminated.`);
                  break;
                }
              }

              nextNodeToExecute = nextLinearNode;
            } else {
              // Fallback to node pointer if no nested branch steps
              if (conditionMet) {
                actionsExecuted.push(
                  `Condition matched -> Branch TRUE (${config.if_true_node_key || 'continue sequence'})`,
                );
                nextNodeToExecute = config.if_true_node_key && nodeMap.has(config.if_true_node_key)
                  ? nodeMap.get(config.if_true_node_key)
                  : nextLinearNode;
              } else {
                actionsExecuted.push(
                  `Condition not matched -> Branch FALSE (${config.if_false_node_key || 'continue sequence'})`,
                );
                nextNodeToExecute = config.if_false_node_key && nodeMap.has(config.if_false_node_key)
                  ? nodeMap.get(config.if_false_node_key)
                  : nextLinearNode;
              }
            }
            break;
          }

          // ── Action: Assign Tag ──
          case 'add_tag':
          case 'add_lead_tag': {
            const tagName = config.tagName || config.tag;
            if (tagName) {
              if (!context.isSimulation) {
                await this.prisma.emailTag.upsert({
                  where: { name: tagName },
                  create: { name: tagName, color: config.color || '#8B5CF6' },
                  update: {},
                });
              }
              actionsExecuted.push(`Assigned CRM tag "${tagName}"`);
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

      // 6. Mark Flow Run completed if recorded
      if (flowRunId) {
        await this.prisma.emailFlowRun.update({
          where: { id: flowRunId },
          data: {
            status: 'completed',
            outboundReply: outboundReplyText || null,
            endedAt: new Date(),
          },
        });
      }

      return {
        matchedFlowId: targetFlow.id,
        flowName: targetFlow.name,
        triggerMatched: true,
        triggerReason,
        actionsExecuted,
        outboundReply: outboundReplyText || undefined,
        renderedSubject: renderedSubjectText || undefined,
        renderedBody: outboundReplyText || undefined,
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
