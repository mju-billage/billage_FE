import { request } from './apiClient';
import type { Member, MemberDetail, MemberPayment } from '../types/member';

type MemberResponse = {
  memberId: number;
  name: string;
  phoneNumber: string | null;
  tags: string[];
  memo: string | null;
  createdAt: string;
};

type MemberDetailResponse = MemberResponse & { totalPaidAmount: number };

type MemberPaymentItemResponse = {
  duesId: number;
  duesTitle: string;
  ledgerId: number;
  ledgerName: string;
  amount: number;
  paidAt: string;
};

/**
 * ⚠️ Member.txt §7 예시는 `payments`가 `{content, page, size, totalElements,
 * totalPages}` 페이지 객체라고 적어놨지만, 실제
 * 응답은 `payments`가 **페이지네이션 없는 배열 그대로**다(`from`/`to` 기간
 * 필터는 정상 동작하지만 `page`/`size` 쿼리 파라미터는 응답에 아무 영향이
 * 없다 — size=1을 보내도 전체 배열이 그대로 온다). 서버가 나중에 진짜
 * 페이지네이션을 붙이면 이 타입과 `getMemberPayments()`를 다시 고쳐야 한다.
 */
type MemberPaymentsResponse = {
  totalPaidAmount: number;
  payments: MemberPaymentItemResponse[];
};

function toMember(groupId: string, response: MemberResponse): Member {
  return {
    memberId: String(response.memberId),
    groupId,
    name: response.name,
    phoneNumber: response.phoneNumber,
    tags: response.tags,
    memo: response.memo,
    createdAt: response.createdAt,
  };
}

function toMemberDetail(groupId: string, response: MemberDetailResponse): MemberDetail {
  return {
    ...toMember(groupId, response),
    totalPaidAmount: response.totalPaidAmount,
  };
}

function toMemberPayment(response: MemberPaymentItemResponse): MemberPayment {
  return {
    duesId: String(response.duesId),
    duesTitle: response.duesTitle,
    ledgerId: String(response.ledgerId),
    ledgerName: response.ledgerName,
    amount: response.amount,
    paidAt: response.paidAt,
  };
}

/**
 * 모임원(납부 관리용 Member) 목록을 조회한다. 회비 생성_모임원
 * 선택 화면은 한 번 받아온 목록을 클라이언트에서 거르므로 `keyword`를 안 쓰고,
 * 모임원 관리 화면은 `keyword`를 서버 파라미터로 쓴다 —
 * 응답은 페이지네이션 없이 배열을 직접 준다(Entry/Dues와 다름, Member.txt).
 */
export async function getMembers(
  groupId: string,
  keyword?: string,
): Promise<Member[]> {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  const response = await request<MemberResponse[]>(
    `/api/v1/groups/${groupId}/members${query}`,
    { method: 'GET' },
  );
  return response.map(item => toMember(groupId, item));
}

export type CreateMemberInput = {
  name: string;
  phoneNumber?: string;
  tags?: string[];
  memo?: string;
};

/** 모임원을 개별 등록한다(총무 전용). 사용자 계정·GroupMembership과 자동 연결하지 않는다. */
export async function createMember(
  groupId: string,
  input: CreateMemberInput,
): Promise<Member> {
  const response = await request<MemberResponse>(
    `/api/v1/groups/${groupId}/members`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        phoneNumber: input.phoneNumber,
        tags: input.tags,
        memo: input.memo,
      }),
    },
  );
  return toMember(groupId, response);
}

/**
 * 이름 여러 개를 한 번에 등록한다(총무 전용). `names`는 서버가 쉼표·띄어쓰기·
 * 줄바꿈(`[,\s]+`)으로 직접 잘라 각각 독립된 모임원으로 저장하는 원문 텍스트다 —
 * 클라이언트는 자르지 않고 그대로 보낸다(Member.txt §3). 하나라도 검증에
 * 어긋나면 서버가 전부 취소(단일 트랜잭션)하므로 부분 성공은 없다.
 */
export async function createMembersBulk(
  groupId: string,
  names: string,
): Promise<Member[]> {
  const response = await request<MemberResponse[]>(
    `/api/v1/groups/${groupId}/members/bulk`,
    { method: 'POST', body: JSON.stringify({ names }) },
  );
  return response.map(item => toMember(groupId, item));
}

/** 모임원 상세를 조회한다(MEMBER 권한 — 총무·일반 관리자 모두 가능). 목록에
 * 없는 `totalPaidAmount`를 함께 내려준다. */
export async function getMemberDetail(
  groupId: string,
  memberId: string,
): Promise<MemberDetail> {
  const response = await request<MemberDetailResponse>(
    `/api/v1/groups/${groupId}/members/${memberId}`,
    { method: 'GET' },
  );
  return toMemberDetail(groupId, response);
}

/**
 * 모임원을 수정한다(총무 전용).
 *
 * ⚠️ 부분 수정이 아니라 통째 교체다(Member.txt §4 aside): `phoneNumber`·`tags`·
 * `memo`를 빼고 보내면 서버가 그 값을 비운다. 그래서 `entryService.updateEntry`처럼
 * "바뀐 필드만 골라 보내는" 스냅샷 비교 패턴을 여기 쓰면 안 된다 — 손대지 않은
 * 필드까지 조용히 지워진다. 호출자(`MemberEditScreen`)는 매번 폼의 현재 값
 * 전체를 그대로 보낸다.
 */
export async function updateMember(
  groupId: string,
  memberId: string,
  input: CreateMemberInput,
): Promise<Member> {
  const response = await request<MemberResponse>(
    `/api/v1/groups/${groupId}/members/${memberId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        name: input.name,
        phoneNumber: input.phoneNumber,
        tags: input.tags,
        memo: input.memo,
      }),
    },
  );
  return toMember(groupId, response);
}

/** 모임원 1명을 삭제한다(총무 전용). 회비 참여 데이터까지 Hard Delete된다(Member.txt §5). */
export async function deleteMember(groupId: string, memberId: string): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

/**
 * 모임원 여러 명을 한 번에 삭제한다(총무 전용, Member.txt §8). 단건 삭제를 N번
 * 호출하는 대신 이 API를 쓴다 — 서버가 한 트랜잭션으로 처리해 하나라도 다른
 * 모임의 모임원이면 전부 취소된다(부분 성공 없음, 일괄 납부 변경과
 * 같은 원자성 패턴). 이미 마감된 회비로 생성된 장부 수입 내역은 지우지 않는다.
 */
export async function deleteMembersBulk(
  groupId: string,
  memberIds: string[],
): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}/members`, {
    method: 'DELETE',
    body: JSON.stringify({ memberIds: memberIds.map(Number) }),
  });
}

export type MemberPaymentParams = {
  /** 납부일(paidAt) 기간, 선택. */
  from?: string;
  to?: string;
};

export type MemberPaymentResult = {
  totalPaidAmount: number;
  items: MemberPayment[];
};

/**
 * 모임원의 납부 내역을 최신순으로 조회한다(MEMBER 권한). 서버가 페이지네이션
 * 없이 전체 배열을 한 번에 내려주므로(위 타입 주석 참고) 이 함수도 `page`/
 * `size`를 받지 않는다 — 무한 스크롤이 아니라 단순 목록으로 호출한다.
 */
export async function getMemberPayments(
  groupId: string,
  memberId: string,
  params: MemberPaymentParams = {},
): Promise<MemberPaymentResult> {
  const query = new URLSearchParams();
  if (params.from) {
    query.set('from', params.from);
  }
  if (params.to) {
    query.set('to', params.to);
  }
  const queryString = query.toString();

  const response = await request<MemberPaymentsResponse>(
    `/api/v1/groups/${groupId}/members/${memberId}/payments${
      queryString ? `?${queryString}` : ''
    }`,
    { method: 'GET' },
  );
  return {
    totalPaidAmount: response.totalPaidAmount,
    items: response.payments.map(toMemberPayment),
  };
}
