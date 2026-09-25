export type ReportType = 'BY_LEDGER' | 'BY_PERIOD';

export type ReportEntryType = 'INCOME' | 'EXPENSE';

export type ReportSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entryCount: number;
  openingBalance: number | null;
  closingBalance: number | null;
};

export type ReportLedgerBreakdown = {
  ledgerId: string;
  ledgerName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export type Report = {
  reportId: string;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  summary: ReportSummary;
  ledgers: ReportLedgerBreakdown[];
  createdAt: string;
};

export type ReportEntrySnapshot = {
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
};

export type ReportLedgerDetail = {
  ledgerName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entries: ReportEntrySnapshot[];
};

export type ReportDetail = {
  reportId: string;
  groupId: string;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  summary: ReportSummary;
  ledgers: ReportLedgerDetail[];
  createdAt: string;
};

export type ReportSummaryItem = {
  reportId: string;
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
