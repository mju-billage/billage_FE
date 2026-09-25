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
  startDate: string;
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
  startDate: string;
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
    startDate: response.startDate,
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
    startDate: response.startDate,
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
  /** 'YYYY-MM-DD'. 필수(없으면 400,
   * `fieldErrors:[{field:"startDate"}]`). `dueDate`보다 늦으면 안 된다. */
  startDate: string;
  /** 'YYYY-MM-DD'. */
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
  startDate: string;
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
    startDate: input.startDate,
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

export type UpdateDuesInput = {
  title?: string;
  /** 'YYYY-MM-DD'. */
  startDate?: string;
  /** 'YYYY-MM-DD'. */
  dueDate?: string;
  targetMemberIds?: number[];
  ledgerId?: string;
};

type DuesUpdateResponse = {
  duesId: number;
  title: string;
  amount: number;
  dueDate: string;
  status: DuesStatus;
  targetCount: number;
  paidCount: number;
  ledgerId: number;
};

/**
 * 회비를 수정한다(총무 전용, Dues.txt §4). 전달한 필드만 반영된다 — 호출자가
 * 바뀐 값만 골라 넣어야 한다(diff는 화면 쪽 책임, entryService.updateEntry와
 * 같은 패턴). `amount`는 이 타입에 아예 없다 — 서버가 절대 수정 불가로 막는
 * 필드라(`DUES_AMOUNT_IMMUTABLE 400`) 애초에 보낼 방법을 안 만들었다.
 * `startDate`는 API 문서 예시 바디엔 없지만 "마감 전까지 금액을 제외한 필드는
 * 수정할 수 있다"는 정책 메모가 명시적으로 전체 필드를 포함하므로 보낸다.
 * 응답을 매핑하지 않는다 — 호출 화면은 성공 후 상세 화면으로 돌아가고,
 * `DuesDetailScreen`의 포커스 재조회가 최신 값을 다시 받아온다.
 */
export async function updateDues(
  duesId: string,
  input: UpdateDuesInput,
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) {
    body.title = input.title;
  }
  if (input.startDate !== undefined) {
    body.startDate = input.startDate;
  }
  if (input.dueDate !== undefined) {
    body.dueDate = input.dueDate;
  }
  if (input.targetMemberIds !== undefined) {
    body.targetMemberIds = input.targetMemberIds;
  }
  if (input.ledgerId !== undefined) {
    body.ledgerId = Number(input.ledgerId);
  }
  await request<DuesUpdateResponse>(`/api/v1/dues/${duesId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * 회비를 삭제한다(총무 전용, Dues.txt §5). 대상자별 납부 기록까지 완전히
 * 삭제되며 복구 불가 — 마감 시 생성된 수입 내역은 약한 연결이라 그대로 남는다.
 */
export async function deleteDues(duesId: string): Promise<void> {
  await request<void>(`/api/v1/dues/${duesId}`, { method: 'DELETE' });
}

type DuesCloseResponse = {
  duesId: number;
  status: DuesStatus;
  paidCount: number;
  targetCount: number;
  totalCollectedAmount: number;
  ledgerId: number;
  generatedEntryId: number;
  closedAt: string;
};

/**
 * 회비를 마감한다(총무 전용, Dues.txt §8). 미납자가 남아 있어도 마감되며,
 * 마감 시점까지 실제로 걷힌 금액(PAID 인원 × amount)으로 장부에 수입 내역
 * 1건이 즉시 APPROVED 상태로 생성된다. 재오픈 API는 없다(명세에 재오픈
 * 진입점 자체가 없다고 확정됨) — 마감은 되돌릴 수 없는 동작이다.
 */
export async function closeDues(duesId: string): Promise<void> {
  await request<DuesCloseResponse>(`/api/v1/dues/${duesId}/close`, {
    method: 'POST',
  });
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

export type UpdateDuesMembersStatusResult = {
  /** 실제로 상태가 바뀐 인원 — 선택 인원수와 다를 수 있다(아래 주석 참고). */
  changedCount: number;
  paidCount: number;
  unpaidCount: number;
};

type DuesMembersStatusUpdateResponse = {
  duesId: number;
  changedCount: number;
  status: PaymentStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  totalCollectedAmount: number;
};

/**
 * 회비 대상자 여러 명의 납부 상태를 한 번에 바꾼다(총무 전용, Dues.txt §9).
 * 서버가 원자적으로 처리한다: `memberIds` 중 하나라도 이 회비의 대상자가
 * 아니면 요청 전체가 취소된다(Dues.txt §9 Validation) — 그래서 이 함수엔
 * "일부만 성공"이 없다, 성공하거나(`changedCount` 반환) 통째로 실패한다
 * (에러를 그대로 던짐 — 호출부가 기존 `toErrorMessage` 패턴으로 처리).
 * 이미 요청한 상태인 대상자는 조용히 넘어가고 `changedCount`에도 안 세므로,
 * 완료/취소 스낵바 문구는 반드시 이 값을 써야 한다 — 선택한 인원수를 그대로
 * 쓰면 실제 반영된 인원과 숫자가 어긋날 수 있다.
 *
 * 이 API가 다시 막히는 경우를 대비해 시그니처는 일부러 "duesId+memberIds+status
 * 넣으면 결과가 나온다"로만 뒀다 — 내부를 단건 반복(`PATCH
 * /dues/{id}/members/{memberId}`, 다건 이동과 같은 순차 호출 패턴)으로
 * 바꿔도 호출부(DuesDetailScreen)는 이 함수 하나만 보므로 손댈 일이 없다.
 */
export async function updateDuesMembersPaymentStatus(
  duesId: string,
  memberIds: string[],
  status: PaymentStatus,
): Promise<UpdateDuesMembersStatusResult> {
  const response = await request<DuesMembersStatusUpdateResponse>(
    `/api/v1/dues/${duesId}/members`,
    {
      method: 'PATCH',
      body: JSON.stringify({ memberIds: memberIds.map(Number), status }),
    },
  );
  return {
    changedCount: response.changedCount,
    paidCount: response.paidCount,
    unpaidCount: response.unpaidCount,
  };
}
