import type { GroupRole } from './group';

export type GroupMembership = {
  membershipId: string;
  groupId: string;
  userId: string;
  name: string;
  role: GroupRole;
  joinedAt: string;
  profileImageUrl: string | null;
  isMe: boolean;
};

let membershipsByGroup: Record<string, GroupMembership[]> = {};

export function setGroupMemberships(
  groupId: string,
  memberships: GroupMembership[],
): void {
  membershipsByGroup[groupId] = memberships;
}

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

export function clearGroupMembershipsCache(groupId: string): void {
  delete membershipsByGroup[groupId];
}

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

export function getGroupMemberships(groupId: string): GroupMembership[] {
  return membershipsByGroup[groupId] ?? [];
}
