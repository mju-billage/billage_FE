import type { Meta, StoryObj } from '@storybook/react';
import CarouselIndicator from './CarouselIndicator';

const meta: Meta<typeof CarouselIndicator> = {
  title: 'Navigation/Carousel Indicator/CarouselIndicator',
  component: CarouselIndicator,
};
export default meta;
type Story = StoryObj<typeof CarouselIndicator>;

export const TwoPages: Story = {
  args: { count: 2, selectedIndex: 0 },
};

export const ThreePagesMiddleSelected: Story = {
  args: { count: 3, selectedIndex: 1 },
};
