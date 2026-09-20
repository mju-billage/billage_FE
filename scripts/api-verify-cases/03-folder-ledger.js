/** 3단계 — 폴더·장부: 생성(폴더 안/최상위), 목록, folder-items, 이동, 수정, 삭제.
 * groupId 6("탈퇴테스트모임") 전용. 끝에서 만든 데이터를 전부 정리한다(순서 중요 —
 * 장부를 먼저 지우고 폴더를 지운다, 폴더 삭제가 안의 장부를 자동 정리하는지는
 * 검증 대상이 아니라 순서로 안전하게 간다). */
module.exports = {
  stage: '3단계 — 폴더·장부',
  cases: [
    {
      name: 'folder-create',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/folders`,
      body: () => ({ name: 'API검증폴더', parentFolderId: null }),
      expectStatus: 201,
      expectFields: ['data.folderId', 'data.name'],
      after: (ctx, parsed) => {
        ctx.folderId = String(parsed.data.folderId);
      },
    },
    {
      name: 'folder-tree',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/folders`,
      expectStatus: 200,
    },
    {
      name: 'folder-items',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/folder-items`,
      expectStatus: 200,
      expectFields: ['data.totalCount', 'data.items'],
    },
    {
      name: 'folder-update-rename',
      method: 'PATCH',
      path: ctx => `/api/v1/folders/${ctx.folderId}`,
      body: () => ({ name: 'API검증폴더-수정' }),
      expectStatus: 200,
    },
    {
      name: 'ledger-create-in-folder',
      method: 'POST',
      path: ctx => `/api/v1/folders/${ctx.folderId}/ledgers`,
      body: () => ({ name: 'API검증장부-폴더안' }),
      expectStatus: 201,
      expectFields: ['data.ledgerId', 'data.name'],
      after: (ctx, parsed) => {
        ctx.ledgerId = String(parsed.data.ledgerId);
      },
    },
    {
      name: 'ledger-create-top-level',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/ledgers`,
      body: () => ({ name: 'API검증장부-최상위', folderId: null }),
      expectStatus: 201,
      expectFields: ['data.ledgerId', 'data.name'],
      after: (ctx, parsed) => {
        ctx.topLedgerId = String(parsed.data.ledgerId);
      },
    },
    {
      name: 'ledger-list-in-folder',
      method: 'GET',
      path: ctx => `/api/v1/folders/${ctx.folderId}/ledgers`,
      expectStatus: 200,
    },
    {
      name: 'ledger-list-all-flat',
      method: 'GET',
      path: ctx => `/api/v1/groups/${ctx.groupId}/ledgers`,
      expectStatus: 200,
    },
    {
      name: 'ledger-detail',
      method: 'GET',
      path: ctx => `/api/v1/ledgers/${ctx.ledgerId}`,
      expectStatus: 200,
      expectFields: ['data.ledgerId', 'data.name'],
    },
    {
      name: 'ledger-update-rename',
      method: 'PATCH',
      path: ctx => `/api/v1/ledgers/${ctx.ledgerId}`,
      body: () => ({ name: 'API검증장부-폴더안-수정' }),
      expectStatus: 200,
    },
    {
      name: 'ledger-update-budget',
      method: 'PATCH',
      path: ctx => `/api/v1/ledgers/${ctx.ledgerId}/budget`,
      body: () => ({ budget: 100000 }),
      expectStatus: 200,
    },
    {
      name: 'folder-items-move-top-level-ledger-into-folder',
      method: 'POST',
      path: ctx => `/api/v1/groups/${ctx.groupId}/folder-items/move`,
      body: ctx => ({
        folderIds: [],
        ledgerIds: [Number(ctx.topLedgerId)],
        targetFolderId: Number(ctx.folderId),
      }),
      expectStatus: 200,
      expectFields: ['data.movedLedgerCount'],
    },
    // --- 정리: 이동으로 두 장부 다 folderId 안에 있음 → 장부 먼저 삭제 → 폴더 삭제 ---
    {
      name: 'cleanup-delete-ledger-1',
      method: 'DELETE',
      path: ctx => `/api/v1/ledgers/${ctx.ledgerId}`,
      expectStatus: 204,
    },
    {
      name: 'cleanup-delete-ledger-2',
      method: 'DELETE',
      path: ctx => `/api/v1/ledgers/${ctx.topLedgerId}`,
      expectStatus: 204,
    },
    {
      name: 'cleanup-delete-folder',
      method: 'DELETE',
      path: ctx => `/api/v1/folders/${ctx.folderId}`,
      expectStatus: 204,
    },
  ],
};
