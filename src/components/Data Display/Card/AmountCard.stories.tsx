import type { Meta, StoryObj } from '@storybook/react';
import AmountCard from './AmountCard';

const meta: Meta<typeof AmountCard> = {
  title: 'Data Display/Card/AmountCard',
  component: AmountCard,
};
export default meta;
type Story = StoryObj<typeof AmountCard>;

export const IncomeExpense: Story = {
  args: { type: 'incomeExpense', income: 510000, expense: 602000 },
};

export const Balance: Story = {
  args: { type: 'balance', startBalance: 1200000, endBalance: 1108000 },
};

export const Income: Story = {
  args: { type: 'income', income: 510000, incomeCount: 4 },
};

export const Expense: Story = {
  args: { type: 'expense', expense: 602000, expenseCount: 6 },
};
