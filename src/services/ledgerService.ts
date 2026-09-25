import { request } from './apiClient';
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

type GroupLedgerListItemResponse = {
  ledgerId: number;
  folderId: number | null;
  folderName: string | null;
  name: string;
  budget: number | null;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  remainingBudget: number | null;
  budgetUsageRate: number | null;
  entryCount: number;
  createdAt: string;
};

/**
 * 모임 전체 장부 목록을 조회한다(최상위 장부 포함). `GET /groups/{groupId}/ledgers`
 * (평평한 목록)를 쓴다 — 폴더별 장부 목록 API로는 최상위(폴더 없음) 장부를 조회할
 * 수 없고 폴더 개수만큼 호출해야(N+1) 하기 때문이다. 응답 필드는 `LedgerSummary`에
 * 필요한 값을 전부 포함한다(`ledgerId`/`folderId`/`name`/`budget`/`totalIncome`/
 * `totalExpense`/`balance`/`remainingBudget`/`entryCount`).
 */
export async function getAllLedgersInGroup(
  groupId: string,
): Promise<LedgerSummary[]> {
  const response = await request<GroupLedgerListItemResponse[]>(
    `/api/v1/groups/${groupId}/ledgers`,
    { method: 'GET' },
  );
  return response.map(item => ({
    id: String(item.ledgerId),
    folderId: item.folderId != null ? String(item.folderId) : null,
    name: item.name,
    budget: item.budget,
    totalIncome: item.totalIncome,
    totalExpense: item.totalExpense,
    balance: item.balance,
    remainingBudget: item.remainingBudget,
    entryCount: item.entryCount,
    createdAt: item.createdAt,
  }));
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
 * `POST /folders/{folderId}/ledgers`(위 `createLedger`)와 달리 **폴더 없이(최상위)**
 * 장부를 만들 수 있다 — `folderId`를 생략하거나 `null`이면 최상위, 값을 주면 그 폴더
 * 안. 새 모임은 폴더가 0개라 이 엔드포인트가 아니면 첫 장부를 못 만든다. 총무
 * 전용, 다른 모임 폴더를 지정하면 `GROUP_MISMATCH(409)`.
 */
export async function createLedgerInGroup(
  groupId: string,
  input: { name: string; budget: number | null; folderId: string | null },
): Promise<void> {
  const body: Record<string, unknown> = { name: input.name, folderId: null };
  if (input.budget != null) {
    body.budget = input.budget;
  }
  if (input.folderId != null) {
    body.folderId = Number(input.folderId);
  }
  await request<void>(`/api/v1/groups/${groupId}/ledgers`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * 장부 이름을 변경한다(Ledger.txt "4. 장부 수정", `PATCH /ledgers/{id}`).
 *
 * 이 PATCH의 `folderId: null`은 "최상위로 이동"이 아니라 **"변경 없음"**이다 —
 * 폴더 이동은 이 엔드포인트가 아니라 완전히 별개인
 * `POST /groups/{groupId}/folder-items/move`(`targetFolderId: null`이 최상위)로
 * 처리한다(`folderService.moveFolderItems()`, `FolderMoveDestinationScreen.tsx`).
 * 그래서 이 함수는 이름 변경만 받는다.
 */
export async function updateLedger(
  ledgerId: string,
  updates: { name: string },
): Promise<void> {
  await request<void>(`/api/v1/ledgers/${ledgerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: updates.name }),
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
