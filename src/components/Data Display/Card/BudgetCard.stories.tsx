import type { Meta, StoryObj } from '@storybook/react';
import BudgetCard from './BudgetCard';

const meta: Meta<typeof BudgetCard> = {
  title: 'Data Display/Card/BudgetCard',
  component: BudgetCard,
};
export default meta;
type Story = StoryObj<typeof BudgetCard>;

export const Default: Story = {
  args: { remainingBudget: 312000, expense: 590000, budget: 902000 },
};

export const Empty: Story = {
  args: { state: 'empty' },
};
