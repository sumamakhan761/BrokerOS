// ============================================================================
// BrokerOS — YouTube Video Ads Types & Interfaces
// ============================================================================

export type YouTubeAdFormat =
  | 'IN_STREAM_SKIPPABLE'
  | 'IN_FEED_VIDEO'
  | 'SHORTS'
  | 'BUMPER'
  | 'DEMAND_GEN';

export interface YouTubeRetentionProfile {
  quartile25: number; // e.g. 68.5%
  quartile50: number; // e.g. 45.2%
  quartile75: number; // e.g. 31.0%
  quartile100: number; // e.g. 19.4%
}

export interface YouTubeVideoMetrics {
  views: number;
  viewRate: number; // Percentage (e.g. 32.4%)
  cpv: number; // Average Cost Per View in account currency (e.g. 0.45)
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  costPerLead: number;
  retention: YouTubeRetentionProfile;
  videoId?: string;
  videoTitle?: string;
  thumbnailUrl?: string;
}

export interface YouTubeCampaignItem {
  id: string;
  name: string;
  format: YouTubeAdFormat;
  status: string; // 'ENABLED' | 'PAUSED' | 'REMOVED'
  dailyBudget?: number;
  spend: number;
  views: number;
  impressions: number;
  viewRate: number;
  cpv: number;
  leads: number;
  costPerLead: number;
  retention: YouTubeRetentionProfile;
  videoId?: string;
  videoTitle?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  startTime?: string;
  stopTime?: string;
}

export interface YouTubeKpiSummary {
  totalSpend: number;
  totalViews: number;
  totalImpressions: number;
  avgCpv: number;
  avgViewRate: number;
  totalLeads: number;
  avgCostPerLead: number;
  avgQuartile100Rate: number;
  activeCampaignsCount: number;
  totalCampaignsCount: number;
}
