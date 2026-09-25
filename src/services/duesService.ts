import { request } from './apiClient';
import type {
  DuesDetail,
  DuesMember,
  DuesStatus,
  DuesSummary,
  PaymentStatus,
} from '../types/dues';

type DuesListItemResponse = {
  duesId: number;
  title: string;
  amount: number;
  startDate: string;
  dueDate: string;
  status: DuesStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  ledgerId: number;
  ledgerName: string;
};

type DuesListResponse = {
  content: DuesListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type DuesDetailResponse = {
  duesId: number;
  groupId: number;
  title: string;
  amount: number;
  startDate: string;
  dueDate: string;
  status: DuesStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  expectedTotalAmount: number;
  ledger: { ledgerId: number; name: string };
  createdAt: string;
  closedAt: string | null;
  generatedEntryId: number | null;
};

type DuesMemberResponse = {
  memberId: number;
  name: string;
  status: PaymentStatus;
  paidAt: string | null;
};

function toDuesSummary(response: DuesListItemResponse): DuesSummary {
  return {
    id: String(response.duesId),
    title: response.title,
    amount: response.amount,
    startDate: response.startDate,
    dueDate: response.dueDate,
    status: response.status,
    paidCount: response.paidCount,
    unpaidCount: response.unpaidCount,
    targetCount: response.targetCount,
    ledgerId: String(response.ledgerId),
    ledgerName: response.ledgerName,
  };
}

function toDuesDetail(response: DuesDetailResponse): DuesDetail {
  return {
    id: String(response.duesId),
    groupId: String(response.groupId),
    title: response.title,
    amount: response.amount,
    startDate: response.startDate,
    dueDate: response.dueDate,
    status: response.status,
    paidCount: response.paidCount,
    unpaidCount: response.unpaidCount,
    targetCount: response.targetCount,
    expectedTotalAmount: response.expectedTotalAmount,
    ledger: { id: String(response.ledger.ledgerId), name: response.ledger.name },
    createdAt: response.createdAt,
    closedAt: response.closedAt,
    generatedEntryId:
      response.generatedEntryId != null ? String(response.generatedEntryId) : null,
  };
}

function toDuesMember(response: DuesMemberResponse): DuesMember {
  return {
    memberId: String(response.memberId),
    name: response.name,
    status: response.status,
    paidAt: response.paidAt,
  };
}

export type DuesListParams = {
  status?: DuesStatus;
};

export async function getDuesList(
  groupId: string,
  params: DuesListParams = {},
): Promise<DuesSummary[]> {
  const query = new URLSearchParams();
  if (params.status) {
    query.set('status', params.status);
  }
  query.set('size', '50');
  const response = await request<DuesListResponse>(
    `/api/v1/groups/${groupId}/dues?${query.toString()}`,
    { method: 'GET' },
  );
  return response.content.map(toDuesSummary);
}

export async function getDuesDetail(duesId: string): Promise<DuesDetail> {
  const response = await request<DuesDetailResponse>(`/api/v1/dues/${duesId}`, {
    method: 'GET',
  });
  return toDuesDetail(response);
}

export type CreateDuesInput = {
  title: string;
  amount: number;
  startDate: string;
  dueDate: string;
  targetMemberIds: number[];
  ledgerId: string;
};

export type CreatedDues = {
  id: string;
  title: string;
  status: DuesStatus;
  targetCount: number;
};

type DuesCreateResponse = {
  duesId: number;
  groupId: number;
  title: string;
  amount: number;
  startDate: string;
  dueDate: string;
  status: DuesStatus;
  targetCount: number;
  paidCount: number;
  ledgerId: number;
  createdAt: string;
};

export async function createDues(
  groupId: string,
  input: CreateDuesInput,
): Promise<CreatedDues> {
  const body = {
    title: input.title,
    amount: input.amount,
    startDate: input.startDate,
    dueDate: input.dueDate,
    targetMemberIds: input.targetMemberIds,
    ledgerId: Number(input.ledgerId),
  };
  const response = await request<DuesCreateResponse>(
    `/api/v1/groups/${groupId}/dues`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  return {
    id: String(response.duesId),
    title: response.title,
    status: response.status,
    targetCount: response.targetCount,
  };
}

export type UpdateDuesInput = {
  title?: string;
  startDate?: string;
  dueDate?: string;
  targetMemberIds?: number[];
  ledgerId?: string;
};

type DuesUpdateResponse = {
  duesId: number;
  title: string;
  amount: number;
  dueDate: string;
  status: DuesStatus;
  targetCount: number;
  paidCount: number;
  ledgerId: number;
};

export async function updateDues(
  duesId: string,
  input: UpdateDuesInput,
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) {
    body.title = input.title;
  }
  if (input.startDate !== undefined) {
    body.startDate = input.startDate;
  }
  if (input.dueDate !== undefined) {
    body.dueDate = input.dueDate;
  }
  if (input.targetMemberIds !== undefined) {
    body.targetMemberIds = input.targetMemberIds;
  }
  if (input.ledgerId !== undefined) {
    body.ledgerId = Number(input.ledgerId);
  }
  await request<DuesUpdateResponse>(`/api/v1/dues/${duesId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteDues(duesId: string): Promise<void> {
  await request<void>(`/api/v1/dues/${duesId}`, { method: 'DELETE' });
}

type DuesCloseResponse = {
  duesId: number;
  status: DuesStatus;
  paidCount: number;
  targetCount: number;
  totalCollectedAmount: number;
  ledgerId: number;
  generatedEntryId: number;
  closedAt: string;
};

export async function closeDues(duesId: string): Promise<void> {
  await request<DuesCloseResponse>(`/api/v1/dues/${duesId}/close`, {
    method: 'POST',
  });
}

export type DuesMembersParams = {
  status?: PaymentStatus;
  keyword?: string;
};

export async function getDuesMembers(
  duesId: string,
  params: DuesMembersParams = {},
): Promise<DuesMember[]> {
  const query = new URLSearchParams();
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.keyword) {
    query.set('keyword', params.keyword);
  }
  const queryString = query.toString();
  const response = await request<DuesMemberResponse[]>(
    `/api/v1/dues/${duesId}/members${queryString ? `?${queryString}` : ''}`,
    { method: 'GET' },
  );
  return response.map(toDuesMember);
}

export type UpdateDuesMembersStatusResult = {
  changedCount: number;
  paidCount: number;
  unpaidCount: number;
};

type DuesMembersStatusUpdateResponse = {
  duesId: number;
  changedCount: number;
  status: PaymentStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  totalCollectedAmount: number;
};

export async function updateDuesMembersPaymentStatus(
  duesId: string,
  memberIds: string[],
  status: PaymentStatus,
): Promise<UpdateDuesMembersStatusResult> {
  const response = await request<DuesMembersStatusUpdateResponse>(
    `/api/v1/dues/${duesId}/members`,
    {
      method: 'PATCH',
      body: JSON.stringify({ memberIds: memberIds.map(Number), status }),
    },
  );
  return {
    changedCount: response.changedCount,
    paidCount: response.paidCount,
    unpaidCount: response.unpaidCount,
  };
}
