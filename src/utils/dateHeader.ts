import { CALENDAR_WEEKDAY_LABELS } from '../constants/calendarScreenText';

/** 'YYYY-MM-DD' -> 'M월 D일 요일'(예: '4월 16일 목요일'). 내역 목록의 날짜 그룹 헤더용. */
export function formatDateHeader(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const jsDate = new Date(year, month - 1, day);
  return `${month}월 ${day}일 ${CALENDAR_WEEKDAY_LABELS[jsDate.getDay()]}요일`;
}
