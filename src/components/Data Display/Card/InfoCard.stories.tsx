import type { Meta, StoryObj } from '@storybook/react';
import InfoCard from './InfoCard';

const meta: Meta<typeof InfoCard> = {
  title: 'Data Display/Card/InfoCard',
  component: InfoCard,
};
export default meta;
type Story = StoryObj<typeof InfoCard>;

export const Default: Story = {
  args: {
    fields: [
      { label: '담당자', value: '김시현', required: true },
      { label: '일자', value: '2026.04.16', required: true },
    ],
    tags: ['회식', 'MT'],
    onRemoveTag: () => {},
    onAddTag: () => {},
    memo: '고기, 술, 음료 등',
  },
};

export const EmptyMemo: Story = {
  args: {
    fields: [{ label: '담당자', value: '김시현', required: true }],
    memo: '',
  },
};
