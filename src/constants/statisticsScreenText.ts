export const STATISTICS_TITLE = '통계/분석';
export const STATISTICS_LOADING = '불러오는 중...';
export const STATISTICS_RETRY_LABEL = '다시 시도';

export const STATISTICS_EMPTY_TITLE = '아직 분석할 데이터가 없어요!';
export const STATISTICS_EMPTY_SUBTITLE =
  '내역을 기록하고\n우리 모임의 소비 활동을 분석해 보세요.';

export const STATISTICS_ACTIVE_SUBTITLE_SUFFIX = '건의 내역이 추가됨';
export const STATISTICS_ACTIVE_SUBTITLE_PREFIX = '* 최근 7일간 ';
export function statisticsActiveTitle(ledgerName: string): string {
  return `현재 ${ledgerName} 장부가 가장 활발해요`;
}
export const STATISTICS_ACTIVE_INCOME_LABEL = '수입';
export const STATISTICS_ACTIVE_EXPENSE_LABEL = '지출';
export const STATISTICS_ACTIVE_BUDGET_LABEL = '예산';
export const STATISTICS_ACTIVE_BUDGET_UNSET = '-0원';

export const STATISTICS_BUDGET_USAGE_TITLE = '예산 대비 이만큼 소비했어요';
export const STATISTICS_BUDGET_USAGE_EXPAND_LABEL = '펼쳐 보기';
export const STATISTICS_BUDGET_USAGE_COLLAPSE_LABEL = '접기';
export const STATISTICS_BUDGET_USAGE_COLLAPSED_COUNT = 3;

export function statisticsExpenseShareTitle(topLedgerName: string): string {
  return `${topLedgerName} 장부에서 지출이 가장 커요`;
}
export const STATISTICS_EXPENSE_SHARE_OTHERS_NAME = '기타';
