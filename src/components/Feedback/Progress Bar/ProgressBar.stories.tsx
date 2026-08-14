import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Feedback/Progress Bar/ProgressBar',
  component: ProgressBar,
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const RoundWithLabel: Story = {
  args: { progress: 0.65, showLabel: true },
};

export const Square: Story = {
  args: { progress: 0.4, style: 'square' },
};
