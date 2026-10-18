export type CalendarGridCell = { date: number } | null;

export function getMonthGridWeeks(
  year: number,
  month: number,
): CalendarGridCell[][] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = new Date(year, month - 1, 1).getDay();

  const cells: CalendarGridCell[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      date: index + 1,
    })),
  ];

  const weeks: CalendarGridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7);
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }
  return weeks;
}

export function getRecentDaysRange(today: number): { start: number; end: number } {
  if (today >= 14) {
    return { start: today - 13, end: today };
  }
  return { start: 1, end: 14 };
}

export function getRecentDaysWeeks(
  year: number,
  month: number,
  today: number,
): CalendarGridCell[][] {
  const { start, end } = getRecentDaysRange(today);
  const allWeeks = getMonthGridWeeks(year, month);
  const inRange = (cell: CalendarGridCell) =>
    cell != null && cell.date >= start && cell.date <= end;
  return allWeeks
    .filter(week => week.some(inRange))
    .map(week => week.map(cell => (inRange(cell) ? cell : null)));
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const zeroBasedTotal = month - 1 + delta;
  const newYear = year + Math.floor(zeroBasedTotal / 12);
  const newMonth = ((zeroBasedTotal % 12) + 12) % 12;
  return { year: newYear, month: newMonth + 1 };
}

export function formatDateKey(year: number, month: number, date: number) {
  return `${year}.${String(month).padStart(2, '0')}.${String(date).padStart(
    2,
    '0',
  )}`;
}

export function todayKey(): string {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function nextRangeSelection(
  current: { start?: string; end?: string },
  date: string,
): { start: string; end: string } {
  const { start, end } = current;
  if (!start) {
    return { start: date, end: date };
  }
  const isSingle = !end || end === start;
  if (!isSingle) {
    return { start: date, end: date };
  }
  if (date === start) {
    return { start, end: start };
  }
  return date < start ? { start: date, end: start } : { start, end: date };
}
