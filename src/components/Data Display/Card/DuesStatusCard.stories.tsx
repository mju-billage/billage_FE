import type { Meta, StoryObj } from '@storybook/react';
import DuesStatusCard from './DuesStatusCard';

const meta: Meta<typeof DuesStatusCard> = {
  title: 'Data Display/Card/DuesStatusCard',
  component: DuesStatusCard,
};
export default meta;
type Story = StoryObj<typeof DuesStatusCard>;

export const Default: Story = {
  args: {
    title: 'MT 회비',
    dDayLabel: 'D-6',
    paidMemberCount: 24,
    totalMemberCount: 30,
    paidAmount: 1200000,
    totalAmount: 1500000,
    periodStart: '25.03.02',
    periodEnd: '25.03.20',
    ledgerName: '1학기',
    duesAmount: 50000,
  },
};

/** DUE-2-PAGE-03-1(회비 상세_마감된 회비): 마감 배지는 중립색. */
export const Closed: Story = {
  args: {
    title: '회비가 모이기까지',
    dDayLabel: '마감',
    badgeStatus: 'neutral',
    paidMemberCount: 5,
    totalMemberCount: 5,
    paidAmount: 100000,
    totalAmount: 100000,
    periodStart: '26.07.01',
    periodEnd: '26.07.05',
    ledgerName: 'MT',
    duesAmount: 20000,
  },
};

/** DUE-2-PAGE-03-1(회비 상세_예정된 회비): 배지에 시작일(생성일 대체)을 표시, 중립색. */
export const Upcoming: Story = {
  args: {
    title: '회비가 모이기까지',
    dDayLabel: '07.28',
    badgeStatus: 'neutral',
    paidMemberCount: 0,
    totalMemberCount: 5,
    paidAmount: 0,
    totalAmount: 100000,
    periodStart: '26.07.28',
    periodEnd: '26.08.05',
    ledgerName: 'MT',
    duesAmount: 20000,
  },
};
