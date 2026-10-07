import { request } from './apiClient';

export const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export type FilePurpose = 'RECEIPT' | 'PROFILE_IMAGE' | 'GROUP_IMAGE';

export type UploadedFile = {
  id: string;
  purpose: FilePurpose;
  fileName: string;
  contentType: string;
  size: number;
  url: string;
  createdAt: string;
};

type FileUploadResponse = {
  fileId: number;
  purpose: FilePurpose;
  originalFileName: string;
  contentType: string;
  size: number;
  fileUrl: string;
  createdAt: string;
};

export async function uploadFile(
  fileUri: string,
  fileName: string,
  mimeType: string,
  purpose: FilePurpose,
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append(
    'file',
    { uri: fileUri, name: fileName, type: mimeType } as unknown as Blob,
  );
  formData.append('purpose', purpose);

  const response = await request<FileUploadResponse>('/api/v1/files', {
    method: 'POST',
    body: formData,
  });

  return {
    id: String(response.fileId),
    purpose: response.purpose,
    fileName: response.originalFileName,
    contentType: response.contentType,
    size: response.size,
    url: response.fileUrl,
    createdAt: response.createdAt,
  };
}

export async function deleteFile(fileId: string): Promise<void> {
  await request<void>(`/api/v1/files/${fileId}`, { method: 'DELETE' });
}
