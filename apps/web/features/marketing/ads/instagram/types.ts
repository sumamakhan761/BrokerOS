import type {
  InstagramPlacementType,
  InstagramPlacementMetrics,
  InstagramPlacementBreakdown,
  InstagramCreativeData,
  InstagramCampaignSummaryKpis,
  InstagramCampaignOverviewItem,
} from '@brokeros/types';

export type {
  InstagramPlacementType,
  InstagramPlacementMetrics,
  InstagramPlacementBreakdown,
  InstagramCreativeData,
  InstagramCampaignSummaryKpis,
  InstagramCampaignOverviewItem,
};

export interface InstagramAcquiredLeadItem {
  logId: string;
  leadgenId: string;
  formId?: string;
  adId?: string;
  capturedAt: string;
  lead: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    city?: string;
    budget?: number;
    status: string;
    temperature: string;
    createdAt: string;
    assignedUser?: {
      id: string;
      name: string;
    };
  };
}

export interface InstagramIntegrationItem {
  id: string;
  name: string;
  adAccountId: string;
  currency: string;
  timezone?: string;
  accountStatus: number;
  isActive: boolean;
  isDefault: boolean;
  pageIds: string[];
  lastSyncedAt?: string;
  createdAt: string;
  _count?: {
    campaigns: number;
    webhookLogs: number;
  };
}
