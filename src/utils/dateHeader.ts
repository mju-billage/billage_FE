import { CALENDAR_WEEKDAY_LABELS } from '../constants/calendarScreenText';

export function formatDateHeader(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const jsDate = new Date(year, month - 1, day);
  return `${month}월 ${day}일 ${CALENDAR_WEEKDAY_LABELS[jsDate.getDay()]}요일`;
}

export function formatFullDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${year}년 ${String(month).padStart(2, '0')}월 ${String(day).padStart(2, '0')}일`;
}
