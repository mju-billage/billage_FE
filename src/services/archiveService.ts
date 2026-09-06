/**
 * 서버 미구현(2026-09-06 기준). 명세 Folder (폴더).txt 5번(전체 백업)·8번(보관함) 기준 작성.
 * 8번은 "런칭 범위 포함 여부 결정 필요"로 아직 미착수 상태 — 엔드포인트 경로도 프론트-백엔드
 * 최종 합의 전 제안안이다. 서버가 없어 호출은 전부 에러로 떨어지는 게 정상이다.
 */
import { request } from './apiClient';
import type {
  ArchiveCreateResult,
  ArchiveDetail,
  ArchivedLedger,
  ArchiveSummary,
} from '../types/archive';

type ArchiveCreateResponse = {
  archiveId: number;
  groupId: number;
  archivedFolderCount: number;
  archivedLedgerCount: number;
  archivedAt: string;
  resetCompleted: boolean;
};

/** 현재 폴더·장부를 전부 보관함에 저장하고 운영 영역을 초기화한다(총무 전용). */
export async function createArchive(
  groupId: string,
  title: string,
): Promise<ArchiveCreateResult> {
  const response = await request<ArchiveCreateResponse>(
    `/api/v1/groups/${groupId}/folders/archive`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    },
  );
  return {
    archiveId: String(response.archiveId),
    groupId: String(response.groupId),
    archivedFolderCount: response.archivedFolderCount,
    archivedLedgerCount: response.archivedLedgerCount,
    archivedAt: response.archivedAt,
    resetCompleted: response.resetCompleted,
  };
}

type ArchiveSummaryResponse = {
  archiveId: number;
  title: string;
  startDate: string;
  endDate: string;
  ledgerCount: number;
  archivedAt: string;
};

function toArchiveSummary(response: ArchiveSummaryResponse): ArchiveSummary {
  return {
    archiveId: String(response.archiveId),
    title: response.title,
    startDate: response.startDate,
    endDate: response.endDate,
    ledgerCount: response.ledgerCount,
    archivedAt: response.archivedAt,
  };
}

/** 보관 기록 목록을 조회한다(MEMBER 권한). 정렬은 서버가 보관일 내림차순으로 내려준다. */
export async function getArchives(groupId: string): Promise<ArchiveSummary[]> {
  const response = await request<ArchiveSummaryResponse[]>(
    `/api/v1/groups/${groupId}/archives`,
    { method: 'GET' },
  );
  return response.map(toArchiveSummary);
}

type ArchivedLedgerResponse = {
  archivedLedgerId: number;
  name: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
};

type ArchiveDetailResponse = {
  archiveId: number;
  title: string;
  archivedAt: string;
  ledgers: ArchivedLedgerResponse[];
};

function toArchivedLedger(response: ArchivedLedgerResponse): ArchivedLedger {
  return {
    archivedLedgerId: String(response.archivedLedgerId),
    name: response.name,
    startDate: response.startDate,
    endDate: response.endDate,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
  };
}

/** 보관 기록 상세를 조회한다(MEMBER 권한). 읽기 전용 — 내역 단위 데이터는 내려오지 않는다. */
export async function getArchiveDetail(archiveId: string): Promise<ArchiveDetail> {
  const response = await request<ArchiveDetailResponse>(
    `/api/v1/archives/${archiveId}`,
    { method: 'GET' },
  );
  return {
    archiveId: String(response.archiveId),
    title: response.title,
    archivedAt: response.archivedAt,
    ledgers: response.ledgers.map(toArchivedLedger),
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
