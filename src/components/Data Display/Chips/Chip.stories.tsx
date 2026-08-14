import type { Meta, StoryObj } from '@storybook/react';
import Chip from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Data Display/Chips/Chip',
  component: Chip,
};
export default meta;
type Story = StoryObj<typeof Chip>;

export const Removable: Story = {
  args: { label: '간식비', onRemove: () => {} },
};

export const NotRemovable: Story = {
  args: { label: '회식', removable: false },
};
