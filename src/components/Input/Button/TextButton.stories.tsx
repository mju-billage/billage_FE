import type { Meta, StoryObj } from '@storybook/react';
import TextButton from './TextButton';

const PLUS_ICON = require('../../../assets/icons/action/Plus.png');

const meta: Meta<typeof TextButton> = {
  title: 'Input/Button/TextButton',
  component: TextButton,
};
export default meta;
type Story = StoryObj<typeof TextButton>;

export const Primary: Story = {
  args: { label: '더보기', onPress: () => {} },
};

export const Secondary: Story = {
  args: { label: '필터', hierarchy: 'secondary', onPress: () => {} },
};

export const Tertiary: Story = {
  args: { label: '초기화', hierarchy: 'tertiary', onPress: () => {} },
};

export const Negative: Story = {
  args: { label: '탈퇴하기', hierarchy: 'negative', onPress: () => {} },
};

export const WithIcon: Story = {
  args: {
    label: '추가하기',
    hierarchy: 'secondary',
    icon: PLUS_ICON,
    onPress: () => {},
  },
};
