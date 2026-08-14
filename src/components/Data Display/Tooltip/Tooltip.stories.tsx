import type { Meta, StoryObj } from '@storybook/react';
import { Image, View } from 'react-native';
import Tooltip from './Tooltip';

const BELL_ICON = require('../../../assets/icons/communication/Bell.png');

const meta: Meta<typeof Tooltip> = {
  title: 'Data Display/Tooltip/Tooltip',
  component: Tooltip,
  decorators: [
    Story => (
      <View style={{ paddingVertical: 120, paddingHorizontal: 220 }}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Top: Story = {
  args: {
    content: '텍스트',
    position: 'top',
    visible: true,
    children: <Image source={BELL_ICON} style={{ width: 22, height: 22 }} />,
  },
};

export const Bottom: Story = {
  args: {
    content: '텍스트',
    position: 'bottom',
    visible: true,
    children: <Image source={BELL_ICON} style={{ width: 22, height: 22 }} />,
  },
};

export const Left: Story = {
  args: {
    content: '텍스트',
    position: 'left',
    visible: true,
    children: <Image source={BELL_ICON} style={{ width: 22, height: 22 }} />,
  },
};

export const Right: Story = {
  args: {
    content: '텍스트',
    position: 'right',
    visible: true,
    children: <Image source={BELL_ICON} style={{ width: 22, height: 22 }} />,
  },
};
