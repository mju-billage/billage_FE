import type { Meta, StoryObj } from '@storybook/react';
import Dialog from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Feedback/Dialogs/Dialog',
  component: Dialog,
};
export default meta;
type Story = StoryObj<typeof Dialog>;

export const WithDescription: Story = {
  args: {
    visible: true,
    title: '장부 이름 변경',
    description: '새로운 이름을 입력해주세요.',
    showTextField: true,
    textFieldValue: '',
    onChangeTextField: () => {},
    textFieldPlaceholder: '장부 이름을 입력해주세요.',
    confirmLabel: '변경',
    onCancel: () => {},
    onConfirm: () => {},
  },
};

export const WithTextField: Story = {
  args: {
    visible: true,
    title: '새 폴더 생성하기',
    showTextField: true,
    textFieldValue: '',
    onChangeTextField: () => {},
    textFieldPlaceholder: '폴더 이름을 입력해주세요.',
    confirmLabel: '생성',
    onCancel: () => {},
    onConfirm: () => {},
  },
};
