import { request } from './apiClient';
import type {
  Report,
  ReportDetail,
  ReportEntryType,
  ReportSummaryItem,
  ReportType,
} from '../types/report';

type ReportResponse = {
  reportId: number;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    entryCount: number;
    openingBalance: number | null;
    closingBalance: number | null;
  };
  ledgers: {
    ledgerId: number;
    ledgerName: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }[];
  createdAt: string;
};

type ReportListItemResponse = {
  reportId: number;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  ledgerCount: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  createdAt: string;
};

type ReportListResponse = {
  content: ReportListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

function toReport(response: ReportResponse): Report {
  return {
    reportId: String(response.reportId),
    title: response.title,
    reportType: response.reportType,
    startDate: response.startDate,
    endDate: response.endDate,
    summary: response.summary,
    ledgers: response.ledgers.map(ledger => ({
      ledgerId: String(ledger.ledgerId),
      ledgerName: ledger.ledgerName,
      totalIncome: ledger.totalIncome,
      totalExpense: ledger.totalExpense,
      balance: ledger.balance,
    })),
    createdAt: response.createdAt,
  };
}

function toReportSummaryItem(response: ReportListItemResponse): ReportSummaryItem {
  return {
    reportId: String(response.reportId),
    title: response.title,
    reportType: response.reportType,
    startDate: response.startDate,
    endDate: response.endDate,
    ledgerCount: response.ledgerCount,
    totalIncome: response.totalIncome,
    totalExpense: response.totalExpense,
    balance: response.balance,
    createdAt: response.createdAt,
  };
}

/**
 * `entryType`을 body에 실을지 정한다. **`"ALL"`을 절대 보내지 마라** —
 * 2026-09-05 실호출로 확인: `INCOME`/`EXPENSE`/필드 생략/`null`은 전부
 * 정상(`201`)이지만 `entryType:"ALL"`만 `400`(빈 `fieldErrors`)이 난다.
 * "전체" 선택은 이 필드를 아예 빼는 것으로 표현한다.
 */
function withEntryType(
  body: Record<string, unknown>,
  entryType: ReportEntryType | undefined,
): Record<string, unknown> {
  if (entryType) {
    return { ...body, entryType };
  }
  return body;
}

export type CreateReportByLedgerInput = {
  title: string;
  ledgerIds: string[];
  entryType?: ReportEntryType;
};

/** 장부별 보고서를 생성한다(총무 전용). 기간을 받지 않는다 — 선택한 장부의 전체 기간을 담는다. */
export async function createReportByLedger(
  groupId: string,
  input: CreateReportByLedgerInput,
): Promise<Report> {
  const response = await request<ReportResponse>(`/api/v1/groups/${groupId}/reports`, {
    method: 'POST',
    body: JSON.stringify(
      withEntryType(
        {
          reportType: 'BY_LEDGER',
          title: input.title,
          ledgerIds: input.ledgerIds.map(Number),
        },
        input.entryType,
      ),
    ),
  });
  return toReport(response);
}

export type CreateReportByPeriodInput = {
  title: string;
  startDate: string;
  endDate: string;
  entryType?: ReportEntryType;
};

/** 기간별 보고서를 생성한다(총무 전용). 장부를 받지 않는다 — 기간 내 내역이 있는 모든 장부를 자동으로 담는다. */
export async function createReportByPeriod(
  groupId: string,
  input: CreateReportByPeriodInput,
): Promise<Report> {
  const response = await request<ReportResponse>(`/api/v1/groups/${groupId}/reports`, {
    method: 'POST',
    body: JSON.stringify(
      withEntryType(
        {
          reportType: 'BY_PERIOD',
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate,
        },
        input.entryType,
      ),
    ),
  });
  return toReport(response);
}

export type ReportListParams = {
  reportType?: ReportType;
  page?: number;
  size?: number;
};

export type ReportListPage = {
  items: ReportSummaryItem[];
  page: number;
  totalPages: number;
  last: boolean;
};

/**
 * 보고서 목록을 조회한다(MEMBER 권한 — 총무가 만든 보고서를 일반 관리자도 볼
 * 수 있다). 진짜 페이지네이션이다(2026-09-05 실호출로 확인, `docs/api-gaps.md`
 * "확정됨" 8번) — 회비 목록(`duesService.getDuesList`, `size=50` 단일 조회)과
 * 달리 여기선 무한 스크롤로 이어 받는다. 회비는 마감되며 정리되지만 보고서는
 * 삭제 API가 없어(File.txt에 대응하는 Report 쪽도 delete 엔드포인트 자체가
 * 없음, 405 확인) 계속 누적되므로 `size=50` 단일 조회로는 51번째부터 조용히
 * 안 보이는 게 데이터 유실처럼 보일 수 있다.
 */
export async function getReports(
  groupId: string,
  params: ReportListParams = {},
): Promise<ReportListPage> {
  const query = new URLSearchParams();
  if (params.reportType) {
    query.set('reportType', params.reportType);
  }
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));

  const response = await request<ReportListResponse>(
    `/api/v1/groups/${groupId}/reports?${query.toString()}`,
    { method: 'GET' },
  );
  return {
    items: response.content.map(toReportSummaryItem),
    page: response.page,
    totalPages: response.totalPages,
    last: response.last,
  };
}

type ReportEntrySnapshotResponse = {
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  occurredOn: string;
};

type ReportLedgerDetailResponse = {
  ledgerName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  entries: ReportEntrySnapshotResponse[];
};

type ReportDetailResponse = {
  reportId: number;
  groupId: number;
  title: string;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    entryCount: number;
    openingBalance: number | null;
    closingBalance: number | null;
  };
  ledgers: ReportLedgerDetailResponse[];
  createdAt: string;
};

/**
 * 보고서 상세를 조회한다(MEMBER 권한, 경로가 `/reports/{reportId}`다 —
 * `groups/{groupId}` 프리픽스 없음, 2026-09-05 실호출로 확인). 응답에
 * `ledgers[].entries`가 이미 통째로 들어 있다 — 별도 내역 조회 API도
 * 페이지네이션도 없다(실호출 결과 명세 예시와 필드까지 동일). 이 `entries`는
 * 스냅샷이라 `entryId`가 없다 — `types/report.ts`의 `ReportEntrySnapshot`
 * 주석 참고.
 */
export async function getReportDetail(reportId: string): Promise<ReportDetail> {
  const response = await request<ReportDetailResponse>(`/api/v1/reports/${reportId}`, {
    method: 'GET',
  });
  return {
    reportId: String(response.reportId),
    groupId: String(response.groupId),
    title: response.title,
    reportType: response.reportType,
    startDate: response.startDate,
    endDate: response.endDate,
    summary: response.summary,
    ledgers: response.ledgers.map(ledger => ({
      ledgerName: ledger.ledgerName,
      totalIncome: ledger.totalIncome,
      totalExpense: ledger.totalExpense,
      balance: ledger.balance,
      entries: ledger.entries.map(entry => ({
        type: entry.type,
        title: entry.title,
        amount: entry.amount,
        occurredOn: entry.occurredOn,
      })),
    })),
    createdAt: response.createdAt,
  };
}
