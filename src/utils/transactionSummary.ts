import { CalendarTransaction } from '../types/calendar';

/** 하루치 거래 목록의 입출금 합계를 구한다. */
export function sumTransactions(transactions: CalendarTransaction[]): number {
  return transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );
}
