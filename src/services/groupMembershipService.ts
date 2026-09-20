import { request } from './apiClient';
import {
  clearGroupMembershipsCache,
  removeMembershipFromCache,
  setGroupMemberships,
  upsertMembershipInCache,
} from '../types/groupMembership';
import type { GroupMembership } from '../types/groupMembership';
import { removeGroupFromCache, setGroupInviteCode } from '../types/group';
import type { GroupRole } from '../types/group';
import { getCurrentUser } from '../types/session';

type MembershipResponse = {
  membershipId: number;
  userId: number;
  name: string;
  role: GroupRole;
  joinedAt: string;
  /** 아직 서버가 안 준다(2026-09-21 실호출). 오면 그대로 쓴다. */
  profileImageUrl?: string | null;
};

type InvitationResponse = {
  invitationCode: string;
  invitationLink: string;
  expiresAt: string;
};

/**
 * 초대 코드로 모임에 참여하는 `POST /groups/join`은 이 파일이 아니라
 * `groupService.joinGroup()`에 있다. 서버 응답이 곧바로 `GroupMembership`을 만들지만,
 * 화면(`JoinGroupSheet`)이 필요로 하는 결과는 "참여한 모임 정보(GroupSummary)"라서
 * 참여 직후 상세 조회까지 묶어 Group 쪽 서비스에 둔 것 — 1단계에서 이미 그렇게
 * 구현·검증됐고, 소비하는 화면도 Group 캐시(GroupSummary)를 기대하므로 옮기지 않는다.
 */

function toGroupMembership(
  groupId: string,
  response: MembershipResponse,
): GroupMembership {
  const isMe = String(response.userId) === getCurrentUser()?.userId;
  return {
    membershipId: String(response.membershipId),
    groupId,
    userId: String(response.userId),
    name: response.name,
    role: response.role,
    joinedAt: response.joinedAt,
    profileImageUrl:
      response.profileImageUrl ?? (isMe ? getCurrentUser()?.profileImageUrl : null) ?? null,
    isMe,
  };
}

/** 모임 관리자(GroupMembership) 목록을 조회하고, 성공하면 캐시를 통째로 교체한다. */
export async function getMemberships(
  groupId: string,
): Promise<GroupMembership[]> {
  const response = await request<MembershipResponse[]>(
    `/api/v1/groups/${groupId}/memberships`,
    { method: 'GET' },
  );
  const memberships = response.map(item => toGroupMembership(groupId, item));
  setGroupMemberships(groupId, memberships);
  return memberships;
}

/**
 * 관리자 권한을 전환한다(OWNER ↔ MEMBER).
 * ⚠️ 명세에 이 API의 성공 응답 본문이 문서화돼 있지 않다(`docs/api-gaps.md` (A) 참고) —
 * 목록 조회와 같은 형태(`MembershipResponse`)로 온다고 가정하고 옮겼다. 실제 응답이
 * 다르면 캐시 갱신이 깨지니 실기기 확인이 특히 중요하다.
 */
export async function updateMembershipRole(
  groupId: string,
  membershipId: string,
  role: GroupRole,
): Promise<GroupMembership> {
  const response = await request<MembershipResponse>(
    `/api/v1/groups/${groupId}/memberships/${membershipId}`,
    { method: 'PATCH', body: JSON.stringify({ role }) },
  );
  const membership = toGroupMembership(groupId, response);
  upsertMembershipInCache(groupId, membership);
  return membership;
}

/**
 * 초대 코드를 새로 발급받아 모임 캐시(`GroupSummary.inviteCode`)에 채운다.
 * 명세에 만료(7일)·재발급 정책 서술은 있지만 에러 응답 섹션이 없다(`docs/api-gaps.md` (A)).
 */
export async function createInvitation(groupId: string): Promise<string> {
  const response = await request<InvitationResponse>(
    `/api/v1/groups/${groupId}/invitations`,
    { method: 'POST' },
  );
  setGroupInviteCode(groupId, response.invitationCode);
  return response.invitationCode;
}

/**
 * 2026-09-06 신규 연동. 명세 GroupMembership.txt 7번(`구현 완료`) — "지금 코드를
 * 읽는" 조회 전용 엔드포인트다. 이게 없던 동안은 화면 진입마다 `createInvitation`
 * (발급, 매번 새 코드)을 부를 수 없어(재발급마다 이전 코드가 무효화됨) 사용자가
 * 카드를 직접 눌러야만 최초 1회 발급하는 우회를 썼다 — 이제 진입 시 이 함수로
 * 먼저 조회하고, `INVITATION_NOT_FOUND`(코드가 아예 없음)일 때만
 * `createInvitation`으로 최초 발급하면 된다.
 */
export async function getCurrentInvitation(groupId: string): Promise<string> {
  const response = await request<InvitationResponse>(
    `/api/v1/groups/${groupId}/invitations/current`,
    { method: 'GET' },
  );
  setGroupInviteCode(groupId, response.invitationCode);
  return response.invitationCode;
}

/** 내가 모임에서 나간다. 성공하면 그 모임의 관리자 캐시와 모임 목록 캐시를 모두 지운다. */
export async function leaveGroup(groupId: string): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}/leave`, { method: 'POST' });
  clearGroupMembershipsCache(groupId);
  removeGroupFromCache(groupId);
}

/**
 * 총무가 다른 모임원을 강제로 내보낸다(2026-09-06 실호출로 실재 확인 —
 * `docs/api-gaps.md`에 API 없음으로 보류돼 있던 항목, 실제로는 구현돼 있었다).
 * 장부 내역의 작성자·승인자 이름은 스냅샷이라 안 지워진다(GroupMembership.txt
 * §6 정책) — 이 함수는 관리자 캐시에서만 지운다.
 */
export async function removeMembership(
  groupId: string,
  membershipId: string,
): Promise<void> {
  await request<void>(
    `/api/v1/groups/${groupId}/memberships/${membershipId}`,
    { method: 'DELETE' },
  );
  removeMembershipFromCache(groupId, membershipId);
}
