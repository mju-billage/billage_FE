import type { Meta, StoryObj } from '@storybook/react';
import MemberListItem from './MemberListItem';

const meta: Meta<typeof MemberListItem> = {
  title: 'Data Display/Lists/MemberListItem',
  component: MemberListItem,
};
export default meta;
type Story = StoryObj<typeof MemberListItem>;

export const Checked: Story = {
  args: { name: '강민수', amount: 20000, selected: true, onPress: () => {} },
};

export const Unchecked: Story = {
  args: { name: '이정현', amount: 20000, onPress: () => {} },
};

export const Disabled: Story = {
  args: { name: '봉서연', amount: 50000, disabled: true },
};
