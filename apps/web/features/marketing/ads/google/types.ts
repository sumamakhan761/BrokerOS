// ============================================================================
// BrokerOS — Google Ads Web Feature Types
// ============================================================================

export type GoogleChannelType =
  | 'SEARCH'
  | 'PERFORMANCE_MAX'
  | 'DISPLAY'
  | 'VIDEO'
  | 'MULTI_CHANNEL'
  | 'UNKNOWN';

export type GoogleStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';

export interface GoogleCampaignItem {
  id: string;
  name: string;
  advertisingChannelType: GoogleChannelType;
  status: GoogleStatus;
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
  lastSyncedAt?: string;
  integration?: {
    id: string;
    name: string;
    customerId: string;
    currency: string;
  };
}

export interface GoogleKpiSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCostPerConversion: number;
  avgCtr: number;
  avgCpc: number;
  activeCampaignsCount: number;
  totalCampaignsCount: number;
}

export interface GoogleKeywordItem {
  id?: string;
  text: string;
  matchType: 'EXACT' | 'PHRASE' | 'BROAD';
  status?: string;
  qualityScore?: number; // 1 - 10
  clicks: number;
  impressions: number;
  cpc: number;
  cost: number;
}

export interface GoogleAcquiredLeadItem {
  logId: string;
  googleLeadId: string;
  formId?: string;
  gclid?: string;
  capturedAt: string;
  lead: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    city?: string;
    budget?: number;
    status: string;
    temperature?: string;
    createdAt: string;
    assignedUser?: {
      id: string;
      name: string;
    };
  };
}

export interface GoogleIntegrationItem {
  id: string;
  name: string;
  customerId: string;
  formattedCustomerId: string;
  managerCustomerId?: string;
  currency: string;
  timezone?: string;
  descriptiveName?: string;
  accountStatus: string;
  isActive: boolean;
  isDefault: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  _count?: {
    campaigns: number;
    webhookLogs: number;
  };
}
