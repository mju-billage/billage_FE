import { request } from './apiClient';

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
 * ⚠️ 이 함수를 실제로 호출하는 화면이 아직 없다 — 이 프로젝트엔 진짜 카메라·갤러리
 * 접근이 없다(`MockCameraView`/`ReceiptGalleryPickerScreen`이 전부 가짜 문자열
 * 토큰만 만든다, `photo-${Date.now()}`처럼). 그 토큰들은 실제 파일이 아니라서
 * 업로드할 수 없다 — 여기 올리면 서버가 깨진 파일을 받거나 그대로 실패한다.
 * 실제 이미지 피커/카메라 라이브러리가 붙을 때 바로 쓸 수 있게 인터페이스만
 * 먼저 맞춰둔다(docs/api-gaps.md 참고).
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
