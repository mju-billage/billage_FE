export type DuesStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED';
export type PaymentStatus = 'UNPAID' | 'PAID';

export type DuesSummary = {
  id: string;
  title: string;
  amount: number;
  startDate: string;
  dueDate: string;
  status: DuesStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  ledgerId: string;
  ledgerName: string;
};

export type DuesDetail = {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  startDate: string;
  dueDate: string;
  status: DuesStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  expectedTotalAmount: number;
  ledger: { id: string; name: string };
  createdAt: string;
  closedAt: string | null;
  generatedEntryId: string | null;
};

export type DuesMember = {
  memberId: string;
  name: string;
  status: PaymentStatus;
  paidAt: string | null;
};
