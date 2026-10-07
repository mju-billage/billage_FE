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
  profileImageUrl?: string | null;
};

type InvitationResponse = {
  invitationCode: string;
  invitationLink: string;
  expiresAt: string;
};


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

export async function createInvitation(groupId: string): Promise<string> {
  const response = await request<InvitationResponse>(
    `/api/v1/groups/${groupId}/invitations`,
    { method: 'POST' },
  );
  setGroupInviteCode(groupId, response.invitationCode);
  return response.invitationCode;
}

export async function getCurrentInvitation(groupId: string): Promise<string> {
  const response = await request<InvitationResponse>(
    `/api/v1/groups/${groupId}/invitations/current`,
    { method: 'GET' },
  );
  setGroupInviteCode(groupId, response.invitationCode);
  return response.invitationCode;
}

export async function leaveGroup(groupId: string): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}/leave`, { method: 'POST' });
  clearGroupMembershipsCache(groupId);
  removeGroupFromCache(groupId);
}

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
