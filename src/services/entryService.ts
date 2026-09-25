import { request } from './apiClient';
import type {
  EntryApprovalStatus,
  EntryDetail,
  EntryGroupSummary,
  EntryReceiptFile,
  EntrySummary,
  EntryType,
} from '../types/entry';

type EntryListItemResponse = {
  entryId: number;
  ledgerId?: number;
  ledgerName?: string;
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  approvalStatus: EntryApprovalStatus;
  createdByUserId: number;
  createdByName: string;
  receiptCount: number;
  duesId?: number | null;
};

type EntryListResponse = {
  content: EntryListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type GroupEntryListResponse = {
  summary: EntryGroupSummary;
  entries: EntryListResponse;
};

type ReceiptFileResponse = {
  fileId: number;
  fileName?: string;
  fileUrl: string;
};

type EntryDetailResponse = {
  entryId: number;
  ledgerId: number;
  ledgerName: string;
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: EntryApprovalStatus;
  createdBy: { userId: number; name: string };
  manager: { userId: number; name: string };
  approvedBy: { userId: number; name: string } | null;
  approvedAt: string | null;
  receiptFiles: ReceiptFileResponse[];
  duesId: number | null;
  duesTitle: string | null;
  duesExists: boolean;
  payerCount: number;
  payers: { memberId: number; name: string; amount: number }[];
};

type EntryCreateResponse = {
  entryId: number;
  ledgerId: number;
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: EntryApprovalStatus;
  receiptFiles: ReceiptFileResponse[];
  createdAt: string;
};

type EntryApproveResponse = {
  entryId: number;
  approvalStatus: EntryApprovalStatus;
  approvedByUserId: number;
  approvedAt: string;
};

function toReceiptFile(response: ReceiptFileResponse): EntryReceiptFile {
  return { id: String(response.fileId), url: response.fileUrl, name: response.fileName };
}

function toEntrySummary(response: EntryListItemResponse): EntrySummary {
  return {
    id: String(response.entryId),
    ledgerId: response.ledgerId != null ? String(response.ledgerId) : '',
    ledgerName: response.ledgerName ?? '',
    type: response.type,
    title: response.title,
    amount: response.amount,
    occurredOn: response.occurredOn,
    approvalStatus: response.approvalStatus,
    createdByUserId: String(response.createdByUserId),
    createdByName: response.createdByName,
    receiptCount: response.receiptCount,
    duesId: response.duesId != null ? String(response.duesId) : null,
  };
}

function toEntryDetail(response: EntryDetailResponse): EntryDetail {
  return {
    id: String(response.entryId),
    ledgerId: String(response.ledgerId),
    ledgerName: response.ledgerName,
    type: response.type,
    title: response.title,
    amount: response.amount,
    occurredOn: response.occurredOn,
    memo: response.memo,
    approvalStatus: response.approvalStatus,
    createdBy: {
      userId: String(response.createdBy.userId),
      name: response.createdBy.name,
    },
    manager: {
      userId: String(response.manager.userId),
      name: response.manager.name,
    },
    approvedBy: response.approvedBy
      ? { userId: String(response.approvedBy.userId), name: response.approvedBy.name }
      : null,
    approvedAt: response.approvedAt,
    receiptFiles: response.receiptFiles.map(toReceiptFile),
    duesId: response.duesId != null ? String(response.duesId) : null,
    duesTitle: response.duesTitle,
    duesExists: response.duesExists,
    payerCount: response.payerCount,
    payers: response.payers.map(payer => ({
      memberId: String(payer.memberId),
      name: payer.name,
      amount: payer.amount,
    })),
  };
}

export type EntryListParams = {
  type?: EntryType;
  status?: EntryApprovalStatus;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type EntryListPage = {
  items: EntrySummary[];
  page: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
};

export async function getEntries(
  ledgerId: string,
  params: EntryListParams = {},
): Promise<EntryListPage> {
  const query = new URLSearchParams();
  if (params.type) {
    query.set('type', params.type);
  }
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.keyword) {
    query.set('keyword', params.keyword);
  }
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));
  if (params.sort) {
    query.set('sort', params.sort);
  }

  const response = await request<EntryListResponse>(
    `/api/v1/ledgers/${ledgerId}/entries?${query.toString()}`,
    { method: 'GET' },
  );
  return {
    items: response.content.map(toEntrySummary),
    page: response.page,
    totalPages: response.totalPages,
    totalElements: response.totalElements,
    last: response.last,
  };
}

export type GroupEntryListParams = {
  ledgerIds?: string[];
  type?: EntryType;
  status?: EntryApprovalStatus;
  from?: string;
  to?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type GroupEntryPage = {
  summary: EntryGroupSummary;
  items: EntrySummary[];
  page: number;
  totalPages: number;
  last: boolean;
};

export async function getGroupEntries(
  groupId: string,
  params: GroupEntryListParams = {},
): Promise<GroupEntryPage> {
  const query = new URLSearchParams();
  for (const ledgerId of params.ledgerIds ?? []) {
    query.append('ledgerIds', ledgerId);
  }
  if (params.type) {
    query.set('type', params.type);
  }
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.from) {
    query.set('from', params.from);
  }
  if (params.to) {
    query.set('to', params.to);
  }
  if (params.keyword) {
    query.set('keyword', params.keyword);
  }
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));
  if (params.sort) {
    query.set('sort', params.sort);
  }

  const response = await request<GroupEntryListResponse>(
    `/api/v1/groups/${groupId}/entries?${query.toString()}`,
    { method: 'GET' },
  );
  return {
    summary: response.summary,
    items: response.entries.content.map(toEntrySummary),
    page: response.entries.page,
    totalPages: response.entries.totalPages,
    last: response.entries.last,
  };
}

export async function getEntryDetail(entryId: string): Promise<EntryDetail> {
  const response = await request<EntryDetailResponse>(`/api/v1/entries/${entryId}`, {
    method: 'GET',
  });
  return toEntryDetail(response);
}

export type CreateEntryInput = {
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  memo?: string;
  managerUserId?: string;
  receiptFileIds?: number[];
};

export type CreatedEntry = {
  id: string;
  approvalStatus: EntryApprovalStatus;
};

export async function createEntry(
  ledgerId: string,
  input: CreateEntryInput,
): Promise<CreatedEntry> {
  const body: Record<string, unknown> = {
    type: input.type,
    title: input.title,
    amount: input.amount,
    occurredOn: input.occurredOn,
  };
  if (input.memo) {
    body.memo = input.memo;
  }
  if (input.managerUserId) {
    body.managerUserId = Number(input.managerUserId);
  }
  if (input.receiptFileIds && input.receiptFileIds.length > 0) {
    body.receiptFileIds = input.receiptFileIds;
  }

  const response = await request<EntryCreateResponse>(
    `/api/v1/ledgers/${ledgerId}/entries`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  return { id: String(response.entryId), approvalStatus: response.approvalStatus };
}

export type UpdateEntryInput = {
  title?: string;
  amount?: number;
  occurredOn?: string;
  memo?: string;
  managerUserId?: string;
  receiptFileIds?: number[];
};

export async function updateEntry(
  entryId: string,
  updates: UpdateEntryInput,
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (updates.title !== undefined) {
    body.title = updates.title;
  }
  if (updates.amount !== undefined) {
    body.amount = updates.amount;
  }
  if (updates.occurredOn !== undefined) {
    body.occurredOn = updates.occurredOn;
  }
  if (updates.memo !== undefined) {
    body.memo = updates.memo;
  }
  if (updates.managerUserId !== undefined) {
    body.managerUserId = Number(updates.managerUserId);
  }
  if (updates.receiptFileIds !== undefined) {
    body.receiptFileIds = updates.receiptFileIds;
  }
  await request<void>(`/api/v1/entries/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteEntry(entryId: string): Promise<void> {
  await request<void>(`/api/v1/entries/${entryId}`, { method: 'DELETE' });
}

export type ApprovedEntry = {
  id: string;
  approvalStatus: EntryApprovalStatus;
  approvedByUserId: string;
  approvedAt: string;
};

export async function approveEntry(entryId: string): Promise<ApprovedEntry> {
  const response = await request<EntryApproveResponse>(
    `/api/v1/entries/${entryId}/approve`,
    { method: 'POST' },
  );
  return {
    id: String(response.entryId),
    approvalStatus: response.approvalStatus,
    approvedByUserId: String(response.approvedByUserId),
    approvedAt: response.approvedAt,
  };
}
