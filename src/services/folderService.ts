import { request } from './apiClient';
import { buildFolderTree } from '../utils/folderTree';
import type { RawFolderNode } from '../utils/folderTree';
import { setFolderTree } from '../types/folderTree';
import type { FolderNode } from '../types/folderTree';

export async function getFolderTree(groupId: string): Promise<FolderNode[]> {
  const response = await request<RawFolderNode[]>(
    `/api/v1/groups/${groupId}/folders`,
    { method: 'GET' },
  );
  const tree = buildFolderTree(response);
  setFolderTree(groupId, tree);
  return tree;
}

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

export async function deleteFolder(folderId: string): Promise<void> {
  await request<void>(`/api/v1/folders/${folderId}`, { method: 'DELETE' });
}

export type FolderItemEntry = {
  itemType: 'FOLDER' | 'LEDGER';
  id: string;
  name: string;
  childCount: number | null;
  createdAt: string;
};

export type FolderItemsResult = {
  totalCount: number;
  items: FolderItemEntry[];
};

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
  targetFolderId: string | null;
};

export type MoveFolderItemsResult = {
  movedFolderCount: number;
  movedLedgerCount: number;
  targetFolderId: string | null;
  targetFolderName: string | null;
};

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
