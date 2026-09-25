/**
 * 보관함(Archive) 도메인 — Folder.txt 5번(전체 백업)·8번(보관함) 기준.
 * 아래 스키마는 Swagger 예시값이 아니라 실제 서버 응답 모양을 따른다.
 */

/** 보관 기록 목록/생성 응답(`GET`·`POST /groups/{groupId}/archives`) 공통 항목.
 * 날짜 필드는 `archivedAt`이 아니라 `createdAt`이다 — Swagger 스키마
 * 이름과도 다르게 실제 서버가 이렇게 내려준다. `totalIncome`/`totalExpense`/`balance`도
 * 내려온다(화면엔 아직 안 씀). */
export type ArchiveSummary = {
  archiveId: string;
  title: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  ledgerCount: number;
  entryCount: number;
  createdAt: string;
};

/** 보관 시점에 동결된 장부 하나 안의 내역 한 건. */
export type ArchivedEntry = {
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: 'PENDING' | 'APPROVED';
  createdByName: string;
  receiptFiles: { fileId: string; fileName: string; fileUrl: string }[];
};

/**
 * 보관 시점에 동결된 장부 하나. **`archivedLedgerId`도
 * `startDate`/`endDate`도 이 레벨엔 없다**(Swagger 예시와 실제가 다르다). 기간은 보관 기록 전체(`ArchiveDetail.startDate`/
 * `endDate`) 하나뿐이고, 장부별로 따로 없다. 안정적인 고유 id가 없어 화면
 * (`ArchiveDetailScreen`)은 배열 인덱스를 key로 쓴다(스냅샷이라 순서가 안 바뀜).
 */
export type ArchivedLedger = {
  folderName: string;
  name: string;
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entries: ArchivedEntry[];
};

/** 보관 기록 상세(`GET /archives/{archiveId}`). 실제 응답은 `summary{totalIncome,
 * totalExpense, balance, entryCount}`로 한 번 감싸져 있다 — 예전 타입처럼 최상위에
 * 흩어져 있지 않다. 날짜 필드도 목록과 같은 이유로 `archivedAt`이 아니라 `createdAt`. */
export type ArchiveDetail = {
  archiveId: string;
  groupId: string;
  title: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entryCount: number;
  ledgers: ArchivedLedger[];
  createdAt: string;
};
