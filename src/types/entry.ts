import { todayKey } from '../utils/calendarGrid';

export type EntryType = 'INCOME' | 'EXPENSE';
export type EntryApprovalStatus = 'PENDING' | 'APPROVED';

export type EntrySummary = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  approvalStatus: EntryApprovalStatus;
  createdByUserId: string;
  createdByName: string;
  receiptCount: number;
  duesId: string | null;
};

export type EntryGroupSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export function groupEntriesByDate(
  list: EntrySummary[],
): { date: string; items: EntrySummary[] }[] {
  const groups: { date: string; items: EntrySummary[] }[] = [];
  for (const entry of list) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === entry.occurredOn) {
      lastGroup.items.push(entry);
    } else {
      groups.push({ date: entry.occurredOn, items: [entry] });
    }
  }
  return groups;
}

export type EntryListFilterValue = {
  period: '1month' | '3month' | '6month' | 'custom';
  customStart?: string;
  customEnd?: string;
  ledgerIds: string[];
  type: 'all' | 'income' | 'expense';
  sort: 'latest' | 'oldest';
};

export const DEFAULT_ENTRY_LIST_FILTER: EntryListFilterValue = {
  period: '1month',
  ledgerIds: [],
  type: 'all',
  sort: 'latest',
};

function toIsoDate(dotDate: string): string {
  return dotDate.replace(/\./g, '-');
}

function isoMonthsAgo(months: number): string {
  const now = new Date();
  now.setMonth(now.getMonth() - months);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const FILTER_PERIOD_MONTHS = { '1month': 1, '3month': 3, '6month': 6 } as const;

export function getEntryListFilterDateRange(
  filter: EntryListFilterValue,
): { from?: string; to?: string } {
  if (filter.period === 'custom') {
    return filter.customStart && filter.customEnd
      ? { from: toIsoDate(filter.customStart), to: toIsoDate(filter.customEnd) }
      : {};
  }
  return {
    from: isoMonthsAgo(FILTER_PERIOD_MONTHS[filter.period]),
    to: toIsoDate(todayKey()),
  };
}

export type EntryReceiptFile = {
  id: string;
  url: string;
  name?: string;
};

export type EntryDetail = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: EntryApprovalStatus;
  createdBy: { userId: string; name: string };
  manager: { userId: string; name: string };
  approvedBy: { userId: string; name: string } | null;
  approvedAt: string | null;
  receiptFiles: EntryReceiptFile[];
  duesId: string | null;
  duesTitle: string | null;
  duesExists: boolean;
  payerCount: number;
  payers: { memberId: string; name: string; amount: number }[];
};
