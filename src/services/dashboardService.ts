import { request } from './apiClient';

export type CalendarDaySummary = {
  date: string;
  income: number;
  expense: number;
};

type CalendarResponse = {
  yearMonth: string;
  days: CalendarDaySummary[];
};

export async function getMonthlyCalendar(
  groupId: string,
  yearMonth: string,
): Promise<CalendarDaySummary[]> {
  const response = await request<CalendarResponse>(
    `/api/v1/groups/${groupId}/calendar?yearMonth=${yearMonth}`,
    { method: 'GET' },
  );
  return response.days;
}

export type DashboardEntryType = 'INCOME' | 'EXPENSE';
export type DashboardEntryApprovalStatus = 'PENDING' | 'APPROVED';

export type DashboardRecentEntry = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  type: DashboardEntryType;
  title: string;
  amount: number;
  occurredOn: string;
  approvalStatus: DashboardEntryApprovalStatus;
};

export type DashboardDuesSummary = {
  activeDuesCount: number;
  totalTargetCount: number;
  paidCount: number;
  unpaidCount: number;
};

export type UpcomingDues = {
  duesId: string;
  title: string;
  dueDate: string;
  daysLeft: number;
  paidCount: number;
  targetCount: number;
};

export type DashboardOverview = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  ledgerCount: number;
  pendingEntryCount: number;
  dues: DashboardDuesSummary;
  recentEntries: DashboardRecentEntry[];
  hasUnreadNotification: boolean;
  upcomingDues: UpcomingDues[];
};

type CalendarDayResponse = {
  date: string;
  income: number;
  expense: number;
};

type UpcomingDuesResponse = {
  duesId: number;
  title: string;
  dueDate: string;
  daysLeft: number;
  paidCount: number;
  targetCount: number;
};

type DashboardResponse = {
  groupId: number;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    ledgerCount: number;
  };
  approval: { pendingEntryCount: number };
  dues: DashboardDuesSummary;
  recentEntries: {
    entryId: number;
    ledgerId: number;
    ledgerName: string;
    type: DashboardEntryType;
    title: string;
    amount: number;
    occurredOn: string;
    approvalStatus: DashboardEntryApprovalStatus;
  }[];
  calendar: { from: string; to: string; days: CalendarDayResponse[] };
  upcomingDues: UpcomingDuesResponse[];
  hasUnreadNotification: boolean;
};

const DEFAULT_RECENT_ENTRY_SIZE = 5;
const MIN_RECENT_ENTRY_SIZE = 1;
const MAX_RECENT_ENTRY_SIZE = 20;

export async function getDashboard(
  groupId: string,
  recentEntrySize: number = DEFAULT_RECENT_ENTRY_SIZE,
): Promise<DashboardOverview> {
  const size = Math.min(
    Math.max(Math.round(recentEntrySize), MIN_RECENT_ENTRY_SIZE),
    MAX_RECENT_ENTRY_SIZE,
  );
  const response = await request<DashboardResponse>(
    `/api/v1/groups/${groupId}/dashboard?recentEntrySize=${size}`,
    { method: 'GET' },
  );
  return {
    totalIncome: response.summary.totalIncome,
    totalExpense: response.summary.totalExpense,
    balance: response.summary.balance,
    ledgerCount: response.summary.ledgerCount,
    pendingEntryCount: response.approval.pendingEntryCount,
    dues: response.dues,
    hasUnreadNotification: response.hasUnreadNotification,
    upcomingDues: response.upcomingDues.map(dues => ({
      duesId: String(dues.duesId),
      title: dues.title,
      dueDate: dues.dueDate,
      daysLeft: dues.daysLeft,
      paidCount: dues.paidCount,
      targetCount: dues.targetCount,
    })),
    recentEntries: response.recentEntries.map(entry => ({
      id: String(entry.entryId),
      ledgerId: String(entry.ledgerId),
      ledgerName: entry.ledgerName,
      type: entry.type,
      title: entry.title,
      amount: entry.amount,
      occurredOn: entry.occurredOn,
      approvalStatus: entry.approvalStatus,
    })),
  };
}
