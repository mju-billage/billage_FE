/** 4단계 — 내역: 생성, 목록, 상세, 수정, 승인, 삭제. groupId 6 전용.
 * 승인(approve) 엔드포인트를 제대로 테스트하려면 PENDING 상태 내역이 필요한데,
 * userId 6(총무)이 만들면 즉시 APPROVED라 승인할 게 없다 — 그래서 일반 멤버
 * 계정(userId 9, member of group 6)으로 잠깐 로그인해 PENDING 내역을 만든 뒤
 * 다시 총무 토큰으로 돌아와 승인한다(virtual 케이스로 토큰만 교체, HTTP 호출 없음). */
const { login } = require('../api-call.js');

const MEMBER_EMAIL = 'billage.verify.newcheck9999@example.com';
const MEMBER_PASSWORD = 'Password123!';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = {
  stage: '4단계 — 내역',
  cases: [
    {
      name: 'entry-setup-ledger',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/ledgers`,
      body: () => ({ name: 'API검증장부-내역', folderId: null }),
      expectStatus: 201,
      expectFields: ['data.ledgerId'],
      after: (ctx, parsed) => {
        ctx.ledgerId = String(parsed.data.ledgerId);
        ctx.ownerAccessToken = ctx.accessToken;
      },
    },
    {
      name: 'entry-list-empty',
      method: 'GET',
      path: ctx => `/api/v1/ledgers/${ctx.ledgerId}/entries`,
      expectStatus: 200,
    },
    {
      name: 'entry-create-owner-auto-approved',
      method: 'POST',
      path: ctx => `/api/v1/ledgers/${ctx.ledgerId}/entries`,
      body: () => ({
        type: 'EXPENSE',
        title: 'API검증지출',
        amount: 1000,
        occurredOn: todayIso(),
      }),
      expectStatus: 201,
      expectFields: ['data.entryId', 'data.approvalStatus'],
      after: (ctx, parsed) => {
        ctx.ownerEntryId = String(parsed.data.entryId);
        if (parsed.data.approvalStatus !== 'APPROVED') {
          throw new Error(`총무가 만든 내역인데 approvalStatus가 APPROVED가 아님: ${parsed.data.approvalStatus}`);
        }
      },
    },
    {
      name: 'entry-detail',
      method: 'GET',
      path: ctx => `/api/v1/entries/${ctx.ownerEntryId}`,
      expectStatus: 200,
      expectFields: ['data.entryId', 'data.title', 'data.amount'],
    },
    {
      name: 'entry-update',
      method: 'PATCH',
      path: ctx => `/api/v1/entries/${ctx.ownerEntryId}`,
      body: () => ({ title: 'API검증지출-수정' }),
      expectStatus: 200,
    },
    {
      name: 'entry-group-list',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/entries`,
      expectStatus: 200,
    },
    {
      name: 'entry-login-as-member',
      virtual: async ctx => {
        ctx.accessToken = await login(MEMBER_EMAIL, MEMBER_PASSWORD);
      },
    },
    {
      name: 'entry-create-member-pending',
      method: 'POST',
      path: ctx => `/api/v1/ledgers/${ctx.ledgerId}/entries`,
      body: () => ({
        type: 'INCOME',
        title: 'API검증수입-일반회원',
        amount: 2000,
        occurredOn: todayIso(),
      }),
      expectStatus: 201,
      expectFields: ['data.entryId', 'data.approvalStatus'],
      after: (ctx, parsed) => {
        ctx.memberEntryId = String(parsed.data.entryId);
        if (parsed.data.approvalStatus !== 'PENDING') {
          throw new Error(`일반 회원이 만든 내역인데 approvalStatus가 PENDING이 아님: ${parsed.data.approvalStatus}`);
        }
      },
    },
    {
      name: 'entry-restore-owner-token',
      virtual: ctx => {
        ctx.accessToken = ctx.ownerAccessToken;
      },
    },
    {
      name: 'entry-approve',
      method: 'POST',
      path: ctx => `/api/v1/entries/${ctx.memberEntryId}/approve`,
      expectStatus: 200,
      expectFields: ['data.entryId', 'data.approvalStatus', 'data.approvedByUserId', 'data.approvedAt'],
    },
    {
      name: 'entry-approve-again-should-409',
      method: 'POST',
      path: ctx => `/api/v1/entries/${ctx.memberEntryId}/approve`,
      expectStatus: 409,
    },
    // --- 정리 ---
    {
      name: 'cleanup-delete-owner-entry',
      method: 'DELETE',
      path: ctx => `/api/v1/entries/${ctx.ownerEntryId}`,
      expectStatus: 204,
    },
    {
      name: 'cleanup-delete-member-entry',
      method: 'DELETE',
      path: ctx => `/api/v1/entries/${ctx.memberEntryId}`,
      expectStatus: 204,
    },
    {
      name: 'cleanup-delete-ledger',
      method: 'DELETE',
      path: ctx => `/api/v1/ledgers/${ctx.ledgerId}`,
      expectStatus: 204,
    },
  ],
};
