import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../lib/database/prisma.service.js';
import { MetaGraphApiClient } from '@brokeros/int-ads-meta';

@Injectable()
export class MetaLeadsService {
  private readonly logger = new Logger(MetaLeadsService.name);
  private readonly client = new MetaGraphApiClient();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processes an incoming leadgen webhook event from Meta.
   */
  async processLeadgenEvent(payload: Record<string, any>) {
    try {
      this.logger.log(`Processing inbound Meta webhook payload`);

      // Extract entries from Meta standard webhook format
      // { object: "page", entry: [ { id: "page_id", changes: [ { field: "leadgen", value: { leadgen_id: "...", form_id: "..." } } ] } ] }
      const entries = payload.entry || [];
      const results: any[] = [];

      for (const entry of entries) {
        const pageId = entry.id;
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === 'leadgen' && change.value) {
            const leadgenId = String(change.value.leadgen_id);
            const formId = change.value.form_id
              ? String(change.value.form_id)
              : undefined;
            const adId = change.value.ad_id
              ? String(change.value.ad_id)
              : undefined;
            const campaignId = change.value.campaign_id
              ? String(change.value.campaign_id)
              : undefined;

            this.logger.log(
              `Received leadgen event: leadgenId=${leadgenId}, pageId=${pageId}`,
            );

            // Find matching active integration that manages this page or is default
            const integration = await this.prisma.metaAdIntegration.findFirst({
              where: {
                isActive: true,
                OR: [{ pageIds: { has: pageId } }, { isDefault: true }],
              },
            });

            if (!integration) {
              this.logger.warn(
                `No active Meta integration found for Page ID ${pageId}. Logging payload.`,
              );
              await this.prisma.metaLeadWebhookLog.create({
                data: {
                  leadgenId,
                  pageId,
                  formId,
                  adId,
                  campaignId,
                  rawPayload: change.value,
                  status: 'UNMATCHED_INTEGRATION',
                  errorMessage: `No active Meta integration mapped to page ${pageId}`,
                },
              });
              continue;
            }

            // Fetch full lead field data from Meta
            let leadData: any;
            try {
              leadData = await this.client.getLeadDetails(
                leadgenId,
                integration.accessToken,
              );
            } catch (fetchErr: any) {
              this.logger.error(
                `Failed to fetch leadgen fields for ${leadgenId}: ${fetchErr?.message}`,
              );
              await this.prisma.metaLeadWebhookLog.create({
                data: {
                  integrationId: integration.id,
                  leadgenId,
                  pageId,
                  formId,
                  adId,
                  campaignId,
                  rawPayload: change.value,
                  status: 'FETCH_ERROR',
                  errorMessage: fetchErr?.message,
                },
              });
              continue;
            }

            // Create or match Lead in BrokerOS database
            const phone =
              leadData.phoneNumber || `+9199999${leadgenId.slice(-5)}`;
            const rawFullName = leadData.fullName || 'Meta Lead';
            const nameParts = rawFullName.trim().split(/\s+/);
            const firstName = leadData.firstName || nameParts[0] || 'Meta';
            const lastName =
              leadData.lastName ||
              (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null);
            const summaryText = `Generated via Meta Instant Lead Form (${leadData.formId || 'N/A'}) on Ad: ${leadData.adName || 'Ad'} / Campaign: ${leadData.campaignName || 'Campaign'}`;

            // Resolve LeadSource
            let leadSource = await this.prisma.leadSource.findFirst({
              where: { type: 'FACEBOOK_ADS' },
            });
            if (!leadSource) {
              leadSource = await this.prisma.leadSource
                .create({
                  data: {
                    name: 'Facebook & Instagram Ads',
                    type: 'FACEBOOK_ADS',
                    isActive: true,
                  },
                })
                .catch(() => null);
            }

            // Check if lead with this phone number already exists
            let crmLead = await this.prisma.lead.findFirst({
              where: { phone },
            });

            if (!crmLead) {
              crmLead = await this.prisma.lead.create({
                data: {
                  firstName,
                  lastName,
                  phone,
                  email: leadData.email || null,
                  preferredLocation: leadData.city || null,
                  budget: leadData.budget ? Number(leadData.budget) : null,
                  sourceId: leadSource?.id || null,
                  status: 'NEW',
                  temperature: 'HOT',
                  customerSummary: summaryText,
                  requirements: leadData.customFields
                    ? JSON.stringify(leadData.customFields)
                    : undefined,
                },
              });
              this.logger.log(
                `Created new CRM Lead ${crmLead.id} from Meta Lead Form for ${firstName} ${lastName || ''} (${phone})`,
              );
            } else {
              this.logger.log(
                `Existing CRM Lead found for ${phone}. Updating Meta lead inquiry summary.`,
              );
              await this.prisma.lead.update({
                where: { id: crmLead.id },
                data: {
                  customerSummary: crmLead.customerSummary
                    ? `${crmLead.customerSummary}\n\n[Meta Inbound] Repeated inquiry on campaign: ${leadData.campaignName || 'Meta Campaign'}`
                    : `[Meta Inbound] Repeated inquiry on campaign: ${leadData.campaignName || 'Meta Campaign'}`,
                },
              });
            }

            // Record audit in MetaLeadWebhookLog
            await this.prisma.metaLeadWebhookLog.create({
              data: {
                integrationId: integration.id,
                campaignCacheId: campaignId ? campaignId : undefined,
                leadgenId,
                pageId,
                formId,
                adId,
                campaignId,
                leadId: crmLead.id,
                fieldData: leadData.customFields || {},
                rawPayload: change.value,
                status: 'PROCESSED',
              },
            });

            results.push({ leadgenId, crmLeadId: crmLead.id, success: true });
          }
        }
      }

      return { processedCount: results.length, results };
    } catch (err: any) {
      this.logger.error(
        `Webhook processing exception: ${err?.message}`,
        err?.stack,
      );
      return { success: false, error: err?.message };
    }
  }
}
