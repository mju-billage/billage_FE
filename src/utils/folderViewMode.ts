export type FolderViewMode = 'grid' | 'list';

let viewMode: FolderViewMode = 'grid';
const listeners = new Set<() => void>();

export function getFolderViewMode(): FolderViewMode {
  return viewMode;
}

export function setFolderViewMode(next: FolderViewMode): void {
  if (viewMode === next) {
    return;
  }
  viewMode = next;
  listeners.forEach(listener => listener());
}

export function subscribeFolderViewMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
