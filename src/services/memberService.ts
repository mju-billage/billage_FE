import { request } from './apiClient';
import type { Member } from '../types/member';

type MemberResponse = {
  memberId: number;
  name: string;
  phoneNumber: string | null;
  tags: string[];
  memo: string | null;
  createdAt: string;
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

/**
 * 모임원(납부 관리용 Member) 목록을 조회한다. 조회만(6-B) — 등록·수정·삭제는
 * 모임원 관리 화면 대상이라 여기서 만들지 않는다.
 *
 * `keyword` 쿼리 파라미터가 서버에 있지만(Member.txt) 회비 생성_모임원 선택
 * 화면(DUE-3-PAGE-01-0)의 검색은 "입력할 때마다 즉시 필터링"이라 매 키 입력마다
 * 서버를 부르지 않고 한 번 받아온 목록을 클라이언트에서 그대로 거른다 —
 * `keyword`는 필요해지면 그때 쓸 수 있게 옵션으로만 남겨둔다.
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
