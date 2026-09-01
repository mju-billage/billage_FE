/**
 * 폴더 트리 노드(서버 캐시). `GET /groups/{groupId}/folders`가 모임의 폴더 전체를
 * 최상위부터 재귀 중첩 구조(`childFolders`)로 한 번에 내려주므로, 폴더 쪽은 트리
 * 깊이·크기와 무관하게 모임당 API 호출 1번으로 끝난다(`services/folderService.ts`).
 *
 * 장부는 이 트리에 포함되지 않는다 — 폴더별로 `GET /folders/{folderId}/ledgers`를
 * 따로 불러야 한다(`services/ledgerService.ts`, `types/ledger.ts`). 원본 응답 →
 * 이 타입 변환과 순환 참조 방어는 `utils/folderTree.ts`의 `buildFolderTree()`가
 * 담당한다 — 이 파일은 변환된 결과를 그대로 담는 순수 캐시다(실제 변경은
 * `folderService.ts`가 API 호출 후 아래 캐시 함수를 불러 반영한다).
 */
export type FolderNode = {
  id: string;
  parentId: string | null;
  name: string;
  /** 이 폴더에 직접 속한 장부 수(하위 폴더 미포함, 서버 값 그대로). */
  ledgerCount: number;
  children: FolderNode[];
};

// 모임별로 캐시한다(groupMembership.ts와 같은 이유 — 화면이 한 번에 한 모임만 본다).
let folderTreeByGroup: Record<string, FolderNode[]> = {};

/** folderService가 트리 조회에 성공하면 해당 모임의 캐시를 통째로 교체한다. */
export function setFolderTree(groupId: string, tree: FolderNode[]): void {
  folderTreeByGroup[groupId] = tree;
}

/** 캐시된 폴더 트리(최상위 폴더 배열)를 그대로 반환한다. 조회 전이면 빈 배열. */
export function getCachedFolderTree(groupId: string): FolderNode[] {
  return folderTreeByGroup[groupId] ?? [];
}
