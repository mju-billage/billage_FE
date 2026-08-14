import type { Meta, StoryObj } from '@storybook/react';
import Accordion from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Data Display/Accordion/Accordion',
  component: Accordion,
};
export default meta;
type Story = StoryObj<typeof Accordion>;

const ITEMS = [
  '안녕하세요, 빌리지입니다.',
  '안녕하세요, 빌리지입니다.',
  '안녕하세요, 빌리지입니다.',
  '안녕하세요, 빌리지입니다.',
];

export const Closed: Story = {
  args: {
    title: '아코디언 타이틀',
    items: ITEMS,
  },
};

export const Open: Story = {
  args: {
    title: '아코디언 타이틀',
    defaultOpen: true,
    items: ITEMS,
  },
};
