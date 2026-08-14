import type { Meta, StoryObj } from '@storybook/react';
import Divider from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Data Display/Divider/Divider',
  component: Divider,
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const FullWidth: Story = {
  args: {},
};

export const Thick: Story = {
  args: { variant: 'thick' },
};

export const Inset: Story = {
  args: { variant: 'inset' },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};
