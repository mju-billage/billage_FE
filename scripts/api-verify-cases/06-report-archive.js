/** 6단계 — 보고서·보관: 생성(장부별/기간별), 조회, 상세, 보관 생성/조회/수정/삭제.
 * groupId 6 전용. 보고서는 삭제 API가 없어(report-controller 3개뿐) 만든 보고서
 * 2건은 정리할 수 없다 — 기존에도 다른 테스트 그룹(groupId 5)에 같은 이유로 쌓여
 * 있던 전례가 있어 같은 방식으로 둔다.
 *
 * 보관(archive) 생성은 그룹의 "모든 장부"를 보관 처리해 활성 폴더 트리에서
 * 제거한다(이미 여러 라운드에 걸쳐 확인된 사양) — 이 단계에서 만든 장부가
 * 그 대상이 된다. groupId 6은 검증 전용 그룹이라 이 부수효과를 감수한다. */
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = {
  stage: '6단계 — 보고서·보관',
  cases: [
    {
      name: 'report-setup-ledger',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/ledgers`,
      body: () => ({ name: 'API검증장부-보고서', folderId: null }),
      expectStatus: 201,
      expectFields: ['data.ledgerId'],
      after: (ctx, parsed) => {
        ctx.reportLedgerId = String(parsed.data.ledgerId);
      },
    },
    {
      name: 'report-setup-entry',
      method: 'POST',
      path: ctx => `/api/v1/ledgers/${ctx.reportLedgerId}/entries`,
      body: () => ({
        type: 'EXPENSE',
        title: 'API검증지출-보고서용',
        amount: 3000,
        occurredOn: todayIso(),
      }),
      expectStatus: 201,
      expectFields: ['data.entryId'],
    },
    {
      name: 'report-list',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/reports`,
      expectStatus: 200,
    },
    {
      name: 'report-create-by-ledger',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/reports`,
      body: ctx => ({
        reportType: 'BY_LEDGER',
        title: 'API검증보고서-장부별',
        ledgerIds: [Number(ctx.reportLedgerId)],
      }),
      expectStatus: 201,
      expectFields: ['data.reportId', 'data.reportType'],
      after: (ctx, parsed) => {
        ctx.reportIdByLedger = String(parsed.data.reportId);
      },
    },
    {
      name: 'report-detail-by-ledger',
      method: 'GET',
      path: ctx => `/api/v1/reports/${ctx.reportIdByLedger}`,
      expectStatus: 200,
      expectFields: ['data.reportId', 'data.ledgers'],
    },
    {
      name: 'report-create-by-period',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/reports`,
      body: () => ({
        reportType: 'BY_PERIOD',
        title: 'API검증보고서-기간별',
        startDate: todayIso(),
        endDate: todayIso(),
      }),
      expectStatus: 201,
      expectFields: ['data.reportId', 'data.reportType'],
      after: (ctx, parsed) => {
        ctx.reportIdByPeriod = String(parsed.data.reportId);
      },
    },
    {
      name: 'report-detail-by-period',
      method: 'GET',
      path: ctx => `/api/v1/reports/${ctx.reportIdByPeriod}`,
      expectStatus: 200,
      expectFields: ['data.reportId', 'data.ledgers'],
    },
    {
      name: 'archive-list',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/archives`,
      expectStatus: 200,
    },
    {
      name: 'archive-create',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/archives`,
      body: () => ({ title: 'API검증보관' }),
      expectStatus: 201,
      expectFields: ['data.archiveId', 'data.title'],
      after: (ctx, parsed) => {
        ctx.archiveId = String(parsed.data.archiveId);
      },
    },
    {
      name: 'archive-detail',
      method: 'GET',
      path: ctx => `/api/v1/archives/${ctx.archiveId}`,
      expectStatus: 200,
      expectFields: ['data.archiveId', 'data.ledgers'],
    },
    {
      name: 'archive-update-title',
      method: 'PATCH',
      path: ctx => `/api/v1/archives/${ctx.archiveId}`,
      body: () => ({ title: 'API검증보관-수정' }),
      expectStatus: 200,
    },
    // --- 정리: 보관 기록만 지운다(보고서는 삭제 API 자체가 없음, 위 설명 참고) ---
    {
      name: 'cleanup-delete-archive',
      method: 'DELETE',
      path: ctx => `/api/v1/archives/${ctx.archiveId}`,
      expectStatus: 204,
    },
  ],
};
