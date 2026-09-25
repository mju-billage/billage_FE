import { request } from './apiClient';
import type {
  ArchiveDetail,
  ArchivedEntry,
  ArchivedLedger,
  ArchiveSummary,
} from '../types/archive';

type ArchiveSummaryResponse = {
  archiveId: number;
  title: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  ledgerCount: number;
  entryCount: number;
  createdAt: string;
};

function toArchiveSummary(response: ArchiveSummaryResponse): ArchiveSummary {
  return {
    archiveId: String(response.archiveId),
    title: response.title,
    startDate: response.startDate,
    endDate: response.endDate,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    ledgerCount: response.ledgerCount,
    entryCount: response.entryCount,
    createdAt: response.createdAt,
  };
}

export async function createArchive(
  groupId: string,
  title: string,
): Promise<ArchiveSummary> {
  const response = await request<ArchiveSummaryResponse>(
    `/api/v1/groups/${groupId}/archives`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    },
  );
  return toArchiveSummary(response);
}

export async function getArchives(groupId: string): Promise<ArchiveSummary[]> {
  const response = await request<ArchiveSummaryResponse[]>(
    `/api/v1/groups/${groupId}/archives`,
    { method: 'GET' },
  );
  return response.map(toArchiveSummary);
}

type ArchivedEntryResponse = {
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: 'PENDING' | 'APPROVED';
  createdByName: string;
  receiptFiles: { fileId: number; fileName: string; fileUrl: string }[];
};

type ArchivedLedgerResponse = {
  folderName: string;
  ledgerName: string;
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entries: ArchivedEntryResponse[];
};

type ArchiveDetailResponse = {
  archiveId: number;
  groupId: number;
  title: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entryCount: number;
  ledgers: ArchivedLedgerResponse[];
  createdAt: string;
};

function toArchivedEntry(response: ArchivedEntryResponse): ArchivedEntry {
  return {
    ...response,
    receiptFiles: response.receiptFiles.map(file => ({
      ...file,
      fileId: String(file.fileId),
    })),
  };
}

function toArchivedLedger(response: ArchivedLedgerResponse): ArchivedLedger {
  return {
    folderName: response.folderName,
    name: response.ledgerName,
    budget: response.budget,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    entries: response.entries.map(toArchivedEntry),
  };
}

export async function getArchiveDetail(archiveId: string): Promise<ArchiveDetail> {
  const response = await request<ArchiveDetailResponse>(
    `/api/v1/archives/${archiveId}`,
    { method: 'GET' },
  );
  return {
    archiveId: String(response.archiveId),
    groupId: String(response.groupId),
    title: response.title,
    startDate: response.startDate,
    endDate: response.endDate,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    entryCount: response.entryCount,
    ledgers: response.ledgers.map(toArchivedLedger),
    createdAt: response.createdAt,
  };
}

export async function updateArchiveTitle(
  archiveId: string,
  title: string,
): Promise<void> {
  await request<void>(`/api/v1/archives/${archiveId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function deleteArchive(archiveId: string): Promise<void> {
  await request<void>(`/api/v1/archives/${archiveId}`, { method: 'DELETE' });
}
