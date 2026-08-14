import type { Meta, StoryObj } from '@storybook/react';
import CheckListItem from './CheckListItem';

const meta: Meta<typeof CheckListItem> = {
  title: 'Data Display/Lists/CheckListItem',
  component: CheckListItem,
};
export default meta;
type Story = StoryObj<typeof CheckListItem>;

export const Unselected: Story = {
  args: { label: '1학기', onPress: () => {} },
};

export const Selected: Story = {
  args: { label: '동아리박람회', selected: true, onPress: () => {} },
};

export const Disabled: Story = {
  args: { label: '축제', disabled: true },
};
