export type CalendarGridCell = { date: number } | null;

/** 해당 연/월의 날짜를 일요일 시작 7열 주 단위 그리드로 계산한다. */
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

/** year/month에서 delta개월만큼 이동한 연/월을 계산한다(연도 롤오버 처리). */
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

/** 'YYYY.MM.DD' 형식의 날짜 키를 만든다. */
export function formatDateKey(year: number, month: number, date: number) {
  return `${year}.${String(month).padStart(2, '0')}.${String(date).padStart(
    2,
    '0',
  )}`;
}
