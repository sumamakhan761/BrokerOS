import type {
  YouTubeAdFormat,
  YouTubeRetentionProfile,
  YouTubeVideoMetrics,
  YouTubeCampaignItem,
  YouTubeKpiSummary,
} from '@brokeros/types';

export type {
  YouTubeAdFormat,
  YouTubeRetentionProfile,
  YouTubeVideoMetrics,
  YouTubeCampaignItem,
  YouTubeKpiSummary,
};

export interface YouTubeAcquiredLead {
  logId: string;
  googleLeadId: string;
  formId?: string;
  gclid?: string;
  capturedAt: string | Date;
  lead: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    city?: string;
    budget?: number;
    status: string;
    temperature: string;
    createdAt: string | Date;
    assignedUser?: {
      id: string;
      name: string;
    };
  };
}

export interface YouTubeCampaignInspection {
  campaign: YouTubeCampaignItem & {
    formattedCustomerId?: string;
    integration?: {
      id: string;
      name: string;
      customerId: string;
      currency: string;
      timezone?: string;
    };
  };
  retention: YouTubeRetentionProfile;
  acquiredLeads: YouTubeAcquiredLead[];
  totalAcquiredLeads: number;
}
