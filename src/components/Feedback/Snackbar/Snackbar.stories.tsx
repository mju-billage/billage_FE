import type { Meta, StoryObj } from '@storybook/react';
import Snackbar from './Snackbar';

const meta: Meta<typeof Snackbar> = {
  title: 'Feedback/Snackbar/Snackbar',
  component: Snackbar,
};
export default meta;
type Story = StoryObj<typeof Snackbar>;

export const TitleOnly: Story = {
  args: { visible: true, title: '폴더 이름이 변경되었어요.' },
};

export const TitleAndDescription: Story = {
  args: {
    visible: true,
    title: '모든 장부가 보관되었어요.',
    description: '보관된 내역은 자동 숨기기 되었습니다.',
  },
};

export const WithActionAndClose: Story = {
  args: {
    visible: true,
    title: '내역이 삭제되었어요.',
    actionLabel: '실행취소',
    onActionPress: () => {},
    onClose: () => {},
  },
};
