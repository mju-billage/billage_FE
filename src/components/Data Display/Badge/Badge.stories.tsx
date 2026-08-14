import type { Meta, StoryObj } from '@storybook/react';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Data Display/Badge/Badge',
  component: Badge,
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Positive: Story = {
  args: { label: '완료', status: 'positive' },
};

export const Warning: Story = {
  args: { label: '승인대기', status: 'warning' },
};

export const Destructive: Story = {
  args: { label: 'D-6', status: 'destructive' },
};

export const Neutral: Story = {
  args: { label: '총무', status: 'neutral' },
};

export const WithIcon: Story = {
  args: {
    label: '완료',
    status: 'positive',
    icon: require('../../../assets/icons/action/Check.png'),
  },
};
