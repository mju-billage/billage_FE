import type { Meta, StoryObj } from '@storybook/react';
import ToolsMenu from './ToolsMenu';

const BILL_ICON = require('../../../assets/icons/content/Bill.png');
const GRID_ICON = require('../../../assets/icons/system/Grid.png');

const meta: Meta<typeof ToolsMenu> = {
  title: 'Navigation/Menu/ToolsMenu',
  component: ToolsMenu,
};
export default meta;
type Story = StoryObj<typeof ToolsMenu>;

export const IconType: Story = {
  args: {
    sections: [
      {
        title: '모임 관리',
        items: [
          {
            key: 'members',
            itemType: 'icon',
            icon: GRID_ICON,
            label: '모임원 관리',
            onPress: () => {},
          },
          {
            key: 'report',
            itemType: 'icon',
            icon: BILL_ICON,
            label: '보고서',
            onPress: () => {},
          },
        ],
      },
    ],
  },
};

export const AvatarTypeWithTag: Story = {
  args: {
    sections: [
      {
        title: '리스트 타이틀',
        items: [
          {
            key: 'kim',
            itemType: 'avatar',
            label: '김시현',
            tag: '총무',
            onPress: () => {},
          },
          {
            key: 'notification',
            itemType: 'avatar',
            label: '강민수',
            tag: '모임원',
            onPress: () => {},
          },
        ],
      },
    ],
    selectedKey: 'kim',
  },
};
