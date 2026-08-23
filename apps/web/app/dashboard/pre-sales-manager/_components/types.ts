export interface DashboardData {
  widgets: {
    totalLeads: number;
    newLeads: number;
    activeLeads: number;
    lostLeads: number;
    todayFollowUps: number;
    missedFollowUps: number;
    siteVisitsScheduled: number;
    conversionRate: number;
  };
  pipeline: Record<string, number>;
  backlogs: Array<{
    id: string;
    name: string;
    missedFollowUps: number;
    untouchedLeads: number;
  }>;
  todayFollowUpList: Array<{
    id: string;
    scheduledDate: string;
    status: string;
    user?: {
      id: string;
      name: string;
      username: string;
    };
    lead: {
      id: string;
      firstName: string;
      lastName?: string;
      temperature?: string;
      status: string;
    } | null;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image?: string;
  coldCalls: number;
  followUps: number;
  siteVisits: number;
  score: number;
}

export interface Employee {
  id: string;
  name?: string;
  username?: string;
  image?: string;
  employeeCode?: string;
  isOnCall?: boolean;
  stats: {
    totalLeads: number;
    contactedLeads: number;
    followUpsDone: number;
    siteVisits: number;
  };
}

export interface ManagerTask {
  id: string;
  coldCallTarget: number;
  isActive: boolean;
  createdAt: string;
  assignees: Array<{ userId: string; user: { id: string; name?: string; username?: string }; backlogOverride?: number }>;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeDashboardData {
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
    coldCall: { target: number; done: number; backlog: number; taskId?: string; taskUserId?: string; };
    followUp: { target: number; done: number; backlog: number; };
  };
  backlogs: {
    coldCallBacklogCount: number;
    missedFollowUps: Array<{
      id: string;
      scheduledDate: string;
      lead: {
        id: string;
        firstName: string;
        lastName?: string;
        temperature?: string;
        status: string;
      } | null;
    }>;
  };
  todayFollowUpList: Array<{
    id: string;
    scheduledDate: string;
    status: string;
    lead: {
      id: string;
      firstName: string;
      lastName?: string;
      temperature?: string;
      status: string;
    } | null;
  }>;
}
