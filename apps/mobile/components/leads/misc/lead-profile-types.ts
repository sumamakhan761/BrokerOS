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
