import { request } from './apiClient';
import { flattenFolderIds } from '../utils/folderTree';
import * as folderService from './folderService';
import {
  setLedgersForFolder,
  setLedgerDetail,
} from '../types/ledger';
import type { LedgerSummary, LedgerDetail } from '../types/ledger';

type LedgerListItemResponse = {
  ledgerId: number;
  folderId: number;
  name: string;
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  remainingBudget: number | null;
  entryCount: number;
};

type LedgerDetailResponse = LedgerListItemResponse & {
  folderId: number | null;
  folderName: string | null;
  createdAt: string;
  updatedAt: string;
};

function toLedgerSummary(response: LedgerListItemResponse): LedgerSummary {
  return {
    id: String(response.ledgerId),
    folderId: String(response.folderId),
    name: response.name,
    budget: response.budget,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    remainingBudget: response.remainingBudget,
    entryCount: response.entryCount,
  };
}

function toLedgerDetail(response: LedgerDetailResponse): LedgerDetail {
  return {
    ...toLedgerSummary(response),
    folderId: response.folderId != null ? String(response.folderId) : null,
    folderName: response.folderName,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}

/** 특정 폴더에 직접 속한 장부 목록을 조회한다(하위 폴더의 장부는 포함하지 않음). */
export async function getLedgersInFolder(
  folderId: string,
): Promise<LedgerSummary[]> {
  const response = await request<LedgerListItemResponse[]>(
    `/api/v1/folders/${folderId}/ledgers`,
    { method: 'GET' },
  );
  const ledgers = response.map(toLedgerSummary);
  setLedgersForFolder(folderId, ledgers);
  return ledgers;
}

/** 장부 상세를 조회한다. */
export async function getLedgerDetail(
  ledgerId: string,
): Promise<LedgerDetail> {
  const response = await request<LedgerDetailResponse>(
    `/api/v1/ledgers/${ledgerId}`,
    { method: 'GET' },
  );
  const detail = toLedgerDetail(response);
  setLedgerDetail(detail);
  return detail;
}

/**
 * 모임 전체 장부 목록을 조회한다. "모임 전체 장부" 조회 API가 없어(`docs/api-gaps.md`
 * (C)) 폴더 트리를 먼저 받아 폴더 개수만큼 장부 목록을 병렬로 호출해 합친다 — 폴더가
 * N개면 트리 조회 1콜 + 장부 조회 N콜. `FolderBudgetListScreen`(전체 예산 설정
 * 목록)에서만 쓴다.
 *
 * ⚠️ 최상위 영역(폴더 없음, `folderId: null`)의 장부는 조회할 API 자체가 없어
 * 이 목록에 포함되지 않는다(`docs/api-gaps.md` (C) "최상위 영역 장부 조회").
 */
export async function getAllLedgersInGroup(
  groupId: string,
): Promise<LedgerSummary[]> {
  const tree = await folderService.getFolderTree(groupId);
  const folderIds = flattenFolderIds(tree);
  const results = await Promise.all(
    folderIds.map(folderId => getLedgersInFolder(folderId)),
  );
  return results.flat();
}

/**
 * 새 장부를 생성한다. `budget`을 안 넘기면(null) 필드 자체를 생략한다 — Ledger.txt
 * 생성 API는 `budget`이 선택값이라 생략과 0은 다르다. 캐시는 patch하지 않는다 —
 * 호출자가 성공 후 해당 폴더의 `getLedgersInFolder()`를 다시 불러 갱신한다.
 */
export async function createLedger(
  folderId: string,
  name: string,
  budget: number | null,
): Promise<void> {
  const body: Record<string, unknown> = { name };
  if (budget != null) {
    body.budget = budget;
  }
  await request<void>(`/api/v1/folders/${folderId}/ledgers`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * 장부 이름 변경·다른 폴더로 이동을 한 엔드포인트로 처리한다(Ledger.txt "4. 장부 수정").
 * `updates`에 없는 키는 보내지 않는다. ⚠️ `folderId: null`(최상위로 이동)이 서버에
 * 허용되는지는 명세에 명시가 없다(Folder의 `parentFolderId: null`과 달리 문서화된
 * null 의미가 없음) — 실측 기반 가정, 명세 확인 필요. 화면(`FolderMoveDestinationScreen`)은
 * 이 불확실성 때문에 장부를 최상위로 이동하는 조합 자체를 막아뒀다.
 */
export async function updateLedger(
  ledgerId: string,
  updates: { name?: string; folderId?: string | null },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (updates.name !== undefined) {
    body.name = updates.name;
  }
  if ('folderId' in updates) {
    body.folderId = updates.folderId != null ? Number(updates.folderId) : null;
  }
  await request<void>(`/api/v1/ledgers/${ledgerId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** 장부 예산을 설정/수정한다. `budget`을 `null`로 보내면 예산 미설정으로 되돌아간다. */
export async function updateLedgerBudget(
  ledgerId: string,
  budget: number | null,
): Promise<void> {
  await request<void>(`/api/v1/ledgers/${ledgerId}/budget`, {
    method: 'PATCH',
    body: JSON.stringify({ budget }),
  });
}

/** 장부를 삭제한다. 서버가 종속 내역까지 함께 완전히 삭제한다(복구 불가, 정책 메모). */
export async function deleteLedger(ledgerId: string): Promise<void> {
  await request<void>(`/api/v1/ledgers/${ledgerId}`, { method: 'DELETE' });
}
