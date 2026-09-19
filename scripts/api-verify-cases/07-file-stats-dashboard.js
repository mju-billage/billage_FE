/** 7단계 — 파일·통계·대시보드. groupId 6 전용.
 * 파일 업로드(`POST /files`)는 multipart/form-data라 이 엔진(JSON 바디 전용, `Buffer.from(
 * JSON.stringify(...), 'utf8')` 경로만 지원)으로는 실호출을 못 만든다 — SKIP 처리하고
 * 사유를 남긴다(이미 이전 라운드에 실기기로 O 확인된 상태라 회귀 위험은 낮다). 나머지
 * 3개(통계/대시보드/캘린더)는 실제로 호출한다. */
module.exports = {
  stage: '7단계 — 파일·통계·대시보드',
  cases: [
    {
      name: 'file-upload',
      skip: 'multipart/form-data 업로드 — 이 엔진은 JSON 바디만 지원(api-call.js 설계 자체가 Buffer.from(JSON, utf8) 경로 전용). 실기기 수동 검증 필요(이전 라운드에 O 확인됨, docs/api-wiring.md 참고)',
    },
    {
      name: 'file-content-get',
      skip: '직접 호출하는 서비스 함수가 없다(<Image> src에 인증 헤더만 붙여 씀) — 유효한 fileId가 있어야 의미 있는데 업로드가 SKIP이라 fileId를 못 만든다',
    },
    {
      name: 'file-delete',
      skip: '호출부 자체가 앱에 없다(설계상 죽은 함수) — 위와 같은 이유로 유효한 fileId 없이는 의미 있는 호출 불가',
    },
    {
      name: 'statistics-get',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/statistics`,
      expectStatus: 200,
      expectFields: ['data.expenseShare'],
    },
    {
      name: 'dashboard-get',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/dashboard`,
      expectStatus: 200,
    },
    {
      name: 'dashboard-calendar-get',
      method: 'GET',
      path: ctx => {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return `/api/v1/groups/${ctx.groupId}/calendar?yearMonth=${yearMonth}`;
      },
      expectStatus: 200,
    },
    {
      name: 'receipts-get',
      method: 'GET',
      // groupId 6에 남아있는 기존 장부(25/26)를 그대로 쓴다 — 조회만 하므로 부작용 없음.
      path: () => `/api/v1/groups/6/receipts?ledgerIds=25&ledgerIds=26`,
      expectStatus: 200,
    },
  ],
};
