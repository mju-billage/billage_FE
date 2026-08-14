import type { Meta, StoryObj } from '@storybook/react';
import FilterChip from './FilterChip';

const meta: Meta<typeof FilterChip> = {
  title: 'Input/Filter/FilterChip',
  component: FilterChip,
};
export default meta;
type Story = StoryObj<typeof FilterChip>;

export const Inactive: Story = {
  args: { label: '수입', onPress: () => {} },
};

export const Active: Story = {
  args: { label: '지출', active: true, onPress: () => {} },
};
