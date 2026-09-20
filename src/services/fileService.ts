import { request } from './apiClient';

/** File.txt "1. 파일 업로드" 정책 메모: "현재 구현값(제안안 그대로 적용, 설정으로
 * 변경 가능)... 최대 10MB". 서버가 압축을 안 하므로(같은 정책 메모) 이 상한을
 * 넘는 파일은 업로드 전에 클라이언트가 먼저 막아야 `FILE_SIZE_EXCEEDED(413)`
 * 대신 이유를 알 수 있는 안내를 보여줄 수 있다. */
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

/**
 * 파일을 업로드한다(multipart/form-data, File.txt "1. 파일 업로드"). `fileUri`는
 * 기기의 실제 로컬 파일 경로/URI여야 한다.
 *
 * 2026-09-11부터 카메라(`utils/imagePicker.ts`의 `captureWithFeedback`)/갤러리
 * (`pickGalleryWithFeedback`)로 얻은 이미지를 촬영·선택 직후 이 함수로 곧바로
 * 업로드한다 — 호출부: `TransactionRegisterScreen`(`RECEIPT`),
 * `GroupProfileEditScreen`(`GROUP_IMAGE`), `ProfileEditScreen`(`PROFILE_IMAGE`).
 * 실호출로 fileId/purpose/fileUrl 필드명이 명세와 일치함을 확인했다(개발 서버,
 * 2026-09-11).
 */
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

/**
 * 파일을 삭제한다(업로더 본인만 가능). 내역·프로필·모임에 연결된 파일은
 * `FILE_IN_USE(409)`로 막힌다 — 먼저 연결을 끊어야 한다(예: 내역이면
 * `entryService.updateEntry`의 `receiptFileIds`에서 빼기).
 */
export async function deleteFile(fileId: string): Promise<void> {
  await request<void>(`/api/v1/files/${fileId}`, { method: 'DELETE' });
}
