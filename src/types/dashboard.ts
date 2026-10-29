import {
  REPORT_GRAPHIC_XML,
  STATISTICS_GRAPHIC_XML,
  ALBUM_GRAPHIC_XML,
} from '../assets/graphics/dashboardGraphics';

export type MiniCalendarDay = {
  date: number;
  income: number;
  expense: number;
};

export type MiniCalendarData = {
  year: number;
  month: number;
  monthLabel: string;
  days: MiniCalendarDay[];
};

export type DuesProgress = {
  id: string;
  groupName: string;
  dDayLabel: string;
  description: string;
  highlightDescription: string;
  highlightCount?: number;
  paidMemberCount: number;
  totalMemberCount: number;
  progressRatio: number;
};

export type QuickServiceItem = {
  id: string;
  graphic: string;
  label: string;
  title: string;
};

export type DashboardSummary = {
  userNickname: string;
  miniCalendar: MiniCalendarData;
  duesProgressList: DuesProgress[];
  quickServices: QuickServiceItem[];
};

const MINI_CALENDAR_AMOUNTS: Array<{ income: number; expense: number }> = [
  { income: 0, expense: 10000 },
  { income: 0, expense: 10000 },
  { income: 0, expense: 5000 },
  { income: 0, expense: 0 },
  { income: 5000, expense: 0 },
  { income: 10000, expense: 0 },
  { income: 15000, expense: 0 },
  { income: 0, expense: 10000 },
  { income: 0, expense: 10000 },
  { income: 0, expense: 5000 },
  { income: 0, expense: 5000 },
  { income: 5000, expense: 0 },
  { income: 10000, expense: 0 },
  { income: 15000, expense: 0 },
];

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  userNickname: '김둘봉이',
  miniCalendar: {
    year: 2026,
    month: 7,
    monthLabel: '7월',
    days: MINI_CALENDAR_AMOUNTS.map((split, index) => ({
      date: index + 1,
      income: split.income,
      expense: split.expense,
    })),
  },
  duesProgressList: [
    {
      id: 'mt-2026-07',
      groupName: 'MT',
      dDayLabel: 'D-6',
      description: '전체 회비가 모이기까지',
      highlightDescription: '6명 남았어요',
      paidMemberCount: 24,
      totalMemberCount: 30,
      progressRatio: 24 / 30,
    },
  ],
  quickServices: [
    {
      id: 'report',
      graphic: REPORT_GRAPHIC_XML,
      label: '손쉽게 공유하는',
      title: '보고서 생성',
    },
    {
      id: 'statistics',
      graphic: STATISTICS_GRAPHIC_XML,
      label: '우리 모임 장부',
      title: '통계/분석',
    },
    {
      id: 'evidence-album',
      graphic: ALBUM_GRAPHIC_XML,
      label: '모아보는',
      title: '증빙자료 앨범',
    },
  ],
};
