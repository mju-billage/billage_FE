import type { Meta, StoryObj } from '@storybook/react';
import Tabs from './Tabs';

const BILL_ICON = require('../../../assets/icons/content/Bill.png');

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs/Tabs',
  component: Tabs,
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const WithIcon: Story = {
  args: {
    items: [
      { label: '전체 내역', value: 'all', icon: BILL_ICON },
      { label: '수입', value: 'income', icon: BILL_ICON },
      { label: '지출', value: 'expense', icon: BILL_ICON },
    ],
    value: 'all',
    onChange: () => {},
  },
};

export const TextOnly: Story = {
  args: {
    items: [
      { label: '전체 내역', value: 'all' },
      { label: '수입', value: 'income' },
      { label: '지출', value: 'expense' },
    ],
    value: 'all',
    onChange: () => {},
    showIcon: false,
  },
};
