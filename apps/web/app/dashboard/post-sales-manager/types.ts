export interface LeadListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  subStatus?: string;
  avatar?: string;
}

export interface PostSalesFollowUp {
  id: string;
  scheduledDate: string;
  status: string;
  lead: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    temperature: string;
    status: string;
    avatar?: string;
  };
}

export interface PostSalesDashboardData {
  widgets: {
    totalBooked: number;
    documentsPending: number;
    loanCases: number;
    agreementPending: number;
    possessionPending: number;
    handoverCompleted: number;
  };
  documentsList: LeadListItem[];
  loanList: LeadListItem[];
  agreementList: LeadListItem[];
  possessionList: LeadListItem[];
  todayFollowUpList: PostSalesFollowUp[];
}
