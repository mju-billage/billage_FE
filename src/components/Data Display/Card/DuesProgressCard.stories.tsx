import type { Meta, StoryObj } from '@storybook/react';
import DuesProgressCard from './DuesProgressCard';
import { MOCK_DASHBOARD_SUMMARY } from '../../../types/dashboard';

const meta: Meta<typeof DuesProgressCard> = {
  title: 'Data Display/Card/DuesProgressCard',
  component: DuesProgressCard,
};
export default meta;
type Story = StoryObj<typeof DuesProgressCard>;

export const Dashboard: Story = {
  args: {
    type: 'dashboard',
    progress: MOCK_DASHBOARD_SUMMARY.duesProgressList[0],
  },
};

export const PaymentManagement: Story = {
  args: {
    type: 'paymentManagement',
    title: '1학기 회비',
    dateBadgeLabel: '~08.30',
    paidMemberCount: 24,
    totalMemberCount: 30,
    paidAmount: 1200000,
    totalAmount: 1500000,
    progressRatio: 24 / 30,
  },
};

export const Upcoming: Story = {
  args: {
    type: 'paymentManagement',
    title: '2학기 회비',
    dateBadgeLabel: '07.28',
    paidMemberCount: 0,
    totalMemberCount: 30,
    paidAmount: 0,
    totalAmount: 1500000,
    progressRatio: 0,
    state: 'upcoming',
  },
};

export const Ended: Story = {
  args: {
    type: 'paymentManagement',
    title: '1학기 회비',
    dateBadgeLabel: '종료',
    paidMemberCount: 30,
    totalMemberCount: 30,
    paidAmount: 1500000,
    totalAmount: 1500000,
    progressRatio: 1,
    state: 'ended',
  },
};

export const ActiveDueSoon: Story = {
  args: {
    type: 'paymentManagement',
    title: '2026-2 MT',
    dateBadgeLabel: 'D-14',
    dateBadgeStatus: 'positive',
    paidMemberCount: 15,
    totalMemberCount: 30,
    paidAmount: 600000,
    totalAmount: 900000,
    progressRatio: 15 / 30,
    fullWidth: true,
  },
};

export const ActiveDueWarning: Story = {
  args: {
    type: 'paymentManagement',
    title: '개강총회 뒷풀이',
    dateBadgeLabel: 'D-7',
    dateBadgeStatus: 'warning',
    paidMemberCount: 10,
    totalMemberCount: 20,
    paidAmount: 400000,
    totalAmount: 800000,
    progressRatio: 10 / 20,
    fullWidth: true,
  },
};

export const ActiveDueUrgent: Story = {
  args: {
    type: 'paymentManagement',
    title: '2026-2 MT',
    dateBadgeLabel: 'D-3',
    dateBadgeStatus: 'destructive',
    paidMemberCount: 25,
    totalMemberCount: 30,
    paidAmount: 1250000,
    totalAmount: 1500000,
    progressRatio: 25 / 30,
    fullWidth: true,
  },
};
