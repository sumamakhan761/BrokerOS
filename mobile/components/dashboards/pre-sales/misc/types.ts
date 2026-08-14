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

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  coldCalls: number;
  followUps: number;
  siteVisits: number;
  score: number;
}
