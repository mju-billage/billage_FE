import type { Meta, StoryObj } from '@storybook/react';
import SegmentedControl from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Input/Control/SegmentedControl',
  component: SegmentedControl,
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  args: {
    options: [
      { label: '전체', value: 'all' },
      { label: '수입', value: 'income' },
      { label: '지출', value: 'expense' },
    ],
    value: 'all',
    onChange: () => {},
  },
};
