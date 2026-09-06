import { request } from './apiClient';
import { buildFolderTree } from '../utils/folderTree';
import type { RawFolderNode } from '../utils/folderTree';
import { setFolderTree } from '../types/folderTree';
import type { FolderNode } from '../types/folderTree';

/**
 * 모임의 폴더 트리 전체를 조회한다. 서버가 최상위부터 재귀 중첩 구조로 한 번에
 * 내려주므로 트리 깊이·크기와 무관하게 이 호출 한 번으로 끝난다 — 장부는 포함되지
 * 않으므로 화면에서 실제로 보여줄 때는 `ledgerService.getLedgersInFolder()`를
 * 폴더별로 따로 불러야 한다.
 */
export async function getFolderTree(groupId: string): Promise<FolderNode[]> {
  const response = await request<RawFolderNode[]>(
    `/api/v1/groups/${groupId}/folders`,
    { method: 'GET' },
  );
  const tree = buildFolderTree(response);
  setFolderTree(groupId, tree);
  return tree;
}

/**
 * 새 폴더를 생성한다. 캐시는 직접 patch하지 않는다 — 호출자가 성공 후
 * `getFolderTree()`로 다시 불러 화면을 갱신한다(3-B "쓰기 후 캐시 갱신" 표준 패턴,
 * docs/api-integration-plan.md 참고). 트리 조회가 모임당 1콜이라 재조회 비용이 낮고,
 * 응답을 patch하는 방식보다 정확성이 높다(다른 필드가 그 사이 바뀌었을 가능성 배제).
 */
export async function createFolder(
  groupId: string,
  name: string,
  parentFolderId: string | null,
): Promise<void> {
  await request<void>(`/api/v1/groups/${groupId}/folders`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      parentFolderId: parentFolderId != null ? Number(parentFolderId) : null,
    }),
  });
}

/**
 * 폴더 이름 변경·이동을 한 엔드포인트로 처리한다(Folder.txt "3. 폴더 수정").
 * `updates`에 없는 키는 아예 보내지 않는다 — `parentFolderId`를 안 보내면 현재
 * 위치 유지, `null`로 보내면 최상위로 이동(서버가 이렇게 구분한다). 이름만 바꿀
 * 땐 `{ name }`만, 이동만 할 땐 `{ parentFolderId }`만 넘기면 된다.
 */
export async function updateFolder(
  folderId: string,
  updates: { name?: string; parentFolderId?: string | null },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (updates.name !== undefined) {
    body.name = updates.name;
  }
  if ('parentFolderId' in updates) {
    body.parentFolderId =
      updates.parentFolderId != null ? Number(updates.parentFolderId) : null;
  }
  await request<void>(`/api/v1/folders/${folderId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * 폴더를 해제한다. ⚠️ 호출 전 반드시 화면에서 안전한지 확인해라 — 최상위 폴더에
 * 직속 장부가 있는 상태로 해제하면 그 장부가 `folderId: null`이 되는데, 최상위
 * 장부를 조회하는 API가 없어(docs/api-gaps.md (C)) 다시 찾을 방법이 없다.
 * `FolderScreen`이 이 조건(현재 폴더의 `parentId === null && ledgerCount > 0`)을
 * 미리 검사해 위험할 땐 아예 호출하지 않는다 — 여기서는 막지 않는다.
 */
export async function deleteFolder(folderId: string): Promise<void> {
  await request<void>(`/api/v1/folders/${folderId}`, { method: 'DELETE' });
}

export type FolderItemEntry = {
  itemType: 'FOLDER' | 'LEDGER';
  id: string;
  name: string;
  /** 폴더만 채워진다(하위 폴더+장부 합계). 장부는 null(Folder.txt). */
  childCount: number | null;
  createdAt: string;
};

export type FolderItemsResult = {
  totalCount: number;
  items: FolderItemEntry[];
};

/**
 * 폴더와 장부를 한 그리드로 섞어 조회한다(Folder.txt "6. 폴더+장부 통합 조회"
 * — 2026-09-05 실호출로 명세 "미구현" 태그가 낡았음을 확인, `docs/api-gaps.md`
 * "확정됨" 6번). `folderId`를 생략하면 최상위, 넘기면 그 폴더 바로 아래
 * 항목만 온다 — **`parentId`가 아니라 `folderId`다**(실호출로 확인, 처음엔
 * 문서 없이 짐작하다 틀렸었다). `keyword`는 이 함수가 조회한 그 레벨
 * 안에서만 검색된다(하위 폴더까지 재귀 검색하지 않음). 페이지네이션이 없다
 * — `totalCount`/`items` 그대로 한 번에 온다.
 */
export async function getFolderItems(
  groupId: string,
  params: { folderId?: string; keyword?: string } = {},
): Promise<FolderItemsResult> {
  const query = new URLSearchParams();
  if (params.folderId) {
    query.set('folderId', params.folderId);
  }
  if (params.keyword) {
    query.set('keyword', params.keyword);
  }
  const queryString = query.toString();

  const response = await request<{
    totalCount: number;
    items: {
      itemType: 'FOLDER' | 'LEDGER';
      id: number;
      name: string;
      childCount: number | null;
      createdAt: string;
    }[];
  }>(`/api/v1/groups/${groupId}/folder-items${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
  return {
    totalCount: response.totalCount,
    items: response.items.map(item => ({
      itemType: item.itemType,
      id: String(item.id),
      name: item.name,
      childCount: item.childCount,
      createdAt: item.createdAt,
    })),
  };
}

export type MoveFolderItemsInput = {
  folderIds: string[];
  ledgerIds: string[];
  /** `null`이면 최상위 영역으로 이동한다(장부도 허용 — Folder.txt §7, 2026-09-05
   * 실호출로 장부를 최상위로 옮긴 뒤 `folder-items` 루트 조회에 그대로 나타남을
   * 확인했다). */
  targetFolderId: string | null;
};

export type MoveFolderItemsResult = {
  movedFolderCount: number;
  movedLedgerCount: number;
  targetFolderId: string | null;
  targetFolderName: string | null;
};

/**
 * 폴더·장부 여러 개를 한 번에 다른 폴더(또는 최상위)로 옮긴다(Folder.txt
 * "7. 폴더·장부 선택 이동" — 2026-09-05 실호출로 명세 "미구현" 태그가
 * 낡았음을 확인, `docs/api-gaps.md` "확정됨" 6번). 서버가 한 트랜잭션으로
 * 처리한다 — 하나라도 실패하면 전부 취소되고 에러를 던진다(예: 목적지가
 * 이동 대상 폴더 자신이거나 그 하위면 `409 INVALID_PARENT_FOLDER`).
 *
 * ⚠️ 이 원자성은 가정이 아니라 실호출로 직접 검증했다(2026-09-05, 7-F):
 * 유효한 폴더 1개 + 존재하지 않는 폴더 ID를 같이 보내 `404 FOLDER_NOT_FOUND`를
 * 받은 뒤 `GET .../folder-items`로 확인한 결과, 유효했던 폴더도 그대로
 * 원위치에 남아 있었다(부분 이동 없음). 그래서 `FolderMoveDestinationScreen`이
 * 예전에 쓰던 "성공 N개·실패 M개" 순차 호출·부분 성공 집계 로직이 필요 없다
 * — 성공하면 전부 성공, 실패하면 전부 무효다.
 */
export async function moveFolderItems(
  groupId: string,
  input: MoveFolderItemsInput,
): Promise<MoveFolderItemsResult> {
  const response = await request<{
    movedFolderCount: number;
    movedLedgerCount: number;
    targetFolderId: number | null;
    targetFolderName: string | null;
  }>(`/api/v1/groups/${groupId}/folder-items/move`, {
    method: 'POST',
    body: JSON.stringify({
      folderIds: input.folderIds.map(Number),
      ledgerIds: input.ledgerIds.map(Number),
      targetFolderId: input.targetFolderId != null ? Number(input.targetFolderId) : null,
    }),
  });
  return {
    movedFolderCount: response.movedFolderCount,
    movedLedgerCount: response.movedLedgerCount,
    targetFolderId:
      response.targetFolderId != null ? String(response.targetFolderId) : null,
    targetFolderName: response.targetFolderName,
  };
}
