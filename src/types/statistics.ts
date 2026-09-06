export type StatisticsActiveLedger = {
  ledgerId: string;
  name: string;
  recentEntryCount: number;
  totalIncome: number;
  totalExpense: number;
  budget: number | null;
  budgetUsageRate: number | null;
};

export type StatisticsBudgetUsageItem = {
  ledgerId: string;
  name: string;
  budget: number;
  totalExpense: number;
  budgetUsageRate: number;
};

export type StatisticsExpenseShareItem = {
  ledgerId: string | null;
  name: string;
  totalExpense: number;
  share: number;
};

export type StatisticsOverview = {
  mostActiveLedger: StatisticsActiveLedger | null;
  budgetUsage: StatisticsBudgetUsageItem[];
  expenseShare: {
    totalExpense: number;
    items: StatisticsExpenseShareItem[];
  };
};
