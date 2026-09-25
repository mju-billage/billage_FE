export type FolderNode = {
  id: string;
  parentId: string | null;
  name: string;
  ledgerCount: number;
  children: FolderNode[];
};

let folderTreeByGroup: Record<string, FolderNode[]> = {};

export function setFolderTree(groupId: string, tree: FolderNode[]): void {
  folderTreeByGroup[groupId] = tree;
}

export function getCachedFolderTree(groupId: string): FolderNode[] {
  return folderTreeByGroup[groupId] ?? [];
}
