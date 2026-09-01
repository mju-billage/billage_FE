import type { FolderNode } from '../types/folderTree';
import type { LedgerSummary } from '../types/ledger';

/** `GET /groups/{groupId}/folders` 응답의 폴더 노드 하나(원본, 변환 전). */
export type RawFolderNode = {
  folderId: number;
  name: string;
  parentFolderId: number | null;
  childFolders: RawFolderNode[];
  ledgerCount: number;
};

/**
 * 서버가 내려준 재귀 트리를 캐시 타입(`FolderNode`)으로 변환한다.
 *
 * 순환 참조 방어: `folderId`는 서버 DB의 고유 값이라 정상적인 트리라면 같은 id가
 * 두 번 나타날 수 없다 — 나타난다면 순환 참조이거나 손상된 응답이다. 방문한 id를
 * 추적해 두 번째 등장부터는 그 하위로 내려가지 않고 잘라낸다(하위 없이 노드만 남김).
 * 이 한 지점에서만 방어하면 되고, 변환 후의 트리를 쓰는 다른 함수(`findFolderNode`
 * 등)는 항상 비순환 구조라고 가정해도 된다.
 */
export function buildFolderTree(
  raw: RawFolderNode[],
  visited: Set<number> = new Set(),
): FolderNode[] {
  return raw.map(node => {
    const isCycle = visited.has(node.folderId);
    visited.add(node.folderId);
    return {
      id: String(node.folderId),
      parentId:
        node.parentFolderId != null ? String(node.parentFolderId) : null,
      name: node.name,
      ledgerCount: node.ledgerCount,
      children: isCycle ? [] : buildFolderTree(node.childFolders, visited),
    };
  });
}

/** 트리 전체에서 folderId로 노드 하나를 찾는다(깊이 우선 탐색). */
export function findFolderNode(
  tree: FolderNode[],
  folderId: string,
): FolderNode | undefined {
  for (const node of tree) {
    if (node.id === folderId) {
      return node;
    }
    const found = findFolderNode(node.children, folderId);
    if (found) {
      return found;
    }
  }
  return undefined;
}

/** 특정 폴더의 직계 하위 폴더 목록. parentId가 null이면 최상위 폴더 목록. */
export function getChildFolders(
  tree: FolderNode[],
  parentId: string | null,
): FolderNode[] {
  if (parentId === null) {
    return tree;
  }
  return findFolderNode(tree, parentId)?.children ?? [];
}

/** 트리에 있는 모든 폴더의 id를 평탄화한다(폴더별 장부 조회를 병렬로 돌릴 대상 목록). */
export function flattenFolderIds(tree: FolderNode[]): string[] {
  const ids: string[] = [];
  const walk = (nodes: FolderNode[]) => {
    for (const node of nodes) {
      ids.push(node.id);
      walk(node.children);
    }
  };
  walk(tree);
  return ids;
}

/** 폴더 화면에 표시할 항목 하나(폴더 또는 장부) — 두 도메인을 한 목록으로 섞어 보여줄 때 쓴다. */
export type FolderListItem =
  | { kind: 'folder'; id: string; name: string; itemCount: number }
  | { kind: 'ledger'; id: string; name: string; budget: number | null };

/**
 * 한 폴더 화면(현재 폴더의 하위 폴더 + 그 폴더 직속 장부)을 하나의 목록으로 합친다.
 * 이름 오름차순으로 정렬한다 — 서버가 폴더/장부 각각은 이름순으로 주지만 두 목록을
 * 합치면 순서가 깨지므로 다시 정렬해야 한다. 화면 컴포넌트가 아니라 여기서 조립하는
 * 이유: 트리 조립 로직은 화면에 두지 않는다(폴더 화면 3개가 같은 조립 규칙을 공유).
 *
 * 폴더의 `itemCount`(하위 폴더 수 + 직속 장부 수)는 트리 응답에 이미 있는
 * `children.length`/`ledgerCount`로만 계산한다 — 폴더마다 추가 조회가 필요 없다.
 */
export function mergeFolderListItems(
  childFolders: FolderNode[],
  ledgers: LedgerSummary[],
): FolderListItem[] {
  const items: FolderListItem[] = [
    ...childFolders.map(
      (folder): FolderListItem => ({
        kind: 'folder',
        id: folder.id,
        name: folder.name,
        itemCount: folder.children.length + folder.ledgerCount,
      }),
    ),
    ...ledgers.map(
      (ledger): FolderListItem => ({
        kind: 'ledger',
        id: ledger.id,
        name: ledger.name,
        budget: ledger.budget,
      }),
    ),
  ];
  return items.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}
