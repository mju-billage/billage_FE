import type { Meta, StoryObj } from '@storybook/react';
import TextArea from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Input/Text Field/TextArea',
  component: TextArea,
};
export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    value: '',
    onChangeText: () => {},
    placeholder: '메모를 입력해주세요.',
  },
};

export const WithValue: Story = {
  args: { value: 'MT 정산 관련 메모', onChangeText: () => {} },
};

export const Error: Story = {
  args: {
    value: '',
    onChangeText: () => {},
    error: '메모는 200자 이내로 입력해주세요.',
  },
};
