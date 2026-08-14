import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar/Avatar',
  component: Avatar,
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Icon: Story = {
  args: { type: 'icon' },
};

export const Initial: Story = {
  args: { type: 'initial', initial: '김' },
};

export const NeutralStyle: Story = {
  args: { type: 'initial', initial: 'S', style: 'neutral' },
};

export const Large: Story = {
  args: { type: 'initial', initial: '봉', size: 'lg' },
};

export const Small: Story = {
  args: { type: 'initial', initial: '이', size: 'sm' },
};
