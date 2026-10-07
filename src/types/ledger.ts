export type LedgerSummary = {
  id: string;
  folderId: string | null;
  name: string;
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  remainingBudget: number | null;
  entryCount: number;
  createdAt?: string;
};

export type LedgerDetail = LedgerSummary & {
  folderId: string | null;
  folderName: string | null;
  createdAt: string;
  updatedAt: string;
};

let ledgersByFolder: Record<string, LedgerSummary[]> = {};
let ledgerDetailById: Record<string, LedgerDetail> = {};

export function setLedgersForFolder(
  folderId: string,
  ledgers: LedgerSummary[],
): void {
  ledgersByFolder[folderId] = ledgers;
}

export function getCachedLedgersForFolder(folderId: string): LedgerSummary[] {
  return ledgersByFolder[folderId] ?? [];
}

export function setLedgerDetail(detail: LedgerDetail): void {
  ledgerDetailById[detail.id] = detail;
}

export function getCachedLedgerDetail(id: string): LedgerDetail | undefined {
  return ledgerDetailById[id];
}
