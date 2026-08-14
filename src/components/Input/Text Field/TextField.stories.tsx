import type { Meta, StoryObj } from '@storybook/react';
import TextField from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Input/Text Field/TextField',
  component: TextField,
};
export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: '장부 이름',
    value: '',
    onChangeText: () => {},
    placeholder: '장부 이름을 입력해주세요.',
  },
};

export const WithHelper: Story = {
  args: {
    label: '장부 이름',
    value: '1학기 총무',
    onChangeText: () => {},
    placeholder: '장부 이름을 입력해주세요.',
    helperText: '* 최대 10자 이내로 입력할 수 있어요.',
  },
};

export const ErrorState: Story = {
  args: {
    label: '비밀번호',
    value: '1234',
    onChangeText: () => {},
    placeholder: '비밀번호',
    secureTextEntry: true,
    error: '비밀번호는 8자 이상이어야 해요.',
  },
};

export const Disabled: Story = {
  args: {
    label: '이메일',
    value: 'billage@example.com',
    onChangeText: () => {},
    placeholder: '이메일',
    disabled: true,
  },
};
