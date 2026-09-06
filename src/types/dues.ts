/**
 * 회비(Dues) 도메인 타입. 6-A(조회)·6-B(생성)·7-A(정합성 복구, 2026-09-04)를
 * 거쳤다. 수정·삭제·마감·납부 상태 변경(단건/일괄)은 여전히 7-B 대상(Dues.txt).
 *
 * 목록 응답과 상세 응답의 장부 필드 모양이 다르다(목록은 평평한
 * `ledgerId`/`ledgerName`, 상세는 `ledger: {ledgerId, name}` 객체) — 서버 그대로
 * 타입을 분리했다(entryService의 createdBy/approvedBy와 같은 이유).
 *
 * `startDate`(시작일)와 `status`의 `SCHEDULED`는 예전엔 명세에 "미구현"으로
 * 태그돼 있어 `createdAt` 대체·`paidCount===0` 추정으로 우회했었다 —
 * 2026-09-04 개발 서버 실호출로 둘 다 실존을 확정했다(`docs/api-gaps.md`
 * "확정됨" 절: `startDate` 없이 `POST /dues`는 400, 미래 `startDate` 회비는
 * 목록에서 정확히 `status:"SCHEDULED"`로 온다). 우회 로직은 전부 걷어냈다.
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
