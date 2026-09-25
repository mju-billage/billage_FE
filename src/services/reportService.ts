import { request } from './apiClient';
import type {
  Report,
  ReportDetail,
  ReportEntryType,
  ReportSummaryItem,
  ReportType,
} from '../types/report';

type ReportResponse = {
  reportId: number;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    entryCount: number;
    openingBalance: number | null;
    closingBalance: number | null;
  };
  ledgers: {
    ledgerId: number;
    ledgerName: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }[];
  createdAt: string;
};

type ReportListItemResponse = {
  reportId: number;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  ledgerCount: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  createdAt: string;
};

type ReportListResponse = {
  content: ReportListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

function toReport(response: ReportResponse): Report {
  return {
    reportId: String(response.reportId),
    title: response.title,
    reportType: response.reportType,
    startDate: response.startDate,
    endDate: response.endDate,
    summary: response.summary,
    ledgers: response.ledgers.map(ledger => ({
      ledgerId: String(ledger.ledgerId),
      ledgerName: ledger.ledgerName,
      totalIncome: ledger.totalIncome,
      totalExpense: ledger.totalExpense,
      balance: ledger.balance,
    })),
    createdAt: response.createdAt,
  };
}

function toReportSummaryItem(response: ReportListItemResponse): ReportSummaryItem {
  return {
    reportId: String(response.reportId),
    title: response.title,
    reportType: response.reportType,
    startDate: response.startDate,
    endDate: response.endDate,
    ledgerCount: response.ledgerCount,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    createdAt: response.createdAt,
  };
}

function withEntryType(
  body: Record<string, unknown>,
  entryType: ReportEntryType | undefined,
): Record<string, unknown> {
  if (entryType) {
    return { ...body, entryType };
  }
  return body;
}

export type CreateReportByLedgerInput = {
  title: string;
  ledgerIds: string[];
  entryType?: ReportEntryType;
};

export async function createReportByLedger(
  groupId: string,
  input: CreateReportByLedgerInput,
): Promise<Report> {
  const response = await request<ReportResponse>(`/api/v1/groups/${groupId}/reports`, {
    method: 'POST',
    body: JSON.stringify(
      withEntryType(
        {
          reportType: 'BY_LEDGER',
          title: input.title,
          ledgerIds: input.ledgerIds.map(Number),
        },
        input.entryType,
      ),
    ),
  });
  return toReport(response);
}

export type CreateReportByPeriodInput = {
  title: string;
  startDate: string;
  endDate: string;
  entryType?: ReportEntryType;
};

export async function createReportByPeriod(
  groupId: string,
  input: CreateReportByPeriodInput,
): Promise<Report> {
  const response = await request<ReportResponse>(`/api/v1/groups/${groupId}/reports`, {
    method: 'POST',
    body: JSON.stringify(
      withEntryType(
        {
          reportType: 'BY_PERIOD',
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate,
        },
        input.entryType,
      ),
    ),
  });
  return toReport(response);
}

export type ReportListParams = {
  reportType?: ReportType;
  page?: number;
  size?: number;
};

export type ReportListPage = {
  items: ReportSummaryItem[];
  page: number;
  totalPages: number;
  last: boolean;
};

export async function getReports(
  groupId: string,
  params: ReportListParams = {},
): Promise<ReportListPage> {
  const query = new URLSearchParams();
  if (params.reportType) {
    query.set('reportType', params.reportType);
  }
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));

  const response = await request<ReportListResponse>(
    `/api/v1/groups/${groupId}/reports?${query.toString()}`,
    { method: 'GET' },
  );
  return {
    items: response.content.map(toReportSummaryItem),
    page: response.page,
    totalPages: response.totalPages,
    last: response.last,
  };
}

type ReportEntrySnapshotResponse = {
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
};

type ReportLedgerDetailResponse = {
  ledgerName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entries: ReportEntrySnapshotResponse[];
};

type ReportDetailResponse = {
  reportId: number;
  groupId: number;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    entryCount: number;
    openingBalance: number | null;
    closingBalance: number | null;
  };
  ledgers: ReportLedgerDetailResponse[];
  createdAt: string;
};

export async function getReportDetail(reportId: string): Promise<ReportDetail> {
  const response = await request<ReportDetailResponse>(`/api/v1/reports/${reportId}`, {
    method: 'GET',
  });
  return {
    reportId: String(response.reportId),
    groupId: String(response.groupId),
    title: response.title,
    reportType: response.reportType,
    startDate: response.startDate,
    endDate: response.endDate,
    summary: response.summary,
    ledgers: response.ledgers.map(ledger => ({
      ledgerName: ledger.ledgerName,
      totalIncome: ledger.totalIncome,
      totalExpense: ledger.totalExpense,
      balance: ledger.balance,
      entries: ledger.entries.map(entry => ({
        type: entry.type,
        title: entry.title,
        amount: entry.amount,
        occurredOn: entry.occurredOn,
      })),
    })),
    createdAt: response.createdAt,
  };
}
