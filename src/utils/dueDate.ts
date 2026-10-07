export function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function formatDDayLabel(daysLeft: number): string {
  if (daysLeft === 0) {
    return 'D-Day';
  }
  return daysLeft > 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`;
}

export type DDaySeverity = 'positive' | 'warning' | 'destructive';

export function getDDaySeverity(daysLeft: number): DDaySeverity {
  if (daysLeft > 7) {
    return 'positive';
  }
  return daysLeft > 3 ? 'warning' : 'destructive';
}

export function formatDateDot(isoDateOrDateTime: string | null | undefined): string {
  if (!isoDateOrDateTime) {
    return '';
  }
  return isoDateOrDateTime.slice(0, 10).replace(/-/g, '.');
}
