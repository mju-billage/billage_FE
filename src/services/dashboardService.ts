import { request } from './apiClient';

export type CalendarDaySummary = {
  date: string;
  income: number;
  expense: number;
};

type CalendarResponse = {
  yearMonth: string;
  days: CalendarDaySummary[];
};

/**
 * 명세 Dashboard.txt 3번 기준. 승인된 내역만 집계하고, 금액이 0인 날은 응답
 * 배열에서 아예 빠진다(화면이 그 날짜엔 금액을 표시하지 않는 것과 대응) —
 * 클라이언트가 날짜 자체는 채워서 그린다. 2026-09-11 Swagger 대조로 서버가
 * 실제로 구현돼 있음을 확인(예전 "서버 미구현" 태그는 낡은 정보였다).
 */
export async function getMonthlyCalendar(
  groupId: string,
  yearMonth: string,
): Promise<CalendarDaySummary[]> {
  const response = await request<CalendarResponse>(
    `/api/v1/groups/${groupId}/calendar?yearMonth=${yearMonth}`,
    { method: 'GET' },
  );
  return response.days;
}

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

/** 마감 임박 회비 캐러셀 카드 하나(대시보드_메인화면.png UI 요소 3번). */
export type UpcomingDues = {
  duesId: string;
  title: string;
  dueDate: string;
  daysLeft: number;
  paidCount: number;
  targetCount: number;
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
  /**
   * 2026-09-11 Swagger 대조 + 실호출로 확인 — 서버가 이미 준다(예전엔 "서버가
   * 안 내려줘서 항상 빈 상태"로 잘못 알고 있었다, `docs/api-wiring.md` 참고).
   * 다만 이 값으로 보여줄 알림 **목록**을 가져올 방법이 없다 — 이 프로젝트
   * 서버엔 알림 컨트롤러 자체가 없다(Swagger 16개 컨트롤러에 없음). 화면에
   * 배지만 켤 수 있고 탭해도 갈 곳이 없어 이번 라운드에선 화면에 안 붙였다.
   */
  hasUnreadNotification: boolean;
  /** 2026-09-11 실호출로 확인, 대시보드_메인화면.png UI 요소 3번(회비 현황 캐러셀).
   * `DashboardScreen.tsx`에서 `DuesProgressCard`로 렌더한다. */
  upcomingDues: UpcomingDues[];
};

type CalendarDayResponse = {
  date: string;
  income: number;
  expense: number;
};

type UpcomingDuesResponse = {
  duesId: number;
  title: string;
  dueDate: string;
  daysLeft: number;
  paidCount: number;
  targetCount: number;
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
  /**
   * 2026-09-11 Swagger 대조 + 실호출로 확인(빈 배열까지) — 최근 14일(당일 포함)
   * 롤링 윈도우(`from`~`to`)다. **의도적으로 안 씀**: 시안(DSH-1-PAGE-01-0)이
   * 요구하는 미니 캘린더는 "이번 달 1일부터 2주" 월 그리드라 이 롤링 윈도우와
   * 안 맞는다(월 경계를 넘나듦, 예: 8/29~9/11 — 그대로 넣으면 날짜와 금액이 서로
   * 다른 칸에 매핑된다). `DashboardScreen.tsx`는 대신 `getMonthlyCalendar()`
   * (`GET /groups/{groupId}/calendar?yearMonth=...`)로 이번 달분을 따로 불러
   * 쓴다 — 이 필드는 롤링-윈도우 용도가 따로 생기기 전까진 파싱하지 않는다.
   */
  calendar: { from: string; to: string; days: CalendarDayResponse[] };
  upcomingDues: UpcomingDuesResponse[];
  hasUnreadNotification: boolean;
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
    hasUnreadNotification: response.hasUnreadNotification,
    upcomingDues: response.upcomingDues.map(dues => ({
      duesId: String(dues.duesId),
      title: dues.title,
      dueDate: dues.dueDate,
      daysLeft: dues.daysLeft,
      paidCount: dues.paidCount,
      targetCount: dues.targetCount,
    })),
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
