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
