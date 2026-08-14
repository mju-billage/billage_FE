import type { Meta, StoryObj } from '@storybook/react';
import SelectionListItem from './SelectionListItem';

const meta: Meta<typeof SelectionListItem> = {
  title: 'Data Display/Lists/SelectionListItem',
  component: SelectionListItem,
};
export default meta;
type Story = StoryObj<typeof SelectionListItem>;

export const Picker: Story = {
  args: {
    type: 'picker',
    title: '장부',
    value: '1학기',
    onPress: () => {},
  },
};

export const PickerRequired: Story = {
  args: {
    type: 'picker',
    title: '장부',
    required: true,
    value: '1학기',
    onPress: () => {},
  },
};

export const PickerDisabled: Story = {
  args: {
    type: 'picker',
    title: '장부',
    value: '1학기',
    disabled: true,
  },
};

export const PickerRequiredDisabled: Story = {
  args: {
    type: 'picker',
    title: '장부',
    required: true,
    value: '1학기',
    disabled: true,
  },
};

export const Switch: Story = {
  args: {
    type: 'switch',
    title: '알림 받기',
    subtitle: '새 내역 등록 시 알려드려요',
    value: true,
    onValueChange: () => {},
  },
};
