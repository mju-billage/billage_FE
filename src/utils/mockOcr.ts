import { todayKey } from './calendarGrid';

export type MockScanResult = { amount: number; date: string };

const SUCCESS_RATE = 0.78;
const MIN_AMOUNT = 5000;
const MAX_AMOUNT = 300000;
const AMOUNT_STEP = 1000;

/**
 * 영수증 스캔 OCR을 흉내낸다. **서버 미구현(`POST /files/{fileId}/ocr`가 Swagger 16개
 * 컨트롤러 어디에도 없음)으로 인한 임시 mock** — 프로젝트에 남은
 * 유일한 mock 데이터다. 서버가 생기면 `ocrService`(만들 것)로 교체할 것. 카메라/갤러리
 * 실연동으로 진짜 `fileId`는 이미 만들 수 있어(선행 조건 해소) 서버만 열리면 이 파일과
 * `ReceiptScanningView`의 mock 분기만 걷어내면 된다.
 */
export function generateMockScanResult(): MockScanResult | null {
  if (Math.random() > SUCCESS_RATE) {
    return null;
  }
  const steps = Math.floor((MAX_AMOUNT - MIN_AMOUNT) / AMOUNT_STEP);
  const amount = MIN_AMOUNT + Math.floor(Math.random() * steps) * AMOUNT_STEP;
  return { amount, date: todayKey() };
}
