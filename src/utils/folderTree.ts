import type { FolderNode } from '../types/folderTree';
import type { LedgerSummary } from '../types/ledger';

export type RawFolderNode = {
  folderId: number;
  name: string;
  parentFolderId: number | null;
  childFolders: RawFolderNode[];
  ledgerCount: number;
};

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

export function getChildFolders(
  tree: FolderNode[],
  parentId: string | null,
): FolderNode[] {
  if (parentId === null) {
    return tree;
  }
  return findFolderNode(tree, parentId)?.children ?? [];
}

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

export type FolderListItem =
  | { kind: 'folder'; id: string; name: string; itemCount: number }
  | { kind: 'ledger'; id: string; name: string; budget: number | null };

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
