/**
 * 회비(Dues) D-day 계산. 서버는 D-day/진행률을 안 주고 `dueDate`(마감일)만 준다
 * (Dues.txt) — 전부 클라이언트 계산이다.
 */

/** 오늘 자정 기준 dueDate까지 남은 일수. 0이면 오늘, 음수면 이미 지난 날짜(마감 경과). */
export function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

/** 남은 일수를 'D-N'/'D-Day'/'D+N'(경과) 형태로 표시한다. */
export function formatDDayLabel(daysLeft: number): string {
  if (daysLeft === 0) {
    return 'D-Day';
  }
  return daysLeft > 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`;
}

export type DDaySeverity = 'positive' | 'warning' | 'destructive';

/**
 * 명세(DUE-1-PAGE-01-0 No.4)의 D-day 배지 색 규칙: 마감 여유(D-7 초과)=positive,
 * 마감 경고(D-3 초과 ~ D-7 이하)=warning, 마감 경과·임박(D-Day ~ D-3 이하, 경과 포함)=destructive.
 */
export function getDDaySeverity(daysLeft: number): DDaySeverity {
  if (daysLeft > 7) {
    return 'positive';
  }
  return daysLeft > 3 ? 'warning' : 'destructive';
}

/** 'YYYY-MM-DD' 또는 ISO datetime 문자열의 날짜 부분을 'YYYY.MM.DD'로 바꾼다. */
export function formatDateDot(isoDateOrDateTime: string): string {
  return isoDateOrDateTime.slice(0, 10).replace(/-/g, '.');
}
