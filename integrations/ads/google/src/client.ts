import type {
  GoogleAdAccount,
  GoogleCampaign,
  GoogleKeyword,
  GoogleOAuthTokens,
  GoogleLeadFormData,
  IGoogleAdsProvider,
} from '@brokeros/types';
import {
  GOOGLE_ADS_BASE_URL,
  GOOGLE_OAUTH_AUTH_URL,
  GOOGLE_OAUTH_TOKEN_URL,
  GOOGLE_ADS_OAUTH_SCOPES,
  GOOGLE_REAL_ESTATE_KEYWORDS_CATALOG,
} from '@brokeros/constants';

export class GoogleAdsApiClient implements IGoogleAdsProvider {
  /**
   * Cleans Customer ID by removing hyphens and whitespace (e.g., "123-456-7890" -> "1234567890").
   */
  public cleanCustomerId(rawId: string): string {
    return (rawId || '').replace(/[-\s]/g, '').trim();
  }

  /**
   * Formats Customer ID for human display (e.g., "1234567890" -> "123-456-7890").
   */
  public formatDisplayCustomerId(cleanId: string): string {
    const s = this.cleanCustomerId(cleanId);
    if (s.length === 10) {
      return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`;
    }
    return cleanId;
  }

  /**
   * Generates standard Google OAuth 2.0 authorization URL.
   */
  generateOAuthUrl(clientId: string, redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: GOOGLE_ADS_OAUTH_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
    });

    if (state) {
      params.set('state', state);
    }

    return `${GOOGLE_OAUTH_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for refresh_token and access_token.
   */
  async exchangeCodeForTokens(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<GoogleOAuthTokens> {
    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      throw new Error(
        data?.error_description || data?.error || 'Failed to exchange Google OAuth code for tokens',
      );
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || '',
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  /**
   * Uses refresh_token to obtain a new temporary access_token.
   */
  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string,
  ): Promise<string> {
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    });

    const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      throw new Error(
        data?.error_description || data?.error || 'Failed to refresh Google access token',
      );
    }

    return data.access_token;
  }

  /**
   * Discovers all Google Ads Customer IDs accessible by this OAuth identity.
   */
  async listAccessibleCustomers(
    accessToken: string,
    developerToken: string,
  ): Promise<string[]> {
    const url = `${GOOGLE_ADS_BASE_URL}/customers:listAccessibleCustomers`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
      },
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.resourceNames) {
      return [];
    }

    // resourceNames format: ["customers/1234567890", "customers/9876543210"]
    return (data.resourceNames || []).map((rn: string) => rn.replace('customers/', ''));
  }

  /**
   * Retrieves high-level account currency, descriptive name, and timezone.
   */
  async getAccountDetails(
    customerId: string,
    accessToken: string,
    developerToken: string,
    managerCustomerId?: string,
  ): Promise<GoogleAdAccount> {
    const cleanCid = this.cleanCustomerId(customerId);
    const url = `${GOOGLE_ADS_BASE_URL}/customers/${cleanCid}/googleAds:search`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    if (managerCustomerId) {
      headers['login-customer-id'] = this.cleanCustomerId(managerCustomerId);
    }

    const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.manager,
        customer.test_account
      FROM customer
      LIMIT 1
    `;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    const row = data?.results?.[0]?.customer;
    if (!res.ok || !row) {
      return {
        customerId: cleanCid,
        descriptiveName: `Google Ads Account (${cleanCid})`,
        currencyCode: 'INR',
        timeZone: 'Asia/Kolkata',
      };
    }

    return {
      customerId: String(row.id || cleanCid),
      descriptiveName: row.descriptiveName || `Google Ads (${cleanCid})`,
      currencyCode: row.currencyCode || 'INR',
      timeZone: row.timeZone || 'Asia/Kolkata',
      canManageClients: Boolean(row.manager),
      testAccount: Boolean(row.testAccount),
    };
  }

  /**
   * Fetches active & paused campaigns using GAQL search.
   */
  async getCampaigns(
    customerId: string,
    accessToken: string,
    developerToken: string,
    managerCustomerId?: string,
  ): Promise<GoogleCampaign[]> {
    const cleanCid = this.cleanCustomerId(customerId);
    const url = `${GOOGLE_ADS_BASE_URL}/customers/${cleanCid}/googleAds:search`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    if (managerCustomerId) {
      headers['login-customer-id'] = this.cleanCustomerId(managerCustomerId);
    }

    // Query 1: Core campaign metadata & budget (Guaranteed to return 0-metric / new campaigns)
    const coreQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type,
        campaign.status,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.status != 'REMOVED'
    `;

    const coreRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: coreQuery }),
    });

    const coreData = (await coreRes.json().catch(() => ({}))) as any;

    if (!coreRes.ok || coreData?.error) {
      const errMsg =
        coreData?.error?.message ||
        coreData?.error?.details?.[0]?.message ||
        coreData?.error?.status ||
        `Google Ads API request failed (HTTP ${coreRes.status})`;
      console.error(`[GoogleAdsApiClient] getCampaigns core error for ${cleanCid}:`, errMsg, JSON.stringify(coreData));
      throw new Error(`Google Ads API error: ${errMsg}`);
    }

    const coreResults = Array.isArray(coreData?.results) ? coreData.results : [];

    // Query 2: Metrics query (for campaigns that have activity)
    const metricsMap = new Map<string, any>();
    try {
      const metricsQuery = `
        SELECT
          campaign.id,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversions,
          metrics.cost_per_conversion,
          metrics.video_views,
          metrics.video_view_rate,
          metrics.average_cpv,
          metrics.video_quartile_p25_rate,
          metrics.video_quartile_p50_rate,
          metrics.video_quartile_p75_rate,
          metrics.video_quartile_p100_rate
        FROM campaign
        WHERE campaign.status != 'REMOVED'
      `;

      const metricsRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: metricsQuery }),
      });

      const metricsData = (await metricsRes.json().catch(() => ({}))) as any;
      if (metricsRes.ok && Array.isArray(metricsData?.results)) {
        for (const r of metricsData.results) {
          if (r.campaign?.id) {
            metricsMap.set(String(r.campaign.id), r.metrics || {});
          }
        }
      }
    } catch {
      // Metrics optional for brand new 0-spend accounts
    }

    return coreResults.map((r: any) => {
      const camp = r.campaign || {};
      const budget = r.campaignBudget || {};
      const m = metricsMap.get(String(camp.id)) || {};

      const costMicros = parseFloat(m.costMicros || '0');
      const spend = parseFloat((costMicros / 1000000).toFixed(2));

      const avgCpcMicros = parseFloat(m.averageCpc || '0');
      const cpc = parseFloat((avgCpcMicros / 1000000).toFixed(2));

      const dailyBudgetMicros = parseFloat(budget.amountMicros || '0');
      const dailyBudget = dailyBudgetMicros > 0 ? parseFloat((dailyBudgetMicros / 1000000).toFixed(2)) : undefined;

      const conversions = parseFloat(m.conversions || '0');
      const costPerConversionMicros = parseFloat(m.costPerConversion || '0');
      const costPerConversion =
        costPerConversionMicros > 0
          ? parseFloat((costPerConversionMicros / 1000000).toFixed(2))
          : conversions > 0 && spend > 0
            ? parseFloat((spend / conversions).toFixed(2))
            : 0;

      const rawCtr = parseFloat(m.ctr || '0');
      const ctr = parseFloat((rawCtr * 100).toFixed(2));

      const rawCpvMicros = parseFloat(m.averageCpv || '0');
      const cpv = parseFloat((rawCpvMicros / 1000000).toFixed(2));
      const rawViewRate = parseFloat(m.videoViewRate || '0');
      const viewRate = parseFloat((rawViewRate * 100).toFixed(2));
      const videoViews = parseInt(m.videoViews || '0', 10);

      const quartile25 = parseFloat(((parseFloat(m.videoQuartileP25Rate || '0')) * 100).toFixed(1));
      const quartile50 = parseFloat(((parseFloat(m.videoQuartileP50Rate || '0')) * 100).toFixed(1));
      const quartile75 = parseFloat(((parseFloat(m.videoQuartileP75Rate || '0')) * 100).toFixed(1));
      const quartile100 = parseFloat(((parseFloat(m.videoQuartileP100Rate || '0')) * 100).toFixed(1));

      return {
        id: String(camp.id),
        name: camp.name || 'Google Campaign',
        channelType: camp.advertisingChannelType || 'SEARCH',
        status: camp.status || 'PAUSED',
        dailyBudget,
        spend,
        impressions: parseInt(m.impressions || '0', 10),
        clicks: parseInt(m.clicks || '0', 10),
        ctr,
        cpc,
        conversions,
        costPerConversion,
        startTime: camp.startDate,
        stopTime: camp.endDate,
        videoMetrics: {
          views: videoViews,
          viewRate,
          cpv,
          spend,
          impressions: parseInt(m.impressions || '0', 10),
          clicks: parseInt(m.clicks || '0', 10),
          leads: Math.round(conversions),
          costPerLead: costPerConversion,
          retention: {
            quartile25,
            quartile50,
            quartile75,
            quartile100,
          },
        },
      };
    });
  }

  /**
   * Fetches real estate search keywords, match types, and Quality Scores (1-10) for a campaign.
   */
  async getKeywordsAndQualityScores(
    customerId: string,
    campaignId: string,
    accessToken: string,
    developerToken: string,
    managerCustomerId?: string,
  ): Promise<GoogleKeyword[]> {
    const cleanCid = this.cleanCustomerId(customerId);
    const cleanCampId = campaignId.trim();
    const url = `${GOOGLE_ADS_BASE_URL}/customers/${cleanCid}/googleAds:search`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    if (managerCustomerId) {
      headers['login-customer-id'] = this.cleanCustomerId(managerCustomerId);
    }

    const query = `
      SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group_criterion.quality_info.quality_score,
        metrics.clicks,
        metrics.impressions,
        metrics.average_cpc,
        metrics.cost_micros
      FROM keyword_view
      WHERE campaign.id = ${cleanCampId}
      LIMIT 50
    `;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      });

      const data = (await res.json().catch(() => ({}))) as any;

      if (res.ok && Array.isArray(data?.results)) {
        return data.results.map((r: any) => {
          const crit = r.adGroupCriterion || {};
          const kw = crit.keyword || {};
          const qi = crit.qualityInfo || {};
          const m = r.metrics || {};

          const costMicros = parseFloat(m.costMicros || '0');
          const avgCpcMicros = parseFloat(m.averageCpc || '0');

          return {
            id: String(crit.criterionId || Math.random()),
            text: kw.text || 'real estate flat',
            matchType: kw.matchType || 'EXACT',
            status: crit.status || 'ENABLED',
            qualityScore: qi.qualityScore ? parseInt(qi.qualityScore, 10) : 8,
            clicks: parseInt(m.clicks || '0', 10),
            impressions: parseInt(m.impressions || '0', 10),
            cpc: parseFloat((avgCpcMicros / 1000000).toFixed(2)),
            cost: parseFloat((costMicros / 1000000).toFixed(2)),
          };
        });
      }
    } catch (err: any) {
      console.warn(`[GoogleAdsApiClient] getKeywords error for ${cleanCid}:`, err?.message);
    }

    return [];
  }

  /**
   * Validates Google Lead Form Asset webhook key.
   */
  verifyLeadWebhook(payload: any, expectedKey: string): boolean {
    if (!payload || !expectedKey) return false;
    return String(payload.google_key || '') === expectedKey;
  }

  /**
   * Normalizes incoming Google Lead Form webhook payload into CRM lead fields.
   */
  parseLeadData(payload: any): GoogleLeadFormData {
    const userColumnData = payload?.user_column_data || [];
    const customFields: Record<string, any> = {};

    let fullName: string | undefined;
    let firstName: string | undefined;
    let lastName: string | undefined;
    let phoneNumber: string | undefined;
    let email: string | undefined;
    let city: string | undefined;
    let budget: number | undefined;

    for (const col of userColumnData) {
      const colId = String(col.column_id || '').toUpperCase();
      const val = String(col.string_value || '').trim();

      if (colId === 'FULL_NAME' || colId === 'NAME') {
        fullName = val;
      } else if (colId === 'FIRST_NAME') {
        firstName = val;
      } else if (colId === 'LAST_NAME') {
        lastName = val;
      } else if (colId === 'PHONE_NUMBER' || colId === 'PHONE') {
        phoneNumber = val;
      } else if (colId === 'EMAIL') {
        email = val;
      } else if (colId === 'CITY' || colId === 'LOCATION') {
        city = val;
      } else if (colId.includes('BUDGET')) {
        const num = parseFloat(val.replace(/[^\d.]/g, ''));
        if (!isNaN(num)) budget = num;
        customFields[col.column_id] = val;
      } else {
        customFields[col.column_id] = val;
      }
    }

    if (!fullName && (firstName || lastName)) {
      fullName = `${firstName || ''} ${lastName || ''}`.trim();
    } else if (fullName && !firstName) {
      const parts = fullName.split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }

    return {
      leadId: String(payload?.lead_id || `gl_${Date.now()}`),
      formId: String(payload?.form_id || 'google_lead_form'),
      campaignId: payload?.campaign_id ? String(payload.campaign_id) : undefined,
      gclid: payload?.gclid ? String(payload.gclid) : undefined,
      fullName: fullName || 'Google Search Prospect',
      firstName,
      lastName,
      phoneNumber,
      email,
      city,
      budget,
      customFields,
      submittedAt: new Date().toISOString(),
    };
  }
}
