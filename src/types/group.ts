/**
 * 모임(Group) 자체. 관리자 권한 관계(`GroupMembership`, `types/groupMembership.ts`)·
 * 납부 명단(`Member`, `types/member.ts`)과는 별개 엔티티다(API 공통 규칙 §17 — 자동 연결 안 함).
 *
 * `myRole`은 서버 enum(`OWNER`/`MEMBER`) 원문을 그대로 쓴다. 화면에 "총무"/"일반"으로
 * 보여줄 땐 `constants/groupManagerScreenText.ts`처럼 각 화면의 텍스트 상수에서 변환한다 —
 * enum 원문을 그대로 노출하지 않는다(API 공통 규칙 §13).
 */
export type GroupRole = 'OWNER' | 'MEMBER';

export type GroupSummary = {
  id: string;
  name: string;
  description: string | null;
  groupImageUrl: string | null;
  myRole: GroupRole;
  /** 명세상 "납부 관리용 Member 명단 수"를 의미한다 — 관리자(GroupMembership) 수가 아니다. */
  memberCount: number;
  /**
   * 서버는 초대 코드를 모임 목록/생성/조회 응답에 안 주고 별도 발급 API
   * (`POST /groups/{groupId}/invitations`)로 내려준다.
   * 그래서 모임 캐시의 값은 항상 null이다 — 발급 화면(모임 관리자)에서 그때그때
   * 요청해 채운다.
   */
  inviteCode: string | null;
};

// 클라이언트 전역 상태: "내가 속한 모임 목록"과 "지금 보고 있는 모임".
// 서버 개념이 아니라 화면 간 공유를 위한 캐시다 — groupService가 API 응답으로 채워 넣는다.
// 로그인 전/최초 조회 전에는 비어 있으므로, 소비하는 화면은 항상 빈 상태를 다뤄야 한다.
let groups: GroupSummary[] = [];
let activeGroupId: string | null = null;

/** groupService가 목록 조회에 성공하면 캐시를 통째로 교체한다. */
export function setGroups(next: GroupSummary[]): void {
  groups = next;
  if (!activeGroupId || !groups.some(group => group.id === activeGroupId)) {
    activeGroupId = groups[0]?.id ?? null;
  }
}

/** groupService가 생성/참여에 성공하면 캐시에 모임 하나를 추가하거나 갱신한다. */
export function upsertGroup(group: GroupSummary): void {
  const index = groups.findIndex(item => item.id === group.id);
  if (index >= 0) {
    groups[index] = group;
  } else {
    groups.push(group);
  }
  activeGroupId = group.id;
}

/** 모임을 나가거나 삭제했을 때 캐시에서 제거한다. */
export function removeGroupFromCache(groupId: string): void {
  groups = groups.filter(group => group.id !== groupId);
  if (activeGroupId === groupId) {
    activeGroupId = groups[0]?.id ?? null;
  }
}

/** 캐시에 있는 모임 목록을 그대로 반환한다(네트워크 조회는 `groupService.getMyGroups`). */
export function getCachedGroups(): GroupSummary[] {
  return groups;
}

/** 지금 화면에 표시 중인(선택된) 모임을 반환한다. 캐시가 비어 있으면 undefined. */
export function getActiveGroup(): GroupSummary | undefined {
  return groups.find(group => group.id === activeGroupId);
}

/** 표시 중인 모임을 바꾼다. */
export function setActiveGroup(groupId: string): void {
  activeGroupId = groupId;
}

/** id로 모임 하나를 캐시에서 찾는다. */
export function getGroupById(groupId: string): GroupSummary | undefined {
  return groups.find(group => group.id === groupId);
}

/**
 * groupMembershipService가 초대 코드를 발급받으면 그 값만 캐시에 채워 넣는다.
 * `upsertGroup`처럼 통째로 교체하지 않는 이유: 초대 코드 발급은 Group 응답이 아니라
 * 별도 API(`POST /groups/{groupId}/invitations`) 결과라 다른 필드를 덮어쓰면 안 된다.
 */
export function setGroupInviteCode(groupId: string, inviteCode: string): void {
  const index = groups.findIndex(group => group.id === groupId);
  if (index >= 0) {
    groups[index] = { ...groups[index], inviteCode };
  }
}
