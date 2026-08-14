import type { Meta, StoryObj } from '@storybook/react';
import BackupCard from './BackupCard';

const meta: Meta<typeof BackupCard> = {
  title: 'Data Display/Card/BackupCard',
  component: BackupCard,
};
export default meta;
type Story = StoryObj<typeof BackupCard>;

export const Default: Story = {
  args: {
    title: '1학기 백업',
    dateTimeLabel: '2026.07.01 · 14:22',
    capacityLabel: '장부 6개 · 내역 41건',
    onEditTitle: () => {},
    onDelete: () => {},
    onViewRecords: () => {},
  },
};
