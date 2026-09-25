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
  /** 다중 선택, 비우면 모임의 모든 장부(Entry 7번 `groupEntries`와 같은 규칙). */
  ledgerIds?: string[];
  type?: EntryType;
  /** 발생일 기간 'YYYY-MM-DD'. */
  from?: string;
  to?: string;
  /** 내역명·메모 검색, 최대 20자(File.txt). */
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

/**
 * 증빙자료 앨범 목록을 조회한다(MEMBER 권한, Entry 모임 전체 목록과 같은 필터
 * 규칙). 주의점 두 가지:
 *
 * - 장부 필터는 `ledgerIds`(복수)여야 한다 — `ledgerId`(단수)는 에러 없이
 *   조용히 무시된다.
 * - **`sort` 쿼리 파라미터를 절대 보내지 마라.** 값과 무관하게(`occurredOn,desc`
 *   처럼 기본값과 같은 값이어도) `500 INTERNAL_ERROR`를 낸다. 서버가 이미
 *   발생일 내림차순으로 고정 정렬해 내려주므로(File.txt) 정렬 옵션 자체가
 *   필요 없다 — 이 함수에 `sort` 파라미터가 없는 이유다.
 */
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
