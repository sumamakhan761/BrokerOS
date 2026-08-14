export interface DashboardData {
  widgets: {
    siteVisitsScheduled: number;
    todaySiteVisitsDone: number;
    siteVisitsCompleted: number;
    negotiations: number;
    bookingsGenerated: number;
  };
  dailyTasks: {
    followUp: { target: number; done: number; backlog: number };
    siteVisits: { target: number; done: number; backlog: number };
  };
  todaySiteVisitList: any[];
  backlogSiteVisitList: any[];
  todayFollowUpList: any[];
  missedFollowUpBacklog: any[];
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  image?: string | null;
  employeeCode?: string;
  siteVisits: number;
  bookings: number;
  score: number;
  rank: number;
}
