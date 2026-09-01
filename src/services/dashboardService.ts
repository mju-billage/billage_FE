import { request } from './apiClient';

export type DashboardEntryType = 'INCOME' | 'EXPENSE';
export type DashboardEntryApprovalStatus = 'PENDING' | 'APPROVED';

export type DashboardRecentEntry = {
  id: string;
  ledgerId: string;
  ledgerName: string;
  type: DashboardEntryType;
  title: string;
  amount: number;
  occurredOn: string;
  approvalStatus: DashboardEntryApprovalStatus;
};

export type DashboardDuesSummary = {
  activeDuesCount: number;
  totalTargetCount: number;
  paidCount: number;
  unpaidCount: number;
};

/**
 * 대시보드 화면이 실제로 쓰는 모양으로 정규화한 응답. 이름을 `types/dashboard.ts`의
 * 목 `DashboardSummary`와 겹치지 않게 `DashboardOverview`로 뒀다 — 그 목 타입은
 * Storybook 컴포넌트 데모용으로 따로 남아 있다(services/dashboardService.ts 사용처와
 * 무관, docs/api-integration-plan.md 현황 절 참고).
 */
export type DashboardOverview = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  ledgerCount: number;
  /** 승인 대기 내역 수. 잔액(totalIncome/totalExpense/balance)엔 반영 안 됨(승인된 것만 반영). */
  pendingEntryCount: number;
  /** 회비(Dues) 도메인 구현 전까지 전부 0(Dashboard.txt 정책 메모). */
  dues: DashboardDuesSummary;
  recentEntries: DashboardRecentEntry[];
};

type DashboardResponse = {
  groupId: number;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    ledgerCount: number;
  };
  approval: { pendingEntryCount: number };
  dues: DashboardDuesSummary;
  recentEntries: {
    entryId: number;
    ledgerId: number;
    ledgerName: string;
    type: DashboardEntryType;
    title: string;
    amount: number;
    occurredOn: string;
    approvalStatus: DashboardEntryApprovalStatus;
  }[];
};

const DEFAULT_RECENT_ENTRY_SIZE = 5;
const MIN_RECENT_ENTRY_SIZE = 1;
const MAX_RECENT_ENTRY_SIZE = 20;

/**
 * 대시보드 통합 조회. `recentEntrySize`는 서버 허용 범위(1~20, 기본 5)로
 * 클라이언트에서도 한 번 더 clamp한다(Dashboard.txt Query Parameter) —
 * 디자인 시안이 '예정' 상태라(CLAUDE.md) 화면이 몇 개를 보여줄지 정해진 게
 * 없어 서버 기본값을 그대로 따른다.
 */
export async function getDashboard(
  groupId: string,
  recentEntrySize: number = DEFAULT_RECENT_ENTRY_SIZE,
): Promise<DashboardOverview> {
  const size = Math.min(
    Math.max(Math.round(recentEntrySize), MIN_RECENT_ENTRY_SIZE),
    MAX_RECENT_ENTRY_SIZE,
  );
  const response = await request<DashboardResponse>(
    `/api/v1/groups/${groupId}/dashboard?recentEntrySize=${size}`,
    { method: 'GET' },
  );
  return {
    totalIncome: response.summary.totalIncome,
    totalExpense: response.summary.totalExpense,
    balance: response.summary.balance,
    ledgerCount: response.summary.ledgerCount,
    pendingEntryCount: response.approval.pendingEntryCount,
    dues: response.dues,
    recentEntries: response.recentEntries.map(entry => ({
      id: String(entry.entryId),
      ledgerId: String(entry.ledgerId),
      ledgerName: entry.ledgerName,
      type: entry.type,
      title: entry.title,
      amount: entry.amount,
      occurredOn: entry.occurredOn,
      approvalStatus: entry.approvalStatus,
    })),
  };
}
