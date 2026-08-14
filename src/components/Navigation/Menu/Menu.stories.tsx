import type { Meta, StoryObj } from '@storybook/react';
import Menu from './Menu';

const ICON = require('../../../assets/icons/action/Edit.png');

const meta: Meta<typeof Menu> = {
  title: 'Navigation/Menu/Menu',
  component: Menu,
};
export default meta;
type Story = StoryObj<typeof Menu>;

export const Grouped: Story = {
  args: {
    sections: [
      [
        { key: 'a', label: '텍스트', icon: ICON },
        { key: 'b', label: '텍스트', icon: ICON },
      ],
      [
        { key: 'c', label: '텍스트', icon: ICON },
        { key: 'd', label: '텍스트', icon: ICON },
        { key: 'e', label: '텍스트', icon: ICON },
      ],
      [{ key: 'f', label: '텍스트', icon: ICON }],
    ],
    onSelect: () => {},
  },
};
