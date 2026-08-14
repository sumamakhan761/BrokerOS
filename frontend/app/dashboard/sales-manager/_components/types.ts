export interface DashboardData {
  widgets: {
    siteVisitsScheduled: number;
    siteVisitsCompleted: number;
    negotiations: number;
    bookingsGenerated: number;
  };
  pipeline: Record<string, number>;
  teamLeaderboard: {
    id: string;
    name: string;
    image: string | null;
    svCompleted: number;
    bookings: number;
    activeNegotiations: number;
    score: number;
  }[];
  todaySiteVisitList: {
    id: string;
    scheduledDate: string;
    status: string;
    project?: { name: string };
    salesExec?: { name: string; username: string };
    lead?: { id: string; firstName: string; lastName: string; phone: string; temperature: string };
  }[];
  todayFollowUpList: {
    id: string;
    scheduledDate: string;
    status: string;
    user?: { name: string; username: string };
    lead?: { id: string; firstName: string; lastName: string; temperature: string; status: string };
  }[];
  backlogSiteVisitList: any[];
  missedFollowUpBacklog: any[];
}
