import type { Meta, StoryObj } from '@storybook/react';
import SearchField from './SearchField';

const meta: Meta<typeof SearchField> = {
  title: 'Input/Search/SearchField',
  component: SearchField,
};
export default meta;
type Story = StoryObj<typeof SearchField>;

export const Large: Story = {
  args: { value: '', onChangeText: () => {}, placeholder: '검색어를 입력해주세요.' },
};

export const Small: Story = {
  args: { value: '', onChangeText: () => {}, size: 'sm' },
};

export const Outline: Story = {
  args: { value: '1학기', onChangeText: () => {}, variant: 'outline' },
};

export const Filled: Story = {
  args: { value: '텍스트', onChangeText: () => {} },
};
