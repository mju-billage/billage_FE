import type { Meta, StoryObj } from '@storybook/react';
import Thumbnail from './Thumbnail';

const meta: Meta<typeof Thumbnail> = {
  title: 'Data Display/Image Placeholder/Thumbnail',
  component: Thumbnail,
};
export default meta;
type Story = StoryObj<typeof Thumbnail>;

export const Empty: Story = {
  args: {},
};

export const Removable: Story = {
  args: { onRemove: () => {} },
};
