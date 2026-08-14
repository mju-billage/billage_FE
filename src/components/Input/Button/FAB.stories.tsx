import type { Meta, StoryObj } from '@storybook/react';
import FAB from './FAB';

const meta: Meta<typeof FAB> = {
  title: 'Input/Button/FAB',
  component: FAB,
};
export default meta;
type Story = StoryObj<typeof FAB>;

export const Default: Story = {
  args: { onPress: () => {} },
};

export const Extended: Story = {
  args: { onPress: () => {}, extended: true, label: '내역 추가' },
};
