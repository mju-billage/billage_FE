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
 * 모임 전체 장부 목록을 조회한다(최상위 장부 포함). 2026-09-13 백엔드 노티 04번으로
 * 신설된 `GET /groups/{groupId}/ledgers`(평평한 목록)를 쓴다 — 예전엔 이 API가 없어
 * 폴더 트리 조회 1콜 + 폴더 개수만큼 장부 목록 병렬 호출로 대체했었는데(N+1), 그
 * 방식은 최상위(폴더 없음) 장부를 아예 조회할 수 없었다(폴더에 속한 장부만 폴더별로
 * 조회하는 API만 있었으므로). 새 엔드포인트로 교체해 N+1도, 최상위 장부 누락도 함께
 * 해결됐다 — 실호출로 응답 필드가 `LedgerSummary`에 필요한 값을 전부 포함함을
 * 확인했다(`ledgerId`/`folderId`/`name`/`budget`/`totalIncome`/`totalExpense`/
 * `balance`/`remainingBudget`/`entryCount`).
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
 * 2026-09-13 백엔드 노티 03번으로 신설된 엔드포인트. `POST /folders/{folderId}/ledgers`
 * (위 `createLedger`)와 달리 **폴더 없이(최상위)** 장부를 만들 수 있다 —
 * `folderId`를 생략하거나 `null`이면 최상위, 값을 주면 그 폴더 안. 새 모임은 폴더가
 * 0개라 이 엔드포인트가 없으면 첫 장부조차 못 만드는 게 실제 막힘이었다(2026-09-13
 * 보고서 생성 진단 중 재확인 — 백업으로 폴더가 0개가 됐을 때도 같은 증상). 총무
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
 * **2026-09-13 백엔드 노티로 확정**: 이 PATCH의 `folderId: null`은 "최상위로 이동"이
 * 아니라 **"변경 없음"**이다 — 폴더 이동은 이 엔드포인트가 아니라 완전히 별개인
 * `POST /groups/{groupId}/folder-items/move`(`targetFolderId: null`이 최상위)로
 * 처리한다(`folderService.moveFolderItems()`, `FolderMoveDestinationScreen.tsx`가 이미
 * 이 방식을 쓰고 있다 — 정상). 예전엔 이 함수가 `folderId`도 같이 받아 "이동"까지
 * 하는 것처럼 만들어 뒀었는데, 실제로 호출하는 곳이 이름 변경(`LedgerDetailScreen.tsx`)
 * 하나뿐이었고 그마저 `folderId`를 넘긴 적이 없었다(죽은 코드) — 백엔드 확인을 계기로
 * 아예 지웠다. 폴더 이동이 필요하면 `moveFolderItems()`를 쓸 것.
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
