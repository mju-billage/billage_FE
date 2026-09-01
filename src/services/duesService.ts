import { request } from './apiClient';
import type {
  DuesDetail,
  DuesMember,
  DuesStatus,
  DuesSummary,
  PaymentStatus,
} from '../types/dues';

type DuesListItemResponse = {
  duesId: number;
  title: string;
  amount: number;
  dueDate: string;
  status: DuesStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  ledgerId: number;
  ledgerName: string;
};

type DuesListResponse = {
  content: DuesListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type DuesDetailResponse = {
  duesId: number;
  groupId: number;
  title: string;
  amount: number;
  dueDate: string;
  status: DuesStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  expectedTotalAmount: number;
  ledger: { ledgerId: number; name: string };
  createdAt: string;
  closedAt: string | null;
  generatedEntryId: number | null;
};

type DuesMemberResponse = {
  memberId: number;
  name: string;
  status: PaymentStatus;
  paidAt: string | null;
};

function toDuesSummary(response: DuesListItemResponse): DuesSummary {
  return {
    id: String(response.duesId),
    title: response.title,
    amount: response.amount,
    dueDate: response.dueDate,
    status: response.status,
    paidCount: response.paidCount,
    unpaidCount: response.unpaidCount,
    targetCount: response.targetCount,
    ledgerId: String(response.ledgerId),
    ledgerName: response.ledgerName,
  };
}

function toDuesDetail(response: DuesDetailResponse): DuesDetail {
  return {
    id: String(response.duesId),
    groupId: String(response.groupId),
    title: response.title,
    amount: response.amount,
    dueDate: response.dueDate,
    status: response.status,
    paidCount: response.paidCount,
    unpaidCount: response.unpaidCount,
    targetCount: response.targetCount,
    expectedTotalAmount: response.expectedTotalAmount,
    ledger: { id: String(response.ledger.ledgerId), name: response.ledger.name },
    createdAt: response.createdAt,
    closedAt: response.closedAt,
    generatedEntryId:
      response.generatedEntryId != null ? String(response.generatedEntryId) : null,
  };
}

function toDuesMember(response: DuesMemberResponse): DuesMember {
  return {
    memberId: String(response.memberId),
    name: response.name,
    status: response.status,
    paidAt: response.paidAt,
  };
}

export type DuesListParams = {
  status?: DuesStatus;
};

/**
 * 회비 목록을 조회한다. 이 화면(DUE-1-PAGE-01-0)은 무한 스크롤 UI가 없고
 * (명세에 그런 언급이 없음, Entry처럼 대량 페이지네이션이 필요한 화면도 아님)
 * 한 모임의 회비 건수가 실사용 범위에서 크지 않을 것으로 보여 `size=50`
 * 한 번 호출로 전체를 받는다 — 50건을 넘으면 뒤가 잘리니, 실제로 그럴 일이
 * 생기면 그때 무한 스크롤(Entry와 같은 패턴)로 바꾼다.
 */
export async function getDuesList(
  groupId: string,
  params: DuesListParams = {},
): Promise<DuesSummary[]> {
  const query = new URLSearchParams();
  if (params.status) {
    query.set('status', params.status);
  }
  query.set('size', '50');
  const response = await request<DuesListResponse>(
    `/api/v1/groups/${groupId}/dues?${query.toString()}`,
    { method: 'GET' },
  );
  return response.content.map(toDuesSummary);
}

/** 회비 상세를 조회한다. */
export async function getDuesDetail(duesId: string): Promise<DuesDetail> {
  const response = await request<DuesDetailResponse>(`/api/v1/dues/${duesId}`, {
    method: 'GET',
  });
  return toDuesDetail(response);
}

export type CreateDuesInput = {
  title: string;
  amount: number;
  /** 'YYYY-MM-DD'. 명세엔 "기간"(시작~마감)이라 돼 있지만 서버는 마감일 하나만
   * 받는다 — docs/api-gaps.md (A) "회비 시작일 필드 부재" 참고. */
  dueDate: string;
  targetMemberIds: number[];
  ledgerId: string;
};

export type CreatedDues = {
  id: string;
  title: string;
  status: DuesStatus;
  targetCount: number;
};

type DuesCreateResponse = {
  duesId: number;
  groupId: number;
  title: string;
  amount: number;
  dueDate: string;
  status: DuesStatus;
  targetCount: number;
  paidCount: number;
  ledgerId: number;
  createdAt: string;
};

/** 회비를 생성한다(총무 전용). 생성 직후엔 아무도 안 냈으므로 targetCount만 의미 있다. */
export async function createDues(
  groupId: string,
  input: CreateDuesInput,
): Promise<CreatedDues> {
  const body = {
    title: input.title,
    amount: input.amount,
    dueDate: input.dueDate,
    targetMemberIds: input.targetMemberIds,
    ledgerId: Number(input.ledgerId),
  };
  const response = await request<DuesCreateResponse>(
    `/api/v1/groups/${groupId}/dues`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  return {
    id: String(response.duesId),
    title: response.title,
    status: response.status,
    targetCount: response.targetCount,
  };
}

export type DuesMembersParams = {
  status?: PaymentStatus;
  keyword?: string;
};

/** 회비의 납부 대상 목록을 조회한다. */
export async function getDuesMembers(
  duesId: string,
  params: DuesMembersParams = {},
): Promise<DuesMember[]> {
  const query = new URLSearchParams();
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.keyword) {
    query.set('keyword', params.keyword);
  }
  const queryString = query.toString();
  const response = await request<DuesMemberResponse[]>(
    `/api/v1/dues/${duesId}/members${queryString ? `?${queryString}` : ''}`,
    { method: 'GET' },
  );
  return response.map(toDuesMember);
}
