// ============================================================================
// BrokerOS — Meta Ads (Facebook & Instagram) Types & Interfaces
// ============================================================================

export type MetaAdObjective =
  | 'OUTCOME_LEADS'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_SALES'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_APP_PROMOTION';

export type MetaCampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
export type MetaEffectiveStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'IN_PROCESS' | 'WITH_ISSUES' | 'DISAPPROVED';

export interface MetaAdAccount {
  id: string; // e.g. "act_1234567890"
  name: string;
  accountStatus: number; // 1 = ACTIVE, 2 = DISABLED, 3 = UNSETTLED
  currency: string; // e.g. "INR", "USD"
  amountSpent: string; // Formatted spend in account currency
  balance?: string;
  businessName?: string;
  timezoneName?: string;
}

export interface MetaInsightMetrics {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  uniqueClicks: number;
  ctr: number; // Click-through rate (%)
  cpc: number; // Cost per click
  cpm: number; // Cost per 1,000 impressions
  leadsCount: number; // Instant Lead form submissions
  costPerLead: number; // CPL
  dateStart?: string;
  dateStop?: string;
}

export interface MetaAdCreative {
  id: string;
  name: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  callToActionType?: string; // "LEARN_MORE", "GET_QUOTE", "SIGN_UP", "DOWNLOAD", etc.
  previewUrl?: string;
  instagramPermalinkUrl?: string;
  objectStorySpec?: Record<string, any>;
  assetFeedSpec?: Record<string, any>;
}

export interface MetaAdSet {
  id: string;
  name: string;
  campaignId: string;
  status: MetaCampaignStatus;
  effectiveStatus: MetaEffectiveStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  billingEvent?: string;
  optimizationGoal?: string;
  targeting?: {
    ageMin?: number;
    ageMax?: number;
    genders?: number[]; // 1 = male, 2 = female
    geoLocations?: {
      countries?: string[];
      cities?: Array<{ name: string; radius?: number; distanceUnit?: string }>;
      regions?: Array<{ name: string }>;
    };
    interests?: Array<{ id: string; name: string }>;
    customAudiences?: Array<{ id: string; name: string }>;
  };
  insights?: MetaInsightMetrics;
}

export interface MetaAd {
  id: string;
  name: string;
  adSetId: string;
  campaignId: string;
  status: MetaCampaignStatus;
  effectiveStatus: MetaEffectiveStatus;
  creative: MetaAdCreative;
  insights?: MetaInsightMetrics;
  createdTime?: string;
  updatedTime?: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: MetaAdObjective | string;
  status: MetaCampaignStatus;
  effectiveStatus: MetaEffectiveStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  stopTime?: string;
  createdTime?: string;
  updatedTime?: string;
  insights?: MetaInsightMetrics;
  adSets?: MetaAdSet[];
  ads?: MetaAd[];
}

export interface MetaLeadData {
  id: string; // leadgen_id
  createdTime: string;
  adId?: string;
  adName?: string;
  adSetId?: string;
  adSetName?: string;
  campaignId?: string;
  campaignName?: string;
  formId: string;
  pageId: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  budget?: number;
  customFields?: Record<string, any>;
}

export interface MetaIntegrationCredentials {
  adAccountId: string; // "act_123456789"
  accessToken: string; // System user token or long-lived user token
  appId?: string;
  appSecret?: string;
  pageIds?: string[];
  name?: string;
}

export interface IMetaAdsProvider {
  validateCredentials(credentials: MetaIntegrationCredentials): Promise<boolean>;
  getAccountDetails(credentials: MetaIntegrationCredentials): Promise<MetaAdAccount>;
  getCampaigns(credentials: MetaIntegrationCredentials, datePreset?: string): Promise<MetaCampaign[]>;
  getAdSets(campaignId: string, credentials: MetaIntegrationCredentials): Promise<MetaAdSet[]>;
  getAdsAndCreatives(adSetId: string, credentials: MetaIntegrationCredentials): Promise<MetaAd[]>;
  getLeadDetails(leadgenId: string, pageAccessToken: string): Promise<MetaLeadData>;
  verifyWebhookSignature(signature: string, rawPayload: string, appSecret: string): boolean;
}
