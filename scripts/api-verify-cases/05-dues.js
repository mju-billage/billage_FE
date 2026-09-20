/** 5단계 — 회비: 생성, 목록, 상세, 납부 상태, 마감. groupId 6 전용.
 * 회비는 장부(ledgerId)와 대상자(Member 도메인, GroupMembership과 다름)가 필요해
 * 먼저 장부 1개 + 멤버 1명을 만들고 시작한다. */
function isoDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

module.exports = {
  stage: '5단계 — 회비',
  cases: [
    {
      name: 'dues-setup-ledger',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/ledgers`,
      body: () => ({ name: 'API검증장부-회비', folderId: null }),
      expectStatus: 201,
      expectFields: ['data.ledgerId'],
      after: (ctx, parsed) => {
        ctx.duesLedgerId = String(parsed.data.ledgerId);
      },
    },
    {
      name: 'dues-setup-member',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/members`,
      body: () => ({ name: 'API검증회원' }),
      expectStatus: 201,
      expectFields: ['data.memberId'],
      after: (ctx, parsed) => {
        ctx.duesMemberId = String(parsed.data.memberId);
      },
    },
    {
      name: 'dues-create',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/dues`,
      body: ctx => ({
        title: 'API검증회비',
        amount: 5000,
        startDate: isoDate(0),
        dueDate: isoDate(7),
        targetMemberIds: [Number(ctx.duesMemberId)],
        ledgerId: Number(ctx.duesLedgerId),
      }),
      expectStatus: 201,
      expectFields: ['data.duesId', 'data.title', 'data.targetCount'],
      after: (ctx, parsed) => {
        ctx.duesId = String(parsed.data.duesId);
      },
    },
    {
      name: 'dues-list',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/dues`,
      expectStatus: 200,
    },
    {
      name: 'dues-detail',
      method: 'GET',
      path: ctx => `/api/v1/dues/${ctx.duesId}`,
      expectStatus: 200,
      expectFields: ['data.duesId', 'data.title', 'data.targetCount'],
    },
    {
      name: 'dues-members-list',
      method: 'GET',
      path: ctx => `/api/v1/dues/${ctx.duesId}/members`,
      expectStatus: 200,
      expectFields: ['data[0].memberId', 'data[0].status'],
    },
    {
      name: 'dues-update-title',
      method: 'PATCH',
      path: ctx => `/api/v1/dues/${ctx.duesId}`,
      body: () => ({ title: 'API검증회비-수정' }),
      expectStatus: 200,
    },
    {
      name: 'dues-members-payment-bulk-update',
      method: 'PATCH',
      path: ctx => `/api/v1/dues/${ctx.duesId}/members`,
      body: ctx => ({ memberIds: [Number(ctx.duesMemberId)], status: 'PAID' }),
      expectStatus: 200,
      expectFields: ['data.changedCount', 'data.paidCount'],
    },
    {
      name: 'dues-member-individual-payment-update',
      method: 'PATCH',
      path: ctx => `/api/v1/dues/${ctx.duesId}/members/${ctx.duesMemberId}`,
      body: () => ({ status: 'UNPAID' }),
      expectStatus: 200,
    },
    {
      name: 'dues-close',
      method: 'POST',
      path: ctx => `/api/v1/dues/${ctx.duesId}/close`,
      expectStatus: 200,
    },
    // --- 정리 ---
    {
      name: 'cleanup-delete-dues',
      method: 'DELETE',
      path: ctx => `/api/v1/dues/${ctx.duesId}`,
      expectStatus: 204,
    },
    {
      name: 'cleanup-delete-member',
      method: 'DELETE',
      path: ctx => `/api/v1/groups/${ctx.groupId}/members/${ctx.duesMemberId}`,
      expectStatus: 204,
    },
    {
      name: 'cleanup-delete-ledger',
      method: 'DELETE',
      path: ctx => `/api/v1/ledgers/${ctx.duesLedgerId}`,
      expectStatus: 204,
    },
  ],
};
