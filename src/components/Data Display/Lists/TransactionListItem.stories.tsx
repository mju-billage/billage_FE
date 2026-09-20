import type { Meta, StoryObj } from '@storybook/react';
import TransactionListItem from './TransactionListItem';

const meta: Meta<typeof TransactionListItem> = {
  title: 'Data Display/Lists/TransactionListItem',
  component: TransactionListItem,
};
export default meta;
type Story = StoryObj<typeof TransactionListItem>;

export const PendingIncome: Story = {
  args: {
    label: '1학기',
    itemName: '졸업생 후원금',
    amount: 300000,
    hasReceipt: false,
    isPendingApproval: true,
  },
};

export const PendingExpense: Story = {
  args: {
    label: '1학기',
    itemName: 'MT 렌트카 대여',
    amount: -150000,
    hasReceipt: false,
    isPendingApproval: true,
  },
};

export const ReceiptIncome: Story = {
  args: {
    label: '1학기',
    itemName: '졸업생 후원금',
    amount: 300000,
    hasReceipt: true,
    isPendingApproval: false,
  },
};

export const DefaultIncome: Story = {
  args: {
    label: '1학기',
    itemName: '3월 회비',
    amount: 300000,
  },
};

export const ReceiptExpense: Story = {
  args: {
    label: '1학기',
    itemName: 'MT 렌트카 대여',
    amount: -150000,
    hasReceipt: true,
    isPendingApproval: false,
  },
};
