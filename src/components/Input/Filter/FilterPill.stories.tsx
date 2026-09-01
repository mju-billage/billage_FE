import type { Meta, StoryObj } from '@storybook/react';
import FilterPill from './FilterPill';

const meta: Meta<typeof FilterPill> = {
  title: 'Input/Filter/FilterPill',
  component: FilterPill,
};
export default meta;
type Story = StoryObj<typeof FilterPill>;

export const Inactive: Story = {
  args: { label: '1개월', active: false, onPress: () => {} },
};

export const Active: Story = {
  args: { label: '1개월', active: true, onPress: () => {} },
};
