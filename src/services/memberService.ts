import { request } from './apiClient';
import type { Member, MemberDetail, MemberPayment } from '../types/member';

type MemberResponse = {
  memberId: number;
  name: string;
  phoneNumber: string | null;
  tags: string[];
  memo: string | null;
  createdAt: string;
};

type MemberDetailResponse = MemberResponse & { totalPaidAmount: number };

type MemberPaymentItemResponse = {
  duesId: number;
  duesTitle: string;
  ledgerId: number;
  ledgerName: string;
  amount: number;
  paidAt: string;
};

type MemberPaymentsResponse = {
  totalPaidAmount: number;
  payments: MemberPaymentItemResponse[];
};

function toMember(groupId: string, response: MemberResponse): Member {
  return {
    memberId: String(response.memberId),
    groupId,
    name: response.name,
    phoneNumber: response.phoneNumber,
    tags: response.tags,
    memo: response.memo,
    createdAt: response.createdAt,
  };
}

function toMemberDetail(groupId: string, response: MemberDetailResponse): MemberDetail {
  return {
    ...toMember(groupId, response),
    totalPaidAmount: response.totalPaidAmount,
  };
}

function toMemberPayment(response: MemberPaymentItemResponse): MemberPayment {
  return {
    duesId: String(response.duesId),
    duesTitle: response.duesTitle,
    ledgerId: String(response.ledgerId),
    ledgerName: response.ledgerName,
    amount: response.amount,
    paidAt: response.paidAt,
  };
}

export async function getMembers(
  groupId: string,
  keyword?: string,
): Promise<Member[]> {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  const response = await request<MemberResponse[]>(
    `/api/v1/groups/${groupId}/members${query}`,
    { method: 'GET' },
  );
  return response.map(item => toMember(groupId, item));
}

export type CreateMemberInput = {
  name: string;
  phoneNumber?: string;
  tags?: string[];
  memo?: string;
};

export async function createMember(
  groupId: string,
  input: CreateMemberInput,
): Promise<Member> {
  const response = await request<MemberResponse>(
    `/api/v1/groups/${groupId}/members`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        phoneNumber: input.phoneNumber,
        tags: input.tags,
        memo: input.memo,
      }),
    },
  );
  return toMember(groupId, response);
}

export async function createMembersBulk(
  groupId: string,
  names: string,
): Promise<Member[]> {
  const response = await request<MemberResponse[]>(
    `/api/v1/groups/${groupId}/members/bulk`,
    { method: 'POST', body: JSON.stringify({ names }) },
  );
  return response.map(item => toMember(groupId, item));
}

export async function getMemberDetail(
  groupId: string,
  memberId: string,
): Promise<MemberDetail> {
  const response = await request<MemberDetailResponse>(
    `/api/v1/groups/${groupId}/members/${memberId}`,
    { method: 'GET' },
  );
  return toMemberDetail(groupId, response);
}

export async function updateMember(
  groupId: string,
  memberId: string,
  input: CreateMemberInput,
): Promise<Member> {
  const response = await request<MemberResponse>(
    `/api/v1/groups/${groupId}/members/${memberId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        name: input.name,
        phoneNumber: input.phoneNumber,
        tags: input.tags,
        memo: input.memo,
      }),
    },
  );
  return toMember(groupId, response);
}

export async function deleteMember(groupId: string, memberId: string): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

export async function deleteMembersBulk(
  groupId: string,
  memberIds: string[],
): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}/members`, {
    method: 'DELETE',
    body: JSON.stringify({ memberIds: memberIds.map(Number) }),
  });
}

export type MemberPaymentParams = {
  from?: string;
  to?: string;
};

export type MemberPaymentResult = {
  totalPaidAmount: number;
  items: MemberPayment[];
};

export async function getMemberPayments(
  groupId: string,
  memberId: string,
  params: MemberPaymentParams = {},
): Promise<MemberPaymentResult> {
  const query = new URLSearchParams();
  if (params.from) {
    query.set('from', params.from);
  }
  if (params.to) {
    query.set('to', params.to);
  }
  const queryString = query.toString();

  const response = await request<MemberPaymentsResponse>(
    `/api/v1/groups/${groupId}/members/${memberId}/payments${
      queryString ? `?${queryString}` : ''
    }`,
    { method: 'GET' },
  );
  return {
    totalPaidAmount: response.totalPaidAmount,
    items: response.payments.map(toMemberPayment),
  };
}
