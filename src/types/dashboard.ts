import type { ImageSourcePropType } from 'react-native';

export type MiniCalendarDay = {
  date: number;
  amount: number | null;
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
  paidMemberCount: number;
  totalMemberCount: number;
  progressRatio: number;
};

export type QuickServiceItem = {
  id: string;
  icon: ImageSourcePropType;
  label: string;
  title: string;
};

export type DashboardSummary = {
  userNickname: string;
  miniCalendar: MiniCalendarData;
  duesProgressList: DuesProgress[];
  quickServices: QuickServiceItem[];
};

const MINI_CALENDAR_AMOUNTS: Array<number | null> = [
  -10000,
  -10000,
  -5000,
  null,
  5000,
  10000,
  15000,
  -10000,
  -10000,
  -5000,
  -5000,
  5000,
  10000,
  15000,
];

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  userNickname: '김둘봉이',
  miniCalendar: {
    year: 2026,
    month: 7,
    monthLabel: '7월',
    days: MINI_CALENDAR_AMOUNTS.map((amount, index) => ({
      date: index + 1,
      amount,
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
      icon: require('../../src/assets/images/report-graphic.png'),
      label: '손쉽게 공유하는',
      title: '보고서 생성',
    },
    {
      id: 'statistics',
      icon: require('../../src/assets/images/statistics-graphic.png'),
      label: '우리 모임 장부',
      title: '통계/분석',
    },
    {
      id: 'evidence-album',
      icon: require('../../src/assets/images/album-graphic.png'),
      label: '모아보는',
      title: '증빙자료 앨범',
    },
  ],
};
