import type { Meta, StoryObj } from '@storybook/react';
import ImagePlaceholder from './ImagePlaceholder';

const meta: Meta<typeof ImagePlaceholder> = {
  title: 'Data Display/Image Placeholder/ImagePlaceholder',
  component: ImagePlaceholder,
};
export default meta;
type Story = StoryObj<typeof ImagePlaceholder>;

export const Square: Story = {
  args: { aspectRatio: '1:1', onPressOption: () => {} },
};

export const Portrait: Story = {
  args: { aspectRatio: '3:4', onPressOption: () => {} },
};

export const Tall: Story = {
  args: { aspectRatio: '9:16', onPressOption: () => {} },
};

export const NoOptionButton: Story = {
  args: { aspectRatio: '1:1', showOptionButton: false },
};
