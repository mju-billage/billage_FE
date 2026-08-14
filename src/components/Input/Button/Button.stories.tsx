import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const PLUS_ICON = require('../../../assets/icons/action/Plus.png');

const meta: Meta<typeof Button> = {
  title: 'Input/Button/Button',
  component: Button,
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { label: '확인', onPress: () => {} },
};

export const Secondary: Story = {
  args: { label: '기록보기', hierarchy: 'secondary', onPress: () => {} },
};

export const Tertiary: Story = {
  args: { label: '취소', hierarchy: 'tertiary', onPress: () => {} },
};

export const Negative: Story = {
  args: { label: '삭제', negative: true, onPress: () => {} },
};

export const Disabled: Story = {
  args: { label: '확인', disabled: true, onPress: () => {} },
};

export const WithIcon: Story = {
  args: { label: '추가', icon: PLUS_ICON, onPress: () => {} },
};

export const FullWidth: Story = {
  args: { label: '로그인하기', onPress: () => {}, fullWidth: true },
};

export const FullWidthSecondary: Story = {
  args: {
    label: '코드로 참여하기',
    hierarchy: 'secondary',
    onPress: () => {},
    fullWidth: true,
  },
};
