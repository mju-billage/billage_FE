/**
 * 납부 관리·모임원 명단용 사람 데이터(서버 `Member`). 가입 사용자/모임 관리자 권한
 * (`GroupMembership`)과는 별개 엔티티이며 자동 연결하지 않는다(API 공통 규칙 §17).
 * 총무가 [모임원 추가]로 별도 등록해야 이 명단에 올라간다. 권한 컬럼이 없다.
 */
export type Member = {
  memberId: string;
  groupId: string;
  name: string;
  phoneNumber: string | null;
  tags: string[];
  memo: string | null;
  createdAt: string;
};

/** 모임원 상세(DUE-3-PAGE-03-0) 전용 — 목록엔 없는 `totalPaidAmount`(납부 완료 합계,
 * 저장하지 않고 매번 계산됨, Member.txt §6)를 더 갖는다. */
export type MemberDetail = Member & {
  totalPaidAmount: number;
};

/** 모임원 납부 내역(DUE-4-PAGE-04-0) 리스트 한 건. 리스트는 조회 전용이라
 * 눌러도 이동하지 않는다(Member.txt §7) — `duesId`가 있어도 회비 상세로 연결하지 않는다. */
export type MemberPayment = {
  duesId: string;
  duesTitle: string;
  ledgerId: string;
  ledgerName: string;
  amount: number;
  /** ISO datetime. */
  paidAt: string;
};
