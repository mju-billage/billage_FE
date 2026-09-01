/**
 * 장부(Ledger) 서버 캐시. `GET /folders/{folderId}/ledgers`(목록)와
 * `GET /ledgers/{ledgerId}`(상세)는 응답 shape가 달라 타입을 분리했다 — 목록엔
 * `folderName`/`createdAt`/`updatedAt`이 없다(services/ledgerService.ts 참고).
 *
 * 실제 변경(API 호출)은 `services/ledgerService.ts`가 하고, 이 파일은 그 결과를
 * 담는 순수 캐시다(group.ts/groupMembership.ts와 같은 패턴).
 */
export type LedgerSummary = {
  id: string;
  folderId: string | null;
  name: string;
  /** null이면 예산 미설정. */
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  /** budget이 null이면 이 값도 null. */
  remainingBudget: number | null;
  entryCount: number;
};

export type LedgerDetail = LedgerSummary & {
  /** 최상위 영역으로 올라온 장부(폴더 삭제로 소속이 없어진 경우)는 null. */
  folderId: string | null;
  folderName: string | null;
  createdAt: string;
  updatedAt: string;
};

// 폴더별로 캐시한다 — 폴더 화면이 한 번에 한 폴더의 장부 목록만 본다.
let ledgersByFolder: Record<string, LedgerSummary[]> = {};
// 장부 상세는 장부 단위로 캐시한다(장부 상세 화면이 한 번에 하나만 본다).
let ledgerDetailById: Record<string, LedgerDetail> = {};

/** ledgerService가 특정 폴더의 장부 목록 조회에 성공하면 그 폴더의 캐시를 통째로 교체한다. */
export function setLedgersForFolder(
  folderId: string,
  ledgers: LedgerSummary[],
): void {
  ledgersByFolder[folderId] = ledgers;
}

/** 캐시된 특정 폴더의 장부 목록을 그대로 반환한다. 조회 전이면 빈 배열. */
export function getCachedLedgersForFolder(folderId: string): LedgerSummary[] {
  return ledgersByFolder[folderId] ?? [];
}

/** ledgerService가 장부 상세 조회에 성공하면 캐시에 반영한다. */
export function setLedgerDetail(detail: LedgerDetail): void {
  ledgerDetailById[detail.id] = detail;
}

/** id로 캐시된 장부 상세를 찾는다. 조회 전이면 undefined. */
export function getCachedLedgerDetail(id: string): LedgerDetail | undefined {
  return ledgerDetailById[id];
}
