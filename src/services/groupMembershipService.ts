import { request } from './apiClient';
import {
  clearGroupMembershipsCache,
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
  return {
    membershipId: String(response.membershipId),
    groupId,
    userId: String(response.userId),
    name: response.name,
    role: response.role,
    joinedAt: response.joinedAt,
    isMe: String(response.userId) === getCurrentUser()?.userId,
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

/** 내가 모임에서 나간다. 성공하면 그 모임의 관리자 캐시와 모임 목록 캐시를 모두 지운다. */
export async function leaveGroup(groupId: string): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}/leave`, { method: 'POST' });
  clearGroupMembershipsCache(groupId);
  removeGroupFromCache(groupId);
}
