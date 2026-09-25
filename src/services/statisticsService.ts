/** 명세 `Statistics (통계분석).txt` 1절 기준 작성. */
import { request } from './apiClient';
import type { StatisticsOverview } from '../types/statistics';

type StatisticsResponse = {
  mostActiveLedger: {
    ledgerId: number;
    name: string;
    recentEntryCount: number;
    totalIncome: number;
    totalExpense: number;
    budget: number | null;
    budgetUsageRate: number | null;
  } | null;
  budgetUsage: {
    ledgerId: number;
    name: string;
    budget: number;
    totalExpense: number;
    budgetUsageRate: number;
  }[];
  expenseShare: {
    totalExpense: number;
    items: {
      ledgerId: number | null;
      name: string;
      totalExpense: number;
      share: number;
    }[];
  };
};

/** 모임 통계/분석 통합 조회. 폴더 메인/더보기 두 진입점이 같은 데이터를 쓰므로 API 하나로 공유한다. */
export async function getStatistics(groupId: string): Promise<StatisticsOverview> {
  const response = await request<StatisticsResponse>(
    `/api/v1/groups/${groupId}/statistics`,
    { method: 'GET' },
  );
  return {
    mostActiveLedger: response.mostActiveLedger
      ? {
          ledgerId: String(response.mostActiveLedger.ledgerId),
          name: response.mostActiveLedger.name,
          recentEntryCount: response.mostActiveLedger.recentEntryCount,
          totalIncome: response.mostActiveLedger.totalIncome,
          totalExpense: response.mostActiveLedger.totalExpense,
          budget: response.mostActiveLedger.budget,
          budgetUsageRate: response.mostActiveLedger.budgetUsageRate,
        }
      : null,
    budgetUsage: response.budgetUsage.map(item => ({
      ledgerId: String(item.ledgerId),
      name: item.name,
      budget: item.budget,
      totalExpense: item.totalExpense,
      budgetUsageRate: item.budgetUsageRate,
    })),
    expenseShare: {
      totalExpense: response.expenseShare.totalExpense,
      items: response.expenseShare.items.map(item => ({
        ledgerId: item.ledgerId != null ? String(item.ledgerId) : null,
        name: item.name,
        totalExpense: item.totalExpense,
        share: item.share,
      })),
    },
  };
}
