// ============================================================================
// BrokerOS — Google Ads Types & Interfaces
// ============================================================================

export type GoogleAdvertisingChannelType =
  | 'SEARCH'
  | 'PERFORMANCE_MAX'
  | 'DISPLAY'
  | 'VIDEO'
  | 'DISCOVERY'
  | 'HOTEL'
  | 'MULTI_CHANNEL'
  | 'UNKNOWN';

export type GoogleCampaignStatus = 'ENABLED' | 'PAUSED' | 'REMOVED' | 'UNKNOWN';

export type GoogleKeywordMatchType = 'EXACT' | 'PHRASE' | 'BROAD';

export interface GoogleAdAccount {
  customerId: string; // e.g. "123-456-7890" or "1234567890"
  descriptiveName?: string;
  currencyCode: string;
  timeZone?: string;
  canManageClients?: boolean;
  testAccount?: boolean;
}

export interface GoogleInsightMetrics {
  spend: number; // Converted from cost_micros / 1,000,000
  impressions: number;
  clicks: number;
  ctr: number; // Percentage (e.g. 3.45%)
  cpc: number; // Average CPC in account currency
  conversions: number;
  costPerConversion: number;
  dateStart?: string;
  dateStop?: string;
}

export interface GoogleKeyword {
  id?: string;
  text: string;
  matchType: GoogleKeywordMatchType;
  status?: string;
  qualityScore?: number; // 1 - 10
  clicks: number;
  impressions: number;
  cpc: number;
  cost: number;
}

export interface GoogleAdGroup {
  id: string;
  name: string;
  campaignId: string;
  status: GoogleCampaignStatus;
  type?: string;
  cpcBid?: number;
  metrics?: GoogleInsightMetrics;
  keywords?: GoogleKeyword[];
}

export interface GoogleCampaign {
  id: string;
  name: string;
  channelType: GoogleAdvertisingChannelType;
  status: GoogleCampaignStatus;
  dailyBudget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  costPerConversion: number;
  startTime?: string;
  stopTime?: string;
  adGroups?: GoogleAdGroup[];
  keywords?: GoogleKeyword[];
  videoMetrics?: import('./youtube.js').YouTubeVideoMetrics;
}

export interface GoogleLeadColumnValue {
  columnId: string;
  stringValue: string;
}

export interface GoogleLeadFormData {
  leadId: string;
  formId: string;
  campaignId?: string;
  gclid?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  city?: string;
  budget?: number;
  customFields?: Record<string, any>;
  submittedAt?: string;
}

export interface GoogleOAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}

export interface GoogleIntegrationCredentials {
  customerId: string;
  refreshToken: string;
  managerCustomerId?: string;
  developerToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface IGoogleAdsProvider {
  generateOAuthUrl(clientId: string, redirectUri: string): string;
  exchangeCodeForTokens(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<GoogleOAuthTokens>;
  refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string): Promise<string>;
  listAccessibleCustomers(accessToken: string, developerToken: string): Promise<string[]>;
  getAccountDetails(customerId: string, accessToken: string, developerToken: string): Promise<GoogleAdAccount>;
  getCampaigns(customerId: string, accessToken: string, developerToken: string, managerCustomerId?: string): Promise<GoogleCampaign[]>;
  getKeywordsAndQualityScores(customerId: string, campaignId: string, accessToken: string, developerToken: string, managerCustomerId?: string): Promise<GoogleKeyword[]>;
  verifyLeadWebhook(payload: any, expectedKey: string): boolean;
}
