import { request } from './apiClient';
import type {
  EntryApprovalStatus,
  EntryDetail,
  EntryReceiptFile,
  EntrySummary,
  EntryType,
} from '../types/entry';

type EntryListItemResponse = {
  entryId: number;
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  approvalStatus: EntryApprovalStatus;
  createdByUserId: number;
  createdByName: string;
  receiptCount: number;
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
  approvedBy: { userId: number; name: string } | null;
  approvedAt: string | null;
  receiptFiles: ReceiptFileResponse[];
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
    type: response.type,
    title: response.title,
    amount: response.amount,
    occurredOn: response.occurredOn,
    approvalStatus: response.approvalStatus,
    createdByUserId: String(response.createdByUserId),
    createdByName: response.createdByName,
    receiptCount: response.receiptCount,
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
    approvedBy: response.approvedBy
      ? { userId: String(response.approvedBy.userId), name: response.approvedBy.name }
      : null,
    approvedAt: response.approvedAt,
    receiptFiles: response.receiptFiles.map(toReceiptFile),
  };
}

export type EntryListParams = {
  type?: EntryType;
  status?: EntryApprovalStatus;
  keyword?: string;
  page?: number;
  size?: number;
  /** 예: 'occurredOn,desc'. 기본 정렬은 서버 기본값(occurredOn,desc + id,desc)을 쓴다. */
  sort?: string;
};

export type EntryListPage = {
  items: EntrySummary[];
  page: number;
  totalPages: number;
  last: boolean;
};

/**
 * 장부의 내역 목록을 조회한다(페이지네이션). 화면이 페이지 배열을 직접 들고
 * 있다가 다음 페이지를 이어 붙인다 — 서비스는 캐시하지 않는다(types/entry.ts 참고).
 */
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
    last: response.last,
  };
}

/** 내역 상세를 조회한다. */
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
  /** 'YYYY-MM-DD'. */
  occurredOn: string;
  memo?: string;
};

export type CreatedEntry = {
  id: string;
  approvalStatus: EntryApprovalStatus;
};

/**
 * 내역을 등록한다. 승인 상태는 서버가 결정한다(요청에 넣는 필드가 아니다) —
 * 등록자가 총무(OWNER)면 즉시 APPROVED, 일반 관리자(MEMBER)면 PENDING으로
 * 생성된다(Entry.txt 정책 메모, "기획 글로벌 정책"). 화면은 반환된
 * `approvalStatus`로 안내 문구만 갈라 보여주면 된다 — 직접 정할 수 없다.
 *
 * `receiptFileIds`를 안 받는다 — 이 라운드엔 실제 카메라·갤러리 접근이 없어
 * (docs/api-gaps.md 참고) 실제로 업로드된 파일이 없다. 생기면 이 함수에 추가한다.
 */
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

  const response = await request<EntryCreateResponse>(
    `/api/v1/ledgers/${ledgerId}/entries`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  return { id: String(response.entryId), approvalStatus: response.approvalStatus };
}

export type UpdateEntryInput = {
  title?: string;
  amount?: number;
  /** 'YYYY-MM-DD'. */
  occurredOn?: string;
  memo?: string;
  /**
   * ⚠️ 전달하면 증빙 전체 교체다 — 목록에서 빠진 파일은 저장소에서도 삭제된다.
   * 이 키 자체를 객체에 넣지 않아야 기존 증빙이 그대로 유지된다(Entry.txt "4. 내역
   * 수정" 정책 메모). 호출자가 실제로 증빙을 바꿨을 때만 넣어라 — 습관적으로
   * 항상 채워 보내면 안 건드린 증빙까지 조용히 삭제된다.
   */
  receiptFileIds?: number[];
};

/** 내역을 수정한다(전달한 필드만 반영). 총무(OWNER) 전용. */
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
  if (updates.receiptFileIds !== undefined) {
    body.receiptFileIds = updates.receiptFileIds;
  }
  await request<void>(`/api/v1/entries/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** 내역을 삭제한다(증빙 파일도 함께 삭제). 총무(OWNER) 전용. */
export async function deleteEntry(entryId: string): Promise<void> {
  await request<void>(`/api/v1/entries/${entryId}`, { method: 'DELETE' });
}

export type ApprovedEntry = {
  id: string;
  approvalStatus: EntryApprovalStatus;
  approvedByUserId: string;
  approvedAt: string;
};

/** 승인 대기 내역을 승인한다. 총무(OWNER) 전용. 이미 승인된 내역이면 409. */
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
