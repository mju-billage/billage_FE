/**
 * 회비(Dues) 도메인 타입. 조회만(6-A) — 생성·수정·삭제·마감·납부 상태 변경은
 * 전부 총무 전용 쓰기 API라 6-B/6-C에서 붙인다(Dues.txt).
 *
 * 목록 응답과 상세 응답의 장부 필드 모양이 다르다(목록은 평평한
 * `ledgerId`/`ledgerName`, 상세는 `ledger: {ledgerId, name}` 객체) — 서버 그대로
 * 타입을 분리했다(entryService의 createdBy/approvedBy와 같은 이유).
 *
 * ⚠️ "시작일" 필드가 명세에 없다 — `dueDate`(마감일)만 있고 납부 기간의 시작을
 * 나타내는 필드가 없다. 화면(회비 상세)에서 "납부 기간"을 보여줘야 할 때는
 * `createdAt`(생성일)을 시작일 대체로 쓴다 — **실측 기반 가정, 명세 확인 필요**
 * (docs/api-gaps.md 참고). 목록 응답엔 `createdAt`조차 없어 그 대체도 못 쓴다.
 */
export type DuesStatus = 'OPEN' | 'CLOSED';
export type PaymentStatus = 'UNPAID' | 'PAID';

export type DuesSummary = {
  id: string;
  title: string;
  amount: number;
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
