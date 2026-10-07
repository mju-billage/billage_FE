import { request } from './apiClient';

/**
 * 영수증에서 읽은 품목 한 줄.
 *
 * `name`을 뺀 나머지는 `null`일 수 있다 — 영수증마다 인쇄 형식이 달라 수량이나 단가가
 * 없는 줄이 흔하고, 서버는 못 읽은 칸을 `0`으로 채우지 않는다(화면에 "0원짜리 품목"으로
 * 보이게 되기 때문).
 */
export type OcrItem = {
  name: string | null;
  quantity: number | null;
  unitPrice: number | null;
  amount: number | null;
  /** 0~1 인식 신뢰도(품목명 기준). 화면 노출 여부는 우리가 정한다. */
  confidence: number | null;
};

/**
 * 인식 결과.
 *
 * **`totalAmount`만 항상 온다.** 나머지는 못 읽으면 `null`(또는 빈 배열)이다 —
 * 금액만 채워져도 내역 등록 폼은 쓸모가 있어서 서버가 나머지를 비운 채 내린다.
 * 총액마저 못 읽으면 응답이 아니라 `OCR_RESULT_EMPTY(422)`다.
 *
 * `items`는 **항상 빈 배열이다** — 임시 상태가 아니라 확정된 계약이다(2026-09-21).
 * 서버가 범용 OCR 모델로 확정했고(영수증 특화 모델은 건당 단가 때문에 접었다), 범용으로는
 * 품목 행만 가려내려면 열 위치까지 추론해야 해서 뽑지 않는다. 품목을 쓰는 화면이 필요해지면
 * 그때 서버와 다시 이야기할 일이다.
 */
export type OcrResult = {
  fileId: string;
  merchantName: string | null;
  purchasedOn: string | null;
  items: OcrItem[];
  totalAmount: number;
  recognizedAt: string;
};

type OcrResponse = {
  fileId: number;
  merchantName: string | null;
  purchasedOn: string | null;
  items: OcrItem[];
  totalAmount: number;
  recognizedAt: string;
};

/** 인식하지 못했다 — 오류가 아니라 스캔 실패 화면으로 가는 정상 분기다. */
export const OCR_RESULT_EMPTY = 'OCR_RESULT_EMPTY';
/** 영수증 이미지가 아니거나 형식·크기가 맞지 않다. 다시 촬영하면 된다. */
export const INVALID_OCR_FILE = 'INVALID_OCR_FILE';
/**
 * 인식 요청 횟수 초과. 서버가 외부 OCR을 건당 과금으로 부르므로 한도가 있다 —
 * **이 코드를 받으면 자동 재시도하지 말 것.** 재시도 루프가 돌면 비용이 샌다.
 */
export const OCR_RATE_LIMITED = 'OCR_RATE_LIMITED';
/** 외부 OCR 처리 실패(일시적 장애). */
export const OCR_PROCESSING_FAILED = 'OCR_PROCESSING_FAILED';

/**
 * 영수증 이미지(`RECEIPT` 목적으로 이미 업로드된 `fileId`)를 OCR로 인식한다.
 *
 * 업로드와 인식이 나뉘어 있어서 **인식에 실패해도 그 파일은 서버에 남는다** —
 * 사용자가 "인식은 안 됐지만 증빙으로는 첨부"할 수 있다.
 *
 * 서버 제약: `jpg`/`png`, 가로·세로 10~8000px, 4MB 이하.
 */
export async function recognizeReceipt(fileId: string): Promise<OcrResult> {
  const response = await request<OcrResponse>(`/api/v1/files/${fileId}/ocr`, {
    method: 'POST',
  });
  return { ...response, fileId: String(response.fileId) };
}
