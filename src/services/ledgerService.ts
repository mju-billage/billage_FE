import { request } from './apiClient';
import {
  setLedgersForFolder,
  setLedgerDetail,
} from '../types/ledger';
import type { LedgerSummary, LedgerDetail } from '../types/ledger';

type LedgerListItemResponse = {
  ledgerId: number;
  folderId: number;
  name: string;
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  remainingBudget: number | null;
  entryCount: number;
};

type LedgerDetailResponse = LedgerListItemResponse & {
  folderId: number | null;
  folderName: string | null;
  createdAt: string;
  updatedAt: string;
};

function toLedgerSummary(response: LedgerListItemResponse): LedgerSummary {
  return {
    id: String(response.ledgerId),
    folderId: String(response.folderId),
    name: response.name,
    budget: response.budget,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    remainingBudget: response.remainingBudget,
    entryCount: response.entryCount,
  };
}

function toLedgerDetail(response: LedgerDetailResponse): LedgerDetail {
  return {
    ...toLedgerSummary(response),
    folderId: response.folderId != null ? String(response.folderId) : null,
    folderName: response.folderName,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}

export async function getLedgersInFolder(
  folderId: string,
): Promise<LedgerSummary[]> {
  const response = await request<LedgerListItemResponse[]>(
    `/api/v1/folders/${folderId}/ledgers`,
    { method: 'GET' },
  );
  const ledgers = response.map(toLedgerSummary);
  setLedgersForFolder(folderId, ledgers);
  return ledgers;
}

export async function getLedgerDetail(
  ledgerId: string,
): Promise<LedgerDetail> {
  const response = await request<LedgerDetailResponse>(
    `/api/v1/ledgers/${ledgerId}`,
    { method: 'GET' },
  );
  const detail = toLedgerDetail(response);
  setLedgerDetail(detail);
  return detail;
}

type GroupLedgerListItemResponse = {
  ledgerId: number;
  folderId: number | null;
  folderName: string | null;
  name: string;
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  remainingBudget: number | null;
  budgetUsageRate: number | null;
  entryCount: number;
  createdAt: string;
};

export async function getAllLedgersInGroup(
  groupId: string,
): Promise<LedgerSummary[]> {
  const response = await request<GroupLedgerListItemResponse[]>(
    `/api/v1/groups/${groupId}/ledgers`,
    { method: 'GET' },
  );
  return response.map(item => ({
    id: String(item.ledgerId),
    folderId: item.folderId != null ? String(item.folderId) : null,
    name: item.name,
    budget: item.budget,
    totalIncome: item.totalIncome,
    totalExpense: item.totalExpense,
    balance: item.balance,
    remainingBudget: item.remainingBudget,
    entryCount: item.entryCount,
    createdAt: item.createdAt,
  }));
}

export async function createLedger(
  folderId: string,
  name: string,
  budget: number | null,
): Promise<void> {
  const body: Record<string, unknown> = { name };
  if (budget != null) {
    body.budget = budget;
  }
  await request<void>(`/api/v1/folders/${folderId}/ledgers`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createLedgerInGroup(
  groupId: string,
  input: { name: string; budget: number | null; folderId: string | null },
): Promise<void> {
  const body: Record<string, unknown> = { name: input.name, folderId: null };
  if (input.budget != null) {
    body.budget = input.budget;
  }
  if (input.folderId != null) {
    body.folderId = Number(input.folderId);
  }
  await request<void>(`/api/v1/groups/${groupId}/ledgers`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateLedger(
  ledgerId: string,
  updates: { name: string },
): Promise<void> {
  await request<void>(`/api/v1/ledgers/${ledgerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: updates.name }),
  });
}

export async function updateLedgerBudget(
  ledgerId: string,
  budget: number | null,
): Promise<void> {
  await request<void>(`/api/v1/ledgers/${ledgerId}/budget`, {
    method: 'PATCH',
    body: JSON.stringify({ budget }),
  });
}

export async function deleteLedger(ledgerId: string): Promise<void> {
  await request<void>(`/api/v1/ledgers/${ledgerId}`, { method: 'DELETE' });
}
