import { request } from './apiClient';
import type { Receipt } from '../types/receipt';
import type { EntryType } from '../types/entry';

type ReceiptItemResponse = {
  fileId: number;
  fileUrl: string;
  entryId: number;
  entryTitle: string;
  occurredOn: string;
  ledgerId: number;
  ledgerName: string;
};

type ReceiptListResponse = {
  content: ReceiptItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

function toReceipt(response: ReceiptItemResponse): Receipt {
  return {
    fileId: String(response.fileId),
    fileUrl: response.fileUrl,
    entryId: String(response.entryId),
    entryTitle: response.entryTitle,
    occurredOn: response.occurredOn,
    ledgerId: String(response.ledgerId),
    ledgerName: response.ledgerName,
  };
}

export type ReceiptListParams = {
  ledgerIds?: string[];
  type?: EntryType;
  from?: string;
  to?: string;
  keyword?: string;
  page?: number;
  size?: number;
};

export type ReceiptListPage = {
  items: Receipt[];
  page: number;
  totalPages: number;
  last: boolean;
};

export async function getReceipts(
  groupId: string,
  params: ReceiptListParams = {},
): Promise<ReceiptListPage> {
  const query = new URLSearchParams();
  for (const ledgerId of params.ledgerIds ?? []) {
    query.append('ledgerIds', ledgerId);
  }
  if (params.type) {
    query.set('type', params.type);
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

  const response = await request<ReceiptListResponse>(
    `/api/v1/groups/${groupId}/receipts?${query.toString()}`,
    { method: 'GET' },
  );
  return {
    items: response.content.map(toReceipt),
    page: response.page,
    totalPages: response.totalPages,
    last: response.last,
  };
}
