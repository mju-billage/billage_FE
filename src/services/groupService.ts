import { request } from './apiClient';
import { setGroups, upsertGroup } from '../types/group';
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
  /** GroupMembership.role = OWNER 수. 이번 단계 화면은 안 쓰지만 명세 그대로 옮겨둔다. */
  ownerCount: number;
};

/** 생성 응답엔 memberCount가 없다 — 막 만든 모임은 납부 명단이 항상 0명이라서다. */
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

/** 서버 응답(숫자 groupId)을 캐시 타입(GroupSummary, 문자열 id)으로 옮긴다. */
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
    // 초대 코드는 이 도메인 API엔 없다 — 2단계(GroupMembership) 발급 API가 채운다.
    inviteCode: null,
  };
}

/** 내 모임 목록을 조회하고, 성공하면 캐시(`types/group.ts`)를 통째로 교체한다. */
export async function getMyGroups(): Promise<GroupSummary[]> {
  const response = await request<GroupListItemResponse[]>('/api/v1/groups', {
    method: 'GET',
  });
  const groups = response.map(toGroupSummary);
  setGroups(groups);
  return groups;
}

/** 모임 상세를 조회하고, 성공하면 캐시에 반영(추가 또는 갱신)한다. */
export async function getGroupDetail(groupId: string): Promise<GroupSummary> {
  const response = await request<GroupDetailResponse>(
    `/api/v1/groups/${groupId}`,
    { method: 'GET' },
  );
  const group = toGroupSummary(response);
  upsertGroup(group);
  return group;
}

/**
 * 모임을 생성한다. 이번 단계 화면(모임 이름만 입력)에 맞춰 `description`/
 * `groupImageFileId`는 아직 안 보낸다 — 대표 이미지 업로드 화면이 생기면 채운다.
 */
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

/**
 * 초대 코드로 모임에 참여한다. 참여 응답엔 groupId/membershipId/role만 있고
 * 모임 이름 등은 없어서, 화면에 곧바로 쓸 GroupSummary를 만들려고 상세 조회를
 * 한 번 더 호출한다(두 번의 네트워크 왕복 — 명세가 그렇게 나뉘어 있어 어쩔 수 없다).
 */
export async function joinGroup(invitationCode: string): Promise<GroupSummary> {
  const result = await request<JoinGroupResponse>('/api/v1/groups/join', {
    method: 'POST',
    body: JSON.stringify({ invitationCode }),
  });
  return getGroupDetail(String(result.groupId));
}
