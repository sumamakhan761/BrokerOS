import crypto from 'crypto';
import type {
  IMetaAdsProvider,
  MetaAd,
  MetaAdAccount,
  MetaAdCreative,
  MetaAdSet,
  MetaCampaign,
  MetaInsightMetrics,
  MetaIntegrationCredentials,
  MetaLeadData,
} from '@brokeros/types';
import { META_GRAPH_BASE_URL } from '@brokeros/constants';

export class MetaGraphApiClient implements IMetaAdsProvider {
  private formatAdAccountId(rawId: string): string {
    const cleaned = rawId.trim();
    return cleaned.startsWith('act_') ? cleaned : `act_${cleaned}`;
  }

  private parseInsights(insightsData?: Record<string, any>): MetaInsightMetrics {
    if (!insightsData) {
      return {
        spend: 0,
        impressions: 0,
        reach: 0,
        clicks: 0,
        uniqueClicks: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        leadsCount: 0,
        costPerLead: 0,
      };
    }

    const spend = parseFloat(insightsData.spend || '0');
    const impressions = parseInt(insightsData.impressions || '0', 10);
    const reach = parseInt(insightsData.reach || '0', 10);
    const clicks = parseInt(insightsData.clicks || '0', 10);
    const uniqueClicks = parseInt(insightsData.unique_clicks || '0', 10);
    const ctr = parseFloat(insightsData.ctr || '0');
    const cpc = parseFloat(insightsData.cpc || '0');
    const cpm = parseFloat(insightsData.cpm || '0');

    // Extract leads from actions array
    let leadsCount = 0;
    if (Array.isArray(insightsData.actions)) {
      for (const act of insightsData.actions) {
        if (
          act.action_type === 'lead' ||
          act.action_type === 'onsite_conversion.lead_grouped' ||
          act.action_type === 'leadgen.other' ||
          act.action_type === 'contact'
        ) {
          leadsCount += parseInt(act.value || '0', 10);
        }
      }
    }

    // Extract Cost Per Lead
    let costPerLead = 0;
    if (Array.isArray(insightsData.cost_per_action_type)) {
      for (const costAct of insightsData.cost_per_action_type) {
        if (
          costAct.action_type === 'lead' ||
          costAct.action_type === 'onsite_conversion.lead_grouped' ||
          costAct.action_type === 'leadgen.other'
        ) {
          costPerLead = parseFloat(costAct.value || '0');
          break;
        }
      }
    }

    if (costPerLead === 0 && leadsCount > 0 && spend > 0) {
      costPerLead = parseFloat((spend / leadsCount).toFixed(2));
    }

    return {
      spend,
      impressions,
      reach,
      clicks,
      uniqueClicks,
      ctr,
      cpc,
      cpm,
      leadsCount,
      costPerLead,
      dateStart: insightsData.date_start,
      dateStop: insightsData.date_stop,
    };
  }

  /**
   * Validates credentials against Meta Graph API by pinging the Ad Account endpoint.
   */
  async validateCredentials(credentials: MetaIntegrationCredentials): Promise<boolean> {
    if (!credentials.adAccountId || !credentials.accessToken) {
      return false;
    }

    try {
      const actId = this.formatAdAccountId(credentials.adAccountId);
      const url = `${META_GRAPH_BASE_URL}/${actId}?fields=id,name,account_status,currency&access_token=${encodeURIComponent(credentials.accessToken)}`;

      const res = await fetch(url, { method: 'GET' });
      const data = (await res.json().catch(() => ({}))) as any;

      if (res.status === 200 && data.id) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves high-level account status, balance, currency, and total spend.
   */
  async getAccountDetails(credentials: MetaIntegrationCredentials): Promise<MetaAdAccount> {
    const actId = this.formatAdAccountId(credentials.adAccountId);
    const url = `${META_GRAPH_BASE_URL}/${actId}?fields=id,name,account_status,currency,amount_spent,balance,business_name,timezone_name&access_token=${encodeURIComponent(credentials.accessToken)}`;

    const res = await fetch(url, { method: 'GET' });
    const data = (await res.json().catch(() => ({}))) as any;

    if (res.status !== 200 || !data.id) {
      throw new Error(data?.error?.message || `Failed to fetch Meta Ad Account ${actId}`);
    }

    return {
      id: data.id,
      name: data.name || 'Meta Ad Account',
      accountStatus: data.account_status ?? 1,
      currency: data.currency || 'INR',
      amountSpent: (parseFloat(data.amount_spent || '0') / 100).toFixed(2), // minor units to standard
      balance: data.balance ? (parseFloat(data.balance) / 100).toFixed(2) : undefined,
      businessName: data.business_name,
      timezoneName: data.timezone_name,
    };
  }

  /**
   * Fetches all campaigns with their lifetime/current insights from Meta Graph API.
   */
  async getCampaigns(
    credentials: MetaIntegrationCredentials,
    datePreset: string = 'maximum',
  ): Promise<MetaCampaign[]> {
    const actId = this.formatAdAccountId(credentials.adAccountId);
    const fields = [
      'id',
      'name',
      'objective',
      'status',
      'effective_status',
      'daily_budget',
      'lifetime_budget',
      'start_time',
      'stop_time',
      'created_time',
      'updated_time',
      `insights.date_preset(${datePreset}){spend,impressions,reach,clicks,unique_clicks,cpc,cpm,ctr,actions,cost_per_action_type}`,
    ].join(',');

    const effectiveStatuses = JSON.stringify([
      'ACTIVE',
      'PAUSED',
      'ARCHIVED',
      'IN_PROCESS',
      'WITH_ISSUES',
      'PENDING_REVIEW',
      'PENDING_BILLING_INFO',
    ]);

    const url = `${META_GRAPH_BASE_URL}/${actId}/campaigns?fields=${fields}&effective_status=${encodeURIComponent(effectiveStatuses)}&limit=100&access_token=${encodeURIComponent(credentials.accessToken)}`;

    const res = await fetch(url, { method: 'GET' });
    const data = (await res.json().catch(() => ({}))) as any;

    if (res.status !== 200 || !data.data) {
      throw new Error(data?.error?.message || `Failed to fetch campaigns for ${actId}`);
    }

    return (data.data || []).map((raw: any) => {
      const insightObj = raw.insights?.data?.[0];
      const insights = this.parseInsights(insightObj);

      return {
        id: raw.id,
        name: raw.name || 'Untitled Campaign',
        objective: raw.objective || 'OUTCOME_LEADS',
        status: raw.status || 'PAUSED',
        effectiveStatus: raw.effective_status || 'PAUSED',
        dailyBudget: raw.daily_budget ? parseFloat(raw.daily_budget) / 100 : undefined,
        lifetimeBudget: raw.lifetime_budget ? parseFloat(raw.lifetime_budget) / 100 : undefined,
        startTime: raw.start_time,
        stopTime: raw.stop_time,
        createdTime: raw.created_time,
        updatedTime: raw.updated_time,
        insights,
      };
    });
  }

  /**
   * Fetches ad sets belonging to a campaign, along with their audience targeting profile.
   */
  async getAdSets(campaignId: string, credentials: MetaIntegrationCredentials): Promise<MetaAdSet[]> {
    const fields = [
      'id',
      'name',
      'campaign_id',
      'status',
      'effective_status',
      'daily_budget',
      'lifetime_budget',
      'billing_event',
      'optimization_goal',
      'targeting',
      'insights.date_preset(maximum){spend,impressions,reach,clicks,unique_clicks,cpc,cpm,ctr,actions,cost_per_action_type}',
    ].join(',');

    const url = `${META_GRAPH_BASE_URL}/${campaignId}/adsets?fields=${fields}&limit=50&access_token=${encodeURIComponent(credentials.accessToken)}`;

    const res = await fetch(url, { method: 'GET' });
    const data = (await res.json().catch(() => ({}))) as any;

    if (res.status !== 200 || !data.data) {
      return [];
    }

    return (data.data || []).map((raw: any) => {
      const rawTargeting = raw.targeting || {};
      const insightObj = raw.insights?.data?.[0];

      return {
        id: raw.id,
        name: raw.name || 'Ad Set',
        campaignId: raw.campaign_id || campaignId,
        status: raw.status || 'PAUSED',
        effectiveStatus: raw.effective_status || 'PAUSED',
        dailyBudget: raw.daily_budget ? parseFloat(raw.daily_budget) / 100 : undefined,
        lifetimeBudget: raw.lifetime_budget ? parseFloat(raw.lifetime_budget) / 100 : undefined,
        billingEvent: raw.billing_event,
        optimizationGoal: raw.optimization_goal,
        targeting: {
          ageMin: rawTargeting.age_min,
          ageMax: rawTargeting.age_max,
          genders: rawTargeting.genders,
          geoLocations: {
            countries: rawTargeting.geo_locations?.countries,
            cities: (rawTargeting.geo_locations?.cities || []).map((c: any) => ({
              name: c.name,
              radius: c.radius,
              distanceUnit: c.distance_unit,
            })),
          },
          interests: (rawTargeting.flexible_spec?.[0]?.interests || rawTargeting.interests || []).map((i: any) => ({
            id: i.id,
            name: i.name,
          })),
        },
        insights: this.parseInsights(insightObj),
      };
    });
  }

  /**
   * Fetches ads and their visual creatives (headlines, body text, image/thumbnail URLs, CTA).
   */
  async getAdsAndCreatives(adSetId: string, credentials: MetaIntegrationCredentials): Promise<MetaAd[]> {
    const fields = [
      'id',
      'name',
      'status',
      'effective_status',
      'created_time',
      'updated_time',
      'creative{id,name,title,body,image_url,thumbnail_url,call_to_action_type,object_story_spec,asset_feed_spec,instagram_permalink_url}',
      'insights.date_preset(maximum){spend,impressions,reach,clicks,unique_clicks,cpc,cpm,ctr,actions,cost_per_action_type}',
    ].join(',');

    const url = `${META_GRAPH_BASE_URL}/${adSetId}/ads?fields=${fields}&limit=50&access_token=${encodeURIComponent(credentials.accessToken)}`;

    const res = await fetch(url, { method: 'GET' });
    const data = (await res.json().catch(() => ({}))) as any;

    if (res.status !== 200 || !data.data) {
      return [];
    }

    return (data.data || []).map((raw: any) => {
      const c = raw.creative || {};
      const oss = c.object_story_spec?.link_data || c.object_story_spec?.video_data || {};
      const insightObj = raw.insights?.data?.[0];

      const creative: MetaAdCreative = {
        id: c.id || `cr_${raw.id}`,
        name: c.name || raw.name || 'Ad Creative',
        title: c.title || oss.name || oss.title,
        body: c.body || oss.message || oss.description,
        imageUrl: c.image_url || oss.image_url || oss.picture,
        thumbnailUrl: c.thumbnail_url || oss.image_url || oss.picture,
        callToActionType: c.call_to_action_type || oss.call_to_action?.type || 'LEARN_MORE',
        previewUrl: c.instagram_permalink_url,
        instagramPermalinkUrl: c.instagram_permalink_url,
        objectStorySpec: c.object_story_spec,
        assetFeedSpec: c.asset_feed_spec,
      };

      return {
        id: raw.id,
        name: raw.name || 'Ad',
        adSetId,
        campaignId: raw.campaign_id,
        status: raw.status || 'PAUSED',
        effectiveStatus: raw.effective_status || 'PAUSED',
        creative,
        insights: this.parseInsights(insightObj),
        createdTime: raw.created_time,
        updatedTime: raw.updated_time,
      };
    });
  }

  /**
   * Fetches lead form submission details by `leadgen_id` using Page Access Token.
   */
  async getLeadDetails(leadgenId: string, pageAccessToken: string): Promise<MetaLeadData> {
    const fields = [
      'id',
      'created_time',
      'ad_id',
      'ad_name',
      'adset_id',
      'adset_name',
      'campaign_id',
      'campaign_name',
      'form_id',
      'page_id',
      'field_data',
    ].join(',');

    const url = `${META_GRAPH_BASE_URL}/${leadgenId}?fields=${fields}&access_token=${encodeURIComponent(pageAccessToken)}`;

    const res = await fetch(url, { method: 'GET' });
    const data = (await res.json().catch(() => ({}))) as any;

    if (res.status !== 200 || !data.id) {
      throw new Error(data?.error?.message || `Failed to fetch lead details for leadgen_id: ${leadgenId}`);
    }

    const customFields: Record<string, any> = {};
    let fullName: string | undefined;
    let firstName: string | undefined;
    let lastName: string | undefined;
    let email: string | undefined;
    let phoneNumber: string | undefined;
    let city: string | undefined;
    let budget: number | undefined;

    if (Array.isArray(data.field_data)) {
      for (const field of data.field_data) {
        const name = (field.name || '').toLowerCase();
        const value = field.values?.[0] || '';

        if (name === 'full_name' || name === 'name') {
          fullName = value;
        } else if (name === 'first_name') {
          firstName = value;
        } else if (name === 'last_name') {
          lastName = value;
        } else if (name === 'email') {
          email = value;
        } else if (name === 'phone_number' || name === 'phone') {
          phoneNumber = value;
        } else if (name === 'city' || name === 'location') {
          city = value;
        } else if (name.includes('budget')) {
          const num = parseFloat(value.replace(/[^\d.]/g, ''));
          if (!isNaN(num)) budget = num;
          customFields[field.name] = value;
        } else {
          customFields[field.name] = value;
        }
      }
    }

    if (!fullName && (firstName || lastName)) {
      fullName = `${firstName || ''} ${lastName || ''}`.trim();
    }

    return {
      id: data.id,
      createdTime: data.created_time || new Date().toISOString(),
      adId: data.ad_id,
      adName: data.ad_name,
      adSetId: data.adset_id,
      adSetName: data.adset_name,
      campaignId: data.campaign_id,
      campaignName: data.campaign_name,
      formId: data.form_id || 'unknown_form',
      pageId: data.page_id || 'unknown_page',
      fullName,
      firstName,
      lastName,
      email,
      phoneNumber,
      city,
      budget,
      customFields,
    };
  }

  /**
   * Cryptographically verifies Meta Webhook HMAC-SHA256 signature (`x-hub-signature-256`).
   */
  verifyWebhookSignature(signature: string, rawPayload: string, appSecret: string): boolean {
    if (!signature || !rawPayload || !appSecret) {
      return false;
    }

    try {
      const parts = signature.split('=');
      const hash = parts.length === 2 ? parts[1] : signature;
      const expectedHash = crypto
        .createHmac('sha256', appSecret)
        .update(rawPayload, 'utf8')
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
    } catch {
      return false;
    }
  }
}
