import {
  getRecentDaysRange,
  getRecentDaysWeeks,
} from '../src/utils/calendarGrid';

describe('getRecentDaysRange', () => {
  it('T=1: 1~14', () => {
    expect(getRecentDaysRange(1)).toEqual({ start: 1, end: 14 });
  });
  it('T=13: 1~14', () => {
    expect(getRecentDaysRange(13)).toEqual({ start: 1, end: 14 });
  });
  it('T=14: 1~14', () => {
    expect(getRecentDaysRange(14)).toEqual({ start: 1, end: 14 });
  });
  it('T=15: 2~15', () => {
    expect(getRecentDaysRange(15)).toEqual({ start: 2, end: 15 });
  });
  it('T=31(말일): 18~31', () => {
    expect(getRecentDaysRange(31)).toEqual({ start: 18, end: 31 });
  });
  it('T=28(2월 말일): 15~28', () => {
    expect(getRecentDaysRange(28)).toEqual({ start: 15, end: 28 });
  });
});

describe('getRecentDaysWeeks', () => {
  it('열은 항상 일~토 고정(0열 = 일요일), 범위 밖은 null', () => {
    // T=18: 5~18일. 2026-10-01은 목요일.
    const weeks = getRecentDaysWeeks(2026, 10, 18);
    expect(weeks).toEqual([
      [null, { date: 5 }, { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 }],
      [{ date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 }, { date: 16 }, { date: 17 }],
      [{ date: 18 }, null, null, null, null, null, null],
    ]);
  });

  it('범위 밖 null을 제외한 날짜는 연속 14일', () => {
    const weeks = getRecentDaysWeeks(2026, 10, 18);
    const dates = weeks.flat().filter((cell): cell is { date: number } => cell != null).map(c => c.date);
    expect(dates).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });

  it('T=5: 1~14일 표시', () => {
    const weeks = getRecentDaysWeeks(2026, 10, 5);
    const dates = weeks.flat().filter((cell): cell is { date: number } => cell != null).map(c => c.date);
    expect(dates).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it('T=14: 1~14일, T=15: 2~15일', () => {
    const dates14 = getRecentDaysWeeks(2026, 10, 14)
      .flat()
      .filter((cell): cell is { date: number } => cell != null)
      .map(c => c.date);
    expect(dates14).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

    const dates15 = getRecentDaysWeeks(2026, 10, 15)
      .flat()
      .filter((cell): cell is { date: number } => cell != null)
      .map(c => c.date);
    expect(dates15).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
});
