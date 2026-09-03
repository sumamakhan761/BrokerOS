// ============================================================================
// BrokerOS — Instagram Ads Types & Interfaces
// ============================================================================

import type {
  MetaCampaignStatus,
  MetaEffectiveStatus,
  MetaInsightMetrics,
  MetaAdSet,
  MetaAdCreative,
} from './meta.js';

export type InstagramPlacementType = 'REELS' | 'STORY' | 'FEED' | 'EXPLORE';

export interface InstagramPlacementMetrics {
  placement: InstagramPlacementType;
  label: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leadsCount: number;
  costPerLead: number;
  ctr: number;
  videoViews?: number;
  swipeUps?: number;
}

export interface InstagramPlacementBreakdown {
  reels: InstagramPlacementMetrics;
  stories: InstagramPlacementMetrics;
  feed: InstagramPlacementMetrics;
  explore: InstagramPlacementMetrics;
}

export interface InstagramCreativeData extends MetaAdCreative {
  aspectRatio?: '9:16' | '1:1' | '4:5' | '16:9';
  mediaType?: 'VIDEO' | 'IMAGE' | 'CAROUSEL';
  instagramActorId?: string;
  instagramActorHandle?: string;
  caption?: string;
  ctaText?: string;
}

export interface InstagramCampaignSummaryKpis {
  totalSpend: number;
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalLeads: number;
  avgCpl: number;
  avgCtr: number;
  activeCampaignsCount: number;
  totalCampaignsCount: number;
  reelsViews?: number;
  storySwipeUps?: number;
}

export interface InstagramCampaignOverviewItem {
  id: string;
  name: string;
  status: MetaCampaignStatus;
  effectiveStatus?: MetaEffectiveStatus;
  objective: string;
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
  placements: InstagramPlacementType[];
  startTime?: string;
  stopTime?: string;
  lastSyncedAt: string;
  adSetsCount?: number;
  creativesCount?: number;
  creativesData?: InstagramCreativeData[];
  adSetsData?: MetaAdSet[];
  integration?: {
    id: string;
    name: string;
    adAccountId: string;
    currency: string;
    timezone?: string;
  };
}
