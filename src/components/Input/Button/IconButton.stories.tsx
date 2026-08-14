import type { Meta, StoryObj } from '@storybook/react';
import IconButton from './IconButton';

const BELL_ICON = require('../../../assets/icons/communication/Bell.png');
const SEARCH_ICON = require('../../../assets/icons/system/Search.png');

const meta: Meta<typeof IconButton> = {
  title: 'Input/Button/IconButton',
  component: IconButton,
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: { icon: BELL_ICON, onPress: () => {} },
};

export const WithBadge: Story = {
  args: { icon: BELL_ICON, showPushBadge: true, onPress: () => {} },
};

export const Disabled: Story = {
  args: { icon: SEARCH_ICON, disabled: true, onPress: () => {} },
};
