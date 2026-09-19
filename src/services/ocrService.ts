/** 서버 미구현("시작 전", 2026-09-06 기준). 명세 `OCR (영수증 인식).txt` 1번 기준 작성. */
import { request } from './apiClient';

export type OcrItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  confidence: number;
};

export type OcrResult = {
  fileId: string;
  merchantName: string;
  purchasedOn: string;
  items: OcrItem[];
  totalAmount: number;
  recognizedAt: string;
};

type OcrResponse = {
  fileId: number;
  merchantName: string;
  purchasedOn: string;
  items: OcrItem[];
  totalAmount: number;
  recognizedAt: string;
};

/**
 * 영수증 이미지(`fileId`, `RECEIPT` 목적으로 이미 업로드된 파일)를 OCR로
 * 인식한다. ⚠️ 카메라(`utils/imagePicker.ts`)는 2026-09-06부터 실제 촬영이지만
 * 그 결과를 `fileService.uploadFile()`로 올려 진짜 fileId를 받는 연결이 아직
 * 없고, 갤러리(`ReceiptGalleryPickerScreen`)는 여전히 mock 토큰만 만든다
 * (`fileService.ts` 주석 참고) — 그래서 이 함수를 호출할 데이터가 아직 없다.
 * 스캔 화면(`ReceiptScanningView` 등)은 여전히 `utils/mockOcr.ts`를 쓴다 —
 * 업로드 연결이 붙으면 그 화면의 mock 호출을 이 함수로 바꿀 것.
 */
export async function recognizeReceipt(fileId: string): Promise<OcrResult> {
  const response = await request<OcrResponse>(`/api/v1/files/${fileId}/ocr`, {
    method: 'POST',
  });
  return { ...response, fileId: String(response.fileId) };
}
