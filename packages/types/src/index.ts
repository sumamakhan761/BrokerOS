/**
 * @brokeros/types
 * 
 * Shared TypeScript interfaces and types for BrokerOS.
 * Extracted from apps/web and apps/mobile.
 */

// ─── Lead Types ───────────────────────────────────────────────────────────────

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  score: number;
  createdAt: string;
};

export interface LeadProfileData {
  id: string;
  createdAt?: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  subStatus?: string;
  temperature?: string;
  score?: number;
  avatar?: string;
  processionStatus?: string;
  processionTimeline?: {
    value: number;
    unit: string;
  };
  aiNextStepSuggestion?: string;
  source?: { id?: string; name: string };
  sourceId?: string;
  assignedUser?: { name?: string; username: string };
  salesExecutive?: { name?: string; username: string };
  budget?: number;
  interestedProject?: { id?: string; name: string };
  interestedProjectId?: string;
  preferredLocation?: string;
  requirements?: string;
  broker?: { name: string; companyName?: string };
  lastContactDate?: string;
  nextFollowUpDate?: string;
  siteVisits?: Array<{
    id: string;
    project?: { name: string };
    scheduledDate: string;
    meetingNotes?: string;
    destinationUrl?: string;
    arrivedAt?: string;
    arriveLatitude?: number;
    arriveLongitude?: number;
    completedAt?: string;
    status?: string;
  }>;
  followUps?: Array<{
    id: string;
    type: string;
    scheduledDate: string;
    remarks?: string;
    status?: string;
  }>;
  notes?: Array<{
    id: string;
    user?: { displayUsername?: string; username?: string };
    createdAt: string;
    content: string;
  }>;
  callRecords?: Array<{
    id: string;
    recordingUrl?: string;
    startedAt: string;
    aiSummary?: string;
    aiTranscript?: string;
  }>;
  customer?: {
    bookings?: Array<{
      id: string;
      createdAt: string;
      status: string;
      unit?: { unitNumber: string };
    }>;
  };
}

// ─── Site Visit Types ─────────────────────────────────────────────────────────

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

// ─── Booking Types ────────────────────────────────────────────────────────────

export interface BookingDocument {
  type: string;
  fileUrl: string;
  title: string;
}

export interface BookingData {
  id: string;
  unitDescription?: string;
  agreedPrice?: number;
  bookingAmount?: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  paymentMode?: string;
  transactionRef?: string;
  loanRequired?: boolean;
  remarks?: string;
  documents: BookingDocument[];
  status: string;
  createdAt: string;
}

// ─── Inventory Types (Unit/Floor/Tower) ───────────────────────────────────────

export interface Unit {
  id?: string;
  unitNumber: string;
  type: string;
  status: string;
  basePrice?: number;
  carpetArea?: number;
  facing?: string;
  [key: string]: any;
}

export interface Floor {
  id?: string;
  floorNumber: number;
  name: string;
  units: Unit[];
}

export interface Tower {
  id?: string;
  name: string;
  floors: Floor[];
}

// ─── Negotiation Types ────────────────────────────────────────────────────────

export interface NegotiationNote {
  id: string;
  content: string;
  noteType: string;
  statusAtTimeOfNote: string;
  createdAt: string;
  user?: { username: string; displayUsername?: string };
}

export interface NegotiationFormData {
  title: string;
  askingPrice: string;
  offeredPrice: string;
  objections: string;
  strategy: string;
  nextStep: string;
}

// ─── Dashboard & Misc Types ───────────────────────────────────────────────────

export interface DashboardData {
  widgets: {
    newLeads: number;
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
    todayFollowUps: number;
    missedFollowUps: number;
    siteVisitsScheduled: number;
    bookingsGenerated: number;
  };
  pipeline: Record<string, number>;
  dailyTasks: {
    coldCall: { target: number; done: number; backlog: number };
    followUp: { target: number; done: number; backlog: number };
  };
  backlogs: {
    coldCallBacklogCount: number;
    missedFollowUps: Array<{
      id: string;
      scheduledDate: string;
      lead: { id: string; firstName: string; lastName?: string; temperature?: string; status: string } | null;
    }>;
  };
  todayFollowUpList: Array<{
    id: string;
    scheduledDate: string;
    status: string;
    lead: { id: string; firstName: string; lastName?: string; temperature?: string; status: string } | null;
  }>;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}
