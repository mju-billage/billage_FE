import { todayKey } from './calendarGrid';

export type MockScanResult = { amount: number; date: string };

const SUCCESS_RATE = 0.78;
const MIN_AMOUNT = 5000;
const MAX_AMOUNT = 300000;
const AMOUNT_STEP = 1000;

export function generateMockScanResult(): MockScanResult | null {
  if (Math.random() > SUCCESS_RATE) {
    return null;
  }
  const steps = Math.floor((MAX_AMOUNT - MIN_AMOUNT) / AMOUNT_STEP);
  const amount = MIN_AMOUNT + Math.floor(Math.random() * steps) * AMOUNT_STEP;
  return { amount, date: todayKey() };
}
