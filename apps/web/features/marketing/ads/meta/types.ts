export interface MetaIntegrationItem {
  id: string;
  name: string;
  adAccountId: string;
  currency: string;
  timezone?: string;
  accountStatus: number;
  isActive: boolean;
  isDefault: boolean;
  pageIds?: string[];
  lastSyncedAt?: string;
  createdAt: string;
  _count?: {
    campaigns: number;
    webhookLogs: number;
  };
}

export interface MetaCampaignCacheItem {
  id: string;
  integrationId: string;
  name: string;
  objective: string;
  status: string;
  effectiveStatus?: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leadsCount: number;
  costPerLead: number;
  startTime?: string;
  stopTime?: string;
  adSetsData?: any[];
  creativesData?: any[];
  lastSyncedAt: string;
  integration?: {
    id: string;
    name: string;
    adAccountId: string;
    currency: string;
    timezone?: string;
  };
}

export interface MetaCampaignSummaryKpis {
  totalSpend: number;
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalLeads: number;
  avgCpl: number;
  avgCtr: number;
  activeCampaignsCount: number;
  totalCampaignsCount: number;
}

export interface MetaAcquiredLeadItem {
  logId: string;
  leadgenId: string;
  formId?: string;
  adId?: string;
  capturedAt: string;
  lead?: {
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
      email?: string;
    };
  };
}
