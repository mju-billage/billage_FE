/**
 * 명세 Folder (폴더).txt 5번(전체 백업)·8번(보관함) 기준.
 *
 * **2026-09-11 Swagger 대조로 전면 정정** — `archive-controller`가 실제로 존재하고
 * 구현돼 있다(명세 txt의 "시작 전" 표기는 낡은 정보였다). 다만 `createArchive`가
 * 부르던 경로(`POST /groups/{groupId}/folders/archive`)는 **실제 서버엔 없는
 * 경로**였다(실호출로 `404 RESOURCE_NOT_FOUND` 확인) — 진짜 경로는 다른 함수들과
 * 같은 `/groups/{groupId}/archives`다.
 *
 * **2026-09-12 재정정** — 그때 다시 맞춘 응답 스키마도 Swagger 예시값만 보고
 * 맞춘 것이었고 실제와 또 어긋나 있었다(실기기에서 보관함 목록 진입 즉시
 * `formatArchivedAt`이 `undefined.slice()`로 죽는 크래시로 발견). `groupId 5`에
 * 테스트 폴더/장부/내역/보관 기록을 직접 만들어 실호출로 확정:
 *  - 날짜 필드는 `archivedAt`이 아니라 **`createdAt`**이다(목록·생성·상세 전부).
 *  - 목록/생성 응답엔 `totalIncome`/`totalExpense`/`balance`도 실제로 온다(예전
 *    타입엔 빠져 있었음, 화면엔 아직 안 씀).
 *  - 상세 응답은 최상위에 흩어진 모양이 아니라 실제로 `{archiveId, groupId, title,
 *    startDate, endDate, totalIncome, totalExpense, balance, entryCount, ledgers,
 *    createdAt}` 평평한 모양이다(`summary{}`로 감싸져 있지 않다 — 실호출 원본:
 *    `GET /archives/2` → `{"archiveId":2,"groupId":5,"title":"...","startDate":
 *    "2026-09-11","endDate":"2026-09-11","totalIncome":1000,"totalExpense":0,
 *    "balance":1000,"entryCount":1,"ledgers":[...],"createdAt":"..."}`, Swagger
 *    문서의 `summary{}` 래핑은 실제 응답과 다르다).
 *  - `ledgers[]` 각 항목엔 **`archivedLedgerId`도 `startDate`/`endDate`도 없다**
 *    (예전 타입은 둘 다 있다고 가정했다) — 실제로 오는 필드는 `folderName`/
 *    `ledgerName`/`budget`/`totalIncome`/`totalExpense`/`balance`/`entries[]`뿐.
 *    안정적인 id가 없어 화면(`ArchiveDetailScreen`)은 배열 인덱스를 key로 쓴다.
 */
import { request } from './apiClient';
import type {
  ArchiveDetail,
  ArchivedEntry,
  ArchivedLedger,
  ArchiveSummary,
} from '../types/archive';

type ArchiveSummaryResponse = {
  archiveId: number;
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

function toArchiveSummary(response: ArchiveSummaryResponse): ArchiveSummary {
  return {
    archiveId: String(response.archiveId),
    title: response.title,
    startDate: response.startDate,
    endDate: response.endDate,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    ledgerCount: response.ledgerCount,
    entryCount: response.entryCount,
    createdAt: response.createdAt,
  };
}

/** 현재 폴더·장부를 전부 보관함에 저장한다(총무 전용). */
export async function createArchive(
  groupId: string,
  title: string,
): Promise<ArchiveSummary> {
  const response = await request<ArchiveSummaryResponse>(
    `/api/v1/groups/${groupId}/archives`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    },
  );
  return toArchiveSummary(response);
}

/** 보관 기록 목록을 조회한다(MEMBER 권한). 정렬은 서버가 보관일 내림차순으로 내려준다. */
export async function getArchives(groupId: string): Promise<ArchiveSummary[]> {
  const response = await request<ArchiveSummaryResponse[]>(
    `/api/v1/groups/${groupId}/archives`,
    { method: 'GET' },
  );
  return response.map(toArchiveSummary);
}

type ArchivedEntryResponse = {
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
  memo: string | null;
  approvalStatus: 'PENDING' | 'APPROVED';
  createdByName: string;
  receiptFiles: { fileId: number; fileName: string; fileUrl: string }[];
};

type ArchivedLedgerResponse = {
  folderName: string;
  ledgerName: string;
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entries: ArchivedEntryResponse[];
};

type ArchiveDetailResponse = {
  archiveId: number;
  groupId: number;
  title: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entryCount: number;
  ledgers: ArchivedLedgerResponse[];
  createdAt: string;
};

function toArchivedEntry(response: ArchivedEntryResponse): ArchivedEntry {
  return {
    ...response,
    receiptFiles: response.receiptFiles.map(file => ({
      ...file,
      fileId: String(file.fileId),
    })),
  };
}

function toArchivedLedger(response: ArchivedLedgerResponse): ArchivedLedger {
  return {
    folderName: response.folderName,
    name: response.ledgerName,
    budget: response.budget,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    entries: response.entries.map(toArchivedEntry),
  };
}

/** 보관 기록 상세를 조회한다(MEMBER 권한). */
export async function getArchiveDetail(archiveId: string): Promise<ArchiveDetail> {
  const response = await request<ArchiveDetailResponse>(
    `/api/v1/archives/${archiveId}`,
    { method: 'GET' },
  );
  return {
    archiveId: String(response.archiveId),
    groupId: String(response.groupId),
    title: response.title,
    startDate: response.startDate,
    endDate: response.endDate,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    entryCount: response.entryCount,
    ledgers: response.ledgers.map(toArchivedLedger),
    createdAt: response.createdAt,
  };
}

/** 보관 제목을 변경한다(OWNER 권한). */
export async function updateArchiveTitle(
  archiveId: string,
  title: string,
): Promise<void> {
  await request<void>(`/api/v1/archives/${archiveId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

/** 보관 기록을 삭제한다(OWNER 권한). Hard Delete — 복구 불가. */
export async function deleteArchive(archiveId: string): Promise<void> {
  await request<void>(`/api/v1/archives/${archiveId}`, { method: 'DELETE' });
}
