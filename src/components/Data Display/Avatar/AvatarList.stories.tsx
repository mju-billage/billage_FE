import type { Meta, StoryObj } from '@storybook/react';
import AvatarList from './AvatarList';

const meta: Meta<typeof AvatarList> = {
  title: 'Data Display/Avatar/AvatarList',
  component: AvatarList,
};
export default meta;
type Story = StoryObj<typeof AvatarList>;

export const WithOverflow: Story = {
  args: {
    members: [
      { id: '1', name: '김시현' },
      { id: '2', name: '강민수' },
      { id: '3', name: '이정현' },
      { id: '4', name: '봉서연' },
      { id: '5', name: '박지민' },
    ],
    maxVisible: 3,
  },
};
