export interface SiteVisit {
  id: string;
  scheduledDate: string;
  completedAt?: string | null;
  status: string;
  interestLevel?: string | null;
  budgetConfirmed?: number | null;
  configInterest?: string | null;
  customerReaction?: string | null;
  customerObjections?: string | null;
  closingProbability?: string | null;
  meetingNotes?: string | null;
  nextAction?: string | null;
  project?: { name: string };
}

export interface SiteVisitCompleteModalData {
  interestLevel: string;
  budgetConfirmed: string;
  configInterest: string;
  customerReaction: string;
  customerObjections: string;
  closingProbability: string;
  meetingNotes: string;
  nextAction: string;
}

export const INTEREST_LEVEL_COLORS: Record<string, string> = {
  HIGH: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-orange-100 text-orange-700',
  NOT_INTERESTED: 'bg-red-100 text-red-700',
};

export const REACTION_LABELS: Record<string, string> = {
  VERY_POSITIVE: 'Very Positive',
  POSITIVE: 'Positive',
  NEUTRAL: 'Neutral',
  NEGATIVE: 'Negative',
};

export const PROBABILITY_LABELS: Record<string, string> = {
  VERY_HIGH: 'Very High',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};
