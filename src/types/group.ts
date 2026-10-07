export type GroupRole = 'OWNER' | 'MEMBER';

export type GroupSummary = {
  id: string;
  name: string;
  description: string | null;
  groupImageUrl: string | null;
  myRole: GroupRole;
  memberCount: number;
  inviteCode: string | null;
};

let groups: GroupSummary[] = [];
let activeGroupId: string | null = null;

export function setGroups(next: GroupSummary[]): void {
  groups = next;
  if (!activeGroupId || !groups.some(group => group.id === activeGroupId)) {
    activeGroupId = groups[0]?.id ?? null;
  }
}

export function upsertGroup(group: GroupSummary): void {
  const index = groups.findIndex(item => item.id === group.id);
  if (index >= 0) {
    groups[index] = group;
  } else {
    groups.push(group);
  }
  activeGroupId = group.id;
}

export function removeGroupFromCache(groupId: string): void {
  groups = groups.filter(group => group.id !== groupId);
  if (activeGroupId === groupId) {
    activeGroupId = groups[0]?.id ?? null;
  }
}

export function getCachedGroups(): GroupSummary[] {
  return groups;
}

export function getActiveGroup(): GroupSummary | undefined {
  return groups.find(group => group.id === activeGroupId);
}

export function setActiveGroup(groupId: string): void {
  activeGroupId = groupId;
}

export function getGroupById(groupId: string): GroupSummary | undefined {
  return groups.find(group => group.id === groupId);
}

export function setGroupInviteCode(groupId: string, inviteCode: string): void {
  const index = groups.findIndex(group => group.id === groupId);
  if (index >= 0) {
    groups[index] = { ...groups[index], inviteCode };
  }
}
