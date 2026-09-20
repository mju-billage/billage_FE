import type { GroupRole } from './group';

/**
 * 가입 사용자(User)와 모임(Group)의 관리자 권한 관계(서버 `GroupMembership`).
 * 납부 관리용 명단(`Member`, `types/member.ts`)과는 별개이며 자동 연결하지 않는다.
 *
 * ⚠️ 서버 응답(`GET /groups/{groupId}/memberships`)엔 `email`이 없다(2단계에서 확인,
 * `docs/api-gaps.md` (A) 참고). 화면에서 멤버 식별은 `name` + `role`만으로 하고,
 * 이메일은 표시하지 않는다.
 *
 * 1단계까지는 이 파일이 목 데이터 저장소 겸 "함수 호출 = 상태 변경"이었지만, 2단계부터는
 * `group.ts`와 같은 패턴으로 순수 캐시로 바꿨다 — 실제 변경은 `groupMembershipService.ts`가
 * API 호출 후 아래 캐시 함수를 불러 반영한다.
 */
export type GroupMembership = {
  membershipId: string;
  groupId: string;
  userId: string;
  name: string;
  role: GroupRole;
  joinedAt: string;
  /** 프로필 이미지 URL. 서버 memberships 응답엔 아직 없다(2026-09-21 실호출) — 서버가 내려주면 그 값,
   * 없으면 본인(`isMe`)만 로그인 세션의 프로필 이미지로 채우고 나머지는 null. */
  profileImageUrl: string | null;
  /** 서버 필드 아님 — userId가 `types/session.ts`의 현재 로그인 사용자와 같은지 클라이언트가 계산해서 채운다. */
  isMe: boolean;
};

// 모임별로 따로 캐시한다(group.ts가 모임을 groupId로 캐시하는 것과 동일한 이유 —
// 화면이 한 번에 한 모임만 보므로 모임 단위 조회/치환이 자연스럽다).
let membershipsByGroup: Record<string, GroupMembership[]> = {};

/** groupMembershipService가 목록 조회에 성공하면 해당 모임의 캐시를 통째로 교체한다. */
export function setGroupMemberships(
  groupId: string,
  memberships: GroupMembership[],
): void {
  membershipsByGroup[groupId] = memberships;
}

/** groupMembershipService가 권한 변경에 성공하면 캐시의 해당 항목만 갱신한다. */
export function upsertMembershipInCache(
  groupId: string,
  membership: GroupMembership,
): void {
  const list = membershipsByGroup[groupId] ?? [];
  const index = list.findIndex(
    item => item.membershipId === membership.membershipId,
  );
  if (index >= 0) {
    list[index] = membership;
  } else {
    list.push(membership);
  }
  membershipsByGroup[groupId] = list;
}

/** 모임을 나가거나(leave) 그 모임의 캐시 자체를 비울 때 쓴다. */
export function clearGroupMembershipsCache(groupId: string): void {
  delete membershipsByGroup[groupId];
}

/** groupMembershipService가 강제 내보내기(kick)에 성공하면 캐시에서 그 항목만 지운다. */
export function removeMembershipFromCache(
  groupId: string,
  membershipId: string,
): void {
  const list = membershipsByGroup[groupId];
  if (list) {
    membershipsByGroup[groupId] = list.filter(
      item => item.membershipId !== membershipId,
    );
  }
}

/** 캐시에 있는 특정 모임의 관리자(GroupMembership) 목록을 그대로 반환한다. */
export function getGroupMemberships(groupId: string): GroupMembership[] {
  return membershipsByGroup[groupId] ?? [];
}
