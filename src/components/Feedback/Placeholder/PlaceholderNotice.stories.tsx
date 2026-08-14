import type { Meta, StoryObj } from '@storybook/react';
import PlaceholderNotice from './PlaceholderNotice';

const meta: Meta<typeof PlaceholderNotice> = {
  title: 'Feedback/Placeholder/PlaceholderNotice',
  component: PlaceholderNotice,
};
export default meta;
type Story = StoryObj<typeof PlaceholderNotice>;

export const Default: Story = {
  args: { title: '통계/분석' },
};
