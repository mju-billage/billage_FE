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
