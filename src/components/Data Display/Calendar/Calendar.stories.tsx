import type { Meta, StoryObj } from '@storybook/react';
import Calendar from './Calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Data Display/Calendar/Calendar',
  component: Calendar,
};
export default meta;
type Story = StoryObj<typeof Calendar>;

export const RangeSelected: Story = {
  args: {
    year: 2026,
    month: 4,
    selectedStartDate: '2026.04.14',
    selectedEndDate: '2026.04.18',
    onSelectDate: () => {},
    onChangeMonth: () => {},
  },
};

export const Empty: Story = {
  args: {
    year: 2026,
    month: 4,
    onSelectDate: () => {},
    onChangeMonth: () => {},
  },
};

export const SingleDateSelected: Story = {
  args: {
    year: 2026,
    month: 4,
    selectedStartDate: '2026.04.14',
    onSelectDate: () => {},
    onChangeMonth: () => {},
  },
};

export const DisabledAndOutlined: Story = {
  args: {
    year: 2026,
    month: 4,
    selectedStartDate: '2026.04.14',
    selectedEndDate: '2026.04.18',
    disabledDates: ['2026.04.02', '2026.04.03', '2026.04.04'],
    outlinedDates: ['2026.04.09'],
    onSelectDate: () => {},
    onChangeMonth: () => {},
  },
};
