import type { Meta, StoryObj } from '@storybook/react';
import BackButton from './BackButton';

const meta: Meta<typeof BackButton> = {
  title: 'Navigation/App bar/BackButton',
  component: BackButton,
};
export default meta;
type Story = StoryObj<typeof BackButton>;

export const Default: Story = {
  args: { onPress: () => {} },
};
