/** 보관함(Archive) 도메인 — Folder.txt 5번(전체 백업)·8번(보관함) 기준. 서버 "시작 전". */

/** 보관 기록 목록(`GET /groups/{groupId}/archives`) 항목. */
export type ArchiveSummary = {
  archiveId: string;
  title: string;
  startDate: string;
  endDate: string;
  ledgerCount: number;
  archivedAt: string;
};

/** 보관 시점에 동결된 장부 하나 — `archivedLedgerId`는 원본 장부 ID가 아니라 스냅샷 ID다. */
export type ArchivedLedger = {
  archivedLedgerId: string;
  name: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
};

/** 보관 기록 상세(`GET /archives/{archiveId}`) — 장부별 요약까지만 내려온다(내역 단위 없음). */
export type ArchiveDetail = {
  archiveId: string;
  title: string;
  archivedAt: string;
  ledgers: ArchivedLedger[];
};

/** 전체 폴더·장부 백업 응답(`POST /groups/{groupId}/folders/archive`). */
export type ArchiveCreateResult = {
  archiveId: string;
  groupId: string;
  archivedFolderCount: number;
  archivedLedgerCount: number;
  archivedAt: string;
  resetCompleted: boolean;
};
