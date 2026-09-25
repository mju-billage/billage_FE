/**
 * 회비(Dues) 도메인 타입(Dues.txt).
 *
 * 목록 응답과 상세 응답의 장부 필드 모양이 다르다(목록은 평평한
 * `ledgerId`/`ledgerName`, 상세는 `ledger: {ledgerId, name}` 객체) — 서버 그대로
 * 타입을 분리했다(entryService의 createdBy/approvedBy와 같은 이유).
 *
 * `startDate`(시작일)와 `status`의 `SCHEDULED`는 실존한다:
 * `startDate` 없이 `POST /dues`는 400, 미래 `startDate` 회비는
 * 목록에서 정확히 `status:"SCHEDULED"`로 온다.
 */
export type DuesStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED';
export type PaymentStatus = 'UNPAID' | 'PAID';

export type DuesSummary = {
  id: string;
  title: string;
  amount: number;
  /** 'YYYY-MM-DD'. */
  startDate: string;
  /** 'YYYY-MM-DD'. */
  dueDate: string;
  status: DuesStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  ledgerId: string;
  ledgerName: string;
};

export type DuesDetail = {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  startDate: string;
  dueDate: string;
  status: DuesStatus;
  paidCount: number;
  unpaidCount: number;
  targetCount: number;
  /** targetCount * amount와 같다(부분·초과 납부 미지원이라 항상 정확히 일치). */
  expectedTotalAmount: number;
  ledger: { id: string; name: string };
  createdAt: string;
  closedAt: string | null;
  generatedEntryId: string | null;
};

export type DuesMember = {
  memberId: string;
  name: string;
  status: PaymentStatus;
  paidAt: string | null;
};
