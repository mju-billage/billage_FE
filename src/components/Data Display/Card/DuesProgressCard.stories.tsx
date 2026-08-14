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
