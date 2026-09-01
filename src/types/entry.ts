/**
 * 내역(Entry) 타입. 목록/상세 응답 shape가 달라(목록엔 `receiptCount`만, 상세엔
 * `receiptFiles`/`createdBy`/`approvedBy` 객체) 타입을 분리했다(services/entryService.ts).
 *
 * ⚠️ 이 파일엔 캐시가 없다 — 다른 도메인(`types/ledger.ts` 등)과 달리 목록이
 * page/size/keyword/type/status로 매번 달라지는 페이지네이션 목록이라 "그 모임의
 * 목록 하나"로 캐시할 수 없다. 화면이 자기 조회 조건에 맞는 페이지 배열을 직접
 *들고 있고, `entryService`는 매번 서버를 그대로 불러 반환만 한다.
 */
export type EntryType = 'INCOME' | 'EXPENSE';
export type EntryApprovalStatus = 'PENDING' | 'APPROVED';

export type EntrySummary = {
  id: string;
  type: EntryType;
  title: string;
  amount: number;
  /** 'YYYY-MM-DD'. */
  occurredOn: string;
  approvalStatus: EntryApprovalStatus;
  createdByUserId: string;
  createdByName: string;
  receiptCount: number;
};

export type EntryReceiptFile = {
  id: string;
  url: string;
  name?: string;
};

export type EntryDetail = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  type: EntryType;
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: EntryApprovalStatus;
  createdBy: { userId: string; name: string };
  approvedBy: { userId: string; name: string } | null;
  approvedAt: string | null;
  receiptFiles: EntryReceiptFile[];
};
