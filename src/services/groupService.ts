import { request } from './apiClient';
import { getGroupById, removeGroupFromCache, setGroups, upsertGroup } from '../types/group';
import type { GroupRole, GroupSummary } from '../types/group';

type GroupListItemResponse = {
  groupId: number;
  name: string;
  description: string | null;
  groupImageUrl: string | null;
  myRole: GroupRole;
  memberCount: number;
  createdAt: string;
};

type GroupDetailResponse = GroupListItemResponse & {
  ownerCount: number;
};

type GroupCreateResponse = Omit<GroupListItemResponse, 'memberCount'>;

type JoinGroupResponse = {
  groupId: number;
  membershipId: number;
  role: GroupRole;
};

export type CreateGroupRequest = {
  name: string;
  description?: string | null;
  groupImageFileId?: number | null;
};

function toGroupSummary(
  response: GroupListItemResponse | GroupDetailResponse,
): GroupSummary {
  return {
    id: String(response.groupId),
    name: response.name,
    description: response.description,
    groupImageUrl: response.groupImageUrl,
    myRole: response.myRole,
    memberCount: response.memberCount,
    inviteCode: null,
  };
}

export async function getMyGroups(): Promise<GroupSummary[]> {
  const response = await request<GroupListItemResponse[]>('/api/v1/groups', {
    method: 'GET',
  });
  const groups = response.map(toGroupSummary);
  setGroups(groups);
  return groups;
}

export async function getGroupDetail(groupId: string): Promise<GroupSummary> {
  const response = await request<GroupDetailResponse>(
    `/api/v1/groups/${groupId}`,
    { method: 'GET' },
  );
  const group = toGroupSummary(response);
  upsertGroup(group);
  return group;
}

export async function createGroup(
  payload: CreateGroupRequest,
): Promise<GroupSummary> {
  const response = await request<GroupCreateResponse>('/api/v1/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const group = toGroupSummary({ ...response, memberCount: 0 });
  upsertGroup(group);
  return group;
}

export async function joinGroup(invitationCode: string): Promise<GroupSummary> {
  const result = await request<JoinGroupResponse>('/api/v1/groups/join', {
    method: 'POST',
    body: JSON.stringify({ invitationCode }),
  });
  return getGroupDetail(String(result.groupId));
}

export type UpdateGroupInput = {
  name?: string;
  description?: string | null;
  groupImageFileId?: number | null;
};

type GroupUpdateResponse = {
  groupId: number;
  name: string;
  description: string | null;
  groupImageUrl: string | null;
};

export async function updateGroup(
  groupId: string,
  payload: UpdateGroupInput,
): Promise<GroupSummary> {
  const response = await request<GroupUpdateResponse>(
    `/api/v1/groups/${groupId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  );
  const existing = getGroupById(groupId);
  const group: GroupSummary = {
    id: String(response.groupId),
    name: response.name,
    description: response.description,
    groupImageUrl: response.groupImageUrl,
    myRole: existing?.myRole ?? 'OWNER',
    memberCount: existing?.memberCount ?? 0,
    inviteCode: existing?.inviteCode ?? null,
  };
  upsertGroup(group);
  return group;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}`, { method: 'DELETE' });
  removeGroupFromCache(groupId);
}
